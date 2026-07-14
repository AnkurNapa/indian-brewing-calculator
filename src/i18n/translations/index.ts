import { coreTranslations } from './core';
import { homeTranslations } from './home';
import { waterReportFormTranslations } from './waterReportForm';
import { mashAdjustmentTranslations } from './mashAdjustment';
import { spargeAdjustmentTranslations } from './spargeAdjustment';
import { waterVolumesTranslations } from './waterVolumes';
import { transferLauteringTranslations } from './transferLautering';
import { brewhouseTranslations } from './brewhouse';
import { fermentationTrackerTranslations } from './fermentationTracker';
import { styleCheckTranslations } from './styleCheck';
import { blendingTranslations } from './blending';
import { mixingCrossTranslations } from './mixingCross';
import { recipesTranslations } from './recipes';
import { backupTranslations } from './backup';
import { aboutTranslations } from './about';
import { sharedUiTranslations } from './sharedUi';

export { LANGUAGE_NAMES, LANGUAGE_ORDER } from './types';
export type { Language } from './types';

/**
 * Merged from per-panel fragment files (one per tab, plus core chrome and
 * sharedUi for cross-panel atoms) so translation work on different panels
 * can happen in parallel without every contributor touching one giant
 * file. Keys are flat and prefixed by area, so any component can pull a
 * string by a single stable key regardless of which fragment it lives in.
 */
export const translations = {
  ...coreTranslations,
  ...homeTranslations,
  ...waterReportFormTranslations,
  ...mashAdjustmentTranslations,
  ...spargeAdjustmentTranslations,
  ...waterVolumesTranslations,
  ...transferLauteringTranslations,
  ...brewhouseTranslations,
  ...fermentationTrackerTranslations,
  ...styleCheckTranslations,
  ...blendingTranslations,
  ...mixingCrossTranslations,
  ...recipesTranslations,
  ...backupTranslations,
  ...aboutTranslations,
  ...sharedUiTranslations,
};

export type TranslationKey = keyof typeof translations;
