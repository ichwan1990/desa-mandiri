// v11: bilah bangun berkategori (terkunci tampil abu-abu, tak bisa ditaruh), pagar tergambar, kejadian di peta (penanda, posisi, klik -> kamera), penyerang bergerak ke sasaran.
const { chromium } = require('playwright');
const SHOT = process.env.SHOTS !== '0';
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async (tema, vp = { width: 1366, height: 860 }) => { const p = await b.newPage({ viewport: vp }); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  for (const tema of [null, 'sedang']) { const T = tema || 'nusantara';
    // ---- 1) bilah bangun ----
    let p = await open(tema);
    const k = await p.evaluate(() => { const C = CONFIG, V = DESA.v11, listed = new Set(C.BUILD_CATS.flatMap(c => c.items));
      const r = { missing: Object.keys(C.BUILDINGS).filter(k => !listed.has(k)), dup: C.BUILD_CATS.flatMap(c => c.items).length - listed.size, scare: V.buildCatOf('orang_orangan'), kandang: V.buildCatOf('kandang_ayam'),
        cats: [...document.querySelectorAll('#buildbar [data-cat]')].map(x => x.dataset.cat), era: DESA.state.era }; return r; });
    ok(T + ' semua bangunan berkategori', !k.missing.length && !k.dup && k.cats.length === 5 && k.scare === 'keamanan' && k.kandang === 'pangan' && k.era === 0, k);
    await p.click('#buildbar [data-cat="pangan"]');
    const m = await p.evaluate(() => { const q = s => document.querySelector(s), lock = q('#buildmenu [data-lock="dapur"]'), kd = q('#buildmenu [data-lock="kandang_ayam"]');
      return { vis: getComputedStyle(q('#buildmenu')).display !== 'none', lock: !!lock, tip: lock && lock.title, dapurB: !!q('#buildmenu [data-b="dapur"]'), kandang: !!kd, ladang: !!q('#buildmenu [data-b="ladang"]'), topH: q('#top').offsetHeight,
        eraName: CONFIG.ERAS[1].nama }; });
    ok(T + ' terkunci tampil + tooltip era & biaya', m.vis && m.lock && !m.dapurB && m.kandang && m.ladang && m.tip.includes(m.eraName) && /Kayu/.test(m.tip) && m.topH <= 80, m);
    await p.click('#buildmenu [data-lock="dapur"]', { force: true });
    const pl = await p.evaluate(() => ({ placing: DESA.v11.placing, open: getComputedStyle(document.getElementById('buildmenu')).display !== 'none' }));
    ok(T + ' klik terkunci tidak menaruh', pl.placing == null, pl);
    await p.click('#buildmenu [data-b="ladang"]');
    ok(T + ' klik terbuka memulai penempatan', await p.evaluate(() => DESA.v11.placing === 'ladang' && getComputedStyle(document.getElementById('buildmenu')).display === 'none'));
    if (!tema && SHOT) { await p.evaluate(() => { DESA.v11.openBuildCat('tempat_tinggal'); }); await p.mouse.move(5, 300); await p.screenshot({ path: '../docs/screenshots/v11-bangun.png' }); await p.evaluate(() => DESA.v11.openBuildCat('tempat_tinggal')); }
    for (const w of [1280, 1366, 1500]) for (const h of [768, 860]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(120);
      const th = await p.evaluate(() => { DESA.v11.openBuildCat('keamanan'); const r = document.getElementById('top').offsetHeight; DESA.v11.openBuildCat('keamanan'); return r; }); ok(`${T} #top ${w}x${h} <= 80`, th <= 80, th); }
    await p.setViewportSize({ width: 412, height: 860 }); await p.waitForTimeout(150);
    await p.click('#buildbar [data-cat="keamanan"]');
    const mob = await p.evaluate(() => { const m = document.getElementById('buildmenu'), r = m.getBoundingClientRect(); return { mobile: document.body.classList.contains('mobile'), vis: getComputedStyle(m).display !== 'none', inView: r.left >= 0 && r.right <= innerWidth + 1, items: m.querySelectorAll('button').length }; });
    ok(T + ' menu kategori di layar ponsel', mob.mobile && mob.vis && mob.inView && mob.items >= 3, mob);
    await p.close();
    // ---- 2) pagar tergambar ----
    p = await open(tema);
    const pg = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1; S.era = 1; S.nodes = S.nodes.filter(n => Math.abs(n.x - C.CAMP.x - 6) > 4 || Math.abs(n.y - C.CAMP.y - 5) > 4);
      const x = C.CAMP.x + 6, y = C.CAMP.y + 5; P.view(x, y, 2); DESA.pangan.render(); const cv = document.querySelector('canvas'), cm = DESA.v11.cam();
      const grab = () => { const g = cv.getContext('2d'), sx = Math.round((x * 32 - cm.x) * cm.zoom), sy = Math.round((y * 32 - cm.y) * cm.zoom), d = g.getImageData(sx, sy, Math.round(32 * cm.zoom), Math.round(32 * cm.zoom)).data; return d; };
      const before = grab(); DESA.addBuilding('pagar', x, y, true); DESA.pangan.render(); const after = grab(); let diff = 0; for (let i = 0; i < before.length; i += 4) if (Math.abs(before[i] - after[i]) + Math.abs(before[i + 1] - after[i + 1]) + Math.abs(before[i + 2] - after[i + 2]) > 40) diff++;
      return { diff, px: before.length / 4 }; });
    ok(T + ' pagar tunggal tergambar', pg.diff > pg.px * 0.08, pg);
    if (!tema && SHOT) { await p.evaluate(() => { const C = CONFIG, x = C.CAMP.x + 6, y = C.CAMP.y + 5; for (let i = 1; i < 5; i++) DESA.addBuilding('pagar', x + i, y, true); for (let i = 1; i < 3; i++) DESA.addBuilding('pagar', x + 4, y + i, true); DESA.addBuilding('pagar', x + 1, y + 3, true); DESA.p1.view(x + 2, y + 1, 2); });
      await p.waitForTimeout(200); await p.screenshot({ path: '../docs/screenshots/v11-pagar.png' }); }
    await p.close();
    // ---- 3) kejadian di peta ----
    p = await open(tema);
    const ev = await p.evaluate(() => { const S = DESA.state, C = CONFIG, V = DESA.v11, P = DESA.p1, r = {}; S.era = 2;
      const spot = (cx, cy) => { for (let rr = 2; rr < 12; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (P.validSpot('ladang', cx + dx, cy + dy)) return { x: cx + dx, y: cy + dy }; };
      const s = spot(C.CAMP.x + 4, C.CAMP.y + 3); DESA.addBuilding('ladang', s.x, s.y, true); const f = S.buildings[S.buildings.length - 1]; f.stage = 'tumbuh'; f.grow = 1;
      // penyerang bergerak ke sasaran
      S.wolf = { day: S.day, phase: 'serang', spawned: true, scared: {} }; S.wolves = []; DESA.spawnWolf(); const o = S.wolves[0]; r.spawned = !!o;
      const d0 = Math.hypot(o.x - f.x, o.y - f.y); for (let i = 0; i < 15; i++) DESA.updateWolf(o, 0.1); r.d0 = d0; r.d1 = Math.hypot(o.x - f.x, o.y - f.y);
      r.wolfMarker = V.activeMarkers().some(m => m.k === 'serang');
      // ladang dirusak: penanda + posisi log + teks melayang
      const rnd = Math.random; Math.random = () => 0.99; V.wreckField(o, f); Math.random = rnd;
      r.fieldMarker = V.activeMarkers().some(m => m.k === 'ladang' && m.x === f.x && m.y === f.y); r.logPos = !!(S.logPos && S.logPos[S.log[0]]); r.float = DESA.p1.textNotes().some(t => t.includes('-1 '));
      // pencuri pangan berjalan ke sasaran
      V.spawnRaider(3, (CONFIG.MONKEY && CONFIG.MONKEY.hewan) || 'monyet'); const rd = S.raiders[S.raiders.length - 1], e0 = Math.hypot(rd.x - rd.goal.x, rd.y - rd.goal.y); V.updateRaiders(0.5); r.raidMove = Math.hypot(rd.x - rd.goal.x, rd.y - rd.goal.y) < e0;
      r.raidMarker = V.activeMarkers().some(m => m.k === 'curi'); r.raidKind = rd.kind; r.raidSprite = !!(ASSETS[rd.kind] && ASSETS[rd.kind].image);
      // kamera jauh dari kejadian, lalu klik spanduk
      P.view(2, 2, 1); DESA.pangan.ui(); r.wolfPos = { x: o.x, y: o.y }; return r; });
    ok(T + ' penyerang mendekati sasaran', ev.spawned && ev.d1 < ev.d0 - 1, ev);
    ok(T + ' penanda serangan, ladang, pencuri', ev.wolfMarker && ev.fieldMarker && ev.raidMarker && ev.logPos && ev.float && ev.raidMove && ev.raidSprite && ev.raidKind === (tema ? 'rubah' : 'monyet'), ev);
    const before = await p.evaluate(() => DESA.v11.cam());
    await p.click('#warnbar [data-warn="howl"]');
    const after = await p.evaluate(() => { const c = DESA.v11.cam(); return { x0: c.x / 32, y0: c.y / 32, x1: (c.x + c.w / c.zoom) / 32, y1: (c.y + c.h / c.zoom) / 32 }; });
    ok(T + ' klik spanduk -> kamera ke kejadian', ev.wolfPos.x > after.x0 + 1 && ev.wolfPos.x < after.x1 - 1 && ev.wolfPos.y > after.y0 + 1 && ev.wolfPos.y < after.y1 - 1 && (before.x !== after.x0 * 32 || before.y !== after.y0 * 32), { before, after, w: ev.wolfPos });
    await p.evaluate(() => DESA.p1.view(2, 2, 1)); await p.waitForTimeout(100);
    await p.click('#log .loglok >> nth=0');
    const lg = await p.evaluate(() => { const c = DESA.v11.cam(), S = DESA.state, l = S.log.find(x => S.logPos[x]), q = S.logPos[l]; return { inView: q[0] > c.x / 32 && q[0] < (c.x + c.w / c.zoom) / 32 - 1 && q[1] > c.y / 32 && q[1] < (c.y + c.h / c.zoom) / 32 - 1, q, c }; });
    ok(T + ' klik log -> kamera ke lokasi', lg.inView, lg);
    // banjir, api, pendatang, kerusakan bangunan punya posisi & penanda
    const ot = await p.evaluate(() => { const S = DESA.state, V = DESA.v11, r = {}; 
      const g = S.buildings.find(b => b.type !== 'ladang') || S.buildings[0]; DESA.story.applyStoryEffects({ banjir: 1 }, {}); r.flood = !!(S.flood && S.flood.pos) && !!V.warnPos('flood');
      S.t = S.flood ? S.flood.start + 1 : S.t; r.floodMarker = V.activeMarkers().some(m => m.k === 'banjir');
      DESA.addBuilding('gubuk', 30, 30, true); const h = S.buildings[S.buildings.length - 1]; if (DESA.ignite) DESA.ignite(h); else h.burning = { target: 10, lost: 0, actions: 0, need: 3, nextSpread: 1e9 }; r.fire = V.activeMarkers().some(m => m.k === 'api') && !!V.warnPos('fire');
      DESA.story.applyStoryEffects({ kesehatan_bangunan_dekat: -20 }, {}); r.rusak = V.activeMarkers().some(m => m.k === 'rusak'); S.mapEvents = []; DESA.v9c.applyEffects({ kesehatan_bangunan: -10 }, 'tes'); r.rusak2 = V.activeMarkers().some(m => m.k === 'rusak');
      const n0 = S.villagers.length; DESA.v9c.applyEffects({ penduduk: 1 }, 'tes'); r.pendatang = S.villagers.length > n0 && V.activeMarkers().some(m => m.k === 'pendatang');
      return r; });
    ok(T + ' banjir/api/rusak punya posisi & penanda', ot.flood && ot.floodMarker && ot.fire && ot.rusak && ot.rusak2 && ot.pendatang, ot);
    if (!tema && SHOT) { await p.evaluate(() => { const S = DESA.state, o = S.wolves[0], f = (DESA.addBuilding('ladang', 27, 32, true), S.buildings[S.buildings.length - 1]); if (o) { o.mode = 'jalan'; if (f) { o.x = f.x + 1.2; o.y = f.y + 0.2; S.buildings.forEach(b => { if (b.type === 'obor') b.fuel = 0; }); DESA.v11.wreckField(o, f); } DESA.p1.view(Math.round(o.x), Math.round(o.y), 2); } }); await p.waitForTimeout(1900); await p.screenshot({ path: '../docs/screenshots/v11-babi.png' }); } // v15: babi baru merusak ladang -> debu, tanah cokelat, teks melayang
    await p.close(); }
  await b.close();
  if (errs.length) fails.push('console: ' + errs.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v11 OK'); })();
