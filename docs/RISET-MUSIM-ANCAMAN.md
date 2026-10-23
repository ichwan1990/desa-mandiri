# Riset Musim & Ancaman — Desa Mandiri

Acuan: **The Little Land** (cuaca terbaca, ancaman malam, konsekuensi tanpa “punish RNG”), Banished (musim dingin = stok), RimWorld (peringatan dini + cerita).  
Nuansa tetap **cozy**: ancaman nyata, tapi selalu ada tanda, cara cegah, dan recovery.

> **Status implementasi (dicek terhadap kode 2026-10-23, QC S-06).** Dokumen ini adalah spec tema empat musim (`?tema=sedang`, `THEMES.sedang` di `tema.js`); kerangkanya juga dipakai tema Nusantara (babi hutan = kerangka `THREAT.wolf`). Bagian yang belum ada ditandai **[BACKLOG]**; angka yang berbeda diselaraskan ke kode dengan "(spec lama: X)".
>
> Ringkas: **10 Terimplementasi · 4 Sebagian · 0 Backlog**

| § | Fitur | Status | Catatan kode |
|---|-------|--------|--------------|
| 1 | Efek semi | Terimplementasi | `THEMES.sedang.SEASON_FX.semi` |
| 1 | Efek panas | Terimplementasi | `yieldMult` 1.0 (bonus panen dihapus) |
| 1 | Efek gugur | Sebagian | `forageMult` 1.0; berburu (daging + kulit) belum ada |
| 1 | Efek dingin | Terimplementasi | `hungerMult` 2.0 |
| 1 | `YEAR_SCALE` tahun 2+ | Terimplementasi | tambahan lapar dari `LATE` belum ada |
| 2.1 | Serigala malam (jejak → mendekat → serang → usai) | Terimplementasi | `THREAT.wolf`, angka kill diubah ANALISA v2 |
| 2.1 / 3 | Pagar, obor, menara jaga, makam | Terimplementasi | biaya & kerja sama dengan spec |
| 2.2 | Sakit ringan/parah + rawat | Terimplementasi | `severeDeathPerDay` 0.15 |
| 2.2 | Kematian, makam, duka | Sebagian | duka per hubungan ada; pengurangan duka oleh festival/T20 belum ada |
| 2.2 | Pergi (`LEAVE`) | Terimplementasi | + `starveDays`, `minPop`, `cooldownDays` |
| 2.3 | Kebakaran | Sebagian | dapur/bengkel saat panas ada; pemicu badai petir belum ada |
| 2.4 | Banjir kecil | Sebagian | `FLOOD` ada; mitigasi tech T10 Parit Air belum ada (T09–T20 belum dibuat) |
| 2.5 | Jenjang kelaparan | Terimplementasi | `FAMINE` (+ `graceDays`) |
| 3 | Prioritas darurat `jaga`/`padam`/`rawat`/`makam` | Terimplementasi | `DEFAULT_PRIO`, `SCHEDULE.urgentJobs` |

Sasaran: musim dan ancaman **terasa** (beda tiap musim, malam berbahaya, kematian bermakna), tanpa membuat early game unfair.

Status sekarang (`balance.js`): 4 musim × 7 hari, `WINTER_HUNGER_MULT` 2.0 (spec lama: 1.5), event ringan (badai/hewan/wabah sebagai pilihan teks). Dokumen ini **menaikkan ketegangan** dengan sistem yang bisa diantisipasi.

---

## Prinsip desain

1. **Peringatan dini dulu, hukuman belakangan** — minimal 0,5–1 hari (atau fajar hari H) sebelum puncak ancaman.
2. **Selalu ada counter** — bangunan, stok, prioritas kerja, atau pilihan event.
3. **Kematian jarang tapi berat** — pemakaman + duka; jangan death spiral tanpa jalan keluar.
4. **Musim = loop berbeda**, bukan cuma skin warna — semi tanam, panas air/api, gugur panen/stok, dingin survivability.
5. **Tahun 1 lembut, tahun 2+ tegas** — multiplier ancaman naik pelan (selaras `LATE` di RISET-TAHAP3).

---

## 1. Efek unik tiap musim

`SEASON_DAYS` tetap **7** (1 tahun = 28 hari game). Efek di bawah = konstanta baru di `balance.js` → `SEASON_FX`.

### Semi (`semi`) — tanam & hujan

| Efek | Angka | Catatan |
|------|-------|---------|
| Bonus tanam | `plantTime` × **0.85**, `growDays` −**0.5** | Ladang lebih cepat siap |
| Hujan ringan | 40% hari: mood luar +**3**/hari, semak regrow × **0.85** waktu | Visual hujan |
| Banjir kecil | Chance **0.08**/hari (max 1×/semi) | Lihat §2 Banjir |
| Kayu basah | Tebang luar +**10%** waktu saat hujan | Soft friction |
| Peringatan | Hari 1 semi: log “Musim semi — saatnya menanam sebelum hujan deras.” | |

### Panas (`panas`) — kekeringan & api

| Efek | Angka | Catatan |
|------|-------|---------|
| Air cepat habis | `WATER.perDayPerPop` × **1.35** | Sumur jadi kritis |
| Kekeringan | Chance **0.10**/hari (max 1×/panas) | Event pilihan; ladang grow +1 hari selama 3 hari bila gagal mitigasi |
| Kebakaran | Chance malam **0.06** jika ada dapur/bengkel tanpa “aman” (lihat §2) | |
| Panen awal | `yield` × **1.0** (spec lama: 1.05) | Bonus dihapus (nerf pangan) |
| Peringatan | foodDays air &lt; 3 → banner kuning; asap tipis di dapur = risiko api | |

### Gugur (`gugur`) — panen & stok

| Efek | Angka | Catatan |
|------|-------|---------|
| Panen raya window | Bobot `panen_raya` × **1.5** (tetap maks 1×/tahun) | Hadiah sudah di-nerf §7 TAHAP3 |
| Berburu **[BACKLOG]** | Node/hewan buru: chance daging +kulit; `gather` makanan hutan × **1.0** (spec lama: 1.2) | Era dusun+ |
| Persiapan dingin | UI target buffer = `WINTER_BUFFER_DAYS` (**8**, tahun 2+: **10**) | Banner jika di bawah target mulai hari ke-4 gugur |
| Mood “syukur” | Jika foodDays ≥ 10 di akhir gugur: mood desa +**8** sekali | Reward perencanaan |
| Peringatan | “Sisa X hari sebelum dingin. Stok Y/Z hari.” tiap fajar hari 4–7 gugur | |

### Dingin (`dingin`) — ekstrem & sakit

| Efek | Angka | Catatan |
|------|-------|---------|
| Lapar | `WINTER_HUNGER_MULT` **2.0** (spec lama: 1.5); tahun 2+ +0.15 dari LATE **[BACKLOG]** | Sudah ada; dengan Lumbung ×1.6 (`GRANARY_HARD_HUNGER_MULT`) |
| Tanaman | Tetap **tidak tumbuh** | Sudah ada |
| Dingin ekstrem | Chance **0.12**/hari; 1 hari: hunger × **1.8**, mood decay × **2.5** jika jauh dari api/rumah | Peringatan sore sebelumnya |
| Kayu bakar | Api unggun konsumsi **2 kayu/hari** di dingin (0 di musim lain V1 musim-ancaman) | Tech T01: ×0.8 |
| Pakaian | Tanpa `kulit`/tech T13: mood dingin −**8**/hari di luar; dengan pakaian −**2** | |
| Sakit | Chance **0.08**/hari per penduduk yang mood&lt;50 atau lapar kritis | Lihat §2 Sakit |
| Peringatan | Malam sebelum ekstrem: “Angin membeku malam ini…” + ikon termometer | |

### Tabel ringkas pengali musim

