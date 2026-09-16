#!/bin/bash
set -u

CONTENTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAYLOAD_DIR="$CONTENTS_DIR/Resources/payload"
NODE="$PAYLOAD_DIR/runtime/node"
ENGINE="$PAYLOAD_DIR/localization_engine.js"
LOG_DIR="$HOME/Library/Logs/Antigravity-ZH-Hant-TW-ALT"
LOG_FILE="$LOG_DIR/last-run.log"

mkdir -p "$LOG_DIR"

CHOICE="$(osascript <<'APPLESCRIPT'
button returned of (display dialog "請選擇要執行的動作：" with title "Antigravity 2.0 繁體中文 ALT 版" buttons {"取消", "還原官方英文", "套用繁體中文"} default button "套用繁體中文" cancel button "取消")
APPLESCRIPT
)" || exit 0

if [ "$CHOICE" = "還原官方英文" ]; then
  "$NODE" "$ENGINE" --restore >"$LOG_FILE" 2>&1
  STATUS=$?
  ACTION="還原"
else
  "$NODE" "$ENGINE" >"$LOG_FILE" 2>&1
  STATUS=$?
  ACTION="安裝"
fi

if [ "$STATUS" -eq 0 ]; then
  osascript -e "display dialog \"ALT $ACTION 已完成。請重新開啟 Antigravity。\" with title \"Antigravity ALT\" buttons {\"好\"} default button \"好\""
else
  osascript -e "display dialog \"ALT $ACTION 失敗（exit code $STATUS）。記錄檔：$LOG_FILE\" with title \"Antigravity ALT\" buttons {\"好\"} default button \"好\" with icon stop"
fi

exit "$STATUS"
