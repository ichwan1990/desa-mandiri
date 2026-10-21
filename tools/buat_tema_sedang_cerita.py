"""Tambahkan teks CERITA (dan pangan v1.6.0) tema sedang (beriklim sedang) ke TEKS-TEMA-sedang.json — idempoten.

TEKS-TEMA-sedang.json dibuat oleh tools/buat_overlay_sedang.js (agen lain; jangan diedit dari sini). Alat itu menulis ulang
seluruh file, jadi urutan menjalankan:  node tools/buat_overlay_sedang.js  ->  python3 tools/buat_tema_sedang_cerita.py
Skrip ini hanya mengganti bagian miliknya (BAGIAN di bawah); bagian lain di overlay dibiarkan apa adanya.

Format overlay = mergeTextOverlay() di game.js: objek digabung rekursif; {"__byId":[{id,...}]} per id; {"__byIdx":{"i":...}} per indeks;
larik biasa MENGGANTI seluruh larik. Pilihan & akibat tertunda dilema memakai __byIdx supaya efek/angka dari TEKS-GAME.json tetap.
Hanya teks: id, efek, kunci, peluang, hari_tunda tidak pernah ditulis di sini (dicek tools/validasi_teks.py).
Padanan: Agustusan -> Festival Panen (hari ke-21 = hari terakhir gugur), monyet -> rubah merah, kentongan -> lonceng menara jaga,
ronda -> jaga malam, padi/singkong -> gandum/kentang, kerbau -> sapi, reog -> rombongan sandiwara keliling, rentenir -> pemberi pinjaman.
"""
import json, sys
ROOT = "/workspace/village-game/"
FILE = ROOT + "TEKS-TEMA-sedang.json"
VERSI = "1.7.2-sedang.1"

def O(teks, hasil, *tunda):
    o = {"teks": teks, "teks_hasil": hasil}
    if tunda:
        o["teks_tertunda"] = tunda[0]
        o["tertunda"] = {"__byIdx": {str(i): {"teks_tertunda": t} for i, t in enumerate(tunda)}}
    return o
def D(id, judul, desk, *opsi):
    return {"id": id, "judul": judul, "deskripsi": desk, "pilihan": {"__byIdx": {str(i): o for i, o in enumerate(opsi) if o}}}
def M(judul, desk, *opsi):
    return {"judul": judul, "deskripsi": desk, "pilihan": {"__byIdx": {str(i): {"teks": t, "teks_hasil": h} for i, (t, h) in enumerate(opsi) if t}}}

# ---------------- dilema (12 dilema P0 cerita.js) ----------------
DILEMA = [
 D("rombongan_pendatang", "Rombongan Pendatang",
   "Serombongan keluarga dari lembah yang kebanjiran tiba dengan pakaian basah dan wajah lelah. Mereka meminta tempat berteduh.",
   O("Beri tempat menginap semalam", "Rombongan tidur semalam di balai desa berselimut wol, lalu pamit pagi-pagi dengan penuh terima kasih.",
     "Hari {hari}: Kiriman datang dari rombongan yang singgah hari {hari_keputusan}: sekantong biji kopi dan sebuah perkakas, dengan surat terima kasih."),
   O("Ajak 2 orang menetap", "Dua orang memutuskan menetap. Keesokan harinya mereka langsung membantu di ladang.",
     "Hari {hari}: Salah satu pendatang yang menetap hari {hari_keputusan} rindu rumah lamanya di lembah dan pamit baik-baik."),
   O("Tolak dengan sopan", "Rombongan melanjutkan perjalanan. Beberapa warga menunduk, merasa tidak enak.",
     "Hari {hari}: Cerita soal penolakan hari {hari_keputusan} menyebar di dekat sumur. Suasana jadi sedikit canggung.")),
 D("pencuri_singkong", "Pencuri Kentang",
   "Seorang pemuda dari desa sebelah tertangkap menggali kentang di ladang. Badannya kurus, wajahnya ketakutan.",
   O("Maafkan dan beri bekal", "Pemuda itu menangis dan berterima kasih. Ia pulang membawa sekantong kentang dan sepotong roti.",
     "Hari {hari}: Pemuda yang dimaafkan hari {hari_keputusan} datang lagi, kali ini membawa kayu dan batu untuk membalas budi.",
     "Hari {hari}: Kentang hilang lagi dari ladang. Sepertinya kebaikan hari {hari_keputusan} belum cukup."),
   O("Hukum kerja 3 hari", "Pemuda itu bekerja tiga hari mengangkut kayu dan batu. Ia belajar, desa pun terbantu.",
     "Hari {hari}: Desa sebelah tersinggung dengan hukuman hari {hari_keputusan}. Pedagang dari sana menaikkan harga."),
   O("Lapor ke penjaga kota", "Penjaga dari kota datang dan membawa pemuda itu. Desa terasa sedikit muram.",
     "Hari {hari}: Keluarga pemuda itu datang membayar ganti rugi atas kejadian hari {hari_keputusan}, sambil meminta maaf.")),
 D("obat_sakit", "Mengobati yang Sakit",
   "Ada warga yang sakit dan belum juga membaik. Bagaimana sebaiknya mereka diobati?",
   O("Teh jahe dan sup kaldu hangat", "Teh jahe dan sup kaldu diminum pagi dan sore. Pelan-pelan yang sakit mulai pulih."),
   O("Panggil tabib dari kota", "Tabib datang membawa obat dan nasihat: rebus air minum, istirahat cukup."),
   O("Ramuan dan pijatan Nenek Peramu", "Nenek Peramu yang paham tanaman obat memijat sambil menyenandungkan lagu penenang. Yang sakit merasa lebih tenang.",
     "Hari {hari}: Yang dirawat Nenek Peramu hari {hari_keputusan} bangun lebih segar dari dugaan semua orang.")),
 D("kerbau_tetangga", "Sapi Tetangga",
   "Sapi milik desa sebelah lepas dan menginjak-injak ladang yang sedang tumbuh.",
   O("Selesaikan dengan damai", "Sapi dikembalikan baik-baik. Pemiliknya mengangkat topi berkali-kali minta maaf.",
     "Hari {hari}: Pemilik sapi yang lepas hari {hari_keputusan} mengirim benih dan sekeranjang wortel."),
   O("Minta ganti rugi", "Ganti rugi dibayar dengan wortel dan roti, tapi suasana jadi agak canggung.",
     "Hari {hari}: Desa sebelah masih kesal soal ganti rugi hari {hari_keputusan}. Harga dari pedagang mereka naik."),
   O("Pinjam sapinya 3 hari untuk membajak", "Sapi itu menarik bajak di ladang tiga hari. Pekerjaan jadi cepat.",
     "Hari {hari}: Pemilik sapi datang dengan wajah masam soal sapi yang ditahan sejak hari {hari_keputusan}.")),
 D("monyet_kebun", "Rubah di Kebun",
   "Seekor rubah merah sudah berkali-kali menyelinap ke kebun dan gudang, menggondol roti dan apel. Warga mulai kesal.",
   O("Pasang orang-orangan dan pagar ranting", "Orang-orangan bertopi jerami berdiri gagah di samping pagar ranting. Rubah itu ragu mendekat."),
   O("Sisihkan sisa makanan di tepi hutan", "Sisa roti dan kulit apel diletakkan di tepi hutan. Rubah kenyang dan jarang masuk desa."),
   O("Pasang perangkap", "Perangkap dipasang di sekitar kebun. Rubah tidak datang lagi.",
     "Hari {hari}: Seekor anak rubah terkilir kena perangkap yang dipasang hari {hari_keputusan}, lalu berhasil lepas ke hutan. Anak-anak desa sedih melihatnya.")),
 D("ronda_wajib", "Jaga Malam Bergilir",
   "Setelah serangan semalam, warga cemas. Perlukah jaga malam bergilir setiap malam?",
   O("Jaga malam bergilir 7 malam", "Jadwal jaga ditempel di menara jaga. Lonceng tanda aman terdengar setiap malam."),
   O("Pasang obor di sekeliling desa", "Obor menyala di sekeliling desa. Malam terasa lebih terang dan aman."),
   O("Biarkan saja", "Semua tidur seperti biasa. Semoga malam tetap tenang.",
     "Hari {hari}: Tanpa penjaga sejak hari {hari_keputusan}, kawanan rusa liar sempat mengacak-acak ladang semalam. Untung tidak ada yang terluka.")),
 D("tikus_lumbung", "Tikus di Lumbung",
   "Tikus berpesta di lumbung. Karung gandum berlubang di mana-mana!",
   O("Cari kucing penjaga", "Seekor kucing belang dibawa dari desa sebelah. Tikus-tikus langsung kabur."),
   O("Pasang racun tikus", "Racun disebar di sudut lumbung. Tikus menghilang.",
     "Hari {hari}: Racun tikus yang dipasang hari {hari_keputusan} termakan ayam, dan seorang warga ikut sakit perut."),
   O("Berburu tikus bersama", "Warga beramai-ramai mengusir tikus dari lumbung sambil tertawa dan berteriak.")),
 D("minta_hujan", "Memohon Hujan",
   "Musim kering berkepanjangan. Sumur hampir kering. Warga berkumpul menunggu keputusan.",
   O("Berdoa bersama memohon hujan", "Seluruh desa berdoa bersama di lapangan, masing-masing dengan caranya. Hati terasa lebih ringan.",
     "Hari {hari}: Gerimis turun, seolah menjawab doa bersama hari {hari_keputusan}. Warga menengadah sambil tersenyum."),
   O("Gali sumur lebih dalam", "Sumur digali lebih dalam seharian. Mata air baru memancar!"),
   O("Beli air dari desa sebelah", "Gerobak tong air datang dari desa sebelah. Ember dan tempayan kembali penuh.")),
 D("buka_hutan", "Membuka Hutan",
   "Warga ingin ladang gandum baru. Hutan ek di lereng dekat desa bisa dibuka, tapi para tetua mengingatkan: hutan menahan air dan tanah.",
   O("Biarkan hutan tetap rimbun", "Hutan tetap rimbun. Beberapa petani menghela napas, tapi para tetua tersenyum.",
     "Hari {hari}: Hutan yang dijaga sejak hari {hari_keputusan} penuh buah beri dan kenari. Warga pulang membawa sekeranjang penuh."),
   O("Buka 2 petak di pinggir hutan", "Dua petak dibuka. Kayu menumpuk dan ladang baru siap dibajak.",
     "Hari {hari}: Air bah turun dari hulu. Hutan yang dibuka hari {hari_keputusan} tidak lagi menahan hujan."),
   O("Buka lereng yang luas", "Lereng terbuka lebar. Kayu melimpah dan tiga ladang baru siap, tapi rusa dan rubah kehilangan rumahnya.",
     "Hari {hari}: Tanah longsor! Lereng yang dibuka hari {hari_keputusan} tidak kuat menahan hujan deras.")),
 D("tengkulak_padi", "Pedagang Gandum Datang",
   "Seorang pedagang gandum dari kota menawar hasil panen desa dengan harga lumayan. \"Bayar kontan, Kepala Desa!\"",
   O("Simpan gandum untuk musim dingin", "Pedagang itu pergi dengan kecewa. Lumbung tetap penuh.",
     "Hari {hari}: Musim dingin datang, dan gandum yang disimpan sejak hari {hari_keputusan} membuat warga tenang."),
   O("Jual 20 gandum", "Gandum ditukar perkakas dan papan. Gudang jadi lebih lengkap.",
     "Hari {hari}: Harga roti naik di musim dingin. Gandum yang dijual hari {hari_keputusan} kini terasa mahal untuk dibeli kembali.",
     "Hari {hari}: Ketahuan, timbangan pedagang hari {hari_keputusan} ternyata tidak pas. Satu perkakas yang dijanjikan tidak pernah datang. Lain kali, ajak warga yang jujur ikut menimbang."),
   O("Jual 40 gandum borongan", "Gerobak pedagang penuh. Desa mendapat perkakas, papan, dan kopi.",
     "Hari {hari}: Harga roti melonjak di musim dingin. Warga mulai menyesali borongan hari {hari_keputusan}.",
     "Hari {hari}: Borongan hari {hari_keputusan} ternyata ditimbang dengan timbangan yang tidak pas. Dua perkakas kurang dari janji. Warga menghela napas.")),
 D("rentenir", "Pemberi Pinjaman dari Kota",
   "Seorang pemberi pinjaman bermantel tebal dan bertopi tinggi datang menawarkan pinjaman kayu dan batu. \"Bayarnya nanti saja, bunganya kecil,\" katanya sambil tersenyum lebar.",
   O("Tolak, kita bekerja bersama saja", "Pemberi pinjaman itu pergi. Warga bekerja bersama mengumpulkan bahan sendiri, dan hati terasa lega."),
   O("Pinjam sedikit", "Kayu dan batu datang. Tapi ada catatan utang yang harus dibayar dalam 14 hari.",
     "Hari {hari}: Pemberi pinjaman datang menagih utang hari {hari_keputusan}. Jumlahnya ternyata lebih besar dari pinjaman."),
   O("Pinjam banyak", "Bahan bangunan melimpah. Utang besar harus dibayar dalam 21 hari.",
     "Hari {hari}: Pemberi pinjaman datang menagih pinjaman besar hari {hari_keputusan}. Warga saling pandang dengan cemas.")),
 D("tanggap_reog", "Rombongan Sandiwara Keliling",
   "Rombongan pemusik dan penari bertopeng keliling menawarkan pentas di desa. Warga sudah tidak sabar.",
   O("Tonton dari jauh saja", "Warga menonton rombongan yang lewat di jalan desa sebelah. Lumayan seru!"),
   O("Undang mereka pentas di desa", "Biola dan tambur mengalun, penari bertopeng berputar di halaman balai! Seluruh desa bersorak dan menari."),
   O("Undang sekalian minta diajari", "Setelah pentas, para penari mengajari warga tarian rakyat. Ada yang mulai bermimpi punya sanggar sendiri.",
     "Hari {hari}: Sejak pentas hari {hari_keputusan}, anak-anak berlatih tarian rakyat di halaman setiap sore. Para orang tua menonton sambil tersenyum.")),
]

