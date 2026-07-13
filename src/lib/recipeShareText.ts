import { AppState } from '@/hooks/useWaterProfile';
import { FermentationBatch } from './fermentationTracker';
import { roundForDisplay } from './units';
import { TranslationKey } from '@/i18n/translations';

export interface FermentationBatchSummary {
  name: string;
  entryCount: number;
  currentGravity: number | null;
  apparentAttenuationPercent: number | null;
  likelyComplete: boolean;
}

export interface RecipeShareExtras {
  bjcpStyleName: string;
  targetWaterStyleName: string;
  ibu: number;
  srm: number | null;
  abvPercent: number;
  parametersInRange: number;
  fermentationBatches: FermentationBatchSummary[];
}

/** Matches the `t()` shape from `useLanguage()` -- passed in since this module runs outside React. */
type Translate = (key: TranslationKey, vars?: Record<string, string | number>) => string;

/**
 * Plain-text recipe summary for the Web Share API / clipboard fallback --
 * kept as plain text (not HTML/PDF) so it pastes cleanly into WhatsApp,
 * email, SMS, or any note-taking app without a rendering step. Mirrors
 * every section shown on the Home overview screen, not just a subset, so
 * sharing never silently drops a value the user can see on Home.
 */
export function buildRecipeShareText(state: AppState, extras: RecipeShareExtras, t: Translate): string {
  const lines: string[] = [];
  lines.push(t('home.shareText.title'));
  lines.push('');

  lines.push(`${t('home.shareText.batchVolume')}: ${state.batchVolumeL} L`);
  lines.push(`${t('home.shareText.spargeVolume')}: ${state.spargeVolumeL} L`);
  lines.push(`${t('home.shareText.targetWaterStyle')}: ${extras.targetWaterStyleName}`);
  lines.push(t('home.shareText.targetBjcpStyle', { name: extras.bjcpStyleName, inRange: extras.parametersInRange }));
  lines.push('');

  lines.push(t('home.shareText.sourceWaterHeading'));
  lines.push(
    t('home.shareText.sourceWaterLine', {
      calcium: state.sourceProfile.calcium,
      magnesium: state.sourceProfile.magnesium,
      sodium: state.sourceProfile.sodium,
      sulfate: state.sourceProfile.sulfate,
      chloride: state.sourceProfile.chloride,
      bicarbonate: state.sourceProfile.bicarbonate,
      alkalinity: state.sourceProfile.alkalinity,
    }),
  );
  lines.push('');

  lines.push(t('home.shareText.grainBillHeading'));
  if (state.grainBill.length === 0) {
    lines.push(t('home.shareText.noneEntered'));
  } else {
    state.grainBill.forEach((row) => {
      const potential =
        Number.isFinite(row.potentialSg) && (row.potentialSg as number) > 0
          ? t('home.shareText.potentialSuffix', { value: row.potentialSg as number })
          : '';
      lines.push(
        t('home.shareText.grainRow', {
          name: row.name || t('home.shareText.unnamedGrain'),
          weight: row.weightKg,
          color: row.colorLovibond,
          potential,
        }),
      );
    });
  }
  lines.push('');

  lines.push(t('home.shareText.hopScheduleHeading'));
  if (state.hopAdditions.length === 0) {
    lines.push(t('home.shareText.noneEntered'));
  } else {
    state.hopAdditions.forEach((hop) => {
      lines.push(
        t('home.shareText.hopRow', {
          name: hop.name || t('home.shareText.unnamedHop'),
          weight: hop.weightG,
          aa: hop.alphaAcidPercent,
          time: hop.boilTimeMinutes,
        }),
      );
    });
  }
  lines.push('');

  lines.push(
    t('home.shareText.gravityLine', {
      og: roundForDisplay(state.ogSg, 3),
      fg: roundForDisplay(state.fgSg, 3),
      abv: roundForDisplay(extras.abvPercent, 2),
    }),
  );
  lines.push(
    t('home.shareText.ibuColorLine', {
      ibu: roundForDisplay(extras.ibu, 1),
      color: extras.srm !== null ? `${roundForDisplay(extras.srm, 1)} SRM` : t('home.shareText.colorNotAvailable'),
    }),
  );
  lines.push('');

  lines.push(t('home.shareText.fermentationBatchesHeading'));
  if (extras.fermentationBatches.length === 0) {
    lines.push(t('home.shareText.noneLogged'));
  } else {
    extras.fermentationBatches.forEach((batch) => {
      const gravity =
        batch.currentGravity !== null ? `${roundForDisplay(batch.currentGravity, 3)} SG` : t('home.shareText.noReadings');
      const attenuation =
        batch.apparentAttenuationPercent !== null
          ? t('home.shareText.attenuationSuffix', { value: roundForDisplay(batch.apparentAttenuationPercent, 1) })
          : '';
      const finished = batch.likelyComplete ? t('home.shareText.likelyFinishedSuffix') : '';
      lines.push(
        t('home.shareText.batchRow', { name: batch.name, count: batch.entryCount, gravity, attenuation, finished }),
      );
    });
  }
  lines.push('');

  lines.push(t('home.shareText.footer'));

  return lines.join('\n');
}
