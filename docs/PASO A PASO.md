# Paso a paso — Refactorización del sitio Maitilac

Guía operativa para ejecutar el [PLAN DE REFACTORIZACION.md](PLAN%20DE%20REFACTORIZACION.md) de a un paso por vez. El plan explica **qué** se construye y **por qué**; esta guía explica **cómo** y en qué orden, y sobre todo **cómo verificar que el diseño quede idéntico**.

> **Estado actual:** Etapas 0 a 3 terminadas. Etapa 5 (gestor) terminada salvo el Paso 5.10 (aprobar que se quite el enlace del footer, usuarios de D2, prueba en un celular con el sitio publicado). Etapa 6 hecha en lo que no depende del servidor. **Etapa 4 lista para publicar:** la publicación la hace el dueño del proyecto con [GUIA DE DEPLOY.md](GUIA%20DE%20DEPLOY.md) y `scripts/deploy.sh`. *(Actualizar esta línea al cerrar cada paso.)*

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

Se usan **capas CSS** (`@layer`) para reproducir exactamente la cascada del sitio viejo (ver `app/globals.css`):

```
@layer theme, sitio, en-linea, utilities;
```

1. **`sitio`: el CSS viejo portado textual**, en el mismo orden, repartido en `styles/sitio/*.css`. Cada archivo indica de qué líneas de `referencia/index.html` sale. *(Ya portado completo en el paso 1.3.)*
2. **`en-linea`: los 371 estilos en línea pasan a clases con los mismos valores**, en `styles/en-linea/*.css` (un archivo por página o componente). Ej.: `style="margin:0;font-size:78px;…"` del título del hero → `.hero-titulo{margin:0;font-size:78px;…}`. Por estar en una capa posterior, esas clases **les ganan a las reglas normales de `sitio` sin importar la especificidad**, igual que un `style=""`. Y los `!important` de `sitio` (el responsive) **les siguen ganando**, porque un `!important` de una capa anterior vence a todo lo que viene después. Es el mismo comportamiento que el sitio viejo.
3. Los **valores que dependen de datos** (colores de los anuncios, etc.) quedan como `style={{…}}` de React: son estilos en línea de verdad.
4. Los tokens de `@theme` (sección 4.6 del plan) se usan en el código nuevo. En el CSS portado se dejan los hex tal cual.
5. Tailwind (capa `utilities`) sólo para el código nuevo. Convertir el CSS portado a utilidades es **opcional** y queda para la Etapa 7, siempre con los tests visuales en verde.

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

- [x] Crear `.gitignore` (dependencias, builds, `.env*`, resultados de tests).
- [x] Commit con **todo** lo que había en la carpeta, incluido el material fuente del cliente. Así, cualquier movimiento posterior se puede deshacer con git y no hace falta una copia aparte.
- [ ] Crear el repositorio en GitHub (privado) y subir. *(Pendiente: se necesita para el deploy de la Etapa 4.)*

**Verificación:** `git log` muestra el commit `6f03af2`.

**Commit:** `chore: estado inicial del sitio (index.html del 09/09/2026)`

### Paso 0.2 — Congelar el sitio actual como referencia

**Objetivo:** una copia intocable del sitio viejo contra la cual se compara todo.

- [x] Mover (`git mv`) a `referencia/` los archivos `index.html`, `img/`, `fonts/` y `fondo-hero.jpg`.
- [x] Agregar `referencia/README.md` ("No editar").
- [ ] Probar que se ve bien servida: `pnpm ref:servir` → abrir `http://localhost:4500`. *(Se verifica en el paso 1.2, al generar las capturas.)*

**Verificación:** el sitio de `referencia/` se ve igual que el original en las 6 secciones (`#home`, `#nosotros`, `#catalogo`, `#locales`, `#contacto`, `#gestor`).

### Paso 0.3 — Ordenar la carpeta raíz

**Objetivo:** dejar la raíz lista para el proyecto nuevo.

- [x] Mover con `git mv` a `_fuentes/` el material del cliente que no se publica (fotos originales, diplomas, imágenes de WhatsApp, folleto, historia, mensajes, export). **Queda versionado en git**, pero fuera del build (`.dockerignore`, paso 4.3).
- [x] Mover a `docs/`: `PLAN DE REFACTORIZACION.md`, `PASO A PASO.md`, `REGISTRO DE CAMBIOS.md`, `MANUAL DEL GESTOR.md`.

**Verificación:** la raíz sólo tiene `.git/`, `.gitignore`, `docs/`, `referencia/` y `_fuentes/`.

**Commit:** `chore: congelar sitio en referencia/ y ordenar raíz`

### Paso 0.4 — Decisiones

- [x] **D1b:** VPS **KVM 2** de Hostinger (28/09/2026).
- [ ] **D1c:** dominio, titular y DNS. *(Antes de la Etapa 4.)*
  - Dominio **`maitilac.com`**, a nombre del cliente, registrado en **Squarespace**. El DNS se administra ahí (*Domains → maitilac.com → DNS → Registros personalizados*) (16/10/2026).
  - El correo es **Google Workspace**: los registros `MX` (`aspmx.l.google.com` y `alt1`–`alt4`), el `TXT` SPF (`v=spf1 include:_spf.google.com ~all`), el `TXT` `google._domainkey` (DKIM) y el `CNAME` `mgearcncxcjp` (verificación de Google) **no se tocan nunca**.
  - Falta saber dónde está publicado hoy el sitio viejo (registros `A`/`CNAME` de `@` y `www`).
- [ ] **D2:** emails de las personas con acceso al gestor. *(Antes del paso 5.10; mientras tanto, usuario de prueba.)*

---

## Etapa 1 — Proyecto base y sistema de verificación

### Paso 1.1 — Crear el proyecto Next.js ✅

**Objetivo:** proyecto vacío corriendo en local.

Requisitos en la máquina: Node 24 LTS o superior (local: Node 26 con nvm), pnpm (`npm i -g pnpm`; Node 25+ ya no trae corepack), Docker, git. La imagen de producción usa Node 24 LTS.

- [x] Proyecto creado con `create-next-app` (Next **16.3.6**, React 19.2, Tailwind 4.3, TypeScript, ESLint) en una carpeta temporal y movido a la raíz.
- [x] `next.config.ts`: `output: 'standalone'`.
- [x] Prettier (`.prettierrc.json`, `.prettierignore`) y `.dockerignore`.
- [x] ESLint ignora `referencia/` y `_fuentes/`, y tiene apagada la regla `no-img-element` durante la paridad.
- [x] Next genera `AGENTS.md`/`CLAUDE.md`: **esta versión de Next tiene cambios de API**. Antes de usar una API (caché, rutas interceptadas, etc.) leer su guía en `node_modules/next/dist/docs/`.

**Verificación:** `pnpm build` y `pnpm lint` sin errores.

### Paso 1.2 — Tests visuales (el vigilante del diseño) ✅

