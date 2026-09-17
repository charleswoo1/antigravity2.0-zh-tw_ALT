# Handoff Amendment — ALT 1.1.1 Windows 11 25H2 GPU Compatibility Mode

**Status:** `READY_TO_MERGE`  
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

## Validation result

**Affected-machine validation:** `PASSED_USER_VALIDATION`

Validated on Windows 11 Enterprise 25H2 build `26200.9448` before release preparation:

- corrected installer progress behavior: PASS;
- compact advisory layout and readable text: PASS;
- Restore-specific progress wording: PASS;
- normal Antigravity shortcut remains unchanged: PASS;
- old `--disable-gpu` flow removed from the amended design: PASS;
- `Antigravity 相容模式` uses `--disable-gpu-sandbox`: PASS;
- compatibility-mode launch remains reliable when normal relaunch fails: PASS;
- release preparation authorized by the user after validation.

Automated CI on the amended implementation also passed. PR #13 is therefore ready for final merge/release processing, subject only to the normal final CI/head-SHA check.
