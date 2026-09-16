'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const { spawnSync } = require('child_process');
const {
    loadCompatibilityManifest,
    loadCompatibilityProfile,
    getCompatibilityEntry,
    getVerifiedVersions,
    isVerifiedVersion
} = require('../compatibility');

const SIGNATURE_START = '/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION START --- */';
const EXIT_CODES = { PASS: 0, REVIEW_REQUIRED: 2, BLOCKED: 3 };

function sha256Buffer(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256File(filePath) {
    return sha256Buffer(fs.readFileSync(filePath));
}

function countLiteral(text, value) {
    if (!value) return 0;
    return text.split(value).length - 1;
}

function countAnchor(text, anchor) {
    if (anchor.type === 'literal') return countLiteral(text, anchor.value);
    if (anchor.type === 'regex') {
        const flags = anchor.flags && anchor.flags.includes('g') ? anchor.flags : `${anchor.flags || ''}g`;
        return (text.match(new RegExp(anchor.value, flags)) || []).length;
    }
    throw new Error(`未知 anchor 類型：${anchor.type}`);
}

function resolveResourcesDir(installDir) {
    const candidates = [
        path.join(installDir, 'resources'),
        path.join(installDir, 'Contents', 'Resources'),
        installDir
    ];
    return candidates.find(candidate => fs.existsSync(path.join(candidate, 'app.asar'))) || null;
}

function defaultInstallCandidates(platform = process.platform) {
    if (platform === 'win32') {
        return [
            process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Programs', 'antigravity') : '',
            'D:\\Antigravity',
            'C:\\Program Files\\Antigravity'
        ].filter(Boolean);
    }
    if (platform === 'darwin') {
        return ['/Applications/Antigravity.app', path.join(process.env.HOME || '', 'Applications', 'Antigravity.app')];
    }
    return [];
}

function locateInstallation(manualDir, platform = process.platform) {
    const candidates = manualDir ? [path.resolve(manualDir)] : defaultInstallCandidates(platform);
    for (const installDir of candidates) {
        const resourcesDir = resolveResourcesDir(installDir);
        if (resourcesDir) return { installDir, resourcesDir, asarPath: path.join(resourcesDir, 'app.asar') };
    }
    return null;
}

function snapshotInstallation(asarPath) {
    const stat = fs.statSync(asarPath);
    const backupPath = `${asarPath}.bak`;
    return {
        asar: { size: stat.size, mtimeMs: stat.mtimeMs, sha256: sha256File(asarPath) },
        backup: fs.existsSync(backupPath) ? {
            exists: true,
            size: fs.statSync(backupPath).size,
            sha256: sha256File(backupPath)
        } : { exists: false }
    };
}

function snapshotsEqual(before, after) {
    return before.asar.size === after.asar.size &&
        before.asar.sha256 === after.asar.sha256 &&
        before.backup.exists === after.backup.exists &&
        (!before.backup.exists || (
            before.backup.size === after.backup.size &&
            before.backup.sha256 === after.backup.sha256
        ));
}

function getAntigravityProcessState(platform = process.platform) {
    if (platform === 'win32') {
        const result = spawnSync('tasklist.exe', ['/FI', 'IMAGENAME eq Antigravity.exe', '/FO', 'CSV', '/NH'], {
            encoding: 'utf-8', windowsHide: true
        });
        if (result.error || result.status !== 0) return 'unknown';
        return /"Antigravity\.exe"/i.test(result.stdout) ? 'running' : 'not-running';
    }
    if (platform === 'darwin') {
        const result = spawnSync('pgrep', ['-x', 'Antigravity'], { encoding: 'utf-8' });
        if (result.error) return 'unknown';
        if (result.status === 0) return 'running';
        if (result.status === 1) return 'not-running';
    }
    return 'unknown';
}

function auditInstallation(options = {}) {
    const manifest = options.manifest || loadCompatibilityManifest();
    const location = options.location || locateInstallation(options.installDir, options.platform);
    if (!location) {
        return {
            schemaVersion: 1,
            status: 'BLOCKED',
            reason: '找不到 Antigravity 安裝目錄或 app.asar。',
            exitCode: EXIT_CODES.BLOCKED
        };
    }

    const before = snapshotInstallation(location.asarPath);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-compat-audit-'));
    let report;
    try {
        // @electron/asar caches archive headers globally. Explicitly invalidate the
        // target so an updater or a controlled apply/restore at the same path can
        // never produce stale member-existence results.
        asar.uncache(location.asarPath);
        let packageBuffer;
        try {
            packageBuffer = asar.extractFile(location.asarPath, 'package.json');
        } catch (error) {
            return {
                schemaVersion: 1,
                status: 'BLOCKED',
                reason: `無法讀取 package.json：${error.message}`,
                location,
                exitCode: EXIT_CODES.BLOCKED
            };
        }
        const packageJson = JSON.parse(packageBuffer.toString('utf-8'));
        const version = packageJson.version || '';
        const entry = getCompatibilityEntry(version, manifest);
        const profileId = options.profile || (entry && entry.profile) || manifest.defaultCandidateProfile;
        const profile = loadCompatibilityProfile(profileId, manifest);
        const issues = [];
        const members = {};
        let localized = false;

        const transactionalArtifacts = [
            'app.asar.pre-localization',
            'app.asar.localized.tmp',
            'app.asar.restore.tmp',
            'app.asar.localized.tmp.unpacked',
            'app.asar.restore.tmp.unpacked'
        ].map(name => ({ name, exists: fs.existsSync(path.join(location.resourcesDir, name)) }));
        for (const artifact of transactionalArtifacts.filter(item => item.exists)) {
            issues.push({
                severity: 'blocked',
                id: `ambiguous-artifact:${artifact.name}`,
                message: `偵測到未處理的交易檔案 ${artifact.name}`
            });
        }

        if (options.requireVerified && !isVerifiedVersion(version, manifest)) {
            issues.push({
                severity: 'blocked',
                id: 'unsupported-version',
                message: `Antigravity ${version || '無法辨識'} 尚未列入 verified allowlist`
            });
        }
        const processState = options.requireNotRunning ? getAntigravityProcessState(options.platform) : 'not-checked';
        if (processState === 'running') {
            issues.push({ severity: 'blocked', id: 'process-running', message: 'Antigravity 仍在執行' });
        } else if (processState === 'unknown') {
            issues.push({ severity: 'blocked', id: 'process-state-unknown', message: '無法確認 Antigravity 程序狀態' });
        }

        for (const [memberPath, definition] of Object.entries(profile.members)) {
            let buffer;
            try {
                buffer = asar.extractFile(location.asarPath, path.join(...memberPath.split('/')));
            } catch (error) {
                members[memberPath] = { exists: false, required: definition.required };
                if (definition.required) issues.push({ severity: 'blocked', id: `missing:${memberPath}`, message: `缺少必要成員 ${memberPath}` });
                continue;
            }

            const extractedPath = path.join(tempDir, ...memberPath.split('/'));
            fs.mkdirSync(path.dirname(extractedPath), { recursive: true });
            fs.writeFileSync(extractedPath, buffer);
            const text = buffer.toString('utf-8');
            if (memberPath === 'dist/preload.js') localized = text.includes(SIGNATURE_START);
            const anchors = (definition.anchors || []).map(anchor => {
                const count = countAnchor(text, anchor);
                const matched = count === anchor.expectedCount;
                if (!matched) {
                    issues.push({
                        severity: 'review',
                        id: `anchor:${anchor.id}`,
                        message: `${anchor.id} 預期 ${anchor.expectedCount}，實際 ${count}`
                    });
                }
                return { id: anchor.id, count, expectedCount: anchor.expectedCount, matched };
            });
            members[memberPath] = {
                exists: true,
                required: definition.required,
                size: buffer.length,
                sha256: sha256Buffer(buffer),
                anchors
            };
        }

        const unpacked = (profile.unpackedPaths || []).map(definition => {
            const fullPath = path.join(location.resourcesDir, 'app.asar.unpacked', ...definition.path.split('/'));
            const exists = fs.existsSync(fullPath);
            if (definition.required && !exists) {
                issues.push({ severity: 'blocked', id: `missing-unpacked:${definition.path}`, message: `缺少必要 unpacked 路徑 ${definition.path}` });
            }
            return { path: definition.path, required: definition.required, exists };
        });

        const after = snapshotInstallation(location.asarPath);
        const noMutation = snapshotsEqual(before, after);
        if (!noMutation) issues.push({ severity: 'blocked', id: 'audit-mutated-installation', message: '稽核前後安裝檔案狀態不一致' });
        const status = issues.some(issue => issue.severity === 'blocked')
            ? 'BLOCKED'
            : (issues.some(issue => issue.severity === 'review') ? 'REVIEW_REQUIRED' : 'PASS');

        report = {
            schemaVersion: 1,
            status,
            exitCode: EXIT_CODES[status],
            candidateStructurallyCompatible: status === 'PASS',
            verifiedSupported: isVerifiedVersion(version, manifest),
            processState,
            upstreamVersion: version,
            profile: profileId,
            localized,
            archive: { size: before.asar.size, sha256: before.asar.sha256 },
            members,
            unpacked,
            transactionalArtifacts,
            issues,
            noMutation,
            preAuditBackupExists: before.backup.exists,
            location: {
                installDir: location.installDir,
                resourcesDir: location.resourcesDir,
                asarPath: location.asarPath
            }
        };
        return report;
    } catch (error) {
        report = {
            schemaVersion: 1,
            status: 'BLOCKED',
            reason: error.message,
            location,
            exitCode: EXIT_CODES.BLOCKED
        };
        return report;
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

function createFingerprint(report) {
    return {
        schemaVersion: 1,
        upstreamVersion: report.upstreamVersion,
        profile: report.profile,
        auditStatus: report.status,
        archive: report.archive,
        localized: report.localized,
        members: report.members,
        unpacked: report.unpacked
    };
}

function formatHumanReport(report) {
    const lines = [
        'Antigravity Version Compatibility Audit',
        `狀態：${report.status}`,
        `偵測版本：${report.upstreamVersion || '無法辨識'}`,
        `Profile：${report.profile || '無'}`,
        `已驗證支援：${report.verifiedSupported ? '是' : '否'}`,
        `程序狀態：${report.processState || '未檢查'}`,
        `唯讀未修改：${report.noMutation ? '是' : '否'}`
    ];
    if (report.status === 'PASS' && !report.verifiedSupported) {
        lines.push('判定：結構相容候選；尚未完成受控 apply/restore，不得宣稱已支援。');
    }
    for (const issue of report.issues || []) lines.push(`- [${issue.severity}] ${issue.message}`);
    return lines.join('\n');
}

function parseArgs(argv) {
    const args = {};
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--install-dir') args.installDir = argv[++i];
        else if (argv[i] === '--profile') args.profile = argv[++i];
        else if (argv[i] === '--json') args.jsonPath = argv[++i];
        else if (argv[i] === '--fingerprint') args.fingerprintPath = argv[++i];
        else if (argv[i] === '--error-summary') args.errorSummaryPath = argv[++i];
        else if (argv[i] === '--require-verified') args.requireVerified = true;
        else if (argv[i] === '--require-not-running') args.requireNotRunning = true;
        else throw new Error(`未知參數：${argv[i]}`);
    }
    return args;
}

function errorCodeFor(report) {
    const ids = new Set((report.issues || []).map(issue => issue.id));
    if (!report.location) return 'MISSING_INSTALLATION';
    if (ids.has('unsupported-version')) return 'UNSUPPORTED_VERSION';
    if (ids.has('process-running')) return 'PROCESS_RUNNING';
    if (ids.has('process-state-unknown')) return 'PROCESS_STATE_UNKNOWN';
    return report.status === 'PASS' ? '' : 'PREFLIGHT_BLOCKED';
}

function writeErrorSummary(summaryPath, report) {
    if (!summaryPath || report.status === 'PASS') return;
    const code = errorCodeFor(report);
    const primaryIssue = (report.issues || [])[0];
    const lines = [
        `錯誤代碼：${code}`,
        `原因：${primaryIssue ? primaryIssue.message : (report.reason || '相容性 preflight 失敗。')}`
    ];
    if (report.upstreamVersion) lines.push(`偵測版本：${report.upstreamVersion}`);
    lines.push(`已驗證版本：${getVerifiedVersions().join(', ')}`);
    lines.push('Antigravity 未被修改。');
    fs.mkdirSync(path.dirname(path.resolve(summaryPath)), { recursive: true });
    fs.writeFileSync(summaryPath, `${lines.join('\n')}\n`, 'utf-8');
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const report = auditInstallation(args);
    console.log(formatHumanReport(report));
    if (args.jsonPath) {
        fs.mkdirSync(path.dirname(path.resolve(args.jsonPath)), { recursive: true });
        fs.writeFileSync(args.jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf-8');
        console.log(`JSON：${path.resolve(args.jsonPath)}`);
    }
    if (args.fingerprintPath && report.status === 'PASS') {
        fs.mkdirSync(path.dirname(path.resolve(args.fingerprintPath)), { recursive: true });
        fs.writeFileSync(args.fingerprintPath, JSON.stringify(createFingerprint(report), null, 2) + '\n', 'utf-8');
        console.log(`Fingerprint：${path.resolve(args.fingerprintPath)}`);
    }
    writeErrorSummary(args.errorSummaryPath, report);
    process.exitCode = report.exitCode;
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(`[BLOCKED] ${error.message}`);
        process.exitCode = EXIT_CODES.BLOCKED;
    }
}

module.exports = {
    EXIT_CODES,
    auditInstallation,
    createFingerprint,
    formatHumanReport,
    locateInstallation,
    countAnchor,
    getAntigravityProcessState,
    writeErrorSummary
};