**Objetivo:** poder comparar automáticamente el sitio nuevo contra `referencia/`.

Archivos: `playwright.config.ts`, `tests/visual/preparar.ts`, `tests/visual/paginas.spec.ts`, `tests/visual/layout.spec.ts`. Capturas en `tests/visual/__referencia__/` (versionadas en git).

**Uso:**

```bash
pnpm ref:capturar   # genera las referencias desde referencia/ (levanta el servidor en :4500)
pnpm test:visual    # compara el sitio nuevo (levanta pnpm dev en :3000)
pnpm exec playwright show-report   # ver diferencias marcadas en rojo
```

Para correr una parte: `pnpm test:visual layout.spec.ts`, `pnpm test:visual -g "página inicio"`, `--project=celular`.

**Qué cubre:** 5 páginas × 3 anchos (escritorio 1440, tablet 1024, celular 390), cada una con 3 comprobaciones: *diseño* (fotos enmascaradas, estricta), *fotos* (tolerancia de color amplia) y *textos* (texto visible idéntico). Además: header, menú móvil abierto (sólo `#nav`), footer oscuro y footer claro.

**Cómo se estabilizan las capturas** (`preparar.ts`):
- Reloj falso: jueves 01/10/2026 a las 11:00 en `America/Argentina/Buenos_Aires`, pausado.
- `localStorage` vacío (datos de fábrica en el sitio viejo).
- Imágenes `lazy` forzadas a cargar; se esperan fuentes e imágenes.
- Carruseles en `scrollLeft = 0`. **No se puede usar la posición inicial real** de la fila de abajo (la mitad): al agrandar la ventana para la captura de página completa, el navegador reacomoda ese scroll a un valor que cambia entre corridas. En 0 no pasa, y como el contenido está duplicado se ve igual.
- Componentes con `capturarElemento()`: recorte con coordenadas redondeadas. La captura por locator de Playwright da 1 px de diferencia de alto según la posición con decimales del elemento en la página.
- `expect.timeout` de 20 s: las capturas grandes pueden tardar más de 5 s con 4 procesos en paralelo.

**Notas:**
- El puerto 5500 estaba ocupado (Live Server de VS Code): la referencia se sirve en el **4500**.
- Si una corrida se corta, puede quedar colgado el servidor de la referencia ocupando el puerto. Revisar con `ss -ltnp | grep 4500`.

**Verificación:** 3 corridas seguidas de `REFERENCIA=1 playwright test` sin fallas (las referencias son estables). Contra el sitio nuevo, los tests de páginas completas fallan hasta que se construya cada página.

### Paso 1.3 — Estilos base, tokens y tipografías ✅

- [x] Fuentes, `img/` y `fondo-hero.jpg` copiados a `public/` con las mismas rutas.
- [x] `app/globals.css`: capas, Tailwind **sin preflight**, `@font-face` con rutas absolutas y tokens en `@theme`.
- [x] **Todo el CSS viejo** (líneas 24–472) portado textual a `styles/sitio/` en 11 archivos, en el mismo orden. Script de control: no quedó ninguna línea sin portar.

**Verificación:** cubierta por los tests del header y los footers (fuentes, colores y márgenes idénticos).

### Paso 1.4 — Layout, header y menú móvil ✅

- [x] `components/sitio/Header.tsx` (cliente): mismo markup, clases e id; enlace activo con `usePathname()`; el menú se cierra al navegar.
- [x] `app/(sitio)/layout.tsx` con el header; páginas vacías de las 5 secciones, cada una con su `<main id="page-…" class="page">`.
- [x] `lib/config.ts`: los datos de `CONFIG`, provisorios hasta la Etapa 3.

**Verificación:** header en los 3 anchos y menú móvil abierto pasan contra la referencia.

### Paso 1.5 — Footers ✅

- [x] `FooterOscuro.tsx` (con el enlace al gestor hasta el paso 5.10) y `FooterClaro.tsx` (texto tal cual, incluido "con el trabajado de cada día").
- [x] Se conserva un comportamiento del sitio viejo: la grilla del footer claro está en un estilo en línea que le gana al responsive, así que **sigue en 4 columnas en tablet y celular**. Anotado como dato a revisar en el backlog de la Etapa 7.

**Verificación:** los dos footers pasan en los 3 anchos.

---

## Etapa 2 — Páginas públicas con datos locales (paridad visual pura) ✅

En esta etapa **no hay base de datos**: los datos salen de `data/*.json`, extraídos del sitio viejo. Así, si algo se ve distinto, el problema es del diseño y no de los datos. La base se conecta en la Etapa 3.

**Resultado:** las 5 páginas terminadas. La suite completa pasa contra `referencia/`: **110 tests** en los 3 anchos (páginas completas, textos, estados, navegación y consola sin errores).

### Herramienta clave: `scripts/html_a_jsx.py`

Convierte un rango de líneas de `referencia/index.html` a JSX y pasa cada `style=""` a una clase con los mismos valores, en la capa `en-linea`:

```bash
python3 scripts/html_a_jsx.py <desde> <hasta> <prefijo> --css styles/en-linea/<pagina>.css --jsx salida.jsx
```

Traduce los atributos a JSX (`class`, SVG en camelCase, `rows={5}`), convierte `<a href="#" data-go>` en `<Link>` (conserva `data-go`, que el CSS usa en selectores), pone las rutas de imágenes absolutas, reproduce los espacios que HTML renderiza entre texto y elementos y escapa comillas. Los contenedores que llenaba el JavaScript viejo quedan vacíos y se reemplazan a mano por componentes.

Las partes que armaba el JavaScript viejo (tarjetas, modal, carruseles…) se escribieron a mano, con sus estilos en `styles/en-linea/*-componentes.css`, copiados textual de los *template strings*.

### Paso 2.1 — Extraer los datos ✅
- [x] `pnpm datos:extraer` (`scripts/extraer-datos.ts`): abre `referencia/index.html`, ejecuta su JavaScript y guarda las constantes en `data/*.json`. 12 productos, 7 ocasiones, 9 hitos, 2 locales, 9 personas, 11 premios, 6 fotos de Instagram.
- [x] `lib/tipos.ts` y `lib/datos.ts` (funciones de lectura; en la Etapa 3 pasan a leer de Postgres sin cambiar las páginas).

### Paso 2.2 — Componentes compartidos ✅
- [x] Íconos de `ICO`, `AbrirProducto`/`BotonDetalles`, `AbiertoAhora` (arranca vacío y se completa en el navegador, como el viejo; refresca cada minuto), `lib/util.ts`, `lib/horarios.ts`, `lib/whatsapp.ts`.
- [x] Los 3 selectores `div[style*=…]` del responsive reescritos. El de `#catalogo-grid` no coincidía con ningún elemento en el sitio viejo: se documentó y no se portó.

### Paso 2.3 — Inicio ✅
Anuncios con color y visibilidad desde los datos, hero, cifras, destacados, historia, locales con "Abierto ahora" e Instagram.

