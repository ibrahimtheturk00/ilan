"use client";

import React, { useEffect, useRef, useState } from "react";

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shortestAngle(a: number): number {
  const T = Math.PI * 2;
  let r = (((a + Math.PI) % T) + T) % T - Math.PI;
  if (r === -Math.PI) r = Math.PI;
  return r;
}

// Exactly the arrow glyph drawing function from the Onward Summit template
function drawArrowGlyph(ctx: CanvasRenderingContext2D, s: number) {
  const h = s * 0.31;
  const c = s / 2;
  ctx.beginPath();
  ctx.moveTo(c - h, c + h);
  ctx.lineTo(c + h, c - h);
  ctx.moveTo(c - h * 0.15, c - h);
  ctx.lineTo(c + h, c - h);
  ctx.lineTo(c + h, c + h * 0.15);
  ctx.stroke();
}

export function OnwardSummitBackground() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // Palette:
    // Dark mode: Refined steel/slate gray (#94a3b8) with crisp contrast against dark background
    // Light mode: Deep charcoal slate (#475569) for clearer, darker visibility
    const arrowColor = isDark ? "#94a3b8" : "#475569";

    let W = 0;
    let H = 0;
    let dpr = 1;
    const cell = 18;
    let n = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let wl = new Float32Array(0);
    let grain = new Float32Array(0);
    let ang = new Float32Array(0);
    let scl = new Float32Array(0);
    let sprite: HTMLCanvasElement | null = null;
    const ptr = { x: 0, y: 0, on: false };
    const ripples: { x: number; y: number; t0: number }[] = [];
    let raf = 0;
    let visible = true;
    const half = cell / 2;

    const createSprite = (color: string) => {
      const c = document.createElement("canvas");
      const px = Math.ceil(cell * dpr * 2);
      c.width = c.height = px;
      const g = c.getContext("2d");
      if (!g) return c;
      g.scale(px / cell, px / cell);
      g.strokeStyle = color;
      g.lineWidth = Math.max(1.3, cell * 0.11);
      g.lineCap = "round";
      g.lineJoin = "round";
      drawArrowGlyph(g, cell);
      return c;
    };

    const layout = () => {
      const r = wrap.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + "px";
      cv.style.height = H + "px";

      const cols = Math.ceil(W / cell) + 1;
      const rows = Math.ceil(H / cell) + 1;
      n = cols * rows;
      xs = new Float32Array(n);
      ys = new Float32Array(n);
      wl = new Float32Array(n);
      grain = new Float32Array(n);
      ang = new Float32Array(n);
      scl = new Float32Array(n).fill(1);

      const ox = (W - (cols - 1) * cell) / 2;
      const oy = (H - (rows - 1) * cell) / 2;
      const rand = mulberry32(cols * 977 + rows);

      for (let j = 0, k = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++, k++) {
          const x = ox + i * cell;
          const y = oy + j * cell;
          const u = x / W;
          const v = y / H;

          // Atmospheric distribution - sayfanın en altına kadar kesintisiz ve net devam eder
          const topFade = smoothstep(0, 0.06, v);
          const edgeSoft = smoothstep(0, 0.02, u) * smoothstep(0, 0.02, 1 - u);
          const weight = 0.28 * topFade * edgeSoft;

          xs[k] = x;
          ys[k] = y;
          wl[k] = weight;
          grain[k] = 0.6 + 0.4 * rand();
        }
      }

      sprite = createSprite(arrowColor);
    };

    const draw = (t: number) => {
      if (!sprite) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);

      const R = 180;
      const R2 = R * R;

      for (let q = ripples.length - 1; q >= 0; q--) {
        if (t - ripples[q].t0 > 1900) ripples.splice(q, 1);
      }

      for (let i = 0; i < n; i++) {
        const a0 = wl[i];
        if (a0 < 0.005) continue;

        const x = xs[i];
        const y = ys[i];
        let tA = 0;
        let tS = 1;
        let boost = 0;

        // Pointer reaction: arrows rotate and lean toward mouse position
        if (ptr.on) {
          const dx = x - ptr.x;
          const dy = y - ptr.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            let w = 1 - Math.sqrt(d2) / R;
            w = w * w * (3 - 2 * w);
            tA = shortestAngle(Math.atan2(dy, dx) + Math.PI / 4) * w;
            tS = 1 + 0.6 * w;
            boost = 0.45 * w;
          }
        }

        // Click ripple waves
        for (const rp of ripples) {
          const age = t - rp.t0;
          const dx = x - rp.x;
          const dy = y - rp.y;
          const dd = Math.abs(Math.sqrt(dx * dx + dy * dy) - age * 0.58);
          if (dd < 52) {
            const k = (1 - dd / 52) * (1 - age / 1900);
            tS += 0.8 * k;
            boost += 0.6 * k;
            tA += shortestAngle(Math.atan2(dy, dx) + Math.PI / 4) * k * 0.5;
          }
        }

        ang[i] += (tA - ang[i]) * 0.12;
        scl[i] += (tS - scl[i]) * 0.16;

        const shimmer = 0.88 + 0.12 * Math.sin((x + y * 0.8) * 0.009 - t * 0.001);
        const g = grain[i] * shimmer;
        // Noticeably darker, richer visibility
        const opacity = clamp((a0 + boost) * g * (isDark ? 0.55 : 0.48), 0, isDark ? 0.85 : 0.75);

        if (opacity < 0.02) continue;

        const a = ang[i];
        const s = scl[i];

        if (Math.abs(a) < 0.003 && Math.abs(s - 1) < 0.003) {
          ctx.setTransform(dpr, 0, 0, dpr, dpr * x, dpr * y);
        } else {
          const c = Math.cos(a) * s * dpr;
          const sn = Math.sin(a) * s * dpr;
          ctx.setTransform(c, sn, -sn, c, dpr * x, dpr * y);
        }

        ctx.globalAlpha = opacity;
        ctx.drawImage(sprite, -half, -half, cell, cell);
      }
      ctx.globalAlpha = 1;
    };

    // Reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        draw(performance.now());
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    const loop = (t: number) => {
      raf = 0;
      draw(t);
      if (visible && !prefersReducedMotion) raf = requestAnimationFrame(loop);
    };

    layout();
    draw(performance.now());
    if (!prefersReducedMotion) {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      layout();
      draw(performance.now());
    };
    window.addEventListener("resize", onResize);

    const onPointerMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const r = wrap.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.on = true;
    };

    const onPointerLeave = () => {
      ptr.on = false;
    };

    const onPointerDown = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      const r = wrap.getBoundingClientRect();
      ripples.push({
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        t0: performance.now(),
      });
      if (ripples.length > 4) ripples.shift();
    };

    window.addEventListener("mousemove", onPointerMove);
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("mousedown", onPointerDown);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      mediaQuery.removeEventListener("change", handleMotionChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [mounted, isDark]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
    >
      {/* 
        Onward Summit Hero Gradient Atmosphere (Neutral Slate / Dark):
        Dark Mode: Charcoal/Midnight graphite (#080b12) fading to dark slate (#0F1117)
        Light Mode: Clean platinum/zinc tone fading into paper linen (#F7F7F5)
      */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-200/50 via-zinc-100/25 to-transparent dark:from-[#0a0f1d]/60 dark:via-[#090d18]/40 dark:to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-zinc-400/10 via-zinc-500/5 to-transparent dark:from-slate-600/15 dark:via-zinc-500/8 dark:to-transparent rounded-full blur-3xl opacity-75" />

      {/* Interactive Glyph Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}