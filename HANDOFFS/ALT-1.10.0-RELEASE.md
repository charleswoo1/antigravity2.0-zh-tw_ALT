# Handoff — ALT 1.10.0 Release

**Status:** `COMPLETE`
**Issue:** [#59](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/59)
**Baseline commit:** `4399c437414e76a8df10c7d091bf407b1d5cdcc3` (main after PR #60)
**Authorization:** On 2026-10-15 the owner confirmed CI/build and explicitly requested publication.

## Goal

Merge verified Antigravity 2.23.1 support and publish ALT 1.10.0 through the controlled Release bridge, validating tag target, fixed asset names, SHA-256 checksums and permanent downloads.

## Non-goals

No additional code/localization changes, proprietary payload publication, tag overwrite, history rewrite or branch deletion.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. Require PR/main CI success before release.yml. Release branch initially points exactly at current main. Preserve user-owned .codex-local/.

## Implementation steps

1. Verify PR #60 exact head and four CI jobs; merge the reviewed head.
2. Synchronize main and confirm main CI success.
3. Verify owner identity and absence of release branch/tag/Release; push release/v1.10.0 from exact main.
4. Wait for release gate, platform builds/tests and publication.
5. Verify published/latest state, annotated tag, exact five assets, checksums and permanent URLs.
6. Commit/push final evidence through a separate PR and merge after CI under the owner's publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 1.10.0 is latest, non-draft and non-prerelease. Annotated tag points to release SHA. Four binary/archive checksums match GitHub API digests. Five permanent downloads return HTTP 200.

## Tests

Feature core/protected-zone/runtime/packaging, Windows build/installer E2E and real apply/restore/repeat checks passed. Release reruns core/packaging/dependency audit, Windows E2E, macOS signing/bundle/runtime/ZIP checks. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge and publication. Use release.yml only. Do not merge release branch into main. Submit final documentation through a reviewable PR; no branch/tag deletion or history modification.

## Execution Result

- PR #60 exact head `304e59fb04254423ff5b8fdff39b1228ad1d6525` passed all four CI jobs in run [38670713457](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38670713457); merged at `4399c437414e76a8df10c7d091bf407b1d5cdcc3`.
- Main CI [38671739800](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38671739800) SUCCESS: four jobs passed.
- Authenticated actor charleswoo1 matches repository owner. Release branch/tag absent before trigger; prior latest release v1.9.0; package version 1.10.0.
- Owner-authorized release/v1.10.0 pushed from exact current main `4399c437414e76a8df10c7d091bf407b1d5cdcc3`.
- Controlled Release [38671936319](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/38671936319) SUCCESS: authorization gate, Windows build/E2E, macOS x64/arm64 and publication all passed.
- [ALT 1.10.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v1.10.0) is published/latest, non-draft and non-prerelease. Annotated v1.10.0 dereferences to exact release SHA `4399c437414e76a8df10c7d091bf407b1d5cdcc3`.
- Exact five fixed-name assets verified. All four checksum entries match GitHub API SHA-256 digests; all five permanent downloads return HTTP 200.
- Public SHA-256 values:
  - `78f581e931e69b46b7396d10d63da66dc42c5987bd1d8ac00be451839d5cfb27` — Antigravity-ZH-Hant-TW-ALT-Windows.exe
  - `d31132951a7fa1769c27eefab8713bc744218912d08e114038f0131591dd5907` — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - `b32d615906fe2bba47224a72d35e10b22b567ebb4935d3de94b035a363a71d66` — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - `53a29d4d06eb7b90b5680339f3e3b622c0af2093f96994903cae58e88d4d5e9f` — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
- No proprietary payload publication, branch/tag deletion or history rewrite. User-owned .codex-local/ preserved. Final evidence submitted through a separate PR under owner merge/publication authorization.
