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

---
# Tahap 3
Tambahan saja: file tahap 1-2 tidak berubah (diverifikasi md5). Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview_stage3.py`. Preview: `preview_stage3.png`. Entri di `manifest.json` bertanda `stage: 3`.

## Daftar file tahap 3
| File | Ukuran gambar | Ukuran frame | Jumlah frame | Catatan |
|---|---|---|---|---|
| `ui/logo/logo_1x.png` | 184x81 | 184x81 | 1 | logo 1x (nearest) |
| `ui/logo/logo_2x.png` | 368x162 | 368x162 | 1 | logo 2x (nearest) |
| `ui/logo/logo_4x.png` | 736x324 | 736x324 | 1 | logo 4x (nearest) |
| `ui/logo/logo_icon_32.png` | 32x32 | 32x32 | 1 | ikon/favicon 32x32 |
| `ui/logo/logo_icon_64.png` | 64x64 | 64x64 | 1 | ikon 64x64 |
| `ui/title/title_640x360.png` | 640x360 | 640x360 | 1 | layar judul |
| `ui/title/title_1280x720.png` | 1280x720 | 1280x720 | 1 | layar judul (2x nearest) |
| `ui/title/title_bg_640x360.png` | 640x360 | 640x360 | 1 | scene tanpa logo/teks (untuk disusun sendiri) |
| `ui/skin/panel.png` | 48x48 | 48x48 | 1 | 9-slice, margin 8px semua sisi (inset konten 6px) |
| `ui/skin/panel_wood.png` | 48x48 | 48x48 | 1 | 9-slice, margin 8px; varian kayu (HUD) |
| `ui/skin/button_normal.png` | 64x24 | 64x24 | 1 | 9-slice, margin kiri/kanan 6, atas 4, bawah 6 |
| `ui/skin/button_hover.png` | 64x24 | 64x24 | 1 | 9-slice, margin kiri/kanan 6, atas 4, bawah 6 |
| `ui/skin/button_pressed.png` | 64x24 | 64x24 | 1 | 9-slice, margin kiri/kanan 6, atas 4, bawah 6 |
| `ui/skin/button_disabled.png` | 64x24 | 64x24 | 1 | 9-slice, margin kiri/kanan 6, atas 4, bawah 6 |
| `ui/skin/button_states.png` | 256x24 | 64x24 | 4 | urutan: normal, hover, pressed, disabled |
| `ui/skin/tab_active.png` | 64x24 | 64x24 | 1 | 9-slice margin 6 (bawah 0, menyatu dengan panel) |
| `ui/skin/tab_inactive.png` | 64x24 | 64x24 | 1 | 9-slice margin 6 |
| `ui/skin/tooltip.png` | 24x24 | 24x24 | 1 | 9-slice, margin 4px; teks putih |
| `ui/skin/tooltip_arrow.png` | 8x5 | 8x5 | 1 | taruh di bawah tooltip, menunjuk ke bawah |
| `ui/skin/bar_frame.png` | 64x12 | 64x12 | 1 | 9-slice margin 3; area isi x2..61, y2..9 |
| `ui/skin/bar_fill_red.png` | 8x8 | 8x8 | 1 | stretch horizontal mengisi area bar |
| `ui/skin/bar_fill_blue.png` | 8x8 | 8x8 | 1 | stretch horizontal mengisi area bar |
| `ui/skin/bar_fill_yellow.png` | 8x8 | 8x8 | 1 | stretch horizontal mengisi area bar |
| `ui/skin/bar_fill_green.png` | 8x8 | 8x8 | 1 | stretch horizontal mengisi area bar |
| `ui/skin/bar_fill_purple.png` | 8x8 | 8x8 | 1 | stretch horizontal mengisi area bar |
| `ui/skin/checkbox_off.png` | 16x16 | 16x16 | 1 |  |
| `ui/skin/checkbox_on.png` | 16x16 | 16x16 | 1 |  |
| `icons/needs/need_hunger.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_thirst.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_energy.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_mood.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_mood_sad.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_health.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_warmth.png` | 32x32 | 32x32 | 1 |  |
| `icons/needs/need_sleep.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_chop.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_mine.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_gather.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_build.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_farm.png` | 32x32 | 32x32 | 1 |  |
| `icons/skills/skill_hunt.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_tools.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_planks.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_bricks.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_bread.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_leather.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_farming.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_well.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_storage.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_era_camp.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_era_hamlet.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_era_farm_village.png` | 32x32 | 32x32 | 1 |  |
| `icons/tech/tech_era_town.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_wheat.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_bread.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_planks.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_bricks.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_tools.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_leather.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_fish.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_meat.png` | 32x32 | 32x32 | 1 |  |
| `icons/resources/icon_fruit.png` | 32x32 | 32x32 | 1 |  |
| `icons/achievements/ach_first_fire.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_first_house.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_first_harvest.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_population_10.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_survive_winter.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_master_skill.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_town_founded.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_rich_storage.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `icons/achievements/ach_locked.png` | 32x32 | 32x32 | 1 | medali; ach_locked = belum terbuka |
| `buildings/winter/hut_winter.png` | 64x64 | 64x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/hut.png |
| `buildings/winter/warehouse_winter.png` | 96x64 | 96x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/warehouse.png |
| `buildings/winter/well_winter.png` | 32x64 | 32x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/well.png |
| `buildings/winter/mine_winter.png` | 64x64 | 64x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/mine.png |
| `buildings/winter/wooden_house_winter.png` | 96x96 | 96x96 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/wooden_house.png |
| `buildings/winter/kitchen_winter.png` | 64x64 | 64x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/kitchen.png |
| `buildings/winter/workshop_winter.png` | 96x64 | 96x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/workshop.png |
| `buildings/winter/granary_winter.png` | 64x96 | 64x96 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/granary.png |
| `buildings/winter/market_winter.png` | 96x64 | 96x64 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/market.png |
| `buildings/winter/town_hall_winter.png` | 128x96 | 128x96 | 1 | atap bersalju; ukuran/anchor sama dengan buildings/town_hall.png |
| `buildings/winter/campfire_winter.png` | 128x32 | 32x32 | 4 | atap bersalju; ukuran/anchor sama dengan buildings/campfire.png |
| `buildings/winter/wooden_house_night_winter.png` | 96x96 | 96x96 | 1 | malam + salju |
| `buildings/winter/hut_night_winter.png` | 64x64 | 64x64 | 1 | malam + salju |
| `buildings/winter/kitchen_night_winter.png` | 64x64 | 64x64 | 1 | malam + salju |
| `buildings/winter/town_hall_night_winter.png` | 128x96 | 128x96 | 1 | malam + salju |
| `buildings/winter/granary_night_winter.png` | 64x96 | 64x96 | 1 | malam + salju |
| `buildings/bridge_rail_h_back.png` | 96x32 | 32x32 | 3 | pagar sisi utara; gambar SEBELUM karakter; tile = bridge_h |
| `buildings/bridge_rail_h_front.png` | 96x32 | 32x32 | 3 | pagar sisi selatan; gambar SETELAH karakter |
| `buildings/bridge_rail_v.png` | 32x96 | 32x32 | 3 | pagar kiri+kanan; tumpuk di atas bridge_v; gambar setelah karakter |
| `effects/night/dusk_overlay.png` | 32x32 | 32x32 | 1 | senja RGBA (150,70,120,90) |
| `effects/night/dawn_overlay.png` | 32x32 | 32x32 | 1 | fajar RGBA (250,186,140,70) |
| `effects/night/dusk_gradient.png` | 320x180 | 320x180 | 1 | opsional, stretch ke layar; tambahan langit sore di atas dusk_overlay |
| `characters/villager_1_carry.png` | 128x512 | 32x32 | 64 | 16 baris x 4 kolom: 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; arah tiap kelompok bawah,kiri,kanan,atas; siklus jalan |
| `characters/villager_2_carry.png` | 128x512 | 32x32 | 64 | 16 baris x 4 kolom: 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; arah tiap kelompok bawah,kiri,kanan,atas; siklus jalan |
| `characters/villager_3_carry.png` | 128x512 | 32x32 | 64 | 16 baris x 4 kolom: 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; arah tiap kelompok bawah,kiri,kanan,atas; siklus jalan |
| `characters/villager_4_carry.png` | 128x512 | 32x32 | 64 | 16 baris x 4 kolom: 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; arah tiap kelompok bawah,kiri,kanan,atas; siklus jalan |
| `characters/merchant.png` | 128x256 | 32x32 | 32 | format = villager_N.png: baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas) |
| `characters/merchant_cart.png` | 256x128 | 64x64 | 8 | 4 kolom arah (bawah,kiri,kanan,atas) x 2 baris frame roda; ~200ms/frame; pegangan menunjuk arah gerak (pedagang berjalan di depan gerobak) |

