"""v1.8.0 (QC 2026-10-23 R-05): aturan kapitalisasi/ejaan bersama untuk buat_teks.py, buat_tema_sedang_cerita.py dan validasi_teks.py.

Nama bangunan ditulis Title Case seperti C.BUILDINGS[].nama di UI ('Pos Ronda', 'Balai Desa', 'Lumbung Padi', 'Gubuk Bambu',
'Bengkel Alat', 'Menara Jaga'), di posisi mana pun dalam kalimat. 'Api unggun', 'Kandang ayam', 'Orang-orangan sawah', 'Rumah kayu'
juga kata benda umum: hanya bentuk berhuruf awal kapital (label / awal kalimat = nama bangunan) yang diseragamkan; bentuk kecil
di tengah kalimat ("duduk di dekat api unggun") tetap. Ejaan baku: 'Sholat' -> 'Salat', 'Ramah Tamah' -> 'Ramah-tamah'.
Teks yang berubah sekaligus kehilangan awalan lama 'Hari {hari}: ' (aturan v1.7.2: teks terkoreksi tidak diawali 'Hari ';
fill() memang sudah membuangnya, jadi tampilan sama).
Koreksi di luar aturan otomatis ini didaftar satu per satu di KOREKSI_V180 (path validator -> (lama, baru)).
"""
import re

ATURAN_R05 = [
    (r"(?<![\w-])[Pp]os [Rr]onda(?![\w-])", "Pos Ronda"),
    (r"(?<![\w-])[Bb]alai [Dd]esa(?![\w-])", "Balai Desa"),
    (r"(?<![\w-])[Ll]umbung [Pp]adi(?![\w-])", "Lumbung Padi"),
    (r"(?<![\w-])[Gg]ubuk [Bb]ambu(?![\w-])", "Gubuk Bambu"),
    (r"(?<![\w-])[Bb]engkel [Aa]lat(?![\w-])", "Bengkel Alat"),
    (r"(?<![\w-])[Mm]enara [Jj]aga(?![\w-])", "Menara Jaga"),
    (r"(?<![\w-])Api unggun(?![\w-])", "Api Unggun"),
    (r"(?<![\w-])Kandang ayam(?![\w-])", "Kandang Ayam"),
    (r"(?<![\w-])Orang-orangan sawah(?![\w-])", "Orang-orangan Sawah"),
    (r"(?<![\w-])Rumah kayu(?![\w-])", "Rumah Kayu"),
    (r"(?<![\w-])Sholat(?![\w-])", "Salat"),
    (r"(?<![\w-])sholat(?![\w-])", "salat"),
    (r"(?<![\w-])Ramah Tamah(?![\w-])", "Ramah-tamah"),
]
_RX = [(re.compile(a), b) for a, b in ATURAN_R05]
HARI_LAMA = re.compile(r"^Hari \{hari\}:\s*")

def r05(s):
    t = s
    for rx, b in _RX: t = rx.sub(b, t)
    if t != s: t = HARI_LAMA.sub("", t)
    return t

# path dokumentasi/teknis yang tidak diseragamkan (kutipan nama lama, catatan untuk Koding)
LEWATI = re.compile(r"^/meta/(perlu_diubah_di_kode|catatan_|placeholder|peta_sifat_penduduk|kata_terlarang|txt_tema_nusantara)|/_")

# koreksi di luar aturan otomatis (Nusantara): meta.bangunan = {bangunan} acak fill() -> sama dengan BUILDING_NAMES tema indonesia
KOREKSI_V180 = {
    "/meta/bangunan/ladang": ("Ladang (tegalan)", "Ladang (Tegalan)"),
    "/meta/bangunan/tempat_penebangan": ("Tempat penebangan", "Tempat Penebangan"),
    "/meta/bangunan/rumah_kayu": ("Rumah kayu", "Rumah Panggung"),
    "/meta/bangunan/balai_desa": ("Balai desa (pendopo)", "Balai Desa"),
    "/quest_awal[9]/deskripsi": ("Bangun Rumah kayu dan Dapur, lalu capai 8 penduduk untuk naik ke era Dusun.",
                                 "Bangun Rumah Panggung dan Dapur, lalu capai 8 penduduk untuk naik ke era Dusun."),
}

