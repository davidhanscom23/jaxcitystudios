"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: Record<string, unknown>) => {
        render: (el: HTMLElement) => Promise<void>;
      };
    };
  }
}

type Props = {
  clientId: string;
  deposit: number;
  createOrder: () => Promise<{ orderId: string; bookingId: string }>;
  onApproved: (info: { orderId: string; bookingId: string }) => Promise<void>;
  onError: (message: string) => void;
};

/**
 * PayPal JS SDK buttons with Venmo funding enabled (US).
 * Loads the SDK once and renders PayPal + Venmo buttons.
 */
export function PayPalDepositButtons({
  clientId,
  deposit,
  createOrder,
  onApproved,
  onError,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loadingSdk, setLoadingSdk] = useState(true);

  useEffect(() => {
    if (!clientId) {
      setLoadingSdk(false);
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-jaxcity-paypal]",
    );
    if (existing && window.paypal) {
      setReady(true);
      setLoadingSdk(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=USD&intent=capture&enable-funding=venmo&components=buttons`;
    script.async = true;
    script.dataset.jaxcityPaypal = "1";
    script.onload = () => {
      setReady(true);
      setLoadingSdk(false);
    };
    script.onerror = () => {
      setLoadingSdk(false);
      onError("Could not load PayPal. Check your client ID.");
    };
    document.body.appendChild(script);
  }, [clientId, onError]);

  useEffect(() => {
    if (!ready || !window.paypal || !hostRef.current) return;
    const el = hostRef.current;
    el.innerHTML = "";

    let bookingId = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        },
        createOrder: async () => {
          const created = await createOrder();
          bookingId = created.bookingId;
          return created.orderId;
        },
        onApprove: async (data: { orderID: string }) => {
          await onApproved({ orderId: data.orderID, bookingId });
        },
        onError: (err: Error) => {
          onError(err?.message || "PayPal checkout error");
        },
        onCancel: () => {
          onError("Payment canceled — the hold can be released from Book again if needed.");
        },
      })
      .render(el)
      .catch((err: Error) => onError(err.message || "PayPal render failed"));
  }, [ready, createOrder, onApproved, onError, deposit]);

  if (!clientId) {
    return (
      <p className="text-sm text-accent">
        PayPal client ID missing. Set{" "}
        <code className="text-paper-dim">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      {loadingSdk && (
        <p className="text-sm text-muted">Loading PayPal / Venmo…</p>
      )}
      <div ref={hostRef} className="min-h-[3rem]" />
      <p className="font-caps text-[0.6rem] text-muted">
        PayPal Checkout · Venmo appears for eligible US payers
      </p>
    </div>
  );
}
