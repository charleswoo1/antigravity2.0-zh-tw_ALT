# Antigravity 2.0 繁體中文套件 — v2.0.0 Beta

> 此版本目前為 Beta。
> [返回 v1.0.6 穩定版說明](README.md)

## v2.0.0 Beta

v2.0.0 Beta 主要改善安裝流程，讓一般使用者可以透過 Windows / macOS 安裝檔快速套用繁體中文介面。

請先留意兩件事：

- 電腦仍需先安裝 Node.js LTS。
- 若電腦已具備 Node.js / npm，即可使用安裝檔進行一鍵安裝，不需要手動執行 `npm install`。

> ⚠️ v2.0.0 Beta 的一鍵安裝是「免手動 `npm install`」，不是「免安裝 Node.js」。
> 安裝器不會內建 Node.js，也不會自動替使用者安裝 Node.js。

## 快速開始

### 1. 安裝前確認

請先確認電腦已有：

- 已安裝 Antigravity 2.0
- 已安裝 [Node.js LTS](https://nodejs.org/)
- Node.js 內建的 npm 可正常使用

如果不確定是否已安裝 Node.js，可開啟終端機或命令提示字元，輸入：

```bash
node -v
npm -v
```

兩個指令都有出現版本號，即可繼續安裝。

### 2. 完全退出 Antigravity

安裝前請先完全關閉 Antigravity，避免檔案正在使用中。

### 3. 執行安裝檔

依照你的系統執行對應安裝檔：

#### Windows

安裝：

```text
Antigravity-ZH-Hant-TW-v2.0.0-beta-Windows-Install.exe
```

#### macOS

安裝：

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-macOS-Install.pkg
```

安裝完成後，重新開啟 Antigravity，即可看到繁體中文介面。

> 若安裝器提示找不到 Node.js 或 npm，請先安裝 Node.js LTS 後再重新執行安裝檔。

## 還原官方原版

如需恢復官方英文原版，請完全退出 Antigravity，然後執行對應的還原檔：

### Windows

```text
Antigravity-ZH-Hant-TW-v2.0.0-beta-Windows-Restore.exe
```

### macOS

```
Antigravity-ZH-Hant-TW-v2.0.0-beta-macOS-Restore.pkg
```

還原會使用安裝時建立的備份，將 Antigravity 回復為官方原版。

## 安全性特色

v2.0.0 Beta 保留原有安全性設計：

- 不內建 Node.js，使用者需自行從官方網站安裝。
- 安裝檔只是將安裝流程自動化，所需套件仍會從官方來源下載，因此安裝時需要網路連線。
- 不散布 Antigravity 官方 `app.asar` 或任何官方檔案。
- 安裝與還原都在使用者電腦本機執行。
- 安裝時會保留備份，方便日後還原官方原版。
- 延續既有翻譯核心與安全檢查，只改善安裝體驗。

v2.0.0 的主要改變是讓安裝更簡單，不是放寬安全限制。

## Beta 狀態

v2.0.0 Beta 仍處於實機驗證階段，目前已完成 Windows / macOS 安裝檔建置驗證。

若希望使用目前穩定版，請使用：

```
v1.0.6
```

並依照 v1.0.6 穩定版 README 的既有方式操作。
