export interface UddoktaPayConfig {
  baseUrl: string;
  apiKey: string;
}

export function getUddoktaPayConfig(): UddoktaPayConfig {
  return {
    baseUrl: process.env.UDDOKTAPAY_BASE_URL || "https://evorise.paymently.io",
    apiKey: process.env.UDDOKTAPAY_API_KEY || "",
  };
}

export interface CreateUddoktaPayParams {
  fullName: string;
  email: string;
  amount: number;
  metadata: {
    courseId: string;
    userId: string;
    [key: string]: any;
  };
  redirectUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface UddoktaPayResponse {
  status: boolean;
  message?: string;
  payment_url?: string;
}

/**
 * Initiates an automated checkout session with UddoktaPay / Paymently
 */
export async function createUddoktaPayCheckout(params: CreateUddoktaPayParams): Promise<UddoktaPayResponse> {
  const config = getUddoktaPayConfig();
  const url = `${config.baseUrl.replace(/\/+$/, "")}/api/checkout-v2`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": config.apiKey,
    },
    body: JSON.stringify({
      full_name: params.fullName,
      email: params.email,
      amount: params.amount,
      metadata: params.metadata,
      redirect_url: params.redirectUrl,
      cancel_url: params.cancelUrl,
      webhook_url: params.webhookUrl,
    }),
  });

  return await response.json();
}

/**
 * Verifies payment from UddoktaPay using the invoice_id
 */
export async function verifyUddoktaPayPayment(invoiceId: string) {
  const config = getUddoktaPayConfig();
  const url = `${config.baseUrl.replace(/\/+$/, "")}/api/verify-payment`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "RT-UDDOKTAPAY-API-KEY": config.apiKey,
    },
    body: JSON.stringify({ invoice_id: invoiceId }),
  });

  return await response.json();
}
