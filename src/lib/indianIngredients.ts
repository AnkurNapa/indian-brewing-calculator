import { WeyermannMalt } from './weyermannMalts';

/**
 * Local Indian brewing ingredients.
 *
 * Two groups, because they enter the brew at different stages:
 *
 *  - INDIAN_GRAINS are MASHABLE (barley, wheat, rice, millets) and share
 *    the WeyermannMalt shape, so they quick-fill a grain-bill row just like
 *    the Weyermann malts. potentialSg is the imperial PPG-as-SG convention
 *    used throughout (1 lb in 1 US gallon; base malt ~1.037 = 37 PPG).
 *
 *  - INDIAN_ADJUNCTS are NOT mashed -- sugars, fruits, and spices added in
 *    the boil, whirlpool, or fermenter. They carry dosing, timing, and
 *    flavour parameters instead of a mash category, so they live in a
 *    reference table rather than the grain bill (you don't mash honey or
 *    mango). Fermentable ones list an approximate extract for OG planning.
 *
 * All figures are representative planning midpoints -- always confirm
 * against the actual lot/COA. Indian barley and wheat vary widely by
 * variety (Sharbati, Lokwan, DWR barley, etc.) and season.
 */

/** Mashable Indian grains, grain-bill compatible (same shape as Weyermann malts). */
export const INDIAN_GRAINS: WeyermannMalt[] = [
  { id: 'in-6row-malt', name: 'Indian 6-Row Barley Malt', colorLovibond: 2.0, category: 'base', potentialSg: 1.034 },
  { id: 'in-2row-malt', name: 'Indian 2-Row Barley Malt', colorLovibond: 1.8, category: 'base', potentialSg: 1.037 },
  { id: 'in-raw-barley', name: 'Raw Barley (unmalted adjunct)', colorLovibond: 1.5, category: 'wheatOrOther', potentialSg: 1.032 },
  { id: 'in-rice-flaked', name: 'Rice, Flaked (adjunct)', colorLovibond: 1.0, category: 'wheatOrOther', potentialSg: 1.038 },
  { id: 'in-broken-rice', name: 'Broken Rice (cereal mash)', colorLovibond: 1.0, category: 'wheatOrOther', potentialSg: 1.04 },
  { id: 'in-wheat-raw', name: 'Indian Raw Wheat (Sharbati/Lokwan)', colorLovibond: 2.0, category: 'wheatOrOther', potentialSg: 1.039 },
  { id: 'in-wheat-malt', name: 'Indian Malted Wheat', colorLovibond: 2.5, category: 'wheatOrOther', potentialSg: 1.038 },
  { id: 'in-wheat-flaked', name: 'Flaked Wheat', colorLovibond: 2.0, category: 'wheatOrOther', potentialSg: 1.036 },
  { id: 'in-jowar', name: 'Jowar / Sorghum (gluten-free adjunct)', colorLovibond: 2.0, category: 'wheatOrOther', potentialSg: 1.035 },
  { id: 'in-bajra', name: 'Bajra / Pearl Millet (adjunct)', colorLovibond: 2.0, category: 'wheatOrOther', potentialSg: 1.033 },
  { id: 'in-ragi', name: 'Ragi / Finger Millet (adjunct)', colorLovibond: 4.0, category: 'wheatOrOther', potentialSg: 1.032 },
];

export type IndianAdjunctKind = 'sugar' | 'fruit' | 'spice';
export type BrewStage = 'boil' | 'whirlpool' | 'fermenter' | 'secondary';

export interface IndianAdjunct {
  id: string;
  name: string;
  kind: IndianAdjunctKind;
  /** True if it contributes fermentable sugar (and therefore OG). */
  fermentable: boolean;
  /** Approx extract (PPG-as-SG) per kg in 1 L, for fermentables; undefined for pure flavour/acid. */
  potentialSg?: number;
  /** Approximate colour contribution, °Lovibond. */
  colorLovibond?: number;
  /** Typical dosing rate, grams per litre of finished beer. */
  typicalRateGPerL: number;
  /** When it's usually added. */
  stage: BrewStage;
  /** Short flavour / purpose note. */
  flavor: string;
}

/** Non-mash Indian adjuncts: sugars, fruits, and spices (boil / whirlpool / fermenter). */
export const INDIAN_ADJUNCTS: IndianAdjunct[] = [
  {
    id: 'honey',
    name: 'Indian Honey',
    kind: 'sugar',
    fermentable: true,
    potentialSg: 1.035,
    colorLovibond: 2,
    typicalRateGPerL: 30,
    stage: 'fermenter',
    flavor: 'Floral, delicate; ~95% fermentable so it dries the beer and lightens body. Add post-boil (flameout or fermenter) to keep aroma.',
  },
  {
    id: 'jaggery',
    name: 'Jaggery / Gur',
    kind: 'sugar',
    fermentable: true,
    potentialSg: 1.04,
    colorLovibond: 25,
    typicalRateGPerL: 40,
    stage: 'boil',
    flavor: 'Unrefined cane sugar: rich molasses, caramel, rum-like; ferments fairly dry and adds noticeable colour. Add in the boil.',
  },
  {
    id: 'palm-jaggery',
    name: 'Palm Jaggery (Nolen Gur)',
    kind: 'sugar',
    fermentable: true,
    potentialSg: 1.038,
    colorLovibond: 30,
    typicalRateGPerL: 40,
    stage: 'boil',
    flavor: 'Date/palm jaggery: deep toffee, smoky-caramel; seasonal (winter). Great in dark ales and stouts.',
  },
  {
    id: 'mango',
    name: 'Mango (Alphonso purée)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.008,
    colorLovibond: 3,
    typicalRateGPerL: 120,
    stage: 'secondary',
    flavor: 'Tropical, sweet-ripe mango; ~14-16 °Bx so modest OG lift. Add pasteurised purée in secondary to preserve aroma; expect haze.',
  },
  {
    id: 'kokum',
    name: 'Kokum (Garcinia indica)',
    kind: 'fruit',
    fermentable: false,
    colorLovibond: 8,
    typicalRateGPerL: 5,
    stage: 'secondary',
    flavor: 'Dried purple rind: tart, sour, cranberry-like from hydroxycitric acid. A natural souring/acidity + colour agent; little fermentable sugar.',
  },
  {
    id: 'coriander',
    name: 'Coriander Seed (Dhania)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 1,
    stage: 'whirlpool',
    flavor: 'Cracked seed: citrusy, lemony, lightly spicy. Classic witbier/saison spice; add last 5-10 min or at whirlpool.',
  },
  {
    id: 'cardamom',
    name: 'Green Cardamom (Elaichi)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.3,
    stage: 'whirlpool',
    flavor: 'Warm, aromatic, camphor-citrus. Very potent -- use sparingly at flameout/whirlpool. Pairs with wheat beers and spiced ales.',
  },
  {
    id: 'ginger',
    name: 'Dry Ginger (Sonth)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 1.5,
    stage: 'boil',
    flavor: 'Spicy, warming, peppery. Add in the boil or whirlpool; good in saisons, gingered ales, and winter warmers.',
  },
];
