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

---
# Tahap 7 — Desa Mandiri bernuansa Indonesia (tropis)
Mengikuti `docs/RISET-INDONESIA.md` §6. Hanya file baru; file lama tidak berubah (md5). Palet ditambah warna tropis (tidak memengaruhi output lama). Regenerasi: `cd tools && python3 generate_assets.py && python3 make_preview_stage7.py`. Preview: `preview_stage7.png` (daftar aset + scene desa tropis 2x + mini-scene musim hujan, mareng, kemarau, labuh, dan malam). Manifest: `stage: 7`.

> **Salju tidak dipakai lagi.** File salju/winter (`tiles/winter/`, `nature/winter/`, `buildings/winter/`, `*_winter.png` stockpile/pintu/lampu, `autotile_ice_snow`, `autotile_path_snow`, `snow_overlay`, `particle_snow`, `frost_*`, `ach_survive_winter`, status `cold`/`thermometer_cold`) **tidak dihapus** tetapi sudah usang (deprecated). Musim keras = **kemarau**. Musim lama semi/panas/gugur juga digantikan musim tropis di bawah.

## Musim tropis (`seasons/tropis/<hujan|mareng|kemarau|labuh>/`)
Nama `<nama_asli>_<musim>.png`, format/frame/indeks **identik** dengan aslinya: grass, grass_flowers, dirt, edge_grass_dirt, edge_grass_sand, autotile_water_grass (47-blob, 2 frame), autotile_path_grass, tree, berry_bush_full/empty, dan pohon tropis mangga, rambutan, jati, beringin, pisang, bambu, bush_tropis.
- hujan: hijau pekat basah + genangan di rumput. mareng: rumput kuning-hijau (padi menguning → pakai `crop_padi` frame 4). kemarau: cokelat, tanah/rumput retak, daun kusam (+ `dust_overlay`, `kemarau_tint`). labuh: hijau muda segar (+ `cloud_shadow_overlay`).
- Pohon tropis tanpa nama di daftar (kelapa, kamboja, kembang sepatu) dipakai sama di semua musim.

## Efek cuaca baru (`effects/weather/`)
`rain_heavy_overlay` (64x64×4, ~60ms) + `rain_tint`; `lightning_flash` (tile putih, tampilkan 60ms lalu fade) + `lightning_bolt` 32x96×3 (ujung bawah = titik sambar); `dust_overlay` 64x64×4, `particle_dust` 8x8×4, `kemarau_tint`; `cloud_shadow_overlay` 128x128 seamless (geser pelan).

## Flora (`nature/tropis/`, `nature/crops/`, `tiles/tropis/`)
- Pohon 32x64 (anchor tengah-bawah, alas di 32px bawah): kelapa (+`_empty`), pisang (+`_empty`), bambu, jati, mangga (+`_empty`), rambutan (+`_empty`), kamboja. Beringin 64x64 (2x2). Perdu 32x32: bush_tropis, bush_kembang_sepatu. Versi berbuah = nama tanpa sufiks; tidak berbuah = `_empty`.
- Tanaman 192x32, 6 frame (format crop_wheat): `crop_singkong`, `crop_jagung`, `crop_ubi`, `crop_kopi` — 0 diolah, 1 bibit, 2 tunas, 3 tumbuh, 4 siap panen, 5 dipanen.
- **Sawah**: `tiles/tropis/sawah_autotile.png` 16-tile 4-bit (indeks = N1+E2+S4+W8, tetangga yang juga sawah; pematang tergambar di sisi yang tidak tersambung). `crop_padi.png` = **overlay transparan** di atas tile sawah: 0 tergenang, 1 bibit, 2 tumbuh, 3 bunting, 4 menguning (panen), 5 dipanen. `sawah_water_anim.png` 2 frame kilau (opsional, tile penuh).
- **Sawah bertingkat**: `sawah_terrace_riser.png` 96x32 (ujung kiri, tengah, ujung kanan); dinding undakan setinggi 15px di bagian atas frame — gambar di tile baris bawah sebuah petak atas, setelah tile sawah & sebelum tanaman.

## Fauna (`characters/fauna/`)
Format seperti serigala: 4 kolom (frame), baris = mode*4 + arah (arah: bawah, kiri, kanan, atas). Anchor tengah-bawah, bayangan oval.

| File | Frame | Mode (baris) |
|---|---|---|
| ayam, bebek | 32x32 | diam 0-3 (frame 2 = mematuk), jalan 4-7 |
| kambing, rusa | 32x32 | diam 0-3, jalan 4-7 |
| sapi, kerbau | 64x64 | diam 0-3, jalan 4-7 |
| babi_hutan, monyet, ular | 32x32 | diam 0-3, jalan 4-7, serang 8-11 (frame 2 = kena; monyet = sambar/curi) |
| macan_tutul (macan tutul jawa) | 64x64 | diam 0-3, jalan 4-7, serang 8-11 |

Saran timing: jalan 120ms (ternak besar 160ms, ular 100ms), diam 300-400ms, serang 100ms.

Ambien (`characters/fauna/ambient/`): `burung_pipit_terbang` 16x16×4 (hadap kanan, flip untuk kiri), `bangau` 32x32×4 (0 berdiri, 1 mematuk, 2-3 terbang), `kupu_kupu` 16x16, 2 baris warna × 4 frame, `ikan_lompat` 32x32×6 (tempel di tile air), `kunang_kunang` 8x8×4 (malam, gambar setelah night_overlay; blend additive).

## Bangunan & struktur lokal
| File | Ukuran | Catatan |
|---|---|---|
| `buildings/tropis/rumah_panggung.png` (+`night/rumah_panggung_night.png`, `_night_off`) | 96x96 | rumah panggung genteng, tangga |
| `buildings/tropis/gubuk_bambu.png` (+`night/..._night`, `_night_off`) | 64x64 | gubuk bambu atap ijuk |
| `buildings/tropis/lumbung_padi.png` | 64x96 | lumbung padi panggung |
| `buildings/tropis/kandang.png` | 96x64 | kandang ternak |
| `buildings/tropis/pos_ronda.png` (+`night/pos_ronda_night.png`) | 192x64, frame 64x64 ×3 | pos ronda + kentongan; frame 0 diam, 1-2 kentongan dipukul (pengganti menara jaga) |
| `buildings/tropis/embung.png` | 96x64 | kolam tampung air |
| `structures/tropis/kentongan.png` | 96x64, frame 32x64 ×3 | kentongan berdiri sendiri; 0 diam, 1 pukul, 2 ayun |
| `structures/tropis/pagar_bambu_autotile.png` | 128x128 | 16-tile 4-bit seperti fence_autotile (indeks 0 = pagar 1-tile); gerbang pakai `structures/gate_*` |
| `structures/tropis/tanggul_autotile.png` | 128x128 | tanggul tanah/karung 16-tile 4-bit |
| `structures/tropis/orang_orangan_sawah.png` | 64x64, frame 32x64 ×2 | goyang ~500ms |
| `structures/tropis/obor_bambu.png` | 160x64, frame 32x64 ×5 | 0-3 nyala, 4 mati |

