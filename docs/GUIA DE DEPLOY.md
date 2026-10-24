# Guía de deploy — paso a paso

Cómo publicar el sitio en el VPS de Hostinger la primera vez y cómo actualizarlo después. Todo se hace desde tu computadora, con el script `scripts/deploy.sh`.

> El script se probó de punta a punta contra un servidor Ubuntu 24.04 de prueba: primera puesta en marcha, actualizaciones, vuelta atrás, copias y una versión rota a propósito (la detectó y volvió sola a la anterior).

---

## Qué necesitás

- El **VPS KVM 2** de Hostinger.
- El **dominio**, con acceso a su DNS. Para la revisión del cliente se usa un subdominio: `nuevo.<dominio>`. Si todavía no está, se puede publicar sin él (paso 3, "Todavía sin dominio").
- En tu computadora: el proyecto (con `pnpm install` hecho), **Node 24 o superior**, **Docker**, **pnpm** y una **clave SSH**. Para ver si ya tenés una: `ls ~/.ssh/id_ed25519.pub`. Si no existe, se crea con `ssh-keygen -t ed25519`.

En los comandos de abajo, reemplazá `<ip>` por la IP del VPS y `<dominio>` por el dominio, **sin los signos `< >`**: `ssh deploy@<ip>` se escribe, por ejemplo, `ssh deploy@203.0.113.10`.

---

## 1. Instalar el sistema en el VPS

En el panel de Hostinger (hPanel → VPS):

1. Sistema operativo: **Ubuntu 24.04** (el "plain", sin paneles).
2. En **Claves SSH**, agregá tu clave pública: pegá el contenido de `~/.ssh/id_ed25519.pub`.
3. Anotá la **IP** del VPS.

## 2. Asegurar el servidor (una sola vez)

Entrá como root:

```bash
ssh root@<ip>
```

Y ejecutá, en orden:

```bash
# Usuario para trabajar (sin ser root) con tu misma clave SSH
adduser deploy                      # pide una contraseña: guardala, es para sudo
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Actualizaciones de seguridad automáticas y bloqueo de intentos de acceso
apt update && apt upgrade -y
apt install -y fail2ban unattended-upgrades

# Firewall: sólo SSH y web
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw allow 443/udp
ufw enable                          # responder "y"

# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy

# Carpeta del sitio
mkdir -p /srv/maitilac && chown deploy:deploy /srv/maitilac
```

**Antes de cerrar la sesión de root**, abrí **otra terminal en tu computadora** (no en el servidor: ahí no está tu clave) y comprobá que entrás con el usuario nuevo:

```bash
ssh deploy@<ip>
docker ps                           # tiene que responder sin error (una tabla vacía está bien)
```

Si entra, volvé a la terminal de root y desactivá el acceso como root y con contraseña:

```bash
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/; s/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh
exit
```

Comprobá: `ssh root@<ip>` tiene que ser rechazado y `ssh deploy@<ip>` tiene que entrar.

> Si alguna vez quedás afuera, en hPanel está la **consola del navegador** para entrar sin SSH.

## 3. DNS

`maitilac.com` se administra en Squarespace: *Domains → maitilac.com → DNS*. **Los registros del correo (`MX`, los `TXT` y el `CNAME` de Google) no se tocan nunca.**

Hay dos maneras. Elegí una:

**a) Directo en el dominio** (el sitio nuevo reemplaza enseguida al que se ve hoy en `maitilac.com`):

1. Si hay una sección **"Valores predeterminados de Squarespace"** (o registros `A`, `AAAA` o `CNAME` de `@` o `www` que apunten a Squarespace u otro hosting), borrá **sólo esos**.
2. En *Registros personalizados → Agregar registro*:

   | Tipo | Nombre | Datos |
   |---|---|---|
   | `A` | `@` | `<ip>` |
   | `A` | `www` | `<ip>` |

   `www.maitilac.com` redirige solo a `maitilac.com` (está en `infra/Caddyfile`).
3. En `deploy.env` (paso 4): `SITIO_URL=https://maitilac.com`.

