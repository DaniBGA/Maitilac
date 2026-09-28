# Sitio Maitilac

Sitio web de Maitilac (quesos artesanales de Tandil), en migración desde un único `index.html` a **Next.js 16 + React 19 + Tailwind 4**. Más adelante se suman PostgreSQL y un gestor con login, publicado en un VPS de Hostinger.

- **Plan** (qué se construye y por qué): [docs/PLAN DE REFACTORIZACION.md](docs/PLAN%20DE%20REFACTORIZACION.md)
- **Paso a paso** (cómo, en qué orden y estado actual): [docs/PASO A PASO.md](docs/PASO%20A%20PASO.md)

> **Estado:** etapas 0 y 1 terminadas: proyecto base, header, menú móvil, footers y tests visuales. Las páginas todavía están vacías y se construyen en la Etapa 2. Base de datos y gestor, en etapas siguientes.

---

## Requisitos

| Herramienta | Versión | Cómo verificar |
|---|---|---|
| Node.js | 24 LTS o superior | `node -v` |
| pnpm | 10 o superior | `pnpm -v` |
| git | cualquiera reciente | `git --version` |

- **pnpm:** `npm i -g pnpm`. Desde Node 25 ya no viene *corepack*, así que `corepack enable` no funciona.
- **Node con nvm** (recomendado): `nvm install 24 && nvm use 24`.
- **Python 3** no es obligatorio. Sólo sirve como alternativa para ver el sitio viejo (ver [Problemas frecuentes](#problemas-frecuentes)).
- **Docker** todavía no hace falta. Se va a necesitar para la base de datos (Etapa 3).

---

## Primera vez

```bash
git clone <url-del-repo> maitilac
cd maitilac
pnpm install
pnpm exec playwright install chromium   # navegador para los tests visuales
```

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
| Locales | http://localhost:3000/locales |
| Contacto | http://localhost:3000/contacto |

### Versión de producción, en local

```bash
pnpm build
pnpm start      # http://localhost:3000
```

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

Levanta `pnpm dev` solo si no está corriendo. Para ver las diferencias marcadas en rojo:

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

> Mientras la Etapa 2 no esté terminada, **es normal que fallen los tests de páginas completas**: las páginas todavía están vacías. Hoy tienen que pasar los de `layout.spec.ts`.

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

Chequeo de tipos: `pnpm exec tsc --noEmit`.

---

## Estructura

```
app/                  Rutas de Next.js
  (sitio)/            Páginas públicas (layout con el header)
  globals.css         Capas CSS, Tailwind sin preflight, fuentes y tokens
components/sitio/     Header, footers y (próximamente) el resto de las secciones
lib/                  Datos y utilidades (config de contacto, etc.)
styles/
  sitio/              CSS del sitio viejo, portado textual (no redondear valores)
  en-linea/           Lo que en el sitio viejo eran atributos style=""
public/               Fuentes, imágenes y foto del hero
tests/visual/         Tests visuales y capturas de referencia
referencia/           Sitio viejo congelado. NO EDITAR
docs/                 Plan, paso a paso, registro de cambios, manual del gestor
_fuentes/             Material original del cliente (no se publica)
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

**Error de tipos que menciona `.next/types`**
Quedaron archivos generados viejos: borrar la carpeta `.next` y volver a correr `pnpm dev` o `pnpm build`.