```js
SEASON_FX: {
  semi:  { plantTimeMult: 0.85, growDaysAdd: -0.5, rainChance: 0.40, floodChance: 0.08, chopTimeMultRain: 1.10 },
  panas: { waterMult: 1.35, droughtChance: 0.10, fireNightChance: 0.06, yieldMult: 1.0 /* spec lama: 1.05 */ },
  gugur: { panenRayaWeightMult: 1.5, forageMult: 1.0 /* spec lama: 1.2 */, hardWarnFromDay: 4 },
  dingin:{ hungerMult: 2.0 /* spec lama: 1.5 */, extremeChance: 0.12, extremeHungerMult: 1.8, campfireWoodPerDay: 2, sickChancePerLowMood: 0.08 },
},
YEAR_SCALE: { // mulai tahun game ke-2 (hari 29+)
  threatChanceMult: 1.25,
  winterBufferDays: 10,
  extremeChanceAdd: 0.04,
},
```

---

## 2. Ancaman nyata

### 2.1 Serigala / hewan buas (malam)

**Bukan** cuma popup pilihan. Ada fase dunia:

| Fase | Waktu | Apa yang terjadi |
|------|-------|------------------|
| Jejak | Sore | Log + jejak paw di tepi peta (“Auman jauh…”) |
| Mendekat | Awal malam | Howl SFX; penduduk luar cenderung pulang jika prioritas aman |
| Serang | Tengah malam (frac 0.85–0.95) | 1–2 “predator” menuju penduduk yang **di luar** tanpa obor/pagar |
| Usai | Fajar | Predator pergi; luka tersisa |

**Efek serangan (jika mengenai penduduk):**
- HP kesehatan −**25–40** (bukan one-shot tahun 1).
- Mood −**15**; 30% chance “trauma” (mood cap 70 selama 3 hari).
- Tahun 2+: 25% chance kematian (spec lama: 10%) jika HP &lt; 20 saat digigit **dan** tidak ada menara/pagar dalam 4 tile (spec lama: 8 tile). Sumber: paket ancaman ANALISA-PLAYTEST v2 (eksperimen D).
- HP setelah gigitan dijepit minimal 1 (tahun 1) / 0,5 (tahun 2+), jadi gigitan sendiri tidak pernah membunuh.
- Tema Nusantara memakai kerangka ini untuk babi hutan dengan angka sendiri (`CONFIG.THREAT.babi`, lihat RISET-INDONESIA §3.3 dan RISET-QC-TINDAKLANJUT §8.3).

**Pertahanan (counter):**

| Bangunan | Era min | Biaya usulan | Efek |
|----------|---------|--------------|------|
| `pagar` (1 tile) | dusun | kayu 4 | Predator path cost ×3; zona aman jika rumah dikelilingi ≥70% |
| `obor` (1 tile) | perkemahan | kayu 3, batu 1 | Radius 3 tile: chance kena serangan −60% di malam; butuh 1 kayu/2 malam refill |
| `menara_jaga` | desa_pertanian | kayu 30, batu 20, papan 10 | Radius 10: 1×/malam “usir” predator (kerja penduduk prio `jaga` atau otomatis jika ada yang idle) |

Event teks `hewan_buas` / `serigala_malam` tetap ada sebagai **varian siang/cerita**; malam = sistem di atas (`THREAT.wolf`).

```js
THREAT: {
  wolf: {
    minEra: 'dusun',           // perkemahan: hanya jejak, belum luka
    baseNightChance: 0.05,     // naik di dingin ×1.4, tahun2 ×1.25
    warnHoursBefore: 0.15,     // frac hari (~18 menit game @1x day=120s → ~18s)
    damage: [25, 40],
    killChanceIfLowHp: 0.25,   // hanya tahun 2+ (spec lama: 0.10)
    killHpBelow: 20, killSafeRadius: 4, // spec lama: radius 8
    attackFrac: [0.85, 0.95], count: [1, 2], moodHit: 15, traumaChance: 0.3, traumaDays: 3, traumaMoodCap: 70,
    torchWoodPerNights: 2,
    fencePathMult: 3,
    torchSafeRadius: 3,
    torchHitMult: 0.4,
    towerRadius: 10,
    towerScarePerNight: 1,
  },
},
```

### 2.2 Sakit parah, kematian, pergi

**Sakit (stack ringan → parah):**
- Ringan: energy regen ×0.6, kerja ×0.7, 2–4 hari; sembuh dengan istirahat di gubuk + stok makanan.
- Parah: chance dari wabah / dingin ekstrem / HP&lt;40 setelah serangan. Kerja dilarang; butuh “rawat” (makanan −5 + 1 penduduk damping 1 hari) atau risiko mati.

