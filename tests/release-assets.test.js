'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const read = (...parts) => fs.readFileSync(path.join(repoRoot, ...parts), 'utf-8');

const releaseScriptPath = path.join(repoRoot, 'build', 'release', 'prepare-windows-release.ps1');
assert.ok(fs.existsSync(releaseScriptPath), '缺少 Windows release-preparation script');
assert.ok(fs.existsSync(path.join(repoRoot, 'RELEASING.md')), '缺少 RELEASING.md');

const releaseScript = fs.readFileSync(releaseScriptPath, 'utf-8');
const installer = read('build', 'windows', 'installer.iss');
const readme = read('README.md');
const agents = read('AGENTS.md');
const ci = read('.github', 'workflows', 'ci.yml');

const publicInstall = 'Antigravity-ZH-Hant-TW-ALT-Windows.exe';
const publicRestore = 'Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe';
const checksum = 'SHA256SUMS.txt';
const versionedInstall = `Antigravity-ZH-Hant-TW-ALT-${packageJson.version}-Windows`;
const versionedRestore = `Antigravity-ZH-Hant-TW-ALT-${packageJson.version}-Windows-Restore`;

assert.ok(installer.includes(versionedInstall), 'Windows build artifact 必須保留版本號');
assert.ok(installer.includes(versionedRestore), 'Windows restore build artifact 必須保留版本號');

for (const name of [publicInstall, publicRestore, checksum]) {
    assert.ok(releaseScript.includes(name), `release-preparation script 缺少固定公開名稱：${name}`);
    assert.ok(readme.includes(`releases/latest/download/${name}`), `README 永久下載連結與固定公開名稱不一致：${name}`);
    assert.ok(agents.includes(name), `AGENTS.md 未固化 Release asset 名稱：${name}`);
}

assert.ok(/^[\x00-\x7F]*$/.test(releaseScript), 'release-preparation script 必須維持 ASCII-only，確保 Windows PowerShell 5.1 可直接解析 UTF-8 no-BOM repository file');
assert.ok(releaseScript.includes("Join-Path $repoRoot 'package.json'"), 'release-preparation 必須從 package.json 取得版本');
assert.ok(releaseScript.includes('Get-FileHash'), 'release-preparation 必須驗證 SHA-256');
assert.ok(releaseScript.includes('Release staging directory contains unexpected files'), 'release staging 必須拒絕未知檔案');
assert.ok(releaseScript.includes("WriteAllLines($checksumPath"), 'release-preparation 必須產生 SHA256SUMS.txt');

assert.match(ci, /permissions:\s*\n\s*contents:\s*read/, 'CI 必須維持 contents: read');
assert.ok(!/contents:\s*write/.test(ci), 'CI 不得取得 contents: write');
assert.ok(!/gh\s+release|create-release|action-gh-release/i.test(ci), 'CI 不得自動建立或上傳 GitHub Release');
assert.ok(ci.includes('prepare-windows-release.ps1'), 'Windows CI 必須實際驗證固定名稱 staging script');
assert.ok(ci.includes('.build\\release-assets-ci'), 'CI 的 Release staging 驗證必須使用隔離測試目錄');
assert.ok(!/path:\s*\.build\\release-assets-ci/.test(ci), 'CI 不得上傳 fixed-name staging output');
assert.ok(/path:\s*dist\/\*\.exe/.test(ci), 'CI artifact 應繼續上傳版本化 dist installer');

console.log('Fixed-name Windows Release asset policy tests passed.');
