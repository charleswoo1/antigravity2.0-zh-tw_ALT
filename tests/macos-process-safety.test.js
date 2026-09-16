'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const engine = require('../localization_engine');

function runnerReturning(result, calls = []) {
    return (command, args, options) => {
        calls.push({ command, args, options });
        return result;
    };
}

function runnerSequence(results) {
    let index = 0;
    return () => results[Math.min(index++, results.length - 1)];
}

function assertUnchanged(filePath, expected) {
    assert.ok(fs.existsSync(filePath), `檔案不應消失：${filePath}`);
    assert.deepStrictEqual(fs.readFileSync(filePath), expected, `檔案不應被修改：${filePath}`);
}

async function createAsarFixture(root, name, localized) {
    const sourceDir = path.join(root, `${name}-source`);
    const distDir = path.join(sourceDir, 'dist');
    const wizardDir = path.join(distDir, 'ideInstall');
    fs.mkdirSync(wizardDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'package.json'), JSON.stringify({
        name: 'antigravity',
        version: '2.13.0'
    }), 'utf-8');

    let preload = 'console.log("fixture");\n';
    let wizard = 'console.log("wizard fixture");\n';
    if (localized) {
        const translation = engine.generateJs();
        preload += translation;
        wizard += translation;
    }
    fs.writeFileSync(path.join(distDir, 'preload.js'), preload, 'utf-8');
    fs.writeFileSync(path.join(wizardDir, 'wizardPreload.js'), wizard, 'utf-8');

    const archivePath = path.join(root, `${name}.asar`);
    await asar.createPackage(sourceDir, archivePath);
    return archivePath;
}

async function verifyInstallGuard(root, label, processResult) {
    const resourcesDir = path.join(root, `install-${label}`);
    fs.mkdirSync(resourcesDir, { recursive: true });
    const asarPath = path.join(resourcesDir, 'app.asar');
    fs.copyFileSync(path.join(root, 'official.asar'), asarPath);
    const original = fs.readFileSync(asarPath);

    const installed = engine.install20(resourcesDir, {
        platform: 'darwin',
        processRunner: runnerReturning(processResult),
        skipProcessClose: true
    });
    assert.strictEqual(installed, false, `${label} 狀態應安全中止安裝`);
    assertUnchanged(asarPath, original);
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.bak')), '安全閘門失敗後不得建立備份');
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.localized.tmp')), '安全閘門失敗後不得建立暫存 ASAR');
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.localized.tmp.unpacked')), '安全閘門失敗後不得建立 unpacked 暫存目錄');
}

async function verifyRestoreGuard(root, label, processResult) {
    const resourcesDir = path.join(root, `restore-${label}`);
    fs.mkdirSync(resourcesDir, { recursive: true });
    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.bak');
    fs.copyFileSync(path.join(root, 'localized.asar'), asarPath);
    fs.copyFileSync(path.join(root, 'official.asar'), backupPath);
    const current = fs.readFileSync(asarPath);
    const backup = fs.readFileSync(backupPath);

    const restored = engine.restore20(resourcesDir, {
        platform: 'darwin',
        processRunner: runnerReturning(processResult),
        skipProcessClose: true
    });
    assert.strictEqual(restored, false, `${label} 狀態應安全中止還原`);
    assertUnchanged(asarPath, current);
    assertUnchanged(backupPath, backup);
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.restore.tmp')), '安全閘門失敗後不得建立還原暫存檔');
}

async function verifyGuardBeforeLocalizedArchiveCreation(root) {
    const resourcesDir = path.join(root, 'install-process-started-later');
    fs.mkdirSync(resourcesDir, { recursive: true });
    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.bak');
    fs.copyFileSync(path.join(root, 'official.asar'), asarPath);
    const original = fs.readFileSync(asarPath);

    const installed = engine.install20(resourcesDir, {
        platform: 'darwin',
        processRunner: runnerSequence([{ status: 1 }, { status: 0 }])
    });
    assert.strictEqual(installed, false, '打包前偵測到程序啟動時應安全中止');
    assertUnchanged(asarPath, original);
    assertUnchanged(backupPath, original);
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.localized.tmp')), '二次安全閘門失敗後不得建立暫存 ASAR');
}

