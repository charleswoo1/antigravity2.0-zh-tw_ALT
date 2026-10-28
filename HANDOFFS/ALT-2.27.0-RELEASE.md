# Handoff — ALT 2.27.0 Release

**Status:** COMPLETE
**Issue:** [#79](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/79)
**Baseline commit:** 5ae143ea68603f3a096f2c4a417c891c291c64ee (main after PR #78)
**Authorization:** On 2026-10-28 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.27.0 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #78 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.27.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.27.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- PR #78 exact head 3b596d59ae3ec7616578ba50063b2ae058700990 passed all four CI jobs in run 40618056495 and merged at baseline above.
- Authenticated actor charleswoo1 matches repository owner. Initial checks confirmed no release/v2.27.0 branch or v2.27.0 tag; latest was v2.26.0.
- Main CI [40641298080](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40641298080) SUCCESS: core, production dependency audit, Windows installer E2E and macOS x64/arm64 builds.
- Confirmed origin/main still equals baseline and package version is 2.27.0; pushed release/v2.27.0 from that exact SHA.
- Controlled Release [40641640253](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40641640253) SUCCESS: authorization/version/main/order gates, production audit, three platform builds, Windows installer E2E and publication passed.

- ALT 2.27.0 is published/latest, non-draft and non-prerelease. Annotated v2.27.0 dereferences to baseline release SHA.
- Exact five fixed-name assets verified. Four checksum entries match GitHub API SHA-256 digests. All five permanent downloads redirect to v2.27.0 and return HTTP 200.
- Public SHA-256 values:
  - 310603ff41e17551cd0acb504729436e908a0395fb8ee54855449148f2d29bba — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - 6941443587169e45091214b46667aba776cd3ec98956b5354b54c8006efa1183 — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
  - d8d1708b7996682bbef0f31ed126f751b666eaf645953686bfff918850c519c6 — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - 4dc8605efab331761aac28d1e8db7733b413c2594e1914637decb03ac44f279b — Antigravity-ZH-Hant-TW-ALT-Windows.exe
- Historical branches/tags/releases, local installation and user-owned .codex-local/ preserved. No proprietary payload, history rewrite or policy bypass. Final evidence submitted through a separate PR; merge only after current-head CI passes under owner publication authorization.
