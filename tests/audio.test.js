// Tes audio & pengaturan: audio mulai setelah gestur, volume/mute tersimpan, SFX tidak error, bar memakai gambar skin.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=user-gesture-required'] }); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://localhost:8095/')); await p.waitForTimeout(1500);
  const r = {};
  r.beforeGesture = await p.evaluate(() => AUDIO.started);
  r.menuText = await p.evaluate(() => [document.getElementById('btnNew').textContent, document.getElementById('lblMusik').textContent]);
  await p.click('#btnSettings'); await p.fill('#setMusik', '20').catch(() => {}); await p.$eval('#setMusik', e => { e.value = 20; e.dispatchEvent(new Event('input')); });
  await p.$eval('#setEfek', e => { e.value = 40; e.dispatchEvent(new Event('input')); }); await p.click('#btnBack');
  await p.waitForTimeout(300);
  r.afterGesture = await p.evaluate(() => AUDIO.started);
  r.saved = await p.evaluate(() => JSON.parse(localStorage.getItem('desaMandiriSettings')));
  await p.click('#btnNew'); await p.waitForTimeout(500);
  await p.click('#mutebtn'); r.muted = await p.evaluate(() => [AUDIO.muted, document.getElementById('mutebtn').textContent, JSON.parse(localStorage.getItem('desaMandiriSettings')).mute]);
  await p.click('#mutebtn'); r.unmuted = await p.evaluate(() => AUDIO.muted);
  await p.evaluate(() => ['tebang', 'tambang', 'bangun', 'panen', 'event', 'lonceng', 'koin', 'klik', 'tidakada'].forEach(n => AUDIO.sfx(n)));
  await p.waitForTimeout(1500);
  await p.click('#tutSkip').catch(() => {}); await p.click('[data-s="0"]'); await p.waitForTimeout(300);
  const box = await p.locator('#c').boundingBox();
  const pos = await p.evaluate(() => { const c = DESA.cam, v = DESA.state.villagers[0]; return { sx: (v.x * 32 + 16 - c.x) * c.zoom, sy: (v.y * 32 + 16 - c.y) * c.zoom }; });
  await p.mouse.click(box.x + pos.sx, box.y + pos.sy); await p.waitForTimeout(400);
  await p.screenshot({ path: '../docs/screenshots/v4-audio-bars.png' });
  r.barBg = await p.evaluate(() => [...document.querySelectorAll('.bar>i[class^=f-]')].slice(0, 3).map(i => getComputedStyle(i).backgroundImage.slice(0, 60)));
  await p.reload(); await p.waitForTimeout(1200); await p.click('#btnSettings'); r.persist = await p.evaluate(() => [document.getElementById('setMusik').value, document.getElementById('setEfek').value]);
  const ok = !r.beforeGesture && r.afterGesture && r.saved.musik === 20 && r.saved.efek === 40 && r.muted[0] && r.muted[2] === true && !r.unmuted && r.barBg.length > 0 && r.barBg.every(x => x.includes('bar_fill')) && r.persist[0] === '20' && errs.length === 0;
  console.log(JSON.stringify({ ok, r, errs }, null, 1)); await b.close(); process.exit(ok ? 0 : 1);
})();
