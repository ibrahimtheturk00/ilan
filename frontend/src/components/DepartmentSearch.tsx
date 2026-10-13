"use client";

import { useState } from "react";
import { Search, GraduationCap, Sparkles, BookOpen, X, ArrowRight } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "./JobCard";
import { JobPost } from "@/types";

const POPULAR_DEPARTMENTS = [
  { name: "Bilgisayar & Yazılım Mühendisliği", query: "yazılım", category: "bilisim" },
  { name: "Hemşirelik & Sağlık Bilimleri", query: "hemşire", category: "saglik" },
  { name: "Hukuk Fakültesi", query: "avukat", category: "hukuk" },
  { name: "İktisat & Maliye & İşletme", query: "maliye", category: "maliye" },
  { name: "Mühendislik (Makine / Elektrik)", query: "mühendis", category: "muhendislik" },
  { name: "Eğitim Fakültesi & Öğretmenlik", query: "öğretim", category: "egitim" },
  { name: "Tıp Fakültesi / Hekimlik", query: "doktor", category: "saglik" },
  { name: "Büro Yönetimi & İdari Personel", query: "memur", category: "diger" },
];

export function DepartmentSearch({ onSwitchToAll }: { onSwitchToAll: () => void }) {
  const [departmentInput, setDepartmentInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  // Arama filtresi oluştur
  const { data, isLoading } = useJobs({
    searchQuery: activeQuery,
    category: activeCategory,
    city: "",
    postType: "",
    sourceSlug: "",
    onlyActive: true,
    page: 1,
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (departmentInput.trim()) {
      setActiveQuery(departmentInput.trim());
      setActiveCategory("");
    }
  };

  const handleSelectQuick = (item: typeof POPULAR_DEPARTMENTS[0]) => {
    setDepartmentInput(item.name);
    setActiveQuery(item.query);
    setActiveCategory(item.category);
  };

  const clearSearch = () => {
    setDepartmentInput("");
    setActiveQuery("");
    setActiveCategory("");
  };

  const results: JobPost[] = data?.data || [];
  const isSearchActive = Boolean(activeQuery || activeCategory);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Bölüm Seçim Hero Kutusu */}
      <div className="bg-gradient-to-br from-brand-50 to-white dark:from-slate-800 dark:to-slate-800/60 border border-brand-200 dark:border-slate-700 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4" />
            <span>Bölüme Göre Özel İlan Eşleştirme</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mezun Olduğunuz Bölümü Yazın
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Sadece sizin mezuniyetinize ve alanınıza uygun kadroları filtreleyelim.
          </p>

          {/* Form */}
          <form onSubmit={handleSearch} className="pt-4 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={departmentInput}
                onChange={(e) => setDepartmentInput(e.target.value)}
                placeholder="Örn: Bilgisayar Mühendisliği, Hemşirelik, Hukuk..."
                className="w-full pl-10 pr-10 py-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
              />
              {departmentInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              <span>İlanları Bul</span>
            </button>
          </form>

          {/* Popüler Bölüm Rozetleri */}
          <div className="pt-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">
              Veya popüler alanlardan birini seçin:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {POPULAR_DEPARTMENTS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectQuick(item)}
                  type="button"
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    activeQuery === item.query || departmentInput === item.name
                      ? "bg-brand-600 text-white border-brand-600 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50/50 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sonuç Alanı */}
      {isSearchActive && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>
                "{departmentInput || activeQuery}" için{" "}
                <strong className="text-brand-600 dark:text-brand-400">{results.length}</strong> ilan bulundu
              </span>
            </div>
            <button
              onClick={onSwitchToAll}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 transition-colors"
            >
              <span>Tüm İlanlara Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm animate-pulse space-y-3"
                >
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700/60 rounded" />
                  <div className="h-12 w-full bg-slate-100 dark:bg-slate-700/60 rounded" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 shadow-sm space-y-3">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Bu bölüm adına özel ilan bulunamadı
              </h4>
              <p className="text-xs max-w-sm mx-auto">
                Bölüm adını farklı bir unvanla aramayı deneyebilir veya tüm kamu ilanlarını inceleyebilirsiniz.
              </p>
              <button
                onClick={onSwitchToAll}
                className="mt-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors"
              >
                Tüm İlanları Görüntüle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
