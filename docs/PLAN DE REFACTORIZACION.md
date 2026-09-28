# Plan de refactorización — Sitio Maitilac

Documento de contexto para la migración del sitio actual (un único `index.html`) a una aplicación moderna con contenido dinámico. Sirve como punto de partida para cualquier persona (o sesión de IA) que retome el trabajo: qué hay hoy, qué se va a construir, en qué orden y con qué criterios.

- **Fecha del análisis:** 27/09/2026 — **Revisión:** 27/09/2026, stack para VPS de Hostinger (Next.js + PostgreSQL + Docker)
- **Versión analizada:** `index.html` del 09/09/2026 (3.135 líneas, 184 KB)
- **Documentos relacionados:** `REGISTRO DE CAMBIOS.md` (historia y decisiones), `MANUAL DEL GESTOR.md` (guía del cliente)

---

## 0. Reglas de trabajo que se mantienen

Vienen de `REGISTRO DE CAMBIOS.md` y **siguen vigentes durante toda la refactorización**. La migración no es excusa para "mejorar" contenido.

1. **Los textos van tal cual.** Todo texto del sitio actual se migra carácter por carácter (incluidos `<strong>`/`<em>` de la historia). Si algo parece un error, se migra igual y se anota en la sección 10 de este documento.
2. **No inventar datos.** Si un campo nuevo del modelo no tiene dato (ej. `alt` de una foto, horario de un local), queda vacío. No se rellena.
3. **No exagerar.** Ningún texto nuevo de interfaz (SEO, títulos de página, mensajes) con superlativos que no estén en la fuente.
4. **Pedir permiso antes de eliminar o mover archivos**, incluso los que parecen material de descarte (`FOTOS/`, imágenes de WhatsApp, etc.).
5. **Nada "por si acaso".** No se crean tablas, campos ni pantallas que no respondan a una necesidad actual o a un pendiente documentado.

---

## 1. Diagnóstico del sitio actual

### 1.1 Arquitectura

Todo el sitio **y** el panel de administración viven en un único archivo:

| Bloque de `index.html` | Líneas | Contenido |
|---|---|---|
| `<style>` | 17–473 | ~450 líneas de CSS: base, componentes, gestor, 3 niveles de responsive |
| Markup | 474–1281 | 6 "páginas" como `<main class="page">` que se muestran/ocultan: `home`, `nosotros`, `catalogo`, `locales`, `contacto`, `gestor` |
| `<script>` — datos | 1282–1695 | Constantes `*_BASE` + lectura de `localStorage` |
| `<script>` — lógica | 1696–3132 | Renderizado con template strings, router por hash, modal, carruseles, gestor completo |

- **Router:** `irA()` oculta/muestra `<main>` y escribe `#pagina` con `history.replaceState`. No hay URLs reales: el botón "atrás" del navegador no navega entre secciones y los buscadores ven una sola página.
- **Renderizado:** funciones `pintarX()` que arman HTML con template strings e `innerHTML`. Se usa `esc()` para escapar, pero no en todos los casos (los textos de historia inyectan HTML a propósito).
- **Arranque:** `arrancar(nombre, fn)` envuelve cada render en `try/catch` para que un dato corrupto en `localStorage` no rompa todo el sitio (parche de la sección 29 del registro).

### 1.2 Inventario de datos

| Constante | Editable desde gestor | Clave `localStorage` | Observaciones |
|---|---|---|---|
| `CONFIG` | No | — | WhatsApp local y mayorista, teléfono, email, Instagram |
| `ANUNCIOS_BASE` | Sí | `maitilac_anuncios` | 3 carteles fijos: `barra`, `badge1`, `badge2` |
| `COLORES` | No | — | Paleta de los anuncios (marrón, naranja, verde) |
| `PRODUCTOS_BASE` | Sí | `maitilac_productos` + `maitilac_borrados` | 12 productos. **Identificados por nombre**, sin id |
| `OCASIONES_BASE` | Sí | `maitilac_ocasiones` | 7 filtros; `match` = lista de nombres de producto |
| `HISTORIA` | No | — | 9 hitos (1940–2023) con HTML embebido |
| `FOTOS_HISTORIA`, `FOTOS_HOY` | No | — | Carruseles de Nosotros (5 + 15 fotos) |
| `LOCALES` | No | — | 2 locales con horarios para "Abierto ahora" |
| `PASOS` | No | — | 4 pasos del proceso productivo |
| `EQUIPO_BASE` | Sí | `maitilac_equipo` | 9 personas (6 son puestos genéricos sin foto) |
| `PREMIOS_BASE` | Sí | `maitilac_premios` | 11 premios reales con foto del diploma |
| `INSTA` | No | — | 6 fotos estáticas (no es un feed real) |

### 1.3 Funcionalidades a preservar (paridad)

