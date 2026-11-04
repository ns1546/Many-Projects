import "@/lib/polyfill";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Noto_Sans_Bengali } from "next/font/google";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { MobileBottomNav } from "@/components/shared/MobileBottomNav";
import { WhatsAppSupportButton } from "@/components/shared/WhatsAppSupportButton";
import AuthProvider from "@/components/providers/AuthProvider";
import ClientInit from "@/components/ClientInit";
import MetaPixel from "@/components/providers/MetaPixel";
import GoogleAnalytics from "@/components/providers/GoogleAnalytics";
import { Toaster } from "sonner";
import NavigationProgressBar from "@/components/shared/NavigationProgressBar";
import "./globals.css";
import "./mobile.css";

// ─── CONSISTENT TYPOGRAPHY: Noto Sans Bengali ────────────────────────────
// Clean, professional font as requested, moving away from AI-generated looks.
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-body",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "EvoRise Media | ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি",
    template: "%s | EvoRise Media",
  },
  description:
    "EvoRise Media — শীর্ষস্থানীয় মিডিয়া ও মিউজিক একাডেমি। আমাদের প্রধান প্রশিক্ষক ও বিশিষ্ট মিউজিক ডিরেক্টর JKH Jesan-এর সাথে শিখুন প্রফেশনাল মিউজিক প্রোডাকশন, মিক্সিং, মাস্টারিং এবং সাউন্ড ডিজাইন।",
  openGraph: {
    siteName: "EvoRise Media",
    title: "EvoRise Media | ক্রিয়েটিভ মিডিয়া ও মিউজিক একাডেমি",
    description: "EvoRise Media-র প্রধান প্রশিক্ষক JKH Jesan-এর সাথে প্রফেশনাল মিউজিক প্রোডাকশন শিখুন।",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A1F0F",
};

import { getCachedGlobalSettings } from "@/lib/cache";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getCachedGlobalSettings();
  const fbPixelId = settings?.facebookPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
  const gaId = settings?.googleAnalyticsId || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <html
      lang="bn"
      className={`${notoSansBengali.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          <ClientInit />
          <Suspense fallback={null}>
            <MetaPixel fbPixelId={fbPixelId} />
          </Suspense>
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={gaId} />
          </Suspense>
          <Header />
          <main className="grow">{children}</main>
          <Footer />
          <MobileBottomNav />
          <WhatsAppSupportButton phoneNumber={settings?.whatsappNumber || "01607084155"} />
          <Toaster richColors theme="dark" />
        </AuthProvider>
      </body>
    </html>
  );
}
