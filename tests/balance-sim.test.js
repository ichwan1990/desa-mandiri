// Simulasi balancing: start normal (tanpa sumber daya tambahan), pemain-bot menaruh bangunan wajar saat mampu.
// Mencatat stok makanan+gandum per hari. Jalankan: node balance-sim.test.js [jumlahRun] [hari]
// Mode panjang: node balance-sim.test.js 12 120  -> seed tetap per run, bot terus membangun & meneliti, laporan kematian/pergi/stok hari 60/120/softlock.
const { chromium } = require('playwright');
const RUNS = +process.argv[2] || 3, DAYS = +process.argv[3] || 28, LONG = DAYS > 28;
(async () => {
  const b = await chromium.launch(); const results = []; const errs = [];
  for (let run = 0; run < RUNS; run++) {
    const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.DESA && DESA.state, null, { timeout: 15000 });
    const nonFood = run === 1 || run === 3, foodFocus = LONG && run % 3 === 2;
    results.push(await p.evaluate(([nonFood, DAYS, LONG, seed, foodFocus]) => {
      if (LONG) { let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
      const S = DESA.state, C = CONFIG, D = DESA;
      const plan = ['apiunggun', 'gudang', 'gubuk', 'ladang', 'ladang', 'sumur', 'gubuk', 'ladang', 'ladang'];
      if (LONG) plan.push('obor', 'gubuk', 'dapur', 'gubuk', 'ladang', 'obor', 'bengkel', 'gubuk', 'lumbung', 'ladang', 'pasar', 'gubuk', 'menara_jaga', 'gubuk', 'ladang', 'balai', 'gubuk', 'gubuk', 'rumah', 'ladang', 'rumah', 'ladang', 'rumah', 'rumah', 'ladang', 'rumah');
      if (foodFocus) Object.assign(S.prio, { makanan: 3, bertani: 3, kayu: 1, batu: 1 });
      const unl = t => { const e = C.ERAS.findIndex(x => x.id === (C.BUILDINGS[t].era || 'perkemahan')); return e <= (S.era | 0); };
      const tryBuild = () => { while (plan.length && LONG && plan[0] !== 'gubuk' && !unl(plan[0]) && S.day > 90) plan.shift(); const t = plan[0]; if (!t || !unl(t) || !D.canAfford(C.BUILDINGS[t].cost) || S.buildings.some(b => !b.done && b.type !== 'makam')) return;
        for (let r = 1; r < 12; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
          const x = C.CAMP.x + dx * 2, y = C.CAMP.y + dy * 2; if (t !== 'ladang' && Math.abs(dx) + Math.abs(dy) < 2) continue;
          if (D.validSpot(t, x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS[t].cost)) S.res[k] -= n; D.addBuilding(t, x, y, false); plan.shift(); return; } } };
      const curve = {}; let last = 0, hut2 = null, d24 = null, snap = {}, firstHut = null, firstBirth = null;
      while (S.day <= DAYS && S.villagers.length) { D.step(0.1); if (S.event) { const pref = nonFood && { pedagang_keliling: 2, panen_raya: 1 }[S.event];
          const btns = [...document.querySelectorAll('[data-ev]')]; const e = (pref != null && btns[pref] && !btns[pref].disabled) ? btns[pref] : btns.find(x => !x.disabled); e && e.click(); }
        if (!hut2 && S.buildings.filter(b => b.type === 'gubuk' && b.done).length >= 2) hut2 = S.day;
        if (S.day === 24 && !d24) d24 = { food: Math.floor(S.res.makanan + S.res.gandum), batu: Math.floor(S.res.batu), pop: S.villagers.length };
        if (!firstHut && S.buildings.some(b => b.type === 'gubuk' && b.done)) firstHut = S.day;
        if (S.day !== last && [40, 60, 80, 120, 140, DAYS].includes(S.day)) snap[S.day] = { food: Math.floor(S.res.makanan + S.res.gandum), air: Math.floor(S.res.air), kayu: Math.floor(S.res.kayu), pop: S.villagers.length, era: S.era | 0, kids: S.villagers.filter(v => D.life.isKid(v)).length, pairs: S.villagers.filter(v => v.partnerId != null).length / 2 };
        if (S.births && !firstBirth) firstBirth = S.day;
        if (S.day !== last && LONG && !S.research) { const n = D.techNodes().find(n => D.startResearch(n.id)); }
        if (S.day !== last) { last = S.day; tryBuild(); curve[S.day] = { food: Math.floor(S.res.makanan + S.res.gandum), pop: S.villagers.length, air: Math.floor(S.res.air) }; } }
      return { nonFood, d24, hut2, events: S.eventCount || {}, curve: [1, 7, 14, 21, 24].map(d => [d, curve[d]]), final: Object.fromEntries(Object.entries(S.res).map(([k, v]) => [k, Math.floor(v)])),
        pop: S.villagers.length, deaths: S.log.filter(l => l.includes('💀')).length, built: S.buildings.filter(b => b.done).map(b => b.type).join(','),
        harvests: S.log.filter(l => l.includes('memanen')).length, deathsN: S.deaths || 0, leavers: S.leavers || 0, snap, firstHut, endDay: S.day, foodFocus,
        softlock: !firstHut || firstHut > 30 || !S.villagers.length, bites: S.wolfBites || 0, births: S.births || 0, deathsOld: S.deathsOld || 0, babyLost: S.babyLost || 0, firstBirth, spoiled: Math.floor(S.spoiled || 0) };
    }, [nonFood, DAYS, LONG, 1000 + run * 7919, foodFocus]));
    await p.close();
  }
  if (LONG) { results.forEach((r, i) => console.log(`run ${i + 1}${r.foodFocus ? ' (fokus makanan)' : ''}: mati=${r.deathsN} pergi=${r.leavers} gigitan=${r.bites} gubuk1=hari ${r.firstHut ?? '-'} | d60 ${JSON.stringify(r.snap[60] || '-')} | d${DAYS} ${JSON.stringify(r.snap[DAYS] || r.snap[120] || ('punah hari ' + r.endDay))} | busuk=${r.spoiled}`));
    const med = a => { const s = a.filter(x => x != null).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : '-'; };
    const dead = results.reduce((a, r) => a + r.deathsN, 0), left = results.reduce((a, r) => a + r.leavers, 0), withDeath = results.filter(r => r.deathsN > 0).length, collapsed = results.filter(r => !r.snap[DAYS] || r.snap[DAYS].pop <= 1).length;
    console.log(`RINGKAS ${RUNS} run x ${DAYS} hari: kematian total ${dead} (run dgn kematian ${withDeath}/${RUNS}), pergi ${left}, kolaps(pop<=1) ${collapsed}/${RUNS}, softlock ${results.filter(r => r.softlock).length}/${RUNS}`);
    console.log(`median d60: pangan ${med(results.map(r => r.snap[60] && r.snap[60].food))}, air ${med(results.map(r => r.snap[60] && r.snap[60].air))}, pop ${med(results.map(r => r.snap[60] && r.snap[60].pop))} | median d${DAYS}: pangan ${med(results.map(r => r.snap[DAYS] && r.snap[DAYS].food))}, air ${med(results.map(r => r.snap[DAYS] && r.snap[DAYS].air))}, pop ${med(results.map(r => r.snap[DAYS] && r.snap[DAYS].pop))}, era ${med(results.map(r => r.snap[DAYS] && r.snap[DAYS].era))}`);
    const P = d => results.map(r => r.snap[d] ? r.snap[d].pop : 0);
    results.forEach((r, i) => console.log(`  siklus run ${i + 1}: pop d40/d80/d${DAYS}=${[40, 80, DAYS].map(d => r.snap[d] ? r.snap[d].pop : 0).join('/')} lahir=${r.births} lahir-pertama=hari ${r.firstBirth ?? '-'} mati-tua=${r.deathsOld} mati-lain=${r.deathsN - r.deathsOld} bayi-gagal=${r.babyLost} pergi=${r.leavers} anak d${DAYS}=${r.snap[DAYS] ? r.snap[DAYS].kids : '-'}`));
    console.log(`SIKLUS: median pop d40 ${med(P(40))} (4-7), d80 ${med(P(80))} (7-11), d${DAYS} ${med(P(DAYS))} (10-16) | lahir ${results.reduce((a, r) => a + r.births, 0)}, mati tua ${results.reduce((a, r) => a + r.deathsOld, 0)}, mati lain ${dead - results.reduce((a, r) => a + r.deathsOld, 0)}, pergi ${left} | median lahir pertama hari ${med(results.map(r => r.firstBirth))}`);
    console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'no errors'); if (errs.length) process.exitCode = 1; await b.close(); return; }
  results.forEach((r, i) => console.log(`run ${i + 1}${r.nonFood ? ' (non-food)' : ''}: ` + r.curve.map(([d, c]) => `d${d}=${c ? c.food : '-'}`).join(' ') +
    ` | d24 batu=${r.d24.batu} pop=${r.d24.pop} | gubuk ke-2 hari ${r.hut2 ?? '-'} | mati=${r.deathsN} pergi=${r.leavers} | panen_raya=${r.events.panen_raya || 0} | events=${JSON.stringify(r.events)}`));
  const f = results.map(r => r.d24.food).sort((a, b) => a - b), med = f[Math.floor(f.length / 2)];
  const stoneOk = results.filter(r => r.d24.batu >= 5 && r.hut2 && r.hut2 < 24).length;
  console.log(`median food d24=${med} (25-50: ${med >= 25 && med <= 50}), max=${f[f.length - 1]} (<80: ${f[f.length - 1] < 80}), stone+hut2 runs=${stoneOk}/5 (>=3: ${stoneOk >= 3}), panen_raya<=1 before d28 all: ${results.every(r => (r.events.panen_raya || 0) <= 1)}`);
  console.log(errs.length ? 'ERR ' + errs : 'no errors');
  if (errs.length) process.exitCode = 1; await b.close();
})();
