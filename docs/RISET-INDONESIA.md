# Riset Nuansa Indonesia — Musim, Flora, Fauna

Arah dari Ichwan: musim empat-musim diganti **musim Indonesia** (tanpa salju), flora dan fauna khas Nusantara supaya tidak monoton. Dokumen ini **memetakan ulang** sistem yang sudah ada (`SEASON_FX`, `THREAT.wolf`, `FIRE`, `FLOOD`, `SICKNESS`, `FAMINE`, `SIKLUS-HIDUP`) agar angka balancing yang sudah dites tetap bisa dipakai.

Acuan: pranata mangsa Jawa (labuh–rendheng–mareng–ketiga), pola musim BMKG (hujan ±Nov–Mar, kemarau ±Mei–Sep, pancaroba di antaranya), praktik desa agraris Jawa Timur (sawah, tegalan, pekarangan). Gaya tetap cozy ala The Little Land.

---

## 1. Siklus musim

### Urutan & panjang (1 tahun game tetap 28 hari)

| # | id | Nama tampil | Padanan lama | Hari | Nuansa |
|---|----|-------------|--------------|------|--------|
| 1 | `hujan` | Musim Hujan (Rendheng) | semi + sebagian dingin | **9** | Tanam padi, banjir, longsor, diare/DBD |
| 2 | `mareng` | Pancaroba Kemarau (Mareng) | gugur | **5** | Panen raya padi, angin kencang, persiapan stok |
| 3 | `kemarau` | Musim Kemarau (Ketiga) | dingin + panas | **9** | Musim "sulit": sawah berhenti, air surut, kebakaran |
| 4 | `labuh` | Pancaroba Hujan (Labuh) | — (baru) | **5** | Hujan pertama, angin, hama, penyakit, mulai tanam |

Total 28 hari, tahun tetap sama dengan `YEAR_SCALE.daysPerYear`. Game dimulai di **awal labuh** atau **hari 1 hujan** (disarankan hujan: pemain langsung belajar menanam).

```js
SEASONS: ['hujan', 'mareng', 'kemarau', 'labuh'],
SEASON_LEN: { hujan: 9, mareng: 5, kemarau: 9, labuh: 5 },  // ganti SEASON_DAYS tunggal
SEASON_NAMES: { hujan: 'Musim Hujan', mareng: 'Pancaroba (Mareng)', kemarau: 'Musim Kemarau', labuh: 'Pancaroba (Labuh)' },
HARD_SEASON: 'kemarau',   // pengganti isWinter(): fungsi isHardSeason()
```

Catatan kode: `season()` perlu menghitung kumulatif dari `SEASON_LEN`. Kalau mau perubahan paling kecil dulu, boleh sementara pakai 7 hari tiap musim; efek di bawah tetap berlaku.

### Efek per musim

**Hujan (9 hari)**
| Efek | Angka | Pengganti dari |
|------|-------|----------------|
| Padi sawah tumbuh cepat | `growDays` padi −1.0, `plantTime` ×0.85 | semi |
| Hari hujan | 60% hari; mood luar −2/hari jika tanpa atap (bukan +), semak/buah regrow ×0.85 | semi.rainChance |
| Banjir | 0.10/hari (maks 2×/musim), tepi sungai 2 kolom, 1 hari | FLOOD |
| Longsor | 0.04/hari di tile dekat bukit/batu; bangunan dalam radius 2 hp −30 | event `tanah_bukit_bergeser` |
| Kayu bakar | api unggun/dapur makan **2 kayu/hari** (malam lembap, asap usir nyamuk) | dingin.campfireWoodPerDay |
| Kayu basah | tebang ×1.10 waktu saat hujan | semi |
| Diare | lihat §1.3 | — |
| DBD | lihat §1.3 | — |
| Ikan sungai | hasil pancing ×1.3 | — |

