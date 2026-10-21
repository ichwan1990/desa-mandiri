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
Tes memakai tema bawaan (Nusantara); `threats.test.js` menguji tema empat musim lewat `?tema=sedang`. Tes gagal (exit code 1) bila ada error di konsol. Screenshot disimpan di `docs/screenshots/`.

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

- Setelah Gudang selesai (dan utuh), tumpukan di tanah disembunyikan: barang dianggap tersimpan di gudang, dan gudang diberi penanda isi (1–3 peti + karung, 4 tingkat menurut total stok). Bila gudang hancur (hp 0) atau dibongkar, tumpukan muncul lagi di api unggun/pusat kemah. Hanya tampilan; penduduk memang sudah menyetor ke gudang. Screenshot `v8-stockpile-sebelum.png`, `v8-stockpile-gudang.png`.
## Tema Nusantara (tahap 7, `docs/RISET-INDONESIA.md`)
Tema bawaan sekarang **Nusantara**; tema empat musim lama tetap ada (buka `index.html?tema=sedang`). Semua perbedaan antar-tema ada di `tema.js`, game.js hanya membaca `CONFIG`.
- **Musim** (1 tahun = 28 hari): Musim Hujan 9 hari → Pancaroba Mareng 5 → **Musim Kemarau 9 (musim sulit)** → Pancaroba Labuh 5. `season()` dihitung kumulatif dari `SEASON_LEN`; `isHardSeason()` = kemarau. Tanpa salju.
- Efek digerakkan oleh isi `SEASON_FX`: hujan (60% hari hujan, banjir maks 2×, kayu bakar 2/hari, pembusukan ×1.5, padi tumbuh lebih cepat), mareng (panen raya, hitung mundur stok kemarau, syukuran, masuk angin), kemarau (lapar ×1.4, air ×1.5, sumur −1, sungai ×0.6, kekeringan, terik tanpa caping), labuh (hujan pertama, masuk angin).
- **Padi**: id internal tetap `gandum` (simpanan & misi tetap cocok), label tampil "Padi". Ladang (tegalan) bergiliran padi, jagung, padi, ubi, padi, singkong; padi berhenti di kemarau kecuali riset Irigasi (T04, lalu ×1.5 lebih lama), tanaman tegalan tetap tumbuh (×1.25). Padi digambar di atas tile sawah (autotile 4-bit).
- **Babi hutan** menggantikan serigala (kode serigala dipakai ulang): jejak sore → dengusan → masuk desa → pergi saat fajar. Sasaran utama ladang (1–2 petak rusak); melukai penduduk baru mulai era Dusun, serangan fatal hanya tahun ke-2+. Pertahanan: Pagar Bambu (jalur ×3, langkah melambat), Oncor (peluang serang & rusak ladang ×0.4), Pos Ronda + prioritas Jaga (kentongan mengusir 1×/malam).
- **Hari Jadi Desa** hanya muncul tepat di ulang tahun desa (hari 29, 57, …), sekali per tahun.
- Teks: TEKS v1.4.0+ sudah Nusantara, jadi semua event aktif lagi (musim event lama dipetakan: dingin→kemarau dst.); path `THEMES.indonesia.TXT` diisi otomatis dari `meta.txt_tema_nusantara` (termasuk pembuka musim hujan/mareng/labuh). Tema `?tema=sedang` memuat `TEKS-GAME.json` terbaru (v1.5) lalu menimpanya dengan overlay `TEKS-TEMA-sedang.json` (259 string empat musim: musim, serigala, dingin; dibuat oleh `tools/buat_overlay_sedang.js`, format `__byId`/`__byIdx`). `TEKS-GAME-sedang.json` (v1.3) dihapus. Teks ancaman/cuaca yang dulu ditulis langsung di game.js kini lewat `THEMES.*.TXT` (`TT()`), ikon ancaman dari `TERMS.ikon` (🐗/🐺).
- Sawah padi tampak kering (lumpur retak) di kemarau bila belum riset irigasi T04; ikon Padi sementara `assets/icons/resources/icon_padi.png` (dibuat `tools/buat_ikon_padi.py`, menunggu ikon resmi). Bilah atas menampilkan `👥 2 (belum ada rumah)` sebelum ada gubuk.

