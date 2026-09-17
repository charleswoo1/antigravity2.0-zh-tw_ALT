# Handoff / Implementation Contract — ALT 1.1.1 Windows Installer Progress UX + GPU Known-Issue Safe Mode

**Status:** `READY_FOR_REVIEW`
**Issue:** #12 — Fix Windows installer progress UX and add Windows 11 25H2 GPU workaround guidance  
**Target:** `main`  
**Functional baseline commit:** `685b93bd87ecf18339a94b174ac9ded7bc18a678`  
**Target ALT version:** `1.1.1`  
**Suggested implementation branch:** `fix/windows-installer-progress-gpu-known-issue`  
**Prepared:** 2026-09-17

## 1. Context

ALT 1.1.0 already moved compatibility/version validation into an early, read-only `PrepareToInstall` preflight. That safety boundary must remain unchanged.

However, the actual localization mutation is still launched from Inno Setup `CurStepChanged(ssPostInstall)`. At that point the normal Inno Setup installation progress can already appear complete even though the localization engine is still patching, repacking, replacing, and verifying `app.asar`. This creates misleading UX: the installer may visually look finished while the real work is still running.

Separately, testing on a Windows 11 Enterprise 25H2 machine, build `26200.9448`, reproduced an upstream Antigravity/Electron GPU startup problem:

```text
reboot
→ normal Antigravity launch initially works
→ quit 1–2 times
→ normal launch FAIL
→ renderer/GPU cascade
```

Additional observations from the same machine:

- restored English/original Antigravity reproduces the failure;
- original Antigravity profile and clone-D both reproduce it;
- no lingering `Antigravity` or `language_server` process is required;
- `--disable-gpu` → PASS;
- `--disable-gpu-sandbox` → PASS.

The current evidence therefore points to an upstream Antigravity / Electron / Chromium / Windows 11 25H2 GPU-path compatibility problem, not to the ALT localization strings or localized archive itself.

This task must improve the installer UX without changing the product’s safety model:

1. make the Windows installer progress truthful through the actual localization/verification phase;
2. on the currently affected Windows 11 25H2 build family, show a post-install known-issue notice;
3. provide a user-initiated `--disable-gpu` fallback shortcut named **Antigravity 安全模式（停用 GPU）**;
4. do not silently alter normal Antigravity launch behavior.

---

## 2. Goals

### 2.1 Installer progress

The Windows GUI installer must no longer show or behave as fully complete while the localization engine is still running.

The minimum acceptable behavior is:

```text
preflight PASS
→ installer payload/setup phase
→ localization mutation starts
→ progress remains visibly incomplete while mutation/verification is running
→ localization engine returns success
→ final verification succeeds
→ progress reaches 100%
→ completion UI
```

Do **not** invent fine-grained percentage precision if the localization engine cannot currently report it. A deterministic phase-based progress model is acceptable and preferred over fake percentages.

### 2.2 Windows 11 25H2 known-issue UX

After a successful **Install** on the affected Windows build family, show a Traditional Chinese notice explaining that some Windows 11 25H2 systems may fail to reopen Antigravity after quitting and that `--disable-gpu` is a temporary workaround.

The notice must offer actions equivalent to:

- `完成`
- `複製 --disable-gpu`
- `建立「Antigravity 安全模式（停用 GPU）」捷徑`

The safe-mode shortcut must be opt-in and separate from the normal Antigravity shortcut.

### 2.3 Versioning

This is a backward-compatible bugfix/UX update on ALT 1.1.0. Bump the ALT product version to **1.1.1** consistently across package metadata, Windows artifact names, packaging tests, CI references, documentation, and any other current-version constants.

---

## 3. Non-goals

- Do not patch Antigravity itself to “fix” the upstream GPU issue.
- Do not modify the official `Antigravity.exe`.
- Do not inject `--disable-gpu` into the normal Antigravity shortcut.
- Do not automatically create the safe-mode shortcut during install.
- Do not use `--disable-gpu-sandbox` as the default/user-facing workaround.
- Do not use `--no-sandbox` as a workaround.
- Do not disable or weaken the existing compatibility preflight.
- Do not change the compatibility allowlist merely for this task.
- Do not bypass transactional backup/rollback/integrity checks.
- Do not auto-merge the implementation PR.
- Do not auto-publish a GitHub Release.
- Do not claim that Microsoft, Electron, or Antigravity has formally fixed the issue unless that is separately verified later.

---

## 4. Required implementation

