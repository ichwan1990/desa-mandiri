# Riset Tahap 3 — Desa Mandiri

Acuan utama: **The Little Land** (progresi tidak langsung, faith/charm ≈ tech + pasar, run yang tetap tegang). Pendukung: Banished (rantai musim), Kingdoms and Castles (prioritas & perdagangan), RimWorld (ancaman bertingkat / achievement-like stories).

Sasaran tahap 3: isi **era Desa Pertanian & Kota Kecil** supaya tidak “menang otomatis” setelah lumbung+pasar, tanpa mengubah fantasi kepala-desa (penduduk tetap otonom).

---

## 1. Pohon teknologi (20 node)

### Cara kerja
- Dibuka lewat **Balai Desa** (era Kota Kecil) atau **meja riset** di Dusun (node awal saja).
- Pemain pilih node; penduduk dengan prioritas `riset` (baru) mengerjakan selama `work` detik game (bisa diganggu needs).
- Biaya dibayar di muka dari stok desa. Prasyarat = node sebelumnya **atau** era minimum.
- Efek bersifat permanen (seperti charm Little Land yang “nempel”), bukan buff 1 hari.

### Cabang
`bertahan` · `produksi` · `masyarakat` · `perdagangan`

### Daftar node

| id | Nama | Era min | Prasyarat | Biaya | Work | Efek |
|----|------|---------|-----------|-------|------|------|
| T01 | Api Terjaga | perkemahan | — | kayu 15 | 40 | Api unggun: radius mood +50%, kayu bakar −20% |
| T02 | Keranjang Anyam | perkemahan | — | kayu 20 | 50 | `CARRY.makanan` +1, `CARRY.kayu` +1 |
| T03 | Cangkul Kayu | dusun | T02 | kayu 25, batu 10 | 60 | Ladang: `plantTime` & `harvestTime` −20% |
| T04 | Irigasi Sederhana | dusun | T03 | kayu 30, batu 20 | 80 | `FIELD.growDays` −1.0; butuh sumur dalam 12 tile |
| T05 | Pengawetan | dusun | T01 | kayu 20, makanan 15 | 70 | Busuk/penalty musim hujan −; winter hunger mult −0.1 |
| T06 | Dapur Hemat | dusun | T05 | kayu 25, batu 15 | 70 | `KITCHEN_EAT_BONUS` 0.25→0.40 |
| T07 | Bajak Besi | desa_pertanian | T03, alat≥3 | kayu 20, batu 30, alat 2 | 100 | `FIELD.yieldMin/Max` +3 |
| T08 | Lumbung Bertingkat | desa_pertanian | T05 | papan 20, batu 25 | 90 | Soft-cap makanan naik; winter buffer UI −1 hari warning lebih awal tetap |
| T09 | Bibit Unggul | desa_pertanian | T04, T07 | gandum 30, makanan 20 | 110 | 15% panen jadi “panen bagus” (+50% hasil petak itu) |
| T10 | Parit Air | desa_pertanian | T04 | batu 40, papan 10 | 100 | `WATER.perDayPerPop` 1→0.85; sumur +1 yield |
| T11 | Gerobak | desa_pertanian | T02 | kayu 40, papan 15 | 90 | Kecepatan angkut +20%; jarak kerja efektif +2 tile |
| T12 | Tempa Baja | desa_pertanian | bengkel | batu 40, kayu 30, alat 3 | 120 | `TOOLS.bonus` 0.25→0.40; wear −30% |
| T13 | Pakaian Hangat | desa_pertanian | T05, kulit≥5 | kulit 8, kayu 15 | 80 | `WINTER_HUNGER_MULT` −0.2; mood dingin jauh lebih baik |
| T14 | Pasar Resmi | desa_pertanian | pasar dibangun | papan 25, batu 20 | 90 | Buka UI perdagangan penuh + 1 slot kontrak |
| T15 | Timbangan | desa_pertanian | T14 | batu 15, alat 1 | 60 | Harga jual +5%; fee pasar − |
| T16 | Papan Pengumuman | kota_kecil | balai | papan 20 | 50 | Quest harian +1; log cerita +flavor |
| T17 | Sekolah Desa | kota_kecil | T16, pop≥10 | kayu 50, papan 30, batu 20 | 140 | `SKILL_GAIN` ×1.5; pendatang punya skill dasar +0.1 |
| T18 | Dinding Bata | kota_kecil | T12, batu_bata≥40 | batu_bata 40, batu 30 | 150 | Kerusakan bangunan dari event −40%; mood rasa aman + |
| T19 | Gudang Bea | kota_kecil | T14, T15 | papan 40, batu_bata 20 | 120 | Slot kontrak pasar +1; stok dagang minggu +20% |
| T20 | Festival Adat | kota_kecil | T16, T13 | makanan 40, gandum 20 | 100 | 1×/tahun: mood +25, spawn cooldown −2 hari selama 7 hari |

