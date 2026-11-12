import { NextResponse } from "next/server";
import { getCachedGlobalSettings } from "@/lib/cache";

export const revalidate = 60;

export async function GET() {
  try {
    const setting = await getCachedGlobalSettings();

    const response = NextResponse.json(
      setting || {
        facebookPixelId: null,
        bkashNumber: "01700000000",
        nagadNumber: "01700000000",
        rocketNumber: null,
        whatsappNumber: "01607084155",
        supportEmail: "helloevorisesolutions@gmail.com",
        noticeText: null,
        bankName: "BRAC Bank PLC",
        bankAccountName: "MD. NAJMUSH SHAKIB",
        bankAccountNumber: "1079368670001",
        bankBranch: "MIRPUR SECTION-1 BRANCH",
        bankRouting: "060261997",
        bankSwift: "BRAKBDDH",
      }
    );

    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("Public settings fetch error:", error);
    return NextResponse.json({
      facebookPixelId: null,
      bkashNumber: "01700000000",
      nagadNumber: "01700000000",
      whatsappNumber: "01607084155",
      supportEmail: "helloevorisesolutions@gmail.com",
    });
  }
}
