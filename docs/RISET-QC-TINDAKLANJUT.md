# Riset — Tindak lanjut QC 2026-10-23

Lanjutan `RISET-TAHAP3.md` (§1–§6). Nomor bagian dibuat §8 sesuai permintaan tindak lanjut QC. Sumber data: `village-game-QC/QC-LAPORAN-2026-10-23.md` (temuan S-07, S-08, T-01) dan log `bukti/bsim-long-nus.log`, `bsim-long-sed.log`, `bsim-noinput-nus.log`, `trees-indonesia-5.json`, ditambah tabel v4 di `ANALISA-PLAYTEST.md`. **Semua angka di bawah adalah usulan dan belum diuji.** Koding memasang lalu menguji dengan `tests/balance-sim.test.js 12 120` (Nusantara + `?tema=sedang`, n ≥ 10) dan run 250 hari untuk T-01.

Syarat yang tidak boleh bergeser: **pangan d24 median 25–50, maks < 80** (sekarang Nusantara 49, sedang 44).

## §8 Tindak lanjut QC 2026-10-23

### 8.1 Kayu & batu menumpuk (S-07)

**Data.** Tanpa input pemain, kayu mencapai 652–982 pada d60 dengan pop 2–4. Di run bot, kayu d60 312–621 dan batu menganggur 450–670 pada d120. `RES_SOFT_CAP` (kayu 120, batu 35 per 2 penduduk) hanya mengurangi skor kerja sebesar `FOOD_SURPLUS_PENALTY` 40. Bila semua kerja lain juga "penuh", kayu tetap menang, sehingga warga terus menebang.

**Usulan.**

| Konstanta | Sekarang | Usulan | Alasan |
|-----------|----------|--------|--------|
| `RES_HARD_CAP` (baru) | — | `{ kayu: { base: 150, perPop: 15 }, batu: { base: 80, perPop: 8 } }` | Di atas batas ini `gatherTask` kayu/batu tidak ditawarkan, kecuali ada bangunan/perbaikan yang kekurangan bahan itu. Pop 2 → kayu 180, pop 11 → 315, pop 18 → 420. Ini masih di atas biaya terbesar (Balai kayu 80, batu 60). Tanpa input, kayu d60 turun dari 652–982 menjadi ≤ ~210. |
| Kerja cadangan saat semua penuh | jatuh ke kayu/meramu | `diam`/santai di dekat api unggun | Warga yang menganggur tidak menambah stok. Bisa dihubungkan ke mood (§8.3). |
| `KITCHEN_WOOD_PER_DAY` (baru) | 0 | 1 kayu/hari per Dapur jadi | Tungku kayu bakar sepanjang tahun, penyerap kecil yang masuk akal. |
| `UPKEEP` (baru, versi ringan `LATE` TAHAP3 §4) | — | `{ fromEra: 'dusun', everyDays: 7, perBuilding: { kayu: 1 }, stoneFrom: 'desa_pertanian', perBuildingBatu: 0.5 }` | 15 bangunan ≈ 2 kayu + 1 batu per hari. Bila stok kurang, bangunan turun hp sedikit (pakai `BUILDING_DAMAGE.repairBelow` yang sudah ada), tidak langsung rusak. |
| `RES_SOFT_CAP` | kayu 120, batu 35 | tetap | Tetap dipakai sebagai rem pertama di bawah hard cap. |

Efek ke d24 tidak ada: hard cap pop 2–4 = 180–210, sedangkan kayu d24 di sim jauh di bawah itu, dan pangan tidak tersentuh.

### 8.2 Pembusukan & penyimpanan (S-07)

**Data.** Run "fokus makanan" punya pangan d120 659–794 (pop 12–18 ≈ 20–25 hari stok), busuk 126–162 per run (≈1,2/hari). Sekarang `SPOILAGE` = 2 %/hari dari kelebihan di atas 16 hari stok, dan Lumbung ×0.5. Busuknya kecil dibanding stok. Penyerap utama adalah kenduri (60 % kelebihan di atas 15 hari tiap 2 hari).

**Usulan.**

| Konstanta | Sekarang | Usulan | Alasan |
|-----------|----------|--------|--------|
| `SPOILAGE.foodPerDay` | 0.02 | **0.03** | Busuk terasa tanpa menghukum stok normal. |
| `SPOILAGE.foodHighDays` (baru) | — | **22** | Tingkat kedua: kelebihan di atas 22 hari stok… |
| `SPOILAGE.foodHighPerDay` (baru) | — | **0.06** | …busuk 6 %/hari. Stok ±20–25 hari jadi plateau, tidak terus naik. |
| `SPOILAGE.granaryMult` | 0.5 | **0.4** | Lumbung lebih berharga sebagai "penyimpanan". |
| `SPOILAGE.foodFreeDays` | 16 | tetap | Batas aman untuk d24. |

**Cek d24.** Pada d24 pop 3–4, konsumsi ≈ 2,1 makanan/orang/hari, jadi batas bebas busuk = 16 × 6,3–8,3 ≈ 100–133. Angka ini di atas pangan d24 maks 80, sehingga busuk belum mulai sebelum d24 dan target 25–50 tidak bergeser. Perkiraan efek d120 (belum diuji): stok run fokus makanan turun ±10–15 % dan busuk naik ke ±200–260 per run. Stok median bot (434, ±19 hari) hampir tidak berubah.

Tampilan (untuk Dokumen/Koding): busuk harian sudah tercatat (`dstat spoiled`). Tampilkan "busuk X" di ringkasan hari bila ≥ 1 agar pemain melihat alasan membangun Lumbung.

### 8.3 Mood desa bahagia & babi hutan (S-07, S-08)

**Desa bahagia.** Target 25–45 % hari, sasaran median ≈ 35 %. Sekarang Nusantara 38 % (23–55 %) sudah masuk target. Sedang 27 % (5–38 %) berada di batas bawah. Data v4 menunjukkan kepekaan ±4–9 poin per 1 poin `MOOD_COMFORT.base` (63→62: −1 s.d. −4; 62→61: −9) dan ±8 poin per 1 poin `SPAWN.happy.mood`.

| Konstanta | Sekarang | Usulan | Perkiraan |
|-----------|----------|--------|-----------|
| `THEMES.sedang.MOOD_COMFORT_PATCH.base` | 64 | **65** | sedang ≈ 32–36 % |
| Cadangan bila masih < 30 %: `SPAWN.happy.mood` khusus sedang | 81 | 80 | +≈8 poin (butuh `SPAWN_PATCH` di `applyTheme`, sekarang belum ada) |
| Nusantara | base 63, happy.mood 81 | **tetap** | 38 % sudah di tengah target |

Catatan: saran QC "base sedikit turun" justru menurunkan hari bahagia (base lebih rendah = batas nyaman lebih rendah). Untuk menaikkan sedang ke ±35 %, base harus **naik** 1. Mood tidak menyentuh pangan d24.

**Babi hutan.** Kode (`tema.js` `CONFIG.THREAT.babi`): `damage [30,50]`, `killHpBelow 70`, `killChanceIfLowHp 0.3`, `killSafeRadius 4` (pagar/menara), hanya tahun 2+. Karena HP awal ≤ 100 dan damage ≥ 30, hampir setiap gigitan tahun 2+ di luar radius aman lolos syarat HP < 70, sehingga peluang matinya 30 %. Data QC cocok: 16 gigitan → 5 kematian serangan di 12 run (31 %). Tujuan desain: babi merusak & menakutkan, **jarang** membunuh.

| Konstanta (`THREAT.babi`) | Sekarang | Usulan | Alasan |
|---------------------------|----------|--------|--------|
| `damage` | [30, 50] | **tetap** [30, 50] | Luka tetap berat (sakit parah bila HP < 40). |
| `killHpBelow` | 70 | **30** | Mati hanya bila sudah terluka sebelumnya (gigitan kedua sebelum pulih, regen 4/hari). |
| `killChanceIfLowHp` | 0.3 | **0.15** | |
| Pengaman | pagar/menara ≤ 4 | + **oncor menyala ≤ `torchSafeRadius` 3 → peluang mati 0** | Counter jelas yang murah sejak perkemahan. |
| Mode santai (bila nanti ada pilihan kesulitan) | — | `killChanceIfLowHp` **0** **[BACKLOG]** | Belum ada sistem kesulitan di kode. |

