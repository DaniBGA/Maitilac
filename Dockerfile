# syntax=docker/dockerfile:1
# Imagen de producción del sitio (docs/PASO A PASO.md, Etapa 4).
#   docker build -t maitilac --build-arg SITIO_URL=https://<dominio> .
# Al arrancar aplica las migraciones y levanta el sitio. Herramientas incluidas:
#   node herramientas/importar.mjs [--forzar]    datos de fábrica
#   node herramientas/crear-usuario.mjs <email> "<Nombre>"

FROM node:24-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@12.6.0
WORKDIR /app

FROM base AS dependencias
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Parche sobre Next (ver patches/next.patch y docs/PASO A PASO.md, Etapa 4).
COPY patches ./patches
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

FROM base AS compilacion
COPY --from=dependencias /app/node_modules ./node_modules
COPY . .
# El build no se conecta a la base (las páginas se arman en cada pedido). SITIO_URL sí
# se usa al compilar (robots.txt y metadatos); los otros dos son de relleno.
ARG SITIO_URL=http://localhost:3000
RUN SITIO_URL=$SITIO_URL \
    DATABASE_URL=postgres://compilacion@localhost:1/compilacion \
    BETTER_AUTH_SECRET=relleno-solo-para-compilar \
    pnpm build && pnpm herramientas

FROM node:24-slim AS sitio
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 FOTOS_DIR=/data/fotos
WORKDIR /app
COPY --from=compilacion /app/.next/standalone ./
COPY --from=compilacion /app/.next/static ./.next/static
COPY --from=compilacion /app/public ./public
COPY --from=compilacion /app/.next/herramientas ./herramientas
COPY --from=compilacion /app/db/migraciones ./db/migraciones
COPY --from=compilacion /app/db/importar/data ./db/importar/data
# Carpetas de los volúmenes (fotos subidas y caché de imágenes), del usuario sin privilegios.
RUN mkdir -p /data/fotos /app/.next/cache && chown -R node:node /data /app/.next/cache
USER node
EXPOSE 3000
CMD ["sh", "-c", "node herramientas/migrar.mjs && exec node server.js"]
