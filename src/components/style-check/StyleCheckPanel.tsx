'use client';

import { useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateSrm } from '@/lib/srm';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { calculateIbu, HopAddition } from '@/lib/ibu';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { checkStyleCompliance, ParameterCompliance } from '@/lib/styleCompliance';
import { NumberField } from '@/components/ui/NumberField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { roundForDisplay } from '@/lib/units';

interface StyleCheckPanelProps {
  grainBill: GrainBillItem[];
  batchVolumeL: number;
}

function ParameterRow({ label, unit, compliance }: { label: string; unit: string; compliance: ParameterCompliance }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border p-2 text-sm ${
        compliance.inRange ? 'border-teal-300 bg-teal-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <span className="font-medium text-ink">{label}</span>
      <span className={compliance.inRange ? 'text-teal-800' : 'text-red-700'}>
        {roundForDisplay(compliance.value, 3)} {unit}
        <span className="ml-2 text-xs text-ink/60">
          (target {compliance.range.min}-{compliance.range.max})
        </span>
      </span>
    </div>
  );
}

export function StyleCheckPanel({ grainBill, batchVolumeL }: StyleCheckPanelProps) {
  const [styleId, setStyleId] = useState(BJCP_STYLES[0].id);
  const [og, setOg] = useState(1.06);
  const [fg, setFg] = useState(1.012);
  const [wortGravity, setWortGravity] = useState(1.06);
  const [hopAdditions, setHopAdditions] = useState<HopAddition[]>([
    { name: 'Bittering Hop', alphaAcidPercent: 12, weightG: 25, boilTimeMinutes: 60 },
  ]);

  const style = BJCP_STYLES.find((s) => s.id === styleId) ?? BJCP_STYLES[0];

  const srm = useMemo(() => calculateSrm(grainBill, batchVolumeL), [grainBill, batchVolumeL]);
  const abvPercent = calculateAbvAdvanced(og, fg);
  const ibuResult = calculateIbu(hopAdditions, wortGravity, batchVolumeL);

  const compliance = checkStyleCompliance(
    { og, fg, ibu: ibuResult.totalIbu, srm, abvPercent },
    style,
  );

  const updateHopRow = (index: number, patch: Partial<HopAddition>) => {
    setHopAdditions(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">BJCP Style Check</h2>
      <p className="font-body text-sm text-amber-800">
        Compare your recipe&apos;s OG, FG, IBU, color (SRM), and ABV against common BJCP-style numeric ranges.
        Reference numeric ranges only -- consult the official BJCP Style Guidelines (bjcp.org) for full style
        descriptions and the complete category list.
      </p>

      <label className="flex flex-col gap-1">
        <span className="font-body text-sm font-medium text-amber-900">Target Style</span>
        <select
          className="min-h-[44px] rounded-md border-2 border-amber-200 bg-parchment px-3 py-2 text-base text-ink"
          value={styleId}
          onChange={(e) => setStyleId(e.target.value)}
        >
          {BJCP_STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-amber-700/80">{style.description}</span>
      </label>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">Gravity & ABV</h3>
        <p className="mt-1 font-body text-xs text-ink/70">Batch volume ({batchVolumeL} L) comes from Mash Adjustment.</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Original Gravity (SG)" value={og} step={0.001} onChange={setOg} />
          <NumberField label="Final Gravity (SG)" value={fg} step={0.001} onChange={setFg} />
        </div>
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">Hops (for IBU)</h3>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Wort Gravity (SG)" value={wortGravity} step={0.001} onChange={setWortGravity} />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {hopAdditions.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Input label="Hop" value={row.name} onChange={(value) => updateHopRow(index, { name: value })} />
              <NumberField
                label="Alpha Acid"
                unit="%"
                value={row.alphaAcidPercent}
                step={0.1}
                onChange={(value) => updateHopRow(index, { alphaAcidPercent: value })}
              />
              <NumberField
                label="Weight"
                unit="g"
                value={row.weightG}
                step={1}
                onChange={(value) => updateHopRow(index, { weightG: value })}
              />
              <NumberField
                label="Boil Time"
                unit="min"
                value={row.boilTimeMinutes}
                step={1}
                onChange={(value) => updateHopRow(index, { boilTimeMinutes: value })}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setHopAdditions([...hopAdditions, { name: '', alphaAcidPercent: 0, weightG: 0, boilTimeMinutes: 0 }])
            }
            className="min-h-[44px] self-start rounded-md bg-teal-700 px-4 py-2 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800"
          >
            + Add Hop
          </button>
        </div>
      </div>

      <ResultCard
        title="Style Match"
        value={`${compliance.parametersInRange}/5`}
        tone={compliance.fullyCompliant ? 'success' : compliance.parametersInRange >= 3 ? 'default' : 'warning'}
      >
        Grain-bill color (SRM): {roundForDisplay(srm, 1)}. Total IBU: {roundForDisplay(ibuResult.totalIbu, 1)}.
      </ResultCard>

      <div className="flex flex-col gap-2">
        <ParameterRow label="Original Gravity" unit="SG" compliance={compliance.og} />
        <ParameterRow label="Final Gravity" unit="SG" compliance={compliance.fg} />
        <ParameterRow label="IBU" unit="" compliance={compliance.ibu} />
        <ParameterRow label="Color (SRM)" unit="" compliance={compliance.srm} />
        <ParameterRow label="ABV" unit="%" compliance={compliance.abvPercent} />
      </div>
    </section>
  );
}
