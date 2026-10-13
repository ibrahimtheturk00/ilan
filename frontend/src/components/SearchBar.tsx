"use client";

import { Search, X } from "lucide-react";
import { useFilters } from "@/hooks/useFilters";

export function SearchBar() {
  const searchQuery = useFilters((s) => s.searchQuery);
  const setSearchQuery = useFilters((s) => s.setSearchQuery);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Unvan, kurum, şehir veya anahtar kelime ile ara (örn. Mühendis, Sağlık, İTÜ, Ankara)..."
        className="w-full pl-11 pr-10 py-3 text-sm bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700/80 rounded-2xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all text-slate-800 dark:text-slate-100"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Aramayı Temizle"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