### 4.1 Preserve the existing preflight safety boundary

Keep the current read-only `PrepareToInstall` flow intact:

```text
PrepareToInstall
→ compatibility auditor
→ explicit allowlist
→ structure / anchor checks
→ process-state check
→ zero Antigravity mutation before PASS
```

This task must not regress the ALT 1.1.0 guarantee that an unsupported/unsafe upstream version is rejected before mutation.

### 4.2 Fix the misleading progress state

Current baseline behavior in `build/windows/installer.iss` runs the localization engine from `CurStepChanged(ssPostInstall)`, after Inno Setup’s normal file-install progress is effectively complete.

Refactor or augment the GUI progress UX so that:

- the visible progress is **not at 100%** while `localization_engine.js` is still running;
- the status text clearly indicates the current broad phase, for example:
  - `正在檢查 Antigravity 相容性…`
  - `正在準備繁體中文化…`
  - `正在套用繁體中文化…`
  - `正在驗證安裝結果…`
  - `安裝完成`;
- 100% is only shown after the localization engine exits successfully and the installer accepts the final result;
- a failure must never flash/show a successful 100% completion state first;
- UI messages must repaint before a synchronous long-running step so the user can see the correct phase;
- silent mode behavior and exit codes remain unchanged.

Implementation choice is intentionally flexible. Acceptable approaches include:

1. controlled use of the existing Inno progress gauge with phase-based positions; or
2. a dedicated progress page/control for the ALT mutation stage.

If the engine does not expose reliable sub-step progress, keep one honest “localization in progress” phase rather than implementing fake per-file percentages.

Do not move mutation into the read-only preflight merely to make the progress bar easier.

### 4.3 Detect the affected Windows build family

The known-issue UX is currently scoped to **Windows 11 build 26200.x** (25H2 family observed in testing).

Requirements:

- determine the running Windows build using a documented Windows/Inno-supported version API;
- trigger the known-issue UX when the OS build is `26200` regardless of Windows edition (Home/Pro/Enterprise);
- do not key behavior on marketing edition strings;
- keep the predicate isolated in a clearly named helper, e.g. `IsAffectedWindowsGpuBuild`, so it can be removed/updated later;
- do not show the warning on unrelated Windows builds unless later evidence expands the scope.

The warning is a compatibility advisory, not a compatibility block. Installation must remain allowed when all normal ALT preflight checks pass.

### 4.4 Known-issue notice text

Use concise Traditional Chinese wording. The exact layout may be adjusted for the installer UI, but the semantics must remain equivalent to:

> **Windows 11 25H2 相容性提醒**  
> 部分 Windows 11 25H2（Build 26200.x）系統可能發生 Antigravity 關閉後無法再次啟動的情況。  
> 目前測試顯示此現象也會發生在未套用繁體中文化的官方英文版，與 Antigravity / Electron 的 GPU 啟動路徑相容性較為相關。  
> 若遇到此問題，可先重新啟動 Windows；若問題持續，可使用 `--disable-gpu` 啟動 Antigravity 作為暫時 workaround。  
> 使用 `--disable-gpu` 會停用 GPU 硬體加速，但不應改變一般 AI、編輯與網路功能。

Do not word the message as though reboot is a permanent fix. The current observed behavior is that reboot can temporarily restore normal launch and the problem can recur after 1–2 quit/relaunch cycles.

Do not present `--disable-gpu-sandbox` or `--no-sandbox` in the normal user notice.

### 4.5 Notice timing and modes

Show the known-issue UX only when all of the following are true:

- installer mode is **Install**, not Restore;
- install completed successfully;
- running OS matches the affected build predicate;
- installer is interactive (`not WizardSilent`).

Requirements:

- **Restore** must not show this notice;
- `/VERYSILENT` / silent modes must remain non-interactive;
- silent installation must never create the safe-mode shortcut automatically;
- the warning must occur after successful localization, not before success is known;
- an install failure must show the existing failure diagnostics, not the GPU advisory.

### 4.6 `複製 --disable-gpu`

Provide an interactive action that copies exactly:

```text
--disable-gpu
```

to the Windows clipboard.

After copying, provide a small confirmation such as `已複製 --disable-gpu` without closing/restarting Antigravity or mutating any shortcut.

### 4.7 Create `Antigravity 安全模式（停用 GPU）` shortcut

Provide an explicit user action/button:

```text
建立「Antigravity 安全模式（停用 GPU）」捷徑
```

Shortcut requirements:

- create it on the **current user Desktop**;
- filename/display name: `Antigravity 安全模式（停用 GPU）`;
- target: the detected official `Antigravity.exe`;
- arguments: exactly `--disable-gpu`;
- working directory: official Antigravity executable directory;
- icon: official `Antigravity.exe` icon when available;
- no elevation/admin requirement;
- do not alter or replace the normal Antigravity shortcut;
- do not change registry launch behavior;
- do not change file associations;
- do not add a global environment variable;
- do not patch Antigravity configuration files.

Idempotency:

- if the shortcut already exists, update/replace that same `.lnk`;
- do not create `(... 2)` / duplicate shortcuts;
- repeated clicks must remain safe.

Failure handling:

- verify the target executable exists before creating the shortcut;
- if no valid official `Antigravity.exe` can be resolved, show a clear Traditional Chinese error and create nothing;
- do not guess a target path that does not exist;
- a shortcut-creation failure must not roll back or invalidate an already successful localization install.

Prefer using the install path already established by the ALT preflight/engine flow. Avoid creating a second divergent Antigravity installation-discovery algorithm unless unavoidable.

### 4.8 Security posture

`--disable-gpu` is the only user-facing safe-mode argument authorized by this contract.

Rationale:

- it preserves Chromium sandboxing while disabling GPU acceleration;
- `--disable-gpu-sandbox` is useful diagnostically but weakens GPU-process sandbox isolation;
- `--no-sandbox` weakens sandboxing more broadly and must not be offered.

Do not silently append any of these arguments to normal launches.

### 4.9 Documentation

Update user-facing documentation to include a concise Windows Known Issue section.

At minimum update `README.md`; update `COMPATIBILITY.md` too if that is the clearest permanent location for the build-specific advisory.

The documentation must state:

- affected observation: Windows 11 25H2 / build 26200.x;
- symptom: after quit, Antigravity may fail to reopen;
- temporary workaround: launch with `--disable-gpu` or use the optional safe-mode shortcut;
- safe-mode shortcut is not a separate Antigravity version;
- normal shortcut remains unchanged;
- the advisory may be removed after upstream/Windows fixes are verified.

Avoid overstating causality. Use wording such as “目前測試與公開案例指向 Antigravity/Electron GPU 路徑相容性” rather than asserting an unverified single vendor root cause.

### 4.10 ALT 1.1.1 version bump

Update every authoritative/current version reference from `1.1.0` to `1.1.1` that participates in build/test/output behavior, including as applicable:

- `package.json`;
- lockfile package version metadata when required;
- `build/windows/installer.iss`;
- Windows artifact names;
- macOS artifact names only where the project’s shared ALT version requires consistency;
- packaging tests;
- Windows installer tests;
- CI validation references;
- README current release/version text.

Do not rewrite historical handoff/legacy documents merely to replace old version numbers.

---

## 5. Testing requirements

### 5.1 Existing regression suite

Run at minimum:

```bash
npm ci
npm run check
npm run check:packaging
```

On Windows, after building the installer:

```powershell
npm run check:windows-installer
```

All existing ALT 1.1.0 compatibility/preflight/rollback safety tests must remain green after adapting expected artifact names to 1.1.1.

### 5.2 Progress regression coverage

Add regression coverage where practical for the new installer progress behavior.

Minimum evidence required in PR/Execution Result:

- identify exactly where the installer progress is held below completion before localization starts;
- identify exactly where 100% is permitted after engine success;
- verify the failure path cannot report/show successful completion first;
- verify silent installer exit behavior is unchanged.

If the Inno UI itself cannot be meaningfully asserted headlessly, document that limitation and include a manual GUI test procedure rather than adding brittle pixel/UI automation.

Manual GUI test procedure must include:

```text
1. Start ALT 1.1.1 Windows installer interactively.
2. Pass preflight.
3. Observe localization mutation phase.
4. Confirm progress is visibly <100% while localization_engine.js is still running.
5. Confirm status text indicates localization/verification work.
6. Confirm 100% / completed state appears only after success.
```

### 5.3 Known-issue predicate tests

Add deterministic tests for the OS-build predicate/helper where practical:

- build `26200` → affected = true;
- nearby non-target build such as `26100` → false;
- build `26300` → false unless implementation includes separately verified evidence and updates this contract/Issue first.

The test must not depend on the CI runner actually being Windows 11 25H2.

### 5.4 Safe-mode shortcut tests

Automated/static tests should verify as much as practical:

