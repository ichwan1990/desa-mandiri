// tujuan.js — data P1 Cerita & Tujuan (docs/RISET-CERITA-TUJUAN.md §1.3 keinginan, §1.4 cerita berantai, §2.1 monumen & kerja bakti, §2.2 Teladan, §2.4 target tahunan).
// Dimuat setelah cerita.js dan sebelum tema.js (tema boleh menimpa lewat THEMES.*.TUJUAN_PATCH). Mesin di game.js ("P1 tujuan"). Teks: TEKS-GAME.json keinginan/monumen/cerita/teladan/rencana_tahun/kerja_bakti.
// Sumber daya yang belum ada di game (bambu, sabut, kelapa, minyak, kopi) memakai STORY_SINK.resAlias (bambu->kayu, sabut->kulit, minyak/kelapa/kopi->makanan).
Object.assign(CONFIG, {
  // ---- keinginan pribadi (§1.3) ----
  // cara: 'tombol' (pemain bayar biaya -> Penuhi), 'cicil' (setor bertahap), 'otomatis' (cek: kondisi harian/kejadian)
  // syarat muncul: era, minDay, butuh (kondisi desa), butuhSifat, musim, umur, bobotSifat (pengali bobot pilih)
  WISHES: {
    enabled: true,
    minEra: 'dusun', minDay: 12, foodWishMinDay: 25, foodWishThreshold: 2,
    chancePerDay: 0.08, minAge: 8,
    moodMult: 0.4, gapDays: 5, defaultDays: 7, buffDays: 3,   // moodMult = pengali mood & buff saat terwujud (sim 140 hari: mood penuh spes -> desa bahagia ~70% hari, target 25-45%)
    noPenaltyFamine: ['bahaya', 'kritis', 'kolaps'],
    cicilParts: 4,                                     // tabungan haji: tiap setor = 1/4 biaya
    autoChance: 0.45,                                  // cek otomatis 'kebiasaan' (ziarah, tidur siang, gamelan, mandi kali, ngobrol): peluang per hari bila syarat ada
    list: {
      makan_rendang:   { cara: 'tombol', biaya: { makanan: 3, kelapa: 2, minyak: 1 }, hari: 7, mood: 10, buff: 2, gagal: -5, minDay: 25 },
      nasi_pecel:      { cara: 'tombol', biaya: { makanan: 2 }, hari: 6, mood: 8, buff: 1, gagal: -4 },
      kopi_pagi:       { cara: 'tombol', biaya: { kopi: 3 }, hari: 5, mood: 6, buff: 3, gagal: -3, butuh: 'kopiDikenal', bobotSifat: { rajin: 2, pemurung: 2 } },
      rumah_panggung:  { cara: 'otomatis', cek: 'tinggalRumah', hari: 14, mood: 15, buff: 1, gagal: -6, butuh: 'rumahDikenal' },
      nonton_reog:     { cara: 'otomatis', cek: 'pentasReog', hari: 14, mood: 12, buff: 2, gagal: -5, minDay: 30, bobotSifat: { seniman: 3 } },
      tabungan_haji:   { cara: 'cicil', biaya: { kopi: 20, alat: 6 }, hari: 56, mood: 25, moodDesa: 5, gagal: -4, pergiHari: 7, gelar: true, butuhSifat: 'religius', minAge: 30, butuh: 'hajiTerbuka' },
      mancing_sore:    { cara: 'otomatis', cek: 'memancing', hari: 5, mood: 6, hasil: { makanan: 1 }, gagal: -2, bukanMusim: ['kemarau'] },
      punya_ayam:      { cara: 'otomatis', cek: 'bangunanBaru:kandang_ayam', hari: 10, mood: 8, buff: 1, gagal: -3, butuh: 'bisaBangunLagi:kandang_ayam' }, // muncul bila kandang masih bisa ditambah (1 + pop/8), terwujud saat Kandang Ayam baru selesai
      baju_baru:       { cara: 'tombol', biaya: { kulit: 2 }, biayaAlt: { kopi: 2 }, hari: 7, mood: 8, buff: 1, gagal: -4, butuh: 'pedagangAtauPasar' },
      ziarah_makam:    { cara: 'otomatis', cek: 'kebiasaan', hari: 7, mood: 6, dukaKurangHari: 2, gagal: -3, butuh: 'makamKerabat' },
      wayang_semalam:  { cara: 'tombol', biaya: { kulit: 3, minyak: 2 }, hari: 10, mood: 10, moodDesa: 4, gagal: -4, minEra: 'desa_pertanian' },
      tidur_siang:     { cara: 'otomatis', cek: 'kebiasaan', hari: 4, mood: 6, gagal: -2, butuhSifat: 'malas' },
      kerja_bakti:     { cara: 'otomatis', cek: 'kerjaBakti', hari: 7, mood: 6, rel: 2, gagal: -3, butuh: 'monumenAda', bobotSifat: { rajin: 3, suka_menolong: 2 } },
      ngobrol_sahabat: { cara: 'otomatis', cek: 'kebiasaan', hari: 5, mood: 5, rel: 3, gagal: -2, butuh: 'punyaTeman', bobotSifat: { ramah: 2, periang: 2 } },
      punya_anak:      { cara: 'otomatis', cek: 'hamil', hari: 14, mood: 15, gagal: -3, butuh: 'pasanganSiapHamil' },
      sawah_menguning: { cara: 'otomatis', cek: 'petakSiap:3', hari: 5, mood: 6, moodDesa: 1, gagal: -2, musim: ['mareng'], butuh: 'ladang:3' },
      jajan_pasar:     { cara: 'tombol', biaya: { makanan: 1 }, hari: 5, mood: 6, gagal: -2, butuh: 'bangunanAda:pasar' },
      belajar_gamelan: { cara: 'otomatis', cek: 'kebiasaan', hari: 10, mood: 8, skill: { meneliti: 0.05 }, gagal: -3, butuh: 'gamelan', bobotSifat: { seniman: 3, cerdas: 2 } },
      rujak_bareng:    { cara: 'tombol', biaya: { makanan: 2 }, hari: 5, mood: 6, moodSekitar: 2, gagal: -2, musim: ['kemarau'] },
      bancakan_weton:  { cara: 'tombol', biaya: { makanan: 3 }, hari: 4, mood: 8, relSerumah: 2, gagal: -3, siklusHari: 35, minDay: 25 },
      pulang_kampung:  { cara: 'tombol', biaya: { makanan: 2 }, hari: 10, mood: 10, pergiHari: 3, olehOleh: { chance: 0.3, alat: 1 }, gagal: -6, gagalLeaveAdd: 5, butuhSifat: 'perantau' },
      ronda_malam:     { cara: 'otomatis', cek: 'ronda', hari: 7, mood: 6, gagal: -2, butuhSifat: 'pemberani', butuh: 'bangunanAda:menara_jaga', bobotSifat: { pemberani: 3 } },
      main_layangan:   { cara: 'tombol', biaya: { bambu: 1, sabut: 1 }, hari: 5, mood: 8, moodOrtu: 3, gagal: -2, umur: [6, 12], musim: ['mareng', 'kemarau'] },
      menang_lomba:    { cara: 'otomatis', cek: 'menangLomba', hariTahun: [14, 21], mood: 12, gagal: -3 },
      tumpeng_syukuran:{ cara: 'tombol', biaya: { makanan: 4, gandum: 2 }, hari: 6, mood: 8, moodDesa: 2, gagal: -3, minDay: 25, butuh: 'panen3' },
      mandi_kali:      { cara: 'otomatis', cek: 'kebiasaan', hari: 4, mood: 4, gagal: -1, musim: ['hujan'] },
    },
  },
  // ---- monumen bertahap (§2.1): P1 = Masjid, Bendungan, Pendopo Reog (Balai Megah & Pasar Legi = P2) ----
  // fx kumulatif per tahap selesai; sprite: assets/buildings/monuments/<id>_tahap<N>(_stages).png
  MONUMENTS: {
    enabled: true, minDay: 25, parallel: 1,
    workerFoodPerDay: 0.6,                             // penyerap: makan pekerja monumen (makanan per pekerja-hari kerja monumen), lihat STORY_SINK
    masjid: { nama: 'Masjid Jami\'', w: 4, h: 4, kanvas: [128, 128], stages: [
      { nama: 'Langgar Bambu', era: 'dusun', cost: { kayu: 30, bambu: 30, batu: 10 }, work: 150, fx: { moodSifat: { religius: 1 }, griefDaysAdd: -1 } },
      { nama: 'Masjid Kayu', era: 'desa_pertanian', cost: { kayu: 60, batu: 60, papan: 30, bambu: 20 }, work: 320, fx: { moodAll: 1, moodSifat: { religius: 3 }, griefMult: 0.75 } },
      { nama: 'Masjid Jami\'', era: 'kota_kecil', cost: { batu_bata: 60, batu: 40, papan: 30, alat: 4, minyak: 6 }, work: 520, fx: { leaveMoodAdd: -5, wishDaysAdd: 2, teladan: 1, unlockWish: 'tabungan_haji' } } ] },
    bendungan: { nama: 'Bendungan & Irigasi', nearRiver: 2, w: 3, h: 2, kanvas: [96, 64], stages: [
      { nama: 'Bendung Bronjong Bambu', era: 'desa_pertanian', cost: { bambu: 40, batu: 30, kayu: 10 }, work: 200, fx: { floodMult: 0.7 } }, // spes: sabut 10 (sabut belum ada; alias kulit hanya dari pasar -> diganti kayu)
      { nama: 'Saluran Induk', era: 'desa_pertanian', cost: { batu: 80, kayu: 30, alat: 2 }, work: 360, fx: { irrigateRadius: 10, wellYieldHardAdd: 1 } },
      { nama: 'Pintu Air', era: 'kota_kecil', cost: { batu: 60, papan: 30, batu_bata: 20, alat: 4 }, work: 460, fx: { floodMult: 0.4, landslideMult: 0.7, failHarvestChance: 0.12 } },
      { nama: 'Bendungan & Embung', era: 'kota_kecil', cost: { batu: 100, batu_bata: 80, alat: 6 }, work: 800, fx: { hardWaterMult: 1.2, droughtChance: 0.06, hardFishMult: 0.8, moodAll: 0.5, teladan: 1 } } ] },
    pendopo_reog: { nama: 'Pendopo Reog', w: 4, h: 3, minDay: 30, kanvas: [128, 96], stages: [
      { nama: 'Sanggar Latihan', era: 'dusun', cost: { bambu: 30, kayu: 20, kulit: 4 }, work: 160, fx: { nightMoodNear: 0.5, radius: 5 } },
      { nama: 'Dadak Merak & Gamelan', era: 'desa_pertanian', cost: { kulit: 10, bambu: 20, sabut: 10, minyak: 4 }, work: 260, fx: { pentasReog: { mood: 12, relAnakDewasa: 4 } } },
      { nama: 'Pendopo Agung', era: 'kota_kecil', cost: { kayu: 60, papan: 40, batu: 40, batu_bata: 30, kopi: 8 }, work: 520, fx: { festivalSellMult: 1.10, newcomerMult: 1.2, teladan: 1 } } ] },
    order: ['masjid', 'pendopo_reog', 'bendungan'],
    passiveMoodCap: 3.5, passiveMoodMult: 0.25,  // sim: mood pasif penuh spes -> desa bahagia ~69% hari (target 25-45%)
    comfortPerStage: 0.25, comfortMax: 1,                 // batas nyaman mood desa naik +0.25 per tahap selesai (maks +1; spes +1/maks +5 -> desa bahagia terlalu sering)                               // §5.2: gabungan mood pasif monumen maks +3.5/hari
  },
  // ---- kerja bakti (gotong royong) §2.1 ----
  KERJA_BAKTI: { enabled: true, untilFrac: 0.71, workMult: 1.25, mood: 4, rel: 3, foodPerPerson: 0.5, kopiOptional: { kopi: 2, mood: 2 }, cooldownDays: 7, blockedFamine: ['bahaya', 'kritis', 'kolaps'] },
  // ---- Desa Teladan (§2.2): dinilai hari ke-21 tiap tahun mulai tahun 2 ----
  TELADAN: {
    enabled: true, assessDayOfYear: 21, assessFrac: 0.3, firstAssessYear: 2, noDowngrade: true,
    tiers: [
      { id: 'rintisan' },
      { id: 'swadaya', pop: 6, mood7: 55, bangunan: 12, tahap: 0, maxKritis28: 0, era: 'dusun', hadiah: { alat: 2, suasana_hati: 5 } },
      { id: 'swakarya', pop: 9, mood7: 60, bangunan: 20, tahap: 2, maxBahaya28: 2, maxKritis28: 0, era: 'desa_pertanian', hadiah: { papan: 15, batu_bata: 10 }, bonus: { spawnCooldownAdd: -1 } },
      { id: 'swasembada', pop: 12, mood7: 65, bangunan: 28, tahap: 5, monumenSelesai: 1, maxBahaya28: 0, foodDays: 10, poin: 2, noStarveDeathDays: 56, bonus: { moodAll: 1 } },
      { id: 'teladan', pop: 16, mood7: 70, bangunan: 36, tahap: 10, monumenSelesai: 3, maxBahaya56: 0, poin: 4, needPrevYears: 1, bonus: { newcomerMult: 1.3 }, ending: true },
    ],
  },
  // ---- target tahunan (§2.4) tahun 1-5; muncul di Hari Jadi (tahun 1: hari 1) ----
  YEAR_GOALS: {
    enabled: true, needOf: 3,
    years: {
      1: { utama: [{ tipe: 'capai_era', target: 'dusun' }, { tipe: 'bangun', target: 'gubuk', jumlah: 3 }, { tipe: 'tanpa_jenjang', target: 'kritis', musim: 'kemarau' }],
           pilihan: [{ tipe: 'lomba_ikut', jumlah: 1 }, { tipe: 'keinginan_terpenuhi', jumlah: 1 }], piagam: { suasana_hati: 5 } },
      2: { utama: [{ tipe: 'capai_era', target: 'desa_pertanian' }, { tipe: 'tahap_monumen', target: 'masjid', jumlah: 1 }, { tipe: 'gelar_teladan', target: 'swadaya' }],
           pilihan: [{ tipe: 'pasangan', jumlah: 1 }, { tipe: 'keinginan_terpenuhi', jumlah: 3 }], piagam: { alat: 2, suasana_hati: 5 } },
      3: { utama: [{ tipe: 'capai_era', target: 'kota_kecil' }, { tipe: 'tahap_monumen', target: 'semua', jumlah: 3 }, { tipe: 'gelar_teladan', target: 'swakarya' }],
           pilihan: [{ tipe: 'sahabat', jumlah: 2 }, { tipe: 'cerita_selesai', jumlah: 1 }], piagam: { papan: 15, batu_bata: 10 } },
      4: { utama: [{ tipe: 'monumen_selesai', jumlah: 1 }, { tipe: 'tahap_monumen', target: 'bendungan', jumlah: 2 }, { tipe: 'riset', jumlah: 10 }],
           pilihan: [{ tipe: 'kelahiran', jumlah: 1 }, { tipe: 'lomba_menang', jumlah: 3 }], piagam: { alat: 3, kopi: 6 } },
      5: { utama: [{ tipe: 'gelar_teladan', target: 'swasembada' }, { tipe: 'monumen_selesai', target: 'pendopo_reog' }, { tipe: 'tanpa_jenjang', target: 'bahaya', musim: 'kemarau' }],
           pilihan: [{ tipe: 'anak_bekerja', jumlah: 1 }, { tipe: 'keinginan_khusus', target: 'tabungan_haji' }], piagam: { batu_bata: 20, suasana_hati: 8 } },
    },
  },
  // ---- cerita berantai (§1.4), P1 = 5 rantai. langkah: { pilihan:[{efek, lanjut, jeda}] } | { efek, lanjut, jeda } | { acak:[{peluang, efek, kunci, lanjut}] } ; tunggu = kejadian pemicu langkah ----
  STORY_CHAINS: {
    enabled: true, maxActive: 2, repeatOtherVillagerDays: 56, checkChancePerDay: 0.12, minDay: 20,
    warok_muda: { syarat: { sifatSalah: ['seniman', 'pemberani'], minDay: 30, era: 'dusun' }, langkah: [
      { pilihan: [{ efek: { kulit: -2, bambu: -6 }, lanjut: 1, jeda: [3, 5] }, { efek: { mood_aktor: -3 }, lanjut: null }] },
      { pilihan: [{ efek: { energi_aktor: -10, rel_A_semua: 2 }, lanjut: 2, jeda: [4, 4] }, { efek: { mood_aktor: -4 }, lanjut: null }] },
      { acak: [{ peluang: 0.3, kunci: 'jatuh', efek: { kesehatan_aktor: -15 } }, { peluang: 0.7, kunci: 'lancar', efek: {} }], lanjut: 3, tunggu: 'pentasBerikut', batasHari: 40 },
      { efek: { suasana_hati: 10, pentas_reog: 1, sifat_aktor: 'pemberani', diskon_monumen: { pendopo_reog: 0.2 } }, kunci: 'selesai', lanjut: null } ] },
    surat_kota: { syarat: { sifat: 'perantau', butuh: 'pedagangPernahDatang' }, langkah: [
      { pilihan: [{ efek: { makanan: -3, absen_aktor: 5 }, lanjut: 1, jeda: [5, 5] }, { efek: { mood_aktor: -6, paksa_keinginan: 'pulang_kampung' }, lanjut: 2, jeda: [14, 14] }] },
      { efek: { alat: 2, kopi: 4 }, acak: [{ peluang: 0.4, kunci: 'bawa_adik', efek: { penduduk: 1 } }], lanjut: 2, jeda: [14, 14] },
      { cek: { relTertinggi: 50 }, ya: { kunci: 'betah', efek: { sifat_ganti: ['perantau', 'sabar'] } }, tidak: { acak: [{ peluang: 0.2, syaratMoodBawah: 50, kunci: 'pamit', efek: { pamit_aktor: 1, suasana_hati: -5 } }], kunci: 'tetap' }, lanjut: null } ] },
    resep_nenek: { syarat: { sifat: 'pandai_masak', era: 'dusun', minDay: 25 }, langkah: [
      { pilihan: [{ efek: { makanan: -3, kelapa: -1 }, lanjut: 1, jeda: [2, 2] }, { efek: {}, lanjut: null }] },
      { acak: [{ peluang: 0.7, peluangDenganDapur: 1.0, kunci: 'sukses', lanjut: 2, jeda: [1, 1] }, { peluang: 0.3, kunci: 'gagal', efek: { suasana_hati: 2 }, lanjut: 1, jeda: [7, 7] }] },
      { pilihan: [{ efek: { harga_jual_makanan_permanen: 0.10 } }, { efek: { suasana_hati: 6 } }], lanjut: null } ] },
    penakut_babi: { syarat: { sifat: 'penakut', setelah: 'serangan' }, langkah: [
      { pilihan: [{ efek: { ronda_aktor: 3 }, lanjut: 1, jeda: [3, 3] }, { efek: { mood_aktor: 4 }, lanjut: null }] },
      { efek: { rel_rekan_ronda: 5 }, lanjut: 2, tunggu: 'ancamanMendekat', batasHari: 28 },
      { acak: [{ peluang: 0.5, kunci: 'berani', efek: { sifat_ganti: ['penakut', 'pemberani'], suasana_hati: 5 } }, { peluang: 0.5, kunci: 'lari', efek: { mood_aktor: -8, rel_A_semua: 3 } }], lanjut: null } ] },
    kucing_belang: { syarat: { adaAnakAtauSifat: 'suka_menolong', bangunan: 'gudang' }, langkah: [
      { pilihan: [{ efek: { biaya_berkala: { makanan: 1, tiapHari: 3, kali: 10 } }, lanjut: 1, jeda: [7, 7] }, { efek: { rel_tetangga: 1 }, lanjut: null }] },
      { efek: { tikus_mult: 0.6, ancaman_mult: { ular: 0.7, hari: 999 } }, lanjut: 2, jeda: [21, 21] },
      { pilihan: [{ efek: { rel_tetangga: 2 } }, { efek: { mood_pemilik_harian: 2, biaya_berkala: { makanan: 1, tiapHari: 2, kali: 14 } } }], lanjut: null } ] },
  },
  // ---- orang-orangan sawah (RISET-INDONESIA; D15 monyet_kebun opsi 1 membangunnya gratis) ----
  SCARECROW: { radius: 4, monkeyMult: 0.5, boarFieldMult: 0.7 },  // monyet/rubah tidak mencuri dari ladang dalam radius; babi hutan lebih jarang memilih ladang dekatnya
});
CONFIG.BUILDINGS.orang_orangan = { nama: 'Orang-orangan Sawah', w: 1, h: 1, cost: { kayu: 5 }, work: 8, era: 'dusun' };
// monumen = bangunan khusus (tidak di bilah bangun; ditaruh dari panel Tujuan Desa). work dihitung per tahap (stageWork).
for (const id of ['masjid', 'bendungan', 'pendopo_reog']) { const M = CONFIG.MONUMENTS[id]; CONFIG.BUILDINGS[id] = { nama: M.nama, w: M.w, h: M.h, cost: {}, work: M.stages[0].work, era: M.stages[0].era, monumen: true }; }
