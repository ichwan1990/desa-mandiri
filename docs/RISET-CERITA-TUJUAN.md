# Riset Cerita & Tujuan — Tokoh, Tujuan Jangka Panjang, Keputusan Sulit Kepala Desa

*Dokumen riset desain untuk "Desa Mandiri" (Canvas/JS). Dibuat oleh Grok Bot, 17 Okt 2026. Tidak ada kode yang diubah; semua angka di sini usulan dan harus diuji ulang dengan `tests/balance-sim.test.js` dan harness `sim.js` (lihat `ANALISA-PLAYTEST.md`).*

Acuan gaya: **RimWorld** (sifat, hubungan, cerita yang muncul sendiri), **The Sims** (keinginan kecil), **Frostpunk** (keputusan dengan akibat tertunda, tetapi kita versi cozy), **Stardew Valley** (festival tahunan dan tanggal tetap), **Banished/The Little Land** (populasi pelan, tujuan lunak). Rasa yang dicari: desa Jawa Timur yang hangat, ada gotong royong, ronda, kenduri, reog Ponorogo, dan lomba Agustusan. Ada masalah tapi tidak kelam.

---

## 0. Pegangan & fakta yang dipakai

| Hal | Nilai (sumber) |
|---|---|
| Panjang hari | 120 dtk game @1x (`DAY_LENGTH_SEC`) |
| Tahun | 28 hari: **hujan** hari 1–9, **mareng** 10–14, **kemarau** 15–23, **labuh** 24–28 (`tema.js`, `SEASON_LEN`) |
| Musim sulit | `isHardSeason()` = kemarau (`HARD_HUNGER_MULT` 1.4, lumbung 1.25) |
| Sumber daya | `gandum` dilabeli **Padi** (`RES_LABEL`); baru (RISET-INDONESIA §2): `bambu`, `kelapa`, `minyak`, `sabut`, `kopi` |
| Ancaman | babi hutan (malam, ladang), monyet (siang, curi), ular (sawah, hujan), macan tutul jawa (langka, tahun 2+) |
| Berpasangan | `PAIRING` umur 18–50, mood ≥ 65 (2 hari), 0.15/hari, rematch 14 hari, duka janda/duda ×1.5 (RISET-SIKLUS-HIDUP §2) |
| Kehamilan | `PREGNANCY` 7 hari, cooldown 21, cap kelahiran per musim `ceil(pop/5)`, foodDays ≥ 12, FAMINE `aman` |
| Umur | `AGE` 3.5 hari game = 1 tahun umur; anak bantu dari umur 8; lansia 55+ |
| Duka | `DEATH` mood −20 seketika, 5 hari × −3 |
| Event acak | `EVENT_CHANCE_PER_DAY` 0.18, mulai Dusun 0.25; `EVENT_RULES` (bobot, musim, maksPerTahun, cooldownHari); Hari Jadi tetap di hari 29, 57, 85, … |
| Format teks | `TEKS-GAME.json` v1.3.0: event `{id, judul, kategori, deskripsi, pilihan[{teks, efek, teks_hasil}]}`; quest `{id, urutan, judul, tujuan{tipe,target,jumlah}, hadiah}`; pencapaian A01–A24 |
| Target pangan | **median makanan+gandum di hari 24 = 25–50** (`balance-sim.test.js`). Hari 24 = **hari pertama labuh**, tepat setelah kemarau pertama |
| Masalah playtest | konten habis sekitar hari 75–90; ±48–52% hari "datar" tanpa keputusan (`ANALISA-PLAYTEST.md` §2.6) |

> **Catatan status kode:** di `game.js` saat ini (HEAD `932be13` + working tree) belum ada `PAIRING`, `PREGNANCY`, `AGE`, dan `SCHEDULE`; konstanta itu baru ada di `RISET-SIKLUS-HIDUP.md` dan teksnya di `TEKS-GAME.json` (`log_hubungan`, `kehamilan`, `kelahiran`, `tumbuh_kembang`, `lansia_berpulang`, `panel_keluarga`). Dokumen ini mengasumsikan siklus hidup itu masuk lebih dulu atau bersamaan. Semua yang di bawah tetap bisa jalan tanpa kehamilan; bagian yang bergantung ditandai **[butuh SIKLUS-HIDUP]**.

### Prinsip desain

1. **Cerita dari sistem, bukan dari naskah panjang.** Sifat + hubungan + keinginan menghasilkan momen kecil setiap hari; cerita berantai hanya bumbu.
2. **Cozy:** tidak ada kekerasan antarwarga, tidak ada eksekusi, tidak ada cerai di V1. Akibat terburuk: rugi stok, sakit, bangunan rusak, warga pergi, duka.
3. **Opsi pertama = opsi aman/netral.** Bot `balance-sim.test.js` selalu memilih opsi pertama yang aktif. Maka opsi pertama setiap **dilema ringan (R) dan momen kecil** dibuat netral pangan (efek pangan 0 atau ±2) supaya target d24 tetap terukur. Dilema berat (B) baru muncul mulai hari 25, jadi opsi pertamanya boleh berbiaya pangan −3 … −6 (tetap opsi paling hati-hati di dilema itu); angka di tabel §3.2/§3.3 yang berlaku. Opsi berani/serakah ada di posisi 2–3.
4. **Hadiah kecil, akibat terasa.** Hadiah pangan dari fitur baru dibatasi (lihat §5). Yang besar adalah mood, hubungan, dan bonus permanen kecil dari monumen.
5. **Tidak ada yang menyentuh d24 secara besar.** Monumen, pembukaan tujuan besar, dan dilema berat baru boleh muncul **mulai hari 25**.

---

## 1. TOKOH

### 1.1 Sifat (20 sifat: 16 ikon sudah ada + 4 ikon baru)

Setiap penduduk punya **2 sifat** (25% dapat sifat ke-3). Maksimum 3. Sifat terlihat di panel penduduk sebagai ikon (32×32 di panel, 16×16 di kartu/daftar) + nama. **16 sifat memakai ikon yang sudah dibuat Asisten Desain** di `assets/icons/traits/` (`assets/manifest.json`, stage 8: positif berbingkai hijau, negatif berbingkai ungu-abu). **4 sifat butuh ikon baru:** `perantau`, `ahli_tani`, `pandai_masak`, `seniman`. Teks lama `penduduk[].sifat` ("rajin dan ceria") dipetakan ke id sifat (mis. "ceria" → `periang`).

#### Peta sifat → ikon

| id | Nama | Kutub | Ikon 32×32 | Ikon 16×16 | Status |
|---|---|---|---|---|---|
| `rajin` | Rajin | positif (hijau) | `icons/traits/trait_rajin.png` | `trait_rajin_16.png` | ada |
| `malas` | Malas | negatif (ungu-abu) | `icons/traits/trait_malas.png` | `trait_malas_16.png` | ada |
| `pemberani` | Pemberani | positif | `icons/traits/trait_pemberani.png` | `trait_pemberani_16.png` | ada |
| `penakut` | Penakut | negatif | `icons/traits/trait_penakut.png` | `trait_penakut_16.png` | ada |
| `periang` | Periang | positif | `icons/traits/trait_periang.png` | `trait_periang_16.png` | ada |
| `pemurung` | Pemurung | negatif | `icons/traits/trait_pemurung.png` | `trait_pemurung_16.png` | ada |
| `ramah` | Ramah | positif | `icons/traits/trait_ramah.png` | `trait_ramah_16.png` | ada |
| `pemarah` | Pemarah | negatif | `icons/traits/trait_pemarah.png` | `trait_pemarah_16.png` | ada |
| `sabar` | Sabar | positif | `icons/traits/trait_sabar.png` | `trait_sabar_16.png` | ada |
| `dermawan` | Dermawan | positif | `icons/traits/trait_dermawan.png` | `trait_dermawan_16.png` | ada |
| `pelit` | Pelit | negatif | `icons/traits/trait_pelit.png` | `trait_pelit_16.png` | ada |
| `suka_menolong` | Suka menolong | positif | `icons/traits/trait_suka_menolong.png` | `trait_suka_menolong_16.png` | ada |
| `jujur` | Jujur | positif | `icons/traits/trait_jujur.png` | `trait_jujur_16.png` | ada |
| `jahil` | Jahil | negatif | `icons/traits/trait_jahil.png` | `trait_jahil_16.png` | ada |
| `cerdas` | Cerdas | positif | `icons/traits/trait_cerdas.png` | `trait_cerdas_16.png` | ada |
| `religius` | Religius | positif | `icons/traits/trait_religius.png` | `trait_religius_16.png` | ada |
| `perantau` | Perantau | netral → bingkai hijau | `icons/traits/trait_perantau.png` | `trait_perantau_16.png` | **baru** (usul: buntalan kain di tongkat) |
| `ahli_tani` | Ahli tani | positif | `icons/traits/trait_ahli_tani.png` | `trait_ahli_tani_16.png` | **baru** (usul: caping + cangkul/padi) |
| `pandai_masak` | Pandai masak | positif | `icons/traits/trait_pandai_masak.png` | `trait_pandai_masak_16.png` | **baru** (usul: wajan/cobek ulekan) |
| `seniman` | Seniman | positif | `icons/traits/trait_seniman.png` | `trait_seniman_16.png` | **baru** (usul: topeng reog/dadak merak mini) |

`icons/traits/icon_kepala_desa.png` (sudah ada) bukan sifat; pakai untuk potret pemain di kartu dilema.

#### Efek sifat

Kolom efek (semua pengali relatif ke nilai sekarang; "aura" = mood untuk penduduk lain dalam radius 4 tile, per hari, maks 3 sumber aura yang ditumpuk):

| id | Kerja | Mood | Lapar/energi | Ancaman | Hubungan | Lain-lain |
|---|---|---|---|---|---|---|
| `rajin` | semua ×1.12 | — | energi ×1.10 | — | — | senang saat kerja bakti |
| `malas` | semua ×0.90 | +2/hari (santai) | energi ×0.85 | — | — | penalti keinginan gagal ×0.5 |
| `pemberani` | jaga/ronda: utilitas +8 | — | — | peluang usir ×1.5; pulang 0.03 hari lebih lambat; luka ×1.1; trauma ×0.5 | — | ikut ronda sukarela |
| `penakut` | kerja malam ×0.9 | — | — | pulang 0.05 hari (±1,2 jam) lebih awal saat jejak; tidak mau jaga malam; luka ×0.8; trauma ×1.5 | — | cerita "Penakut dan Babi Hutan" |
| `periang` | — | +1/hari; aura +1/hari | — | — | — | lomba makan kerupuk +0.2 (ambil alih peran `humoris`) |
| `pemurung` | ×1.08 saat sendirian | −2/hari; api unggun ×0.5 | — | — | gain ×0.7; konflik ×0.6 | menggantikan `pendiam` |
| `ramah` | — | — | — | — | gain ×1.25; konflik ×0.8 | **sambutan pendatang:** pendatang baru mulai dengan rel +15 dengannya (bukan 0) dan mood +5 saat tiba; pendatang tidak pergi dalam 14 hari pertama selama mood ≥ 30 |
| `pemarah` | ×1.05 saat sendirian | −1/hari | — | — | gain ×0.8; konflik ×2 | bisa jadi rival |
| `sabar` | — | — | — | — | konflik ×0.4 | duka ×0.7; penalti keinginan gagal ×0.6; laju keinginan ×0.8; ambang pergi −10 (mengambil peran `betah`) |
| `dermawan` | — | +1/hari | — | — | memberi hadiah 0.05/hari (+8) | biaya hadiah 1 makanan atau 1 kopi dari stok |
| `pelit` | — | −1 tiap ada pengeluaran besar (≥10) dari dilema/hajatan | lapar ×0.95 | — | gain ×0.9; tidak pernah memberi hadiah | tengkulak: opsi jual +5% |
| `suka_menolong` | kerja bakti, merawat, dan membangun bangunan/monumen ×1.15 | +2/hari jika ada anak <12 serumah | — | menolong saat serangan: rel +4 tambahan | menolong/merawat: rel +4 tambahan (di atas +10) | skill anak serumah ×1.25; duka atas anak ×1.3 (efek anak dari `penyayang_anak`); juga mengambil bonus bangun dari `kuat` |
| `jujur` | — | +3 saat menolak suap; −5 bila desa menerima suap | — | — | gain ×1.1; rel awal +5 dengan semua ("dipercaya") | **tidak pernah jadi pencuri** (dikecualikan dari varian pencuri warga); tengkulak tidak bisa curang timbangan bila ada ≥ 1 `jujur` (lihat D04); bereaksi di D03, D04, D06, D23 |
| `jahil` | — | +1/hari | — | — | **gosip** 0.08/hari (penggosip & pendengar +1, sasaran −4 dengan pendengar); **kejahilan** 0.06/hari: 3 penduduk terdekat +2 mood, 25% sasaran rel −3 dengannya (sasaran `pemarah` −6, `sabar` 0) | keinginan warga lain terlihat 1 hari lebih cepat (dari `tukang_gosip`); tidak pernah mencuri sungguhan — kejahilan hanya lelucon |
| `cerdas` | riset ×1.20 | — | — | — | — | skill gain ×1.25 (semua skill, termasuk bertani — mengambil sebagian peran skill `ahli_tani`); skill awal +0.1 pada 1 skill acak |
| `religius` | ×0.9 tiap hari ke-7 (Jumat) | +1/hari jika ada Langgar; +3 jika Masjid tahap 2 | — | — | — | duka ×0.7; bereaksi pada dilema "keramat"/riba |
| `perantau` | 1 skill acak +0.15 saat datang | — | — | — | gain ×0.9 (14 hari pertama) | ambang pergi +5; laju keinginan ×1.3 |
| `ahli_tani` | bertani ×1.20 | +1 saat panen | — | — | — | +1 hasil per panen yang ia kerjakan (skill awal bertani dipindah ke `cerdas`) |
| `pandai_masak` | dapur: `KITCHEN_EAT_BONUS` +0.05 (maks +0.10 desa) | — | — | — | — | biaya pangan festival/hajatan −10% |
| `seniman` | Pendopo Reog ×1.2 | aura +0.5 di api unggun malam | — | — | — | mood festival/lomba desa ×1.25 (sekali per desa) |

**Sifat lama yang dihapus dan ke mana efeknya pindah:** `humoris` → `periang` (aura, mood, lomba kerupuk) + `ramah` (gain ×1.25) + `sabar` (konflik rendah); `pendiam` → `pemurung`; `tukang_gosip` → `jahil`; `penyayang_anak` → `suka_menolong` (efek anak; bonus peluang hamil ×1.2 **dihapus**); `betah` → `sabar` (ambang pergi, laju keinginan) dan peran "akhirnya kerasan" di cerita `surat_kota`; `kuat` → `suka_menolong` (bangun) dan `rajin`/`pemberani` di lomba (bonus `CARRY` +1 dihapus); `ringkih` dihapus (sakit sudah diatur mood/musim); `penggemar_kopi` dihapus (keinginan `kopi_pagi` tetap ada, berbobot `rajin`/`pemurung`). `pemalas` berganti id menjadi `malas`.

**Pasangan yang bertentangan (6):** `rajin`–`malas`, `pemberani`–`penakut`, `periang`–`pemurung`, `sabar`–`pemarah`, `dermawan`–`pelit`, `jujur`–`jahil`. (`ramah`, `suka_menolong`, `cerdas`, `religius`, `perantau`, `ahli_tani`, `pandai_masak`, `seniman` tidak punya lawan.)

**Aturan pembagian:**
- **Pendiri** (2 penduduk awal): 2 sifat dari pool tanpa `malas`, `pemarah`, `pemurung`, dan minimal satu dari {`rajin`, `ahli_tani`, `suka_menolong`, `pandai_masak`}. Ini supaya awal game tidak lebih berat daripada sekarang.
- **Pendatang:** 2 sifat acak berbobot (bobot di blok JS), 25% dapat sifat ke-3; `perantau` berbobot ×2 untuk pendatang.
- **Anak:** lihat pewarisan di bawah.

#### Pewarisan sifat anak **[butuh SIKLUS-HIDUP]**

- Saat lahir, sifat disimpan tetapi **tersembunyi** ("?") sampai umur 8 (`AGE.childHelpFrom`). Log: "Sifat {nama} mulai terlihat: pemberani dan periang."
- Untuk 2 slot: tiap slot **45%** ambil acak dari gabungan sifat ayah+ibu, **15%** dari sifat sahabat orang tua/lansia mentor serumah ("ikut kebiasaan"), **40%** acak dari pool berbobot. Bentrok dengan slot pertama → ulang (maks 5 kali). `perantau` tidak diwariskan (hanya dari pengalaman/cerita).
- Sifat ke-3 (25%) baru ditentukan saat umur 16 (dewasa), dengan bias pengalaman: tumbuh dekat Pendopo Reog → `seniman` ×3; pernah diselamatkan dari ancaman → `pemberani` ×2; diasuh orang tua `suka_menolong` → `suka_menolong` ×2; orang tua meninggal saat ia anak-anak → `sabar` ×2 atau `pemurung` ×1.5; sering ikut sekolah/mentor (`sekolah_kota`, `mbah_pendongeng`) → `cerdas` ×2.
- Sifat bisa **berubah** hanya lewat cerita berantai (mis. `penakut` → `pemberani`, `perantau` → `sabar`), maks 1 perubahan per orang.

