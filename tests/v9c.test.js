// v9c (uji perangkat Ichwan 21-10 @98960a0): sinyal siap tes, mood tanpa api/rumah tidak jatuh ke 0, inisiatif warga (api unggun/gubuk),
// pangan diutamakan < 4 hari, angka hari dihaluskan, 'bahaya' < 1 hari saat masa awal, #res tidak ditulis ulang tiap bingkai,
// event pendatang hanya bila bisa disambut, babi hutan tanpa sasaran mengendus dulu, teks melayang bertumpuk & format sama, ringkasan tanpa 'lain-lain' liar.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async tema => { const p = await b.newPage({ viewport: { width: 1366, height: 860 } });
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]').catch(() => {}); return p; };
  for (const tema of [null, 'sedang']) { const p = await open(tema), T = tema || 'nusantara';
    // 1) mood: tanpa api & rumah turun ke floor (bukan 0); hujan tanpa atap tidak menekan di bawah rainFloor; api menyala -> penalti hujan separuh
    const m = await p.evaluate(() => { const S = DESA.state, C = CONFIG, D = DESA; S.buildings = []; C.AUTO_BUILD = null; // matikan inisiatif agar benar-benar tanpa api
      S.villagers.forEach(v => { v.mood = 60; v.hunger = 100; v.energy = 100; }); for (let i = 0; i < 4000; i++) { D.step(0.1); S.event = null; S.res.air = 50; S.res.makanan = 200; S.villagers.forEach(v => { v.hunger = 100; v.energy = 100; }); }
      return { moods: S.villagers.map(v => Math.round(v.mood)), floor: C.MOOD_BARE.floor, rainFloor: C.MOOD_BARE.rainFloor }; });
    ok(T + ' mood floor', m.moods.every(x => x >= m.rainFloor && x <= m.floor + 1), m);
    // 2) inisiatif warga: hari 2 api unggun, hari 4 gubuk (bila belum ada apa-apa & bahan cukup)
    const ab = await p.evaluate(() => { const S = DESA.state, C = CONFIG; C.AUTO_BUILD = { fireDay: 2, hutDay: 4, hutTaskDay: 4 }; S.buildings = []; S.res.kayu = 40; S.res.batu = 20;
      S.day = 1; DESA.v9c.autoBuildDaily(); const d1 = S.buildings.length; S.day = 2; DESA.v9c.autoBuildDaily(); const d2 = S.buildings.map(b => b.type).join(); S.day = 4; DESA.v9c.autoBuildDaily();
      return { d1, d2, d4: S.buildings.map(b => b.type).join(), kayu: S.res.kayu, log: S.log.slice(0, 2) }; });
    ok(T + ' auto api', ab.d1 === 0 && ab.d2 === 'apiunggun', ab); ok(T + ' auto gubuk', ab.d4 === 'apiunggun,gubuk' && ab.kayu === 40 - 5 - 15, ab);
    // 3) pangan < 4 hari -> tugas pangan diutamakan
    const fp = await p.evaluate(() => { const S = DESA.state, C = CONFIG, v = S.villagers[0]; S.t = 0.4 * C.DAY_LENGTH_SEC; S.day = 1; v.hunger = 100; v.energy = 100; v.task = null; S.res.makanan = DESA.life.foodPerDay() * 3.5; S.res.gandum = 0;
      const t = DESA.v9c.chooseTask(v); return { kind: t.kind, res: t.res, src: t.src, harvest: t.harvest }; });
    ok(T + ' prioritas pangan', fp.kind === 'kumpul' && (fp.res === 'makanan' || fp.src) || fp.kind === 'tani', fp);
    // 4) masa awal: < 1 hari = 'bahaya' tanpa penalti mood
    const fam = await p.evaluate(() => { const S = DESA.state; S.day = 3; S.res.makanan = DESA.life.foodPerDay() * 0.5; S.res.gandum = 0; const mo = S.villagers.map(v => v.mood = 60);
      const lv = DESA.v9c.famineLevel(); DESA.v9c.famineDaily(); return { lv, after: S.villagers.map(v => v.mood), before: mo }; });
    ok(T + ' bahaya < 1 hari', fam.lv === 'bahaya' && fam.after.every(x => x === 60), fam);
    // 5) #res hanya ditulis ulang bila berubah (tooltip tidak berkedip)
    const rs = await p.evaluate(() => { DESA.pangan.ui(); const n = document.getElementById('panganBadge'); DESA.pangan.ui(); DESA.pangan.ui(); return n === document.getElementById('panganBadge') && document.body.contains(n); });
    ok(T + ' res stabil', rs);
    // 6) event pendatang hanya muncul bila opsi menyambut bisa dipilih
    const pe = await p.evaluate(() => { const S = DESA.state, e = DESA.allEvents().find(x => x.pilihan.some(q => (q.efek || {}).penduduk > 0)); if (!e) return { none: true };
      S.buildings = S.buildings.filter(b => b.type !== 'gubuk' && b.type !== 'rumah'); S.res.makanan = 50; const noHouse = DESA.v9c.popEventOk(e);
      DESA.addBuilding('gubuk', 2, 2, true); DESA.addBuilding('gubuk', 5, 2, true); DESA.life.assignHomes(); const withHouse = DESA.v9c.popEventOk(e); return { id: e.id, noHouse, withHouse }; });
    ok(T + ' event pendatang', pe.none || pe.noHouse === false && pe.withHouse === true, pe);
    // 7) babi/serigala tanpa sasaran tidak langsung lenyap
    const wf = await p.evaluate(() => { const S = DESA.state; S.era = 0; S.wolves = []; S.buildings = S.buildings.filter(b => b.type !== 'ladang'); S.villagers.forEach(v => { v.inside = null; });
      DESA.v9c.spawnWolf(); S.villagers.forEach(v => { v.inside = 999; }); const o = S.wolves[0]; if (!o) return { none: true }; let alive = 0; for (let i = 0; i < 40; i++) { DESA.v9c.updateWolf(o, 0.1); if (!o.gone) alive++; } return { alive, mode: o.mode, sniff: o.sniff != null }; });
    ok(T + ' hewan mengendus', wf.none || wf.alive === 40 && wf.sniff, wf);
    // 8) teks melayang: format sama (+4 Kayu) & bertumpuk naik
    const nt = await p.evaluate(() => { const S = DESA.state, v = S.villagers[0], N = DESA.v9c.notes; N.length = 0; DESA.v9c.notify('kayu', 4, v); DESA.v9c.notify('batu', 3, v); DESA.v9c.notify('air', 2, v);
      return N.map(n => ({ s: `+${n.n} ${n.label}`, slot: n.slot })); });
    ok(T + ' teks melayang', nt.length === 3 && /^\+4 \S/.test(nt[0].s) && nt[0].s !== '+4' && nt.map(n => n.slot).join() === '0,1,2', nt);
    // 9) ringkasan: pangan dari kejadian diberi label, bukan 'lain-lain'
    const sm = await p.evaluate(() => { const S = DESA.state; S.dayStats = {}; S.foodDayStart = S.res.makanan + (S.res.gandum || 0); DESA.v9c.applyEffects({ makanan: 6 }, 'event panen'); DESA.v9c.applyEffects({ makanan: -2 }, 'event tikus');
      const r = DESA.v9c.endOfDaySummary(); return { inn: r.foodIn, out: r.foodOut, txt: DESA.v9c.ioText(r.foodIn) + ' | ' + DESA.v9c.ioText(r.foodOut) }; });
    ok(T + ' ringkasan berlabel', sm.inn.event === 6 && sm.out.event === 2 && !sm.inn.lainnya && !sm.out.lainnya && !/lain-lain/.test(sm.txt), sm);
    await p.close(); }
  console.log(fails.length || errs.length ? 'FAIL v9c:\n  ' + [...fails, ...errs.slice(0, 5)].join('\n  ') : 'PASS v9c (mood floor, inisiatif warga, prioritas pangan, bahaya<1 hari, #res stabil, event pendatang, hewan mengendus, teks melayang, ringkasan berlabel) x2 tema');
  await b.close(); process.exit(fails.length || errs.length ? 1 : 0);
})();
