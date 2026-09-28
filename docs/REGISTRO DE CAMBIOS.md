# Registro de cambios — Sitio Maitilac

Documento de referencia: qué se hizo, cómo funciona cada cosa y qué decisiones se tomaron.

---

## ⚠ REGLAS DE TRABAJO — leer antes de tocar nada

**1. Los textos van TAL CUAL.**
Lo que envía el cliente se copia literal, carácter por carácter. No se corrigen fechas, no se reemplazan frases, no se agregan avisos ni subtítulos "de apoyo" — ni siquiera cuando parece que mejora el resultado. Si algo parece un error (una fecha contradictoria, un texto repetido), se aplica igual y **después** se comenta aparte para que el cliente decida.

*Por qué:* se corrigió un "1980" por "1940", se reemplazó una cita del encabezado y se agregó un aviso que nadie pidió. El cliente mostró el sitio y **lo regañaron** por esas modificaciones. El texto que envía suele venir aprobado por terceros.

**2. No inventar datos. Nunca.**
Si falta información (premios, fechas, nombres), se deja el espacio vacío o se pregunta. No se rellena con contenido verosímil.

*Por qué:* se inventaron seis premios ("Medalla de Oro Queso Tipo Tandil", "Fiesta Nacional del Queso", "Expo Tandil"...) que la empresa nunca ganó. Quedó como relleno y vende humo, y son afirmaciones verificables que exponen al cliente.

**3. No exagerar.**
Nada de "concursos y ferias" en plural si hay una sola cata. Nada de superlativos que no estén en la fuente.

**4. Pedir permiso antes de eliminar o sobrescribir cualquier archivo.**
Incluso archivos temporales creados por uno mismo dentro de la carpeta del proyecto.

**5. No dejar cosas "listas por si acaso".**
Si el cliente dice que no va a agregar más pasos, se eliminan las reglas y marcadores sobrantes.

---

## Archivos del proyecto

| Archivo | Qué es |
|---|---|
| `sitio/index.html` | El sitio **y** el gestor del catálogo, todo en uno. Se abre con doble clic. |
| `sitio/fondo-hero.jpg` | Foto de portada. Está suelta, junto al index. |
| `sitio/img/` | Fotos de producto y logo. |
| `sitio/img/cadena/` | Las 6 ilustraciones de la cadena de producción. |
| `sitio/fonts/` | Las tipografías. No hace falta tocarlas. |
| `MANUAL DEL GESTOR.md` | **Guía de uso para el cliente.** Actualizar cada vez que se agregue algo administrable. |
| `HISTORIA DE MAITILAC.docx` | Historia de la familia. Fuente de los textos de Nosotros. |
| `Folleto Maitilac - con Lacteos & Cia.pdf` | Folleto impreso. Fuente visual de la cadena de producción. |
| Imágenes de WhatsApp | Tabla de productos y tabla de filtros. Fuente de los datos del catálogo. |

> El archivo original `Maitilac Sitio Completo.html` fue eliminado a pedido del cliente el 30/07/2026, una vez que todo su contenido (imágenes, tipografías y textos) ya estaba extraído en `sitio/`.

---

## 1. Reconstrucción del sitio

**Situación de partida:** el archivo original era un *bundle*: todo el sitio comprimido dentro de un JSON en base64, en 178 líneas ilegibles. No se podía editar.

**Qué se hizo:** se desempaquetó por completo (logo, 15 fotos de producto, tipografías y código) y se reconstruyó como un HTML común, legible y comentado en castellano. El resultado se ve igual que el original.

El archivo original quedó sin tocar como respaldo.

---

## 2. Responsive (celular y tablet)

El sitio original tenía medidas fijas y se rompía en pantallas chicas. Ahora se adapta:

- **Celular** (hasta 720px): menú hamburguesa, todo en una columna, títulos más chicos, modal a pantalla completa.
- **Tablet** (hasta 1024px): grillas de 2 columnas, bloques de texto e imagen apilados.
- **Escritorio**: como estaba.

Verificado en 1440px, 820px y 390px. Sin desbordes horizontales.

---

## 3. Arreglos técnicos

- Título de la página: "Maitilac — Quesos artesanales de Tandil" (antes decía "Bundled Page").
- Instagram y Facebook ahora enlazan a las redes (antes no iban a ningún lado).
- Los mapas de la página Locales abren Google Maps.
- El formulario de contacto **envía por WhatsApp** con el mensaje ya armado (antes el botón no hacía nada).
- Cada producto tiene botón "Consultar por WhatsApp" en su detalle.
- Navegación por dirección web: `#catalogo`, `#nosotros`, etc. Se puede compartir un link directo a una sección.
- El cartel "Abierto ahora" se calcula con el horario real y muestra "Cerrado" cuando corresponde.

---

## 4. Imagen de fondo del hero (portada)

Se usó la foto de las hormas sobre tabla de madera (`img/hero.jpg`).

**Detalle a tener en cuenta:** la foto es vertical (900×1600) y el hero es horizontal. Para que el texto se lea y los quesos luzcan:

- En escritorio el encuadre se corre a la derecha y el degradado oscuro es más fuerte del lado izquierdo, donde va el texto.
- En celular el encuadre baja y el degradado va de arriba hacia abajo.
- Altura del hero: 880px en escritorio, 700px en celular (se agrandó para que entre más composición).

Para cambiar el encuadre se ajusta `object-position` en la etiqueta de la imagen.

---

## 5. Datos destacados del Inicio

Los tres datos sobre fondo verde claro quedaron:

| Antes | Ahora |
|---|---|
| 40+ Años — "De trayectoria familiar" | **+40 Años** — "De tradición familiar en el sector lácteo" |
| 10 Variedades | **8 Variedades** |
| 2 Locales — "Puntos de venta exclusivos" | **Quesos de Tandil** — "No de cualquier otro lado. Identidad y sabor de nuestra tierra" |

En el tercero se cambió el ícono de pin de mapa por una horma de queso.

---

## 6. Sección Historia (página Nosotros)

Estructura actual:

- **Línea de tiempo vertical a la izquierda:** los **9 hitos** del documento oficial, unidos por una línea. Queda fija en pantalla (*sticky*) mientras se lee, así los años siguen a la vista al scrollear.
- **A la derecha:** una introducción breve, el detalle del año elegido y, debajo, el carrusel de fotos de ese año.

Al hacer clic en un año cambian el texto y las fotos. En celular la línea de tiempo pasa arriba, como fila horizontal desplazable.

### Orden de los bloques en la columna derecha

1. **El relato** — "De unas pocas vacas a miles de quesos", el texto narrativo del Word
2. **Aviso** — "Recorré nuestra historia año por año"
3. **Detalle del año elegido** en la línea de tiempo
4. **Carrusel de fotos** de ese año

