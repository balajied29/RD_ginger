'use client';

import { useMemo, useRef, useState } from 'react';
import Shell from '../../../components/Shell';
import FarmerTypeahead from '../../../components/FarmerTypeahead';
import BagEntry from '../../../components/BagEntry';
import PurchaseSummary from '../../../components/PurchaseSummary';
import { useDraft } from '../../../lib/useDraft';
import { usePurchaseStore } from '../../../stores/usePurchaseStore';
import { todayISO } from '../../../utils/format';

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * S3 — Buy. Money is optional (another staff can add it later).
 * Smart form: every change autosaves to this phone and is restored
 * if the staff gets distracted and comes back.
 */
export default function NewPurchasePage() {
  const { saving, createPurchase } = usePurchaseStore();
  const [farmer, setFarmer] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [crop, setCrop] = useState('');
  const [amount, setAmount] = useState('');
  const [bags, setBags] = useState([]);
  const [weight, setWeight] = useState('');
  const [condition, setCondition] = useState('dry'); // sticky between bags
  const [grade, setGrade] = useState('high');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState(null); // { kind: 'err', text }
  const [saved, setSaved] = useState(null); // summary shown after save
  const weightRef = useRef(null);

  const draftState = useMemo(
    () => ({ farmer, date, crop, amount, bags, weight, condition, grade, notes }),
    [farmer, date, crop, amount, bags, weight, condition, grade, notes]
  );
  const { clearDraft } = useDraft('ledger_draft_buy', draftState, (d) => {
    if (d.farmer) setFarmer(d.farmer);
    if (d.date) setDate(d.date);
    if (d.crop) setCrop(d.crop);
    if (d.amount) setAmount(d.amount);
    if (Array.isArray(d.bags) && d.bags.length) {
      // Strip pre-rename grades so the server default applies instead.
      setBags(d.bags.map((b) => (
        ['high', 'mid', 'low'].includes(b.grade) ? b : { ...b, grade: undefined }
      )));
    }
    if (d.weight) setWeight(d.weight);
    if (d.condition) setCondition(d.condition);
    // Ignore grades from drafts saved before the High/Mid/Low rename.
    if (['high', 'mid', 'low'].includes(d.grade)) setGrade(d.grade);
    if (d.notes) setNotes(d.notes);
  });

  const totalKg = useMemo(() => round2(bags.reduce((s, b) => s + b.weightKg, 0)), [bags]);
  const dirty = farmer || bags.length > 0 || crop || amount || notes;

  function resetAll() {
    setFarmer(null);
    setDate(todayISO());
    setCrop('');
    setAmount('');
    setBags([]);
    setWeight('');
    setCondition('dry');
    setGrade('high');
    setNotes('');
    setMsg(null);
    clearDraft();
  }

  function addBag(e) {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!w || w < 0.1) return;
    setBags((b) => [...b, { bagNo: b.length + 1, weightKg: round2(w), condition, grade }]);
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
    const amt = amount.trim() === '' ? undefined : parseFloat(amount);
    if (amt !== undefined && !(amt >= 1)) {
      return setMsg({ kind: 'err', text: 'Money must be at least ₹1 (or leave it empty).' });
    }

    try {
      const r = await createPurchase({
        farmerId: farmer._id,
        date,
        crop: crop.trim(),
        bags,
        ...(amt !== undefined ? { totalAmount: amt } : {}),
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
      resetAll();
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Buy</h1>
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

        <BagEntry
          bags={bags}
          weight={weight}
          setWeight={setWeight}
          condition={condition}
          setCondition={setCondition}
          grade={grade}
          setGrade={setGrade}
          onAdd={addBag}
          onRemove={removeBag}
          totalKg={totalKg}
          weightRef={weightRef}
        />

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">
            Total money (₹) — optional, other staff can add it later
          </span>
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