## Daftar file tahap 7
| File | Ukuran | Frame | Jumlah | Catatan |
|---|---|---|---|---|
| `nature/tropis/tree_kelapa.png` | 32x64 | 32x64 | 1 | 32x64 anchor bawah; berbuah |
| `nature/tropis/tree_kelapa_empty.png` | 32x64 | 32x64 | 1 | 32x64 tanpa buah |
| `nature/tropis/tree_pisang.png` | 32x64 | 32x64 | 1 | 32x64 berbuah (tandan) |
| `nature/tropis/tree_pisang_empty.png` | 32x64 | 32x64 | 1 | 32x64 |
| `nature/tropis/bambu.png` | 32x64 | 32x64 | 1 | rumpun bambu 32x64 |
| `nature/tropis/tree_jati.png` | 32x64 | 32x64 | 1 | 32x64 |
| `nature/tropis/tree_beringin.png` | 64x64 | 64x64 | 1 | 64x64 (2x2 tile), akar gantung |
| `nature/tropis/tree_mangga.png` | 32x64 | 32x64 | 1 | 32x64 berbuah |
| `nature/tropis/tree_mangga_empty.png` | 32x64 | 32x64 | 1 | 32x64 |
| `nature/tropis/tree_rambutan.png` | 32x64 | 32x64 | 1 | 32x64 berbuah |
| `nature/tropis/tree_rambutan_empty.png` | 32x64 | 32x64 | 1 | 32x64 |
| `nature/tropis/bush_tropis.png` | 32x32 | 32x32 | 1 | perdu tropis 32x32 |
| `nature/tropis/bush_kembang_sepatu.png` | 32x32 | 32x32 | 1 | bunga sepatu 32x32 |
| `nature/tropis/tree_kamboja.png` | 32x64 | 32x64 | 1 | kamboja 32x64 |
| `nature/crops/crop_padi.png` | 192x32 | 32x32 | 6 | OVERLAY tanaman padi di atas tiles/tropis/sawah_autotile: 0 tergenang (diolah), 1 bibit, 2 tumbuh, 3 bunting, 4 menguning (panen), 5 dipanen (jerami) |
| `tiles/tropis/sawah_autotile.png` | 128x128 | 32x32 | 16 | sawah tergenang + pematang; 16-tile 4-bit: indeks = N1+E2+S4+W8 (tetangga yang juga sawah, sisi tanpa pematang); kolom i%4, baris i//4; indeks 0 = petak tunggal |
| `tiles/tropis/sawah_water_anim.png` | 64x32 | 32x32 | 2 | kilau air tile sawah penuh (indeks 15), 2 frame ~600ms (opsional) |
| `nature/crops/crop_singkong.png` | 192x32 | 32x32 | 6 | urutan: diolah, bibit, tunas, tumbuh, siap panen, sudah dipanen |
| `nature/crops/crop_jagung.png` | 192x32 | 32x32 | 6 | urutan: diolah, bibit, tunas, tumbuh, siap panen, sudah dipanen |
| `nature/crops/crop_kopi.png` | 192x32 | 32x32 | 6 | urutan: diolah, bibit, tunas, tumbuh, siap panen, sudah dipanen (kopi: tanaman tetap, panen = buah merah) |
| `nature/crops/crop_ubi.png` | 192x32 | 32x32 | 6 | ubi jalar; urutan: diolah, bibit, tunas, tumbuh, siap panen (umbi terlihat), sudah dipanen |
| `tiles/tropis/sawah_terrace_riser.png` | 96x32 | 32x32 | 3 | dinding undakan sawah bertingkat (tinggi 15px di atas tile, sisa transparan): ujung kiri, tengah, ujung kanan; taruh di baris tile tepat di bawah petak sawah atas, menimpa bagian atas tile sawah bawah |
| `characters/fauna/kambing.png` | 128x256 | 32x32 | 32 | 32x32/frame, 4 kolom; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/sapi.png` | 256x512 | 64x64 | 32 | 64x64/frame, 4 kolom; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/kerbau.png` | 256x512 | 64x64 | 32 | 64x64/frame, 4 kolom; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/rusa.png` | 128x256 | 32x32 | 32 | 32x32/frame, 4 kolom; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/babi_hutan.png` | 128x384 | 32x32 | 48 | 32x32/frame, 4 kolom; baris 0-3 diam, 4-7 jalan, 8-11 serang (frame 2 = kena); arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/monyet.png` | 128x384 | 32x32 | 48 | 32x32; baris 0-3 diam, 4-7 jalan, 8-11 serang/mencuri (frame 2 = sambar pisang); arah bawah,kiri,kanan,atas |
| `characters/fauna/macan_tutul.png` | 256x768 | 64x64 | 48 | 64x64/frame, 4 kolom; baris 0-3 diam, 4-7 jalan, 8-11 serang (frame 2 = kena); arah bawah,kiri,kanan,atas; anchor tengah-bawah |
| `characters/fauna/ayam.png` | 128x256 | 32x32 | 32 | 32x32; baris 0-3 diam (frame 2 = mematuk), 4-7 jalan; arah bawah,kiri,kanan,atas |
| `characters/fauna/bebek.png` | 128x256 | 32x32 | 32 | 32x32; baris 0-3 diam (frame 2 = mematuk), 4-7 jalan; arah bawah,kiri,kanan,atas |
| `characters/fauna/ular.png` | 128x384 | 32x32 | 48 | 32x32; baris 0-3 diam (lidah), 4-7 merayap, 8-11 serang (kepala terangkat); arah bawah,kiri,kanan,atas |
| `characters/fauna/ambient/burung_pipit_terbang.png` | 64x16 | 16x16 | 4 | burung pipit terbang (menghadap kanan; flip untuk kiri), 4 frame ~90ms |
| `characters/fauna/ambient/bangau.png` | 128x32 | 32x32 | 4 | bangau (menghadap kanan): 0 berdiri, 1 mematuk (di sawah), 2-3 terbang kepak ~150ms |
| `characters/fauna/ambient/kupu_kupu.png` | 64x32 | 16x16 | 8 | 2 baris warna (oranye, biru) x 4 frame kepak ~100ms |
| `characters/fauna/ambient/ikan_lompat.png` | 192x32 | 32x32 | 6 | ikan melompat di sungai (tile air): 0 riak, 1-4 lompat (kiri→kanan), 5 cipratan; ~90ms; tempel di tile air |
| `characters/fauna/ambient/kunang_kunang.png` | 32x8 | 8x8 | 4 | kunang-kunang malam: kedip 4 frame ~200ms; gambar setelah night_overlay (additive) + light_glow_small skala 0.25 opsional |
| `seasons/tropis/hujan/grass_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan tiles/grass.png |
| `seasons/tropis/hujan/grass_flowers_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan tiles/grass_flowers.png |
| `seasons/tropis/hujan/dirt_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan tiles/dirt.png |
| `seasons/tropis/hujan/edge_grass_dirt_hujan.png` | 256x32 | 32x32 | 8 | musim hujan; format/indeks identik dengan tiles/edge_grass_dirt.png |
| `seasons/tropis/hujan/edge_grass_sand_hujan.png` | 256x32 | 32x32 | 8 | musim hujan; format/indeks identik dengan tiles/edge_grass_sand.png |
| `seasons/tropis/hujan/autotile_water_grass_hujan.png` | 256x384 | 32x32 | 94 | musim hujan; format/indeks identik dengan tiles/autotile_water_grass.png |
| `seasons/tropis/hujan/autotile_path_grass_hujan.png` | 256x192 | 32x32 | 47 | musim hujan; format/indeks identik dengan tiles/autotile_path_grass.png |
| `seasons/tropis/hujan/tree_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tree.png |
| `seasons/tropis/hujan/berry_bush_full_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan nature/berry_bush_full.png |
| `seasons/tropis/hujan/berry_bush_empty_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan nature/berry_bush_empty.png |
| `seasons/tropis/hujan/tree_mangga_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/tree_mangga.png |
| `seasons/tropis/hujan/tree_rambutan_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/tree_rambutan.png |
| `seasons/tropis/hujan/tree_jati_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/tree_jati.png |
| `seasons/tropis/hujan/bush_tropis_hujan.png` | 32x32 | 32x32 | 1 | musim hujan; format/indeks identik dengan nature/tropis/bush_tropis.png |
| `seasons/tropis/hujan/tree_beringin_hujan.png` | 64x64 | 64x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/tree_beringin.png |
| `seasons/tropis/hujan/tree_pisang_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/tree_pisang.png |
| `seasons/tropis/hujan/bambu_hujan.png` | 32x64 | 32x64 | 1 | musim hujan; format/indeks identik dengan nature/tropis/bambu.png |
| `seasons/tropis/mareng/grass_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan tiles/grass.png |
| `seasons/tropis/mareng/grass_flowers_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan tiles/grass_flowers.png |
| `seasons/tropis/mareng/dirt_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan tiles/dirt.png |
| `seasons/tropis/mareng/edge_grass_dirt_mareng.png` | 256x32 | 32x32 | 8 | musim mareng; format/indeks identik dengan tiles/edge_grass_dirt.png |
| `seasons/tropis/mareng/edge_grass_sand_mareng.png` | 256x32 | 32x32 | 8 | musim mareng; format/indeks identik dengan tiles/edge_grass_sand.png |
| `seasons/tropis/mareng/autotile_water_grass_mareng.png` | 256x384 | 32x32 | 94 | musim mareng; format/indeks identik dengan tiles/autotile_water_grass.png |
| `seasons/tropis/mareng/autotile_path_grass_mareng.png` | 256x192 | 32x32 | 47 | musim mareng; format/indeks identik dengan tiles/autotile_path_grass.png |
| `seasons/tropis/mareng/tree_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tree.png |
| `seasons/tropis/mareng/berry_bush_full_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan nature/berry_bush_full.png |
| `seasons/tropis/mareng/berry_bush_empty_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan nature/berry_bush_empty.png |
| `seasons/tropis/mareng/tree_mangga_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/tree_mangga.png |
| `seasons/tropis/mareng/tree_rambutan_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/tree_rambutan.png |
| `seasons/tropis/mareng/tree_jati_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/tree_jati.png |
| `seasons/tropis/mareng/bush_tropis_mareng.png` | 32x32 | 32x32 | 1 | musim mareng; format/indeks identik dengan nature/tropis/bush_tropis.png |
| `seasons/tropis/mareng/tree_beringin_mareng.png` | 64x64 | 64x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/tree_beringin.png |
| `seasons/tropis/mareng/tree_pisang_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/tree_pisang.png |
| `seasons/tropis/mareng/bambu_mareng.png` | 32x64 | 32x64 | 1 | musim mareng; format/indeks identik dengan nature/tropis/bambu.png |
| `seasons/tropis/kemarau/grass_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan tiles/grass.png |
| `seasons/tropis/kemarau/grass_flowers_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan tiles/grass_flowers.png |
| `seasons/tropis/kemarau/dirt_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan tiles/dirt.png |
| `seasons/tropis/kemarau/edge_grass_dirt_kemarau.png` | 256x32 | 32x32 | 8 | musim kemarau; format/indeks identik dengan tiles/edge_grass_dirt.png |
| `seasons/tropis/kemarau/edge_grass_sand_kemarau.png` | 256x32 | 32x32 | 8 | musim kemarau; format/indeks identik dengan tiles/edge_grass_sand.png |
| `seasons/tropis/kemarau/autotile_water_grass_kemarau.png` | 256x384 | 32x32 | 94 | musim kemarau; format/indeks identik dengan tiles/autotile_water_grass.png |
| `seasons/tropis/kemarau/autotile_path_grass_kemarau.png` | 256x192 | 32x32 | 47 | musim kemarau; format/indeks identik dengan tiles/autotile_path_grass.png |
| `seasons/tropis/kemarau/tree_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tree.png |
| `seasons/tropis/kemarau/berry_bush_full_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan nature/berry_bush_full.png |
| `seasons/tropis/kemarau/berry_bush_empty_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan nature/berry_bush_empty.png |
| `seasons/tropis/kemarau/tree_mangga_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/tree_mangga.png |
| `seasons/tropis/kemarau/tree_rambutan_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/tree_rambutan.png |
| `seasons/tropis/kemarau/tree_jati_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/tree_jati.png |
| `seasons/tropis/kemarau/bush_tropis_kemarau.png` | 32x32 | 32x32 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/bush_tropis.png |
| `seasons/tropis/kemarau/tree_beringin_kemarau.png` | 64x64 | 64x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/tree_beringin.png |
| `seasons/tropis/kemarau/tree_pisang_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/tree_pisang.png |
| `seasons/tropis/kemarau/bambu_kemarau.png` | 32x64 | 32x64 | 1 | musim kemarau; format/indeks identik dengan nature/tropis/bambu.png |
| `seasons/tropis/labuh/grass_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan tiles/grass.png |
| `seasons/tropis/labuh/grass_flowers_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan tiles/grass_flowers.png |
| `seasons/tropis/labuh/dirt_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan tiles/dirt.png |
| `seasons/tropis/labuh/edge_grass_dirt_labuh.png` | 256x32 | 32x32 | 8 | musim labuh; format/indeks identik dengan tiles/edge_grass_dirt.png |
| `seasons/tropis/labuh/edge_grass_sand_labuh.png` | 256x32 | 32x32 | 8 | musim labuh; format/indeks identik dengan tiles/edge_grass_sand.png |
| `seasons/tropis/labuh/autotile_water_grass_labuh.png` | 256x384 | 32x32 | 94 | musim labuh; format/indeks identik dengan tiles/autotile_water_grass.png |
| `seasons/tropis/labuh/autotile_path_grass_labuh.png` | 256x192 | 32x32 | 47 | musim labuh; format/indeks identik dengan tiles/autotile_path_grass.png |
| `seasons/tropis/labuh/tree_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tree.png |
| `seasons/tropis/labuh/berry_bush_full_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan nature/berry_bush_full.png |
| `seasons/tropis/labuh/berry_bush_empty_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan nature/berry_bush_empty.png |
| `seasons/tropis/labuh/tree_mangga_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/tree_mangga.png |
| `seasons/tropis/labuh/tree_rambutan_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/tree_rambutan.png |
| `seasons/tropis/labuh/tree_jati_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/tree_jati.png |
| `seasons/tropis/labuh/bush_tropis_labuh.png` | 32x32 | 32x32 | 1 | musim labuh; format/indeks identik dengan nature/tropis/bush_tropis.png |
| `seasons/tropis/labuh/tree_beringin_labuh.png` | 64x64 | 64x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/tree_beringin.png |
| `seasons/tropis/labuh/tree_pisang_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/tree_pisang.png |
| `seasons/tropis/labuh/bambu_labuh.png` | 32x64 | 32x64 | 1 | musim labuh; format/indeks identik dengan nature/tropis/bambu.png |
| `effects/weather/rain_heavy_overlay.png` | 256x64 | 64x64 | 4 | hujan deras, 64x64 seamless, 4 frame ~60ms; pakai bersama rain_tint |
| `effects/weather/lightning_flash.png` | 32x32 | 32x32 | 1 | kilat: overlay putih, tampilkan 2 frame (60ms) lalu fade 200ms |
| `effects/weather/lightning_bolt.png` | 96x96 | 32x96 | 3 | sambaran petir 32x96: 0 terang, 1 cabang, 2 memudar (~60ms/frame); ujung bawah = titik sambar |
| `effects/weather/dust_overlay.png` | 256x64 | 64x64 | 4 | debu kemarau tertiup angin (ke kanan), 64x64 seamless 4 frame ~120ms |
| `effects/weather/kemarau_tint.png` | 32x32 | 32x32 | 1 | tint kemarau panas berdebu |
| `effects/weather/particle_dust.png` | 32x8 | 8x8 | 4 | kepulan debu (langkah/angin): membesar & memudar |
| `effects/weather/cloud_shadow_overlay.png` | 128x128 | 128x128 | 1 | bayangan awan labuh, 128x128 seamless; geser pelan (scroll ~4px/detik) |
| `buildings/tropis/rumah_panggung.png` | 96x96 | 96x96 | 1 | 96x96 (3x3), anchor tengah-bawah |
| `buildings/tropis/gubuk_bambu.png` | 64x64 | 64x64 | 1 | 64x64 (2x2), atap ijuk |
| `buildings/tropis/night/rumah_panggung_night.png` | 96x96 | 96x96 | 1 | 96x96 (3x3), anchor tengah-bawah; jendela menyala |
| `buildings/tropis/night/gubuk_bambu_night.png` | 64x64 | 64x64 | 1 | 64x64 (2x2), atap ijuk; menyala |
| `buildings/tropis/night/rumah_panggung_night_off.png` | 96x96 | 96x96 | 1 | 96x96 (3x3), anchor tengah-bawah; lampu mati |
| `buildings/tropis/night/gubuk_bambu_night_off.png` | 64x64 | 64x64 | 1 | 64x64 (2x2), atap ijuk; lampu mati |
| `buildings/tropis/lumbung_padi.png` | 64x96 | 64x96 | 1 | 64x96 (2x3), lumbung panggung atap ijuk |
| `buildings/tropis/kandang.png` | 96x64 | 96x64 | 1 | 96x64 (3x2), kandang ternak berpagar bambu + naungan |
| `structures/tropis/pagar_bambu_autotile.png` | 128x128 | 32x32 | 16 | 16-tile 4-bit sama dengan fence_autotile: indeks = N1+E2+S4+W8; indeks 0 = pagar 1-tile |
| `structures/tropis/kentongan.png` | 96x64 | 32x64 | 3 | tiang kentongan: 0 diam, 1 dipukul, 2 ayun balik (~100ms; ulang 3x = tanda bahaya) |
| `buildings/tropis/pos_ronda.png` | 192x64 | 64x64 | 3 | pos ronda (gardu) + kentongan: frame = animasi kentongan seperti kentongan.png; frame 0 = diam |
| `buildings/tropis/night/pos_ronda_night.png` | 192x64 | 64x64 | 3 | pos ronda (gardu) + kentongan: frame = animasi kentongan seperti kentongan.png; frame 0 = diam; pelita menyala |
| `structures/tropis/tanggul_autotile.png` | 128x128 | 32x32 | 16 | tanggul tanah + karung; 16-tile 4-bit (N1+E2+S4+W8); taruh di tepi sungai untuk menahan banjir |
| `buildings/tropis/embung.png` | 96x64 | 96x64 | 1 | 96x64 (3x2) embung/kolam tampung air berbatu |
| `structures/tropis/orang_orangan_sawah.png` | 64x64 | 32x64 | 2 | orang-orangan sawah, 2 frame goyang ~500ms |
| `structures/tropis/obor_bambu.png` | 160x64 | 32x64 | 5 | obor bambu: 0-3 nyala (~120ms), 4 mati; glow: light_glow_small |

## Keterbatasan tahap 7
- Musim tropis = recolor palet (+ genangan/retak sederhana yang berulang per tile); bangunan tidak punya varian musim.
- Hewan memakai rig prosedural: tampak depan/belakang hewan besar sederhana; monyet memakai rig manusia kecil. Tidak ada animasi mati/kabur/makan (selain ayam mematuk).
- `crop_padi` hanya overlay; pematang dari autotile sawah. Undakan sawah hanya tampak dari selatan (dinding menghadap bawah).
- Ternak 64x64 cukup besar dibanding penduduk (sengaja agar terbaca); skala boleh 0.75 di kode bila terasa terlalu besar.
- Belum ada gerbang bambu khusus (pakai gate_h/gate_v kayu).
- Salju lama tetap ada di folder namun deprecated.


## Tahap 8: tokoh, sifat, cerita, monumen, 17 Agustus, dilema

Semua file di sini baru. File tahap 1–7 tidak berubah (dicek md5). Generator: `tools/generate_assets.py` (fungsi `stage8()`). Preview: `preview_stage8.png` (`tools/make_preview_stage8.py`).

**Sumber daftar sifat:** di `docs/` belum ada riset khusus sifat/cerita/dilema, dan `game.js` baru punya placeholder `sifat: 'yang baik hati'`. Daftar di bawah mengikuti contoh pada brief, ditambah pasangan yang seimbang.
- Positif (bingkai hijau): rajin, pemberani, ramah, cerdas, religius, dermawan, jujur, sabar, periang, suka_menolong
- Negatif (bingkai ungu-abu): malas, penakut, pemarah, pelit, jahil, pemurung
- Pola nama: `icons/traits/trait_<nama>.png` (32) dan `trait_<nama>_16.png` (16). Ikon kepala desa: `icons/traits/icon_kepala_desa(_16).png`.
- Hubungan: `icons/relations/rel_<teman|rival|pasangan>(_16).png`.

**Gelembung emosi** (`icons/emotes/emote_<senang|marah|sedih|cinta|ide|bingung>.png`)
- Ukuran 64x16: 4 frame 16x16 dalam satu baris.
- Urutan frame: 0 muncul kecil, 1 membesar, 2 normal, 3 bob.
- Putar 0→1→2 masing-masing ~80ms, lalu ulang 2↔3 (~300ms) selama ~1.5 s.
- Offset tempel (relatif kiri-atas frame penduduk 32x32), sama dengan ikon hati: dewasa (+8, −14), anak (+8, −10), lansia (+8, −13), bayi (+8, 0).

**Monumen bertahap** (`buildings/monuments/<nama>_stages.png` + `<nama>.png` untuk bangunan jadi)
- Frame horizontal: 0 fondasi, 1 rangka, 2 setengah jadi (dengan perancah bambu), 3 selesai.
- Anchor di tengah bawah. Ukuran: masjid 128x128 (atap tumpang 3 + mustaka + menara), balai_desa_megah 128x128 (pendopo joglo), langgar 64x64 (panggung, tumpang 2), bendungan 96x64 (letakkan melintang sungai).
- `tiles/tropis/saluran_irigasi_autotile.png`: 16-tile 4-bit (N1+E2+S4+W8, kolom = i%4, baris = i//4). Baris 0–3 adalah frame air 0, baris 4–7 frame 1 (~400ms).

**17 Agustus** (`decor/agustus/`)
- Bendera dan umbul-umbul: frame 32x96 ×4, anchor kaki tiang di tengah bawah.
- Bunting: 32x16 ×2, tile horizontal seamless.
- Panjat pinang: 64x128.
- Gapura: 96x96, jalan lewat di tengah.
- Balap karung: 128x128 dengan format seperti spritesheet villager. 4 baris arah (bawah, kiri, kanan, atas) × 4 frame lompat (~120ms), kaki y≈29.

**Panel dilema** (`ui/dilemma/`)
- `panel_dilema.png`: 9-slice margin 14.
- `button_choice_<normal|hover|pressed|disabled>.png`: 96x28, margin kiri/kanan 10, atas 4, bawah 6.
- `portrait_frame_48.png` punya jendela 32x32 di (8,8). `portrait_frame_80.png` punya jendela 64x64 di (8,8). Gambar potret dulu, lalu bingkai di atasnya.
- `portraits/portrait_villager_N.png`: 32x32. Untuk bingkai 80, skala 2 nearest.

| File | Ukuran | Frame | Catatan |
|---|---|---|---|
| `icons/traits/trait_rajin.png` | 32x32 | 1 | sifat rajin (positif, bingkai hijau) |
| `icons/traits/trait_rajin_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_malas.png` | 32x32 | 1 | sifat malas (negatif, bingkai ungu-abu) |
| `icons/traits/trait_malas_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_pemberani.png` | 32x32 | 1 | sifat pemberani (positif, bingkai hijau) |
| `icons/traits/trait_pemberani_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_penakut.png` | 32x32 | 1 | sifat penakut (negatif, bingkai ungu-abu) |
| `icons/traits/trait_penakut_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_ramah.png` | 32x32 | 1 | sifat ramah (positif, bingkai hijau) |
| `icons/traits/trait_ramah_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_pemarah.png` | 32x32 | 1 | sifat pemarah (negatif, bingkai ungu-abu) |
| `icons/traits/trait_pemarah_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_cerdas.png` | 32x32 | 1 | sifat cerdas (positif, bingkai hijau) |
| `icons/traits/trait_cerdas_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_religius.png` | 32x32 | 1 | sifat religius (positif, bingkai hijau) |
| `icons/traits/trait_religius_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_dermawan.png` | 32x32 | 1 | sifat dermawan (positif, bingkai hijau) |
| `icons/traits/trait_dermawan_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_pelit.png` | 32x32 | 1 | sifat pelit (negatif, bingkai ungu-abu) |
| `icons/traits/trait_pelit_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_jujur.png` | 32x32 | 1 | sifat jujur (positif, bingkai hijau) |
| `icons/traits/trait_jujur_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_jahil.png` | 32x32 | 1 | sifat jahil (negatif, bingkai ungu-abu) |
| `icons/traits/trait_jahil_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_sabar.png` | 32x32 | 1 | sifat sabar (positif, bingkai hijau) |
| `icons/traits/trait_sabar_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_periang.png` | 32x32 | 1 | sifat periang (positif, bingkai hijau) |
| `icons/traits/trait_periang_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_pemurung.png` | 32x32 | 1 | sifat pemurung (negatif, bingkai ungu-abu) |
| `icons/traits/trait_pemurung_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_suka_menolong.png` | 32x32 | 1 | sifat suka_menolong (positif, bingkai hijau) |
| `icons/traits/trait_suka_menolong_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_teman.png` | 32x32 | 1 | hubungan 32x32 |
| `icons/relations/rel_teman_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_rival.png` | 32x32 | 1 | hubungan 32x32 |
| `icons/relations/rel_rival_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_pasangan.png` | 32x32 | 1 | hubungan 32x32 |
| `icons/relations/rel_pasangan_16.png` | 16x16 | 1 | 16x16 |
| `icons/emotes/emote_senang.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `icons/emotes/emote_marah.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `icons/emotes/emote_sedih.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `icons/emotes/emote_cinta.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `icons/emotes/emote_ide.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `icons/emotes/emote_bingung.png` | 64x16 | 4 | gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s |
| `buildings/monuments/masjid_stages.png` | 512x128 | 4 | masjid atap tumpang 3 (Nusantara) 128x128 (4x4 tile); 4 tahap: 0 fondasi, 1 rangka, 2 setengah jadi, 3 selesai; anchor tengah-bawah |
| `buildings/monuments/masjid.png` | 128x128 | 1 | masjid atap tumpang 3 (Nusantara) 128x128 (4x4 tile) (selesai) |
| `buildings/monuments/langgar_stages.png` | 256x64 | 4 | langgar panggung atap tumpang 2, 64x64 (2x2); 4 tahap: 0 fondasi, 1 rangka, 2 setengah jadi, 3 selesai; anchor tengah-bawah |
| `buildings/monuments/langgar.png` | 64x64 | 1 | langgar panggung atap tumpang 2, 64x64 (2x2) (selesai) |
| `buildings/monuments/balai_desa_megah_stages.png` | 512x128 | 4 | balai desa megah (pendopo bertingkat) 128x128 (4x4); 4 tahap: 0 fondasi, 1 rangka, 2 setengah jadi, 3 selesai; anchor tengah-bawah |
| `buildings/monuments/balai_desa_megah.png` | 128x128 | 1 | balai desa megah (pendopo bertingkat) 128x128 (4x4) (selesai) |
| `buildings/monuments/bendungan_stages.png` | 384x64 | 4 | bendungan kecil/irigasi 96x64 (3x2), letakkan melintang sungai; 4 tahap: 0 fondasi, 1 rangka, 2 setengah jadi, 3 selesai; anchor tengah-bawah |
| `buildings/monuments/bendungan.png` | 96x64 | 1 | bendungan kecil/irigasi 96x64 (3x2), letakkan melintang sungai (selesai) |
| `tiles/tropis/saluran_irigasi_autotile.png` | 128x256 | 32 | saluran irigasi batu 16-tile 4-bit (N1+E2+S4+W8); baris 0-3 frame 0, 4-7 frame 1 (air mengalir ~400ms) |
| `decor/agustus/bendera_merah_putih.png` | 128x96 | 4 | tiang bendera + merah putih berkibar 4 frame ~150ms; anchor tengah-bawah tiang di x≈7 |
| `decor/agustus/umbul_umbul.png` | 128x96 | 4 | umbul-umbul bambu, 4 frame ~200ms |
| `decor/agustus/panjat_pinang.png` | 64x128 | 1 | 64x128 (2x4 tile), batang licin + hadiah di puncak; titik panjat x 31-32 |
| `decor/agustus/balap_karung_villager_1.png` | 128x128 | 16 | penduduk dalam karung: 4 baris arah (bawah,kiri,kanan,atas) x 4 frame lompat ~110ms; maju ~6px per siklus saat frame 1-2 |
| `decor/agustus/balap_karung_villager_2.png` | 128x128 | 16 | penduduk dalam karung: 4 baris arah (bawah,kiri,kanan,atas) x 4 frame lompat ~110ms; maju ~6px per siklus saat frame 1-2 |
| `decor/agustus/balap_karung_villager_3.png` | 128x128 | 16 | penduduk dalam karung: 4 baris arah (bawah,kiri,kanan,atas) x 4 frame lompat ~110ms; maju ~6px per siklus saat frame 1-2 |
| `decor/agustus/balap_karung_villager_4.png` | 128x128 | 16 | penduduk dalam karung: 4 baris arah (bawah,kiri,kanan,atas) x 4 frame lompat ~110ms; maju ~6px per siklus saat frame 1-2 |
| `decor/agustus/bunting_merah_putih.png` | 64x16 | 2 | untaian bendera segitiga, tile horizontal seamless (ujung y=2), 2 frame ayun ~400ms |
| `decor/agustus/gapura_agustus.png` | 96x96 | 1 | 96x96 (3x3) gapura bambu & janur, merah putih; jalan lewat di tengah (x 20-76) |
| `ui/dilemma/panel_dilema.png` | 64x64 | 1 | 9-slice 64x64, margin 14 semua sisi (bingkai kayu ukir + pita batik kawung halus + ornamen sudut emas); konten mulai inset 14 |
| `ui/dilemma/button_choice_normal.png` | 96x28 | 1 | 9-slice margin kiri/kanan 10, atas 4, bawah 6; teks mulai x+12 |
| `ui/dilemma/button_choice_hover.png` | 96x28 | 1 | 9-slice margin kiri/kanan 10, atas 4, bawah 6; teks mulai x+12 |
| `ui/dilemma/button_choice_pressed.png` | 96x28 | 1 | 9-slice margin kiri/kanan 10, atas 4, bawah 6; teks mulai x+12 |
| `ui/dilemma/button_choice_disabled.png` | 96x28 | 1 | 9-slice margin kiri/kanan 10, atas 4, bawah 6; teks mulai x+12 |
| `ui/dilemma/portrait_frame_48.png` | 48x48 | 1 | bingkai potret; jendela transparan 32x32 di offset (8,8); gambar potret di bawah bingkai |
| `ui/dilemma/portrait_frame_80.png` | 80x80 | 1 | bingkai potret; jendela transparan 64x64 di offset (8,8); gambar potret di bawah bingkai |
| `ui/dilemma/portraits/portrait_villager_1.png` | 32x32 | 1 | potret 32x32 (kepala villager_N 2x); 64x64 = skala 2 nearest untuk portrait_frame_80 |
| `ui/dilemma/portraits/portrait_villager_2.png` | 32x32 | 1 | potret 32x32 (kepala villager_N 2x); 64x64 = skala 2 nearest untuk portrait_frame_80 |
| `ui/dilemma/portraits/portrait_villager_3.png` | 32x32 | 1 | potret 32x32 (kepala villager_N 2x); 64x64 = skala 2 nearest untuk portrait_frame_80 |
| `ui/dilemma/portraits/portrait_villager_4.png` | 32x32 | 1 | potret 32x32 (kepala villager_N 2x); 64x64 = skala 2 nearest untuk portrait_frame_80 |
| `icons/traits/icon_kepala_desa.png` | 32x32 | 1 | ikon kepala desa (peci + baju batik) 32x32 |
| `icons/traits/icon_kepala_desa_16.png` | 16x16 | 1 | 16x16 |

