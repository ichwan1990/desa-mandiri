# Aset Pixel Art — Desa Mandiri

Semua aset dibuat **secara terprogram** (Python + Pillow), orisinal. Gaya top-down, tile 32x32, PNG RGBA transparan, outline gelap hangat 1px, bayangan oval semi-transparan.

## Referensi gaya
Referensi mood: game **The Little Land** (RasterCat, 2026; 2.5D cute/cozy colony god-sim). Hanya nuansa yang diambil: imut & cozy, siluet bulat jelas, hijau alam hangat, aksen magis lembut (ungu/lavender sparkle), api unggun sebagai pusat visual (glow). **Tidak ada sprite/aset yang disalin**; tidak ada gambar referensi yang dipakai sebagai input.

## Regenerasi
```
cd tools && python3 generate_assets.py && python3 make_preview.py
```
`manifest.json` berisi palet + daftar file (dibuat ulang otomatis).

## Daftar file
| File | Ukuran gambar | Ukuran frame | Jumlah frame | Catatan |
|---|---|---|---|---|
| `tiles/grass.png` | 32x32 | 32x32 | 1 | seamless |
| `tiles/grass_flowers.png` | 32x32 | 32x32 | 1 | seamless, variasi rumput |
| `tiles/dirt.png` | 32x32 | 32x32 | 1 | seamless |
| `tiles/sand.png` | 32x32 | 32x32 | 1 | seamless |
| `tiles/water_anim.png` | 64x32 | 32x32 | 2 | 2 frame horizontal, ~500ms/frame, seamless |
| `tiles/edge_grass_dirt.png` | 256x32 | 32x32 | 8 | urutan: n,e,s,w,ne,se,sw,nw = sisi tempat material atas (rumput di atas dirt) berada |
| `tiles/edge_grass_sand.png` | 256x32 | 32x32 | 8 | urutan: n,e,s,w,ne,se,sw,nw = sisi tempat material atas (rumput di atas sand) berada |
| `tiles/edge_sand_water.png` | 256x32 | 32x32 | 8 | urutan: n,e,s,w,ne,se,sw,nw = sisi tempat material atas (pasir di atas air) berada |
| `nature/tree.png` | 32x64 | 32x64 | 1 | 32x64, alas (akar) di 32px bawah |
| `nature/tree_stump.png` | 32x32 | 32x32 | 1 | setelah ditebang |
| `nature/rock.png` | 32x32 | 32x32 | 1 |  |
| `nature/rock_small.png` | 32x32 | 32x32 | 1 |  |
| `nature/berry_bush_full.png` | 32x32 | 32x32 | 1 |  |
| `nature/berry_bush_empty.png` | 32x32 | 32x32 | 1 |  |
| `nature/field_empty.png` | 32x32 | 32x32 | 1 |  |
| `nature/field_growing.png` | 32x32 | 32x32 | 1 |  |
| `nature/field_ready.png` | 32x32 | 32x32 | 1 |  |
| `nature/field_stages.png` | 96x32 | 32x32 | 3 | urutan: kosong, tumbuh, siap panen |
| `characters/villager_1.png` | 128x256 | 32x32 | 32 | 8 baris x 4 kolom |
| `characters/villager_2.png` | 128x256 | 32x32 | 32 | 8 baris x 4 kolom |
| `characters/villager_3.png` | 128x256 | 32x32 | 32 | 8 baris x 4 kolom |
| `characters/villager_4.png` | 128x256 | 32x32 | 32 | 8 baris x 4 kolom |
| `buildings/campfire.png` | 128x32 | 32x32 | 4 | 4 frame horizontal, ~120ms/frame |
| `buildings/hut.png` | 64x64 | 64x64 | 1 | 64x64 (2x2 tile), kapasitas 2 |
| `buildings/warehouse.png` | 96x64 | 96x64 | 1 | 96x64 (3x2 tile) |
| `buildings/well.png` | 32x64 | 32x64 | 1 | 32x64, alas di 32px bawah |
| `buildings/mine.png` | 64x64 | 64x64 | 1 | 64x64 (2x2 tile) |
| `buildings/wooden_house.png` | 96x96 | 96x96 | 1 | 96x96 (3x3 tile) |
| `effects/sparkle_grow.png` | 128x32 | 32x32 | 4 | overlay di atas ladang/tanaman tumbuh, ~150ms/frame |
| `effects/campfire_glow.png` | 96x96 | 96x96 | 1 | overlay cahaya semi-transparan, pusatkan di api unggun (blend normal/additive) |
| `icons/icon_wood.png` | 32x32 | 32x32 | 1 |  |
| `icons/icon_stone.png` | 32x32 | 32x32 | 1 |  |
| `icons/icon_food.png` | 32x32 | 32x32 | 1 |  |
| `icons/icon_water.png` | 32x32 | 32x32 | 1 |  |

