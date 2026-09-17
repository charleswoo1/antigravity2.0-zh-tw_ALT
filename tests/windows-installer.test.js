'use strict';

const assert = require('assert');
const childProcess = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const engine = require('../localization_engine');

const repoRoot = path.resolve(__dirname, '..');

function snapshotTree(root) {
    const result = {};
    function walk(current) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const fullPath = path.join(current, entry.name);
            if (entry.isDirectory()) walk(fullPath);
            else if (entry.isFile()) {
                const relative = path.relative(root, fullPath).replace(/\\/g, '/');
                result[relative] = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
            }
        }
    }
    walk(root);
    return result;
}

async function main() {
    if (process.platform !== 'win32') {
        console.log('Windows installer test skipped: non-Windows host.');
        return;
    }

    const installExe = path.join(repoRoot, 'dist', 'Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows.exe');
    const restoreExe = path.join(repoRoot, 'dist', 'Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows-Restore.exe');
    assert.ok(fs.existsSync(installExe), `缺少安裝檔：${installExe}`);
    assert.ok(fs.existsSync(restoreExe), `缺少還原檔：${restoreExe}`);

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-alt-installer-'));
    const persistentLogDir = path.join(process.env.LOCALAPPDATA, 'Antigravity-ZH-Hant-TW-ALT');
    const persistentFiles = ['last-Preflight.log', 'last-Preflight.json', 'last-Preflight.summary.txt', 'last-Preflight.install-dir.txt', 'last-Install.log', 'last-Install.summary.txt', 'last-Restore.log', 'last-Restore.summary.txt'];
    const persistentBefore = new Map(persistentFiles.map(name => {
        const filePath = path.join(persistentLogDir, name);
        return [name, fs.existsSync(filePath) ? fs.readFileSync(filePath) : null];
    }));
    try {
        const sourceDir = path.join(tempRoot, 'source');
        const installDir = path.join(tempRoot, 'Antigravity');
        const resourcesDir = path.join(installDir, 'resources');
        const distDir = path.join(sourceDir, 'dist');
        const wizardDir = path.join(distDir, 'ideInstall');
        const testLogDir = path.join(tempRoot, 'logs');
        fs.mkdirSync(wizardDir, { recursive: true });
        fs.mkdirSync(resourcesDir, { recursive: true });
        fs.writeFileSync(path.join(sourceDir, 'package.json'), JSON.stringify({
            name: 'antigravity',
            version: '2.13.0'
        }), 'utf-8');
        fs.writeFileSync(path.join(distDir, 'preload.js'), 'console.log("fixture");\n', 'utf-8');
        fs.writeFileSync(path.join(distDir, 'menu.js'), "const items = [{ label: 'New Window' }, { label: 'Docs' }];\nelectron_1.Menu.setApplicationMenu(menu);\n", 'utf-8');
        fs.writeFileSync(path.join(distDir, 'tray.js'), "function createTray(actions) {\ncountItem.label = (count > 0 ? count : 'No agents') + ' running';\n}\n", 'utf-8');
        fs.writeFileSync(path.join(distDir, 'loadingOverlay.js'), '<div class="text">Loading Antigravity</div>\n', 'utf-8');
        fs.writeFileSync(path.join(wizardDir, 'wizardPreload.js'), 'console.log("wizard fixture");\n', 'utf-8');
        await asar.createPackage(sourceDir, path.join(resourcesDir, 'app.asar'));
        fs.mkdirSync(path.join(resourcesDir, 'app.asar.unpacked', 'node_modules', 'chrome-devtools-mcp'), { recursive: true });

        const commonArgs = [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${installDir}`,
            '/SkipProcessClose=1',
            `/TestLogDir=${testLogDir}`
        ];
        childProcess.execFileSync(installExe, commonArgs, { stdio: 'inherit' });
        const installed = engine.inspectAsar(path.join(resourcesDir, 'app.asar'));
        assert.strictEqual(installed.localized, true, installed.error);
        assert.ok(fs.existsSync(path.join(resourcesDir, 'app.asar.bak')), '安裝後未建立官方備份');
        assert.strictEqual(
            fs.readFileSync(path.join(testLogDir, 'last-Preflight.install-dir.txt'), 'utf-8').trim(),
            installDir,
            'installer 必須沿用 preflight 已解析的安裝目錄供安全模式捷徑驗證'
        );

        childProcess.execFileSync(installExe, commonArgs, { stdio: 'inherit' });
        const preload = asar.extractFile(path.join(resourcesDir, 'app.asar'), path.join('dist', 'preload.js')).toString('utf-8');
        assert.strictEqual(preload.split(engine.SIGNATURE_START).length - 1, 1, '重複安裝後出現多個中文化區塊');

        childProcess.execFileSync(restoreExe, commonArgs, { stdio: 'inherit' });
        const restored = engine.inspectAsar(path.join(resourcesDir, 'app.asar'));
        assert.strictEqual(restored.localized, false, restored.error);
        assert.strictEqual(restored.version, '2.13.0');
        assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.bak')), '還原後備份仍存在');

        const bypassBefore = snapshotTree(installDir);
        const rejectedBypass = childProcess.spawnSync(installExe, [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${installDir}`,
            '/SkipProcessClose=1'
        ], { encoding: 'utf-8' });
        assert.notStrictEqual(rejectedBypass.status, 0, '非隔離測試模式不得接受 SkipProcessClose');
        assert.deepStrictEqual(snapshotTree(installDir), bypassBefore, '被拒絕的 process-safety bypass 不得修改安裝目錄');

        const failed = childProcess.spawnSync(installExe, [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${path.join(tempRoot, 'missing')}`,
            '/SkipProcessClose=1',
            `/TestLogDir=${testLogDir}`
        ], { encoding: 'utf-8' });
        assert.notStrictEqual(failed.status, 0, 'engine 失敗時 Windows 安裝器必須傳回非零 exit code');
        const missingSummary = fs.readFileSync(path.join(testLogDir, 'last-Preflight.summary.txt'), 'utf-8');
        assert.match(missingSummary, /MISSING_INSTALLATION/);
        assert.match(missingSummary, /Antigravity 未被修改/);
        const decodedMissingSummary = fs.readFileSync(path.join(testLogDir, 'last-Preflight.summary.txt.decoded.txt'), 'utf-8');
        assert.match(decodedMissingSummary, /原因：找不到 Antigravity 安裝目錄/);
        assert.match(decodedMissingSummary, /Antigravity 未被修改。/);
        assert.ok(!decodedMissingSummary.includes('�'), 'installer UTF-8 decode evidence 不得含 replacement character');

        const unsupportedSource = path.join(tempRoot, 'unsupported-source');
        const unsupportedInstall = path.join(tempRoot, 'unsupported-install');
        const unsupportedResources = path.join(unsupportedInstall, 'resources');
        fs.mkdirSync(path.join(unsupportedSource, 'dist'), { recursive: true });
        fs.mkdirSync(unsupportedResources, { recursive: true });
        fs.writeFileSync(path.join(unsupportedSource, 'package.json'), JSON.stringify({ name: 'antigravity', version: '9.9.9' }));
        fs.writeFileSync(path.join(unsupportedSource, 'dist', 'preload.js'), 'console.log("unsupported");\n');
        await asar.createPackage(unsupportedSource, path.join(unsupportedResources, 'app.asar'));
        const unsupportedBefore = snapshotTree(unsupportedInstall);
        const unsupported = childProcess.spawnSync(installExe, [
            '/VERYSILENT',
            '/SUPPRESSMSGBOXES',
            `/AntigravityDir=${unsupportedInstall}`,
            '/SkipProcessClose=1',
            `/TestLogDir=${testLogDir}`
        ], { encoding: 'utf-8' });
        assert.notStrictEqual(unsupported.status, 0, '未支援版本必須傳回非零 exit code');
        const unsupportedSummary = fs.readFileSync(path.join(testLogDir, 'last-Preflight.summary.txt'), 'utf-8');
        assert.match(unsupportedSummary, /UNSUPPORTED_VERSION/);
        assert.match(unsupportedSummary, /9\.9\.9/);
        assert.match(unsupportedSummary, /2\.13\.0/);
        assert.match(unsupportedSummary, /Antigravity 未被修改/);
        assert.deepStrictEqual(snapshotTree(unsupportedInstall), unsupportedBefore, 'unsupported preflight 不得寫入 Antigravity 安裝目錄');

        assert.ok(fs.existsSync(path.join(testLogDir, 'last-Preflight.log')), 'synthetic preflight log 應位於測試暫存目錄');
        assert.ok(fs.existsSync(path.join(testLogDir, 'last-Install.log')), 'synthetic install log 應位於測試暫存目錄');
        assert.ok(fs.existsSync(path.join(testLogDir, 'last-Restore.log')), 'synthetic restore log 應位於測試暫存目錄');
        for (const name of persistentFiles) {
            const filePath = path.join(persistentLogDir, name);
            const before = persistentBefore.get(name);
            if (before === null) assert.ok(!fs.existsSync(filePath), `測試不得建立 persistent log：${name}`);
            else assert.deepStrictEqual(fs.readFileSync(filePath), before, `測試不得覆寫 persistent log：${name}`);
        }
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    console.log('Windows installer end-to-end test passed.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
