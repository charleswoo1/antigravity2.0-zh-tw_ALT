# Version metadata and public repository hygiene

## Status

`IMPLEMENTING`

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
4. Strengthen packaging regression tests so versioned build paths cannot silently reintroduce hard-coded current-version filenames.
5. Add `CONTRIBUTING.md`, structured Issue forms, Issue-form configuration and a PR template for public contributors.
6. Keep repository-admin settings such as rulesets, private vulnerability reporting and automatic branch deletion outside this code PR when the connector does not expose write access.

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
- macOS x64 / arm64 build and ZIP validation in CI

## Git / PR

- Branch: `chore/version-source-and-repo-hygiene`
- Base: `main`
- PR must reference and close #16.
- Do not merge automatically; leave the completed PR open for review unless the user explicitly requests merge.

## Execution Result

Pending implementation and CI validation.
