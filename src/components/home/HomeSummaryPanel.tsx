'use client';

import { ComponentType, useState } from 'react';
import { AppState } from '@/hooks/useWaterProfile';
import { useShareText } from '@/hooks/useShareText';
import { FermentationBatch, calculateFermentationStats } from '@/lib/fermentationTracker';
import { TARGET_STYLE_PROFILES } from '@/lib/waterProfiles';
import { BJCP_STYLES } from '@/lib/bjcpStyles';
import { checkStyleCompliance, ParameterCompliance } from '@/lib/styleCompliance';
import { calculateSrm } from '@/lib/srm';
import { calculateIbu, IBU_FORMULAS } from '@/lib/ibu';
import { calculateAbvAdvanced } from '@/lib/fermentation';
import { roundForDisplay } from '@/lib/units';
import { DropletIcon, FlaskIcon, CalculatorIcon, FermenterIcon, StyleCheckIcon, ShareIcon, BookmarkIcon } from '@/components/ui/icons';
import { buildRecipeShareText } from '@/lib/recipeShareText';
import { TabDef } from '@/components/ui/Tabs';
import { predictOriginalGravity } from '@/lib/efficiency';
import { GravityDisplay, GravityUnitToggle, GravityUnit } from '@/components/ui/GravityDisplay';
import { useLanguage } from '@/i18n/LanguageContext';

interface HomeSummaryPanelProps {
  state: AppState;
  fermentationBatches: FermentationBatch[];
  onJumpToTab: (tabId: string) => void;
  /** The brew-day tab sequence (excluding Home/Backup/About), rendered as a visual process flow. */
  processSteps: TabDef[];
}

function SummarySection({
  title,
  icon: Icon,
  tabId,
  onJumpToTab,
  headerExtra,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  tabId: string;
  onJumpToTab: (tabId: string) => void;
  /** Optional control (e.g. a unit toggle) shown between the title and the Edit button. */
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-amber-900">
          <Icon className="h-4 w-4 flex-shrink-0 text-teal-700" />
          {title}
        </h3>
        <div className="flex flex-shrink-0 items-center gap-2">
          {headerExtra}
          <button
            type="button"
            onClick={() => onJumpToTab(tabId)}
            className="flex min-h-[44px] flex-shrink-0 items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 font-body text-xs font-semibold text-teal-800 hover:bg-teal-100"
          >
            {t('home.edit')}
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-col gap-1 font-body text-sm text-ink">{children}</div>
    </div>
  );
}

function deviationText(
  compliance: ParameterCompliance,
  unit: string,
  t: ReturnType<typeof useLanguage>['t'],
): string {
  if (compliance.inRange) return t('home.deviation.inRange');
  const delta = compliance.value < compliance.range.min ? compliance.range.min - compliance.value : compliance.value - compliance.range.max;
  const direction = compliance.value < compliance.range.min ? t('home.deviation.under') : t('home.deviation.over');
  return `${roundForDisplay(delta, 2)}${unit} ${t('home.deviation.rangeSuffix', { direction })}`;
}

function DeviationRow({ label, unit, compliance }: { label: string; unit: string; compliance: ParameterCompliance }) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
        compliance.inRange ? 'border-teal-300 bg-teal-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <span className="font-medium text-ink">{label}</span>
      <span className={compliance.inRange ? 'text-teal-800' : 'text-red-700'}>
        {roundForDisplay(compliance.value, 3)}
        {unit} <span className="text-xs text-ink/60">({deviationText(compliance, unit, t)})</span>
      </span>
    </div>
  );
}

/**
 * A single "come back and see everything" screen: every reading/input
 * entered anywhere in the app, recapped top-to-bottom in the same order
 * as the brew-day flow, each with a jump-back link to edit it. This is
 * the checkpoint a brewer reaches for mid-session ("what did I set the
 * batch volume to again?") or at the end of the day to review the whole
 * session at a glance, instead of re-visiting every tab one by one.
 */
