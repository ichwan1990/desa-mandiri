# Analisa Playtest Berbasis Data — Desa Mandiri

*Dibuat oleh Grok Bot (simulasi headless), 17 Okt 2026. Tidak ada kode game yang diubah.*

## 1. Metode

- **Versi yang dianalisis:** commit `d6ec12fa9618e45dd09ad475ee6c4e97fd4278b2` (`git rev-parse HEAD`, working tree bersih saat disalin). Berkas `balance.js`, `tech.js`, `game.js`, `assets.js`, `audio.js`, `index.html`, `TEKS-GAME.json` disalin ke `/workspace/desa-analisa/snap/` (di luar repo) supaya simulasi memakai versi yang beku.
- **Fidelitas:** yang dijalankan adalah **kode game asli** (`game.js` utuh) di dalam jsdom (Node 20). Kanvas/aset/audio di-*stub*; `DESA.step(0.1)` dipanggil berulang (sama dengan langkah 0,1 dtk di loop `frame()`). AI penduduk, pathfinding A*, musim, ladang, air, spawn, era, event, riset, bengkel/pasar harian semuanya kode asli. `Math.random` diganti RNG ber-seed (mulberry32); peta tetap memakai seed bawaan game (`rng(12345)`), jadi **semua run memakai peta yang sama** — variasi berasal dari event, umur, panen, harga, dll.
- **Run:** 6 pengaturan × 30 seed (1–30) = **180 run**, masing-masing **120 hari** game (= 17 musim, ~4,3 tahun game). Total ±0,5–6 dtk per run.
- **Pengaturan prioritas** (skala 0–3 seperti `DEFAULT_PRIO`):

| Nama | bangun | makanan | bertani | air | kayu | batu | riset |
|---|---|---|---|---|---|---|---|
| Default (`DEFAULT_PRIO`) | 3 | 3 | 2 | 2 | 2 | 2 | 1 |
| Fokus makanan | 3 | 3 | 3 | 2 | 1 | 1 | 1 |
| Fokus kayu | 3 | 2 | 2 | 2 | 3 | 1 | 1 |
| Fokus batu | 3 | 2 | 2 | 2 | 1 | 3 | 1 |
| Seimbang | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| Idle (tanpa input) | default, tanpa membangun/riset | | | | | | |

- **Pemain-bot** (semua kecuali Idle): sekali per hari, jika tidak ada bangunan yang sedang dikerjakan dan mampu bayar, menaruh bangunan berikut menurut urutan: Api Unggun → Gudang → Gubuk (jika kapasitas ≤ populasi) → bangunan syarat era berikutnya → Sumur → Ladang (sampai ⌈pop/2⌉) → Gubuk cadangan → Dapur/Bengkel → Balai. Riset: memulai tech pertama yang tersedia, hanya jika setelah bayar biaya riset bangunan berikutnya tetap terjangkau. Event: selalu memilih **opsi pertama yang tidak dinonaktifkan** (seperti `tests/balance-sim.test.js`). Pasar (barter manual) **tidak dipakai**.
- **Idle:** tidak membangun/riset; hanya mengklik opsi event pertama (tanpa itu game berhenti pada modal event).
- **Definisi metrik**
  - *Menganggur* = sampel (tiap 1 dtk game) ketika tugas penduduk kosong atau `diam`; penduduk yang tidur dikeluarkan dari penyebut.
  - *Hari datar* = hari tanpa: event, bangunan baru ditaruh atau selesai, riset selesai, kematian, dan tanpa peringatan sumber daya (air habis atau makanan+gandum < 4×populasi). *Rentang membosankan* = ≥3 hari datar berturut-turut.
  - *Terblokir* = bot ingin membangun sesuatu tapi belum mampu bayar (menunggu sumber daya). *Tak ada yang dibangun* = daftar keinginan bot kosong.
  - *Hari stok pangan* = (makanan+gandum)/(pop×2×1,5 saat Dingin), sama dengan `foodPerDay()`.
