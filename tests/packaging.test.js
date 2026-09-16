'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'build', 'runtime-manifest.json'), 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const engine = require('../localization_engine');

assert.strictEqual(packageJson.version, '1.1.0');
assert.strictEqual(engine.EDITION, 'ALT');
assert.strictEqual(engine.ENGINE_VERSION, '1.1.0');
assert.deepStrictEqual(engine.getVerifiedVersions(), ['2.13.0', '2.14.0']);
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

const macBuild = fs.readFileSync(path.join(repoRoot, 'build', 'macos', 'build.sh'), 'utf-8');
assert.ok(!/GitHub Actions.*(?:forbidden|禁止)|禁止 GitHub Actions/i.test(macBuild), 'macOS build script 不得拒絕 GitHub Actions');
assert.ok(macBuild.includes('codesign --force --sign - --timestamp=none "$APP_DIR"'));
assert.ok(!macBuild.includes('codesign --force --deep --sign'), 'macOS 簽署不得使用 --deep');
assert.ok(macBuild.includes('codesign --verify --deep --strict'), '驗證階段應保留 --deep');

console.log('Packaging and controlled-CI source tests passed.');
