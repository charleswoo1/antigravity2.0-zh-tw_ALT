# Handoff — Antigravity 2.23.1 / ALT 1.10.0

**Status:** `COMPLETE`
**Issue:** [#59](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/59)
**Baseline commit:** `8e48be8d6c7d281f4b3c84b3d57ce9cdeaa005a2`
**Target:** `main`
**Branch:** `codex/antigravity-2.23.1-compatibility`
**Prepared:** 2026-10-15

## Goal

Validate the installed Antigravity 2.23.1, register explicit support in ALT 1.10.0, and leave the owner's local installation localized.

## Non-goals

No merge, release branch, tag, Release, production upload, broad version range, or unrelated translation changes.

## Constraints

AGENTS.md is authoritative. Preserve blocked zones/tags and user-owned .codex-local/. Commit metadata fingerprints only, never official payloads. Require PASS/noMutation audit and stopped Antigravity before mutation. Register support only after exact apply/restore verification.

## Implementation steps

1. Sync origin/main, read rules and SOP, create branch and Issue.
2. Audit candidate profile and compare every injection target with 2.23.0.
3. Run synthetic checks and controlled real apply/verify/restore; confirm exact archive restoration and unchanged unpacked files.
4. Register verified version/fingerprint, bump ALT through npm version lifecycle, update documentation and tests.
5. Run core, packaging, Windows build and installer checks.
6. Apply locally, repeat apply, verify signatures, JavaScript syntax, same-version official backup and unpacked integrity.
7. Update results, commit/push, open PR to main.

## Acceptance criteria

Candidate audit PASS/noMutation/not-running; real apply/restore PASS with exact SHA-256 restoration; explicit support only; all required checks pass; final installation localized with exact official backup; PR created.

## Tests

`npm ci --ignore-scripts --no-fund`; `npm run check`; `npm run check:packaging`; `powershell -ExecutionPolicy Bypass -File build/windows/build.ps1 -Arch x64`; `npm run check:windows-installer`.

`node tools/compatibility-audit.js --profile v2-mainline-tray-onclick --require-not-running --json .build/audit-2.23.1.json --fingerprint .build/fingerprint-2.23.1.json`.

`node tools/verify-real-install.js --install-dir <local installation> --audit .build/audit-2.23.1.json --json .build/real-install-2.23.1.json`.

## Git/PR rules

Commit/push this branch, target main, update Execution Result. No merge/publication or changes to historical branches/tags/user-owned state.

## Execution Result

- Synced origin/main. Candidate audit PASS/noMutation/not-running for actual 2.23.1. All five injection targets are identical to 2.23.0; only package.json changed among audited members. Retained existing profile, anchors, selectors and blocked zones/tags.
- Controlled real apply/verify/restore PASS: main/wizard signatures, two menu application points and syntax verified. Exact official archive restored SHA-256 `b8ec3628df2a12ee9deac5dc06367f238065af146bfe6298fdad6db5f9790d9c`; restore removed backup.
- Official unpacked unchanged: 347 files, SHA-256 `a8362c897c0eb6f7f38171c2407d4428fd66864fe1e6581f182bf0740f544133`.
- Registered explicit support after real verification; committed fingerprint contains metadata only. npm version lifecycle synchronized package/runtime/Pages to ALT 1.10.0. Updated support documentation and compatibility/installer/payload coverage. Engine change is limited to ENGINE_VERSION.
- npm ci PASS, zero vulnerabilities. Core/dictionary/protected-zone/runtime/compatibility/transaction rollback/macOS process-safety checks PASS. Packaging/version/fixed asset/Release policy checks PASS. 2.23.1 valid fixture passes, changed tray rejected, unverified 2.23.2 remains blocked.
- Final local apply and repeat apply PASS. Final integrity PASS: five JavaScript members parse; single main/wizard signatures; two menu blocks; native closeContextMenu/tray onClick retained; logo overlay unchanged; exact same-version official backup retained; unpacked unchanged; no transaction artifacts. Final audit PASS/verifiedSupported/noMutation/not-running. Localized archive SHA-256 `0285e45862a32a42ea9a9631cf2c5fa583da8376c5056b74227615becf37d0fb`.
- No remote UI DOM or launch visual inspection, no macOS real-install verification. User-owned .codex-local/ untouched; no official payload committed. Initial GitHub CLI upstream-default issue misrouting was corrected: upstream #6 closed with explanation; ALT #59 is authoritative.
- Windows x64 Install/Restore build PASS (Inno Setup 6.7.3). Installer E2E PASS: 2.23.1 apply/repeat/restore, menu/tray translation and syntax, unchanged overlay/unpacked, process-bypass/missing-installation/unsupported-version rejection. git diff --check PASS.
- Implementation commit `8421bcf` pushed to origin. PR [#60](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/60) targets main; CI status is available on the PR. No merge or publication authorized.

### Owner-authorized merge and publication

- On 2026-10-15 the owner confirmed CI/build and requested publication, superseding the original no-merge/no-publication scope for this release.
- PR #60 exact head `304e59f` passed four CI jobs and merged at `4399c437414e76a8df10c7d091bf407b1d5cdcc3`. Main CI 38671739800 passed.
- Controlled Release 38671936319 succeeded. ALT 1.10.0 is published/latest with five fixed-name assets, matching checksums and five working permanent downloads.
- Full evidence: [ALT-1.10.0-RELEASE.md](ALT-1.10.0-RELEASE.md).
