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
    try { JSON.parse(last); return lines.slice(0, -1).join("\n"); } catch {}
  }
  return md;
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

  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold">{post.title}</h1>

      <div>
        <LikeButton postId={post.id} />
      </div>

      {/* centered, readable typography */}
      <div className="prose prose-slate mx-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Comments</h2>
        <CommentForm postId={post.id} />
        <CommentsList postId={post.id} />
      </section>
    </article>
  );
}
