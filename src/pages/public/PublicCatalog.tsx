import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function PublicCatalog() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/public/sales-pages/catalog/${slug}`).then((r) => setData(r.data)).catch(() => setErr("Mentor não encontrado"));
  }, [slug]);

  if (err) return <div className="p-10 text-center">{err}</div>;
  if (!data) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto p-6 grid gap-6 md:grid-cols-3">
      {data.pages.map((p: any) => (
        <Link key={p.id} to={`/p/${slug}/${p.slug}`} className="border rounded-xl p-4">
          {p.coverUrl && <img src={p.coverUrl} alt={p.title} className="rounded mb-2" />}
          <div className="font-semibold">{p.title}</div>
          <div className="text-sm text-muted-foreground">R$ {(p.priceCents / 100).toFixed(2)}</div>
        </Link>
      ))}
    </div>
  );
}