## Spritesheet penduduk (`characters/villager_N.png`)
Grid 4 kolom x 8 baris, frame 32x32. Kolom = frame 0..3 (kiri ke kanan).

| Baris | Isi |
|---|---|
| 0 | diam, bawah |
| 1 | diam, kiri |
| 2 | diam, kanan |
| 3 | diam, atas |
| 4 | jalan, bawah |
| 5 | jalan, kiri |
| 6 | jalan, kanan |
| 7 | jalan, atas |

Diam: 4 frame (napas, bob 1px; ~300ms/frame). Jalan: 4 frame (~120ms/frame). Titik kaki ≈ y=29 di dalam frame.

Variasi: 1 = kulit terang/rambut cokelat tua/baju oranye-merah; 2 = kulit sedang/rambut pirang/baju biru; 3 = kulit sawo/rambut merah/baju hijau; 4 = kulit gelap/rambut hitam/baju kuning.

## Konvensi lain
- Strip horizontal (air, api unggun, ladang, sparkle): frame dari kiri ke kanan.
- Objek tinggi (pohon 32x64, sumur 32x64, bangunan): anchor di tengah-bawah; alas menempati baris tile paling bawah.
- `edge_*.png`: 8 frame `n,e,s,w,ne,se,sw,nw` = sisi tempat material atas berada (mis. `w` di edge_grass_sand = rumput di kiri, pasir di kanan). Sudut = sudut luar saja.

## Palet
| Nama | RGB(A) |
|---|---|
| outline | (58, 40, 48) |
| shadow | (40, 30, 40, 90) |
| grass_d | (78, 140, 62) |
| grass | (112, 178, 72) |
| grass_l | (160, 208, 92) |
| dirt_d | (132, 86, 56) |
| dirt | (170, 118, 74) |
| dirt_l | (204, 154, 98) |
| sand_d | (214, 178, 110) |
| sand | (238, 208, 140) |
| sand_l | (250, 232, 176) |
| water_d | (52, 110, 170) |
| water | (78, 152, 206) |
| water_l | (150, 210, 236) |
| foam | (236, 248, 250) |
| wood_d | (102, 62, 44) |
| wood | (150, 94, 58) |
| wood_l | (196, 134, 82) |
| stone_d | (104, 102, 116) |
| stone | (150, 148, 158) |
| stone_l | (198, 196, 200) |
| leaf_d | (52, 112, 64) |
| leaf | (84, 156, 74) |
| leaf_l | (138, 196, 86) |
| roof_d | (166, 62, 52) |
| roof | (214, 94, 64) |
| roof_l | (240, 140, 88) |
| straw_d | (176, 134, 58) |
| straw | (222, 182, 86) |
| straw_l | (246, 218, 130) |
| fire_d | (214, 70, 40) |
| fire | (246, 144, 48) |
| fire_l | (255, 218, 92) |
| fire_w | (255, 248, 200) |
| berry | (210, 52, 88) |
| berry_l | (246, 120, 140) |
| wheat | (236, 196, 72) |
| skin1 | (250, 212, 170) |
| skin2 | (222, 166, 118) |
| skin3 | (176, 114, 74) |
| skin4 | (118, 76, 52) |
| hair1 | (70, 46, 36) |
| hair2 | (222, 170, 72) |
| hair3 | (196, 80, 48) |
| hair4 | (40, 34, 44) |
| cloth1 | (214, 94, 64) |
| cloth2 | (78, 152, 206) |
| cloth3 | (112, 178, 72) |
| cloth4 | (238, 196, 84) |
| cloth_d | (90, 60, 70) |
| magic | (170, 140, 240) |
| magic_l | (232, 220, 255) |
| glow | (255, 200, 90, 70) |
| white | (250, 246, 236) |
| black | (30, 24, 30) |

