import Link from "next/link";
import { MapPin, Users, Calendar, ArrowRight, Building } from "lucide-react";
import { JobPost } from "@/types";
import { formatDate, getJobApplicationStatus, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";

interface JobCardProps {
  job: JobPost;
  onSelect?: (job: JobPost) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const statusInfo = getJobApplicationStatus(job.published_at, job.deadline_at, job.title);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(job);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group bg-white dark:bg-slate-900 border ${
        statusInfo.isCancelled
          ? "border-red-200 dark:border-red-900/50 hover:border-red-400"
          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      } rounded-xl p-5 transition-all duration-150 hover:shadow-md flex flex-col justify-between cursor-pointer`}
    >
      <div>
        {/* Üst Rozetler */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Kadro Türü Rozeti */}
          {typeInfo && (
            <span className={`text-[11px] px-2.5 py-0.5 rounded-md ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}

          {categoryInfo && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {categoryInfo.label}
            </span>
          )}

          {/* Kaynak Rozeti (Örn: CBİKO, SBB, vb.) */}
          {job.sources?.name && (
            <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              {job.sources.name}
            </span>
          )}

          {/* İptal / Düzeltme Rozeti veya Normal Başvuru Durum Rozeti (En Sağda) */}
          {statusInfo.isCancelled ? (
            <span className="ml-auto text-[11px] px-2.5 py-0.5 rounded font-bold bg-red-600 text-white tracking-wide uppercase shadow-sm">
              {statusInfo.statusTitle}
            </span>
          ) : (
            <span
              className={`ml-auto text-[11px] px-2 py-0.5 rounded font-medium ${statusInfo.badgeClass}`}
            >
              {statusInfo.fullBadgeText}
            </span>
          )}
        </div>

        {/* İlan Başlığı */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug tracking-tight">
          {job.title}
        </h3>

        {/* Kurum Adı */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate font-medium">{job.institution || "Resmi Kamu Kurumu"}</span>
        </div>

        {/* Açıklama Özeti */}
        {job.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
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
          {!statusInfo.isCancelled && job.published_at && (
            <span className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {formatDate(job.published_at)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleClick}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
        >
          <span>İncele</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
