const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = [], warns = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8080/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
  await p.click('#btnNew'); await p.click('#tutSkip');
  const sprites = await p.evaluate(() => Object.entries(ASSETS).filter(([k, a]) => a.img).filter(([k, a]) => !(a.images || []).filter(Boolean).length).map(([k]) => k));
  // UI-placed field through camera at 2x
  await p.click('#zin'); await p.evaluate(() => { DESA.state.res.kayu += 300; DESA.state.res.batu += 200; });
  const box = await p.locator('#c').boundingBox();
  const tgt = await p.evaluate(() => { const c = DESA.cam; return { sx: (20 * 32 + 16 - c.x) * c.zoom, sy: (17 * 32 + 16 - c.y) * c.zoom }; });
  await p.click('[data-b="ladang"]'); await p.mouse.move(box.x + tgt.sx, box.y + tgt.sy); await p.mouse.click(box.x + tgt.sx, box.y + tgt.sy);
  const r = await p.evaluate(() => { const S = DESA.state, A = DESA.addBuilding;
    A('apiunggun', 22, 20, true); A('gudang', 25, 17, true); A('gubuk', 18, 21, true); A('gubuk', 26, 22, true); A('sumur', 24, 23, true);
    for (const [x, y] of [[19, 17], [21, 17], [19, 18], [20, 18], [21, 18]]) A('ladang', x, y, true);
    const snap = [], harvests = []; let seasons = new Set(), firstHarvestDay = null;
    for (let i = 0; i < 40000; i++) { DESA.step(0.1);
      const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); if (S.event && e) e.click();
      seasons.add(DESA.season());
      if (!firstHarvestDay && S.log.some(l => l.includes('memanen'))) firstHarvestDay = S.day;
      if (S.day >= 24) break; }
    return { day: S.day, season: DESA.season(), seasons: [...seasons], era: S.era, pop: S.villagers.length, firstHarvestDay, res: Object.fromEntries(Object.entries(S.res).map(([k, v]) => [k, Math.floor(v)])),
      fields: S.buildings.filter(b => b.type === 'ladang').map(b => b.crop + ':' + b.stage + (b.done ? '' : '(plan)')),
      v: S.villagers.map(v => [v.name, v.hunger | 0, v.health | 0, v.task && v.task.kind]),
      log: S.log.filter(l => /memanen|Musim|era|⚠️|💀|Misi/.test(l)).slice(0, 14) }; });
  // winter, evening view
  await p.evaluate(() => { const S = DESA.state; S.t = (S.day - 1) * 120 + 120 * 0.8; DESA.setZoom(2); const v = S.villagers[0]; DESA.centerCam((v.x + 22) / 2, (v.y + 20) / 2); });
  await p.click('[data-s="1"]'); await p.waitForTimeout(1200);
  await p.screenshot({ path: require('path').join(__dirname, '..', 'docs', 'screenshots', 'screenshot-v3.png') });
  await p.evaluate(() => { const S = DESA.state; S.t = (S.day - 1 - 14) * 120 + 60; }); await p.waitForTimeout(800);
  await p.screenshot({ path: require('path').join(__dirname, '..', 'docs', 'screenshots', 'screenshot-v3-siang.png') });
  console.log(JSON.stringify({ sprites, r, errs, warns }, null, 1)); if (errs.length) { console.error('GAGAL: ada error konsol'); process.exitCode = 1; } await b.close();
})();
