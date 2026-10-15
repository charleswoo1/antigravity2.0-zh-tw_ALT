# Handoff — ALT upstream-aligned release versions

**Status:** `COMPLETE`
**Issue:** [#62](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/62)
**Baseline commit:** `ba2c64e0462ef7a970289961fbbcacabcdffa328`
**Target:** `main`
**Branch:** `codex/align-alt-upstream-version`
**Prepared:** 2026-10-15

## Goal

Replace independent ALT numbering with the latest verified Antigravity version (currently 2.23.1). Owner confirmed same-upstream corrections use -alt.N, superseding the earlier answer to wait for the next upstream version.

## Non-goals

No merge/publication, historical Release/tag rename, support expansion, localization changes or changes to the user's installed Antigravity.

## Constraints

Owner explicitly supersedes AGENTS.md's old independent-version rule; update that rule. Keep package.json authoritative, explicit allowlist, protected zones/tags, fixed public asset names, manual publication authorization and least-privilege CI. Preserve .codex-local/.

## Implementation steps

1. Sync main, create Issue/branch, inspect version/build/release consumers.
2. Define strict X.Y.Z / X.Y.Z-alt.N and numeric latest-verified alignment with custom revision ordering.
3. Derive native Windows/macOS metadata from package version; support revision Release branches and stable publication.
4. Update rules/docs and bump via npm version lifecycle.
5. Test positive/negative alignment, revision ordering, no-write rejection, native packaging and workflows.
6. Record results, commit/push and create PR.

## Acceptance criteria

Package/runtime/Pages agree at 2.23.1. Mismatched, unverified and malformed versions are rejected. Revision suffixes build using legal native fields, stay official releases, and cannot regress latest. Base/revision packaging tested. No existing public artifact or installed app changed.

## Tests

Core/protected-zone/runtime, packaging/version policy, Windows build/installer E2E, revision build/metadata and CI macOS bundle/signing/ZIP verification. git diff --check.

## Git / PR rules

Commit/push and PR to main; no merge/release without a new owner request. Retain historical tags/releases and branch history.

## Execution Result

- Synced main and opened Issue #62. Owner's final choice is -alt.N revisions; the earlier wait-for-next-upstream answer is superseded and recorded in the Issue.
- Updated AGENTS.md, RELEASING.md, README and compatibility overview. Historical compatibility/release handoffs remain historical records. No tags/Releases renamed or recreated.
- `npm version 2.23.1 --no-git-tag-version` synchronized package/lock/runtime/Pages. Shared version policy requires the numerically highest verified upstream, accepts only exact base / -alt.N, and maps legal native fields. Strict revision ordering prevents rollback against GitHub latest; revision releases explicitly use --prerelease=false.
- Core/dictionary/protected-zone/runtime/compatibility/rollback/process-safety checks PASS. Packaging/version-policy/metadata/fixed-asset/Release-policy checks PASS. Numeric sorting, unverified/mismatched bases, invalid suffixes/overflow, revision ordering and sync rejection before writes covered by executable tests.
- Windows 2.23.1 Install/Restore build PASS; installer E2E and numeric/text version metadata PASS.
- Isolated Windows 2.23.1-alt.1 build, apply/repeat/restore E2E, fixed-name staging and native numeric/text metadata PASS. Tests trim Inno Setup's trailing text-field padding; helper isolates Windows PowerShell 5.1 modules from inherited PowerShell 7 paths.
- CI includes isolated revision packaging on Windows x64 and macOS x64/arm64, with extracted macOS signature, short/build/full version and payload runtime checks. Cloud results are available on the PR; no macOS local real-machine install validation claimed.
- Engine modification is limited to ENGINE_VERSION. No allowlist, dictionary, selector, blocked-zone/tag, installed Antigravity or .codex-local/ changes. git diff --check PASS. Commit/push and PR reference recorded on GitHub; no merge/publication authorized.

### Owner-authorized merge and publication

- On 2026-10-15 the owner explicitly requested publication, superseding the initial no-merge/no-publication scope for this release.
- PR [#63](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/63) exact head `a4b4aa74a10bd82ed055e715377476c16d624390` passed all four CI jobs, including Windows/macOS base and revision packaging, in run 38673920709. Merged at `2c96377256b32bda9d9d7054d6218ea914fbd552`; main CI 38674433550 passed.
- Controlled Release 38674747319 succeeded. ALT 2.23.1 is published/latest with five fixed-name assets, matching checksums and working permanent downloads.
- Full evidence: [ALT-2.23.1-RELEASE.md](ALT-2.23.1-RELEASE.md).
