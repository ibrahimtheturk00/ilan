"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Uygulama hatası yakalandı:", error);
  }, [error]);

  return (
    <main className="max-w-4xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 font-heading mb-3">
        Bir Sorun Oluştu
      </h1>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        İlanlar yüklenirken beklenmeyen bir hata meydana geldi. Bağlantınızı kontrol edip tekrar deneyebilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Yeniden Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-zinc-800 dark:text-zinc-200 font-medium text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
      </div>
    </main>
  );
}
