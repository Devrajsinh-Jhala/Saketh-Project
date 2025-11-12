export default function LoadingPost() {
  return (
    <article className="prose prose-slate max-w-none">
      <div className="h-8 w-2/3 rounded bg-slate-200 animate-pulse" />
      <div className="mt-3 h-8 w-20 rounded bg-slate-100 animate-pulse" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 w-full rounded bg-slate-100 animate-pulse" />
        ))}
      </div>
    </article>
  );
}