## Logo & layar judul
- `ui/logo/logo_{1,2,4}x.png` (nearest, kelipatan bulat saja). `logo_icon_32/64.png` untuk favicon/ikon.
- `ui/title/title_640x360.png`, `title_1280x720.png` (= 2x). `title_bg_640x360.png` = scene tanpa logo/teks untuk disusun sendiri (mis. teks tombol HTML).

## Skin UI (9-slice)
| File | Ukuran | Margin (kiri/atas/kanan/bawah) | Catatan |
|---|---|---|---|
| `ui/skin/panel.png` | 48x48 | 8/8/8/8 | kertas + bingkai kayu; padding konten ≥ 6px dari tepi area tengah |
| `ui/skin/panel_wood.png` | 48x48 | 8/8/8/8 | panel kayu untuk HUD |
| `ui/skin/button_{normal,hover,pressed,disabled}.png` | 64x24 | 6/4/6/6 | pressed: muka turun 2px (geser teks +2px y) |
| `ui/skin/tab_active.png` / `tab_inactive.png` | 64x24 | 6/6/6/0 | tab aktif menyatu dengan panel (letakkan overlap 1px di atas panel); inaktif 4px lebih rendah |
| `ui/skin/tooltip.png` | 24x24 | 4/4/4/4 | isi gelap, teks putih; `tooltip_arrow.png` 8x5 di bawahnya |
| `ui/skin/bar_frame.png` | 64x12 | 3/3/3/3 | isi bar `bar_fill_*.png` (8x8) di-stretch di area dalam (inset 2px) |
| `ui/skin/checkbox_off/on.png` | 16x16 | - | |

CSS: `border-image: url(panel.png) 8 fill / 8px / 0 stretch; image-rendering: pixelated;` (skala ×2 → `16px`).

## Ikon (semua 32x32)
- Kebutuhan `icons/needs/need_*`: hunger (lapar), thirst (haus/air), energy (energi), sleep (tidur), mood (suasana hati), mood_sad, health (kesehatan), warmth (kehangatan/dingin).
- Skill `icons/skills/skill_*` (sesuai `game.js` SKILL_OF + konsep): chop=menebang, mine=menambang, gather=meramu, build=membangun, farm=bertani, hunt=berburu.
- Teknologi `icons/tech/tech_*`: tools=alat/bengkel, planks=papan, bricks=batu bata, bread=roti/dapur, leather=kulit/pakaian, farming=pertanian/ladang, well=sumur, storage=gudang/lumbung; era: era_camp=Perkemahan, era_hamlet=Dusun, era_farm_village=Desa Pertanian, era_town=Kota Kecil.
- Sumber daya lanjutan `icons/resources/icon_*`: wheat (gandum), bread (roti), planks (papan), bricks (batu_bata), tools (alat), leather (kulit), fish (ikan), meat (daging), fruit (buah).
- Pencapaian `icons/achievements/ach_*`: first_fire, first_house, first_harvest, population_10, survive_winter, master_skill, town_founded, rich_storage, locked (placeholder belum terbuka). Medali emas/perak.

## Musim dingin bangunan
`buildings/winter/<nama>_winter.png` untuk semua bangunan tahap 1-2 (hut, warehouse, well, mine, wooden_house, kitchen, workshop, granary, market, town_hall, campfire [strip 4 frame, salju di batu]) — ukuran, frame, dan anchor identik dengan file aslinya, cukup ganti path. Versi malam+salju: `wooden_house_night_winter`, `hut_night_winter`, `kitchen_night_winter`, `town_hall_night_winter`, `granary_night_winter`.

