// v12: angin kencang (Nusantara: windChance/windHp musim mareng & labuh) merusak satu bangunan + penanda/kamera + diperbaiki; event 'Angin Mareng' (angin_gugur) terhubung: ikat atap -> bertahan, pilihan lain -> rusak; tema sedang tanpa angin.
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
    const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, W = DESA.v12, V = DESA.v11, P = DESA.p1, r = {};
      const spot = (id, cx, cy) => { for (let rr = 2; rr < 14; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) if (P.validSpot(id, cx + dx, cy + dy)) return { x: cx + dx, y: cy + dy }; };
      const add = (id, s) => { DESA.addBuilding(id, s.x, s.y, true); return S.buildings[S.buildings.length - 1]; };
      r.hasWind = W.themeHasWind(); r.fx = ['mareng', 'labuh'].map(k => C.SEASON_FX[k] ? [C.SEASON_FX[k].windChance, C.SEASON_FX[k].windHp] : null);
      S.buildings = S.buildings.filter(b => !C.WIND.targets.includes(b.type)); const g = add('gubuk', spot('gubuk', C.CAMP.x - 6, C.CAMP.y - 6));
      // tahun 2: rusak penuh windHp
      S.day = 40; S.mapEvents = []; g.hp = 100; const a = W.windStrike(20); r.dmg = a.dmg; r.hp = g.hp; r.marker = V.activeMarkers().some(m => m.k === 'rusak'); r.logPos = !!S.logPos[S.log[0]]; r.log = S.log[0];
      r.float = P.textNotes().some(t => t.startsWith('-20')); const v = S.villagers[0]; const t = W.buildTask(v); r.repair = !!t && t.b === g;
      // tahun 1: kondisi tak turun di bawah batas kapasitas
      S.day = 5; g.hp = 45; W.windStrike(20); r.y1hp = g.hp;
      // terlindung pagar -> setengah
      S.day = 40; g.hp = 100; const ps = spot('pagar', Math.round(g.x), Math.round(g.y)); r.ps = ps; r.g = [g.x, g.y]; add('pagar', ps); r.shelter = W.windSheltered(g); W.windStrike(20); r.shelterDmg = 100 - g.hp;
      // event angin: ikat atap (pilihan 0) -> bertahan; pilihan lain -> rusak
      const ev = () => { S.event = 'angin_gugur'; document.getElementById('modal').style.display = 'block'; };
      g.hp = 100; S.roofTiedUntil = null; ev(); W.chooseEvent(0); r.tiedHp = g.hp; r.tiedLog = S.log.slice(0, 2).join(' | ');
      g.hp = 100; S.roofTiedUntil = null; S.windDay = null; ev(); W.chooseEvent(2); r.otherHp = g.hp; r.otherLog = S.log.slice(0, 2).join(' | ');
      // angin harian di musim berangin
      S.roofTiedUntil = null; S.windDay = null; g.hp = 100; const rnd = Math.random; Math.random = () => 0; const fx = DESA.v11 && C.SEASON_FX; let hit = null;
      for (let d = 30; d < 140 && hit == null; d++) { S.day = d; S.windDay = null; const h0 = g.hp; W.windDaily(); if (g.hp < h0) hit = d; } Math.random = rnd; r.dailyHit = hit;
      return r; });
    if (!tema) {
      ok(T + ' angin: config musim', r.hasWind && r.fx[0] && r.fx[0][0] > 0 && r.fx[1][0] === 0.08 && r.fx[1][1] === 20, r);
      ok(T + ' angin: rusak windHp + penanda + log berlokasi + teks melayang + diperbaiki', r.dmg === 20 && r.hp === 80 && r.marker && r.logPos && r.float && r.repair, r);
      ok(T + ' angin: tahun 1 tak di bawah batas kapasitas', r.y1hp === 40, r);
      ok(T + ' angin: terlindung pagar setengah', r.shelter && r.shelterDmg === 10, r);
      ok(T + ' event angin: ikat atap -> bertahan', r.tiedHp >= 100 && /terikat/i.test(r.tiedLog), r);
      ok(T + ' event angin: pilihan lain -> rusak & teks sesuai', r.otherHp < 100 && /atap .*\(-\d+ Kondisi\)|-\d+/.test(r.otherLog), r);
      ok(T + ' angin harian di mareng/labuh', r.dailyHit != null, r);
    } else ok(T + ' tanpa angin', !r.hasWind && !/Angin kencang/.test(r.otherLog) && r.dailyHit == null, r);
    await p.close(); }
  await b.close();
  if (errs.length) fails.push('console: ' + errs.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v12 OK'); })();
