"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  GraduationCap,
  MapPin,
  Briefcase,
  Check,
  Search,
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { InteractiveDotGridBackground } from "./InteractiveDotGridBackground";
import { YOK_ATLAS_DEPARTMENTS } from "./DepartmentSearch";
import { TURKEY_CITIES } from "./FilterSidebar";
import { UserCareerCriteria } from "@/hooks/usePersonalizedCriteria";

interface PersonalizedCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCriteria: UserCareerCriteria | null;
  onSave: (criteria: UserCareerCriteria) => void;
}

const POST_TYPES = [
  { key: "memur", label: "Memur (657/4A)", desc: "Kadrolu devlet memuru pozisyonları" },
  { key: "sozlesmeli", label: "Sözleşmeli Personel (4/B)", desc: "Bakanlık ve kurum sözleşmeli alımları" },
  { key: "isci", label: "Sürekli İşçi / İŞKUR", desc: "Kamu işçi ve teknik destek kadroları" },
  { key: "akademik", label: "Akademik Kadro", desc: "Öğretim görevlisi, araştırma görevlisi, doçent" },
];

const POPULAR_CITIES = [
  "Ankara",
  "İstanbul",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Trabzon",
  "Diyarbakır",
  "Eskişehir",
];

export function PersonalizedCriteriaModal({
  isOpen,
  onClose,
  initialCriteria,
  onSave,
}: PersonalizedCriteriaModalProps) {
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>([]);
  const [includeNoKpss, setIncludeNoKpss] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialCriteria) {
      setSelectedDepts(initialCriteria.departments || []);
      setSelectedCities(initialCriteria.cities || []);
      setSelectedPostTypes(initialCriteria.postTypes || []);
      setIncludeNoKpss(initialCriteria.includeNoKpss !== false);
    } else {
      setSelectedDepts([]);
      setSelectedCities([]);
      setSelectedPostTypes([]);
      setIncludeNoKpss(true);
    }
  }, [initialCriteria, isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleDept = (deptId: string) => {
    setSelectedDepts((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityName) ? prev.filter((c) => c !== cityName) : [...prev, cityName]
    );
  };

  const togglePostType = (typeKey: string) => {
    setSelectedPostTypes((prev) =>
      prev.includes(typeKey) ? prev.filter((t) => t !== typeKey) : [...prev, typeKey]
    );
  };

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return [];
    return TURKEY_CITIES.filter((c) =>
      c.toLocaleLowerCase("tr-TR").includes(citySearch.toLocaleLowerCase("tr-TR"))
    ).slice(0, 8);
  }, [citySearch]);

  const handleReset = () => {
    setSelectedDepts([]);
    setSelectedCities([]);
    setSelectedPostTypes([]);
    setIncludeNoKpss(true);
  };

  const handleSave = () => {
    onSave({
      departments: selectedDepts,
      cities: selectedCities,
      postTypes: selectedPostTypes,
      includeNoKpss,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen || !mounted) return null;

  const totalSelectedFilters =
    selectedDepts.length +
    selectedCities.length +
    selectedPostTypes.length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
      {/* Arka plan ışık noktaları ve dalga efekti (Canvas 2D) */}
      <div className="absolute inset-0 pointer-events-auto z-0">
        <InteractiveDotGridBackground className="w-full h-full" />
      </div>

      {/* Modal Dialog Container - Sadece form kısmı */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-h-[92vh] flex flex-col z-20 overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                Sana Özel İlan Kriterleri
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Seçtiğin kriterlere uyan kamu ilanları radarında anında listelenecektir.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-7 text-sm">
          {/* 1. Mezuniyet Alanı / Bölüm Seçimi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
                <span>Mezuniyet Alanı / Branşın (Birden fazla seçebilirsin)</span>
              </label>
              <span className="text-xs text-zinc-400 font-mono">
                {selectedDepts.length} seçildi
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {YOK_ATLAS_DEPARTMENTS.map((dept) => {
                const isSelected = selectedDepts.includes(dept.id);
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => toggleDept(dept.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500"
                    }`}
                  >
                    <span className="truncate pr-1">{dept.name}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-emerald-400 dark:text-sky-400 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tercih Edilen Şehirler */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
                <span>İkamet / Başvurmak İstediğin İller</span>
              </label>
              {selectedCities.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setSelectedCities([])}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Tüm Türkiye Olarak Sıfırla
                </button>
              ) : (
                <span className="text-xs text-emerald-950 dark:text-sky-300 font-semibold bg-emerald-50 dark:bg-sky-500/15 border border-emerald-300/80 dark:border-sky-400/30 px-2 py-0.5 rounded-full">
                  Tüm Türkiye İlanları Açık
                </span>
              )}
            </div>

            {/* Hızlı Popüler Şehirler */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCities([])}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCities.length === 0
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                🇹🇷 Tüm Türkiye
              </button>
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCities.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCity(c)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-700 text-white dark:bg-sky-500 dark:text-zinc-950 font-bold"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <span>{c}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            {/* Diğer Şehir Ara */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Listede olmayan başka bir il ara..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-zinc-400"
              />
              {filteredCities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-20 p-1 flex flex-wrap gap-1">
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        toggleCity(c);
                        setCitySearch("");
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-emerald-600 dark:hover:bg-sky-500 hover:text-white dark:hover:text-zinc-950"
                    >
                      + {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-zinc-400 font-medium">Seçili İller:</span>
                {selectedCities.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 text-xs font-semibold"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => toggleCity(c)}
                      className="hover:text-rose-500 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 3. Kadro Türü Tercihi */}
          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kadro / İstihdam Türü (Boş bırakılırsa hepsi aranır)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POST_TYPES.map((pt) => {
                const isSelected = selectedPostTypes.includes(pt.key);
                return (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => togglePostType(pt.key)}
                    className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs"
                        : "bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700/60 hover:border-zinc-400 dark:hover:border-zinc-500"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs sm:text-sm">{pt.label}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected
                            ? "text-zinc-300 dark:text-zinc-600"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {pt.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 shrink-0 text-emerald-400 dark:text-sky-400 stroke-[3]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. KPSS Şartsız İlanlar Dahil Edilsin mi? */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60">
            <div>
              <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                KPSS Şartsız İlanları Dahil Et
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                KPSS puanı gerektirmeyen veya taban puan aramayan resmi kamu alımları da listene eklenir.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIncludeNoKpss(!includeNoKpss)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                includeNoKpss ? "bg-emerald-600 dark:bg-sky-500" : "bg-zinc-300 dark:bg-zinc-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  includeNoKpss ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıfırla</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Vazgeç
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-zinc-900 text-white hover:bg-emerald-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-sky-400 dark:hover:text-zinc-950 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400 dark:text-sky-400" />
              <span>Kriterleri Kaydet ve İlanları Gör</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
