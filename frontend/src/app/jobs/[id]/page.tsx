import { JobDetailClient } from "@/components/JobDetailClient";

import { supabase } from "@/lib/supabase";

export async function generateStaticParams() {
  if (supabase) {
    try {
      const { data } = await supabase.from("job_posts").select("id").limit(1000);
      if (data && data.length > 0) {
        return data.map((j) => ({ id: String(j.id) }));
      }
    } catch {
      // ignore
    }
  }

  // Fallback: 1..1000 arasındaki tüm olası ID'leri statik oluştur
  return Array.from({ length: 1000 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailClient id={params.id} />;
}
