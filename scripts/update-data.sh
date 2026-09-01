#!/bin/bash
# update-data.sh — refresh all HDC indicator data, rebuild, commit, push.
# Fully deterministic (no LLM/agent involved) — safe to run directly or via cron.
#
# Usage:
#   ./scripts/update-data.sh            # extract + retry failures + build + commit + push
#   ./scripts/update-data.sh --no-push  # skip git commit/push (local refresh only)
#
set -uo pipefail
cd "$(dirname "$0")/.."

NO_PUSH=false
[[ "${1:-}" == "--no-push" ]] && NO_PUSH=true

LOG_FILE="/tmp/hdc-update-$(date +%Y%m%d-%H%M%S).log"
echo "==> HDC data update started: $(date)" | tee "$LOG_FILE"

# ---- 1. Extract all indicators ----
echo "==> Running extract-indicator.js all ..." | tee -a "$LOG_FILE"
HEADLESS=true node scripts/extract-indicator.js all 2>&1 | tee -a "$LOG_FILE"

# ---- 2. Find failed indicators from this run and retry each once ----
FAILED=$(grep -oE '^\[[a-z0-9_]+\] ล้มเหลว' "$LOG_FILE" | sed -E 's/^\[([a-z0-9_]+)\].*/\1/' | sort -u)

if [[ -n "$FAILED" ]]; then
  echo "==> Retrying failed indicators: $FAILED" | tee -a "$LOG_FILE"
  for key in $FAILED; do
    echo "==> Retry: $key" | tee -a "$LOG_FILE"
    HEADLESS=true node scripts/extract-indicator.js "$key" 2>&1 | tee -a "$LOG_FILE"
  done
fi

STILL_FAILED=$(tail -n 200 "$LOG_FILE" | grep -oE '^\[[a-z0-9_]+\] ล้มเหลว' | sed -E 's/^\[([a-z0-9_]+)\].*/\1/' | sort -u)

# ---- 3. Build to verify data compiles cleanly ----
echo "==> Running npm run build ..." | tee -a "$LOG_FILE"
if ! npm run build >> "$LOG_FILE" 2>&1; then
  echo "==> BUILD FAILED — aborting, not committing. See $LOG_FILE" | tee -a "$LOG_FILE"
  exit 1
fi

# ---- 4. Commit + push only if something actually changed ----
if [[ "$NO_PUSH" == true ]]; then
  echo "==> --no-push set, skipping commit/push." | tee -a "$LOG_FILE"
  exit 0
fi

if git diff --quiet && git diff --cached --quiet; then
  echo "==> No data changes detected, nothing to commit." | tee -a "$LOG_FILE"
  exit 0
fi

TODAY=$(date +%Y-%m-%d)
git add -A
git commit -m "Refresh HDC indicator data ($TODAY)

Automated update via scripts/update-data.sh.
$( [[ -n "$STILL_FAILED" ]] && echo "Still failing after retry: $STILL_FAILED" || echo "All indicators refreshed successfully." )" >> "$LOG_FILE" 2>&1

git push origin main >> "$LOG_FILE" 2>&1

echo "==> Done: $(date)" | tee -a "$LOG_FILE"
if [[ -n "$STILL_FAILED" ]]; then
  echo "==> WARNING: still failing: $STILL_FAILED" | tee -a "$LOG_FILE"
fi
echo "==> Full log: $LOG_FILE"
