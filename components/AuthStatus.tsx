'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export function AuthStatus() {
  const [email, setEmail] = useState<string|null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!email) {
    return (
      <Link href="/login" className="btn-primary">Login</Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">{email}</span>
      <button className="btn-ghost" onClick={() => supabase.auth.signOut().then(() => location.reload())}>
        Sign out
      </button>
    </div>
  );
}
