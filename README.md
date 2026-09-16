# Antigravity 2.0 繁體中文 ALT 版

**Antigravity 2.0 Traditional Chinese ALT**（ALT = Alternative）是一套在使用者本機將 Antigravity 2.0 介面套用為繁體中文（台灣）的工具。

- ALT 產品版本：**1.0.0**
- 支援的 Antigravity 版本：**2.13.0**
- 支援平台：Windows x64；macOS x64／Apple Silicon
- 使用者不需要安裝 Node.js、npm、套件管理器或建置工具
- 下載完成後可離線安裝與還原

本專案不包含、不散布 Antigravity 官方 `app.asar` 或其他官方二進位檔案；所有修改都在使用者自己的電腦上完成。

## 一般使用者快速開始

### Windows

1. 先安裝並更新官方 Antigravity 至 **2.13.0**。
2. 從 Releases 下載 `Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows.exe`。
3. 完全關閉 Antigravity。
4. 執行下載的安裝程式。
5. 完成後重新開啟 Antigravity。

需要恢復官方英文原版時，執行 `Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows-Restore.exe`。

安裝器使用內建、已固定版本的 Node.js runtime，不會呼叫系統 Node，也不會在使用者電腦上執行 `npm install`。最後一次執行記錄位於 `%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\`。

### macOS

依電腦架構下載其中一個檔案：

- Apple Silicon：`Antigravity-ZH-Hant-TW-ALT-1.0.0-macOS-arm64.app.zip`
- Intel：`Antigravity-ZH-Hant-TW-ALT-1.0.0-macOS-x64.app.zip`

使用方式：

1. 先安裝並更新官方 Antigravity 至 **2.13.0**。
2. 解壓縮下載的 ZIP。
3. 完全關閉 Antigravity。
4. 開啟 ALT app，選擇「套用繁體中文」或「還原官方英文」。
5. 完成後重新開啟 Antigravity。

ALT 1.0.0 的私人 macOS build 使用 ad-hoc signing，未使用付費 Developer ID 或 Apple notarization。第一次開啟若被 Gatekeeper 阻擋：

1. 先嘗試開啟 app。
2. 前往「系統設定」→「隱私權與安全性」。
3. 在被阻擋的 app 提示旁選擇「仍要打開」（Open Anyway），再確認一次。

不需要、也不建議停用系統層級的 Gatekeeper。

## 安全備份與官方更新

- 首次套用時會建立同版本的官方 `app.asar.bak`。
- 備份版本與目前 Antigravity 不一致時，工具會拒絕不安全的還原。
- 官方更新通常會覆蓋中文化內容；確認新版本已受支援後，再重新執行 ALT。
- ALT 1.0.0 僅驗證 Antigravity 2.13.0，其他版本會明確停止。

## 翻譯與保護範圍

ALT 會處理主介面、設定、選單、Tray、啟動畫面、Documents、Scratch Files、側邊提問、Git amend，以及 IDE 安裝精靈等 2.13.0 介面。

為避免影響工作內容，翻譯引擎會略過程式碼、Monaco 編輯器、終端機、輸入欄位、文字區域、Canvas、SVG 與可編輯內容。

## 開發者建置

以下需求只適用於建立 Release artifact 的開發電腦，一般使用者不需要安裝。

共同需求：

- Node.js 24.21.0 LTS 或可執行本專案 build scripts 的相容 Node 版本
- npm
- 可解開官方 Node runtime archive 的 `tar`

Runtime 版本、官方來源與 SHA-256 固定於 [`build/runtime-manifest.json`](build/runtime-manifest.json)。建置腳本會在使用下載內容前驗證 checksum。

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

若 runtime 已存在於 `vendor/runtime/`，可以使用 `-Offline` 禁止下載：

```powershell
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64 -Offline
```

產物會寫入 `dist/`。`-ExecutionPolicy Bypass` 只用於開發者在本機啟動建置腳本，ALT 使用者執行產物時不需要變更 PowerShell execution policy。

### macOS 建置

建置機需具備 Xcode Command Line Tools 提供的 `codesign` 與 `ditto`：

```bash
./build/macos/build.sh arm64
# 或
./build/macos/build.sh x64
```

腳本會先簽署內嵌的 Node Mach-O，再對外層 app 進行 ad-hoc signing，最後輸出架構專屬 ZIP 至 `dist/`。

## Payload 內容

每個發佈產物包含：

```text
payload/
├─ runtime/node(.exe)
├─ runtime/NODE-LICENSE.txt
├─ localization_engine.js
├─ dicts/
├─ node_modules/@electron/asar + 鎖定的 production dependencies
├─ package.json
├─ package-lock.json
├─ payload-manifest.json
├─ LICENSE
└─ THIRD_PARTY_LICENSES.md
```

Payload 不包含 npm，也不包含 Antigravity 官方檔案。

## GitHub Actions 政策

本專案禁止 GitHub Actions。測試、建置、打包、簽署與發佈驗證都必須能在開發者本機執行。完整規範請參閱 [`AGENTS.md`](AGENTS.md)。

## 舊版本文件

舊 v1 與 v2 Beta 僅保留作為歷史參考，不代表目前的 ALT 使用方式：

- [`LEGACY-v2.0.0-beta.md`](LEGACY-v2.0.0-beta.md)
- Git tags 與歷史 commits

`release/v2` 是歷史參考分支，不是目前產品主線。

## 授權與免責聲明

本專案依 [`LICENSE`](LICENSE) 提供，第三方 runtime 與套件 notices 請參閱 [`THIRD_PARTY_LICENSES.md`](THIRD_PARTY_LICENSES.md)。

本專案是非官方社群工具，與 Antigravity 官方無關。使用者應自行承擔修改本機應用程式資源的風險；工具提供同版本官方備份與還原驗證，但不對資料遺失或官方程式變更提供保證。
