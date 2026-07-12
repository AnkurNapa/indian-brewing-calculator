'use client';

import { GrainBillItem, MaltCategory, classifyMaltCategory } from '@/lib/waterChemistry';
import { WEYERMANN_MALTS } from '@/lib/weyermannMalts';
import { Input } from '@/components/ui/Input';
import { NumberField } from '@/components/ui/NumberField';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface GrainBillEditorProps {
  grainBill: GrainBillItem[];
  onChange: (grainBill: GrainBillItem[]) => void;
}

function emptyRow(): GrainBillItem {
  return { name: '', weightKg: 0, colorLovibond: 2 };
}

const MALT_CATEGORY_OPTIONS: { id: MaltCategory | ''; label: string }[] = [
  { id: '', label: 'Auto (by color)' },
  { id: 'base', label: 'Base' },
  { id: 'wheatOrOther', label: 'Wheat / Other Base' },
  { id: 'crystal', label: 'Crystal / Caramel' },
  { id: 'roasted', label: 'Roasted / Dark' },
  { id: 'acidulated', label: 'Acidulated' },
];

export function GrainBillEditor({ grainBill, onChange }: GrainBillEditorProps) {
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Grain Bill</h2>
        <button
          type="button"
          onClick={addRow}
          className="min-h-[44px] rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 active:bg-teal-900"
        >
          + Add Grain
        </button>
      </div>

      {grainBill.length === 0 ? (
        <p className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-center font-body text-sm text-amber-800">
          No grains added yet. Add at least one grain to get a mash pH prediction.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {grainBill.map((row, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-lg border-2 border-amber-200 bg-amber-50/40 p-3"
          >
            <SearchableSelect
              label="Quick-fill from Weyermann malts (optional)"
              placeholder="Search Weyermann malts..."
              value={WEYERMANN_MALTS.find((m) => m.name === row.name)?.id ?? ''}
              options={WEYERMANN_MALTS.map((malt) => ({ id: malt.id, label: malt.name }))}
              onChange={(id) => {
                const malt = WEYERMANN_MALTS.find((m) => m.id === id);
                if (malt) {
                  updateRow(index, {
                    name: malt.name,
                    colorLovibond: malt.colorLovibond,
                    category: malt.category,
                  });
                }
              }}
            />
            <p className="-mt-1.5 font-body text-xs text-ink/50">
              Not in the list? Just type any grain name, weight, and color directly below.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_1.4fr_auto] sm:items-end">
            <Input
              label="Grain name"
              value={row.name}
              onChange={(value) => updateRow(index, { name: value })}
              placeholder="e.g. Pilsner Malt"
            />
            <NumberField
              label="Weight"
              unit="kg"
              value={row.weightKg}
              step={0.1}
              onChange={(value) => updateRow(index, { weightKg: value })}
            />
            <NumberField
              label="Color"
              unit="°L"
              value={row.colorLovibond}
              step={0.5}
              onChange={(value) => updateRow(index, { colorLovibond: value })}
            />
            <SearchableSelect
              label={
                !row.category ? `Malt Type (${classifyMaltCategory(row.colorLovibond)})` : 'Malt Type'
              }
              value={row.category ?? ''}
              onChange={(id) =>
                updateRow(index, { category: (id || undefined) as MaltCategory | undefined })
              }
              options={MALT_CATEGORY_OPTIONS.map((opt) => ({ id: opt.id, label: opt.label }))}
            />
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label={`Remove ${row.name || 'grain'} row`}
              className="min-h-[44px] rounded-md border-2 border-red-300 px-4 py-2 font-body text-sm font-semibold text-red-700 hover:bg-red-50 active:bg-red-100"
            >
              Remove
            </button>
            </div>
          </div>
        ))}
      </div>

      <p className="font-body text-sm text-amber-800">
        Total grist weight: <span className="font-semibold">{totalWeightKg.toFixed(2)} kg</span>
      </p>
    </section>
  );
}
