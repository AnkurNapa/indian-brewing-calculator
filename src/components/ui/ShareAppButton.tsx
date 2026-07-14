'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '@/i18n/LanguageContext';
import { ShareIcon } from './icons';

type Status = 'idle' | 'shared' | 'copied';

/**
 * "Share app" button. Opens a small dialog with a scannable QR code of the
 * app's own URL (so someone can point another phone's camera at the screen
 * and open the app) plus a native Web-Share / copy-link action.
 *
 * The QR is rendered fully client-side (qrcode.react -> inline SVG), so no
 * request ever leaves the browser -- consistent with the app's privacy
 * promise and its offline, static-export nature. The URL is read from
 * window on mount (static export prerenders with no `window`).
 */
export function ShareAppButton({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.origin}${window.location.pathname}`);
    }
  }, []);

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2500);
    return () => clearTimeout(timer);
  }, [status]);

  // Close the dialog on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleShare = async () => {
    if (!url) return;
    const title = t('app.title');
    const text = t('app.share.text');
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setStatus('shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setStatus('copied');
      }
    } catch {
      // User dismissed the native share sheet, or clipboard was denied -- nothing to surface.
    }
  };

  const actionLabel =
    status === 'shared' ? t('app.share.shared') : status === 'copied' ? t('app.share.copied') : t('app.share.action');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('app.share.label')}
        className={`flex h-8 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-2.5 font-body text-xs font-semibold text-teal-700 shadow-sm transition-colors hover:bg-amber-50 active:bg-amber-100 ${className}`}
      >
        <ShareIcon className="h-4 w-4 flex-shrink-0" />
        {!compact ? <span>{t('app.share.label')}</span> : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('app.share.dialogTitle')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-parchment p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-bold text-amber-900">{t('app.share.dialogTitle')}</h2>

            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 shadow-inner">
              {url ? (
                <QRCodeSVG value={url} size={180} level="M" bgColor="#ffffff" fgColor="#0f766e" />
              ) : (
                <div className="h-[180px] w-[180px]" aria-hidden="true" />
              )}
            </div>

            <p className="font-body text-sm text-ink/70">{t('app.share.scanHint')}</p>

            {url ? <p className="break-all font-body text-xs text-teal-700">{url}</p> : null}

            <button
              type="button"
              onClick={handleShare}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-body text-sm font-semibold text-parchment shadow transition-colors hover:bg-teal-800 active:bg-teal-900"
            >
              <ShareIcon className="h-4 w-4 flex-shrink-0" />
              {actionLabel}
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="font-body text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              {t('app.share.close')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
