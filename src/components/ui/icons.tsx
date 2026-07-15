/**
 * A small set of hand-drawn, monochromatic (currentColor) line icons,
 * one per app section, kept visually consistent: 24x24 viewBox, 1.75
 * stroke width, rounded joins, no fills. Original SVG paths, not from
 * any icon library or proprietary asset set.
 */

interface IconProps {
  className?: string;
}

const commonProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Water droplet -- Water Report. */
export function DropletIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M12 2.5c3.5 4.5 7 8.7 7 12.5a7 7 0 1 1-14 0c0-3.8 3.5-8 7-12.5Z" />
    </svg>
  );
}

/** Flask -- Mash Adjustment. */
export function FlaskIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M9 2.5h6M10 2.5v6.2L4.7 18a2 2 0 0 0 1.7 3h11.2a2 2 0 0 0 1.7-3L14 8.7V2.5" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

/** Funnel -- Sparge Adjustment. */
export function FunnelIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M3.5 4.5h17L14 12.5v6l-4 2v-8L3.5 4.5Z" />
    </svg>
  );
}

/** Two merging streams -- Blending. */
export function BlendIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M4 5c3 0 4 3 4 7s-1 7-4 7" />
      <path d="M20 5c-3 0-4 3-4 7s1 7 4 7" />
      <path d="M8 12h8" />
    </svg>
  );
}

/** Brew kettle with rising vapor -- Brewhouse Yield. */
export function KettleIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M5 10h14l-1.2 9a1 1 0 0 1-1 .9H7.2a1 1 0 0 1-1-.9L5 10z" />
      <path d="M4 10h16" />
      <path d="M9 6c0-1 1-1 1-2M13 6c0-1 1-1 1-2" />
    </svg>
  );
}

/** Pearson square: crossing arms with a target node -- Mixing Cross. */
export function MixingCrossIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M5 5l5.5 5.5M19 5l-5.5 5.5M5 19l5.5-5.5M19 19l-5.5-5.5" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

/** Measuring jug -- Water Volumes. */
export function JugIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M7 3h8l1.2 4.5A6 6 0 0 1 18 9v9a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 6 18V9c0-.6.1-1.2.3-1.7L7 3Z" />
      <path d="M8 12h6M8 15.5h6" />
    </svg>
  );
}

/** Pipe with flow arrow -- Transfer & Lautering. */
export function PipeFlowIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M3.5 8h9a4 4 0 0 1 4 4v0a4 4 0 0 0 4 4h0" />
      <path d="M17.5 13.2 20.5 16l-3 2.8" />
    </svg>
  );
}

/** Fermenter with bubbles -- Fermentation Tracker. */
export function FermenterIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M8 3h8l-1 5.5c2 1.7 3 4 3 6.5a6 6 0 0 1-12 0c0-2.5 1-4.8 3-6.5L8 3Z" />
      <path d="M10.5 13.5c.5.7.5 1.3 0 2M13.5 15.5c.5.7.5 1.3 0 2" />
    </svg>
  );
}

/** Calculator grid -- Brewhouse Calculators. */
export function CalculatorIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <rect x="4.5" y="2.5" width="15" height="19" rx="2" />
      <path d="M7.5 6.5h9" />
      <path d="M7.5 11h.01M12 11h.01M16.5 11h.01M7.5 14.5h.01M12 14.5h.01M16.5 14.5h.01M7.5 18h.01M12 18h.01M16.5 18h.01" />
    </svg>
  );
}

/** Checklist/target badge -- BJCP Style Check. */
export function StyleCheckIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" />
    </svg>
  );
}

/** Info circle -- About / Disclaimer / FAQ. */
export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** House -- Home / brew session overview. */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10" />
      <path d="M10 20.5V14h4v6.5" />
    </svg>
  );
}

/** Bookmark ribbon -- Locked/saved Recipes. */
export function BookmarkIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4.5L5 21V4.5a1 1 0 0 1 1-1Z" />
    </svg>
  );
}

/** Upward arrow out of a tray -- Share / Export. */
export function ShareIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M12 15V3.5" />
      <path d="M7.5 8 12 3.5 16.5 8" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}

/** Cloud with sync arrows -- Google Sync. */
export function CloudSyncIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M7 17.5a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.2 8.1a3.7 3.7 0 0 1-.7 7.4H7.3Z" />
      <path d="M10.5 12.5 12 11l1.5 1.5M12 11v5" />
    </svg>
  );
}

export function ChartBarIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <rect x="7" y="12" width="3" height="5" rx="0.5" />
      <rect x="12" y="8" width="3" height="9" rx="0.5" />
      <rect x="17" y="14" width="3" height="3" rx="0.5" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
