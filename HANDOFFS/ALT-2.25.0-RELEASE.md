# Handoff — ALT 2.25.0 Release

**Status:** COMPLETE
**Issue:** [#71](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/71)
**Baseline commit:** 2c375e4bd1c79b5f4b76bd33520164799cffc841 (main after PR #70)
**Authorization:** On 2026-10-22 the owner confirmed local operation and explicitly requested publication.

## Goal

Merge verified compatibility support and publish ALT 2.25.0 through the controlled Release bridge. Validate exact tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #70 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.25.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push final evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.25.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Core, packaging, Windows build/installer and real apply/restore tests passed in compatibility work. PR/main CI covers Windows and macOS x64/arm64 revision packaging. Release reruns policy/dependency checks and full builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical tags/releases and branch history.

## Execution Result

- PR #70 exact head d25423cb652166ffd6ee96ba92e36b2b3716acb3 passed four jobs in CI 39708613081 and merged at baseline 2c375e4bd1c79b5f4b76bd33520164799cffc841.
- Main CI [39710859378](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/39710859378): attempts 1/2 timed out after 300 seconds at the npm bulk advisory endpoint; attempt 3 returned HTTP 503 Service Unavailable. All platform jobs and core/packaging tests passed. No policy bypass or code change was made in response.
- On the owner's subsequent recheck, attempt 4 SUCCESS, including Production dependency audit. All four main CI jobs passed at the unchanged baseline SHA. The external audit-service blocker is resolved.
- Actor charleswoo1 matches repository owner. Confirmed package version 2.25.0 and unused release branch/tag; release/v2.25.0 pushed from exact current validated main SHA above.
- Controlled Release [39717799544](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/39717799544) SUCCESS: authorization/version/main/order gates, production audit, three platform builds, installer E2E and publication passed.
- [ALT 2.25.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v2.25.0) is published/latest, non-draft and non-prerelease. Annotated v2.25.0 dereferences to baseline release SHA.
- Exact five fixed-name assets verified. All four checksum entries match GitHub API SHA-256 digests. All five permanent downloads redirect to v2.25.0 and return HTTP 200.
- Public SHA-256 values:
  - d1ae9d7d5445ac1d0f2916ceacf59fbf6e343236a17813d39f0896df027061e0 — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - 598e9060143dcc263a5d2d61adcabe73edea33fb665485102feefd0c6a88b60d — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
  - 04f9669ccba2197b3fbb396690343260d0d202aae0ab328059b409d2b5cd8b36 — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - 3444fa2f5a366ba45e7e2b1dd4275963deb2b157e198c55867fb86811fb4953c — Antigravity-ZH-Hant-TW-ALT-Windows.exe
- Historical branches/tags/releases, local installation and user-owned .codex-local/ preserved. No proprietary payload, history rewrite or audit bypass. Final evidence submitted by updating PR #72; merge only after its current-head CI passes under owner publication authorization.