**Mareng (5 hari)**
| Efek | Angka |
|------|-------|
| Panen raya | bobot `panen_raya` ×1.5 (tetap maks 1×/tahun; hadiah sesuai nerf TAHAP3 §7) |
| Angin kencang | 0.10/hari: bangunan bambu/gubuk hp −15, kerja luar ×0.8 sehari |
| Persiapan kemarau | peringatan stok mulai hari ke-2 mareng: target `HARD_BUFFER_DAYS` 8 (tahun 2+: 10) |
| Syukur panen | foodDays ≥ 10 di akhir mareng: mood +8 sekali (pengganti `thanksMood`) |
| Masuk angin | sakit ringan 0.02/hari per penduduk mood <50 |

**Kemarau (9 hari) — musim sulit**
| Efek | Angka | Pengganti dari |
|------|-------|----------------|
| Sawah berhenti | padi **tidak tumbuh** tanpa irigasi (tech `T04`); dengan irigasi growDays ×1.5 | dingin: tanaman berhenti |
| Tanaman tegalan | jagung, singkong, ubi tetap tumbuh, growDays ×1.25 | — |
| Lapar/kerja berat | hunger ×**1.4** (sebelumnya dingin 2.0, tapi musim 9 hari: total beban setara) | WINTER_HUNGER_MULT |
| Air cepat habis | `WATER.perDayPerPop` ×1.5 | panas.waterMult |
| Sumur surut | `wellYield` −1 (3→2); di kemarau panjang −2 | baru |
| Sungai menyusut | `riverYield` ×0.6, ikan ×0.5 | baru |
| Kekeringan | 0.12/hari (maks 1×), 3 hari: tegalan growDays +1 | panas.drought |
| Kebakaran | malam 0.06 bila ada dapur/bengkel; **siang 0.04** di tile semak/ilalang kering dekat bangunan | FIRE |
| Panas terik | di luar siang tanpa **caping**: mood −4/hari; dengan caping −1 | dingin.clothesMoodPerDay |
| Kemarau panjang (El Niño) | 0.10 per tahun mulai tahun 2: kemarau +3 hari | event `musim_dingin_keras` |
| Gagal panen | tanaman yang tumbuh saat kekeringan: 20% hasil ×0.5 | `embun_beku` |

**Labuh (5 hari)**
| Efek | Angka |
|------|-------|
| Hujan pertama | 30% hari; air sumur pulih +1 yield; mood +5 sekali ("bau tanah basah") |
| Mulai tanam | padi `plantTime` ×0.9; benih yang ditanam di akhir labuh siap di pertengahan hujan |
| Angin kencang / puting beliung | 0.08/hari (pengganti `badai`), hp bangunan ringan −20 |
| Hama | wereng/tikus: 0.10/hari, 1 petak siap −50% hasil (dicegah bebek & kucing) |
| Penyakit | DBD mulai (lihat §1.3), masuk angin 0.02/hari |
| Buah musim | mangga berbuah (labuh) → rambutan (hujan) |

### 1.1 Pemetaan ulang mekanik musim dingin

| Dulu (dingin) | Sekarang | Counter baru |
|---------------|----------|--------------|
| Stok makanan untuk musim dingin | **Stok untuk kemarau** (sawah berhenti 9 hari) | Lumbung, tanam singkong/jagung tahan kering, gaplek (`T05`) |
| Kayu bakar api unggun | **Kayu bakar musim hujan** (malam lembap + asap nyamuk) | Simpan kayu kering di gudang sebelum hujan |
| Pakaian hangat (kulit) | **Caping & kendi** untuk panas terik kemarau; kulit tetap untuk tikar/alat | `T13` diganti "Caping & Kendi" |
| Dingin ekstrem | **Kemarau panjang / gelombang panas** + banjir besar sebagai lawan kutubnya | Sumur dalam, embung, tanggul |
| Sakit karena dingin | **Diare & DBD** (hujan), ISPA asap (kemarau), masuk angin (pancaroba) | Sumur, rebus air, kerja bakti 3M |
| Tidur di luar −12 saat dingin | Tidur di luar **saat hujan** −10 + peluang sakit +0.05 | Rumah, api, rumah panggung |

