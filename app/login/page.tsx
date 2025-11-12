'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState<string|null>(null);

  const submit = async () => {
    setBusy(true); setMsg(null);
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message); else setMsg('Account created. You can sign in now.');
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    setBusy(false);
    if (!error) window.location.href = '/';
  };

  return (
    <main>
      <h1>{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      <div style={{display:'grid', gap:12, maxWidth:380}}>
        <input type="email" placeholder="Email" value={email}
          onChange={e=>setEmail(e.target.value)}
          style={{padding:8, border:'1px solid #ccc', borderRadius:6}} />
        <input type="password" placeholder="Password" value={password}
          onChange={e=>setPassword(e.target.value)}
          style={{padding:8, border:'1px solid #ccc', borderRadius:6}} />
        <button disabled={!email || !password || busy} onClick={submit} style={{padding:'6px 10px'}}>
          {busy ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>
        <button onClick={()=>setMode(mode==='signin'?'signup':'signin')} style={{padding:'6px 10px'}}>
          {mode === 'signin' ? 'Create an account' : 'I already have an account'}
        </button>
        {msg && <p style={{color:'#b00'}}>{msg}</p>}
      </div>
    </main>
  );
}
