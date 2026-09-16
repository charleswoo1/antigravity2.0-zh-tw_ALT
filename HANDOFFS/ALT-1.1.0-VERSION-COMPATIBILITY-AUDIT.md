# Handoff / Implementation Contract — Antigravity Version Compatibility Audit Framework + Installer Diagnostics

**Status:** `READY_FOR_CODEX`  
**Issue:** #10 — Add version compatibility audit framework and fix Windows installer diagnostics  
**Target:** `main`  
**Functional baseline commit:** `fffaccc59e8c8a3674e440033356e4c450fc2127`  
**Suggested implementation branch:** `feature/version-compatibility-audit`  
**Prepared:** 2026-09-16

## 1. Context

ALT 1.0.0 currently treats Antigravity `2.13.0` as the only supported upstream version through a single hard-coded value in `localization_engine.js`.

The latest local-machine inspection supplied before this contract reported:

- installed Antigravity: `2.14.0`
- localization: not applied
- `app.asar.bak`: absent
- Antigravity process: not running

The user initially referred to a newer version number in conversation, but **the implementation must not trust a conversational version label**. At execution time Codex must detect the installed version from the real local `app.asar/package.json`, record the detected value, and use that as the audit target. If it is no longer 2.14.0, record the mismatch and run the same framework against the actually detected version.

A Windows installer error dialog also showed only a generic failure similar to:

`ALT Install 失敗（exit code 1）。請查看：...\last-Install.log`

Codex later confirmed that the inspected log contained the synthetic Windows installer E2E negative-test path:

`...\antigravity-alt-installer-...\missing`

The synthetic failure test currently uses the normal persistent ALT log location under `%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\`, so test diagnostics can be confused with a real user install failure.

This task must solve both problems together:

1. make upstream compatibility auditing repeatable and mostly automated;
2. make installer/test failure diagnostics isolated and user-readable.

---

## 2. Goal

Implement a reusable local **Antigravity Version Compatibility Audit Framework** and use the currently installed upstream version as its first real-world audit.

After this work, a future upstream Antigravity update should follow:

```text
Install/update official Antigravity
        ↓
Run local compatibility audit
        ↓
Read-only structural + anchor + version report
        ↓
PASS / REVIEW_REQUIRED / BLOCKED
        ↓
Only when needed: Codex changes anchors/dictionary
        ↓
Controlled synthetic tests
        ↓
Controlled real apply → verify → restore
        ↓
Explicitly add tested upstream version to compatibility manifest
        ↓
