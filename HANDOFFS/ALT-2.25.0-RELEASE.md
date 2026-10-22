# Handoff — ALT 2.25.0 Release

**Status:** BLOCKED
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

- PR #70 exact head d25423cb652166ffd6ee96ba92e36b2b3716acb3 passed four jobs in CI 39708613081; merged at baseline above.
- Actor charleswoo1 matches repository owner. Version 2.25.0 branch/tag unused; prior latest v2.24.0.
- Main CI [39710859378](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/39710859378) failed only at Production dependency audit; all platform build jobs passed.
- Main CI attempt 1: Windows/macOS builds passed; core tests and packaging passed, but npm audit endpoint timed out after 300 seconds. Re-running failed job at the unchanged main SHA; no code/policy bypass or publication on failed CI.
- Main CI attempt 2 repeated the same npm bulk advisory endpoint timeout after 300 seconds (2026-10-22 02:32:14–02:37:14 UTC). Core/packaging tests passed again. This is an audit-service connectivity failure, not a reported vulnerability finding.
- Publication BLOCKED: main CI success is mandatory under RELEASING.md. No release/v2.25.0 branch, tag or Release created; latest remains v2.24.0. No audit bypass, code changes, historical deletion or installed-app mutation.
- Resume by rerunning failed main CI after npm advisory service connectivity recovers; require SUCCESS at the exact current main SHA, recheck unused branch/tag/Release and current version, then continue the controlled Release bridge and post-publication validation. Owner publication authorization persists.
- Evidence submitted through a documentation PR; do not merge it on failed checks.
