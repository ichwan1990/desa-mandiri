// v9c: permainan ALAMI tanpa input (uji perangkat Ichwan 21-10: mood rata-rata 70 -> 0 sekitar hari 7, tanpa rumah, musim hujan).
// Memakai loop permainan asli (requestAnimationFrame + kecepatan dipercepat), bukan DESA.step, lalu mencatat kurva mood harian.
// Lulus bila: tak ada galat, mood rata-rata tidak pernah < MOOD_BARE.rainFloor - 2, warga tidak habis, api unggun & gubuk berdiri sendiri, hari 2-3 sudah meramu.
const { chromium } = require('playwright');
(async () => {
  const DAYS = +process.env.ALAMI_DAYS || 15, SPEED = +process.env.ALAMI_SPEED || 40;
  const b = await chromium.launch(); const p = await b.newPage(); const errs = [];
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  await p.click('#btnNew');
  // tutorial tidak dijalankan (pemain diam); percepat loop asli lewat tombol kecepatan buatan (handler [data-s] yang sama)
  await p.evaluate(sp => { const t = document.getElementById('tut'); if (t) t.style.display = 'none'; const bt = document.createElement('button'); bt.dataset.s = String(sp); bt.style.display = 'none'; document.body.appendChild(bt); bt.click();
    window._curve = []; window._gather = {}; let last = DESA.state.day;
    setInterval(() => { const S = DESA.state; if (!S) return; for (const v of S.villagers) if (v.task && v.task.kind === 'kumpul') { const k = v.task.res === 'makanan' || v.task.src ? 'pangan' : v.task.res; window._gather[k] = window._gather[k] || S.day; }
      if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); }
      if (S.day !== last) { last = S.day; const ms = S.villagers.map(v => v.mood); window._curve.push({ d: S.day, avg: Math.round(ms.reduce((a, x) => a + x, 0) / Math.max(1, ms.length)), min: Math.round(Math.min(...ms)), pop: S.villagers.length,
        food: Math.floor(S.res.makanan + S.res.gandum), fd: +(S.fdShow ?? 0).toFixed(1), b: S.buildings.filter(x => x.done).map(x => x.type).join(',') }); } }, 50); }, SPEED);
  await p.waitForFunction(d => DESA.state.day > d || !DESA.state.villagers.length, DAYS, { timeout: 600000, polling: 500 });
  const r = await p.evaluate(() => ({ curve: window._curve, gather: window._gather, floor: CONFIG.MOOD_BARE.rainFloor, built: DESA.state.buildings.filter(x => x.done).map(x => x.type) }));
  console.log('KURVA MOOD (alami, tanpa input, loop asli x' + SPEED + '):'); r.curve.forEach(c => console.log(`  hari ${c.d}: rata ${c.avg} min ${c.min} pop ${c.pop} pangan ${c.food} (${c.fd} hari) [${c.b}]`));
  console.log('mulai kumpul (hari):', JSON.stringify(r.gather));
  const minAvg = Math.min(...r.curve.map(c => c.avg)), ok = !errs.length && minAvg >= r.floor - 2 && r.curve.every(c => c.pop >= 2) && r.built.includes('apiunggun') && r.built.includes('gubuk') && (r.gather.pangan || 99) <= 2;
  console.log(ok ? `PASS alami: mood rata-rata terendah ${minAvg}` : `FAIL alami: minAvg=${minAvg} errs=${errs.slice(0, 3)}`);
  await b.close(); process.exit(ok ? 0 : 1);
})();
