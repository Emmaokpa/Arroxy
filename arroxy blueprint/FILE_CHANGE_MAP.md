# File Change Map — Preserve, Modify, Extract, Replace, Investigate

## Purpose

This is a candidate map from the 2026-10-26 audit, not a substitute for checking the current checkout. Confirm exact paths and line numbers before editing. Never bulk-replace names without understanding generated files, translations, tests, and release configuration.

Legend:
- **KEEP:** preserve behavior; only change if a verified requirement demands it.
- **MODIFY:** targeted changes.
- **EXTRACT:** move pure/reusable code only when a second consumer needs it.
- **REPLACE/DISABLE:** remove upstream identity or replace service.
- **INVESTIGATE:** evidence or owner decision required first.

## 1. Core desktop implementation

| Path / area | Action | Instructions |
|---|---|---|
| `src/main/index.ts` | MODIFY later | Composition root/window titles and shell ownership. Do not refactor first. |
| `src/main/services/DownloadService.ts` | KEEP | Core job lifecycle and phase orchestration. Preserve tests and behavior. |
| `src/main/services/QueueService.ts` | KEEP | Queue scheduler/persistence integration. Do not rewrite without a proven defect. |
| `src/main/services/ProbeService.ts` | KEEP | Metadata probing; large file is not a reason to refactor now. |
| `src/main/services/YtDlp.ts` | KEEP | Engine heart; preserve safe spawning, retries, and existing access-control boundaries. |
| `src/main/services/phases/**` | KEEP | Existing download phase pipeline. |
| `src/main/services/download/**` | KEEP | Progress parsing, cleanup, retries, and temporary-file handling. |
| `src/main/services/BinaryManager.ts` | KEEP + targeted MODIFY | Keep binary handling; only change ownership/trust anchor after key/index plan is ready. |
| `src/main/services/binary/RuntimeBinaryTrust.ts` | MODIFY | Replace upstream index URL/public key with product-owned trust anchor. Security-sensitive; never disable signature verification to make it work. |
| `src/main/updateFeed.ts` | MODIFY | Point to product-owned release feed/repository or deliberately disable updater until ready. |
| `src/main/ipc/registerUpdaterHandlers.ts` | MODIFY carefully | Update identity/channel details and validate raw IPC payloads. |
| `src/main/services/ClipboardWatcher.ts` | KEEP | Existing focus/show clipboard fill behavior; document accurately. Do not add background monitoring or transmission. |
| `src/main/services/explore/**` | KEEP / review | Preserve unless user decides Explore is out of v1. Keep navigation security and MPL-2.0 notices. |
| `src/main/token/**`, `TokenService` | KEEP / legal review | Existing token provider is part of current engine; do not add bypass behavior. Legal review required. |
| `src/main/stores/**` | KEEP | Local settings/queue/recents; no server account system. |

## 2. Security changes

| Path / area | Action | Instructions |
|---|---|---|
| `src/main/ipc/fileHandlers.ts` | MODIFY | Replace prefix-only URL checks with parsed URL validation and explicit `http:`/`https:` allowlist. Add tests for malformed URLs and non-web schemes. |
| `src/main/ipc/**` | AUDIT/MODIFY | Audit the 78 channels and `handleRaw` call sites; validate all payloads at trust boundaries. |
| `src/main/services/explore/ExploreAdBlocker.ts` | MODIFY if still applicable | Audit direct `ipcMain` registrations identified by the audit and apply appropriate validation. |
| `src/main/ipc/diagnosticsHandlers.ts` | MODIFY if still applicable | Audit direct registration and payload validation. |
| `src/main/ipc/registerUpdaterHandlers.ts` | MODIFY if still applicable | Audit direct registration and payload validation. |
| `electron-builder.json5` | MODIFY cautiously | Rebrand app ID/product name/publish settings; preserve security fuses and required runtime configuration. |
| `package.json`, lockfile, overrides | MODIFY | Resolve production advisories using compatible patched versions; update lockfile reproducibly. |

## 3. Shared logic and platform adapters

| Path / area | Action | Instructions |
|---|---|---|
| `src/shared/api.ts` | EXTRACT only when needed | Treat `AppApi` as the contract for desktop and browser adapters; avoid breaking changes. |
| `src/shared/schemas.ts` | EXTRACT only when needed | Shared schema source of truth. Keep Zod versions aligned and test imports. |
| `src/shared/urlIntent.ts`, `cleanUrl.ts`, `bulkUrls.ts` | REUSE / EXTRACT later | Pure URL logic; use for web support checks when safe. |
| `src/shared/filenameTemplate.ts`, `nameBudget.ts`, `pathLimits.ts` | REUSE / EXTRACT later | Keep sanitization and OS limits parameterized. |
| `src/shared/sites/**` | MODIFY cautiously | Export/use site support information for web UI; do not claim support merely because a URL can be classified. |
| `src/shared/i18n/**` | REUSE / EXTRACT later | Preserve 31 locales and translation checks. Rebrand using existing synchronization workflow. |
| `packages/yt-dlp-bridge/**` | INVESTIGATE / split later | Separate pure planning/parsing from Node process execution only when a second consumer is real. Avoid a breaking package rewrite without versioning/tests. |
| `packages/ytdlp-errors/**` | KEEP | Already portable; preserve taxonomy and upstream coverage checks. |

