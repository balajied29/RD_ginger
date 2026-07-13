'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { useFarmerStore } from '../stores/useFarmerStore';
import { formatINR } from '../utils/format';

/**
 * Farmer search with inline create (S3/S4). Selected farmer includes
 * the server-computed balance. onSelect(null) clears the selection.
 */
export default function FarmerTypeahead({ value, onSelect }) {
  const { farmers, fetchFarmers, createFarmer } = useFarmerStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchFarmers(q), 250);
    return () => clearTimeout(timer.current);
  }, [q, open, fetchFarmers]);

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <div>
          <div className="text-lg font-medium">{value.name}</div>
          <div className="text-sm text-slate-600">
            {value.village ? `${value.village} · ` : ''}
            To pay:{' '}
            <span className={`tabular-nums ${value.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatINR(value.balance)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="min-h-[44px] px-3 text-sm text-blue-700 transition-colors hover:text-blue-800"
        >
          Change
        </button>
      </div>
    );
  }

  async function handleCreate() {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      // Duplicate guard: a second "Kong Bala" silently splits one
      // farmer's history. Check against a FRESH server search — the
      // local list may not have loaded yet (250ms debounce race).
      const name = q.trim();
      const fresh = await api('/api/farmers', { query: { search: name } });
      const dup = fresh.data.find((f) => f.name.toLowerCase() === name.toLowerCase());
      if (dup && !window.confirm(`"${dup.name}" already exists. Make one more with the same name?`)) {
        setBusy(false);
        return;
      }
      onSelect(await createFarmer({ name }));
      setOpen(false);
      setQ('');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Farmer name…"
        className="min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-blue-700 focus:outline-none"
      />
      {error && <p className="mt-1 text-sm text-red-700">{error}</p>}
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          {farmers.map((f) => (
            <button
              key={f._id}
              type="button"
              onClick={() => { onSelect(f); setOpen(false); setQ(''); }}
              className="flex min-h-[44px] w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <span>
                {f.name}
                {f.village ? <span className="text-slate-600"> · {f.village}</span> : null}
              </span>
              <span className={`text-sm tabular-nums ${f.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {formatINR(f.balance)}
              </span>
            </button>
          ))}
          {q.trim() && (
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy}
              className="min-h-[44px] w-full px-3 py-2 text-left text-blue-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              + Add “{q.trim()}”
            </button>
          )}
          {!farmers.length && !q.trim() && (
            <div className="px-3 py-3 text-sm text-slate-600">Type a name…</div>
          )}
        </div>
      )}
    </div>
  );
}
