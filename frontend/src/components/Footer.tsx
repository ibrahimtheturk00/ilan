"use client";

import { useEffect, useState } from "react";
import { 
  Mail, 
  Users, 
  ShieldCheck, 
  Landmark, 
  Scroll, 
  Briefcase, 
  Building2, 
  GraduationCap, 
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { trackUniqueVisitor, getCachedVisitorCount } from "@/lib/visitor";

// Resmî İlan Kaynakları - Glassmorphism Marquee Listesi
const OFFICIAL_SOURCES = [
  { name: "Kariyer Kapısı (CBİKO)", icon: GraduationCap, sub: "Cumhurbaşkanlığı İK Ofisi", domain: "kariyerkapisi.cbiko.gov.tr" },
  { name: "İlan.gov.tr", icon: Landmark, sub: "Basın İlan Kurumu", domain: "ilan.gov.tr" },
  { name: "SBB Kamu İlan", icon: Building2, sub: "Strateji ve Bütçe Bşk.", domain: "kamuilan.sbb.gov.tr" },
  { name: "İŞKUR Kamu İlanları", icon: Briefcase, sub: "Türkiye İş Kurumu", domain: "iskur.gov.tr" },
  { name: "Resmî Gazete", icon: Scroll, sub: "T.C. Cumhurbaşkanlığı", domain: "resmigazete.gov.tr" },
  { name: "YÖK Akademik", icon: GraduationCap, sub: "Yükseköğretim Kurulu", domain: "yok.gov.tr" },
  { name: "Adalet Bakanlığı", icon: ShieldCheck, sub: "Personel Genel Müd.", domain: "pgm.adalet.gov.tr" },
  { name: "Millî Savunma Bşk.", icon: Landmark, sub: "MSB Personel Temin", domain: "personeltemin.msb.gov.tr" },
];

export function Footer() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    setVisitorCount(getCachedVisitorCount());
    trackUniqueVisitor().then((count) => {
      setVisitorCount(count);
    });
  }, []);

  return (
    <footer className="relative border-t border-zinc-200/60 dark:border-white/10 bg-transparent py-12 text-sm text-zinc-500 dark:text-zinc-400 transition-colors overflow-hidden">
      {/* 
        Marquee Card: Glassmorphism Kaynaklar Bandı
        Tıpkı verilen template'teki "Trusted by Industry Leaders" gibi maskelenmiş ve kesintisiz kayan kart
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 dark:border-white/10 bg-white/25 dark:bg-white/[0.03] py-6 sm:py-7 backdrop-blur-xs shadow-lg shadow-zinc-950/2 dark:shadow-black/20">
          <div className="flex items-center justify-between px-6 sm:px-8 mb-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm sm:text-base font-semibold tracking-wide uppercase text-zinc-700 dark:text-zinc-300">
                Canlı Doğrulanan Resmî Kaynaklar
              </h3>
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 hidden sm:inline">
              Doğrudan devlet portallarından senkronize edilir
            </span>
          </div>

          {/* Maskelenmiş Akışkan Sonsuz Marquee */}
          <div 
            className="relative flex overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
            }}
          >
            <div className="animate-marquee flex gap-8 whitespace-nowrap px-4 py-1">
              {/* Kesintisiz sonsuz döngü için 3x kopya */}
              {[...OFFICIAL_SOURCES, ...OFFICIAL_SOURCES, ...OFFICIAL_SOURCES].map((src, i) => {
                const IconComponent = src.icon;
                return (
                  <div 
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 opacity-80 transition-all hover:opacity-100 hover:scale-105 cursor-default hover:border-blue-500/40 shadow-xs"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
                        <span>{src.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      </div>
                      <div className="text-xs text-zinc-400 dark:text-zinc-500 font-medium font-mono">
                        {src.sub}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Alt Footer Alanı: Telif, Kullanıcı Sayısı & İletişim */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-200/60 dark:border-white/5">
        {/* Sol: Telif & İletişim */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} Kamu İlan Merkezi. Tüm hakları saklıdır.
          </span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <a
            href="mailto:turk.ibrahim395@gmail.com"
            className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>İletişim: turk.ibrahim395@gmail.com</span>
          </a>
        </div>

        {/* Sağ: Kullanıcı Sayısı Rozeti */}
        <div className="flex items-center gap-3">
          {visitorCount !== null && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200/70 dark:bg-white/5 border border-zinc-300/60 dark:border-white/10 text-sm font-medium text-zinc-700 dark:text-zinc-300 backdrop-blur-md">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Kullanıcı Sayısı:</span>
              <strong className="font-mono tabular-nums font-bold text-zinc-950 dark:text-white">
                {visitorCount.toLocaleString("tr-TR")}
              </strong>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
