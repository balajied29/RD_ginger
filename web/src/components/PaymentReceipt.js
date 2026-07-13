'use client';

import { useState } from 'react';
import { useAuth } from './Shell';
import { CheckIcon } from './Icons';
import { formatINR, formatDate } from '../utils/format';

/** Shareable receipt shown after a payment is saved (S4). */
export default function PaymentReceipt({ receipt, onDone }) {
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
