# Handoff — ALT 2.30.0 Release

**Status:** COMPLETE
**Issue:** [#95](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/95)
**Baseline commit:** 95d58018161a6f5ac7fd8154410fcde5e5963fb6 (main after PR #94)
**Authorization:** On 2026-11-11 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.30.0 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #94 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.30.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.30.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- PR #94 passed all four CI jobs in 42750697839 at head 18b89354f4f4412be0c37835ee2f1c34602aa334 and merged at baseline.
- Authenticated actor charleswoo1 matches repository owner. Version is 2.30.0 and release branch/tag were unused. Latest was v2.29.1.

- Main CI 42943440889 and Controlled Release 42943915735 succeeded at baseline. All authorization/version/main/order gates, production audit, builds and installer E2E passed.
- ALT 2.30.0 is latest, non-draft and non-prerelease. Annotated tag points to baseline. Five fixed-name assets verified, four checksums match GitHub digests, all permanent downloads return HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:8d06524fc6b7d32d9189ce3ed62b5062f486965b430a3b4295fd31658a6b5ac5
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:362f8b77a3616505f0775c55c9472fad6138094b4c66dd83a52643f2bec0146c
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:a0f880e93f972fdbe2c791fb6c8e371e791614a4de1a02df35a027b4ca6a9b32
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:90ffa472d46a60d6749484d16b3f5eed5dc2b01e83ffbc8055f44e0f6c52f1a1
- SHA256SUMS.txt sha256:dc952c6f827c46718b4ee0f3ac1721fcd55e8bd6baa7cc4fb8a3a52c9775363c