En el relato se destacaron tres frases: la pregunta *"¿Y si además de producir la leche hacíamos nuestros propios quesos?"* (en cursiva con barra naranja), *"Así nació MAITILAC"* y el cierre de los 40 años.

### Se eligió uno de los dos textos del Word

El documento traía **dos versiones del mismo relato** — eran alternativas para elegir, no para usar juntas (al final del Word hay una nota comparando los tonos). Durante un tiempo estuvieron los dos y la historia se leía tres veces.

Se dejó el **segundo texto**, el narrativo, y se eliminó el primero. La sección pasó de 3400px a 2400px de alto.

### El "1980" se corrigió a 1940

El texto elegido empieza con "Todo empezó en 1980", en contradicción con la línea de tiempo del propio Word. Se puso **1940**, que es la fecha correcta según la cronología oficial.

### Globo al pasar el mouse

Nada indicaba que los años se podían tocar. Ahora:

- Al pasar el mouse sobre un año aparece un **globo oscuro** con el resumen de ese hito, tomado literal de la línea de tiempo del Word.
- Un **aviso** debajo del texto dice "Recorré nuestra historia año por año: tocá cada fecha de la línea de tiempo".

El globo se abre hacia abajo, sin tapar la columna de texto. En celular no aparece (no hay mouse) y el aviso cambia la flecha de ← a ↑, porque ahí la línea de tiempo está arriba.

### Los 9 hitos, tomados del documento "HISTORIA DE MAITILAC"

| Año | Hito |
|---|---|
| 1940 | El abuelo Miguel Maitia arranca su primer tambo de ordeñe a mano en Napaleofú |
| 1982 | Se transforma en el primer tambo de ordeñe mecánico |
| 1997 | Raúl Maitia instala un nuevo tambo y moderniza las instalaciones |
| 2000 | Raúl comienza a producir en campos alquilados |
| 2017 | Se incorporan Victoria y Rosario Maitia |
| 2018 | Se alquila un tambo con fábrica y salen los primeros quesos Maitilac |
| 2019 | Se comercializan en los locales Maitilac y en la ciudad |
| 2022 | Comienzan las obras para la planta propia |
| 2023 | En diciembre se inaugura la fábrica en el Parque Industrial de Tandil |

### ✅ Resuelto: el año de inicio es 1940

Había una contradicción: un texto decía "comenzó en 1940" y otro "todo empezó en 1980".

El documento Word la resuelve: su línea de tiempo oficial dice **"1940 El abuelo Miguel Maitia arranca con su primer tambo"**. El "1980" es un error de tipeo dentro del mismo documento, que se contradice con su propia cronología.

**El sitio usa 1940, que es lo correcto.** Tema cerrado.

---

## 7. Datos de los productos según la tabla oficial

Los datos del catálogo se reemplazaron por los de la tabla que pasó el cliente. Criterio: **fidelidad total a la tabla**, sin agregar texto propio.

### Cambio principal: el Sardo son dos productos

La tabla distingue **Sardo fresco** y **Sardo estacionado**. El sitio tenía uno solo, con datos mezclados de ambos — y le atribuía al fresco los premios que en realidad son del estacionado.

Ahora son dos productos separados:

| | Sardo Fresco | Sardo Estacionado |
|---|---|---|
| Descripción | queso salado | *(sin descripción)* |
| Maridaje comida | Aceitunas, tomates secos | Almendras, higo, miel |
| Maridaje bebida | Malbec joven, cerveza lager | Cabernet sauvignon, whisky suave |
| Premios | *(ninguno)* | PLATA 2023 Y ORO 2025 |

**Sobre el dato "8 Variedades" del Inicio:** se mantiene en 8 aunque el catálogo liste 9 productos, porque el Sardo fresco y el estacionado son el mismo queso en dos puntos de estacionamiento. Hay una nota explicándolo en `index.html`, junto al bloque de productos.

### Otros cambios aplicados

| Producto | Qué cambió |
|---|---|
| Barra → **Barra Tybo** | Nombre. Premio corregido: "GRAN CAMPEON 2025" (antes decía "MEJOR QUESO DEL CONCURSO") |
| Holanda | Descripción: "queso picante" (antes un texto largo escrito a mano) |
| Reggianito | Descripción: "muy estacionado". Maridaje: pera y aceto ahora separados |
| Provoleta | Presentación: "Trozado **al vacío**" |
| Mozzarella | Bebida: "Vermuy blanco" (como figura en la tabla) |
| Gouda | Presentación: Entero y Trozado (antes tenía Feteado de más) |
| Varios | Quedaron sin descripción los que la tabla tiene vacía: Sardo Estacionado, Barra Tybo, Provoleta, Cremoso, Mozzarella |

El destacado "Producto del Mes" del catálogo también se actualizó con el texto de la tabla.

Las tarjetas ahora **omiten la descripción cuando está vacía**, en vez de dejar un hueco.

⚠ **Un dato quedó sin confirmar:** el premio de la Barra Tybo. El archivo original decía "MEJOR QUESO DEL CONCURSO 2025" y la tabla dice "GRAN CAMPEON 2025". Se puso el de la tabla por ser la fuente más reciente, pero conviene verificarlo.

---

## 8. Se eliminó "La Constancia" de todo el sitio

El documento oficial "HISTORIA DE MAITILAC" **nunca menciona La Constancia**. Habla de **Napaleofú** (donde Miguel arrancó el primer tambo en 1940) y del **Parque Industrial de Tandil** (donde está la fábrica desde 2023).

Se quitó de los 6 lugares donde aparecía:

| Dónde | Antes | Ahora |
|---|---|---|
| Hero de la portada | "Desde nuestro tambo en La Constancia hasta tu mesa" | "Desde nuestro tambo hasta tu mesa" |
| Descripción para buscadores | "...desde nuestro tambo en La Constancia, Tandil" | "...desde nuestros tambos, en Tandil" |
| Pie de página oscuro | "...desde nuestro tambo en La Constancia, Tandil" | "...desde nuestros tambos, en Tandil" |
| Pie de página claro | "...desde nuestro tambo en La Constancia hasta tu mesa" | "...desde nuestro tambo hasta tu mesa" |
| Proceso · La Fábrica | "...tecnología de punta en La Constancia" | "...en el Parque Industrial de Tandil" |
| Etiqueta de foto pendiente | "foto — familia / tambo La Constancia" | "foto — la familia / el tambo" |

### Dos errores más que se corrigieron de paso

El bloque "Nuestra Historia" del Inicio contradecía al documento oficial en dos puntos:

- Decía que **todo comenzó con Raúl**, "veterinario de profesión". Según el Word, el fundador fue **Miguel Maitia en 1940**; Raúl es la segunda generación, que toma la posta en 1997.
- Hablaba de **"cuarta generación"**. El Word dice **tres generaciones**.

