import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";
import { LikeButton } from "@/components/LikeButton";
import { CommentForm } from "@/components/CommentForm";
import { CommentsList } from "@/components/CommentsList";
import { notFound } from "next/navigation";

function stripTrailingJson(md: string) {
  const trimmed = md.trimEnd();
  const lines = trimmed.split("\n");
  const last = lines[lines.length - 1]?.trim() ?? "";
  if (last.startsWith("{") && last.endsWith("}")) {
    try { JSON.parse(last); return lines.slice(0, -1).join("\n"); } catch { }
  }
  return md;
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: post, error } = await supabase
    .from("posts").select("*")
    .eq("slug", slug).eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!post) return notFound();

  const content = stripTrailingJson(post.content_md ?? "");
  const readTime = estimateReadTime(content);
  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : null;

  return (
    <article className="min-h-screen bg-white">
      {/* Article Header */}
      <header className="container mx-auto max-w-3xl px-4 pt-12 pb-8">
        <div className="space-y-6 animate-fade-in">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center gap-4 text-sm text-slate-600">
            {publishedDate && (
              <time className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {publishedDate}
              </time>
            )}

            <span className="text-slate-300">•</span>

            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {readTime} min read
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

          {/* Like Button */}
          <div className="flex items-center gap-4">
            <LikeButton postId={post.id} />
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container mx-auto max-w-3xl px-4 pb-12">
        <div className="markdown-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-slate-200 bg-slate-50">
        <section className="container mx-auto max-w-3xl px-4 py-12">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">Discussion</h2>
              <span className="text-sm text-slate-500">({0})</span>
            </div>

            <CommentForm postId={post.id} />
            <CommentsList postId={post.id} />
          </div>
        </section>
      </div>
    </article>
  );
}