**Urutan buka yang disarankan play:** T01/T02 → T03→T04 → T05→T06/T13 → T07→T09 → T14→T15 → T12→T18 → T17/T20.

**Jangan** buat tech yang menghapus musim dingin atau spawn tanpa batas — Little Land tetap menegangkan karena power terbatas; tech kita = “charm”, bukan god mode.

---

## 2. Sistem perdagangan pasar

### Kapan aktif
- Bangunan **Pasar** selesai → perdagangan otomatis harian sederhana tetap ada (`MARKET_DAILY`).
- Tech **T14 Pasar Resmi** → UI perdagangan + pedagang terjadwal + fluktuasi harga.
- Tech **T19** → kontrak mingguan.

### Mata uang implisit
Tidak perlu gold terpisah di V3: tukar **barter** dengan kurs mengambang. Kayu/batu/makanan/gandum/alat/papan/batu_bata saling bisa ditukar lewat tabel harga dalam unit **nilai** (internal `value`).

### Harga dasar (value per 1 unit)

| Item | Value jual | Value beli | Catatan |
|------|------------|------------|---------|
| makanan | 3 | 5 | Selalu mahal dibeli |
| gandum | 2 | 4 | |
| kayu | 1 | 2 | |
| batu | 1.2 | 2.2 | |
| papan | 3 | 5 | |
| batu_bata | 3 | 5 | |
| alat | 12 | 18 | Langka |
| kulit | 4 | 7 | |

Pemain **menjual** ke pasar dapat `value jual × qty × priceMod`.  
Pemain **membeli** membayar dengan stok lain yang dijumlah value-beli-nya.

### Fluktuasi `priceMod`
- Baseline 1.0.
- Tiap pagi: `priceMod[item] *= random(0.92, 1.08)`, lalu clamp **0.7–1.4**.
- Musim:
  - dingin: makanan/gandum jual +25%, beli +40% (susah beli makanan)
  - semi: kayu jual −10% (banyak orang tebang)
  - panas: makanan jual −15% (melimpah)
- Event:
  - setelah Panen raya: makanan/gandum jual −20% selama 5 hari
  - setelah Badai/kekeringan: makanan beli +30% selama 5 hari
  - pedagang keliling: 1 hari `priceMod` beli −10% (diskon)
- Soft pressure late game: jika `foodDays > 20`, value jual makanan turun bertahap sampai 0.6 (mencegah print-money dengan spam ladang).

### Kuota harian pasar
- Desa Pertanian: jual max value 40/hari, beli max 30/hari.
- Kota Kecil: 70 / 50.
- +T19: ×1.25.

### Kontrak (opsional V3.1)
Contoh: “Kirim 40 gandum dalam 10 hari → dapat 6 alat”. Gagal: mood −10. Mirip quest Little Land / merchant orders.

---

## 3. Daftar pencapaian (18)

Tampilkan di Balai / menu; beri **judul + deskripsi pendek + reward kecil** (resource atau tech discount 10% sekali).

| id | Nama | Syarat | Reward |
|----|------|--------|--------|
| A01 | Api Pertama | Bangun api unggun | mood +5 sekali |
| A02 | Atap di Kepala | Bangun gubuk pertama | — |
| A03 | Lumbung Bukan Impian | Stok makanan+gandum ≥ 40 | kayu +10 |
| A04 | Musim Dingin Pertama | Bertahan sampai akhir dingin Y1 tanpa kelaparan kritis | suasana desa + | 
| A05 | Tetangga Baru | Populasi ≥ 3 | — |
| A06 | Petani Sejati | Panen ladang pertama | gandum +5 |
| A07 | Air Jernih | Bangun sumur | — |
| A08 | Dusun Raya | Capai era Dusun | papan +5 (jika sudah bisa) / kayu +15 |
| A09 | Desa Menguning | Capai era Desa Pertanian | alat +1 |
| A10 | Kota Kecil | Capai era Kota Kecil | batu_bata +10 |
| A11 | Pedagang Datang | Selesaikan 5 transaksi pasar | value bonus hari itu |
| A12 | Tanpa Lapar 30 Hari | 30 hari berturut foodDays ≥ 5 | T05 diskon 25% jika belum |
| A13 | Ahli Batu | Tambang 200 batu kumulatif | CARRY batu +1 permanen kecil |
| A14 | Peneliti Desa | Riset 5 node tech | makanan +20 |
| A15 | Dinding Tegak | Selesai T18 | mood +10 |
| A16 | Festival Pertama | Picu T20 / event festival | — |
| A17 | Seratus Hari | Capai hari 100 | judul kosmetik |
| A18 | Desa Mandiri | Pop ≥ 12, foodDays ≥ 14, 10 tech, 0 kematian 50 hari | ending lembut + badge |

