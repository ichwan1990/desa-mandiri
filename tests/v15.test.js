// v15: event lokal muncul di masa awal (hari 1-30) permainan biasa (Nusantara), beberapa seed; frekuensi total tetap (kolam sama).
const { chromium } = require('playwright');
const LOKAL = ['ular_di_sawah', 'hujan_pertama', 'monyet_pencuri', 'dbd_pancaroba', 'ispa_asap', 'kebakaran_ilalang', 'angin_mareng', 'tanam_serentak', 'gotong_royong', 'kenduri_panen', 'ronda_malam', 'hari_pasar', 'tamu_desa_sebelah'];
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [], out = [];
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  for (const seed of [1010, 7, 42, 2024, 99]) { const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e)));
    await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    const r = await p.evaluate(([seed, LOKAL]) => { let a = seed >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      const S = DESA.state, C = CONFIG, D = DESA; const plan = ['apiunggun', 'gubuk', 'ladang', 'ladang', 'gudang', 'sumur', 'gubuk', 'ladang'];
      const tryBuild = () => { const t = plan[0]; if (!t || !D.canAfford(C.BUILDINGS[t].cost) || S.buildings.some(b => !b.done)) return;
        for (let rr = 1; rr < 12; rr++) for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) { const x = C.CAMP.x + dx * 2, y = C.CAMP.y + dy * 2; if (t !== 'ladang' && Math.abs(dx) + Math.abs(dy) < 2) continue;
          if (D.validSpot(t, x, y)) { for (const [k, n] of Object.entries(C.BUILDINGS[t].cost)) S.res[k] -= n; D.addBuilding(t, x, y, false); plan.shift(); return; } } };
      const seen = []; let last = 0, events = 0;
      while (S.day <= 30) { D.step(0.1); if (S.day !== last) { last = S.day; tryBuild(); }
        if (S.event) { if (S.event[0] !== '@') { events++; if (LOKAL.includes(S.event)) seen.push(S.event + '@' + S.day); } const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } }
      return { seen, events, era: S.era }; }, [seed, LOKAL]);
    out.push({ seed, ...r }); await p.close(); }
  { const p = await b.newPage(); p.on('pageerror', e => errs.push(String(e))); await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    const f = await p.evaluate(LOKAL => { const S = DESA.state, C = CONFIG, E = DESA.v13, R = C.EVENT_RULES, missing = LOKAL.filter(id => !R[id]);
      const run = boost => { const sv = {}; if (!boost) for (const id of LOKAL) if (R[id] && R[id].bobotAwal) { sv[id] = R[id].bobotAwal; delete R[id].bobotAwal; }
        let a = 3 >>> 0; const rnd = Math.random; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
        let n = 0; for (let rep = 0; rep < 20; rep++) { S.eventLastDay = {}; S.eventYearCount = {}; S.eventGroup = {}; for (let d = 1; d <= 30; d++) { S.day = d; S.event = null; S.hjPending = false; E.maybeEvent(); if (S.event && S.event[0] !== '@') n++; S.event = null; S.eventName = null; } }
        Math.random = rnd; Object.assign(R, Object.fromEntries(Object.entries(sv).map(([k, v]) => [k, Object.assign(R[k], { bobotAwal: v })]))); document.getElementById('modal').style.display = 'none'; return n; };
      return { missing, off: run(false), on: run(true) }; }, LOKAL);
    ok('aturan event lokal lengkap', !f.missing.length, f); ok('frekuensi hari 1-30 tidak naik (dorongan bobot awal)', f.on <= f.off * 1.05, f); await p.close(); }
  await b.close();
  console.log(JSON.stringify(out));
  const withLokal = out.filter(o => o.seen.length >= 1).length;
  ok('event lokal muncul <= hari 30 (>= 4 dari 5 seed)', withLokal >= 4, out);
  if (errs.length) fails.push('console: ' + errs.slice(0, 3).join(' | '));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v15 OK'); })();
