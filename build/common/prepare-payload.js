'use strict';

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..', '..');
const buildRoot = path.join(repoRoot, '.build');
const runtimeCache = path.join(repoRoot, 'vendor', 'runtime');
const manifestPath = path.join(repoRoot, 'build', 'runtime-manifest.json');
const packageJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf-8'));
const compatibilityManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'compatibility', 'manifest.json'), 'utf-8'));

function parseArgs(argv) {
    const result = { platform: '', arch: '', output: '', offline: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--platform') result.platform = argv[++i] || '';
        else if (arg === '--arch') result.arch = argv[++i] || '';
        else if (arg === '--output') result.output = argv[++i] || '';
        else if (arg === '--offline') result.offline = true;
        else throw new Error(`未知參數：${arg}`);
    }
    if (!['windows', 'macos'].includes(result.platform)) {
        throw new Error('--platform 必須是 windows 或 macos');
    }
    if (!['x64', 'arm64'].includes(result.arch)) {
        throw new Error('--arch 必須是 x64 或 arm64');
    }
    return result;
}

function sha256(filePath) {
    const hash = crypto.createHash('sha256');
    hash.update(fs.readFileSync(filePath));
    return hash.digest('hex');
}

function download(url, destination) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, response => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                download(new URL(response.headers.location, url).toString(), destination).then(resolve, reject);
                return;
            }
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`下載失敗：HTTP ${response.statusCode} ${url}`));
                return;
            }
            const tempPath = `${destination}.download`;
            const output = fs.createWriteStream(tempPath);
            response.pipe(output);
            output.on('finish', () => {
                output.close();
                fs.renameSync(tempPath, destination);
                resolve();
            });
            output.on('error', reject);
        });
        request.on('error', reject);
    });
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: options.cwd || repoRoot,
        encoding: 'utf-8',
        stdio: options.capture ? 'pipe' : 'inherit',
        shell: options.shell || false
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
        throw new Error(`${command} 執行失敗（exit ${result.status}）${result.stderr ? `：${result.stderr.trim()}` : ''}`);
    }
    return result;
}

