'use client';

import { useState } from 'react';
import AddMoney from './AddMoney';
import { formatINR, formatKg, formatDate } from '../utils/format';

/** Per-bag weights: "1) 50.2 kg  2) 48.9 kg …" as wrapping chips. */
export function BagChips({ bags, center = false }) {
  if (!bags || !bags.length) return null;
  return (
    <div className={`mt-1 flex flex-wrap gap-1 ${center ? 'justify-center' : ''}`}>
      {bags.map((b) => (
        <span
          key={b.bagNo}
          className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-xs tabular-nums text-slate-600"
        >
          {b.bagNo}) {b.weightKg} kg
        </span>
      ))}
    </div>
  );
}

/**
 * Tap-to-view detail for one ledger entry (S6): full record of what
 * was bought or paid — bags, totals, money, notes, who entered it.
 */
export default function EntryDetail({ entry, farmerName, onClose, onChanged }) {
  const [note, setNote] = useState('');
  const isBuy = entry.type === 'purchase';

  const shareText = [
    `LEDGER — ${isBuy ? 'Purchase' : 'Payment'}`,
    `Date: ${formatDate(entry.date)}`,
    `Farmer: ${farmerName}`,
    ...(isBuy
      ? [
          `Crop: ${entry.crop}`,
          `Bags: ${entry.bagCount} — ${(entry.bags || []).map((b) => `${b.bagNo}) ${b.weightKg} kg`).join(', ')}`,
          `Total: ${formatKg(entry.totalKg)}`,
          entry.unpriced ? 'Money: not added yet' : `Money: ${formatINR(entry.debit)}`,
        ]
      : [`Paid: ${formatINR(entry.credit)} (${entry.mode.toUpperCase()})`]),
    `Due after this: ${formatINR(entry.balance)}`,
    entry.by ? `By: ${entry.by}` : '',
  ].filter(Boolean).join('\n');

  async function share() {
    try {
      if (navigator.share) await navigator.share({ text: shareText });
      else {
        await navigator.clipboard.writeText(shareText);
        setNote('Copied — paste it anywhere');
      }
    } catch { /* user cancelled the share sheet */ }
  }

  const row = 'flex items-baseline justify-between gap-3 py-1.5';

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 pb-3 text-center">
          <div className="text-lg font-semibold">{isBuy ? 'Purchase' : 'Payment'}</div>
          <div className="text-sm text-slate-600">
            {formatDate(entry.date)} · {farmerName}
          </div>
        </div>

        {isBuy ? (
          <div className="border-b border-slate-200 py-3 text-center">
            <div className="text-sm text-slate-600">{entry.crop}</div>
            <div className="text-2xl font-semibold tabular-nums">
              {entry.bagCount} bag{entry.bagCount === 1 ? '' : 's'} · {formatKg(entry.totalKg)}
            </div>
            <BagChips bags={entry.bags} center />
            <div className="mt-3 text-sm text-slate-600">Money</div>
            {entry.unpriced ? (
              <div className="mt-1 flex justify-center">
                <AddMoney purchaseId={entry.id} onAdded={onChanged} />
              </div>
            ) : (
              <div className="text-2xl font-semibold tabular-nums">{formatINR(entry.debit)}</div>
            )}
          </div>
        ) : (
          <div className="border-b border-slate-200 py-3 text-center">
            <div className="text-sm text-slate-600">Paid ({entry.mode.toUpperCase()})</div>
            <div className="text-3xl font-semibold tabular-nums text-green-700">
              {formatINR(entry.credit)}
            </div>
          </div>
        )}

        <div className="py-2 text-sm">
          <div className={row}>
            <span className="text-slate-600">Due after this</span>
            <span className={`font-semibold tabular-nums ${entry.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
              {formatINR(entry.balance)}
            </span>
          </div>
          {entry.notes && (
            <div className={row}>
              <span className="text-slate-600">Notes</span>
              <span className="text-right">{entry.notes}</span>
            </div>
          )}
          {entry.by && (
            <div className={row}>
              <span className="text-slate-600">By</span>
              <span>{entry.by}</span>
            </div>
          )}
        </div>

        {note && <p className="text-center text-sm text-green-700">{note}</p>}

        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={share}
            className="min-h-[48px] rounded-lg bg-blue-700 font-medium text-white transition-colors hover:bg-blue-800"
          >
            Share
          </button>
          <button
            onClick={onClose}
            className="min-h-[48px] rounded-lg border border-slate-200 text-slate-600 transition-colors hover:text-slate-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