- shortcut label is exactly `Antigravity 安全模式（停用 GPU）`;
- target executable is validated before creation;
- arguments are exactly `--disable-gpu`;
- normal Antigravity shortcut is untouched;
- repeated creation resolves to the same shortcut path;
- silent mode does not create it;
- Restore mode does not create it.

Do not create a real Desktop shortcut on CI/test hosts unless the test uses an explicitly isolated test destination guarded by the existing validated test mode.

### 5.5 Real affected-machine validation

The user has an affected Windows 11 Enterprise 25H2 machine on build `26200.9448`.

After Codex opens the PR and automated tests pass, record that **user validation is required** for the final GUI acceptance:

1. Install ALT 1.1.1 interactively.
2. Confirm corrected progress behavior.
3. Confirm the 25H2 notice appears only after successful install.
4. Click `複製 --disable-gpu` and verify clipboard content.
5. Click `建立「Antigravity 安全模式（停用 GPU）」捷徑`.
6. Confirm Desktop shortcut target is official `Antigravity.exe` with argument `--disable-gpu`.
7. Confirm normal Antigravity shortcut remains unchanged.
8. Reproduce the normal-launch failure after quit/relaunch if still present.
9. Launch via safe-mode shortcut and confirm PASS.
10. Click shortcut creation again and confirm no duplicate shortcut is created.

Codex must not fabricate this hardware validation. If it cannot run on the affected machine, mark it `PENDING_USER_VALIDATION` in Execution Result.

---

## 6. Acceptance criteria

The implementation is acceptable only when all of the following are true:

1. ALT version is consistently `1.1.1` for current build artifacts.
2. Existing preflight remains read-only and blocks unsafe/unsupported versions before mutation.
3. Interactive Windows installer does not show 100% while the localization engine is still running.
4. 100% / completion is shown only after localization success.
5. Install failure cannot first appear as successful completion.
6. Windows build `26200.x` successful interactive Install shows the known-issue notice.
7. Non-26200 build does not show this build-specific notice.
8. Restore does not show the notice.
9. Silent install remains non-interactive.
10. `複製 --disable-gpu` copies exactly that argument.
11. Safe-mode shortcut is opt-in only.
12. Safe-mode shortcut targets official `Antigravity.exe` with exactly `--disable-gpu`.
13. Safe-mode shortcut creation is idempotent and does not create duplicates.
14. Normal Antigravity shortcut/configuration is not modified.
15. Neither `--disable-gpu-sandbox` nor `--no-sandbox` is offered to users.
16. README contains the Windows 11 25H2 / 26200.x Known Issue guidance.
17. Existing compatibility, rollback, packaging, and installer regression tests pass.
18. No proprietary official Antigravity archive/source is committed.

---

## 7. Git / PR rules

Codex must follow `AGENTS.md` and `HANDOFFS/README.md`.

Required flow:

```text
git switch main
git pull --ff-only
→ read AGENTS.md
→ read this contract
→ read Issue #12
→ create fix/windows-installer-progress-gpu-known-issue
→ implement
→ run required local tests
→ commit
→ push
→ open PR to main
→ update this contract Execution Result
→ set Status = READY_FOR_REVIEW
```

Additional rules:

- do not develop directly on `main`;
- do not merge the PR automatically;
- do not publish a Release automatically;
- GitHub Actions may run CI/build validation under the existing controlled-CI policy;
- implementation must remain reproducible locally;
- if a required assumption about Inno Setup APIs or Windows build detection proves false, stop and document the blocker rather than weakening safety behavior.

Suggested PR title:

```text
fix: correct Windows installer progress and add 25H2 GPU safe mode
```

---

## 8. Execution Result

Codex must update this section before handoff back to ChatGPT/user review.

