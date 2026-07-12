'use client';

import { useState } from 'react';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-3 font-body text-sm text-ink">{children}</div>
    </div>
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is my data uploaded anywhere?',
    answer:
      'By default, no -- everything you enter is saved only in your browser\'s local storage on this device, and there is no server or database behind this app. The Backup & Sync tab has an optional Google Sync you can opt into, which writes your data to a private spreadsheet in your own Google Drive; nothing is sent to any server the app author runs.',
  },
  {
    question: 'How does Backup & Sync work?',
    answer:
      'Two independent options: a local Export/Import (download a .json backup or .csv tables, no account needed) and Google Sync (sign in with your own Google account; the app talks directly to the Sheets API from your browser to read/write a spreadsheet it creates in your Drive). Use either, both, or neither.',
  },
  {
    question: 'Where do the formulas come from?',
    answer:
      'Generally-published brewing science (residual alkalinity, Tinseth IBU, Morey SRM, standard ABV/attenuation formulas, etc.), implemented independently for this app -- not copied from any proprietary spreadsheet or tool.',
  },
  {
    question: 'How accurate are the predictions?',
    answer:
      'Planning-grade estimates, not lab-precise measurements. Mash pH, force-carbonation pressure, and similar predictions are approximations -- always verify with a calibrated pH meter, hydrometer, or physical carbonation chart before relying on them for production.',
  },
  {
    question: 'Are the BJCP style ranges official?',
    answer:
      'They are a numeric quick-reference reconstructed from general brewing knowledge, not copied from the official BJCP guidelines document. For competition or anything official, always check bjcp.org directly.',
  },
  {
    question: 'Can I use this on my phone during a brew day?',
    answer:
      'Yes -- it is built mobile-first and works fully offline once loaded, since there is no server dependency. Add it to your home screen for quick access.',
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-teal-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold text-ink"
      >
        <span>{item.question}</span>
        <span className="text-teal-700">{open ? '−' : '+'}</span>
      </button>
      {open ? <p className="border-t border-teal-100 px-3 py-2 text-ink/80">{item.answer}</p> : null}
    </div>
  );
}

export function AboutPanel() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">About</h2>

      <SectionCard title="About Me">
        <p>Ankur Napa, brewmaster exploring where AI meets brewing and distilling.</p>
        <div className="flex flex-col gap-2">
          <a
            href="https://ankurnapa.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>Blog</span>
            <span className="text-xs text-ink/60">ankurnapa.github.io</span>
          </a>
          <a
            href="https://ankurnapa.github.io/brewing-distilling-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>AI for Brewers and Distillers</span>
            <span className="text-xs text-ink/60">brewing-distilling-ai</span>
          </a>
          <a
            href="https://linkedin.com/in/ankurnapa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>LinkedIn</span>
            <span className="text-xs text-ink/60">linkedin.com/in/ankurnapa</span>
          </a>
        </div>
      </SectionCard>

      <SectionCard title="FAQ">
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.question} item={item} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Disclaimer">
        <p>
          This app provides planning-grade brewing calculations for educational and informational purposes only.
          Formulas are approximations of published brewing science and are not guaranteed to be precise or
          error-free. Always verify critical values (mash pH, carbonation pressure, ABV, alcohol content for
          labeling/duty purposes, etc.) with calibrated instruments and, where relevant, consult applicable local
          regulations before commercial use.
        </p>
        <p>
          BJCP-style reference ranges are a quick numeric guide reconstructed from general knowledge, not sourced
          from or endorsed by the official BJCP Style Guidelines document. For competitions or formal style
          judging, always consult bjcp.org directly.
        </p>
      </SectionCard>

      <SectionCard title="Terms & Conditions">
        <p>
          This app is provided free, as-is, with no warranty of any kind, express or implied, including but not
          limited to accuracy, fitness for a particular purpose, or non-infringement. Use of any calculated value
          is entirely at your own risk and discretion.
        </p>
        <p>
          The author is not liable for any loss, damage, spoiled batch, regulatory issue, or other consequence
          arising from use of this app or reliance on its calculations.
        </p>
        <p>
          By default, all data you enter is stored only in your own browser&apos;s local storage on this device.
          If you opt in to Google Sync (Backup &amp; Sync tab), your data is written to a spreadsheet in your
          own Google Drive using your own Google sign-in -- this app never has a server that stores, sees, or
          transmits your data anywhere else. Continued use of the app constitutes acceptance of these terms.
        </p>
      </SectionCard>
    </section>
  );
}
