import Link from "next/link";
import { MapPin, Users, Calendar, ArrowRight, Building } from "lucide-react";
import { JobPost } from "@/types";
import { formatDate, getDaysRemaining, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";

interface JobCardProps {
  job: JobPost;
  onSelect?: (job: JobPost) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const daysInfo = getDaysRemaining(job.deadline_at);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(job);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Üst Rozetler */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {typeInfo && (
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}
          {categoryInfo && (
            <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
              {categoryInfo.label}
            </span>
          )}
          {job.sources?.name && (
            <span className="text-xs px-2 py-0.5 rounded font-normal text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700/60">
              {job.sources.name}
            </span>
          )}

          {/* Kalan Gün Rozeti */}
          <span
            className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              daysInfo.isExpired
                ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                : daysInfo.isUrgent
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold animate-pulse"
                : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            {daysInfo.text}
          </span>
        </div>

        {/* İlan Başlığı */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug">
          {job.title}
        </h3>

        {/* Kurum Adı */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 mt-2">
          <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{job.institution || "Resmi Kamu Kurumu"}</span>
        </div>

        {/* Açıklama Özeti */}
        {job.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          {job.city && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {job.city}
            </span>
          )}
          {job.position_count && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {job.position_count} Kişi
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {formatDate(job.published_at)}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors group-hover:translate-x-0.5 duration-150"
        >
          <span>İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
