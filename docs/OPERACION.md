# Operación del sitio en el VPS

Referencia técnica de lo que corre en el VPS de Hostinger: qué hay, cómo se respalda, cómo se restaura y cómo se mantiene. **Para publicar y actualizar, seguí [GUIA DE DEPLOY.md](GUIA%20DE%20DEPLOY.md)** (todo se hace con `scripts/deploy.sh`). Para trabajar en local, el [README](../README.md).

> Todo esto se probó en local con el mismo `docker-compose.yml`, `Caddyfile` y scripts, y `deploy.sh` contra un servidor Ubuntu 24.04 de prueba. Falta repasarlo en el VPS real.

---

## Qué hay en el servidor

```
Internet ──► Caddy (80/443, HTTPS automático) ──► app (Next.js, puerto 3000 interno) ──► db (PostgreSQL 17)
                 └── /fotos/* directo del volumen de fotos
```

| Servicio | Imagen | Datos que guarda (volumen) |
|---|---|---|
| `caddy` | `caddy:2-alpine` | Certificados (`caddy-datos`). Lee las fotos (`fotos`, sólo lectura) |
| `app` | la del sitio (la sube `scripts/deploy.sh`) | Fotos subidas desde el gestor (`fotos`) y caché de imágenes optimizadas (`cache-next`) |
| `db` | `postgres:17-alpine` | La base (`datos`) |

Sólo Caddy publica puertos. Ni la base ni el sitio se pueden alcanzar desde afuera.

Al arrancar, `app` aplica las migraciones pendientes y después levanta el sitio. La imagen trae además dos herramientas:

| Herramienta | Para qué |
|---|---|
| `node herramientas/importar.mjs` | Carga los datos de fábrica (sólo con la base vacía; `--forzar` borra todo y reimporta) |
| `node herramientas/crear-usuario.mjs <email> "<Nombre>"` | Crea un usuario del gestor o le cambia la contraseña |
| `node herramientas/calentar.mjs` | Genera las versiones optimizadas de todas las fotos (lo corre `deploy.sh` después de publicar) |

### Archivos en `/srv/maitilac/`

| Archivo | De dónde sale |
|---|---|
| `docker-compose.yml`, `Caddyfile`, `backup.sh`, `restaurar.sh` | copiados de `infra/` por `deploy.sh` en cada publicación (no editarlos en el servidor: se pisan) |
| `.env` (permisos `600`) | lo crea `deploy.sh primera-vez` a partir de `infra/.env.produccion.example`, con secretos nuevos. **No borrarlo nunca** (tiene la contraseña de la base) |
| `.imagen-anterior` | la versión anterior, para `deploy.sh volver` |
| `copias/` | la crea `backup.sh` |

---

## Publicar y actualizar

Con `scripts/deploy.sh`, desde la computadora: [GUIA DE DEPLOY.md](GUIA%20DE%20DEPLOY.md). Lo que hace en el servidor, por si hiciera falta a mano:

1. Copia los archivos de `infra/` a `/srv/maitilac/`.
2. Corre `./backup.sh` (si la base está levantada).
3. Carga la imagen nueva (`docker save | ssh … docker load`) con una etiqueta `maitilac:<fecha>-<commit>`.
4. Guarda la versión actual en `.imagen-anterior`, escribe la nueva en `IMAGEN=` del `.env` y corre `docker compose up -d`.
5. Comprueba `/api/auth/ok` y que las 5 páginas traigan su `<main>` sin marcas de error. Si no, vuelve a la imagen anterior.

Para volver a mano: poner en `IMAGEN=` del `.env` la etiqueta anterior (`docker image ls maitilac`) y `docker compose up -d`.

---

## Usuarios del gestor

No hay registro público. Para crear un usuario, o ponerle una contraseña nueva si se la olvidó, desde la computadora:

```bash
./scripts/deploy.sh usuario persona@ejemplo.com "Nombre Apellido"
```

(En el servidor es `docker compose exec app node herramientas/crear-usuario.mjs persona@ejemplo.com "Nombre Apellido"`.)

Pide la contraseña dos veces (mínimo 10 caracteres). Hay que pasársela a la persona por un canal seguro y nunca por el mismo mail del usuario.

