# Handoff Contract — ALT 1.0.0 macOS Process Safety

**Status:** `READY_FOR_REVIEW`  
**Issue:** #4 — ALT 1.0.0 macOS process safety: detect running Antigravity and abort  
**Parent migration:** #1  
**Current implementation PR:** #3 — `feature/alt-1.0.0-mainline` → `main`  
**Repository:** `charleswoo1/antigravity2.0-zh-tw_ALT`  
**Prepared:** 2026-09-16

---

## 1. Purpose

Replace the current macOS behavior that attempts to close/terminate Antigravity with a **fail-safe detection-only guard**.

The ALT app must never automatically quit, kill, or terminate the official Antigravity process on macOS.

The user-facing rule becomes:

```text
Antigravity is still running
→ ALT detects it by exact process name
→ ALT aborts before modifying anything
→ user closes Antigravity manually
→ user runs ALT again
```

This change is required before the user performs real macOS validation.

---

## 2. Fixed product decision

For macOS ALT 1.0.0:

- do **not** use AppleScript to quit Antigravity;
- do **not** use `pkill`, `killall`, or other process termination commands;
- do **not** use broad full-command matching such as `pkill -f`;
- use exact-name detection only, preferably `pgrep -x Antigravity`;
- if Antigravity is running, installation/restore must fail safely with a clear message and non-zero exit status;
- if process-state detection itself fails or returns an unexpected status, fail closed and do not modify files;
- Windows behavior is outside this handoff and should remain unchanged.

---

## 3. Git execution

Do not open a new product implementation branch.

Apply this fix directly to the existing PR #3 branch:

`feature/alt-1.0.0-mainline`

Execution sequence:

1. `git fetch origin`.
2. Read:
   - `origin/main:AGENTS.md`
   - `origin/main:HANDOFFS/ALT-1.0.0-MACOS-PROCESS-SAFETY.md`
   - Issue #4
   - PR #3 latest discussion.
3. Checkout `feature/alt-1.0.0-mainline`.
4. Bring the latest `main` documentation into the branch only if needed for a clean final PR; do not rewrite unrelated history.
5. Implement the fix.
6. Run tests.
7. Commit and push to the same branch so PR #3 updates automatically.
8. Update this contract's Execution Result on the implementation branch if the file is present there, and add a concise result comment to Issue #4 and PR #3.
9. Do not merge PR #3.

No GitHub Actions.

---

## 4. Required engine behavior

### 4.1 Exact macOS process-state detection

Introduce a small, testable helper with semantics equivalent to:

```text
pgrep -x Antigravity returns 0 → RUNNING
pgrep -x Antigravity returns 1 → NOT_RUNNING
spawn error / timeout / other exit code → UNKNOWN
```

Recommended API shape:

```js
getMacAntigravityProcessState(...)
→ 'running' | 'not-running' | 'unknown'
```

or an equivalent explicit result object.

Make the logic unit-testable on Windows/Linux by allowing the process runner to be injected or by separating result interpretation from the real `spawnSync` call.

Do not merely grep source text; tests should exercise status interpretation.

### 4.2 Fail closed

Before any mutable operation on macOS:

- backup creation/refresh;
- temporary localized archive creation that can affect the installation directory;
- archive replacement;
- restore copy/replace;
- backup deletion;

ensure the official Antigravity process is not running.

Read-only inspection such as checking version / reading ASAR metadata is allowed before the guard.

If state is `running`:

- print a Traditional Chinese message equivalent to:
  `[錯誤] 偵測到 Antigravity 仍在執行。請先完全關閉 Antigravity，再重新執行 ALT。`
- return failure;
- wrapper/app must receive a non-zero exit code;
- do not create or modify `app.asar.bak`;
- do not create a localized replacement archive in the Antigravity resources directory;
- do not replace/delete `app.asar`.

If state is `unknown`:

- print a clear detection-failure message;
- fail with non-zero exit code;
- do not modify Antigravity files.

### 4.3 Existing option compatibility

Current tests/wrappers use `--skip-process-close`.

Do not break Windows tests or existing internal test flows solely to rename this flag.

If the flag remains, document its semantics in code/tests as an internal/testing bypass. On macOS normal user execution, the guard must run.

Do not add a public UI option that lets ordinary users bypass the safety guard.

---

## 5. Remove obsolete macOS auto-close logic

Remove:

- `getMacProcessClosePlan()`;
- macOS `osascript` quit logic;
- macOS `pkill -x Antigravity`;
- related tests that assert the old graceful-quit/fallback plan.

The engine source should contain no macOS path that terminates Antigravity.

A regression assertion may verify that macOS process handling does not include:

- `pkill`
- `killall`
- AppleScript `tell application "Antigravity" to quit`

Do not remove Windows `taskkill` behavior as part of this task.

---

## 6. Tests

Update `tests/smoke.test.js` and/or add a focused unit test.

Required cases:

1. simulated `pgrep` status 0 → state = running;
2. simulated `pgrep` status 1 → state = not-running;
3. simulated status >1 → state = unknown;
4. simulated spawn error → state = unknown;
5. exact command/arguments are `pgrep`, `-x`, `Antigravity`;
6. no macOS termination command is used;
7. existing `npm run check` passes;
8. existing `npm run check:packaging` passes;
9. rebuild Windows x64 artifacts and rerun `npm run check:windows-installer` to confirm no regression.

