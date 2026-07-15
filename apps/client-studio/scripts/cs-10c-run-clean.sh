#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
APP="$ROOT/apps/client-studio"
DOCS="$ROOT/docs"

echo "=== CS-10C Clean Pipeline Verification ==="

# Kill stale vite instances on common ports
for port in $(seq 5173 5199) 4173 4174; do
  pid=$(lsof -ti tcp:"$port" 2>/dev/null || true)
  if [ -n "$pid" ]; then
    kill $pid 2>/dev/null || true
    echo "killed port $port (pid $pid)"
  fi
done
sleep 2

echo "=== Clear Vite cache + dist ==="
rm -rf "$APP/node_modules/.vite" "$APP/dist"

echo "=== Production build ==="
pnpm --filter @embed-engine/client-studio build

echo "=== Start preview :4174 and dev :4173 ==="
cd "$APP"
pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort > /tmp/cs10c-preview.log 2>&1 &
PREV_PID=$!
pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort > /tmp/cs10c-dev.log 2>&1 &
DEV_PID=$!
sleep 5

curl -sf http://127.0.0.1:4173/ >/dev/null
curl -sf http://127.0.0.1:4174/ >/dev/null
echo "servers up dev=$DEV_PID preview=$PREV_PID"

CS10C_DEV_URL=http://127.0.0.1:4173 CS10C_PROD_URL=http://127.0.0.1:4174 \
  pnpm exec node scripts/cs-10c-pipeline-verify.mjs

echo "=== Dev restart test ==="
kill $DEV_PID 2>/dev/null || true
sleep 1
rm -rf node_modules/.vite
pnpm exec vite --host 127.0.0.1 --port 4173 --strictPort > /tmp/cs10c-dev-restart.log 2>&1 &
DEV2=$!
sleep 5
HASH1=$(shasum -a 256 "$DOCS/cs-10c-dev-canvas.png" | awk '{print $1}')
CS10C_DEV_URL=http://127.0.0.1:4173 CS10C_PROD_URL=http://127.0.0.1:4174 \
  pnpm exec node scripts/cs-10c-pipeline-verify.mjs >/tmp/cs10c-restart-out.json 2>/dev/null || true
HASH2=$(node -e "console.log(JSON.parse(require('fs').readFileSync('/tmp/cs10c-restart-out.json','utf8').match(/\{[\s\S]*\}/)[0]).dev.pngHash)")
echo "restart png hash before=$HASH1 after_report=$HASH2"

kill $DEV2 $PREV_PID 2>/dev/null || true
echo "=== Done ==="