export function HomeSummaryPanel({ state, fermentationBatches, onJumpToTab, processSteps }: HomeSummaryPanelProps) {
  const { t } = useLanguage();
  const { share, status: shareStatus } = useShareText('Brew Recipe Summary');
  const [gravityUnit, setGravityUnit] = useState<GravityUnit>('sg');

  const targetStyleName = TARGET_STYLE_PROFILES.find((s) => s.id === state.targetStyleId)?.name ?? '--';
  const totalGrainKg = state.grainBill.reduce((sum, row) => sum + (Number.isFinite(row.weightKg) ? row.weightKg : 0), 0);
  const srm = state.grainBill.length > 0 ? calculateSrm(state.grainBill, state.batchVolumeL) : null;
  const hasPotential = state.grainBill.some((row) => row.weightKg > 0 && (row.potentialSg ?? 0) > 1);
  const predictedOg = predictOriginalGravity(
    state.grainBill.map((row) => ({ name: row.name, weightKg: row.weightKg, potentialSg: row.potentialSg ?? 0 })),
    state.batchVolumeL,
    state.assumedEfficiencyPercent,
  );
  const abvSoFar = state.fgSg > 0 && state.ogSg > 0 ? ((state.ogSg - state.fgSg) * 131.25).toFixed(2) : null;

  const bjcpStyle = BJCP_STYLES.find((s) => s.id === state.bjcpStyleId) ?? BJCP_STYLES[0];
  const ibuResult = calculateIbu(
    state.hopAdditions,
    state.wortGravitySg,
    state.batchVolumeL,
    state.ibuFormula,
    state.garetzExtras,
  );
  const ibuFormulaLabel = IBU_FORMULAS.find((f) => f.id === state.ibuFormula)?.label ?? 'Tinseth';
  const advancedAbv = calculateAbvAdvanced(state.ogSg, state.fgSg);
  const compliance = checkStyleCompliance(
    { og: state.ogSg, fg: state.fgSg, ibu: ibuResult.totalIbu, srm: srm ?? 0, abvPercent: advancedAbv },
    bjcpStyle,
  );

  const handleShare = async () => {
    const text = buildRecipeShareText(state, {
      bjcpStyleName: bjcpStyle.name,
      targetWaterStyleName: targetStyleName,
      ibu: ibuResult.totalIbu,
      srm,
      abvPercent: advancedAbv,
      parametersInRange: compliance.parametersInRange,
      fermentationBatches: fermentationBatches.map((batch) => {
        const stats = calculateFermentationStats(batch.entries);
        return {
          name: batch.name,
          entryCount: batch.entries.length,
          currentGravity: stats.currentGravity,
          apparentAttenuationPercent: stats.apparentAttenuationPercent,
          likelyComplete: stats.likelyComplete,
        };
      }),
    }, t);
    await share(text);
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('home.title')}</h2>
      <p className="font-body text-sm text-amber-800">{t('home.subtitle')}</p>

      <div className="rounded-lg border-2 border-amber-200 bg-amber-50/40 p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-wide text-amber-900">{t('home.processFlow.title')}</h3>
          <span className="flex items-center gap-1 font-body text-[0.65rem] font-semibold text-amber-600">
            {t('home.processFlow.scrollHint')} <span aria-hidden="true">→</span>
          </span>
        </div>
        <div className="relative mt-2">
          <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
            {processSteps.map((step, i) => (
              <div key={step.id} className="flex flex-shrink-0 items-center">
                {i > 0 ? (
                  <span aria-hidden="true" className="mx-1 flex-shrink-0 text-amber-400">
                    →
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onJumpToTab(step.id)}
                  className="flex min-h-[64px] w-20 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-teal-200 bg-white px-1 py-2 text-center hover:border-teal-400 hover:bg-teal-50"
                >
                  <step.icon className="h-5 w-5 flex-shrink-0 text-teal-700" />
                  <span className="font-body text-[0.65rem] font-semibold leading-tight text-ink">
                    {step.shortLabel ?? step.label}
                  </span>
                </button>
              </div>
            ))}
          </div>
          {/* Fade hint on the right edge so the strip visibly continues off-screen, not just relying on the "Scroll for more" label. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-amber-50 to-transparent"
          />
        </div>
      </div>

      <SummarySection title={t('home.waterSource.title')} icon={DropletIcon} tabId="water-report" onJumpToTab={onJumpToTab}>
        <p>
          {t('home.waterSource.summary', {
            calcium: state.sourceProfile.calcium,
            magnesium: state.sourceProfile.magnesium,
            sulfate: state.sourceProfile.sulfate,
            chloride: state.sourceProfile.chloride,
          })}
        </p>
      </SummarySection>

      <SummarySection title={t('home.grainBill.title')} icon={DropletIcon} tabId="mash-adjustment" onJumpToTab={onJumpToTab}>
        {state.grainBill.length === 0 ? (
          <p className="text-amber-700">{t('home.grainBill.empty')}</p>
        ) : (
          <>
            <ul className="flex flex-col gap-0.5">
              {state.grainBill.map((row, i) => (
                <li key={i}>
                  {row.name || t('home.grainBill.unnamedGrain')} -- {row.weightKg} kg @ {row.colorLovibond}°L
                  {Number.isFinite(row.potentialSg) && (row.potentialSg as number) > 0
                    ? t('home.grainBill.potentialSuffix', { potential: row.potentialSg as number })
                    : ''}
                </li>
              ))}
            </ul>
            <p className="mt-1 font-semibold">
              {t('home.grainBill.total', {
                total: totalGrainKg.toFixed(2),
                srm: srm !== null ? t('home.grainBill.srmSuffix', { srm: roundForDisplay(srm, 1) }) : '',
              })}
            </p>
            {hasPotential ? (
              <p className="mt-1 font-semibold text-teal-800">
                {t('home.grainBill.estimatedOg', {
                  og: roundForDisplay(predictedOg, 3),
                  efficiency: state.assumedEfficiencyPercent,
                })}
              </p>
            ) : null}
          </>
        )}
      </SummarySection>

      <SummarySection title={t('home.mashSparge.title')} icon={FlaskIcon} tabId="mash-adjustment" onJumpToTab={onJumpToTab}>
        <p>{t('home.mashSparge.batchVolume', { volume: state.batchVolumeL })}</p>
        <p>{t('home.mashSparge.targetStyleProfile', { style: targetStyleName })}</p>
        <p>{t('home.mashSparge.spargeVolume', { volume: state.spargeVolumeL })}</p>
      </SummarySection>

      <SummarySection
        title={t('home.recipeGravity.title')}
        icon={CalculatorIcon}
        tabId="brewhouse"
        onJumpToTab={onJumpToTab}
        headerExtra={<GravityUnitToggle unit={gravityUnit} onChange={setGravityUnit} />}
      >
        <GravityDisplay label="OG" valueSg={state.ogSg} unit={gravityUnit} />
        <GravityDisplay label="FG" valueSg={state.fgSg} unit={gravityUnit} />
        {abvSoFar !== null ? <p>{t('home.recipeGravity.abvSimple', { abv: abvSoFar })}</p> : null}
      </SummarySection>

      <SummarySection title={t('home.hopsIbu.title')} icon={CalculatorIcon} tabId="brewhouse" onJumpToTab={onJumpToTab}>
        {state.hopAdditions.length === 0 || state.hopAdditions.every((h) => h.weightG === 0) ? (
          <p className="text-amber-700">{t('home.hopsIbu.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {state.hopAdditions.map((hop, i) => (
              <li key={i}>
                {hop.name || t('home.hopsIbu.unnamedHop')} --{' '}
                {t('home.hopsIbu.additionDetail', {
                  weight: hop.weightG,
                  aa: hop.alphaAcidPercent,
                  time: hop.boilTimeMinutes,
                })}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-1 font-semibold">
          {t('home.hopsIbu.totalIbu', { ibu: roundForDisplay(ibuResult.totalIbu, 1), formula: ibuFormulaLabel })}
        </p>
      </SummarySection>

      <div className="rounded-lg border-2 border-teal-300 bg-teal-50/60 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-teal-800">
            <StyleCheckIcon className="h-4 w-4 flex-shrink-0 text-teal-700" />
            {t('home.deviation.title', { style: bjcpStyle.name })}
          </h3>
          <button
            type="button"
            onClick={() => onJumpToTab('style-check')}
            className="flex min-h-[44px] flex-shrink-0 items-center rounded-full border border-teal-300 bg-teal-50 px-3 py-1 font-body text-xs font-semibold text-teal-800 hover:bg-teal-100"
          >
            {t('home.deviation.changeStyle')}
          </button>
        </div>
        <p className="mt-1 font-body text-xs text-ink/70">
          {t('home.deviation.matchSummary', { count: compliance.parametersInRange })}
        </p>
        <div className="mt-3 flex flex-col gap-1.5">
          <DeviationRow label={t('home.deviation.originalGravity')} unit=" SG" compliance={compliance.og} />
          <DeviationRow label={t('home.deviation.finalGravity')} unit=" SG" compliance={compliance.fg} />
          <DeviationRow label={t('home.deviation.ibu')} unit="" compliance={compliance.ibu} />
          <DeviationRow label={t('home.deviation.colorSrm')} unit="" compliance={compliance.srm} />
          <DeviationRow label={t('home.deviation.abv')} unit="%" compliance={compliance.abvPercent} />
        </div>
      </div>

      <SummarySection title={t('home.fermentation.title')} icon={FermenterIcon} tabId="fermentation-tracker" onJumpToTab={onJumpToTab}>
        {fermentationBatches.length === 0 ? (
          <p className="text-amber-700">{t('home.fermentation.empty')}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {fermentationBatches.map((batch) => {
              const stats = calculateFermentationStats(batch.entries);
              return (
                <li key={batch.id}>
                  <span className="font-semibold">{batch.name}</span> --{' '}
                  {t('home.fermentation.readingCount', {
                    count: batch.entries.length,
                    plural: batch.entries.length === 1 ? '' : 's',
                  })}
                  {stats.apparentAttenuationPercent !== null
                    ? t('home.fermentation.attenuationSuffix', {
                        attenuation: roundForDisplay(stats.apparentAttenuationPercent, 1),
                      })
                    : ''}
                  {stats.likelyComplete ? t('home.fermentation.likelyFinished') : ''}
                </li>
              );
            })}
          </ul>
        )}
      </SummarySection>

      <div className="mt-2 border-t border-amber-200 pt-4">
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-body text-sm font-semibold text-parchment shadow hover:bg-teal-800 active:bg-teal-900"
        >
          <ShareIcon className="h-5 w-5 flex-shrink-0" />
          {t('home.share.button')}
        </button>
        <p className="mt-2 text-center font-body text-xs text-amber-700" role="status" aria-live="polite">
          {shareStatus === 'shared'
            ? t('home.share.shared')
            : shareStatus === 'copied'
              ? t('home.share.copied')
              : shareStatus === 'error'
                ? t('home.share.error')
                : t('home.share.idle')}
        </p>
        <button
          type="button"
          onClick={() => onJumpToTab('recipes')}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-teal-300 bg-teal-50 px-4 py-2 font-body text-sm font-semibold text-teal-800 hover:bg-teal-100"
        >
          <BookmarkIcon className="h-4 w-4 flex-shrink-0" />
          {t('home.lockRecipe')}
        </button>
      </div>
    </section>
  );
}
