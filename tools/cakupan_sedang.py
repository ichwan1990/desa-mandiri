"""S-03 (v1.8.0): pindai SELURUH teks efektif tema sedang (TEKS-GAME.json digabung TEKS-TEMA-sedang.json).

Semua path teks dianggap aktif di tema sedang, KECUALI daftar NONAKTIF di bawah. Setiap pengecualian punya alasan
dan dibuktikan ulang dari kode (game.js/cerita.js/tujuan.js/tema.js) setiap validator jalan, sehingga bila kode mulai
membaca bagian itu, pengecualian gugur dan validator gagal.
Dipakai oleh tools/validasi_teks.py; bisa dijalankan sendiri: python3 tools/cakupan_sedang.py
"""
import re, os, json, copy

# kata khas Indonesia/Nusantara (gabungan daftar validator lama + temuan QC 2026-10-23 T-02/R-07)
KATA = sorted(set("""
kenduri selamatan ronda peronda agustus agustusan 17-an tirakatan padi gabah sawah tegalan pematang gropyokan reog warok jathil jathilan
gamelan kendang kentongan jamu kunyit temulawak suwuk dukun mbah mantri singkong kerbau tengkulak peci berpeci juragan pecel sambal tumpeng
monyet pisang kelapa oncor pendopo langgar beringin kerupuk pinang jenang perkutut tubruk macapat campursari dolanan genderuwo istisqa kancil
rentenir kemarau mareng labuh caping janur bakiak kelereng gapura camat kecamatan kades kendi gorengan sholat salat subuh lidi bakul nusantara
kampung sarung batik wayang sate rendang weton pasaran syukuran tasyakuran sedekah kabupaten lurah bancakan keong umbi uwi gembili rambutan
mangga tambak perantau layangan jajan klepon cenil bale-bale haji hajjah umrah ibadah adzan azan bedug joglo rumbia kebaya kamboja posyandu
kencur cobek mengulek warung gong santan rempeyek bambu dalang swadaya swakarya swasembada guyub kerasan ijuk sabut nasi momongan masjid
musala mushola surau legi kliwon embung bronjong ilalang terasi tempe lontong ketupat opor angklung wedang lodeh bakwan cendol dawet serabi
getuk lemper mbok mbak pakde bude bulik paklik simbah eyang jati blangkon priyayi kemenyan lebaran pengajian ustadz bismillah alhamdulillah
insyaallah singkong ubi jagung babi mengaji magrib maghrib jumat jumatan beribadah perhutani ulu-ulu hajatan kerokan dikerok pancaroba
bediding jaranan merantau rantau jambu melati gaplek tikar mushola lodeh tahu-tempe kenduren nyadran ruwahan sesajen
""".split()) | {"pos ronda", "tujuh belasan", "merah putih", "gotong royong", "gotong-royong", "bergotong royong", "dadak merak", "macan tutul",
                 "babi hutan", "indonesia raya", "kerja bakti", "di kali", "ke kali", "dari kali", "tepi kali", "batu kali", "soko guru",
                 "pak camat", "halal bihalal", "bujang ganong", "gula aren", "gula jawa", "insya allah", "panjat pinang", "doa bersama", "uang rokok", "bubur merah putih", "ayam kampung"})
