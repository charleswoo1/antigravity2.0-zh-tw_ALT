'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const asar = require('@electron/asar');
const engine = require('../localization_engine');

const repoRoot = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));

async function main() {
    assert.strictEqual(engine.EDITION, 'ALT');
    assert.strictEqual(engine.ENGINE_VERSION, packageJson.version);
    assert.deepStrictEqual(engine.getVerifiedVersions(), ['2.13.0', '2.14.0', '2.15.0', '2.15.1', '2.16.0', '2.17.0']);

    const dictDir = path.join(__dirname, '..', 'dicts');
    const dictionary = {};
    for (const file of fs.readdirSync(dictDir).filter(name => name.endsWith('.json'))) {
        Object.assign(dictionary, JSON.parse(fs.readFileSync(path.join(dictDir, file), 'utf-8')));
    }

    const required213Keys = [
        'Documents',
        'Scratch Files',
        'Hide Whitespace Changes',
        'Side Question',
        'Cancel questionnaire and stop the agent',
        'Pin this conversation',
        'Amend staged changes into the current commit',
        'Failed to parse settings. Fix and restart.'
    ];
    for (const key of required213Keys) {
        assert.ok(dictionary[key], `缺少 Antigravity 2.13.0 詞條：${key}`);
    }

    const generated = engine.generateJs();
    assert.ok(generated.includes(engine.SIGNATURE_START), '產生的注入碼缺少起始簽章');
    assert.ok(generated.includes(engine.SIGNATURE_END), '產生的注入碼缺少結束簽章');
    assert.ok(generated.includes('隱藏空白字元變更'), '產生的注入碼未包含 2.13.0 詞條');

    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-zh-tw-test-'));
    try {
        const fixtureDir = path.join(tempRoot, 'fixture');
        const distDir = path.join(fixtureDir, 'dist');
        const wizardDir = path.join(distDir, 'ideInstall');
        fs.mkdirSync(distDir, { recursive: true });
        fs.mkdirSync(wizardDir, { recursive: true });
        fs.writeFileSync(path.join(fixtureDir, 'package.json'), JSON.stringify({
            name: 'antigravity',
            version: '2.13.0'
        }), 'utf-8');
        fs.writeFileSync(path.join(distDir, 'preload.js'), 'console.log("fixture");\n', 'utf-8');
        fs.writeFileSync(path.join(wizardDir, 'wizardPreload.js'), 'console.log("wizard fixture");\n', 'utf-8');

        const archivePath = path.join(tempRoot, 'fixture.asar');
        await asar.createPackage(fixtureDir, archivePath);
        const before = engine.inspectAsar(archivePath);
        assert.strictEqual(before.version, '2.13.0');
        assert.strictEqual(before.localized, false);
        assert.strictEqual(before.wizardPresent, true);
        assert.strictEqual(before.wizardLocalized, false);

        engine.injectTranslationFile(path.join(distDir, 'preload.js'), '測試 preload.js', generated);
        engine.injectTranslationFile(path.join(wizardDir, 'wizardPreload.js'), '測試 wizardPreload.js', generated);
        const localizedArchivePath = path.join(tempRoot, 'fixture-localized.asar');
        await asar.createPackage(fixtureDir, localizedArchivePath);
        const after = engine.inspectAsar(localizedArchivePath);
        assert.strictEqual(after.version, '2.13.0', after.error);
        assert.strictEqual(after.localized, true);
        assert.strictEqual(after.wizardLocalized, true);

        engine.injectTranslationFile(path.join(distDir, 'preload.js'), '重複套用測試', generated);
        const reinjected = fs.readFileSync(path.join(distDir, 'preload.js'), 'utf-8');
        assert.strictEqual(reinjected.split(engine.SIGNATURE_START).length - 1, 1, '重複套用後出現多個中文化區塊');
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }

    const agentRules = fs.readFileSync(path.join(__dirname, '..', 'AGENTS.md'), 'utf-8');
    assert.ok(agentRules.includes('GitHub Actions 受控 CI 政策'));
    assert.ok(agentRules.includes('permissions: contents: read'));
    assert.ok(agentRules.includes('不得自動 merge Pull Request'));
    assert.ok(fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'ci.yml')), '專案應包含受控 GitHub Actions CI workflow');

    console.log('Smoke tests passed.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
