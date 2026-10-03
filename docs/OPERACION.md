# Operación del sitio en el VPS

Cómo se pone en marcha, se actualiza, se respalda y se restaura el sitio en el VPS de Hostinger. Para trabajar en local, ver el [README](../README.md); para el orden de los pasos y el estado, [PASO A PASO.md](PASO%20A%20PASO.md) (Etapa 4).

> Todo lo de este documento se probó en local con el mismo `docker-compose.yml`, `Caddyfile` y scripts. Lo único que falta probar es lo que depende del VPS, el dominio y GitHub (marcado con ⏳).

---

## Qué hay en el servidor

```
Internet ──► Caddy (80/443, HTTPS automático) ──► app (Next.js, puerto 3000 interno) ──► db (PostgreSQL 17)
                 └── /fotos/* directo del volumen de fotos
```

| Servicio | Imagen | Datos que guarda (volumen) |
|---|---|---|
| `caddy` | `caddy:2-alpine` | Certificados (`caddy-datos`). Lee las fotos (`fotos`, sólo lectura) |
| `app` | la del sitio, desde GHCR | Fotos subidas desde el gestor (`fotos`) y caché de imágenes optimizadas (`cache-next`) |
| `db` | `postgres:17-alpine` | La base (`datos`) |

Sólo Caddy publica puertos. Ni la base ni el sitio se pueden alcanzar desde afuera.

Al arrancar, `app` aplica las migraciones pendientes y después levanta el sitio. La imagen trae además dos herramientas:

| Herramienta | Para qué |
|---|---|
| `node herramientas/importar.mjs` | Carga los datos de fábrica (sólo con la base vacía; `--forzar` borra todo y reimporta) |
| `node herramientas/crear-usuario.mjs <email> "<Nombre>"` | Crea un usuario del gestor o le cambia la contraseña |

### Archivos en `/srv/maitilac/`

| Archivo | De dónde sale |
|---|---|
| `docker-compose.yml` | `infra/docker-compose.yml` del repo |
| `Caddyfile` | `infra/Caddyfile` |
| `backup.sh` y `restaurar.sh` | `infra/` |
| `.env` (permisos `600`) | se arma a partir de `infra/.env.produccion.example` |
| `copias/` | la crea `backup.sh` |

---

## Puesta en marcha (una sola vez) ⏳

1. **Preparar el VPS:** Paso 4.1 de la guía (usuario `deploy`, SSH sólo con clave, firewall, Docker).
2. **DNS:** registro `A` de `nuevo.<dominio>` a la IP del VPS. Comprobar con `dig +short nuevo.<dominio>`.
3. **Copiar los archivos** desde la carpeta del repo:
   ```bash
   ssh deploy@<ip> 'sudo mkdir -p /srv/maitilac && sudo chown deploy: /srv/maitilac'
   scp infra/docker-compose.yml infra/Caddyfile infra/backup.sh infra/restaurar.sh deploy@<ip>:/srv/maitilac/
   scp infra/.env.produccion.example deploy@<ip>:/srv/maitilac/.env
   ```
4. **Completar el `.env`** en el VPS (`nano /srv/maitilac/.env`, después `chmod 600 .env`):
   - `DOMINIO`, `SITIO_URL` y `BETTER_AUTH_URL` con `nuevo.<dominio>`.
   - `BETTER_AUTH_SECRET` y `POSTGRES_PASSWORD`: uno distinto cada uno, con `openssl rand -hex 32`.
   - `IMAGEN`: `ghcr.io/<usuario>/<repo>:latest`.
5. **Acceso a la imagen:** en GitHub, un token *classic* con permiso `read:packages` únicamente. En el VPS:
   ```bash
   docker login ghcr.io -u <usuario-de-github>    # pide el token
   ```
6. **GitHub** (Settings → Secrets and variables → Actions):
   - Variable `SITIO_URL`: `https://nuevo.<dominio>`.
   - Secretos `VPS_HOST` (IP), `VPS_USER` (`deploy`), `VPS_SSH_KEY` y `VPS_KNOWN_HOSTS` (salida de `ssh-keyscan <ip>`).
   - `VPS_SSH_KEY` es una clave nueva, sólo para el deploy: `ssh-keygen -t ed25519 -f deploy-maitilac -N ""`. La pública (`deploy-maitilac.pub`) va al final de `/home/deploy/.ssh/authorized_keys` del VPS; la privada, al secreto.
   - Crear el entorno `produccion` (Settings → Environments).
7. **Primer deploy:** hacer push a `main` (o correr *Deploy* a mano desde la pestaña Actions). Cuando termine:
   ```bash
   cd /srv/maitilac
   docker compose up -d                                   # la primera vez levanta los tres servicios
   docker compose exec app node herramientas/importar.mjs # datos de fábrica
   ```
