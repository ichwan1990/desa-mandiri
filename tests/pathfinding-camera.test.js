const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = [], warns = []; p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); if (m.type()==='warning') warns.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8080/'); await p.waitForTimeout(1200);
  const sprites = await p.evaluate(() => Object.entries(ASSETS).filter(([k,a])=>a.img).map(([k,a]) => k + ':' + (a.images||[]).filter(Boolean).length));
  // path test across river
  const pt = await p.evaluate(() => { const S = DESA.state; const path = DESA.findPath(22, 10, 50, 10);
    return { len: path && path.length, waterCrossed: path ? path.filter(q => S.tiles[q.y][q.x] === 1).length : -1, bridgeUsed: path ? path.filter(q => S.tiles[q.y][q.x] === 2).length : -1 }; });
  // build via camera-mapped click at zoom 2
  await p.click('#tutSkip'); await p.click('#zin');
  const target = await p.evaluate(() => { const c = DESA.cam; const tx = 24, ty = 18; return { sx: (tx * 32 + 16 - c.x) * c.zoom, sy: (ty * 32 + 16 - c.y) * c.zoom, zoom: c.zoom }; });
  const box = await p.locator('#c').boundingBox();
  await p.click('[data-b="apiunggun"]'); await p.mouse.move(box.x + target.sx, box.y + target.sy); await p.mouse.click(box.x + target.sx, box.y + target.sy);
  const placed = await p.evaluate(() => DESA.state.buildings.map(b => [b.type, b.x, b.y]));
  // drag pan
  const before = await p.evaluate(() => ({ ...DESA.cam }));
  await p.mouse.move(box.x + 600, box.y + 400); await p.mouse.down(); await p.mouse.move(box.x + 450, box.y + 300, { steps: 5 }); await p.mouse.up();
  const after = await p.evaluate(() => ({ ...DESA.cam }));
  await p.click('[data-s="4"]'); await p.waitForTimeout(5000);
  // run sim; track any villager standing on water
  const r = await p.evaluate(() => { const S = DESA.state; let onWater = 0;
    for (let i = 0; i < 3600; i++) { DESA.step(0.1); const e = document.querySelector('[data-ev="0"]'); if (S.event && e) e.click();
      for (const v of S.villagers) if (S.tiles[Math.round(v.y)][Math.round(v.x)] === 1) onWater++; }
    return { onWater, day: S.day, res: S.res, b: S.buildings.map(b => b.type + (b.done ? '✓' : '')), v: S.villagers.map(v => [v.name, v.x.toFixed(1), v.y.toFixed(1), v.task && v.task.kind]) }; });
  await p.evaluate(() => { DESA.setZoom(2); DESA.centerCam(DESA.state.villagers[0].x, DESA.state.villagers[0].y); });
  await p.waitForTimeout(500);
  await p.screenshot({ path: require('path').join(__dirname, '..', 'docs', 'screenshots', 'screenshot-v2.png') });
  console.log(JSON.stringify({ sprites, pt, target, placed, before, after, r, errs, warns }, null, 0)); if (errs.length) { console.error('GAGAL: ada error konsol'); process.exitCode = 1; } await b.close();
})();
