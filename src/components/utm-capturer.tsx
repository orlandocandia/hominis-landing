'use client';

import { useEffect } from 'react';

/**
 * Captures UTM params from the URL on first visit and stores them in cookies
 * so they survive navigation to the contact form and the POST to /api/leads.
 * Runs once on mount of the landing page.
 */
export function UtmCapturer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    // Set cookies for 7 days (only if param present, don't overwrite existing)
    const setCookie = (name: string, value: string) => {
      // Don't overwrite if already set (first-touch attribution)
      if (document.cookie.includes(`${name}=`)) return;
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    };
    if (utmSource) setCookie('utm_source', utmSource);
    if (utmMedium) setCookie('utm_medium', utmMedium);
    if (utmCampaign) setCookie('utm_campaign', utmCampaign);
    // Also store referrer (first-touch only)
    if (!document.cookie.includes('utm_referrer=') && document.referrer) {
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `utm_referrer=${encodeURIComponent(document.referrer)}; expires=${expires}; path=/; SameSite=Lax`;
    }
  }, []);
  return null;
}