Pembanding v4: bb-a (`killHpBelow` 50, kill 0.3) = 0/10 run default dengan kematian. Usulan ini lebih lunak lagi. Perkiraan: ≤ 1 kematian serangan per 12 run, dan kematian hanya terjadi pada pemain tanpa pertahanan. Run "fokus makanan" (prioritas bertani 3) lebih sering berada di ladang saat senja. Itu wajar, tetapi dengan `killHpBelow` 30 satu gigitan saja tidak lagi mematikan.

### 8.4 Regrow pohon & batu (T-01)

**Data.** Peta: 110 pohon × 25 = 2750 kayu, 32 batu × 40 = 1280 batu. Node yang habis dihapus (`S.nodes.filter(n => n.amount > 0 …)`), sehingga kayu peta habis pada hari 150–175. Konsumsi rata-rata ±18 kayu/hari (2750 / 150 hari), puncak late game diperkirakan ±30/hari.

Catatan: di working tree saat ini ada WIP Koding (belum di-commit) `NODE_REGROW: { pohon: { cap: 100, perDay: 0.6, tunasFrac: 0.4, tunasGrow: 0.2 }, batu: { cap: 28, perDay: 0.15 }, jarakBangunan: 3 }` + `nodesRegrowDaily()`. Blok di bawah memakai bentuk yang sama dan menambah empat hal: jeda, peluang yang naik sesuai kekurangan hutan, pengali musim, dan tunas yang tidak bisa ditebang. Batu juga dibuat jauh lebih pelan karena batu sudah surplus (450–670 menganggur di d120).

```js
// QC T-01 (docs/RISET-QC-TINDAKLANJUT.md §8.4) — pengganti/penyempurna NODE_REGROW
NODE_REGROW: {
  pohon: {
    cap: 100,               // maks pohon hidup (awal 110 -> regrow baru mulai setelah ±10 pohon ditebang)
    startDay: 10,           // tidak ada regrow sebelum hari 10 (awal game tidak berubah)
    delayDays: 6,           // petak tunggul baru boleh bertunas 6 hari setelah pohonnya habis
    chancePerMissingDay: 0.02, // peluang/hari per "slot kosong" (cap - hidup): hutan makin gundul -> tumbuh makin cepat
    maxPerDay: 2,           // maks tunas baru per hari (×25 kayu = 50 kayu/hari plafon)
    tunasFrac: 0.4,         // tunas muncul dengan 40% kayu…
    tunasGrow: 0.15,        // …+15%/hari -> dewasa ±4 hari (hujan ±3 hari)
    tunasChoppable: false,  // tunas tidak ditebang sampai penuh -> tidak menambah laju tebang awal
    season: { hujan: 1.5, labuh: 1.2, mareng: 1.0, kemarau: 0,   // Nusantara: rata-rata tahun ×0.875
              semi: 1.5, panas: 0.7, gugur: 1.0, dingin: 0 },     // sedang: rata-rata tahun ×0.80
    // pengali musim berlaku untuk peluang tunas & tunasGrow; kemarau/dingin: tunas tidak tumbuh (tidak mati)
  },
  batu: {
    cap: 28, startDay: 30, delayDays: 20,
    chancePerMissingDay: 0.01, maxPerDay: 0.3,  // 0.3 = peluang 1 batu/hari maksimal (bukan pecahan node)
    amountFrac: 0.5,                             // batu baru 20 (bukan 40): "batu kali tersingkap"
    floodSpawn: [1, 2],                          // hari banjir: 1-2 batu kali muncul di tepi sungai (dalam FLOOD.cols), ikut cap
    season: null,                                // tanpa musim
  },
  jarakBangunan: 3,         // tunas/batu tidak muncul ≤3 petak dari bangunan/ladang (desa tidak tertutup hutan)
  nearStump: 0.7,           // 70% tunas muncul ≤3 petak dari tunggul lama, 30% acak di hutan (hutan terasa tumbuh kembali)
  // P2 (opsional): aksi tanam pohon. Bibit = tunas yang ditaruh pemain, ikut cap.
  bibit: { era: 'dusun', cost: { kayu: 2 }, work: 6, maxAlive: 12 },
  // P2 (opsional, alternatif batu): tambang batu tak terbatas tapi lambat, dibuka bila batu peta < 8
  tambang: { era: 'desa_pertanian', cost: { kayu: 30, batu: 10, alat: 1 }, work: 60, gatherTime: 24, carry: 4, unlockRocksBelow: 8 },
},
```

