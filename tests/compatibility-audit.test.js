'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const { auditInstallation, formatHumanReport } = require('../tools/compatibility-audit');
const { getVerifiedVersions, isVerifiedVersion } = require('../compatibility');

async function createFixture(root, options = {}) {
    const sourceDir = path.join(root, 'source');
    const resourcesDir = path.join(root, 'Antigravity', 'resources');
    const distDir = path.join(sourceDir, 'dist');
    const wizardDir = path.join(distDir, 'ideInstall');
    fs.mkdirSync(distDir, { recursive: true });
    fs.mkdirSync(wizardDir, { recursive: true });
    fs.mkdirSync(resourcesDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'package.json'), JSON.stringify({
        name: 'antigravity',
        version: options.version || '2.14.0'
    }));
    if (!options.missingPreload) fs.writeFileSync(path.join(distDir, 'preload.js'), 'console.log("fixture");\n');
    if (!options.missingMenu) {
        fs.writeFileSync(path.join(distDir, 'menu.js'), options.badMenu
            ? 'electron_1.Menu.setApplicationMenu(otherMenu);\n'
            : (options.menuRefresh
                ? "const items = [{ label: 'New Window' }, { label: 'Docs' }, { label: 'Connect to WSL' }, { label: 'Reopen Locally' }];\nelectron_1.Menu.setApplicationMenu(menu);\nelectron_1.Menu.setApplicationMenu(menu);\n"
                : "const items = [{ label: 'New Window' }, { label: 'Docs' }];\nelectron_1.Menu.setApplicationMenu(menu);\n"));
    }
    fs.writeFileSync(path.join(distDir, 'tray.js'), "function createTray(actions) {\ncountItem.label = (count > 0 ? count : 'No agents') + ' running';\n}\n");
    fs.writeFileSync(path.join(distDir, 'loadingOverlay.js'), '<div class="text">Loading Antigravity</div>\n');
    if (!options.missingWizard) fs.writeFileSync(path.join(wizardDir, 'wizardPreload.js'), 'console.log("wizard fixture");\n');
    await asar.createPackage(sourceDir, path.join(resourcesDir, 'app.asar'));
    fs.mkdirSync(path.join(resourcesDir, 'app.asar.unpacked', 'node_modules', 'chrome-devtools-mcp'), { recursive: true });
    return { installDir: path.join(root, 'Antigravity'), asarPath: path.join(resourcesDir, 'app.asar') };
}