## Pagar jembatan
- `buildings/bridge_rail_h_back.png` (96x32, 3 tile sama dengan `bridge_h`): pagar utara, gambar sebelum karakter. `bridge_rail_h_front.png`: pagar selatan, gambar setelah karakter.
- `buildings/bridge_rail_v.png` (32x96, 3 tile = `bridge_v`): pagar kiri+kanan, gambar setelah karakter.

## Senja & fajar
`effects/night/dusk_overlay.png` RGBA (150,70,120,90), `dawn_overlay.png` (250,186,140,70); stretch ke layar, blend normal. Saran: siang → senja (tween alpha 0→1) → malam (`night_overlay`) → fajar → siang. `dusk_gradient.png` opsional (langit sore dari atas). Lampu mulai menyala saat senja.

## Membawa barang per jenis (`characters/villager_N_carry.png`)
128x512, frame 32x32, 4 kolom x 16 baris. Baris 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; tiap kelompok arah bawah, kiri, kanan, atas. Siklus jalan 4 frame (~120ms), format sama dengan baris 8-11 `_work.png`. Baris = `jenisIndex*4 + arahIndex`, jenisIndex: kayu 0, batu 1, makanan 2, air 3.

## Pedagang keliling
- `characters/merchant.png`: 128x256, format identik `villager_N.png` (baris 0-3 diam, 4-7 jalan; bawah, kiri, kanan, atas). Topi caping + ransel.
- `characters/merchant_cart.png`: 256x128, frame 64x64; kolom = arah gerak (bawah, kiri, kanan, atas), baris = frame roda 0-1 (~200ms). Anchor tengah-bawah (alas ≈ y 54). Gerobak menempati 2x2 tile; pedagang berjalan di depan gerobak, sejajar arah gerak.

## Keterbatasan tahap 3
- Font logo/teks hanya subset huruf (A B D E G H I K L M N O P R S T U spasi titik); bukan font lengkap.
- Layar judul statis (tanpa animasi api/air); 1280x720 adalah upscale 2x.
- Salju atap dibuat otomatis dari warna atap: atap pasar (kain) hanya dapat salju tipis di tepi atas; versi malam+salju hanya untuk 5 bangunan bercahaya utama.
- Gerobak arah bawah/atas sederhana (roda tampak samping); tidak ada animasi pedagang mendorong.
- Ikon tidak punya versi 16x16; untuk ukuran kecil gunakan skala 0.5 dengan hati-hati (gunakan 32 atau 64).

