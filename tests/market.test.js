// Pasar & pedagang keliling: kedatangan (sprite), harga, barter nilai, kuota, nerf jual pangan, UI.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1560, height: 860 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]');
  const r = {};
  r.closedAtStart = await p.evaluate(() => !DESA.marketOpen());
  // pedagang datang lewat jembatan
  r.arrive = await p.evaluate(() => { const S = DESA.state; S.res.makanan = 60; S.res.air = 40; S.res.kayu = 200; DESA.spawnMerchant(); let crossed = false, steps = 0;
    while (S.merchant && S.merchant.state === 'datang' && steps < 3000) { DESA.step(0.1); steps++; if (S.merchant && S.tiles[Math.round(S.merchant.y)][Math.round(S.merchant.x)] === 2) crossed = true; if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } }
    return { state: S.merchant && S.merchant.state, crossedBridge: crossed, open: DESA.marketOpen(), steps }; });
  // harga & barter
  r.trade = await p.evaluate(() => { const S = DESA.state; const pj = DESA.priceOf('kayu', 'jual'), pb = DESA.priceOf('makanan', 'beli');
    const q = DESA.tradeQuote('kayu', 10, 'makanan'); const k0 = S.res.kayu, f0 = S.res.makanan; const res = DESA.doTrade('kayu', 10, 'makanan');
    return { pj, pb, n: q.n, expect: Math.floor(10 * pj / pb), ok: res.ok, kayuSpent: k0 - S.res.kayu, foodGot: S.res.makanan - f0, trades: S.trades }; });
  r.quotaBlocks = await p.evaluate(() => !DESA.tradeQuote('kayu', 150, 'makanan').ok);
  r.mods = await p.evaluate(() => { const S = DESA.state; const m0 = S.merchant; for (let i = 0; i < 60; i++) DESA.marketNewDay(); S.merchant = m0; const pm = Object.values(S.priceMod);
    const before = DESA.foodSellMult(); S.res.makanan = 1000; const after = DESA.foodSellMult(); S.res.makanan = 60;
    return { inRange: pm.every(x => x >= 0.7 && x <= 1.4), nerfLow: before, nerfHigh: after }; });
  // UI
  await p.click('#marketbtn'); await p.waitForTimeout(200);
  r.ui = await p.evaluate(() => ({ rows: document.querySelectorAll('#mkTable tr').length, status: document.getElementById('mkStatus').textContent.slice(0, 60) }));
  await p.fill('#mkQty', '12'); await p.selectOption('#mkGive', 'kayu'); await p.selectOption('#mkGet', 'makanan'); await p.waitForTimeout(150);
  const t0 = await p.evaluate(() => DESA.state.trades); await p.click('#mkDo'); r.uiTrade = (await p.evaluate(() => DESA.state.trades)) === t0 + 1;
  await p.evaluate(() => { const m = DESA.state.merchant; DESA.setZoom(2); DESA.centerCam(m.x, m.y - 2); }); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v4-market.png') });
  // pergi
  r.leaves = await p.evaluate(() => { const S = DESA.state; for (let i = 0; i < 3000 && S.merchant; i++) { DESA.step(0.1); if (S.event) { const e = [...document.querySelectorAll('[data-ev]')].find(x => !x.disabled); e && e.click(); } } return !S.merchant; });
  const ok = r.closedAtStart && r.arrive.state === 'berdagang' && r.arrive.crossedBridge && r.arrive.open && r.trade.ok && r.trade.n === r.trade.expect && r.trade.kayuSpent === 10 &&
    r.trade.foodGot === r.trade.n && r.quotaBlocks && r.mods.inRange && r.mods.nerfLow === 1 && r.mods.nerfHigh < 1 && r.ui.rows === 9 && r.uiTrade && r.leaves;
  console.log(JSON.stringify({ r, ok, errs })); if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
