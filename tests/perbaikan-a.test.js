// Milestone A (sisa): rawat melewati malam (perawat tidur, pasien tetap terlindung), tumbuh tanaman tidak negatif, efek sifat (kerja/lapar/energi/mood/
// gosip/konflik/aura), syarat hamil baru (Perkemahan + rumah + pangan 5 hari), tata letak tinggi 768/860 (tanpa gulir, peta utuh), lebar 900 (bilah atas
// <= 2 baris), panel penduduk tidak menutupi tombol bilah atas, teks ancaman per tema dari tema.js; retest hardware: 1100-1599 x 768/860, padi layu.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [];
  const open = async (vp, tema) => { const p = await b.newPage({ viewport: vp || { width: 1600, height: 900 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state && DESA.allEvents().length, null, { timeout: 15000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  const p = await open();
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, A = DESA.addBuilding, R = DESA.rel, L = DESA.life, out = {}, rnd = Math.random;
    const setDay = (d, f = 0.3) => { S.t = (d - 1) * C.DAY_LENGTH_SEC + f * C.DAY_LENGTH_SEC; S.day = d; };
    const run = (sec, until) => { for (let i = 0; i < sec * 10; i++) { DESA.step(0.1); S.event = null; if (until && until()) return true; } return false; };
    Object.assign(S.res, { kayu: 300, batu: 200, makanan: 400, air: 300, papan: 40 });
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('gubuk', 26, 23, true); A('sumur', 24, 25, true);
    const [sa, bu] = S.villagers; L.assignHomes();
    // (1) rawat melewati malam: sakit parah, perawat mulai 20:30, tidur 21:00, lemparan maut fajar dipaksa 100% -> pasien tetap hidup lalu sembuh
    const sev = C.SICKNESS.severeDeathPerDay; C.SICKNESS.severeDeathPerDay = 1; S.year2 = true;
    setDay(6, 0.5); DESA.makeSick(bu, 'parah', 'masuk_angin'); setDay(7, 0.85); S.prio.rawat = 3;
    sa.task = { kind: 'rawat', pid: bu.id, target: { x: bu.x, y: bu.y }, work: 0 }; sa.x = bu.x; sa.y = bu.y; sa.hunger = sa.energy = 95;
    run(3); out.careStarted = (bu.sick.careWork || 0) > 0 && bu.sick.underCareUntil === 8;
    out.carerSlept = run(60, () => sa.task && sa.task.kind === 'tidur');
    out.nightRoll = run(120, () => S.day === 8 && (S.t / CONFIG.DAY_LENGTH_SEC) % 1 > 0.22); out.aliveAtDawn = S.villagers.includes(bu);
    out.curedLater = run(240, () => !bu.sick || bu.sick.lvl === 'ringan'); C.SICKNESS.severeDeathPerDay = sev; S.year2 = false;
    // (2) tanaman: kekeringan/banjir tidak membuat grow negatif
    A('ladang', 14, 26, true); const f0 = S.buildings.find(x => x.type === 'ladang'); f0.stage = 'tumbuh'; f0.grow = 0.2; DESA.applyEffects && DESA.applyEffects({ pertumbuhan_ladang: -2 });
    out.growClamp = f0.grow >= 0;
    // (2b) hujan di labuh (Nusantara): semak tumbuh lagi, tebang kayu selesai, tidak ada NaN (dulu rainBushRegrowMult/chopTimeMultRain hilang -> semak mati permanen)
    setDay(26, 0.4); S.rainDay = 26; out.labuhRain = DESA.season() === 'labuh' && DESA.isRaining();
    const sm = S.nodes.filter(n => n.type === 'semak').slice(0, 5); sm.forEach(n => { n.amount = 0; n.regrow = 3; });
    for (let i = 0; i < 60; i++) { DESA.step(0.1); S.event = null; S.rainDay = S.day; }
    out.bushNoNaN = sm.every(n => !Number.isNaN(n.regrow) && Number.isFinite(n.amount)); out.bushRegrew = sm.every(n => n.amount > 0);
    const FXs = CONFIG.SEASON_FX, rk = Object.entries(FXs).filter(([, f]) => f.rainChance).map(([k, f]) => k + ':' + (f.rainBushRegrowMult > 0) + (f.chopTimeMultRain > 0)); out.rainKeys = rk;
    // (3) efek sifat
    S.villagers.splice(2); L.assignHomes(); // pendatang acak selama langkah di atas dibuang supaya angka di bawah pasti
    sa.traits = ['rajin', 'ahli_tani']; bu.traits = ['pelit', 'jujur'];
    out.workRajinTani = +R.traitWorkMult(sa, 'bertani').toFixed(3); // 1.12*1.2 (* hubungan/sendirian)
    const fp0 = DESA.foodPerDay(); bu.traits = ['jujur', 'sabar']; const fp1 = DESA.foodPerDay(); out.pelitFood = +(fp0 / fp1).toFixed(3); // (1+0.95)/2
    out.energyMult = [R.traitMult(sa, 'energyMult'), R.traitMult({ traits: ['malas'] }, 'energyMult')];
    // mood pasif harian: periang +1, malas +2 (maks +6 total)
    sa.traits = ['periang', 'malas']; bu.traits = ['sabar']; R.relSet(sa, bu, 0); sa.mood = 50; R.traitDaily(); out.moodPassive = +(sa.mood - 50).toFixed(2);
    // gosip (jahil): Math.random dipaksa kecil
    bu.traits = ['ramah', 'sabar']; bu.inside = null; bu.x = 20; bu.y = 21; const w0 = S.welcomed || 0; L.spawnVillager(20, 22, false, 'Wulan'); const wu = S.villagers[S.villagers.length - 1]; out.welcomed = (S.welcomed || 0) > w0 && wu.welcomedUntil >= S.day + 13;
    sa.traits = ['jahil', 'rajin']; R.relSet(sa, bu, 10); R.relSet(sa, wu, 10); R.relSet(bu, wu, 10); S.relDay = {}; Math.random = () => 0.01;
    const g0 = S.gossips || 0; R.traitDaily(); out.gossip = (S.gossips || 0) > g0; Math.random = rnd;
    // konflik: skor < 0, bertemu >= 1 jam, peluang dipaksa
    sa.traits = ['pemarah', 'rajin']; bu.traits = ['pemarah', 'jujur']; R.relSet(sa, bu, -20); S._meet = { [R.relKey(sa, bu)]: C.DAY_LENGTH_SEC }; Math.random = () => 0.0001;
    const cf0 = S.conflicts || 0, before = R.relGet(sa, bu); R.traitDaily(); out.conflict = (S.conflicts || 0) > cf0 && R.relGet(sa, bu) <= before - 8 + 0.01; Math.random = rnd;
    // ramah menyambut pendatang (+5 mood, betah 14 hari)
    // aura periang: penduduk lain di dekatnya naik mood
    sa.traits = ['periang', 'rajin']; sa.inside = bu.inside = null; bu.x = sa.x + 1; bu.y = sa.y; bu.mood = 40; for (let i = 0; i < 24; i++) R.traitTick([sa, bu], 5); out.aura = bu.mood > 40;
    // ancaman: penakut luka x0.8, tidak mau jaga malam
    out.penakut = [R.traitMult({ traits: ['penakut'] }, 'threatDmgMult'), R.traitMult({ traits: ['pemberani'] }, 'scareMult')];
    // (4) syarat hamil baru: era Perkemahan boleh asal serumah, pangan >= 5 hari
    S.era = 0; A('gubuk', 30, 23, true); const P = C.PREGNANCY; out.pregRules = [P.minEra, P.minFoodDays, P.needHome];
    const m = S.villagers.find(v => v.sex === 'P' && !L.isKid(v)), f = S.villagers.find(v => v.sex === 'L' && !L.isKid(v));
    if (m && f) { L.pairUp(m, f); L.assignHomes(); m.ageF = 25; f.ageF = 27; m.mood = f.mood = 90; S.res.makanan = 600; S.seasonBirths = {}; m.lastBirthDay = null; m.sick = f.sick = null; m.health = f.health = 100; out.pregWhy = { era: S.era, food: S.res.makanan, cap: L.capacity(), pop: S.villagers.length, home: [m.homeId, f.homeId] };
      out.pregCamp = L.pregnancyOk(m, f); const hid = m.homeId; m.homeId = null; out.pregNoHome = L.pregnancyOk(m, f); m.homeId = hid; }
    // (5) teks ancaman per tema
    out.txt = [DESA.TT('warn_mendekat'), DESA.TT('jejak', { hari: 1, nama: 'Sari' })];
    return out; });
  // (6) tata letak: tinggi 768/860 tanpa gulir halaman, kanvas utuh; lebar 900: bilah atas <= 2 baris (state kaya: semua sumber daya, era tinggi)
  await p.evaluate(() => { const S = DESA.state; Object.assign(S.res, { kayu: 999, batu: 999, makanan: 999, gandum: 999, air: 999, alat: 99, kulit: 99, papan: 999, batu_bata: 999 }); S.era = 3; });
  const lay = [];
  for (const [w, h] of [[900, 768], [900, 860], [1280, 768], [1280, 860], [1600, 900]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(350);
    lay.push(await p.evaluate(([w, h]) => { const t = document.getElementById('top'), c = document.getElementById('c'), bb = c.getBoundingClientRect(), side = document.getElementById('side').getBoundingClientRect();
      const btns = [...t.querySelectorAll('button')].filter(x => x.offsetParent && x.getBoundingClientRect().width > 0), rows = new Set(btns.map(x => Math.round((x.getBoundingClientRect().top + x.getBoundingClientRect().bottom) / 2 / 12))).size;
      return { w, h, rows, noScroll: document.documentElement.scrollHeight <= innerHeight + 1 && document.documentElement.scrollWidth <= innerWidth + 1, canvasFits: bb.bottom <= innerHeight + 0.5 && bb.top >= t.getBoundingClientRect().bottom - 0.5, sideFits: side.bottom <= innerHeight + 0.5 }; }, [w, h])); }
  // (7) panel penduduk terbuka: tombol Pasar/Pencapaian/Simpan/Muat tetap di atas (bisa diklik), pada 900 & 1600
  const vp = [];
  for (const [w, h] of [[900, 768], [1600, 900]]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(300);
    await p.evaluate(() => DESA.openVillager(DESA.state.villagers[0].id)); await p.waitForTimeout(200);
    vp.push(await p.evaluate(() => ['marketbtn', 'achbtn', 'save', 'load', 'techbtn'].map(id => { const e = document.getElementById(id), r = e.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!hit && (hit === e || e.contains(hit)); }).every(Boolean)));
  }
  await p.click('#achbtn'); vp.push(await p.isVisible('#achpanel')); await p.evaluate(() => { const a = document.getElementById('achpanel'); if (a) a.style.display = 'none'; });
  // (8) retest hardware @5abc262: lebar 1100/1280/1366/1500/1599 x tinggi 768/860 dengan panel penduduk terbuka -> bilah atas <= ~2 baris (<= 80px),
  //     panel penduduk tidak lewat bawah layar, baris tombol bangun tidak terpotong/tersembunyi (membungkus, tanpa gulir mendatar)
  const hw = [];
  for (const w of [1100, 1280, 1366, 1500, 1599]) for (const h of [768, 860]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(350);
    await p.evaluate(() => DESA.openVillager(DESA.state.villagers[0].id)); await p.waitForTimeout(150);
    hw.push(await p.evaluate(([w, h]) => { const t = document.getElementById('top').getBoundingClientRect(), vpn = document.getElementById('vpanel').getBoundingClientRect(), bb = document.getElementById('buildbar'), br = bb.getBoundingClientRect();
      const btns = [...bb.querySelectorAll('button')].filter(x => x.offsetParent), cut = btns.filter(x => { const r = x.getBoundingClientRect(); return r.right > br.right + 1 || r.left < br.left - 1 || r.right > innerWidth || r.bottom > t.bottom + 1; }).map(x => x.textContent.trim());
      return { w, h, topH: Math.round(t.height), vpBottom: Math.round(vpn.bottom), cut, noHScroll: bb.scrollWidth <= bb.clientWidth + 1, nBtn: btns.length }; }, [w, h])); }
  // (9) padi layu di sawah kering (kemarau tanpa irigasi) benar-benar digambar (dulu tak terlihat di atas lumpur retak)
  const wilt = await p.evaluate(() => new Promise(res => { const S = DESA.state, C = CONFIG; S.t = 14 * C.DAY_LENGTH_SEC + 0.4 * C.DAY_LENGTH_SEC; S.day = 15; S.event = null;
    const fx = S.villagers[0].x | 0, fy = (S.villagers[0].y | 0) + 2; DESA.addBuilding('ladang', fx, fy, true); const f = S.buildings[S.buildings.length - 1]; f.crop = 'padi'; f.stage = 'tumbuh'; f.grow = 0.8 * 6;
    const g = document.getElementById('c').getContext('2d'), orig = g.drawImage, T = C.TILE; let hit = 0;
    g.drawImage = function (im, ...a) { if (a.length === 8 && a[4] === fx * T && a[5] === fy * T && im instanceof HTMLCanvasElement && a[0] > 0) hit++; return orig.call(this, im, ...a); };
    setTimeout(() => { g.drawImage = orig; res({ season: DESA.season(), hit }); }, 400); }));
  console.log(JSON.stringify({ r, lay, vp, hw, wilt }));
  const ok = r.careStarted && r.carerSlept && r.nightRoll && r.aliveAtDawn && r.curedLater && r.growClamp && r.workRajinTani >= 1.12 * 1.2 * 0.95 - 0.001
    && r.pelitFood === 0.975 && r.energyMult.join() === '1.1,0.85' && r.moodPassive === 3 && r.gossip && r.conflict && r.welcomed && r.aura && r.penakut.join() === '0.8,1.5'
    && r.labuhRain && r.bushNoNaN && r.bushRegrew && r.rainKeys.every(s => s.endsWith('truetrue')) && r.pregRules.join() === 'perkemahan,5,true' && r.pregCamp === true && r.pregNoHome === false && /Dengusan/.test(r.txt[0]) && /babi hutan/i.test(r.txt[1])
    && lay.every(l => l.noScroll && l.canvasFits && l.sideFits) && lay.filter(l => l.w === 900).every(l => l.rows <= 2) && vp.every(Boolean) && hw.every(l => l.topH <= 80 && l.vpBottom <= l.h && !l.cut.length && l.noHScroll && l.nBtn >= 5) && wilt.season === 'kemarau' && wilt.hit > 0 && !errs.length;
  console.log(errs.length ? errs : 'no errors', ok ? 'LULUS' : 'GAGAL'); await b.close(); process.exit(ok ? 0 : 1);
})();
