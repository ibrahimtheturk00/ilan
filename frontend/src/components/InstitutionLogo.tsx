"use client";

import React, { useState } from "react";
import Image from "next/image";
import { resolveInstitutionLogo } from "@/lib/institutionLogoResolver";

export type InstitutionType =
  | "ministry"
  | "justice"
  | "defense"
  | "health"
  | "university"
  | "municipality"
  | "iskur"
  | "finance"
  | "development"
  | "general";

export function detectInstitutionType(institution?: string | null): InstitutionType {
  if (!institution || !institution.trim()) return "general";

  const norm = institution
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

  if (
    norm.includes("adalet") ||
    norm.includes("yargitay") ||
    norm.includes("danistay") ||
    norm.includes("mahkeme") ||
    norm.includes("cezaevi") ||
    norm.includes("icra")
  ) {
    return "justice";
  }

  if (
    norm.includes("milli savunma") ||
    norm.includes("msb") ||
    norm.includes("kara kuvvetleri") ||
    norm.includes("deniz kuvvetleri") ||
    norm.includes("hava kuvvetleri") ||
    norm.includes("jandarma") ||
    norm.includes("emniyet") ||
    norm.includes("polis") ||
    norm.includes("sahil guvenlik") ||
    norm.includes("savunma sanayii")
  ) {
    return "defense";
  }

  if (
    norm.includes("saglik") ||
    norm.includes("hastane") ||
    norm.includes("tip") ||
    norm.includes("hemsire") ||
    norm.includes("tabip")
  ) {
    return "health";
  }

  if (
    norm.includes("universite") ||
    norm.includes("rektorluk") ||
    norm.includes("fakulte") ||
    norm.includes("enstitu") ||
    norm.includes("yok")
  ) {
    return "university";
  }

  if (
    norm.includes("belediye") ||
    norm.includes("belediyesi") ||
    norm.includes("personel as") ||
    norm.includes("belka") ||
    norm.includes("iett") ||
    norm.includes("iski") ||
    norm.includes("aski")
  ) {
    return "municipality";
  }

  if (
    norm.includes("iskur") ||
    norm.includes("is kurumu") ||
    norm.includes("sgk") ||
    norm.includes("sosyal guvenlik") ||
    norm.includes("calisma ve sosyal")
  ) {
    return "iskur";
  }

  if (
    norm.includes("hazine ve maliye") ||
    norm.includes("bddk") ||
    norm.includes("spk") ||
    norm.includes("tmsf") ||
    norm.includes("kamu ihale") ||
    norm.includes("rekabet kurumu") ||
    norm.includes("turk patent") ||
    norm.includes("merkez bankasi") ||
    norm.includes("gelir idaresi")
  ) {
    return "finance";
  }

  if (norm.includes("kalkinma ajansi") || norm.includes("ajansi")) {
    return "development";
  }

  if (
    norm.includes("bakanlik") ||
    norm.includes("bakanligi") ||
    norm.includes("cumhurbaskanligi") ||
    norm.includes("valilik") ||
    norm.includes("kaymakamlik")
  ) {
    return "ministry";
  }

  return "general";
}