```js
SICKNESS: {
  lightDays: [2, 4],
  workMult: 0.7,
  severeFromHpBelow: 40,
  severeDeathPerDay: 0.15,     // jika tidak dirawat (spec lama: 0.08)
  careCost: { makanan: 5 },
  careSeconds: 80,
},
```

**Kematian:**
- Sebab: kelaparan HP 0, sakit parah tanpa rawat, serigala (jarang), event pilihan buruk tahun 2+.
- Alur: tubuh → tugas `makam` → bangunan `makam` (1 tile, kayu 5) atau makam komunal di balai.
- **Duka:** semua penduduk mood −**20** instan, lalu −**3**/hari selama **5** hari (diminished jika festival/T20 dalam 7 hari **[BACKLOG]**).
- Nama tetap di log & panel “kenangan” singkat (1 baris).

**Pergi (leave):**
- Syarat: mood rata-rata pribadi &lt; **35** selama **5** hari berturut **atau** lapar kritis &gt; 2 hari tanpa makan.
- Efek: −1 penduduk (bukan mati); mood desa −**10**; log “{nama} meninggalkan desa.”
- Pencegah: prioritas makanan, api, rumah, hentikan overwork (rest event).

```js
LEAVE: { moodBelow: 35, days: 5, villageMoodHit: 10 },
DEATH: { griefMoodInstant: -20, griefDays: 5, griefPerDay: -3, graveCost: { kayu: 5 } },
```

### 2.3 Kebakaran

| Pemicu | Syarat | Peringatan |
|--------|--------|------------|
| Panas + dapur/bengkel | `fireNightChance` | Asap UI + log sore “Bau asap aneh dari dapur…” |
| Badai petir **[BACKLOG]** | Event badai pilihan buruk | Kilat di langit 0,5 hari sebelumnya |
| Pemain abaikan | Bangunan hp &lt; 40 dekat api | Banner |

**Fase:** asap (1 jam game) → api pada 1 bangunan → menyebar ke tile tetangga tiap ~30 dtk game jika tidak dipadamkan.

**Padam:** prioritas darurat `padam` — penduduk bawa air (butuh stok air ≥ 5 per aksi); 2–3 aksi padamkan 1 tile. Tanpa air: hanya “korbankan” kayu untuk sekat (−10 kayu, cegah sebar).

**Kerugian:** bangunan hp −40–100; 15% chance isi gudang dekat api: −10% stok makanan di gudang itu.

### 2.4 Banjir kecil (semi)

- Peringatan: “Sungai naik” pagi hari.
- Efek 1 hari: tile dalam 2 kolom dari `RIVER_X` tidak bisa ditanami/dilalui nyaman (speed ×0.5); ladang di zona itu `grow` ditunda +1 hari.
- Cegah/mitigasi: tech T10 Parit Air **[BACKLOG]** mengurangi durasi jadi 0,5 hari &amp; nullify delay ladang; atau jangan tanam di tepi sungai.
- Tidak menenggelamkan penduduk tahun 1.

### 2.5 Kelaparan (dengan peringatan dini)

Sudah ada log fajar; **perketat jenjang UI** (bukan angka produksi):

| Level | Syarat | UI | Efek |
|-------|--------|-----|------|
| Aman | foodDays ≥ 8 | Hijau | — |
| Waspada | 5–8 | Kuning + teks | — |
| Bahaya | 3–5 | Oranye; detak pelan | Mood −5/hari |
| Kritis | &lt; 3 | Merah; pause hint | HEALTH.starve mulai; chance leave naik |
| Kolaps | foodDays &lt; 1 &amp; stok 0 | Modal “Kelaparan” | HP turun cepat; kematian mungkin 2–3 hari |

Peringatan ekstra musim gugur: target buffer dingin (lihat §1).

---

## 3. Balancing: menantang, cozy, adil

### Kurva tahun

