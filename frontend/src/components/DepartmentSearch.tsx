"use client";

import { useState, useMemo } from "react";
import { GraduationCap, ArrowRight, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { useJobs } from "@/hooks/useJobs";
import { useQuery } from "@tanstack/react-query";
import { fetchAllJobSummaries, fetchJobsByIds } from "@/lib/supabase";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { JobPost } from "@/types";

// YÖK Atlas ve Kamu Personeli Seçme / Alım alanlarına göre genişletilmiş lisans/önlisans bölümleri
export interface DepartmentCategory {
  id: string;
  name: string;
  icon?: string;
  keywords: string[];
  dbCategory?: string;
}

export const YOK_ATLAS_DEPARTMENTS: DepartmentCategory[] = [
  {
    id: "bilisim",
    name: "Bilgisayar & Bilişim & Yazılım",
    keywords: ["yazilim", "bilgisayar", "bilisim", "programci", "cozumleyici", "siber", "yapay zeka"],
    dbCategory: "bilisim",
  },
  {
    id: "egitim",
    name: "Eğitim Fakültesi & Öğretmenlik",
    keywords: ["ogretmen", "ogretim uyesi", "ogretim elemani", "akademisyen", "docent", "profesor", "arastirma gorevlisi"],
    dbCategory: "egitim",
  },
  {
    id: "hukuk",
    name: "Hukuk & Adalet",
    keywords: ["hukuk", "avukat", "hakim", "savci", "icra mudur", "adli", "yargitay"],
    dbCategory: "hukuk",
  },
  {
    id: "saglik",
    name: "Sağlık & Tıp & Diş Hekimliği",
    keywords: ["tabip", "hekim", "doktor", "dis hekimi", "eczaci", "tip fakultesi"],
    dbCategory: "saglik",
  },
  {
    id: "hemsirelik",
    name: "Hemşirelik & Ebelik & Sağlık Teknikerliği",
    keywords: ["hemsire", " ebe ", "saglik teknik", "anestezi", "laborant", "paramedik", "diyaliz", "fizyoterapist", "biyolog", "odyolog"],
  },
  {
    id: "iibf",
    name: "İktisat, İşletme, Maliye & Denetim",
    keywords: ["maliye", "iktisat", "isletme", "kamu yonetimi", "muhasebe", "finans", "ekonometri", "denetci", "denetmen", "bddk", "spk", "tmsf", "hazine"],
    dbCategory: "maliye",
  },
  {
    id: "muhendislik",
    name: "Mühendislik & Mimarlık (Tüm Branşlar)",
    keywords: ["muhendis", "mimar", "insaat", "makine", "elektrik", "elektronik", "harita", "jeoloji", "maden", "endustri"],
    dbCategory: "muhendislik",
  },
  {
    id: "buro",
    name: "Büro Yönetimi & İdari Personel",
    keywords: ["buro", "sekreter", "veri hazirlama", "vhki", "danisma", "arsiv"],
  },
  {
    id: "zabita",
    name: "Zabıta, İtfaiye & Özel Güvenlik",
    keywords: ["zabita", "itfaiye", "ozel guvenlik", "koruma ve guvenlik"],
  },
  {
    id: "sosyal",
    name: "Sosyal Hizmetler & Psikoloji & PDR",
    keywords: ["sosyal hizmet", "sosyal calismaci", "psikolog", "pdr", "sosyolog", "pedagog"],
  },
  {
    id: "fen_edebiyat",
    name: "Fen - Edebiyat & Temel Bilimler",
    keywords: ["matematik", "fizik", "kimya", "biyoloji", "tarih", "turk dili", "edebiyat", "cografya", "felsefe", "istatistik"],
  },
  {
    id: "ziraat_veteriner",
    name: "Ziraat, Orman, Hayvancılık & Gıda",
    keywords: ["ziraat", "veteriner", "orman muhendisi", "gida muhendisi", "tarim", "bahcivan", "peyzaj"],
  },
  {
    id: "teknik_usta",
    name: "Tekniker, Teknisyen, Usta & Mekanik",
    keywords: ["tekniker", "teknisyen", "mekanik", "tamirci", "elektrikci", "kaynakci", "operator", "lastikci", "sofor", "motor"],
  },
  {
    id: "savunma_askeri",
    name: "Milli Savunma & Askeri Kadrolar",
    keywords: ["subay", "astsubay", "askeri", "jandarma", "sahil guvenlik", "milli savunma"],
  },
  {
    id: "kultur_sanat",
    name: "Kültür, Sanat, Arkeoloji & Müze",
    keywords: ["restorator", "muze", "sanat tarih", "arkeolog", "kutuphaneci", "grafiker", "milli saraylar", "vakif"],
  },
  {
    id: "destek_hizmet",
    name: "Temizlik, Aşçılık & Destek Hizmetleri",
    keywords: ["temizlik", "hizmetli", "asci", "destek personeli", "beden iscisi", "garson", "bulasik"],
  },
];

function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");
}