**b) Con un subdominio de prueba**, para que el cliente revise antes de reemplazar el sitio actual: un registro `A` con nombre `nuevo` y datos `<ip>`, y `SITIO_URL=https://nuevo.maitilac.com`. Cuando lo apruebe, se pasa al dominio con [Pasar al dominio definitivo](#pasar-al-dominio-definitivo).

Comprobá desde tu computadora, porque puede tardar unos minutos o, a veces, unas horas:

```bash
dig +short maitilac.com             # (o nuevo.maitilac.com) tiene que mostrar sólo la IP del VPS
dig +short www.maitilac.com         # en la opción a), también
```

**No sigas hasta que muestre la IP** (y sólo esa: si aparece otra más, quedó un registro viejo). Si no, el certificado HTTPS no se puede emitir.

### Todavía sin dominio

Se puede publicar igual, con HTTPS, usando la IP dentro de un nombre de [sslip.io](https://sslip.io): un servicio público que responde con la IP que lleva escrita. Para la IP `203.0.113.10` el nombre es `203-0-113-10.sslip.io` (los puntos de la IP, con guiones). No hay que configurar nada: saltá este paso y en el paso 4 poné `SITIO_URL=https://203-0-113-10.sslip.io`. Caddy saca el certificado solo, como con un dominio propio.

- Comprobá antes que resuelva: `dig +short <ip-con-guiones>.sslip.io` tiene que mostrar la IP del VPS.
- Si Let's Encrypt no da el certificado (lo dice `docker compose logs caddy`), probá con `nip.io` en lugar de `sslip.io`: son el mismo servicio.
- Cuando esté el dominio, se pasa con [Pasar al dominio definitivo](#pasar-al-dominio-definitivo), igual que desde `nuevo.<dominio>`.

## 4. Configurar el script

`scripts/deploy.sh` se puede correr de dos maneras. Elegí una:

| | **A. En el VPS** | **B. Desde tu computadora** |
|---|---|---|
| Dónde está el código | clonado en el VPS, se actualiza con `git pull` | tu carpeta del proyecto |
| Dónde se compila la imagen | en el VPS (unos minutos; el sitio sigue andando) | en tu computadora, y se sube por SSH (unos 110 MB) |
| Qué hace falta | sólo git y Docker (ya están en el VPS) | Node 24+, pnpm, Docker y la clave SSH |
| Verificación antes de publicar | lint y tests, en GitHub (CI) con cada push; tipos, al compilar | lint, tipos y tests en tu computadora |

### A. En el VPS

Conectado como `deploy` (en el VPS **no** hace falta instalar Node ni pnpm: todo se compila dentro de Docker):

```bash
ssh deploy@<ip>
git clone https://github.com/DaniBGA/Maitilac.git
cd Maitilac
cp deploy.env.example deploy.env
nano deploy.env
```

En `deploy.env`:

```bash
VPS=local
SITIO_URL=https://nuevo.<dominio>
```

`VPS=local` le dice al script que ya está en el servidor: no usa SSH ni sube la imagen. Los comandos de los pasos siguientes (`./scripts/deploy.sh …`) se corren ahí, dentro de `~/Maitilac`.

### B. Desde tu computadora

En la carpeta del proyecto (si es una computadora sin el proyecto: `git clone https://github.com/DaniBGA/Maitilac.git`, `cd Maitilac` y `pnpm install`):

```bash
cp deploy.env.example deploy.env
```

Y completá `deploy.env`:

```bash
VPS=deploy@<ip>
SITIO_URL=https://nuevo.<dominio>
```

En las dos maneras, `deploy.env` no se sube al repo.

## 5. Primera publicación

```bash
./scripts/deploy.sh primera-vez
```

Hace todo esto solo (tarda unos minutos, la primera vez un poco más):

1. Comprueba que puede entrar al VPS (o, en el VPS, que Docker anda).
2. Crea `/srv/maitilac/.env` en el servidor, con contraseñas nuevas generadas al azar. Quedan **sólo en el servidor**.
3. Verifica el código (lint, tipos, tests unitarios). En el VPS no: avisa y sigue (lo verifica GitHub).
4. Arma la imagen del sitio y, desde la computadora, la sube al VPS (unos 110 MB).
5. Levanta el sitio, la base de datos y Caddy, que pide el certificado HTTPS solo.
6. Carga los datos de fábrica (productos, premios, locales…).
7. Comprueba que el sitio responda y que las 5 páginas se armen bien.
8. Empieza a generar las fotos optimizadas, en segundo plano (unos minutos).
9. Programa la copia de seguridad diaria (3:00).

Después creá los usuarios del gestor, uno por persona:

```bash
./scripts/deploy.sh usuario persona@ejemplo.com "Nombre Apellido"
```

La contraseña se escribe dos veces y no se ve en pantalla. Pasásela a la persona por un canal seguro.

## 6. Comprobar

- Abrí `https://nuevo.<dominio>`: tiene que abrir con el candado.
- Entrá a `https://nuevo.<dominio>/gestor` con un usuario y probá cambiar algo.
- Opcional, desde la carpeta del proyecto, los tests visuales contra el servidor (sólo las páginas públicas, sin tocar datos):
  ```bash
  PRUEBA_URL=https://nuevo.<dominio> pnpm test:visual
  ```
  Ojo: si ya editaste algo en el gestor, las páginas cambian y los tests lo marcan. Conviene correrlos antes de tocar nada.

## 7. Snapshots de Hostinger

En hPanel → VPS → **Snapshots y copias de seguridad**: activar las copias semanales. Son una red extra, aparte de las copias diarias del sitio.

---

## Cada actualización

1. Hacé los cambios y probalos en local (`pnpm dev`, `pnpm test:visual`).
2. Commiteá.
3. Publicá:
   - **A. En el VPS:** subí los cambios (`git push`) y mirá en la pestaña *Actions* del repo que pasen `pnpm lint`, `tsc` y `pnpm test`. *(Mientras el cliente no apruebe las capturas nuevas, el paso de los tests visuales falla en las páginas que él pidió cambiar: es lo esperado.)* Después, en el VPS:
     ```bash
     ssh deploy@<ip>
     cd ~/Maitilac && git pull && ./scripts/deploy.sh
     ```
   - **B. Desde tu computadora:**
     ```bash
     ./scripts/deploy.sh
     ```

El script hace siempre lo mismo y te muestra cada paso:

| Paso | Qué hace |
|---|---|
| Verificar | lint, tipos y tests unitarios. Si algo falla, **no publica** |
| Compilar | arma la imagen. Si falla, **no publica** |
| Configuración | copia `docker-compose.yml`, `Caddyfile` y los scripts del servidor (el `.env` del servidor no se toca) |
| Copia previa | hace una copia de seguridad antes de cambiar nada |
| Subir y activar | sube la imagen y la levanta. Las migraciones de la base corren solas |
| Comprobar | espera a que arranque y revisa que las 5 páginas se armen bien |
| Si algo falla | **vuelve sola a la versión anterior** y te muestra el error |
| Limpiar | borra imágenes viejas del servidor (guarda las 3 últimas, la actual y la anterior) |

Si pasa todo, termina con `✓ Publicado: …`. Tarda alrededor de un minuto.

Opciones:

| Opción | Para qué |
|---|---|
| `--tests-visuales` | corre también los tests visuales antes de publicar (unos minutos) |
| `--sin-verificar` | publica sin verificar (sólo si ya verificaste a mano) |
| `--si` | no pregunta si hay cambios sin commitear |

Si hay cambios sin commitear, el script avisa y pregunta. Se pueden publicar igual, pero conviene commitear antes, así cada versión publicada corresponde a un commit (la etiqueta de la imagen lleva el commit).

### Volver a la versión anterior

Si después de publicar algo no te convence:

```bash
./scripts/deploy.sh volver
```

Vuelve a la versión anterior en segundos. Repetirlo deshace la vuelta.

> Ojo con las migraciones: si la versión nueva traía un cambio en la base, la base ya quedó migrada y no vuelve atrás. Mientras las migraciones sólo agreguen cosas (tablas, columnas, índices), la versión anterior sigue funcionando; si algún día una borra o renombra columnas, antes de volver hay que restaurar la copia previa.

### Ver cómo está el servidor

```bash
./scripts/deploy.sh estado
```

Muestra los servicios, la versión actual y la anterior, la última copia, el disco libre y las últimas líneas del registro del sitio.

---

## Copias de seguridad

- **Automáticas:** todos los días a las 3:00, en el servidor (`/srv/maitilac/copias/`): las 7 últimas diarias y 4 semanales. Además, una antes de cada actualización.
- **Bajarte una a tu computadora**, conviene hacerlo de vez en cuando porque las copias viven en el mismo VPS:
  ```bash
  ./scripts/deploy.sh copia           # queda en copias-servidor/ (no se sube al repo)
  ```
- **Restaurar** (reemplaza los datos actuales del sitio):
  ```bash
  ssh deploy@<ip>
  cd /srv/maitilac
  ls copias/diarias                   # elegir la fecha
  ./restaurar.sh copias/diarias/base-AAAA-MM-DD.dump copias/diarias/fotos-AAAA-MM-DD.tar.gz
  ```

Más detalle en [OPERACION.md](OPERACION.md).

---

## Pasar al dominio definitivo

Cuando el cliente apruebe `nuevo.<dominio>`:

1. **DNS:** registro `A` de `<dominio>` (y de `www`, si se usa) a la IP del VPS. Esperar a que `dig +short <dominio>` muestre la IP.
2. **En el servidor**, editá el `.env` y cambiá las tres direcciones:
   ```bash
   ssh deploy@<ip>
   nano /srv/maitilac/.env             # DOMINIO=<dominio>, SITIO_URL y BETTER_AUTH_URL=https://<dominio>
   ```
3. **En el repo**, agregá al final de `infra/Caddyfile` la redirección desde la dirección de prueba, y commiteá (la de `www` ya está):
   ```
   nuevo.<dominio> {
   	redir https://<dominio>{uri} permanent
   }
   ```
4. **En `deploy.env`**: `SITIO_URL=https://<dominio>`.
5. Publicá: `./scripts/deploy.sh`.

Las sesiones abiertas del gestor se pierden con el cambio de dirección: hay que volver a ingresar.

---

## Problemas frecuentes

**"No se pudo entrar por SSH"**
Probá a mano `ssh deploy@<ip>`. Si pide contraseña o rechaza la clave, falta copiar la clave al usuario `deploy` (paso 2, la línea de `rsync`). Si usás otra clave u otro puerto, agregalos en `deploy.env` con `SSH_OPCIONES="-i ~/.ssh/otra_clave -o Port=2222"`.

**"En el servidor no anda 'docker compose' para este usuario"**
El usuario `deploy` no está en el grupo `docker`, o todavía no salió y volvió a entrar después de agregarlo. En el VPS: `sudo usermod -aG docker deploy`, y volver a conectarse.

**La primera vez, "El sitio no responde"**
Casi siempre es el certificado: el DNS todavía no apunta al VPS, o los puertos 80 y 443 están cerrados. Revisá `dig +short nuevo.<dominio>` y `sudo ufw status`. Los mensajes de Caddy: `ssh deploy@<ip> 'cd /srv/maitilac && docker compose logs caddy | tail -30'`.

**En una actualización, "El sitio no responde con la versión nueva"**
El script ya volvió a la versión anterior (lo dice) y muestra el error del sitio. Corregilo en local y volvé a publicar.

**"Falta /srv/maitilac/.env"**
Todavía no se hizo `./scripts/deploy.sh primera-vez`.

**Alguien se olvidó la contraseña del gestor**
`./scripts/deploy.sh usuario su@email.com "Nombre"` le pone una nueva (el usuario ya existe, sólo cambia la contraseña).

**Disco lleno**
`./scripts/deploy.sh estado` muestra el espacio libre. Para liberar: `ssh deploy@<ip> 'docker system prune -f'`.

> ⚠️ **Nunca borres `/srv/maitilac/.env` del servidor.** Tiene la contraseña de la base: si se pierde, el sitio no puede conectarse a sus datos. Si lo editás, hacé antes una copia (`cp .env .env.respaldo`).

---

## Resumen de comandos

| Comando | Para qué |
|---|---|
| `./scripts/deploy.sh primera-vez` | Primera puesta en marcha |
| `./scripts/deploy.sh` | Publicar una actualización |
| `./scripts/deploy.sh volver` | Volver a la versión anterior |
| `./scripts/deploy.sh usuario <email> "<Nombre>"` | Crear un usuario del gestor o cambiarle la contraseña |
| `./scripts/deploy.sh copia` | Copia de seguridad ahora y bajarla a tu computadora |
| `./scripts/deploy.sh estado` | Cómo está el servidor |
