'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Shell from '../../../components/Shell';
import { api } from '../../../lib/api';
import { formatINR, formatKg, formatDate } from '../../../utils/format';

/** S6 — Farmer Ledger: chronological debits/credits with running balance. */
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
    'min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none';

  return (
    <Shell>
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading…</p>}

      {!loading && data && (
        <>
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">{data.farmer.name}</h1>
              <p className="text-sm text-slate-600">
                {[data.farmer.village, data.farmer.phone].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Balance due</div>
              <div
                className={`text-xl font-semibold tabular-nums ${
                  data.closingBalance > 0 ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {formatINR(data.closingBalance)}
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); load(from, to); }}
            className="mb-4 flex items-end gap-2"
          >
            <label className="block flex-1">
              <span className="mb-1 block text-sm text-slate-600">From</span>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-sm text-slate-600">To</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
            </label>
            <button
              type="submit"
              className="min-h-[44px] rounded-lg bg-blue-700 px-4 text-white transition-colors hover:bg-blue-800"
            >
              Apply
            </button>
          </form>

          {!data.entries.length ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
              No transactions in this range.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Particulars</th>
                    <th className="px-3 py-2 text-right font-medium">Debit</th>
                    <th className="px-3 py-2 text-right font-medium">Credit</th>
                    <th className="px-3 py-2 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums">
                  {from && (
                    <tr className="border-b border-slate-200 text-slate-600">
                      <td className="px-3 py-2" colSpan={4}>Opening balance</td>
                      <td className="px-3 py-2 text-right">{formatINR(data.openingBalance)}</td>
                    </tr>
                  )}
                  {data.entries.map((e) => (
                    <tr key={`${e.type}-${e.id}`} className="border-b border-slate-200 last:border-b-0">
                      <td className="whitespace-nowrap px-3 py-2">{formatDate(e.date)}</td>
                      <td className="px-3 py-2">
                        {e.type === 'purchase'
                          ? `${e.crop} — ${e.bagCount} bag${e.bagCount === 1 ? '' : 's'}, ${formatKg(e.totalKg)}`
                          : `Payment (${e.mode.toUpperCase()})`}
                        {e.notes ? <span className="text-slate-600"> · {e.notes}</span> : null}
                      </td>
                      <td className="px-3 py-2 text-right">{e.debit ? formatINR(e.debit) : ''}</td>
                      <td className="px-3 py-2 text-right text-green-700">{e.credit ? formatINR(e.credit) : ''}</td>
                      <td className={`px-3 py-2 text-right font-medium ${e.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {formatINR(e.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}
