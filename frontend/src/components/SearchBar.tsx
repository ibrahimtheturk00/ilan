"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
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
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K veya Cmd+K ile hızlı arama odağı
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dışarı tıklandığında kategorileri kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTagHoverStyle = (tag: string) => {
    switch (tag) {
      case "Sağlık":
        return "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 dark:hover:border-emerald-700";
      case "Büro Personeli":
        return "hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 dark:hover:border-indigo-700";
      case "Mühendis":
        return "hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 dark:hover:bg-amber-950/60 dark:hover:text-amber-300 dark:hover:border-amber-700";
      case "Bilişim":
        return "hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 dark:hover:bg-cyan-950/60 dark:hover:text-cyan-300 dark:hover:border-cyan-700";
      case "Öğretim Görevlisi":
        return "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 dark:hover:bg-purple-950/60 dark:hover:text-purple-300 dark:hover:border-purple-700";
      case "KPSS Şartsız":
        return "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 dark:hover:border-rose-700";
      case "Temizlik":
        return "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 dark:hover:bg-teal-950/60 dark:hover:text-teal-300 dark:hover:border-teal-700";
      case "Belediye":
        return "hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 dark:hover:bg-sky-950/60 dark:hover:text-sky-300 dark:hover:border-sky-700";
      default:
        return "hover:bg-slate-200/80 dark:hover:bg-slate-700/80";
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 w-full">
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onFocus={() => setIsFocused(true)}
          onClick={() => setIsFocused(true)}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Unvan, kurum veya şehir ara (örn. Mühendis, Büro, Sağlık, İTÜ, Ankara)..."
          className="w-full pl-10 pr-20 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:border-zinc-400 transition-all text-zinc-900 dark:text-zinc-100 shadow-xs"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-500 dark:text-zinc-400 select-none pointer-events-none">
              <span>Ctrl</span>
              <span>K</span>
            </div>
          )}
        </div>
      </div>

      {/* Hızlı Arama Etiketleri - Sadece odaklanıldığında veya tıklandığında açılır */}
      {isFocused && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs py-1 animate-fadeIn">
          <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 pl-0.5">
            Kategoriler:
          </span>
          {QUICK_SEARCH_TAGS.map((tag) => {
            const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(isSelected ? "" : tag)}
                className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 font-semibold"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