### Paso 2.4 — Nosotros ✅
Relato, línea de tiempo (globos con CSS, año activo), carruseles de fotos (0,5 px por cuadro en sentidos opuestos, pausa con mouse o toque), proceso, cadena, equipo, premios (0,6 px por cuadro) y cluster. Equipo y premios se ocultan si no hay elementos visibles.

### Paso 2.5 — Catálogo y modal ✅
- [x] Filtros (activo, inactivo, apagado sin productos; tocar el activo lo apaga), grilla y tarjetas con flechas de fotos.
- [x] Producto del mes **fijo como en el sitio viejo** (pasa a ser dinámico en la Etapa 3).
- [x] Modal con rutas interceptadas: `app/(sitio)/@modal/(.)catalogo/[slug]` lo abre sobre la página actual (la URL cambia, "atrás" lo cierra). Entrando directo a `/catalogo/<slug>` se ve el catálogo con el modal abierto: **no hizo falta diseñar una página nueva**. Al cambiar de foto la caja del modal se recrea, como en el viejo (vuelve arriba y repite la animación).

### Paso 2.6 — Locales ✅
Direcciones y horarios tal como están escritos en el HTML viejo; se unifican con los datos en la Etapa 3.

### Paso 2.7 — Contacto ✅
Pestañas, texto de ayuda, "Pedir presupuesto mayorista" y mensaje de WhatsApp. Un test compara el enlace generado contra el del sitio viejo: es idéntico carácter por carácter.

### Paso 2.8 — Enlaces viejos y cierre ✅
- [x] `/#nosotros`, `/#catalogo`, etc. redirigen a la página nueva; `/#gestor` → `/gestor`.
- [x] Suite completa en verde. Las direcciones inexistentes dan 404.
- [ ] **Revisión manual lado a lado en un celular y una tablet reales** (pendiente, la hace una persona).

### Hallazgos del sitio viejo (se mantuvieron por paridad o se anotaron)

| Hallazgo | Qué se hizo |
|---|---|
| "Ver Detalles" en el Inicio no abría nada y bloqueaba el scroll (el modal estaba dentro del catálogo, oculto) | **Corregido**: abre el detalle. Anotado en *Diferencias visuales aprobadas*, pendiente de aprobación |
| En Locales, "Abierto ahora" de Maipú queda siempre vacío (busca "maipu" sin tilde en "Local Maipú") | Se mantiene igual. Backlog de la Etapa 7 |
| "Abierto ahora" usaba la hora del dispositivo | Usa la hora de Argentina (plan, P11). Para quien está en Argentina no cambia nada |
| Productos sin fotos tenían `<img src="">` | Se omite el atributo (React no admite `src` vacío); se ve igual |

### Notas técnicas de esta etapa
- Con Next en modo desarrollo, los errores de consola muestran un aviso flotante que tapa las capturas. Por eso existe el test "sin errores en consola": si falla, arreglar el error, no el test.
- Los tests preparan la página sin tocar el DOM antes de que React hidrate (las imágenes *lazy* se cargan recorriendo la página con scroll).
- Si una corrida de Playwright se corta a mitad de camino, puede quedar un servidor colgado en el 3000 o el 4500: `fuser -k 3000/tcp 4500/tcp`.

---

## Etapa 3 — Base de datos ✅

Criterio de la etapa: **los tests visuales tienen que seguir exactamente igual que al cerrar la Etapa 2.** Cumplido: la suite completa (110 tests) pasa leyendo de la base, en desarrollo y en producción (`pnpm build && pnpm start`).

### Paso 3.1 — Postgres local con Docker ✅
- [x] `infra/docker-compose.dev.yml`: Postgres 17 en el **puerto 5440** (el 5432 y el 5433 los usan otros proyectos de la máquina), con volumen y *healthcheck*.
- [x] `.env.example` → `.env` con `DATABASE_URL` (el `.env` no se sube).
- [x] Drizzle ORM 0.45 + drizzle-kit, cliente `postgres`.

### Paso 3.2 — Esquema y migraciones ✅
- [x] `db/schema.ts` y migraciones en `db/migraciones/` (`0000_esquema_inicial`, `0001_encuadre_foto_local`).
- [x] Ajustes respecto del plan, para no cambiar nada visible: tabla `producto_del_mes` (texto y foto propios), columnas extra en `locales` (foto y encuadre de la página Locales, "cómo llegar", mapa) y `ocasiones.clave`. Anotado en el plan, sección 4.3.

### Paso 3.3 — Importación ✅
- [x] `pnpm db:importar` (`db/importar/index.ts`): 63 fotos, 12 productos, 45 fotos de producto, 6 quesos de combos, 7 ocasiones con 14 relaciones, 3 anuncios, 11 premios, 9 personas, 2 locales, config y producto del mes. Sin avisos.
- [x] Valida que cada precio se reconstruya **idéntico** al texto del sitio viejo, y que el producto del mes muestre el mismo precio y unidad que el producto.
- [x] No pisa una base con datos: para reimportar hace falta `--forzar` (¡borra lo editado en el gestor!).
- [x] Los datos que el sitio viejo tenía sólo escritos en el HTML (Locales, producto del mes, Facebook) se extrajeron con un script a `db/importar/data/extras.json`.
- [x] Las fotos se registran apuntando a los archivos de `public/img/`. Las variantes AVIF/WebP llegan en la Etapa 6.

### Paso 3.4 — Páginas leyendo de la base ✅
- [x] `lib/datos.ts`: mismas funciones y misma forma de datos que en la Etapa 2, ahora asíncronas y contra Postgres. Los textos fijos (historia, proceso, Instagram, colores) pasaron a `content/`.
- [x] Producto del mes, página Locales y footers (direcciones, teléfono, redes) salen de la base: se terminaron los datos repetidos (plan, P5).
- [x] En Locales se sigue reproduciendo la búsqueda por clave del sitio viejo (el "Abierto ahora" de Maipú queda vacío, backlog ítem 11).

### Paso 3.5 — Caché ✅
- [x] `cacheComponents` activado. Cada consulta usa `'use cache'` + `cacheLife('max')` + `cacheTag('<entidad>')`.
- [x] Las páginas se arman en cada pedido (`await connection()` en el layout y en cada página, dentro de un `Suspense`): **el build compila sin base de datos**, verificado con una `DATABASE_URL` inválida. Las rutas quedan como *Partial Prerender*.
- [x] Verificado a mano: al cambiar un precio en la base, la página sigue mostrando el anterior (caché); al invalidar la etiqueta `productos`, aparece el nuevo al instante.
- [x] En producción las páginas responden en unos 50 ms.

