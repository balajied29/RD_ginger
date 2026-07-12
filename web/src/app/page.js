'use client';

import { useEffect } from 'react';
import Shell from '../components/Shell';
import { useDashboardStore } from '../stores/useDashboardStore';
import { formatINR, formatKg, formatDate } from '../utils/format';

const periods = [
  ['today', 'Today'],
  ['month', 'Month'],
  ['year', 'Year'],
];

function Stat({ label, value, tone = '' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums sm:text-2xl ${tone}`}>{value}</div>
    </div>
  );
}

/** S2 — Home: period toggle, 4 stat cards, recent list. Minimal words. */
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
            className={`min-h-[44px] rounded-lg transition-colors ${
              period === key
                ? 'bg-blue-700 font-medium text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      {/* Stale-while-revalidate: cached data renders instantly, dimmed while refreshing. */}
      {!data ? (
        !error && <p className="text-slate-600">Loading…</p>
      ) : (
        <div className={loading ? 'opacity-60' : ''}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Bought (kg)" value={formatKg(data.totalKg)} />
            <Stat label="Bought (₹)" value={formatINR(data.totalPayable)} />
            <Stat label="Paid (₹)" value={formatINR(data.totalPaid)} tone="text-green-700" />
            <Stat
              label="To pay (₹)"
              value={formatINR(data.outstanding)}
              tone={data.outstanding > 0 ? 'text-red-700' : 'text-green-700'}
            />
          </div>
          <p className="mt-2 text-sm text-slate-600">
            {data.purchaseCount} purchase{data.purchaseCount === 1 ? '' : 's'} · To pay is all-time
          </p>

          <h2 className="mb-2 mt-6 text-lg font-semibold">Recent</h2>
          {!data.recentTransactions.length ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
              Nothing yet. Tap <span className="font-semibold text-slate-900">Buy</span> to start.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {data.recentTransactions.map((t) => (
                <li key={`${t.type}-${t.id}`} className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-2">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{t.farmerName}</div>
                    <div className="truncate text-sm text-slate-600">
                      {t.type === 'purchase'
                        ? `Bought · ${t.crop} · ${formatKg(t.totalKg)}`
                        : `Paid · ${t.mode.toUpperCase()}`}
                      {' · '}
                      {formatDate(t.date)}
                    </div>
                  </div>
                  <span className={`shrink-0 font-semibold tabular-nums ${t.type === 'payment' ? 'text-green-700' : ''}`}>
                    {t.type === 'payment' ? '−' : ''}
                    {formatINR(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Shell>
  );
}
