# 專案協作規範

## 產品主線

- 本專案的產品名稱為 **Antigravity 2.0 繁體中文 ALT 版**（ALT = Alternative）。
- ALT 自 **1.0.0** 起使用自己的 Semantic Versioning；ALT 版本不得與 Antigravity 官方版本混為同一版本號。
- `main` 是唯一長期維護的產品主線。功能開發使用短期 feature/fix branch，完成 review 後回到 `main`。
- `release/v2` 僅是歷史遷移參考，不是未來產品主線；在 ALT 1.0.0 跨平台驗證完成前不得刪除。
- 舊 v1 / v2 命名僅可出現在歷史或 legacy 說明，不得作為新產品名稱。

## GitHub Handoff 合約

- ChatGPT 與 Codex 的正式工作交接一律透過 GitHub，不以聊天內容複製貼上作為唯一規格來源。
- Handoff contract 統一存放於 `HANDOFFS/`。
- 執行前必須先同步遠端 `main`，閱讀本 `AGENTS.md`，再閱讀使用者指定的 handoff contract。
- 若 contract 與本檔衝突，以本檔為最高專案規範；若 contract 與 Issue 有差異，以 contract 為實作規格並在 Issue 記錄差異。
- 每份 contract 必須包含：狀態、Issue、基準 commit、目標、非目標、限制、實作步驟、驗收條件、測試、Git/PR 規則與執行結果區。
- Codex 不得只在本機完成後不回傳 GitHub。完成實作後必須 commit/push、建立 PR，並在 contract 的「Execution Result」更新結果。
- Codex 不得自行合併 PR，除非 contract 或使用者明確要求。
- 未經 contract 明確授權，不得刪除長期 branch、tag、Release 或大規模改寫 Git history。
- 若執行時發現 contract 的前提已失效，應停止高風險步驟，在 Issue/PR 中記錄 blocker，不得自行猜測破壞性替代方案。

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
- Release 不得包含 Antigravity 官方 `app.asar` 或其他官方 proprietary 檔案。
- 第三方 runtime/dependency 若被打包進 Release，必須保留適用的授權與 notices。
