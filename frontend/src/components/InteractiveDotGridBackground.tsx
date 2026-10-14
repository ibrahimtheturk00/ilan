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
  isCluster: boolean;
  // Kendiliğinden random yanma (spontaneous twinkling flare)
  isFlaring: boolean;
  flareStartTime: number;
  flareDuration: number;
  flareMaxBoost: number;
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

    // Initialize dot grid with solid visibility across every cell
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

          // Organic harmonic variation across the matrix
          const clusterHarmonic =
            Math.sin(c * 0.28) * Math.cos(r * 0.22) +
            Math.sin((c + r) * 0.16) * 0.6;
          const isCluster = clusterHarmonic > 0.42;

          // All dots have solid, crisp baseline visibility (no vanishing dots)
          const baseRadius = isCluster ? 1.8 : 1.35;
          const baseOpacity = isCluster ? 0.55 : 0.32;

          newDots.push({
            x,
            y,
            baseRadius,
            baseOpacity,
            isCluster,
            isFlaring: false,
            flareStartTime: 0,
            flareDuration: 0,
            flareMaxBoost: 0,
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
      const speed = 420; // px per second

      wavesRef.current.push({
        id: nextWaveIdRef.current++,
        x,
        y,
        startTime: performance.now(),
        maxRadius,
        speed,
      });

      if (wavesRef.current.length > 8) {
        wavesRef.current.shift();
      }
    };

    // Click/touch listener on container
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.closest("button") || target.closest("a") || target.closest("input"))) {
        return;
      }
      triggerWaveAt(e.clientX, e.clientY);
    };

    container.addEventListener("pointerdown", handlePointerDown);

    // Animation loop
    const render = (currentTime: number) => {
      const bgColor = isDark ? "#08090d" : "#f8f9fc";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      // Filter active click waves
      const activeWaves: {
        x: number;
        y: number;
        radius: number;
        maxRadius: number;
        pulseAlpha: number;
      }[] = [];

      const survivingWaves: Wave[] = [];
      for (let i = 0; i < wavesRef.current.length; i++) {
        const w = wavesRef.current[i];
        const ageSec = (currentTime - w.startTime) * 0.001;
        const radius = ageSec * w.speed;

        if (radius < w.maxRadius && ageSec < 3.0) {
          survivingWaves.push(w);
          const pulseAlpha = Math.max(0, 1 - ageSec / 0.45);
          activeWaves.push({
            x: w.x,
            y: w.y,
            radius,
            maxRadius: w.maxRadius,
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
            flashGrad.addColorStop(0, `rgba(255, 255, 255, ${aw.pulseAlpha * 0.4})`);
            flashGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          } else {
            flashGrad.addColorStop(0, `rgba(15, 23, 42, ${aw.pulseAlpha * 0.25})`);
            flashGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
          }
          ctx.fillStyle = flashGrad;
          ctx.beginPath();
          ctx.arc(aw.x, aw.y, Math.min(90, aw.radius * 0.8 + 10), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 1. Spontaneous random twinkling / flares management
      if (!prefersReducedMotion && dots.length > 0) {
        // Count currently flaring dots
        let flaringCount = 0;
        for (let i = 0; i < dots.length; i++) {
          if (dots[i].isFlaring) flaringCount++;
        }

        // Target: 18 - 30 dots spontaneously flaring across the grid at any moment
        const targetFlares = Math.min(30, Math.max(12, Math.floor(dots.length * 0.035)));
        const neededFlares = targetFlares - flaringCount;

        if (neededFlares > 0 && Math.random() < 0.65) {
          const toAdd = Math.min(neededFlares, 3);
          for (let k = 0; k < toAdd; k++) {
            const randomIndex = Math.floor(Math.random() * dots.length);
            const dot = dots[randomIndex];
            if (!dot.isFlaring) {
              dot.isFlaring = true;
              dot.flareStartTime = currentTime;
              dot.flareDuration = 1000 + Math.random() * 1800; // 1s - 2.8s
              dot.flareMaxBoost = 0.55 + Math.random() * 0.45;
            }
          }
        }
      }

      // 2. Draw all dots
      const waveBandWidth = 75; // px

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];

        // Flare calculation
        let flareFactor = 0;
        if (dot.isFlaring) {
          const progress = (currentTime - dot.flareStartTime) / dot.flareDuration;
          if (progress >= 1.0) {
            dot.isFlaring = false;
          } else {
            // Smooth bell curve flare
            flareFactor = Math.sin(progress * Math.PI) * dot.flareMaxBoost;
          }
        }

        // Radial wave boost from clicks
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

        const totalBoost = Math.max(flareFactor, waveIntensity);

        // Dynamic radius and opacity
        const finalRadius = dot.baseRadius + totalBoost * 1.6;
        let finalOpacity = Math.min(1.0, dot.baseOpacity + totalBoost * 0.75);

        // If strongly flaring, draw soft surrounding halo
        if (totalBoost > 0.4) {
          const haloRadius = finalRadius * 3.5;
          const haloGrad = ctx.createRadialGradient(
            dot.x,
            dot.y,
            0,
            dot.x,
            dot.y,
            haloRadius
          );
          if (isDark) {
            haloGrad.addColorStop(0, `rgba(255, 255, 255, ${totalBoost * 0.35})`);
            haloGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          } else {
            haloGrad.addColorStop(0, `rgba(15, 23, 42, ${totalBoost * 0.22})`);
            haloGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
          }
          ctx.fillStyle = haloGrad;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, haloRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main dot render
        if (isDark) {
          if (totalBoost > 0.15) {
            ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
          } else if (dot.isCluster) {
            ctx.fillStyle = `rgba(241, 245, 249, ${finalOpacity})`;
          } else {
            ctx.fillStyle = `rgba(203, 213, 225, ${finalOpacity})`;
          }
        } else {
          if (totalBoost > 0.15) {
            ctx.fillStyle = `rgba(15, 23, 42, ${finalOpacity})`;
          } else if (dot.isCluster) {
            ctx.fillStyle = `rgba(51, 65, 85, ${finalOpacity})`;
          } else {
            ctx.fillStyle = `rgba(100, 116, 139, ${finalOpacity})`;
          }
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, finalRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
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
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
