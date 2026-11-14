# Handoff — Antigravity 2.32.1 / ALT 2.32.1

**Status:** COMPLETE
**Issue:** [#97](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/97)
**Baseline commit:** ec2ac79fadf8392b04d9e5df4f0033d275b13317
**Target:** main
**Branch:** codex/antigravity-2.32.1-compatibility
**Prepared:** 2026-11-15

## Goal

Validate installed Windows Antigravity 2.32.1, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.30.0 fingerprints.
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

- Synced main and closed three background processes. Candidate audit passed with no mutation. Reviewed changed native preload including SSH, microphone and WebMCP APIs. Other injection targets match 2.30.0.
- Controlled real apply and exact restore passed. Official SHA-256 5b493943e67e500638555315594d5b1acbc7a02e6dac3c786651921c1ee8519f. All 347 unpacked files retain fingerprint a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133.
- Explicitly registered 2.32.1 after real verification, synchronized ALT metadata with npm lifecycle. Core and packaging checks passed.
- Final apply/repeat/integrity audit passed. Five JS members parse, native preload sources preserved, two menu injection blocks present, overlay unchanged and same-version official backup retained. Localized SHA-256 e1cd7d4c107aef99aba9e5bf099f0c95c6c4d004d12533511d1569ff00b59049.
- Launch visuals, remote UI DOM and macOS real-install verification remain outside validation. Windows installer build and end-to-end tests passed.
- Implementation 2b8d3c7 pushed with PR [#98](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/98).

## Owner-authorized publication

On 2026-11-15 the owner authorized publication. PR #98 passed all checks at e6d37d77a28240288e02541a5d286a9fb2e758fa and merged at 6fdbbd8d07c145930cd829806ddb3b10aed528cb. Main CI 43639161113 and Controlled Release 43639443254 passed. ALT 2.32.1 is latest. Tag, fixed assets, checksums and downloads verified. See [release evidence](ALT-2.32.1-RELEASE.md).
