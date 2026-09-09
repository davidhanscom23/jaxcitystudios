import { PAYMENTS, paypalApiBase, paypalConfigured } from "@/lib/payments";

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  if (!paypalConfigured()) {
    throw new Error(
      "PayPal is not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.",
    );
  }
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }

  const auth = Buffer.from(
    `${PAYMENTS.paypalClientId}:${PAYMENTS.paypalSecret}`,
  ).toString("base64");

  const res = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export async function createPayPalOrder(input: {
  amount: number;
  bookingId: string;
  description: string;
}): Promise<{ id: string }> {
  const token = await getPayPalAccessToken();
  const value = input.amount.toFixed(2);

  const res = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.bookingId,
          description: input.description.slice(0, 127),
          custom_id: input.bookingId,
          amount: {
            currency_code: "USD",
            value,
          },
        },
      ],
      application_context: {
        brand_name: "JaxCity Studios",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed: ${text}`);
  }

  return (await res.json()) as { id: string };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  id: string;
  status: string;
  bookingId?: string;
}> {
  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed: ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    status: string;
    purchase_units?: { custom_id?: string; reference_id?: string }[];
  };

  return {
    id: data.id,
    status: data.status,
    bookingId:
      data.purchase_units?.[0]?.custom_id ||
      data.purchase_units?.[0]?.reference_id,
  };
}
