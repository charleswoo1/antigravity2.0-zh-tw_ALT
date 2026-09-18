'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'build', 'runtime-manifest.json'), 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const engine = require('../localization_engine');

assert.match(packageJson.version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
assert.strictEqual(engine.EDITION, 'ALT');
assert.strictEqual(engine.ENGINE_VERSION, packageJson.version);
assert.deepStrictEqual(engine.getVerifiedVersions(), ['2.13.0', '2.14.0', '2.15.0']);
assert.strictEqual(manifest.runtime.version, '24.21.0');

for (const key of ['windows-x64', 'windows-arm64', 'macos-x64', 'macos-arm64']) {
    const artifact = manifest.artifacts[key];
    assert.ok(artifact, `runtime manifest 缺少 ${key}`);
    assert.match(artifact.url, /^https:\/\/nodejs\.org\/download\/release\/v24\.21\.0\//);
    assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
}

for (const requiredFile of [
    'build/common/prepare-payload.js',
    'build/common/generate-third-party-notices.js',
    'build/common/verify-payload.js',
    'build/windows/build.ps1',
    'build/windows/installer.iss',
    'build/macos/build.sh',
    'build/macos/app/launcher.sh',
    'build/macos/app/Info.plist',
    'tools/sync-version.js',
    'tests/version-metadata.test.js',
    '.github/workflows/ci.yml'
]) {
    assert.ok(fs.existsSync(path.join(repoRoot, requiredFile)), `缺少 packaging/CI source：${requiredFile}`);
}

const ciWorkflow = fs.readFileSync(path.join(repoRoot, '.github', 'workflows', 'ci.yml'), 'utf-8');
assert.match(ciWorkflow, /permissions:\s*\n\s*contents:\s*read/, 'CI 必須使用 contents: read 最小權限');
assert.ok(!/pull_request_target\s*:/.test(ciWorkflow), 'CI 不得使用 pull_request_target 執行未受信任 PR 程式碼');
assert.ok(!/contents:\s*write/.test(ciWorkflow), 'CI 不得取得 contents: write');
assert.ok(!/releases:\s*write/.test(ciWorkflow), 'CI 不得取得 releases: write');
assert.ok(!/gh\s+release|create-release|action-gh-release/i.test(ciWorkflow), 'CI 不得自動發布 GitHub Release');
assert.ok(ciWorkflow.includes('windows-2025'), 'CI 應固定 Windows 2025 standard runner');
assert.ok(ciWorkflow.includes('macos-15-intel'), 'CI 應驗證 macOS Intel');
assert.ok(ciWorkflow.includes('macos-15'), 'CI 應驗證 macOS Apple Silicon');
assert.ok(ciWorkflow.includes('npm run check:windows-installer'), 'CI 必須執行 Windows installer E2E');
assert.ok(ciWorkflow.includes('./build/macos/build.sh'), 'CI 必須建置 macOS app');

const windowsBuild = fs.readFileSync(path.join(repoRoot, 'build', 'windows', 'build.ps1'), 'utf-8');
assert.ok(!/GitHub Actions.*(?:forbidden|禁止)|禁止 GitHub Actions/i.test(windowsBuild), 'Windows build script 不得拒絕 GitHub Actions');
const windowsInstaller = fs.readFileSync(path.join(repoRoot, 'build', 'windows', 'installer.iss'), 'utf-8');
assert.ok(windowsInstaller.includes('LoadStringsFromFile'), 'installer 必須使用支援 UTF-8 的 summary loader');
assert.ok(!windowsInstaller.includes('LoadStringFromFile('), 'installer 不得以 AnsiString API 讀取 UTF-8 中文 summary');
assert.ok(windowsInstaller.includes('TestModeActive and'), 'process-safety bypass 必須綁定已驗證的 test mode');
assert.ok(windowsInstaller.includes('SaveStringsToUTF8File'), 'Windows E2E 必須能驗證 installer 解碼後的繁中 summary');

const affectedBuildMatch = windowsInstaller.match(/function IsAffectedWindowsGpuBuildNumber[\s\S]*?Result := Build = (\d+);[\s\S]*?end;/);
assert.ok(affectedBuildMatch, 'installer 必須保留可測試的 GPU affected-build predicate');
const affectedBuild = Number(affectedBuildMatch[1]);
assert.strictEqual(affectedBuild === 26200, true, 'build 26200 必須顯示 GPU advisory');
assert.strictEqual(26100 === affectedBuild, false, 'build 26100 不得顯示 build-specific advisory');
assert.strictEqual(26300 === affectedBuild, false, 'build 26300 不得顯示 build-specific advisory');

const engineStepIndex = windowsInstaller.indexOf('if CurStep <> ssInstall then');
const engineExecIndex = windowsInstaller.indexOf("Exec(ExpandConstant('{cmd}')", engineStepIndex);
const successFlagIndex = windowsInstaller.indexOf('EngineSucceeded := True;', engineExecIndex);
const completionIndex = windowsInstaller.indexOf("SetInstallerPhase(100, '安裝完成')");
assert.ok(engineStepIndex >= 0, 'localization mutation 必須在 ssInstall 階段執行，而不是已完成的 ssPostInstall 階段');
assert.ok(windowsInstaller.indexOf("SetInstallerPhase(80, '正在套用繁體中文化並驗證安裝結果…')", engineStepIndex) < engineExecIndex,
    '同步 localization engine 啟動前必須把可見進度固定在 100% 以下並更新狀態');
assert.ok(successFlagIndex > engineExecIndex, '只有 localization engine 成功後才能設定成功旗標');
assert.ok(completionIndex >= 0 && completionIndex < engineStepIndex,
    '100% 完成狀態必須只出現在 ssPostInstall 的成功旗標分支');
assert.ok(!/CurStep <> ssPostInstall then[\s\S]*?Exec\(ExpandConstant\('\{cmd\}'\)/.test(windowsInstaller),
    '不得在已達正常安裝進度終點的 ssPostInstall 才啟動 localization engine');

assert.match(
    windowsInstaller,
    /#if Mode == "Install"\s+SetInstallerPhase\(15, '正在檢查 Antigravity 相容性…'\);\s+#else\s+SetInstallerPhase\(15, '正在準備還原官方英文…'\);\s+#endif/,
    'Restore PrepareToInstall 不得顯示 Install-only 的相容性檢查文字'
);
assert.match(
    windowsInstaller,
    /#if Mode == "Install"\s+SetInstallerPhase\(95, '正在完成安裝…'\);\s+#else\s+SetInstallerPhase\(95, '正在完成還原…'\);\s+#endif/,
    'Restore 95% phase 必須使用還原語意'
);
assert.match(
    windowsInstaller,
    /#if Mode == "Install"\s+SetInstallerPhase\(100, '安裝完成'\);\s+#else\s+SetInstallerPhase\(100, '還原完成'\);\s+#endif/,
    'Restore 100% phase 必須顯示還原完成而非安裝完成'
);

assert.ok(windowsInstaller.includes('GetWindowsVersionEx(Version);'), 'Windows build detection 必須使用 Inno 支援的版本 API');
assert.ok(windowsInstaller.includes('(not GpuNoticeShown) and (not WizardSilent) and IsAffectedWindowsGpuBuild()'),
    'GPU advisory 必須只在互動模式顯示一次');
assert.ok(windowsInstaller.includes('InstallOperationSucceeded'), 'GPU advisory 必須受成功安裝旗標保護');
assert.ok(windowsInstaller.includes('CreateCustomForm(ScaleX(360), ScaleY(210), True, True)'),
    'GPU advisory 應保持緊湊，避免高 DPI 系統出現過大的提醒視窗');
assert.ok(windowsInstaller.includes('MessageLabel.AdjustHeight();'),
    'GPU advisory 說明文字必須依實際換行自動調整高度，避免文字被按鈕遮住');
assert.ok(windowsInstaller.includes('NextTop := MessageLabel.Top + MessageLabel.Height + ScaleY(6);'),
    'GPU advisory 後續控制項必須從實際量測後的文字底部開始排版，避免固定座標覆蓋文字');
assert.ok(!windowsInstaller.includes('clip.exe'), '相容模式流程不再提供 --disable-gpu 複製按鈕');
assert.ok(windowsInstaller.includes("'{userdesktop}\\Antigravity 相容模式.lnk'"),
    '相容模式捷徑必須固定寫入目前使用者桌面的同一路徑');
assert.ok(windowsInstaller.includes("FileExists(ExePath)"), '建立捷徑前必須驗證官方 Antigravity.exe 存在');
assert.match(windowsInstaller, /CreateShellLink\([\s\S]*?ExePath,[\s\S]*?'--disable-gpu-sandbox',[\s\S]*?ExtractFileDir\(ExePath\),[\s\S]*?ExePath/,
    '相容模式捷徑必須指向官方執行檔，僅帶 --disable-gpu-sandbox，並使用官方目錄與圖示');
assert.ok(!windowsInstaller.includes('Antigravity 安全模式（停用 GPU）'), 'installer 不得再建立舊的 --disable-gpu 安全模式捷徑');
assert.ok(!windowsInstaller.includes('--no-sandbox'), 'installer 不得提供 --no-sandbox');
assert.ok(!/\[Icons\][\s\S]*?Antigravity(?! 相容模式)/.test(windowsInstaller), 'installer 不得修改正常 Antigravity 捷徑');

const macBuild = fs.readFileSync(path.join(repoRoot, 'build', 'macos', 'build.sh'), 'utf-8');
assert.ok(!/GitHub Actions.*(?:forbidden|禁止)|禁止 GitHub Actions/i.test(macBuild), 'macOS build script 不得拒絕 GitHub Actions');
assert.ok(macBuild.includes('codesign --force --sign - --timestamp=none "$APP_DIR"'));
assert.ok(!macBuild.includes('codesign --force --deep --sign'), 'macOS 簽署不得使用 --deep');
assert.ok(macBuild.includes('codesign --verify --deep --strict'), '驗證階段應保留 --deep');

console.log('Packaging and controlled-CI source tests passed.');
