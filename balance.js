// Semua konstanta balancing (sesuai RISET-MEKANIK.md, V1). Satuan waktu: detik game pada 1x.
window.CONFIG = {
  TILE: 32, MAP_W: 60, MAP_H: 40, VIEW_W: 1280, VIEW_H: 800,
  ZOOM_LEVELS: [1, 2, 3], START_ZOOM: 1, CAMP: { x: 22, y: 20 },
  RIVER_X: 34, BRIDGE_ROWS: [20, 33], // baris jembatan yang melintasi sungai
  DAY_LENGTH_SEC: 120, NIGHT_START: 0.75, NIGHT_END: 0.25,
  START_VILLAGERS: 2,
  START_RES: { kayu: 12, batu: 8, makanan: 10, gandum: 0, air: 8, alat: 0, kulit: 0, papan: 0, batu_bata: 0 },
  VILLAGER_SPEED: 2.5,
  CARRY: { kayu: 5, batu: 5, makanan: 1 },        // hasil per angkutan
  GATHER_TIME: { kayu: 25, batu: 16, makanan: 14 }, // tebang 20-30s, buah 8-12s
  NODE_AMOUNT: { kayu: 25, batu: 40, makanan: 6 },
  BUSH_REGROW_SEC: 360,
  HUNGER_PER_DAY: 25, ENERGY_PER_DAY: 20,
  HUNGER_CRIT: 25, ENERGY_CRIT: 20, SLEEP_AT_NIGHT_BELOW: 70,
  EAT_RESTORE_PER_FOOD: 12, // ~2 makanan = 1 porsi (+25)
  SLEEP_REGEN_PER_SEC: 2.5,
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
  FAMINE: { waspada: 8, bahaya: 5, kritis: 3, kolaps: 1, bahayaMoodPerDay: -5, graceDays: 7 }, // graceDays: awal game stok memang kecil -> jenjang maks 'waspada', tanpa penalti mood
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
  // layar sentuh & tata letak responsif
  TOUCH: { tapSlop: 10, pinchStep: 1.35, mobileMaxWidth: 900 },
  MARKET_DAILY: { minKayu: 60, in: { kayu: 10 }, out: { makanan: 2 } },
  GRANARY_WINTER_HUNGER_MULT: 1.6, TOWN_HALL_SPAWN_COOLDOWN_CUT: 2,
  BUILDING_DAMAGE: { repairBelow: 80, noCapacityBelow: 40, repairPerSec: 2 },
  // Penduduk baru: SEMUA syarat harus terpenuhi
  SPAWN: { foodDaysPerPop: 10, foodPerDayPerPop: 2, minMood: 65, moodDays: 3, cooldownDays: 8 },
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
  FOOD_SURPLUS_FACTOR: 1.0, FOOD_SURPLUS_PENALTY: 40, // jika stok makanan melimpah, kerja makanan turun prioritas
  DEFAULT_PRIO: { bangun: 3, makanan: 2, bertani: 2, air: 2, kayu: 2, batu: 2, riset: 1, jaga: 3, padam: 3, rawat: 3, makam: 3 }, // jaga/padam/rawat/makam = darurat (di atas kerja biasa, di bawah makan/tidur kritis) // 0=mati .. 3=tinggi
  EVENT_MIN_DAY: 3, EVENT_CHANCE_PER_DAY: 0.18, EVENT_CHANCE_PER_DAY_DUSUN: 0.25, FLAVOR_LOG_PER_DAY: 1, // _DUSUN: peluang event mulai era Dusun (docs/ANALISA-PLAYTEST.md)
  START_BUILDINGS: [], // contoh: [['gudang', 16, 10]]  (quest awal meminta pemain membangun Api Unggun/Gudang sendiri)
};