```js
SEASON_FX: {
  hujan:   { padiGrowAdd: -1.0, plantTimeMult: 0.85, rainChance: 0.60, rainNoRoofMood: -2, regrowMult: 0.85,
             floodChance: 0.10, floodMax: 2, landslideChance: 0.04, landslideHp: 30, campfireWoodPerDay: 2,
             chopTimeMultRain: 1.10, fishMult: 1.3, sleepOutsideMood: -10, sleepOutsideSick: 0.05 },
  mareng:  { panenRayaWeightMult: 1.5, windChance: 0.10, windHp: 15, windWorkMult: 0.8, hardWarnFromDay: 2,
             thanksFoodDays: 10, thanksMood: 8, chillSickChance: 0.02 },
  kemarau: { padiStops: true, padiIrrigatedGrowMult: 1.5, dryCropGrowMult: 1.25, hungerMult: 1.4, waterMult: 1.5,
             wellYieldAdd: -1, riverYieldMult: 0.6, fishMult: 0.5, droughtChance: 0.12, droughtDays: 3,
             fireNightChance: 0.06, fireDayChance: 0.04, heatMood: { tanpa: -4, dengan: -1 },
             failHarvestChance: 0.20, failHarvestMult: 0.5 },
  labuh:   { rainChance: 0.30, wellRecover: 1, firstRainMood: 5, plantTimeMult: 0.9, windChance: 0.08, windHp: 20,
             pestChance: 0.10, pestYieldMult: 0.5, chillSickChance: 0.02 },
},
HARD_BUFFER_DAYS: 8,   // pengganti WINTER_BUFFER_DAYS
YEAR_SCALE: { daysPerYear: 28, threatChanceMult: 1.25, hardBufferDays: 10, longDryChance: 0.10, longDryExtraDays: 3 },
```

### 1.2 Pertahanan bencana

| Bangunan/aksi | Era | Biaya | Efek |
|---------------|-----|-------|------|
| `tanggul` (1 tile, sepanjang sungai) | dusun | batu 6, bambu 2 | tile di belakang tanggul tidak kena banjir; 6 tile berurutan = 1 ruas aman |
| `rumah_panggung` (upgrade gubuk) | dusun | bambu 15, kayu 10 | penghuni tidak kena efek banjir & ular; +1 mood/hari di musim hujan |
| `terasering` (tanam bambu di lereng) | dusun | bambu 4 | longsor −70% dalam radius 3 |
| `embung` (kolam tampung) | desa_pertanian | batu 30, kayu 20 | +20 air tersimpan per hari hujan, maks 60; air tidak menguap 50% |
| `sumur_dalam` (upgrade sumur) | desa_pertanian | batu 25, alat 1 | sumur tidak surut di kemarau |
| Sekat bakar (aksi) | — | kayu 10 | sama dengan `FIRE.firebreakKayu` |
| Babat ilalang (job `bersih`) | — | — | tile ilalang kering dekat bangunan hilang → kebakaran siang −80% |

### 1.3 Penyakit musiman

Semua tetap memakai `SICKNESS` (ringan → parah → rawat). Hanya pemicunya yang baru.

| Penyakit | Musim | Pemicu | Peluang | Pencegahan |
|----------|-------|--------|---------|------------|
| Diare | hujan, banjir | minum dari sungai (tanpa sumur) atau hari banjir | 0.04/hari/penduduk | sumur, dapur (air direbus: −70%) |
| DBD | hujan, labuh | ada genangan (tile banjir/ember) dalam 6 tile rumah | 0.015/hari/penduduk; parah 25% | kerja bakti 3M (job `bersih` 1×/7 hari, −80%), asap api unggun −30% |
| ISPA | kemarau | ada kebakaran ≤10 tile dalam 2 hari terakhir | 0.05/hari | padamkan cepat, babat ilalang |
| Masuk angin | mareng, labuh | mood <50 | 0.02/hari | rumah, api, makan cukup |

