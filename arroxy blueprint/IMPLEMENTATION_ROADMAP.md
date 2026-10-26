# Implementation Roadmap and Acceptance Gates

## How to use this roadmap

Work phase by phase. Do not jump to Android or broad UI refactoring before the safety, ownership, and feasibility gates are complete. Every phase ends with a report and test evidence.

## Phase 0 — Repository baseline and prototype discovery

**Status:** first action.

Tasks:
1. Inspect current branch, working tree, package scripts, README, `PRODUCT.md` history/context, ADRs, and `dev-docs/dual-deploy-plan.md`.
2. Run `git status` and preserve all existing user work.
3. Find the Arena.ai web UI prototype in the repository, mounted files, or user-provided assets. If missing, ask the user for the exact path/export. Do not fabricate a new design.
4. Confirm the current dependency versions and rerun the vulnerability gate.
5. Confirm the exact state of the desktop build/test commands.
6. Locate all upstream URLs, identities, telemetry, feedback, donation addresses, signing keys/config, and release targets.
7. Produce an inspection report with evidence and proposed order. Do not modify product source files in this first step.

Acceptance:
- Current state and branch/working tree documented.
- Prototype location confirmed or a clear question sent to the user.
- Actual current dependency advisories recorded.
- No files overwritten and no implementation changes made.

## Phase 1 — P0 security, licensing inventory, and ownership decisions

Tasks:
1. Fix production dependency advisories using patched compatible versions.
2. Tighten `shellOpenExternal` to parsed URL plus `http:`/`https:` allowlist.
3. Validate the four direct IPC registrations and audit relevant `handleRaw` sites.
4. Disable or re-point upstream heartbeat before any branded release.
5. Disable or re-point feedback diagnostics upload.
6. Build a list of upstream identities/endpoints and mark each `OWN`, `DISABLE`, or `NOT-IN-V1`.
7. Create/update `THIRD_PARTY_NOTICES.txt` and document licensing questions for legal review.
8. Record product owner decisions: name, market, priority sites, release ownership, monetization, Android timing, web scope.

Acceptance:
- Vulnerability gate passes.
- Security fixes have tests.
- No branded build sends telemetry/feedback to an upstream endpoint.
- All ownership items have explicit statuses; no private key copied from upstream.
- Legal issues are documented, not represented as resolved without review.

## Phase 2 — Desktop rebrand and release ownership

Tasks:
1. Apply new product name only after user confirms it.
2. Update package metadata, app ID, product name, icons, tray assets, notifications, menus, translated strings, README source, notices, website/community URLs, and donation links.
3. Run the existing i18n generation/synchronization workflow for all 31 locales.
4. Replace release owner/repository/update feed.
5. Create product-owned runtime-binary index pipeline and keypair, or disable automatic runtime updates until ready.
6. Repoint or remove Flatpak/Scoop/Homebrew/Winget identities based on chosen distribution channels.
7. Keep installer targets that the user intends to ship; do not spend time maintaining channels not selected for v1.
8. Decide code signing/notarization budget and configure secrets only after approval.

Acceptance:
- No accidental Arroxy identity remains in shipped UI/metadata except required license/history notices.
- No upstream updater/runtime/telemetry/donation endpoint is active.
- Build and package checks pass.
- Beta-to-stable update round trip is tested before public launch.
- Signing state is accurately documented; unsigned installers are not described as signed.

## Phase 3 — Desktop hardening and release candidate

Tasks:
1. Run the full documented checks: install, static/type checks, tests, build, package checks, vulnerability gate.
2. Run the complete Playwright E2E suite where supported.
3. Run Windows installer smoke test.
4. Run macOS build/installer and notarization path when hardware/CI and credentials are available.
5. Run the existing live-source smoke scripts only where lawful and appropriate; record exact date, versions, source, and outcomes.
6. Verify download queue, cancel/pause/resume, subtitles, playlists, audio-only, filename handling, binary update verification, and error messages.
7. Review privacy disclosures against observed network traffic.
8. Prepare a release checklist and rollback procedure.

Acceptance:
- No known P0 security/advisory issue remains.
- Test gaps are explicitly labeled.
- Every supported source claim has recent test evidence.
- Release/update trust chain is product-owned and validated.

## Phase 4 — Web proof of concept (before full web integration)

