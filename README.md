# Sitio Maitilac

Sitio web de Maitilac (quesos artesanales de Tandil), en migración desde un único `index.html` a **Next.js 16 + React 19 + Tailwind 4 + PostgreSQL**, con un gestor con login. Se va a publicar en un VPS de Hostinger.

- **Plan** (qué se construye y por qué): [docs/PLAN DE REFACTORIZACION.md](docs/PLAN%20DE%20REFACTORIZACION.md)
- **Paso a paso** (cómo, en qué orden y estado actual): [docs/PASO A PASO.md](docs/PASO%20A%20PASO.md)

> **Estado:** las 5 páginas públicas (Inicio, Nosotros, Catálogo con detalle de producto, Locales y Contacto) se ven igual que el sitio viejo y leen los datos de PostgreSQL. El gestor (con login) guarda en la base y los cambios se ven al instante. Falta: calidad y SEO (Etapa 6) y el servidor (Etapa 4, al final).

---

## Requisitos

| Herramienta | Versión | Cómo verificar |
|---|---|---|
| Node.js | 24 LTS o superior | `node -v` |
| pnpm | 10 o superior | `pnpm -v` |
| git | cualquiera reciente | `git --version` |
| Docker | con Compose v2 | `docker compose version` |

- **pnpm:** `npm i -g pnpm`. Desde Node 25 ya no viene *corepack*, así que `corepack enable` no funciona.
- **Node con nvm** (recomendado): `nvm install 24 && nvm use 24`.
- **Python 3** no es obligatorio. Sólo sirve como alternativa para ver el sitio viejo (ver [Problemas frecuentes](#problemas-frecuentes)).
- **Docker** (con Docker Compose): para la base de datos PostgreSQL.

---

## Primera vez

```bash
git clone <url-del-repo> maitilac
cd maitilac
pnpm install
pnpm exec playwright install chromium   # navegador para los tests visuales

cp .env.example .env    # después completar los dos valores vacíos (ver abajo)
pnpm db:levantar        # PostgreSQL en Docker (puerto 5440)
pnpm db:migrar          # crea las tablas
pnpm db:importar        # carga los datos de fábrica del sitio viejo
pnpm gestor:usuario prueba@maitilac.local "Usuario de prueba"   # usuario para entrar al gestor
```

En `.env` hay que completar dos valores:

| Variable | Qué poner |
|---|---|
| `BETTER_AUTH_SECRET` | Un secreto al azar: `openssl rand -hex 32` |
| `GESTOR_PRUEBA_CLAVE` | La contraseña del usuario de prueba (mínimo 10 caracteres). Es la misma que pide `pnpm gestor:usuario`, y la usan los tests para iniciar sesión |

El resto ya viene listo para trabajar en local (`SITIO_URL`, la dirección pública del sitio, en local es `http://localhost:3000`). `.env` no se sube al repo.

La base queda guardada en un volumen de Docker: la próxima vez alcanza con `pnpm db:levantar` (si la máquina se reinició) y `pnpm dev`.

---

## Levantar el sitio

```bash
pnpm dev
```

Abrir **http://localhost:3000**. Los cambios se ven al guardar, sin recargar.

| Página | URL |
|---|---|
| Inicio | http://localhost:3000/ |
| Nosotros | http://localhost:3000/nosotros |
| Catálogo | http://localhost:3000/catalogo |
| Detalle de producto | http://localhost:3000/catalogo/gouda |
| Locales | http://localhost:3000/locales |
| Contacto | http://localhost:3000/contacto |
| Gestor | http://localhost:3000/gestor (pide iniciar sesión) |

### Versión de producción, en local

```bash
pnpm build
pnpm start      # http://localhost:3000
```

---

## Gestor

Entrar en **http://localhost:3000/gestor** con el email y la contraseña de un usuario del gestor. Lo que se guarda ahí se ve al instante en el sitio. Cómo se usa cada bloque: [docs/MANUAL DEL GESTOR.md](docs/MANUAL%20DEL%20GESTOR.md).

**Usuarios:** no hay registro público. Se crean (o se les cambia la contraseña) con:

```bash
pnpm gestor:usuario <email> "<Nombre>"
```

Pide la contraseña dos veces (mínimo 10 caracteres).

**Fotos subidas:** se reducen a 1000 px y se guardan en la carpeta de `FOTOS_DIR` (por defecto `./subidas`, fuera de git). Si se borra esa carpeta, las fotos subidas desde el gestor dejan de verse. Las fotos originales del sitio están en `public/img/`.

**Copia de seguridad:** el botón "Exportar" del gestor descarga un JSON con todos los datos de la base (sin las fotos subidas).

---

## Ver el sitio viejo (referencia)

`referencia/` es una copia congelada del sitio original (09/09/2026). El sitio nuevo tiene que verse **idéntico** a esa copia. **No se edita.**

```bash
pnpm ref:servir
```

Abrir **http://localhost:4500**. En el sitio viejo las secciones van con `#`: `/#nosotros`, `/#catalogo`, `/#locales`, `/#contacto` y `/#gestor`.

Para comparar a ojo, conviene tener los dos sitios abiertos lado a lado: `pnpm dev` en una terminal y `pnpm ref:servir` en otra.

---

## Tests visuales: controlar que el diseño quede igual

Playwright saca capturas del sitio viejo y del nuevo en tres anchos (escritorio 1440 px, tablet 1024 px y celular 390 px) y las compara píxel por píxel. También compara el texto visible de cada página.

```bash
pnpm test:visual
```

Levanta `pnpm dev` solo si no está corriendo. Antes de empezar **reimporta los datos de fábrica** (borra lo que se haya editado en el gestor de la base local) y crea el usuario de prueba de `.env`. Al final corren los tests funcionales del gestor, que editan, comprueban el cambio en el sitio y dejan todo como estaba.

Para ver las diferencias marcadas en rojo:

```bash
pnpm exec playwright show-report
```

### Correr una parte

```bash
pnpm test:visual layout.spec.ts          # sólo header, menú y footers
pnpm test:visual -g "página inicio"      # sólo una página
pnpm test:visual --project=celular       # sólo un ancho: escritorio | tablet | celular
```

### Regenerar las capturas de referencia

```bash
pnpm ref:capturar
```

Saca las capturas **desde `referencia/`** (el sitio viejo) y las guarda en `tests/visual/__referencia__/`. Sólo hace falta si se agrega un test nuevo o se cambia cómo se captura algo.

> ⚠️ **Nunca** se generan referencias desde el sitio nuevo para "hacer pasar" un test. Si una diferencia es intencional, se anota en la tabla *Diferencias visuales aprobadas* de [docs/PASO A PASO.md](docs/PASO%20A%20PASO.md).

> Hoy **tiene que pasar toda la suite**. Si falla el test "sin errores en consola", hay que arreglar el error de la página, no el test.

---

## Todos los comandos

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Sitio nuevo en modo desarrollo (http://localhost:3000) |
| `pnpm build` | Compila para producción |
| `pnpm start` | Sirve la compilación de producción (http://localhost:3000) |
| `pnpm lint` | Revisa el código con ESLint |
| `pnpm format` | Formatea el código con Prettier |
| `pnpm ref:servir` | Sitio viejo de referencia (http://localhost:4500) |
| `pnpm ref:capturar` | Genera las capturas de referencia desde el sitio viejo |
| `pnpm test:visual` | Compara el sitio nuevo contra las capturas de referencia |
| `pnpm datos:extraer` | Vuelve a extraer los datos del sitio viejo (`content/` y `db/importar/data/`) |
| `pnpm db:levantar` | Levanta PostgreSQL en Docker (puerto 5440) |
| `pnpm db:migrar` | Aplica las migraciones pendientes |
| `pnpm db:importar` | Carga los datos de fábrica (sólo con la base vacía; `--forzar` borra todo y reimporta) |
| `pnpm db:generar` | Genera una migración nueva después de cambiar `db/schema.ts` |
| `pnpm db:estudio` | Abre Drizzle Studio para ver y editar la base en el navegador |
| `pnpm gestor:usuario <email> "<Nombre>"` | Crea un usuario del gestor o le cambia la contraseña |

Chequeo de tipos: `pnpm exec tsc --noEmit`.

---

## Estructura

```
app/                  Rutas de Next.js
  (sitio)/            Páginas públicas y el gestor (layout con el header)
  api/                Login (Better Auth) y copia de seguridad
  globals.css         Capas CSS, Tailwind sin preflight, fuentes y tokens
components/sitio/     Componentes del sitio público
components/gestor/    Bloques del gestor
lib/                  Acceso a datos (con caché), login, utilidades, horarios, WhatsApp
lib/gestor/           Server Actions del gestor, sesión y subida de fotos
db/                   Esquema, migraciones e importación de datos (Drizzle + PostgreSQL)
content/              Textos fijos: historia, proceso, Instagram (versionados en git)
infra/                Docker Compose (por ahora, la base local)
styles/
  sitio/              CSS del sitio viejo, portado textual (no redondear valores)
  en-linea/           Lo que en el sitio viejo eran atributos style=""
public/               Fuentes, imágenes y foto del hero
tests/visual/         Tests visuales y capturas de referencia
referencia/           Sitio viejo congelado. NO EDITAR
docs/                 Plan, paso a paso, registro de cambios, manual del gestor
_fuentes/             Material original del cliente (no se publica)
subidas/              Fotos subidas desde el gestor (no se sube al repo)
```

---

## Problemas frecuentes

**`pnpm: orden no encontrada`**
Instalarlo con `npm i -g pnpm`. Con Node 25 o superior no existe `corepack`.

**Los tests quedan colgados sin mostrar nada**
Seguramente quedó un servidor viejo ocupando el puerto 4500 o el 3000, de una corrida cortada a la mitad. Liberarlos y volver a correr:
```bash
ss -ltnp | grep -E ':3000|:4500'   # ver quién los ocupa
fuser -k 3000/tcp 4500/tcp         # cerrarlos
```

**`pnpm ref:servir` levanta en otro puerto** (dice "Accepting connections at http://localhost:XXXXX")
El 4500 está ocupado: ver el punto anterior. Alternativa sin `serve`:
```bash
python3 -m http.server 4500 --bind 127.0.0.1 -d referencia
```

**Falla la instalación del navegador de Playwright en Linux**
En distribuciones que Playwright no soporta oficialmente, descarga una versión alternativa y funciona igual. Si faltan dependencias del sistema: `sudo pnpm exec playwright install-deps chromium`.

**Un test visual falla por pocos píxeles al cambiar de máquina**
Las capturas dependen del sistema operativo (renderizado de fuentes). Las referencias actuales se generaron en Linux: si se trabaja en otro sistema, regenerarlas localmente con `pnpm ref:capturar` **sin subirlas al repo**, o correr los tests en Linux (en CI van a correr en Linux).

**`pnpm dev` muestra un error de conexión a la base (ECONNREFUSED)**
PostgreSQL no está levantado: `pnpm db:levantar`. Verificar con `docker compose -f infra/docker-compose.dev.yml ps` que diga *healthy*.

**Cambié algo directo en la base y la página no lo muestra**
Es la caché: los datos se guardan hasta que el gestor los invalide al guardar. En desarrollo, reiniciar `pnpm dev` la vacía. Lo mismo después de `pnpm db:importar`.

**Los tests del catálogo fallan con `pnpm dev` abierto**
Si se editaron datos en el gestor, la caché del `pnpm dev` abierto los conserva aunque los tests reimporten la base. Cerrarlo (o reiniciarlo) y volver a correr los tests.

**El gestor dice "El email o la contraseña no son correctos"**
Volver a poner la contraseña con `pnpm gestor:usuario <email> "<Nombre>"`. Para el usuario de prueba: `CLAVE=<la de .env> pnpm gestor:usuario prueba@maitilac.local "Usuario de prueba"`.

**Error de tipos que menciona `.next/types`**
Quedaron archivos generados viejos: borrar la carpeta `.next` y volver a correr `pnpm dev` o `pnpm build`.
