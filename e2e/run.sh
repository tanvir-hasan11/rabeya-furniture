#!/usr/bin/env bash
# Run the e2e suite. On a normal machine this is just `npx playwright test`.
# On a musl/Alpine runner the bundled Chromium cannot start, so start the
# system Chromium and drive it over CDP.
set -euo pipefail
cd "$(dirname "$0")/.."

CHROME_PID=""
if [ -z "${PLAYWRIGHT_CDP_WS:-}" ] && command -v chromium >/dev/null 2>&1; then
  PORT=9222
  chromium --headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage \
    --remote-debugging-port=$PORT --user-data-dir=/tmp/pw-chromium-profile about:blank \
    >/tmp/pw-chromium.log 2>&1 &
  CHROME_PID=$!
  for _ in $(seq 1 30); do
    PLAYWRIGHT_CDP_WS=$(curl -s --max-time 2 "http://127.0.0.1:$PORT/json/version" \
      | grep -o '"webSocketDebuggerUrl":[[:space:]]*"[^"]*"' | sed 's/.*"\(ws:[^"]*\)"/\1/' || true)
    [ -n "${PLAYWRIGHT_CDP_WS:-}" ] && break
    sleep 1
  done
  export PLAYWRIGHT_CDP_WS
  echo "chromium cdp: ${PLAYWRIGHT_CDP_WS:-<none>}"
fi

cleanup() { [ -n "$CHROME_PID" ] && kill "$CHROME_PID" 2>/dev/null || true; }
trap cleanup EXIT

npx playwright test "$@"
