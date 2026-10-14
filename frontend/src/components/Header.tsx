"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Mail, Users, Github, Smartphone, Download } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { trackUniqueVisitor } from "@/lib/visitor";

export function Header() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // Sadece tarayıcıda çalıştır ve tekil ziyaretçiyi kaydet/say
    trackUniqueVisitor().then((count) => {
      setVisitorCount(count);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-0 sm:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight block leading-tight">
                Kamu İlan Merkezi
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
              6 Resmî Kaynak • Anlık Veri Akışı
            </span>
          </div>
        </Link>

        {/* Sağ Üst: İletişim Bilgisi, Ziyaretçi Sayacı ve Butonlar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-end sm:self-auto">
          {/* İletişim & Öneri Kutusu */}
          <div className="flex flex-col items-end text-right pr-2.5 border-r border-slate-200 dark:border-slate-800 hidden md:flex">
            <a
              href="mailto:turk.ibrahim395@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              title="Öneri ve geri bildirimleriniz için e-posta gönderin"
            >
              <Mail className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>turk.ibrahim395@gmail.com</span>
            </a>
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>Tekil Ziyaretçi:</span>
              <strong className="font-bold text-slate-900 dark:text-slate-100 font-sans">
                {visitorCount !== null ? visitorCount.toLocaleString("tr-TR") : "..."}
              </strong>
            </div>
          </div>

          {/* Mobil Görünüm İçin Sayaç Rozeti */}
          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <Users className="w-3 h-3 text-emerald-500" />
            <span>Ziyaretçi:</span>
            <strong>{visitorCount !== null ? visitorCount : "..."}</strong>
          </div>

          {/* Mobil Uygulama (APK) İndirme Butonu */}
          <a
            href="https://raw.githubusercontent.com/ibrahimtheturk00/ilan/main/frontend/public/kamu-ilan.apk"
            download="kamu-ilan.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Kamu İlan Android uygulamasını (.apk) doğrudan indirin"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobil Uygulama</span>
            <Download className="w-3 h-3 opacity-80" />
          </a>

          <ThemeToggle />

          <Link
            href="/admin/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Loglar</span>
          </Link>

          <a
            href="https://github.com/ibrahimtheturk00/ilan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
