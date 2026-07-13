/** Shared formatters (Section 3): every amount and weight goes through these. */

const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function formatINR(n) {
  const v = n ?? 0;
  // Sign goes before the ₹ symbol: −₹500, not ₹-500.
  return `${v < 0 ? '−' : ''}₹${inr.format(Math.abs(v))}`;
}

export function formatKg(n) {
  return `${(n ?? 0).toFixed(1)} kg`;
}

export function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function todayISO() {
  // IST calendar date, not UTC: between 00:00 and 05:30 India time the
  // UTC date is still yesterday, which mislabeled early-morning entries.
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  return new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10);
}