```js
// ---- TOKOH: sifat (docs/RISET-CERITA-TUJUAN.md §1.1). ikon: assets/icons/traits/trait_<id>.png (+ _16.png) ----
TRAITS: {
  perVillager: 2, thirdChance: 0.25, max: 3,
  auraRadius: 4, auraMaxStack: 3,
  iconDir: 'icons/traits/', iconPrefix: 'trait_', iconSmallSuffix: '_16',
  newIcons: ['perantau', 'ahli_tani', 'pandai_masak', 'seniman'],   // belum ada di manifest; sementara pakai ikon generik bingkai hijau
  conflicts: [['rajin', 'malas'], ['pemberani', 'penakut'], ['periang', 'pemurung'], ['sabar', 'pemarah'], ['dermawan', 'pelit'], ['jujur', 'jahil']],
  founderExclude: ['malas', 'pemarah', 'pemurung'], founderNeedOneOf: ['rajin', 'ahli_tani', 'suka_menolong', 'pandai_masak'],
  newcomerWeightMult: { perantau: 2 },
  inherit: { revealAge: 8, fromParents: 0.45, fromMentor: 0.15, random: 0.40, thirdAtAge: 16, rerollMax: 5, maxChangesPerLife: 1, noInherit: ['perantau'],
             thirdBias: { dekatPendopo: { seniman: 3 }, diselamatkan: { pemberani: 2 }, ortuSukaMenolong: { suka_menolong: 2 }, yatim: { sabar: 2, pemurung: 1.5 }, bersekolah: { cerdas: 2 } } },
  list: {
    rajin:         { kutub: '+', bobot: 1.0, workMult: 1.12, energyMult: 1.10 },
    malas:         { kutub: '-', bobot: 0.8, workMult: 0.90, energyMult: 0.85, moodPerDay: 2, wishFailMult: 0.5 },
    pemberani:     { kutub: '+', bobot: 0.9, jagaUtil: 8, scareMult: 1.5, fleeFracAdd: -0.03, threatDmgMult: 1.1, traumaMult: 0.5 },
    penakut:       { kutub: '-', bobot: 0.9, nightWorkMult: 0.9, fleeFracAdd: 0.05, noNightJaga: true, threatDmgMult: 0.8, traumaMult: 1.5 },
    periang:       { kutub: '+', bobot: 1.0, moodPerDay: 1, aura: 1.0, lombaBonus: { makan_kerupuk: 0.2 } },
    pemurung:      { kutub: '-', bobot: 0.7, moodPerDay: -2, aloneWorkMult: 1.08, fireMoodMult: 0.5, relGainMult: 0.7, conflictMult: 0.6 },
    ramah:         { kutub: '+', bobot: 1.0, relGainMult: 1.25, conflictMult: 0.8, welcome: { newcomerRel: 15, newcomerMood: 5, newcomerStayDays: 14, stayAboveMood: 30 } },
    pemarah:       { kutub: '-', bobot: 0.7, aloneWorkMult: 1.05, moodPerDay: -1, relGainMult: 0.8, conflictMult: 2.0 },
    sabar:         { kutub: '+', bobot: 0.9, conflictMult: 0.4, griefMult: 0.7, wishFailMult: 0.6, wishRateMult: 0.8, leaveMoodAdd: -10 },
    dermawan:      { kutub: '+', bobot: 0.9, moodPerDay: 1, giftChance: 0.05, giftRel: 8, giftCost: { makanan: 1 }, giftCostAlt: { kopi: 1 } },
    pelit:         { kutub: '-', bobot: 0.8, hungerMult: 0.95, relGainMult: 0.9, bigSpendMood: -1, bigSpendAt: 10, giftChance: 0, tengkulakBonus: 0.05 },
    suka_menolong: { kutub: '+', bobot: 1.0, helpWorkMult: 1.15, helpJobs: ['kerja_bakti', 'rawat', 'membangun'], helpRelAdd: 4, childHomeMood: 2, childSkillMult: 1.25, childGriefMult: 1.3 },
    jujur:         { kutub: '+', bobot: 0.9, neverThief: true, relGainMult: 1.1, trustRelStart: 5, noScaleCheat: true, bribeRefuseMood: 3, bribeTakenMood: -5 },
    jahil:         { kutub: '-', bobot: 0.7, moodPerDay: 1, gossipChance: 0.08, prankChance: 0.06, prankMood: 2, prankAudience: 3, prankRelChance: 0.25, prankRel: -3, prankRelMult: { pemarah: 2, sabar: 0 }, wishRevealDays: 1 },
    cerdas:        { kutub: '+', bobot: 0.9, skillGainMult: 1.25, jobMult: { meneliti: 1.2 }, skillStartRandom: 0.1 },
    religius:      { kutub: '+', bobot: 1.0, jumatWorkMult: 0.9, jumatEvery: 7, moodLanggar: 1, moodMasjid: 3, griefMult: 0.7 },
    perantau:      { kutub: '+', bobot: 0.8, skillStartAdd: 0.15, leaveMoodAdd: 5, wishRateMult: 1.3, earlyRelGainMult: 0.9, earlyDays: 14 },
    ahli_tani:     { kutub: '+', bobot: 0.9, jobMult: { bertani: 1.2 }, yieldAdd: 1, harvestMood: 1 },
    pandai_masak:  { kutub: '+', bobot: 0.8, kitchenBonusAdd: 0.05, kitchenBonusCap: 0.10, feastCostMult: 0.9 },
    seniman:       { kutub: '+', bobot: 0.6, jobMultMonumen: { pendopo_reog: 1.2 }, fireAura: 0.5, festivalMoodMult: 1.25 },
  },
},
```

### 1.2 Hubungan

Setiap pasangan penduduk menyimpan skor **−100 … +100** (`v.rel[idLain]`, simetris; simpan sekali per pasangan, mis. `S.rel['3-7']`).

| Tingkat | Skor | Ikon | Efek |
|---|---|---|---|
| **Rival** | ≤ −30 | ⚡ petir kecil | mood −1/hari jika dalam 6 tile > 1 jam game; kerja ×0.95 bila satu pekerjaan; peluang konflik ×2 |
| **Kenalan** | −29 … 19 | — | tidak ada |
| **Teman** | 20 … 49 | 🙂 | kerja ×1.05 bila dalam 4 tile; mood +0.5/hari per teman (maks +1.5) |
| **Sahabat** | ≥ 50 | 🤝 | kerja ×1.10 bersama; mood +1/hari per sahabat (maks +2); tidak pergi dari desa selama sahabat masih ada kecuali mood < 25; duka ekstra saat meninggal |
| **Pasangan** | flag, butuh skor ≥ 50 | ❤️ | mood +1.5/hari bila tidur serumah; peluang hamil naik sedikit; skor tidak turun di bawah 40 |
| *Keluarga* | flag (orang tua–anak, saudara) | 🏠 | skor awal 60/50; tidak turun di bawah 30 |

**Skor awal:** sesama pendiri +25 (sudah teman sejak awal, terasa hangat), pendatang 0 (+15 dengan penduduk `ramah`; +5 bila salah satunya `jujur`), orang tua–anak 60, saudara 50, pendatang yang datang berdua (event) 40.

**Pemicu (batas total kenaikan per pasangan per hari: +6; penurunan tidak dibatasi):**

| Pemicu | Perubahan | Syarat |
|---|---|---|
| Kerja bareng | +0.5 per 30 dtk game (maks +3/hari) | pekerjaan sama, ≤ 4 tile |
| Makan bareng | +1.5 per makan (maks +3/hari) | makan dalam 3 tile dari api/dapur yang sama |
| Ngobrol di api unggun | +1/malam | keduanya ≤ 3 tile dari api 18:00–21:00 |
| Ronda bareng | +5/malam | dua orang jaga/ronda di pos yang sama |
| Kerja bakti / gotong royong | +3 | ikut kerja bakti yang sama (§2.2) |
| Satu tim lomba | +5 (menang +8) | lomba 17 Agustus |
| Hadiah | +8 | dari `dermawan` atau keinginan terpenuhi |
| Menolong | +10 | merawat saat sakit, menyelamatkan saat serangan |
| Gosip | penggosip & pendengar +1; sasaran −4 dengan pendengar | `jahil` 0.08/hari, sasaran acak dari kenalan/rival |
| Kejahilan | 3 penonton +2 mood; 25% sasaran −3 dengan si jahil (`pemarah` −6, `sabar` 0) | `jahil` 0.06/hari |
| Sambutan | pendatang mulai +15 dengan penduduk `ramah` | saat pendatang tiba |
| Konflik | −8 keduanya, mood −4 | peluang 0.03/hari untuk pasangan skor < 0 dan sering bertemu (pemarah ×2, sabar ×0.4, ramah ×0.8, pemurung ×0.6) |
| Dilema/cerita | sesuai efek | kunci efek `rel` |

**Pelupaan (decay):** bila tidak ada interaksi 3 hari: teman/kenalan positif turun 0.5/hari ke 0; sahabat 0.25/hari; rival naik 0.3/hari ke 0 (dendam pelan-pelan reda). Pasangan & keluarga punya lantai.

**Kaitan dengan `PAIRING` [butuh SIKLUS-HIDUP]:**
- Syarat baru: skor hubungan **≥ 50 (sahabat)** + syarat lama (umur 18–50, mood ≥ 65 selama 2 hari, 0.15/hari).
- Syarat "tinggal serumah" diganti: bila sahabat beda rumah dan ada tempat kosong, setelah jadi pasangan mereka pindah serumah (log `log_hubungan.menjadi_pasangan`). Bila tidak ada tempat, jadi pasangan tetap boleh, tetapi kehamilan menunggu rumah (syarat kapasitas `PREGNANCY` tetap berlaku).
- Pasangan tidak bisa terbentuk antara rival atau keluarga.
- `PREGNANCY.chancePerDay` × `(1 + (skor − 50) / 200)` → skor 100 = ×1.25 (maks). Tidak ada sifat yang menaikkan peluang hamil (bonus `penyayang_anak` lama dihapus).
- Skor pasangan < 40 tidak mungkin (lantai). Bila skor sempat ditekan oleh dilema ke 40 selama 7 hari → status "renggang": peluang hamil ×0.5, mood −1/hari, cerita berantai bisa memperbaiki. Tidak ada cerai di V1.

**Duka berdasarkan hubungan** (menambah `DEATH`: −20 seketika, 5 hari × −3 untuk semua):

| Hubungan dengan yang meninggal | Tambahan |
|---|---|
| Pasangan | ×1.5 (`PAIRING.widowGriefMult`), boleh berpasangan lagi setelah 14 hari |
| Anak / orang tua | ×1.5, lama duka +3 hari |
| Sahabat | −10 seketika, lama duka +2 hari |
| Teman | −5 seketika |
| Rival | −3 seketika ("belum sempat berbaikan") |
| Kematian karena tua | semua di atas ×0.6 (`AGE.oldDeathGriefMult`) |

```js
// ---- TOKOH: hubungan (docs/RISET-CERITA-TUJUAN.md §1.2) ----
RELATION: {
  range: [-100, 100],
  start: { pendiri: 25, pendatang: 0, datangBerdua: 40, orangTuaAnak: 60, saudara: 50 },
  levels: { rival: -30, teman: 20, sahabat: 50 },               // di antara rival dan teman = kenalan
  floors: { pasangan: 40, keluarga: 30 },
  dailyGainCap: 6,
  gain: { kerjaPer30s: 0.5, kerjaMax: 3, kerjaRadius: 4, makan: 1.5, makanMax: 3, makanRadius: 3, apiMalam: 1, apiRadius: 3,
          ronda: 5, kerjaBakti: 3, lombaTim: 5, lombaMenang: 8, hadiah: 8, tolong: 10 },
  gossip: { speakerListener: 1, targetListener: -4 },               // sumber: sifat jahil
  welcome: { ramahRel: 15, jujurRel: 5 },
  conflict: { chancePerDay: 0.03, below: 0, rel: -8, mood: -4, meetHours: 1 },
  decay: { idleDays: 3, teman: 0.5, sahabat: 0.25, rivalRecover: 0.3 },
  fx: {
    teman:   { workMult: 1.05, radius: 4, moodPerDay: 0.5, moodCap: 1.5 },
    sahabat: { workMult: 1.10, radius: 4, moodPerDay: 1.0, moodCap: 2.0, noLeaveAboveMood: 25 },
    rival:   { workMult: 0.95, moodPerDay: -1, radius: 6, minHours: 1, conflictMult: 2 },
    pasangan:{ moodPerDay: 1.5, sameHouse: true, renggangBelow: 40, renggangDays: 7, renggangPregMult: 0.5, renggangMood: -1 },
  },
  pairing: { minRel: 50, noRival: true, noFamily: true, moveIn: true },   // ditambahkan ke PAIRING
  pregnancyRelMult: { from: 50, per: 200, maxTotal: 1.25 },               // (1 + (rel-50)/200)
  grief: { pasanganMult: 1.5, keluargaMult: 1.5, keluargaDaysAdd: 3, sahabatInstant: -10, sahabatDaysAdd: 2, temanInstant: -5, rivalInstant: -3 },
},
```

### 1.3 Keinginan pribadi (26 keinginan)

Satu penduduk punya maksimal **1 keinginan aktif**. Muncul sebagai gelembung kecil di atas kepala + kartu di panel "Keinginan Warga". Dua jenis pemenuhan:
- **Otomatis:** sistem mengecek kondisi (mis. "ada Langgar", "ikut ronda").
- **Tombol "Penuhi"**: pemain membayar biaya dari stok. Ini yang menjadi keputusan kecil harian.

**Laju muncul:** 0.08/hari per penduduk umur ≥ 8, mulai **era Dusun dan hari ≥ 12**. Jeda per orang 5 hari setelah keinginan selesai/gagal. Batas aktif desa `ceil(pop/3) + 1`. Pengali: `perantau` ×1.3, `sabar` ×0.8. Keinginan berbiaya pangan > 2 baru muncul **mulai hari 25** (melindungi d24).

**Durasi bawaan:** 7 hari (rentang 4–14; khusus tabungan haji 56 hari).
**Hadiah:** mood seketika + buff harian selama 3 hari. **Gagal (kedaluwarsa):** mood negatif kecil. Tidak ada penalti bila FAMINE ≥ `bahaya` ("warga maklum, sedang susah").

| id | Keinginan | Syarat muncul | Cara | Biaya | Durasi | Hadiah (seketika / buff) | Gagal |
|---|---|---|---|---|---|---|---|
| `makan_rendang` | Ingin makan rendang | dusun, hari ≥ 25 | tombol | makanan 3, kelapa 2, minyak 1 | 7 | +10 / +2×3 hari | −5 |
| `nasi_pecel` | Ingin nasi pecel | dusun | tombol | makanan 2 | 6 | +8 / +1×3 | −4 |
| `kopi_pagi` | Ngopi pagi di teras | kopi dikenal (bobot `rajin`, `pemurung` ×2) | tombol | kopi 1/hari × 3 hari | 5 | +6 / +3 selama 3 hari | −3 |
| `rumah_panggung` | Punya rumah panggung | dusun, bambu dikenal | otomatis: Rumah Panggung dibangun & ia tinggal di sana | — | 14 | +15 / +1×3 | −6 |
| `nonton_reog` | Nonton reog | hari ≥ 30 | otomatis: ada pentas reog (D16, Pendopo tahap 2, festival) | — | 14 | +12 / +2×3 | −5 |
| `tabungan_haji` | Menabung untuk naik haji | religius, umur ≥ 30, kota_kecil atau tahun 3+ | tombol bertahap: setor ke celengan kapan saja | total kopi 20 + alat 6 (boleh dicicil) | 56 | +25, penduduk +5, gelar "Pak/Bu Haji"; pergi 7 hari | −4 (boleh ulang tahun depan) |
| `mancing_sore` | Mancing sore di kali | ada sungai, bukan kemarau | otomatis: dapat 1 jam bebas | — | 5 | +6, makanan +1 | −2 |
| `punya_ayam` | Punya ayam sendiri | dusun | otomatis: kandang ayam ada | — | 10 | +8 / +1×3 | −3 |
| `baju_baru` | Baju baru untuk Lebaran/Agustusan | ada pedagang/pasar | tombol | kulit 2 atau kopi 2 | 7 | +8 / +1×3 | −4 |
| `ziarah_makam` | Ziarah ke makam keluarga | ada Makam kerabat/sahabat | otomatis: 0.1 hari di makam | — | 7 | +6, sisa duka −2 hari | −3 |
| `wayang_semalam` | Nonton wayang kulit semalam suntuk | desa_pertanian | tombol | kulit 3, minyak 2 | 10 | +10 dirinya, +4 semua | −4 |
| `tidur_siang` | Tidur siang di bale-bale | malas | otomatis: istirahat 0.1 hari | — | 4 | +6 | −2 |
| `kerja_bakti` | Ikut kerja bakti | rajin/suka_menolong | otomatis: kerja bakti dalam durasi | — | 7 | +6, rel +2 dengan peserta | −3 |
| `ngobrol_sahabat` | Ngobrol lama dengan sahabat | punya teman/sahabat (bobot `ramah`, `periang` ×2) | otomatis: makan/api bersama 2 kali | — | 5 | +5, rel +3 | −2 |
| `punya_anak` | Ingin punya momongan | pasangan, syarat hamil terpenuhi kecuali peluang | otomatis: hamil | — | 14 | +15 | −3 **[butuh SIKLUS-HIDUP]** |
| `sawah_menguning` | Melihat sawah menguning | mareng | otomatis: ≥ 3 petak siap panen | — | 5 | +6, semua +1 | −2 |
| `jajan_pasar` | Jajan klepon & cenil di pasar | pasar ada | tombol | makanan 1 | 5 | +6 | −2 |
| `belajar_gamelan` | Belajar gamelan | balai atau Pendopo Reog (bobot `seniman` ×3, `cerdas` ×2) | otomatis: 0.15 hari di bangunan itu | — | 10 | +8, skill meneliti +0.05 | −3 |
| `rujak_bareng` | Rujakan bareng tetangga | kemarau | tombol | makanan 2 (kelapa 1 opsional, +2 mood) | 5 | +6 dirinya, +2 sekitar | −2 |
| `bancakan_weton` | Bancakan weton (hari lahir Jawa) | tiap 35 hari umur hidup di desa | tombol | makanan 3 | 4 | +8, rel +2 dengan serumah | −3 |
| `pulang_kampung` | Pulang kampung sebentar | perantau | tombol: izin pergi 3 hari | makanan 2 (bekal) | 10 | +10; 30%: bawa oleh-oleh alat 1 | −6, ambang pergi +5 selama 14 hari |
| `ronda_malam` | Ikut ronda | pemberani, pos ronda ada | otomatis: 1 malam jaga | — | 7 | +6 | −2 |
| `main_layangan` | Main layangan | anak 6–12, mareng/kemarau | tombol | bambu 1, sabut 1 | 5 | +8 anak, +3 orang tua | −2 |
| `menang_lomba` | Menang lomba 17-an | hari tahun 14–21 | otomatis: menang satu lomba | — | sampai hari 21 | +12 | −3 |
| `tumpeng_syukuran` | Tumpengan syukur panen | setelah panen ke-3 dalam musim | tombol | makanan 4, gandum 2 | 6 | +8, semua +2 | −3 |
| `mandi_kali` | Mandi di kali bareng | hujan | otomatis: 0.05 hari di sungai | — | 4 | +4 | −1 |