**Sitio público**
- Barra de anuncio + 2 badges sobre el hero, con color y visibilidad configurables.
- Hero con foto de fondo y velo; en móvil cambia encuadre y degradado.
- Cifras (+40 Años, 8 Variedades, Quesos de Tandil).
- Productos destacados (campo `destacado`), grilla centrada si la última fila queda incompleta.
- Tarjetas con carrusel de fotos (flechas), badge, chips de presentación y de quesos incluidos, precio u "Consultar" (`verPrecio`).
- Catálogo: bloque "Producto del mes", filtros por ocasión (se deshabilitan si no tienen productos visibles), grilla, modal de detalle con galería (teclado ← → Esc), maridajes, premios y botón de WhatsApp con mensaje prearmado.
- Nosotros: relato + línea de tiempo con globos al pasar el mouse, dos carruseles automáticos en sentidos opuestos, proceso productivo, cadena de producción ilustrada (6 pasos sobre una cinta ondulada), equipo, carrusel de premios (la sección desaparece si no hay premios visibles), Cluster Quesero.
- Locales: cartel "Abierto ahora" calculado con el horario, refresco cada 60 s.
- Contacto: dos canales (local / mayorista), formulario con pestañas que arma un mensaje y abre WhatsApp al número correspondiente.
- Menú hamburguesa en móvil; objetivos táctiles ≥ 44 px y textos ≥ 12 px.

**Gestor** (acceso por `#gestor`, sin contraseña)
- Anuncios: texto, visibilidad, color, vista previa en vivo.
- Ocasiones: renombrar, activar, asignar productos, ordenar, agregar, eliminar.
- Premios y Equipo: edición en línea, foto (subida y reducida a 1000 px como data URI), ocultar, ordenar, agregar, eliminar, restaurar.
- Productos: buscador, filtros, panel lateral de edición, destacar, ocultar, ordenar, eliminar (con propagación a ocasiones y combos), restaurar original.
- Exportar a `.txt` con los bloques `*_BASE` para pegarlos a mano en el código.

### 1.4 Problemas detectados

| # | Problema | Impacto |
|---|---|---|
| P1 | **Los cambios del gestor sólo existen en el navegador donde se hicieron** (`localStorage`). Para publicarlos hay que exportar, enviar el archivo y pegarlo en el código. | Crítico: el gestor no cumple su función real |
| P2 | **Gestor sin autenticación**, enlazado desde el footer público. | Alto (hoy inofensivo porque no publica nada; deja de serlo apenas tenga backend) |
| P3 | Fotos subidas como data URI en `localStorage` (límite ~5 MB por origen). | Alto: se llena con pocas fotos y falla el guardado |
| P4 | Productos identificados por **nombre**: renombrar exige reescribir ocasiones y combos; borrar exige una lista negra (`maitilac_borrados`) para que el producto no reaparezca desde `PRODUCTOS_BASE`. | Medio: lógica frágil de merge |
| P5 | **Datos duplicados en el HTML**: el bloque "Producto del mes" tiene Holanda, `$4800` y su foto escritos a mano; la página Locales repite direcciones/horarios que ya están en `LOCALES`; "8 Variedades" es fijo. | Medio: se desincronizan al editar desde el gestor |
| P6 | `gExportar()` **no exporta `EQUIPO`**. Los cambios de equipo no se pueden hacer permanentes. | Medio |
| P7 | Documentación desfasada: `MANUAL DEL GESTOR.md` describe **Categorías** (eliminadas del código) y el registro describe un **Banco de fotos** que no está en el `index.html` actual. El export `catalogo-maitilac (1).txt` trae `CATEGORIAS_BASE`, ya obsoleto. | Medio: confusión para el cliente y para quien mantenga |
| P8 | Sin SEO real: una sola URL, sin páginas por producto, sin datos estructurados (`LocalBusiness`, `Product`), sin Open Graph. | Medio |
| P9 | **371 atributos `style=""` en línea** y colores hex repetidos en todo el CSS; el responsive tiene que pisarlos con `!important` (incluso con selectores como `div[style*="letter-spacing:.07em"]`). | Medio: mantenimiento costoso |
| P10 | `img/` pesa 21 MB, JPG sin variantes por tamaño ni formatos modernos; sin `loading="lazy"` sistemático. | Medio: rendimiento móvil |
| P11 | "Abierto ahora" usa la hora del dispositivo, no la de Argentina. | Bajo |
| P12 | Carpeta raíz mezclada: material fuente del cliente (`FOTOS/`, `Premios ORDENADOS/`, imágenes de WhatsApp, PDF de 9 MB, `.docx`) junto a los archivos que se publican. Sin commits en git. | Bajo, pero bloquea un deploy limpio |
| P13 | Imágenes sin uso: `img/logo.png`, `img/logo-tandil.png`. | Bajo |

---

## 2. Objetivos de la refactorización

1. **Contenido dinámico real:** lo que se edita en el gestor se publica para todos los visitantes en menos de un minuto, sin exportar ni tocar código.
2. **Gestor seguro:** acceso con usuario, sólo para personas autorizadas.
3. **Paridad visual y funcional** con el sitio actual (sección 1.3). La refactorización no rediseña: el sitio tiene que verse igual.
4. **URLs reales y SEO:** una página por sección y por producto, indexables y compartibles.
5. **Código mantenible:** componentes, tipos, estilos con tokens, sin estilos en línea.
6. **Rendimiento:** Lighthouse ≥ 90 en móvil en todas las páginas públicas.
7. **Resolver pendientes documentados:** Banco de fotos unificado con el catálogo (registro §24), equipo exportable, datos sin duplicar.

**Fuera de alcance:** rediseño visual, carrito o pagos online, feed real de Instagram, cambios de textos.

---

## 3. Stack propuesto

