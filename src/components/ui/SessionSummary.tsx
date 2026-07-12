'use client';

interface SummaryItem {
  label: string;
  value: string;
}

interface SessionSummaryProps {
  items: SummaryItem[];
}

/**
 * A persistent recap strip of the values carried between tabs (batch
 * volume, target style, OG/FG, etc.), shown at the top of every panel.
 * Each calculator reads/writes shared state, so without this the user has
 * no way to confirm what actually got selected before moving to the next
 * step of the brew day -- this keeps the current selections in view the
 * whole time, not just on the screen where they were entered.
 */
export function SessionSummary({ items }: SessionSummaryProps) {
  if (items.length === 0) return null;
  return (
    <div
      aria-label="Current brew session selections"
      className="-mx-4 flex gap-2 overflow-x-auto border-b border-amber-200 bg-amber-50/70 px-4 py-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:rounded-xl sm:border sm:px-3"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-shrink-0 items-baseline gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-white px-3 py-1 text-xs"
        >
          <span className="font-body font-medium text-amber-700">{item.label}</span>
          <span className="font-display font-bold text-teal-800">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