### Notas técnicas de esta etapa
- **Etiquetas de caché** que tiene que invalidar el gestor al guardar: `config`, `anuncios`, `productos`, `ocasiones`, `producto-del-mes`, `locales`, `equipo`, `premios`.
- **Activity (Next 16):** al volver atrás desde un modal, Next conserva el modal oculto en lugar de borrarlo. Los tests comprueban que no se vea (`toBeHidden`), no que no exista.
- **Hidratación:** el contenido llega dentro de un `Suspense` y React termina de hidratar un poco más tarde. `components/sitio/MarcaHidratado.tsx` pone `data-hidratado="si"` en `<html>` y los tests lo esperan antes de capturar. No se ve.
- `styles/` y `db/migraciones/` están en `.prettierignore`: `pnpm format` no tiene que tocar el CSS portado textual.

---

## Etapa 4 — Servidor y publicación de prueba (preparada; falta el VPS)

*Todo lo que no necesita el VPS ni el dominio ya está hecho y probado en local (03/10/2026). **La publicación la hace el dueño del proyecto** con [GUIA DE DEPLOY.md](GUIA%20DE%20DEPLOY.md) y `scripts/deploy.sh` (decisión del 03/10/2026). Referencia técnica: [OPERACION.md](OPERACION.md).*

### Paso 4.1 — Preparar el VPS ⏳

En el panel de Hostinger: instalar **Ubuntu 24.04** y cargar tu clave SSH pública.

- [ ] Usuario sin privilegios de root:
  ```bash
  adduser deploy && usermod -aG sudo deploy
  rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
  ```
- [ ] En `/etc/ssh/sshd_config`: `PermitRootLogin no` y `PasswordAuthentication no`; `systemctl restart ssh`. **Probar el acceso con `deploy` en otra terminal antes de cerrar la sesión de root.**
- [ ] Firewall: `ufw allow OpenSSH && ufw allow 80,443/tcp && ufw allow 443/udp && ufw enable`.
- [ ] `apt install -y fail2ban unattended-upgrades`.
- [ ] Docker: `curl -fsSL https://get.docker.com | sh` y `usermod -aG docker deploy`.
- [ ] **Ojo:** Docker salta las reglas de `ufw` para los puertos que publica. Sólo Caddy publica puertos (80 y 443); Postgres y la app **no** publican ninguno (ya es así en `infra/docker-compose.yml`).

**Verificación:** `ssh deploy@<ip>` entra con clave; `ssh root@<ip>` es rechazado; `ufw status` muestra sólo 22, 80 y 443.

### Paso 4.2 — DNS y Caddy

- [ ] ⏳ Registro `A` de `nuevo.<dominio>` apuntando a la IP del VPS.
- [x] `infra/Caddyfile`: HTTPS automático para `{$DOMINIO}`, compresión, `/fotos/*` directo del volumen (caché de un año) y encabezados de seguridad (HSTS, `nosniff`, `Referrer-Policy`, sin `Server`).

### Paso 4.3 — Docker de producción

- [x] `Dockerfile` multi-etapa (Node 24): instala dependencias, hace `pnpm build` y `pnpm herramientas`, y copia la salida `standalone`. Corre como usuario `node`. Al arrancar aplica las migraciones (`herramientas/migrar.mjs`) y después `node server.js`. 435 MB. No lleva ningún `.env` ni secreto (verificado en la imagen y en su historial).
- [x] Herramientas empaquetadas con esbuild (`scripts/herramientas.mjs`): `migrar.mjs`, `importar.mjs` y `crear-usuario.mjs`, que corren con `node` solo dentro de la imagen.
- [x] `infra/docker-compose.yml`: `app` (imagen de `IMAGEN`, volúmenes `fotos` y `cache-next`), `db` (`postgres:17-alpine`, *healthcheck*) y `caddy` (80/443 tcp y 443/udp, certificados y `fotos` de sólo lectura). `infra/.env.produccion.example` con las variables.
- [x] En el VPS, `/srv/maitilac/` con esos archivos y el `.env` (permisos `600`): lo arma `deploy.sh primera-vez`.

**Verificado en local** (con `DOMINIO=localhost` y Caddy en 8080/8443, porque el 80 de esta máquina está ocupado): las 8 rutas públicas responden, `/gestor` redirige al login, la copia de seguridad da 401 sin sesión; login con cookie `Secure`/`HttpOnly`; foto subida servida por Caddy desde el volumen y optimizada en AVIF; y **`PRUEBA_URL=https://localhost:8443 pnpm test:visual`: 115 de 115**, con la caché de imágenes vacía.

### Paso 4.4 — Deploy con `scripts/deploy.sh`

- [x] `scripts/deploy.sh`, desde la computadora y sin depender de GitHub: verifica el código, compila la imagen, copia la configuración, hace una copia previa, sube la imagen por SSH (unos 110 MB), la activa, comprueba que las 5 páginas se armen bien (no alcanza con el código 200: con el streaming, una página rota también responde 200) y, si algo falla, vuelve sola a la anterior. Comandos `primera-vez` (crea el `.env` con secretos nuevos, carga los datos de fábrica y programa el cron), `volver`, `usuario`, `copia` y `estado`. Configuración en `deploy.env` (modelo: `deploy.env.example`).
- [x] Probado contra un servidor Ubuntu 24.04 de prueba (contenedor con SSH): primera vez, actualizaciones, `volver` ida y vuelta, `copia`, `usuario` con login real, una versión que no compila (no publica) y una que se rompe en ejecución (vuelve sola en unos 10 s). La limpieza de imágenes nunca borra la actual ni la anterior.
- [x] `docs/GUIA DE DEPLOY.md`: paso a paso desde el VPS vacío (seguridad, DNS, primera vez, actualizaciones, copias, dominio definitivo, problemas frecuentes).
- [x] `.github/workflows/ci.yml` sigue sirviendo para verificar cada cambio si el código se sube a GitHub. `deploy.yml` (deploy por GitHub) se borró: lo reemplaza el script (03/10/2026).
- [ ] ⏳ Primera publicación real (la hace el dueño del proyecto con la guía).

**Verificación:** `https://nuevo.<dominio>` abre con HTTPS válido; `PRUEBA_URL=https://nuevo.<dominio> pnpm test:visual` da todo en verde (sólo páginas públicas, sin tocar datos).

### Paso 4.5 — Copias de seguridad

- [x] `infra/backup.sh`: `pg_dump` + archivo de las fotos subidas, con rotación (7 diarias, 4 semanales). `infra/restaurar.sh`: restaura base y fotos, pidiendo confirmación.
- [x] Probado en local: copia → base reimportada de fábrica y fotos borradas → restauración → vuelven la foto subida, su archivo y el usuario del gestor, y Caddy la sirve. Rotación probada con copias viejas de mentira.
- [x] Cron diario a las 3:00: lo programa `deploy.sh primera-vez` (probado en el servidor de prueba).
- [ ] ⏳ Activar los snapshots semanales en el panel de Hostinger.

