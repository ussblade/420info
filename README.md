# 420 Near Me

A cross-platform React Native (Expo) app to find nearby cannabis dispensaries and check cannabis legality by US state.

**Zero API keys required.** Data comes from two free sources merged on-device:
1. Monthly-scraped official state licensing data (hosted on GitHub Pages)
2. Live OpenStreetMap Overpass API queries (fill gaps)

---

## Project Structure

```
420nearme/
├── scraper/          # Monthly data scraper (Node.js + TypeScript)
├── app/              # React Native / Expo mobile app
└── .github/
    └── workflows/
        └── scrape.yml  # GitHub Actions: runs scraper monthly → deploys to GitHub Pages
```

## Getting Started

### 1. Configure CDN URL

After forking this repo:

1. Enable GitHub Pages on your repo (Settings → Pages → Source: `gh-pages` branch)
2. Update `app/src/constants/config.ts`:
   ```ts
   export const CDN_URL = 'https://YOUR_USERNAME.github.io/420nearme/dispensaries.json';
   ```
3. Update `USER_AGENT` in the same file with your GitHub username.

### 2. Run the Scraper (generates initial data)

```bash
cd scraper
npm install
npm run scrape
# → output/dispensaries.json is created
```

Then push to trigger GitHub Actions, or manually trigger via GitHub Actions UI (workflow_dispatch).

### 3. Run the App

```bash
cd app
npm install
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/go) on your phone, or press `a`/`i` for Android/iOS simulator.

---

## Architecture

```
[Monthly Scraper]                    [Live Query]
scrapes state gov                    OpenStreetMap
licensing databases                  Overpass API
       ↓                                  ↓
dispensaries.json              OSM results (fills gaps)
hosted on GitHub Pages                     ↓
       ↓                                   ↓
  App fetches + caches         ←─── MERGE + DEDUPLICATE ───→
                                     (on-device, instant)
                                           ↓
                               Final sorted dispensary list
```

**Merge logic**: Scraped official data is the primary source. OSM entries are added only if no scraped dispensary exists within ~100 meters.

---

## Data Sources

| Source | How | Frequency |
|--------|-----|-----------|
| Colorado MED | CSV download | Monthly (GitHub Actions) |
| California DCC | API / CSV | Monthly |
| Oregon OLCC | CSV download | Monthly |
| Washington WSLCB | CSV download | Monthly |
| Illinois IDFPR | Open data / fallback | Monthly |
| OpenStreetMap | Overpass API (live) | Every search |

---

## State Legality

Bundled static dataset — `app/src/data/stateLaws.ts` — covers all 50 states + DC. As of February 2026: 24 states + DC allow recreational use.

---

## Screens

| Screen | Description |
|--------|-------------|
| **Near Me** | GPS → merged dispensary list, sorted by distance |
| **Search** | Text → Nominatim geocoding → dispensary list |
| **State Laws** | All 51 entries, filterable, with expandable notes |

---

## Adding More States

Create a new file in `scraper/states/YOUR_STATE.ts` following the same pattern as `colorado.ts`:

1. Fetch the state's official license CSV/API
2. Filter to retail/dispensary license types
3. Geocode entries missing lat/lng
4. Return `ScrapedDispensary[]`
5. Export and add to `scraper/states/index.ts` and `scraper/index.ts`

---

## License

MIT