**Implementation status:** `READY_FOR_REVIEW`
**Branch:** `fix/windows-installer-progress-gpu-known-issue`
**Commit(s):** `95a2a8a` (`fix: correct Windows installer progress and add GPU safe mode`); Execution Result follow-up commits on the same branch
**PR:** [#13 — fix: correct Windows installer progress and add 25H2 GPU safe mode](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/13)
**Detected implementation baseline:** `77dc21add023be5973940567fb62b5a5ab3a6749` (`origin/main` after required fast-forward sync; functional baseline `685b93bd87ecf18339a94b174ac9ded7bc18a678` remains in history)
**Files changed:** `.github/workflows/ci.yml`, `COMPATIBILITY.md`, `README.md`, `THIRD_PARTY_LICENSES.md`, `build/common/generate-third-party-notices.js`, `build/common/verify-payload.js`, `build/macos/app/Info.plist`, `build/macos/build.sh`, `build/windows/build.ps1`, `build/windows/installer.iss`, `localization_engine.js`, `package-lock.json`, `package.json`, `tests/packaging.test.js`, `tests/smoke.test.js`, `tests/windows-installer.test.js`, `tools/compatibility-audit.js`, and this contract.
**Progress UX implementation:** `PrepareToInstall` remains the read-only preflight and reports phase 15%/45%. Mutation moved from `ssPostInstall` to `ssInstall`; immediately before the synchronous engine `Exec`, interactive progress is repainted at 80% with `正在套用繁體中文化並驗證安裝結果…`. Engine success alone sets `EngineSucceeded` and advances to 95%; `ssPostInstall` checks that flag before permitting 100% / `安裝完成`. All engine launch/nonzero failure paths occur before the success flag, so they cannot report successful 100% first. `SetInstallerPhase` is a no-op under `WizardSilent`, preserving silent UI behavior.
**Windows build detection implementation:** Isolated `IsAffectedWindowsGpuBuildNumber` predicate returns true only for build `26200`; `IsAffectedWindowsGpuBuild` obtains the documented `TWindowsVersion.Build` via Inno Setup `GetWindowsVersionEx`. Static deterministic tests cover 26200=true, 26100=false, and 26300=false.
**Known-issue notice implementation:** A Traditional Chinese custom form is shown from `wpFinished` only when the Install build reached successful `ssPostInstall`, the OS build is affected, the wizard is interactive, and the notice has not already been shown. The Restore compiler branch contains no notice invocation. Actions are `完成`, `複製 --disable-gpu`, and `建立「Antigravity 安全模式（停用 GPU）」捷徑`; the copy path uses Windows `clip.exe` with a verified 13-byte no-newline input.
**Safe-mode shortcut implementation:** The compatibility auditor writes its already-resolved install directory only after PASS. The installer reuses that value, requires the corresponding official `Antigravity.exe` to exist, and calls `CreateShellLink` at the fixed current-user Desktop path `Antigravity 安全模式（停用 GPU）.lnk` with exactly `--disable-gpu`, the executable directory as working directory, and the official executable as icon. Repeated clicks target the same `.lnk`; failures update advisory status only and do not affect the completed localization. No normal shortcut/configuration is touched.
**Version bump result:** All authoritative current product/build/runtime, lockfile, Windows/macOS artifact, CI, packaging-test, generated notice, and README references are now ALT `1.1.1`. Historical handoff/legacy references were left unchanged.
**Tests run:** `npm ci --ignore-scripts --no-fund`; `npm run check`; `npm run check:packaging`; `powershell -ExecutionPolicy Bypass -File .\build\windows\build.ps1 -Arch x64`; `npm run check:windows-installer`; isolated Windows command check confirming clipboard input bytes equal exactly `--disable-gpu` (13 bytes, no newline); `git diff --check`.
**Test results:** PASS. Core smoke, compatibility audit, transactional rollback fault injection, macOS process-safety, packaging/CI policy, Inno compile, and Windows synthetic installer E2E all passed. Inno Setup 6.7.3 produced both `Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows.exe` and `Antigravity-ZH-Hant-TW-ALT-1.1.1-Windows-Restore.exe`. Silent install/reinstall/restore and failure exit behavior passed; the E2E also verifies the installer receives the preflight-resolved directory.
**Affected-machine validation:** `PENDING_USER_VALIDATION`  
**Known limitations / blockers:** Inno GUI rendering, actual build-26200 notice display, clipboard integration, and real Desktop `.lnk` properties cannot be fully asserted by the isolated headless E2E without mutating a real user desktop. No implementation blocker remains; affected-machine acceptance is intentionally pending.
**Notes for reviewer:** Manual GUI procedure: (1) start ALT 1.1.1 Windows installer interactively; (2) pass preflight; (3) observe mutation and confirm progress stays visibly below 100% while `localization_engine.js` runs; (4) confirm status describes localization/verification; (5) confirm 100% / completion appears only after success; (6) on build 26200.9448, verify the notice, exact clipboard content, safe-mode shortcut target/argument/working directory/icon, unchanged normal shortcut, safe-mode launch, and repeated-click idempotency. Also verify Restore and silent Install do not show the advisory or create a shortcut. Do not merge until this user validation and review are complete.
