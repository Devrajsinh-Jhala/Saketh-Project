import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("title, slug, published_at")
    .eq("status","published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Latest Posts</h1>
      <div className="grid gap-4">
        {(posts ?? []).map(p => (
          <Link key={p.slug} href={`/p/${p.slug}`} className="card card-hover block">
            <div className="text-lg font-medium">{p.title}</div>
            <div className="mt-1 text-xs text-gray-500">
              {p.published_at ? new Date(p.published_at).toLocaleString() : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