**Keterbatasan tahap 8**
- Potret hanya untuk villager_1–4 dewasa. Belum ada potret anak/lansia, dan belum ada ekspresi wajah berbeda di potret.
- Tahap konstruksi dibuat otomatis dari siluet bangunan jadi, sehingga rangka/perancah generik. Bendungan rangka tampak seperti kisi kayu.
- Ikon 16px yang detailnya kecil (religius, cerdas) hanya terbaca bersama tooltip.
- Belum ada animasi peserta panjat pinang memanjat, dan belum ada lomba lain (makan kerupuk, tarik tambang).
- Belum ada versi malam untuk monumen dan dekorasi Agustus.


## Tahap 8b: pelengkap sesuai `docs/RISET-CERITA-TUJUAN.md`

Acuan: §1.1 (sifat), §1.2 (hubungan), §1.3 (keinginan), §2.1 (monumen), §2.3 (Agustusan), §6 (prioritas) dan §7 "Desain (sprite & UI)". Ada 172 file baru. Semua file lama tidak berubah: md5 dicek terhadap seluruh 554 file tahap 1–8.

Di manifest, entri tahap ini memakai `stage: 8, sub: "8b"`. Generator: `tools/generate_assets.py` (fungsi `stage8b()`). Preview: `preview_stage8b.png` (`tools/make_preview_stage8b.py`).