```js
// ---- TOKOH: keinginan (docs/RISET-CERITA-TUJUAN.md §1.3) ----
WISHES: {
  minEra: 'dusun', minDay: 12, foodWishMinDay: 25, foodWishThreshold: 2,
  chancePerDay: 0.08, minAge: 8, gapDays: 5, perVillager: 1, activeCapFn: 'ceil(pop/3)+1',
  defaultDays: 7, buffDays: 3, noPenaltyFamine: ['bahaya', 'kritis', 'kolaps'],
  list: {
    makan_rendang:   { cara: 'tombol', biaya: { makanan: 3, kelapa: 2, minyak: 1 }, hari: 7, mood: 10, buff: 2, gagal: -5, minDay: 25 },
    nasi_pecel:      { cara: 'tombol', biaya: { makanan: 2 }, hari: 6, mood: 8, buff: 1, gagal: -4 },
    kopi_pagi:       { cara: 'tombol', biaya: { kopi: 3 }, hari: 5, mood: 6, buff: 3, gagal: -3, butuh: 'kopiDikenal', bobotSifat: { rajin: 2, pemurung: 2 } },
    rumah_panggung:  { cara: 'otomatis', cek: 'tinggalDi:rumah_panggung', hari: 14, mood: 15, buff: 1, gagal: -6, butuh: 'bambuDikenal' },
    nonton_reog:     { cara: 'otomatis', cek: 'pentasReog', hari: 14, mood: 12, buff: 2, gagal: -5, minDay: 30, bobotSifat: { seniman: 3 } },
    tabungan_haji:   { cara: 'cicil', biaya: { kopi: 20, alat: 6 }, hari: 56, mood: 25, moodDesa: 5, gagal: -4, pergiHari: 7, gelar: true,
                       butuhSifat: 'religius', minAge: 30, minEra: 'kota_kecil', atauTahun: 3 },
    mancing_sore:    { cara: 'otomatis', cek: 'jamBebas:0.04', hari: 5, mood: 6, hasil: { makanan: 1 }, gagal: -2, bukanMusim: ['kemarau'] },
    punya_ayam:      { cara: 'otomatis', cek: 'bangunan:kandang_ayam', hari: 10, mood: 8, buff: 1, gagal: -3 },
    baju_baru:       { cara: 'tombol', biaya: { kulit: 2 }, biayaAlt: { kopi: 2 }, hari: 7, mood: 8, buff: 1, gagal: -4, butuh: 'pedagangAtauPasar' },
    ziarah_makam:    { cara: 'otomatis', cek: 'kunjungi:makam:0.1', hari: 7, mood: 6, dukaKurangHari: 2, gagal: -3 },
    wayang_semalam:  { cara: 'tombol', biaya: { kulit: 3, minyak: 2 }, hari: 10, mood: 10, moodDesa: 4, gagal: -4, minEra: 'desa_pertanian' },
    tidur_siang:     { cara: 'otomatis', cek: 'istirahat:0.1', hari: 4, mood: 6, gagal: -2, butuhSifat: 'malas' },
    kerja_bakti:     { cara: 'otomatis', cek: 'ikutKerjaBakti', hari: 7, mood: 6, rel: 2, gagal: -3, bobotSifat: { rajin: 3, suka_menolong: 2 } },
    ngobrol_sahabat: { cara: 'otomatis', cek: 'bersamaTeman:2', hari: 5, mood: 5, rel: 3, gagal: -2, bobotSifat: { ramah: 2, periang: 2 } },
    punya_anak:      { cara: 'otomatis', cek: 'hamil', hari: 14, mood: 15, gagal: -3, butuh: 'pasanganSiapHamil' },
    sawah_menguning: { cara: 'otomatis', cek: 'petakSiap:3', hari: 5, mood: 6, moodDesa: 1, gagal: -2, musim: ['mareng'] },
    jajan_pasar:     { cara: 'tombol', biaya: { makanan: 1 }, hari: 5, mood: 6, gagal: -2, butuh: 'bangunan:pasar' },
    belajar_gamelan: { cara: 'otomatis', cek: 'kunjungi:balai|pendopo_reog:0.15', hari: 10, mood: 8, skill: { meneliti: 0.05 }, gagal: -3, bobotSifat: { seniman: 3, cerdas: 2 } },
    rujak_bareng:    { cara: 'tombol', biaya: { makanan: 2 }, hari: 5, mood: 6, moodSekitar: 2, gagal: -2, musim: ['kemarau'] },
    bancakan_weton:  { cara: 'tombol', biaya: { makanan: 3 }, hari: 4, mood: 8, relSerumah: 2, gagal: -3, siklusHari: 35, minDay: 25 },
    pulang_kampung:  { cara: 'tombol', biaya: { makanan: 2 }, hari: 10, mood: 10, pergiHari: 3, olehOleh: { chance: 0.3, alat: 1 }, gagal: -6, gagalLeaveAdd: 5, butuhSifat: 'perantau' },
    ronda_malam:     { cara: 'otomatis', cek: 'jagaMalam:1', hari: 7, mood: 6, gagal: -2, bobotSifat: { pemberani: 3 } },
    main_layangan:   { cara: 'tombol', biaya: { bambu: 1, sabut: 1 }, hari: 5, mood: 8, moodOrtu: 3, gagal: -2, umur: [6, 12], musim: ['mareng', 'kemarau'] },
    menang_lomba:    { cara: 'otomatis', cek: 'menangLomba', hariTahun: [14, 21], mood: 12, gagal: -3 },
    tumpeng_syukuran:{ cara: 'tombol', biaya: { makanan: 4, gandum: 2 }, hari: 6, mood: 8, moodDesa: 2, gagal: -3, minDay: 25 },
    mandi_kali:      { cara: 'otomatis', cek: 'kunjungi:sungai:0.05', hari: 4, mood: 4, gagal: -1, musim: ['hujan'] },
  },
},
```

### 1.4 Cerita berantai per tokoh (10 rantai)

Rantai dipicu oleh sifat/keadaan seorang tokoh (`{nama}`) dan kadang tokoh kedua (`{nama2}`). Satu desa maksimal **2 rantai aktif**; satu tokoh maksimal 1. Langkah berikutnya dijadwalkan beberapa hari kemudian (bisa menjadi pengisi hari kosong, §3.4). Rantai yang sudah selesai tidak berulang untuk tokoh yang sama; rantai lain boleh muncul untuk tokoh lain setelah 56 hari.

| id | Pemicu (tokoh) | Langkah 1 | Langkah 2 | Langkah 3 | Langkah 4 / akhir |
|---|---|---|---|---|---|
| `warok_muda` | `seniman` atau `pemberani`, hari ≥ 30 | Menemukan rangka dadak merak tua di gudang. **Perbaiki** (kulit 2, bambu 6) / **Simpan** (selesai, mood −3) | +3–5 hari: latihan malam 3 malam (energi −10/malam). **Dukung** (rel +4 dengan peserta) / **Larang karena capek** (selesai, mood −4) | +4 hari: 30% jatuh saat latihan (kesehatan −15) lalu tetap lanjut, 70% lancar | Pentas di Hari Jadi/17-an berikutnya: semua +10, tokoh dapat `pemberani` (jika belum, bukan `penakut`), Pendopo Reog tahap 1 diskon 20% |
| `surat_kota` | `perantau`, ada pedagang | Surat dari kota: ibunya sakit. **Izinkan pulang 5 hari** (makanan −3) / **Tunda** (mood −6) | Izinkan: kembali bawa alat 2 + kopi 4; 40% membawa adiknya (penduduk +1 jika ada tempat). Tunda: keinginan `pulang_kampung` paksa muncul | +14 hari: ia ditanya akan tinggal. Jika rel tertinggi ≥ 50 → sifat berubah `perantau` → `sabar` ("sudah kerasan") | Bila mood < 50: 20% pamit baik-baik (penduduk −1, semua −5) |
| `resep_nenek` | `pandai_masak`, dusun, hari ≥ 25 | Teringat resep pecel nenek. **Cari bahan** (makanan 3, kelapa 1) / **Lain kali** (selesai) | +2 hari: coba masak; sukses 70% (100% jika ada Dapur) | Sukses: **Buka warung di pasar** (makanan jual +10% permanen) / **Untuk kenduri saja** (mood semua +6). Gagal: "kepedasan", semua +2, ulang 7 hari lagi | — |
| `penakut_babi` | `penakut` setelah serangan babi hutan | Ia gemetar tiap senja. **Ajak ronda bersama sahabat** / **Biarkan istirahat** (mood +4, selesai) | 3 malam ronda: rel +5/malam dengan rekan | Babi hutan datang: 50% ia memukul kentongan duluan → `penakut` diganti `pemberani`, semua +5. 50% lari → trauma 3 hari (mood −8), rel +10 dengan penolong | Pencapaian baru "Nyali Kentongan" |
| `kucing_belang` | ada anak atau `suka_menolong` | Anak kucing tersesat di lumbung. **Pelihara** (makanan −1 tiap 3 hari) / **Antar ke desa sebelah** (rel tetangga +, selesai) | +7 hari: kucing besar, tikus lumbung ×0.6, ular dekat rumah ×0.7 | +21 hari: kucing beranak 3. **Bagi ke desa sebelah** (bonus D18) / **Pelihara semua** (pemilik +2/hari, makanan −1/2 hari) | — |
| `cinta_segitiga` | A dan B sama-sama teman/sahabat dengan C (umur 18–50) | Gosip ramai. **Biarkan alami** / **Atur ronda A–C** / **Atur ronda B–C** | +5 hari: C memilih skor tertinggi → pasangan bila syarat PAIRING terpenuhi | Yang tidak dipilih: rel A–B −20 (bisa jadi rival), mood −8 | +14 hari: jika A dan B satu tim lomba/kerja bakti → rel +25, jadi teman; jika tidak, rival permanen sampai cerita lain |
| `bidan_desa` | `suka_menolong`, kehamilan pertama di desa **[butuh SIKLUS-HIDUP]** | Ingin belajar dari bidan kecamatan. **Izinkan 3 hari** (makanan −2) / **Tidak sekarang** (selesai) | Kembali: risiko kelahiran ×0.5 desa | **Bangun Posyandu** (kayu 15, bambu 10): sakit anak ×0.5, poin Teladan +0.5 / **Cukup di rumah** | — |
| `kopi_pertama` | `ahli_tani` atau `cerdas`, desa_pertanian, belum ada kebun kopi | Pedagang memberi bibit kopi. **Tanam percobaan** (kayu 5) / **Jual bibitnya** (alat 1) | +14 hari: panen pertama kopi +4, kopi dikenal | Tradisi ngopi pagi: keinginan `kopi_pagi` aktif | "Kopi desa terkenal": jual kopi +15%, membuka D20 |
| `rival_sawah` | dua `ahli_tani` atau `ahli_tani` + `pemarah` dengan rel < 10 | Saling klaim petak terbaik. **Adu panen musim ini** / **Bagi petak** (rel +5, selesai) | Musim berakhir: pemenang hasil terbanyak mood +10, kalah −6, rel −10 | **Ajak kerja bakti bareng** (rel +15) / **Biarkan** | Bila rel ≥ 20: keduanya dapat kerja ×1.05 bila bersama (gelar "Duo Tani") |
| `mbah_pendongeng` | lansia 55+ `periang`/`seniman` dan ada anak **[butuh SIKLUS-HIDUP]** | Mendongeng tiap malam: anak skill gain ×1.2; anak yang ikut dapat bias `cerdas` ×2 untuk sifat ke-3 | +14 hari: keinginan terakhir "nonton reog sekali lagi" (keinginan `nonton_reog`, 21 hari) | Terpenuhi sebelum wafat → duka desa ×0.5, sifat `seniman` 30% menurun ke satu anak | Tidak terpenuhi → duka normal, log kenangan |

```js
// ---- TOKOH: cerita berantai (docs/RISET-CERITA-TUJUAN.md §1.4). efek memakai kunci applyEffects + kunci baru (§4.2) ----
STORY_CHAINS: {
  maxActive: 2, perVillager: 1, repeatOtherVillagerDays: 56, checkChancePerDay: 0.12,
  warok_muda: { syarat: { sifatSalah: ['seniman', 'pemberani'], minDay: 30, era: 'dusun' }, langkah: [
    { pilihan: [{ efek: { kulit: -2, bambu: -6 }, lanjut: 1, jeda: [3, 5] }, { efek: { mood_aktor: -3 }, lanjut: null }] },
    { pilihan: [{ efek: { energi_aktor: -10, rel_peserta: 4 }, lanjut: 2, jeda: [4, 4] }, { efek: { mood_aktor: -4 }, lanjut: null }] },
    { acak: [{ peluang: 0.3, efek: { kesehatan_aktor: -15 } }, { peluang: 0.7, efek: {} }], lanjut: 3, tunggu: 'pentasBerikut' },
    { efek: { suasana_hati: 10, sifat_aktor: 'pemberani', diskon_monumen: { pendopo_reog: 0.2 } }, lanjut: null } ] },
  surat_kota: { syarat: { sifat: 'perantau', butuh: 'pedagangPernahDatang' }, langkah: [
    { pilihan: [{ efek: { makanan: -3, absen_aktor: 5 }, lanjut: 1, jeda: [5, 5] }, { efek: { mood_aktor: -6, paksa_keinginan: 'pulang_kampung' }, lanjut: 2, jeda: [14, 14] }] },
    { efek: { alat: 2, kopi: 4 }, acak: [{ peluang: 0.4, efek: { penduduk: 1 } }], lanjut: 2, jeda: [14, 14] },
    { cek: { relTertinggi: 50 }, ya: { sifat_ganti: ['perantau', 'sabar'] }, tidak: { acak: [{ peluang: 0.2, syaratMoodBawah: 50, efek: { pamit_aktor: 1, suasana_hati: -5 } }] }, lanjut: null } ] },
  resep_nenek: { syarat: { sifat: 'pandai_masak', era: 'dusun', minDay: 25 }, langkah: [
    { pilihan: [{ efek: { makanan: -3, kelapa: -1 }, lanjut: 1, jeda: [2, 2] }, { efek: {}, lanjut: null }] },
    { acak: [{ peluang: 0.7, peluangDenganDapur: 1.0, lanjut: 2 }, { peluang: 0.3, efek: { suasana_hati: 2 }, ulangHari: 7, lanjut: 1 }] },
    { pilihan: [{ efek: { harga_jual_makanan_permanen: 0.10 } }, { efek: { suasana_hati: 6 } }], lanjut: null } ] },
  penakut_babi: { syarat: { sifat: 'penakut', setelah: 'seranganBabi' }, langkah: [
    { pilihan: [{ efek: { tugas_aktor: 'ronda', malam: 3 }, lanjut: 1, jeda: [3, 3] }, { efek: { mood_aktor: 4 }, lanjut: null }] },
    { efek: { rel_rekan_ronda: 5 }, lanjut: 2, tunggu: 'babiMendekat', batasHari: 28 },
    { acak: [{ peluang: 0.5, efek: { sifat_ganti: ['penakut', 'pemberani'], suasana_hati: 5, pencapaian: 'A25' } }, { peluang: 0.5, efek: { trauma_aktor: 3, mood_aktor: -8, rel_penolong: 10 } }], lanjut: null } ] },
  kucing_belang: { syarat: { adaAnakAtauSifat: 'suka_menolong' }, langkah: [
    { pilihan: [{ efek: { biaya_berkala: { makanan: 1, tiapHari: 3 } }, lanjut: 1, jeda: [7, 7] }, { efek: { rel_tetangga: 1 }, lanjut: null }] },
    { efek: { tikus_mult: 0.6, ular_rumah_mult: 0.7 }, lanjut: 2, jeda: [21, 21] },
    { pilihan: [{ efek: { rel_tetangga: 2 } }, { efek: { mood_pemilik_harian: 2, biaya_berkala: { makanan: 1, tiapHari: 2 } } }], lanjut: null } ] },
  cinta_segitiga: { syarat: { segitigaRel: 20, umur: [18, 50] }, langkah: [
    { pilihan: [{ efek: {}, lanjut: 1 }, { efek: { ronda_pasangan: 'AC' }, lanjut: 1 }, { efek: { ronda_pasangan: 'BC' }, lanjut: 1 }], jeda: [5, 5] },
    { efek: { pilih_pasangan: 'C', rel_AB: -20, mood_yang_kalah: -8 }, lanjut: 2, jeda: [14, 14] },
    { cek: { satuTim: 'AB' }, ya: { rel_AB: 25 }, tidak: {}, lanjut: null } ] },
  bidan_desa: { syarat: { sifat: 'suka_menolong', setelah: 'kehamilanPertama' }, langkah: [
    { pilihan: [{ efek: { makanan: -2, absen_aktor: 3 }, lanjut: 1, jeda: [3, 3] }, { efek: {}, lanjut: null }] },
    { efek: { risiko_lahir_mult: 0.5 }, lanjut: 2, jeda: [2, 4] },
    { pilihan: [{ efek: { kayu: -15, bambu: -10, bangun_gratis: 'posyandu', sakit_anak_mult: 0.5, teladan_poin: 0.5 } }, { efek: {} }], lanjut: null } ] },
  kopi_pertama: { syarat: { sifatSalah: ['ahli_tani', 'cerdas'], era: 'desa_pertanian', belumAda: 'kebun_kopi' }, langkah: [
    { pilihan: [{ efek: { kayu: -5 }, lanjut: 1, jeda: [14, 14] }, { efek: { alat: 1 }, lanjut: null }] },
    { efek: { kopi: 4, kopi_dikenal: 1 }, lanjut: 2, jeda: [3, 5] },
    { efek: { buka_keinginan: 'kopi_pagi' }, lanjut: 3, jeda: [10, 14] },
    { efek: { harga_jual_kopi_permanen: 0.15, buka_dilema: 'kontrak_kopi' }, lanjut: null } ] },
  rival_sawah: { syarat: { duaSifat: [['ahli_tani', 'ahli_tani'], ['ahli_tani', 'pemarah']], relBawah: 10 }, langkah: [
    { pilihan: [{ efek: { adu_panen: 'musimIni' }, lanjut: 1, tunggu: 'akhirMusim' }, { efek: { rel_AB: 5 }, lanjut: null }] },
    { efek: { mood_pemenang: 10, mood_kalah: -6, rel_AB: -10 }, lanjut: 2, jeda: [1, 2] },
    { pilihan: [{ efek: { rel_AB: 15, kerja_bakti_gratis: 1 } }, { efek: {} }], cek: { relAB: 20 }, ya: { duo_kerja_mult: 1.05 }, lanjut: null } ] },
  mbah_pendongeng: { syarat: { umurMin: 55, sifatSalah: ['periang', 'seniman'], adaAnak: true }, langkah: [
    { efek: { skill_anak_mult: 1.2, bias_sifat_anak: { cerdas: 2 } }, lanjut: 1, jeda: [14, 14] },
    { efek: { paksa_keinginan: 'nonton_reog', hari: 21 }, lanjut: 2, tunggu: 'keinginanSelesaiAtauWafat' },
    { cek: { keinginanTerpenuhi: true }, ya: { duka_mult_aktor: 0.5, warisan_sifat: { seniman: 0.3 } }, tidak: {}, lanjut: null } ] },
},
```

---

## 2. TUJUAN JANGKA PANJANG

### 2.1 Monumen bertahap (5 monumen)

Monumen = bangunan besar dengan **tahap**. Pemain menaruh fondasinya sekali; tiap tahap dibuka dengan tombol "Mulai tahap N" (biaya dibayar di muka seperti riset) lalu dikerjakan penduduk berprioritas `bangun` seperti bangunan biasa (`work` = detik kerja 1 orang dengan `workMult` 1). Selama tahap dikerjakan, bonus tahap sebelumnya tetap aktif. Tampilan: sprite berubah per tahap + bar progres di atas bangunan dan di panel "Tujuan Desa".

**Kapan dibuka:** semua monumen **minDay 25** (setelah pengukuran d24). Satu tahap monumen aktif pada satu waktu (dua dengan Balai Desa Megah tahap 1), supaya tenaga tidak tersedot habis dari pangan.

**Perkiraan waktu per tahap:** biaya material = 3–8 hari kumpul; `work` 150–800 ≈ 0.5–3 hari dengan 3 tukang. Satu monumen selesai dalam ±25–45 hari bila dikejar, jadi 5 monumen mengisi hari 25 sampai 200+.

