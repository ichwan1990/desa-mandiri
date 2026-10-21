// Panel detail penduduk: klik di peta, bar kebutuhan, keahlian, tugas, riwayat, tugas favorit.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]');
  await p.evaluate(() => { for (let i = 0; i < 900; i++) DESA.step(0.1); DESA.setZoom(2); const v = DESA.state.villagers[0]; DESA.centerCam(v.x, v.y); });
  await p.waitForTimeout(300);
  const box = await p.locator('#c').boundingBox();
  const pos = await p.evaluate(() => { const c = DESA.cam, v = DESA.state.villagers[0]; return { sx: (v.x * 32 + 16 - c.x) * c.zoom, sy: (v.y * 32 + 16 - c.y) * c.zoom, id: v.id }; });
  await p.mouse.click(box.x + pos.sx, box.y + pos.sy);
  const r = {};
  r.panel = await p.isVisible('#vpanel');
  r.content = await p.evaluate(() => ({ name: document.querySelector('#vpanel h3').textContent, bars: document.querySelectorAll('#vpanel .bar').length,
    skills: (() => { let n = 0, on = false; for (const el of document.querySelectorAll('#vpDyn > *')) { if (el.tagName === 'H3') on = el.textContent === 'Keahlian'; else if (on && el.classList.contains('row')) n++; } return n; })(), history: document.querySelectorAll('#vpDyn li').length, task: document.querySelector('#vpDyn b').textContent }));
  await p.selectOption('#favSel', 'batu');
  r.fav = await p.evaluate(() => DESA.state.villagers[0].fav);
  // favorit meningkatkan pilihan kerja batu, tapi kebutuhan kritis tetap didahulukan
  r.stats = await p.evaluate(() => { const S = DESA.state, v = S.villagers[0], o = S.villagers[1]; let vb = 0, ob = 0, critOk = true;
    S.prio.batu = 1; S.res.makanan = 80; S.res.air = 60;
    for (let i = 0; i < 6000; i++) { DESA.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); }
      if (v.task && v.task.kind === 'kumpul' && v.task.res === 'batu') vb++; if (o.task && o.task.kind === 'kumpul' && o.task.res === 'batu') ob++;
      if (v.hunger < 15 && v.task && v.task.kind === 'kumpul' && S.res.makanan > 0) critOk = false; }
    return { vb, ob, critOk, hunger: v.hunger | 0, hist: v.history.slice(0, 4) }; });
  await p.evaluate(() => { const v = DESA.state.villagers[0]; DESA.centerCam(v.x, v.y); }); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v4-villager.png') });
  await p.click('#vpClose'); r.closed = !(await p.isVisible('#vpanel'));
  const ok = r.panel && r.content.bars === 4 && r.content.skills === 6 && r.fav === 'batu' && r.stats.vb > r.stats.ob && r.stats.critOk && r.closed;
  console.log(JSON.stringify({ r, ok, errs })); if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
