'use client';

import { useState } from 'react';
import Shell, { useAuth } from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import { CheckIcon } from '../../../components/Icons';
import { usePaymentStore } from '../../../stores/usePaymentStore';
import { formatINR, formatDate, todayISO } from '../../../utils/format';

const modes = [
  ['cash', 'Cash'],
  ['upi', 'UPI'],
  ['bank', 'Bank'],
];

function Receipt({ receipt, onDone }) {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const due = receipt.balanceAfter;

  const shareText = [
    'LEDGER — Payment Receipt',
    `No: ${receipt.no} · ${formatDate(receipt.date)}`,
    `Farmer: ${receipt.farmerName}${receipt.village ? ` (${receipt.village})` : ''}`,
    `Paid: ${formatINR(receipt.amount)} (${receipt.mode.toUpperCase()})`,
    due > 0 ? `Balance: ${formatINR(due)}` : due < 0 ? `Advance: ${formatINR(-due)}` : 'Fully paid',
    `By: ${user ? user.name : ''}`,
  ].join('\n');

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        setNote('Copied — paste it anywhere');
      }
    } catch { /* user cancelled the share sheet */ }
  }

  const row = 'flex items-baseline justify-between gap-3 py-1.5';

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-lg border border-slate-200 p-4">
        <div className="border-b border-slate-200 pb-3 text-center">
          <div className="text-xl font-semibold">LEDGER</div>
          <div className="text-sm text-slate-600">Payment Receipt</div>
        </div>

        <div className="border-b border-slate-200 py-3 text-sm">
          <div className={row}>
            <span className="text-slate-600">Receipt no</span>
            <span className="font-mono">{receipt.no}</span>
          </div>
          <div className={row}>
            <span className="text-slate-600">Date</span>
            <span>{formatDate(receipt.date)}</span>
          </div>
          <div className={row}>
            <span className="text-slate-600">Farmer</span>
            <span className="text-right font-medium">
              {receipt.farmerName}
              {receipt.village ? <span className="font-normal text-slate-600"> · {receipt.village}</span> : null}
            </span>
          </div>
        </div>

        <div className="border-b border-slate-200 py-3 text-center">
          <div className="text-sm text-slate-600">Paid ({receipt.mode.toUpperCase()})</div>
          <div className="text-4xl font-semibold tabular-nums text-green-700">
            {formatINR(receipt.amount)}
          </div>
        </div>

        <div className="py-3 text-center">
          {due > 0 ? (
            <>
              <div className="text-sm text-slate-600">Balance still to pay</div>
              <div className="text-2xl font-semibold tabular-nums text-red-700">{formatINR(due)}</div>
            </>
          ) : due < 0 ? (
            <>
              <div className="text-sm text-slate-600">Paid extra (advance)</div>
              <div className="text-2xl font-semibold tabular-nums text-green-700">{formatINR(-due)}</div>
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xl font-semibold text-green-700">
              <CheckIcon className="h-6 w-6" /> Fully paid
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-2 text-center text-xs text-slate-600">
          Received by {user ? user.name : ''}
        </div>
      </div>

      {note && <p className="mt-2 text-center text-sm text-green-700">{note}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2 print:hidden">
        <button
          onClick={share}
          className="min-h-[52px] rounded-lg bg-blue-700 text-lg font-medium text-white transition-colors hover:bg-blue-800"
        >
          Share
        </button>
        <button
          onClick={() => window.print()}
          className="min-h-[52px] rounded-lg border border-slate-200 text-lg text-slate-600 transition-colors hover:text-slate-900"
        >
          Print
        </button>
        <button
          onClick={onDone}
          className="col-span-2 min-h-[52px] rounded-lg border border-slate-200 text-lg text-slate-600 transition-colors hover:text-slate-900"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/** S4 — Pay. Saves the payment, then shows a shareable receipt. */
export default function NewPaymentPage() {
  const { saving, createPayment } = usePaymentStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'err', text }
  const [receipt, setReceipt] = useState(null);

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
      setFarmer(null);
      setAmount('');
      setNotes('');
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-blue-700 focus:outline-none';

  if (receipt) {
    return (
      <Shell>
        <Receipt receipt={receipt} onDone={() => setReceipt(null)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Pay</h1>

      {msg && (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-red-700">
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
