import { useQuery } from "@tanstack/react-query";
import { fetchJobPosts, fetchJobById } from "@/lib/supabase";
import { FilterState } from "@/types";

export function useJobs(filters: FilterState) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => fetchJobPosts(filters),
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  });
}

export function useJobDetail(id: number | string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJobById(id),
    staleTime: 1000 * 60 * 10,
    enabled: Boolean(id),
  });
}