## 4. Renderer and UI

| Path / area | Action | Instructions |
|---|---|---|
| `src/renderer/src/**` | KEEP for desktop | Preserve current UI and behavior; apply brand updates and targeted improvements. |
| Arena.ai prototype files/assets | INSPECT, then INTEGRATE | This is the web UI starting point. Find the actual exported files before creating web screens. Do not invent a new UI. |
| `src/renderer/src/browserMock.ts` | KEEP as test/dev aid; adapt deliberately | Browser mock proves UI boot only, not real browser downloading. Do not ship mock behavior as production capability. |
| `src/renderer/src/store/**` | KEEP | Preserve existing state architecture; add routing only if web scope needs it. |
| `electron-log` imports in renderer | MODIFY only as needed for web | Audit found renderer coupling in five files. Add a small logger port/browser-safe implementation if required; do not over-refactor desktop. |
| Desktop-only tray/hotkey/updater/Explore surfaces | HIDE/ADAPT in web | Remove or disable only from the web adapter/UI, not necessarily from desktop. |

## 5. Brand and release files

| Path / area | Action | Instructions |
|---|---|---|
| `package.json` metadata | MODIFY | New name/description only after owner confirms final brand. |
| `electron-builder.json5` | MODIFY | App ID, product name, release owner, signing settings. |
| `build/icon*`, tray icons, DMG background | REPLACE | Generate complete asset sizes/formats from approved brand assets. |
| `src/shared/i18n/locales/*.json` | MODIFY via workflow | Remove product-specific upstream branding in all supported locales; run parity checks. |
| `readme-src/**` | REWRITE | New product docs based on actual capabilities, limitations, privacy, and installation. Keep generation/parity workflow. |
| `THIRD_PARTY_NOTICES.txt` | MODIFY | Accurate licenses/notices, including GPL FFmpeg and MPL components after legal review. |
| `DONATE.md` and donation-check scripts | REPLACE/REMOVE | Never ship upstream donation addresses. Update/remove corresponding integrity gate intentionally. |
| `flatpak/**` | REPLACE only if Flatpak is selected | New app ID, desktop identity, and signing key. |
| `.github/workflows/release.yml`, `scripts/release.sh` | MODIFY | Repoint owned repos/secrets; simplify channels not selected for v1. Test with beta tags. |
| `.github/workflows/**` | MODIFY selectively | Keep security/test gates; add or configure platform test legs where available. |

## 6. Upstream services and privacy

| Path / area | Action | Instructions |
|---|---|---|
| `src/main/services/heartbeat.ts` | DISABLE/REPLACE | No calls to upstream Counterscale in branded build. Do not enable replacement before disclosure. |
| `src/shared/constants.ts` | MODIFY | Set telemetry/clipboard defaults according to the approved privacy behavior; do not silently collect data. |
| `workers/feedback-upload/**` | DISABLE/REPLACE | Remove upstream R2/Worker endpoints or implement a product-owned service only if explicitly needed. |
| `RuntimeBinaryTrust.ts` and manifest pipeline | MODIFY | Product-owned runtime index and signing trust chain. |
| URLs in README, About, settings, website, Discord/community links | MODIFY | Replace with owned destinations or remove until they exist. |
| `PRODUCT.md` | REPLACE/ARCHIVE | Establish new product spec without losing relevant history. Keep source/license notices. |
| `docs/adr/**`, `dev-docs/**` | KEEP + UPDATE | Use existing institutional knowledge; append ADRs when decisions diverge. |

## 7. New web and infrastructure candidates

Add only after inspecting the prototype and agreeing on scope:
- `apps/web/` or the repository's existing web location, using the prototype as the starting point.
- A browser adapter implementing the supported subset of `AppApi`.
- A source capability matrix and tests.
- `infrastructure/docker/compose.yaml` and `Caddyfile` only if self-hosting is selected.
- Static `version.json`/release metadata only if needed.
- Consent/feature-flag/ad-slot components only after provider and privacy decisions.
- A `DECISIONS.md` file if decisions are not already tracked.

Do not add a backend download endpoint, database, account system, video object storage, media proxy, or job queue.

## 8. New Android candidates (only after spike approval)

Potential new files/modules:
- React Native app shell.
- Android native runtime/process adapter.
- Share-intent intake.
- Foreground service, progress notifications, and queue persistence.
- Storage integration using current Android APIs.
- ABI/runtime packaging and signing pipeline.

Do not create the full mobile tree before the runtime spike demonstrates feasibility.

## 9. Safe editing sequence

1. Inspect and report.
2. Resolve dependency advisories and security gaps.
3. Disable/repoint upstream telemetry and feedback.
4. Confirm brand and ownership decisions.
5. Rebrand desktop.
6. Repoint release and runtime index.
7. Prove desktop release.
8. Inspect and prove web capabilities; integrate Arena.ai prototype.
9. Build web scope justified by evidence.
10. Run Android spike only with approval.
11. Implement ads only after provider/privacy decisions.

Do not do a giant global search-and-replace across the repository. Use tests and review generated artifacts.
