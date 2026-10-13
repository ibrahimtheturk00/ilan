"use client";

import { useEffect, useState } from "react";
import { fetchEmploymentStats, EmploymentReportData } from "@/lib/supabase";
import {
  TrendingUp,
  Users,
  Building2,
  Clock,
  Briefcase,
  GraduationCap,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface EmploymentReportProps {
  onFilterCategory?: (category: string) => void;
  onFilterCity?: (city: string) => void;
}

export function EmploymentReport({ onFilterCategory, onFilterCity }: EmploymentReportProps) {
  const [stats, setStats] = useState<EmploymentReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmploymentStats()
      .then((data) => {
        setStats(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">
          İstihdam raporu ve analizler yükleniyor...
        </span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Rapor Başlığı */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
          <TrendingUp className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Haftalık Resmi İstatistikler</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kamu İstihdam ve Kadro Raporu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Türkiye genelindeki tüm resmi kamu ilanlarının kurum, branş ve kontenjan dağılımı.
        </p>
      </div>

      {/* 4 Önemli Metrik Kartı */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Aktif İlan Sayısı</span>
            <Briefcase className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalActiveJobs.toLocaleString("tr-TR")}
          </div>
          <span className="text-[11px] text-slate-500 block">Resmi portallardan güncel</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Toplam Kadro Kontenjanı</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.totalPositions.toLocaleString("tr-TR")}
          </div>
          <span className="text-[11px] text-slate-500 block">İstihdam edilecek kişi sayısı</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Acil Başvurular</span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {stats.urgentJobsCount}
          </div>
          <span className="text-[11px] text-slate-500 block">Son 3 gün içinde bitenler</span>
        </div>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">İlan Veren Kurumlar</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {stats.topInstitutions.length > 0 ? `${stats.topInstitutions.length}+` : "10+"}
          </div>
          <span className="text-[11px] text-slate-500 block">Bakanlık, üniversite, belediye</span>
        </div>
      </div>

      {/* İki Kolonlu Detay Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Sol Kolon: En Çok Alım Yapan Kurumlar */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>En Çok Kadro Açan İlk 5 Kurum</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Kontenjana Göre</span>
          </div>

          <div className="space-y-4 pt-1">
            {stats.topInstitutions.map((inst, index) => {
              const maxPositions = stats.topInstitutions[0]?.positions || 1;
              const barPercent = Math.min(100, Math.round((inst.positions / maxPositions) * 100));

              return (
                <div key={inst.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[260px] sm:max-w-[340px]">
                      {index + 1}. {inst.name}
                    </span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold shrink-0">
                      {inst.positions.toLocaleString("tr-TR")} Kadro
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ Kolon: Meslek & Branş Dağılımı */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Sektörel / Branş Dağılımı</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Toplam İlan İçi Pay</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {stats.categoryDistribution.map((cat) => (
              <div
                key={cat.key}
                onClick={() => onFilterCategory?.(cat.key)}
                className="group cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 transition-colors">
                    {cat.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {cat.count} İlan (%{cat.percentage})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kadro Statüsü ve Popüler İller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Kadro Türü Oranları */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3 font-bold text-slate-900 dark:text-white text-sm">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>Kadro Statüsü Dağılımı</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {stats.postTypeDistribution.map((t) => (
              <div
                key={t.key}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  {t.label}
                </span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.count} İlan
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  %{t.percentage} Pay
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* En Çok İlan Bulunan Şehirler */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3 font-bold text-slate-900 dark:text-white text-sm">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>En Çok İlan Alan Şehirler</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {stats.topCities.map((item) => (
              <button
                key={item.city}
                onClick={() => onFilterCity?.(item.city)}
                className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-slate-800 transition-all group"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 block">
                  {item.city}
                </span>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-0.5 block">
                  {item.count} İlan
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bilgi Kutusu */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-slate-900/40 border border-brand-200 dark:border-slate-700 text-xs text-brand-900 dark:text-slate-300">
        <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
        <span>
          Bu rapordaki veriler Kamu İlan Merkezi robotları tarafından her 60 dakikada bir taranan resmi kaynaklardan çekilerek anlık üretilmektedir.
        </span>
      </div>
    </div>
  );
}
