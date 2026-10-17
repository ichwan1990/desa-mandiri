# Konsep Game: "Desa Mandiri" (game manajemen desa berbasis web)

## Inti
- Main di browser (HTML5 Canvas, JavaScript; disarankan Phaser 3 atau vanilla JS, tanpa server, simpan progres di localStorage).
- Mulai dengan **2 penduduk** di peta kecil berisi pohon, batu, semak buah, sungai.
- Penduduk **bekerja otomatis** (AI berbasis kebutuhan + prioritas desa). Pemain = kepala desa: tidak mengontrol langsung, tapi mengatur prioritas kerja, menaruh rencana bangunan, dan merespons event.

## Kebutuhan penduduk
- Lapar, Energi (tidur), Suasana hati. Jika lapar/energi kritis, penduduk berhenti kerja untuk makan/tidur.
- Tiap penduduk punya nama, umur, dan skill (menebang, menambang, bertani, membangun, berburu) yang naik seiring dipakai.

## Sumber daya
- Tahap awal: Kayu, Batu, Makanan (buah, ikan, daging), Air.
- Lanjutan: Gandum, Roti, Papan, Batu bata, Alat (perkakas), Kulit/pakaian.

## Bangunan (dibuka bertahap)
Api unggun, Gubuk (kapasitas 2), Gudang, Ladang, Sumur, Tempat penebangan, Tambang, Dapur, Bengkel alat, Rumah kayu, Lumbung, Pasar, Balai desa.

## Pertumbuhan & progres
- Penduduk baru lahir/datang jika makanan surplus, ada rumah kosong, dan suasana hati baik.
- Era: Perkemahan, Dusun, Desa Pertanian, Kota Kecil. Tiap era membuka bangunan dan teknologi baru.

## Yang membuat menarik
- Siklus siang/malam dan 4 musim (musim dingin: tanaman tidak tumbuh, perlu stok makanan).
- Event acak: badai, hewan buas, pedagang keliling, pendatang, panen raya, wabah.
- Log cerita harian ("Hari 12: Sari menemukan batu besi"), statistik, dan target/quest kecil.
- Kecepatan permainan: jeda, 1x, 2x, 4x.

## Gaya visual
Pixel art top-down, tile 32x32, dengan nuansa The Little Land (imut, hangat, cerah). Keputusan Ichwan: bukan 2.5D. UI sederhana dengan ikon sumber daya di atas.

## Lokasi kerja bersama
Semua file di /workspace/village-game (kode di root, aset gambar di /workspace/village-game/assets).

## Referensi utama (dari Ichwan)
Game **The Little Land** dipakai sebagai referensi utama untuk nuansa, gaya visual, dan alur permainan. Pelajari game itu dan selaraskan hasil kerja dengannya, tanpa menyalin aset atau kode aslinya.
