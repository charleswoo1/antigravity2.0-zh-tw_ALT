# Handoff — ALT 2.29.0 Release

**Status:** COMPLETE
**Issue:** [#87](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/87)
**Baseline commit:** 2a2a0ba184faa5314b3acb1a811b9489897a97d7 (main after PR #86)
**Authorization:** On 2026-11-04 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.29.0 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #86 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.29.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.29.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- Owner authorized publication. Fixed the production dependency audit findings with glob 14.0.3 and minimatch 11.0.4 overrides, refreshed notices, and verified zero vulnerabilities. Local Windows rebuild/E2E and all four PR checks passed at 8b503b77e9be6977c8ea23a26371ac41cda582c7 before merge.

- Main CI 41768870609 passed at baseline. Controlled Release 41769219703 passed all gates, production audit, platform builds and installer E2E.
- ALT 2.29.0 is latest, non-draft and non-prerelease. Annotated tag points to baseline. All five fixed-name assets match the expected set. All four checksums match GitHub digests and all five permanent links return HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:cf3636a07f40d9ad5ea88b266e8be67e382c19f9c4d9bec36663278b6b3ffc62
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:8395976a61d65d7285bb2c782eb8fa7b49c2b3e9c842b2eeb756a346b4147284
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:ed42f6226d1ea19a3e7b9e664f4b4e76ff2dbb4256198c1641d3a4bef6f28004
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:70b898278a5ca45e32299ec66c2d2d56763076fc44c27646f5c4a2ebb0e203b4
- SHA256SUMS.txt sha256:d2400c1eb7191a00146f007e130c923bf3889ddbf195ed51fe766952afc8e135
