# Handoff — ALT 2.32.2 Release

**Status:** COMPLETE
**Issue:** [#105](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/105)
**Baseline commit:** 3df32e6061d6ecedfc9ec463507b0ce19c8e4986 (main after PR #104)
**Authorization:** On 2026-11-18 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.32.2 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #104 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.32.2 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.32.2 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- Authenticated actor charleswoo1 matches repository owner. Release branch/tag unused; previous latest v2.32.1.
- PR #104 exact head 933efdfb21d91ad965f2fc11aa1687d8b3fb27f9 passed all four CI jobs in run 44226521368 and merged at baseline. Main CI 44226887606 passed at baseline. Pushed release/v2.32.2 from that exact commit after all checks passed. Controlled Release 44227341687 passed at baseline.

- ALT 2.32.2 is latest, non-draft and non-prerelease. Annotated tag dereferences to baseline. Five fixed-name assets verified; all four checksums match GitHub asset digests, checksum-file digest matches, and all permanent downloads return HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:b3e9441a152ed2dd8f934c0d89ae564b3fc30e6bbe4ae35ee2cf26e8caac7b85
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:41be17805f74f0e3262afa85b3b325a4dcabaf92cabaf13c41137b5a9c4352dd
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:cb709734001586915fb69067f7f50a3a7daae09e66d95a0cf9178a6242a396d0
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:a10e930682f39bc8a9612b272a953662cf62e9eeec1280105602bf9befc36e11
- SHA256SUMS.txt sha256:e845b515750e359eaf724eaa780d3539270600dec33acbb1570d5e851071b566
