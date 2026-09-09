"use client";

import { useEffect, useRef } from "react";

type Props = {
  disabled?: boolean;
  onChange: (dataUrl: string) => void;
};

/** Lightweight canvas signature pad — no extra dependencies. */
export function SignaturePad({ disabled, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const snapshot = canvas.toDataURL();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#f4f1ea";
      ctx.fillStyle = "#0b0b0f";
      ctx.fillRect(0, 0, rect.width, rect.height);
      if (snapshot.startsWith("data:image")) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
        img.src = snapshot;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(e.pointerId);
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || disabled) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end() {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, rect.width, rect.height);
    onChange("");
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        className="h-36 w-full touch-none rounded-md border border-rule bg-ink"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
      />
      <button
        type="button"
        className="mt-2 font-caps text-[18px] text-muted hover:text-paper"
        onClick={clear}
        disabled={disabled}
      >
        Clear signature
      </button>
    </div>
  );
}
