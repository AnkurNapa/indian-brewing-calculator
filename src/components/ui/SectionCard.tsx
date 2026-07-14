import { ComponentType, ReactNode } from 'react';

export type SectionTone = 'default' | 'teal' | 'warning';

const toneStyles: Record<SectionTone, { card: string; badge: string; title: string }> = {
  default: {
    card: 'border-[#e6e0d4] bg-white',
    badge: 'bg-teal-50 text-teal-700 ring-teal-100',
    title: 'text-amber-900',
  },
  teal: {
    card: 'border-teal-200 bg-teal-50/50',
    badge: 'bg-white text-teal-700 ring-teal-200',
    title: 'text-teal-800',
  },
  warning: {
    card: 'border-[#e08b2d]/40 bg-[#e08b2d]/10',
    badge: 'bg-white text-[#c2410c] ring-[#e08b2d]/30',
    title: 'text-[#c2410c]',
  },
};

/**
 * The standard content section: an elevated card with an icon badge, a
 * title, an optional right-aligned action slot (edit link, unit toggle),
 * and a semantic tone. Replaces ad-hoc bordered divs so every page shares
 * the same card depth, header rhythm, and hover feedback.
 *
 * Part of the app design system; see docs/DESIGN.md.
 */
export function SectionCard({
  title,
  icon: Icon,
  action,
  tone = 'default',
  children,
  className = '',
}: {
  title: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  tone?: SectionTone;
  children: ReactNode;
  className?: string;
}) {
  const s = toneStyles[tone];
  return (
    <div className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${s.card} ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide ${s.title}`}>
          {Icon ? (
            <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ring-1 ${s.badge}`}>
              <Icon className="h-4 w-4" />
            </span>
          ) : null}
          {title}
        </h3>
        {action ? <div className="flex flex-shrink-0 items-center gap-2">{action}</div> : null}
      </div>
      <div className="mt-3 font-body text-sm text-ink">{children}</div>
    </div>
  );
}
