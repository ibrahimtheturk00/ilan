import { MetadataRoute } from "next";
import { fetchJobPosts } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamuilanmerkezi.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
  ];

  try {
    const { data: jobs } = await fetchJobPosts({ page: 1, pageSize: 100 });
    const jobRoutes: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.published_at ? new Date(job.published_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticRoutes, ...jobRoutes];
  } catch (e) {
    console.error("Sitemap generation fallback:", e);
    return staticRoutes;
  }
}
