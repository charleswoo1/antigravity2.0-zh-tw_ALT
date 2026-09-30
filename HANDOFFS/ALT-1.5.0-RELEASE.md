# Handoff / Implementation Contract — ALT 1.5.0 Release

- **Status:** COMPLETE
- **Issue:** [#44 — Antigravity 2.18.1 compatibility](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/44)
- **Baseline commit:** `f6074fd14cbcf7f9dd1bdb3c2ea600f49a5f5231` (main after PR #45)
- **Authorization:** Repository owner confirmed successful local use and explicitly requested merge and publication on 2026-09-30.

## Goal

Merge verified Antigravity 2.18.1 support and publish ALT 1.5.0 through the controlled Release bridge, validating exact asset names, hashes, tag target and permanent download URLs.

## Non-goals

No additional localization changes, proprietary upstream payload publication, history rewrite, tag overwrite or branch deletion.

## Constraints

AGENTS.md and RELEASING.md apply. package.json is authoritative. Publication uses only release.yml after PR/main CI success. release/v1.5.0 must initially match the current main SHA. Preserve user-owned .codex-local/.

## Implementation steps

1. Verify PR #45 checks and merge the reviewed head.
2. Synchronize main and wait for its CI success.
3. Verify unused release branch/tag and owner identity; push release/v1.5.0 from exact main.
4. Wait for controlled authorization gate, platform builds, tests and publication.
5. Verify published/latest state, exact five assets, checksum hashes and permanent URLs.
6. Record results through a documentation PR and merge it under this authorization.

## Acceptance criteria

PR/main CI and controlled Release succeed. ALT 1.5.0 is latest, non-draft, non-prerelease. Annotated tag dereferences to the release SHA. Four binary/archive asset digests match SHA256SUMS.txt. All permanent URLs return HTTP 200.

## Tests

Prior feature validation: local core, packaging, Windows installer build/E2E and controlled real apply/restore/repeat apply passed. Release re-runs core, packaging, production dependency audit, Windows E2E and macOS signing/bundle/runtime/ZIP validation. Publication checks use GitHub API metadata and HTTP HEAD requests.

## Git / PR rules

Merge and publication explicitly authorized by the user. No automatic merge workflow. Release branch is not merged into main. Documentation results are committed/pushed with a PR before authorized merge.

## Execution Result

- PR #45 merged at `f6074fd14cbcf7f9dd1bdb3c2ea600f49a5f5231`; all four PR checks passed.
- Main CI [36665453632](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/36665453632): SUCCESS.
- Owner-created release/v1.5.0 pointed exactly at the release/main SHA; package version 1.5.0; branch/tag absent before trigger.
- Controlled Release [36665641551](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/36665641551): SUCCESS; authorization gate, Windows and both macOS builds, and publish job passed.

- [ALT 1.5.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/releases/tag/v1.5.0) is published, latest, non-draft, non-prerelease.
- Annotated tag v1.5.0 dereferences to f6074fd14cbcf7f9dd1bdb3c2ea600f49a5f5231.
- Asset set exactly matches all five fixed names; all four SHA256SUMS.txt entries match GitHub asset SHA-256 digests. All five latest/download URLs returned HTTP 200.
- User confirmed successful local application use before authorizing publication. No branch/tag deletion or history rewrite.