# "doa bersama" umum di desa mana pun; hanya ditandai bila bersama kata ibadah lain -> dikeluarkan dari daftar
KATA.remove("doa bersama")
# "dusun": nama era ke-2 di tema sedang sendiri berasal dari kode (balance.js C.ERAS 'Dusun'); teks yang menyebut era harus sama.
RX_KATA = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(KATA, key=len, reverse=True)) + r")(?![\w-])", re.I)
# 'kali' = sungai (Jawa); 'kali' = 'x kali' (berapa kali) tidak ditandai
RX_KALI = re.compile(r"(?<![\w-])(?:(?:pasir|tebing|tepi|batu|ke|di|dari|air) kali|[Kk]ali (?:tetap|yang|jadi|jernih|meluap|keruh|kecil|besar|di))(?![\w-])")
# sapaan Nusantara di depan nama/placeholder (Pak Darto, Bu Minah, Mbok Besar, Koh Aseng ...), juga "Pak/Bu Haji"
RX_SAPA = re.compile(r"(?<![\w-])(Pak|Bu|Mbok|Mbak|Mas|Kang|Koh|Daeng|Uda|Ning|Cak|Bang)(?=\s+(?:[A-Z]|\{))|(?<=, )(Pak|Bu)(?=[.!?,])")

BUKAN_TEKS = {"id", "tipe", "target", "era", "cabang", "id_bangunan", "kategori", "musim", "prasyarat", "event_terkait", "syarat_tambahan",
              "syarat", "tujuan", "hasil", "id_kode", "urutan", "pilihan_index", "rahasia", "status_tech", "status_musim_ancaman",
              "status_jadwal_keluarga", "bahasa", "encoding", "efek", "efek_tertunda", "hadiah", "kunci", "peluang", "hari_tunda", "kelas",
              "mekanik_lain", "usulan_dokumen", "catatan_efek", "jenis_kelamin", "kode", "ikon"}

# (prefix path, alasan, pembuktian) -- pembuktian: fungsi(kode) -> None bila benar, atau pesan kesalahan
def _tidak_dibaca(sec):
    rx = re.compile(r"(TEXT\s*(&&\s*TEXT)?\.%s\b|TX\(\s*['`]%s\.|\bt\.%s\b|\[['\"]%s['\"]\])" % ((re.escape(sec),) * 4))
    return lambda K: (f"{sec} ternyata dibaca kode" if rx.search(K["semua"]) else None)
def _lokal_ev(K):
    if not re.search(r"__lokalEv\s*=\s*!ov\s*\|\|\s*!!ov\.event_lokal", K["game"]): return "game.js tidak lagi menyalakan event_lokal hanya bila overlay punya event_lokal"
    return "overlay sedang memuat event_lokal (event_lokal jadi aktif)" if "event_lokal" in K["ov"] else None
def _lokal_bgn(K):
    bl = K["teks"].get("bangunan_lokal", {})
    keys = {k for k in re.findall(r"bangunan_lokal\.(\w+)", K["game"]) if k in bl} | {k for k in re.findall(r"\bL\.(\w+)", K["game"]) if k in bl}
    keys |= {k for pair in re.findall(r"\['(\w+)', '(\w+)'\]", K["game"]) for k in pair if k in bl}
    lain = keys - BANGUNAN_LOKAL_AKTIF
    return f"game.js membaca bangunan_lokal lain: {sorted(lain)}" if lain else None
BANGUNAN_LOKAL_AKTIF = {"orang_orangan_sawah", "kandang_ayam"}
META_AKTIF = {"bangunan", "skill"}  # fill(): {bangunan} acak & {skill}; tumbuh_kembang/memSkill: skill. peta_sifat_penduduk = key nama, bukan teks
def _meta(K):
    dipakai = set(re.findall(r"\.meta(?:\s*&&\s*TEXT\.meta)?\.(\w+)", K["semua"])) | set(re.findall(r"\bm\.(bangunan|skill|sumber_daya|musim|era|hewan)\b", K["game"]))
    lain = dipakai - META_AKTIF - {"peta_sifat_penduduk", "txt_tema_nusantara", "versi"}
    return f"kode membaca meta lain: {sorted(lain)}" if lain else None

