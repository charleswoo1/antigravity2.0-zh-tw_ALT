# Handoff — Antigravity 2.27.0 / ALT 2.27.0

**Status:** COMPLETE
**Issue:** [#77](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/77)
**Baseline commit:** 21d9f484dcd1bcbaf16fe8ca7e57e980bb5d01de
**Target:** main
**Branch:** codex/antigravity-2.27.0-compatibility
**Prepared:** 2026-10-28

## Goal

Validate installed Windows Antigravity 2.27.0, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.26.0 fingerprints.
2. Run synthetic checks and controlled real apply/verify/restore; confirm exact archive restoration and unchanged unpacked files.
3. Register verified version/fingerprint; use npm version lifecycle; update docs and regression coverage.
4. Run core, packaging, Windows build and installer checks.
5. Apply locally, repeat apply and verify signatures, syntax, original preload preservation, official backup and unpacked integrity.
6. Update results, commit/push and create PR to main.

## Acceptance criteria

PASS/noMutation/not-running audit; controlled apply/restore PASS with exact restoration; explicit support only; required checks pass; local installation localized with same-version official backup; PR created.

## Tests

npm run check; npm run check:packaging; Windows x64 build; npm run check:windows-installer; candidate audit; tools/verify-real-install.js; final archive integrity verification.

## Git/PR rules

Commit/push branch, target main, update Execution Result. No merge or publication authorized.

## Execution Result

- Synced origin/main to baseline. Initial read-only audit blocked running Antigravity; stopped four orphaned device-hub / compose-preview sidecars before mutation. Candidate audit then PASS/noMutation/not-running.
- Compared injection fingerprints with 2.26.0: preload changed; menu, tray, overlay and wizard unchanged. Reviewed native preload APIs including webview new-tab event. Existing profile and two menu anchors remain applicable. No anchor, selector or protected-zone changes.
- Controlled real apply/verify/restore PASS: main/wizard signatures, menu syntax and two menu injection points verified. Exact official archive restored SHA-256 5ed34675d2d5e42f9bb1c0087b06d398c2e2eb052512ec1d0fefd6b71e2db807; restore removed backup.
- Official unpacked unchanged: 347 files, SHA-256 a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133.
- Registered explicit support after real verification. npm version lifecycle synchronized ALT 2.27.0. Updated docs and compatibility/payload/installer fixtures; engine change limited to ENGINE_VERSION.
- Core/dictionary/protected-zone/runtime/compatibility/transaction rollback/macOS process-safety and packaging/version/fixed asset/Release workflow tests PASS. 2.27.0 valid fixture accepted, changed tray rejected, unverified 2.27.1 remains blocked.
- Final local apply and repeat apply PASS. Five JavaScript members parse, main/wizard signatures present, two menu injection blocks, original native preload sources and new webview event retained, overlay unchanged, exact same-version official backup retained, unpacked unchanged. Final audit PASS/verifiedSupported/noMutation/not-running. Localized archive SHA-256 31da41ffe60e0b3fdccbb6a5690b31fb19a5257f2fc063f5e8ecb830983ba6f7.
- No launch visual/remote UI DOM or macOS real-install verification. User-owned .codex-local/ untouched; no official payload committed.
- Windows x64 Install/Restore build PASS. Installer E2E PASS: 2.27.0 apply/repeat/restore, menu/tray translation and syntax, unchanged overlay/unpacked, process-bypass/missing-installation/unsupported-version rejection. git diff --check PASS.
- Implementation will be pushed to origin on codex/antigravity-2.27.0-compatibility with a PR targeting main. No merge or publication authorized.
