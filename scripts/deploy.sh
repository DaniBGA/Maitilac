#!/usr/bin/env bash
# Publicación del sitio en el VPS, desde esta computadora (docs/GUIA DE DEPLOY.md).
#
#   ./scripts/deploy.sh                      actualizar el sitio con el código de esta carpeta
#   ./scripts/deploy.sh primera-vez          primera puesta en marcha en el VPS
#   ./scripts/deploy.sh volver               volver a la versión anterior
#   ./scripts/deploy.sh usuario <email> "<Nombre>"   crear un usuario del gestor (o cambiarle la contraseña)
#   ./scripts/deploy.sh copia                copia de seguridad ahora y bajarla a copias-servidor/
#   ./scripts/deploy.sh estado               cómo está el servidor
#
# Opciones de "actualizar" y "primera-vez":
#   --sin-verificar     no corre lint, tipos ni tests antes de publicar
#   --tests-visuales    corre también los tests visuales (tardan unos minutos; necesitan la base local)
#   --si                no pregunta si hay cambios sin commitear
#
# La configuración va en deploy.env (en la raíz del proyecto; ver deploy.env.example).
# Con DEPLOY_CONFIG=<archivo> se usa otro (por ejemplo, para un servidor de prueba).
# Las variables de los comandos remotos se expanden acá, a propósito.
# shellcheck disable=SC2029
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
cd "$RAIZ"

# ---------- Mensajes ----------
if [ -t 1 ]; then V=$'\e[32m'; A=$'\e[33m'; R=$'\e[31m'; N=$'\e[1m'; X=$'\e[0m'; else V="" A="" R="" N="" X=""; fi
paso() { echo; echo "${N}▶ $*${X}"; }
ok() { echo "${V}✓ $*${X}"; }
aviso() { echo "${A}! $*${X}"; }
error() { echo "${R}✗ $*${X}" >&2; exit 1; }

uso() { sed -n '2,17p' "$0" | sed 's/^# \{0,1\}//'; }
case "${1:-}" in -h | --help | ayuda) uso; exit 0 ;; esac

# ---------- Configuración ----------
CONFIG="${DEPLOY_CONFIG:-deploy.env}"
[ -f "$CONFIG" ] || error "Falta $CONFIG. Copiá deploy.env.example a deploy.env y completalo."
# shellcheck source=/dev/null
. "$CONFIG"
: "${VPS:?Falta VPS en deploy.env (ej: deploy@203.0.113.10)}"
: "${SITIO_URL:?Falta SITIO_URL en deploy.env (ej: https://nuevo.ejemplo.com)}"
DIR_REMOTO="${DIR_REMOTO:-/srv/maitilac}"
SSH_OPCIONES="${SSH_OPCIONES:-}"
CURL_OPCIONES="${CURL_OPCIONES:-}"
SITIO_URL="${SITIO_URL%/}"
DOMINIO="${SITIO_URL#*://}"; DOMINIO="${DOMINIO%%/*}"; DOMINIO="${DOMINIO%%:*}"

# shellcheck disable=SC2086
remoto() { ssh $SSH_OPCIONES "$VPS" "cd '$DIR_REMOTO' && $1"; }

# ---------- Pasos ----------
probar_conexion() {
  paso "Conexión con el servidor ($VPS)"
  # shellcheck disable=SC2086
  ssh $SSH_OPCIONES -o BatchMode=yes -o ConnectTimeout=10 "$VPS" true \
    || error "No se pudo entrar por SSH a $VPS. Revisá la IP, el usuario y la clave (docs/GUIA DE DEPLOY.md, paso 2)."
  # shellcheck disable=SC2086
  ssh $SSH_OPCIONES "$VPS" "docker compose version >/dev/null" \
    || error "En el servidor no anda 'docker compose' para este usuario (¿está en el grupo docker?)."
  ok "Conectado"
}