def nonaktif(K):
    """daftar (prefix, alasan, pesan_bukti_gagal|None)"""
    t = K["teks"]; out = []
    out.append(("/event_lokal", "game.js __lokalEv: event_lokal hanya aktif bila overlay memuat event_lokal", _lokal_ev(K)))
    for sec in ("flora", "fauna", "penyakit_musiman"):
        if sec in t: out.append((f"/{sec}", "tidak dibaca kode mana pun", _tidak_dibaca(sec)(K)))
    for k in t.get("bangunan_lokal", {}):
        if k not in BANGUNAN_LOKAL_AKTIF: out.append((f"/bangunan_lokal/{k}", "hanya orang_orangan_sawah & kandang_ayam dibaca (game.js buildTip/applyTheme)", _lokal_bgn(K)))
    for k in t.get("meta", {}):
        if k not in META_AKTIF: out.append((f"/meta/{k}", "meta teknis/Nusantara; kode hanya memakai meta.bangunan, meta.skill (+ key peta_sifat_penduduk)", _meta(K)))
    # musim_pembuka / peringatan_dini / log_ancaman: aktif bila path disebut kode (di luar blok tema indonesia) atau TXT tema sedang
    for sec in ("musim_pembuka", "peringatan_dini", "log_ancaman"):
        for k in t.get(sec, {}):
            if f"{sec}.{k}" not in K["rujukan"]: out.append((f"/{sec}/{k}", f"tidak dirujuk kode/TXT tema sedang (khusus Nusantara)", None))
    _ps = "game.js membaca penduduk[].sifat" if re.search(r"\bpd\.sifat\b|TEXT\.penduduk[^;\n]*\.sifat\b", K["semua"]) else None
    for i, _ in enumerate(t.get("penduduk", [])):  # teks sifat lama; sifat warga dari meta.peta_sifat_penduduk (newcomerTraits)
        out.append((f"/penduduk[{i}]/sifat", "penduduk[].sifat tidak dibaca kode (sifat dari meta.peta_sifat_penduduk)", _ps))
    for p in K.get("tak_dipakai", ()):  # pangan SEDANG_TAK_DIPAKAI (FOOD_SOURCES_PATCH sedang)
        out.append(("/" + p.replace(".", "/"), "pangan khusus Nusantara (FOOD_SOURCES_PATCH sedang = null)", None))
    return out

def baca_kode(root, teks, ov):
    rd = lambda f: open(os.path.join(root, f), encoding="utf-8").read() if os.path.exists(os.path.join(root, f)) else ""
    g, c, tj, tm, tc = rd("game.js"), rd("cerita.js"), rd("tujuan.js"), rd("tema.js"), rd("tech.js")
    # blok tema indonesia di tema.js tidak dihitung (hanya berlaku di tema Nusantara)
    a = tm.find("\n  indonesia: {"); b = tm.find("\n};", a)
    tm_sedang = tm[:a] + tm[b:] if a > 0 and b > a else tm
    semua = "\n".join((g, c, tj, tm_sedang, tc))
    rujukan = set(re.findall(r"\b((?:musim_pembuka|peringatan_dini|log_ancaman)\.\w+)", semua))
    # TT('musim_' + se) / TT('warn_' + ...) -> key TXT; yang dipakai sedang adalah TXT blok sedang (sudah termasuk di atas)
    return {"game": g, "semua": semua, "rujukan": rujukan, "teks": teks, "ov": ov}

def nama_khusus(teks, nama):
    """nama Nusantara yang bukan kata umum (Fajar/Embun/Bintang dipakai juga sebagai kata biasa -> tidak dipindai)"""
    semua = json.dumps(teks, ensure_ascii=False)
    return sorted({n for n in nama if " " not in n and n not in KATA_UMUM and not re.search(r"(?<![\w-])" + re.escape(n.lower()) + r"(?![\w-])", semua)})
