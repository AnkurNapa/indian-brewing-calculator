import { MaltCategory } from './waterChemistry';

export interface WeyermannMalt {
  id: string;
  name: string;
  /** Approximate color in °Lovibond (converted from Weyermann's published EBC spec sheets). */
  colorLovibond: number;
  category: MaltCategory;
  /**
   * Approximate extract potential, expressed as the SG 1 kg would produce
   * in 1 L of water at full conversion -- a typical maltster "potential"
   * spec, converted from Weyermann's published fine-grind-dry-basis
   * extract percentages. Always check the actual bag/COA for a real
   * batch; these are representative midpoints for planning.
   */
  potentialSg: number;
}

/**
 * Weyermann's core malt range, for quick-filling a grain bill row (name +
 * color + category + extract potential) instead of typing every field by
 * hand. Colors are approximate mid-range °Lovibond conversions from
 * Weyermann's published EBC specs -- always check the actual bag/COA for
 * a real batch.
 */
/** Match key for malt names: ignores the ® marks and letter case, so rows saved
 * under older names ("Weyermann CaraMunich I") still match. */
export const maltNameKey = (name: string): string =>
  name.replace(/®/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

export const WEYERMANN_MALTS: WeyermannMalt[] = [
  { id: 'pilsner', name: 'Weyermann® Pilsner Malt', colorLovibond: 1.8, category: 'base', potentialSg: 1.037 },
  { id: 'barke-pilsner', name: 'Weyermann® Barke® Pilsner Malt', colorLovibond: 1.8, category: 'base', potentialSg: 1.038 },
  { id: 'pale-ale', name: 'Weyermann® Pale Ale Malt', colorLovibond: 3.5, category: 'base', potentialSg: 1.037 },
  { id: 'vienna', name: 'Weyermann® Vienna Malt', colorLovibond: 3.8, category: 'base', potentialSg: 1.036 },
  { id: 'munich-light', name: 'Weyermann® Munich Malt Type I (Light)', colorLovibond: 7, category: 'base', potentialSg: 1.036 },
  { id: 'munich-dark', name: 'Weyermann® Munich Malt Type II (Dark)', colorLovibond: 9.5, category: 'base', potentialSg: 1.035 },
  { id: 'barke-munich', name: 'Weyermann® Barke® Munich Malt', colorLovibond: 8.5, category: 'base', potentialSg: 1.036 },
  { id: 'melanoidin', name: 'Weyermann® Melanoidin Malt', colorLovibond: 26, category: 'base', potentialSg: 1.034 },
  { id: 'rauch-beechwood', name: 'Weyermann® Rauchmalt (Beechwood Smoked)', colorLovibond: 4, category: 'base', potentialSg: 1.037 },
  { id: 'wheat-light', name: 'Weyermann® Wheat Malt (Light)', colorLovibond: 2.5, category: 'wheatOrOther', potentialSg: 1.038 },
  { id: 'wheat-dark', name: 'Weyermann® Wheat Malt (Dark)', colorLovibond: 5.5, category: 'wheatOrOther', potentialSg: 1.037 },
  { id: 'rye', name: 'Weyermann® Rye Malt', colorLovibond: 3.5, category: 'wheatOrOther', potentialSg: 1.032 },
  { id: 'oat', name: 'Weyermann® Oat Malt', colorLovibond: 2.5, category: 'wheatOrOther', potentialSg: 1.033 },
  { id: 'carafoam', name: 'Weyermann® CARAFOAM®', colorLovibond: 2, category: 'crystal', potentialSg: 1.033 },
  { id: 'carahell', name: 'Weyermann® CARAHELL®', colorLovibond: 10, category: 'crystal', potentialSg: 1.035 },
  { id: 'carared', name: 'Weyermann® CARARED®', colorLovibond: 20, category: 'crystal', potentialSg: 1.034 },
  { id: 'caramunich-1', name: 'Weyermann® CARAMUNICH® I', colorLovibond: 39, category: 'crystal', potentialSg: 1.034 },
  { id: 'caramunich-2', name: 'Weyermann® CARAMUNICH® II', colorLovibond: 51, category: 'crystal', potentialSg: 1.034 },
  { id: 'caramunich-3', name: 'Weyermann® CARAMUNICH® III', colorLovibond: 62, category: 'crystal', potentialSg: 1.033 },
  { id: 'caraaroma', name: 'Weyermann® CARAAROMA®', colorLovibond: 152, category: 'crystal', potentialSg: 1.033 },
  { id: 'abbey', name: 'Weyermann® Abbey Malt®', colorLovibond: 24, category: 'crystal', potentialSg: 1.033 },
  { id: 'carafa-1', name: 'Weyermann® CARAFA® I (Special/Dehusked)', colorLovibond: 168, category: 'roasted', potentialSg: 1.032 },
  { id: 'carafa-2', name: 'Weyermann® CARAFA® II (Special/Dehusked)', colorLovibond: 219, category: 'roasted', potentialSg: 1.030 },
  { id: 'carafa-3', name: 'Weyermann® CARAFA® III (Special/Dehusked)', colorLovibond: 267, category: 'roasted', potentialSg: 1.028 },
  { id: 'chocolate-wheat', name: 'Weyermann® Chocolate Wheat Malt', colorLovibond: 260, category: 'roasted', potentialSg: 1.030 },
  { id: 'chocolate-rye', name: 'Weyermann® Chocolate Rye Malt', colorLovibond: 260, category: 'roasted', potentialSg: 1.030 },
  { id: 'roasted-barley', name: 'Weyermann® Roasted Barley', colorLovibond: 300, category: 'roasted', potentialSg: 1.026 },
  { id: 'acidulated', name: 'Weyermann® Acidulated Malt', colorLovibond: 2.5, category: 'acidulated', potentialSg: 1.027 },
];