8. **Usuarios del gestor:** ver [Usuarios del gestor](#usuarios-del-gestor).
9. **Copias automáticas:** `crontab -e` (como `deploy`) y agregar:
   ```
   0 3 * * * /srv/maitilac/backup.sh >> /srv/maitilac/copias/backup.log 2>&1
   ```
   Activar también los snapshots semanales en el panel de Hostinger.
10. **Comprobar:** `https://nuevo.<dominio>` abre con candado; desde la carpeta del repo, `PRUEBA_URL=https://nuevo.<dominio> pnpm test:visual` tiene que dar todo en verde (corre sólo las páginas públicas, sin tocar datos).

---

## Actualizar el sitio

**Automático:** cada push a `main` corre la CI y, si pasa, *Deploy* publica la imagen nueva y la levanta en el VPS. Las migraciones corren solas al arrancar.

**A mano**, en el VPS:
```bash
cd /srv/maitilac
docker compose pull app && docker compose up -d app
```

**Volver a una versión anterior:** cada imagen queda publicada también con el commit (`ghcr.io/<usuario>/<repo>:<sha>`). En el `.env`, cambiar `IMAGEN` a esa etiqueta y `docker compose up -d app`. Ojo: si la versión nueva traía una migración, la base ya quedó migrada. Las migraciones de este proyecto sólo agregan cosas, salvo `0003_fotos_sin_variantes`, que sacó columnas sin uso.

---

## Usuarios del gestor

No hay registro público. Para crear un usuario, o ponerle una contraseña nueva si se la olvidó:

```bash
cd /srv/maitilac
docker compose exec app node herramientas/crear-usuario.mjs persona@ejemplo.com "Nombre Apellido"
```

Pide la contraseña dos veces (mínimo 10 caracteres). Hay que pasársela a la persona por un canal seguro y nunca por el mismo mail del usuario.

---

## Copias de seguridad

- **Qué se guarda:** la base completa (`base-AAAA-MM-DD.dump`) y las fotos subidas desde el gestor (`fotos-AAAA-MM-DD.tar.gz`). Las fotos de fábrica vienen dentro de la imagen.
- **Cuándo:** todos los días a las 3:00 (cron). Se guardan las 7 últimas en `copias/diarias/` y, de los domingos, las 4 últimas en `copias/semanales/`.
- **Registro:** `copias/backup.log`, una línea por copia.
- **A mano:** `/srv/maitilac/backup.sh`.
- **Llevarse una copia a la computadora** (conviene hacerlo de vez en cuando, porque las copias viven en el mismo VPS):
  ```bash
  scp -r deploy@<ip>:/srv/maitilac/copias/semanales ./copias-maitilac
  ```
- Además, el botón **Exportar** del gestor descarga un JSON con todos los datos (sin fotos).

### Restaurar

```bash
cd /srv/maitilac
./restaurar.sh copias/diarias/base-2026-10-03.dump copias/diarias/fotos-2026-10-03.tar.gz
```

Pide confirmación (escribir `si`), detiene el sitio, reemplaza la base y las fotos, y lo vuelve a levantar. El archivo de fotos es opcional: sin él, sólo se restaura la base. Los usuarios del gestor están en la base, así que vuelven con ella.

**Restaurar en la computadora** (para revisar una copia sin tocar el servidor): con la base local levantada (`pnpm db:levantar`),
```bash
docker compose -f infra/docker-compose.dev.yml exec -T db pg_restore -U maitilac -d maitilac --clean --if-exists --no-owner < base-AAAA-MM-DD.dump
```
y reiniciar `pnpm dev` (la caché tiene los datos anteriores).

---

## Pasar al dominio definitivo ⏳

1. DNS: registro `A` del dominio (y `www`, si se usa) a la IP del VPS.
2. En el `.env` del VPS: `DOMINIO`, `SITIO_URL` y `BETTER_AUTH_URL` con el dominio definitivo.
3. En GitHub: la variable `SITIO_URL` con el dominio definitivo, y volver a correr *Deploy* (la dirección se usa al compilar).
4. Para que `nuevo.<dominio>` (y `www`, si corresponde) lleve al definitivo, agregar al final del `Caddyfile`:
   ```
   nuevo.<dominio>, www.<dominio> {
   	redir https://<dominio>{uri} permanent
   }
   ```
5. `docker compose up -d` (Caddy pide el certificado nuevo solo).

Las sesiones abiertas en el gestor se pierden con el cambio de dirección: hay que volver a ingresar.

---

## Mantenimiento

| Para | Comando (en `/srv/maitilac`) |
|---|---|
| Ver si está todo levantado | `docker compose ps` |
| Ver los registros del sitio | `docker compose logs -f app` (de Caddy: `logs -f caddy`) |
| Reiniciar el sitio | `docker compose restart app` |
| Actualizar Caddy y PostgreSQL (parches) | `docker compose pull caddy db && docker compose up -d` |
| Espacio en disco | `df -h` y `docker system df` |
| Limpiar imágenes viejas | `docker image prune -f` (el deploy ya lo hace) |

Después de reiniciar `app`, Caddy puede responder 502 durante unos segundos, hasta que el sitio termina de arrancar.

La caché de imágenes optimizadas (`cache-next`) sobrevive a los deploys. La primera vez que alguien pide una foto en un tamaño nuevo tarda cerca de 1 segundo en generarse; después sale de la caché.

---

## Notas técnicas

- **Parche sobre Next** (`patches/next.patch`, lo aplica `pnpm install`). En Next 16.3.6, si el navegador cortaba la conexión mientras el optimizador leía la foto original (por ejemplo, alguien que cambia de página rápido), esa foto quedaba colgada para todos hasta reiniciar el sitio. El parche hace que esa lectura interna no dependa de la conexión del navegador. Al actualizar Next: revisar si se corrigió (se reproduce con la prueba de la Etapa 4 en la guía) y, si es así, sacar el parche. Si el parche deja de aplicar, `pnpm install` falla y avisa.
- **Variables al compilar:** `SITIO_URL` se usa al compilar (robots.txt y metadatos) y al ejecutar. Las demás son sólo de ejecución y van en el `.env` del VPS. La imagen no lleva ningún secreto.
- **HTTP/3:** Caddy lo ofrece por 443/udp (está publicado en el `docker-compose.yml`).