async function verifyGuardAfterLocalizedArchiveCreation(root) {
    const resourcesDir = path.join(root, 'install-process-started-after-pack');
    fs.mkdirSync(resourcesDir, { recursive: true });
    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.bak');
    fs.copyFileSync(path.join(root, 'official.asar'), asarPath);
    const original = fs.readFileSync(asarPath);

    const installed = engine.install20(resourcesDir, {
        platform: 'darwin',
        processRunner: runnerSequence([{ status: 1 }, { status: 1 }, { status: 0 }])
    });
    assert.strictEqual(installed, false, '打包後偵測到程序啟動時應安全中止');
    assertUnchanged(asarPath, original);
    assertUnchanged(backupPath, original);
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.localized.tmp')), '後段安全閘門失敗後必須清除暫存 ASAR');
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.localized.tmp.unpacked')), '後段安全閘門失敗後必須清除 unpacked 暫存目錄');
}

async function verifyGuardAfterRestoreCopy(root) {
    const resourcesDir = path.join(root, 'restore-process-started-after-copy');
    fs.mkdirSync(resourcesDir, { recursive: true });
    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = path.join(resourcesDir, 'app.asar.bak');
    fs.copyFileSync(path.join(root, 'localized.asar'), asarPath);
    fs.copyFileSync(path.join(root, 'official.asar'), backupPath);
    const current = fs.readFileSync(asarPath);
    const backup = fs.readFileSync(backupPath);

    const restored = engine.restore20(resourcesDir, {
        platform: 'darwin',
        processRunner: runnerSequence([{ status: 1 }, { status: 0 }])
    });
    assert.strictEqual(restored, false, '還原暫存檔建立後偵測到程序時應安全中止');
    assertUnchanged(asarPath, current);
    assertUnchanged(backupPath, backup);
    assert.ok(!fs.existsSync(path.join(resourcesDir, 'app.asar.restore.tmp')), '後段安全閘門失敗後必須清除還原暫存檔');
}

async function main() {
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: 0 }), 'running');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: 1 }), 'not-running');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: 2 }), 'unknown');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: null }), 'unknown');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: 1, signal: 'SIGTERM' }), 'unknown');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult({ status: 1, error: new Error('spawn failed') }), 'unknown');
    assert.strictEqual(engine.interpretMacAntigravityProcessResult(null), 'unknown');

    const calls = [];
    assert.strictEqual(engine.getMacAntigravityProcessState(runnerReturning({ status: 0 })), 'running');
    assert.strictEqual(
        engine.getMacAntigravityProcessState(runnerReturning({ status: 1 }, calls)),
        'not-running'
    );
    assert.strictEqual(engine.getMacAntigravityProcessState(runnerReturning({ status: 3 })), 'unknown');
    assert.strictEqual(
        engine.getMacAntigravityProcessState(runnerReturning({ status: null, error: new Error('spawn failed') })),
        'unknown'
    );
    assert.strictEqual(calls.length, 1);
    assert.strictEqual(calls[0].command, 'pgrep');
    assert.deepStrictEqual(calls[0].args, ['-x', 'Antigravity']);
    assert.strictEqual(calls[0].options.timeout, 5000);
    assert.strictEqual(engine.getMacAntigravityProcessState(() => { throw new Error('spawn failed'); }), 'unknown');

    const engineSource = fs.readFileSync(path.join(__dirname, '..', 'localization_engine.js'), 'utf-8');
    assert.ok(!/\bpkill\b/.test(engineSource), '引擎不得使用 pkill');
    assert.ok(!/\bkillall\b/.test(engineSource), '引擎不得使用 killall');
    assert.ok(!/osascript|tell application\s+["']Antigravity["']\s+to quit/i.test(engineSource), '引擎不得自動要求 macOS 關閉 Antigravity');
    assert.ok(engineSource.includes('taskkill /f /im Antigravity.exe'), 'Windows taskkill 行為必須保留');
    assert.ok(!/npm\s+install/i.test(engineSource), '使用者可見的引擎訊息不得要求安裝 npm 套件');

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-alt-macos-safety-'));
    try {
        await createAsarFixture(tempRoot, 'official', false);
        await createAsarFixture(tempRoot, 'localized', true);

        await verifyInstallGuard(tempRoot, 'running', { status: 0 });
        await verifyInstallGuard(tempRoot, 'unknown', { status: 2 });
        await verifyRestoreGuard(tempRoot, 'running', { status: 0 });
        await verifyRestoreGuard(tempRoot, 'unknown', { error: new Error('spawn failed'), status: null });
        await verifyGuardBeforeLocalizedArchiveCreation(tempRoot);
        await verifyGuardAfterLocalizedArchiveCreation(tempRoot);
        await verifyGuardAfterRestoreCopy(tempRoot);
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    console.log('macOS process-safety tests passed.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