```js
DISEASE: {
  diare:  { seasons: ['hujan'], riverDrinkChance: 0.04, floodDayChance: 0.04, boilMult: 0.3 },
  dbd:    { seasons: ['hujan', 'labuh'], puddleRadius: 6, chance: 0.015, severeChance: 0.25, cleanMult: 0.2, cleanEveryDays: 7, smokeMult: 0.7 },
  ispa:   { seasons: ['kemarau'], fireRadius: 10, fireDays: 2, chance: 0.05 },
  masukAngin: { seasons: ['mareng', 'labuh'], moodBelow: 50, chance: 0.02 },
},
```

---

## 2. Flora & sumber daya

### Sumber daya baru

| id | Label | Dari | Dipakai untuk |
|----|-------|------|---------------|
| `bambu` | Bambu | rumpun bambu | bangunan ringan (pagar, rumah panggung, tanggul), alat, keranjang; **mengurangi kebutuhan kayu** |
| `kelapa` | Kelapa | pohon kelapa | makanan (diolah dapur), minyak, sabut |
| `minyak` | Minyak kelapa | dapur (2 kelapa → 1) | obor/oncor, masakan (dapur bonus +0.05), dagang |
| `sabut` | Sabut | kelapa (hasil samping) | tali, keset, sapu → material murah untuk alat & bangunan |
| `kopi` | Kopi | kebun kopi | mood (+3 jika ada stok), barang dagang bernilai tinggi |
| `gandum` → label **Padi/Gabah** | — | sawah | id internal tetap `gandum` agar tidak merusak save/quest; ganti label saja |

Harga pasar usulan (jual/beli): bambu 1/2, kelapa 2/3.5, minyak 4/7, sabut 1/2, kopi 5/9.

### Pohon & rumpun (node di peta)

| Flora | Tipe | Hasil per angkut | Regrow | Catatan |
|-------|------|------------------|--------|---------|
| Kelapa | pohon, pesisir/tepi sungai | 2 kelapa (+1 sabut) | 3 hari | tidak ditebang; dipanjat (skill meramu) |
| Pisang | semak besar | 3 makanan | 2 hari | pengganti semak buah utama, cepat |
| Bambu | rumpun | 4 bambu | 2 hari (tumbuh lagi) | sumber bangunan terbarukan |
| Jati | pohon keras | 6 kayu (+bonus papan di bengkel ×1.5) | 10 hari (tanam ulang) | kayu bagus, lambat; tebang berlebihan = lahan gundul |
| Beringin | landmark (1–2 per peta) | tidak bisa ditebang | — | aura mood +0.05/dtk radius 4; titik kumpul; acara desa |
| Mangga | pohon buah | 3 makanan | berbuah di **labuh** saja | panen musiman |
| Rambutan | pohon buah | 3 makanan | berbuah di **hujan** saja | panen musiman |
| Pohon hutan biasa | pohon | 5 kayu | sama seperti `NODE_AMOUNT.kayu` | tetap ada sebagai kayu umum |

### Tanaman ladang (pengganti `gandum`/`wortel`)

| Tanaman | Petak | Res | growDays | Hasil | Musim tumbuh | Peran |
|---------|-------|-----|----------|-------|--------------|-------|
| Padi sawah | `sawah` (butuh dekat sungai/sumur 8 tile) | gandum (Padi) | 7.5 | 8–10 | hujan, labuh, mareng; kemarau hanya irigasi | pangan utama, mudah disimpan |
| Jagung | `ladang` (tegalan) | makanan | 6 | 6–8 | semua; kemarau ×1.25 lebih lama | cepat, tahan kering |
| Singkong | `ladang` | makanan | 10 | 12–14 | semua; kemarau ×1.25 | cadangan kemarau, bisa jadi gaplek |
| Ubi | `ladang` | makanan | 5 | 5–6 | semua | pengisi celah cepat |
| Kopi | `kebun` (era desa_pertanian) | kopi | 14 | 4–6 | semua kecuali kemarau | dagang & mood |