---
# Tahap 4 — Musim & Ancaman
Tambahan saja (file tahap 1-3 tidak berubah, diverifikasi md5). Mengikuti `docs/RISET-MUSIM-ANCAMAN.md` (bagian visual): nada hangat & imut, bukan horor. Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview_stage4.py`. Preview: `preview_stage4.png`. Manifest: `stage: 4`.

## Daftar file tahap 4
| File | Ukuran gambar | Ukuran frame | Jumlah frame | Catatan |
|---|---|---|---|---|
| `seasons/spring/grass_spring.png` | 32x32 | 32x32 | 1 | varian spring dari tiles/grass.png; format/indeks identik |
| `seasons/spring/grass_flowers_spring.png` | 32x32 | 32x32 | 1 | varian spring dari tiles/grass_flowers.png; format/indeks identik |
| `seasons/spring/edge_grass_dirt_spring.png` | 256x32 | 32x32 | 8 | varian spring dari tiles/edge_grass_dirt.png; format/indeks identik |
| `seasons/spring/edge_grass_sand_spring.png` | 256x32 | 32x32 | 8 | varian spring dari tiles/edge_grass_sand.png; format/indeks identik |
| `seasons/spring/autotile_water_grass_spring.png` | 256x384 | 32x32 | 94 | varian spring dari tiles/autotile_water_grass.png; format/indeks identik |
| `seasons/spring/autotile_path_grass_spring.png` | 256x192 | 32x32 | 47 | varian spring dari tiles/autotile_path_grass.png; format/indeks identik |
| `seasons/spring/tree_spring.png` | 32x64 | 32x64 | 1 | varian spring dari nature/tree.png; format/indeks identik |
| `seasons/spring/berry_bush_full_spring.png` | 32x32 | 32x32 | 1 | varian spring dari nature/berry_bush_full.png; format/indeks identik |
| `seasons/spring/berry_bush_empty_spring.png` | 32x32 | 32x32 | 1 | varian spring dari nature/berry_bush_empty.png; format/indeks identik |
| `seasons/summer/grass_summer.png` | 32x32 | 32x32 | 1 | varian summer dari tiles/grass.png; format/indeks identik |
| `seasons/summer/grass_flowers_summer.png` | 32x32 | 32x32 | 1 | varian summer dari tiles/grass_flowers.png; format/indeks identik |
| `seasons/summer/edge_grass_dirt_summer.png` | 256x32 | 32x32 | 8 | varian summer dari tiles/edge_grass_dirt.png; format/indeks identik |
| `seasons/summer/edge_grass_sand_summer.png` | 256x32 | 32x32 | 8 | varian summer dari tiles/edge_grass_sand.png; format/indeks identik |
| `seasons/summer/autotile_water_grass_summer.png` | 256x384 | 32x32 | 94 | varian summer dari tiles/autotile_water_grass.png; format/indeks identik |
| `seasons/summer/autotile_path_grass_summer.png` | 256x192 | 32x32 | 47 | varian summer dari tiles/autotile_path_grass.png; format/indeks identik |
| `seasons/summer/tree_summer.png` | 32x64 | 32x64 | 1 | varian summer dari nature/tree.png; format/indeks identik |
| `seasons/summer/berry_bush_full_summer.png` | 32x32 | 32x32 | 1 | varian summer dari nature/berry_bush_full.png; format/indeks identik |
| `seasons/summer/berry_bush_empty_summer.png` | 32x32 | 32x32 | 1 | varian summer dari nature/berry_bush_empty.png; format/indeks identik |
| `seasons/autumn/grass_autumn.png` | 32x32 | 32x32 | 1 | varian autumn dari tiles/grass.png; format/indeks identik |
| `seasons/autumn/grass_flowers_autumn.png` | 32x32 | 32x32 | 1 | varian autumn dari tiles/grass_flowers.png; format/indeks identik |
| `seasons/autumn/edge_grass_dirt_autumn.png` | 256x32 | 32x32 | 8 | varian autumn dari tiles/edge_grass_dirt.png; format/indeks identik |
| `seasons/autumn/edge_grass_sand_autumn.png` | 256x32 | 32x32 | 8 | varian autumn dari tiles/edge_grass_sand.png; format/indeks identik |
| `seasons/autumn/autotile_water_grass_autumn.png` | 256x384 | 32x32 | 94 | varian autumn dari tiles/autotile_water_grass.png; format/indeks identik |
| `seasons/autumn/autotile_path_grass_autumn.png` | 256x192 | 32x32 | 47 | varian autumn dari tiles/autotile_path_grass.png; format/indeks identik |
| `seasons/autumn/tree_autumn.png` | 32x64 | 32x64 | 1 | varian autumn dari nature/tree.png; format/indeks identik |
| `seasons/autumn/berry_bush_full_autumn.png` | 32x32 | 32x32 | 1 | varian autumn dari nature/berry_bush_full.png; format/indeks identik |
| `seasons/autumn/berry_bush_empty_autumn.png` | 32x32 | 32x32 | 1 | varian autumn dari nature/berry_bush_empty.png; format/indeks identik |
| `seasons/autumn/leaf_pile.png` | 32x32 | 32x32 | 1 | tumpukan daun dekor |
| `seasons/spring/grass_meadow_spring.png` | 32x32 | 32x32 | 1 | padang bunga, seamless |
| `seasons/summer/dirt_cracked_summer.png` | 32x32 | 32x32 | 1 | tanah retak kering (tidak seamless di garis retak tepi) |
| `effects/weather/rain_overlay.png` | 256x64 | 64x64 | 4 | tile 64x64 seamless, 4 frame loop ~80ms; ulangi menutupi layar |
| `effects/weather/snow_overlay.png` | 256x64 | 64x64 | 4 | tile 64x64 seamless, 4 frame ~200ms |
| `effects/weather/leaves_overlay.png` | 256x64 | 64x64 | 4 | tile 64x64 seamless daun gugur, 4 frame ~200ms |
| `effects/weather/heat_haze_overlay.png` | 256x64 | 64x64 | 4 | kilau panas, tile 64x64, 4 frame ~150ms; tambah heat_tint |
| `effects/weather/heat_tint.png` | 32x32 | 32x32 | 1 | overlay panas kering RGBA (255,200,110,40) |
| `effects/weather/rain_tint.png` | 32x32 | 32x32 | 1 | overlay mendung saat hujan |
| `effects/weather/frost_overlay.png` | 32x32 | 32x32 | 1 | embun beku tile 32x32 seamless |
| `effects/weather/frost_vignette.png` | 320x180 | 320x180 | 1 | stretch ke layar, dingin ekstrem |
| `effects/weather/particle_rain.png` | 32x8 | 8x8 | 4 | 0-1 tetes jatuh, 2-3 percikan |
| `effects/weather/particle_snow.png` | 24x8 | 8x8 | 3 | 3 ukuran kepingan |
| `effects/weather/particle_leaf.png` | 32x16 | 8x8 | 8 | 2 baris warna x 4 frame rotasi |
| `hazards/flood_tile.png` | 64x32 | 32x32 | 2 | genangan penuh semi-transparan, 2 frame ~500ms, seamless |
| `hazards/autotile_flood.png` | 256x384 | 32x32 | 94 | 47-blob (sama dengan tahap 2), luar transparan → overlay di atas tanah apa pun; baris 0-5 frame 0, 6-11 frame 1 |
| `hazards/puddle.png` | 64x32 | 32x32 | 2 | genangan kecil |
| `hazards/water_rise.png` | 128x128 | 32x32 | 16 | air naik di tepi sungai: baris = sisi asal air (N,E,S,W), kolom = level 0-3; overlay di atas tile tepi |
| `hazards/fire_small.png` | 192x32 | 32x32 | 6 | api kecil 6 frame ~100ms |
| `hazards/fire_large.png` | 384x64 | 64x64 | 6 | api besar 6 frame; tumpuk di atas bangunan 2x2, ulang untuk bangunan lebih besar |
| `hazards/smoke.png` | 128x32 | 32x32 | 4 | asap peringatan sebelum api (loop ~150ms); tampilkan 1-2 detik sebelum fire_* |
| `hazards/burnt/hut_burnt.png` | 64x64 | 64x64 | 1 | hangus; ukuran/anchor sama dengan buildings/hut.png |
| `hazards/burnt/warehouse_burnt.png` | 96x64 | 96x64 | 1 | hangus; ukuran/anchor sama dengan buildings/warehouse.png |
| `hazards/burnt/well_burnt.png` | 32x64 | 32x64 | 1 | hangus; ukuran/anchor sama dengan buildings/well.png |
| `hazards/burnt/mine_burnt.png` | 64x64 | 64x64 | 1 | hangus; ukuran/anchor sama dengan buildings/mine.png |
| `hazards/burnt/wooden_house_burnt.png` | 96x96 | 96x96 | 1 | hangus; ukuran/anchor sama dengan buildings/wooden_house.png |
| `hazards/burnt/kitchen_burnt.png` | 64x64 | 64x64 | 1 | hangus; ukuran/anchor sama dengan buildings/kitchen.png |
| `hazards/burnt/workshop_burnt.png` | 96x64 | 96x64 | 1 | hangus; ukuran/anchor sama dengan buildings/workshop.png |
| `hazards/burnt/granary_burnt.png` | 64x96 | 64x96 | 1 | hangus; ukuran/anchor sama dengan buildings/granary.png |
| `hazards/burnt/market_burnt.png` | 96x64 | 96x64 | 1 | hangus; ukuran/anchor sama dengan buildings/market.png |
| `hazards/burnt/town_hall_burnt.png` | 128x96 | 128x96 | 1 | hangus; ukuran/anchor sama dengan buildings/town_hall.png |
| `hazards/burnt/rubble_small.png` | 32x32 | 32x32 | 1 | puing; letakkan setelah bangunan dibersihkan |
| `hazards/burnt/rubble_large.png` | 64x64 | 64x64 | 1 | puing; letakkan setelah bangunan dibersihkan |
| `characters/animals/wolf_grey.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 diam, 4-7 jalan, 8-11 menyerang (frame 2 = gigitan); arah bawah,kiri,kanan,atas |
| `characters/animals/wolf_brown.png` | 128x384 | 32x32 | 48 | 12 baris x 4 kolom: 0-3 diam, 4-7 jalan, 8-11 menyerang (frame 2 = gigitan); arah bawah,kiri,kanan,atas |
| `characters/animals/paw_print.png` | 8x8 | 8x8 | 1 | jejak kaki tunggal 8x8 (atas = arah jalan), rotasi sesuai arah |
| `characters/animals/paw_trail.png` | 32x32 | 32x32 | 1 | jejak serigala menuju atas (decal tanah), fade setelah ~1 hari |
| `structures/fence_autotile.png` | 128x128 | 32x32 | 16 | 16-tile 4-bit: indeks = N1+E2+S4+W8 (tetangga pagar/gerbang); kolom = i%4, baris = i//4; indeks 0 = pagar 1-tile (tiang) |
| `structures/gate_h.png` | 64x32 | 32x32 | 2 | frame 0 tertutup, 1 terbuka; menyambung pagar kiri-kanan (E/W) |
| `structures/gate_v.png` | 64x32 | 32x32 | 2 | frame 0 tertutup, 1 terbuka; menyambung pagar atas-bawah (N/S) |
| `structures/watchtower.png` | 64x96 | 64x96 | 1 | 64x96 (alas 2x1 tile di baris bawah); bendera/obor kecil di kanan atas |
| `structures/torch_post.png` | 160x64 | 32x64 | 5 | obor tiang 32x64: frame 0-3 nyala (~120ms), frame 4 mati (berasap tipis); glow: effects/night/light_glow_small.png |
| `icons/status/status_injured.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_injured_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_sick.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_sick_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_cold.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_cold_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_sad.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_sad_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_thermometer_cold.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_thermometer_cold_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_thermometer_hot.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_thermometer_hot_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `icons/status/status_mourning.png` | 32x32 | 32x32 | 1 |  |
| `icons/status/status_mourning_16.png` | 16x16 | 16x16 | 1 | 16x16 (downscale + kuantisasi palet) |
| `ui/warning/banner_yellow.png` | 96x24 | 96x24 | 1 | 9-slice margin 8/4/8/5; teks gelap (kuning/oranye) atau putih (merah) |
| `ui/warning/warn_hunger_yellow.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat yellow |
| `ui/warning/warn_fire_yellow.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat yellow |
| `ui/warning/warn_howl_yellow.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat yellow |
| `ui/warning/warn_flood_yellow.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat yellow |
| `ui/warning/banner_orange.png` | 96x24 | 96x24 | 1 | 9-slice margin 8/4/8/5; teks gelap (kuning/oranye) atau putih (merah) |
| `ui/warning/warn_hunger_orange.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat orange |
| `ui/warning/warn_fire_orange.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat orange |
| `ui/warning/warn_howl_orange.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat orange |
| `ui/warning/warn_flood_orange.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat orange |
| `ui/warning/banner_red.png` | 96x24 | 96x24 | 1 | 9-slice margin 8/4/8/5; teks gelap (kuning/oranye) atau putih (merah) |
| `ui/warning/warn_hunger_red.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat red |
| `ui/warning/warn_fire_red.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat red |
| `ui/warning/warn_howl_red.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat red |
| `ui/warning/warn_flood_red.png` | 32x32 | 32x32 | 1 | peringatan dini tingkat red |
| `effects/mourning_overlay.png` | 32x32 | 32x32 | 1 | duka: overlay redup RGBA (70,70,90,70) selama 1 hari (opsional) |
| `effects/mourning_vignette.png` | 320x180 | 320x180 | 1 | bingkai redup lembut, stretch ke layar |
| `structures/graves/grave_stone_round.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/grave_cross_wood.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/grave_stone_flowers.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/grave_cairn.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/grave_mound_fresh.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/grave_stone_snow.png` | 32x32 | 32x32 | 1 | 32x32 |
| `structures/graves/graveyard_2x2.png` | 64x64 | 64x64 | 1 | contoh susunan makam 2x2 tile |

