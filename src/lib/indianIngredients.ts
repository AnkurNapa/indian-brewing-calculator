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
  { id: 'in-ragi', name: 'Ragi / Finger Millet (raw adjunct)', colorLovibond: 4.0, category: 'wheatOrOther', potentialSg: 1.032 },
  { id: 'in-ragi-malt', name: 'Ragi Malt (malted finger millet)', colorLovibond: 5.0, category: 'wheatOrOther', potentialSg: 1.034 },
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

  // Regional fruits ---------------------------------------------------------
  {
    id: 'orange-peel',
    name: 'Orange Peel (Santra/Malta)',
    kind: 'fruit',
    fermentable: false,
    colorLovibond: 2,
    typicalRateGPerL: 2,
    stage: 'whirlpool',
    flavor: 'Dried sweet/bitter orange peel: citrusy, marmalade, gently bitter. Classic witbier pairing with coriander; add at whirlpool.',
  },
  {
    id: 'guava',
    name: 'Guava (Amrood)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.008,
    colorLovibond: 2,
    typicalRateGPerL: 100,
    stage: 'secondary',
    flavor: 'Fragrant tropical guava, ~8-10 °Bx. Add purée in secondary; shines in sours and wheat beers.',
  },
  {
    id: 'jamun',
    name: 'Jamun (Java Plum)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.01,
    colorLovibond: 12,
    typicalRateGPerL: 80,
    stage: 'secondary',
    flavor: 'Tart-sweet and astringent, deep purple. Adds colour and a dry, wine-like note.',
  },
  {
    id: 'lychee',
    name: 'Lychee (Litchi)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.01,
    colorLovibond: 2,
    typicalRateGPerL: 100,
    stage: 'secondary',
    flavor: 'Floral, perfumed, sweet. Delicate -- add late to keep the aroma.',
  },
  {
    id: 'pineapple',
    name: 'Pineapple (Ananas)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.012,
    colorLovibond: 2,
    typicalRateGPerL: 100,
    stage: 'secondary',
    flavor: 'Tart-sweet tropical; bromelain can thin body. Great in sours and hazy pales.',
  },
  {
    id: 'sweet-lime',
    name: 'Sweet Lime (Mosambi)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.007,
    colorLovibond: 1,
    typicalRateGPerL: 60,
    stage: 'whirlpool',
    flavor: 'Mild sweet citrus, low acid. A bright, juicy note without much tartness.',
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate (Anar)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.011,
    colorLovibond: 6,
    typicalRateGPerL: 90,
    stage: 'secondary',
    flavor: 'Tart-sweet, ruby colour, lightly tannic. Good in sours and saisons.',
  },
  {
    id: 'custard-apple',
    name: 'Custard Apple (Sitaphal)',
    kind: 'fruit',
    fermentable: true,
    potentialSg: 1.012,
    colorLovibond: 3,
    typicalRateGPerL: 100,
    stage: 'secondary',
    flavor: 'Creamy, sweet, custard-like. Adds rich mouthfeel; add in secondary.',
  },
  {
    id: 'tamarind',
    name: 'Tamarind (Imli)',
    kind: 'fruit',
    fermentable: false,
    colorLovibond: 10,
    typicalRateGPerL: 6,
    stage: 'boil',
    flavor: 'Intensely sour-tangy (tartaric acid), dark. A natural souring + tang agent.',
  },
  {
    id: 'amla',
    name: 'Amla (Indian Gooseberry)',
    kind: 'fruit',
    fermentable: false,
    colorLovibond: 2,
    typicalRateGPerL: 4,
    stage: 'secondary',
    flavor: 'Very tart and astringent, vitamin-C bright. Souring + fresh acidity.',
  },

  // Indian spice rack -------------------------------------------------------
  {
    id: 'cinnamon',
    name: 'Cinnamon (Dalchini)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.5,
    stage: 'whirlpool',
    flavor: 'Warm, sweet, woody. Add at flameout/whirlpool; pairs with dark and spiced ales.',
  },
  {
    id: 'clove',
    name: 'Clove (Laung)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.2,
    stage: 'whirlpool',
    flavor: 'Pungent, phenolic, medicinal. Extremely potent -- a few whole cloves per batch.',
  },
  {
    id: 'black-pepper',
    name: 'Black Pepper (Kali Mirch)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.7,
    stage: 'whirlpool',
    flavor: 'Sharp, peppery, warming. Lifts saisons and rye beers; crack fresh.',
  },
  {
    id: 'fennel',
    name: 'Fennel Seed (Saunf)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 1,
    stage: 'whirlpool',
    flavor: 'Sweet anise/licorice. Classic in Belgian-style spiced ales.',
  },
  {
    id: 'star-anise',
    name: 'Star Anise (Chakra Phool)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.3,
    stage: 'whirlpool',
    flavor: 'Strong anise/licorice. Very potent -- use sparingly.',
  },
  {
    id: 'nutmeg',
    name: 'Nutmeg (Jaiphal)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.3,
    stage: 'whirlpool',
    flavor: 'Warm, nutty, sweet-spicy. Freshly grated; good in winter warmers.',
  },
  {
    id: 'fenugreek',
    name: 'Fenugreek (Methi)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.5,
    stage: 'boil',
    flavor: 'Maple/burnt-sugar with a bitter edge. Use sparingly for a maple note.',
  },
  {
    id: 'saffron',
    name: 'Saffron (Kesar)',
    kind: 'spice',
    fermentable: false,
    colorLovibond: 1,
    typicalRateGPerL: 0.03,
    stage: 'whirlpool',
    flavor: 'Floral, honeyed, golden hue. Luxurious and very potent -- a pinch per batch.',
  },
  {
    id: 'ajwain',
    name: 'Ajwain (Carom Seed)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 0.3,
    stage: 'whirlpool',
    flavor: 'Thymol-forward, herbal-medicinal. Distinctive; use very sparingly.',
  },
  {
    id: 'rose',
    name: 'Rose Petals (Gulab)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 1,
    stage: 'whirlpool',
    flavor: 'Floral, perfumed, Mughlai. Pairs beautifully with saffron and cardamom.',
  },
  {
    id: 'lemongrass',
    name: 'Lemongrass (Gavti Chaha)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 2,
    stage: 'whirlpool',
    flavor: 'Bright lemon-citrus, grassy. Lifts wheat beers and saisons.',
  },
  {
    id: 'curry-leaf',
    name: 'Curry Leaf (Kadi Patta)',
    kind: 'spice',
    fermentable: false,
    typicalRateGPerL: 1,
    stage: 'whirlpool',
    flavor: 'Nutty, citrus-herbal, savoury. Experimental -- a distinctly South Indian note.',
  },
];
