# Paso a paso — Refactorización del sitio Maitilac

Guía operativa para ejecutar el [PLAN DE REFACTORIZACION.md](PLAN%20DE%20REFACTORIZACION.md) de a un paso por vez. El plan explica **qué** se construye y **por qué**; esta guía explica **cómo** y en qué orden, y sobre todo **cómo verificar que el diseño quede idéntico**.

> **Estado actual:** Etapas 0 a 3 terminadas (falta subir el repo a GitHub y la revisión manual en dispositivos reales). Próximo: **Etapa 4** (servidor) o **Etapa 5** (gestor); ver la nota al principio de la Etapa 4. *(Actualizar esta línea al cerrar cada paso.)*

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

## Etapa 4 — Servidor y publicación de prueba

*Necesita el dominio (D1c) y el repo en GitHub. Si todavía no están, se puede hacer antes la Etapa 5 (gestor): no depende del servidor.*

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
| 10 | Footer claro de Nosotros: en tablet y celular queda en 4 columnas apretadas (su grilla en línea le gana al responsive del sitio viejo) | Paso 1.5 | Proponer al cliente |
| 11 | Locales: "Abierto ahora" de Maipú nunca aparece (la búsqueda por "maipu" sin tilde no encuentra "Local Maipú") | Paso 2.6 | Proponer al cliente |

---

## Diferencias visuales aprobadas

Toda diferencia entre el sitio nuevo y `referencia/` tiene que estar en esta tabla. Si no está, es un error a corregir.

| Fecha | Dónde | Diferencia | Motivo | Aprobó |
|---|---|---|---|---|
| — | Gestor → Config y Locales | Pantalla nueva | Locales y datos de contacto editables (plan P5) | Pendiente |
| — | Footer público | Se quita el enlace "Gestor del catálogo" | Seguridad (plan P2) | Pendiente |
| — | Gestor → "Exportar" | Pasa a llamarse "Descargar copia de seguridad" | Ahora es un backup, ya no un archivo para pegar en el código | Pendiente |
| — | Gestor → acceso | Pantalla de login | Seguridad (plan P2) | Pendiente |
| 28/09/2026 | Inicio → "Ver Detalles" | Abre el detalle del producto (en el sitio viejo no hacía nada y bloqueaba el scroll) | Corrección de un error | Pendiente |
| — | `/catalogo/[slug]` | Entrando directo se ve el catálogo con el detalle abierto | URL propia por producto (SEO, compartir) | Pendiente |