- Skrip: `/workspace/desa-analisa/sim.js` (harness) dan `analyze.py` (agregasi + grafik); ringkasan mentah `summary.json`.

## 2. Temuan utama

### 2.1 Tidak ada ancaman nyata: 0 kematian dalam 180 run
- **0 kematian dan 0 desa punah** di semua pengaturan (5.400 hari-desa simulasi untuk setiap pengaturan), termasuk Idle.
- Stok pangan minimum (hari ≥8) memang bisa menyentuh 0 (median minimum: Default 4,2 hari; Seimbang 0,25 hari; Fokus kayu 1,4 hari), tetapi tidak pernah menimbulkan kematian: penurunan `HEALTH.starvePerDay` 20/hari baru jalan saat lapar = 0 dan darurat pangan di `chooseTask` (stok < pop×3) segera mengalihkan semua orang ke meramu.
- Setelah hari 60, median stok pangan = **37,7 hari** (Default), **44,8 hari** (Fokus makanan), ~16,6–16,9 hari (Fokus kayu / Seimbang) — jauh di atas `WINTER_BUFFER_DAYS: 8`. Musim Dingin praktis tidak terasa setelah tahun pertama.

![Stok sumber daya](analisa/stok-sumber-daya.png)

### 2.2 Ledakan stok di paruh kedua (hari 60–120)
Median stok di hari 120 (Default): makanan 1.222, gandum 264, kayu 821, batu 290, **air 9.038 (±606 hari kebutuhan per penduduk)**, alat 33. Seimbang: air 25.905 (1.407 hari/penduduk). Air adalah anomali terbesar: penalti `FOOD_SURPLUS_PENALTY` (25) saat air ≥ `WATER_SURPLUS_DAYS` (8) hari hanya membuat skor air 2×10−25 = −5, tetapi tugas air tetap dipilih bila tugas lain juga terkena penalti/tak tersedia, dan sumur menghasilkan 4 air per 5 dtk kerja. Kayu juga berkumpul hingga ~0,96× batas lunak `RES_SOFT_CAP.kayu` per 2 penduduk (Default) dan 1,48× pada Fokus kayu.

### 2.3 Populasi & waktu era

![Populasi](analisa/populasi.png)
![Waktu era](analisa/waktu-era.png)

| Pengaturan | Dusun (median hari, P25–P75, tercapai) | Desa Pertanian | Kota Kecil | Pop hari 60 | Pop hari 120 |
|---|---|---|---|---|---|
| Default | 16,5 (14–19,75) 30/30 | 61 (56–71) 29/30 | 86,5 (83–96,5) 26/30 | 5,5 | 15 |
| Fokus makanan | 17 (16–20) **27/30** | 51 (45–59,5) 27/30 | 82 (76–88) 27/30 | 7 | 16 |
| Fokus kayu | **42** (39–47) 30/30 | 66 (63–72) 29/30 | 103 (97–108) 27/30 | 5 | 13 |
| Fokus batu | 19 (17–30,25) 30/30 | 56 (56–57) 30/30 | 84 (77–86,75) 30/30 | 7 | 16 |
| Seimbang | 18 (17–19) 30/30 | **43,5** (41–48,75) 30/30 | **73,5** (71,25–80,5) 30/30 | 8 | 18 |
| Idle | tidak pernah | tidak pernah | tidak pernah | 2 | 2 |

- **Softlock Fokus makanan:** 3/30 run (seed 4, 5, 11) macet di Perkemahan selama 120 hari dengan 2 penduduk dan hanya Api Unggun/Gudang — kayu (prioritas 1) tidak pernah cukup untuk Gubuk (20 kayu). Pemain nyata mungkin akan menyadari, tetapi game tidak memberi sinyal.
- **Fokus kayu menunda Dusun ke hari 42:** median stok batu hari 15–40 hanya 5 (Gubuk butuh 5 batu, Sumur 15) karena batu prioritas 1.
- **Seimbang (semua 2) adalah strategi tercepat** di semua era dan tidak pernah terblokir (0,1% hari) — artinya `DEFAULT_PRIO` justru lebih lambat ±17 hari ke Desa Pertanian daripada "tidak ada prioritas".
- **Idle tidak pernah tumbuh** (pop 2 seumur run: tanpa Gubuk, `capacity()` = 0) tetapi juga tidak pernah mati; makanan menumpuk ke 501.