# ---------------- momen kecil (12) ----------------
MOMEN = {
 "nama_api": M("Nama untuk Api Unggun", "Warga ingin memberi nama api unggun yang selalu menyala di tengah desa.",
   ("\"Api Persahabatan\"", "Mulai malam ini, api unggun itu bernama Api Persahabatan. Semua bertepuk tangan."),
   ("\"Api Para Perintis\"", "Api itu dinamai untuk mengenang para perintis desa. Warga yang religius tersenyum haru."),
   ("Biarkan tanpa nama", "\"Api ya api,\" kata seseorang. Semua tertawa, dan api tetap menyala hangat.")),
 "lagu_malam": M("Lagu Malam Ini", "Malam yang tenang. Lagu apa yang dinyanyikan di dekat api unggun?",
   ("Lagu rakyat riang", "Lagu rakyat yang riang mengalun, dan beberapa orang mulai menghentakkan kaki mengikuti irama."),
   ("Lagu permainan anak", "Anak-anak bernyanyi sambil bergandengan dan berputar. Orang tua ikut bertepuk tangan."),
   ("Balada lama", "Balada lama tentang gunung dan sungai membuat malam terasa syahdu.")),
 "gubuk_pertama": {"pilihan": {"__byIdx": {"2": {"teks_hasil": "Undian pakai ranting pendek-panjang. Semua tertawa melihat hasilnya."}}}},
 "ayam_jago": {"pilihan": {"__byIdx": {"2": {"teks": "Jadikan alarm pagi"}}}},
 "jenang_suro": M("Bikin Selai Bersama", "Ada yang ingin membuat selai apel bersama-sama di dapur.",
   ("Nanti saja", "Rencana membuat selai ditunda. Mungkin lain waktu."),
   ("Bikin bareng-bareng", "Apel diaduk bergantian di kuali besar sampai kental dan harum. Semua yang membantu makin akrab.")),
 "cerita_hantu": M("Cerita Hantu Hutan", "Malam berkabut. Anak-anak muda ingin bercerita tentang hantu penunggu hutan di dekat api unggun.",
   (None, None), (None, None),
   ("Ganti dongeng kelinci cerdik", "Dongeng kelinci cerdik yang mengakali rubah membuat anak-anak tertawa sampai tertidur.")),
 "burung_perkutut": M("Burung Robin di Menara Jaga", "Seekor burung robin berdada jingga hinggap di menara jaga dan bersiul merdu.",
   ("Biarkan terbang", "Robin bersiul sebentar, lalu terbang ke pohon ek."),
   ("Buatkan rumah burung", "Rumah burung kecil dipaku di menara jaga. Siulan robin kini menemani pagi, dan warga yang sabar senang mendengarkannya berlama-lama."),
   ("Taburkan remah sambil berdoa", "Remah roti ditaburkan dengan doa kecil untuk desa. Warga yang religius merasa tenteram.")),
 "teh_tubruk": M("Teh Hangat untuk Pekerja", "Angin sejuk bertiup. Siapa yang mau menyeduh teh hangat untuk para pekerja?",
   ("Tidak usah", "Para pekerja minum air sumur saja. Cukup menyegarkan."),
   ("{nama} saja", "{nama} menyeduh teh madu hangat. Rekan-rekan kerjanya berterima kasih.")),
 "mimpi_panen": {"deskripsi": "{nama} bermimpi ladang gandum desa menguning keemasan sampai ke kaki gunung."},
 "kentongan_iseng": M("Lonceng Iseng", "Anak-anak membunyikan lonceng menara jaga iseng-iseng. Warga sempat panik!",
   ("Maafkan saja", "Anak-anak minta maaf dengan wajah merah. Warga tertawa lega."),
   ("Ajari kode lonceng", "Para penjaga mengajari arti setiap bunyi lonceng: aman, waspada, bahaya. Anak-anak mendengarkan dengan serius.")),
}