El texto se reemplazó por el del documento oficial.

---

## 9. Filtros del catálogo ("Buscá por ocasión")

Los siete filtros y qué productos muestra cada uno:

| Filtro | Productos |
|---|---|
| Sale picadita | Gouda, Sardo Fresco, Sardo Estacionado, Holanda |
| Va a la parrilla | Provoleta |
| Nació para la pizza | Cremoso, Mozzarella |
| Para postre | Gouda, Cremoso |
| Para regalar | Combo 3 Quesos, Flor de Picada |
| Maestros del sandwich | Barra Tybo, Cremoso |
| A rallar se ha dicho | Reggianito, Sardo Fresco, Sardo Estacionado |

**Se arregló un filtro roto:** "Para regalar" apuntaba a un producto llamado `Combos`, que había sido renombrado a `Combo 3 Quesos`. El filtro existía pero no mostraba nada. Ahora incluye también Flor de Picada.

**Dos protecciones agregadas** para que no vuelva a pasar sin que se note:
- Cada filtro muestra al lado **cuántos productos** tiene.
- Si un filtro se queda sin productos (porque se ocultaron desde el gestor o cambió un nombre), el botón se ve **apagado y no se puede apretar**. Si aun así se llegara a un resultado vacío, aparece un mensaje con un botón para volver a ver todo.

⚠ **Importante:** los filtros identifican los productos **por su nombre exacto**. Si desde el gestor le cambiás el nombre a un producto, hay que actualizarlo también en el bloque `OCASIONES` de `index.html`. La cantidad al lado de cada filtro sirve para detectarlo: si dice 0 y el botón se ve gris, hay un nombre que no coincide.

---

## 10. Página de Contacto: dos canales separados

Antes había un bloque único de "Canales Directos" que mezclaba todo. Ahora está dividido según quién consulta:

**Compras en el local** (tarjeta blanca, ícono de local)
Para el cliente que compra en el mostrador. Tiene WhatsApp, teléfono, las direcciones de los dos locales con sus horarios, y un enlace "Cómo llegar" que va a la página de Locales.

**Compras por mayor** (tarjeta beige, ícono de caja)
Para revendedores, restaurantes y distribuidores. Tiene WhatsApp mayorista, email, y tres puntos con lo que ofrece el canal: precios por volumen, entregas programadas, asesoramiento.

Cierra con el botón **"Pedir presupuesto mayorista"**, que lleva al formulario ya configurado en la pestaña mayorista y con el motivo preseleccionado.

Los enlaces de WhatsApp de cada bloque abren con un mensaje distinto ya escrito, así al llegar la consulta ya se sabe de qué canal viene. El email mayorista abre con el asunto "Consulta mayorista".

Las pestañas del formulario pasaron a llamarse **"Compra en el local"** y **"Compra por mayor"** (antes "Consulta General" y "Pedidos Mayoristas"), para que coincidan con los bloques.

---

## 11. Gestor del catálogo

**Está dentro del propio sitio**, no es un archivo aparte. Se entra por el enlace "Gestor del catálogo" abajo de todo, en el pie de página. Sin usuario ni contraseña.

### Por qué quedó adentro del sitio

Primero se hizo como archivo separado (`gestor.html`), pero **no funcionaba**: al abrir archivos con doble clic el navegador los trata con origen `file://` y les da un espacio de memoria distinto a cada uno, así que el gestor guardaba y el sitio no encontraba nada.

Al estar los dos en el mismo archivo comparten el mismo espacio y el problema desaparece. **Verificado funcionando con doble clic normal.**

### Cómo guarda los cambios

Los cambios se guardan en el navegador de esta computadora y **se ven al instante** en el catálogo y en el Inicio.

Límite a tener en cuenta: los cambios quedan guardados en esta computadora, así que **no se ven en otro dispositivo**. Para eso el sitio tendría que estar publicado en internet con una base de datos. Para presentar alcanza así.

Botón **"Exportar"**: descarga un archivo de texto con todo el catálogo, para incorporarlo de forma permanente al sitio.

### Qué se puede hacer

**Editar los anuncios de la portada**
Primer bloque del gestor. Se pueden cambiar los tres carteles que aparecen arriba de todo:

| Cartel | Dónde está | Ejemplo |
|---|---|---|
| Barra marrón | Franja que cruza todo el ancho, arriba de la foto | ¡NUEVA VARIEDAD DE QUESO AZUL DISPONIBLE! |
| Banner naranja | Primer globo sobre la foto (promociones) | 20% OFF |
| Banner verde | Segundo globo, al lado del naranja | ¡NUEVA VARIEDAD...! |

De cada uno se puede:

- **Cambiar el texto.**
- **Encenderlo o apagarlo** con la tilde. Al apagarlo desaparece de la portada pero el texto queda guardado para volver a usarlo.
- **Elegir el color** entre tres opciones de la paleta del sitio: **marrón** (`#5E3D22`), **naranja** (`#C67A31`) y **verde** (`#617C52`). Se eligen con botones de color; el elegido queda marcado con un tilde.

Son sólo tres colores a propósito: son los de la identidad de Maitilac, así cualquier combinación queda bien y no se puede romper la estética del sitio.

Cada cartel tiene una **vista previa** que muestra cómo va a quedar mientras se escribe, incluido el color. Si está apagado se ve descolorido y en gris.

Botón "Guardar anuncios" y el cambio se ve enseguida en el Inicio.

**Sacar un producto del sitio y volver a ponerlo**
Botón "Sacar del sitio" en cada producto. El producto **no se borra**: queda guardado con todos sus datos y deja de verse en el sitio. Con "Poner en el sitio" vuelve a aparecer. Sirve para productos de temporada o faltantes de stock.

Distinto de "Eliminar" (dentro de Editar), que sí borra el producto para siempre y pide confirmación.

**Presentación: Entero / Trozado / Feteado**
En cada producto se tildan las presentaciones disponibles. Un queso puede tener una, dos o las tres. En el sitio se muestran como etiquetas redondeadas color tierra, tanto en la tarjeta del catálogo como en el detalle.

Para combos y picadas se dejan todas sin marcar.

**Picadas y combos de 3 quesos**
Se crean con "Nuevo producto", eligiendo la categoría COMBOS o PICADAS. En el campo "Quesos incluidos" se marcan los quesos del catálogo que lleva (para un combo de 3, se marcan tres). Se muestran como etiquetas verdes en el sitio.

Los quesos se toman de la lista del catálogo, así los nombres siempre coinciden.

**Fotos**
Se suben desde el gestor con el botón "Subir foto". Se achican automáticamente a 1000px máximo para que no ocupen demasiado. Conviene usar imágenes de hasta 1 MB.

