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
    // teks empat musim: path TEKS lama ([path, cadangan]); isi path-nya ditimpa TEKS-TEMA-sedang.json (lihat TEXT_OVERLAY)
    TXT: {
      tahun_baru: ['musim_pembuka.musim_tahun_baru', 'Tahun ke-{tahun} dimulai.'],
      musim_mulai: [null, 'Musim {musim} dimulai.'],
      musim_semi: ['musim_pembuka.musim_semi', 'Musim semi — saatnya menanam sebelum hujan deras.'],
      musim_panas: ['musim_pembuka.musim_panas', 'Musim panas datang. Jaga stok air!'],
      musim_gugur: ['musim_pembuka.musim_gugur', 'Musim gugur tiba. Waktunya panen dan menyimpan bekal.'],
      sulit_mulai: ['musim_pembuka.musim_dingin', 'Musim dingin datang. Api unggun butuh kayu bakar.'],
      hujan: ['musim_pembuka.musim_semi_hujan', 'Hujan rintik turun.'],
      menuju_sulit: ['musim_pembuka.musim_gugur_menuju_dingin', 'Sisa {hari_sisa} hari sebelum musim dingin. Stok {jumlah}/{jumlah2} hari.'],
      stok_kurang: ['musim_pembuka.musim_gugur_stok_kurang', ''],
      syukur: ['musim_pembuka.musim_gugur_syukur', 'Lumbung penuh sebelum salju. Syukuran kecil!'],
      kayu_bakar: ['musim_pembuka.musim_dingin_kayu_bakar', 'Api unggun memakai {jumlah} kayu bakar per hari.'],
      api_padam: ['log_ancaman.kayu_bakar_habis', 'Kayu bakar habis! Api unggun meredup.'],
      jejak: ['log_ancaman.serigala_jejak', 'Ada jejak serigala di tepi hutan. Auman jauh terdengar…'],
      mendekat: ['log_ancaman.serigala_mendekat', 'Lolongan serigala makin dekat. Penduduk bergegas pulang.'],
      mengintai: [null, 'Serigala hanya mengintai dari jauh malam ini.'],
      usai: ['log_ancaman.serigala_usai', 'Fajar menyingsing. Serigala sudah kembali ke hutan.'],
      serang: ['log_ancaman.serangan_serigala', 'Seekor serigala menerkam {nama}! Kesehatannya turun {jumlah}.'],
      diusir: ['log_ancaman.diusir', 'Cahaya obor membuat serigala ragu. Mereka berbalik ke hutan.'],
      menara: ['bangunan_ancaman.bangunan_menara_jaga.usir', 'Dari Menara jaga, {nama} meniup terompet. Serigala lari ke hutan.'],
      warn_jejak: [null, 'Jejak serigala'], warn_mendekat: [null, 'Auman mendekat!'], warn_serang: [null, 'Serigala menyerang!'],
      warn_ekstrem: [null, 'Dingin ekstrem hari ini'], warn_ekstrem_besok: [null, 'Angin membeku malam ini…'], ikon_ekstrem: [null, '🥶'],
      ekstrem_waspada: ['peringatan_dini.ancaman_dingin_ekstrem.tingkat.waspada.teks', 'Angin membeku malam ini… Besok akan sangat dingin.'],
      ekstrem_reda: ['peringatan_dini.ancaman_dingin_ekstrem.tingkat.reda.teks', 'Angin beku sudah reda.'],
    },
    TEXT_PATCH: {},
    // cerita P0: TEKS-TEMA-sedang.json v1.5.1+ punya padanan empat musim untuk 12 dilema, momen kecil, Festival Panen (pengganti Agustusan) & rubah (pengganti monyet)
    // -> semua cerita aktif di tema ini. Bendera & bunting merah-putih tidak dipasang saat Festival Panen.
    STORY_DISABLE: [],
    AGUS_HIDE: ['agus_bendera', 'agus_bunting'],
    STORY_SEASON_ALIAS: { semi: 'hujan', panas: 'labuh', gugur: 'mareng', dingin: 'kemarau' },
    STORY_PATCH: { MONKEY: { icon: '🦊', fallback: 'Seekor rubah menyelinap ke ladang dan membawa lari makanan!' } },
    TRAITS_PATCH: { founderNeedOneOf: null }, // aturan pengaman RISET-CERITA-TUJUAN §5.1: median d24 > 48 setelah efek sifat (55) -> hapus syarat sifat kerja pendiri
    MOOD_COMFORT_PATCH: { base: 64 }, // v9b: musim dingin menekan mood -> batas nyaman sedikit lebih tinggi supaya desa bahagia aktif ~25-45% hari seperti Nusantara
    SCHEDULE_PATCH: { dayWorkMult: 1.12, daySpeedMult: 1.2 }, // kompensasi jam tidur per tema (sim d24: 1.35 -> ~56; 1.2 + efek sifat -> 51-55; 1.12 -> lihat README)
    // pangan v9: musim empat-musim untuk memancing & jamur; pohon buah tropis, umbi hutan & keong sawah tidak ada (null = mati). Kolam Ikan membeku sebagian di musim dingin.
    FOOD_SOURCES_PATCH: { meramu: { label: 'Buah beri' }, memancing: { season: { semi: 1.1, panas: 0.85, gugur: 0.9, dingin: 0.4 }, pondSeasonMin: 0.6 }, jamur: { season: { semi: 1.0, panas: 0.2, gugur: 1.0, dingin: 0 } }, buah: null, keong: null,
      // padanan iklim sedang: umbi liar (kentang/lobak liar) tetap ada, tanpa pohon buah tropis & keong sawah
      umbi: { label: 'Kentang liar', count: 7, season: { semi: 1.0, panas: 0.4, gugur: 0.7, dingin: 0.3 } } },
    // TEKS-GAME.json (v1.5) dipakai semua tema. Teks lama yang di v1.4+ ditulis ulang bernuansa Nusantara ditimpa dengan teks empat musim
    // dari TEKS-TEMA-sedang.json (selisih v1.3.0 vs v1.5.0, dibuat tools/buat_overlay_sedang.js; larik ber-id digabung per id)
    TEXT_OVERLAY: 'TEKS-TEMA-sedang.json',
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
      labuh:   { rainChance: 0.30, rainBushRegrowMult: 1, chopTimeMultRain: 1.05, wellRecover: 1, // tanpa 2 kunci ini semak & tebang kayu NaN saat hujan labuh (semak mati permanen) firstRainMood: 5, plantTimeMult: 0.9, windChance: 0.08, windHp: 20,
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
    ASSET_SWAP: { gubuk: 'gubuk_bambu', rumah: 'rumah_panggung', lumbung: 'lumbung_padi', menara_jaga: 'pos_ronda', pagar: 'pagar_bambu', obor: 'obor_bambu' },
    BUILDING_NAMES: { gubuk: 'Gubuk Bambu', rumah: 'Rumah Panggung', lumbung: 'Lumbung Padi', menara_jaga: 'Pos Ronda', pagar: 'Pagar Bambu', obor: 'Oncor', ladang: 'Ladang (Tegalan)', kolam: 'Kolam Ikan', tambak: 'Tambak' },
    RES_LABEL: { gandum: 'Padi' }, // id internal tetap 'gandum' (save & quest tetap cocok)
    RES_ICON: { gandum: 'assets/icons/resources/icon_padi_ikat.png' }, // ikon resmi tahap 8c (ikat padi); icon_padi.png lama = cadangan sementara
    // TEKS v1.4.0 sudah melokalkan semua event (id lama tetap, teks Nusantara) -> tidak ada yang dimatikan; musim event lama dipetakan ke musim tropis
    EVENT_DISABLE: [],
    EVENT_SEASON_ALIAS: { semi: 'hujan', panas: 'kemarau', gugur: 'mareng', dingin: 'kemarau' }, // = TEKS meta.alias_id_v140.musim
    EVENT_RULES: { panen_raya: { musim: ['mareng'] }, kekeringan: { musim: ['kemarau'] }, badai: { musim: ['mareng', 'labuh'] } },
    MARKET_MUSIM: { kemarau: { jual: { makanan: 1.25, gandum: 1.25 }, beli: { makanan: 1.4, gandum: 1.4 } }, hujan: { jual: { kayu: 0.9 } }, mareng: { jual: { makanan: 0.85, gandum: 0.9 } } },
    // teks bawaan (bahasa Indonesia) per kait; [pathTEKS atau null, cadangan]. Asisten Dokumen mengisi path saat TEKS Nusantara siap.
    TXT: {
      tahun_baru: [null, 'Tahun ke-{tahun} dimulai. Hujan pertama membasahi sawah.'],
      musim_mulai: [null, '{musim} dimulai.'],
      musim_hujan: [null, 'Musim hujan tiba. Saatnya membajak sawah dan menanam padi.'], musim_mareng: [null, 'Mareng datang. Padi menguning dan sawah siap dipanen.'], musim_labuh: [null, 'Labuh datang. Mendung mulai menggantung, sumur perlahan berair lagi.'], // path TEKS diisi dari meta.txt_tema_nusantara saat TEKS dimuat
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
      warn_jejak: [null, 'Jejak babi hutan'], warn_mendekat: [null, 'Dengusan mendekat!'], warn_serang: [null, 'Babi hutan masuk desa!'],
      warn_ekstrem: [null, 'Malam bediding: udara sangat dingin'], warn_ekstrem_besok: [null, 'Bediding malam ini…'], ikon_ekstrem: [null, '🌬️'],
      ekstrem_waspada: ['peringatan_dini.ancaman_dingin_ekstrem.tingkat.waspada.teks', 'Angin kemarau berembus kencang. Malam nanti bediding, udara akan sangat dingin.'],
      ekstrem_reda: ['peringatan_dini.ancaman_dingin_ekstrem.tingkat.reda.teks', 'Bediding sudah lewat. Pagi kembali hangat.'],
    },
    TERMS: { hewan: 'babi hutan', ancaman: 'Babi hutan', ikon: '🐗' },
    // tambalan teks di memori (file TEKS-GAME.json tidak diubah): path -> teks
    TEXT_PATCH: { 'event:panen_raya.pilihan.0.teks_hasil': 'Lumbung penuh gabah. Kemarau tidak lagi menakutkan.' },
  },
};
THEMES.sedang.TERMS = { hewan: 'serigala', ancaman: 'Serigala', ikon: '🐺' };
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
    'SEASON_FX', 'NIGHT_THREAT', 'ART_SUFFIX', 'WINTER_ART', 'WEATHER', 'EVENT_DISABLE', 'EVENT_SEASON_ALIAS', 'TXT', 'TEXT_PATCH', 'TERMS', 'FIELD_ROTATION', 'ASSET_SWAP', 'RES_ICON', 'TEXT_FILE', 'TEXT_OVERLAY', 'AGUS_HIDE']) CONFIG[k] = T[k];
  for (const [b, n] of Object.entries(T.BUILDING_NAMES || {})) if (CONFIG.BUILDINGS[b]) CONFIG.BUILDINGS[b] = Object.assign({}, CONFIG.BUILDINGS[b], { nama: n });
  CONFIG.YEAR_SCALE = Object.assign({}, CONFIG.YEAR_SCALE, T.YEAR_SCALE);
  CONFIG.STORY_DISABLE = T.STORY_DISABLE || []; CONFIG.STORY_SEASON_ALIAS = T.STORY_SEASON_ALIAS || null;
  for (const [k, v] of Object.entries(T.STORY_PATCH || {})) if (CONFIG[k]) CONFIG[k] = Object.assign({}, CONFIG[k], v); // cerita.js dimuat sebelum tema.js
  if (T.TRAITS_PATCH && CONFIG.TRAITS) CONFIG.TRAITS = Object.assign({}, CONFIG.TRAITS, T.TRAITS_PATCH);
  if (T.FOOD_SOURCES_PATCH && CONFIG.FOOD_SOURCES) { CONFIG.FOOD_SOURCES = Object.assign({}, CONFIG.FOOD_SOURCES);
    for (const [k, v] of Object.entries(T.FOOD_SOURCES_PATCH)) { if (v === null) delete CONFIG.FOOD_SOURCES[k]; else CONFIG.FOOD_SOURCES[k] = Object.assign({}, CONFIG.FOOD_SOURCES[k], v); } }
  if (T.MOOD_COMFORT_PATCH && CONFIG.MOOD_COMFORT) CONFIG.MOOD_COMFORT = Object.assign({}, CONFIG.MOOD_COMFORT, T.MOOD_COMFORT_PATCH);
  if (T.SCHEDULE_PATCH && CONFIG.SCHEDULE) CONFIG.SCHEDULE = Object.assign({}, CONFIG.SCHEDULE, T.SCHEDULE_PATCH);
  CONFIG.FIELD = Object.assign({}, CONFIG.FIELD, { crops: T.FIELD_CROPS });
  CONFIG.MARKET.musim = T.MARKET_MUSIM;
  CONFIG.EVENT_RULES = Object.assign({}, CONFIG.EVENT_RULES); for (const [k, r] of Object.entries(T.EVENT_RULES)) CONFIG.EVENT_RULES[k] = Object.assign({}, CONFIG.EVENT_RULES[k], r);
  CONFIG.RES_LABEL_THEME = T.RES_LABEL;
  // nama lama tetap ada untuk kode/tes lama
  CONFIG.SEASON_DAYS = Math.round(T.SEASONS.reduce((a, s) => a + T.SEASON_LEN[s], 0) / T.SEASONS.length);
  CONFIG.WINTER_HUNGER_MULT = T.HARD_HUNGER_MULT; CONFIG.GRANARY_WINTER_HUNGER_MULT = T.GRANARY_HARD_HUNGER_MULT; CONFIG.WINTER_BUFFER_DAYS = T.HARD_BUFFER_DAYS;
})();
