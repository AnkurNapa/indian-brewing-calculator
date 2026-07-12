import { MaltCategory } from './waterChemistry';

export interface WeyermannMalt {
  id: string;
  name: string;
  /** Approximate color in °Lovibond (converted from Weyermann's published EBC spec sheets). */
  colorLovibond: number;
  category: MaltCategory;
}

/**
 * Weyermann's core malt range, for quick-filling a grain bill row (name +
 * color + category) instead of typing every field by hand. Colors are
 * approximate mid-range °Lovibond conversions from Weyermann's published
 * EBC specs -- always check the actual bag/COA for a real batch.
 */
export const WEYERMANN_MALTS: WeyermannMalt[] = [
  { id: 'pilsner', name: 'Weyermann Pilsner Malt', colorLovibond: 1.8, category: 'base' },
  { id: 'barke-pilsner', name: 'Weyermann Barke Pilsner Malt', colorLovibond: 1.8, category: 'base' },
  { id: 'pale-ale', name: 'Weyermann Pale Ale Malt', colorLovibond: 3.5, category: 'base' },
  { id: 'vienna', name: 'Weyermann Vienna Malt', colorLovibond: 3.8, category: 'base' },
  { id: 'munich-light', name: 'Weyermann Munich Malt Type I (Light)', colorLovibond: 7, category: 'base' },
  { id: 'munich-dark', name: 'Weyermann Munich Malt Type II (Dark)', colorLovibond: 9.5, category: 'base' },
  { id: 'barke-munich', name: 'Weyermann Barke Munich Malt', colorLovibond: 8.5, category: 'base' },
  { id: 'melanoidin', name: 'Weyermann Melanoidin Malt', colorLovibond: 26, category: 'base' },
  { id: 'rauch-beechwood', name: 'Weyermann Rauchmalt (Beechwood Smoked)', colorLovibond: 4, category: 'base' },
  { id: 'wheat-light', name: 'Weyermann Wheat Malt (Light)', colorLovibond: 2.5, category: 'wheatOrOther' },
  { id: 'wheat-dark', name: 'Weyermann Wheat Malt (Dark)', colorLovibond: 5.5, category: 'wheatOrOther' },
  { id: 'rye', name: 'Weyermann Rye Malt', colorLovibond: 3.5, category: 'wheatOrOther' },
  { id: 'oat', name: 'Weyermann Oat Malt', colorLovibond: 2.5, category: 'wheatOrOther' },
  { id: 'carafoam', name: 'Weyermann CaraFoam', colorLovibond: 2, category: 'crystal' },
  { id: 'carahell', name: 'Weyermann CaraHell', colorLovibond: 10, category: 'crystal' },
  { id: 'carared', name: 'Weyermann CaraRed', colorLovibond: 20, category: 'crystal' },
  { id: 'caramunich-1', name: 'Weyermann CaraMunich I', colorLovibond: 39, category: 'crystal' },
  { id: 'caramunich-2', name: 'Weyermann CaraMunich II', colorLovibond: 51, category: 'crystal' },
  { id: 'caramunich-3', name: 'Weyermann CaraMunich III', colorLovibond: 62, category: 'crystal' },
  { id: 'caraaroma', name: 'Weyermann CaraAroma', colorLovibond: 152, category: 'crystal' },
  { id: 'abbey', name: 'Weyermann Abbey Malt', colorLovibond: 24, category: 'crystal' },
  { id: 'carafa-1', name: 'Weyermann Carafa I (Special/Dehusked)', colorLovibond: 168, category: 'roasted' },
  { id: 'carafa-2', name: 'Weyermann Carafa II (Special/Dehusked)', colorLovibond: 219, category: 'roasted' },
  { id: 'carafa-3', name: 'Weyermann Carafa III (Special/Dehusked)', colorLovibond: 267, category: 'roasted' },
  { id: 'chocolate-wheat', name: 'Weyermann Chocolate Wheat Malt', colorLovibond: 260, category: 'roasted' },
  { id: 'chocolate-rye', name: 'Weyermann Chocolate Rye Malt', colorLovibond: 260, category: 'roasted' },
  { id: 'roasted-barley', name: 'Weyermann Roasted Barley', colorLovibond: 300, category: 'roasted' },
  { id: 'acidulated', name: 'Weyermann Acidulated Malt', colorLovibond: 2.5, category: 'acidulated' },
];
