"use client";

import { useEffect, useState } from "react";
import { Mail, Users } from "lucide-react";
import { trackUniqueVisitor, getCachedVisitorCount } from "@/lib/visitor";

export function Footer() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    setVisitorCount(getCachedVisitorCount());
    trackUniqueVisitor().then((count) => {
      setVisitorCount(count);
    });
  }, []);

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-[#F7F7F5] dark:bg-[#0F1117] py-8 text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Sol: Telif & İletişim */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} Kamu İlan Merkezi. Tüm hakları saklıdır.
          </span>
          <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">•</span>
          <a
            href="mailto:turk.ibrahim395@gmail.com"
            className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>İletişim: turk.ibrahim395@gmail.com</span>
          </a>
        </div>

        {/* Orta/Sağ: Kullanıcı Sayısı & Kaynaklar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          {visitorCount !== null && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
              <Users className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Kullanıcı Sayısı:</span>
              <strong className="font-mono tabular-nums font-bold text-zinc-900 dark:text-zinc-100">
                {visitorCount.toLocaleString("tr-TR")}
              </strong>
            </div>
          )}

          <div className="flex items-center gap-2.5 text-zinc-400 dark:text-zinc-500 font-medium text-[11px]">
            {["CBİKO", "İlan.gov.tr", "SBB", "İŞKUR", "Resmî Gazete"].map((source, i) => (
              <span key={source} className="flex items-center gap-2.5">
                <span>{source}</span>
                {i < 4 && <span className="text-zinc-300 dark:text-zinc-700">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