## Varian musim (`seasons/<spring|summer|autumn>/`)
Nama = `<file asli>_<musim>.png`, format/frame/indeks **identik** dengan aslinya (termasuk `autotile_water_grass_*` & `autotile_path_grass_*` 47-blob dan `edge_grass_*`). Musim `dingin` = aset tahap 2/3 (`tiles/winter`, `nature/winter`, `buildings/winter`). Peta musim game (`balance.js SEASONS`): semi→spring, panas→summer, gugur→autumn, dingin→winter. Tambahan: `grass_meadow_spring`, `dirt_cracked_summer`, `leaf_pile`. Semi: daun pohon tetap hijau + bunga sakura merah muda.

## Cuaca (`effects/weather/`)
- Overlay loop 64x64 seamless, 4 frame horizontal: `rain_overlay` (~80ms), `snow_overlay` (~200ms), `leaves_overlay` (~200ms), `heat_haze_overlay` (~150ms). Ubin-kan menutupi layar; bisa digeser (scroll) pelan untuk variasi.
- Tint tile 32x32: `rain_tint` (mendung), `heat_tint` (panas kering), `frost_overlay` (embun beku), `frost_vignette` 320x180 (stretch; dingin ekstrem).
- Partikel 8x8: `particle_rain` (0-1 tetes, 2-3 percikan), `particle_snow` (3 ukuran), `particle_leaf` (baris 0 oranye, 1 kuning; 4 frame rotasi).

## Banjir & kebakaran (`hazards/`)
- `flood_tile` 2 frame; `autotile_flood` 47-blob (indeks sama dengan `tiles/autotile_blob47.json`), luar transparan → overlay di atas tanah apa pun; frame 1 = indeks+47. `puddle` 2 frame.
- `water_rise` 128x128: baris = sisi datangnya air (0 N, 1 E, 2 S, 3 W), kolom = level 0-3 (makin tinggi). Overlay di tile darat yang bersebelahan dengan sungai.
- Urutan kebakaran: `smoke` (peringatan 1-2 dtk) → `fire_small` (32x32, 6f) → `fire_large` (64x64, 6f; ulang/tiling untuk bangunan >2x2) → `burnt/<bangunan>_burnt.png` (ukuran/anchor = asli) → setelah dibersihkan `rubble_small/large`.