PR review → release remains manual
```

A new upstream version must **never** become supported merely because it is numerically newer or because the existing patch happens to run.

---

## 3. Non-goals

- Do not auto-download Antigravity.
- Do not upload or commit the real official `app.asar`.
- Do not commit extracted official JS bundles or other proprietary Antigravity source.
- Do not make GitHub Actions the authority for real upstream compatibility.
- Do not implement a permissive rule such as `>=2.13.0`.
- Do not automatically publish a GitHub Release.
- Do not automatically merge the implementation PR.
- Do not disable version safety checks to make installation succeed.
- Do not leave the user's real Antigravity installation in a partially modified state after compatibility verification.

---

## 4. Required architecture

### 4.1 Compatibility manifest

Replace the single-version design with an explicit manifest/profile model.

The exact file layout may be adjusted if there is a strong implementation reason, but the result must provide equivalent semantics, for example:

```json
{
  "schemaVersion": 1,
  "versions": {
    "2.13.0": {
      "status": "verified",
      "profile": "v2-mainline"
    },
    "2.14.0": {
      "status": "verified",
      "profile": "v2-mainline"
    }
  }
}
```

Requirements:

- support remains an **explicit allowlist**;
- no semver range automatically authorizes an unaudited upstream version;
- per-version profile/anchor differences must be representable;
- the localization engine and tests must read the same source of truth;
- `--version` output should show all verified supported upstream versions clearly;
- restore safety must continue to require same-version backup matching.

If the real audit fails, the detected upstream version must **not** be marked `verified`.

### 4.2 Read-only compatibility auditor

Add a local command, preferably exposed through npm, such as:

```bash
npm run audit:antigravity -- --install-dir "..."
```

The auditor must be able to inspect an unsupported/new upstream version without modifying it.

Minimum checks:

- locate real Antigravity installation/resources;
- inspect `app.asar/package.json` and report upstream version;
- confirm required archive members exist:
  - `dist/preload.js`
  - `dist/menu.js` when applicable
  - `dist/tray.js` when applicable
  - `dist/loadingOverlay.js` when applicable
  - `dist/ideInstall/wizardPreload.js` when applicable
- check every production patch anchor currently relied upon by the localization engine;
- report missing/changed anchors individually;
- detect whether the archive already contains the ALT localization signature;
- verify the audit itself does not create `app.asar.bak` and does not replace `app.asar`;
- use temporary extraction only and clean it afterward;
- produce a human-readable report;
- produce machine-readable JSON suitable for future tooling;
- return a deterministic exit status.

Recommended status model:

- `PASS`: all structural safety checks and required anchors match a known compatible profile;
- `REVIEW_REQUIRED`: structure is sufficiently intact to continue analysis but strings/anchors/profiles changed and human/Codex review is required;
- `BLOCKED`: required structure is missing, archive cannot be inspected, or safe patching cannot be established.

Do not call an unsupported version `supported` merely because the audit status is `PASS`. `PASS` means structurally compatible candidate; verified support is only granted after the controlled apply/restore acceptance flow.

### 4.3 Compatibility fingerprint

Persist only safe metadata needed for future comparison. It may include:

- upstream version;
- expected member existence;
- file size;
- SHA-256 digest of selected archive members;
- required-anchor count/presence;
- profile identifier;
- audit schema version;
- audit timestamp/result.

Do **not** persist complete official file contents.

The design should allow the next Antigravity version to be compared against the last verified fingerprint without requiring a full manual source review when nothing material changed.

---

## 5. First real upstream audit

At execution time:

1. Sync latest `main`.
2. Read `AGENTS.md`, this contract, and Issue #10.
3. Detect the real installed Antigravity version from its own archive metadata.
4. Record the detected version in the contract Execution Result.
5. Run the new read-only compatibility audit.
6. Compare all current production patch assumptions against the detected upstream archive.
7. Identify UI-string additions/removals relevant to the existing localization scope.
8. Update dictionaries and patch anchors only when evidence shows they are needed.
9. Do not copy large official source fragments into the repository or PR discussion.

For the currently reported 2.14.0 installation, specifically verify the areas affected by current engine logic:

- main preload localization injection;
- IDE install wizard preload injection;
- application menu injection;
- tray menu injection and agent-count text;
- loading overlay text;
- official unpacked directory handling;
- repack + inspect validation;
- same-version backup and restore.

If the installed version is different by execution time, apply the same checklist to that detected version.

---

## 6. Controlled real-install verification

A real local apply/restore cycle is required before adding the detected upstream version to the verified allowlist.

Before mutation:

- confirm Antigravity is not running;
- confirm the target `app.asar` version matches the version being audited;
- confirm no incompatible/stale `app.asar.bak` exists;
- capture pre-test file metadata/hash as needed.

Verification sequence:

1. apply ALT to the real installation;
2. verify resulting archive version;
3. verify main localization signature;
4. verify wizard localization signature when the wizard preload exists;
5. verify expected unpacked structure;
6. verify the application can still be inspected/repacked without corruption;
7. restore the official backup;
8. verify restored archive is official/unlocalized and same upstream version;
9. verify `app.asar.bak` cleanup behavior matches project policy;
10. leave the user's installation in the official restored state at task completion unless the user explicitly requests otherwise later.

If any mutation-phase safety check fails, stop, restore if safely possible, set the contract to `BLOCKED`, and do **not** add that upstream version to the verified manifest.

---

## 7. Windows installer diagnostic fix

### 7.1 Test isolation

The Windows synthetic installer E2E must not write its negative-test logs into the same persistent location used by a normal user installation.

Implement a safe override or equivalent isolation mechanism so that:

- automated test logs live under the test's temporary root;
- success and intentional failure fixtures do not replace `%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT\last-Install.log`;
- test cleanup removes the synthetic logs;
- the production default remains the normal user log directory.

The mechanism must not weaken installer safety. A test-specific log-directory override is acceptable if validated and scoped safely.

### 7.2 User-facing root cause

A real installer failure must no longer present only `exit code 1` when the engine already knows a useful reason.

For common safe failures, the installer dialog should include a concise root cause, for example:

```text
ALT 安裝失敗。

原因：此版本尚未支援 Antigravity 2.xx.x。
已偵測版本：2.xx.x
已驗證支援版本：...

