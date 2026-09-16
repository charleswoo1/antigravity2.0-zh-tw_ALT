# Handoff / Implementation Contract — Antigravity Version Compatibility Audit Framework + Installer Diagnostics

**Status:** `READY_FOR_REVIEW`  
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

This task must solve these problems together:

1. make upstream compatibility auditing repeatable and mostly automated;
2. make installer/test failure diagnostics isolated and user-readable;
3. move compatibility/version validation into a true **preflight gate** before any Antigravity mutation is possible;
4. investigate the reported case where a failed install was followed by Antigravity no longer launching, and guarantee rollback/integrity behavior for every mutation-stage failure.

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

### 4.4 Mandatory installer preflight gate

The current Windows installer invokes the localization engine from Inno Setup `ssPostInstall`. This means the progress bar can be almost complete before the engine performs its version check. Although the current engine checks the upstream version before calling backup/mutation logic, this ordering is too late from the installer UX and safety-boundary perspective.

Refactor the Windows install path into two explicit phases:

```text
PRE-FLIGHT (read only)
  locate Antigravity
  → read app.asar/package.json
  → determine upstream version
  → verify version is explicitly allowed
  → verify required structure/anchors/profile
  → verify Antigravity process state
  → verify target is readable
  → no backup, no repack, no rename, no write to Antigravity
        ↓ only if PASS
MUTATION
  backup
  → extract to temp
  → patch temp copy
  → repack temp archive
  → validate temp archive
  → atomic replacement
  → post-install integrity check
```

Requirements:

- unsupported version must fail **before the main install/mutation phase starts**;
- before preflight returns PASS, there must be **zero writes under the Antigravity installation directory**;
- preflight may write only ALT-owned temporary/log files;
- the installer should present the detected and supported versions immediately on preflight failure;
- the GUI should not visually run to the end of the installation progress bar before reporting a simple version incompatibility;
- prefer an Inno Setup pre-install hook such as `PrepareToInstall` / equivalent early gate, using a minimal temporarily extracted runtime/preflight payload when needed;
- do not duplicate compatibility logic independently in Pascal if that risks drift; keep one authoritative compatibility implementation where practical;
- silent installer mode must use the same preflight gate and non-zero failure semantics.

### 4.5 Transactional mutation and launch-integrity guarantee

The user reported that after the failed installer attempt, Antigravity no longer launched. The current unsupported-version code path is expected to return before `createOrRefreshBackup()`, so this symptom must be investigated rather than assumed to be caused by the version mismatch itself.

Codex must inspect and record the real local state before further mutation, including as applicable:

- current `app.asar` existence, size, version and hash;
- presence of `app.asar.bak`, `app.asar.pre-localization`, `app.asar.localized.tmp`, `app.asar.restore.tmp`, and associated `.unpacked` directories;
- whether the official Antigravity executable starts against the current archive;
- whether any prior ALT/installer temporary artifact is shadowing or replacing the expected archive.

Mutation-phase requirements:

- never modify the original archive in-place;
- patch/repack only a temporary copy;
- validate the completed temporary archive before replacement;
- replacement must remain atomic/rollback-safe;
- if any exception occurs after the original archive has been moved/renamed, restore the exact pre-install archive automatically;
- on every failed install, perform a final integrity check confirming a launchable/original archive path exists;
- do not delete the last known-good official backup until restore/install success is fully verified;
- leave diagnostic artifacts only in ALT-owned locations, never as ambiguous files that Antigravity may attempt to load.

Add regression/fault-injection tests around replacement failure and post-replacement verification failure, not only failures that occur before mutation.

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
- [ ] Windows installer performs a read-only preflight before the main mutation/install phase.
- [ ] Unsupported upstream versions cause zero writes under the Antigravity installation directory.
- [ ] A simple unsupported-version failure is shown before the installer progress reaches the mutation phase.
- [ ] The reported post-failure 'Antigravity cannot launch' state is investigated and its root cause recorded.
- [ ] Mutation is transactional: injected failures after backup/replacement cannot leave Antigravity without a valid original or verified localized archive.
- [ ] Fault-injection tests cover rollback after replacement-stage failures.
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

