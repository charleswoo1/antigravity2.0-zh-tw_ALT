# Handoff — ALT 2.32.1 Release

**Status:** COMPLETE
**Issue:** [#99](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/99)
**Baseline commit:** 6fdbbd8d07c145930cd829806ddb3b10aed528cb (main after PR #98)
**Authorization:** On 2026-11-15 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.32.1 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #98 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.32.1 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.32.1 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- PR #98 passed all four CI jobs in 43638808335 at head e6d37d77a28240288e02541a5d286a9fb2e758fa before merge at baseline.
- Actor charleswoo1 matches repository owner. Release branch/tag unused, previous latest v2.30.0.

- Main CI 43639161113 and Controlled Release 43639443254 succeeded at baseline. All gates, production audit, builds and installer E2E passed.
- ALT 2.32.1 is latest, non-draft and non-prerelease. Annotated tag points to baseline. Five fixed-name assets verified, four checksums match GitHub digests and all permanent downloads return HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:090ea215792d7c11bd330a1eea4cf19a22ceee10ff9bf72f5fe0d65e1c813555
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:63fa66321864b206ae0932c4c99ea4af34ce23609cb9ee612dc0d3b7601874c0
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:f54f08865a239c387e1dcc6463309b8a1c1d24458184f766b963e9826447713b
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:55b351a8290de49cb5f709e236d78c5a1e29f070821835851f7777ed20bece5c
- SHA256SUMS.txt sha256:667b116fd4431f26e7bdcc9d64b4a7a1f2fa76444e44d546f5671270f6bd4a4b
