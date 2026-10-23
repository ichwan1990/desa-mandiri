// QC: tes tidak lagi menulis ke docs/screenshots/ (dilacak git). Tangkapan layar masuk ke test-results/shots/,
// kecuali UPDATE_SHOTS=1 (sengaja memperbarui gambar dokumentasi).
const path = require('path'), fs = require('fs');
module.exports = name => { const dir = process.env.UPDATE_SHOTS === '1' ? path.join(__dirname, '..', 'docs', 'screenshots') : path.join(__dirname, '..', 'test-results', 'shots');
  fs.mkdirSync(dir, { recursive: true }); return path.join(dir, name); };
