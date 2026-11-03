"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, Suspense } from "react";

export const trackEvent = async (eventName: string, customData: Record<string, any> = {}, userData: Record<string, any> = {}) => {
  const eventId = "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // 1. Browser Pixel Track (with eventID for deduplication)
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, customData, { eventID: eventId });
  }

  // 2. Server-Side Conversion API (CAPI) - Token stays 100% hidden on server
  try {
    if (typeof window !== "undefined") {
      fetch("/api/track/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          eventId,
          eventSourceUrl: currentUrl,
          customData,
          userData,
        }),
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently in background
  }
};

export const pageview = () => {
  trackEvent("PageView");
};

export const fbEvent = (name: string, options = {}) => {
  trackEvent(name, options);
};

function MetaPixelTracker({ fbPixelId }: { fbPixelId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!fbPixelId) return;
    pageview();
  }, [pathname, searchParams, fbPixelId]);

  return null;
}

export default function MetaPixel({ fbPixelId }: { fbPixelId?: string | null }) {
  const [loaded, setLoaded] = useState(false);

  if (!fbPixelId) {
    return null;
  }

  return (
    <>
      <Suspense fallback={null}>
        <MetaPixelTracker fbPixelId={fbPixelId} />
      </Suspense>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
          `,
        }}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}