**Restricción de infraestructura:** todo (aplicación, base de datos y fotos) se aloja en un **VPS de Hostinger** (decisión del 27/09/2026). Con un VPS hay control total del servidor, así que no hay limitaciones de lenguaje. Se descartan los servicios externos en tiempo de ejecución (Netlify, Supabase, CDNs de terceros).

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) | Un solo proyecto para el sitio público y el gestor. Los *Server Components* arman el HTML en el servidor (SEO, poco JS en el celular) y las *Server Actions* reemplazan a una API: el gestor guarda llamando funciones del servidor tipadas. |
| UI | **React 19** | Componentes interactivos sólo donde hacen falta: filtros y modal del catálogo, carruseles, formulario de contacto, "Abierto ahora" y todo el gestor. |
| Caché | `'use cache'` + `cacheTag` / `revalidateTag` de Next | Las páginas públicas se sirven desde la caché. Al guardar en el gestor se invalida sólo la etiqueta afectada (`productos`, `premios`, …) y el cambio se ve **al instante**. Funciona en un servidor propio sin servicios extra. |
| Base de datos | **PostgreSQL 17** (contenedor en el mismo VPS) | Modelo relacional con arrays nativos; productos, ocasiones y combos relacionados por id (resuelve P4). |
| ORM y migraciones | **Drizzle ORM** + drizzle-kit | Esquema en TypeScript, tipos de punta a punta, migraciones versionadas en SQL legible. |
| Autenticación | **Better Auth** (email + contraseña) | Sesiones seguras guardadas en la misma base Postgres, sin servicios externos. Registro público desactivado. |
| Validación | ~~Zod~~ | *No se usó (Etapa 5):* cada Server Action valida sus campos a mano. Se puede sumar si los formularios crecen. |
| Formularios del gestor | ~~React Hook Form~~ | *No se usó (Etapa 5):* el panel de productos usa estado de React simple. |
| Componentes del gestor | ~~shadcn/ui~~ | *No se usó (Etapa 5):* el gestor se armó con el mismo markup del gestor viejo (clases `.g-*`). La revisión de foco y teclado del panel lateral queda para el Paso 6.3. |
| Reordenar | **dnd-kit** | Arrastrar y soltar en lugar de las flechas ▲▼, como mejora de la Etapa 7 (durante la paridad se mantienen las flechas). Las flechas se conservan como alternativa accesible por teclado. |
| Estilos | **Tailwind CSS 4** (sin preflight) + tokens CSS | La paleta y las tipografías actuales pasan a `@theme` (ver 4.6). Primero se porta el CSS viejo casi textual y los 371 estilos en línea pasan a clases con los mismos valores; convertirlos a utilidades es opcional y posterior. Detalle en `PASO A PASO.md`, "Estrategia de estilos". |
| Imágenes | **sharp** | Al subir una foto se generan variantes AVIF/WebP en 3 tamaños, guardadas en disco (resuelve P3 y P10). |
| Infraestructura | **Docker Compose** (app + Postgres + Caddy) sobre Ubuntu 24.04 | Entorno idéntico en local y en el VPS. **Caddy** hace de proxy con HTTPS automático (Let's Encrypt) y sirve las fotos directamente con caché larga. |
| CI/CD | **GitHub Actions** | Tests → build de la imagen Docker → deploy por SSH al VPS (`docker compose pull && up -d`), con migraciones automáticas al arrancar. |
| Tests | **Vitest** + **Playwright** | Unitarios para la lógica pura (horarios, precios, filtros) y e2e con comparación de capturas para verificar la paridad. |
| Calidad | ESLint, Prettier, Lighthouse CI | — |
| Gestor de paquetes | **pnpm** | — |

### Alternativas consideradas

| Opción | Motivo para descartarla |
|---|---|
| Laravel + MySQL | Era la opción para hosting compartido. Con un VPS ya no hace falta PHP, y Next permite un solo lenguaje (TypeScript) en frontend, backend y base de datos. |
| Astro + islas React | Mejor aún para páginas de contenido puro, pero el gestor y la invalidación de caché por etiquetas habría que armarlos a mano. Next trae las dos cosas resueltas. |
| Payload CMS 3 (se instala dentro de Next) | Admin generado automáticamente y muy completo, pero con interfaz genérica. El cliente ya conoce un gestor pensado a su medida, con manual incluido. Queda como plan B si hay que acortar tiempos en el gestor. |
| Supabase autoalojado | Levanta más de 10 contenedores para un sitio de este tamaño. Postgres + Better Auth + disco cubren lo mismo con mucho menos mantenimiento. |
| MongoDB | Sin modelo relacional: las relaciones producto↔ocasión↔combo (el origen de P4) quedan igual de frágiles. |

---

## 4. Arquitectura objetivo

### 4.1 Rutas

| Ruta | Reemplaza a | Render |
|---|---|---|
| `/` | `#home` | Server Component, en caché |
| `/nosotros` | `#nosotros` | Server Component, en caché |
| `/catalogo` | `#catalogo` | Server Component en caché; filtros y modal como componente cliente |
| `/catalogo/[slug]` | *(nuevo)* modal de producto | Página propia en caché. En `/catalogo`, el modal se abre como *intercepting route* de Next: la URL cambia, se puede compartir y "atrás" lo cierra |
| `/locales` | `#locales` | Server Component, en caché |
| `/contacto` | `#contacto` | Server Component; formulario como componente cliente |
| `/gestor/ingresar` | — | Con límite de intentos |
| `/gestor/*` | `#gestor` | Protegido; se verifica la sesión en la página y en **cada** Server Action |

Un script mínimo en `/` redirige los hashes viejos (`/#catalogo` → `/catalogo`, `/#gestor` → `/gestor`) para no romper enlaces ya compartidos.

**Estrategia de caché** *(implementada en la Etapa 3)*: las funciones de `lib/datos.ts` usan `'use cache'` + `cacheLife('max')` + `cacheTag('<entidad>')`. Las páginas se arman en cada pedido (`await connection()`), así **el build no necesita la base** (la imagen Docker se compila sin acceso a ella), y los datos salen de la caché en memoria del servidor, que en un VPS persiste entre pedidos. Las Server Actions del gestor, después de escribir en la base, llaman a `updateTag('<entidad>')` y el cambio se ve al instante. Si el servidor se reinicia, la caché arranca vacía y se vuelve a llenar en el primer pedido (una consulta liviana). Caddy agrega compresión y cabeceras de caché largas para `/_next/static` y `/fotos`.

### 4.2 Qué va a la base de datos y qué queda en el repositorio

- **Base de datos (editable desde el gestor):** todo lo que hoy edita el gestor, más los locales y la configuración de contacto (hoy duplicados en el HTML).
- **Repositorio (archivos en `content/`, versionados en git):** historia, pasos del proceso, cadena de producción y cifras del Inicio. Son textos aprobados por terceros que hoy no se editan desde el gestor, y tenerlos versionados es más seguro frente a la regla 1. Si en el futuro se quieren editar desde el gestor, se pasan a tablas sin cambiar los componentes.

### 4.3 Modelo de datos (PostgreSQL)

Esquema en notación resumida; se implementa en `db/schema.ts` con Drizzle.

```sql
-- Inventario único de fotos = el "Banco de fotos" (resuelve registro §24)
fotos (
  id uuid pk, archivo text not null,       -- ruta relativa dentro del volumen /data/fotos
  variantes jsonb,                         -- {"400": {"avif": "...", "webp": "..."}, "800": …, "1600": …}
  alt text, ancho int, alto int,
  creado_en timestamptz default now()
)

productos (
  id uuid pk, slug text unique not null, nombre text not null,
  tipo text, descripcion text,
  precio numeric(10,2),                    -- null = "Consultar"
  precio_prefijo text,                     -- ej. 'Desde'
  unidad text,                             -- 'kg', 'combo', 'unidad'
  ver_precio bool default true,
  badge text,                              -- 'Producto del Mes', 'Nuevo', …
  destacado bool default false,
  presentaciones text[] default '{}',      -- 'Entero', 'Trozado', 'Feteado', …
  maridaje_comida text[] default '{}',
  maridaje_bebida text[] default '{}',
  premios_texto text,                      -- se conserva tal cual ('ORO 2019, ORO 2023 Y ORO 2025')
  activo bool default true,
  orden int not null,
  eliminado_en timestamptz,                -- borrado lógico: reemplaza maitilac_borrados
  creado_en, actualizado_en
)

producto_fotos    (producto_id fk, foto_id fk, orden int, pk(producto_id, foto_id))
combo_quesos      (combo_id fk → productos, queso_id fk → productos, orden int)   -- por id (P4)

ocasiones         (id uuid pk, clave text unique, label text, ver bool, orden int)   -- clave: la del sitio viejo
ocasion_productos (ocasion_id fk, producto_id fk, pk(ocasion_id, producto_id))

anuncios (clave text pk check (clave in ('barra','badge1','badge2')),
          ver bool, texto text, color text check (color in ('marron','naranja','verde')))

premios  (id uuid pk, anio text, titulo text, evento text, detalle text,
          foto_id fk null, ver bool, orden int)

equipo   (id uuid pk, nombre text, rol text, area text,
          foto_id fk null, ver bool, orden int)

locales  (id uuid pk, nombre text, direccion text,
          horario_semana text, horario_domingo text,               -- lo que se muestra, tal cual
          abre text, cierra text, dom_abre text, dom_cierra text,  -- lo que calcula "Abierto ahora"
          foto_id fk null,                                         -- foto del resumen del Inicio
          foto_detalle_id fk null, encuadre_detalle text,          -- foto de la página Locales y su object-position
          como_llegar text, mapa_url text, orden int)

config   (id int pk check (id = 1), whatsapp text, whatsapp_mayorista text,
          telefono text, email text, instagram text, facebook text)

-- Bloque "Producto del mes" del catálogo (una fila). En el sitio viejo tiene su
-- propio texto y su propia foto, distintos de la descripción y la 1.ª foto del producto.
producto_del_mes (id int pk check (id = 1), producto_id fk null, texto text, foto_id fk null)

-- Tablas de Better Auth (user, session, account, verification), generadas por su CLI
```

Notas:
- **`precio` numérico + `precio_prefijo`**: hoy el precio es texto libre (`'$4500'`, `'Desde $8500'`, `'Consultar'`). La migración lo descompone sin perder información y una única función formatea (`$4.500`). Si el cliente prefiere seguir escribiendo el precio como texto libre, se reemplaza por un campo `precio_texto` (decisión abierta D3).
- **Sin tabla de categorías**: se eliminaron del sitio y no se reintroducen (regla 5).
- **Ajustes de la Etapa 3** (para que nada cambie visualmente): `producto_del_mes` pasó de ser una columna de `productos` a una tabla propia; `locales` sumó la foto, el encuadre, "cómo llegar" y el mapa de la página Locales; `ocasiones` conserva la clave del sitio viejo. El precio se sigue mostrando con el formato viejo (`$4500`) hasta que se decida D3. Implementado en `db/schema.ts`.
- **Quitar una foto de un producto** sólo borra la fila de `producto_fotos`. La foto sigue en `fotos` y aparece como "sin asignar" en el Banco (pedido del cliente del 06/08/2026).

### 4.4 Seguridad

**Aplicación**
- Login con Better Auth: sin registro público. Los usuarios se crean con un script (`pnpm gestor:usuario`). Límite de intentos y cookies `HttpOnly`/`Secure`/`SameSite`.
- La sesión se verifica en la página `/gestor` (y antes, de forma optimista, en `proxy.ts`) **y dentro de cada Server Action** (las actions son endpoints públicos aunque no se vean en la interfaz).
- Toda entrada del gestor se valida en la Server Action antes de tocar la base. Drizzle usa consultas parametrizadas.
- Las consultas públicas filtran siempre por `activo`/`ver` y excluyen los borrados.
- **Subida de fotos:** validación de tipo y tamaño, re-codificación con sharp (descarta cualquier contenido que no sea imagen) y nombres de archivo generados, nunca los del usuario.
- El HTML de la historia se renderiza desde archivos del repositorio, nunca desde datos del gestor.
- El enlace "Gestor del catálogo" sale del footer público.

**Servidor (VPS)**
- Acceso SSH sólo con clave, sin login de root ni por contraseña; usuario `deploy` sin privilegios.
- Firewall (`ufw`): sólo 22, 80 y 443. Postgres **no** se expone fuera de la red de Docker.
- `fail2ban` y actualizaciones de seguridad automáticas (`unattended-upgrades`).
- Secretos en `.env` en el servidor (permisos 600), fuera del repositorio.

**Copias de seguridad**
- `pg_dump` diario + copia del volumen de fotos, con rotación (7 diarias, 4 semanales).
- Snapshots semanales del VPS desde el panel de Hostinger.
- Descarga manual desde el gestor (JSON de todas las tablas).
- Recomendado: una copia fuera del VPS (ver D7).

### 4.5 Estructura del proyecto

```
maitilac/
├─ app/
│  ├─ (sitio)/                     # layout público: header, footers, barra de anuncio
│  │  ├─ page.tsx                  # Inicio
│  │  ├─ nosotros/page.tsx
│  │  ├─ catalogo/
│  │  │  ├─ page.tsx
│  │  │  ├─ [slug]/page.tsx        # página propia del producto
│  │  │  └─ @modal/(.)[slug]/      # modal interceptado desde el catálogo
│  │  ├─ locales/page.tsx
│  │  └─ contacto/page.tsx
│  ├─ gestor/
│  │  ├─ login/page.tsx
│  │  ├─ layout.tsx                # verifica la sesión
│  │  └─ (panel)/                  # anuncios, ocasiones, premios, equipo, productos, fotos, config
│  ├─ api/auth/[...all]/route.ts   # Better Auth
│  ├─ sitemap.ts, robots.ts
│  └─ layout.tsx                   # <html>, fuentes, metadatos base
├─ components/
│  ├─ sitio/                       # Header, NavMovil, FooterOscuro, FooterClaro, BarraAnuncio, Hero,
│  │                               # TarjetaProducto, Catalogo, ModalProducto, LineaTiempo, Carrusel,
│  │                               # Cadena, AbiertoAhora, FormContacto, Foto (picture + srcset)
│  ├─ gestor/                      # PanelLateral, ListaOrdenable, SubirFoto, VistaPreviaAnuncio
│  └─ ui/                          # shadcn/ui (sólo gestor) + Chip, Badge, BotonPill
├─ content/                        # historia, proceso, cadena, cifras (texto tal cual)
├─ db/
│  ├─ schema.ts                    # esquema de 4.3
│  ├─ migrations/                  # generadas por drizzle-kit
│  └─ importar/                    # migración de datos (sección 6)
├─ lib/
│  ├─ queries.ts                   # lecturas con 'use cache' + cacheTag
│  ├─ actions/                     # Server Actions del gestor (una por entidad)
│  ├─ auth.ts                      # configuración de Better Auth
│  ├─ schemas.ts                   # Zod
│  ├─ imagenes.ts                  # sharp: variantes AVIF/WebP
│  ├─ horarios.ts                  # "Abierto ahora" (America/Argentina/Buenos_Aires, P11)
│  ├─ precio.ts                    # formato de precio / "Consultar"
│  └─ whatsapp.ts                  # armado de enlaces wa.me
├─ styles/globals.css              # @theme con tokens + @font-face
├─ public/fonts/                   # los 4 .woff2 actuales
├─ tests/                          # vitest + playwright
├─ infra/
│  ├─ docker-compose.yml           # app, postgres, caddy
│  ├─ Caddyfile
│  └─ backup.sh                    # pg_dump + fotos, con rotación
├─ Dockerfile                      # build multi-etapa, salida "standalone" de Next
├─ .github/workflows/              # ci.yml (tests) y deploy.yml
├─ docs/                           # REGISTRO DE CAMBIOS, MANUAL DEL GESTOR, este plan
└─ _fuentes/                       # material del cliente, fuera del build (ver fase 0)
```

**En el VPS:** `/srv/maitilac/` con el `docker-compose.yml`, el `.env` y los volúmenes `postgres/`, `fotos/` y `backups/` (la caché de páginas vive en memoria).

### 4.6 Tokens de diseño (extraídos del CSS actual)

| Token | Valor | Uso actual |
|---|---|---|
| `--color-crema` | `#F7F4EC` | Fondo principal |
| `--color-crema-2` | `#EFEBDF` | Secciones alternas |
| `--color-crema-3` | `#E7E4D6` | Secciones alternas |
| `--color-tinta` | `#2A2621` | Texto |
| `--color-oscuro` | `#1B1815` | Secciones y footer oscuros |
| `--color-marron` | `#5E3D22` | Botones, barra de anuncio |
| `--color-marron-2` | `#7A4E2B` | Botones secundarios, acentos |
| `--color-naranja` | `#C67A31` | Precios, enlaces, badge |
| `--color-naranja-2` | `#DA8737` | Hover, año activo, badges |
| `--color-verde` | `#617C52` | Badge verde, cadena, checks |
| `--font-serif` | Cormorant Garamond | Títulos |
| `--font-sans` | Mulish | Texto |
| `--font-script` | Yellowtail | "Eyebrow" de la cadena |

Breakpoints actuales: `1024px` (tablet) y `720px` (celular).

---



## 5. Mapeo del código actual al nuevo

| Actual (`index.html`) | Nuevo |
|---|---|
| `irA()`, `data-go`, `#burger` | Rutas del App Router + `<Header>` + `<NavMovil>` (componente cliente) |
| `pintarAnuncios()` | `<BarraAnuncio>` + badges en `<Hero>` (datos de `anuncios`) |
| `FOOTER_HTML` | `<FooterOscuro>` |
| `tarjetaHTML()` | `<TarjetaProducto>` (usada en Inicio y Catálogo) |
| `pintarDestacados()` | Sección de Inicio → `queries.productosDestacados()` |
| `pintarLocalesHome()`, markup de Locales | `<LocalCard>` alimentado por la tabla `locales` (elimina P5) |
| `actualizarAbierto()` | `lib/horarios.ts` + `<AbiertoAhora>` (render inicial en el servidor, refresco cada 60 s en el cliente) |
| `pintarHistoria()` | `<LineaTiempo>` desde `content/historia`; globos con CSS; año activo en el cliente |
| `pintarFotosHistoria()` (rAF) | `<Carrusel>` (o CSS `@keyframes`), respetando `prefers-reduced-motion` |
| `pintarEquipo()`, `pintarPremios()` | Secciones de Nosotros; se ocultan si no hay elementos visibles |
| Bloque "Producto del mes" escrito a mano | `<ProductoDelMes>` → producto con `producto_del_mes = true` |
| `pintarFiltros()`, `pintarCatalogo()`, `contarOcasion()` | `<Catalogo>` (cliente) con los datos iniciales traídos por el servidor |
| `abrirModal()`, `pintarModal()` | `<ModalProducto>` como intercepting route `@modal/(.)[slug]` |
| `pintarTabs()`, submit del formulario | `<FormContacto>` + `lib/whatsapp.ts` |
| `gCargarAnuncios()` … `gVistaAnuncios()` | `gestor/anuncios` + `actions/anuncios.ts` (vista previa en vivo en el cliente) |
| `gPintarOcasiones()` y handlers | `gestor/ocasiones` + `actions/ocasiones.ts` |
| `gPintarPremios()`, `gPintarEquipo()` | `gestor/premios`, `gestor/equipo` + `<ListaOrdenable>` |
| `gPintarLista()`, `gAbrirPanel()`, `gGuardarPanel()` | `gestor/productos` + `<PanelLateral>` + `actions/productos.ts` |
| `gSubirFotos()`, `gAchicar()` | `<SubirFoto>` → Server Action → `lib/imagenes.ts` (sharp) |
| `gMover()`, `gFlechas()` | `<ListaOrdenable>` (dnd-kit + flechas accesibles) |
| `gExportar()` | "Descargar copia de seguridad" (JSON de **todas** las tablas, incluido equipo; resuelve P6) |
| "Restaurar original" | Se reemplaza por restaurar desde una copia de seguridad (ver D5) |
| Banco de fotos (registro §24, ausente en el HTML actual) | `gestor/fotos` sobre la tabla `fotos` |
| `arrancar()` (try/catch por sección) | Datos validados con Zod al guardar + `error.tsx` por segmento: si una sección falla, el resto de la página se muestra |

---

## 6. Migración de datos

Script único `pnpm db:importar` (TypeScript con `tsx`), idempotente (se puede correr varias veces sin duplicar), que:

1. Lee los datos de fábrica (`PRODUCTOS_BASE`, `OCASIONES_BASE`, `PREMIOS_BASE`, `EQUIPO_BASE`, `ANUNCIOS_BASE`, `LOCALES`, `CONFIG`), extraídos del `index.html` a JSON en `db/importar/data/`.
2. Procesa cada imagen referenciada de `img/` con sharp, guarda original y variantes en el volumen de fotos y crea su fila en `fotos`. Cada archivo se importa una sola vez, aunque se use en varios productos.
3. Genera el `slug` desde el nombre (`Combo 3 Quesos` → `combo-3-quesos`).
4. Convierte las referencias por nombre (`ocasiones.match`, `productos.quesos`) en relaciones por id.
5. Descompone el precio (`'Desde $8500'` → `precio_prefijo='Desde'`, `precio=8500`; `'Consultar'` → `precio=null`).
6. Conserva el orden de cada lista en el campo `orden`.
7. Al final imprime un **informe de verificación**: cantidad de filas por tabla, fotos no encontradas y nombres que no se pudieron relacionar.

Se corre primero en local y después en el VPS (`docker compose exec app pnpm db:importar`).

**Datos que el cliente pueda tener sólo en su navegador:** antes de apagar el sitio viejo, pedirle que use "Exportar" una última vez. El script acepta ese `.txt` como entrada alternativa e ignora bloques obsoletos como `CATEGORIAS_BASE`. Como el export actual no incluye el equipo, si el cliente cambió el equipo hay que relevarlo a mano.

Los textos de la historia pasan a `content/historia/` copiando el HTML de `textos` sin modificar.

---

## 7. Fases de trabajo

Cada fase termina en algo desplegable y verificable. No se avanza a la siguiente sin cumplir el criterio de aceptación.

> **La ejecución detallada está en [PASO A PASO.md](PASO%20A%20PASO.md)**, que manda sobre este resumen. Ahí la fase 2 se divide en dos: primero las páginas con datos locales (paridad visual pura, Etapa 2) y después la base de datos (Etapa 3). El servidor pasa a ser una etapa propia (4), el gestor la 5, calidad y lanzamiento la 6, y se agrega una Etapa 7 de pulido de funcionalidades.

### Fase 0 — Preparación
- Primer commit en git con el estado actual (hoy la rama `main` no tiene commits).
- Capturas de referencia (Playwright) de cada página en 1440 px, 1024 px y 390 px, incluyendo modal abierto, menú móvil y gestor.
- **Con permiso del cliente:** mover el material fuente a `_fuentes/` (`FOTOS/`, `Premios ORDENADOS/`, `imagenes de INSTAGRAM/`, imágenes de WhatsApp, PDF, `.docx`, `LOGO.jpeg`, `CLUSTER.jpeg`, `1.jpeg`, `2.jpeg`, `Copilot_*.png`, `tradicion que se hereda.jpeg`) y excluirlo del build.
- Confirmar las decisiones D1b y D2.

**Aceptación:** repo con historial, capturas de referencia guardadas y carpeta raíz ordenada.

### Fase 1 — Base del proyecto e infraestructura
- Crear el proyecto Next.js + TypeScript + Tailwind 4 con pnpm; ESLint y Prettier.
- `globals.css` con los tokens (4.6) y `@font-face` de las 4 fuentes locales.
- Layout base (metadatos, Open Graph, favicon), `<Header>`, `<NavMovil>` y los footers.
- `Dockerfile` (salida `standalone`) y `docker-compose.yml` para desarrollo local con Postgres.
- **VPS:** Ubuntu 24.04, usuario `deploy`, SSH con clave, `ufw`, `fail2ban`, actualizaciones automáticas y Docker. DNS del subdominio de prueba (ej. `nuevo.<dominio>`) apuntando al VPS; Caddy con HTTPS.
- GitHub Actions: tests → imagen Docker → deploy por SSH al subdominio de prueba.

**Aceptación:** header y footer idénticos a las capturas en los 3 anchos, publicados en el subdominio de prueba con HTTPS y deploy automático en cada push a `main`.

### Fase 2 — Base de datos y páginas públicas
- Esquema Drizzle (4.3), migraciones y script de importación (sección 6), para trabajar desde el inicio contra la base real.
- Todas las páginas y componentes públicos de la sección 5.
- Modal como intercepting route y páginas `/catalogo/[slug]`.
- Redirección de los hashes viejos.
- `<Foto>` con `<picture>`, `srcset` sobre las variantes AVIF/WebP y `loading="lazy"` en todas salvo el hero.
- Caché con `'use cache'` + `cacheTag`.

**Aceptación:** comparación visual contra las capturas de la fase 0 sin diferencias relevantes; checklist de paridad pública (1.3) completo; Lighthouse móvil ≥ 90.

### Fase 3 — Gestor
- Better Auth, script para crear usuarios, protección del layout y de cada Server Action.
- Pantallas en este orden (de menor a mayor complejidad): Anuncios → Config/Locales → Premios → Equipo → Ocasiones → Productos → Banco de fotos.
- Cada guardado: validación, escritura en la base, `updateTag` y aviso "Guardado. Ya se ve en el sitio".
- *Estado (28/09/2026):* hecho, salvo quitar el enlace del footer (pendiente de aprobación), los usuarios de D2 y la prueba en un celular con el sitio publicado. Detalle en la Etapa 5 de la guía.
- Copia de seguridad descargable (JSON).

**Aceptación:** checklist de paridad del gestor (1.3) completo; un cambio hecho en una computadora se ve al instante en un celular; subir una foto desde un producto la hace aparecer en el Banco; quitarla del producto la deja "sin asignar"; llamar a una Server Action sin sesión devuelve error (test automatizado).

### Fase 4 — Calidad, operación y lanzamiento
- Tests: Vitest (horarios, precio, conteo de ocasiones, slugs, esquemas) y Playwright (navegación, filtros, modal, formulario de WhatsApp, flujo de edición en el gestor).
- SEO: `sitemap.ts`, `robots.ts`, JSON-LD `LocalBusiness` por local y `Product` por producto, `generateMetadata` por página (sin textos nuevos exagerados, regla 3).
- Accesibilidad: foco visible, navegación por teclado en carruseles y modal, `prefers-reduced-motion` para los carruseles automáticos, contraste AA.
- Operación: `backup.sh` en cron y **prueba de restauración** real; endpoint `/api/salud` y política de reinicio de los contenedores; rotación de logs.
- Reescribir `MANUAL DEL GESTOR.md` para el gestor nuevo (quitar Categorías, sumar login y Banco de fotos) y cerrar el registro con una entrada de la migración. Sumar un `docs/OPERACION.md` con deploy, backups, restauración y alta de usuarios.
- Pasar del subdominio de prueba al dominio definitivo.

**Aceptación:** tests en verde en CI, Lighthouse ≥ 90 en todas las páginas, backup restaurado con éxito en un entorno de prueba y manual revisado por el cliente.

---

## 8. Criterios transversales

- **Paridad antes que mejoras.** Cualquier cambio visual o de comportamiento no listado acá se anota como propuesta y se consulta; no se implementa de oficio.
- **Tolerancia a datos incompletos.** Igual que `arrancar()` hoy: si un producto no tiene fotos, se muestra el recuadro rayado `.ph`; si una sección queda vacía (premios, equipo), se oculta. Nunca una página rota.
- **Móvil primero** en objetivos táctiles (≥ 44 px) y tamaños de texto (≥ 12 px), como ya exige el CSS actual.
- **Todo dentro del VPS:** sin servicios externos en tiempo de ejecución. Fuentes, scripts y fotos se sirven desde el propio dominio. GitHub sólo interviene en el build y el deploy.
- **Server Components por defecto.** `'use client'` sólo en los componentes que realmente necesitan interacción, para mantener bajo el JS que descarga el celular.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Diferencias visuales sutiles al pasar del CSS escrito a mano a Tailwind | Comparación de capturas en cada fase. Los valores exactos (paddings, tamaños de fuente) se trasladan como están, sin "redondear" |
| El cliente tiene cambios sólo en su navegador que se pierden | Pedir un último "Exportar" antes de la importación definitiva (sección 6) |
| **El VPS es responsabilidad propia** (actualizaciones, seguridad, caídas) | Endurecimiento de la fase 1, actualizaciones automáticas, reinicio automático de contenedores, monitoreo de `/api/salud` y `docs/OPERACION.md` |
| Pérdida de datos por falla del disco o del VPS | Backups diarios con rotación, snapshots de Hostinger, restauración probada y copia fuera del VPS (D7) |
| Recursos del VPS (RAM al hacer el build) | El build se hace en GitHub Actions; en el VPS sólo corre la imagen ya armada |
| Cambios de API entre versiones de Next.js | Versiones fijadas en `pnpm-lock.yaml`; actualizaciones mayores sólo con los tests en verde |
| Curva de aprendizaje del gestor nuevo | Misma organización por bloques que el gestor actual y manual actualizado |
| Textos modificados sin querer en la migración | Extracción automática desde el `index.html` (no a mano) y comparación de textos en los tests e2e |

---

## 10. Decisiones abiertas y datos a confirmar

**Resueltas:**

- ~~D1 — Hosting~~ → **VPS de Hostinger** para aplicación, base de datos y fotos (27/09/2026). Sin hosting compartido, Netlify ni Supabase.
- ~~D1b — Plan de VPS~~ → **KVM 2** (28/09/2026). Alcanza de sobra para app + Postgres + Caddy. Confirmar RAM y disco en el panel al preparar el servidor (Etapa 4).

**Pendientes (no bloquean el desarrollo; se necesitan antes de la Etapa 4 / Etapa 5 de `PASO A PASO.md`):**

- **D1c — Dominio.** ¿A nombre de quién está el VPS? ¿Qué dominio se usa y dónde se administra el DNS? ¿Hay un sitio publicado hoy en ese dominio? *(Antes de la Etapa 4.)*
- **D2 — Usuarios del gestor.** ¿Quiénes van a tener acceso (emails)? *(Antes del paso 5.10; para desarrollar se usa un usuario de prueba.)*

**No bloqueantes:**

- **D3 — Precio.** ¿Número con formato automático o texto libre como hoy?
- **D4 — Formulario de contacto.** ¿Sigue sólo por WhatsApp, o además se guardan las consultas en la base o se envían por email (se puede usar el correo de Hostinger por SMTP)?
- **D5 — "Restaurar original".** ¿Alcanza con restaurar desde una copia de seguridad, o se quiere un historial de cambios por elemento?
- **D6 — Historia editable.** ¿Se necesita editar la historia, el proceso o las cifras desde el gestor, o quedan fijos?
- **D7 — Copia fuera del VPS.** ¿Se acepta guardar los backups también fuera de Hostinger (por ejemplo, un bucket S3 compatible o Google Drive), o sólo en snapshots de Hostinger?

**Datos heredados sin confirmar** (se migran tal cual, según la regla 1):

- "**8 Variedades**" en las cifras del Inicio, cuando el catálogo tiene 12 productos (8 quesos + combos/picadas/tablas).
- Premio de la **Barra Tybo**: "GRAN CAMPEON 2025" vs. "MEJOR QUESO DEL CONCURSO 2025" (registro, Pendientes).
- Foto de **fetas** asignada a Barra Tybo por deducción.
- Direcciones de **Instagram y Facebook** (`/maitilac`), puestas por suposición.
- Puestos genéricos del **equipo** sin nombre ni foto (Jefe de Planta, Maestro Quesero, etc.).
- `Vermuy blanco` en los maridajes de Mozzarella (posible errata de "Vermut").
- Imágenes sin uso (`img/logo.png`, `img/logo-tandil.png`): ¿se conservan?
