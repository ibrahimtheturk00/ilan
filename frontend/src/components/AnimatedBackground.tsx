"use client";

import { useEffect, useState } from "react";

export function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-opacity duration-1000"
    >
      {/* 1. Ethereal Top-Left Orb: Cyan / Sky / Blue Aura */}
      <div
        className="absolute -top-[12%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-br from-sky-400/25 via-blue-500/20 to-transparent dark:from-sky-600/20 dark:via-blue-800/20 blur-[100px] sm:blur-[130px] animate-float-slow"
      />

      {/* 2. Ethereal Top-Right Orb: Violet / Royal Purple Aura */}
      <div
        className="absolute -top-[8%] -right-[8%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-bl from-purple-400/25 via-indigo-500/20 to-transparent dark:from-purple-700/25 dark:via-indigo-900/20 blur-[110px] sm:blur-[140px] animate-float-reverse"
      />

      {/* 3. Ethereal Bottom-Left Orb: Emerald / Teal Fresh Aurora */}
      <div
        className="absolute top-[45%] -left-[12%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-500/15 to-transparent dark:from-emerald-600/15 dark:via-teal-800/15 blur-[120px] sm:blur-[150px] animate-float-slow-2"
      />

      {/* 4. Center-Right Warmth Orb: Soft Rose / Coral Ambient Breath */}
      <div
        className="absolute top-[60%] -right-[10%] w-[48vw] h-[48vw] max-w-[580px] max-h-[580px] rounded-full bg-gradient-to-tl from-rose-400/15 via-pink-400/10 to-transparent dark:from-rose-700/15 dark:via-indigo-950/20 blur-[120px] sm:blur-[150px] animate-float-slow"
      />

      {/* 5. Bottom Center Soft Horizon Glow */}
      <div
        className="absolute -bottom-[15%] left-[25%] w-[50vw] h-[35vw] max-w-[700px] rounded-full bg-gradient-to-t from-brand-400/15 via-indigo-400/10 to-transparent dark:from-brand-600/15 dark:via-purple-900/10 blur-[110px] sm:blur-[130px] animate-float-reverse"
      />

      {/* 6. Dot Matrix Pattern with Radial Vignette */}
      <div
        className="absolute inset-0 bg-dot-pattern opacity-60 dark:opacity-35 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
      />
    </div>
  );
}
