# Antigravity 2.0 繁體中文 ALT 版

**Antigravity 2.0 Traditional Chinese ALT**（ALT = Alternative）是一套在使用者本機將 Antigravity 2.0 介面套用為繁體中文（台灣）的非官方社群工具。

- ALT 目前版本：**1.1.1**
- 明確支援的 Antigravity 版本：**2.13.0、2.14.0**
- 正式驗證平台：**Windows x64**
- 實驗性／待實機驗證：macOS x64、Apple Silicon
- 一般使用者不需要安裝 Node.js、npm、套件管理器或建置工具
- 安裝與還原流程可在下載完成後離線執行

本專案不包含、不散布 Antigravity 官方 `app.asar` 或其他官方 proprietary 二進位檔案；所有修改都在使用者自己的電腦上完成。

## 下載最新版

### Windows x64

- **[下載繁體中文安裝程式](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows.exe)**
- **[下載官方英文還原工具](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe)**
- [下載 SHA-256 校驗檔](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/SHA256SUMS.txt)
- [查看最新 Release 與版本說明](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest)

上面的下載網址使用 GitHub `releases/latest`，會自動指向目前最新的正式 Release，不需要隨每次版本更新 README。為維持這些永久下載網址，正式 Release 的 Windows asset 固定使用以下檔名：

```text
Antigravity-ZH-Hant-TW-ALT-Windows.exe
Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
SHA256SUMS.txt
```

版本號由 GitHub Release tag（例如 `v1.1.1`）與安裝程式內部版本識別，不放進上述公開下載 asset 檔名。

目前 Windows Release 未使用商業 Authenticode 程式碼簽章，因此 Windows SmartScreen 可能顯示「Windows 已保護您的電腦」或「未知發行者」提示。請只從本 Repository 的 GitHub Releases 下載，並可使用 `SHA256SUMS.txt` 驗證檔案完整性。

### macOS

ALT 1.1.1 的 macOS x64／Apple Silicon 目前仍為 **實驗性、`PENDING_MANUAL_PLATFORM_VALIDATION`**。CI 已完成 payload、checksum、app build、ad-hoc signing 與 ZIP 結構驗證，但尚未完成相符架構 Mac 上的下載後 quarantine、Gatekeeper、實際套用與還原驗證。

因此 **ALT 1.1.1 的正式公開 Release 先提供 Windows x64**。macOS CI artifact 只供驗證，不視為正式使用者下載版本；完成實機驗證後再升格為正式 Release asset。

## Windows 使用方式

1. 先安裝並更新官方 Antigravity 至明確支援的 **2.13.0 或 2.14.0**。
2. 由上方「下載最新版」取得 `Antigravity-ZH-Hant-TW-ALT-Windows.exe`。
3. 完全關閉 Antigravity。
4. 執行 ALT 安裝程式。
5. 相容性 preflight 通過後，工具才會開始套用繁體中文。
6. 完成後重新開啟 Antigravity。

需要恢復官方英文時：

1. 完全關閉 Antigravity。
2. 執行 `Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe`。
3. 還原成功後重新開啟 Antigravity。

Windows 安裝器使用內建、已固定版本的 Node.js runtime，不會呼叫系統 Node，也不會在使用者電腦執行 `npm install`。最後一次執行記錄位於：

```text
%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\
```

## Windows 11 25H2 / Build 26200.x 已知問題

部分 Windows 11 25H2（Build 26200.x）系統可能在關閉 Antigravity 後無法再次啟動。此現象也能在未套用 ALT 的官方英文版重現，目前實測與公開案例較支持 **Antigravity / Electron / Chromium 的 GPU sandbox 啟動路徑相容性問題**，不應歸因於 ALT 中文化內容本身。

若遇到此問題：

1. **先重新啟動 Windows**；這可能只會暫時恢復，問題仍可能再次出現。
2. 若正常模式仍反覆無法啟動，可在 ALT 1.1.1 安裝完成後的提醒視窗建立桌面 **`Antigravity 相容模式`** 捷徑。
3. 相容模式仍啟動同一套官方 `Antigravity.exe`，但會加入：

```text
--disable-gpu-sandbox
```

此參數會停用 Chromium **GPU process sandbox**，因此會降低 GPU 程序的安全隔離。它只應作為正常模式無法啟動時的暫時 workaround；正常 Antigravity 捷徑不會被修改。待 Antigravity、Electron 或 Windows 相關修正經實機驗證後，應停止使用此相容模式。

本工具**不提供 `--no-sandbox`**。

完整相容性與更新流程請參閱 [`COMPATIBILITY.md`](COMPATIBILITY.md)。

