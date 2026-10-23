// v18: target riset tahun 4 <= jumlah riset, nama per tema (Tambak/era/nama cadangan), {tema} ramah, sprite null-guard (monumen tanpa b.mon), R-06 angka nyata log rasa.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs = [], fails = [], out = {};
  const ok = (name, cond, info) => { if (!cond) fails.push(name + ' ' + JSON.stringify(info === undefined ? '' : info)); };
  for (const tema of ['', 'sedang']) { const T = tema || 'nusantara', p = await b.newPage(); p.on('pageerror', e => errs.push(T + ': ' + String(e)));
    await p.goto((process.env.GAME_URL || 'http://localhost:8095/') + (tema ? '?tema=' + tema : '')); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.DESA_READY && window.DESA && DESA.state, null, { timeout: 20000 });
    const r = await p.evaluate(() => { const S = DESA.state, C = CONFIG, V = DESA.v18, r = {};
      const y4 = C.YEAR_GOALS && C.YEAR_GOALS.years && C.YEAR_GOALS.years[4], g = y4 && y4.utama.find(x => x.tipe === 'riset'); r.goal = g ? [g.jumlah, V.goalJ(g), DESA.techNodes().length] : null;
      r.tambak = C.BUILDINGS.tambak.nama; r.era = C.ERAS[1].nama; r.names = C.NAMES[0]; r.merchant = C.MERCHANT_NAME || null; r.temaNama = V.temaNama(C.THEME);
      DESA.addBuilding('masjid', C.CAMP.x + 8, C.CAMP.y + 6, true); return r; });
    await p.waitForTimeout(400); // beberapa frame menggambar monumen tanpa b.mon
    const f = await p.evaluate(() => { const S = DESA.state, V = DESA.v18; S.lastSummary = { gathered: { kayu: 0, air: 0 }, foodIn: {} };
      const t0 = V.flavorReal('Hari {hari}: {nama} menebang pohon dan membawa pulang {jumlah} {sumber_daya}.'); S.lastSummary = { gathered: { kayu: 40, air: 7 }, foodIn: { ikan: 4 } };
      return { tebang0: t0, tebang: V.flavorReal('{nama} menebang pohon dan membawa pulang {jumlah} {sumber_daya}.'), ikan: V.flavorReal('{nama} memancing dan mendapat {jumlah} ikan.'), air: V.flavorReal('{nama} menimba {jumlah} air dari sungai.'), sosial: V.flavorReal('{nama} tertawa.') }; });
    out[T] = { r, f };
    ok(T + ' target riset tahun 4 <= jumlah riset', !r.goal || (r.goal[1] <= r.goal[2] && r.goal[1] === Math.min(r.goal[0], r.goal[2])), r.goal);
    ok(T + ' nama per tema', tema ? r.tambak !== 'Tambak' && r.era !== 'Dusun' && r.names === 'Anna' && r.merchant && r.temaNama === 'Empat musim' : r.tambak === 'Tambak' && r.era === 'Dusun' && r.temaNama === 'Nusantara', r);
    ok(T + ' R-06 angka nyata', f.tebang0 === null && f.tebang.jumlah === 5 && f.ikan.jumlah === 4 && f.air.jumlah === 7 && JSON.stringify(f.sosial) === '{}', f);
    await p.close(); }
  await b.close(); console.log(JSON.stringify(out));
  if (errs.length) fails.push('pageerror ' + JSON.stringify(errs.slice(0, 5)));
  if (fails.length) { console.log('GAGAL:\n' + fails.join('\n')); process.exit(1); } console.log('v18 OK'); })();
