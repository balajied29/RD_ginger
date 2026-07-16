'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AddMoney from './AddMoney';
import { BagChips } from './EntryDetail';
import { api } from '../lib/api';
import { formatINR, formatKg, formatDate } from '../utils/format';

/**
 * Compact farmer history (S4) — the paying staff is often not the one
 * who recorded the purchases, so dates, bag counts, per-bag weights,
 * and past payments must be visible before money changes hands.
 * Unpriced purchases show an inline + Add ₹ control.
 */
export default function FarmerHistory({ farmer, onChanged }) {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    let alive = true;
    setEntries(null);
    api(`/api/farmers/${farmer._id}/ledger`)
      .then((r) => { if (alive) setEntries(r.data.entries.slice(-6).reverse()); })
      .catch(() => { if (alive) setEntries([]); });
    return () => { alive = false; };
  }, [farmer]);

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-600">History</span>
        <Link href={`/farmers/${farmer._id}`} className="text-sm text-blue-700 transition-colors hover:text-blue-800">
          See all
        </Link>
      </div>
      {!entries ? (
        <p className="rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-600">Loading…</p>
      ) : !entries.length ? (
        <p className="rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-600">Nothing yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 text-sm">
          {entries.map((e) => (
            <li key={`${e.type}-${e.id}`} className="px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {e.type === 'purchase'
                      ? `${e.bagCount} bag${e.bagCount === 1 ? '' : 's'} · ${formatKg(e.totalKg)}`
                      : `Paid · ${e.mode.toUpperCase()}`}
                  </div>
                  <div className="truncate text-xs text-slate-600">
                    {formatDate(e.date)}
                    {e.type === 'purchase' && e.crop ? ` · ${e.crop}` : ''}
                  </div>
                </div>
                {e.unpriced ? (
                  <AddMoney purchaseId={e.id} onAdded={onChanged} />
                ) : (
                  <span className={`shrink-0 font-semibold tabular-nums ${e.type === 'payment' ? 'text-green-700' : ''}`}>
                    {e.type === 'payment' ? '−' : '+'}
                    {formatINR(e.debit || e.credit)}
                  </span>
                )}
              </div>
              {e.type === 'purchase' && <BagChips bags={e.bags} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
