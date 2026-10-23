// QC R-09: satu perintah untuk semua tes. Menyalakan serve.py di :8095 bila belum jalan, menjalankan npm test lalu balance-sim, lalu mematikan server.
const { spawn, spawnSync } = require('child_process'), net = require('net'), path = require('path');
const PORT = +(process.env.PORT || 8095), up = () => new Promise(r => { const s = net.connect(PORT, '127.0.0.1', () => { s.end(); r(true); }); s.on('error', () => r(false)); });
(async () => { let srv = null;
  if (!(await up())) { srv = spawn('python3', [path.join(__dirname, '..', 'serve.py'), String(PORT)], { stdio: 'ignore' }); for (let i = 0; i < 50 && !(await up()); i++) await new Promise(r => setTimeout(r, 100)); }
  const run = args => spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, { cwd: __dirname, stdio: 'inherit' }).status;
  let rc = run(['test']); if (!rc && !process.argv.includes('--tanpa-sim')) rc = spawnSync('node', ['balance-sim.test.js'], { cwd: __dirname, stdio: 'inherit' }).status;
  if (srv) srv.kill(); process.exit(rc || 0); })();
