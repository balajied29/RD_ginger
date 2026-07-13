'use client';

import { useMemo, useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import FarmerHistory from '../../../components/FarmerHistory';
import PaymentReceipt from '../../../components/PaymentReceipt';
import { api } from '../../../lib/api';
import { useDraft } from '../../../lib/useDraft';
import { usePaymentStore } from '../../../stores/usePaymentStore';
import { formatINR, todayISO } from '../../../utils/format';

const modes = [['cash', 'Cash'], ['upi', 'UPI'], ['bank', 'Bank']];

/**
 * S4 — Pay. Shows the farmer's history (bags, kgs, payments) before
 * money is entered, then a shareable receipt. Smart form: autosaves
 * to this phone and restores if the staff gets distracted.
 */
export default function NewPaymentPage() {
  const { saving, createPayment } = usePaymentStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'err', text }
  const [receipt, setReceipt] = useState(null);

  const draftState = useMemo(
    () => ({ farmer, date, amount, mode, notes }),
    [farmer, date, amount, mode, notes]
  );
  const { clearDraft } = useDraft('ledger_draft_pay', draftState, (d) => {
    if (d.date) setDate(d.date);
    if (d.amount) setAmount(d.amount);
    if (d.mode) setMode(d.mode);
    if (d.notes) setNotes(d.notes);
    if (d.farmer) {
      setFarmer(d.farmer); // instant restore…
      api(`/api/farmers/${d.farmer._id}`) // …then refresh the balance
        .then((r) => setFarmer(r.data))
        .catch(() => setFarmer(null));
    }
  });

  const dirty = farmer || amount || notes;

  function resetAll() {
    setFarmer(null);
    setDate(todayISO());
    setAmount('');
    setMode('cash');
    setNotes('');
    setMsg(null);
    clearDraft();
  }

  async function refreshFarmer() {
    try {
      const r = await api(`/api/farmers/${farmer._id}`);
      setFarmer(r.data);
    } catch { /* keep showing current data */ }
  }

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
      setReceipt({
        no: `#${String(r.data._id).slice(-8).toUpperCase()}`,
        date: r.data.date,
        amount: r.data.amount,
        mode: r.data.mode,
        farmerName: farmer.name,
        village: farmer.village || '',
        balanceAfter: r.data.balanceAfter,
      });
      resetAll();
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-blue-700 focus:outline-none';

  if (receipt) {
    return (
      <Shell>
        <PaymentReceipt receipt={receipt} onDone={() => setReceipt(null)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pay</h1>
        {dirty && (
          <button
            type="button"
            onClick={resetAll}
            className="min-h-[44px] px-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
          >
            Clear
          </button>
        )}
      </div>
      <p className="mb-4 text-xs text-slate-600">Saves by itself — safe to close anytime.</p>

      {msg && (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-red-700">
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        <FarmerTypeahead value={farmer} onSelect={setFarmer} />

        {farmer && (
          <>
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
            <FarmerHistory farmer={farmer} onChanged={refreshFarmer} />
          </>
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
                className={`min-h-[48px] rounded-lg border text-lg transition-colors ${mode === key ? 'border-blue-700 bg-blue-700 font-medium text-white' : 'border-slate-200 text-slate-600 hover:text-slate-900'}`}
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