- Status: `READY_FOR_REVIEW`
- Implementation branch: `feature/version-compatibility-audit`
- Detected local Antigravity version: `2.14.0`, read directly from the real local `resources/app.asar` `package.json`; no conversational version assumption was used.
- Pre-audit state: official/unlocalized archive, 4,560,152 bytes, SHA-256 `adda0c05f6b297f81c03e29bc029d9c897a408f9a8a925a79385b3949b0fec4e`; `app.asar.bak` and all transactional temporary/shadow paths absent. Antigravity was initially running and was not mutated until all five processes had exited.
- Compatibility audit result: `PASS`, `noMutation: true`, profile `v2-mainline`. The read-only audit created no backup and did not replace the archive. Safe metadata is recorded at `compatibility/fingerprints/2.14.0.json`.
- Changed/missing anchors: none. Main preload, wizard preload, application menu, tray agent-count, loading overlay and official `chrome-devtools-mcp` unpacked path were present and passed. A Windows deep-member path normalization defect discovered during evidence review was fixed so the wizard member is included correctly.
- UI-string/dictionary changes: none required. The relevant menu, tray, loading and preload assumptions remained compatible and the real localized archive passed signature/repack inspection.
- Real apply verification: `PASS`; controlled candidate apply produced Antigravity `2.14.0` with the main and IDE wizard localization signatures present. Official unpacked structure remained unchanged (293 files; aggregate evidence SHA-256 `489a950428406ef0fce5b06219aa35ba2918fffdfbf1ec0b8f28eefea23dcadd`).
- Real restore verification: `PASS`; restore returned the exact pre-test archive hash, official/unlocalized status and upstream version, then removed `app.asar.bak`.
- Final real-install state: Antigravity `2.14.0`, official/unlocalized, SHA-256 `adda0c05f6b297f81c03e29bc029d9c897a408f9a8a925a79385b3949b0fec4e`; no backup or transactional artifact; Antigravity left stopped after verification.
- Windows installer diagnostic result: `PASS`; `PrepareToInstall` runs the authoritative read-only auditor before mutation, reports distinct `MISSING_INSTALLATION` / `UNSUPPORTED_VERSION` summaries, and silent failures return non-zero. Mutation uses validated temporary archives, atomic replacement, post-replacement validation and exact-hash rollback. Fault injection covers failure after original move, after replacement and after post-replacement verification.
- Synthetic log isolation result: `PASS`; E2E log override is restricted to a system-temp path containing `antigravity-alt-installer-`; missing and unsupported fixtures wrote only there, and persistent `%LOCALAPPDATA%\Antigravity-ZH-Hant-TW-ALT` logs were byte-for-byte unchanged.
- ALT version prepared: `1.1.0`; package, engine, Windows/macOS artifacts, payload, docs and CI expectations updated. No GitHub Release was created.
- Tests: `npm ci --ignore-scripts --no-fund`, `npm run check`, `npm run check:packaging`, Windows x64 build, and `npm run check:windows-installer` passed locally.
- CI: GitHub Actions run `35103132529` completed with overall `success`; Core/Ubuntu, Windows x64 installer E2E, macOS x64 and every macOS arm64 build/validation/upload step succeeded. (GitHub's arm64 check-run UI remained briefly pending after the overall run had finalized successfully.)
- PR #11 review follow-up: all three latest ChatGPT review findings were resolved. Missing known optional patch-target members now deterministically produce `REVIEW_REQUIRED`; installer summaries are loaded as Unicode with `LoadStringsFromFile` and verified by a Traditional Chinese UTF-8 round-trip E2E assertion; `/SkipProcessClose=1` is rejected unless `TestLogDir` first activates the validated isolated test mode.
- Review regression coverage: added missing-patch-target status/exit assertions, localized repeat-install preflight coverage using a readable same-version official backup, installer-source Unicode/gate assertions, a production-mode bypass rejection with an unchanged installation-tree assertion, and installer-decoded Traditional Chinese summary checks. During E2E, repeat-install preflight exposed that localized strings no longer match official anchors; the auditor now detects the localization signature and validates structure/anchors against the same-version official backup, blocking missing, invalid, or version-mismatched backups.
- Review follow-up validation: `npm run check`, `npm run check:packaging`, Windows x64 build, and `npm run check:windows-installer` passed locally. GitHub Actions run `35106865903` completed successfully for Core/Ubuntu, Windows x64 installer E2E, macOS x64 and macOS arm64.
- PR: #11 — `https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/11`, open to `main`; not merged.
- Remaining blockers: none for implementation; human review/merge and any future Release remain manual.
- Notes: root-cause investigation found that the displayed failure log was the synthetic E2E missing-path fixture (`...\antigravity-alt-installer-...\missing`), not a real install attempt. The real installation contained only the expected official archive/unpacked directory, no ALT backup/shadow/temp artifact, and subsequently launched Antigravity 2.14.0 with its language server successfully. Windows Application events contained no corresponding Antigravity crash. Therefore the actionable root cause of the misleading dialog was persistent-log contamination by the synthetic negative test; available evidence does not establish a separate archive-corruption cause for the transient launch symptom. Preflight isolation and transactional rollback now prevent both failure modes from being conflated or leaving an invalid archive.
