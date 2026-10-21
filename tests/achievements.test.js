// Pencapaian A01-A24: terbuka sesuai syarat, toast muncul, disimpan terpisah dari save game, ringkasan akhir hari.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto((process.env.GAME_URL || 'http://localhost:8095/')); await p.evaluate(() => localStorage.removeItem('desaMandiriPencapaian')); await p.reload(); await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  await p.click('#btnNew'); await p.click('#tutSkip').catch(() => {}); await p.click('[data-s="0"]');
  const r = {};
  r.a = await p.evaluate(() => { const S = DESA.state; const ids = () => Object.keys(DESA.ach.unlocked).sort();
    DESA.checkAch(); const start = ids();
    const spot = t => { for (let y = 10; y < 35; y++) for (let x = 5; x < 30; x++) if (DESA.validSpot(t, x, y)) return [x, y]; };
    ['apiunggun', 'gubuk', 'sumur'].forEach(t => { const [x, y] = spot(t); DESA.addBuilding(t, x, y, true); });
    S.res.makanan = 60; S.res.gandum = 0; const kayu0 = S.res.kayu; DESA.checkAch();
    return { start, after: ids(), kayuGain: S.res.kayu - kayu0 }; });
  await p.waitForTimeout(400);
  r.toasts = await p.$$eval('#toasts .toast', t => t.map(x => x.textContent.slice(0, 50)));
  r.b = await p.evaluate(() => { const S = DESA.state; S.eventChoices = { hujan_meteor: [1] }; S.foodStreakMax = 30; S.wintersOk = 1;
    DESA.checkAch(); return Object.keys(DESA.ach.unlocked).sort(); });
  r.sum = await p.evaluate(() => { const S = DESA.state; S.dayStats = { gathered: { kayu: 12 }, eaten: { makanan: 4 }, built: { Gubuk: 1 }, events: { 'Badai': 1 } }; S.day = 5;
    const s = DESA.endOfDaySummary(); return [s.day, S.log[0]]; });
  // simulasi musim dingin tanpa kelaparan lewat newDay di pergantian musim
  r.achN = await p.evaluate(() => fetch(CONFIG.TEXT_FILE || 'TEKS-GAME.json').then(x => x.json()).then(t => t.pencapaian.length)); // TEKS v1.5.0: 34 pencapaian (dulu 24)
  await p.click('#achbtn'); await p.waitForTimeout(300);
  r.panel = await p.evaluate(() => ({ items: document.querySelectorAll('#achpanel .ach').length, open: document.querySelectorAll('#achpanel .ach.open').length, secret: [...document.querySelectorAll('#achpanel .ach.locked b')].filter(x => x.textContent === '???').length, head: document.querySelector('#achpanel h3').textContent }));
  await p.evaluate(() => DESA.toast('assets/icons/achievements/ach_first_fire.png', '🏅 Pencapaian terbuka: Api Pertama!', 'Percikan pertama menyala.'));
  await p.waitForTimeout(350); await p.screenshot({ path: '../docs/screenshots/v4-achievements.png' });
  await p.evaluate(() => localStorage.removeItem('desaMandiriSave')); await p.reload(); await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  r.persist = await p.evaluate(() => [Object.keys(DESA.ach.unlocked).length, !!localStorage.getItem('desaMandiriPencapaian'), !localStorage.getItem('desaMandiriSave')]);
  const ok = ['A01', 'A02', 'A03', 'A07'].every(x => r.a.after.includes(x)) && r.a.kayuGain >= 10 && r.toasts.length > 0
    && ['A22', 'A12', 'A04'].every(x => r.b.includes(x)) && !r.b.includes('A24') && r.sum[0] === 4 && /dikumpulkan kayu 12/.test(r.sum[1]) && /Badai/.test(r.sum[1])
    && r.panel.items === r.achN && r.panel.secret >= 2 && r.persist[0] === r.panel.open && r.persist[1] && errs.length === 0;
  console.log(JSON.stringify({ ok, r, errs }, null, 1)); await b.close(); process.exit(ok ? 0 : 1);
})();
