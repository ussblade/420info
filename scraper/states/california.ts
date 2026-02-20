/**
 * California DCC (Department of Cannabis Control) scraper.
 *
 * NOTE: The DCC does not publish a free public bulk data download.
 * Their license search (search.cannabis.ca.gov) is a JS SPA with no
 * documented public API. The DCA iServices API requires free registration.
 *
 * California has hundreds of OSM-mapped dispensaries, so the Overpass
 * API in the app fills this gap at query time. This scraper returns
 * empty and logs an explanation.
 *
 * To add CA data: register at https://iservices.dca.ca.gov/ for a free
 * API key, implement the fetch here, and add credentials to GitHub Secrets.
 */

import type { ScrapedDispensary } from '../index';

export async function scrapeCalifornia(): Promise<ScrapedDispensary[]> {
  console.log('[CA] Skipping — DCC has no free public bulk data export.');
  console.log('[CA] California dispensaries are covered by the live OSM Overpass query in the app.');
  console.log('[CA] To add official CA data: register at https://iservices.dca.ca.gov/');
  return [];
}
