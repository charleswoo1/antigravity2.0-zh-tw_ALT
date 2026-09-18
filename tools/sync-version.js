'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packagePath = path.join(repoRoot, 'package.json');
const enginePath = path.join(repoRoot, 'localization_engine.js');
const compatibilityManifestPath = path.join(repoRoot, 'compatibility', 'manifest.json');
const pagesIndexPath = path.join(repoRoot, 'docs', 'index.html');

const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const compatibilityManifest = JSON.parse(fs.readFileSync(compatibilityManifestPath, 'utf8'));
const version = String(packageJson.version || '');
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!semverPattern.test(version)) {
    throw new Error(`Invalid ALT version in package.json: ${version}`);
}

const verifiedVersions = Object.entries(compatibilityManifest.versions || {})
    .filter(([, entry]) => entry && entry.status === 'verified')
    .map(([upstreamVersion]) => upstreamVersion);

if (verifiedVersions.length === 0) {
    throw new Error('compatibility/manifest.json must contain at least one verified Antigravity version.');
}

const verifiedVersionsText = verifiedVersions.join('、');
const checkOnly = process.argv.includes('--check');

const engineSource = fs.readFileSync(enginePath, 'utf8');
const versionDeclarationPattern = /const ENGINE_VERSION = '[^']+';/;
const engineMatch = engineSource.match(versionDeclarationPattern);
if (!engineMatch) {
    throw new Error('Could not find the ENGINE_VERSION declaration in localization_engine.js');
}
const expectedDeclaration = `const ENGINE_VERSION = '${version}';`;

const pagesSource = fs.readFileSync(pagesIndexPath, 'utf8');
const pagesSoftwareVersionPattern = /"softwareVersion": "[^"]+"/;
const pagesSummaryPattern = /目前 ALT 版本：<strong>[^<]+<\/strong>。明確支援 Antigravity <strong>[^<]+<\/strong>。/;

const pagesSoftwareVersionMatch = pagesSource.match(pagesSoftwareVersionPattern);
if (!pagesSoftwareVersionMatch) {
    throw new Error('Could not find JSON-LD softwareVersion in docs/index.html');
}

const pagesSummaryMatch = pagesSource.match(pagesSummaryPattern);
if (!pagesSummaryMatch) {
    throw new Error('Could not find the visible ALT/support version summary in docs/index.html');
}

const expectedPagesSoftwareVersion = `"softwareVersion": "${version}"`;
const expectedPagesSummary =
    `目前 ALT 版本：<strong>${version}</strong>。明確支援 Antigravity <strong>${verifiedVersionsText}</strong>。`;

const errors = [];
if (engineMatch[0] !== expectedDeclaration) {
    errors.push(`ENGINE_VERSION is out of sync (${engineMatch[0]})`);
}
if (pagesSoftwareVersionMatch[0] !== expectedPagesSoftwareVersion) {
    errors.push(`docs/index.html softwareVersion is out of sync (${pagesSoftwareVersionMatch[0]})`);
}
if (pagesSummaryMatch[0] !== expectedPagesSummary) {
    errors.push(`docs/index.html visible version/support summary is out of sync (${pagesSummaryMatch[0]})`);
}

if (checkOnly) {
    if (errors.length > 0) {
        throw new Error(
            `${errors.join('; ')}. Run npm run sync:version after changing package.json.version or compatibility/manifest.json.`
        );
    }
    console.log(
        `ALT version metadata is synchronized at ${version}; GitHub Pages verified versions: ${verifiedVersionsText}.`
    );
    process.exit(0);
}

let changed = false;

if (engineMatch[0] !== expectedDeclaration) {
    const updatedEngine = engineSource.replace(versionDeclarationPattern, expectedDeclaration);
    fs.writeFileSync(enginePath, updatedEngine, 'utf8');
    console.log(`Updated localization_engine.js ENGINE_VERSION to ${version}.`);
    changed = true;
}

let updatedPages = pagesSource;
if (pagesSoftwareVersionMatch[0] !== expectedPagesSoftwareVersion) {
    updatedPages = updatedPages.replace(pagesSoftwareVersionPattern, expectedPagesSoftwareVersion);
}
if (pagesSummaryMatch[0] !== expectedPagesSummary) {
    updatedPages = updatedPages.replace(pagesSummaryPattern, expectedPagesSummary);
}
if (updatedPages !== pagesSource) {
    fs.writeFileSync(pagesIndexPath, updatedPages, 'utf8');
    console.log(
        `Updated docs/index.html to ALT ${version} with verified Antigravity versions: ${verifiedVersionsText}.`
    );
    changed = true;
}

if (!changed) {
    console.log(
        `ALT version metadata already synchronized at ${version}; GitHub Pages verified versions: ${verifiedVersionsText}.`
    );
}
