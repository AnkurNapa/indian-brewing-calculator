import { ReactNode } from 'react';

interface ResultCardProps {
  title: string;
  value?: string;
  unit?: string;
  tone?: 'default' | 'warning' | 'success';
  children?: ReactNode;
}

const toneStyles: Record<NonNullable<ResultCardProps['tone']>, string> = {
  default: 'border-teal-600 bg-teal-50',
  warning: 'border-amber-500 bg-amber-50',
  success: 'border-teal-700 bg-teal-100',
};

export function ResultCard({ title, value, unit, tone = 'default', children }: ResultCardProps) {
  return (
    <div
      className={`rounded-lg border-l-4 p-4 shadow-sm ${toneStyles[tone]} sm:p-5`}
    >
      <h3 className="font-display text-sm uppercase tracking-wide text-ink/70">{title}</h3>
      {value !== undefined ? (
        <p className="mt-1 font-display text-2xl font-bold text-ink sm:text-3xl">
          {value}
          {unit ? <span className="ml-1 text-base font-normal text-ink/60">{unit}</span> : null}
        </p>
      ) : null}
      {children ? <div className="mt-2 font-body text-sm text-ink/80">{children}</div> : null}
    </div>
  );
}
