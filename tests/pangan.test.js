// Pangan v9 (permintaan Ichwan 21-10): total "Pangan X · Y hari" + tooltip rincian, teks melayang per sumber (+9 Padi, +4 Ikan),
// tooltip ladang (tanaman, %, perkiraan panen, alasan berhenti: kemarau tanpa irigasi), hasil memancing & jamur per musim/hujan,
// pendatang desa bahagia (mood >= 70 beberapa hari -> peluang naik + log), ambang kenduri 15 hari + bentuk bervariasi, ringkasan masuk/keluar,
// sumber pangan tema sedang. Tangkapan layar docs/screenshots/v9-pangan.png & v9-memancing.png.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async tema => { const p = await b.newPage({ viewport: { width: 1366, height: 860 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.pangan, null, { timeout: 15000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  const p = await open();
  // 1) top bar: total pangan + hari stok + tooltip rincian Makanan + Padi
  const top = await p.evaluate(() => { const S = DESA.state; S.res.makanan = 50; S.res.gandum = 25; DESA.pangan.ui(); const el = document.getElementById('panganBadge');
    return { txt: el && el.textContent, title: el && el.title, fd: DESA.foodDays(), lv: el && el.dataset.lv, html: DESA.pangan.panganBadge() }; });
  ok('badge total', top.txt && /Pangan\s*75/.test(top.txt) && /hari/.test(top.txt), top);
  ok('badge hari', top.txt && top.txt.includes(top.fd < 10 ? top.fd.toFixed(1) : String(Math.floor(top.fd))), top);
  ok('badge tooltip', /Makanan 50/.test(top.title) && /Padi 25/.test(top.title) && /= 75/.test(top.title), top.title);
  // 2) teks melayang per sumber: setor panen padi/jagung & ikan -> "+9 Padi", "+7 Jagung", "+4 Ikan"; ringkasan pangan masuk
  const notes = await p.evaluate(() => { const S = DESA.state, v = S.villagers[0], w = S.villagers[1];
    v.carry = { res: 'gandum', n: 9, src: 'padi' }; DESA.pangan.deposit(v); w.carry = { res: 'makanan', n: 7, src: 'jagung' }; DESA.pangan.deposit(w);
    v.x += 6; v.carry = { res: 'makanan', n: 4, src: 'ikan' }; DESA.pangan.deposit(v);
    const ns = DESA.notes.map(n => `+${n.n} ${n.label}`); const io = DESA.pangan.foodDayIO(); return { ns, inn: io.inn }; });
  ok('note padi', notes.ns.includes('+9 Padi'), notes); ok('note jagung', notes.ns.includes('+7 Jagung'), notes); ok('note ikan', notes.ns.includes('+4 Ikan'), notes);
  ok('io masuk', notes.inn.padi === 9 && notes.inn.ikan === 4, notes.inn);
  // 3) tooltip ladang: padi di kemarau tanpa irigasi berhenti tumbuh; di musim hujan ada progres & perkiraan hari
  const fld = await p.evaluate(() => { const S = DESA.state, C = CONFIG, setDay = d => { S.t = (d - 1) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.day = d; };
    const f = DESA.addBuilding('ladang', 14, 24, true) || S.buildings[S.buildings.length - 1]; f.crop = 'padi'; f.stage = 'tumbuh';
    setDay(3); const g = DESA.growDaysOf(f); f.grow = g / 2; const wet = DESA.pangan.fieldInfo(f);
    setDay(16); const dry = DESA.pangan.fieldInfo(f), hover = DESA.pangan.hoverInfo(f.x, f.y); setDay(3);
    return { wet, dry: { ...dry, html: undefined }, hover, g, season: DESA.season(), id: f.id, x: f.x, y: f.y }; });
  ok('ladang tumbuh', fld.wet.pct === 50 && !fld.wet.why && Math.abs(fld.wet.left - fld.g / 2) < 0.01 && /Padi/.test(fld.wet.crop) && /Perkiraan panen/.test(fld.wet.html), fld.wet);
  ok('ladang kemarau', fld.dry.why && /kemarau/i.test(fld.dry.why), fld.dry); ok('hover ladang', fld.hover && /kemarau/i.test(fld.hover), fld.hover);
  // 4) memancing: 3-5 ikan x musim (hujan 1.2 > kemarau 0.7), lebih banyak saat hujan turun; stok sungai berkurang
  const fish = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.pangan, v = S.villagers[0], setDay = d => { S.t = (d - 1) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.day = d; };
    const trip = () => { S.fish = { river: 999, ponds: {} }; const t = { kind: 'kumpul', res: 'makanan', src: 'memancing', target: { x: v.x, y: v.y }, work: 0, face: 0, spotKey: 'tes' }; v.task = t; v.carry = null;
      P.foodWork(v, t, 1e4); const n = v.carry && v.carry.n; return { n, src: v.carry && v.carry.src, left: S.fish.river }; };
    const many = (k) => { const a = []; for (let i = 0; i < 60; i++) a.push(trip()); return { min: Math.min(...a.map(x => x.n)), max: Math.max(...a.map(x => x.n)), avg: a.reduce((s, x) => s + x.n, 0) / a.length, src: a[0].src, left: a[0].left }; };
    setDay(3); S.rainDay = -1; const hujan = many(); S.rainDay = S.day; const deras = many(); S.rainDay = -1; setDay(16); const kemarau = many(); setDay(3);
    const M = C.FOOD_SOURCES.memancing; return { hujan, deras, kemarau, cfg: M.yield }; });
  ok('ikan 3-5 x musim', fish.hujan.min >= 3 && fish.hujan.max <= 7 && fish.hujan.src === 'ikan' && fish.hujan.left < 999, fish);
  ok('ikan hujan > kemarau', fish.hujan.avg > fish.kemarau.avg && fish.kemarau.min >= 2 && fish.kemarau.max <= 4, fish);
  ok('ikan saat hujan lebih banyak', fish.deras.avg > fish.hujan.avg, fish);
  // 5) jamur: banyak di musim hujan, (hampir) tidak ada di kemarau; mencari jamur menghasilkan 2-4
  const jam = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.pangan, setDay = d => { S.t = (d - 1) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.day = d; };
    const count = () => S.nodes.filter(n => n.jamur > 0).reduce((a, n) => a + n.jamur, 0);
    setDay(3); S.rainDay = -1; P.foodSourcesDaily(); const hujan = count(), forest = P.forestTrees().length; const node = S.nodes.find(n => n.jamur > 0);
    const v = S.villagers[1], ys = []; if (node) for (let i = 0; i < 20; i++) { node.jamur = 50; const t = { kind: 'kumpul', res: 'makanan', src: 'jamur', target: { x: node.x, y: node.y }, work: 0, node, jamurT: true }; v.task = t; v.carry = null; P.foodWork(v, t, 1e4); ys.push(v.carry && v.carry.n); }
    setDay(16); P.foodSourcesDaily(); const kemarau = count(); setDay(3); P.foodSourcesDaily(); v.task = null; v.carry = null;
    return { hujan, kemarau, forest, ys: [Math.min(...ys), Math.max(...ys)], mHujan: P.srcMult('jamur'), on: P.srcOn('jamur') }; });
  ok('jamur hujan', jam.forest > 0 && jam.hujan >= 10 && jam.kemarau === 0 && jam.ys[0] >= 2 && jam.ys[1] <= 4, jam);
  // 6) pendatang desa bahagia (v9b): rata-rata mood >= 80 selama 5 hari & tak ada warga < 50 -> peluang SPAWN.happy.chancePerDay (biasa SPAWN.chancePerDay) + log "Kabar desa yang bahagia..."; tetap butuh 12 hari stok & rumah
  const happy = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.pangan;
    DESA.addBuilding('gubuk', 26, 23, true); DESA.addBuilding('gubuk', 18, 25, true); DESA.life.assignHomes();
    const prep = (mood, hd) => { S.villagers.forEach(v => { v.mood = mood; v.hunger = 100; }); S.moodGoodDays = 10; S.happyDays = hd; S.lastSpawnDay = -99; S.res.makanan = DESA.foodPerDay() * 20; S.res.gandum = 0; S.event = null; };
    const R = Math.random, tryDay = () => { const n0 = S.villagers.length, l0 = S.log.length; Math.random = () => 0.7; try { DESA.newDay(); } finally { Math.random = R; } S.event = null; return { spawned: S.villagers.length - n0, log: S.log.slice(0, Math.max(1, S.log.length - l0)).join(' | ') }; };
    prep(66, 0); const A0 = P.attraction(); const normal = tryDay();
    const H = C.SPAWN.happy; prep(90, H.days); const A1 = P.attraction(); const bahagia = tryDay();
    prep(90, H.days - 1); S.villagers[0].mood = H.minMood - 10; const Am = P.attraction(), murung = tryDay(), murungDays = S.happyDays, htmlMurung = P.attractionHTML();
    prep(H.mood + 5, 3); const prog = P.attractionHTML();
    prep(90, H.days); S.res.makanan = DESA.foodPerDay() * 8; const A2 = P.attraction();
    S.res.makanan = DESA.foodPerDay() * 20; DESA.pangan.ui(); const html = P.attractionHTML(), el = document.getElementById('dayaTarik');
    return { A0: { ok: A0.ok, chance: A0.chance, happy: A0.happy }, normal: normal.spawned, A1: { ok: A1.ok, chance: A1.chance, happy: A1.happy, needFd: A1.needFd }, bahagia, murung: murung.spawned, murungDays, Am: { happy: Am.happy, minMood: Am.minMood }, htmlMurung: /murung/.test(htmlMurung), prog: (prog.replace(/<[^>]+>/g, '').match(/\d+\/\d+ hari/) || [''])[0], A2: { ok: A2.ok, foodOk: A2.foodOk }, panel: !!el && /Daya tarik desa/.test(el.innerHTML), html: html.replace(/^.*?<b>/, '<b>').slice(0, 160), happySpawns: S.happySpawns || 0, cfg: C.SPAWN }; });
  ok('pendatang biasa 0.5', happy.A0.ok && !happy.A0.happy && happy.A0.chance === happy.cfg.chancePerDay && happy.normal === 0, happy);
  ok('pendatang bahagia', happy.A1.ok && happy.A1.happy && happy.A1.chance === happy.cfg.happy.chancePerDay && happy.A1.chance > happy.A0.chance && happy.bahagia.spawned === 1 && /💌/.test(happy.bahagia.log) /* teks fallback 'Kabar desa yang bahagia...' atau variasi TEKS pangan.daya_tarik.pendatang */ && happy.happySpawns === 1, happy);
  ok('desa bahagia: syarat ketat', happy.cfg.happy.mood === 80 && happy.cfg.happy.days === 5 && happy.cfg.happy.minMood === 50, happy.cfg);
  ok('warga murung membatalkan', happy.murung === 0 && happy.murungDays === 0 && !happy.Am.happy && happy.htmlMurung, happy);
  ok('progres 3/5 hari', happy.prog === '3/5 hari', happy.prog);
  ok('pendatang butuh 12 hari stok', happy.A1.needFd === 12 && !happy.A2.ok && !happy.A2.foodOk, happy);
  ok('panel daya tarik', happy.panel && /Daya tarik desa: Tinggi/.test(happy.html), happy.html);
  // 7) kenduri: hanya menyerap stok di atas 15 hari; bentuk bergantian kenduri/syukuran/sedekah
  const ken = await p.evaluate(() => { const S = DESA.state, C = CONFIG, K = C.STORY_SINK.kenduri, setDay = d => { S.t = (d - 1) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.day = d; };
    const R = Math.random; const run = (day, days) => { setDay(day); S.res.gandum = 0; S.res.makanan = DESA.foodPerDay() * days; const f0 = S.res.makanan + S.res.gandum; Math.random = () => 0.99;
      try { DESA.story.storyNewDay(); } finally { Math.random = R; } return { taken: f0 - (S.res.makanan + S.res.gandum), left: (S.res.makanan + S.res.gandum) / DESA.foodPerDay() }; };
    const base = Math.max(K.fromDay, 29), dd = [0, 1, 2].map(i => base + 2 + i * K.everyDays);
    const n0 = S.kenduriN || 0, under = run(dd[0], 14), over = run(dd[0], 25), over2 = run(dd[1], 25), over3 = run(dd[2], 25);
    return { K: { surplusDays: K.surplusDays, forms: K.forms }, season: DESA.season(), under, over, n: (S.kenduriN || 0) - n0, logs: S.log.filter(l => /Kenduri|Syukuran|Sedekah|kenduri|syukuran|sedekah/.test(l)).slice(0, 3) }; });
  ok('kenduri ambang 15', ken.K.surplusDays === 15 && ken.under.taken < 0.01 && ken.over.taken > 1 && ken.over.left >= 15 - 0.01, ken);
  ok('kenduri bentuk', ken.K.forms.length === 3 && ken.n === 3 && ken.logs.length >= 1, ken);
  // 8) tangkapan layar v9-pangan: top bar + teks melayang + tooltip ladang
  await p.evaluate(() => { const S = DESA.state, f = S.buildings.find(b => b.type === 'ladang'), C = CONFIG; S.t = 15.4 * C.DAY_LENGTH_SEC; S.day = 16; DESA.setZoom(2); DESA.centerCam(f.x + 1, f.y - 1); document.querySelectorAll('.toast').forEach(e => e.remove());
    S.res.makanan = 50; S.res.gandum = 25; const v = S.villagers[0], w = S.villagers[1]; v.x = f.x + 1; v.y = f.y - 1; w.x = f.x + 3; w.y = f.y + 1; DESA.notes.length = 0;
    v.carry = { res: 'gandum', n: 9, src: 'padi' }; DESA.pangan.deposit(v); w.carry = { res: 'makanan', n: 4, src: 'ikan' }; DESA.pangan.deposit(w); DESA.notes.forEach(n => n.life = 999); DESA.pangan.render(); DESA.pangan.ui(); });
  const pos = await p.evaluate(() => { const S = DESA.state, f = S.buildings.find(b => b.type === 'ladang'), cv = document.querySelector('canvas'), r = cv.getBoundingClientRect(), cam = DESA.cam;
    return { x: r.left + ((f.x * 32 + 16) - cam.x) * cam.zoom * r.width / cv.width, y: r.top + ((f.y * 32 + 16) - cam.y) * cam.zoom * r.height / cv.height }; });
  await p.mouse.move(pos.x, pos.y); await p.waitForTimeout(150);
  const tipShown = await p.evaluate(() => { const el = document.getElementById('fieldTip'); return el && el.style.display !== 'none' ? el.textContent : null; });
  ok('tooltip ladang tampil', tipShown && /kemarau/i.test(tipShown), tipShown);
  await p.evaluate(() => { document.querySelectorAll('.toast').forEach(e => e.remove()); DESA.notes.forEach(n => n.life = 1.8); DESA.pangan.render(); });
  await p.screenshot({ path: '../docs/screenshots/v9-pangan.png' });
  // 9) tangkapan layar v9-memancing: warga memancing di tepi sungai (aset tahap 9) + kolam ikan
  const fishShot = await p.evaluate(() => { const S = DESA.state, C = CONFIG, cam = DESA.cam; S.t = 2.4 * C.DAY_LENGTH_SEC; S.day = 3; S.event = null;
    const bank = S.banks.find(b => S.tiles[b.y][b.x] !== 2 && Math.abs(b.x - C.CAMP.x) < 14) || S.banks[0], v = S.villagers[0], w = S.villagers[1];
    const face = [[0, 1, 0], [-1, 0, 1], [1, 0, 2], [0, -1, 3]].find(([dx, dy]) => S.tiles[bank.y + dy] && S.tiles[bank.y + dy][bank.x + dx] === 1);
    v.x = bank.x; v.y = bank.y; v.inside = null; v.path = null; v.working = true; v.task = { kind: 'kumpul', res: 'makanan', src: 'memancing', target: { x: bank.x, y: bank.y }, work: 26.5, face: face ? face[2] : 0, spotKey: 'shot' };
    let k = null; for (let r = 2; r < 12 && !k; r++) for (let dy = -r; dy <= r && !k; dy++) for (let dx = -r; dx <= r && !k; dx++) if (DESA.validSpot('kolam', bank.x + dx, bank.y + dy)) k = DESA.addBuilding('kolam', bank.x + dx, bank.y + dy, true) || S.buildings[S.buildings.length - 1];
    DESA.pangan.foodSourcesDaily(); if (k) { const sp = { x: k.x + 1, y: k.y + 2 }; w.x = sp.x; w.y = sp.y; w.inside = null; w.path = null; w.working = true; w.task = { kind: 'kumpul', res: 'makanan', src: 'memancing', target: sp, work: 10, face: 3, pond: k.id, fb: k }; }
    DESA.notes.length = 0; DESA.centerCam(bank.x, bank.y); DESA.setZoom(2); DESA.centerCam(bank.x, bank.y); document.getElementById('fieldTip') && (document.getElementById('fieldTip').style.display = 'none');
    DESA.pangan.render(); return { bank, pond: !!k, fish: S.fish, label: DESA.pangan.panganLabel('memancing') }; });
  ok('kolam ikan + stok', fishShot.pond && Object.values(fishShot.fish.ponds)[0] > 0 && fishShot.label === 'Ikan', fishShot);
  await p.mouse.move(5, 5); await p.waitForTimeout(600); await p.evaluate(() => document.querySelectorAll('.toast').forEach(e => e.remove())); await p.screenshot({ path: '../docs/screenshots/v9-memancing.png' });
  // 10) tema sedang: memancing & jamur ada, padanan umbi liar; pohon buah tropis & keong tidak ada; teks melayang tetap berlabel
  const q = await open('sedang');
  const sd = await q.evaluate(() => { const F = CONFIG.FOOD_SOURCES, S = DESA.state; const v = S.villagers[0]; v.carry = { res: 'makanan', n: 5, src: 'ikan' }; DESA.pangan.deposit(v);
    return { ids: Object.keys(F), buahNodes: S.nodes.filter(n => n.type === 'buah').length, umbiNodes: S.nodes.filter(n => n.type === 'umbi').length, note: DESA.notes.map(n => `+${n.n} ${n.label}`), umbiLbl: DESA.pangan.panganLabel('umbi'),
      badge: document.getElementById('panganBadge') && document.getElementById('panganBadge').textContent }; });
  ok('sedang sumber', sd.ids.includes('memancing') && sd.ids.includes('jamur') && sd.ids.includes('umbi') && !sd.ids.includes('buah') && !sd.ids.includes('keong') && sd.buahNodes === 0 && sd.umbiNodes > 0, sd);
  ok('sedang note', sd.note.includes('+5 Ikan') && sd.umbiLbl !== 'Umbi hutan' /* fallback 'Umbi liar', TEKS sedang bisa 'Kentang liar' */, sd);
  const res = { top: top.txt, notes: notes.ns, field: fld.dry.why, fish: { hujan: fish.hujan.avg.toFixed(2), deras: fish.deras.avg.toFixed(2), kemarau: fish.kemarau.avg.toFixed(2) }, jamur: { hujan: jam.hujan, kemarau: jam.kemarau }, kenduri: ken.over, happy: happy.bahagia.spawned, fails, errs };
  console.log(JSON.stringify(res, null, 1));
  if (fails.length || errs.length) process.exitCode = 1; await b.close();
})();