| Monumen | Ukuran | Tahap | Era | Biaya | Work | Bonus tahap (kumulatif) |
|---|---|---|---|---|---|---|
| **Langgar → Masjid Jami'** (`masjid`) | 3×3 → 4×4 | 1 Langgar Bambu | dusun | kayu 30, bambu 30, batu 10 | 150 | `religius` +1 mood/hari; adzan subuh: bangun 0.01 hari lebih awal; duka −1 hari |
| | | 2 Masjid Kayu | desa_pertanian | kayu 60, batu 60, papan 30, bambu 20 | 320 | semua +1 mood/hari (`religius` +3); duka desa ×0.75; event tahunan **Halal bihalal**: rel +5 semua pasangan yang rival/kenalan |
| | | 3 Masjid Jami' (menara & bedug) | kota_kecil | batu_bata 60, batu 40, papan 30, alat 4, minyak 6 | 520 | ambang pergi −5 semua; durasi keinginan +2 hari; poin Teladan +1; membuka keinginan `tabungan_haji` |
| **Balai Desa Megah** (`balai_megah`, upgrade dari `balai`) | 4×3 | 1 Serambi & Kentongan Besar | kota_kecil | papan 30, bambu 30, sabut 10 | 200 | +1 slot tahap monumen paralel; dilema dapat opsi ke-4 **"Musyawarah"** (tunda 1 hari, rel +2 peserta, efek opsi terbaik −20%) |
| | | 2 Pendopo Joglo | kota_kecil | kayu 80, papan 40, batu 40, alat 3 | 420 | semua +1 mood/hari; `SPAWN.cooldownDays` −1; jumlah lomba 17-an +1; kerja bakti cooldown 7 → 5 hari |
| | | 3 Balai Megah (ukiran & gamelan) | kota_kecil | batu_bata 80, papan 30, kopi 10, minyak 10 | 620 | festival & Hari Jadi mood ×1.25; kuota pasar +15%; poin Teladan +1 |
| **Bendungan & Irigasi** (`bendungan`, di tepi sungai `RIVER_X` ±2) | 3×2 | 1 Bendung Bronjong Bambu | desa_pertanian | bambu 40, batu 30, sabut 10 | 200 | `floodChance` hujan ×0.7 |
| | | 2 Saluran Induk | desa_pertanian | batu 80, kayu 30, alat 2 | 360 | sawah/tegalan ≤ 10 tile dari saluran: padi tumbuh di kemarau (`irrigatedInHard`, ×1.5 lama); `wellYieldAdd` kemarau −1 → 0 |
| | | 3 Pintu Air | kota_kecil | batu 60, papan 30, batu_bata 20, alat 4 | 460 | banjir ×0.4 (total), longsor ×0.7; `failHarvestChance` kemarau 0.20 → 0.12 |
| | | 4 Bendungan & Embung | kota_kecil | batu 100, batu_bata 80, alat 6 | 800 | kemarau `waterMult` 1.5 → 1.2; `droughtChance` 0.12 → 0.06; ikan kemarau ×0.5 → ×0.8; semua +0.5 mood/hari; poin Teladan +1 |
| **Pendopo Reog** (`pendopo_reog`) | 4×3 | 1 Sanggar Latihan | dusun (hari ≥ 30) | bambu 30, kayu 20, kulit 4 | 160 | penduduk dekat sanggar malam +0.5 mood; keinginan `belajar_gamelan` terpenuhi di sini |
| | | 2 Dadak Merak & Gamelan | desa_pertanian | kulit 10, bambu 20, sabut 10, minyak 4 | 260 | **Pentas Reog** di Hari Jadi & 17 Agustus: semua +12; anak ikut jadi jathil/bujang ganong (rel anak–dewasa +4); keinginan `nonton_reog` terpenuhi |
| | | 3 Pendopo Agung | kota_kecil | kayu 60, papan 40, batu 40, batu_bata 30, kopi 8 | 520 | hari festival: harga jual pasar +10%; peluang pendatang ×1.2; poin Teladan +1 |
| **Pasar Legi** (`pasar_legi`, upgrade dari `pasar`) | 4×3 | 1 Los Bambu | desa_pertanian | bambu 40, kayu 20, papan 10 | 160 | kuota pasar +20% |
| | | 2 Hari Pasaran | desa_pertanian | papan 20, batu 30, kelapa 15, minyak 5 | 300 | siklus pasaran Jawa 5 hari (Legi, Pahing, Pon, Wage, Kliwon): tiap **Legi** pedagang pasti datang; harga beli −5% hari itu |
| | | 3 Pasar Batu Bata | kota_kecil | batu_bata 60, batu 40, alat 3, kopi 10 | 460 | +1 slot kontrak (`T19`); jual kopi & kelapa +10%; poin Teladan +1 |

**Kerja bakti (gotong royong)** — tombol di panel monumen, dipakai juga oleh dilema dan keinginan:
- Semua dewasa dan remaja mengutamakan monumen/bangunan aktif sampai jam 17:00 (frac 0.71), kerja ×1.25, mood +4 seketika, rel +3 antarpeserta.
- Biaya: makan bersama `makanan` 0.5 per peserta (dibulatkan ke atas) + teh/kopi opsional (kopi 2 → mood +2 lagi).
- Cooldown 7 hari (5 dengan Pendopo Joglo). Tidak bisa saat FAMINE ≥ `bahaya` atau malam.

```js
// ---- TUJUAN: monumen & kerja bakti (docs/RISET-CERITA-TUJUAN.md §2.1) ----
MONUMENTS: {
  minDay: 25, parallel: 1, parallelBalaiMegah: 2,
  masjid: { nama: 'Masjid Jami\'', w: 4, h: 4, stages: [
    { nama: 'Langgar Bambu', era: 'dusun', cost: { kayu: 30, bambu: 30, batu: 10 }, work: 150, fx: { moodSifat: { religius: 1 }, wakeEarly: 0.01, griefDaysAdd: -1 } },
    { nama: 'Masjid Kayu', era: 'desa_pertanian', cost: { kayu: 60, batu: 60, papan: 30, bambu: 20 }, work: 320, fx: { moodAll: 1, moodSifat: { religius: 3 }, griefMult: 0.75, yearlyEvent: 'halal_bihalal' } },
    { nama: 'Masjid Jami\'', era: 'kota_kecil', cost: { batu_bata: 60, batu: 40, papan: 30, alat: 4, minyak: 6 }, work: 520, fx: { leaveMoodAdd: -5, wishDaysAdd: 2, teladan: 1, unlockWish: 'tabungan_haji' } } ] },
  balai_megah: { nama: 'Balai Desa Megah', needs: 'balai', w: 4, h: 3, stages: [
    { nama: 'Serambi & Kentongan Besar', era: 'kota_kecil', cost: { papan: 30, bambu: 30, sabut: 10 }, work: 200, fx: { parallelMonumen: 2, dilemmaMusyawarah: true } },
    { nama: 'Pendopo Joglo', era: 'kota_kecil', cost: { kayu: 80, papan: 40, batu: 40, alat: 3 }, work: 420, fx: { moodAll: 1, spawnCooldownAdd: -1, lombaSlotAdd: 1, kerjaBaktiCooldown: 5 } },
    { nama: 'Balai Megah', era: 'kota_kecil', cost: { batu_bata: 80, papan: 30, kopi: 10, minyak: 10 }, work: 620, fx: { festivalMoodMult: 1.25, marketQuotaMult: 1.15, teladan: 1 } } ] },
  bendungan: { nama: 'Bendungan & Irigasi', nearRiver: 2, w: 3, h: 2, stages: [
    { nama: 'Bendung Bronjong Bambu', era: 'desa_pertanian', cost: { bambu: 40, batu: 30, sabut: 10 }, work: 200, fx: { floodMult: 0.7 } },
    { nama: 'Saluran Induk', era: 'desa_pertanian', cost: { batu: 80, kayu: 30, alat: 2 }, work: 360, fx: { irrigateRadius: 10, wellYieldHardAdd: 1 } },
    { nama: 'Pintu Air', era: 'kota_kecil', cost: { batu: 60, papan: 30, batu_bata: 20, alat: 4 }, work: 460, fx: { floodMult: 0.4, landslideMult: 0.7, failHarvestChance: 0.12 } },
    { nama: 'Bendungan & Embung', era: 'kota_kecil', cost: { batu: 100, batu_bata: 80, alat: 6 }, work: 800, fx: { hardWaterMult: 1.2, droughtChance: 0.06, hardFishMult: 0.8, moodAll: 0.5, teladan: 1 } } ] },
  pendopo_reog: { nama: 'Pendopo Reog', w: 4, h: 3, minDay: 30, stages: [
    { nama: 'Sanggar Latihan', era: 'dusun', cost: { bambu: 30, kayu: 20, kulit: 4 }, work: 160, fx: { nightMoodNear: 0.5, radius: 5 } },
    { nama: 'Dadak Merak & Gamelan', era: 'desa_pertanian', cost: { kulit: 10, bambu: 20, sabut: 10, minyak: 4 }, work: 260, fx: { pentasReog: { mood: 12, relAnakDewasa: 4 } } },
    { nama: 'Pendopo Agung', era: 'kota_kecil', cost: { kayu: 60, papan: 40, batu: 40, batu_bata: 30, kopi: 8 }, work: 520, fx: { festivalSellMult: 1.10, newcomerMult: 1.2, teladan: 1 } } ] },
  pasar_legi: { nama: 'Pasar Legi', needs: 'pasar', w: 4, h: 3, stages: [
    { nama: 'Los Bambu', era: 'desa_pertanian', cost: { bambu: 40, kayu: 20, papan: 10 }, work: 160, fx: { marketQuotaMult: 1.2 } },
    { nama: 'Hari Pasaran', era: 'desa_pertanian', cost: { papan: 20, batu: 30, kelapa: 15, minyak: 5 }, work: 300, fx: { pasaran: ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'], merchantOn: 'Legi', buyMultOnLegi: 0.95 } },
    { nama: 'Pasar Batu Bata', era: 'kota_kecil', cost: { batu_bata: 60, batu: 40, alat: 3, kopi: 10 }, work: 460, fx: { contractSlotAdd: 1, sellMult: { kopi: 1.1, kelapa: 1.1 }, teladan: 1 } } ] },
},
KERJA_BAKTI: { untilFrac: 0.71, workMult: 1.25, mood: 4, rel: 3, foodPerPerson: 0.5, kopiOptional: { kopi: 2, mood: 2 }, cooldownDays: 7, blockedFamine: ['bahaya', 'kritis', 'kolaps'] },
```

### 2.2 Gelar Desa Teladan

Dinilai setahun sekali pada **Penilaian Lomba Desa** oleh Pak Camat, pagi hari **17 Agustus** (hari ke-21 dalam tahun, §2.3). Penilaian pertama baru di **tahun ke-2 (hari 49)**; tahun 1 hanya pratinjau "Pak Camat lewat dan memberi catatan". Gelar **tidak turun**, tetapi bonus gelar ditangguhkan bila tahun itu syarat satu tingkat di bawahnya tidak terpenuhi (pesan lembut "Pak Camat berharap tahun depan lebih baik").

**Poin Teladan** (untuk syarat tingkat 3–4): +1 per monumen tahap terakhir yang punya `teladan: 1` (maks 5), +0.5 dari Posyandu, +0.5 bantuan desa tetangga (D18), +1 jalan desa (D19); −1 tebang beringin (D10), −0.5 tambang pasir luar (D06), −0.5 jerat monyet (D15), −0.5 hutan gundul (D23). Lantai 0.

| Tingkat | Gelar | Pop | Rata-rata mood 7 hari | Bangunan selesai | Monumen | Pangan | Lain | Hadiah |
|---|---|---|---|---|---|---|---|---|
| 0 | Desa Rintisan | — | — | — | — | — | awal | — |
| 1 | **Desa Swadaya** | ≥ 6 | ≥ 55 | ≥ 12 | — | 0 hari `kritis` dalam 28 hari terakhir | era dusun | alat 2, semua +5 |
| 2 | **Desa Swakarya** | ≥ 9 | ≥ 60 | ≥ 20 | ≥ 2 tahap | ≤ 2 hari `bahaya`, 0 `kritis` dalam 28 hari | era desa_pertanian | papan 15, batu_bata 10; `SPAWN.cooldownDays` −1 |
| 3 | **Desa Swasembada** | ≥ 12 | ≥ 65 | ≥ 28 | ≥ 5 tahap, 1 monumen selesai | 0 hari `bahaya` dalam 28 hari; foodDays ≥ 10 saat penilaian | poin Teladan ≥ 2; 0 kematian kelaparan dalam 56 hari | kuota pasar +10%; semua +1 mood/hari (bangga) |
| 4 | **Desa Teladan Nasional** | ≥ 16 | ≥ 70 | ≥ 36 | ≥ 10 tahap, 3 monumen selesai | 0 hari `bahaya` dalam 56 hari | poin Teladan ≥ 4; sudah Swasembada ≥ 1 tahun | piala di Balai, pencapaian A26, **ending lembut** (boleh lanjut tanpa batas), pendatang ×1.3 |

Waktu tercapai yang diharapkan (pemain aktif): Swadaya tahun 2 (hari 49), Swakarya tahun 3 (77), Swasembada tahun 4–5 (105–133), Teladan Nasional tahun 6–8 (161–217).

```js
// ---- TUJUAN: Desa Teladan (docs/RISET-CERITA-TUJUAN.md §2.2) ----
TELADAN: {
  assessDayOfYear: 21, firstAssessYear: 2, noDowngrade: true,
  points: { monumenAkhir: 1, monumenMax: 5, posyandu: 0.5, bantuTetangga: 0.5, jalanDesa: 1, tebangBeringin: -1, tambangLuar: -0.5, jeratMonyet: -0.5, hutanGundul: -0.5 },
  tiers: [
    { id: 'rintisan', nama: 'Desa Rintisan' },
    { id: 'swadaya', nama: 'Desa Swadaya', pop: 6, mood7: 55, bangunan: 12, tahap: 0, maxKritis28: 0, era: 'dusun', hadiah: { alat: 2, suasana_hati: 5 } },
    { id: 'swakarya', nama: 'Desa Swakarya', pop: 9, mood7: 60, bangunan: 20, tahap: 2, maxBahaya28: 2, maxKritis28: 0, era: 'desa_pertanian', hadiah: { papan: 15, batu_bata: 10 }, bonus: { spawnCooldownAdd: -1 } },
    { id: 'swasembada', nama: 'Desa Swasembada', pop: 12, mood7: 65, bangunan: 28, tahap: 5, monumenSelesai: 1, maxBahaya28: 0, foodDays: 10, poin: 2, noStarveDeathDays: 56, bonus: { marketQuotaMult: 1.1, moodAll: 1 } },
    { id: 'teladan', nama: 'Desa Teladan Nasional', pop: 16, mood7: 70, bangunan: 36, tahap: 10, monumenSelesai: 3, maxBahaya56: 0, poin: 4, needPrevYears: 1, hadiah: { pencapaian: 'A26' }, bonus: { newcomerMult: 1.3 }, ending: true },
  ],
},
```

### 2.3 Lomba 17 Agustus (Agustusan) — tahunan

**Pemetaan kalender:** tahun game dimulai di musim hujan. Dengan hujan ≈ Nov–Mar (hari 1–9), mareng ≈ Apr–Mei (10–14), kemarau ≈ Jun–Sep (15–23, ±2.25 hari per bulan), labuh ≈ Okt (24–28), maka 17 Agustus ≈ hari **20.7** → **hari ke-21 tiap tahun** (kemarau hari ke-7). Hari absolut: **21, 49, 77, 105, 133, 161, 189, 217**. Pas: Agustusan memang di puncak kemarau, jadi lomba menjadi "oase" mood di musim sulit.

> **Perlindungan d24:** lomba tahun 1 (hari 21) jatuh 3 hari sebelum pengukuran d24. Maka **tahun 1 semua biaya lomba = 0** ("warga patungan seadanya"), hanya 2 lomba, dan tidak ada hadiah pangan. Biaya mulai tahun 2.

**Alur:**
| Hari tahun | Jam | Kejadian |
|---|---|---|
| 18 | pagi | Kartu "Panitia 17-an": pilih lomba (2 di tahun 1; 3 bawaan; +1 Pendopo Joglo; +1 Pendopo Reog tahap 2; maks 5). Opsional pasang **umbul-umbul**: bambu 2 per buah, maks 6, masing-masing +0.5 mood/hari hari 18–28 (maks +3) |
| 20 | 19:00 | **Malam Tirakatan** di api unggun/balai: mood +3, rel +2 antar yang hadir; opsional tumpeng (makanan 4, gandum 2, tahun 2+) → +3 lagi |
| 21 | 07:00 | **Upacara bendera** (0.05 hari) + Penilaian Lomba Desa (§2.2, tahun 2+) |
| 21 | 09:00–15:00 | Lomba. Kerja normal berhenti (±0.25 hari produksi hilang; kebutuhan kritis tetap jalan) |
| 21 | 19:00 | Panggung hiburan (+ Pentas Reog bila Pendopo tahap 2): pengumuman juara, mood sesuai hasil |

**Peserta** dipilih otomatis (pemain boleh tukar di kartu): dewasa/remaja sehat, tidak sakit/hamil tua; lomba anak butuh anak 6–12. Skor peserta = `0.5 + skill relevan × 0.5 + bonus sifat + acak(0..0.5)`.

| id | Lomba | Era | Biaya (tahun 2+) | Mekanik | Hadiah |
|---|---|---|---|---|---|
| `balap_karung` | Balap karung | perkemahan | sabut 2 (tahun 1 gratis: karung goni bekas) | 3–6 peserta, skor + kecepatan jalan; `rajin` +0.1, `pemberani` +0.1; bila dua rival ikut: 30% jatuh bareng → rel +15 ("tertawa bersama") | juara +10; peserta +3; semua +2 |
| `makan_kerupuk` | Makan kerupuk | perkemahan | makanan 2, minyak 1 (tahun 1 gratis) | 3–6 peserta; `periang` +0.2, `jahil` +0.1, `pelit` −0.1 ("sayang kerupuknya") | juara +8; semua +4 |
| `tarik_tambang` | Tarik tambang | dusun | sabut 6 **sekali seumur game** (tambang disimpan) | 2 tim sama besar; skor tim = Σ(1 + `rajin` 0.2 + `suka_menolong` 0.2 + skill membangun×0.3); rival di tim berbeda: 50% salaman (rel +5), 50% rel −3 | tim menang rel +8 antaranggota, mood +6; kalah +2; semua +2 |
| `panjat_pinang` | Panjat pinang | dusun | kayu 8 (batang pinang), minyak 2 (pelicin), hadiah gantung: alat 1 + kopi 2 + kulit 1 | tim 3 (4 bila pop ≥ 10), 3 percobaan; sukses per percobaan = 0.35 + 0.1×(`pemberani`+`rajin` di tim) + 0.05×rata-rata skill membangun; percobaan gagal tetap lucu (+1) | sukses: tim +10, rel +6, semua +6, hadiah gantung jadi milik peserta (hilang dari stok, mood +2 lagi); gagal semua: semua +3 |
| `bakiak` | Bakiak (terompah panjang) | dusun | kayu 4 sekali | tim 3; sukses = 0.3 + rata-rata rel tim/100 (maks 0.9) | tim +8, rel +8; semua +2 |
| `kelereng_sendok` | Kelereng sendok (anak) | dusun | — | butuh ≥ 2 anak 6–12 **[butuh SIKLUS-HIDUP]** | anak +10; orang tua +4 (`suka_menolong` +8) |
| `hias_gapura` | Hias gapura & kampung | dusun | bambu 6, kelapa 2 (janur) | tidak ada pemenang; dinilai Pak Camat | semua +0.5/hari selama 7 hari; +0.5 mood7 untuk penilaian Teladan |
| `pawai_reog` | Pawai/karnaval reog | butuh Pendopo Reog tahap 2 | minyak 2 | semua ikut; `seniman` ×1.25 | semua +10; peluang pendatang ×1.5 selama 7 hari |

**Hadiah gelar**: juara umum (peserta dengan menang terbanyak) dapat ikon piala kecil 14 hari dan keinginan `menang_lomba` terpenuhi. Hadiah tidak pernah berupa pangan (pangan hanya keluar sebagai biaya kecil).

