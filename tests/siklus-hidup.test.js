// Siklus hidup & fondasi tokoh (docs/RISET-SIKLUS-HIDUP.md, docs/RISET-CERITA-TUJUAN.md §1.1-1.2): jadwal tidur 21:00-05:00 (masuk rumah, lampu mati, Zzz),
// sifat (pendiri/pendatang/bayi, konflik), hubungan S.rel (awal, batas +6/hari, lantai, tingkat, pelupaan), pasangan butuh skor >= 50, pengali hamil,
// kelahiran (keluarga 60/50, sifat tersembunyi), mati tua, duka per hubungan, simpan/muat, tata letak 900-1560px. Screenshot v6-night.png & v6-family.png.
const { chromium } = require('playwright');
const path = require('path'); const SHOT = n => require('./shotdir')(n);
(async () => {
  const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto((() => { const u = new URL(process.env.GAME_URL || 'http://localhost:8095/'); u.searchParams.set('tema', 'indonesia'); return u.href; })()); // v9d: dipatok ke tema Nusantara await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {});
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, R = DESA.rel, L = DESA.life, out = {}, rnd = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    const run = (sec, until) => { for (let i = 0; i < sec * 10; i++) { DESA.step(0.1); S.event = null; if (until && until()) return true; } return false; };
    Object.assign(S.res, { kayu: 300, batu: 200, makanan: 400, air: 300, papan: 40 }); S.era = 1;
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('gubuk', 26, 23, true); A('sumur', 24, 25, true);
    const [sa, bu] = S.villagers;
    // sifat pendiri
    out.founders = S.villagers.map(v => v.traits);
    out.founderOk = S.villagers.every(v => v.traits.length === 2 && !v.traits.some(t => C.TRAITS.founderExclude.includes(t)) && v.traits.some(t => C.TRAITS.founderNeedOneOf.includes(t)));
    let clash = 0; for (let i = 0; i < 300; i++) { const t = R.pickTraits({}); if (C.TRAITS.conflicts.some(([x, y]) => t.includes(x) && t.includes(y)) || new Set(t).size !== t.length || t.length < 2 || t.length > 3) clash++; } out.traitClash = clash;
    out.peta = R.newcomerTraits('Wulan').slice(0, 2).join();
    // hubungan: awal pendiri 25, batas +6/hari, tingkat
    out.startFounders = R.relGet(sa, bu);
    R.relSet(sa, bu, 10); const g = [R.relAdd(sa, bu, 4), R.relAdd(sa, bu, 4), R.relAdd(sa, bu, 4)].reduce((x, y) => x + y, 0); out.dailyCap = +g.toFixed(2) <= C.RELATION.dailyGainCap + 0.01 && g > 0;
    out.levels = [-40, 0, 25, 60].map(s => { R.relSet(sa, bu, s); return R.relLevel(sa, bu); });
    out.drop = (() => { R.relSet(sa, bu, 30); R.relAdd(sa, bu, -50); return R.relGet(sa, bu); })();
    // pelupaan setelah 3 hari tanpa interaksi
    R.relSet(sa, bu, 30); S.relSeen[R.relKey(sa, bu)] = S.day - 5; R.relDaily(); out.decay = R.relGet(sa, bu) < 30;
    // pasangan butuh skor >= 50
    S.villagers.forEach(v => { v.mood = 90; v.goodMoodDays = 5; v.partnerId = null; v.closeTo = null; });
    sa.ageF = sa.age = 25; bu.ageF = bu.age = 27; sa.sex = 'P'; bu.sex = 'L';
    Math.random = () => 0; R.relSet(sa, bu, 45); R.pairingDaily(); R.pairingDaily(); out.noPairBelow50 = sa.partnerId == null;
    R.relSet(sa, bu, 60); R.pairingDaily(); R.pairingDaily(); out.paired = sa.partnerId === bu.id && bu.partnerId === sa.id; out.love = sa.loveAt != null && !!ASSETS.emote_cinta.image;
    out.partnerFloor = (() => { R.relSet(sa, bu, 0); return R.relGet(sa, bu); })(); Math.random = rnd;
    out.pairLevel = R.relLevel(sa, bu);
    // jadwal: 22:00 penduduk masuk rumah, lampu mati, Zzz
    S.villagers.forEach(v => { v.task = null; v.energy = 80; v.hunger = 95; }); setDay(6, 0.86); run(40, () => S.villagers.every(v => v.inside != null && v.task && v.task.asleep)); // tunggu semua benar-benar tidur (dulu kadang 1 baru masuk -> lampu masih menyala, flaky ~1/8)
    out.asleep = S.villagers.map(v => [v.task && v.task.kind, v.inside != null]);
    const h = S.buildings.find(x => x.id === sa.homeId); out.lightOff = h && !DESA.houseLit(h);
    out.doorHidden = !ASSETS.gubuk_pintu; // sprite pintu kayu tidak cocok dengan gubuk bambu
    return out; });
  await p.evaluate(() => { const S = DESA.state; S.event = null; S.rainDay = -1; document.getElementById('modal').style.display = 'none'; document.getElementById('toasts').innerHTML = ''; const h = S.buildings.find(x => x.type === 'gubuk'); DESA.centerCam(h.x + 2, h.y + 1); DESA.setZoom && DESA.setZoom(2); });
  await p.waitForTimeout(600); await p.screenshot({ path: SHOT('v6-night.png') });
  const r2 = await p.evaluate(() => { const S = DESA.state, C = CONFIG, R = DESA.rel, L = DESA.life, out = {}, rnd = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    setDay(30, 0.4); const [sa, bu] = S.villagers; S.villagers.forEach(v => { v.task = null; v.inside = null; });
    // pengali hamil (skor 100 -> x1.25 maks) & kelahiran
    R.relSet(sa, bu, 100); out.pregMult = Math.min(C.RELATION.pregnancyRelMult.maxTotal, 1 + (R.relGet(sa, bu) - 50) / 200);
    const n0 = S.villagers.length; L.giveBirth(sa); const baby = S.villagers[S.villagers.length - 1];
    out.born = S.villagers.length === n0 + 1 && baby.motherId === sa.id && baby.fatherId === bu.id;
    out.babyTraits = baby.traits.length >= 2 && baby.traitsHidden && !R.traitsVisible(baby);
    out.famRel = [R.relGet(baby, sa), R.relGet(baby, bu), R.relLevel(baby, sa)];
    L.giveBirth && (sa.lastBirthDay = null); L.giveBirth(sa); const kid2 = S.villagers[S.villagers.length - 1]; out.sibling = R.relGet(baby, kid2);
    out.birthLog = S.log.slice(0, 6).some(l => l.includes('👶'));
    // tumbuh: sifat terlihat di umur 8
    baby.ageF = 7.99; S.event = null; DESA.step(0.1); S.event = null; baby.ageF = C.TRAITS.inherit.revealAge; DESA.step(0.1); out.revealed = R.traitsVisible(baby) && !baby.traitsHidden;
    // duka: teman -5 seketika
    const nc = S.villagers.length; L.spawnVillager(23, 21, false, 'Joko'); const jo = S.villagers[S.villagers.length - 1]; R.relSet(jo, bu, 30); const m0 = jo.mood = 80;
    // save/load hubungan & sifat
    document.getElementById('save').click(); const relBefore = JSON.stringify(S.rel), trBefore = JSON.stringify(S.villagers.map(v => v.traits));
    DESA.loadGame(); const S2 = DESA.state; out.saveLoad = JSON.stringify(S2.rel) === relBefore && JSON.stringify(S2.villagers.map(v => v.traits)) === trBefore;
    const jo2 = S2.villagers.find(v => v.name === 'Joko'), bu2 = S2.villagers.find(v => v.id === bu.id); jo2.mood = 80; jo2.traits = ['rajin', 'jujur']; DESA.killVillager(bu2, 'sakit'); // sifat netral duka (sabar/religius x0.7 diuji terpisah)
    out.grief = Math.round(80 - jo2.mood); out.griefExpect = -C.DEATH.griefMoodInstant - C.RELATION.grief.temanInstant;
    // mati tua
    const old = S2.villagers.find(v => v.id === jo2.id); old.ageF = old.age = C.AGE.maxAge; L.oldAgeDaily(); out.oldDeath = !S2.villagers.includes(old) && (S2.deathsOld || 0) >= 1;
    DESA.openVillager(S2.villagers.find(v => v.id === sa.id).id); return out; });
  await p.evaluate(() => { const S = DESA.state; S.event = null; S.rainDay = -1; document.getElementById('modal').style.display = 'none'; document.getElementById('toasts').innerHTML = ''; });
  await p.waitForTimeout(500);
  const panel = await p.evaluate(() => ({ traits: document.querySelectorAll('#vpTraits [data-trait] img').length, rel: [...document.querySelectorAll('#vpRel ~ .rel-row')].map(x => x.dataset.rel), fam: !!document.getElementById('vpFam') }));
  await p.screenshot({ path: SHOT('v6-family.png') });
  // tata letak 900-1560px: tidak ada scroll horizontal, panel samping >= SIDE_MIN_W, kanvas tidak menimpa panel
  const lay = [];
  for (const w of [900, 1024, 1280, 1440, 1560]) { await p.setViewportSize({ width: w, height: 900 }); await p.waitForTimeout(250);
    lay.push(await p.evaluate(w => { const c = document.getElementById('c').getBoundingClientRect(), s = document.getElementById('side').getBoundingClientRect();
      return { w, overflow: document.documentElement.scrollWidth > w + 1, side: Math.round(s.width), overlap: c.right > s.left + 1, minW: CONFIG.SIDE_MIN_W }; }, w)); }
  console.log(JSON.stringify({ r, r2, panel, lay }));
  const ok = r.founderOk && r.traitClash === 0 && r.peta === 'ramah,pandai_masak' && r.startFounders === 25 && r.dailyCap && r.levels.join() === 'rival,kenalan,teman,sahabat'
    && r.drop === -20 && r.decay && r.noPairBelow50 && r.paired && r.love && r.partnerFloor === 40 && r.pairLevel === 'pasangan'
    && r.asleep.every(([k, ins]) => k === 'tidur' && ins) && r.lightOff && r.doorHidden
    && r2.pregMult === 1.25 && r2.born && r2.babyTraits && r2.famRel[0] === 60 && r2.famRel[1] === 60 && r2.famRel[2] === 'keluarga' && r2.sibling === 50 && r2.birthLog && r2.revealed
    && r2.saveLoad && r2.grief === r2.griefExpect && r2.oldDeath && panel.traits >= 2 && panel.rel.length >= 1 && panel.fam
    && lay.every(l => !l.overflow && l.side >= l.minW && !l.overlap) && !errs.length;
  console.log(errs.length ? 'ERR ' + errs.slice(0, 3) : 'no errors', ok ? 'LULUS' : 'GAGAL'); if (!ok) process.exitCode = 1; await b.close();
})();
