# Version metadata and public repository hygiene

## Status

`IMPLEMENTED_PR_OPEN`

## Issue

- #16 — Centralize ALT version metadata and improve public contribution workflow

## Baseline

- `main`: `e58eecbdfd054af0753e38463a3825c721e551c2`

## Goal

Reduce version drift across build/CI packaging paths and provide a clear contribution entry point now that the repository is public.

## Non-goals

- Do not change the current ALT release version (`1.1.1`).
- Do not change the Antigravity compatibility allowlist.
- Do not introduce automatic GitHub Release publication.
- Do not change the fixed production Release asset naming policy.
- Do not change repository administration settings that require GitHub Settings / administration APIs.

## Constraints

- `main` remains the only long-lived product branch.
- GitHub Actions remain CI/build validation only with `contents: read`.
- Existing Windows installer behavior, rollback guarantees, process safety and GPU compatibility-mode behavior must remain unchanged.
- Existing macOS status remains experimental / `PENDING_MANUAL_PLATFORM_VALIDATION`.
- Production Release publication remains manual.

## Implementation

1. Treat `package.json.version` as the authoritative build/release version input.
2. Make Windows build read that version and inject it into Inno Setup; installer filenames derive from the injected value.
3. Make macOS build and CI derive app filenames from `package.json.version`; inject the version into `Info.plist` at build time.
4. Add `tools/sync-version.js` so npm version lifecycle / `npm run sync:version` synchronizes runtime `ENGINE_VERSION`; packaging validation rejects version drift.
5. Remove current-version literals from packaging, smoke and Windows installer E2E tests where they would otherwise break the next ALT version bump.
6. Strengthen version/release regression tests so versioned build paths cannot silently reintroduce hard-coded current-version filenames.
7. Add `CONTRIBUTING.md`, structured Bug / Translation / Feature Issue forms, Issue-form configuration and a PR template for public contributors.
8. Keep repository-admin settings such as rulesets, private vulnerability reporting and automatic branch deletion outside this code PR when the connector does not expose write access.

## Acceptance criteria

- Windows and macOS build artifact version naming follows `package.json.version` without editing CI filenames for each release.
- macOS `CFBundleShortVersionString` is injected from the package version during build.
- Packaging tests enforce the dynamic-version policy.
- Existing CI security constraints remain intact.
- Public users have dedicated bug, translation and feature-request forms plus a PR checklist.

## Tests

- `npm run check`
- `npm run check:packaging`
- Windows x64 installer build + `npm run check:windows-installer`
- Windows fixed-name Release staging validation
- macOS x64 / arm64 build, codesign and ZIP validation in CI

## Git / PR

- Branch: `chore/version-source-and-repo-hygiene`
- Base: `main`
- PR: #17 — Centralize version metadata and add public contribution templates
- PR references and closes #16.
- Do not merge automatically; leave the completed PR open for review unless the user explicitly requests merge.

## Execution Result

Implementation completed on PR #17.

Validated implementation head: `4acae8071465184af39d2437a718debabeee3a16`.

GitHub Actions CI run #54 (`35194637647`) completed successfully:

- Core / Ubuntu: PASS
  - smoke/process-safety tests
  - packaging and CI policy tests
  - version metadata synchronization/regression tests
  - production dependency audit
- Windows x64 installer E2E: PASS
  - package-version-driven installer build
  - installer E2E
  - fixed-name Release staging validation
  - CI artifact upload
- macOS x64 app build: PASS
  - package-version-driven app naming
  - build/signature validation
  - `CFBundleShortVersionString` verification
- macOS arm64 app build: PASS
  - package-version-driven app naming
  - build/signature validation
  - `CFBundleShortVersionString` verification

During the first CI pass, an older release-policy test still expected a literal versioned installer name. That regression guard was corrected to validate the dynamic `AppVersion` composition instead. A subsequent audit also found and removed remaining current-version coupling in Windows installer E2E and smoke tests. Final run #54 passed all four jobs.

Repository-administration items that cannot be changed through the available GitHub connector remain manual: `main` ruleset / branch protection, Private vulnerability reporting setting, automatic deletion of merged head branches, and editing the already-published v1.1.1 Release notes if the GitHub UI still displays mojibake.
