# Google Antigravity 2.0 繁體中文（台灣）中文化工具｜ALT

**Antigravity 2.0 Traditional Chinese ALT**（ALT = Alternative）是一套 **Google Antigravity 2.0 繁體中文（zh-TW）中文化工具**，可在使用者本機將 Antigravity 介面套用為台灣繁體中文。支援 Windows x64，並提供 macOS Apple Silicon（arm64）與 Intel（x64）版本。

本專案是**非官方社群工具**，與 Google / Antigravity 官方無關；目標是提供符合台灣使用習慣的 Antigravity 中文介面，同時保留程式碼、Terminal、Debug Console、輸入內容與自動完成等開發工作區域的原文。

- ALT 目前版本：**1.1.2**
- 明確支援的 Antigravity 版本：**2.13.0、2.14.0**
- 正式驗證平台：**Windows x64**
- 公開先行版本：**macOS Apple Silicon（arm64）、Intel（x64）**
- 一般使用者不需要安裝 Node.js、npm 或其他開發工具
- 安裝與還原流程可在下載完成後離線執行

> macOS 版本已通過自動化 build、ad-hoc signing 與 ZIP 結構驗證，但完整人工實機驗證仍在進行中。如遇到平台問題，將於後續 ALT 版本修正。

本專案不包含、不散布 Antigravity 官方 `app.asar` 或其他官方 proprietary 二進位檔案；所有修改都在使用者自己的電腦上完成。

## Google Antigravity 繁體中文下載

如果您要在 **Windows 或 macOS 將 Google Antigravity 2.0 改為繁體中文（台灣 / zh-TW）**，請依作業系統下載下列最新版 ALT 工具。

### Windows x64

- **[下載繁體中文安裝程式](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows.exe)**
- **[下載官方英文還原工具](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe)**

### macOS Apple Silicon（M 系列 / arm64）

- **[下載 macOS Apple Silicon 版](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip)**

### macOS Intel（x64）

- **[下載 macOS Intel 版](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip)**

### 校驗與版本資訊

- [下載 SHA-256 校驗檔](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest/download/SHA256SUMS.txt)
- [查看最新 Release 與版本說明](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/latest)

以上下載連結會自動指向目前最新的正式 Release。

## Windows 使用方式

1. 先安裝並更新官方 Antigravity 至明確支援的 **2.13.0 或 2.14.0**。
2. 下載 `Antigravity-ZH-Hant-TW-ALT-Windows.exe`。
3. 完全關閉 Antigravity。
4. 執行 ALT 安裝程式，依提示完成相容性檢查與繁體中文套用。
5. 完成後重新開啟 Antigravity。

需要恢復官方英文時：

1. 完全關閉 Antigravity。
2. 執行 `Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe`。
3. 還原成功後重新開啟 Antigravity。

Windows 最後一次執行記錄位於：

```text
%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\
```

### Windows SmartScreen

目前 Windows Release 未使用商業 Authenticode 程式碼簽章，因此 Windows SmartScreen 可能顯示「Windows 已保護您的電腦」或「未知發行者」。請只從本 Repository 的 GitHub Releases 下載，並可使用 `SHA256SUMS.txt` 驗證檔案完整性。

## macOS 使用方式

1. 確認 Mac 架構並下載對應版本：Apple Silicon 使用 **arm64**，Intel Mac 使用 **x64**。
2. 解壓縮 ZIP。
3. 完全關閉 Antigravity。
4. 開啟解壓後的 **Antigravity ALT app**。
5. 在視窗中選擇 **「套用繁體中文」**。
6. 完成後重新開啟 Antigravity。

需要恢復官方英文時，再次開啟同一個 ALT app，選擇 **「還原官方英文」** 即可。

macOS 最後一次執行記錄位於：

```text
~/Library/Logs/Antigravity-ZH-Hant-TW-ALT/last-run.log
```

### macOS Gatekeeper

macOS 版本目前採 ad-hoc signing，未使用 Apple Developer ID notarization。若首次開啟被 macOS 阻擋，可在 Finder 對 ALT app 按右鍵（或 Control + 點按）→ **「打開」**，再於系統提示中確認開啟。

## Windows 11 25H2 / Build 26200.x 已知問題

部分 Windows 11 25H2（Build 26200.x）系統可能在關閉 Antigravity 後無法再次啟動。此現象也能在未套用 ALT 的官方英文版重現，目前較支持 Antigravity / Electron / Chromium 的 GPU sandbox 啟動路徑相容性問題，並非 ALT 中文化內容本身造成。

