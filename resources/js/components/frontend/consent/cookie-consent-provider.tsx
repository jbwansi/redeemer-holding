import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_EVENT,
  persistCookieConsent,
  readCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

const ANALYTICS_ID = 'G-JZ6MTSNT1D';

type ConsentContextValue = {
  consent: CookieConsent | null;
  openPreferences: () => void;
  allowExternalMedia: () => void;
};

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  openPreferences: () => undefined,
  allowExternalMedia: () => undefined,
});

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

function applyAnalyticsConsent(enabled: boolean) {
  window[`ga-disable-${ANALYTICS_ID}`] = !enabled;
  if (!enabled || document.getElementById('redeemer-google-analytics')) return;

  const script = document.createElement('script');
  script.id = 'redeemer-google-analytics';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
  window.gtag('js', new Date());
  window.gtag('config', ANALYTICS_ID);
}

export function useCookieConsent() {
  return useContext(ConsentContext);
}

export default function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [externalMedia, setExternalMedia] = useState(false);

  useEffect(() => {
    const stored = readCookieConsent();
    setConsent(stored);
    setAnalytics(stored?.analytics ?? false);
    setExternalMedia(stored?.externalMedia ?? false);
    setReady(true);
  }, []);

  useEffect(() => {
    applyAnalyticsConsent(consent?.analytics === true);
  }, [consent?.analytics]);

  useEffect(() => {
    const listener = (event: Event) => setConsent((event as CustomEvent<CookieConsent>).detail);
    window.addEventListener(COOKIE_CONSENT_EVENT, listener);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
  }, []);

  const save = (nextAnalytics: boolean, nextExternalMedia: boolean) => {
    const next = persistCookieConsent({
      analytics: nextAnalytics,
      externalMedia: nextExternalMedia,
    });
    setConsent(next);
    setAnalytics(nextAnalytics);
    setExternalMedia(nextExternalMedia);
    setPreferencesOpen(false);
  };

  const openPreferences = () => {
    setAnalytics(consent?.analytics ?? false);
    setExternalMedia(consent?.externalMedia ?? false);
    setPreferencesOpen(true);
  };

  const allowExternalMedia = () => save(consent?.analytics ?? false, true);

  return (
    <ConsentContext.Provider value={{ consent, openPreferences, allowExternalMedia }}>
      {children}

      {ready && consent === null && !preferencesOpen && (
        <section
          aria-label="Préférences de confidentialité"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl sm:p-6"
        >
          <h2 className="text-lg font-bold">Votre confidentialité, votre choix</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Les éléments nécessaires au fonctionnement restent actifs. Analytics et les médias
            YouTube/Vimeo ne sont chargés qu’avec votre accord.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button className="ux-btn-primary min-h-11" onClick={() => save(true, true)}>
              Tout accepter
            </button>
            <button
              className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-white/10"
              onClick={() => save(false, false)}
            >
              Refuser les optionnels
            </button>
            <button
              className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 font-semibold hover:bg-white/10"
              onClick={openPreferences}
            >
              Personnaliser
            </button>
          </div>
        </section>
      )}

      {preferencesOpen && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title">
          <section className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-6 text-white shadow-2xl">
            <h2 id="cookie-preferences-title" className="text-xl font-bold">Préférences de confidentialité</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div><h3 className="font-semibold">Nécessaires</h3><p className="mt-1 text-sm text-slate-400">Session, sécurité et préférences essentielles.</p></div>
                  <span className="text-sm font-semibold text-emerald-400">Toujours actifs</span>
                </div>
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-700 p-4">
                <span><span className="block font-semibold">Analytics</span><span className="mt-1 block text-sm text-slate-400">Mesure d’audience Google Analytics.</span></span>
                <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="h-5 w-5 accent-[#DA2E29]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-700 p-4">
                <span><span className="block font-semibold">Médias externes</span><span className="mt-1 block text-sm text-slate-400">Vidéos YouTube et Vimeo.</span></span>
                <input type="checkbox" checked={externalMedia} onChange={(event) => setExternalMedia(event.target.checked)} className="h-5 w-5 accent-[#DA2E29]" />
              </label>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button className="ux-btn-primary min-h-11" onClick={() => save(analytics, externalMedia)}>Enregistrer mes choix</button>
              <button className="min-h-11 rounded-xl border border-slate-600 px-4 py-2 font-semibold" onClick={() => setPreferencesOpen(false)}>Fermer</button>
            </div>
          </section>
        </div>
      )}
    </ConsentContext.Provider>
  );
}
