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

## GitHub Actions 受控 CI 政策

本專案允許使用 GitHub Actions，但用途限定為 **CI、測試與建置驗證**。所有貢獻者、自動化工具與 Agent 都必須遵守以下規則：

### 允許用途

- 可在 Pull Request、push 至 `main` 或 `workflow_dispatch` 時執行測試、lint、smoke test、dependency audit 與 packaging/build validation。
- 可使用 GitHub 提供的 standard GitHub-hosted runners，包括 Windows、Linux 與 macOS runner。
- 可建置 Windows / macOS 驗證用 artifact，並使用 GitHub Actions artifact 暫存測試產物。
- 可執行不改變 repository 狀態的安全檢查，例如版本、checksum、package、installer/app bundle 結構驗證。
- 可在隔離測試目錄執行正式 release-preparation script，驗證固定 asset 命名與 checksum 邏輯，但不得把該 staging output 自動發布成 production Release asset。
- 可使用必要且可信任的 GitHub 官方 action；第三方 action 必須有明確必要性，且優先鎖定到可稽核的版本或 commit。

### 禁止用途（除非使用者明確授權）

- 不得自動 merge Pull Request。
- 不得自動建立或發布正式 GitHub Release。
- 不得自動上傳 production release asset。
- 不得自動刪除 branch、tag、Release 或改寫 Git history。
- 不得執行部署、發布、破壞性資料變更或其他不可逆操作。
- 不得為 CI 提高不必要的 repository write 權限。
- 不得讓來自 fork / Pull Request 的未受信任程式碼取得 repository secrets、write token 或其他敏感憑證。

### Workflow 權限與安全

- CI workflow 預設使用最小權限，優先設定 `permissions: contents: read`。
- 若單一 job 確實需要額外權限，必須只在該 job/工作流程範圍內授予最低必要權限並在 PR 說明原因。
- 一般 PR 驗證不得使用 production secrets。
- 不得使用 `pull_request_target` 執行 PR 提供的未受信任程式碼，除非另有經 review 的安全設計。
- CI 失敗不得觸發任何自動修復、merge、release 或 destructive fallback。

## 驗證與發布

- 所有核心測試與 build 流程仍必須能在本機執行；GitHub Actions 是 CI / validation 層，不得成為唯一可用的建置方式。
- 正式發布與版本建立維持人工控制；除非使用者另行明確授權，不得由 GitHub Actions 自動發布。
- GitHub 可用於 Git 版本管理、原始碼儲存、Issue、Pull Request、CI/build validation 與 Release 檔案托管。
- Windows build / CI artifact 可保留 ALT 版本號；正式 GitHub Release 的 Windows 公開 asset 必須固定使用以下名稱：

```text
Antigravity-ZH-Hant-TW-ALT-Windows.exe
Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
SHA256SUMS.txt
```

- 人工發布 Windows Release 前必須使用 `build/release/prepare-windows-release.ps1` 從版本化 build artifact 建立獨立 staging output，並只上傳該 staging output 中的三個固定名稱檔案。完整 procedure 參閱 `RELEASING.md`。
- README 的 `releases/latest/download/...` 永久下載連結依賴上述固定 asset 名稱；不得將帶版本號的 `.exe` 原名當成 production Release asset 上傳。
- Release 不得包含 Antigravity 官方 `app.asar` 或其他官方 proprietary 檔案。
- 第三方 runtime/dependency 若被打包進 Release，必須保留適用的授權與 notices。
