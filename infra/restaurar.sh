#!/usr/bin/env bash
# Restaura una copia de seguridad hecha con backup.sh (docs/OPERACION.md).
#   ./restaurar.sh copias/diarias/base-AAAA-MM-DD.dump [copias/diarias/fotos-AAAA-MM-DD.tar.gz]
# Reemplaza TODO lo que hay en la base (y, si se pasa el archivo, las fotos subidas).
set -euo pipefail
cd "$(dirname "$0")"

BASE="${1:?Uso: ./restaurar.sh <base.dump> [fotos.tar.gz]}"
FOTOS="${2:-}"
[ -f "$BASE" ] || { echo "No existe $BASE"; exit 1; }
[ -z "$FOTOS" ] || [ -f "$FOTOS" ] || { echo "No existe $FOTOS"; exit 1; }

read -r -p "Esto reemplaza los datos actuales del sitio por los de $(basename "$BASE"). ¿Seguir? (escribí si) " RESPUESTA
[ "$RESPUESTA" = "si" ] || { echo "Cancelado."; exit 1; }

docker compose stop app
docker compose exec -T db pg_restore -U maitilac -d maitilac --clean --if-exists --no-owner --single-transaction < "$BASE"
if [ -n "$FOTOS" ]; then
  docker compose run --rm --no-deps -T --entrypoint sh app -c 'rm -rf /data/fotos/* && tar xzf - -C /data/fotos' < "$FOTOS"
fi
# Al arrancar, el sitio vuelve a leer todo de la base (la caché empieza vacía).
docker compose start app
echo "Restaurado desde $(basename "$BASE")${FOTOS:+ y $(basename "$FOTOS")}."
