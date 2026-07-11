import { ReactNode } from 'react';

interface ResultCardProps {
  title: string;
  value?: string;
  unit?: string;
  tone?: 'default' | 'warning' | 'success';
  children?: ReactNode;
}

const toneStyles: Record<NonNullable<ResultCardProps['tone']>, string> = {
  default: 'border-white/10 bg-white/5 backdrop-blur-xl',
  warning: 'border-[#f5a623]/40 bg-[#f5a623]/10 backdrop-blur-xl',
  success: 'border-[#4caf50]/40 bg-[#4caf50]/10 backdrop-blur-xl',
};

export function ResultCard({ title, value, unit, tone = 'default', children }: ResultCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 ${toneStyles[tone]} sm:p-5`}
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
