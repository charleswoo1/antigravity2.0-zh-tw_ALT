# Handoff — ALT 2.26.0 Release

**Status:** COMPLETE
**Issue:** [#75](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/75)
**Baseline commit:** 626060a96cf88051ac12476e59a66e05f2337500 (main after PR #74)
**Authorization:** On 2026-10-24 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.26.0 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #74 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.26.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.26.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- PR #74 exact head d87a4acab2720024db5fb4efdf1a80fc2511aa27 passed all four CI jobs in run 40014246033 and merged at baseline above.
- Authenticated actor charleswoo1 matches repository owner. Initial checks confirmed no release/v2.26.0 branch or v2.26.0 tag; latest was v2.25.0.
- Main CI [40016367108](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40016367108) SUCCESS: core, production dependency audit, Windows installer E2E and macOS x64/arm64 builds.
- Confirmed origin/main still equals baseline and package version is 2.26.0; pushed release/v2.26.0 from that exact SHA.
- Controlled Release [40016901498](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40016901498) SUCCESS: authorization/version/main/order gates, production audit, three platform builds, Windows installer E2E and publication passed.

- ALT 2.26.0 is published/latest, non-draft and non-prerelease. Annotated v2.26.0 dereferences to baseline release SHA.
- Exact five fixed-name assets verified. Four checksum entries match GitHub API SHA-256 digests. All five permanent downloads redirect to v2.26.0 and return HTTP 200.
- Public SHA-256 values:
  - db0d8d69c14119a5754530dd5ac5d3e934d64910c3a32358e305bbf5f4ce45bf — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - 61ae3bc79c9b159c0a56b57f357f7b012e0ac3a37300e1d00bf8f460d272d67c — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
  - ff6db17710862f49a7757cfa46477bef5385812a02b7e183993620065e6fb98d — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - dc1284bb13460c9fb0d233808aad0b3298fa4405efc75d61709233209280b561 — Antigravity-ZH-Hant-TW-ALT-Windows.exe
- Historical branches/tags/releases, local installation and user-owned .codex-local/ preserved. No proprietary payload, history rewrite or policy bypass. Final evidence submitted through a separate PR; merge only after current-head CI passes under owner publication authorization.