Pencapaian = lapisan “cerita” ala log Little Land, bukan mandatory checklist.

---

## 4. Balancing era 3–4 & late game

### Masalah yang dihindari
Setelah pasar+lumbung, makanan dan value menumpuk → keputusan kosong (kebalikan Little Land yang tetap limenergy/ancaman).

### Kurva target

| Era | Pop | foodDays nyaman | foodDays “aman dingin” | Tekanan utama |
|-----|-----|-----------------|------------------------|---------------|
| Desa Pertanian | 6–9 | 6–10 | 10–14 | air, alat aus, event hewan/badai, harga makanan musim dingin |
| Kota Kecil | 10–16 | 8–12 | 12–16 | perbaikan bangunan bata, kontrak pasar, wabah, cold snap, upkeep tech |

### Angka usulan tambahan (`balance.js`)

```js
// Era 3+ pressure
LATE: {
  fromEra: 'desa_pertanian',
  toolWearMult: 1.35,          // alat lebih cepat aus
  eventChancePerDay: 0.22,     // sedikit lebih sering dari early 0.18
  winterHungerMultExtra: 0.15, // ditambah ke WINTER_HUNGER_MULT jika era>=desa & tahun>=2
  marketFoodSellSoftCapDays: 16, // di atas ini harga jual makanan turun
  buildingUpkeepEveryDays: 14, // konsumsi kayu/batu kecil untuk perbaikan pasif
  upkeep: { kayu: 2, batu: 1 }, // per 5 bangunan selesai
},
SPAWN_LATE: { // mulai desa_pertanian
  foodDaysPerPop: 12,
  cooldownDays: 10,
  minMood: 70,
},
FIELD_LATE: { // max ladang efektif sebelum diminishing
  softCapFieldsPerPop: 0.6,  // > ini yield ×0.7
},
```

### Loop late-game yang tetap seru (pinjam Little Land)
1. **Ancaman musiman naik** — tahun 2+: `musim_dingin_keras` bobot naik; zombie/hewan buas boleh diganti event “hama gudang” / “longsor”.
2. **Keputusan perdagangan** — jual murah sekarang vs simpan untuk dingin (harga fluktuatif).
3. **Tech vs ekspansi** — batu_bata & alat diperebutkan untuk T18/T12 vs rumah baru.
4. **Penduduk baru mahal** — spawn lebih ketat; tiap orang = mulut + happiness management.
5. **Goal lunak** — achievement A18 / festival, bukan win-screen kaku; pemain boleh lanjut infinite dengan tekanan upkeep.

### Yang tidak diubah dari tahap 2 (sudah sehat)
- Nerf produksi liar & ladang early.
- Event food rewards kecil + panen_raya terbatas musim.
- Soft cap batu **skala per penduduk** (pertahankan).

---

## 5. Prioritas implementasi (untuk Asisten Koding)

**P0:** fluktuasi harga pasar + kuota (setelah bangunan Pasar); 8 tech pertama (T01–T08) + prioritas kerja `riset`.  
**P1:** sisa tech T09–T20; achievement A01–A12; `LATE` pressure.  
**P2:** kontrak pasar; achievement sisanya; UI pohon tech di Balai.

## 6. Catatan untuk Asisten Dokumen (teks)

Perlu nama/deskripsi ID untuk: 20 node tech, 18 achievement, tooltip harga pasar, pesan fluktuasi (“Harga gandum naik karena musim dingin”), gagal/ sukses kontrak, dan log saat riset selesai (“Sari menyelesaikan riset Irigasi Sederhana”). Bahasa: hangat, singkat, sesuai TEKS-GAME.json.

---

*Dokumen riset tahap 3 — angka final tetap di-playtest lewat `tests/balance-sim.test.js` (perpanjang ke hari 80+).*

---

*Tindak lanjut QC 2026-10-23 (§8: balance S-07/S-08 & regrow T-01) ada di `docs/RISET-QC-TINDAKLANJUT.md`.*
