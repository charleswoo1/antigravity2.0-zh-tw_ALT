# Handoff — Antigravity 2.33.0 / ALT 2.33.0

**Status:** COMPLETE
**Issue:** [#107](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/107)
**Baseline commit:** 654fe67712763ce2dfaef030d6c88cc0a7e42455
**Target:** main
**Branch:** codex/antigravity-2.33.0-compatibility
**Prepared:** 2026-11-19

## Goal

Validate Windows Antigravity 2.33.0, register explicit support, align ALT version and leave the local installation localized.

## Non-goals

Merge, formal publication, unrelated translation changes and macOS real-install verification are outside this task.

## Constraints

Follow AGENTS.md and COMPATIBILITY.md. Preserve patch anchors and protected zones. Require a passing read-only audit and stopped processes before controlled apply and exact restore. Commit only source and metadata.

## Implementation steps

1. Sync main, audit the local candidate and review injection targets against 2.32.2.
2. Run synthetic checks, controlled apply and exact restore.
3. Register the version and fingerprint, align ALT metadata, and update documentation and compatibility checks.
4. Apply locally, repeat apply and verify official backup, native preloads and archive integrity.
5. Build and test Windows installers, then push the compatibility branch and open a PR.

## Acceptance criteria

Candidate audit and controlled apply/restore pass. The explicit allowlist includes 2.33.0, tests pass and the local installation remains localized with a same-version official backup. The branch is submitted for review.

## Tests

Core and packaging checks, read-only audits, controlled real apply/restore, final archive integrity and Windows x64 installer build/E2E.

## Git / PR rules

Use a short branch and target main with a PR. Owner authorization governs merge and publication.

## Execution Result

- Candidate v2-mainline-tray-onclick audit passed with no mutation and the application stopped. Native preload changed and includes the agyComputerPreview bridge. The other four injection target fingerprints match 2.32.2.
- Controlled apply and exact restore passed. Official archive SHA-256 b33c81600e82e65593aa8430ef01b37d6b28d9d98f0faf45e25957783b71e64b. All 377 unpacked files retain fingerprint 5ba96a2eaf81be2dbc860c4f52a9f351a35fb06847f906e32ee6c4d5e776286f.
- Registered 2.33.0 after verification and synchronized the ALT version through npm. Core, protected-zone, runtime and packaging tests passed.
- Final local apply, repeat apply and integrity audit passed. Five JS members passed syntax checks, both original preloads were preserved, both menu injection points were present and the logo overlay was unchanged. Same-version backup retained. Localized archive SHA-256 ef97b53b2024c236463880d93c0933ebcbb3292a515893fc94f8d9dbde6554d9.
- Windows x64 offline build and installer end-to-end tests passed for the install and restore tools.
- Launch visuals, live remote UI DOM and macOS real-install verification were outside validation.

## Owner-authorized publication

The owner authorized publication on 2026-11-19. PR #108 passed CI and merged at f0c2bae2bbd22127a042c858b5487582c5e164f3. ALT 2.33.0 is the latest formal Release. See the [release evidence](ALT-2.33.0-RELEASE.md).