function copyRequiredPayloadFiles(payloadDir) {
    const files = [
        'localization_engine.js',
        'package.json',
        'package-lock.json',
        'LICENSE',
        'THIRD_PARTY_LICENSES.md'
    ];
    for (const file of files) {
        fs.copyFileSync(path.join(repoRoot, file), path.join(payloadDir, file));
    }
    fs.cpSync(path.join(repoRoot, 'dicts'), path.join(payloadDir, 'dicts'), { recursive: true });
    fs.cpSync(path.join(repoRoot, 'compatibility'), path.join(payloadDir, 'compatibility'), { recursive: true });
    fs.mkdirSync(path.join(payloadDir, 'tools'), { recursive: true });
    fs.copyFileSync(
        path.join(repoRoot, 'tools', 'compatibility-audit.js'),
        path.join(payloadDir, 'tools', 'compatibility-audit.js')
    );
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const key = `${args.platform}-${args.arch}`;
    const artifact = manifest.artifacts[key];
    if (!artifact) throw new Error(`runtime manifest 不含 ${key}`);

    fs.mkdirSync(buildRoot, { recursive: true });
    fs.mkdirSync(runtimeCache, { recursive: true });
    const archivePath = path.join(runtimeCache, artifact.filename);

    if (!fs.existsSync(archivePath)) {
        if (args.offline) throw new Error(`離線模式找不到 runtime cache：${archivePath}`);
        console.log(`[runtime] 下載 ${artifact.url}`);
        await download(artifact.url, archivePath);
    }

    const actualChecksum = sha256(archivePath);
    if (actualChecksum !== artifact.sha256) {
        throw new Error(`runtime SHA-256 不符：預期 ${artifact.sha256}，實際 ${actualChecksum}`);
    }
    console.log(`[runtime] SHA-256 驗證通過：${artifact.filename}`);

    const extractDir = path.join(buildRoot, `runtime-${key}`);
    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.mkdirSync(extractDir, { recursive: true });
    run('tar', ['-xf', archivePath, '-C', extractDir]);

    const extractedRoots = fs.readdirSync(extractDir, { withFileTypes: true }).filter(entry => entry.isDirectory());
    if (extractedRoots.length !== 1) throw new Error('Node runtime archive 結構不符合預期');
    const runtimeSource = path.join(extractDir, extractedRoots[0].name);

    const payloadDir = path.resolve(args.output || path.join(buildRoot, `payload-${key}`));
    fs.rmSync(payloadDir, { recursive: true, force: true });
    fs.mkdirSync(path.join(payloadDir, 'runtime'), { recursive: true });
    copyRequiredPayloadFiles(payloadDir);

    const depsDir = path.join(buildRoot, 'production-dependencies');
    fs.rmSync(depsDir, { recursive: true, force: true });
    fs.mkdirSync(depsDir, { recursive: true });
    fs.copyFileSync(path.join(repoRoot, 'package.json'), path.join(depsDir, 'package.json'));
    fs.copyFileSync(path.join(repoRoot, 'package-lock.json'), path.join(depsDir, 'package-lock.json'));
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    run(npmCommand, ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
        cwd: depsDir,
        shell: process.platform === 'win32'
    });
    fs.cpSync(path.join(depsDir, 'node_modules'), path.join(payloadDir, 'node_modules'), { recursive: true });
    // npm's .bin shims/symlinks are not needed at runtime because the engine invokes
    // @electron/asar's CLI by its explicit file path. Removing .bin also avoids
    // invalid symlink destinations when the macOS app bundle is codesigned.
    fs.rmSync(path.join(payloadDir, 'node_modules', '.bin'), { recursive: true, force: true });
    run(process.execPath, [
        path.join(repoRoot, 'build', 'common', 'generate-third-party-notices.js'),
        '--node-modules', path.join(depsDir, 'node_modules'),
        '--output', path.join(payloadDir, 'THIRD_PARTY_LICENSES.md')
    ]);

    const runtimeExecutableName = args.platform === 'windows' ? 'node.exe' : 'node';
    const runtimeExecutable = path.join(payloadDir, 'runtime', runtimeExecutableName);
    fs.copyFileSync(path.join(runtimeSource, artifact.executable), runtimeExecutable);
    if (args.platform === 'macos') fs.chmodSync(runtimeExecutable, 0o755);
    fs.copyFileSync(path.join(runtimeSource, 'LICENSE'), path.join(payloadDir, 'runtime', 'NODE-LICENSE.txt'));

    fs.writeFileSync(path.join(payloadDir, 'payload-manifest.json'), JSON.stringify({
        product: 'Antigravity 2.0 Traditional Chinese ALT',
        edition: 'ALT',
        productVersion: packageJson.version,
        verifiedSupportedAntigravityVersions: Object.entries(compatibilityManifest.versions)
            .filter(([, entry]) => entry.status === 'verified')
            .map(([version]) => version),
        runtime: {
            name: manifest.runtime.name,
            version: manifest.runtime.version,
            platform: args.platform,
            arch: args.arch,
            source: artifact.url,
            sha256: artifact.sha256
        }
    }, null, 2) + '\n', 'utf-8');

    const hostPlatform = process.platform === 'win32' ? 'windows' : (process.platform === 'darwin' ? 'macos' : process.platform);
    if (hostPlatform === args.platform && process.arch === args.arch) {
        const runtimeCheck = run(runtimeExecutable, ['--version'], { capture: true });
        if (runtimeCheck.stdout.trim() !== `v${manifest.runtime.version}`) {
            throw new Error(`bundled runtime 版本不符：${runtimeCheck.stdout.trim()}`);
        }
        console.log(`[payload] bundled runtime：${runtimeCheck.stdout.trim()}`);
    } else {
        console.log(`[payload] runtime execution check skipped on ${process.platform}/${process.arch} for ${key}`);
    }

    console.log(`[payload] 已建立：${payloadDir}`);
}

main().catch(error => {
    console.error(`[錯誤] ${error.message}`);
    process.exitCode = 1;
});
