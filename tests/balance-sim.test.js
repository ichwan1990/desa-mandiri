// Simulasi balancing: start normal (tanpa sumber daya tambahan), pemain-bot menaruh bangunan wajar saat mampu.
// Mencatat stok makanan+gandum per hari. Jalankan: node balance-sim.test.js [jumlahRun]
const { chromium } = require('playwright');
const RUNS = +process.argv[2] || 3;
(async () => {
  const b = await chromium.launch(); const results = []; const errs = [];
  for (let run = 0; run < RUNS; run++) {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
    const nonFood = run === 1 || run === 3;
    results.push(await p.evaluate((nonFood) => {
      const S = DESA.state, C = CONFIG, D = DESA;
      const plan = ['apiunggun', 'gudang', 'gubuk', 'ladang', 'ladang', 'sumur', 'gubuk', 'ladang', 'ladang'];
      const tryBuild = () => { const t = plan[0]; if (!t || !D.canAfford(C.BUILDINGS[t].cost) || S.buildings.some(b => !b.done)) return;
        for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          const x = C.CAMP.x + dx * 2, y = C.CAMP.y + dy * 2; if (t !== 'ladang' && Math.abs(dx) + Math.abs(dy) < 2) continue;
          if (D.validSpot(t, x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS[t].cost)) S.res[k] -= n; D.addBuilding(t, x, y, false); plan.shift(); return; } } };
      const curve = {}; let last = 0, hut2 = null, d24 = null;
      while (S.day <= 28) { D.step(0.1); if (S.event) { const pref = nonFood && { pedagang_keliling: 2, panen_raya: 1 }[S.event];
          const btns = [...document.querySelectorAll('[data-ev]')]; const e = (pref != null && btns[pref] && !btns[pref].disabled) ? btns[pref] : btns.find(x => !x.disabled); e && e.click(); }
        if (!hut2 && S.buildings.filter(b => b.type === 'gubuk' && b.done).length >= 2) hut2 = S.day;
        if (S.day === 24 && !d24) d24 = { food: Math.floor(S.res.makanan + S.res.gandum), batu: Math.floor(S.res.batu), pop: S.villagers.length };
        if (S.day !== last) { last = S.day; tryBuild(); curve[S.day] = { food: Math.floor(S.res.makanan + S.res.gandum), pop: S.villagers.length, air: Math.floor(S.res.air) }; } }
      return { nonFood, d24, hut2, events: S.eventCount || {}, curve: [1, 7, 14, 21, 24].map(d => [d, curve[d]]), final: Object.fromEntries(Object.entries(S.res).map(([k, v]) => [k, Math.floor(v)])),
        pop: S.villagers.length, deaths: S.log.filter(l => l.includes('💀')).length, built: S.buildings.filter(b => b.done).map(b => b.type).join(','),
        harvests: S.log.filter(l => l.includes('memanen')).length };
    }, nonFood));
    await p.close();
  }
  results.forEach((r, i) => console.log(`run ${i + 1}${r.nonFood ? ' (non-food)' : ''}: ` + r.curve.map(([d, c]) => `d${d}=${c ? c.food : '-'}`).join(' ') +
    ` | d24 batu=${r.d24.batu} pop=${r.d24.pop} | gubuk ke-2 hari ${r.hut2 ?? '-'} | panen_raya=${r.events.panen_raya || 0} | events=${JSON.stringify(r.events)}`));
  const f = results.map(r => r.d24.food).sort((a, b) => a - b), med = f[Math.floor(f.length / 2)];
  const stoneOk = results.filter(r => r.d24.batu >= 5 && r.hut2 && r.hut2 < 24).length;
  console.log(`median food d24=${med} (25-50: ${med >= 25 && med <= 50}), max=${f[f.length - 1]} (<80: ${f[f.length - 1] < 80}), stone+hut2 runs=${stoneOk}/5 (>=3: ${stoneOk >= 3}), panen_raya<=1 before d28 all: ${results.every(r => (r.events.panen_raya || 0) <= 1)}`);
  console.log(errs.length ? 'ERR ' + errs : 'no errors');
  if (errs.length) process.exitCode = 1; await b.close();
})();