# ---------------- Festival Panen (pengganti Agustusan) ----------------
def L(nama, desk, aturan, **kw): return dict(nama=nama, deskripsi=desk, aturan=aturan, **kw)
LOMBA = {
 "balap_karung": L("Balap karung", "Melompat dalam karung goni sampai garis akhir.",
   "Peserta masuk ke karung goni, lalu melompat sampai garis akhir. Yang jatuh boleh bangkit lagi.",
   mulai=["Hari {hari}: Peserta balap karung berbaris di garis start, karung sampai pinggang."],
   lucu=["Hari {hari}: {nama} melompat terlalu semangat dan berguling sampai garis akhir. Tetap dihitung!"],
   rival_jatuh=["Hari {hari}: {nama} dan {nama2} jatuh bertumpuk di tengah lintasan. Mereka tertawa bersama sampai lupa sedang bersaing."],
   menang=["Hari {hari}: {nama} memenangkan balap karung dengan lompatan seperti katak kolam!",
           "Hari {hari}: {nama} melompat paling jauh dan menang balap karung! Karungnya sampai robek sedikit."],
   kalah=["Hari {hari}: {nama} sudah hampir sampai garis akhir, tapi karungnya tersangkut kaki sendiri. \"Tahun depan!\"",
          "Hari {hari}: {nama} kalah tipis di balap karung, tapi tertawa paling keras."]),
 "makan_kerupuk": L("Gigit apel bergantung", "Menggigit apel yang digantung dengan tali tanpa memakai tangan.",
   "Apel digantung dengan tali. Tangan di belakang punggung, gigit dan habiskan apel paling cepat!",
   mulai=["Hari {hari}: Apel merah bergoyang di atas tali. Peserta berdiri dengan tangan di belakang."],
   lucu=["Hari {hari}: Setiap kali {nama} hampir menggigit, apelnya berayun menjauh. Penonton berteriak memberi semangat.",
         "Hari {hari}: Apel {nama} jatuh ke rumput. Ia memandanginya dengan sedih sampai panitia memberi apel baru."],
   menang=["Hari {hari}: Kres-kres! {nama} menghabiskan apelnya paling cepat dan menang!",
           "Hari {hari}: {nama} menghabiskan apel dalam beberapa gigitan besar! Penonton bersorak."],
   kalah=["Hari {hari}: Apel {nama} terus berayun ke sana kemari. Ia kalah, tapi menghibur semua orang."]),
 "tarik_tambang": L("Tarik tambang", "Dua regu beradu kuat menarik tambang tebal.",
   "Dua regu menarik tambang. Regu yang menyeret pita merah melewati garis menang.",
   mulai=["Hari {hari}: Regu ladang melawan regu hutan! Tambang tebal terbentang di tengah lapangan."],
   salaman=["Hari {hari}: Setelah lomba, {nama} dan {nama2} yang berbeda regu bersalaman dan tertawa. Persaingan mencair."],
   menang=["Hari {hari}: Dengan aba-aba {nama}, regunya menarik serempak dan menang! Mereka berpelukan berlumur lumpur.",
           "Hari {hari}: Regu {nama} menarik sekuat tenaga dan menang! Semua jatuh terduduk sambil tertawa."],
   kalah=["Hari {hari}: Regu {nama} terseret pelan-pelan ke garis. Mereka kalah, tapi saling merangkul."]),
 "panjat_pinang": L("Panjat tiang licin", "Memanjat tiang kayu licin untuk meraih hadiah di puncak. Harus kerja sama!",
   "Tiang kayu dilumuri lemak. Satu regu saling menopang sampai ada yang mencapai hadiah di puncak.",
   mulai=["Hari {hari}: Tiang kayu licin berhias pita berdiri di lapangan. Hadiah bergantungan di puncaknya: perkakas, kopi, dan kain."],
   coba_gagal=["Hari {hari}: Tim {nama} merosot lagi! Semua belepotan, penonton tertawa sampai sakit perut."],
   menang=["Hari {hari}: Dengan bersusun bahu, tim {nama} meraih puncak tiang! Sorak-sorai membahana.",
           "Hari {hari}: Dengan kaki di pundak teman, {nama} meraih pita di puncak tiang! Sorak-sorai terdengar sampai ladang."],
   gagal_semua=["Hari {hari}: Tidak ada yang sampai puncak tahun ini, tapi semua pulang dengan tawa dan baju penuh lumpur."],
   kalah=["Hari {hari}: {nama} merosot untuk ketiga kalinya, belepotan lemak dari kepala sampai kaki. Penonton tetap bertepuk tangan."]),
 "bakiak": L("Balap papan bertiga", "Tiga orang melangkah bersama di atas sepasang papan kayu panjang.",
   "Tiga orang berdiri di atas sepasang papan panjang bertali. Langkah harus kompak: kiri, kanan, kiri!",
   mulai=["Hari {hari}: Papan panjang bertali dibagikan. Setiap tim harus melangkah dengan irama yang sama."],
   lucu=["Hari {hari}: Tim {nama} terus berteriak \"kiri, kanan!\" tapi tetap jatuh bersama-sama."],
   menang=["Hari {hari}: Tim {nama} melangkah kompak seperti satu tubuh dan menang balap papan!",
           "Hari {hari}: Regu {nama} melangkah seirama dan menang balap papan bertiga!"],
   kalah=["Hari {hari}: Regu {nama} jatuh bertumpuk di tengah jalan. \"Kiri! Kiri!\" teriak mereka, terlambat."]),
 "kelereng_sendok": L("Lari telur sendok", "Anak-anak berjalan cepat membawa telur rebus di atas sendok.",
   "Sendok dipegang dengan satu tangan, telur rebus di atasnya. Jalan cepat sampai garis akhir tanpa menjatuhkan telur.",
   mulai=["Hari {hari}: Anak-anak berbaris dengan sendok di tangan. Telur rebus bergoyang-goyang."],
   lucu=["Hari {hari}: Telur {nama} jatuh tiga kali, tapi ia tetap tersenyum dan mengulang dari awal."],
   menang=["Hari {hari}: {nama} berjalan pelan tapi pasti dan menang lari telur sendok! Orang tuanya bersorak paling keras.",
           "Hari {hari}: {nama} berjalan setenang air dan sampai pertama tanpa menjatuhkan telur!"],
   kalah=["Hari {hari}: Telur {nama} menggelinding ke parit. Anak-anak berebut mencarikannya."]),
 "hias_gapura": L("Hias gerbang panen", "Menghias gerbang dan jalan desa dengan ikatan gandum, labu, dan pita.",
   "Setiap regu menghias gerbang dengan ikatan gandum, labu, dan pita warna-warni. Kepala Desa menilai yang paling indah.",
   mulai=["Hari {hari}: Warga mengikat gandum, menyusun labu, dan menggantung pita di gerbang desa."],
   selesai=["Hari {hari}: Gerbang desa berhias gandum dan pita. Para tamu dari desa sebelah pasti terkesan!"],
   menang=["Hari {hari}: Gerbang buatan regu {nama} dinilai paling indah! Karangan daun gugurnya melengkung cantik."],
   kalah=["Hari {hari}: Gerbang regu {nama} sedikit miring, tapi tetap dipuji karena warnanya meriah."]),
 "pawai_reog": L("Pawai lentera", "Pawai lentera keliling desa diikuti seluruh warga.",
   "Pawai keliling desa dengan lentera labu, topeng, dan musik. Anak-anak membawa lentera kecil.",
   mulai=["Hari {hari}: Tambur ditabuh, dan lentera labu besar memimpin pawai keliling desa!"],
   selesai=["Hari {hari}: Pawai lentera membuat penonton dari desa sebelah berdatangan. Desa kita jadi buah bibir."],
   menang=["Hari {hari}: Lentera yang dibawa {nama} bersinar paling indah sepanjang pawai!"],
   kalah=["Hari {hari}: Pawai sempat berhenti karena sekawanan angsa lewat. Semua menunggu sambil menabuh tambur pelan-pelan."]),
}
FESTIVAL = {
 "_catatan": "Tema sedang: Agustusan -> Festival Panen (hari ke-21 tiap tahun = hari terakhir gugur). Id lomba tetap; nama & teks padanan non-Indonesia.",
 "panitia": {"judul": "Panitia Festival Panen",
   "teks": "Musim gugur hampir usai dan lumbung sudah terisi. Pilih lomba untuk Festival Panen tahun ini!",
   "umbul": "Pasang bendera hias (kayu)", "tahun1": "Tahun pertama: warga urunan seadanya, lomba gratis.",
   "setuju": "Setuju",
   "log": ["Hari {hari}: Panitia Festival Panen dibentuk di balai desa. {nama} terpilih jadi ketua dan langsung sibuk mencatat."]},
 "umbul_umbul": ["Hari {hari}: Untaian bendera warna-warni dibentangkan di sepanjang jalan desa. Semua jadi bersemangat.",
                 "Hari {hari}: Bendera hias dan karangan daun gugur menghiasi rumah-rumah. Desa tampak meriah."],
 "malam_tirakatan": ["Hari {hari}: Malam sebelum festival. Warga duduk melingkar di dekat api unggun dan lentera labu, mendengarkan para tetua bercerita tentang para perintis desa.",
                     "Hari {hari}: Roti panen besar berbentuk anyaman gandum dipotong dan dibagi. Doa syukur untuk desa mengalun pelan."],
 "upacara": ["Hari {hari}: Pagi-pagi lonceng desa dibunyikan tiga kali. {nama} mengibarkan bendera desa, dan Festival Panen resmi dibuka.",
             "Hari {hari}: Seluruh warga berkumpul di lapangan. Ikatan gandum pertama dipersembahkan sebagai tanda syukur, dan anak-anak bersorak."],
 "panggung_hiburan": ["Hari {hari}: Malamnya ada dansa di lumbung. Juara diumumkan, dan semua bertepuk tangan.",
                      "Hari {hari}: Lentera menerangi panggung. Ada biola, lagu rakyat, dan tawa sampai larut."],
 "juara_umum": ["Hari {hari}: {nama} menjadi juara umum Festival Panen tahun ini! Mahkota jerami dan pita biru diserahkan dengan bangga."],
 "pengumuman_lomba": ["Hari {hari}: Juara lomba {lomba} tahun ini: {nama}! Hadiahnya sekeranjang apel, sepotong keju, dan tepuk tangan meriah."],
 "lomba": LOMBA,
}

# ---------------- rubah (pengganti monyet: peringatan_dini.ancaman_monyet) ----------------
RUBAH = {"nama": "Rubah merah", "catatan": "Mencuri di siang hari (roti, apel, telur di Gudang). Tidak melukai.",
 "tingkat": {
  "waspada": {"judul": "Jejak Rubah", "saran": "Tutup Gudang rapat dan jaga kandang ayam.",
              "teks": ["Jejak kaki kecil terlihat di dekat Gudang. Seekor rubah merah memperhatikan tumpukan roti dari semak.",
                       "{nama} melihat ekor merah berkelebat di balik pagar Gudang."]},
  "bahaya": {"judul": "Rubah Beraksi!", "saran": "Usir dengan lonceng dan pasang orang-orangan.",
             "teks": ["Seekor rubah menyelinap ke kebun dan menggondol sekeranjang apel!",
                      "Pintu Gudang terbuka sedikit, dan seekor rubah sudah lari membawa sepotong roti."]},
  "reda": {"judul": "Kembali ke Hutan",
           "teks": ["Rubah itu kembali ke liangnya di hutan sambil mengunyah. Desa tenang lagi.",
                    "Rubah sudah pergi. Anak-anak tertawa menirukan gaya ekornya yang mengibas."]}}}

# ---------------- kerja bersama & teks kartu dilema ----------------
KERJA = {
 "tombol": "Kerja bersama",
 "terkunci_lapar": "Warga sedang kesusahan pangan. Kerja bersama ditunda dulu.",
 "terkunci_malam": "Kerja bersama hanya bisa siang hari.",
 "cooldown": "Kerja bersama berikutnya bisa {jumlah} hari lagi.",
 "mulai": ["Hari {hari}: Ding-dong! Lonceng desa berbunyi pagi-pagi. Seluruh warga berkumpul untuk kerja bersama.",
           "Hari {hari}: {nama} memimpin kerja bersama hari ini. Semua membawa sekop, keranjang, dan semangat."],
 "selama": ["Hari {hari}: Ada yang membawa roti hangat dan teh madu. Kerja bersama jadi terasa seperti pesta kecil.",
            "Hari {hari}: {nama} dan {nama2} berlomba siapa yang paling banyak mengangkut batu, sambil tertawa."],
 "selesai": ["Hari {hari}: Kerja bersama selesai. Desa bersih, monumen makin tinggi, dan semua makin akrab.",
             "Hari {hari}: Sore yang lelah tapi bahagia. Warga makan bersama di bawah pohon ek."],
 "kenduri": ["Makan bersama di balai: sup dan roti dibagi untuk warga dan tetangga. Semua pulang dengan perut kenyang.",
             "Lumbung sedang lega, jadi sebagian bekal dibawa ke desa sebelah sebagai hadiah tetangga.",
             "{nama} ikut membagikan roti hangat dari makan bersama. Tetangga yang menerima tersenyum lebar.",
             "Makan malam bersama di balai: sup labu, roti, dan cerita sampai larut.",
             "Makan bersama di balai: {jumlah} porsi sup dan roti dibagi untuk warga dan tetangga."],
 "kenduri_syukuran": ["Pesta kecil: warga makan bersama, {jumlah} porsi habis dengan gembira.",
                      "Makan bersama di halaman balai. {jumlah} porsi sup dan roti dinikmati sambil bercanda."],
 "kenduri_sedekah": ["Hadiah untuk desa tetangga: {jumlah} porsi diantar dengan keranjang. Tetangga berterima kasih.",
                     "{nama} dan {nama2} mengantar {jumlah} porsi ke desa tetangga. Pulangnya mereka membawa salam hangat."],
 "log_mulai": ["Warga bekerja bersama seharian. Capek, tapi hati senang.",
               "Lonceng berbunyi pagi-pagi. Seluruh warga turun bekerja bersama sampai sore.",
               "{nama} dan {nama2} memimpin kerja bersama. Pekerjaan berat terasa ringan bila dikerjakan bersama."],
}
DILEMA_UI = {
 "syukuran_panen": ["Pesta panen: {jumlah} porsi sup dan roti dimasak bersama dan dibagi ke tetangga.",
                    "Makan syukur panen di balai desa. {jumlah} porsi dibagikan, lagu syukur mengalun pelan.",
                    "Panen kali ini cukup melimpah. Warga memanggang {jumlah} porsi roti dan membaginya dengan desa sebelah."],
 "utang_lunas": ["Utang ke pemberi pinjaman dilunasi. Warga menarik napas lega.",
                 "Pemberi pinjaman datang menagih, dan desa membayar lunas. \"Semoga tidak perlu meminjam lagi,\" kata para tetua.",
                 "Catatan utang dicoret. Desa kembali bebas dari tagihan."],
 "utang_sita": ["Utang belum terbayar. Pemberi pinjaman menyita separuh kayu, batu, dan papan desa.",
                "Gudang belum cukup untuk membayar. Pemberi pinjaman membawa pergi separuh kayu, batu, dan papan. Warga terdiam sedih.",
                "Pemberi pinjaman menyita separuh kayu, batu, dan papan desa. \"Lain kali kita bekerja bersama saja,\" bisik para tetua."],
}

