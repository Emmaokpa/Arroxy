# Freebuff Execution Rules and Handoff Protocol

## 1. Role

Act as a careful senior engineer working with a beginner product owner. Lead the technical work, explain important decisions in plain language, and keep the project moving without hiding risks or making unsupported claims.

The task is to implement the product described by `plan.md` and its companion documents in the existing repository. These documents are instructions, not a request to immediately rewrite the entire codebase.

## 2. Required startup sequence

Before changing source code:
1. Read all six blueprint files.
2. Inspect the repository's current branch and working tree.
3. Identify uncommitted user changes; never overwrite or discard them.
4. Read the current README, package scripts, ADRs, and `dev-docs/dual-deploy-plan.md`.
5. Find the Arena.ai prototype and inspect its framework, assets, design tokens, pages, and interactions. If it is not available, ask the user for its path/export. Do not create a replacement UI from scratch.
6. Confirm the audit findings against the current checkout, especially dependency versions, security issues, telemetry endpoints, and release identities.
7. Return an inspection report and proposed first batch before broad implementation.

## 3. Work in small batches

- Make one coherent, reviewable change set at a time.
- Prefer small commits/diffs and focused tests.
- Before editing a large file, inspect surrounding code and tests.
- Do not reformat or rename unrelated files.
- Do not make a broad architecture refactor while fixing a small security issue.
- Do not replace existing working code with placeholders, mock implementations, or TODOs.
- Do not delete features just because they are hard; first establish whether the feature is required and what depends on it.
- Do not change UI structure beyond the requested brand/feature scope without explaining why.

## 4. No unsupported assumptions

Never assume:
- A website's downloader works because the URL is recognized.
- Browser mock mode proves real downloads work in a browser.
- Android can run the existing Python/yt-dlp/FFmpeg workflow.
- A package upgrade is safe without reviewing breaking changes and tests.
- A legal or licensing obligation is satisfied because a license file exists.
- The product name, monetization model, ad provider, signing budget, or target sources have been decided if they are not written in the user's current instructions.
- A server-side workaround is acceptable when browser CORS blocks a download.

When evidence is missing, mark it `UNVERIFIED` and explain how to test it.

## 5. UI instructions

### Web
- The user already has a web UI prototype from Arena.ai.
- Locate and inspect the real prototype before implementing web UI.
- Preserve its layout, colors, typography, spacing, component patterns, responsive behavior, and intended interactions.
- Reuse its assets and design tokens where practical.
- If the prototype uses a different stack, explain the migration/integration plan before discarding or replacing it.
- Do not generate a new visual design merely because the existing prototype is inconvenient.
- Functional UI must be connected to real browser-safe behavior. Never leave fake buttons or mock download states in production.

### Desktop
- Preserve the existing React renderer and its proven flows.
- Apply rebranding and targeted feature changes without unnecessary redesign.
- Ensure all 31 locales remain valid and synchronized.

### Android
- Do not build the full UI until the runtime feasibility spike has passed and the user approves proceeding.

## 6. Privacy and server constraints

Absolutely do not:
- Add a server-side endpoint that runs yt-dlp or FFmpeg for user URLs.
- Proxy, merge, transcode, or store video on the VPS.
- Add a database, auth, Redis, or queue by default.
- Send a user's pasted URL, media title, local path, cookie, or download history to product servers.
- Keep upstream telemetry or feedback endpoints active under the new brand.
- Add hidden/background clipboard collection.
- Add an ad SDK or analytics provider without explicit product-owner approval and privacy review.
- Use ad placements that can be mistaken for a download button or primary action.

If the web cannot download a source directly, show a truthful limitation and a desktop-app alternative.

## 7. Security and legal boundaries

- Resolve production dependency advisories before release.
- Preserve Electron context isolation and `nodeIntegration: false`.
- Keep safe process spawning; no shell interpolation of user-controlled input.
- Validate IPC input at trust boundaries.
- Parse and allowlist external URL protocols.
- Preserve filename/path sanitization and signed binary verification.
- Do not add DRM circumvention or access-control bypass.
- Keep all third-party notices accurate.
- Flag MIT/GPL/MPL and platform-terms questions for legal review; do not present legal advice as a final legal determination.
- Never commit private signing keys, credentials, tokens, or secrets.

## 8. Testing and evidence

After each meaningful change:
1. Run the narrowest relevant test first.
2. Run the relevant static/type checks.
3. Run broader tests/builds when feasible.
4. Report exact commands and results.
5. If a test cannot run, state why and do not imply it passed.
6. Add tests for security fixes and behavior changes.
7. Preserve and extend existing tests; they are a major asset.

Do not claim full E2E, Windows/macOS, live-site, Android, or installer validation unless it actually ran.

## 9. Required end-of-batch report

Every batch report must include:

### Changed
- Files added, modified, removed.
- Plain-English explanation of what changed and why.

### Verification
- Exact commands run.
- Pass/fail/skipped status.
- Relevant test output or concise evidence.

### Risks and limitations
- Anything still unverified.
- Any behavior intentionally disabled.
- Any dependency, licensing, security, or platform concern.

### Next batch
- The next smallest logical step.
- Any decision needed from the user.

## 10. Stop and ask the user when

Pause for clarification before:
- Choosing or publishing the final product name/brand.
- Spending money or configuring paid services.
- Selecting an ad provider or enabling telemetry.
- Making a legal representation or removing required notices.
- Committing to Android after the spike.
- Expanding web downloads beyond proven sources.
- Introducing a backend service that changes data flows.
- Removing a current feature that users may rely on.
- Overwriting/removing user prototype assets or uncommitted work.

Continue safe, reversible work where possible; do not stop the entire project for a non-blocking decision.

## 11. Definition of done

A task is done only when:
- The intended behavior exists in actual code.
- Relevant tests/checks have run.
- No mock is represented as a production feature.
- Constraints in `plan.md` remain satisfied.
- The end-of-batch report is complete.
