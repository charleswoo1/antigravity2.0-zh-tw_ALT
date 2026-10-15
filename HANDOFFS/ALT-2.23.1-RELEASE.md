# Handoff — ALT 2.23.1 Release

**Status:** `COMPLETE`
**Issue:** [#62](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/62)
**Baseline commit:** `2c96377256b32bda9d9d7054d6218ea914fbd552` (main after PR #63)
**Authorization:** On 2026-10-15 the owner explicitly requested publication after the version-alignment PR and CI results were provided.

## Goal

Merge version alignment and publish ALT 2.23.1 through the controlled Release bridge. Validate exact tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further code/localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass before publication. Release branch initially points exactly at latest main. Keep .codex-local/ unchanged.

## Implementation steps

1. Verify PR #63 exact head and successful CI; merge the reviewed head.
2. Synchronize main and wait for its CI success.
3. Confirm owner identity and unused version; push release/v2.23.1 from exact validated main.
4. Wait for controlled authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push final evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.23.1 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Feature/local core, packaging, base/revision Windows build/installer/staging/native metadata tests passed. PR/main CI includes Windows and macOS x64/arm64 isolated revision packaging. Release reruns policy/dependency checks and full platform builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner explicitly authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate reviewable PR; preserve historical tags/releases and branch history.

## Execution Result

- PR #63 exact head `a4b4aa74a10bd82ed055e715377476c16d624390` passed four jobs in CI [38673920709](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38673920709), then merged at `2c96377256b32bda9d9d7054d6218ea914fbd552`.
- Main CI [38674433550](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38674433550) SUCCESS, four jobs passed including all platform revision packaging.
- Authenticated actor charleswoo1 matches repository owner. Release branch/tag unused; package/runtime/Pages aligned at 2.23.1; custom version ordering accepts upgrade from prior latest v1.10.0.
- Owner-authorized release/v2.23.1 pushed from exact latest validated main SHA above.
- Controlled Release [38674747319](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38674747319) SUCCESS: authorization/version/main/order gates, three platform builds and publication all passed.
- [ALT 2.23.1](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v2.23.1) is published/latest, non-draft and non-prerelease. Annotated v2.23.1 dereferences to `2c96377256b32bda9d9d7054d6218ea914fbd552`.
- Exact five fixed-name assets verified; all four checksum entries match GitHub API SHA-256 digests. All five permanent downloads return HTTP 200.
- Public SHA-256 values:
  - `1500d4967e62cdb36e62678834bbf1f26827d080d40f248db2b13abf45582197` — Antigravity-ZH-Hant-TW-ALT-Windows.exe
  - `a23a976ecd42bc23e27ab6b5dca241e71d71c14cad1a4b275156939b1119f242` — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - `68ade81b3842a07f2132f53ef83fa2c610d9b75f4a2768818b9e8249158f58fd` — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - `55b3a3201b0ab623f74d45b0a46903ff8785b6517fd8ad4ff72fa3083b2830cc` — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
- Historical ALT 1.x tags/releases, installed Antigravity and .codex-local/ preserved. No branch/tag deletion, history rewrite or proprietary payload publication. Evidence submitted through a separate documentation PR under owner publication authorization.
