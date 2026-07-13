'use client';

import { formatKg } from '../utils/format';

/**
 * Rapid bag entry (S3): extra-large weight input for one-handed use
 * next to the scale, auto-numbered bag list so the sequence (which
 * bag weighed what) can always be checked, running count + total.
 */
export default function BagEntry({ bags, weight, setWeight, onAdd, onRemove, totalKg, weightRef }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-lg font-semibold">Bag {bags.length + 1}</span>
        <span className="text-sm text-slate-600">weight in kg</span>
      </div>
      <form onSubmit={onAdd} className="flex gap-2">
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
                onClick={() => onRemove(i)}
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
  );
}
