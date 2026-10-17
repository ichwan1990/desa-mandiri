// Membuat TEKS-TEMA-sedang.json: teks empat musim (TEKS v1.3.0) untuk kunci yang di TEKS v1.5.0 ditulis ulang bernuansa Nusantara.
// Pakai: node tools/buat_overlay_sedang.js [v1.3.json] (bawaan: salinan v1.3.0 dari git, commit 43e9cc3:TEKS-GAME-sedang.json)
const fs = require('fs'), cp = require('child_process'), path = require('path');
const root = path.join(__dirname, '..');
const A = JSON.parse(process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : cp.execSync('git show 43e9cc3:TEKS-GAME-sedang.json', { cwd: root, maxBuffer: 1 << 24 }).toString());
const B = JSON.parse(fs.readFileSync(path.join(root, 'TEKS-GAME.json'), 'utf8'));
let n = 0; const top = {};
const idOf = x => x && typeof x === 'object' && !Array.isArray(x) ? (x.id ?? x.kode ?? null) : null;
function diff(a, b, p) {
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) return undefined;
  if (typeof a === 'string') { if (a !== b) { n++; const t = p.split(/[.\[]/)[1]; top[t] = (top[t] || 0) + 1; return a; } return undefined; }
  if (Array.isArray(a)) {
    if (a.length && b.length && a.every(x => idOf(x) != null) && b.every(x => idOf(x) != null)) { const out = [];
      for (const x of a) { const y = b.find(z => idOf(z) === idOf(x)); if (!y) continue; const d = diff(x, y, p + '[' + idOf(x) + ']'); if (d !== undefined) out.push(Object.assign({ id: idOf(x) }, d)); }
      return out.length ? { __byId: out } : undefined; }
    if (a.every(x => typeof x === 'string')) { if (JSON.stringify(a) !== JSON.stringify(b)) { n++; const t = p.split(/[.\[]/)[1]; top[t] = (top[t] || 0) + 1; return a; } return undefined; }
    const out = {}; let any = false; a.forEach((x, i) => { if (i < b.length) { const d = diff(x, b[i], p + '[' + i + ']'); if (d !== undefined) { out[i] = d; any = true; } } });
    return any ? { __byIdx: out } : undefined; }
  if (a && typeof a === 'object') { const out = {}; let any = false;
    for (const k of Object.keys(a)) { if (p === '' && k === 'meta') continue; if (!(k in b)) continue; const d = diff(a[k], b[k], p + '.' + k); if (d !== undefined) { out[k] = d; any = true; } }
    return any ? out : undefined; }
  return undefined;
}
const o = diff(A, B, '') || {};
// tambahan manual: entri baru v1.5 (belum ada di v1.3) yang menyebut musim tropis
const MANUAL = { pencapaian: [{ id: 'A27', nama: 'Tujuh Musim Dingin', teks_terbuka: 'Tujuh musim dingin terlewati bersama. Desa ini tumbuh kuat seperti pohon ek.' }] };
for (const [sec, list] of Object.entries(MANUAL)) { const cur = (o[sec] = o[sec] || {}); cur.__byId = (cur.__byId || []).filter(x => !list.some(l => l.id === x.id)).concat(list); }
o._catatan = 'Dibuat otomatis oleh tools/buat_overlay_sedang.js dari TEKS v1.3.0 (empat musim) terhadap TEKS-GAME.json v' + B.meta.versi + '. Jangan edit manual; jalankan ulang bila TEKS berubah.';
fs.writeFileSync(path.join(root, 'TEKS-TEMA-sedang.json'), JSON.stringify(o, null, 1) + '\n');
console.log('string ditimpa:', n, top);
