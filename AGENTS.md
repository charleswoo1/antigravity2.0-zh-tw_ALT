# 專案協作規範

## GitHub Actions 禁用政策

本專案不使用 GitHub Actions。所有貢獻者、自動化工具與 Agent 都必須遵守以下規則：

- 不得新增、修改、啟用或執行任何 GitHub Actions workflow。
- 不得建立 `.github/workflows/` 目錄或任何 workflow YAML 檔案。
- 不得將測試、建置、發佈、部署、排程或安全掃描設計為 GitHub Actions 作業。
- 不得建議、要求或依賴 GitHub Actions Marketplace 中的 action。
- 如需自動化，應優先提供可在使用者本機執行的 Node.js、PowerShell 或 shell 指令與腳本，並保持人工可驗證性。
- 如任務或外部工具要求使用 GitHub Actions，必須停止該路徑，並改用不依賴 GitHub Actions 的本機方案。

## 驗證與發布

- 所有驗證必須可以在本機完成。
- 發布與版本建立不得以 GitHub Actions 為前提。
- GitHub 僅用於 Git 版本管理、原始碼儲存、Issue、Pull Request 與 Release 檔案托管（若需）。