## Hewan buas (`characters/animals/`)
`wolf_grey.png`, `wolf_brown.png`: 128x384, frame 32x32, 4 kolom x 12 baris. Baris 0-3 diam, 4-7 jalan, 8-11 menyerang; tiap kelompok bawah, kiri, kanan, atas. Serangan: frame 2 = gigit (kilat kecil), ~120ms/frame. `paw_print` 8x8 (atas = arah jalan; rotasi), `paw_trail` 32x32 (menuju atas).

## Pertahanan (`structures/`)
- `fence_autotile.png` 128x128, 16 tile 4-bit: **indeks = N·1 + E·2 + S·4 + W·8** (tetangga yang pagar/gerbang), kolom = i%4, baris = i//4. Indeks 0 = pagar 1-tile (tiang).
- `gate_h.png` / `gate_v.png`: 64x32, frame 0 tertutup, 1 terbuka. gate_h tersambung ke pagar E/W, gate_v ke N/S (hitung gerbang sebagai tetangga pagar).
- `watchtower.png` 64x96 (alas 2 tile di baris bawah). `torch_post.png` 160x64, frame 32x64: 0-3 nyala, 4 mati.
- Makam `structures/graves/`: grave_stone_round, grave_cross_wood, grave_stone_flowers, grave_cairn, grave_mound_fresh, grave_stone_snow (32x32), `graveyard_2x2` (contoh 64x64).

## Ikon status & peringatan
- `icons/status/status_<n>.png` 32x32 + `status_<n>_16.png` 16x16: injured (terluka), sick (sakit), cold (kedinginan), sad (sedih), thermometer_cold (dingin ekstrem/peringatan malam), thermometer_hot (panas kering), mourning (duka).
- Peringatan dini `ui/warning/`: `warn_<hunger|fire|howl|flood>_<yellow|orange|red>.png` 32x32 (segitiga; merah + tanda seru). `banner_<yellow|orange|red>.png` 96x24, 9-slice margin kiri 8, atas 4, kanan 8, bawah 5; teks gelap di kuning/oranye, putih di merah. Tingkat: kuning = waspada, oranye = segera, merah = kritis/sedang terjadi.
- Duka (opsional): `effects/mourning_overlay.png` (RGBA 70,70,90,70; tile) dan `effects/mourning_vignette.png` 320x180 selama 1 hari.

## Keterbatasan tahap 4
- Varian musim dibuat dengan recolor palet; bentuk sama dengan musim semula (tidak ada pohon gugur gundul sebagian). Tanaman/ladang & bangunan tidak punya varian musim selain dingin.
- `dirt_cracked_summer` tidak 100% seamless di garis retak.
- Hewan buas hanya serigala (2 warna); tidak ada animasi mati/kabur. Arah atas tanpa ekor jelas.
- Api besar 64x64 perlu diulang untuk bangunan besar; tidak ada animasi transisi bangunan → hangus.
- Ikon 16x16 hasil downscale + kuantisasi palet: detail kecil (mata, tetesan) bisa hilang.
- `water_rise` hanya sisi lurus (tanpa sudut); gunakan bersama autotile_flood untuk area luas.

