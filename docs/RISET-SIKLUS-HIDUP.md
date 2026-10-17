# Riset Siklus Hidup — Jadwal Harian, Reproduksi, Umur

Acuan: The Little Land (Littles lahir dari rumah + kebahagiaan, ada lansia & kematian), Banished (umur, kelahiran butuh rumah kosong, populasi bisa crash karena gelombang lansia), RimWorld (jadwal tidur, tidur di luar = debuff).
Skala waktu: 1 hari = 120 dtk @1x, 1 musim = 7 hari, 1 tahun game = 28 hari. Jam dalam hari: `frac = jam/24` (`NIGHT_START` 0.75 = 18:00, `NIGHT_END` 0.25 = 06:00).

Prinsip: populasi tumbuh **pelan dan bisa diprediksi**, setiap bayi jadi beban dulu (mulut tanpa tenaga), dan kematian karena tua menjadi cerita, bukan kejutan.

---

## 1. Jadwal harian & tidur

| Jam | frac | Perilaku |
|-----|------|----------|
| 05:00 | 0.208 | Bangun (lebih awal jika energi sudah ≥95) |
| 05:00–21:00 | — | Kerja / makan / sosial sesuai AI |
| 21:00 | 0.875 | Jam tidur: pulang ke ranjang |
| 21:00–22:30 | s.d. 0.94 | **Toleransi terlambat** hanya untuk kerja darurat (padam, rawat, jaga, menyelesaikan angkutan, bangunan tinggal <10%) |
| >22:30 | — | Paksa tidur kecuali `padam`/`jaga` aktif; energi tetap turun |

Tetap pakai override lama: energi < `ENERGY_CRIT` (20) = langsung tidur kapan saja (tidur siang 1–2 jam game).

**Tidur di luar (tanpa ranjang):**

| Kondisi | Regen energi | Mood per malam | Lain |
|---------|--------------|----------------|------|
| Di ranjang gubuk/rumah | ×1.0 | +2 (nyaman) | — |
| Di luar, dekat api unggun (≤3 tile) | ×0.75 | −3 | — |
| Di luar, tanpa api | ×0.6 | −6 | dingin: −12 & peluang sakit +0.05 |
| Di luar & ada serigala malam | — | — | jadi target utama `THREAT.wolf` |

```js
SCHEDULE: {
  wakeFrac: 0.208,          // 05:00
  sleepFrac: 0.875,         // 21:00
  lateToleranceFrac: 0.0625,// +1.5 jam -> 22:30 untuk kerja darurat
  urgentJobs: ['padam', 'rawat', 'jaga'],
  finishBuildBelowPct: 10,
  earlyWakeEnergy: 95,
  napEnergyCrit: true,      // pakai ENERGY_CRIT
},
SLEEP_OUTSIDE: {
  bedRegen: 1.0, bedMood: 2,
  fireRegen: 0.75, fireMood: -3, fireRadius: 3,
  bareRegen: 0.6, bareMood: -6,
  winterMood: -12, winterSickAdd: 0.05,
},
```

---

## 2. Berpasangan & kehamilan

### Berpasangan
- Dua dewasa (umur 18–50) **tinggal di rumah yang sama**, keduanya mood ≥ **65** selama **2** hari → peluang jadi pasangan **0.15/hari**.
- Pasangan tetap (V1 tanpa cerai). Jika satu meninggal: duka ×1.5 bagi pasangannya, dan boleh berpasangan lagi setelah **14** hari.
- Gender tidak perlu dimodelkan; cukup "pasangan". Bila ingin realistis, beri `v.sex` saat spawn dan syaratkan pasangan beda jenis. Ini keputusan desain, bukan balancing.

