'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/slug';

export default function NewPost() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'draft'|'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const genDraft = async () => {
    if (!title.trim() || drafting) return;
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/draft', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title }) });
      if (!res.ok) throw new Error(await res.text());
      const { draft } = await res.json();
      setBody(draft);
    } catch (e: any) {
      alert(e?.message || 'AI draft failed');
    } finally {
      setDrafting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/login'; return; }

      const finalSlug = slug || slugify(title);
      const payload = {
        author_id: user.id, title, slug: finalSlug, content_md: body,
        status, published_at: status === 'published' ? new Date().toISOString() : null
      };

      const { data: existing } = await supabase.from('posts').select('id').eq('slug', finalSlug).maybeSingle();
      if (existing) {
        const { error } = await supabase.from('posts').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('posts').insert(payload);
        if (error) throw error;
      }
      alert('Saved!');
    } catch (e: any) {
      alert(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-semibold">New Post</h1>
      <div className="grid gap-3">
        <input className="input" placeholder="Title" value={title}
          onChange={e => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} />
        <input className="input" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} />

        <div className="sticky top-16 z-10 flex items-center gap-2 rounded-lg border bg-white/90 p-2 backdrop-blur">
          <button onClick={genDraft} className="btn-outline" disabled={!title || drafting}>
            {drafting ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
            {drafting ? 'Generating…' : 'AI Draft'}
          </button>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="input w-auto">
            <option value="draft">Draft</option>
            <option value="published">Publish now</option>
          </select>
          <button onClick={save} disabled={!title || !body || saving} className="btn-primary">
            {saving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : null}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <textarea className="textarea font-mono" rows={18} placeholder="Write in Markdown…" value={body} onChange={e => setBody(e.target.value)} />
      </div>
    </main>
  );
}