Rata-rata hasil per hari petak dijaga mirip angka lama (gandum 8–10 / 7.5 hari ≈ 1.2/hari): jagung ≈1.17, singkong ≈1.3, ubi ≈1.1, padi ≈1.2. Jadi target pangan d24 (25–50) tidak bergeser.

```js
FIELD: { growDays: 7.5, plantTime: 10, harvestTime: 14, yieldMin: 8, yieldMax: 10,
  crops: {
    padi:     { res: 'gandum', plot: 'sawah', growDays: 7.5, yield: [8, 10], seasons: ['hujan', 'labuh', 'mareng'], irrigatedInHard: true, needWaterTiles: 8 },
    jagung:   { res: 'makanan', plot: 'ladang', growDays: 6, yield: [6, 8], hardGrowMult: 1.25 },
    singkong: { res: 'makanan', plot: 'ladang', growDays: 10, yield: [12, 14], hardGrowMult: 1.25 },
    ubi:      { res: 'makanan', plot: 'ladang', growDays: 5, yield: [5, 6] },
    kopi:     { res: 'kopi', plot: 'kebun', growDays: 14, yield: [4, 6], noGrowIn: ['kemarau'], minEra: 'desa_pertanian' },
  } },
FLORA: {
  kelapa:  { give: { kelapa: 2, sabut: 1 }, regrowDays: 3, chop: false },
  pisang:  { give: { makanan: 3 }, regrowDays: 2 },
  bambu:   { give: { bambu: 4 }, regrowDays: 2 },
  jati:    { give: { kayu: 6 }, regrowDays: 10, papanMult: 1.5 },
  beringin:{ chop: false, moodAura: 0.05, radius: 4, perMap: [1, 2] },
  mangga:  { give: { makanan: 3 }, fruitSeasons: ['labuh'] },
  rambutan:{ give: { makanan: 3 }, fruitSeasons: ['hujan'] },
},
```

### Penggantian bangunan & tech yang ada

| Lama | Usulan | Perubahan |
|------|--------|-----------|
| Ladang | **Sawah** (padi) + **Tegalan** (jagung/singkong/ubi) | sawah butuh air dekat |
| Gubuk | Gubuk bambu (biaya kayu 12 + bambu 8) | lebih murah kayu, lebih rapuh angin |
| Pagar | **Pagar bambu** (bambu 3) | |
| Menara jaga | **Pos ronda + kentongan** | lihat §3 |
| T04 Irigasi | Irigasi sawah (seperti subak) | padi tumbuh di kemarau ×1.5 |
| T05 Pengawetan | **Gaplek & ikan asin** | stok kemarau tidak busuk (SPOILAGE −50%) |
| T10 Parit Air | **Tanggul & parit** | banjir −50% durasi |
| T13 Pakaian Hangat | **Caping & kendi** | panas terik −4 → −1 |
| T20 Festival Adat | **Bersih desa / sedekah bumi** | sama efeknya |

---

## 3. Fauna

### 3.1 Ternak (kandang, era dusun+)

