# Handoff / Implementation Contract — Antigravity 2.16.0 Compatibility

**Status:** `READY_FOR_REVIEW`  
**Issue:** [Follow-up to #27 — 支援 Antigravity 2.16.0 並完成新版中文化相容性驗證](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/27)  
**Target:** `main`  
**Baseline commit:** `a314cff`  
**Implementation branch:** `feature/antigravity-2.16.0-compatibility`  
**Prepared:** 2026-09-24

## 1. Goal

Add explicit, evidence-backed support for upstream Antigravity `2.16.0`, adapt menu localization to its asynchronous WSL menu refresh, preserve the compatibility safety boundary, and prepare ALT `1.3.0`.

## 2. Non-goals

- Do not add a permissive semver range or automatically trust future upstream versions.
- Do not commit, upload, or publish the official `app.asar`, extracted official JavaScript, or another proprietary upstream payload.
- Do not redesign the localization engine or expand translation scope unrelated to `2.16.0` compatibility.
- Do not automatically merge the PR.
- Do not create a Git tag, GitHub Release, or production release asset.

## 3. Constraints

- `AGENTS.md` is authoritative.
- `.codex-local/` is user-owned local state and remains untracked and untouched.
- Read-only audit must not mutate the real installation.
- Real apply/restore may begin only after Antigravity is stopped and the audit is `PASS` with `noMutation: true`.
- A failed real verification must not add `2.16.0` to the verified manifest.
- The restored archive SHA-256 must equal the pre-apply SHA-256, and backup/temp artifacts must be absent.
- Committed fingerprints may contain only safe compatibility metadata; no proprietary source content.
- Existing `v2-mainline` versions retain their one-call menu profile; `2.16.0` uses a separate two-call profile.

## 4. Implementation steps

1. Synchronize the latest remote `main` and create the feature branch.
2. Detect the real installed version from `resources/app.asar/package.json`.
3. Run the read-only compatibility audit and review changed anchors against `2.15.1`.
4. Add a bounded profile for the asynchronous menu refresh and update the menu patch to cover every validated application point.
5. Run core, packaging, Windows build, and installer validation.
6. Confirm Antigravity is fully stopped.
7. Run controlled real apply → verify → restore.
8. Confirm exact restoration and absence of transactional artifacts.
9. Add the verified manifest entry and safe fingerprint, bump ALT to `1.3.0`, and update documentation/tests.
10. Re-run the full local validation.
11. Commit, push, open a PR to `main`, and update this contract.

## 5. Acceptance criteria

- [x] Installed upstream version is read from the real `app.asar/package.json` and is `2.16.0`.
- [x] Read-only audit returns `PASS`, `noMutation: true`, and profile `v2-mainline-menu-refresh`.
- [x] All production anchors and required unpacked paths match the bounded profile.
- [x] Safe `2.16.0` fingerprint contains no proprietary source content.
- [x] Both menu application points receive the idempotent translation patch, including WSL menu labels.
- [x] Controlled apply verifies main and IDE wizard localization signatures.
- [x] Controlled restore returns the exact original archive SHA-256.
- [x] No backup or transactional temp artifact remains.
- [x] `compatibility/manifest.json` explicitly lists verified `2.16.0`.
- [x] ALT version metadata is consistently updated to `1.3.0`.
- [x] README, compatibility documentation, GitHub Pages metadata, payload assertions, and tests identify `2.16.0`.
- [x] Implementation is committed, pushed, and opened as a PR without automatic merge or release.

## 6. Tests

Required local validation:

```powershell
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
npm run check:windows-installer
```

Real-install verification:

```powershell
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --profile v2-mainline-menu-refresh --json .build\audit-2.16.0.json --fingerprint .build\fingerprint-2.16.0.json
npm run verify:real-install -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --audit .build\audit-2.16.0.json --json .build\real-install-2.16.0.json
```

## 7. Git and PR rules

- Work on `feature/antigravity-2.16.0-compatibility`, based on baseline `a314cff`.
- Push to `origin` and open a PR targeting `main`.
- Do not merge the PR.
- Do not create tags, Releases, or production assets.
- CI remains validation-only with minimum permissions.

## 8. Execution Result

**Detected evidence**

- Remote `origin/main` synchronized to `a314cff`; `.codex-local/` remained untouched and untracked.
- Real installed version: `2.16.0`, read directly from the official `resources/app.asar/package.json`.
- Official archive size: `4620804`; SHA-256: `053e8dce84698f8dc295ba7caa9d1e3879e49da3f63a9b54159eef43d607e24e`.
- Initial default-profile audit correctly returned `REVIEW_REQUIRED`: `menu-set-application-menu` changed from one occurrence to two.
- Review confirmed the second occurrence re-applies the menu after the asynchronous WSL submenu is added. The new bounded profile requires both application points plus the `Connect to WSL` and `Reopen Locally` labels.
- With profile `v2-mainline-menu-refresh`, read-only audit returned `PASS`, `noMutation: true`; all required members, anchors, and unpacked paths matched.
- Compared with `2.15.1`, package metadata, `dist/preload.js`, `dist/menu.js`, and `dist/tray.js` changed; `dist/loadingOverlay.js` and `dist/ideInstall/wizardPreload.js` retained their prior safe fingerprints.

**Controlled real-install verification**

- Antigravity process count before mutation: `0`.
- Apply: `PASS`; version `2.16.0`, main localization signature present, IDE wizard signature present.
- Both validated menu application points contained isolated translation blocks; applied `menu.js` passed JavaScript syntax validation.
- WSL labels added as `Connect to WSL` → `連線至 WSL` and `Reopen Locally` → `在本機重新開啟`.
- Official unpacked structure remained unchanged: 293 files; aggregate SHA-256 `489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd`.
- Restore: `PASS`; final archive version `2.16.0`, official/unlocalized.
- Final archive SHA-256 exactly matched the pre-apply value: `053e8dce84698f8dc295ba7caa9d1e3879e49da3f63a9b54159eef43d607e24e`.
- Final `.bak`, `.pre-localization`, `.localized.tmp`, `.restore.tmp`, and unpacked transaction artifact checks: all absent.
- Final verified audit: `PASS`, `verifiedSupported: true`, `processState: not-running`, `noMutation: true`.

**Implementation**

- Added `v2-mainline-menu-refresh`, the verified `2.16.0` manifest entry, and a metadata-only safe fingerprint.
- Updated menu injection to patch every profile-validated menu application point and to clean multiple prior translation blocks idempotently.
- Added real-install verification for menu block count and JavaScript syntax.
- Updated synthetic compatibility and Windows installer E2E tests for the two-point menu lifecycle and repeat installation.
- Bumped independent ALT SemVer from `1.2.1` to `1.3.0` with `npm version --no-git-tag-version`; runtime engine and GitHub Pages metadata synchronized.
- Updated README, compatibility documentation, payload assertions, and verified-version tests.

**Validation**

- `npm ci --ignore-scripts --no-fund`: PASS; 0 vulnerabilities.
- `npm run check`: PASS.
- `npm run check:packaging`: PASS.
- Windows x64 Install and Restore installer build: PASS with Inno Setup 6.7.3.
- `npm run check:windows-installer`: PASS, including two menu injection blocks, syntax validation, repeat install, restore, and unsupported-version gates.
- `git diff --check`: PASS.

**GitHub handoff**

- Implementation commit: `e9f4d72` (`feat: support Antigravity 2.16.0`).
- Branch: `feature/antigravity-2.16.0-compatibility`.
- Pull request: [#37 — feat: support Antigravity 2.16.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/37).
- No merge, tag, GitHub Release, production asset upload, or proprietary upstream payload was performed.