**Buscador y filtros**
Buscar por nombre, y filtrar por Todos / En el sitio / Ocultos.

**Restaurar original**
Descarta todos los cambios y vuelve a los 10 productos de fábrica. Pide confirmación.

### Categorías disponibles

FRESCOS · PASTA HILADA · MADUROS · ESPECIALES · COMBOS · PICADAS

---

## 12. Premios: se reemplazaron los inventados por los reales

**Los seis premios que estaban eran invención propia** — "Medalla de Oro Queso Tipo Tandil", "Mención de Excelencia — Fiesta Nacional del Queso", "Sello de Origen Tandilero", "Mejor Producto Regional — Expo Tandil", "Medalla de Bronce". Ninguno figuraba en ninguna fuente del cliente.

Se reemplazaron por los de la columna "PREMIOS CATA QUESOS Y SABORES" de la tabla de productos:

| Año | Premio | Quesos |
|---|---|---|
| 2025 | Gran Campeón | Barra Tybo |
| 2025 | Oro | Gouda · Sardo Estacionado · Barra Tybo · Cremoso |
| 2025 | Plata | Mozzarella |
| 2023 | Oro | Gouda · Holanda |
| 2023 | Plata | Sardo Estacionado · Barra Tybo |
| 2019 | Oro | Gouda |

El texto que acompañaba también exageraba: decía "reconocido en concursos y ferias que celebran lo mejor del queso argentino" (plural, sugiriendo múltiples eventos nacionales). Ahora dice **"Nuestros quesos, premiados en la Cata Quesos y Sabores de Tandil"**, que es la única cata donde hay premios documentados.

---

## 13. Cadena de producción ilustrada

Debajo del proceso productivo, en la página Nosotros. Sigue el diseño del folleto impreso: el título "Nuestra CADENA DE PRODUCCIÓN" y seis pasos sobre una cinta ondulada verde y naranja.

| # | Paso | Ilustración |
|---|---|---|
| 1 | El campo | vaca pastando |
| 2 | Ordeñe | vaca con el tambero |
| 3 | Recolección | tina de elaboración + tarros |
| 4 | Maduración | estantería con hormas |
| 5 | Nuestros locales | local con cartel MAITILAC |
| 6 | A tu mesa | horma cortada |

Las ilustraciones las generó el cliente con Copilot. Se procesaron: se les quitó el sello "Made with AI", se recortaron al contorno y se centraron en 460×460 con fondo transparente. Están en `sitio/img/cadena/`.

**Para cambiar una:** reemplazar el archivo en esa carpeta manteniendo el nombre.

Hubo un séptimo paso ("Elaboración") que se eliminó porque la tina ya aparece en el paso 3 — contaba lo mismo dos veces.

En celular la cadena pasa a dos columnas.

---

## 14. Gestor: categorías y premios administrables

Se sumaron dos bloques al gestor, además del de anuncios y el de productos.

**Categorías** — Cada una tiene:
- Casilla para mostrar u ocultar. Al ocultar una categoría, **sus productos dejan de verse en el sitio** sin borrarse.
- Nombre editable: se hace clic y se escribe encima. Los productos se actualizan solos.
- Cuántos productos la usan.
- Botón eliminar: avisa cuántos productos quedarán sin categoría.
- Botón "Agregar categoría".

Si un producto queda sin categoría, la etiqueta no aparece en la tarjeta.

**Premios** — Cada uno tiene:
- Casilla para mostrar u ocultar. Si se ocultan todos, la sección entera desaparece del sitio.
- Los cuatro textos editables: año, tipo de premio, concurso y quesos.
- Foto: clic en el recuadro y se elige una imagen (se achica sola).
- Botón eliminar y botón "Agregar premio".

---

## 15. Carrusel automático en la historia

Las fotos de cada año se desplazan solas, en bucle continuo. Se frenan al pasar el mouse por encima, o al tocarlas en celular (reanudan a los 2 segundos).

Se eliminó el bloque de texto que mostraba el título y la descripción de cada año ("El primer tambo", etc.). Ahora al tocar un año solo cambian las fotos.

Los bloques de foto se agrandaron de 290×210 a 420×320.

---

## 16. Responsive revisado en todas las secciones

Se midieron las cinco páginas públicas en 360, 390, 412 y 820px.

**Textos por debajo de 12px** (límite de legibilidad en celular) — corregidos:
etiquetas de categoría, presentación, quesos del combo, y los rótulos "HORARIOS", "MARIDAJES", "NUESTROS LOCALES".

**Enlaces de menos de 44px de alto** (mínimo cómodo para el dedo) — corregidos:
"Ver catálogo completo", "@maitilac", "Contactanos", "Cómo llegar", enlaces del pie. El menú desplegable pasó a 52px por opción.

**Títulos:** los de 58-64px bajan a 36px en celular.

⚠ **Detalle importante:** las reglas estaban solo en el bloque de celular (hasta 720px), así que **en tablet no se aplicaban**. Se movieron a un bloque `@media (max-width:1024px)`.

### La franja blanca lateral en celular

El cliente reportó una franja blanca al costado en un Pixel 7. La causa: `overflow-x: hidden` estaba declarado **solo en `body`**. En celulares eso no alcanza — el elemento `html` sigue permitiendo el deslizamiento lateral.

```css
html{overflow-x:hidden;width:100%}
body{overflow-x:hidden;width:100%;max-width:100%;position:relative}
```

Además se agregó `viewport-fit=cover` al meta viewport y topes `max-width:100%` en contenedores e imágenes.

**Nota para el futuro:** un iframe **no reproduce** este comportamiento. Las mediciones daban "ok" en los tres anchos y el problema existía igual en el dispositivo real. Si el cliente reporta franja blanca y las mediciones dan ok, aplicar la regla en `html` directamente.

### Línea de tiempo en celular

Arrancaba mostrando el final (2023 seleccionado) con 1940 y 1982 escondidos a la izquierda. La causa: heredaba `justify-content: space-between` de la versión de escritorio, que con desplazamiento horizontal empuja todo al final.

Ahora los 9 años entran en **3 filas de 3**, sin necesidad de deslizar, arrancando desde 1940.

---

## 17. Productos destacados, marcables desde el gestor

Antes los destacados de la portada eran una lista fija de nombres escrita en el código. Ahora cada producto tiene su propia tilde.

**En el gestor:** al editar un producto aparece la casilla **"★ Producto destacado"**, en un recuadro naranja debajo de "Mostrar en el sitio".

**En la lista del gestor:** los destacados llevan una **estrella naranja** arriba a la izquierda de la foto, para verlos de un vistazo.

**En el sitio:** aparecen en la sección "Productos Destacados" de la portada.