interface InstitutionLogoProps {
  institution?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function InstitutionLogo({ institution, className = "", size = "md" }: InstitutionLogoProps) {
  const [imgError, setImgError] = useState(false);
  const realLogoPath = resolveInstitutionLogo(institution);
  const type = detectInstitutionType(institution);

  // Strictly identical outer container bounds
  const containerSizeClasses =
    size === "sm"
      ? "w-7 h-7 min-w-[28px] min-h-[28px]"
      : size === "lg"
      ? "w-12 h-12 min-w-[48px] min-h-[48px]"
      : "w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px]";

  const iconSizeClasses =
    size === "sm" ? "w-5 h-5" : size === "lg" ? "w-8 h-8" : "w-6 h-6 sm:w-7 sm:h-7";

  const imgPx = size === "sm" ? 28 : size === "lg" ? 48 : 40;

  return (
    <div
      className={`rounded-lg flex items-center justify-center shrink-0 border overflow-hidden select-none transition-transform bg-white dark:bg-zinc-800 border-zinc-200/90 dark:border-zinc-700/80 shadow-xs ${containerSizeClasses} ${className}`}
      title={institution || "Kamu Kurumu"}
    >
      {realLogoPath && !imgError ? (
        <img
          src={realLogoPath}
          alt={institution || "Kurum Logosu"}
          width={imgPx}
          height={imgPx}
          loading="lazy"
          className="w-full h-full object-contain p-1 rounded-md"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Simgesel Vektörel Kurum Mührü Fallback */
        <>
          {type === "justice" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#781010" />
              <circle cx="24" cy="24" r="20" stroke="#F1D28C" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M24 10v26M18 36h12" stroke="#F1D28C" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M14 16h20" stroke="#F1D28C" strokeWidth="2" strokeLinecap="round" />
              <path d="M14 16l-4 7h8l-4-7z" fill="#F1D28C" />
              <path d="M34 16l-4 7h8l-4-7z" fill="#F1D28C" />
              <circle cx="24" cy="8.5" r="2.5" fill="#e3e3e3" />
            </svg>
          )}

          {type === "defense" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#0C2340" />
              <circle cx="24" cy="24" r="20" stroke="#C59B27" strokeWidth="1.5" />
              <path d="M15 33L33 15M33 33L15 15" stroke="#C59B27" strokeWidth="2" strokeLinecap="round" />
              <path d="M24 13c5 0 9 3 9 9 0 7-9 13-9 13s-9-6-9-13c0-6 4-9 9-9z" fill="#0C2340" stroke="#C59B27" strokeWidth="1.8" />
              <circle cx="24" cy="21" r="4" fill="#E11D48" />
              <path d="M24 19l.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#e3e3e3" />
            </svg>
          )}

          {type === "health" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#E11D48" />
              <circle cx="24" cy="24" r="20" stroke="#e3e3e3" strokeWidth="1.5" />
              <path d="M29 16a9 9 0 100 16 11 11 0 110-16z" fill="#e3e3e3" />
              <path d="M24 12v24M21 16c2-2 4-2 6 0s-2 4-4 6 4 4 4 6-4 4-6 0" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <circle cx="24" cy="11" r="2.5" fill="#F59E0B" />
            </svg>
          )}

          {type === "university" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#4338CA" />
              <circle cx="24" cy="24" r="20" stroke="#A5B4FC" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M12 28c4-2 8-1 12 2 4-3 8-4 12-2v-11c-4-2-8-1-12 2-4-3-8-4-12-2v11z" fill="#e3e3e3" fillOpacity="0.95" />
              <path d="M24 15v15" stroke="#4338CA" strokeWidth="1.8" />
              <path d="M24 9c2 2 3 4 1 6-2-2-3-4-1-6z" fill="#F59E0B" />
              <path d="M22 15h4v3h-4z" fill="#CBD5E1" />
            </svg>
          )}

          {type === "municipality" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#0284C7" />
              <circle cx="24" cy="24" r="20" stroke="#BAE6FD" strokeWidth="1.5" />
              <path d="M15 31V21l3-2 3 2v-2l3-2 3 2v2l3-2 3 2v10H15z" fill="#e3e3e3" />
              <path d="M21 31v-5a3 3 0 016 0v5h-6z" fill="#0284C7" />
              <circle cx="24" cy="14" r="3.5" fill="#FDE047" />
            </svg>
          )}

          {type === "iskur" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#0D9488" />
              <circle cx="24" cy="24" r="20" stroke="#99F6E4" strokeWidth="1.5" />
              <path d="M14 26l7-7 6 6 7-7" stroke="#e3e3e3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="15" r="3" fill="#FDE047" />
              <path d="M18 32h12" stroke="#e3e3e3" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}

          {type === "finance" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#B45309" />
              <circle cx="24" cy="24" r="20" stroke="#FDE68A" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="12" fill="#D97706" stroke="#FEF3C7" strokeWidth="1.8" />
              <path d="M24 16v16M20 20h8M19 28h10" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}

          {type === "development" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#059669" />
              <circle cx="24" cy="24" r="20" stroke="#A7F3D0" strokeWidth="1.5" />
              <path d="M24 11l3 10 10 3-10 3-3 10-3-10-10-3 10-3 3-10z" fill="#e3e3e3" />
              <circle cx="24" cy="24" r="2.5" fill="#059669" />
            </svg>
          )}

          {type === "ministry" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#B91C1C" />
              <circle cx="24" cy="24" r="19.5" stroke="#FCD34D" strokeWidth="1.5" />
              <circle cx="24" cy="24" r="14" fill="#991B1B" />
              <path d="M24 17a6 6 0 100 12 7.5 7.5 0 110-12z" fill="#e3e3e3" />
              <path d="M27 21l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="#e3e3e3" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x = 24 + 17 * Math.cos(rad);
                const y = 24 + 17 * Math.sin(rad);
                return <circle key={i} cx={x} cy={y} r="1.3" fill="#FCD34D" />;
              })}
            </svg>
          )}

          {type === "general" && (
            <svg viewBox="0 0 48 48" fill="none" className={iconSizeClasses}>
              <circle cx="24" cy="24" r="22" fill="#1E293B" />
              <circle cx="24" cy="24" r="20" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 2" />
              <path d="M23 15a8 8 0 100 16 10 10 0 110-16z" fill="#F8FAFC" />
              <path d="M28 21.5l.8 1.6 1.8.3-1.3 1.3.3 1.8-1.6-.9-1.6.9.3-1.8-1.3-1.3 1.8-.3z" fill="#F8FAFC" />
            </svg>
          )}
        </>
      )}
    </div>
  );
}
