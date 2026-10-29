# Handoff — ALT 2.28.0 Release

**Status:** COMPLETE
**Issue:** [#83](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/83)
**Baseline commit:** a314af3f594a61668b8fa0e4ea88645f3ef6eb11 (main after PR #82)
**Authorization:** On 2026-10-29 the owner explicitly requested publication, superseding the compatibility contract's initial no-merge/no-publication scope.

## Goal

Merge verified compatibility support and publish ALT 2.28.0 through the controlled Release bridge. Verify tag target, fixed-name assets, checksums and permanent downloads.

## Non-goals

No further localization changes, historical Release/tag replacement, branch deletion, proprietary payload publication or installed-app mutation.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. PR/main CI must pass. Release branch must initially match latest main exactly. Preserve .codex-local/.

## Implementation steps

1. Verify PR #82 exact head and CI; merge the reviewed head.
2. Sync main and require its CI success.
3. Confirm owner identity and unused version; push release/v2.28.0 from exact validated main.
4. Wait for authorization gate, platform builds and publication.
5. Verify published/latest/non-prerelease state, annotated tag target, five assets, checksums and permanent downloads.
6. Commit/push evidence through a separate PR and merge after CI under owner publication authorization.

## Acceptance criteria

PR/main CI and Controlled Release succeed. ALT 2.28.0 is latest/non-draft/non-prerelease. Annotated tag dereferences to release SHA. Four checksums match GitHub asset digests. Five permanent downloads return HTTP 200.

## Tests

Compatibility work passed local core, packaging, Windows build/installer and real apply/restore tests. PR/main CI covers Windows and macOS x64/arm64 builds. Release reruns policy/dependency checks and builds/tests. Post-publication checks use GitHub API digests and HTTP requests.

## Git / PR rules

Owner authorizes merge/publication. Use release.yml only. Do not merge release branch into main. Final evidence uses a separate PR. Preserve historical branches/tags/releases.

## Execution Result

- PR #82 exact head 044184f13316c6652d46201d8104e09bbbf662a3 passed all four CI jobs in run 40805183860 and merged at baseline above.
- Authenticated actor charleswoo1 matches repository owner. Initial checks confirmed no release/v2.28.0 branch or v2.28.0 tag; latest was v2.27.0.
- Main CI [40807788496](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40807788496) SUCCESS: core, production dependency audit, Windows installer E2E and macOS x64/arm64 builds. One read-only status query timed out; direct API recheck confirmed success, with no rerun or bypass.
- Confirmed origin/main still equals baseline and package version is 2.28.0; pushed release/v2.28.0 from that exact SHA.
- Controlled Release [40808165704](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/40808165704) SUCCESS: authorization/version/main/order gates, production audit, three platform builds, installer E2E and publication passed.

- ALT 2.28.0 is published/latest, non-draft and non-prerelease. Annotated v2.28.0 dereferences to baseline release SHA.
- Exact five fixed-name assets verified. Four checksums match GitHub API SHA-256 digests. All five permanent downloads redirect to v2.28.0 and return HTTP 200.
- Public SHA-256 values:
  - d5123e6d1c355cfb1de72924677ef9fafb8028f39c44de01fbc4f7aabc52cdd0 — Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip
  - 789691b2d49a7180fe25a71811c8974283e950e184aa87ada01a90bd626d79e5 — Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip
  - 8b36b3498bd315ef5043f7a2a8daf5ed3b4a18fa7c975a96a459b9d8bfc926bf — Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe
  - 38cff08c83fae1cf94a6839030a04b1a1d575334f42120cd8093260a4fe17dbb — Antigravity-ZH-Hant-TW-ALT-Windows.exe
- Historical branches/tags/releases, local installation and user-owned .codex-local/ preserved. No proprietary payload, history rewrite or policy bypass. Final evidence uses a separate PR; merge after current-head CI passes under owner publication authorization.