### Notas técnicas de esta etapa
- **Error de Next encontrado al probar producción** (16.3.6, la última estable): si el navegador cortaba la conexión mientras el optimizador leía la foto original (alguien que cambia de página rápido en la primera visita), esa foto quedaba colgada para todos hasta reiniciar el sitio. El pedido interno reutilizaba el `socket` del navegador y su promesa no se resolvía nunca; como Next agrupa los pedidos iguales, arrastraba a todos los siguientes. Se reprodujo cerrando páginas a mitad de carga: 30 de 42 imágenes colgadas (10 sin Caddy, así que no era Caddy). **Parche** con `pnpm patch` (`patches/next.patch`): el pedido interno ya no usa ese `socket`. Después del parche, 0 de 42 en tres repeticiones. Al actualizar Next, comprobar si se corrigió y sacar el parche. *(Corregido en Next 16.4: el parche se sacó el 23/10/2026.)*
- **Tests contra un sitio publicado:** `PRUEBA_URL=<url> pnpm test:visual` corre sólo las páginas públicas (sin el gestor, que modifica datos), sin levantar servidor ni tocar ninguna base. El recorrido con scroll de los tests pasó a hacerse desde Playwright con esperas reales.
- Una vez, en la suite local, el catálogo salió sin sus dos últimos productos aunque la base los tenía; no se pudo reproducir (la corrida siguiente, 144 de 144). Si vuelve a pasar, investigar la caché del servidor de desarrollo.
- Los tests ahora borran, al empezar, las fotos que subieron en corridas anteriores (`subidas/`): después de reimportar la base no las usa nada.

---

## Etapa 5 — Gestor (casi terminada)

**El gestor también conserva su diseño actual** (las clases `.g-*` de `index.html:211-342`). Antes de cada pantalla se generan sus capturas de referencia desde `referencia/#gestor`.

*Se hizo antes que la Etapa 4 (decisión del 28/09/2026): no depende del servidor.*

### Paso 5.1 — Login y protección ✅

- [x] Better Auth con email y contraseña y el registro público desactivado; tablas generadas por su CLI (`db/esquema-auth.ts`) y migración `0002_login_gestor`.
- [x] Script `pnpm gestor:usuario <email> "<Nombre>"`: crea el usuario o, si ya existe, le cambia la contraseña. La pide por teclado (mínimo 10 caracteres) o la toma de la variable `CLAVE`.
- [x] `/gestor/ingresar` con los colores y tipografías del gestor.
- [x] Sin sesión, `/gestor` redirige al login: `proxy.ts` (el *middleware* de Next 16) lo hace de forma optimista y la página vuelve a verificar la sesión (`exigirSesionPagina()`).
- [x] `requerirSesion()` en **cada** Server Action (`lib/gestor/acciones.ts`, a través de `accion()`), y la ruta de la copia de seguridad devuelve 401 sin sesión.
- [x] Límite de intentos de login: 5 por minuto, sólo en producción (en desarrollo molestaría a los tests).
- [x] Sesión de 7 días. Botón **"Salir"** en el encabezado.

**Verificación:** tests funcionales "sin sesión" (redirige y la copia da 401), "con datos incorrectos no entra" y "si se pierde la sesión, las acciones no guardan nada".

### Paso 5.2 — Estructura y estilos del gestor ✅

- [x] CSS `.g-*` portado textual a `styles/sitio/gestor.css`; los `style=""` del gestor viejo, en `styles/en-linea/gestor.css` (conversor) y `gestor-componentes.css`.
- [x] Encabezado marrón con "Nuevo producto", "Exportar", "Ver el catálogo" y "Salir" (nuevo).
- [x] Aviso flotante (`#g-aviso`) con los mismos textos que el gestor viejo cuando la acción es la misma.
- [x] Test visual del gestor completo en los tres anchos contra `referencia/#gestor`.

### Pasos 5.3 a 5.9 — Pantallas ✅

| Paso | Pantalla | Estado |
|---|---|---|
| 5.3 | Anuncios | ✅ Texto, visibilidad, color y vista previa en vivo |
| 5.4 | Contacto y locales | ✅ **Bloque nuevo** al final del gestor: WhatsApp (local y mayorista), teléfono, email, Instagram y Facebook; **producto del mes** (producto, texto y foto); de cada local: nombre, dirección, horarios como se muestran, horas para "Abierto ahora", las dos fotos, "Cómo llegar" y enlace al mapa |
| 5.5 | Premios | ✅ Edición en línea, foto, ocultar, ordenar, agregar, eliminar y "Restaurar premios" |
| 5.6 | Equipo | ✅ Igual que premios, con foto redonda |
| 5.7 | Ocasiones | ✅ Renombrar, mostrar/ocultar, marcar quesos, contador, "Apagado — sin quesos visibles" |
| 5.8 | Productos | ✅ Buscador, filtros, panel lateral, destacar, ocultar, ordenar, eliminar (borrado lógico) y "Restaurar original" |
| 5.9 | Banco de fotos | ✅ **Bloque nuevo** (la copia congelada del sitio viejo no lo tiene; ver registro §24): todas las fotos con su uso, filtro "Sin asignar", subir varias a la vez, asignar a un producto (se saca de donde estaba), crear un producto desde una foto |

- [x] Ordenar con las flechas ▲▼ / ◀▶, igual que hoy. Arrastrar y soltar queda para la Etapa 7.
- [x] Subida de fotos: `sharp` las reduce a 1000 px (JPG) como `gAchicar()`, se guardan en `FOTOS_DIR` y se registran en `fotos`. JPG, PNG o WebP de hasta 15 MB. Las variantes AVIF/WebP llegan en la Etapa 6.
- [x] Una foto subida desde un producto aparece sola en el Banco; al quitarla del producto queda "Sin asignar" (lo que pedía el registro, "Pendientes").

**Verificación:** 13 tests funcionales en `tests/visual/gestor-funcional.spec.ts`. Cada uno edita desde el gestor, comprueba el cambio en la página pública y deja todo como estaba: anuncios, ocultar un producto, precio, subir y quitar una foto, ocultar un premio, copia de seguridad, email en el footer, horario de un local, producto del mes y banco de fotos, más los tres de login y sesión. Filtros y equipo todavía no tienen test funcional propio (sólo el visual del gestor): se suman en el Paso 6.4.

### Paso 5.10 — Copia de seguridad y cierre del gestor

- [x] "Exportar" descarga `maitilac-copia-AAAA-MM-DD.json` con **todas** las tablas, incluido el equipo (el export viejo no lo traía).
- [ ] Quitar el enlace "Gestor del catálogo" del footer público. **Pendiente de aprobación** (ver *Diferencias visuales aprobadas*). Hoy sigue y lleva al login.
- [ ] Crear los usuarios de D2 en el VPS (faltan los emails; mientras tanto se usa el usuario de prueba de `.env`).
- [ ] Prueba de punta a punta: una persona edita desde una computadora y el cambio se ve **al instante** en un celular. Necesita el sitio publicado (Etapa 4). En local ya está probado con los tests funcionales.