### Syarat hamil (semua harus terpenuhi)
| Syarat | Nilai |
|--------|-------|
| Umur ibu | 18–42 |
| Mood keduanya | ≥ 70 |
| Stok pangan (foodDays) | ≥ **12** (sama dengan `SPAWN_LATE`) |
| Jenjang `FAMINE` | `aman` saja |
| Kapasitas rumah | ada ≥1 tempat kosong **setelah** dihitung semua bayi yang sedang dikandung |
| Kesehatan | keduanya HP ≥ 70, tidak sakit |
| Cooldown ibu | ≥ **21** hari sejak melahirkan |
| Cap desa | kelahiran per musim ≤ `ceil(pop/5)` |

- Peluang hamil saat memenuhi syarat: **0.10/hari** (dingin ×0.5).
- Lama hamil: **7 hari** (1 musim). Selama hamil, kerja ibu ×0.85 pada 3 hari terakhir; tidak ikut `jaga`.
- Kelahiran: selalu berhasil di kondisi normal. Kalau saat lahir FAMINE `kritis`/`kolaps` atau ibu sakit parah, risiko bayi meninggal **10%** (jarang, ada peringatan sejak hamil hari 5).
- Kelahiran: mood desa +10, pasangan +15.

### Pendatang (spawn lama) setelah kelahiran aktif
Mulai era Dusun, kelahiran jadi jalur utama. Pendatang dari luar tetap ada tapi `SPAWN.cooldownDays` ×**1.5** (8→12) supaya total pertumbuhan tidak dobel.

```js
PAIRING: { minAge: 18, maxAge: 50, minMood: 65, moodDays: 2, chancePerDay: 0.15, rematchDays: 14, widowGriefMult: 1.5 },
PREGNANCY: {
  minEra: 'dusun',
  motherAge: [18, 42], minMood: 70, minFoodDays: 12, famineLevels: ['aman'],
  minHp: 70, cooldownDays: 21, perSeasonCapDiv: 5,
  chancePerDay: 0.10, winterMult: 0.5,
  lengthDays: 7, lateWorkMult: 0.85, lateDays: 3,
  birthRiskCritical: 0.10, birthMood: 10, parentMood: 15,
  newcomerCooldownMult: 1.5,
},
```

---

## 3. Tahap umur

Skala umur: **1 tahun umur = 3.5 hari game** (8 tahun umur per tahun game). Penduduk awal 16–40 tahun (sudah di `spawnVillager`) jadi lansia antara hari ~50 sampai ~135, jadi gelombang lansia muncul di mid–late game dan tidak serentak.

| Tahap | Umur | Lama (hari game) | Konsumsi makan | Kerja |
|-------|------|------------------|----------------|-------|
| Bayi | 0–2 | 7 | ×0.5 | Tidak bekerja; perlu 1 dewasa di rumah malam |
| Anak | 2–12 | 35 | ×0.75 | Umur 2–7: tidak bekerja. Umur **8–12**: bantu ringan (makanan/semak, air, angkut) ×**0.4**, carry ×0.5; tidak boleh bangun, tambang, jaga, padam |
| Remaja→Dewasa | 12+ | — | ×1.0 | Umur 12–15 kerja ×0.8; ≥16 penuh |
| Dewasa | 16–54 | ~136 | ×1.0 | Penuh |
| Lansia | 55+ | — | ×0.9 | Kerja ×0.7, energi turun ×1.2/hari, peluang sakit ×1.5; skill tetap (bonus mentor: anak di rumah yang sama skill gain ×1.25) |

### Kematian karena tua
- Mulai umur **60**: peluang meninggal per hari = `0.004 × (umur − 59)`, maksimum 0.08/hari; umur 80 pasti meninggal.
- Rata-rata meninggal di sekitar umur 66–70 (≈ 25–35 hari setelah masuk 60).
- **Peringatan dini:** pada umur 60 muncul log/ikon "mulai renta"; saat peluang harian > 0.03, panel penduduk tampilkan "kesehatan menurun". Kematian tua memicu pemakaman dan duka dari `DEATH`, tapi duka ×**0.6** (dianggap wajar).

