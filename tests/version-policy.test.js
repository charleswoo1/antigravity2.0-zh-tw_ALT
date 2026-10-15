'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseAltVersion, compareAltVersions, validateAlignedVersion, assertNewerVersion } = require('../tools/version-policy');

const manifest = { versions: {
    '2.9.9': { status: 'verified' },
    '2.24.0': { status: 'candidate' },
    '2.23.1': { status: 'verified' },
    '2.10.0': { status: 'verified' }
} };
for (const version of ['2.23.1', '2.23.1-alt.1', '2.23.1-alt.10']) {
    assert.strictEqual(validateAlignedVersion(version, manifest).upstreamVersion, '2.23.1');
}
for (const version of ['1.10.0', '2.10.0', '2.24.0', '2.23.2']) {
    assert.throws(() => validateAlignedVersion(version, manifest), /latest verified/);
}
for (const version of ['2.23.1-alt.0', '2.23.1-alt.01', '2.23.1-beta.1', '2.23.1+build.1', '02.23.1', '2.23', '2.23.1-alt.65535', '65536.0.0']) {
    assert.throws(() => parseAltVersion(version), /Invalid|limits/);
}
assert.throws(() => parseAltVersion('2.23.1-alt.9999'), /limits/);
assert.strictEqual(parseAltVersion('2.23.1-alt.9998').macosBuildVersion, '9999');
assert.throws(() => validateAlignedVersion('2.23.1', { versions: {} }), /No verified/);
assert.throws(() => validateAlignedVersion('2.23.1', { versions: { '2.23.1-alt.1': { status: 'verified' } } }), /Invalid upstream/);
assert(compareAltVersions('2.10.0', '2.9.9') > 0);
assert(compareAltVersions('2.23.1-alt.10', '2.23.1-alt.2') > 0);
assert(compareAltVersions('2.23.1-alt.1', '2.23.1') > 0);
assert(compareAltVersions('2.23.2', '2.23.1-alt.10') > 0);
assertNewerVersion('2.23.1', 'v1.10.0');
assertNewerVersion('2.23.1-alt.1', 'v2.23.1');
for (const [current, previous] of [['2.23.1', 'v2.23.1'], ['2.23.1', 'v2.23.1-alt.1'], ['2.23.1-alt.1', 'v2.23.1-alt.2']]) {
    assert.throws(() => assertNewerVersion(current, previous), /must be newer/);
}
assert.deepStrictEqual(parseAltVersion('2.23.1-alt.2'), {
    version: '2.23.1-alt.2', upstreamVersion: '2.23.1', revision: 2,
    windowsVersion: '2.23.1.2', macosBuildVersion: '3'
});
assert.strictEqual(parseAltVersion('2.23.1').windowsVersion, '2.23.1.0');
assert.strictEqual(parseAltVersion('2.23.1').macosBuildVersion, '1');

const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/release.yml'), 'utf8');
const branchPattern = workflow.match(/! "\$branch" =~ (\^release\/v[^\s]+) /)[1];
const releaseBranch = new RegExp(branchPattern);
for (const version of ['2.23.1', '2.23.1-alt.1', '2.23.1-alt.10']) {
    assert.strictEqual(releaseBranch.exec(`release/v${version}`)[1], version);
}
for (const branch of ['release/v2.23.1-alt.0', 'release/v2.23.1-alt.01', 'release/v2.23.1-beta.1', 'release/v2.23.1-alt.1/extra', 'main']) {
    assert(!releaseBranch.test(branch));
}

// Exercise the actual sync entry point, including rejection before any writes.
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-version-policy-'));
try {
    for (const dir of ['tools', 'compatibility', 'docs']) fs.mkdirSync(path.join(fixture, dir));
    for (const file of ['sync-version.js', 'version-policy.js']) {
        fs.copyFileSync(path.join(__dirname, '..', 'tools', file), path.join(fixture, 'tools', file));
    }
    fs.writeFileSync(path.join(fixture, 'compatibility/manifest.json'), JSON.stringify(manifest));
    const enginePath = path.join(fixture, 'localization_engine.js');
    const pagesPath = path.join(fixture, 'docs/index.html');
    fs.writeFileSync(enginePath, "const ENGINE_VERSION = '1.10.0';\n");
    fs.writeFileSync(pagesPath, '"softwareVersion": "1.10.0"\n目前 ALT 版本：<strong>1.10.0</strong>。明確支援 Antigravity <strong>2.9.9</strong>。');
    for (const version of ['1.10.0', '2.23.2', '2.23.1-beta.1']) {
        fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ version }));
        const before = [fs.readFileSync(enginePath, 'utf8'), fs.readFileSync(pagesPath, 'utf8')];
        for (const args of [[], ['--check']]) {
            const result = spawnSync(process.execPath, [path.join(fixture, 'tools/sync-version.js'), ...args], { encoding: 'utf8' });
            assert.notStrictEqual(result.status, 0);
            assert.deepStrictEqual([fs.readFileSync(enginePath, 'utf8'), fs.readFileSync(pagesPath, 'utf8')], before);
        }
    }
    for (const version of ['2.23.1', '2.23.1-alt.1']) {
        fs.writeFileSync(path.join(fixture, 'package.json'), JSON.stringify({ version }));
        for (const args of [[], ['--check']]) {
            const result = spawnSync(process.execPath, [path.join(fixture, 'tools/sync-version.js'), ...args], { encoding: 'utf8' });
            assert.strictEqual(result.status, 0, result.stderr);
        }
        assert(fs.readFileSync(enginePath, 'utf8').includes(`'${version}'`));
        assert(fs.readFileSync(pagesPath, 'utf8').includes(`"softwareVersion": "${version}"`));
    }
} finally {
    fs.rmSync(fixture, { recursive: true, force: true });
}
console.log('Upstream-aligned ALT version and revision policy tests passed.');
