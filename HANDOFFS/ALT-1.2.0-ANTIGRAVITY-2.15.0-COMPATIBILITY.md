# Handoff / Implementation Contract — Antigravity 2.15.0 Compatibility

**Status:** `READY_FOR_REVIEW`  
**Issue:** [#27 — 支援 Antigravity 2.15.0 並完成新版中文化相容性驗證](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/27)  
**Target:** `main`  
**Baseline commit:** `0ccdc6409d296b9dd2a3d5b6acf828074014e591`  
**Implementation branch:** `feature/antigravity-2.15.0-compatibility`  
**Prepared:** 2026-09-19

## 1. Status and observed baseline

The real local Antigravity installation was inspected after synchronizing `main`.

- detected upstream version: `2.15.0`;
- archive state: official and not localized;
- read-only audit: `PASS`;
- `noMutation`: `true`;
- compatibility profile: `v2-mainline`;
- existing structural members and patch anchors: matched;
- existing transactional artifacts: absent;
- verified allowlist status at task start: not supported.

The audit result establishes only a structurally compatible candidate. It does not authorize localization or a manifest change until the controlled verification in this contract passes.

## 2. Goal

Add explicit, evidence-backed support for upstream Antigravity `2.15.0` and prepare the corresponding ALT `1.2.0` change without weakening the compatibility safety boundary.

The completed work must:

1. preserve the explicit upstream-version allowlist;
2. retain only safe metadata for the real `2.15.0` fingerprint;
3. verify current localization anchors and protected-zone behavior with synthetic tests;
4. perform a controlled real apply, post-apply verification, and exact restore;
5. update version metadata, user documentation, and tests consistently;
6. return the implementation through a reviewed PR to `main`.

## 3. Non-goals

- Do not add a permissive semver range or automatically trust future upstream versions.
- Do not commit, upload, or publish the official `app.asar`, extracted official JavaScript, or another proprietary upstream payload.
- Do not redesign the localization engine or expand translation scope unrelated to `2.15.0` compatibility.
- Do not automatically merge the PR.
- Do not create a Git tag, GitHub Release, or production release asset.
- Do not delete long-term branches, tags, Releases, or rewrite Git history.

## 4. Constraints

- `AGENTS.md` is authoritative over this contract.
- The real installation must remain unmodified during read-only audit and fingerprint comparison.
- Real apply/restore may begin only when Antigravity is confirmed fully stopped and the audit is `PASS` with `noMutation: true`.
- A failed real verification must not add `2.15.0` to the verified manifest.
- Every mutation-stage failure must roll back to the original official archive.
- The restored archive SHA-256 must equal the pre-apply SHA-256, and backup/temp artifacts must be absent.
- Fingerprints committed to Git may contain only safe metadata already defined by the compatibility framework.
- `.codex-local/` is user-owned local state and must remain untracked and untouched.

## 5. Implementation steps

1. Synchronize and record the latest remote `main` baseline.
2. Run the real-install read-only compatibility audit for the detected version.
3. Compare the `2.14.0` and `2.15.0` safe fingerprints and review every production patch anchor.
4. Review the existing translation dictionaries and protected-zone rules against the current localization scope.
5. Add or update synthetic tests for the explicit `2.15.0` allowlist and packaging metadata.
6. Run core and packaging validation before real mutation.
7. Confirm Antigravity is fully stopped.
8. Run controlled real apply → verify → restore using the audited archive.
9. Confirm exact SHA-256 restoration and absence of backup/temp artifacts.
10. Only after steps 1–9 pass, add `2.15.0` to the manifest, commit its safe fingerprint, update ALT to `1.2.0`, and update user-facing documentation.
11. Re-run the full required local validation.
12. Commit, push, open a PR to `main`, and update this contract's Execution Result and status.

## 6. Acceptance criteria

- [x] The real installed version is recorded from `app.asar/package.json`, not trusted from conversation.
- [x] Read-only audit returns `PASS` and `noMutation: true` for `2.15.0`.
- [x] All production patch anchors and required unpacked paths are present with expected counts.
- [x] The safe `2.15.0` fingerprint contains no proprietary source content.
- [x] Synthetic core, compatibility, protected-zone, packaging, and version-metadata tests pass.
- [x] Controlled real apply verifies the main localization signature and IDE wizard signature where applicable.
- [x] Controlled restore returns the exact original archive SHA-256.
- [x] No `.bak`, shadow, or transactional temp artifact remains after verification.
- [x] `compatibility/manifest.json` explicitly lists `2.15.0` only after real verification succeeds.
- [x] ALT version metadata is consistently updated to `1.2.0`.
- [x] README and compatibility documentation identify `2.15.0` as supported and retain the future-update safety guidance.
- [x] No official Antigravity proprietary payload is committed.
- [x] The implementation is committed, pushed, and opened as a PR without automatic merge or release.

## 7. Tests

Required local validation:

```powershell
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
npm run check:windows-installer
```

Required real-install verification:

```powershell
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --json .build\audit-2.15.0.json --fingerprint .build\fingerprint-2.15.0.json
npm run verify:real-install -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --audit .build\audit-2.15.0.json --json .build\real-install-2.15.0.json
```

The real-install report and final filesystem checks must prove exact restoration.

## 8. Git and PR rules

- Work only on `feature/antigravity-2.15.0-compatibility`, created from the recorded `main` baseline.
- Keep commits focused and include the contract result before review handoff.
- Push to `origin` and open a PR targeting `main`, linked to Issue #27.
- Do not merge the PR.
- Do not create tags, Releases, or production assets.
- CI remains validation-only with existing minimum permissions.

## 9. Execution Result

**Detected evidence**

- Real installed version: `2.15.0`, read from the official `app.asar/package.json`.
- Initial state: official/unlocalized archive; no backup, shadow, or transactional temp artifacts.
- Read-only audit: `PASS`, `noMutation: true`, profile `v2-mainline`, structurally compatible candidate.
- Official archive SHA-256: `bde8b6f7602b58974f250a4fd4cf21df8575daa1e60b0aa66168c9d12c2d9639`.
- Safe fingerprint comparison against `2.14.0`: the localization-scope `preload.js`, `menu.js`, `tray.js`, `loadingOverlay.js`, and `wizardPreload.js` sizes and SHA-256 values are unchanged; every production anchor remains present exactly once. Differences are limited to the complete archive and package version metadata.

**Controlled real-install verification**

- Antigravity process count immediately before mutation: `0`.
- Apply: `PASS`; detected version `2.15.0`, main localization signature present, IDE wizard signature present.
- Official unpacked structure remained unchanged: 293 files; aggregate SHA-256 `489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd`.
- Restore: `PASS`; final archive version `2.15.0`, official/unlocalized.
- Final archive SHA-256 exactly matches the pre-apply value: `bde8b6f7602b58974f250a4fd4cf21df8575daa1e60b0aa66168c9d12c2d9639`.
- Final `.bak`, `.pre-localization`, `.localized.tmp`, and `.restore.tmp` checks: all absent.

**Implementation**

- Added `2.15.0` as an explicit verified manifest entry with a safe metadata-only fingerprint.
- Updated allowlist assertions in core, compatibility, payload, and packaging tests.
- Updated independent ALT SemVer metadata and user-facing documentation to `1.2.0`.
- Fixed Windows PowerShell 5.1 build and release-staging scripts to read the UTF-8 `package.json` explicitly. The first Windows build exposed this pre-existing ANSI decoding failure; regression assertions now protect both scripts.

**Validation**

- `npm ci --ignore-scripts --no-fund`: `PASS` (`0 vulnerabilities`).
- `npm run check`: `PASS`.
- `npm run check:packaging`: `PASS`.
- Windows x64 Install and Restore installer build: `PASS` with Inno Setup 6.7.3.
- `npm run check:windows-installer`: `PASS`.
- Isolated Windows fixed-name Release staging validation: `PASS`; three expected files only. No production Release was created or uploaded.
- `git diff --check`: `PASS`.

**GitHub handoff**

- Contract commit: `ac00675`.
- Implementation commit: `b4ee609`.
- Branch: `feature/antigravity-2.15.0-compatibility`.
- Pull request: [#28 — feat: support Antigravity 2.15.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/28).
- No merge, tag, GitHub Release, production asset upload, or proprietary upstream payload was performed.
