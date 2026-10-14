"use client";

import React from "react";

interface CornerFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  size?: number; // Köşe çizgisinin uzunluğu (px, varsayılan: 13)
  strokeWidth?: number; // Çizgi kalınlığı (px, varsayılan: 1.5)
}

/**
 * Modern minimalist HUD köşe çerçevesi (Corner Frame).
 * Dört köşede L şeklinde ayrık köşe çizgileri (┌ ┐ └ ┘) çizer.
 * CSS mask ve pseudo-element'ler ile hafif ve performanslı çalışır.
 */
export function CornerFrame({
  children,
  className = "",
  size = 13,
  strokeWidth = 1.5,
  style,
  ...props
}: CornerFrameProps) {
  const dynamicStyle: React.CSSProperties = {
    ...style,
    // CSS custom properties to adjust corner bracket dimensions dynamically
    ["--corner-size" as string]: `${size}px`,
    ["--corner-w" as string]: `${strokeWidth}px`,
  };

  return (
    <div className={`tech-corner-card ${className}`} style={dynamicStyle} {...props}>
      {children}
    </div>
  );
}
