"use client";

import Link from "next/link";
import { Building2, ShieldCheck, Smartphone, Download } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-[#f8f9fa]/90 dark:bg-[#0F1117]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Sol: Logo ve İsim */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 shadow-xs group-hover:bg-brand-600 dark:group-hover:bg-brand-400 dark:group-hover:text-white transition-colors shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-heading text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight block leading-tight">
              Kamu İlan Merkezi
            </span>
            <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Güncel Resmî Personel Alımları
            </span>
          </div>
        </Link>

        {/* Sağ: Mobil Uygulama, Tema Butonu ve Loglar */}
        <div className="flex items-center gap-2">
          {/* Mobil Uygulama (APK) İndirme Butonu */}
          <a
            href="https://raw.githubusercontent.com/ibrahimtheturk00/ilan/main/frontend/public/kamu-ilan.apk"
            download="kamu-ilan.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-semibold shadow-xs transition-colors"
            title="Kamu İlan Android uygulamasını (.apk) doğrudan indirin"
          >
            <Smartphone className="w-4 h-4" />
            <span className="hidden sm:inline">Mobil Uygulama</span>
            <Download className="w-3.5 h-3.5 opacity-80" />
          </a>

          <ThemeToggle />

          <Link
            href="/admin/"
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span className="hidden sm:inline">Loglar</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
