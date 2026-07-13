'use client';

import { IBU_FORMULAS, IbuFormula, GaretzExtras } from '@/lib/ibu';
import { NumberField } from './NumberField';
import { useLanguage } from '@/i18n/LanguageContext';

interface IbuFormulaSelectorProps {
  formula: IbuFormula;
  onFormulaChange: (formula: IbuFormula) => void;
  garetzExtras: GaretzExtras;
  onGaretzExtrasChange: (extras: GaretzExtras) => void;
}

/**
 * Segmented Tinseth/Rager/Garetz pill selector, shared by every screen
 * that computes IBU (Brewhouse Calculators, BJCP Style Check, Home) so
 * the formula choice -- stored once on the shared recipe state, not
 * per-screen -- stays visually and behaviorally identical everywhere
 * it's shown. Picking Garetz reveals its extra inputs inline; switching
 * away hides them again without discarding the values.
 */
export function IbuFormulaSelector({
  formula,
  onFormulaChange,
  garetzExtras,
  onGaretzExtrasChange,
}: IbuFormulaSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-body text-sm font-medium text-amber-900">{t('sharedCalc.ibuFormula.label')}</span>
        <div className="flex flex-shrink-0 gap-0.5 rounded-full border border-amber-200 bg-amber-50 p-0.5">
          {IBU_FORMULAS.map((f) => (
            <button
              key={f.id}
              type="button"
              title={f.description}
              onClick={() => onFormulaChange(f.id)}
              className={`min-h-[28px] rounded-full px-2.5 font-body text-[0.7rem] font-semibold transition-colors ${
                formula === f.id ? 'bg-teal-700 text-parchment' : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <p className="font-body text-xs text-ink/60">{IBU_FORMULAS.find((f) => f.id === formula)?.description}</p>

      {formula === 'garetz' ? (
        <div className="grid grid-cols-1 gap-3 rounded-md border border-amber-200 bg-amber-50/60 p-3 sm:grid-cols-3">
          <NumberField
            label={t('sharedCalc.ibuFormula.altitude')}
            unit="m"
            value={garetzExtras.altitudeM}
            step={50}
            onChange={(altitudeM) => onGaretzExtrasChange({ ...garetzExtras, altitudeM })}
            helperText={t('sharedCalc.ibuFormula.altitudeHelper')}
          />
          <NumberField
            label={t('sharedCalc.ibuFormula.hopAgeFactor')}
            value={garetzExtras.hopAgeFactor}
            step={0.05}
            max={1}
            onChange={(hopAgeFactor) => onGaretzExtrasChange({ ...garetzExtras, hopAgeFactor })}
            helperText={t('sharedCalc.ibuFormula.hopAgeFactorHelper')}
          />
          <NumberField
            label={t('sharedCalc.ibuFormula.boilVolume')}
            unit="L"
            value={garetzExtras.boilVolumeL}
            step={1}
            onChange={(boilVolumeL) => onGaretzExtrasChange({ ...garetzExtras, boilVolumeL })}
            helperText={t('sharedCalc.ibuFormula.boilVolumeHelper')}
          />
        </div>
      ) : null}
    </div>
  );
}
