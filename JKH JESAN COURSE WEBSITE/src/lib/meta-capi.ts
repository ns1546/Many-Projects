import crypto from "crypto";

export interface MetaUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbc?: string | null;
  fbp?: string | null;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  order_id?: string;
}

export interface MetaEventPayload {
  eventName: "PageView" | "ViewContent" | "InitiateCheckout" | "Purchase" | "Lead" | "Contact" | string;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
}

export function hashSha256(val?: string | null): string | undefined {
  if (!val) return undefined;
  const cleaned = val.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

export function hashPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  // Clean non-digits
  let digits = phone.replace(/\D/g, "");
  // If starts with 01, add 88 for Bangladesh
  if (digits.startsWith("01") && digits.length === 11) {
    digits = "88" + digits;
  }
  return hashSha256(digits);
}

/**
 * Sends a server-side event to Meta Conversion API (CAPI)
 * Token is 100% protected and NEVER exposed to client.
 */
export async function sendMetaCapiEvent(payload: MetaEventPayload): Promise<{ success: boolean; data?: any; error?: string }> {
  const pixelId = process.env.FACEBOOK_PIXEL_ID;
  const accessToken = process.env.FACEBOOK_CAPI_ACCESS_TOKEN;
  const testCode = process.env.FACEBOOK_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    // Missing credentials - gracefully skip in dev/preview
    return { success: false, error: "Meta Pixel ID or CAPI Access Token not configured" };
  }

  try {
    const eventTime = Math.floor(Date.now() / 1000);
    const eventId = payload.eventId || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // Prepare hashed user data adhering to Meta privacy protocols
    const formattedUserData: Record<string, any> = {};

    if (payload.userData?.email) {
      formattedUserData.em = [hashSha256(payload.userData.email)];
    }
    if (payload.userData?.phone) {
      formattedUserData.ph = [hashPhone(payload.userData.phone)];
    }
    if (payload.userData?.firstName) {
      formattedUserData.fn = [hashSha256(payload.userData.firstName)];
    }
    if (payload.userData?.clientIp) {
      formattedUserData.client_ip_address = payload.userData.clientIp;
    }
    if (payload.userData?.clientUserAgent) {
      formattedUserData.client_user_agent = payload.userData.clientUserAgent;
    }
    if (payload.userData?.fbp) {
      formattedUserData.fbp = payload.userData.fbp;
    }
    if (payload.userData?.fbc) {
      formattedUserData.fbc = payload.userData.fbc;
    }

    const eventData: Record<string, any> = {
      event_name: payload.eventName,
      event_time: eventTime,
      event_id: eventId,
      action_source: "website",
      user_data: formattedUserData,
    };

    if (payload.eventSourceUrl) {
      eventData.event_source_url = payload.eventSourceUrl;
    }

    if (payload.customData) {
      eventData.custom_data = {
        currency: payload.customData.currency || "BDT",
        value: payload.customData.value,
        content_name: payload.customData.content_name,
        content_ids: payload.customData.content_ids,
        content_type: payload.customData.content_type || "product",
        order_id: payload.customData.order_id,
      };
    }

    const requestBody: Record<string, any> = {
      data: [eventData],
    };

    if (testCode) {
      requestBody.test_event_code = testCode;
    }

    const endpoint = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("[Meta CAPI Error]", result);
      return { success: false, error: result.error?.message || "CAPI Request failed" };
    }

    return { success: true, data: result };
  } catch (err: any) {
    console.error("[Meta CAPI Exception]", err);
    return { success: false, error: err.message };
  }
}
