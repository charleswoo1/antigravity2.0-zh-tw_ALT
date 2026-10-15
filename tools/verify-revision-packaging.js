'use strict';

// Build a revision in an isolated fixture; never change the checkout's version.
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseAltVersion } = require('./version-policy');
const repo = path.resolve(__dirname, '..');
const platform = process.argv[2];
const arch = process.argv[3];
assert(['windows', 'macos'].includes(platform));
assert(['x64', 'arm64'].includes(arch));
assert.equal(platform, process.platform === 'win32' ? 'windows' : 'macos');
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'antigravity-revision-build-'));

function run(command, args, env = process.env) {
    if (command.toLowerCase() === 'powershell.exe') {
        // A parent PowerShell 7 module path can shadow Windows PowerShell 5.1 modules.
        env = { ...env, PSModulePath: [
            path.join(env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'Modules'),
            path.join(env.ProgramFiles, 'WindowsPowerShell', 'Modules')
        ].join(path.delimiter) };
    }
    const result = spawnSync(command, args, { cwd: fixture, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, windowsHide: true });
    if (result.error) throw result.error;
    assert.equal(result.status, 0, `${command} failed:\n${result.stdout}\n${result.stderr}`);
    return result.stdout.trim();
}

try {
    for (const name of ['build', 'tools', 'tests', 'compatibility', 'dicts', 'node_modules']) {
        fs.cpSync(path.join(repo, name), path.join(fixture, name), { recursive: true });
    }
    fs.mkdirSync(path.join(fixture, 'docs'));
    fs.copyFileSync(path.join(repo, 'docs/index.html'), path.join(fixture, 'docs/index.html'));
    for (const name of ['package.json', 'package-lock.json', 'localization_engine.js', 'LICENSE', 'THIRD_PARTY_LICENSES.md']) {
        fs.copyFileSync(path.join(repo, name), path.join(fixture, name));
    }
    const packagePath = path.join(fixture, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const original = parseAltVersion(packageJson.version);
    packageJson.version = `${original.upstreamVersion}-alt.${original.revision + 1}`;
    const metadata = parseAltVersion(packageJson.version);
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    const lockPath = path.join(fixture, 'package-lock.json');
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    lock.version = lock.packages[''].version = packageJson.version;
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2));
    run(process.execPath, ['tools/sync-version.js']);
    run(process.execPath, ['tools/sync-version.js', '--check']);
    const runtime = require('../build/runtime-manifest.json').artifacts[`${platform}-${arch}`];
    const runtimeName = path.basename(new URL(runtime.url).pathname);
    const cached = path.join(repo, 'vendor/runtime', runtimeName);
    if (fs.existsSync(cached)) {
        fs.mkdirSync(path.join(fixture, 'vendor/runtime'), { recursive: true });
        fs.copyFileSync(cached, path.join(fixture, 'vendor/runtime', runtimeName));
    }
    if (platform === 'windows') {
        run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'build/windows/build.ps1', '-Arch', arch]);
        run(process.execPath, ['tests/windows-installer.test.js']);
        run('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'build/release/prepare-windows-release.ps1', '-OutputDir', '.build/revision-staging']);
        for (const suffix of ['Windows.exe', 'Windows-Restore.exe']) {
            const artifact = path.join(fixture, 'dist', `Antigravity-ZH-Hant-TW-ALT-${metadata.version}-${suffix}`);
            const info = JSON.parse(run('powershell.exe', ['-NoProfile', '-Command', "$v = (Get-Item -LiteralPath $env:ALT_REVISION_ARTIFACT).VersionInfo; @{numeric=('{0}.{1}.{2}.{3}' -f $v.FileMajorPart,$v.FileMinorPart,$v.FileBuildPart,$v.FilePrivatePart); text=$v.FileVersion; product=$v.ProductVersion} | ConvertTo-Json -Compress"], { ...process.env, ALT_REVISION_ARTIFACT: artifact }));
            assert.equal(info.numeric, metadata.windowsVersion);
            assert.equal(info.text.trim(), metadata.version);
            assert.equal(info.product.trim(), metadata.version);
        }
    } else {
        run('bash', ['build/macos/build.sh', arch]);
        const appName = `Antigravity-ZH-Hant-TW-ALT-${metadata.version}-macOS-${arch}.app`;
        const extractDir = path.join(fixture, '.build/revision-extract');
        run('ditto', ['-x', '-k', path.join(fixture, 'dist', `${appName}.zip`), extractDir]);
        const app = path.join(extractDir, appName);
        run('codesign', ['--verify', '--deep', '--strict', app]);
        for (const [field, expected] of Object.entries({ CFBundleShortVersionString: metadata.upstreamVersion, CFBundleVersion: metadata.macosBuildVersion, ALTReleaseVersion: metadata.version })) {
            assert.equal(run('/usr/libexec/PlistBuddy', ['-c', `Print :${field}`, path.join(app, 'Contents/Info.plist')]), expected);
        }
        assert(run(path.join(app, 'Contents/Resources/payload/runtime/node'), [path.join(app, 'Contents/Resources/payload/localization_engine.js'), '--version']).includes(`Engine version: ${metadata.version}`));
    }
    console.log(`Revision ${metadata.version} ${platform}/${arch} build, native metadata and package verification PASS.`);
} finally {
    const resolved = path.resolve(fixture);
    assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
    assert(path.basename(resolved).startsWith('antigravity-revision-build-'));
    fs.rmSync(resolved, { recursive: true, force: true });
}
