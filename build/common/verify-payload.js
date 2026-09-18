'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function walk(dir) {
    const result = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) result.push(...walk(fullPath));
        else result.push(fullPath);
    }
    return result;
}

function main() {
    const repoRoot = path.resolve(__dirname, '..', '..');
    const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
    const packageVersion = packageJson.version;
    const payloadDir = path.resolve(process.argv[2] || '');
    const platform = process.argv[3];
    if (!fs.existsSync(payloadDir)) throw new Error(`找不到 payload：${payloadDir}`);
    if (!['windows', 'macos'].includes(platform)) throw new Error('platform 必須是 windows 或 macos');

    const manifest = JSON.parse(fs.readFileSync(path.join(payloadDir, 'payload-manifest.json'), 'utf-8'));
    assert.strictEqual(manifest.edition, 'ALT');
    assert.strictEqual(manifest.productVersion, packageVersion);
    assert.deepStrictEqual(manifest.verifiedSupportedAntigravityVersions, ['2.13.0', '2.14.0']);
    assert.ok(/^[a-f0-9]{64}$/.test(manifest.runtime.sha256));

    assert.ok(fs.existsSync(path.join(payloadDir, 'dicts', 'v2_13.json')), 'payload 缺少 v2_13.json');
    assert.ok(fs.existsSync(path.join(payloadDir, 'compatibility', 'manifest.json')), 'payload 缺少 compatibility manifest');
    assert.ok(fs.existsSync(path.join(payloadDir, 'tools', 'compatibility-audit.js')), 'payload 缺少 preflight auditor');
    assert.ok(fs.existsSync(path.join(payloadDir, 'node_modules', '@electron', 'asar')), 'payload 缺少 @electron/asar');
    assert.ok(
        fs.existsSync(path.join(payloadDir, 'node_modules', '@electron', 'asar', 'bin', 'asar.mjs')) ||
        fs.existsSync(path.join(payloadDir, 'node_modules', '@electron', 'asar', 'bin', 'asar.js')),
        'payload 缺少可執行的 @electron/asar CLI'
    );
    assert.ok(fs.existsSync(path.join(payloadDir, 'runtime', 'NODE-LICENSE.txt')), 'payload 缺少 Node.js license');
    assert.ok(!fs.existsSync(path.join(payloadDir, 'node_modules', '.bin')), 'payload 不應包含 npm .bin shims/symlinks');

    const forbidden = walk(payloadDir).filter(file => ['app.asar', 'app.asar.bak'].includes(path.basename(file).toLowerCase()));
    assert.deepStrictEqual(forbidden, [], `payload 不得包含 Antigravity 官方 ASAR：${forbidden.join(', ')}`);

    const runtime = path.join(payloadDir, 'runtime', platform === 'windows' ? 'node.exe' : 'node');
    const engine = path.join(payloadDir, 'localization_engine.js');
    if ((platform === 'windows') !== (process.platform === 'win32')) {
        console.log(`[payload] ${platform} runtime 無法在 ${process.platform} 主機執行，略過執行階段驗證。`);
        return;
    }
    if (platform === 'macos' && process.platform !== 'darwin') return;

    const versionResult = spawnSync(runtime, [engine, '--version'], { encoding: 'utf-8' });
    assert.strictEqual(versionResult.status, 0, versionResult.stderr);
    assert.match(versionResult.stdout, /Edition: ALT/);
    assert.ok(versionResult.stdout.includes(`Engine version: ${packageVersion}`));
    assert.match(versionResult.stdout, /Verified supported Antigravity versions: 2\.13\.0, 2\.14\.0/);

    const missingInstallDir = path.join(payloadDir, '__missing_antigravity_install__');
    const failureResult = spawnSync(runtime, [engine, '--install-dir', missingInstallDir], { encoding: 'utf-8' });
    assert.notStrictEqual(failureResult.status, 0, 'engine 失敗必須傳回非零 exit code');

    console.log(`[payload] 驗證通過：${payloadDir}`);
}

try {
    main();
} catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
}