# ---------------- pangan v9 (v1.6.0): padanan iklim sedang ----------------
# Hanya yang dipakai tema sedang. Tidak ditulis (Nusantara saja, FOOD_SOURCES_PATCH buah/keong = null, tanaman tropis):
# sumber buah/mangga/rambutan/pisang/kelapa/keong/padi/jagung/ubi/singkong, tugas.buah, tugas.keong, pohon_buah, berbuah, belum_berbuah.
PANGAN = {
 "sumber": {"meramu": "Buah beri", "memancing": "Ikan", "ikan": "Ikan", "jamur": "Jamur", "umbi": "Kentang liar",
            "gandum": "Gandum", "wortel": "Wortel", "makanan": "Makanan", "pasar": "Pasar", "cerita": "Kejadian",
            "kerja_bakti": "Kerja bersama", "pesta_17an": "Festival Panen"},
 "keluar": {"dimakan": "dimakan", "busuk": "busuk", "kenduri": "makan bersama", "tikus": "dimakan tikus", "monyet": "dicuri rubah",
            "syukuran_lahir": "pesta kelahiran", "syukuran_panen": "pesta panen", "pesta": "pesta", "dijual": "dijual", "lainnya": "lain-lain",
            # v1.6.1 (FOOD_OUT_FB 51b6d4d). "hadiah" sengaja tidak ditulis: teks TEKS-GAME.json sudah netral, dan validator
            # menolak key bernama hadiah di overlay (nama yang sama dipakai untuk data angka hadiah di bagian lain)
            "event": "kejadian", "cerita": "cerita", "rusak": "rusak", "pasar": "pasar", "lomba": "lomba",
            "pesta_17an": "Festival Panen", "kerja_bakti": "kerja bersama", "monumen": "monumen", "keinginan": "keinginan warga"},
 "ladang": {"banjir": "Tergenang banjir, tanaman menunggu air surut",
            "berhenti_dingin": "Berhenti tumbuh: tanah membeku (musim {musim})",
            "berhenti_kemarau": "Berhenti tumbuh: musim kering tanpa irigasi (riset Irigasi Sederhana, T04)"},
 "sudah_digali": "Sudah digali, tumbuh lagi beberapa hari",
 "daya_tarik": {
  "bahagia_syarat": "(rata-rata mood ≥ {jumlah}, tak ada warga < {jumlah2})",
  "murung": "ada warga yang murung: {jumlah}",
  "tooltip": "Daya tarik desa menentukan seberapa sering pengembara datang. Faktornya: suasana hati warga, desa bahagia beberapa hari berturut-turut, stok pangan yang cukup, dan tempat tidur kosong. Desa yang bahagia lebih sering didatangi pengembara.",
  "bonus": "→ pengembara lebih sering datang",
  "pendatang": [
   "Kabar desa yang bahagia sampai ke desa sebelah… Seorang pengembara ingin tinggal.",
   "Cerita tentang desa yang rukun dan riang terdengar sampai ke kota. Seorang pengembara datang membawa ransel, ingin ikut menetap.",
   "{nama} pernah bercerita tentang desa kita di pasar kota. Hari ini seorang pengembara datang dan bertanya, bolehkah ikut tinggal?",
   "Tawa warga terdengar sampai jalan besar. Seorang pengelana mampir minum teh madu, lalu memutuskan ingin tinggal di sini."]},
 "tugas": {
  "meramu": {"nama": "Memetik beri", "log": [
   "{nama} memetik buah beri di tepi hutan dan pulang membawa {jumlah} genggam.",
   "{nama} menyusuri semak beri sambil bersenandung. Keranjangnya terisi {jumlah} beri yang manis."]},
  "memancing": {"nama": "Memancing", "log": [
   "{nama} duduk sabar di tepi sungai berbatu. Pulangnya membawa {jumlah} ikan trout.",
   "Kail {nama} bergetar! {jumlah} ikan masuk ke keranjang anyaman.",
   "{nama} memancing di kolam sambil bersiul pelan. Hasilnya {jumlah} ikan untuk gudang desa."]},
  "jamur": {"nama": "Mencari jamur", "log": [
   "{nama} menemukan jamur di bawah pohon ek dan memetik {jumlah}.",
   "Habis hujan, {nama} masuk ke hutan berlumut dan pulang membawa {jumlah} jamur segar."]},
  "umbi": {"nama": "Menggali kentang liar", "log": [
   "{nama} menggali kentang liar di tepi hutan dan mendapat {jumlah} butir.",
   "Tanah gembur di bawah semak menyimpan kentang liar. {nama} pulang membawa {jumlah}."]}},
}

# ---------------- bangun otomatis v9c (v1.6.1): otomatis.api_unggun / otomatis.gubuk ----------------
OTOMATIS = {
 "api_unggun": [
  "Warga menyusun batu dan kayu: api unggun pertama akan dinyalakan di perkemahan.",
  "Tanpa menunggu aba-aba, {nama} dan {nama2} menata batu melingkar. Sebentar lagi api unggun pertama menyala.",
  "Angin malam bertiup dingin. Warga sepakat menyalakan api unggun di tengah perkemahan.",
  "{nama} mengumpulkan ranting kering dan batu sungai. Api unggun pertama siap dinyalakan!"],
 "gubuk": [
  "Warga tak tahan tidur di bawah langit: mereka mulai mendirikan gubuk sendiri.",
  "{nama} dan {nama2} memasang tiang kayu dan atap jerami. Gubuk pertama sedang didirikan.",
  "Embun dan angin malam membuat warga menggigil. Mereka bekerja bersama mendirikan gubuk pertama."],
}

# ======================= v1.7.0: P1 Tujuan & Cerita (3bbeca1) — padanan iklim sedang =======================
# Bagian baru overlay: keinginan, monumen, cerita, teladan, rencana_tahun (+ key UI baru v1.7.0). Semua id dari TEKS-GAME.json;
# daftar (larik objek) memakai __byIdx supaya struktur tetap. Placeholder hanya yang ada di teks Nusantara path yang sama.
# Padanan: kopi tubruk -> kopi seduh, kali -> sungai/danau, bale-bale -> bangku kayu, sawah -> ladang gandum, layangan -> layang-layang,
# klepon -> kue madu, ronda -> jaga malam (lonceng), pecel -> sup sayur & roti, reog -> tari rakyat, wayang -> pertunjukan boneka,
# gamelan -> biola, haji -> ziarah ke biara jauh, masjid -> kapel batu, Pak Camat -> Tuan Pengawas, Agustusan/17-an -> Festival Panen.
def K(judul, desk, muncul, terpenuhi, kecewa, tombol=None):
    o = {"judul": judul, "deskripsi": desk, "teks_muncul": muncul, "teks_terpenuhi": terpenuhi, "teks_kecewa": kecewa}
    if tombol: o["tombol"] = tombol
    return o
