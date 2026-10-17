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
  C("Tukar kayu dengan makanan",{"kayu":-15,"makanan":10},"Pedagang mengangguk puas. Lumbung desa terasa sedikit lebih penuh."),
  C("Beli perkakas dengan batu",{"batu":-15,"alat":2},"Perkakas baru berkilau di tangan penduduk. Kerja jadi lebih cepat!"),
  C("Tawarkan teh hangat saja",{"suasana_hati":5},"Pedagang berterima kasih dan berjanji akan mampir lagi. Ia juga meninggalkan cerita lucu dari desa seberang.")
 ],"perdagangan"),
 E("pendatang","Pendatang Mengetuk","Seorang pengembara lelah berhenti di tepi desa. Ia bertanya apakah ada tempat untuknya bernaung.",[
  C("Sambut dengan hangat",{"penduduk":1,"makanan":-10,"suasana_hati":5},"{nama} kini menjadi bagian dari desa. Wajahnya langsung cerah."),
  C("Beri bekal lalu antar pergi",{"makanan":-5},"Pengembara pamit sambil tersenyum. Mungkin suatu hari ia akan kembali."),
  C("Tolak dengan sopan",{"suasana_hati":-3},"Pengembara berlalu pelan. Beberapa penduduk tampak sedikit sedih.")
 ],"penduduk"),
 E("hewan_buas","Babi Hutan Mengamuk","Seekor babi hutan besar menerobos semak dan mendekati ladang! Penduduk panik.",[
  C("Kumpulkan penduduk untuk mengusirnya",{"energi":-15,"daging":15,"kulit":2},"Dengan teriakan dan obor, babi hutan berhasil dihalau. Desa bahkan mendapat daging dan kulit."),
  C("Bangun pagar darurat",{"kayu":-20},"Pagar kayu berdiri tepat waktu. Babi hutan mendengus lalu pergi."),
  C("Biarkan saja dan berlindung",{"makanan":-20,"gandum":-10},"Babi hutan berpesta di ladang. Panen kali ini berkurang.")
 ],"bahaya"),
 E("serigala_malam","Lolongan di Malam Hari","Lolongan serigala terdengar dari arah hutan. Penduduk tidak bisa tidur dengan tenang.",[
  C("Nyalakan api unggun lebih besar",{"kayu":-10,"energi":-5},"Cahaya api membuat serigala menjauh. Malam pun berlalu dengan damai."),
  C("Jaga bergantian sepanjang malam",{"energi":-20,"suasana_hati":5},"Para penjaga mengantuk esok harinya, tapi semua merasa aman.")
 ],"bahaya"),
 E("panen_raya","Panen Raya!","Ladang menguning dan buah bergelantungan di mana-mana. Ini panen terbaik tahun ini!",[
  C("Simpan semua di Lumbung",{"gandum":12,"makanan":8},"Lumbung penuh sesak. Musim dingin tidak lagi menakutkan."),
  C("Adakan pesta panen",{"makanan":8,"suasana_hati":15},"Penduduk menari dan bernyanyi semalaman. Ini malam yang akan dikenang lama."),
  C("Jual sebagian ke pedagang",{"gandum":6,"alat":1,"batu":8},"Sebagian hasil panen ditukar dengan barang berguna untuk membangun.")
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
 Q("q02_kayu_bakar","Tumpukan Kayu","Kumpulkan kayu untuk persiapan membangun.","kumpulkan","kayu",20,{"makanan":10},"Tumpukan kayu tersusun rapi. Penduduk siap membangun!",2),
 Q("q03_atap_pertama","Atap di Atas Kepala","Bangun Gubuk supaya penduduk bisa tidur nyenyak.","bangun","gubuk",1,{"kayu":10,"suasana_hati":5},"Untuk pertama kalinya, penduduk tidur beratap. Dengkuran pelan terdengar sampai pagi.",3),
 Q("q04_perut_kenyang","Perut Kenyang","Kumpulkan makanan dari buah, ikan, atau daging.","kumpulkan","makanan",30,{"batu":10},"Ada cukup makanan untuk beberapa hari ke depan. Semua bisa bekerja dengan tenang.",4),
 Q("q05_gudang","Tempat Menyimpan","Bangun Gudang agar sumber daya tidak berserakan.","bangun","gudang",1,{"kayu":15,"batu":15},"Semua barang kini tersimpan rapi. Penduduk tak perlu lagi mencari-cari.",5),
 Q("q06_air_bersih","Air Bersih","Bangun Sumur supaya penduduk tidak perlu bolak-balik ke sungai.","bangun","sumur",1,{"air":20,"suasana_hati":5},"Air jernih kini ada di tengah desa. Langkah penduduk terasa lebih ringan.",6),
 Q("q07_ladang_pertama","Benih Harapan","Bangun Ladang dan panen gandum pertama desa.","kumpulkan","gandum",20,{"makanan":20},"Bulir gandum pertama berayun ditiup angin. Masa depan desa terlihat cerah.",7),
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
   "Panen pertama! Gandumnya mungkin sedikit, tapi rasanya istimewa.",{"gandum":5}),
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
   "Lima ilmu sudah dikuasai. Desa ini ternyata penuh orang pintar!",{"makanan":20}),
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
  C("Panen lebih awal",{"gandum":10,"energi":-10},"Semua tangan turun ke ladang. Gandum diselamatkan sebelum beku, walau belum terlalu besar."),
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
 Q("q11_dapur_mengepul","Dapur Mengepul","Bangun Dapur supaya bahan mentah bisa diolah menjadi masakan yang lebih mengenyangkan.","bangun","dapur",1,{"makanan":10,"suasana_hati":5},"Asap tipis mengepul dari cerobong Dapur. Aroma masakan membuat semua orang pulang lebih cepat.",11),
 Q("q12_hamparan_ladang","Hamparan Ladang","Bangun total 3 petak Ladang agar desa tidak bergantung pada buah liar.","bangun","ladang",3,{"kayu":15,"gandum":5},"Tiga petak ladang berjajar rapi. Dari kejauhan, desa mulai tampak seperti kain bermotif kotak-kotak.",12),
 Q("q13_desa_pertanian","Desa yang Menguning","Penuhi syarat era Desa Pertanian: penduduk, ladang, sumur, dapur, dan stok pangan yang cukup.","capai_era","desa_pertanian",1,{"papan":10,"alat":1,"suasana_hati":10},"Desa kini resmi menjadi Desa Pertanian. Setiap musim panen terasa seperti pesta kecil.",13),
 Q("q14_dentang_palu","Dentang Palu","Bangun Bengkel alat agar desa bisa membuat perkakas, papan, dan batu bata sendiri.","bangun","bengkel_alat",1,{"batu":15,"kayu":15},"Denting palu pertama terdengar sampai ke sungai. Kini desa bisa membuat alatnya sendiri.",14),
 Q("q15_ilmu_pertama","Ilmu dari Pengalaman","Selesaikan riset 3 teknologi. Pilih yang paling dibutuhkan desa saat ini.","riset","semua",3,{"makanan":15,"suasana_hati":5},"Tiga ilmu baru dikuasai. Penduduk mulai suka berdiskusi di dekat api sebelum tidur.",15),
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

data = {"meta":meta,"penduduk":penduduk,"log_harian":log,"event_acak":event,"tutorial":tutorial,"quest_awal":quest,
        "menu":menu,"pengaturan":pengaturan,"teknologi":teknologi,"ui_progres":ui_progres,"pencapaian":pencapaian,
        "pasar":pasar,"dialog_pedagang":dialog_pedagang,"event_era_lanjut":event_lanjut,"quest_lanjutan":quest_lanjutan}
with open("/workspace/village-game/TEKS-GAME.json","w",encoding="utf-8") as f:
    json.dump(data,f,ensure_ascii=False,indent=2); f.write("\n")