Antigravity 未被修改。
詳細記錄：...
```

Exact wording can differ, but requirements are:

- use Traditional Chinese for the actionable error text;
- distinguish unsupported-version failure from missing-installation failure;
- retain the detailed log path;
- do not dump a large raw log into the dialog;
- do not expose secrets or unrelated file contents;
- make clear when failure occurred before Antigravity modification;
- preserve non-zero installer exit status.

Codex may implement this via a structured engine error result, a small error-summary file, or a carefully parsed safe log summary. Prefer a deterministic structured mechanism over brittle parsing if practical.

### 7.3 Regression tests

Extend Windows installer tests to cover at least:

- successful synthetic install;
- idempotent/reinstall behavior;
- successful restore;
- intentional missing-installation failure;
- intentional unsupported-version failure;
- non-zero exit status for failures;
- expected user-safe diagnostic summary;
- synthetic logs are written to the temporary test directory;
- normal persistent user log is not created/overwritten by the test.

Do not depend on clicking GUI dialogs in CI.

---

## 8. Versioning

This task adds a user-visible capability (new upstream compatibility plus compatibility-audit workflow), so if the real upstream audit passes and support is added, prepare the code/docs/artifact naming for **ALT 1.1.0** under the project's independent SemVer policy.

Update all version-bearing locations consistently, including as applicable:

- `package.json`;
- engine version output;
- Windows installer artifact/display version;
- macOS artifact/display version;
- README examples/download names;
- packaging tests and expected filenames.

Do not create or publish the 1.1.0 GitHub Release in this task.

If the real upstream audit is blocked and no new upstream support can be safely declared, do not falsely present the project as 1.1.0-supported merely to satisfy this section; record the blocker for review.

---

## 9. Tests

At minimum run locally:

```bash
npm ci
npm run check
npm run check:packaging
```

On Windows also:

```bash
powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64
npm run check:windows-installer
```

Add automated tests for the new compatibility-audit logic using synthetic ASAR fixtures so CI does not require proprietary Antigravity files.

The existing controlled GitHub Actions policy remains in force. CI may validate:

- core unit/smoke tests;
- compatibility-auditor synthetic fixtures;
- packaging rules;
- Windows synthetic installer E2E;
- macOS build/sign/ZIP checks.

CI must **not** claim that a real Antigravity upstream version is verified unless the local real-install evidence is recorded separately.

---

## 10. Documentation

Update README and/or add a focused compatibility document describing the future update SOP:

```text
Official Antigravity update
→ local read-only audit
→ compare fingerprint/anchors
→ review only if needed
→ controlled apply/restore verification
→ explicitly mark version verified
→ build/review/release
```

Documentation must clearly distinguish:

- `candidate structurally compatible`;
- `verified supported version`;
- `unsupported/blocking change`.

Document that an upstream update normally overwrites localization and that users should wait until the version is explicitly verified before applying ALT.

---

## 11. Acceptance criteria

- [ ] A reusable read-only compatibility audit command exists.
- [ ] Audit works against an unsupported/new local upstream version without modifying the real installation.
- [ ] Audit reports the detected upstream version from archive metadata.
- [ ] Audit validates every current production patch anchor individually.
- [ ] Audit emits both human-readable and machine-readable results.
- [ ] Compatibility status has deterministic PASS / REVIEW_REQUIRED / BLOCKED semantics or an equivalent documented model.
- [ ] A safe metadata/fingerprint model exists for future comparisons.
- [ ] Supported upstream versions are an explicit allowlist/profile manifest, not a broad semver range.
- [ ] Existing 2.13.0 behavior remains covered by tests.
- [ ] The actually detected current upstream version is audited.
- [ ] If and only if it passes controlled real apply/restore verification, that version is added as verified support.
- [ ] Real `app.asar` and extracted official source are not committed or uploaded.
- [ ] Windows synthetic E2E logs are isolated from normal user logs.
- [ ] Missing-installation and unsupported-version failures have distinct diagnostics.
- [ ] Installer error UI exposes a concise actionable root cause instead of only `exit code 1`.
- [ ] Installer failures preserve non-zero exit codes.
- [ ] Controlled real-install test ends with the official unlocalized archive restored.
- [ ] `npm run check` passes.
- [ ] `npm run check:packaging` passes.
- [ ] Windows build + `npm run check:windows-installer` pass.
- [ ] Controlled CI passes.
- [ ] README/compatibility docs explain the future version-upgrade workflow.
- [ ] If support is successfully added, ALT product/version references are updated consistently to 1.1.0.
- [ ] No GitHub Release is automatically published.
- [ ] PR is opened to `main`.
- [ ] Contract is updated to `READY_FOR_REVIEW` with evidence.

---

## 12. Git / PR rules

- Sync `origin/main` before starting.
- Create a short-lived implementation branch; suggested name:
  - `feature/version-compatibility-audit`
- Do not implement directly on `main`.
- Keep commits logically separated where practical, e.g.:
  1. compatibility audit/manifest;
  2. upstream-version adaptation/dictionaries;
  3. installer diagnostic isolation;
  4. tests/docs/version bump.
- Push the branch.
- Open a PR to `main`.
- Do not merge it.
- Do not create a production Release.
- Update this contract on the implementation branch with the Execution Result before requesting review.

---

## 13. Execution Result

- Status: `PENDING_CODEX`
- Implementation branch:
- Detected local Antigravity version:
- Pre-audit state:
- Compatibility audit result:
- Changed/missing anchors:
- UI-string/dictionary changes:
- Real apply verification:
- Real restore verification:
- Final real-install state:
- Windows installer diagnostic result:
- Synthetic log isolation result:
- ALT version prepared:
- Tests:
- CI:
- PR:
- Remaining blockers:
- Notes:
