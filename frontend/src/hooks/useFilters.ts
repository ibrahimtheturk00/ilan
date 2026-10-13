import { create } from "zustand";
import { FilterState } from "@/types";

interface FilterStore extends FilterState {
  setSearchQuery: (query: string) => void;
  setCity: (city: string) => void;
  setPostType: (postType: string) => void;
  setCategory: (category: string) => void;
  setSourceSlug: (sourceSlug: string) => void;
  setOnlyActive: (onlyActive: boolean) => void;
  setPage: (page: number) => void;
  setSortBy: (sort: FilterState["sortBy"]) => void;
  setKpssType: (kpssType: string) => void;
  setEducationLevel: (level: string) => void;
  setOnlyUrgent: (onlyUrgent: boolean) => void;
  resetFilters: () => void;
}

const initialState: FilterState = {
  searchQuery: "",
  city: "",
  postType: "",
  category: "",
  sourceSlug: "",
  onlyActive: true,
  page: 1,
  sortBy: "deadline_desc",
  kpssType: "",
  educationLevel: "",
  onlyUrgent: false,
};

export const useFilters = create<FilterStore>((set) => ({
  ...initialState,
  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setCity: (city) => set({ city, page: 1 }),
  setPostType: (postType) => set({ postType, page: 1 }),
  setCategory: (category) => set({ category, page: 1 }),
  setSourceSlug: (sourceSlug) => set({ sourceSlug, page: 1 }),
  setOnlyActive: (onlyActive) => set({ onlyActive, page: 1 }),
  setPage: (page) => set({ page }),
  setSortBy: (sort) => set({ sortBy: sort, page: 1 }),
  setKpssType: (kpssType) => set({ kpssType, page: 1 }),
  setEducationLevel: (educationLevel) => set({ educationLevel, page: 1 }),
  setOnlyUrgent: (onlyUrgent) => set({ onlyUrgent, page: 1 }),
  resetFilters: () => set(initialState),
}));
