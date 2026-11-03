import { NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/meta-capi";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventSourceUrl, customData, userData } = body;

    if (!eventName) {
      return NextResponse.json({ error: "Missing eventName" }, { status: 400 });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || undefined;
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      customData,
      userData: {
        ...userData,
        clientIp,
        clientUserAgent,
      },
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
