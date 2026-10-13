# Handoff — ALT 1.9.0 Release

**Status:** `COMPLETE`
**Issue:** [#56](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/56)
**Baseline commit:** `970fe199d2be9eec0078d68fe71b8d1d33ecdd8a` (main after PR #57)
**Authorization:** On 2026-10-13 the owner explicitly requested merge and publication.

## Goal

Merge verified Antigravity 2.23.0 support and publish ALT 1.9.0 through the controlled Release bridge, validating tag target, fixed asset names, SHA-256 checksums and permanent download URLs.

## Non-goals

No additional code/localization changes, proprietary payload publication, tag overwrite, history rewrite or branch deletion.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. Wait for PR/main CI success before triggering release.yml. The release branch must initially point exactly at current main. Preserve user-owned .codex-local/.

## Implementation steps

1. Check PR #57 head and all four CI jobs, merge the exact reviewed head.
2. Synchronize main and confirm its CI success.
3. Verify authenticated repository owner and absence of release branch/tag/Release, then push release/v1.9.0 from exact main.
4. Wait for controlled authorization gate, platform builds/tests and publication.
5. Verify published/latest state, annotated tag, exact five assets, checksum digests and permanent URLs.
6. Commit/push result documentation through a PR; merge under this owner authorization after CI success.

## Acceptance criteria

PR/main CI and controlled Release succeed. ALT 1.9.0 is latest, non-draft, non-prerelease. Annotated tag dereferences to the release SHA. Four binary/archive hashes match SHA256SUMS.txt. Five permanent download URLs return HTTP 200.

## Tests

Feature core/protected-zone/runtime/packaging, Windows build/installer E2E and real apply/restore/repeat verification passed. Release reruns core/packaging/dependency audit, Windows E2E, macOS signing/bundle/runtime/ZIP verification. Post-publication uses GitHub API digests and HTTP requests.

## Git / PR rules

Owner explicitly authorizes merge and publication. Use release.yml only. Release branch is not merged into main. Final documentation uses a separate reviewable PR, with no branch deletion or tag/history modification.

## Execution Result

- PR #57 exact head 02a3beb0bbd4e7a713a5fae257e8f4c9b337d86e passed all four CI jobs and merged at 970fe199d2be9eec0078d68fe71b8d1d33ecdd8a.
- Authenticated actor charleswoo1 matches repository owner. Release branch/tag absent before publication; package version 1.9.0.
- Main CI [38394658637](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38394658637): SUCCESS, all four jobs passed.
- Owner-authorized release/v1.9.0 pushed from exact current main 970fe199d2be9eec0078d68fe71b8d1d33ecdd8a.
- Controlled Release [38394956070](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38394956070): SUCCESS; gate, Windows build/E2E, macOS x64/arm64 and publication all passed.
- [ALT 1.9.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v1.9.0) is published/latest, non-draft, non-prerelease. Annotated v1.9.0 dereferences to exact release/main SHA.
- Exact five fixed-name assets verified; all four checksum entries match GitHub API SHA-256 digests; all five permanent downloads return HTTP 200.
- Verified public SHA-256 values:
  - 5e452214390a27840472d0dcb8ca47b9a91eb4c50fe4ce87c4d93136a54fc416  Antigravity-ZH-Hant-TW-ALT-Windows.exe
  - b0907b0417cd879ee51ed12ed1c4f83c0fbefa45c036cfacf81057174650fe8a  Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - 4ddebbd3ff87b6cc683db8f062576c0abcacb43475422e9cf51dc557938bde1a  Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - b8466f2734d16ab99a8a714d8d757062bc6e8a7546b81256742f40f1c1da885f  Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
- No proprietary payload publication, branch/tag deletion or history rewrite. User-owned .codex-local/ preserved. Final evidence submitted through a separate PR under owner merge/publication authorization.
