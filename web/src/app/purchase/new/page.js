'use client';

import { useMemo, useRef, useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import { usePurchaseStore } from '../../../stores/usePurchaseStore';
import { formatINR, formatKg, todayISO } from '../../../utils/format';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * S3 — New Purchase. Rapid bag entry: type weight → Enter → next bag
 * auto-numbered. Running totals always visible. Extra-large weight
 * input for one-handed use next to a weighing scale.
 */
export default function NewPurchasePage() {
  const { saving, createPurchase } = usePurchaseStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [crop, setCrop] = useState('');
  const [rate, setRate] = useState('');
  const [bags, setBags] = useState([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'ok' | 'err', text }
  const weightRef = useRef(null);

  const totalKg = useMemo(() => round2(bags.reduce((s, b) => s + b.weightKg, 0)), [bags]);
  const totalAmount = useMemo(
    () => round2(totalKg * (parseFloat(rate) || 0)),
    [totalKg, rate]
  );

  function addBag(e) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w < 0.1) return;
    setBags((b) => [...b, { bagNo: b.length + 1, weightKg: round2(w) }]);
    setWeight('');
    weightRef.current?.focus();
  }

  function removeBag(i) {
    setBags((b) =>
      b.filter((_, idx) => idx !== i).map((bag, idx) => ({ ...bag, bagNo: idx + 1 }))
    );
  }

  async function submit() {
    setMsg(null);
    if (!farmer) return setMsg({ kind: 'err', text: 'Select a farmer first.' });
    if (!crop.trim()) return setMsg({ kind: 'err', text: 'Enter the crop.' });
    if (!bags.length) return setMsg({ kind: 'err', text: 'Add at least one bag.' });
    const r = parseFloat(rate);
    if (!(r >= 0)) return setMsg({ kind: 'err', text: 'Enter the rate per kg.' });

    try {
      await createPurchase({
        farmerId: farmer._id,
        date,
        crop: crop.trim(),
        bags,
        ratePerKg: r,
        notes: notes.trim(),
      });
      setMsg({
        kind: 'ok',
        text: `Saved — ${bags.length} bag${bags.length === 1 ? '' : 's'}, ${formatKg(totalKg)}, ${formatINR(totalAmount)} for ${farmer.name}.`,
      });
      setFarmer(null);
      setBags([]);
      setNotes('');
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[44px] w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-700 focus:outline-none';

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">New Purchase</h1>

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

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Crop</span>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="e.g. Ginger" className={inputCls} />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Rate per kg (₹)</span>
          <input
            type="number" inputMode="decimal" min="0" step="0.01"
            value={rate} onChange={(e) => setRate(e.target.value)}
            className={inputCls}
          />
        </label>

        <form onSubmit={addBag} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <span className="mb-1 block text-sm text-slate-600">
            Bag {bags.length + 1} weight (kg) — press Enter to add
          </span>
          <div className="flex gap-2">
            <input
              ref={weightRef}
              type="number" inputMode="decimal" min="0.1" step="0.1"
              value={weight} onChange={(e) => setWeight(e.target.value)}
              className="min-h-[56px] w-full rounded-lg border border-slate-200 px-3 text-2xl tabular-nums focus:border-blue-700 focus:outline-none"
            />
            <button type="submit" className="min-h-[56px] rounded-lg bg-blue-700 px-5 text-white transition-colors hover:bg-blue-800">
              Add
            </button>
          </div>
        </form>

        {bags.length > 0 && (
          <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
            {bags.map((b, i) => (
              <li key={b.bagNo} className="flex items-center justify-between px-3 py-1.5">
                <span className="text-sm text-slate-600">Bag {b.bagNo}</span>
                <span className="tabular-nums">{formatKg(b.weightKg)}</span>
                <button
                  type="button" onClick={() => removeBag(i)}
                  className="min-h-[44px] px-2 text-sm text-red-700 transition-colors hover:text-red-800"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <div className="text-sm text-slate-600">Total ({bags.length} bags)</div>
            <div className="text-xl font-semibold tabular-nums">{formatKg(totalKg)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-600">Amount</div>
            <div className="text-xl font-semibold tabular-nums">{formatINR(totalAmount)}</div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Notes (optional)</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </label>

        <button
          type="button" onClick={submit} disabled={saving}
          className="min-h-[52px] w-full rounded-lg bg-blue-700 text-lg font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Purchase'}
        </button>
      </div>
    </Shell>
  );
}