### Perbaikan & tuning (sebelum siklus hidup)
- Tugas `bangun` kini memperbaiki bangunan rusak sampai hp 100 (dulu langsung dibuang bila bangunan sudah jadi → gubuk hp<40 kehilangan kapasitas selamanya).
- Rawat: tidak ada lemparan maut sakit parah pada hari mulai sakit atau selama ada yang sedang merawat (tes `threats` dulu gagal ±1/8).
- Pengaman: hari ≥ 6 tanpa gubuk jadi → bangun gubuk yang sudah ditaruh / kumpulkan kayu-batu yang kurang.
- Tuning teruji Asisten Analisa (wolf & babi hutan): `killChanceIfLowHp` 0.25, `killSafeRadius` 4, `severeDeathPerDay` 0.15, `starvePerDay` 30, `foodFreeDays` 16. Sim 31 run hari 24: Nusantara median 28, empat musim 44.
- Ringkasan hari yang dilompati (debug/tes) diberi label rentang ("Hari 16–19"). Tes: `tests/perbaikan.test.js`.
- Sprite tropis tahap 7: varian musim `seasons/tropis/<musim>/`, cuaca (hujan lebat + kilat, debu & tint kemarau, bayang awan labuh), gubuk bambu, lumbung padi, pos ronda, pagar bambu, obor bambu, babi hutan, kunang-kunang malam (`ASSET_SWAP` di tema).

## Siklus hidup & hubungan (`docs/RISET-SIKLUS-HIDUP.md`, `docs/RISET-CERITA-TUJUAN.md`)
- **Jadwal tidur 21:00–05:00** (`SCHEDULE`). Agar produktivitas siang tetap sama seperti sebelum ada tidur, kerja dan langkah di siang hari dikali `SCHEDULE.dayWorkMult`/`daySpeedMult`: 1.35 di Nusantara (`balance.js`), 1.2 di empat musim (`THEMES.sedang.SCHEDULE_PATCH` di `tema.js`). Malam: penduduk masuk rumah, lampu rumah padam saat semua penghuni tidur, ada Zzz di atap, animasi pintu tropis disembunyikan, dan kunang-kunang dibuat lebih terang (halo + 28 ekor di sekitar pohon/semak yang tampak).
- **Umur & keluarga** (`AGE`, `PAIRING`, `PREGNANCY`): bayi → anak → remaja → dewasa → lansia, mati tua mulai 60 th. Berpasangan butuh hubungan ≥ 50 + syarat `PAIRING`. Hamil (keputusan desain 17-10): boleh sejak era Perkemahan asal pasangan punya rumah bersama (`needHome`), pangan ≥ 5 hari, status pangan aman/waspada, dan masih ada tempat tidur. Kenop: `PREGNANCY.chancePerDay` 0.15, `cooldownDays` 35, `PAIRING.chancePerDay` 0.25, `gain.serumahMalam` 3 (sim v3 Asisten Analisa). Panel penduduk menampilkan keluarga, sifat, dan hubungan. Muncul `emote_cinta` saat pasangan terbentuk.
- **Hubungan** (`RELATION`, salinan spes §1.2): skor −100..+100. Tingkat: rival ≤ −30, kenalan, teman ≥ 20, sahabat ≥ 50, lalu pasangan/keluarga. Kenaikan maksimal +6/hari per pasang. Skor naik dari kerja bareng, duduk di api unggun malam, ronda, makan bareng, dan merawat; turun pelan bila tidak berinteraksi. Skor awal: sesama pendiri 25, pendatang 0 (+15 bila ada yang `ramah`, +5 bila `jujur`), orang tua–anak 60, saudara 50. Duka saat ada yang meninggal sebanding dengan hubungan. **Tambahan di luar spes:** `gain.serumahMalam: 3` (awalnya 2) (tidur serumah), karena tanpa itu skor tidak pernah mencapai 50 di sim.
- **Sifat** (`TRAITS`, 20 id dari TEKS v1.5.0 `sifat`): 2 sifat + 25% sifat ketiga (muncul di umur 16), tanpa pasangan sifat yang bertentangan. Pendiri tanpa malas/pemarah/pemurung dan punya minimal satu sifat kerja. Pendatang memakai `meta.peta_sifat_penduduk`. Sifat bayi turunan orang tua, disembunyikan ("?") sampai umur 8. Ikon tahap 8b (`trait_<id>_16`, `rel_<tingkat>_16`). Efek sifat sudah diterapkan: kerja (`workMult`, `jobMult`, sendirian/malam/bantu, religius Jumat), lapar (`hungerMult`), energi, mood harian + aura (periang, seniman di api unggun), gosip & kejahilan (jahil), hadiah (dermawan), konflik (rel < 0, pemarah ×2, rival ×2), sambutan pendatang (ramah), panen (`yieldAdd`), ancaman (penakut/pemberani), duka, dan pengaruh hubungan pada kerja (teman ×1.05 / sahabat ×1.10 / rival ×0.95) dan mood. Cerita, keinginan, dan dilema **belum** (milestone B).
- Darurat pangan kini juga menanam (bila petak tertanam < pop/3), tidak hanya memanen/meramu. Sebelumnya ladang bisa kosong dan desa kolaps di akhir permainan.
- Tata letak 900–1560px: panel samping tetap 280px, tidak ada overflow atau tumpang-tindih (dites).