verificar_codigo() {
  local opciones=" $* "
  if [[ "$opciones" != *" --si "* ]] && [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    aviso "Hay cambios sin commitear: se van a publicar igual."
    read -r -p "¿Seguir? (s/N) " r; [ "$r" = "s" ] || error "Cancelado."
  fi
  if [[ "$opciones" == *" --sin-verificar "* ]]; then aviso "Sin verificar el código (--sin-verificar)."; return; fi
  paso "Verificando el código (lint, tipos, tests)"
  pnpm lint >/dev/null || error "pnpm lint encontró problemas. Corré 'pnpm lint' para verlos."
  pnpm exec tsc --noEmit || error "Hay errores de tipos."
  pnpm test >/dev/null || error "Fallaron los tests unitarios. Corré 'pnpm test' para verlos."
  if [[ "$opciones" == *" --tests-visuales "* ]]; then
    pnpm test:visual || error "Fallaron los tests visuales. Informe: pnpm exec playwright show-report"
  fi
  ok "Código verificado"
}

compilar_imagen() {
  local cambios=""; [ -z "$(git status --porcelain 2>/dev/null)" ] || cambios="-con-cambios"
  ETIQUETA="maitilac:$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo sin-git)$cambios"
  paso "Compilando la imagen $ETIQUETA"
  docker build --quiet --build-arg "SITIO_URL=$SITIO_URL" -t "$ETIQUETA" . >/dev/null || error "Falló la compilación de la imagen."
  ok "Imagen lista"
}

copiar_archivos() {
  paso "Copiando la configuración del servidor (docker-compose, Caddyfile, scripts)"
  # shellcheck disable=SC2086
  scp -q $SSH_OPCIONES infra/docker-compose.yml infra/Caddyfile infra/backup.sh infra/restaurar.sh "$VPS:$DIR_REMOTO/"
  remoto "chmod +x backup.sh restaurar.sh"
  ok "Archivos al día (el .env del servidor no se toca)"
}

copia_previa() {
  if remoto "docker compose ps --status running --services 2>/dev/null | grep -qx db"; then
    paso "Copia de seguridad antes de actualizar"
    remoto "./backup.sh" | tail -1
  fi
}

subir_imagen() {
  paso "Subiendo la imagen al servidor (unos 110 MB)"
  local medidor=cat; command -v pv >/dev/null && medidor="pv -N imagen"
  # shellcheck disable=SC2086
  docker save "$ETIQUETA" | gzip -1 | $medidor | ssh $SSH_OPCIONES "$VPS" "gunzip | docker load >/dev/null" \
    || error "Falló la subida de la imagen."
  ok "Imagen subida"
}

activar() { # $1 = imagen
  remoto "(grep -q '^IMAGEN=' .env && sed -i 's|^IMAGEN=.*|IMAGEN=$1|' .env || echo 'IMAGEN=$1' >> .env) && docker compose up -d --remove-orphans"
}

imagen_actual() { remoto "grep '^IMAGEN=' .env 2>/dev/null | cut -d= -f2" || true; }

# Una página con error igual responde 200 (Next manda la estructura antes de armar el
# contenido): se comprueba que cada página traiga su <main> y ninguna marca de error.
paginas_bien() {
  local par ruta id cuerpo
  for par in "/|page-home" "/nosotros|page-nosotros" "/catalogo|page-catalogo" "/locales|page-locales" "/contacto|page-contacto"; do
    ruta="${par%%|*}"; id="${par#*|}"
    # shellcheck disable=SC2086
    cuerpo="$(curl -fsS $CURL_OPCIONES --max-time 20 "$SITIO_URL$ruta" 2>/dev/null)" || return 1
    [[ "$cuerpo" == *"id=\"$id\""* && "$cuerpo" != *"data-dgst="* ]] || return 1
  done
}

comprobar() {
  paso "Comprobando que el sitio responda ($SITIO_URL)"
  local arranco=""
  # Hasta 90 s para arrancar (migraciones y, la primera vez, el certificado HTTPS)...
  for _ in $(seq 1 45); do
    # shellcheck disable=SC2086
    if curl -fsS $CURL_OPCIONES -o /dev/null --max-time 10 "$SITIO_URL/api/auth/ok" 2>/dev/null; then arranco=si; break; fi
    sleep 2
  done
  [ -n "$arranco" ] || return 1
  # ...y, ya arrancado, unos segundos para que las páginas se armen bien: si no, se vuelve atrás enseguida.
  for _ in $(seq 1 5); do
    if paginas_bien; then
      ok "El sitio responde y las 5 páginas se arman bien"
      return 0
    fi
    sleep 2
  done
  return 1
}

limpiar_imagenes() {
  # Se guardan las 3 publicaciones más nuevas y, siempre, la actual y la anterior (para poder volver).
  remoto "actual=\$(grep '^IMAGEN=' .env | cut -d= -f2); anterior=\$(cat .imagen-anterior 2>/dev/null || true); \
    docker image ls maitilac --format 'maitilac:{{.Tag}}' | grep -E '^maitilac:[0-9]{8}-' | sort -r | tail -n +4 \
    | grep -v -x -F -e \"\$actual\" -e \"\${anterior:-ninguna}\" | xargs -r docker rmi >/dev/null 2>&1 || true"
}

publicar() { # $@ = opciones
  local inicio=$SECONDS anterior
  probar_conexion
  remoto "test -f .env" || error "En el servidor falta $DIR_REMOTO/.env. ¿Hiciste './scripts/deploy.sh primera-vez'?"
  verificar_codigo "$@"
  compilar_imagen
  copiar_archivos
  copia_previa
  subir_imagen
  anterior="$(imagen_actual)"
  paso "Activando la versión nueva (las migraciones corren solas al arrancar)"
  [ -n "$anterior" ] && remoto "echo '$anterior' > .imagen-anterior"
  activar "$ETIQUETA"
  if ! comprobar; then
    aviso "El sitio no responde con la versión nueva. Registro del sitio:"
    remoto "docker compose logs --tail=30 app" || true
    if [ -n "$anterior" ]; then
      paso "Volviendo a la versión anterior ($anterior)"
      activar "$anterior"
      if comprobar; then
        aviso "Se volvió a la versión anterior: el sitio sigue como estaba."
      else
        aviso "Tampoco responde la versión anterior: revisar con './scripts/deploy.sh estado'."
      fi
    fi
    error "No se publicó la versión nueva."
  fi
  limpiar_imagenes
  echo
  ok "${N}Publicado: $ETIQUETA en $SITIO_URL ($(( SECONDS - inicio )) s)${X}"
}

# ---------- Comandos ----------
comando="${1:-actualizar}"; [[ "$comando" == --* ]] && comando=actualizar || shift || true

case "$comando" in
  actualizar)
    publicar "$@"
    ;;

  primera-vez)
    probar_conexion
    remoto "true" 2>/dev/null || {
      # shellcheck disable=SC2086
      ssh $SSH_OPCIONES "$VPS" "mkdir -p '$DIR_REMOTO'" \
        || error "No se pudo crear $DIR_REMOTO. En el servidor: sudo mkdir -p $DIR_REMOTO && sudo chown \$USER: $DIR_REMOTO"
    }
    if ! remoto "test -f .env"; then
      paso "Creando el .env del servidor (con secretos nuevos)"
      # shellcheck disable=SC2086
      sed -e "s|^DOMINIO=.*|DOMINIO=$DOMINIO|" \
        -e "s|^SITIO_URL=.*|SITIO_URL=$SITIO_URL|" \
        -e "s|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL=$SITIO_URL|" \
        -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -hex 32)|" \
        -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 32)|" \
        infra/.env.produccion.example | ssh $SSH_OPCIONES "$VPS" "umask 077 && cat > '$DIR_REMOTO/.env'"
      ok ".env creado en $DIR_REMOTO (permisos 600). Los secretos quedan sólo en el servidor."
    else
      ok "El servidor ya tiene .env: no se toca."
    fi
    publicar "$@"
    paso "Datos de fábrica"
    if remoto "docker compose exec -T app node herramientas/importar.mjs" | tail -2; then
      remoto "docker compose restart app >/dev/null 2>&1"; comprobar || true
      ok "Datos cargados"
    else
      ok "La base ya tenía datos: no se tocaron."
    fi
    paso "Copias de seguridad automáticas (todos los días a las 3:00)"
    remoto "mkdir -p copias && (crontab -l 2>/dev/null | grep -v '$DIR_REMOTO/backup.sh'; echo '0 3 * * * $DIR_REMOTO/backup.sh >> $DIR_REMOTO/copias/backup.log 2>&1') | crontab -"
    ok "Programadas en el cron del servidor"
    echo
    echo "Falta crear los usuarios del gestor:  ./scripts/deploy.sh usuario persona@ejemplo.com \"Nombre Apellido\""
    ;;

  volver)
    probar_conexion
    anterior="$(remoto "cat .imagen-anterior 2>/dev/null" || true)"
    [ -n "$anterior" ] || error "No hay una versión anterior registrada."
    actual="$(imagen_actual)"
    paso "Volviendo de $actual a $anterior"
    remoto "echo '$actual' > .imagen-anterior"
    activar "$anterior"
    comprobar || error "El sitio no responde. Revisar con './scripts/deploy.sh estado'."
    ok "Listo. Para deshacer, './scripts/deploy.sh volver' otra vez."
    ;;

  usuario)
    email="${1:-}"; nombre="${2:-}"
    [[ "$email" == *@* ]] || error 'Uso: ./scripts/deploy.sh usuario <email> "<Nombre>"'
    # -t: la herramienta pide la contraseña por teclado
    # shellcheck disable=SC2086
    ssh -t $SSH_OPCIONES "$VPS" "cd '$DIR_REMOTO' && docker compose exec app node herramientas/crear-usuario.mjs '$email' '${nombre//\'/}'"
    ;;

  copia)
    probar_conexion
    paso "Copia de seguridad en el servidor"
    remoto "./backup.sh" | tail -1
    fecha="$(date +%F)"
    mkdir -p copias-servidor
    # shellcheck disable=SC2086
    scp -q $SSH_OPCIONES "$VPS:$DIR_REMOTO/copias/diarias/base-$fecha.dump" "$VPS:$DIR_REMOTO/copias/diarias/fotos-$fecha.tar.gz" copias-servidor/
    ok "Bajada a copias-servidor/: base-$fecha.dump y fotos-$fecha.tar.gz"
    ;;

  estado)
    probar_conexion
    paso "Servicios"
    remoto "docker compose ps --format 'table {{.Service}}\t{{.Status}}'"
    paso "Versión"
    echo "actual:   $(imagen_actual)"
    echo "anterior: $(remoto "cat .imagen-anterior 2>/dev/null" || echo '-')"
    paso "Última copia de seguridad"
    remoto "ls -1t copias/diarias/base-*.dump 2>/dev/null | head -1 | xargs -r basename || true"
    remoto "tail -1 copias/backup.log 2>/dev/null || echo '(la automática todavía no corrió)'"
    paso "Disco"
    remoto "df -h / | tail -1"
    paso "Últimas líneas del registro del sitio"
    remoto "docker compose logs --tail=15 app"
    ;;

  *)
    uso
    exit 1
    ;;
esac
