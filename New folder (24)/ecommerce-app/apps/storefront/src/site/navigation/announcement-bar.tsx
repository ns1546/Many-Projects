import { Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { cacheLife } from 'next/cache';
import { Link } from '@/platform/i18n/navigation';

const SETTINGS_QUERY = `
  query GetAnnouncementSettings {
    storefrontSettings {
      customFields {
        promoText
        promoLink
      }
    }
  }
`;

async function getAnnouncementData() {
  'use cache';
  cacheLife('hours');
  try {
    const result = await fetch(process.env.VENDURE_SHOP_API_URL || "http://localhost:3002/shop-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: SETTINGS_QUERY }),
    });
    const json = await result.json();
    return json.data?.storefrontSettings?.customFields;
  } catch {
    return null;
  }
}

export async function AnnouncementBar() {
  const data = await getAnnouncementData();
  const promoText = data?.promoText || "SPRING EVENT: Up to 35% off flagship audio & tech essentials. Use code TECH20 for an extra 20% off.";
  const promoLink = data?.promoLink || "/search";

  return (
    <div className="w-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 text-xs py-2 px-4 border-b border-white/10 shadow-sm">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/25 text-sky-400 border border-primary/30 font-semibold tracking-wider text-[10px] uppercase shadow-sm">
            <Sparkles className="size-3 animate-pulse text-sky-300" /> Limited Time
          </span>
          <Link href={promoLink} className="font-medium text-neutral-200 hover:text-white transition-colors">
            {promoText}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 text-neutral-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Truck className="size-3.5 text-sky-400" /> Free Global Shipping Over $50
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-3.5 text-emerald-400" /> Official 2-Year Full Warranty
          </span>
        </div>
      </div>
    </div>
  );
}