## 支援版本與安全邊界

ALT 對 Antigravity 上游版本採明確 allowlist，不會因版本號較新就自動放行。

- ALT 1.1.1 明確驗證 Antigravity **2.13.0、2.14.0**。
- 其他版本會在唯讀 preflight 階段停止，不會寫入 Antigravity 安裝目錄。
- 首次套用會建立同版本官方 `app.asar.bak`。
- 備份版本與目前 Antigravity 不一致時，工具會拒絕不安全的還原。
- archive 不會原地修改；替換或驗證失敗時具備 rollback / integrity check。
- 官方 Antigravity 更新通常會覆蓋中文化內容。新版本必須先完成 ALT 相容性驗證，再重新套用。

## 翻譯與保護範圍

ALT 會處理主介面、設定、選單、Tray、啟動畫面、Documents、Scratch Files、側邊提問、Git amend，以及 IDE 安裝精靈等 2.13.0／2.14.0 介面。

為避免影響工作內容，翻譯引擎會略過程式碼、Monaco 編輯器、終端機、輸入欄位、文字區域、Canvas、SVG 與可編輯內容。

## 開發者建置

以下需求只適用於建立 Release artifact 的開發電腦，一般使用者不需要安裝。

共同需求：

- Node.js 24.21.0 LTS 或可執行本專案 build scripts 的相容 Node 版本
- npm
- 可解開官方 Node runtime archive 的 `tar`

Runtime 版本、官方來源與 SHA-256 固定於 [`build/runtime-manifest.json`](build/runtime-manifest.json)，建置腳本會在使用下載內容前驗證 checksum。

### 本機測試

```bash
npm ci
npm run check
npm run check:packaging
# Windows 上完成建置後：
npm run check:windows-installer
```

### Windows 建置

建置機另需安裝 Inno Setup 6：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
```

若 runtime 已存在於 `vendor/runtime/`，可使用 `-Offline` 禁止下載：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64 -Offline
```

產物寫入 `dist/`。`-ExecutionPolicy Bypass` 只用於開發者在本機啟動建置腳本，ALT 使用者執行 Release 產物時不需要變更 PowerShell execution policy。

### macOS 建置

建置機需具備 Xcode Command Line Tools 提供的 `codesign` 與 `ditto`：

```bash
./build/macos/build.sh arm64
# 或
./build/macos/build.sh x64
```

腳本會先簽署內嵌 Node Mach-O，再對外層 app 進行 ad-hoc signing，最後輸出架構專屬 ZIP 至 `dist/`。

## Payload 內容

每個發佈產物包含：

```text
payload/
├─ runtime/node(.exe)
├─ runtime/NODE-LICENSE.txt
├─ localization_engine.js
├─ compatibility/
├─ tools/compatibility-audit.js
├─ dicts/
├─ node_modules/@electron/asar + 鎖定的 production dependencies
├─ package.json
├─ package-lock.json
├─ payload-manifest.json
├─ LICENSE
└─ THIRD_PARTY_LICENSES.md
```

Payload 不包含 npm，也不包含 Antigravity 官方檔案。

## GitHub Actions / CI 政策

GitHub Actions 僅用於 **CI、測試與建置驗證**。目前 CI 會執行 Ubuntu 核心測試、Windows 2025 x64 installer build + synthetic E2E，以及 macOS 15 Intel x64 / Apple Silicon arm64 standalone app build、ad-hoc signing 與 ZIP 結構驗證。

CI artifact 是短期驗證產物，**不等於正式 Release**。正式 Release、production asset 發布、PR merge、branch/tag 刪除與其他破壞性操作皆維持人工控制。完整規範請參閱 [`AGENTS.md`](AGENTS.md)。

## 舊版本文件

舊 v1 與 v2 Beta 僅保留作為歷史參考，不代表目前 ALT 使用方式：

- [`LEGACY-v2.0.0-beta.md`](LEGACY-v2.0.0-beta.md)
- Git tags 與歷史 commits

`release/v2` 是歷史參考分支，不是目前產品主線。

## 授權、來源與免責聲明

本 Repository 的 [`LICENSE`](LICENSE) 保留原專案 Licensor **KennethLi** 與 **Apache License 2.0 + Commons Clause** 條款；ALT 版在此 Repository 維護後續修改。第三方 runtime 與套件 notices 請參閱 [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md)。

本專案是非官方社群工具，與 Antigravity 官方無關。使用者應自行承擔修改本機應用程式資源的風險；工具提供同版本官方備份、相容性 preflight、還原與完整性驗證，但不對資料遺失或官方程式變更提供保證。