KEINGINAN = {
 "makan_rendang": K("Ingin makan semur daging", "Semur daging sapi dengan bawang dan wortel, dimasak pelan berjam-jam sampai empuk.",
   ["{nama} menelan ludah membayangkan semur daging. \"Dimasak lama di kuali besar...\""],
   ["Hari {hari}: {nama} makan semur daging buatan dapur desa. Ia memejamkan mata, menikmati setiap suapan."],
   ["Hari {hari}: {nama} hanya bisa membayangkan semur daging. Ia sedikit kecewa."], "Masakkan semur"),
 "nasi_pecel": K("Ingin sup sayur kebun", "Sup kentang, kubis, dan wortel dengan roti hangat yang baru dipanggang.",
   ["{nama} rindu sup sayur buatan ibunya dulu."],
   ["Hari {hari}: {nama} menyeruput sup sayur hangat dengan sepotong roti. \"Rasanya seperti di rumah!\""],
   ["Hari {hari}: Belum ada sup sayur untuk {nama}. Ia makan seadanya."], "Buatkan sup sayur"),
 "kopi_pagi": K("Minum kopi pagi di beranda", "Secangkir kopi seduh di beranda sambil memandangi ladang gandum berkabut.",
   ["{nama} duduk di beranda pagi-pagi, memandang ladang berkabut. \"Andai ada kopi...\""],
   ["Hari {hari}: {nama} menyeruput kopi seduh hangat di beranda. Pagi terasa sempurna."],
   ["Hari {hari}: Pagi berlalu tanpa kopi. {nama} menghela napas."], "Seduhkan kopi"),
 "rumah_panggung": K("Punya rumah kayu sendiri", "Rumah kayu beratap jerami dengan cerobong kecil: hangat, kokoh, dan aman dari angin.",
   ["{nama} sering memandangi lahan di dekat sungai. Sepertinya ia memimpikan rumah kayu sendiri."],
   ["Hari {hari}: {nama} membuka pintu rumah kayu barunya. Matanya berkaca-kaca bahagia."],
   ["Hari {hari}: Rumah kayu impian {nama} belum juga berdiri. Ia mulai murung."]),
 "nonton_reog": K("Nonton tari rakyat", "Melihat penari bertopeng dan berpita berputar diiringi biola dan tambur.",
   ["{nama} menirukan langkah tari rakyat sambil tertawa. \"Kapan ya ada pentas tari di desa ini?\""],
   ["Hari {hari}: {nama} bersorak paling keras saat para penari berputar. Ia bahagia sekali."],
   ["Hari {hari}: Pentas tari rakyat belum juga ada. {nama} menyimpan topeng mainannya dengan sedih."]),
 "tabungan_haji": K("Menabung untuk ziarah jauh", "Menabung sedikit demi sedikit di celengan tanah liat, berharap suatu hari berziarah ke biara tua di balik pegunungan.",
   ["{nama} membuat celengan dari tanah liat. \"Sedikit-sedikit, lama-lama cukup,\" katanya penuh harap."],
   ["Hari {hari}: Tabungan {nama} akhirnya cukup! Seluruh desa mengantar keberangkatannya dengan doa dan air mata haru."],
   ["Hari {hari}: Tabungan {nama} belum cukup tahun ini. \"Masih ada tahun depan,\" katanya tabah."], "Setor ke celengan"),
 "mancing_sore": K("Memancing sore di sungai", "Duduk di tepi sungai berbatu dengan joran kayu sampai matahari terbenam.",
   ["{nama} memandangi joran kayunya. \"Sore ini cocok untuk memancing.\""],
   ["Hari {hari}: {nama} pulang dari sungai membawa ikan dan senyum lebar."],
   ["Hari {hari}: {nama} terlalu sibuk untuk memancing. Joran kayunya masih bersandar di dinding."]),
 "punya_ayam": K("Punya ayam sendiri", "Beberapa ekor ayam cokelat yang berkokok setiap pagi.",
   ["{nama} menirukan kokok ayam setiap pagi. Sepertinya ia ingin memelihara ayam."],
   ["Hari {hari}: Ayam-ayam di kandang baru berkokok nyaring. {nama} menaburkan biji-bijian sambil tertawa."],
   ["Hari {hari}: Belum ada kandang ayam. Kokokan {nama} terdengar lesu."]),
 "baju_baru": K("Baju baru untuk Festival Panen", "Kemeja wol atau gaun berbordir baru untuk hari besar.",
   ["{nama} memandangi kain-kain di gerobak pedagang. \"Bagus sekali untuk Festival Panen...\""],
   ["Hari {hari}: {nama} memakai baju barunya dan berputar-putar di depan balai desa. Semua memuji."],
   ["Hari {hari}: {nama} memakai baju lamanya lagi. Tidak apa-apa, katanya, walau sedikit kecewa."], "Belikan baju"),
 "ziarah_makam": K("Mengunjungi makam", "Membersihkan makam orang tersayang dan meletakkan seikat bunga liar.",
   ["{nama} memetik bunga liar di tepi jalan. Sepertinya ia ingin mengunjungi makam."],
   ["Hari {hari}: {nama} meletakkan bunga dan berdoa di makam. Hatinya terasa lebih ringan."],
   ["Hari {hari}: {nama} belum sempat ke makam. Rindunya belum terobati."]),
 "wayang_semalam": K("Nonton pertunjukan boneka", "Pertunjukan boneka kayu di bawah cahaya lentera, penuh dongeng ksatria dan naga.",
   ["{nama} bercerita tentang ksatria pemberani dan naga yang ramah. \"Sudah lama tidak nonton pertunjukan boneka,\" katanya."],
   ["Hari {hari}: Desa menonton pertunjukan boneka sampai larut. {nama} tertawa paling keras saat boneka badut muncul."],
   ["Hari {hari}: Belum ada pertunjukan boneka. {nama} mendongengkannya sendiri untuk anak-anak."], "Undang pemain boneka"),
 "tidur_siang": K("Tidur siang di bangku kayu", "Tidur sebentar di bangku kayu di bawah pohon, ditemani angin sepoi-sepoi.",
   ["{nama} melirik bangku kayu di bawah pohon dengan penuh rindu."],
   ["Hari {hari}: {nama} tidur siang di bangku kayu sambil mendengkur halus. Bangunnya segar sekali."],
   ["Hari {hari}: {nama} tidak sempat tidur siang. Ia menguap sepanjang sore."]),
 "kerja_bakti": K("Ikut kerja bersama", "Membersihkan desa bersama-sama, lalu makan roti dan sup hangat.",
   ["{nama} menyingsingkan lengan baju. \"Kapan kita kerja bersama lagi?\""],
   ["Hari {hari}: {nama} ikut kerja bersama dengan semangat. Desa bersih, hatinya senang."],
   ["Hari {hari}: Kerja bersama belum diadakan. {nama} membersihkan halamannya sendiri."]),
 "punya_anak": K("Ingin punya anak", "Mendambakan tangis bayi di rumah kecilnya.",
   ["{nama} tersenyum melihat bayi tetangga. Sepertinya ia juga mendambakan seorang anak."],
   ["Hari {hari}: Kabar bahagia! {nama} akan segera punya anak."],
   ["Hari {hari}: {nama} menatap bintang. \"Mungkin belum waktunya,\" bisiknya."]),
 "sawah_menguning": K("Melihat ladang gandum menguning", "Berdiri di tepi ladang memandangi gandum keemasan yang siap dipanen.",
   ["{nama} sering berjalan ke tepi ladang sore-sore. Ia menunggu gandum menguning."],
   ["Hari {hari}: {nama} berdiri di tepi ladang memandangi gandum keemasan yang bergoyang ditiup angin. \"Indahnya,\" bisiknya."],
   ["Hari {hari}: Gandum belum menguning. {nama} pulang dengan langkah pelan."]),
 "jajan_pasar": K("Beli kue di pasar desa", "Kue madu hangat dan roti kayu manis dari kios pasar desa.",
   ["{nama} membayangkan kue madu hangat yang lembut di mulut."],
   ["Hari {hari}: {nama} membeli kue madu dan roti kayu manis di pasar. Manisnya meleleh di lidah!"],
   ["Hari {hari}: {nama} belum sempat ke pasar. Bayangan kue madu masih menghantuinya."], "Belikan kue"),
 "belajar_gamelan": K("Belajar main biola", "Menggesek biola dan meniup seruling di ruang latihan desa.",
   ["{nama} mengetuk-ngetuk ember mengikuti irama. Sepertinya ia ingin belajar bermusik."],
   ["Hari {hari}: Ngiiik... lalu merdu! {nama} memainkan lagu pertamanya dengan biola di ruang latihan."],
   ["Hari {hari}: {nama} masih mengetuk ember. Iramanya terdengar sedikit sedih."]),
 "rujak_bareng": K("Minum sari apel hangat bersama tetangga", "Sari apel hangat berbumbu kayu manis, diminum beramai-ramai saat hari dingin.",
   ["Hari dingin. {nama} membayangkan secangkir sari apel hangat bersama tetangga."],
   ["Hari {hari}: {nama} dan para tetangga minum sari apel hangat di dekat perapian balai. Manis, hangat, dan penuh tawa!"],
   ["Hari {hari}: Belum ada sari apel hangat. {nama} meniup-niup tangannya yang dingin."], "Siapkan sari apel"),
 "bancakan_weton": K("Pesta ulang tahun kecil", "Pesta kecil di hari ulang tahun, berbagi kue dan roti dengan tetangga.",
   ["{nama} menghitung hari dengan jari. \"Sebentar lagi ulang tahunku.\""],
   ["Hari {hari}: Pesta ulang tahun {nama}: kue dan roti dibagikan ke tetangga. Semua menyanyikan lagu untuknya."],
   ["Hari {hari}: Ulang tahun {nama} lewat tanpa pesta. Ia meniup lilin kecil sendiri di rumah."], "Adakan pesta"),
 "pulang_kampung": K("Pulang ke desa asal sebentar", "Menjenguk keluarga di desa asal selama beberapa hari.",
   ["{nama} sering memandang ke arah gunung. Ia rindu desa asalnya."],
   ["Hari {hari}: {nama} pamit pulang sebentar ke desa asalnya dengan bekal di punggung. \"Aku pasti kembali!\""],
   ["Hari {hari}: {nama} belum bisa pulang ke desa asal. Rindunya makin berat."], "Izinkan pulang"),
 "ronda_malam": K("Ikut jaga malam", "Berjaga malam di menara jaga sambil memegang lentera dan lonceng.",
   ["{nama} memeriksa lonceng di menara jaga. \"Malam ini aku mau ikut jaga.\""],
   ["Hari {hari}: {nama} berjaga semalaman dengan bangga. Desa aman di bawah penjagaannya."],
   ["Hari {hari}: {nama} tidak kebagian giliran jaga malam. Ia sedikit kecewa."]),
 "main_layangan": K("Main layang-layang di bukit", "Menerbangkan layang-layang kain di atas bukit saat angin bertiup.",
   ["{nama} kecil memandangi langit yang berangin. \"Ini cuaca layang-layang!\""],
   ["Hari {hari}: Layang-layang {nama} terbang paling tinggi di atas bukit. Orang tuanya ikut bersorak."],
   ["Hari {hari}: Angin bagus terlewat lagi. {nama} menyimpan layang-layangnya dengan sedih."], "Buatkan layang-layang"),
 "menang_lomba": K("Menang lomba Festival Panen", "Juara salah satu lomba Festival Panen.",
   ["{nama} berlatih balap karung di halaman. \"Tahun ini aku harus menang!\""],
   ["Hari {hari}: {nama} juara lomba Festival Panen! Ia mengangkat hadiahnya tinggi-tinggi."],
   ["Hari {hari}: {nama} belum menang tahun ini. \"Tahun depan!\" katanya sambil tertawa."]),
 "tumpeng_syukuran": K("Roti panen bersama", "Roti besar berbentuk anyaman gandum dengan selai dan keju untuk mensyukuri panen.",
   ["{nama} bercerita tentang roti panen besar di desa asalnya. Matanya berbinar."],
   ["Hari {hari}: {nama} memotong roti panen dengan bangga. Seluruh desa bersyukur bersama."],
   ["Hari {hari}: {nama} bertanya lagi kapan desa akan memanggang roti panen."], "Panggang roti panen"),
 "mandi_kali": K("Berenang di danau bareng", "Berenang dan bermain air di danau bersama teman-teman saat hari cerah.",
   ["{nama} memandang danau yang jernih setelah hujan. Ia ingin berenang bersama teman."],
   ["Hari {hari}: {nama} berenang di danau bersama teman-teman. Segarnya sampai ke hati!"],
   ["Hari {hari}: Air danau terlalu dingin hari ini. {nama} hanya mencelupkan kaki."]),
 "_ui": {"otomatis": "menunggu kesempatan"},
}
def TH(nama, mulai, progres, selesai, bonus): return {"nama": nama, "mulai": mulai, "progres": progres, "selesai": selesai, "bonus_ringkas": bonus}
def MON(nama, desk, *tahap): return {"nama": nama, "deskripsi": desk, "tahap": {"__byIdx": {str(i): t for i, t in enumerate(tahap)}}}
MONUMEN = {
 "ui": {"log_mulai_umum": "Hari {hari}: Pembangunan {monumen} memasuki tahap {tahap}. Warga bekerja bersama.",
        "pasaran": "Hari ini hari pasar desa."},
 "masjid": MON("Kapel Batu", "Dari kapel kayu sederhana tumbuh menjadi kapel batu bermenara dengan lonceng besar.",
  TH("Kapel Kayu Kecil", "Hari {hari}: Penduduk sepakat membangun kapel kecil dari kayu. {nama} menancapkan tiang pertama.",
     ["Tiang-tiang kayu berdiri. Anak-anak berlarian di antara tiangnya.", "Dinding papan mulai dipasang.", "Atap jerami hampir menutup. Tinggal bangku kayu untuk duduk."],
     "Hari {hari}: Kapel Kayu Kecil selesai! Lonceng kecil pertama berdentang lembut di pagi hari.",
     "Warga religius lebih tenang; lonceng pagi membangunkan desa lebih awal; duka lebih cepat reda."),
  TH("Kapel Papan", "Hari {hari}: Kapel diperbesar dengan dinding papan dan fondasi batu. {nama} mengukur fondasi dengan tali.",
     ["Fondasi batu tersusun rapi.", "Tiang dan dinding papan berdiri kokoh.", "Jendela kaca warna-warni kecil mulai dipasang."],
     "Hari {hari}: Kapel Papan selesai! Seluruh desa berkumpul untuk makan bersama. Hari saling memaafkan kini jadi acara tahunan.",
     "Semua warga lebih bahagia; duka desa lebih ringan; hari saling memaafkan tiap tahun mendamaikan yang berselisih."),
  TH("Kapel Batu", "Hari {hari}: Saatnya membangun menara lonceng. {nama} memimpin pengangkutan batu bata.",
     ["Dinding bata merah mulai menjulang.", "Menara lonceng berdiri setengah jadi. Burung-burung mulai bertengger.", "Lonceng besar dari perunggu digantung di puncak menara."],
     "Hari {hari}: Kapel Batu berdiri megah dengan menara lonceng! Penduduk menangis haru. Desa ini kini benar-benar rumah.",
     "Warga makin betah; keinginan bertahan lebih lama; membuka keinginan menabung untuk ziarah jauh.")),
 "balai_megah": MON("Balai Desa Megah", "Balai desa diperluas menjadi pusat musyawarah dan kesenian desa.",
  TH("Serambi & Lonceng Besar", "Hari {hari}: Balai desa akan diperluas. {nama} memilih kayu terbaik untuk tiang lonceng besar.",
     ["Serambi depan mulai dibangun.", "Lantai papan serambi dipasang rapi.", "Lonceng besar digantung di sudut serambi."],
     "Hari {hari}: Serambi & Lonceng Besar selesai! Ding-dong! Semua warga datang untuk musyawarah pertama.",
     "Dua monumen bisa dikerjakan bersamaan; dilema mendapat pilihan Musyawarah."),
  TH("Aula Kayu Berbalok", "Hari {hari}: Balok-balok ek besar untuk aula kayu mulai didirikan.",
     ["Empat balok utama berdiri tegak.", "Rangka atap curam tersusun rapi.", "Sirap kayu dipasang satu per satu."],
     "Hari {hari}: Aula Kayu Berbalok selesai! Atapnya menjulang anggun, dan perapian besar menghangatkan ruangan.",
     "Semua warga lebih bahagia; pendatang lebih cepat datang; lomba Festival Panen bertambah; kerja bersama lebih sering."),
  TH("Balai Megah", "Hari {hari}: Tahap terakhir: ukiran dan seperangkat alat musik. {nama} mulai memahat tiang pertama.",
     ["Ukiran daun ek dan bunga mulai menghiasi tiang.", "Biola dan tambur pertama tiba dari desa pengrajin.", "Semua ukiran dicat dan dipernis. Aula berkilau."],
     "Hari {hari}: Balai Desa Megah selesai! Musik dimainkan sampai larut, dan seluruh desa berdansa bersama.",
     "Festival dan Hari Jadi lebih meriah; kuota pasar bertambah.")),
 "bendungan": MON("Bendungan & Irigasi", "Bendung, saluran, dan pintu air di tepi sungai agar ladang tetap berair saat musim kering dan aman saat banjir.",
  TH("Bendung Keranjang Batu", "Hari {hari}: {nama} mengukur arus sungai. Keranjang anyaman berisi batu akan menahan air.",
     ["Keranjang anyaman pertama diisi batu sungai.", "Keranjang disusun melintang sungai.", "Celah-celah ditutup lumut dan tanah liat."],
     "Hari {hari}: Bendung Keranjang Batu selesai! Air sungai tertahan tenang, dan banjir lebih jarang datang.",
     "Banjir di musim basah lebih jarang."),
  TH("Saluran Induk", "Hari {hari}: Saluran induk mulai digali dari bendung ke ladang.",
     ["Parit selebar dua langkah sudah tergali.", "Dinding saluran dilapisi batu.", "Air pertama mengalir pelan ke petak terdekat."],
     "Hari {hari}: Saluran Induk selesai! Ladang di dekat saluran kini tetap tumbuh walau musim kering.",
     "Ladang dekat saluran tetap tumbuh saat musim kering; sumur tidak menyusut."),
  TH("Pintu Air", "Hari {hari}: Pintu air papan akan mengatur kapan air dibuka dan ditutup.",
     ["Rangka pintu air dipasang.", "Papan pintu air dihaluskan dan diberi engsel.", "Roda pemutar pintu air diuji coba. Krek-krek!"],
     "Hari {hari}: Pintu Air selesai! Banjir dan longsor jauh berkurang, dan gagal panen makin jarang.",
     "Banjir dan longsor jauh berkurang; gagal panen musim kering lebih jarang."),
  TH("Bendungan & Kolam Penampung", "Hari {hari}: Proyek terbesar desa: bendungan dan kolam penampung air.",
     ["Tanah kolam penampung digali bersama-sama.", "Dinding bendungan bata merah mulai menjulang.", "Air hujan mulai tertampung di kolam yang luas."],
     "Hari {hari}: Bendungan & Kolam Penampung selesai! Airnya berkilau seperti cermin. Musim sulit tidak lagi menakutkan.",
     "Air di musim sulit lebih awet; kekeringan jarang; ikan tetap ada di musim sulit.")),
 "pendopo_reog": MON("Aula Tari Rakyat", "Tempat latihan tari rakyat dan musik desa, sampai menjadi aula pertunjukan yang megah.",
  TH("Ruang Latihan", "Hari {hari}: {nama} membersihkan lahan untuk ruang latihan tari rakyat.",
     ["Lantai tanah dipadatkan dan dilapisi papan.", "Atap kayu sederhana dipasang.", "Biola dan tambur pertama digantung di dinding."],
     "Hari {hari}: Ruang Latihan selesai! Suara biola terdengar setiap malam, dan warga sekitar ikut bergoyang.",
     "Malam di dekat ruang latihan lebih menyenangkan; tempat belajar bermusik."),
  TH("Kostum & Alat Musik", "Hari {hari}: Saatnya menjahit kostum tari dan melengkapi alat musik.",
     ["Rok berbordir dan rompi penari mulai dijahit.", "Ratusan pita warna-warni dirangkai satu per satu.", "Topeng-topeng kayu dicat merah dan emas."],
     "Hari {hari}: Kostum & Alat Musik selesai! Desa kini bisa mementaskan tari rakyat di Hari Jadi dan Festival Panen.",
     "Pentas tari rakyat di Hari Jadi & Festival Panen; anak-anak ikut menari."),
  TH("Aula Pertunjukan", "Hari {hari}: Ruang latihan diperbesar menjadi aula pertunjukan untuk pentas besar.",
     ["Tiang-tiang kayu ek berukir berdiri.", "Atap tinggi bersirap mulai terpasang.", "Panggung pentas dipoles sampai mengilap."],
     "Hari {hari}: Aula Pertunjukan selesai! Pentas tari pertama di sini membuat penonton dari desa sebelah berdatangan.",
     "Harga jual pasar naik di hari festival; pendatang lebih tertarik.")),
 "pasar_legi": MON("Pasar Mingguan", "Pasar desa yang tumbuh dari kios kayu menjadi pasar batu bata yang ramai setiap hari pasar.",
  TH("Kios Kayu", "Hari {hari}: Kios kayu pertama didirikan di dekat pasar lama.",
     ["Tiang kios berdiri berjajar.", "Atap sirap kios dipasang.", "Meja-meja kayu untuk pedagang disusun."],
     "Hari {hari}: Kios Kayu selesai! Pedagang betah berjualan, dan kuota pasar bertambah.", "Kuota pasar bertambah."),
  TH("Hari Pasar", "Hari {hari}: {nama} menetapkan satu hari tiap minggu sebagai hari pasar desa.",
     ["Halaman pasar diratakan dengan batu.", "Papan nama hari pasar digantung.", "Keju dan madu disiapkan untuk pembukaan."],
     "Hari {hari}: Hari Pasar resmi dimulai! Setiap hari pasar, pedagang pasti datang dan harga lebih bersahabat.",
     "Setiap hari pasar pedagang pasti datang; harga beli lebih murah hari itu."),
  TH("Pasar Batu Bata", "Hari {hari}: Pasar diperkuat dengan dinding batu bata dan lantai batu.",
     ["Dinding batu bata mulai berdiri.", "Lantai batu dipasang rapi.", "Kios kopi dan keju dihias karangan daun."],
     "Hari {hari}: Pasar Batu Bata selesai! Pasar Mingguan kini terkenal sampai ke kota.", "Tambah slot kontrak; kopi dan keju lebih laku.")),
}
def LG(teks=None, pilihan=None, hasil=None):
    o = {}
    if teks: o["teks"] = teks
    if pilihan: o["pilihan"] = {"__byIdx": {str(i): {"teks": t, "teks_hasil": h} for i, (t, h) in enumerate(pilihan)}}
    if hasil: o["hasil"] = hasil
    return o
