# Swiss Lokführer – project notes for Claude

Interactive PWA about Swiss trains for two kids (≈6 and ≈10) living in Canada. Gift app. The original brief is kept privately by the owner (not in this public repo); its essentials are below.

## Current status
- **Phase 1 – Foundation: done.**
- **Phase 2 – Lexicon + 3D kit: done, waiting for owner feedback.** 10 trains (re460, re420, ae66, ce68ii, rabe501, rabe502, ge44ii, abe812, rabe515, pilatus) with researched data (de.wikipedia), 3 Commons photos each, 3D presets, fun facts, sounds; gallery with filters; detail page with 3D viewer (panto/lights/drive/horn), photo gallery, comparisons, fact sheet.
- Next: **Phase 3 – Living map** (after the owner's feedback on Phase 2).
- The kids create their own profiles in the app (owner does not want their names in the repo). `personal.kids` stays empty.

## Phase plan (from the brief)
1. Foundation ✅
2. Lexicon + parametric 3D kit (three/R3F): 10 trains complete (researched data, 3 Wikimedia photos each via `scripts/fetch-images.ts` → WebP, presets, fun facts, sound), gallery with filters, detail page with 3D viewer, photo gallery, fact sheet, visual comparisons → screenshots to owner, wait for feedback
3. Living map (maplibre, OSM rail lines as simplified GeoJSON built by a script, simulated trains, tap → flyTo + follow cam + info panel, landmark pins, lexicon ↔ map links)
4. Minigames: Perfect Stop + Quiz first, then Builder, Switch puzzle, Signals, Rack railway (commit after each)
5. Collecting: cards, album, quartet (vs CPU + hot-seat), driver card with PNG export, badges, ranks, knowledge corner, secret message (tap clock 3×), grow to 35–40 trains
6. Polish: performance, day/night, offline test, image-credits page, optional GTFS, splash screens, deploy guide

## Key decisions (agreed with the owner)
- **Languages: English (default) + French only.** No German UI. Data model uses `en`/`fr` (brief said `de`/`en`). Swiss words (Grüezi, Perron, Lokführer) stay as Swiss flavour.
- TTS: `speechSynthesis`, prefer `fr-CA`/`en-CA` voices (src/audio/speech.ts).
- Main device: **iPad (Safari)**. Test 1024×768, 768×1024, 390×844.
- Hosting: **GitHub Pages** via `.github/workflows/deploy.yml`, base path `/swiss-lokfuehrer/`. HashRouter (works on Pages + offline).
- Work goes straight to `main` (solo project; push = deploy).

## Tech stack
Vite 8 · React 19 · TypeScript strict · Tailwind 4 (`@theme` tokens in src/styles/index.css) · framer-motion · zustand (persist via `safeStorage`, never touch localStorage directly) · i18next · Zod (build-time validation only) · vite-plugin-pwa. three + @react-three/fiber + drei (3D, lazy-loaded chunk). Later: maplibre-gl (Phase 3).

## 3D kit (src/three)
- `kit/types.ts` CarSpec/TrainPreset · `kit/profile.ts` side profile per nose kind (flat/round/slope/wedge), clip + windscreen shell · `kit/Car.tsx` one car body (extruded profile, cap, windows, doors, stripes, grilles, lamps, pantos, bogies) · `kit/Train3D.tsx` layout, scrolling track, specials (`krokodil`, `rack`) · `presets/index.ts` one preset per train (`model.preset` in the JSON).
- Animation state lives in refs (`kit/anim.ts`); the React-hooks lint rules forbid mutating memoised objects, so mutate `useRef` values only.
- Environment lighting uses local Lightformers (no HDR download → offline OK).

## Data research notes
- Wikimedia APIs are rate-limited from the sandbox (429); plain pages work: `https://de.wikipedia.org/wiki/<Title>?action=raw`, Commons category/file HTML pages. Send a User-Agent.
- Photos: pick in `scripts/image-picks.json`, run `npx tsx scripts/fetch-images.ts [ids]` (writes WebP 1200px + 480px thumb and the credits into the JSON).
- `inService.from` = first year built (UI label "Since"). Speeds = permitted service speed. Power = continuous rating where available.

## Rules
- Never invent train data. Unsure → `verified: false` + list the field in `unverifiedFields`. Always fill `sources`.
- No official logos (SBB, BLS …), no copy of the protected station-clock design. Own symbols only. Swiss cross = white on red (never red on white → looks like the Red Cross).
- Touch targets ≥ 64 px for kids. Every Junior text has a 🔊 button. Nav max 2 levels, always a Home button (loco icon).
- No trackers, no external links (except image credits in the parents' corner), no external requests except map tiles.
- All sounds are synthesized (src/audio/engine.ts). Automatic (non-tap) sounds must check `isAudioRunning()`.
- Every new UI string goes into **both** `src/i18n/en.json` and `src/i18n/fr.json`.
- Respect `prefers-reduced-motion` (MotionConfig reducedMotion="user" is set globally).

## Commands
- `npm run dev` – dev server
- `npm run build` – validates train JSON (scripts/validate-data.ts), type-checks, builds
- `npm run lint`
- `npm run icons` – re-render PNG icons from `public/icons/icon.svg` (needs Playwright; set `PLAYWRIGHT_PATH=$(npm root -g)/playwright` in the cloud sandbox)

## Layout
- `src/app` router · `src/features/<area>` screens · `src/components` UI kit (ToyButton, SpeakButton, LanguageToggle, Screen, TrainSide …)
- `src/data/trains/*.json` one file per train (file name = id) · `src/data/schema.ts` Zod schema
- `src/store` profiles (incl. per-profile progress) + settings · `src/audio` sound + speech · `src/config/personal.ts` filled in by the owner

## Phase checklist
build + lint clean · no console errors · tested in 3 formats · Junior usable without reading · strings in EN+FR · data with sources · image licences recorded · update this file · commit.
