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
  MOOD_CAMPFIRE_BONUS: 0.15, MOOD_DECAY: 0.05, MOOD_HUNGRY_PENALTY: 0.2,
  // era: id era minimum untuk membuka bangunan (lihat ERAS). storage: bisa jadi tempat setor.
  BUILDINGS: {
    apiunggun: { nama: 'Api Unggun', w: 1, h: 1, cost: { kayu: 5, batu: 3 }, work: 6, era: 'perkemahan', light: 'besar' },
    gubuk:     { nama: 'Gubuk',  w: 2, h: 2, cost: { kayu: 20, batu: 5 },  work: 20, kapasitas: 2, era: 'perkemahan', light: 'kecil' },
    gudang:    { nama: 'Gudang', w: 3, h: 2, cost: { kayu: 20 },           work: 15, storage: true, era: 'perkemahan' },
    ladang:    { nama: 'Ladang', w: 1, h: 1, cost: { kayu: 10 },           work: 40, era: 'perkemahan' },
    sumur:     { nama: 'Sumur',  w: 1, h: 1, cost: { kayu: 15, batu: 15 }, work: 70, era: 'perkemahan' },
    dapur:     { nama: 'Dapur',  w: 2, h: 2, cost: { kayu: 30, batu: 20 }, work: 60, era: 'dusun', light: 'kecil' },
    bengkel:   { nama: 'Bengkel Alat', w: 3, h: 2, cost: { kayu: 40, batu: 30 }, work: 80, era: 'dusun', light: 'kecil' },
    lumbung:   { nama: 'Lumbung', w: 2, h: 3, cost: { kayu: 50, batu: 20, papan: 10 }, work: 90, storage: true, era: 'desa_pertanian', light: 'kecil' },
    pasar:     { nama: 'Pasar',  w: 3, h: 2, cost: { kayu: 60, batu: 30, papan: 20 }, work: 100, era: 'desa_pertanian', light: 'kecil' },
    balai:     { nama: 'Balai Desa', w: 4, h: 3, cost: { kayu: 80, batu: 60, papan: 30, batu_bata: 30 }, work: 150, era: 'kota_kecil', light: 'besar' },
  },
  // Era: syarat naik (semua harus terpenuhi). foodDays = stok (makanan+gandum) / konsumsi harian.
  ERAS: [
    { id: 'perkemahan', nama: 'Perkemahan' },
    { id: 'dusun', nama: 'Dusun', req: { pop: 3, bangunan: { gubuk: 2, gudang: 1 }, foodDays: 8 } },
    { id: 'desa_pertanian', nama: 'Desa Pertanian', req: { pop: 6, bangunan: { ladang: 3, sumur: 1, dapur: 1 }, foodDays: 10 } },
    { id: 'kota_kecil', nama: 'Kota Kecil', req: { pop: 10, bangunan: { lumbung: 1, bengkel: 1, pasar: 1 }, foodDays: 12, res: { alat: 5 } } },
  ],
  // Musim
  SEASON_DAYS: 7, SEASONS: ['semi', 'panas', 'gugur', 'dingin'], SEASON_NAMES: { semi: 'Semi', panas: 'Panas', gugur: 'Gugur', dingin: 'Dingin' },
  WINTER_HUNGER_MULT: 1.5, WINTER_MOOD_DECAY_MULT_NO_HIDE: 2, WINTER_BUFFER_DAYS: 8,
  // Ladang: tanam -> tumbuh (hari, berhenti saat musim dingin) -> panen
  FIELD: { growDays: 7.5, plantTime: 10, harvestTime: 14, yieldMin: 8, yieldMax: 10,
           crops: { gandum: { res: 'gandum' }, wortel: { res: 'makanan' } } },
  // Air: konsumsi harian; ambil dari sumur (cepat) atau sungai (lambat)
  WATER: { perDayPerPop: 1, wellTime: 5, wellYield: 4, riverTime: 12, riverYield: 3, shortageMood: 8, shortageHealth: 8, wellMoodPerDay: 2 },
  HEALTH: { regenPerDay: 4, starvePerDay: 20, lowMoodBelow: 40 },
  TOOLS: { bonus: 0.25, wearPerHaul: 0.03 },          // alat >=1 -> kerja +25%
  KITCHEN_EAT_BONUS: 0.25,
  WORKSHOP_DAILY: { in: { kayu: 6, batu: 4 }, out: { alat: 1, papan: 2, batu_bata: 2 } },
  MARKET_DAILY: { minKayu: 60, in: { kayu: 10 }, out: { makanan: 3 } },
  GRANARY_WINTER_HUNGER_MULT: 1.25, TOWN_HALL_SPAWN_COOLDOWN_CUT: 2,
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
  MAX_LOG: 40, MAX_NOTES: 6,
  FOOD_SURPLUS_FACTOR: 1.2, FOOD_SURPLUS_PENALTY: 25, // jika stok makanan melimpah, kerja makanan turun prioritas
  DEFAULT_PRIO: { bangun: 3, makanan: 3, bertani: 2, air: 2, kayu: 2, batu: 2 }, // 0=mati .. 3=tinggi
  EVENT_MIN_DAY: 3, EVENT_CHANCE_PER_DAY: 0.18, FLAVOR_LOG_PER_DAY: 1,
  START_BUILDINGS: [], // contoh: [['gudang', 16, 10]]  (quest awal meminta pemain membangun Api Unggun/Gudang sendiri)
};
