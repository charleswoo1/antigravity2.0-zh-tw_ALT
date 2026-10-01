# Antigravity 上游版本相容性流程

ALT 對 Antigravity 上游版本採用明確 allowlist。版本較新、符合某個 semver 範圍，或唯讀稽核得到 `PASS`，都不會自動成為「已驗證支援版本」。唯一的正式清單是 [`compatibility/manifest.json`](compatibility/manifest.json)。

ALT 1.6.0 已完成 Antigravity `2.13.0`、`2.14.0`、`2.15.0`、`2.15.1`、`2.16.0`、`2.17.0`、`2.18.1` 與 `2.19.1` 的明確相容性驗證。2.16.0 起沿用非同步 WSL 選單重新套用流程，因此 2.16.0、2.17.0、2.18.1 與 2.19.1 使用獨立 profile 驗證兩個 `setApplicationMenu` 套用點。

## 三種判定

- **結構相容候選（candidate structurally compatible）**：唯讀稽核得到 `PASS`，目前檔案結構與 patch anchors 相符，但尚未完成真實安裝的 apply／verify／restore。
- **已驗證支援版本（verified supported version）**：唯讀稽核、synthetic tests 與受控真實 apply／restore 全部通過，並已明確加入 manifest。
- **不支援／阻擋變更（unsupported/blocking change）**：版本未列入 allowlist，或必要結構、anchor、unpacked 路徑、程序狀態與 archive 完整性任一項不安全。

## 上游更新 SOP

```text
官方 Antigravity 更新
→ 本機唯讀 audit
→ 比對 fingerprint 與所有 patch anchors
→ 有差異時人工／Codex review
→ synthetic tests
→ 確認 Antigravity 完全關閉
→ 受控真實 apply → 完整性驗證 → restore
→ 確認官方未中文化 archive 已精確還原
→ 明確將版本標為 verified
→ PR review → 人工 release
```

官方更新通常會覆蓋既有中文化。更新後應先保持官方版本，等該版本出現在 verified allowlist，再重新套用 ALT。

## 唯讀稽核

```powershell
npm ci
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --json .build\audit.json --fingerprint .build\fingerprint.json
```

Exit code：`0` = `PASS`、`2` = `REVIEW_REQUIRED`、`3` = `BLOCKED`。稽核只可在 OS 暫存目錄與指定輸出位置寫入資料，不得建立 `app.asar.bak` 或替換真實 `app.asar`。fingerprint 只保存版本、大小、SHA-256、成員存在狀態與 anchor 計數，不保存官方檔案內容。

## 安裝器安全邊界

Windows 安裝器在進入 mutation 前先執行同一套相容性 auditor。preflight 會唯讀確認安裝位置、archive 版本、明確 allowlist、結構／anchors、unpacked 路徑與程序狀態。只有 `PASS` 才可進行備份、暫存解包、patch、暫存重打包、驗證及原子替換。

archive 不會原地修改。替換期間保留原始 archive；替換或 post-replacement 驗證失敗時，必須自動 rollback 並以 SHA-256 確認原始 archive 已回到正式路徑。synthetic E2E 的 log override 只接受系統暫存目錄內含 `antigravity-alt-installer-` 的測試路徑，正常使用者記錄仍位於 `%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\`。

## Windows GPU 啟動相容性：歷史狀態與疑難排解

先前曾在 Windows 11 25H2 / Build 26200.x 的受影響測試機觀察到 Antigravity 關閉後無法再次啟動，症狀集中在 GPU / renderer 啟動路徑；未套用 ALT 的官方英文版也曾能重現。因此這項問題未被歸因於中文化 patch 本身。

2026-09-30，在原本可重現問題的同一測試環境、Antigravity 2.18.1 上，以完全正常的啟動方式連續執行 10 次「啟動 → 完整載入 → Quit → 再啟動」，結果 **10/10 PASS**，未再重現。基於這項實機 regression evidence，ALT 自此不再把 Build 26200.x 視為需要安裝後主動警告的 active known issue，Windows installer 也不再顯示該 GPU advisory。

這只是「目前已驗證環境中無法重現」的判定，不代表已驗證所有 Windows / GPU 組合，也不代表上游已正式宣告普遍性根因修正。若未來重新出現相同症狀，應先以正常版本更新、系統重新啟動與官方診斷為主；需要隔離 GPU 加速因素時，可暫時以 `--disable-gpu` 啟動同一個官方 `Antigravity.exe`。如需桌面捷徑，可手動建立 **`Antigravity 安全模式（停用 GPU）`**，只加入該參數，且不要修改正常 Antigravity 捷徑。

`--disable-gpu-sandbox` 與 `--no-sandbox` 會降低 sandbox 隔離，不再屬於 ALT 建議的一般疑難排解方式。

## Antigravity 2.18.1

2.18.1 的啟動 overlay 改為純圖示，不再含有載入文字。獨立的 `v2-mainline-logo-overlay` profile 驗證圖示與 WebContentsView 結構、舊載入文字及 div 均不存在；引擎保留此檔案原貌。2.16.0 與 2.17.0 仍沿用原有 profile，未放寬舊版本 anchor。

## Antigravity 2.19.1

2.19.1 在 `tray.js` 中新增了 `onClick` 參數（`createTray(actions, onClick)`）與動態 WSL distro 選單插入，並延續 2.18.1 的純圖示載入畫面及 2.16.0 起的非同步 WSL 選單雙套用點。獨立的 `v2-mainline-tray-onclick` profile 驗證 tray 雙參數簽名、Agent 數量標籤與各項 anchors；中文化引擎支援動態函式宣告注入，完整相容 2.19.1。
