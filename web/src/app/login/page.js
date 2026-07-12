'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '../../lib/api';

/** S1 — Login. */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      setToken(r.data.token);
      router.replace('/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">LEDGER</h1>
          <p className="text-slate-600">Sign in to continue</p>
        </div>

        {error && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={busy}
          className="min-h-[44px] w-full rounded-lg bg-blue-700 font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
