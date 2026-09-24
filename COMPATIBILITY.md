# Antigravity 上游版本相容性流程

ALT 對 Antigravity 上游版本採用明確 allowlist。版本較新、符合某個 semver 範圍，或唯讀稽核得到 `PASS`，都不會自動成為「已驗證支援版本」。唯一的正式清單是 [`compatibility/manifest.json`](compatibility/manifest.json)。

ALT 1.4.0 已完成 Antigravity `2.13.0`、`2.14.0`、`2.15.0`、`2.15.1`、`2.16.0` 與 `2.17.0` 的明確相容性驗證。2.16.0 起沿用非同步 WSL 選單重新套用流程，因此 2.16.0 與 2.17.0 使用獨立 profile 驗證兩個 `setApplicationMenu` 套用點。

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

## Windows 11 25H2 GPU 已知問題

目前在 Windows 11 25H2 / Build 26200.x 觀察到 Antigravity 關閉後可能無法再次啟動。測試與公開案例指向 Antigravity / Electron 的 GPU sandbox 啟動路徑相容性，且未套用 ALT 的官方英文版也能重現；這是一項安裝後 advisory，不會改變上游版本 allowlist 或阻擋正常的 ALT preflight。

若遇到此問題，第一步建議重新啟動 Windows；這可能只會暫時恢復。若仍反覆發生，可由 ALT 1.1.1 安裝成功後的互動提醒建立 `Antigravity 相容模式` 桌面捷徑。相容模式指向同一個官方 `Antigravity.exe`，僅加入 `--disable-gpu-sandbox`；它會停用 Chromium GPU process sandbox、降低該程序的安全隔離，因此只建議在正常模式無法啟動時暫時使用，並在上游或 Windows 修正經實機驗證後停止使用。正常 Antigravity 捷徑不會被修改。

Restore、silent install 與非 26200 build 不顯示此提醒，也不會自動建立相容模式捷徑。`--no-sandbox` 不屬於 ALT 提供的 workaround。