### Notas técnicas de esta etapa
- **Diferencias con el plan:** no se usaron Zod, React Hook Form ni shadcn/ui. El gestor se armó con el mismo markup del gestor viejo, y cada acción valida lo suyo antes de tocar la base: campos obligatorios, nombres repetidos, formato de horas (HH:MM), email y precio. Si más adelante los formularios crecen, se puede sumar Zod sin cambiar las pantallas.
- **Precio:** el gestor acepta "$4500", "4.500", "Desde $8500", "$4500,50" o "Consultar". Se guarda como número + prefijo y en el sitio se muestra con el mismo formato que antes.
- **Bloques nuevos** (Contacto y locales, Banco de fotos) llevan `data-nuevo`: el test visual los quita antes de comparar con el gestor viejo, igual que el botón "Salir".
- **Tests:** el `globalSetup` (`tests/visual/preparar-bd.ts`) reimporta los datos de fábrica y crea el usuario de prueba; el proyecto `sesion` inicia sesión una vez; `gestor-funcional` corre al final y de a uno. Los tests que abren el modal reanudan el reloj falso (`page.clock.resume()`): con el reloj pausado, React no termina de mostrar el contenido de un `Suspense`.
- **Caché y reimportación:** la reimportación no pasa por el gestor, así que no invalida la caché. Playwright levanta el servidor **antes** del `globalSetup`, y por eso comprueba que esté listo con `/api/auth/ok` (una ruta que no lee datos). Si `pnpm dev` ya estaba abierto con datos editados, hay que reiniciarlo antes de correr los tests.
- **Fotos subidas:** en desarrollo las sirve `app/fotos/[...ruta]/route.ts` desde `FOTOS_DIR` (por defecto `./subidas`, ignorada en git). En producción las va a servir Caddy desde el volumen (Etapa 4).
- **Contacto:** la lista "Nuestros locales" ahora sale de la base (antes estaba escrita a mano y no seguía los cambios del gestor). Muestra la dirección hasta la primera coma, como el sitio viejo ("Maipú 1135"). Los canales de esa página siguen fijos: backlog 12.
- `proxy.ts` sólo redirige pedidos GET: los POST de las Server Actions pasan siempre, y es la acción la que rechaza si no hay sesión.

---

## Etapa 6 — Calidad y lanzamiento (hecho lo que no depende del servidor)

Las mejoras de esta etapa tienen que ser **invisibles**. Si alguna cambia el diseño (por ejemplo, un contraste que no llega a AA), no se aplica acá: se anota como propuesta para la Etapa 7.

### Paso 6.1 — Imágenes optimizadas ✅

- [x] ~~`lib/imagenes.ts` y script de variantes~~ → **se usa el optimizador de imágenes de Next**: cubre también las fotos subidas, no suma archivos ni scripts y el markup queda igual. Genera AVIF o WebP según el navegador, del ancho que pide el `srcset`, y los guarda en `.next/cache/images`. Configuración en `next.config.ts` (`images`): anchos 400, 800, 1200, 1600 y 2000 (más 120 y 240 para las fotos chicas), calidad 75, sólo rutas `/img/**`, `/fotos/**` y `/fondo-hero.jpg`.
- [x] `components/sitio/Foto.tsx`: el mismo `<img>` de antes (clase, alt, `loading`, encuadre) con `srcSet` y `sizes` de `getImageProps`. Cada foto tiene su `sizes`, medido en los tres anchos.
- [x] Sólo para las fotos con el tamaño fijado por CSS (medido en el navegador: se cambió cada imagen por una de 1×1 y se comprobó que la caja no cambia). Los logos, el logo del Cluster y las ilustraciones de la cadena toman su tamaño del archivo: siguen como `<img>` común.
- [x] Las fotos subidas desde el gestor pasan por el mismo optimizador, sin nada extra.
- [x] `loading` quedó como en el sitio viejo (el hero y las fotos de arriba de todo, sin `lazy`). El hero suma `fetchPriority="high"`.
- [x] Se sacaron de la tabla `fotos` las columnas `variantes`, `ancho` y `alto`, que eran para el plan anterior (migración `0003_fotos_sin_variantes`).

**Resultado:** la foto de una tarjeta pasa de 225 KB (JPG) a 12 KB (AVIF, 400 px); el Holanda grande, de 566 KB a 51 KB (AVIF, 800 px). En producción, la primera vez que se pide cada versión tarda cerca de 1 s en generarse; después sale de la caché en milisegundos.

**Verificación:** suite completa en verde, con el test "diseño" (fotos enmascaradas, estricto) y el test "fotos" (sin máscara, tolerancia de recompresión). Revisión a ojo, a doble densidad, del hero, el producto del mes, una tarjeta, la foto de un local y la del tambo: iguales al sitio viejo.

### Paso 6.2 — SEO ✅

- [x] `app/robots.ts` (bloquea `/gestor` y `/api/`) y `app/sitemap.ts` (las 5 páginas y el detalle de cada producto visible; se arma en cada pedido, así el build no necesita la base).
- [x] Título por página con la plantilla "%s — Maitilac": el `h1` de cada página ("Nuestra Historia", "Nuestro Catálogo", "Nuestros Locales", "Contacto") y, de descripción, su bajada tal cual. El Inicio conserva el título y la descripción del sitio viejo. Cada producto: su nombre, su descripción y su primera foto. URL canónica en todas.
- [x] Open Graph con nombre del sitio, `es_AR` y la foto del hero (la del producto en su página). Base común en `lib/sitio.ts` (`OG_BASE`), porque el `openGraph` de una página reemplaza entero al del layout.
- [x] JSON-LD (`components/sitio/DatosEstructurados.tsx`): `Product` en `/catalogo/<slug>`, con precio sólo si es exacto y visible (no con "Desde" ni "Consultar"); `LocalBusiness` por local en `/locales`, con dirección, teléfono, mapa y horarios de "Abierto ahora". Sin datos inventados: lo que no está en el sitio, no se pone.
- [x] Nueva variable `SITIO_URL` (dirección pública). Se usa al compilar y al ejecutar.
- [x] **Corregido de paso:** faltaban el ícono de la pestaña (`img/logo-tandil-2.png`) y el `viewport-fit=cover` del sitio viejo.

**Verificación:** suite completa en verde; build sin base de datos; revisado a mano el `<head>`, `robots.txt`, `sitemap.xml` y que el JSON-LD sea válido. Falta pasar las páginas por el validador de resultados enriquecidos de Google cuando el sitio esté publicado.

### Paso 6.3 — Accesibilidad y rendimiento (casi terminado)

- [x] **Teclado** (`lib/foco.ts`, tests en `tests/visual/accesibilidad.spec.ts`):
  - Modal de producto: `role="dialog"`, el foco entra al abrir, Tab no sale del modal, Esc lo cierra y el foco vuelve a "Ver Detalles". Al cambiar de foto con las flechas, el foco sigue en la flecha.
  - Menú del celular: Esc lo cierra y el foco vuelve al botón; `aria-controls`.
  - Filtros del catálogo y años de la línea de tiempo: `aria-pressed`.
  - Íconos de Instagram y Facebook del footer claro y de Contacto: nombre accesible (`aria-label`).
  - Panel de producto del gestor: `role="dialog"`, Tab no sale del panel y Esc devuelve el foco a "Editar" (test en `gestor-funcional`).
  - El resto ya eran botones, enlaces y campos nativos (las flechas de las fotos y del gestor tienen `aria-label`).
