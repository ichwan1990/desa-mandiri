# Desa Mandiri

Game manajemen desa berbasis web (HTML5 Canvas + JavaScript murni, tanpa build/framework). Pemain berperan sebagai kepala desa: penduduk bekerja **otomatis** (AI berbasis kebutuhan lapar/energi/air/kesehatan + prioritas desa). Pemain hanya mengatur prioritas kerja, menaruh rencana bangunan, dan merespons event. Fitur: peta tile 32x32 dengan sungai & jembatan, pathfinding A*, siklus siang/malam, 4 musim (musim dingin: tanaman berhenti tumbuh), ladang, sumur, era (Perkemahan → Dusun → Desa Pertanian → Kota Kecil), event acak, misi, tutorial, kamera (geser/zoom), kecepatan jeda/1x/2x/3x/4x, simpan/muat (localStorage). Semua teks UI dalam Bahasa Indonesia.

## Menjalankan
Game memuat `TEKS-GAME.json` dan aset lewat `fetch`, jadi harus dijalankan dari server HTTP (bukan `file://`):
```bash
cd village-game
python serve.py          # Windows/Linux/macOS; bawaan port 8095 -> buka http://localhost:8095
python serve.py 8096     # port lain (mis. bila 8095 terpakai)
python serve.py --host 0.0.0.0   # agar bisa dibuka dari HP di jaringan yang sama
```
`serve.py` memakai server multi-thread dengan antrean besar. Hindari `python -m http.server`: server itu menolak sebagian dari ~180 permintaan gambar saat game dimuat, sehingga sprite jatuh ke placeholder. Pemuat aset juga membatasi 12 unduhan paralel dan mencoba ulang gambar yang gagal.
Kontrol: seret peta / WASD / panah untuk geser, roda mouse atau tombol −/+ untuk zoom, klik tombol bangunan lalu klik peta untuk menaruh rencana (klik kanan = batal).

## Tes (Playwright)
Server harus berjalan di `http://localhost:8095` (`python serve.py`), atau set `GAME_URL` (mis. `GAME_URL=http://localhost:8096/ npm test`).
```bash
cd tests
npm install
npm run setup     # unduh Chromium untuk Playwright
npm test          # semua tes: menu, panel, riset, pasar, teks, audio, pencapaian, ponsel (390x844), musim & ancaman, tumpukan stok, dll.
node balance-sim.test.js 5   # simulasi balancing 24 hari (5 kali), cetak kurva stok makanan + kematian/kepergian
node balance-sim.test.js 6 120   # simulasi panjang 120 hari: kematian, kepergian, stok hari 60/120, soft-lock
```
Tes gagal (exit code 1) bila ada error di konsol. Screenshot disimpan di `docs/screenshots/`.

## Fitur tahap 3
- **Pasar & pedagang keliling** — tombol 🛒 Pasar (butuh bangunan Pasar atau pedagang yang sedang singgah). Barter berbasis nilai: tiap barang punya harga jual & beli, harga bergeser tiap hari (0,92–1,08, dibatasi 0,7–1,4), dipengaruhi musim & event, dengan kuota nilai harian per era. Menjual pangan saat stok > ±16 hari dihargai lebih murah. Om Robert datang berkala dengan gerobaknya lewat jembatan dan memberi diskon beli 10%. Angka di `balance.js` (`MARKET`, `MERCHANT`).
- **Suara** — musik ambien generatif + SFX (tebang, tambang, bangun, panen, event, koin, lonceng, klik), semuanya dibuat WebAudio. Mulai setelah klik/tombol pertama (aturan autoplay browser). Volume musik & efek terpisah di Pengaturan, tombol 🔊/🔇 untuk bisu.
- **Pencapaian** — 24 pencapaian (A01–A24) dari `TEKS-GAME.json`, dengan ikon, notifikasi toast, dan panel 🏅 (yang rahasia tampil sebagai ???). Disimpan terpisah dari save game (`localStorage: desaMandiriPencapaian`), jadi tetap ada walau mulai desa baru. Hadiah diberikan saat terbuka.
- **Ringkasan harian** — tiap fajar, log & panel "Ringkasan Kemarin" menampilkan yang dikumpulkan, dimakan, dibangun, dan kejadian hari sebelumnya.
- **Layar sentuh & ponsel** — di bawah 900px kanvas memenuhi layar dan panel samping menjadi laci bawah (tombol ☰ Panel). Satu jari: seret untuk geser, ketuk untuk memilih penduduk/menaruh bangunan. Dua jari: cubit untuk zoom (level bulat 1/2/3 agar pixel tetap tajam). Tombol diperbesar (≥ 40px). Angka di `balance.js` (`TOUCH`).

