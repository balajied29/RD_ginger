'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken } from '../lib/api';
import Nav from './Nav';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/**
 * Auth guard + page chrome for every protected screen. Redirects to
 * /login when there is no token, restores the session via /api/auth/me,
 * and registers the PWA service worker.
 */
export default function Shell({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    api('/api/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => setFailed(true)); // 401 already redirects via api()

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [router]);

  function logout() {
    setToken(null);
    router.replace('/login');
  }

  if (failed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-slate-600">Could not restore your session.</p>
        <button
          onClick={logout}
          className="min-h-[44px] rounded-lg bg-blue-700 px-4 text-white transition-colors hover:bg-blue-800"
        >
          Go to login
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Loading…
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      <Nav user={user} onLogout={logout} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 sm:px-6">{children}</main>
    </AuthContext.Provider>
  );
}
