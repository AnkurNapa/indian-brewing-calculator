import { YeastStyle } from './pitchRate';

export interface YeastStrain {
  id: string;
  name: string;
  style: YeastStyle;
}

/**
 * Common commercial yeast strains, for quick-filling the strain name and
 * ale/lager style used by the pitch rate calculator's cell-count target.
 */
export const YEAST_STRAINS: YeastStrain[] = [
  { id: 'us-05', name: 'Fermentis SafAle US-05 (American Ale)', style: 'ale' },
  { id: 's-04', name: 'Fermentis SafAle S-04 (English Ale)', style: 'ale' },
  { id: 't-58', name: 'Fermentis SafBrew T-58 (Belgian Ale)', style: 'ale' },
  { id: 'w-3470', name: 'Fermentis SafLager W-34/70', style: 'lager' },
  { id: 's-23', name: 'Fermentis SafLager S-23', style: 'lager' },
  { id: 'wy1056', name: 'Wyeast 1056 American Ale', style: 'ale' },
  { id: 'wy1968', name: 'Wyeast 1968 London ESB', style: 'ale' },
  { id: 'wy3068', name: 'Wyeast 3068 Weihenstephan Weizen', style: 'ale' },
  { id: 'wy3944', name: 'Wyeast 3944 Belgian Witbier', style: 'ale' },
  { id: 'wy1214', name: 'Wyeast 1214 Belgian Abbey', style: 'ale' },
  { id: 'wy2007', name: 'Wyeast 2007 Pilsen Lager', style: 'lager' },
  { id: 'wy2124', name: 'Wyeast 2124 Bohemian Lager', style: 'lager' },
  { id: 'wlp001', name: 'White Labs WLP001 California Ale', style: 'ale' },
  { id: 'wlp002', name: 'White Labs WLP002 English Ale', style: 'ale' },
  { id: 'wlp090', name: 'White Labs WLP090 San Diego Super Ale', style: 'ale' },
  { id: 'wlp830', name: 'White Labs WLP830 German Lager', style: 'lager' },
  { id: 'nottingham', name: 'Lallemand Nottingham', style: 'ale' },
  { id: 'bry-97', name: 'Lallemand BRY-97 (American West Coast)', style: 'ale' },
  { id: 'diamond', name: 'Lallemand Diamond Lager', style: 'lager' },
];