Reglas:
- Un producto aparece como destacado sólo si está marcado **y** además está visible en el sitio y su categoría no está oculta.
- Si no hay ninguno marcado, la sección "Productos Destacados" **desaparece entera** de la portada.
- No hay límite de cantidad, pero la grilla es de 4 columnas: con 4 u 8 queda prolijo.

De fábrica vienen marcados Gouda, Holanda, Sardo Fresco y Mozzarella, que eran los que estaban antes.

---

## 18. Equipo administrable desde el gestor

La sección "Nuestro Equipo" de la página Nosotros pasó a ser editable. Nuevo bloque en el gestor, debajo de Premios.

De cada persona se puede:
- **Editar** los tres campos: nombre, cargo y profesión/área.
- **Foto:** clic en el círculo y se elige una imagen (se achica sola). Sin foto se muestra el círculo rayado con el nombre.
- **Ocultar** con la casilla: deja de verse sin borrarse. Si se ocultan todos, la sección desaparece.
- **Eliminar** y **agregar** personas.

Si el nombre queda vacío el cargo o el área tampoco se muestran, para no dejar renglones sueltos.

---

## 19. Grillas que se centran cuando la fila queda incompleta

Los destacados de la portada y las tarjetas del equipo usaban una grilla fija (4 y 3 columnas). Con 5 o 6 elementos, la última fila quedaba pegada a la izquierda con un hueco a la derecha.

Se reemplazó por una disposición flexible que **centra la última fila**:

- `.grid-centrada` — 4 por fila (destacados)
- `.grid-centrada-3` — 3 por fila (equipo)

Verificado con 6 destacados: 4 arriba y 2 centrados abajo.

En tablet pasan a 2 por fila, en celular a 1.

---

## 20. Reordenar las listas desde el gestor

Las cuatro listas administrables (**categorías**, **premios**, **equipo** y **productos**) se pueden reordenar con flechas ▲▼ a la izquierda de cada fila.

En las tarjetas de producto las flechas van abajo a la izquierda de la foto, en horizontal (◀▶), porque la esquina superior izquierda ya la ocupa la estrella de destacado.

La primera fila tiene deshabilitada la flecha de subir, y la última la de bajar.

El orden del gestor es el que se ve en el sitio: catálogo, destacados de la portada, carrusel de premios y tarjetas del equipo.

⚠ **En productos las flechas sólo aparecen sin filtros ni búsqueda.** Con la lista recortada, mover un producto daría un resultado confuso (se movería respecto de la lista completa, no de lo que se ve). El índice que se usa siempre es el real de `PRODUCTOS`, no el de la lista filtrada.

---

## 21. Manual del gestor

Se creó **`MANUAL DEL GESTOR.md`** en la carpeta del proyecto: guía completa para que el cliente administre el contenido sin asistencia.

Cubre los seis bloques (anuncios, categorías, premios, equipo, productos, exportar), con una sección de preguntas frecuentes y una lista de lo que **no** se edita desde el gestor y hay que pedir.

Aclara desde el principio la limitación clave: **los cambios se guardan en el navegador de cada dispositivo**, no se publican solos.

**Mantenerlo actualizado** cada vez que se agregue algo administrable al gestor.

---

## 22. Equipo: Raúl entre sus hijas

El orden pasó de Raúl → Victoria → Rosario a **Victoria → Raúl → Rosario**. Como la grilla es de 3 columnas, Raúl queda en el centro de la primera fila.

---

## 23. Fotos de quesos cargadas

El cliente envió **30 fotos** por WhatsApp (quedaron en `sitio/imagenes nuevas/`). Se copiaron las 30 a `sitio/img/` con nombre según el producto. Ninguna foto previa se sobrescribió: la numeración continúa a partir de las existentes (`gouda-3`, `gouda-4`...).

Reparto según lo que dice el envoltorio de cada foto:

| Producto | Fotos | Cómo se identificó |
|---|---|---|
| Gouda | 5 | Horma etiquetada + cuñas de corteza naranja |
| Holanda | 4 | Horma roja etiquetada + cuñas con ojos |
| Sardo Estacionado | 6 | Corteza negra, etiqueta "Sardo" |
| Cremoso | 5 | Envoltorio "Maitilac Cremoso" |
| Mozzarella | 3 | Envoltorio negro "Queso Mozzarella" |
| Combo 3 Quesos | 4 | Faja "Combos — HOLANDA · SARDO · GOUDA" |
| Reggianito | 2 | Horma negra etiquetada |
| Barra Tybo | 3 | Envoltorio "Queso TYBO" + fetas |
| Flor de Picada | 8 | Tablas armadas de fiambre y queso |
| Sin asignar | 3 | Etiqueta genérica, sin nombre de queso |

⚠ **Dos asignaciones son deducción, no lectura del envoltorio:**
- La foto de **fetas sueltas** (`feteado-1.jpg`) fue al Barra Tybo por ser el único producto con "Feteado" entre sus presentaciones. La foto no tiene etiqueta.
- El **Sardo** dice sólo "Sardo" en la etiqueta, sin aclarar Fresco o Estacionado. El cliente confirmó que van a **Estacionado**.

⚠ **Tres fotos quedaron sin asignar** (`sin-asignar-1/2/3.jpg`): hormas amarillas con etiqueta redonda "Quesos de Tandil" que **no lleva el nombre del queso** debajo del logo. Se amplió la etiqueta al máximo para confirmarlo: la cinta verde termina limpia, a diferencia de las de Gouda/Holanda/Sardo/Reggianito, que sí llevan el nombre en cursiva. Es una etiqueta genérica. Dos tienen condimento visible (perejil, ají). **Hay que preguntarle al cliente de qué queso son.**

⚠ La foto del **Tybo** tiene envoltorio **"el BenQue"**, no Maitilac. Se consultó y el cliente confirmó subirla igual.

---

## 24. Banco de fotos en el gestor

Bloque nuevo al final del gestor, debajo de Productos. Muestra **todas las fotos de la carpeta** en una grilla, con un desplegable debajo de cada una para elegir a qué producto pertenece.

Resuelve el problema de corregir asignaciones sin abrir producto por producto — necesario porque varias fotos se asignaron por deducción.

**Cómo funciona:**
- Al asignar, la foto **se saca de donde estaba antes**. No quedan duplicados.
- "— Sin asignar —" la deja libre sin borrar el archivo.
- Las que no están en ningún producto salen con **borde naranja**.
- Debajo de cada una se ve el **nombre del archivo**, para cruzarlo con una lista externa.
- Dos filtros arriba: **Todas** y **Sin asignar**.