| Ternak | Kandang (biaya) | Pakan/hari | Hasil | Efek khusus |
|--------|-----------------|------------|-------|-------------|
| Ayam | kandang ayam: bambu 8, kayu 5 | 0.2 makanan / ekor | telur 1 tiap 2 hari / ekor (makanan) | makan serangga: hama −20% radius 6 |
| Bebek | kandang bebek: bambu 8 (dekat air) | 0.2 makanan | telur 1 tiap 2 hari | digembala di sawah: hama padi −50% |
| Kambing | kandang: kayu 15, bambu 10 | rumput (gratis di hujan; kemarau 0.5 makanan) | susu/daging +kulit 1 tiap 7 hari | |
| Sapi/Kerbau | kandang besar: kayu 30, bambu 15, era desa_pertanian | 1 makanan di kemarau, gratis musim lain | kulit, daging saat disembelih (pilihan) | **membajak**: `plantTime` sawah ×0.7 (kerbau ×0.6 di sawah) |

Batas: maksimal ternak = 2 × jumlah kandang. Ternak berkembang biak pelan (ayam +1 tiap 10 hari jika ≥2; besar tidak otomatis, beli dari pedagang).

```js
LIVESTOCK: {
  ayam:   { pen: { bambu: 8, kayu: 5 }, feed: 0.2, egg: { every: 2, makanan: 1 }, pestMult: 0.8, pestRadius: 6, breedDays: 10 },
  bebek:  { pen: { bambu: 8 }, feed: 0.2, egg: { every: 2, makanan: 1 }, padiPestMult: 0.5, nearWater: 4 },
  kambing:{ pen: { kayu: 15, bambu: 10 }, feedHard: 0.5, yield: { every: 7, makanan: 2, kulit: 1 } },
  kerbau: { pen: { kayu: 30, bambu: 15 }, minEra: 'desa_pertanian', feedHard: 1, plowMult: { sawah: 0.6, ladang: 0.8 } },
  sapi:   { pen: { kayu: 30, bambu: 15 }, minEra: 'desa_pertanian', feedHard: 1, plowMult: { sawah: 0.7, ladang: 0.7 } },
  perPen: 2,
},
```

### 3.2 Satwa liar

| Satwa | Peran | Angka |
|-------|-------|-------|
| Rusa | buruan di hutan (job berburu) | 4 makanan + 1 kulit per buruan, maks 3 rusa/peta, respawn 6 hari |
| Ikan sungai | pancing di tepi sungai | 2 makanan/angkut; hujan ×1.3, kemarau ×0.5 |
| Burung (pipit, kutilang, bangau) | ambien; pipit makan padi menjelang panen | padi `siap` tanpa orang-orangan: −15% hasil |
| Kupu-kupu | ambien saja (lebih banyak di labuh/hujan, dekat bunga) | tanpa efek gameplay; mood kecil +1 jika dilihat? opsional |
| Kunang-kunang | ambien malam (sudah ada event `kunang_kunang`) | — |

### 3.3 Ancaman (pengganti serigala)

Semua memakai kerangka `THREAT` yang sudah ada (jejak → mendekat → beraksi → pergi, dengan peringatan dini).

| Ancaman | Waktu | Target | Efek | Peringatan | Counter |
|---------|-------|--------|------|------------|---------|
| **Babi hutan** (ancaman utama, menggantikan serigala) | malam | ladang & tegalan, kadang penduduk di luar | 1–2 petak rusak (hasil −100% atau tanaman mati); penduduk tersudut: HP −15–30 | sore: jejak & tanah teraduk di tepi hutan | pagar bambu (path ×3), obor/oncor radius 3, pos ronda |
| **Monyet** (ekor panjang) | siang | pohon buah, petak siap panen, tumpukan stok terbuka | curi 3–8 makanan; tidak melukai | suara gaduh di pohon dekat hutan | orang-orangan sawah, anjing kampung/pos ronda, simpan di gudang tertutup |
| **Ular** (sawah, rumput tinggi) | siang & malam, sering di hujan | penduduk yang bertani/membabat | gigitan → sakit ringan 70% / parah 30% | ikon desis di tile rumput tinggi | babat rumput (job `bersih`), rumah panggung, ayam/kucing di sekitar |
| **Macan tutul jawa** (langka) | malam, tahun 2+ | penduduk di luar dekat hutan | HP −30–50; kematian hanya jika HP <20 & tanpa pos ronda (sama seperti `killChanceIfLowHp`) | 1 hari sebelumnya: log "Ada jejak kucing besar di tepi hutan", kentongan bisa dipukul | pos ronda + kentongan (ia pergi saat kentongan dipukul), obor, tidak keluar malam |