- [x] `prefers-reduced-motion`: los carruseles de Nosotros (historia y premios) no se mueven solos; se pueden correr a mano.
- [x] Logos del header y los footers e ilustraciones de la cadena, por el optimizador de imágenes (tienen al menos una medida fija en el CSS). El logo del Cluster no: con ancho fijo y alto automático, la versión reducida cambiaba el alto de Nosotros en 1 px.
- [ ] **Lighthouse móvil ≥ 90: confirmar en el VPS.** En esta máquina (en uso) el modo simulado varía ±10 puntos entre corridas: Inicio 69–83, Nosotros 77–87, Catálogo 84–92, Locales 87–91, Contacto 84–97. Con el throttling aplicado de verdad (`--throttling-method=devtools`), el Inicio da 95 (LCP 2,2 s). Una comparación A/B contra la versión anterior a este paso dio lo mismo dentro del ruido. Accesibilidad 95–96, buenas prácticas 100, SEO 100 en todas.

**Quedan como propuesta para la Etapa 7 (cambian el diseño):** el contraste de varios textos (años de la línea de tiempo, etiquetas de los canales de Contacto, unidades de precio, "Producto del Mes", etc.) no llega a AA (backlog 9), y el logo del footer claro de Nosotros se ve achatado en tablet y celular (backlog 10).

### Optimización de velocidad (03/10/2026) ✅

Medido antes de tocar nada, en modo producción contra la base local: las páginas públicas tardan entre 17 y 29 ms en armarse con la caché llena (la base sólo se consulta cuando el gestor guarda un cambio), y la primera visita después de arrancar, unos 300–450 ms (Node cargando el código). El margen estaba en otro lado:

- [x] **Caché del navegador para `public/`:** Next mandaba fuentes e imágenes con `max-age=0` y el navegador las volvía a consultar en cada visita. Ahora (`headers()` en `next.config.ts`) las fuentes van con un año (`immutable`) y las imágenes con 31 días. Medido con un perfil de navegador cerrado y vuelto a abrir: al volver a Nosotros, 10 pedidos al servidor en lugar de 14 (las 4 fuentes ya no se piden). **Si se reemplaza un archivo de `public/`, hay que cambiarle el nombre.**
- [x] **Índices** en las columnas que relacionan tablas (fotos de productos, de premios, del equipo y de los locales; quesos de los combos; productos de los filtros). Migración `0004_indices_claves_foraneas`. Con las tablas de hoy no se nota; sirve cuando crezca el banco de fotos y al borrar fotos o productos.
- [x] **`getLocales`:** trae las dos fotos de cada local por join, en lugar de leer el banco de fotos entero.
- [x] **Gestor:** `leerDatosGestor()` (corre en cada acción) hace todas las consultas en una sola tanda, sin las tres repetidas, y arma los cruces con `Map`. De 13,8 a 9,0 ms (mediana de 40), con la salida idéntica (comparada campo por campo).
- [x] **Reordenar con las flechas:** un solo `UPDATE` en lugar de uno por fila. Guardar un producto inserta sus fotos y quesos de una vez. Test funcional nuevo: la flecha cambia el orden en el catálogo y vuelve.

**Verificado:** suite local 145 de 145; imagen de producción con base nueva (migra hasta la 0004) y 115 de 115 contra ella.

### Fotos optimizadas por adelantado y actualización de seguridad (23-24/10/2026) ✅

- [x] **Fotos generadas antes de que alguien las pida** (`lib/calentar.ts`): el optimizador de Next genera cada versión la primera vez que se pide, y un AVIF tarda 0,7-2 s. Con la caché vacía y 2 núcleos (como el KVM 2), el Inicio tardaba **6,4 s** en mostrar la foto principal. Ahora `deploy.sh` corre `herramientas/calentar.mjs` en segundo plano después de publicar (recorre el sitemap y pide todas las versiones de cada `srcset`, en AVIF y WebP), y el gestor hace lo mismo con `after()` después de cambiar algo con fotos. Medido con la imagen de producción, base nueva y 2 núcleos: 392 fotos, 784 versiones, 6 min en segundo plano; después, todas las páginas por debajo de 0,65 s. Con todo ya generado, el recorrido tarda unos 5 s.
- [x] **Seguridad:** Next 16.4.2 y React 19.2.9 (avisos del 14/10/2026: ejecución remota con `use cache` y con el optimizador de imágenes, DoS con Server Actions; el sitio usa los tres), sharp 0.35.5, Node 24.22.1 fijado en el `Dockerfile` (arreglos del 21/10/2026) y vitest 5.0.5. Se sacó `patches/next.patch`: Next 16.4 trae el mismo arreglo.
- [x] Verificado: las capturas del sitio nuevo son idénticas con 16.3.6 y con 16.4.2 (69 de 70; la otra, 37 px de recompresión de un logo); los 17 tests funcionales del gestor pasan; imagen de producción levantada con el `docker-compose.yml` de `infra/` sobre una base vacía (migraciones, datos de fábrica, páginas, `/gestor` → login, copia 401, video).

**Se evaluó y no se hizo** (poco beneficio o algún riesgo): guardar en caché el HTML armado de cada página (son 20 ms); precargar las fuentes (competiría con la foto del hero en conexiones lentas); dejar que Caddy comprima en lugar de Next (podría frenar el streaming); agrupar los inserts de la importación de fábrica (se usa poco); guardar la sesión del gestor en la cookie (ahorra una consulta pero demora el cierre de sesión).

### Paso 6.4 — Tests finales (casi terminado)

- [x] Vitest (`pnpm test`, `tests/unit/`): `horarios` (incluida la hora de Argentina y el caso de Maipú), `precio` (reconstrucción de todos los precios de fábrica y `leerPrecioEscrito`), conteo de ocasiones (contra los números de la captura de textos del sitio viejo) y slugs. 32 tests. El conteo pasó a `lib/ocasiones.ts`, compartido por el catálogo y el gestor.
- [x] Playwright funcional: navegación, modal y teclado (`navegacion.spec.ts`, `accesibilidad.spec.ts`); el filtro activo y el mensaje de WhatsApp se comparan contra el sitio viejo (`estados.spec.ts`). Del gestor, 16 (suman filtros y equipo).
- [ ] Suite visual completa en verde en CI: el flujo ya está escrito (`.github/workflows/ci.yml`, Etapa 4); falta el repo para correrlo. En local, `pnpm test:visual` pasa completa (144).

### Paso 6.5 — Documentación ✅

