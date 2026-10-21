// Perbaikan sebelum siklus hidup: (1) tugas 'bangun' memperbaiki bangunan rusak sampai hp 100, (2) rawat tidak hilang (tak ada lemparan maut
// di hari mulai sakit parah / saat sedang dirawat), (3) tuning teruji (wolf & babi hutan), pengaman gubuk hari >= 6, (4) ikon Padi, sawah kering
// di kemarau tanpa irigasi, '👥 2 (belum ada rumah)', teks mengikuti tema (?tema=sedang tanpa teks Nusantara), ringkasan hari dilompati.
const { chromium } = require('playwright');
const path = require('path'); const SHOT = n => path.join(__dirname, '..', 'docs', 'screenshots', n);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (tema) => { const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); U.searchParams.set('tema', tema || 'indonesia'); // v9d: null = Nusantara (dipatok, GAME_URL ?tema=sedang tidak berlaku)
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  const p = await open(null);
  // badge penduduk sebelum ada rumah (perlu satu frame UI)
  await p.waitForTimeout(300); const badge0 = await p.textContent('#popBadge');
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, out = {}, R = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    const run = (sec, until) => { for (let i = 0; i < sec * 10; i++) { DESA.step(0.1); S.event = null; if (until && until()) return true; } return false; };
    Object.assign(S.res, { kayu: 200, batu: 100, makanan: 300, air: 200, papan: 20 });
    // teks musim dari meta.txt_tema_nusantara
    out.txtBound = ['musim_hujan', 'musim_mareng', 'musim_labuh', 'tahun_baru', 'jejak'].every(k => C.TXT[k] && C.TXT[k][0]);
    // tuning
    out.tuning = [C.THREAT.wolf.killChanceIfLowHp, C.THREAT.wolf.killSafeRadius, C.THREAT.babi.killChanceIfLowHp, C.THREAT.babi.killSafeRadius, C.SICKNESS.severeDeathPerDay, C.HEALTH.starvePerDay, C.SPOILAGE.foodFreeDays, C.FOOD_SURPLUS_FACTOR];
    // pengaman gubuk: hari 6 tanpa gubuk & kayu kurang -> kumpul kayu; gubuk ditaruh -> bangun
    setDay(6); const v0 = S.villagers[0], kayu = S.res.kayu; S.res.kayu = 0; out.hutGather = (DESA.hutEmergencyTask(v0) || {}).res;
    setDay(3); out.hutEarly = DESA.hutEmergencyTask(v0) === null; S.res.kayu = kayu; setDay(6);
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, false); out.hutBuild = (DESA.hutEmergencyTask(v0) || {}).kind;
    // (1) perbaikan: gubuk jadi tapi hp 30 -> kapasitas hilang -> diperbaiki sampai 100
    const h = S.buildings.find(x => x.type === 'gubuk'); h.done = true; h.progress = C.BUILDINGS.gubuk.work; h.hp = 30; out.capDamaged = S.villagers.length && DESA.popBadge().includes('belum ada rumah');
    S.villagers.forEach(v => { v.task = null; v.hunger = 95; v.energy = 95; v.mood = 90; }); S.prio.bangun = 3;
    setDay(6, 0.3); out.repaired = run(200, () => (h.hp ?? 100) >= 100); out.hp = Math.round(h.hp); out.badge = DESA.popBadge().replace(/<[^>]+>/g, '');
    // (2) rawat: tidak ada lemparan maut di hari mulai sakit parah / saat sedang dirawat; tetap mematikan bila dibiarkan
    const sick = S.villagers[1]; S.villagers.forEach(v => v.task = null); DESA.makeSick(sick, 'parah', 'masuk_angin');
    Math.random = () => 0; DESA.sicknessDaily(); out.graceDay = S.villagers.includes(sick);
    setDay(7); S.villagers[0].task = { kind: 'rawat', pid: sick.id, target: { x: sick.x, y: sick.y }, work: 0 }; DESA.sicknessDaily(); out.tended = S.villagers.includes(sick);
    S.villagers[0].task = null; S.year2 = true; setDay(8); const yr = DESA.isY2; DESA.sicknessDaily(); out.untendedDies = !S.villagers.includes(sick); Math.random = R;
    // (4) ikon padi
    out.padiIcon = ASSETS.res_ikon.img[ASSETS.res_ikon.keys.indexOf('gandum')];
    // sawah kering: kemarau tanpa irigasi
    for (let i = 0; i < 6; i++) A('ladang', 14 + (i % 3) * 1, 26 + Math.floor(i / 3), true);
    const padi = S.buildings.filter(x => x.type === 'ladang' && DESA.cropId(x) === 'padi'); padi.forEach(x => { x.stage = 'tumbuh'; x.grow = 1; });
    setDay(16); out.dryKemarau = DESA.sawahDry(padi[0]); S.techDone.push('T04'); out.dryIrrigated = DESA.sawahDry(padi[0]); S.techDone.pop(); setDay(3); out.dryHujan = DESA.sawahDry(padi[0]);
    const im = DESA.drySawahImg(); out.drySrc = im.src || 'canvas'; const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let blue = 0; for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 8 && d[k + 2] > d[k] + 10) blue++; out.dryBluePx = blue;
    // ringkasan saat hari dilompati: label rentang
    S.dayStats = { gathered: { kayu: 5 } }; S.statsFrom = 9; setDay(15, 0.99); run(2); setDay(20, 0.01); run(0.2); out.summary = S.lastSummary && [S.lastSummary.from, S.lastSummary.day];
    setDay(16, 0.5); S.cam && 0; return out; });
  await p.evaluate(() => { const S = DESA.state; S.t = 15 * CONFIG.DAY_LENGTH_SEC + 0.5 * CONFIG.DAY_LENGTH_SEC; S.day = 16; const l = S.buildings.find(x => x.type === 'ladang'); S.event = null; document.getElementById('modal').style.display = 'none'; document.getElementById('toasts').innerHTML = ''; S.buildings.filter(x => x.type === 'ladang').forEach((x, i) => { x.done = true; x.stage = i % 2 ? 'siap' : 'tumbuh'; x.grow = 1; }); DESA.setZoom && DESA.setZoom(3); DESA.centerCam(l.x + 1, l.y); });
  await p.waitForTimeout(400); await p.screenshot({ path: SHOT('v8-sawah-kemarau.png') });
  const sumUI = await p.textContent('#summary');
  // tema empat musim: TEKS v1.5 + overlay teks empat musim (TEKS-TEMA-sedang.json), tanpa teks Nusantara; ikon gandum tetap
  const q = await open('sedang');
  const s = await q.evaluate(() => { const S = DESA.state, t = JSON.stringify(window.TEXT_DEBUG || {}); for (let i = 0; i < 6000; i++) { DESA.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } }
    const all = DESA.allEvents().map(e => JSON.stringify(e)).join(' ') + ' ' + S.log.join(' ');
    return { hits: (all.match(/.{0,60}(nasi bungkus|macan|kemarau|sawah|mareng).{0,30}/gi) || []).slice(0, 6), nusantara: /nasi bungkus|macan|kemarau|sawah|mareng/i.test(all), wheat: ASSETS.res_ikon.img[ASSETS.res_ikon.keys.indexOf('gandum')], file: CONFIG.TEXT_OVERLAY, versi: DESA.text.meta.versi, sifat: Object.keys(DESA.text.sifat || {}).filter(k => !k.startsWith('_') && DESA.text.sifat[k].nama).length, jejak: DESA.TT('jejak', { hari: 3, nama: 'Sari' }), musimDingin: DESA.TT('sulit_mulai'), a27: DESA.text.pencapaian.find(a => a.id === 'A27').nama, warn: DESA.TT('warn_mendekat'), log: S.log.length }; });
  console.log(JSON.stringify({ badge0, r, sumUI, s }));
  const ok = r.txtBound && badge0.includes('belum ada rumah') && r.tuning.join() === '0.25,4,0.3,4,0.15,30,16,0.8' /* v9: FOOD_SURPLUS_FACTOR 1 -> 0.8; v10: babi killChanceIfLowHp 0.3 */ && r.hutGather === 'kayu' && r.hutEarly && r.hutBuild === 'bangun'
    && r.capDamaged && r.repaired && r.hp === 100 && /2\/2|\d+\/\d+/.test(r.badge) && !r.badge.includes('belum')
    && r.graceDay && r.tended && r.untendedDies && /icon_padi_ikat/.test(r.padiIcon) && /sawah_kering_autotile/.test(r.drySrc) && r.dryKemarau && !r.dryIrrigated && !r.dryHujan && r.dryBluePx === 0
    && r.summary && r.summary[0] < r.summary[1] && /Hari \d+–\d+/.test(sumUI) && !s.nusantara && /icon_wheat/.test(s.wheat) && s.file === 'TEKS-TEMA-sedang.json' && s.versi >= '1.5' && s.sifat === 20 && s.jejak.length > 10 && !/babi|moncong|sawah|pematang/i.test(s.jejak) && s.musimDingin.length > 10 && !/kemarau|sawah/i.test(s.musimDingin) && !/Kemarau/.test(s.a27) && /Auman/.test(s.warn) && !errs.length;
  console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'no errors', ok ? 'LULUS' : 'GAGAL'); if (!ok) process.exitCode = 1; await b.close();
})();
