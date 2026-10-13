"use client";

import { useFilters } from "@/hooks/useFilters";

interface PostTypeOption {
  key: string;
  label: string;
  activeColor: string;
  dotColor: string;
}

const POST_TYPES: PostTypeOption[] = [
  {
    key: "",
    label: "Tüm Kadrolar",
    activeColor: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm border-transparent",
    dotColor: "bg-slate-400 dark:bg-slate-600",
  },
  {
    key: "memur",
    label: "Memur",
    activeColor: "bg-sky-600 text-white dark:bg-sky-500 dark:text-white shadow-sm shadow-sky-500/20 border-transparent",
    dotColor: "bg-sky-500",
  },
  {
    key: "sozlesmeli",
    label: "Sözleşmeli",
    activeColor: "bg-teal-600 text-white dark:bg-teal-500 dark:text-white shadow-sm shadow-teal-500/20 border-transparent",
    dotColor: "bg-teal-500",
  },
  {
    key: "isci",
    label: "İşçi",
    activeColor: "bg-amber-600 text-white dark:bg-amber-500 dark:text-white shadow-sm shadow-amber-500/20 border-transparent",
    dotColor: "bg-amber-500",
  },
  {
    key: "akademik",
    label: "Akademik",
    activeColor: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white shadow-sm shadow-purple-500/20 border-transparent",
    dotColor: "bg-purple-500",
  },
];

export function PostTypeQuickFilter() {
  const { postType, setPostType } = useFilters();

  return (
    <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
      {POST_TYPES.map((item) => {
        const isSelected = postType === item.key;
        return (
          <button
            key={item.key || "all"}
            type="button"
            onClick={() => setPostType(item.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
              isSelected
                ? item.activeColor
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                isSelected ? "bg-white dark:bg-slate-900" : item.dotColor
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
