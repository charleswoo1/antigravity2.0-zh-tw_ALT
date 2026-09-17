# ALT 1.1.1 Release Asset Naming Hardening

## Status

`IMPLEMENTED_PR_OPEN`

## Issue

GitHub Issue #14 — Harden fixed filenames for Windows Release assets

## Pull Request

GitHub PR #15 — Harden fixed filenames for Windows Release assets

## Baseline commit

`35904768005230fb1ddd3007bf936ab4c5c694c8`

## Goal

將 ALT 1.1.1 已在正式 GitHub Release 採用的 Windows 固定公開 asset 名稱固化成可重複、可測試的人工發布流程，避免未來版本直接上傳帶版本號的 build/CI artifact，造成 README `releases/latest/download/...` 永久下載連結失效。

正式 Release 固定公開名稱必須為：

```text
Antigravity-ZH-Hant-TW-ALT-Windows.exe
Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
SHA256SUMS.txt
```

## Non-goals

- 不改變 `build/windows/installer.iss` 的版本化 build artifact 命名。
- 不改變 CI artifact 的版本化命名。
- 不新增會自動建立 GitHub Release 或自動上傳 production asset 的 GitHub Actions workflow。
- 不自動 merge PR。
- 不刪除既有 Release、tag、branch，亦不改寫 Git history。

## Constraints

- 遵守 `AGENTS.md` 的受控 CI 政策；GitHub Actions 維持 `contents: read`，production Release 維持人工控制。
- Release-preparation 必須能在本機執行，不依賴 GitHub Actions。
- 來源 installer 版本必須從 repository `package.json` 取得，不得另外維護第二份 release version 常數。
- staging output 必須拒絕未知檔案，避免誤把其他檔案一起當成 Release asset。
- checksum 必須針對固定公開檔名產生。
- `prepare-windows-release.ps1` 必須可由 Windows PowerShell 5.1 直接執行；因 repository 檔案以 UTF-8 no-BOM 儲存，腳本本體維持 ASCII-only，避免舊版 PowerShell 依系統 code page 誤解析非 ASCII 字元。
- Windows PowerShell 5.1 雙引號字串內若變數後直接接 `:`，必須使用 `${name}:` 明確分隔變數名稱。

## Implementation steps

1. 新增 `build/release/prepare-windows-release.ps1`。
2. 腳本從 `package.json` 讀取 ALT version，要求 `dist/` 中存在相符的版本化 Install / Restore `.exe`。
3. 將兩個來源檔複製至獨立 staging directory，改為固定公開名稱。
4. 驗證來源與 staging copy 的 SHA-256 完全一致。
5. 產生 `SHA256SUMS.txt`，並驗證 staging directory 最終只包含三個預期公開 asset。
6. 新增 `RELEASING.md`，記錄人工發布 procedure。
7. 在 `AGENTS.md` 固化 Release asset 命名政策，以及允許 CI 在隔離目錄執行 staging validation、但禁止自動發布的邊界。
8. 保留 README 現有固定 `releases/latest/download/...` URL 與固定 asset 說明，並由測試直接驗證 README 與 staging 名稱一致。
9. 新增 `tests/release-assets.test.js`，並納入 `npm run check:packaging`；額外鎖定 release-preparation script 的 ASCII-only 與 Windows PowerShell 5.1 插值相容性。
10. Windows CI 在 `.build\release-assets-ci` 實際執行 release-preparation script，驗證固定檔名；CI artifact 仍只上傳 `dist/*.exe` 版本化 installer。

## Acceptance criteria

- `npm run check:packaging` 通過。
- 現有 `npm run check` 不受影響。
- Windows build artifact 仍為 `Antigravity-ZH-Hant-TW-ALT-<version>-Windows*.exe`。
- release-preparation staging output 固定為兩個無版本號 `.exe` 加 `SHA256SUMS.txt`。
- README `releases/latest/download/...` 與 staging 固定名稱完全一致。
- `.github/workflows/ci.yml` 維持 `contents: read`，不得自動建立 Release、不得自動上傳 production asset。
- CI 可在隔離測試目錄執行 staging script，但 upload-artifact 仍只針對版本化 `dist/*.exe`。
- Windows PowerShell 5.1 可以直接解析並執行 release-preparation script。

## Tests

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
```

若在 Windows 且已有 installer build artifact，再執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\release\prepare-windows-release.ps1
```

Windows CI 會以實際 build artifact 執行相同 staging script 作為 regression validation。

## Git / PR rules

- Branch: `fix/release-asset-fixed-names`
- Base: `main`
- PR: #15
- 必須等待 review。
- 不得由 Agent 自行 merge。
- Issue #14 與本 contract 必須在 PR 中互相引用。

## Execution Result

- 已新增 `build/release/prepare-windows-release.ps1`：從 `package.json` 自動取得版本、要求對應版本化 installer、拒絕未知 staging 檔案、複製成固定公開名稱、比對 SHA-256，並產生 `SHA256SUMS.txt`。
- 已新增 `RELEASING.md`，明確分離 `dist/` 的版本化 build artifact 與正式 GitHub Release 固定公開 asset。
- 已更新 `AGENTS.md`，把固定名稱與人工發布規則提升為專案政策。
- 已新增 `tests/release-assets.test.js` 並接入 `npm run check:packaging`；它驗證 installer 仍帶版本號、Release staging 使用固定名稱、README 永久連結一致，以及 CI 不取得 Release write 權限／不發布 fixed-name staging output。
- 已更新 Windows CI，使用實際 installer build 在 `.build\release-assets-ci` 執行 staging validation；既有 `upload-artifact` 仍只上傳 `dist/*.exe`，因此 CI artifact 與 production Release asset 邊界不變。
- 已建立 Issue #14、branch `fix/release-asset-fixed-names` 與 PR #15。
- 第一輪 Windows staging validation 揭露 Windows PowerShell 5.1 對 UTF-8 no-BOM 腳本內繁中文字串的解析相容性問題；Windows build 與既有 installer E2E 本身均已通過。已將 release-preparation script 改為 ASCII-only，並新增 regression assertion。
- 第二輪 Windows staging validation 再揭露 Windows PowerShell 5.1 對 `"$version:"` 的變數插值解析限制；已改為 `"${version}:"`，並新增對應 regression assertion。
- 最終 head 由 PR CI 再次完整驗證；通過後即可進入人工 review / merge gate。
