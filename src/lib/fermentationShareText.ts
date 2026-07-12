import { FermentationBatch, calculateFermentationStats, sortEntriesByTime } from './fermentationTracker';
import { roundForDisplay } from './units';

/**
 * Plain-text log of a single fermentation batch's readings, for the Web
 * Share API / clipboard fallback -- separate from the full-recipe share
 * on Home, since a brewer checking in on an active fermentation usually
 * wants just this batch's gravity/temp log, not the entire recipe.
 */
export function buildFermentationShareText(batch: FermentationBatch): string {
  const stats = calculateFermentationStats(batch.entries);
  const entriesOldestFirst = sortEntriesByTime(batch.entries);

  const lines: string[] = [];
  lines.push(`Fermentation Log: ${batch.name}`);
  lines.push('');

  lines.push(`Original Gravity: ${stats.originalGravity !== null ? roundForDisplay(stats.originalGravity, 3) : '--'}`);
  lines.push(`Current Gravity: ${stats.currentGravity !== null ? roundForDisplay(stats.currentGravity, 3) : '--'}`);
  lines.push(`ABV So Far: ${stats.abvSoFar !== null ? `${roundForDisplay(stats.abvSoFar, 2)}%` : '--'}`);
  lines.push(
    `Apparent Attenuation: ${stats.apparentAttenuationPercent !== null ? `${roundForDisplay(stats.apparentAttenuationPercent, 1)}%` : '--'}${stats.likelyComplete ? ' (likely finished)' : ''}`,
  );
  lines.push('');

  lines.push('Readings:');
  if (entriesOldestFirst.length === 0) {
    lines.push('  (none logged)');
  } else {
    entriesOldestFirst.forEach((entry) => {
      const when = new Date(entry.timestampMs).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
      const note = entry.note ? ` -- ${entry.note}` : '';
      lines.push(`  - ${when}: ${roundForDisplay(entry.gravitySg, 3)} SG @ ${entry.temperatureC}°C${note}`);
    });
  }
  lines.push('');

  lines.push("Made with Indian Brewer's Calculator (ankurnapa.github.io/indian-brewing-calculator)");

  return lines.join('\n');
}