```js
// ---- TUJUAN: Agustusan (docs/RISET-CERITA-TUJUAN.md §2.3) ----
AGUSTUSAN: {
  dayOfYear: 21, prepDayOfYear: 18, tirakatanDayOfYear: 20, tirakatanFrac: 0.79, upacaraFrac: 0.29, lombaFrac: [0.375, 0.625], panggungFrac: 0.79,
  year1Free: true, year1Slots: 2, slots: 3, slotsAdd: { balai_megah2: 1, pendopo_reog2: 1 }, maxSlots: 5,
  umbul: { cost: { bambu: 2 }, max: 6, moodPerDay: 0.5, days: [18, 28] },
  tirakatan: { mood: 3, rel: 2, tumpeng: { cost: { makanan: 4, gandum: 2 }, mood: 3, fromYear: 2 } },
  score: { base: 0.5, skillMult: 0.5, rand: 0.5 },
  lomba: {
    balap_karung:    { era: 'perkemahan', cost: { sabut: 2 }, peserta: [3, 6], sifat: { rajin: 0.1, pemberani: 0.1 }, rivalTumble: { chance: 0.3, rel: 15 }, menang: 10, ikut: 3, semua: 2 },
    makan_kerupuk:   { era: 'perkemahan', cost: { makanan: 2, minyak: 1 }, peserta: [3, 6], sifat: { periang: 0.2, jahil: 0.1, pelit: -0.1 }, menang: 8, semua: 4 },
    tarik_tambang:   { era: 'dusun', costOnce: { sabut: 6 }, tim: 2, sifat: { rajin: 0.2, suka_menolong: 0.2 }, skill: 'membangun', rivalOpp: { shake: 0.5, relShake: 5, relSour: -3 }, menangRel: 8, menang: 6, kalah: 2, semua: 2 },
    panjat_pinang:   { era: 'dusun', cost: { kayu: 8, minyak: 2 }, hadiahGantung: { alat: 1, kopi: 2, kulit: 1 }, tim: 3, timBesarPop: 10, coba: 3,
                       sukses: { base: 0.35, perSifat: 0.1, sifat: ['pemberani', 'rajin'], perSkill: 0.05 }, menang: 10, rel: 6, semua: 6, gagal: 3, cobaGagal: 1 },
    bakiak:          { era: 'dusun', costOnce: { kayu: 4 }, tim: 3, sukses: { base: 0.3, relDiv: 100, max: 0.9 }, menang: 8, rel: 8, semua: 2 },
    kelereng_sendok: { era: 'dusun', anak: [6, 12], minAnak: 2, menang: 10, ortu: 4, ortuSifat: { suka_menolong: 8 } },
    hias_gapura:     { era: 'dusun', cost: { bambu: 6, kelapa: 2 }, moodPerDay: 0.5, days: 7, teladanMood7: 0.5 },
    pawai_reog:      { needs: 'pendopo_reog2', cost: { minyak: 2 }, semua: 10, newcomerMult: 1.5, newcomerDays: 7 },
  },
  juaraUmumIconDays: 14,
},
```

### 2.4 Target tahunan (tahun 1 sampai 8+)

Panel "Rencana Desa Tahun ke-N" muncul di **Hari Jadi** (hari 1 tahun 1, lalu 29, 57, …). Isi: **3 target utama + 2 target pilihan**. Selesaikan **≥ 3 dari 5** sebelum Hari Jadi berikutnya → **Piagam Tahunan** (hadiah di tabel) dan log kenangan tahunan. Target yang belum selesai tidak menghukum; hanya tidak dapat piagam. Tahun 1 memakai quest `q01`–`q10` yang sudah ada sebagai target utama (tidak dobel hadiah: piagam tahun 1 hanya mood).

| Tahun | Hari | Target utama | Target pilihan | Piagam |
|---|---|---|---|---|
| 1 | 1–28 | Capai Dusun; 3 gubuk; lewati kemarau pertama tanpa `kritis` | Lomba 17-an pertama; 1 keinginan terpenuhi | semua +5 (tanpa sumber daya) |
| 2 | 29–56 | Desa Pertanian; Langgar (Masjid tahap 1); Desa Swadaya (hari 49) | 1 pasangan baru; 3 keinginan terpenuhi | alat 2, mood +5 |
| 3 | 57–84 | Kota Kecil; 3 tahap monumen total; Desa Swakarya (hari 77) | 2 pasang sahabat; 1 cerita berantai selesai | papan 15, batu_bata 10 |
| 4 | 85–112 | 1 monumen selesai; Bendungan tahap 2; 10 tech | kelahiran pertama/kedua **[butuh SIKLUS-HIDUP]**; menang 3 lomba | alat 3, kopi 6 |
| 5 | 113–140 | Desa Swasembada; Pendopo Reog selesai; 0 hari `bahaya` di kemarau | 1 anak kelahiran desa mulai bekerja (umur 8); `tabungan_haji` terpenuhi | batu_bata 20, mood +8 |
| 6 | 141–168 | 3 monumen selesai; pop 14; Balai Megah tahap 2 | 5 sahabat; generasi kedua berpasangan | +1 mood/hari permanen ("desa guyub") |
| 7 | 169–196 | 4 monumen selesai; pop 16; Bendungan tahap 4 | 2 cerita berantai selesai; Teladan dicoba | pencapaian A27 "Tujuh Purnama Kemarau" |
| 8 | 197–224 | Desa Teladan Nasional; semua monumen; 0 kematian kelaparan sepanjang tahun | cucu pertama (generasi ke-3) | ending lembut "Desa Mandiri" (A18 versi tamat) |
| 9+ | 225+ | **Generator**: 3 target acak dari pool (pop +2, X tahap upkeep, keinginan 6, lomba 3 menang, mood7 ≥ 72, kemarau tanpa `waspada`) | 2 acak | sumber daya ±20 nilai pasar, mood +5 |

```js
// ---- TUJUAN: target tahunan (docs/RISET-CERITA-TUJUAN.md §2.4). tipe baru ditandai *, sisanya sama dengan questProgress ----
YEAR_GOALS: {
  needOf: 3, total: 5, showOn: 'hariJadi',
  years: {
    1: { utama: [{ tipe: 'capai_era', target: 'dusun' }, { tipe: 'bangun', target: 'gubuk', jumlah: 3 }, { tipe: 'tanpa_jenjang*', target: 'kritis', musim: 'kemarau' }],
         pilihan: [{ tipe: 'lomba_ikut*', jumlah: 1 }, { tipe: 'keinginan_terpenuhi*', jumlah: 1 }], piagam: { suasana_hati: 5 } },
    2: { utama: [{ tipe: 'capai_era', target: 'desa_pertanian' }, { tipe: 'tahap_monumen*', target: 'masjid', jumlah: 1 }, { tipe: 'gelar_teladan*', target: 'swadaya' }],
         pilihan: [{ tipe: 'pasangan*', jumlah: 1 }, { tipe: 'keinginan_terpenuhi*', jumlah: 3 }], piagam: { alat: 2, suasana_hati: 5 } },
    3: { utama: [{ tipe: 'capai_era', target: 'kota_kecil' }, { tipe: 'tahap_monumen*', target: 'semua', jumlah: 3 }, { tipe: 'gelar_teladan*', target: 'swakarya' }],
         pilihan: [{ tipe: 'sahabat*', jumlah: 2 }, { tipe: 'cerita_selesai*', jumlah: 1 }], piagam: { papan: 15, batu_bata: 10 } },
    4: { utama: [{ tipe: 'monumen_selesai*', jumlah: 1 }, { tipe: 'tahap_monumen*', target: 'bendungan', jumlah: 2 }, { tipe: 'riset', target: 'semua', jumlah: 10 }],
         pilihan: [{ tipe: 'kelahiran*', jumlah: 1 }, { tipe: 'lomba_menang*', jumlah: 3 }], piagam: { alat: 3, kopi: 6 } },
    5: { utama: [{ tipe: 'gelar_teladan*', target: 'swasembada' }, { tipe: 'monumen_selesai*', target: 'pendopo_reog' }, { tipe: 'tanpa_jenjang*', target: 'bahaya', musim: 'kemarau' }],
         pilihan: [{ tipe: 'anak_bekerja*', jumlah: 1 }, { tipe: 'keinginan_khusus*', target: 'tabungan_haji' }], piagam: { batu_bata: 20, suasana_hati: 8 } },
    6: { utama: [{ tipe: 'monumen_selesai*', jumlah: 3 }, { tipe: 'capai_penduduk', jumlah: 14 }, { tipe: 'tahap_monumen*', target: 'balai_megah', jumlah: 2 }],
         pilihan: [{ tipe: 'sahabat*', jumlah: 5 }, { tipe: 'generasi_berpasangan*', jumlah: 2 }], piagam: { moodAllPermanent: 1 } },
    7: { utama: [{ tipe: 'monumen_selesai*', jumlah: 4 }, { tipe: 'capai_penduduk', jumlah: 16 }, { tipe: 'tahap_monumen*', target: 'bendungan', jumlah: 4 }],
         pilihan: [{ tipe: 'cerita_selesai*', jumlah: 2 }, { tipe: 'penilaian_teladan*', target: 'teladan' }], piagam: { pencapaian: 'A27' } },
    8: { utama: [{ tipe: 'gelar_teladan*', target: 'teladan' }, { tipe: 'monumen_selesai*', jumlah: 5 }, { tipe: 'tanpa_kematian_lapar*', hari: 28 }],
         pilihan: [{ tipe: 'generasi*', jumlah: 3 }], piagam: { ending: 'desa_mandiri' } },
  },
  generator: { fromYear: 9, pool: ['pop+2', 'tahap_upkeep', 'keinginan:6', 'lomba_menang:3', 'mood7:72', 'tanpa_jenjang:waspada:kemarau'], utama: 3, pilihan: 2, piagamValue: 20, piagamMood: 5 },
},
```

### 2.5 Tabel ritme (pacing) per hari

| Hari | Musim (tahun) | Era perkiraan | Pop | Konten baru yang mengisi hari | Sumber keputusan utama |
|---|---|---|---|---|---|
| 1–7 | hujan (Y1) | Perkemahan | 2 | tutorial, quest q01–q05 | bangun, prioritas, momen kecil (§3.4) |
| 8–14 | hujan→mareng | Perkemahan/Dusun | 2–3 | pedagang pertama (hari 4), keinginan dari hari 12 | momen kecil, dilema ringan |
| 15–23 | kemarau (Y1) | Dusun | 3–5 | Agustusan hari 21 (gratis), ancaman babi | dilema ringan, panitia 17-an, persiapan stok |
| 24 | labuh | Dusun | 4–5 | **titik ukur d24** | — |
| 25–28 | labuh | Dusun | 4–6 | monumen terbuka (Langgar), dilema berat terbuka | dilema, monumen |
| 29 | hujan (Y2) | Dusun | 5–6 | Hari Jadi + Rencana Tahun 2 | target tahunan |
| 30–48 | hujan/mareng/kemarau | Dusun → Desa Pertanian | 6–8 | Pendopo Reog tahap 1, cerita berantai pertama, pasangan pertama | dilema, keinginan berbiaya, kerja bakti |
| 49 | kemarau | Desa Pertanian | 7–8 | Agustusan Y2 + penilaian **Swadaya** | lomba, Teladan |
| 50–76 | labuh → kemarau (Y3) | Desa Pertanian → Kota Kecil | 8–11 | Bendungan, Pasar Legi, kelahiran pertama | monumen paralel, dilema ekonomi (tengkulak, rentenir, kontrak) |
| 77 | kemarau | Kota Kecil | 10–11 | Agustusan Y3 + **Swakarya** | lomba, Teladan |
| 78–104 | Y3–Y4 | Kota Kecil | 11–13 | Balai Megah, Masjid tahap 3, lansia pertama renta | dilema keluarga (warisan, sekolah kota) |
| 105 | kemarau | Kota Kecil | 12–13 | Agustusan Y4 | Teladan (Swasembada mungkin) |
| 106–140 | Y4–Y5 | Kota Kecil | 12–15 | monumen ke-2/3 selesai, tabungan haji, generasi kedua bekerja | dilema + keinginan + cerita |
| 141–196 | Y6–Y7 | Kota Kecil | 14–16 | Bendungan tahap 4, monumen ke-4, cucu pertama | target tahunan, upkeep, Teladan |
| 197–224 | Y8 | Kota Kecil | 15–18 | Desa Teladan Nasional, ending lembut | penutup cerita |
| 225+ | Y9+ | — | stabil | generator target, dilema berulang (jeda 28–56 hari) | tak terbatas |

---

## 3. KEPUTUSAN SULIT KEPALA DESA

### 3.1 Bentuk dilema

Dilema = event berpilihan dengan tiga tambahan dibanding `event_acak` sekarang:
1. **Akibat tertunda** (`tunda`): `{ hari: [min, maks], peluang, syarat?, efek, teks }`. Disimpan di `S.pending`; diundi pagi hari saat jatuh tempo. Bila `syarat` gagal (mis. "harus musim hujan"), akibat menunggu sampai syarat terpenuhi atau kedaluwarsa setelah 28 hari.
2. **Reaksi sifat** (`reaksi`): mood seketika untuk penduduk yang punya sifat itu. Ini membuat warga terasa punya pendapat ("Pak Joko yang religius kecewa").
3. **Tokoh** (`aktor`): beberapa dilema menyangkut 1–2 penduduk tertentu (`{nama}`, `{nama2}`) dan mengubah hubungan mereka (`rel_AB`).

Aturan umum: opsi pertama = opsi hati-hati/netral (lihat Prinsip 3). Tombol opsi menampilkan efek seketika seperti sekarang; akibat tertunda **tidak** ditampilkan angkanya, hanya petunjuk ("⏳ mungkin ada akibatnya nanti"), supaya ada rasa menebak tetapi tetap adil. Akibat tertunda yang mendarat selalu menyebut keputusan asalnya di log ("Banjir ini akibat hutan di hulu yang dibuka hari 22").

### 3.2 Daftar 24 dilema (ringkas)

`R` = ringan (boleh sebelum hari 25: efek pangan opsi pertama ≥ −2, opsi lain ≥ −4, tidak ada hadiah pangan > +3). `B` = berat (mulai hari 25, atau syaratnya mustahil sebelum itu).

| # | id | Kelas | Pemicu & musim | Opsi 1 (aman) | Opsi 2 | Opsi 3 | Akibat tertunda utama | Sifat/hubungan |
|---|---|---|---|---|---|---|---|---|
| D01 | `buka_hutan` | B | dusun, ladang ≥ 2, labuh/mareng/hujan | Biarkan hutan | Buka 2 petak (kayu +20, 1 ladang gratis) | Buka lereng luas (kayu +45, 3 ladang gratis) | banjir 25% / longsor 45% di musim hujan; babi ×1.3 | ahli_tani +, religius − |
| D02 | `rombongan_pendatang` | R | dusun, pop ≥ 3, bukan kemarau ×1.5 | Singgah 1 malam (makanan −2) | Menetap 2 orang (makanan −4) | Tolak sopan | kiriman terima kasih 50%; kangen kampung 25% (×0.5 bila ada `ramah`) | dermawan, ramah, religius |
| D03 | `pencuri_singkong` | R | dusun, makanan ≥ 20, mareng/kemarau | Maafkan + bekal (makanan −2) | Hukum kerja bakti 3 hari (kayu +12, batu +6) | Lapor polisi kecamatan | pemuda balas budi 40% / mencuri lagi 15%; desa tetangga tersinggung 30% | dermawan +, pemarah +, jujur (pencuri tak pernah warga `jujur`) |
| D04 | `tengkulak_padi` | B | gandum ≥ 25, mareng atau 2 hari setelah panen | Simpan untuk kemarau | Jual 20 padi (alat 2, papan 6) | Jual 40 padi borongan (alat 4, papan 12, kopi 3) | harga beras naik saat kemarau 35–50%; timbangan curang 30% bila tak ada warga `jujur` | pelit +, ahli_tani −, jujur |
| D05 | `rentenir` | B | kayu < 20 atau batu < 10 atau pangan `waspada`, dusun | Tolak, kerja bakti | Pinjam kecil (kayu 30, batu 20) | Pinjam besar (kayu 60, batu 40, papan 10) | tagihan ×1.3 di hari 14 / ×1.5 di hari 21; telat → bunga, sita | religius −, pelit − |
| D06 | `tambang_pasir` | B | desa_pertanian, ada sungai, kemarau/mareng | Tolak, kali tetap jernih | Tambang warga (batu +6/hari, 7 hari) | Pengusaha luar (batu +80, alat 3, "uang rokok" = suap) | banjir +, ikan −, jembatan rusak 60%; warga `jujur` membocorkan suap 40% | jujur −−, religius −, Teladan − |
| D07 | `hajatan` | B | ada pasangan baru [SIKLUS-HIDUP] atau Hari Jadi tanpa pasangan | Syukuran sederhana (makanan −4) | Tumpeng & gamelan (makanan −12, kelapa −4, kopi −2) | Hajatan besar + reog (makanan −20, kayu −10, minyak −4) | restu: hamil ×1.3 30%; kurang stok 40% bila foodDays < 8 | pelit −, seniman + |
| D08 | `tanah_warisan` | B | lansia wafat dengan ≥ 2 anak, atau 2 penduduk mengklaim petak | Bagi rata | Untuk yang menggarap | Musyawarah (butuh Balai) | rival 50% jika opsi 2; rukun 100% jika opsi 3 | rel_AB besar |
| D09 | `rebutan_air` | B | kemarau, air < 5 hari, ada sawah irigasi | Utamakan air minum | Giliran ala ulu-ulu | Utamakan sawah | diare 40% bila opsi 3 | ahli_tani, sabar |
| D10 | `beringin_keramat` | B | desa_pertanian, ada beringin, butuh lahan atau pedagang kayu datang | Rawat + selamatan (makanan −3) | Pangkas dahan (kayu +15) | Tebang (kayu +60) | ular turun 20%; mimpi buruk 50%; Teladan −1 | religius −−, seniman − |
| D11 | `obat_sakit` | R | ≥ 1 sakit parah atau ≥ 2 sakit | Jamu kunyit-temulawak (makanan −2) | Panggil mantri (alat −1 atau kopi −3) | Pijat & suwuk Mbah Dukun (makanan −1) | sembuh cepat 50% (opsi 3) | religius, cerdas |
| D12 | `pupuk_penyuluh` | B | desa_pertanian, mareng/labuh | Kompos (makanan −3) | Pupuk kimia gratis | Tolak | tanah keras 50% setelah 30–45 hari | ahli_tani |
| D13 | `sekolah_kota` | B | ada remaja 12–16 [SIKLUS-HIDUP] atau dewasa termuda < 20 | Belajar di desa | Sekolah di kota 28 hari | Merantau kerja 21 hari | pulang pintar 100%; bawa jodoh 10%; betah di kota 25% | perantau, cerdas, suka_menolong |
| D14 | `kerbau_tetangga` | R | dusun, ladang `tumbuh` ≥ 2, hujan/labuh | Damai | Minta ganti rugi (makanan +3) | Tahan kerbau 3 hari untuk membajak | bibit kiriman 40% / tetangga marah 30% / konflik 50% | pemarah, dermawan |
| D15 | `monyet_kebun` | R | monyet mencuri ≥ 2 kali dalam 7 hari | Orang-orangan gratis (bambu −2, sabut −1) | Sisihkan pisang di tepi hutan | Pasang jerat | anak sedih 30% (opsi 3), Teladan − | suka_menolong, religius |
| D16 | `tanggap_reog` | B | hari ≥ 30, mareng/labuh/hujan | Tonton dari jauh | Tanggap reog (makanan −8, kopi −2) | Tanggap + minta diajari (makanan −12) | sanggar diskon; sifat seniman | seniman, periang |
| D17 | `ronda_wajib` | R | setelah serangan babi/macan atau jejak macan | Ronda bergilir 7 malam | Pasang oncor (minyak −3 atau kayu −9) | Biarkan | rel ronda; luka bila diabaikan | pemberani, penakut |
| D18 | `bantu_tetangga` | B | hujan/labuh, setelah banjir/longsor (di desa sendiri atau tetangga) | Kirim bantuan (makanan −6, kayu −10) | Kirim 2 tenaga 2 hari | Belum bisa | balas budi 60% | dermawan, religius |
| D19 | `jalan_desa` | B | desa_pertanian, pop ≥ 8 | Nanti saja | Kerja bakti 1 hari penuh | Bayar orang luar (kayu −40, batu −20) | bantuan material kabupaten 100% | rajin, malas, suka_menolong |
| D20 | `kontrak_kopi` | B | kopi dikenal, kopi ≥ 5 | Jual eceran seperti biasa | Kontrak 20 kopi/14 hari | Koperasi bagi hasil 10 kopi × 2 | gagal kontrak: harga kopi −15% | ahli_tani, pelit, sabar |
| D21 | `tikus_lumbung` | R | gandum ≥ 20, hujan/labuh | Cari kucing (makanan −2) | Racun tikus | Gropyokan bareng (setengah hari) | keracunan ternak/penduduk 25% (opsi 2) | suka_menolong, periang |
| D22 | `ketua_ronda` | B | pop ≥ 8, ada pos ronda, 1×/tahun | Musyawarah bergilir | Pilih {nama} (pemberani/rajin) | Pilih {nama2} (periang/ramah) | yang kalah iri 40% | rel_AB, pemberani |
| D23 | `penebang_liar` | B | desa_pertanian, ada jati/hutan, malam | Tegur baik-baik | Lapor Perhutani | Beli kayu murah dari mereka (kayu +30, makanan −6) | kembali lagi 30% / hutan gundul 50% | jujur, religius |
| D24 | `minta_hujan` | R | kemarau hari ≥ 5, kekeringan aktif | Sholat istisqa & doa bersama | Gali sumur lebih dalam (kayu −10, batu −15) | Beli air desa sebelah (makanan −4) | hujan sebentar 35% | religius, rajin |

