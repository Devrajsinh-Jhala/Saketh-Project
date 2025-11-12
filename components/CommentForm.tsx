'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function CommentForm({ postId }: { postId: string }) {
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }

    setBusy(true); setMsg(null);
    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      user_display: user.email,
      body
    });
    setBusy(false);
    if (error) setMsg(error.message);
    else { setBody(''); setMsg('Comment added.'); }
  };

  return (
    <div className="space-y-2">
      <textarea
        rows={3}
        placeholder="Write a comment…"
        value={body}
        onChange={e => setBody(e.target.value)}
        className="textarea"
      />
      <div className="flex items-center gap-3">
        <button className="btn" disabled={!body.trim() || busy} onClick={submit}>
          {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />}
          Comment
        </button>
        {msg && <span className="text-sm text-slate-600">{msg}</span>}
      </div>
    </div>
  );
}
