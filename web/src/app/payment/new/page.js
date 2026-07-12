'use client';

import { useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import { usePaymentStore } from '../../../stores/usePaymentStore';
import { formatINR, todayISO } from '../../../utils/format';

const modes = [
  ['cash', 'Cash'],
  ['upi', 'UPI'],
  ['bank', 'Bank'],
];

/**
 * S4 — Record Payment. Current balance shown prominently before the
 * amount input; overpayment asks for confirmation before submitting.
 */
export default function NewPaymentPage() {
  const { saving, createPayment } = usePaymentStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'err', text }

  async function submit() {
    setMsg(null);
    if (!farmer) return setMsg({ kind: 'err', text: 'Select a farmer first.' });
    const amt = parseFloat(amount);
    if (!(amt >= 1)) return setMsg({ kind: 'err', text: 'Enter an amount of at least ₹1.' });

    if (
      amt > farmer.balance &&
      !window.confirm(
        `This payment (${formatINR(amt)}) exceeds ${farmer.name}'s current balance of ${formatINR(farmer.balance)}. Record it anyway?`
      )
    ) {
      return;
    }

    try {
      const r = await createPayment({
        farmerId: farmer._id,
        date,
        amount: amt,
        mode,
        notes: notes.trim(),
      });
      const over = r.warning === 'OVERPAYMENT' ? ' (overpayment recorded)' : '';
      setMsg({ kind: 'ok', text: `Paid ${formatINR(amt)} to ${farmer.name}${over}.` });
      setFarmer(null);
      setAmount('');
      setNotes('');
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none';

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Record Payment</h1>

      {msg && (
        <p
          className={`mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm ${
            msg.kind === 'ok' ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        <FarmerTypeahead value={farmer} onSelect={setFarmer} />

        {farmer && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm text-slate-600">Current balance due</div>
            <div
              className={`text-2xl font-semibold tabular-nums ${
                farmer.balance > 0 ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {formatINR(farmer.balance)}
            </div>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Amount (₹)</span>
          <input
            type="number" inputMode="decimal" min="1" step="0.01"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className="min-h-[52px] w-full rounded-lg border border-slate-200 px-3 text-2xl tabular-nums focus:border-blue-700 focus:outline-none"
          />
        </label>

        <div>
          <span className="mb-1 block text-sm text-slate-600">Mode</span>
          <div className="grid grid-cols-3 gap-2">
            {modes.map(([key, label]) => (
              <button
                key={key} type="button" onClick={() => setMode(key)}
                className={`min-h-[44px] rounded-lg border transition-colors ${
                  mode === key
                    ? 'border-blue-700 bg-blue-700 text-white'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Notes (optional)</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </label>

        <button
          type="button" onClick={submit} disabled={saving}
          className="min-h-[52px] w-full rounded-lg bg-blue-700 text-lg font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Record Payment'}
        </button>
      </div>
    </Shell>
  );
}
