'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const asar = require('@electron/asar');
const engine = require('../localization_engine');

function sha256File(filePath) {
    return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function processState() {
    if (process.platform === 'win32') {
        const result = spawnSync('tasklist.exe', ['/FI', 'IMAGENAME eq Antigravity.exe', '/FO', 'CSV', '/NH'], {
            encoding: 'utf-8', windowsHide: true
        });
        if (result.error || result.status !== 0) return 'unknown';
        return /"Antigravity\.exe"/i.test(result.stdout) ? 'running' : 'not-running';
    }
    if (process.platform === 'darwin') {
        const result = spawnSync('pgrep', ['-x', 'Antigravity'], { encoding: 'utf-8' });
        if (result.error) return 'unknown';
        if (result.status === 0) return 'running';
        if (result.status === 1) return 'not-running';
    }
    return 'unknown';
}

function treeFingerprint(root) {
    const entries = [];
    function walk(current, relative = '') {
        for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
            const fullPath = path.join(current, entry.name);
            const rel = path.join(relative, entry.name).replace(/\\/g, '/');
            if (entry.isDirectory()) walk(fullPath, rel);
            else if (entry.isFile()) entries.push(`${rel}:${fs.statSync(fullPath).size}:${sha256File(fullPath)}`);
            else if (entry.isSymbolicLink()) entries.push(`${rel}:link:${fs.readlinkSync(fullPath)}`);
        }
    }
    walk(root);
    return {
        fileCount: entries.length,
        sha256: crypto.createHash('sha256').update(entries.join('\n')).digest('hex')
    };
}

