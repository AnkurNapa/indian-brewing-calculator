/**
 * Google Analytics 4 helpers. The GA script itself is injected in
 * app/layout.tsx; this module centralizes the measurement ID and the
 * per-tab virtual pageview call.
 *
 * Why virtual pageviews: the app is a single-page app (every calculator is
 * one URL with client-side tab switching), so GA's automatic pageview only
 * ever records the root once. Sending a manual `page_view` with a synthetic
 * per-tab `page_location` on each tab change makes each calculator show up
 * as its own entry in GA's "Pages and screens" report -- so you can see
 * which tools people actually use. No recipe data or personal info is sent,
 * only the tab name.
 */

export const GA_MEASUREMENT_ID = 'G-1ZHW47YJDC';

type GtagFn = (command: string, action: string, params?: Record<string, unknown>) => void;

/**
 * Record a virtual pageview for a tab. `tabId` becomes a synthetic path
 * segment (e.g. .../water-report) so GA lists it as a distinct page; home
 * keeps the bare app URL. No-ops on the server or before gtag has loaded.
 */
export function trackTabView(tabId: string, title: string): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
  if (typeof gtag !== 'function') return;

  const base = `${window.location.origin}${window.location.pathname}`;
  const pageLocation = tabId === 'home' ? base : `${base.replace(/\/$/, '')}/${tabId}`;

  gtag('event', 'page_view', {
    page_title: `${title} — Indian Brewer's Calculator`,
    page_location: pageLocation,
    send_to: GA_MEASUREMENT_ID,
  });
}
