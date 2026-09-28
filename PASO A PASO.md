# Paso a paso — Refactorización del sitio Maitilac

Guía operativa para ejecutar el [PLAN DE REFACTORIZACION.md](PLAN%20DE%20REFACTORIZACION.md) de a un paso por vez. El plan explica **qué** se construye y **por qué**; esta guía explica **cómo** y en qué orden, y sobre todo **cómo verificar que el diseño quede idéntico**.

> **Estado actual:** Etapa 0 — sin empezar. *(Actualizar esta línea al cerrar cada paso.)*

---

## Cómo usar esta guía

1. Se trabaja **de a un paso por vez**, en orden. No se empieza un paso sin haber cerrado el anterior.
2. Cada paso tiene:
   - **Objetivo:** qué tiene que quedar funcionando.
   - **Tareas:** casillas `- [ ]` que se van tildando (`- [x]`).
   - **Verificación:** la prueba que demuestra que está bien. Si no pasa, el paso no está terminado.
   - **Commit:** el mensaje sugerido. Un paso = un commit (o varios chicos), nunca varios pasos en un commit.
3. Al terminar cada paso: tildar las casillas, actualizar la línea de **Estado actual** y, si hubo alguna decisión, anotarla en `REGISTRO DE CAMBIOS.md`.
4. Si alguien retoma el trabajo (otra persona o una sesión de IA): leer primero el plan, después esta guía, y seguir desde la primera casilla sin tildar.
5. Las **etapas 0 a 6 buscan paridad**: el sitio nuevo tiene que verse y comportarse igual que el actual. Las mejoras de funcionalidad se hacen **después**, en la Etapa 7, una por una y con aprobación.

Las referencias a líneas (`index.html:477`) corresponden al `index.html` del 09/09/2026, que queda congelado en `referencia/` (paso 0.2).

---

## Contrato de diseño — leer antes de tocar código

El objetivo de las etapas 0 a 6 es que **una persona no pueda distinguir el sitio nuevo del actual**. Estas reglas se aplican en todos los pasos:

1. **Valores exactos.** Cada tamaño, margen, color, sombra, radio, peso de fuente, `letter-spacing` e interlineado se copia **tal cual** del sitio viejo. No se redondea (`17.5px` sigue siendo `17.5px`, `rgba(94,61,34,.07)` no pasa a ser un gris "parecido").
2. **Los mismos nombres de clase.** Las clases del sitio viejo (`.card`, `.chip-pres`, `.tl-carrusel`, `.cd-paso`, `.canal`, `.g-item`…) se conservan en el HTML nuevo. Así el CSS se porta sin cambios y los tests pueden usar los mismos selectores en los dos sitios.
3. **La misma estructura donde el CSS depende de ella.** Se mantienen los `id` y la anidación que usan los selectores (`#page-home section a[data-go]`, `.tl-item:nth-last-child(-n+2)`, `.cd-paso:nth-child(3)`, `.contacto-grid > div:first-child`, etc.). Cada página conserva su `<main id="page-…" class="page">` con su propio footer adentro.
4. **Mismas tipografías y mismos archivos.** Los 4 `.woff2` actuales con las mismas reglas `@font-face`. **No** se usa `next/font` durante la paridad.
5. **Mismas imágenes y encuadres.** Las mismas fotos, con el mismo `object-fit` y `object-position`. **No** se usa `next/image` durante la paridad: `<img>` común con los mismos atributos. La optimización de imágenes se hace en la Etapa 6, con verificación aparte.
6. **Los SVG se copian carácter por carácter** (íconos del objeto `ICO`, la cinta de la cadena, los íconos del header y del footer). Sólo cambia la sintaxis JSX (`stroke-width` → `strokeWidth`).
7. **Mismos breakpoints:** `1024px` (tablet) y `720px` (celular), con las mismas reglas adentro.
8. **Mismo comportamiento visible:** estados hover y foco, animaciones y sus tiempos, carruseles automáticos, globos de la línea de tiempo, menú móvil, bloqueo de scroll con el modal abierto, teclas ← → Esc en el modal.
9. **Textos tal cual** (regla 1 del plan), incluidos mayúsculas, signos y `<strong>`/`<em>`.
10. **Toda diferencia visual intencional se anota** en la tabla [Diferencias visuales aprobadas](#diferencias-visuales-aprobadas) al final de esta guía, con quién la aprobó. Si no está en la tabla, es un error.

### Tres trampas conocidas de esta migración

- **El "preflight" de Tailwind cambia el diseño.** Tailwind trae un reset que les saca los márgenes a `h1`/`p`/`ul`, pone las imágenes en `display:block` y cambia los botones. El sitio actual **depende de los márgenes por defecto del navegador**. Por eso Tailwind se importa **sin preflight** (ver paso 1.3).
- **Selectores que apuntan a estilos en línea.** Hay tres reglas en `index.html:450-452` del estilo `#home-products div[style*="letter-spacing:.07em"]`. Al pasar los estilos en línea a clases, esos selectores dejan de coincidir y hay que reescribirlos para que apunten a la clase nueva.
- **Estilos armados por JavaScript.** Varias partes (tarjetas, modal, pestañas del formulario en `index.html:2248`) arman sus estilos dentro de *template strings*. Se revisa cada función `pintar…()` completa, no sólo el HTML estático.

### Estrategia de estilos

1. **Primero se porta el CSS viejo casi textual** a archivos CSS por sección (`styles/sitio/*.css`), en la capa `components`.
2. **Los 371 estilos en línea pasan a clases con los mismos valores**, en esos mismos archivos (ej. `style="margin:0;font-size:78px;…"` del título del hero → `.hero-titulo{margin:0;font-size:78px;…}`).
3. Los colores repetidos pasan a los tokens de `@theme` (sección 4.6 del plan) **sólo si el valor es idéntico**.
4. Tailwind se usa para el código nuevo (el gestor, las páginas nuevas). Convertir el CSS portado a utilidades de Tailwind es **opcional** y queda para la Etapa 7, siempre con los tests visuales en verde.

---

## Cómo se vigila el diseño: tests visuales contra el sitio viejo

La herramienta central de toda la refactorización. Se arma en el paso 1.2 y se corre en **cada** paso a partir de ahí.

**Idea:** Playwright saca capturas del sitio viejo (congelado en `referencia/`) y las guarda como referencia. Después saca las mismas capturas del sitio nuevo y las compara píxel por píxel. Si difieren, el test falla y genera una imagen con las diferencias marcadas en rojo.

- Se captura cada página en **3 anchos**: escritorio (1440 px), tablet (1024 px) y celular (390 px).
- Además de la página completa, se capturan **estados**: menú móvil abierto, modal de producto abierto (con foto 1 y 2), globo de la línea de tiempo, hover en tarjeta, filtro de ocasión activo, pestaña "Compra por mayor" en contacto, y las pantallas del gestor.
- Para que las capturas sean comparables se **congela el tiempo**: reloj fijo en un día hábil a las 11:00 de Argentina (así "Abierto ahora" da siempre igual), carruseles automáticos detenidos y en su posición inicial, animaciones CSS desactivadas y `localStorage` vacío (datos de fábrica).
- También se compara el **texto visible** de cada página, viejo contra nuevo (regla 1).

**Regla de oro:** las capturas de referencia **sólo** se generan desde `referencia/`. **Nunca** se "actualiza la referencia" con capturas del sitio nuevo para hacer pasar un test. Si una diferencia es intencional, se anota en la tabla de diferencias aprobadas y se enmascara esa zona en el test.

**Tolerancias:**
- Diseño (con las fotos enmascaradas): estricta, `maxDiffPixelRatio: 0.002`.
- Fotos: más tolerante (`threshold: 0.2`), para absorber la recompresión cuando en la Etapa 6 se pase a AVIF/WebP.

---

## Etapa 0 — Preparación

### Paso 0.1 — Primer commit del estado actual

**Objetivo:** tener un punto de partida guardado en git antes de tocar nada.

- [ ] Crear `.gitignore` con: `node_modules/`, `.next/`, `.env*`, `!.env.example`, `test-results/`, `playwright-report/`, `_fuentes/`.
- [ ] **Antes de agregar `_fuentes/` al `.gitignore`**, confirmar que el material fuente tiene una copia fuera del repo (Drive, disco externo).
- [ ] `git add` de `index.html`, `img/`, `fonts/`, `fondo-hero.jpg`, los `.md` y el `.txt` del export.
- [ ] Crear el repositorio en GitHub (privado) y subir.

**Verificación:** `git log` muestra un commit; el repo en GitHub tiene los archivos.

**Commit:** `chore: estado inicial del sitio (index.html del 09/09/2026)`

### Paso 0.2 — Congelar el sitio actual como referencia

**Objetivo:** una copia intocable del sitio viejo contra la cual se compara todo.

- [ ] Crear `referencia/` y copiar ahí `index.html`, `img/`, `fonts/` y `fondo-hero.jpg`.
- [ ] Agregar `referencia/README.md`: "Copia congelada del sitio al 09/09/2026. **No editar.** Es la referencia de los tests visuales."
- [ ] Probar que se ve bien servida: `npx serve referencia -l 5500` → abrir `http://localhost:5500`.

**Verificación:** el sitio de `referencia/` se ve igual que el original en las 6 secciones (`#home`, `#nosotros`, `#catalogo`, `#locales`, `#contacto`, `#gestor`).

**Commit:** `chore: congelar sitio actual en referencia/`

### Paso 0.3 — Ordenar la carpeta raíz

**Objetivo:** dejar la raíz lista para el proyecto nuevo.

- [ ] **Pedir permiso** antes de mover cualquier archivo (regla 4 del plan).
- [ ] Mover a `_fuentes/` el material del cliente que no se publica: `FOTOS/`, `Premios ORDENADOS/`, `imagenes de INSTAGRAM/`, `Equipo/`, imágenes de WhatsApp, `Folleto Maitilac - con Lacteos & Cia.pdf`, `HISTORIA DE MAITILAC.docx`, `LOGO.jpeg`, `CLUSTER.jpeg`, `1.jpeg`, `2.jpeg`, `Copilot_*.png`, `tradicion que se hereda.jpeg`, `PARA ROSARIO - whatsapp.txt`, `catalogo-maitilac (1).txt`.
- [ ] Mover a `docs/`: `PLAN DE REFACTORIZACION.md`, `PASO A PASO.md`, `REGISTRO DE CAMBIOS.md`, `MANUAL DEL GESTOR.md`.
- [ ] Una vez verificado `referencia/`, sacar de la raíz `index.html`, `img/`, `fonts/` y `fondo-hero.jpg` (quedan en `referencia/` y en el historial de git).

**Verificación:** la raíz sólo tiene `.git/`, `.gitignore`, `docs/`, `referencia/` y `_fuentes/` (ignorada).

**Commit:** `chore: ordenar raíz (docs/, referencia/, _fuentes/ fuera del repo)`

### Paso 0.4 — Decisiones bloqueantes

- [ ] **D1b:** plan de VPS (RAM/disco), titular, dominio y dónde se administra el DNS.
- [ ] **D2:** emails de las personas con acceso al gestor.
- [ ] Anotar las respuestas en la sección 10 del plan.

**Verificación:** D1b y D2 figuran como resueltas en el plan. *(No bloquean las etapas 1 y 2: se puede avanzar mientras tanto.)*

---

## Etapa 1 — Proyecto base y sistema de verificación

### Paso 1.1 — Crear el proyecto Next.js

**Objetivo:** proyecto vacío corriendo en local.

Requisitos en la máquina: Node 22 LTS, pnpm, Docker, git.

- [ ] Crear el proyecto en una carpeta temporal y moverlo a la raíz (`create-next-app` no acepta carpetas con archivos):
  ```bash
  pnpm create next-app@latest _nuevo --ts --eslint --app --no-src-dir --import-alias "@/*" --use-pnpm
  rsync -a _nuevo/ ./ && rm -rf _nuevo
  ```
- [ ] Instalar Tailwind 4: `pnpm add -D tailwindcss @tailwindcss/postcss` y configurar `postcss.config.mjs`.
- [ ] Borrar el contenido de ejemplo de `app/page.tsx` y `app/globals.css`.
- [ ] En `next.config.ts`: `output: 'standalone'`.
- [ ] Prettier y ESLint configurados; script `pnpm lint`.

**Verificación:** `pnpm dev` levanta en `http://localhost:3000` una página en blanco sin errores; `pnpm build` termina bien.

**Commit:** `chore: crear proyecto Next.js 16 + TypeScript + Tailwind 4`

### Paso 1.2 — Tests visuales (el vigilante del diseño)

**Objetivo:** poder comparar automáticamente el sitio nuevo contra `referencia/`.

- [ ] `pnpm add -D @playwright/test serve` y `pnpm exec playwright install chromium`.
- [ ] Crear `tests/visual/rutas.ts` con el mapa de páginas viejas → nuevas:
  ```ts
  export const RUTAS = [
    { nombre: 'inicio',   vieja: '/#home',     nueva: '/' },
    { nombre: 'nosotros', vieja: '/#nosotros', nueva: '/nosotros' },
    { nombre: 'catalogo', vieja: '/#catalogo', nueva: '/catalogo' },
    { nombre: 'locales',  vieja: '/#locales',  nueva: '/locales' },
    { nombre: 'contacto', vieja: '/#contacto', nueva: '/contacto' },
  ];
  export const ES_REFERENCIA = process.env.REFERENCIA === '1';
  ```
- [ ] Crear `playwright.config.ts` con 3 proyectos (todos en Chromium, para que la comparación sea justa):
  ```ts
  import { defineConfig } from '@playwright/test';
  export default defineConfig({
    testDir: './tests/visual',
    snapshotPathTemplate: '{testDir}/__referencia__/{arg}-{projectName}{ext}',
    expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' } },
    use: { baseURL: process.env.REFERENCIA === '1' ? 'http://localhost:5500' : 'http://localhost:3000' },
    projects: [
      { name: 'escritorio', use: { viewport: { width: 1440, height: 900 } } },
      { name: 'tablet',     use: { viewport: { width: 1024, height: 1366 } } },
      { name: 'celular',    use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    ],
  });
  ```
- [ ] Crear `tests/visual/preparar.ts` con una función `prepararPagina(page, ruta)` que:
  1. Instala el reloj falso de Playwright en un día hábil a las 10:59 (hora de Argentina) y lo pausa a las 11:00.
  2. Vacía `localStorage` con `addInitScript` (así el sitio viejo usa los datos de fábrica).
  3. Navega a `ruta.vieja` o `ruta.nueva` según `ES_REFERENCIA`.
  4. Espera a que carguen las fuentes (`document.fonts.ready`) y todas las imágenes.
  5. Vuelve los carruseles a su posición inicial (`.tl-carrusel`, `#premios-carrusel` → `scrollLeft = 0`). Por eso el sitio nuevo **tiene que conservar esas clases e id**.
- [ ] Crear `tests/visual/paginas.spec.ts`: para cada ruta, una captura de página completa con las fotos enmascaradas (tolerancia estricta) y otra sin máscara (tolerancia `threshold: 0.2`).
- [ ] Crear `tests/visual/textos.spec.ts`: guarda `document.body.innerText` de cada página y lo compara entre viejo y nuevo.
- [ ] Scripts en `package.json`:
  ```json
  "ref:servir": "serve referencia -l 5500",
  "ref:capturar": "REFERENCIA=1 playwright test --update-snapshots",
  "test:visual": "playwright test"
  ```
- [ ] Generar las referencias: `pnpm ref:servir` en una terminal y `pnpm ref:capturar` en otra.
- [ ] **Revisar a ojo las capturas generadas** en `tests/visual/__referencia__/`: que no haya fuentes sin cargar, carruseles corridos ni recuadros vacíos.
- [ ] Correr `pnpm ref:capturar` dos veces seguidas y confirmar que las capturas no cambian (si cambian, algo no quedó congelado).

**Verificación:** existen las capturas de referencia de las 5 páginas × 3 anchos; son estables entre corridas; `pnpm test:visual` contra el sitio nuevo (vacío) **falla**, como corresponde.

**Commit:** `test: tests visuales y de texto contra el sitio de referencia`

> Los estados (modal, menú, globo, etc.) y el gestor se suman como tests en los pasos donde se construye cada cosa, **siempre generando primero la captura desde `referencia/`**.

### Paso 1.3 — Estilos base, tokens y tipografías

**Objetivo:** la base visual idéntica: fuentes, colores de fondo, tamaños de texto por defecto.

- [ ] Copiar los 4 `.woff2` de `referencia/fonts/` a `public/fonts/`.
- [ ] `app/globals.css` — Tailwind **sin preflight**:
  ```css
  @layer theme, base, components, utilities;
  @import "tailwindcss/theme.css" layer(theme);
  @import "tailwindcss/utilities.css" layer(utilities);
  ```
- [ ] Bloque `@theme` con los tokens de la sección 4.6 del plan (valores idénticos).
- [ ] Portar **textualmente** de `referencia/index.html:17-47` las reglas `@font-face`, la base (`*`, `html`, `body`, `a`, `.serif`, `img`, inputs, botones), `.ph`, los `@keyframes`, `.wrap` y `.hidden`.
- [ ] Crear `styles/sitio/` con un archivo por sección (`header.css`, `tarjetas.css`, `historia.css`, `cadena.css`, `grillas.css`, `botones.css`, `contacto.css`, `footer.css`, `responsive.css`) e importarlos en `globals.css` dentro de `@layer components`. De momento, vacíos.

**Verificación:** una página de prueba con un `h1.serif`, un párrafo y un enlace se ve con las mismas fuentes, colores y márgenes que en el sitio viejo (comparar lado a lado con DevTools: estilos computados iguales).

**Commit:** `feat: estilos base, tokens y tipografías (sin preflight)`

### Paso 1.4 — Layout, header y menú móvil

**Objetivo:** header idéntico en los 3 anchos, con el menú hamburguesa funcionando.

Fuente: markup `index.html:477-495`, CSS `index.html:49-60` y reglas del header en los `@media`; lógica `irA()` en `index.html:1719` y el botón `#burger`.

- [ ] Portar a `styles/sitio/header.css` todas las reglas de `header`, `.hdr`, `nav`, `.navlink`, `.btn-contacto`, `.ig-circle`, `.burger` (incluidas las de `@media (max-width:720px)`).
- [ ] `components/sitio/Header.tsx` con el mismo markup, clases e íconos SVG.
- [ ] `components/sitio/NavMovil.tsx` (`'use client'`): abre y cierra `nav.open`, actualiza `aria-expanded` y se cierra al navegar.
- [ ] Enlace activo (`.navlink.on`) según `usePathname()`.
- [ ] `app/layout.tsx`: `<html lang="es">`, `<title>` y `description` idénticos a los actuales, favicon `img/logo-tandil-2.png`.
- [ ] Test visual del header solo (`locator('header').screenshot`) y del menú móvil abierto (captura de referencia primero).

**Verificación:** `pnpm test:visual` pasa para el header en los 3 anchos y para el menú abierto en celular.

**Commit:** `feat: layout, header y menú móvil`

### Paso 1.5 — Footers

Fuente: `FOOTER_HTML` en `index.html:1779`, CSS `.foot-*`, footer claro de Nosotros en `index.html:758-800`.

- [ ] `components/sitio/FooterOscuro.tsx` (con el enlace al gestor **por ahora**, para mantener la paridad; se quita en la Etapa 5).
- [ ] `components/sitio/FooterClaro.tsx`.
- [ ] Tests visuales de los dos footers.

**Verificación:** los dos footers pasan en los 3 anchos.

**Commit:** `feat: footers oscuro y claro`

---

## Etapa 2 — Páginas públicas con datos locales (paridad visual pura)

En esta etapa **no hay base de datos**: los datos salen de archivos JSON extraídos del sitio viejo. Así, si algo se ve distinto, el problema es del diseño y no de los datos. La base se conecta en la Etapa 3.

### Paso 2.1 — Extraer los datos del sitio viejo

**Objetivo:** tener los datos de fábrica en JSON, **sin copiarlos a mano**.

- [ ] Script `scripts/extraer-datos.ts` que abre `referencia/` con Playwright (con `localStorage` vacío) y ejecuta:
  ```ts
  const datos = await page.evaluate(`({ CONFIG, ANUNCIOS_BASE, COLORES, PRODUCTOS_BASE,
    OCASIONES_BASE, HISTORIA, FOTOS_HISTORIA, FOTOS_HOY, LOCALES, PASOS, EQUIPO_BASE,
    PREMIOS_BASE, INSTA })`);
  ```
  y guarda cada constante en `data/<nombre>.json`.
- [ ] Tipos TypeScript para cada estructura en `lib/tipos.ts`.
- [ ] Copiar `referencia/img/` y `referencia/fondo-hero.jpg` a `public/` con las mismas rutas (`/img/...`, `/fondo-hero.jpg`).

**Verificación:** los JSON tienen exactamente 12 productos, 7 ocasiones, 9 hitos, 2 locales, 9 personas, 11 premios y 6 fotos de Instagram; un test compara los textos del JSON con los que muestra `referencia/`.

**Commit:** `chore: extraer datos de fábrica del sitio viejo a JSON`

### Paso 2.2 — Componentes compartidos

Fuente: objeto `ICO` en `index.html:1701-1709`, `tarjetaHTML()` en `index.html:1811`, `precioVisible()` en `index.html:1468`, CSS `.card`, `.chip*`, `.precio`, `.btn-*`, `.badge`, `.navimg`, `.grid-*`.

- [ ] `components/sitio/Icono.tsx` con los SVG de `ICO` copiados textualmente.
- [ ] `lib/precio.ts` con la misma lógica de `precioVisible()` y el mismo formato de salida que hoy.
- [ ] `components/sitio/TarjetaProducto.tsx` (`'use client'` sólo por el carrusel de fotos) reproduciendo `tarjetaHTML()` **completa**, incluidos los estilos armados en el template string.
- [ ] Portar CSS de tarjetas, grillas y botones.
- [ ] Reescribir los selectores `div[style*=…]` de `index.html:450-452` para que apunten a las clases nuevas.

**Verificación:** página de prueba con las 12 tarjetas en grilla; se compara contra una captura de referencia de la grilla del catálogo en los 3 anchos.

**Commit:** `feat: componentes compartidos (iconos, tarjeta de producto, precio)`

### Paso 2.3 — Página de Inicio

Fuente: markup `index.html:497-629`; `pintarAnuncios()` 1746, `pintarDestacados()` 1844, `pintarLocalesHome()` 1897, `actualizarAbierto()` 1934; Instagram con `INSTA`.

Construir y verificar **sección por sección**, en este orden:

- [ ] Barra de anuncio + badges del hero (colores de `COLORES`, visibilidad con `ver`).
- [ ] Hero: foto de fondo, velo, textos; en celular, `object-position: center 72%` y el degradado propio.
- [ ] Cifras (texto tal cual, incluido "8 Variedades").
- [ ] Productos destacados (`.grid-centrada`, centrado si la fila queda incompleta).
- [ ] Nuestra Historia (bloque resumen).
- [ ] Nuestros Locales (resumen) con `<AbiertoAhora>`: la misma lógica que `actualizarAbierto()` y refresco cada 60 s.
- [ ] Seguinos en Instagram.
- [ ] Footer oscuro.
- [ ] Tests de estado: hover en tarjeta; flechas del carrusel de una tarjeta (foto 2).

**Verificación:** `pnpm test:visual` pasa para `inicio` en los 3 anchos (página completa y estados); `textos.spec` pasa para `inicio`.

**Commit:** un commit por sección, ej. `feat(inicio): hero y barra de anuncio`

### Paso 2.4 — Página Nosotros

Fuente: markup `index.html:631-803`; `pintarHistoria()` 1959, `pintarFotosHistoria()` 1976 y `moverCarrusel()` 2004, `pintarEquipo()` 2050, `pintarPremios()` 2072 y `girar()` 2105; CSS de línea de tiempo `index.html:76-128` y de cadena `index.html:130-150`.

- [ ] Encabezado y relato (`.tl-relato`, `.tl-lema`, `.tl-pregunta`, `.tl-destacado`, `.tl-cierre`, `.tl-ayuda`), texto tal cual.
- [ ] Línea de tiempo: años, puntos, año activo, **globos al pasar el mouse** (los dos últimos abren hacia arriba) y el cambio de panel al hacer clic.
- [ ] Los dos carruseles automáticos en sentidos opuestos, con la misma velocidad que `moverCarrusel()`. Pausa al pasar el mouse si el viejo la tiene.
- [ ] Proceso productivo (`PASOS`).
- [ ] Cadena de producción: la cinta SVG de fondo copiada textual, los 6 pasos con sus desfases (`nth-child`), el hover que los levanta y las 2 columnas en celular.
- [ ] Equipo (`.grid-centrada-3`); los que no tienen foto muestran el placeholder rayado con el nombre.
- [ ] Premios: carrusel con la misma animación de `girar()`; la sección desaparece si no hay premios visibles.
- [ ] Cluster Quesero y footer claro.
- [ ] Tests de estado: globo de un año del medio, globo del último año, otro año seleccionado, hover en un paso de la cadena.

**Verificación:** `pnpm test:visual` y `textos.spec` pasan para `nosotros`; revisión a ojo de la velocidad de los carruseles, lado a lado con `referencia/`.

**Commit:** un commit por sección.

### Paso 2.5 — Página Catálogo y modal de producto

Fuente: markup `index.html:804-848`; `contarOcasion()` 2116, `pintarFiltros()` 2120, `pintarCatalogo()` 2136, `abrirModal()`/`cerrarModal()`/`pintarModal()` 2173-2247 y los manejadores de teclado.

- [ ] Encabezado oscuro del catálogo.
- [ ] Producto del mes: **por ahora con el mismo contenido fijo que hoy** (Holanda, `$4800`, `holanda-1.jpg`). Pasa a ser dinámico en la Etapa 3, sin cambiar el diseño.
- [ ] Filtros por ocasión: activo, inactivo, deshabilitado (gris, sin clic) cuando no tienen productos visibles; mismo comportamiento al tocar dos veces el mismo filtro.
- [ ] Grilla (`#catalogo-grid`, `.grid-4`).
- [ ] Modal como *intercepting route* (`app/(sitio)/catalogo/@modal/(.)[slug]`): mismo markup que `pintarModal()`, galería con flechas y teclas ← → Esc, bloqueo del scroll del `body`, cierre al hacer clic en el fondo, botón de WhatsApp con el mismo mensaje prearmado.
- [ ] Página `/catalogo/[slug]` (nueva, no existe en el sitio viejo): reutiliza el contenido del modal dentro del layout normal. **Anotarla en la tabla de diferencias aprobadas.**
- [ ] Tests de estado: filtro "Sale picadita" activo, modal de Gouda abierto (foto 1 y foto 2), modal en celular.

**Verificación:** `pnpm test:visual` y `textos.spec` pasan para `catalogo` y sus estados; con el modal abierto, "atrás" en el navegador lo cierra.

**Commit:** un commit por bloque (filtros, grilla, modal).

### Paso 2.6 — Página Locales

Fuente: markup `index.html:849-954`.

- [ ] Las dos tarjetas de local (Maipú y Avellaneda) con `<AbiertoAhora>`.
- [ ] Indicaciones generales.
- [ ] En esta etapa, direcciones y horarios **tal como están escritos en el HTML**; se unifican con los datos de `LOCALES` en la Etapa 3.

**Verificación:** `pnpm test:visual` y `textos.spec` pasan para `locales`.

**Commit:** `feat(locales): página de locales`

### Paso 2.7 — Página Contacto

Fuente: markup `index.html:955-1105`; `pintarTabs()` 2248 y el `submit` del formulario (sección "Contacto: pestañas y envío por WhatsApp").

- [ ] Las tres columnas (`.contacto-grid`, formulario al medio en escritorio y abajo en celular).
- [ ] Canales "Compras en el local" y "Compras por mayor", y redes sociales.
- [ ] `<FormContacto>`: pestañas con los mismos estilos, texto de ayuda según la pestaña, "Pedir presupuesto mayorista" que cambia la pestaña y hace scroll, y armado del mensaje de WhatsApp **idéntico** al actual, al número que corresponde.
- [ ] Tests de estado: pestaña "Compra por mayor" activa. Test funcional: el enlace de WhatsApp generado es igual en el viejo y en el nuevo para los mismos datos.

**Verificación:** `pnpm test:visual`, `textos.spec` y el test del mensaje de WhatsApp pasan.

**Commit:** `feat(contacto): página de contacto y formulario por WhatsApp`

### Paso 2.8 — Enlaces viejos y cierre de la etapa

- [ ] Script en el layout que redirige los hashes viejos: `/#home` → `/`, `/#nosotros` → `/nosotros`, etc.; `/#gestor` → `/gestor`.
- [ ] Todos los `data-go` del sitio viejo pasan a `<Link href>`; ningún enlace interno usa `#`.
- [ ] Pasada completa: `pnpm test:visual` **entero** en verde.
- [ ] Revisión manual lado a lado (`referencia/` y sitio nuevo) en un celular real y en una tablet: scroll, toques, menú, modal, carruseles.

**Verificación:** suite completa en verde y revisión manual sin diferencias. **Recién ahí se pasa a la Etapa 3.**

**Commit:** `feat: redirección de enlaces viejos; cierre de paridad visual`

---

## Etapa 3 — Base de datos

A partir de acá, el criterio para cada paso es: **los tests visuales tienen que seguir exactamente igual que al cerrar la Etapa 2.** Cambiar de dónde salen los datos no puede cambiar ni un píxel.

### Paso 3.1 — Postgres local con Docker

- [ ] `infra/docker-compose.dev.yml` con `postgres:17`, volumen persistente y *healthcheck*.
- [ ] `.env.example` con `DATABASE_URL`; `.env` local (no se sube).
- [ ] `pnpm add drizzle-orm postgres` y `pnpm add -D drizzle-kit`.

**Verificación:** `docker compose -f infra/docker-compose.dev.yml up -d` levanta la base y `pnpm drizzle-kit studio` se conecta.

**Commit:** `chore: Postgres local y Drizzle`

### Paso 3.2 — Esquema y migraciones

- [ ] `db/schema.ts` con las tablas de la sección 4.3 del plan (menos las de autenticación, que van en la Etapa 5).
- [ ] `pnpm drizzle-kit generate` y revisar el SQL generado.
- [ ] Aplicar con `pnpm drizzle-kit migrate`.

**Verificación:** las tablas existen con sus claves, `check` y relaciones.

**Commit:** `feat(db): esquema inicial`

### Paso 3.3 — Importación de datos

Ver la sección 6 del plan.

- [ ] `db/importar/index.ts` que lee `data/*.json` e inserta todo: slugs, relaciones por id, precio descompuesto y orden.
- [ ] Las fotos en esta etapa se registran en `fotos` **apuntando a los mismos archivos originales** de `public/img/`. Las variantes AVIF/WebP se generan en la Etapa 6.
- [ ] Informe final por consola (filas por tabla, fotos no encontradas, nombres sin relacionar).
- [ ] Idempotente: correrlo dos veces no duplica nada.

**Verificación:** el informe no muestra errores; los conteos coinciden con el paso 2.1.

**Commit:** `feat(db): importación de datos de fábrica`

### Paso 3.4 — Pasar las páginas a la base, una por una

- [ ] `lib/queries.ts` con una función por necesidad (`productosDestacados`, `catalogo`, `ocasionesVisibles`, `premiosVisibles`, `equipoVisible`, `locales`, `anuncios`, `config`), que devuelvan **la misma forma** que los JSON.
- [ ] Reemplazar los JSON por las consultas, **de a una página**, corriendo `pnpm test:visual` después de cada una.
- [ ] Producto del mes: pasa a salir del producto con `producto_del_mes = true`. Marcar Holanda en la importación para que se vea igual.
- [ ] Locales: la página y el resumen del Inicio salen de la tabla `locales`, con los textos de horario tal cual se mostraban.
- [ ] Borrar `data/*.json` sólo cuando ninguna página los use (los conserva el script de importación en `db/importar/data/`).

**Verificación:** suite visual y de textos **idéntica** al cierre de la Etapa 2.

**Commit:** un commit por página, ej. `refactor(catalogo): leer de la base`

### Paso 3.5 — Caché

- [ ] Activar `cacheComponents` en `next.config.ts` y marcar las consultas con `'use cache'` + `cacheTag('<entidad>')`.
- [ ] Verificar la API exacta de caché en la documentación de la versión de Next instalada.
- [ ] Probar a mano: cambiar un precio en la base, invalidar la etiqueta y ver el cambio al recargar.

**Verificación:** con la caché activa, la segunda carga de cada página no consulta la base (ver logs); después de invalidar, el cambio aparece.

**Commit:** `feat: caché por entidad`

---

## Etapa 4 — Servidor y publicación de prueba

*Se puede hacer en paralelo a las etapas 2 y 3 si D1b ya está resuelta. Conviene tenerla lista antes de mostrarle avances al cliente.*

### Paso 4.1 — Preparar el VPS

En el panel de Hostinger: instalar **Ubuntu 24.04** y cargar tu clave SSH pública.

- [ ] Usuario sin privilegios de root:
  ```bash
  adduser deploy && usermod -aG sudo deploy
  rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
  ```
- [ ] En `/etc/ssh/sshd_config`: `PermitRootLogin no` y `PasswordAuthentication no`; `systemctl restart ssh`. **Probar el acceso con `deploy` en otra terminal antes de cerrar la sesión de root.**
- [ ] Firewall: `ufw allow OpenSSH && ufw allow 80,443/tcp && ufw enable`.
- [ ] `apt install -y fail2ban unattended-upgrades`.
- [ ] Docker: `curl -fsSL https://get.docker.com | sh` y `usermod -aG docker deploy`.
- [ ] **Ojo:** Docker salta las reglas de `ufw` para los puertos que publica. Sólo Caddy publica puertos (80 y 443); Postgres y la app **no** publican ninguno.

**Verificación:** `ssh deploy@<ip>` entra con clave; `ssh root@<ip>` es rechazado; `ufw status` muestra sólo 22, 80 y 443.

### Paso 4.2 — DNS y Caddy

- [ ] Registro `A` de `nuevo.<dominio>` apuntando a la IP del VPS.
- [ ] `infra/Caddyfile`:
  ```
  nuevo.<dominio> {
    encode zstd gzip
    handle_path /fotos/* {
      root * /data/fotos
      header Cache-Control "public, max-age=31536000, immutable"
      file_server
    }
    reverse_proxy app:3000
  }
  ```

### Paso 4.3 — Docker de producción

- [ ] `Dockerfile` multi-etapa: instala dependencias, hace `pnpm build` y copia la salida `standalone`. Al arrancar, corre las migraciones y después `node server.js`.
- [ ] `infra/docker-compose.yml` con tres servicios: `app` (imagen de GHCR, `restart: unless-stopped`, volúmenes `fotos` y `cache-next`), `db` (`postgres:17`, volumen, *healthcheck*) y `caddy` (puertos 80/443, `Caddyfile`, volumen de certificados y `fotos` de sólo lectura).
- [ ] En el VPS: `/srv/maitilac/` con `docker-compose.yml`, `Caddyfile` y `.env` (permisos `600`).

### Paso 4.4 — Deploy automático

- [ ] `.github/workflows/ci.yml`: lint, tests unitarios y visuales en cada *pull request*.
- [ ] `.github/workflows/deploy.yml` en cada push a `main`: build de la imagen → push a GHCR → SSH al VPS → `docker compose pull app && docker compose up -d`.
- [ ] Secretos en GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`. En el VPS, `docker login ghcr.io` con un token de sólo lectura de paquetes.
- [ ] Primer deploy y `pnpm db:importar` dentro del contenedor.

**Verificación:** `https://nuevo.<dominio>` abre con HTTPS válido; correr `pnpm test:visual` apuntando a esa URL da el mismo resultado que en local.

**Commit:** `ci: deploy automático al VPS`

### Paso 4.5 — Copias de seguridad

- [ ] `infra/backup.sh`: `pg_dump` comprimido + archivo del volumen de fotos, con rotación (7 diarias, 4 semanales).
- [ ] Cron del usuario `deploy`: `0 3 * * * /srv/maitilac/backup.sh`.
- [ ] Activar los snapshots semanales en el panel de Hostinger.

**Verificación:** al día siguiente hay un backup; se restaura en la base local y el sitio local se ve igual.

**Commit:** `ops: backups diarios`

---

## Etapa 5 — Gestor

**El gestor también conserva su diseño actual** (las clases `.g-*` de `index.html:211-342`). De shadcn/ui se usan sólo las piezas de comportamiento (diálogo, panel lateral, foco accesible), con los estilos del gestor viejo. Antes de cada pantalla se generan sus capturas de referencia desde `referencia/#gestor`.

### Paso 5.1 — Login y protección

- [ ] Better Auth con email y contraseña y el registro público desactivado; tablas generadas por su CLI y migración.
- [ ] Script `pnpm gestor:crear-usuario <email>` (según la documentación vigente de Better Auth para crear usuarios con el registro desactivado).
- [ ] `/gestor/login` con los colores y tipografías del gestor.
- [ ] `app/gestor/layout.tsx` verifica la sesión y, si no hay, redirige al login.
- [ ] Helper `requerirSesion()` que **cada** Server Action llama en su primera línea.
- [ ] Límite de intentos de login.

**Verificación:** sin sesión, `/gestor` redirige al login; test automatizado que llama a una Server Action sin sesión y recibe error.

**Commit:** `feat(gestor): login y protección de rutas y acciones`

### Paso 5.2 — Estructura y estilos del gestor

Fuente: markup `index.html:1106-1279`; `gAvisar()` 2316.

- [ ] Portar el CSS `.g-*` a `styles/gestor.css`.
- [ ] Encabezado marrón (`.g-hdr`) con los botones "Nuevo producto", "Exportar" (pasa a ser "Descargar copia de seguridad") y "Ver el sitio".
- [ ] Aviso flotante (`.g-aviso`) con los mismos textos que hoy.
- [ ] Test visual del encabezado y del gestor vacío contra la referencia.

**Commit:** `feat(gestor): estructura y estilos`

### Paso 5.3 a 5.9 — Pantallas, una por paso

Para **cada** pantalla, el mismo ciclo:

1. Generar capturas de referencia de ese bloque desde `referencia/#gestor`.
2. Construir la pantalla con el mismo markup y clases.
3. Server Action por operación, con `requerirSesion()`, validación Zod, escritura en la base e invalidación de la caché de esa entidad.
4. Test visual del bloque + test funcional: editar, guardar y ver el cambio en el sitio público.

| Paso | Pantalla | Fuente en `index.html` | Detalle |
|---|---|---|---|
| 5.3 | Anuncios | 2329–2394 | Texto, visibilidad, color, vista previa en vivo, cartel apagado descolorido |
| 5.4 | Config y Locales | *(nueva)* | WhatsApp, email, redes, direcciones y horarios. No existe en el gestor viejo: **anotar en diferencias aprobadas** |
| 5.5 | Premios | 2554–2632 | Edición en línea (se guarda al salir del campo), foto, ocultar, ordenar, agregar, eliminar |
| 5.6 | Equipo | 2633–2708 | Igual que premios, con foto redonda |
| 5.7 | Ocasiones | 2431–2553 | Renombrar, activar, marcar productos, contador, estado "Apagado — sin quesos visibles" |
| 5.8 | Productos | 2709–2973 | Lista, buscador, filtros, panel lateral, destacar, producto del mes, ocultar, ordenar, eliminar (borrado lógico) |
| 5.9 | Banco de fotos | *(registro §24)* | Todas las fotos, a qué productos pertenecen, "sin asignar", asignar y crear producto desde una foto |

- [ ] 5.3 Anuncios
- [ ] 5.4 Config y Locales
- [ ] 5.5 Premios
- [ ] 5.6 Equipo
- [ ] 5.7 Ocasiones
- [ ] 5.8 Productos
- [ ] 5.9 Banco de fotos

**Ordenar:** en esta etapa se mantienen **las flechas ▲▼ / ◀▶ igual que hoy** (paridad). Arrastrar y soltar se agrega en la Etapa 7.

**Subida de fotos:** en esta etapa, la foto se guarda en el volumen de fotos reducida a 1000 px (como `gAchicar()`) y se registra en `fotos`. Las variantes AVIF/WebP llegan en la Etapa 6.

### Paso 5.10 — Copia de seguridad y cierre del gestor

- [ ] "Descargar copia de seguridad": JSON con **todas** las tablas, incluido el equipo.
- [ ] Quitar el enlace "Gestor del catálogo" del footer público. **Anotar en diferencias aprobadas.**
- [ ] Crear los usuarios de D2 en el VPS.
- [ ] Prueba de punta a punta: una persona edita desde una computadora y el cambio se ve **al instante** en un celular.

**Verificación:** checklist de paridad del gestor (sección 1.3 del plan) completo.

**Commit:** `feat(gestor): copia de seguridad; cierre de la etapa`

---

## Etapa 6 — Calidad y lanzamiento

Las mejoras de esta etapa tienen que ser **invisibles**. Si alguna cambia el diseño (por ejemplo, un contraste que no llega a AA), no se aplica acá: se anota como propuesta para la Etapa 7.

### Paso 6.1 — Imágenes optimizadas

- [ ] `lib/imagenes.ts` con sharp: genera variantes AVIF/WebP en 400, 800 y 1600 px.
- [ ] Script que genera las variantes de todas las fotos ya cargadas.
- [ ] `<Foto>` con `<picture>`, `srcset` y `sizes`, **con los mismos estilos y encuadre** que el `<img>` actual; `loading="lazy"` en todas salvo el hero.
- [ ] Las subidas nuevas del gestor pasan a generar variantes.

**Verificación:** test visual con fotos enmascaradas: estricto y en verde. Test sin máscara: dentro de la tolerancia de fotos. Revisión a ojo de 5 fotos grandes.

### Paso 6.2 — SEO

- [ ] `sitemap.ts`, `robots.ts` (bloquea `/gestor`).
- [ ] `generateMetadata` por página y Open Graph; textos sacados del contenido existente, sin inventar (regla 3).
- [ ] JSON-LD `LocalBusiness` por local y `Product` por producto.

### Paso 6.3 — Accesibilidad y rendimiento

- [ ] Navegación completa con teclado: menú, filtros, modal, carruseles, formulario, gestor.
- [ ] `prefers-reduced-motion` detiene los carruseles automáticos.
- [ ] Lighthouse móvil ≥ 90 en todas las páginas públicas.

### Paso 6.4 — Tests finales

- [ ] Vitest: `horarios`, `precio`, conteo de ocasiones, slugs y esquemas Zod.
- [ ] Playwright funcional: navegación, filtros, modal, mensaje de WhatsApp y edición en el gestor.
- [ ] Suite visual completa en verde en CI.

### Paso 6.5 — Documentación

- [ ] Reescribir `docs/MANUAL DEL GESTOR.md` para el gestor nuevo: login, Banco de fotos, Config y Locales; sacar Categorías.
- [ ] `docs/OPERACION.md`: deploy, backups, restauración y alta de usuarios.
- [ ] Entrada en `REGISTRO DE CAMBIOS.md` con la migración.

### Paso 6.6 — Lanzamiento

- [ ] Pedirle al cliente un último "Exportar" del sitio viejo e importarlo si tiene cambios (sección 6 del plan).
- [ ] Prueba de restauración de backup, completa.
- [ ] Revisión final del cliente en `nuevo.<dominio>`.
- [ ] Apuntar el dominio definitivo al VPS y sumarlo al `Caddyfile`.
- [ ] Redirigir `nuevo.<dominio>` al dominio definitivo.
- [ ] Control posterior al lanzamiento: suite visual contra el dominio definitivo, formulario, WhatsApp y login del gestor.

**Verificación:** el sitio está en el dominio definitivo, con todos los tests en verde.

---

## Etapa 7 — Pulido de funcionalidades

Con la paridad lograda, se mejora **de a una funcionalidad por vez**. Cada mejora sigue este ciclo:

1. **Propuesta:** qué cambia, por qué y cómo se ve (captura o boceto si cambia algo visible).
2. **Aprobación** del cliente. Si cambia el diseño, se anota en la tabla de diferencias aprobadas.
3. **Rama propia** (`mejora/<nombre>`).
4. **Implementación + tests.** Si cambia el diseño, se genera una captura de referencia **nueva y aprobada** sólo para esa zona.
5. **Revisión en `nuevo.<dominio>`** o en una URL de preview.
6. **Merge**, deploy y entrada en `REGISTRO DE CAMBIOS.md`.

### Backlog inicial

Ordenado por valor para el cliente. Se reordena según lo que se decida en cada revisión.

| # | Mejora | Origen | Estado |
|---|---|---|---|
| 1 | Arrastrar y soltar para ordenar listas en el gestor (manteniendo las flechas) | Plan §3 | Pendiente |
| 2 | Precio numérico con formato automático o texto libre | D3 | A decidir |
| 3 | Guardar consultas del formulario y/o enviarlas por email | D4 | A decidir |
| 4 | Historial de cambios / restaurar versiones anteriores | D5 | A decidir |
| 5 | Historia, proceso y cifras editables desde el gestor | D6 | A decidir |
| 6 | Copia de backups fuera del VPS | D7 | A decidir |
| 7 | Resolver los datos heredados sin confirmar (8 Variedades, premio de Barra Tybo, redes, etc.) | Plan §10 | Consultar al cliente |
| 8 | Convertir el CSS portado a utilidades de Tailwind (sin cambio visual) | Estrategia de estilos | Opcional |
| 9 | Mejoras de accesibilidad que cambian el diseño (contraste, tamaños) | Paso 6.3 | Según revisión |

---

## Diferencias visuales aprobadas

Toda diferencia entre el sitio nuevo y `referencia/` tiene que estar en esta tabla. Si no está, es un error a corregir.

| Fecha | Dónde | Diferencia | Motivo | Aprobó |
|---|---|---|---|---|
| — | `/catalogo/[slug]` | Página nueva, no existe en el sitio viejo | URL propia por producto (SEO, compartir) | Pendiente |
| — | Gestor → Config y Locales | Pantalla nueva | Locales y datos de contacto editables (plan P5) | Pendiente |
| — | Footer público | Se quita el enlace "Gestor del catálogo" | Seguridad (plan P2) | Pendiente |
| — | Gestor → "Exportar" | Pasa a llamarse "Descargar copia de seguridad" | Ahora es un backup, ya no un archivo para pegar en el código | Pendiente |
| — | Gestor → acceso | Pantalla de login | Seguridad (plan P2) | Pendiente |
