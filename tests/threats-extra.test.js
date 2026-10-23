// Tes ancaman & musim tema Nusantara (docs/RISET-INDONESIA.md): Hari Jadi Desa hanya di ulang tahun, pembusukan pangan & air, kemarau menaikkan
// kebutuhan air, pertahanan (pagar bambu, oncor, pos ronda + prioritas Jaga) menurunkan serangan babi hutan, serangan fatal baru tahun ke-2,
// simpan/muat state baru (satwa liar, banjir, duka, sakit, makam), dan tata letak #warnbar di ponsel 390x844. Gagal bila ada error konsol.
const { chromium } = require('playwright');
const URL = (() => { const u = new globalThis.URL(process.env.GAME_URL || 'http://localhost:8095/'); u.searchParams.set('tema', 'indonesia'); return u.href; })(); // v9d: tes khusus tema Nusantara -> tema dipatok (GAME_URL ?tema=sedang tidak berlaku)
(async () => {
  const b = await chromium.launch(); const errs = []; const watch = p => { p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e))); };
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } }); watch(p);
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip');
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, out = {}, R = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    const clearEv = () => { S.event = null; document.getElementById('modal').style.display = 'none'; };
    out.theme = C.THEME;
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('sumur', 24, 23, true);
    while (S.villagers.length < 4) { const o = JSON.parse(JSON.stringify(S.villagers[0])); o.id = S.nextId++; o.name = ['Dewi', 'Agus'][S.villagers.length - 2]; o.color = S.villagers.length; o.task = null; S.villagers.push(o); }
    // 1) Hari Jadi Desa: tidak pernah sebelum hari 29 walau peluang dipaksa; tepat hari 29 & 57, sekali per tahun
    let early = 0; Math.random = () => 0; for (let d = 3; d <= 28; d++) { setDay(d); clearEv(); S.eventLastDay = {}; DESA.maybeEvent(); if (S.event === 'festival_desa') early++; }
    clearEv(); setDay(29); DESA.maybeEvent(); const d29 = S.event; clearEv(); DESA.maybeEvent(); const again = S.event; clearEv();
    setDay(40); Math.random = () => 0.999; DESA.maybeEvent(); const d40 = S.event; clearEv(); setDay(57); DESA.maybeEvent(); const d57 = S.event; clearEv(); Math.random = R;
    out.anniv = { early, d29, again, d40, d57, ok: early === 0 && d29 === 'festival_desa' && again !== 'festival_desa' && d40 !== 'festival_desa' && d57 === 'festival_desa' };
    // 2) pembusukan: pangan di atas foodFreeDays busuk; musim hujan (lembap) x1.5; Lumbung Padi x0.5; air menguap & dibatasi
    const P = C.SPOILAGE, spoil = (day, food) => { setDay(day); S.res.makanan = food; S.res.gandum = 0; const s0 = S.spoiled || 0; DESA.spoilDaily(); return (S.spoiled || 0) - s0; };
    const lowNone = spoil(11, 5), mareng = spoil(11, 400), hujan = spoil(2, 400); A('lumbung', 30, 25, true); const gran = spoil(11, 400);
    const wpd = S.villagers.length * C.WATER.perDayPerPop; S.res.air = wpd * P.waterFreeDays + 50; DESA.spoilDaily(); const evap = S.res.air < wpd * P.waterFreeDays + 50;
    S.res.air = 1000; DESA.spoilDaily(); const capAir = S.res.air <= P.waterCapDays * wpd + 1e-6; S.res.air = 0; S.res.makanan = 0;
    out.spoil = { lowNone, mareng: +mareng.toFixed(2), hujan: +hujan.toFixed(2), gran: +gran.toFixed(2), evap, capAir,
      ok: lowNone === 0 && mareng > 0 && Math.abs(hujan / mareng - C.SEASON_FX.hujan.spoilMult) < 0.01 && Math.abs(gran / mareng - P.granaryMult) < 0.01 && evap && capAir };
    // 3) kemarau: kebutuhan air harian x1.5, sumur surut (-1), sungai menyusut; kekeringan menunda ladang & memunculkan banner
    setDay(5); const needHujan = DESA.waterNeed(), wellH = DESA.wellYieldNow(); setDay(16); const needKem = DESA.waterNeed(), wellK = DESA.wellYieldNow(), riverK = DESA.riverYieldNow();
    S.res.air = 100; DESA.newDay(); const used = 100 - S.res.air; clearEv();
    A('ladang', 14, 26, true); const f = S.buildings.find(x => x.type === 'ladang'); f.crop = 'jagung'; f.stage = 'tumbuh'; f.grow = 2;
    Math.random = () => 0; setDay(16); S.droughtDone = false; S.drought = null; S.res.air = 0; DESA.seasonDaily(); Math.random = R;
    const dry = { started: !!S.drought, growDelayed: f.grow === 2 - C.SEASON_FX.kemarau.droughtGrowDelay, banner: DESA.warnings().some(w => w.t === 'Kekeringan') }; S.drought = null; f.stage = 'kosong';
    out.kemarau = { needHujan, needKem, wellH, wellK, riverK, used: +used.toFixed(2), ...dry,
      ok: DESA.season() === 'kemarau' && Math.abs(needKem / needHujan - 1.5) < 1e-9 && wellK === wellH - 1 && riverK < C.WATER.riverYield && used >= needKem - 1e-6 && dry.started && dry.growDelayed && dry.banner };
    // 4) pertahanan terhadap babi hutan (ukur peluang serangan dengan acak nyata, N percobaan)
    const W = C.THREAT[C.NIGHT_THREAT], v = S.villagers[0]; S.era = 1; setDay(5, 0.88);
    v.x = 40; v.y = 10; v.task = { kind: 'diam', target: { x: 40, y: 10 }, timer: 99 };
    const bites = n => { let k = 0; for (let i = 0; i < n; i++) { const b0 = S.wolfBites || 0; v.health = 100; v.sick = null; DESA.biteVillager({ x: v.x + 0.5, y: v.y }, v); if ((S.wolfBites || 0) > b0) k++; } return k / n; };
    const noTorch = bites(300); A('obor', 41, 10, true); const withTorch = bites(300); S.buildings.find(x => x.type === 'obor' && x.x === 41).unlit = true; const unlitTorch = bites(100);
    // oncor juga melindungi ladang: petak dekat oncor menyala lebih jarang dirusak
    const wreckRate = (fx, fy, n) => { A('ladang', fx, fy, true); const fl = S.buildings.find(x => x.type === 'ladang' && x.x === fx && x.y === fy); let k = 0;
      for (let i = 0; i < n; i++) { fl.stage = 'tumbuh'; fl.grow = 1; DESA.wreckField({ x: fx, y: fy }, fl); if (fl.stage === 'kosong') k++; } fl.stage = 'kosong'; return k / n; };
    const fieldBare = wreckRate(46, 26, 200); A('obor', 47, 31, true); const fieldTorch = wreckRate(47, 30, 200);
    // pagar bambu: biaya jalur x3 & langkah melambat di atas pagar
    A('pagar', 44, 12, true); const fenceCost = DESA.wolfCost(44, 12), openCost = DESA.wolfCost(45, 12);
    const wf = { x: 44, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0, plots: 9, maxPlots: 0 }, wo = { x: 47, y: 14, mode: 'jalan', home: { x: 59, y: 14 }, path: null, repath: 0, plots: 9, maxPlots: 0 };
    S.wolf = { day: S.day, phase: 'serang', scared: {} }; const fx0 = wf.x, ox0 = wo.x; DESA.updateWolf(wf, 0.1); DESA.updateWolf(wo, 0.1);
    const slowOnFence = Math.hypot(wf.x - fx0, wf.y - 12) < Math.hypot(wo.x - ox0, wo.y - 14) * 0.5;
    // pos ronda + prioritas Jaga: Jaga 0 -> tidak ada yang berjaga; Jaga 3 -> ada penjaga, dan babi diusir dari radius pos (1x per malam)
    A('menara_jaga', 36, 8, true); const tw = S.buildings.find(x => x.type === 'menara_jaga');
    S.wolf = { day: S.day, phase: 'mendekat', scared: {} }; S.villagers.forEach(o => { o.task = null; o.energy = 90; o.hunger = 90; o.sick = null; });
    S.prio.jaga = 0; const jagaOff = S.villagers.map(o => DESA.chooseTask(o)).filter(t => t && t.kind === 'jaga').length;
    S.prio.jaga = 3; const g = S.villagers[1]; g.traits = ['rajin', 'jujur']; /* penakut tidak mau jaga malam (sifat acak) */ const tg = DESA.chooseTask(g); const jagaOn = tg && tg.kind === 'jaga';
    const wt = { x: 38, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0, plots: 9, maxPlots: 0 }; DESA.updateWolf(wt, 0.1); const noGuard = wt.mode;
    g.task = { ...tg, arrived: true }; DESA.updateWolf(wt, 0.1); const guarded = wt.mode;
    const wt2 = { x: 38, y: 12, mode: 'jalan', home: { x: 59, y: 12 }, path: null, repath: 0, plots: 9, maxPlots: 0 }; DESA.updateWolf(wt2, 0.1); const perNightCap = wt2.mode;
    S.wolf = null; S.villagers.forEach(o => o.task = null);
    out.defense = { noTorch, withTorch, unlitTorch, fieldBare, fieldTorch, fenceCost, openCost, slowOnFence, jagaOff, jagaOn, noGuard, guarded, perNightCap,
      ok: noTorch === 1 && withTorch < 0.6 && withTorch > 0.2 && unlitTorch === 1 && fieldBare === 1 && fieldTorch < 0.6 && fenceCost === W.fencePathMult && openCost === 1 && slowOnFence
        && jagaOff === 0 && jagaOn && noGuard !== 'pergi' && guarded === 'pergi' && perNightCap !== 'pergi' };
    // 5) serangan fatal baru tahun ke-2; babi tidak melukai sebelum era Dusun
    const victim = S.villagers[3]; victim.x = 50; victim.y = 5; victim.task = { kind: 'diam', target: { x: 50, y: 5 }, timer: 99 };
    S.era = 0; victim.health = 100; const b0 = S.wolfBites || 0; DESA.biteVillager({ x: 50.5, y: 5 }, victim); const campNoBite = (S.wolfBites || 0) === b0 && victim.health === 100;
    S.era = 1; setDay(20, 0.88); Math.random = () => 0; let y1Alive = true; for (let i = 0; i < 5; i++) { victim.health = 5; DESA.biteVillager({ x: 50.5, y: 5 }, victim); if (!S.villagers.includes(victim)) y1Alive = false; }
    const y1Health = victim.health; victim.sick = { lvl: 'parah', until: S.day + 3, cause: 'serangan', cared: false }; DESA.sicknessDaily(); y1Alive = y1Alive && S.villagers.includes(victim);
    const d0 = S.deaths || 0; setDay(30, 0.88); victim.sick = null; victim.health = 5; DESA.biteVillager({ x: 50.5, y: 5 }, victim); Math.random = R;
    const y2Killed = !S.villagers.includes(victim) && (S.deaths || 0) === d0 + 1;
    out.fatal = { campNoBite, y1Alive, y1Health, y2Killed, ok: campNoBite && y1Alive && y1Health > 0 && y2Killed };
    return out; });
  for (const [k, v] of Object.entries(r)) console.log(k, JSON.stringify(v));
  // 6) simpan/muat: satwa liar, banjir, duka, sakit, makam, kekeringan, statistik ancaman
  const snapFn = () => { const S = DESA.state; return JSON.stringify({ animals: (S.wolves || []).map(o => [Math.round(o.x), Math.round(o.y), o.mode]), threat: S.wolf && S.wolf.phase,
    flood: !!S.flood && [Math.round(S.flood.start), Math.round(S.flood.end)], floodTiles: DESA.floodTiles().size, grief: S.grief && S.grief.name, bodies: (S.bodies || []).length,
    graves: S.buildings.filter(b => b.type === 'makam').map(b => [b.x, b.y, b.occupant || '', b.done]), memorials: (S.memorials || []).length,
    sick: S.villagers.map(v => v.sick && v.sick.lvl + ':' + v.sick.cause), injured: S.villagers.map(v => v.injured || 0), drought: S.drought, wrecked: S.fieldsWrecked || 0,
    stats: [S.deaths, S.leavers, S.wolfBites, Math.round(S.spoiled || 0)], anniv: S.annivDone, day: S.day, season: DESA.season() }); };
  await p.click('[data-s="0"]'); // jeda: loop game tidak boleh berjalan di antara simpan & muat
  const before = await p.evaluate(snap => { const S = DESA.state, C = CONFIG; window.__snap = new Function('return (' + snap + ')()');
    S.t = 11 * C.DAY_LENGTH_SEC + 0.4 * C.DAY_LENGTH_SEC; S.day = 12; S.villagers.forEach(v => { v.task = null; v.health = 100; });
    S.wolves = []; S.wolf = { day: S.day, phase: 'serang', scared: {} }; DESA.spawnWolf(); DESA.spawnWolf();
    DESA.startFlood(); S.flood.start = S.t - 5; S.flood.applied = false; DESA.makeSick(S.villagers[0], 'parah', 'masuk_angin'); S.villagers[1].injured = S.day;
    DESA.killVillager(S.villagers[2], 'sakit'); DESA.addBuilding('makam', 10, 30, true); const gv = S.buildings.find(b => b.type === 'makam'); gv.occupant = 'Uji'; gv.variant = 2;
    S.drought = { until: S.day + 2 }; S.spoiled = 12.5; const out = window.__snap(); document.getElementById("save").click(); return out; }, snapFn.toString());
  const after = await p.evaluate(() => { const S0 = DESA.state; S0.wolves = []; S0.flood = null; S0.grief = null; S0.buildings = S0.buildings.filter(b => b.type !== 'makam'); S0.villagers.forEach(v => v.sick = null);
    return DESA.loadGame(false) && window.__snap(); });
  const saveOk = before === after && JSON.parse(before).animals.length === 2 && JSON.parse(before).flood; console.log('simpan/muat', saveOk ? 'sama' : `BEDA\n ${before}\n ${after}`);
  await p.close();
  // 7) #warnbar di ponsel 390x844: semua banner terlihat, di dalam kanvas & viewport, tanpa gulir horizontal
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }); const m = await c.newPage(); watch(m);
  await m.goto(URL); await m.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 15000 }); await m.tap('#btnNew'); await m.waitForTimeout(300); await m.tap('#tutSkip').catch(() => {});
  const mob = await m.evaluate(async () => { const S = DESA.state, C = CONFIG; S.t = 15 * C.DAY_LENGTH_SEC + 0.8 * C.DAY_LENGTH_SEC; S.day = 16; S.res.makanan = 0; S.res.gandum = 0; S.era = 1;
    S.drought = { until: S.day + 2 }; DESA.addBuilding('gubuk', 18, 21, true); DESA.ignite(S.buildings[S.buildings.length - 1]); S.wolf = { day: S.day, phase: 'mendekat', scared: {} };
    await new Promise(r => setTimeout(r, 400)); const bar = document.getElementById('warnbar'), items = [...bar.querySelectorAll('.warn')], cv = document.getElementById('c').getBoundingClientRect();
    const rects = items.map(e => e.getBoundingClientRect()), overlap = rects.some((q, i) => rects.some((o, j) => j > i && q.bottom > o.top + 1 && o.bottom > q.top + 1));
    return { mobile: document.body.classList.contains('mobile'), n: items.length, kinds: items.map(e => e.dataset.warn), texts: items.map(e => e.textContent.trim()),
      inView: rects.every(q => q.left >= 0 && q.right <= innerWidth + 0.5 && q.top >= 0 && q.bottom <= innerHeight), onCanvas: rects.every(q => q.top >= cv.top - 1 && q.bottom <= cv.bottom + 1),
      overlap, minFont: Math.min(...items.map(e => parseFloat(getComputedStyle(e).fontSize))), noScroll: document.documentElement.scrollWidth <= innerWidth }; });
  await m.screenshot({ path: require('./shotdir')('v7-warnings-mobile.png') });
  const mobOk = mob.mobile && mob.n >= 4 && mob.inView && mob.onCanvas && !mob.overlap && mob.minFont >= 10 && mob.noScroll; console.log('banner ponsel', JSON.stringify(mob));
  const ok = r.theme === 'indonesia' && r.anniv.ok && r.spoil.ok && r.kemarau.ok && r.defense.ok && r.fatal.ok && saveOk && mobOk && errs.length === 0;
  console.log(errs.length ? errs.slice(0, 5) : 'no errors', ok ? 'LULUS' : 'GAGAL'); await b.close(); process.exit(ok ? 0 : 1);
})();
