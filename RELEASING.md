# Release procedure

本專案的正式 GitHub Release 維持**人工授權、受控自動執行**。

一般 CI 只負責測試與建置驗證，維持 `permissions: contents: read`。只有 repository owner 明確確認某版本可以發布後，才可建立精確命名的 `release/vX.Y.Z` branch；該 branch 是一次性的正式發布授權訊號。專用 `.github/workflows/release.yml` 會重新驗證版本與 main commit、重新 build 全平台資產，最後只有 `publish` job 取得最低必要的 `actions: read` 與 `contents: write`。

## 版本來源

`package.json.version` 是 ALT build / release version 的權威來源。Windows installer、macOS artifact / bundle metadata、GitHub Pages、Release branch、Git tag 與 Release title 都必須由它衍生，不應另外硬編碼目前版本字串。GitHub Pages 顯示的已驗證 Antigravity 版本則必須由 `compatibility/manifest.json` 的 `verified` entries 衍生。

升版建議使用：

```bash
npm version <new-version> --no-git-tag-version
```

npm 的 `version` lifecycle 會執行版本同步工具，使 `localization_engine.js` 的 `ENGINE_VERSION` 跟著 `package.json.version` 更新。若直接手動修改 `package.json.version`，必須再執行：

```bash
npm run sync:version
```

發布前至少要能通過：

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
```

## 主要正式發布流程：Controlled Release bridge

### 1. 完成 PR、CI 與人工驗證

功能 PR 必須先 merge 回 `main`，並確認 `main` CI 成功。若版本需要實機驗證，例如新版 Antigravity 中文化相容性，repository owner 應先完成該人工驗證，再明確表示「可以發布」。

不得因 PR merge 或 CI 成功就自動建立正式 Release。

### 2. 建立唯一的發布觸發 branch

確認 `package.json.version` 為欲發布版本，例如 `1.2.1` 後，從**當下最新 `main` commit** 建立：

```text
release/v1.2.1
```

Release branch 必須精確符合 `release/vX.Y.Z`。建立這個 branch 即代表 repository owner 已對該版本完成最後發布授權。

### 3. Release gate

`.github/workflows/release.yml` 會在任何 production mutation 前確認：

- 觸發 actor 是 repository owner。
- branch 精確符合 `release/vX.Y.Z`。
- branch 中的 `package.json.version` 等於 `X.Y.Z`。
- release branch 的 commit SHA 精確等於當下 `origin/main`。
- 對應 `vX.Y.Z` tag 尚不存在。
- 對應 GitHub Release 尚不存在。
- `npm run check`、`npm run check:packaging` 與 production dependency audit 全部通過；其中 packaging gate 會強制確認 `docs/index.html` 的 ALT 版本與支援清單已和 `package.json` / `compatibility/manifest.json` 同步。

任一條件失敗就停止，不建立 tag 或 Release。

### 4. 重新建置正式資產

通過 gate 後，workflow 會重新建置並驗證 Windows x64 installer / restore installer、Windows installer E2E、macOS Intel x64 與 Apple Silicon arm64 app / ZIP，以及 macOS ad-hoc signing、bundle version 與 runtime version。

正式 Release 不直接沿用 PR CI artifact 作為 production asset；Release workflow 會在受控發布 run 中重新 build。

### 5. 固定公開檔名與 checksum

正式 GitHub Release 只允許以下五個公開 asset：

```text
Antigravity-ZH-Hant-TW-ALT-Windows.exe
Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
SHA256SUMS.txt
```

Windows 會透過 `build/release/prepare-windows-release.ps1` 將版本化 build artifact 轉成固定公開名稱。macOS 也只在 Release staging 層轉成上述固定名稱。

`SHA256SUMS.txt` 必須由本次 Release workflow 對四個 binary/archive 重新產生，不得沿用舊 Release 的 checksum。

### 6. Tag、draft Release 與正式發布

只有 Windows 與兩個 macOS build job 全部成功後，`publish` job 才能取得：

```yaml
permissions:
  actions: read
  contents: write
```

發布順序固定為：

1. 建立 annotated tag `vX.Y.Z`，明確指向已驗證的 release commit。
2. 推送該 tag；不得 force update 或覆寫既有 tag。
3. 以該既有 tag 建立 draft Release。
4. 一次上傳五個固定名稱 asset。
5. 驗證 draft Release 的 asset 名稱集合精確等於預期五個檔案。
6. 只有驗證成功後才將 draft 改為正式 Release，並標為 latest。
7. 最後再次確認 Release 不是 draft、不是 prerelease。

若 asset 驗證失敗，Release 必須保留在 draft 狀態，不得發布不完整版本。

### 7. 驗證永久下載連結

正式 Release 發布後確認以下永久網址指向本次最新正式版本：

```text
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows.exe
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
releases/latest/download/Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
releases/latest/download/SHA256SUMS.txt
```

README 與網站可長期使用上述固定名稱，不需要因 ALT 版本更新修改下載 URL。

## 權限邊界

- `.github/workflows/ci.yml` 必須維持 `contents: read`。
- `.github/workflows/release.yml` 的 workflow 預設也維持 `contents: read`。
- 只有最終 `publish` job 可使用 `actions: read` 與 `contents: write`。
- 不使用 `pull_request_target` 執行未受信任 PR 程式碼。
- Release workflow 不使用 production secrets；使用 GitHub 提供的短期 `GITHUB_TOKEN`。
- 不允許任何 workflow 自動 merge PR。
- 不允許 Release workflow 自動刪除 branch、tag、Release 或改寫 Git history。

## 失敗與復原

如果 Release workflow 在建立 tag 前失敗，可修正問題後重新建立或更新 release branch，再重新觸發。

如果 tag 已建立、但 draft Release 建立或 asset 上傳失敗，workflow 不會自動刪除或覆寫 tag / Release。必須先人工檢查 GitHub 上的 tag 與 draft Release 狀態，再由 repository owner 明確決定修復、刪除後重跑或採人工 fallback。

不得為了讓 rerun 通過而自動 force-update tag。

## 人工 fallback

若受控 Release bridge 因 GitHub Actions / GitHub CLI 平台問題暫時無法使用，可改採人工發布，但仍必須遵守相同 gate 與固定 asset 規則。

Windows x64 可在 Windows 開發機執行：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
powershell -ExecutionPolicy Bypass -File .\build\release\prepare-windows-release.ps1
```

macOS 則在相符架構 runner / Mac 上執行：

```bash
./build/macos/build.sh x64
./build/macos/build.sh arm64
```

人工發布時仍必須：tag 指向已完成驗證的 `main` commit、Release title 使用 `ALT X.Y.Z`、只上傳五個固定名稱 asset、對四個 binary/archive 重新產生完整 `SHA256SUMS.txt`，並在發布後驗證 `releases/latest/download/...` 永久下載連結。

## Release 內容限制

- Release 不得包含 Antigravity 官方 `app.asar`、解包後 proprietary 程式碼或其他官方 proprietary payload。
- 第三方 runtime / dependency 若被打包進 Release，必須保留適用授權與 notices。
- CI artifact 不等於 production Release asset；只有受控 Release workflow 最終 staging 或人工 fallback 的等價 staging 可成為正式公開 asset。