---
# Stockpile (tahap 5)
Sprite tumpukan sumber daya yang terlihat di peta. Semua **32x32** (1 tile, konsisten untuk keempat jenis), 1 frame, anchor tengah-bawah (alas/bayangan di y≈24-30; gambar dengan dasar sejajar bawah tile), bayangan oval sama seperti aset lain. Versi `_winter` ukuran/anchor identik (salju di permukaan atas). Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview_stockpiles.py`. Preview: `preview_stockpiles.png` (kiri normal, kanan dingin; baris kayu, batu, makanan, air; kolom tingkat 0-4). Manifest: `stage: 5`.

| Sumber daya | File | Tingkat 0 → 4 |
|---|---|---|
| kayu | `stockpiles/stockpile_kayu_<0-4>[_winter].png` | palet kosong → 1, 3, 6, 10 gelondong bertingkat (patok penahan mulai tingkat 2) |
| batu | `stockpiles/stockpile_batu_<0-4>[_winter].png` | alas tanah → 1, 3, 6, 10 batu bertumpuk |
| makanan | `stockpiles/stockpile_makanan_<0-4>[_winter].png` | palet kosong → 1 keranjang, 2 keranjang, peti+2 keranjang, 3 peti penuh |
| air | `stockpiles/stockpile_air_<0-4>[_winter].png` | alas batu → 1, 2, 3, 5 tong (+kendi kecil di tingkat 1-3) |

Saran pemetaan tingkat: `lv = stok==0 ? 0 : min(4, 1 + floor(3 * stok / kapasitas))` (atau ambang tetap per sumber daya).

| File | Ukuran | Catatan |
|---|---|---|
| `stockpiles/stockpile_kayu_0.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 0/4 (kosong/alas); anchor tengah-bawah |
| `stockpiles/stockpile_kayu_0_winter.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 0/4 (kosong/alas); bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_kayu_1.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 1/4; anchor tengah-bawah |
| `stockpiles/stockpile_kayu_1_winter.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 1/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_kayu_2.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 2/4; anchor tengah-bawah |
| `stockpiles/stockpile_kayu_2_winter.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 2/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_kayu_3.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 3/4; anchor tengah-bawah |
| `stockpiles/stockpile_kayu_3_winter.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 3/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_kayu_4.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 4/4; anchor tengah-bawah |
| `stockpiles/stockpile_kayu_4_winter.png` | 32x32 | tumpukan kayu gelondong di atas palet; tingkat 4/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_batu_0.png` | 32x32 | tumpukan batu di alas tanah; tingkat 0/4 (kosong/alas); anchor tengah-bawah |
| `stockpiles/stockpile_batu_0_winter.png` | 32x32 | tumpukan batu di alas tanah; tingkat 0/4 (kosong/alas); bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_batu_1.png` | 32x32 | tumpukan batu di alas tanah; tingkat 1/4; anchor tengah-bawah |
| `stockpiles/stockpile_batu_1_winter.png` | 32x32 | tumpukan batu di alas tanah; tingkat 1/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_batu_2.png` | 32x32 | tumpukan batu di alas tanah; tingkat 2/4; anchor tengah-bawah |
| `stockpiles/stockpile_batu_2_winter.png` | 32x32 | tumpukan batu di alas tanah; tingkat 2/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_batu_3.png` | 32x32 | tumpukan batu di alas tanah; tingkat 3/4; anchor tengah-bawah |
| `stockpiles/stockpile_batu_3_winter.png` | 32x32 | tumpukan batu di alas tanah; tingkat 3/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_batu_4.png` | 32x32 | tumpukan batu di alas tanah; tingkat 4/4; anchor tengah-bawah |
| `stockpiles/stockpile_batu_4_winter.png` | 32x32 | tumpukan batu di alas tanah; tingkat 4/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_makanan_0.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 0/4 (kosong/alas); anchor tengah-bawah |
| `stockpiles/stockpile_makanan_0_winter.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 0/4 (kosong/alas); bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_makanan_1.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 1/4; anchor tengah-bawah |
| `stockpiles/stockpile_makanan_1_winter.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 1/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_makanan_2.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 2/4; anchor tengah-bawah |
| `stockpiles/stockpile_makanan_2_winter.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 2/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_makanan_3.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 3/4; anchor tengah-bawah |
| `stockpiles/stockpile_makanan_3_winter.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 3/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_makanan_4.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 4/4; anchor tengah-bawah |
| `stockpiles/stockpile_makanan_4_winter.png` | 32x32 | keranjang lalu peti makanan di palet; tingkat 4/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_air_0.png` | 32x32 | tong/gentong air di alas batu; tingkat 0/4 (kosong/alas); anchor tengah-bawah |
| `stockpiles/stockpile_air_0_winter.png` | 32x32 | tong/gentong air di alas batu; tingkat 0/4 (kosong/alas); bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_air_1.png` | 32x32 | tong/gentong air di alas batu; tingkat 1/4; anchor tengah-bawah |
| `stockpiles/stockpile_air_1_winter.png` | 32x32 | tong/gentong air di alas batu; tingkat 1/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_air_2.png` | 32x32 | tong/gentong air di alas batu; tingkat 2/4; anchor tengah-bawah |
| `stockpiles/stockpile_air_2_winter.png` | 32x32 | tong/gentong air di alas batu; tingkat 2/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_air_3.png` | 32x32 | tong/gentong air di alas batu; tingkat 3/4; anchor tengah-bawah |
| `stockpiles/stockpile_air_3_winter.png` | 32x32 | tong/gentong air di alas batu; tingkat 3/4; bersalju, ukuran/anchor sama |
| `stockpiles/stockpile_air_4.png` | 32x32 | tong/gentong air di alas batu; tingkat 4/4; anchor tengah-bawah |
| `stockpiles/stockpile_air_4_winter.png` | 32x32 | tong/gentong air di alas batu; tingkat 4/4; bersalju, ukuran/anchor sama |

Keterbatasan: tingkat 4 mengisi hampir seluruh tile 32x32 (puncak kayu/batu menyentuh y≈4), tidak ada versi 64x32; tidak ada varian semi/panas/gugur (cukup versi normal); tidak animasi.

---
# Siklus hidup, tidur & rumah (tahap 6)
Hanya file baru (file lama dicek md5). Anchor semua karakter = `villager_N.png` (frame 32x32, kaki y≈29, bayangan oval y≈27-31). Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview_lifecycle.py`. Preview: `preview_lifecycle.png`. Manifest: `stage: 6`.

## Format
| File | Ukuran | Frame | Isi |
|---|---|---|---|
| `characters/lifecycle/baby_<1-4>.png` | 64x32 | 32x32 ×2 | bayi bedong diam, napas ~500ms |
| `characters/lifecycle/cradle.png` / `cradle_empty.png` | 64x32 | 32x32 ×2 | buaian berisi/kosong, ayun ~400ms |
| `characters/lifecycle/baby_carried_overlay.png` | 128x32 | 32x32 ×4 | kolom = arah bawah, kiri, kanan, atas; tempel di (0,0) frame villager mana pun; saat jalan geser y −1 di frame 1 & 3 |
| `characters/lifecycle/villager_<1-4>_holding_baby.png` | 128x256 | 32x32 | format villager_N.png (baris 0-3 diam, 4-7 jalan; bawah, kiri, kanan, atas) sudah menggendong bayi |
| `characters/lifecycle/child_<1-4>.png` | 128x256 | 32x32 | anak, format villager_N.png; tinggi ≈23px (kepala mulai y≈7). Jalan ~110ms/frame |
| `characters/lifecycle/elder_<1-4>.png` | 128x256 | 32x32 | lansia, format villager_N.png; rambut abu/putih, bungkuk, tongkat (kiri/kanan/bawah). **Saran: jalan 180ms/frame (dewasa 120ms), kecepatan gerak 0.7×**, diam 400ms |
| `icons/status/icon_zzz_anim.png` | 64x16 | 16x16 ×4 | Zzz, ~300ms loop |
| `icons/status/icon_heart_pulse.png` | 64x16 | 16x16 ×4 | hati pasangan; denyut 150ms/frame, tahan frame 0 ~600ms |
| `buildings/night/hut_night_off.png`, `wooden_house_night_off.png` | = asli | 1 | malam lampu mati (jendela gelap); tetap gambar night_overlay di atasnya |
| `buildings/winter/hut_night_off_winter.png`, `wooden_house_night_off_winter.png` | = asli | 1 | lampu mati + salju |
| `buildings/hut_door.png` (+`_winter`) | 192x64 | 64x64 ×3 | pintu 0 tertutup, 1 setengah, 2 terbuka |
| `buildings/wooden_house_door.png` (+`_winter`) | 288x96 | 96x96 ×3 | sama; ~100ms/frame, balik untuk menutup |

Sudah ada sebelumnya (tidak diduplikasi): lampu menyala `buildings/night/hut_night.png`, `wooden_house_night.png`, versi salju menyala `buildings/winter/*_night_winter.png`.

## Offset ikon di atas kepala (relatif kiri-atas frame penduduk 32x32)
| Ikon | Dewasa | Anak | Lansia | Bayi |
|---|---|---|---|---|
| Zzz 16x16 (pojok kanan atas kepala) | (+16, −12) | (+16, −8) | (+16, −11) | (+14, +2) |
| Hati 16x16 (tengah atas kepala) | (+8, −14) | (+8, −10) | (+8, −13) | (+8, 0) |

