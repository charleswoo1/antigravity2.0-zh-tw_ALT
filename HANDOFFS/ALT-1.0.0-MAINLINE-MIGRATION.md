# Handoff Contract — ALT 1.0.0 Mainline Migration

**Status:** `READY_FOR_CODEX`  
**Issue:** #1 — ALT 1.0.0 mainline migration: zero-prerequisite Windows/macOS installers  
**Repository:** `charleswoo1/antigravity2.0-zh-tw_ALT`  
**Target branch:** `main`  
**Implementation branch:** create a new short-lived branch from current `main`, suggested name `feature/alt-1.0.0-mainline`  
**Contract authority:** `AGENTS.md` > this contract > Issue #1  
**Prepared:** 2026-09-16

---

## 1. Baseline

At contract creation time:

- `main` baseline: `c14d11203c3ea60662bf9b5cef17234e7ad31387`
  - message: `feat: support Antigravity 2.13.0 localization`
  - current legacy engine/package version: `1.0.7`
  - verified target Antigravity version: `2.13.0`
- `release/v2` reference baseline: `b0feb54a0fffc0d1d3ac4bd9d680ed77c7b3193c`
  - historical installer-oriented beta experiment.
- `main` and `release/v2` have **no common ancestor**. Do not perform a normal branch merge.
- The historical `release/v2` branch does **not** contain the actual installer source. It contains documentation/screenshots and a small set of engine/package differences only. ALT 1.0.0 therefore needs a new, version-controlled, reproducible packaging implementation.
- The latest `main` engine contains the newer Antigravity 2.13.0 work and is the authoritative localization-core baseline.

Before implementation, re-fetch remote `main`. If its HEAD changed after this contract, inspect the newer commits and rebase the implementation branch on current `main`; do not silently revert newer work.

---

## 2. Product decisions — fixed

These decisions are already approved and must not be reopened during implementation unless a technical blocker makes one impossible.

### 2.1 Product identity

Product name:

> **Antigravity 2.0 繁體中文 ALT 版**

English identifier:

> **Antigravity 2.0 Traditional Chinese ALT**

ALT means **Alternative**.

Do not market the new product as “v2”, “v2 beta”, or “release/v2”.

### 2.2 Versioning

ALT starts a new product version line:

- ALT product version: **1.0.0**
- Supported Antigravity version for this release: **2.13.0**

These are independent values.

The engine should expose explicit metadata equivalent to:

```js
const EDITION = 'ALT';
const ENGINE_VERSION = '1.0.0';
const SUPPORTED_ANTIGRAVITY_VERSION = '2.13.0';
```

Package metadata should use version `1.0.0`.

### 2.3 Long-term branch model

After migration:

- `main` = only long-lived maintained product branch.
- Normal work = short-lived `feature/*` / `fix/*` branches → PR → `main`.
- Do not create a new permanent `release/v3`, `release/alt`, etc.
- `release/v2` remains temporarily for historical reference only.
- **Do not delete `release/v2` in this contract.** Branch archival/deletion requires a later explicit contract after Windows and macOS ALT validation.

### 2.4 End-user prerequisite policy

ALT public/private release artifacts must not require the user to preinstall:

- Node.js
- npm
- `@electron/asar`
- build tools
- package managers

End-user installation must work offline after the release artifact has been downloaded, except for OS security prompts or permissions.

Developer/build-machine prerequisites are allowed and must be documented separately.

### 2.5 GitHub Actions

No GitHub Actions, under any circumstances.

Build, test, packaging, release verification and signing steps must be runnable locally.

---

## 3. Target architecture

Use the current JavaScript localization engine rather than rewriting it in another language.

ALT 1.0.0 should package a pinned **portable Node.js runtime** plus production dependencies.

Conceptual payload:

```text
payload/
├─ runtime/
│  └─ node(.exe)
├─ localization_engine.js
├─ dicts/
├─ node_modules/
│  └─ @electron/asar + locked transitive dependencies
├─ package.json / package-lock.json as needed for provenance
├─ LICENSE
└─ THIRD_PARTY_LICENSES.md
```

The end user must never run `npm install`.

On the build machine, it is acceptable to use `npm ci` to construct the payload.

Do not bundle npm into the end-user payload unless a concrete technical reason is documented; npm is not required at runtime.

### 3.1 Runtime reproducibility

Introduce a version-controlled runtime manifest, for example:

`build/runtime-manifest.json`

It must record at least:

- exact Node.js version
- supported platform/architecture artifacts
- official download source template or provenance
- SHA-256 checksum for each runtime archive
- license/notices handling

Do not invent or assume a Node version. During implementation, select a currently supported Node.js LTS compatible with this project, verify it from the official Node distribution, then pin the exact version/checksums.

Build scripts must verify checksums before using downloaded runtime archives.

Downloaded runtimes and generated release artifacts should not be committed to Git.

---

## 4. Localization engine requirements

Start from current `main` `localization_engine.js`, not from `release/v2`.

