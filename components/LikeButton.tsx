'use client';
import { useEffect, useState, useTransition } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [pending, start] = useTransition();

  useEffect(() => {
    let active = true;
    (async () => {
      const { count } = await supabase
        .from('reactions').select('*', { count: 'exact', head: true })
        .eq('post_id', postId).eq('kind','like');
      if (active) setCount(count ?? 0);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('reactions')
          .select('post_id')
          .eq('post_id', postId).eq('user_id', user.id).eq('kind','like')
          .maybeSingle();
        if (active) setLiked(!!data);
      }
    })();
    return () => { active = false; };
  }, [postId]);

  const toggle = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }

    start(async () => {
      if (liked) {
        await supabase.from('reactions')
          .delete().eq('post_id', postId).eq('user_id', user.id).eq('kind','like');
        setLiked(false); setCount(c => c - 1);
      } else {
        await supabase.from('reactions').upsert(
          { post_id: postId, user_id: user.id, kind: 'like' },
          { onConflict: 'post_id,user_id,kind' }
        );
        setLiked(true); setCount(c => c + 1);
      }
    });
  };

  return (
    <button
      disabled={pending}
      onClick={toggle}
      aria-pressed={liked}
      className={`btn ${liked ? 'bg-slate-900 text-white border-transparent hover:bg-slate-800' : ''}`}
      title={liked ? 'Unlike' : 'Like'}
    >
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${pending ? 'animate-pulse' : ''}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path d="M12 21s-6.716-4.364-9.193-7.23A5.5 5.5 0 1 1 12 6.318a5.5 5.5 0 1 1 9.193 7.452C18.716 16.636 12 21 12 21z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
