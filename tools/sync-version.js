'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const packagePath = path.join(repoRoot, 'package.json');
const enginePath = path.join(repoRoot, 'localization_engine.js');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = String(packageJson.version || '');
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

if (!semverPattern.test(version)) {
    throw new Error(`Invalid ALT version in package.json: ${version}`);
}

const engineSource = fs.readFileSync(enginePath, 'utf8');
const versionDeclarationPattern = /const ENGINE_VERSION = '[^']+';/;
const match = engineSource.match(versionDeclarationPattern);
if (!match) {
    throw new Error('Could not find the ENGINE_VERSION declaration in localization_engine.js');
}

const expectedDeclaration = `const ENGINE_VERSION = '${version}';`;
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
    if (match[0] !== expectedDeclaration) {
        throw new Error(
            `ENGINE_VERSION is out of sync (${match[0]}); run npm run sync:version after changing package.json.version.`
        );
    }
    console.log(`ALT version metadata is synchronized at ${version}.`);
    process.exit(0);
}

if (match[0] === expectedDeclaration) {
    console.log(`ALT version metadata already synchronized at ${version}.`);
    process.exit(0);
}

const updatedSource = engineSource.replace(versionDeclarationPattern, expectedDeclaration);
fs.writeFileSync(enginePath, updatedSource, 'utf8');
console.log(`Updated localization_engine.js ENGINE_VERSION to ${version}.`);
