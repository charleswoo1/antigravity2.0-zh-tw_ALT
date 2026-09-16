# HANDOFFS

此目錄是本專案 ChatGPT → Codex 的正式 GitHub handoff contract 儲存區。

## 規則

1. 每個實作任務應有一個 GitHub Issue。
2. ChatGPT 先在此目錄建立或更新 contract，並將狀態設為 `READY_FOR_CODEX`。
3. Codex 執行前同步 `main`，依序閱讀：
   - `AGENTS.md`
   - 指定的 `HANDOFFS/*.md`
   - contract 連結的 Issue
4. Codex 建立短期實作 branch，不直接在 `main` 開發。
5. Codex 完成後：
   - 執行 contract 要求的本機測試。
   - commit / push。
   - 開 PR 回 `main`。
   - 更新 contract 的 `Execution Result`。
   - 將 contract 狀態改為 `READY_FOR_REVIEW`。
6. Review 通過並 merge 後，contract 才改為 `COMPLETE`。
7. GitHub Actions 可用於 CI、測試與 build validation；正式 merge/release 與破壞性操作維持人工控制。所有核心 build/test 流程仍須可在本機執行，並遵守 `AGENTS.md` 的最小權限與 secrets 安全規範。

## Contract 狀態

- `DRAFT`：仍在規畫。
- `READY_FOR_CODEX`：規格已定，可開始執行。
- `IN_PROGRESS`：Codex 正在實作。
- `BLOCKED`：存在需要處理的阻礙。
- `READY_FOR_REVIEW`：已有 PR，可 review。
- `COMPLETE`：已驗收並完成 merge。
