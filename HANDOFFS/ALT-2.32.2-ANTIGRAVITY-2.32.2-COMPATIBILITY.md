# Handoff — Antigravity 2.32.2 / ALT 2.32.2

**Status:** COMPLETE
**Issue:** [#103](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/103)
**Baseline commit:** 404895ad9be47b82099dfd9785e3fcf195cd99e7
**Target:** main
**Branch:** codex/antigravity-2.32.2-compatibility
**Prepared:** 2026-11-18

## Goal

Validate installed Windows Antigravity 2.32.2, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and compare all injection targets with 2.32.1 fingerprints.
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

- Synced origin/main at the baseline; candidate audit PASS/noMutation with processes stopped. All five injection target fingerprints match 2.32.1; existing anchors and protected-zone rules retained.
- Controlled real apply and exact restore PASS. Official archive SHA-256: 056ba838faf9b75c1382a6a0ae003c4b051a3c3e50060a9e5b34987313492d77. All 347 unpacked files retain fingerprint a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133.
- Registered 2.32.2 only after real verification; synchronized ALT metadata using npm version lifecycle. Core, protected-zone/runtime, version and packaging checks PASS. Updated explicit version expectations in payload verification and unknown-version regression coverage.
- Final local apply, repeat apply, final audit and integrity checks PASS. Five JS targets parse, original preload sources preserved, two menu injections present, overlay unchanged and same-version official backup retained. Localized archive SHA-256: 09288795f3fbddbc4c50317212e681ff54877b5018f1edc1e440801b75874941.
- Windows x64 offline build and Windows installer end-to-end tests PASS. Install and Restore artifacts generated locally; no production upload.
- Launch visuals, remote UI DOM and macOS real-install verification remain outside validation.
- GitHub CLI initially selected upstream; misfiled upstream issue #8 was closed and corrected to ALT issue #103. No source or release changes were made upstream.
- Implementation 5347f0a pushed; PR [#104](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/104) targets main. No merge or publication performed.

## Owner-authorized publication

On 2026-11-18 the owner authorized publication, superseding the initial no-merge/no-publication scope. PR #104 passed all checks at 933efdfb21d91ad965f2fc11aa1687d8b3fb27f9 and merged at 3df32e6061d6ecedfc9ec463507b0ce19c8e4986. Main CI 44226887606 and Controlled Release 44227341687 passed. ALT 2.32.2 is latest. Tag, fixed assets, checksums and permanent downloads verified. See [release evidence](ALT-2.32.2-RELEASE.md).
