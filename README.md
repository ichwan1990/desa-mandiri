# Desa Mandiri

Game manajemen desa berbasis web (HTML5 Canvas + JavaScript murni, tanpa build/framework). Pemain berperan sebagai kepala desa: penduduk bekerja **otomatis** (AI berbasis kebutuhan lapar/energi/air/kesehatan + prioritas desa). Pemain hanya mengatur prioritas kerja, menaruh rencana bangunan, dan merespons event. Fitur: peta tile 32x32 dengan sungai & jembatan, pathfinding A*, siklus siang/malam, 4 musim (musim dingin: tanaman berhenti tumbuh), ladang, sumur, era (Perkemahan → Dusun → Desa Pertanian → Kota Kecil), event acak, misi, tutorial, kamera (geser/zoom), kecepatan jeda/1x/2x/3x/4x, simpan/muat (localStorage). Semua teks UI dalam Bahasa Indonesia.

## Menjalankan
Game memuat `TEKS-GAME.json` dan aset lewat `fetch`, jadi harus dijalankan dari server HTTP (bukan `file://`):
```bash
cd village-game
python3 -m http.server 8080
# buka http://localhost:8080
```
Kontrol: seret peta / WASD / panah untuk geser, roda mouse atau tombol −/+ untuk zoom, klik tombol bangunan lalu klik peta untuk menaruh rencana (klik kanan = batal).

## Tes (Playwright)
Server harus berjalan di `http://localhost:8080` (atau set `GAME_URL`).
```bash
cd tests
npm install
npm run setup     # unduh Chromium untuk Playwright
npm test          # smoke, pathfinding+kamera, musim+ladang, event pendatang
node balance-sim.test.js 5   # simulasi balancing 24 hari (5 kali), cetak kurva stok makanan
```
Tes gagal (exit code 1) bila ada error di konsol. Screenshot disimpan di `docs/screenshots/`.

## Struktur file
```
index.html          Tata letak & UI
balance.js          SEMUA angka balancing (CONFIG) — ubah di sini untuk tuning
assets.js           Peta aset tunggal (ASSETS): path sprite, ukuran frame, animasi, warna placeholder
game.js             Simulasi, AI penduduk, pathfinding, render, UI, simpan/muat
TEKS-GAME.json      Teks game: nama penduduk, log harian, event, tutorial, misi (dimuat via fetch)
assets/             Sprite pixel art (lihat assets/README.md & manifest.json)
docs/               KONSEP.md (konsep), RISET-MEKANIK.md (riset mekanik & balancing), screenshots/
tests/              Tes Playwright + package.json (devDependency: playwright)
tools/              Skrip pembuat teks
```

## Tuning
- **`balance.js`**: laju lapar/energi, waktu & hasil kerja, biaya bangunan (`BUILDINGS`), syarat era (`ERAS`), musim, ladang (`FIELD`), air (`WATER`), syarat penduduk baru (`SPAWN`), peluang event, prioritas awal (`DEFAULT_PRIO`), ukuran peta/kamera.
- **`assets.js`**: ganti/isi `img` untuk menukar sprite. Jika gambar tidak ada, game memakai bentuk/warna placeholder. Varian `*_dingin` (musim dingin) dan `*_malam` (jendela menyala) dipakai otomatis bila tersedia.
- **`TEKS-GAME.json`**: kunci efek event/hadiah misi yang belum didukung akan dicatat di konsol dan diabaikan.

Catatan: simpanan dari versi peta lama (40x25) diabaikan otomatis.