### 3.3 Data lengkap dilema (paste-ready)

Kunci efek lama (`makanan`, `kayu`, `suasana_hati`, `penduduk`, `hari_kerja_hilang`, `kesehatan_satu`, `kesehatan_bangunan`, `pertumbuhan_ladang`, `harga_jual_pangan`, `harga_beli_pangan`) dipakai apa adanya. Kunci baru dijelaskan di §4.2.

```js
// ---- KEPUTUSAN: 24 dilema (docs/RISET-CERITA-TUJUAN.md §3). Teks: TEKS-GAME.json "dilema" dengan id yang sama ----
// p = pilihan; tunda: { hari:[min,maks], peluang, syarat?, efek, teks }; reaksi: { sifat: mood }; ulangHari: jeda sebelum id sama boleh muncul lagi
DILEMMAS: {
  buka_hutan: { kelas: 'B', era: 'dusun', minDay: 25, musim: ['labuh', 'mareng', 'hujan'], syarat: { ladangMin: 2, hutanDekat: 6 }, bobot: 1.0, ulangHari: 56,
    p: [
      { efek: {}, reaksi: { ahli_tani: -3, religius: 2 }, tunda: [{ hari: [6, 10], peluang: 0.3, efek: { makanan: 3 }, teks: 'hutan_berbuah' }] },
      { efek: { kayu: 20, ladang_gratis: 1 }, reaksi: { ahli_tani: 4, religius: -2 },
        tunda: [{ hari: [5, 12], peluang: 0.25, syarat: { musim: 'hujan' }, efek: { banjir: 1 }, teks: 'banjir_hulu' }] },
      { efek: { kayu: 45, ladang_gratis: 3, ancaman_mult: { babi: 1.3, hari: 14 } }, reaksi: { ahli_tani: 6, religius: -4, penakut: -3 },
        tunda: [{ hari: [6, 14], peluang: 0.45, syarat: { musim: 'hujan' }, efek: { longsor: 1, kesehatan_bangunan_dekat: -25, pertumbuhan_ladang: -1 }, teks: 'longsor_lereng' }] } ] },
  rombongan_pendatang: { kelas: 'R', era: 'dusun', minDay: 8, syarat: { popMin: 3 }, kangenMultBilaSifat: { ramah: 0.5 }, bobot: 0.9, musimMult: { kemarau: 0.6 }, ulangHari: 28,
    p: [
      { efek: { makanan: -2, suasana_hati: 2 }, reaksi: { dermawan: 2 }, tunda: [{ hari: [10, 20], peluang: 0.5, efek: { kopi: 3, alat: 1 }, teks: 'kiriman_terima_kasih' }] },
      { efek: { makanan: -4, penduduk: 2, pendatang_sifat: 'acak' }, butuhRumah: 2, reaksi: { dermawan: 3, ramah: 3, pelit: -2 },
        tunda: [{ hari: [7, 14], peluang: 0.25, syarat: { moodPendatangBawah: 60 }, efek: { pamit_pendatang: 1 }, teks: 'kangen_kampung' }] },
      { efek: {}, reaksi: { dermawan: -4, religius: -3 }, tunda: [{ hari: [5, 10], peluang: 0.2, syarat: { adaSifat: 'jahil' }, efek: { rel_acak: -3 }, teks: 'gosip_penolakan' }] } ] },
  pencuri_singkong: { kelas: 'R', era: 'dusun', minDay: 10, musim: ['mareng', 'kemarau'], syarat: { makananMin: 20 }, bobot: 0.8, ulangHari: 42,
    pencuri: 'luar', pencuriWargaKecuali: ['jujur'],   // varian pencuri dari warga (bila dipakai) tidak pernah memilih penduduk jujur
    p: [
      { efek: { makanan: -2 }, reaksi: { dermawan: 3, religius: 3, sabar: 2, pemarah: -2 },
        tunda: [{ hari: [7, 14], peluang: 0.4, efek: { kayu: 10, batu: 5 }, teks: 'pemuda_balas_budi' }, { hari: [10, 20], peluang: 0.15, efek: { makanan: -4 }, teks: 'mencuri_lagi' }] },
      { efek: { kayu: 12, batu: 6 }, reaksi: { pemarah: 3, jujur: 2, dermawan: -2 },
        tunda: [{ hari: [3, 8], peluang: 0.3, efek: { harga_beli_pangan: 10 }, teks: 'tetangga_tersinggung' }] },
      { efek: { suasana_hati: -2 }, reaksi: { penakut: 2, jujur: 3 }, tunda: [{ hari: [3, 3], peluang: 1.0, efek: { makanan: 2 }, teks: 'ganti_rugi_polisi' }] } ] },
  tengkulak_padi: { kelas: 'B', minDay: 25, musim: ['mareng'], syarat: { gandumMin: 25, atauHariSetelahPanen: 2 }, bobot: 1.1, ulangHari: 28,
    p: [
      { efek: {}, reaksi: { ahli_tani: 2 }, tunda: [{ hari: [5, 12], peluang: 1.0, syarat: { musim: 'kemarau', gandumMin: 20 }, efek: { suasana_hati: 3 }, teks: 'lumbung_aman' }] },
      { efek: { gandum: -20, alat: 2, papan: 6 }, reaksi: { pelit: 3, jujur: -1 },
        tunda: [{ hari: [9, 14], peluang: 0.35, syarat: { musim: 'kemarau' }, efek: { harga_beli_pangan: 30 }, teks: 'harga_beras_naik' },
                { hari: [1, 2], peluang: 0.3, syarat: { tanpaSifat: 'jujur' }, efek: { alat: -1 }, teks: 'timbangan_curang' }] },
      { efek: { gandum: -40, alat: 4, papan: 12, kopi: 3 }, reaksi: { pelit: 3, ahli_tani: -4 },
        tunda: [{ hari: [9, 14], peluang: 0.5, syarat: { musim: 'kemarau' }, efek: { harga_beli_pangan: 30, suasana_hati: -3 }, teks: 'harga_beras_naik' },
                { hari: [1, 2], peluang: 0.3, syarat: { tanpaSifat: 'jujur' }, efek: { alat: -2 }, teks: 'timbangan_curang' }] } ] },
  rentenir: { kelas: 'B', era: 'dusun', minDay: 25, syarat: { salahSatu: [{ kayuBawah: 20 }, { batuBawah: 10 }, { famine: 'waspada' }] }, bobot: 0.8, stateMult: { famineWaspada: 2 }, ulangHari: 42,
    p: [
      { efek: { kerja_bakti_gratis: 1 }, reaksi: { rajin: 2, religius: 2 } },
      { efek: { kayu: 30, batu: 20, utang: { kayu: 39, batu: 26, hari: 14, bungaPer7: 0.2, telatMaks: 2, sita: 0.5 } }, reaksi: { religius: -3, pelit: -2 } },
      { efek: { kayu: 60, batu: 40, papan: 10, utang: { kayu: 90, batu: 60, papan: 15, hari: 21, bungaPer7: 0.2, telatMaks: 2, sita: 0.5 } }, reaksi: { religius: -4, pelit: -3 } } ] },
  tambang_pasir: { kelas: 'B', era: 'desa_pertanian', musim: ['kemarau', 'mareng'], syarat: { sungai: true }, bobot: 0.7, ulangHari: 56,
    p: [
      { efek: { suasana_hati: 1 }, reaksi: { sabar: 2, jujur: 3 } },
      { efek: { hasil_harian: { batu: 6, hari: 7 } }, reaksi: { rajin: 2 },
        tunda: [{ hari: [8, 20], peluang: 0.3, syarat: { musim: 'hujan' }, efek: { banjir_mult: { kali: 1.5, hari: 9 }, ikan_mult: 0.8 }, teks: 'tebing_kali_gerus' }] },
      { efek: { batu: 80, alat: 3, suasana_hati: -4, teladan_poin: -0.5, suap: 1 }, reaksi: { jujur: -5, religius: -2, pelit: 2 },
        tunda: [{ hari: [8, 20], peluang: 0.6, syarat: { musim: 'hujan' }, efek: { banjir: 1, kesehatan_jembatan: -20, ikan_mult: 0.6 }, teks: 'kali_rusak' },
                { hari: [2, 6], peluang: 0.4, syarat: { adaSifat: 'jujur' }, efek: { suasana_hati: -3, rel_jujur_kades: -5 }, teks: 'suap_bocor' }] } ] },
  hajatan: { kelas: 'B', minDay: 25, syarat: { salahSatu: [{ pasanganBaruHari: 3 }, { hariJadiTanpaPasangan: true }] }, bobot: 1.2, ulangHari: 21,
    p: [
      { efek: { makanan: -4, mood_aktor: 8, suasana_hati: 3 }, reaksi: { pelit: 1 } },
      { efek: { makanan: -12, kelapa: -4, kopi: -2, suasana_hati: 10, rel_semua: 3 }, reaksi: { seniman: 3, pelit: -2 },
        tunda: [{ hari: [20, 35], peluang: 0.3, efek: { hamil_mult_aktor: 1.3, hari: 28 }, teks: 'doa_restu' }] },
      { efek: { makanan: -20, kayu: -10, minyak: -4, suasana_hati: 18, pendatang_mult: { kali: 1.5, hari: 7 } }, reaksi: { seniman: 5, pelit: -4 },
        tunda: [{ hari: [3, 5], peluang: 0.4, syarat: { foodDaysBawah: 8 }, efek: { suasana_hati: -5 }, teks: 'dapur_kosong_setelah_pesta' }] } ] },
  tanah_warisan: { kelas: 'B', minDay: 25, syarat: { salahSatu: [{ lansiaWafatAnak: 2 }, { klaimPetak: true }] }, aktor: 2, bobot: 1.0, ulangHari: 28,
    p: [
      { efek: { rel_AB: 5, mood_AB: -2 } },
      { efek: { mood_A: 8, mood_B: -10, rel_AB: -20, kerja_mult_A: { kali: 1.1, hari: 14 } }, tunda: [{ hari: [3, 10], peluang: 0.5, efek: { rel_AB: -15 }, teks: 'jadi_rival' }] },
      { butuh: 'balai', efek: { hari_kerja_hilang_AB: 0.5 }, tunda: [{ hari: [1, 1], peluang: 1.0, efek: { rel_AB: 10, mood_AB: 3, suasana_hati: 3 }, teks: 'musyawarah_rukun' }] } ] },
  rebutan_air: { kelas: 'B', musim: ['kemarau'], syarat: { airHariBawah: 5, sawahIrigasi: true }, bobot: 1.3, ulangHari: 28,
    p: [
      { efek: { pertumbuhan_ladang_sawah: -1 }, reaksi: { ahli_tani: -3, sabar: 1 } },
      { efek: { pertumbuhan_ladang_sawah: -0.5, rel_acak3: 3, suasana_hati: -1 }, reaksi: { sabar: 2, ramah: 2 } },
      { efek: { air: -10 }, reaksi: { ahli_tani: 3 }, tunda: [{ hari: [2, 4], peluang: 0.4, efek: { sakit_acak: { n: [1, 2], jenis: 'diare' } }, teks: 'diare_kemarau' }] } ] },
  beringin_keramat: { kelas: 'B', era: 'desa_pertanian', syarat: { adaBeringin: true }, bobot: 0.6, ulangHari: 84,
    p: [
      { efek: { makanan: -3, suasana_hati: 4, aura_beringin_mult: 1.25 }, reaksi: { religius: 2, seniman: 2 } },
      { efek: { kayu: 15 }, reaksi: { religius: -2 }, tunda: [{ hari: [2, 4], peluang: 0.2, efek: { ancaman_mult: { ular: 1.5, hari: 3 } }, teks: 'ular_turun' }] },
      { efek: { kayu: 60, hapus_beringin: 1, suasana_hati: -6, teladan_poin: -1 }, reaksi: { religius: -8, seniman: -3, periang: -2 },
        tunda: [{ hari: [7, 14], peluang: 0.5, efek: { mood_harian: { n: -3, hari: 3 } }, teks: 'mimpi_buruk' }] } ] },
  obat_sakit: { kelas: 'R', minDay: 5, syarat: { salahSatu: [{ sakitParah: 1 }, { sakit: 2 }] }, bobot: 1.2, ulangHari: 14,
    p: [
      { efek: { makanan: -2, sembuh_mult: 1.2 }, reaksi: { religius: 1 } },
      { efek: { alat: -1, sembuh_mult: 2, mati_parah_mult: 0.3 }, biayaAlt: { kopi: -3 }, reaksi: { cerdas: 3 } },
      { efek: { makanan: -1, mood_aktor: 6 }, reaksi: { religius: -2 }, tunda: [{ hari: [1, 1], peluang: 0.5, efek: { sembuh_mult: 1.8 }, teks: 'suwuk_manjur' }] } ] },
  pupuk_penyuluh: { kelas: 'B', era: 'desa_pertanian', musim: ['mareng', 'labuh'], bobot: 0.8, ulangHari: 56,
    p: [
      { efek: { makanan: -3, hasil_panen_add: { n: 1, panen: 1 } }, biayaAlt: { pakai_ternak: true }, reaksi: { ahli_tani: 2 } },
      { efek: { hasil_panen_mult: { kali: 1.3, panen: 2 } }, reaksi: { ahli_tani: 2 },
        tunda: [{ hari: [30, 45], peluang: 0.5, efek: { hasil_panen_mult: { kali: 0.85, hari: 28 }, obatnya: 'kompos' }, teks: 'tanah_keras' }] },
      { efek: {}, reaksi: { ahli_tani: -2 } } ] },
  sekolah_kota: { kelas: 'B', era: 'desa_pertanian', syarat: { salahSatu: [{ remaja: 1 }, { dewasaUmurBawah: 20 }] }, aktor: 1, bobot: 0.7, ulangHari: 56,
    p: [
      { efek: { skill_gain_aktor: { kali: 1.2, hari: 28 } }, reaksi: { suka_menolong: 2 } },
      { efek: { makanan: -4, kerja_mult_aktor: { kali: 0.5, hari: 28 } }, reaksi: { cerdas: 3, suka_menolong: -1 },
        tunda: [{ hari: [28, 28], peluang: 1.0, efek: { skill_aktor: { n: 0.25, jumlah: 2 }, progres_riset: 15, sifat_aktor_peluang: { perantau: 0.3, cerdas: 0.3 } }, teks: 'pulang_sekolah' }] },
      { efek: { absen_aktor: 21 }, reaksi: { suka_menolong: -3, perantau: 3 },
        tunda: [{ hari: [21, 21], peluang: 1.0, efek: { alat: 3, kopi: 5, kembali_aktor: 1 }, teks: 'pulang_merantau' },
                { hari: [21, 21], peluang: 0.25, efek: { absen_aktor: 7 }, teks: 'betah_di_kota' },
                { hari: [21, 28], peluang: 0.1, efek: { penduduk: 1, pasangan_aktor: 'baru' }, teks: 'pulang_bawa_jodoh' }] } ] },
  kerbau_tetangga: { kelas: 'R', era: 'dusun', minDay: 8, musim: ['hujan', 'labuh'], syarat: { ladangTumbuh: 2 }, bobot: 0.8, ulangHari: 42,
    p: [
      { efek: { pertumbuhan_ladang: -0.5, rel_tetangga: 1 }, reaksi: { dermawan: 2, pemarah: -2 },
        tunda: [{ hari: [7, 14], peluang: 0.4, efek: { makanan: 3 }, teks: 'bibit_kiriman' }] },
      { efek: { pertumbuhan_ladang: -0.5, makanan: 3 }, reaksi: { pemarah: 2, pelit: 2 },
        tunda: [{ hari: [3, 8], peluang: 0.3, efek: { harga_beli_pangan: 10 }, teks: 'tetangga_marah' }] },
      { efek: { pertumbuhan_ladang: -0.5, tanam_mult: { kali: 0.7, hari: 3 } }, reaksi: { ahli_tani: 3 },
        tunda: [{ hari: [3, 3], peluang: 0.5, efek: { suasana_hati: -3, rel_tetangga: -1 }, teks: 'pemilik_kerbau_datang' }] } ] },
  monyet_kebun: { kelas: 'R', syarat: { curianMonyet7: 2 }, bobot: 1.2, ulangHari: 21,
    p: [
      { efek: { bambu: -2, sabut: -1, bangun_gratis: 'orang_orangan' }, biayaAlt: { kayu: -3 } },
      { efek: { biaya_berkala: { makanan: 2, tiapHari: 3, kali: 3 }, ancaman_mult: { monyet: 0.3, hari: 14 } }, reaksi: { religius: 2, suka_menolong: 2 } },
      { efek: { ancaman_mult: { monyet: 0, hari: 14 }, teladan_poin: -0.5 }, reaksi: { suka_menolong: -3, jahil: 1 },
        tunda: [{ hari: [2, 6], peluang: 0.3, efek: { suasana_hati: -4, mood_sifat: { suka_menolong: -5 } }, teks: 'monyet_terluka' }] } ] },
  tanggap_reog: { kelas: 'B', minDay: 30, musim: ['mareng', 'labuh', 'hujan'], bobot: 0.9, ulangHari: 42,
    p: [
      { efek: { suasana_hati: 2 } },
      { efek: { makanan: -8, kopi: -2, suasana_hati: 12, rel_semua: 3, pentas_reog: 1 }, biayaAlt: { kayu: -15 }, reaksi: { seniman: 10, periang: 3, pelit: -2 } },
      { efek: { makanan: -12, suasana_hati: 10, pentas_reog: 1, diskon_monumen: { pendopo_reog: 0.3 }, beri_sifat_acak: 'seniman' }, reaksi: { seniman: 8 } } ] },
  ronda_wajib: { kelas: 'R', era: 'dusun', syarat: { salahSatu: [{ seranganHari: 3 }, { jejakMacan: true }] }, bobot: 1.5, ulangHari: 21,
    p: [
      { efek: { ronda: { orang: 2, malam: 7, energiPagi: -20 }, ancaman_mult: { semua: 0.6, hari: 7 } }, reaksi: { pemberani: 3, penakut: -2, malas: -2 } },
      { efek: { minyak: -3, ancaman_mult: { semua: 0.8, hari: 7 } }, biayaAlt: { kayu: -9 }, reaksi: { penakut: 2 } },
      { efek: {}, reaksi: { penakut: -4, pemberani: -2 } } ] },
  bantu_tetangga: { kelas: 'B', musim: ['hujan', 'labuh'], syarat: { setelah: ['banjir', 'longsor'] }, bobot: 1.0, ulangHari: 42,
    p: [
      { efek: { makanan: -6, kayu: -10, suasana_hati: 6, teladan_poin: 0.5 }, reaksi: { dermawan: 4, religius: 3, pelit: -3 },
        tunda: [{ hari: [14, 28], peluang: 0.6, efek: { alat: 2, hasil_panen_add: { n: 1, panen: 1 } }, teks: 'balas_budi_tetangga' }] },
      { efek: { absen_acak: { n: 2, hari: 2 }, rel_yang_pergi: 8, teladan_poin: 0.5 }, reaksi: { rajin: 2 },
        tunda: [{ hari: [14, 28], peluang: 0.6, efek: { alat: 1 }, teks: 'balas_budi_tetangga' }] },
      { efek: {}, reaksi: { dermawan: -4, religius: -3 } } ] },
  jalan_desa: { kelas: 'B', era: 'desa_pertanian', syarat: { popMin: 8 }, bobot: 0.6, sekaliSaja: true,
    p: [
      { efek: {}, tunda: [{ hari: [28, 42], peluang: 1.0, efek: { tawar_ulang: 'jalan_desa' }, teks: 'tawaran_lagi' }] },
      { efek: { hari_kerja_hilang: 1, suasana_hati: 3, rel_semua: 2 }, reaksi: { rajin: 3, suka_menolong: 3, malas: -3 },
        tunda: [{ hari: [3, 5], peluang: 1.0, efek: { batu: 40, papan: 10, jalan_cepat: 0.1, pedagang_hari_add: -1, teladan_poin: 1 }, teks: 'aspal_datang' }] },
      { efek: { kayu: -40, batu: -20 }, reaksi: { malas: 2 },
        tunda: [{ hari: [3, 5], peluang: 1.0, efek: { jalan_cepat: 0.1, pedagang_hari_add: -1, teladan_poin: 1 }, teks: 'aspal_datang' }] } ] },
  kontrak_kopi: { kelas: 'B', syarat: { kopiDikenal: true, kopiMin: 5 }, bobot: 0.8, ulangHari: 28,
    p: [
      { efek: {} },
      { efek: { kontrak: { kopi: 20, hari: 14, hadiah: { alat: 5, papan: 20 }, gagal: { suasana_hati: -6, harga_kopi: -0.15, hari: 14 } } }, reaksi: { ahli_tani: -2, pelit: 2 } },
      { efek: { kontrak: { kopi: 10, hari: 14, ulang: 2, hadiah: { alat: 2, suasana_hati: 3 }, gagal: {} } }, reaksi: { sabar: 2 } } ] },
  tikus_lumbung: { kelas: 'R', musim: ['hujan', 'labuh'], syarat: { gandumMin: 20 }, bobot: 1.0, efekPemicu: { gandum: -3 }, ulangHari: 28,
    p: [
      { efek: { makanan: -2, tikus_mult: 0.4, hewan_peliharaan: 'kucing' }, reaksi: { suka_menolong: 3 } },
      { efek: { tikus_mult: { kali: 0.2, hari: 14 } },
        tunda: [{ hari: [2, 6], peluang: 0.25, efek: { sakit_acak: { n: 1, jenis: 'ringan' }, ternak: -1 }, teks: 'keracunan' }] },
      { efek: { hari_kerja_hilang: 0.5, rel_semua: 3, tikus_mult: { kali: 0.5, hari: 21 } }, reaksi: { rajin: 2, periang: 2 } } ] },
  ketua_ronda: { kelas: 'B', syarat: { popMin: 8, bangunan: 'menara_jaga' }, aktor: 2, maksPerTahun: 1, bobot: 0.7, ulangHari: 28,
    p: [
      { efek: { mood_AB: 2, rel_AB: 4 } },
      { efek: { mood_A: 8, mood_B: -5, rel_AB: -8, usir_mult: { kali: 1.15, selamaAktorHidup: 'A' } }, tunda: [{ hari: [5, 10], peluang: 0.4, efek: { rel_AB: -8 }, teks: 'iri_jabatan' }] },
      { efek: { mood_B: 8, mood_A: -5, rel_AB: -8, mood_harian: { n: 1, hari: 14 } }, tunda: [{ hari: [5, 10], peluang: 0.4, efek: { rel_AB: -8 }, teks: 'iri_jabatan' }] } ] },
  penebang_liar: { kelas: 'B', era: 'desa_pertanian', syarat: { hutanJati: true }, bobot: 0.6, ulangHari: 56,
    p: [
      { efek: {}, reaksi: { pemberani: 2 }, tunda: [{ hari: [7, 14], peluang: 0.3, efek: { node_kayu: -2 }, teks: 'penebang_kembali' }] },
      { efek: {}, reaksi: { jujur: 3 }, tunda: [{ hari: [5, 7], peluang: 1.0, efek: { kayu: 10, jati_regrow_mult: 0.8 }, teks: 'perhutani_datang' }] },
      { efek: { kayu: 30, makanan: -6 }, reaksi: { jujur: -4, religius: -2 },
        tunda: [{ hari: [14, 21], peluang: 0.5, efek: { node_jati: -3, longsor_add: { n: 0.02, musim: 'hujan' }, teladan_poin: -0.5 }, teks: 'hutan_gundul' }] } ] },
  minta_hujan: { kelas: 'R', musim: ['kemarau'], syarat: { hariMusimMin: 5, kekeringan: true }, bobot: 1.4, ulangHari: 28,
    p: [
      { efek: { suasana_hati: 5, rel_semua: 2, hari_kerja_hilang: 0.1 }, reaksi: { religius: 6 },
        tunda: [{ hari: [1, 3], peluang: 0.35, efek: { air: 10, kekeringan_selesai: 1 }, teks: 'gerimis_doa' }] },
      { efek: { kayu: -10, batu: -15, sumur_kemarau_add: 1, energi: -10 }, reaksi: { rajin: 3, suka_menolong: 2 } },
      { efek: { makanan: -4, air: 25 }, reaksi: { pelit: -2 } } ] },
},
```

