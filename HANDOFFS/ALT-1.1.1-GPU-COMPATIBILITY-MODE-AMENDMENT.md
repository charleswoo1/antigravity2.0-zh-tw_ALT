# Handoff Amendment — ALT 1.1.1 Windows 11 25H2 GPU Compatibility Mode

**Status:** `READY_FOR_REVIEW`  
**Applies to:** `HANDOFFS/ALT-1.1.1-WINDOWS-INSTALLER-PROGRESS-GPU-KNOWN-ISSUE.md`  
**Issue:** #12  
**PR:** #13  
**Prepared:** 2026-09-17

## Why this amendment exists

Affected-machine validation on Windows 11 Enterprise 25H2 build `26200.9448` changed the workaround conclusion:

```text
normal launch            → can fail after quit/relaunch cycles
--disable-gpu            → still intermittently fails
--disable-gpu-sandbox    → stable PASS in repeated affected-state testing
```

The original handoff therefore overstates `--disable-gpu` as the supported workaround. This amendment supersedes the original contract wherever it describes the user-facing GPU workaround, shortcut name, shortcut argument, copy action, or sandbox prohibition.

## Superseding requirements

1. Remove the user-facing `--disable-gpu` copy action.
2. Do not create or advertise `Antigravity 安全模式（停用 GPU）`.
3. Provide one opt-in Desktop shortcut named:

```text
Antigravity 相容模式
```

4. The shortcut must target the already-validated official `Antigravity.exe` with exactly:

```text
--disable-gpu-sandbox
```

5. Repeated shortcut creation must update the same `Antigravity 相容模式.lnk` path and must not create duplicates.
6. The normal Antigravity shortcut/configuration must remain unchanged.
7. The advisory should instruct users to try restarting Windows first; if the relaunch failure repeatedly returns, they may use the compatibility-mode shortcut.
8. The advisory and documentation must explicitly state that compatibility mode disables the Chromium GPU process sandbox and therefore reduces that process's security isolation. It is a temporary compatibility workaround, not a safer mode.
9. `--no-sandbox` remains forbidden and must not be offered.
10. Restore, silent install, and non-26200 builds must not show the advisory or create the compatibility shortcut automatically.

## Validation status

User validation already passed the installer progress behavior, compact advisory layout, Restore-specific wording, normal-shortcut preservation, and the general Windows 11 25H2 reproduction flow.

Final release gate after this amendment:

1. Install the amended build on the affected machine.
2. Confirm the advisory contains no `--disable-gpu` copy action or old safe-mode wording.
3. Create `Antigravity 相容模式` and verify:
   - target = official `Antigravity.exe`;
   - arguments = exactly `--disable-gpu-sandbox`;
   - working directory = official Antigravity directory;
   - normal shortcut unchanged;
   - repeated creation produces no duplicate.
4. Reproduce normal relaunch failure and confirm `Antigravity 相容模式` launches successfully and remains stable.
5. Confirm Restore does not show the advisory.

Until these amended shortcut checks pass, PR #13 remains `PENDING_USER_VALIDATION` and must not be merged.
