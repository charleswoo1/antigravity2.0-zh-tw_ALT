# Release procedure

本專案的正式 GitHub Release 維持**人工控制**。GitHub Actions 只負責 CI、測試與建置驗證，不得自動建立正式 Release 或上傳 production asset。

## Windows x64

### 1. 確認版本與測試

`package.json`、installer、engine 與 release notes 的 ALT version 必須一致，並先完成：

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
```

### 2. 建置版本化 installer

在 Windows 開發機執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
```

`dist/` 會保留版本化 build artifact，例如 ALT 1.1.1：

```text
Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows.exe
Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows-Restore.exe
```

版本化命名是 build / CI 層的識別方式，不是 GitHub Release 的公開固定名稱。

### 3. 準備固定名稱的 Release asset

執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\release\prepare-windows-release.ps1
```

腳本會從 `package.json` 讀取版本，要求 `dist/` 存在相符的兩個版本化 installer，然後在 `release-assets/` 產生且只允許以下三個檔案：

```text
Antigravity-ZH-Hant-TW-ALT-Windows.exe
Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
SHA256SUMS.txt
```

腳本會：

- 拒絕缺少或為空的來源 installer。
- 將版本化 installer 複製成固定公開檔名。
- 比對來源與 staging copy 的 SHA-256，避免重新命名／複製過程產生內容差異。
- 依固定公開檔名產生 `SHA256SUMS.txt`。
- 若 `release-assets/` 含未知檔案則停止，避免誤把非預期檔案一起發布。

### 4. 人工建立 GitHub Release

建立對應 tag（例如 `v1.1.1`）與 Release，並**只上傳 `release-assets/` 中的三個檔案**。

不得直接把 `dist/` 或 GitHub Actions artifact 中帶版本號的 `.exe` 原名上傳成 production Release asset。

### 5. 驗證永久下載連結

正式 Release 發布後確認下列 `releases/latest/download/...` 路徑可下載目前最新正式版本：

```text
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows.exe
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
releases/latest/download/SHA256SUMS.txt
```

README 使用上述固定名稱，因此未來 ALT 版本更新時不需要修改永久下載 URL。

## CI 與正式 Release 的邊界

- CI 可以建置與暫存版本化 artifact，供測試與人工驗證。
- CI 不得取得 production Release write 權限。
- CI 不得呼叫 `prepare-windows-release.ps1` 後自動發布。
- CI artifact 不等於 production Release asset。
- 正式 Release、production asset upload、tag／Release 刪除均維持人工控制，除非使用者日後另外明確授權並更新專案規範。