| Tahun | Fokus | Ancaman |
|-------|-------|---------|
| 1 | Belajar musim | Serigala jejak saja di perkemahan; luka mulai dusun; kematian hampir hanya dari kelaparan yang diabaikan |
| 2 | Stok & pertahanan | Chance ancaman ×1.25; dingin ekstrem + pakaian; killChance serigala aktif |
| 3+ | Late (TAHAP3) | Upkeep + kontrak; wabah/kebakaran lebih sering tipis |

### Angka yang **tidak** diubah dulu
- `FIELD.yieldMin/Max` 8–10, `EVENT_CHANCE_PER_DAY` 0.18, nerf hadiah quest/event pangan (RISET-TAHAP3 §7).
- Soft-cap batu skala populasi.

### Bangunan baru (untuk Koding + Desain)

| id | Nama | Era | Cost | Work |
|----|------|-----|------|------|
| pagar | Pagar | dusun | kayu 4 | 8 |
| obor | Obor | perkemahan | kayu 3, batu 1 | 5 |
| menara_jaga | Menara Jaga | desa_pertanian | kayu 30, batu 20, papan 10 | 70 |
| makam | Makam | perkemahan | kayu 5 | 15 |

Prioritas kerja baru: `jaga`, `padam`, `rawat`, `makam` (darurat di atas job biasa, di bawah makan/tidur kritis).

### Fairness checklist
- [ ] Tidak ada death tanpa peringatan ≥ 1 siklus UI (kecuali pemain ignore kritis berhari-hari).
- [ ] Tiap ancaman punya 2+ counter (bangunan / stok / pilihan).
- [ ] Pemakaman + duka ada closure emosional, bukan soft-lock.
- [ ] Musim semi/gugur terasa “legakan”; panas/dingin terasa “tegang”.
- [ ] Sim d24 pangan tetap di target 25–50 setelah sistem ini (ancaman malam jangan inject makanan).

### Prioritas implementasi

**P0:** Jenjang peringatan kelaparan; kayu bakar dingin; sakit ringan; leave by mood.  
**P1:** Serigala malam + obor + pagar; kebakaran dapur panas; banjir kecil semi.  
**P2:** Menara jaga; sakit parah + rawat; pemakaman/duka; dingin ekstrem year scaling.

---

## 4. Catatan untuk tim

### Asisten Koding
- Tambah `SEASON_FX`, `THREAT`, `SICKNESS`, `LEAVE`, `DEATH` di `balance.js`.
- Bangunan `pagar`/`obor`/`menara_jaga`/`makam`; job darurat.
- Predator sebagai entity sederhana malam (bukan combat action-RPG).
- Hook peringatan di `newDay` / malam frac.
- Tes: sim musim penuh tahun 1 tanpa kematian wajib; tahun 2 serigala bisa luka jika tanpa obor.

### Asisten Desain
- Palet & partikel per musim (hujan semi, haze panas, daun gugur, salju dingin).
- VFX: jejak serigala, howl, asap→api, air banjir tepi sungai, termometer UI.
- Sprite pagar, obor (menyala/mati), menara, makam; overlay duka (opsional frame UI redup 1 hari).
- Banner peringatan early-warning (kuning/oranye/merah) konsisten.

### Asisten Dokumen
Teks singkat hangat untuk: pembuka tiap musim; peringatan banjir/kekeringan/asap/auman/dingin ekstrem; log luka & sembuh; kematian, pemakaman, duka; leave; UI jenjang kelaparan; tooltip pagar/obor/menara/makam. Id disarankan: `musim_*`, `ancaman_*`, `duka_*`, `bangunan_pagar|obor|menara_jaga|makam`.

---

## 5. Sumber & selaras dokumen lain

- Selaras `RISET-MEKANIK.md` §4 (event = cerita + pilihan) & `RISET-TAHAP3.md` (LATE, T01/T13/T18, nerf pangan §7).
- The Little Land: ancaman malam + charm/defense terbatas, bukan wipe acak.
- Banished: winter buffer; RimWorld: letters/peringatan sebelum raid.

*Angka final di-playtest lewat `tests/balance-sim.test.js` (perpanjang ke hari 56 / 2 tahun) + playtest malam serigala manual.*
