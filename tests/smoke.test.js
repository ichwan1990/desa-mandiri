const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.waitForTimeout(1000);
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-b="apiunggun"]'); await p.mouse.move(400,450); await p.mouse.click(400,450);
  await p.click('[data-s="3"]'); await p.waitForTimeout(6000);
  // fast-forward 3 days headlessly to exercise AI
  const r = await p.evaluate(() => { for (let i = 0; i < 3600; i++) { DESA.step(0.1); const b = document.querySelector('[data-ev="0"]'); if (DESA.state.event && b) b.click(); } const S = DESA.state;
    return { log: S.log.slice(0,12), q: S.questIdx, b: S.buildings.map(b=>b.type+(b.done?'✓':'…')), day: S.day, res: S.res, pop: S.villagers.length, v: S.villagers.map(v => [v.name, v.hunger|0, v.energy|0, v.mood|0, v.task && v.task.kind]) }; });
  await p.click('#save'); const saved = await p.evaluate(() => !!localStorage.getItem('desaMandiriSave'));
  await p.click('#load'); await p.waitForTimeout(1500);
  await p.screenshot({ path: require('path').join(__dirname, '..', 'docs', 'screenshots', 'screenshot-v1.png') });
  console.log(JSON.stringify({ r, saved, errs })); if (errs.length) { console.error('GAGAL: ada error konsol'); process.exitCode = 1; } await b.close();
})();
