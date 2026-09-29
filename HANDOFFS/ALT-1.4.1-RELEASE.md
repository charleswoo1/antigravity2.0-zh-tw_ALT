# Handoff / Implementation Contract — ALT 1.4.1 Release

- **Status:** IN_PROGRESS
- **Issue:** [#41 — Release ALT 1.4.1 with localization fixes](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/41)
- **Baseline commit:** `84c38b79f163f58ea460c04aeda66f0870f90f69` (`origin/main` after PR #40)
- **Implementation branch:** `codex/release-1.4.1`
- **Authorization:** Repository owner explicitly requested merging PR #40 and publishing ALT 1.4.1 on 2026-09-29.

## Goal

Promote the reviewed localization fixes from PR #40 into ALT 1.4.1 and publish the version through the controlled Release bridge.

## Non-goals

- Do not change localization behavior beyond the merged PR #40.
- Do not publish official Antigravity proprietary files.
- Do not bypass the controlled Release bridge or manually create a tag or Release while it is working.
- Do not delete or rewrite long-lived branches, tags, or Releases.

## Constraints

- `main` is the product mainline. Version preparation occurs on a short-lived branch and returns through a PR.
- `package.json.version` is the authoritative ALT version; use `npm version 1.4.1 --no-git-tag-version` and preserve lifecycle synchronization.
- Wait for the merged feature's `main` CI before merging version preparation.
- Create `release/v1.4.1` only after the version PR and its `main` CI pass. It must point exactly to the current `origin/main` commit.
- The only production write path is `.github/workflows/release.yml`, with five fixed-name assets and a new complete `SHA256SUMS.txt`.

## Implementation steps

1. Confirm PR #40 merge and its manually triggered CI success; synchronize `origin/main`.
2. Prepare ALT 1.4.1 via npm version lifecycle and verify runtime/site/package metadata.
3. Run local core and packaging checks; commit, push, open and merge a version PR after CI.
4. Confirm the new `main` CI succeeds and no `v1.4.1` tag or Release exists.
5. Push `release/v1.4.1` from the exact current `main` SHA, triggering the controlled Release bridge.
6. Verify gate, builds, asset names, checksums, published Release status, and latest download URLs.

## Acceptance criteria

- Version fields and checks agree on `1.4.1`.
- Both version PR CI and resulting `main` CI pass.
- Controlled Release workflow succeeds, `v1.4.1` points at the release branch/main SHA, and the published Release is latest, non-draft, and non-prerelease.
- Release contains exactly the four fixed-name platform assets and `SHA256SUMS.txt`, with matching hashes.

## Tests

- `npm ci --ignore-scripts --no-fund`
- `npm run check`
- `npm run check:packaging`
- Windows installer build and `npm run check:windows-installer` where available.
- `git diff --check`
- PR/main CI and controlled Release workflow.

## Git / PR rules

- Commit and push the version preparation branch and open a PR to `main`.
- User authorization in this conversation permits merging that PR after required checks and triggering the release branch.
- Keep feature/release PR and Release results in this Execution Result section; do not merge a Release branch into `main`.

## Execution Result

Pending version verification, PR, and controlled Release results.
