"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight “Add to Home Screen” tip for iOS/Android when not already installed.
 */
export function InstallHint() {
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) return;
    if (sessionStorage.getItem("jaxcity-install-hint-dismissed")) return;

    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua);
    setIsIos(ios);
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-start gap-3 border border-rule bg-charcoal/95 px-3 py-2.5 text-sm text-paper-dim shadow-none backdrop-blur">
        <p className="flex-1 leading-snug">
          {isIos ? (
            <>
              Add to Home Screen: tap Share, then{" "}
              <span className="text-paper">Add to Home Screen</span> — opens as
              JaxCity Book.
            </>
          ) : (
            <>
              Install JaxCity Book: open the browser menu and choose{" "}
              <span className="text-paper">Install app</span> /{" "}
              <span className="text-paper">Add to Home screen</span>.
            </>
          )}
        </p>
        <button
          type="button"
          className="font-caps text-[0.62rem] tracking-[0.14em] text-muted"
          onClick={() => {
            sessionStorage.setItem("jaxcity-install-hint-dismissed", "1");
            setShow(false);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
