// v13: event_lokal (Nusantara) masuk kolam undian yang sama: muncul, frekuensi harian tidak naik, tanpa duplikat, tidak tampil di tema sedang (overlay tanpa event_lokal).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async tema => { const p = await b.newPage({ viewport: { width: 1366, height: 860 } }); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  for (const tema of [null, 'sedang']) { const T = tema || 'nusantara'; const p = await open(tema);
    const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, E = DESA.v13, P = DESA.p1, r = {}, TX = window.__T || null;
      const lokal = DESA.textData ? [] : null; const all = E.allEvents(); const ids = all.map(e => e.id);
      r.dupIds = ids.filter((x, i) => ids.indexOf(x) !== i); const active = all.filter(e => !(C.EVENT_DISABLE || []).includes(e.id)); const tt = active.map(e => e.judul);
      r.dupTitles = tt.filter((x, i) => tt.indexOf(x) !== i); r.lokalIds = ['ular_di_sawah', 'hujan_pertama', 'monyet_pencuri', 'dbd_pancaroba', 'ispa_asap', 'kebakaran_ilalang', 'angin_mareng', 'tanam_serentak', 'gotong_royong', 'kenduri_panen', 'ronda_malam', 'hari_pasar', 'tamu_desa_sebelah'].filter(id => ids.includes(id));
      r.dropped = ['angin_gugur', 'banjir_kiriman', 'longsor', 'panen_padi_raya', 'sumur_menyusut'].filter(id => ids.includes(id) && !(C.EVENT_DISABLE || []).includes(id));
      r.windMap = C.WIND.events.angin_mareng;
      // siapkan desa: era 3 + bangunan syarat
      S.era = 3; const spot = (id, cx, cy) => { for (let rr = 1; rr < 20; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (P.validSpot(id, cx + dx, cy + dy)) return { x: cx + dx, y: cy + dy }; };
      for (const id of ['gudang', 'ladang', 'gubuk', 'menara_jaga']) { const s = spot(id, C.CAMP.x + 5, C.CAMP.y + 5); DESA.addBuilding(id, s.x, s.y, true); }
      S.res.makanan = 300; S.res.gandum = 50; S.res.kayu = 200; S.res.air = 50;
      // undian: hitung event per 100 hari dengan & tanpa event_lokal (Math.random sama)
      const run = (lok) => { const T0 = (window.TEXT_REF || null); const tx = E.allEvents.__t; let a = 7 >>> 0; const rnd = Math.random; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        DESA.v13.__lokal(lok); S.eventLastDay = {}; S.eventYearCount = {}; S.eventCount = {}; let n = 0; const seen = {};
        for (let d = 10; d < 1130; d++) { S.day = d; S.event = null; S.hjPending = false; E.maybeEvent(); if (S.event && S.event[0] !== '@') { n++; seen[S.event] = (seen[S.event] || 0) + 1; } S.event = null; S.eventName = null; }
        Math.random = rnd; document.getElementById('modal').style.display = 'none'; return { per100: n / 11.2, seen }; };
      const off = run(false), on = run(true); DESA.v13.__lokal(null); r.off = off.per100; r.on = on.per100; r.lokalSeen = r.lokalIds.filter(id => on.seen[id]); r.lokalSeenAny = Object.keys(on.seen).filter(id => r.lokalIds.includes(id)).length;
      // {nama} terisi; monyet 'biarkan' benar-benar mengambil pangan; hujan pertama menyetel flag
      if (r.lokalIds.includes('ular_di_sawah')) { S.event = 'ular_di_sawah'; S.eventName = null; E.showEvent(); r.namaOk = !/\{nama\}/.test(document.getElementById('modal').innerText); E.chooseEvent(0); }
      if (r.lokalIds.includes('monyet_pencuri')) { S.res.makanan = 100; const f0 = S.res.makanan + S.res.gandum; S.raiders = []; S.event = 'monyet_pencuri'; E.showEvent(); E.chooseEvent(2); r.monkeyFood = f0 - (S.res.makanan + S.res.gandum); r.monkeyRaider = (S.raiders || []).length; }
      if (r.lokalIds.includes('hujan_pertama')) { S.firstRainDone = false; S.event = 'hujan_pertama'; E.showEvent(); E.chooseEvent(0); r.rainFlag = S.firstRainDone; r.rainBlocked = !E.eventAllowed(E.allEvents().find(e => e.id === 'hujan_pertama')); }
      return r; });
    if (!tema) {
      ok(T + ' event lokal aktif & muncul', r.lokalIds.length === 13 && r.lokalSeenAny >= 8, r);
      ok(T + ' tanpa duplikat (id/judul aktif) & duplikat tema dibuang', !r.dupIds.length && !r.dupTitles.length && !r.dropped.length && r.windMap === 1, r);
      ok(T + ' frekuensi per 100 hari tidak naik', r.on <= r.off * 1.05 + 0.2, r);
      ok(T + ' {nama}, monyet curi, hujan pertama', r.namaOk && r.monkeyFood > 0 && r.monkeyFood <= 3.01 && r.monkeyRaider === 1 && r.rainFlag && r.rainBlocked, r);
    } else ok(T + ' event lokal tidak tampil', r.lokalIds.length === 0 && !r.dupIds.length, r);
    await p.close(); }
  await b.close();
  if (errs.length) fails.push('console: ' + errs.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v13 OK'); })();
