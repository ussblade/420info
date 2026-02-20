/**
 * 420nearme Monthly Scraper
 *
 * Runs via GitHub Actions on the 1st of every month.
 * Fetches official cannabis retailer licenses from each state's control board,
 * geocodes addresses missing coordinates, merges into a single JSON file,
 * and outputs to scraper/output/dispensaries.json for deployment to GitHub Pages.
 *
 * Usage: npm run scrape
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  scrapeColorado,
  scrapeCalifornia,
  scrapeOregon,
  scrapeWashington,
  scrapeIllinois,
} from './states';
import { loadGeoCache, saveGeoCache } from './geocode';

export interface ScrapedDispensary {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  licenseNumber?: string;
  source: 'scraped' | 'osm';
}

const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dispensaries.json');

function generateId(dispensary: ScrapedDispensary, index: number): string {
  const slug = dispensary.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${dispensary.state.toLowerCase()}-${slug}-${index}`;
}

function deduplicateByLicense(dispensaries: ScrapedDispensary[]): ScrapedDispensary[] {
  const seen = new Map<string, ScrapedDispensary>();

  for (const d of dispensaries) {
    if (d.licenseNumber) {
      const key = `${d.state}-${d.licenseNumber}`;
      if (!seen.has(key)) {
        seen.set(key, d);
      }
    } else {
      // No license number: use name + city as fallback key
      const key = `${d.state}-${d.city}-${d.name}`.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, d);
      }
    }
  }

  return Array.from(seen.values());
}

async function main() {
  console.log('=== 420nearme Scraper ===');
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('');

  // Load geocode cache so we don't re-geocode known addresses
  loadGeoCache();

  const scrapers: Array<() => Promise<ScrapedDispensary[]>> = [
    scrapeColorado,
    scrapeCalifornia,
    scrapeOregon,
    scrapeWashington,
    scrapeIllinois,
  ];

  const allResults: ScrapedDispensary[] = [];

  for (const scraper of scrapers) {
    try {
      const results = await scraper();
      allResults.push(...results);
      console.log('');
    } catch (err) {
      console.error('Scraper error:', err);
    }
  }

  console.log(`Total before dedup: ${allResults.length}`);
  const deduped = deduplicateByLicense(allResults);
  console.log(`Total after dedup: ${deduped.length}`);

  // Assign stable IDs
  const withIds: ScrapedDispensary[] = deduped.map((d, i) => ({
    ...d,
    id: generateId(d, i),
  }));

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const output = {
    generatedAt: new Date().toISOString(),
    count: withIds.length,
    dispensaries: withIds,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  // Save geocode cache so next month's run skips already-known addresses
  saveGeoCache();

  console.log('');
  console.log(`✓ Output written to: ${OUTPUT_FILE}`);
  console.log(`✓ Total dispensaries: ${withIds.length}`);
  console.log(`  Finished at: ${new Date().toISOString()}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
