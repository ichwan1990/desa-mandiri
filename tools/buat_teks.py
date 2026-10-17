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
  C("Tukar kayu dengan makanan",{"kayu":-20,"makanan":25},"Pedagang mengangguk puas. Lumbung desa terasa sedikit lebih penuh."),
  C("Beli perkakas dengan batu",{"batu":-25,"alat":3},"Perkakas baru berkilau di tangan penduduk. Kerja jadi lebih cepat!"),
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
  C("Simpan semua di Lumbung",{"gandum":40,"makanan":30},"Lumbung penuh sesak. Musim dingin tidak lagi menakutkan."),
  C("Adakan pesta panen",{"makanan":15,"suasana_hati":20},"Penduduk menari dan bernyanyi semalaman. Ini malam yang akan dikenang lama."),
  C("Jual sebagian ke pedagang",{"gandum":20,"alat":2,"batu_bata":10},"Sebagian hasil panen ditukar dengan barang berguna untuk membangun.")
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

data = {"meta":meta,"penduduk":penduduk,"log_harian":log,"event_acak":event,"tutorial":tutorial,"quest_awal":quest}
with open("/workspace/village-game/TEKS-GAME.json","w",encoding="utf-8") as f:
    json.dump(data,f,ensure_ascii=False,indent=2); f.write("\n")