Saat penduduk jalan, ikuti bob frame 1 & 3 (y −1). Pintu: posisi pintu hut x 28-36, y 42-56; wooden_house x 42-54, y 64-88 (dalam frame) — titik masuk penduduk = tengah bawah pintu.

## Daftar file
| File | Ukuran | Catatan |
|---|---|---|
| `characters/lifecycle/baby_1.png` | 64x32 | bayi diam (bedong), 2 frame napas ~500ms; kaki/alas y≈29 |
| `characters/lifecycle/baby_2.png` | 64x32 | bayi diam (bedong), 2 frame napas ~500ms; kaki/alas y≈29 |
| `characters/lifecycle/baby_3.png` | 64x32 | bayi diam (bedong), 2 frame napas ~500ms; kaki/alas y≈29 |
| `characters/lifecycle/baby_4.png` | 64x32 | bayi diam (bedong), 2 frame napas ~500ms; kaki/alas y≈29 |
| `characters/lifecycle/baby_carried_overlay.png` | 128x32 | tempel di atas frame villager_N (posisi 0,0 frame); kolom = arah bawah,kiri,kanan,atas; saat jalan geser y -1 pada frame 1 & 3 |
| `characters/lifecycle/villager_1_holding_baby.png` | 128x256 | format villager_N.png (0-3 diam, 4-7 jalan) sambil menggendong bayi |
| `characters/lifecycle/villager_2_holding_baby.png` | 128x256 | format villager_N.png (0-3 diam, 4-7 jalan) sambil menggendong bayi |
| `characters/lifecycle/villager_3_holding_baby.png` | 128x256 | format villager_N.png (0-3 diam, 4-7 jalan) sambil menggendong bayi |
| `characters/lifecycle/villager_4_holding_baby.png` | 128x256 | format villager_N.png (0-3 diam, 4-7 jalan) sambil menggendong bayi |
| `characters/lifecycle/cradle.png` | 64x32 | buaian berisi bayi, 2 frame ayun ~400ms |
| `characters/lifecycle/cradle_empty.png` | 64x32 | buaian kosong, 2 frame ayun ~400ms |
| `characters/lifecycle/child_1.png` | 128x256 | anak: format villager_N.png, tinggi ≈23px (kepala mulai y≈7), kaki y≈29 |
| `characters/lifecycle/child_2.png` | 128x256 | anak: format villager_N.png, tinggi ≈23px (kepala mulai y≈7), kaki y≈29 |
| `characters/lifecycle/child_3.png` | 128x256 | anak: format villager_N.png, tinggi ≈23px (kepala mulai y≈7), kaki y≈29 |
| `characters/lifecycle/child_4.png` | 128x256 | anak: format villager_N.png, tinggi ≈23px (kepala mulai y≈7), kaki y≈29 |
| `characters/lifecycle/elder_1.png` | 128x256 | lansia: format villager_N.png, rambut abu/putih, bungkuk 1px, tongkat; jalan ~180ms/frame & kecepatan 0.7x |
| `characters/lifecycle/elder_2.png` | 128x256 | lansia: format villager_N.png, rambut abu/putih, bungkuk 1px, tongkat; jalan ~180ms/frame & kecepatan 0.7x |
| `characters/lifecycle/elder_3.png` | 128x256 | lansia: format villager_N.png, rambut abu/putih, bungkuk 1px, tongkat; jalan ~180ms/frame & kecepatan 0.7x |
| `characters/lifecycle/elder_4.png` | 128x256 | lansia: format villager_N.png, rambut abu/putih, bungkuk 1px, tongkat; jalan ~180ms/frame & kecepatan 0.7x |
| `icons/status/icon_zzz_anim.png` | 64x16 | Zzz tidur, 4 frame ~300ms loop; tempel di (x+16, y-12) relatif kiri-atas frame penduduk 32x32 (sudut kanan atas kepala) |
| `icons/status/icon_heart_pulse.png` | 64x16 | hati pasangan, denyut 4 frame ~150ms (jeda 600ms di frame 0); tempel di (x+8, y-14) = tengah di atas kepala |
| `buildings/night/wooden_house_night_off.png` | 96x96 | malam lampu mati (penghuni tidur/kosong); ukuran/anchor = buildings/wooden_house.png; tetap pakai night_overlay di atasnya |
| `buildings/winter/wooden_house_night_off_winter.png` | 96x96 | malam lampu mati + salju |
| `buildings/wooden_house_door.png` | 288x96 | pintu: 0 tertutup, 1 setengah, 2 terbuka (~100ms/frame; balik urutan untuk menutup); frame = ukuran/anchor wooden_house.png |
| `buildings/wooden_house_door_winter.png` | 288x96 | pintu: 0 tertutup, 1 setengah, 2 terbuka (~100ms/frame; balik urutan untuk menutup); frame = ukuran/anchor wooden_house.png (versi salju) |
| `buildings/night/hut_night_off.png` | 64x64 | malam lampu mati (penghuni tidur/kosong); ukuran/anchor = buildings/hut.png; tetap pakai night_overlay di atasnya |
| `buildings/winter/hut_night_off_winter.png` | 64x64 | malam lampu mati + salju |
| `buildings/hut_door.png` | 192x64 | pintu: 0 tertutup, 1 setengah, 2 terbuka (~100ms/frame; balik urutan untuk menutup); frame = ukuran/anchor hut.png |
| `buildings/hut_door_winter.png` | 192x64 | pintu: 0 tertutup, 1 setengah, 2 terbuka (~100ms/frame; balik urutan untuk menutup); frame = ukuran/anchor hut.png (versi salju) |

Keterbatasan: anak & lansia diturunkan dari rig dewasa (anak = baris badan dipadatkan, lansia = kepala digeser + tongkat), jadi proporsi mirip; bayi tidak berjalan; overlay gendong memakai satu warna bedong (biru) untuk semua penduduk (warna sama dengan baju villager_2); arah atas bayi hanya terlihat sebagian di bahu; tidak ada animasi tidur di kasur (pakai Zzz + sembunyikan sprite di dalam rumah); pintu hanya untuk hut & wooden_house.
