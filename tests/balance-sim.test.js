// Simulasi balancing: start normal (tanpa sumber daya tambahan), pemain-bot menaruh bangunan wajar saat mampu.
// Mencatat stok makanan+gandum per hari. Jalankan: node balance-sim.test.js [jumlahRun]
const { chromium } = require('playwright');
const RUNS = +process.argv[2] || 3;
(async () => {
  const b = await chromium.launch(); const results = []; const errs = [];
  for (let run = 0; run < RUNS; run++) {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto(process.env.GAME_URL || 'http://localhost:8080/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
    results.push(await p.evaluate(() => {
      const S = DESA.state, C = CONFIG, D = DESA;
      const plan = ['apiunggun', 'gudang', 'gubuk', 'ladang', 'ladang', 'sumur', 'gubuk', 'ladang', 'ladang'];
      const tryBuild = () => { const t = plan[0]; if (!t || !D.canAfford(C.BUILDINGS[t].cost) || S.buildings.some(b => !b.done)) return;
        for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          const x = C.CAMP.x + dx * 2, y = C.CAMP.y + dy * 2; if (t !== 'ladang' && Math.abs(dx) + Math.abs(dy) < 2) continue;
          if (D.validSpot(t, x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS[t].cost)) S.res[k] -= n; D.addBuilding(t, x, y, false); plan.shift(); return; } } };
      const curve = {}; let last = 0;
      while (S.day <= 24) { D.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); }
        if (S.day !== last) { last = S.day; tryBuild(); curve[S.day] = { food: Math.floor(S.res.makanan + S.res.gandum), pop: S.villagers.length, air: Math.floor(S.res.air) }; } }
      return { curve: [1, 7, 14, 21, 24].map(d => [d, curve[d]]), final: Object.fromEntries(Object.entries(S.res).map(([k, v]) => [k, Math.floor(v)])),
        pop: S.villagers.length, deaths: S.log.filter(l => l.includes('💀')).length, built: S.buildings.filter(b => b.done).map(b => b.type).join(','),
        harvests: S.log.filter(l => l.includes('memanen')).length };
    }));
    await p.close();
  }
  console.log(JSON.stringify(results, null, 0).replace(/\},\{"curve"/g, '},\n{"curve"'), errs.length ? 'ERR ' + errs : 'no errors');
  if (errs.length) process.exitCode = 1; await b.close();
})();