Catatan akurasi: harimau jawa sudah punah, jadi gunakan **macan tutul jawa** (masih ada di hutan Jawa) untuk peta bernuansa Jawa Timur. Harimau sumatera hanya cocok bila peta bertema Sumatra. Pesan cozy: kentongan **mengusir**, bukan membunuh satwa langka.

**Pertahanan baru**

| Bangunan | Era | Biaya | Efek |
|----------|-----|-------|------|
| Pagar bambu | dusun | bambu 3 | path cost babi hutan/macan ×3 |
| Obor/oncor | perkemahan | bambu 1, minyak 1 (atau kayu 3) | radius 3: peluang serangan −60%; isi ulang 1 minyak tiap 2 malam |
| Orang-orangan sawah | perkemahan | bambu 2, sabut 1 | radius 4: monyet & burung −50% |
| Pos ronda + kentongan | desa_pertanian | kayu 20, bambu 15 | radius 10: 1 usir/malam; peringatan dini kebakaran & banjir 0.1 hari lebih awal |
| Anjing kampung (dari event/pedagang) | dusun | 0.3 makanan/hari | monyet −40% & babi hutan −30% di area desa; menggonggong = peringatan |

```js
THREAT: {
  babi:   { minEra: 'perkemahan', injureFromEra: 'dusun', baseNightChance: 0.07, hardMult: 1.3, // kemarau: makanan hutan langka
            warnHoursBefore: 0.15, plotsDamaged: [1, 2], damage: [15, 30], fencePathMult: 3, torchHitMult: 0.4, torchSafeRadius: 3 },
  monyet: { minEra: 'perkemahan', baseDayChance: 0.06, steal: [3, 8], scarecrowMult: 0.5, scarecrowRadius: 4, dogMult: 0.6, closedStorageSafe: true },
  ular:   { baseChancePerFarmDay: 0.01, rainMult: 1.5, severeChance: 0.30, grassClearMult: 0.2, stiltHouseSafe: true },
  macan:  { minYear: 2, baseNightChance: 0.015, warnDaysBefore: 1, damage: [30, 50], killChanceIfLowHp: 0.10, killHpBelow: 20,
            postRadius: 10, kentonganScare: true },
  posRonda: { radius: 10, scarePerNight: 1, earlyWarnFrac: 0.1 },
},
```

Peluang total ancaman malam per hari dijaga setara `THREAT.wolf` (0.05) + sedikit: babi 0.07 tapi efek utama ke tanaman (lebih ringan bagi nyawa), macan 0.015 langka. Monyet siang hanya mencuri. Ular kecil tapi konsisten di musim hujan.

---

## 4. Pemetaan event teks (untuk TEKS-GAME.json)

| Event lama | Usulan baru |
|------------|-------------|
| `badai` | `angin_kencang` / puting beliung (mareng & labuh) |
| `hewan_buas`, `serigala_malam` | `babi_hutan`, `monyet_pencuri`, `jejak_macan` |
| `musim_dingin_keras` | `kemarau_panjang` |
| `kekeringan` | tetap (kemarau) |
| `embun_beku` | `serangan_wereng` / `gagal_panen` |
| `pilek_musim_gugur` | `masuk_angin_pancaroba` |
| `hama_gudang` | `tikus_lumbung` |
| `kerbau_nyasar` | tetap (sudah cocok) |
| `wabah` | `diare` (hujan) & `dbd` (hujan/labuh) |
| `festival_desa` | `bersih_desa` / `sedekah_bumi` |
| baru | `banjir_kiriman`, `longsor`, `ular_di_sawah`, `hujan_pertama` (labuh, positif), `panen_padi_raya` (mareng) |

