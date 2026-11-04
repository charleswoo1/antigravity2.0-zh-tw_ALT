# Handoff — Antigravity 2.29.0 / ALT 2.29.0

**Status:** COMPLETE
**Issue:** [#85](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/85)
**Baseline commit:** 4fb3e89773932fa0802916db9ec2e0e2ce74c4b2
**Target:** main
**Branch:** codex/antigravity-2.29.0-compatibility
**Prepared:** 2026-11-04

## Goal

Validate installed Windows Antigravity 2.29.0, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, unrelated translations or historical changes.

## Constraints

AGENTS.md is authoritative. Preserve anchors, protected zones/tags and user-owned .codex-local/. Commit metadata only, never official payloads. Require PASS/noMutation audit and stopped processes before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, audit candidate and review changed injection targets against 2.28.0 fingerprints.
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

- Read-only candidate audit passed after closing two background Antigravity processes. Reviewed changed preload, menu and logo overlay. The existing profile, anchors and protected zones remain applicable.
- Controlled apply and exact restore passed. The official archive SHA-256 was 290e1b7a1caa430a0c5367c7b433e8d284e2ca5d0b305e91e5ce8ec926f43283 and all 347 unpacked files retained their fingerprint.
- Registered explicit support and synchronized ALT 2.29.0 through the npm lifecycle. Core and packaging checks passed.
- The first final apply overlapped the synthetic tests and failed while repacking. The engine verified the live archive was intact. Retried after the synthetic tests finished. Apply, repeat apply and final audit passed, with both preload sources preserved, both menu injection points present, overlay bytes intact and the same-version official backup retained. Localized SHA-256: f5e3b15b69a2994d4edb5dedebe869a19c84ded24162d22403fc4b58c1c93f5e.
- Launch visuals, remote UI DOM and macOS real-install validation were outside this verification.
- Windows x64 install and restore tools built successfully. Windows installer end-to-end tests passed.
- Pushed implementation commit 1139696 and opened PR [#86](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/86) for review.
- Owner authorized publication on 2026-11-04. The PR security gate found GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Pinned glob 14.0.3 and minimatch 11.0.4 through npm overrides, refreshed the lockfile and notices. npm audit reports zero vulnerabilities. Core and packaging checks pass.

## Owner-authorized publication

On 2026-11-04 the owner explicitly authorized publication. After fixing the security gate and passing local rebuild/E2E plus PR CI, PR #86 merged at 2a2a0ba184faa5314b3acb1a811b9489897a97d7. Main CI 41768870609 and Controlled Release 41769219703 passed. ALT 2.29.0 is published as latest. Tag, fixed assets, digests and downloads verified. See [release evidence](ALT-2.29.0-RELEASE.md).