### 3.4 Sistem frekuensi: "Juru Cerita" (pengisi hari kosong)

**Definisi hari bermakna** (sama dengan kebalikan "hari datar" di `ANALISA-PLAYTEST.md`, ditambah sumber baru): ada minimal satu dari: event acak/musiman, dilema, momen kecil, langkah cerita berantai, keinginan baru yang butuh tombol atau keinginan terpenuhi, akibat tertunda mendarat, tahap monumen mulai/selesai, Agustusan/Hari Jadi/penilaian, target tahunan selesai, naik tingkat hubungan (sahabat/pasangan/rival), kelahiran/kematian, bangunan baru selesai, riset selesai.

**Cara kerja (sekali per hari, jam 09:00 = frac 0.375):**
1. Bila hari ini sudah bermakna (lihat daftar di atas, termasuk yang terjadwal sebelum 18:00), Juru Cerita diam.
2. Bila belum: undi `fill[k]`, dengan `k` = jumlah hari kosong berturut-turut sebelumnya. Awal (hari 3–14): `[0.45, 0.75, 1.0]`. Mulai hari 15: `[0.60, 0.90, 1.0]`. Artinya **tidak pernah ada 3 hari kosong berturut-turut** (bandingkan median rentang datar terpanjang 9 hari sekarang).
3. Bila lolos, pilih jenis isian: sebelum hari 25 → **70% momen kecil, 30% dilema R**; mulai hari 25 → **55% dilema, 25% langkah cerita/keinginan dipercepat, 20% momen kecil**.
4. Pilih dilema berbobot: `w = bobot × musimMult[musim] × stateMult × sifatMult × kebaruan`.
   - `musimMult`: dari data dilema; dilema dengan `musim` hanya boleh di musim itu.
   - `stateMult`: kondisi relevan ×2 (mis. rentenir saat FAMINE `waspada`, ronda saat ada serangan 3 hari terakhir).
   - `sifatMult`: ×1.3 bila ada penduduk dengan sifat yang ada di `reaksi` opsi mana pun (warga yang peduli membuat dilema lebih mungkin muncul).
   - `kebaruan`: ×1.5 bila id belum pernah muncul di save ini.
5. Batasan: maks **1 dilema/hari**, maks **2 modal/hari** (event + dilema), jeda antar modal ≥ 0.25 hari, id sama tidak muncul lagi sebelum `ulangHari` (bawaan **28**, berat **42–84**), kategori sama tidak dua kali dalam 3 hari, tidak ada dilema saat modal lain terbuka atau di malam hari (tunggu pagi).
6. Bila tidak ada dilema yang layak → momen kecil; bila momen kecil juga habis (semua dalam jeda) → log flavor saja (hari dianggap kosong).

**Perkiraan cakupan** (rantai Markov dengan peluang hari bermakna alami; dihitung untuk dokumen ini):

| Fase | P(hari bermakna tanpa Juru Cerita) | Cakupan dengan Juru Cerita | Isian Juru Cerita per hari |
|---|---|---|---|
| Hari 3–14 | ±0.30 | **±69%** (sisanya diisi tutorial/quest/bangun) | 0.39 |
| Hari 15–28 | ±0.45 | **±81%** | 0.36 |
| Hari 29–90 | ±0.55 (event 0.25 + keinginan + monumen + cerita) | **±84%** | 0.29 |
| Hari 90+ | ±0.60 | **±86%** | 0.26 |
| Pembanding: sekarang | 0.48–0.52 | 48–52% | 0 |

Sasaran 80–90% tercapai mulai hari 15. Dengan ±0.27 isian/hari pada hari 29–224, ada ±53 isian; 55% di antaranya dilema (±29 dilema) → tiap dilema rata-rata muncul 1–2 kali dalam 200 hari, cukup jarang supaya tidak terasa berulang. Angka P alami harus diukur ulang dengan `sim.js` setelah fitur masuk; bila cakupan < 80%, naikkan `fill[0]` 0.60 → 0.70 dulu, bukan menambah event.

**Momen kecil** (pilihan cepat tanpa biaya sumber daya, hanya mood/hubungan; opsi pertama selalu netral):

| id | Momen | Opsi (efek) |
|---|---|---|
| `nama_api` | Warga ingin memberi nama api unggun | "Geni Rukun" (+1 semua) / "Api Mbah Buyut" (`religius` +2) / biarkan (0) |
| `lagu_malam` | Lagu apa malam ini? | campursari (+1) / dolanan anak (anak & `suka_menolong` +3) / tembang macapat (`seniman` +3) |
| `gubuk_pertama` | Siapa tidur di gubuk baru dulu? | yang paling lelah (energi +10 orang itu) / yang tertua (+3 dia) / undian (rel +1 semua) |
| `ayam_jago` | Ayam jago tetangga berkokok jam 3 | biarkan (0) / tegur halus (`pemarah` +2, `sabar` −1) / jadikan alarm (bangun 0.01 lebih awal 3 hari) |
| `jenang_suro` | Ada yang ingin bikin jenang | nanti (0) / bikin bareng (rel +2 peserta; makanan −1 hanya mulai hari 25) |
| `cerita_hantu` | Malam Jumat, anak muda mau cerita genderuwo | larang (0) / boleh (`jahil` +3, `periang` +2, `penakut` −3) / ganti dongeng Kancil (anak +2) |
| `burung_perkutut` | Perkutut liar hinggap di pos ronda | biarkan terbang (0) / pelihara (`sabar` +3) / lepas sambil berdoa (`religius` +2) |
| `hujan_main` | Hujan pertama, anak-anak main lumpur | larang (0) / biarkan (anak +4, orang tua `suka_menolong` +2, peluang masuk angin 0.03) |
| `gosip_pagi` | {nama} menggosipkan {nama2} | diamkan (0) / tegur (`jahil` −3, rel {nama}-{nama2} +2) / ikut tertawa (rel penggosip +2, sasaran −3) |
| `teh_tubruk` | Siapa yang menyeduh teh untuk pekerja? | tidak usah (0) / {nama} (rel +2 dengan rekan kerja) |
| `mimpi_panen` | {nama} bermimpi panen besar | tertawakan (0) / anggap pertanda (`ahli_tani` +3) |
| `kentongan_iseng` | Anak-anak memukul kentongan iseng | maafkan (0) / ajari kode kentongan (sekali: peringatan ancaman berikutnya 0.05 hari lebih awal) |

```js
// ---- KEPUTUSAN: Juru Cerita & momen kecil (docs/RISET-CERITA-TUJUAN.md §3.4) ----
DIRECTOR: {
  startDay: 3, checkFrac: 0.375, scheduleCutoffFrac: 0.75,
  fillEarly: { untilDay: 14, chances: [0.45, 0.75, 1.0] },
  fill: [0.60, 0.90, 1.0],                          // indeks = hari kosong berturut-turut sebelumnya
  mixEarly: { untilDay: 24, momen: 0.70, dilemaR: 0.30 },
  mix: { dilema: 0.55, cerita: 0.25, momen: 0.20 },
  maxDilemmaPerDay: 1, maxModalPerDay: 2, minGapDays: 0.25,
  defaultRepeatDays: 28, sameCategoryGapDays: 3, nightBlock: true,
  weight: { stateBoost: 2.0, traitBoost: 1.3, novelty: 1.5 },
  meaningful: ['event', 'dilema', 'momen', 'cerita', 'keinginan_tombol', 'keinginan_selesai', 'tunda', 'monumen', 'agustusan', 'hari_jadi', 'target_tahunan', 'naik_hubungan', 'lahir', 'wafat', 'bangunan_selesai', 'riset_selesai'],
},
MOMEN_KECIL: {
  repeatDays: 21,
  list: ['nama_api', 'lagu_malam', 'gubuk_pertama', 'ayam_jago', 'jenang_suro', 'cerita_hantu', 'burung_perkutut', 'hujan_main', 'gosip_pagi', 'teh_tubruk', 'mimpi_panen', 'kentongan_iseng'],
  maxMood: 4, foodFromDay: 25, foodMax: 1,
},
```

---

## 4. Integrasi dengan sistem yang ada

### 4.1 Tabel kait (hook)

| Sistem sekarang | Kait baru | Catatan |
|---|---|---|
| `spawnVillager()` | `v.traits`, `v.rel` (atau `S.rel`), `v.wish`, `v.chain` | pendiri pakai aturan `founderExclude`/`founderNeedOneOf`; pendatang event pakai `pendatang_sifat`; sambutan `ramah` (+15 rel, +5 mood) dan `jujur` (+5 rel) dipasang di sini |
| `workMult(v, sk)` | × sifat (`workMult`, `jobMult`, `aloneWorkMult`, `nightWorkMult`, `helpWorkMult` untuk kerja bakti/rawat/bangun); `cerdas` lewat `SKILL_GAIN` ×1.25 × hubungan (`teman`/`sahabat`/`rival` dalam radius) | hitung pengali hubungan maks 2 kali/dtk per penduduk (cache) supaya murah |
| `chooseTask()` | `jagaUtil` (pemberani), `noNightJaga` (penakut), kerja bakti, absen | absen = penduduk disembunyikan, tidak makan dari stok |
| `updateVillager()` lapar/energi | `hungerMult`, `energyMult` sifat | **`foodPerDay()` harus ikut `hungerMult`** supaya `foodDays`, FAMINE, dan d24 tetap akurat (sama seperti catatan `AGE.foodMult`) |
| mood (`MOOD_*`) | `moodPerDay` sifat, aura, hubungan, buff keinginan | diterapkan di `newDay()` sebagai delta kecil + per detik untuk aura (÷ `DAY_LENGTH_SEC`) |
| ancaman (`TH()`, `biteVillager`, babi/monyet/ular/macan) | `fleeFracAdd`, `scareMult`, `threatDmgMult`, `traumaMult`, `ancaman_mult` dari dilema | penakut pulang lebih awal saat fase `jejak` |
| `killVillager()` / `DEATH` | duka per hubungan, keinginan `ziarah_makam`, rantai `mbah_pendongeng`, `tanah_warisan` | `S.memorials` sudah ada → tambah daftar sahabat |
| `PAIRING` / `PREGNANCY` / `AGE` **[SIKLUS-HIDUP]** | `RELATION.pairing.minRel`, `pregnancyRelMult`, `TRAITS.inherit`, efek anak `suka_menolong` | anak simpan `traitsHidden` sampai umur 8 |
| `maybeEvent()` / `fireEvent()` / `chooseEvent()` | Juru Cerita dipanggil setelah `maybeEvent()` di `newDay()` lalu lagi pada frac 0.375; dilema memakai modal yang sama (`showEvent`) dengan sumber `TEXT.dilema` | `S.eventLastDay`/`S.eventYearCount` dipakai juga untuk dilema |
| `applyEffects()` | kunci baru (§4.2) | kunci yang belum didukung tetap di-log seperti sekarang ("belum didukung") |
| `anniversaryEvent()` (Hari Jadi hari 29, 57, …) | Rencana Tahun, Pentas Reog, Halal bihalal | Hari Jadi tetap event tetap (bukan isian Juru Cerita) |
| `questProgress()` | tipe baru: `tahap_monumen`, `monumen_selesai`, `gelar_teladan`, `pasangan`, `sahabat`, `keinginan_terpenuhi`, `lomba_ikut`, `lomba_menang`, `cerita_selesai`, `kelahiran`, `tanpa_jenjang`, `anak_bekerja`, `generasi` | dipakai `YEAR_GOALS` dan quest/pencapaian baru |
| `checkAch()` (A01–A24) | A25–A34 (lihat §7 Dokumen); A33 hitung `S.bribesRefused`, A34 hitung pendatang yang disambut `ramah` | |
| `MARKET` | harga baru dari RISET-INDONESIA (bambu, kelapa, minyak, sabut, kopi), `pasar_legi`, `kontrak_kopi`, tengkulak | kontrak memakai mekanisme kontrak V3.1 dari RISET-TAHAP3 |
| `FAMINE` | `noPenaltyFamine` keinginan; kerja bakti diblokir saat `bahaya`+; penilaian Teladan | |
| `SEASON_FX` (banjir, longsor, kekeringan) | `banjir`, `longsor`, `kekeringan_selesai`, `banjir_mult` dari dilema; bonus bendungan mengubah `floodChance`, `droughtChance`, `waterMult` | ubah lewat pengali di `FX()` bukan menimpa konstanta |
| save/load (`localStorage`) | `S.rel`, `S.pending`, `S.monuments`, `S.teladan`, `S.yearGoals`, `S.chains`, `S.director`, `S.lomba`, `v.traits`, `v.wish` | default kosong untuk save lama (pola `S.x = S.x || …` yang sudah ada) |

**Bangunan kecil yang dirujuk tetapi belum ada di `BUILDINGS`:** `rumah_panggung`, `kandang_ayam`, `orang_orangan` (semuanya dari RISET-INDONESIA, P1–P2) dan `posyandu` (baru: 2×2, kayu 15 + bambu 10, work 40, era dusun). Keinginan/cerita yang memerlukannya otomatis tidak muncul sampai bangunannya ada.

### 4.2 Kunci efek baru untuk `applyEffects`