### 2.4 Event
Rata-rata **20,1–22,9 event per run** (≈1 per 5,5 hari; konsisten dengan `EVENT_CHANCE_PER_DAY: 0.18` mulai hari 3). Terbanyak (Default, total 30 run): wabah 64, badai 63, festival_desa 56, hewan_buas 55, hujan_meteor 53, anak_hilang 49. `panen_raya` hanya 9 (0,3/run), event era lanjut 4–18 masing-masing. Karena bot memilih opsi pertama dan tak ada yang mematikan, event tidak pernah mengubah lintasan secara berarti.

![Frekuensi event](analisa/frekuensi-event.png)

### 2.5 Waktu menganggur penduduk rendah
Rata-rata hanya **2,3–2,8%** waktu bangun dihabiskan menganggur di semua pengaturan — AI selalu menemukan pekerjaan (sering pekerjaan yang tidak berguna, lihat air). Jadi masalahnya bukan penduduk diam, tetapi **pemain** yang tidak punya keputusan.

![Waktu menganggur](analisa/waktu-menganggur.png)

### 2.6 Rentang membosankan
| Pengaturan | % hari datar | Rentang ≥3 hari / run | Rentang terpanjang (median / maks) | % hari "tak ada yang dibangun" | % hari terblokir |
|---|---|---|---|---|---|
| Default | 47,9 | 8,1 | 9 / 20 | 56,4 | 24,2 |
| Fokus makanan | 49,6 | 8,3 | 9 / 22 | 49,1 | 31,5 |
| Fokus kayu | 52,9 | 9,1 | 10 / 23 | 76,2 | 5,9 |
| Fokus batu | 51,5 | 9,2 | 9 / 13 | 54,6 | 23,9 |
| Seimbang | 51,2 | 9,6 | 9 / 13 | 77,3 | 0,1 |
| Idle | 79,8 | 12,1 | 16 / 32 | 100 | 0 |

Hampir separuh hari tidak berisi keputusan. Garis waktu menunjukkan dua pola: (a) hari 1–40 rentang datar karena menunggu kayu/batu (terblokir), (b) setelah Kota Kecil (~hari 75–90) daftar bangunan habis (hanya Balai) dan stok terus naik — setelah itu hanya event yang memutus kebosanan.

![Garis waktu hari datar](analisa/garis-waktu-datar.png)
![Perbandingan prioritas](analisa/perbandingan-prioritas.png)

Semua run menyelesaikan seluruh 8 tech yang ada (median 8) sebelum hari 120 — konten riset juga habis.

## 3. Rekomendasi numerik (urut dampak)

