// v17: harapan warga (tekanan mood akhir, data HARAPAN_WARGA, -1..-3) & T-04 pencapaian mustahil disembunyikan (ACH_HIDE_UNAVAILABLE).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [], out = {};
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  for (const tema of ['', 'sedang']) { const T = tema || 'nusantara', p = await b.newPage(); p.on('pageerror', e => errs.push(T + ': ' + String(e)));
    await p.goto((process.env.GAME_URL || 'http://localhost:8095/') + (tema ? '?tema=' + tema : '')); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, V = DESA.v17, Y = C.YEAR_SCALE.daysPerYear, r = { h: [] };
      for (const y of [1, 2, 3, 5, 8, 12]) { S.day = (y - 1) * Y + 1; S.era = Math.min(3, y - 1); r.h.push(+V.harapanWarga().toFixed(2)); }
      S.day = 12 * Y; S.era = 3; S.harapanLv = 0; V.harapanDaily(); r.log = S.log.slice(0, 8).find(l => l.includes('🌱')) || null;
      r.hidden = V.achHidden(); r.shown = V.achList().length; C.ACH_HIDE_UNAVAILABLE = false; r.all = V.achList().length; C.ACH_HIDE_UNAVAILABLE = true; return r; });
    out[T] = r;
    ok(T + ' harapan 0 di tahun 1, naik, maks 3', r.h[0] === 0 && r.h.every((x, i) => i === 0 || x >= r.h[i - 1]) && Math.max(...r.h) <= 3 && Math.max(...r.h) >= 1, r.h);
    ok(T + ' log harapan warga', !!r.log, r.log);
    ok(T + ' A15/A18/A19 disembunyikan & bisa dikembalikan', ['A15', 'A18', 'A19'].every(x => r.hidden.includes(x)) && r.shown + r.hidden.length === r.all, r);
    await p.close(); }
  await b.close(); console.log(JSON.stringify(out));
  if (errs.length) fails.push('pageerror ' + JSON.stringify(errs.slice(0, 5)));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v17 OK'); })();
