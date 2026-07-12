'use client';

import { useState } from 'react';

export interface TutorialStep {
  /** Short bold lead-in, e.g. "1. Create a batch." */
  lead: string;
  /** Rest of the step's explanation. */
  body: React.ReactNode;
}

interface TutorialCalloutProps {
  title: string;
  steps: TutorialStep[];
}

/**
 * A collapsible "How to use this screen" callout, closed by default so it
 * doesn't push the actual calculator down for returning users, but always
 * available as the first thing on the screen for first-time users. Shared
 * across every panel instead of each screen reimplementing its own
 * accordion, per the pattern originally built for Fermentation Tracker.
 */
export function TutorialCallout({ title, steps }: TutorialCalloutProps) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="rounded-lg border-2 border-teal-300 bg-teal-50/60">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex min-h-[44px] w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</span>
        <span aria-hidden="true" className="text-teal-700">
          {isOpen ? '▾' : '▸'}
        </span>
      </button>
      {isOpen ? (
        <ol className="flex flex-col gap-2 border-t border-teal-200 px-4 py-3 font-body text-sm text-ink">
          {steps.map((step, i) => (
            <li key={i}>
              <span className="font-semibold text-teal-800">{step.lead}</span> {step.body}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
