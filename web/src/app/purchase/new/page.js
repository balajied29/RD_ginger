'use client';

import { useMemo, useRef, useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import PurchaseSummary from '../../../components/PurchaseSummary';
import { usePurchaseStore } from '../../../stores/usePurchaseStore';
import { formatKg, todayISO } from '../../../utils/format';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * S3 — Buy. Phone-first, minimal English: type each bag's weight,
 * press Add — bags are auto-numbered and listed so the sequence
 * (which bag had how many kg) can be checked. Money is the final
 * negotiated total, typed directly (no rate — owner decision).
 */
export default function NewPurchasePage() {
  const { saving, createPurchase } = usePurchaseStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [crop, setCrop] = useState('');
  const [amount, setAmount] = useState('');
  const [bags, setBags] = useState([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'err', text }
  const [saved, setSaved] = useState(null); // summary shown after save
  const weightRef = useRef(null);

  const totalKg = useMemo(() => round2(bags.reduce((s, b) => s + b.weightKg, 0)), [bags]);

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
    if (!farmer) return setMsg({ kind: 'err', text: 'Choose a farmer.' });
    if (!crop.trim()) return setMsg({ kind: 'err', text: 'Write the crop name.' });
    if (!bags.length) return setMsg({ kind: 'err', text: 'Add at least 1 bag.' });
    const amt = parseFloat(amount);
    if (!(amt >= 1)) return setMsg({ kind: 'err', text: 'Write the money amount.' });

    try {
      const r = await createPurchase({
        farmerId: farmer._id,
        date,
        crop: crop.trim(),
        bags,
        totalAmount: amt,
        notes: notes.trim(),
      });
      setSaved({
        date: r.date,
        farmerName: farmer.name,
        village: farmer.village || '',
        crop: r.crop,
        bags: r.bags,
        totalKg: r.totalKg,
        totalAmount: r.totalAmount,
        balanceAfter: r.balanceAfter,
      });
      setFarmer(null);
      setBags([]);
      setAmount('');
      setNotes('');
    } catch (e) {
      setMsg({ kind: 'err', text: e.message });
    }
  }

  const inputCls =
    'min-h-[48px] w-full rounded-lg border border-slate-200 px-3 py-2 text-lg focus:border-blue-700 focus:outline-none';

  if (saved) {
    return (
      <Shell>
        <PurchaseSummary summary={saved} onDone={() => setSaved(null)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="mb-4 text-xl font-semibold">Buy</h1>

      {msg && (
        <p className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-red-700">
          {msg.text}
        </p>
      )}

      <div className="space-y-4">
        <FarmerTypeahead value={farmer} onSelect={setFarmer} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600">Crop</span>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Ginger" className={inputCls} />
          </label>
        </div>

        {/* Bag entry — the core one-handed flow next to the scale. */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-lg font-semibold">
              Bag {bags.length + 1}
            </span>
            <span className="text-sm text-slate-600">weight in kg</span>
          </div>
          <form onSubmit={addBag} className="flex gap-2">
            <input
              ref={weightRef}
              type="number" inputMode="decimal" min="0.1" step="0.1"
              value={weight} onChange={(e) => setWeight(e.target.value)}
              placeholder="0.0"
              className="min-h-[64px] w-full rounded-lg border border-slate-200 px-4 text-3xl font-semibold tabular-nums focus:border-blue-700 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[64px] shrink-0 rounded-lg bg-blue-700 px-6 text-xl font-medium text-white transition-colors hover:bg-blue-800"
            >
              + Add
            </button>
          </form>

          {bags.length > 0 && (
            <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {bags.map((b, i) => (
                <li key={b.bagNo} className="flex min-h-[52px] items-center gap-3 px-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-sm font-semibold text-slate-600">
                    {b.bagNo}
                  </span>
                  <span className="grow text-xl font-medium tabular-nums">{formatKg(b.weightKg)}</span>
                  <button
                    type="button"
                    onClick={() => removeBag(i)}
                    aria-label={`Remove bag ${b.bagNo}`}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center text-red-700 transition-colors hover:text-red-800"
                  >
                    ✕
                  </button>
                </li>
              ))}
              <li className="flex min-h-[52px] items-center justify-between bg-slate-50 px-3 font-semibold">
                <span>{bags.length} bags</span>
                <span className="text-xl tabular-nums">{formatKg(totalKg)}</span>
              </li>
            </ul>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Total money (₹)</span>
          <input
            type="number" inputMode="decimal" min="1" step="1"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="min-h-[64px] w-full rounded-lg border border-slate-200 px-4 text-3xl font-semibold tabular-nums focus:border-blue-700 focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Notes (optional)</span>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} />
        </label>

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
