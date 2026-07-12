'use client';

import { useEffect, useMemo, useState } from 'react';
import { GrainBillItem } from '@/lib/waterChemistry';
import { calculateSrm } from '@/lib/srm';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { calculateIbu, HopAddition, IbuFormula, GaretzExtras } from '@/lib/ibu';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { checkStyleCompliance, ParameterCompliance } from '@/lib/styleCompliance';
import { NumberField } from '@/components/ui/NumberField';
import { GravityField } from '@/components/ui/GravityField';
import { Input } from '@/components/ui/Input';
import { ResultCard } from '@/components/ui/ResultCard';
import { TutorialCallout } from '@/components/ui/TutorialCallout';
import { IbuFormulaSelector } from '@/components/ui/IbuFormulaSelector';
import { roundForDisplay } from '@/lib/units';

interface StyleCheckPanelProps {
  grainBill: GrainBillItem[];
  batchVolumeL: number;
  og: number;
  onOgChange: (value: number) => void;
  fg: number;
  onFgChange: (value: number) => void;
  bjcpStyleId: string;
  onBjcpStyleChange: (id: string) => void;
  wortGravitySg: number;
  onWortGravityChange: (value: number) => void;
  hopAdditions: HopAddition[];
  onHopAdditionsChange: (hops: HopAddition[]) => void;
  ibuFormula: IbuFormula;
  onIbuFormulaChange: (formula: IbuFormula) => void;
  garetzExtras: GaretzExtras;
  onGaretzExtrasChange: (extras: GaretzExtras) => void;
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

export function StyleCheckPanel({
  grainBill,
  batchVolumeL,
  og,
  onOgChange,
  fg,
  onFgChange,
  bjcpStyleId,
  onBjcpStyleChange,
  wortGravitySg,
  onWortGravityChange,
  hopAdditions,
  onHopAdditionsChange,
  ibuFormula,
  onIbuFormulaChange,
  garetzExtras,
  onGaretzExtrasChange,
}: StyleCheckPanelProps) {
  const [styleSearch, setStyleSearch] = useState('');
  // Briefly pulses the "Selected" confirmation so picking a style from the
  // scrollable list gives the same unmistakable "yes, that registered"
  // feedback as the SearchableSelect dropdowns elsewhere in the app.
  const [justSelected, setJustSelected] = useState(false);

  useEffect(() => {
    if (!justSelected) return;
    const timer = setTimeout(() => setJustSelected(false), 900);
    return () => clearTimeout(timer);
  }, [justSelected]);

  const style = BJCP_STYLES.find((s) => s.id === bjcpStyleId) ?? BJCP_STYLES[0];

  const filteredStyles = useMemo(() => {
    const query = styleSearch.trim().toLowerCase();
    if (!query) return BJCP_STYLES;
    return BJCP_STYLES.filter(
      (s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query),
    );
  }, [styleSearch]);

  const srm = useMemo(() => calculateSrm(grainBill, batchVolumeL), [grainBill, batchVolumeL]);
  const abvPercent = calculateAbvAdvanced(og, fg);
  const ibuResult = calculateIbu(hopAdditions, wortGravitySg, batchVolumeL, ibuFormula, garetzExtras);

  const compliance = checkStyleCompliance(
    { og, fg, ibu: ibuResult.totalIbu, srm, abvPercent },
    style,
  );

  const updateHopRow = (index: number, patch: Partial<HopAddition>) => {
    onHopAdditionsChange(hopAdditions.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">BJCP Style Check</h2>
      <p className="font-body text-sm text-amber-800">
        Compare your recipe&apos;s OG, FG, IBU, color (SRM), and ABV against common BJCP-style numeric ranges.
        Reference numeric ranges only -- consult the official BJCP Style Guidelines (bjcp.org) for full style
        descriptions and the complete category list.
      </p>

      <TutorialCallout
        title="How to use BJCP Style Check"
        steps={[
          {
            lead: '1. Search and pick a target style.',
            body: 'The selected style flashes teal briefly to confirm the pick, and stays visible in the "Selected" line below the list.',
          },
          {
            lead: '2. OG/FG and hops are shared, not separate.',
            body: 'Gravity and hop schedule here are the same values used in Brewhouse Calculators and shown on Home -- edit them on any of those screens and they stay in sync.',
          },
          {
            lead: '3. Read the Style Match score.',
            body: 'Green/5-of-5 means every parameter (OG, FG, IBU, SRM, ABV) falls inside the style\'s published range; red rows below show exactly how far outside range you are and in which direction.',
          },
        ]}
      />

      <div className="flex flex-col gap-1">
        <Input
          label="Target Style"
          value={styleSearch}
          onChange={setStyleSearch}
          placeholder={`Search ${BJCP_STYLES.length} styles by name or category (e.g. "IPA", "sour", "lager")...`}
        />
        <div className="mt-1 max-h-52 overflow-y-auto rounded-md border-2 border-amber-200 bg-parchment">
          {filteredStyles.length === 0 ? (
            <p className="p-3 text-sm text-amber-800">No styles match &quot;{styleSearch}&quot;.</p>
          ) : (
            filteredStyles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onBjcpStyleChange(s.id);
                  setJustSelected(true);
                }}
                className={`flex min-h-[44px] w-full items-start justify-between gap-2 border-b border-amber-100 px-3 py-1.5 text-left last:border-b-0 ${
                  s.id === bjcpStyleId ? 'bg-teal-700 text-parchment' : 'hover:bg-amber-100'
                }`}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{s.name}</span>
                  <span className={`text-xs ${s.id === bjcpStyleId ? 'text-parchment/80' : 'text-amber-700/80'}`}>
                    {s.category}
                  </span>
                </span>
                {s.id === bjcpStyleId ? (
                  <span aria-hidden="true" className="flex-shrink-0 pt-0.5">
                    ✓
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
        <div
          className={`flex items-center gap-2 rounded-md border-2 px-3 py-2 text-xs transition-colors duration-300 ${
            justSelected ? 'border-teal-500 bg-teal-50 text-teal-900' : 'border-amber-200 bg-amber-50/60 text-amber-700/80'
          }`}
        >
          {justSelected ? (
            <span aria-hidden="true" className="text-teal-700">
              ✓
            </span>
          ) : null}
          <span>
            Selected: <span className="font-semibold">{style.name}</span> -- {style.description}
          </span>
        </div>
      </div>

      <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">Gravity & ABV</h3>
        <p className="mt-1 font-body text-xs text-ink/70">
          Batch volume ({batchVolumeL} L) comes from Mash Adjustment; OG/FG are shared with Brewhouse Calculators.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GravityField label="Original Gravity" value={og} onChange={onOgChange} />
          <GravityField label="Final Gravity" value={fg} onChange={onFgChange} />
        </div>
      </div>

      <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-amber-900">Hops (for IBU)</h3>
        <div className="mt-3">
          <IbuFormulaSelector
            formula={ibuFormula}
            onFormulaChange={onIbuFormulaChange}
            garetzExtras={garetzExtras}
            onGaretzExtrasChange={onGaretzExtrasChange}
          />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField label="Wort Gravity (SG)" value={wortGravitySg} step={0.001} onChange={onWortGravityChange} />
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {hopAdditions.map((row, index) => (
            <div key={index} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <Input
                label="Hop"
                value={row.name}
                onChange={(value) => updateHopRow(index, { name: value })}
                placeholder="Type any hop name..."
              />
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
              onHopAdditionsChange([...hopAdditions, { name: '', alphaAcidPercent: 0, weightG: 0, boilTimeMinutes: 0 }])
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
