'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { slugify } from '@/lib/slug';

export default function NewPost() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);

  const genDraft = async () => {
    if (!title.trim() || drafting) return;
    setDrafting(true);
    try {
      const res = await fetch('/api/ai/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) });
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

      // Use distributed storage API to save to Supabase, local files, and backup
      const res = await fetch('/api/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', post: payload })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      const result = await res.json();

      // Show detailed success message
      alert(
        `✅ Post saved successfully!\n\n` +
        `☁️ Supabase: ${result.storage.supabase.success ? 'Saved' : 'Failed'}\n` +
        `💾 Local: ${result.storage.local.success ? 'Saved' : 'Failed'}\n` +
        `🔄 Backup: Created automatically`
      );

      // Redirect to the post if published
      if (status === 'published') {
        window.location.href = `/p/${finalSlug}`;
      }
    } catch (e: any) {
      alert('❌ Save failed: ' + (e?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 space-y-5 animate-fade-in">
      <h1 className="text-4xl font-bold gradient-text">New Post</h1>
      <div className="grid gap-4">
        <input className="input w-full" placeholder="Title" value={title}
          onChange={e => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} />
        <input className="input w-full" placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} />

        <div className="sticky top-16 z-10 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 backdrop-blur shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={genDraft} className="btn-outline whitespace-nowrap flex-none" disabled={!title || drafting}>
              {drafting ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
              {drafting ? 'Generating…' : 'AI Draft'}
            </button>
            <select value={status} onChange={e => setStatus(e.target.value as any)} className="input w-auto" style={{ width: 'auto' }}>
              <option value="draft">Draft</option>
              <option value="published">Publish now</option>
            </select>
          </div>
          <button onClick={save} disabled={!title || !body || saving} className="btn-primary whitespace-nowrap flex-none min-w-[100px]">
            {saving ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" /> : null}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        <textarea className="textarea font-mono w-full" rows={18} placeholder="Write in Markdown…" value={body} onChange={e => setBody(e.target.value)} />
      </div>
    </main>
  );
}
