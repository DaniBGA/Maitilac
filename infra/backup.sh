#!/usr/bin/env bash
# Copia de seguridad: la base (pg_dump) y las fotos subidas desde el gestor.
# En el VPS corre todos los días desde el cron del usuario deploy (docs/OPERACION.md):
#   0 3 * * * /srv/maitilac/backup.sh >> /srv/maitilac/copias/backup.log 2>&1
# Guarda 7 copias diarias y, los domingos, una semanal (se guardan 4).
set -euo pipefail
cd "$(dirname "$0")"

COPIAS="${COPIAS:-$PWD/copias}"
FECHA="$(date +%F)"
mkdir -p "$COPIAS/diarias" "$COPIAS/semanales"

# Se escribe primero a .tmp: si algo falla a mitad de camino no queda una copia rota.
docker compose exec -T db pg_dump -U maitilac -d maitilac --format=custom > "$COPIAS/diarias/base-$FECHA.dump.tmp"
mv "$COPIAS/diarias/base-$FECHA.dump.tmp" "$COPIAS/diarias/base-$FECHA.dump"
# Las fotos se leen desde Caddy, que tiene el volumen montado (de sólo lectura).
docker compose exec -T caddy tar czf - -C /srv/fotos . > "$COPIAS/diarias/fotos-$FECHA.tar.gz.tmp"
mv "$COPIAS/diarias/fotos-$FECHA.tar.gz.tmp" "$COPIAS/diarias/fotos-$FECHA.tar.gz"

if [ "$(date +%u)" = 7 ]; then
  cp "$COPIAS/diarias/base-$FECHA.dump" "$COPIAS/diarias/fotos-$FECHA.tar.gz" "$COPIAS/semanales/"
fi

# Rotación: las 7 diarias y las 4 semanales más nuevas.
rotar() {
  find "$1" -maxdepth 1 -name "$2" -printf '%T@ %p\n' | sort -rn | tail -n +$(($3 + 1)) | cut -d' ' -f2- | xargs -r -d '\n' rm --
}
rotar "$COPIAS/diarias" "base-*.dump" 7
rotar "$COPIAS/diarias" "fotos-*.tar.gz" 7
rotar "$COPIAS/semanales" "base-*.dump" 4
rotar "$COPIAS/semanales" "fotos-*.tar.gz" 4

echo "$(date '+%F %T') copia lista: base-$FECHA.dump ($(du -h "$COPIAS/diarias/base-$FECHA.dump" | cut -f1)), fotos-$FECHA.tar.gz ($(du -h "$COPIAS/diarias/fotos-$FECHA.tar.gz" | cut -f1))"
