// Event pendatang: hormati kapasitas gubuk & pakai nama baru yang belum dipakai.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(process.env.GAME_URL || 'http://localhost:8080/'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  const trigger = () => p.evaluate(() => { const S = DESA.state; S.event = 'pendatang'; DESA.showEvent();
    const btn = document.querySelector('[data-ev="0"]'); return { disabled: btn.disabled, name: S.eventName }; });
  const noHouse = await trigger();
  await p.evaluate(() => document.querySelector('[data-ev="2"]').click());
  await p.evaluate(() => { DESA.addBuilding('gubuk', 18, 21, true); DESA.addBuilding('gubuk', 26, 22, true); });
  const withHouse = await trigger();
  const after = await p.evaluate(() => { document.querySelector('[data-ev="0"]').click(); const S = DESA.state;
    return { names: S.villagers.map(v => v.name), log: S.log[0] }; });
  const unique = new Set(after.names).size === after.names.length;
  const ok = noHouse.disabled && !withHouse.disabled && unique && after.names.includes(withHouse.name) && after.log.includes(withHouse.name);
  console.log(JSON.stringify({ noHouse, withHouse, after, unique, ok, errs }));
  if (!ok || errs.length) process.exitCode = 1; await b.close();
})();