Tasks:
1. Inspect the Arena.ai prototype and map its components, design tokens, pages, assets, and interactions.
2. Preserve the prototype's design and convert/integrate it into the repo's intended web structure.
3. Test the five target sources individually for:
   - URL classification.
   - Browser-accessible metadata (if any).
   - CORS and browser fetch behavior.
   - Direct file download behavior, if claimed.
   - Signed URL expiry/referer/auth restrictions.
   - HLS/DASH or multi-file merge requirements.
   - Failure UX.
4. Do not create a server proxy to make a test pass.
5. Decide web v1 scope based on observed results, not expectations.

Acceptance:
- A source-by-source capability matrix is written.
- The UI communicates what works and what does not.
- No server-side video fetch/proxy/processing is used.
- Prototype visual identity is retained unless deviations are documented.

## Phase 5 — Web v1

Tasks:
1. Implement the browser adapter for only the supported `AppApi` subset.
2. Use shared URL cleaning/classification where it is browser-safe.
3. Build the paste/check flow, supported/unsupported states, optional tested metadata, and desktop CTA using the Arena.ai prototype.
4. Remove/hide desktop-only tray, hotkey, native updater, Explore browser, filesystem, and process controls.
5. Add static hosting, HTTPS, release/config metadata if needed.
6. Add privacy/consent groundwork before non-essential ad or analytics identifiers.
7. Add provider-agnostic ad slots only if approved; keep ads off by default until a provider is selected.
8. Test responsive behavior, browser compatibility, accessibility basics, and error states.

Acceptance:
- Web app never implies it can run yt-dlp locally unless an actual supported runtime exists.
- Unsupported sources get a useful and honest fallback.
- All video bytes remain between source and user's browser/device; the VPS does not proxy or store them.
- UI follows the Arena.ai prototype.

## Phase 6 — Android feasibility spike

This phase must be explicitly approved and time-boxed.

Tasks:
1. On a physical device, test a candidate yt-dlp runtime strategy.
2. Test FFmpeg needs for the current product features.
3. Test process execution and app lifecycle behavior.
4. Test background download continuity, notification, pause/cancel/resume, and network changes.
5. Test storage using current Android APIs.
6. Test share intent; test foreground clipboard intake only.
7. Measure APK/AAB size per ABI and update estimates.
8. Document store policy, signing, permission, and licensing implications.
9. Compare viable options and recommend build, defer, or drop.

Acceptance:
- Written spike report with reproducible steps and real measurements.
- No full RN UI build begins until runtime viability is proven and owner approves the direction.

## Phase 7 — Android build (only if approved)

Tasks:
1. Create the React Native shell and native runtime adapter.
2. Reuse portable schemas, URL logic, naming, errors, i18n, and pure workflow planning.
3. Implement share-intent intake, visible foreground clipboard handling, queue persistence, storage, and compliant foreground/background execution.
4. Implement user-facing permissions and notifications.
5. Build local queue/history only; no account backend.
6. Integrate ads only behind approved flag/provider and consent/privacy review.
7. Run device tests on the selected Android API levels and architectures.
8. Prepare signing and distribution.

Acceptance:
- Download operations happen on device.
- Background behavior and failure cases are tested.
- App size/performance are measured.
- No covert clipboard collection or server media processing.

## Phase 8 — Monetization and operations

Only after the core product and privacy flows are stable:
1. Choose an ad network after reviewing product policy, geography, traffic quality, and SDK support.
2. Add provider behind a flag and keep it isolated from downloader services.
3. Implement web consent gating where required.
4. Publish accurate privacy policy and data-flow descriptions.
5. Add uptime checks, release monitoring, and a basic incident/rollback procedure.
6. Review support feedback and compatibility breakages.

Acceptance:
- Ads cannot be mistaken for download controls.
- No ad SDK or telemetry runs unexpectedly when disabled.
- Privacy policy matches actual network behavior.
- Release/update and runtime index can be maintained by the product owner.

## Phase gates

Do not progress automatically through gates that need owner approval:
- Product name/brand.
- Legal/commercial go-ahead.
- Code-signing budget.
- Web scope after PoC.
- Android feasibility outcome.
- Ad provider and monetization model.

Freebuff should continue safe, reversible tasks when possible, but stop before a decision materially changes legal exposure, cost, scope, or architecture.