Preserve all current Antigravity 2.13.0 behavior, including:

- strict supported-version validation
- `inspectAsar()`
- safe official backup creation/refresh
- protection against treating already-localized ASAR as an official backup
- `wizardPreload.js` translation
- `node_modules/chrome-devtools-mcp` unpack-dir handling
- post-pack ASAR verification
- fail-fast structural checks for menu/tray/loading injection points
- safe archive replacement
- safe restore validation
- module exports used by smoke tests

### 4.1 Required ALT changes

- Set product/engine version to ALT `1.0.0`.
- Add explicit ALT edition metadata.
- Preserve `SUPPORTED_ANTIGRAVITY_VERSION = '2.13.0'`.
- Preserve non-zero process exit status when install or restore fails. This was an important behavior in the old `release/v2` experiment and is required for wrapper/installer reliability.
- CLI `--version` output must report at least:
  - product/edition
  - ALT engine version
  - supported Antigravity version
- Runtime path handling must work when engine/dicts/node_modules are launched from a bundled payload rather than a source checkout.
- Do not depend on globally installed `node`, `npm`, or PATH for end-user execution.

---

## 5. Repository/build layout

Create a clear version-controlled packaging layout. Exact names may be adjusted if there is a strong reason, but prefer:

```text
build/
├─ runtime-manifest.json
├─ common/
│  └─ prepare-payload.js
├─ windows/
│  ├─ build.ps1
│  └─ installer.iss
└─ macos/
   ├─ build.sh
   └─ app/
      └─ launcher template/resources
```

Generated directories such as these should be ignored:

```text
.build/
dist/
vendor/runtime/
```

Do **not** ignore the actual installer/build source.

The historical `release/v2` pattern that kept installer source outside Git is not acceptable for ALT.

---

## 6. Windows ALT 1.0.0 deliverable

### 6.1 Required output

Primary artifact:

`Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows.exe`

A separate restore executable is acceptable if that keeps the implementation substantially simpler and safer:

`Antigravity-ZH-Hant-TW-ALT-1.0.0-Windows-Restore.exe`

Prefer sharing one payload/build definition between install and restore variants.

### 6.2 Packaging approach

Preferred first implementation: **Inno Setup** as the Windows wrapper/installer, with the portable Node runtime and payload embedded.

Reason:

- mature and lightweight
- no runtime dependency on the target machine
- supports local/offline packaging
- can execute the bundled runtime and inspect exit codes
- avoids shipping Electron/Chromium solely for an installer UI

Inno Setup is a **build-machine dependency**, not an end-user dependency.

If Codex identifies a materially better zero-prerequisite packaging method, document the reason in the PR before deviating.

### 6.3 Runtime behavior

The Windows wrapper must:

1. extract/use its bundled payload;
2. invoke bundled `node.exe`, never global Node;
3. run install or restore through `localization_engine.js`;
4. capture exit status;
5. report success only when the engine returns success;
6. surface a useful failure message/log location;
7. clean temporary payload files when appropriate;
8. never download dependencies on the end-user machine.

Do not require PowerShell execution-policy changes.

---

## 7. macOS ALT 1.0.0 deliverable

Current distribution policy is **free/private use for the owner, family and friends**.

Do not require paid Apple Developer Program membership.

### 7.1 Primary format

Prefer a standalone macOS `.app` bundle rather than an unsigned installer `.pkg` for ALT 1.0.0.

Suggested artifact names:

- `Antigravity-ZH-Hant-TW-ALT-1.0.0-macOS-arm64.app.zip`
- `Antigravity-ZH-Hant-TW-ALT-1.0.0-macOS-x64.app.zip`

Separate architecture builds are preferred over an oversized dual-runtime universal package for 1.0.0.

The app should provide a simple choice to:

- install/apply Traditional Chinese localization
- restore official Antigravity files

A minimal native/system UI is sufficient. Do not add Electron solely to implement this launcher.

Using a shell launcher plus built-in macOS `osascript` dialogs is acceptable if it is reliable and paths are correctly quoted.

### 7.2 Bundled runtime

Each architecture-specific app must bundle the matching Node runtime and dependencies.

The app must call its own bundled runtime using a path relative to the app bundle.

### 7.3 Signing policy

For ALT 1.0.0:

- no Developer ID certificate
- no Apple notarization
- no paid signing requirement
- ad-hoc signing is allowed/recommended where useful

Build logic should be structured so a future Developer ID signing/notarization stage can replace the ad-hoc signing stage without redesigning the app.

If nested Mach-O executables exist, sign them before signing the outer app bundle. Do not rely on disabling Gatekeeper globally.

### 7.4 User instructions

README must explain the expected first-run Gatekeeper behavior for an unnotarized private build and provide the safe method:

- attempt to open the app
- use macOS System Settings → Privacy & Security → Open Anyway / equivalent wording

Do not instruct users to disable Gatekeeper system-wide and do not require commands such as `spctl --master-disable`.

---

