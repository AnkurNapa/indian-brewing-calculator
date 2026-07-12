'use client';

import { useState } from 'react';
import { AppState } from '@/hooks/useWaterProfile';
import { RecipeSnapshot, createRecipeSnapshot, duplicateRecipeSnapshot } from '@/lib/recipeSnapshot';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { IBU_FORMULAS, calculateIbu } from '@/lib/ibu';
import { calculateSrm } from '@/lib/srm';
import { checkStyleCompliance } from '@/lib/styleCompliance';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { roundForDisplay } from '@/lib/units';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { BookmarkIcon } from '@/components/ui/icons';
import { buildBeerXml } from '@/lib/beerXml';
import { buildRecipePrintHtml } from '@/lib/recipePrintView';
import { downloadTextFile } from '@/lib/dataExport';

function sanitizeFilename(name: string): string {
  return name.trim().replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-').toLowerCase() || 'recipe';
}

function exportBeerXml(snapshot: RecipeSnapshot) {
  downloadTextFile(`${sanitizeFilename(snapshot.name)}.xml`, buildBeerXml(snapshot.state, snapshot.name), 'application/xml');
}

function exportPdf(snapshot: RecipeSnapshot) {
  if (typeof window === 'undefined') return;
  const html = buildRecipePrintHtml(snapshot.name, snapshot.state, snapshot.lockedAtMs);
  // Blob URL instead of document.write() into a blank window -- avoids
  // the XSS/perf pitfalls of document.write while still opening a
  // normal printable page the browser's Print -> Save as PDF can use.
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Revoke well after the new tab has had time to load the blob (it's
  // fetched once on open); an immediate revoke can race the load.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

interface RecipeSnapshotsPanelProps {
  currentState: AppState;
  snapshots: RecipeSnapshot[];
  onAddSnapshot: (snapshot: RecipeSnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
  onLoadSnapshot: (state: AppState) => void;
}

function formatLockedDate(ms: number): string {
  return new Date(ms).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function snapshotStats(state: AppState) {
  const targetStyleName = TARGET_STYLE_PROFILES.find((s) => s.id === state.targetStyleId)?.name ?? '--';
  const bjcpStyle = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId) ?? BJCP_STYLES[0];
  const formulaLabel = IBU_FORMULAS.find((f) => f.id === state.ibuFormula)?.label ?? 'Tinseth';
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : null;
  const ibuResult = calculateIbu(state.hopAdditions, state.wortGravitySg, state.batchVolumeL, state.ibuFormula, state.garetzExtras);
  const abvPercent = calculateAbvAdvanced(state.ogSg, state.fgSg);
  const compliance = checkStyleCompliance(
    { og: state.ogSg, fg: state.fgSg, ibu: ibuResult.totalIbu, srm: srm ?? 0, abvPercent },
    bjcpStyle,
  );
  return { targetStyleName, bjcpStyle, formulaLabel, srm, ibuResult, abvPercent, compliance };
}

function SnapshotCard({
  snapshot,
  onDuplicate,
  onDelete,
  onLoad,
}: {
  snapshot: RecipeSnapshot;
  onDuplicate: () => void;
  onDelete: () => void;
  onLoad: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const stats = snapshotStats(snapshot.state);

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <BookmarkIcon className="h-4 w-4 flex-shrink-0 text-teal-700" />
          <span className="font-display text-sm font-bold text-teal-900">{snapshot.name}</span>
        </span>
        <span aria-hidden="true" className="text-teal-700">
          {isOpen ? '▾' : '▸'}
        </span>
      </button>
      <div className="px-4 pb-1 font-body text-xs text-teal-800/70">
        Locked {formatLockedDate(snapshot.lockedAtMs)} -- {stats.bjcpStyle.name} ({stats.formulaLabel})
      </div>

      {isOpen ? (
        <div className="flex flex-col gap-2 border-t border-teal-200 px-4 py-3 font-body text-sm text-ink">
          <p>Target Water Style: {stats.targetStyleName}</p>
          <p>Batch Volume: {snapshot.state.batchVolumeL} L</p>
          <p>
            OG: {roundForDisplay(snapshot.state.ogSg, 3)} &middot; FG: {roundForDisplay(snapshot.state.fgSg, 3)}{' '}
            &middot; ABV: {roundForDisplay(stats.abvPercent, 2)}%
          </p>
          <p>
            IBU: {roundForDisplay(stats.ibuResult.totalIbu, 1)} ({stats.formulaLabel}) &middot; Color:{' '}
            {stats.srm !== null ? `${roundForDisplay(stats.srm, 1)} SRM` : 'n/a'}
          </p>
          <p>
            BJCP Match: {stats.compliance.parametersInRange}/5 parameters vs. {stats.bjcpStyle.name}
          </p>
          <div>
            <p className="font-semibold">Grain Bill:</p>
            {snapshot.state.grainBill.length === 0 ? (
              <p className="text-ink/60">(none)</p>
            ) : (
              <ul className="flex flex-col gap-0.5 text-ink/80">
                {snapshot.state.grainBill.map((row, i) => (
                  <li key={i}>
                    {row.name || 'Unnamed grain'} -- {row.weightKg} kg @ {row.colorLovibond}°L
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="font-semibold">Hop Schedule:</p>
            {snapshot.state.hopAdditions.length === 0 ? (
              <p className="text-ink/60">(none)</p>
            ) : (
              <ul className="flex flex-col gap-0.5 text-ink/80">
                {snapshot.state.hopAdditions.map((hop, i) => (
                  <li key={i}>
                    {hop.name || 'Unnamed hop'} -- {hop.weightG} g @ {hop.alphaAcidPercent}% AA, {hop.boilTimeMinutes} min
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onLoad}
              className="min-h-[40px] flex-1 rounded-md bg-teal-700 px-3 py-2 font-body text-xs font-semibold text-parchment shadow hover:bg-teal-800"
            >
              Load Into Session
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="min-h-[40px] flex-1 rounded-md border border-teal-300 bg-white px-3 py-2 font-body text-xs font-semibold text-teal-800 hover:bg-teal-50"
            >
              Duplicate
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[40px] flex-1 rounded-md border-2 border-red-300 px-3 py-2 font-body text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportPdf(snapshot)}
              className="min-h-[40px] flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 font-body text-xs font-semibold text-amber-800 hover:bg-amber-50"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => exportBeerXml(snapshot)}
              className="min-h-[40px] flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 font-body text-xs font-semibold text-amber-800 hover:bg-amber-50"
            >
              Export BeerXML
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Named, locked snapshots of the full recipe (water, grain, hops, IBU
 * formula, targets -- everything in AppState) so a brewer can save a
 * finished recipe, keep iterating on the live session for the next
 * batch, and come back to reload, duplicate, or compare an earlier one
 * later. Locking never touches the live session; loading is an
 * explicit, confirmed action since it overwrites current unsaved edits.
 */
export function RecipeSnapshotsPanel({
  currentState,
  snapshots,
  onAddSnapshot,
  onDeleteSnapshot,
  onLoadSnapshot,
}: RecipeSnapshotsPanelProps) {
  const [newName, setNewName] = useState('');

  const handleLock = () => {
    const name = newName.trim() || `Recipe ${new Date().toLocaleDateString()}`;
    onAddSnapshot(createRecipeSnapshot(name, currentState, Date.now()));
    setNewName('');
  };

  const handleDuplicate = (snapshot: RecipeSnapshot) => {
    const suggested = `${snapshot.name} (copy)`;
    const name = typeof window !== 'undefined' ? window.prompt('Name for the duplicated recipe:', suggested) : suggested;
    if (name === null) return;
    onAddSnapshot(duplicateRecipeSnapshot(snapshot, name, Date.now()));
  };

  const handleDelete = (snapshot: RecipeSnapshot) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete "${snapshot.name}"? This cannot be undone.`)) return;
    onDeleteSnapshot(snapshot.id);
  };

  const handleLoad = (snapshot: RecipeSnapshot) => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Load "${snapshot.name}" into the current session? This replaces your current unsaved entries.`)
    ) {
      return;
    }
    onLoadSnapshot(snapshot.state);
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">Recipes</h2>
      <p className="font-body text-sm text-amber-800">
        Lock the current session as a named recipe snapshot, reload/duplicate a recipe you locked earlier, or export
        it as a PDF or BeerXML file.
      </p>

      <TutorialCallout
        title="How to use Recipes"
        steps={[
          {
            lead: '1. Lock the current recipe.',
            body: 'Give it a name (or leave blank for a dated default) and tap Lock Recipe -- this saves everything: water, grain bill, hops, IBU formula, and all targets, as a frozen snapshot.',
          },
          {
            lead: '2. Keep iterating on the live session.',
            body: 'Locking a snapshot never changes anything you\'re currently editing -- it\'s a copy, not a save-and-clear.',
          },
          {
            lead: '3. Reload, duplicate, or delete anytime.',
            body: 'Load replaces the live session with that snapshot (with a confirmation, since it overwrites current unsaved edits); Duplicate makes an independent copy to branch a variation from.',
          },
          {
            lead: '4. Export PDF or BeerXML.',
            body: 'Export PDF opens a clean printable recipe sheet -- use your browser\'s Print -> Save as PDF. Export BeerXML downloads a .xml file most other brewing software (BeerSmith, Brewfather, etc.) can import directly.',
          },
        ]}
      />

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">Lock Current Recipe</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`e.g. Recipe ${new Date().toLocaleDateString()}`}
            className="min-h-[44px] w-full flex-1 rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink shadow-inner outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="button"
            onClick={handleLock}
            className="flex min-h-[44px] flex-shrink-0 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
          >
            <BookmarkIcon className="h-4 w-4 flex-shrink-0" />
            Lock Recipe
          </button>
        </div>
      </div>

      {snapshots.length === 0 ? (
        <p className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center font-body text-sm text-amber-800">
          No recipes locked yet. Lock the current session above to save your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {snapshots.map((snapshot) => (
            <SnapshotCard
              key={snapshot.id}
              snapshot={snapshot}
              onDuplicate={() => handleDuplicate(snapshot)}
              onDelete={() => handleDelete(snapshot)}
              onLoad={() => handleLoad(snapshot)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
