"use client";

import { useEffect } from "react";

/** Registers the book-app service worker (installability + light offline shell). */
export function BookAppServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/book-app-sw.js", { scope: "/app" }).catch(() => {
      /* non-blocking */
    });
  }, []);
  return null;
}