Palet bertambah: merak, khaki, coat, kader, kerupuk, kabah, kayu_ukir, dan lain-lain. Agar ikon `_16` tahap 8 tidak ikut berubah, `to16b` sekarang memakai snapshot palet tahap 8 (`_PAL16B`). Ikon baru memakai `to16c` (palet penuh).

### Sifat (20 total, §1.1)
- 4 ikon baru dengan format sama (32x32 + `_16`, berbingkai): `trait_perantau` (buntalan kain di tongkat), `trait_ahli_tani` (caping + padi), `trait_pandai_masak` (wajan dengan masakan dan uap), `trait_seniman` (topeng barongan + dadak merak mini).
- Kutub: ahli_tani, pandai_masak, dan seniman positif. Perantau **netral**, tetapi tetap berbingkai hijau sesuai tabel riset.
- Bingkai hijau = positif/netral, ungu-abu = negatif.
- Ikon sifat lama yang dihapus di riset (kuat, ringkih, humoris, dan lain-lain) memang tidak pernah dibuat.

### Hubungan (§1.2, §7)
- `rel_sahabat` (jabat tangan, bingkai hijau tua) dan `rel_keluarga` (rumah + hati), masing-masing 32 + `_16`.
- Riset meminta ikon **12x12**, jadi kelima tingkat mendapat versi tanpa bingkai: `rel_{teman,sahabat,rival,pasangan,keluarga}_12.png`. Warnanya: teman hijau muda, sahabat hijau tua, rival oranye, pasangan merah muda, keluarga rumah.
- Kenalan tidak punya ikon.

