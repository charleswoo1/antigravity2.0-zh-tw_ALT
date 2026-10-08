# Handoff — Antigravity 2.21.0 / 2.21.1 / ALT 1.7.0

**Status:** `READY_FOR_REVIEW`
**Issue:** [#51](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/51)
**Baseline commit:** `bdec683a1dac5ebd912d883aec9b17c63d99ddc9`
**Target:** `main`
**Branch:** `codex/antigravity-2.21.0-compatibility`
**Prepared:** 2026-10-08

## Goal

Validate installed Antigravity 2.21.0 and 2.21.1, explicitly support both in the unreleased ALT 1.7.0, and leave the user's installation localized. On 2026-10-08 the owner requested 2.21.1 localization and continuation in the same PR #52; the trailing 2.221.1 in the request is resolved against the actual installed 2.21.1 version.

## Non-goals

No automatic merge, release branch, tag, Release, production upload, permissive version range, or unrelated translation changes.

## Constraints

AGENTS.md is authoritative. Preserve all blocked zones/tags and user-owned .codex-local/. Commit metadata fingerprints only, never official proprietary payloads. Real mutation requires PASS/noMutation audit and stopped Antigravity; user confirmed closure. Register verified support only after exact apply/restore verification.

## Implementation steps

1. Fetch origin/main, read project rules, create short-lived branch and GitHub Issue.
2. Detect official archive version, audit candidate profile, compare member hashes and inspect changed preload/DOM assumptions.
3. Run controlled real apply/verify/restore and verify exact archive restoration and unpacked integrity.
4. Add explicit manifest/fingerprint, bump ALT via npm version lifecycle, update documentation and meaningful compatibility/installer checks.
5. Run core, packaging, Windows build/installer verification.
6. Apply localization for user, verify repeat apply, signatures, syntax, unchanged overlay and retained same-version official backup.
7. Update Execution Result, commit/push and open PR to main.

## Acceptance criteria

- Official installed versions 2.21.0 and 2.21.1; candidate audit PASS/noMutation.
- Controlled apply/restore PASS, exact SHA-256 restoration, no transaction artifacts.
- Explicit verified support, safe fingerprint, consistent ALT 1.7.0 metadata.
- Protected zones retained and verified; local tests and Windows build/installer pass.
- Final real installation localized with same-version official backup.
- GitHub PR created, no automatic merge/publication.

## Tests

`npm ci --ignore-scripts --no-fund`; `npm run check`; `npm run check:packaging`; `powershell -ExecutionPolicy Bypass -File build/windows/build.ps1 -Arch x64`; `npm run check:windows-installer`.

`node tools/compatibility-audit.js --profile v2-mainline-tray-onclick --require-not-running --json .build/audit-2.21.0.json --fingerprint .build/fingerprint-2.21.0.json`.

`node tools/verify-real-install.js --install-dir <local installation> --audit .build/audit-2.21.0.json --json .build/real-install-2.21.0.json`.

## Git/PR rules

Push this branch to origin, PR targets main, update contract results. Do not merge or publish. Do not touch historical branches/tags or user-owned local state.

## 2.21.1 continuation

Use the same Issue #51, branch and PR #52. Keep ALT 1.7.0 because it has not been merged or released. Fetch origin/main and inspect current PR before continuation. Audit 2.21.1 using the existing profile, require stopped processes, run controlled real apply/verify/restore with `.build/audit-2.21.1.json` and `.build/real-install-2.21.1.json`, then register the explicit version/fingerprint. Update support documentation, version metadata and compatibility/installer cases; rerun core, packaging, Windows build and installer validation. Finally leave real 2.21.1 localized with an exact same-version official backup and update the existing PR title/body and Issue scope.

## Execution Result

- Detected official 2.21.0 from installed app.asar/package.json. Candidate audit PASS, noMutation true, not-running after user confirmed closure.
- Reused v2-mainline-tray-onclick without relaxing anchors. menu/tray/loadingOverlay/wizard hashes identical to 2.19.1; reviewed updated preload native APIs and verified closeContextMenu survives injection.
- Controlled real apply/verify/restore PASS: main/wizard signatures and both menu application points verified.
- Exact original/restored archive SHA-256: 4670619d8a5082263366842b0438fb1bb6e16a871ea28be10abf12825287c37a. Restore removed backup and left no transaction artifacts.
- Official unpacked tree unchanged: 293 files, SHA-256 489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd.
- Registered verified manifest/fingerprint only after controlled real verification passed. ALT 1.7.0 synchronized using npm version lifecycle, including runtime and Pages metadata.
- npm ci PASS, zero vulnerabilities. Core, dictionary, protected zones, runtime, compatibility, transactional replacement and macOS process-safety checks PASS. Packaging, version, fixed asset naming and Release policy checks PASS.
- Windows x64 Install/Restore build PASS. Installer E2E PASS for 2.21.0 install/repeat/restore, onClick preservation, translated count label, unchanged logo overlay and unsupported-version rejection. Updated fixture includes the required insertTrayMenuItem anchor.
- Final user-facing install and repeat install PASS. Five patched JS members parse, preload has one signature, menu has two injection blocks, logo overlay bytes unchanged, same-version official backup SHA-256 matches fingerprint, no transaction temp artifacts. Final audit PASS, verifiedSupported true, noMutation true, not-running.
- Engine change limited to ENGINE_VERSION; all blocked zones/tags and editable protections retained. No actual remote UI DOM/visual launch inspection or real macOS installation validation performed.
- git diff --check PASS. User-owned .codex-local/ untouched. No official proprietary payload committed; no automatic merge/publication.
- GitHub Issue #51 tracks this contract. An Issue mistakenly created in the CLI-default upstream repository was closed; all implementation GitHub operations explicitly target the ALT repository.
- Implementation commit: 53ae56f; pushed to origin/codex/antigravity-2.21.0-compatibility.
- PR: [#52](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/52), targeting main. GitHub CI runs validation only; status available on PR. No automatic merge or release authorized.

### 2.21.1 execution result (2026-10-08)

- Continued from commit 3c6544e on the same branch/PR, per owner request. Fetched origin/main (still bdec683); prior PR head had all four CI jobs PASS (Ubuntu core, Windows installer, macOS x64/arm64 build).
- Detected official installed 2.21.1, unlocalized with no backup. Process not-running. Candidate audit PASS/noMutation true. All five patch-target hashes identical to 2.21.0; only package.json hash changed among audited members. No profile, injection logic, dictionary, selector or blocked-zone/tag changes needed.
- Controlled real apply/verify/restore PASS. Main/wizard signatures and both menu application points verified; exact official archive SHA-256 restored: d075e5d9ff01f8806016aa88c39bf1429f068a941fdbe46147d8409843e62113. Backup removed by controlled restore.
- Official unpacked tree unchanged: 293 files, SHA-256 489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd.
- Added explicit verified 2.21.1 manifest entry and metadata-only fingerprint after controlled verification. ALT remains unreleased 1.7.0; sync:version updated Pages support summary. README/COMPATIBILITY and payload allowlist assertions updated.
- Final real 2.21.1 install and repeat install PASS. Final audit PASS/verifiedSupported/noMutation/not-running. All five JS members parse; preload single signature; menu two translation blocks; native closeContextMenu and tray onClick retained; Agent count translation present; logo overlay bytes unchanged. Exact same-version official backup retained, no transaction artifacts.
- Core, dictionary, protected-zone/runtime, compatibility (both 2.21.0/2.21.1 success and changed-tray rejection; unknown 2.21.2 rejected), transactional replacement, macOS process-safety, packaging, version and release-policy checks PASS.
- Rebuilt Windows x64 Install/Restore payload with 2.21.1 support: PASS. Updated 2.21.1 Windows installer E2E PASS, including install/repeat/restore, tray signature/translation/syntax, unchanged overlay and unsupported-version gates. git diff --check PASS.
- Updated existing Issue #51 and PR #52 title/body to cover both upstream versions in ALT 1.7.0. No new PR, merge or publication. User-owned .codex-local/ untouched; no proprietary payload committed. Remote UI DOM/visual launch and macOS real-install limitations remain.
