// v10 (uji perangkat @7068bcc): seed 1010 + 2 ladang tanpa gubuk dari pemain -> populasi tak macet di 2; petunjuk tempat tidur; babi hutan tahun 1 tak membunuh.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  const open = async tema => { const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    const U = new URL(process.env.GAME_URL || 'http://localhost:8095/'); if (tema) U.searchParams.set('tema', tema);
    await p.goto(U.href); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 }); return p; };
  for (const tema of [null, 'sedang']) { const T = tema || 'nusantara';
    // ---- seed 1010: pemain hanya menaruh 2 ladang hari 1 ----
    let p = await open(tema);
    const r = await p.evaluate(() => { let a = 1010 >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const S = DESA.state, C = CONFIG, D = DESA, V = D.v9c; let placed = 0;
      for (let r = 1; r < 12 && placed < 2; r++) for (let dy = -r; dy <= r && placed < 2; dy++) for (let dx = -r; dx <= r && placed < 2; dx++) { const x = C.CAMP.x + dx * 2, y = C.CAMP.y + dy * 2;
        if (D.validSpot('ladang', x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS.ladang.cost)) S.res[k] -= n; D.addBuilding('ladang', x, y, false); placed++; } }
      const o = { hut1: null, hut2: null, grow: null, hint6: null }; let last = 0;
      while (S.day <= 40) { D.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); }
        if (S.day !== last) { last = S.day; const h = S.buildings.filter(b => b.type === 'gubuk').length;
          if (h >= 1 && o.hut1 == null) o.hut1 = S.day; if (h >= 2 && o.hut2 == null) o.hut2 = S.day; if (S.villagers.length > 2 && o.grow == null) o.grow = S.day;
          if (S.day === 6) o.hint6 = V.bedHintOn(); if (S.day === 10) o.freeBed10 = DESA.capacity ? DESA.capacity() > S.villagers.length : !V.bedHintOn(); } }
      o.pop = S.villagers.length; return o; });
    ok(T + ' seed1010 gubuk otomatis', r.hut1 != null && r.hut1 <= 5 && r.hut2 != null && r.hut2 <= 10, r);
    ok(T + ' seed1010 tempat kosong hari 10 & populasi tumbuh <= hari 40', r.freeBed10 && r.grow != null && r.grow <= 40, r);
    await p.close();
    // ---- petunjuk tempat tidur: hari 6, gubuk penuh / tidak ada ----
    p = await open(tema);
    const h = await p.evaluate(() => { const S = DESA.state, V = DESA.v9c, o = {}; S.buildings = S.buildings.filter(b => b.type !== 'gubuk' && b.type !== 'rumah'); S.day = 5; o.before = V.bedHintOn(); S.day = 6; o.on = V.bedHintOn();
      DESA.pangan.ui(); o.panel = (document.getElementById('quest') || {}).innerHTML || ''; o.text = V.bedHintText(); return o; });
    ok(T + ' petunjuk butuh gubuk', !h.before && h.on && /bedhint/.test(h.panel) && /Pendatang|anak/i.test(h.text), h);
    // ---- babi hutan / serigala: tahun 1 serangan tak membunuh ----
    const k = await p.evaluate(() => { const S = DESA.state, C = CONFIG, W = C.THREAT[C.NIGHT_THREAT], o = { cfg: C.NIGHT_THREAT === 'babi' ? [W.damage.join('-'), W.killHpBelow, W.killChanceIfLowHp, W.baseNightChance] : null };
      S.era = 3; S.day = 20; const v = S.villagers[0], rnd = Math.random; Math.random = () => 0; let dead = 0;
      for (let i = 0; i < 6; i++) { v.health = 40; v.task = null; v.inside = false; DESA.biteVillager({ x: v.x, y: v.y }, v); if (!S.villagers.includes(v)) dead++; }
      Math.random = rnd; o.dead = dead; o.hp = v.health; return o; });
    ok(T + ' serangan tahun 1 tak membunuh', k.dead === 0 && k.hp >= 1, k);
    if (k.cfg) ok(T + ' babi config', k.cfg.join('|') === '30-50|70|0.3|0.07', k);
    await p.close(); }
  await b.close();
  if (errs.length) fails.push('console: ' + errs.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v10 OK'); })();
