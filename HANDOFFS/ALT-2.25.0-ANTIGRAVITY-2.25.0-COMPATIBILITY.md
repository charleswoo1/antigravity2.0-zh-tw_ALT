# Handoff — Antigravity 2.25.0 / ALT 2.25.0

**Status:** COMPLETE
**Issue:** [#69](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/69)
**Baseline commit:** 71f2102dc5891375784a2a2bb4caf1cf903c6aff
**Target:** main
**Branch:** codex/antigravity-2.25.0-compatibility
**Prepared:** 2026-10-22

## Goal

Validate installed Windows Antigravity 2.25.0, explicitly register support, align ALT version, and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve blocked zones/tags, anchors and user-owned .codex-local/. Commit metadata only; never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and compare all injection targets with 2.24.0.
2. Run synthetic checks and controlled real apply/verify/restore; confirm exact archive restoration and unchanged unpacked files.
3. Register verified version/fingerprint; use npm version lifecycle; update docs and coverage.
4. Run core, packaging, Windows build and installer checks.
5. Apply locally, repeat apply, verify signatures, syntax, official backup and unpacked integrity.
6. Update results, commit/push and create PR to main.

## Acceptance criteria

PASS/noMutation/not-running audit; controlled apply/restore PASS with exact restoration; explicit support only; required checks pass; final installation localized with same-version official backup; PR created.

## Tests

npm run check; npm run check:packaging; Windows x64 build; npm run check:windows-installer; candidate audit and tools/verify-real-install.js; final archive integrity verification.

## Git/PR rules

Commit/push branch, target main, update Execution Result. No merge or publication authorized.

## Execution Result

- Synced origin/main. Initial audit safely blocked running Antigravity; closed the window and remaining background processes before mutation. Candidate audit then PASS/noMutation/not-running.
- All five injection targets identical to 2.24.0. Existing profile, anchors, selectors and protected zones retained.
- Controlled real apply/verify/restore PASS: main/wizard signatures, two menu application points and syntax verified. Exact official archive restored SHA-256 ad7fb1a177a11522490cba910c0970a117bec568cd9ad85233fa62873361ed05; restore removed backup.
- Official unpacked unchanged: 347 files, SHA-256 a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133.
- Registered explicit support only after real verification. npm version lifecycle synchronized package/runtime/Pages to ALT 2.25.0. Updated documentation and compatibility/payload/installer fixtures; engine change limited to ENGINE_VERSION.
- Core/dictionary/protected-zone/runtime/compatibility/transaction rollback/macOS process-safety and packaging/version/fixed asset/Release workflow tests PASS. Valid 2.25.0 fixture accepted, changed tray rejected, unverified 2.25.1 blocked.
- Final local apply and repeat apply PASS. Final integrity PASS: five JavaScript members parse, main/wizard signatures present, two menu injection blocks, logo overlay unchanged, exact same-version official backup retained, unpacked unchanged. Final audit PASS/verifiedSupported/noMutation/not-running. Localized archive SHA-256 c217f640e0ab7fe286d8acf3b787190585cf9162d12071cc0ec807d1daead7e4.
- No launch visual/remote UI DOM or macOS real-install verification. User-owned .codex-local/ untouched; no official payload committed.
- Windows x64 Install/Restore build PASS (Inno Setup 6.7.3). Installer E2E PASS: 2.25.0 apply/repeat/restore, menu/tray translation and syntax, unchanged overlay/unpacked, process-bypass/missing-installation/unsupported-version rejection. git diff --check PASS.
- Implementation commit 2f85055 pushed to origin. PR [#70](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/70) targets main; CI results are available on the PR. No merge or publication authorized.

## Owner-authorized publication attempt

On 2026-10-22 the owner confirmed local operation and requested publication, superseding the initial no-merge/no-publication scope. PR #70 merged after four successful CI jobs at 2c375e4bd1c79b5f4b76bd33520164799cffc841. Main CI 39710859378 passed all platform builds and core/packaging tests, but npm security audit timed out twice at the bulk advisory endpoint. The npm service recovered: main CI attempt 4 succeeded, then Controlled Release 39717799544 published ALT 2.25.0 as latest. Five fixed-name assets, SHA-256 digests, tag target and permanent downloads all verified. Full evidence: [ALT-2.25.0-RELEASE.md](ALT-2.25.0-RELEASE.md).
