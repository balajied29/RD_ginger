'use client';

import { useState } from 'react';
import { useAuth } from './Shell';
import { CheckIcon } from './Icons';
import { formatINR, formatKg, formatDate } from '../utils/format';

/**
 * Shown right after a purchase is saved: every detail the staff just
 * entered — date, farmer, crop, TOTAL BAG COUNT, each bag's weight in
 * sequence, total kg, money, and the farmer's new balance.
 */
export default function PurchaseSummary({ summary, onDone }) {
  const { user } = useAuth();
  const [note, setNote] = useState('');

  const priced = summary.totalAmount != null;
  const bagLines = summary.bags.map((b) => `${b.bagNo}) ${b.weightKg} kg`).join(', ');
  const shareText = [
    'LEDGER — Purchase',
    `Date: ${formatDate(summary.date)}`,
    `Farmer: ${summary.farmerName}${summary.village ? ` (${summary.village})` : ''}`,
    `Crop: ${summary.crop}`,
    `Bags: ${summary.bags.length} — ${bagLines}`,
    `Total: ${formatKg(summary.totalKg)}`,
    priced ? `Money: ${formatINR(summary.totalAmount)}` : 'Money: not added yet',
    `To pay now: ${formatINR(summary.balanceAfter)}`,
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
          <div className="flex items-center justify-center gap-2 text-xl font-semibold text-green-700">
            <CheckIcon className="h-6 w-6" /> Saved
          </div>
          <div className="text-sm text-slate-600">LEDGER — Purchase</div>
        </div>

        <div className="border-b border-slate-200 py-3 text-sm">
          <div className={row}>
            <span className="text-slate-600">Date</span>
            <span>{formatDate(summary.date)}</span>
          </div>
          <div className={row}>
            <span className="text-slate-600">Farmer</span>
            <span className="text-right font-medium">
              {summary.farmerName}
              {summary.village ? <span className="font-normal text-slate-600"> · {summary.village}</span> : null}
            </span>
          </div>
          <div className={row}>
            <span className="text-slate-600">Crop</span>
            <span>{summary.crop}</span>
          </div>
        </div>

        <div className="border-b border-slate-200 py-3 text-center">
          <div className="text-3xl font-semibold tabular-nums">
            {summary.bags.length} bag{summary.bags.length === 1 ? '' : 's'} · {formatKg(summary.totalKg)}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {summary.bags.map((b) => (
              <span
                key={b.bagNo}
                className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-xs tabular-nums text-slate-600"
              >
                {b.bagNo}) {b.weightKg} kg
              </span>
            ))}
          </div>
        </div>

        <div className="border-b border-slate-200 py-3 text-center">
          <div className="text-sm text-slate-600">Money</div>
          {priced ? (
            <div className="text-3xl font-semibold tabular-nums">{formatINR(summary.totalAmount)}</div>
          ) : (
            <div className="text-xl font-semibold text-yellow-700">Not added yet</div>
          )}
        </div>

        <div className="py-3 text-center">
          <div className="text-sm text-slate-600">To pay now</div>
          <div
            className={`text-2xl font-semibold tabular-nums ${
              summary.balanceAfter > 0 ? 'text-red-700' : 'text-green-700'
            }`}
          >
            {formatINR(summary.balanceAfter)}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-2 text-center text-xs text-slate-600">
          Entered by {user ? user.name : ''}
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
