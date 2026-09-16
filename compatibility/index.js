'use strict';

const fs = require('fs');
const path = require('path');

const compatibilityRoot = __dirname;
const manifestPath = path.join(compatibilityRoot, 'manifest.json');

function loadCompatibilityManifest() {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

function loadCompatibilityProfile(profileId, manifest = loadCompatibilityManifest()) {
    const relativePath = manifest.profiles[profileId];
    if (!relativePath) throw new Error(`未知的相容性 profile：${profileId}`);
    const profilePath = path.join(compatibilityRoot, relativePath);
    const profile = JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
    if (profile.id !== profileId) throw new Error(`相容性 profile ID 不一致：${profileId}`);
    return profile;
}

function getCompatibilityEntry(version, manifest = loadCompatibilityManifest()) {
    return manifest.versions[version] || null;
}

function getVerifiedVersions(manifest = loadCompatibilityManifest()) {
    return Object.entries(manifest.versions)
        .filter(([, entry]) => entry.status === 'verified')
        .map(([version]) => version)
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function isVerifiedVersion(version, manifest = loadCompatibilityManifest()) {
    const entry = getCompatibilityEntry(version, manifest);
    return Boolean(entry && entry.status === 'verified');
}

module.exports = {
    manifestPath,
    loadCompatibilityManifest,
    loadCompatibilityProfile,
    getCompatibilityEntry,
    getVerifiedVersions,
    isVerifiedVersion
};