async function main() {
    assert.deepStrictEqual(getVerifiedVersions(), ['2.13.0', '2.14.0', '2.15.0', '2.15.1', '2.16.0', '2.17.0']);
    assert.strictEqual(isVerifiedVersion('2.13.0'), true);
    assert.strictEqual(isVerifiedVersion('2.14.0'), true);
    assert.strictEqual(isVerifiedVersion('2.15.0'), true);
    assert.strictEqual(isVerifiedVersion('2.15.1'), true);
    assert.strictEqual(isVerifiedVersion('2.16.0'), true);
    assert.strictEqual(isVerifiedVersion('2.17.0'), true);
    assert.strictEqual(isVerifiedVersion('2.18.0'), false, '未列入 allowlist 的版本不得宣稱已支援');

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-compat-test-'));
    try {
        const passFixture = await createFixture(path.join(tempRoot, 'pass'));
        const before = fs.readFileSync(passFixture.asarPath);
        const pass = auditInstallation({ installDir: passFixture.installDir });
        assert.strictEqual(pass.status, 'PASS');
        assert.strictEqual(pass.exitCode, 0);
        assert.strictEqual(pass.upstreamVersion, '2.14.0');
        assert.strictEqual(pass.verifiedSupported, true);
        assert.strictEqual(pass.candidateStructurallyCompatible, true);
        assert.strictEqual(pass.noMutation, true);
        assert.strictEqual(pass.preAuditBackupExists, false);
        assert.deepStrictEqual(fs.readFileSync(passFixture.asarPath), before, '唯讀稽核不得改寫 app.asar');
        assert.ok(!fs.existsSync(`${passFixture.asarPath}.bak`), '唯讀稽核不得建立備份');
        assert.match(formatHumanReport(pass), /已驗證支援：是/);
        const gated = auditInstallation({ installDir: passFixture.installDir, requireVerified: true });
        assert.strictEqual(gated.status, 'PASS');
        const ambiguousArtifact = path.join(path.dirname(passFixture.asarPath), 'app.asar.pre-localization');
        fs.writeFileSync(ambiguousArtifact, 'stale transaction');
        const ambiguous = auditInstallation({ installDir: passFixture.installDir });
        assert.strictEqual(ambiguous.status, 'BLOCKED');
        assert.ok(ambiguous.issues.some(issue => issue.id === 'ambiguous-artifact:app.asar.pre-localization'));
        fs.unlinkSync(ambiguousArtifact);

        const localizedSource = path.join(tempRoot, 'localized-source');
        fs.copyFileSync(passFixture.asarPath, `${passFixture.asarPath}.bak`);
        asar.extractAll(passFixture.asarPath, localizedSource);
        fs.appendFileSync(path.join(localizedSource, 'dist', 'preload.js'), '\n/* --- ANTIGRAVITY ZH-HANT-TW LOCALIZATION START --- */\n');
        fs.writeFileSync(path.join(localizedSource, 'dist', 'tray.js'), '已中文化 tray fixture\n');
        fs.writeFileSync(path.join(localizedSource, 'dist', 'loadingOverlay.js'), '已中文化 loading fixture\n');
        await asar.createPackage(localizedSource, passFixture.asarPath);
        const localized = auditInstallation({ installDir: passFixture.installDir });
        assert.strictEqual(localized.localized, true);
        assert.strictEqual(localized.status, 'PASS', '重複安裝的 preflight 應以同版本官方備份驗證原始 patch anchors');
        assert.strictEqual(localized.preAuditBackupExists, true);

        const reviewFixture = await createFixture(path.join(tempRoot, 'review'), { badMenu: true });
        const review = auditInstallation({ installDir: reviewFixture.installDir });
        assert.strictEqual(review.status, 'REVIEW_REQUIRED');
        assert.strictEqual(review.exitCode, 2);
        assert.ok(review.issues.some(issue => issue.id === 'anchor:menu-set-application-menu'));

        const menuRefreshFixture = await createFixture(path.join(tempRoot, 'menu-refresh'), {
            version: '2.17.0',
            menuRefresh: true
        });
        const menuRefresh = auditInstallation({
            installDir: menuRefreshFixture.installDir,
            profile: 'v2-mainline-menu-refresh'
        });
        assert.strictEqual(menuRefresh.status, 'PASS');
        assert.strictEqual(menuRefresh.verifiedSupported, true);
        assert.strictEqual(menuRefresh.profile, 'v2-mainline-menu-refresh');

        const missingPatchTargetFixture = await createFixture(path.join(tempRoot, 'missing-patch-target'), { missingMenu: true });
        const missingPatchTarget = auditInstallation({ installDir: missingPatchTargetFixture.installDir });
        assert.strictEqual(missingPatchTarget.status, 'REVIEW_REQUIRED', '已知 optional patch target 消失不得 PASS');
        assert.strictEqual(missingPatchTarget.exitCode, 2);
        assert.ok(missingPatchTarget.issues.some(issue => issue.id === 'missing:dist/menu.js'));

        const blockedFixture = await createFixture(path.join(tempRoot, 'blocked'), { missingPreload: true });
        const blocked = auditInstallation({ installDir: blockedFixture.installDir });
        assert.strictEqual(blocked.status, 'BLOCKED');
        assert.strictEqual(blocked.exitCode, 3);
        assert.ok(blocked.issues.some(issue => issue.id === 'missing:dist/preload.js'));

        const verifiedFixture = await createFixture(path.join(tempRoot, 'verified'), { version: '2.13.0' });
        const verified = auditInstallation({ installDir: verifiedFixture.installDir });
        assert.strictEqual(verified.status, 'PASS');
        assert.strictEqual(verified.verifiedSupported, true);
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
    console.log('Compatibility audit tests passed.');
}

main().catch(error => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
});
