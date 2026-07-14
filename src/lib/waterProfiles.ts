/**
 * Seed water profiles for quick-start use. All values are illustrative,
 * realistic mg/L figures representative of general water-hardness
 * categories and classic beer-style target profiles as commonly
 * discussed in brewing water chemistry literature -- they are not
 * sourced from any proprietary tool.
 */

import { IonProfile } from './waterChemistry';

export interface NamedWaterProfile {
  id: string;
  name: string;
  description: string;
  profile: IonProfile;
}

export const SOURCE_WATER_PROFILES: NamedWaterProfile[] = [
  {
    id: 'ro-distilled',
    name: 'RO / Distilled Water',
    description: 'Reverse-osmosis or distilled water -- effectively zero minerals.',
    profile: {
      calcium: 0,
      magnesium: 0,
      sodium: 0,
      sulfate: 0,
      chloride: 0,
      bicarbonate: 0,
      alkalinity: 0,
    },
  },
  {
    id: 'soft-tap',
    name: 'Generic Soft Tap Water',
    description: 'Typical of soft municipal supplies (e.g. granite/sandstone catchments).',
    profile: {
      calcium: 20,
      magnesium: 5,
      sodium: 10,
      sulfate: 10,
      chloride: 15,
      bicarbonate: 30,
      alkalinity: 25,
    },
  },
  {
    id: 'medium-tap',
    name: 'Generic Medium-Hardness Tap Water',
    description: 'Typical of moderately mineralized municipal supplies.',
    profile: {
      calcium: 60,
      magnesium: 12,
      sodium: 20,
      sulfate: 40,
      chloride: 35,
      bicarbonate: 120,
      alkalinity: 100,
    },
  },
  {
    id: 'hard-tap',
    name: 'Generic Hard Tap Water',
    description: 'Typical of limestone/chalk-catchment municipal supplies (e.g. classic London-style).',
    profile: {
      calcium: 150,
      magnesium: 20,
      sodium: 25,
      sulfate: 60,
      chloride: 40,
      bicarbonate: 280,
      alkalinity: 230,
    },
  },
  // Representative Indian city municipal supplies. Indian tap water varies
  // widely by zone, source (surface vs borewell), and season -- these are
  // planning midpoints, not a substitute for your own lab report.
  {
    id: 'bengaluru-cauvery',
    name: 'Bengaluru (Cauvery) Tap',
    description: 'BWSSB Cauvery-supplied water: medium hardness and alkalinity. Borewell water in the city runs much harder -- test yours.',
    profile: {
      calcium: 45,
      magnesium: 18,
      sodium: 25,
      sulfate: 30,
      chloride: 40,
      bicarbonate: 150,
      alkalinity: 125,
    },
  },
  {
    id: 'mumbai-lakes',
    name: 'Mumbai (Lake) Tap',
    description: 'Surface water from the Tansa/Bhatsa/Vaitarna lakes: soft, low-mineral, low alkalinity -- close to a clean lager/pilsner base.',
    profile: {
      calcium: 20,
      magnesium: 6,
      sodium: 12,
      sulfate: 10,
      chloride: 20,
      bicarbonate: 55,
      alkalinity: 45,
    },
  },
  {
    id: 'delhi-yamuna',
    name: 'Delhi (Yamuna/Groundwater) Tap',
    description: 'Yamuna + Ganga-canal treated water and groundwater: hard, high sodium and alkalinity. Usually needs dilution/acid for pale, hoppy beers.',
    profile: {
      calcium: 85,
      magnesium: 30,
      sodium: 55,
      sulfate: 55,
      chloride: 70,
      bicarbonate: 300,
      alkalinity: 245,
    },
  },
  {
    id: 'hyderabad-krishna',
    name: 'Hyderabad (Krishna/Godavari) Tap',
    description: 'HMWSSB Krishna/Godavari + reservoir supply: hard with moderately high alkalinity and chloride; city borewells run harder still.',
    profile: {
      calcium: 70,
      magnesium: 28,
      sodium: 48,
      sulfate: 50,
      chloride: 75,
      bicarbonate: 240,
      alkalinity: 195,
    },
  },
];

export const TARGET_STYLE_PROFILES: NamedWaterProfile[] = [
  {
    id: 'pale-ale',
    name: 'Pale Ale (sulfate-forward)',
    description: 'Classic English/American pale ale target -- crisp, hop-forward, sulfate > chloride.',
    profile: {
      calcium: 120,
      magnesium: 15,
      sodium: 15,
      sulfate: 250,
      chloride: 60,
      bicarbonate: 40,
      alkalinity: 30,
    },
  },
  {
    id: 'pilsner',
    name: 'Pilsner (soft, low-mineral)',
    description: 'Classic soft-water pilsner target -- low everything, very low alkalinity for a pale, delicate malt profile.',
    profile: {
      calcium: 40,
      magnesium: 5,
      sodium: 5,
      sulfate: 10,
      chloride: 10,
      bicarbonate: 15,
      alkalinity: 10,
    },
  },
  {
    id: 'stout',
    name: 'Stout (chloride-forward, higher alkalinity)',
    description: 'Roasty dark-beer target -- higher alkalinity to balance dark malt acidity, chloride > sulfate for roundness.',
    profile: {
      calcium: 130,
      magnesium: 20,
      sodium: 25,
      sulfate: 60,
      chloride: 100,
      bicarbonate: 250,
      alkalinity: 200,
    },
  },
  {
    id: 'ipa',
    name: 'IPA (high-sulfate, hop-forward)',
    description: 'Aggressively hoppy IPA target -- high sulfate for a sharp, dry bitterness, low alkalinity to keep the pale grist bright.',
    profile: {
      calcium: 150,
      magnesium: 10,
      sodium: 10,
      sulfate: 350,
      chloride: 50,
      bicarbonate: 25,
      alkalinity: 15,
    },
  },
  {
    id: 'amber',
    name: 'Amber / Malty Ale (balanced, chloride-leaning)',
    description: 'Balanced amber/red ale target -- moderate alkalinity for mid-color malt, chloride slightly favored for malt roundness.',
    profile: {
      calcium: 90,
      magnesium: 12,
      sodium: 20,
      sulfate: 80,
      chloride: 90,
      bicarbonate: 90,
      alkalinity: 75,
    },
  },
  {
    id: 'porter',
    name: 'Porter (moderate alkalinity, chloride-forward)',
    description: 'Dark but not as roasty as stout -- moderate alkalinity to support the darker grist, chloride > sulfate for smoothness.',
    profile: {
      calcium: 110,
      magnesium: 18,
      sodium: 20,
      sulfate: 55,
      chloride: 85,
      bicarbonate: 180,
      alkalinity: 150,
    },
  },
  {
    id: 'belgian',
    name: 'Belgian Ale (soft, low-mineral, balanced)',
    description: 'Classic Belgian target -- soft water with low everything, letting yeast character and malt/sugar complexity lead.',
    profile: {
      calcium: 50,
      magnesium: 8,
      sodium: 12,
      sulfate: 45,
      chloride: 45,
      bicarbonate: 40,
      alkalinity: 30,
    },
  },
];
