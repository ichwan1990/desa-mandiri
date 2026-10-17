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
