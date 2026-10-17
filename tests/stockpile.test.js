// Tumpukan stok terlihat di peta, sprite membawa per jenis, teks melayang "+N" saat setor; gudang utuh menyembunyikan tumpukan (penanda isi), hancur/dibongkar -> tumpukan kembali.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8095/'); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.DESA && DESA.state, null, { timeout: 15000 });
  await p.click('#btnNew'); await p.click('#tutSkip'); await p.click('[data-s="0"]');
  const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, out = {};
    const missing = Object.keys(ASSETS).filter(k => k.startsWith('stockpile_') && !ASSETS[k].image);
    // sebelum ada gudang: tumpukan di samping api unggun / pusat kemah; stok 0 -> palet kosong (tingkat 0)
    Object.assign(S.res, { kayu: 0, batu: 0, makanan: 0, gandum: 0, air: 0 });
    out.campTiers = DESA.stockpiles().map(x => x.tier); out.campSpots = DESA.stockpiles().map(x => [x.x, x.y]);
    // rumus tingkat: stok==0 ? 0 : min(4, 1 + floor(3*stok/kapasitas))
    const cap = C.STOCKPILE.capacity, tierAt = (r, n) => { S.res[r] = n; return DESA.pileTier(r); };
    out.formula = ['kayu', 'batu', 'air'].every(r => tierAt(r, 0) === 0 && tierAt(r, 1) === 1 && tierAt(r, Math.ceil(cap[r] / 3)) === 2 && tierAt(r, Math.ceil(2 * cap[r] / 3)) === 3 && tierAt(r, cap[r]) === 4 && tierAt(r, cap[r] * 9) === 4);
    S.res.makanan = 0; S.res.gandum = cap.makanan; out.foodIncludesWheat = DESA.pileTier('makanan') === 4;
    // dengan gudang: pindah ke samping gudang, tidak menimpa bangunan/pohon
    DESA.addBuilding('gudang', 25, 17, true); DESA.addBuilding('apiunggun', 22, 20, true);
    Object.assign(S.res, { kayu: 160, batu: 30, makanan: 20, gandum: 10, air: 3 });
    const sp = DESA.stockpiles(); out.gud = sp.map(x => x.res + x.tier); out.gudSpots = sp.map(x => [x.x, x.y]);
    out.nearWarehouse = sp.every(x => x.x >= 24 && x.x <= 28 && x.y >= 16 && x.y <= 20);
    out.free = sp.every(x => !S.buildings.some(bd => { const d = C.BUILDINGS[bd.type]; return x.x >= bd.x && x.x < bd.x + d.w && x.y >= bd.y && x.y < bd.y + d.h; }) && !S.nodes.some(n => n.x === x.x && n.y === x.y));
    // jenis bawaan -> baris sprite membawa
    const cb = ASSETS.penduduk_bawa; out.carryRows = ['kayu', 'batu', 'makanan', 'gandum', 'air', 'papan', 'kulit'].every(k => cb.tipe[k] != null) && cb.images.filter(Boolean).length === 4;
    // setor -> teks melayang
    const v = S.villagers[0]; v.carry = { res: 'air', n: 3 }; const n0 = DESA.notes.length; S.res.air = 3;
    const vx = v.x, vy = v.y; v.task = { kind: 'setor', target: { x: vx, y: vy } }; DESA.step(0.1);
    out.deposit = S.res.air === 6 && DESA.notes.some(n => n.res === 'air' && n.n >= 3) && DESA.notes.length > n0;
    out.missing = missing; return out; });
  // pemandangan untuk screenshot: penduduk membawa kayu/air/batu/makanan menuju gudang
  await p.evaluate(() => { const S = DESA.state; DESA.setZoom(3); DESA.centerCam(25.5, 19.5); S.t = 120 * 0.4;
    while (S.villagers.length < 4) { const o = JSON.parse(JSON.stringify(S.villagers[0])); o.id = S.nextId++; o.name = ['Dewi', 'Agus'][S.villagers.length - 2]; o.color = S.villagers.length; S.villagers.push(o); }
    [['kayu', 23.2, 20.6, 2], ['air', 29.4, 19.4, 1], ['batu', 27.6, 21.2, 3], ['makanan', 21.8, 18.4, 2]].forEach(([res, x, y, dir], i) => { const v = S.villagers[i];
      Object.assign(v, { x, y, dir, carry: { res, n: 3 }, moving: true, working: false, task: { kind: 'setor', target: { x: 26, y: 19 } } }); });
    DESA.notify('makanan', 4, { x: 26, y: 18.6 }); DESA.notify('kayu', 5, { x: 24, y: 18.4 }); });
  const carryDrawn = await p.evaluate(() => DESA.state.villagers.every(v => v.carry));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v5-stockpile.png') });
  // tema empat musim: musim dingin -> varian _winter; tema Nusantara: tanpa salju (varian _winter tidak dimuat)
  const winter = await p.evaluate(() => { const S = DESA.state; S.day = 22; return CONFIG.THEME === 'sedang' ? DESA.season() === 'dingin' && !!ASSETS.stockpile_kayu_4_winter.image : !ASSETS.stockpile_kayu_4_winter && DESA.season() === 'kemarau'; });
  // gudang menyimpan barang (hanya tampilan): sebelum gudang tumpukan tanah tampak; gudang utuh -> tumpukan hilang + penanda isi 0-4; gudang hancur/dibongkar -> tumpukan kembali
  const q = await b.newPage({ viewport: { width: 1600, height: 900 } }); q.on('pageerror', e => errs.push(String(e))); q.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await q.goto(process.env.GAME_URL || 'http://localhost:8095/'); await q.evaluate(() => localStorage.clear()); await q.reload();
  await q.waitForFunction(() => window.DESA && DESA.state, null, { timeout: 15000 }); await q.click('#btnNew'); await q.click('#tutSkip'); await q.click('[data-s="0"]');
  const pileDraws = () => q.evaluate(() => new Promise(res => { const g = document.getElementById('c').getContext('2d'), o = g.drawImage; let n = 0;
    g.drawImage = function (im, ...a) { if (im && im.src && /stockpile/.test(im.src)) n++; return o.call(this, im, ...a); }; setTimeout(() => { g.drawImage = o; res(n); }, 250); }));
  await q.evaluate(() => { const S = DESA.state; S.t = 120 * 0.4; DESA.addBuilding('apiunggun', 22, 20, true); Object.assign(S.res, { kayu: 60, batu: 20, makanan: 15, air: 10 }); DESA.setZoom(3); DESA.centerCam(24, 19.5); S.villagers.forEach((v, i) => { v.x = 20 + i; v.y = 23; v.task = null; }); });
  await q.waitForTimeout(300);
  const g = { before: await q.evaluate(() => DESA.pilesVisible()), beforeDraws: await pileDraws() };
  await q.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v8-stockpile-sebelum.png') });
  await q.evaluate(() => DESA.addBuilding('gudang', 25, 17, true)); await q.waitForTimeout(200);
  Object.assign(g, await q.evaluate(() => { const S = DESA.state, C = CONFIG, cap = C.STOCKPILE.capacity, out = { after: DESA.pilesVisible(), store: DESA.storeBuilding() && DESA.storeBuilding().type };
    const set = f => { for (const r of ['kayu', 'batu', 'air']) S.res[r] = cap[r] * f; S.res.makanan = cap.makanan * f; S.res.gandum = 0; return DESA.storeFillLevel(); };
    out.levels = [set(0), set(0.05), set(0.4), set(0.7), set(1.2)]; set(0.7); return out; }));
  g.afterDraws = await pileDraws(); await q.waitForTimeout(200);
  await q.screenshot({ path: path.join(__dirname, '..', 'docs', 'screenshots', 'v8-stockpile-gudang.png') });
  Object.assign(g, await q.evaluate(() => { const S = DESA.state, gd = S.buildings.find(x => x.type === 'gudang'); gd.hp = 0; return { destroyed: DESA.pilesVisible(), anchorNotRuin: DESA.stockpiles().every(p => !(p.x >= 25 && p.x < 28 && p.y >= 17 && p.y < 19)) }; }));
  g.destroyedDraws = await pileDraws();
  Object.assign(g, await q.evaluate(() => { const S = DESA.state, gd = S.buildings.find(x => x.type === 'gudang'); gd.hp = 100; const mid = DESA.pilesVisible(); S.buildings.splice(S.buildings.indexOf(gd), 1); return { repaired: mid, demolished: DESA.pilesVisible() }; }));
  console.log(JSON.stringify({ ...r, carryDrawn, winter, gudang: g }));
  const ok = r.missing.length === 0 && r.campTiers.every(t => t === 0) && r.campSpots.length === 4 && r.formula && r.foodIncludesWheat && r.nearWarehouse && r.free
    && r.gud.join() === 'kayu4,batu2,makanan1,air1' && r.carryRows && r.deposit && carryDrawn && winter
    && g.before && g.beforeDraws > 0 && !g.after && g.store === 'gudang' && g.afterDraws === 0 && g.levels.join() === '0,1,2,3,4' && g.destroyed && g.anchorNotRuin && g.destroyedDraws > 0 && !g.repaired && g.demolished && errs.length === 0;
  console.log(errs.length ? errs : 'no errors'); await b.close(); process.exit(ok ? 0 : 1);
})();