### Milestone A (sisa + uji perangkat)
- **Rawat melewati malam**: pasien yang sedang dirawat mendapat `sick.underCareUntil` (berlaku sampai fajar berikutnya) dan progres rawat (`careWork`) disimpan, jadi lemparan maut fajar tidak bergantung pada perawat yang masih memegang tugas saat tidur.
- **Hujan labuh** (Nusantara): `SEASON_FX.labuh` tidak punya `rainBushRegrowMult`/`chopTimeMultRain`, jadi saat hujan labuh regrow semak dan waktu tebang menjadi NaN (semak mati permanen, penebang macet). Kunci ditambahkan, dan kode memakai cadangan `|| 1` (juga `extremeHungerMult`, `extremeMoodDecayMult`).
- **Tumbuh tanaman** tidak pernah negatif (kekeringan/banjir/event dijepit ≥ 0); jagung tetap tumbuh di kemarau (×1.25 lebih lambat).
- **Tata letak**: tinggi kanvas = tinggi jendela − bilah atas (min `VIEW_MIN_H` 360, maks 800), panel samping ikut; halaman tidak bergulir. Di bawah `TOPBAR_COMPACT_W` (1500px) bilah atas ringkas: label disembunyikan (ikon + tooltip), tombol bangun membungkus ke baris baru; juga otomatis ringkas bila bilah penuh > `TOPBAR_MAX_H` (80px, mis. 1500–1599px); maks 2 baris di lebar 900. Panel penduduk ditaruh di bawah bilah atas (`--topH`), bilah atas di atas panel (z-index), jadi Pasar/Pencapaian/Simpan/Muat tetap bisa diklik.
- **Aset 8c**: ikon Padi `icon_padi_ikat.png`, sawah kering `sawah_kering_autotile.png` (menggantikan sawah kering prosedural, tanpa kilau air), padi layu `crop_padi_kering.png` di sawah kering kemarau.
- **Tema empat musim**: `TRAITS_PATCH.founderNeedOneOf = null` (aturan pengaman §5.1, d24 > 48) dan `dayWorkMult` 1.2 → 1.12.
- Tes: `tests/perbaikan-a.test.js` (rawat lintas malam, jepit tumbuh, efek sifat, syarat hamil, tata letak 768/860/900, panel penduduk vs tombol bilah atas, teks ancaman).
- Sim lama (sebelum perbaikan NaN semak labuh): lahir pertama median hari 51. Sim milestone A (`node balance-sim.test.js 20 140`): lahir pertama median hari 34 (rentang 28–94), pop median d40 5, d80 10, d140 17, 0 mati selain tua, 0 pergi, 0 kolaps. Pembanding aturan Dusun + pangan 5 hari (10 run, cooldown 21): median 42, pop d140 18. Hari 120 (10 run): pangan median 875, air 480. Hari 24 (31 run): pangan median Nusantara 45, empat musim 38.
- Tes: `tests/siklus-hidup.test.js` (screenshot `v6-night.png`, `v6-family.png`).

