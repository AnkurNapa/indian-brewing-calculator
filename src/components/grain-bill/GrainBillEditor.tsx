'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem, MaltCategory, classifyMaltCategory } from '@/lib/waterChemistry';
import { WEYERMANN_MALTS } from '@/lib/weyermannMalts';
import { buildAromaForgeLink } from '@/lib/aromaForge';
import { INDIAN_GRAINS } from '@/lib/indianIngredients';
import { useCatalog, MaltOption } from '@/hooks/useCatalog';
import { solveGrainWeightsByPercent } from '@/lib/efficiency';
import { Input } from '@/components/ui/Input';
import { NumberField } from '@/components/ui/NumberField';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { GravityField } from '@/components/ui/GravityField';
import { roundForDisplay } from '@/lib/units';
import { useLanguage } from '@/i18n/LanguageContext';

/** Weyermann malts plus the local Indian grains, for the grain-bill quick-fill picker. */
const GRAIN_PRESETS = [...WEYERMANN_MALTS, ...INDIAN_GRAINS];

interface GrainBillEditorProps {
  grainBill: GrainBillItem[];
  onChange: (grainBill: GrainBillItem[]) => void;
  batchVolumeL: number;
  targetOgSg: number;
  onTargetOgChange: (value: number) => void;
  assumedEfficiencyPercent: number;
  onAssumedEfficiencyChange: (value: number) => void;
}

function emptyRow(): GrainBillItem {
  return { name: '', weightKg: 0, colorLovibond: 2 };
}

const MALT_CATEGORY_OPTION_KEYS = [
  { id: '' as const, labelKey: 'mashAdjustment.maltCategory.auto' as const },
  { id: 'base' as const, labelKey: 'mashAdjustment.maltCategory.base' as const },
  { id: 'wheatOrOther' as const, labelKey: 'mashAdjustment.maltCategory.wheatOrOther' as const },
  { id: 'crystal' as const, labelKey: 'mashAdjustment.maltCategory.crystal' as const },
  { id: 'roasted' as const, labelKey: 'mashAdjustment.maltCategory.roasted' as const },
  { id: 'acidulated' as const, labelKey: 'mashAdjustment.maltCategory.acidulated' as const },
];

type BillMode = 'weight' | 'percent';

