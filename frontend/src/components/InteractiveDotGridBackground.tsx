"use client";

import React, { useEffect, useRef } from "react";

interface Wave {
  id: number;
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
  speed: number;
}

interface Dot {
  x: number;
  y: number;
  baseRadius: number;
  baseOpacity: number;
  phase: number;
  freq: number;
  isBrightCluster: boolean;
}

interface InteractiveDotGridBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function InteractiveDotGridBackground({
  className = "",
  children,
}: InteractiveDotGridBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const nextWaveIdRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isDark = document.documentElement.classList.contains("dark");

    // Reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionChange);

    // Watch for theme changes (dark / light class toggle on <html>)
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Generate regular grid with natural organic clusters
    const initGrid = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = Math.max(rect.height, 650);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Dot spacing: 30px on desktop, 24px on mobile
      const gap = width < 640 ? 24 : 30;
      const cols = Math.floor(width / gap) + 1;
      const rows = Math.floor(height / gap) + 1;
      const offsetX = (width - (cols - 1) * gap) / 2;
      const offsetY = (height - (rows - 1) * gap) / 2;

      const newDots: Dot[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = offsetX + c * gap;
          const y = offsetY + r * gap;

          // Organic clusters using smooth 2D trigonometric harmonic waves
          // (creates undulating bright curves like the reference image)
          const clusterHarmonic =
            Math.sin(c * 0.28) * Math.cos(r * 0.22) +
            Math.sin((c + r) * 0.16) * 0.6;
          const isBright = clusterHarmonic > 0.42;

          let baseRadius: number;
          let baseOpacity: number;

          if (isBright) {
            baseRadius = 1.8 + Math.sin(c * 7 + r * 11) * 0.4; // 1.4px - 2.2px
            baseOpacity = 0.55 + Math.cos(c * 3 + r * 5) * 0.25; // 0.35 - 0.80
          } else {
            baseRadius = 0.95 + Math.sin(c * 5 + r * 3) * 0.2; // 0.8px - 1.15px
            baseOpacity = 0.14 + Math.sin(c * 9 + r * 7) * 0.08; // 0.08 - 0.22
          }

          newDots.push({
            x,
            y,
            baseRadius,
            baseOpacity,
            phase: (c * 17 + r * 23) % 100,
            freq: 0.8 + ((c * 7 + r * 13) % 7) * 0.12,
            isBrightCluster: isBright,
          });
        }
      }

      dots = newDots;
    };

    initGrid();

    // Resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        initGrid();
      }, 100);
    };
    window.addEventListener("resize", handleResize);

    // Wave creation function
    const triggerWaveAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const maxRadius = Math.hypot(width, height) * 1.1;
      const speed = 400; // px per second

      wavesRef.current.push({
        id: nextWaveIdRef.current++,
        x,
        y,
        startTime: performance.now(),
        maxRadius,
        speed,
      });

      // Keep maximum 8 concurrent waves for optimal performance
      if (wavesRef.current.length > 8) {
        wavesRef.current.shift();
      }
    };

    // Click/touch listener on the container
    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger if user explicitly clicked an interactive control (button, input, link)
      const target = e.target as HTMLElement | null;
      if (target && (target.closest("button") || target.closest("a") || target.closest("input"))) {
        return;
      }
      triggerWaveAt(e.clientX, e.clientY);
    };

    container.addEventListener("pointerdown", handlePointerDown);

    // Main animation loop
    let lastTime = performance.now();

    const render = (currentTime: number) => {
      // Background colors
      // Dark: deeply saturated dark graphite (#090a10)
      // Light: refined off-white / porcelain (#f8f9fc)
      const bgColor = isDark ? "#08090d" : "#f8f9fc";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const elapsedGlobalSec = currentTime * 0.001;

      // Filter active waves
      const activeWaves: {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        age: number;
        pulseAlpha: number;
      }[] = [];

      const currentWaves = wavesRef.current;
      const survivingWaves: Wave[] = [];

      for (let i = 0; i < currentWaves.length; i++) {
        const w = currentWaves[i];
        const ageSec = (currentTime - w.startTime) * 0.001;
        const radius = ageSec * w.speed;

        if (radius < w.maxRadius && ageSec < 3.0) {
          survivingWaves.push(w);
          const pulseAlpha = Math.max(0, 1 - ageSec / 0.45); // initial flash at epicenter
          activeWaves.push({
            x: w.x,
            y: w.y,
            radius,
            maxRadius: w.maxRadius,
            age: ageSec,
            pulseAlpha,
          });
        }
      }
      wavesRef.current = survivingWaves;

      // Draw epicenter flash pulses
      for (let i = 0; i < activeWaves.length; i++) {
        const aw = activeWaves[i];
        if (aw.pulseAlpha > 0.01) {
          const flashGrad = ctx.createRadialGradient(
            aw.x,
            aw.y,
            0,
            aw.x,
            aw.y,
            Math.min(90, aw.radius * 0.8 + 10)
          );
          if (isDark) {
            flashGrad.addColorStop(0, `rgba(255, 255, 255, ${aw.pulseAlpha * 0.35})`);
            flashGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          } else {
            flashGrad.addColorStop(0, `rgba(15, 23, 42, ${aw.pulseAlpha * 0.22})`);
            flashGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
          }
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(aw.x, aw.y, Math.min(90, aw.radius * 0.8 + 10), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Center coordinates for subtle vignette
      const centerX = width / 2;
      const centerY = height / 2;

      // Batch drawing dots
      const waveBandWidth = 75; // px

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // 1. Breathing light animation
        let breathing = 0;
        if (!prefersReducedMotion) {
          breathing = Math.sin(elapsedGlobalSec * dot.freq + dot.phase) * 0.12;
        }

        // 2. Center reading vignette
        const distFromCenter = Math.hypot(dot.x - centerX, (dot.y - centerY) * 1.25);
        let vignette = 1;
        if (distFromCenter < 280) {
          // Soft fade in the center so headlines and CTA stand out with maximum clarity
          vignette = 0.45 + 0.55 * (distFromCenter / 280);
        }

        // 3. Radial wave interaction boost
        let waveIntensity = 0;
        for (let w = 0; w < activeWaves.length; w++) {
          const wave = activeWaves[w];
          const distToWaveCenter = Math.hypot(dot.x - wave.x, dot.y - wave.y);
          const diff = Math.abs(distToWaveCenter - wave.radius);

          if (diff < waveBandWidth) {
            const distanceFactor = 1 - diff / waveBandWidth;
            const decay = Math.max(0, 1 - wave.radius / wave.maxRadius);
            const boost = distanceFactor * distanceFactor * decay;
            if (boost > waveIntensity) {
              waveIntensity = boost;
            }
          }
        }

        // Computed dynamic radius & opacity
        let finalRadius = dot.baseRadius + (waveIntensity > 0 ? waveIntensity * 1.5 : breathing * 0.25);
        let finalOpacity = (dot.baseOpacity + breathing) * vignette;

        if (waveIntensity > 0) {
          finalOpacity = Math.min(1.0, finalOpacity + waveIntensity * 0.82);
        }

        // Color palette
        if (isDark) {
          if (waveIntensity > 0.1) {
            // Illuminated by wave: bright pure white
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          } else if (dot.isBrightCluster) {
            // Bright cluster dots: crisp broken white
            ctx.fillStyle = `rgba(241, 245, 249, ${finalOpacity})`;
          } else {
            // Normal background dots: muted cool slate
            ctx.fillStyle = `rgba(148, 163, 184, ${finalOpacity})`;
          }
        } else {
          if (waveIntensity > 0.1) {
            // Illuminated by wave in light mode: deep slate / charcoal
            ctx.fillStyle = `rgba(15, 23, 42, ${finalOpacity})`;
          } else if (dot.isBrightCluster) {
            // Prominent dots in light mode: dark slate
            ctx.fillStyle = `rgba(51, 65, 85, ${finalOpacity})`;
          } else {
            // Subtle dots in light mode: soft gray
            ctx.fillStyle = `rgba(148, 163, 184, ${finalOpacity})`;
          }
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, Math.max(0.6, finalRadius), 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    // Pause animation when tab is inactive to preserve battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      mediaQuery.removeEventListener("change", handleMotionChange);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full pointer-events-none"
      />
      {/* Content wrapper with pointer events allowed */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