## Cerita & tujuan P0 (`docs/RISET-CERITA-TUJUAN.md`, TEKS v1.5.0)
- **Data di `cerita.js`** (dimuat sesudah `balance.js`, sebelum `tema.js`): `DIRECTOR`, `MOMEN_KECIL`, 12 `DILEMMAS` P0, `AGUSTUSAN`, `STORY_SINK`, `MONKEY`. Mesin di `game.js` (blok "CERITA P0").
- **Juru Cerita**: cek sekali sehari jam 09:00; hari yang sudah bermakna (event, bangunan/riset selesai, lahir, wafat, naik hubungan, akibat tertunda, Agustusan) dibiarkan. Peluang isi menurut hari kosong beruntun (`fill` 0.75/0.95/1.0; spes 0.60/0.90/1.0, dinaikkan karena keinginan/rantai P1 belum ada). Maks 1 dilema & 2 popup per hari, jeda ≥ 6 jam.
- **Dilema**: kartu `ui/dilemma` (ringan/berat, potret ekspresi, chip reaksi sifat, ⏳ akibat tertunda). Opsi pertama selalu aman. Akibat tertunda di `S.pending` (diundi pagi saat jatuh tempo; bila syarat belum terpenuhi menunggu ≤ 28 hari). Utang rentenir: tagihan, bunga 20%/7 hari, sita setelah 2× telat.
- **Momen kecil**: 12 momen tanpa biaya (mood/hubungan), ulang ≥ 21 hari (≥ 10 bila stok habis).
- **Agustusan** (hari 18/20/21 tiap tahun): kartu panitia (pilih lomba, umbul-umbul ×3/×6), malam tirakatan (tumpeng tahun 2+), upacara, 4 lomba (balap karung, makan kerupuk, tarik tambang, panjat pinang) di lapangan dekat api unggun dengan dekorasi 8b, juara umum + ikon piala 14 hari. Tahun 1 gratis 2 lomba.
- **Penyerap pangan** (arahan Ketua: cerita P0 tidak menambah pangan bersih): kenduri tiap 2 hari bila stok > 15 hari (60% kelebihan; v9: bentuk bergantian kenduri / syukuran / sedekah ke desa tetangga), tasyakuran panen akhir mareng, syukuran lahir, pesta 17-an tahun 2+, tikus lumbung (~1% gandum/hari), monyet pencuri (Nusantara), biaya dilema. Musim tanpa panen (empat musim: dingin) dicadangkan dulu. Kait `monumenFoodPerWorkerDay` untuk monumen P1.
- **Sifat & duka**: reaksi sifat atas keputusan, pelit −1 mood tiap pengeluaran ≥ 10, pandai_masak pesta ×0.9, seniman mood festival ×1.25, duka pribadi (keluarga +3 hari ×1.5, sahabat +2 hari, pasangan ×1.5), suka_menolong duka anak ×1.3.
- **Tema empat musim**: Agustusan & monyet mati, dilema/momen khas Nusantara dimatikan (`STORY_DISABLE`), musim dipetakan (`STORY_SEASON_ALIAS`).
- Sim (`balance-sim`): d24 median Nusantara 38, empat musim 42 (31 run). Hari 120 (10 run) Nusantara: pangan 875 → 472, pop 16, 0 mati selain tua; empat musim 381. Hari 140 (20 run): pop 17, lahir pertama 35. Cakupan hari bermakna sejak hari 15: median 93%, maks 2 hari kosong beruntun.
- Tes: `tests/cerita.test.js` (screenshot `v8-dilema.png`, `v8-agustusan.png`).

## Pangan v9 (permintaan Ichwan 21-10)
- **Satu angka Pangan** di bar atas: `Pangan 75 · 18 hari` (Makanan + Padi/Gandum), warna mengikuti tingkat kelaparan; tooltip merinci Makanan + Padi, konsumsi/hari, dan pangan masuk hari ini.
- **Teks melayang per sumber**: `+9 Padi`, `+7 Jagung`, `+4 Ikan`, `+3 Jamur` dengan ikon sumber (aset tahap 9 `pangan_ikon`).
- **Tooltip ladang** (arahkan kursor / ketuk): tanaman, tahap, progres %, perkiraan hari panen, hasil, dan alasan berhenti tumbuh (kemarau tanpa irigasi, musim dingin, banjir, belum jadi). Juga Kolam Ikan/Tambak, pohon buah, umbi, jamur.
- **Ringkasan harian**: pangan masuk per sumber dan keluar (dimakan, busuk, kenduri, tikus, ...), plus selisih bersih.
- **Sumber pangan liar** (`CONFIG.FOOD_SOURCES` di `balance.js`, otomatis di prioritas Makanan; warga memilih sumber dengan hasil per detik terbaik):
  memancing di tepi sungai (3–5 ikan × musim, ×1,3 saat hujan, stok sungai 10/hari, maks 2 pemancing), mencari jamur di bawah pohon rimbun (banyak di hujan/labuh, hampir nol di kemarau),
  pohon buah (mangga, rambutan, pisang, kelapa; musim masing-masing), umbi hutan, keong sawah di padi yang berair, buah semak +2–3 (dulu +1).
  **Kolam Ikan** (Dusun, kayu 20 batu 15, 10 ikan/hari) dan **Tambak** (Desa Pertanian, 18 ikan/hari) — sumber ikan yang tetap jalan di kemarau.
  Tema empat musim (`FOOD_SOURCES_PATCH` di `tema.js`): memancing (dingin ×0,4) dan jamur (gugur) tetap ada, umbi liar menggantikan umbi hutan, tanpa pohon buah tropis & keong.