---

## Copias de seguridad

- **Qué se guarda:** la base completa (`base-AAAA-MM-DD.dump`) y las fotos subidas desde el gestor (`fotos-AAAA-MM-DD.tar.gz`). Las fotos de fábrica vienen dentro de la imagen.
- **Cuándo:** todos los días a las 3:00 (cron). Se guardan las 7 últimas en `copias/diarias/` y, de los domingos, las 4 últimas en `copias/semanales/`.
- **Registro:** `copias/backup.log`, una línea por copia.
- **A mano:** `/srv/maitilac/backup.sh`.
- **Antes de cada actualización**, `deploy.sh` hace una copia más.
- **Llevarse una copia a la computadora** (conviene hacerlo de vez en cuando, porque las copias viven en el mismo VPS): `./scripts/deploy.sh copia` (queda en `copias-servidor/`). Las semanales: `scp -r deploy@<ip>:/srv/maitilac/copias/semanales ./copias-maitilac`.
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

## Pasar al dominio definitivo

Pasos en [GUIA DE DEPLOY.md](GUIA%20DE%20DEPLOY.md#pasar-al-dominio-definitivo): DNS, las tres direcciones del `.env` del servidor, la redirección en `infra/Caddyfile` (en el repo, porque `deploy.sh` lo copia en cada publicación), `SITIO_URL` en `deploy.env` y publicar.

---

## Mantenimiento

| Para | Comando (en `/srv/maitilac`) |
|---|---|
| Ver si está todo levantado | `docker compose ps` |
| Ver los registros del sitio | `docker compose logs -f app` (de Caddy: `logs -f caddy`) |
| Reiniciar el sitio | `docker compose restart app` |
| Actualizar Caddy y PostgreSQL (parches) | `docker compose pull caddy db && docker compose up -d` |
| Espacio en disco | `df -h` y `docker system df` |
| Limpiar imágenes viejas | `deploy.sh` ya guarda sólo las últimas; para el resto: `docker system prune -f` |

Después de reiniciar `app`, Caddy puede responder 502 durante unos segundos, hasta que el sitio termina de arrancar.

La caché de imágenes optimizadas (`cache-next`) sobrevive a los deploys. La primera vez que alguien pide una foto en un tamaño nuevo tarda cerca de 1 segundo en generarse; después sale de la caché.

---

## Notas técnicas

- **Fotos optimizadas por adelantado.** El optimizador de Next genera cada versión de una foto (AVIF o WebP, de cada ancho) la primera vez que alguien la pide, y un AVIF tarda 1-2 s. Para que ningún visitante espere, `deploy.sh` corre `herramientas/calentar.mjs` en segundo plano después de cada publicación (recorre las páginas del sitemap y pide todas las fotos), y el gestor hace lo mismo después de cambiar fotos. El resultado queda en `docker compose logs app` ("Imágenes listas: …"). A mano: `docker compose exec app node herramientas/calentar.mjs`.
- **Versiones de seguridad** (23/10/2026): Next 16.4.2 y React 19.2.9 (avisos del 14/10/2026: ejecución remota con `use cache` y con el optimizador de imágenes, y DoS con Server Actions), sharp 0.35.5 y Node 24.22.1 en la imagen (arreglos del 21/10/2026). La versión de Node está fijada en el `Dockerfile`: para el próximo arreglo de seguridad, cambiarla ahí.
- El parche que había sobre Next 16.3.6 (`patches/next.patch`: fotos que quedaban colgadas si el navegador cortaba la conexión) se sacó: Next 16.4 trae el mismo arreglo.
- **Variables al compilar:** `SITIO_URL` se usa al compilar (robots.txt y metadatos; `deploy.sh` la toma de `deploy.env`) y al ejecutar (del `.env` del VPS). Las demás son sólo de ejecución. La imagen no lleva ningún secreto.
- **GitHub Actions:** `.github/workflows/ci.yml` verifica cada cambio si el código está en GitHub. El deploy se hace con `deploy.sh`.
- **HTTP/3:** Caddy lo ofrece por 443/udp (está publicado en el `docker-compose.yml`).
