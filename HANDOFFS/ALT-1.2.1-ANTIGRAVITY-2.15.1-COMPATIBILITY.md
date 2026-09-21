# Handoff / Implementation Contract — Antigravity 2.15.1 Compatibility

**Status:** `IN_PROGRESS`  
**Issue:** [Follow-up to #27 — 支援 Antigravity 2.15.1 並完成新版中文化相容性驗證](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/27)  
**Target:** `main`  
**Baseline commit:** `4347f80`  
**Implementation branch:** `feature/antigravity-2.15.1-compatibility`  
**Prepared:** 2026-09-21

## 1. Goal

Add explicit, evidence-backed support for upstream Antigravity `2.15.1`, preserve the compatibility safety boundary, and prepare the corresponding ALT `1.2.1` patch release.

## 2. Non-goals

- Do not add a permissive semver range or automatically trust future upstream versions.
- Do not commit, upload, or publish the official `app.asar`, extracted official JavaScript, or another proprietary upstream payload.
- Do not redesign the localization engine or expand translation scope unrelated to `2.15.1` compatibility.
- Do not automatically merge the PR.
- Do not create a Git tag, GitHub Release, or production release asset.

## 3. Constraints

- `AGENTS.md` is authoritative.
- `.codex-local/` is user-owned local state and remains untracked and untouched.
- Read-only audit must not mutate the real installation.
- Real apply/restore may begin only after Antigravity is stopped and the audit is `PASS` with `noMutation: true`.
- A failed real verification must not add `2.15.1` to the verified manifest.
- The restored archive SHA-256 must equal the pre-apply SHA-256, and backup/temp artifacts must be absent.
- Committed fingerprints may contain only safe compatibility metadata; no proprietary source content.

## 4. Implementation steps

1. Synchronize the latest remote `main` and create the feature branch.
2. Detect the real installed version from `resources/app.asar/package.json`.
3. Run the read-only compatibility audit and compare safe fingerprints with `2.15.0`.
4. Run core, packaging, Windows build, and installer validation.
5. Confirm Antigravity is fully stopped.
6. Run controlled real apply → verify → restore.
7. Confirm exact restoration and absence of transactional artifacts.
8. Add the verified manifest entry and safe fingerprint, bump ALT to `1.2.1`, and update documentation/tests.
9. Re-run the full local validation.
10. Commit, push, open a PR to `main`, and update this contract.

## 5. Acceptance criteria

- [x] Installed upstream version is read from the real `app.asar/package.json` and is `2.15.1`.
- [x] Read-only audit returns `PASS`, `noMutation: true`, and `profile: v2-mainline`.
- [x] All production anchors and required unpacked paths match the existing profile.
- [x] Safe `2.15.1` fingerprint contains no proprietary source content.
- [x] Controlled apply verifies main and IDE wizard localization signatures.
- [x] Controlled restore returns the exact original archive SHA-256.
- [x] No backup or transactional temp artifact remains.
- [x] `compatibility/manifest.json` explicitly lists verified `2.15.1`.
- [x] ALT version metadata is consistently updated to `1.2.1`.
- [x] README, compatibility documentation, GitHub Pages metadata, payload assertions, and tests identify `2.15.1`.
- [ ] Implementation is committed, pushed, and opened as a PR without automatic merge or release.

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
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --json .build\audit-2.15.1.json --fingerprint .build\fingerprint-2.15.1.json
npm run verify:real-install -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --audit .build\audit-2.15.1.json --json .build\real-install-2.15.1.json
```

## 7. Git and PR rules

- Work on `feature/antigravity-2.15.1-compatibility`, based on baseline `4347f80`.
- Push to `origin` and open a PR targeting `main`.
- Do not merge the PR.
- Do not create tags, Releases, or production assets.
- CI remains validation-only with minimum permissions.

## 8. Execution Result

**Detected evidence**

- Remote `origin/main` synchronized to `4347f80`; `.codex-local/` remained untouched and untracked.
- Real installed version: `2.15.1`, read directly from the official `resources/app.asar/package.json`.
- Initial official archive SHA-256: `0f81685e9836ddf5a382869bea348385650cfe1bfeecbd2e2d902a571ce57261`.
- Read-only audit: `PASS`, `noMutation: true`, profile `v2-mainline`, initially a structurally compatible candidate.
- Compared with `2.15.0`, `dist/preload.js`, `dist/menu.js`, `dist/tray.js`, `dist/loadingOverlay.js`, `dist/ideInstall/wizardPreload.js`, anchors, and unpacked structure were unchanged; only package metadata and full archive checksum differed.

**Controlled real-install verification**

- Antigravity process count before mutation: `6`; all were stopped before the mutation stage.
- Apply: `PASS`; detected version `2.15.1`, main localization signature present, IDE wizard signature present.
- Official unpacked structure remained unchanged: 293 files; aggregate SHA-256 `489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd`.
- Restore: `PASS`; final archive version `2.15.1`, official/unlocalized.
- Final archive SHA-256 exactly matched the pre-apply value: `0f81685e9836ddf5a382869bea348385650cfe1bfeecbd2e2d902a571ce57261`.
- Final `.bak`, `.pre-localization`, `.localized.tmp`, `.restore.tmp`, and unpacked transaction artifact checks: all absent.
- Final audit: `PASS`, `verifiedSupported: true`, process count `0`.

**Implementation**

- Added verified `2.15.1` manifest entry and safe metadata-only fingerprint.
- Updated core, payload, packaging, and smoke allowlist assertions.
- Bumped independent ALT SemVer from `1.2.0` to `1.2.1` using `npm version --no-git-tag-version`; runtime engine and GitHub Pages metadata synchronized automatically.
- Updated README and compatibility documentation.

**Validation**

- `npm ci --ignore-scripts --no-fund`: PASS; 0 vulnerabilities.
- `npm run check`: PASS.
- `npm run check:packaging`: PASS.
- Windows x64 Install and Restore installer build: PASS with Inno Setup 6.7.3.
- `npm run check:windows-installer`: PASS.
- `git diff --check`: PASS.

**GitHub handoff**

- Pending commit, push, PR, and final contract status update.
