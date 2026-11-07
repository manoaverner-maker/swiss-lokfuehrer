# 🚂 Swiss Lokführer

A playful app about Swiss trains, made as a gift for two young train fans. English and French, works offline, no ads, no tracking.

**App:** https://manoaverner-maker.github.io/swiss-lokfuehrer/

## Put it on the iPad (like a real app)
1. Open the link above in **Safari** (not Chrome).
2. Tap the **Share** button (square with an arrow ↑).
3. Scroll down and tap **“Add to Home Screen”**, then **“Add”**.
4. Start the app from the new icon on the home screen. It now opens fullscreen and also works without internet.

Android: open the link in Chrome → menu ⋮ → “Add to Home screen” / “Install app”.

## Parents' corner
Tap the ⚙️ on the start screen and solve the small multiplication. There you can manage profiles, sound, music, read-aloud and reset progress.

## Personal touch
Fill in `src/config/personal.ts` (kids' names, message). Profiles are created from it on first start.

## Development
```bash
npm install
npm run dev      # local dev server
npm run build    # validate data + type-check + build
npm run lint
```
Every push to `main` builds and deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`).

**One-time setup:** GitHub repo → Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.

## Credits
- Map data (from Phase 3): © OpenStreetMap contributors
- Fonts: Baloo 2 and Nunito (SIL Open Font License), bundled locally
- All sounds are synthesized in the browser. All drawings and icons are original.
