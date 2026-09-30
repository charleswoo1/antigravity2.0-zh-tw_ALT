# Handoff / Implementation Contract — Antigravity 2.18.1 Compatibility

**Status:** `READY_FOR_REVIEW`
**Issue:** [#44](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/44)
**Target:** `main`
**Baseline commit:** `144b8ff`
**Implementation branch:** `codex/antigravity-2.18.1-compatibility`
**Prepared:** 2026-09-30

## 1. Goal

Add explicit, evidence-backed support for upstream Antigravity `2.18.1`, validate a separate asynchronous menu-refresh / logo-only loading profile, complete controlled real-install apply/restore verification, and prepare ALT `1.5.0`.

## 2. Non-goals

- Do not add a permissive semver range or automatically trust future upstream versions.
- Do not commit, upload, or publish the official `app.asar`, extracted official JavaScript, or another proprietary upstream payload.
- Do not redesign the localization engine or expand translation scope unrelated to `2.18.1` compatibility.
- Do not automatically merge the PR.
- Do not create a Git tag, GitHub Release, or production release asset.

## 3. Constraints

- `AGENTS.md` is authoritative.
- `.codex-local/` is user-owned local state and remains untracked and untouched.
- Read-only audit must not mutate the real installation.
- Real apply/restore may begin only after Antigravity is stopped and the audit is `PASS` with `noMutation: true`.
- A failed real verification must not add `2.18.1` to the verified manifest.
- The restored archive SHA-256 must equal the pre-apply SHA-256, and backup/temp artifacts must be absent.
- Committed fingerprints may contain only safe compatibility metadata; no proprietary source content.
- Existing `v2-mainline` versions retain their one-call menu profile; `2.16.0` and `2.17.0` retain their menu-refresh profile; `2.18.1` uses a separate logo-only overlay profile.

## 4. Implementation steps

1. Synchronize the latest remote `main`, read project rules, and create the feature branch.
2. Detect the real installed version from `resources/app.asar/package.json`.
3. Run the read-only compatibility audit and compare changed anchors and safe fingerprints against `2.17.0`.
4. After controlled verification succeeds, add the verified `2.18.1` manifest entry and metadata-only fingerprint using the new bounded logo-only overlay profile.
5. Update ALT version metadata, documentation, payload assertions, and compatibility tests.
6. Run core, packaging, Windows build, installer, and audit validation.
7. Confirm Antigravity is fully stopped.
8. Run controlled real apply → verify → restore.
9. Confirm exact restoration and absence of transactional artifacts.
10. Re-run the full local validation.
11. Commit, push, open a PR to `main`, and update this contract.

## 5. Acceptance criteria

- [x] Installed upstream version is read from the real `app.asar/package.json` and is `2.18.1`.
- [x] Read-only audit with `v2-mainline-logo-overlay` returns `PASS`, `noMutation: true`, and all required anchors match.
- [x] Safe `2.18.1` fingerprint contains no proprietary source content.
- [x] Controlled apply verifies main, IDE wizard, and both menu application points.
- [x] Controlled restore returns the exact original archive SHA-256.
- [x] Controlled restore leaves no backup or transactional temp artifact; the final user-facing apply retains the expected same-version official `.bak` backup and no transaction temp artifact.
- [x] `compatibility/manifest.json` explicitly lists verified `2.18.1` after controlled verification succeeds.
- [x] ALT version metadata is consistently updated to `1.5.0`.
- [x] README, compatibility documentation, GitHub Pages metadata, payload assertions, and tests identify `2.18.1`.
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
npm run audit:antigravity -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --profile v2-mainline-logo-overlay --require-not-running --json .build\audit-2.18.1.json
npm run verify:real-install -- --install-dir "$env:LOCALAPPDATA\Programs\antigravity" --audit .build\audit-2.18.1.json --json .build\real-install-2.18.1.json
```

## 7. Git and PR rules

- Work on `codex/antigravity-2.18.1-compatibility`, based on baseline `144b8ff`.
- Push to `origin` and open a PR targeting `main`.
- Do not merge the PR.
- Do not create tags, Releases, or production assets.
- CI remains validation-only with minimum permissions.

## 8. Execution Result

- Baseline: origin/main 144b8ff; local user-owned .codex-local/ untouched.
- Detected upstream version 2.18.1 directly from official app.asar/package.json.
- Initial read-only audit: REVIEW_REQUIRED; loading-overlay-text count changed from 1 to 0. No mutation.
- Reviewed overlay: text-free SVG logo with WebContentsView lifecycle. Other patch-member hashes (preload, menu, tray, wizard) identical to 2.17.0.
- Added v2-mainline-logo-overlay with strict text absence, logo/HTML/view anchors, required overlay member. Old profiles unchanged. Engine preserves logo-only overlay bytes.
- Controlled candidate audit: PASS, noMutation true, process not-running.
- Controlled apply/verify/restore: PASS; both menu application points and main/wizard signatures verified.
- Exact restored official archive SHA-256: 3c03ce352dc3c1b43f357c27ead1f73c74d198a8ded89b1b3d6a2539e7a6ac5c. Backup removed by restore.
- Official unpacked tree unchanged: 293 files; SHA-256 489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd.
- Added verified manifest entry only after controlled real verification succeeded; safe metadata-only fingerprint committed.
- ALT SemVer bumped independently to 1.5.0 using npm version lifecycle; runtime metadata synchronized.
- Final user apply and repeat apply: PASS; all five patched JavaScript members parse, two matching menu blocks, overlay bytes unchanged; same-version official backup retained. Final audit PASS, verifiedSupported true, noMutation true, not-running.
- npm ci: PASS, zero vulnerabilities. Core/protected-zone/runtime/compatibility/transactional/macOS safety checks: PASS. Packaging/version/release-policy tests: PASS.
- Windows x64 Install/Restore build: PASS. Windows installer E2E: PASS, including repeat install, unchanged logo overlay, exact restore, and unsupported-version gates. git diff --check: PASS.
- Implementation commit: eee40ae. Branch pushed to origin: codex/antigravity-2.18.1-compatibility.
- GitHub PR: [#45 — feat: support Antigravity 2.18.1 (ALT 1.5.0)](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/45); targets main; READY_FOR_REVIEW.
- No UI launch verification or real macOS installation verification performed in this Windows session.
- No automatic merge, release branch, tag, Release, production upload, or proprietary upstream payload committed.
