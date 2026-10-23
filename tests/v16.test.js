// v16 (QC 2026-10-23): T-01 pohon/batu tumbuh lagi, T-03 teks 17an/haji per tema, S-01 {pasangan}, S-02 angka nyata, S-10 autosave+versi+tema, R-02 chooseEvent aman.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [], out = {};
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  for (const tema of ['', 'sedang']) { const T = tema || 'nusantara', p = await b.newPage(); p.on('pageerror', e => errs.push(T + ': ' + String(e)));
    await p.goto((process.env.GAME_URL || 'http://localhost:8095/') + (tema ? '?tema=' + tema : '')); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, V = DESA.v16, r = {}, G = C.NODE_REGROW;
      // T-01
      r.start = { pohon: S.nodes.filter(n => n.type === 'pohon').length, batu: S.nodes.filter(n => n.type === 'batu').length };
      S.nodes = S.nodes.filter(n => n.type !== 'pohon' && n.type !== 'batu'); for (let i = 0; i < 60; i++) { S.day++; V.nodesRegrowDaily(); }
      const tr = S.nodes.filter(n => n.type === 'pohon'), rk = S.nodes.filter(n => n.type === 'batu');
      r.d30 = { pohon: tr.length, batu: rk.length, tunasKecil: S.nodes.filter(n => n.tunas).every(n => n.amount < C.NODE_AMOUNT.kayu), penuh: tr.filter(n => !n.tunas).every(n => n.amount === C.NODE_AMOUNT.kayu) };
      const gap = G.jarakBangunan; r.jauh = [...tr, ...rk].every(n => !S.buildings.some(bb => { const d = C.BUILDINGS[bb.type]; return n.x > bb.x - 1 - gap && n.x < bb.x + d.w + gap && n.y > bb.y - 1 - gap && n.y < bb.y + d.h + gap; }) && S.tiles[n.y][n.x] === 0);
      for (let i = 0; i < 400; i++) { S.day++; V.nodesRegrowDaily(); }
      r.cap = { pohon: S.nodes.filter(n => n.type === 'pohon').length, batu: S.nodes.filter(n => n.type === 'batu').length, maxP: G.pohon.cap, maxB: G.batu.cap };
      // T-03
      V.showPanitia(); const h = document.getElementById('modal').innerHTML; r.panitia = { a17: h.includes('17 Agustus'), bendera: h.includes('bendera_merah_putih') }; document.getElementById('modal').style.display = 'none';
      for (let i = 0; i < 2; i++) DESA.v9c.applyEffects({ penduduk: 1 }, 'tes');
      const v = S.villagers[0]; r.pergi = DESA.v16.sendAway(v, 3, 'tabungan_haji'); r.logHaji = S.log[0];
      // S-01
      S.grief = { name: 'Mbah X', pasangan: 'Yanti', until: S.day + 999, mult: 0, old: true }; const L0 = S.log.length; for (let i = 0; i < 60; i++) V.griefDaily();
      const gl = S.log.slice(0, 60); r.duka = { kunci: gl.some(l => /\{pasangan\}|: pasangan /.test(l)), yanti: gl.some(l => l.includes('Yanti')) };
      const w = S.villagers[S.villagers.length - 1]; DESA.v16.killVillager(w, 'sakit'); r.griefPasangan = S.grief && S.grief.pasangan;
      // S-02
      if (!S.buildings.length) DESA.addBuilding('gubuk', C.CAMP.x + 6, C.CAMP.y + 6, true); const bb = S.buildings[0], vv = S.villagers[0], nums = new Set(); for (let i = 0; i < 40; i++) { bb.burning = { target: 10, lost: 0, actions: 0, need: 3, nextSpread: 1e9 }; bb.firebreak = false; S.res.air = 0; S.res.kayu = 50; V.doFireAction(vv, { b: bb, sekat: true }); const m = S.log[0].match(/(\d+) kayu/); if (m) nums.add(+m[1]); }
      r.sekat = [...nums]; bb.burning = null; vv.skills.membangun = 9; r.skill = V.memSkill(vv);
      // R-02
      try { S.event = null; DESA.v16.chooseEvent(0); S.event = 'tidak_ada'; DESA.v16.chooseEvent(0); r.r02 = S.event === null; } catch (e) { r.r02 = 'throw ' + e; }
      // S-10
      DESA.step(0.01); localStorage.clear(); const d0 = S.day; let k = 0; while (S.day === d0 && ++k < 20000) DESA.step(0.5); const A = JSON.parse(localStorage.getItem('desaMandiriSave_auto') || 'null');
      r.auto = A && { v: A._v, tema: A._tema, day: A.day };
      const old = JSON.parse(JSON.stringify(A)); delete old._v; delete old._tema; delete old._at; old.day = 77; localStorage.clear(); localStorage.setItem('desaMandiriSave', JSON.stringify(old)); r.lamaMuat = DESA.v16.loadGame(false) && DESA.state.day === 77;
      const lain = JSON.parse(JSON.stringify(A)); lain._tema = 'tema_lain'; lain._at = Date.now() + 1000; localStorage.setItem('desaMandiriSave_auto', JSON.stringify(lain)); r.temaLainDitolak = DESA.v16.loadGame(false) === false && DESA.state.day === 77;
      // babi 23-10: tahun 2+, HP < 30 bisa mati (0.15); oncor menyala <= 3 petak -> tidak mati
      if (C.NIGHT_THREAT === 'babi') { const S2 = DESA.state; DESA.v9c.applyEffects({ penduduk: 2 }, 'tes'); S2.era = 3; S2.day = C.YEAR_SCALE.daysPerYear * 2; const rnd = Math.random; Math.random = () => 0; S2.buildings = S2.buildings.filter(x => x.type !== 'obor' && x.type !== 'menara_jaga' && x.type !== 'pagar'); const [a1, a2] = S2.villagers.filter(x => !DESA.life.isKid(x));
        a1.inside = null; a1.task = null; a1.health = 35; DESA.biteVillager({ x: a1.x, y: a1.y }, a1); r.babiMati = !S2.villagers.includes(a1);
        DESA.addBuilding('obor', Math.round(a2.x) + 1, Math.round(a2.y), true); a2.inside = null; a2.task = null; a2.health = 35; DESA.biteVillager({ x: a2.x, y: a2.y }, a2); r.babiOncor = S2.villagers.includes(a2); Math.random = rnd; }
      return r; });
    out[T] = r;
    if (!tema) ok('babi: mati tanpa oncor, selamat dekat oncor', r.babiMati === true && r.babiOncor === true, r);
    ok(T + ' T-01 tumbuh lagi (60 hari)', r.d30.pohon >= 12 && r.d30.batu >= 3 && r.d30.tunasKecil && r.d30.penuh && r.jauh, r);
    ok(T + ' T-01 batas dekat jumlah awal', r.cap.pohon <= r.cap.maxP && r.cap.pohon >= r.cap.maxP - 3 && r.cap.batu <= r.cap.maxB && r.cap.batu >= r.cap.maxB - 4 && r.cap.maxP <= r.start.pohon && r.cap.maxB <= r.start.batu, r);
    ok(T + ' T-03 kartu panitia', tema ? !r.panitia.a17 && !r.panitia.bendera : r.panitia.a17 && r.panitia.bendera, r.panitia);
    ok(T + ' T-03 log haji', r.pergi && (tema ? !/haji/i.test(r.logHaji) : /ibadah haji/.test(r.logHaji)), r.logHaji);
    ok(T + ' S-01 {pasangan} terisi', !r.duka.kunci && r.duka.yanti && typeof r.griefPasangan === 'string' && r.griefPasangan.length > 0, r);
    ok(T + ' S-02 sekat pakai biaya nyata', r.sekat.every(n => n === 10), r.sekat);
    ok(T + ' S-02 kenangan keahlian nyata', r.skill === 'membangun', r.skill);
    ok(T + ' R-02 chooseEvent aman', r.r02 === true, r.r02);
    ok(T + ' S-10 autosave + versi + tema', r.auto && r.auto.v === 2 && r.auto.tema === (tema || 'indonesia'), r.auto);
    ok(T + ' S-10 simpanan lama dimuat, tema lain ditolak', r.lamaMuat && r.temaLainDitolak, r);
    await p.close(); }
  await b.close(); console.log(JSON.stringify(out));
  if (errs.length) fails.push('pageerror ' + JSON.stringify(errs.slice(0, 5)));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v16 OK'); })();
