'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { TranslationKey } from '@/i18n/translations';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50/40 p-4">
      <h3 className="font-display text-sm font-bold uppercase tracking-wide text-teal-800">{title}</h3>
      <div className="mt-3 flex flex-col gap-3 font-body text-sm text-ink">{children}</div>
    </div>
  );
}

interface FaqItem {
  questionKey: TranslationKey;
  answerKey: TranslationKey;
}

const FAQ_ITEMS: FaqItem[] = [
  { questionKey: 'about.faq.q1.question', answerKey: 'about.faq.q1.answer' },
  { questionKey: 'about.faq.q2.question', answerKey: 'about.faq.q2.answer' },
  { questionKey: 'about.faq.q3.question', answerKey: 'about.faq.q3.answer' },
  { questionKey: 'about.faq.q4.question', answerKey: 'about.faq.q4.answer' },
  { questionKey: 'about.faq.q5.question', answerKey: 'about.faq.q5.answer' },
  { questionKey: 'about.faq.q6.question', answerKey: 'about.faq.q6.answer' },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-md border border-teal-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-[44px] w-full items-center justify-between gap-2 px-3 py-2 text-left font-semibold text-ink"
      >
        <span>{t(item.questionKey)}</span>
        <span className="text-teal-700">{open ? '−' : '+'}</span>
      </button>
      {open ? <p className="border-t border-teal-100 px-3 py-2 text-ink/80">{t(item.answerKey)}</p> : null}
    </div>
  );
}

export function AboutPanel() {
  const { t } = useLanguage();
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-bold text-ink">{t('about.heading')}</h2>

      <SectionCard title={t('about.aboutMe.title')}>
        <p>{t('about.aboutMe.bio')}</p>
        <div className="flex flex-col gap-2">
          <a
            href="https://ankurnapa.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>{t('about.aboutMe.blog')}</span>
            <span className="text-xs text-ink/60">ankurnapa.github.io</span>
          </a>
          <a
            href="https://ankurnapa.github.io/brewing-distilling-ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>{t('about.aboutMe.aiForBrewers')}</span>
            <span className="text-xs text-ink/60">brewing-distilling-ai</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ankur-napa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] items-center justify-between rounded-md border border-teal-200 bg-white px-3 py-2 font-medium text-teal-800 hover:bg-teal-50"
          >
            <span>{t('about.aboutMe.linkedin')}</span>
            <span className="text-xs text-ink/60">linkedin.com/in/ankur-napa</span>
          </a>
        </div>
      </SectionCard>

      <SectionCard title={t('about.faq.title')}>
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item) => (
            <FaqAccordionItem key={item.questionKey} item={item} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title={t('about.disclaimer.title')}>
        <p>{t('about.disclaimer.p1')}</p>
        <p>{t('about.disclaimer.p2')}</p>
      </SectionCard>

      <SectionCard title={t('about.terms.title')}>
        <p>{t('about.terms.p1')}</p>
        <p>{t('about.terms.p2')}</p>
        <p>{t('about.terms.p3')}</p>
      </SectionCard>
    </section>
  );
}