function parseArgs(argv) {
    const result = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--install-dir') result.installDir = path.resolve(argv[++i] || '');
        else if (argv[i] === '--audit') result.auditPath = path.resolve(argv[++i] || '');
        else if (argv[i] === '--json') result.jsonPath = path.resolve(argv[++i] || '');
        else throw new Error(`未知參數：${argv[i]}`);
    }
    if (!result.installDir || !result.auditPath || !result.jsonPath) {
        throw new Error('必須提供 --install-dir、--audit 與 --json。');
    }
    return result;
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const resourcesDir = path.join(args.installDir, 'resources');
    const asarPath = path.join(resourcesDir, 'app.asar');
    const backupPath = `${asarPath}.bak`;
    const unpackedPath = path.join(resourcesDir, 'app.asar.unpacked', 'node_modules', 'chrome-devtools-mcp');
    const audit = JSON.parse(fs.readFileSync(args.auditPath, 'utf-8'));
    const report = {
        schemaVersion: 1,
        upstreamVersion: audit.upstreamVersion,
        startedAt: new Date().toISOString(),
        status: 'BLOCKED',
        apply: null,
        restore: null,
        finalState: null
    };
    let mutationStarted = false;
    let failure;
    try {
        if (processState() !== 'not-running') throw new Error('Antigravity 仍在執行或無法確認程序狀態；未開始修改。');
        if (audit.status !== 'PASS' || audit.noMutation !== true) throw new Error('唯讀稽核不是 PASS/noMutation；未開始修改。');
        if (!fs.existsSync(asarPath)) throw new Error('找不到 real-install app.asar。');
        if (fs.existsSync(backupPath)) throw new Error('偵測到既有 app.asar.bak；為避免覆寫未知備份，未開始修改。');
        if (sha256File(asarPath) !== audit.archive.sha256) throw new Error('app.asar 已在稽核後變更；未開始修改。');
        const before = engine.inspectAsar(asarPath);
        if (before.version !== audit.upstreamVersion || before.localized) throw new Error('稽核版本與目前官方 archive 狀態不一致。');
        if (!fs.existsSync(unpackedPath)) throw new Error('缺少官方 chrome-devtools-mcp unpacked 目錄。');
        const beforeHash = sha256File(asarPath);
        const unpackedBefore = treeFingerprint(unpackedPath);

        mutationStarted = true;
        if (!engine.install20(resourcesDir, { candidateAudit: audit, skipProcessClose: true })) {
            throw new Error('ALT real-install apply 失敗。');
        }
        const applied = engine.inspectAsar(asarPath);
        const unpackedApplied = treeFingerprint(unpackedPath);
        if (applied.version !== audit.upstreamVersion || !applied.localized) throw new Error('套用後 archive 版本或主簽章驗證失敗。');
        if (before.wizardPresent && !applied.wizardLocalized) throw new Error('套用後 wizard 簽章驗證失敗。');
        if (JSON.stringify(unpackedApplied) !== JSON.stringify(unpackedBefore)) throw new Error('套用後官方 unpacked 結構指紋改變。');
        const menuAnchor = audit.members?.['dist/menu.js']?.anchors?.find(anchor => anchor.id === 'menu-set-application-menu');
        let menuApplicationPoints = null;
        if (menuAnchor?.expectedCount) {
            const appliedMenu = asar.extractFile(asarPath, path.join('dist', 'menu.js')).toString('utf-8');
            menuApplicationPoints = appliedMenu.split('/* --- MENU TRANSLATION START --- */').length - 1;
            if (menuApplicationPoints !== menuAnchor.expectedCount) {
                throw new Error(`套用後選單注入區塊預期 ${menuAnchor.expectedCount}，實際 ${menuApplicationPoints}。`);
            }
            try {
                new Function(appliedMenu);
            } catch (error) {
                throw new Error(`套用後 menu.js 語法驗證失敗：${error.message}`);
            }
        }
        report.apply = {
            status: 'PASS',
            version: applied.version,
            localized: applied.localized,
            wizardPresent: applied.wizardPresent,
            wizardLocalized: applied.wizardLocalized,
            unpacked: unpackedApplied,
            menuApplicationPoints
        };

        if (!engine.restore20(resourcesDir, { skipProcessClose: true })) throw new Error('ALT real-install restore 失敗。');
        mutationStarted = false;
        const restored = engine.inspectAsar(asarPath);
        const unpackedRestored = treeFingerprint(unpackedPath);
        if (restored.version !== audit.upstreamVersion || restored.localized) throw new Error('還原後 archive 不是同版本官方未中文化狀態。');
        if (sha256File(asarPath) !== beforeHash) throw new Error('還原後 app.asar SHA-256 與稽核前不同。');
        if (fs.existsSync(backupPath)) throw new Error('還原後 app.asar.bak 未依政策清除。');
        if (JSON.stringify(unpackedRestored) !== JSON.stringify(unpackedBefore)) throw new Error('還原後官方 unpacked 結構指紋改變。');
        report.restore = { status: 'PASS', version: restored.version, localized: restored.localized };
        report.status = 'PASS';
    } catch (error) {
        failure = error;
        report.reason = error.message;
        if (mutationStarted && fs.existsSync(backupPath) && processState() === 'not-running') {
            try {
                report.emergencyRestore = engine.restore20(resourcesDir, { skipProcessClose: true }) ? 'PASS' : 'FAILED';
            } catch (restoreError) {
                report.emergencyRestore = `FAILED: ${restoreError.message}`;
            }
        }
    } finally {
        if (fs.existsSync(asarPath)) {
            const final = engine.inspectAsar(asarPath);
            report.finalState = {
                version: final.version,
                localized: final.localized,
                backupExists: fs.existsSync(backupPath),
                archiveSha256: sha256File(asarPath)
            };
        }
        report.finishedAt = new Date().toISOString();
        fs.mkdirSync(path.dirname(args.jsonPath), { recursive: true });
        fs.writeFileSync(args.jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8');
    }
    console.log(JSON.stringify(report, null, 2));
    if (failure) throw failure;
}

try {
    main();
} catch (error) {
    console.error(`[BLOCKED] ${error.message}`);
    process.exitCode = 1;
}
