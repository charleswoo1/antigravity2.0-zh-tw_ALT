# Handoff — ALT 2.33.0 Release

**Status:** COMPLETE
**Issue:** [#109](https://github.com/charleswoo1/antigravity2.0-zh-tw_ALT/issues/109)
**Baseline commit:** f0c2bae2bbd22127a042c858b5487582c5e164f3 (main after PR #108)
**Authorization:** The owner requested publication on 2026-11-19.

## Goal

Publish ALT 2.33.0 from verified main through the controlled Release bridge. Verify the public download assets and record the outcome.

## Non-goals

Translation changes, replacement of existing releases and changes to the local installation are outside this release.

## Constraints

Follow AGENTS.md and RELEASING.md. The release branch must start at the current main SHA after its CI succeeds. Use package.json as the authority for the version. Use only the controlled workflow for publication.

## Implementation steps

1. Verify PR #108 CI and merge the validated head.
2. Verify main CI and push release/v2.33.0 at that exact commit.
3. Follow the publication workflow to completion.
4. Verify latest Release status, annotated tag target, fixed-name assets, SHA-256 digests and permanent links.
5. Submit the release evidence on a separate PR.

## Acceptance criteria

PR CI, main CI and the controlled Release run pass. ALT 2.33.0 is the latest formal Release. The tag resolves to the validated SHA. All five assets are present with working permanent links, and the four binary and archive digests match SHA256SUMS.txt.

## Tests

CI exercises core and packaging checks, Windows installer E2E and macOS builds. The release workflow repeats its policy checks, dependency audit and platform builds. Post-publication verification checks GitHub's API, SHA-256 and HTTP responses.

## Git / PR rules

Use the release workflow to create the annotated tag and Release from the authorized release branch. Record evidence on a separate PR against main.

## Execution Result

- PR #108 passed all four checks in run 44447758580 at 8608779208dcdbbb396eeb7674a9a19e2bfddda5 and was merged at the baseline commit.
- The authenticated actor charleswoo1 matched the repository owner. The release branch and tag were unused; previous latest was v2.32.2.

- Main CI 44459546612 passed at the baseline. Controlled Release 44459880362 rebuilt and verified Windows x64 and both macOS packages, then published ALT 2.33.0.
- ALT 2.33.0 is the latest formal Release. The annotated tag resolves to the baseline. The four SHA-256 entries match the published asset digests, the checksum file digest matches GitHub's metadata, and all five permanent downloads returned HTTP 200.
- Antigravity-ZH-Hant-TW-ALT-macOS-arm64.zip sha256:f416c88a093e84aeaf5d6b0bdd74f1513c30f6f643d1b9f821883a7bfdffb53d
- Antigravity-ZH-Hant-TW-ALT-macOS-x64.zip sha256:e0b0efc7affa8b1ddb254b484ba90ddfb1eaadf1974dbd6c62f5901be2cc3b19
- Antigravity-ZH-Hant-TW-ALT-Windows-Restore.exe sha256:30de6bf4331c83a141aee4805f497e53e15f1cec4c3e8c88b4bd47b8335c1cc0
- Antigravity-ZH-Hant-TW-ALT-Windows.exe sha256:3012173b867438d7da3e54dd53bb2a30df913d48868c94e14524ca795e78b97f
- SHA256SUMS.txt sha256:a7f9f0e0c11773409be36c221aebf69c060dbe87ad46cf2f28d90fd6f34843bf
