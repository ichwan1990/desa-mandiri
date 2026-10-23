// Layar sentuh & ponsel (390x844): kanvas penuh layar, laci panel, seret-geser, cubit-zoom, ketuk pilih & taruh bangunan, target sentuh >= 40px.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://localhost:8095/')); await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  await p.tap('#btnNew'); await p.waitForTimeout(300); await p.tap('#tutSkip').catch(() => {});
  await p.evaluate(() => document.querySelector('[data-s="0"]').click());
  const cdp = await c.newCDPSession(p);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], id) => ({ x, y, id })) });
  const r = {};
  r.layout = await p.evaluate(() => { const cv = document.getElementById('c'), side = document.getElementById('side').getBoundingClientRect();
    return { mobile: document.body.classList.contains('mobile'), cw: cv.width, ch: cv.height, sideHidden: side.top >= innerHeight - 2, scrollW: document.documentElement.scrollWidth }; });
  const box = await p.locator('#c').boundingBox();
  // seret-geser 1 jari
  await p.evaluate(() => { DESA.setZoom(2); DESA.centerCam(22, 20); });
  const c0 = await p.evaluate(() => ({ x: DESA.cam.x, y: DESA.cam.y }));
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await touch('touchStart', [[cx, cy]]); for (let i = 1; i <= 6; i++) await touch('touchMove', [[cx - i * 20, cy - i * 15]]); await touch('touchEnd', []);
  const c1 = await p.evaluate(() => ({ x: DESA.cam.x, y: DESA.cam.y })); r.pan = { dx: c1.x - c0.x, dy: c1.y - c0.y };
  // cubit: keluar (zoom in) lalu masuk (zoom out)
  await p.evaluate(() => DESA.setZoom(1)); const z0 = await p.evaluate(() => DESA.cam.zoom);
  await touch('touchStart', [[cx - 30, cy], [cx + 30, cy]]); for (let i = 1; i <= 8; i++) await touch('touchMove', [[cx - 30 - i * 12, cy], [cx + 30 + i * 12, cy]]); await touch('touchEnd', []);
  const z1 = await p.evaluate(() => DESA.cam.zoom);
  await touch('touchStart', [[cx - 120, cy], [cx + 120, cy]]); for (let i = 1; i <= 8; i++) await touch('touchMove', [[cx - 120 + i * 12, cy], [cx + 120 - i * 12, cy]]); await touch('touchEnd', []);
  const z2 = await p.evaluate(() => DESA.cam.zoom); r.pinch = [z0, z1, z2];
  // ketuk penduduk -> panel detail
  await p.evaluate(() => { DESA.setZoom(2); const v = DESA.state.villagers[0]; DESA.centerCam(Math.round(v.x), Math.round(v.y)); });
  const pos = await p.evaluate(() => { const cv = document.getElementById('c'), k = cv.getBoundingClientRect().width / cv.width, cm = DESA.cam, v = DESA.state.villagers[0];
    return { x: (v.x * 32 + 16 - cm.x) * cm.zoom * k, y: (v.y * 32 + 16 - cm.y) * cm.zoom * k }; });
  await p.touchscreen.tap(box.x + pos.x, box.y + pos.y); await p.waitForTimeout(300);
  r.vpanel = await p.isVisible('#vpanel'); await p.evaluate(() => document.getElementById('vpanel').style.display = 'none');
  // ketuk untuk menaruh rencana gubuk
  await p.evaluate(() => { const S = DESA.state; S.res.kayu = 200; S.res.batu = 50; DESA.setPlacing('gubuk'); });
  const spot = await p.evaluate(() => { const cv = document.getElementById('c'), k = cv.getBoundingClientRect().width / cv.width, cm = DESA.cam;
    for (let y = Math.ceil(cm.y / 32) + 1; y < (cm.y + cv.height / cm.zoom) / 32 - 2; y++) for (let x = Math.ceil(cm.x / 32) + 1; x < (cm.x + cv.width / cm.zoom) / 32 - 2; x++)
      if (DESA.validSpot('gubuk', x, y)) return { x: (x * 32 + 8 - cm.x) * cm.zoom * k, y: (y * 32 + 8 - cm.y) * cm.zoom * k }; });
  const nb0 = await p.evaluate(() => DESA.state.buildings.length);
  await p.touchscreen.tap(box.x + spot.x, box.y + spot.y); await p.waitForTimeout(200);
  r.placed = (await p.evaluate(() => DESA.state.buildings.length)) - nb0;
  // laci panel samping
  await p.tap('#drawerbtn'); await p.waitForTimeout(400);
  r.drawer = await p.evaluate(() => { const s = document.getElementById('side').getBoundingClientRect(); return { open: document.body.classList.contains('drawer-open'), top: Math.round(s.top), h: Math.round(s.height) }; });
  r.targets = await p.evaluate(() => [...document.querySelectorAll('#top button')].filter(b => b.offsetParent).map(b => b.getBoundingClientRect().height).reduce((a, h) => Math.min(a, h), 99));
  await p.screenshot({ path: require('./shotdir')('v4-mobile.png') });
  await p.tap('#drawerbtn'); await p.waitForTimeout(300); r.drawerClosed = await p.evaluate(() => !document.body.classList.contains('drawer-open'));
  const ok = r.layout.mobile && r.layout.cw === 390 && r.layout.sideHidden && r.layout.scrollW <= 392 && r.pan.dx > 40 && r.pan.dy > 30
    && z1 > z0 && z2 < z1 && r.vpanel && r.placed === 1 && r.drawer.open && r.drawer.top < 844 * 0.6 && r.targets >= 40 && r.drawerClosed && errs.length === 0;
  console.log(JSON.stringify({ ok, r, errs }, null, 1)); await b.close(); process.exit(ok ? 0 : 1);
})();
