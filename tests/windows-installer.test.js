'use strict';

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const engine = require('../localization_engine');

const repoRoot = path.resolve(__dirname, '..');

async function main() {
    if (process.platform !== 'win32') {
        console.log('Windows installer test skipped: non-Windows host.');
        return;
    }

    const installExe = path.join(repoRoot, 'dist', 'Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows.exe');
    const restoreExe = path.join(repoRoot, 'dist', 'Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows-Restore.exe');
    assert.ok(fs.existsSync(installExe), `缺少安裝檔：${installExe}`);
    assert.ok(fs.existsSync(restoreExe), `缺少還原檔：${restoreExe}`);

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-alt-installer-'));
    try {
        const sourceDir = path.join(tempRoot, 'source');
        const installDir = path.join(tempRoot, 'Antigravity');
        const resourcesDir = path.join(installDir, 'resources');
        const distDir = path.join(sourceDir, 'dist');
        const wizardDir = path.join(distDir, 'ideInstall');
        fs.mkdirSync(wizardDir, { recursive: true });
        fs.mkdirSync(resourcesDir, { recursive: true });
        fs.writeFileSync(path.join(sourceDir, 'package.json'), JSON.stringify({
            name: 'antigravity',
            version: engine.SUPPORTED_ANTIGRAVITY_VERSION
        }), 'utf-8');
        fs.writeFileSync(path.join(distDir, 'preload.js'), 'console.log("fixture");\n', 'utf-8');
        fs.writeFileSync(path.join(wizardDir, 'wizardPreload.js'), 'console.log("wizard fixture");\n', 'utf-8');
        await asar.createPackage(sourceDir, path.join(resourcesDir, 'app.asar'));

        const commonArgs = [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${installDir}`,
            '/SkipProcessClose=1'
        ];
        childProcess.execFileSync(installExe, commonArgs, { stdio: 'inherit' });
        const installed = engine.inspectAsar(path.join(resourcesDir, 'app.asar'));
        assert.strictEqual(installed.localized, true, installed.error);
        assert.ok(fs.existsSync(path.join(resourcesDir, 'app.asar.bak')), '安裝後未建立官方備份');

        childProcess.execFileSync(installExe, commonArgs, { stdio: 'inherit' });
        const preload = asar.extractFile(path.join(resourcesDir, 'app.asar'), path.join('dist', 'preload.js')).toString('utf-8');
        assert.strictEqual(preload.split(engine.SIGNATURE_START).length - 1, 1, '重複安裝後出現多個中文化區塊');

        childProcess.execFileSync(restoreExe, commonArgs, { stdio: 'inherit' });
        const restored = engine.inspectAsar(path.join(resourcesDir, 'app.asar'));
        assert.strictEqual(restored.localized, false, restored.error);
        assert.strictEqual(restored.version, '2.13.0');
        assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.bak')), '還原後備份仍存在');

        const failed = childProcess.spawnSync(installExe, [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${path.join(tempRoot, 'missing')}`,
            '/SkipProcessClose=1'
        ], { encoding: 'utf-8' });
        assert.notStrictEqual(failed.status, 0, 'engine 失敗時 Windows 安裝器必須傳回非零 exit code');
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    console.log('Windows installer end-to-end test passed.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
