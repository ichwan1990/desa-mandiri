// Menu utama (Main Baru / Lanjutkan / Pengaturan) dan tutorial interaktif.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  const url = process.env.GAME_URL || 'http://localhost:8080/';
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  const r = {};
  r.menuVisible = await p.isVisible('#menu'); r.continueHiddenNoSave = !(await p.isVisible('#btnContinue'));
  const t0 = await p.evaluate(() => DESA.state.t); await p.waitForTimeout(600); r.pausedInMenu = (await p.evaluate(() => DESA.state.t)) === t0;
  await p.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v4-menu.png') });
  // pengaturan
  await p.click('#btnSettings'); await p.selectOption('#setSpeed', '2'); await p.fill('#setMusik', '40'); await p.click('#btnBack');
  r.settingsSaved = await p.evaluate(() => JSON.parse(localStorage.getItem('desaMandiriSettings')));
  // main baru -> tutorial langkah 1 menyorot canvas
  await p.click('#btnNew'); r.menuClosed = !(await p.isVisible('#menu'));
  r.speedFromSettings = await p.evaluate(() => document.querySelector('[data-s].on').dataset.s);
  r.step1 = await p.evaluate(() => [DESA.state.tutorialStep, document.querySelector('.tut-hl') && document.querySelector('.tut-hl').id]);
  await p.click('#tutNext');
  r.step2 = await p.evaluate(() => [DESA.state.tutorialStep, document.querySelector('.tut-hl') && document.querySelector('.tut-hl').id]);
  await p.click('#vil .v'); // aksi: klik penduduk -> lanjut otomatis
  r.step3 = await p.evaluate(() => [DESA.state.tutorialStep, document.querySelector('.tut-hl') && document.querySelector('.tut-hl').id]);
  await p.click('[data-p="batu"][data-n="3"]'); // aksi: ubah prioritas
  r.step4 = await p.evaluate(() => [DESA.state.tutorialStep, document.querySelector('.tut-hl') && document.querySelector('.tut-hl').id]);
  // simpan lalu menu -> Lanjutkan muncul
  await p.click('#save'); await p.click('#menubtn'); r.continueShownWithSave = await p.isVisible('#btnContinue');
  await p.click('#btnContinue'); r.continued = !(await p.isVisible('#menu'));
  const ok = r.menuVisible && r.continueHiddenNoSave && r.pausedInMenu && r.settingsSaved.speed === 2 && r.menuClosed && r.speedFromSettings === '2' &&
    r.step1[1] === 'c' && r.step2[0] === 1 && r.step2[1] === 'vil' && r.step3[0] === 2 && r.step3[1] === 'prio' && r.step4[0] === 3 && r.step4[1] === 'buildbar' &&
    r.continueShownWithSave && r.continued;
  console.log(JSON.stringify({ r, ok, errs })); if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
