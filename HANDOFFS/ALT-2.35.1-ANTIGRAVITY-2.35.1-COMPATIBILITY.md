# Handoff — Antigravity 2.35.1 / ALT 2.35.1

**Status:** READY_FOR_REVIEW
**Issue:** [#111](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/111)
**Baseline commit:** f0c2bae2bbd22127a042c858b5487582c5e164f3
**Target:** main
**Branch:** codex/antigravity-2.35.1-compatibility
**Prepared:** 2026-11-25

## Goal

Validate and localize the Windows Antigravity 2.35.1 installation. Register explicit support and align the ALT version.

## Non-goals

Formal publication, unrelated translations, remote renderer inspection and macOS real-install validation are outside this task.

## Constraints

Follow AGENTS.md and COMPATIBILITY.md. Preserve patch anchors and protected zones. Require a passing read-only audit and stopped processes for controlled apply and restore. Track only source and compatibility metadata.

## Implementation steps

1. Sync main and compare 2.35.1 injection targets with 2.33.0.
2. Run baseline tests and verify controlled apply and exact restore.
3. Add the verified version and fingerprint, then align version metadata, documentation and packaging checks.
4. Apply twice and verify the official backup, native sources and installed archive.
5. Build and test Windows installers, then submit the changes for review.

## Acceptance criteria

The compatibility audit, controlled apply and exact restore, local integrity checks and Windows tests pass. The local installation remains localized with a same-version official backup. Explicit 2.35.1 support is submitted to main through a PR.

## Tests

Core and packaging checks, candidate and final audits, controlled real apply and restore, installation integrity, and Windows x64 offline build and installer E2E.

## Git / PR rules

Push a short branch and target main with a PR. Merge and publication require owner authorization.

## Execution Result

- The candidate audit passed without mutation once Antigravity stopped. The native preload and menu changed. The menu's zoom configuration still precedes its first application, and both injection sites matched. The tray, overlay and wizard preload fingerprints match 2.33.0.
- Controlled apply and exact restore passed. Official archive SHA-256 is 9f0aad7274795d7fbde04931d96b348dcfc5f3d81d7373e6b70aeb09307442df. The 377 unpacked files retain fingerprint 5ba96a2eaf81be2dbc860c4f52a9f351a35fb06847f906e32ee6c4d5e776286f.
- Registered 2.35.1 after verification. Core tests, including protected-zone checks, and packaging tests passed.
- Final apply, repeated apply and final audit passed. Both native preloads match their official bytes and have one ALT block each. Both menu blocks passed syntax and source-preservation checks. The official backup is retained. Localized archive SHA-256 is 538a5aab68f4d646abb4f932edffd9c9c1dffd2e823f19ead0566d5fca1c4548.
- Windows x64 offline build and installer end-to-end tests passed for the install and restore tools.
