import { AppState } from '@/hooks/useWaterProfile';
import { roundForDisplay } from './units';

export interface RecipeShareExtras {
  bjcpStyleName: string;
  ibu: number;
  srm: number | null;
  abvPercent: number;
  parametersInRange: number;
}

/**
 * Plain-text recipe summary for the Web Share API / clipboard fallback --
 * kept as plain text (not HTML/PDF) so it pastes cleanly into WhatsApp,
 * email, SMS, or any note-taking app without a rendering step.
 */
export function buildRecipeShareText(state: AppState, extras: RecipeShareExtras): string {
  const lines: string[] = [];
  lines.push('Brew Recipe Summary');
  lines.push('');

  lines.push(`Batch Volume: ${state.batchVolumeL} L`);
  lines.push(`Target BJCP Style: ${extras.bjcpStyleName} (${extras.parametersInRange}/5 parameters in range)`);
  lines.push('');

  lines.push('Grain Bill:');
  if (state.grainBill.length === 0) {
    lines.push('  (none entered)');
  } else {
    state.grainBill.forEach((row) => {
      lines.push(`  - ${row.name || 'Unnamed grain'}: ${row.weightKg} kg @ ${row.colorLovibond} L`);
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

  lines.push("Made with Indian Brewer's Calculator (ankurnapa.github.io/indian-brewing-calculator)");

  return lines.join('\n');
}
