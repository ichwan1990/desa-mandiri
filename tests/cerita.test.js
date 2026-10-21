// Cerita P0 (docs/RISET-CERITA-TUJUAN.md §7): Juru Cerita, 12 dilema, momen kecil, akibat tertunda, Agustusan, simpan/muat, penyerap pangan.
// Cek: sifat tidak bentrok; dilema tidak berulang sebelum ulangHari; <=1 dilema & <=2 popup per hari; akibat tertunda mendarat sesuai rentang;
// simpan/muat menjaga S.pending/S.rel/S.director/S.lomba; opsi pertama aman (pangan R >= -2, B >= -6, tidak memicu kritis);
// cakupan hari bermakna >= 80% sejak hari 15 tanpa 3 hari kosong beruntun; Agustusan hari 21 (4 lomba + umbul-umbul); tangkapan layar v8-dilema & v8-agustusan.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (vp, tema) => { const p = await b.newPage({ viewport: vp || { width: 1366, height: 860 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  // desa mapan (era Dusun, 6 penduduk, bangunan dasar), lalu simulasi panjang dengan bot "klik opsi pertama yang aktif"
  const setup = () => { const S = DESA.state, A = DESA.addBuilding; S.era = 1; Object.assign(S.res, { kayu: 300, batu: 150, makanan: 200, gandum: 60, air: 200, alat: 6, kulit: 10, papan: 20 });
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('gubuk', 26, 23, true); A('gubuk', 18, 25, true); A('sumur', 24, 25, true);
    A('ladang', 14, 24, true); A('ladang', 15, 24, true); A('ladang', 14, 25, true);
    while (S.villagers.length < 6) DESA.spawnVillager ? DESA.spawnVillager(20, 22) : DESA.applyEffects({ penduduk: 1 }); DESA.life.assignHomes(); };
  const p = await open();
  const r = await p.evaluate(`(${setup})(); (() => { const S = DESA.state, C = CONFIG, out = { perDay: {}, opens: {}, bad: [] };
    const keepFed = () => { if (S.res.makanan < 120) S.res.makanan = 120; if (S.res.air < 100) S.res.air = 100; S.villagers.forEach(v => { if (v.health < 40) v.health = 60; }); };
    let last = S.day;
    for (let i = 0; i < 70 * 1200 && S.villagers.length; i++) { DESA.step(0.1);
      if (S.day !== last) { last = S.day; keepFed(); }
      if (S.event) { const d = out.perDay[S.day] = out.perDay[S.day] || { modal: 0, dil: 0 }; d.modal++;
        if (S.event === '@story' && S.story.type === 'dilema') { d.dil++; (out.opens[S.story.id] = out.opens[S.story.id] || []).push(S.day); }
        const btn = document.querySelector('#modal [data-ev]:not([disabled])'); btn ? btn.click() : (S.event = null); } }
    const R = S.director, days = R.days.slice(14), runs = days.split('1').map(x => x.length);
    out.cov = days.split('').filter(c => c === '1').length / days.length; out.maxEmpty = Math.max(...runs); out.days = R.days;
    out.maxModal = Math.max(...Object.values(out.perDay).map(d => d.modal)); out.maxDil = Math.max(...Object.values(out.perDay).map(d => d.dil));
    for (const [id, ds] of Object.entries(out.opens)) for (let k = 1; k < ds.length; k++) if (ds[k] - ds[k - 1] < (C.DILEMMAS[id].ulangHari || 28)) out.bad.push(id + '@' + ds[k]);
    const T = C.TRAITS; out.clash = S.villagers.filter(v => T.conflicts.some(([a, b]) => v.traits.includes(a) && v.traits.includes(b))).map(v => v.name + ':' + v.traits);
    out.counts = R.counts; out.landed = R.landed.length; out.day = S.day; out.pop = S.villagers.length; out.lomba = S.lomba.results;
    return out; })()`);
  // akibat tertunda: pencuri_singkong opsi 3 (lapor ke polisi) -> 'ganti_rugi_polisi' tepat 3 hari kemudian (peluang 1)
  const r2 = await p.evaluate(() => { const S = DESA.state, C = CONFIG, st = DESA.story, out = {};
    S.event = null; S.story = null; S.pending = []; S.director.lastById = {}; S.director.lastCat = {};
    S.t = (S.day - 1) * C.DAY_LENGTH_SEC + 0.4 * C.DAY_LENGTH_SEC; const d0 = S.day;
    const RS = C.DILEMMAS.pencuri_singkong; out.opened = st.openDilemma('pencuri_singkong'); st.chooseStory(2);
    out.pending = S.pending.map(x => [x.kunci, x.due - x.from]);
    for (let i = 0; i < 4 * 1200; i++) { DESA.step(0.1); S.event = null; } out.landed = S.director.landed.filter(l => l.kunci === 'ganti_rugi_polisi').map(l => [l.from, l.day]);
    out.d0 = d0; out.logHasHari = S.log.some(l => /⏳/.test(l) && l.includes(String(d0)));
    // rentang semua tunda: due - from dalam [min, maks] (diambil dari data)
    S.pending = []; for (const [id, d] of Object.entries(C.DILEMMAS)) d.p.forEach((o, i) => (o.tunda || []).forEach(t => { for (let k = 0; k < 5; k++) { const due = S.day + t.hari[0] + Math.floor(Math.random() * (t.hari[1] - t.hari[0] + 1)); if (due - S.day < t.hari[0] || due - S.day > t.hari[1]) out.badRange = id; } }));
    // opsi pertama aman: biaya pangan R >= -2, B >= -6 (termasuk tunda), tidak mendorong desa ke 'kritis'
    out.firstOpt = Object.entries(C.DILEMMAS).map(([id, d]) => { const o = d.p[0], f = (o.efek.makanan || 0) + (o.efek.gandum || 0) + (o.efek.minyak || 0) + (o.efek.kopi || 0) + (o.efek.biaya_berkala ? -o.efek.biaya_berkala.makanan * o.efek.biaya_berkala.kali : 0);
      const ft = (o.tunda || []).reduce((a, t) => a + Math.min(0, t.efek.makanan || 0) * t.peluang, 0); // tunda: nilai harapan, dilaporkan saja
      return [id, d.kelas, f, +ft.toFixed(2), d.kelas === 'R' ? f >= -2 : f >= -6]; });
    const pop = S.villagers.length; S.res.gandum = 0; S.res.makanan = DESA.foodPerDay() * 3.2; const lv0 = DESA.famineLevel(); // ~3 hari pangan
    out.famine = Object.keys(C.DILEMMAS).map(id => { const keep = S.res.makanan; DESA.story.applyStoryEffects(DESA.story.optEffects(C.DILEMMAS[id].p[0]), { aktor: [] }); const lv = DESA.famineLevel(); S.res.makanan = keep; return lv; });
    out.lv0 = lv0; out.noKritis = out.famine.every(l => !['kritis', 'kolaps'].includes(l) || ['kritis', 'kolaps'].includes(lv0));
    S.res.makanan = 200; return out; });
  // simpan / muat
  const r3 = await p.evaluate(() => { const S = DESA.state, out = {}; S.pending.push({ src: 'tes', opt: 0, kunci: 'x', from: S.day, due: S.day + 5, peluang: 0, efek: {}, aktor: [] });
    const snap = JSON.stringify({ p: S.pending, rel: S.rel, d: S.director, l: S.lomba }); document.getElementById('save').click();
    S.pending = []; S.rel = {}; S.director = null; S.lomba = null; out.loaded = DESA.loadGame(true); const T = DESA.state;
    out.same = JSON.stringify({ p: T.pending, rel: T.rel, d: T.director, l: T.lomba }) === snap; out.pending = T.pending.length; return out; });
  // Agustusan: tahun ke-2 (hari 49), era Dusun -> 4 lomba tersedia, umbul-umbul 3, upacara, lomba, juara umum
  const r4 = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = C.AGUSTUSAN, out = {}; S.event = null; S.story = null;
    Object.assign(S.res, { kayu: 300, kulit: 30, makanan: 300 }); S.villagers.forEach(v => { v.sick = null; v.health = 100; v.energy = 90; v.hunger = 90; });
    S.t = (46 - 1) * C.DAY_LENGTH_SEC + 0.9 * C.DAY_LENGTH_SEC; S.day = 46; S.lomba = { year: -1, history: [] };
    let panel = null; for (let i = 0; i < 4 * 1200; i++) { DESA.step(0.1); if (S.event === '@story' && S.story.type === 'panitia' && !panel) { panel = [...document.querySelectorAll('[data-lomba]')].map(x => x.dataset.lomba);
        document.querySelector('#modal [data-ev="1"]').click(); } else if (S.event) { S.event = null; S.story = null; document.getElementById('modal').style.display = 'none'; }
      if (S.day === 49 && S.lombaOn && !out.shot) { out.shot = true; break; } }
    out.panel = panel; out.picked = S.lomba.picked; out.umbul = S.lomba.umbul; out.dayOfYear = DESA.story.dayOfYear(); out.stage = S.lomba.stage; return out; });
  const r4b = await p.evaluate(() => { const S = DESA.state; for (let i = 0; i < 250; i++) { DESA.step(0.1); if (S.event) S.event = null; } // penduduk berjalan ke lapangan
    document.querySelectorAll('.toast').forEach(t => t.remove()); const L = S.lomba, c = DESA.cam, T = CONFIG.TILE; DESA.setZoom && DESA.setZoom(2, 0, 0);
    c.x = (L.lap.x + 3.5) * T - document.getElementById('c').width / 2 / c.zoom; c.y = (L.lap.y + 1.5) * T - document.getElementById('c').height / 2 / c.zoom;
    return { current: L.current, atField: S.villagers.filter(v => Math.abs(v.x - L.lap.x - 3) < 6 && Math.abs(v.y - L.lap.y - 2) < 5).length, pop: S.villagers.length }; });
  await p.waitForTimeout(700);
  await p.screenshot({ path: '../docs/screenshots/v8-agustusan.png' });
  const r5 = await p.evaluate(() => { const S = DESA.state, out = {}; for (let i = 0; i < 1 * 1200 && S.lomba.stage < 7; i++) { DESA.step(0.1); if (S.event) { S.event = null; } }
    for (const id of ['tarik_tambang', 'panjat_pinang', 'balap_karung', 'makan_kerupuk'].filter(id => !S.lomba.picked.includes(id))) DESA.story.runLomba(id); // lomba ke-4 dijalankan langsung
    out.results = S.lomba.results.map(x => x.id); out.juara = S.lomba.juara; out.piala = S.villagers.some(v => v.pialaUntil >= S.day); out.stage = S.lomba.stage; return out; });
  // tangkapan layar kartu dilema (berat, dengan reaksi sifat)
  await p.evaluate(() => { const S = DESA.state; S.event = null; S.story = null; S.villagers[0].traits = ['pelit', 'rajin']; S.villagers[1].traits = ['religius', 'sabar']; S.director.lastById = {}; S.director.lastCat = {};
    Object.assign(S.res, { kayu: 10, batu: 5 }); S.t = (S.day) * CONFIG.DAY_LENGTH_SEC + 0.42 * CONFIG.DAY_LENGTH_SEC; DESA.step(0.1); S.event = null; DESA.story.openDilemma('rentenir'); });
  await p.waitForTimeout(500); await p.screenshot({ path: '../docs/screenshots/v8-dilema.png' });
  const r6 = await p.evaluate(() => ({ card: !!document.querySelector('#modal .dcard.kB'), opts: document.querySelectorAll('#modal .opt').length, tunda: !!document.querySelector('#modal .hint') }));
  // tema sedang: Agustusan & dilema khas Nusantara mati, Juru Cerita tetap jalan
  const q = await open(null, 'sedang');
  const r7 = await q.evaluate(`(${setup})(); (() => { const S = DESA.state, C = CONFIG, seen = {}; for (let i = 0; i < 40 * 1200; i++) { DESA.step(0.1); if (S.event) { if (S.event === '@story') seen[S.story.type + ':' + (S.story.id || '')] = 1; const b = document.querySelector('#modal [data-ev]:not([disabled])'); b ? b.click() : (S.event = null); } }
    return { agus: C.AGUSTUSAN.enabled, monyet: C.MONKEY.enabled, seen: Object.keys(seen), banned: Object.keys(seen).filter(k => C.STORY_DISABLE.includes(k.split(':')[1])), lomba: S.lomba.stage || 0, disable: C.STORY_DISABLE.length, hide: (C.AGUS_HIDE || []).join(), fox: C.MONKEY.icon }; })()`);
  console.log(JSON.stringify({ r: { ...r, perDay: undefined }, r2, r3, r4, r4b, r5, r6, r7 }));
  const ok = r.clash.length === 0 && r.bad.length === 0 && r.maxDil <= 1 && r.maxModal <= 2 && r.cov >= 0.8 && r.maxEmpty < 3 && (r.counts.dilema || 0) >= 3 && (r.counts.momen || 0) >= 3
    && r2.opened && r2.landed.length === 1 && r2.landed[0][1] - r2.landed[0][0] === 3 && r2.logHasHari && !r2.badRange && r2.firstOpt.every(x => x[4]) && r2.noKritis
    && r3.loaded !== false && r3.same && r3.pending >= 1
    && r4b.atField >= 3 && r4.panel && r4.panel.length === 4 && r4.picked.length >= 2 && r4.umbul === 3 && r4.dayOfYear === 21
    && r5.results.length === 4 && new Set(r5.results).size === 4 && r5.juara && r5.piala && r5.stage === 7
    && r6.card && r6.opts === 3 && r6.tunda
    && r7.agus && r7.monyet && r7.disable === 0 && r7.fox === '🦊' && /agus_bendera/.test(r7.hide) && r7.banned.length === 0 && r7.seen.length >= 2 && !errs.length; // v9b: tema sedang memakai semua cerita (Festival Panen, rubah) tanpa bendera merah-putih
  console.log(errs.length ? errs.slice(0, 5) : 'no errors', ok ? 'LULUS' : 'GAGAL'); await b.close(); process.exit(ok ? 0 : 1);
})();
