# Handoff / Implementation Contract — Windows GPU Advisory Retirement

**Status:** `READY_FOR_REVIEW`  
**Issue:** [#47](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/47)  
**Target:** `main`  
**Baseline commit:** `ef5a6a7f5deee98c902de958c17585e0b225dd3a`  
**Implementation branch:** `fix/retire-windows-gpu-known-issue`  
**Prepared:** 2026-09-30

## 1. Goal

Retire the active Windows 11 25H2 / Build 26200.x GPU/renderer post-install Known Issue advisory after the original affected machine completed a 10/10 normal launch → full load → quit → relaunch regression cycle on Antigravity 2.18.1 without reproducing the failure.

## 2. Evidence and interpretation

- Historical state: the issue was previously reproducible on the affected Windows machine after repeated quit/relaunch cycles.
- Current regression evidence (2026-09-30): 10 consecutive normal cycles completed successfully on Antigravity 2.18.1.
- Therefore the issue is no longer treated as an active install-time warning for the current verified baseline.
- This does **not** claim that Google, Electron, Chromium, NVIDIA, Microsoft, or Antigravity has formally fixed every instance of this issue class on every Windows machine.

## 3. Required changes

1. Remove the automatic post-install Build 26200.x GPU advisory popup from the Windows installer.
2. Remove installer code that creates the old `--disable-gpu-sandbox` compatibility shortcut.
3. Remove the obsolete build-26200 predicate and its packaging assertions.
4. Keep installer preflight, process-safety checks, progress UX, rollback and release behavior unchanged.
5. Replace README and COMPATIBILITY active Known Issue wording with a historical/troubleshooting note:
   - record the 2026-09-30 10/10 PASS on Antigravity 2.18.1;
   - describe the old symptom without presenting it as currently expected;
   - if the symptom recurs, prefer `--disable-gpu` as a temporary diagnostic fallback;
   - do not recommend `--disable-gpu-sandbox` or `--no-sandbox`;
   - normal Antigravity launch remains preferred.
6. Keep ALT version at 1.5.0. This is a documentation/installer behavior correction, not a release-version bump.

## 4. Non-goals

- Do not change the Antigravity verified-version allowlist.
- Do not alter localization dictionaries or protected-zone behavior.
- Do not claim a universal upstream fix.
- Do not publish a Release.
- Do not merge automatically.

## 5. Tests

At minimum:

```bash
npm ci --ignore-scripts --no-fund
npm run check
npm run check:packaging
```

CI/Windows validation should also build the Windows installer and run `npm run check:windows-installer`.

Static packaging coverage must verify that the active installer no longer contains:
- the Build 26200 GPU advisory predicate;
- the post-install GPU notice form;
- `--disable-gpu-sandbox`;
- `--no-sandbox`.

## 6. Acceptance criteria

- [ ] No successful normal install automatically shows the legacy Windows GPU advisory.
- [ ] Windows installer no longer creates or recommends a `--disable-gpu-sandbox` shortcut.
- [ ] README describes the issue as historical / troubleshooting only.
- [ ] COMPATIBILITY records the 10/10 regression PASS and preserves the non-universal-fix caveat.
- [ ] `--disable-gpu` is the only documented GPU fallback.
- [ ] Existing compatibility preflight, rollback and progress behavior are unchanged.
- [ ] Packaging checks pass.
- [ ] PR is opened against `main` for review.

## 7. Execution Result

- Implementation branch: `fix/retire-windows-gpu-known-issue`
- PR: [#48 — fix: retire active Windows GPU compatibility advisory](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/pull/48)
- Base: `ef5a6a7f5deee98c902de958c17585e0b225dd3a`
- Installer: removed Build 26200 detection, automatic post-install GPU advisory UI, and the `--disable-gpu-sandbox` compatibility-shortcut implementation.
- Documentation: README and COMPATIBILITY now classify the issue as historical/troubleshooting, record the 2026-09-30 Antigravity 2.18.1 real-machine 10/10 normal relaunch PASS, and retain only `--disable-gpu` as a temporary diagnostic fallback.
- Tests: packaging assertions now fail if the active installer reintroduces the legacy affected-build predicate, GPU notice UI, `--disable-gpu-sandbox`, or `--no-sandbox`. Windows E2E wording no longer depends on the retired shortcut behavior.
- First PR CI run: [#122 / run 36666668854](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/actions/runs/36666668854) — PASS.
  - Core / Ubuntu: PASS
  - Windows x64 installer build + E2E + fixed-name Release staging: PASS
  - macOS x64 app build + extracted ZIP validation: PASS
  - macOS arm64 app build + extracted ZIP validation: PASS
- Direct local checkout was not available in the ChatGPT execution environment because outbound DNS/network access from the container was unavailable; validation therefore used the repository's controlled GitHub Actions workflow.
- No ALT version bump, tag, Release, production asset publication, or merge was performed.