### Gelembung keinginan (§1.3)
- `ui/wish/wish_bubble.png`: 96x24, berisi 4 frame 24x24 (awan pikiran) dengan pola animasi seperti emote: 0 kecil, 1 membesar, 2 normal, 3 bob. Putar 0→1→2 masing-masing ~80ms, lalu ulang 2↔3 (~300ms).
- **Slot ikon 16x16:** di (4,2) pada frame 2 dan (4,1) pada frame 3. Pada frame 0–1, sembunyikan ikon atau skalakan bersama gelembung.
- `wish_bubble_hampir.png`: varian kuning/oranye untuk keinginan yang sisa ≤ 1 hari. `wish_bubble_static.png`: frame 2 saja.
- **Offset tempel** (relatif kiri-atas frame penduduk 32x32): dewasa (+4, −20), anak (+4, −16), lansia (+4, −19). Jangan tampilkan bersamaan dengan emote; emote didahulukan.
- Ikon isi: `icons/wishes/wish_<id>.png` (32, untuk kartu panel Keinginan Warga) dan `wish_<id>_16.png` (slot). Tersedia untuk ke-26 id di §1.3: makan_rendang, nasi_pecel, kopi_pagi, rumah_panggung, nonton_reog, tabungan_haji, mancing_sore, punya_ayam, baju_baru, ziarah_makam, wayang_semalam, tidur_siang, kerja_bakti, ngobrol_sahabat, punya_anak, sawah_menguning, jajan_pasar, belajar_gamelan, rujak_bareng, bancakan_weton, pulang_kampung, ronda_malam, main_layangan, menang_lomba, tumpeng_syukuran, mandi_kali.
- Slot boleh juga diisi ikon sumber daya atau sifat 16px yang sudah ada.

### Bar progres monumen (§2.1, §7) di `ui/progress/`

**Bar kecil di atas bangunan**
- `monument_bar_frame.png`: 48x12, 9-slice margin 4. Track di y 4..7 (tinggi 4) dengan inset 4.
- Isi segmen aktif: ulang `monument_bar_fill.png` (4x4) sepanjang `trackW * (k−1+progres)/N`.
- Segmen tahap yang sudah selesai: ulang `monument_bar_fill_done.png`.
- Ujung isi: `monument_bar_fill_end.png` (2x4).
- Pemisah segmen: `monument_bar_divider.png` (2x8) di `trackX + trackW*j/N − 1`, y = 2.

**Bar panel "Tujuan Desa"**: varian `_panel` dengan frame 96x20, margin 6, track tinggi 8 (y 6..13), dan divider 2x12.

**Penanda tahap**: `monument_stage_pip.png` berisi 3 frame 8x8 (0 belum, 1 aktif, 2 selesai). Deretkan N pip, lalu teks "Tahap k/N — xx%" di kanannya. Teks dirender oleh kode.

`icon_bangun(_16)` dipakai untuk tombol "Mulai tahap N" dan "Kerja bakti".

### Monumen per tahap riset (§2.1, §7), semuanya dengan perancah bambu

Penamaan: `buildings/monuments/<id>_tahap<N>.png` untuk tahap N yang sudah selesai, dan `<id>_tahap<N>_stages.png` untuk proses pembangunan tahap N.
- Format proses pembangunan sama dengan `*_stages.png` lama: 4 frame horizontal.
- Frame 0: bangunan tahap N−1 (tahap 1: fondasi batu, bendungan: sungai) + perancah bambu.
- Frame 1: rangka. Frame 2: setengah jadi. Frame 3: selesai.

**Pemetaan:** selama tahap N dikerjakan, tampilkan frame `min(2, floor(progres*3))`. Setelah selesai, tampilkan `<id>_tahap<N>.png` (sama dengan frame 3). Anchor tengah-bawah, ukuran kanvas tetap per monumen.

| id (riset) | Kanvas | Tahap |
|---|---|---|
| `masjid` | 128x128 | 1 Langgar Bambu (memakai 3x3 di tengah) · 2 Masjid Kayu · 3 Masjid Jami' (menara + bedug) |
| `balai_megah` | 128x96 (4x3) | 1 Serambi & Kentongan Besar · 2 Pendopo Joglo · 3 Balai Megah (ukiran emas & gamelan) |
| `bendungan` | 96x64 (3x2) | 1 Bendung Bronjong Bambu · 2 Saluran Induk · 3 Pintu Air · 4 Bendungan & Embung (perancah dan progres berjalan kiri→kanan melintasi sungai) |
| `pendopo_reog` | 128x96 | 1 Sanggar Latihan · 2 Dadak Merak & Gamelan · 3 Pendopo Agung |
| `pasar_legi` | 128x96 | 1 Los Bambu · 2 Hari Pasaran (lapak tenda warna-warni, lampu) · 3 Pasar Batu Bata |

**Hasil pengecekan file lama:** `balai_desa_megah_stages.png` (tahap 8) berukuran 128x128 (4x4) dengan 4 fase umum. Perancahnya hanya dua tiang bambu, dan formatnya tidak cocok dengan riset (4x3, 3 tahap). File itu dibiarkan apa adanya sebagai alternatif. Untuk game, gunakan `balai_megah_tahap1-3`. Hal yang sama berlaku untuk `masjid_stages`/`langgar_stages`/`bendungan_stages` lama (fase umum 1 tahap); versi `_tahapN` mengikuti tahapan riset.

### Agustusan (§2.3, §7) di `decor/agustus/`
- **Panjat pinang**
  - `tiang_pinang.png`: 64x128, batang tanpa hadiah, posisi sama dengan `panjat_pinang.png`.
  - `hadiah_pinang.png`: 64x32, cincin hadiah. Tempel di (0,12) pada kanvas tiang; sembunyikan saat hadiah diambil.
- **Balap karung**: `karung.png` (berdiri) dan `karung_tergeletak.png`.
- **Tarik tambang**
  - `tambang_segmen.png`: 32x16 ×2 (0 kendur, 1 tegang), tile horizontal, y tengah = 8.
  - `tambang_tengah.png`: pita merah di tengah.
  - `tambang_gulung.png`: tambang yang disimpan.
- **Bakiak**: `bakiak.png` 64x32, untuk 3 orang dengan kaki di x 10/30/50. Untuk arah vertikal, putar 90°.
- **Makan kerupuk**: `kerupuk_gantung.png`, 32x64 ×2 frame ayun.
- **Piala**
  - `piala.png` 32x32.
  - `icons/status/icon_piala_16.png` untuk juara umum, tampil di atas kepala selama 14 hari dengan offset seperti Zzz (+16, −12).
  - `piala_emas_besar.png` 48x64 untuk Balai pada tingkat Teladan 4.

### Kartu dilema & reaksi (§7) di `ui/dilemma/`
- **Kartu**: `kartu_dilema_ringan.png` (pita hijau) dan `kartu_dilema_berat.png` (pita oranye).
  - Ukuran 64x80, 9-slice dengan margin atas 20, bawah 8, kiri/kanan 8.
  - Judul di y 4–13, isi mulai y 22.
  - Potret: `portrait_frame_48` dengan potret di dalamnya. Pemain = `icon_kepala_desa`.
