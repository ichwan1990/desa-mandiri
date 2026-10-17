// Tema / bioma (docs/RISET-INDONESIA.md). Semua yang berbeda antar-tema ada di sini: musim (nama, panjang, efek), tanaman,
// ancaman malam, label sumber daya, event yang tidak cocok, aset varian musim, dan teks bawaan. game.js hanya membaca CONFIG.
// Pilih tema: CONFIG.THEME (bawaan 'indonesia'), atau ?tema=sedang di URL (tema empat musim lama, tetap dipertahankan untuk tes & perbandingan).
// Mekanik musim digerakkan oleh isi SEASON_FX (bukan nama musim): rainChance -> hari hujan, floodChance -> banjir, droughtChance -> kekeringan,
// fireNightChance -> risiko api, hardWarnFromDay/thanksFoodDays -> hitung mundur & syukuran, campfireWoodPerDay -> kayu bakar,
// extremeChance -> hari ekstrem, exposureMood -> mood di luar (pakaian/caping), chillSickChance -> sakit ringan saat mood rendah.
window.THEMES = {
  // ---------- tema lama: empat musim bersalju ----------
  sedang: {
    nama: 'Empat musim',
    SEASONS: ['semi', 'panas', 'gugur', 'dingin'], SEASON_LEN: { semi: 7, panas: 7, gugur: 7, dingin: 7 },
    SEASON_NAMES: { semi: 'Semi', panas: 'Panas', gugur: 'Gugur', dingin: 'Dingin' }, SEASON_ICONS: { semi: '🌱', panas: '☀️', gugur: '🍂', dingin: '❄️' },
    HARD_SEASON: 'dingin', HARD_COLD: true, // HARD_COLD: musim sulit = dingin (salju, api padam terasa, mati 'dingin')
    HARD_HUNGER_MULT: 2.0, GRANARY_HARD_HUNGER_MULT: 1.6, HARD_BUFFER_DAYS: 8,
    SEASON_FX: {
      semi:   { plantTimeMult: 0.85, growDaysAdd: -0.5, rainChance: 0.40, rainMoodPerDay: 3, rainBushRegrowMult: 0.85, floodChance: 0.08, chopTimeMultRain: 1.10, newYear: true },
      panas:  { waterMult: 1.35, droughtChance: 0.10, droughtDays: 3, droughtGrowDelay: 1, droughtWaterSafeDays: 3, fireNightChance: 0.06, yieldMult: 1.0, spoilMult: 1.5 },
      gugur:  { panenRayaWeightMult: 1.5, forageMult: 1.0, hardWarnFromDay: 4, thanksFoodDays: 10, thanksMood: 8 },
      dingin: { hungerMult: 2.0, fieldsStop: true, extremeChance: 0.12, extremeHungerMult: 1.8, extremeMoodDecayMult: 2.5, campfireWoodPerDay: 2, sickChancePerLowMood: 0.08,
                exposureMood: { tanpa: -8, dengan: -2 }, exposureNearFire: true, snow: true, extremeSevereSick: true },
    },
    YEAR_SCALE: { daysPerYear: 28, threatChanceMult: 1.25, hardBufferDays: 10, extremeChanceAdd: 0.04 },
    FIELD_CROPS: { gandum: { res: 'gandum' }, wortel: { res: 'makanan' } }, FIELD_ROTATION: ['gandum', 'wortel'],
    NIGHT_THREAT: 'wolf', ART_SUFFIX: { semi: '_semi', panas: '_panas', gugur: '_gugur', dingin: '_dingin' }, WINTER_ART: 'dingin',
    WEATHER: { panas: 'panas', gugur: 'daun', dingin: 'salju' }, ASSET_SWAP: {}, BUILDING_NAMES: {},
    RES_LABEL: {}, EVENT_DISABLE: [], EVENT_SEASON_ALIAS: {}, EVENT_RULES: {},
    MARKET_MUSIM: { dingin: { jual: { makanan: 1.25, gandum: 1.25 }, beli: { makanan: 1.4, gandum: 1.4 } }, semi: { jual: { kayu: 0.9 } }, panas: { jual: { makanan: 0.85 } } },
    TXT: {}, TEXT_PATCH: {},
  },
  // ---------- Nusantara: hujan, mareng, kemarau, labuh (tanpa salju) ----------
  indonesia: {
    nama: 'Nusantara',
    SEASONS: ['hujan', 'mareng', 'kemarau', 'labuh'], SEASON_LEN: { hujan: 9, mareng: 5, kemarau: 9, labuh: 5 },
    SEASON_NAMES: { hujan: 'Musim Hujan', mareng: 'Pancaroba (Mareng)', kemarau: 'Musim Kemarau', labuh: 'Pancaroba (Labuh)' },
    SEASON_ICONS: { hujan: '🌧️', mareng: '🌾', kemarau: '☀️', labuh: '🌦️' },
    HARD_SEASON: 'kemarau', HARD_COLD: false,
    HARD_HUNGER_MULT: 1.4, GRANARY_HARD_HUNGER_MULT: 1.25, HARD_BUFFER_DAYS: 8,
    SEASON_FX: {
      hujan:   { padiGrowAdd: -1.0, growAddCrops: ['padi'], plantTimeMult: 0.85, rainChance: 0.60, rainNoRoofMood: -2, rainBushRegrowMult: 0.85,
                 floodChance: 0.10, floodMax: 2, landslideChance: 0.04, landslideHp: 30, campfireWoodPerDay: 2,
                 chopTimeMultRain: 1.10, fishMult: 1.3, sleepOutsideMood: -10, sleepOutsideSick: 0.05, spoilMult: 1.5, newYear: true },
      mareng:  { panenRayaWeightMult: 1.5, windChance: 0.10, windHp: 15, windWorkMult: 0.8, hardWarnFromDay: 2,
                 thanksFoodDays: 10, thanksMood: 8, chillSickChance: 0.02, chillMoodBelow: 50 },
      kemarau: { padiStops: true, padiIrrigatedGrowMult: 1.5, dryCropGrowMult: 1.25, hungerMult: 1.4, waterMult: 1.5,
                 wellYieldAdd: -1, riverYieldMult: 0.6, fishMult: 0.5, droughtChance: 0.12, droughtDays: 3, droughtGrowDelay: 1, droughtWaterSafeDays: 3,
                 fireNightChance: 0.06, fireDayChance: 0.04, exposureMood: { tanpa: -4, dengan: -1 }, exposureDayOnly: true,
                 failHarvestChance: 0.20, failHarvestMult: 0.5 },
      labuh:   { rainChance: 0.30, wellRecover: 1, firstRainMood: 5, plantTimeMult: 0.9, windChance: 0.08, windHp: 20,
                 pestChance: 0.10, pestYieldMult: 0.5, chillSickChance: 0.02, chillMoodBelow: 50 },
    },
    YEAR_SCALE: { daysPerYear: 28, threatChanceMult: 1.25, hardBufferDays: 10, longDryChance: 0.10, longDryExtraDays: 3 },
    // tegalan (ladang): padi bergantian dengan jagung/ubi/singkong; hasil rata-rata per hari ~1.1-1.3 seperti gandum lama (§2)
    FIELD_CROPS: {
      padi:     { res: 'gandum', growDays: 7.5, yield: [8, 10], hardStops: true, irrigatedInHard: true },
      jagung:   { res: 'makanan', growDays: 6, yield: [6, 8], hardGrowMult: 1.25 },
      singkong: { res: 'makanan', growDays: 10, yield: [12, 14], hardGrowMult: 1.25 },
      ubi:      { res: 'makanan', growDays: 5, yield: [5, 6] },
    },
    FIELD_ROTATION: ['padi', 'jagung', 'padi', 'ubi', 'padi', 'singkong'],
    NIGHT_THREAT: 'babi', ART_SUFFIX: { hujan: '_hujan', mareng: '_mareng', kemarau: '_kemarau', labuh: '_labuh' }, WINTER_ART: null,
    WEATHER: { hujan: 'hujan_lebat', kemarau: 'debu', labuh: 'awan' }, // hujan lebat (+kilat) saat hari hujan; debu & tint kemarau; bayang awan pancaroba
    // sprite tropis (tahap 7) menggantikan sprite lama untuk id bangunan yang sama
    ASSET_SWAP: { gubuk: 'gubuk_bambu', lumbung: 'lumbung_padi', menara_jaga: 'pos_ronda', pagar: 'pagar_bambu', obor: 'obor_bambu' },
    BUILDING_NAMES: { gubuk: 'Gubuk Bambu', lumbung: 'Lumbung Padi', menara_jaga: 'Pos Ronda', pagar: 'Pagar Bambu', obor: 'Oncor', ladang: 'Ladang (Tegalan)' },
    RES_LABEL: { gandum: 'Padi' }, // id internal tetap 'gandum' (save & quest tetap cocok)
    // TEKS v1.4.0 sudah melokalkan semua event (id lama tetap, teks Nusantara) -> tidak ada yang dimatikan; musim event lama dipetakan ke musim tropis
    EVENT_DISABLE: [],
    EVENT_SEASON_ALIAS: { semi: 'hujan', panas: 'kemarau', gugur: 'mareng', dingin: 'kemarau' }, // = TEKS meta.alias_id_v140.musim
    EVENT_RULES: { panen_raya: { musim: ['mareng'] }, kekeringan: { musim: ['kemarau'] }, badai: { musim: ['mareng', 'labuh'] } },
    MARKET_MUSIM: { kemarau: { jual: { makanan: 1.25, gandum: 1.25 }, beli: { makanan: 1.4, gandum: 1.4 } }, hujan: { jual: { kayu: 0.9 } }, mareng: { jual: { makanan: 0.85, gandum: 0.9 } } },
    // teks bawaan (bahasa Indonesia) per kait; [pathTEKS atau null, cadangan]. Asisten Dokumen mengisi path saat TEKS Nusantara siap.
    TXT: {
      tahun_baru: [null, 'Tahun ke-{tahun} dimulai. Hujan pertama membasahi sawah.'],
      musim_mulai: [null, '{musim} dimulai.'],
      hujan: [null, 'Hujan turun seharian. Yang tidak punya atap kebasahan.'],
      hujan_pertama: [null, 'Hujan pertama turun. Bau tanah basah membuat semua orang tersenyum.'],
      menuju_sulit: [null, 'Sisa {hari_sisa} hari sebelum kemarau. Stok {jumlah}/{jumlah2} hari.'],
      stok_kurang: [null, 'Tanam singkong dan jagung, simpan padi di lumbung.'],
      syukur: [null, 'Lumbung penuh gabah sebelum kemarau. Syukuran kecil!'],
      kayu_bakar: [null, 'Malam lembap: api unggun memakai {jumlah} kayu bakar per hari selama musim hujan.'],
      api_padam: [null, 'Kayu bakar habis! Api unggun meredup, malam terasa lembap.'],
      sulit_mulai: [null, 'Kemarau tiba. Sawah tanpa irigasi berhenti tumbuh, air cepat habis.'],
      jejak: ['log_ancaman.babi_hutan_jejak', 'Tanah teraduk dan jejak babi hutan terlihat di tepi hutan.'],
      mendekat: ['log_ancaman.babi_hutan_mendekat', 'Suara dengusan babi hutan makin dekat. Penduduk bergegas pulang.'],
      mengintai: ['log_ancaman.babi_hutan_mengintai', 'Babi hutan hanya mengendus di tepi hutan malam ini.'],
      usai: ['log_ancaman.babi_hutan_usai', 'Fajar menyingsing. Babi hutan sudah kembali ke hutan.'],
      serang: ['log_ancaman.babi_hutan_serang', 'Babi hutan menyeruduk {nama}! Kesehatannya turun {jumlah}.'],
      rusak_ladang: ['log_ancaman.babi_hutan_rusak_ladang', 'Babi hutan mengobrak-abrik ladang {tanaman}. Tanamannya rusak.'],
      diusir: ['log_ancaman.babi_hutan_diusir', 'Cahaya obor membuat babi hutan ragu. Ia berbalik ke hutan.'],
      menara: ['log_ancaman.pos_ronda_usir', 'Dari menara, {nama} memukul kentongan. Babi hutan lari ke hutan.'],
    },
    TERMS: { hewan: 'babi hutan', ancaman: 'Babi hutan' },
    // tambalan teks di memori (file TEKS-GAME.json tidak diubah): path -> teks
    TEXT_PATCH: { 'event:panen_raya.pilihan.0.teks_hasil': 'Lumbung penuh gabah. Kemarau tidak lagi menakutkan.' },
  },
};
THEMES.sedang.TERMS = { hewan: 'serigala', ancaman: 'Serigala' };
// babi hutan: kerangka serigala (jejak -> mendekat -> beraksi -> pergi), sasaran utama ladang; melukai penduduk baru mulai era Dusun
CONFIG.THREAT.babi = Object.assign({}, CONFIG.THREAT.wolf, {
  minEra: 'perkemahan', injureFromEra: 'dusun', baseNightChance: 0.07, hardMult: 1.3, plotsDamaged: [1, 2], damage: [15, 30], speed: 2.8, count: [1, 2],
  fencePathMult: 3, torchHitMult: 0.4, torchSafeRadius: 3, fieldFirst: true,
});
CONFIG.THREAT.wolf.hardMult = CONFIG.THREAT.wolf.winterMult;
(function applyTheme() {
  let id = CONFIG.THEME || 'indonesia';
  try { const q = new URLSearchParams(location.search).get('tema'); if (q && THEMES[q]) id = q; } catch (e) { /* tanpa location */ }
  const T = THEMES[id]; CONFIG.THEME = id;
  for (const k of ['SEASONS', 'SEASON_LEN', 'SEASON_NAMES', 'SEASON_ICONS', 'HARD_SEASON', 'HARD_COLD', 'HARD_HUNGER_MULT', 'GRANARY_HARD_HUNGER_MULT', 'HARD_BUFFER_DAYS',
    'SEASON_FX', 'NIGHT_THREAT', 'ART_SUFFIX', 'WINTER_ART', 'WEATHER', 'EVENT_DISABLE', 'EVENT_SEASON_ALIAS', 'TXT', 'TEXT_PATCH', 'TERMS', 'FIELD_ROTATION', 'ASSET_SWAP']) CONFIG[k] = T[k];
  for (const [b, n] of Object.entries(T.BUILDING_NAMES || {})) if (CONFIG.BUILDINGS[b]) CONFIG.BUILDINGS[b] = Object.assign({}, CONFIG.BUILDINGS[b], { nama: n });
  CONFIG.YEAR_SCALE = Object.assign({}, CONFIG.YEAR_SCALE, T.YEAR_SCALE);
  CONFIG.FIELD = Object.assign({}, CONFIG.FIELD, { crops: T.FIELD_CROPS });
  CONFIG.MARKET.musim = T.MARKET_MUSIM;
  CONFIG.EVENT_RULES = Object.assign({}, CONFIG.EVENT_RULES); for (const [k, r] of Object.entries(T.EVENT_RULES)) CONFIG.EVENT_RULES[k] = Object.assign({}, CONFIG.EVENT_RULES[k], r);
  CONFIG.RES_LABEL_THEME = T.RES_LABEL;
  // nama lama tetap ada untuk kode/tes lama
  CONFIG.SEASON_DAYS = Math.round(T.SEASONS.reduce((a, s) => a + T.SEASON_LEN[s], 0) / T.SEASONS.length);
  CONFIG.WINTER_HUNGER_MULT = T.HARD_HUNGER_MULT; CONFIG.GRANARY_WINTER_HUNGER_MULT = T.GRANARY_HARD_HUNGER_MULT; CONFIG.WINTER_BUFFER_DAYS = T.HARD_BUFFER_DAYS;
})();
