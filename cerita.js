// cerita.js — data Cerita & Tujuan P0 (docs/RISET-CERITA-TUJUAN.md §2.3, §3, §3.4; teks: TEKS-GAME.json v1.5.0 "dilema", "dilema_ui", "momen_kecil", "agustusan").
// Dimuat setelah balance.js dan sebelum tema.js, supaya tema bisa menimpa (THEMES.*.STORY_PATCH). Semua angka di sini, mesin di game.js ("Juru Cerita").
// Kunci efek lama (makanan, kayu, suasana_hati, penduduk, ...) dipakai apa adanya; kunci baru dijelaskan di §4.2.
Object.assign(CONFIG, {
  // ---- Juru Cerita (§3.4): pengisi hari kosong, cek sekali sehari jam 09:00 ----
  DIRECTOR: {
    startDay: 3, checkFrac: 0.375, scheduleCutoffFrac: 0.75,
    fillEarly: { untilDay: 14, chances: [0.45, 0.75, 1.0] },
    fill: [0.75, 0.95, 1.0],                          // indeks = hari kosong berturut-turut sebelumnya. Spes: [0.60, 0.90, 1.0]; dinaikkan karena keinginan/target tahunan/rantai (P1) belum ada -> cakupan 73% < 80% (§7)
    mixEarly: { untilDay: 24, momen: 0.70, dilemaR: 0.30 },
    mix: { dilema: 0.55, cerita: 0.25, momen: 0.20 },  // 'cerita' (rantai, P1) belum ada -> jatuh ke momen kecil
    maxDilemmaPerDay: 1, maxModalPerDay: 2, minGapDays: 0.25,
    defaultRepeatDays: 28, sameCategoryGapDays: 3, nightBlock: true,
    weight: { stateBoost: 2.0, traitBoost: 1.3, novelty: 1.5 },
    meaningful: ['event', 'dilema', 'momen', 'cerita', 'keinginan_tombol', 'keinginan_selesai', 'tunda', 'monumen', 'agustusan', 'hari_jadi', 'target_tahunan', 'naik_hubungan', 'lahir', 'wafat', 'bangunan_selesai', 'riset_selesai'],
    pendingExpireDays: 28,                            // akibat tertunda dengan syarat menunggu maks 28 hari
  },
  // ---- Momen kecil (§3.4): tanpa biaya sumber daya, hanya mood/hubungan; opsi pertama netral ----
  // efek momen: suasana_hati (semua), mood_sifat{}, mood_anak, mood_A/mood_B, rel_semua, rel_AB, rel_A_semua, energi_A, makanan (hanya mulai foodFromDay), sakit_anak (peluang), buff
  MOMEN_KECIL: {
    repeatDays: 21, fallbackRepeatDays: 10, maxMood: 4, foodFromDay: 25, foodMax: 1,
    list: {
      nama_api:        { syarat: { bangunan: 'apiunggun' }, sekali: true, p: [{ suasana_hati: 1 }, { mood_sifat: { religius: 2 } }, {}] },
      lagu_malam:      { syarat: { bangunan: 'apiunggun' }, p: [{ suasana_hati: 1 }, { mood_anak: 3, mood_sifat: { suka_menolong: 3 } }, { mood_sifat: { seniman: 3 } }] },
      gubuk_pertama:   { syarat: { rumahBaruHari: 3 }, p: [{ energi_lelah: 10 }, { mood_tertua: 3 }, { rel_semua: 1 }] },
      ayam_jago:       { p: [{}, { mood_sifat: { pemarah: 2, sabar: -1 } }, { buff: { k: 'kerja', mult: 1.02, hari: 3 } }] },
      jenang_suro:     { p: [{}, { rel_semua: 2, makanan: -1 }] },
      cerita_hantu:    { p: [{}, { mood_sifat: { jahil: 3, periang: 2, penakut: -3 } }, { mood_anak: 2 }] },
      burung_perkutut: { p: [{}, { mood_sifat: { sabar: 3 } }, { mood_sifat: { religius: 2 } }] },
      hujan_main:      { syarat: { hujan: true, anak: 1 }, p: [{}, { mood_anak: 4, mood_sifat: { suka_menolong: 2 }, sakit_anak: 0.03 }] },
      gosip_pagi:      { aktor: 2, aktorSifatA: 'jahil', p: [{}, { mood_sifat: { jahil: -3 }, rel_AB: 2 }, { mood_A: 2, rel_AB: -3 }] },
      teh_tubruk:      { aktor: 1, p: [{}, { rel_A_semua: 2 }] },
      mimpi_panen:     { aktor: 1, syarat: { bangunan: 'ladang' }, p: [{}, { mood_sifat: { ahli_tani: 3 } }] },
      kentongan_iseng: { syarat: { anak: 1 }, p: [{}, { kentongan: 1 }] },
    },
  },
  // ---- 12 dilema P0 (§3.2/§3.3): R = ringan (boleh sebelum hari 25), B = berat (mulai hari 25) ----
  // p = pilihan; tunda: { hari:[min,maks], peluang, syarat?, efek, teks (= kunci TEKS dilema[].pilihan[].tertunda[].kunci) }; reaksi: { sifat: mood }
  // aktor: 'sakit' | 'acak' | n; biayaAlt: biaya pengganti bila biaya utama tidak cukup; stateMult: kondisi relevan x2
  DILEMMAS: {
    rombongan_pendatang: { kelas: 'R', era: 'dusun', minDay: 8, syarat: { popMin: 3 }, kangenMultBilaSifat: { ramah: 0.5 }, bobot: 0.9, musimMult: { kemarau: 0.6 }, ulangHari: 28,
      p: [
        { efek: { makanan: -2, suasana_hati: 2 }, reaksi: { dermawan: 2 }, tunda: [{ hari: [10, 20], peluang: 0.5, efek: { kopi: 3, alat: 1 }, teks: 'kiriman_terima_kasih' }] },
        { efek: { makanan: -4, penduduk: 2, pendatang_sifat: 'acak' }, butuhRumah: 2, reaksi: { dermawan: 3, ramah: 3, pelit: -2 },
          tunda: [{ hari: [7, 14], peluang: 0.25, syarat: { moodPendatangBawah: 60 }, efek: { pamit_pendatang: 1 }, teks: 'kangen_kampung' }] },
        { efek: {}, reaksi: { dermawan: -4, religius: -3 }, tunda: [{ hari: [5, 10], peluang: 0.2, syarat: { adaSifat: 'jahil' }, efek: { rel_acak: -3 }, teks: 'gosip_penolakan' }] } ] },
    pencuri_singkong: { kelas: 'R', era: 'dusun', minDay: 10, musim: ['mareng', 'kemarau'], syarat: { makananMin: 20 }, bobot: 0.8, ulangHari: 42,
      p: [
        { efek: { makanan: -2 }, reaksi: { dermawan: 3, religius: 3, sabar: 2, pemarah: -2 },
          tunda: [{ hari: [7, 14], peluang: 0.4, efek: { kayu: 10, batu: 5 }, teks: 'pemuda_balas_budi' }, { hari: [10, 20], peluang: 0.15, efek: { makanan: -4 }, teks: 'mencuri_lagi' }] },
        { efek: { kayu: 12, batu: 6 }, reaksi: { pemarah: 3, jujur: 2, dermawan: -2 },
          tunda: [{ hari: [3, 8], peluang: 0.3, efek: { harga_beli_pangan: 10 }, teks: 'tetangga_tersinggung' }] },
        { efek: { suasana_hati: -2 }, reaksi: { penakut: 2, jujur: 3 }, tunda: [{ hari: [3, 3], peluang: 1.0, efek: { makanan: 2 }, teks: 'ganti_rugi_polisi' }] } ] },
    obat_sakit: { kelas: 'R', minDay: 5, syarat: { salahSatu: [{ sakitParah: 1 }, { sakit: 2 }] }, aktor: 'sakit', bobot: 1.2, ulangHari: 14,
      p: [
        { efek: { makanan: -2, sembuh_mult: 1.2 }, reaksi: { religius: 1 } },
        { efek: { alat: -1, sembuh_mult: 2, mati_parah_mult: 0.3 }, biayaAlt: { kopi: -3 }, reaksi: { cerdas: 3 } },
        { efek: { makanan: -1, mood_aktor: 6 }, reaksi: { religius: -2 }, tunda: [{ hari: [1, 1], peluang: 0.5, efek: { sembuh_mult: 1.8 }, teks: 'suwuk_manjur' }] } ] },
    kerbau_tetangga: { kelas: 'R', era: 'dusun', minDay: 8, musim: ['hujan', 'labuh'], syarat: { ladangTumbuh: 2 }, bobot: 0.8, ulangHari: 42,
      p: [
        { efek: { pertumbuhan_ladang: -0.5, rel_tetangga: 1 }, reaksi: { dermawan: 2, pemarah: -2 }, tunda: [{ hari: [7, 14], peluang: 0.4, efek: { makanan: 3 }, teks: 'bibit_kiriman' }] },
        { efek: { pertumbuhan_ladang: -0.5, makanan: 3 }, reaksi: { pemarah: 2, pelit: 2 }, tunda: [{ hari: [3, 8], peluang: 0.3, efek: { harga_beli_pangan: 10 }, teks: 'tetangga_marah' }] },
        { efek: { pertumbuhan_ladang: -0.5, tanam_mult: { kali: 0.7, hari: 3 } }, reaksi: { ahli_tani: 3 },
          tunda: [{ hari: [3, 3], peluang: 0.5, efek: { suasana_hati: -3, rel_tetangga: -1 }, teks: 'pemilik_kerbau_datang' }] } ] },
    monyet_kebun: { kelas: 'R', syarat: { curianMonyet7: 2 }, bobot: 1.2, ulangHari: 21,
      p: [
        { efek: { bambu: -2, sabut: -1, bangun_gratis: 'orang_orangan' }, biayaAlt: { kayu: -3 } },
        { efek: { biaya_berkala: { makanan: 2, tiapHari: 3, kali: 3 }, ancaman_mult: { monyet: 0.3, hari: 14 } }, reaksi: { religius: 2, suka_menolong: 2 } },
        { efek: { ancaman_mult: { monyet: 0, hari: 14 }, teladan_poin: -0.5 }, reaksi: { suka_menolong: -3, jahil: 1 },
          tunda: [{ hari: [2, 6], peluang: 0.3, efek: { suasana_hati: -4, mood_sifat: { suka_menolong: -5 } }, teks: 'monyet_terluka' }] } ] },
    ronda_wajib: { kelas: 'R', era: 'dusun', syarat: { seranganHari: 3, popMin: 5 }, // popMin 5: tambahan (desa 3-4 orang tak sanggup ronda 2 orang x 7 malam)
                 bobot: 1.5, ulangHari: 21,
      p: [
        { efek: { ronda: { orang: 2, malam: 7, energiPagi: -20 }, ancaman_mult: { semua: 0.6, hari: 7 } }, reaksi: { pemberani: 3, penakut: -2, malas: -2 } },
        { efek: { minyak: -3, ancaman_mult: { semua: 0.8, hari: 7 } }, biayaAlt: { kayu: -9 }, reaksi: { penakut: 2 } },
        { efek: {}, reaksi: { penakut: -4, pemberani: -2 }, tunda: [{ hari: [1, 4], peluang: 0.3, efek: { pertumbuhan_ladang: -0.5 }, teks: 'ladang_diacak' }] } ] }, // tunda opsi 3 dari TEKS (usulan_dokumen)
    tikus_lumbung: { kelas: 'R', musim: ['hujan', 'labuh'], syarat: { gandumMin: 20 }, bobot: 1.0, efekPemicu: { gandum: -3 }, ulangHari: 28,
      p: [
        { efek: { makanan: -2, tikus_mult: 0.4, hewan_peliharaan: 'kucing' }, reaksi: { suka_menolong: 3 } },
        { efek: { tikus_mult: { kali: 0.2, hari: 14 } }, tunda: [{ hari: [2, 6], peluang: 0.25, efek: { sakit_acak: { n: 1, jenis: 'ringan' }, ternak: -1 }, teks: 'keracunan' }] },
        { efek: { hari_kerja_hilang: 0.5, rel_semua: 3, tikus_mult: { kali: 0.5, hari: 21 } }, reaksi: { rajin: 2, periang: 2 } } ] },
    minta_hujan: { kelas: 'R', musim: ['kemarau'], syarat: { hariMusimMin: 5, kekeringan: true }, bobot: 1.4, ulangHari: 28,
      p: [
        { efek: { suasana_hati: 5, rel_semua: 2, hari_kerja_hilang: 0.1 }, reaksi: { religius: 6 }, tunda: [{ hari: [1, 3], peluang: 0.35, efek: { air: 10, kekeringan_selesai: 1 }, teks: 'gerimis_doa' }] },
        { efek: { kayu: -10, batu: -15, sumur_kemarau_add: 1, energi: -10 }, reaksi: { rajin: 3, suka_menolong: 2 } },
        { efek: { makanan: -4, air: 25 }, reaksi: { pelit: -2 } } ] },
    buka_hutan: { kelas: 'B', era: 'dusun', minDay: 25, musim: ['labuh', 'mareng', 'hujan'], syarat: { ladangMin: 2 }, bobot: 1.0, ulangHari: 56,
      p: [
        { efek: {}, reaksi: { ahli_tani: -3, religius: 2 }, tunda: [{ hari: [6, 10], peluang: 0.3, efek: { makanan: 3 }, teks: 'hutan_berbuah' }] },
        { efek: { kayu: 20, ladang_gratis: 1, tebang_pohon: 4 }, reaksi: { ahli_tani: 4, religius: -2 },
          tunda: [{ hari: [5, 12], peluang: 0.25, syarat: { musim: 'hujan' }, efek: { banjir: 1 }, teks: 'banjir_hulu' }] },
        { efek: { kayu: 45, ladang_gratis: 3, tebang_pohon: 9, ancaman_mult: { babi: 1.3, hari: 14 } }, reaksi: { ahli_tani: 6, religius: -4, penakut: -3 },
          tunda: [{ hari: [6, 14], peluang: 0.45, syarat: { musim: 'hujan' }, efek: { longsor: 1, kesehatan_bangunan_dekat: -25, pertumbuhan_ladang: -1 }, teks: 'longsor_lereng' }] } ] },
    tengkulak_padi: { kelas: 'B', minDay: 25, musim: ['mareng'], syarat: { gandumMin: 25 }, bobot: 1.1, ulangHari: 28,
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
    tanggap_reog: { kelas: 'B', minDay: 30, musim: ['mareng', 'labuh', 'hujan'], bobot: 0.9, ulangHari: 42,
      p: [
        { efek: { suasana_hati: 2 } },
        { efek: { makanan: -8, kopi: -2, suasana_hati: 12, rel_semua: 3, pentas_reog: 1 }, biayaAlt: { kayu: -15 }, reaksi: { seniman: 10, periang: 3, pelit: -2 } },
        { efek: { makanan: -12, suasana_hati: 10, pentas_reog: 1, diskon_monumen: { pendopo_reog: 0.3 }, beri_sifat_acak: 'seniman' }, reaksi: { seniman: 8 },
          tunda: [{ hari: [5, 10], peluang: 0.5, efek: { suasana_hati: 2 }, teks: 'anak_belajar_menari' }] } ] }, // tunda opsi 3 dari TEKS (usulan_dokumen)
  },
  // ---- Agustusan (§2.3): hari ke-21 tiap tahun; P0 = 4 lomba + umbul-umbul ----
  AGUSTUSAN: {
    enabled: true,
    dayOfYear: 21, prepDayOfYear: 18, prepFrac: 0.3, tirakatanDayOfYear: 20, tirakatanFrac: 0.79, upacaraFrac: 0.29, lombaFrac: [0.375, 0.625], panggungFrac: 0.79,
    year1LombaFrac: [0.375, 0.625],                   // pengaman d24 (§5.1): bila median < 27 -> [0.54, 0.625] (13:00-15:00)
    year1Free: true, year1Slots: 2, slots: 3, maxSlots: 5,
    umbul: { cost: { bambu: 2 }, max: 6, moodPerDay: 0.5, days: [18, 28] },
    tirakatan: { mood: 3, rel: 2, tumpeng: { cost: { makanan: 4, gandum: 2 }, mood: 3, fromYear: 2 } },
    score: { base: 0.5, skillMult: 0.5, rand: 0.5 },
    lomba: {
      balap_karung:  { era: 'perkemahan', cost: { sabut: 2 }, peserta: [3, 6], sifat: { rajin: 0.1, pemberani: 0.1 }, rivalTumble: { chance: 0.3, rel: 15 }, menang: 10, ikut: 3, semua: 2 },
      makan_kerupuk: { era: 'perkemahan', cost: { makanan: 2, minyak: 1 }, peserta: [3, 6], sifat: { periang: 0.2, jahil: 0.1, pelit: -0.1 }, menang: 8, semua: 4 },
      tarik_tambang: { era: 'dusun', costOnce: { sabut: 6 }, tim: 2, sifat: { rajin: 0.2, suka_menolong: 0.2 }, skill: 'membangun', rivalOpp: { shake: 0.5, relShake: 5, relSour: -3 }, menangRel: 8, menang: 6, kalah: 2, semua: 2 },
      panjat_pinang: { era: 'dusun', cost: { kayu: 8, minyak: 2 }, hadiahGantung: { alat: 1, kopi: 2, kulit: 1 }, tim: 3, timBesarPop: 10, coba: 3,
                       sukses: { base: 0.35, perSifat: 0.1, sifat: ['pemberani', 'rajin'], perSkill: 0.05 }, menang: 10, rel: 6, semua: 6, gagal: 3, cobaGagal: 1 },
    },
    order: ['balap_karung', 'makan_kerupuk', 'tarik_tambang', 'panjat_pinang'],
    juaraUmumIconDays: 14,
    // TAMBAHAN arahan Ketua 17-10 (penyerap surplus pangan, tidak di spes): pesta rakyat sesudah lomba tahun 2+, skala dengan stok
    pesta: { fromYear: 2, perPop: 1.5, surplusDays: 20, surplusFrac: 0.12, mood: 2 },
  },
  // ---- Penyerap pangan cerita (arahan Ketua 17-10: cerita P0 tidak boleh menambah pangan bersih; surplus diserap lewat syukuran, bukan pembusukan) ----
  STORY_SINK: {
    resAlias: { bambu: 'kayu', sabut: 'kulit', minyak: 'makanan', kelapa: 'makanan', kopi: 'makanan' }, // biaya dalam sumber daya yang belum ada di game -> pengganti
    // hadiah dalam sumber daya yang belum ada (kopi, bambu, ...) dibuang, bukan diganti pangan
    syukuranPanen: { foodDaysMin: 10, perPop: 1, surplusDays: 20, surplusFrac: 0.15 },   // awal mareng (tasyakuran panen), menggantikan "syukur" lama
    kenduri: { fromDay: 29, everyDays: 2, surplusDays: 8, surplusFrac: 0.35, mood: 0.5, rel: 0.5 }, // kenduri/selamatan tiap 2 hari bila stok > 8 hari: 35% kelebihan dibagi ke warga & tetangga (skala stok)
    syukuranLahir: { perPop: 0.5, surplusDays: 20, surplusFrac: 0.04 },
    monumenFoodPerWorkerDay: 0,                        // kait untuk MONUMENTS (P1): pangan pekerja monumen per hari
    tikus: { fromDay: 1, gandumMin: 20, fracPerDay: 0.01 },  // tikus lumbung: ~1%/hari dari gandum (D21 tikus_mult mengecilkan), penyerap baru, bukan pembusukan
    feastCostSifat: 'pandai_masak',                    // pandai_masak: biaya pesta x0.9 (feastCostMult)
  },
  // ---- monyet pencuri siang (dipakai D15 monyet_kebun; RISET-INDONESIA, peringatan_dini.ancaman_monyet) ----
  MONKEY: { enabled: true, fromDay: 10, era: 'dusun', musim: ['mareng', 'kemarau'], chancePerDay: 0.12, steal: [2, 4], minFood: 8 },
});