1. **Hadirkan risiko nyata di Dingin.** Ubah `WINTER_HUNGER_MULT` dari **1.5 ke 2.0** dan `GRANARY_WINTER_HUNGER_MULT` dari **1.25 ke 1.6**; tambahkan pembusukan stok (mis. makanan −2%/hari di atas 20 hari stok, sesuai arah `RISET-MUSIM-ANCAMAN.md` §2.5). Alasan: 0 kematian di 180 run, stok pasca-hari 60 median 37,7 hari vs target 8.
2. **Hentikan ledakan air.** Naikkan `FOOD_SURPLUS_PENALTY` dari **25 ke 40** (sehingga skor prioritas 3 = 30−40 < 0) *atau* jadikan air ≥ `WATER_SURPLUS_DAYS` sebagai larangan keras; pertimbangkan `WATER.wellYield` **4 → 3**. Alasan: median air hari 120 = 9.038 (Default) s.d. 25.905 (Seimbang).
3. **Perbaiki `DEFAULT_PRIO`.** Ubah ke `{ bangun: 3, makanan: 2, bertani: 2, air: 2, kayu: 2, batu: 2, riset: 1 }` (makanan 3 → 2). Alasan: Seimbang mencapai Desa Pertanian hari 43,5 vs 61 Default, Kota Kecil 73,5 vs 86,5, populasi hari 120 18 vs 15, tanpa kematian. (Perlu run ulang untuk konfirmasi nilai persis ini — belum disimulasikan.)
4. **Cegah softlock kayu.** Turunkan biaya `gubuk.cost.kayu` dari **20 ke 15**, atau tambahkan lantai di AI: bila tidak ada Gubuk dan kayu < biaya Gubuk, kayu diperlakukan sebagai darurat seperti makanan. Alasan: 3/30 run Fokus makanan macet 120 hari di Perkemahan; Fokus kayu menunda Dusun ke hari 42 karena batu 5.
5. **Konten akhir/tujuan setelah Kota Kecil.** Daftar bangunan habis ~hari 75–90 dan 100% run menyelesaikan 8 tech; "tak ada yang dibangun" 56–77% hari. Prioritaskan T09–T20 (sudah direncanakan di `tech.js`) dan bangunan baru dari `RISET-MUSIM-ANCAMAN.md` §3. Tambahan konsumsi pasif: aktifkan konsumsi kayu bakar musim Dingin (`api_kayu_bakar` sudah ada kuncinya) untuk menyerap stok kayu ~820.
6. **Kurangi rentang datar dengan event.** Naikkan `EVENT_CHANCE_PER_DAY` dari **0.18 ke 0.25** setelah era Dusun, dan naikkan bobot `panen_raya` dari 0.35 hanya bila ada ancaman penyeimbang. Alasan: median rentang datar terpanjang 9 hari (maks 20–23) bahkan dengan ~22 event/run.
7. **Era ke-3 terlalu cepat bila stok menumpuk.** Biarkan `ERAS[3].req.foodDays` (12), tetapi naikkan `ERAS[3].req.res.alat` dari **5 ke 10**: median alat di hari 120 = 33–60, sehingga syarat alat tidak berarti.

## 4. Keterbatasan & perbedaan sim vs game nyata
- Satu peta saja (seed peta di-hardcode `rng(12345)` di `newGame`).
- Bot tidak memakai Pasar/pedagang secara manual, tidak memilih opsi event secara cerdas (selalu opsi pertama yang aktif), tidak menempatkan bangunan secara estetis/optimal, dan tidak mengubah prioritas di tengah permainan. Pemain nyata yang aktif kemungkinan lebih cepat; pemain pasif lebih lambat.
- Quest, tutorial, pencapaian, render, dan `menuOpen` tidak memengaruhi simulasi (step dipanggil langsung). Kecepatan 1×; langkah 0,1 dtk sama dengan game.
- Penyebab kematian sudah diinstrumentasi (kelaparan/air/kesehatan/pergi), tetapi tidak ada kematian untuk diklasifikasikan. Penduduk yang "meninggalkan desa" via event juga tidak terdeteksi (opsi pertama tidak pernah berefek `penduduk` negatif).
- Mekanik dari `RISET-MUSIM-ANCAMAN.md` (serigala malam nyata, kebakaran, banjir) yang belum ada di kode tentu tidak tersimulasi; hanya event teks yang ada.
- Rekomendasi #3 dan nilai baru lain **belum** divalidasi dengan run ulang; disarankan menjalankan ulang `sim.js` setelah perubahan.
- **Penting — kode sedang berubah:** setelah snapshot diambil, `balance.js` di working tree (belum di-commit) sudah mendapat tambahan `SEASON_FX`, `YEAR_SCALE`, `FAMINE`, `THREAT` (serigala), dan bangunan pagar/obor/menara jaga/makam. Analisa ini **tidak** mencakup perubahan itu. Rekomendasi #1 (ancaman Dingin) dan #6 (event) mungkin sebagian sudah dijawab oleh pekerjaan tersebut; jalankan ulang `sim.js` (salin ulang snapshot) setelah fitur ancaman masuk ke `game.js` untuk mengukur dampaknya.
