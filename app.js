(() => {
  'use strict';
  const $ = (s) => document.querySelector(s), S = window.Split;
  const st = { mode: 'equal', people: ['Person 1', 'Person 2', 'Person 3'].map((name) => ({ name, items: '' })) };
  let last = null;
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
  const inp = (value, label, cb, ph) => { const e = document.createElement('input'); e.value = value; e.placeholder = ph || ''; e.setAttribute('aria-label', label); e.addEventListener('input', () => { cb(e.value); calc(); }); return e; };
  const pct = (v) => { const n = Number(String(v).replace(',', '.') || 0); return n >= 0 && n <= 100 ? n : NaN; };

  function people() {
    const box = $('#people'); box.textContent = '';
    st.people.forEach((p, i) => {
      const row = el('div', 'row');
      row.appendChild(inp(p.name, 'Name of person ' + (i + 1), (v) => { p.name = v; }, 'Person ' + (i + 1)));
      if (st.mode === 'items') row.appendChild(inp(p.items, 'Items for person ' + (i + 1), (v) => { p.items = v; }, 'their items 0.00'));
      const x = el('button', '', '\u00d7'); x.type = 'button'; x.disabled = st.people.length <= 1; x.setAttribute('aria-label', 'Remove person ' + (i + 1));
      x.addEventListener('click', () => { st.people.splice(i, 1); people(); calc(); });
      row.appendChild(x); box.appendChild(row);
    });
    $('#add').disabled = st.people.length >= 12;
    $('#sl').textContent = st.mode === 'equal' ? 'Bill total (before tax and tip)' : 'Shared by everyone (before tax and tip)';
  }

  function calc() {
    const shared = S.toCents($('#shared').value), items = st.people.map((p) => (st.mode === 'items' ? S.toCents(p.items) : 0));
    const tax = pct($('#tax').value), tip = pct($('#tip').value), err = $('#err'), out = $('#out');
    out.textContent = ''; last = null;
    if ([shared, ...items, tax, tip].some(Number.isNaN)) { err.textContent = 'Use plain numbers: amounts like 12.50 and percentages from 0 to 100.'; return; }
    const r = S.split({ people: st.people.map((p, i) => ({ name: p.name.trim() || 'Person ' + (i + 1), items: items[i] })), shared, taxPct: tax, tipPct: tip, mode: st.mode });
    if (!r.grand) { err.textContent = 'Enter an amount to see the split.'; return; }
    err.textContent = ''; last = r;
    out.appendChild(el('p', 'tot', 'Subtotal ' + S.fmt(r.subTotal) + '  +  tax ' + S.fmt(r.tax) + '  +  tip ' + S.fmt(r.tip) + '  =  ' + S.fmt(r.grand)));
    r.people.forEach((p) => { const d = el('div', 'pc'); d.append(el('span', '', p.name), el('strong', '', S.fmt(p.total))); out.appendChild(d); });
  }

  document.querySelectorAll('#mode button').forEach((b) => b.addEventListener('click', () => {
    st.mode = b.dataset.m;
    document.querySelectorAll('#mode button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    people(); calc();
  }));
  $('#add').addEventListener('click', () => { st.people.push({ name: 'Person ' + (st.people.length + 1), items: '' }); people(); calc(); });
  ['#shared', '#tax', '#tip'].forEach((s) => $(s).addEventListener('input', calc));
  $('#copy').addEventListener('click', async (e) => {
    if (!last) return;
    const b = e.currentTarget, old = b.textContent;
    try { await navigator.clipboard.writeText(last.people.map((p) => p.name + ': ' + S.fmt(p.total)).join('\n') + '\nTotal: ' + S.fmt(last.grand)); b.textContent = 'Copied!'; }
    catch { b.textContent = 'Copy is not available here'; }
    setTimeout(() => { b.textContent = old; }, 1500);
  });
  people(); calc();
})();
