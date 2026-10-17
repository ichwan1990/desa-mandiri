// Pohon teknologi (data-driven). Sumber: docs/RISET-TAHAP3.md. P0 = T01–T08; T09–T20 tinggal ditambah ke TECH.nodes.
// Field node:
//   id, nama, deskripsi, cabang (bertahan|produksi|masyarakat|perdagangan), ikon (key ASSETS opsional)
//   era: era minimum (id dari CONFIG.ERAS)   prasyarat: [id node]   syarat: { res: {alat: 3}, bangunan: {bengkel: 1}, pop: 10 }
//   biaya: dibayar di muka saat riset dimulai   work: detik kerja penduduk berprioritas 'riset'
//   efek: daftar { kunci, op: 'mult'|'add'|'set', nilai, kondisi? }  — kunci yang dibaca game: lihat TECH.kunci.
//   Kunci tak dikenal dicatat di konsol & diabaikan. Teks (nama/deskripsi) bisa ditimpa TEKS-GAME.json -> "teknologi": [{id, nama, deskripsi}].
// Aturan: tidak ada tech yang menghapus musim dingin atau spawn tanpa batas.
window.TECH = {
  cabang: { bertahan: 'Bertahan', produksi: 'Produksi', masyarakat: 'Masyarakat', perdagangan: 'Perdagangan' },
  kunci: {
    api_radius: 'Pengali radius bonus suasana hati api unggun',
    api_kayu_bakar: 'Pengali konsumsi kayu bakar (belum ada konsumsi kayu bakar di V3 — disimpan untuk nanti)',
    carry_makanan: 'Tambahan hasil per angkutan makanan', carry_kayu: 'Tambahan hasil per angkutan kayu', carry_batu: 'Tambahan hasil per angkutan batu',
    tani_waktu: 'Pengali waktu tanam & panen ladang', ladang_tumbuh: 'Tambahan hari tumbuh ladang (negatif = lebih cepat; tetap berhenti di musim dingin)',
    ladang_hasil: 'Tambahan hasil min/maks per petak', lapar_dingin: 'Tambahan pengali lapar musim dingin (negatif = lebih hemat)',
    dapur_bonus: 'Bonus makan dari dapur', surplus_makanan: 'Tambahan faktor batas surplus makanan (AI baru melambat lebih tinggi)',
    buka_bangunan: 'Membuka bangunan (nilai = id bangunan)',
  },
  nodes: [
    { id: 'T01', nama: 'Api Terjaga', cabang: 'bertahan', era: 'perkemahan', prasyarat: [], biaya: { kayu: 15 }, work: 40, ikon: 'ikon_tech_era_camp',
      deskripsi: 'Api unggun dijaga bergantian. Radius kehangatan +50%.',
      efek: [{ kunci: 'api_radius', op: 'mult', nilai: 1.5 }, { kunci: 'api_kayu_bakar', op: 'mult', nilai: 0.8 }] },
    { id: 'T02', nama: 'Keranjang Anyam', cabang: 'produksi', era: 'perkemahan', prasyarat: [], biaya: { kayu: 20 }, work: 50, ikon: 'ikon_tech_storage',
      deskripsi: 'Keranjang dari rotan: +1 makanan dan +1 kayu per angkutan.',
      efek: [{ kunci: 'carry_makanan', op: 'add', nilai: 1 }, { kunci: 'carry_kayu', op: 'add', nilai: 1 }] },
    { id: 'T03', nama: 'Cangkul Kayu', cabang: 'produksi', era: 'dusun', prasyarat: ['T02'], biaya: { kayu: 25, batu: 10 }, work: 60, ikon: 'ikon_tech_farming',
      deskripsi: 'Menanam dan memanen ladang 20% lebih cepat.', efek: [{ kunci: 'tani_waktu', op: 'mult', nilai: 0.8 }] },
    { id: 'T04', nama: 'Irigasi Sederhana', cabang: 'produksi', era: 'dusun', prasyarat: ['T03'], biaya: { kayu: 30, batu: 20 }, work: 80, ikon: 'ikon_tech_well',
      deskripsi: 'Ladang dalam 12 tile dari sumur tumbuh 1 hari lebih cepat (tetap berhenti saat musim dingin).',
      efek: [{ kunci: 'ladang_tumbuh', op: 'add', nilai: -1.0, kondisi: { sumurDalam: 12 } }] },
    { id: 'T05', nama: 'Pengawetan', cabang: 'bertahan', era: 'dusun', prasyarat: ['T01'], biaya: { kayu: 20, makanan: 15 }, work: 70, ikon: 'ikon_tech_bread',
      deskripsi: 'Makanan diasap dan dikeringkan. Lapar musim dingin berkurang (−0.1).', efek: [{ kunci: 'lapar_dingin', op: 'add', nilai: -0.1 }] },
    { id: 'T06', nama: 'Dapur Hemat', cabang: 'masyarakat', era: 'dusun', prasyarat: ['T05'], biaya: { kayu: 25, batu: 15 }, work: 70, ikon: 'ikon_tech_bread',
      deskripsi: 'Masakan dapur lebih mengenyangkan: bonus dapur 25% → 40%.', efek: [{ kunci: 'dapur_bonus', op: 'set', nilai: 0.40 }] },
    { id: 'T07', nama: 'Bajak Besi', cabang: 'produksi', era: 'desa_pertanian', prasyarat: ['T03'], syarat: { res: { alat: 3 } }, biaya: { kayu: 20, batu: 30, alat: 2 }, work: 100, ikon: 'ikon_tech_tools',
      deskripsi: 'Hasil tiap petak ladang +3.', efek: [{ kunci: 'ladang_hasil', op: 'add', nilai: 3 }] },
    { id: 'T08', nama: 'Lumbung Bertingkat', cabang: 'bertahan', era: 'desa_pertanian', prasyarat: ['T05'], biaya: { papan: 20, batu: 25 }, work: 90, ikon: 'ikon_tech_storage',
      deskripsi: 'Penyimpanan bertingkat: desa mau menimbun lebih banyak makanan sebelum melambat.', efek: [{ kunci: 'surplus_makanan', op: 'add', nilai: 0.4 }] },
    // T09–T20: lihat docs/RISET-TAHAP3.md (pasar, perdagangan, sekolah, dll.) — ditambahkan di tahap berikutnya.
  ],
};
