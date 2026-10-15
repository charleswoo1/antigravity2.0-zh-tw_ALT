'use strict';

const fs = require('fs');
const path = require('path');

function parseAltVersion(version) {
    const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-alt\.([1-9]\d*))?$/.exec(version);
    if (!match) throw new Error(`Invalid ALT version: ${version}; expected X.Y.Z or X.Y.Z-alt.N (N >= 1).`);
    const parts = match.slice(1, 4).map(Number);
    const revision = Number(match[4] || 0);
    if (parts.some(part => !Number.isSafeInteger(part) || part > 65535) || !Number.isSafeInteger(revision) || revision > 9998) {
        throw new Error(`ALT version exceeds native package numeric limits: ${version}`);
    }
    return {
        version,
        upstreamVersion: parts.join('.'),
        revision,
        windowsVersion: [...parts, revision].join('.'),
        macosBuildVersion: String(revision + 1)
    };
}

function compareAltVersions(left, right) {
    const a = parseAltVersion(left);
    const b = parseAltVersion(right);
    const av = [...a.upstreamVersion.split('.').map(Number), a.revision];
    const bv = [...b.upstreamVersion.split('.').map(Number), b.revision];
    for (let i = 0; i < av.length; i++) {
        if (av[i] !== bv[i]) return av[i] < bv[i] ? -1 : 1;
    }
    return 0;
}

function validateAlignedVersion(version, manifest) {
    const metadata = parseAltVersion(version);
    const verified = Object.entries(manifest.versions || {})
        .filter(([, entry]) => entry && entry.status === 'verified')
        .map(([upstream]) => {
            if (parseAltVersion(upstream).revision !== 0) throw new Error(`Invalid upstream version: ${upstream}`);
            return upstream;
        })
        .sort(compareAltVersions);
    if (!verified.length) throw new Error('No verified Antigravity versions in compatibility manifest.');
    const latest = verified[verified.length - 1];
    if (metadata.upstreamVersion !== latest) {
        throw new Error(`ALT ${version} must target latest verified Antigravity ${latest}; use ${latest} or ${latest}-alt.N.`);
    }
    return metadata;
}

function assertNewerVersion(version, previous) {
    if (compareAltVersions(version, previous.replace(/^v/, '')) <= 0) {
        throw new Error(`ALT ${version} must be newer than published ${previous} under ALT revision ordering.`);
    }
}

if (require.main === module) {
    try {
        const root = path.resolve(__dirname, '..');
        const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'compatibility', 'manifest.json'), 'utf8'));
        const metadata = validateAlignedVersion(version, manifest);
        const [flag, value] = process.argv.slice(2);
        if (flag === '--field' && Object.hasOwn(metadata, value)) process.stdout.write(String(metadata[value]));
        else if (flag === '--after' && value) assertNewerVersion(version, value);
        else if (!flag) console.log(`ALT ${version} targets latest verified Antigravity ${metadata.upstreamVersion}.`);
        else throw new Error('Usage: version-policy.js [--field <metadata field> | --after <published version>]');
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { parseAltVersion, compareAltVersions, validateAlignedVersion, assertNewerVersion };
