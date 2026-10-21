// Tema Nusantara P0 (docs/RISET-INDONESIA.md): musim hujan(9) mareng(5) kemarau(9) labuh(5), isHardSeason = kemarau, label Padi (id gandum),
// tanaman tegalan (padi berhenti di kemarau tanpa irigasi; jagung/singkong tetap tumbuh x1.25), babi hutan merusak ladang, teks event tanpa salju/serigala,
// panen raya hanya di mareng, aset tropis (tanpa salju). Simpan screenshot musim hujan, kemarau & malam.
const { chromium } = require('playwright');
const path = require('path'); const SHOT = n => path.join(__dirname, '..', 'docs', 'screenshots', n);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto((() => { const u = new URL(process.env.GAME_URL || 'http://localhost:8095/'); u.searchParams.set('tema', 'indonesia'); return u.href; })()); // v9d: dipatok ke tema Nusantara await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip');
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, out = {}, R = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    out.theme = C.THEME;
    // musim kumulatif
    const at = d => { setDay(d); const i = DESA.seasonInfo(); return i.id + i.day + '/' + i.len; };
    out.seasons = [1, 9, 10, 14, 15, 23, 24, 28, 29].map(at); out.yearDays = DESA.yearDays();
    setDay(16); out.hard = DESA.isHardSeason() && DESA.season() === 'kemarau'; setDay(3); out.notHard = !DESA.isHardSeason();
    out.padi = DESA.RES_LABEL.gandum === 'Padi' && 'gandum' in S.res;
    out.topbar = document.getElementById('time').textContent;
    // lapar kemarau x1.4
    const pop = S.villagers.length; setDay(5); const fh = DESA.foodPerDay(); setDay(16); const fk = DESA.foodPerDay(); out.hungerMult = +(fk / fh).toFixed(2);
    // tanaman
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true);
    for (let i = 0; i < 4; i++) A('ladang', 14 + i, 26, true); const L = S.buildings.filter(x => x.type === 'ladang'); out.rotation = L.map(DESA.cropId);
    const padi = L.find(x => DESA.cropId(x) === 'padi'), jag = L.find(x => DESA.cropId(x) === 'jagung'); padi.stage = jag.stage = 'tumbuh'; padi.grow = jag.grow = 0;
    setDay(16, 0.3); out.kemarauGrow = { padi: DESA.canGrow(padi), jagung: DESA.canGrow(jag), jagungDays: DESA.growDaysOf(jag), jagungBase: C.FIELD.crops.jagung.growDays };
    S.droughtDone = S.floodDone = true; // kekeringan acak menunda tumbuh (dijepit >= 0); di sini hanya laju tumbuh yang diuji
    for (let i = 0; i < 100; i++) DESA.step(0.1); out.kemarauProgress = { padi: padi.grow, jagung: +jag.grow.toFixed(3) };
    S.techDone.push('T04'); out.irrigated = DESA.canGrow(padi) && DESA.growDaysOf(padi) > C.FIELD.crops.padi.growDays; S.techDone.pop();
    setDay(3, 0.3); out.hujanPadiDays = DESA.growDaysOf(padi); padi.stage = jag.stage = 'kosong'; padi.grow = jag.grow = 0;
    // event
    setDay(11); const ev = id => DESA.allEvents().find(e => e.id === id); out.panenMareng = DESA.eventAllowed(ev('panen_raya')); setDay(3); out.panenHujan = DESA.eventAllowed(ev('panen_raya'));
    out.snowOff = DESA.allEvents().every(e => !/salju|serigala|musim dingin/i.test(JSON.stringify({ ...e, id: '' }))); // TEKS v1.4.0: semua teks event sudah Nusantara
    // babi hutan: era perkemahan -> hanya merusak ladang, tidak melukai
    S.era = 0; setDay(6, 0.88); S.villagers.forEach(v => { v.task = null; v.health = 100; });
    L.forEach(x => { x.stage = 'tumbuh'; x.grow = 1; });
    S.wolves = []; S.wolf = { day: S.day, phase: 'serang', scared: {} }; DESA.spawnWolf(); const boar = S.wolves[0]; boar.x = 13; boar.y = 26;
    let steps = 0; while (steps++ < 300 && !(S.fieldsWrecked > 0)) { if (S.event) S.event = null; DESA.step(0.1); }
    out.boar = { wrecked: S.fieldsWrecked || 0, bites: S.wolfBites || 0, kosong: L.filter(x => x.stage === 'kosong').length, log: S.log.find(l => l.includes('🐗')) || '' };
    S.wolves = []; S.wolf = null;
    // aset
    out.assets = { gubuk: ASSETS.gubuk.img, obor: ASSETS.obor.img, pos: ASSETS.menara_jaga.img, snow: !!ASSETS.cuaca_salju || !!ASSETS.rumput_dingin, hujanGrass: !!(ASSETS.rumput_hujan && ASSETS.rumput_hujan.image), padi: !!(ASSETS.tanaman_padi && ASSETS.tanaman_padi.image), boar: !!(ASSETS.babi_hutan && ASSETS.babi_hutan.image) };
    out.names = [C.BUILDINGS.gubuk.nama, C.BUILDINGS.menara_jaga.nama, C.BUILDINGS.obor.nama];
    return out; });
  console.log(JSON.stringify(r, null, 1));
  // screenshot: hujan (siang, hujan lebat) di sawah & tegalan; kemarau siang; malam (kunang-kunang)
  const shot = async (name, fn) => { await p.evaluate(fn); await p.click('[data-s="0"]'); await p.evaluate(() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; }); await p.waitForTimeout(700); await p.screenshot({ path: SHOT(name) }); };
  await p.evaluate(() => { const S = DESA.state, A = DESA.addBuilding; A('gubuk', 18, 21, true); A('sumur', 24, 23, true); A('obor', 20, 24, true); A('pagar', 12, 25, true); A('pagar', 12, 26, true); A('pagar', 12, 27, true);
    for (let i = 0; i < 3; i++) A('ladang', 14 + i, 27, true); S.buildings.filter(b => b.type === 'ladang').forEach((b, i) => { b.stage = 'tumbuh'; b.grow = 1 + i % 4; }); DESA.setZoom(2); DESA.centerCam(18, 24); });
  await shot('v7-hujan.png', () => { const S = DESA.state, C = CONFIG; S.t = 3 * C.DAY_LENGTH_SEC + 0.45 * C.DAY_LENGTH_SEC; S.day = 4; S.rainDay = 4; });
  await shot('v7-kemarau.png', () => { const S = DESA.state, C = CONFIG; S.t = 16 * C.DAY_LENGTH_SEC + 0.45 * C.DAY_LENGTH_SEC; S.day = 17; S.rainDay = 0; });
  await shot('v7-malam.png', () => { const S = DESA.state, C = CONFIG; S.t = 25 * C.DAY_LENGTH_SEC + 0.92 * C.DAY_LENGTH_SEC; S.day = 26; S.era = 1; S.wolves = []; S.wolf = { day: 26, phase: 'serang', scared: {} }; DESA.spawnWolf(); const o = S.wolves[0]; o.x = 15; o.y = 25; o.home = { x: 15, y: 25 }; o.mode = 'jalan'; });
  const ok = r.theme === 'indonesia' && r.seasons.join() === 'hujan1/9,hujan9/9,mareng1/5,mareng5/5,kemarau1/9,kemarau9/9,labuh1/5,labuh5/5,hujan1/9' && r.yearDays === 28 && r.hard && r.notHard && r.padi
    && r.hungerMult === 1.4 && r.rotation.join() === 'padi,jagung,padi,ubi' && !r.kemarauGrow.padi && r.kemarauGrow.jagung && r.kemarauGrow.jagungDays === r.kemarauGrow.jagungBase * 1.25
    && r.kemarauProgress.padi === 0 && r.kemarauProgress.jagung > 0 && r.irrigated && r.hujanPadiDays < 7.5 && r.panenMareng && !r.panenHujan && r.snowOff
    && r.boar.wrecked > 0 && r.boar.bites === 0 && r.assets.gubuk.includes('gubuk_bambu') && r.assets.obor.includes('obor_bambu') && r.assets.pos.includes('pos_ronda') && !r.assets.snow && r.assets.hujanGrass && r.assets.padi && r.assets.boar
    && errs.length === 0;
  console.log(errs.length ? errs.slice(0, 5) : 'no errors', ok ? 'LULUS' : 'GAGAL'); await b.close(); process.exit(ok ? 0 : 1);
})();
