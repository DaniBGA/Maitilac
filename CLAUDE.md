@AGENTS.md

# Sitio Maitilac — contexto del proyecto

Migración del sitio viejo (un único `index.html`, congelado en `referencia/`) a Next.js + PostgreSQL en un VPS de Hostinger.

Para trabajar: `pnpm db:levantar` (Postgres en Docker, puerto 5440) y `pnpm dev`. Datos: `lib/datos.ts` (con caché por etiqueta; el gestor invalida con `updateTag`).

Gestor: Server Actions en `lib/gestor/acciones.ts`, todas por `accion()` (sesión → cambios → `updateTag`). Bloques en `components/gestor/`. Los bloques que el gestor viejo no tenía llevan `data-nuevo` (el test visual los quita). Manual para quienes lo usan: `docs/MANUAL DEL GESTOR.md`.

- Plan (qué y por qué): `docs/PLAN DE REFACTORIZACION.md`
- Guía de ejecución (cómo, paso a paso, y estado actual): `docs/PASO A PASO.md` — seguir desde la primera casilla sin tildar.
- Historia y decisiones del sitio viejo: `docs/REGISTRO DE CAMBIOS.md`

Reglas que no se negocian (detalle en la sección 0 del plan y en el "Contrato de diseño" de la guía):
- El diseño tiene que quedar idéntico al de `referencia/`. Verificar con `pnpm test:visual`; las capturas de referencia sólo se generan desde `referencia/` (`pnpm ref:capturar`), nunca desde el sitio nuevo.
- Textos tal cual, sin corregir ni inventar datos.
- `referencia/` no se edita. Pedir permiso antes de borrar o mover archivos.