## Musim & ancaman (tahap 4, `docs/RISET-MUSIM-ANCAMAN.md`)
- **Peringatan di layar** — banner kuning/oranye/merah di bawah bar atas: stok pangan (waspada < 8 hari, bahaya < 5, kritis < 3, kolaps = lumbung kosong + jendela modal), jejak/auman serigala, asap & kebakaran, sungai naik/meluap, dingin ekstrem, api unggun padam, kekeringan. 7 hari pertama tanpa penalti kelaparan.
- **Musim** — semi: tanam lebih cepat, hujan (mood +, tebang sedikit lambat), banjir kecil di tepi sungai (jalan lambat, ladang tepi sungai tertunda). Panas: butuh air ×1,35, kekeringan, risiko api di Dapur/Bengkel. Gugur: hitung mundur ke musim dingin (stok ≥ 8 hari, 10 di tahun ke-2) & syukuran. Dingin: lapar ×2 (Lumbung ×1,6), api unggun makan 2 kayu/hari, pakaian (Kulit ≥ penduduk) mengurangi penurunan mood di luar, dingin ekstrem diumumkan sore sebelumnya.
- **Serigala** — malam hari, berfase: jejak (sore) → auman, penduduk pulang → serangan (mulai era Dusun; Perkemahan hanya jejak). Pagar memperlambat, Obor (1 kayu / 2 malam) mengurangi peluang terkena, Menara Jaga yang dijaga (tugas darurat **Jaga**) mengusir serigala. Gigitan melukai, bisa trauma; mulai tahun ke-2 bisa fatal bila kesehatan rendah dan jauh dari pagar/menara.
- **Kebakaran** — bau asap dulu, lalu api; penduduk (tugas darurat **Padam**) memakai 5 air per siraman, atau membuat sekat 10 kayu bila air habis. Api bisa merembet ke bangunan di dekatnya.
- **Sakit, pergi, kematian** — mood rendah/dingin/lapar bisa membuat sakit ringan (kerja lebih lambat); sakit parah butuh tugas **Rawat** (5 makanan) atau bisa meninggal. Penduduk yang murung 5 hari (atau kelaparan) pergi, tapi desa tidak dibiarkan < 2 orang. Kematian: jasad, tugas **Makam** (5 kayu), upacara, masa berkabung 5 hari (mood turun).
- **Skala tahun** — tahun ke-2 (hari 29+): ancaman ×1,25, dingin ekstrem lebih sering, cadangan musim dingin 10 hari.
- **Cuaca & visual** — hujan, salju, daun gugur, hawa panas, tint beku, vignette duka; sprite musiman (rumput/pohon/semak), banjir, api, asap, serigala, jejak, makam.
- **Pembusukan** — makanan di atas 20 hari stok membusuk 2%/hari (×1,5 musim panas, ×0,5 dengan Lumbung); air di atas 12 hari menguap 10%/hari, maks 30 hari.
- Prioritas darurat (Jaga/Padam/Rawat/Makam) di panel prioritas: di atas kerja biasa, di bawah makan/tidur kritis. Angka: `SEASON_FX`, `FAMINE`, `THREAT`, `FIRE`, `FLOOD`, `SICKNESS`, `LEAVE`, `DEATH`, `YEAR_SCALE`, `SPOILAGE` di `balance.js`.

## Barang terlihat (tumpukan stok)
- Kayu, batu, makanan (termasuk gandum) dan air ditumpuk di samping Gudang (atau api unggun / pusat kemah sebelum ada gudang). Tingkat 0–4: `stok == 0 ? 0 : min(4, 1 + floor(3 × stok / kapasitas))`, kapasitas per jenis di `balance.js` (`STOCKPILE.capacity`). Musim dingin memakai varian `_winter`. Sprite: `assets/stockpiles/stockpile_<res>_<0-4>[_winter].png` (kunci `stockpile_*` di `assets.js`); tanpa sprite, game menumpuk ikon sumber daya.
- Penduduk selalu memakai sprite membawa sesuai jenis barang (kayu/batu/makanan/air; papan/bata/alat/kulit memakai baris terdekat), juga saat berhenti. Saat setor, muncul teks melayang `+N` dengan ikon sumber daya (digabung bila beruntun).

## Struktur file
```
index.html          Tata letak & UI
balance.js          SEMUA angka balancing (CONFIG) — ubah di sini untuk tuning
assets.js           Peta aset tunggal (ASSETS): path sprite, ukuran frame, animasi, warna placeholder
audio.js            Musik ambien & SFX (WebAudio, tanpa file suara)
serve.py            Server lokal multi-thread (python serve.py [port] [folder], bawaan 8095)
tech.js             Pohon teknologi (data)
theme.css           Tema/skin UI + tata letak responsif
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
