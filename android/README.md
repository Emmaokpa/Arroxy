# FlickGrab for Android

Kotlin + Jetpack Compose. This is the **UI shell of milestone M2** — every screen,
sheet, dialog and state exists, and the extractor behind them does not.

Read `../android.md` first: it is the plan, this file is the state of the code.

## What is real in this build

| Feature | State |
|---|---|
| Bottom-nav shell (Home / Downloads / Library / Settings) | Real |
| Search, source filters, feed layout, spotlight card | Real UI, placeholder items |
| Quality sheet: video/audio split, per-format size, mux explanation, save location | Real UI |
| Progress dialog: stage timeline, speed, ETA, cancel, run-in-background | Real UI |
| Downloads queue, active strip above the nav bar, library of saved files | Real UI |
| Share-sheet intake (`ACTION_SEND`) and `flickgrab://inspect?url=…` deep link | Real |
| Capability table with measured status per source | Real, copied from `server/capabilities.ts` |
| Extraction, muxing, MediaStore write | **Not built** (M0/M1) |

## Placeholder data is fenced off

`app/build.gradle.kts` sets `BuildConfig.PREVIEW_DATA`:

- `debug` → `true`. `PreviewMediaRepository` serves a fixed list of items and the
  progress engine simulates a download. Every screen that shows this says so, and
  each task carries a `PREVIEW` label.
- `release` → `false`. `EmptyMediaRepository` returns nothing, so Home shows the
  "no extractor wired yet" state and the download CTA opens the not-wired dialog.

Nothing invented can reach a release build. When M0 lands, replace the two
repository implementations with one real extractor and delete the demo list.

## Opening it

Requirements: JDK 17, Android SDK 35, Gradle 8.9.

1. Open the `android/` folder as a project in Android Studio.
2. The Gradle wrapper JAR is not committed (it is a binary). Generate it once:

   ```bash
   cd android
   gradle wrapper --gradle-version 8.9
   ```

   Or set *Settings → Build, Execution, Deployment → Build Tools → Gradle* to a
   local Gradle 8.9 installation.
3. `./gradlew :app:assembleDebug` or Run ▶ on a device with Android 8.0+.

There is no Android SDK on the machine this code was written on, so it has not
been compiled yet. Expect the first sync to surface small API-level fixes.

## Design preview (no build needed)

Open **`android/preview/index.html`** in any browser — double-click it, no server,
no install. It is a single self-contained file that renders the Compose screens with
the same palette, spacing and copy, and you can walk the flow: tap a card → quality
sheet → pick a format → progress modal → queue. Screens are linkable by hash
(`#home`, `#sheet`, `#progress`, `#downloads`, `#library`, `#settings`, `#dialogs`).

It is a design artefact, not a second implementation: the app itself is Kotlin +
Jetpack Compose, and the preview reads preview data like the debug build does.

## Layout

```
android/
├── app/src/main/java/app/flickgrab/
│   ├── MainActivity.kt          edge-to-edge host + intent intake
│   ├── ui/
│   │   ├── FlickGrabApp.kt      tabs, overlays, back handling
│   │   ├── AppViewModel.kt      state machine, sheet control, preview tasks
│   │   ├── theme/               palette, type scale, shapes
│   │   ├── components/          cards, chips, thumbnails, buttons, empty states
│   │   ├── home/                feed, search, source filters, spotlight
│   │   ├── downloads/           queue cards + active strip
│   │   ├── library/             saved files grid
│   │   ├── more/                settings + capability table
│   │   └── sheets/              quality sheet, progress dialog, dialogs
│   ├── domain/                  sources, formats, tasks, capability rows
│   ├── data/                    repository seam + placeholder implementation
│   ├── intake/                  share-sheet and deep-link parsing
│   └── util/                    byte/speed/ETA formatting, URL extraction
└── app/src/main/res/            manifest resources, adaptive launcher icon
```

## Design notes

- Dark-only palette (`Ink #07080C` base, violet `#7A5AF8` → cyan `#22D3EE` brand
  gradient). Dark is the app's working condition; a light scheme is not designed.
- 18 dp screen gutters, 20–26 dp card radii, one accent per source, 1 dp hairline
  borders instead of shadows.
- Motion is limited to crossfades from Coil, progress animation and the sheet.
  Nothing bounces.
- The layout follows the familiar downloaded-video app grammar (feed, quality
  sheet, queue) with FlickGrab's own palette, type and components. It is not a
  copy of another app's screen designs.

## Next steps

1. M0 on a physical device: resolve + save one public YouTube video, note where it
   fails (TLS/IP, PO token, SABR).
2. Replace `PreviewMediaRepository` with the real extractor behind the same
   `MediaRepository` interface; the ViewModel and UI do not change.
3. MediaStore write into `Movies/FlickGrab`, plus a share target so the file can
   leave the app.
4. Delete `PREVIEW_DATA`, the demo list and the `PREVIEW` labels.