- **Akibat tertunda**: ikon ⏳ `icon_tunda.png` (32) dan `icon_tunda_16.png`, dipakai di tombol pilihan yang punya `tunda` dan di baris log.
  - Baris log akibat tertunda diberi penanda `log_tanda_{ringan,berat}.png` (8x12) dengan warna yang sama dengan kartu asalnya.
- **Reaksi sifat**: `reaksi_chip.png` (32x18). Tempel `trait_<id>_16` di (1,1) dan `reaksi_{suka,cemas,netral}.png` (12x12, 😊/😟/😐) di (18,3).
- **Ekspresi potret**: `portraits/portrait_villager_N_{netral,senang,marah,sedih,khawatir}.png` (32x32) untuk N = 1–4, plus sheet `portrait_villager_N_ekspresi.png` (160x32, urutan sama).
  - Contoh: tokoh `jujur` bereaksi cemas → chip jujur + 😟, dan potret tokoh memakai `_khawatir`.

### Pengunjung & lain-lain (§7)
- **Format villager_N** (128x256, frame 32x32, baris 0–3 diam, 4–7 jalan; arah bawah, kiri, kanan, atas; kaki y≈29), di `characters/visitors/`:
  - `tengkulak` (topi lebar + tas karung)
  - `juragan` (batik, kalung emas, kumis)
  - `mantri` (baju putih + tas obat)
  - `pak_camat` (seragam khaki + peci)
  - `kader_posyandu` (seragam merah muda + kerudung putih)
- **Reog berjalan**: `characters/visitors/reog_berjalan.png`, 256x512, frame **64x64** dengan tata letak 8 baris × 4 kolom yang sama. Kaki di y≈61, anchor tengah-bawah (x 32). Dadak merak bergoyang ±1px.
- **Kucing belang**: `characters/fauna/kucing.png` dengan format fauna 32x32 (baris 0–3 diam, 4–7 jalan). Ada juga `kucing_tidur.png`. Riset menyebut "3 frame"; di sini dibuat 4 frame agar seragam dengan fauna lain (cukup putar frame 0–2 bila ingin 3).
- **Posyandu**: `buildings/posyandu_meja.png` (64x64), berisi meja bertaplak, buku KMS, dacin, dan papan bertanda hati. Riset hanya menyebut "posyandu kecil", jadi prop ini cukup ditaruh di depan Balai bersama `kader_posyandu`.