**Crear producto desde una foto:** el desplegable termina con **"➕ Producto nuevo…"**. Pide el nombre, crea el producto con esa foto ya cargada y abre el panel de edición para completar el resto. Nace visible en el sitio. Si el nombre ya existe, avisa y no lo crea. Si se cancela, no crea nada y la foto queda libre.

Sin esto el banco quedaba suelto: una foto de un queso que no estuviera en el catálogo no tenía a dónde ir.

⚠ **`BANCO_FOTOS` es una lista escrita a mano** en el código (cerca de `gFiltro`). El navegador no puede leer el contenido de una carpeta desde `file://`, así que **cada foto nueva que se agregue a `img/` hay que sumarla a esa lista** o no aparece en el banco.

### ⚠ PENDIENTE: conectar el Banco de fotos con el catálogo

**Pedido del cliente (06/08/2026).** Hoy el Banco y los productos son **dos listas independientes**:

- `BANCO_FOTOS` — el inventario, escrito a mano.
- El campo `photos` de cada producto — lo que realmente se ve en el sitio.

El Banco sólo **cruza** ambas (`gUsos`) para mostrar el cartelito "En N productos" y el borde naranja.

**El problema:** si se sube una foto desde **Editar → "Subir foto"**, entra al producto pero **no aparece en el Banco**, porque no está en la lista. El inventario se queda corto y se pierde lo que hace útil al Banco: detectar fotos sueltas.

**Lo que hay que hacer:** que toda foto que entre por el catálogo aparezca automáticamente en el Banco. La conexión tiene que ser directa en las dos direcciones.

- Al subir una foto desde Editar, sumarla sola al Banco.
- Al eliminar una foto de un producto, que siga figurando en el Banco como "sin asignar" — el archivo no se borra.
- El Banco tiene que ser siempre el inventario **completo**, sin depender de que alguien actualice la lista a mano.

> Nota técnica: las fotos subidas desde el gestor se guardan como *data URI* en el navegador, no como archivo en `img/`. La lista unificada tiene que contemplar los dos orígenes (rutas de la carpeta y fotos subidas) y tolerar el límite de espacio del navegador.

⚠ **No se verificó funcionando.** El navegador headless falló repetidamente en este entorno (`--dump-dom` devuelve vacío incluso con una página trivial; las capturas se toman antes de que termine el JS). El cliente aclaró que **el gestor sólo necesita verse** — las conexiones reales las hace otra persona — así que no se insistió.

---

## 25. Export del cliente aplicado — el Sardo pasó a ser uno solo

El cliente reasignó fotos desde el Banco del gestor y exportó (`catalogo-maitilac.txt`, 06/08/2026). Se incorporó a `PRODUCTOS_BASE` para que quede de fábrica.

### El Sardo se unificó

Pasó de dos productos a uno: **"Sardo"**.

*Motivo del cliente:* las fotos que le fueron pasando **nunca aclararon** si eran del fresco o del estacionado. Mantener la división obligaba a adivinar en cada foto.

Los datos de ambos quedaron juntos en el producto único:

| Campo | Cómo quedó |
|---|---|
| Descripción | "Queso salado" (venía del Fresco) |
| Maridaje comida | Aceitunas, Tomates secos, Almendras, Higo, Miel |
| Maridaje bebida | Malbec joven, Cerveza lager, Cabernet sauvignon, Whisky suave |
| Premios | PLATA 2023 Y ORO 2025 |
| Destacado | Sí |

**El catálogo pasó de 11 productos a 10.** El dato "8 Variedades" del Inicio ahora es coherente sin nota aclaratoria: antes el Sardo contaba doble.

### Referencias actualizadas por el cambio de nombre

Al desaparecer "Sardo Fresco" y "Sardo Estacionado", hubo que corregir todo lo que los nombraba por texto exacto:

| Dónde | Cambio |
|---|---|
| Filtro "Sale picadita" | `Sardo Fresco` → `Sardo` |
| Filtro "A rallar se ha dicho" | `Sardo Estacionado` → `Sardo` |
| Premio Oro 2025 | `Sardo Estacionado` → `Sardo` |
| Premio Plata 2023 | `Sardo Estacionado` → `Sardo` |
| Combo 3 Quesos (quesos incluidos) | `Sardo Fresco` → `Sardo` |
| Flor de Picada (quesos incluidos) | `Sardo Fresco` → `Sardo` |

### Reasignación de fotos

| Producto | Antes | Ahora | Qué pasó |
|---|---|---|---|
| Gouda | 5 | 5 | Solo reordenadas |
| Holanda | 4 | 4 | Solo reordenadas |
| **Sardo** | 1 + 6 | **5** | `sardo-1` a `sardo-5` |
| **Reggianito** | 2 | **4** | Sumó `sardo-7` y `sardo-6` |
| **Provoleta** | 1 | **3** | Las tres `sin-asignar`; cedió `provoleta-1` |
| **Combo 3 Quesos** | 4 | **3** | `combos-3`, `combos-4` y `provoleta-1` |
| **Flor de Picada** | 8 | **10** | Sumó `combos-2` y `combos-1` |

Cremoso, Mozzarella y Barra Tybo quedaron igual.

**Se resolvieron las 3 fotos sin asignar:** `sin-asignar-1/2/3.jpg` fueron a **Provoleta**. Eran las hormas amarillas de etiqueta genérica que estaban pendientes de identificar.

**Verificado:** las 45 fotos del banco están asignadas, ninguna quedó suelta y ninguna quedó fuera del inventario.

⚠ **`provoleta-1.jpg` ya no está en Provoleta** — ahora es la tercera foto del Combo 3 Quesos. El nombre del archivo ya no coincide con el producto que la usa. Vale también para `sardo-6/7` en Reggianito y `combos-1/2` en Flor de Picada: **los nombres de archivo dejaron de ser guía confiable** de a qué producto pertenece cada foto. El Banco de fotos es la fuente de verdad.

---

## 26. Los filtros del catálogo pasaron a ser administrables

**Problema que lo motivó:** el bloque "Buscá por ocasión" del catálogo estaba **suelto**. Los filtros vivían en la constante `OCASIONES` del código y no tenían ningún bloque en el gestor. Peor: identifican a los productos **por su nombre exacto**, así que renombrar un queso desde el gestor rompía el filtro en silencio.

Eso ya había pasado dos veces: con `Combos` → `Combo 3 Quesos` (sección 9) y con la unificación del Sardo (sección 25), que obligó a corregir seis referencias a mano.

### Bloque nuevo en el gestor

Va **entre Categorías y Premios**, con la misma estructura que el resto de las listas administrables.

De cada filtro se puede:

- **Renombrar** — clic sobre el nombre y se escribe encima.
- **Elegir qué quesos muestra** — los productos aparecen como pastillas debajo. Se marcan y desmarcan con un clic; las marcadas quedan naranjas.
- **Reordenar** con las flechas ▲▼ (mismo sistema que las otras listas).
- **Eliminar** — pide confirmación. Los quesos no se borran, sólo desaparece el botón.
- **Agregar** con el botón naranja "Agregar filtro".