def jalan_teks(x, p="", id_keys=frozenset()):
    """(path validator, string) untuk semua string tampilan (tanpa key id/teknis)"""
    if isinstance(x, str): yield p, x
    elif isinstance(x, dict):
        for k, v in x.items():
            if k in id_keys and not (isinstance(v, list) and v and isinstance(v[0], dict)): continue
            yield from jalan_teks(v, f"{p}/{k}", id_keys)
    elif isinstance(x, list):
        for i, v in enumerate(x): yield from jalan_teks(v, f"{p}[{i}]", id_keys)

def ubah_r05(data, id_keys):
    """-> {path validator: (lama, baru)} untuk seluruh koreksi R-05 (otomatis + KOREKSI_V180)"""
    out = {}
    for p, s in jalan_teks(data, "", id_keys):
        if LEWATI.search(p): continue
        if p in KOREKSI_V180:
            lama, baru = KOREKSI_V180[p]
            if s == lama: out[p] = (lama, baru)
            continue
        b = r05(s)
        if b != s: out[p] = (s, b)
    return out

def ke_path_ubah(p):
    """'/a/b[3]/c' (validator) -> 'a/b/3/c' (terapkan_ubah buat_teks.py)"""
    return "/".join(re.findall(r"[^/\[\]]+", p))

# ---------- R-07: daftar nama tema sedang (desa Eropa beriklim sedang) ----------
# Urutan & jenis kelamin sama dengan TEKS penduduk[] (overlay __byIdx hanya menimpa nama); tidak ada yang sama dengan nama Nusantara.
NAMA_SEDANG = ["Anna", "Hans", "Greta", "Jakob", "Elise", "Lukas", "Marta", "Matthias", "Klara", "Pieter", "Ingrid", "Emil", "Anton", "Rosa",
    "Karl", "Helena", "Felix", "Lotte", "Oskar", "Agnes", "Henrik", "Mathilde", "Tobias", "Frida", "Konrad", "Ida", "Bruno", "Sofie", "Johanna",
    "Leon", "Liesel", "Albert", "Margit", "Frans", "Brigitte", "Gustav", "Johan", "Hanne", "Willem", "Elin", "Ernst", "Astrid", "Otto", "Maren",
    "Rudolf", "Isolde", "Stefan", "Wilma", "Theresa", "Viktor", "Arne", "Paulina", "Amalie", "Bastian", "Dirk", "Cecilia", "Erik", "Dora",
    "Florian", "Edith", "Georg", "Lena", "Jonas", "Nora", "Kasper", "Olga", "Lars", "Vera"]
NAMA_BAYI_SEDANG = {
    "laki_laki": ["Ben", "Finn", "Theo", "Max", "Paul", "Noah", "Elias", "Jan", "Till", "Ole", "Mats", "Simon", "Timo", "Hugo", "Leo", "Milo",
                  "Anders", "Benno", "Carl", "Linus", "Fritz", "Kai", "Nils", "Sven", "Valentin", "Wim", "Hannes", "Jasper", "Lennart", "Mattis"],
    "perempuan": ["Mia", "Ella", "Lina", "Emma", "Lea", "Hanna", "Pia", "Maja", "Lotta", "Ronja", "Thea", "Nele", "Alma", "Frieda", "Ilse",
                  "Jule", "Karla", "Linnea", "Merle", "Romy", "Selma", "Tilda", "Wiebke", "Ylva", "Zoe", "Marlene", "Annika", "Britta", "Elsa", "Fenja"]}
PEDAGANG_SEDANG = ["Tuan Albrecht", "Nyonya Hedwig", "Paman Ruben", "Bibi Marthe", "Tuan Lorenz", "Nyonya Beatrix", "Kakek Wendel", "Nona Clara"]
