export default function Loading() {
  return (
    <div>
      <div className="h-7 w-44 rounded bg-slate-200 animate-pulse" />
      <div className="mt-4 grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <div className="h-5 w-64 rounded bg-slate-200 animate-pulse" />
            <div className="mt-3 h-4 w-32 rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
