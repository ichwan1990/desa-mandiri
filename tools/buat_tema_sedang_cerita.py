"""Tambahkan teks CERITA tema sedang (beriklim sedang) ke TEKS-TEMA-sedang.json — idempoten.

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
VERSI = "1.5.1-sedang.2"

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

def main():
    ov = json.load(open(FILE, encoding="utf-8"))
    ov["dilema"] = {"__byId": DILEMA}
    ov["dilema_ui"] = DILEMA_UI
    ov["momen_kecil"] = MOMEN
    ov["agustusan"] = FESTIVAL
    ov["kerja_bakti"] = KERJA
    ov.setdefault("peringatan_dini", {})["ancaman_monyet"] = RUBAH
    ov["_cerita_sedang"] = {"versi": VERSI, "alat": "tools/buat_tema_sedang_cerita.py",
        "bagian": ["dilema", "dilema_ui", "momen_kecil", "agustusan", "kerja_bakti", "peringatan_dini.ancaman_monyet"],
        "catatan": "Jalankan SETELAH node tools/buat_overlay_sedang.js (alat itu menulis ulang file ini dan menghapus bagian cerita)."}
    c = ov.get("_catatan", "")
    tambah = " Bagian cerita (dilema, momen_kecil, agustusan, kerja_bakti, dilema_ui, ancaman_monyet) dari tools/buat_tema_sedang_cerita.py: jalankan sesudahnya."
    if tambah.strip() not in c: ov["_catatan"] = (c + tambah).strip()
    # _catatan & _cerita_sedang tetap di akhir
    for k in ("_cerita_sedang", "_catatan"): ov[k] = ov.pop(k)
    with open(FILE, "w", encoding="utf-8") as f: json.dump(ov, f, ensure_ascii=False, indent=1); f.write("\n")  # sama dengan buat_overlay_sedang.js (JSON.stringify(o, null, 1) + newline)
    print(f"TEKS-TEMA-sedang.json: dilema {len(DILEMA)}, momen_kecil {len(MOMEN)}, lomba {len(LOMBA)}, + agustusan/kerja_bakti/dilema_ui/ancaman_monyet ({VERSI})")
if __name__ == "__main__": main()
