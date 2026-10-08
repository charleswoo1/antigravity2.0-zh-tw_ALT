# Handoff — ALT 1.7.0 Release

**Status:** `COMPLETE`
**Issue:** [#51](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/51)
**Baseline commit:** `9fa52a7ac6edd22f0da0453d589ae36acec187f7` (main after PR #52)
**Authorization:** On 2026-10-08 the owner confirmed successful local use and requested completion of publication.

## Goal

Merge verified Antigravity 2.21.0/2.21.1 support and publish ALT 1.7.0 through the controlled Release bridge, validating tag target, fixed asset names, SHA-256 checksums and permanent download URLs.

## Non-goals

No additional code/localization changes, proprietary payload publication, tag overwrite, history rewrite or branch deletion.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. Wait for PR/main CI success before triggering release.yml. The release branch must initially point exactly at current main. Preserve user-owned .codex-local/.

## Implementation steps

1. Check PR #52 head and all four CI jobs, merge the exact reviewed head.
2. Synchronize main and confirm its CI success.
3. Verify authenticated repository owner and absence of release branch/tag/Release, then push release/v1.7.0 from exact main.
4. Wait for controlled authorization gate, platform builds/tests and publication.
5. Verify published/latest state, annotated tag, exact five assets, checksum digests and permanent URLs.
6. Commit/push result documentation through a PR; merge under this owner authorization after CI success.

## Acceptance criteria

PR/main CI and controlled Release succeed. ALT 1.7.0 is latest, non-draft, non-prerelease. Annotated tag dereferences to the release SHA. Four binary/archive hashes match SHA256SUMS.txt. Five permanent download URLs return HTTP 200.

## Tests

Feature core/protected-zone/runtime/packaging, Windows build/installer E2E and real apply/restore/repeat verification passed. Release reruns core/packaging/dependency audit, Windows E2E, macOS signing/bundle/runtime/ZIP verification. Post-publication uses GitHub API digests and HTTP requests.

## Git / PR rules

Owner explicitly authorizes merge and publication. Use release.yml only. Release branch is not merged into main. Final documentation uses a separate reviewable PR, with no branch deletion or tag/history modification.

## Execution Result

- PR #52 head 953dab77ab93fd763fa44fad921bc239562f2230: all four CI jobs PASS. Merged at 9fa52a7ac6edd22f0da0453d589ae36acec187f7.
- Authenticated GitHub actor charleswoo1 matches repository owner. Before publication, release/v1.7.0, v1.7.0 tag and matching Release absent; authoritative package version 1.7.0.
- Main CI [37716777258](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/37716777258): SUCCESS, all four jobs passed. Pages build/deployment 37716776767: SUCCESS.
- Owner created release/v1.7.0 from exact main SHA 9fa52a7ac6edd22f0da0453d589ae36acec187f7.
- Controlled Release [37716990142](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/37716990142): SUCCESS; authorization gate, Windows x64 installer E2E/build, macOS x64/arm64 signing/build and publish job passed.
- [ALT 1.7.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v1.7.0) is latest, published, non-draft, non-prerelease. Annotated v1.7.0 tag dereferences to exact release/main SHA.
- Asset set exactly matches all five fixed names. All four SHA256SUMS.txt entries match GitHub asset SHA-256 digests. All five releases/latest/download permanent URLs returned HTTP 200.
- Verified public SHA-256 values:
  - Windows.exe: ce4851d93dae7930d107511293cfda91906897565ee904f4567ab96ac573c8bb
  - Windows-Restore.exe: 01f6e86b4b55929210793a88592dbf76a01b15e516717d4f4e1f74b2f88e9439
  - macOS-arm64.zip: bf22ad168aba78fa69cf8b8f4aa95c98a49d62fd12b4526f2dd6ac3580f6f3d5
  - macOS-x64.zip: b87f36d0803db60176be5708ae1f531d0c5d8ca7aee11cd91713958094d11d7f
- Authenticated API metadata and public HTTP verification passed after retrying a transient GitHub API connection failure; no production retry or fallback mutation used.
- User confirmed successful local 2.21.1 use before authorizing publication. No branch/tag deletion, history rewrite or proprietary payload publication. Final documentation submitted via codex/alt-1.7.0-release-evidence PR.
