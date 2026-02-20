/**
 * Cannabis legality data for all 50 US states + DC.
 * Bundled with the app — no network call required.
 * Status as of February 2026.
 *
 * Status hierarchy:
 *   recreational > medical > decriminalized > illegal
 */

import type { StateLaw } from '../types';

export const STATE_LAWS: StateLaw[] = [
  {
    stateCode: 'AL',
    stateName: 'Alabama',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program launched 2023. Dispensaries open. Recreational use remains illegal.',
  },
  {
    stateCode: 'AK',
    stateName: 'Alaska',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since 2014. Adults 21+ may possess up to 1 oz. Retail dispensaries operate statewide.',
  },
  {
    stateCode: 'AZ',
    stateName: 'Arizona',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Prop 207 legalized recreational in 2020. Adults 21+ may possess up to 1 oz and grow 6 plants at home.',
  },
  {
    stateCode: 'AR',
    stateName: 'Arkansas',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical program active since 2019. Recreational legalization failed at ballot (2022). Possession without card is illegal.',
  },
  {
    stateCode: 'CA',
    stateName: 'California',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since Prop 64 (2016). Adults 21+ may possess 1 oz and grow 6 plants. Hundreds of licensed dispensaries statewide.',
  },
  {
    stateCode: 'CO',
    stateName: 'Colorado',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'First state to legalize recreational cannabis (Amendment 64, 2012). Adults 21+ may possess 1 oz. Home grow of 6 plants allowed.',
  },
  {
    stateCode: 'CT',
    stateName: 'Connecticut',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational sales began Jan 2023. Adults 21+ may possess up to 1.5 oz. Social equity provisions included.',
  },
  {
    stateCode: 'DE',
    stateName: 'Delaware',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legalized April 2023. Adults 21+ may possess 1 oz. Retail sales framework being established.',
  },
  {
    stateCode: 'FL',
    stateName: 'Florida',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Robust medical program with hundreds of dispensaries. Amendment 3 for recreational narrowly failed in Nov 2024 (needed 60%, got ~55%).',
  },
  {
    stateCode: 'GA',
    stateName: 'Georgia',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Limited medical cannabis oil (low-THC) legal for qualifying conditions. No dispensaries in the traditional sense; production licenses limited.',
  },
  {
    stateCode: 'HI',
    stateName: 'Hawaii',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program active. Recreational legislation has been introduced but not passed as of 2026.',
  },
  {
    stateCode: 'ID',
    stateName: 'Idaho',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'One of the strictest states — all forms of cannabis remain illegal. No medical or recreational program.',
  },
  {
    stateCode: 'IL',
    stateName: 'Illinois',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since Jan 2020. Adults 21+ may possess 30g (residents may also grow 5 plants). Strong social equity program.',
  },
  {
    stateCode: 'IN',
    stateName: 'Indiana',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'Cannabis fully illegal. CBD products from hemp are allowed. No active medical or recreational program.',
  },
  {
    stateCode: 'IA',
    stateName: 'Iowa',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Very limited medical cannabis program for specific qualifying conditions. Low-THC products only at state-licensed dispensaries.',
  },
  {
    stateCode: 'KS',
    stateName: 'Kansas',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes: 'Cannabis fully illegal. No medical or recreational program exists.',
  },
  {
    stateCode: 'KY',
    stateName: 'Kentucky',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program signed into law in 2023. Dispensaries expected to open by 2025–2026. Recreational remains illegal.',
  },
  {
    stateCode: 'LA',
    stateName: 'Louisiana',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program active with licensed dispensaries. Possession of small amounts decriminalized (civil fine). Recreational illegal.',
  },
  {
    stateCode: 'ME',
    stateName: 'Maine',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since 2016 (Question 1). Adults 21+ may possess 2.5 oz. Retail sales launched 2020.',
  },
  {
    stateCode: 'MD',
    stateName: 'Maryland',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational sales began July 2023. Adults 21+ may possess 1.5 oz and grow 2 plants at home.',
  },
  {
    stateCode: 'MA',
    stateName: 'Massachusetts',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since 2016. Adults 21+ may possess 1 oz (up to 10 oz at home) and grow 6 plants.',
  },
  {
    stateCode: 'MI',
    stateName: 'Michigan',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since Prop 1 (2018). Adults 21+ may possess 2.5 oz and grow 12 plants at home.',
  },
  {
    stateCode: 'MN',
    stateName: 'Minnesota',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legalized in 2023. Adults 21+ may possess 2 oz and grow 8 plants. Retail sales began 2025.',
  },
  {
    stateCode: 'MS',
    stateName: 'Mississippi',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program active since 2022. Recreational remains illegal. Small-amount possession carries civil fine.',
  },
  {
    stateCode: 'MO',
    stateName: 'Missouri',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Prop 3 legalized recreational in Nov 2022. Adults 21+ may possess 3 oz and grow 6 plants. Sales began Feb 2023.',
  },
  {
    stateCode: 'MT',
    stateName: 'Montana',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since I-190 (2020). Adults 21+ may possess 1 oz and grow 2 mature/2 seedling plants.',
  },
  {
    stateCode: 'NE',
    stateName: 'Nebraska',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis legalized by ballot initiative Nov 2024 (Initiative 437). Program being implemented.',
  },
  {
    stateCode: 'NV',
    stateName: 'Nevada',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since 2016. Adults 21+ may possess 1 oz (or 3.5g concentrate) and grow 6 plants if 25+ miles from a dispensary.',
  },
  {
    stateCode: 'NH',
    stateName: 'New Hampshire',
    status: 'decriminalized',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical program active. Possession of ¾ oz or less decriminalized (civil fine). Recreational sales not yet legal.',
  },
  {
    stateCode: 'NJ',
    stateName: 'New Jersey',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since 2021. Adults 21+ may possess 6 oz. Robust retail market with many licensed dispensaries.',
  },
  {
    stateCode: 'NM',
    stateName: 'New Mexico',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since June 2021. Adults 21+ may possess 2 oz and grow 6 mature/6 immature plants.',
  },
  {
    stateCode: 'NY',
    stateName: 'New York',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'MRTA legalized recreational in 2021. Adults 21+ may possess 3 oz and grow 6 plants. Retail rollout ongoing with social equity priority.',
  },
  {
    stateCode: 'NC',
    stateName: 'North Carolina',
    status: 'decriminalized',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'Possession of 0.5 oz or less is a civil infraction (no jail). No medical or recreational program exists.',
  },
  {
    stateCode: 'ND',
    stateName: 'North Dakota',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program active. Recreational failed at ballot twice (2018, 2022). Possession otherwise illegal.',
  },
  {
    stateCode: 'OH',
    stateName: 'Ohio',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Issue 2 legalized recreational in Nov 2023. Adults 21+ may possess 2.5 oz and grow 6 plants. Retail sales began 2024.',
  },
  {
    stateCode: 'OK',
    stateName: 'Oklahoma',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'One of the most permissive medical programs nationally. SQ 820 for recreational failed in March 2023.',
  },
  {
    stateCode: 'OR',
    stateName: 'Oregon',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since Measure 91 (2014). Adults 21+ may possess 1 oz in public (8 oz at home). Home grow of 4 plants allowed.',
  },
  {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Robust medical program with dispensaries statewide. Recreational legislation ongoing as of 2026. Possession without card is illegal.',
  },
  {
    stateCode: 'RI',
    stateName: 'Rhode Island',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legalized in 2022. Adults 21+ may possess 1 oz and grow 6 plants. Retail sales began Dec 2022.',
  },
  {
    stateCode: 'SC',
    stateName: 'South Carolina',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes: 'Cannabis fully illegal. No medical or recreational program.',
  },
  {
    stateCode: 'SD',
    stateName: 'South Dakota',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical program active since 2021. Recreational legalization was invalidated by the state Supreme Court after voter approval.',
  },
  {
    stateCode: 'TN',
    stateName: 'Tennessee',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'Cannabis fully illegal. Possession carries criminal penalties. No medical program.',
  },
  {
    stateCode: 'TX',
    stateName: 'Texas',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Compassionate Use Program (CUP) allows low-THC cannabis for specific conditions. Very limited. Possession otherwise illegal.',
  },
  {
    stateCode: 'UT',
    stateName: 'Utah',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program launched 2020. Tightly regulated with licensed pharmacies. Recreational illegal.',
  },
  {
    stateCode: 'VT',
    stateName: 'Vermont',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'First state to legalize via legislature (not ballot). Adults 21+ may possess 1 oz and grow 2 mature/4 immature plants. Retail sales began Oct 2022.',
  },
  {
    stateCode: 'VA',
    stateName: 'Virginia',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Recreational legal since July 2021 (possession/home grow). Retail dispensary sales launched Jan 2024.',
  },
  {
    stateCode: 'WA',
    stateName: 'Washington',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'One of the first states to legalize recreational (I-502, 2012). Adults 21+ may possess 1 oz. Hundreds of licensed retailers.',
  },
  {
    stateCode: 'WV',
    stateName: 'West Virginia',
    status: 'medical',
    medicalLegal: true,
    recreationalLegal: false,
    notes:
      'Medical cannabis program active. Recreational remains illegal. Program has faced slow rollout.',
  },
  {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    status: 'decriminalized',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'No medical or recreational program. Possession of 25g or less is decriminalized (civil fine $100–500). Local jurisdictions have adopted lighter policies.',
  },
  {
    stateCode: 'WY',
    stateName: 'Wyoming',
    status: 'illegal',
    medicalLegal: false,
    recreationalLegal: false,
    notes:
      'Cannabis fully illegal. No medical or recreational program. Strict penalties for possession.',
  },
  {
    stateCode: 'DC',
    stateName: 'Washington D.C.',
    status: 'recreational',
    medicalLegal: true,
    recreationalLegal: true,
    notes:
      'Initiative 71 legalized possession/home grow in 2014. Medical dispensaries now serve both medical and recreational customers. Gifting model for retail.',
  },
];

/** Lookup a state by its two-letter code. Returns undefined if not found. */
export function getStateLaw(stateCode: string): StateLaw | undefined {
  return STATE_LAWS.find(s => s.stateCode === stateCode.toUpperCase());
}
