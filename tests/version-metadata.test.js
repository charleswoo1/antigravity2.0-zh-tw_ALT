'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(repoRoot, ...parts), 'utf8');
const packageJson = JSON.parse(read('package.json'));
const version = packageJson.version;

assert.match(
    version,
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    'package.json.version 必須是可用的 Semantic Version'
);

const engine = require('../localization_engine');
assert.strictEqual(
    engine.ENGINE_VERSION,
    version,
    'localization_engine.js 的 ENGINE_VERSION 必須由 npm version / npm run sync:version 與 package.json.version 同步'
);

const syncVersion = read('tools', 'sync-version.js');
assert.ok(syncVersion.includes("const packagePath = path.join(repoRoot, 'package.json');"));
assert.ok(syncVersion.includes("const enginePath = path.join(repoRoot, 'localization_engine.js');"));
assert.ok(syncVersion.includes("process.argv.includes('--check')"));

const windowsBuild = read('build', 'windows', 'build.ps1');
assert.ok(windowsBuild.includes("$packagePath = Join-Path $repoRoot 'package.json'"), 'Windows build 必須從 package.json 讀取版本');
assert.ok(windowsBuild.includes('"/DAppVersion=$version"'), 'Windows build 必須把 package version 注入 Inno Setup');
assert.ok(windowsBuild.includes('Windows ALT ${version} artifacts created'), 'Windows build 訊息不得寫死當前 ALT 版本');
assert.ok(!windowsBuild.includes(`Windows ALT ${version} artifacts created`), 'Windows build 不得把當前版本硬編碼進訊息');

const windowsInstaller = read('build', 'windows', 'installer.iss');
assert.ok(windowsInstaller.includes('#ifndef AppVersion'), 'installer 必須允許 build 注入 AppVersion');
assert.ok(windowsInstaller.includes('#define AppVersion "0.0.0-dev"'), 'installer 直接編譯時應使用明顯的 dev fallback');
assert.ok(
    windowsInstaller.includes('#define ArtifactName "Antigravity-ZH-Hant-TW-ALT-" + AppVersion + "-Windows"'),
    'Install artifact name 必須由 AppVersion 組合'
);
assert.ok(
    windowsInstaller.includes('#define ArtifactName "Antigravity-ZH-Hant-TW-ALT-" + AppVersion + "-Windows-Restore"'),
    'Restore artifact name 必須由 AppVersion 組合'
);
assert.ok(!windowsInstaller.includes(`Antigravity-ZH-Hant-TW-ALT-${version}-Windows`), 'installer 不得硬編碼目前 package version');

const windowsInstallerTest = read('tests', 'windows-installer.test.js');
assert.ok(windowsInstallerTest.includes("const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json')"), 'Windows E2E 必須從 package.json 讀取版本');
assert.ok(windowsInstallerTest.includes('`Antigravity-ZH-Hant-TW-ALT-${packageJson.version}-Windows.exe`'), 'Windows E2E install artifact lookup 必須使用 package version');
assert.ok(windowsInstallerTest.includes('`Antigravity-ZH-Hant-TW-ALT-${packageJson.version}-Windows-Restore.exe`'), 'Windows E2E restore artifact lookup 必須使用 package version');
assert.ok(!windowsInstallerTest.includes(`ALT-${version}-Windows.exe`), 'Windows E2E 不得硬編碼目前 package version');

const macBuild = read('build', 'macos', 'build.sh');
assert.ok(macBuild.includes("node -p \"require('./package.json').version\""), 'macOS build 必須從 package.json 讀取版本');
assert.ok(macBuild.includes('APP_NAME="Antigravity-ZH-Hant-TW-ALT-$VERSION-macOS-$ARCH.app"'), 'macOS artifact name 必須使用動態 VERSION');
assert.ok(macBuild.includes('s/__ALT_VERSION__/$VERSION/g'), 'macOS build 必須注入 Info.plist 版本');
assert.ok(!macBuild.includes(`ALT-${version}-macOS`), 'macOS build 不得硬編碼目前 package version');

const infoPlist = read('build', 'macos', 'app', 'Info.plist');
assert.ok(infoPlist.includes('<string>__ALT_VERSION__</string>'), 'Info.plist source 必須使用 version placeholder');
assert.ok(!infoPlist.includes(`<string>${version}</string>`), 'Info.plist source 不得硬編碼目前 package version');

const ciWorkflow = read('.github', 'workflows', 'ci.yml');
assert.ok(ciWorkflow.includes('VERSION="$(node -p "require(\'./package.json\').version")"'), 'macOS CI 必須從 package.json 讀取版本');
assert.ok(ciWorkflow.includes('APP_NAME="Antigravity-ZH-Hant-TW-ALT-$VERSION-macOS-${{ matrix.arch }}.app"'), 'macOS CI 必須使用動態 artifact name');
assert.ok(ciWorkflow.includes("PlistBuddy -c 'Print :CFBundleShortVersionString'"), 'macOS CI 必須驗證 bundle version metadata');
assert.ok(!ciWorkflow.includes(`ALT-${version}-macOS-`), 'CI 不得硬編碼目前 package version 的 macOS artifact name');

console.log(`Version metadata policy tests passed for ALT ${version}.`);
