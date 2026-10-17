// Integrasi TEKS-GAME.json v1.1: quest lanjutan, tipe tujuan baru, event era lanjut, efek baru, placeholder.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(900);
  await p.click('#btnNew'); await p.click('#tutSkip');
  const r = await p.evaluate(() => { const S = DESA.state, out = {};
    // quest ke-15 (q15 riset semua 3)
    S.questIdx = 14; S.techDone = ['T01', 'T02']; DESA.step(0.1); out.q15Before = S.questIdx; S.techDone.push('T05'); DESA.step(0.1); out.q15After = S.questIdx;
    S.questIdx = 17; S.trades = 5; DESA.step(0.1); out.q18 = S.questIdx;
    // progres_riset & harga pangan
    S.research = { id: 'T03', progress: 0 }; DESA.applyEffects({ progres_riset: 25 }, 'tes'); out.progress = S.research.progress;
    const pb = DESA.priceOf('makanan', 'beli'); DESA.applyEffects({ harga_beli_pangan: 20 }, 'tes'); out.priceUp = +(DESA.priceOf('makanan', 'beli') / pb).toFixed(2);
    // filter era: event era lanjut tidak muncul di perkemahan
    out.eraFiltered = DESA.allEvents().filter(e => e.era).every(e => !DESA.eventEraOk(e));
    out.placeholder = DESA.fill('{pedagang} {persen}% {jumlah2} {sumber_daya2} {teknologi} {kuota} {hari_sisa}');
    return out; });
  const ok = r.q15Before === 14 && r.q15After === 15 && r.q18 === 18 && r.progress === 15 && r.priceUp === 1.2 && r.eraFiltered && !/\{/.test(r.placeholder);
  console.log(JSON.stringify({ r, ok, errs })); if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
