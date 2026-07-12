/**
 * Period boundaries computed in Asia/Kolkata (IST, UTC+5:30 — no DST),
 * returned as UTC instants for querying UTC-stored dates (Section 2.3).
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function istPeriodStart(period, now = new Date()) {
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();

  let startUtcMs;
  if (period === 'today') startUtcMs = Date.UTC(y, m, d);
  else if (period === 'month') startUtcMs = Date.UTC(y, m, 1);
  else if (period === 'year') startUtcMs = Date.UTC(y, 0, 1);
  else throw new Error(`Unknown period: ${period}`);

  return new Date(startUtcMs - IST_OFFSET_MS);
}

module.exports = { istPeriodStart, IST_OFFSET_MS };