- [x] `docs/MANUAL DEL GESTOR.md` reescrito para el gestor nuevo (se hizo en la Etapa 5).
- [x] `docs/OPERACION.md`: puesta en marcha, deploy, backups, restauración, alta de usuarios y cambio de dominio (probado en local; falta repasarlo en el VPS).
- [x] Entrada 30 en `REGISTRO DE CAMBIOS.md` con la migración (actualizarla al lanzar).

*El Paso 6.6 necesita el servidor y el dominio: se hace después de la Etapa 4.*

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

### Pedido del cliente del 03/10/2026

Revisión con antes y después: página privada "Revisión pedido Maitilac" (https://claude.ai/artifact/HJHCnT9UkxaJW3F2ja1hdq). Estilos nuevos en `styles/cambios.css` (capa `cambios`, después de las del sitio viejo).

- [x] 1. Inicio: "Empresa familiar de Tandil / que cuida cada detalle", sin la frase de abajo (los botones quedan). En pantallas medianas y grandes se sacó el ancho máximo de 680 px para que entre en dos renglones; en el celular se corta parejo.
- [x] 2. Footer oscuro: texto nuevo; en tablet, tres columnas alineadas arriba. En escritorio el logo ya estaba alineado con los títulos.
- [x] 3. Catálogo: bajada nueva; sin precio no se ve nada (ni "Consultar"): `precioVisible()` en `lib/util.ts`; sin maridaje (detalle y destacados) ni recuadro de locales (destacados); filtros PARRILLA-PICADA-PIZZA-POSTRE-SANDWICH-RALLAR-REGALOS en ese orden (datos de fábrica). En el gestor se sacaron los campos de maridaje; los datos quedan en la base.
- [x] 4. Locales: sin "Indicaciones Generales / Estacionamiento".
- [x] 5. Premios: "Nuestros quesos, premiados."; rótulo "PREMIOS" en el detalle de producto.
- [ ] 6. Proceso productivo: texto nuevo ✅; paso 3 "ELABORACION" con la tina sola (recorte de la imagen anterior) ✅; video en lugar de las fotos del tambo y la fábrica ✅ (23/10/2026, `public/video/proceso-productivo.mp4`, 1024×576, 2:38, con sonido; se reproduce al tocarlo, sin arranque automático; **los subtítulos vienen grabados en la imagen del video**, revisado el 24/10/2026); **faltan los originales de los dibujos del folleto** (en el PDF no se pueden separar del fondo: los tiene que conseguir el cliente).
- [x] 7. Historia en el celular: los años en una fila que se desliza.
- [ ] Aprobación de la revisión y **nueva referencia**: después de aprobarla, las capturas de referencia pasan a sacarse del sitio nuevo (`pnpm test:visual --update-snapshots`). Hasta entonces, los tests visuales que comparan contra el sitio viejo fallan en las páginas cambiadas.
- Textos tal cual: sin punto final en la bajada del catálogo, el footer y el proceso; "ELABORACION" sin tilde; filtros en mayúsculas. A confirmar con el cliente.

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
| 10 | Footer claro de Nosotros: en tablet y celular queda en 4 columnas apretadas (su grilla en línea le gana al responsive del sitio viejo) | Paso 1.5 | Proponer al cliente |
| 11 | Locales: "Abierto ahora" de Maipú nunca aparece (la búsqueda por "maipu" sin tilde no encuentra "Local Maipú") | Paso 2.6 | Proponer al cliente |
| 12 | Contacto: los canales (WhatsApp y teléfono del local, los dos WhatsApp y los dos mails mayoristas) siguen escritos en la página y no cambian desde el gestor. La configuración tiene un solo WhatsApp mayorista (el 2494 610999, que recibe el formulario) y el email info@maitilac.com; la página muestra también 2494 650236, ventas1@maitilac.com y ventas2@gmail.com | Etapa 5 | Consultar al cliente |

---

## Diferencias visuales aprobadas

Toda diferencia entre el sitio nuevo y `referencia/` tiene que estar en esta tabla. Si no está, es un error a corregir.

| Fecha | Dónde | Diferencia | Motivo | Aprobó |
|---|---|---|---|---|
| — | Gestor → Contacto y locales | Bloque nuevo al final: contacto, producto del mes y locales | Datos que estaban escritos a mano en el HTML pasan a ser editables (plan P5) | Pendiente |
| — | Gestor → Banco de fotos | Bloque nuevo al final (la copia congelada del sitio viejo no lo tiene) | Registro §24 y pedido del cliente del 06/08/2026 | Pendiente |
| — | Gestor → encabezado | Botón "Salir" | Cerrar la sesión del login | Pendiente |
| — | Footer público | Se quita el enlace "Gestor del catálogo" | Seguridad (plan P2) | Pendiente |
| — | Gestor → "Exportar" | Mismo botón y mismo texto; descarga `maitilac-copia-AAAA-MM-DD.json` con todas las tablas (incluido el equipo) en lugar de `catalogo-maitilac.txt`. El nombre del botón se dejó igual por paridad; el cartelito al pasar el mouse lo explica | Ahora es un backup, ya no un archivo para pegar en el código | Pendiente |
| — | Gestor → acceso | Pantalla de login | Seguridad (plan P2) | Pendiente |
| 28/09/2026 | Inicio → "Ver Detalles" | Abre el detalle del producto (en el sitio viejo no hacía nada y bloqueaba el scroll) | Corrección de un error | Pendiente |
| 03/10/2026 | Inicio | Título "Empresa familiar de Tandil / que cuida cada detalle", sin la frase de abajo | Pedido del cliente | Cliente |
| 03/10/2026 | Footer oscuro | Texto nuevo; en tablet, tres columnas | Pedido del cliente | Cliente |
| 03/10/2026 | Catálogo | Bajada nueva; sin precio no se ve nada; sin maridaje ni locales; filtros con nombres y orden nuevos | Pedido del cliente | Cliente |
| 03/10/2026 | Locales | Sin el bloque de estacionamiento | Pedido del cliente | Cliente |
| 03/10/2026 | Nosotros → Premios | "Nuestros quesos, premiados."; rótulo "PREMIOS" en el detalle | Pedido del cliente | Cliente |
| 03/10/2026 | Nosotros → Proceso productivo | Texto nuevo; paso 3 "ELABORACION" sin tarros | Pedido del cliente | Cliente |
| 23/10/2026 | Nosotros → Proceso productivo | Un video (16:9) en lugar de las dos fotos (tambo y fábrica) | Pedido del cliente | Cliente |
| 24/10/2026 | Nosotros → footer claro | "Desarrollado por Grupo Vexus" (enlace a grupovexus.com) en lugar de "Hecho con ♥ en Tandil" | Crédito del desarrollo | Grupo Vexus |
| 03/10/2026 | Nosotros → Historia (celular) | Años en una fila que se desliza | Pedido del cliente | Cliente |
| — | `/catalogo/[slug]` | Entrando directo se ve el catálogo con el detalle abierto | URL propia por producto (SEO, compartir) | Pendiente |
