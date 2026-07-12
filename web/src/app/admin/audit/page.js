'use client';

import { useCallback, useEffect, useState } from 'react';
import Shell from '../../../components/Shell';
import { api } from '../../../lib/api';

/** S7 — Audit log viewer (admin only; server enforces the role). */
export default function AuditPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page) => {
    setLoading(true);
    setError('');
    try {
      const r = await api('/api/audit', { query: { page } });
      setData(r.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Audit Log</h1>

      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-slate-600">Loading…</p>}

      {!loading && data && !data.items.length && (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center text-slate-600">
          No audit entries yet.
        </p>
      )}

      {!loading && data && data.items.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                  <th className="px-3 py-2 font-medium">When</th>
                  <th className="px-3 py-2 font-medium">Who</th>
                  <th className="px-3 py-2 font-medium">Action</th>
                  <th className="px-3 py-2 font-medium">Collection</th>
                  <th className="px-3 py-2 font-medium">Document</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log._id} className="border-b border-slate-200 last:border-b-0 align-top">
                    <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                      {new Date(log.at).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-3 py-2">{log.actorId ? log.actorId.name : '—'}</td>
                    <td
                      className={`px-3 py-2 font-medium ${
                        log.action === 'DELETE'
                          ? 'text-red-700'
                          : log.action === 'UPDATE'
                            ? 'text-yellow-700'
                            : 'text-green-700'
                      }`}
                    >
                      {log.action}
                    </td>
                    <td className="px-3 py-2">{log.collectionName}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{log.documentId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              disabled={data.page <= 1}
              onClick={() => load(data.page - 1)}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-slate-600 tabular-nums">
              Page {data.page} of {data.totalPages}
            </span>
            <button
              disabled={data.page >= data.totalPages}
              onClick={() => load(data.page + 1)}
              className="min-h-[44px] rounded-lg border border-slate-200 px-4 text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </Shell>
  );
}
