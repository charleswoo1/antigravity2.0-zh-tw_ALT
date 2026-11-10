# Handoff — ALT 2.29.1 Release

**Status:** COMPLETE
**Issue:** [#91](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/91)
**Baseline commit:** e34d6042d88275d4f20e325b852825ab984cdb00 (main after PR #90)
**Authorization:** On 2026-11-10 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.29.1 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #90 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.29.1 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.29.1 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- Original PR run 42671575925 had an overall failure with only Windows job results. Dispatched complete CI 42744636341 on the same head 44eb086621561d82de2c4f51e75711212f02bc85. All four jobs passed before PR #90 merged at baseline.

- Main CI 42745099003 passed at baseline. Controlled Release 42745470404 passed all authorization/version/main/order gates, production audit, platform builds and installer E2E.
- ALT 2.29.1 is latest, non-draft and non-prerelease. Annotated tag points to baseline. Five fixed-name assets verified, four checksums match GitHub digests, and all permanent downloads return HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:669ca8eabae8ff2fca672f8655bc3b9ce8bca4faa3f52837b7dba9c8992bfc3d
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:dc26746e95cba0230d4ac558b4159e7a77a41e989165c863e4c67dc0108fa271
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:098e647297de35723cffd28151ca4e5244a1fc5d2d79fb688c72c6d36e9e7e55
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:13b2b30eb69137f2d15b974524de239d2812e84c4ad298b297e89a23de63e4e3
- SHA256SUMS.txt sha256:e633ef30356fb6a3e591e31d41a796615ef27ecff5ec0266249428611ca9d3ce
