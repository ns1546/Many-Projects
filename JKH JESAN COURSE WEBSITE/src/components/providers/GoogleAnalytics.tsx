"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, Suspense } from "react";

/**
 * Fires a custom Google Analytics / Google Ads conversion event.
 * Compatible with GA4 (G-XXXXXXXX) and Google Ads (AW-XXXXXXXX).
 */
export const gtagEvent = (action: string, params: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
};

function GoogleAnalyticsTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("config", gaId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, gaId]);

  return null;
}

export default function GoogleAnalytics({ gaId }: { gaId?: string | null }) {
  const effectiveGaId = gaId || "G-ECQQD0F5XS";
  const gtmId = "GTM-TKGGDS5HG";

  return (
    <>
      <Suspense fallback={null}>
        <GoogleAnalyticsTracker gaId={effectiveGaId} />
      </Suspense>

      {/* Google Tag Container Script (GTM) - Directly matches Google Tag Setup */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
        onError={() => { /* Silently handled when adblockers block third-party analytics */ }}
      />

      {/* Google Analytics 4 (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${effectiveGaId}`}
        onError={() => { /* Silently handled when adblockers block third-party analytics */ }}
      />

      <Script
        id="google-analytics-tag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${effectiveGaId}', {
              page_path: window.location.pathname,
            });
            gtag('config', '${gtmId}');
          `,
        }}
      />
    </>
  );
}
