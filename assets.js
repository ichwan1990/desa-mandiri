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
              fw: 32, fh: 32, frames: 4, fps: 8, tipe: { kayu: 0, batu: 1, makanan: 2, gandum: 2, air: 3 } },
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
  blob47:   { json: 'assets/tiles/autotile_blob47.json' },
};
window.loadAssets = function (done) {
  const jobs = [];
  for (const [k, a] of Object.entries(ASSETS)) {
    if (!a.img) continue;
    const list = Array.isArray(a.img) ? a.img : [a.img];
    a.images = [];
    list.forEach((src, i) => jobs.push(new Promise(res => { const im = new Image();
      im.onload = () => { a.images[i] = im; if (i === 0) a.image = im; res(); };
      im.onerror = () => { console.warn('Aset tidak ditemukan, pakai placeholder:', src); res(); }; im.src = src; })));
  }
  if (ASSETS.blob47.json) jobs.push(fetch(ASSETS.blob47.json).then(r => r.json()).then(j => { ASSETS.blob47.map = j.mask_to_index; }).catch(() => console.warn('autotile_blob47.json gagal dimuat')));
  Promise.all(jobs).then(done);
};
