#!/usr/bin/env bash

set -u

targets=(
  "hertz-ride-milan|MXP|https://www.hertzride.com/en/locations/milan"
  "hertz-ride-paris|CDG|https://www.hertzride.com/en/locations/paris"
  "hertz-ride-alicante|ALC|https://www.hertzride.com/en/locations/alicante"
  "hertz-ride-lisbon|LIS|https://www.hertzride.com/en/locations/lisbon"
  "hertz-ride-vienna|VIE|https://www.hertzride.com/en/locations/vienna"
  "imtbike-madrid|MAD|https://www.imtbike.com/motorcycle-rentals/spain/madrid/"
)

successes=0
failures=0

for target in "${targets[@]}"; do
  IFS="|" read -r operator airport url <<< "$target"

  echo "[Batch] Harvesting ${operator} (${airport})"
  if env OPERATOR="$operator" AIRPORT="$airport" URL="$url" node scripts/harvestSdk.js; then
    successes=$((successes + 1))
  else
    echo "[Batch] FAILED ${operator} (${airport})" >&2
    failures=$((failures + 1))
  fi
done

echo "[Batch] Complete: ${successes} succeeded, ${failures} failed"
if [ "$failures" -gt 0 ]; then
  exit 1
fi
