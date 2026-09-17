# ALT 1.1.1 Release Asset Naming Hardening

## Status

`IN_PROGRESS`

## Issue

GitHub Issue #14 — Harden fixed filenames for Windows Release assets

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

## Implementation steps

1. 新增 `build/release/prepare-windows-release.ps1`。
2. 腳本從 `package.json` 讀取 ALT version，要求 `dist/` 中存在相符的版本化 Install / Restore `.exe`。
3. 將兩個來源檔複製至獨立 staging directory，改為固定公開名稱。
4. 驗證來源與 staging copy 的 SHA-256 完全一致。
5. 產生 `SHA256SUMS.txt`，並驗證 staging directory 最終只包含三個預期公開 asset。
6. 新增 `RELEASING.md`，記錄人工發布 procedure。
7. 在 `AGENTS.md` 固化 Release asset 命名政策。
8. 在 `README.md` 開發者段落連到 `RELEASING.md`，說明 build artifact 與 public Release asset 的命名差異。
9. 擴充 `tests/packaging.test.js`，驗證 release-preparation source、固定 asset 名稱、README 永久連結，以及 CI 不會執行 production release-preparation/upload。

## Acceptance criteria

- `npm run check:packaging` 通過。
- 現有 `npm run check` 不受影響。
- Windows build artifact 仍為 `Antigravity-ZH-Hant-TW-ALT-<version>-Windows*.exe`。
- release-preparation staging output 固定為兩個無版本號 `.exe` 加 `SHA256SUMS.txt`。
- README `releases/latest/download/...` 與 staging 固定名稱完全一致。
- `.github/workflows/ci.yml` 不具 release write 權限，也不執行 production release-preparation 或 upload。

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

## Git / PR rules

- Branch: `fix/release-asset-fixed-names`
- Base: `main`
- 必須建立 PR 並等待 review。
- 不得由 Agent 自行 merge。
- Issue #14 與本 contract 必須在 PR 中互相引用。

## Execution Result

待實作與測試完成後更新。