## 8. Tests and acceptance criteria

### 8.1 Existing tests

Preserve and update `tests/smoke.test.js`.

`npm run check` on a development checkout must continue to run syntax + smoke tests locally.

### 8.2 Add packaging tests

Add local tests/scripts that verify at minimum:

- ALT version metadata is `1.0.0`
- supported Antigravity version is `2.13.0`
- `dicts/v2_13.json` is included in payload
- runtime manifest parses and has checksums
- packaged payload includes `@electron/asar`
- engine can be invoked using the staged/bundled runtime, without relying on global Node at execution time
- failure from engine propagates to wrapper/installer as failure
- install and restore fixture tests do not create duplicate localization signatures
- build artifacts do not contain an Antigravity official `app.asar`

Use synthetic fixture ASARs for automated/local tests. Do not commit proprietary Antigravity binaries.

### 8.3 Platform validation

Windows artifact must be built/tested on Windows.

macOS artifact must be built/tested on macOS.

If Codex's execution environment cannot perform one platform's final build, it must:

- still implement the build source and validation scripts;
- run all platform-independent tests;
- clearly mark that platform's real artifact validation as `PENDING_MANUAL_PLATFORM_VALIDATION`;
- not claim success for a platform it did not actually build/test.

### 8.4 Acceptance checklist

The PR is ready for review only when:

- [ ] product naming has changed to ALT
- [ ] package/engine version is ALT 1.0.0
- [ ] target Antigravity remains 2.13.0
- [ ] current 2.13.0 localization engine behavior is preserved
- [ ] wrapper receives correct engine exit code
- [ ] Windows build source is committed and reproducible locally
- [ ] macOS app build source is committed and reproducible locally
- [ ] end-user artifacts do not require Node/npm
- [ ] end-user build does not perform `npm install`
- [ ] runtime/dependency versions are pinned
- [ ] runtime checksums are verified by build scripts
- [ ] third-party license/notices are included appropriately
- [ ] no GitHub Actions workflow exists
- [ ] README describes ALT only as the current product
- [ ] legacy v1/v2 documentation is clearly archived/identified as legacy, not current instructions
- [ ] smoke tests pass
- [ ] packaging tests pass where the platform is available
- [ ] no official Antigravity proprietary payload is committed or shipped

---

## 9. README and legacy cleanup

Rewrite the main README around **ALT 1.0.0**.

The first-time user path should be:

```text
Install Antigravity
→ download ALT artifact for the OS/architecture
→ run it
→ localization complete
```

Do not tell normal ALT users to install Node.js/npm.

Preserve technical/developer build instructions in a separate section.

The old v1 instructions and the `README-v2.0.0-beta.md` content may be archived or removed from current navigation, but do not present them as current recommended usage.

Historical Git tags/commits already preserve the old implementation.

Legacy `.bat` / `.command` launchers may be removed from the current ALT product once equivalent ALT wrappers are in place and tests pass.

---

## 10. Dependency and licensing rules

- Keep `package-lock.json` deterministic.
- Use `npm ci` for build payload preparation.
- Include only production dependencies required by the runtime payload.
- Update `THIRD_PARTY_LICENSES.md` for bundled Node.js and any newly shipped third-party components.
- Keep project `LICENSE` in release payloads.
- Do not bundle Antigravity official code/assets beyond modifying the user's locally installed files at runtime.
- Do not download or redistribute official `app.asar`.

---

## 11. Git execution rules for Codex

1. Sync remote and start from current `main`.
2. Read `AGENTS.md`, this contract and Issue #1 before editing.
3. Create a short-lived branch, preferably `feature/alt-1.0.0-mainline`.
4. Do not merge `release/v2`; inspect it only as historical reference.
5. Implement in logical commits. Suggested commit grouping:
   - product metadata / ALT naming
   - portable-runtime build infrastructure
   - Windows packaging
   - macOS app packaging
   - tests
   - README/license/legacy cleanup
6. Run all available local tests.
7. Push the branch.
8. Open a PR to `main` referencing `#1`.
9. Do not merge the PR.
10. Update this contract on the implementation branch:
    - set Status to `READY_FOR_REVIEW`
    - fill in Execution Result
    - list tests actually run
    - identify any pending real-platform validation
    - include PR number/URL
11. Add the same high-level result to Issue #1.

---

## 12. Explicit non-goals for this contract

Do not:

- delete `release/v2`
- rewrite Git history
- create GitHub Actions
- buy/configure Apple Developer Program membership
- implement Apple Developer ID signing/notarization
- publish to the Mac App Store
- redesign the localization translation engine from JavaScript into another language
- add Electron merely for installer UI
- broaden support to Antigravity versions other than 2.13.0 unless a new official version appears during execution and the user explicitly approves updating the target

---

## 13. Execution Result

**Codex: update this section during implementation.**

- Status:
- Implementation branch:
- Commits:
- PR:
- Tests run:
- Windows validation:
- macOS validation:
- Remaining blockers:
- Notes:
