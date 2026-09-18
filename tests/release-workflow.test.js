'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const ciPath = path.join(repoRoot, '.github', 'workflows', 'ci.yml');
const releasePath = path.join(repoRoot, '.github', 'workflows', 'release.yml');

assert.ok(fs.existsSync(releasePath), '必須提供專用 controlled Release workflow');

const ciWorkflow = fs.readFileSync(ciPath, 'utf-8');
const releaseWorkflow = fs.readFileSync(releasePath, 'utf-8');

assert.match(ciWorkflow, /permissions:\s*\n\s*contents:\s*read/, '一般 CI 必須維持 contents: read');
assert.ok(!/contents:\s*write/.test(ciWorkflow), '一般 CI 不得取得 contents: write');

assert.match(releaseWorkflow, /on:\s*\n\s*create:\s*\n\s*push:/, 'Release workflow 必須支援 Git ref create event，讓 API 建立 release branch 可觸發發布');
assert.match(releaseWorkflow, /branches:\s*\n\s*- ['"]release\/v\*['"]/, 'Release workflow 的 push 觸發只能接受 release/v* branch');
assert.ok(
    releaseWorkflow.includes("github.event_name == 'create'") &&
    releaseWorkflow.includes("github.ref_type == 'branch'") &&
    releaseWorkflow.includes("startsWith(github.ref_name, 'release/v')"),
    'create event 必須只讓 release/v* branch 進入 validate job，避免一般 branch 建立誤跑發布'
);
assert.match(releaseWorkflow, /^permissions:\s*\n\s*contents:\s*read/m, 'Release workflow 預設仍必須是 contents: read');
assert.match(
    releaseWorkflow,
    /publish:[\s\S]*?permissions:\s*\n\s*actions:\s*read\s*\n\s*contents:\s*write/,
    '只有 publish job 可取得 actions: read + contents: write'
);
assert.ok(!/pull_request_target\s*:/.test(releaseWorkflow), 'Release workflow 不得使用 pull_request_target');
assert.ok(releaseWorkflow.includes('$GITHUB_ACTOR') && releaseWorkflow.includes('$GITHUB_REPOSITORY_OWNER'),
    'Release gate 必須限制 repository owner 觸發');
assert.ok(releaseWorkflow.includes('^release/v([0-9]+\\.[0-9]+\\.[0-9]+)$'),
    'Release branch 必須精確符合 release/vX.Y.Z');
assert.ok(releaseWorkflow.includes("require('./package.json').version"),
    'Release gate 必須由 package.json 驗證 ALT version');
assert.ok(releaseWorkflow.includes('git rev-parse origin/main') && releaseWorkflow.includes('git rev-parse HEAD'),
    'Release branch 必須確認精確指向當下 main commit');
assert.ok(releaseWorkflow.includes('git ls-remote --exit-code --tags'),
    '發布前必須拒絕重複 tag');
assert.ok(releaseWorkflow.includes('gh release view "$tag"'),
    '發布前必須拒絕重複 Release');

for (const required of [
    'npm run check',
    'npm run check:packaging',
    'npm audit --omit=dev',
    'npm run check:windows-installer',
    './build/macos/build.sh'
]) {
    assert.ok(releaseWorkflow.includes(required), `Release workflow 缺少驗證：${required}`);
}

for (const asset of [
    'Antigravity-ZH-Hant-TW-ALT-Windows.exe',
    'Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe',
    'Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip',
    'Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip',
    'SHA256SUMS.txt'
]) {
    assert.ok(releaseWorkflow.includes(asset), `Release workflow 缺少固定公開 asset：${asset}`);
}

assert.ok(releaseWorkflow.includes('sha256sum'), 'Release workflow 必須重新產生完整 SHA256SUMS.txt');
assert.ok(releaseWorkflow.includes('git tag -a "$TAG" "$GITHUB_SHA"'), 'tag 必須明確綁定受驗證的 release commit');
assert.ok(releaseWorkflow.includes('git push origin "refs/tags/$TAG"'), 'Release workflow 必須推送明確 tag');
assert.ok(releaseWorkflow.includes('gh release create "$TAG"'), 'Release workflow 必須使用明確 tag 建立 Release');
assert.ok(releaseWorkflow.includes('--verify-tag'), '建立 Release 時必須驗證 tag 已存在');
assert.ok(releaseWorkflow.includes('--draft'), 'production Release 必須先以 draft 建立並驗證 assets');
assert.ok(releaseWorkflow.includes('gh release edit "$TAG" --draft=false --latest'),
    '只有完整 asset 驗證通過後才能發布並標為 latest');
assert.ok(releaseWorkflow.includes('leaving the Release as draft'),
    'asset 驗證失敗時必須保留 draft，不得誤發布不完整 Release');

console.log('Controlled Release workflow policy tests passed.');
