# Handoff / Implementation Contract — Localization Coverage Audit

- **Status:** IN_PROGRESS
- **Issue:** [#39 — Audit and fix UI localization gaps across Antigravity](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/39)
- **Baseline commit:** `2d8f801f450f68b70be76cce33af067cfa37d149` (`origin/main`)
- **Implementation branch:** `codex/fix-models-usage-localization`

## Goal

Audit the existing application wide dictionary and translation path, fix the missing UI text shown in the Models & Usage screenshot, and make existing dictionary translations reliable when UI frameworks split text across nodes. Preserve all intentionally untranslated developer content and product names.

## Non-goals

- Do not translate source code, terminal or debug output, user input, suggestions, paths, URLs, identifiers, or other protected developer content.
- Do not alter an active Antigravity installation or claim a visual audit of screens that cannot be accessed in this session.
- Do not bump the ALT version, release, or merge this PR.

## Constraints

- Follow `AGENTS.md` and use `package.json.version` as the version authority.
- Keep the blocked zone and blocked tag boundary intact or stronger.
- Limit dynamic translation rules to known UI messages and validated formats; leave unknown technical strings untouched.
- Keep official Antigravity proprietary files out of commits and releases.

## Implementation steps

1. Sync `main`, inspect the screenshot, installed 2.17.0 metadata, existing dictionaries, and generated translation code.
2. Audit every dictionary entry for normalized collisions and resolve conflicting mappings.
3. Add the missing Models & Usage UI labels and bounded dynamic quota text translation.
4. Handle exact dictionary phrases split across safe UI text nodes and strengthen protected zone traversal.
5. Add regression tests for dictionary integrity, split UI text, dynamic usage text, and preserved protected content.
6. Run core and packaging checks, commit and push the branch, open a PR to `main`, and record results here.

## Acceptance criteria

- The visible English UI in the supplied screenshot has matching translations, while Google AI Pro, Gemini, Claude, GPT, and Antigravity remain product names.
- Known weekly and five hour refresh messages translate with variable day, hour, minute, or second values; unknown formats stay unchanged.
- Existing dictionary entries can match UI text split across a small safe subtree.
- Deep blocked zones and every `contenteditable` form remain protected.
- All dictionaries have no conflicting normalized or split text keys.
- `npm run check` and `npm run check:packaging` pass.

## Tests

- `npm run check`
- `npm run check:packaging`
- `npm run check:windows-installer` when the Windows installer has first been built.
- `git diff --check`

## Git / PR rules

- Work on the short lived implementation branch above, based on `origin/main`.
- Commit and push the implementation, then open a PR to `main` and attach it to the task.
- Do not merge the PR or create a release branch, tag, or Release.

## Execution Result

- Read-only installed archive check: Antigravity `2.17.0` is localized. Its preload contains `Your Plan: Google AI Pro` and `Weekly Limit Remaining`, but lacks the screenshot's Gemini / Claude group labels and variable refresh sentence.
- Audited all seven dictionaries: 924 entries, 915 unique normalized keys after removing conflicting normalized duplicates. Intentional identity entries such as brand names, `Agent`, a port number, and a technical path remain unchanged.
- Added safe split-node matching for existing dictionary phrases. Expanded protected-zone traversal beyond twelve ancestors and recognized empty or `plaintext-only` `contenteditable` values.
- Added screenshot UI strings and bounded dynamic quota refresh translation. Unknown duration formats remain unchanged.
- `npm run check`: PASS, including the new dictionary, runtime, and protected-zone tests.
- `npm run check:packaging`: PASS.
- Windows x64 installer build and `npm run check:windows-installer`: PASS in isolated test fixtures.
- `git diff --check`: PASS.
- Live visual verification of every application screen is unavailable from the current Electron accessibility tree; the audit covers the complete checked-in dictionary and generated translation path, plus the supplied screenshot and synthetic DOM cases.
- Commit and pull request: pending.
