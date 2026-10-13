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
  resetFilters: () => set(initialState),
}));