# nama Nusantara yang juga kata Indonesia biasa (embun, sari apel, fajar, ...): tidak dipindai sebagai nama
KATA_UMUM = {"Embun", "Sari", "Fajar", "Bintang", "Bunga", "Intan", "Melati", "Mawar", "Senja", "Puspa", "Indah", "Putri", "Citra", "Cahya", "Dara",
             "Ayu", "Lestari", "Rahayu", "Wulan", "Galuh", "Tama", "Elang", "Samudra", "Guntur", "Restu", "Tegar", "Banyu", "Lintang", "Sekar", "Asih",
             "Kemuning", "Utuh", "Rinjani", "Satria", "Panji", "Wira", "Damar"}

def pindai(sd, K, nama_nusantara=()):
    """-> (temuan[(path, kata, teks)], nonaktif[(prefix, alasan)], bukti_gagal[pesan])"""
    na = nonaktif(K); pref = [p for p, _, _ in na]
    rxn = re.compile(r"(?<![\w-])(" + "|".join(re.escape(n) for n in sorted(set(nama_nusantara), key=len, reverse=True)) + r")(?![\w-])") if nama_nusantara else None
    hasil = []
    def jalan(x, p, idk=False):
        if any(p == q or p.startswith(q + "/") or p.startswith(q + "[") for q in pref): return
        if isinstance(x, str) and idk and not re.search(r"\s", x): return  # string id/teknis (tanpa spasi) di bawah key non-teks
        if isinstance(x, str):
            for h in RX_KATA.finditer(x): hasil.append((p, h.group(1), x))
            for h in RX_KALI.finditer(x): hasil.append((p, h.group(0), x))
            for h in RX_SAPA.finditer(x): hasil.append((p, "sapaan " + (h.group(1) or h.group(2)), x))
            if rxn and not p.startswith("/penduduk") and not p.startswith("/kelahiran/nama_bayi"):
                for h in rxn.finditer(x): hasil.append((p, "nama " + h.group(1), x))
        elif isinstance(x, dict):
            for k, v in x.items():
                if k.startswith("_") or p == "/meta/peta_sifat_penduduk": continue
                if k in ("efek", "efek_tertunda", "syarat", "peluang", "hari_tunda", "mekanik_lain", "catatan_efek", "usulan_dokumen"): continue  # data/catatan teknis
                jalan(v, f"{p}/{k}", idk or k in BUKAN_TEKS)  # key id/teknis: hanya kalimat (ada spasi) yang dipindai, mis. hubungan.log.hadiah
        elif isinstance(x, list):
            for i, v in enumerate(x): jalan(v, f"{p}[{i}]", idk)
    jalan(sd, "")
    return hasil, [(p, a) for p, a, _ in na], sorted({e for _, _, e in na if e})

if __name__ == "__main__":
    import sys
    R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src = open(os.path.join(R, "tools/validasi_teks.py"), encoding="utf-8").read(); ns = {}
    exec(src[src.index("def merge(base, o):"):src.index("BUKAN_TEKS =")], ns)
    t = json.load(open(os.path.join(R, "TEKS-GAME.json"), encoding="utf-8")); ov = json.load(open(os.path.join(R, "TEKS-TEMA-sedang.json"), encoding="utf-8"))
    sd = ns["merge"](copy.deepcopy(t), copy.deepcopy(ov)); K = baca_kode(R, t, ov)
    nn = [p["nama"] for p in t["penduduk"]] + t["kelahiran"]["nama_bayi"]["laki_laki"] + t["kelahiran"]["nama_bayi"]["perempuan"]
    nn += [re.sub(r"^\w+ ", "", n) for n in t["dialog_pedagang"]["nama_pedagang"]]
    nn = nama_khusus(t, nn)
    h, na, bg = pindai(sd, K, nn)
    json.dump(h, open("/tmp/v180/worklist.json", "w"), ensure_ascii=False, indent=0)
    import collections
    print(len(h), "temuan;", len(na), "nonaktif; bukti gagal:", bg)
    c = collections.Counter(re.split(r"[/\[]", p)[1] for p, _, _ in h); print(c.most_common())
    print(collections.Counter(w.lower() for _, w, _ in h).most_common(60))
