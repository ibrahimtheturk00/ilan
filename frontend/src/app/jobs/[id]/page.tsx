import { JobDetailClient } from "@/components/JobDetailClient";

export async function generateStaticParams() {
  // İlk 200 ID için statik yol oluştur
  return Array.from({ length: 200 }, (_, i) => ({
    id: String(i + 1),
  }));
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return <JobDetailClient id={params.id} />;
}
