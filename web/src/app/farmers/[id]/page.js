'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Shell from '../../../components/Shell';
import AddMoney from '../../../components/AddMoney';
import { api } from '../../../lib/api';
import { formatINR, formatKg, formatDate } from '../../../utils/format';

function entryLabel(e) {
  return e.type === 'purchase'
    ? `Bought · ${e.crop} · ${e.bagCount} bags · ${formatKg(e.totalKg)}`
    : `Paid · ${e.mode.toUpperCase()}`;
}

/** Per-bag weights: "1) 50.2 kg  2) 48.9 kg …" as wrapping chips. */
function BagChips({ bags }) {
  if (!bags || !bags.length) return null;
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {bags.map((b) => (
        <span
          key={b.bagNo}
          className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-xs tabular-nums text-slate-600"
        >
          {b.bagNo}) {b.weightKg} kg
        </span>
      ))}
    </div>
  );
}

/**
 * S6 — Farmer ledger. Cards on phones (no sideways scrolling),
 * classic table from md up. Words kept minimal: Bought / Paid / Due.
 */
export default function FarmerLedgerPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (fromVal, toVal) => {
    setLoading(true);
    setError('');
    try {
      const r = await api(`/api/farmers/${id}/ledger`, { query: { from: fromVal, to: toVal } });
      setData(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load('', ''); }, [load]);

  const inputCls =
    'min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none';
  const dueTone = (n) => (n > 0 ? 'text-red-700' : 'text-green-700');

  return (
    <Shell>
      {error && <p className="mb-4 text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading…</p>}

      {!loading && data && (
        <>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{data.farmer.name}</h1>
              <p className="truncate text-sm text-slate-600">
                {[data.farmer.village, data.farmer.phone].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm text-slate-600">To pay</div>
              <div className={`text-2xl font-semibold tabular-nums ${dueTone(data.closingBalance)}`}>
                {formatINR(data.closingBalance)}
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); load(from, to); }}
            className="mb-4 grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">From</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-600">To</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
            </label>
            <button
              type="submit"
              className="col-span-2 min-h-[48px] rounded-lg bg-blue-700 px-5 text-white transition-colors hover:bg-blue-800 sm:col-span-1"
            >
              Show
            </button>
          </form>

          {!data.entries.length ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
              Nothing in these dates.
            </p>
          ) : (
            <>
              {/* Phone: stacked cards */}
              <ul className="space-y-2 md:hidden">
                {from && (
                  <li className="flex justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <span>Before {formatDate(from)}</span>
                    <span className="tabular-nums">{formatINR(data.openingBalance)}</span>
                  </li>
                )}
                {data.entries.map((e) => (
                  <li key={`${e.type}-${e.id}`} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-slate-600">{formatDate(e.date)}</span>
                      {e.unpriced ? (
                        <AddMoney purchaseId={e.id} onAdded={() => load(from, to)} />
                      ) : (
                        <span
                          className={`text-lg font-semibold tabular-nums ${
                            e.type === 'payment' ? 'text-green-700' : ''
                          }`}
                        >
                          {e.type === 'payment' ? '−' : '+'}
                          {formatINR(e.debit || e.credit)}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate text-sm">{entryLabel(e)}</span>
                      <span className={`shrink-0 text-sm tabular-nums ${dueTone(e.balance)}`}>
                        Due {formatINR(e.balance)}
                      </span>
                    </div>
                    {e.notes && <div className="mt-0.5 text-sm text-slate-600">{e.notes}</div>}
                    <BagChips bags={e.bags} />
                  </li>
                ))}
              </ul>

              {/* md+: table */}
              <div className="hidden overflow-x-auto rounded-lg border border-slate-200 md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">What</th>
                      <th className="px-3 py-2 text-right font-medium">Bought (₹)</th>
                      <th className="px-3 py-2 text-right font-medium">Paid (₹)</th>
                      <th className="px-3 py-2 text-right font-medium">Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    {from && (
                      <tr className="border-b border-slate-200 text-slate-600">
                        <td className="px-3 py-2" colSpan={4}>Before {formatDate(from)}</td>
                        <td className="px-3 py-2 text-right">{formatINR(data.openingBalance)}</td>
                      </tr>
                    )}
                    {data.entries.map((e) => (
                      <tr key={`${e.type}-${e.id}`} className="border-b border-slate-200 last:border-b-0">
                        <td className="whitespace-nowrap px-3 py-2">{formatDate(e.date)}</td>
                        <td className="px-3 py-2">
                          {entryLabel(e)}
                          {e.notes ? <span className="text-slate-600"> · {e.notes}</span> : null}
                          <BagChips bags={e.bags} />
                        </td>
                        <td className="px-3 py-2 text-right">
                          {e.unpriced ? (
                            <AddMoney purchaseId={e.id} onAdded={() => load(from, to)} />
                          ) : e.debit ? (
                            formatINR(e.debit)
                          ) : (
                            ''
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-green-700">{e.credit ? formatINR(e.credit) : ''}</td>
                        <td className={`px-3 py-2 text-right font-medium ${dueTone(e.balance)}`}>
                          {formatINR(e.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </Shell>
  );
}
