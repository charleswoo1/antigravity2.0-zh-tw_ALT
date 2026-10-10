# Handoff — Antigravity 2.22.0 / ALT 1.8.0

**Status:** `READY_FOR_REVIEW`
**Issue:** [#54](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/54)
**Baseline commit:** `fe1054a8bc44f9f07a112c315c31c2ae22aeb437`
**Target:** `main`
**Branch:** `codex/antigravity-2.22.0-compatibility`
**Prepared:** 2026-10-11

## Goal

Validate the actually installed Antigravity 2.22.0, add explicit verified support in ALT 1.8.0, and leave the user's installation localized, as requested by the owner.

## Non-goals

No merge, release branch, tag, Release, production upload, permissive version range or unrelated translation changes.

## Constraints

AGENTS.md is authoritative. Preserve blocked zones/tags and user-owned .codex-local/. Commit metadata fingerprints only, never official proprietary payloads. Require PASS/noMutation audit and stopped Antigravity before real mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, read project rules and SOP, create branch and Issue.
2. Detect archive version, audit existing candidate profile, compare member hashes and review changed injection targets/protection assumptions.
3. Run controlled apply/verify/restore and confirm exact archive SHA-256 and unpacked integrity.
4. Add explicit manifest/fingerprint, bump ALT via npm version lifecycle, update docs and compatibility/installer coverage.
5. Run core, packaging, Windows build and installer validation.
6. Apply for user, repeat apply, verify syntax, signatures, unchanged overlay, same-version official backup and absence of transaction artifacts.
7. Update Execution Result, commit/push, open PR to main.

## Acceptance criteria

- Actual 2.22.0 candidate audit PASS/noMutation, not-running.
- Controlled real apply/restore PASS, exact restoration, unpacked unchanged.
- Explicit support and safe fingerprint; synchronized ALT 1.8.0 metadata.
- Protected-zone/runtime/core/packaging and Windows build/installer checks pass.
- Final local installation localized with exact same-version official backup.
- GitHub PR created; no automatic merge/publication.

## Tests

`npm ci --ignore-scripts --no-fund`; `npm run check`; `npm run check:packaging`; `powershell -ExecutionPolicy Bypass -File build/windows/build.ps1 -Arch x64`; `npm run check:windows-installer`.

`node tools/compatibility-audit.js --profile v2-mainline-tray-onclick --require-not-running --json .build/audit-2.22.0.json --fingerprint .build/fingerprint-2.22.0.json`.

`node tools/verify-real-install.js --install-dir <local installation> --audit .build/audit-2.22.0.json --json .build/real-install-2.22.0.json`.

## Git/PR rules

Commit/push this branch, target main, update results. Do not merge/publish or alter historical branches/tags or user-owned state.

## Execution Result

- Synced main. Actual installed 2.22.0: candidate PASS/noMutation, not-running.
- All five injection-target member hashes identical to verified 2.21.1; only package.json changed among audited members. Reuse existing profile and protection rules without relaxation.
- Controlled real apply/verify/restore PASS: main/wizard signatures and two menu application points verified; exact archive SHA-256 restored: `259c83ffa266088dda6ede520a601bbf06cc5c34985cdf56c5d68549c98dbb0e`. Restore removed backup.
- Official unpacked tree unchanged: 347 files, SHA-256 `a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133`.
- Added explicit verified manifest entry and metadata-only fingerprint after real verification. npm version lifecycle synchronized package/runtime/Pages to ALT 1.8.0. Updated README/COMPATIBILITY and compatibility/installer/payload allowlist checks.
- npm ci PASS, zero vulnerabilities. Core, dictionary, protected-zone/runtime, compatibility (2.22.0 success and changed-tray rejection, 2.22.1 rejected), transactional rollback and macOS process-safety checks PASS. Packaging/version/fixed-asset/release-policy checks PASS.
- Initial Windows build caught stale verify-payload support assertion; added 2.22.0 and rebuilt. No installer safety gate relaxed.
- Final local apply and repeat apply PASS; same-version official backup matches audit SHA-256. All five JS members parse; preload signature occurs once; native closeContextMenu and tray onClick preserved; Agent count translated; two menu blocks; overlay and unpacked unchanged; no transaction artifacts. Final audit PASS/verifiedSupported/noMutation/not-running.
- Validation helper assumptions corrected to the existing `個 Agent 執行中` translation and native Windows ASAR member path separators; final integrity checks PASS. No product change was needed for these helper corrections.
- Runtime engine changes only ENGINE_VERSION. No actual remote UI DOM/visual launch inspection or macOS real-install validation. User-owned .codex-local/ untouched; no official proprietary payload committed; no merge/publication authorized.
- Windows x64 Install/Restore build PASS with Inno Setup 6.7.3. Installer E2E PASS for 2.22.0 apply/repeat/restore, onClick/count translation, two menu blocks, unchanged overlay/unpacked, process-bypass rejection, missing installation and unsupported version blocking. git diff --check PASS.
- Implementation commit `6e48787` pushed to origin. PR [#55](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/55) targets main; CI runs validation only. No automatic merge or release.
