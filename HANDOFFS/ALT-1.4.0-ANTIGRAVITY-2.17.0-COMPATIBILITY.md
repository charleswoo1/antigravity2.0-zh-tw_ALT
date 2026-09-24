# Handoff / Implementation Contract — Antigravity 2.17.0 Compatibility

**Status:** `READY_FOR_REVIEW`
**Issue:** User request — 本機 Antigravity 2.17.0 中文化升級
**Target:** `main`
**Baseline commit:** `267966f`
**Implementation branch:** `feature/antigravity-2.17.0-compatibility`
**Prepared:** 2026-09-24

## 1. Goal

Add explicit, evidence-backed support for upstream Antigravity `2.17.0`, reuse the validated asynchronous WSL menu-refresh profile where the installed structure is unchanged, complete controlled real-install apply/restore verification, and prepare ALT `1.4.0`.

## 2. Non-goals

- Do not add a permissive semver range or automatically trust future upstream versions.
- Do not commit, upload, or publish the official `app.asar`, extracted official JavaScript, or another proprietary upstream payload.
- Do not redesign the localization engine or expand translation scope unrelated to `2.17.0` compatibility.
- Do not automatically merge the PR.
- Do not create a Git tag, GitHub Release, or production release asset.

## 3. Constraints

- `AGENTS.md` is authoritative.
- `.codex-local/` is user-owned local state and remains untracked and untouched.
- Read-only audit must not mutate the real installation.
- Real apply/restore may begin only after Antigravity is stopped and the audit is `PASS` with `noMutation: true`.
- A failed real verification must not add `2.17.0` to the verified manifest.
- The restored archive SHA-256 must equal the pre-apply SHA-256, and backup/temp artifacts must be absent.
- Committed fingerprints may contain only safe compatibility metadata; no proprietary source content.
- Existing `v2-mainline` versions retain their one-call menu profile; `2.16.0` and `2.17.0` use the separate two-call profile.

## 4. Implementation steps

1. Synchronize the latest remote `main`, read project rules, and create the feature branch.
2. Detect the real installed version from `resources/app.asar/package.json`.
3. Run the read-only compatibility audit and compare changed anchors and safe fingerprints against `2.16.0`.
4. Add the verified `2.17.0` manifest entry and metadata-only fingerprint using the existing bounded menu-refresh profile.
5. Update ALT version metadata, documentation, payload assertions, and compatibility tests.
6. Run core, packaging, Windows build, installer, and audit validation.
7. Confirm Antigravity is fully stopped.
8. Run controlled real apply → verify → restore.
9. Confirm exact restoration and absence of transactional artifacts.
10. Re-run the full local validation.
11. Commit, push, open a PR to `main`, and update this contract.

## 5. Acceptance criteria

- [x] Installed upstream version is read from the real `app.asar/package.json` and is `2.17.0`.
- [x] Read-only audit with `v2-mainline-menu-refresh` returns `PASS`, `noMutation: true`, and all required anchors match.
- [x] Safe `2.17.0` fingerprint contains no proprietary source content.
- [x] Controlled apply verifies main, IDE wizard, and both menu application points.
- [x] Controlled restore returns the exact original archive SHA-256.
- [x] Controlled restore leaves no backup or transactional temp artifact; the final user-facing apply retains the expected same-version official `.bak` backup and no transaction temp artifact.
- [x] `compatibility/manifest.json` explicitly lists verified `2.17.0` after controlled verification succeeds.
- [x] ALT version metadata is consistently updated to `1.4.0`.
- [x] README, compatibility documentation, GitHub Pages metadata, payload assertions, and tests identify `2.17.0`.
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
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --profile v2-mainline-menu-refresh --require-not-running --json .build\audit-2.17.0.json
npm run verify:real-install -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --audit .build\audit-2.17.0.json --json .build\real-install-2.17.0.json
```

## 7. Git and PR rules

- Work on `feature/antigravity-2.17.0-compatibility`, based on baseline `267966f`.
- Push to `origin` and open a PR targeting `main`.
- Do not merge the PR.
- Do not create tags, Releases, or production assets.
- CI remains validation-only with minimum permissions.

## 8. Execution Result

**Detected evidence**

- Remote `origin/main` synchronized to `267966f`; `.codex-local/` remained untouched and untracked.
- Real installed version: `2.17.0`, read directly from the official `resources/app.asar/package.json`.
- Initial default-profile audit returned `REVIEW_REQUIRED` because `menu-set-application-menu` changed from one occurrence to two.
- Review confirmed the 2.17.0 archive matches the existing asynchronous menu-refresh profile: both menu application points, WSL labels, Tray anchors, loading overlay, IDE wizard, and required unpacked path matched.
- Read-only audit with `v2-mainline-menu-refresh` returned `PASS`, `noMutation: true`; archive size is `4621906` and SHA-256 is `85c97057c762f01fe9fa8b0380f8055ff76344ceb47c840cd3d8d43aa035142b`.

**Controlled real-install verification**

- Process state before mutation: `not-running`.
- Apply: `PASS`; version `2.17.0`, main localization signature present, IDE wizard signature present, and both menu application points injected.
- Official unpacked structure remained unchanged: 293 files; aggregate SHA-256 `489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd`.
- Restore: `PASS`; final archive version `2.17.0`, official/unlocalized.
- Final restored archive SHA-256 exactly matched the pre-apply value: `85c97057c762f01fe9fa8b0380f8055ff76344ceb47c840cd3d8d43aa035142b`.
- Controlled restore removed `.bak` and transaction artifacts.
- Final user-requested apply: `PASS`; installed archive is localized with same-version official `.bak` retained for restore; final audit remained `PASS`, `noMutation: true`, and `processState: not-running`.

**Implementation**

- Added the verified `2.17.0` manifest entry and metadata-only safe fingerprint.
- Reused the existing bounded `v2-mainline-menu-refresh` profile; no protected-zone or selector expansion was needed.
- Bumped independent ALT SemVer from `1.3.0` to `1.4.0` with `npm version --no-git-tag-version`; runtime engine and GitHub Pages metadata synchronized.
- Updated README, compatibility documentation, payload assertions, and compatibility/installer tests.

**Validation**

- `npm ci --ignore-scripts --no-fund`: PASS; 0 vulnerabilities.
- `npm run check`: PASS.
- `npm run check:packaging`: PASS.
- Windows x64 Install and Restore installer build: PASS with Inno Setup 6.7.3.
- `npm run check:windows-installer`: PASS, including 2.17.0 two-point menu injection, repeat install, restore, and unsupported-version gates.
- Final read-only audit: `PASS`, version `2.17.0`, profile `v2-mainline-menu-refresh`, `noMutation: true`.
- `git diff --check`: PASS.

**GitHub handoff**

- Pending commit, push, PR, and final contract update.