export function DepartmentSearch({ onSwitchToAll }: { onSwitchToAll: () => void }) {
  const [selectedDept, setSelectedDept] = useState<DepartmentCategory | null>(YOK_ATLAS_DEPARTMENTS[0]);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  // Tüm aktif ilanların özetini çek (yeşil sayı sayaçları için)
  const { data: jobSummaries = [] } = useQuery({
    queryKey: ["job-summaries"],
    queryFn: fetchAllJobSummaries,
    staleTime: 1000 * 60 * 5,
  });

  // Her kategori için eşleşen ilan ID'lerini hesapla
  const departmentMatches = useMemo(() => {
    const matches: Record<string, number[]> = {};

    YOK_ATLAS_DEPARTMENTS.forEach((dept) => {
      const ids: number[] = [];
      jobSummaries.forEach((job) => {
        const fullContent = normalizeText(`${job.title} ${job.description || ""}`);
        const matchesCategory = dept.dbCategory && job.category === dept.dbCategory;
        const matchesKeyword = dept.keywords.some((kw) => fullContent.includes(kw));
        if (matchesCategory || matchesKeyword) {
          ids.push(job.id);
        }
      });
      matches[dept.id] = ids;
    });

    return matches;
  }, [jobSummaries]);

  const selectedDeptIds = useMemo(() => {
    if (!selectedDept) return [];
    return departmentMatches[selectedDept.id] || [];
  }, [selectedDept, departmentMatches]);

  // Seçili kategoriye ait tam ilan kartı verilerini çek
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["department-jobs", selectedDept?.id, selectedDeptIds],
    queryFn: () => fetchJobsByIds(selectedDeptIds),
    enabled: selectedDeptIds.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Üst Bilgi ve Kategori Butonları Kartı */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>YÖK Atlas & Üniversite Bölüm Eşleştirmesi</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Mezuniyet Alanınızı Seçin
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Arama yapmanıza gerek yok; alanınıza tıklayarak güncel ilanları ve yeşil sayaçlarla açık pozisyonları görün.
          </p>
        </div>

        {/* Kategori Seçme Butonları (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {YOK_ATLAS_DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept?.id === dept.id;
            const count = departmentMatches[dept.id]?.length || 0;

            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`p-3.5 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md scale-[1.02]"
                    : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-white/20 dark:bg-slate-900/10 text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold truncate leading-tight">
                    {dept.name}
                  </span>
                </div>

                {/* Yeşil Sayaç Rozeti */}
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm ${
                    isSelected
                      ? "bg-emerald-500 text-white"
                      : count > 0
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                  }`}
                  title={`${count} aktif ilan`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sonuç Alanı */}
      {selectedDept && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 px-1">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                {selectedDept.name} için{" "}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {results.length}
                </strong>{" "}
                ilan listeleniyor
              </span>
            </div>
            <button
              onClick={onSwitchToAll}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <span>Tüm İlanlara Dön</span>
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
                <JobCard key={job.id} job={job} onSelect={(j) => setSelectedJob(j)} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-10 text-center text-slate-500 dark:text-slate-400 shadow-sm space-y-3">
              <GraduationCap className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Bu alanda şu an aktif ilan bulunmuyor
              </h4>
              <p className="text-xs max-w-sm mx-auto">
                Diğer kategorilere göz atabilir veya tüm kamu ilanlarını listeleyebilirsiniz.
              </p>
              <button
                onClick={onSwitchToAll}
                className="mt-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Tüm İlanları Görüntüle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Detay Modalı */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
