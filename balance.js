// Semua konstanta balancing (sesuai RISET-MEKANIK.md, V1). Satuan waktu: detik game pada 1x.
window.CONFIG = {
  TILE: 32, MAP_W: 60, MAP_H: 40, VIEW_W: 1280, VIEW_H: 800, VIEW_MIN_W: 560, VIEW_MIN_H: 360, TOPBAR_COMPACT_W: 1600, TOPBAR_MAX_H: 80, SIDE_MIN_W: 280, SIDE_MAX_W: 320, // kanvas menyusut di layar sedang agar panel samping >= SIDE_MIN_W
  ZOOM_LEVELS: [1, 2, 3], START_ZOOM: 1, CAMP: { x: 22, y: 20 },
  RIVER_X: 34, BRIDGE_ROWS: [20, 33], // baris jembatan yang melintasi sungai
  DAY_LENGTH_SEC: 120, NIGHT_START: 0.75, NIGHT_END: 0.25,
  START_VILLAGERS: 2,
  START_RES: { kayu: 12, batu: 8, makanan: 20, gandum: 0, air: 8, alat: 0, kulit: 0, papan: 0, batu_bata: 0 },
  VILLAGER_SPEED: 2.5,
  CARRY: { kayu: 5, batu: 5, makanan: 1 },        // hasil per angkutan
  GATHER_TIME: { kayu: 25, batu: 16, makanan: 14 }, // tebang 20-30s, buah 8-12s
  NODE_AMOUNT: { kayu: 25, batu: 40, makanan: 6 },
  BUSH_REGROW_SEC: 360,
  HUNGER_PER_DAY: 25, ENERGY_PER_DAY: 20,
  HUNGER_CRIT: 25, MEAL_AT: 60, ENERGY_CRIT: 20, // MEAL_AT (v9b 50 -> v9c 60): makan biasa saat lapar <= 60 (porsi ~3-4, tiap ~1.6 hari) bila stok >= 1 hari; di bawah HUNGER_CRIT tetap makan apa pun stoknya SLEEP_AT_NIGHT_BELOW: 70,
  EAT_RESTORE_PER_FOOD: 12, // ~2 makanan = 1 porsi (+25)
  SLEEP_REGEN_PER_SEC: 2.5,
  // v9b batas nyaman: api/rumah menaikkan mood hanya sampai base + rumah + pangan>=foodDays hari + dapur + sumur (+ monumen); di atasnya turun aboveDecay/detik
  MOOD_COMFORT: { base: 63, home: 6, partner: 2, food: 4, foodDays: 12, kitchen: 2, well: 2, max: 92, aboveDecay: 0.07 },
  MOOD_CAMPFIRE_BONUS: 0.15, MOOD_DECAY: 0.05, MOOD_HOME_BONUS: 0.08, MOOD_HUNGRY_PENALTY: 0.2, // MOOD_HOME_BONUS: tidur di gubuk -> mood naik pelan
  // era: id era minimum untuk membuka bangunan (lihat ERAS). storage: bisa jadi tempat setor.
  BUILDINGS: {
    apiunggun: { nama: 'Api Unggun', w: 1, h: 1, cost: { kayu: 5, batu: 3 }, work: 6, era: 'perkemahan', light: 'besar' },
    gubuk:     { nama: 'Gubuk',  w: 2, h: 2, cost: { kayu: 15, batu: 5 },  work: 20, kapasitas: 2, era: 'perkemahan', light: 'kecil' },
    gudang:    { nama: 'Gudang', w: 3, h: 2, cost: { kayu: 20 },           work: 15, storage: true, era: 'perkemahan' },
    ladang:    { nama: 'Ladang', w: 1, h: 1, cost: { kayu: 10 },           work: 40, era: 'perkemahan' },
    sumur:     { nama: 'Sumur',  w: 1, h: 1, cost: { kayu: 15, batu: 15 }, work: 70, era: 'perkemahan' },
    dapur:     { nama: 'Dapur',  w: 2, h: 2, cost: { kayu: 30, batu: 20 }, work: 60, era: 'dusun', light: 'kecil' },
    bengkel:   { nama: 'Bengkel Alat', w: 3, h: 2, cost: { kayu: 40, batu: 30 }, work: 80, era: 'dusun', light: 'kecil' },
    lumbung:   { nama: 'Lumbung', w: 2, h: 3, cost: { kayu: 50, batu: 20, papan: 10 }, work: 90, storage: true, era: 'desa_pertanian', light: 'kecil' },
    pasar:     { nama: 'Pasar',  w: 3, h: 2, cost: { kayu: 60, batu: 30, papan: 20 }, work: 100, era: 'desa_pertanian', light: 'kecil' },
    balai:     { nama: 'Balai Desa', w: 4, h: 3, cost: { kayu: 80, batu: 60, papan: 30, batu_bata: 30 }, work: 150, era: 'kota_kecil', light: 'besar' },
    // pertahanan & duka (docs/RISET-MUSIM-ANCAMAN.md §3)
    pagar:     { nama: 'Pagar', w: 1, h: 1, cost: { kayu: 4 }, work: 8, era: 'dusun' },
    obor:      { nama: 'Obor', w: 1, h: 1, cost: { kayu: 3, batu: 1 }, work: 5, era: 'perkemahan', light: 'kecil' },
    menara_jaga: { nama: 'Menara Jaga', w: 2, h: 1, cost: { kayu: 30, batu: 20, papan: 10 }, work: 70, era: 'desa_pertanian', light: 'kecil' },
    makam:     { nama: 'Makam', w: 1, h: 1, cost: { kayu: 5 }, work: 15, era: 'perkemahan' },
    // rumah keluarga (docs/RISET-SIKLUS-HIDUP.md): kapasitas 4, untuk pasangan + anak
    rumah:     { nama: 'Rumah Kayu', w: 3, h: 3, cost: { kayu: 40, batu: 15, papan: 8 }, work: 60, kapasitas: 4, era: 'dusun', light: 'kecil' },
    // v9 pangan: kolam ikan & tambak dekat desa = tempat memancing sendiri dengan stok ikan harian (fishStock) terpisah dari sungai (aset tahap 9)
    kolam:     { nama: 'Kolam Ikan', w: 2, h: 2, cost: { kayu: 20, batu: 15 }, work: 45, era: 'dusun', fishStock: 10 },
    kandang_ayam: { nama: 'Kandang Ayam', w: 3, h: 2, cost: { kayu: 20, batu: 10 }, work: 45, era: 'dusun', hens: 4 }, // P1: telur (FOOD_SOURCES.telur) + ayam kampung berkeliaran di sekitar kandang; keinginan punya_ayam
    tambak:    { nama: 'Tambak', w: 3, h: 2, cost: { kayu: 40, batu: 25, papan: 6 }, work: 80, era: 'desa_pertanian', fishStock: 18 },
  },
  // Era: syarat naik (semua harus terpenuhi). foodDays = stok (makanan+gandum) / konsumsi harian.
  ERAS: [
    { id: 'perkemahan', nama: 'Perkemahan' },
    { id: 'dusun', nama: 'Dusun', req: { pop: 3, bangunan: { gubuk: 2, gudang: 1 }, foodDays: 8 } },
    { id: 'desa_pertanian', nama: 'Desa Pertanian', req: { pop: 6, bangunan: { ladang: 3, sumur: 1, dapur: 1 }, foodDays: 10 } },
    { id: 'kota_kecil', nama: 'Kota Kecil', req: { pop: 10, bangunan: { lumbung: 1, bengkel: 1, pasar: 1 }, foodDays: 12, res: { alat: 10 } } },
  ],
  // Musim
  SEASON_DAYS: 7, SEASONS: ['semi', 'panas', 'gugur', 'dingin'], SEASON_NAMES: { semi: 'Semi', panas: 'Panas', gugur: 'Gugur', dingin: 'Dingin' },
  WINTER_HUNGER_MULT: 2.0, WINTER_MOOD_DECAY_MULT_NO_HIDE: 1, WINTER_BUFFER_DAYS: 8, // NO_HIDE=1: diganti SEASON_FX.dingin.clothesMoodPerDay (di luar, jauh dari api)
  // Ladang: tanam -> tumbuh (hari, berhenti saat musim dingin) -> panen
  FIELD: { growDays: 7.5, plantTime: 10, harvestTime: 14, yieldMin: 8, yieldMax: 10,
           crops: { gandum: { res: 'gandum' }, wortel: { res: 'makanan' } } },
  // Air: konsumsi harian; ambil dari sumur (cepat) atau sungai (lambat)
  WATER: { perDayPerPop: 1, wellTime: 5, wellYield: 3, riverTime: 12, riverYield: 3, shortageMood: 8, shortageHealth: 8, wellMoodPerDay: 2 },
  // tuning teruji Asisten Analisa (docs/ANALISA-PLAYTEST.md v2.x): starvePerDay 20->30, foodFreeDays 20->16, wolf killChanceIfLowHp 0.10->0.25 & killSafeRadius 8->4, severeDeathPerDay 0.08->0.15
  HEALTH: { regenPerDay: 4, starvePerDay: 30, lowMoodBelow: 40 },
  TOOLS: { bonus: 0.25, wearPerHaul: 0.03 },          // alat >=1 -> kerja +25%
  KITCHEN_EAT_BONUS: 0.25,
  WORKSHOP_DAILY: { in: { kayu: 6, batu: 4 }, out: { alat: 1, papan: 2, batu_bata: 2 } },
  // ---------- musim & ancaman (docs/RISET-MUSIM-ANCAMAN.md) ----------
  SEASON_FX: {
    semi:   { plantTimeMult: 0.85, growDaysAdd: -0.5, rainChance: 0.40, rainMoodPerDay: 3, rainBushRegrowMult: 0.85, floodChance: 0.08, chopTimeMultRain: 1.10 },
    panas:  { waterMult: 1.35, droughtChance: 0.10, droughtDays: 3, droughtGrowDelay: 1, droughtWaterSafeDays: 3, fireNightChance: 0.06, yieldMult: 1.0 },
    gugur:  { panenRayaWeightMult: 1.5, forageMult: 1.0, winterWarnFromDayInSeason: 4, thanksFoodDays: 10, thanksMood: 8 },
    dingin: { hungerMult: 2.0, extremeChance: 0.12, extremeHungerMult: 1.8, extremeMoodDecayMult: 2.5, campfireWoodPerDay: 2, sickChancePerLowMood: 0.08,
              clothesMoodPerDay: { tanpa: -8, dengan: -2 } },
  },
  // pembusukan stok & penguapan air (docs/ANALISA-PLAYTEST.md §3): makanan busuk di atas freeDays stok, lebih cepat di panas, Lumbung mengurangi
  SPOILAGE: { foodFreeDays: 16, foodPerDay: 0.02, summerMult: 1.5, granaryMult: 0.5, waterFreeDays: 12, waterEvapPerDay: 0.10, waterCapDays: 30 },
  YEAR_SCALE: { daysPerYear: 28, threatChanceMult: 1.25, winterBufferDays: 10, extremeChanceAdd: 0.04 }, // berlaku mulai tahun ke-2 (hari 29+)
  // jenjang peringatan kelaparan (hari stok pangan): aman >= 8, waspada 5-8, bahaya 3-5, kritis < 3, kolaps < 1 & stok 0
  FAMINE: { waspada: 8, bahaya: 5, kritis: 3, kolaps: 1, bahayaMoodPerDay: -5, graceDays: 7, graceBahaya: 1 }, // graceBahaya (v9c): masa awal tetap tampil 'bahaya' bila < 1 hari (tanpa penalti mood)
  // v9c (uji perangkat Ichwan 21-10: tanpa input mood 70 -> 0 di hari 7): tanpa api/rumah mood turun ke floor, hujan tanpa atap tidak menekan di bawah rainFloor; api unggun menyala = penalti hujan x rainFireMult
  MOOD_BARE: { floor: 40, rainFloor: 40, rainFireMult: 0.5 },   // v9d: rainFloor 36 -> 40 (uji perangkat @51b6d4d)
  // v11: kategori bilah bangun (label: TEKS bangun_kategori.<id>, cadangan 'nama'). Bangunan yang tak terdaftar masuk kategori terakhir.
  BUILD_CATS: [
    { id: 'tempat_tinggal', nama: 'Tempat Tinggal', items: ['gubuk', 'rumah', 'apiunggun', 'sumur'] },
    { id: 'pangan', nama: 'Pangan', items: ['ladang', 'kolam', 'tambak', 'kandang_ayam', 'dapur', 'lumbung'] },
    { id: 'bahan_produksi', nama: 'Bahan & Produksi', items: ['gudang', 'bengkel', 'pasar'] },
    { id: 'keamanan', nama: 'Keamanan', items: ['obor', 'pagar', 'orang_orangan', 'menara_jaga'] },
    { id: 'lainnya', nama: 'Lainnya', items: ['balai', 'makam', 'masjid', 'bendungan', 'pendopo_reog'] },
  ],
  AUTO_BUILD: { fireDay: 2, hutDay: 4, hutTaskDay: 4, hutMoreDay: 8, hutMax: 2, bedHintDay: 6 }, // v10: gubuk ke-2 hari 8 bila penuh; petunjuk tempat tidur hari 6     // warga menaruh api unggun / gubuk pertama sendiri bila belum ada sama sekali
  FOOD_PRIORITY_DAYS: 4, FOOD_TILT_DAYS: 5, FOOD_DAYS_SMOOTH: 0.35,              // utamakan pangan bila stok < 4 hari; angka hari di lencana dihaluskan ~0.35 hari
  THREAT: {
    wolf: {
      minEra: 'dusun',            // perkemahan: hanya jejak, belum melukai
      baseNightChance: 0.05, winterMult: 1.4,
      warnHoursBefore: 0.15,      // jejak muncul NIGHT_START - 0.15 (sore)
      attackFrac: [0.85, 0.95], count: [1, 2], speed: 3.2, hitRange: 0.7,
      damage: [25, 40], moodHit: 15, traumaChance: 0.3, traumaDays: 3, traumaMoodCap: 70,
      killChanceIfLowHp: 0.25, killHpBelow: 20, killSafeRadius: 4,  // hanya tahun 2+
      fencePathMult: 3, fenceSpeedMult: 0.33,
      torchSafeRadius: 3, torchHitMult: 0.4, torchWoodPerNights: 2,
      towerRadius: 10, towerScarePerNight: 1,
    },
  },
  FIRE: { smokeStartFrac: 0.62, smokeFrac: 0.12, hpLossPerSec: 2, hpLoss: [40, 100], spreadSec: 30, spreadRadius: 2,
          waterPerAction: 5, actionSec: 4, actionsToPut: [2, 3], firebreakKayu: 10, stockLossChance: 0.15, stockLossFrac: 0.10 },
  FLOOD: { cols: 2, speedMult: 0.5, growDelayDays: 1, durationDays: 1 },
  SICKNESS: { lightDays: [2, 4], workMult: 0.7, energyRegenMult: 0.6, baseLowMoodChance: 0.02, lowMoodBelow: 35,
              severeFromHpBelow: 40, severeFromExtremeChance: 0.25, severeDeathPerDay: 0.15, careCost: { makanan: 5 }, careSeconds: 80 },
  LEAVE: { moodBelow: 35, days: 5, starveDays: 2, villageMoodHit: 10, minPop: 2, cooldownDays: 3 }, // tidak pergi bila desa jadi < minPop (hindari soft-lock); maks 1 kepergian per cooldownDays (hindari efek domino)
  DEATH: { griefMoodInstant: -20, griefDays: 5, griefPerDay: -3, graveCost: { kayu: 5 } },
  // tumpukan stok terlihat di peta: tingkat = stok 0 ? 0 : min(4, 1 + floor(3 * stok / kapasitas)); makanan = makanan + gandum
  STOCKPILE: { capacity: { kayu: 150, batu: 80, makanan: 100, air: 60 } },
  // ---------- jadwal harian & siklus hidup (docs/RISET-SIKLUS-HIDUP.md) ----------
  SCHEDULE: {
    wakeFrac: 0.208,          // 05:00
    sleepFrac: 0.875,         // 21:00
    lateToleranceFrac: 0.0625,// +1.5 jam -> 22:30 untuk kerja darurat
    urgentJobs: ['padam', 'rawat', 'jaga'],
    finishBuildBelowPct: 10,
    earlyWakeEnergy: 95,
    napEnergyCrit: true,      // pakai ENERGY_CRIT
    // Kompensasi jam tidur tetap 21:00-05:00: dulu penduduk bangun ~83% hari, kini ~68% (x1.22), ditambah pengaruh jalan pulang/pergi -> kerja & langkah siang
    // dipercepat agar produktivitas harian total mendekati sebelum jadwal (target median pangan hari 24: 25-50)
    dayWorkMult: 1.35, daySpeedMult: 1.35,
  },
  SLEEP_OUTSIDE: {
    bedRegen: 1.0, bedMood: 2,
    fireRegen: 0.75, fireMood: -3, fireRadius: 3,
    bareRegen: 0.6, bareMood: -6,
    winterMood: -12, winterSickAdd: 0.05,
  },
  PAIRING: { minAge: 18, maxAge: 50, minMood: 65, moodDays: 2, chancePerDay: 0.25, /* 0.15 -> 0.25 (sim v3 Asisten Analisa) */ rematchDays: 14, widowGriefMult: 1.5 },
  PREGNANCY: {
    minEra: 'perkemahan', needHome: true, // keputusan desain 17-10: boleh sejak Perkemahan asal pasangan serumah di rumah jadi (dulu 'dusun')
    motherAge: [18, 45], minMood: 70, minFoodDays: 5, famineLevels: ['aman', 'waspada'], // pangan >= 5 hari (dulu 7); target lahir pertama hari 30-45
    minHp: 70, cooldownDays: 35, // 21 -> 35 (17-10): sim 20x140 hari cooldown 21 -> pop d140 19, 28 -> 18, 35 -> 17
    perSeasonCapDiv: 5,
    chancePerDay: 0.15, winterMult: 0.5, // 0.10 -> 0.15 (sim v3 Asisten Analisa, setelah perbaikan NaN semak labuh); lahir pertama median hari 34
    lengthDays: 7, lateWorkMult: 0.85, lateDays: 3,
    birthRiskCritical: 0.10, birthMood: 10, parentMood: 15,
    newcomerCooldownMult: 1.5,
  },
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
  // ---- fondasi tokoh (docs/RISET-CERITA-TUJUAN.md §1.1-1.2, disalin apa adanya agar cerita/tujuan P0 tinggal dipasang) ----
  // Dipakai sekarang: pembagian & pewarisan sifat, skor hubungan (S.rel), tingkat, batas +6/hari, lantai, pelupaan, kerja/makan/api/ronda/tolong,
  // syarat pasangan (>= sahabat), pengali hamil, duka per hubungan, relGainMult. Efek sifat lain (kerja, mood, gosip, konflik) menyusul bersama cerita.
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
  // ---- TOKOH: hubungan (docs/RISET-CERITA-TUJUAN.md §1.2) ----
  RELATION: {
    range: [-100, 100],
    start: { pendiri: 25, pendatang: 0, datangBerdua: 40, orangTuaAnak: 60, saudara: 50 },
    levels: { rival: -30, teman: 20, sahabat: 50 },               // di antara rival dan teman = kenalan
    floors: { pasangan: 40, keluarga: 30 },
    dailyGainCap: 6,
    gain: { kerjaPer30s: 0.5, kerjaMax: 3, kerjaRadius: 4, makan: 1.5, makanMax: 3, makanRadius: 3, apiMalam: 1, apiRadius: 3,
            ronda: 5, kerjaBakti: 3, lombaTim: 5, lombaMenang: 8, hadiah: 8, tolong: 10,
            serumahMalam: 3 } /* 2 -> 3 (sim v3) */, // TAMBAHAN di luar spec: sim menunjukkan kerja bareng jarang (penduduk tersebar) -> tanpa ini skor tak pernah capai 50 & tak ada kelahiran
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
  // tampilan per umur (assets/README.md "Siklus hidup"): kecepatan gerak & ms per frame jalan
  AGE_LOOK: { anak: { speedMult: 0.9, walkMs: 110 }, lansia: { speedMult: 0.7, walkMs: 180, idleMs: 400 } },
  // layar sentuh & tata letak responsif
  TOUCH: { tapSlop: 10, pinchStep: 1.35, mobileMaxWidth: 900 },
  MARKET_DAILY: { minKayu: 60, in: { kayu: 10 }, out: { makanan: 2 } },
  GRANARY_WINTER_HUNGER_MULT: 1.6, TOWN_HALL_SPAWN_COOLDOWN_CUT: 2,
  BUILDING_DAMAGE: { repairBelow: 80, noCapacityBelow: 40, repairPerSec: 2 },
  // Penduduk baru: SEMUA syarat harus terpenuhi. foodDays: stok pangan (hari, = foodDays()) minimal — keputusan Ketua 21-10: 12 hari (dulu pop x 10 x 2 pangan).
  // foodDaysPerPop x foodPerDayPerPop tetap dipakai sebagai batas "pangan cukup" kerja Makanan (FOOD_SURPLUS_FACTOR).
  // chancePerDay: peluang datang per hari bila semua syarat & jeda terpenuhi. happy: desa bahagia (rata-rata mood >= mood selama days hari) -> peluang & jeda membaik + log kabar.
  // cooldownPerPop: jeda bertambah per penduduk (desa besar tidak lagi 'kosong' bagi perantau) -> pop hari 140 tetap <= ~18 walau mood tinggi.
  SPAWN: { foodDaysPerPop: 10, foodPerDayPerPop: 2, foodDays: 12, minMood: 65, moodDays: 3, cooldownDays: 8, cooldownPerPop: 0.6, chancePerDay: 0.4,
           happy: { mood: 81, days: 5, minMood: 50, chancePerDay: 0.75, cooldownMult: 0.85 } }, // v9b: desa bahagia harus diperjuangkan (target aktif ~25-45% hari)
  // ---------- pangan v9 (permintaan Ichwan 21-10): sumber pangan liar, dikerjakan otomatis di prioritas Makanan ----------
  // Semua hasil masuk 'makanan' (panen padi tetap 'gandum'). at: semak | tepi_air (tepi sungai + Kolam Ikan) | pohon (jamur di bawah pohon) | pohon_buah | sawah (keong).
  // time = detik kerja di tempat, yield = [min, maks] per angkutan, season = pengali hasil per musim (id musim tema; < minMult -> tidak dicari),
  // rainMult = pengali saat hari hujan. Penduduk memilih sumber dengan hasil/detik (termasuk jalan) terbaik. label/ikon: teks melayang '+4 Ikan'.
  FOOD_SOURCES: {
    meramu:    { label: 'Buah semak', icon: 'makanan', at: 'semak', time: 14, yield: [2, 3] },                     // dulu +1 per angkutan
    memancing: { label: 'Ikan', icon: 'ikan', at: 'tepi_air', time: 30, yield: [3, 5], rainMult: 1.3, minMult: 0.3,
                 season: { hujan: 1.2, mareng: 1.0, kemarau: 0.7, labuh: 1.1 },
                 riverStockPerDay: 10, maxFishers: 2, pondSeasonMin: 0.9, pondYieldAdd: 1 }, // stok ikan sungai per hari (dibagi semua pemancing); Kolam/Tambak punya stok sendiri (BUILDINGS.*.fishStock) & tidak surut di kemarau
    jamur:     { label: 'Jamur', icon: 'jamur', at: 'pohon', time: 12, yield: [2, 4], rainMult: 1.5, minMult: 0.2,
                 season: { hujan: 1.0, labuh: 0.9, mareng: 0.35, kemarau: 0.05 },
                 patchesPerDay: 6, patchAmount: [3, 5], forestNeighbors: 2 },                                          // rumpun jamur muncul pagi di bawah pohon yang rimbun (>= forestNeighbors pohon di dekatnya), layu malam
    buah:      { label: 'Buah', icon: 'buah', at: 'pohon_buah', time: 16, yield: [3, 5], minMult: 0.3, trees: 9, regrowDays: 4,
                 kinds: { mangga: { season: { labuh: 1.0, kemarau: 0.8, hujan: 0.2, mareng: 0.3 } }, rambutan: { season: { hujan: 1.0, labuh: 0.5, mareng: 0.2, kemarau: 0 } },
                          pisang: { season: { hujan: 0.7, mareng: 0.7, kemarau: 0.6, labuh: 0.7 } }, kelapa: { season: { hujan: 0.6, mareng: 0.6, kemarau: 0.6, labuh: 0.6 } } }, amount: 6 },  // pohon buah di peta (sprite tahap 7), bukan untuk ditebang
    umbi:      { label: 'Umbi hutan', icon: 'umbi', at: 'umbi', time: 20, yield: [3, 5], minMult: 0.3, count: 8, regrowDays: 6,
                 season: { kemarau: 1.0, mareng: 0.9, labuh: 0.8, hujan: 0.6 } },                                           // uwi/gembili di tepi hutan: cadangan klasik kemarau, digali lalu tumbuh lagi
    keong:     { label: 'Keong sawah', icon: 'keong', at: 'sawah', time: 12, yield: [1, 3], minMult: 0.3, crops: ['padi'],
                 season: { hujan: 1.0, labuh: 0.8 }, perFieldPerDay: 3 },                                                // keong di sawah berair (padi tumbuh) saat musim basah
    telur:     { label: 'Telur', icon: 'telur', at: 'kandang', time: 8, yield: [2, 3], minMult: 0.3, perHenPerDay: 0.4, stockMax: 6 },          // P1: Kandang Ayam, tiap induk ±1 telur / 2.5 hari (4 induk = 1.6 pangan/hari/kandang), stok kandang maks 6, diambil di prioritas Makanan
  },
  SKILL_GAIN: 0.02, // skill naik per angkutan; efek: waktu kerja / (1+skill*0.5)
  NAMES: ['Sari','Budi','Dewi','Agus','Rina','Joko','Wati','Eko','Lina','Hadi','Tari','Yudi','Ayu','Bayu'],
  WATER_SURPLUS_DAYS: 8, // stok air >= ini (hari) -> kerja air turun prioritas
  RES_SOFT_CAP: { kayu: 120, batu: 35 }, // per 2 penduduk; di atas ini kerja tsb turun prioritas
  // Aturan event acak: bobot (default 1, bisa juga 'bobot' di TEKS-GAME.json; config menang), musim yang diizinkan,
  // maksPerTahun (direset tiap musim Semi), cooldownHari.
  EVENT_RULES: {
    panen_raya:        { bobot: 0.35, musim: ['panas', 'gugur'], maksPerTahun: 1 },
    pedagang_keliling: { bobot: 0.7, cooldownHari: 8 },
    badai:             { bobot: 1.1 },
    hewan_buas:        { bobot: 1.0 },
    wabah:             { bobot: 1.2 },
    pendatang:         { bobot: 0.8 },
    festival_desa:     { hariJadi: true }, // 'Hari Jadi Desa': hanya tepat di ulang tahun desa (hari 29, 57, ...), sekali per tahun
  },
  // Tutorial interaktif: per langkah (urutan sama dengan TEKS-GAME.json tutorial) elemen yang disorot & aksi pemain
  // yang otomatis melanjutkan. Langkah di JSON boleh punya 'target'/'aksi' sendiri (menimpa ini).
  // Aksi: klik_penduduk, ubah_prioritas, taruh_bangunan, buka_riset, ubah_kecepatan
  TUTORIAL_HOOKS: [
    { target: '#c' },
    { target: '#vil', aksi: 'klik_penduduk' },
    { target: '#prio', aksi: 'ubah_prioritas' },
    { target: '#buildbar', aksi: 'taruh_bangunan' },
    { target: '#log' },
  ],
  FAV_TASK_BONUS: 12,   // bonus utilitas untuk tugas favorit penduduk (tidak menimpa kebutuhan kritis)
  VILLAGER_HISTORY: 10, // panjang riwayat per penduduk
  // Pasar & pedagang keliling (docs/RISET-TAHAP3.md §2). Barter berbasis nilai: jual = qty × hargaJual × mod, beli = qty × hargaBeli × mod.
  MARKET: {
    harga: { makanan: [3, 5], gandum: [2, 4], kayu: [1, 2], batu: [1.2, 2.2], papan: [3, 5], batu_bata: [3, 5], alat: [12, 18], kulit: [4, 7] }, // [jual, beli]
    drift: [0.92, 1.08], clamp: [0.7, 1.4],
    musim: { // pengali per sisi
      dingin: { jual: { makanan: 1.25, gandum: 1.25 }, beli: { makanan: 1.4, gandum: 1.4 } },
      semi:   { jual: { kayu: 0.9 } },
      panas:  { jual: { makanan: 0.85 } },
    },
    eventDays: 5,
    eventMods: { panen_raya: { jual: { makanan: -0.2, gandum: -0.2 } }, badai: { beli: { makanan: 0.3 } }, kekeringan: { beli: { makanan: 0.3 } } },
    merchantBuyDiscount: 0.1,         // diskon beli saat pedagang keliling mampir
    foodSellSoftCapDays: 16, foodSellFloorDays: 24, foodSellMinMult: 0.6, // jual pangan melemah di atas 16 hari stok, min 0.6 pada 24 hari
    quota: { perkemahan: [25, 20], dusun: [25, 20], desa_pertanian: [40, 30], kota_kecil: [70, 50] }, // [jual, beli] nilai per hari
  },
  MERCHANT: { firstDay: 4, everyDays: [9, 12], stayFrac: 0.35, speed: 2.0, spawn: { x: 59, row: 0 } }, // row = indeks BRIDGE_ROWS
  MAX_LOG: 40, MAX_NOTES: 6,
  FOOD_SURPLUS_FACTOR: 0.8, FOOD_SURPLUS_PENALTY: 40, // jika stok makanan melimpah (>= pop x 10 x 2 x faktor), kerja makanan turun prioritas. v9: 1.0 -> 0.8 karena sumber pangan liar jauh lebih produktif (d24 tetap 25-50)
  DEFAULT_PRIO: { bangun: 3, makanan: 2, bertani: 2, air: 2, kayu: 2, batu: 2, riset: 1, jaga: 3, padam: 3, rawat: 3, makam: 3 }, // jaga/padam/rawat/makam = darurat (di atas kerja biasa, di bawah makan/tidur kritis) // 0=mati .. 3=tinggi
  EVENT_MIN_DAY: 3, EVENT_CHANCE_PER_DAY: 0.18, EVENT_CHANCE_PER_DAY_DUSUN: 0.25, FLAVOR_LOG_PER_DAY: 1, // _DUSUN: peluang event mulai era Dusun (docs/ANALISA-PLAYTEST.md)
  START_BUILDINGS: [], // contoh: [['gudang', 16, 10]]  (quest awal meminta pemain membangun Api Unggun/Gudang sendiri)
};
