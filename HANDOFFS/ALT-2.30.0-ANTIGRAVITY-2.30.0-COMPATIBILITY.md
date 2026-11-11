# Handoff — Antigravity 2.30.0 / ALT 2.30.0

**Status:** COMPLETE
**Issue:** [#93](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/93)
**Baseline commit:** 70a7c26c67b78a30666762fa6964c7704117e857
**Target:** main
**Branch:** codex/antigravity-2.30.0-compatibility
**Prepared:** 2026-11-10

## Goal

Validate installed Windows Antigravity 2.30.0, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.29.1 fingerprints.
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

- Synced main and closed two background sidecars. Candidate audit passed with no mutation. Reviewed changed preload and zoom menu, retaining both menu injection points. Tray, overlay and wizard fingerprints match 2.29.1.
- Controlled apply and exact restore passed. Official SHA-256 00153a89ea4d870d192b7beacae2c26057fa6d698ab8ee777017105c582e60ee. All 347 unpacked files preserved. Core and packaging checks passed.
- Final apply/repeat/integrity audit passed. Both preload sources preserved verbatim, both menu injection blocks present, overlay unchanged, exact official backup retained. Localized SHA-256 ae06c0c0af1469c878c5c07f46ba15f3225ed3ba2902fa234c1ef5a8de875f7e.
- Launch visuals, remote UI DOM and macOS real-install verification remain outside validation. Windows installer build and end-to-end tests passed.
- Pushed implementation 0d7af77 and opened PR [#94](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/94).