- **Pendatang & daya tarik desa**: syarat 12 hari stok pangan + tempat tidur kosong + mood ≥ 65 tiga hari. Desa bahagia (rata-rata mood ≥ 70 selama 4 hari) menaikkan peluang (0,4 → 0,75/hari) dan memperpendek jeda (×0,85), dengan log “Kabar desa yang bahagia sampai ke kampung sebelah… Seorang perantau ingin tinggal.” Jeda bertambah 0,6 hari per penduduk. Panel Era menampilkan **Daya tarik desa** (mood, desa bahagia, stok pangan, tempat tidur, jeda).
- Start makanan 14 → 20 (tanpa ini pangan habis di hari ke-3 sebelum hasil liar pertama), `FOOD_SURPLUS_FACTOR` 1,0 → 0,8.
- Sim (`balance-sim`), sebelum → sesudah: min pangan hari 2–24 median 0 → 15–17 (Nusantara) / 0 → 8–13 (empat musim); d24 median Nusantara 31 (15 run), empat musim 47 (20 run).
  140 hari × 10: Nusantara pangan d120 486, pop d40/80/140 = 5/8/13 (maks 16); empat musim d120 437, pop 4/8/13 (maks 16). Sebelumnya pop d140 median 20.
- **v9b (Ketua 21-10)** — desa bahagia harus diperjuangkan: rata-rata mood ≥ 80 selama 5 hari berturut-turut **dan** tidak ada warga < 50 (panel Daya tarik: “Desa bahagia 3/5 hari”, warga murung ditandai).
- **v9c (uji perangkat Ichwan 21-10 @98960a0)** — tanpa input mood dulu jatuh 70 → 0 di hari 7 (sim bot langsung membangun api & gubuk, jadi tak terlihat). Kini: tanpa api/rumah mood hanya turun ke `MOOD_BARE.floor` 40 (hujan tanpa atap & bangun tidur di luar tak menekan di bawah 36, kecuali dingin musim sulit; api unggun menyala = penalti hujan separuh); warga menaruh **api unggun sendiri di hari 2** dan **gubuk pertama di hari 4** bila kepala desa belum menaruh apa-apa (`AUTO_BUILD`); pangan diutamakan bila stok < 4 hari (sedikit dimiringkan < 5 hari); makan porsi kecil (`MEAL_AT` 60) dan angka hari di lencana dihaluskan ±0.35 hari; masa awal tetap tampil *bahaya* bila < 1 hari (tanpa penalti mood); `#res` hanya ditulis ulang bila berubah; event Pendatang Mengetuk hanya muncul bila bisa disambut; babi hutan/serigala tanpa sasaran mengendus dulu ±12 dtk (dulu lenyap seketika); teks melayang bertumpuk naik & kayu/batu/air pakai format pangan (+4 Kayu); pangan dari kejadian/cerita/hadiah/rusak berlabel di ringkasan. Tes menunggu `window.DESA_READY`, bukan jeda tetap. Tes baru `v9c.test.js` dan `alami.test.js` (loop asli ×40, 15 hari tanpa input). Sim: `SIM_NOINPUT=1` + baris KURVA MOOD hari 2–15.
  Batas nyaman mood (`MOOD_COMFORT`): api unggun & rumah hanya menaikkan mood sampai 62 + rumah 6 + pasangan 2 + pangan ≥ 12 hari 4 + dapur 2 + sumur 2 (+ monumen); di atasnya (kenduri, festival, sahabat, sifat) turun 0,07/detik. Tema sedang base 64.
  Makan porsi kecil lebih sering (`MEAL_AT` 50: makan saat lapar ≤ 50 bila stok ≥ 1 hari) → stok tidak turun berundak 7/orang tiap 3 hari.
  Tema sedang: semua dilema/momen P0, Festival Panen (tanpa bendera merah-putih) dan rubah pencuri aktif (TEKS v1.5.1/v1.6.0); ikon jagung & rambutan (aset 9b); nama/log tugas pangan dari `pangan.tugas.<id>`.
  Sim 140 hari × 10: desa bahagia aktif median 36% hari (Nusantara) / 39% (sedang); pendatang median 6/run (min 5); d24 33 / 38; d120 489 / 449; pop d40/80/140 5/8/13 / 5/8/12.
- Tes: `tests/pangan.test.js` (screenshot `v9-pangan.png`, `v9-memancing.png`).

## Struktur file
```
index.html          Tata letak & UI
balance.js          SEMUA angka balancing (CONFIG) — ubah di sini untuk tuning
cerita.js           Data cerita P0: Juru Cerita, dilema, momen kecil, Agustusan, penyerap pangan (CONFIG)
tema.js             Tema/bioma: musim (nama, panjang, SEASON_FX), tanaman, ancaman malam, sprite & teks per tema (bawaan: indonesia)
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
