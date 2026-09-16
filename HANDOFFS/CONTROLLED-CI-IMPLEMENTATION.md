# Handoff / Implementation Contract — Controlled Cross-Platform CI

**Status:** `IN_PROGRESS`  
**Issue:** #8 — Add controlled cross-platform CI for ALT  
**Target:** `main`  
**Implementation branch:** `feature/controlled-ci-validation`  
**Prepared:** 2026-09-16

## Goal

Add read-only GitHub Actions CI for ALT without turning Actions into an automatic release or repository-management system.

## Required jobs

1. Core validation on Ubuntu.
2. Windows x64 installer build and synthetic installer E2E.
3. macOS Intel x64 app build/ad-hoc-sign/ZIP validation.
4. macOS Apple Silicon arm64 app build/ad-hoc-sign/ZIP validation.

Use standard GitHub-hosted runner labels:
- `ubuntu-24.04`
- `windows-2025`
- `macos-15-intel`
- `macos-15` (arm64)

## Security constraints

- Top-level `permissions: contents: read`.
- No secrets.
- No `pull_request_target`.
- No automatic merge.
- No production GitHub Release.
- No production release-asset publishing.
- No branch/tag/release deletion.
- No history rewrite.
- No destructive fallback.
- Workflow artifacts are CI validation artifacts only and should use short retention.

## Build compatibility

Existing local build commands must keep working. Remove the legacy build-script/test guards that reject the existence of `.github/workflows`.

## Validation

Core:
- `npm ci --ignore-scripts --no-fund`
- `npm run check`
- `npm run check:packaging`
- `npm audit --omit=dev`

Windows:
- build x64 with `build/windows/build.ps1`
- run `npm run check:windows-installer`
- upload generated EXEs only as short-lived CI artifacts

macOS:
- build each native architecture with `build/macos/build.sh`
- verify the produced ZIP can be extracted with `ditto`
- verify the extracted app with `codesign --verify --deep --strict`
- verify bundled Node runtime reports the pinned version
- upload ZIP only as short-lived CI artifact

## Acceptance criteria

- [ ] CI workflow exists under `.github/workflows/`.
- [ ] Workflow uses only read repository permission.
- [ ] No secret-dependent steps.
- [ ] No release/merge/destructive action.
- [ ] Windows x64 build/E2E job passes.
- [ ] macOS Intel x64 build/sign/ZIP job passes.
- [ ] macOS Apple Silicon arm64 build/sign/ZIP job passes.
- [ ] Core Ubuntu checks pass.
- [ ] Local build scripts no longer reject GitHub Actions.
- [ ] Packaging tests enforce the controlled-CI safety constraints.
- [ ] README documents CI coverage and that CI artifacts are not releases.

## Execution Result

- Status:
- PR:
- Workflow run:
- Core:
- Windows x64:
- macOS Intel x64:
- macOS Apple Silicon arm64:
- Remaining blockers:
- Notes:
