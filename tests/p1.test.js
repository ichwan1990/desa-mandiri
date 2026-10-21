// P1 Cerita & Tujuan (docs/RISET-CERITA-TUJUAN.md): keinginan warga (26, gelembung 8b, sifat malas/sabar/perantau), pendatang 2 pilihan,
// monumen bertahap + kerja bakti + penyerap makan pekerja, Desa Teladan, target tahunan, 5 cerita berantai, orang-orangan sawah.
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
  for (const tema of [null, 'sedang']) { const p = await open(tema), T = tema || 'nusantara';
    // ---- 1) keinginan ----
    const w = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {};
      r.n = Object.keys(C.WISHES.list).length;
      for (let i = 0; i < 4; i++) DESA.life.spawnVillager(10 + i, 10);
      S.era = 1; S.day = 30; S.res.makanan = 100; S.res.kayu = 50; S.res.kulit = 10;
      const v = S.villagers[0]; v.traits = ['rajin']; v.mood = 50; v.wish = null;
      P.wishStart(v, 'nasi_pecel'); r.started = !!v.wish && v.wish.until === S.day + C.WISHES.list.nasi_pecel.hari - 1;
      P.wishUI(); r.card = !!document.querySelector('#wish .wcard [data-wish]');
      const f0 = S.res.makanan; document.querySelector('#wish [data-wish="' + v.id + '"]').click(); r.paid = f0 - S.res.makanan; r.done = !v.wish; r.mood = v.mood; r.mm = C.WISHES.moodMult;
      // gagal: sabar 0.6, malas 0.5, biasa 1
      const fail = tr => { v.traits = tr; v.mood = 50; v.wishBuff = null; P.wishStart(v, 'nasi_pecel'); v.wish.until = S.day - 1; P.wishDaily(); return 50 - v.mood; };
      r.failBiasa = fail(['rajin']); r.failSabar = fail(['sabar']); r.failMalas = fail(['malas']);
      // kelaparan: kecewa tanpa penalti
      S.res.makanan = 0; S.res.gandum = 0; r.famine = DESA.v9c.famineLevel(); r.failLapar = fail(['rajin']); S.res.makanan = 100;
      // otomatis: kerja bakti / pentas reog / memancing
      v.mood = 50; P.wishStart(v, 'mandi_kali'); v.wish.id = 'nonton_reog'; S.lastReog = S.day; P.wishDaily(); r.autoReog = !v.wish;
      // sifat & syarat
      r.malasOnly = P.wishEligible(v, 'tidur_siang', C.WISHES.list.tidur_siang) === v.traits.includes('malas');
      r.ayamNever = !P.wishEligible(v, 'punya_ayam', C.WISHES.list.punya_ayam);
      // laju muncul perantau 1.3 / sabar 0.8 (pakai traitMult)
      r.rate = ['perantau', 'sabar'].map(t => C.TRAITS.list[t].wishRateMult);
      // gelembung: hampir (<=1 hari) -> aset hampir; emote (status) lebih penting
      return r; });
    ok(T + ' 26 keinginan', w.n === 26, w); ok(T + ' keinginan mulai', w.started, w); ok(T + ' kartu panel', w.card, w);
    ok(T + " penuhi bayar", w.paid === 2 && w.done && w.mood >= 50 + 8 * (w.mm || 0.4) - 0.01, w);
    ok(T + ' gagal sifat', w.failBiasa === 4 && Math.abs(w.failSabar - 2.4) < 0.01 && w.failMalas === 2, w);
    ok(T + ' gagal saat lapar tanpa penalti', w.failLapar === 0, w);
    ok(T + ' otomatis reog', w.autoReog, w); ok(T + ' butuhSifat', w.malasOnly, w);
    ok(T + ' wishRateMult', w.rate[0] === 1.3 && w.rate[1] === 0.8, w);
    // spawn harian: dalam 120 hari simulasi kasar, keinginan muncul & selesai/gagal tanpa error
    const sp = await p.evaluate(() => { const S = DESA.state, P = DESA.p1; S.era = 1; let n = 0; for (let d = 40; d < 160; d++) { S.day = d; S.res.makanan = 100; P.wishDaily(); n += S.villagers.filter(v => v.wish).length; } return { n, st: S.wishStats }; });
    ok(T + ' keinginan muncul', sp.n > 5 && sp.st.done + sp.st.fail > 0, sp);
    // gelembung digambar (aset ada) & varian hampir
    const bub = await p.evaluate(async () => { const S = DESA.state, v = S.villagers[0], P = DESA.p1; v.wish = null; P.wishStart(v, 'nasi_pecel');
      const ld = src => new Promise(r => { const i = new Image(); i.onload = () => r(i.naturalWidth); i.onerror = () => r(0); i.src = src; });
      return { b: await ld('assets/ui/wish/wish_bubble.png'), h: await ld('assets/ui/wish/wish_bubble_hampir.png'), ic: await ld('assets/icons/wishes/wish_nasi_pecel_16.png'), ic32: await ld('assets/icons/wishes/wish_nasi_pecel.png') }; });
    ok(T + ' aset gelembung', bub.b === 96 && bub.h === 96 && bub.ic === 16 && bub.ic32 === 32, bub);
    // pergi sementara (pulang kampung) lalu kembali
    const aw = await p.evaluate(() => { const S = DESA.state, P = DESA.p1, v = S.villagers.find(o => !o.pregnantUntil && o.age > 16); const n0 = S.villagers.length; const okA = P.sendAway(v, 3, 'pulang_kampung');
      const n1 = S.villagers.length; S.day += 3; P.awayDaily(); return { okA, n0, n1, n2: S.villagers.length }; });
    ok(T + ' pergi & kembali', aw.okA && aw.n1 === aw.n0 - 1 && aw.n2 === aw.n0, aw);
    // pendatang: 2 pilihan Terima / Tolak halus (mood kecil, tanpa biaya)
    const pd = await p.evaluate(() => { const e = DESA.allEvents().find(x => x.id === 'pendatang'); return e && e.pilihan.map(q => ({ t: q.teks, e: q.efek })); });
    ok(T + ' pendatang 2 pilihan', pd && pd.length === 2 && pd[0].e.penduduk === 1 && JSON.stringify(pd[1].e) === '{"suasana_hati":-2}', pd);
    // ---- 5) dilema tema sedang memakai teks tema (TEKS-TEMA-sedang.json) bila ada ----
    if (tema === 'sedang') { const dt = await p.evaluate(async () => { const ov = await (await fetch('TEKS-TEMA-sedang.json')).json(), ids = Object.keys(CONFIG.DILEMMAS), bad = [];
        return { ids: ids.length, ov: ov.dilema.__byId.length, missing: ids.filter(id => !ov.dilema.__byId.some(o => o.id === id)) }; });
      ok(T + ' semua dilema punya teks tema sedang', dt.missing.length === 0, dt);
      const shown = await p.evaluate(async () => { const ov = await (await fetch('TEKS-TEMA-sedang.json')).json(), S = DESA.state, out = [];
        for (const o of ov.dilema.__byId) { if (!CONFIG.DILEMMAS[o.id]) continue; S.event = null; S.story = null; DESA.story.openDilemma(o.id); const h = (document.querySelector('#modal h3') || {}).textContent;
          if (o.judul && h !== o.judul && !h.includes(o.judul.replace(/\{.*?\}/g, '').trim().slice(0, 8))) out.push(o.id + ':' + h); document.getElementById('modal').style.display = 'none'; S.event = null; S.story = null; } return out; });
      ok(T + ' kartu dilema sedang tampil judul tema', shown.length === 0, shown); }
    // ---- 2) monumen, kerja bakti, Teladan, target tahunan ----
    const mo = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {}, id = C.THEME === 'sedang' ? 'bendungan' : 'masjid';
      r.bar = !document.querySelector('#buildbar [data-b="masjid"]'); S.day = 10; S.era = 2; r.lockDay = P.monNext(id).why;
      S.day = 40; Object.assign(S.res, { kayu: 200, batu: 200, papan: 100, batu_bata: 100, alat: 20, kulit: 20, makanan: 200 });
      let spot = null; for (let y = 3; y < C.MAP_H - 5 && !spot; y++) for (let x = 2; x < C.MAP_W - 5; x++) if (P.validSpot(id, x, y)) { spot = { x, y }; break; }
      r.spot = spot; const k0 = S.res.kayu, f0 = S.res.makanan; const b = P.monStart(id, spot.x, spot.y); r.started = !!b && b.mon.act === 0 && !b.done; r.paid = k0 - S.res.kayu;
      r.work = P.bWork(b); r.second = P.monNext(id).active === true;
      // kerja: progres x1.25 saat kerja bakti; makan pekerja = penyerap
      S.t = Math.floor(S.t / C.DAY_LENGTH_SEC) * C.DAY_LENGTH_SEC + 0.3 * C.DAY_LENGTH_SEC; S.kb.last = -99; r.kb = P.kbStatus(); r.kbOk = P.startKerjaBakti(false); r.kbOn = P.kbOn(); r.kbAgain = P.kbStatus().active; S.kb.day--; r.kbCd = P.kbStatus().why; S.kb.day++;
      const v = S.villagers.find(o => o.age > 16); r.kbTask = (P.kbTask(v) || {}).b === b;
      v.task = { kind: 'bangun', b, target: { x: b.x, y: b.y } }; v.x = b.x; v.y = b.y; const p0 = b.progress; DESA.life.updateVillager(v, 1); r.rate = b.progress - p0;
      S.monWorkSec = C.DAY_LENGTH_SEC * 0.5 * 3; const fb = S.res.makanan + S.res.gandum; P.monDaily(); r.workerFood = +(fb - S.res.makanan - S.res.gandum).toFixed(2);
      // selesaikan tahap 1 -> fx
      b.progress = P.bWork(b) - 0.01; DESA.life.updateVillager(v, 1); r.st = b.mon.st; r.done = b.done; r.fxGrief = P.griefM({ traits: [] });
      r.next = P.monNext(id); return r; });
    ok(T + ' monumen tidak di bilah bangun', mo.bar, mo); ok(T + ' monumen terkunci hari', !!mo.lockDay, mo);
    ok(T + ' fondasi monumen', mo.started && mo.paid > 0 && mo.second, mo);
    ok(T + ' kerja bakti', mo.kb.ok && mo.kbOk && mo.kbOn && mo.kbAgain && /hari lagi/.test(mo.kbCd) && mo.kbTask, mo);
    ok(T + ' makan pekerja monumen', Math.abs(mo.workerFood - 3 * 0.6) < 0.05, mo);
    ok(T + ' tahap selesai', mo.st === 1 && mo.done, mo);
    if (!tema) ok(T + ' masjid fx duka', mo.fxGrief === 1 && mo.next.k === 1, mo);
    const tl = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {};
      S.goals = null; const Y = C.THEME === 'sedang'; S.day = 1; P.goalsDaily(); r.goals = S.goals && S.goals.list.length;
      // teladan: hari ke-21 tahun 2
      S.teladan = { tier: 0, years: {}, history: [] }; S.hist = { mood: Array(56).fill(80), fam: Array(56).fill('aman') };
      while (S.villagers.length < 7) DESA.life.spawnVillager(10, 10); S.era = 1;
      for (let i = 0; i < 12; i++) DESA.addBuilding('gubuk', 1 + (i % 6) * 2, 30 + Math.floor(i / 6) * 2, true);
      S.day = CONFIG.YEAR_SCALE ? 0 : 0; const yd = DESA.state.day; S.day = 28 + 21; P.teladanDaily(); r.tier = S.teladan.tier;
      S.day = 29; P.goalsDaily(); r.year2 = S.goals && S.goals.year; r.hist = S.goalHist;
      P.openTujuan(); r.panel = document.querySelectorAll('#tujuanpanel .mcard').length; r.kbBtn = !!document.getElementById('kbBtn'); return r; });
    ok(T + ' rencana tahun 1', tl.goals === 5, tl); ok(T + ' teladan swadaya', tl.tier === 1, tl); ok(T + ' rencana tahun 2', tl.year2 === 2 && tl.hist.length === 1, tl); ok(T + ' panel tujuan', tl.panel === 3 && tl.kbBtn, tl); // v1.7.0: sedang juga penuh
    const nm = await p.evaluate(async () => ({ masjid: CONFIG.BUILDINGS.masjid.nama, tx: ((CONFIG.TEXT_OVERLAY ? (await (await fetch(CONFIG.TEXT_OVERLAY)).json()).monumen : null) || (await (await fetch('TEKS-GAME.json')).json()).monumen).masjid.nama, oo: CONFIG.BUILDINGS.orang_orangan.nama, dis: CONFIG.TUJUAN_DISABLE.length,
      panel: [...document.querySelectorAll('#tujuanpanel .mcard b')].map(e => e.textContent) }));
    ok(T + ' nama monumen dari TEKS', nm.masjid === nm.tx && nm.panel.includes(nm.tx) && nm.dis === 0 && (tema ? !/sawah/i.test(nm.oo) : /sawah/i.test(nm.oo)), nm);
    // ---- 3) cerita berantai ----
    const ch = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {}; S.event = null; S.story = null; S.chains = { active: [], done: {}, last: -99 };
      const dis = C.TUJUAN_DISABLE; C.TUJUAN_DISABLE = []; r.sedangOff = (dis || []).includes('resep_nenek'); S.day = 60; S.era = 2; S.merchantSeen = true; S.lastAttackDay = 50; DESA.addBuilding('gudang', 30, 30, true);
      const v = S.villagers.find(o => o.age > 16); v.traits = ['pandai_masak']; S.res.makanan = 100; S.res.kayu = 50;
      S.villagers.filter(o => o !== v).forEach(o => o.traits = o.traits.filter(t => t !== 'pandai_masak'));
      // paksa resep_nenek: aktor pandai_masak
      const ids = Object.keys(C.STORY_CHAINS).filter(k => C.STORY_CHAINS[k].langkah); r.n = ids.length;
      r.elig = !!P.chainEligible('resep_nenek'); const save = ids.filter(k => k !== 'resep_nenek').map(k => [k, C.STORY_CHAINS[k]]); save.forEach(([k]) => delete C.STORY_CHAINS[k]);
      r.start = P.chainStart(); save.forEach(([k, d]) => C.STORY_CHAINS[k] = d);
      r.card = !!document.querySelector('#modal .dcard') && document.querySelectorAll('#modal [data-ev]').length === 2; r.title = (document.querySelector('#modal h3') || {}).textContent;
      const f0 = S.res.makanan; document.querySelector('#modal [data-ev="0"]').click(); r.cost = f0 - S.res.makanan; const c = S.chains.active[0]; r.step = c && c.step;
      // langkah 1 (acak) diselesaikan pagi saat jatuh tempo; ulangi sampai kartu pilihan langkah 2
      for (let i = 0; i < 20 && S.chains.active.length && S.chains.active[0].step === 1; i++) { S.day++; P.chainDaily(); } r.step2 = S.chains.active[0] && S.chains.active[0].step;
      S.day = S.chains.active[0].due; r.due = !!P.chainDueCard(); S.story = null; S.event = null;
      DESA.p1.chainStart; const dc = P.chainDueCard(); DESA.state.director.modal = { day: 0, n: 0, dil: 0 };
      // buka kartu langkah 2 lewat Juru Cerita (hari sepi)
      S.director.checked = 0; S.director.mday = {}; S.t = Math.floor(S.t / C.DAY_LENGTH_SEC) * C.DAY_LENGTH_SEC + 0.38 * C.DAY_LENGTH_SEC; S.director.lastModalT = -1e9;
      r.opened = DESA.directorTick ? DESA.directorTick(true) : (DESA.story && DESA.story.directorTick ? DESA.story.directorTick(true) : null);
      const p0 = (S.sellBonus || {}).makanan || 0; const b0 = document.querySelector('#modal [data-ev="0"]'); if (b0) b0.click(); r.sell = (S.sellBonus || {}).makanan || 0; r.doneN = S.p1.chainDone; r.active = S.chains.active.length;
      C.TUJUAN_DISABLE = dis;
      // efek baru
      const w = S.villagers.find(o => o.age > 16 && o !== v); w.traits = ['penakut']; DESA.v9c.applyEffects ? 0 : 0;
      return r; });
    ok(T + ' 5 rantai', ch.n === 5, ch); ok(T + ' rantai resep mulai', ch.elig && ch.start && ch.card, ch);
    ok(T + ' rantai biaya & lanjut', ch.cost >= 3 && ch.step === 1, ch); ok(T + ' rantai langkah acak', ch.step2 === 2 && ch.due, ch);
    ok(T + ' rantai selesai', ch.sell === 0.1 && ch.doneN === 1 && ch.active === 0, ch);
    // ---- 4) orang-orangan sawah ----
    const sc = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1, r = {}; S.buildings = S.buildings.filter(b => b.type !== 'ladang' && b.type !== 'orang_orangan');
      for (let i = 0; i < 4; i++) DESA.addBuilding('ladang', 12 + i, 20, true); r.before = P.scarecrowMonkeyMult();
      const b = P.placeScarecrow(); r.placed = !!b && b.type === 'orang_orangan' && b.done; r.after = P.scarecrowMonkeyMult(); r.bar = !!document.querySelector('#buildbar [data-b="orang_orangan"]') || !C.BUILDINGS.orang_orangan;
      return r; });
    ok(T + ' orang-orangan', sc.before === 1 && sc.placed && sc.after === 0.5, sc);
    if (!tema && !only) { const at = await p.evaluate(() => { const S = DESA.state, C = CONFIG, P = DESA.p1; S.event = null; S.story = null; document.getElementById('modal').style.display = 'none';
        S.buildings = S.buildings.filter(b => !b.mon); S.day = 120; S.era = 3; S.monumentDiscount = {}; Object.assign(S.res, { kayu: 999, batu: 999, papan: 999, batu_bata: 999, alat: 99, kulit: 99, makanan: 500 });
        const find = (id, cx, cy) => { for (let r = 0; r < 25; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = cx + dx, y = cy + dy; if (P.validSpot(id, x, y)) return { x, y }; } };
        const c = C.CAMP, m = find('masjid', c.x - 7, c.y - 2); const bm = P.monStart('masjid', m.x, m.y); bm.progress = P.bWork(bm); P.monStageDone(bm); S.buildings.forEach(b => b.mon && (b.mon.act = null)); P.monStart('masjid'); bm.progress = P.bWork(bm) * 0.55;
        const pr = find('pendopo_reog', c.x + 4, c.y - 6); const bp = P.monStart('pendopo_reog', pr.x, pr.y) || null; if (bp) { bp.mon.act = null; bp.mon.st = 2; bp.done = true; }
        S.buildings.forEach(b => b.mon && b.type !== 'masjid' && (b.mon.act = null)); S.t = Math.floor(S.t / C.DAY_LENGTH_SEC) * C.DAY_LENGTH_SEC + 0.42 * C.DAY_LENGTH_SEC;
        S.teladan = { tier: 1, years: { 1: 1 }, history: [] }; S.teladanPoin = 1; S.goals = null; S.day = 85; P.goalsDaily(); S.day = 120;
        P.view(m.x + 2, m.y + 2, 2); document.getElementById('tujuanpanel').style.display = 'block'; P.tujuanPanelUI(); document.getElementById('toasts').innerHTML = ''; return { m, st: bm.mon, pend: bp && bp.mon }; });
      ok('screenshot monumen siap', at.st.act === 1, at); await p.waitForTimeout(900); await p.screenshot({ path: '../docs/screenshots/v9-monumen.png' });
      await p.evaluate(() => { document.getElementById('tujuanpanel').style.display = 'none'; }); }
    if (!tema && !only) { await p.evaluate(() => { const S = DESA.state; S.t = 0.45 * CONFIG.DAY_LENGTH_SEC; S.villagers.forEach(v => { v.wish = null; v.task = null; });
        ['nasi_pecel', 'kopi_pagi', 'main_layangan', 'tabungan_haji'].forEach((id, i) => { const v = S.villagers[i]; if (v) DESA.p1.wishStart(v, id); }); if (S.villagers[1]) S.villagers[1].wish.until = S.day + 1;
        S.villagers.forEach((v, i) => { v.x = 20 + (i % 4) * 1.6; v.y = 14 + Math.floor(i / 4) * 1.8; v.task = { kind: 'diam', target: { x: v.x, y: v.y } }; }); DESA.p1.view(21, 15, 2.5);
        DESA.p1.wishUI(); document.getElementById('wish').scrollIntoView(); });
      await p.waitForTimeout(900); await p.screenshot({ path: '../docs/screenshots/v9-keinginan.png' }); }
    await p.close(); }
  await b.close();
  const E = errs.filter(e => !/favicon|ERR_|404/.test(e));
  if (E.length) fails.push('console: ' + E.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('p1 OK');
})();
