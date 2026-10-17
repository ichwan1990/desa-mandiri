# Riset Mekanik — Desa Mandiri

**Referensi utama: [The Little Land](https://store.steampowered.com/app/4296120/The_Little_Land/)** (RasterCat, Early Access Okt 2026) — strategy god-sim 2.5D.  
Referensi pendukung: Banished, RimWorld, Kingdoms and Castles, The Settlers/Townscaper (pola sekunder).  
Diselaraskan dengan [KONSEP.md](./KONSEP.md).

---

## 0. The Little Land — fokus utama

### Inti fantasy & alur
- Pemain = **dewa / penjaga**, bukan mikromanajer klik-unit.
- **Littles tidak bisa dikomando langsung** untuk membangun; mereka gather resource dan mengembangkan desa sendiri.
- Tujuan: jaga desa bertahan selama mungkin (run/survival length), bukan “menang kondisi kemenangan klasik”.
- Alur tipikal satu hari: Littles bekerja → ancaman muncul → pemain pakai kekuatan terbatas → malam/ancaman naik → doa/faith terkumpul → upgrade kemampuan / pasang charm.

### Mekanik kunci yang membuatnya menarik
1. **Otonomi penuh penduduk** — menonton mereka hidup adalah gameplay; intervensi pemain bersifat *tidak langsung*.
2. **Energy/kemampuan terbatas** — kamu bukan mahakuasa (Wind mengalihkan makhluk, Rainfall heal, Plant Growth percepat tanaman, Earth Tremor slow). Keputusan *kapan* pakai power terasa penting.
3. **Faith → skill tree** — doa harian jadi progresi dewa, custom playstyle.
4. **Artifacts → Charms di Altar** — kombinasi item = replayability (tiap run beda).
5. **Ancaman bertingkat + warning** — slime, babi hutan, undead/zombie malam, demon, Giant Cat (Me-ow); indikator bahaya (lingkaran merah) sebelum eskalasi.
6. **Musim, cuaca, siang-malam** memengaruhi kerja dan gather.
7. **Peran Littles** — Farmer (ladang, tanaman butuh waktu), Gatherer (prioritas panen dekat), Warrior, dll.; Attractiveness/Charm memengaruhi siapa yang datang.
8. **Resource & loss condition** — kelaparan = penyebab collapse paling umum; terlalu banyak kematian menguras **Reverence** (kekalahan jangka panjang). Ada perdagangan (Salt), merchant, mercenary.
9. **QoL observasi** — minimap lokasi Littles, toggle nama/HP, notifikasi resource.

### Gaya visual (untuk desain)
- **Bukan** pixel art top-down kaku; resmi digambarkan **strategy god-sim 2.5D** (pandangan miring/isometrik-ish), solo-dev stylized.
- Mood: **cute, cozy, charming**, desa mungil di tanah kecil; kontras ancaman oversized (kucing raksasa, slime) vs penduduk kecil → humor + empati.
- World: vegetasi hijau, bangunan desa sederhana, altar/tempat ibadah sebagai focal point, efek cuaca (hujan, sparkle saat tanaman tumbuh).
- UI: bersih; resource popup; indikator ancaman di tanah; nama/HP bisa di-toggle.
- Palet kesan umum dari materi resmi: hijau alam hangat, langit cerah/gelap dinamis, aksen magical lembut pada skill dewa.
- **Implikasi untuk Desa Mandiri:** KONSEP.md menyebut pixel 32×32 top-down. Dua opsi:
  - **A (dekat Little Land):** 2.5D/isometric stylized cute, kamera miring, proporsi “kecil dan manis”.
  - **B (tetap pixel sesuai konsep):** top-down 32×32, tapi **curi mood**-nya — siluet jelas, palet hangat, kontras skala ancaman vs penduduk, altar/balai sebagai pusat visual, efek cuaca & malam yang dibaca cepat.

### Yang TIDAK perlu ditiru mentah di V1 Desa Mandiri
- Combat dewa penuh / skill tree faith yang dalam (kecuali Ichwan ingin pivot ke god-sim).
- Roguelike charm crafting kompleks.
- Boss day-9 style (boleh menyusul sebagai event).

### Yang WAJIB dipinjam (selaras KONSEP.md)
- Penduduk **bekerja otomatis**; pemain atur prioritas / tempat / respons event (bukan klik-per-unit).
- Observasi menyenangkan: nama, log harian, lihat mereka makan/tidur/kerja.
- Musim + siang-malam mempengaruhi produksi.
- Ancaman/event dengan peringatan, bukan sudden death.
- Pertumbuhan desa organik; kelaparan & rumah sebagai gerbang populasi.

### Mapping Little Land → Desa Mandiri

| Little Land | Adaptasi Desa Mandiri |
|-------------|------------------------|
| God powers (wind, rain, plant growth) | Prioritas kerja desa + (opsional) “keputusan kepala desa” terbatas per hari |
| Faith / Reverence | Mood desa + reputasi / kestabilan |
| Charms / artifacts | Quest reward atau teknologi era (ringan) |
| Farmer / Gatherer roles | Skill + job priority (bertani, kumpul, tebang…) |
| Salt / merchants | Pedagang keliling (sudah di konsep) |
| Me-ow / slimes | Event hewan buas / badai (skala ringan, bukan ARPG) |
| Altar | Balai desa / api unggun sebagai pusat sosial |

---

## 1. AI penduduk yang terasa hidup

### Pola dari game sejenis

| Game | Model AI | Inti |
|------|----------|------|
| **Banished** | State machine + needs | Saat antrian aksi kosong, pilih ulang. Needs mendesak (dingin → lapar → sakit → pakaian → alat) mengalahkan kerja. Kerja dipilih dari urgensi pekerjaan + jarak. |
| **RimWorld** | ThinkTree (priority) + Work priorities 1–4 | Evaluasi berurutan: emergency → needs → work. Pemain mengatur prioritas jenis kerja per pawn. Semua pekerjaan prioritas 1 habis dulu sebelum prioritas 2. |
| **Kingdoms and Castles** | Career priority list global | Pemain mengurutkan karier desa. Pekerja mengisi karier teratas sampai kuota minimum terpenuhi, lalu turun. Bisa buka/tutup karier atau bangunan. |
| **The Settlers** | Carrier + production chain | Penduduk khusus (porter) mengantar barang; bottleneck di jalur/transport sering jadi “drama” yang terasa hidup. |

**Rekomendasi untuk Desa Mandiri (web, 2 penduduk awal):** hybrid sederhana — **Needs override + Village Job Priority + Utility skor jarak/skill**.

### Loop keputusan (tiap ~0,5–1 detik game, atau saat job selesai)

```
1. Jika Lapar ≥ kritis  → makan (cari makanan terdekat / di rumah)
2. Jika Energi ≤ kritis → tidur di rumah / api unggun
3. Jika Suasana hati sangat rendah & ada hiburan → istirahat singkat (opsional era awal: duduk di api)
4. Jika ada job darurat desa (padamkan api, larikan dari hewan) → kerjakan
5. Ambil job dari daftar prioritas desa yang:
   - slot-nya masih terbuka
   - sumber daya/target tersedia
   - skor = prioritas_desa * 100 − jarak * 2 + skill * 5 + (bonus jika job = skill tertinggi)
6. Jika tidak ada job → idle / kumpulkan buah liar terdekat (fallback laborer)
```

### Agar terasa “hidup” (bukan robot)

- **Interrupt needs:** kerja dibatalkan jika lapar/energi menembus ambang kritis di tengah jalan.
- **Personality ringan:** bias kecil (lebih suka bertani vs menebang) ±10% pada skor utility.
- **Animasi & log:** “Sari lapar, berhenti menebang”, “Budi tidur di gubuk”.
- **Jangan path terlalu jauh:** jika rumah > N tile dari tempat kerja, efisiensi turun (pelajaran Banished).
- **Skill naik pelan** saat job selesai → pemain melihat spesialisasi muncul sendiri.

### UI prioritas desa (pemain = kepala desa)

Slider/urutan drag-and-drop mirip Kingdoms and Castles, default awal:

1. Makanan (kumpul buah, ikan, ladang)
2. Kayu
3. Bangun / perbaiki
4. Batu
5. Angkut ke gudang
6. Hiburan / lain-lain

---

## 2. Angka balancing awal (usulan V1)

Asumsi: 1 hari game ≈ 2–3 menit nyata @1x; 4 musim × 7 hari = 28 hari/tahun (bisa disesuaikan). Angka di bawah untuk **2 penduduk awal**, peta kecil.

### Kebutuhan penduduk (per orang)

| Meter | Max | Turun per hari | Ambang “kritis” | Aksi |
|-------|-----|----------------|-----------------|------|
| Lapar | 100 | −25 s/hari (±1%/jam jika 24 jam/hari) | ≤ 25 | Wajib makan (~+40 per porsi) |
| Energi | 100 | −20 s/hari (lebih cepat jika kerja berat) | ≤ 20 | Tidur 8 jam game → penuh |
| Suasana hati | 100 | −5 s/hari dasar; −15 jika lapar/dingin | ≤ 30 | Idle di api / event positif |

**Konsumsi makanan:** ~1 porsi / orang / hari. Stok aman musim dingin ≈ `penduduk × 10 hari` (target buffer sebelum musim dingin).

### Produksi awal (tanpa bangunan khusus)

| Aksi | Durasi | Hasil | Catatan |
|------|--------|-------|---------|
| Ambil buah semak | 8–12 dtk | +2–3 makanan | Semak respawn 2–3 hari |
| Memancing di sungai | 15–20 dtk | +2 makanan | Butuh berdiri di tile air |
| Tebang pohon | 20–30 dtk | +5 kayu | Pohon regenerasi lambat / tanam ulang era lanjut |
| Tambang batu permukaan | 25–35 dtk | +3 batu | |

### Panen ladang (setelah bangunan Ladang)

| Fase | Durasi | Catatan |
|------|--------|---------|
| Tanam | 1 hari | Butuh 1 pekerja |
| Tumbuh | 5–6 hari (musim semi–panas) | Tidak tumbuh di musim dingin |
| Panen | 1 hari | Auto saat matang atau paksa di musim gugur |
| Hasil | 20–30 makanan / petak kecil | 1 petak “cukup” untuk ~2 orang jika ada 2 petak |

### Biaya bangunan (kayu / batu / waktu bangun oleh 1 orang)

| Bangunan | Kayu | Batu | Waktu | Efek |
|----------|------|------|-------|------|
| Api unggun | 5 | 0 | 15 dtk | Masak sederhana, mood+, titik kumpul |
| Gubuk (kap. 2) | 20 | 5 | 60 dtk | Tidur & simpan makanan rumah |
| Gudang | 30 | 10 | 90 dtk | Kapasitas stok bersama |
| Ladang (1 petak) | 10 | 0 | 40 dtk | Produksi makanan musiman |
| Sumur | 15 | 15 | 70 dtk | Air bersih, mood+ |
| Tempat penebangan | 25 | 5 | 80 dtk | +efisiensi tebang di radius |
| Tambang | 20 | 10 | 90 dtk | +efisiensi batu |
| Dapur | 35 | 15 | 100 dtk | Ubah bahan mentah → makanan lebih bergizi (+mood) |

### Syarat penduduk baru (lahir / pendatang)

Semua harus terpenuhi (AND):

1. **Makanan surplus:** stok ≥ `penduduk × 8` hari (aman), dan produksi 7 hari terakhir ≥ konsumsi.
2. **Rumah kosong:** ada slot tidur kosong di gubuk/rumah.
3. **Mood desa rata-rata ≥ 60** selama 3 hari.
4. **Cooldown:** minimal 5–7 hari sejak kedatangan/kelahiran terakhir.
5. Era Perkemahan: max +1 pendatang event; kelahiran mulai Era Dusun.

Kegagalan klasik Banished: bangun rumah terlalu cepat tanpa buffer makanan → kelaparan. Tunjukkan peringatan UI: “Stok makanan hanya untuk X hari”.

---

## 3. Progresi era

| Era | Penduduk tipikal | Dibuka | Fokus |
|-----|------------------|--------|-------|
| **1. Perkemahan** | 2–4 | Api, gubuk, gudang kecil, kumpul liar, pancing | Bertahan, belajar needs |
| **2. Dusun** | 5–8 | Ladang, sumur, penebangan, tambang, dapur | Produksi teratur, musim pertama penuh |
| **3. Desa Pertanian** | 9–15 | Lumbung, rumah kayu, bengkel alat, pakaian | Rantai produksi, surplus musim dingin |
| **4. Kota Kecil** | 16+ | Pasar, balai desa, PACS-like dekor, pedagang rutin | Perdagangan, quest, prestige |

**Syarat naik era (contoh):** populasi min + bangunan kunci + stok makanan ≥ N hari + (opsional) selesaikan 1 quest era.

---

## 4. Event yang seru (bukan cuma hukuman)

| Event | Frekuensi | Efek | Keputusan pemain |
|-------|-----------|------|------------------|
| **Panen raya** | Musim panas jarang | +50% hasil ladang 1 musim | Tidak ada; rayakan di log |
| **Pedagang keliling** | Tiap 10–15 hari | Tukar kayu/batu ↔ makanan/alat | Setujui barter / tolak |
| **Pendatang** | Jika syarat penduduk hampir terpenuhi | +1 dewasa berketerampilan acak | Terima (butuh rumah+makanan) / tolak |
| **Badai** | Musim hujan/dingin | Kerja luar −50%, mood− | Tarik prioritas ke dalam ruangan |
| **Hewan buas** | Jarang | 1 penduduk takut/terluka ringan; makanan hilang sedikit | Alihkan prioritas “jaga” / beri makan hewan (opsional) |
| **Musim dingin panjang** | 1× / beberapa tahun | Musim dingin +3 hari | Butuh stok ekstra |
| **Wabah ringan** | Sangat jarang (era 3+) | −energi, kerja lambat 3 hari | Isolasi / istirahat wajib |
| **Batu besi ditemukan** | Sekali | Log cerita + buka teknologi bengkel lebih awal | — |

Prinsip RimWorld: event = **cerita + pilihan**, bukan RNG yang membunuh tanpa peringatan. Selalu beri tanda 1 hari sebelumnya bila memungkinkan (“Awan gelap mendekat”).

---

## 5. Lima fitur yang paling membuat ketagihan

**Utama dari The Little Land**, dilengkapi Banished / RimWorld / KC:

1. **Menonton kehidupan otonom** — penduduk bekerja sendiri; pemain campur tangan tidak langsung (The Little Land).
2. **Resource terbatas + konsekuensi** — energy/keputusan kepala desa terbatas; kelaparan & kematian terasa (Little Land Reverence / food collapse).
3. **Survival musim & malam** — stok makanan, cuaca, ancaman malam (Little Land + Banished).
4. **Pertumbuhan berisiko** — penduduk baru = tenaga + mulut lapar; rumah & surplus sebagai gerbang.
5. **Cerita mikro + event dengan peringatan** — nama, log harian, ancaman yang bisa diantisipasi (Little Land warnings + RimWorld story).

Bonus visual Townscaper: **pembangunan yang enak dilihat** (tile rapi, asap dapur, malam berlantern) membuat “satu putaran lagi” meski desa sudah aman.

---

## 6. Saran implementasi V1 (untuk Asisten Koding)

**Harus ada di prototipe:**
- 2 penduduk, needs Lapar/Energi, AI needs-override + 1 job (kumpul buah / tebang).
- Api unggun + gubuk, siang/malam, pause/1x/2x.
- Stok kayu & makanan di UI.

**Boleh menyusul:**
- Prioritas desa drag-and-drop, musim, ladang, event pedagang, penduduk ke-3.

**Hindari di V1:**
- Combat kompleks, pathfinding multi-agent berat, ekonomi pasar penuh, skill tree dalam.

**Tuning tip:** expose konstanta balancing di satu file `balance.js` (laju lapar, hasil panen, biaya bangunan) agar mudah diubah tanpa sentuh AI.

---

## Sumber

- [The Little Land Steam](https://store.steampowered.com/app/4296120/The_Little_Land/) & [ModDB](https://www.moddb.com/games/the-little-land) — fantasi god-sim, otonomi Littles, seasons, charms, threats
- Steam community / patch notes demo The Little Land — Farmer/Gatherer, Rainfall, Plant Growth, minimap, Day 10 demo length
- Banished Wiki — AI state/needs, food ~100/warga/tahun, housing & winter
- RimWorld Wiki / ThinkTree docs — work priorities, emergency vs normal jobs
- Kingdoms and Castles community — career priority queue & minimum staffing
- Pola The Settlers — production chain & porters
- Townscaper — kepuasan membangun visual tanpa tekanan (ambil aspek estetika saja)

*Dokumen riset untuk prototipe Desa Mandiri — bukan desain final. Angka balancing V1 perlu playtest.*