def CR(judul, ringkasan, selesai, *langkah): return {"judul": judul, "ringkasan": ringkasan, "langkah": {"__byIdx": {str(i): l for i, l in enumerate(langkah)}}, "selesai": selesai}
CERITA = {
 "warok_muda": CR("Penari Muda", "{nama} menemukan topeng penari tua dan ingin menghidupkan tari rakyat di desa.", "{nama} kini penari muda kebanggaan desa.",
  LG("Hari {hari}: Saat membersihkan Gudang, {nama} menemukan topeng kayu dan rompi penari tua yang pitanya lusuh. Matanya langsung berbinar.",
     [("Perbaiki topeng dan rompinya", "{nama} mengamplas topeng dan menjahit rompi dengan telaten. Pita-pita baru dirangkai satu per satu."),
      ("Simpan saja di Gudang", "{nama} menyimpan topeng itu dengan berat hati. \"Mungkin lain kali,\" gumamnya.")]),
  LG("Hari {hari}: Topeng dan rompi sudah pulih. {nama} ingin berlatih menari setiap malam selama tiga malam.",
     [("Dukung latihannya", "Teman-teman ikut menggesek biola dan menabuh tambur. Halaman balai ramai setiap malam."),
      ("Larang dulu, nanti kecapekan", "{nama} menurut dan menggantung topengnya di dinding. Wajahnya murung.")]),
  LG("Hari {hari}: Latihan makin berat. Lompatan dan putaran tari rakyat ternyata melelahkan sekali.",
     hasil={"jatuh": "Hari {hari}: {nama} terpeleset saat berputar! Lututnya lecet, tapi ia bangun lagi sambil tertawa. \"Penari tidak menyerah!\"",
            "lancar": "Hari {hari}: Latihan {nama} lancar. Pita-pitanya berputar indah di bawah cahaya obor."}),
  LG("Hari {hari}: Pentas tari rakyat pertama desa! {nama} menari bertopeng, diiringi biola dan tambur. Penonton bersorak tak henti-henti.",
     hasil={"selesai": "Sejak malam itu, {nama} dikenal sebagai penari muda yang pemberani. Aula Tari Rakyat kini lebih mudah dibangun."})),
 "surat_kota": CR("Surat dari Kota", "Kabar dari kota membuat {nama} harus memilih antara keluarga dan desa.", "Kisah surat dari kota {nama} selesai.",
  LG("Hari {hari}: Pedagang membawa surat untuk {nama}. Ibunya di kota sedang sakit. Tangannya gemetar membaca kabar itu.",
     [("Izinkan pulang 5 hari", "{nama} berangkat dengan bekal dari lumbung. \"Terima kasih, aku akan kembali,\" katanya sambil menyeka mata."),
      ("Minta ditunda dulu", "{nama} mengangguk pelan. Ia tetap bekerja, tapi pikirannya jauh di kota.")]),
  LG("Hari {hari}: {nama} kembali dari kota! Ibunya sudah membaik, dan ia membawa oleh-oleh perkakas dan sekantong biji kopi.",
     hasil={"bawa_adik": "Hari {hari}: Ternyata {nama} juga membawa adiknya yang ingin tinggal di desa. Selamat datang, warga baru!"}),
  LG("Hari {hari}: Para tetua bertanya pada {nama}: akan tetap tinggal di desa atau kembali ke kota?",
     hasil={"betah": "Hari {hari}: \"Di sini sahabat-sahabatku. Di sini rumahku,\" jawab {nama}. Ia kini benar-benar betah.",
            "pamit": "Hari {hari}: {nama} pamit baik-baik untuk kembali ke kota merawat ibunya. Desa melepasnya dengan pelukan dan doa.",
            "tetap": "Hari {hari}: {nama} memilih tetap tinggal untuk sementara. \"Kita lihat nanti,\" katanya sambil tersenyum."})),
 "resep_nenek": CR("Resep Sup Nenek", "{nama} ingin menghidupkan lagi resep sup dan roti neneknya.", "Resep sup nenek {nama} kini milik seluruh desa.",
  LG("Hari {hari}: {nama} teringat sup buatan neneknya: kentang, bawang bombai, daun salam, dan sejumput rempah, dimakan dengan roti hangat.",
     [("Cari bahan-bahannya", "{nama} mengumpulkan kentang, bawang, dan rempah. Dapur mulai harum."),
      ("Lain kali saja", "{nama} menyimpan kenangan resep itu di hatinya untuk lain waktu.")]),
  LG("Hari {hari}: {nama} mulai merebus sup di kuali besi dan menguleni adonan roti.",
     hasil={"sukses": "Hari {hari}: Sup dan roti {nama} jadi! Rasanya persis seperti buatan nenek. Penduduk antre mencicipi.",
            "gagal": "Hari {hari}: Keasinan! Semua yang mencicipi tertawa sambil minum air. {nama} akan mencoba lagi."}),
  LG("Hari {hari}: Sup {nama} jadi pembicaraan desa. Apa yang sebaiknya ia lakukan?",
     [("Buka kios sup di pasar", "Kios kecil {nama} laris manis. Pembeli dari desa sebelah datang khusus untuk supnya."),
      ("Untuk makan bersama desa saja", "Sup {nama} disajikan di setiap makan bersama. Semua orang menunggu-nunggu.")])),
 "penakut_babi": CR("Nyali Lonceng Jaga", "Setelah serangan serigala, {nama} belajar mengatasi rasa takutnya.", "Kisah nyali lonceng jaga {nama} selesai.",
  LG("Hari {hari}: Sejak serangan serigala, {nama} gemetar setiap senja. Ia tidak berani keluar rumah setelah gelap.",
     [("Ajak jaga malam bersama sahabat", "{nama} setuju ikut jaga malam asal ditemani sahabatnya. \"Pelan-pelan saja,\" kata sahabatnya."),
      ("Biarkan istirahat dulu", "{nama} beristirahat di rumah. Hatinya sedikit lebih tenang.")]),
  LG("Hari {hari}: Tiga malam {nama} berjaga bersama {nama2}. Mereka bercerita sambil membunyikan lonceng tanda aman."),
  LG("Hari {hari}: Serigala datang lagi! Semak bergoyang di dekat ladang...",
     hasil={"berani": "Hari {hari}: {nama} membunyikan lonceng duluan dengan keras dan berirama! Serigala lari. Seluruh desa bersorak untuk keberanian {nama}.",
            "lari": "Hari {hari}: {nama} lari ketakutan, tapi {nama2} menolongnya pulang dengan selamat. Ia butuh waktu untuk pulih."})),
 "kucing_belang": CR("Kucing Belang di Lumbung", "Seekor anak kucing tersesat menemukan rumah baru.", "Si Belang dan keluarganya kini penjaga lumbung desa.",
  LG(), LG(), LG()),
 "cinta_segitiga": CR("Cinta Segitiga", "{nama} dan {nama2} sama-sama menaruh hati pada {pasangan}.", "Kisah cinta segitiga selesai.",
  LG("Hari {hari}: Gosip ramai di sumur: {nama} dan {nama2} sama-sama naksir {pasangan}! Semua menunggu kelanjutannya.",
     [("Biarkan berjalan alami", "Kepala desa memilih tidak ikut campur. Biar hati yang menentukan."),
      ("Atur jaga malam {nama} bersama {pasangan}", "Malam ini {nama} dan {pasangan} berjaga berdua. {nama2} cemberut di rumah."),
      ("Atur jaga malam {nama2} bersama {pasangan}", "Malam ini {nama2} dan {pasangan} berjaga berdua. {nama} menghela napas panjang.")])),
 "bidan_desa": CR("Bidan Desa", "{nama} ingin belajar menjadi bidan untuk ibu-ibu di desa.", "{nama} kini bidan kepercayaan desa.",
  LG("Hari {hari}: Kehamilan pertama di desa membuat {nama} berpikir: siapa yang akan membantu persalinan? Ia ingin belajar dari bidan di kota.",
     [("Izinkan belajar 3 hari", "{nama} berangkat membawa bekal dan buku catatan. \"Aku akan belajar sungguh-sungguh.\""),
      ("Tidak sekarang", "{nama} mengangguk. Ia membantu ibu hamil dengan cara yang ia tahu.")]),
  LG(),
  LG("Hari {hari}: {nama} mengusulkan membangun rumah bersalin kecil untuk menimbang bayi dan memeriksa ibu hamil.",
     [("Bangun rumah bersalin", "Rumah bersalin kecil berdiri! Setiap bulan bayi-bayi ditimbang dan para ibu bertukar cerita."),
      ("Cukup di rumah masing-masing", "{nama} tetap berkeliling dari rumah ke rumah dengan tas kecilnya.")])),
 "kopi_pertama": CR("Kopi Pertama", "Sekantong biji kopi mengubah pagi-pagi di desa.", "Kopi desa {nama} kini terkenal.",
  LG("Hari {hari}: Seorang pedagang memberi {nama} sekantong biji kopi mentah dan sebuah alat sangrai. \"Sangrai pelan-pelan,\" pesannya.",
     [("Coba sangrai sendiri", "{nama} menyangrai biji kopi di wajan besi dengan sabar. Aromanya mulai tercium."),
      ("Tukar dengan perkakas", "Biji kopi ditukar dengan perkakas. Lumayan untuk kerja di ladang.")]),
  LG("Hari {hari}: Kopi sangrai pertama jadi! {nama} menggiling dan menyeduhnya sendiri. Aromanya memenuhi desa."),
  LG("Hari {hari}: Kini setiap pagi penduduk minum kopi di beranda sebelum ke ladang. Tradisi baru lahir di desa."),
  LG("Hari {hari}: Pedagang dari kota datang khusus mencari kopi sangrai desa. \"Kopi kalian terkenal sampai ke kota!\"")),
 "rival_sawah": CR("Adu Panen", "{nama} dan {nama2} saling klaim petak ladang terbaik.", "Kisah adu panen selesai.",
  LG("Hari {hari}: {nama} dan {nama2} sama-sama mengaku petak dekat sungai adalah yang terbaik. Suasana memanas.",
     [("Adu panen musim ini", "\"Kita buktikan saja!\" seru keduanya. Penduduk mulai bertaruh siapa yang menang."),
      ("Bagi petak dengan adil", "Petak dibagi dua dengan patok kayu. Keduanya bersalaman, walau masih sedikit kaku.")]),
  LG("Hari {hari}: Musim berakhir. Hasil panen dihitung di depan balai desa..."),
  LG("Hari {hari}: Para tetua prihatin melihat {nama} dan {nama2} terus bersaing.",
     [("Ajak kerja bersama", "Setelah seharian bekerja bersama, keduanya tertawa. \"Ternyata kau tidak seburuk itu.\""),
      ("Biarkan saja", "Persaingan mereka berlanjut, tapi ladang keduanya justru makin subur.")],
     hasil={"duo_tani": "Hari {hari}: {nama} dan {nama2} kini dijuluki Duo Tani. Kalau bekerja bersama, ladang mana pun beres."})),
 "mbah_pendongeng": CR("Nenek Pendongeng", "Sesepuh {nama} mendongeng setiap malam dan menyimpan satu keinginan terakhir.", "Dongeng Nenek {nama} hidup di hati anak-anak desa.",
  LG("Hari {hari}: Setiap malam Nenek {nama} mendongeng tentang rubah cerdik dan beruang pemalas di dekat api unggun. Anak-anak duduk melingkar, tak berkedip."),
  LG("Hari {hari}: \"Nenek ingin nonton tari rakyat sekali lagi,\" kata {nama} pelan suatu malam. Semua orang terdiam."),
  LG("Hari {hari}: Keinginan terakhir Nenek {nama}...",
     hasil={"terpenuhi": "Hari {hari}: Nenek {nama} menonton tari rakyat dengan mata berbinar seperti anak kecil. \"Sekarang Nenek sudah lega,\" katanya.",
            "tidak": "Hari {hari}: Dongeng-dongeng Nenek {nama} akan terus diceritakan, walau keinginan terakhirnya belum sempat terwujud."})),
}
# langkah kosong (LG()) = teks Nusantara sudah netral; hapus supaya __byIdx hanya berisi yang ditimpa
for _c in CERITA.values():
    _c["langkah"]["__byIdx"] = {i: l for i, l in _c["langkah"]["__byIdx"].items() if l}
    if not _c["langkah"]["__byIdx"]: del _c["langkah"]
