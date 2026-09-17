# Handoff Amendment — ALT 1.1.1 Windows 11 25H2 GPU Compatibility Mode

**Status:** `COMPLETE`  
**Applies to:** `HANDOFFS/ALT-1.1.1-WINDOWS-INSTALLER-PROGRESS-GPU-KNOWN-ISSUE.md`  
**Issue:** #12 — closed by PR #13  
**PR:** #13 — merged to `main` as `c722e2a6f06a6b963f51dab6e32bcbc36bacce97`  
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

## Completion

- PR #13 final head CI run #35: PASS.
- PR #13 merged to `main`: `c722e2a6f06a6b963f51dab6e32bcbc36bacce97`.
- Issue #12: closed.
- README stable `releases/latest/download/...` links and fixed public Windows asset filenames are in `main`.
- Release processing for ALT 1.1.1 is authorized.