export function GrainBillEditor({
  grainBill,
  onChange,
  batchVolumeL,
  targetOgSg,
  onTargetOgChange,
  assumedEfficiencyPercent,
  onAssumedEfficiencyChange,
}: GrainBillEditorProps) {
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<BillMode>('weight');
  const maltCategoryOptions = MALT_CATEGORY_OPTION_KEYS.map((opt) => ({ id: opt.id, label: t(opt.labelKey) }));

  // Curated presets + the lazy-loaded supplier malt catalogue (288 malts).
  const catalogMalts = useCatalog<MaltOption>('malts');
  const allMalts = useMemo(() => {
    const seen = new Set(GRAIN_PRESETS.map((p) => p.name.toLowerCase()));
    const fromCatalog = catalogMalts
      .filter((m) => !seen.has(m.name.toLowerCase()))
      .map((m, i) => ({
        id: `cat-malt-${i}`,
        name: m.name,
        label: `${m.name} (${m.supplier})`,
        colorLovibond: m.colorLovibond,
        potentialSg: m.potentialSg,
        category: classifyMaltCategory(m.colorLovibond),
      }));
    const presets = GRAIN_PRESETS.map((p) => ({
      id: p.id,
      name: p.name,
      label: p.name,
      colorLovibond: p.colorLovibond,
      potentialSg: p.potentialSg,
      category: p.category,
    }));
    return [...presets, ...fromCatalog];
  }, [catalogMalts]);

  const updateRow = (index: number, patch: Partial<GrainBillItem>) => {
    const next = grainBill.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(grainBill.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...grainBill, emptyRow()]);
  };

  const totalWeightKg = grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? row.weightKg : 0), 0);
  const percentSum = grainBill.reduce((sum, row) => sum + (Number.isFinite(row.percentOfBill) ? (row.percentOfBill as number) : 0), 0);
  const percentIsBalanced = Math.abs(percentSum - 100) < 0.1;

  /** Recompute every row's weightKg from its (possibly un-normalized) percentOfBill, target OG, batch volume, and efficiency. */
  const resolveWeightsFromPercent = (rows: GrainBillItem[]): GrainBillItem[] => {
    const weights = solveGrainWeightsByPercent(
      rows.map((row) => ({ percentOfBill: row.percentOfBill ?? 0, potentialSg: row.potentialSg ?? 0 })),
      targetOgSg,
      batchVolumeL,
      assumedEfficiencyPercent,
    );
    return rows.map((row, i) => ({ ...row, weightKg: roundForDisplay(weights[i], 3) }));
  };

  const updatePercentRow = (index: number, percentOfBill: number) => {
    const next = grainBill.map((row, i) => (i === index ? { ...row, percentOfBill } : row));
    onChange(resolveWeightsFromPercent(next));
  };

  const normalizeToHundred = () => {
    if (percentSum <= 0) return;
    const next = grainBill.map((row) => ({
      ...row,
      percentOfBill: roundForDisplay(((row.percentOfBill ?? 0) / percentSum) * 100, 1),
    }));
    onChange(resolveWeightsFromPercent(next));
  };

  const handleModeChange = (next: BillMode) => {
    setMode(next);
    if (next === 'percent') {
      // Re-solve immediately so switching into percent mode shows real
      // computed weights right away instead of stale by-weight values.
      onChange(resolveWeightsFromPercent(grainBill));
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">{t('mashAdjustment.grainBill.heading')}</h2>
        <button
          type="button"
          onClick={addRow}
          className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 active:bg-teal-900"
        >
          {t('mashAdjustment.grainBill.addGrain')}
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-amber-200 bg-amber-50/40 p-3">
        <span className="font-body text-sm font-medium text-amber-900">{t('mashAdjustment.grainBill.enterBy')}</span>
        <div className="flex flex-shrink-0 gap-0.5 rounded-full border border-amber-200 bg-white p-0.5">
          {(
            [
              { id: 'weight', label: t('mashAdjustment.grainBill.modeWeight') },
              { id: 'percent', label: t('mashAdjustment.grainBill.modePercent') },
            ] as { id: BillMode; label: string }[]
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleModeChange(opt.id)}
              className={`min-h-[32px] rounded-full px-3 font-body text-xs font-semibold transition-colors ${
                mode === opt.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'percent' ? (
        <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-3">
          <p className="font-body text-xs text-ink/70">
            {t('mashAdjustment.grainBill.percentModeHelper', { batchVolume: batchVolumeL })}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <GravityField label={t('mashAdjustment.targetOg.label')} value={targetOgSg} onChange={onTargetOgChange} />
            <NumberField
              label={t('mashAdjustment.assumedEfficiency.label')}
              unit="%"
              value={assumedEfficiencyPercent}
              step={1}
              max={100}
              onChange={onAssumedEfficiencyChange}
            />
          </div>
          <div
            className={`mt-3 flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm ${
              percentIsBalanced ? 'border-teal-300 bg-teal-50 text-teal-800' : 'border-amber-400 bg-amber-50 text-amber-800'
            }`}
          >
            <span>
              {t('mashAdjustment.percentTotal.label', {
                status: percentIsBalanced ? '✓' : '⚠',
                percent: roundForDisplay(percentSum, 1),
                balanceNote: percentIsBalanced
                  ? t('mashAdjustment.percentTotal.balanced')
                  : t('mashAdjustment.percentTotal.shouldSum'),
              })}
            </span>
            {!percentIsBalanced && percentSum > 0 ? (
              <button
                type="button"
                onClick={normalizeToHundred}
                className="min-h-[32px] flex-shrink-0 rounded-full border border-amber-400 bg-white px-3 font-body text-xs font-semibold text-amber-800 hover:bg-amber-100"
              >
                {t('mashAdjustment.normalizeTo100')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {grainBill.length === 0 ? (
        <p className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center font-body text-sm text-amber-800">
          {t('mashAdjustment.grainBill.empty')}
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {grainBill.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border-2 border-amber-200 bg-amber-50/40 p-3"
          >
            <SearchableSelect
              label={t('mashAdjustment.grainBill.quickFillLabel')}
              placeholder={t('mashAdjustment.grainBill.quickFillPlaceholder')}
              value={allMalts.find((m) => m.name === row.name)?.id ?? ''}
              options={allMalts.map((malt) => ({ id: malt.id, label: malt.label }))}
              onChange={(id) => {
                const malt = allMalts.find((m) => m.id === id);
                if (malt) {
                  updateRow(index, {
                    name: malt.name,
                    colorLovibond: malt.colorLovibond,
                    category: malt.category,
                    potentialSg: malt.potentialSg,
                  });
                }
              }}
            />
            <p className="-mt-1.5 font-body text-xs font-semibold text-amber-700/80">
              {t('mashAdjustment.grainBill.notInListHint')}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_1.4fr] sm:items-end">
            <Input
              label={t('mashAdjustment.grainBill.grainName.label')}
              value={row.name}
              onChange={(value) => updateRow(index, { name: value })}
              placeholder={t('mashAdjustment.grainBill.grainName.placeholder')}
            />
            {mode === 'weight' ? (
              <NumberField
                label={t('mashAdjustment.grainBill.weight.label')}
                unit="kg"
                value={row.weightKg}
                step={0.1}
                onChange={(value) => updateRow(index, { weightKg: value })}
              />
            ) : (
              <NumberField
                label={t('mashAdjustment.grainBill.percentOfBill.label')}
                unit="%"
                value={row.percentOfBill ?? 0}
                step={1}
                onChange={(value) => updatePercentRow(index, value)}
                helperText={`= ${roundForDisplay(row.weightKg, 3)} kg`}
              />
            )}
            <NumberField
              label={t('mashAdjustment.grainBill.color.label')}
              unit="°L"
              value={row.colorLovibond}
              step={0.5}
              onChange={(value) => updateRow(index, { colorLovibond: value })}
            />
            <SearchableSelect
              label={
                !row.category
                  ? t('mashAdjustment.grainBill.maltType.autoLabel', {
                      category: classifyMaltCategory(row.colorLovibond),
                    })
                  : t('mashAdjustment.grainBill.maltType.label')
              }
              value={row.category ?? ''}
              onChange={(id) =>
                updateRow(index, { category: (id || undefined) as MaltCategory | undefined })
              }
              options={maltCategoryOptions}
            />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <NumberField
              label={t('mashAdjustment.grainBill.extractPotential.label')}
              unit="SG"
              value={row.potentialSg ?? 0}
              step={0.001}
              onChange={(value) => {
                const patch: Partial<GrainBillItem> = { potentialSg: value || undefined };
                const next = grainBill.map((r, i) => (i === index ? { ...r, ...patch } : r));
                onChange(mode === 'percent' ? resolveWeightsFromPercent(next) : next);
              }}
              helperText={t('mashAdjustment.grainBill.extractPotential.helper')}
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label={t('mashAdjustment.grainBill.removeRowAria', { grainName: row.name || 'grain' })}
              className="min-h-[44px] rounded-md border-2 border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-50 active:bg-red-100"
            >
              {t('mashAdjustment.grainBill.remove')}
            </button>
            </div>
          </div>
        ))}
      </div>

      <p className="font-body text-sm text-amber-800">
        {t('mashAdjustment.grainBill.totalGristWeight')} <span className="font-semibold">{totalWeightKg.toFixed(2)} kg</span>
      </p>

      {(() => {
        const aroma = buildAromaForgeLink(grainBill, {
          volumeL: batchVolumeL,
          efficiencyPercent: assumedEfficiencyPercent,
          lang: language,
        });
        return (
          <div className="mt-4 rounded-lg border-2 border-teal-200 bg-teal-50/60 p-4">
            <h3 className="font-body text-sm font-semibold text-teal-900">
              {t('mashAdjustment.grainBill.aromaTitle')}
            </h3>
            <p className="mt-1 font-body text-xs text-teal-800/80">
              {t('mashAdjustment.grainBill.aromaHelper')}
            </p>
            {aroma.url ? (
              <>
                <a
                  href={aroma.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-[44px] items-center rounded-md bg-orange-600 px-4 py-2 font-body text-sm font-semibold text-white hover:bg-orange-700 active:bg-orange-800"
                >
                  {t('mashAdjustment.grainBill.aromaButton')}
                </a>
                <p className="mt-2 font-body text-xs text-teal-800/70">
                  {t('mashAdjustment.grainBill.aromaMapped', { mapped: String(aroma.mapped) })}
                  {aroma.skipped > 0
                    ? t('mashAdjustment.grainBill.aromaSkipped', { skipped: String(aroma.skipped) })
                    : ''}
                </p>
              </>
            ) : (
              <p className="mt-3 font-body text-xs text-teal-800/70">
                {t('mashAdjustment.grainBill.aromaNone')}
              </p>
            )}
          </div>
        );
      })()}
    </section>
  );
}
