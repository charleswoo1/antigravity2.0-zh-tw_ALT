# Handoff — ALT 2.24.0 Release

**Status:** COMPLETE
**Issue:** [#67](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/67)
**Baseline commit:** b22b7a42becd1c06aa6740eacfbd66da4e859f40 (main after PR #66)
**Authorization:** On 2026-10-19 the owner confirmed local operation and explicitly requested publication.

## Goal

Merge verified compatibility support and publish ALT 2.24.0 through the controlled Release bridge. Validate exact tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #66 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.24.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push final evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.24.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Core, packaging, Windows build/installer and real apply/restore tests passed in compatibility work. PR/main CI covers Windows and macOS x64/arm64 revision packaging. Release reruns policy/dependency checks and full builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical tags/releases and branch history.

## Execution Result

- PR #66 head 6ac144357239440a8c591bc3fda2400a864c8988 passed four CI jobs in run 39188070631; merged at baseline SHA above.
- Actor charleswoo1 matches repository owner. Release branch and tag unused; prior latest v2.23.1.
- Main CI [39189327846](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/39189327846) SUCCESS, all four jobs passed.
- Pushed release/v2.24.0 from exact latest validated main baseline. Controlled Release [39189630977](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/39189630977) SUCCESS: authorization/version/main/order gates, all platform builds, installer E2E and publication passed.

- [ALT 2.24.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v2.24.0) is published/latest, non-draft and non-prerelease. Annotated v2.24.0 dereferences to baseline release SHA.
- Exact five fixed-name assets verified; four checksum entries match GitHub API SHA-256 digests. All five permanent downloads redirect to v2.24.0 and return HTTP 200.
- Public SHA-256 values:
  - 1f4c33843bd165f13ed7916b4950391d1331e21f9bd439bac8b52e1954e5e9dc — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - 0f2593a2c12aafc70d2eceb79b7469f09b5e60c1ffd23c7bb6bb84d4b5419e45 — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
  - 4c83df2db7fa913317316e429129691ea3ce249fb971fffd4089f60db7af902e — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - 73bd3cf3846aac24a9f95b800852f628ff375ab8c3ceb35d43f9054ca8cb41b1 — Antigravity-ZH-Hant-TW-ALT-Windows.exe
- Historical branches/tags/releases, local installation and user-owned .codex-local/ preserved. No proprietary payload publication or history rewrite. Final evidence submitted through a separate documentation PR under owner publication authorization.
