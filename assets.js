// Konfigurasi aset tunggal. img: path (atau array path untuk variasi). Jika img null/gagal dimuat -> placeholder (color/shape).
// fw/fh = ukuran frame (px), frames = jumlah frame horizontal, fps = kecepatan animasi.
// Objek tinggi (fh > 32) digambar dengan anchor tengah-bawah di tile alasnya dan diurutkan berdasarkan y (y-sort).
// Varian: key + '_dingin' dipakai saat musim dingin, key + '_malam' saat malam (jika ada).
window.ASSETS = {
  rumput:   { color: '#7cbf5a', img: 'assets/tiles/grass.png' },
  rumput2:  { color: '#82c560', img: 'assets/tiles/grass_flowers.png' },
  rumput_dingin:  { color: '#e8eef2', img: 'assets/tiles/winter/snow_grass.png' },
  rumput2_dingin: { color: '#e8eef2', img: 'assets/tiles/winter/snow_grass.png' },
  air:      { color: '#3d8fd6', img: 'assets/tiles/water_anim.png', frames: 2, fps: 2 },
  air_dingin: { color: '#bfe3f2', img: 'assets/tiles/winter/ice.png' },
  // Autotile 47-blob (grid 8 kolom). animRows: baris per frame animasi (air: 6 baris/frame, 2 frame)
  auto_air:   { img: 'assets/tiles/autotile_water_grass.png', blob: true, animFrames: 2, fps: 2 },
  auto_air_dingin: { img: 'assets/tiles/autotile_ice_snow.png', blob: true, animFrames: 1 },
  jembatan: { color: '#9c6b3c', img: 'assets/buildings/bridge_h.png', frames: 3 }, // ujung kiri, tengah, ujung kanan
  pohon:    { color: '#2e6b2e', shape: 'circle', img: 'assets/nature/tree.png', fw: 32, fh: 64 },
  pohon_dingin: { color: '#dfe8ea', shape: 'circle', img: 'assets/nature/winter/tree_snow.png', fw: 32, fh: 64 },
  tunggul:  { color: '#6b4a2b', img: 'assets/nature/tree_stump.png' },
  batu:     { color: '#8d8d8d', shape: 'rock', img: 'assets/nature/rock.png' },
  batu_dingin: { color: '#cfd3d6', shape: 'rock', img: 'assets/nature/winter/rock_snow.png' },
  semak:    { color: '#4f9a3a', shape: 'bush', dot: '#e0413a', img: 'assets/nature/berry_bush_full.png' },
  semak_kosong: { color: '#4f9a3a', shape: 'bush', img: 'assets/nature/berry_bush_empty.png' },
  semak_kosong_dingin: { color: '#dfe8ea', shape: 'bush', img: 'assets/nature/winter/berry_bush_snow.png' },
  // Ladang: 6 frame = diolah, benih, tunas, tumbuh, siap panen, sudah dipanen
  tanaman_gandum: { color: '#c9a24a', img: 'assets/nature/crops/crop_wheat.png', frames: 6 },
  tanaman_wortel: { color: '#d9822b', img: 'assets/nature/crops/crop_carrot.png', frames: 6 },
  kilau:    { color: null, img: 'assets/effects/sparkle_grow.png', frames: 4, fps: 7 },
  gudang:   { color: '#9c6b3c', img: 'assets/buildings/warehouse.png', fw: 96, fh: 64 },
  gubuk:    { color: '#c9925a', roof: '#8a3b2a', img: 'assets/buildings/hut.png', fw: 64, fh: 64 },
  gubuk_malam: { color: '#c9925a', img: 'assets/buildings/night/hut_night.png', fw: 64, fh: 64 },
  apiunggun:{ color: '#ff9a2a', img: 'assets/buildings/campfire.png', frames: 4, fps: 8 },
  sumur:    { color: '#8d8d8d', img: 'assets/buildings/well.png', fw: 32, fh: 64 },
  ladang:   { color: '#8a5a32', img: null }, // digambar lewat tanaman_*
  dapur:    { color: '#b07040', img: 'assets/buildings/kitchen.png', fw: 64, fh: 64 },
  dapur_malam: { color: '#b07040', img: 'assets/buildings/night/kitchen_night.png', fw: 64, fh: 64 },
  bengkel:  { color: '#7a5434', img: 'assets/buildings/workshop.png', fw: 96, fh: 64 },
  bengkel_malam: { color: '#7a5434', img: 'assets/buildings/night/workshop_night.png', fw: 96, fh: 64 },
  lumbung:  { color: '#a0703c', img: 'assets/buildings/granary.png', fw: 64, fh: 96 },
  lumbung_malam: { color: '#a0703c', img: 'assets/buildings/night/granary_night.png', fw: 64, fh: 96 },
  pasar:    { color: '#c08a50', img: 'assets/buildings/market.png', fw: 96, fh: 64 },
  pasar_malam: { color: '#c08a50', img: 'assets/buildings/night/market_night.png', fw: 96, fh: 64 },
  balai:    { color: '#b06040', img: 'assets/buildings/town_hall.png', fw: 128, fh: 96 },
  balai_malam: { color: '#b06040', img: 'assets/buildings/night/town_hall_night.png', fw: 128, fh: 96 },
  cahaya:   { color: null, img: 'assets/effects/campfire_glow.png', fw: 96, fh: 96 },
  malam_overlay: { color: 'rgba(22,28,70,0.59)', img: null }, // warna sama dengan night_overlay.png
  glow_kecil: { img: 'assets/effects/night/light_glow_small.png', fw: 64, fh: 64 },
  glow_besar: { img: 'assets/effects/night/light_glow_large.png', fw: 128, fh: 128 },
  // Spritesheet 4 kolom x 8 baris (baris 0-3 diam b/ki/ka/at, 4-7 jalan); kaki ~y=29
  penduduk: { color: '#f2c59b', shirt: ['#d9534f','#5b7fd9','#e6b422','#9b59b6','#1abc9c'],
              img: ['assets/characters/villager_1.png','assets/characters/villager_2.png','assets/characters/villager_3.png','assets/characters/villager_4.png'],
              fw: 32, fh: 32, frames: 4, fpsWalk: 8, fpsIdle: 3 },
  // Kerja: 12 baris (0-3 menebang, 4-7 menambang, 8-11 membawa), arah b/ki/ka/at
  penduduk_kerja: { img: ['assets/characters/villager_1_work.png','assets/characters/villager_2_work.png','assets/characters/villager_3_work.png','assets/characters/villager_4_work.png'],
              fw: 32, fh: 32, frames: 4, fpsWork: 7, fpsCarry: 8, rows: { tebang: 0, tambang: 4, bawa: 8 } },
  // ---- Tahap 3 ----
  gubuk_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/hut_winter.png', fw: 64, fh: 64 },
  gubuk_malam_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/hut_night_winter.png', fw: 64, fh: 64 },
  // ---- tahap 6: rumah, lampu mati, pintu, siklus hidup (assets/README.md "Siklus hidup, tidur & rumah") ----
  // door: titik masuk penduduk (tengah bawah pintu) dalam frame bangunan
  rumah:    { color: '#b07a4a', roof: '#7a3b2a', img: 'assets/buildings/wooden_house.png', fw: 96, fh: 96 },
  rumah_malam: { color: '#b07a4a', img: 'assets/buildings/night/wooden_house_night.png', fw: 96, fh: 96 },
  rumah_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/wooden_house_winter.png', fw: 96, fh: 96 },
  rumah_malam_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/wooden_house_night_winter.png', fw: 96, fh: 96 },
  emote_cinta: { img: 'assets/icons/emotes/emote_cinta.png', fw: 16, fh: 16, frames: 4 }, // 64x16, 4 frame (pasangan baru)
  gubuk_mati: { img: 'assets/buildings/night/hut_night_off.png', fw: 64, fh: 64 },
  gubuk_mati_dingin: { img: 'assets/buildings/winter/hut_night_off_winter.png', fw: 64, fh: 64 },
  rumah_mati: { img: 'assets/buildings/night/wooden_house_night_off.png', fw: 96, fh: 96 },
  rumah_mati_dingin: { img: 'assets/buildings/winter/wooden_house_night_off_winter.png', fw: 96, fh: 96 },
  gubuk_pintu: { img: 'assets/buildings/hut_door.png', fw: 64, fh: 64, frames: 3, ms: 100, door: { x: 32, y: 56 } },
  gubuk_pintu_dingin: { img: 'assets/buildings/hut_door_winter.png', fw: 64, fh: 64, frames: 3, ms: 100 },
  rumah_pintu: { img: 'assets/buildings/wooden_house_door.png', fw: 96, fh: 96, frames: 3, ms: 100, door: { x: 48, y: 88 } },
  rumah_pintu_dingin: { img: 'assets/buildings/wooden_house_door_winter.png', fw: 96, fh: 96, frames: 3, ms: 100 },
  anak:     { img: [1, 2, 3, 4].map(i => `assets/characters/lifecycle/child_${i}.png`), frames: 4 },
  lansia:   { img: [1, 2, 3, 4].map(i => `assets/characters/lifecycle/elder_${i}.png`), frames: 4 },
  bayi:     { img: [1, 2, 3, 4].map(i => `assets/characters/lifecycle/baby_${i}.png`), fw: 32, fh: 32, frames: 2, ms: 500 },
  gendong:  { img: [1, 2, 3, 4].map(i => `assets/characters/lifecycle/villager_${i}_holding_baby.png`), frames: 4 },
  gendong_overlay: { img: 'assets/characters/lifecycle/baby_carried_overlay.png' },
  buaian:   { img: 'assets/characters/lifecycle/cradle.png', fw: 32, fh: 32, frames: 2, ms: 400 },
  buaian_kosong: { img: 'assets/characters/lifecycle/cradle_empty.png', fw: 32, fh: 32, frames: 2, ms: 400 },
  ikon_zzz: { img: 'assets/icons/status/icon_zzz_anim.png', fw: 16, fh: 16, frames: 4, ms: 300 },
  ikon_hati: { img: 'assets/icons/status/icon_heart_pulse.png', fw: 16, fh: 16, frames: 4, ms: 150, holdMs: 600 },
  // offset ikon (relatif kiri-atas frame 32x32) per tahap umur
  IKON_OFFSET: { zzz: { dewasa: [16, -12], remaja: [16, -12], anak: [16, -8], lansia: [16, -11], bayi: [14, 2] },
                 hati: { dewasa: [8, -14], remaja: [8, -14], anak: [8, -10], lansia: [8, -13], bayi: [8, 0] } },
  gudang_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/warehouse_winter.png', fw: 96, fh: 64 },
  sumur_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/well_winter.png', fw: 32, fh: 64 },
  apiunggun_dingin: { color: '#ff9a2a', img: 'assets/buildings/winter/campfire_winter.png', frames: 4, fps: 8 },
  dapur_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/kitchen_winter.png', fw: 64, fh: 64 },
  dapur_malam_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/kitchen_night_winter.png', fw: 64, fh: 64 },
  bengkel_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/workshop_winter.png', fw: 96, fh: 64 },
  lumbung_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/granary_winter.png', fw: 64, fh: 96 },
  lumbung_malam_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/granary_night_winter.png', fw: 64, fh: 96 },
  pasar_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/market_winter.png', fw: 96, fh: 64 },
  balai_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/town_hall_winter.png', fw: 128, fh: 96 },
  balai_malam_dingin: { color: '#e8eef2', img: 'assets/buildings/winter/town_hall_night_winter.png', fw: 128, fh: 96 },
  // Pagar jembatan: belakang digambar sebelum karakter, depan sesudahnya (frame: ujung kiri, tengah, ujung kanan)
  rel_belakang: { img: 'assets/buildings/bridge_rail_h_back.png', frames: 3 },
  rel_depan:    { img: 'assets/buildings/bridge_rail_h_front.png', frames: 3 },
  rel_v:        { img: 'assets/buildings/bridge_rail_v.png', frames: 3 },
  // Senja/fajar (warna = dusk_overlay.png / dawn_overlay.png), di-tween sebelum & sesudah malam
  senja_overlay: { color: 'rgba(150,70,120,0.35)' },
  fajar_overlay: { color: 'rgba(250,186,140,0.27)' },
  // Membawa per jenis: baris = tipe*4 + arah; tipe kayu 0, batu 1, makanan 2, air 3
  penduduk_bawa: { img: ['assets/characters/villager_1_carry.png','assets/characters/villager_2_carry.png','assets/characters/villager_3_carry.png','assets/characters/villager_4_carry.png'],
              fw: 32, fh: 32, frames: 4, fps: 8, tipe: { kayu: 0, batu: 1, makanan: 2, gandum: 2, air: 3, papan: 0, batu_bata: 1, alat: 1, kulit: 2 } },
  // Tumpukan stok di samping gudang (atau api unggun/pusat kemah sebelum ada gudang): stockpile_<res>_<0-4>[_winter], 32x32, 1 frame,
  // anchor tengah-bawah (assets/README.md "Stockpile", manifest stage 5). Tingkat 0 = palet kosong, 4 = penuh.
  ...Object.fromEntries(['kayu', 'batu', 'makanan', 'air'].flatMap(r => [0, 1, 2, 3, 4].flatMap(t => ['', '_winter'].map(w => [`stockpile_${r}_${t}${w}`,
    { img: `assets/stockpiles/stockpile_${r}_${t}${w}.png`, color: { kayu: '#8b5a2b', batu: '#9a9a9a', makanan: '#d0413a', air: '#5ab0e6' }[r] }])))),
  // ikon sumber daya untuk teks melayang "+N" & tumpukan cadangan (urutan = keys)
  res_ikon: { keys: ['kayu', 'batu', 'makanan', 'air', 'gandum', 'papan', 'batu_bata', 'alat', 'kulit'],
    img: ['assets/icons/icon_wood.png', 'assets/icons/icon_stone.png', 'assets/icons/icon_food.png', 'assets/icons/icon_water.png', 'assets/icons/resources/icon_wheat.png',
          'assets/icons/resources/icon_planks.png', 'assets/icons/resources/icon_bricks.png', 'assets/icons/resources/icon_tools.png', 'assets/icons/resources/icon_leather.png'] },
  // Ikon UI (dipakai lewat path di HTML; tidak perlu dimuat ke canvas)
  ikon_need_hunger: { ui: 'assets/icons/needs/need_hunger.png' }, ikon_need_energy: { ui: 'assets/icons/needs/need_energy.png' },
  ikon_need_mood: { ui: 'assets/icons/needs/need_mood.png' }, ikon_need_health: { ui: 'assets/icons/needs/need_health.png' },
  ikon_skill_menebang: { ui: 'assets/icons/skills/skill_chop.png' }, ikon_skill_menambang: { ui: 'assets/icons/skills/skill_mine.png' },
  ikon_skill_meramu: { ui: 'assets/icons/skills/skill_gather.png' }, ikon_skill_membangun: { ui: 'assets/icons/skills/skill_build.png' },
  ikon_skill_bertani: { ui: 'assets/icons/skills/skill_farm.png' }, ikon_skill_meneliti: { ui: 'assets/icons/tech/tech_tools.png' },
  ikon_tech_era_camp: { ui: 'assets/icons/tech/tech_era_camp.png' }, ikon_tech_storage: { ui: 'assets/icons/tech/tech_storage.png' },
  ikon_tech_farming: { ui: 'assets/icons/tech/tech_farming.png' }, ikon_tech_well: { ui: 'assets/icons/tech/tech_well.png' },
  ikon_tech_bread: { ui: 'assets/icons/tech/tech_bread.png' }, ikon_tech_tools: { ui: 'assets/icons/tech/tech_tools.png' },
  pedagang: { color: '#7a3b8a', img: 'assets/characters/merchant.png', fw: 32, fh: 32, frames: 4 },
  gerobak:  { color: '#8a5a32', img: 'assets/characters/merchant_cart.png', fw: 64, fh: 64 }, // kolom = arah, baris = frame roda
  // ikon pencapaian (A01-A24 -> berkas di assets/icons/achievements); yang terkunci memakai ach_locked
  ACH_ICON: { A01: 'first_fire', A02: 'first_house', A03: 'rich_storage', A04: 'survive_winter', A05: 'population_10', A06: 'first_harvest', A07: 'first_house',
    A08: 'town_founded', A09: 'first_harvest', A10: 'town_founded', A11: 'rich_storage', A12: 'rich_storage', A13: 'master_skill', A14: 'master_skill',
    A15: 'town_founded', A16: 'first_fire', A17: 'survive_winter', A18: 'town_founded', A19: 'rich_storage', A20: 'town_founded', A21: 'master_skill',
    A22: 'first_fire', A23: 'master_skill', A24: 'population_10', _dir: 'assets/icons/achievements/ach_', _locked: 'locked' },
  // ---------- tahap 4: varian musim (seasons/<spring|summer|autumn>/<asli>_<musim>.png), dipakai hanya bila gambarnya termuat ----------
  rumput_semi: { img: 'assets/seasons/spring/grass_spring.png' }, rumput2_semi: { img: 'assets/seasons/spring/grass_flowers_spring.png' },
  auto_air_semi: { img: 'assets/seasons/spring/autotile_water_grass_spring.png', blob: true, animFrames: 2, fps: 2 },
  pohon_semi: { img: 'assets/seasons/spring/tree_spring.png', fw: 32, fh: 64 }, semak_semi: { img: 'assets/seasons/spring/berry_bush_full_spring.png' }, semak_kosong_semi: { img: 'assets/seasons/spring/berry_bush_empty_spring.png' },
  rumput_panas: { img: 'assets/seasons/summer/grass_summer.png' }, rumput2_panas: { img: 'assets/seasons/summer/grass_flowers_summer.png' },
  auto_air_panas: { img: 'assets/seasons/summer/autotile_water_grass_summer.png', blob: true, animFrames: 2, fps: 2 },
  pohon_panas: { img: 'assets/seasons/summer/tree_summer.png', fw: 32, fh: 64 }, semak_panas: { img: 'assets/seasons/summer/berry_bush_full_summer.png' }, semak_kosong_panas: { img: 'assets/seasons/summer/berry_bush_empty_summer.png' },
  rumput_gugur: { img: 'assets/seasons/autumn/grass_autumn.png' }, rumput2_gugur: { img: 'assets/seasons/autumn/grass_flowers_autumn.png' },
  auto_air_gugur: { img: 'assets/seasons/autumn/autotile_water_grass_autumn.png', blob: true, animFrames: 2, fps: 2 },
  pohon_gugur: { img: 'assets/seasons/autumn/tree_autumn.png', fw: 32, fh: 64 }, semak_gugur: { img: 'assets/seasons/autumn/berry_bush_full_autumn.png' }, semak_kosong_gugur: { img: 'assets/seasons/autumn/berry_bush_empty_autumn.png' },
  rumput_meadow_semi: { img: 'assets/seasons/spring/grass_meadow_spring.png' }, tanah_retak_panas: { img: 'assets/seasons/summer/dirt_cracked_summer.png' }, tumpukan_daun: { img: 'assets/seasons/autumn/leaf_pile.png' },
  // cuaca: overlay 64x64 x4 frame diubinkan menutupi layar; tint 32x32 diubinkan; vignette di-stretch
  cuaca_hujan: { img: 'assets/effects/weather/rain_overlay.png', fw: 64, fh: 64, frames: 4, ms: 80, color: 'rgba(160,190,230,0.5)' },
  cuaca_salju: { img: 'assets/effects/weather/snow_overlay.png', fw: 64, fh: 64, frames: 4, ms: 200, color: '#f4f8fc' },
  cuaca_daun:  { img: 'assets/effects/weather/leaves_overlay.png', fw: 64, fh: 64, frames: 4, ms: 200, color: '#d9822b' },
  cuaca_panas: { img: 'assets/effects/weather/heat_haze_overlay.png', fw: 64, fh: 64, frames: 4, ms: 150 },
  tint_hujan: { img: 'assets/effects/weather/rain_tint.png', color: 'rgba(60,70,100,0.18)' },
  tint_panas: { img: 'assets/effects/weather/heat_tint.png', color: 'rgba(255,200,110,0.16)' },
  tint_beku:  { img: 'assets/effects/weather/frost_overlay.png', color: 'rgba(200,225,245,0.15)' },
  vignette_beku: { img: 'assets/effects/weather/frost_vignette.png' },
  duka_overlay: { img: 'assets/effects/mourning_overlay.png', color: 'rgba(70,70,90,0.27)' }, duka_vignette: { img: 'assets/effects/mourning_vignette.png' },
  // bahaya
  banjir_auto: { img: 'assets/hazards/autotile_flood.png', blob: true, animFrames: 2, fps: 2, color: 'rgba(90,150,210,0.45)' },
  air_naik:    { img: 'assets/hazards/water_rise.png' },               // baris = sisi asal air N,E,S,W; kolom = level 0-3
  asap:        { img: 'assets/hazards/smoke.png', frames: 4, ms: 150, color: 'rgba(206,200,200,0.66)' },
  api_kecil:   { img: 'assets/hazards/fire_small.png', frames: 6, ms: 100, color: '#ff8a2a' },
  api_besar:   { img: 'assets/hazards/fire_large.png', fw: 64, fh: 64, frames: 6, ms: 100, color: '#ff6a1a' },
  puing_kecil: { img: 'assets/hazards/burnt/rubble_small.png' }, puing_besar: { img: 'assets/hazards/burnt/rubble_large.png', fw: 64, fh: 64 },
  gubuk_hangus: { img: 'assets/hazards/burnt/hut_burnt.png', fw: 64, fh: 64 }, gudang_hangus: { img: 'assets/hazards/burnt/warehouse_burnt.png', fw: 96, fh: 64 },
  sumur_hangus: { img: 'assets/hazards/burnt/well_burnt.png', fw: 32, fh: 64 }, dapur_hangus: { img: 'assets/hazards/burnt/kitchen_burnt.png', fw: 64, fh: 64 },
  bengkel_hangus: { img: 'assets/hazards/burnt/workshop_burnt.png', fw: 96, fh: 64 }, lumbung_hangus: { img: 'assets/hazards/burnt/granary_burnt.png', fw: 64, fh: 96 },
  pasar_hangus: { img: 'assets/hazards/burnt/market_burnt.png', fw: 96, fh: 64 }, balai_hangus: { img: 'assets/hazards/burnt/town_hall_burnt.png', fw: 128, fh: 96 },
  // serigala: 32x32, baris = mode*4 + arah (mode diam 0, jalan 1, serang 2; arah bawah,kiri,kanan,atas); serang frame 2 = gigitan
  serigala: { img: ['assets/characters/animals/wolf_grey.png', 'assets/characters/animals/wolf_brown.png'], frames: 4, color: '#6b6b74' },
  jejak_kaki: { img: 'assets/characters/animals/paw_print.png', fw: 8, fh: 8 }, jejak_serigala: { img: 'assets/characters/animals/paw_trail.png', color: 'rgba(60,50,40,0.5)' },
  // bangunan pertahanan & duka
  pagar:  { color: '#8a5a32', img: 'assets/structures/fence_autotile.png' },   // indeks = N1+E2+S4+W8; kolom i%4, baris i//4
  gerbang_h: { img: 'assets/structures/gate_h.png' }, gerbang_v: { img: 'assets/structures/gate_v.png' },
  obor:   { color: '#ffb040', img: 'assets/structures/torch_post.png', fw: 32, fh: 64, frames: 4, ms: 120, frameMati: 4 },
  menara_jaga: { color: '#7a5434', img: 'assets/structures/watchtower.png', fw: 64, fh: 96 },
  makam:  { color: '#9a9a9a', img: ['assets/structures/graves/grave_mound_fresh.png', 'assets/structures/graves/grave_cross_wood.png', 'assets/structures/graves/grave_stone_round.png', 'assets/structures/graves/grave_stone_flowers.png', 'assets/structures/graves/grave_cairn.png'] },
  makam_dingin: { img: 'assets/structures/graves/grave_stone_snow.png' },
  // ---------- tahap 7: Nusantara (assets/README.md "Tahap 7"); dipakai lewat tema (CONFIG.ASSET_SWAP / ART_SUFFIX) ----------
  // varian musim tropis: seasons/tropis/<musim>/<asli>_<musim>.png, format & indeks sama dengan aslinya
  ...Object.fromEntries(['hujan', 'mareng', 'kemarau', 'labuh'].flatMap(m => [
    [`rumput_${m}`, { img: `assets/seasons/tropis/${m}/grass_${m}.png` }], [`rumput2_${m}`, { img: `assets/seasons/tropis/${m}/grass_flowers_${m}.png` }],
    [`auto_air_${m}`, { img: `assets/seasons/tropis/${m}/autotile_water_grass_${m}.png`, blob: true, animFrames: 2, fps: 2 }],
    [`pohon_${m}`, { img: `assets/seasons/tropis/${m}/tree_${m}.png`, fw: 32, fh: 64 }],
    [`semak_${m}`, { img: `assets/seasons/tropis/${m}/berry_bush_full_${m}.png` }], [`semak_kosong_${m}`, { img: `assets/seasons/tropis/${m}/berry_bush_empty_${m}.png` }]])),
  // cuaca tropis
  cuaca_hujan_lebat: { img: 'assets/effects/weather/rain_heavy_overlay.png', fw: 64, fh: 64, frames: 4, ms: 60, color: 'rgba(160,190,230,0.55)' },
  kilat_flash: { img: 'assets/effects/weather/lightning_flash.png', color: 'rgba(255,255,255,0.6)' },
  kilat: { img: 'assets/effects/weather/lightning_bolt.png', fw: 32, fh: 96, frames: 3 },
  cuaca_debu: { img: 'assets/effects/weather/dust_overlay.png', fw: 64, fh: 64, frames: 4, ms: 150 },
  debu: { img: 'assets/effects/weather/particle_dust.png', fw: 8, fh: 8, frames: 4 },
  tint_kemarau: { img: 'assets/effects/weather/kemarau_tint.png', color: 'rgba(230,170,90,0.16)' },
  bayang_awan: { img: 'assets/effects/weather/cloud_shadow_overlay.png', fw: 128, fh: 128 },
  // sawah (4-bit, N1+E2+S4+W8) + overlay padi 6 tahap; tanaman tegalan format crop_wheat
  sawah: { img: 'assets/tiles/tropis/sawah_autotile.png', color: '#6f9a5a' }, sawah_kilau: { img: 'assets/tiles/tropis/sawah_water_anim.png', frames: 2, ms: 600 },
  sawah_undakan: { img: 'assets/tiles/tropis/sawah_terrace_riser.png', frames: 3 },
  tanaman_padi: { color: '#9fbf4a', img: 'assets/nature/crops/crop_padi.png', frames: 6, overSawah: true },
  tanaman_jagung: { color: '#d9c04a', img: 'assets/nature/crops/crop_jagung.png', frames: 6 },
  tanaman_singkong: { color: '#6f9a3a', img: 'assets/nature/crops/crop_singkong.png', frames: 6 },
  tanaman_ubi: { color: '#a0523a', img: 'assets/nature/crops/crop_ubi.png', frames: 6 },
  tanaman_kopi: { color: '#7a2a2a', img: 'assets/nature/crops/crop_kopi.png', frames: 6 },
  // fauna: baris = mode*4 + arah (diam 0, jalan 1, serang 2; bawah, kiri, kanan, atas)
  babi_hutan: { img: 'assets/characters/fauna/babi_hutan.png', frames: 4, color: '#4a3324' },
  kunang_kunang: { img: 'assets/characters/fauna/ambient/kunang_kunang.png', fw: 8, fh: 8, frames: 4, ms: 200 },
  // bangunan & struktur lokal (pengganti lewat ASSET_SWAP)
  gubuk_bambu: { color: '#c9a25a', roof: '#7a6a3a', img: 'assets/buildings/tropis/gubuk_bambu.png', fw: 64, fh: 64 },
  gubuk_bambu_malam: { img: 'assets/buildings/tropis/night/gubuk_bambu_night.png', fw: 64, fh: 64 },
  gubuk_bambu_mati: { img: 'assets/buildings/tropis/night/gubuk_bambu_night_off.png', fw: 64, fh: 64 },
  rumah_panggung: { img: 'assets/buildings/tropis/rumah_panggung.png', fw: 96, fh: 96 },
  rumah_panggung_malam: { img: 'assets/buildings/tropis/night/rumah_panggung_night.png', fw: 96, fh: 96 },
  rumah_panggung_mati: { img: 'assets/buildings/tropis/night/rumah_panggung_night_off.png', fw: 96, fh: 96 },
  lumbung_padi: { color: '#a0803c', img: 'assets/buildings/tropis/lumbung_padi.png', fw: 64, fh: 96 },
  pos_ronda: { color: '#7a5434', img: 'assets/buildings/tropis/pos_ronda.png', fw: 64, fh: 64, frames: 3, ms: 150 },
  pos_ronda_malam: { img: 'assets/buildings/tropis/night/pos_ronda_night.png', fw: 64, fh: 64, frames: 3, ms: 150 },
  pagar_bambu: { color: '#b0a050', img: 'assets/structures/tropis/pagar_bambu_autotile.png' },
  obor_bambu: { color: '#ffb040', img: 'assets/structures/tropis/obor_bambu.png', fw: 32, fh: 64, frames: 4, ms: 120, frameMati: 4 },
  // UI peringatan & status
  WARN_DIR: 'assets/ui/warning/', STATUS_DIR: 'assets/icons/status/',
  blob47:   { json: 'assets/tiles/autotile_blob47.json' },
};
// Tema: ganti sprite bangunan (CONFIG.ASSET_SWAP: id -> id aset tema, termasuk varian _malam/_mati) dan buang varian musim tema lain agar tidak ikut dimuat.
(function applyThemeAssets() { const C = window.CONFIG || {}, A = window.ASSETS, swap = C.ASSET_SWAP || {};
  for (const [k, to] of Object.entries(swap)) for (const suf of ['', '_malam', '_mati']) { if (A[to + suf]) A[k + suf] = Object.assign({}, A[k + suf] || {}, A[to + suf]); else if (suf && A[k + suf] && A[k]) delete A[k + suf]; }
  for (const [r, src] of Object.entries(C.RES_ICON || {})) { const i = A.res_ikon.keys.indexOf(r); if (i >= 0) A.res_ikon.img[i] = src; } // ikon sumber daya per tema (Padi)
  for (const k of Object.keys(swap)) { delete A[k + '_pintu']; delete A[k + '_pintu_dingin']; } // sprite pintu kayu tidak cocok dgn bangunan tropis -> animasi pintu disembunyikan
  const tropis = C.THEME !== 'sedang', drop = tropis ? /_(semi|panas|gugur|dingin|winter)$/ : /_(hujan|mareng|kemarau|labuh)$/;
  for (const k of Object.keys(A)) if (drop.test(k) && !['makam_dingin', 'tanah_retak_panas', 'rumput_meadow_semi'].includes(k)) delete A[k];
  if (tropis) for (const k of ['cuaca_salju', 'tint_beku', 'vignette_beku']) delete A[k];
  else for (const k of ['cuaca_hujan_lebat', 'kilat_flash', 'kilat', 'cuaca_debu', 'debu', 'tint_kemarau', 'bayang_awan', 'sawah', 'sawah_kilau', 'sawah_undakan', 'tanaman_padi', 'tanaman_jagung', 'tanaman_singkong', 'tanaman_ubi', 'tanaman_kopi',
    'babi_hutan', 'kunang_kunang', 'gubuk_bambu', 'gubuk_bambu_malam', 'gubuk_bambu_mati', 'rumah_panggung', 'rumah_panggung_malam', 'rumah_panggung_mati', 'lumbung_padi', 'pos_ronda', 'pos_ronda_malam', 'pagar_bambu', 'obor_bambu']) delete A[k];
})();
// Muat gambar dengan batas paralel (agar server sederhana tidak menolak koneksi) + coba ulang.
window.loadAssets = function (done, opts = {}) {
  const MAX = opts.parallel || 12, RETRY = opts.retry ?? 2, queue = [];
  for (const [, a] of Object.entries(ASSETS)) {
    if (!a || !a.img) continue;
    const list = Array.isArray(a.img) ? a.img : [a.img];
    a.images = [];
    list.forEach((src, i) => queue.push({ a, src, i, tries: 0 }));
  }
  let active = 0, idx = 0, waiting = 0, finished = false;
  const extra = [];
  if (ASSETS.blob47.json) extra.push(fetch(ASSETS.blob47.json).then(r => r.json()).then(j => { ASSETS.blob47.map = j.mask_to_index; }).catch(() => console.warn('autotile_blob47.json gagal dimuat')));
  const finish = () => { if (finished) return; finished = true; Promise.all(extra).then(done); };
  const next = () => {
    if (idx >= queue.length && active === 0 && waiting === 0) return finish();
    while (active < MAX && idx < queue.length) load(queue[idx++]);
  };
  const load = job => { active++; const im = new Image();
    im.onload = () => { job.a.images[job.i] = im; if (job.i === 0) job.a.image = im; active--; next(); };
    im.onerror = () => { active--;
      if (job.tries++ < RETRY) { waiting++; setTimeout(() => { waiting--; queue.push(job); next(); }, 150 * job.tries); }
      else { console.warn('Aset tidak ditemukan, pakai placeholder:', job.src); next(); } };
    im.src = job.src + (job.tries ? (job.src.includes('?') ? '&' : '?') + 'r=' + job.tries : ''); };
  next();
};