```js
AGE: {
  daysPerYear: 3.5,
  babyUntil: 2, childUntil: 12, teenUntil: 16, elderFrom: 55,
  foodMult: { bayi: 0.5, anak: 0.75, dewasa: 1.0, lansia: 0.9 },
  childHelpFrom: 8, childWorkMult: 0.4, childCarryMult: 0.5,
  childJobs: ['makanan', 'air', 'angkut'],
  teenWorkMult: 0.8,
  elderWorkMult: 0.7, elderEnergyDecayMult: 1.2, elderSickMult: 1.5, mentorSkillMult: 1.25,
  oldDeathFrom: 60, oldDeathPerYear: 0.004, oldDeathMaxPerDay: 0.08, maxAge: 80,
  oldDeathGriefMult: 0.6, frailWarnChance: 0.03,
},
```

---

## 4. Kurva populasi & keselarasan dengan ancaman

Hitungan kasar per pasangan yang memenuhi syarat: menunggu hamil ~10 hari (0.10/hari), hamil 7, cooldown 21 → **±1 kelahiran per 30–38 hari** (≈1 per tahun game). Bayi baru bisa bantu setelah 21 hari (umur 8) dan kerja penuh setelah ~49 hari.

| Fase | Hari | Pop target | Catatan |
|------|------|------------|---------|
| Perkemahan | 1–14 | 2–4 | Belum ada kelahiran; pendatang saja |
| Dusun | 15–40 | 4–7 | Kelahiran pertama sekitar hari 30–45 |
| Desa Pertanian | 40–80 | 7–11 | 1–2 pasangan aktif; anak = beban makan |
| Kota Kecil | 80–140 | 10–16 | Lansia pertama mati tua; kelahiran ≈ kematian jika pangan dijaga |

**Pengaman supaya tidak meledak atau runtuh:**
- Cap kelahiran per musim `ceil(pop/5)` + syarat ruang kosong = pemain mengatur laju lewat jumlah rumah (seperti Banished).
- Syarat `FAMINE aman` + foodDays 12: kelahiran berhenti otomatis saat ancaman/dingin menekan stok, jadi tidak menambah mulut di saat krisis.
- Konsumsi bayi/anak lebih rendah supaya keluarga tidak langsung memicu kelaparan.
- Hamil di musim dingin ×0.5, jadi kelahiran cenderung jatuh di semi/panas (stok lebih aman).
- Lansia muncul tersebar karena umur awal acak 16–40, tidak ada gelombang mati massal.
- `foodPerDay()` perlu ikut `AGE.foodMult` supaya `foodDays`, FAMINE, dan target d24 tetap akurat.

**Yang tidak diubah:** FIELD yield, `EVENT_CHANCE_PER_DAY`, nerf pangan TAHAP3 §7, angka `THREAT`/`SEASON_FX`. Sim d24 (target pangan 25–50) praktis tidak terdampak karena kelahiran pertama baru sekitar hari 30.

### Uji yang disarankan
1. Sim 140 hari × 5 run: pop akhir 10–16, minimal 1 kematian tua, tanpa kematian massal (>3 dalam 7 hari) kecuali saat FAMINE kolaps.
2. Rumah penuh → tidak ada kehamilan baru.
3. Tidur: tidak ada penduduk bekerja normal setelah 22:30 kecuali job darurat.
4. Anak <8 tidak pernah dapat task; anak 8–12 hanya `childJobs`.

---

## 5. Untuk tim

- **Koding:** konstanta di atas, `v.stage` dari umur, `v.partnerId`, `v.pregnantUntil`, `v.home`; perbarui `foodPerDay()`; tambah tes di atas.
- **Desain:** sprite bayi (digendong/di ranjang), anak (lebih kecil), lansia (tongkat/rambut putih), ikon hati pasangan, ikon hamil kecil, zzz tidur di luar.
- **Dokumen:** log berpasangan, kabar hamil, kelahiran, ulang tahun tahap (anak mulai bantu, jadi dewasa, jadi lansia), renta, wafat karena usia, teguran tidur di luar.
