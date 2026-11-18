# Actions Artifact 儲存用量調整

## Status
READY_FOR_REVIEW

## Issue
https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/101

## Base commit
`6829621d5f0e029d13974f0ea90c075443890d47` (`origin/main`)

## Goal
一般 CI 預設不保存安裝檔，僅在手動選擇時上傳；正式發布保留必要的 Artifact 傳遞。所有新增 Artifact 保存 1 天，降低後續儲存用量。

## Non-goals
不調整版本、翻譯、測試與建置覆蓋率、帳號付費設定或既有 Release；不刪除歷史執行紀錄。

## Constraints
遵守 AGENTS.md。CI 維持 contents: read；發布授權、固定資產名稱及 publish job 權限維持既有規則。不自動刪除 Artifact 或提高 write 權限。

## Implementation steps
1. CI 新增預設 false 的 boolean workflow_dispatch input `upload_artifacts`。
2. Windows/macOS 上傳步驟限定手動執行且 input 為 true；保留完整建置驗證。
3. CI 與正式發布 Artifact retention 改為 1 天。
4. 更新操作文件與 workflow 政策測試。

## Acceptance criteria
PR/main push 與預設手動 CI 不上傳 Artifact；明確勾選的手動 CI 才保存下載檔。正式發布仍透過必要 staging Artifacts 組裝固定公開資產，所有上傳期限均為 1 天。

## Tests
- `npm run check`
- `npm run check:packaging`
- GitHub PR CI：驗證跨平台建置並確認 Artifact 上傳步驟略過。

## Git / PR rules
使用短期 `codex/` branch，commit/push 並建立回 main 的 PR。不得自行 merge 或啟動正式發布。

## Execution Result
- CI 的 Windows/macOS 上傳改為僅限 workflow_dispatch 且 upload_artifacts=true；預設 false。
- CI 與正式發布 staging Artifact 保存期限皆改為 1 天，未變更測試、建置或發布權限。
- 操作方式與配額限制已記錄於 RELEASING.md。
- `npm run check`：PASS。
- `npm run check:packaging`：PASS，包含上傳條件、預設值與保存期限政策檢查。
- `git diff --check`：PASS。
- PR：https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/102（待人工檢閱與合併）。
- GitHub PR CI：https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/44222710104；已確認 Windows 與兩種 macOS 的 Artifact 上傳步驟皆為 skipped，Core 與兩種 macOS 已通過。Windows 最後建置驗證及最新 commit 結果以 PR checks 為準。
- 未啟動正式發布或額外付費的 Artifact 上傳測試。
