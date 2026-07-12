/**
 * Single fetch wrapper (Section 2.2 #8): attaches the JWT from
 * memory + localStorage, redirects to /login on 401. Every response
 * is the canonical { success, data, error?, warning? } envelope.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'ledger_token';

let token = null;

export function setToken(t) {
  token = t;
  if (typeof window === 'undefined') return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken() {
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem(TOKEN_KEY);
  }
  return token;
}

export async function api(path, { method = 'GET', body, query } = {}) {
  const url = new URL(API_BASE + path);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const headers = { 'Content-Type': 'application/json' };
  const jwt = getToken();
  if (jwt) headers.Authorization = `Bearer ${jwt}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection.');
  }

  if (res.status === 401 && !path.startsWith('/api/auth/login')) {
    setToken(null);
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please sign in again.');
  }

  const json = await res.json().catch(() => null);
  if (!json || !json.success) {
    throw new Error((json && json.error) || 'Request failed');
  }
  return json; // { success, data, warning? }
}