`EVENT_RULES.panen_raya.musim` → `['mareng']`; `kekeringan` → `['kemarau']`; `angin_kencang` → `['mareng', 'labuh']`.

---

## 5. Balancing & keselarasan

- **Beban pangan musim sulit tetap setara:** dulu dingin 7 hari × hunger 2.0 + tanaman berhenti; sekarang kemarau 9 hari × 1.4 + hanya sawah yang berhenti (tegalan tetap jalan pelan). Tahun 2+ kemarau panjang menambah tekanan.
- **Pangan d24 (target 25–50):** hari 24 jatuh di kemarau hari ke-1 jika mulai di hujan (9+5+9=23). Bagus: sim d24 jadi mengukur "stok masuk kemarau". Jalankan ulang sim setelah migrasi; kalau median turun di bawah 25, naikkan `HARD_BUFFER` warning lebih awal, bukan menambah hadiah.
- **Bambu:** regrow 2 hari membuat kayu tidak lagi bottleneck. Supaya tetap ada pilihan, bangunan penting (balai, lumbung, bengkel) tetap butuh kayu/batu; bambu hanya untuk bangunan ringan.
- **Kelapa & kopi** jadi barang dagang utama pasar → cocok dengan nerf jual pangan (pemain berdagang hasil kebun, bukan spam pangan).
- **Ancaman nyawa** tetap jarang: kematian akibat satwa hanya macan tahun 2+ dengan HP rendah tanpa pos ronda. Kehilangan utama adalah tanaman dan stok (cozy tapi terasa).
- **Siklus hidup:** `PREGNANCY.winterMult` → `hardMult` (kemarau ×0.5); tidur di luar dingin → tidur di luar saat hujan.

### Prioritas implementasi
**P0:** `SEASONS`/`SEASON_LEN`, `isHardSeason()`, efek kemarau & hujan, ganti label padi, crop jagung/singkong/ubi, babi hutan (pakai kode serigala).
**P1:** bambu & kelapa (node + resource), pagar bambu, orang-orangan, monyet, ular, banjir/longsor/tanggul, diare/DBD.
**P2:** ternak & kandang, kopi & kebun, macan tutul + pos ronda/kentongan, rumah panggung, embung, mangga/rambutan musiman, beringin landmark.

---

## 6. Untuk tim

- **Koding:** konstanta di atas; `season()` kumulatif; ganti semua `isWinter()` → `isHardSeason()` dan kunci `semi/panas/gugur/dingin` → `hujan/mareng/kemarau/labuh`; migrasi save (musim lama → hari yang sama di siklus baru); tes ulang sim pangan d24 dan sim 140 hari.
- **Desain:** palet per musim (hujan hijau basah + genangan, mareng kuning padi menguning, kemarau cokelat retak + debu, labuh hijau muda + awan); sprite kelapa, pisang, bambu, jati, beringin, mangga, rambutan, sawah bertingkat, jagung, singkong, ubi, kopi; ternak (ayam, bebek, kambing, kerbau, sapi); satwa (rusa, ikan, burung, kupu-kupu); ancaman (babi hutan, monyet, ular, macan tutul); bangunan (gubuk bambu, rumah panggung, tanggul, pos ronda + kentongan, orang-orangan sawah, obor bambu, kandang, embung). **Tidak ada salju.**
- **Dokumen:** ganti `meta.musim` & pesan pembuka; label sumber daya baru (bambu, kelapa, minyak, sabut, kopi, Padi); teks event baru dan yang diganti (§4); tooltip bangunan & ternak; teks penyakit (diare, DBD, ISPA, masuk angin) yang ramah dan edukatif (mis. 3M), tanpa nada menakutkan.
