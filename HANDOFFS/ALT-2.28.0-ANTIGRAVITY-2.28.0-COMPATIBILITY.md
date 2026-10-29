# Handoff — Antigravity 2.28.0 / ALT 2.28.0

**Status:** COMPLETE
**Issue:** [#81](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/81)
**Baseline commit:** 478998dcdb7d84b0afbac343b41798d3c755728a
**Target:** main
**Branch:** codex/antigravity-2.28.0-compatibility
**Prepared:** 2026-10-29

## Goal

Validate installed Windows Antigravity 2.28.0, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.27.0 fingerprints.
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

- Synced origin/main to baseline. Initial read-only audit blocked running Antigravity; stopped two background device-hub / compose-preview sidecars before mutation. Candidate audit then PASS/noMutation/not-running.
- Compared injection fingerprints with 2.27.0: preload changed; menu, tray, overlay and wizard unchanged. Reviewed native preload APIs including script-jail, webview security state subscription and favicon events. Existing profile and two menu anchors remain applicable. No anchor, selector or protected-zone changes.
- Controlled real apply/verify/restore PASS: main/wizard signatures, menu syntax and two menu injection points verified. Exact official archive restored SHA-256 4a145127f2fa419489701fd67415feb8667bb14a6f228231c48ebc02c26704b2; restore removed backup.
- Official unpacked unchanged: 347 files, SHA-256 a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133.
- Registered explicit support after real verification. npm version lifecycle synchronized ALT 2.28.0. Updated docs and compatibility/payload/installer fixtures; engine change limited to ENGINE_VERSION.
- Core/dictionary/protected-zone/runtime/compatibility/transaction rollback/macOS process-safety and packaging/version/fixed asset/Release workflow tests PASS. 2.28.0 valid fixture accepted, changed tray rejected, unverified 2.28.1 remains blocked.
- Final local apply and repeat apply PASS. Five JavaScript members parse, main/wizard signatures present, two menu injection blocks, original native preload sources and new APIs retained, overlay unchanged, exact same-version official backup retained, unpacked unchanged. Final audit PASS/verifiedSupported/noMutation/not-running. Localized archive SHA-256 ed1b7c4aa361ea56bd5c2374b26adc5175634a4d07c92bd1e838466f47443788.
- No launch visual/remote UI DOM or macOS real-install verification. User-owned .codex-local/ untouched; no official payload committed.
- Windows x64 Install/Restore build PASS. Installer E2E PASS: 2.28.0 apply/repeat/restore, menu/tray translation and syntax, unchanged overlay/unpacked, process-bypass/missing-installation/unsupported-version rejection. git diff --check PASS.
- Implementation commit c977bba pushed to origin. PR [#82](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/82) targets main; CI results are available on the PR. No merge or publication authorized.
