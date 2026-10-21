// Pohon teknologi: panel, biaya di muka, prioritas 'riset', efek, prasyarat/era.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]');
  const r = {};
  await p.evaluate(() => { DESA.state.res.kayu = 60; });
  await p.click('#techbtn'); r.panel = await p.isVisible('#techpanel');
  r.nodes = await p.evaluate(() => document.querySelectorAll('#techpanel .tech').length);
  r.lockedT03 = await p.evaluate(() => document.querySelector('[data-tech="T03"]').classList.contains('locked'));
  await p.click('[data-research="T01"]');
  r.paid = await p.evaluate(() => DESA.state.res.kayu); // 60 - 15
  r.busyOthers = await p.evaluate(() => !document.querySelector('[data-research]'));
  await p.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v4-tech.png') });
  r.done = await p.evaluate(() => { const S = DESA.state; S.prio.riset = 3; S.res.makanan = 60; S.res.air = 40;
    for (let i = 0; i < 6000 && S.research; i++) { DESA.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } }
    return { techDone: S.techDone, radius: DESA.techVal('api_radius', 1), day: S.day, log: S.log.find(l => l.includes('menyelesaikan riset')) }; });
  // efek bersyarat T04 (sumur dalam 12 tile) & data-driven
  r.t04 = await p.evaluate(() => { const S = DESA.state; S.techDone.push('T04'); DESA.addBuilding('sumur', 20, 20, true);
    return { near: DESA.techVal('ladang_tumbuh', 0, { b: { x: 22, y: 22 } }), far: DESA.techVal('ladang_tumbuh', 0, { b: { x: 50, y: 5 } }) }; });
  const ok = r.panel && r.nodes === 8 && r.lockedT03 && r.paid === 45 && r.busyOthers && r.done.techDone.includes('T01') && r.done.radius === 1.5 && r.t04.near === -1 && r.t04.far === 0;
  console.log(JSON.stringify({ r, ok, errs })); if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