**Ukuran.** Laju tunas = min(`maxPerDay`, (cap − hidup) × 0,02) × musim. Pada permintaan 18 kayu/hari (0,72 pohon/hari), keseimbangan tercapai di ±(0,72 / 0,875) / 0,02 ≈ 41 slot kosong, yaitu **±59 pohon hidup**. Pada puncak 30 kayu/hari (1,2 pohon/hari) keseimbangannya ±31 pohon hidup, masih jauh di atas 0, dan plafon 2 × 0,875 × 25 ≈ 44 kayu/hari > 30. Kemarau 9 hari tanpa tunas hanya menghabiskan ±11 pohon dari cadangan itu. Jadi kayu peta **tidak pernah 0 hingga d160–250**.

**Tidak memperparah surplus S-07.** (1) Regrow baru berjalan setelah hutan < 100 pohon dan hari ≥ 10, sehingga awal game sama persis. (2) Tunas tidak bisa ditebang dan hasil tebang dibatasi tenaga kerja (pohon masih berlimpah sampai ±d120), jadi kayu d60 tidak naik. (3) Kayu stok dibatasi `RES_HARD_CAP` (§8.1). Batu: pada 12 batu hidup (16 slot kosong) laju ±0,16 batu-node/hari × 20 = ±3 batu/hari. Ini setengah dari WIP (0,15 × 40 = 6/hari), cukup untuk perbaikan dan papan/bata akhir tanpa menambah surplus.

Uji yang disarankan: run 250 hari seed 5 (Nusantara & sedang). Lulus bila jumlah pohon hidup tidak pernah < 20, kayu stok d60 tidak naik dibanding baseline (±5 %), dan log "memikul kayu pulang" hanya muncul bila ada tebang nyata (R-06).

### 8.5 Rekomendasi untuk Asisten Koding (angka kode yang tampak seperti bug)

Angka berikut **tidak** disalin ke spec RISET-INDONESIA / RISET-MUSIM-ANCAMAN:

1. **`THREAT.babi.killHpBelow` 70** (`tema.js`): dengan damage 30–50, syarat "HP rendah" hampir selalu terpenuhi, sehingga setiap gigitan tahun 2+ tanpa pagar/menara ≤ 4 petak punya peluang mati 30 % (QC: 5 kematian / 16 gigitan). Usulan 30 + kill 0.15 + oncor aman (§8.3).
2. **Caping tidak bisa didapat di Nusantara:** `exposureMood` kemarau memakai `techDone.includes('T13')`, padahal T09–T20 belum ada di `tech.js`. Akibatnya penalti terik −4/hari tidak punya counter. Usulan sementara: anggap tertutup bila ada Dapur/Sumur, atau tambahkan T13 "Caping & Kendi".
3. **Konfigurasi mati di `THEMES.indonesia.SEASON_FX`:** `landslideChance/landslideHp`, `fishMult`, `sleepOutsideMood/sleepOutsideSick`, `windWorkMult`, `dryCropGrowMult`, `fireDayChance`, `wellRecover`, `pestChance/pestYieldMult`, `failHarvestChance/failHarvestMult`, `YEAR_SCALE.longDryChance/longDryExtraDays` tidak dibaca `game.js`. Beri komentar "[BACKLOG]" atau hapus agar tidak terkesan sudah jalan.
4. **`RES_SOFT_CAP` tidak menghentikan pengumpulan:** penalti bersifat relatif, sehingga bila semua kerja penuh, kayu tetap dipilih. Perlu hard cap (§8.1).
