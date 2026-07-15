'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { RouteNav } from '@/components/ui/RouteNav';
import { SectionCard } from '@/components/ui/SectionCard';
import {
  InfoIcon,
  StyleCheckIcon,
  FlaskIcon,
  KettleIcon,
  FermenterIcon,
  ChartBarIcon,
  BookmarkIcon,
} from '@/components/ui/icons';

/**
 * A prose walkthrough of the app, organised as the five stages of a brew.
 * Every calculator name is a link that deep-links into its tab (via /#tab-id)
 * or opens the matching standalone route, so the guide doubles as a launcher.
 * English only, in step with the other reference pages (faults, ingredients).
 */

// A link into a calculator tab or standalone route, styled as an inline anchor.
function Tool({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-[#a35f1c] underline decoration-[#e08b2d]/40 underline-offset-2 transition-colors hover:text-[#e08b2d] hover:decoration-[#e08b2d]"
    >
      {children}
    </Link>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-amber-900">{children}</strong>;
}

export default function GuidePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <RouteNav current="guide" />

      {/* header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-amber-900 sm:text-4xl">
          User guide
        </h1>
        <p className="mt-1 max-w-prose font-body text-sm text-ink/70">
          A walk through the app in the order you actually brew: plan, design, brew, ferment and
          package, then review. Every tool named below is a link, so you can jump straight to it.
        </p>
      </div>

      <div className="space-y-5">
        {/* Intro */}
        <SectionCard title="What this app is" icon={InfoIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              The <Lead>Indian Brewer&apos;s Calculator</Lead> is a free brewing lab notebook. It
              covers water chemistry, the mash and sparge, brewhouse maths, fermentation, and BJCP
              style checks, from homebrew batches to commercial hectolitre brews.
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>
                <Lead>Free and private.</Lead> Everything runs in your browser. Your recipes stay in
                this device&apos;s local storage and are never sent to a server we run.
              </li>
              <li>
                <Lead>Metric throughout.</Lead> Liters, hectoliters, grams, milligrams, degrees
                Celsius, and degrees Lovibond for grain color.
              </li>
              <li>
                <Lead>Works offline.</Lead> It is a progressive web app, so you can install it to
                your home screen and open it on the brew deck without a connection.
              </li>
            </ul>
            <p>
              New here? Start at <Tool href="/start">Plan a brew</Tool> to set your targets, or open{' '}
              <Tool href="/welcome">All tools</Tool> to see every calculator grouped by stage.
            </p>
          </div>
        </SectionCard>

        {/* Act 1 */}
        <SectionCard title="1. Plan" icon={StyleCheckIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              <Lead>Set your targets first.</Lead> On <Tool href="/start">Plan a brew</Tool> you name
              the batch, pick a BJCP style, and set target ABV, IBU, and CO2 carbonation. The BJCP
              guideline ranges for that style show up as you type, so you can see whether a target
              sits inside the style.
            </p>
            <p>
              Once saved, those targets appear as target versus actual on the{' '}
              <Tool href="/#home">Home overview</Tool>, so as you build the recipe you can see how
              close the current numbers are to the plan you set.
            </p>
          </div>
        </SectionCard>

        {/* Act 2 */}
        <SectionCard title="2. Design" icon={FlaskIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              <Lead>Build the water.</Lead> Start on the{' '}
              <Tool href="/#water-report">Water Report</Tool>. Load a city water preset or enter your
              own ion values from a water report, check residual alkalinity, and add brewing salts to
              move toward a target profile for your style.
            </p>
            <p>
              <Lead>Build the grain bill and dial in mash pH.</Lead> The{' '}
              <Tool href="/#mash-adjustment">Mash Adjustment</Tool> tab holds the grain bill editor
              next to predicted mash pH, since the grist drives that number. This is also where
              Indian ingredients belong: adjuncts and specialty additions such as jaggery, mango, and
              spices. Then handle the second runnings on{' '}
              <Tool href="/#sparge-adjustment">Sparge Adjustment</Tool> and size every vessel on{' '}
              <Tool href="/#water-volumes">Water Volumes</Tool>.
            </p>
            <p>
              <Lead>Pick from a real catalog.</Lead> Ingredients across these tools are selectable
              from a catalog of 426 hops, 288 malts, and 707 yeasts, with specs. Browse the raw list
              any time on <Tool href="/ingredients">Raw materials</Tool>.
            </p>
            <p>
              <Lead>Adjust by mixing.</Lead> Use <Tool href="/#blending">Blending</Tool> to combine
              two beers or worts by proportion, and <Tool href="/#mixing-cross">Mixing Cross</Tool>{' '}
              (the Pearson square) to hit a target strength or value between two known inputs.
            </p>
          </div>
        </SectionCard>

        {/* Act 3 */}
        <SectionCard title="3. Brew" icon={KettleIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              <Lead>Run the brew-day numbers.</Lead> The{' '}
              <Tool href="/#brewhouse">Brewhouse Calculators</Tool> give you IBU, ABV, and yeast
              pitch rate for the batch in front of you.
            </p>
            <p>
              <Lead>Measure efficiency at scale.</Lead>{' '}
              <Tool href="/#brewhouse-yield">Brewhouse Yield</Tool> works in commercial hectoliters
              and extract percent, so you can judge how well the brewhouse converted grain to wort.
            </p>
            <p>
              <Lead>Handle the transfer and the leftovers.</Lead> Plan the run-off on{' '}
              <Tool href="/#transfer-lautering">Transfer and Lautering</Tool>, and estimate the wet
              weight and volume of your <Tool href="/#spent-grain">Spent Grain</Tool> for disposal or
              collection.
            </p>
          </div>
        </SectionCard>

        {/* Act 4 */}
        <SectionCard title="4. Ferment and package" icon={FermenterIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              <Lead>Track the fermentation.</Lead> Log gravity and temperature readings over time on
              the <Tool href="/#fermentation-tracker">Fermentation Tracker</Tool> to watch attenuation
              and know when the beer is done.
            </p>
            <p>
              <Lead>Check it against the style.</Lead> The{' '}
              <Tool href="/#style-check">BJCP Style Check</Tool> compares your finished IBU, SRM
              color, and ABV against the guidelines for your chosen style, so you can see where the
              beer lands and whether it is in style.
            </p>
          </div>
        </SectionCard>

        {/* Act 5 */}
        <SectionCard title="5. Review and improve" icon={ChartBarIcon}>
          <div className="space-y-3 leading-relaxed text-ink/80">
            <p>
              <Lead>Save the brew.</Lead> Store a snapshot of the recipe on{' '}
              <Tool href="/#recipes">Recipes</Tool> so you can reopen it, compare batches, and repeat
              what worked.
            </p>
            <p>
              <Lead>See how you compare.</Lead>{' '}
              <Tool href="/analytics">Recipe Analytics</Tool> sets your recipe against typical values
              for the style and shows community trends: common ABV, IBU, and color, plus the
              most-used hops, malts, and yeasts.
            </p>
            <p>
              <Lead>Diagnose off-flavors.</Lead> If something tastes wrong, the{' '}
              <Tool href="/faults">Beer faults</Tool> reference describes each off-flavor, where it
              comes from, and how to fix it, with a flavor wheel to browse by family.
            </p>
            <p>
              <Lead>Look up raw materials.</Lead> The{' '}
              <Tool href="/ingredients">Raw materials</Tool> reference lists hops, malts, and yeasts
              with their specs whenever you need to check a substitution.
            </p>
          </div>
        </SectionCard>

        {/* Languages */}
        <SectionCard title="Languages" icon={InfoIcon} tone="teal">
          <p className="leading-relaxed text-ink/80">
            The calculators are available in <Lead>English</Lead>, <Lead>German</Lead>,{' '}
            <Lead>Hindi</Lead>, and <Lead>Marathi</Lead>. Use the language switcher in the header to
            change at any time. This guide and the reference pages are in English.
          </p>
        </SectionCard>

        {/* Tips */}
        <SectionCard title="Tips" icon={BookmarkIcon} tone="warning">
          <ul className="ml-4 list-disc space-y-1.5 leading-relaxed text-ink/80">
            <li>
              <Lead>Plan before you design.</Lead> Setting targets on{' '}
              <Tool href="/start">Plan a brew</Tool> first makes every later tool aim at the same
              numbers.
            </li>
            <li>
              <Lead>Follow the Home overview.</Lead> The{' '}
              <Tool href="/#home">Home overview</Tool> shows target versus actual, so you always know
              what still needs work.
            </li>
            <li>
              <Lead>Back up your work.</Lead> Recipes live in this browser only. Use the{' '}
              <Tool href="/#backup">Backup and Sync</Tool> tab to export a copy or sync to your own
              Google Drive.
            </li>
            <li>
              <Lead>Install it.</Lead> Add the app to your home screen to open it offline on the brew
              deck.
            </li>
          </ul>
        </SectionCard>
      </div>
    </main>
  );
}
