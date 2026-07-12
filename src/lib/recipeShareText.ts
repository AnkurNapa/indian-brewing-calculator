import { AppState } from '@/hooks/useWaterProfile';
import { FermentationBatch } from './fermentationTracker';
import { roundForDisplay } from './units';

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

/**
 * Plain-text recipe summary for the Web Share API / clipboard fallback --
 * kept as plain text (not HTML/PDF) so it pastes cleanly into WhatsApp,
 * email, SMS, or any note-taking app without a rendering step. Mirrors
 * every section shown on the Home overview screen, not just a subset, so
 * sharing never silently drops a value the user can see on Home.
 */
export function buildRecipeShareText(state: AppState, extras: RecipeShareExtras): string {
  const lines: string[] = [];
  lines.push('Brew Recipe Summary');
  lines.push('');

  lines.push(`Batch Volume: ${state.batchVolumeL} L`);
  lines.push(`Sparge Volume: ${state.spargeVolumeL} L`);
  lines.push(`Target Water Style: ${extras.targetWaterStyleName}`);
  lines.push(`Target BJCP Style: ${extras.bjcpStyleName} (${extras.parametersInRange}/5 parameters in range)`);
  lines.push('');

  lines.push('Source Water (mg/L):');
  lines.push(
    `  Calcium ${state.sourceProfile.calcium}, Magnesium ${state.sourceProfile.magnesium}, Sodium ${state.sourceProfile.sodium}, Sulfate ${state.sourceProfile.sulfate}, Chloride ${state.sourceProfile.chloride}, Bicarbonate ${state.sourceProfile.bicarbonate}, Alkalinity ${state.sourceProfile.alkalinity}`,
  );
  lines.push('');

  lines.push('Grain Bill:');
  if (state.grainBill.length === 0) {
    lines.push('  (none entered)');
  } else {
    state.grainBill.forEach((row) => {
      const potential = Number.isFinite(row.potentialSg) && (row.potentialSg as number) > 0 ? `, potential ${row.potentialSg} SG` : '';
      lines.push(`  - ${row.name || 'Unnamed grain'}: ${row.weightKg} kg @ ${row.colorLovibond} L${potential}`);
    });
  }
  lines.push('');

  lines.push('Hop Schedule:');
  if (state.hopAdditions.length === 0) {
    lines.push('  (none entered)');
  } else {
    state.hopAdditions.forEach((hop) => {
      lines.push(`  - ${hop.name || 'Unnamed hop'}: ${hop.weightG} g @ ${hop.alphaAcidPercent}% AA, ${hop.boilTimeMinutes} min`);
    });
  }
  lines.push('');

  lines.push(`OG: ${roundForDisplay(state.ogSg, 3)}   FG: ${roundForDisplay(state.fgSg, 3)}   ABV: ${roundForDisplay(extras.abvPercent, 2)}%`);
  lines.push(`IBU: ${roundForDisplay(extras.ibu, 1)}   Color: ${extras.srm !== null ? `${roundForDisplay(extras.srm, 1)} SRM` : 'n/a'}`);
  lines.push('');

  lines.push('Fermentation Batches:');
  if (extras.fermentationBatches.length === 0) {
    lines.push('  (none logged)');
  } else {
    extras.fermentationBatches.forEach((batch) => {
      const gravity = batch.currentGravity !== null ? `${roundForDisplay(batch.currentGravity, 3)} SG` : 'no readings';
      const attenuation =
        batch.apparentAttenuationPercent !== null ? `, ${roundForDisplay(batch.apparentAttenuationPercent, 1)}% attenuation` : '';
      const finished = batch.likelyComplete ? ', likely finished' : '';
      lines.push(`  - ${batch.name}: ${batch.entryCount} reading(s), current ${gravity}${attenuation}${finished}`);
    });
  }
  lines.push('');

  lines.push("Made with Indian Brewer's Calculator (ankurnapa.github.io/indian-brewing-calculator)");

  return lines.join('\n');
}
