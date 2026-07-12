'use client';

import { useEffect } from 'react';
import Shell from '../components/Shell';
import { useDashboardStore } from '../stores/useDashboardStore';
import { formatINR, formatKg, formatDate } from '../utils/format';

const periods = [
  ['today', 'Today'],
  ['month', 'This Month'],
  ['year', 'This Year'],
];

function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}

/** S2 — Dashboard: period toggle, 4 stat cards, recent transactions. */
export default function DashboardPage() {
  const { period, data, loading, error, fetchDashboard } = useDashboardStore();

  useEffect(() => {
    fetchDashboard(useDashboardStore.getState().period);
  }, [fetchDashboard]);

  return (
    <Shell>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg border border-slate-200 p-1">
        {periods.map(([key, label]) => (
          <button
            key={key}
            onClick={() => fetchDashboard(key)}
            className={`min-h-[44px] rounded-lg text-sm transition-colors ${
              period === key
                ? 'bg-blue-700 font-medium text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

      {loading || !data ? (
        <p className="text-slate-600">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Procured" value={formatKg(data.totalKg)} />
            <Stat label="Payable" value={formatINR(data.totalPayable)} />
            <Stat label="Paid" value={formatINR(data.totalPaid)} tone="text-green-700" />
            <Stat
              label="Outstanding (all-time)"
              value={formatINR(data.outstanding)}
              tone={data.outstanding > 0 ? 'text-red-700' : 'text-green-700'}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {data.purchaseCount} purchase{data.purchaseCount === 1 ? '' : 's'} in this period
          </p>

          <h2 className="mb-2 mt-6 font-semibold">Recent transactions</h2>
          {!data.recentTransactions.length ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
              No transactions yet. Record your first purchase to get started.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {data.recentTransactions.map((t) => (
                <li key={`${t.type}-${t.id}`} className="flex items-center justify-between px-4 py-2">
                  <div>
                    <div className="font-medium">{t.farmerName}</div>
                    <div className="text-sm text-slate-600">
                      {t.type === 'purchase'
                        ? `${t.crop} · ${formatKg(t.totalKg)}`
                        : `Payment · ${t.mode.toUpperCase()}`}
                      {' · '}
                      {formatDate(t.date)}
                    </div>
                  </div>
                  <span className={`font-medium tabular-nums ${t.type === 'payment' ? 'text-green-700' : ''}`}>
                    {t.type === 'payment' ? '−' : ''}
                    {formatINR(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Shell>
  );
}
