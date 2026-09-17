# 貢獻指南

感謝你協助改善 **Antigravity 2.0 繁體中文 ALT 版**。

## 回報問題前

請先確認：

- 使用的是本專案目前明確支援的 Antigravity 版本。
- 問題能在目前最新 ALT 版本重現。
- README 與 `COMPATIBILITY.md` 中沒有已知解法。

若問題可能涉及任意指令執行、非預期檔案讀寫、權限、路徑處理、憑證或其他安全風險，**不要公開建立 Issue**；請依 `SECURITY.md` 使用 Private vulnerability reporting。

## Issue 類型

GitHub Issue 提供三種表單：

- **Bug report**：安裝、還原、相容性、執行或介面問題。
- **Translation issue**：翻譯錯誤、用詞、遺漏翻譯或顯示情境。
- **Feature request**：新功能或流程改善建議。

Bug report 請盡量附上 ALT 版本、Antigravity 版本、作業系統版本、重現步驟與去除敏感資訊後的相關 log。

## Pull Request

本專案以 `main` 為唯一長期產品主線。請從最新 `main` 建立短期 branch，並讓 PR 聚焦單一問題。

PR 應包含：

- 對應 Issue。
- 變更摘要與非目標。
- 已執行的測試。
- Windows / macOS 實機驗證狀態（若適用）。
- 是否影響版本、相容性、installer、Release asset 或安全邊界。

請不要在 PR 中加入 Antigravity 官方 `app.asar` 或其他 proprietary 二進位檔案。

## 開發與測試

一般核心驗證：

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
```

Windows installer 變更另需執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
npm run check:windows-installer
```

macOS build 與正式發布限制請參閱 README、`COMPATIBILITY.md` 與 `RELEASING.md`。

## CI 與發布

GitHub Actions 只用於 CI、測試與建置驗證。正式 GitHub Release、production asset 上傳與其他發布操作維持人工控制。詳細專案協作與 Agent 規則請參閱 `AGENTS.md`。
