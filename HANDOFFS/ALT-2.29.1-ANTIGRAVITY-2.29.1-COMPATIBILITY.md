# Handoff — Antigravity 2.29.1 / ALT 2.29.1

**Status:** COMPLETE
**Issue:** [#89](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/89)
**Baseline commit:** 4d5b7442acce2cb773c885286ac7c4656f3ffbbd
**Target:** main
**Branch:** codex/antigravity-2.29.1-compatibility
**Prepared:** 2026-11-10

## Goal

Validate installed Windows Antigravity 2.29.1, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.29.0 fingerprints.
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

- Synced main. Closed two background sidecars. Candidate audit passed with no mutation. All five injection target fingerprints match 2.29.0.
- Controlled real apply and exact restore passed. Official archive SHA-256 a6bfd4567c2560495860e895c8894106ed40782e4a31e459713fec1cc2a0d02b. All 347 unpacked files preserved their fingerprint.
- Core and packaging checks passed. Final apply/repeat/integrity audit passed. Original preload sources and overlay bytes preserved, two menu injection blocks present, same-version official backup retained. Localized SHA-256 d3a53425a9026cd0306a351e4f9801ac11c65ef4915eacd6c261750f825eae28.
- Launch visual, remote UI DOM and macOS real-install verification remain outside this validation. Windows installer build and end-to-end tests passed.
- Pushed implementation commit 19615e8 and opened PR [#90](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/90).