TELADAN = {
 "gelar": {"rintisan": "Desa Rintisan", "swadaya": "Desa Berdikari", "swakarya": "Desa Berkarya", "swasembada": "Desa Makmur", "teladan": "Desa Teladan Negeri"},
 "deskripsi": {"teladan": "Desa yang menjadi contoh bagi seluruh negeri."},
 "pratinjau_tahun1": ["Hari {hari}: Tuan Pengawas dari kota lewat naik kereta kuda dan berhenti sebentar. \"Desanya asri. Tahun depan saya datang menilai, ya!\""],
 "kedatangan": ["Hari {hari}: Tuan Pengawas datang bersama rombongan untuk Penilaian Desa. Warga berbaris rapi di depan gerbang desa.",
                "Hari {hari}: Tuan Pengawas berkeliling desa, mencatat di bukunya sambil mengangguk-angguk."],
 "naik_gelar": ["Hari {hari}: Selamat! Desa kita kini menyandang gelar {gelar}! Sorak-sorai membahana, dan piagam dipasang di Balai.",
                "Hari {hari}: Tuan Pengawas menyerahkan piagam {gelar}. {nama} menerimanya dengan tangan gemetar bahagia."],
 "tetap": ["Hari {hari}: Tuan Pengawas tersenyum. \"Sudah bagus. Pertahankan, ya.\" Desa tetap menyandang gelarnya."],
 "ditangguhkan": ["Hari {hari}: Tuan Pengawas menepuk bahu kepala desa. \"Tahun ini agak berat, ya. Saya berharap tahun depan lebih baik.\" Bonus gelar ditangguhkan sementara."],
 "ending": ["Hari {hari}: Desa Teladan Negeri! Piala kecil berkilau di Balai. Dari dua orang di tepi hutan, kini berdiri desa yang rukun dan mandiri. Terima kasih sudah membangunnya bersama. Cerita boleh terus berlanjut..."],
}
RENCANA = {
 "pembuka": ["Hari {hari}: Selamat Hari Jadi! Warga berkumpul di balai desa menyusun Rencana Desa Tahun ke-{tahun}.",
             "Hari {hari}: Tahun ke-{tahun} dimulai. Kepala desa membacakan rencana tahun ini di depan warga."],
 "piagam": ["Hari {hari}: Piagam Tahunan diraih! Kerja keras tahun ini dipajang di dinding Balai.",
            "Hari {hari}: Tahun ini berhasil! Piagam Tahunan dibingkai kayu ek dan digantung di balai desa."],
 "nama_target": {"tanpa_jenjang": "Lewati musim dingin tanpa krisis pangan", "lomba_ikut": "Adakan lomba Festival Panen",
                 "keinginan_khusus": "Wujudkan keinginan menabung untuk ziarah jauh", "penilaian_teladan": "Ikut penilaian Desa Teladan Negeri"},
 "ending_mandiri": "Hari {hari}: Desa Mandiri. Delapan tahun berlalu sejak dua orang menyalakan api unggun pertama. Kini desa ini berdiri rukun, mandiri, dan penuh cerita. Terima kasih, Kepala Desa.",
 "pembuka_tahun": {
  "1": "Hari {hari}: Selamat datang di tanah baru! Tahun pertama ini sederhana saja: rumah untuk semua, menjadi dusun, dan bertahan melewati musim dingin pertama bersama.",
  "2": "Hari {hari}: Satu tahun sudah kita lewati. Tahun ini kita membangun kapel kecil dan berharap Tuan Pengawas menyebut kita Desa Berdikari.",
  "3": "Hari {hari}: Tahun ketiga. Desa makin ramai. Mari tumbuh menjadi kota kecil dan meraih gelar Desa Berkarya.",
  "5": "Hari {hari}: Tahun kelima. Aula Tari Rakyat menanti, lumbung harus cukup sampai musim dingin usai. Kita bisa jadi Desa Makmur!",
  "6": "Hari {hari}: Tahun keenam. Desa ini sudah rukun. Mari selesaikan tiga monumen dan menyambut lebih banyak warga.",
  "7": "Hari {hari}: Tahun ketujuh. Tujuh musim dingin hampir terlewati. Bendungan kita sempurnakan dan gelar Teladan mulai kita kejar.",
  "8": "Hari {hari}: Tahun kedelapan. Inilah puncaknya: semua monumen berdiri, tak seorang pun kelaparan, dan Desa Teladan Negeri di depan mata."},
}
# key UI baru v1.7.0 (sedang)
UI_V170 = {
 "event_ui": {"pendatang": {"terima": "Terima", "tolak_halus": "Tolak halus",
   "tolak_halus_hasil": ["Pengembara mengangguk mengerti dan melanjutkan perjalanan. Beberapa warga melambai sedikit sedih.",
                         "Pengembara tersenyum, merapatkan mantelnya, dan berjalan ke desa berikutnya. \"Semoga desa kalian selalu hangat.\""]}},
 "jenjang_kelaparan": {"tingkat": {"bahaya": {"banner_masa_awal": "Stok pangan hanya {jumlah} hari! Segera kumpulkan makanan.",
   "tooltip_masa_awal": "Masa awal: belum ada penalti suasana hati, tapi stok hampir habis. Utamakan makanan: buah beri, ikan, dan kentang liar."}}},
 "cerita_ui": {"label": "Cerita Warga"},
 "agustusan": {"pentas_reog": ["Pentas tari rakyat di aula! Biola dan tambur mengiringi, anak-anak ikut berputar.",
   "Penari bertopi bunga melompat seirama tambur. Warga bertepuk tangan, anak-anak menirukan langkahnya.",
   "Malam ini ada pentas tari rakyat di aula desa. {nama} menonton paling depan dengan mata berbinar."]},
 "dilema_ui": {"orang_orangan_berdiri": ["Orang-orangan bertopi jerami berdiri di tepi ladang gandum, mantelnya berkibar ditiup angin.",
   "{nama} memasang orang-orangan berbaju lusuh di tengah ladang gandum. Burung-burung langsung menjaga jarak."]},
 "log_ancaman": {"diusir_orang_orangan": ["Orang-orangan di ladang gandum bergoyang ditiup angin. Seekor {hewan} ragu dan mundur ke hutan.",
   "Mantel orang-orangan berkibar-kibar. Seekor {hewan} yang mengintip dari semak urung mendekat.",  # v1.7.2: {hewan} = rubah (C.MONKEY.hewan), bukan serigala malam
   "Orang-orangan di tepi ladang membuat {hewan} ragu. Gandum selamat hari ini."]},
}
# key baru v1.7.1 (sedang): Kandang Ayam + telur, nama bangunan lokal P1, ringkasan Hari Jadi (e64bda9)
# bangunan_lokal di overlay -> game.js __localNames aktif: nama orang_orangan & kandang_ayam diambil dari sini (menggantikan TEMA.BUILDING_NAMES 'Orang-orangan Ladang')
UI_V171 = {
 "pangan": {"sumber": {"telur": "Telur"},
  "tugas": {"telur": {"nama": "Mengambil telur", "log": [
   "{nama} mengambil {jumlah} butir telur dari sarang jerami. Induknya berkotek protes.",
   "{nama} merogoh sarang jerami di kandang dan menemukan {jumlah} telur yang masih hangat.",
   "Ayam-ayam berkotek riang. {nama} pulang membawa {jumlah} butir telur untuk gudang desa."]}},
  "kandang": {"siap": "siap diambil", "ayam": "{jumlah} ekor ayam"}},
 "bangunan_lokal": {
  "orang_orangan_sawah": {"nama": "Orang-orangan", "tooltip": "Bertopi jerami dan bermantel lusuh. Mengusir burung dan membuat rubah urung mencuri gandum.",  # v1.7.2: koreksi (serigala tidak terpengaruh)
   "tooltip_ancaman": "Membuat {pencuri} urung mencuri dari ladang. Tidak mempan melawan {hewan}; untuk itu pakai {pagar}."},
  "kandang_ayam": {"nama": "Kandang ayam", "tooltip": "Kandang kayu kecil beratap jerami. Telurnya menambah makanan."}},
 "hari_jadi_ringkasan": {
  "log": ["Desa merayakan Hari Jadi ke-{tahun}! Setahun ini {lahir} bayi lahir, {pendatang} pendatang tiba, {bangunan} bangunan berdiri, dan {tahap} tahap monumen rampung.",
          "Selamat Hari Jadi Desa ke-{tahun}! Setahun penuh cerita: {lahir} bayi lahir, {pendatang} pendatang, {bangunan} bangunan baru, {tahap} tahap monumen."],
  "judul": "Hari Jadi Desa ke-{tahun}", "rentang": "Hari ke-{hari}–{hari2}", "statistik": "Setahun ini",
  "penduduk": "Penduduk", "lahir": "Lahir", "pendatang": "Pendatang", "wafat": "Berpulang", "pergi": "Pergi",
  "bangunan": "Bangunan selesai", "pangan_masuk": "Pangan masuk", "pangan_keluar": "Pangan keluar",
  "keinginan": "Keinginan terwujud", "kejadian": "Kejadian", "target": "Rencana Desa: {jumlah}/{jumlah2} tercapai",
  "piagam": "Piagam Tahunan diraih!", "tanpa_piagam": "Piagam butuh {jumlah} target. Tahun depan kita coba lagi bersama.",
  "gelar": "Gelar desa", "monumen": "Monumen", "tahap_tahun_ini": "Selesai tahun ini", "tutup": "Lanjutkan"},
}
# v1.7.2 (3019d47): teks melayang orang-orangan ({hewan} = rubah, sudah dikapitalkan kode -> hanya di awal)
UI_V172 = {"dilema_ui": {"orang_orangan_teks_melayang": ["{hewan} kabur!", "{hewan} urung mencuri!"]}}

