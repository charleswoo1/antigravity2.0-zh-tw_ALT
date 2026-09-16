'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
    const args = { nodeModules: '', output: '' };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--node-modules') args.nodeModules = argv[++i] || '';
        else if (argv[i] === '--output') args.output = argv[++i] || '';
        else throw new Error(`未知參數：${argv[i]}`);
    }
    if (!args.nodeModules || !args.output) throw new Error('需要 --node-modules 與 --output');
    return args;
}

function packageDirs(nodeModulesDir) {
    const dirs = [];
    for (const entry of fs.readdirSync(nodeModulesDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name === '.bin') continue;
        const fullPath = path.join(nodeModulesDir, entry.name);
        if (entry.name.startsWith('@')) {
            for (const scoped of fs.readdirSync(fullPath, { withFileTypes: true })) {
                if (scoped.isDirectory()) dirs.push(path.join(fullPath, scoped.name));
            }
        } else {
            dirs.push(fullPath);
        }
    }
    return dirs;
}

function findLicense(packageDir) {
    const candidate = fs.readdirSync(packageDir).find(name => /^(license|licence|copying)(\..*)?$/i.test(name));
    return candidate ? fs.readFileSync(path.join(packageDir, candidate), 'utf-8').trim() : 'No standalone license file was included in the npm package.';
}

function main() {
    const args = parseArgs(process.argv.slice(2));
    const nodeModulesDir = path.resolve(args.nodeModules);
    const outputPath = path.resolve(args.output);
    const rootPackage = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), 'utf-8'));
    const direct = new Set(Object.keys(rootPackage.dependencies || {}));

    const packages = packageDirs(nodeModulesDir).map(packageDir => {
        const metadata = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'));
        return {
            name: metadata.name,
            version: metadata.version,
            license: typeof metadata.license === 'string' ? metadata.license : 'SEE PACKAGE',
            relationship: direct.has(metadata.name) ? 'Direct' : 'Transitive',
            notice: findLicense(packageDir)
        };
    }).sort((a, b) => a.name.localeCompare(b.name));

    const lines = [
        '# Third-Party Licenses',
        '',
        'This file is generated from the production dependency tree for Antigravity 2.0 Traditional Chinese ALT 1.0.0.',
        'Every release payload also contains `runtime/NODE-LICENSE.txt`, copied verbatim from the pinned official Node.js runtime archive.',
        '',
        '## Dependency Summary',
        '',
        '| Package | Version | Relationship | License |',
        '| --- | --- | --- | --- |',
        ...packages.map(pkg => `| \`${pkg.name}\` | ${pkg.version} | ${pkg.relationship} | ${pkg.license} |`),
        '',
        '## License Notices',
        ''
    ];

    for (const pkg of packages) {
        lines.push(`### ${pkg.name}`, '', `Version: ${pkg.version}`, '', `License: ${pkg.license}`, '', '```text', pkg.notice, '```', '');
    }

    fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
    console.log(`Generated ${outputPath} for ${packages.length} packages.`);
}

try {
    main();
} catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
}
