'use client';

import { useState } from 'react';
import { api } from '../lib/api';

/**
 * Inline control for the two-staff workflow: a purchase saved with
 * bags only shows "₹ not added"; any staff taps Add ₹, types the
 * negotiated amount, and the balance starts counting it.
 */
export default function AddMoney({ purchaseId, onAdded }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-[36px] rounded-lg border border-yellow-700 px-2 text-sm font-medium text-yellow-700 transition-colors hover:bg-slate-50"
      >
        + Add ₹
      </button>
    );
  }

  async function save(e) {
    e.preventDefault();
    const amt = parseFloat(val);
    if (!(amt >= 1)) return;
    setBusy(true);
    setError('');
    try {
      await api(`/api/purchases/${purchaseId}`, { method: 'PATCH', body: { totalAmount: amt } });
      onAdded();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="flex items-center gap-1">
      <input
        autoFocus
        type="number" inputMode="decimal" min="1" step="1"
        value={val} onChange={(e) => setVal(e.target.value)}
        placeholder="₹"
        className="min-h-[40px] w-24 rounded-lg border border-slate-200 px-2 tabular-nums focus:border-blue-700 focus:outline-none"
      />
      <button
        type="submit" disabled={busy}
        className="min-h-[40px] rounded-lg bg-blue-700 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
      >
        {busy ? '…' : 'Save'}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </form>
  );
}
