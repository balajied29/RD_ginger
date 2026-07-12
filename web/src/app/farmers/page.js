'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Shell from '../../components/Shell';
import { useFarmerStore } from '../../stores/useFarmerStore';
import { formatINR } from '../../utils/format';

/** S5 — Farmer list: search, balance column, tap → ledger. */
export default function FarmersPage() {
  const { farmers, loading, error, fetchFarmers } = useFarmerStore();
  const [search, setSearch] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchFarmers(search), 250);
    return () => clearTimeout(timer.current);
  }, [search, fetchFarmers]);

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Farmers</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name…"
        className="mb-4 min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none"
      />

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading…</p>}

      {!loading && !farmers.length && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
          {search ? 'No farmers match your search.' : 'No farmers yet — add one from the New Purchase screen.'}
        </p>
      )}

      {!loading && farmers.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {farmers.map((f) => (
            <li key={f._id}>
              <Link
                href={`/farmers/${f._id}`}
                className="flex min-h-[56px] items-center justify-between px-4 py-2 transition-colors hover:bg-slate-50"
              >
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-slate-600">
                    {[f.village, f.phone].filter(Boolean).join(' · ') || '—'}
                  </div>
                </div>
                <span
                  className={`font-medium tabular-nums ${
                    f.balance > 0 ? 'text-red-700' : 'text-green-700'
                  }`}
                >
                  {formatINR(f.balance)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
