export default function LoadingNew() {
  return (
    <div className="max-w-3xl">
      <div className="h-7 w-40 rounded bg-slate-200 animate-pulse" />
      <div className="mt-4 card p-4 space-y-3">
        <div className="h-10 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-10 w-1/2 rounded bg-slate-200 animate-pulse" />
        <div className="flex gap-3">
          <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-9 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="h-9 w-24 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="h-80 w-full rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}