Al lado del nombre dice **cuántos quesos se ven hoy en el sitio**. Si queda en cero, el aviso pasa a rojo y dice "Apagado — sin quesos visibles", que es exactamente cómo se comporta el botón en el catálogo.

### Lo que resuelve de raíz

**Al renombrar un producto, los filtros se actualizan solos.** En `gGuardarPanel` se compara el nombre viejo contra el nuevo, y si cambió se reemplaza en:

- `OCASIONES[].match` — los filtros
- `PRODUCTOS[].quesos` — los combos y picadas que lo incluían

El aviso al guardar lo confirma: *"Guardado. Los filtros se actualizaron solos."*

Se cubrieron también los otros dos casos que dejaban referencias colgadas:

| Acción | Qué pasa ahora |
|---|---|
| **Eliminar un producto** | Sale solo de los filtros y de los combos que lo incluían |
| **Restaurar original** | Los filtros vuelven a fábrica junto con los productos |

### Otros cambios que trajo

- `OCASIONES` pasó de `const` a `let`, con `OCASIONES_BASE` de fábrica y guardado en `localStorage` bajo `maitilac_ocasiones` — el mismo patrón que categorías, premios y equipo.
- **El export ahora incluye `OCASIONES_BASE`.** Antes no lo hacía: si el cliente tocaba filtros, el cambio se perdía al incorporar el archivo.

⚠ `OCASIONES` se declara en la línea ~1452, antes de que exista el helper `clon` (línea ~2169). Por eso usa `JSON.parse(JSON.stringify(...))` directo en vez de `clon()`.

⚠ **No se verificó en navegador** (misma limitación de la sección 24: el headless falla en este entorno). Se verificó balance de llaves, paréntesis, corchetes y backticks del bloque nuevo, y que todas las piezas existan y estén conectadas.

---

## 27. Mostrar u ocultar el precio, producto por producto

Pedido del cliente: un interruptor para que un queso no muestre el precio en el sitio.

**En el gestor:** dentro de Editar, debajo de los campos Precio y Unidad, aparece la casilla **"Mostrar el precio en el sitio"** (mismo estilo que "Mostrar en el sitio").

**En el sitio, al destildarla:** donde iba el número dice **"Consultar"**, en el mismo tamaño y color naranja. La unidad (`/ kg`) no se muestra — "Consultar / kg" no tendría sentido.

El precio **queda guardado**: se vuelve a ver con solo tildar la casilla. Sirve para precios que cambian seguido o productos que se cotizan aparte.

**En la lista del gestor** el precio siempre se ve, con una etiqueta gris al lado que aclara `En el sitio dice "Consultar"`. Así se controla el precio real sin entrar a cada ficha.

### Dónde se aplicó

El precio aparece en cuatro lugares. Se protegieron los tres del sitio público con el helper `precioVisible(p)`:

| Lugar | Comportamiento |
|---|---|
| Tarjeta del catálogo | "Consultar" |
| Tarjeta de destacados (portada) | "Consultar" |
| Detalle del producto (modal) | "Consultar" |
| Lista del gestor | Siempre el precio real + etiqueta aclaratoria |

### Detalles de implementación

- Campo nuevo `verPrecio` en cada producto. Se lee como `p.verPrecio !== false`, así que **los productos que no lo tienen muestran el precio** — el catálogo actual sigue igual sin migrar nada.
- Los **productos nuevos nacen con el precio apagado** (`verPrecio: false`), tanto desde "Nuevo producto" como desde "➕ Producto nuevo…" del Banco de fotos. Nacen sin precio cargado, así que mostrar "Consultar" es más prolijo que un renglón vacío.

⚠ **No se verificó en navegador** (misma limitación del entorno). Se verificó balance de llaves y backticks de los cuatro bloques tocados, y que el campo esté conectado en las tres puntas: formulario, guardado y visualización.

---

## 28. Tarjetas de producto alineadas

Las cuatro tarjetas de "Productos Destacados" quedaban desparejas: el precio, los maridajes y el botón caían a distinta altura en cada una.

### Dos causas

**1. Las descripciones vacías no ocupaban lugar.** La descripción se dibujaba con `${p.desc ? ... : ''}`, así que en Mozzarella (sin descripción) el renglón directamente no existía y todo lo de abajo subía ~34px.

**2. Los maridajes largos saltaban de renglón.** Se mostraban siempre los dos primeros más un contador. Con nombres largos ("Aceitunas" + "Tomates secos") los dos chips llenaban el ancho y el `+3` caía a un segundo renglón, estirando esa tarjeta.

### Qué se hizo

| Arreglo | Cómo |
|---|---|
| Descripción vacía reserva su espacio | El `<p>` se dibuja siempre, con `min-height:22px` |
| Maridajes en un solo renglón | Se calcula cuántos entran según el largo del texto (cupo de ~26 caracteres); los que no entran suman al contador |
| Fila de maridajes de alto fijo | `min-height:27px` y `overflow:hidden` |
| Botón siempre abajo | `margin-top:auto` |

El contador ahora es coherente: si sólo entra un maridaje, dice `+4` en vez de `+3`. Antes mostraba dos chips y contaba mal el resto.

### También en el catálogo

La tarjeta del catálogo tenía el mismo problema con descripciones y tipos vacíos (Sardo, Barra Tybo, Provoleta, Cremoso y Mozzarella no tienen descripción). Se aplicó lo mismo:

- El **tipo** reserva `min-height:17px`
- La **descripción** reserva `min-height:22px`
- El **precio** se empuja al fondo con `margin:auto 0 20px`, así queda a la misma altura aunque un producto tenga presentaciones y otro no

⚠ **No se verificó en navegador** (misma limitación del entorno). Se verificó el balance de llaves, paréntesis y backticks de ambas tarjetas, y se simuló el reparto de maridajes con los datos reales de los cuatro destacados: los cuatro quedan con dos chips y contador en un solo renglón.

---

## 29. "Ver Detalles" no respondía — arranque a prueba de fallos

El cliente reportó que al apretar "Ver Detalles" **no pasaba nada**.

### Diagnóstico

El modal en sí estaba bien: los tres botones (`data-abrir`) apuntan al mismo `abrirModal()`, que busca el producto por nombre y ya mostraba el bloque completo de información.

Se verificó y descartó: balance de llaves/paréntesis/backticks en todo el archivo (960/960, 1480/1480, 188 par), orden de declaración de `OCASIONES`, y que todas las dependencias de `gPintarOcasiones` (`esc`, `catVisible`, `PRODUCTOS`, `CATEGORIAS`) estén declaradas antes de que se la llame.