| File | Ukuran | Frame | Catatan |
|---|---|---|---|
| `icons/traits/trait_perantau.png` | 32x32 | 1 | sifat perantau (netral (bingkai hijau sesuai riset)), format sama dengan icons/traits |
| `icons/traits/trait_perantau_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_ahli_tani.png` | 32x32 | 1 | sifat ahli_tani (positif), format sama dengan icons/traits |
| `icons/traits/trait_ahli_tani_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_pandai_masak.png` | 32x32 | 1 | sifat pandai_masak (positif), format sama dengan icons/traits |
| `icons/traits/trait_pandai_masak_16.png` | 16x16 | 1 | 16x16 |
| `icons/traits/trait_seniman.png` | 32x32 | 1 | sifat seniman (positif), format sama dengan icons/traits |
| `icons/traits/trait_seniman_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_sahabat.png` | 32x32 | 1 | hubungan 32x32 |
| `icons/relations/rel_sahabat_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_keluarga.png` | 32x32 | 1 | hubungan 32x32 |
| `icons/relations/rel_keluarga_16.png` | 16x16 | 1 | 16x16 |
| `icons/relations/rel_teman_12.png` | 12x12 | 1 | 12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk) |
| `icons/relations/rel_sahabat_12.png` | 12x12 | 1 | 12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk) |
| `icons/relations/rel_rival_12.png` | 12x12 | 1 | 12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk) |
| `icons/relations/rel_pasangan_12.png` | 12x12 | 1 | 12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk) |
| `icons/relations/rel_keluarga_12.png` | 12x12 | 1 | 12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk) |
| `ui/wish/wish_bubble.png` | 96x24 | 4 | gelembung keinginan (awan pikiran) 4 frame: 0 kecil, 1 membesar, 2 normal, 3 bob; slot ikon 16x16 di (4,2) frame 2 dan (4,1) frame 3 |
| `ui/wish/wish_bubble_hampir.png` | 96x24 | 4 | varian gelembung saat keinginan hampir kedaluwarsa (≤1 hari), slot sama |
| `ui/wish/wish_bubble_static.png` | 24x24 | 1 | 24x24 statis = frame 2; slot 16x16 di (4,2) |
| `icons/wishes/wish_makan_rendang.png` | 32x32 | 1 | keinginan makan_rendang 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_makan_rendang_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_nasi_pecel.png` | 32x32 | 1 | keinginan nasi_pecel 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_nasi_pecel_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_kopi_pagi.png` | 32x32 | 1 | keinginan kopi_pagi 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_kopi_pagi_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_rumah_panggung.png` | 32x32 | 1 | keinginan rumah_panggung 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_rumah_panggung_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_nonton_reog.png` | 32x32 | 1 | keinginan nonton_reog 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_nonton_reog_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_tabungan_haji.png` | 32x32 | 1 | keinginan tabungan_haji 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_tabungan_haji_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_mancing_sore.png` | 32x32 | 1 | keinginan mancing_sore 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_mancing_sore_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_punya_ayam.png` | 32x32 | 1 | keinginan punya_ayam 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_punya_ayam_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_baju_baru.png` | 32x32 | 1 | keinginan baju_baru 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_baju_baru_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_ziarah_makam.png` | 32x32 | 1 | keinginan ziarah_makam 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_ziarah_makam_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_wayang_semalam.png` | 32x32 | 1 | keinginan wayang_semalam 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_wayang_semalam_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_tidur_siang.png` | 32x32 | 1 | keinginan tidur_siang 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_tidur_siang_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_kerja_bakti.png` | 32x32 | 1 | keinginan kerja_bakti 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_kerja_bakti_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_ngobrol_sahabat.png` | 32x32 | 1 | keinginan ngobrol_sahabat 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_ngobrol_sahabat_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_punya_anak.png` | 32x32 | 1 | keinginan punya_anak 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_punya_anak_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_sawah_menguning.png` | 32x32 | 1 | keinginan sawah_menguning 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_sawah_menguning_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_jajan_pasar.png` | 32x32 | 1 | keinginan jajan_pasar 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_jajan_pasar_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_belajar_gamelan.png` | 32x32 | 1 | keinginan belajar_gamelan 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_belajar_gamelan_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_rujak_bareng.png` | 32x32 | 1 | keinginan rujak_bareng 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_rujak_bareng_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_bancakan_weton.png` | 32x32 | 1 | keinginan bancakan_weton 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_bancakan_weton_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_pulang_kampung.png` | 32x32 | 1 | keinginan pulang_kampung 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_pulang_kampung_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_ronda_malam.png` | 32x32 | 1 | keinginan ronda_malam 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_ronda_malam_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_main_layangan.png` | 32x32 | 1 | keinginan main_layangan 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_main_layangan_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_menang_lomba.png` | 32x32 | 1 | keinginan menang_lomba 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_menang_lomba_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_tumpeng_syukuran.png` | 32x32 | 1 | keinginan tumpeng_syukuran 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_tumpeng_syukuran_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `icons/wishes/wish_mandi_kali.png` | 32x32 | 1 | keinginan mandi_kali 32x32 (kartu panel Keinginan Warga) |
| `icons/wishes/wish_mandi_kali_16.png` | 16x16 | 1 | 16x16 untuk slot gelembung |
| `ui/progress/monument_bar_frame.png` | 48x12 | 1 | 9-slice 48x12, margin 4 semua sisi; isi (track) di x 4..43, y 4..7 (tinggi 4) |
| `ui/progress/monument_bar_fill.png` | 4x4 | 1 | 4x4 tile isi hijau, ulang horizontal sepanjang progres |
| `ui/progress/monument_bar_fill_end.png` | 2x4 | 1 | 2x4 ujung kanan isi (kilau), tempel di akhir fill |
| `ui/progress/monument_bar_divider.png` | 2x8 | 1 | 2x8 pemisah segmen tahap, x = trackX + trackW*k/N - 1, y = 2 |
| `ui/progress/monument_bar_fill_done.png` | 4x4 | 1 | 4x4 tile segmen tahap yang sudah selesai (hijau muda bercorak), dipakai di kiri segmen aktif |
| `ui/progress/monument_bar_frame_panel.png` | 96x20 | 1 | 9-slice 96x20, margin 6 semua sisi; isi (track) di x 6..89, y 6..13 (tinggi 8) |
| `ui/progress/monument_bar_fill_panel.png` | 4x8 | 1 | 4x8 tile isi hijau, ulang horizontal sepanjang progres |
| `ui/progress/monument_bar_fill_end_panel.png` | 2x8 | 1 | 2x8 ujung kanan isi (kilau), tempel di akhir fill |
| `ui/progress/monument_bar_divider_panel.png` | 2x12 | 1 | 2x12 pemisah segmen tahap, x = trackX + trackW*k/N - 1, y = 4 |
| `ui/progress/monument_bar_fill_done_panel.png` | 4x8 | 1 | 4x8 tile segmen tahap yang sudah selesai (hijau muda bercorak), dipakai di kiri segmen aktif |
| `ui/progress/monument_stage_pip.png` | 24x8 | 3 | penanda tahap: 0 belum, 1 sedang dikerjakan, 2 selesai; deret N pip di kiri label "Tahap 2/3 — 64%" |
| `ui/progress/icon_bangun.png` | 32x32 | 1 | ikon palu kerja (Mulai tahap N / Kerja bakti) 32x32 |
| `ui/progress/icon_bangun_16.png` | 16x16 | 1 | 16x16 |
| `buildings/monuments/masjid_tahap1_stages.png` | 512x128 | 4 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 1/3 "Langgar Bambu" sedang dibangun: 0 fondasi batu + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/masjid_tahap1.png` | 128x128 | 1 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 1/3 "Langgar Bambu" selesai |
| `buildings/monuments/masjid_tahap2_stages.png` | 512x128 | 4 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 2/3 "Masjid Kayu" sedang dibangun: 0 bangunan tahap 1 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/masjid_tahap2.png` | 128x128 | 1 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 2/3 "Masjid Kayu" selesai |
| `buildings/monuments/masjid_tahap3_stages.png` | 512x128 | 4 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 3/3 "Masjid Jami'" sedang dibangun: 0 bangunan tahap 2 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/masjid_tahap3.png` | 128x128 | 1 | masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4); tahap 3/3 "Masjid Jami'" selesai |
| `buildings/monuments/balai_megah_tahap1_stages.png` | 512x96 | 4 | balai desa megah 128x96 (4x3); tahap 1/3 "Serambi & Kentongan Besar" sedang dibangun: 0 fondasi batu + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/balai_megah_tahap1.png` | 128x96 | 1 | balai desa megah 128x96 (4x3); tahap 1/3 "Serambi & Kentongan Besar" selesai |
| `buildings/monuments/balai_megah_tahap2_stages.png` | 512x96 | 4 | balai desa megah 128x96 (4x3); tahap 2/3 "Pendopo Joglo" sedang dibangun: 0 bangunan tahap 1 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/balai_megah_tahap2.png` | 128x96 | 1 | balai desa megah 128x96 (4x3); tahap 2/3 "Pendopo Joglo" selesai |
| `buildings/monuments/balai_megah_tahap3_stages.png` | 512x96 | 4 | balai desa megah 128x96 (4x3); tahap 3/3 "Balai Megah (ukiran & gamelan)" sedang dibangun: 0 bangunan tahap 2 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/balai_megah_tahap3.png` | 128x96 | 1 | balai desa megah 128x96 (4x3); tahap 3/3 "Balai Megah (ukiran & gamelan)" selesai |
| `buildings/monuments/bendungan_tahap1_stages.png` | 384x64 | 4 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 1/4 "Bendung Bronjong Bambu" sedang dibangun: 0 sungai kosong + perancah bambu, 1 sepertiga (kiri), 2 dua pertiga, 3 selesai; frame = min(3, floor(progres*3)); anchor tengah-bawah |
| `buildings/monuments/bendungan_tahap1.png` | 96x64 | 1 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 1/4 "Bendung Bronjong Bambu" selesai |
| `buildings/monuments/bendungan_tahap2_stages.png` | 384x64 | 4 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 2/4 "Saluran Induk" sedang dibangun: 0 bangunan tahap 1 + perancah bambu, 1 sepertiga (kiri), 2 dua pertiga, 3 selesai; frame = min(3, floor(progres*3)); anchor tengah-bawah |
| `buildings/monuments/bendungan_tahap2.png` | 96x64 | 1 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 2/4 "Saluran Induk" selesai |
| `buildings/monuments/bendungan_tahap3_stages.png` | 384x64 | 4 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 3/4 "Pintu Air" sedang dibangun: 0 bangunan tahap 2 + perancah bambu, 1 sepertiga (kiri), 2 dua pertiga, 3 selesai; frame = min(3, floor(progres*3)); anchor tengah-bawah |
| `buildings/monuments/bendungan_tahap3.png` | 96x64 | 1 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 3/4 "Pintu Air" selesai |
| `buildings/monuments/bendungan_tahap4_stages.png` | 384x64 | 4 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 4/4 "Bendungan & Embung" sedang dibangun: 0 bangunan tahap 3 + perancah bambu, 1 sepertiga (kiri), 2 dua pertiga, 3 selesai; frame = min(3, floor(progres*3)); anchor tengah-bawah |
| `buildings/monuments/bendungan_tahap4.png` | 96x64 | 1 | bendungan & irigasi 96x64 (3x2), letakkan melintang sungai; tahap 4/4 "Bendungan & Embung" selesai |
| `buildings/monuments/pendopo_reog_tahap1_stages.png` | 512x96 | 4 | pendopo reog 128x96 (4x3); tahap 1/3 "Sanggar Latihan" sedang dibangun: 0 fondasi batu + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pendopo_reog_tahap1.png` | 128x96 | 1 | pendopo reog 128x96 (4x3); tahap 1/3 "Sanggar Latihan" selesai |
| `buildings/monuments/pendopo_reog_tahap2_stages.png` | 512x96 | 4 | pendopo reog 128x96 (4x3); tahap 2/3 "Dadak Merak & Gamelan" sedang dibangun: 0 bangunan tahap 1 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pendopo_reog_tahap2.png` | 128x96 | 1 | pendopo reog 128x96 (4x3); tahap 2/3 "Dadak Merak & Gamelan" selesai |
| `buildings/monuments/pendopo_reog_tahap3_stages.png` | 512x96 | 4 | pendopo reog 128x96 (4x3); tahap 3/3 "Pendopo Agung" sedang dibangun: 0 bangunan tahap 2 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pendopo_reog_tahap3.png` | 128x96 | 1 | pendopo reog 128x96 (4x3); tahap 3/3 "Pendopo Agung" selesai |
| `buildings/monuments/pasar_legi_tahap1_stages.png` | 512x96 | 4 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 1/3 "Los Bambu" sedang dibangun: 0 fondasi batu + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pasar_legi_tahap1.png` | 128x96 | 1 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 1/3 "Los Bambu" selesai |
| `buildings/monuments/pasar_legi_tahap2_stages.png` | 512x96 | 4 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 2/3 "Hari Pasaran" sedang dibangun: 0 bangunan tahap 1 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pasar_legi_tahap2.png` | 128x96 | 1 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 2/3 "Hari Pasaran" selesai |
| `buildings/monuments/pasar_legi_tahap3_stages.png` | 512x96 | 4 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 3/3 "Pasar Batu Bata" sedang dibangun: 0 bangunan tahap 2 + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah |
| `buildings/monuments/pasar_legi_tahap3.png` | 128x96 | 1 | pasar legi 128x96 (4x3), pasar tradisional Jawa; tahap 3/3 "Pasar Batu Bata" selesai |
| `decor/agustus/tiang_pinang.png` | 64x128 | 1 | 64x128 batang pinang licin tanpa hadiah (posisi sama dengan panjat_pinang.png); puncak tiang y=22, x 30-33 |
| `decor/agustus/hadiah_pinang.png` | 64x32 | 1 | 64x32 cincin hadiah gantung; tempel di (tiangX-0, puncak tiang y 22 → offset y -10): pada kanvas tiang_pinang paste di (0,12); lepas/ambil satu per satu dengan menyembunyikan sprite ini saat menang |
| `decor/agustus/karung.png` | 32x32 | 1 | 32x32 karung goni berdiri (prop lomba balap karung / tumpukan karung) |
| `decor/agustus/karung_tergeletak.png` | 32x32 | 1 | 32x32 karung kosong tergeletak (garis start/finish) |
| `decor/agustus/tambang_segmen.png` | 64x16 | 2 | tambang tarik tambang, tile horizontal seamless (y tengah=8, tebal 3px); frame 0 kendur, 1 tegang |
| `decor/agustus/tambang_tengah.png` | 32x16 | 1 | 32x16 bagian tengah tambang dengan pita merah (penanda menang), sambung dengan tambang_segmen |
| `decor/agustus/tambang_gulung.png` | 32x32 | 1 | 32x32 tambang tergulung (disimpan setelah dibeli sekali) |
| `decor/agustus/bakiak.png` | 64x32 | 1 | 64x32 bakiak (terompah panjang) 3 orang tampak atas, horizontal; kaki penduduk di x 10/30/50; untuk arah vertikal putar 90° |
| `decor/agustus/kerupuk_gantung.png` | 64x64 | 2 | tali dengan 2 kerupuk untuk lomba makan kerupuk, 2 frame ayun ~300ms; palang di y 4-5, kerupuk setinggi kepala penduduk (y 16-28) |
| `decor/agustus/piala.png` | 32x32 | 1 | 32x32 piala juara (juara umum 14 hari / papan Teladan) |
| `icons/status/icon_piala_16.png` | 16x16 | 1 | 16x16 ikon piala kecil di atas kepala juara umum selama 14 hari; offset seperti Zzz (+16,-12) |
| `decor/agustus/piala_emas_besar.png` | 48x64 | 1 | 48x64 piala emas besar di Balai (Desa Teladan Nasional, tingkat 4) |
| `ui/dilemma/kartu_dilema_ringan.png` | 64x80 | 1 | 9-slice 64x80: margin atas 20 (pita judul pos_c), bawah 8, kiri/kanan 8; judul di y 4-13, isi mulai y 22 |
| `ui/dilemma/log_tanda_ringan.png` | 8x12 | 1 | 8x12 penanda warna di kiri baris log akibat tertunda (warna sama dengan kartu ringan) |
| `ui/dilemma/kartu_dilema_berat.png` | 64x80 | 1 | 9-slice 64x80: margin atas 20 (pita judul roof), bawah 8, kiri/kanan 8; judul di y 4-13, isi mulai y 22 |
| `ui/dilemma/log_tanda_berat.png` | 8x12 | 1 | 8x12 penanda warna di kiri baris log akibat tertunda (warna sama dengan kartu berat) |
| `ui/dilemma/icon_tunda.png` | 32x32 | 1 | ikon ⏳ akibat tertunda 32x32 |
| `ui/dilemma/icon_tunda_16.png` | 16x16 | 1 | 16x16 (di kartu dan log) |
| `ui/dilemma/reaksi_suka.png` | 12x12 | 1 | 12x12 reaksi sifat (😊 suka / 😟 cemas / netral) di samping ikon sifat _16 |
| `ui/dilemma/reaksi_cemas.png` | 12x12 | 1 | 12x12 reaksi sifat (😊 suka / 😟 cemas / netral) di samping ikon sifat _16 |
| `ui/dilemma/reaksi_netral.png` | 12x12 | 1 | 12x12 reaksi sifat (😊 suka / 😟 cemas / netral) di samping ikon sifat _16 |
| `ui/dilemma/reaksi_chip.png` | 32x18 | 1 | 32x18 latar chip reaksi: ikon sifat _16 di (1,1), ikon reaksi_* 12x12 di (18,3) |
| `ui/dilemma/portraits/portrait_villager_1_netral.png` | 32x32 | 1 | potret 32x32 ekspresi netral (wajah sama dengan portrait_villager_1) |
| `ui/dilemma/portraits/portrait_villager_1_senang.png` | 32x32 | 1 | potret 32x32 ekspresi senang (wajah sama dengan portrait_villager_1) |
| `ui/dilemma/portraits/portrait_villager_1_marah.png` | 32x32 | 1 | potret 32x32 ekspresi marah (wajah sama dengan portrait_villager_1) |
| `ui/dilemma/portraits/portrait_villager_1_sedih.png` | 32x32 | 1 | potret 32x32 ekspresi sedih (wajah sama dengan portrait_villager_1) |
| `ui/dilemma/portraits/portrait_villager_1_khawatir.png` | 32x32 | 1 | potret 32x32 ekspresi khawatir (wajah sama dengan portrait_villager_1) |
| `ui/dilemma/portraits/portrait_villager_1_ekspresi.png` | 160x32 | 5 | sheet ekspresi 5 frame: 0 netral, 1 senang, 2 marah, 3 sedih, 4 khawatir |
| `ui/dilemma/portraits/portrait_villager_2_netral.png` | 32x32 | 1 | potret 32x32 ekspresi netral (wajah sama dengan portrait_villager_2) |
| `ui/dilemma/portraits/portrait_villager_2_senang.png` | 32x32 | 1 | potret 32x32 ekspresi senang (wajah sama dengan portrait_villager_2) |
| `ui/dilemma/portraits/portrait_villager_2_marah.png` | 32x32 | 1 | potret 32x32 ekspresi marah (wajah sama dengan portrait_villager_2) |
| `ui/dilemma/portraits/portrait_villager_2_sedih.png` | 32x32 | 1 | potret 32x32 ekspresi sedih (wajah sama dengan portrait_villager_2) |
| `ui/dilemma/portraits/portrait_villager_2_khawatir.png` | 32x32 | 1 | potret 32x32 ekspresi khawatir (wajah sama dengan portrait_villager_2) |
| `ui/dilemma/portraits/portrait_villager_2_ekspresi.png` | 160x32 | 5 | sheet ekspresi 5 frame: 0 netral, 1 senang, 2 marah, 3 sedih, 4 khawatir |
| `ui/dilemma/portraits/portrait_villager_3_netral.png` | 32x32 | 1 | potret 32x32 ekspresi netral (wajah sama dengan portrait_villager_3) |
| `ui/dilemma/portraits/portrait_villager_3_senang.png` | 32x32 | 1 | potret 32x32 ekspresi senang (wajah sama dengan portrait_villager_3) |
| `ui/dilemma/portraits/portrait_villager_3_marah.png` | 32x32 | 1 | potret 32x32 ekspresi marah (wajah sama dengan portrait_villager_3) |
| `ui/dilemma/portraits/portrait_villager_3_sedih.png` | 32x32 | 1 | potret 32x32 ekspresi sedih (wajah sama dengan portrait_villager_3) |
| `ui/dilemma/portraits/portrait_villager_3_khawatir.png` | 32x32 | 1 | potret 32x32 ekspresi khawatir (wajah sama dengan portrait_villager_3) |
| `ui/dilemma/portraits/portrait_villager_3_ekspresi.png` | 160x32 | 5 | sheet ekspresi 5 frame: 0 netral, 1 senang, 2 marah, 3 sedih, 4 khawatir |
| `ui/dilemma/portraits/portrait_villager_4_netral.png` | 32x32 | 1 | potret 32x32 ekspresi netral (wajah sama dengan portrait_villager_4) |
| `ui/dilemma/portraits/portrait_villager_4_senang.png` | 32x32 | 1 | potret 32x32 ekspresi senang (wajah sama dengan portrait_villager_4) |
| `ui/dilemma/portraits/portrait_villager_4_marah.png` | 32x32 | 1 | potret 32x32 ekspresi marah (wajah sama dengan portrait_villager_4) |
| `ui/dilemma/portraits/portrait_villager_4_sedih.png` | 32x32 | 1 | potret 32x32 ekspresi sedih (wajah sama dengan portrait_villager_4) |
| `ui/dilemma/portraits/portrait_villager_4_khawatir.png` | 32x32 | 1 | potret 32x32 ekspresi khawatir (wajah sama dengan portrait_villager_4) |
| `ui/dilemma/portraits/portrait_villager_4_ekspresi.png` | 160x32 | 5 | sheet ekspresi 5 frame: 0 netral, 1 senang, 2 marah, 3 sedih, 4 khawatir |
| `characters/visitors/tengkulak.png` | 128x256 | 32 | tengkulak bertopi (pengepul hasil panen), tas karung kecil; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29 |
| `characters/visitors/juragan.png` | 128x256 | 32 | juragan berkalung emas, baju batik, berkumis; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29 |
| `characters/visitors/mantri.png` | 128x256 | 32 | mantri kesehatan, baju putih, tas obat; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29 |
| `characters/visitors/pak_camat.png` | 128x256 | 32 | Pak Camat berseragam khaki + peci; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29 |
| `characters/visitors/kader_posyandu.png` | 128x256 | 32 | kader posyandu: seragam merah muda + kerudung; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29 |
| `characters/visitors/reog_berjalan.png` | 256x512 | 32 | reog berjalan (pembarong + dadak merak besar) 64x64/frame; 8 baris x 4 kolom: 0-3 diam (dadak bergoyang pelan), 4-7 jalan; arah bawah,kiri,kanan,atas; kaki di y≈61, anchor tengah-bawah (x 32) |
| `characters/fauna/kucing.png` | 128x256 | 32 | kucing belang (putih-oranye) 32x32; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; format fauna |
| `characters/fauna/kucing_tidur.png` | 32x32 | 1 | 32x32 kucing tidur melingkar (pakai bersama icon_zzz_anim) |
| `buildings/posyandu_meja.png` | 64x64 | 1 | 64x64 meja posyandu: taplak merah muda, buku KMS, dacin (timbangan gantung bersarung), papan tanda posyandu; kader berdiri di depan/kiri |

### Keterbatasan tahap 8b
- Teks label (judul kartu, "Tahap 2/3 — 64%") tidak dibakar ke gambar. Font bitmap pixel lama tidak punya semua huruf, jadi teks dirender oleh kode.
- Frame rangka dan setengah jadi dibuat otomatis dari siluet bangunan. Perancahnya generik (tiang + palang + silang bambu) dan cukup rapat menutupi bangunan.
- Ekspresi potret kecil (32px). Paling terbaca bila diskalakan 2x di `portrait_frame_80`. Belum ada ekspresi untuk anak, lansia, atau pengunjung.
- Pengunjung tidak punya animasi kerja/bicara. Reog belum punya animasi tari khusus (hanya diam/jalan) dan belum ada penari jathil/bujang ganong.
- Belum ada lampu hias malam Agustusan, papan gelar Teladan per tingkat, maupun versi malam untuk monumen tahap.
- Ikon keinginan 16px untuk wayang, gamelan, dan haji (Ka'bah) bersifat simbolik dan paling jelas bila disertai judul gelembung di tooltip.

## Tahap 8c: ikon Padi & sawah kering kemarau (permintaan Asisten Koding)

Hanya file baru. Semua file lama tidak berubah: md5 dicek pada 726 file di manifest, ditambah `icons/resources/icon_padi.png`. Di manifest, entri tahap ini memakai `stage: 8, sub: "8c"`. Generator: fungsi `stage8c()`. Preview: `preview_8c.png` (`tools/make_preview_8c.py`).

| File | Ukuran | Frame | Catatan |
|---|---|---|---|
| `icons/resources/icon_padi_ikat.png` | 32x32 | 1 | Ikon resmi sumber daya Padi (`gandum`): seikat padi menguning diikat pita. Gayanya sama dengan `icons/resources/icon_*.png` (outline 1px, tanpa bingkai). |
| `tiles/tropis/sawah_kering_autotile.png` | 128x128 | 16 | Sawah kering untuk kemarau tanpa irigasi: lumpur retak tanpa air, pematang identik. **Format dan indeks persis `sawah_autotile.png`**: 16-tile 4-bit, indeks = N1+E2+S4+W8 (tetangga yang juga sawah), kolom i%4, baris i//4, indeks 0 = petak tunggal. Pola retak periodik 32px sehingga menyambung antar tile. |
| `nature/crops/crop_padi_kering.png` | 192x32 | 6 | Overlay padi layu, indeks frame sama dengan `crop_padi`: 0 diolah (bongkah kering), 1 bibit layu, 2 tumbuh layu, 3 bunting layu, 4 menguning hampa, 5 dipanen (jerami). |

Catatan:
- **`icons/resources/icon_padi.png` sengaja tidak ditimpa.** Path itu sudah berisi ikon sementara buatan Asisten Koding (`tools/buat_ikon_padi.py`, dipakai di `tema.js` `RES_ICON`). Ikon resmi ada di `icon_padi_ikat.png`. Untuk memakainya, ubah `RES_ICON.gandum` ke path baru, atau salin file itu ke `icon_padi.png` bila pemilik proyek setuju menimpa.
- **Tidak ada `icon_padi_16.png`.** Ikon sumber daya lain di `icons/resources/` tidak punya versi 16px.
- Di kode, `sawah_kering_autotile` dapat menggantikan `drySawahImg()` (game.js) cukup dengan memakai indeks yang sama. Saat sawah kering, `sawah_water_anim` (kilau) jangan digambar.
