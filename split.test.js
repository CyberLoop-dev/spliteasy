const S = require('./split.js');
let failed = 0;
const eq = (name, a, b) => { const ok = JSON.stringify(a) === JSON.stringify(b); if (!ok) failed++; console.log(ok ? 'ok  ' : 'FAIL', name, ok ? '' : JSON.stringify(a) + ' != ' + JSON.stringify(b)); };
let r = S.split({ people: [{ name: 'a' }, { name: 'b' }, { name: 'c' }], shared: 10000, taxPct: 10, tipPct: 20, mode: 'equal' });
eq('100.00 / 3 with 10% tax and 20% tip: grand total', r.grand, 13000);
eq('100.00 / 3: fair shares', r.people.map((p) => p.total), [4334, 4333, 4333]);
r = S.split({ people: [{ name: 'a', items: 2000 }, { name: 'b', items: 3000 }], shared: 1000, taxPct: 10, tipPct: 0, mode: 'items' });
eq('itemized: 20 + 30 + 10 shared, 10% tax', r.people.map((p) => p.total), [2750, 3850]);
let bad = 0;
for (let i = 0; i < 2000; i++) {
  const n = 1 + Math.floor(Math.random() * 7);
  const x = S.split({ people: Array.from({ length: n }, () => ({ name: 'x', items: Math.floor(Math.random() * 9000) })), shared: Math.floor(Math.random() * 5000), taxPct: Math.random() * 20, tipPct: Math.random() * 25, mode: Math.random() < 0.5 ? 'equal' : 'items' });
  if (x.people.reduce((a, p) => a + p.total, 0) !== x.grand) bad++;
}
eq('2000 random bills add up exactly', bad, 0);
console.log(failed ? 'FAILURES: ' + failed : 'all passed');
process.exit(failed ? 1 : 0);
