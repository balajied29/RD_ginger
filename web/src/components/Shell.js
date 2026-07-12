'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, setToken } from '../lib/api';
import Nav from './Nav';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const USER_KEY = 'ledger_user';

// Session is validated against the API at most once per minute — page
// switches render instantly from the cached user instead of blocking
// on a network round-trip every time.
let lastValidated = 0;
const VALIDATE_MS = 60 * 1000;

export function cacheUser(u) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  } catch { /* storage full/blocked — cache is best-effort */ }
}

/**
 * Auth guard + page chrome for every protected screen. Redirects to
 * /login when there is no token; renders instantly from the cached
 * user and re-validates the session in the background.
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
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { /* ignore */ }
    if (cached) setUser(cached);

    if (!cached || Date.now() - lastValidated > VALIDATE_MS) {
      api('/api/auth/me')
        .then((r) => {
          lastValidated = Date.now();
          setUser(r.data);
          cacheUser(r.data);
        })
        .catch(() => { if (!cached) setFailed(true); }); // 401 already redirects via api()
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, [router]);

  function logout() {
    setToken(null);
    try { localStorage.removeItem(USER_KEY); } catch { /* ignore */ }
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