If practical, add a synthetic test proving the macOS guard runs before backup mutation by injecting/mock-stubbing the process-state helper. If this would require disproportionate refactoring, document why and keep the helper-level tests plus real-macOS validation requirement.

---

## 7. README changes

Keep macOS status:

`PENDING_MANUAL_PLATFORM_VALIDATION`

Add one explicit sentence in the macOS user instructions:

> ALT 不會自動關閉 Antigravity；若偵測到 Antigravity 仍在執行，會安全中止。請先完全關閉 Antigravity 後再重新執行。

Do not change macOS to "validated" in this task.

Do not change Gatekeeper guidance.

---

## 8. Acceptance criteria

All must be true before this handoff is `READY_FOR_REVIEW`:

- [ ] macOS no longer uses AppleScript to quit Antigravity.
- [ ] macOS no longer uses `pkill` / `killall` to terminate Antigravity.
- [ ] exact-name detection uses `pgrep -x Antigravity` or a technically equivalent exact match.
- [ ] detection status 0/1/error semantics are explicitly tested.
- [ ] running Antigravity causes safe abort and non-zero exit.
- [ ] unknown detection state causes safe abort and non-zero exit.
- [ ] no Antigravity ASAR/backup mutation occurs after a failed guard.
- [ ] Windows behavior remains unchanged.
- [ ] `npm run check` passes.
- [ ] `npm run check:packaging` passes.
- [ ] Windows installer E2E test still passes after rebuild.
- [ ] README explains manual-close/fail-safe behavior.
- [ ] macOS remains marked experimental / pending real-platform validation.
- [ ] no GitHub Actions were added.

---

## 9. After this fix

After this handoff passes review, PR #3 may be merged with macOS still explicitly experimental.

The user's later real-Mac validation should then focus on:

```text
build on Mac
→ ZIP creation
→ transfer/download with quarantine
→ extract
→ Gatekeeper / Open Anyway
→ launch ALT
→ verify running-Antigravity guard
→ close Antigravity manually
→ install localization
→ launch Antigravity and verify UI
→ close Antigravity
→ restore official files
→ verify official Antigravity starts normally
```

Do not delete `release/v2` as part of this handoff.

---

## 10. Execution Result

- Status: `READY_FOR_REVIEW`
- Implementation commit(s):
  - `e23430a` — `fix(macos): fail safely when Antigravity is running`
  - `922efc5` — `fix: clean late macOS guard artifacts`
- PR: [#3 — feat: migrate mainline to ALT 1.0.0](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/3)
- Process-state helper: `getMacAntigravityProcessState(processRunner)` invokes exactly `pgrep -x Antigravity` with a 5-second timeout and maps status `0` to `running`, status `1` to `not-running`, and errors, signals, missing results, or all other statuses to `unknown`. Both `running` and `unknown` fail closed. macOS ignores the internal Windows-fixture `skipProcessClose` bypass and rechecks immediately before backup/restore mutation, localized archive creation, archive replacement, and backup deletion.
- Tests run:
  - `npm run check` — passed, including status interpretation, exact command arguments, spawn-error handling, forbidden termination-command and `npm install` message regression assertions, initial install/restore no-mutation fixtures, install `not-running → not-running → running` cleanup, and restore `not-running → running` cleanup
  - `npm run check:packaging` — passed
  - `npm ci --ignore-scripts --no-fund` — passed
  - `npm audit --omit=dev` — passed, 0 vulnerabilities
  - macOS x64 and arm64 payload preparation, official runtime SHA-256 verification, and structural verification — passed on Windows
  - Windows x64 Inno Setup build — passed
  - `npm run check:windows-installer` — passed after rebuild, including install, repeated install, restore, and non-zero failure propagation
- Windows regression result: `PASSED_ON_WINDOWS_X64`. Windows retains exact `taskkill /f /im Antigravity.exe` behavior. Final local artifacts: install SHA-256 `2FE0603DF3A1E08AB03F11BA3BA63EB101A7BC5262CBAC64F7A677A7E7273797`; restore SHA-256 `892568F1DCF69262A96C8E9509A9C671880462E10B229BC0F2F5E9321CCF4F84`. Generated artifacts remain ignored and are not committed.
- macOS real-platform validation: `PENDING_MANUAL_PLATFORM_VALIDATION`. This Windows host cannot build/sign/launch the `.app` or verify quarantine, Gatekeeper, and live `pgrep` behavior.
- Remaining blockers: Matching macOS x64/arm64 hosts are still required for the documented real-distribution validation before macOS can be described as production-supported.
- Notes: macOS contains no AppleScript quit, `pkill`, or `killall` path. Late guard failures remove ALT-created localized/restore temp artifacts while preserving the official ASAR and backup. The final legacy end-user `npm install` instruction was replaced with a bundled-package recovery message. README states that ALT never closes Antigravity automatically and safely aborts when it is running. No GitHub Actions were added or used; `release/v2` remains untouched; no proprietary Antigravity ASAR was committed or shipped.
