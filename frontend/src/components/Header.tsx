"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ShieldCheck, Mail, Users, Github } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { trackUniqueVisitor } from "@/lib/supabase";

export function Header() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    // Sadece tarayıcıda çalıştır ve tekil ziyaretçiyi kaydet/say
    trackUniqueVisitor().then((count) => {
      setVisitorCount(count);
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-0 sm:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight block leading-tight">
              Kamu İlan Merkezi
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              6 Resmi Kaynak • Günlük Otomatik Tarama
            </span>
          </div>
        </Link>

        {/* Sağ Üst: İletişim Bilgisi, Ziyaretçi Sayacı ve Butonlar */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* İletişim & Öneri Kutusu */}
          <div className="flex flex-col items-end text-right pr-2 border-r border-slate-200 dark:border-slate-800 hidden md:flex">
            <a
              href="mailto:turk.ibrahim395@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              title="Öneri ve geri bildirimleriniz için e-posta gönderin"
            >
              <Mail className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>turk.ibrahim395@gmail.com</span>
            </a>
            <div className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <Users className="w-3 h-3 text-emerald-500" />
              <span>Tekil Ziyaretçi:</span>
              <strong className="font-bold text-slate-900 dark:text-slate-100">
                {visitorCount !== null ? visitorCount.toLocaleString("tr-TR") : "..."}
              </strong>
            </div>
          </div>

          {/* Mobil Görünüm İçin Sayaç Rozeti */}
          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            <Users className="w-3 h-3 text-emerald-500" />
            <span>Ziyaretçi:</span>
            <strong>{visitorCount !== null ? visitorCount : "..."}</strong>
          </div>

          <ThemeToggle />

          <Link
            href="/admin/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-brand-50/50 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Loglar</span>
          </Link>

          <a
            href="https://github.com/ibrahimtheturk00/ilan"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
