// P1 lanjutan: Kandang Ayam (telur + ayam kampung berkeliaran + keinginan punya_ayam) dan modal ringkasan Hari Jadi (statistik setahun, target, gelar, monumen).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [], only = process.env.P1_ONLY;
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async tema => { const p = await b.newPage({ viewport: { width: 1366, height: 860 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  const spot = (id, cx, cy) => { const P = DESA.p1; for (let r = 0; r < 25; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy; if (P.validSpot(id, x, y)) return { x, y }; } };
  for (const tema of [null, 'sedang']) { const p = await open(tema), T = tema || 'nusantara';
    // ---- Kandang Ayam ----
    const k = await p.evaluate(`(() => { const spot = ${spot}; const S = DESA.state, C = CONFIG, P = DESA.p1, r = {};
      const B = C.BUILDINGS.kandang_ayam; r.def = !!B && B.era === 'dusun' && B.cost.kayu > 0 && B.cost.batu > 0 && !B.cost.makanan; r.nama = B.nama;
      r.src = !!C.FOOD_SOURCES.telur; r.assets = !!(ASSETS.kandang_ayam && ASSETS.kandang_ayam.image && ASSETS.ayam && ASSETS.ayam.image);
      S.era = 1; S.day = 30; Object.assign(S.res, { kayu: 300, batu: 300, makanan: 200 }); S.buildings.filter(b => b.type === 'kandang_ayam').forEach(b => S.buildings.splice(S.buildings.indexOf(b), 1));
      // keinginan punya_ayam: muncul bila kandang bisa ditambah, terwujud saat kandang BARU selesai
      const W = C.WISHES.list.punya_ayam; r.need0 = P.wishNeed(W.butuh, S.villagers[0]);
      const v = S.villagers.find(x => x.age >= 8) || S.villagers[0]; v.wish = null; P.wishStart(v, 'punya_ayam'); v.mood = 50; P.wishDaily(); r.notYet = !!v.wish && v.wish.id === 'punya_ayam';
      const c = C.CAMP, s = spot('kandang_ayam', c.x + 5, c.y + 4); const kb = DESA.addBuilding('kandang_ayam', s.x, s.y, true) || S.buildings[S.buildings.length - 1]; kb.doneDay = S.day;
      P.wishDaily(); r.fulfilled = !v.wish || v.wish.id !== 'punya_ayam'; r.mood = v.mood;
      // telur: stok harian -> tugas Makanan mengambil telur
      kb.telur = 0; for (let i = 0; i < 3; i++) DESA.foodSourcesDaily ? DESA.foodSourcesDaily() : null;
      return { r, id: kb.id, x: kb.x, y: kb.y }; })()`);
    ok(T + ' kandang data', k.r.def && k.r.src && k.r.assets && k.r.nama, k.r);
    ok(T + ' punya_ayam', k.r.need0 && k.r.notYet && k.r.fulfilled && k.r.mood > 50, k.r);
    const e = await p.evaluate(id => { const S = DESA.state, C = CONFIG, P = DESA.p1, kb = S.buildings.find(b => b.id === id), r = {};
      kb.telur = 0; const E = C.FOOD_SOURCES.telur; for (let i = 0; i < 3; i++) kb.telur = Math.min(E.stockMax, kb.telur + C.BUILDINGS.kandang_ayam.hens * E.perHenPerDay);
      r.stock = kb.telur; r.perDay = C.BUILDINGS.kandang_ayam.hens * E.perHenPerDay; r.info = P.coopInfo(kb).includes(String(Math.floor(kb.telur)));
      // semua sumber lain kosong -> penduduk pilih telur
      S.nodes.forEach(n => { if (['semak', 'buah', 'umbi'].includes(n.type)) n.amount = 0; n.jamur = 0; }); S.fish = { river: 0, ponds: {} }; S.buildings.forEach(b => b.keong = 0);
      const v = S.villagers[0]; v.task = null; S.villagers.forEach(o => o.task = null); const t = P.foodTask(v); r.task = t && t.src;
      // kerjakan: jalan + ambil + setor (pakai step)
      S.res.makanan = 50; const f0 = S.res.makanan; let got = 0; v.task = t; S.villagers.forEach(o => { if (o !== v) { o.task = { kind: 'idle_test', target: { x: o.x, y: o.y } }; } });
      for (let i = 0; i < 1200 && got < 1; i++) { DESA.step(0.1); if (kb.telur < r.stock) got = r.stock - kb.telur; if (S.event) { S.event = null; document.getElementById('modal').style.display = 'none'; } }
      r.taken = got; r.hens = P.hensOf(kb).length;
      const h0 = P.hensOf(kb).map(h => [h.x, h.y]); const fr = C.DAY_LENGTH_SEC; S.t = Math.floor(S.t / fr) * fr + 0.45 * fr; for (let i = 0; i < 80; i++) P.hensStep(0.1);
      const hs = P.hensOf(kb), c = P.coopSpot(kb); r.moved = hs.some((h, i) => Math.hypot(h.x - h0[i][0], h.y - h0[i][1]) > 0.2); r.near = hs.every(h => Math.abs(h.x - c.x) <= 4 && Math.abs(h.y - c.y) <= 3.6);
      return r; }, k.id);
    ok(T + ' telur', e.stock >= 1 && e.perDay > 0 && e.perDay <= 2 && e.info, e); ok(T + ' tugas ambil telur', e.task === 'telur' && e.taken >= 1, e); ok(T + ' ayam berkeliaran', e.hens >= 3 && e.moved && e.near, e);
    if (!tema && !only) { await p.evaluate(({ x, y }) => { const S = DESA.state, C = CONFIG, fr = C.DAY_LENGTH_SEC; S.t = Math.floor(S.t / fr) * fr + 0.4 * fr; S.villagers.forEach(v => v.task = null); DESA.p1.view(x + 1.5, y + 1, 3); }, k);
      await p.waitForTimeout(1500); await p.screenshot({ path: '../docs/screenshots/v9-kandang.png' }); }
    // ---- Hari Jadi ----
    const h = await p.evaluate(`(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {}, yd = C.YEAR_SCALE ? C.YEAR_SCALE.daysPerYear : 28;
      S.event = null; document.getElementById('modal').style.display = 'none'; S.hjDone = {}; S.hjPending = false;
      S.yearAcc = { from: 1, pop0: 3, births: 2, deaths: 1, leavers: 0, built: 9, foodIn: 400, foodOut: 350, events: 4, wish0: 0 }; S.p1.wishDone = 6; S.monLog = [{ day: 20, id: 'bendungan', k: 0 }];
      S.goals = null; S.day = 2; P.goalsDaily(); r.goals = !!S.goals;
      S.day = yd + 1; S.t = (S.day - 1) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; P.tujuanDaily(); r.pending = S.hjPending; const R = S.hjSummary || {};
      r.R = { tahun: R.tahun, births: R.births, built: R.built, wishes: R.wishes, stages: (R.stages || []).length, goals: R.goals && R.goals.length, mons: (R.mons || []).length, gelar: R.gelar };
      r.log = S.log.some(l => /Hari Jadi/.test(l)); r.newGoals = S.goals && S.goals.year === 2; r.acc = S.yearAcc.from === S.day && S.yearAcc.births === 0;
      DESA.maybeEvent ? DESA.maybeEvent() : null; if (!S.event) { S.event = '@harijadi'; DESA.showEvent(); }
      const m = document.getElementById('modal'); r.open = m.style.display === 'block' && !!m.querySelector('.hj'); r.cls = m.className; r.ev = S.event;
      r.txt = m.textContent; r.btn = m.querySelectorAll('[data-ev]').length;
      const bg = getComputedStyle(m).borderImageSource || ''; r.skin = /panel\\.png/.test(bg);
      return r; })()`);
    ok(T + ' hari jadi ringkasan', h.pending && h.R.tahun === 1 && h.R.births === 2 && h.R.built === 9 && h.R.wishes === 6 && h.R.stages === 1 && h.R.mons >= 1 && h.log && h.acc, h);
    ok(T + ' hari jadi target', !h.goals || h.R.goals >= 3, h);
    ok(T + ' hari jadi modal', h.open && /hjm/.test(h.cls) && h.btn >= 1 && /Lahir|lahir/.test(h.txt) && h.skin, { ...h, txt: h.txt.slice(0, 200) });
    if (!tema && !only) { await p.waitForTimeout(500); await p.screenshot({ path: '../docs/screenshots/v9-harijadi.png' }); }
    const cl = await p.evaluate(() => { const S = DESA.state; document.querySelector('#modal [data-ev]:not([disabled])').click(); return { ev: S.event, shown: document.getElementById('modal').style.display, pend: S.hjPending, cls: document.getElementById('modal').className }; });
    ok(T + ' hari jadi tutup', !cl.ev && cl.shown === 'none' && !cl.pend && cl.cls === 'panel', cl);
    // fallback modal mandiri (tanpa event Hari Jadi)
    const fb = await p.evaluate(() => { const S = DESA.state, C = CONFIG, yd = C.YEAR_SCALE ? C.YEAR_SCALE.daysPerYear : 28; S.event = null; S.day = 2 * yd + 1; DESA.p1.hariJadiDaily(); S.event = '@harijadi'; DESA.showEvent();
      const m = document.getElementById('modal'), r = { open: m.style.display === 'block' && !!m.querySelector('.hj'), t: S.hjSummary.tahun }; m.querySelector('[data-ev="0"]').click(); r.closed = !S.event && m.style.display === 'none'; return r; });
    ok(T + ' hari jadi mandiri', fb.open && fb.t === 2 && fb.closed, fb);
    await p.close(); }
  await b.close();
  const E = errs.filter(e => !/favicon|ERR_|404/.test(e));
  if (E.length) fails.push('console: ' + E.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('p1b OK');
})();
