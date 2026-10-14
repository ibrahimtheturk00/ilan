"use client";

import { useEffect, useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";

const QUICK_SEARCH_TAGS = [
  "Sağlık",
  "Büro Personeli",
  "Mühendis",
  "Bilişim",
  "Öğretim Görevlisi",
  "KPSS Şartsız",
  "Temizlik",
  "Belediye",
];

export function SearchBar() {
  const searchQuery = useFilters((s) => s.searchQuery);
  const setSearchQuery = useFilters((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K veya Cmd+K ile hızlı arama odağı
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-2.5 w-full">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 dark:group-focus-within:text-brand-400 transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Unvan, kurum veya şehir ara (örn. Mühendis, Sağlık, İTÜ, Ankara)..."
          className="w-full pl-12 pr-24 py-3.5 text-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 dark:focus:border-brand-400 transition-all text-slate-800 dark:text-slate-100"
        />

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 select-none pointer-events-none">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Hızlı Arama Etiketleri */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs py-0.5">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 shrink-0 flex items-center gap-1 pl-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Hızlı:
        </span>
        {QUICK_SEARCH_TAGS.map((tag) => {
          const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(isSelected ? "" : tag)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                isSelected
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

