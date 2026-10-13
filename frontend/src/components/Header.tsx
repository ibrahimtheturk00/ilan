import Link from "next/link";
import { Building2, ShieldCheck, Github, ExternalLink } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
              Kamu İlan Merkezi
            </span>
            <span className="text-xs text-slate-500 block">
              6 Resmi Kaynak • Günlük Otomatik Tarama
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-brand-200 hover:bg-brand-50/50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem & Loglar</span>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
