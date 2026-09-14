# Antigravity 2.0 繁體中文套件 — v2.0.0 Beta

> 此版本目前為 Beta。  
> [返回 v1.0.6 穩定版說明](README.md)

## v2.0.0 Beta

v2.0.0 Beta 主要改善安裝與還原流程，讓使用者不需要手動安裝 npm dependency 或執行 `.bat` / `.command` 腳本。

翻譯核心、備份與還原機制維持原有設計；新版主要目標是降低安裝門檻，同時維持既有安全性。

> ⚠️ 重要：v2.0.0 Beta 的一鍵安裝是「免手動 `npm install`」，不是「免 Node.js」。  
> 使用者電腦仍需先安裝 Node.js LTS；Install 需要同一 Node.js 環境中的 npm 可正常使用。  
> Installer 不會內建 Node.js，也不會自動替使用者安裝 Node.js。

## 快速開始

請先確認：

- 已安裝 Antigravity 2.0
- 已安裝 Node.js LTS
- Node.js 安裝時包含的 npm 可正常使用
- 執行安裝前已完全退出 Antigravity

使用者不需要手動執行 `npm install`；Install 工具會在需要時自動透過 npm 下載必要 dependency。

### Windows

安裝：

```text
Antigravity-ZH-Hant-TW-v2.0.0-beta-Windows-Install.exe
```

還原：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-Windows-Restore.exe
```

### macOS

安裝：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-macOS-Install.pkg
```

還原：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-macOS-Restore.pkg
```

## 安裝流程

v2.0.0 Beta 的 installer 會處理原本需要使用者自行完成的安裝步驟。

Install 流程會：

1. 檢查必要環境。
2. 檢查 Node.js 與 npm。
3. 需要時透過使用者本機的 npm 從 npm registry 下載 `@electron/asar`。
4. 確認前置條件完成後才進入繁體中文安裝流程。
5. 完成後清除 installer 使用的暫存檔案。

若找不到 Node.js、npm 無法使用、網路或 dependency 安裝失敗，流程會中止，不應繼續修改 Antigravity。

## Restore

Restore 使用安裝時保留的備份還原 Antigravity。

Restore：

- 仍需要可用的 Node.js
- 不需要重新下載 `@electron/asar`
- 不需要 `node_modules`
- 不會重新執行繁體中文安裝流程

Windows 使用：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-Windows-Restore.exe
```

macOS 使用：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-macOS-Restore.pkg
```

## Release 安全原則

v2.0.0 Beta 的 Release 不包含：

```
Node.js
node_modules/
app.asar
app.asar.bak
```

其中：

- Node.js 不會綁定在 installer 內
- `@electron/asar` 不會預先包入 Release
- Install 需要時才透過使用者本機的 npm 取得 `@electron/asar`
- 不重新散布 Antigravity 官方 `app.asar`
- Restore 使用既有備份機制
- installer 不取代既有翻譯核心與安全檢查

v2.0.0 的主要改變是改善使用者安裝體驗，不是放寬原有安全限制。

## Beta 狀態

目前：

```
macOS installer build verified
Windows installer build verified
Beta runtime validation ongoing
```

v2.0.0 Beta 仍處於實機驗證階段。

若希望使用目前穩定版，請使用：

```
v1.0.6
```

並依照 v1.0.6 穩定版 README 的既有方式操作。
