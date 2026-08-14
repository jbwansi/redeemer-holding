export const COOKIE_CONSENT_STORAGE_KEY = 'redeemer_cookie_consent_v1';
export const COOKIE_CONSENT_EVENT = 'redeemer:cookie-consent-changed';

export type CookieConsent = {
  version: 1;
  analytics: boolean;
  externalMedia: boolean;
  savedAt: string;
};

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? 'null');
    if (parsed?.version !== 1) return null;

    return {
      version: 1,
      analytics: parsed.analytics === true,
      externalMedia: parsed.externalMedia === true,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
    };
  } catch {
    return null;
  }
}

export function persistCookieConsent(preferences: Pick<CookieConsent, 'analytics' | 'externalMedia'>) {
  const consent: CookieConsent = {
    version: 1,
    analytics: preferences.analytics,
    externalMedia: preferences.externalMedia,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consent }));
  return consent;
}
