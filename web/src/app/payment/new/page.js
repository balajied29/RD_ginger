'use client';

import { useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import { CheckIcon } from '../../../components/Icons';
import { usePaymentStore } from '../../../stores/usePaymentStore';
import { formatINR, todayISO } from '../../../utils/format';

const modes = [
  ['cash', 'Cash'],
  ['upi', 'UPI'],
  ['bank', 'Bank'],
];

/** S4 — Pay. Balance shown big before the amount; minimal words. */
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
    if (!farmer) return setMsg({ kind: 'err', text: 'Choose a farmer.' });
    const amt = parseFloat(amount);
    if (!(amt >= 1)) return setMsg({ kind: 'err', text: 'Write the money amount.' });

    if (
      amt > farmer.balance &&
      !window.confirm(`Amount is more than balance (${formatINR(farmer.balance)}). Save anyway?`)
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
      const over = r.warning === 'OVERPAYMENT' ? ' (more than balance)' : '';
      setMsg({ kind: 'ok', text: `Paid ${formatINR(amt)} — ${farmer.name}${over}` });
      setFarmer(null);
      setAmount('');
      setNotes('');
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-blue-700 focus:outline-none';

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Pay</h1>

      {msg && (
        <p
          className={`mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 ${
            msg.kind === 'ok' ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {msg.kind === 'ok' && <CheckIcon className="h-5 w-5 shrink-0" />}
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        <FarmerTypeahead value={farmer} onSelect={setFarmer} />

        {farmer && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-sm text-slate-600">To pay</div>
            <div
              className={`text-3xl font-semibold tabular-nums ${
                farmer.balance > 0 ? 'text-red-700' : 'text-green-700'
              }`}
            >
              {formatINR(farmer.balance)}
            </div>
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Money (₹)</span>
          <input
            type="number" inputMode="decimal" min="1" step="1"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="min-h-[64px] w-full rounded-lg border border-slate-200 px-4 text-3xl font-semibold tabular-nums focus:border-blue-700 focus:outline-none"
          />
        </label>

        <div>
          <span className="mb-1 block text-sm text-slate-600">How</span>
          <div className="grid grid-cols-3 gap-2">
            {modes.map(([key, label]) => (
              <button
                key={key} type="button" onClick={() => setMode(key)}
                className={`min-h-[48px] rounded-lg border text-lg transition-colors ${
                  mode === key
                    ? 'border-blue-700 bg-blue-700 font-medium text-white'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Notes (optional)</span>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
          </label>
        </div>

        <button
          type="button" onClick={submit} disabled={saving}
          className="min-h-[56px] w-full rounded-lg bg-blue-700 text-xl font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </Shell>
  );
}
