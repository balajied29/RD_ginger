/** Bag tag helpers — bags are separated by moisture and quality. */

const round2 = (n) => Math.round(n * 100) / 100;

/** "Dry·A", "Wet·B" — empty string for old untagged bags. */
export function bagLabel(b) {
  const parts = [];
  if (b.condition) parts.push(b.condition === 'wet' ? 'Wet' : 'Dry');
  if (b.grade) parts.push(b.grade);
  return parts.join('·');
}

/** Group totals: [{ label: 'Dry·A', count, kg }], untagged last as 'Bags'. */
export function groupBags(bags = []) {
  const groups = new Map();
  for (const b of bags) {
    const label = bagLabel(b) || 'Bags';
    const g = groups.get(label) || { label, count: 0, kg: 0 };
    g.count += 1;
    g.kg = round2(g.kg + b.weightKg);
    groups.set(label, g);
  }
  return [...groups.values()];
}
