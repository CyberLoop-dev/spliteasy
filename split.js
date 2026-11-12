(function (root) {
  'use strict';
  // Share out whole cents with the largest-remainder method, so the parts always add up to the total.
  function allocate(total, weights) {
    const n = weights.length, sum = weights.reduce((a, b) => a + b, 0);
    const exact = weights.map((w) => (sum > 0 ? (total * w) / sum : total / n));
    const base = exact.map(Math.floor); let rem = total - base.reduce((a, b) => a + b, 0);
    const order = exact.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (let k = 0; k < rem; k++) base[order[k % n][1]]++;
    return base;
  }
  function split(o) {
    const n = o.people.length; if (!n) throw new Error('Add at least one person');
    const ones = new Array(n).fill(1), shared = o.shared || 0, items = o.people.map((p) => p.items || 0);
    const subTotal = items.reduce((a, b) => a + b, 0) + shared;
    const sub = o.mode === 'equal' ? allocate(subTotal, ones) : allocate(shared, ones).map((s, i) => s + items[i]);
    const tax = Math.round((subTotal * (o.taxPct || 0)) / 100), tip = Math.round((subTotal * (o.tipPct || 0)) / 100);
    const extra = allocate(tax + tip, sub); // tax and tip are shared out together so rounding stays fair
    return { subTotal, tax, tip, grand: subTotal + tax + tip, people: o.people.map((p, i) => ({ name: p.name, subtotal: sub[i], extra: extra[i], total: sub[i] + extra[i] })) };
  }
  const toCents = (s) => { const t = String(s).replace(/\s/g, '').replace(',', '.'); if (t === '') return 0; if (!/^\d*\.?\d*$/.test(t) || t === '.') return NaN; return Math.round(parseFloat(t) * 100); };
  const fmt = (c) => (c / 100).toFixed(2);
  const api = { allocate, split, toCents, fmt };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Split = api;
})(typeof self !== 'undefined' ? self : this);
