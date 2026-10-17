// Tes tambahan tahap 4: Hari Jadi Desa hanya di ulang tahun, pembusukan, kemarau/kekeringan, efek pertahanan (obor, pagar, menara jaga),
// simpan/muat state baru (ancaman, sakit, tumpukan stok, ...), dan banner peringatan di viewport ponsel.
const { chromium } = require('playwright');
const URL = process.env.GAME_URL || 'http://localhost:8095/';
(async () => {
  const b = await chromium.launch(); const errs = []; const watch = p => { p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e))); };
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); watch(p);
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip');
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, out = {}, R = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    const clearEv = () => { S.event = null; document.getElementById('modal').style.display = 'none'; };
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('sumur', 24, 23, true);
    // 1) Hari Jadi Desa: tidak pernah muncul sebelum hari 29, walau peluang & bobot dipaksa maksimal
    let early = 0; Math.random = () => 0; for (let d = 3; d <= 28; d++) { setDay(d); clearEv(); S.eventLastDay = {}; DESA.maybeEvent(); if (S.event === 'festival_desa') early++; }
    clearEv(); setDay(29); DESA.maybeEvent(); const d29 = S.event; clearEv(); DESA.maybeEvent(); const again = S.event; clearEv();
    setDay(40); Math.random = () => 0.999; DESA.maybeEvent(); const d40 = S.event; clearEv(); setDay(57); DESA.maybeEvent(); const d57 = S.event; clearEv(); Math.random = R;
    out.anniv = { early, d29, again, d40, d57, ok: early === 0 && d29 === 'festival_desa' && again !== 'festival_desa' && d40 !== 'festival_desa' && d57 === 'festival_desa' };
    // 2) pembusukan: stok di atas foodFreeDays membusuk; musim panas x1.5; lumbung x0.5; air menguap & dibatasi
    const fpd = DESA.foodDays && (S.res.makanan = 0, S.res.gandum = 0, 1); const P = C.SPOILAGE;
    const spoil = (day, food) => { setDay(day); S.res.makanan = food; S.res.gandum = 0; const s0 = S.spoiled || 0; DESA.spoilDaily(); return (S.spoiled || 0) - s0; };
    const lowNone = spoil(2, 5), semi = spoil(2, 400), panas = spoil(9, 400); A('lumbung', 30, 25, true); const gran = spoil(2, 400);
    S.res.air = 1000; DESA.spoilDaily(); const capAir = S.res.air <= P.waterCapDays * S.villagers.length * C.WATER.perDayPerPop + 1e-6;
    out.spoil = { lowNone, semi: +semi.toFixed(2), panas: +panas.toFixed(2), gran: +gran.toFixed(2), capAir, ok: lowNone === 0 && semi > 0 && Math.abs(panas / semi - P.summerMult) < 0.01 && Math.abs(gran / semi - P.granaryMult) < 0.01 && capAir };
    // 3) kemarau (kekeringan musim panas): air sedikit -> ladang tertunda + banner; air cukup -> ladang aman
    A('ladang', 14, 26, true); const f = S.buildings.find(x => x.type === 'ladang'); f.stage = 'tumbuh'; f.grow = 2;
    Math.random = () => 0; setDay(9); S.droughtDone = false; S.drought = null; S.res.air = 0; DESA.seasonDaily(); Math.random = R;
    const dry = { started: !!S.drought, growDelayed: f.grow === 2 - C.SEASON_FX.panas.droughtGrowDelay, banner: DESA.warnings().some(w => w.t === 'Kekeringan') };
    f.grow = 2; Math.random = () => 0; S.droughtDone = false; S.drought = null; S.res.air = 999; DESA.seasonDaily(); Math.random = R; dry.safeNoDelay = f.grow === 2;
    setDay(9 + C.SEASON_FX.panas.droughtDays + 1); dry.bannerGone = !DESA.warnings().some(w => w.t === 'Kekeringan'); S.drought = null;
    out.drought = { ...dry, ok: dry.started && dry.growDelayed && dry.banner && dry.safeNoDelay && dry.bannerGone };
    // 4) pertahanan
    const W = C.THREAT.wolf, v = S.villagers[0]; S.era = 1; setDay(8, 0.88); v.x = 40; v.y = 10; v.task = { kind: 'diam', target: { x: 40, y: 10 }, timer: 99 }; v.health = 100;
    const bite = () => { const b0 = S.wolfBites || 0; v.health = 100; DESA.biteVillager({ x: v.x + 0.5, y: v.y }, v); return (S.wolfBites || 0) > b0; };
    Math.random = () => (W.torchHitMult + 1) / 2; const noTorch = bite(); A('obor', 41, 10, true); const withTorch = bite(); S.buildings.find(x => x.type === 'obor' && x.x === 41).unlit = true; const unlitTorch = bite(); Math.random = R;
    A('pagar', 44, 12, true); const fenceCost = DESA.wolfCost(44, 12), openCost = DESA.wolfCost(45, 12);
    const wf = { x: 44, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0 }, wo = { x: 47, y: 14, mode: 'jalan', home: { x: 59, y: 14 }, path: null, repath: 0 };
    S.wolf = { day: S.day, phase: 'serang', scared: {} }; const fx0 = wf.x, ox0 = wo.x; DESA.updateWolf(wf, 0.1); DESA.updateWolf(wo, 0.1);
    const slowOnFence = Math.hypot(wf.x - fx0, wf.y - 12) < Math.hypot(wo.x - ox0, wo.y - 14) * 0.5;
    A('menara_jaga', 36, 8, true); const tw = S.buildings.find(x => x.type === 'menara_jaga'), g = S.villagers[1];
    const wt = { x: 38, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0 }; DESA.updateWolf(wt, 0.1); const noGuard = wt.mode;
    g.task = { kind: 'jaga', b: tw, arrived: true, target: { x: tw.x, y: tw.y } }; DESA.updateWolf(wt, 0.1); const guarded = wt.mode;
    const wt2 = { x: 38, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0 }; DESA.updateWolf(wt2, 0.1); const perNightCap = wt2.mode;
    S.wolf = null; g.task = null; v.task = null;
    out.defense = { noTorch, withTorch, unlitTorch, fenceCost, openCost, slowOnFence, noGuard, guarded, perNightCap,
      ok: noTorch && !withTorch && unlitTorch && fenceCost === W.fencePathMult && openCost === 1 && slowOnFence && noGuard !== 'pergi' && guarded === 'pergi' && (W.towerScarePerNight > 1 || perNightCap !== 'pergi') };
    return out; });
  console.log('1 hari jadi', JSON.stringify(r.anniv)); console.log('2 busuk', JSON.stringify(r.spoil)); console.log('3 kemarau', JSON.stringify(r.drought)); console.log('4 pertahanan', JSON.stringify(r.defense));
  // 5) simpan/muat state baru
  const before = await p.evaluate(() => { const S = DESA.state, C = CONFIG;
    S.res.kayu = 77; S.res.makanan = 55; S.wolves = []; DESA.spawnWolf(); S.wolf = { day: S.day, phase: 'mendekat', scared: { x: 1 } };
    DESA.makeSick(S.villagers[0], 'parah', 'dingin'); S.villagers[1].injured = S.day; S.villagers[1].traumaUntil = S.day + 3; S.villagers[1].lowMoodDays = 2;
    const k = S.buildings.find(b => b.type === 'gudang'); DESA.ignite(k); S.drought = { until: S.day + 2 }; S.fireOut = true; S.spoiled = 12.5; S.leavers = 1; S.deaths = 2; S.wolfBites = 3;
    S.bodies = [{ id: 99, name: 'Uji', x: 30, y: 20, cause: 'sakit', day: S.day }]; S.grief = { name: 'Uji', until: S.day + 2 }; S.annivDone = { 1: 29 }; S.lastLeaveDay = S.day;
    const snap = () => { const S = DESA.state; return JSON.stringify({ sick: S.villagers[0].sick, inj: S.villagers[1].injured, tr: S.villagers[1].traumaUntil, low: S.villagers[1].lowMoodDays, wolves: S.wolves.length, wolf: S.wolf.phase,
      burning: !!S.buildings.find(b => b.type === 'gudang').burning, drought: S.drought, fireOut: S.fireOut, spoiled: S.spoiled, leavers: S.leavers, deaths: S.deaths, bites: S.wolfBites, bodies: S.bodies.length, grief: S.grief.name,
      anniv: S.annivDone, piles: DESA.stockpiles().map(s => s.res + DESA.pileTier(s.res)).join(), kayu: S.res.kayu, day: S.day }); };
    window.__snap = snap; const s = snap(); document.getElementById('save').click(); return s; });
  const after = await p.evaluate(() => { document.getElementById('reset') && 0; const S0 = DESA.state; S0.res.kayu = 1; S0.wolves = []; S0.drought = null; S0.villagers.forEach(v => v.sick = null);
    const ok = DESA.loadGame(false); return ok && window.__snap(); });
  const saveOk = before === after; console.log('5 simpan/muat', saveOk ? 'sama' : `BEDA\n ${before}\n ${after}`);
  await p.close();
  // 6) banner peringatan di ponsel (390x844)
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const m = await c.newPage(); watch(m);
  await m.goto(URL); await m.waitForFunction(() => window.DESA && DESA.state, null, { timeout: 15000 }); await m.tap('#btnNew'); await m.waitForTimeout(300); await m.tap('#tutSkip').catch(() => {});
  const mob = await m.evaluate(async () => { const S = DESA.state, C = CONFIG; S.t = 9 * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.day = 10; S.res.makanan = 0; S.res.gandum = 0; S.fireOut = true;
    S.drought = { until: S.day + 2 }; DESA.ignite(S.buildings[0] || (DESA.addBuilding('gubuk', 18, 21, true), S.buildings[0]));
    await new Promise(r => setTimeout(r, 400)); const bar = document.getElementById('warnbar'), items = [...bar.querySelectorAll('.warn')], cv = document.getElementById('c').getBoundingClientRect();
    const rects = items.map(e => e.getBoundingClientRect());
    return { mobile: document.body.classList.contains('mobile'), n: items.length, kinds: items.map(e => e.dataset.warn), inView: rects.every(q => q.left >= 0 && q.right <= innerWidth + 0.5 && q.top >= 0 && q.bottom <= innerHeight),
      onCanvas: rects.every(q => q.top >= cv.top - 1 && q.bottom <= cv.bottom + 1), visible: items.every(e => getComputedStyle(e).visibility !== 'hidden' && e.offsetHeight > 0), minFont: Math.min(...items.map(e => parseFloat(getComputedStyle(e).fontSize))),
      noScroll: document.documentElement.scrollWidth <= innerWidth }; });
  await m.screenshot({ path: require('path').join(__dirname, '..', 'docs', 'screenshots', 'v5-warnings-mobile.png') });
  const mobOk = mob.mobile && mob.n >= 3 && mob.inView && mob.onCanvas && mob.visible && mob.minFont >= 10 && mob.noScroll; console.log('6 banner ponsel', JSON.stringify(mob));
  const ok = r.anniv.ok && r.spoil.ok && r.drought.ok && r.defense.ok && saveOk && mobOk && errs.length === 0;
  console.log(errs.length ? errs.slice(0, 5) : 'no errors', ok ? 'LULUS' : 'GAGAL'); await b.close(); process.exit(ok ? 0 : 1);
})();
