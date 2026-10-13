"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { fetchJobsByIds } from "@/lib/supabase";
import { JobPost } from "@/types";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { Heart, Trash2, ArrowRight, Loader2 } from "lucide-react";

interface FavoritesViewProps {
  onSwitchToAll: () => void;
}

export function FavoritesView({ onSwitchToAll }: FavoritesViewProps) {
  const { favorites, clearFavorites, count } = useFavorites();
  const [favoriteJobs, setFavoriteJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  useEffect(() => {
    if (favorites.length === 0) {
      setFavoriteJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchJobsByIds(favorites)
      .then((jobs) => {
        setFavoriteJobs(jobs);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [favorites]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">
          Favori ilanlarınız yükleniyor...
        </span>
      </div>
    );
  }

  if (favorites.length === 0 || favoriteJobs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto text-rose-500">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Henüz Favori İlanınız Yok
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Başvurmayı düşündüğünüz veya takip etmek istediğiniz ilanların üzerindeki kalp ikonuna tıklayarak buraya kaydedebilirsiniz.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={onSwitchToAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs sm:text-sm shadow-sm hover:scale-[1.02] transition-all"
          >
            <span>Tüm İlanları Keşfet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Üst Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
            <Heart className="w-4 h-4 fill-rose-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Favori İlanlarım ({count})
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Tarayıcınıza kaydedilmiş kişisel ilan listeniz
            </span>
          </div>
        </div>

        <button
          onClick={clearFavorites}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Tümünü Temizle</span>
        </button>
      </div>

      {/* İlan Kartları Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favoriteJobs.map((job) => (
          <JobCard key={job.id} job={job} onSelect={(j) => setSelectedJob(j)} />
        ))}
      </div>

      {/* Detay Modalı */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
