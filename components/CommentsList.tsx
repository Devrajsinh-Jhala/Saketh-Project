'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type C = { id:string; user_display:string|null; body:string; created_at:string };

export function CommentsList({ postId }: { postId:string }) {
  const [items, setItems] = useState<C[]|null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from('comments')
        .select('id,user_display,body,created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) console.error(error);
      setItems(data ?? []);
    })();
    return () => { active = false; };
  }, [postId]);

  if (!items) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="h-3 w-48 rounded bg-slate-200 animate-pulse" />
            <div className="mt-2 h-4 w-full rounded bg-slate-100 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Be the first to comment.</p>;
  }

  return (
    <div className="grid gap-3">
      {items.map(c => (
        <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-[12px] text-slate-500">
            {c.user_display ?? 'User'} · {new Date(c.created_at).toLocaleString()}
          </div>
          <p className="mt-2 whitespace-pre-wrap">{c.body}</p>
        </div>
      ))}
    </div>
  );
}
