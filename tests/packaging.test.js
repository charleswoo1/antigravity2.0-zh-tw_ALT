'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'build', 'runtime-manifest.json'), 'utf-8'));
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const engine = require('../localization_engine');

assert.strictEqual(packageJson.version, '1.0.0');
assert.strictEqual(engine.EDITION, 'ALT');
assert.strictEqual(engine.ENGINE_VERSION, '1.0.0');
assert.strictEqual(engine.SUPPORTED_ANTIGRAVITY_VERSION, '2.13.0');
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
    'build/macos/app/Info.plist'
]) {
    assert.ok(fs.existsSync(path.join(repoRoot, requiredFile)), `缺少 packaging source：${requiredFile}`);
}

assert.ok(!fs.existsSync(path.join(repoRoot, '.github', 'workflows')), '禁止 GitHub Actions workflows');

const macBuild = fs.readFileSync(path.join(repoRoot, 'build', 'macos', 'build.sh'), 'utf-8');
assert.ok(macBuild.includes('codesign --force --sign - --timestamp=none "$APP_DIR"'));
assert.ok(!macBuild.includes('codesign --force --deep --sign'), 'macOS 簽署不得使用 --deep');
assert.ok(macBuild.includes('codesign --verify --deep --strict'), '驗證階段應保留 --deep');

console.log('Packaging source tests passed.');
