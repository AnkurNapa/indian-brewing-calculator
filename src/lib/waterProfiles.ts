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
];