## Keterbatasan
- Tile transisi hanya 4 sisi + 4 sudut luar (tanpa sudut dalam / autotile 47 penuh).
- Animasi jalan sederhana (kaki/lengan 1-2px); hadap kiri/kanan cukup halus.
- Tidak ada animasi kerja (menebang/menambang), varian musim, malam, atau bangunan lanjutan (dapur, lumbung, pasar, dll).
- Sumur/pohon 32x64 harus digambar dengan depth-sort berdasarkan y.

---
# Tahap 2
Tambahan saja: file tahap 1 tidak berubah (diverifikasi md5). Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview.py && python3 make_preview_stage2.py`. Preview: `preview_stage2.png`. Di `manifest.json` setiap entri punya `stage` (1/2).

## Daftar file tahap 2
| File | Ukuran gambar | Ukuran frame | Jumlah frame | Catatan |
|---|---|---|---|---|
| `tiles/winter/snow_grass.png` | 32x32 | 32x32 | 1 | seamless, rumput bersalju |
| `tiles/winter/dirt_frozen.png` | 32x32 | 32x32 | 1 | seamless |
| `tiles/winter/sand_winter.png` | 32x32 | 32x32 | 1 | seamless, pasir berembun |
| `tiles/winter/ice.png` | 32x32 | 32x32 | 1 | seamless, air beku |
| `tiles/autotile_water_sand.png` | 256x384 | 32x32 | 94 | 47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json); frame air 0 = baris 0-5, frame 1 = baris 6-11 |
| `tiles/autotile_water_grass.png` | 256x384 | 32x32 | 94 | 47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json); frame air 0 = baris 0-5, frame 1 = baris 6-11 |
| `tiles/autotile_path_grass.png` | 256x192 | 32x32 | 47 | 47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json) |
| `tiles/autotile_ice_snow.png` | 256x192 | 32x32 | 47 | 47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json) |
| `tiles/autotile_path_snow.png` | 256x192 | 32x32 | 47 | 47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json) |
| `tiles/autotile_blob47.json` | - | - | - | lookup bitmask -> indeks tile |
| `nature/winter/tree_snow.png` | 32x64 | 32x64 | 1 | 32x64, sama anchor dengan tree.png |
| `nature/winter/tree_bare.png` | 32x64 | 32x64 | 1 | 32x64, pohon gundul |
| `nature/winter/berry_bush_snow.png` | 32x32 | 32x32 | 1 |  |
| `nature/winter/rock_snow.png` | 32x32 | 32x32 | 1 |  |
| `nature/crops/crop_wheat.png` | 192x32 | 32x32 | 6 | urutan: diolah, benih, tunas, tumbuh, siap panen, sudah dipanen |
| `nature/crops/crop_carrot.png` | 192x32 | 32x32 | 6 | urutan: diolah, benih, tunas, tumbuh, siap panen, sudah dipanen |
| `characters/villager_1_work.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 menebang, 4-7 menambang, 8-11 membawa (arah bawah,kiri,kanan,atas) |
| `characters/villager_2_work.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 menebang, 4-7 menambang, 8-11 membawa (arah bawah,kiri,kanan,atas) |
| `characters/villager_3_work.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 menebang, 4-7 menambang, 8-11 membawa (arah bawah,kiri,kanan,atas) |
| `characters/villager_4_work.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 menebang, 4-7 menambang, 8-11 membawa (arah bawah,kiri,kanan,atas) |
| `buildings/kitchen.png` | 64x64 | 64x64 | 1 | 64x64 (2x2) |
| `buildings/night/kitchen_night.png` | 64x64 | 64x64 | 1 | 64x64 (2x2), jendela/pintu menyala |
| `buildings/workshop.png` | 96x64 | 96x64 | 1 | 96x64 (3x2), bengkel alat |
| `buildings/night/workshop_night.png` | 96x64 | 96x64 | 1 | 96x64 (3x2), bengkel alat, jendela/pintu menyala |
| `buildings/granary.png` | 64x96 | 64x96 | 1 | 64x96 (2x3), lumbung panggung |
| `buildings/night/granary_night.png` | 64x96 | 64x96 | 1 | 64x96 (2x3), lumbung panggung, jendela/pintu menyala |
| `buildings/market.png` | 96x64 | 96x64 | 1 | 96x64 (3x2) |
| `buildings/night/market_night.png` | 96x64 | 96x64 | 1 | 96x64 (3x2), jendela/pintu menyala |
| `buildings/town_hall.png` | 128x96 | 128x96 | 1 | 128x96 (4x3), balai desa |
| `buildings/night/town_hall_night.png` | 128x96 | 128x96 | 1 | 128x96 (4x3), balai desa, jendela/pintu menyala |
| `buildings/bridge_h.png` | 96x32 | 32x32 | 3 | 3 tile horizontal: ujung kiri, tengah (boleh diulang), ujung kanan; tengah menyambung mulus |
| `buildings/bridge_v.png` | 32x96 | 32x32 | 3 | 3 tile vertikal: ujung atas, tengah (boleh diulang), ujung bawah |
| `effects/night/night_overlay.png` | 32x32 | 32x32 | 1 | tile 32x32 RGBA (22,28,70,150); ulangi/stretch menutup layar, blend normal |
| `effects/night/light_glow_small.png` | 64x64 | 64x64 | 1 | 64x64, untuk obor/lentera; gambar SETELAH overlay, blend additive/screen |
| `effects/night/light_glow_large.png` | 128x128 | 128x128 | 1 | 128x128, untuk api unggun/rumah |
| `effects/night/torch.png` | 128x32 | 32x32 | 4 | obor, 4 frame horizontal ~120ms |
| `effects/night/lantern_post.png` | 32x64 | 32x64 | 1 | 32x64 tiang lentera |
| `effects/night/lantern_post_lit.png` | 32x64 | 32x64 | 1 | 32x64 tiang lentera |
| `effects/night/lantern.png` | 32x32 | 32x32 | 1 | lentera gantung/meja 32x32 |
| `effects/night/lantern_lit.png` | 32x32 | 32x32 | 1 | lentera gantung/meja 32x32 |
| `buildings/night/wooden_house_night.png` | 96x96 | 96x96 | 1 | versi malam tahap-1, jendela/pintu menyala |
| `buildings/night/hut_night.png` | 64x64 | 64x64 | 1 | versi malam tahap-1, jendela/pintu menyala |

## Animasi kerja penduduk (`characters/villager_N_work.png`, N=1..4)
Grid 4 kolom x 12 baris, frame 32x32, kolom = frame 0..3. Anchor/titik kaki sama dengan `villager_N.png` (y≈29).

| Baris | Aksi | Arah |
|---|---|---|
| 0-3 | menebang (kapak) | bawah, kiri, kanan, atas |
| 4-7 | menambang (beliung) | bawah, kiri, kanan, atas |
| 8-11 | membawa barang (jalan + peti di atas kepala) | bawah, kiri, kanan, atas |

Menebang/menambang: frame 0 angkat, 1 puncak, 2 ayun, 3 benturan (ada serpihan); ~140ms/frame, loop. Membawa: siklus jalan 4 frame, ~120ms/frame.

## Jembatan
- `buildings/bridge_h.png` 96x32: 3 tile 32x32 kiri→kanan = ujung kiri, tengah, ujung kanan. Sungai lebar N tile: ujung di tile tepi, tengah diulang. Tile tengah menyambung mulus. Gambar di atas tile air (layer objek/lantai), bisa dilewati.
- `buildings/bridge_v.png` 32x96: 3 tile atas→bawah = ujung atas, tengah, ujung bawah.

## Autotile 47-blob
File `tiles/autotile_{water_sand,water_grass,path_grass,ice_snow,path_snow}.png`: grid 8 kolom x 6 baris (47 tile terpakai, sel terakhir kosong). `water_*` punya 2 frame animasi: baris 0-5 = frame 0, baris 6-11 = frame 1 (indeks + 47).

Material isi = air/jalan/es. Bitmask tetangga 8 arah yang JUGA material isi (di luar peta dianggap isi): `N=1, NE=2, E=4, SE=8, S=16, SW=32, W=64, NW=128`. Normalisasi: bit diagonal dibuang kecuali kedua tetangga ortogonalnya set (NE butuh N&E, dst.). Indeks tile = posisi mask ternormalisasi dalam daftar terurut 47 nilai (lookup lengkap: `tiles/autotile_blob47.json` → `mask_to_index`). Posisi di sheet: kolom = i%8, baris = i//8.

```js
function blobIndex(m){ // m = bitmask mentah
  if(!(m&1&&m&4)) m&=~2; if(!(m&16&&m&4)) m&=~8;
  if(!(m&16&&m&64)) m&=~32; if(!(m&1&&m&64)) m&=~128;
  return MASK_TO_INDEX[m]; }
