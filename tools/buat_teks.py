import json
P = lambda n, jk, s: {"nama": n, "jenis_kelamin": jk, "sifat": s}
penduduk = [
 # Jawa
 P("Sari","P","rajin dan ceria"), P("Budi","L","tenang, suka menebang"), P("Wulan","P","lembut, pandai memasak"),
 P("Joko","L","kuat tapi pelupa"), P("Ayu","P","teliti"), P("Slamet","L","sabar dan tekun"),
 P("Rahayu","P","penyayang"), P("Bambang","L","suka bercanda"), P("Lestari","P","gemar berkebun"),
 P("Sugeng","L","bangun paling pagi"), P("Ningsih","P","pendiam tapi peduli"), P("Hartono","L","perajin teliti"),
 # Sunda
 P("Asep","L","lucu dan banyak akal"), P("Euis","P","suaranya merdu"), P("Dadang","L","pekerja keras"),
 P("Neng Rina","P","ramah"), P("Ujang","L","penasaran"), P("Siti Nurhayati","P","cekatan"),
 P("Cecep","L","suka memancing"), P("Iis","P","murah senyum"),
 # Batak
 P("Togar","L","berani"), P("Rumondang","P","tegas dan adil"), P("Parlindungan","L","pelindung desa"),
 P("Butet","P","bersemangat"), P("Sihol","L","suka bernyanyi"), P("Tiur","P","bijak"),
 P("Horas Simanjuntak","L","pemimpin alami"), P("Lamtiar","P","pandai berhitung"),
 # Minang
 P("Rangkayo","P","pandai berdagang"), P("Datuak Malin","L","bijaksana"), P("Upik","P","gesit"),
 P("Buyung","L","suka merantau"), P("Ranti","P","pandai menenun"), P("Fauzan","L","hemat"),
 P("Nurhaliza","P","sopan"), P("Zulkifli","L","juru masak andal"),
 # Bugis
 P("Andi Baso","L","pelaut tangguh"), P("Daeng Tasi","P","teguh pendirian"), P("La Upe","L","pembuat perahu"),
 P("Besse","P","anggun dan cermat"), P("Daeng Rewa","L","pemberani"), P("Hasnah","P","rajin menabung"),
 # Bali
 P("Made Wirawan","L","tukang bangunan teliti"), P("Ni Luh Ayu","P","penari riang"), P("Ketut Arsa","L","petani sabar"),
 P("Komang Sri","P","pandai mengatur"), P("Wayan Gede","L","suka bekerja keras"), P("Nyoman Dewi","P","penuh rasa syukur"),
 # Betawi, Madura, Banjar, Dayak, Aceh, Manado, Maluku, Papua, Sasak, Tionghoa-Indonesia
 P("Mpok Ijah","P","cerewet tapi baik hati"), P("Bang Rojali","L","jago silat"),
 P("Matrawi","L","pantang menyerah"), P("Halimah","P","pedagang ulung"),
 P("Galuh","P","lincah"), P("Utuh","L","pendayung handal"),
 P("Bujang Ilai","L","pemburu jeli"), P("Dayang Lenggang","P","tahu banyak tanaman obat"),
 P("Teuku Rizal","L","disiplin"), P("Cut Meutia","P","berani dan tegas"),
 P("Jefri Lumentut","L","periang"), P("Stevani Rondonuwu","P","suka menolong"),
 P("Yopi Pattinama","L","perenang ulung"), P("Ona Latuconsina","P","penyanyi desa"),
 P("Yakob Wenda","L","pendaki tangguh"), P("Maria Kogoya","P","kuat dan sabar"),
 P("Lalu Hamzah","L","penggembala setia"), P("Baiq Nurul","P","penenun cekatan"),
 P("Liem Hok","L","pandai membuat alat"), P("Mei Ling","P","rapi dan cermat"),
]
for p in penduduk:
    p["jenis_kelamin"] = "laki-laki" if p["jenis_kelamin"] == "L" else "perempuan"

log = {
 "kerja": [
  "Hari {hari}: {nama} menebang pohon dan membawa pulang {jumlah} {sumber_daya}.",
  "Hari {hari}: {nama} memetik buah dari semak sambil bersenandung kecil.",
  "Hari {hari}: {nama} memancing di sungai dan mendapat {jumlah} ikan. Lumayan untuk makan malam!",
  "Hari {hari}: {nama} menambang batu sampai tangannya berdebu, tapi wajahnya puas.",
  "Hari {hari}: {nama} menimba {jumlah} air dari sungai untuk persediaan desa.",
  "Hari {hari}: Kemampuan {skill} {nama} meningkat. Ia makin percaya diri!",
  "Hari {hari}: {nama} dan {nama2} bekerja sama mengangkut {jumlah} {sumber_daya} ke Gudang.",
  "Hari {hari}: {nama} menanam benih gandum di Ladang dengan hati-hati.",
  "Hari {hari}: {nama} mengolah gandum menjadi {jumlah} roti hangat di Dapur.",
  "Hari {hari}: {nama} membuat perkakas baru di Bengkel alat. Bunyi palunya terdengar sampai sungai.",
  "Hari {hari}: {nama} kelelahan dan tertidur pulas di dekat Api unggun.",
  "Hari {hari}: {nama} berhenti bekerja sebentar untuk makan. Perut kenyang, kerja pun senang."
 ],
 "sosial": [
  "Hari {hari}: {nama} dan {nama2} bercerita di dekat Api unggun sampai larut malam.",
  "Hari {hari}: {nama} menghibur {nama2} yang sedang murung. Suasana hati desa membaik.",
  "Hari {hari}: {nama} mengajari {nama2} cara {skill}. Mereka tertawa saat percobaan pertama gagal.",
  "Hari {hari}: {nama} dan {nama2} berdebat soal siapa yang memasak paling enak. Akhirnya mereka makan bersama.",
  "Hari {hari}: Seluruh desa makan malam bersama. Malam ini terasa hangat sekali.",
  "Hari {hari}: {nama} menyanyikan lagu daerah, dan {nama2} ikut bertepuk tangan.",
  "Hari {hari}: {nama} berbagi jatah makanannya dengan {nama2} yang belum sempat makan.",
  "Hari {hari}: {nama} merasa rindu kampung halaman, tapi senyum teman-teman membuatnya betah."
 ],
 "temuan": [
  "Hari {hari}: {nama} menemukan batu besi di dekat tebing!",
  "Hari {hari}: {nama} menemukan sarang lebah. Ada madu manis untuk semua.",
  "Hari {hari}: {nama} menemukan {jumlah} {sumber_daya} tersembunyi di balik semak.",
  "Hari {hari}: {nama} menemukan jejak hewan di tepi hutan. Sebaiknya berhati-hati.",
  "Hari {hari}: {nama} menemukan sebuah kendi tua berisi benih. Mungkin bisa ditanam?",
  "Hari {hari}: {nama} menemukan tempat memancing baru yang ikannya melimpah.",
  "Hari {hari}: {nama} memungut bulu burung yang cantik dan menyelipkannya di rambut."
 ],
 "cuaca": [
  "Hari {hari}: Matahari bersinar cerah. Semua orang bekerja dengan semangat.",
  "Hari {hari}: Hujan turun pelan. Penduduk berteduh sambil menikmati suara rintik.",
  "Hari {hari}: Kabut pagi menutupi desa. {nama} hampir tersesat ke sungai.",
  "Hari {hari}: Angin kencang menggoyang pepohonan. Atap Gubuk berderit-derit.",
  "Hari {hari}: Musim {musim} telah tiba. {pesan_musim}",
  "Hari {hari}: Udara musim dingin menusuk tulang. Api unggun menyala lebih lama malam ini.",
  "Hari {hari}: Pelangi muncul setelah hujan. {nama} berhenti sejenak untuk memandanginya."
 ],
 "pembangunan": [
  "Hari {hari}: {nama} mulai membangun {bangunan}.",
  "Hari {hari}: {bangunan} selesai dibangun! Penduduk bersorak gembira.",
  "Hari {hari}: {nama} dan {nama2} memasang tiang terakhir {bangunan}.",
  "Hari {hari}: Pembangunan {bangunan} tertunda karena {sumber_daya} kurang {jumlah}.",
  "Hari {hari}: {nama} memperbaiki {bangunan} yang rusak.",
  "Hari {hari}: Desa memasuki era {era}! Bangunan dan teknologi baru terbuka."
 ],
 "kebutuhan": [
  "Hari {hari}: {nama} kelaparan dan berhenti bekerja untuk mencari makanan.",
  "Hari {hari}: {nama} terlalu lelah. Ia butuh tidur sebelum bisa bekerja lagi.",
  "Hari {hari}: Stok {sumber_daya} tinggal {jumlah}. Penduduk mulai cemas.",
  "Hari {hari}: {nama} sedang murung. Mungkin ia butuh istirahat atau teman bicara.",
  "Hari {hari}: Tidak ada tempat tidur untuk {nama}. Ia tidur beralas daun malam ini."
 ],
 "keluarga": [
  "Hari {hari}: Seorang bayi lahir! Selamat datang, {nama}.",
  "Hari {hari}: {nama} tiba di desa dan memutuskan untuk tinggal.",
  "Hari {hari}: {nama} berulang tahun ke-{umur}. Semua orang memberi ucapan selamat.",
  "Hari {hari}: {nama} dan {nama2} kini resmi menjadi keluarga. Desa merayakannya dengan makan bersama."
 ]
}

E = lambda id, judul, desk, pilihan, kategori="umum": {"id": id, "judul": judul, "kategori": kategori, "deskripsi": desk, "pilihan": pilihan}
C = lambda teks, efek, hasil: {"teks": teks, "efek": efek, "teks_hasil": hasil}
event = [
 E("badai","Badai Datang!","Langit mendadak gelap dan angin menderu. Badai akan segera menghantam desa. Apa yang harus dilakukan penduduk?",[
  C("Semua berlindung di dalam rumah",{"suasana_hati":-5,"hari_kerja_hilang":1},"Penduduk meringkuk bersama sampai badai reda. Pekerjaan tertunda, tapi semua selamat."),
  C("Perkuat atap dengan kayu",{"kayu":-15,"suasana_hati":5},"Atap diperkuat tepat waktu. Badai lewat tanpa merusak satu bangunan pun."),
  C("Lanjutkan bekerja seperti biasa",{"kesehatan_bangunan":-20,"kayu":10,"suasana_hati":-10},"Beberapa dahan tumbang bisa dijadikan kayu, tapi bangunan rusak dan penduduk basah kuyup.")
 ],"cuaca"),
 E("pedagang_keliling","Pedagang Keliling","Seorang pedagang berpikul tiba di desa sambil membunyikan lonceng kecil. \"Barang bagus, harga bersahabat!\" katanya.",[
  C("Tukar kayu dengan makanan",{"kayu":-15,"makanan":6},"Pedagang mengangguk puas. Lumbung desa terasa sedikit lebih penuh."),
  C("Beli perkakas dengan batu",{"batu":-15,"alat":2},"Perkakas baru berkilau di tangan penduduk. Kerja jadi lebih cepat!"),
  C("Tawarkan teh hangat saja",{"suasana_hati":5},"Pedagang berterima kasih dan berjanji akan mampir lagi. Ia juga meninggalkan cerita lucu dari desa seberang.")
 ],"perdagangan"),
 E("pendatang","Pendatang Mengetuk","Seorang pengembara lelah berhenti di tepi desa. Ia bertanya apakah ada tempat untuknya bernaung.",[
  C("Sambut dengan hangat",{"penduduk":1,"makanan":-10,"suasana_hati":5},"{nama} kini menjadi bagian dari desa. Wajahnya langsung cerah."),
  C("Beri bekal lalu antar pergi",{"makanan":-5},"Pengembara pamit sambil tersenyum. Mungkin suatu hari ia akan kembali."),
  C("Tolak dengan sopan",{"suasana_hati":-3},"Pengembara berlalu pelan. Beberapa penduduk tampak sedikit sedih.")
 ],"penduduk"),
 E("hewan_buas","Babi Hutan Mengamuk","Seekor babi hutan besar menerobos semak dan mendekati ladang! Penduduk panik.",[
  C("Kumpulkan penduduk untuk mengusirnya",{"energi":-15,"daging":8,"kulit":2},"Dengan teriakan dan obor, babi hutan berhasil dihalau. Desa bahkan mendapat daging dan kulit."),
  C("Bangun pagar darurat",{"kayu":-20},"Pagar kayu berdiri tepat waktu. Babi hutan mendengus lalu pergi."),
  C("Biarkan saja dan berlindung",{"makanan":-20,"gandum":-10},"Babi hutan berpesta di ladang. Panen kali ini berkurang.")
 ],"bahaya"),
 E("serigala_malam","Lolongan di Malam Hari","Lolongan serigala terdengar dari arah hutan. Penduduk tidak bisa tidur dengan tenang.",[
  C("Nyalakan api unggun lebih besar",{"kayu":-10,"energi":-5},"Cahaya api membuat serigala menjauh. Malam pun berlalu dengan damai."),
  C("Jaga bergantian sepanjang malam",{"energi":-20,"suasana_hati":5},"Para penjaga mengantuk esok harinya, tapi semua merasa aman.")
 ],"bahaya"),
 E("panen_raya","Panen Raya!","Ladang menguning dan buah bergelantungan di mana-mana. Ini panen terbaik tahun ini!",[
  C("Simpan semua di Lumbung",{"gandum":8,"makanan":5},"Lumbung penuh sesak. Musim dingin tidak lagi menakutkan."),
  C("Adakan pesta panen",{"makanan":5,"suasana_hati":15},"Penduduk menari dan bernyanyi semalaman. Ini malam yang akan dikenang lama."),
  C("Jual sebagian ke pedagang",{"gandum":4,"alat":1,"batu":8},"Sebagian hasil panen ditukar dengan barang berguna untuk membangun.")
 ],"musim"),
 E("wabah","Wabah Batuk","Beberapa penduduk mulai batuk dan demam. Penyakit menyebar perlahan di desa.",[
  C("Rawat dengan ramuan daun obat",{"makanan":-15,"kesehatan":10},"Ramuan pahit itu ampuh. Satu per satu penduduk mulai pulih."),
  C("Istirahatkan semua yang sakit",{"hari_kerja_hilang":2,"kesehatan":5},"Pekerjaan berhenti beberapa hari, tapi penyakit tidak menyebar lebih luas."),
  C("Tetap bekerja, berharap cepat sembuh",{"kesehatan":-20,"suasana_hati":-10},"Penyakit makin menyebar. Desa terasa sepi dan lesu.")
 ],"bahaya"),
 E("kekeringan","Sungai Menyusut","Sudah lama hujan tidak turun. Permukaan sungai turun drastis.",[
  C("Gali sumur lebih dalam",{"batu":-15,"energi":-10,"air":20},"Air jernih memancar dari dalam tanah. Desa lega!"),
  C("Hemat air untuk sementara",{"air":-5,"suasana_hati":-5},"Penduduk berhemat sambil menunggu hujan. Tidak nyaman, tapi aman.")
 ],"cuaca"),
 E("anak_hilang","Si Kecil Tersesat","{nama} belum kembali dari hutan padahal hari mulai gelap.",[
  C("Kirim regu pencari dengan obor",{"kayu":-5,"energi":-10,"suasana_hati":10},"{nama} ditemukan sedang memeluk seekor anak rusa. Semua lega dan tertawa."),
  C("Tunggu di dekat api unggun",{"suasana_hati":-5},"Menjelang tengah malam, {nama} pulang sendiri sambil membawa segenggam jamur.")
 ],"penduduk"),
 E("hujan_meteor","Bintang Jatuh","Langit malam dipenuhi bintang jatuh. Penduduk berkumpul di luar rumah.",[
  C("Begadang menikmati langit",{"energi":-10,"suasana_hati":15},"Setiap orang membuat permohonan. Malam ini terasa ajaib."),
  C("Cari batu yang jatuh di bukit",{"energi":-5,"batu":10,"alat":1},"Mereka menemukan batu aneh yang keras, cocok untuk membuat perkakas.")
 ],"langka"),
 E("musim_dingin_keras","Musim Dingin Menggigit","Salju turun lebih tebal dari biasanya. Tanaman tidak tumbuh dan udara sangat dingin.",[
  C("Bagikan kulit untuk pakaian hangat",{"kulit":-5,"kesehatan":10},"Penduduk tetap hangat dengan pakaian kulit baru."),
  C("Kumpulkan semua di dekat api unggun",{"kayu":-20,"suasana_hati":5},"Malam-malam panjang dilalui bersama dengan cerita dan tawa.")
 ],"musim"),
 E("festival_desa","Hari Jadi Desa","Hari ini tepat satu tahun desa berdiri. Penduduk ingin merayakannya.",[
  C("Gelar pesta besar",{"makanan":-30,"suasana_hati":25},"Desa penuh lampu, musik, dan masakan lezat. Semua orang bahagia."),
  C("Syukuran sederhana",{"makanan":-10,"suasana_hati":10},"Doa dan makan bersama yang sederhana, tapi terasa sangat bermakna.")
 ],"perayaan")
]

tutorial = [
 {"langkah":1,"judul":"Selamat Datang, Kepala Desa!","teks":"Dua penduduk baru saja tiba di tanah kecil ini. Mereka akan bekerja sendiri. Tugasmu adalah menjaga dan menuntun mereka."},
 {"langkah":2,"judul":"Perhatikan Kebutuhan","teks":"Setiap penduduk punya Lapar, Energi, dan Suasana hati. Jika lapar atau lelah, mereka berhenti bekerja untuk makan dan tidur."},
 {"langkah":3,"judul":"Atur Prioritas Kerja","teks":"Buka panel Prioritas untuk menentukan apa yang lebih dulu dikerjakan: menebang, menambang, bertani, membangun, atau berburu."},
 {"langkah":4,"judul":"Taruh Rencana Bangunan","teks":"Pilih bangunan dari menu, lalu letakkan di peta. Mulailah dengan Api unggun dan Gubuk agar penduduk punya tempat beristirahat."},
 {"langkah":5,"judul":"Hadapi Kejadian Tak Terduga","teks":"Badai, hewan buas, atau tamu bisa datang kapan saja. Pilih responsmu dengan bijak, dan jangan lupa siapkan stok makanan sebelum musim dingin."}
]

Q = lambda id, judul, desk, tipe, target, jml, hadiah, selesai, tingkat: {"id":id,"urutan":tingkat,"judul":judul,"deskripsi":desk,"tujuan":{"tipe":tipe,"target":target,"jumlah":jml},"hadiah":hadiah,"teks_selesai":selesai}
quest = [
 Q("q01_api_pertama","Api Pertama","Malam pertama akan segera tiba. Bangun Api unggun agar penduduk merasa hangat dan aman.","bangun","api_unggun",1,{"suasana_hati":10},"Nyala api menerangi wajah kedua penduduk. Rumah baru ini mulai terasa seperti rumah.",1),
 Q("q02_kayu_bakar","Tumpukan Kayu","Kumpulkan kayu untuk persiapan membangun.","kumpulkan","kayu",20,{"makanan":6},"Tumpukan kayu tersusun rapi. Penduduk siap membangun!",2),
 Q("q03_atap_pertama","Atap di Atas Kepala","Bangun Gubuk supaya penduduk bisa tidur nyenyak.","bangun","gubuk",1,{"kayu":10,"suasana_hati":5},"Untuk pertama kalinya, penduduk tidur beratap. Dengkuran pelan terdengar sampai pagi.",3),
 Q("q04_perut_kenyang","Perut Kenyang","Kumpulkan makanan dari buah, ikan, atau daging.","kumpulkan","makanan",30,{"batu":10},"Ada cukup makanan untuk beberapa hari ke depan. Semua bisa bekerja dengan tenang.",4),
 Q("q05_gudang","Tempat Menyimpan","Bangun Gudang agar sumber daya tidak berserakan.","bangun","gudang",1,{"kayu":15,"batu":15},"Semua barang kini tersimpan rapi. Penduduk tak perlu lagi mencari-cari.",5),
 Q("q06_air_bersih","Air Bersih","Bangun Sumur supaya penduduk tidak perlu bolak-balik ke sungai.","bangun","sumur",1,{"air":20,"suasana_hati":5},"Air jernih kini ada di tengah desa. Langkah penduduk terasa lebih ringan.",6),
 Q("q07_ladang_pertama","Benih Harapan","Bangun Ladang dan panen gandum pertama desa.","kumpulkan","gandum",20,{"makanan":10},"Bulir gandum pertama berayun ditiup angin. Masa depan desa terlihat cerah.",7),
 Q("q08_desa_bertumbuh","Keluarga Bertambah","Siapkan makanan berlebih dan rumah kosong agar penduduk baru mau tinggal.","capai_penduduk","penduduk",5,{"alat":2,"suasana_hati":10},"Kini ada lima penduduk di desa. Suara tawa terdengar di mana-mana.",8),
 Q("q09_siap_dingin","Siap Hadapi Musim Dingin","Bangun Lumbung dan isi dengan stok makanan sebelum musim dingin tiba.","simpan","makanan",100,{"kulit":5,"kayu":30},"Lumbung penuh. Saat salju turun nanti, tak seorang pun akan kelaparan.",9),
 Q("q10_dusun","Dari Perkemahan Menjadi Dusun","Bangun Rumah kayu dan Dapur, lalu capai 8 penduduk untuk naik ke era Dusun.","capai_era","dusun",1,{"papan":20,"batu_bata":20,"suasana_hati":20},"Perkemahan kecil kini menjadi Dusun yang ramai. Perjalanan desa baru saja dimulai!",10)
]

meta = {
 "judul_game":"Desa Mandiri",
 "versi":"1.0.0",
 "bahasa":"id-ID",
 "encoding":"UTF-8",
 "nuansa":"Hangat, santai, dan menggemaskan. Pemain menjaga penduduk kecil yang hidup mandiri. Ancaman nyata tapi ringan (badai, babi hutan, wabah, kekurangan makanan), dengan kehangatan kebersamaan sebagai penyeimbang.",
 "placeholder":{
  "{hari}":"Nomor hari berjalan dalam permainan (angka)",
  "{nama}":"Nama penduduk utama dalam cerita",
  "{nama2}":"Nama penduduk kedua (harus berbeda dari {nama})",
  "{jumlah}":"Jumlah/angka sumber daya",
  "{sumber_daya}":"Nama sumber daya, lihat meta.sumber_daya",
  "{bangunan}":"Nama bangunan, lihat meta.bangunan",
  "{skill}":"Nama skill, lihat meta.skill",
  "{musim}":"Nama musim, lihat meta.musim",
  "{pesan_musim}":"Pesan pembuka musim, lihat meta.musim[].pesan",
  "{era}":"Nama era, lihat meta.era",
  "{umur}":"Umur penduduk (angka)"
 },
 "sumber_daya":{
  "kayu":"Kayu","batu":"Batu","makanan":"Makanan","buah":"Buah","ikan":"Ikan","daging":"Daging","air":"Air",
  "gandum":"Gandum","roti":"Roti","papan":"Papan","batu_bata":"Batu bata","alat":"Alat (perkakas)","kulit":"Kulit/pakaian"
 },
 "bangunan":{
  "api_unggun":"Api unggun","gubuk":"Gubuk","gudang":"Gudang","ladang":"Ladang","sumur":"Sumur",
  "tempat_penebangan":"Tempat penebangan","tambang":"Tambang","dapur":"Dapur","bengkel_alat":"Bengkel alat",
  "rumah_kayu":"Rumah kayu","lumbung":"Lumbung","pasar":"Pasar","balai_desa":"Balai desa"
 },
 "skill":{"menebang":"menebang","menambang":"menambang","bertani":"bertani","membangun":"membangun","berburu":"berburu"},
 "kebutuhan":{"lapar":"Lapar","energi":"Energi","suasana_hati":"Suasana hati"},
 "musim":[
  {"id":"semi","nama":"semi","pesan":"Tunas-tunas baru bermunculan. Saatnya menanam!"},
  {"id":"panas","nama":"panas","pesan":"Hari-hari panjang dan cerah. Jangan lupa stok air."},
  {"id":"gugur","nama":"gugur","pesan":"Daun berguguran. Waktunya panen dan menyimpan makanan."},
  {"id":"dingin","nama":"dingin","pesan":"Tanaman berhenti tumbuh. Semoga Lumbung cukup penuh."}
 ],
 "era":{"perkemahan":"Perkemahan","dusun":"Dusun","desa_pertanian":"Desa Pertanian","kota_kecil":"Kota Kecil"},
 "kunci_efek":{
  "_catatan":"Efek event dan hadiah quest memakai key sumber daya (meta.sumber_daya) serta key berikut. Nilai positif menambah, negatif mengurangi.",
  "suasana_hati":"Perubahan suasana hati seluruh penduduk (poin)",
  "energi":"Perubahan energi seluruh penduduk (poin)",
  "kesehatan":"Perubahan kesehatan seluruh penduduk (poin)",
  "penduduk":"Perubahan jumlah penduduk (orang)",
  "hari_kerja_hilang":"Jumlah hari penduduk tidak bekerja",
  "kesehatan_bangunan":"Perubahan kondisi bangunan (persen)"
 },
 "tipe_tujuan_quest":{
  "bangun":"Selesaikan bangunan dengan id target sebanyak jumlah",
  "kumpulkan":"Kumpulkan sumber daya target secara kumulatif sebanyak jumlah",
  "simpan":"Miliki stok sumber daya target minimal jumlah pada satu waktu",
  "capai_penduduk":"Capai jumlah penduduk minimal jumlah",
  "capai_era":"Capai era dengan id target"
 }
}


# =====================================================================
# TAHAP 3 (v1.1.0) — hanya penambahan. Spec: docs/RISET-TAHAP3.md bagian 6.
# Jangan ubah data v1.0.0 di atas; game.js sudah memakainya.
# =====================================================================

menu = {
 "judul":"Desa Mandiri",
 "subjudul":"Sebuah desa mungil yang tumbuh pelan-pelan, bersama penduduk yang punya pikiran sendiri.",
 "slogan_acak":[
  "Api unggun sudah menyala. Penduduk menunggumu.",
  "Hari ini cerah. Cocok untuk menanam sesuatu.",
  "Ada bau roti hangat dari arah dapur...",
  "Penduduk sedang bersenandung sambil bekerja.",
  "Gudang belum penuh, tapi hati sudah hangat."
 ],
 "tombol":{
  "mulai":"Mulai Desa Baru",
  "lanjut":"Lanjutkan",
  "muat":"Muat Simpanan",
  "simpan":"Simpan Sekarang",
  "pengaturan":"Pengaturan",
  "kredit":"Kredit",
  "keluar":"Keluar",
  "kembali":"Kembali",
  "ya":"Ya",
  "tidak":"Tidak",
  "batal":"Batal",
  "tutup":"Tutup"
 },
 "keterangan_tombol":{
  "mulai":"Mulai dari dua penduduk dan sebuah tanah kecil yang masih sepi.",
  "lanjut":"Kembali ke desamu tepat di hari terakhir kamu bermain.",
  "muat":"Buka desa yang pernah disimpan di peramban ini.",
  "pengaturan":"Atur suara, kecepatan, tampilan, dan simpanan otomatis.",
  "kredit":"Orang-orang baik di balik desa kecil ini.",
  "keluar":"Istirahat dulu. Penduduk akan menunggu dengan sabar."
 },
 "konfirmasi":{
  "mulai_baru":{
   "judul":"Mulai Desa Baru?",
   "teks":"Desa yang sedang berjalan akan diganti dengan desa baru. Penduduk lama akan melambaikan tangan untuk terakhir kali. Lanjutkan?",
   "ya":"Mulai dari awal",
   "tidak":"Tetap di desa ini"
  },
  "muat":{
   "judul":"Muat Simpanan?",
   "teks":"Kemajuan yang belum disimpan akan hilang. Yakin ingin memuat simpanan Hari {hari}?",
   "ya":"Muat",
   "tidak":"Batal"
  },
  "keluar":{
   "judul":"Mau Istirahat Dulu?",
   "teks":"Desa akan disimpan dulu sebelum kamu pergi. Sampai jumpa lagi, Kepala Desa!",
   "ya":"Simpan dan keluar",
   "tidak":"Main sebentar lagi"
  },
  "kembali_ke_menu":{
   "judul":"Kembali ke Menu Utama?",
   "teks":"Permainan akan dijeda dan disimpan. Penduduk akan tetap di tempatnya.",
   "ya":"Ke menu utama",
   "tidak":"Tetap bermain"
  }
 },
 "pesan":{
  "tidak_ada_simpanan":"Belum ada desa yang tersimpan. Yuk, mulai desa baru!",
  "simpanan_rusak":"Simpanan ini tidak bisa dibuka. Mungkin dibuat dengan versi lama.",
  "memuat":"Membangunkan penduduk...",
  "tersimpan":"Desa tersimpan. Hari {hari}, era {era}.",
  "info_simpanan":"Hari {hari} · {era} · {jumlah} penduduk",
  "keluar_web":"Kamu bisa menutup tab ini dengan aman. Desa sudah tersimpan."
 },
 "kredit":{
  "judul":"Kredit",
  "baris":[
   "Desa Mandiri",
   "Ide dan arahan: Ichwan El Hamdani",
   "Desain, kode, teks, dan pixel art dikerjakan bersama tim asisten",
   "Terinspirasi oleh kehangatan game desa kecil seperti The Little Land",
   "Terima kasih sudah menjaga penduduk kecil ini!"
  ],
  "penutup":"Dibuat dengan secangkir teh dan banyak kesabaran."
 }
}

pengaturan = {
 "judul":"Pengaturan",
 "grup":{"suara":"Suara","permainan":"Permainan","tampilan":"Tampilan","data":"Data"},
 "tombol":{"simpan":"Simpan","batal":"Batal","bawaan":"Kembalikan ke bawaan","tutup":"Tutup"},
 "pesan_tersimpan":"Pengaturan disimpan.",
 "opsi":{
  "volume_musik":{"grup":"suara","label":"Volume Musik","deskripsi":"Seberapa keras alunan musik desa terdengar. Geser ke 0 untuk sunyi.","nilai_nol":"Senyap"},
  "volume_efek":{"grup":"suara","label":"Volume Efek","deskripsi":"Bunyi kapak, palu, kicau burung, dan lonceng pedagang.","nilai_nol":"Senyap"},
  "kecepatan_game":{"grup":"permainan","label":"Kecepatan Awal","deskripsi":"Kecepatan waktu saat permainan dimulai atau dimuat. Bisa diganti kapan saja lewat tombol di layar.",
   "nilai":{"jeda":"Jeda","1x":"Santai (1x)","2x":"Cepat (2x)","4x":"Sangat cepat (4x)"}},
  "jeda_saat_event":{"grup":"permainan","label":"Jeda Saat Ada Kejadian","deskripsi":"Waktu berhenti otomatis saat ada kejadian penting, supaya kamu bisa memilih dengan tenang."},
  "bahasa":{"grup":"permainan","label":"Bahasa","deskripsi":"Bahasa teks di dalam permainan.","nilai":{"id-ID":"Bahasa Indonesia"}},
  "autosave":{"grup":"data","label":"Simpan Otomatis","deskripsi":"Seberapa sering desa disimpan sendiri di peramban ini.",
   "nilai":{"mati":"Mati","tiap_hari":"Setiap pagi","tiap_musim":"Setiap pergantian musim"},"pesan":"Desa tersimpan otomatis."},
  "tampilan":{"grup":"tampilan","label":"Tampilan","deskripsi":"Atur apa saja yang terlihat di peta.",
   "sub":{
    "tampilkan_nama":{"label":"Nama Penduduk","deskripsi":"Tampilkan nama di atas kepala setiap penduduk."},
    "tampilkan_kebutuhan":{"label":"Bar Kebutuhan","deskripsi":"Tampilkan bar lapar, energi, dan kesehatan di dekat penduduk."},
    "efek_cuaca":{"label":"Efek Cuaca","deskripsi":"Hujan, salju, dan kilau kecil. Matikan jika peramban terasa berat."},
    "zoom_awal":{"label":"Zoom Awal","deskripsi":"Seberapa dekat kamera saat permainan dimulai."},
    "layar_penuh":{"label":"Layar Penuh","deskripsi":"Isi seluruh layar supaya desa terlihat lebih luas."}
   }},
  "reset_data":{"grup":"data","label":"Hapus Semua Data","deskripsi":"Menghapus desa tersimpan, pencapaian, dan pengaturan dari peramban ini.",
   "konfirmasi":{"judul":"Hapus Semua Data?","teks":"Semua desa, pencapaian, dan pengaturan akan hilang dan tidak bisa dikembalikan. Penduduk akan sangat merindukanmu.","ya":"Ya, hapus semuanya","tidak":"Jangan, simpan saja"},
   "konfirmasi_kedua":{"judul":"Benar-benar yakin?","teks":"Ini langkah terakhir. Tekan tombol di bawah sekali lagi untuk menghapus.","ya":"Hapus sekarang","tidak":"Batal"},
   "berhasil":"Semua data sudah dihapus. Tanah kecil itu kembali sepi, menunggu desa baru."}
 }
}

# Pohon teknologi: id/nama/era/prasyarat persis RISET-TAHAP3.md bagian 1.
# prasyarat = id teknologi saja; syarat non-tech ada di syarat_tambahan (gaya tujuan quest).
# Biaya & durasi riset (work) tetap milik balance.js, tidak diulang di sini.
S_ = lambda tipe, target, jml: {"tipe":tipe,"target":target,"jumlah":jml}
T = lambda id, nama, cabang, era, pra, desk, efek, terbuka, selesai, tambahan=None: {"id":id,"nama":nama,"cabang":cabang,"era":era,"prasyarat":pra,"syarat_tambahan":tambahan or [],"deskripsi":desk,"efek_ringkas":efek,"teks_terbuka":terbuka,"teks_selesai":selesai}
teknologi = [
 T("T01","Api Terjaga","bertahan","perkemahan",[],
   "Cara menata kayu bakar agar api unggun menyala lebih lama dan lebih hangat.",
   "Kehangatan api unggun terasa lebih jauh, dan kayu bakarnya lebih awet.",
   "Penduduk mulai memperhatikan cara api menari. Mungkin ada cara membuatnya lebih awet?",
   "{nama} menyelesaikan riset Api Terjaga. Api unggun kini menyala tenang semalaman, dan semua orang ingin duduk di dekatnya."),
 T("T02","Keranjang Anyam","produksi","perkemahan",[],
   "Anyaman daun dan rotan untuk membawa lebih banyak barang sekali jalan.",
   "Penduduk bisa membawa lebih banyak kayu dan makanan setiap kali mengangkut.",
   "{nama} melihat daun-daun panjang di tepi sungai dan mulai berpikir untuk menganyam sesuatu.",
   "{nama} menyelesaikan riset Keranjang Anyam. Kini tak ada lagi buah yang jatuh menggelinding di jalan pulang."),
 T("T03","Cangkul Kayu","produksi","dusun",["T02"],
   "Cangkul sederhana dari kayu keras supaya tanah lebih mudah digemburkan.",
   "Menanam dan memanen di ladang jadi lebih cepat.",
   "Tanah ladang ternyata keras sekali. Penduduk butuh alat yang lebih baik dari tangan kosong.",
   "{nama} menyelesaikan riset Cangkul Kayu. Tanah ladang kini gembur dan wangi."),
 T("T04","Irigasi Sederhana","produksi","dusun",["T03"],
   "Saluran kecil dari sumur ke ladang agar tanaman tak pernah kehausan.",
   "Tanaman di dekat sumur tumbuh lebih cepat.",
   "Air sumur dan ladang letaknya berdekatan. Bagaimana kalau keduanya dihubungkan?",
   "{nama} menyelesaikan riset Irigasi Sederhana. Air mengalir pelan di antara petak, dan tunas-tunas tampak berseri."),
 T("T05","Pengawetan","bertahan","dusun",["T01"],
   "Teknik mengasap dan mengeringkan makanan supaya tahan lama.",
   "Makanan lebih awet, dan penduduk tidak cepat lapar saat musim dingin.",
   "Ada sisa ikan yang tergantung di dekat api dan ternyata tidak basi. Menarik sekali!",
   "{nama} menyelesaikan riset Pengawetan. Ikan asap dan buah kering tersusun rapi menunggu musim dingin."),
 T("T06","Dapur Hemat","masyarakat","dusun",["T05"],
   "Resep dan tungku yang membuat setiap porsi lebih mengenyangkan.",
   "Makan di Dapur memberi rasa kenyang yang lebih lama.",
   "Para juru masak desa mulai bertukar resep rahasia di dekat tungku.",
   "{nama} menyelesaikan riset Dapur Hemat. Porsinya sama, tapi perut terasa jauh lebih puas."),
 T("T07","Bajak Besi","produksi","desa_pertanian",["T03"],
   "Mata bajak dari besi yang membelah tanah lebih dalam.",
   "Setiap petak ladang menghasilkan panen lebih banyak.",
   "Batu besi dan perkakas sudah cukup. Saatnya ladang mendapat alat yang lebih kuat.",
   "{nama} menyelesaikan riset Bajak Besi. Alur tanah kini lurus dan dalam, siap menampung panen besar.",
   [S_("simpan","alat",3)]),
 T("T08","Lumbung Bertingkat","bertahan","desa_pertanian",["T05"],
   "Rak bertingkat di lumbung agar lebih banyak pangan muat tanpa berdesakan.",
   "Desa bisa menyimpan lebih banyak makanan, dan peringatan stok muncul lebih awal.",
   "Lumbung mulai sesak. Karung gandum bertumpuk sampai ke pintu.",
   "{nama} menyelesaikan riset Lumbung Bertingkat. Karung-karung kini berbaris rapi dari lantai sampai atap."),
 T("T09","Bibit Unggul","produksi","desa_pertanian",["T04","T07"],
   "Memilih biji terbaik dari panen sebelumnya untuk ditanam lagi.",
   "Kadang-kadang satu petak memberi panen bagus yang jauh lebih banyak.",
   "{nama} menyimpan segenggam biji gandum paling gemuk. \"Yang ini jangan dimakan dulu!\"",
   "{nama} menyelesaikan riset Bibit Unggul. Bulir gandum kini lebih besar dan lebih berkilau."),
 T("T10","Parit Air","bertahan","desa_pertanian",["T04"],
   "Parit berlapis batu yang menyimpan dan menyalurkan air bersih ke seluruh desa.",
   "Penduduk butuh lebih sedikit air, dan sumur memberi lebih banyak.",
   "Penduduk bolak-balik membawa ember setiap hari. Pasti ada cara yang lebih santai.",
   "{nama} menyelesaikan riset Parit Air. Gemericik air kini terdengar di setiap sudut desa."),
 T("T11","Gerobak","produksi","desa_pertanian",["T02"],
   "Gerobak beroda kayu untuk mengangkut barang lebih cepat dan lebih jauh.",
   "Penduduk mengangkut barang lebih cepat dan mau bekerja sedikit lebih jauh.",
   "{nama} melihat batang kayu bundar menggelinding di bukit, lalu tersenyum lebar.",
   "{nama} menyelesaikan riset Gerobak. Roda pertama berderit gembira menyusuri jalan desa."),
 T("T12","Tempa Baja","produksi","desa_pertanian",[],
   "Seni menempa besi berulang-ulang hingga menjadi baja yang kuat.",
   "Perkakas bekerja lebih baik dan jauh lebih awet.",
   "Bengkel alat sudah berdiri. Denting palunya mengundang ide-ide baru.",
   "{nama} menyelesaikan riset Tempa Baja. Perkakas baru berkilau dan tidak mudah tumpul.",
   [S_("bangun","bengkel_alat",1)]),
 T("T13","Pakaian Hangat","bertahan","desa_pertanian",["T05"],
   "Menjahit kulit dan bulu menjadi baju tebal untuk musim dingin.",
   "Penduduk tidak cepat lapar dan tetap ceria saat musim dingin.",
   "Kulit hewan menumpuk di gudang. {nama} membayangkan jaket yang hangat dan lembut.",
   "{nama} menyelesaikan riset Pakaian Hangat. Semua orang kini terlihat bulat dan menggemaskan dalam baju tebal.",
   [S_("simpan","kulit",5)]),
 T("T14","Pasar Resmi","perdagangan","desa_pertanian",[],
   "Aturan, lapak, dan jadwal dagang yang membuat pedagang betah datang.",
   "Membuka panel perdagangan, harga yang naik-turun, dan satu slot kontrak.",
   "Pasar sudah ramai, tapi tawar-menawarnya masih berantakan. Perlu sedikit aturan.",
   "{nama} menyelesaikan riset Pasar Resmi. Lapak-lapak kini berjajar rapi dan pedagang datang sambil bersiul.",
   [S_("bangun","pasar",1)]),
 T("T15","Timbangan","perdagangan","desa_pertanian",["T14"],
   "Timbangan jujur supaya setiap barang dihargai dengan adil.",
   "Barang yang dijual mendapat harga sedikit lebih baik.",
   "Pedagang sering bilang karung gandum desa \"kurang berat\". Benarkah?",
   "{nama} menyelesaikan riset Timbangan. Sekarang tak ada lagi yang bisa mengakali desa soal berat."),
 T("T16","Papan Pengumuman","masyarakat","kota_kecil",[],
   "Papan kayu di depan balai tempat kabar dan permintaan warga ditempel.",
   "Menambah satu misi harian dan lebih banyak cerita kecil di log.",
   "Balai desa sudah berdiri, tapi kabar masih menyebar dari mulut ke mulut.",
   "{nama} menyelesaikan riset Papan Pengumuman. Kertas pertama yang ditempel berbunyi: \"Dicari: kucing hilang, warna oranye.\"",
   [S_("bangun","balai_desa",1)]),
 T("T17","Sekolah Desa","masyarakat","kota_kecil",["T16"],
   "Ruang belajar kecil tempat yang tua mengajari yang muda.",
   "Penduduk belajar keterampilan lebih cepat, dan pendatang datang dengan sedikit bekal ilmu.",
   "Anak-anak desa terus bertanya \"kenapa?\". Saatnya ada tempat untuk menjawabnya.",
   "{nama} menyelesaikan riset Sekolah Desa. Suara anak-anak mengeja terdengar setiap pagi.",
   [S_("capai_penduduk","penduduk",10)]),
 T("T18","Dinding Bata","bertahan","kota_kecil",["T12"],
   "Dinding bata kokoh yang melindungi bangunan dari badai dan hewan nakal.",
   "Bangunan lebih sedikit rusak karena kejadian, dan penduduk merasa lebih aman.",
   "Batu bata sudah banyak. Bagaimana kalau dipakai untuk melindungi desa?",
   "{nama} menyelesaikan riset Dinding Bata. Desa kini dipeluk dinding hangat berwarna tanah liat.",
   [S_("simpan","batu_bata",40)]),
 T("T19","Gudang Bea","perdagangan","kota_kecil",["T14","T15"],
   "Gudang khusus barang dagangan, lengkap dengan catatan keluar-masuk yang rapi.",
   "Menambah satu slot kontrak dan memperbesar kuota dagang mingguan.",
   "Barang dagangan bercampur dengan stok desa. Pedagang mulai bingung mana yang dijual.",
   "{nama} menyelesaikan riset Gudang Bea. Setiap karung kini punya label dan tempatnya sendiri."),
 T("T20","Festival Adat","masyarakat","kota_kecil",["T16","T13"],
   "Hari raya tahunan dengan musik, tarian, dan makanan dari setiap keluarga.",
   "Sekali setahun desa berpesta: suasana hati melonjak dan pendatang lebih cepat tertarik.",
   "Penduduk datang dari banyak daerah. Masing-masing punya lagu dan tarian yang ingin dibagi.",
   "{nama} menyelesaikan riset Festival Adat. Kalender desa kini punya satu hari yang ditunggu semua orang."),
]

ui_progres = {
 "teknologi":{
  "judul_panel":"Pohon Teknologi",
  "subjudul":"Pilih satu ilmu untuk diteliti. Penduduk dengan prioritas riset akan mengerjakannya.",
  "cabang":{"bertahan":"Bertahan","produksi":"Produksi","masyarakat":"Masyarakat","perdagangan":"Perdagangan"},
  "label":{"prasyarat":"Butuh","biaya":"Biaya","durasi":"Lama riset","efek":"Manfaat","era":"Era"},
  "status":{"terkunci":"Terkunci","tersedia":"Bisa diteliti","sedang":"Sedang diteliti","selesai":"Sudah dikuasai"},
  "tombol":{"mulai":"Mulai Riset","batal":"Hentikan Riset","tutup":"Tutup"},
  "pesan":{
   "mulai":"Desa mulai meneliti {teknologi}. Semoga cepat ketemu jawabannya!",
   "progres":"Riset {teknologi}: {persen}% selesai.",
   "tertunda":"Riset {teknologi} tertunda. Tidak ada penduduk yang sempat meneliti.",
   "kurang_biaya":"Belum bisa meneliti {teknologi}. {sumber_daya} masih kurang {jumlah}.",
   "terkunci_prasyarat":"Kuasai dulu ilmu sebelumnya sebelum meneliti {teknologi}.",
   "terkunci_era":"{teknologi} baru bisa diteliti di era {era}.",
   "baru_terbuka":"Ilmu baru bisa diteliti: {teknologi}!"
  }
 },
 "pencapaian":{
  "judul_panel":"Pencapaian",
  "subjudul":"Cerita-cerita kecil yang sudah ditulis desamu.",
  "notifikasi":"🏅 Pencapaian terbuka: {pencapaian}!",
  "rahasia_nama":"???",
  "rahasia_deskripsi":"Pencapaian rahasia. Terus jalani hari-hari di desa dan lihat apa yang terjadi.",
  "progres":"{jumlah} dari {jumlah2} pencapaian",
  "kosong":"Belum ada pencapaian. Setiap desa besar dimulai dari satu api kecil."
 }
}

# Pencapaian A01–A18 persis RISET-TAHAP3.md bagian 3; A19+ tambahan.
# syarat bergaya tujuan quest (tipe/target/jumlah). hadiah = efek biasa; hadiah_khusus = efek non-sumber-daya.
A = lambda id, nama, desk, syarat, terbuka, hadiah=None, khusus=None, rahasia=False: dict(
  {"id":id,"nama":nama,"deskripsi":desk,"syarat":syarat,"hadiah":hadiah or {},"teks_terbuka":terbuka},
  **({"hadiah_khusus":khusus} if khusus else {}), **({"rahasia":True} if rahasia else {}))
pencapaian = [
 A("A01","Api Pertama","Bangun Api unggun pertama desa.",S_("bangun","api_unggun",1),
   "Percikan pertama menyala. Di sinilah semuanya dimulai.",{"suasana_hati":5}),
 A("A02","Atap di Kepala","Bangun Gubuk pertama.",S_("bangun","gubuk",1),
   "Tidak ada lagi tidur beralas daun. Hore untuk atap!"),
 A("A03","Lumbung Bukan Impian","Miliki stok makanan dan gandum gabungan minimal 40.",S_("simpan_pangan","pangan",40),
   "Persediaan menumpuk. Perut desa bisa tenang untuk sementara.",{"kayu":10}),
 A("A04","Musim Dingin Pertama","Lewati musim dingin tahun pertama tanpa ada yang kelaparan parah.",dict(S_("lewati_musim","dingin",1),tanpa_kelaparan=True),
   "Salju mencair, dan semua orang masih tersenyum. Kalian berhasil!",{"suasana_hati":10}),
 A("A05","Tetangga Baru","Capai 3 penduduk.",S_("capai_penduduk","penduduk",3),
   "Ada wajah baru di sekitar api unggun. Selamat datang, tetangga!"),
 A("A06","Petani Sejati","Panen Ladang untuk pertama kalinya.",S_("panen","ladang",1),
   "Panen pertama! Gandumnya mungkin sedikit, tapi rasanya istimewa.",{"gandum":3}),
 A("A07","Air Jernih","Bangun Sumur.",S_("bangun","sumur",1),
   "Tak perlu lagi berjalan jauh ke sungai. Airnya dingin dan segar."),
 A("A08","Dusun Raya","Capai era Dusun.",S_("capai_era","dusun",1),
   "Perkemahan kecil kini resmi menjadi Dusun. Jalan setapak pun mulai terbentuk.",{"kayu":15}),
 A("A09","Desa Menguning","Capai era Desa Pertanian.",S_("capai_era","desa_pertanian",1),
   "Ladang menguning sejauh mata memandang. Desa ini benar-benar hidup dari tanahnya.",{"alat":1}),
 A("A10","Kota Kecil","Capai era Kota Kecil.",S_("capai_era","kota_kecil",1),
   "Dari dua orang di tanah kosong menjadi kota kecil yang ramai. Luar biasa!",{"batu_bata":10}),
 A("A11","Pedagang Datang","Selesaikan 5 transaksi di Pasar.",S_("transaksi_pasar","pasar",5),
   "Pedagang mulai hafal jalan ke desamu. Hari ini semua barang dihargai sedikit lebih tinggi.",{},
   {"tipe":"bonus_harga_jual","target":"semua","jumlah":10,"hari":1}),
 A("A12","Tanpa Lapar 30 Hari","Jaga stok pangan cukup untuk minimal 5 hari, 30 hari berturut-turut.",dict(S_("beruntun_hari_pangan","hari",30),ambang=5),
   "Sebulan penuh tanpa perut keroncongan. Para ibu dapur pantas mendapat pelukan.",{},
   {"tipe":"diskon_teknologi","target":"T05","jumlah":25}),
 A("A13","Ahli Batu","Tambang 200 batu secara kumulatif.",S_("kumpulkan","batu",200),
   "Tangan para penambang kini kuat seperti batu itu sendiri. Mereka bisa membawa sedikit lebih banyak.",{},
   {"tipe":"bonus_angkut","target":"batu","jumlah":1}),
 A("A14","Peneliti Desa","Selesaikan riset 5 teknologi.",S_("riset","semua",5),
   "Lima ilmu sudah dikuasai. Desa ini ternyata penuh orang pintar!",{"makanan":10}),
 A("A15","Dinding Tegak","Selesaikan riset Dinding Bata.",S_("riset","T18",1),
   "Dinding bata berdiri kokoh. Badai boleh datang, desa tetap tenang.",{"suasana_hati":10}),
 A("A16","Festival Pertama","Adakan festival pertama desa.",S_("adakan_festival","semua",1),
   "Musik, tarian, dan tawa sampai larut malam. Inilah desa yang bahagia."),
 A("A17","Seratus Hari","Capai Hari 100.",S_("capai_hari","hari",100),
   "Seratus hari berlalu. Kepala desa kini dikenal sebagai Sesepuh Desa.",{},
   {"tipe":"gelar","target":"sesepuh_desa","jumlah":1,"teks":"Sesepuh Desa"}),
 A("A18","Desa Mandiri","Capai 12 penduduk, stok pangan 14 hari, kuasai 10 teknologi, dan tanpa kematian selama 50 hari.",
   {"tipe":"gabungan","target":"desa_mandiri","jumlah":1,"semua":[S_("capai_penduduk","penduduk",12),S_("hari_pangan","hari",14),S_("riset","semua",10),S_("tanpa_kematian","hari",50)]},
   "Desa ini kini berdiri di atas kakinya sendiri. Penduduk bekerja, tertawa, dan saling menjaga, persis seperti yang selalu kamu harapkan.",{},
   {"tipe":"lencana","target":"desa_mandiri","jumlah":1,"teks":"Lencana Desa Mandiri",
    "teks_akhir":"Matahari terbenam di atas atap-atap kecil. Dari sini, desa bisa terus tumbuh tanpa akhir. Terima kasih sudah menjaga mereka, Kepala Desa. Kamu boleh terus bermain selama yang kamu mau."}),
 # --- tambahan (bukan dari spec) ---
 A("A19","Sahabat Pedagang","Selesaikan 3 kontrak pasar.",S_("kontrak_selesai","pasar",3),
   "Tiga janji ditepati. Nama desamu kini disebut dengan senyum di kota-kota seberang.",{"alat":1}),
 A("A20","Rumah Bersama","Bangun Balai desa.",S_("bangun","balai_desa",1),
   "Balai desa berdiri. Sekarang ada tempat untuk rapat, pesta, dan berteduh bersama.",{"suasana_hati":5}),
 A("A21","Penebang Legendaris","Kumpulkan 500 kayu secara kumulatif.",S_("kumpulkan","kayu",500),
   "Lima ratus batang kayu! Hutan di sekitar desa memberi banyak, dan penduduk menanam kembali dengan senang hati."),
 A("A22","Pemohon Bintang","Begadang menikmati bintang jatuh bersama seluruh desa.",dict(S_("pilih_event","hujan_meteor",1),pilihan=0),
   "Semua orang membuat permohonan. Diam-diam, banyak yang memohon hal yang sama: semoga desa ini selalu hangat.",{"suasana_hati":5},None,True),
 A("A23","Pengusir Babi Hutan","Hadapi babi hutan sebanyak 3 kali.",S_("alami_event","hewan_buas",3),
   "Babi hutan itu sepertinya datang lagi hanya untuk menyapa. Penduduk mulai memberinya nama.",{},None,True),
 A("A24","Kawan Berbulu Oranye","Pelihara kucing gudang saat tikus menyerbu lumbung.",dict(S_("pilih_event","hama_gudang",1),pilihan=1),
   "Si Oranye kini resmi menjadi penduduk kehormatan. Ia tidur di karung gandum paling empuk.",{"suasana_hati":5},None,True),
]

# Pasar (RISET-TAHAP3.md bagian 2). Angka harga/kuota ada di balance.js; teks hanya memakai placeholder.
pasar = {
 "judul":"Pasar Desa",
 "deskripsi":"Tukar hasil desa dengan barang yang dibutuhkan. Harga naik-turun setiap pagi, jadi pilih waktu yang tepat.",
 "belum_dibuka":"Pasar belum berdiri. Bangun Pasar dulu supaya pedagang mau mampir.",
 "perlu_teknologi":"Perdagangan penuh terbuka setelah riset Pasar Resmi. Untuk sementara, pasar berdagang sendiri setiap hari.",
 "label":{"jual":"Jual","beli":"Beli","barang":"Barang","stok":"Stok desa","harga_jual":"Harga jual","harga_beli":"Harga beli",
  "nilai":"Nilai","jumlah":"Jumlah","total":"Total","konfirmasi":"Sepakat!","batal":"Batal","kuota":"Kuota hari ini","kontrak":"Kontrak"},
 "tooltip_harga":{
  "naik":"Harga {sumber_daya} sedang naik {persen}%. Saat yang bagus untuk menjual!",
  "turun":"Harga {sumber_daya} sedang turun {persen}%. Lebih hemat untuk membeli sekarang.",
  "stabil":"Harga {sumber_daya} sedang biasa saja. Tidak ada yang perlu diburu-buru.",
  "tertinggi":"Harga {sumber_daya} sedang di puncaknya. Pedagang sampai geleng-geleng kepala.",
  "terendah":"Harga {sumber_daya} sedang paling murah. Pedagang menjualnya sambil menghela napas.",
  "nilai_jual":"Pasar membayar {nilai} nilai untuk setiap {sumber_daya}.",
  "nilai_beli":"Butuh {nilai} nilai untuk membeli satu {sumber_daya}."
 },
 "pesan_fluktuasi":[
  {"id":"musim_dingin_pangan","teks":"Musim dingin tiba. Harga makanan dan gandum naik karena ladang berhenti tumbuh."},
  {"id":"musim_dingin_gandum","teks":"Harga gandum naik karena musim dingin. Lumbung yang penuh kini terasa seperti harta karun."},
  {"id":"semi_kayu","teks":"Musim semi! Semua orang menebang pohon, jadi harga jual kayu sedikit turun."},
  {"id":"panas_makanan","teks":"Buah dan ikan melimpah di musim panas. Harga jual makanan turun."},
  {"id":"setelah_panen_raya","teks":"Setelah panen raya, gandum ada di mana-mana. Harga jualnya turun untuk beberapa hari."},
  {"id":"setelah_badai","teks":"Badai merusak ladang di desa-desa tetangga. Harga beli makanan naik untuk beberapa hari."},
  {"id":"setelah_kekeringan","teks":"Kemarau membuat pangan sulit dicari. Harga beli makanan ikut naik."},
  {"id":"pedagang_diskon","teks":"Pedagang keliling sedang murah hati. Hari ini semua barang lebih murah dibeli!"},
  {"id":"pangan_melimpah","teks":"Lumbung desa sangat penuh. Pedagang mulai enggan membeli makanan dengan harga tinggi."},
  {"id":"acak_naik","teks":"Kabar dari kota seberang: {sumber_daya} sedang dicari. Harganya naik {persen}%."},
  {"id":"acak_turun","teks":"Pedagang membawa banyak {sumber_daya} hari ini. Harganya turun {persen}%."},
  {"id":"kembali_normal","teks":"Harga {sumber_daya} kembali seperti biasa."}
 ],
 "musim_dingin":{
  "peringatan":"Musim dingin sebentar lagi. Harga makanan biasanya melonjak, jadi sebaiknya stok dibeli atau disimpan sekarang.",
  "tooltip":"Musim dingin: makanan dan gandum lebih mahal dibeli, tapi juga lebih berharga dijual.",
  "log":"Hari {hari}: Pedagang menggosok tangan yang kedinginan. \"Makanan sedang mahal, Kepala Desa. Maaf ya.\""
 },
 "kuota":{
  "label":"Kuota hari ini",
  "tooltip":"Pasar hanya sanggup menampung {kuota} nilai dagangan per hari. Kuota terisi ulang setiap pagi.",
  "sisa":"Sisa kuota jual {jumlah} · beli {jumlah2}",
  "habis_jual":"Pasar sudah kenyang menerima barang hari ini. Coba lagi besok pagi.",
  "habis_beli":"Pedagang sudah kehabisan barang untuk hari ini. Besok mereka kembali dengan karung penuh.",
  "reset":"Pagi telah tiba. Kuota pasar terisi kembali.",
  "naik":"Pasar makin ramai! Kuota dagang harian bertambah."
 },
 "transaksi":{
  "jual_berhasil":"Terjual {jumlah} {sumber_daya}. Desa mendapat {jumlah2} {sumber_daya2}.",
  "beli_berhasil":"Dibeli {jumlah} {sumber_daya} dengan {jumlah2} {sumber_daya2}.",
  "kurang_stok":"Stok {sumber_daya} tidak cukup. Masih kurang {jumlah}.",
  "nilai_kurang":"Barang yang ditawarkan belum cukup untuk membeli {sumber_daya}.",
  "kuota_tidak_cukup":"Transaksi ini melebihi kuota hari ini. Kurangi jumlahnya sedikit, ya.",
  "log":"Hari {hari}: {nama} menukar {jumlah} {sumber_daya} di Pasar dengan {jumlah2} {sumber_daya2}."
 },
 "kontrak":{
  "judul":"Kontrak Dagang",
  "deskripsi":"Janji pengiriman barang dalam waktu tertentu. Tepati, dan hadiahnya lumayan!",
  "slot_kosong":"Slot kontrak kosong. Tunggu tawaran dari pedagang berikutnya.",
  "slot_baru":"Slot kontrak baru terbuka! Pasar siap menerima lebih banyak janji.",
  "tawaran":[
   "{pedagang} meminta {jumlah} {sumber_daya} dalam {hari_sisa} hari. Imbalannya {jumlah2} {sumber_daya2}.",
   "Kota seberang butuh {jumlah} {sumber_daya} sebelum {hari_sisa} hari. Mereka menjanjikan {jumlah2} {sumber_daya2}.",
   "\"Desa kalian terkenal dengan {sumber_daya}-nya,\" kata {pedagang}. \"Kirim {jumlah} dalam {hari_sisa} hari, nanti kubayar {jumlah2} {sumber_daya2}.\""
  ],
  "tombol_terima":"Terima Kontrak",
  "tombol_tolak":"Lain kali",
  "diterima":"Kontrak diterima. Kirim {jumlah} {sumber_daya} dalam {hari_sisa} hari.",
  "progres":"Kontrak {sumber_daya}: {jumlah} dari {jumlah2} terkirim.",
  "pengingat":"Kontrak {sumber_daya} tinggal {hari_sisa} hari lagi. Masih kurang {jumlah}.",
  "berhasil":[
   "Kontrak selesai! {pedagang} menyerahkan {jumlah2} {sumber_daya2} sambil tersenyum lebar.",
   "Semua {sumber_daya} terkirim tepat waktu. Kota seberang mengirim {jumlah2} {sumber_daya2} dan sepucuk surat terima kasih.",
   "Janji ditepati! Penduduk bangga desanya bisa diandalkan."
  ],
  "gagal":[
   "Kontrak {sumber_daya} tidak terpenuhi tepat waktu. {pedagang} kecewa, dan penduduk ikut murung.",
   "Waktu kontrak habis. Pedagang pulang dengan gerobak setengah kosong. Lain kali pasti bisa.",
   "Kontrak gagal. Tidak apa-apa, desa belajar menghitung stok lebih cermat."
  ],
  "dibatalkan":"Kontrak dibatalkan. Pedagang mengangguk pelan, sedikit kecewa."
 }
}

dialog_pedagang = {
 "nama_pedagang":["Pak Darto","Bu Minah","Koh Aseng","Uda Rasyid","Mbok Sumi","Daeng Sikki","Om Robert","Ibu Wayan"],
 "sapaan":[
  "Kling-klong! {pedagang} datang membawa pikulan penuh. \"Selamat pagi, desa kecil yang rajin!\"",
  "\"Wah, desa ini makin ramai saja sejak terakhir aku mampir,\" kata {pedagang} sambil menurunkan keranjang.",
  "{pedagang} melambai dari ujung jalan. \"Ada teh hangat? Aku bawa kabar dan barang bagus!\"",
  "\"Brrr, musim {musim} begini enaknya berdagang sambil duduk dekat api,\" kata {pedagang}.",
  "\"Halo, {nama}! Masih ingat aku? Aku yang dulu menukar ikan asin dengan kayumu.\""
 ],
 "penawaran":[
  "\"Aku bisa beri {jumlah2} {sumber_daya2} untuk {jumlah} {sumber_daya}. Adil, kan?\"",
  "\"Lihat {sumber_daya2} ini, masih segar! {jumlah2} buatmu, cukup tukar dengan {jumlah} {sumber_daya}.\"",
  "\"Desa sebelah sedang butuh {sumber_daya}. Kalau kamu punya {jumlah}, aku tukar dengan {jumlah2} {sumber_daya2}.\"",
  "\"Penawaran khusus hari ini saja: {jumlah2} {sumber_daya2} untuk {jumlah} {sumber_daya}. Jangan bilang yang lain, ya!\""
 ],
 "tawar_menawar":{
  "pemain_menawar":[
   "Bagaimana kalau sedikit lebih banyak?",
   "Ayolah, kami sudah langganan, kan?",
   "Kurangi sedikit, nanti kami beri teh madu."
  ],
  "pedagang_setuju":[
   "\"Hmm... baiklah, baiklah. Demi senyum penduduk di sini. {jumlah2} {sumber_daya2}, jadi!\"",
   "{pedagang} tertawa. \"Kamu pintar menawar! Oke, kutambah sedikit.\"",
   "\"Ya sudah, anggap saja hadiah karena desamu selalu ramah.\""
  ],
  "pedagang_menolak":[
   "{pedagang} menggeleng sambil tersenyum. \"Kalau lebih murah lagi, keledaiku tak bisa makan.\"",
   "\"Aduh, itu sudah harga teman. Tidak bisa turun lagi, maaf ya.\"",
   "\"Hmm, tidak bisa. Tapi aku janji besok bawa barang yang lebih bagus.\""
  ],
  "pedagang_kesal":[
   "{pedagang} memijat kening. \"Sudah tiga kali menawar! Ini tawaran terakhirku, ya.\"",
   "\"Kalau terus ditawar, aku jadi lupa harga aslinya,\" gerutu {pedagang}, tapi tetap tersenyum."
  ]
 },
 "berhasil":[
  "\"Senang berbisnis denganmu!\" {pedagang} menyerahkan {jumlah2} {sumber_daya2} dengan kedua tangan.",
  "Tukar-menukar selesai. {pedagang} bersiul gembira sambil mengikat karungnya.",
  "\"Barangmu bagus sekali. Aku pasti mampir lagi!\"",
  "{nama} membawa pulang {jumlah2} {sumber_daya2}. Penduduk lain menyambutnya seperti pahlawan kecil."
 ],
 "gagal_kurang_sumber_daya":[
  "\"Eh, sepertinya {sumber_daya} kalian masih kurang {jumlah}. Tidak apa-apa, aku tunggu lain kali.\"",
  "{pedagang} melirik gudang yang setengah kosong. \"Simpan dulu saja untuk kalian sendiri.\"",
  "\"Wah, belum cukup ya? Jangan sedih. Kumpulkan {sumber_daya} lagi, nanti kita bicara.\"",
  "\"Lumbungmu masih tipis. Aku tidak mau desamu kelaparan gara-gara aku.\""
 ],
 "ditolak_pemain":[
  "\"Tidak jadi? Tidak apa-apa. Setidaknya tehnya enak.\"",
  "{pedagang} mengangkat bahu. \"Mungkin lain kali, kalau kamu berubah pikiran.\"",
  "\"Baiklah, kusimpan barang ini untukmu. Siapa tahu nanti kamu butuh.\""
 ],
 "perpisahan":[
  "{pedagang} mengangkat pikulannya. \"Sampai jumpa! Jaga desa kecil ini baik-baik.\"",
  "Lonceng kecil {pedagang} berbunyi makin pelan saat ia menjauh di jalan setapak.",
  "\"Aku ke desa seberang dulu. Mungkin sepuluh hari lagi aku kembali!\"",
  "{pedagang} melambai dari atas bukit. Anak-anak desa membalas lambaiannya sampai ia hilang dari pandangan."
 ]
}

# Event era 3-4: struktur sama dengan event_acak + field era (era minimum, id meta.era).
# Pilihan terakhir sengaja tanpa biaya sumber daya supaya selalu bisa dipilih.
EL = lambda era, *a, **k: {**E(*a, **k), "era": era}
event_lanjut = [
 EL("desa_pertanian","hama_gudang","Tikus Berpesta di Lumbung","Malam-malam terdengar cicit kecil dari Lumbung. Sekeluarga tikus gemuk ternyata sedang berpesta gandum!",[
  C("Pasang perangkap kayu",{"kayu":-10,"energi":-5},"Perangkap dipasang di setiap sudut. Esok paginya, para tikus pindah ke hutan sambil menggerutu."),
  C("Pelihara kucing gudang",{"makanan":-5,"suasana_hati":8},"Seekor kucing oranye gendut datang dan langsung bertugas. Tikus kabur, dan semua orang ingin mengelusnya."),
  C("Biarkan, nanti juga kenyang",{"suasana_hati":-5,"kesehatan_bangunan":-5},"Tikus-tikus makin berani dan menggerogoti dinding lumbung. Penduduk sedikit kesal.")
 ],"bahaya"),
 EL("desa_pertanian","kerbau_nyasar","Kerbau Nyasar","Seekor kerbau besar berjalan santai ke tengah desa, lalu berbaring di depan Gudang. Sepertinya ia tersesat.",[
  C("Beri makan dan rawat",{"makanan":-10,"suasana_hati":10,"energi":5},"Si kerbau betah dan mau membantu menarik kayu. Ia dinamai \"Mbok Besar\" oleh anak-anak."),
  C("Antar pulang ke padang rumput",{"energi":-10,"kulit":2},"Pemiliknya, seorang penggembala, berterima kasih dan memberi sedikit kulit sebagai tanda terima kasih."),
  C("Tunggu ia pergi sendiri",{"hari_kerja_hilang":1},"Kerbau itu tidur seharian di depan Gudang. Tak ada yang tega membangunkannya.")
 ],"penduduk"),
 EL("desa_pertanian","alat_patah","Gagang Cangkul Patah","Pagi ini tiga gagang cangkul patah bersamaan. {nama} menatap potongan kayu di tangannya dengan wajah sedih.",[
  C("Perbaiki di Bengkel alat",{"kayu":-10,"batu":-5,"alat":1},"Bengkel berdentang sepanjang hari. Perkakas baru malah lebih kuat dari sebelumnya."),
  C("Beli perkakas dari pedagang",{"gandum":-15,"alat":2},"Pedagang yang kebetulan lewat punya perkakas cadangan. Kerja ladang pun lancar lagi."),
  C("Bekerja dengan tangan dulu",{"energi":-10,"suasana_hati":-5},"Penduduk mencangkul pakai tongkat. Lambat dan pegal, tapi ladang tetap terurus.")
 ],"umum"),
 EL("desa_pertanian","percikan_dapur","Percikan di Dapur","{nama} lupa mengecilkan api tungku. Asap mengepul dari jendela Dapur!",[
  C("Padamkan dengan air sumur",{"air":-15,"energi":-5},"Ember-ember berpindah tangan dengan cepat. Api padam, dan hanya panci yang sedikit gosong."),
  C("Tutup dengan tanah dan pasir",{"energi":-10,"kesehatan_bangunan":-5},"Api padam, tapi Dapur penuh pasir. Butuh waktu untuk membersihkannya."),
  C("Teriak minta tolong",{"kesehatan_bangunan":-15,"suasana_hati":-5},"Semua orang berlari datang. Api padam, tapi dinding Dapur menghitam.")
 ],"bahaya"),
 EL("desa_pertanian","ilmuwan_pengembara","Pengembara Berkacamata","Seorang pengembara berkacamata bulat datang membawa setumpuk catatan. Ia ingin menginap dan bertukar ilmu.",[
  C("Jamu dengan makan malam",{"makanan":-10,"progres_riset":25},"Sambil makan, pengembara menjelaskan banyak hal. Riset desa maju pesat!"),
  C("Tukar catatan dengan papan",{"papan":-5,"progres_riset":15,"suasana_hati":5},"Pengembara meninggalkan catatan berharga. Penduduk membacanya bergantian di dekat api."),
  C("Dengarkan ceritanya saja",{"suasana_hati":5},"Cerita tentang negeri-negeri jauh membuat penduduk tertidur dengan mimpi indah.")
 ],"langka"),
 EL("desa_pertanian","kunang_kunang","Malam Seribu Kunang-kunang","Malam ini ladang dipenuhi kunang-kunang. Cahayanya berkelip seperti bintang yang turun ke bumi.",[
  C("Ajak semua berjalan-jalan",{"energi":-5,"suasana_hati":15},"Penduduk berjalan pelan di antara cahaya kecil. Tak ada yang ingin malam ini berakhir."),
  C("Tidur lebih awal saja",{"energi":10},"Penduduk tidur sambil melihat kelip dari jendela. Esok paginya mereka bangun segar.")
 ],"langka"),
 EL("desa_pertanian","embun_beku","Embun Beku Datang Lebih Awal","Pagi ini rumput berlapis es tipis, padahal musim dingin belum tiba. Udara terasa menggigit.",[
  C("Panen lebih awal",{"gandum":6,"energi":-10},"Semua tangan turun ke ladang. Gandum diselamatkan sebelum beku, walau belum terlalu besar."),
  C("Tutupi ladang dengan jerami",{"kayu":-15,"suasana_hati":5},"Selimut jerami melindungi tanaman. Mereka tetap tumbuh pelan-pelan di bawahnya."),
  C("Berkumpul di dekat api",{"suasana_hati":-5,"kesehatan":-5},"Penduduk berhangat bersama, tapi sebagian tanaman di ladang layu kedinginan.")
 ],"musim"),
 EL("kota_kecil","harga_pangan_melambung","Harga Pangan Melambung","Kabar dari kota seberang: panen di sana gagal. Pedagang membeli makanan dengan harga tinggi.",[
  C("Jual sebagian stok pangan",{"makanan":-20,"alat":2,"papan":5},"Gerobak penuh makanan berangkat ke kota. Desa mendapat perkakas dan papan yang berharga."),
  C("Kirim bantuan pangan",{"makanan":-15,"suasana_hati":15},"Kota seberang sangat berterima kasih. Penduduk merasa bangga bisa menolong."),
  C("Simpan untuk musim dingin",{"harga_beli_pangan":20},"Lumbung tetap penuh. Tapi untuk sementara, membeli makanan di pasar jadi lebih mahal.")
 ],"perdagangan"),
 EL("kota_kecil","rombongan_seniman","Rombongan Seniman Keliling","Gerobak warna-warni berhenti di depan Balai desa. Ada pemain gamelan, penari, dan seekor monyet kecil berpeci.",[
  C("Undang mereka tampil",{"makanan":-15,"suasana_hati":20},"Malam pertunjukan yang meriah! Bahkan kakek tertua desa ikut bergoyang."),
  C("Ajak mereka bertukar lagu",{"suasana_hati":10,"energi":-5},"Penduduk mengajarkan lagu daerah mereka, dan seniman membalas dengan lagu baru."),
  C("Ucapkan terima kasih saja",{"suasana_hati":-2},"Rombongan melanjutkan perjalanan. Anak-anak memandangi gerobak itu sampai hilang di tikungan.")
 ],"perayaan"),
 EL("kota_kecil","undangan_kota","Undangan dari Kota Seberang","Seorang kurir membawa surat bersegel lilin: kota seberang ingin menjalin dagang tetap dengan desamu.",[
  C("Kirim contoh barang terbaik",{"papan":-10,"batu_bata":-5,"alat":2,"suasana_hati":5},"Kota seberang terkesan. Mereka mengirim perkakas sebagai tanda persahabatan."),
  C("Kirim surat balasan yang ramah",{"suasana_hati":5,"harga_jual_pangan":10},"Surat balasan membuat pedagang kota senang. Untuk sementara, makanan desa dihargai lebih tinggi."),
  C("Belum siap, tunda dulu",{"suasana_hati":-2},"Kurir mengangguk paham. \"Pintu kami selalu terbuka,\" katanya sebelum pergi.")
 ],"perdagangan"),
 EL("kota_kecil","pilek_musim_gugur","Pilek Musim Gugur","Hujan gerimis berhari-hari. Satu per satu penduduk mulai bersin dan hidungnya memerah.",[
  C("Seduh jahe dan madu",{"makanan":-10,"kesehatan":10},"Wedang jahe mengepul di setiap rumah. Bersin-bersin cepat mereda."),
  C("Liburkan yang sakit",{"hari_kerja_hilang":1,"kesehatan":8,"suasana_hati":5},"Sehari penuh selimutan dan cerita. Semua kembali segar keesokan harinya."),
  C("Bekerja sambil pakai syal",{"kesehatan":-10,"energi":-5},"Kerja tetap jalan, tapi bersin terdengar di mana-mana dan semua tampak lesu.")
 ],"bahaya"),
 EL("kota_kecil","tetangga_berselisih","Dua Tetangga Berselisih","{nama} dan {nama2} bertengkar soal pagar. Katanya, pagar {nama2} bergeser satu jengkal ke kebun {nama}.",[
  C("Damaikan di Balai desa",{"energi":-5,"suasana_hati":10},"Setelah musyawarah dan secangkir teh, mereka berjabat tangan. Pagar dipasang ulang bersama-sama."),
  C("Bangun pagar baru yang adil",{"kayu":-15,"suasana_hati":8},"Pagar baru berdiri tepat di tengah. Kini keduanya malah saling menitipkan tanaman."),
  C("Biarkan mereka berdamai sendiri",{"suasana_hati":-5},"Beberapa hari mereka saling cemberut, sampai akhirnya lupa sendiri apa yang diperdebatkan.")
 ],"penduduk"),
 EL("kota_kecil","bangau_balai","Bangau di Atap Balai","Sepasang bangau putih membangun sarang besar di atap Balai desa. Konon, ini pertanda baik!",[
  C("Biarkan mereka bersarang",{"suasana_hati":12,"kesehatan_bangunan":-5},"Atap sedikit berantakan, tapi penduduk senang. Setiap pagi bangau-bangau itu bersahutan."),
  C("Buatkan tiang sarang khusus",{"kayu":-10,"papan":-5,"suasana_hati":15},"Tiang sarang berdiri di samping Balai. Bangau pindah dengan anggun, dan jadi ikon desa."),
  C("Usir pelan-pelan",{"suasana_hati":-5},"Bangau terbang ke arah sungai. Beberapa anak menangis kecil melihatnya pergi.")
 ],"langka"),
 EL("kota_kecil","tanah_bukit_bergeser","Tanah Bukit Bergeser","Setelah hujan deras, tanah di lereng bukit dekat Tambang sedikit longsor. Untung tidak ada yang terluka.",[
  C("Bersihkan dan ambil batunya",{"energi":-15,"batu":20},"Longsoran ternyata penuh batu bagus. Desa mendapat bahan bangunan gratis!"),
  C("Tanam pohon penahan tanah",{"kayu":-10,"suasana_hati":5},"Bibit-bibit pohon ditanam berjajar. Beberapa tahun lagi, lereng ini akan hijau dan kokoh."),
  C("Jauhi lereng untuk sementara",{"hari_kerja_hilang":1},"Penduduk bekerja di dekat desa saja sampai tanah kering. Aman, walau agak lambat.")
 ],"cuaca"),
]

quest_lanjutan = [
 Q("q11_dapur_mengepul","Dapur Mengepul","Bangun Dapur supaya bahan mentah bisa diolah menjadi masakan yang lebih mengenyangkan.","bangun","dapur",1,{"makanan":5,"suasana_hati":5},"Asap tipis mengepul dari cerobong Dapur. Aroma masakan membuat semua orang pulang lebih cepat.",11),
 Q("q12_hamparan_ladang","Hamparan Ladang","Bangun total 3 petak Ladang agar desa tidak bergantung pada buah liar.","bangun","ladang",3,{"kayu":15,"gandum":3},"Tiga petak ladang berjajar rapi. Dari kejauhan, desa mulai tampak seperti kain bermotif kotak-kotak.",12),
 Q("q13_desa_pertanian","Desa yang Menguning","Penuhi syarat era Desa Pertanian: penduduk, ladang, sumur, dapur, dan stok pangan yang cukup.","capai_era","desa_pertanian",1,{"papan":10,"alat":1,"suasana_hati":10},"Desa kini resmi menjadi Desa Pertanian. Setiap musim panen terasa seperti pesta kecil.",13),
 Q("q14_dentang_palu","Dentang Palu","Bangun Bengkel alat agar desa bisa membuat perkakas, papan, dan batu bata sendiri.","bangun","bengkel_alat",1,{"batu":15,"kayu":15},"Denting palu pertama terdengar sampai ke sungai. Kini desa bisa membuat alatnya sendiri.",14),
 Q("q15_ilmu_pertama","Ilmu dari Pengalaman","Selesaikan riset 3 teknologi. Pilih yang paling dibutuhkan desa saat ini.","riset","semua",3,{"makanan":8,"suasana_hati":5},"Tiga ilmu baru dikuasai. Penduduk mulai suka berdiskusi di dekat api sebelum tidur.",15),
 Q("q16_perkakas_cadangan","Perkakas Cadangan","Simpan minimal 5 perkakas supaya kerja tidak terhenti saat alat aus.","simpan","alat",5,{"papan":10,"batu_bata":5},"Rak perkakas penuh dan berkilau. Tidak ada lagi yang harus bekerja dengan tangan kosong.",16),
 Q("q17_lapak_pertama","Lapak Pertama","Bangun Pasar agar pedagang punya tempat untuk menggelar dagangan.","bangun","pasar",1,{"suasana_hati":10,"alat":1},"Lapak-lapak kayu berdiri. Lonceng pedagang kini terdengar lebih sering di desa.",17),
 Q("q18_pandai_berdagang","Pandai Berdagang","Selesaikan 5 transaksi di Pasar. Jual saat harga naik, beli saat harga turun.","transaksi_pasar","pasar",5,{"papan":15,"suasana_hati":5},"Pedagang mulai memanggil desamu \"langganan tetap\". Tawar-menawar pun jadi lebih seru.",18),
 Q("q19_kota_kecil","Menjadi Kota Kecil","Penuhi syarat era Kota Kecil: penduduk, Lumbung, Bengkel alat, Pasar, perkakas, dan stok pangan yang aman.","capai_era","kota_kecil",1,{"batu_bata":15,"papan":15,"suasana_hati":15},"Desa kecil itu kini menjadi Kota Kecil yang ramai. Tapi bagi penduduknya, ini tetap rumah yang sama hangatnya.",19),
 Q("q20_rumah_bersama","Rumah Bersama","Bangun Balai desa sebagai tempat musyawarah, pesta, dan pusat ilmu desa.","bangun","balai_desa",1,{"suasana_hati":20,"alat":2},"Balai desa berdiri megah di tengah kota. Malam ini, seluruh penduduk berkumpul di bawah satu atap.",20),
]

# ---- meta v1.1.0: hanya tambahan (versi dinaikkan) ----
meta["versi"] = "1.1.0"
meta["placeholder"].update({
 "{jumlah2}":"Jumlah kedua (mis. imbalan dagang, atau total/target pada teks progres)",
 "{sumber_daya2}":"Nama sumber daya kedua (mis. barang imbalan), lihat meta.sumber_daya",
 "{persen}":"Persentase (angka tanpa tanda %), mis. perubahan harga atau progres riset",
 "{nilai}":"Nilai dagang satu unit barang di pasar (angka)",
 "{kuota}":"Kuota nilai dagang pasar per hari (angka)",
 "{hari_sisa}":"Sisa hari sebelum tenggat kontrak (angka)",
 "{teknologi}":"Nama teknologi, lihat teknologi[].nama",
 "{pencapaian}":"Nama pencapaian, lihat pencapaian[].nama",
 "{pedagang}":"Nama pedagang, ambil dari dialog_pedagang.nama_pedagang"
})
meta["kunci_efek"].update({
 "progres_riset":"Tambahan progres riset teknologi yang sedang berjalan (persen dari total work node itu). Diabaikan bila tidak ada riset aktif.",
 "harga_jual_pangan":"Perubahan harga jual makanan & gandum di pasar (persen) selama 5 hari",
 "harga_beli_pangan":"Perubahan harga beli makanan & gandum di pasar (persen) selama 5 hari"
})
meta["tipe_tujuan_quest"].update({
 "riset":"Selesaikan riset: target \"semua\" = jumlah teknologi apa saja yang selesai; target id teknologi (mis. \"T18\") = teknologi itu selesai (jumlah 1)",
 "transaksi_pasar":"Selesaikan transaksi jual/beli di Pasar sebanyak jumlah (kumulatif), target \"pasar\"",
 "kontrak_selesai":"Selesaikan kontrak pasar tepat waktu sebanyak jumlah (kumulatif), target \"pasar\"",
 "panen":"Panen petak bangunan target (\"ladang\") sebanyak jumlah kali (kumulatif)",
 "simpan_pangan":"Miliki stok makanan + gandum gabungan minimal jumlah pada satu waktu, target \"pangan\"",
 "hari_pangan":"Stok pangan cukup untuk minimal jumlah hari (foodDays) saat ini, target \"hari\"",
 "beruntun_hari_pangan":"foodDays >= syarat.ambang selama jumlah hari berturut-turut, target \"hari\"",
 "lewati_musim":"Lewati musim target (id meta.musim) sampai selesai sebanyak jumlah; jika syarat.tanpa_kelaparan true, tidak boleh ada penduduk dengan lapar kritis sepanjang musim itu",
 "tanpa_kematian":"Tidak ada penduduk yang meninggal selama jumlah hari berturut-turut, target \"hari\"",
 "capai_hari":"Capai hari ke-jumlah, target \"hari\"",
 "adakan_festival":"Adakan festival sebanyak jumlah (efek T20 Festival Adat atau event festival_desa), target \"semua\"",
 "pilih_event":"Pilih opsi syarat.pilihan (indeks 0-based) pada event dengan id target sebanyak jumlah",
 "alami_event":"Alami event dengan id target sebanyak jumlah (kumulatif, apa pun pilihannya)",
 "gabungan":"Semua syarat di syarat.semua (daftar tipe/target/jumlah) terpenuhi bersamaan; target = id pencapaian/kondisi"
})
meta["status_tech"] = "mengikuti_riset"
meta["sumber_tech"] = "docs/RISET-TAHAP3.md (bagian 1 teknologi, 2 pasar, 3 pencapaian, 6 catatan teks)"
meta["cabang_teknologi"] = {"bertahan":"Bertahan","produksi":"Produksi","masyarakat":"Masyarakat","perdagangan":"Perdagangan"}
meta["target_khusus"] = {
 "_catatan":"Target tujuan yang bukan id sumber daya/bangunan/era/musim/event/teknologi.",
 "semua":"Hitung semua (dipakai tipe riset, adakan_festival, dan hadiah bonus_harga_jual)",
 "pangan":"Makanan + gandum (tipe simpan_pangan)",
 "hari":"Satuan hari (tipe hari_pangan, beruntun_hari_pangan, tanpa_kematian, capai_hari)",
 "pasar":"Kegiatan di Pasar (tipe transaksi_pasar, kontrak_selesai)",
 "penduduk":"Jumlah penduduk (tipe capai_penduduk, sudah dipakai v1.0.0)",
 "desa_mandiri":"Kondisi akhir lembut pencapaian A18 (tipe gabungan)"
}
meta["field_syarat_opsional"] = {
 "ambang":"Angka ambang untuk tipe beruntun_hari_pangan",
 "tanpa_kelaparan":"Boolean untuk tipe lewati_musim",
 "pilihan":"Indeks pilihan event (0-based) untuk tipe pilih_event",
 "semua":"Daftar syarat untuk tipe gabungan"
}
meta["tipe_hadiah_khusus"] = {
 "_catatan":"pencapaian[].hadiah_khusus = {tipe, target, jumlah, ...}. hadiah biasa tetap memakai kunci_efek/sumber_daya.",
 "bonus_harga_jual":"Harga jual target (\"semua\" atau id sumber daya) naik jumlah persen selama field hari",
 "diskon_teknologi":"Biaya riset teknologi target (id) turun jumlah persen, sekali, jika belum diriset",
 "bonus_angkut":"CARRY sumber daya target naik jumlah secara permanen",
 "gelar":"Gelar kosmetik kepala desa; field teks = nama gelar",
 "lencana":"Lencana kosmetik; field teks = nama lencana, teks_akhir = teks ending lembut (boleh terus bermain)"
}
meta["struktur_tambahan"] = {
 "teknologi":"Daftar node {id, nama, cabang, era, prasyarat[id teknologi], syarat_tambahan[tipe/target/jumlah], deskripsi, efek_ringkas, teks_terbuka, teks_selesai}. Biaya & work ada di balance.js.",
 "pencapaian":"Daftar {id, nama, deskripsi, syarat{tipe,target,jumlah,+field opsional}, hadiah, teks_terbuka, hadiah_khusus?, rahasia?}",
 "event_era_lanjut":"Sama dengan event_acak + era (era minimum, id meta.era)",
 "quest_lanjutan":"Sama dengan quest_awal; urutan melanjutkan quest_awal (11-20)",
 "pasar":"Teks UI pasar, tooltip harga, pesan_fluktuasi[id,teks], kuota, transaksi, kontrak",
 "dialog_pedagang":"Daftar variasi teks per kategori; tawar_menawar berisi sub-kategori",
 "menu":"Menu utama, konfirmasi, kredit",
 "pengaturan":"Label & deskripsi opsi pengaturan",
 "ui_progres":"Label panel pohon teknologi dan pencapaian"
}


# =====================================================================
# v1.2.0 — MUSIM & ANCAMAN (hanya penambahan). Spec: docs/RISET-MUSIM-ANCAMAN.md §4.
# Data di bawah dirangkum dalam PATCH_V120, diterapkan aditif ke `data`, dan juga
# ditulis ke tools/patch-v1.2.0.json (bisa digabung terpisah lewat tools/merge_v120.py).
# =====================================================================
EM = lambda id, judul, desk, pilihan, kategori, musim: {"id": id, "judul": judul, "kategori": kategori, "deskripsi": desk, "pilihan": pilihan, "musim": musim}

# ---------- 1. pembuka musim (id musim_*) ----------
musim_pembuka = {
 "musim_semi": {"musim": "semi", "kapan": "Fajar hari pertama musim semi", "variasi": [
  "Musim semi tiba. Saatnya menanam sebelum hujan deras datang.",
  "Salju terakhir mencair dan tunas hijau mengintip dari tanah. Ladang sudah menunggu benih.",
  "Burung-burung kembali bernyanyi di atap. Musim semi tahun ke-{tahun} dimulai, dan tanah terasa lembut untuk dicangkul."]},
 "musim_panas": {"musim": "panas", "kapan": "Fajar hari pertama musim panas", "variasi": [
  "Musim panas datang. Hari panjang dan cerah, tapi sumur akan bekerja lebih keras. Jaga stok air!",
  "Matahari bersinar terik. Penduduk mencari teduh siang hari, dan dapur perlu diawasi supaya tidak terlalu panas.",
  "Udara hangat dan sungai berkilau. Nikmati musim panas, tapi ingat: rumput kering mudah terbakar."]},
 "musim_gugur": {"musim": "gugur", "kapan": "Fajar hari pertama musim gugur", "variasi": [
  "Musim gugur tiba. Daun menguning, ladang siap dipanen, dan lumbung menunggu diisi.",
  "Angin sejuk membawa aroma jerami. Waktunya panen, berburu, dan menyimpan bekal untuk musim dingin.",
  "Hutan berubah jingga. Penduduk mulai menghitung karung gandum sambil bersenandung."]},
 "musim_dingin": {"musim": "dingin", "kapan": "Fajar hari pertama musim dingin", "variasi": [
  "Musim dingin datang. Tanaman tertidur, api unggun butuh kayu bakar, dan setiap porsi makanan berharga.",
  "Salju pertama turun pelan. Penduduk merapat ke api dan saling berbagi selimut.",
  "Napas berubah jadi uap putih. Semoga lumbung cukup penuh dan kayu bakar cukup banyak sampai musim semi."]},
 "musim_semi_hujan": {"musim": "semi", "kapan": "Hari hujan ringan di musim semi", "variasi": [
  "Hujan rintik turun. Semak cepat berbuah lagi, walau kayu jadi licin untuk ditebang.",
  "Gerimis musim semi membuat semua orang tersenyum. Tanah wangi, dan katak bernyanyi di tepi sungai."]},
 "musim_gugur_menuju_dingin": {"musim": "gugur", "kapan": "Fajar hari ke-4 sampai ke-7 musim gugur", "variasi": [
  "Sisa {hari_sisa} hari sebelum musim dingin. Stok pangan cukup untuk {jumlah} dari {jumlah2} hari yang disarankan.",
  "Angin mulai menggigit. {hari_sisa} hari lagi salju turun. Lumbung kita baru cukup {jumlah} dari {jumlah2} hari.",
  "{nama} menatap langit kelabu. \"Tinggal {hari_sisa} hari lagi,\" katanya. Persediaan: {jumlah}/{jumlah2} hari."]},
 "musim_gugur_stok_kurang": {"musim": "gugur", "kapan": "Banner jika stok di bawah target buffer dingin", "variasi": [
  "Stok pangan belum cukup untuk musim dingin. Utamakan panen, berburu, dan simpan makanan sekarang.",
  "Lumbung masih terlalu ringan untuk menghadapi salju. Ayo kumpulkan bekal selagi sempat!"]},
 "musim_gugur_syukur": {"musim": "gugur", "kapan": "Akhir musim gugur jika stok pangan aman", "variasi": [
  "Lumbung penuh sebelum salju datang. Penduduk berkumpul untuk syukuran kecil. Kerja keras kalian terbayar!",
  "Semua karung tersusun rapi. Malam ini desa makan bersama, hangat dan tenang menyambut musim dingin."]},
 "musim_dingin_kayu_bakar": {"musim": "dingin", "kapan": "Saat api unggun memakai kayu bakar di musim dingin", "variasi": [
  "Api unggun melahap kayu bakar lebih banyak di musim dingin. Pastikan tumpukan kayu tidak habis.",
  "Kayu bakar tinggal sedikit. Kalau api padam, malam akan terasa sangat panjang."]},
 "musim_tahun_baru": {"musim": "semi", "kapan": "Awal tahun ke-2 dan seterusnya", "variasi": [
  "Tahun ke-{tahun} dimulai. Desa makin besar, dan alam pun makin menguji. Siapkan pertahanan dan stok lebih awal.",
  "Satu tahun lagi terlewati bersama. Tahun ke-{tahun} mungkin lebih menantang, tapi desa ini juga lebih kuat."]}
}

# ---------- 2. peringatan dini (id ancaman_*) ----------
P = lambda judul, teks, saran: {"judul": judul, "teks": teks, "saran": saran}
peringatan_dini = {
 "ancaman_banjir": {"nama": "Banjir kecil", "musim": ["semi"], "event_terkait": ["banjir_kecil"], "tingkat": {
  "waspada": P("Sungai Naik", ["Pagi ini sungai terlihat lebih tinggi dan keruh. Air mungkin meluap ke tepian.",
    "{nama} melihat air sungai sudah menyentuh akar pohon di tepian. Sebaiknya jangan menanam dekat sungai dulu."],
    "Jauhkan ladang baru dari tepi sungai. Riset Parit Air membantu air cepat surut."),
  "bahaya": P("Air Meluap!", ["Sungai meluap ke tepian. Jalan di dekat air jadi becek dan ladang di tepi sungai berhenti tumbuh sebentar.",
    "Air setinggi mata kaki menggenangi tepi sungai. Penduduk berjalan pelan sambil mengangkat celana."],
    "Biarkan penduduk bekerja jauh dari sungai sampai air surut."),
  "reda": P("Air Surut", ["Air sungai kembali tenang. Lumpur yang tertinggal malah membuat tanah lebih subur.",
    "Banjir sudah surut. Anak-anak mencari ikan kecil yang tertinggal di genangan."], "")}},
 "ancaman_kekeringan": {"nama": "Kekeringan", "musim": ["panas"], "event_terkait": ["kekeringan", "gelombang_panas"], "tingkat": {
  "waspada": P("Air Menipis", ["Stok air hanya cukup untuk {hari_sisa} hari. Sumur bekerja keras di musim panas.",
    "Tanah mulai retak-retak kecil. {nama} bilang ember di sumur makin lama penuhnya."],
    "Naikkan prioritas air dan bangun Sumur tambahan."),
  "bahaya": P("Kekeringan!", ["Stok air hampir habis. Penduduk mulai haus, dan tanaman di ladang terlihat layu.",
    "Sungai menyusut dan sumur hampir kering. Setiap tetes air sekarang sangat berharga."],
    "Utamakan air di atas pekerjaan lain sampai stok aman."),
  "reda": P("Air Kembali", ["Hujan akhirnya turun! Penduduk menari di halaman sambil menengadahkan wajah.",
    "Stok air kembali aman. Ladang yang layu perlahan tegak lagi."], "")}},
 "ancaman_kebakaran": {"nama": "Kebakaran", "musim": ["panas"], "event_terkait": ["asap_dapur"], "tingkat": {
  "waspada": P("Bau Asap", ["Bau asap aneh tercium dari arah {bangunan}. Sepertinya ada bara yang belum padam.",
    "Sore ini asap tipis keluar dari celah {bangunan}. {nama} mengendus-endus dengan cemas."],
    "Siapkan stok air minimal 5 dan perbaiki bangunan yang rusak."),
  "bahaya": P("Api Menyala!", ["Api menyala di {bangunan}! Penduduk berlari membawa ember air.",
    "Lidah api terlihat dari atap {bangunan}. Cepat padamkan sebelum merembet ke bangunan sebelah!"],
    "Prioritas Padam aktif otomatis. Pastikan ada air di gudang."),
  "reda": P("Api Padam", ["Api di {bangunan} berhasil dipadamkan. Semua orang duduk terengah-engah, wajah coreng-moreng jelaga.",
    "Asap terakhir menghilang. {bangunan} gosong sedikit, tapi desa selamat."], "")}},
 "ancaman_serigala": {"nama": "Serigala", "musim": ["semi", "panas", "gugur", "dingin"], "event_terkait": ["serigala_malam", "serigala_lapar"],
  "catatan": "waspada = fase jejak (sore), bahaya = fase mendekat (awal malam), reda = fase usai (fajar). Teks serangan ada di log_ancaman.",
  "tingkat": {
  "waspada": P("Jejak Serigala", ["Ada jejak kaki serigala di tepi hutan. Auman jauh terdengar menjelang senja.",
    "{nama} menemukan jejak cakar di lumpur dekat ladang. Malam ini sebaiknya semua pulang lebih awal."],
    "Nyalakan Obor dan pasang Pagar di sekitar rumah."),
  "bahaya": P("Auman Mendekat!", ["Lolongan terdengar makin dekat. Penduduk yang masih di luar sebaiknya segera pulang.",
    "Mata-mata kecil berkilat di balik semak. Serigala sedang mengintai desa malam ini."],
    "Jauhkan penduduk dari kegelapan. Obor, Pagar, dan Menara jaga membuat desa lebih aman."),
  "reda": P("Fajar Menyingsing", ["Matahari terbit dan serigala kembali ke hutan. Desa bisa bernapas lega.",
    "Pagi datang. Hanya jejak kaki di tanah yang tersisa dari tamu malam tadi."], "")}},
 "ancaman_dingin_ekstrem": {"nama": "Dingin ekstrem", "musim": ["dingin"], "event_terkait": ["dingin_ekstrem", "musim_dingin_keras"], "tingkat": {
  "waspada": P("Angin Membeku", ["Angin membeku malam ini... Termometer turun drastis. Besok akan sangat dingin.",
    "Langit sore berwarna biru pucat dan angin terasa menusuk. {nama} menumpuk kayu bakar ekstra di dekat api."],
    "Tambah kayu bakar dan pakaian hangat. Jaga penduduk dekat api atau rumah."),
  "bahaya": P("Dingin Menggigit!", ["Hari ini dingin sekali. Penduduk yang jauh dari api cepat lapar dan murung.",
    "Embun di jendela membeku jadi bunga-bunga es. Siapa pun yang di luar terlalu lama akan menggigil."],
    "Kurangi kerja di luar dan pastikan api unggun tidak padam."),
  "reda": P("Udara Menghangat", ["Angin beku sudah reda. Penduduk keluar rumah sambil meregangkan badan.",
    "Matahari musim dingin muncul malu-malu. Hari terdingin telah berlalu."], "")}},
 "ancaman_badai": {"nama": "Badai", "musim": ["semi", "gugur", "dingin"], "event_terkait": ["badai"], "tingkat": {
  "waspada": P("Awan Gelap", ["Awan gelap menggumpal di kejauhan. Kilat menyambar tanpa suara di cakrawala.",
    "{nama} mencium bau hujan yang tajam. \"Sebentar lagi badai,\" katanya sambil mengikat atap."],
    "Perbaiki bangunan yang rusak dan siapkan kayu untuk memperkuat atap."),
  "bahaya": P("Badai Datang!", ["Angin menderu dan hujan turun deras. Kerja di luar jadi lambat.",
    "Petir menyambar dekat sekali! Semua orang berlari ke bawah atap."],
    "Biarkan penduduk berlindung. Bangunan rusak bisa diperbaiki nanti."),
  "reda": P("Badai Berlalu", ["Badai berlalu. Udara segar dan pelangi tipis muncul di atas ladang.",
    "Langit kembali biru. Penduduk keluar memunguti dahan patah untuk kayu bakar."], "")}},
 "ancaman_kelaparan": {"nama": "Kelaparan", "musim": ["semi", "panas", "gugur", "dingin"], "event_terkait": [],
  "catatan": "Jenjang UI lengkap (aman sampai kolaps) ada di jenjang_kelaparan.", "tingkat": {
  "waspada": P("Stok Menipis", ["Stok pangan tinggal untuk {hari_sisa} hari. Saatnya mengutamakan makanan.",
    "{nama} melirik gudang yang mulai lapang. \"Kita perlu lebih banyak makanan,\" bisiknya."],
    "Naikkan prioritas makanan dan bertani. Tunda bangunan yang tidak mendesak."),
  "bahaya": P("Perut Keroncongan", ["Makanan hampir habis! Penduduk mulai lemas dan murung.",
    "Porsi makan malam makin kecil. Semua orang bekerja dengan perut berbunyi."],
    "Semua tangan untuk makanan: kumpul buah, memancing, dan panen."),
  "reda": P("Perut Aman", ["Stok pangan kembali aman. Senyum lebar muncul di meja makan.",
    "Gudang terisi lagi. Malam ini semua orang makan sampai kenyang."], "")}}
}

# ---------- jenjang UI kelaparan (RISET-MUSIM-ANCAMAN §2.5) ----------
J = lambda label, warna, banner, tooltip, **x: {"label": label, "warna": warna, "banner": banner, "tooltip": tooltip, **x}
jenjang_kelaparan = {
 "id": "ancaman_kelaparan",
 "judul": "Persediaan Pangan",
 "tingkat": {
  "aman": J("Aman", "hijau", "", "Stok pangan cukup untuk {jumlah} hari. Penduduk makan dengan tenang."),
  "waspada": J("Waspada", "kuning", "Stok pangan tinggal {jumlah} hari. Mulai utamakan makanan.",
    "Persediaan mulai menipis. Masih aman, tapi jangan lengah."),
  "bahaya": J("Bahaya", "oranye", "Stok pangan hanya {jumlah} hari! Penduduk mulai murung.",
    "Suasana hati penduduk turun setiap hari sampai stok kembali cukup."),
  "kritis": J("Kritis", "merah", "Pangan kritis: {jumlah} hari lagi! Penduduk mulai lemah.",
    "Kesehatan penduduk mulai turun dan ada yang mungkin ingin pergi. Jeda sebentar dan atur prioritas makanan.",
    saran_jeda="Tekan jeda dan atur prioritas makanan ke paling atas."),
  "kolaps": J("Kelaparan", "merah", "Lumbung kosong! Desa kelaparan.",
    "Tidak ada makanan sama sekali. Kesehatan turun cepat setiap hari.",
    modal={"judul": "Desa Kelaparan", "teks": "Lumbung benar-benar kosong. Penduduk lemas dan kesehatannya turun cepat. Kumpulkan makanan apa saja sekarang: buah semak, ikan sungai, atau tukar barang dengan pedagang. Masih ada waktu untuk bangkit!",
           "tombol": "Kumpulkan makanan sekarang"})
 }
}

# ---------- 3. event musiman: struktur event_acak + field musim ----------
# Hadiah pangan sengaja kecil (nerf RISET-TAHAP3 §7; ancaman tidak boleh "menyuntik" makanan). Pilihan terakhir tanpa biaya sumber daya.
event_musiman = [
 # semi
 EM("banjir_kecil","Sungai Meluap","Hujan semalaman membuat sungai naik. Air cokelat mulai merayap ke ladang di tepi sungai.",[
  C("Gali parit pengalih air",{"energi":-10,"kayu":-5},"Parit kecil menuntun air kembali ke sungai. Ladang selamat, dan semua orang belepotan lumpur sambil tertawa."),
  C("Selamatkan benih ke Gudang",{"energi":-5,"pertumbuhan_ladang":-1},"Benih aman di Gudang, tapi ladang tepi sungai harus menunggu air surut sebelum tumbuh lagi."),
  C("Tunggu air surut",{"pertumbuhan_ladang":-1,"suasana_hati":-3},"Penduduk menonton air dari jauh. Sehari kemudian sungai kembali tenang, meninggalkan lumpur subur.")
 ],"cuaca","semi"),
 EM("bunga_semi","Padang Bunga Bermekaran","Bukit di dekat desa tiba-tiba dipenuhi bunga kuning dan ungu. Lebah berdengung riang di mana-mana.",[
  C("Piknik bersama di bukit",{"energi":-5,"suasana_hati":12},"Semua orang duduk di antara bunga, berbagi bekal dan cerita. Hari yang sempurna."),
  C("Cari sarang lebah",{"energi":-5,"makanan":3,"kesehatan_satu":-5},"Madu manis didapat! Hanya saja {nama} pulang dengan hidung sedikit bengkak karena disengat."),
  C("Petik beberapa untuk rumah",{"suasana_hati":5},"Vas-vas kecil berisi bunga menghiasi setiap jendela gubuk.")
 ],"perayaan","semi"),
 EM("kelinci_ladang","Kelinci Menyerbu Ladang","Sekawanan kelinci kecil melompat-lompat di ladang dan menggigiti tunas muda. Lucu, tapi merepotkan!",[
  C("Pasang pagar ranting",{"kayu":-10},"Pagar ranting berdiri. Kelinci-kelinci mendengus kecewa lalu pindah ke semak liar."),
  C("Tanam wortel ekstra untuk mereka",{"gandum":-3,"suasana_hati":8},"Kelinci kenyang dan tidak lagi mengganggu ladang. Anak-anak mendapat teman baru yang berbulu."),
  C("Biarkan saja",{"pertumbuhan_ladang":-1},"Kelinci berpesta tunas muda. Ladang harus menumbuhkan daun baru dulu.")
 ],"bahaya","semi"),
 # panas
 EM("gelombang_panas","Gelombang Panas","Matahari menyengat tanpa ampun. Ember di sumur cepat kosong dan penduduk berkeringat sejak pagi.",[
  C("Bekerja pagi dan sore saja",{"hari_kerja_hilang":1,"suasana_hati":5},"Siang hari semua tidur di bawah pohon rindang. Pekerjaan lambat, tapi tak ada yang kepanasan."),
  C("Bagikan air ekstra",{"air":-10,"energi":10},"Semua orang minum puas dan bekerja kembali dengan semangat."),
  C("Tetap bekerja seperti biasa",{"energi":-15,"kesehatan":-5},"Pekerjaan jalan terus, tapi penduduk pulang dengan wajah merah dan lemas.")
 ],"cuaca","panas"),
 EM("ikan_melimpah","Sungai Penuh Ikan","Air sungai jernih dan ikan-ikan berkilau berenang berkelompok. {nama} sampai terpekik girang.",[
  C("Memancing bersama",{"energi":-5,"makanan":4,"suasana_hati":5},"Keranjang terisi ikan. Malam ini ada ikan bakar untuk semua."),
  C("Lomba memancing",{"energi":-10,"suasana_hati":12},"{nama} menang dengan ikan sebesar lengan. Semua bertepuk tangan, ikannya dilepas kembali."),
  C("Nikmati pemandangannya saja",{"suasana_hati":3},"Penduduk duduk di tepi sungai, mencelupkan kaki ke air yang sejuk.")
 ],"langka","panas"),
 EM("asap_dapur","Bau Asap dari Dapur","Sore yang terik, bau asap aneh tercium dari Dapur. Ada bara yang jatuh ke tumpukan kayu kering!",[
  C("Siram dengan air",{"air":-8,"energi":-5},"Bara padam dengan desis panjang. Dapur selamat, hanya lantainya basah."),
  C("Pindahkan tumpukan kayu",{"energi":-10,"kayu":-5},"Kayu kering dijauhkan dari tungku. Beberapa batang terlanjur gosong, tapi api tidak sempat menyala."),
  C("Nanti saja setelah makan malam",{"kesehatan_bangunan":-15,"suasana_hati":-5},"Api kecil sempat menjilat dinding Dapur sebelum dipadamkan. Tukang harus memperbaikinya besok.")
 ],"bahaya","panas"),
 # gugur
 EM("angin_gugur","Angin Gugur yang Usil","Angin kencang musim gugur menerbangkan daun dan jerami atap ke mana-mana.",[
  C("Ikat atap dengan tali",{"kayu":-5,"energi":-5},"Atap terikat kencang. Angin hanya bisa bermain dengan tumpukan daun."),
  C("Kumpulkan daun untuk kompos",{"energi":-5,"pertumbuhan_ladang":1},"Daun-daun jadi kompos. Ladang musim depan akan lebih subur."),
  C("Lompat-lompat di tumpukan daun",{"suasana_hati":8,"kesehatan_bangunan":-5},"Tawa terdengar di mana-mana. Sedikit jerami atap hilang, tapi tidak ada yang menyesal.")
 ],"cuaca","gugur"),
 EM("jamur_hutan","Jamur Bermunculan","Setelah hujan, jamur-jamur bulat bermunculan di hutan. Ada yang cokelat, ada yang merah berbintik putih.",[
  C("Petik yang dikenal saja",{"energi":-5,"makanan":3},"{nama} yang paham tanaman memilih jamur yang aman. Sup jamur malam ini harum sekali."),
  C("Petik semuanya!",{"makanan":4,"kesehatan":-8},"Sup jamurnya enak, tapi beberapa orang sakit perut semalaman. Jamur merah berbintik memang bukan untuk dimakan."),
  C("Biarkan tumbuh di hutan",{"suasana_hati":2},"Penduduk cukup mengagumi jamur-jamur itu. Hutan tetap cantik dan rapi.")
 ],"musim","gugur"),
 EM("burung_migrasi","Burung Pulang ke Selatan","Ribuan burung terbang membentuk huruf V di langit. Suara mereka terdengar seperti lagu perpisahan.",[
  C("Lambaikan tangan bersama",{"suasana_hati":8},"Seluruh desa melambai ke langit. Rasanya seperti mengantar teman lama pergi berlibur."),
  C("Bersiap seperti burung",{"energi":-5,"kayu":5},"Melihat burung bersiap, penduduk ikut menumpuk kayu bakar untuk musim dingin."),
  C("Lanjutkan bekerja",{"suasana_hati":1},"Beberapa orang melirik ke atas sejenak, lalu tersenyum dan kembali bekerja.")
 ],"langka","gugur"),
 # dingin
 EM("dingin_ekstrem","Hari Paling Dingin","Angin beku bertiup sejak subuh. Air di ember membeku dan napas berubah jadi kabut tebal.",[
  C("Semua berkumpul di dekat api",{"kayu":-10,"suasana_hati":5},"Desa menghabiskan hari dengan bercerita di dekat api. Dingin di luar, hangat di dalam."),
  C("Bagikan pakaian kulit",{"kulit":-3,"kesehatan":5},"Pakaian kulit dibagikan. Penduduk tetap bisa bekerja walau pipi mereka merah seperti tomat."),
  C("Bertahan di rumah masing-masing",{"hari_kerja_hilang":1,"suasana_hati":-5},"Semua meringkuk di bawah selimut. Sepi dan dingin, tapi semua selamat.")
 ],"musim","dingin"),
 EM("badai_salju","Badai Salju","Salju turun begitu lebat sampai Gudang hampir tak terlihat dari Gubuk.",[
  C("Sekop jalan setapak bersama",{"energi":-15,"suasana_hati":5},"Jalan setapak terbuka. Seseorang membuat boneka salju bermata batu di tengah desa."),
  C("Perkuat atap dari beban salju",{"kayu":-10},"Atap ditopang balok tambahan. Tak ada yang roboh walau salju menumpuk tinggi."),
  C("Tunggu badai reda",{"kesehatan_bangunan":-10,"hari_kerja_hilang":1},"Badai reda keesokan harinya. Beberapa atap melengkung karena berat salju.")
 ],"cuaca","dingin"),
 EM("malam_terpanjang","Malam Terpanjang","Malam ini malam terpanjang tahun ini. Para tetua bilang, kisah yang diceritakan malam ini akan diingat lama.",[
  C("Adakan malam dongeng",{"kayu":-5,"suasana_hati":12},"{nama} bercerita tentang leluhur, dan {nama2} menirukan suara binatang. Semua tertawa sampai fajar."),
  C("Nyalakan lentera di setiap rumah",{"kayu":-8,"suasana_hati":8},"Desa berkelip seperti bintang di tengah salju. Siapa pun yang tersesat pasti bisa menemukan jalan pulang."),
  C("Tidur lebih awal",{"energi":10},"Malam yang panjang berarti tidur yang panjang. Semua bangun segar dan siap bekerja.")
 ],"perayaan","dingin"),
 EM("serigala_lapar","Serigala Lapar di Musim Dingin","Salju menutupi hutan dan serigala kesulitan berburu. Jejak mereka terlihat makin dekat ke Gudang.",[
  C("Nyalakan obor di sekeliling desa",{"kayu":-10,"energi":-5},"Cincin cahaya mengelilingi desa. Serigala mengamati dari jauh, lalu pergi mencari tempat lain."),
  C("Tinggalkan tulang di tepi hutan",{"daging":-4,"suasana_hati":3},"Serigala mengambil tulang dan tidak mendekat lagi. Mungkin mereka juga punya anak yang lapar."),
  C("Kunci pintu dan berjaga",{"energi":-15,"suasana_hati":-5},"Malam panjang tanpa tidur nyenyak. Pagi harinya, hanya jejak kaki yang tersisa di salju.")
 ],"bahaya","dingin"),
]

# ---------- 4. log ancaman (gaya log_harian: diawali "Hari {hari}:") ----------
log_ancaman = {
 "serigala_jejak": [
  "Hari {hari}: {nama} menemukan jejak serigala di tepi hutan. Auman jauh terdengar saat matahari terbenam.",
  "Hari {hari}: Ada bekas cakar di batang pohon dekat ladang. Malam ini sebaiknya semua pulang lebih awal."],
 "serigala_mendekat": [
  "Hari {hari}: Lolongan serigala makin dekat. {nama} bergegas pulang sambil menoleh ke belakang.",
  "Hari {hari}: Mata-mata kecil berkilat di balik semak. Penduduk merapat ke api unggun."],
 "serangan_serigala": [
  "Hari {hari}: Seekor serigala menerkam {nama} yang masih bekerja di luar saat gelap. {nama2} datang membawa obor dan mengusirnya.",
  "Hari {hari}: {nama} digigit serigala dalam perjalanan pulang. Untung teriakannya membangunkan seluruh desa.",
  "Hari {hari}: Serigala menyergap {nama} di dekat ladang. Ia berhasil lari ke gubuk, tapi terluka."],
 "serangan_hewan": [
  "Hari {hari}: {hewan} menyeruduk {nama} di tepi hutan. Ia terjatuh dan kakinya terkilir.",
  "Hari {hari}: {nama} dikejar {hewan} sampai ke sungai. Ia selamat, tapi lengannya tergores.",
  "Hari {hari}: {hewan} mengobrak-abrik {bangunan}. {nama} terluka saat mencoba mengusirnya."],
 "diusir": [
  "Hari {hari}: Cahaya obor membuat serigala ragu. Mereka berbalik ke hutan tanpa mendekat.",
  "Hari {hari}: Pagar kayu menghalangi jalan serigala. Mereka berputar-putar lalu pergi dengan kesal.",
  "Hari {hari}: {nama} meniup terompet dari Menara jaga. Serigala lari terbirit-birit ke hutan.",
  "Hari {hari}: {nama} dan {nama2} berjaga semalaman. Tidak ada satu pun serigala yang berani mendekat."],
 "serigala_usai": [
  "Hari {hari}: Fajar menyingsing. Serigala sudah kembali ke hutan.",
  "Hari {hari}: Pagi yang tenang. Hanya jejak kaki di tanah yang tersisa dari malam tadi."],
 "luka": [
  "Hari {hari}: {nama} terluka dan harus beristirahat. Lukanya dibalut daun obat oleh {nama2}.",
  "Hari {hari}: {nama} berjalan pincang hari ini. Teman-teman bergantian membawakan makanannya.",
  "Hari {hari}: Luka {nama} dibersihkan dan dibalut rapi. \"Cuma lecet,\" katanya, walau meringis."],
 "trauma": [
  "Hari {hari}: {nama} masih teringat malam serangan itu. Ia kini enggan keluar setelah gelap.",
  "Hari {hari}: {nama} terbangun karena mimpi buruk. {nama2} menemaninya duduk di dekat api sampai tenang."],
 "sembuh": [
  "Hari {hari}: Luka {nama} sudah sembuh. Ia kembali bekerja sambil bersiul.",
  "Hari {hari}: {nama} melepas perbannya dan memamerkan bekas luka kecil. \"Sekarang aku punya cerita!\"",
  "Hari {hari}: {nama} pulih sepenuhnya. Desa menyambutnya dengan sepiring makanan hangat.",
  "Hari {hari}: {nama} tidak lagi takut gelap. Malam ini ia ikut duduk di dekat api bersama yang lain."],
 "kebakaran_menyala": [
  "Hari {hari}: Api menyala di {bangunan}! {nama} berteriak memanggil semua orang.",
  "Hari {hari}: Bara dari tungku menyulut {bangunan}. Asap hitam membubung ke langit."],
 "kebakaran_padam": [
  "Hari {hari}: {nama} dan {nama2} berhasil memadamkan api di {bangunan}. Semua orang bertepuk tangan dengan tangan berjelaga.",
  "Hari {hari}: Api di {bangunan} padam setelah {jumlah} ember air. Desa selamat."],
 "kebakaran_sekat": [
  "Hari {hari}: Air habis! Penduduk merobohkan tumpukan kayu untuk menyekat api supaya tidak merembet.",
  "Hari {hari}: Tanpa air, {nama} mengorbankan {jumlah} kayu untuk membuat sekat api. Api berhenti menyebar."],
 "kebakaran_rugi": [
  "Hari {hari}: Sebagian isi {bangunan} ikut terbakar. {jumlah} {sumber_daya} hilang menjadi abu.",
  "Hari {hari}: {bangunan} rusak parah karena api. Tukang akan memperbaikinya pelan-pelan."],
 "banjir_ladang": [
  "Hari {hari}: Air sungai menggenangi ladang di tepi sungai. Tanaman di sana berhenti tumbuh sebentar.",
  "Hari {hari}: Jalan dekat sungai becek sekali. Penduduk berjalan pelan agar tidak tergelincir."],
 "kekeringan_ladang": [
  "Hari {hari}: Ladang kehausan. Tanaman tumbuh lebih lambat sampai hujan datang.",
  "Hari {hari}: {nama} menyiram ladang dengan sisa air terakhir. Daun-daun tampak sedikit lega."],
 "dingin_jauh_api": [
  "Hari {hari}: {nama} menggigil karena terlalu lama bekerja jauh dari api.",
  "Hari {hari}: Jari-jari {nama} kaku kedinginan. Ia buru-buru menghangatkan diri di dekat api unggun."],
 "kayu_bakar_habis": [
  "Hari {hari}: Kayu bakar habis! Api unggun meredup dan penduduk merapatkan selimut.",
  "Hari {hari}: Api unggun hampir padam. {nama} berlari ke hutan mencari ranting kering."]
}

# ---------- 5a. penduduk sakit ----------
penduduk_sakit = {
 "ringan": {
  "mulai": ["Hari {hari}: {nama} bersin-bersin dan badannya hangat. Ia bekerja lebih pelan hari ini.",
            "Hari {hari}: {nama} merasa kurang enak badan. Sebaiknya ia banyak istirahat di gubuk.",
            "Hari {hari}: {nama} batuk kecil sejak pagi. {nama2} membuatkan wedang jahe untuknya."],
  "istirahat": ["Hari {hari}: {nama} tidur siang di gubuk, berselimut tebal. Teman-teman menjaga suara agar tidak berisik.",
                "Hari {hari}: {nama} beristirahat sambil memandangi hujan dari jendela."],
  "sembuh": ["Hari {hari}: {nama} sudah sehat kembali! Ia langsung ingin bekerja, tapi dipaksa sarapan dulu.",
             "Hari {hari}: Demam {nama} turun. Ia keluar gubuk dan menghirup udara pagi dalam-dalam."]
 },
 "parah": {
  "mulai": ["Hari {hari}: {nama} sakit parah dan tidak bisa bangun dari tempat tidur. Ia butuh dirawat.",
            "Hari {hari}: Wajah {nama} pucat dan tubuhnya lemas sekali. Seseorang harus menemaninya."],
  "butuh_rawat": ["{nama} sakit parah. Perlu satu penduduk yang merawat dan sedikit makanan hangat.",
                  "Belum ada yang merawat {nama}. Tanpa perawatan, kondisinya bisa memburuk."],
  "dirawat": ["Hari {hari}: {nama2} merawat {nama} seharian, menyuapinya bubur dan mengganti kompres dingin.",
              "Hari {hari}: {nama2} duduk di samping {nama} sambil bercerita pelan sampai ia tertidur."],
  "memburuk": ["Hari {hari}: Kondisi {nama} memburuk. Desa berharap ia segera ada yang merawat.",
               "Hari {hari}: {nama} makin lemah. Semua orang berbicara pelan di dekat gubuknya."],
  "sembuh": ["Hari {hari}: Berkat perawatan {nama2}, {nama} akhirnya pulih. Mereka berpelukan lama sekali.",
             "Hari {hari}: {nama} bisa duduk dan tersenyum lagi. Desa merayakannya dengan semangkuk sup hangat."]
 },
 "per_penyebab": {
  "wabah": ["Hari {hari}: {nama} ikut tertular batuk yang sedang menyebar. Ia beristirahat terpisah sementara.",
            "Hari {hari}: Wabah kecil membuat {nama} demam. Ramuan daun obat sedang direbus untuknya."],
  "dingin": ["Hari {hari}: {nama} masuk angin karena terlalu lama di luar saat dingin. Hidungnya merah seperti buah ceri.",
             "Hari {hari}: Dingin menusuk membuat {nama} demam. Ia dibungkus selimut di dekat api."],
  "kelaparan": ["Hari {hari}: {nama} lemas karena sudah lama kurang makan. Ia butuh makanan bergizi dan istirahat.",
                "Hari {hari}: Tubuh {nama} melemah karena perut kosong berhari-hari. Semoga lumbung segera terisi."],
  "serangan": ["Hari {hari}: Luka {nama} dari serangan semalam membuatnya demam. Ia harus dirawat sampai pulih.",
               "Hari {hari}: {nama} masih lemah setelah diserang {hewan}. Lukanya perlu dijaga tetap bersih."],
  "tua": ["Hari {hari}: {nama} yang sudah berumur {umur} tahun makin sering lelah. Ia lebih banyak duduk di dekat api.",
          "Hari {hari}: Langkah {nama} makin pelan. Anak-anak desa bergantian menemaninya berjalan-jalan."]
 }
}

# ---------- 5b. meninggal, pemakaman, duka (hangat, tidak grafis) ----------
penduduk_meninggal = {
 "notifikasi": {"judul": "Selamat Jalan, {nama}", "tombol": "Kenang bersama"},
 "per_penyebab": {
  "sakit": ["Hari {hari}: {nama} beristirahat untuk selamanya setelah lama sakit. Ia pergi dengan tenang, ditemani {nama2}.",
            "Hari {hari}: Demam {nama} tak kunjung turun. Malam ini ia tertidur dan tidak bangun lagi. Desa terdiam.",
            "Hari {hari}: {nama} berpulang dalam tidurnya. Di tangannya masih tergenggam bunga dari {nama2}."],
  "tua": ["Hari {hari}: {nama} berpulang di usia {umur} tahun, setelah hari yang tenang di dekat api unggun.",
          "Hari {hari}: {nama} menutup mata untuk terakhir kali sambil tersenyum. Hidupnya panjang dan penuh cerita.",
          "Hari {hari}: Di usia {umur}, {nama} pergi dengan damai. Ia sempat berpesan agar semua tetap rukun."],
  "kelaparan": ["Hari {hari}: {nama} terlalu lemah karena kelaparan dan berpulang. Desa berjanji lumbung tidak akan kosong lagi.",
                "Hari {hari}: {nama} pergi saat lumbung kosong. Ia selalu memberikan porsinya untuk yang lebih muda.",
                "Hari {hari}: Perut kosong terlalu lama membuat {nama} tak sanggup bertahan. Semua orang menunduk."],
  "dingin": ["Hari {hari}: {nama} tak kuat melawan dingin yang menggigit dan berpulang malam ini. Api unggun dinyalakan lebih besar untuknya.",
             "Hari {hari}: Musim dingin terlalu berat bagi {nama}. Ia tertidur di bawah selimut tebal dan tidak bangun lagi.",
             "Hari {hari}: {nama} berpulang di malam paling dingin. Desa berkumpul, saling menghangatkan dalam diam."],
  "serangan": ["Hari {hari}: {nama} berpulang setelah melindungi desa dari {hewan}. Keberaniannya akan selalu diingat.",
               "Hari {hari}: Luka {nama} terlalu berat. Ia pergi dengan tenang, dikelilingi teman-temannya.",
               "Hari {hari}: {nama} tidak selamat dari serangan malam itu. Desa bersumpah akan memasang lebih banyak obor."]
 },
 "kenangan_panel": [
  "{nama} ({umur} tahun), {sifat}. Tinggal bersama kita selama {lama_tinggal} hari.",
  "{nama}, yang {sifat}. Paling pandai {skill}. {lama_tinggal} hari di desa ini.",
  "{nama} ({umur}). Dikenang karena tawanya di dekat api unggun."
 ]
}

pemakaman = {
 "tugas_makam": [
  "Hari {hari}: {nama2} menyiapkan tempat peristirahatan untuk {nama} di bawah pohon rindang.",
  "Hari {hari}: Penduduk membuat Makam sederhana untuk {nama} dari kayu dan batu sungai."],
 "upacara": [
  "Hari {hari}: Seluruh desa berkumpul di Makam {nama}. Mereka bergantian menceritakan kenangan lucu tentangnya.",
  "Hari {hari}: Lagu kesukaan {nama} dinyanyikan pelan-pelan. Bahkan burung-burung seperti ikut terdiam.",
  "Hari {hari}: Bunga liar diletakkan di Makam {nama}. {nama2} berjanji akan merawatnya setiap musim semi.",
  "Hari {hari}: Desa makan bersama untuk mengenang {nama}. Kursinya dibiarkan kosong, dengan semangkuk sup di depannya."],
 "per_penyebab": {
  "sakit": ["Semua orang mengingat bagaimana {nama} tetap tersenyum walau sedang sakit."],
  "tua": ["Anak-anak duduk melingkar, mendengarkan cerita masa muda {nama} dari para tetua.",
          "Umur {nama} panjang dan penuh kebaikan. Hari ini terasa lebih seperti syukuran daripada duka."],
  "kelaparan": ["Di depan Makam {nama}, desa berjanji untuk selalu mengisi lumbung sebelum musim dingin."],
  "dingin": ["Api kecil dinyalakan di samping Makam {nama}, supaya ia tidak kedinginan lagi."],
  "serangan": ["Obor dinyalakan di sekeliling Makam {nama}, pahlawan kecil yang melindungi desa."]
 },
 "warisan": [
  "{nama} meninggalkan kapak kecil yang selalu ia asah. Kini {nama2} memakainya dengan hati-hati.",
  "Resep sup rahasia {nama} ditulis di dinding Dapur supaya tidak pernah terlupa.",
  "Kebun kecil yang ditanam {nama} masih berbunga. Penduduk menyiramnya bergantian.",
  "Lagu yang sering disenandungkan {nama} kini dinyanyikan anak-anak setiap pagi.",
  "{nama2} mewarisi kebiasaan {nama}: bangun paling pagi dan menyalakan api unggun untuk semua.",
  "Ilmu {skill} yang diajarkan {nama} membuat {nama2} makin terampil."],
 "nisan": [
  "Di sini beristirahat {nama}, {sifat}. Terima kasih untuk {lama_tinggal} hari yang hangat.",
  "{nama} ({umur} tahun). Selalu punya tempat di dekat api unggun kami.",
  "Untuk {nama}, yang membuat desa ini terasa seperti rumah."],
 "makam_komunal": [
  "Nama {nama} diukir di dinding kenangan Balai desa, di antara nama-nama yang kita sayangi.",
  "Lilin kecil dinyalakan di Balai desa untuk {nama}. Siapa pun boleh mampir untuk menyapanya."]
}

# duka (id duka_*)
duka = {
 "duka_mulai": ["Desa berduka atas kepergian {nama}. Hari-hari ke depan akan terasa lebih sunyi.",
                "Tidak ada yang bersenandung hari ini. Semua orang merindukan {nama}."],
 "duka_harian": ["Hari {hari}: Kursi {nama} di dekat api masih kosong. Penduduk bekerja dalam diam.",
                 "Hari {hari}: {nama2} tanpa sadar menyiapkan porsi untuk {nama}, lalu tersenyum sedih.",
                 "Hari {hari}: Penduduk mulai bercerita lagi tentang {nama}, kali ini sambil tertawa kecil.",
                 "Hari {hari}: {nama2} meletakkan bunga baru di Makam {nama}. Rindu masih ada, tapi hati mulai ringan.",
                 "Hari {hari}: Desa perlahan bangkit. {nama} pasti senang melihat semua tersenyum lagi."],
 "duka_diringankan": ["Festival membuat duka terasa lebih ringan. Desa menari untuk mengenang {nama}.",
                      "Kebersamaan malam ini membantu semua orang melepas {nama} dengan hati yang lebih lapang."],
 "duka_berakhir": ["Masa berkabung untuk {nama} usai. Kenangannya tetap tinggal, hangat seperti api unggun.",
                   "Desa kembali bersemangat. Setiap kali api unggun menyala, rasanya {nama} ikut duduk di sana."],
 "tooltip": "Desa sedang berduka: suasana hati turun sedikit setiap hari selama masa berkabung. Festival dan kebersamaan membantu pulih lebih cepat."
}

# ---------- 6. penduduk pergi karena tidak bahagia ----------
penduduk_pergi = {
 "peringatan": {
  "waspada": ["{nama} terlihat murung beberapa hari ini. Mungkin ia butuh makanan enak, istirahat, atau teman bicara.",
              "{nama} sering duduk sendiri di tepi sungai. Ada yang membuatnya tidak bahagia.",
              "{nama} tidak ikut bernyanyi di dekat api malam ini. Sebaiknya ada yang menghiburnya."],
  "bahaya": ["{nama} mulai mengemasi barang-barangnya. Kalau suasana hatinya tidak membaik dalam {hari_sisa} hari, ia mungkin pergi.",
             "{nama} bertanya pada pedagang tentang jalan ke desa lain. Ia sepertinya ingin pergi.",
             "{nama} menatap jalan keluar desa lama sekali. Desa harus segera membuatnya betah lagi."],
  "saran": "Penduduk yang murung terlalu lama bisa pergi. Utamakan makanan, api unggun, rumah, dan beri waktu istirahat."
 },
 "penyebab": {
  "mood": "{nama} sudah lama tidak bahagia di desa ini.",
  "lapar": "{nama} sudah berhari-hari kelaparan dan ingin mencari tempat yang lebih berkecukupan."
 },
 "tercegah": ["Senyum {nama} kembali. Ia membongkar lagi buntelannya dan menggantung topinya di gubuk.",
              "{nama} memutuskan untuk tetap tinggal. \"Di sini rumahku,\" katanya sambil memeluk {nama2}."],
 "kepergian": ["Hari {hari}: {nama} meninggalkan desa saat fajar. Ia melambai sekali dari ujung jalan, lalu menghilang di balik bukit.",
               "Hari {hari}: {nama} pamit dengan mata berkaca-kaca. Ia membawa bekal secukupnya dan sebuah syal rajutan {nama2}.",
               "Hari {hari}: Gubuk {nama} kosong pagi ini. Hanya ada sepucuk surat di atas tempat tidurnya."],
 "dampak_desa": ["Kepergian {nama} membuat semua orang sedih. Desa merenungkan apa yang bisa diperbaiki.",
                 "Rasanya ada yang hilang sejak {nama} pergi. Semua berjanji untuk lebih saling menjaga."],
 "surat_perpisahan": [
  {"pembuka": "Untuk semua di desa,",
   "isi": "Maaf aku pergi tanpa banyak kata. Aku sudah lama merasa lelah dan sedih, dan aku butuh tempat untuk menata hati. Terima kasih untuk setiap makan malam di dekat api. Jaga {nama2} untukku, ya.",
   "penutup": "Dengan sayang, {nama}"},
  {"pembuka": "Kepala Desa yang baik,",
   "isi": "Desa ini indah, tapi akhir-akhir ini perutku sering kosong dan hatiku ikut kosong. Aku akan mencari keberuntungan di tempat lain. Semoga lumbung kalian selalu penuh dan tawa kalian selalu ramai.",
   "penutup": "Salam hangat, {nama}"},
  {"pembuka": "Teman-temanku tersayang,",
   "isi": "Jangan sedih, ini bukan salah siapa-siapa. Aku hanya butuh suasana baru. Aku tinggalkan tanaman kecilku di jendela. Tolong disiram, ya. Siapa tahu suatu hari aku mampir lagi.",
   "penutup": "Sampai jumpa di jalan, {nama}"}
 ],
 "kabar_kemudian": ["Seorang pedagang membawa kabar: {nama} kini tinggal di desa seberang dan baik-baik saja. Ia menitipkan salam untuk semua.",
                    "Sepucuk surat datang dari jauh. {nama} bilang ia sudah bahagia, dan masih sering merindukan api unggun desa."]
}

# ---------- tooltip bangunan pertahanan (id bangunan_*) ----------
B = lambda id_b, nama, tooltip, deskripsi, **x: {"id_bangunan": id_b, "nama": nama, "tooltip": tooltip, "deskripsi": deskripsi, **x}
bangunan_ancaman = {
 "bangunan_pagar": B("pagar", "Pagar", "Pagar kayu sederhana. Serigala malas melewatinya.",
   "Pasang pagar di sekeliling rumah supaya hewan buas harus berputar jauh. Rumah yang hampir terkurung pagar menjadi zona aman.",
   selesai="Hari {hari}: {nama} menancapkan tiang pagar terakhir. Gubuk-gubuk kini terasa lebih terlindungi.",
   terkunci="Pagar terbuka di era Dusun."),
 "bangunan_obor": B("obor", "Obor", "Cahaya kecil yang membuat malam lebih aman.",
   "Obor menerangi sekitarnya di malam hari. Serigala jauh lebih jarang menyerang penduduk di dekat cahaya. Butuh kayu sesekali agar tetap menyala.",
   selesai="Hari {hari}: Obor baru menyala. Bayangan-bayangan menakutkan langsung mundur ke hutan.",
   padam="Obor di dekat {bangunan} padam. Tambahkan kayu agar menyala lagi.",
   diisi="Hari {hari}: {nama} menambahkan kayu ke obor. Nyalanya kembali terang."),
 "bangunan_menara_jaga": B("menara_jaga", "Menara Jaga", "Menara tinggi untuk melihat bahaya dari jauh.",
   "Dari menara, penjaga bisa melihat serigala yang mendekat dan mengusirnya sekali setiap malam. Butuh penduduk dengan prioritas Jaga, atau penduduk yang sedang luang.",
   selesai="Hari {hari}: Menara jaga berdiri tegak. {nama} naik ke puncaknya dan melambai ke seluruh desa.",
   usir="Hari {hari}: Dari Menara jaga, {nama} melihat serigala mendekat dan meniup terompet. Mereka lari ke hutan.",
   kosong="Menara jaga tidak ada penjaganya malam ini.",
   terkunci="Menara jaga terbuka di era Desa Pertanian."),
 "bangunan_makam": B("makam", "Makam", "Tempat peristirahatan yang tenang untuk penduduk yang telah berpulang.",
   "Makam sederhana dari kayu dan batu sungai. Memberi desa tempat untuk mengenang dan berpamitan dengan layak.",
   selesai="Hari {hari}: Makam untuk {nama} selesai dibuat. Bunga-bunga liar mulai ditanam di sekitarnya.",
   kunjungan="Hari {hari}: {nama2} mampir ke Makam {nama} dan bercerita tentang hari ini.")
}

# prioritas kerja darurat baru (RISET-MUSIM-ANCAMAN §3)
prioritas_darurat = {
 "jaga": {"label": "Jaga", "tooltip": "Berjaga di Menara jaga dan sekitar desa saat malam."},
 "padam": {"label": "Padam", "tooltip": "Memadamkan api dengan air dari gudang. Aktif saat ada kebakaran."},
 "rawat": {"label": "Rawat", "tooltip": "Merawat penduduk yang sakit parah agar cepat pulih."},
 "makam": {"label": "Makam", "tooltip": "Menyiapkan makam dan upacara untuk penduduk yang berpulang."}
}

# ---------- meta v1.2.0 (hanya tambahan) ----------
PATCH_V120 = {
 "_patch": {"versi_dari": "1.1.0", "versi_ke": "1.2.0", "sumber": "docs/RISET-MUSIM-ANCAMAN.md §4 (Asisten Dokumen)",
            "catatan": "Patch aditif: menambah key top-level baru, menambah entri di dict meta yang sudah ada, dan menambah key meta baru. Entri lama tidak disentuh. Diterapkan oleh buat_teks.py atau tools/merge_v120.py."},
 "set_meta": {"versi": "1.2.0"},
 "tambah_entri_meta": {
  "placeholder": {
   "{hewan}": "Nama hewan, lihat meta.hewan",
   "{sifat}": "Sifat penduduk (penduduk[].sifat)",
   "{lama_tinggal}": "Lama penduduk tinggal di desa (angka hari)",
   "{tahun}": "Tahun permainan berjalan (angka, mulai 1)"},
  "kunci_efek": {
   "kesehatan_satu": "Perubahan kesehatan satu penduduk saja, yaitu {nama} di teks event (poin)",
   "pertumbuhan_ladang": "Perubahan progres tumbuh semua ladang yang sedang tumbuh (hari; negatif = tertunda)"},
  "struktur_tambahan": {
   "musim_pembuka": "Dict id musim_* -> {musim, kapan, variasi[]}. Pilih satu variasi acak.",
   "peringatan_dini": "Dict id ancaman_* -> {nama, musim[], event_terkait[], catatan?, tingkat{waspada|bahaya|reda: {judul, teks[], saran}}}",
   "jenjang_kelaparan": "UI stok pangan: tingkat aman|waspada|bahaya|kritis|kolaps -> {label, warna, banner, tooltip, saran_jeda?, modal?}. {jumlah} = foodDays.",
   "event_musiman": "Sama dengan event_acak + musim (id meta.musim tempat event boleh muncul)",
   "log_ancaman": "Dict kategori -> daftar log (diawali \"Hari {hari}:\" seperti log_harian)",
   "penduduk_sakit": "ringan{mulai,istirahat,sembuh}, parah{mulai,butuh_rawat,dirawat,memburuk,sembuh}, per_penyebab{id meta.penyebab_kondisi: []}",
   "penduduk_meninggal": "notifikasi{judul,tombol}, per_penyebab{sakit|tua|kelaparan|dingin|serangan: []}, kenangan_panel[] (1 baris)",
   "pemakaman": "tugas_makam[], upacara[], per_penyebab{}, warisan[], nisan[], makam_komunal[]",
   "duka": "duka_mulai[], duka_harian[] (urut hari 1-5), duka_diringankan[], duka_berakhir[], tooltip",
   "penduduk_pergi": "peringatan{waspada[],bahaya[],saran}, penyebab{mood,lapar}, tercegah[], kepergian[], dampak_desa[], surat_perpisahan[{pembuka,isi,penutup}], kabar_kemudian[]",
   "bangunan_ancaman": "Dict id bangunan_* -> {id_bangunan, nama, tooltip, deskripsi, selesai, ...teks khusus}",
   "prioritas_darurat": "Label & tooltip prioritas kerja baru: jaga, padam, rawat, makam"}
 },
 "tambah_key_meta": {
  "status_musim_ancaman": "mengikuti_riset",
  "sumber_musim_ancaman": "docs/RISET-MUSIM-ANCAMAN.md (§1 musim, §2 ancaman, §3 bangunan & prioritas, §4 catatan teks)",
  "tingkat_peringatan": {"waspada": "Waspada (tanda awal; kuning)", "bahaya": "Bahaya (puncak ancaman; oranye/merah)", "reda": "Reda (ancaman berlalu)"},
  "tingkat_kelaparan": {"aman": "foodDays >= 8", "waspada": "5-8", "bahaya": "3-5", "kritis": "< 3", "kolaps": "foodDays < 1 dan stok 0"},
  "penyebab_kondisi": {"sakit": "Sakit/penyakit", "wabah": "Wabah (khusus penduduk_sakit)", "tua": "Usia tua", "kelaparan": "Kelaparan", "dingin": "Dingin", "serangan": "Serangan hewan"},
  "hewan": {"serigala": "serigala", "babi_hutan": "babi hutan", "kerbau_liar": "kerbau liar"},
  "bangunan_pertahanan": {"pagar": "Pagar", "obor": "Obor", "menara_jaga": "Menara jaga", "makam": "Makam",
                          "_catatan": "Sengaja tidak ditambahkan ke meta.bangunan agar {bangunan} acak di log tidak memilih Makam."}
 },
 "tambah_key": {
  "musim_pembuka": musim_pembuka, "peringatan_dini": peringatan_dini, "jenjang_kelaparan": jenjang_kelaparan,
  "event_musiman": event_musiman, "log_ancaman": log_ancaman, "penduduk_sakit": penduduk_sakit,
  "penduduk_meninggal": penduduk_meninggal, "pemakaman": pemakaman, "duka": duka, "penduduk_pergi": penduduk_pergi,
  "bangunan_ancaman": bangunan_ancaman, "prioritas_darurat": prioritas_darurat}
}

def terapkan_patch(data, patch):
    """Aditif: gagal jika key/entri baru sudah ada dengan nilai berbeda. Entri lama tidak pernah ditimpa."""
    m = data["meta"]
    if m["versi"] != patch["_patch"]["versi_dari"]:
        raise SystemExit(f"versi {m['versi']} != {patch['_patch']['versi_dari']}")
    for sec, ent in patch["tambah_entri_meta"].items():
        for k, v in ent.items():
            if k in m[sec] and m[sec][k] != v: raise SystemExit(f"meta.{sec}.{k} sudah ada")
            m[sec].setdefault(k, v)
    for k, v in patch["tambah_key_meta"].items():
        if k in m and m[k] != v: raise SystemExit(f"meta.{k} sudah ada")
        m.setdefault(k, v)
    for k, v in patch["tambah_key"].items():
        if k in data and data[k] != v: raise SystemExit(f"key {k} sudah ada")
        data.setdefault(k, v)
    m.update(patch["set_meta"])
    return data


# =====================================================================
# v1.3.0 — JADWAL HARIAN & REPRODUKSI (hanya penambahan). Belum ada spec di docs/:
# struktur dirancang Asisten Dokumen (meta.status_jadwal_keluarga = "struktur_usulan").
# Nada: hangat & sopan; pacaran/menikah/hamil tanpa konten dewasa.
# =====================================================================
log_jadwal = {
 "pulang": [
  "Hari {hari}: Matahari mulai turun. {nama} membereskan pekerjaannya dan pulang ke rumah.",
  "Hari {hari}: {nama} berjalan pulang sambil bersenandung, membawa sisa kayu untuk tungku rumah.",
  "Hari {hari}: Lampu-lampu rumah mulai menyala. {nama} melambai pada {nama2} lalu pulang.",
  "Hari {hari}: Senja yang jingga. {nama} pulang dengan langkah pelan, capek tapi senang."],
 "tidur": [
  "Hari {hari}: {nama} meringkuk di bawah selimut dan langsung terlelap.",
  "Hari {hari}: {nama} mendengkur pelan. Hari ini memang melelahkan.",
  "Hari {hari}: {nama} tertidur sambil memeluk bantal kesayangannya.",
  "Hari {hari}: Desa sunyi. Hanya suara jangkrik dan dengkuran {nama} yang terdengar."],
 "bangun_pagi": [
  "Hari {hari}: Ayam berkokok. {nama} bangun, meregangkan badan, dan menghirup udara pagi.",
  "Hari {hari}: {nama} bangun paling pagi dan menyalakan api unggun untuk semua orang.",
  "Hari {hari}: {nama} bangun dengan rambut berantakan, tapi senyumnya cerah.",
  "Hari {hari}: Embun masih menempel di daun saat {nama} keluar rumah untuk bekerja."],
 "berpasangan": {
  "_catatan": "Varian untuk penduduk yang punya pasangan; pakai bersama kategori di atas.",
  "pulang": ["Hari {hari}: {nama} pulang lebih awal untuk menemani {pasangan} makan malam.",
             "Hari {hari}: {pasangan} menunggu {nama} di depan pintu dengan teh hangat."],
  "tidur": ["Hari {hari}: {nama} dan {pasangan} bercerita sebentar sebelum tidur, lalu lampu dipadamkan.",
            "Hari {hari}: {nama} menyelimuti {pasangan} yang sudah tertidur lebih dulu."],
  "bangun_pagi": ["Hari {hari}: {nama} sarapan sebentar bersama {pasangan}, lalu berangkat bekerja.",
                  "Hari {hari}: {pasangan} membangunkan {nama} dengan bau nasi hangat dari tungku."]
 },
 "tidur_di_luar": [
  "Hari {hari}: Tidak ada tempat di rumah untuk {nama}. Ia tidur beralas daun di dekat api unggun.",
  "Hari {hari}: {nama} tidur di bawah pohon besar malam ini. Semoga segera ada Gubuk baru.",
  "Hari {hari}: {nama} menatap bintang dari tempat tidurnya di rumput. Indah, tapi punggungnya pegal.",
  "Hari {hari}: {nama} belum punya rumah. Ia tidur meringkuk di samping Gudang."],
 "tidur_di_luar_dingin": [
  "Hari {hari}: {nama} tidur di luar dan menggigil sepanjang malam. Ia sangat butuh rumah.",
  "Hari {hari}: Angin malam menusuk. {nama} yang tidur di luar bangun dengan hidung merah dan suasana hati buruk.",
  "Hari {hari}: {nama} tidak bisa tidur karena kedinginan di luar. Bangun Gubuk agar ia bisa beristirahat hangat."],
 "tidak_bisa_tidur": [
  "Hari {hari}: {nama} sulit tidur karena memikirkan stok makanan. Ia duduk sebentar di dekat api.",
  "Hari {hari}: {nama} terbangun tengah malam karena perutnya keroncongan."]
}

log_hubungan = {
 "menjadi_dekat": [
  "Hari {hari}: {nama} dan {pasangan} sering terlihat bekerja berdampingan. Mereka mulai akrab.",
  "Hari {hari}: {nama} menyisihkan buah paling manis untuk {pasangan}. Penduduk lain saling melirik sambil tersenyum.",
  "Hari {hari}: {nama} dan {pasangan} duduk bersebelahan di dekat api unggun, tertawa pelan berdua.",
  "Hari {hari}: {pasangan} membantu {nama} mengangkat kayu tanpa diminta. Sepertinya ada yang sedang tersipu."],
 "menjadi_pasangan": [
  "Hari {hari}: {nama} dan {pasangan} kini resmi berpasangan. Desa ikut senang melihat mereka.",
  "Hari {hari}: Di tepi sungai, {nama} memberikan seikat bunga liar kepada {pasangan}. Jawabannya: senyum malu-malu dan anggukan.",
  "Hari {hari}: {nama} dan {pasangan} saling berjanji untuk saling menjaga. Anak-anak desa bersorak menggoda."],
 "lamaran": [
  "Hari {hari}: {nama} datang ke keluarga {pasangan} membawa hantaran sederhana. Lamarannya diterima dengan hangat!",
  "Hari {hari}: Dengan suara bergetar, {nama} bertanya apakah {pasangan} mau menikah dengannya. Jawabannya \"ya\"!"],
 "menikah": [
  "Hari {hari}: {nama} dan {pasangan} menikah dalam upacara kecil di dekat api unggun. Seluruh desa datang membawa makanan dan doa.",
  "Hari {hari}: Pesta pernikahan sederhana untuk {nama} dan {pasangan}. Ada musik, tarian, dan nasi tumpeng kecil buatan Dapur.",
  "Hari {hari}: Di bawah lengkung janur, {nama} dan {pasangan} resmi menjadi suami istri. Para tetua memberi restu sambil tersenyum haru.",
  "Hari {hari}: {nama} dan {pasangan} menikah di Balai desa. Malam itu desa bernyanyi sampai bintang bermunculan."],
 "menikah_rumah_baru": [
  "Hari {hari}: {nama} dan {pasangan} pindah ke rumah yang sama. Mereka menggantung tirai baru di jendela.",
  "Hari {hari}: Pengantin baru {nama} dan {pasangan} menanam pohon kecil di depan rumah mereka."],
 "butuh_rumah": [
  "{nama} dan {pasangan} ingin tinggal bersama, tapi belum ada rumah kosong. Bangun Gubuk baru untuk mereka.",
  "Pasangan {nama} dan {pasangan} masih menunggu rumah sendiri. Mereka sabar, tapi berharap tidak terlalu lama."]
}

kehamilan = {
 "kabar": [
  "Hari {hari}: Kabar bahagia! {ibu} dan {ayah} sedang menanti buah hati pertama mereka.",
  "Hari {hari}: {ibu} berbisik pada {ayah}, lalu {ayah} melompat kegirangan. Keluarga kecil mereka akan bertambah!",
  "Hari {hari}: Seluruh desa bersuka cita. {ibu} sedang mengandung, dan {ayah} sudah mulai membuat ayunan kayu."],
 "masa_kehamilan": [
  "Hari {hari}: {ibu} mengidam mangga muda. {ayah} mencarinya sampai ke ujung hutan.",
  "Hari {hari}: Para ibu di desa bergantian membawakan sup hangat untuk {ibu}.",
  "Hari {hari}: {ayah} menyelesaikan ayunan bayi dari kayu. Ukirannya berbentuk bintang kecil.",
  "Hari {hari}: {ibu} menyenandungkan lagu pengantar tidur sambil merajut baju mungil.",
  "Hari {hari}: {ibu} bekerja lebih santai sekarang. Teman-teman dengan senang hati menggantikan tugas beratnya.",
  "Hari {hari}: {ayah} dan {ibu} duduk di depan rumah, berdebat lucu soal nama untuk si kecil."],
 "menjelang_lahir": [
  "Hari {hari}: Sebentar lagi si kecil akan lahir. {ibu} beristirahat di rumah, ditemani {ayah}.",
  "Hari {hari}: Kain-kain bersih dan air hangat sudah disiapkan. Desa menunggu dengan berdebar."],
 "status_panel": "Sedang menanti buah hati"
}

kelahiran = {
 "log": [
  "Hari {hari}: Tangisan kecil terdengar dari rumah {ibu} dan {ayah}. Selamat datang ke dunia, {bayi}!",
  "Hari {hari}: {bayi} lahir saat fajar. {ibu} tersenyum lelah, dan {ayah} tidak berhenti menangis bahagia.",
  "Hari {hari}: Seorang bayi mungil bernama {bayi} lahir hari ini. Seluruh desa datang mengintip dari jendela.",
  "Hari {hari}: {bayi} lahir sehat dan montok. {ayah} langsung mengangkatnya tinggi-tinggi agar semua bisa melihat.",
  "Hari {hari}: Desa bertambah satu penduduk paling kecil: {bayi}, anak {ibu} dan {ayah}. Selamat datang, si kecil!"],
 "notifikasi": {"judul": "Bayi Lahir!", "teks": "{bayi} lahir dari keluarga {ibu} dan {ayah}. Desa bertambah satu senyum mungil.", "tombol": "Selamat datang!"},
 "syukuran": [
  "Hari {hari}: Desa mengadakan syukuran kecil untuk {bayi}. Ada bubur merah putih dan doa bersama.",
  "Hari {hari}: Setiap keluarga membawa hadiah kecil untuk {bayi}: selimut rajut, mainan kayu, dan sekeranjang buah."],
 "nama_bayi": {
  "laki_laki": ["Arya","Bima","Damar","Galih","Gilang","Raka","Satria","Danu","Fajar","Ilham","Rizky","Bagas","Dimas","Rafi",
                "Fikri","Haikal","Panji","Wira","Yoga","Arjuna","Bintang","Aditya","Guntur","Restu","Aldi","Farhan","Naufal",
                "Ikhsan","Tegar","Banyu","Elang","Samudra","Rangga","Tama"],
  "perempuan": ["Anisa","Bunga","Citra","Dinda","Embun","Fitri","Gita","Indah","Kirana","Laras","Melati","Nadia","Puspa","Putri",
                "Ratna","Salsa","Tiara","Vina","Yasmin","Zahra","Intan","Kemuning","Mawar","Lintang","Nayla","Aulia","Cahya",
                "Dara","Kinanti","Rania","Sekar","Wening","Asih","Rinjani","Senja"]
 }
}

tumbuh_kembang = {
 "milestone": {
  "senyum_pertama": ["Hari {hari}: {nama} tersenyum untuk pertama kalinya. {ibu} memanggil semua orang untuk melihat."],
  "langkah_pertama": ["Hari {hari}: {nama} melangkah pertama kali, lalu jatuh terduduk dan tertawa. {ayah} bertepuk tangan paling keras.",
                      "Hari {hari}: {nama} berjalan tertatih mengejar ayam. Ayamnya menang, tapi {nama} tidak menyerah."],
  "kata_pertama": ["Hari {hari}: Kata pertama {nama} adalah \"api\"! Sepertinya ia sering diajak duduk di dekat api unggun.",
                   "Hari {hari}: {nama} memanggil \"Ibu!\" untuk pertama kalinya. {ibu} langsung memeluknya erat."],
  "bermain": ["Hari {hari}: {nama} bermain petak umpet di antara tumpukan kayu bersama anak-anak lain.",
              "Hari {hari}: {nama} membuat istana dari lumpur di tepi sungai. Megah sekali, sampai hujan datang."],
  "mulai_membantu": ["Hari {hari}: {nama} mulai membantu memetik buah. Keranjangnya kecil, tapi semangatnya besar.",
                     "Hari {hari}: {nama} ikut {ayah} ke ladang dan menanam benih pertamanya sendiri."],
  "belajar_keahlian": ["Hari {hari}: {nama} belajar {skill} dari {nama2}. Tangannya masih kaku, tapi matanya berbinar.",
                       "Hari {hari}: {nama} berhasil {skill} tanpa bantuan untuk pertama kali. Ia pamer ke seluruh desa."]
 },
 "menjadi_anak": ["Hari {hari}: {nama} bukan bayi lagi. Kini ia sudah berlarian ke mana-mana dan banyak bertanya \"kenapa?\"."],
 "menjadi_remaja": ["Hari {hari}: {nama} kini remaja. Ia mulai ingin membantu pekerjaan desa seperti orang dewasa.",
                    "Hari {hari}: {nama} tumbuh tinggi sekali, hampir setinggi {ayah}. Suaranya pun mulai berubah."],
 "menjadi_dewasa": ["Hari {hari}: {nama} kini dewasa dan siap bekerja penuh untuk desa. {ibu} dan {ayah} sangat bangga.",
                    "Hari {hari}: Desa mengadakan syukuran kecil karena {nama} telah dewasa. Ia memilih menekuni {skill}.",
                    "Hari {hari}: {nama} yang dulu bayi mungil kini sudah dewasa. Waktu berjalan begitu cepat."],
 "menjadi_lansia": ["Hari {hari}: {nama} kini berusia {umur} tahun dan menjadi sesepuh desa. Ia lebih banyak bekerja santai dan berbagi cerita.",
                    "Hari {hari}: Rambut {nama} mulai memutih. Anak-anak suka duduk di dekatnya untuk mendengar dongeng.",
                    "Hari {hari}: {nama} menjadi tetua desa. Nasihatnya kini sering ditanyakan saat ada masalah."],
 "ulang_tahun_anak": ["Hari {hari}: {nama} berulang tahun ke-{umur}! {ibu} membuat kue kecil dari madu dan gandum."]
}

# Meninggal karena usia tua: struktur mengikuti penduduk_meninggal/pemakaman/duka v1.2, sebagai bagian baru
# (entri v1.2 tidak diubah). {nama} = lansia yang berpulang; {pasangan}/{anak} opsional sesuai varian.
lansia_berpulang = {
 "meninggal": [
  "Hari {hari}: {nama} berpulang dengan tenang di usia {umur} tahun, setelah sore yang hangat di depan rumahnya.",
  "Hari {hari}: Di usia {umur}, {nama} tertidur untuk terakhir kalinya, ditemani cucu-cucu yang memegang tangannya.",
  "Hari {hari}: {nama} menutup mata dengan senyum kecil. Hidupnya panjang, penuh tawa, kerja keras, dan cerita.",
  "Hari {hari}: Sesepuh desa, {nama}, berpulang hari ini. Pagi tadi ia masih sempat menyiram tanamannya."],
 "meninggal_berpasangan": [
  "Hari {hari}: {nama} berpulang di usia {umur} tahun. {pasangan} duduk lama di sampingnya, menggenggam tangannya untuk terakhir kali.",
  "Hari {hari}: {nama} pergi dengan damai setelah bertahun-tahun hidup bersama {pasangan}. \"Terima kasih untuk semuanya,\" bisiknya."],
 "notifikasi": {"judul": "Selamat Jalan, Sesepuh {nama}", "teks": "{nama} berpulang di usia {umur} tahun setelah hidup panjang yang penuh kebaikan.", "tombol": "Kenang bersama"},
 "kenangan": [
  "{nama} ({umur} tahun). Sesepuh desa yang selalu punya cerita untuk anak-anak.",
  "{nama}, yang mengajari separuh desa cara {skill}. Hidup {lama_tinggal} hari di desa ini.",
  "{nama} ({umur}). Nasihatnya akan terus terdengar di dekat api unggun."],
 "pemakaman": {
  "upacara": [
   "Hari {hari}: Seluruh desa berkumpul mengantar {nama}. Para cucu meletakkan bunga, dan para tetua bergantian bercerita.",
   "Hari {hari}: Pemakaman {nama} terasa seperti syukuran. Semua orang mengenang masa mudanya yang konon sangat jahil.",
   "Hari {hari}: Lagu kesukaan {nama} dinyanyikan bersama. Bahkan {pasangan} ikut tersenyum di sela air matanya."],
  "warisan": [
   "{nama} meninggalkan buku catatan kecil berisi resep, petuah, dan gambar-gambar lucu. Kini disimpan di Balai desa.",
   "Tongkat kayu {nama} digantung di dekat api unggun. Siapa pun yang lewat menyentuhnya untuk memberi salam.",
   "Pohon yang ditanam {nama} saat muda kini besar dan rindang. Anak-anak bermain di bawahnya setiap sore.",
   "Dongeng-dongeng {nama} kini diceritakan ulang oleh para orang tua kepada anak-anak mereka."],
  "nisan": [
   "Di sini beristirahat {nama}, sesepuh desa ({umur} tahun). Terima kasih telah menjaga kami.",
   "{nama}, {umur} tahun. Hidup panjang, hati lapang, tawa yang tak terlupakan."]
 },
 "duka": {
  "duka_mulai": ["Desa berduka atas kepergian sesepuh {nama}. Tetapi semua sepakat: hidupnya adalah hidup yang indah.",
                 "Hari ini desa lebih sunyi tanpa cerita {nama}. Anak-anak duduk diam di tempat ia biasa mendongeng."],
  "duka_harian": ["Hari {hari}: Kursi goyang {nama} masih di depan rumah. Tak ada yang tega memindahkannya.",
                  "Hari {hari}: {pasangan} memasak resep kesukaan {nama} dan membaginya ke tetangga.",
                  "Hari {hari}: Anak-anak menceritakan ulang dongeng {nama}, lengkap dengan bagian lucunya.",
                  "Hari {hari}: Penduduk menanam bunga di Makam {nama}. Rasanya seperti menyiram kenangan.",
                  "Hari {hari}: Desa kembali bekerja dengan semangat. {nama} pasti ingin semua tetap rajin dan rukun."],
  "duka_berakhir": ["Masa berkabung untuk {nama} usai. Petuah-petuahnya tetap tinggal di hati seluruh desa.",
                    "Desa melepas {nama} dengan lapang. Setiap kali ada yang bercerita di dekat api, rasanya ia ikut mendengarkan."],
  "tooltip": "Desa berduka untuk sesepuhnya. Kesedihan karena usia tua terasa lebih lembut, dan kenangan membantu desa pulih."
 }
}

# Label panel penduduk (keluarga & usia)
panel_keluarga = {
 "judul": "Keluarga",
 "label": {"pasangan": "Pasangan", "orang_tua": "Orang tua", "ayah": "Ayah", "ibu": "Ibu", "anak": "Anak",
           "umur": "Umur", "tahap_usia": "Tahap usia", "status_hubungan": "Status"},
 "format": {"umur": "{umur} tahun", "orang_tua": "{ayah} & {ibu}", "anak_jumlah": "{jumlah} anak", "pasangan_berduka": "{pasangan} (telah berpulang)"},
 "kosong": {"pasangan": "Belum ada", "orang_tua": "Belum ada", "ayah": "Belum ada", "ibu": "Belum ada", "anak": "Belum ada"},
 "kosong_pendiri": "Pendatang pertama desa",
 "tahap_usia": {"bayi": "Bayi", "anak": "Anak", "remaja": "Remaja", "dewasa": "Dewasa", "lansia": "Lansia"},
 "status_hubungan": {"lajang": "Lajang", "dekat": "Sedang dekat dengan {pasangan}", "berpasangan": "Berpasangan dengan {pasangan}",
                     "menikah": "Menikah dengan {pasangan}", "ditinggal": "Ditinggal pasangan", "menanti_bayi": "Menanti buah hati"},
 "tooltip": {"bayi": "Bayi belum bisa bekerja dan butuh orang tua di dekatnya.",
             "anak": "Anak-anak bermain dan sesekali membantu pekerjaan ringan.",
             "remaja": "Remaja mulai belajar keahlian dari orang dewasa.",
             "dewasa": "Penduduk dewasa bekerja penuh untuk desa.",
             "lansia": "Lansia bekerja lebih santai, tapi nasihatnya membuat desa lebih tenang."}
}

PATCH_V130 = {
 "_patch": {"versi_dari": "1.2.0", "versi_ke": "1.3.0", "sumber": "Belum ada spec jadwal/reproduksi di docs/ (cek 17 Okt 2026); struktur usulan Asisten Dokumen",
            "catatan": "Patch aditif seperti v1.2.0. Diterapkan oleh buat_teks.py atau tools/merge_v130.py."},
 "set_meta": {"versi": "1.3.0"},
 "tambah_entri_meta": {
  "placeholder": {
   "{pasangan}": "Nama pasangan penduduk {nama}",
   "{bayi}": "Nama bayi yang baru lahir (lihat kelahiran.nama_bayi)",
   "{ayah}": "Nama ayah (orang tua laki-laki)",
   "{ibu}": "Nama ibu (orang tua perempuan)"},
  "struktur_tambahan": {
   "log_jadwal": "Dict kategori -> log (\"Hari {hari}:\"): pulang, tidur, bangun_pagi, berpasangan{pulang,tidur,bangun_pagi}, tidur_di_luar, tidur_di_luar_dingin, tidak_bisa_tidur",
   "log_hubungan": "menjadi_dekat, menjadi_pasangan, lamaran, menikah, menikah_rumah_baru, butuh_rumah (tanpa prefix hari: banner/peringatan)",
   "kehamilan": "kabar[], masa_kehamilan[], menjelang_lahir[], status_panel",
   "kelahiran": "log[], notifikasi{judul,teks,tombol}, syukuran[], nama_bayi{laki_laki[], perempuan[]} (tidak bentrok dengan penduduk/CONFIG.NAMES/pedagang)",
   "tumbuh_kembang": "milestone{id: []}, menjadi_anak[], menjadi_remaja[], menjadi_dewasa[], menjadi_lansia[], ulang_tahun_anak[]",
   "lansia_berpulang": "meninggal[], meninggal_berpasangan[], notifikasi, kenangan[], pemakaman{upacara,warisan,nisan}, duka{duka_mulai,duka_harian(5),duka_berakhir,tooltip}",
   "panel_keluarga": "Label panel penduduk: label{}, format{}, kosong{}, kosong_pendiri, tahap_usia{}, status_hubungan{}, tooltip{}"}
 },
 "tambah_key_meta": {
  "status_jadwal_keluarga": "struktur_usulan",
  "catatan_placeholder_keluarga": "{nama}, {pasangan}, {bayi}, {ayah}, {ibu}, dan {umur} untuk teks jadwal/keluarga WAJIB diisi lewat argumen extra fill(tpl, {nama, pasangan, bayi, ayah, ibu, umur}). Bawaan fill() memilih penduduk acak untuk {nama} dan umur penduduk acak untuk {umur}, jadi tidak boleh diandalkan. Varian ber-{pasangan} hanya dipakai jika penduduk punya pasangan. {nama} pada tumbuh_kembang = si anak.",
  "tahap_usia": {"bayi": "Bayi", "anak": "Anak", "remaja": "Remaja", "dewasa": "Dewasa", "lansia": "Lansia"},
  "status_hubungan": {"lajang": "Lajang", "dekat": "Sedang dekat", "berpasangan": "Berpasangan", "menikah": "Menikah", "ditinggal": "Ditinggal pasangan", "menanti_bayi": "Menanti buah hati"},
  "milestone_anak": {"senyum_pertama": "Senyum pertama (bayi)", "langkah_pertama": "Langkah pertama (bayi)", "kata_pertama": "Kata pertama (bayi)",
                     "bermain": "Bermain (anak)", "mulai_membantu": "Mulai membantu (anak)", "belajar_keahlian": "Belajar keahlian (remaja)"}
 },
 "tambah_key": {"log_jadwal": log_jadwal, "log_hubungan": log_hubungan, "kehamilan": kehamilan, "kelahiran": kelahiran,
                "tumbuh_kembang": tumbuh_kembang, "lansia_berpulang": lansia_berpulang, "panel_keluarga": panel_keluarga}
}


# =====================================================================
# v1.4.0 — LOKALISASI NUANSA INDONESIA. Spec: docs/RISET-INDONESIA.md (§4 pemetaan event, §6 teks).
# Berbeda dari v1.1–v1.3: v1.4 MENGUBAH teks tampilan lama (id/key/angka tetap) lewat UBAH_V140
# (path -> teks baru; "@id" memilih item list berdasarkan id), lalu menambah bagian baru lewat PATCH_V140.
# Sumber teks lama di atas sengaja dibiarkan sebagai riwayat; teks yang tampil = hasil UBAH_V140.
# Transisi musim (kode masih 4 slot lama): semi=Musim Hujan, panas=Pancaroba, gugur=Musim Panen (Mareng),
# dingin=Musim Kemarau. Id musim final (spec): hujan, mareng, kemarau, labuh (lihat meta.alias_id_v140).
# =====================================================================
UBAH_V140 = {
 # ---- meta (label tampilan) ----
 "meta/sumber_daya/gandum": "Padi",
 "meta/bangunan/gubuk": "Gubuk bambu",
 "meta/bangunan/ladang": "Ladang (tegalan)",
 "meta/bangunan/lumbung": "Lumbung padi",
 "meta/bangunan/balai_desa": "Balai desa (pendopo)",
 "meta/musim/@semi/nama": "hujan",
 "meta/musim/@semi/pesan": "Hujan mulai rajin turun. Saatnya menanam padi di sawah!",
 "meta/musim/@panas/nama": "pancaroba",
 "meta/musim/@panas/pesan": "Hujan makin jarang dan siang terasa terik. Jaga stok air dan awasi api.",
 "meta/musim/@gugur/nama": "panen (mareng)",
 "meta/musim/@gugur/pesan": "Padi menguning. Waktunya panen dan menyimpan bekal untuk kemarau.",
 "meta/musim/@dingin/nama": "kemarau",
 "meta/musim/@dingin/pesan": "Sawah mulai kering dan air menyusut. Semoga lumbung padi cukup penuh.",
 "meta/kunci_efek/harga_jual_pangan": "Perubahan harga jual makanan & padi di pasar (persen) selama 5 hari",
 "meta/kunci_efek/harga_beli_pangan": "Perubahan harga beli makanan & padi di pasar (persen) selama 5 hari",
 "meta/tipe_tujuan_quest/simpan_pangan": "Miliki stok makanan + padi (id gandum) gabungan minimal jumlah pada satu waktu, target \"pangan\"",
 "meta/target_khusus/pangan": "Makanan + padi/gabah (id gandum; tipe simpan_pangan)",
 "meta/struktur_tambahan/penduduk_meninggal": "notifikasi{judul,tombol}, per_penyebab{sakit|tua|kelaparan|cuaca(id lama: dingin)|serangan: []}, kenangan_panel[] (1 baris)",
 "meta/struktur_tambahan/log_jadwal": "Dict kategori -> log (\"Hari {hari}:\"): pulang, tidur, bangun_pagi, berpasangan{pulang,tidur,bangun_pagi}, tidur_di_luar, tidur_di_luar_dingin (= tidur di luar saat hujan), tidak_bisa_tidur",
 "meta/penyebab_kondisi/dingin": "Cuaca buruk (kehujanan / panas terik)",
 "meta/hewan/serigala": "babi hutan",
 # ---- log_harian ----
 "log_harian/kerja/7": "Hari {hari}: {nama} menanam bibit padi di sawah dengan hati-hati, kakinya terbenam lumpur.",
 "log_harian/kerja/8": "Hari {hari}: {nama} menumbuk padi lalu menanak {jumlah} porsi nasi hangat di Dapur.",
 "log_harian/cuaca/5": "Hari {hari}: Kemarau terasa terik sekali. Penduduk beristirahat di bawah pohon rindang saat tengah hari.",
 # ---- event_acak (id tetap; lihat alias) ----
 "event_acak/@badai/judul": "Angin Kencang Datang!",
 "event_acak/@badai/deskripsi": "Langit mendadak gelap dan angin menderu kencang. Puting beliung kecil terlihat di kejauhan. Apa yang harus dilakukan penduduk?",
 "event_acak/@badai/pilihan/1/teks": "Ikat atap dengan bambu dan kayu",
 "event_acak/@badai/pilihan/1/teks_hasil": "Atap diikat kencang tepat waktu. Angin lewat tanpa merobohkan satu bangunan pun.",
 "event_acak/@badai/pilihan/2/teks_hasil": "Beberapa dahan tumbang bisa dijadikan kayu, tapi atap rumbia beterbangan dan penduduk basah kuyup.",
 "event_acak/@pedagang_keliling/deskripsi": "Seorang pedagang berpikul tiba di desa sambil membunyikan kentongan kecil. \"Barang bagus, harga bersahabat!\" katanya.",
 "event_acak/@pedagang_keliling/pilihan/2/teks": "Suguhkan kopi tubruk dan pisang goreng",
 "event_acak/@hewan_buas/deskripsi": "Seekor babi hutan besar menerobos semak dan mendekati sawah! Penduduk panik.",
 "event_acak/@hewan_buas/pilihan/0/teks_hasil": "Dengan teriakan, kentongan, dan obor, babi hutan berhasil dihalau. Desa bahkan mendapat daging dan kulit.",
 "event_acak/@hewan_buas/pilihan/1/teks": "Pasang pagar bambu darurat",
 "event_acak/@hewan_buas/pilihan/1/teks_hasil": "Pagar bambu berdiri tepat waktu. Babi hutan mendengus lalu pergi.",
 "event_acak/@hewan_buas/pilihan/2/teks_hasil": "Babi hutan berpesta di sawah dan tegalan. Panen kali ini berkurang.",
 "event_acak/@serigala_malam/judul": "Jejak Kucing Besar",
 "event_acak/@serigala_malam/deskripsi": "Ada jejak kaki kucing besar di tepi hutan. Kata para tetua, itu macan tutul jawa yang sedang lewat. Penduduk tidak bisa tidur dengan tenang.",
 "event_acak/@serigala_malam/pilihan/0/teks": "Nyalakan obor dan api unggun lebih besar",
 "event_acak/@serigala_malam/pilihan/0/teks_hasil": "Cahaya api membuat sang macan menjauh ke dalam hutan. Malam pun berlalu dengan damai.",
 "event_acak/@serigala_malam/pilihan/1/teks": "Ronda bergantian sambil membawa kentongan",
 "event_acak/@serigala_malam/pilihan/1/teks_hasil": "Bunyi kentongan terdengar sepanjang malam. Para peronda mengantuk esok harinya, tapi semua merasa aman.",
 "event_acak/@panen_raya/deskripsi": "Sawah menguning dan buah bergelantungan di mana-mana. Ini panen terbaik tahun ini!",
 "event_acak/@panen_raya/pilihan/0/teks": "Simpan semua di Lumbung padi",
 "event_acak/@panen_raya/pilihan/0/teks_hasil": "Lumbung padi penuh sesak. Kemarau tidak lagi menakutkan.",
 "event_acak/@panen_raya/pilihan/1/teks": "Adakan kenduri panen",
 "event_acak/@panen_raya/pilihan/1/teks_hasil": "Tumpeng kecil dibagikan, penduduk menari dan bernyanyi semalaman. Ini malam yang akan dikenang lama.",
 "event_acak/@wabah/judul": "Diare di Musim Hujan",
 "event_acak/@wabah/deskripsi": "Beberapa penduduk sakit perut dan bolak-balik ke jamban. Sepertinya ada yang minum air sungai tanpa direbus.",
 "event_acak/@wabah/pilihan/0/teks": "Rawat dengan oralit, air matang, dan daun jambu",
 "event_acak/@wabah/pilihan/0/teks_hasil": "Penduduk minum air matang dan oralit buatan sendiri. Satu per satu mulai pulih. Mulai sekarang, air minum selalu direbus!",
 "event_acak/@wabah/pilihan/1/teks_hasil": "Pekerjaan berhenti beberapa hari, tapi sakit perut tidak menular lebih luas.",
 "event_acak/@wabah/pilihan/2/teks_hasil": "Penyakit makin menyebar. Desa terasa sepi dan lesu. Ingat: cuci tangan dan rebus air minum.",
 "event_acak/@kekeringan/deskripsi": "Kemarau datang lebih awal. Sudah lama hujan tidak turun dan permukaan sungai turun drastis.",
 "event_acak/@anak_hilang/pilihan/0/teks_hasil": "{nama} ditemukan sedang memeluk seekor anak kambing yang tersesat. Semua lega dan tertawa.",
 "event_acak/@anak_hilang/pilihan/1/teks_hasil": "Menjelang tengah malam, {nama} pulang sendiri sambil membawa segenggam buah salak.",
 "event_acak/@musim_dingin_keras/judul": "Kemarau Panjang",
 "event_acak/@musim_dingin_keras/deskripsi": "Hujan tak kunjung datang, padahal kemarau seharusnya sudah usai. Sawah retak-retak dan udara terasa terik.",
 "event_acak/@musim_dingin_keras/pilihan/0/teks": "Bagikan caping dan kendi kulit",
 "event_acak/@musim_dingin_keras/pilihan/0/teks_hasil": "Penduduk tetap segar bekerja di bawah caping, dengan kendi air selalu di dekatnya.",
 "event_acak/@musim_dingin_keras/pilihan/1/teks": "Kumpulkan semua di bawah pendopo dan nyalakan tungku",
 "event_acak/@musim_dingin_keras/pilihan/1/teks_hasil": "Siang terik dilalui bersama di tempat teduh, dengan wedang dan cerita sampai sore.",
 "event_acak/@festival_desa/judul": "Bersih Desa",
 "event_acak/@festival_desa/deskripsi": "Hari ini tepat satu tahun desa berdiri. Penduduk ingin mengadakan bersih desa dan sedekah bumi.",
 "event_acak/@festival_desa/pilihan/0/teks": "Gelar sedekah bumi yang meriah",
 "event_acak/@festival_desa/pilihan/0/teks_hasil": "Desa penuh janur, gamelan, dan tumpeng lezat. Semua orang bahagia.",
 "event_acak/@festival_desa/pilihan/1/teks": "Kenduri sederhana",
 "event_acak/@festival_desa/pilihan/1/teks_hasil": "Doa dan makan bersama di pendopo yang sederhana, tapi terasa sangat bermakna.",
 # ---- tutorial & quest ----
 "tutorial/4/teks": "Angin kencang, babi hutan, atau tamu bisa datang kapan saja. Pilih responsmu dengan bijak, dan jangan lupa siapkan stok makanan sebelum kemarau.",
 "quest_awal/@q07_ladang_pertama/deskripsi": "Bangun Ladang dan panen padi pertama desa.",
 "quest_awal/@q07_ladang_pertama/teks_selesai": "Bulir padi pertama berayun ditiup angin. Masa depan desa terlihat cerah.",
 "quest_awal/@q09_siap_dingin/judul": "Siap Hadapi Kemarau",
 "quest_awal/@q09_siap_dingin/deskripsi": "Bangun Lumbung padi dan isi dengan stok makanan sebelum kemarau tiba.",
 "quest_awal/@q09_siap_dingin/teks_selesai": "Lumbung penuh. Saat sawah mengering nanti, tak seorang pun akan kelaparan.",
 "menu/slogan_acak/2": "Ada bau nasi hangat dan kopi dari arah dapur...",
 "pengaturan/opsi/tampilan/sub/efek_cuaca/deskripsi": "Hujan, debu kemarau, dan kilau kecil. Matikan jika peramban terasa berat.",
}

UBAH_V140.update({
 # ---- teknologi (nama baru sesuai spec §2; id & efek tetap) ----
 "teknologi/@T04/nama": "Irigasi Sawah",
 "teknologi/@T04/deskripsi": "Saluran air bergilir dari sumur dan sungai ke petak-petak sawah, seperti subak.",
 "teknologi/@T04/teks_terbuka": "Air sumur dan sawah letaknya berdekatan. Bagaimana kalau dibuat saluran yang dibagi adil untuk semua petak?",
 "teknologi/@T04/teks_selesai": "{nama} menyelesaikan riset Irigasi Sawah. Air mengalir pelan di antara pematang, dan bibit padi tampak berseri.",
 "teknologi/@T05/nama": "Gaplek & Ikan Asin",
 "teknologi/@T05/deskripsi": "Menjemur singkong menjadi gaplek dan mengasinkan ikan supaya tahan lama.",
 "teknologi/@T05/efek_ringkas": "Makanan lebih awet, dan penduduk tidak cepat lapar saat kemarau.",
 "teknologi/@T05/teks_terbuka": "Ada singkong yang lupa dijemur dan ternyata awet berminggu-minggu. Menarik sekali!",
 "teknologi/@T05/teks_selesai": "{nama} menyelesaikan riset Gaplek & Ikan Asin. Gaplek dan ikan asin tersusun rapi menunggu kemarau.",
 "teknologi/@T08/teks_terbuka": "Lumbung mulai sesak. Ikatan padi bertumpuk sampai ke pintu.",
 "teknologi/@T09/teks_terbuka": "{nama} menyimpan segenggam gabah paling bernas. \"Yang ini jangan ditumbuk dulu!\"",
 "teknologi/@T09/teks_selesai": "{nama} menyelesaikan riset Bibit Unggul. Bulir padi kini lebih bernas dan lebih berkilau.",
 "teknologi/@T10/nama": "Tanggul & Parit",
 "teknologi/@T10/deskripsi": "Tanggul tanah berlapis batu dan parit yang menyalurkan air bersih ke seluruh desa.",
 "teknologi/@T10/teks_selesai": "{nama} menyelesaikan riset Tanggul & Parit. Gemericik air kini terdengar di setiap sudut desa, dan banjir cepat surut.",
 "teknologi/@T11/teks_terbuka": "{nama} melihat batang kelapa bundar menggelinding di bukit, lalu tersenyum lebar.",
 "teknologi/@T13/nama": "Caping & Kendi",
 "teknologi/@T13/deskripsi": "Menganyam caping bambu dan membuat kendi kulit agar penduduk kuat bekerja di bawah terik kemarau.",
 "teknologi/@T13/efek_ringkas": "Penduduk tidak cepat lapar dan tetap ceria saat kemarau.",
 "teknologi/@T13/teks_terbuka": "Matahari kemarau menyengat. {nama} membayangkan topi lebar dari anyaman bambu dan kendi air yang selalu sejuk.",
 "teknologi/@T13/teks_selesai": "{nama} menyelesaikan riset Caping & Kendi. Semua orang kini terlihat menggemaskan dengan caping lebar.",
 "teknologi/@T15/teks_terbuka": "Pedagang sering bilang karung gabah desa \"kurang berat\". Benarkah?",
 "teknologi/@T16/teks_selesai": "{nama} menyelesaikan riset Papan Pengumuman. Kertas pertama yang ditempel berbunyi: \"Dicari: ayam jago hilang, bulunya cokelat.\"",
 "teknologi/@T20/nama": "Bersih Desa",
 "teknologi/@T20/deskripsi": "Bersih desa dan sedekah bumi tahunan, dengan gamelan, tarian, dan tumpeng dari setiap keluarga.",
 "teknologi/@T20/efek_ringkas": "Sekali setahun desa bersyukur bersama: suasana hati melonjak dan pendatang lebih cepat tertarik.",
 "teknologi/@T20/teks_terbuka": "Penduduk datang dari banyak daerah. Masing-masing punya lagu, tarian, dan masakan yang ingin dibagi.",
 "teknologi/@T20/teks_selesai": "{nama} menyelesaikan riset Bersih Desa. Kalender desa kini punya satu hari yang ditunggu semua orang.",
 # ---- pencapaian ----
 "pencapaian/@A03/deskripsi": "Miliki stok makanan dan padi gabungan minimal 40.",
 "pencapaian/@A04/nama": "Kemarau Pertama",
 "pencapaian/@A04/deskripsi": "Lewati kemarau tahun pertama tanpa ada yang kelaparan parah.",
 "pencapaian/@A04/teks_terbuka": "Hujan pertama turun, dan semua orang masih tersenyum. Kalian berhasil!",
 "pencapaian/@A06/teks_terbuka": "Panen pertama! Padinya mungkin sedikit, tapi rasanya istimewa.",
 "pencapaian/@A07/teks_terbuka": "Tak perlu lagi berjalan jauh ke sungai. Airnya sejuk dan segar.",
 "pencapaian/@A16/nama": "Bersih Desa Pertama",
 "pencapaian/@A16/deskripsi": "Adakan bersih desa atau sedekah bumi pertama.",
 "pencapaian/@A16/teks_terbuka": "Gamelan, tarian, dan tumpeng sampai larut malam. Inilah desa yang bahagia.",
 "pencapaian/@A24/teks_terbuka": "Si Oranye kini resmi menjadi penduduk kehormatan. Ia tidur di karung gabah paling empuk.",
 # ---- pasar ----
 "pasar/pesan_fluktuasi/@musim_dingin_pangan/teks": "Kemarau tiba. Harga makanan dan padi naik karena sawah berhenti tumbuh.",
 "pasar/pesan_fluktuasi/@musim_dingin_gandum/teks": "Harga padi naik karena kemarau. Lumbung yang penuh kini terasa seperti harta karun.",
 "pasar/pesan_fluktuasi/@semi_kayu/teks": "Musim hujan! Bambu dan kayu tumbuh subur, jadi harga jual kayu sedikit turun.",
 "pasar/pesan_fluktuasi/@panas_makanan/teks": "Buah dan ikan melimpah di pancaroba. Harga jual makanan turun.",
 "pasar/pesan_fluktuasi/@setelah_panen_raya/teks": "Setelah panen raya, gabah ada di mana-mana. Harga jualnya turun untuk beberapa hari.",
 "pasar/musim_dingin/peringatan": "Kemarau sebentar lagi. Harga makanan biasanya melonjak, jadi sebaiknya stok dibeli atau disimpan sekarang.",
 "pasar/musim_dingin/tooltip": "Kemarau: makanan dan padi lebih mahal dibeli, tapi juga lebih berharga dijual.",
 "pasar/musim_dingin/log": "Hari {hari}: Pedagang mengipasi wajahnya dengan caping. \"Makanan sedang mahal di kemarau, Kepala Desa. Maaf ya.\"",
 # ---- event_era_lanjut ----
 "event_era_lanjut/@hama_gudang/deskripsi": "Malam-malam terdengar cicit kecil dari Lumbung padi. Sekeluarga tikus sawah gemuk ternyata sedang berpesta gabah!",
 "event_era_lanjut/@hama_gudang/pilihan/0/teks": "Pasang perangkap bambu",
 "event_era_lanjut/@kerbau_nyasar/deskripsi": "Seekor kerbau besar berjalan santai ke tengah desa, lalu berkubang di genangan depan Gudang. Sepertinya ia tersesat.",
 "event_era_lanjut/@kerbau_nyasar/pilihan/0/teks_hasil": "Si kerbau betah dan mau membantu membajak sawah. Ia dinamai \"Mbok Besar\" oleh anak-anak.",
 "event_era_lanjut/@ilmuwan_pengembara/pilihan/0/teks_hasil": "Sambil makan nasi pecel, pengembara menjelaskan banyak hal. Riset desa maju pesat!",
 "event_era_lanjut/@kunang_kunang/deskripsi": "Malam ini sawah dipenuhi kunang-kunang. Cahayanya berkelip seperti bintang yang turun ke bumi.",
 "event_era_lanjut/@embun_beku/judul": "Serangan Wereng",
 "event_era_lanjut/@embun_beku/deskripsi": "Pagi ini batang padi di beberapa petak menguning lebih cepat. Wereng cokelat sedang berpesta di sawah!",
 "event_era_lanjut/@embun_beku/pilihan/0/teks_hasil": "Semua tangan turun ke sawah. Padi diselamatkan sebelum dihabisi wereng, walau bulirnya belum terlalu bernas.",
 "event_era_lanjut/@embun_beku/pilihan/1/teks": "Lepas bebek ke sawah dan bakar jerami jauh dari petak",
 "event_era_lanjut/@embun_beku/pilihan/1/teks_hasil": "Bebek-bebek berbaris lucu sambil mematuki wereng. Padi tetap tumbuh pelan-pelan.",
 "event_era_lanjut/@embun_beku/pilihan/2/teks": "Berdoa dan menunggu",
 "event_era_lanjut/@embun_beku/pilihan/2/teks_hasil": "Penduduk menunggu wereng pergi sendiri, tapi sebagian padi layu, dan semua ikut lesu karena cemas.",
 "event_era_lanjut/@percikan_dapur/pilihan/0/teks_hasil": "Ember-ember berpindah tangan dengan cepat. Api padam, dan hanya kuali yang sedikit gosong.",
 "event_era_lanjut/@harga_pangan_melambung/pilihan/2/teks": "Simpan untuk kemarau",
 "event_era_lanjut/@rombongan_seniman/deskripsi": "Gerobak warna-warni berhenti di depan Balai desa. Ada pemain gamelan, penari jaranan, dan seekor monyet kecil berpeci.",
 "event_era_lanjut/@pilek_musim_gugur/judul": "Masuk Angin Pancaroba",
 "event_era_lanjut/@pilek_musim_gugur/deskripsi": "Cuaca pancaroba berubah-ubah: pagi terik, sore hujan. Satu per satu penduduk mulai bersin dan pegal-pegal.",
 "event_era_lanjut/@pilek_musim_gugur/pilihan/0/teks": "Seduh wedang jahe dan beri kerokan",
 "event_era_lanjut/@pilek_musim_gugur/pilihan/0/teks_hasil": "Wedang jahe mengepul di setiap rumah. Setelah dikerok dan tidur cukup, bersin-bersin cepat mereda.",
 "event_era_lanjut/@pilek_musim_gugur/pilihan/2/teks": "Bekerja sambil pakai sarung",
 "event_era_lanjut/@bangau_balai/judul": "Bangau di Atap Pendopo",
 "event_era_lanjut/@tanah_bukit_bergeser/judul": "Longsor Kecil di Bukit",
 "event_era_lanjut/@tanah_bukit_bergeser/pilihan/1/teks": "Tanam bambu penahan tanah",
 "event_era_lanjut/@tanah_bukit_bergeser/pilihan/1/teks_hasil": "Rumpun bambu ditanam berjajar seperti terasering. Akarnya akan memeluk lereng supaya tidak longsor lagi.",
})

UBAH_V140.update({
 # ---- event_musiman (id & musim lama tetap; narasi Indonesia) ----
 "event_musiman/@banjir_kecil/deskripsi": "Hujan semalaman membuat sungai naik. Air cokelat mulai merayap ke sawah di tepi sungai.",
 "event_musiman/@banjir_kecil/pilihan/0/teks_hasil": "Parit kecil menuntun air kembali ke sungai. Sawah selamat, dan semua orang belepotan lumpur sambil tertawa.",
 "event_musiman/@banjir_kecil/pilihan/1/teks": "Selamatkan bibit padi ke Gudang",
 "event_musiman/@banjir_kecil/pilihan/1/teks_hasil": "Bibit aman di Gudang, tapi sawah tepi sungai harus menunggu air surut sebelum ditanami lagi.",
 "event_musiman/@bunga_semi/deskripsi": "Bukit di dekat desa tiba-tiba dipenuhi bunga liar kuning dan ungu. Kupu-kupu dan lebah beterbangan riang di mana-mana.",
 "event_musiman/@bunga_semi/pilihan/0/teks_hasil": "Semua orang duduk di atas tikar di antara bunga, berbagi bekal nasi bungkus dan cerita. Hari yang sempurna.",
 "event_musiman/@bunga_semi/pilihan/1/teks": "Cari sarang lebah hutan",
 "event_musiman/@bunga_semi/pilihan/2/teks_hasil": "Kendi-kendi kecil berisi bunga menghiasi setiap jendela gubuk.",
 "event_musiman/@kelinci_ladang/judul": "Burung Pipit Menyerbu Sawah",
 "event_musiman/@kelinci_ladang/deskripsi": "Sekawanan burung pipit berkicau riuh dan mematuki bulir padi muda. Lucu, tapi merepotkan!",
 "event_musiman/@kelinci_ladang/pilihan/0/teks": "Pasang orang-orangan sawah dari ranting",
 "event_musiman/@kelinci_ladang/pilihan/0/teks_hasil": "Orang-orangan sawah bertopi caping berdiri gagah. Pipit-pipit kabur ke semak liar sambil mencicit kesal.",
 "event_musiman/@kelinci_ladang/pilihan/1/teks": "Sisihkan segenggam padi untuk burung",
 "event_musiman/@kelinci_ladang/pilihan/1/teks_hasil": "Pipit kenyang di pojok pematang dan tidak lagi mengganggu sawah. Anak-anak senang memandangi mereka.",
 "event_musiman/@kelinci_ladang/pilihan/2/teks_hasil": "Pipit berpesta bulir muda. Sawah harus menumbuhkan bulir baru dulu.",
 "event_musiman/@gelombang_panas/judul": "Panas Terik Pancaroba",
 "event_musiman/@gelombang_panas/deskripsi": "Matahari menyengat tanpa ampun. Kendi di sumur cepat kosong dan penduduk berkeringat sejak pagi.",
 "event_musiman/@gelombang_panas/pilihan/0/teks_hasil": "Siang hari semua tidur di bawah pohon beringin yang rindang. Pekerjaan lambat, tapi tak ada yang kepanasan.",
 "event_musiman/@gelombang_panas/pilihan/1/teks": "Bagikan air kelapa dan air kendi",
 "event_musiman/@ikan_melimpah/pilihan/0/teks_hasil": "Keranjang terisi ikan wader dan nila. Malam ini ada ikan bakar sambal untuk semua.",
 "event_musiman/@angin_gugur/judul": "Angin Mareng yang Usil",
 "event_musiman/@angin_gugur/deskripsi": "Angin kencang mareng menerbangkan daun kering dan atap rumbia ke mana-mana.",
 "event_musiman/@angin_gugur/pilihan/0/teks": "Ikat atap dengan tali sabut",
 "event_musiman/@angin_gugur/pilihan/1/teks_hasil": "Daun-daun jadi kompos. Sawah musim depan akan lebih subur.",
 "event_musiman/@angin_gugur/pilihan/2/teks_hasil": "Tawa terdengar di mana-mana. Sedikit atap rumbia hilang, tapi tidak ada yang menyesal.",
 "event_musiman/@jamur_hutan/deskripsi": "Setelah hujan, jamur-jamur bermunculan di bawah rumpun bambu. Ada jamur kuping yang cokelat, ada yang berwarna mencolok.",
 "event_musiman/@jamur_hutan/pilihan/0/teks_hasil": "{nama} yang paham tanaman memilih jamur yang aman. Sayur jamur malam ini harum sekali.",
 "event_musiman/@jamur_hutan/pilihan/1/teks_hasil": "Sayur jamurnya enak, tapi beberapa orang sakit perut semalaman. Jamur berwarna mencolok memang bukan untuk dimakan.",
 "event_musiman/@burung_migrasi/judul": "Rombongan Elang Pulang",
 "event_musiman/@burung_migrasi/deskripsi": "Ratusan elang alap-alap terbang melingkar tinggi di langit, menuju pulau-pulau di timur. Pertanda kemarau sebentar lagi tiba.",
 "event_musiman/@burung_migrasi/pilihan/1/teks_hasil": "Melihat burung bersiap, penduduk ikut menumpuk kayu bakar dan gaplek untuk kemarau.",
 "event_musiman/@badai_salju/judul": "Angin Kering Berdebu",
 "event_musiman/@badai_salju/deskripsi": "Angin kemarau bertiup kencang membawa debu dari sawah yang kering. Gudang hampir tak terlihat dari Gubuk.",
 "event_musiman/@badai_salju/pilihan/0/teks": "Sapu debu bersama-sama",
 "event_musiman/@badai_salju/pilihan/0/teks_hasil": "Halaman bersih kembali. Seseorang menggambar wajah lucu di debu tebal di dinding Gudang.",
 "event_musiman/@badai_salju/pilihan/1/teks": "Perkuat atap dan dinding anyaman",
 "event_musiman/@badai_salju/pilihan/1/teks_hasil": "Atap ditopang balok tambahan. Tak ada yang roboh walau angin bertiup kencang.",
 "event_musiman/@badai_salju/pilihan/2/teks": "Tunggu angin reda",
 "event_musiman/@badai_salju/pilihan/2/teks_hasil": "Angin reda keesokan harinya. Beberapa atap rumbia terlepas dan dinding berlapis debu.",
 "event_musiman/@malam_terpanjang/judul": "Malam Purnama Kemarau",
 "event_musiman/@malam_terpanjang/deskripsi": "Langit kemarau bersih tanpa awan, dan bulan purnama bersinar terang. Para tetua bilang, kisah yang diceritakan malam ini akan diingat lama.",
 "event_musiman/@malam_terpanjang/pilihan/1/teks": "Nyalakan oncor di setiap rumah",
 "event_musiman/@malam_terpanjang/pilihan/1/teks_hasil": "Desa berkelip seperti bintang di bawah bulan purnama. Siapa pun yang tersesat pasti bisa menemukan jalan pulang.",
 "event_musiman/@malam_terpanjang/pilihan/2/teks_hasil": "Malam yang sejuk berarti tidur yang nyenyak. Semua bangun segar dan siap bekerja.",
 "event_musiman/@serigala_lapar/judul": "Babi Hutan Kehausan",
 "event_musiman/@serigala_lapar/deskripsi": "Kemarau membuat hutan kering dan babi hutan sulit mencari makan. Jejak mereka terlihat makin dekat ke Gudang dan sumur.",
 "event_musiman/@serigala_lapar/pilihan/0/teks": "Nyalakan oncor di sekeliling desa",
 "event_musiman/@serigala_lapar/pilihan/0/teks_hasil": "Cincin cahaya mengelilingi desa. Babi hutan mengamati dari jauh, lalu pergi mencari tempat lain.",
 "event_musiman/@serigala_lapar/pilihan/1/teks": "Taruh sisa daging dan kulit buah di tepi hutan",
 "event_musiman/@serigala_lapar/pilihan/1/teks_hasil": "Babi hutan mengendus sisa makanan itu dan tidak mendekat lagi. Mungkin mereka juga punya anak yang lapar.",
 "event_musiman/@serigala_lapar/pilihan/2/teks": "Tutup pintu dan ronda bergantian",
 "event_musiman/@serigala_lapar/pilihan/2/teks_hasil": "Malam panjang dengan bunyi kentongan. Pagi harinya, hanya jejak kaki yang tersisa di tanah kering.",

 "event_musiman/@dingin_ekstrem/judul": "Malam Bediding",
 "event_musiman/@dingin_ekstrem/deskripsi": "Siang terik, tapi angin kering dari selatan membuat malam terasa menusuk tulang. Para tetua menyebutnya bediding, tanda puncak kemarau.",
 "event_musiman/@dingin_ekstrem/pilihan/0/teks": "Semua berkumpul di dekat api unggun",
 "event_musiman/@dingin_ekstrem/pilihan/0/teks_hasil": "Desa menghabiskan malam dengan bercerita di dekat api, ditemani wedang jahe. Sejuk di luar, hangat di dalam.",
 "event_musiman/@dingin_ekstrem/pilihan/1/teks": "Bagikan sarung dan kain dari kulit",
 "event_musiman/@dingin_ekstrem/pilihan/1/teks_hasil": "Sarung dan kain dibagikan. Penduduk tetap bisa ronda walau pipi mereka merah seperti jambu air.",
 "event_musiman/@dingin_ekstrem/pilihan/2/teks": "Tidur lebih awal di rumah masing-masing",
 "event_musiman/@dingin_ekstrem/pilihan/2/teks_hasil": "Semua meringkuk bersarung di atas dipan. Sepi dan sejuk, tapi semua selamat.",
})

UBAH_V140.update({
 "meta/bangunan_pertahanan/pagar": "Pagar bambu",
 "meta/bangunan_pertahanan/menara_jaga": "Pos ronda",
 # ---- musim_pembuka (key lama tetap; isi mengikuti peta transisi) ----
 "musim_pembuka/musim_semi/kapan": "Fajar hari pertama musim hujan",
 "musim_pembuka/musim_semi/variasi/0": "Musim hujan tiba. Saatnya membajak sawah dan menanam padi.",
 "musim_pembuka/musim_semi/variasi/1": "Bau tanah basah tercium di mana-mana. Katak bernyanyi di pematang, dan sawah sudah menunggu bibit.",
 "musim_pembuka/musim_semi/variasi/2": "Daun pisang berkilau basah. Musim hujan tahun ke-{tahun} dimulai, dan tanah terasa lembut untuk dicangkul.",
 "musim_pembuka/musim_panas/kapan": "Fajar hari pertama pancaroba",
 "musim_pembuka/musim_panas/variasi/0": "Pancaroba datang. Hujan makin jarang dan siang makin terik, jadi sumur akan bekerja lebih keras. Jaga stok air!",
 "musim_pembuka/musim_panas/variasi/2": "Pagi cerah, sore kadang gerimis. Nikmati pancaroba, tapi ingat: ilalang kering mudah terbakar.",
 "musim_pembuka/musim_gugur/kapan": "Fajar hari pertama musim panen / mareng",
 "musim_pembuka/musim_gugur/variasi/0": "Mareng tiba. Padi menguning, sawah siap dipanen, dan lumbung menunggu diisi.",
 "musim_pembuka/musim_gugur/variasi/1": "Angin kering membawa aroma jerami. Waktunya panen, menjemur gabah, dan menyimpan bekal untuk kemarau.",
 "musim_pembuka/musim_gugur/variasi/2": "Sawah berubah keemasan. Penduduk mulai menghitung ikatan padi sambil bersenandung.",
 "musim_pembuka/musim_dingin/kapan": "Fajar hari pertama musim kemarau",
 "musim_pembuka/musim_dingin/variasi/0": "Kemarau datang. Sawah berhenti tumbuh, air menyusut, dan setiap porsi makanan berharga.",
 "musim_pembuka/musim_dingin/variasi/1": "Langit biru tanpa awan dan tanah mulai retak. Siang terik, malam bediding, jadi penduduk merapat ke api unggun.",
 "musim_pembuka/musim_dingin/variasi/2": "Daun jati mulai meranggas. Semoga lumbung padi cukup penuh dan sumur tetap berair sampai hujan pertama.",
 "musim_pembuka/musim_semi_hujan/kapan": "Hari hujan deras di musim hujan",
 "musim_pembuka/musim_semi_hujan/variasi/0": "Hujan deras turun. Semak cepat berbuah lagi, walau kayu dan bambu jadi licin untuk ditebang.",
 "musim_pembuka/musim_semi_hujan/variasi/1": "Gerimis sore membuat semua orang tersenyum. Tanah wangi, dan katak bernyanyi di tepi sungai.",
 "musim_pembuka/musim_gugur_menuju_dingin/kapan": "Fajar hari ke-4 sampai ke-7 musim panen (peringatan menjelang kemarau)",
 "musim_pembuka/musim_gugur_menuju_dingin/variasi/0": "Sisa {hari_sisa} hari sebelum kemarau. Stok pangan cukup untuk {jumlah} dari {jumlah2} hari yang disarankan.",
 "musim_pembuka/musim_gugur_menuju_dingin/variasi/1": "Angin mulai kering. {hari_sisa} hari lagi sawah berhenti tumbuh. Lumbung kita baru cukup {jumlah} dari {jumlah2} hari.",
 "musim_pembuka/musim_gugur_menuju_dingin/variasi/2": "{nama} menatap langit yang makin cerah. \"Tinggal {hari_sisa} hari lagi sebelum kemarau,\" katanya. Persediaan: {jumlah}/{jumlah2} hari.",
 "musim_pembuka/musim_gugur_stok_kurang/kapan": "Banner jika stok di bawah target cadangan kemarau",
 "musim_pembuka/musim_gugur_stok_kurang/variasi/0": "Stok pangan belum cukup untuk kemarau. Utamakan panen, berburu, dan simpan makanan sekarang.",
 "musim_pembuka/musim_gugur_stok_kurang/variasi/1": "Lumbung padi masih terlalu ringan untuk menghadapi kemarau. Ayo kumpulkan bekal selagi sempat!",
 "musim_pembuka/musim_gugur_syukur/kapan": "Akhir musim panen jika stok pangan aman",
 "musim_pembuka/musim_gugur_syukur/variasi/0": "Lumbung penuh sebelum kemarau datang. Penduduk berkumpul untuk syukuran kecil. Kerja keras kalian terbayar!",
 "musim_pembuka/musim_gugur_syukur/variasi/1": "Semua ikatan padi tersusun rapi. Malam ini desa makan bersama, hangat dan tenang menyambut kemarau.",
 "musim_pembuka/musim_dingin_kayu_bakar/kapan": "Saat api unggun memakai kayu bakar di malam bediding kemarau",
 "musim_pembuka/musim_dingin_kayu_bakar/variasi/0": "Malam bediding membuat api unggun melahap kayu bakar lebih banyak. Pastikan tumpukan kayu tidak habis.",
 "musim_pembuka/musim_tahun_baru/kapan": "Awal tahun ke-2 dan seterusnya (hujan pertama)",
 # ---- peringatan_dini ----
 "peringatan_dini/ancaman_kekeringan/tingkat/waspada/teks/0": "Stok air hanya cukup untuk {hari_sisa} hari. Sumur bekerja keras saat hujan makin jarang.",
 "peringatan_dini/ancaman_kekeringan/tingkat/bahaya/teks/0": "Stok air hampir habis. Penduduk mulai haus, dan padi di sawah terlihat layu.",
 "peringatan_dini/ancaman_kekeringan/tingkat/reda/teks/1": "Stok air kembali aman. Padi yang layu perlahan tegak lagi.",
 "peringatan_dini/ancaman_serigala/nama": "Babi hutan & macan tutul",
 "peringatan_dini/ancaman_serigala/catatan": "waspada = fase jejak (sore), bahaya = fase mendekat (awal malam), reda = fase usai (fajar). Teks serangan ada di log_ancaman. Hewan tampilan: babi hutan (utama) dan macan tutul jawa (langka). Lihat meta.alias_id_v140.",
 "peringatan_dini/ancaman_serigala/tingkat/waspada/judul": "Jejak di Tepi Hutan",
 "peringatan_dini/ancaman_serigala/tingkat/waspada/teks/0": "Ada jejak kaki babi hutan dan tanah yang teraduk di tepi hutan. Dengusan terdengar menjelang senja.",
 "peringatan_dini/ancaman_serigala/tingkat/waspada/teks/1": "{nama} menemukan jejak kuku di lumpur dekat sawah. Malam ini sebaiknya semua pulang lebih awal.",
 "peringatan_dini/ancaman_serigala/tingkat/waspada/saran": "Nyalakan Obor dan pasang Pagar bambu di sekitar rumah dan sawah.",
 "peringatan_dini/ancaman_serigala/tingkat/bahaya/judul": "Dengusan Mendekat!",
 "peringatan_dini/ancaman_serigala/tingkat/bahaya/teks/0": "Semak-semak bergoyang makin dekat. Penduduk yang masih di luar sebaiknya segera pulang.",
 "peringatan_dini/ancaman_serigala/tingkat/bahaya/teks/1": "Mata-mata kecil berkilat di balik rumpun bambu. Babi hutan sedang mengintai sawah malam ini.",
 "peringatan_dini/ancaman_serigala/tingkat/bahaya/saran": "Jauhkan penduduk dari kegelapan. Obor, Pagar bambu, dan Pos ronda dengan kentongan membuat desa lebih aman.",
 "peringatan_dini/ancaman_serigala/tingkat/reda/teks/0": "Matahari terbit dan babi hutan kembali ke hutan. Desa bisa bernapas lega.",
 "peringatan_dini/ancaman_dingin_ekstrem/nama": "Malam bediding",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/waspada/judul": "Angin Kering dari Selatan",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/waspada/teks/0": "Angin kering bertiup sejak sore dan langit bersih tanpa awan. Malam ini akan bediding, menusuk tulang.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/waspada/teks/1": "Langit sore berwarna jingga pucat dan angin terasa menusuk. {nama} menumpuk kayu bakar ekstra di dekat api.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/waspada/saran": "Tambah kayu bakar dan siapkan sarung. Jaga penduduk dekat api atau rumah.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/bahaya/judul": "Bediding Menusuk!",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/bahaya/teks/0": "Malam ini sejuk sekali, padahal siangnya terik. Penduduk yang jauh dari api cepat lapar dan murung.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/bahaya/teks/1": "Embun tebal menempel di daun pisang dan tikar. Siapa pun yang di luar terlalu lama akan menggigil.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/reda/judul": "Pagi yang Hangat",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/reda/teks/0": "Angin kering sudah reda. Penduduk berjemur di halaman sambil meregangkan badan.",
 "peringatan_dini/ancaman_dingin_ekstrem/tingkat/reda/teks/1": "Matahari kemarau muncul hangat. Malam paling sejuk telah berlalu.",
 # ---- log_ancaman (key serigala_* tetap; hewan tampilan = babi hutan) ----
 "log_ancaman/serigala_jejak/0": "Hari {hari}: {nama} menemukan jejak babi hutan di tepi hutan. Dengusan terdengar saat matahari terbenam.",
 "log_ancaman/serigala_mendekat/0": "Hari {hari}: Dengusan babi hutan makin dekat. {nama} bergegas pulang sambil menoleh ke belakang.",
 "log_ancaman/serangan_serigala/0": "Hari {hari}: Seekor babi hutan menyeruduk {nama} yang masih bekerja di luar saat gelap. {nama2} datang membawa obor dan mengusirnya.",
 "log_ancaman/serangan_serigala/1": "Hari {hari}: {nama} diseruduk babi hutan dalam perjalanan pulang. Untung teriakannya membangunkan seluruh desa.",
 "log_ancaman/serangan_serigala/2": "Hari {hari}: Babi hutan menyergap {nama} di dekat sawah. Ia berhasil lari ke gubuk, tapi terluka.",
 "log_ancaman/diusir/0": "Hari {hari}: Cahaya obor membuat babi hutan ragu. Mereka berbalik ke hutan tanpa mendekat.",
 "log_ancaman/diusir/1": "Hari {hari}: Pagar bambu menghalangi jalan babi hutan. Mereka berputar-putar lalu pergi dengan kesal.",
 "log_ancaman/diusir/2": "Hari {hari}: {nama} memukul kentongan dari Pos ronda. Babi hutan lari terbirit-birit ke hutan.",
 "log_ancaman/diusir/3": "Hari {hari}: {nama} dan {nama2} ronda semalaman. Tidak ada satu pun babi hutan yang berani mendekat.",
 "log_ancaman/serigala_usai/0": "Hari {hari}: Fajar menyingsing. Babi hutan sudah kembali ke hutan.",
 "log_ancaman/dingin_jauh_api/0": "Hari {hari}: {nama} menggigil karena terlalu lama bekerja jauh dari api di malam bediding.",
 "log_ancaman/dingin_jauh_api/1": "Hari {hari}: Jari-jari {nama} kaku karena angin malam kemarau. Ia buru-buru menghangatkan diri di dekat api unggun.",
 "log_ancaman/kayu_bakar_habis/0": "Hari {hari}: Kayu bakar habis! Api unggun meredup dan penduduk merapatkan sarung.",
 # ---- penduduk_sakit / meninggal / pemakaman / pergi ----
 "penduduk_sakit/ringan/istirahat/0": "Hari {hari}: {nama} tidur siang di gubuk, berselimut sarung. Teman-teman menjaga suara agar tidak berisik.",
 "penduduk_sakit/per_penyebab/dingin/0": "Hari {hari}: {nama} masuk angin karena terlalu lama kehujanan atau terkena angin malam. Hidungnya merah seperti buah jambu.",
 "penduduk_sakit/per_penyebab/dingin/1": "Hari {hari}: Cuaca yang berubah-ubah membuat {nama} demam. Ia dikerok, diberi wedang jahe, dan dibungkus sarung di dekat api.",
 "penduduk_meninggal/per_penyebab/dingin/0": "Hari {hari}: Tubuh {nama} terlalu lemah menghadapi cuaca buruk musim ini, dan ia berpulang malam ini. Api unggun dinyalakan lebih besar untuknya.",
 "penduduk_meninggal/per_penyebab/dingin/1": "Hari {hari}: Kemarau terlalu berat bagi {nama}. Ia tertidur di atas tikar dan tidak bangun lagi.",
 "penduduk_meninggal/per_penyebab/dingin/2": "Hari {hari}: {nama} berpulang di malam bediding yang sunyi. Desa berkumpul, saling menguatkan dalam diam.",
 "pemakaman/upacara/2": "Hari {hari}: Bunga kamboja diletakkan di Makam {nama}. {nama2} berjanji akan merawatnya setiap musim hujan.",
 "pemakaman/per_penyebab/kelaparan/0": "Di depan Makam {nama}, desa berjanji untuk selalu mengisi lumbung padi sebelum kemarau.",
 "pemakaman/per_penyebab/dingin/0": "Pohon kamboja kecil ditanam di samping Makam {nama}, supaya ia selalu teduh dan tenang.",
 "penduduk_pergi/kepergian/1": "Hari {hari}: {nama} pamit dengan mata berkaca-kaca. Ia membawa bekal secukupnya dan sehelai sarung tenun {nama2}.",
 # ---- bangunan_ancaman (key tetap) ----
 "bangunan_ancaman/bangunan_pagar/nama": "Pagar Bambu",
 "bangunan_ancaman/bangunan_pagar/tooltip": "Pagar bambu sederhana. Babi hutan malas melewatinya.",
 "bangunan_ancaman/bangunan_pagar/deskripsi": "Pasang pagar bambu di sekeliling rumah dan sawah supaya babi hutan harus berputar jauh. Rumah yang hampir terkurung pagar menjadi zona aman.",
 "bangunan_ancaman/bangunan_pagar/selesai": "Hari {hari}: {nama} menancapkan bilah bambu terakhir. Gubuk-gubuk kini terasa lebih terlindungi.",
 "bangunan_ancaman/bangunan_pagar/terkunci": "Pagar bambu terbuka di era Dusun.",
 "bangunan_ancaman/bangunan_obor/tooltip": "Obor bambu (oncor) yang membuat malam lebih aman.",
 "bangunan_ancaman/bangunan_obor/deskripsi": "Obor bambu menerangi sekitarnya di malam hari. Babi hutan dan macan tutul jauh lebih jarang mendekati penduduk di dekat cahaya. Butuh kayu sesekali agar tetap menyala.",
 "bangunan_ancaman/bangunan_menara_jaga/nama": "Pos Ronda",
 "bangunan_ancaman/bangunan_menara_jaga/tooltip": "Pos ronda berkentongan untuk berjaga dan memberi tanda bahaya.",
 "bangunan_ancaman/bangunan_menara_jaga/deskripsi": "Dari pos ronda, peronda bisa melihat babi hutan atau macan tutul yang mendekat dan mengusirnya sekali setiap malam dengan bunyi kentongan. Butuh penduduk dengan prioritas Jaga, atau penduduk yang sedang luang.",
 "bangunan_ancaman/bangunan_menara_jaga/selesai": "Hari {hari}: Pos ronda berdiri, lengkap dengan kentongan bambu. {nama} memukulnya tiga kali sambil tersenyum lebar.",
 "bangunan_ancaman/bangunan_menara_jaga/usir": "Hari {hari}: Dari Pos ronda, {nama} melihat babi hutan mendekat dan memukul kentongan. Mereka lari ke hutan.",
 "bangunan_ancaman/bangunan_menara_jaga/kosong": "Pos ronda tidak ada perondanya malam ini.",
 "bangunan_ancaman/bangunan_menara_jaga/terkunci": "Pos ronda terbuka di era Desa Pertanian.",
 "bangunan_ancaman/bangunan_makam/selesai": "Hari {hari}: Makam untuk {nama} selesai dibuat. Bunga kamboja dan melati mulai ditanam di sekitarnya.",
 # ---- log_jadwal / tumbuh_kembang ----
 "log_jadwal/tidur_di_luar_dingin/0": "Hari {hari}: {nama} tidur di luar dan kehujanan sepanjang malam. Ia sangat butuh rumah.",
 "log_jadwal/tidur_di_luar_dingin/1": "Hari {hari}: Angin malam bertiup kencang. {nama} yang tidur di luar bangun dengan hidung merah dan suasana hati buruk.",
 "log_jadwal/tidur_di_luar_dingin/2": "Hari {hari}: {nama} tidak bisa tidur karena digigit nyamuk dan basah di luar. Bangun Gubuk agar ia bisa beristirahat nyaman.",
 "tumbuh_kembang/ulang_tahun_anak/0": "Hari {hari}: {nama} berulang tahun ke-{umur}! {ibu} membuat kue kecil dari tepung beras dan gula aren.",
})

UBAH_V140.update({
 "meta/tipe_tujuan_quest/adakan_festival": "Adakan bersih desa/sedekah bumi sebanyak jumlah (efek T20 Bersih Desa atau event festival_desa), target \"semua\"",
 "peringatan_dini/ancaman_banjir/tingkat/waspada/saran": "Jauhkan sawah baru dari tepi sungai. Riset Tanggul & Parit membantu air cepat surut.",
 "peringatan_dini/ancaman_banjir/tingkat/waspada/teks/1": "{nama} melihat air sungai sudah menyentuh akar rumpun bambu di tepian. Sebaiknya jangan menanam dekat sungai dulu.",
 "peringatan_dini/ancaman_banjir/tingkat/bahaya/teks/0": "Sungai meluap ke tepian. Jalan di dekat air jadi becek dan sawah di tepi sungai berhenti tumbuh sebentar.",
 "peringatan_dini/ancaman_banjir/tingkat/bahaya/teks/1": "Air setinggi mata kaki menggenangi tepi sungai. Penduduk berjalan pelan sambil menggulung sarung.",
 "prioritas_darurat/jaga/tooltip": "Ronda di Pos ronda dan sekitar desa saat malam, membawa kentongan.",
 "event_musiman/@gelombang_panas/judul": "Panas Terik",
})

# ---------- v1.4.0: bagian baru (aditif) ----------
def _P(judul, teks, saran=""): return {"judul": judul, "teks": teks, "saran": saran}
def _MP(musim, kapan, variasi): return {"musim": musim, "kapan": kapan, "variasi": variasi}
def _EV(id, judul, desk, pilihan, kategori, musim): return {"id": id, "judul": judul, "kategori": kategori, "deskripsi": desk, "pilihan": pilihan, "musim": musim}
def _C(teks, efek, hasil): return {"teks": teks, "efek": efek, "teks_hasil": hasil}

musim_pembuka_v140 = {
 "musim_hujan": _MP("hujan", "Fajar hari pertama musim hujan (rendheng)", [
  "Musim hujan tiba. Saatnya membajak sawah dan menanam padi bersama-sama.",
  "Bau tanah basah tercium di mana-mana. Katak bernyanyi di pematang, dan sawah sudah menunggu bibit.",
  "Awan kelabu berarak dari gunung. Musim hujan tahun ke-{tahun} dimulai, dan tanah terasa lembut untuk dicangkul."]),
 "musim_mareng": _MP("mareng", "Fajar hari pertama pancaroba mareng (menuju kemarau)", [
  "Pancaroba mareng datang. Padi menguning, angin mulai kering, dan sawah siap dipanen.",
  "Hujan makin jarang, siang makin terik. Waktunya panen, menjemur gabah, dan menyimpan bekal.",
  "Capung beterbangan di atas sawah keemasan. Kata para tetua, kemarau sudah tidak jauh lagi."]),
 "musim_kemarau": _MP("kemarau", "Fajar hari pertama musim kemarau (ketiga)", [
  "Kemarau tiba. Sawah tanpa irigasi berhenti tumbuh, dan air cepat habis. Hemat-hemat ya!",
  "Langit biru tanpa awan dan tanah mulai retak. Tegalan berisi singkong dan jagung kini jadi andalan.",
  "Daun jati mulai meranggas. Semoga lumbung padi cukup penuh dan sumur tetap berair sampai hujan pertama."]),
 "musim_labuh": _MP("labuh", "Fajar hari pertama pancaroba labuh (menuju hujan)", [
  "Pancaroba labuh datang. Mendung mulai menggantung, dan sumur perlahan berair lagi.",
  "Angin berubah arah dan pohon mangga berbuah lebat. Siapkan bibit, hujan sebentar lagi turun.",
  "Cuaca berubah-ubah: pagi terik, sore gerimis. Jaga kesehatan, minum wedang jahe, dan jangan lupa tutup tempayan."]),
 "musim_hujan_deras": _MP("hujan", "Hari hujan deras di musim hujan", [
  "Hujan turun seharian. Yang tidak punya atap kebasahan.",
  "Hujan deras mengguyur genting dan daun pisang. Anak-anak berlarian main hujan sambil tertawa.",
  "Gerimis tak berhenti sejak pagi. Sawah senang, tapi kayu dan bambu jadi licin untuk ditebang."]),
 "musim_labuh_hujan_pertama": _MP("labuh", "Hujan pertama setelah kemarau", [
  "Hujan pertama turun! Bau tanah basah membuat semua orang tersenyum.",
  "Tetes hujan pertama jatuh di tanah yang retak. Penduduk menengadah dan menari di halaman.",
  "Akhirnya hujan! Sumur mulai terisi, dan kodok-kodok kembali bernyanyi malam ini."]),
 "musim_mareng_menuju_kemarau": _MP("mareng", "Hitung mundur menjelang kemarau (peringatan sebelum kemarau)", [
  "Sisa {hari_sisa} hari sebelum kemarau. Stok pangan cukup untuk {jumlah} dari {jumlah2} hari yang disarankan.",
  "Angin mulai kering. {hari_sisa} hari lagi sawah berhenti tumbuh. Lumbung kita baru cukup {jumlah} dari {jumlah2} hari.",
  "{nama} menatap langit yang makin cerah. \"Tinggal {hari_sisa} hari lagi sebelum kemarau,\" katanya. Persediaan: {jumlah}/{jumlah2} hari."]),
 "musim_mareng_stok_kurang": _MP("mareng", "Banner jika stok di bawah target cadangan kemarau", [
  "Tanam singkong dan jagung, simpan padi di lumbung.",
  "Lumbung padi masih ringan. Jemur gaplek dan simpan gabah selagi sempat!"]),
 "musim_mareng_syukur": _MP("mareng", "Akhir mareng jika stok pangan aman", [
  "Lumbung penuh gabah sebelum kemarau. Syukuran kecil!",
  "Semua ikatan padi tersusun rapi di lumbung. Malam ini desa kenduri kecil, makan bersama di pendopo."]),
 "musim_hujan_kayu_bakar": _MP("hujan", "Saat api unggun memakai kayu bakar di malam lembap musim hujan", [
  "Malam lembap: api unggun memakai {jumlah} kayu bakar per hari selama musim hujan.",
  "Udara malam basah dan nyamuk banyak. Api unggun butuh {jumlah} kayu bakar setiap hari."]),
 "musim_hujan_api_padam": _MP("hujan", "Kayu bakar habis di musim hujan", [
  "Kayu bakar habis! Api unggun meredup, malam terasa lembap.",
  "Api unggun padam diguyur gerimis dan tidak ada kayu kering lagi. Ayo cari ranting di bawah rumpun bambu!"]),
 "musim_kemarau_panjang": _MP("kemarau", "Kemarau diperpanjang (tahun ke-2+, peluang kemarau panjang)", [
  "Hujan belum juga datang. Kemarau tahun ini lebih panjang {jumlah} hari. Hemat air dan pangan!",
  "Para tetua menggeleng pelan. \"Kemarau panjang,\" kata mereka. Masih {jumlah} hari lagi sebelum labuh."]),
 "musim_tahun_baru_hujan": _MP("hujan", "Awal tahun ke-2 dan seterusnya (musim hujan)", [
  "Tahun ke-{tahun} dimulai. Hujan pertama membasahi sawah.",
  "Satu tahun lagi terlewati bersama. Tahun ke-{tahun} dibuka dengan suara hujan di atap rumbia."]),
 "musim_umum": _MP("", "Pembuka cadangan bila tidak ada teks khusus; {musim} = nama musim", [
  "{musim} dimulai.",
  "Selamat datang, {musim}! Penduduk menyesuaikan pekerjaan dengan cuaca."]),
}

peringatan_dini_v140 = {
 "ancaman_babi_hutan": {"nama": "Babi hutan", "musim": ["hujan", "mareng", "kemarau", "labuh"], "event_terkait": ["hewan_buas", "serigala_lapar"],
  "catatan": "Ancaman malam utama tema Nusantara (pengganti ancaman malam lama, lihat meta.alias_id_v140). Menyasar sawah/tegalan dulu; melukai penduduk mulai era Dusun.",
  "tingkat": {
   "waspada": _P("Tanah Teraduk", ["Tanah teraduk dan jejak babi hutan terlihat di tepi hutan.", "{nama} menemukan bekas moncong di pematang. Malam ini sawah perlu dijaga."], "Pasang Pagar bambu dan Obor di sekitar sawah."),
   "bahaya": _P("Dengusan Mendekat!", ["Suara dengusan babi hutan makin dekat. Penduduk bergegas pulang.", "Rumpun bambu bergoyang keras. Babi hutan sedang menuju sawah!"], "Pukul kentongan dari Pos ronda dan jauhkan penduduk dari kegelapan."),
   "reda": _P("Fajar Menyingsing", ["Fajar menyingsing. Babi hutan sudah kembali ke hutan.", "Pagi datang. Hanya jejak kuku di lumpur yang tersisa."])}},
 "ancaman_monyet": {"nama": "Monyet ekor panjang", "musim": ["mareng", "kemarau"], "event_terkait": ["monyet_pencuri"],
  "catatan": "Mencuri di siang hari (pisang, jagung, buah di Gudang). Tidak melukai.",
  "tingkat": {
   "waspada": _P("Kawanan di Pohon", ["Sekawanan monyet bergelantungan di pohon kelapa dekat desa. Mereka memperhatikan tumpukan pisang.", "{nama} melihat monyet kecil mengintip dari atap Gudang."], "Tutup Gudang rapat dan jaga kebun pisang."),
   "bahaya": _P("Monyet Beraksi!", ["Monyet-monyet melompat ke tegalan dan menyambar jagung!", "Pintu Gudang terbuka sedikit, dan seekor monyet sudah menggondol sesisir pisang."], "Usir dengan kentongan dan pasang orang-orangan sawah."),
   "reda": _P("Kembali ke Hutan", ["Kawanan monyet kembali ke hutan sambil mengunyah. Desa tenang lagi.", "Monyet-monyet pergi. Anak-anak tertawa menirukan gaya mereka."])}},
 "ancaman_ular": {"nama": "Ular sawah", "musim": ["hujan", "labuh"], "event_terkait": ["ular_di_sawah"],
  "catatan": "Muncul di sawah dan semak saat basah. Bisa menggigit penduduk yang bekerja di sawah.",
  "tingkat": {
   "waspada": _P("Rumput Basah Bergerak", ["Rumput di pematang bergerak sendiri. Hati-hati, mungkin ada ular yang berteduh.", "{nama} melihat kulit ular yang ditinggalkan di dekat sawah."], "Babat ilalang di sekitar sawah dan pakai sepatu bot karet atau tongkat."),
   "bahaya": _P("Ada Ular!", ["Seekor ular menyeberangi pematang! Penduduk di sawah mundur pelan-pelan.", "Ular masuk ke tumpukan jerami dekat Gubuk. Jangan dipegang!"], "Jangan panik, beri jalan pada ular. Rawat segera jika ada yang tergigit."),
   "reda": _P("Ular Pergi", ["Ular sudah masuk kembali ke semak. Pekerjaan di sawah bisa dilanjutkan.", "Ular itu ternyata hanya lewat. Semua menarik napas lega."])}},
 "ancaman_macan_tutul": {"nama": "Macan tutul jawa", "musim": ["kemarau", "labuh"], "event_terkait": ["serigala_malam"],
  "catatan": "Langka, mulai tahun ke-2. Kentongan dan obor MENGUSIR (tidak dibunuh): macan tutul jawa satwa dilindungi.",
  "tingkat": {
   "waspada": _P("Jejak Kucing Besar", ["Ada jejak kucing besar di tepi hutan. Kata para tetua, macan tutul sedang lewat.", "Kambing-kambing gelisah sejak sore. {nama} memeriksa kandang dua kali."], "Masukkan ternak ke kandang dan nyalakan obor."),
   "bahaya": _P("Macan Tutul di Tepi Desa!", ["Sepasang mata berkilat di balik semak. Macan tutul mengintai kandang malam ini.", "Auman pendek terdengar dari arah hutan jati. Semua masuk rumah!"], "Pukul kentongan bertalu-talu dari Pos ronda. Jangan dikejar."),
   "reda": _P("Kembali ke Hutan", ["Bunyi kentongan membuat sang macan kembali ke hutan. Ternak selamat.", "Pagi datang. Macan tutul sudah jauh di dalam hutan, tempat ia seharusnya tinggal."])}},
 "ancaman_longsor": {"nama": "Longsor", "musim": ["hujan"], "event_terkait": ["longsor", "tanah_bukit_bergeser"],
  "catatan": "Hujan deras berhari-hari di lereng. Terasering dan rumpun bambu mengurangi risiko.",
  "tingkat": {
   "waspada": _P("Lereng Retak", ["Ada retakan kecil di lereng bukit setelah hujan semalaman. Air keruh merembes dari tanah.", "{nama} mendengar kerikil berjatuhan dari tebing dekat desa."], "Jangan bangun di kaki lereng. Tanam bambu dan buat terasering."),
   "bahaya": _P("Tanah Bergerak!", ["Tanah di lereng bergeser pelan. Penduduk di bawah bukit sebaiknya menjauh dulu.", "Pohon-pohon di lereng miring. Longsor bisa terjadi kapan saja!"], "Pindahkan penduduk dari kaki bukit sampai hujan reda."),
   "reda": _P("Lereng Tenang", ["Hujan reda dan lereng kembali diam. Penduduk gotong royong membersihkan tanah yang turun.", "Akar bambu menahan tanah dengan kuat. Lereng aman lagi."])}},
 "ancaman_kemarau_panjang": {"nama": "Kemarau panjang", "musim": ["kemarau"], "event_terkait": ["musim_dingin_keras", "kekeringan"],
  "catatan": "Tahun ke-2+: kemarau bisa diperpanjang beberapa hari (YEAR_SCALE.longDryChance).",
  "tingkat": {
   "waspada": _P("Hujan Belum Datang", ["Seharusnya labuh sudah dekat, tapi langit tetap biru. Kemarau mungkin lebih panjang tahun ini.", "{nama} melihat sumur makin dalam. \"Kita harus berhemat,\" katanya."], "Hemat air, simpan gaplek, dan buat embung atau sumur dalam."),
   "bahaya": _P("Kemarau Panjang!", ["Sawah retak dan sungai tinggal genangan. Setiap tetes air dan butir padi sangat berharga.", "Daun-daun pisang menguning. Kemarau panjang benar-benar datang."], "Utamakan air dan pangan. Kurangi pekerjaan berat di siang hari."),
   "reda": _P("Mendung Datang", ["Mendung tebal muncul dari selatan. Kemarau panjang akhirnya hampir usai!", "Hujan pertama setelah kemarau panjang. Semua menangis haru dan tertawa."])}},
}

log_ancaman_v140 = {
 "babi_hutan_jejak": ["Hari {hari}: Tanah teraduk dan jejak babi hutan terlihat di tepi hutan.", "Hari {hari}: {nama} menemukan bekas moncong babi hutan di pematang sawah."],
 "babi_hutan_mendekat": ["Hari {hari}: Suara dengusan babi hutan makin dekat. Penduduk bergegas pulang.", "Hari {hari}: Semak bambu bergoyang. {nama} cepat-cepat pulang membawa obor."],
 "babi_hutan_mengintai": ["Hari {hari}: Babi hutan hanya mengendus di tepi hutan malam ini.", "Hari {hari}: Babi hutan mondar-mandir di batas hutan, lalu pergi sendiri."],
 "babi_hutan_usai": ["Hari {hari}: Fajar menyingsing. Babi hutan sudah kembali ke hutan."],
 "babi_hutan_serang": ["Hari {hari}: Babi hutan menyeruduk {nama}! Kesehatannya turun {jumlah}.", "Hari {hari}: {nama} terjatuh diseruduk babi hutan di pematang. Kesehatannya turun {jumlah}."],
 "babi_hutan_rusak_ladang": ["Hari {hari}: Babi hutan mengobrak-abrik ladang {tanaman}. Tanamannya rusak.", "Hari {hari}: Pagi ini ladang {tanaman} berantakan. Babi hutan berpesta semalam."],
 "babi_hutan_diusir": ["Hari {hari}: Cahaya obor membuat babi hutan ragu. Ia berbalik ke hutan.", "Hari {hari}: Pagar bambu menghalangi babi hutan. Ia mendengus kesal lalu pergi."],
 "pos_ronda_usir": ["Hari {hari}: Dari Pos ronda, {nama} memukul kentongan. Babi hutan lari ke hutan.", "Hari {hari}: Tong-tong-tong! Kentongan {nama} membuat babi hutan kabur terbirit-birit."],
 "monyet_mencuri": ["Hari {hari}: Seekor monyet menggondol {jumlah} {sumber_daya} dari Gudang!", "Hari {hari}: Monyet-monyet berpesta jagung di tegalan. {nama} hanya bisa geleng-geleng."],
 "monyet_diusir": ["Hari {hari}: {nama} memukul kentongan, dan kawanan monyet kabur ke pohon kelapa.", "Hari {hari}: Orang-orangan sawah bergoyang ditiup angin. Monyet-monyet ragu dan pergi."],
 "ular_terlihat": ["Hari {hari}: {nama} melihat ular sawah melintas di pematang dan memberinya jalan.", "Hari {hari}: Ada ular di tumpukan jerami. Penduduk menunggu ia pergi sendiri."],
 "ular_menggigit": ["Hari {hari}: {nama} tergigit ular saat menyiangi sawah. {nama2} segera membebat lukanya dan membawanya istirahat.", "Hari {hari}: Kaki {nama} digigit ular kecil. Untung tidak berbisa, tapi ia harus istirahat."],
 "macan_jejak": ["Hari {hari}: Ada jejak kucing besar di tepi hutan jati. Kambing-kambing gelisah."],
 "macan_diusir": ["Hari {hari}: Kentongan bertalu-talu dari Pos ronda. Macan tutul jawa mundur ke dalam hutan tanpa ada yang terluka.", "Hari {hari}: {nama} mengayunkan obor dan memukul kentongan. Sang macan menatap sebentar, lalu menghilang ke hutan."],
 "longsor": ["Hari {hari}: Tanah di lereng longsor dan menimbun sebagian {bangunan}. Penduduk gotong royong membersihkannya.", "Hari {hari}: Longsor kecil menutup jalan setapak ke hutan. Untung tidak ada yang terluka."],
 "banjir_kiriman": ["Hari {hari}: Air bah kiriman dari hulu datang tiba-tiba, padahal di desa tidak hujan! Sawah tepi sungai tergenang."],
 "angin_kencang": ["Hari {hari}: Angin kencang menerbangkan atap rumbia {bangunan}. Kondisinya turun sedikit.", "Hari {hari}: Angin menderu seharian. Pekerjaan di luar jadi lebih lambat."],
 "wereng": ["Hari {hari}: Wereng menyerang padi di sawah. Hasil panen kali ini berkurang."],
 "gagal_panen": ["Hari {hari}: Sawah tanpa irigasi gagal panen karena kemarau. Hanya sedikit gabah yang bisa diselamatkan."],
 "kebakaran_ilalang": ["Hari {hari}: Ilalang kering di tepi desa terbakar! {nama} dan {nama2} memadamkannya dengan ranting basah dan ember."],
}

event_lokal = [
 _EV("banjir_kiriman", "Banjir Kiriman", "Di desa tidak hujan, tapi sungai tiba-tiba naik dan keruh. Rupanya hujan deras turun di hulu!", [
   _C("Angkat bibit dan karung ke rumah panggung", {"energi": -10}, "Semua barang naik ke tempat tinggi tepat waktu. Air lewat, dan penduduk tertawa lega sambil berlumpur."),
   _C("Perkuat tanggul dengan karung tanah", {"energi": -10, "kayu": -5}, "Tanggul tanah bertahan. Air hanya menggenangi sedikit sawah tepi sungai."),
   _C("Mengungsi dulu ke bukit", {"pertumbuhan_ladang": -1, "suasana_hati": -3}, "Penduduk menunggu air surut di bukit. Sawah tepi sungai harus ditanami ulang.")], "alam", ["hujan"]),
 _EV("longsor", "Longsor di Lereng", "Hujan tiga hari tiga malam membuat lereng bukit bergeser. Tanah dan batu menutup jalan ke hutan.", [
   _C("Gotong royong membersihkan jalan", {"energi": -15, "batu": 4}, "Semua turun tangan membawa cangkul dan pikulan. Jalan terbuka, dan batunya bisa dipakai membangun."),
   _C("Tanam bambu dan buat terasering", {"kayu": -8, "suasana_hati": 3}, "Rumpun bambu dan undakan tanah dibuat di lereng. Lain kali tanahnya lebih kuat menahan hujan."),
   _C("Cari jalan memutar dulu", {"hari_kerja_hilang": 1}, "Penduduk berjalan memutar ke hutan. Lebih lama, tapi aman.")], "alam", ["hujan"]),
 _EV("ular_di_sawah", "Ular di Sawah", "Seekor ular sawah melingkar di pematang tempat {nama} biasa bekerja. Ia diam saja, menatap dengan tenang.", [
   _C("Beri jalan dan tunggu ia pergi", {"energi": -3}, "Ular itu pelan-pelan masuk ke semak. Kata para tetua, ular sawah membantu memakan tikus."),
   _C("Babat ilalang di sekitar sawah", {"energi": -10, "suasana_hati": 2}, "Pematang kini bersih dan terang. Ular tidak lagi suka berteduh di dekat sawah."),
   _C("Biarkan saja dan lanjut bekerja", {"kesehatan_satu": -8}, "{nama} terlalu dekat dan tergigit di betis. Untung ular sawah tidak berbisa, tapi ia harus istirahat.")], "satwa", ["hujan", "labuh"]),
 _EV("hujan_pertama", "Hujan Pertama", "Setelah kemarau panjang, tetes pertama jatuh di tanah yang retak. Bau tanah basah memenuhi desa!", [
   _C("Menari dan main hujan bersama", {"suasana_hati": 10, "energi": -5}, "Anak-anak dan orang tua menari di halaman. Hari ini semua orang basah dan bahagia."),
   _C("Tampung air hujan di tempayan", {"air": 5, "energi": -5}, "Semua tempayan, kendi, dan ember penuh air hujan. Sumur pun ikut terisi."),
   _C("Mulai semai bibit padi", {"pertumbuhan_ladang": 1}, "Bibit padi disemai tepat saat tanah melunak. Sawah akan siap ditanami lebih cepat.")], "alam", ["labuh"]),
 _EV("panen_padi_raya", "Panen Padi Raya", "Sawah menguning merata dari ujung ke ujung. Semua penduduk turun membawa ani-ani dan tampah!", [
   _C("Panen serentak dan simpan di lumbung", {"gandum": 5, "energi": -10}, "Ikatan padi menumpuk di lumbung. Kemarau tahun ini tidak terlalu menakutkan."),
   _C("Panen sambil bernyanyi dan makan bersama", {"gandum": 3, "suasana_hati": 8, "energi": -5}, "Lagu panen terdengar dari setiap petak. Nasi liwet dan sambal dimakan beralas daun pisang."),
   _C("Sisihkan untuk benih dan tetangga", {"suasana_hati": 5}, "Gabah terbaik disimpan untuk benih, sisanya dibagi rata. Rasa syukur memenuhi desa.")], "panen", ["mareng"]),
 _EV("monyet_pencuri", "Monyet Pencuri", "Sekawanan monyet ekor panjang turun dari pohon kelapa dan mengincar pisang serta jagung di dekat Gudang!", [
   _C("Pukul kentongan dan usir bersama", {"energi": -8}, "Tong-tong-tong! Monyet-monyet kabur ke pohon sambil berteriak protes. Pisang selamat."),
   _C("Pasang orang-orangan dan tutup Gudang", {"kayu": -5, "suasana_hati": 2}, "Orang-orangan bertopi caping berdiri gagah. Monyet-monyet ragu mendekat."),
   _C("Biarkan saja, nanti pergi sendiri", {"suasana_hati": -2}, "Monyet-monyet berpesta pisang di kebun sampai kenyang. Untung pintu Gudang tertutup rapat.")], "satwa", ["mareng", "kemarau"]),
 _EV("dbd_pancaroba", "Nyamuk Demam Berdarah", "Genangan air di kaleng bekas dan tempayan terbuka jadi sarang jentik nyamuk. Dua penduduk demam tinggi!", [
   _C("Kerja bakti 3M: menguras, menutup, mengubur", {"energi": -10, "kesehatan": 5}, "Tempayan dikuras, ditutup, dan barang bekas dikubur. Jentik hilang, dan yang sakit dirawat dengan banyak minum."),
   _C("Rawat yang sakit dengan air dan jus jambu", {"makanan": -3, "kesehatan": 3}, "Yang demam banyak minum dan istirahat. Pelan-pelan suhu tubuh mereka turun."),
   _C("Tunggu saja", {"kesehatan": -8, "suasana_hati": -3}, "Nyamuk makin banyak. Ingat 3M: menguras, menutup, dan mengubur supaya jentik tidak berkembang.")], "kesehatan", ["hujan", "labuh"]),
 _EV("ispa_asap", "Asap Kemarau", "Asap dari pembakaran ilalang di bukit seberang terbawa angin. Beberapa penduduk batuk-batuk dan matanya perih.", [
   _C("Pakai kain basah penutup hidung", {"energi": -3, "kesehatan": 3}, "Semua bekerja dengan kain basah di wajah. Batuk berkurang sampai asap menipis."),
   _C("Kurangi kerja di luar sampai asap reda", {"hari_kerja_hilang": 1, "kesehatan": 5}, "Penduduk beristirahat di rumah. Paru-paru lega, besok kerja lagi."),
   _C("Tetap bekerja seperti biasa", {"kesehatan": -6}, "Pekerjaan jalan terus, tapi batuk terdengar di mana-mana. Jangan bakar sampah sembarangan ya.")], "kesehatan", ["kemarau"]),
 _EV("kebakaran_ilalang", "Ilalang Terbakar", "Angin kering membawa percikan api ke padang ilalang di tepi desa. Asap mulai mengepul!", [
   _C("Padamkan dengan ranting basah dan ember", {"air": -8, "energi": -10}, "Api padam sebelum mencapai Gubuk. Semua wajah belepotan jelaga, tapi tersenyum."),
   _C("Buat sekat bakar dengan cangkul", {"energi": -12, "suasana_hati": 2}, "Jalur tanah kosong dibuat mengelilingi desa. Api berhenti di sana dengan sendirinya."),
   _C("Biarkan padam sendiri", {"kesehatan_bangunan": -10, "suasana_hati": -3}, "Api sempat menjilat pagar bambu sebelum padam. Tukang harus memperbaikinya.")], "bahaya", ["kemarau"]),
 _EV("sumur_menyusut", "Sumur Menyusut", "Timba harus diturunkan makin dalam. Air sumur tinggal sedikit di dasar.", [
   _C("Gali sumur lebih dalam bersama", {"energi": -12, "air": 4}, "Setelah menggali seharian, mata air baru memancar. Semua bersorak."),
   _C("Ambil air bergantian ke mata air di bukit", {"energi": -8, "air": 3}, "Penduduk berjalan berbaris membawa kendi. Jauh, tapi airnya jernih sekali."),
   _C("Hemat air sebisanya", {"suasana_hati": -2}, "Mandi cukup sekali sehari. Semua berhemat sambil menunggu hujan.")], "alam", ["kemarau"]),
 _EV("angin_mareng", "Angin Kencang Mareng", "Angin mareng bertiup kencang dari timur. Pohon kelapa meliuk dan jemuran gabah hampir terbang!", [
   _C("Amankan jemuran gabah bersama", {"energi": -8}, "Tikar jemuran digulung cepat-cepat. Gabah selamat, dan rambut semua orang berantakan."),
   _C("Ikat atap dengan tali sabut", {"kayu": -5, "kesehatan_bangunan": 5}, "Atap terikat kencang. Angin hanya bisa bermain dengan daun kering."),
   _C("Main layangan saja!", {"suasana_hati": 8}, "Langit desa penuh layangan warna-warni. Kerja ditunda sebentar demi tawa anak-anak.")], "alam", ["mareng", "labuh"]),
 _EV("tanam_serentak", "Tanam Serentak", "Tetua desa mengusulkan semua keluarga menanam padi di hari yang sama, supaya hama tidak berpindah-pindah.", [
   _C("Setuju, tanam serentak!", {"energi": -10, "pertumbuhan_ladang": 1}, "Sawah hijau serempak dari ujung ke ujung. Wereng bingung mau ke mana."),
   _C("Tanam bergantian sesuai giliran air", {"energi": -5}, "Air dibagi adil seperti subak. Tidak ada yang berebut di saluran."),
   _C("Tanam kapan sempat saja", {"suasana_hati": 1}, "Setiap keluarga menanam sendiri-sendiri. Lebih santai, walau hasilnya biasa saja.")], "panen", ["labuh"]),
 _EV("gotong_royong", "Gotong Royong", "Pak Kamituwa memukul kentongan pagi-pagi: \"Hari Minggu kita kerja bakti!\" Ada jalan becek dan atap balai yang bocor.", [
   _C("Semua ikut kerja bakti", {"energi": -10, "kesehatan_bangunan": 10, "suasana_hati": 5}, "Jalan diratakan, atap ditambal, dan ibu-ibu membawa gorengan. Desa jadi rapi dan semua makin akrab."),
   _C("Kerja bakti setengah hari saja", {"energi": -5, "kesehatan_bangunan": 5}, "Pekerjaan penting selesai sebelum tengah hari. Sisanya dilanjutkan minggu depan."),
   _C("Tunda dulu, banyak kerja lain", {"suasana_hati": -2}, "Kerja bakti ditunda. Beberapa orang sedikit kecewa, tapi mengerti.")], "sosial", []),
 _EV("kenduri_panen", "Kenduri Syukuran Panen", "Panen tahun ini cukup. Penduduk ingin mengadakan kenduri kecil untuk bersyukur bersama.", [
   _C("Kenduri dengan tumpeng dan doa bersama", {"makanan": -5, "suasana_hati": 10}, "Tumpeng nasi kuning dibagi rata di pendopo. Doa, tawa, dan cerita mengalir sampai malam."),
   _C("Bancakan sederhana beralas daun pisang", {"makanan": -2, "suasana_hati": 6}, "Nasi dan lauk dibungkus daun pisang dan dibagikan ke setiap rumah. Sederhana tapi hangat."),
   _C("Cukup ucapkan syukur di rumah masing-masing", {"suasana_hati": 2}, "Setiap keluarga bersyukur dengan caranya sendiri. Desa tenang dan damai.")], "sosial", ["mareng"]),
 _EV("ronda_malam", "Giliran Ronda Malam", "Sudah lama tidak ada ronda. Beberapa penduduk mengusulkan jadwal ronda bergiliran di pos ronda.", [
   _C("Buat jadwal ronda dan kentongan", {"energi": -8, "suasana_hati": 4}, "Malam-malam kini ditemani bunyi kentongan dan obrolan peronda sambil makan singkong rebus."),
   _C("Ronda sambil main catur dan ngopi", {"energi": -5, "suasana_hati": 6}, "Pos ronda jadi tempat paling ramai di malam hari. Desa terasa aman dan akrab."),
   _C("Tidak usah, desa sedang aman", {"energi": 3}, "Semua tidur nyenyak. Semoga malam tetap tenang.")], "sosial", []),
 _EV("hari_pasar", "Hari Pasaran", "Hari ini pasaran Legi! Pedagang dari desa-desa sekitar datang membawa dagangan ke lapangan dekat pendopo.", [
   _C("Tukar padi dengan peralatan", {"gandum": -5, "alat": 2}, "Seorang pandai besi menukar dua cangkul baru dengan sekarung gabah. Kesepakatan yang bagus!"),
   _C("Jual gorengan dan kopi", {"makanan": -3, "suasana_hati": 6}, "Gorengan dan kopi tubruk desa laris manis. Penduduk pulang dengan cerita lucu dari pasar."),
   _C("Jalan-jalan dan lihat-lihat saja", {"suasana_hati": 3}, "Penduduk berkeliling pasar, mencicipi jajanan, dan pulang dengan hati senang.")], "pasar", []),
 _EV("tamu_desa_sebelah", "Tamu dari Desa Sebelah", "Rombongan kecil dari desa sebelah datang bersilaturahmi, membawa sekeranjang rambutan.", [
   _C("Jamu dengan makan siang", {"makanan": -4, "suasana_hati": 8}, "Tamu dijamu sayur asem dan ikan goreng. Mereka berjanji mengundang balik saat panen nanti."),
   _C("Tukar bibit dan cerita", {"energi": -3, "progres_riset": 5}, "Tamu membagikan cara menanam padi di lahan miring. Ilmu baru untuk desa!"),
   _C("Sambut dengan teh hangat saja", {"suasana_hati": 3}, "Obrolan ringan sambil minum teh. Silaturahmi tetap terasa hangat.")], "sosial", []),
]

flora = {
 "kelapa": {"nama": "Pohon kelapa", "deskripsi": "Pohon serbaguna: buahnya jadi santan dan minyak, sabutnya jadi tali, daunnya jadi atap dan janur.", "hasil": ["kelapa", "minyak", "sabut", "kayu"], "musim": []},
 "pisang": {"nama": "Pohon pisang", "deskripsi": "Cepat berbuah dan daunnya jadi pembungkus makanan. Kesukaan monyet!", "hasil": ["makanan"], "musim": []},
 "bambu": {"nama": "Rumpun bambu", "deskripsi": "Tumbuh cepat di musim hujan. Bahan pagar, gubuk, obor, dan kentongan. Akarnya menahan tanah dari longsor.", "hasil": ["bambu"], "musim": ["hujan"]},
 "jati": {"nama": "Pohon jati", "deskripsi": "Kayunya kuat dan awet. Daunnya meranggas saat kemarau.", "hasil": ["kayu"], "musim": []},
 "beringin": {"nama": "Pohon beringin", "deskripsi": "Rindang dan sejuk, tempat penduduk beristirahat dan bercerita.", "hasil": [], "musim": []},
 "mangga": {"nama": "Pohon mangga", "deskripsi": "Berbuah lebat saat pancaroba labuh.", "hasil": ["buah"], "musim": ["labuh"]},
 "rambutan": {"nama": "Pohon rambutan", "deskripsi": "Buahnya merah berambut, ranum di musim hujan.", "hasil": ["buah"], "musim": ["hujan"]},
 "kamboja": {"nama": "Pohon kamboja", "deskripsi": "Bunganya harum dan biasa ditanam di makam.", "hasil": [], "musim": []},
 "padi": {"nama": "Padi", "deskripsi": "Ditanam di sawah, butuh banyak air. Berhenti tumbuh saat kemarau kecuali sawahnya beririgasi.", "hasil": ["gandum"], "musim": ["hujan", "labuh"]},
 "jagung": {"nama": "Jagung", "deskripsi": "Tanaman tegalan yang cukup tahan kering.", "hasil": ["makanan"], "musim": []},
 "singkong": {"nama": "Singkong", "deskripsi": "Lama tumbuh tapi tahan kemarau. Bisa dijemur menjadi gaplek.", "hasil": ["makanan"], "musim": []},
 "ubi": {"nama": "Ubi jalar", "deskripsi": "Cepat dipanen dan manis, cocok di tegalan.", "hasil": ["makanan"], "musim": []},
 "kopi": {"nama": "Kopi", "deskripsi": "Ditanam di kebun lereng. Bijinya dijemur dan disangrai untuk kopi tubruk.", "hasil": ["kopi"], "musim": []},
}

fauna = {
 "ternak": {
  "ayam": {"nama": "Ayam kampung", "deskripsi": "Bertelur setiap hari dan membangunkan desa dengan kokoknya."},
  "bebek": {"nama": "Bebek", "deskripsi": "Suka berbaris di sawah dan memakan wereng serta keong."},
  "kambing": {"nama": "Kambing", "deskripsi": "Pemakan rumput yang lincah. Perlu kandang supaya aman dari macan tutul."},
  "kerbau": {"nama": "Kerbau", "deskripsi": "Teman setia membajak sawah. Suka berkubang di lumpur saat siang terik."},
  "sapi": {"nama": "Sapi", "deskripsi": "Tenang dan kuat, membantu menarik gerobak."}},
 "satwa_liar": {
  "rusa": {"nama": "Rusa", "deskripsi": "Berlari lincah di tepi hutan jati."},
  "ikan": {"nama": "Ikan sungai", "deskripsi": "Wader dan nila melimpah saat musim hujan, menyusut saat kemarau."},
  "burung_pipit": {"nama": "Burung pipit", "deskripsi": "Kecil dan riuh, suka mematuki padi yang menguning."},
  "kutilang": {"nama": "Burung kutilang", "deskripsi": "Kicaunya merdu di pagi hari."},
  "bangau": {"nama": "Bangau putih", "deskripsi": "Berjalan anggun di sawah, mencari katak dan ikan kecil."},
  "kupu_kupu": {"nama": "Kupu-kupu", "deskripsi": "Beterbangan di antara bunga liar setelah hujan."},
  "kunang_kunang": {"nama": "Kunang-kunang", "deskripsi": "Berkelip di sawah pada malam yang lembap."},
  "anjing_kampung": {"nama": "Anjing kampung", "deskripsi": "Sahabat penduduk yang menggonggong saat babi hutan mendekat."}},
 "ancaman": {
  "babi_hutan": {"nama": "Babi hutan", "deskripsi": "Ancaman malam utama. Mengobrak-abrik sawah dan tegalan; takut pada pagar bambu, obor, dan kentongan."},
  "monyet": {"nama": "Monyet ekor panjang", "deskripsi": "Mencuri pisang, jagung, dan isi Gudang di siang hari."},
  "ular": {"nama": "Ular sawah", "deskripsi": "Muncul di sawah saat basah. Beri jalan, jangan dipegang."},
  "macan_tutul": {"nama": "Macan tutul jawa", "deskripsi": "Langka dan dilindungi. Diusir dengan kentongan dan obor, tidak diburu."},
  "tikus_sawah": {"nama": "Tikus sawah", "deskripsi": "Suka berpesta gabah di lumbung."},
  "wereng": {"nama": "Wereng cokelat", "deskripsi": "Hama kecil yang membuat padi menguning sebelum waktunya."}},
}

bangunan_lokal = {
 "sawah": {"nama": "Sawah", "tooltip": "Petak berlumpur untuk menanam padi. Subur di musim hujan; butuh irigasi saat kemarau.", "id_kode": "ladang"},
 "tegalan": {"nama": "Tegalan", "tooltip": "Ladang kering untuk jagung, singkong, dan ubi. Tetap tumbuh saat kemarau.", "id_kode": "ladang"},
 "gubuk_bambu": {"nama": "Gubuk bambu", "tooltip": "Rumah sederhana berdinding anyaman bambu dan beratap rumbia.", "id_kode": "gubuk"},
 "rumah_panggung": {"nama": "Rumah panggung", "tooltip": "Rumah bertiang tinggi: aman dari banjir dan ular, sejuk di siang terik.", "id_kode": "rumah_kayu"},
 "lumbung_padi": {"nama": "Lumbung padi", "tooltip": "Lumbung berkaki tinggi supaya gabah aman dari tikus dan lembap.", "id_kode": "lumbung"},
 "pendopo": {"nama": "Balai desa (pendopo)", "tooltip": "Bangunan terbuka beratap joglo, tempat musyawarah, kenduri, dan latihan gamelan.", "id_kode": "balai_desa"},
 "langgar": {"nama": "Langgar / surau", "tooltip": "Tempat ibadah kecil yang tenang. Anak-anak belajar mengaji di sore hari.", "id_kode": None},
 "pagar_bambu": {"nama": "Pagar bambu", "tooltip": "Bilah bambu berjajar rapat. Babi hutan malas melewatinya.", "id_kode": "pagar"},
 "obor": {"nama": "Obor bambu (oncor)", "tooltip": "Cahaya kecil yang membuat babi hutan dan macan tutul ragu mendekat.", "id_kode": "obor"},
 "orang_orangan_sawah": {"nama": "Orang-orangan sawah", "tooltip": "Bertopi caping dan berbaju lusuh. Mengusir pipit dan membuat monyet ragu.", "id_kode": None},
 "pos_ronda": {"nama": "Pos ronda + kentongan", "tooltip": "Tempat peronda berjaga. Kentongan dipukul untuk mengusir babi hutan dan macan tutul.", "id_kode": "menara_jaga"},
 "tanggul": {"nama": "Tanggul", "tooltip": "Gundukan tanah berbatu di tepi sungai. Menahan banjir dan banjir kiriman.", "id_kode": None},
 "terasering": {"nama": "Terasering", "tooltip": "Sawah berundak di lereng. Mengurangi risiko longsor.", "id_kode": None},
 "embung": {"nama": "Embung", "tooltip": "Kolam penampung air hujan untuk cadangan kemarau.", "id_kode": None},
 "sumur_dalam": {"nama": "Sumur dalam", "tooltip": "Sumur yang digali lebih dalam supaya tetap berair saat kemarau.", "id_kode": None},
 "sekat_bakar": {"nama": "Sekat bakar", "tooltip": "Jalur tanah kosong yang menghentikan api ilalang di kemarau.", "id_kode": None},
 "kandang_ayam": {"nama": "Kandang ayam", "tooltip": "Rumah kecil untuk ayam kampung. Telurnya menambah makanan.", "id_kode": None},
 "kandang_bebek": {"nama": "Kandang bebek", "tooltip": "Bebek dilepas ke sawah pagi hari untuk memakan wereng.", "id_kode": None},
 "kandang_kambing": {"nama": "Kandang kambing", "tooltip": "Kandang panggung dari bambu. Aman dari macan tutul di malam hari.", "id_kode": None},
 "kandang_kerbau": {"nama": "Kandang kerbau", "tooltip": "Kandang besar untuk kerbau pembajak sawah, lengkap dengan kubangan lumpur.", "id_kode": None},
 "kebun_kopi": {"nama": "Kebun kopi", "tooltip": "Kebun di lereng sejuk. Biji kopi dijemur lalu disangrai.", "id_kode": None},
}

penyakit_musiman = {
 "diare": {"nama": "Diare", "musim": ["hujan"], "gejala": "Sakit perut dan bolak-balik ke jamban.",
  "edukasi": "Selalu minum air yang sudah direbus, cuci tangan pakai sabun sebelum makan, dan tutup makanan dari lalat.",
  "mulai": ["Hari {hari}: {nama} sakit perut sejak pagi. Sepertinya ia minum air sungai tanpa direbus."],
  "sembuh": ["Hari {hari}: {nama} sudah pulih setelah banyak minum oralit dan air matang."]},
 "dbd": {"nama": "Demam berdarah (DBD)", "musim": ["hujan", "labuh"], "gejala": "Demam tinggi mendadak, pegal, dan lemas.",
  "edukasi": "Lakukan 3M: Menguras tempat air, Menutup tempayan, dan Mengubur barang bekas yang bisa menampung air. Yang demam harus banyak minum dan beristirahat.",
  "mulai": ["Hari {hari}: {nama} demam tinggi setelah digigit nyamuk. Desa perlu kerja bakti 3M!"],
  "sembuh": ["Hari {hari}: Demam {nama} sudah turun. Tempayan di rumahnya kini selalu tertutup."]},
 "ispa": {"nama": "ISPA (batuk & sesak)", "musim": ["kemarau"], "gejala": "Batuk, tenggorokan gatal, dan napas sesak karena asap dan debu.",
  "edukasi": "Jangan bakar sampah atau ilalang sembarangan, tutup hidung dengan kain basah saat berasap, dan banyak minum air putih.",
  "mulai": ["Hari {hari}: {nama} batuk-batuk karena asap pembakaran ilalang."],
  "sembuh": ["Hari {hari}: Napas {nama} sudah lega lagi. Ia berjanji tidak membakar sampah sembarangan."]},
 "masuk_angin": {"nama": "Masuk angin", "musim": ["mareng", "labuh"], "gejala": "Pegal, perut kembung, dan bersin saat cuaca berubah-ubah.",
  "edukasi": "Tidur cukup, makan teratur, minum wedang jahe hangat, dan jangan kehujanan terlalu lama.",
  "mulai": ["Hari {hari}: {nama} masuk angin karena cuaca pancaroba. Badannya pegal-pegal."],
  "sembuh": ["Hari {hari}: Setelah dikerok dan minum wedang jahe, {nama} segar kembali."]},
}

ALIAS_ID_V140 = {
 "_catatan": "id_lama -> id_baru (spec docs/RISET-INDONESIA.md §4). Id lama TIDAK dihapus: entri lama tetap ada dengan teks Indonesia. Kode boleh memakai id baru lewat pemetaan ini.",
 "musim": {"semi": "hujan", "panas": "kemarau", "gugur": "mareng", "dingin": "kemarau"},
 "event": {"badai": "angin_kencang", "hewan_buas": "babi_hutan", "serigala_malam": "jejak_macan", "musim_dingin_keras": "kemarau_panjang",
           "embun_beku": "serangan_wereng", "pilek_musim_gugur": "masuk_angin_pancaroba", "hama_gudang": "tikus_lumbung", "wabah": "diare",
           "festival_desa": "bersih_desa", "dingin_ekstrem": "malam_bediding", "badai_salju": "angin_kering_berdebu", "serigala_lapar": "babi_hutan_kehausan",
           "malam_terpanjang": "malam_purnama_kemarau", "angin_gugur": "angin_mareng", "kelinci_ladang": "burung_pipit", "bunga_semi": "bunga_liar_hujan",
           "gelombang_panas": "panas_terik"},
 "hewan": {"serigala": "babi_hutan"},
 "penyebab_kondisi": {"dingin": "cuaca"},
 "key_teks": {
  "peringatan_dini.ancaman_serigala": "peringatan_dini.ancaman_babi_hutan",
  "peringatan_dini.ancaman_dingin_ekstrem": "peringatan_dini.ancaman_bediding (isi tetap di key lama)",
  "musim_pembuka.musim_semi": "musim_pembuka.musim_hujan", "musim_pembuka.musim_gugur": "musim_pembuka.musim_mareng",
  "musim_pembuka.musim_dingin": "musim_pembuka.musim_kemarau", "musim_pembuka.musim_panas": "musim_pembuka.musim_kemarau (atau musim_labuh)",
  "musim_pembuka.musim_semi_hujan": "musim_pembuka.musim_hujan_deras",
  "musim_pembuka.musim_gugur_menuju_dingin": "musim_pembuka.musim_mareng_menuju_kemarau",
  "musim_pembuka.musim_gugur_stok_kurang": "musim_pembuka.musim_mareng_stok_kurang",
  "musim_pembuka.musim_gugur_syukur": "musim_pembuka.musim_mareng_syukur",
  "musim_pembuka.musim_dingin_kayu_bakar": "musim_pembuka.musim_hujan_kayu_bakar",
  "musim_pembuka.musim_tahun_baru": "musim_pembuka.musim_tahun_baru_hujan",
  "log_ancaman.serigala_jejak": "log_ancaman.babi_hutan_jejak", "log_ancaman.serigala_mendekat": "log_ancaman.babi_hutan_mendekat",
  "log_ancaman.serangan_serigala": "log_ancaman.babi_hutan_serang", "log_ancaman.serigala_usai": "log_ancaman.babi_hutan_usai",
  "log_ancaman.diusir": "log_ancaman.babi_hutan_diusir", "log_ancaman.kayu_bakar_habis": "musim_pembuka.musim_hujan_api_padam",
  "bangunan_ancaman.bangunan_menara_jaga": "bangunan_lokal.pos_ronda (id kode tetap menara_jaga)",
  "bangunan_ancaman.bangunan_menara_jaga.usir": "log_ancaman.pos_ronda_usir",
  "pasar.musim_dingin": "pasar.musim_kemarau (isi tetap di key lama)",
  "pasar.pesan_fluktuasi.musim_dingin_pangan": "musim_kemarau_pangan", "pasar.pesan_fluktuasi.musim_dingin_gandum": "musim_kemarau_padi",
  "pasar.pesan_fluktuasi.semi_kayu": "hujan_kayu", "pasar.pesan_fluktuasi.panas_makanan": "mareng_makanan",
  "log_jadwal.tidur_di_luar_dingin": "log_jadwal.tidur_di_luar_hujan (isi tetap di key lama)",
  "penduduk_sakit.per_penyebab.dingin": "penyebab cuaca", "penduduk_meninggal.per_penyebab.dingin": "penyebab cuaca", "pemakaman.per_penyebab.dingin": "penyebab cuaca",
  "quest_awal.q09_siap_dingin": "q09 Siap Hadapi Kemarau (id tetap)"},
 "sumber_daya": {"gandum": "gandum (label tampilan: Padi; id tetap)"},
}

TXT_TEMA_NUSANTARA = {
 "_catatan": "Isi path untuk tema.js THEMES.indonesia.TXT[k][0] (format [pathTEKS, cadangan]). Placeholder sama dengan cadangan yang sudah ada.",
 "tahun_baru": "musim_pembuka.musim_tahun_baru_hujan.variasi", "musim_mulai": "musim_pembuka.musim_umum.variasi",
 "hujan": "musim_pembuka.musim_hujan_deras.variasi", "hujan_pertama": "musim_pembuka.musim_labuh_hujan_pertama.variasi",
 "menuju_sulit": "musim_pembuka.musim_mareng_menuju_kemarau.variasi", "stok_kurang": "musim_pembuka.musim_mareng_stok_kurang.variasi",
 "syukur": "musim_pembuka.musim_mareng_syukur.variasi", "kayu_bakar": "musim_pembuka.musim_hujan_kayu_bakar.variasi",
 "api_padam": "musim_pembuka.musim_hujan_api_padam.variasi", "sulit_mulai": "musim_pembuka.musim_kemarau.variasi",
 "jejak": "log_ancaman.babi_hutan_jejak", "mendekat": "log_ancaman.babi_hutan_mendekat", "mengintai": "log_ancaman.babi_hutan_mengintai",
 "usai": "log_ancaman.babi_hutan_usai", "serang": "log_ancaman.babi_hutan_serang", "rusak_ladang": "log_ancaman.babi_hutan_rusak_ladang",
 "diusir": "log_ancaman.babi_hutan_diusir", "menara": "log_ancaman.pos_ronda_usir",
 "musim_hujan": "musim_pembuka.musim_hujan.variasi", "musim_mareng": "musim_pembuka.musim_mareng.variasi",
 "musim_labuh": "musim_pembuka.musim_labuh.variasi", "kemarau_panjang": "musim_pembuka.musim_kemarau_panjang.variasi",
}

PERLU_DIUBAH_DI_KODE = [
 "tema.js THEMES.indonesia.TXT: isi path [0] sesuai meta.txt_tema_nusantara (saat ini null -> cadangan).",
 "tema.js EVENT_DISABLE: event lama (serigala_malam, musim_dingin_keras, embun_beku, pilek_musim_gugur, bunga_semi, angin_gugur, jamur_hutan, burung_migrasi, dingin_ekstrem, badai_salju, malam_terpanjang, serigala_lapar, kelinci_ladang, harga_pangan_melambung) sudah bernarasi Nusantara di v1.4.0, jadi boleh diaktifkan lagi. Tambah EVENT_SEASON_ALIAS dingin -> kemarau (event_musiman ber-musim 'dingin' kini bertema kemarau/bediding).",
 "Pool event baru: event_lokal[] (format = event_musiman; musim = id musim baru, [] = semua musim). Event kesehatan/satwa sebaiknya dibatasi per musim; jejak macan tutul (serigala_malam/ancaman_macan_tutul) mulai tahun ke-2, macan DIUSIR bukan dibunuh.",
 "Peringatan dini baru: peringatan_dini.ancaman_babi_hutan, ancaman_monyet, ancaman_ular, ancaman_macan_tutul, ancaman_longsor, ancaman_kemarau_panjang (struktur sama, musim pakai id baru).",
 "game.js: string hardcode/cadangan bertema serigala/dingin (\"Seekor serigala menerkam…\", \"Cahaya obor membuat serigala ragu\", \"Dari Menara jaga… Serigala lari\", \"Angin membeku malam ini…\", \"Angin beku sudah reda\", \"Lumbung penuh sebelum salju\", cadangan musim_pembuka 'Musim semi/dingin…', label 'Jejak serigala/Auman mendekat') -> ganti ke TX/TT berkunci baru atau kalimat Indonesia.",
 "game.js RES_LABEL bawaan gandum:'Gandum' -> pakai TEXT.meta.sumber_daya (gandum = 'Padi'); tambahkan label bambu, kelapa, minyak, sabut, kopi bila sumber daya itu ditambahkan ke balance.js.",
 "balance.js BUILDINGS nama & tech.js nama: Gubuk -> Gubuk bambu, Ladang -> Sawah/Tegalan, Lumbung -> Lumbung padi, Balai desa -> Balai desa (pendopo), Pagar -> Pagar bambu, Menara jaga -> Pos ronda; tech T04 Irigasi Sawah, T05 Gaplek & Ikan Asin, T10 Tanggul & Parit, T13 Caping & Kendi, T20 Bersih Desa (game.js sudah menimpa nama tech dari TEXT.teknologi).",
 "Emoji/aset musim dingin di jalur Nusantara: ❄️/🍂/🐺/🥶, assets cuaca_salju, tint_beku, vignette_beku, ASSETS.serigala -> pakai aset tropis (kemarau_tint, dust_overlay, rain_heavy_overlay, babi_hutan).",
 "Kunci TEXT berprefiks lama (musim_semi*, musim_gugur*, musim_dingin*, ancaman_serigala, ancaman_dingin_ekstrem, serigala_*, menara_jaga, pasar.musim_dingin, tidur_di_luar_dingin, per_penyebab.dingin) tetap dipakai kode; isinya sudah Indonesia. Pemetaan ke kunci baru: meta.alias_id_v140.key_teks.",
 "Pencapaian lewati_musim target 'dingin' (A04 'Kemarau Pertama'): game.js sudah menerima C.HARD_SEASON; target teks tetap 'dingin' (alias -> kemarau).",
 "penyebab kematian/sakit 'dingin' ditampilkan sebagai 'Cuaca buruk' (meta.penyebab_kondisi.dingin); id tetap.",
 "Penyakit musiman (penyakit_musiman.diare/dbd/ispa/masuk_angin): kait ke chillSickChance/sleepOutsideSick/ispa saat kemarau berasap; teks edukasi bisa tampil di tooltip sakit.",
]

KATA_TERLARANG = ["salju", "es", "beku", "membeku", "musim dingin", "dingin ekstrem", "hari paling dingin", "malam paling dingin", "kedinginan salju",
  "serigala", "perapian", "harimau", "musim gugur", "musim semi", "musim panas", "semi", "gugur", "gandum", "syal", "jaket", "mantel",
  "boneka salju", "wortel", "kelinci", "ceri", "apel", "anggur", "termometer", "lolongan", "auman serigala", "cerobong salju"]


def _resolve(node, p):
    if p.startswith("@"):
        m = [x for x in node if isinstance(x, dict) and x.get("id") == p[1:]]
        if len(m) != 1: raise SystemExit(f"UBAH_V140: id {p} tidak unik/tidak ada")
        return m[0]
    return node[int(p)] if isinstance(node, list) else node[p]

def terapkan_ubah(data, ubah):
    """Ganti teks tampilan lama (harus str & berbeda). Mengembalikan daftar {path, lama, baru} untuk patch."""
    hasil = []
    for path, baru in ubah.items():
        parts = path.split("/"); n = data
        for p in parts[:-1]: n = _resolve(n, p)
        k = int(parts[-1]) if isinstance(n, list) else parts[-1]
        lama = n[k]
        if not isinstance(lama, str) or not isinstance(baru, str): raise SystemExit(f"UBAH_V140 bukan teks: {path}")
        if lama == baru: raise SystemExit(f"UBAH_V140 tidak mengubah apa pun: {path}")
        n[k] = baru; hasil.append({"path": path, "lama": lama, "baru": baru})
    return hasil

def terapkan_patch_v140(data, patch):
    """Seperti terapkan_patch + op tambah_subkey (key baru di dalam bagian lama) & tambah_item_meta (item list meta)."""
    m = data["meta"]
    for sec, ent in patch["tambah_subkey"].items():
        for k, v in ent.items():
            if k in data[sec] and data[sec][k] != v: raise SystemExit(f"{sec}.{k} sudah ada")
            data[sec].setdefault(k, v)
    for sec, items in patch["tambah_item_meta"].items():
        ada = {x["id"] for x in m[sec]}
        for it in items:
            if it["id"] in ada: raise SystemExit(f"meta.{sec} id {it['id']} sudah ada")
            m[sec].append(it)
    return terapkan_patch(data, patch)

PATCH_V140 = {
 "_patch": {"versi_dari": "1.3.0", "versi_ke": "1.4.0", "sifat": "MENGUBAH teks tampilan lama (ubah_teks; id/key/angka tetap) + penambahan",
            "spec": "docs/RISET-INDONESIA.md §4, §6"},
 "tambah_item_meta": {"musim": [
   {"id": "hujan", "nama": "Musim Hujan", "pesan": "Hujan mulai rajin turun. Saatnya menanam padi di sawah!", "jawa": "Rendheng"},
   {"id": "mareng", "nama": "Pancaroba (Mareng)", "pesan": "Padi menguning dan angin mulai kering. Panen dan simpan bekal untuk kemarau.", "jawa": "Mareng"},
   {"id": "kemarau", "nama": "Musim Kemarau", "pesan": "Sawah tanpa irigasi berhenti tumbuh dan air menyusut. Musim paling berat!", "jawa": "Ketiga"},
   {"id": "labuh", "nama": "Pancaroba (Labuh)", "pesan": "Mendung mulai datang dan hujan pertama sudah dekat. Siapkan bibit!", "jawa": "Labuh"}]},
 "tambah_entri_meta": {
  "sumber_daya": {"bambu": "Bambu", "kelapa": "Kelapa", "minyak": "Minyak kelapa", "sabut": "Sabut kelapa", "kopi": "Kopi"},
  "hewan": {"monyet": "monyet", "ular": "ular sawah", "macan_tutul": "macan tutul jawa"},
  "bangunan_pertahanan": {"kentongan": "Kentongan", "orang_orangan_sawah": "Orang-orangan sawah", "tanggul": "Tanggul"},
  "placeholder": {"{tanaman}": "Nama tanaman di ladang/sawah (padi, jagung, singkong, ubi); isi lewat extra fill()"},
  "struktur_tambahan": {
   "event_lokal": "Daftar event bernuansa desa Indonesia, format = event_musiman {id, judul, kategori, deskripsi, pilihan[3], musim[]}; musim = id musim baru (hujan/mareng/kemarau/labuh), [] = semua musim",
   "flora": "Dict id -> {nama, deskripsi, hasil[id sumber daya], musim[]}",
   "fauna": "Dict kelompok (ternak, satwa_liar, ancaman) -> id -> {nama, deskripsi}",
   "bangunan_lokal": "Dict id -> {nama, tooltip, id_kode (id bangunan di kode bila ada, null = usulan baru)}",
   "penyakit_musiman": "Dict id -> {nama, musim[], gejala, edukasi, mulai[], sembuh[]}"}},
 "tambah_key_meta": {
  "status_indonesia": "mengikuti_riset", "sumber_indonesia": "docs/RISET-INDONESIA.md (§4 pemetaan event, §6 tugas teks)",
  "peta_musim_transisi": {"_catatan": "Isi teks key lama selama kode masih 4 slot lama (tema 'sedang').", "semi": "Musim Hujan", "panas": "Pancaroba (terik)", "gugur": "Musim Panen (Mareng)", "dingin": "Musim Kemarau (malam bediding)"},
  "alias_id_v140": ALIAS_ID_V140, "txt_tema_nusantara": TXT_TEMA_NUSANTARA, "perlu_diubah_di_kode": PERLU_DIUBAH_DI_KODE,
  "kata_terlarang": KATA_TERLARANG},
 "tambah_subkey": {"musim_pembuka": musim_pembuka_v140, "peringatan_dini": peringatan_dini_v140, "log_ancaman": log_ancaman_v140},
 "tambah_key": {"event_lokal": event_lokal, "flora": flora, "fauna": fauna, "bangunan_lokal": bangunan_lokal, "penyakit_musiman": penyakit_musiman},
 "set_meta": {"versi": "1.4.0"},
}


# =====================================================================
# v1.5.0 — TOKOH, CERITA & TUJUAN (hanya penambahan). Spec: docs/RISET-CERITA-TUJUAN.md
# (§1 sifat/hubungan/keinginan/cerita, §2 monumen/teladan/agustusan/target tahunan, §3 dilema + momen kecil, §7 Dokumen).
# Id mengikuti blok konstanta spec (TRAITS, WISHES, STORY_CHAINS, MONUMENTS, AGUSTUSAN, DILEMMAS, MOMEN_KECIL).
# Angka mekanik tinggal di balance.js; dilema membawa efek/efek_tertunda yang disalin dari spec §3.3
# (hanya kunci yang terdaftar di meta.sumber_daya/kunci_efek; kunci lain -> mekanik_lain).
# =====================================================================

# ---- v1.5.0 bagian c1 ----
# =====================================================================
# v1.5.0 — TOKOH, CERITA & TUJUAN (hanya penambahan). Spec: docs/RISET-CERITA-TUJUAN.md.
# Angka mekanik (TRAITS/RELATION/WISHES/STORY_CHAINS/...) ada di balance.js; di sini hanya teks.
# Dilema memakai format event + hari_tunda/efek_tertunda/teks_tertunda (konsekuensi tertunda).
# =====================================================================
def _CP(teks, efek, hasil, hari_tunda=None, efek_tertunda=None, teks_tertunda=None):
    c = {"teks": teks, "efek": efek, "teks_hasil": hasil}
    if hari_tunda is not None: c.update({"hari_tunda": hari_tunda, "efek_tertunda": efek_tertunda or {}, "teks_tertunda": teks_tertunda})
    return c
def _SF(nama, desk, ringkas, log_muncul, kata): return {"nama": nama, "kata": kata, "deskripsi": desk, "tooltip": ringkas, "log_terlihat": [log_muncul]}

sifat = {
 "_catatan": "Id = TRAITS.list (spec §1.1, revisi 12:12): 20 sifat. kata = bentuk kecil untuk placeholder {sifat} (makna sama seperti sejak v1.2: frasa sifat penduduk, mis. \"{nama} yang {sifat}\"). log_terlihat: {nama} = pemilik sifat. log_sifat = log khusus sifat (kejahilan, sambutan ramah, suap/timbangan untuk jujur). Sifat lama (humoris, pendiam, tukang_gosip, penyayang_anak, betah, kuat, ringkih, penggemar_kopi) dihapus spec; pemalas -> malas.",
 "rajin": _SF("Rajin", "Selalu mulai kerja paling awal dan jarang mengeluh. Paling senang saat kerja bakti.", "Kerja lebih cepat; energi lebih cepat habis.", "{nama} sudah di sawah sebelum ayam berkokok. Ternyata ia rajin sekali.", "rajin"),
 "malas": _SF("Malas", "Tidak suka terburu-buru. Katanya, hidup itu dinikmati pelan-pelan di bale-bale.", "Kerja lebih pelan, tapi suasana hatinya santai dan tidak mudah kecewa.", "{nama} menguap lebar di tengah kerja. \"Istirahat sebentar ya,\" katanya untuk ketiga kalinya.", "malas"),
 "pemberani": _SF("Pemberani", "Paling depan saat babi hutan datang, membawa obor dan kentongan.", "Lebih pandai mengusir ancaman dan suka ikut ronda; tidak mudah trauma.", "{nama} berdiri paling depan saat semak bergoyang. Ia memang pemberani.", "pemberani"),
 "penakut": _SF("Penakut", "Pulang lebih awal kalau ada jejak di tepi hutan. Tidak mau jaga malam.", "Lebih jarang terluka, tapi mudah trauma dan kerja malam lebih pelan.", "{nama} bergegas pulang begitu matahari turun. \"Lebih baik aman,\" bisiknya.", "penakut"),
 "periang": _SF("Periang", "Senyumnya lebar dan tawanya menular ke siapa saja di dekatnya.", "Suasana hati lebih baik dan menghibur warga di sekitarnya; jago lomba makan kerupuk.", "{nama} bersenandung sepanjang jalan ke sawah. Yang mendengar ikut tersenyum.", "periang"),
 "pemurung": _SF("Pemurung", "Lebih banyak diam dan merenung, tapi kerjanya teliti saat sendirian.", "Suasana hati mudah turun dan lambat berteman, tapi jarang bertengkar; kerja lebih cepat saat sendiri.", "{nama} duduk sendirian di pematang sambil memandangi awan. Ia memang suka merenung.", "pemurung"),
 "ramah": _SF("Ramah", "Selalu menyapa lebih dulu, bahkan kepada orang yang baru datang.", "Cepat akrab dan jarang berselisih; pendatang baru merasa disambut olehnya.", "{nama} menyapa setiap orang yang lewat di depan rumahnya. Tak ada yang lewat tanpa senyum.", "ramah"),
 "pemarah": _SF("Pemarah", "Sumbunya pendek, tapi kerjanya cekatan kalau dibiarkan sendiri.", "Lebih mudah bertengkar dan bisa punya rival; kerja lebih cepat saat sendirian.", "{nama} menggerutu karena cangkulnya dipinjam tanpa izin. Hatinya baik, sumbunya saja yang pendek.", "pemarah"),
 "sabar": _SF("Sabar", "Tidak mudah tersulut, dan paling bisa menenangkan orang yang sedang kesal.", "Jarang bertengkar, duka lebih ringan, dan betah tinggal di desa.", "{nama} hanya tersenyum saat temannya mengomel. \"Pelan-pelan saja, semua ada jalannya.\"", "sabar"),
 "dermawan": _SF("Dermawan", "Suka berbagi bekal dan kopi, bahkan saat bekalnya sendiri sedikit.", "Kadang memberi hadiah kecil kepada teman (memakai 1 makanan atau 1 kopi).", "{nama} membagi bekal nasinya untuk teman yang lupa membawa. Ia memang dermawan.", "dermawan"),
 "pelit": _SF("Pelit", "Menyimpan setiap butir gabah. Pandai menawar harga dengan tengkulak.", "Makan sedikit lebih hemat, tapi kesal saat desa berbelanja besar dan tidak pernah memberi hadiah.", "{nama} menghitung gabah dua kali sebelum tidur. Tidak ada yang terbuang sia-sia.", "pelit"),
 "suka_menolong": _SF("Suka menolong", "Ringan tangan untuk siapa saja: membangun, merawat yang sakit, atau menemani anak-anak.", "Lebih cepat saat kerja bakti, merawat, dan membangun; anak serumah belajar lebih cepat.", "{nama} langsung menyingsingkan lengan baju saat melihat tetangga kerepotan.", "suka menolong"),
 "jujur": _SF("Jujur", "Bicaranya lurus dan dipercaya semua orang. Tidak pernah mau menerima suap.", "Mudah dipercaya warga; tengkulak tidak berani curang timbangan bila ada dia.", "{nama} mengembalikan uang kembalian yang kelebihan ke pedagang. \"Ini bukan hak saya, Pak.\"", "jujur"),
 "jahil": _SF("Jahil", "Suka iseng dan bercanda, kadang kelewatan sedikit. Tapi tidak pernah berniat jahat.", "Suka bergosip dan berbuat iseng yang menghibur, tapi kadang membuat orang kesal.", "{nama} menyembunyikan caping temannya di atas pohon pisang. Semua tertawa, kecuali pemilik caping.", "jahil"),
 "cerdas": _SF("Cerdas", "Cepat belajar hal baru dan suka bertanya \"kenapa begitu?\".", "Riset lebih cepat dan semua keahlian tumbuh lebih cepat.", "{nama} menghitung jumlah gabah di lumbung tanpa coretan sedikit pun. Semua kagum.", "cerdas"),
 "religius": _SF("Religius", "Tekun beribadah dan menenangkan orang lain saat berduka.", "Senang bila ada Langgar atau Masjid; duka lebih cepat reda; istirahat sejenak tiap Jumat.", "Suara {nama} mengaji terdengar lembut dari rumahnya setiap selepas magrib.", "religius"),
 "perantau": _SF("Perantau", "Pernah merantau jauh dan membawa keahlian dari kota.", "Datang dengan sedikit keahlian; keinginannya lebih sering muncul dan kadang rindu kampung.", "{nama} bercerita tentang kota-kota yang pernah ia singgahi. Semua mendengarkan dengan kagum.", "perantau"),
 "ahli_tani": _SF("Ahli tani", "Hafal tanda-tanda alam dan tahu kapan harus menanam.", "Bertani lebih cepat dan panennya lebih banyak.", "{nama} meremas segenggam tanah lalu tersenyum. \"Tanah ini siap ditanami.\"", "ahli tani"),
 "pandai_masak": _SF("Pandai masak", "Sambalnya terkenal sampai ke desa sebelah.", "Masakan Dapur lebih mengenyangkan; biaya kenduri dan hajatan lebih hemat.", "Aroma sambal terasi dari dapur {nama} membuat semua orang tiba-tiba lapar.", "pandai masak"),
 "seniman": _SF("Seniman", "Menari, menabuh gamelan, dan mengukir. Malam di api unggun jadi lebih indah karenanya.", "Membuat api unggun, festival, dan lomba lebih meriah; cepat membangun Pendopo Reog.", "{nama} mengukir burung merak kecil dari sepotong kayu. Detailnya membuat semua orang terdiam.", "seniman"),
 "log_sifat": {
  "jahil_kejahilan": [
   "Hari {hari}: {nama} menukar sandal {nama2} dengan sandal yang kebesaran. Semua yang melihat tertawa terpingkal-pingkal.",
   "Hari {hari}: {nama} pura-pura jadi orang-orangan sawah. {nama2} kaget setengah mati, lalu ikut tertawa.",
   "Hari {hari}: {nama} menaruh katak kecil di caping {nama2}. Pendopo jadi ramai oleh tawa.",
   "Hari {hari}: Kejahilan {nama} kali ini kelewatan sedikit. {nama2} cemberut seharian."],
  "jahil_minta_maaf": ["Hari {hari}: {nama} membawakan pisang goreng untuk {nama2} sebagai tanda minta maaf atas kejahilannya."],
  "ramah_sambutan": [
   "Hari {hari}: {nama} menyambut {nama2} yang baru datang dengan teh hangat dan senyum lebar. \"Anggap saja rumah sendiri.\"",
   "Hari {hari}: {nama} mengajak {nama2}, warga baru, berkeliling desa dan mengenalkannya pada semua tetangga.",
   "Hari {hari}: Berkat sambutan hangat {nama}, {nama2} langsung merasa kerasan di desa."],
  "jujur_tolak_suap": [
   "Hari {hari}: {nama} menolak amplop \"uang rokok\" dari orang luar. \"Maaf, Pak. Desa kami tidak begitu caranya.\"",
   "Hari {hari}: Kepala desa menolak suap. {nama} tersenyum bangga dan menepuk bahu warga di sebelahnya."],
  "jujur_suap_diterima": [
   "Hari {hari}: {nama} terdiam lama setelah tahu desa menerima \"uang rokok\". Ia kecewa, tapi tetap menghormati kepala desa.",
   "Hari {hari}: \"Semoga ini yang terakhir,\" kata {nama} pelan soal amplop dari pengusaha luar."],
  "jujur_timbangan": [
   "Hari {hari}: {nama} memeriksa timbangan tengkulak dan menemukan batu kecil di bawahnya. Tengkulak itu tersipu dan menimbang ulang dengan benar.",
   "Hari {hari}: Karena ada {nama} yang teliti dan jujur, tengkulak tidak berani bermain-main dengan timbangan."]},
}

log_interaksi = {
 "_catatan": "Selaras dengan RELATION (spec §1.2) dan log_hubungan v1.3 (jatuh_cinta memakai {pasangan} seperti log_hubungan). {nama}/{nama2} = dua penduduk yang berinteraksi.",
 "menjadi_teman": [
  "Hari {hari}: {nama} dan {nama2} ternyata sama-sama suka sambal terasi. Sejak itu mereka berteman.",
  "Hari {hari}: {nama} membantu {nama2} memikul kayu pulang. Mereka mengobrol sepanjang jalan dan tertawa bersama.",
  "Hari {hari}: {nama} dan {nama2} duduk berdua di pos ronda sambil makan singkong rebus. Pertemanan baru dimulai.",
  "Hari {hari}: {nama} mengajari {nama2} membuat layangan. Kini mereka sering terlihat bersama."],
 "menjadi_sahabat": [
  "Hari {hari}: {nama} dan {nama2} sudah seperti saudara. Mereka saling menyisihkan lauk terbaik.",
  "Hari {hari}: {nama2} menjahit sarung {nama} yang sobek tanpa diminta. Begitulah sahabat.",
  "Hari {hari}: {nama} dan {nama2} berjanji akan saling menjaga sampai tua. Mereka kini bersahabat."],
 "menjadi_rival": [
  "Hari {hari}: {nama} dan {nama2} saling buang muka di pematang. Sepertinya mereka sedang bersaing.",
  "Hari {hari}: Setiap kali {nama} memuji panennya, {nama2} mendengus. Persaingan kecil dimulai."],
 "bertengkar": [
  "Hari {hari}: {nama} dan {nama2} berdebat soal siapa yang lupa menutup pintu Gudang. Suara mereka terdengar sampai sawah.",
  "Hari {hari}: {nama} cemberut karena {nama2} memakan pisang goreng terakhir. Mereka saling diam seharian.",
  "Hari {hari}: {nama} dan {nama2} berebut giliran air di saluran sawah. Wajah keduanya merah padam.",
  "Hari {hari}: {nama2} menertawakan layangan {nama} yang tersangkut di pohon kelapa. {nama} tersinggung dan pergi."],
 "berbaikan": [
  "Hari {hari}: {nama} datang ke rumah {nama2} membawa sepiring pisang goreng. \"Maaf ya,\" katanya. Mereka berpelukan.",
  "Hari {hari}: Setelah ditengahi para tetua di pendopo, {nama} dan {nama2} bersalaman dan tertawa canggung.",
  "Hari {hari}: {nama} dan {nama2} terjebak hujan di gubuk yang sama. Lama-lama mereka mengobrol lagi seperti biasa.",
  "Hari {hari}: {nama2} membantu {nama} memperbaiki atap tanpa banyak bicara. Pertengkaran kemarin terlupakan."],
 "jatuh_cinta": [
  "Hari {hari}: Jantung {nama} berdebar setiap kali {pasangan} lewat membawa kendi air. Wajahnya memerah seperti jambu.",
  "Hari {hari}: {nama} memetik bunga melati dan menyelipkannya diam-diam di jendela {pasangan}.",
  "Hari {hari}: {nama} pura-pura sibuk saat {pasangan} menyapa, padahal senyumnya tidak bisa disembunyikan.",
  "Hari {hari}: Di bawah bulan purnama, {nama} memberanikan diri mengajak {pasangan} melihat kunang-kunang di sawah."],
 "gosip": [
  "Hari {hari}: Di dekat sumur, {nama} berbisik pada {nama2}. Keduanya tertawa cekikikan.",
  "Hari {hari}: {nama} membawa kabar terbaru ke pendopo. {nama2} mendengarkan dengan mata membulat."],
 "hadiah": [
  "Hari {hari}: {nama} memberi {nama2} secangkir kopi hangat tanpa alasan. {nama2} tersenyum lebar.",
  "Hari {hari}: {nama} menyelipkan sepotong gula aren ke tangan {nama2}. \"Untukmu,\" katanya."],
 "menolong": [
  "Hari {hari}: {nama} merawat {nama2} yang sakit seharian. {nama2} tidak akan melupakannya.",
  "Hari {hari}: {nama} menarik {nama2} menjauh dari seruduk babi hutan. Sejak malam itu mereka sangat dekat."],
 "ronda_bareng": [
  "Hari {hari}: {nama} dan {nama2} ronda berdua semalaman, bergantian memukul kentongan dan bercerita.",
  "Hari {hari}: Di pos ronda, {nama} mengajari {nama2} irama kentongan tanda aman. Malam terasa singkat."],
 "renggang": [
  "Hari {hari}: {nama} dan {pasangan} jarang bicara akhir-akhir ini. Para tetua berharap mereka segera akur lagi."],
 "rindu_teman": [
  "Hari {hari}: {nama} sudah lama tidak mengobrol dengan {nama2}. Ia jadi rindu."],
}

def _KI(judul, desk, muncul, terpenuhi, kecewa, tombol=None):
    k = {"judul": judul, "deskripsi": desk, "teks_muncul": muncul, "teks_terpenuhi": terpenuhi, "teks_kecewa": kecewa}
    if tombol: k["tombol"] = tombol
    return k
keinginan = {
 "_catatan": "Id = WISHES.list (spec §1.3). {nama} = pemilik keinginan. tombol = label tombol Penuhi (hanya keinginan cara 'tombol'/'cicil'). Biaya/hadiah di balance.js.",
 "makan_rendang": _KI("Ingin makan rendang", "Rendang daging bersantan, dimasak berjam-jam sampai hitam legit.", ["{nama} menelan ludah membayangkan rendang. \"Pakai santan kelapa, dimasak lama...\""], ["Hari {hari}: {nama} makan rendang buatan dapur desa. Ia memejamkan mata, menikmati setiap gigitan."], ["Hari {hari}: {nama} hanya bisa membayangkan rendang. Ia sedikit kecewa."], "Masakkan rendang"),
 "nasi_pecel": _KI("Ingin nasi pecel", "Sayur rebus disiram sambal kacang, ditemani rempeyek.", ["{nama} rindu nasi pecel buatan ibunya dulu."], ["Hari {hari}: {nama} makan nasi pecel beralas daun pisang. \"Pedasnya pas!\""], ["Hari {hari}: Belum ada nasi pecel untuk {nama}. Ia makan seadanya."], "Buatkan nasi pecel"),
 "kopi_pagi": _KI("Ngopi pagi di teras", "Secangkir kopi tubruk di teras sambil memandangi sawah berkabut.", ["{nama} duduk di teras pagi-pagi, memandang sawah. \"Andai ada kopi...\""], ["Hari {hari}: {nama} menyeruput kopi tubruk di teras. Pagi terasa sempurna."], ["Hari {hari}: Pagi berlalu tanpa kopi. {nama} menghela napas."], "Seduhkan kopi"),
 "rumah_panggung": _KI("Punya rumah panggung", "Rumah bertiang bambu: sejuk, aman dari banjir dan ular.", ["{nama} sering memandangi lahan dekat sungai. Sepertinya ia memimpikan rumah panggung."], ["Hari {hari}: {nama} menaiki tangga rumah panggung barunya. Matanya berkaca-kaca bahagia."], ["Hari {hari}: Rumah panggung impian {nama} belum juga berdiri. Ia mulai murung."]),
 "nonton_reog": _KI("Nonton reog", "Melihat dadak merak menari diiringi kendang dan terompet.", ["{nama} menirukan gerakan warok sambil tertawa. \"Kapan ya ada reog di desa ini?\""], ["Hari {hari}: {nama} bersorak paling keras saat dadak merak berputar. Ia bahagia sekali."], ["Hari {hari}: Pentas reog belum juga ada. {nama} menyimpan topeng mainannya dengan sedih."]),
 "tabungan_haji": _KI("Menabung untuk naik haji", "Menabung sedikit demi sedikit di celengan bambu, berharap suatu hari berangkat ke Tanah Suci.", ["{nama} membuat celengan dari bambu. \"Sedikit-sedikit, lama-lama cukup,\" katanya penuh harap."], ["Hari {hari}: Tabungan {nama} akhirnya cukup! Seluruh desa mengantar keberangkatannya dengan doa dan air mata haru."], ["Hari {hari}: Tabungan {nama} belum cukup tahun ini. \"Masih ada tahun depan,\" katanya tabah."], "Setor ke celengan"),
 "mancing_sore": _KI("Mancing sore di kali", "Duduk di tepi kali dengan joran bambu sampai matahari terbenam.", ["{nama} memandangi joran bambunya. \"Sore ini cocok untuk mancing.\""], ["Hari {hari}: {nama} pulang dari kali membawa ikan dan senyum lebar."], ["Hari {hari}: {nama} terlalu sibuk untuk mancing. Joran bambunya masih bersandar di dinding."]),
 "punya_ayam": _KI("Punya ayam sendiri", "Beberapa ekor ayam kampung yang berkokok setiap pagi.", ["{nama} menirukan kokok ayam setiap pagi. Sepertinya ia ingin memelihara ayam."], ["Hari {hari}: Ayam-ayam di kandang baru berkokok nyaring. {nama} menaburkan jagung sambil tertawa."], ["Hari {hari}: Belum ada kandang ayam. Kokokan {nama} terdengar lesu."]),
 "baju_baru": _KI("Baju baru untuk Agustusan", "Kemeja atau kebaya baru untuk hari besar.", ["{nama} memandangi kain-kain di gerobak pedagang. \"Bagus sekali untuk Agustusan...\""], ["Hari {hari}: {nama} memakai baju barunya dan berputar-putar di depan pendopo. Semua memuji."], ["Hari {hari}: {nama} memakai baju lamanya lagi. Tidak apa-apa, katanya, walau sedikit kecewa."], "Belikan baju"),
 "ziarah_makam": _KI("Ziarah ke makam", "Membersihkan makam orang tersayang dan menaburkan bunga.", ["{nama} memetik bunga kamboja. Sepertinya ia ingin berziarah."], ["Hari {hari}: {nama} menaburkan bunga dan berdoa di makam. Hatinya terasa lebih ringan."], ["Hari {hari}: {nama} belum sempat berziarah. Rindunya belum terobati."]),
 "wayang_semalam": _KI("Nonton wayang semalam suntuk", "Wayang kulit di bawah blencong, dari malam sampai subuh.", ["{nama} bercerita tentang Arjuna dan Semar. \"Sudah lama tidak nonton wayang,\" katanya."], ["Hari {hari}: Desa menonton wayang semalam suntuk. {nama} tertawa paling keras saat punakawan muncul."], ["Hari {hari}: Belum ada pertunjukan wayang. {nama} mendongengkannya sendiri untuk anak-anak."], "Undang dalang"),
 "tidur_siang": _KI("Tidur siang di bale-bale", "Tidur sebentar di bale-bale bambu ditemani angin sepoi-sepoi.", ["{nama} melirik bale-bale bambu dengan penuh rindu."], ["Hari {hari}: {nama} tidur siang di bale-bale sambil mendengkur halus. Bangunnya segar sekali."], ["Hari {hari}: {nama} tidak sempat tidur siang. Ia menguap sepanjang sore."]),
 "kerja_bakti": _KI("Ikut kerja bakti", "Membersihkan desa bersama-sama, lalu makan gorengan.", ["{nama} menyingsingkan lengan baju. \"Kapan kita kerja bakti lagi?\""], ["Hari {hari}: {nama} bekerja bakti dengan semangat. Desa bersih, hatinya senang."], ["Hari {hari}: Kerja bakti belum diadakan. {nama} membersihkan halamannya sendiri."]),
 "ngobrol_sahabat": _KI("Ngobrol lama dengan sahabat", "Bercerita panjang dengan teman dekat di dekat api unggun.", ["{nama} melirik ke arah rumah sahabatnya. Sudah lama mereka tidak bercerita panjang."], ["Hari {hari}: {nama} dan sahabatnya bercerita sampai larut di dekat api unggun."], ["Hari {hari}: {nama} belum sempat bertemu sahabatnya. Ia sedikit kesepian."]),
 "punya_anak": _KI("Ingin punya momongan", "Mendambakan tangis bayi di rumah kecilnya.", ["{nama} tersenyum melihat bayi tetangga. Sepertinya ia juga mendambakan momongan."], ["Hari {hari}: Kabar bahagia! {nama} akan segera punya momongan."], ["Hari {hari}: {nama} menatap bintang. \"Mungkin belum waktunya,\" bisiknya."]),
 "sawah_menguning": _KI("Melihat sawah menguning", "Berdiri di pematang memandangi padi yang siap dipanen.", ["{nama} sering berjalan ke pematang sore-sore. Ia menunggu sawah menguning."], ["Hari {hari}: {nama} berdiri di pematang memandangi sawah keemasan. \"Indahnya,\" bisiknya."], ["Hari {hari}: Sawah belum menguning. {nama} pulang dengan langkah pelan."]),
 "jajan_pasar": _KI("Jajan klepon & cenil", "Klepon berisi gula merah dan cenil warna-warni bertabur kelapa.", ["{nama} membayangkan klepon yang meletus manis di mulut."], ["Hari {hari}: {nama} jajan klepon dan cenil di pasar. Gula merahnya meleleh di lidah!"], ["Hari {hari}: {nama} belum sempat ke pasar. Bayangan klepon masih menghantuinya."], "Belikan jajan"),
 "belajar_gamelan": _KI("Belajar gamelan", "Menabuh saron dan bonang di pendopo.", ["{nama} mengetuk-ngetuk ember mengikuti irama. Sepertinya ia ingin belajar gamelan."], ["Hari {hari}: Tung-tung-gong! {nama} menabuh bonang untuk pertama kalinya di pendopo."], ["Hari {hari}: {nama} masih menabuh ember. Iramanya terdengar sedikit sedih."]),
 "rujak_bareng": _KI("Rujakan bareng tetangga", "Rujak buah dengan sambal gula merah, dimakan beramai-ramai saat siang terik.", ["Siang terik. {nama} membayangkan rujak pedas manis bersama tetangga."], ["Hari {hari}: {nama} dan para tetangga rujakan di bawah pohon mangga. Pedas, segar, dan penuh tawa!"], ["Hari {hari}: Belum ada rujakan. {nama} mengipasi diri dengan caping."], "Siapkan rujak"),
 "bancakan_weton": _KI("Bancakan weton", "Syukuran kecil di hari lahir Jawa, berbagi nasi dan lauk dengan tetangga.", ["{nama} menghitung hari pasaran dengan jari. \"Sebentar lagi wetonku.\""], ["Hari {hari}: Bancakan weton {nama}: nasi dan lauk dibagikan beralas daun pisang. Semua mendoakannya."], ["Hari {hari}: Weton {nama} lewat tanpa bancakan. Ia berdoa sendiri di rumah."], "Adakan bancakan"),
 "pulang_kampung": _KI("Pulang kampung sebentar", "Menjenguk keluarga di kampung asal selama beberapa hari.", ["{nama} sering memandang ke arah gunung. Ia rindu kampung halamannya."], ["Hari {hari}: {nama} pamit pulang kampung sebentar dengan bekal di punggung. \"Aku pasti kembali!\""], ["Hari {hari}: {nama} belum bisa pulang kampung. Rindunya makin berat."], "Izinkan pulang"),
 "ronda_malam": _KI("Ikut ronda", "Berjaga malam di pos ronda sambil memukul kentongan.", ["{nama} memeriksa kentongan di pos ronda. \"Malam ini aku mau ikut jaga.\""], ["Hari {hari}: {nama} ronda semalaman dengan bangga. Desa aman di bawah penjagaannya."], ["Hari {hari}: {nama} tidak kebagian giliran ronda. Ia sedikit kecewa."]),
 "main_layangan": _KI("Main layangan", "Menerbangkan layangan bambu di atas sawah saat angin bertiup.", ["{nama} kecil memandangi langit yang berangin. \"Ini cuaca layangan!\""], ["Hari {hari}: Layangan {nama} terbang paling tinggi di langit desa. Orang tuanya ikut bersorak."], ["Hari {hari}: Angin bagus terlewat lagi. {nama} menyimpan layangannya dengan sedih."], "Buatkan layangan"),
 "menang_lomba": _KI("Menang lomba 17-an", "Juara salah satu lomba Agustusan.", ["{nama} berlatih balap karung di halaman. \"Tahun ini aku harus menang!\""], ["Hari {hari}: {nama} juara lomba 17-an! Ia mengangkat hadiahnya tinggi-tinggi."], ["Hari {hari}: {nama} belum menang tahun ini. \"Tahun depan!\" katanya sambil tertawa."]),
 "tumpeng_syukuran": _KI("Tumpengan syukur panen", "Tumpeng nasi kuning dengan lauk lengkap untuk mensyukuri panen.", ["{nama} bercerita tentang tumpeng di desa asalnya. Matanya berbinar."], ["Hari {hari}: {nama} memotong pucuk tumpeng syukuran dengan bangga. Seluruh desa bersyukur bersama."], ["Hari {hari}: {nama} bertanya lagi kapan desa akan tumpengan."], "Siapkan tumpeng"),
 "mandi_kali": _KI("Mandi di kali bareng", "Mandi dan berenang di kali bersama teman-teman.", ["{nama} memandang kali yang jernih setelah hujan. Ia ingin mandi bersama teman."], ["Hari {hari}: {nama} berenang di kali bersama teman-teman. Segarnya sampai ke hati!"], ["Hari {hari}: Kali terlalu deras hari ini. {nama} hanya mencelupkan kaki."]),
}

# ---- v1.5.0 bagian c2 ----
def _L(teks, pilihan=None, hasil=None):
    l = {"teks": teks}
    if pilihan: l["pilihan"] = [{"teks": a, "teks_hasil": b} for a, b in pilihan]
    if hasil: l["hasil"] = hasil
    return l
cerita_tokoh = {
 "_catatan": "Id & urutan langkah = STORY_CHAINS (spec §1.4). Teks saja; efek/peluang/jeda ada di balance.js. pilihan[i] sejajar dengan langkah[n].pilihan[i] di spec; hasil (per kunci) untuk cabang acak/cek. {nama} = tokoh utama, {nama2} = tokoh kedua, {pasangan} = tokoh C pada cinta_segitiga.",
 "warok_muda": {"judul": "Warok Muda", "ringkasan": "{nama} menemukan dadak merak tua dan ingin menghidupkan reog di desa.", "langkah": [
   _L("Hari {hari}: Saat membersihkan Gudang, {nama} menemukan rangka dadak merak tua yang bulunya rontok. Matanya langsung berbinar.",
      [("Perbaiki dadak meraknya", "{nama} merendam bambu dan menjahit kulit dengan telaten. Bulu-bulu merak dirapikan satu per satu."),
       ("Simpan saja di Gudang", "{nama} menyimpan dadak merak itu dengan berat hati. \"Mungkin lain kali,\" gumamnya.")]),
   _L("Hari {hari}: Dadak merak sudah pulih. {nama} ingin berlatih menari setiap malam selama tiga malam.",
      [("Dukung latihannya", "Teman-teman ikut menabuh kendang dan meniup terompet. Halaman pendopo ramai setiap malam."),
       ("Larang dulu, nanti kecapekan", "{nama} menurut dan menggantung dadak merak di dinding. Wajahnya murung.")]),
   _L("Hari {hari}: Latihan makin berat. Dadak merak itu berat sekali untuk diangkat dengan gigi.", hasil={
      "jatuh": "Hari {hari}: {nama} terjatuh saat berputar! Lututnya lecet, tapi ia bangun lagi sambil tertawa. \"Warok tidak menyerah!\"",
      "lancar": "Hari {hari}: Latihan {nama} lancar. Dadak merak berputar gagah di bawah cahaya obor."}),
   _L("Hari {hari}: Pentas reog pertama desa! {nama} menari dengan dadak merak, diiringi kendang dan gong. Penonton bersorak tak henti-henti.", hasil={
      "selesai": "Sejak malam itu, {nama} dikenal sebagai warok muda yang pemberani. Pendopo Reog kini lebih mudah dibangun."})],
  "selesai": "{nama} kini warok muda kebanggaan desa."},
 "surat_kota": {"judul": "Surat dari Kota", "ringkasan": "Kabar dari kota membuat {nama} harus memilih antara keluarga dan desa.", "langkah": [
   _L("Hari {hari}: Pedagang membawa surat untuk {nama}. Ibunya di kota sedang sakit. Tangannya gemetar membaca kabar itu.",
      [("Izinkan pulang 5 hari", "{nama} berangkat dengan bekal dari lumbung. \"Terima kasih, aku akan kembali,\" katanya sambil menyeka mata."),
       ("Minta ditunda dulu", "{nama} mengangguk pelan. Ia tetap bekerja, tapi pikirannya jauh di kota.")]),
   _L("Hari {hari}: {nama} kembali dari kota! Ibunya sudah membaik, dan ia membawa oleh-oleh perkakas dan kopi.", hasil={
      "bawa_adik": "Hari {hari}: Ternyata {nama} juga membawa adiknya yang ingin tinggal di desa. Selamat datang, warga baru!"}),
   _L("Hari {hari}: Para tetua bertanya pada {nama}: akan tetap tinggal di desa atau kembali ke kota?", hasil={
      "betah": "Hari {hari}: \"Di sini sahabat-sahabatku. Di sini rumahku,\" jawab {nama}. Ia kini benar-benar kerasan.",
      "pamit": "Hari {hari}: {nama} pamit baik-baik untuk kembali ke kota merawat ibunya. Desa melepasnya dengan pelukan dan doa.",
      "tetap": "Hari {hari}: {nama} memilih tetap tinggal untuk sementara. \"Kita lihat nanti,\" katanya sambil tersenyum."})],
  "selesai": "Kisah surat dari kota {nama} selesai."},
 "resep_nenek": {"judul": "Resep Pecel Nenek", "ringkasan": "{nama} ingin menghidupkan lagi resep pecel neneknya.", "langkah": [
   _L("Hari {hari}: {nama} teringat sambal pecel buatan neneknya: kacang sangrai, kencur, daun jeruk, dan gula merah.",
      [("Cari bahan-bahannya", "{nama} mengumpulkan kacang, kelapa, dan kencur. Dapur mulai harum."),
       ("Lain kali saja", "{nama} menyimpan kenangan resep itu di hatinya untuk lain waktu.")]),
   _L("Hari {hari}: {nama} mulai mengulek sambal pecel di cobek batu.", hasil={
      "sukses": "Hari {hari}: Sambal pecel {nama} jadi! Rasanya persis seperti buatan nenek. Penduduk antre mencicipi.",
      "gagal": "Hari {hari}: Kepedasan! Semua yang mencicipi berkeringat dan tertawa sambil minum air. {nama} akan mencoba lagi."}),
   _L("Hari {hari}: Pecel {nama} jadi pembicaraan desa. Apa yang sebaiknya ia lakukan?",
      [("Buka warung pecel di pasar", "Warung kecil {nama} laris manis. Pembeli dari desa sebelah datang khusus untuk pecelnya."),
       ("Untuk kenduri desa saja", "Pecel {nama} disajikan di setiap kenduri. Semua orang menunggu-nunggu.")])],
  "selesai": "Resep pecel nenek {nama} kini milik seluruh desa."},
 "penakut_babi": {"judul": "Nyali Kentongan", "ringkasan": "Setelah serangan babi hutan, {nama} belajar mengatasi rasa takutnya.", "langkah": [
   _L("Hari {hari}: Sejak serangan babi hutan, {nama} gemetar setiap senja. Ia tidak berani keluar rumah setelah gelap.",
      [("Ajak ronda bersama sahabat", "{nama} setuju ronda asal ditemani sahabatnya. \"Pelan-pelan saja,\" kata sahabatnya."),
       ("Biarkan istirahat dulu", "{nama} beristirahat di rumah. Hatinya sedikit lebih tenang.")]),
   _L("Hari {hari}: Tiga malam {nama} ronda bersama {nama2}. Mereka bercerita sambil memukul kentongan tanda aman."),
   _L("Hari {hari}: Babi hutan datang lagi! Semak bergoyang di dekat sawah...", hasil={
      "berani": "Hari {hari}: {nama} memukul kentongan duluan dengan keras dan berirama! Babi hutan lari. Seluruh desa bersorak untuk keberanian {nama}.",
      "lari": "Hari {hari}: {nama} lari ketakutan, tapi {nama2} menolongnya pulang dengan selamat. Ia butuh waktu untuk pulih."})],
  "selesai": "Kisah nyali kentongan {nama} selesai."},
 "kucing_belang": {"judul": "Kucing Belang di Lumbung", "ringkasan": "Seekor anak kucing tersesat menemukan rumah baru.", "langkah": [
   _L("Hari {hari}: {nama} menemukan anak kucing belang mengeong di sudut lumbung. Badannya kurus dan basah.",
      [("Pelihara di desa", "Anak kucing itu diberi nama Si Belang. Ia langsung tidur di pangkuan {nama}."),
       ("Antar ke desa sebelah", "Si kucing diantar ke tetangga yang sedang mencari kucing. Mereka berterima kasih sekali.")]),
   _L("Hari {hari}: Si Belang sudah besar. Tikus-tikus lumbung kini berpikir dua kali, dan ular jarang mendekati rumah."),
   _L("Hari {hari}: Si Belang melahirkan tiga anak kucing yang menggemaskan! Mau diapakan?",
      [("Bagi ke desa sebelah", "Dua anak kucing dibagikan ke tetangga. Hubungan dengan desa sebelah makin hangat."),
       ("Pelihara semuanya", "Rumah {nama} kini penuh kucing. Setiap pagi ia tertawa melihat mereka bermain.")])],
  "selesai": "Si Belang dan keluarganya kini penjaga lumbung desa."},
 "cinta_segitiga": {"judul": "Cinta Segitiga", "ringkasan": "{nama} dan {nama2} sama-sama menaruh hati pada {pasangan}.", "langkah": [
   _L("Hari {hari}: Gosip ramai di sumur: {nama} dan {nama2} sama-sama naksir {pasangan}! Semua menunggu kelanjutannya.",
      [("Biarkan berjalan alami", "Kepala desa memilih tidak ikut campur. Biar hati yang menentukan."),
       ("Atur ronda {nama} bersama {pasangan}", "Malam ini {nama} dan {pasangan} ronda berdua. {nama2} cemberut di rumah."),
       ("Atur ronda {nama2} bersama {pasangan}", "Malam ini {nama2} dan {pasangan} ronda berdua. {nama} menghela napas panjang.")]),
   _L("Hari {hari}: {pasangan} sudah menentukan pilihan hatinya.", hasil={
      "pilih": "Hari {hari}: {pasangan} memilih dengan malu-malu. Yang terpilih tersenyum lebar, yang lain menunduk sedih.",
      "renggang": "Hari {hari}: {nama} dan {nama2} kini saling menghindar. Persahabatan mereka retak."}),
   _L("Hari {hari}: Waktu berlalu. Bagaimana kabar {nama} dan {nama2}?", hasil={
      "berbaikan": "Hari {hari}: Setelah bekerja satu tim, {nama} dan {nama2} tertawa bersama lagi. \"Ternyata kita lebih cocok jadi sahabat.\"",
      "rival": "Hari {hari}: {nama} dan {nama2} masih saling buang muka. Mungkin butuh cerita lain untuk mendamaikan mereka."})],
  "selesai": "Kisah cinta segitiga selesai."},
 "bidan_desa": {"judul": "Bidan Desa", "ringkasan": "{nama} ingin belajar menjadi bidan untuk ibu-ibu di desa.", "langkah": [
   _L("Hari {hari}: Kehamilan pertama di desa membuat {nama} berpikir: siapa yang akan membantu persalinan? Ia ingin belajar dari bidan kecamatan.",
      [("Izinkan belajar 3 hari", "{nama} berangkat membawa bekal dan buku catatan. \"Aku akan belajar sungguh-sungguh.\""),
       ("Tidak sekarang", "{nama} mengangguk. Ia membantu ibu hamil dengan cara yang ia tahu.")]),
   _L("Hari {hari}: {nama} pulang dengan ilmu kebidanan dan tas kecil berisi peralatan bersih. Para ibu merasa lebih tenang."),
   _L("Hari {hari}: {nama} mengusulkan membangun Posyandu kecil untuk menimbang bayi dan memeriksa ibu hamil.",
      [("Bangun Posyandu", "Posyandu berdiri! Setiap bulan bayi-bayi ditimbang dan para ibu bertukar cerita."),
       ("Cukup di rumah masing-masing", "{nama} tetap berkeliling dari rumah ke rumah dengan tas kecilnya.")])],
  "selesai": "{nama} kini bidan kepercayaan desa."},
 "kopi_pertama": {"judul": "Kopi Pertama", "ringkasan": "Segenggam bibit kopi mengubah pagi-pagi di desa.", "langkah": [
   _L("Hari {hari}: Seorang pedagang memberi {nama} bibit kopi. \"Tanamlah di lereng yang sejuk,\" pesannya.",
      [("Tanam percobaan", "{nama} membuat peneduh dari bambu dan menanam bibit kopi berjajar di lereng."),
       ("Jual bibitnya", "Bibit kopi ditukar dengan perkakas. Lumayan untuk kerja di sawah.")]),
   _L("Hari {hari}: Buah kopi pertama memerah! {nama} menjemur, menyangrai, dan menumbuknya sendiri. Aromanya memenuhi desa."),
   _L("Hari {hari}: Kini setiap pagi penduduk ngopi di teras sebelum ke sawah. Tradisi baru lahir di desa."),
   _L("Hari {hari}: Pedagang dari kota datang khusus mencari kopi desa. \"Kopi kalian terkenal sampai ke kecamatan!\"")],
  "selesai": "Kopi desa {nama} kini terkenal."},
 "rival_sawah": {"judul": "Adu Panen", "ringkasan": "{nama} dan {nama2} saling klaim petak sawah terbaik.", "langkah": [
   _L("Hari {hari}: {nama} dan {nama2} sama-sama mengaku petak dekat sungai adalah yang terbaik. Suasana memanas.",
      [("Adu panen musim ini", "\"Kita buktikan saja!\" seru keduanya. Penduduk mulai bertaruh siapa yang menang."),
       ("Bagi petak dengan adil", "Petak dibagi dua dengan patok bambu. Keduanya bersalaman, walau masih sedikit kaku.")]),
   _L("Hari {hari}: Musim berakhir. Hasil panen dihitung di depan pendopo...", hasil={
      "hasil": "Hari {hari}: Pemenangnya bersorak, yang kalah cemberut. Persaingan mereka makin panas."}),
   _L("Hari {hari}: Para tetua prihatin melihat {nama} dan {nama2} terus bersaing.",
      [("Ajak kerja bakti bareng", "Setelah seharian bekerja bersama, keduanya tertawa. \"Ternyata kau tidak seburuk itu.\""),
       ("Biarkan saja", "Persaingan mereka berlanjut, tapi sawah keduanya justru makin subur.")], {
      "duo_tani": "Hari {hari}: {nama} dan {nama2} kini dijuluki Duo Tani. Kalau bekerja bersama, sawah mana pun beres."})],
  "selesai": "Kisah adu panen selesai."},
 "mbah_pendongeng": {"judul": "Mbah Pendongeng", "ringkasan": "Sesepuh {nama} mendongeng setiap malam dan menyimpan satu keinginan terakhir.", "langkah": [
   _L("Hari {hari}: Setiap malam Mbah {nama} mendongeng tentang kancil dan buaya di dekat api unggun. Anak-anak duduk melingkar, tak berkedip."),
   _L("Hari {hari}: \"Mbah ingin nonton reog sekali lagi,\" kata {nama} pelan suatu malam. Semua orang terdiam."),
   _L("Hari {hari}: Keinginan terakhir Mbah {nama}...", hasil={
      "terpenuhi": "Hari {hari}: Mbah {nama} menonton reog dengan mata berbinar seperti anak kecil. \"Sekarang Mbah sudah lega,\" katanya.",
      "tidak": "Hari {hari}: Dongeng-dongeng Mbah {nama} akan terus diceritakan, walau keinginan terakhirnya belum sempat terwujud."})],
  "selesai": "Dongeng Mbah {nama} hidup di hati anak-anak desa."},
}

# ---- v1.5.0 bagian c3 ----
def _TP(nama, mulai, progres, selesai, bonus): return {"nama": nama, "mulai": mulai, "progres": progres, "selesai": selesai, "bonus_ringkas": bonus}
proyek_monumen = {
 "_catatan": "Id monumen & urutan tahap = MONUMENTS (spec §2.1). progres = 3 teks (25/50/75%). Biaya/work/fx di balance.js. {nama} = penduduk yang terlibat, {persen}/{jumlah}/{sumber_daya} untuk UI.",
 "ui": {"judul_panel": "Tujuan Desa", "monumen": "Monumen", "tombol_fondasi": "Taruh fondasi", "tombol_mulai_tahap": "Mulai tahap {jumlah}",
        "progres": "Tahap {jumlah}/{jumlah2} · {persen}%", "butuh": "Butuh {jumlah} {sumber_daya} lagi", "terkunci_hari": "Terbuka mulai hari ke-25",
        "terkunci_era": "Terbuka di era {era}", "satu_aktif": "Selesaikan dulu tahap monumen yang sedang dikerjakan.", "tahap_selesai_banner": "Tahap selesai: {bangunan}!"},
 "masjid": {"nama": "Masjid Jami'", "deskripsi": "Dari langgar bambu sederhana tumbuh menjadi masjid jami' dengan menara dan bedug.", "tahap": [
   _TP("Langgar Bambu", "Hari {hari}: Penduduk sepakat membangun langgar kecil dari bambu. {nama} menancapkan tiang pertama.",
       ["Tiang-tiang bambu berdiri. Anak-anak berlarian di antara tiangnya.", "Dinding anyaman bambu mulai dipasang.", "Atap rumbia hampir menutup. Tinggal tikar pandan untuk lantainya."],
       "Hari {hari}: Langgar Bambu selesai! Suara adzan subuh pertama terdengar lembut di seluruh desa.", "Warga religius lebih tenang; adzan subuh membangunkan desa lebih awal; duka lebih cepat reda."),
   _TP("Masjid Kayu", "Hari {hari}: Langgar diperbesar menjadi masjid kayu. {nama} mengukur fondasi batu dengan tali.",
       ["Fondasi batu tersusun rapi.", "Tiang dan dinding papan berdiri kokoh.", "Kubah kecil dari papan mulai dipasang."],
       "Hari {hari}: Masjid Kayu selesai! Seluruh desa berkumpul untuk syukuran. Halal bihalal kini jadi acara tahunan.", "Semua warga lebih bahagia; duka desa lebih ringan; halal bihalal tahunan mendamaikan yang berselisih."),
   _TP("Masjid Jami'", "Hari {hari}: Saatnya membangun menara dan bedug. {nama} memimpin pengangkutan batu bata.",
       ["Dinding bata merah mulai menjulang.", "Menara berdiri setengah jadi. Burung-burung mulai bertengger.", "Bedug besar dari kayu jati dan kulit dipasang di serambi."],
       "Hari {hari}: Masjid Jami' berdiri megah dengan menara dan bedug! Penduduk menangis haru. Desa ini kini benar-benar rumah.", "Warga makin betah; keinginan bertahan lebih lama; membuka keinginan menabung untuk naik haji.")]},
 "balai_megah": {"nama": "Balai Desa Megah", "deskripsi": "Balai desa diperluas menjadi pusat musyawarah dan kesenian desa.", "tahap": [
   _TP("Serambi & Kentongan Besar", "Hari {hari}: Balai desa akan diperluas. {nama} memilih batang kayu terbaik untuk kentongan besar.",
       ["Serambi depan mulai dibangun.", "Lantai papan serambi dipasang rapi.", "Kentongan besar digantung di sudut serambi."],
       "Hari {hari}: Serambi & Kentongan Besar selesai! Dong-dong-dong! Semua warga datang untuk musyawarah pertama.", "Dua monumen bisa dikerjakan bersamaan; dilema mendapat pilihan Musyawarah."),
   _TP("Pendopo Joglo", "Hari {hari}: Tiang soko guru jati untuk pendopo joglo mulai didirikan.",
       ["Empat soko guru berdiri tegak.", "Rangka atap joglo tersusun bertingkat.", "Genteng tanah liat dipasang satu per satu."],
       "Hari {hari}: Pendopo Joglo selesai! Atapnya menjulang anggun, dan angin sepoi-sepoi berembus di bawahnya.", "Semua warga lebih bahagia; pendatang lebih cepat datang; lomba 17-an bertambah; kerja bakti lebih sering."),
   _TP("Balai Megah", "Hari {hari}: Tahap terakhir: ukiran dan seperangkat gamelan. {nama} mulai memahat tiang pertama.",
       ["Ukiran sulur dan bunga mulai menghiasi tiang.", "Gamelan pertama tiba dari desa pengrajin.", "Semua ukiran dicat dan dipernis. Pendopo berkilau."],
       "Hari {hari}: Balai Desa Megah selesai! Gamelan ditabuh semalam suntuk, dan seluruh desa menari bersama.", "Festival dan Hari Jadi lebih meriah; kuota pasar bertambah.")]},
 "bendungan": {"nama": "Bendungan & Irigasi", "deskripsi": "Bendung, saluran, dan pintu air di tepi sungai agar sawah tetap berair saat kemarau dan aman saat banjir.", "tahap": [
   _TP("Bendung Bronjong Bambu", "Hari {hari}: {nama} mengukur arus sungai. Bronjong bambu berisi batu akan menahan air.",
       ["Bronjong bambu pertama diisi batu kali.", "Bronjong disusun melintang sungai.", "Celah-celah ditutup ijuk dan sabut."],
       "Hari {hari}: Bendung Bronjong Bambu selesai! Air sungai tertahan tenang, dan banjir lebih jarang datang.", "Banjir di musim hujan lebih jarang."),
   _TP("Saluran Induk", "Hari {hari}: Saluran induk mulai digali dari bendung ke sawah.",
       ["Parit selebar dua langkah sudah tergali.", "Dinding saluran dilapisi batu.", "Air pertama mengalir pelan ke petak terdekat."],
       "Hari {hari}: Saluran Induk selesai! Sawah di dekat saluran kini tetap tumbuh walau kemarau.", "Sawah dekat saluran tetap tumbuh saat kemarau; sumur tidak menyusut."),
   _TP("Pintu Air", "Hari {hari}: Pintu air papan akan mengatur kapan air dibuka dan ditutup.",
       ["Rangka pintu air dipasang.", "Papan pintu air dihaluskan dan diberi engsel.", "Roda pemutar pintu air diuji coba. Krek-krek!"],
       "Hari {hari}: Pintu Air selesai! Banjir dan longsor jauh berkurang, dan gagal panen makin jarang.", "Banjir dan longsor jauh berkurang; gagal panen kemarau lebih jarang."),
   _TP("Bendungan & Embung", "Hari {hari}: Proyek terbesar desa: bendungan dan embung penampung air.",
       ["Tanah embung digali bergotong royong.", "Dinding bendungan bata merah mulai menjulang.", "Air hujan mulai tertampung di embung yang luas."],
       "Hari {hari}: Bendungan & Embung selesai! Embung berkilau seperti cermin. Kemarau tidak lagi menakutkan.", "Air kemarau lebih awet; kekeringan jarang; ikan tetap ada saat kemarau.")]},
 "pendopo_reog": {"nama": "Pendopo Reog", "deskripsi": "Sanggar kesenian reog: tempat latihan jathil, bujang ganong, dan warok, sampai menjadi pendopo agung.", "tahap": [
   _TP("Sanggar Latihan", "Hari {hari}: {nama} membersihkan lahan untuk sanggar latihan reog.",
       ["Lantai tanah dipadatkan dan diberi tikar.", "Atap bambu sederhana dipasang.", "Kendang dan terompet pertama digantung di dinding."],
       "Hari {hari}: Sanggar Latihan selesai! Suara kendang terdengar setiap malam, dan warga sekitar ikut bergoyang.", "Malam di dekat sanggar lebih menyenangkan; tempat belajar gamelan."),
   _TP("Dadak Merak & Gamelan", "Hari {hari}: Saatnya membuat dadak merak dan melengkapi gamelan.",
       ["Rangka bambu dadak merak dibentuk.", "Ratusan bulu merak dirangkai satu per satu.", "Topeng barongan dicat merah menyala."],
       "Hari {hari}: Dadak Merak & Gamelan selesai! Desa kini bisa mementaskan reog di Hari Jadi dan 17 Agustus.", "Pentas reog di Hari Jadi & 17 Agustus; anak-anak ikut menari."),
   _TP("Pendopo Agung", "Hari {hari}: Sanggar diperbesar menjadi pendopo agung untuk pentas besar.",
       ["Tiang-tiang jati berukir berdiri.", "Atap joglo bertingkat mulai terpasang.", "Panggung pentas dipoles sampai mengilap."],
       "Hari {hari}: Pendopo Agung selesai! Pentas reog pertama di sini membuat penonton dari desa sebelah berdatangan.", "Harga jual pasar naik di hari festival; pendatang lebih tertarik.")]},
 "pasar_legi": {"nama": "Pasar Legi", "deskripsi": "Pasar desa yang tumbuh dari los bambu menjadi pasar batu bata yang ramai setiap hari pasaran.", "tahap": [
   _TP("Los Bambu", "Hari {hari}: Los bambu pertama didirikan di dekat pasar lama.",
       ["Tiang bambu los berdiri berjajar.", "Atap rumbia los dipasang.", "Meja-meja bambu untuk pedagang disusun."],
       "Hari {hari}: Los Bambu selesai! Pedagang betah berjualan, dan kuota pasar bertambah.", "Kuota pasar bertambah."),
   _TP("Hari Pasaran", "Hari {hari}: {nama} menghitung hari pasaran Jawa: Legi, Pahing, Pon, Wage, Kliwon.",
       ["Halaman pasar diratakan dengan batu.", "Papan nama hari pasaran digantung.", "Kelapa dan minyak disiapkan untuk pembukaan."],
       "Hari {hari}: Hari Pasaran resmi dimulai! Setiap Legi, pedagang pasti datang dan harga lebih bersahabat.", "Setiap Legi pedagang pasti datang; harga beli lebih murah hari itu."),
   _TP("Pasar Batu Bata", "Hari {hari}: Pasar diperkuat dengan dinding batu bata dan lantai batu.",
       ["Dinding batu bata mulai berdiri.", "Lantai batu dipasang rapi.", "Kios kopi dan kelapa dihias janur."],
       "Hari {hari}: Pasar Batu Bata selesai! Pasar Legi kini terkenal sampai kecamatan.", "Tambah slot kontrak; kopi dan kelapa lebih laku.")]},
}

kerja_bakti = {
 "_catatan": "KERJA_BAKTI (spec §2.1). Tombol di panel monumen; dipakai juga oleh dilema & keinginan.",
 "tombol": "Kerja bakti", "tooltip": "Semua warga dewasa & remaja membantu monumen sampai sore. Kerja lebih cepat, hati senang, makin akrab. Butuh sedikit makanan untuk makan bersama.",
 "tombol_kopi": "Sediakan kopi (+semangat)", "terkunci_lapar": "Warga sedang kesusahan pangan. Kerja bakti ditunda dulu.", "terkunci_malam": "Kerja bakti hanya bisa siang hari.",
 "cooldown": "Kerja bakti berikutnya bisa {jumlah} hari lagi.",
 "mulai": ["Hari {hari}: Dong-dong-dong! Kentongan dipukul pagi-pagi. Seluruh desa berkumpul untuk kerja bakti.",
           "Hari {hari}: {nama} memimpin kerja bakti hari ini. Semua membawa cangkul, pikulan, dan semangat."],
 "selama": ["Hari {hari}: Ibu-ibu membawa gorengan dan teh manis. Kerja bakti jadi terasa seperti pesta kecil.",
            "Hari {hari}: {nama} dan {nama2} berlomba siapa yang paling banyak mengangkut batu, sambil tertawa."],
 "selesai": ["Hari {hari}: Kerja bakti selesai. Desa bersih, monumen makin tinggi, dan semua makin akrab.",
             "Hari {hari}: Sore yang lelah tapi bahagia. Warga makan bersama di bawah pohon beringin."],
}

desa_teladan = {
 "_catatan": "TELADAN (spec §2.2). Penilaian Lomba Desa oleh Pak Camat, hari ke-21 tiap tahun (mulai tahun 2).",
 "gelar": {"rintisan": "Desa Rintisan", "swadaya": "Desa Swadaya", "swakarya": "Desa Swakarya", "swasembada": "Desa Swasembada", "teladan": "Desa Teladan Nasional"},
 "deskripsi": {"rintisan": "Desa baru yang sedang tumbuh.", "swadaya": "Desa yang mampu berdiri dengan tenaga warganya sendiri.",
               "swakarya": "Desa yang mulai berkarya dan membangun bersama.", "swasembada": "Desa yang cukup pangan dan rukun warganya.",
               "teladan": "Desa yang menjadi contoh bagi seluruh negeri."},
 "pratinjau_tahun1": ["Hari {hari}: Pak Camat lewat naik sepeda dan berhenti sebentar. \"Desanya asri. Tahun depan saya datang menilai, ya!\""],
 "kedatangan": ["Hari {hari}: Pak Camat datang bersama rombongan untuk Penilaian Lomba Desa. Warga berbaris rapi di depan gapura.",
                "Hari {hari}: Pak Camat berkeliling desa, mencatat di bukunya sambil mengangguk-angguk."],
 "naik_gelar": ["Hari {hari}: Selamat! Desa kita kini menyandang gelar {gelar}! Sorak-sorai membahana, dan piagam dipasang di Balai.",
                "Hari {hari}: Pak Camat menyerahkan piagam {gelar}. {nama} menerimanya dengan tangan gemetar bahagia."],
 "tetap": ["Hari {hari}: Pak Camat tersenyum. \"Sudah bagus. Pertahankan, ya.\" Desa tetap menyandang gelarnya."],
 "ditangguhkan": ["Hari {hari}: Pak Camat menepuk bahu kepala desa. \"Tahun ini agak berat, ya. Saya berharap tahun depan lebih baik.\" Bonus gelar ditangguhkan sementara."],
 "ending": ["Hari {hari}: Desa Teladan Nasional! Piala kecil berkilau di Balai. Dari dua orang di tepi hutan, kini berdiri desa yang guyub dan mandiri. Terima kasih sudah membangunnya bersama. Cerita boleh terus berlanjut..."],
 "panel": {"judul": "Gelar Desa", "poin": "Poin Teladan: {jumlah}", "syarat": "Syarat {gelar}", "penilaian_berikut": "Penilaian berikutnya: hari ke-{hari}"},
}

lomba_17_agustus = {
 "_catatan": "AGUSTUSAN (spec §2.3): hari ke-21 tiap tahun (kemarau hari ke-7). Tahun 1 gratis & 2 lomba. {nama} = peserta/juara, {nama2} = peserta lain.",
 "panitia": {"judul": "Panitia 17-an", "teks": "Sebentar lagi 17 Agustus! Pilih lomba yang akan diadakan tahun ini.", "slot": "Lomba dipilih: {jumlah}/{jumlah2}",
             "umbul": "Pasang umbul-umbul (bambu)", "tahun1": "Tahun pertama: warga patungan seadanya, lomba gratis.", "tukar_peserta": "Tukar peserta",
             "log": ["Hari {hari}: Panitia 17-an dibentuk di pendopo. {nama} terpilih jadi ketua dan langsung sibuk mencatat."]},
 "umbul_umbul": ["Hari {hari}: Umbul-umbul merah putih berkibar di sepanjang jalan desa. Semua jadi bersemangat."],
 "malam_tirakatan": ["Hari {hari}: Malam tirakatan. Warga duduk melingkar di dekat api unggun, mendengarkan para tetua bercerita tentang perjuangan para pahlawan.",
                     "Hari {hari}: Tumpeng tirakatan dipotong dan dibagi. Doa bersama untuk negeri mengalun pelan."],
 "upacara": ["Hari {hari}: Pagi-pagi seluruh desa berkumpul untuk upacara bendera. {nama} mengibarkan sang merah putih dengan khidmat.",
             "Hari {hari}: Lagu Indonesia Raya berkumandang di lapangan desa. Anak-anak berdiri tegap, dan para tetua mengusap mata."],
 "lomba": {
  "balap_karung": {"nama": "Balap karung", "deskripsi": "Melompat dalam karung sampai garis akhir.",
   "mulai": ["Hari {hari}: Peserta balap karung berbaris di garis start, karung sampai pinggang."],
   "lucu": ["Hari {hari}: {nama} melompat terlalu semangat dan berguling sampai garis akhir. Tetap dihitung!"],
   "rival_jatuh": ["Hari {hari}: {nama} dan {nama2} jatuh bertumpuk di tengah lintasan. Mereka tertawa bersama sampai lupa sedang bermusuhan."],
   "menang": ["Hari {hari}: {nama} memenangkan balap karung dengan lompatan seperti kodok sawah!"]},
  "makan_kerupuk": {"nama": "Makan kerupuk", "deskripsi": "Menghabiskan kerupuk yang digantung tanpa memakai tangan.",
   "mulai": ["Hari {hari}: Kerupuk bergoyang di atas tali. Peserta berdiri dengan tangan di belakang."],
   "lucu": ["Hari {hari}: Setiap kali {nama} hampir menggigit, kerupuknya berayun menjauh. Penonton berteriak memberi semangat."],
   "menang": ["Hari {hari}: Kriuk-kriuk! {nama} menghabiskan kerupuknya paling cepat dan menang!"]},
  "tarik_tambang": {"nama": "Tarik tambang", "deskripsi": "Dua regu beradu kuat menarik tambang tebal.",
   "mulai": ["Hari {hari}: Regu sawah melawan regu hutan! Tambang tebal terbentang di tengah lapangan."],
   "salaman": ["Hari {hari}: Setelah lomba, {nama} dan {nama2} yang berbeda regu bersalaman dan tertawa. Persaingan mencair."],
   "menang": ["Hari {hari}: Dengan aba-aba {nama}, regunya menarik serempak dan menang! Mereka berpelukan berlumur lumpur."]},
  "panjat_pinang": {"nama": "Panjat pinang", "deskripsi": "Memanjat batang pinang licin untuk meraih hadiah di puncak. Harus kerja sama!",
   "mulai": ["Hari {hari}: Batang pinang licin berdiri di lapangan. Hadiah bergantungan di puncaknya: perkakas, kopi, dan kain."],
   "coba_gagal": ["Hari {hari}: Tim {nama} merosot lagi! Semua belepotan, penonton tertawa sampai sakit perut."],
   "menang": ["Hari {hari}: Dengan bersusun bahu, tim {nama} meraih puncak pinang! Sorak-sorai membahana."],
   "gagal_semua": ["Hari {hari}: Tidak ada yang sampai puncak tahun ini, tapi semua pulang dengan tawa dan baju penuh lumpur."]},
  "bakiak": {"nama": "Bakiak", "deskripsi": "Tiga orang melangkah bersama di atas terompah panjang.",
   "mulai": ["Hari {hari}: Bakiak panjang dibagikan. Setiap tim harus melangkah dengan irama yang sama."],
   "lucu": ["Hari {hari}: Tim {nama} terus berteriak \"kiri, kanan!\" tapi tetap jatuh bersama-sama."],
   "menang": ["Hari {hari}: Tim {nama} melangkah kompak seperti satu tubuh dan menang lomba bakiak!"]},
  "kelereng_sendok": {"nama": "Kelereng sendok", "deskripsi": "Anak-anak membawa kelereng di atas sendok yang digigit.",
   "mulai": ["Hari {hari}: Anak-anak berbaris dengan sendok di mulut. Kelereng bergoyang-goyang."],
   "lucu": ["Hari {hari}: Kelereng {nama} jatuh tiga kali, tapi ia tetap tersenyum sambil menggigit sendok."],
   "menang": ["Hari {hari}: {nama} berjalan pelan tapi pasti dan menang lomba kelereng! Orang tuanya bersorak paling keras."]},
  "hias_gapura": {"nama": "Hias gapura & kampung", "deskripsi": "Menghias gapura dan jalan desa dengan janur, bambu, dan bendera.",
   "mulai": ["Hari {hari}: Warga menganyam janur dan mengecat bambu merah putih."],
   "selesai": ["Hari {hari}: Gapura desa berhias janur dan bendera. Pak Camat pasti terkesan!"]},
  "pawai_reog": {"nama": "Pawai reog", "deskripsi": "Karnaval reog keliling desa diikuti seluruh warga.",
   "mulai": ["Hari {hari}: Kendang ditabuh, dan dadak merak memimpin pawai keliling desa!"],
   "selesai": ["Hari {hari}: Pawai reog membuat penonton dari desa sebelah berdatangan. Desa kita jadi buah bibir."]},
 },
 "panggung_hiburan": ["Hari {hari}: Malamnya panggung hiburan digelar. Juara diumumkan, dan semua bertepuk tangan.",
                      "Hari {hari}: Lampu minyak kelapa menerangi panggung. Ada lagu, lawak, dan tawa sampai larut."],
 "juara_umum": ["Hari {hari}: {nama} menjadi juara umum 17-an tahun ini! Piala kecil dari bambu diserahkan dengan bangga."],
}

target_tahunan = {
 "_catatan": "YEAR_GOALS (spec §2.4). Panel muncul di Hari Jadi. {tahun} = tahun ke-N.",
 "panel": {"judul": "Rencana Desa Tahun ke-{tahun}", "utama": "Target utama", "pilihan": "Target pilihan", "syarat_piagam": "Selesaikan {jumlah} dari {jumlah2} untuk Piagam Tahunan",
           "progres": "{jumlah}/{jumlah2} selesai", "piagam_dapat": "Piagam Tahunan diraih!"},
 "pembuka": ["Hari {hari}: Selamat Hari Jadi! Warga berkumpul di pendopo menyusun Rencana Desa Tahun ke-{tahun}.",
             "Hari {hari}: Tahun ke-{tahun} dimulai. Kepala desa membacakan rencana tahun ini di depan warga."],
 "piagam": ["Hari {hari}: Piagam Tahunan diraih! Kerja keras tahun ini dipajang di dinding Balai.",
            "Hari {hari}: Tahun ini berhasil! Piagam Tahunan dibingkai bambu dan digantung di pendopo."],
 "tanpa_piagam": ["Hari {hari}: Tahun ini belum semua target tercapai. Tidak apa-apa, tahun depan kita coba lagi bersama."],
 "kenangan_tahun": ["Tahun ke-{tahun}: desa tumbuh, tertawa, dan belajar bersama."],
 "nama_target": {"capai_era": "Capai era {era}", "bangun": "Bangun {jumlah} {bangunan}", "tanpa_jenjang": "Lewati kemarau tanpa krisis pangan",
   "lomba_ikut": "Adakan lomba 17-an", "keinginan_terpenuhi": "Penuhi {jumlah} keinginan warga", "tahap_monumen": "Selesaikan {jumlah} tahap monumen",
   "gelar_teladan": "Raih gelar {gelar}", "pasangan": "{jumlah} pasangan baru", "sahabat": "{jumlah} pasang sahabat", "cerita_selesai": "Selesaikan {jumlah} cerita warga",
   "monumen_selesai": "Selesaikan {jumlah} monumen", "riset": "Selesaikan {jumlah} riset", "kelahiran": "{jumlah} kelahiran", "lomba_menang": "Menang {jumlah} lomba",
   "anak_bekerja": "Anak desa mulai bekerja", "keinginan_khusus": "Wujudkan keinginan menabung untuk naik haji", "capai_penduduk": "Capai {jumlah} penduduk",
   "generasi_berpasangan": "{jumlah} pasangan generasi kedua", "penilaian_teladan": "Ikut penilaian Desa Teladan Nasional", "tanpa_kematian_lapar": "Setahun tanpa kematian karena kelaparan",
   "generasi": "Generasi ke-{jumlah} lahir"},
 "ending_mandiri": "Hari {hari}: Desa Mandiri. Delapan tahun berlalu sejak dua orang menyalakan api unggun pertama. Kini desa ini berdiri guyub, mandiri, dan penuh cerita. Terima kasih, Kepala Desa.",
}

# ---- v1.5.0 bagian c4 ----
_EFEK_OK = None  # diisi saat build dari meta (sumber_daya + kunci_efek)
def _F(ef):
    ok = {k: v for k, v in ef.items() if k in _EFEK_OK and isinstance(v, (int, float))}
    lain = [k for k in ef if k not in ok]
    return ok, lain
def _T(kunci, hari, peluang, ef, teks, usulan=False):
    ok, lain = _F(ef)
    t = {"kunci": kunci, "hari_tunda": hari, "peluang": peluang, "efek_tertunda": ok, "teks_tertunda": teks}
    if usulan: t["usulan_dokumen"] = True  # tidak ada di spec §3.3; programmer boleh memakai atau mengabaikan
    if lain: t["mekanik_lain"] = lain
    return t
def _O(teks, ef, hasil, tertunda=()):
    ok, lain = _F(ef)
    o = {"teks": teks, "efek": ok, "teks_hasil": hasil}
    if lain: o["mekanik_lain"] = lain
    if tertunda:
        o["tertunda"] = list(tertunda)
        o["hari_tunda"] = tertunda[0]["hari_tunda"]; o["teks_tertunda"] = tertunda[0]["teks_tertunda"]
    return o
def _D(id, kelas, judul, desk, pilihan, kategori="kepala_desa"):
    return {"id": id, "kelas": kelas, "judul": judul, "kategori": kategori, "deskripsi": desk, "pilihan": pilihan}

def buat_dilema():
  return [
 _D("buka_hutan", "B", "Membuka Hutan", "Warga ingin sawah baru. Hutan di lereng dekat desa bisa dibuka, tapi para tetua mengingatkan: hutan menahan air dan tanah.", [
   _O("Biarkan hutan tetap rimbun", {}, "Hutan tetap rimbun. Beberapa petani menghela napas, tapi para tetua tersenyum.",
      [_T("hutan_berbuah", [6, 10], 0.3, {"makanan": 3}, "Hari {hari}: Hutan yang dijaga sejak hari {hari_keputusan} berbuah lebat. Warga pulang membawa sekeranjang buah liar.")]),
   _O("Buka 2 petak di pinggir hutan", {"kayu": 20, "ladang_gratis": 1}, "Dua petak dibuka. Kayu menumpuk dan ladang baru siap ditanami.",
      [_T("banjir_hulu", [5, 12], 0.25, {"banjir": 1}, "Hari {hari}: Air bah turun dari hulu. Hutan yang dibuka hari {hari_keputusan} tidak lagi menahan hujan.")]),
   _O("Buka lereng yang luas", {"kayu": 45, "ladang_gratis": 3, "ancaman_mult": 1}, "Lereng terbuka lebar. Kayu melimpah dan tiga ladang baru siap, tapi babi hutan kehilangan rumahnya.",
      [_T("longsor_lereng", [6, 14], 0.45, {"longsor": 1, "kesehatan_bangunan_dekat": -25, "pertumbuhan_ladang": -1}, "Hari {hari}: Longsor! Lereng yang dibuka hari {hari_keputusan} tidak kuat menahan hujan deras.")])]),
 _D("rombongan_pendatang", "R", "Rombongan Pendatang", "Serombongan keluarga dari desa yang kebanjiran tiba dengan wajah lelah. Mereka meminta tempat berteduh.", [
   _O("Beri singgah semalam", {"makanan": -2, "suasana_hati": 2}, "Rombongan menginap semalam di pendopo dan pamit pagi-pagi dengan penuh terima kasih.",
      [_T("kiriman_terima_kasih", [10, 20], 0.5, {"kopi": 3, "alat": 1}, "Hari {hari}: Kiriman datang dari rombongan yang singgah hari {hari_keputusan}: sekantong kopi dan sebuah perkakas, dengan surat terima kasih.")]),
   _O("Ajak 2 orang menetap", {"makanan": -4, "penduduk": 2, "pendatang_sifat": 1}, "Dua orang memutuskan menetap. Mereka langsung membantu di sawah keesokan harinya.",
      [_T("kangen_kampung", [7, 14], 0.25, {"pamit_pendatang": 1}, "Hari {hari}: Salah satu pendatang yang menetap hari {hari_keputusan} kangen kampung dan pamit baik-baik.")]),
   _O("Tolak dengan sopan", {}, "Rombongan melanjutkan perjalanan. Beberapa warga menunduk, merasa tidak enak.",
      [_T("gosip_penolakan", [5, 10], 0.2, {"rel_acak": -3}, "Hari {hari}: Gosip soal penolakan hari {hari_keputusan} menyebar di sumur. Suasana jadi sedikit canggung.")])]),
 _D("pencuri_singkong", "R", "Pencuri Singkong", "Seorang pemuda dari desa sebelah tertangkap mencabut singkong di tegalan. Badannya kurus, wajahnya ketakutan.", [
   _O("Maafkan dan beri bekal", {"makanan": -2}, "Pemuda itu menangis dan berterima kasih. Ia pulang membawa sekantong singkong.",
      [_T("pemuda_balas_budi", [7, 14], 0.4, {"kayu": 10, "batu": 5}, "Hari {hari}: Pemuda yang dimaafkan hari {hari_keputusan} datang lagi, kali ini membawa kayu dan batu untuk membalas budi."),
       _T("mencuri_lagi", [10, 20], 0.15, {"makanan": -4}, "Hari {hari}: Singkong hilang lagi dari tegalan. Sepertinya kebaikan hari {hari_keputusan} belum cukup.")]),
   _O("Hukum kerja bakti 3 hari", {"kayu": 12, "batu": 6}, "Pemuda itu bekerja tiga hari mengangkut kayu dan batu. Ia belajar, desa pun terbantu.",
      [_T("tetangga_tersinggung", [3, 8], 0.3, {"harga_beli_pangan": 10}, "Hari {hari}: Desa sebelah tersinggung dengan hukuman hari {hari_keputusan}. Pedagang dari sana menaikkan harga.")]),
   _O("Lapor ke polisi kecamatan", {"suasana_hati": -2}, "Polisi datang dan membawa pemuda itu. Desa terasa sedikit muram.",
      [_T("ganti_rugi_polisi", [3, 3], 1.0, {"makanan": 2}, "Hari {hari}: Keluarga pemuda itu datang membayar ganti rugi atas kejadian hari {hari_keputusan}, sambil meminta maaf.")])]),
 _D("tengkulak_padi", "B", "Tengkulak Datang", "Seorang tengkulak menawar padi desa dengan harga lumayan. \"Bayar kontan, Pak Kepala Desa!\"", [
   _O("Simpan padi untuk kemarau", {}, "Tengkulak pergi dengan kecewa. Lumbung tetap penuh.",
      [_T("lumbung_aman", [5, 12], 1.0, {"suasana_hati": 3}, "Hari {hari}: Kemarau datang, dan lumbung yang disimpan sejak hari {hari_keputusan} membuat warga tenang.")]),
   _O("Jual 20 padi", {"gandum": -20, "alat": 2, "papan": 6}, "Padi ditukar perkakas dan papan. Gudang jadi lebih lengkap.",
      [_T("harga_beras_naik", [9, 14], 0.35, {"harga_beli_pangan": 30}, "Hari {hari}: Harga beras naik di kemarau. Padi yang dijual hari {hari_keputusan} kini terasa mahal untuk dibeli kembali."),
       _T("timbangan_curang", [1, 2], 0.3, {"alat": -1}, "Hari {hari}: Ketahuan, timbangan tengkulak hari {hari_keputusan} ternyata tidak pas. Satu perkakas yang dijanjikan tidak pernah datang. Lain kali, ajak warga yang jujur ikut menimbang.")]),
   _O("Jual 40 padi borongan", {"gandum": -40, "alat": 4, "papan": 12, "kopi": 3}, "Gerobak tengkulak penuh. Desa mendapat perkakas, papan, dan kopi.",
      [_T("harga_beras_naik", [9, 14], 0.5, {"harga_beli_pangan": 30, "suasana_hati": -3}, "Hari {hari}: Harga beras melonjak di kemarau. Warga mulai menyesali borongan hari {hari_keputusan}."),
       _T("timbangan_curang", [1, 2], 0.3, {"alat": -2}, "Hari {hari}: Borongan hari {hari_keputusan} ternyata ditimbang dengan timbangan yang tidak pas. Dua perkakas kurang dari janji. Warga menghela napas.")])]),
 _D("rentenir", "B", "Rentenir Menawarkan Pinjaman", "Seorang rentenir berpeci datang menawarkan pinjaman kayu dan batu. \"Bayarnya nanti saja, bunganya kecil,\" katanya sambil tersenyum lebar.", [
   _O("Tolak, kita kerja bakti saja", {"kerja_bakti_gratis": 1}, "Rentenir pergi. Warga kerja bakti mengumpulkan bahan sendiri, dan hati terasa lega."),
   _O("Pinjam sedikit", {"kayu": 30, "batu": 20, "utang": 1}, "Kayu dan batu datang. Tapi ada catatan utang yang harus dibayar dalam 14 hari.",
      [_T("tagihan_rentenir", [14, 14], 1.0, {}, "Hari {hari}: Rentenir datang menagih utang hari {hari_keputusan}. Jumlahnya ternyata lebih besar dari pinjaman.", usulan=True)]),
   _O("Pinjam banyak", {"kayu": 60, "batu": 40, "papan": 10, "utang": 1}, "Bahan bangunan melimpah. Utang besar harus dibayar dalam 21 hari.",
      [_T("tagihan_rentenir", [21, 21], 1.0, {}, "Hari {hari}: Rentenir datang menagih pinjaman besar hari {hari_keputusan}. Warga saling pandang dengan cemas.", usulan=True)])]),
 _D("tambang_pasir", "B", "Tambang Pasir Kali", "Pasir kali bisa ditambang untuk bangunan. Seorang pengusaha dari luar juga menawarkan kerja sama.", [
   _O("Tolak, biarkan kali tetap jernih", {"suasana_hati": 1}, "Kali tetap jernih. Anak-anak masih bisa mandi dan menangkap ikan."),
   _O("Tambang kecil oleh warga", {"hasil_harian": 1}, "Warga menambang pasir sedikit demi sedikit selama seminggu.",
      [_T("tebing_kali_gerus", [8, 20], 0.3, {"banjir_mult": 1, "ikan_mult": 1}, "Hari {hari}: Tebing kali tergerus sejak penambangan hari {hari_keputusan}. Air lebih cepat meluap, ikan makin sedikit.")]),
   _O("Serahkan ke pengusaha luar", {"batu": 80, "alat": 3, "suasana_hati": -4, "teladan_poin": -0.5, "suap": 1}, "Truk pengusaha datang dan pergi, dan sebuah amplop \"uang rokok\" terselip di meja balai. Batu dan perkakas menumpuk, tapi kali jadi keruh.",
      [_T("kali_rusak", [8, 20], 0.6, {"banjir": 1, "kesehatan_jembatan": -20, "ikan_mult": 1}, "Hari {hari}: Kali yang ditambang sejak hari {hari_keputusan} meluap dan merusak jembatan. Ikan hampir hilang."),
       _T("suap_bocor", [2, 6], 0.4, {"suasana_hati": -3, "rel_jujur_kades": -5}, "Hari {hari}: Kabar soal amplop dari pengusaha hari {hari_keputusan} sampai ke telinga warga yang jujur. Mereka kecewa, dan suasana desa jadi canggung.")])]),
 _D("hajatan", "B", "Hajatan", "{nama} ingin mengadakan hajatan. Keluarganya bertanya: sederhana saja, atau besar-besaran?", [
   _O("Syukuran sederhana", {"makanan": -4, "mood_aktor": 8, "suasana_hati": 3}, "Syukuran sederhana di pendopo terasa khidmat dan hangat."),
   _O("Tumpeng dan gamelan", {"makanan": -12, "kelapa": -4, "kopi": -2, "suasana_hati": 10, "rel_semua": 3}, "Tumpeng tinggi dan gamelan mengalun. Semua warga makan dan tertawa bersama.",
      [_T("doa_restu", [20, 35], 0.3, {"hamil_mult_aktor": 1.3}, "Hari {hari}: Doa restu dari hajatan hari {hari_keputusan} seolah terkabul. Keluarga {nama} sangat bahagia.")]),
   _O("Hajatan besar dengan reog", {"makanan": -20, "kayu": -10, "minyak": -4, "suasana_hati": 18, "pendatang_mult": 1}, "Hajatan paling meriah yang pernah ada! Penonton dari desa sebelah berdatangan.",
      [_T("dapur_kosong_setelah_pesta", [3, 5], 0.4, {"suasana_hati": -5}, "Hari {hari}: Dapur terasa kosong setelah pesta hari {hari_keputusan}. Warga mulai mengencangkan ikat pinggang.")])]),
 _D("tanah_warisan", "B", "Tanah Warisan", "{nama} dan {nama2} sama-sama merasa berhak atas sepetak sawah. Keduanya datang ke kepala desa.", [
   _O("Bagi rata", {"rel_AB": 5, "mood_AB": -2}, "Sawah dibagi dua dengan patok bambu. Keduanya kurang puas, tapi menerima."),
   _O("Berikan kepada yang menggarap", {"mood_A": 8, "mood_B": -10, "rel_AB": -20, "kerja_mult_A": 1}, "{nama} mendapat sawahnya. {nama2} pulang dengan wajah merah.",
      [_T("jadi_rival", [3, 10], 0.5, {"rel_AB": -15}, "Hari {hari}: Sejak keputusan hari {hari_keputusan}, {nama} dan {nama2} saling buang muka.")]),
   _O("Musyawarah di Balai", {"hari_kerja_hilang_AB": 0.5}, "Musyawarah panjang di Balai, ditemani teh dan pisang goreng.",
      [_T("musyawarah_rukun", [1, 1], 1.0, {"rel_AB": 10, "mood_AB": 3, "suasana_hati": 3}, "Hari {hari}: Musyawarah hari {hari_keputusan} membuahkan hasil. {nama} dan {nama2} bersalaman dan tertawa.")])]),
 _D("rebutan_air", "B", "Rebutan Air", "Air tinggal sedikit di puncak kemarau. Warga berselisih: air untuk minum atau untuk sawah?", [
   _O("Utamakan air minum", {"pertumbuhan_ladang_sawah": -1}, "Air minum aman. Sebagian padi terpaksa layu."),
   _O("Giliran seperti ulu-ulu", {"pertumbuhan_ladang_sawah": -0.5, "rel_acak3": 3, "suasana_hati": -1}, "Ulu-ulu desa membagi giliran air dengan adil. Tidak ada yang puas sepenuhnya, tapi semua rukun."),
   _O("Utamakan sawah", {"air": -10}, "Air dialirkan ke sawah. Padi selamat, tapi kendi di rumah-rumah hampir kosong.",
      [_T("diare_kemarau", [2, 4], 0.4, {"sakit_acak": 1}, "Hari {hari}: Beberapa warga minum air keruh sejak air dialirkan ke sawah hari {hari_keputusan}. Diare menyerang. Ingat, rebus air minum!")])]),
 _D("beringin_keramat", "B", "Beringin Keramat", "Pohon beringin tua di tengah desa menghalangi lahan baru. Pedagang kayu sudah menawar. Para tetua menggeleng.", [
   _O("Rawat dan adakan selamatan", {"makanan": -3, "suasana_hati": 4, "aura_beringin_mult": 1.25}, "Selamatan kecil di bawah beringin. Akar-akarnya dibersihkan, dan anak-anak kembali berayun di sana."),
   _O("Pangkas dahannya saja", {"kayu": 15}, "Dahan-dahan besar dipangkas. Beringin masih berdiri, walau tidak serimbun dulu.",
      [_T("ular_turun", [2, 4], 0.2, {"ancaman_mult": 1}, "Hari {hari}: Ular-ular yang dulu tinggal di dahan beringin turun ke rumah warga sejak pemangkasan hari {hari_keputusan}.")]),
   _O("Tebang beringinnya", {"kayu": 60, "hapus_beringin": 1, "suasana_hati": -6, "teladan_poin": -1}, "Beringin tumbang dengan suara berdebum. Kayu melimpah, tapi tengah desa terasa gersang.",
      [_T("mimpi_buruk", [7, 14], 0.5, {"mood_harian": -3}, "Hari {hari}: Beberapa warga bermimpi buruk sejak beringin ditebang hari {hari_keputusan}. Desa terasa kehilangan sesuatu.")])]),
 _D("obat_sakit", "R", "Mengobati yang Sakit", "Ada warga yang sakit dan belum juga membaik. Bagaimana sebaiknya mereka diobati?", [
   _O("Jamu kunyit-temulawak", {"makanan": -2, "sembuh_mult": 1.2}, "Jamu hangat diminum pagi dan sore. Pelan-pelan yang sakit mulai pulih."),
   _O("Panggil mantri kesehatan", {"alat": -1, "sembuh_mult": 2, "mati_parah_mult": 0.3}, "Mantri datang membawa obat dan nasihat: rebus air minum, istirahat cukup."),
   _O("Pijat dan suwuk Mbah Dukun", {"makanan": -1, "mood_aktor": 6}, "Mbah Dukun memijat dan berdoa. Yang sakit merasa lebih tenang.",
      [_T("suwuk_manjur", [1, 1], 0.5, {"sembuh_mult": 1.8}, "Hari {hari}: Yang dipijat Mbah Dukun hari {hari_keputusan} bangun lebih segar dari dugaan semua orang.")])]),
 _D("pupuk_penyuluh", "B", "Penyuluh Pertanian", "Penyuluh dari kecamatan datang menawarkan pupuk kimia gratis. \"Panen pasti melimpah!\" katanya.", [
   _O("Pakai kompos sendiri", {"makanan": -3, "hasil_panen_add": 1}, "Warga membuat kompos dari daun dan kotoran ternak. Tanah tetap gembur."),
   _O("Terima pupuk kimia", {"hasil_panen_mult": 1.3}, "Padi tumbuh hijau pekat. Panen berikutnya terlihat menjanjikan.",
      [_T("tanah_keras", [30, 45], 0.5, {"hasil_panen_mult": 0.85}, "Hari {hari}: Tanah sawah mengeras sejak pupuk kimia hari {hari_keputusan}. Kompos bisa memulihkannya pelan-pelan.")]),
   _O("Tolak dengan sopan", {}, "Penyuluh mengangguk dan pergi. Sawah tetap seperti biasa.")]),
 _D("sekolah_kota", "B", "Sekolah di Kota", "{nama} masih muda dan haus ilmu. Ada tawaran sekolah atau bekerja di kota.", [
   _O("Belajar di desa saja", {"skill_gain_aktor": 1.2}, "{nama} belajar dari para tetua dan pengrajin desa. Ilmunya bertambah setiap hari."),
   _O("Sekolah di kota 28 hari", {"makanan": -4, "kerja_mult_aktor": 0.5}, "{nama} berangkat dengan bekal dan buku. Desa melambai mengantarnya.",
      [_T("pulang_sekolah", [28, 28], 1.0, {"progres_riset": 15}, "Hari {hari}: {nama} pulang dari sekolah yang dimulai hari {hari_keputusan}, membawa ilmu baru dan cerita tentang kota.")]),
   _O("Merantau kerja 21 hari", {"absen_aktor": 21}, "{nama} merantau ke kota untuk bekerja. Rumahnya terasa sepi.",
      [_T("pulang_merantau", [21, 21], 1.0, {"alat": 3, "kopi": 5}, "Hari {hari}: {nama} pulang dari rantau yang dimulai hari {hari_keputusan}, membawa perkakas dan kopi untuk desa."),
       _T("betah_di_kota", [21, 21], 0.25, {}, "Hari {hari}: Surat dari {nama}: ia betah di kota dan akan pulang seminggu lagi."),
       _T("pulang_bawa_jodoh", [21, 28], 0.1, {"penduduk": 1}, "Hari {hari}: {nama} pulang dari kota bersama calon pendamping hidupnya! Desa heboh dan bahagia.")])]),
 _D("kerbau_tetangga", "R", "Kerbau Tetangga", "Kerbau milik desa sebelah lepas dan menginjak-injak ladang yang sedang tumbuh.", [
   _O("Selesaikan dengan damai", {"pertumbuhan_ladang": -0.5, "rel_tetangga": 1}, "Kerbau dikembalikan baik-baik. Pemiliknya membungkuk berkali-kali minta maaf.",
      [_T("bibit_kiriman", [7, 14], 0.4, {"makanan": 3}, "Hari {hari}: Pemilik kerbau yang lepas hari {hari_keputusan} mengirim bibit dan sekeranjang jagung.")]),
   _O("Minta ganti rugi", {"pertumbuhan_ladang": -0.5, "makanan": 3}, "Ganti rugi dibayar dengan jagung, tapi suasana jadi agak canggung.",
      [_T("tetangga_marah", [3, 8], 0.3, {"harga_beli_pangan": 10}, "Hari {hari}: Desa sebelah masih kesal soal ganti rugi hari {hari_keputusan}. Harga dari pedagang mereka naik.")]),
   _O("Tahan kerbaunya 3 hari untuk membajak", {"pertumbuhan_ladang": -0.5, "tanam_mult": 0.7}, "Kerbau itu membantu membajak sawah tiga hari. Pekerjaan jadi cepat.",
      [_T("pemilik_kerbau_datang", [3, 3], 0.5, {"suasana_hati": -3, "rel_tetangga": -1}, "Hari {hari}: Pemilik kerbau datang dengan wajah masam soal kerbau yang ditahan sejak hari {hari_keputusan}.")])]),
 _D("monyet_kebun", "R", "Monyet di Kebun", "Kawanan monyet sudah berkali-kali mencuri pisang dan jagung. Warga mulai kesal.", [
   _O("Pasang orang-orangan sawah", {"bambu": -2, "sabut": -1, "bangun_gratis": 1}, "Orang-orangan bertopi caping berdiri gagah. Monyet-monyet ragu mendekat."),
   _O("Sisihkan pisang di tepi hutan", {"biaya_berkala": 1, "ancaman_mult": 0.3}, "Sesisir pisang diletakkan di tepi hutan. Monyet-monyet kenyang dan jarang masuk desa."),
   _O("Pasang jerat", {"ancaman_mult": 0, "teladan_poin": -0.5}, "Jerat dipasang di sekitar kebun. Monyet tidak datang lagi.",
      [_T("monyet_terluka", [2, 6], 0.3, {"suasana_hati": -4}, "Hari {hari}: Seekor anak monyet terkilir kena jerat yang dipasang hari {hari_keputusan}, lalu berhasil lepas ke hutan. Anak-anak desa sedih melihatnya.")])]),
 _D("tanggap_reog", "B", "Tanggap Reog", "Rombongan reog keliling menawarkan pentas di desa. Warga sudah tidak sabar.", [
   _O("Tonton dari jauh saja", {"suasana_hati": 2}, "Warga menonton reog yang lewat di jalan desa sebelah. Lumayan seru!"),
   _O("Tanggap reog di desa", {"makanan": -8, "kopi": -2, "suasana_hati": 12, "rel_semua": 3, "pentas_reog": 1}, "Dadak merak berputar di halaman pendopo! Seluruh desa bersorak dan menari."),
   _O("Tanggap sekalian minta diajari", {"makanan": -12, "suasana_hati": 10, "pentas_reog": 1, "diskon_monumen": 0.3}, "Setelah pentas, para warok mengajari warga menari. Ada yang mulai bermimpi punya sanggar sendiri.",
      [_T("anak_belajar_menari", [5, 10], 0.5, {"suasana_hati": 2}, "Hari {hari}: Sejak pentas hari {hari_keputusan}, anak-anak berlatih menari jathil di halaman setiap sore. Para orang tua menonton sambil tersenyum.", usulan=True)])]),
 _D("ronda_wajib", "R", "Ronda Wajib", "Setelah serangan semalam, warga cemas. Perlukah ronda bergilir setiap malam?", [
   _O("Ronda bergilir 7 malam", {"ronda": 1, "ancaman_mult": 0.6}, "Jadwal ronda ditempel di pos. Kentongan terdengar setiap malam."),
   _O("Pasang oncor di sekeliling desa", {"minyak": -3, "ancaman_mult": 0.8}, "Oncor menyala di sekeliling desa. Malam terasa lebih terang dan aman."),
   _O("Biarkan saja", {}, "Semua tidur seperti biasa. Semoga malam tetap tenang.",
      [_T("ladang_diacak", [1, 4], 0.3, {"pertumbuhan_ladang": -0.5}, "Hari {hari}: Tanpa ronda sejak hari {hari_keputusan}, babi hutan sempat mengacak-acak ladang semalam. Untung tidak ada yang terluka.", usulan=True)])]),
 _D("bantu_tetangga", "B", "Bantu Desa Tetangga", "Desa tetangga baru saja dilanda bencana. Mereka butuh bantuan.", [
   _O("Kirim bantuan makanan dan kayu", {"makanan": -6, "kayu": -10, "suasana_hati": 6, "teladan_poin": 0.5}, "Gerobak bantuan berangkat. Warga desa tetangga menyambut dengan haru.",
      [_T("balas_budi_tetangga", [14, 28], 0.6, {"alat": 2, "hasil_panen_add": 1}, "Hari {hari}: Desa tetangga yang dibantu hari {hari_keputusan} datang membalas budi dengan perkakas dan bibit unggul.")]),
   _O("Kirim 2 tenaga selama 2 hari", {"absen_acak": 1, "rel_yang_pergi": 8, "teladan_poin": 0.5}, "Dua warga berangkat membantu. Mereka pulang dengan cerita dan sahabat baru.",
      [_T("balas_budi_tetangga", [14, 28], 0.6, {"alat": 1}, "Hari {hari}: Desa tetangga mengirim perkakas sebagai ucapan terima kasih atas tenaga yang dikirim hari {hari_keputusan}.")]),
   _O("Maaf, belum bisa membantu", {}, "Utusan desa tetangga mengangguk mengerti, lalu pulang.")]),
 _D("jalan_desa", "B", "Jalan Desa", "Jalan desa becek dan berlubang. Ada tawaran membangunnya bersama, atau membayar orang luar.", [
   _O("Nanti saja", {}, "Jalan tetap becek. Mungkin lain waktu.",
      [_T("tawaran_lagi", [28, 42], 1.0, {}, "Hari {hari}: Tawaran membangun jalan desa yang ditunda hari {hari_keputusan} datang lagi.")]),
   _O("Kerja bakti sehari penuh", {"hari_kerja_hilang": 1, "suasana_hati": 3, "rel_semua": 2}, "Seluruh desa meratakan jalan dengan cangkul dan batu. Lelah, tapi bangga.",
      [_T("aspal_datang", [3, 5], 1.0, {"batu": 40, "papan": 10}, "Hari {hari}: Kabupaten terkesan dengan kerja bakti hari {hari_keputusan} dan mengirim bahan untuk jalan desa!")]),
   _O("Bayar orang luar", {"kayu": -40, "batu": -20}, "Tukang dari luar datang dan membangun jalan dengan rapi.",
      [_T("aspal_datang", [3, 5], 1.0, {}, "Hari {hari}: Jalan desa yang dikerjakan sejak hari {hari_keputusan} selesai. Pedagang lebih cepat datang.")])]),
 _D("kontrak_kopi", "B", "Kontrak Kopi", "Pedagang dari kota ingin membeli kopi desa secara rutin dengan kontrak.", [
   _O("Jual eceran seperti biasa", {}, "Kopi tetap dijual sedikit-sedikit di pasar."),
   _O("Kontrak 20 kopi dalam 14 hari", {"kontrak": 1}, "Kontrak ditandatangani. Kebun kopi harus bekerja keras.",
      [_T("kontrak_selesai", [14, 14], 1.0, {}, "Hari {hari}: Tenggat kontrak kopi hari {hari_keputusan} tiba. Pedagang datang menagih janji.", usulan=True)]),
   _O("Koperasi bagi hasil", {"kontrak": 1}, "Warga membentuk koperasi kopi kecil. Hasil dibagi rata setiap dua minggu.")]),
 _D("tikus_lumbung", "R", "Tikus di Lumbung", "Tikus sawah berpesta di lumbung. Karung gabah berlubang di mana-mana!", [
   _O("Cari kucing penjaga", {"makanan": -2, "tikus_mult": 0.4}, "Seekor kucing belang dibawa dari desa sebelah. Tikus-tikus langsung kabur."),
   _O("Pasang racun tikus", {"tikus_mult": 0.2}, "Racun disebar di sudut lumbung. Tikus menghilang.",
      [_T("keracunan", [2, 6], 0.25, {"sakit_acak": 1, "ternak": -1}, "Hari {hari}: Racun tikus yang dipasang hari {hari_keputusan} termakan ayam, dan seorang warga ikut sakit perut.")]),
   _O("Gropyokan bareng", {"hari_kerja_hilang": 0.5, "rel_semua": 3, "tikus_mult": 0.5}, "Warga beramai-ramai memburu tikus di pematang sambil tertawa dan berteriak.")]),
 _D("ketua_ronda", "B", "Memilih Ketua Ronda", "Pos ronda butuh ketua. {nama} dan {nama2} sama-sama ingin memimpin.", [
   _O("Musyawarah, ketua bergilir", {"mood_AB": 2, "rel_AB": 4}, "Ketua ronda bergilir setiap minggu. Keduanya setuju dan bersalaman."),
   _O("Pilih {nama}", {"mood_A": 8, "mood_B": -5, "rel_AB": -8, "usir_mult": 1.15}, "{nama} menjadi ketua ronda. {nama2} menyalami dengan senyum tipis.",
      [_T("iri_jabatan", [5, 10], 0.4, {"rel_AB": -8}, "Hari {hari}: {nama2} masih iri sejak {nama} dipilih jadi ketua ronda hari {hari_keputusan}.")]),
   _O("Pilih {nama2}", {"mood_B": 8, "mood_A": -5, "rel_AB": -8, "mood_harian": 1}, "{nama2} menjadi ketua ronda. Pos ronda jadi ramai canda.",
      [_T("iri_jabatan", [5, 10], 0.4, {"rel_AB": -8}, "Hari {hari}: {nama} masih iri sejak {nama2} dipilih jadi ketua ronda hari {hari_keputusan}.")])]),
 _D("penebang_liar", "B", "Penebang Liar", "Malam-malam terdengar suara gergaji dari hutan jati. Ada penebang liar!", [
   _O("Tegur baik-baik", {}, "Para penebang minta maaf dan pergi.",
      [_T("penebang_kembali", [7, 14], 0.3, {"node_kayu": -2}, "Hari {hari}: Penebang yang ditegur hari {hari_keputusan} kembali lagi diam-diam.")]),
   _O("Lapor ke Perhutani", {}, "Laporan dikirim ke Perhutani.",
      [_T("perhutani_datang", [5, 7], 1.0, {"kayu": 10, "jati_regrow_mult": 0.8}, "Hari {hari}: Petugas Perhutani datang menindaklanjuti laporan hari {hari_keputusan} dan berterima kasih dengan sedikit kayu.")]),
   _O("Beli kayu murah dari mereka", {"kayu": 30, "makanan": -6}, "Kayu murah didapat, tapi hati warga tidak tenang.",
      [_T("hutan_gundul", [14, 21], 0.5, {"node_jati": -3, "longsor_add": 1, "teladan_poin": -0.5}, "Hari {hari}: Hutan jati makin gundul sejak hari {hari_keputusan}. Lereng jadi rawan longsor.")])]),
 _D("minta_hujan", "R", "Memohon Hujan", "Kemarau panjang. Sumur hampir kering. Warga berkumpul menunggu keputusan.", [
   _O("Sholat istisqa dan doa bersama", {"suasana_hati": 5, "rel_semua": 2, "hari_kerja_hilang": 0.1}, "Seluruh desa berdoa bersama di lapangan. Hati terasa lebih ringan.",
      [_T("gerimis_doa", [1, 3], 0.35, {"air": 10, "kekeringan_selesai": 1}, "Hari {hari}: Gerimis turun, seolah menjawab doa bersama hari {hari_keputusan}. Warga menengadah sambil tersenyum.")]),
   _O("Gali sumur lebih dalam", {"kayu": -10, "batu": -15, "sumur_kemarau_add": 1, "energi": -10}, "Sumur digali lebih dalam seharian. Mata air baru memancar!"),
   _O("Beli air dari desa sebelah", {"makanan": -4, "air": 25}, "Gerobak tong air datang dari desa sebelah. Kendi-kendi kembali penuh.")]),
  ]

reaksi_sifat = {
 "_catatan": "Log reaksi sifat pada dilema (spec §3.1 reaksi). {nama} = penduduk bersifat itu, {sifat} = nama sifat (meta/sifat).",
 "senang": ["Hari {hari}: {nama} yang {sifat} tersenyum puas dengan keputusan kepala desa.", "Hari {hari}: \"Keputusan yang bagus,\" kata {nama} yang {sifat}."],
 "kecewa": ["Hari {hari}: {nama} yang {sifat} terlihat kecewa dengan keputusan itu.", "Hari {hari}: {nama} yang {sifat} menghela napas panjang. Ia kurang setuju."],
}

dilema_ui = {
 "judul": "Keputusan Kepala Desa", "petunjuk_tertunda": "⏳ Mungkin ada akibatnya nanti", "tombol_musyawarah": "Musyawarah",
 "musyawarah_tooltip": "Tunda keputusan sehari untuk bermusyawarah di Balai. Warga makin akrab, tapi hasil terbaik sedikit berkurang.",
 "musyawarah_log": ["Hari {hari}: Warga bermusyawarah di Balai sampai larut. Keputusan akan diambil besok pagi."],
 "riwayat": "Riwayat keputusan", "riwayat_hari": "Hari {hari_keputusan}",
}

# ---- v1.5.0 bagian c5 ----
def _MK(judul, desk, pilihan, catatan_efek):
    return {"judul": judul, "deskripsi": desk, "pilihan": [{"teks": a, "teks_hasil": b} for a, b in pilihan], "catatan_efek": catatan_efek}
momen_kecil = {
 "_catatan": "MOMEN_KECIL (spec §3.4): pilihan cepat tanpa biaya sumber daya (hanya mood/hubungan); opsi pertama selalu netral. Angka di balance.js; catatan_efek = ringkasan spec.",
 "nama_api": _MK("Nama untuk Api Unggun", "Warga ingin memberi nama untuk api unggun tempat mereka berkumpul setiap malam.", [
   ("\"Geni Rukun\"", "Mulai malam ini, api unggun itu bernama Geni Rukun. Semua bertepuk tangan."),
   ("\"Api Mbah Buyut\"", "Api itu dinamai untuk mengenang para leluhur. Warga yang religius tersenyum haru."),
   ("Biarkan tanpa nama", "\"Api ya api,\" kata seseorang sambil tertawa. Malam berlanjut seperti biasa.")], "Geni Rukun +1 semua / Api Mbah Buyut religius +2 / biarkan 0"),
 "lagu_malam": _MK("Lagu Malam Ini", "Di dekat api unggun, warga bertanya: lagu apa yang dinyanyikan malam ini?", [
   ("Campursari", "Lagu campursari mengalun, dan beberapa orang mulai bergoyang pelan."),
   ("Lagu dolanan anak", "\"Cublak-cublak suweng...\" Anak-anak tertawa riang dan orang tua ikut bernyanyi."),
   ("Tembang macapat", "Suara tembang macapat yang lembut membuat malam terasa syahdu.")], "campursari +1 / dolanan anak: anak & suka_menolong +3 / macapat seniman +3"),
 "gubuk_pertama": _MK("Siapa Tidur di Gubuk Baru?", "Gubuk baru sudah jadi. Siapa yang boleh tidur di sana duluan?", [
   ("Yang paling lelah", "Yang paling capek tidur nyenyak sekali malam ini. Besok ia bangun segar bugar."),
   ("Yang paling tua", "Warga tertua tersenyum malu-malu dan berterima kasih."),
   ("Diundi saja", "Undian pakai lidi pendek-panjang. Semua tertawa melihat hasilnya.")], "paling lelah energi +10 / tertua +3 / undian rel +1 semua"),
 "ayam_jago": _MK("Ayam Jago Pukul Tiga", "Ayam jago tetangga berkokok tiap jam tiga pagi. Ada yang kesal, ada yang tidak terganggu.", [
   ("Biarkan saja", "Ayam jago tetap berkokok. Lama-lama warga terbiasa."),
   ("Tegur pemiliknya dengan halus", "Pemiliknya minta maaf dan memindahkan kandang. Yang pemarah lega, yang sabar merasa sedikit tidak enak."),
   ("Jadikan alarm subuh", "\"Lumayan, jadi tidak kesiangan!\" Warga bangun sedikit lebih pagi beberapa hari.")], "biarkan 0 / tegur pemarah +2, sabar -1 / alarm bangun lebih awal 3 hari"),
 "jenang_suro": _MK("Bikin Jenang", "Ada yang ingin membuat jenang bersama-sama di dapur.", [
   ("Nanti saja", "Rencana membuat jenang ditunda. Mungkin lain waktu."),
   ("Bikin bareng-bareng", "Jenang diaduk bergantian sampai kental dan legit. Semua yang membantu makin akrab.")], "nanti 0 / bikin bareng rel +2 peserta (makanan -1 hanya mulai hari 25)"),
 "cerita_hantu": _MK("Cerita Genderuwo", "Malam Jumat. Anak-anak muda ingin bercerita tentang genderuwo di dekat api unggun.", [
   ("Larang dulu", "\"Sudah malam, tidur saja,\" kata para tetua. Anak-anak muda menggerutu kecil."),
   ("Boleh, asal jangan terlalu seram", "Yang jahil dan periang tertawa terbahak-bahak, yang penakut menempel ke temannya sepanjang malam."),
   ("Ganti dongeng Kancil", "Dongeng Kancil mencuri timun membuat anak-anak tertawa sampai tertidur.")], "larang 0 / boleh jahil +3, periang +2, penakut -3 / Kancil anak +2"),
 "burung_perkutut": _MK("Perkutut di Pos Ronda", "Seekor burung perkutut liar hinggap di pos ronda dan bersuara merdu.", [
   ("Biarkan terbang", "Perkutut bersenandung sebentar, lalu terbang ke pohon beringin."),
   ("Pelihara di sangkar bambu", "Suara perkutut kini menemani pagi. Warga yang sabar senang mendengarkannya berlama-lama."),
   ("Lepaskan sambil berdoa", "Burung dilepas dengan doa kecil. Warga yang religius merasa tenteram.")], "biarkan 0 / pelihara sabar +3 / lepas religius +2"),
 "hujan_main": _MK("Main Lumpur Saat Hujan Pertama", "Hujan pertama turun. Anak-anak ingin main lumpur di halaman.", [
   ("Larang, nanti masuk angin", "Anak-anak menonton hujan dari teras dengan wajah cemberut."),
   ("Biarkan mereka bermain", "Anak-anak berguling di lumpur sambil tertawa. Orang tua ikut tersenyum, lalu menyiapkan air hangat.")], "larang 0 / biarkan anak +4, orang tua suka_menolong +2, peluang masuk angin 0.03"),
 "gosip_pagi": _MK("Gosip Pagi", "Di dekat sumur, {nama} sedang menggosipkan {nama2}.", [
   ("Diamkan saja", "Gosip pagi berlalu seperti angin."),
   ("Tegur dengan halus", "{nama} tersipu malu dan minta maaf. Hubungannya dengan {nama2} malah membaik."),
   ("Ikut tertawa", "Semua tertawa bersama {nama}, tapi {nama2} sedikit tersinggung.")], "diamkan 0 / tegur jahil -3, rel nama-nama2 +2 / ikut tertawa rel penggosip +2, sasaran -3"),
 "teh_tubruk": _MK("Teh untuk Pekerja", "Siang terik. Siapa yang mau menyeduh teh tubruk untuk para pekerja?", [
   ("Tidak usah", "Para pekerja minum air kendi saja. Cukup menyegarkan."),
   ("{nama} saja", "{nama} menyeduh teh tubruk manis. Rekan-rekan kerjanya berterima kasih.")], "tidak usah 0 / nama rel +2 dengan rekan kerja"),
 "mimpi_panen": _MK("Mimpi Panen Besar", "{nama} bermimpi sawah desa menguning sampai ke kaki gunung.", [
   ("Tertawakan saja", "\"Mimpi kok dipercaya,\" kata yang lain sambil tertawa."),
   ("Anggap pertanda baik", "Para petani bersemangat. \"Semoga panen kita melimpah!\"")], "tertawakan 0 / pertanda ahli_tani +3"),
 "kentongan_iseng": _MK("Kentongan Iseng", "Anak-anak memukul kentongan pos ronda iseng-iseng. Warga sempat panik!", [
   ("Maafkan saja", "Anak-anak minta maaf sambil menunduk. Warga tertawa lega."),
   ("Ajari kode kentongan", "Para peronda mengajari arti setiap irama: aman, waspada, bahaya. Anak-anak mendengarkan dengan serius.")], "maafkan 0 / ajari: peringatan ancaman berikutnya sedikit lebih awal (sekali)"),
}

hubungan = {
 "_catatan": "RELATION (spec §1.2). tingkat = label panel; log = log interaksi antarpenduduk (naik/turun tingkat, konflik, berbaikan, dll.).",
 "tingkat": {"rival": "Rival", "kenalan": "Kenalan", "teman": "Teman", "sahabat": "Sahabat", "pasangan": "Pasangan", "keluarga": "Keluarga", "renggang": "Renggang"},
 "tooltip": {"rival": "Sering berselisih. Suasana hati turun bila terlalu lama berdekatan.", "teman": "Kerja sedikit lebih cepat bila berdekatan.",
             "sahabat": "Kerja lebih cepat bersama dan enggan pergi dari desa selama sahabatnya ada.", "pasangan": "Bahagia bila tinggal serumah.",
             "keluarga": "Ikatan keluarga tidak mudah putus.", "renggang": "Pasangan yang sedang renggang. Cerita bisa memperbaikinya."},
 "panel": {"judul": "Hubungan", "skor": "{jumlah}", "kosong": "Belum ada"},
 "log": log_interaksi,
 "duka_hubungan": {
  "pasangan": ["Hari {hari}: {nama2} kehilangan belahan jiwanya, {nama}. Rumah mereka terasa sangat sunyi."],
  "sahabat": ["Hari {hari}: {nama2} duduk lama di tempat ia biasa bercerita dengan {nama}. Sahabat terbaiknya telah tiada."],
  "teman": ["Hari {hari}: {nama2} mengenang tawa {nama} sambil menunduk."],
  "rival": ["Hari {hari}: {nama2} terdiam. \"Kami belum sempat berbaikan,\" bisiknya tentang {nama}."]},
}

pencapaian_v150 = [
 {"id": "A25", "nama": "Nyali Kentongan", "deskripsi": "Seorang penakut menjadi pemberani lewat cerita Nyali Kentongan.", "syarat": {"tipe": "cerita_selesai", "target": "penakut_babi", "jumlah": 1}, "hadiah": {"suasana_hati": 5}, "teks_terbuka": "Tong-tong-tong! Siapa sangka, si penakut kini paling nyaring memukul kentongan."},
 {"id": "A26", "nama": "Desa Teladan Nasional", "deskripsi": "Raih gelar Desa Teladan Nasional.", "syarat": {"tipe": "gelar_teladan", "target": "teladan", "jumlah": 1}, "hadiah": {"suasana_hati": 10}, "teks_terbuka": "Piala kecil berkilau di Balai. Desa ini kini teladan bagi seluruh negeri."},
 {"id": "A27", "nama": "Tujuh Purnama Kemarau", "deskripsi": "Raih Piagam Tahunan tahun ke-7.", "syarat": {"tipe": "piagam_tahun", "target": "semua", "jumlah": 7}, "hadiah": {"suasana_hati": 8}, "teks_terbuka": "Tujuh kemarau terlewati bersama. Desa ini tumbuh kuat seperti pohon jati."},
 {"id": "A28", "nama": "Juara Panjat Pinang", "deskripsi": "Menangkan lomba panjat pinang.", "syarat": {"tipe": "lomba_menang", "target": "panjat_pinang", "jumlah": 1}, "hadiah": {"suasana_hati": 5}, "teks_terbuka": "Belepotan oli dan lumpur, tapi hadiah di puncak pinang berhasil diraih!"},
 {"id": "A29", "nama": "Sahabat Sejati", "deskripsi": "Dua penduduk mencapai hubungan terbaik (skor 100).", "syarat": {"tipe": "hubungan_maks", "target": "semua", "jumlah": 1}, "hadiah": {"suasana_hati": 5}, "teks_terbuka": "Seperti saudara kandung. Persahabatan sejati lahir di desa ini."},
 {"id": "A30", "nama": "Monumen Pertama", "deskripsi": "Selesaikan semua tahap satu monumen.", "syarat": {"tipe": "monumen_selesai", "target": "semua", "jumlah": 1}, "hadiah": {"suasana_hati": 8}, "teks_terbuka": "Monumen pertama berdiri megah. Anak cucu akan mengingat kerja keras hari ini."},
 {"id": "A31", "nama": "Pak/Bu Haji", "deskripsi": "Wujudkan keinginan menabung untuk naik haji.", "syarat": {"tipe": "keinginan_khusus", "target": "tabungan_haji", "jumlah": 1}, "hadiah": {"suasana_hati": 8}, "teks_terbuka": "Seluruh desa mengantar keberangkatan dengan doa dan air mata haru."},
 {"id": "A32", "nama": "Lima Monumen", "deskripsi": "Selesaikan kelima monumen desa.", "syarat": {"tipe": "monumen_selesai", "target": "semua", "jumlah": 5}, "hadiah": {"suasana_hati": 10}, "teks_terbuka": "Masjid, Balai, Bendungan, Pendopo Reog, dan Pasar Legi. Desa Mandiri yang sesungguhnya."},
 {"id": "A33", "nama": "Tangan Bersih", "deskripsi": "Tolak suap tiga kali (tambang pasir atau penebang liar) saat ada warga yang jujur.", "syarat": {"tipe": "tolak_suap", "target": "semua", "jumlah": 3}, "hadiah": {"suasana_hati": 6}, "teks_terbuka": "Tiga kali amplop ditolak dengan sopan. Warga yang jujur bangga punya kepala desa seperti ini."},
 {"id": "A34", "nama": "Ramah Tamah", "deskripsi": "Lima pendatang disambut warga yang ramah dan bertahan 28 hari.", "syarat": {"tipe": "sambut_pendatang", "target": "semua", "jumlah": 5}, "hadiah": {"suasana_hati": 6}, "teks_terbuka": "Teh hangat, senyum lebar, dan sapaan di setiap pintu. Desa ini terkenal paling ramah se-kecamatan."}
]

# --- variasi lomba (spec §7: aturan + 2-3 variasi log menang/kalah/lucu) ---
_L17 = lomba_17_agustus["lomba"]
_tambah = {
 "balap_karung": {"aturan": "Peserta masuk ke karung goni, lalu melompat sampai garis akhir. Yang jatuh boleh bangkit lagi.",
   "menang": ["Hari {hari}: {nama} melompat paling jauh dan menang balap karung! Karungnya sampai robek sedikit."],
   "kalah": ["Hari {hari}: {nama} sudah hampir sampai garis akhir, tapi karungnya tersangkut kaki sendiri. \"Tahun depan!\"", "Hari {hari}: {nama} kalah tipis di balap karung, tapi tertawa paling keras."]},
 "makan_kerupuk": {"aturan": "Kerupuk digantung dengan tali. Tangan di belakang punggung, habiskan kerupuk paling cepat!",
   "menang": ["Hari {hari}: {nama} menghabiskan kerupuk dalam tiga gigitan besar! Penonton bersorak."],
   "kalah": ["Hari {hari}: Kerupuk {nama} terus berayun ke sana kemari. Ia kalah, tapi menghibur semua orang."],
   "lucu": ["Hari {hari}: Kerupuk {nama} jatuh ke tanah. Ia memandanginya dengan sedih sampai panitia memberi kerupuk baru."]},
 "tarik_tambang": {"aturan": "Dua regu menarik tambang. Regu yang menyeret pita merah melewati garis menang.",
   "menang": ["Hari {hari}: Regu {nama} menarik sekuat tenaga dan menang! Semua jatuh terduduk sambil tertawa."],
   "kalah": ["Hari {hari}: Regu {nama} terseret pelan-pelan ke garis. Mereka kalah, tapi saling merangkul."]},
 "panjat_pinang": {"aturan": "Batang pinang dilumuri oli. Satu regu saling menopang sampai ada yang mencapai hadiah di puncak.",
   "menang": ["Hari {hari}: Dengan kaki di pundak teman, {nama} meraih bendera di puncak pinang! Sorak-sorai terdengar sampai sawah."],
   "kalah": ["Hari {hari}: {nama} merosot untuk ketiga kalinya, belepotan oli dari kepala sampai kaki. Penonton tetap bertepuk tangan."]},
 "bakiak": {"aturan": "Tiga orang memakai satu bakiak panjang. Langkah harus kompak: kiri, kanan, kiri!",
   "menang": ["Hari {hari}: Regu {nama} melangkah seirama dan menang lomba bakiak!"],
   "kalah": ["Hari {hari}: Regu {nama} jatuh bertumpuk di tengah jalan. \"Kiri! Kiri!\" teriak mereka, terlambat."]},
 "kelereng_sendok": {"aturan": "Sendok digigit, kelereng di atasnya. Jalan pelan-pelan sampai garis akhir tanpa menjatuhkan kelereng.",
   "menang": ["Hari {hari}: {nama} berjalan setenang air dan sampai pertama tanpa menjatuhkan kelereng!"],
   "kalah": ["Hari {hari}: Kelereng {nama} menggelinding ke selokan. Anak-anak berebut mencarikannya."]},
 "hias_gapura": {"aturan": "Setiap regu menghias gapura dengan janur, bambu, dan kain merah putih. Pak Kades menilai yang paling indah.",
   "menang": ["Hari {hari}: Gapura buatan regu {nama} dinilai paling indah! Janurnya melengkung cantik."],
   "kalah": ["Hari {hari}: Gapura regu {nama} sedikit miring, tapi tetap dipuji karena warnanya meriah."]},
 "pawai_reog": {"aturan": "Pawai keliling desa dengan reog, jathilan, dan anak-anak membawa bendera kecil.",
   "menang": ["Hari {hari}: Dadak merak yang dibawa {nama} menari paling gagah sepanjang pawai!"],
   "kalah": ["Hari {hari}: Pawai sempat berhenti karena kerbau lewat. Semua menunggu sambil menabuh kendang pelan-pelan."]},
}
for _id, _t in _tambah.items():
    for _k, _v in _t.items():
        if isinstance(_v, list):
            _L17[_id].setdefault(_k, [])
            _L17[_id][_k] = list(_L17[_id][_k]) + _v
        else:
            _L17[_id][_k] = _v
lomba_17_agustus["pengumuman_lomba"] = ["Hari {hari}: Juara lomba {lomba} tahun ini: {nama}! Hadiahnya sabun, buku tulis, dan tepuk tangan meriah."]
proyek_monumen["ui"]["progres_nama"] = "{monumen}: {tahap}"
proyek_monumen["ui"]["log_mulai_umum"] = "Hari {hari}: Pembangunan {monumen} memasuki tahap {tahap}. Warga bergotong royong."
proyek_monumen["ui"]["log_selesai_umum"] = "Hari {hari}: Tahap {tahap} pada {monumen} selesai! Desa makin membanggakan."
proyek_monumen["ui"]["pasaran"] = "Hari ini pasaran {pasaran}."
keinginan["_ui"] = {"judul_panel": "Keinginan Warga", "baris": "{nama}: {keinginan}", "terpenuhi": "Hari {hari}: Keinginan {nama} terwujud: {keinginan}!", "kosong": "Belum ada warga yang punya keinginan."}

# ---- v1.5.0 bagian c6 ----
KATEGORI_DILEMA = {
 "buka_hutan": "alam", "rombongan_pendatang": "warga", "pencuri_singkong": "keamanan", "tengkulak_padi": "ekonomi",
 "rentenir": "ekonomi", "tambang_pasir": "alam", "hajatan": "adat", "tanah_warisan": "warga", "rebutan_air": "alam",
 "beringin_keramat": "adat", "obat_sakit": "kesehatan", "pupuk_penyuluh": "pertanian", "sekolah_kota": "warga",
 "kerbau_tetangga": "pertanian", "monyet_kebun": "pertanian", "tanggap_reog": "adat", "ronda_wajib": "keamanan",
 "bantu_tetangga": "warga", "jalan_desa": "pembangunan", "kontrak_kopi": "ekonomi", "tikus_lumbung": "pertanian",
 "ketua_ronda": "keamanan", "penebang_liar": "alam", "minta_hujan": "alam"}
NAMA_KATEGORI_DILEMA = {"alam": "Alam & Lingkungan", "warga": "Urusan Warga", "keamanan": "Keamanan", "ekonomi": "Ekonomi",
 "adat": "Adat & Budaya", "kesehatan": "Kesehatan", "pertanian": "Pertanian", "pembangunan": "Pembangunan"}
def buat_dilema_v150():
    dl = buat_dilema()
    for d in dl: d["kategori"] = KATEGORI_DILEMA[d["id"]]
    return dl
dilema_ui["kategori"] = NAMA_KATEGORI_DILEMA
dilema_ui["reaksi_sifat"] = reaksi_sifat
monumen = proyek_monumen
PETA_SIFAT_PENDUDUK = {
 "_catatan": "Pemetaan teks lama penduduk[].sifat (dibiarkan apa adanya) ke id sifat v1.5 (spec §1.1: mis. \"ceria\" -> periang). Kunci = penduduk[].nama.",
 "Sari": ["rajin", "periang"], "Budi": ["sabar", "rajin"], "Wulan": ["ramah", "pandai_masak"], "Joko": ["suka_menolong"], "Ayu": ["cerdas"],
 "Slamet": ["sabar", "rajin"], "Rahayu": ["suka_menolong"], "Bambang": ["periang", "jahil"], "Lestari": ["ahli_tani"], "Sugeng": ["rajin"],
 "Ningsih": ["pemurung", "suka_menolong"], "Hartono": ["cerdas", "rajin"], "Asep": ["periang", "cerdas"], "Euis": ["seniman"], "Dadang": ["rajin"],
 "Neng Rina": ["ramah"], "Ujang": ["cerdas"], "Siti Nurhayati": ["rajin"], "Cecep": ["sabar"], "Iis": ["periang", "ramah"], "Togar": ["pemberani"],
 "Rumondang": ["jujur"], "Parlindungan": ["pemberani", "suka_menolong"], "Butet": ["periang", "rajin"], "Sihol": ["seniman", "periang"], "Tiur": ["sabar"],
 "Horas Simanjuntak": ["pemberani", "ramah"], "Lamtiar": ["cerdas"], "Rangkayo": ["ramah", "cerdas"], "Datuak Malin": ["sabar", "religius"], "Upik": ["rajin"],
 "Buyung": ["perantau"], "Ranti": ["seniman"], "Fauzan": ["pelit"], "Nurhaliza": ["ramah"], "Zulkifli": ["pandai_masak"], "Andi Baso": ["pemberani", "perantau"],
 "Daeng Tasi": ["jujur"], "La Upe": ["rajin", "cerdas"], "Besse": ["cerdas"], "Daeng Rewa": ["pemberani"], "Hasnah": ["pelit", "rajin"],
 "Made Wirawan": ["rajin", "suka_menolong"], "Ni Luh Ayu": ["seniman", "periang"], "Ketut Arsa": ["ahli_tani", "sabar"], "Komang Sri": ["cerdas"],
 "Wayan Gede": ["rajin"], "Nyoman Dewi": ["religius"], "Mpok Ijah": ["jahil", "dermawan"], "Bang Rojali": ["pemberani"], "Matrawi": ["rajin", "pemberani"],
 "Halimah": ["ramah", "cerdas"], "Galuh": ["periang"], "Utuh": ["rajin"], "Bujang Ilai": ["pemberani", "cerdas"], "Dayang Lenggang": ["ahli_tani", "suka_menolong"],
 "Teuku Rizal": ["rajin", "jujur"], "Cut Meutia": ["pemberani", "jujur"], "Jefri Lumentut": ["periang"], "Stevani Rondonuwu": ["suka_menolong"],
 "Yopi Pattinama": ["pemberani"], "Ona Latuconsina": ["seniman"], "Yakob Wenda": ["pemberani", "rajin"], "Maria Kogoya": ["suka_menolong", "sabar"],
 "Lalu Hamzah": ["sabar"], "Baiq Nurul": ["seniman", "rajin"], "Liem Hok": ["cerdas"], "Mei Ling": ["cerdas", "rajin"]}
target_tahunan["pembuka_tahun"] = {
 "_catatan": "Pembuka khusus Rencana Desa tahun 1-8 (spec §2.4); tahun 9+ memakai pembuka umum di atas.",
 "1": "Hari {hari}: Selamat datang di tanah baru! Tahun pertama ini sederhana saja: rumah untuk semua, menjadi dusun, dan bertahan melewati kemarau pertama bersama.",
 "2": "Hari {hari}: Satu tahun sudah kita lewati. Tahun ini kita membangun langgar kecil dan berharap Pak Camat menyebut kita Desa Swadaya.",
 "3": "Hari {hari}: Tahun ketiga. Desa makin ramai. Mari tumbuh menjadi kota kecil dan meraih gelar Desa Swakarya.",
 "4": "Hari {hari}: Tahun keempat. Saatnya menyelesaikan monumen pertama dan menahan banjir dengan bendungan.",
 "5": "Hari {hari}: Tahun kelima. Pendopo Reog menanti, lumbung harus cukup sampai kemarau usai. Kita bisa jadi Desa Swasembada!",
 "6": "Hari {hari}: Tahun keenam. Desa ini sudah guyub. Mari selesaikan tiga monumen dan menyambut lebih banyak warga.",
 "7": "Hari {hari}: Tahun ketujuh. Tujuh kemarau hampir terlewati. Bendungan kita sempurnakan dan gelar Teladan mulai kita kejar.",
 "8": "Hari {hari}: Tahun kedelapan. Inilah puncaknya: semua monumen berdiri, tak seorang pun kelaparan, dan Desa Teladan Nasional di depan mata."}

data = {"meta":meta,"penduduk":penduduk,"log_harian":log,"event_acak":event,"tutorial":tutorial,"quest_awal":quest,
        "menu":menu,"pengaturan":pengaturan,"teknologi":teknologi,"ui_progres":ui_progres,"pencapaian":pencapaian,
        "pasar":pasar,"dialog_pedagang":dialog_pedagang,"event_era_lanjut":event_lanjut,"quest_lanjutan":quest_lanjutan}
terapkan_patch(data, PATCH_V120)
terapkan_patch(data, PATCH_V130)
import copy
data = copy.deepcopy(data)  # patch v1.2/v1.3 berbagi objek dengan data; jangan ikut berubah
PATCH_V140["ubah_teks"] = terapkan_ubah(data, UBAH_V140)
terapkan_patch_v140(data, PATCH_V140)

# ---- v1.5.0 ----
_EFEK_OK = set(data["meta"]["sumber_daya"]) | set(data["meta"]["kunci_efek"])
dilema = buat_dilema_v150()
_KUNCI_LAIN = sorted({k for d in dilema for o in d["pilihan"] for k in o.get("mekanik_lain", [])} |
                     {k for d in dilema for o in d["pilihan"] for t in o.get("tertunda", []) for k in t.get("mekanik_lain", [])})
PATCH_V150 = {
 "_patch": {"versi_dari": "1.4.0", "versi_ke": "1.5.0", "sifat": "hanya penambahan (bagian baru + entri meta + pencapaian A25-A32)",
            "spec": "docs/RISET-CERITA-TUJUAN.md §1-§3, §7 Dokumen"},
 "tambah_item": {"pencapaian": pencapaian_v150},
 "tambah_entri_meta": {
  "placeholder": {
   "{hari_keputusan}": "Hari saat dilema diputuskan (untuk teks_tertunda / log akibat tertunda); isi lewat extra fill()",
   "{gelar}": "Nama gelar Desa Teladan (teladan.gelar[tier].nama)",
   "{monumen}": "Nama monumen (monumen.<id>.nama)",
   "{tahap}": "Nama tahap monumen (monumen.<id>.tahap[i].nama)",
   "{lomba}": "Nama lomba 17-an (agustusan.lomba.<id>.nama)",
   "{keinginan}": "Judul keinginan penduduk (keinginan.<id>.judul)",
   "{pasaran}": "Nama hari pasaran Jawa (Legi, Pahing, Pon, Wage, Kliwon)"},
  "tipe_tujuan_quest": {
   "cerita_selesai": "Selesaikan cerita berantai dengan id target (cerita.<id>) sebanyak jumlah",
   "gelar_teladan": "Raih gelar Desa Teladan dengan id target (teladan.gelar) atau lebih tinggi",
   "piagam_tahun": "Kumpulkan Piagam Tahunan sebanyak jumlah (target 'semua')",
   "lomba_menang": "Menangkan lomba 17-an dengan id target (agustusan.lomba) sebanyak jumlah",
   "hubungan_maks": "Jumlah pasangan penduduk dengan skor hubungan 100 (target 'semua')",
   "monumen_selesai": "Selesaikan semua tahap monumen sebanyak jumlah (target 'semua' atau id monumen)",
   "keinginan_khusus": "Penuhi keinginan dengan id target (keinginan.<id>) sebanyak jumlah",
   "tolak_suap": "Jumlah suap yang ditolak di dilema tambang_pasir/penebang_liar saat ada penduduk jujur (S.bribesRefused; target 'semua')",
   "sambut_pendatang": "Jumlah pendatang yang disambut penduduk ramah dan bertahan 28 hari (target 'semua')"},
  "target_khusus": {"penakut_babi": "Cerita berantai Nyali Kentongan", "teladan": "Gelar Desa Teladan Nasional",
                    "panjat_pinang": "Lomba panjat pinang", "tabungan_haji": "Keinginan menabung untuk naik haji"},
  "struktur_tambahan": {
   "sifat": "Dict id TRAITS (20) -> {nama, kata, deskripsi, tooltip, log_terlihat[]}; log_sifat{jahil_kejahilan, ramah_sambutan, jujur_tolak_suap, jujur_suap_diterima, jujur_timbangan, ...}",
   "hubungan": "{tingkat{}, tooltip{}, panel{}, log{jenis -> [teks]}, duka_hubungan{tingkat -> [teks]}}; log selaras log_hubungan v1.3",
   "keinginan": "Dict id WISHES -> {judul, deskripsi, teks_muncul[], teks_terpenuhi[], teks_kecewa[], tombol?}; _ui = teks panel",
   "cerita": "Dict id STORY_CHAINS -> {judul, ringkasan, langkah[{teks, pilihan[{teks, teks_hasil}], hasil{kunci: teks}}], selesai}",
   "monumen": "{ui{}, <id MONUMENTS> -> {nama, deskripsi, tahap[{nama, mulai, progres[3], selesai, bonus_ringkas}]}}",
   "kerja_bakti": "Teks KERJA_BAKTI (tombol, log mulai/selesai)",
   "teladan": "Teks TELADAN: gelar{}, kedatangan, naik_gelar, tetap, ditangguhkan, ending, panel",
   "agustusan": "Teks AGUSTUSAN: panitia, umbul_umbul, malam_tirakatan, upacara, lomba{<id> -> {nama, deskripsi, aturan, mulai[], menang[], kalah[], lucu[]...}}, panggung_hiburan, juara_umum, pengumuman_lomba",
   "rencana_tahun": "Teks YEAR_GOALS: panel, pembuka{tahun}, piagam, tanpa_piagam, kenangan_tahun, nama_target{tipe}, ending_mandiri",
   "dilema": "List {id DILEMMAS, kelas R/B, judul, kategori, deskripsi, pilihan[3]{teks, efek, teks_hasil, mekanik_lain?, tertunda[{kunci, hari_tunda[min,max], peluang, efek_tertunda, teks_tertunda, mekanik_lain?, usulan_dokumen?}], hari_tunda, teks_tertunda}}; usulan_dokumen = akibat tertunda yang tidak ada di spec §3.3 (boleh diabaikan kode)",
   "dilema_ui": "Teks kartu dilema, nama kategori, reaksi_sifat{senang, kecewa}",
   "momen_kecil": "Dict id MOMEN_KECIL -> {judul, deskripsi, pilihan[{teks, teks_hasil}], catatan_efek}"}},
 "tambah_key_meta": {
  "status_cerita_tujuan": "mengikuti_riset",
  "catatan_placeholder_v150": "{sifat} tetap placeholder yang sama sejak v1.2 (frasa sifat penduduk, mis. \"{nama} yang {sifat}\"). Untuk sifat v1.5 isi dengan sifat.<id>.kata; untuk penduduk lama boleh tetap penduduk[].sifat. Tidak ada placeholder sifat kedua.",
  "peta_sifat_penduduk": PETA_SIFAT_PENDUDUK,
  "sumber_cerita_tujuan": "docs/RISET-CERITA-TUJUAN.md (§1 tokoh, §2 tujuan, §3 dilema & Juru Cerita, §7 Dokumen)",
  "kunci_efek_dilema_lain": {"_catatan": "Kunci efek dilema dari spec §4.2 yang belum ada di kunci_efek; ditulis di mekanik_lain (nama saja), angkanya di balance.js DILEMMAS.", "kunci": _KUNCI_LAIN},
  "peta_spec_v150": {"TRAITS": "sifat", "RELATION": "hubungan", "WISHES": "keinginan", "STORY_CHAINS": "cerita", "MONUMENTS": "monumen",
                     "KERJA_BAKTI": "kerja_bakti", "TELADAN": "teladan", "AGUSTUSAN": "agustusan", "YEAR_GOALS": "rencana_tahun",
                     "DILEMMAS": "dilema", "MOMEN_KECIL": "momen_kecil"}},
 "tambah_key": {"sifat": sifat, "hubungan": hubungan, "keinginan": keinginan, "cerita": cerita_tokoh, "monumen": monumen,
                "kerja_bakti": kerja_bakti, "teladan": desa_teladan, "agustusan": lomba_17_agustus, "rencana_tahun": target_tahunan,
                "dilema": dilema, "dilema_ui": dilema_ui, "momen_kecil": momen_kecil},
 "set_meta": {"versi": "1.5.0"},
}
def terapkan_patch_v150(data, patch):
    for sec, items in patch["tambah_item"].items():
        ada = {x["id"] for x in data[sec]}
        for it in items:
            if it["id"] in ada: raise SystemExit(f"{sec} id {it['id']} sudah ada")
            data[sec].append(it)
    return terapkan_patch(data, patch)
PATCH_V150 = copy.deepcopy(PATCH_V150)
terapkan_patch_v150(data, PATCH_V150)
# ===================== v1.5.1 (aditif): key yang di kode masih memakai fallback =====================
# terapkan_patch memasang objek patch apa adanya (tanpa salinan); salin data supaya penambahan v1.5.1+ tidak ikut mengubah PATCH_V150 (patch-v1.5.0.json)
data = copy.deepcopy(data)
# Dibaca game.js lewat TX(path, extra, fallback): array -> dipilih acak; teks lalu lewat fill() (awalan "Hari {hari}:" dibuang,
# karena log() sudah menambahkannya). Tanpa awalan di sini, sama seperti fallback-nya.
PATCH_V151 = {
 "_patch": {"versi_dari": "1.5.0", "versi_ke": "1.5.1", "sifat": "hanya penambahan sub-key (tambah_path; menolak menimpa)",
            "sumber": "Asisten Koding 17-10 15:07: key yang di game.js (Story P0 352aed4) masih memakai fallback"},
 "tambah_path": {
  "kerja_bakti.kenduri": [
   "Kenduri kecil di balai: nasi dan lauk dibagi untuk warga dan tetangga. Semua pulang dengan perut kenyang.",
   "Selamatan sederhana malam ini. Lumbung sedang lega, jadi sebagian bekal dibagikan ke tetangga.",
   "{nama} ikut membagikan nasi berkat dari kenduri. Tetangga yang menerima tersenyum lebar.",
   "Kenduri di balai: doa bersama, makan bersama, lalu bercerita sampai larut.",
   "Kenduri kecil di balai: {jumlah} porsi nasi dan lauk dibagi untuk warga dan tetangga."],
  "kerja_bakti.kenduri_syukuran": [
   "Syukuran sederhana: warga makan bersama, {jumlah} porsi habis dengan gembira.",
   "Syukuran kecil di halaman balai. {jumlah} porsi nasi dan sayur dinikmati bersama sambil bercanda."],
  "kerja_bakti.kenduri_sedekah": [
   "Sedekah ke desa tetangga: {jumlah} porsi diantar dengan bakul. Tetangga berterima kasih.",
   "{nama} dan {nama2} mengantar {jumlah} porsi ke desa tetangga. Pulangnya mereka membawa salam hangat."],
  "kerja_bakti.log_mulai": [
   "Warga bergotong royong seharian. Capek, tapi hati senang.",
   "Kentongan berbunyi pagi-pagi. Seluruh warga turun bekerja bersama sampai sore.",
   "{nama} dan {nama2} memimpin gotong royong. Pekerjaan berat terasa ringan bila dikerjakan bersama."],
  "dilema_ui.syukuran_panen": [
   "Tasyakuran panen: {jumlah} porsi dimasak bersama dan dibagi ke tetangga.",
   "Syukuran panen di balai desa. {jumlah} porsi nasi dan sayur dibagikan, doa syukur mengalun pelan.",
   "Panen kali ini cukup melimpah. Warga memasak {jumlah} porsi dan membaginya dengan desa sebelah."],
  "dilema_ui.utang_lunas": [
   "Utang ke rentenir dilunasi. Warga menarik napas lega.",
   "Rentenir datang menagih, dan desa membayar lunas. \"Semoga tidak perlu meminjam lagi,\" kata para tetua.",
   "Catatan utang dicoret. Desa kembali bebas dari tagihan."],
  "dilema_ui.utang_sita": [
   "Utang belum terbayar. Rentenir menyita separuh kayu, batu, dan papan desa.",
   "Gudang belum cukup untuk membayar. Rentenir membawa pergi separuh kayu, batu, dan papan. Warga terdiam sedih.",
   "Rentenir menyita separuh kayu, batu, dan papan desa. \"Lain kali kita kerja bakti saja,\" bisik para tetua."],
  "agustusan.panitia.setuju": "Setuju",
  "momen_kecil.judul": "Momen Kecil"},
 "tambah_key_meta": {
  "catatan_v151": {
   "riset": "Asisten Riset (17-10) mengonfirmasi: angka tabel opsi pertama dilema kelas B benar (validator: pangan opsi 1 >= -6), dan 5 akibat tertunda usulan_dokumen tetap dipertahankan (boleh diabaikan kode).",
   "bentuk": {
    "kerja_bakti.kenduri": "array variasi; {jumlah} = porsi, boleh dipakai sejak 98960a0 (kode mengisi {jumlah} untuk ketiga bentuk kenduri)",
    "kerja_bakti.kenduri_syukuran / kenduri_sedekah": "array variasi; {jumlah} = porsi (bentuk kenduri bergantian, cerita.js kenduri.forms)",
    "kerja_bakti.log_mulai": "array variasi; tanpa {jumlah}",
    "dilema_ui.syukuran_panen": "array variasi; {jumlah} = porsi",
    "dilema_ui.utang_lunas / utang_sita": "array variasi; tanpa {jumlah}",
    "agustusan.panitia.setuju": "string (label tombol)",
    "momen_kecil.judul": "string (judul kartu momen kecil); bukan id momen"},
   "awalan_hari": "Key v1.5.1 tanpa awalan \"Hari {hari}:\" (seperti fallback). Teks v1.5.0 yang berawalan tetap aman: fill() membuangnya."}},
 "tambah_entri_meta": {}, "tambah_key": {},
 "set_meta": {"versi": "1.5.1"},
}
def terapkan_patch_v151(data, patch):
    for path, nilai in patch["tambah_path"].items():
        *induk, akhir = path.split(".")
        node = data
        for k in induk:
            if not isinstance(node.get(k), dict): raise SystemExit(f"{path}: induk {k} tidak ada / bukan dict")
            node = node[k]
        if akhir in node: raise SystemExit(f"{path} sudah ada (v1.5.1 hanya menambah)")
        node[akhir] = copy.deepcopy(nilai)
    return terapkan_patch(data, patch)
PATCH_V151 = copy.deepcopy(PATCH_V151)
terapkan_patch_v151(data, PATCH_V151)
# ===================== v1.6.0 (aditif): teks pangan v9 (game.js 98960a0 masih memakai fallback) =====================
# Semua dibaca game.js lewat TX(path, extra, fallback); string tunggal kecuali daya_tarik.pendatang dan pangan.tugas.<id>.log (array -> dipilih acak).
# Tanpa awalan "Hari {hari}:" (log() sudah menambahkannya). Teks tooltip dipakai di atribut title=: tanpa tanda kutip ganda dan tanpa '<'.
PANGAN_V160 = {
 "_catatan": "Pangan v9 (permintaan Ichwan 21-10). Path & bentuk sesuai TX() di game.js 98960a0; lihat meta.catatan_v160. Tema sedang menimpa lewat TEKS-TEMA-sedang.json (pangan).",
 "label": "Pangan",
 "hari": "hari",
 "sumber": {
  "meramu": "Buah semak", "memancing": "Ikan", "ikan": "Ikan", "jamur": "Jamur", "buah": "Buah",
  "mangga": "Mangga", "rambutan": "Rambutan", "pisang": "Pisang", "kelapa": "Kelapa",
  "umbi": "Umbi hutan", "keong": "Keong sawah",
  "padi": "Padi", "jagung": "Jagung", "ubi": "Ubi", "singkong": "Singkong", "gandum": "Padi", "wortel": "Sayuran",
  "makanan": "Makanan", "pasar": "Pasar", "cerita": "Kejadian", "kerja_bakti": "Kerja bakti", "pesta_17an": "Pesta 17-an"},
 "tooltip": {
  "judul": "Pangan = semua yang bisa dimakan warga",
  "konsumsi": "Dimakan",
  "hari_ini": "Masuk hari ini"},
 "keluar": {
  "dimakan": "dimakan", "busuk": "busuk", "kenduri": "kenduri", "tikus": "dimakan tikus", "monyet": "dicuri monyet",
  "syukuran_lahir": "syukuran kelahiran", "syukuran_panen": "tasyakuran panen", "pesta": "pesta", "dijual": "dijual", "lainnya": "lain-lain"},
 "ringkasan": {
  "judul_masuk": "Pangan masuk", "judul_keluar": "Pangan keluar",
  "masuk": "pangan masuk", "keluar": "keluar"},
 "ladang": {
  "belum_jadi": "Belum selesai dibangun",
  "banjir": "Tergenang banjir, tanaman menunggu air surut",
  "berhenti_dingin": "Berhenti tumbuh: {musim}",
  "berhenti_kemarau": "Berhenti tumbuh: kemarau tanpa irigasi (riset Irigasi Sederhana, T04)",
  "siap": "Siap panen",
  "tumbuh": "Sedang tumbuh",
  "kosong": "Menunggu ditanam",
  "perkiraan": "Perkiraan panen",
  "hasil": "Perkiraan hasil"},
 "kolam": {"hari_ini": "tersedia hari ini"},
 "pohon_buah": "Pohon {buah}",
 "berbuah": "Buah siap dipetik",
 "belum_berbuah": "Belum berbuah, tunggu musimnya",
 "sudah_digali": "Sudah digali, tumbuh lagi beberapa hari",
 "daya_tarik": {
  "pendatang": [
   "Kabar desa yang bahagia sampai ke kampung sebelah… Seorang perantau ingin tinggal.",
   "Cerita tentang desa yang rukun dan riang terdengar sampai jauh. Seorang perantau datang membawa buntelan, ingin ikut menetap.",
   "{nama} pernah bercerita tentang desa kita di pasar. Hari ini seorang perantau datang dan bertanya, bolehkah ikut tinggal?",
   "Tawa warga terdengar sampai jalan besar. Seorang pengembara mampir minum teh, lalu memutuskan ingin tinggal di sini."],
  "judul": "Daya tarik desa",
  "tinggi": "Tinggi", "sedang": "Sedang", "rendah": "Rendah",
  "tooltip": "Daya tarik desa menentukan seberapa sering perantau datang. Faktornya: suasana hati warga, desa bahagia beberapa hari berturut-turut, stok pangan yang cukup, dan tempat tidur kosong. Desa yang bahagia lebih sering didatangi perantau.",
  "mood": "Suasana hati {jumlah} (perlu ≥ {jumlah2})",
  "bahagia": "Desa bahagia {jumlah}/{jumlah2} hari",
  "bonus": "→ perantau lebih sering datang",
  "pangan": "Stok pangan {jumlah}/{jumlah2} hari",
  "rumah": "Tempat tidur kosong: {jumlah}",
  "jeda": "Pendatang berikutnya paling cepat {jumlah} hari lagi"},
 "tugas": {
  "_catatan": "Belum dibaca game.js (98960a0: nama tugas masih tertanam di vhist() foodWork). Id = C.FOOD_SOURCES (dikonfirmasi Asisten Koding). {jumlah} = hasil, {buah} = pangan.sumber.<jenis> huruf kecil (hanya tugas buah).",
  "meramu": {"nama": "Meramu", "log": [
   "{nama} memetik buah semak di tepi hutan dan pulang membawa {jumlah} genggam.",
   "{nama} menyusuri semak sambil bersenandung. Bakulnya terisi {jumlah} buah kecil yang manis."]},
  "memancing": {"nama": "Memancing", "log": [
   "{nama} duduk sabar di tepi air. Pulangnya membawa {jumlah} ikan.",
   "Kail {nama} bergetar! {jumlah} ikan masuk ke keranjang.",
   "{nama} memancing sambil bersiul pelan. Hasilnya {jumlah} ikan untuk lumbung desa."]},
  "jamur": {"nama": "Mencari jamur", "log": [
   "{nama} menemukan jamur di bawah pohon rimbun dan memetik {jumlah}.",
   "Habis hujan, {nama} masuk ke hutan dan pulang membawa {jumlah} jamur segar."]},
  "buah": {"nama": "Memetik buah", "log": [
   "{nama} memetik {jumlah} {buah} dari pohon. Wanginya harum sekali.",
   "{nama} memanjat pelan-pelan dan menurunkan {jumlah} {buah} yang sudah matang."]},
  "umbi": {"nama": "Menggali umbi", "log": [
   "{nama} menggali umbi hutan dan mendapat {jumlah} umbi gemuk.",
   "Tanah gembur di bawah semak menyimpan umbi. {nama} pulang membawa {jumlah}."]},
  "keong": {"nama": "Memungut keong", "log": [
   "{nama} memungut {jumlah} keong sawah di sela padi yang berair.",
   "Sawah sedang berair, keong bermunculan. {nama} mengumpulkan {jumlah} keong ke dalam bakul."]}},
}
PATCH_V160 = {
 "_patch": {"versi_dari": "1.5.1", "versi_ke": "1.6.0", "sifat": "hanya penambahan: key top-level baru pangan + placeholder {buah}",
            "sumber": "Ichwan 21-10: Pangan v9 (98960a0) memakai fallback; tambahan log & nama tugas memancing/jamur/buah/umbi/keong"},
 "tambah_key": {"pangan": PANGAN_V160},
 "tambah_entri_meta": {"placeholder": {"{buah}": "Nama buah/sumber pangan (pangan.sumber.<id>, mis. mangga); isi lewat extra fill(). pangan.pohon_buah: label apa adanya; pangan.tugas.buah.log: huruf kecil"}},
 "tambah_key_meta": {"catatan_v160": {
   "bentuk": {
    "pangan.sumber.<id>": "string; id = C.FOOD_SOURCES (meramu, memancing, jamur, buah, umbi, keong) + jenis buah (mangga, rambutan, pisang, kelapa) + tanaman ladang (padi, jagung, ubi, singkong, gandum, wortel; wortel = kata terlarang Nusantara -> \"Sayuran\", tema sedang \"Wortel\") + ikan/makanan/pasar/cerita (PANGAN_FB) + kerja_bakti/pesta_17an (penyerap pangan tanpa label pangan.keluar)",
    "pangan.keluar.<k>": "string; k = FOOD_OUT_FB game.js (dimakan, busuk, kenduri, tikus, monyet, syukuran_lahir, syukuran_panen, pesta, dijual, lainnya); dipakai sebagai '<label> <angka>'",
    "pangan.label / hari / tooltip.* / ringkasan.* / ladang.* / kolam.hari_ini / berbuah / belum_berbuah / sudah_digali": "string tanpa placeholder; ladang.berhenti_dingin memakai {musim} (C.SEASON_NAMES, huruf besar)",
    "pangan.pohon_buah": "string; {buah} = panganLabel(jenis)",
    "pangan.daya_tarik.pendatang": "array 3-5 variasi; boleh {nama} (warga yang sudah ada)",
    "pangan.daya_tarik.mood / bahagia / pangan": "{jumlah} = nilai sekarang, {jumlah2} = syarat",
    "pangan.daya_tarik.rumah / jeda": "{jumlah}",
    "pangan.daya_tarik.tooltip, pangan.tooltip.*": "dipakai di atribut title=: tanpa tanda kutip ganda dan tanpa '<'",
    "pangan.tugas.<id>": "{nama: string, log: array >= 2}; BELUM dibaca kode -> koordinasi Asisten Koding: nama menggantikan peta nama di vhist() foodWork, log opsional setelah hasil disetor ({nama}, {jumlah}, {buah})"},
   "tema_sedang": "TEKS-TEMA-sedang.json menimpa pangan (tools/buat_tema_sedang_cerita.py). Tidak dipakai di tema sedang (FOOD_SOURCES_PATCH buah/keong = null, tanaman Nusantara): sumber buah/mangga/rambutan/pisang/kelapa/keong/padi/jagung/ubi/singkong, tugas.buah, tugas.keong, pohon_buah, berbuah, belum_berbuah. umbi -> Kentang liar.",
   "awalan_hari": "Tanpa awalan \"Hari {hari}:\" (seperti v1.5.1)."}},
 "set_meta": {"versi": "1.6.0"},
}
PATCH_V160 = copy.deepcopy(PATCH_V160)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V151
terapkan_patch(data, PATCH_V160)
with open("/workspace/village-game/tools/patch-v1.6.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V160,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.6.1 (aditif): v9c (game.js 51b6d4d) — bangun otomatis, label pangan keluar baru, syarat desa bahagia =====================
# otomatis.*: TX() memilih acak dari array; {nama}/{nama2} diisi fill() (warga yang ada). Tanpa awalan "Hari {hari}:".
# pangan.keluar.<k>: FOOD_OUT_FB baru (dipakai '<label> <angka>'). daya_tarik.bahagia_syarat: {jumlah} = SPAWN.happy.mood (80), {jumlah2} = happy.minMood (50);
# kode menambahkan sendiri <small>; tanda kurung ada di teks (seperti fallback). daya_tarik.murung: {jumlah} = mood warga terendah; kode menambahkan kurung.
PATCH_V161 = {
 "_patch": {"versi_dari": "1.6.0", "versi_ke": "1.6.1", "sifat": "hanya penambahan (tambah_key otomatis + tambah_path pangan.*; menolak menimpa)",
            "sumber": "Asisten Koding 21-10 13:11: key v9c (51b6d4d) yang masih memakai fallback"},
 "tambah_path": {
  "pangan.keluar.event": "kejadian", "pangan.keluar.cerita": "cerita", "pangan.keluar.hadiah": "hadiah", "pangan.keluar.rusak": "rusak",
  "pangan.keluar.pasar": "pasar", "pangan.keluar.lomba": "lomba", "pangan.keluar.pesta_17an": "pesta 17-an", "pangan.keluar.kerja_bakti": "kerja bakti",
  "pangan.keluar.monumen": "monumen", "pangan.keluar.keinginan": "keinginan warga",
  "pangan.daya_tarik.bahagia_syarat": "(rata-rata mood ≥ {jumlah}, tak ada warga < {jumlah2})",
  "pangan.daya_tarik.murung": "ada warga yang murung: {jumlah}"},
 "tambah_key": {"otomatis": {
  "_catatan": "v9c AUTO_BUILD: warga menaruh api unggun (hari 2) & gubuk pertama (hari 4) sendiri bila kepala desa belum menaruhnya. Array = variasi acak.",
  "api_unggun": [
   "Warga menyusun batu dan kayu: api unggun pertama akan dinyalakan di perkemahan.",
   "Tanpa menunggu aba-aba, {nama} dan {nama2} menata batu melingkar. Sebentar lagi api unggun pertama menyala.",
   "Malam terasa lembap dan gelap. Warga sepakat membuat api unggun di tengah perkemahan.",
   "{nama} mengumpulkan ranting kering dan batu kali. Api unggun pertama siap dinyalakan!"],
  "gubuk": [
   "Warga tak tahan tidur di bawah langit: mereka mulai mendirikan gubuk sendiri.",
   "{nama} dan {nama2} mulai memasang tiang bambu dan atap ilalang. Gubuk pertama sedang didirikan.",
   "Embun malam membuat warga menggigil. Mereka bergotong royong mendirikan gubuk pertama."]}},
 "tambah_key_meta": {"catatan_v161": {
   "bentuk": {
    "otomatis.api_unggun / otomatis.gubuk": "array 2-4 variasi (TX memilih acak); boleh {nama}/{nama2}; tanpa awalan Hari {hari}:",
    "pangan.keluar.<k> baru": "event, cerita, hadiah, rusak, pasar, lomba, pesta_17an, kerja_bakti, monumen, keinginan (FOOD_OUT_FB 51b6d4d)",
    "pangan.daya_tarik.bahagia_syarat": "{jumlah} = rata-rata mood minimal (80), {jumlah2} = mood warga terendah yang diizinkan (50); termasuk tanda kurung",
    "pangan.daya_tarik.murung": "{jumlah} = mood warga terendah; tanpa tanda kurung (kode menambahkannya)"},
   "catatan_koding": "pangan.daya_tarik.bahagia kini diberi {jumlah3}/{jumlah4} oleh kode, tetapi belum terdaftar di meta.placeholder dan tidak dipakai teks. pangan.sumber.kerja_bakti/pesta_17an (v1.6.0) tidak terbaca lagi karena keduanya kini ada di FOOD_OUT_FB; dibiarkan (aditif)."}},
 "tambah_entri_meta": {},
 "set_meta": {"versi": "1.6.1"},
}
PATCH_V161 = copy.deepcopy(PATCH_V161)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V160
terapkan_patch_v151(data, PATCH_V161)  # penerap tambah_path generik (menolak menimpa) + terapkan_patch
with open("/workspace/village-game/tools/patch-v1.6.1.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V161,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.7.0 (aditif): P1 Tujuan & Cerita (3bbeca1) — key yang di game.js masih memakai fallback =====================
# Path & bentuk sesuai kode: event_ui.pendatang.* lewat TX (string; tolak_halus_hasil boleh array), jenjang_kelaparan.tingkat.bahaya.banner_masa_awal
# dibaca LANGSUNG (JB.banner_masa_awal -> fillSafe) = harus string dengan {jumlah}; tooltip_masa_awal lewat TX (atribut title=: tanpa kutip ganda);
# cerita_ui.label & keinginan._ui.otomatis string; agustusan.pentas_reog, dilema_ui.orang_orangan_berdiri lewat TX (array = variasi acak);
# log_ancaman.diusir_orang_orangan dibaca lewat TT('diusir_orang_orangan') -> perlu entri C.TXT di tema.js (belum ada; lihat meta.catatan_v170).
PATCH_V170 = {
 "_patch": {"versi_dari": "1.6.1", "versi_ke": "1.7.0", "sifat": "hanya penambahan (tambah_key event_ui/cerita_ui + tambah_path; menolak menimpa)",
            "sumber": "Asisten Koding 21-10 14:11: P1 (3bbeca1) keinginan, monumen, cerita berantai, orang-orangan sawah, Pendatang Terima/Tolak halus"},
 "tambah_key": {
  "event_ui": {"_catatan": "Teks UI event (P1). pendatang = event Pendatang Mengetuk: 2 pilihan Terima / Tolak halus.",
   "pendatang": {"terima": "Terima", "tolak_halus": "Tolak halus",
    "tolak_halus_hasil": ["Pengembara mengangguk mengerti dan melanjutkan perjalanan. Beberapa warga melambai sedikit sedih.",
                          "Pengembara tersenyum, membetulkan capingnya, dan berjalan ke desa berikutnya. \"Semoga desa ini selalu rukun.\""]}},
  "cerita_ui": {"_catatan": "Label kartu cerita berantai (cerita.<id>).", "label": "Cerita Warga"}},
 "tambah_path": {
  "jenjang_kelaparan.tingkat.bahaya.banner_masa_awal": "Stok pangan hanya {jumlah} hari! Segera kumpulkan makanan.",
  "jenjang_kelaparan.tingkat.bahaya.tooltip_masa_awal": "Masa awal: belum ada penalti suasana hati, tapi stok hampir habis. Utamakan makanan.",
  "agustusan.pentas_reog": [
   "Pentas reog di pendopo! Dadak merak menari, gamelan bertalu, anak-anak ikut berjoget.",
   "Kendang bertalu dan dadak merak berputar gagah. Warga bersorak, anak-anak menirukan gerak jathil.",
   "Malam ini reog pentas di pendopo. {nama} menonton paling depan dengan mata berbinar."],
  "dilema_ui.orang_orangan_berdiri": [
   "Orang-orangan sawah berdiri di tepi ladang, bajunya berkibar ditiup angin.",
   "{nama} memasang orang-orangan sawah bercaping di tengah ladang. Burung pipit langsung menjaga jarak."],
  "log_ancaman.diusir_orang_orangan": [
   "Orang-orangan sawah bergoyang ditiup angin. Seekor {hewan} ragu dan mundur ke hutan.",
   "Baju orang-orangan sawah berkibar di bawah cahaya bulan. Seekor {hewan} yang mengendap-endap berbalik pergi.",
   "Bayangan orang-orangan sawah di tepi ladang membuat {hewan} ragu. Tanaman selamat malam ini."],
  "keinginan._ui.otomatis": "menunggu kesempatan"},
 "tambah_key_meta": {"catatan_v170": {
   "bentuk": {
    "event_ui.pendatang.terima / tolak_halus": "string (label tombol)",
    "event_ui.pendatang.tolak_halus_hasil": "array variasi (TX memilih saat event dibuat)",
    "jenjang_kelaparan.tingkat.bahaya.banner_masa_awal": "STRING wajib (dibaca langsung, bukan TX); {jumlah} = hari stok",
    "jenjang_kelaparan.tingkat.bahaya.tooltip_masa_awal": "string tanpa placeholder; tanpa tanda kutip ganda",
    "cerita_ui.label / keinginan._ui.otomatis": "string",
    "agustusan.pentas_reog": "array variasi; boleh {nama}; tanpa awalan Hari {hari}:",
    "dilema_ui.orang_orangan_berdiri": "array variasi; boleh {nama}",
    "log_ancaman.diusir_orang_orangan": "array variasi; {hewan} = TERMS.hewan (babi hutan / serigala), selalu didahului 'Seekor' atau di tengah kalimat"},
   "catatan_koding": "TT('diusir_orang_orangan') di game.js belum punya entri C.TXT di tema.js, jadi teks ini belum terbaca. Usul: diusir_orang_orangan: ['log_ancaman.diusir_orang_orangan', '<fallback>'] di TXT kedua tema. Tema sedang: TEKS-TEMA-sedang.json kini punya keinginan, monumen, cerita, teladan, rencana_tahun -> semua id TUJUAN_DISABLE bisa dicabut. Nama bangunan dari kode (tujuan.js MONUMENTS.*.nama & stages[].nama, BUILDINGS.orang_orangan.nama) masih Nusantara di tema sedang bila kode tidak membaca monumen.<id>.nama dari TEKS."}},
 "tambah_entri_meta": {},
 "set_meta": {"versi": "1.7.0"},
}
PATCH_V170 = copy.deepcopy(PATCH_V170)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V161
terapkan_patch_v151(data, PATCH_V170)
with open("/workspace/village-game/tools/patch-v1.7.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V170,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.7.1 (aditif): P1b (e64bda9) — Kandang Ayam (telur), ringkasan Hari Jadi =====================
# pangan.sumber.telur -> panganLabel('telur'); pangan.tugas.telur.{nama,log} -> taskName()/vhist() (log: {nama} {jumlah}, sama dengan tugas lain);
# pangan.kandang.siap / .ayam ({jumlah} = jumlah induk) -> coopInfo(); hari_jadi_ringkasan.<k> -> HJ(k) = TX('hari_jadi_ringkasan.'+k).
# bangunan_lokal.orang_orangan_sawah / kandang_ayam .nama SUDAH ADA sejak v1.3 ('Orang-orangan sawah', 'Kandang ayam'); tidak diubah (aditif).
HJ_V171 = {
 "_catatan": "Modal ringkasan Hari Jadi (game.js hariJadiHTML/hariJadiDaily). Placeholder persis seperti kode: log {hari} {tahun} {lahir} {pendatang} {bangunan} {tahap} (semua angka); judul {tahun}; rentang {hari} {hari2}; target {jumlah} {jumlah2}; tanpa_piagam {jumlah}. Label lain tanpa placeholder. Dipakai di innerHTML: tanpa '<'.",
 "log": ["Hari Jadi Desa ke-{tahun}! Setahun ini {lahir} bayi lahir, {pendatang} pendatang tiba, {bangunan} bangunan berdiri, dan {tahap} tahap monumen rampung.",
         "Selamat Hari Jadi Desa ke-{tahun}! Setahun penuh cerita: {lahir} bayi lahir, {pendatang} pendatang, {bangunan} bangunan baru, {tahap} tahap monumen."],
 "judul": "Hari Jadi Desa ke-{tahun}",
 "rentang": "Hari ke-{hari}–{hari2}",
 "statistik": "Setahun ini",
 "penduduk": "Penduduk", "lahir": "Lahir", "pendatang": "Pendatang", "wafat": "Berpulang", "pergi": "Pergi",
 "bangunan": "Bangunan selesai", "pangan_masuk": "Pangan masuk", "pangan_keluar": "Pangan keluar",
 "keinginan": "Keinginan terwujud", "kejadian": "Kejadian",
 "target": "Rencana Desa: {jumlah}/{jumlah2} tercapai",
 "piagam": "Piagam Tahunan diraih!",
 "tanpa_piagam": "Piagam butuh {jumlah} target. Tahun depan kita coba lagi bersama.",
 "gelar": "Gelar desa", "monumen": "Monumen", "tahap_tahun_ini": "Selesai tahun ini", "tutup": "Lanjutkan"}
PATCH_V171 = {
 "_patch": {"versi_dari": "1.7.0", "versi_ke": "1.7.1", "sifat": "hanya penambahan (tambah_key hari_jadi_ringkasan + tambah_path pangan; menolak menimpa)",
            "sumber": "Asisten Koding 21-10 14:30: P1b e64bda9 (Kandang Ayam + telur, modal ringkasan Hari Jadi)"},
 "tambah_key": {"hari_jadi_ringkasan": HJ_V171},
 "tambah_path": {
  "pangan.sumber.telur": "Telur",
  "pangan.tugas.telur": {"nama": "Mengambil telur", "log": [
   "{nama} mengambil {jumlah} butir telur dari kandang ayam. Induknya berkotek protes.",
   "{nama} merogoh sarang jerami dan menemukan {jumlah} telur yang masih hangat.",
   "Ayam-ayam berkotek riang. {nama} pulang membawa {jumlah} butir telur untuk lumbung."]},
  "pangan.kandang": {"_catatan": "Panel info Kandang Ayam (coopInfo). siap = label stok telur; ayam: {jumlah} = jumlah induk (BUILDINGS.kandang_ayam.hens).",
   "siap": "siap diambil", "ayam": "{jumlah} ekor ayam kampung"}},
 "tambah_key_meta": {"catatan_v171": {
   "bentuk": {"pangan.sumber.telur": "string", "pangan.tugas.telur": "{nama: string, log: array 2-4 ({nama}, {jumlah})}",
              "pangan.kandang.siap / ayam": "string; ayam wajib {jumlah}", "hari_jadi_ringkasan.log": "array variasi; tanpa awalan Hari {hari}: (log() menambahkannya); {hari} boleh tidak dipakai",
              "hari_jadi_ringkasan.<label>": "string"},
   "catatan_koding": "bangunan_lokal.orang_orangan_sawah.nama ('Orang-orangan sawah') & kandang_ayam.nama ('Kandang ayam') sudah ada sejak v1.3 dan tidak diubah (aturan aditif). Tema sedang kini punya bangunan_lokal di overlay -> __localNames aktif. {bangunan}/{tahap} di hari_jadi_ringkasan.log berisi ANGKA (extra menimpa arti bawaan)."}},
 "tambah_entri_meta": {"placeholder": {
   "{lahir}": "Jumlah bayi lahir setahun (hari_jadi_ringkasan.log)",
   "{pendatang}": "Jumlah pendatang setahun (hari_jadi_ringkasan.log)",
   "{hari2}": "Hari akhir rentang (hari_jadi_ringkasan.rentang)"}},
 "set_meta": {"versi": "1.7.1"},
}
PATCH_V171 = copy.deepcopy(PATCH_V171)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V170
terapkan_patch_v151(data, PATCH_V171)
with open("/workspace/village-game/tools/patch-v1.7.1.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V171,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.7.2: orang-orangan (3019d47) — tooltip ancaman, teks melayang + KOREKSI hewan =====================
# Kode: orang-orangan hanya membuat C.MONKEY.hewan (monyet / rubah di sedang) urung mencuri; babi hutan/serigala TIDAK terpengaruh (SCARECROW.boarFieldMult 1).
# diusir_orang_orangan: {hewan} = C.MONKEY.hewan (scarecrowScare) -> teks v1.7.0 'cahaya bulan'/'malam ini'/'mengendap-endap' (gambaran babi hutan malam) dikoreksi.
# tooltip_ancaman (buildTip, atribut title): {pencuri} = C.MONKEY.hewan, {hewan} = babi hutan/serigala (NIGHT_THREAT), {pagar} = C.BUILDINGS.pagar.nama.
# orang_orangan_teks_melayang (floatText): {hewan} sudah cap1() oleh kode -> {hewan} hanya di awal teks; pendek.
UBAH_V172 = {
 "log_ancaman/diusir_orang_orangan/1": "Baju orang-orangan sawah berkibar-kibar. Seekor {hewan} yang mengintip dari pinggir hutan urung mendekat.",
 "log_ancaman/diusir_orang_orangan/2": "Orang-orangan sawah di tepi ladang membuat {hewan} ragu. Hasil ladang selamat hari ini.",
 "meta/catatan_v170/bentuk/log_ancaman.diusir_orang_orangan": "array variasi; {hewan} = C.MONKEY.hewan (monyet / rubah: pencuri ladang yang diusir orang-orangan), selalu didahului 'Seekor' atau di tengah kalimat. Koreksi v1.7.2: bukan babi hutan/serigala.",
 "hari_jadi_ringkasan/log/0": "Desa merayakan Hari Jadi ke-{tahun}! Setahun ini {lahir} bayi lahir, {pendatang} pendatang tiba, {bangunan} bangunan berdiri, dan {tahap} tahap monumen rampung."}
data = copy.deepcopy(data)  # lepas dari objek PATCH_V171
UBAH_V172_HASIL = terapkan_ubah(data, UBAH_V172)
PATCH_V172 = {
 "_patch": {"versi_dari": "1.7.1", "versi_ke": "1.7.2", "sifat": "penambahan (tambah_path) + koreksi teks terdaftar (ubah_teks, 4 path; dikecualikan sempit di validator)",
            "sumber": "Asisten Koding 21-10 14:51: 3019d47 orang-orangan usir monyet (log + teks melayang, tooltip: tidak mempan babi hutan)"},
 "ubah_teks": UBAH_V172_HASIL,
 "tambah_key": {},
 "tambah_path": {
  "bangunan_lokal.orang_orangan_sawah.tooltip_ancaman": "Membuat {pencuri} urung mencuri dari ladang. Tidak mempan melawan {hewan}; untuk itu pakai {pagar}.",
  "dilema_ui.orang_orangan_teks_melayang": ["{hewan} kabur!", "{hewan} urung mencuri!"]},
 "tambah_key_meta": {"catatan_v172": {
   "bentuk": {"bangunan_lokal.orang_orangan_sawah.tooltip_ancaman": "string (atribut title): {pencuri} = C.MONKEY.hewan, {hewan} = babi hutan/serigala, {pagar} = nama bangunan pagar; tanpa kutip ganda dan '<'",
              "dilema_ui.orang_orangan_teks_melayang": "array variasi pendek (teks melayang); {hewan} sudah dikapitalkan kode (cap1) -> hanya di awal teks"},
   "koreksi": "log_ancaman.diusir_orang_orangan[1..2] & meta.catatan_v170: {hewan} di sana monyet/rubah (siang/kapan saja), bukan babi hutan/serigala malam. hari_jadi_ringkasan.log[0] tidak lagi diawali 'Hari ' (aturan log v1.7.2).",
   "aturan_log": "Teks log baru/terkoreksi sejak v1.7.0 tidak boleh diawali 'Hari ' (log() menambahkan 'Hari X:'). Teks lama berawalan 'Hari {hari}:' tetap aman karena fill() membuangnya."}},
 "tambah_entri_meta": {"placeholder": {
   "{pencuri}": "Hewan pencuri ladang yang diusir orang-orangan (C.MONKEY.hewan: monyet / rubah); huruf kecil",
   "{pagar}": "Nama bangunan pagar (C.BUILDINGS.pagar.nama) untuk tooltip orang-orangan"}},
 "set_meta": {"versi": "1.7.2"},
}
PATCH_V172 = copy.deepcopy(PATCH_V172)
terapkan_patch_v151(data, PATCH_V172)
with open("/workspace/village-game/tools/patch-v1.7.2.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V172,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.7.3 (aditif): v10 (42d19ac) — gubuk tambahan otomatis & petunjuk butuh gubuk =====================
# otomatis.gubuk_tambahan: TX(..., { nama, nama2, gubuk }) -> array variasi (log). petunjuk.butuh_gubuk: TX(..., { gubuk }) dipanggil tiap render questUI()
# (innerHTML) + sekali di log -> STRING (array akan berganti-ganti tiap render). {gubuk} = C.BUILDINGS.gubuk.nama (Nusantara 'Gubuk Bambu', sedang 'Gubuk'): nama bangunan, kapital.
PATCH_V173 = {
 "_patch": {"versi_dari": "1.7.2", "versi_ke": "1.7.3", "sifat": "hanya penambahan (tambah_key petunjuk + tambah_path otomatis.gubuk_tambahan; menolak menimpa)",
            "sumber": "Asisten Koding 21-10 15:18: 42d19ac v10 (warga menambah gubuk ke-2, petunjuk butuh gubuk hari 6)"},
 "tambah_key": {"petunjuk": {"_catatan": "Petunjuk pemain (kotak misi questUI + log sekali). String tunggal; tanpa '<' dan tanpa awalan 'Hari '.",
   "butuh_gubuk": "Pendatang dan anak-anak butuh tempat tidur. Bangun {gubuk} supaya desa bisa bertambah."}},
 "tambah_path": {
  "otomatis.gubuk_tambahan": [
   "{nama} dan {nama2} mendirikan {gubuk} lagi supaya ada tempat untuk pendatang dan anak.",
   "Tempat tidur mulai sesak. {nama} dan {nama2} memasang tiang bambu untuk {gubuk} baru.",
   "{nama} mengukur tanah, {nama2} mengangkut bambu dan ilalang. {gubuk} baru mulai berdiri untuk keluarga yang bertambah."]},
 "tambah_key_meta": {"catatan_v173": {
   "bentuk": {"petunjuk.butuh_gubuk": "STRING (dirender ulang tiap frame panel misi; array akan berganti-ganti); {gubuk}",
              "otomatis.gubuk_tambahan": "array 2-4 variasi (log); {nama}, {nama2}, {gubuk}"},
   "catatan_koding": "{gubuk} = C.BUILDINGS.gubuk.nama, sudah berhuruf kapital (nama bangunan), dipakai apa adanya di tengah kalimat."}},
 "tambah_entri_meta": {"placeholder": {"{gubuk}": "Nama bangunan gubuk (C.BUILDINGS.gubuk.nama: Nusantara 'Gubuk Bambu', sedang 'Gubuk'); petunjuk.butuh_gubuk, otomatis.gubuk_tambahan"}},
 "set_meta": {"versi": "1.7.3"},
}
PATCH_V173 = copy.deepcopy(PATCH_V173)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V172
terapkan_patch_v151(data, PATCH_V173)
with open("/workspace/village-game/tools/patch-v1.7.3.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V173,f,ensure_ascii=False,indent=2); f.write("\n")
# ===================== v1.7.4 (aditif): v11 (00d3959) — bilah bangun berkategori & kejadian di peta =====================
# bangun_kategori.<C.BUILD_CATS id>: buildCatLabel() -> teks tombol + title="" TANPA escape (innerHTML) -> tanpa kutip ganda/'<'.
# '&' di 'Bahan & Produksi' ditulis polos: '& ' (diikuti spasi) bukan referensi karakter, aman di innerHTML & atribut; '&amp;' akan tampil mentah bila
# suatu saat dipakai di canvas/textContent. terkunci_era {era} / terkunci_riset {riset} / monumen_tujuan -> title (di-escape q(): " -> &quot;).
# peta_kejadian.pangan/kesehatan/kondisi -> floatText (canvas) `-N <label>`; lihat_lokasi -> title="" log TANPA escape.
PATCH_V174 = {
 "_patch": {"versi_dari": "1.7.3", "versi_ke": "1.7.4", "sifat": "hanya penambahan (tambah_key bangun_kategori + peta_kejadian; menolak menimpa)",
            "sumber": "Asisten Koding 21-10 15:48: 00d3959 v11 bilah bangun berkategori + kejadian di peta"},
 "tambah_key": {
  "bangun_kategori": {"_catatan": "Label kategori bilah bangun (C.BUILD_CATS id) + alasan tombol terkunci (title). String tunggal; tanpa kutip ganda dan '<'.",
   "tempat_tinggal": "Tempat Tinggal", "pangan": "Pangan", "bahan_produksi": "Bahan & Produksi", "keamanan": "Keamanan", "lainnya": "Lainnya",
   "terkunci_era": "Terbuka di era {era}", "terkunci_riset": "Butuh riset {riset}", "monumen_tujuan": "Monumen dibangun lewat panel Tujuan"},
  "peta_kejadian": {"_catatan": "Kejadian di peta: pangan/kesehatan/kondisi = label teks melayang setelah angka (-N Pangan); lihat_lokasi = title baris log berlokasi. String tunggal.",
   "pangan": "Pangan", "kesehatan": "Kesehatan", "kondisi": "Kondisi", "lihat_lokasi": "Klik untuk melihat lokasinya"}},
 "tambah_path": {},
 "tambah_key_meta": {"catatan_v174": {
   "bentuk": {"bangun_kategori.<id>": "string; teks tombol + title tanpa escape", "bangun_kategori.terkunci_era": "string; {era} = C.ERAS[].nama era bangunan (bukan era sekarang)",
              "bangun_kategori.terkunci_riset": "string; {riset} = nama teknologi", "peta_kejadian.*": "string pendek"},
   "catatan_koding": "'Bahan & Produksi' memakai '&' polos (bukan &amp;): aman di innerHTML/atribut karena diikuti spasi, dan tetap benar bila dipakai di canvas/textContent."}},
 "tambah_entri_meta": {"placeholder": {"{riset}": "Nama teknologi yang membuka bangunan (bangun_kategori.terkunci_riset)"}},
 "set_meta": {"versi": "1.7.4"},
}
PATCH_V174 = copy.deepcopy(PATCH_V174)
data = copy.deepcopy(data)  # lepas dari objek PATCH_V173
terapkan_patch_v151(data, PATCH_V174)
with open("/workspace/village-game/tools/patch-v1.7.4.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V174,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/tools/patch-v1.5.1.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V151,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/tools/patch-v1.5.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V150,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/tools/patch-v1.4.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V140,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/tools/patch-v1.3.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V130,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/tools/patch-v1.2.0.json","w",encoding="utf-8") as f:
    json.dump(PATCH_V120,f,ensure_ascii=False,indent=2); f.write("\n")
with open("/workspace/village-game/TEKS-GAME.json","w",encoding="utf-8") as f:
    json.dump(data,f,ensure_ascii=False,indent=2); f.write("\n")
