# Handoff / Implementation Contract — Antigravity 2.15.0 Compatibility

**Status:** `IN_PROGRESS`  
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

- [ ] The real installed version is recorded from `app.asar/package.json`, not trusted from conversation.
- [ ] Read-only audit returns `PASS` and `noMutation: true` for `2.15.0`.
- [ ] All production patch anchors and required unpacked paths are present with expected counts.
- [ ] The safe `2.15.0` fingerprint contains no proprietary source content.
- [ ] Synthetic core, compatibility, protected-zone, packaging, and version-metadata tests pass.
- [ ] Controlled real apply verifies the main localization signature and IDE wizard signature where applicable.
- [ ] Controlled restore returns the exact original archive SHA-256.
- [ ] No `.bak`, shadow, or transactional temp artifact remains after verification.
- [ ] `compatibility/manifest.json` explicitly lists `2.15.0` only after real verification succeeds.
- [ ] ALT version metadata is consistently updated to `1.2.0`.
- [ ] README and compatibility documentation identify `2.15.0` as supported and retain the future-update safety guidance.
- [ ] No official Antigravity proprietary payload is committed.
- [ ] The implementation is committed, pushed, and opened as a PR without automatic merge or release.

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

Pending. This section will record detected evidence, implementation changes, test commands and results, real apply/restore proof, commit, and PR URL before the contract moves to `READY_FOR_REVIEW`.