若遇到此問題：

1. **先重新啟動 Windows**；這可能只會暫時恢復。
2. 若正常模式仍反覆無法啟動，可使用 ALT 安裝完成後提供的 **`Antigravity 相容模式`** 桌面捷徑。
3. 相容模式會使用：

```text
--disable-gpu-sandbox
```

此參數會降低 Chromium GPU process 的 sandbox 隔離，只建議在正常模式無法啟動時暫時使用。正常 Antigravity 捷徑不會被修改，本工具也**不提供 `--no-sandbox`**。

## 支援版本與安全邊界

ALT 對 Antigravity 上游版本採明確 allowlist，不會因版本號較新就自動放行。

- ALT 1.1.2 明確支援 Antigravity **2.13.0、2.14.0**。
- 其他版本會在唯讀 preflight 階段停止，不會寫入 Antigravity 安裝目錄。
- 首次套用會建立同版本官方 `app.asar.bak`。
- 備份版本與目前 Antigravity 不一致時，工具會拒絕不安全的還原。
- 替換或驗證失敗時具備 rollback / integrity check。
- 官方 Antigravity 更新通常會覆蓋中文化內容；新版本必須先完成 ALT 相容性驗證才能重新套用。

完整相容性資訊請參閱 [`COMPATIBILITY.md`](COMPATIBILITY.md)。

## 翻譯範圍

ALT 會處理主介面、設定、選單、Tray、啟動畫面、Documents、Scratch Files、側邊提問、Git amend，以及 IDE 安裝精靈等介面。

為避免影響工作內容，翻譯引擎會略過程式碼、Monaco 編輯器、終端機、輸入欄位、文字區域、Canvas、SVG 與可編輯內容。

## 常見問題

### Google Antigravity 2.0 有繁體中文版嗎？

Antigravity ALT 是非官方社群中文化工具，可將支援版本的 Google Antigravity 2.0 介面套用為繁體中文（台灣 / zh-TW）。它不修改或散布官方 proprietary 二進位檔案，中文化在使用者自己的電腦上完成。

### 如何將 Google Antigravity 改成繁體中文？

Windows 使用者可下載本頁的 `Antigravity-ZH-Hant-TW-ALT-Windows.exe`，完全關閉 Antigravity 後執行安裝；macOS 使用者則依 Apple Silicon 或 Intel 架構下載對應 ZIP，解壓後執行 Antigravity ALT app 並選擇「套用繁體中文」。

### Antigravity 中文化支援哪些版本？

ALT 1.1.2 明確支援 Antigravity **2.13.0 與 2.14.0**。其他版本不會因版本號較新就自動放行，必須先完成相容性驗證。

### Antigravity 中文化支援 Windows 與 macOS 嗎？

支援。Windows x64 為正式驗證平台；macOS Apple Silicon（arm64）與 Intel（x64）已通過自動化 build、ad-hoc signing、ZIP 結構與 payload 驗證，目前仍屬公開先行版本。

### 中文化會翻譯程式碼、Terminal 或錯誤訊息嗎？

不會。ALT 的原則是翻譯「工具怎麼被操作」，不是翻譯「開發者正在輸入、執行或除錯的內容」。程式碼編輯器、Terminal 內容、Debug Console、輸入框與自動完成候選等區域會刻意保留原文。

## 問題回報

如果遇到安裝、還原、相容性或翻譯問題，請使用 GitHub Issues：

- [建立問題回報](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/new/choose)
- [查看既有 Issues](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues)

回報時建議附上：ALT 版本、Antigravity 版本、作業系統版本與架構、問題重現步驟，以及相關 log。提交 log 前請先確認其中沒有私人或敏感資訊。

安全性問題請依 [`SECURITY.md`](SECURITY.md) 的方式回報。

## 授權與免責聲明

本 Repository 的 [`LICENSE`](LICENSE) 保留原專案 Licensor **KennethLi** 與 **Apache License 2.0 + Commons Clause** 條款；第三方 runtime 與套件 notices 請參閱 [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md)。

本專案是非官方社群工具，與 Antigravity 官方無關。使用者應自行承擔修改本機應用程式資源的風險；工具提供同版本官方備份、相容性 preflight、還原與完整性驗證，但不對資料遺失或官方程式變更提供保證。