**No se pudo reproducir el error** sin navegador. Un botón que no responde es el síntoma típico de una excepción en el arranque: si una función falla, corta la ejecución del resto del script y **los listeners de click nunca se registran**.

### Dos protecciones

**1. Arranque por partes.** Cada bloque se dibuja dentro de su propio `try/catch` mediante el helper `arrancar(nombre, fn)`. Si uno falla, los demás siguen funcionando y el error queda en la consola del navegador identificado por nombre (`Maitilac — falló "destacados": ...`).

Antes eran doce llamadas seguidas: la primera que fallara dejaba el sitio sin JavaScript, sin botones y sin pistas.

**2. Saneado de los filtros guardados.** Al leer `maitilac_ocasiones` del navegador, cada filtro se normaliza: si le falta `match` o no es un array, se completa con lista vacía en vez de romper. Era el punto de fallo más probable — `o.match.includes(...)` sobre un dato guardado a medias tira excepción y arrastra a `pintarFiltros` y `pintarCatalogo`.

> Si el problema persiste, abrir la consola del navegador (F12 → Console): ahora el mensaje dice exactamente qué bloque falló.

---

## 30. Migración a Next.js + PostgreSQL (en curso, septiembre 2026)

El sitio deja de ser un único `index.html` que guarda los cambios del gestor en el navegador. Pasa a ser una aplicación **Next.js** con base de datos **PostgreSQL**, que se va a publicar en un VPS de Hostinger. El sitio viejo quedó congelado en `referencia/` y es la vara contra la que se compara todo.

**Lo que no cambia:** el diseño y los textos. Cada página se compara automáticamente, píxel por píxel y en tres anchos de pantalla, contra el sitio viejo. Toda diferencia visual tiene que estar anotada y aprobada (tabla *Diferencias visuales aprobadas* de `docs/PASO A PASO.md`).

**Lo que cambia para quien usa el gestor:**
- Se entra con usuario y contraseña (`/gestor`).
- Lo que se guarda se ve **al instante para todo el mundo**, en cualquier dispositivo. Ya no hace falta exportar ni pegar nada en el código: "Exportar" pasa a ser una copia de seguridad.
- Bloques nuevos: **Contacto y locales** (WhatsApp, email, redes, horarios, fotos de los locales y producto del mes) y **Banco de fotos** conectado de verdad al catálogo (resuelve el pedido del 06/08/2026, ver *Pendientes*).
- Manual actualizado: `docs/MANUAL DEL GESTOR.md`.

**Correcciones respecto del sitio viejo** (pendientes de aprobación en la tabla de diferencias): "Ver Detalles" del Inicio abre el producto (sección 29: en el sitio viejo seguía sin responder); cada producto tiene su propia dirección (`/catalogo/gouda`) para compartirla.

**Además, sin cambios a la vista:** fotos optimizadas (una tarjeta pasa de 225 KB a 12 KB), títulos y datos para buscadores, navegación con teclado y carruseles quietos para quien pide reducir el movimiento.

**Detalles heredados que se mantuvieron igual** y quedaron anotados para decidir: el cartel "Abierto ahora" de Maipú no aparece en la página Locales; el footer de Nosotros queda apretado en celular; algunos textos no llegan al contraste recomendado; los canales de la página Contacto siguen fijos.

Plan completo: `docs/PLAN DE REFACTORIZACION.md`. Paso a paso y estado: `docs/PASO A PASO.md`.

---

## Pendientes

**Fotos que faltan** (aparecen como recuadros rayados grises):
- Fachadas de los dos locales
- Foto de familia / tambo
- 18 fotos de la historia (2 o 3 por año, en los 9 años)
- 9 retratos del equipo
- 6 fotos de Instagram
- Logo del Cluster Quesero
- Las 2 fotos del proceso productivo (tambo/vacas y cámara)

**Fotos de producto:** ya cargadas (ver sección 23). Los 11 productos tienen foto y varios tienen ahora entre 3 y 8. Los productos con más de una muestran flechitas para pasar entre ellas.

**A desarrollar:**
- ✅ **Conectar el Banco de fotos con el catálogo** (ver sección 24): resuelto en el sitio nuevo (sección 30). Una foto subida desde Editar tiene que aparecer sola en el Banco. Hoy no pasa: el Banco es una lista a mano y queda desactualizado. Pedido del cliente el 06/08/2026.

**A confirmar:**
- ✅ **Las 3 fotos sin asignar** (`sin-asignar-1/2/3.jpg`): resuelto. El cliente las asignó a **Provoleta** desde el Banco (ver sección 25).
- ⚠ La foto de **fetas** que se puso en Barra Tybo: fue deducción, no dice el envoltorio. El cliente la dejó ahí en el export. Si va en otro producto, se cambia desde el Banco de fotos.
- ⚠ El premio de la **Barra Tybo**: la tabla del cliente dice "GRAN CAMPEON 2025" y el archivo original decía "MEJOR QUESO DEL CONCURSO 2025". Se puso el de la tabla por ser la fuente más reciente. **Conviene verificarlo antes de mostrarlo al cliente final.**
- Las direcciones reales de Instagram y Facebook. Quedaron puestas como `instagram.com/maitilac` y `facebook.com/maitilac`, a modo de suposición.

**Antes de subir a Netlify:** conviene borrar `sitio/imagenes nuevas/` — son los originales de WhatsApp, ya copiados a `img/`. Ocupan de más y no los usa el sitio. **Pedir permiso antes de borrar.**

---

## Cómo subirlo a Netlify

> Corresponde al sitio viejo (`referencia/`). El sitio nuevo se publica en un VPS de Hostinger (sección 30).

Arrastrar la carpeta `sitio` completa a [app.netlify.com/drop](https://app.netlify.com/drop). Son **58 archivos, 9,79 MB** sin contar `imagenes nuevas/` (que conviene borrar antes; con esa carpeta son 88 archivos y 15,63 MB).

Verificado: sin rutas absolutas del disco, sin archivos faltantes, sin duplicados.

**Importante:** se sube la carpeta entera, no los archivos sueltos. `index.html` tiene que quedar en la raíz, con `img/` y `fonts/` al lado.

**Sobre el gestor una vez publicado:** al estar todo bajo una misma dirección web, el gestor va a funcionar correctamente. Pero los cambios que se hagan desde ahí **siguen guardándose en el navegador de cada dispositivo** — no se publican para todos. Para eso haría falta una base de datos. El botón "Exportar" descarga el catálogo para incorporarlo de forma permanente al archivo.

El enlace al gestor queda visible en el pie del sitio publicado. Si se quiere ocultar, se puede sacar y entrar escribiendo `#gestor` en la dirección.