```
Indeks 46 (mask 255) = tile penuh di tengah; indeks 0 (mask 0) = genangan/kolam 1 tile terisolasi.

## Ladang
`nature/crops/crop_wheat.png` (gandum), `crop_carrot.png` (wortel): 192x32, 6 frame: 0 tanah diolah, 1 benih, 2 tunas, 3 tumbuh, 4 siap panen, 5 sudah dipanen. Pakai `effects/sparkle_grow.png` di atas tahap 2-3.

## Musim dingin
`tiles/winter/`: `snow_grass`, `dirt_frozen`, `sand_winter`, `ice` (semua seamless 32x32). Transisi: `autotile_ice_snow.png`, `autotile_path_snow.png`. `nature/winter/`: `tree_snow`, `tree_bare` (32x64, anchor = tree.png), `berry_bush_snow`, `rock_snow`.

## Malam
1. Gambar scene normal. 2. Tutup layar dengan `effects/night/night_overlay.png` (atau isi warna RGBA (22,28,70,150)), blend normal. 3. Gambar `light_glow_small` (64x64) / `light_glow_large` (128x128) berpusat di sumber cahaya dengan blend **additive** (`globalCompositeOperation='lighter'` / Phaser `BlendModes.ADD`). 4. Sprite lampu menyala bisa digambar setelah overlay agar tetap terang.
Sprite: `torch.png` (4 frame api), `lantern_post(_lit).png` 32x64, `lantern(_lit).png` 32x32. Versi jendela menyala: `buildings/night/*_night.png` (ukuran & anchor sama persis dengan versi siang; tukar saat malam).

## Keterbatasan tahap 2
- Air autotile 2 frame; es/jalan statis. Tepi autotile dibuat prosedural (lengkung jarak), sambungan antar tile mulus tapi tepi agak seragam.
- Animasi kerja menghadap atas: alat sebagian besar tertutup badan/kepala (wajar dari belakang). Arah bawah: alat kecil di sisi kanan.
- Peti bawaan satu jenis (tidak per sumber daya).
- Bangunan lanjutan statis (kecuali asap dapur statis); tidak ada versi salju untuk atap bangunan.
- Jembatan tanpa pagar/bayangan di air; vertikal tidak ditampilkan di scene preview (ada di daftar sprite).
- Overlay malam tunggal (tanpa gradasi senja/fajar).
