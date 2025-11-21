import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { StorageStatus } from "@/components/StorageStatus";

export default async function Dashboard() {
    const { data: posts, error } = await supabase
        .from("posts")
        .select("title, slug, published_at, status")
        .order("published_at", { ascending: false });

    if (error) throw error;

    const publishedPosts = posts?.filter(p => p.status === 'published') ?? [];
    const draftPosts = posts?.filter(p => p.status === 'draft') ?? [];

    return (
        <div className="container mx-auto max-w-7xl px-4 py-10 space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
                <Link href="/new" className="btn-primary">
                    + New Post
                </Link>
            </div>

            {/* Storage Status */}
            <StorageStatus />

            {/* Published Posts */}
            <section>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">
                    📝 Published Posts ({publishedPosts.length})
                </h2>
                <div className="grid gap-4">
                    {publishedPosts.length === 0 ? (
                        <div className="card p-8 text-center text-slate-500">
                            No published posts yet. Create your first post!
                        </div>
                    ) : (
                        publishedPosts.map(p => (
                            <Link key={p.slug} href={`/p/${p.slug}`} className="card p-6 block group">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-slate-800 group-hover:text-purple-600 transition-colors mb-2">
                                            {p.title}
                                        </h3>
                                        <div className="text-sm text-slate-500">
                                            {p.published_at ? new Date(p.published_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : ""}
                                        </div>
                                    </div>
                                    <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        →
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* Draft Posts */}
            {draftPosts.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-slate-800">
                        ✏️ Drafts ({draftPosts.length})
                    </h2>
                    <div className="grid gap-4">
                        {draftPosts.map(p => (
                            <Link key={p.slug} href={`/new?slug=${p.slug}`} className="card p-6 block group border-dashed">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-slate-600 group-hover:text-purple-600 transition-colors mb-2">
                                            {p.title}
                                        </h3>
                                        <div className="text-sm text-slate-400">
                                            Draft - Not published yet
                                        </div>
                                    </div>
                                    <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                                        ✏️
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