| Kunci | Arti |
|---|---|
| `mood_aktor`, `mood_A`, `mood_B`, `mood_AB`, `mood_sifat{}` | mood untuk tokoh tertentu / pemilik sifat |
| `rel_AB`, `rel_semua`, `rel_acak`, `rel_acak3`, `rel_peserta`, `rel_tetangga` | ubah hubungan (`rel_tetangga` = skor desa tetangga −5…+5, memengaruhi D14/D18/pedagang) |
| `sifat_aktor`, `sifat_ganti[lama,baru]`, `beri_sifat_acak`, `sifat_aktor_peluang{}` | tambah/ganti sifat (hormati bentrok & batas 1 perubahan) |
| `tunda` | jadwalkan akibat tertunda ke `S.pending` |
| `ladang_gratis` | n ladang berikutnya tanpa biaya kayu |
| `banjir`, `longsor`, `banjir_mult`, `longsor_add`, `kekeringan_selesai` | panggil sistem musim yang ada |
| `ancaman_mult{jenis,hari}`, `usir_mult` | pengali peluang ancaman sementara |
| `utang{…}` | catat tagihan; tagih otomatis di hari jatuh tempo (kartu "Juragan datang menagih") |
| `kontrak{…}` | kontrak pasar berbatas waktu |
| `absen_aktor`, `absen_acak`, `kembali_aktor`, `pamit_aktor`, `pamit_pendatang` | penduduk pergi sementara/tetap |
| `kerja_mult_*`, `skill_gain_aktor`, `skill_aktor`, `sembuh_mult`, `mati_parah_mult`, `hamil_mult_aktor`, `risiko_lahir_mult` | buff/debuff berdurasi |
| `hasil_panen_add`, `hasil_panen_mult`, `pertumbuhan_ladang_sawah`, `tanam_mult` | ladang |
| `hasil_harian{res,hari}`, `biaya_berkala{res,tiapHari,kali}` | aliran sumber daya harian |
| `pentas_reog`, `kerja_bakti_gratis`, `bangun_gratis`, `diskon_monumen`, `paksa_keinginan`, `buka_keinginan`, `buka_dilema` | pemicu sistem lain |
| `teladan_poin` | poin Teladan |
| `tikus_mult`, `ular_rumah_mult`, `hewan_peliharaan`, `ternak` | hama & hewan |
| `jalan_cepat`, `pedagang_hari_add`, `harga_jual_*_permanen`, `harga_kopi` | ekonomi/gerak |
| `hapus_beringin`, `node_kayu`, `node_jati`, `jati_regrow_mult`, `sumur_kemarau_add`, `kesehatan_jembatan`, `kesehatan_bangunan_dekat` | peta |

---

## 5. Balancing

### 5.1 Pangan: jangan rusak target d24 (median 25–50)

Semua fitur dihitung dampaknya sampai hari 24 (pop 4–5, foodPerDay ±8–10, stok median sekarang di rentang 25–50):

| Sumber | Mulai | Dampak pangan s.d. hari 24 (bot sim, opsi pertama) | Dampak (pemain aktif) |
|---|---|---|---|
| Sifat pendiri (minimal 1 sifat kerja, tanpa malas/pemarah/pemurung) | hari 1 | +0 … +4 (rajin/ahli_tani/suka_menolong mempercepat meramu, panen, bangun) | sama |
| `hungerMult` (pelit ×0.95) | hari 1 | 0 … +1 | sama |
| Hubungan (kerja ×1.05–1.10 untuk teman; pendiri mulai teman +25) | hari 1 | +0 … +2 | sama |
| Keinginan (mulai Dusun & hari 12; pangan > 2 baru hari 25) | ±hari 16 | 0 (bot tidak menekan tombol) | −2 … −4 (1–2 nasi pecel/jajan) |
| Momen kecil (tanpa pangan sebelum hari 25) | hari 3 | 0 | 0 |
| Dilema R (±2.4 isian s.d. d24; opsi pertama ≥ −2) | hari 5 | −2 … −4 | −6 … +6 (tergantung pilihan) |
| Agustusan tahun 1 (gratis, kerja berhenti 0.25 hari) | hari 21 | −1 … −2 (produksi hilang) | sama |
| Monumen, dilema B, target tahun 2 | hari 25+ | 0 | 0 |
| **Total** | | **−6 … +3** | **−13 … +7** |

Kesimpulan: median bot bergeser paling banyak ±6 (masih di dalam 25–50 bila median sekarang 31–44). **Aturan pengaman:** bila sim ulang memberi median < 27, (1) jadikan Agustusan tahun 1 setengah hari (lomba 13:00–15:00), lalu (2) turunkan `DIRECTOR.mixEarly.dilemaR` 0.30 → 0.15. Bila > 48, hapus syarat `founderNeedOneOf`. **Jangan** menambah hadiah pangan untuk menutupi.

**Setelah hari 25** (pengeluaran pangan opsional, menyerap surplus yang di playtest menumpuk): hajatan −4…−20, tanggap reog −8…−12, keinginan ±2–4 per 12 hari per penduduk, kerja bakti 0.5/orang tiap ≥ 7 hari, tumpeng 17-an −4. Untuk pop 10, ini ±1.5–3 makanan/hari rata-rata ≈ 8–15% dari konsumsi (20/hari) — terasa, tetapi tidak menimbulkan kelaparan selama pemain tidak memilih opsi mahal saat `waspada` (opsi mahal dinonaktifkan oleh `affordable()` yang sudah ada bila stok tidak cukup; tambah: opsi dengan biaya pangan ≥ 8 dinonaktifkan saat FAMINE ≥ `waspada`).

**Sumber pangan baru** sengaja kecil: `ahli_tani` +1/panen, kiriman/balas budi +3, bibit +3, mancing +1, ganti rugi +2–3. Maks gabungan ±1 makanan/hari pada pop 10.

### 5.2 Mood

Mood sekarang bergerak cepat (`MOOD_DECAY` 0.05/dtk ≈ −6/hari, api unggun +0.15/dtk), dan ambang penting adalah `PAIRING` 65, `SPAWN.minMood` 65, `LEAVE.moodBelow` 35. Tambahan harian dijaga kecil supaya tidak menghapus tekanan:

| Sumber | Rentang per penduduk per hari |
|---|---|
| Sifat (`moodPerDay`, aura) | −1 … +3 |
| Hubungan (teman/sahabat/pasangan − rival) | −1 … +3.5 (cap total hubungan +3.5) |
| Buff keinginan (3 hari setelah terpenuhi) | +1 … +3 |
| Monumen (gabungan semua tahap) | 0 … +3.5 (masjid 1, balai 1, bendungan 0.5, Swasembada 1) |
| **Cap total bonus pasif baru** | **+6/hari** (sisanya terbuang) |

Lonjakan sesaat (lomba +2…+18, hajatan +3…+18, keinginan +5…+25) hanya sesekali, dan dilema/akibat tertunda memberi −2…−10. Rata-rata mood target: tahun 1 55–65, tahun 3+ 62–72. Bila rata-rata mood tahun 3+ > 78 di sim, turunkan cap pasif ke +4.

### 5.3 Tenaga & tempo

- Monumen satu slot aktif + material di muka → tidak menyedot tukang dari pangan; `work` 150–800 setara 1–6 Balai lama.
- Kerja bakti ×1.25 tetapi cooldown 7 hari: ±4% tenaga tambahan per minggu ke bangunan.
- Absen (sekolah, merantau, pulang kampung, bantu tetangga) maks 1 orang absen dari dilema/cerita pada satu waktu bila pop < 8.

### 5.4 Pengaman lain

- Dilema berat tidak pernah memunculkan dua akibat tertunda negatif di hari yang sama; bila bentrok, yang kedua digeser 1–2 hari.
- Utang rentenir: sita maksimal 50% satu sumber daya, tidak pernah pangan.
- `pamit_*` tidak membuat pop < `LEAVE.minPop` (2).
- Cerita & dilema yang butuh SIKLUS-HIDUP otomatis tidak memenuhi syarat bila sistem itu belum ada.

---

## 6. Prioritas implementasi

**P0 (inti, langsung mengurangi hari datar):**
1. `DIRECTOR` + `MOMEN_KECIL` + format `DILEMMAS` dengan `tunda` (`S.pending`) dan `reaksi`.
2. 12 dilema pertama: D02, D03, D11, D14, D15, D17, D21, D24 (R) + D01, D04, D05, D16 (B).
3. `TRAITS` (20 sifat, efek kerja/lapar/mood/ancaman) + pewarisan sederhana (tanpa sifat ke-3 dulu).
4. `RELATION` skor + pemicu kerja/makan/api/ronda + 4 tingkat + efek kerja/mood + ikon.
5. `AGUSTUSAN` dengan 4 lomba (balap karung, makan kerupuk, tarik tambang, panjat pinang) + umbul-umbul.
6. Tes ulang d24 + `sim.js` 120 hari (cakupan hari bermakna ≥ 80% dari hari 15).

**P1 (tujuan jangka panjang):**
1. `MONUMENTS` (Masjid, Bendungan, Pendopo Reog dulu) + `KERJA_BAKTI` + bar progres.
2. `WISHES` (26) + panel keinginan.
3. `TELADAN` + penilaian di hari 21 tahun 2+.
4. `YEAR_GOALS` tahun 1–5 + tipe quest baru.
5. Sisa dilema D06–D10, D12, D13, D18–D20, D22, D23; integrasi PAIRING/PREGNANCY dengan hubungan.
6. Cerita berantai: `warok_muda`, `penakut_babi`, `resep_nenek`, `kucing_belang`, `surat_kota`.

**P2 (kedalaman):**
1. Balai Desa Megah, Pasar Legi (siklus pasaran 5 hari).
2. Cerita berantai sisa (`cinta_segitiga`, `bidan_desa`, `kopi_pertama`, `rival_sawah`, `mbah_pendongeng`).
3. Sifat ke-3 berbias pengalaman, `tabungan_haji`, generator target tahun 9+.
4. Lomba bakiak, kelereng sendok, hias gapura, pawai reog; Halal bihalal.
5. Ending lembut Desa Teladan Nasional.

---

## 7. Catatan per tim

### Koding
- Tempel blok konstanta: `TRAITS`, `RELATION`, `WISHES`, `STORY_CHAINS`, `MONUMENTS`, `KERJA_BAKTI`, `TELADAN`, `AGUSTUSAN`, `YEAR_GOALS`, `DILEMMAS`, `DIRECTOR`, `MOMEN_KECIL` ke `balance.js` (atau berkas baru `cerita.js` dimuat setelah `balance.js`, sebelum `tema.js`, supaya tema bisa menimpa).
- State baru: `v.traits`, `v.traitsHidden`, `v.wish`, `v.buffs[]`, `v.away`, `S.rel` (kunci `'idKecil-idBesar'`), `S.pending[]`, `S.monuments{}`, `S.teladan{tier,points,history}`, `S.yearGoals`, `S.chains{}`, `S.director{emptyStreak,lastModal,lastById}`, `S.lomba{year,results}`, `S.debts[]`, `S.contracts[]`, `S.neighborRel`.
- Kait: `newDay()` (decay hubungan, keinginan, `S.pending`, Juru Cerita tahap 1, tagihan utang, buff), `step()` pada frac 0.375 (Juru Cerita tahap 2), `workMult()`, `foodPerDay()` (ikut `hungerMult`), `chooseTask()`, `applyEffects()` (§4.2), `questProgress()` (tipe baru), `killVillager()` (duka per hubungan), `anniversaryEvent()` (Rencana Tahun), pemicu Agustusan berdasarkan `dayOfYear = ((S.day − 1) % 28) + 1`.
- Ekspor ke `window.DESA` untuk tes: `traitMult(v)`, `relLevel(a,b)`, `directorTick()`, `firePending()`, `startMonumentStage(id)`, `assessTeladan()`, `runLomba()`.
- Tes: (1) d24 median tetap 25–50; (2) sim 120–224 hari: cakupan hari bermakna ≥ 80% mulai hari 15, tidak ada rentang kosong ≥ 3 hari; (3) tidak ada sifat bentrok; (4) dilema tidak berulang sebelum `ulangHari`; (5) akibat tertunda mendarat dalam rentang hari; (6) save/load mempertahankan `S.pending` dan `S.rel`; (7) bot opsi pertama tidak pernah membuat FAMINE `kritis` karena dilema.

### Dokumen (TEKS-GAME.json)
- Bagian baru: `sifat` (20 id persis seperti §1.1 — `rajin`, `malas`, `pemberani`, `penakut`, `periang`, `pemurung`, `ramah`, `pemarah`, `sabar`, `dermawan`, `pelit`, `suka_menolong`, `jujur`, `jahil`, `cerdas`, `religius`, `perantau`, `ahli_tani`, `pandai_masak`, `seniman`: nama, deskripsi 1 kalimat, tooltip efek; plus log kejahilan `jahil`, sambutan pendatang `ramah`, dan teks suap/timbangan curang untuk `jujur`; petakan ulang `penduduk[].sifat` ke id ini), `hubungan` (nama tingkat, log naik/turun tingkat: jadi teman/sahabat/rival/berbaikan, gosip, konflik, hadiah, ronda bareng), `keinginan` (26: judul gelembung, teks muncul, teks terpenuhi, teks gagal), `cerita` (10 rantai × 3–4 langkah: deskripsi + teks tiap pilihan + teks hasil), `dilema` (24: judul, kategori, deskripsi, 3 pilihan `teks`/`teks_hasil`, dan teks setiap `tunda.teks` seperti `banjir_hulu`, `kiriman_terima_kasih`, `harga_beras_naik`), `momen_kecil` (12), `monumen` (5 × tahap: nama, deskripsi, log mulai/selesai), `teladan` (5 gelar, sambutan Pak Camat, pesan "tahun depan lebih baik"), `agustusan` (panitia, tirakatan, upacara, 8 lomba: aturan + 2–3 variasi log menang/kalah/lucu, pengumuman juara), `rencana_tahun` (pembuka tahun 1–8, teks piagam, ending lembut).
- Pencapaian baru usulan: A25 Nyali Kentongan (penakut jadi pemberani), A26 Desa Teladan Nasional, A27 Tujuh Purnama Kemarau (piagam tahun 7), A28 Juara Panjat Pinang, A29 Sahabat Sejati (rel 100), A30 Monumen Pertama, A31 Pak/Bu Haji, A32 Lima Monumen, A33 Tangan Bersih (menolak suap di D06/D23 tiga kali saat ada warga `jujur`), A34 Ramah Tamah (5 pendatang disambut warga `ramah` dan bertahan 28 hari). Ikon pencapaian sifat boleh memakai ulang ikon sifat 32×32.
- Placeholder baru: `{nama2}` sudah ada; tambah `{sifat}` (sekarang di-*hardcode* "yang baik hati" di `fill()`), `{monumen}`, `{tahap}`, `{gelar}`, `{lomba}`, `{keinginan}`, `{hari_keputusan}` (untuk log akibat tertunda), `{pasaran}`.
- Nada: hangat, lucu, sopan; tidak menghakimi pilihan pemain. Hindari kekerasan (jerat monyet ditulis "monyet terkilir, lalu lepas ke hutan"). Topik agama dan adat ditulis hormat dan ringan (istisqa, selamatan, suwuk) tanpa menyatakan satu cara paling benar.

### Desain (sprite & UI)
- **Ikon hubungan** 12×12: teman 🙂 (hijau muda), sahabat 🤝 (hijau tua), rival ⚡ (oranye), pasangan ❤️ (merah muda), keluarga 🏠; garis tipis antara dua penduduk saat panel dibuka.
- **Ikon sifat:** 16 sudah ada di `assets/icons/traits/` (32×32 + `_16`, bingkai hijau positif / ungu-abu negatif; tabel di §1.1). **Perlu 4 ikon baru** dengan gaya & ukuran yang sama, bingkai hijau: `trait_perantau` (buntalan kain di tongkat), `trait_ahli_tani` (caping + padi/cangkul), `trait_pandai_masak` (wajan atau cobek-ulekan), `trait_seniman` (topeng reog/dadak merak mini), masing-masing 32×32 + `_16.png`, lalu daftarkan di `manifest.json`. Ikon sifat lama (kuat, ringkih, humoris, dll.) tidak diperlukan.
- **Gelembung keinginan** di atas kepala (gambar rendang, pecel, kopi, rumah panggung, merak reog, Ka'bah kecil untuk haji, kail, ayam, layangan…) + kartu di panel "Keinginan Warga".
- **Monumen:** sprite per tahap untuk Masjid (langgar bambu → masjid kayu → masjid jami' dengan bedug & menara), Bendungan (bronjong → saluran → pintu air → embung), Pendopo Reog (sanggar → dadak merak → pendopo agung), Balai Megah (serambi → joglo → ukiran), Pasar Legi (los bambu → pasaran → bata). Tiap fondasi punya perancah bambu. **Bar progres monumen** di atas bangunan (hijau, label "Tahap 2/3 — 64%") dan di panel Tujuan Desa.
- **Agustusan:** umbul-umbul (bambu melengkung + kain merah putih, 2 frame berkibar), bendera di tiang, gapura janur, batang pinang berhadiah, karung, tambang, bakiak, kerupuk tergantung; lampu hias malam; ikon piala 14 hari.
- **Teladan:** papan gelar di depan Balai yang berubah per tingkat; piala emas tingkat 4.
- **UI dilema:** kartu dengan potret kecil tokoh (`ui/dilemma/portraits/`, pemain = `icon_kepala_desa`), ikon sifat 16×16 yang bereaksi (`trait_<id>_16.png` + 😊/😟 di samping), tanda ⏳ untuk akibat tertunda; log akibat tertunda memakai warna sama dengan kartu asalnya.
- **Lain:** kucing belang (3 frame), orang-orangan sawah, posyandu kecil, kentongan besar di Balai, sosok tamu (tengkulak bertopi, juragan berkalung, mantri bertas, Pak Camat berseragam), reog berjalan (dadak merak besar) untuk pentas/pawai.

---

## 8. Ringkasan angka kunci

- Sifat: 20 (16 pakai ikon yang ada, 4 ikon baru: perantau, ahli_tani, pandai_masak, seniman), 2 per orang (+25% sifat ke-3), 6 pasangan bentrok; anak: 45% dari orang tua, 15% mentor, 40% acak, terlihat umur 8.
- Hubungan −100…+100: rival ≤ −30, teman ≥ 20, sahabat ≥ 50, pasangan butuh ≥ 50 + PAIRING; batas naik +6/pasangan/hari; decay 0.5/0.25/0.3 per hari setelah 3 hari tanpa interaksi.
- Keinginan: 26, 0.08/hari/penduduk (Dusun & hari ≥ 12), 1 aktif/orang, cap `ceil(pop/3)+1`, durasi 7 hari (haji 56), hadiah +4…+25, gagal −1…−6.
- Cerita berantai: 10 rantai × 3–4 langkah, maks 2 aktif.
- Monumen: 5 (Masjid 3 tahap, Balai Megah 3, Bendungan 4, Pendopo Reog 3, Pasar Legi 3) = 16 tahap, `work` 150–800, mulai hari 25.
- Teladan: Swadaya / Swakarya / Swasembada / Teladan Nasional, dinilai hari ke-21 tiap tahun mulai tahun 2.
- Agustusan: hari ke-21 tiap tahun (21, 49, 77, …, 217), 8 lomba, 2–5 slot, tahun 1 gratis.
- Target tahunan: tahun 1–8 + generator; 3 dari 5 untuk piagam; konten sampai hari 224+.
- Dilema: 24 (8 ringan, 16 berat), masing-masing 3 opsi + akibat tertunda; Juru Cerita `fill` [0.60, 0.90, 1.0] → cakupan ±81–86% mulai hari 15, tidak ada 3 hari kosong berturut-turut.
- Pangan d24: perubahan bot −6…+3; pengeluaran pangan besar hanya setelah hari 25.
