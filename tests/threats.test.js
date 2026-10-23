// Tema empat musim (?tema=sedang) — musim & ancaman (docs/RISET-MUSIM-ANCAMAN.md): kelaparan, kayu bakar, sakit & rawat, pergi, serigala, kebakaran, banjir, kematian & makam, skala tahun.
const { chromium } = require('playwright');
const path = require('path');
const SHOT = n => require('./shotdir')(n);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); U.searchParams.set('tema', 'sedang'); await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip');
  const base = () => p.evaluate(() => { const S = DESA.state, A = DESA.addBuilding;
    window.setDay = (d, f = 0.3) => { S.t = (d - 1) * CONFIG.DAY_LENGTH_SEC + f * CONFIG.DAY_LENGTH_SEC; S.day = d; };
    window.run = (sec, until) => { for (let i = 0; i < sec * 10; i++) { DESA.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } if (until && until()) return true; } return false; };
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('gubuk', 26, 22, true); A('sumur', 24, 23, true); A('dapur', 29, 21, true);
    while (S.villagers.length < 4) { const o = JSON.parse(JSON.stringify(S.villagers[0])); o.id = S.nextId++; o.name = ['Dewi', 'Agus'][S.villagers.length - 2]; o.color = S.villagers.length; o.task = null; S.villagers.push(o); } });
  await base();
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, out = {};
    Object.assign(S.res, { kayu: 100, batu: 50, makanan: 200, air: 100, papan: 20 });
    // 1) jenjang kelaparan + banner
    setDay(10); S.res.makanan = 4 * 8 * 1.0; S.res.gandum = 0; // ~4 hari untuk 4 penduduk (2/hari)
    out.famine = [DESA.famineLevel()]; S.res.makanan = 0; out.famine.push(DESA.famineLevel()); DESA.newDay && 0;
    out.warnHunger = DESA.warnings().some(w => w.k === 'hunger' && w.c === 'red'); S.res.makanan = 200;
    out.grace = (() => { setDay(3); S.res.makanan = 10; const l = DESA.famineLevel(); S.res.makanan = 200; return l; })();
    // 2) kayu bakar musim dingin
    setDay(22); S.res.kayu = 10; DESA.threatDaily(); out.firewood = 10 - S.res.kayu; S.res.kayu = 0; DESA.threatDaily(); out.fireOut = S.fireOut === true && DESA.warnings().some(w => w.k === 'cold');
    S.res.kayu = 100; DESA.threatDaily(); out.fireBack = S.fireOut === false;
    // 3) sakit parah -> dirawat
    setDay(5, 0.35); S.wolf = null; S.villagers.forEach(v => { v.mood = 80; v.hunger = 90; v.energy = 90; v.sick = null; v.task = null; });
    const sick = S.villagers[3]; DESA.makeSick(sick, 'parah', 'dingin');
    out.careTask = run(60, () => S.villagers.some(v => v.task && v.task.kind === 'rawat'));
    out.cared = run(300, () => sick.sick && sick.sick.lvl === 'ringan');
    // 4) pergi karena murung 5 hari (pop > minPop)
    const sad = S.villagers[2]; let left = false; for (let i = 0; i < C.LEAVE.days + 1 && !left; i++) { sad.mood = 10; DESA.leaveDaily(); left = !S.villagers.includes(sad); }
    out.left = left && S.leavers === 1;
    // 5) skala tahun
    setDay(29); out.year = DESA.year(); setDay(5);
    return out; });
  console.log('1-5', JSON.stringify(r));
  // 6) serigala: era Dusun, malam, muncul & menerkam; obor/menara ada
  const w = await p.evaluate(() => { const S = DESA.state, out = {}; S.era = 1; setDay(8, 0.86); S.villagers.forEach(v => { v.task = null; v.health = 100; });
    S.villagers[0].x = 33; S.villagers[0].y = 14; S.villagers[0].task = { kind: 'diam', target: { x: 33, y: 14 } };
    S.wolf = { day: S.day, phase: 'serang', tracksOnly: false, spawned: true, scared: {} }; DESA.spawnWolf(); DESA.spawnWolf(); out.spawned = S.wolves.length;
    out.warn = DESA.warnings().some(w => w.k === 'howl' && w.c === 'red');
    // deterministik: serigala ditaruh 2 tile dari penduduk, penduduk ditahan di luar (jam tidur 21:00 tidak membuatnya pulang) sampai tergigit
    const v0 = S.villagers[0]; setDay(8, 0.80); S.wolves.forEach((o, i) => { o.x = v0.x - 1.5; o.y = v0.y + i * 0.3; o.path = null; }); // sebelum jam tidur 21:00, sisi barat (bukan seberang sungai)
    out.bit = run(40, () => { v0.goHome = false; if (!v0.task || v0.task.kind !== 'diam') { if (v0.inside != null) DESA.exitHouse && DESA.exitHouse(v0); v0.task = { kind: 'diam', target: { x: 33, y: 14 } }; } return (S.wolfBites || 0) > 0; }); return out; });
  await p.evaluate(() => { const S = DESA.state; DESA.addBuilding('obor', 31, 16, true); DESA.addBuilding('pagar', 34, 17, true); DESA.addBuilding('pagar', 35, 17, true); DESA.addBuilding('pagar', 36, 17, true);
    S.wolves = []; DESA.spawnWolf(); DESA.spawnWolf(); const v = S.villagers[0]; S.wolves.forEach((o, i) => { o.x = v.x + 3 + i; o.y = v.y + 1 - i * 2; o.mode = 'jalan'; o.moving = true; });
    S.tracks = [{ x: 30, y: 13, t: S.t, dir: 1 }, { x: 31, y: 13, t: S.t, dir: 1 }]; S.t = (S.day - 1) * CONFIG.DAY_LENGTH_SEC + 0.88 * CONFIG.DAY_LENGTH_SEC;
    DESA.setZoom(2); DESA.centerCam(v.x + 1, v.y + 1); });
  await p.click('[data-s="0"]'); await p.evaluate(() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; }); await p.waitForTimeout(600); await p.screenshot({ path: SHOT('v5-wolves.png') }); await p.click('[data-s="1"]');
  // 7) kebakaran -> dipadamkan dengan air; 8) banjir; 9) kematian -> makam
  const f = await p.evaluate(() => { const S = DESA.state, out = {}; S.wolf = null; S.wolves = []; setDay(12, 0.4); S.res.air = 100; S.res.kayu = 100;
    S.villagers.forEach(v => { v.task = null; v.health = 100; v.sick = null; v.injured = null; v.energy = 90; v.hunger = 90; });
    const kitchen = S.buildings.find(b => b.type === 'dapur'); DESA.ignite(kitchen); out.burning = !!kitchen.burning && DESA.warnings().some(w => w.k === 'fire');
    out.padam = run(30, () => S.villagers.some(v => v.task && v.task.kind === 'padam'));
    out.out = run(120, () => !kitchen.burning); out.waterUsed = S.res.air < 100;
    setDay(3, 0.3); DESA.startFlood(); run(15); out.flood = [...DESA.floodTiles()].some(k => DESA.isFlooded(k % CONFIG.MAP_W, Math.floor(k / CONFIG.MAP_W))) && DESA.warnings().some(w => w.k === 'flood');
    run(CONFIG.DAY_LENGTH_SEC * 1.2, () => !S.flood); out.floodEnds = !S.flood;
    setDay(6, 0.35); const d0 = S.deaths || 0, b0 = (S.bodies || []).length, dead = S.villagers[S.villagers.length - 1], moodBefore = S.villagers[0].mood; DESA.killVillager(dead, 'sakit');
    out.death = S.deaths === d0 + 1 && S.bodies.length === b0 + 1 && !!S.grief && (S.villagers[0].mood < moodBefore || moodBefore === 0);
    out.grave = run(200, () => S.buildings.some(b => b.type === 'makam' && b.done && b.occupant === dead.name)) && !S.bodies.some(x => x.id === dead.id);
    return out; });
  console.log('6-9', JSON.stringify({ ...w, ...f }));
  // screenshot cuaca: hujan musim semi + banjir tepi sungai
  await p.evaluate(() => { const S = DESA.state; setDay(4, 0.45); S.rainDay = S.day; DESA.startFlood(); S.flood.start = S.t - 30; S.flood.end = S.t + 200; S.flood.applied = true;
    DESA.setZoom(1.5); DESA.centerCam(30, 19); });
  await p.click('[data-s="0"]'); await p.evaluate(() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; }); await p.waitForTimeout(600); await p.screenshot({ path: SHOT('v5-weather.png') });
  const ok = r.famine.join() === 'bahaya,kolaps' && r.warnHunger && r.grace !== 'bahaya' && r.firewood === 2 && r.fireOut && r.fireBack && r.careTask && r.cared && r.left && r.year === 2
    && w.spawned === 2 && w.warn && w.bit && f.burning && f.padam && f.out && f.waterUsed && f.flood && f.floodEnds && f.death && f.grave && errs.length === 0;
  console.log(errs.length ? errs : 'no errors'); await b.close(); process.exit(ok ? 0 : 1);
})();
