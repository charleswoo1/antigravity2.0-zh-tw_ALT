# Handoff / Implementation Contract — Controlled Cross-Platform CI

**Status:** `COMPLETE`  
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
- Workflow artifacts are CI validation artifacts only and use short retention.

## Build compatibility

Existing local build commands remain supported. Legacy build-script/test guards that rejected `.github/workflows` were removed.

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

- [x] CI workflow exists under `.github/workflows/`.
- [x] Workflow uses only read repository permission.
- [x] No secret-dependent steps.
- [x] No release/merge/destructive action.
- [x] Windows x64 build/E2E job passes.
- [x] macOS Intel x64 build/sign/ZIP job passes.
- [x] macOS Apple Silicon arm64 build/sign/ZIP job passes.
- [x] Core Ubuntu checks pass.
- [x] Local build scripts no longer reject GitHub Actions.
- [x] Packaging tests enforce the controlled-CI safety constraints.
- [x] README documents CI coverage and that CI artifacts are not releases.

## Execution Result

- Status: `COMPLETE`
- PR: #9 — `ci: add controlled cross-platform validation`
- Merge commit: `00a0ff1939340b7400a588940bf4e270cf1a9303`
- Successful validation run: `35086514369`
- Core: `PASS`
- Windows x64: `PASS` — Inno Setup build, synthetic install/reinstall/restore/failure E2E, artifact upload
- macOS Intel x64: `PASS` — native build, ad-hoc signing, ZIP creation/extraction, post-extraction codesign verification, bundled Node 24.21.0 verification, artifact upload
- macOS Apple Silicon arm64: `PASS` — native build, ad-hoc signing, ZIP creation/extraction, post-extraction codesign verification, bundled Node 24.21.0 verification, artifact upload
- Remaining blockers: real end-user Gatekeeper/quarantine interaction and installation against a real Antigravity 2.13.0 installation still require manual Mac validation before macOS is described as production-supported.
- Notes:
  - CI discovered and fixed a Windows PowerShell 5 UTF-8/no-BOM parsing issue in the build script.
  - CI discovered and fixed macOS codesign rejection caused by unnecessary npm `node_modules/.bin` symlinks; the runtime does not require those shims.
  - Workflow uses `permissions: contents: read`, no secrets, no `pull_request_target`, and no automatic merge/release/destructive operations.