def gabung(dst, src):  # gabung rekursif (dict) tanpa menghapus key lain di overlay (mis. log_ancaman dari buat_overlay_sedang.js)
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict) and "__byIdx" not in v and "__byId" not in v: gabung(dst[k], v)
        else: dst[k] = v
    return dst

def main():
    ov = json.load(open(FILE, encoding="utf-8"))
    ov["dilema"] = {"__byId": DILEMA}
    ov["dilema_ui"] = DILEMA_UI
    ov["momen_kecil"] = MOMEN
    ov["agustusan"] = FESTIVAL
    ov["kerja_bakti"] = KERJA
    ov.setdefault("peringatan_dini", {})["ancaman_monyet"] = RUBAH
    ov["pangan"] = PANGAN
    ov["otomatis"] = OTOMATIS
    for k, v in (("keinginan", KEINGINAN), ("monumen", MONUMEN), ("cerita", CERITA), ("teladan", TELADAN), ("rencana_tahun", RENCANA)): ov[k] = v
    gabung(ov, UI_V170)
    gabung(ov, UI_V171)
    gabung(ov, UI_V172)
    ov["_cerita_sedang"] = {"versi": VERSI, "alat": "tools/buat_tema_sedang_cerita.py",
        "bagian": ["dilema", "dilema_ui", "momen_kecil", "agustusan", "kerja_bakti", "peringatan_dini.ancaman_monyet", "pangan", "otomatis", "keinginan", "monumen", "cerita", "teladan", "rencana_tahun",
                  "event_ui", "jenjang_kelaparan.tingkat.bahaya (masa awal)", "cerita_ui", "agustusan.pentas_reog", "dilema_ui.orang_orangan_berdiri", "log_ancaman.diusir_orang_orangan",
                  "pangan.sumber.telur", "pangan.tugas.telur", "pangan.kandang", "bangunan_lokal (orang_orangan_sawah, kandang_ayam)", "hari_jadi_ringkasan", "dilema_ui.orang_orangan_teks_melayang"],
        "catatan": "Jalankan SETELAH node tools/buat_overlay_sedang.js (alat itu menulis ulang file ini dan menghapus bagian cerita)."}
    c = ov.get("_catatan", "")
    tambah = " Bagian cerita (dilema, momen_kecil, agustusan, kerja_bakti, dilema_ui, ancaman_monyet) serta pangan, otomatis, keinginan, monumen, cerita, teladan, rencana_tahun dari tools/buat_tema_sedang_cerita.py: jalankan sesudahnya."
    for lama in ("dari", "dan pangan dari", "pangan, otomatis dari", "serta pangan dan otomatis dari"):  # catatan versi lama
        c = c.replace(f" Bagian cerita (dilema, momen_kecil, agustusan, kerja_bakti, dilema_ui, ancaman_monyet) {lama} tools/buat_tema_sedang_cerita.py: jalankan sesudahnya.", "")
    if tambah.strip() not in c: c = c + tambah
    ov["_catatan"] = c.strip()
    # _catatan & _cerita_sedang tetap di akhir
    for k in ("_cerita_sedang", "_catatan"): ov[k] = ov.pop(k)
    with open(FILE, "w", encoding="utf-8") as f: json.dump(ov, f, ensure_ascii=False, indent=1); f.write("\n")  # sama dengan buat_overlay_sedang.js (JSON.stringify(o, null, 1) + newline)
    print(f"TEKS-TEMA-sedang.json: dilema {len(DILEMA)}, momen_kecil {len(MOMEN)}, lomba {len(LOMBA)}, + agustusan/kerja_bakti/dilema_ui/ancaman_monyet/pangan/otomatis + keinginan {len(KEINGINAN) - 1}, monumen {len(MONUMEN) - 1}, cerita {len(CERITA)}, teladan, rencana_tahun ({VERSI})")
if __name__ == "__main__": main()
