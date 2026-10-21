"""Validasi TEKS-GAME.json v1.7.5 terhadap backup v1.0.0 (+allowlist tuning), v1.1.0, v1.2.0, v1.3.0, v1.4.0, v1.5.0, v1.5.1, v1.6.0, v1.6.1, v1.7.0, v1.7.1, v1.7.2, v1.7.3, v1.7.4.
Sejak v1.4.0 (lokalisasi Indonesia) teks tampilan boleh berubah, tetapi semua key/struktur, semua angka/boolean, dan semua
string berjenis id (id, tipe, target, era, musim, prasyarat, event_terkait, ...) harus tetap sama; placeholder teks yang berubah
tidak boleh bertambah. Ditambah: cek kata terlarang (salju, serigala, harimau, ...) di semua teks tampilan, dan bagian baru v1.4/v1.5.
v1.5.0 (tokoh, cerita, tujuan) hanya menambah: bagian baru, entri meta, dan pencapaian A25-A32 (satu-satunya list lama yang boleh bertambah).
v1.5.1 hanya menambah sub-key yang di kode masih memakai fallback (kerja_bakti.kenduri/log_mulai, dilema_ui.syukuran_panen/utang_*, ...).
Ditambah cek overlay tema sedang TEKS-TEMA-sedang.json (path ada di TEKS, hanya teks, placeholder terdaftar, kata khas Indonesia
tidak muncul di teks cerita yang aktif di tema sedang).
v1.6.0 hanya menambah key top-level pangan (pangan v9 game.js) + placeholder {buah}: semua key wajib ada di kedua tema (TEKS dan hasil
gabungan sedang), placeholder sesuai yang diisi kode, tanpa kata khas Indonesia di pangan tema sedang (kecuali yang tidak dipakai tema itu).
v1.6.1 (v9c) hanya menambah: otomatis.api_unggun/gubuk (array 2-4, {nama}/{nama2}), 10 pangan.keluar baru, daya_tarik.bahagia_syarat/murung.
v1.7.5 hanya menambah angin.kencang_rusak ({bangunan} {jumlah}) & angin.atap_bertahan (array variasi log).
v1.7.4 hanya menambah bangun_kategori (C.BUILD_CATS + terkunci_era {era} / terkunci_riset {riset} / monumen_tujuan) & peta_kejadian (string).
v1.7.3 hanya menambah petunjuk.butuh_gubuk (string) & otomatis.gubuk_tambahan (array) dengan {gubuk} (+ meta.placeholder).
v1.7.2 menambah tooltip_ancaman & orang_orangan_teks_melayang, mengoreksi 4 path terdaftar (KOREKSI_V172), dan melarang awalan 'Hari ' di teks log baru.
v1.7.1 (P1b) hanya menambah pangan.sumber/tugas.telur, pangan.kandang, hari_jadi_ringkasan (+{lahir} {pendatang} {hari2}); sedang menulis bangunan_lokal.
v1.7.0 (P1) hanya menambah key UI (event_ui, cerita_ui, banner/tooltip masa awal, pentas_reog, orang_orangan_berdiri, diusir_orang_orangan,
keinginan._ui.otomatis) di kedua tema; overlay sedang mendapat keinginan/monumen/cerita/teladan/rencana_tahun (placeholder <= teks Nusantara path
yang sama, tanpa kata khas Indonesia; cerita.<id>.langkah[i].hasil boleh ditimpa karena berisi teks). Path lain bisa diberikan lewat env TEKS_FILE / TEKS_SEDANG (untuk uji negatif)."""
import json, re, sys, os, copy, subprocess
ROOT = "/workspace/village-game/"
new = json.load(open(os.environ.get("TEKS_FILE", ROOT + "TEKS-GAME.json"), encoding="utf-8"))
old = json.load(open(ROOT + "tools/TEKS-GAME.v1.0.0.json", encoding="utf-8"))
err = []
# Tuning pangan yang disetujui tim riset (Okt 2026): hanya nilai hadiah ini yang boleh beda dari v1.0.0.
TUNING_V10 = {("quest_awal", "q02_kayu_bakar", "hadiah", None, "makanan"): 6, ("quest_awal", "q07_ladang_pertama", "hadiah", None, "makanan"): 10,
  ("event_acak", "pedagang_keliling", "pilihan", 0, "makanan"): 6, ("event_acak", "panen_raya", "pilihan", 0, "gandum"): 8,
  ("event_acak", "panen_raya", "pilihan", 0, "makanan"): 5, ("event_acak", "panen_raya", "pilihan", 1, "makanan"): 5,
  ("event_acak", "panen_raya", "pilihan", 2, "gandum"): 4, ("event_acak", "hewan_buas", "pilihan", 0, "daging"): 8}
for (sec, id_, fld, i, key), val in TUNING_V10.items():
    e = next(x for x in old[sec] if x["id"] == id_); (e[fld] if i is None else e[fld][i]["efek"])[key] = val
# 1. struktur lama utuh (v1.4: teks tampilan boleh berubah; key, angka, boolean, dan string id tidak)
ID_KEYS = {"id", "tipe", "target", "era", "cabang", "id_bangunan", "kategori", "musim", "prasyarat", "event_terkait", "syarat_tambahan",
           "syarat", "tujuan", "hasil", "id_kode", "urutan", "pilihan_index", "rahasia", "status_tech", "status_musim_ancaman",
           "status_jadwal_keluarga", "bahasa", "encoding"}
LIST_BOLEH_TAMBAH = {"/pencapaian"}  # v1.5: A25-A32 ditambahkan di akhir (item lama tetap dibandingkan)
PH = lambda t: set(re.findall(r"\{(\w+)\}", t))
teks_diubah = []
def sub(a, b, p, idk=False):
    if isinstance(a, dict):
        if not isinstance(b, dict): err.append(f"tipe berubah: {p}"); return
        if p.rsplit("/", 1)[-1] in ("efek", "hadiah") and set(a) != set(b): err.append(f"key efek/hadiah lama berubah: {p}")
        for k in a:
            if k not in b: err.append(f"key hilang: {p}/{k}")
            elif p + "/" + k != "/meta/versi": sub(a[k], b[k], p + "/" + k, idk or (k in ID_KEYS and not (isinstance(a[k], list) and a[k] and isinstance(a[k][0], dict))))
    elif isinstance(a, list):
        if not isinstance(b, list) or len(b) < len(a): err.append(f"list dipendekkan/berubah tipe: {p}"); return
        if len(b) > len(a) and not p.startswith("/meta/") and p not in LIST_BOLEH_TAMBAH: err.append(f"list lama bertambah di luar meta: {p}")
        for i, x in enumerate(a): sub(x, b[i], f"{p}[{i}]", idk)
    elif isinstance(a, str) and isinstance(b, str) and not idk:
        if a != b:
            if not PH(b) <= PH(a): err.append(f"placeholder baru di teks yang diubah {PH(b) - PH(a)}: {p}")
            teks_diubah.append(p)
    elif type(a) != type(b) or a != b: err.append(f"nilai/id berubah: {p} ({a!r} -> {b!r})")
sub(old, new, "")
if new["meta"]["versi"] != "1.7.5": err.append("meta.versi bukan 1.7.5")
for k in old:
    if list(new).index(k) != list(old).index(k): err.append(f"urutan key top-level berubah: {k}")
m = new["meta"]
efek_ok = set(m["sumber_daya"]) | {k for k in m["kunci_efek"] if not k.startswith("_")}
tipe_ok = set(m["tipe_tujuan_quest"])
tech_ids = [t["id"] for t in new["teknologi"]]
SEMUA_EV = new["event_acak"] + new["event_era_lanjut"] + new.get("event_musiman", []) + new.get("event_lokal", [])
ev_ids = {e["id"] for e in SEMUA_EV}
BID = {"api_unggun","gubuk","gudang","ladang","sumur","dapur","bengkel_alat","lumbung","pasar","balai_desa"}  # dipetakan game.js
musim = {x["id"] for x in m["musim"]}
khusus = {k for k in m["target_khusus"] if not k.startswith("_")}
def cek_efek(ef, src):
    for k, v in (ef or {}).items():
        if k not in efek_ok: err.append(f"key efek tak terdaftar {k} @ {src}")
        if not isinstance(v, (int, float)): err.append(f"nilai efek bukan angka {k} @ {src}")
def cek_tujuan(g, src):
    t, tg = g.get("tipe"), g.get("target")
    if t not in tipe_ok: err.append(f"tipe tujuan tak terdaftar {t} @ {src}"); return
    if t == "gabungan":
        for i, s in enumerate(g.get("semua", [])): cek_tujuan(s, f"{src}.semua[{i}]")
        return
    ok = {"bangun": tg in BID and tg in m["bangunan"], "kumpulkan": tg in m["sumber_daya"], "simpan": tg in m["sumber_daya"],
          "capai_era": tg in m["era"], "panen": tg in m["bangunan"], "riset": tg == "semua" or tg in tech_ids, "lewati_musim": tg in musim,
          "pilih_event": tg in ev_ids, "alami_event": tg in ev_ids,
          "cerita_selesai": tg in new.get("cerita", {}), "lomba_menang": tg in new.get("agustusan", {}).get("lomba", {}),
          "keinginan_khusus": tg in new.get("keinginan", {}), "gelar_teladan": tg in new.get("teladan", {}).get("gelar", {}),
          "monumen_selesai": tg == "semua" or tg in new.get("monumen", {})}.get(t, tg in khusus)
    if not ok: err.append(f"target {tg} tidak valid untuk {t} @ {src}")
    if not isinstance(g.get("jumlah"), int) or g["jumlah"] < 1: err.append(f"jumlah tidak valid @ {src}")
    if t == "pilih_event":
        e = next(e for e in SEMUA_EV if e["id"] == tg)
        if not 0 <= g.get("pilihan", -1) < len(e["pilihan"]): err.append(f"indeks pilihan salah @ {src}")
    if t == "beruntun_hari_pangan" and "ambang" not in g: err.append(f"ambang hilang @ {src}")
for i, e in enumerate(new["event_era_lanjut"]):
    if set(e) != {"id","judul","kategori","deskripsi","pilihan","era"}: err.append(f"struktur event {e['id']}")
    if e["era"] not in ("desa_pertanian","kota_kecil"): err.append(f"era event bukan 3-4: {e['id']}")
    for j, p in enumerate(e["pilihan"]):
        if set(p) != {"teks","efek","teks_hasil"}: err.append(f"struktur pilihan {e['id']}[{j}]")
        cek_efek(p["efek"], f"{e['id']}[{j}]")
    if any(v < 0 and k in m["sumber_daya"] for k, v in e["pilihan"][-1]["efek"].items()): err.append(f"pilihan terakhir berbiaya {e['id']}")
if len(ev_ids) != len(SEMUA_EV): err.append("id event duplikat")
qids = [q["id"] for q in new["quest_awal"] + new["quest_lanjutan"]]
if len(set(qids)) != len(qids): err.append("id quest duplikat")
for q in new["quest_lanjutan"]:
    if set(q) != set(new["quest_awal"][0]): err.append(f"struktur quest {q['id']}")
    cek_tujuan(q["tujuan"], q["id"]); cek_efek(q["hadiah"], q["id"])
if [q["urutan"] for q in new["quest_lanjutan"]] != list(range(11, 21)): err.append("urutan quest_lanjutan bukan 11-20")
spec_tech = ["T%02d" % i for i in range(1, 21)]
if tech_ids != spec_tech: err.append("id teknologi tidak sama dengan spec T01-T20")
for t in new["teknologi"]:
    if t["era"] not in m["era"]: err.append(f"era tech {t['id']}")
    if t["cabang"] not in m["cabang_teknologi"]: err.append(f"cabang tech {t['id']}")
    for p in t["prasyarat"]:
        if p not in tech_ids or tech_ids.index(p) >= tech_ids.index(t["id"]): err.append(f"prasyarat {p} @ {t['id']}")
    for s in t["syarat_tambahan"]: cek_tujuan(s, t["id"])
aids = [a["id"] for a in new["pencapaian"]]
if aids[:18] != ["A%02d" % i for i in range(1, 19)] or len(set(aids)) != len(aids): err.append("id pencapaian tidak sesuai spec")
for a in new["pencapaian"]:
    cek_tujuan(a["syarat"], a["id"]); cek_efek(a["hadiah"], a["id"])
    hk = a.get("hadiah_khusus")
    if hk and hk["tipe"] not in m["tipe_hadiah_khusus"]: err.append(f"tipe hadiah_khusus {a['id']}")
    if hk and hk["tipe"] == "diskon_teknologi" and hk["target"] not in tech_ids: err.append(f"target diskon {a['id']}")
# ---------- struktur & angka v1.1.0 utuh (mengunci 14 angka retuning 88f8d97) ----------
old11 = json.load(open(ROOT + "tools/TEKS-GAME.v1.1.0.json", encoding="utf-8"))
_n = len(err); sub(old11, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan terhadap v1.1.0:")
for k in old11:
    if list(new).index(k) != list(old11).index(k): err.append(f"urutan key top-level v1.1 berubah: {k}")
for sec in old11["meta"]:
    if isinstance(old11["meta"][sec], dict) and list(new["meta"][sec])[:len(old11["meta"][sec])] != list(old11["meta"][sec]): err.append(f"urutan meta.{sec} berubah")
RETUNING_88F8D97 = [("quest_awal","q02_kayu_bakar",None,"makanan",6), ("quest_awal","q07_ladang_pertama",None,"makanan",10),
  ("event_acak","pedagang_keliling",0,"makanan",6), ("event_acak","panen_raya",0,"gandum",8), ("event_acak","panen_raya",0,"makanan",5),
  ("event_acak","panen_raya",1,"makanan",5), ("event_acak","panen_raya",2,"gandum",4), ("event_acak","hewan_buas",0,"daging",8),
  ("event_era_lanjut","embun_beku",0,"gandum",6), ("quest_lanjutan","q11_dapur_mengepul",None,"makanan",5),
  ("quest_lanjutan","q12_hamparan_ladang",None,"gandum",3), ("quest_lanjutan","q15_ilmu_pertama",None,"makanan",8),
  ("pencapaian","A06",None,"gandum",3), ("pencapaian","A14",None,"makanan",10)]
for sec, id_, i, key, val in RETUNING_88F8D97:
    e = next(x for x in new[sec] if x["id"] == id_); got = (e["hadiah"] if i is None else e["pilihan"][i]["efek"]).get(key)
    if got != val: err.append(f"angka retuning berubah: {sec}/{id_}/{key} = {got}, harus {val}")
# ---------- v1.2.0: bagian musim & ancaman ----------
V12 = ["musim_pembuka","peringatan_dini","jenjang_kelaparan","event_musiman","log_ancaman","penduduk_sakit",
       "penduduk_meninggal","pemakaman","duka","penduduk_pergi","bangunan_ancaman","prioritas_darurat"]
for k in V12:
    if k not in new: err.append(f"bagian v1.2 hilang: {k}")
for k in ("status_musim_ancaman","tingkat_peringatan","tingkat_kelaparan","penyebab_kondisi","hewan","bangunan_pertahanan"):
    if k not in m: err.append(f"meta.{k} hilang")
if all(k in new for k in V12):
    for k, v in new["musim_pembuka"].items():
        if not k.startswith("musim_") or (v["musim"] not in musim and k != "musim_umum") or len(v["variasi"]) < 2: err.append(f"musim_pembuka {k}")
    for need in ["musim_" + x for x in musim] + ["musim_gugur_menuju_dingin"]:
        if need not in new["musim_pembuka"]: err.append(f"musim_pembuka kurang {need}")
    tp = set(m["tingkat_peringatan"])
    for need in ("banjir","kekeringan","kebakaran","serigala","dingin_ekstrem","badai","kelaparan"):
        if "ancaman_" + need not in new["peringatan_dini"]: err.append(f"peringatan_dini kurang ancaman_{need}")
    for k, v in new["peringatan_dini"].items():
        if not k.startswith("ancaman_") or not set(v["tingkat"]) <= tp or not {"waspada","bahaya"} <= set(v["tingkat"]): err.append(f"peringatan_dini {k}")
        if not set(v["musim"]) <= musim: err.append(f"musim peringatan {k}")
        for t in v["tingkat"].values():
            if not t["teks"]: err.append(f"teks peringatan kosong {k}")
        for ev in v["event_terkait"]:
            if ev not in ev_ids: err.append(f"event_terkait {ev} @ {k}")
    if set(new["jenjang_kelaparan"]["tingkat"]) != set(m["tingkat_kelaparan"]): err.append("jenjang_kelaparan != meta.tingkat_kelaparan")
    per_musim = {x: 0 for x in musim & {"semi", "panas", "gugur", "dingin"}}  # event_musiman memakai id musim lama
    for e in new["event_musiman"]:
        if set(e) != {"id","judul","kategori","deskripsi","pilihan","musim"}: err.append(f"struktur event_musiman {e['id']}")
        if e["musim"] not in musim: err.append(f"musim event {e['id']}")
        else: per_musim[e["musim"]] += 1
        for j, p in enumerate(e["pilihan"]):
            if set(p) != {"teks","efek","teks_hasil"}: err.append(f"struktur pilihan {e['id']}[{j}]")
            cek_efek(p["efek"], f"{e['id']}[{j}]")
            for f in ("makanan","gandum","buah","ikan","daging"):
                if p["efek"].get(f, 0) > 5: err.append(f"hadiah pangan > 5 (nerf §7) {e['id']}[{j}].{f}")
        if any(v < 0 and k in m["sumber_daya"] for k, v in e["pilihan"][-1]["efek"].items()): err.append(f"pilihan terakhir berbiaya {e['id']}")
    for x, n in per_musim.items():
        if n < 2: err.append(f"event_musiman musim {x} hanya {n}")
    for need in ("banjir_kecil", "dingin_ekstrem"):
        if need not in {e["id"] for e in new["event_musiman"]}: err.append(f"event_musiman kurang {need}")
    pk = set(m["penyebab_kondisi"]); lima = {"sakit","tua","kelaparan","dingin","serangan"}
    if set(new["penduduk_meninggal"]["per_penyebab"]) != lima: err.append("penduduk_meninggal.per_penyebab harus 5 penyebab")
    if not set(new["pemakaman"]["per_penyebab"]) <= pk or not set(new["penduduk_sakit"]["per_penyebab"]) <= pk: err.append("penyebab tak terdaftar")
    if not all(k.startswith("duka_") for k in new["duka"] if k != "tooltip") or len(new["duka"]["duka_harian"]) != 5: err.append("struktur duka")
    for k, v in new["bangunan_ancaman"].items():
        if not k.startswith("bangunan_") or k != "bangunan_" + v["id_bangunan"] or v["id_bangunan"] not in m["bangunan_pertahanan"]: err.append(f"bangunan_ancaman {k}")
    if set(new["prioritas_darurat"]) != {"jaga","padam","rawat","makam"}: err.append("prioritas_darurat")
    if not {"waspada","bahaya"} <= set(new["penduduk_pergi"]["peringatan"]) or not new["penduduk_pergi"]["surat_perpisahan"]: err.append("penduduk_pergi")
# ---------- struktur & angka v1.2.0 utuh ----------
old12 = json.load(open(ROOT + "tools/TEKS-GAME.v1.2.0.json", encoding="utf-8"))
_n = len(err); sub(old12, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan terhadap v1.2.0:")
for k in old12:
    if list(new).index(k) != list(old12).index(k): err.append(f"urutan key top-level v1.2 berubah: {k}")
for sec in old12["meta"]:
    if isinstance(old12["meta"][sec], dict) and list(new["meta"][sec])[:len(old12["meta"][sec])] != list(old12["meta"][sec]): err.append(f"urutan meta.{sec} berubah (v1.2)")
# ---------- v1.3.0: jadwal harian & reproduksi ----------
V13 = ["log_jadwal","log_hubungan","kehamilan","kelahiran","tumbuh_kembang","lansia_berpulang","panel_keluarga"]
for k in V13:
    if k not in new: err.append(f"bagian v1.3 hilang: {k}")
for k in ("{nama}","{pasangan}","{bayi}","{ayah}","{ibu}","{umur}"):
    if k not in m["placeholder"]: err.append(f"placeholder wajib v1.3 tidak terdaftar: {k}")
for k in ("status_jadwal_keluarga","catatan_placeholder_keluarga","tahap_usia","status_hubungan","milestone_anak"):
    if k not in m: err.append(f"meta.{k} hilang")
def daftar(x):  # semua string di dalam x
    if isinstance(x, str): yield x
    elif isinstance(x, dict):
        for k, v in x.items():
            if not k.startswith("_"): yield from daftar(v)
    elif isinstance(x, list):
        for v in x: yield from daftar(v)
if all(k in new for k in V13):
    J = new["log_jadwal"]
    for need in ("pulang","tidur","bangun_pagi","tidur_di_luar","tidur_di_luar_dingin"):
        if len(J.get(need, [])) < 3: err.append(f"log_jadwal.{need} kurang dari 3 variasi")
    for k, v in J.items():  # varian umum tidak boleh butuh {pasangan}
        if k != "berpasangan" and any("{pasangan}" in t for t in daftar(v)): err.append(f"log_jadwal.{k} memakai {{pasangan}}; pindahkan ke berpasangan")
    for k, v in J["berpasangan"].items():
        if not k.startswith("_") and not all("{pasangan}" in t for t in v): err.append(f"log_jadwal.berpasangan.{k} tanpa {{pasangan}}")
    H = new["log_hubungan"]
    for need in ("menjadi_dekat","menjadi_pasangan","menikah"):
        if len(H.get(need, [])) < 2 or not all("{pasangan}" in t for t in H[need]): err.append(f"log_hubungan.{need}")
    K = new["kehamilan"]
    if len(K["kabar"]) < 2 or len(K["masa_kehamilan"]) < 3: err.append("kehamilan kurang variasi")
    L = new["kelahiran"]
    if len(L["log"]) < 3 or not all("{bayi}" in t for t in L["log"]): err.append("kelahiran.log harus >= 3 dan memakai {bayi}")
    nb = L["nama_bayi"]; semua_nb = nb["laki_laki"] + nb["perempuan"]
    if len(nb["laki_laki"]) < 30 or len(nb["perempuan"]) < 30: err.append("nama_bayi < 30 per jenis kelamin")
    if len({x.lower() for x in semua_nb}) != len(semua_nb): err.append("nama_bayi duplikat")
    cfg = re.search(r"NAMES:\s*\[([^\]]*)\]", open(ROOT + "balance.js", encoding="utf-8").read())
    lama = [p["nama"] for p in new["penduduk"]] + new["dialog_pedagang"]["nama_pedagang"] + (re.findall(r"'([^']+)'", cfg.group(1)) if cfg else [])
    token = {t.lower() for n in lama for t in n.split()}
    for x in semua_nb:
        if x.lower() in token: err.append(f"nama_bayi bentrok dengan nama yang sudah ada: {x}")
    T = new["tumbuh_kembang"]
    if set(T["milestone"]) != set(m["milestone_anak"]): err.append("tumbuh_kembang.milestone != meta.milestone_anak")
    for need in ("menjadi_dewasa","menjadi_lansia"):
        if not T.get(need): err.append(f"tumbuh_kembang.{need} kosong")
    B = new["lansia_berpulang"]
    if len(B["meninggal"]) < 3 or len(B["duka"]["duka_harian"]) != 5 or not B["pemakaman"]["upacara"]: err.append("lansia_berpulang struktur")
    if not all(k.startswith("duka_") for k in B["duka"] if k != "tooltip"): err.append("lansia_berpulang.duka key harus duka_*")
    Pk = new["panel_keluarga"]
    for need in ("pasangan","orang_tua","ayah","ibu","anak","umur","tahap_usia","status_hubungan"):
        if need not in Pk["label"]: err.append(f"panel_keluarga.label.{need} hilang")
    for need in ("pasangan","orang_tua","anak"):
        if Pk["kosong"].get(need, "").lower() != "belum ada": err.append(f"panel_keluarga.kosong.{need} harus 'Belum ada'")
    if set(Pk["tahap_usia"]) != set(m["tahap_usia"]) or set(Pk["status_hubungan"]) != set(m["status_hubungan"]): err.append("panel_keluarga vs meta tahap/status")
    if set(Pk["tahap_usia"]) != {"bayi","anak","remaja","dewasa","lansia"}: err.append("tahap_usia harus bayi/anak/remaja/dewasa/lansia")
# ---------- struktur & angka v1.3.0 utuh ----------
old13 = json.load(open(ROOT + "tools/TEKS-GAME.v1.3.0.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old13, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.3.0:")
for k in old13:
    if list(new).index(k) != list(old13).index(k): err.append(f"urutan key top-level v1.3 berubah: {k}")
for sec in old13["meta"]:
    if isinstance(old13["meta"][sec], dict) and list(new["meta"][sec])[:len(old13["meta"][sec])] != list(old13["meta"][sec]): err.append(f"urutan meta.{sec} berubah (v1.3)")
diubah_v13 = list(teks_diubah)
# ---------- v1.4.0: lokalisasi Indonesia ----------
MUSIM_BARU = {"hujan", "mareng", "kemarau", "labuh"}
V14 = ["event_lokal", "flora", "fauna", "bangunan_lokal", "penyakit_musiman"]
for k in V14:
    if k not in new: err.append(f"bagian v1.4 hilang: {k}")
for k in ("status_indonesia", "sumber_indonesia", "alias_id_v140", "perlu_diubah_di_kode", "kata_terlarang", "txt_tema_nusantara"):
    if k not in m: err.append(f"meta.{k} hilang")
if m.get("status_indonesia") != "mengikuti_riset": err.append("meta.status_indonesia harus 'mengikuti_riset'")
if not MUSIM_BARU <= musim: err.append("meta.musim belum memuat hujan/mareng/kemarau/labuh")
if m["sumber_daya"].get("gandum") != "Padi": err.append("label gandum harus 'Padi'")
for need in ("bambu", "kelapa", "minyak", "sabut", "kopi"):
    if need not in m["sumber_daya"]: err.append(f"sumber_daya {need} hilang")
for need in ("musim_hujan", "musim_mareng", "musim_kemarau", "musim_labuh", "musim_mareng_menuju_kemarau", "musim_labuh_hujan_pertama"):
    if need not in new["musim_pembuka"]: err.append(f"musim_pembuka kurang {need}")
for need in ("banjir", "longsor", "kemarau_panjang", "kebakaran", "babi_hutan", "monyet", "ular", "macan_tutul"):
    if "ancaman_" + need not in new["peringatan_dini"]: err.append(f"peringatan_dini kurang ancaman_{need}")
for need in ("diare", "dbd", "ispa", "masuk_angin"):
    if need not in new.get("penyakit_musiman", {}): err.append(f"penyakit_musiman kurang {need}")
if "3M" not in new.get("penyakit_musiman", {}).get("dbd", {}).get("edukasi", ""): err.append("edukasi DBD harus memuat 3M")
for need in ("sawah", "tegalan", "pos_ronda", "pagar_bambu", "obor", "orang_orangan_sawah", "tanggul", "rumah_panggung", "lumbung_padi", "pendopo", "langgar",
             "kandang_ayam", "kandang_bebek", "kandang_kambing", "kandang_kerbau"):
    if need not in new.get("bangunan_lokal", {}): err.append(f"bangunan_lokal kurang {need}")
for v in new.get("bangunan_lokal", {}).values():
    if v.get("id_kode") is not None and v["id_kode"] not in set(m["bangunan"]) | set(m["bangunan_pertahanan"]): err.append(f"id_kode {v['id_kode']} tak dikenal")
for need in ("banjir_kiriman", "longsor", "ular_di_sawah", "hujan_pertama", "panen_padi_raya", "gotong_royong", "kenduri_panen", "ronda_malam", "hari_pasar", "tamu_desa_sebelah"):
    if need not in {e["id"] for e in new.get("event_lokal", [])}: err.append(f"event_lokal kurang {need}")
per_baru = {x: 0 for x in MUSIM_BARU}
for e in new.get("event_lokal", []):
    if set(e) != {"id","judul","kategori","deskripsi","pilihan","musim"} or not isinstance(e["musim"], list) or not set(e["musim"]) <= MUSIM_BARU: err.append(f"struktur event_lokal {e['id']}")
    for x in e["musim"]: per_baru[x] += 1
    if len(e["pilihan"]) != 3: err.append(f"event_lokal {e['id']} harus 3 pilihan")
    for j, pl in enumerate(e["pilihan"]):
        if set(pl) != {"teks","efek","teks_hasil"}: err.append(f"struktur pilihan {e['id']}[{j}]")
        cek_efek(pl["efek"], f"{e['id']}[{j}]")
        for f in ("makanan","gandum","buah","ikan","daging"):
            if pl["efek"].get(f, 0) > 5: err.append(f"hadiah pangan > 5 {e['id']}[{j}].{f}")
        if any(abs(v) > 15 for v in pl["efek"].values()): err.append(f"efek di luar skala (|x|>15) {e['id']}[{j}]")
    if any(v < 0 and k in m["sumber_daya"] for k, v in e["pilihan"][-1]["efek"].items()): err.append(f"pilihan terakhir berbiaya {e['id']}")
for x, n in per_baru.items():
    if n < 2: err.append(f"event_lokal musim {x} hanya {n}")
al = m.get("alias_id_v140", {})
for k in ("musim", "event", "hewan"):
    if k not in al: err.append(f"alias_id_v140.{k} hilang")
for old_id in al.get("event", {}):
    if old_id not in ev_ids: err.append(f"alias event lama {old_id} tidak ada (id lama tidak boleh dihapus)")
for old_id in al.get("musim", {}):
    if old_id not in musim: err.append(f"alias musim lama {old_id} tidak ada")
# ---------- struktur & angka v1.4.0 utuh ----------
old14 = json.load(open(ROOT + "tools/TEKS-GAME.v1.4.0.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old14, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.4.0:")
if teks_diubah: err.append(f"v1.5 hanya penambahan, tetapi {len(teks_diubah)} teks v1.4 berubah, mis. {teks_diubah[:3]}")
for k in old14:
    if list(new).index(k) != list(old14).index(k): err.append(f"urutan key top-level v1.4 berubah: {k}")
for sec in old14["meta"]:
    if isinstance(old14["meta"][sec], dict) and list(new["meta"][sec])[:len(old14["meta"][sec])] != list(old14["meta"][sec]): err.append(f"urutan meta.{sec} berubah (v1.4)")
if aids[len(old14["pencapaian"]):] != ["A%02d" % i for i in range(25, 35)]: err.append("pencapaian baru v1.5 harus A25-A34 di akhir")
# ---------- v1.5.0: tokoh, cerita & tujuan (spec docs/RISET-CERITA-TUJUAN.md) ----------
V15 = ["sifat", "hubungan", "keinginan", "cerita", "monumen", "kerja_bakti", "teladan", "agustusan", "rencana_tahun", "dilema", "dilema_ui", "momen_kecil"]
for k in V15:
    if k not in new: err.append(f"bagian v1.5 hilang: {k}")
if m.get("status_cerita_tujuan") != "mengikuti_riset": err.append("meta.status_cerita_tujuan harus 'mengikuti_riset'")
for k in ("sumber_cerita_tujuan", "kunci_efek_dilema_lain", "peta_spec_v150"):
    if k not in m: err.append(f"meta.{k} hilang")
for k in ("{hari_keputusan}", "{gelar}", "{monumen}", "{tahap}", "{lomba}", "{keinginan}", "{pasaran}", "{sifat}", "{pasangan}"):
    if k not in m["placeholder"]: err.append(f"placeholder v1.5 tidak terdaftar: {k}")
ids = lambda d: [k for k in d if not k.startswith("_") and k not in ("log_sifat", "_ui")]
SPEC_SIFAT = ["rajin", "malas", "pemberani", "penakut", "periang", "pemurung", "ramah", "pemarah", "sabar", "dermawan", "pelit", "suka_menolong",
              "jujur", "jahil", "cerdas", "religius", "perantau", "ahli_tani", "pandai_masak", "seniman"]  # spec §1.1 revisi 12:12
SIFAT_BENTROK = [("rajin", "malas"), ("pemberani", "penakut"), ("periang", "pemurung"), ("sabar", "pemarah"), ("dermawan", "pelit"), ("jujur", "jahil")]
SPEC_KEINGINAN = ["makan_rendang", "nasi_pecel", "kopi_pagi", "rumah_panggung", "nonton_reog", "tabungan_haji", "mancing_sore", "punya_ayam",
                  "baju_baru", "ziarah_makam", "wayang_semalam", "tidur_siang", "kerja_bakti", "ngobrol_sahabat", "punya_anak", "sawah_menguning",
                  "jajan_pasar", "belajar_gamelan", "rujak_bareng", "bancakan_weton", "pulang_kampung", "ronda_malam", "main_layangan",
                  "menang_lomba", "tumpeng_syukuran", "mandi_kali"]
SPEC_CERITA = ["warok_muda", "surat_kota", "resep_nenek", "penakut_babi", "kucing_belang", "cinta_segitiga", "bidan_desa", "kopi_pertama",
               "rival_sawah", "mbah_pendongeng"]
SPEC_MONUMEN = {"masjid": 3, "balai_megah": 3, "bendungan": 4, "pendopo_reog": 3, "pasar_legi": 3}
SPEC_LOMBA = ["balap_karung", "makan_kerupuk", "tarik_tambang", "panjat_pinang", "bakiak", "kelereng_sendok", "hias_gapura", "pawai_reog"]
SPEC_DILEMA = ["buka_hutan", "rombongan_pendatang", "pencuri_singkong", "tengkulak_padi", "rentenir", "tambang_pasir", "hajatan", "tanah_warisan",
               "rebutan_air", "beringin_keramat", "obat_sakit", "pupuk_penyuluh", "sekolah_kota", "kerbau_tetangga", "monyet_kebun", "tanggap_reog",
               "ronda_wajib", "bantu_tetangga", "jalan_desa", "kontrak_kopi", "tikus_lumbung", "ketua_ronda", "penebang_liar", "minta_hujan"]
SPEC_MOMEN = ["nama_api", "lagu_malam", "gubuk_pertama", "ayam_jago", "jenang_suro", "cerita_hantu", "burung_perkutut", "hujan_main",
              "gosip_pagi", "teh_tubruk", "mimpi_panen", "kentongan_iseng"]
PANGAN = ("makanan", "gandum", "buah", "ikan", "daging")
if all(k in new for k in V15):
    S5 = new["sifat"]
    if ids(S5) != SPEC_SIFAT: err.append("sifat != TRAITS spec (20 id, urutan spec)")
    for k in ids(S5):
        if not (S5[k].get("nama") and S5[k].get("kata") and S5[k].get("deskripsi") and S5[k].get("tooltip") and S5[k].get("log_terlihat")): err.append(f"sifat.{k} tidak lengkap")
    for need in ("jahil_kejahilan", "ramah_sambutan", "jujur_tolak_suap", "jujur_suap_diterima", "jujur_timbangan"):
        if not S5.get("log_sifat", {}).get(need): err.append(f"sifat.log_sifat.{need} kosong")
    PS = m.get("peta_sifat_penduduk", {})
    for pd in new["penduduk"]:
        tr = PS.get(pd["nama"])
        if not tr: err.append(f"peta_sifat_penduduk tidak memuat {pd['nama']}"); continue
        if not set(tr) <= set(SPEC_SIFAT) or not 1 <= len(tr) <= 3: err.append(f"peta_sifat_penduduk.{pd['nama']} id tidak valid")
        if any(a in tr and b in tr for a, b in SIFAT_BENTROK): err.append(f"peta_sifat_penduduk.{pd['nama']} sifat bentrok")
    if sum(1 for k in m["placeholder"] if "sifat" in k) != 1: err.append("placeholder sifat harus satu saja ({sifat}, sejak v1.2)")
    H5 = new["hubungan"]
    if not {"rival", "kenalan", "teman", "sahabat", "pasangan"} <= set(H5["tingkat"]): err.append("hubungan.tingkat kurang tingkat RELATION")
    for need in ("menjadi_teman", "menjadi_sahabat", "menjadi_rival", "bertengkar", "berbaikan", "jatuh_cinta", "gosip", "hadiah", "ronda_bareng"):
        if len(H5["log"].get(need, [])) < 2: err.append(f"hubungan.log.{need} kurang dari 2 variasi")
    for t in H5["log"].get("jatuh_cinta", []):
        if "{pasangan}" not in t: err.append("hubungan.log.jatuh_cinta harus memakai {pasangan} (selaras log_hubungan v1.3)")
    for need in ("menjadi_teman", "bertengkar", "berbaikan"):
        for t in H5["log"].get(need, []):
            if "{nama}" not in t or "{nama2}" not in t: err.append(f"hubungan.log.{need} harus memakai {{nama}} & {{nama2}}")
    K5 = new["keinginan"]
    if ids(K5) != SPEC_KEINGINAN: err.append("keinginan != WISHES spec (26 id)")
    for k in ids(K5):
        for f in ("judul", "deskripsi", "teks_muncul", "teks_terpenuhi", "teks_kecewa"):
            if not K5[k].get(f): err.append(f"keinginan.{k}.{f} kosong")
    C5 = new["cerita"]
    if ids(C5) != SPEC_CERITA: err.append("cerita != STORY_CHAINS spec (10 id)")
    for k in ids(C5):
        L = C5[k]["langkah"]
        if not 3 <= len(L) <= 4: err.append(f"cerita.{k} harus 3-4 langkah")
        if not C5[k].get("judul") or not C5[k].get("selesai"): err.append(f"cerita.{k} judul/selesai kosong")
        for i, st in enumerate(L):
            if not st.get("teks"): err.append(f"cerita.{k}.langkah[{i}] teks kosong")
            for j, pl in enumerate(st.get("pilihan", [])):
                if set(pl) != {"teks", "teks_hasil"}: err.append(f"cerita.{k}.langkah[{i}].pilihan[{j}] struktur")
    M5 = new["monumen"]
    if {k for k in ids(M5) if k != "ui"} != set(SPEC_MONUMEN): err.append("monumen != MONUMENTS spec (5 id)")
    for k, n in SPEC_MONUMEN.items():
        tp = M5.get(k, {}).get("tahap", [])
        if len(tp) != n: err.append(f"monumen.{k} harus {n} tahap")
        for i, t in enumerate(tp):
            if set(t) != {"nama", "mulai", "progres", "selesai", "bonus_ringkas"} or len(t["progres"]) != 3: err.append(f"monumen.{k}.tahap[{i}] struktur")
    T5 = new["teladan"]
    if list(T5["gelar"]) != ["rintisan", "swadaya", "swakarya", "swasembada", "teladan"]: err.append("teladan.gelar != TELADAN spec")
    for need in ("kedatangan", "naik_gelar", "tetap", "ditangguhkan", "ending"):
        if not T5.get(need): err.append(f"teladan.{need} kosong")
    A5 = new["agustusan"]
    if ids(A5["lomba"]) != SPEC_LOMBA: err.append("agustusan.lomba != AGUSTUSAN spec (8 id)")
    for k in ids(A5["lomba"]):
        lb = A5["lomba"][k]
        if not (lb.get("nama") and lb.get("aturan") and lb.get("mulai") and (lb.get("menang") or lb.get("selesai"))): err.append(f"agustusan.lomba.{k} tidak lengkap")
    for need in ("panitia", "malam_tirakatan", "upacara", "juara_umum"):
        if not A5.get(need): err.append(f"agustusan.{need} kosong")
    Y5 = new["rencana_tahun"]
    if [k for k in ids(Y5["pembuka_tahun"])] != [str(i) for i in range(1, 9)]: err.append("rencana_tahun.pembuka_tahun harus tahun 1-8")
    for need in ("piagam", "tanpa_piagam", "ending_mandiri"):
        if not Y5.get(need): err.append(f"rencana_tahun.{need} kosong")
    MK = new["momen_kecil"]
    if [k for k in ids(MK) if k != "judul"] != SPEC_MOMEN: err.append("momen_kecil != MOMEN_KECIL spec (12 id)")
    D5 = new["dilema"]
    if [d["id"] for d in D5] != SPEC_DILEMA: err.append("dilema != DILEMMAS spec (24 id, urutan D01-D24)")
    if len(D5) < 15: err.append("dilema kurang dari 15")
    kat_ok = set(new["dilema_ui"]["kategori"])
    lain_ok = set(m.get("kunci_efek_dilema_lain", {}).get("kunci", []))
    for d in D5:
        src = "dilema." + d["id"]
        if set(d) != {"id", "kelas", "judul", "kategori", "deskripsi", "pilihan"}: err.append(f"{src} struktur")
        if d["kelas"] not in ("R", "B"): err.append(f"{src} kelas bukan R/B")
        if d["kategori"] not in kat_ok: err.append(f"{src} kategori tak terdaftar")
        if len(d["pilihan"]) != 3: err.append(f"{src} harus 3 pilihan")
        ada_tunda = False
        for j, pl in enumerate(d["pilihan"]):
            s2 = f"{src}[{j}]"
            if not {"teks", "efek", "teks_hasil"} <= set(pl) or not set(pl) <= {"teks", "efek", "teks_hasil", "mekanik_lain", "tertunda", "hari_tunda", "teks_tertunda"}: err.append(f"{s2} struktur")
            cek_efek(pl["efek"], s2)
            if any(abs(v) > 80 for v in pl["efek"].values()): err.append(f"{s2} efek di luar skala (|x|>80, maks spec = batu 80)")
            for x in pl.get("mekanik_lain", []):
                if x not in lain_ok: err.append(f"{s2} mekanik_lain {x} tidak tercatat di meta.kunci_efek_dilema_lain")
            td = pl.get("tertunda", [])
            if td:
                ada_tunda = True
                if pl.get("hari_tunda") != td[0].get("hari_tunda") or pl.get("teks_tertunda") != td[0].get("teks_tertunda"): err.append(f"{s2} hari_tunda/teks_tertunda != tertunda[0]")
            elif "hari_tunda" in pl or "teks_tertunda" in pl: err.append(f"{s2} hari_tunda tanpa tertunda")
            for t in td:
                h = t.get("hari_tunda")
                if not (isinstance(h, list) and len(h) == 2 and all(isinstance(x, int) for x in h) and 1 <= h[0] <= h[1] <= 60): err.append(f"{s2} hari_tunda harus [min,max] 1-60")
                if not (isinstance(t.get("peluang"), (int, float)) and 0 < t["peluang"] <= 1): err.append(f"{s2} peluang 0-1")
                if not t.get("teks_tertunda") or "{hari}" not in t["teks_tertunda"]: err.append(f"{s2} teks_tertunda harus ada & memakai {{hari}}")
                if not t.get("kunci"): err.append(f"{s2} kunci tertunda kosong")
                cek_efek(t.get("efek_tertunda", {}), s2 + ".tertunda")
                for x in t.get("mekanik_lain", []):
                    if x not in lain_ok: err.append(f"{s2}.tertunda mekanik_lain {x} tidak tercatat")
        if not ada_tunda: err.append(f"{src} tanpa akibat tertunda")
        if d["kelas"] == "R":  # spec §3.2: R boleh sebelum hari 25 -> opsi 1 pangan >= -2, opsi lain >= -4, hadiah pangan <= +3
            if any(d["pilihan"][0]["efek"].get(f, 0) < -2 for f in PANGAN): err.append(f"{src} (R) opsi pertama harus aman (pangan >= -2)")
            if any(pl["efek"].get(f, 0) < -4 or pl["efek"].get(f, 0) > 3 for pl in d["pilihan"] for f in PANGAN): err.append(f"{src} (R) pangan di luar -4..+3")
        # Asisten Riset 17-10: angka tabel opsi pertama kelas B dikonfirmasi benar; batas -6 tetap.
        elif any(d["pilihan"][0]["efek"].get(f, 0) < -6 for f in PANGAN): err.append(f"{src} (B) opsi pertama terlalu mahal (pangan < -6)")
    kunci_t = [t["kunci"] for d in D5 for pl in d["pilihan"] for t in pl.get("tertunda", [])]
    asal = {}
    for d in D5:
        for pl in d["pilihan"]:
            for t in pl.get("tertunda", []):
                if asal.setdefault(t["kunci"], d["id"]) != d["id"]: err.append(f"kunci akibat tertunda {t['kunci']} dipakai dua dilema")
    for need in ("banjir_hulu", "kiriman_terima_kasih", "harga_beras_naik", "suap_bocor", "timbangan_curang"):
        if need not in kunci_t: err.append(f"akibat tertunda spec {need} hilang")
# ---------- v1.5.1: key yang di kode masih memakai fallback (game.js TX) ----------
# Akibat tertunda bertanda usulan_dokumen (5) tetap dipertahankan (Asisten Riset 17-10); kode boleh mengabaikannya.
old15 = json.load(open(ROOT + "tools/TEKS-GAME.v1.5.0.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old15, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.5.0:")
if teks_diubah: err.append(f"v1.5.1 hanya penambahan, tetapi {len(teks_diubah)} teks v1.5.0 berubah, mis. {teks_diubah[:3]}")
for k in old15:
    if list(new).index(k) != list(old15).index(k): err.append(f"urutan key top-level v1.5 berubah: {k}")
def ambil(d, path):
    for k in path.split("."):
        if not isinstance(d, dict) or k not in d: return None
        d = d[k]
    return d
# path -> (tipe, {jumlah} wajib/terlarang/bebas); sesuai TX() di game.js (352aed4): array = variasi acak
V151 = {"kerja_bakti.kenduri": ("list", "bebas"), "kerja_bakti.log_mulai": ("list", "tanpa"),
        "kerja_bakti.kenduri_syukuran": ("list", "wajib"), "kerja_bakti.kenduri_sedekah": ("list", "wajib"),
        "dilema_ui.syukuran_panen": ("list", "wajib"), "dilema_ui.utang_lunas": ("list", "tanpa"), "dilema_ui.utang_sita": ("list", "tanpa"),
        "agustusan.panitia.setuju": ("str", "tanpa"), "momen_kecil.judul": ("str", "tanpa")}
def cek_v151(T, sumber):
    for path, (tp, jml) in V151.items():
        v = ambil(T, path)
        if tp == "str":
            if not isinstance(v, str) or not v.strip(): err.append(f"{sumber}{path} harus string tidak kosong"); continue
            vs = [v]
        else:
            if not (isinstance(v, list) and len(v) >= 2 and all(isinstance(x, str) and x.strip() for x in v)): err.append(f"{sumber}{path} harus array >= 2 variasi string"); continue
            vs = v
        for t in vs:
            if jml == "tanpa" and "{jumlah}" in t: err.append(f"{sumber}{path} memakai {{jumlah}} padahal kode tidak mengisinya: {t[:40]}")
            if jml == "wajib" and "{jumlah}" not in t: err.append(f"{sumber}{path} harus memakai {{jumlah}} (porsi): {t[:40]}")
            if t.startswith("Hari {hari}"): err.append(f"{sumber}{path} jangan diawali 'Hari {{hari}}:' (log() sudah menambahkannya)")
cek_v151(new, "")
if "catatan_v151" not in m: err.append("meta.catatan_v151 hilang")
# ---------- tema sedang: TEKS-TEMA-sedang.json (overlay mergeTextOverlay di game.js) ----------
SEDANG = os.environ.get("TEKS_SEDANG", ROOT + "TEKS-TEMA-sedang.json")
ov = json.load(open(SEDANG, encoding="utf-8"))
sed_err, sed_warn = [], []
def merge(base, o):  # salinan mergeTextOverlay (game.js)
    if base is None or not isinstance(o, dict): return base if o is None else o
    if "__byId" in o:
        if not isinstance(base, list): return base
        for x in o["__byId"]:
            i = next((j for j, b in enumerate(base) if isinstance(b, dict) and b.get("id", b.get("kode")) == x["id"]), None)
            if i is not None: base[i] = merge(base[i], {k: v for k, v in x.items() if k != "id"})
        return base
    if "__byIdx" in o:
        if not isinstance(base, list): return base
        for i, x in o["__byIdx"].items():
            if int(i) < len(base): base[int(i)] = merge(base[int(i)], x)
        return base
    if not isinstance(base, dict): return o
    for k, v in o.items(): base[k] = merge(base[k], v) if k in base else v
    return base
BUKAN_TEKS = ID_KEYS | {"efek", "efek_tertunda", "hadiah", "kunci", "peluang", "hari_tunda", "kelas", "mekanik_lain", "usulan_dokumen", "catatan_efek"}
def cek_ov(b, o, p):  # overlay hanya boleh menimpa teks yang sudah ada di TEKS-GAME.json
    if isinstance(o, dict) and "__byId" in o:
        if not isinstance(b, list): sed_err.append(f"__byId pada non-list @ {p}"); return
        for x in o["__byId"]:
            hit = [e for e in b if isinstance(e, dict) and e.get("id", e.get("kode")) == x.get("id")]
            if not hit: sed_err.append(f"id {x.get('id')} tidak ada di TEKS @ {p}"); continue
            cek_ov(hit[0], {k: v for k, v in x.items() if k != "id"}, f"{p}[{x['id']}]")
    elif isinstance(o, dict) and "__byIdx" in o:
        if not isinstance(b, list): sed_err.append(f"__byIdx pada non-list @ {p}"); return
        for i, x in o["__byIdx"].items():
            if not i.isdigit() or int(i) >= len(b): sed_err.append(f"indeks {i} di luar list @ {p}"); continue
            cek_ov(b[int(i)], x, f"{p}[{i}]")
    elif isinstance(o, dict):
        if not isinstance(b, dict): sed_err.append(f"objek menimpa non-objek @ {p}"); return
        for k, v in o.items():
            if k.startswith("_"): continue
            if k in BUKAN_TEKS and not (k == "hasil" and re.fullmatch(r"/cerita/\w+/langkah\[\d+\]", p)) and not (k == "target" and p == "/hari_jadi_ringkasan" and isinstance(v, str)): sed_err.append(f"overlay menimpa data non-teks '{k}' @ {p}"); continue
            if k not in b: sed_err.append(f"path tidak ada di TEKS-GAME.json: {p}/{k}"); continue
            cek_ov(b[k], v, f"{p}/{k}")
    elif isinstance(o, list):
        if not isinstance(b, list) or not all(isinstance(x, str) for x in o) or not all(isinstance(x, str) for x in b): sed_err.append(f"larik biasa hanya untuk larik string (menggantikan seluruh larik) @ {p}")
        elif not o: sed_err.append(f"larik kosong @ {p}")
    elif isinstance(o, str):
        if not isinstance(b, str): sed_err.append(f"string menimpa {type(b).__name__} @ {p}")
    else: sed_err.append(f"overlay berisi nilai non-teks {o!r} @ {p}")
cek_ov(new, {k: v for k, v in ov.items() if not k.startswith("_")}, "")
sd = merge(copy.deepcopy(new), copy.deepcopy(ov))
# id cerita yang aktif di kode (cerita.js) & daftar disable tema sedang (tema.js); cadangan bila node tidak ada
P0_DILEMA = ["rombongan_pendatang", "pencuri_singkong", "obat_sakit", "kerbau_tetangga", "monyet_kebun", "ronda_wajib", "tikus_lumbung",
             "minta_hujan", "buka_hutan", "tengkulak_padi", "rentenir", "tanggap_reog"]
P0_MOMEN = SPEC_MOMEN
try:
    _js = ("global.CONFIG={};const vm=require('vm');vm.runInThisContext(require('fs').readFileSync('cerita.js','utf8'));"
           "console.log(JSON.stringify([Object.keys(CONFIG.DILEMMAS),Object.keys(CONFIG.MOMEN_KECIL.list||CONFIG.MOMEN_KECIL)]))")
    P0_DILEMA, P0_MOMEN = json.loads(subprocess.run(["node", "-e", _js], cwd=ROOT, capture_output=True, text=True, timeout=20).stdout)
except Exception as e: sed_warn.append(f"cerita.js tidak terbaca lewat node ({e}); memakai daftar P0 bawaan")
_tm = open(ROOT + "tema.js", encoding="utf-8").read()
_m = re.search(r"STORY_DISABLE:\s*\[([^\]]*)\]", _tm)
DISABLE = re.findall(r"'([^']+)'", _m.group(1)) if _m else []
_m = re.search(r"STORY_PATCH:\s*\{(.*)\},\s*$", _tm, re.M)
PATCH_OFF = re.findall(r"(\w+):\s*\{\s*enabled:\s*false", _m.group(1)) if _m else []
# Kata khas Indonesia/Nusantara yang tidak boleh muncul di teks cerita tema sedang (kecuali SEDANG_SENGAJA)
KHAS_ID = ["kenduri", "selamatan", "ronda", "peronda", "pos ronda", "agustus", "agustusan", "17-an", "tujuh belasan", "tirakatan", "padi", "gabah", "sawah",
           "tegalan", "pematang", "gropyokan", "reog", "warok", "jathil", "jathilan", "dadak merak", "gamelan", "kendang", "kentongan", "jamu", "kunyit",
           "temulawak", "suwuk", "dukun", "mbah", "mantri", "singkong", "kerbau", "tengkulak", "peci", "berpeci", "juragan", "pecel", "sambal", "tumpeng",
           "monyet", "pisang", "kelapa", "oncor", "gotong royong", "bergotong royong", "pendopo", "langgar", "beringin", "merah putih", "kerupuk", "pinang",
           "jenang", "perkutut", "tubruk", "macapat", "campursari", "dolanan", "genderuwo", "istisqa", "kancil", "rentenir", "kemarau", "mareng", "labuh",
           "caping", "janur", "bakiak", "kelereng", "gapura", "camat", "kecamatan", "kades", "kendi", "gorengan", "sholat", "subuh", "indonesia raya",
           "lidi", "bakul", "nusantara", "kampung", "sarung", "batik", "wayang", "sate", "rendang", "weton", "pasaran", "macan tutul", "babi hutan",
           "syukuran", "tasyakuran", "sedekah", "kabupaten", "lurah", "bancakan"]
SEDANG_SENGAJA = set()  # (path, kata) yang memang disengaja; kosong saat ini
RXI = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(KHAS_ID, key=len, reverse=True)) + r")(?![\w-])", re.I)
CERITA_SEDANG = ["dilema", "dilema_ui", "momen_kecil", "agustusan", "kerja_bakti"]
def scan(x, p, out, idk=False):
    if isinstance(x, str):
        if not idk:
            for hit in RXI.finditer(x):
                if (p, hit.group(1).lower()) not in SEDANG_SENGAJA: out.append((p, hit.group(1)))
    elif isinstance(x, dict):
        for k, v in x.items():
            if not k.startswith("_") and k not in BUKAN_TEKS: scan(v, f"{p}/{k}", out, idk or (k in ID_KEYS and not (isinstance(v, list) and v and isinstance(v[0], dict))))
    elif isinstance(x, list): [scan(v, f"{p}[{i}]", out, idk) for i, v in enumerate(x)]
kena = {}
for sec in CERITA_SEDANG:
    if sec == "dilema":
        for d in sd["dilema"]:
            o = []; scan({k: v for k, v in d.items() if k != "id"}, "dilema/" + d["id"], o)
            if o: kena[d["id"]] = o
    elif sec == "momen_kecil":
        for k, v in sd["momen_kecil"].items():
            if isinstance(v, dict):
                o = []; scan(v, "momen_kecil/" + k, o)
                if o: kena[k] = o
    else:
        o = []; scan(sd[sec], sec, o)
        if o: kena[sec] = o
o = []; scan(sd["peringatan_dini"]["ancaman_monyet"], "peringatan_dini/ancaman_monyet", o)
if o: kena["ancaman_monyet"] = o
aktif = set(P0_DILEMA) | set(P0_MOMEN) | {"dilema_ui", "kerja_bakti", "agustusan", "ancaman_monyet"}
for k, hits in kena.items():
    msg = f"kata khas Indonesia di tema sedang: {k}: " + ", ".join(f"'{w}' @ {p}" for p, w in hits[:3]) + (f" (+{len(hits) - 3})" if len(hits) > 3 else "")
    (sed_err if k in aktif else sed_warn).append(msg + ("" if k in aktif else " [belum dipakai cerita.js]"))
for path in V151:  # key baru v1.5.1 juga harus punya padanan sedang bila teksnya khas Indonesia (dicek lewat scan di atas)
    pass
cek_v151(sd, "sedang:")
for d in sd["dilema"]:  # teks_tertunda opsi tetap selaras tertunda[0] setelah overlay
    for j, pl in enumerate(d["pilihan"]):
        if pl.get("tertunda") and pl.get("teks_tertunda") != pl["tertunda"][0].get("teks_tertunda"): sed_err.append(f"sedang: dilema.{d['id']}[{j}] teks_tertunda != tertunda[0]")
# placeholder di bagian cerita sedang hasil gabungan
def walk_s(x, p):
    if isinstance(x, str):
        for k in re.findall(r"\{(\w+)\}", x):
            if k not in ph_ok_s: sed_err.append(f"placeholder tak terdaftar {{{k}}} @ sedang:{p}")
    elif isinstance(x, dict): [walk_s(v, f"{p}/{k}") for k, v in x.items()]
    elif isinstance(x, list): [walk_s(v, f"{p}[{i}]") for i, v in enumerate(x)]
ph_ok_s = {k.strip("{}") for k in m["placeholder"]}
for sec in CERITA_SEDANG: walk_s(sd[sec], sec)
walk_s(sd["peringatan_dini"]["ancaman_monyet"], "peringatan_dini/ancaman_monyet")
# bagian cerita harus ada (menangkap bila buat_overlay_sedang.js dijalankan ulang tanpa buat_tema_sedang_cerita.py)
for sec in CERITA_SEDANG:
    if sec not in ov: sed_err.append(f"TEKS-TEMA-sedang.json tanpa bagian {sec}: jalankan python3 tools/buat_tema_sedang_cerita.py")
if "ancaman_monyet" not in ov.get("peringatan_dini", {}): sed_err.append("TEKS-TEMA-sedang.json tanpa peringatan_dini.ancaman_monyet (rubah)")
bisa_cabut = [x for x in DISABLE if x not in kena]
tetap = [x for x in DISABLE if x in kena]
patch_cabut = [x for x in PATCH_OFF if {"AGUSTUSAN": "agustusan", "MONKEY": "ancaman_monyet"}.get(x, x) not in kena]
# ---------- v1.6.0: pangan v9 (game.js TX('pangan.*')) — key wajib di kedua tema, placeholder, kata khas Indonesia tema sedang ----------
old151 = json.load(open(ROOT + "tools/TEKS-GAME.v1.5.1.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old151, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.5.1:")
if teks_diubah: err.append(f"v1.6.0 hanya penambahan, tetapi {len(teks_diubah)} teks v1.5.1 berubah, mis. {teks_diubah[:3]}")
for k in old151:
    if list(new).index(k) != list(old151).index(k): err.append(f"urutan key top-level v1.5.1 berubah: {k}")
if "catatan_v160" not in m: err.append("meta.catatan_v160 hilang")
if "{buah}" not in m["placeholder"]: err.append("placeholder {buah} (v1.6.0) tidak terdaftar")
# id dari kode (game.js PANGAN_FB, FOOD_OUT_FB, penyerap takeFood/surplusSink) + C.FOOD_SOURCES (balance.js); cadangan bila tidak terbaca
SUMBER = ["meramu", "memancing", "ikan", "jamur", "buah", "mangga", "rambutan", "pisang", "kelapa", "umbi", "keong", "padi", "jagung", "ubi", "singkong",
          "gandum", "wortel", "makanan", "pasar", "cerita", "kerja_bakti", "pesta_17an", "telur"]  # telur: v1.7.1 (e64bda9)
KELUAR = ["dimakan", "busuk", "kenduri", "tikus", "monyet", "syukuran_lahir", "syukuran_panen", "pesta", "dijual", "lainnya",
          "event", "cerita", "hadiah", "rusak", "pasar", "lomba", "pesta_17an", "kerja_bakti", "monumen", "keinginan"]  # baris 2: v1.6.1 (51b6d4d)
TUGAS = ["meramu", "memancing", "jamur", "buah", "umbi", "keong", "telur"]  # = C.FOOD_SOURCES (dikonfirmasi Asisten Koding 21-10; telur v1.7.1 e64bda9)
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read(); _b = open(ROOT + "balance.js", encoding="utf-8").read()
    _fb = re.search(r"const PANGAN_FB = \{(.*?)\};", _g, re.S).group(1); _ob = re.search(r"const FOOD_OUT_FB = \{(.*?)\};", _g).group(1)
    KELUAR_K = re.findall(r"(\w+):", _ob)
    _sink = set(re.findall(r"(?:takeFood|surplusSink)\([^;]*?'(\w+)'\)", _g)) | set(re.findall(r"dstat\('sink', '(\w+)'", _g))
    _fs = re.search(r"FOOD_SOURCES: \{(.*?)\n  \},", _b, re.S).group(1)
    TUGAS_K = re.findall(r"^\s{4}(\w+):\s*\{", _fs, re.M)
    _kinds = re.findall(r"(\w+): \{ season", re.search(r"kinds: \{(.*?)\}, amount", _fs, re.S).group(1))
    SUMBER_K = list(dict.fromkeys(re.findall(r"(\w+):", _fb) + TUGAS_K + _kinds + sorted(_sink - set(KELUAR_K))))
    if set(SUMBER_K) - set(SUMBER): err.append(f"pangan.sumber: id baru di kode belum ada di daftar validator: {sorted(set(SUMBER_K) - set(SUMBER))}")
    if set(KELUAR_K) - set(KELUAR): err.append(f"pangan.keluar: k baru di kode belum ada di daftar validator: {sorted(set(KELUAR_K) - set(KELUAR))}")
    if set(TUGAS_K) != set(TUGAS): err.append(f"pangan.tugas: id C.FOOD_SOURCES berubah: {TUGAS_K}")
except Exception as e: sed_warn.append(f"game.js/balance.js tidak terbaca untuk id pangan ({e}); memakai daftar bawaan")
# path -> placeholder yang boleh dipakai (wajib = harus ada)
V160 = {"pangan.label": (), "pangan.hari": (), "pangan.tooltip.judul": (), "pangan.tooltip.konsumsi": (), "pangan.tooltip.hari_ini": (),
        "pangan.ringkasan.judul_masuk": (), "pangan.ringkasan.judul_keluar": (), "pangan.ringkasan.masuk": (), "pangan.ringkasan.keluar": (),
        "pangan.ladang.belum_jadi": (), "pangan.ladang.banjir": (), "pangan.ladang.berhenti_dingin": ("musim",), "pangan.ladang.berhenti_kemarau": (),
        "pangan.ladang.siap": (), "pangan.ladang.tumbuh": (), "pangan.ladang.kosong": (), "pangan.ladang.perkiraan": (), "pangan.ladang.hasil": (),
        "pangan.kolam.hari_ini": (), "pangan.pohon_buah": ("buah",), "pangan.berbuah": (), "pangan.belum_berbuah": (), "pangan.sudah_digali": (),
        "pangan.daya_tarik.judul": (), "pangan.daya_tarik.tinggi": (), "pangan.daya_tarik.sedang": (), "pangan.daya_tarik.rendah": (),
        "pangan.daya_tarik.tooltip": (), "pangan.daya_tarik.bonus": (), "pangan.daya_tarik.mood": ("jumlah", "jumlah2"),
        "pangan.daya_tarik.bahagia": ("jumlah", "jumlah2"), "pangan.daya_tarik.pangan": ("jumlah", "jumlah2"), "pangan.daya_tarik.rumah": ("jumlah",),
        "pangan.daya_tarik.jeda": ("jumlah",)}
V160.update({f"pangan.sumber.{k}": () for k in SUMBER}); V160.update({f"pangan.keluar.{k}": () for k in KELUAR})
# v1.6.1: {jumlah} = mood rata-rata minimal, {jumlah2} = mood terendah yang diizinkan; murung: {jumlah} = mood warga terendah
V160.update({"pangan.daya_tarik.bahagia_syarat": ("jumlah", "jumlah2"), "pangan.daya_tarik.murung": ("jumlah",)})
TITLE = {"pangan.daya_tarik.tooltip", "pangan.tooltip.judul", "pangan.tooltip.konsumsi", "pangan.tooltip.hari_ini", "pangan.ringkasan.masuk", "pangan.ringkasan.keluar"} \
        | {f"pangan.keluar.{k}" for k in KELUAR} | {f"pangan.sumber.{k}" for k in SUMBER}
# tidak dipakai tema sedang (FOOD_SOURCES_PATCH buah/keong = null, tanaman Nusantara): boleh tetap teks Nusantara, tidak dipindai
SEDANG_TAK_DIPAKAI = {f"pangan.sumber.{k}" for k in ("buah", "mangga", "rambutan", "pisang", "kelapa", "keong", "padi", "jagung", "ubi", "singkong")} \
        | {"pangan.tugas.buah", "pangan.tugas.keong", "pangan.pohon_buah", "pangan.berbuah", "pangan.belum_berbuah"}
KHAS_PANGAN = KHAS_ID + ["keong", "umbi", "uwi", "gembili", "rambutan", "mangga", "tambak", "perantau", "kerja bakti", "17-an"]
RXP = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(KHAS_PANGAN, key=len, reverse=True)) + r")(?![\w-])", re.I)
def cek_teks(t, path, sumber, ph, wajib_semua=True):
    if not isinstance(t, str) or not t.strip(): err.append(f"{sumber}{path} harus string tidak kosong"); return
    pk = set(re.findall(r"\{(\w+)\}", t))
    if pk - set(ph): err.append(f"{sumber}{path} memakai placeholder yang tidak diisi kode {sorted(pk - set(ph))}: {t[:50]}")
    if wajib_semua and set(ph) - pk: err.append(f"{sumber}{path} harus memakai {sorted(set(ph) - pk)}: {t[:50]}")
    if t.startswith("Hari {hari}"): err.append(f"{sumber}{path} jangan diawali 'Hari {{hari}}:'")
    if path in TITLE and ('"' in t or "<" in t): err.append(f"{sumber}{path} dipakai di atribut title=: tanpa tanda kutip ganda dan '<'")
    if sumber == "sedang:" and not any(path == x or path.startswith(x + ".") for x in SEDANG_TAK_DIPAKAI):
        for h in RXP.finditer(t): sed_err.append(f"kata khas Indonesia di tema sedang: '{h.group(1)}' @ {path}")
def cek_v160(T, sumber):
    for path, ph in V160.items(): cek_teks(ambil(T, path), path, sumber, ph)
    v = ambil(T, "pangan.daya_tarik.pendatang")
    if not (isinstance(v, list) and 3 <= len(v) <= 5): err.append(f"{sumber}pangan.daya_tarik.pendatang harus array 3-5 variasi")
    else: [cek_teks(x, "pangan.daya_tarik.pendatang", sumber, ("nama",), False) for x in v]
    for tid in TUGAS:
        path = f"pangan.tugas.{tid}"
        if sumber == "sedang:" and path in SEDANG_TAK_DIPAKAI: continue
        t = ambil(T, path)
        if not isinstance(t, dict): err.append(f"{sumber}{path} harus objek {{nama, log[]}}"); continue
        cek_teks(t.get("nama"), path + ".nama", sumber, ())
        lg = t.get("log")
        if not (isinstance(lg, list) and len(lg) >= 2): err.append(f"{sumber}{path}.log harus array >= 2 variasi"); continue
        for x in lg:
            cek_teks(x, path + ".log", sumber, ("nama", "jumlah", "buah") if tid == "buah" else ("nama", "jumlah"), False)
            if "{jumlah}" not in x: err.append(f"{sumber}{path}.log harus memakai {{jumlah}} (hasil): {x[:40]}")
cek_v160(new, "")
cek_v160(sd, "sedang:")
# ---------- v1.6.1: v9c (game.js 51b6d4d) — otomatis.*, pangan.keluar baru, daya_tarik.bahagia_syarat / murung ----------
old160 = json.load(open(ROOT + "tools/TEKS-GAME.v1.6.0.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old160, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.6.0:")
if teks_diubah: err.append(f"v1.6.1 hanya penambahan, tetapi {len(teks_diubah)} teks v1.6.0 berubah, mis. {teks_diubah[:3]}")
for k in old160:
    if list(new).index(k) != list(old160).index(k): err.append(f"urutan key top-level v1.6.0 berubah: {k}")
if "catatan_v161" not in m: err.append("meta.catatan_v161 hilang")
OTOMATIS = ["api_unggun", "gubuk", "gubuk_tambahan"]  # gubuk_tambahan: v1.7.3 (42d19ac)
OTOMATIS_PH = {"gubuk_tambahan": ("nama", "nama2", "gubuk")}  # lainnya: autoNames() = {nama}, {nama2}
try:
    _ot = re.findall(r"TX\('otomatis\.(\w+)'", open(ROOT + "game.js", encoding="utf-8").read())
    if set(_ot) - set(OTOMATIS): err.append(f"otomatis: key baru di kode belum ada di daftar validator: {sorted(set(_ot) - set(OTOMATIS))}")
except Exception as e: sed_warn.append(f"game.js tidak terbaca untuk otomatis.* ({e})")
def cek_v161(T, sumber):
    for k in OTOMATIS:
        v = ambil(T, "otomatis." + k)
        if not (isinstance(v, list) and 2 <= len(v) <= 4): err.append(f"{sumber}otomatis.{k} harus array 2-4 variasi"); continue
        for x in v: cek_teks(x, "otomatis." + k, sumber, OTOMATIS_PH.get(k, ("nama", "nama2")), False)
cek_v161(new, "")
cek_v161(sd, "sedang:")
if "otomatis" not in ov: sed_err.append("TEKS-TEMA-sedang.json tanpa bagian otomatis: jalankan python3 tools/buat_tema_sedang_cerita.py")
if "pangan" not in ov: sed_err.append("TEKS-TEMA-sedang.json tanpa bagian pangan: jalankan python3 tools/buat_tema_sedang_cerita.py")
_ovp = ov.get("pangan", {})
for x in SEDANG_TAK_DIPAKAI:
    if ambil(_ovp, x.split(".", 1)[1]) is not None: sed_warn.append(f"overlay sedang menulis {x} padahal tidak dipakai tema sedang")
# ---------- v1.7.0: P1 Tujuan & Cerita (3bbeca1) — key UI baru di kedua tema + bagian overlay sedang keinginan/monumen/cerita/teladan/rencana_tahun ----------
old161 = json.load(open(ROOT + "tools/TEKS-GAME.v1.6.1.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old161, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.6.1:")
if teks_diubah: err.append(f"v1.7.0 hanya penambahan, tetapi {len(teks_diubah)} teks v1.6.1 berubah, mis. {teks_diubah[:3]}")
for k in old161:
    if list(new).index(k) != list(old161).index(k): err.append(f"urutan key top-level v1.6.1 berubah: {k}")
if "catatan_v170" not in m: err.append("meta.catatan_v170 hilang")
# path -> (bentuk, placeholder yang diisi kode, placeholder wajib). bentuk: str | list (array 2-4) | strlist (string atau array)
V170 = {"event_ui.pendatang.terima": ("str", (), ()), "event_ui.pendatang.tolak_halus": ("str", (), ()),
        "event_ui.pendatang.tolak_halus_hasil": ("strlist", ("nama", "nama2"), ()),
        "jenjang_kelaparan.tingkat.bahaya.banner_masa_awal": ("str", ("jumlah",), ("jumlah",)),   # dibaca langsung (fillSafe), bukan TX -> wajib string
        "jenjang_kelaparan.tingkat.bahaya.tooltip_masa_awal": ("str", (), ()),
        "cerita_ui.label": ("str", (), ()), "keinginan._ui.otomatis": ("str", (), ()),
        "agustusan.pentas_reog": ("list", ("nama", "nama2", "hari"), ()),
        "dilema_ui.orang_orangan_berdiri": ("list", ("nama", "nama2"), ()),
        "log_ancaman.diusir_orang_orangan": ("list", ("nama", "nama2", "hewan", "hari"), ())}
TITLE |= {"jenjang_kelaparan.tingkat.bahaya.tooltip_masa_awal"}
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read()
    for path in V170:
        if path.startswith("log_ancaman."): ok = f"TT('{path.split('.')[-1]}'" in _g
        elif path.endswith("banner_masa_awal"): ok = "JB.banner_masa_awal" in _g
        else: ok = f"TX('{path}'" in _g
        if not ok: sed_warn.append(f"v1.7.0: {path} tidak lagi ditemukan di game.js")
    if "TT('diusir_orang_orangan'" in _g and "diusir_orang_orangan" not in open(ROOT + "tema.js", encoding="utf-8").read():
        sed_warn.append("log_ancaman.diusir_orang_orangan belum dibaca kode: TT('diusir_orang_orangan') tanpa entri C.TXT di tema.js (catatan untuk Asisten Koding)")
except Exception as e: sed_warn.append(f"game.js tidak terbaca untuk cek v1.7.0 ({e})")
def cek_v170(T, sumber):
    for path, (bt, ph, wajib) in V170.items():
        v = ambil(T, path)
        if bt == "str" and not isinstance(v, str): err.append(f"{sumber}{path} harus string"); continue
        if bt == "list" and not (isinstance(v, list) and 2 <= len(v) <= 4): err.append(f"{sumber}{path} harus array 2-4 variasi"); continue
        for x in (v if isinstance(v, list) else [v]):
            cek_teks(x, path, sumber, ph, False)
            for w in wajib:
                if isinstance(x, str) and "{" + w + "}" not in x: err.append(f"{sumber}{path} harus memakai {{{w}}}")
            if isinstance(x, str) and re.search(r"(^|[.!?]\s+)\{hewan\}", x): err.append(f"{sumber}{path}: {{hewan}} huruf kecil jangan di awal kalimat")
cek_v170(new, "")
cek_v170(sd, "sedang:")
# bagian tujuan tema sedang: harus ada, placeholder hanya yang ada di teks Nusantara path yang sama, tanpa kata khas Indonesia
TUJUAN_SEDANG = ["keinginan", "monumen", "cerita", "teladan", "rencana_tahun"]
KHAS_TUJUAN = KHAS_PANGAN + ["di kali", "ke kali", "dari kali", "tepi kali", "batu kali", "layangan", "jajan", "klepon", "cenil", "bale-bale", "haji", "adzan", "azan",
    "bedug", "joglo", "soko guru", "rumbia", "kebaya", "kamboja", "posyandu", "kencur", "cobek", "mengulek", "warung", "gong", "santan", "rempeyek", "bambu",
    "dalang", "swadaya", "swakarya", "swasembada", "pak camat", "halal bihalal", "bujang ganong", "barongan", "guyub", "kerasan", "ijuk", "sabut", "nasi",
    "momongan", "masjid", "langgar", "dadak merak", "tasyakuran", "legi", "kliwon", "embung", "bronjong"]
RXT = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(set(KHAS_TUJUAN), key=len, reverse=True)) + r")(?![\w-])", re.I)
SKIP_T = {"id", "kunci", "_catatan"}
def scan_t(x, p, out):
    if isinstance(x, str): out.extend((p, h.group(1)) for h in RXT.finditer(x))
    elif isinstance(x, dict): [scan_t(v, f"{p}/{k}", out) for k, v in x.items() if not k.startswith("_") and k not in SKIP_T]
    elif isinstance(x, list): [scan_t(v, f"{p}[{i}]", out) for i, v in enumerate(x)]
PH_RX = re.compile(r"\{(\w+)\}")
def ph_semua(x):
    if isinstance(x, str): return set(PH_RX.findall(x))
    if isinstance(x, list): return set().union(*[ph_semua(v) for v in x]) if x else set()
    if isinstance(x, dict): return set().union(*[ph_semua(v) for v in x.values()]) if x else set()
    return set()
def cek_ph(s, b, p):  # s = gabungan sedang, b = TEKS (Nusantara), struktur sama
    if isinstance(s, str):
        lebih = set(PH_RX.findall(s)) - ph_semua(b)
        if lebih: sed_err.append(f"sedang:{p} memakai placeholder yang tidak ada di teks Nusantara path ini {sorted(lebih)}")
    elif isinstance(s, dict) and isinstance(b, dict): [cek_ph(v, b.get(k), f"{p}/{k}") for k, v in s.items() if not k.startswith("_")]
    elif isinstance(s, list):
        for i, v in enumerate(s): cek_ph(v, b[i] if isinstance(b, list) and isinstance(v, dict) and i < len(b) else b, f"{p}[{i}]")
kena_t = {}
for sec in TUJUAN_SEDANG:
    if sec not in ov: sed_err.append(f"TEKS-TEMA-sedang.json tanpa bagian {sec}: jalankan python3 tools/buat_tema_sedang_cerita.py")
    cek_ph(sd[sec], new[sec], sec)
    for k, v in sd[sec].items():
        if k.startswith("_") and k != "_ui": continue
        o = []; scan_t(v, f"{sec}/{k}", o)
        if o: kena_t[(sec, k)] = o
for path in V170:
    o = []; scan_t(ambil(sd, path), path, o)
    if o: kena_t[("ui", path)] = o
for (sec, k), hits in kena_t.items():
    sed_err.append(f"kata khas Indonesia di tema sedang: {sec}.{k}: " + ", ".join(f"'{w}' @ {p}" for p, w in hits[:3]) + (f" (+{len(hits) - 3})" if len(hits) > 3 else ""))
for sec in TUJUAN_SEDANG: walk_s(sd[sec], sec)
for path in V170: walk_s(ambil(sd, path), path)
# id TUJUAN_DISABLE (tema.js) yang teks sedangnya kini bersih -> boleh dicabut
_m = re.search(r"TUJUAN_DISABLE:\s*\[([^\]]*)\]", _tm)
TUJUAN_OFF = re.findall(r"'([^']+)'", _m.group(1)) if _m else []
_sek = {"teladan": "teladan", "rencana": "rencana_tahun"}
def _bersih(x):
    if x in _sek: return not any(s == _sek[x] for s, _ in kena_t) and _sek[x] in ov
    return any(x in ov.get(s, {}) for s in ("keinginan", "monumen", "cerita")) and not any(k == x for _, k in kena_t)
tujuan_cabut = [x for x in TUJUAN_OFF if _bersih(x)]
tujuan_tetap = [x for x in TUJUAN_OFF if x not in tujuan_cabut]
# ---------- v1.7.1: P1b (e64bda9) — Kandang Ayam (telur, pangan.kandang), nama bangunan lokal P1, ringkasan Hari Jadi; kedua tema ----------
old170 = json.load(open(ROOT + "tools/TEKS-GAME.v1.7.0.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old170, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.7.0:")
# v1.7.2: koreksi sempit & terdokumentasi (patch-v1.7.2.json ubah_teks): {hewan} diusir_orang_orangan = monyet/rubah, bukan babi hutan/serigala malam;
# hari_jadi_ringkasan.log[0] tidak diawali 'Hari '. Hanya path ini yang boleh berubah; nilai lama dicatat agar koreksi wajib terpasang.
KOREKSI_V172 = {
    "/log_ancaman/diusir_orang_orangan[1]": "Baju orang-orangan sawah berkibar di bawah cahaya bulan. Seekor {hewan} yang mengendap-endap berbalik pergi.",
    "/log_ancaman/diusir_orang_orangan[2]": "Bayangan orang-orangan sawah di tepi ladang membuat {hewan} ragu. Tanaman selamat malam ini.",
    "/meta/catatan_v170/bentuk/log_ancaman.diusir_orang_orangan": "array variasi; {hewan} = TERMS.hewan (babi hutan / serigala), selalu didahului 'Seekor' atau di tengah kalimat",
    "/hari_jadi_ringkasan/log[0]": "Hari Jadi Desa ke-{tahun}! Setahun ini {lahir} bayi lahir, {pendatang} pendatang tiba, {bangunan} bangunan berdiri, dan {tahap} tahap monumen rampung."}
_ubah = [p for p in teks_diubah if p not in KOREKSI_V172]
if _ubah: err.append(f"v1.7.1 hanya penambahan (+ koreksi v1.7.2 terdaftar), tetapi {len(_ubah)} teks v1.7.0 berubah, mis. {_ubah[:3]}")
for k in old170:
    if list(new).index(k) != list(old170).index(k): err.append(f"urutan key top-level v1.7.0 berubah: {k}")
if "catatan_v171" not in m: err.append("meta.catatan_v171 hilang")
for k in ("{lahir}", "{pendatang}", "{hari2}"):
    if k not in m["placeholder"]: err.append(f"placeholder v1.7.1 tidak terdaftar: {k}")
# ringkasan Hari Jadi: key & placeholder persis seperti HJ(k, extra) di game.js (cadangan bila tidak terbaca)
HJ_PH = {"log": ("hari", "tahun", "lahir", "pendatang", "bangunan", "tahap"), "judul": ("tahun",), "rentang": ("hari", "hari2"), "statistik": (),
         "penduduk": (), "lahir": (), "pendatang": (), "wafat": (), "pergi": (), "bangunan": (), "pangan_masuk": (), "pangan_keluar": (), "keinginan": (),
         "kejadian": (), "target": ("jumlah", "jumlah2"), "piagam": (), "tanpa_piagam": ("jumlah",), "gelar": (), "monumen": (), "tahap_tahun_ini": (), "tutup": ()}
# bangunan lokal yang namanya dibaca game.js tujuanNames(): BUILDINGS id -> bangunan_lokal.<key>.nama
BANGUNAN_LOKAL_KODE = {"orang_orangan": "orang_orangan_sawah", "kandang_ayam": "kandang_ayam"}
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read(); _b = open(ROOT + "balance.js", encoding="utf-8").read()
    _f = re.search(r"function hariJadiHTML\(R\)(.*?)\n(?:function|//)", _g, re.S).group(1) + re.search(r"function hariJadiDaily\(\)(.*?)\n(?:function|//)", _g, re.S).group(1) + re.search(r"function showHariJadi\(\)(.*?)\n(?:function|//)", _g, re.S).group(1)
    HJ_K = set(re.findall(r"HJ\('(\w+)'", _f)) | set(re.findall(r"row\('[^']*', '(\w+)'", _f))
    if HJ_K != set(HJ_PH): err.append(f"hari_jadi_ringkasan: key di game.js berubah: baru {sorted(HJ_K - set(HJ_PH))}, hilang {sorted(set(HJ_PH) - HJ_K)}")
    for k, ex in re.findall(r"HJ\('(\w+)', \{([^}]*)\}", _f):
        ph = set(re.findall(r"(\w+):", ex))
        if k in HJ_PH and ph != set(HJ_PH[k]): err.append(f"hari_jadi_ringkasan.{k}: extra di game.js {sorted(ph)} != daftar validator {sorted(HJ_PH[k])}")
    _ln = re.search(r"for \(const \[b, k\] of \[(.*?)\]\) \{ const n = \(\(t\.bangunan_lokal", _g)
    _lk = dict(re.findall(r"\['(\w+)', '(\w+)'\]", _ln.group(1))) if _ln else {}
    if _lk != BANGUNAN_LOKAL_KODE: err.append(f"bangunan lokal yang dibaca tujuanNames() berubah: {_lk}")
    _bd = re.search(r"BUILDINGS: \{(.*?)\n  \},", _b, re.S)
    _bid = set(re.findall(r"^\s{4}(\w+):\s*\{", _bd.group(1), re.M)) if _bd else set()
    _bid |= set(re.findall(r"CONFIG\.BUILDINGS\.(\w+)\s*=", open(ROOT + "tujuan.js", encoding="utf-8").read()))  # bangunan P1 ditambah di tujuan.js
    if _bid and set(BANGUNAN_LOKAL_KODE) - _bid: err.append(f"id bangunan tidak ada di C.BUILDINGS: {sorted(set(BANGUNAN_LOKAL_KODE) - _bid)}")
    for k in ("pangan.kandang.siap", "pangan.kandang.ayam"):
        if f"TX('{k}'" not in _g: sed_warn.append(f"v1.7.1: {k} tidak lagi ditemukan di game.js")
except Exception as e: sed_warn.append(f"game.js/balance.js tidak terbaca untuk cek v1.7.1 ({e}); memakai daftar bawaan")
def cek_v171(T, sumber):
    hj = T.get("hari_jadi_ringkasan")
    if not isinstance(hj, dict): err.append(f"{sumber}hari_jadi_ringkasan hilang"); hj = {}
    for k, ph in HJ_PH.items():
        v = hj.get(k)
        if k == "log":
            if not (isinstance(v, list) and 1 <= len(v) <= 4): err.append(f"{sumber}hari_jadi_ringkasan.log harus array 1-4 variasi"); continue
        elif not isinstance(v, str): err.append(f"{sumber}hari_jadi_ringkasan.{k} harus string"); continue
        for x in (v if isinstance(v, list) else [v]):
            cek_teks(x, "hari_jadi_ringkasan." + k, sumber, ph, False)
            if "<" in x: err.append(f"{sumber}hari_jadi_ringkasan.{k}: tanpa '<' (innerHTML)")
            for w in ph:
                if w != "hari" or k == "rentang":
                    if "{" + w + "}" not in x: err.append(f"{sumber}hari_jadi_ringkasan.{k} harus memakai {{{w}}}")
    for path, bt, ph, wajib in (("pangan.sumber.telur", "str", (), ()), ("pangan.tugas.telur.nama", "str", (), ()),
                                ("pangan.tugas.telur.log", "list", ("nama", "jumlah"), ("jumlah",)),
                                ("pangan.kandang.siap", "str", (), ()), ("pangan.kandang.ayam", "str", ("jumlah",), ("jumlah",))) + tuple(
                               (f"bangunan_lokal.{b}.nama", "str", (), ()) for b in BANGUNAN_LOKAL_KODE.values()):
        v = ambil(T, path)
        if bt == "str" and not (isinstance(v, str) and v.strip()): err.append(f"{sumber}{path} harus string"); continue
        if bt == "list" and not (isinstance(v, list) and 2 <= len(v) <= 4): err.append(f"{sumber}{path} harus array 2-4 variasi"); continue
        for x in (v if isinstance(v, list) else [v]):
            cek_teks(x, path, sumber, ph, False)
            for w in wajib:
                if "{" + w + "}" not in x: err.append(f"{sumber}{path} harus memakai {{{w}}}")
cek_v171(new, "")
cek_v171(sd, "sedang:")
# tema sedang: overlay WAJIB menulis bangunan_lokal kedua nama (game.js: ov.bangunan_lokal ada -> __localNames, nama Nusantara tak boleh bocor)
for b in BANGUNAN_LOKAL_KODE.values():
    if not isinstance(ambil(ov, f"bangunan_lokal.{b}.nama"), str): sed_err.append(f"overlay sedang tanpa bangunan_lokal.{b}.nama (nama Nusantara akan dipakai)")
for path in ("pangan.kandang.ayam", "pangan.tugas.telur"):
    if ambil(ov, path) is None: sed_err.append(f"overlay sedang tanpa {path} (teks Nusantara akan dipakai)")
KHAS_V171 = KHAS_TUJUAN + ["ayam kampung", "caping", "pipit"]
RX171 = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(set(KHAS_V171), key=len, reverse=True)) + r")(?![\w-])", re.I)
for path in ["pangan.sumber.telur", "pangan.tugas.telur", "pangan.kandang", "hari_jadi_ringkasan"] + [f"bangunan_lokal.{b}" for b in BANGUNAN_LOKAL_KODE.values()]:
    o = []
    def _s(x, p):
        if isinstance(x, str): o.extend((p, h.group(1)) for h in RX171.finditer(x))
        elif isinstance(x, dict): [_s(v, f"{p}/{k}") for k, v in x.items() if not k.startswith("_") and k not in SKIP_T]
        elif isinstance(x, list): [_s(v, f"{p}[{i}]") for i, v in enumerate(x)]
    _s(ambil(sd, path), path)
    if o: sed_err.append(f"kata khas Indonesia di tema sedang: {path}: " + ", ".join(f"'{w}' @ {p}" for p, w in o[:3]))
    cek_ph(ambil(sd, path), ambil(new, path), path); walk_s(ambil(sd, path), path)
# ---------- v1.7.2: orang-orangan (3019d47) — tooltip_ancaman, teks melayang, koreksi hewan diusir_orang_orangan, aturan awalan 'Hari ' ----------
old171 = json.load(open(ROOT + "tools/TEKS-GAME.v1.7.1.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old171, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.7.1:")
_ubah = [p for p in teks_diubah if p not in KOREKSI_V172]
if _ubah: err.append(f"v1.7.2 hanya penambahan + koreksi terdaftar, tetapi {len(_ubah)} teks v1.7.1 lain berubah, mis. {_ubah[:3]}")
for k in old171:
    if list(new).index(k) != list(old171).index(k): err.append(f"urutan key top-level v1.7.1 berubah: {k}")
if "catatan_v172" not in m: err.append("meta.catatan_v172 hilang")
for k in ("{pencuri}", "{pagar}"):
    if k not in m["placeholder"]: err.append(f"placeholder v1.7.2 tidak terdaftar: {k}")
# koreksi harus benar-benar terpasang (bukan sekadar diizinkan)
for p, lama in KOREKSI_V172.items():
    try: _v = eval("new" + "".join(f"[{int(x)}]" if x.isdigit() else f"[{x!r}]" for x in re.findall(r"[^/\[\]]+", p)))
    except Exception: _v = None
    if _v == lama: err.append(f"koreksi v1.7.2 belum diterapkan: {p}")
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read()
    _tt = re.search(r"TX\('bangunan_lokal\.orang_orangan_sawah\.tooltip_ancaman', \{([^}]*)\}", _g)
    _tt_ph = set(re.findall(r"(\w+)(?=[,:]|\s*$)", _tt.group(1))) if _tt else None
    if _tt_ph is not None and _tt_ph != {"hewan", "pagar", "pencuri"}: err.append(f"tooltip_ancaman: extra di game.js berubah: {sorted(_tt_ph)}")
    if "TX('dilema_ui.orang_orangan_teks_melayang', { hewan: cap1(hewan) }" not in _g: sed_warn.append("orang_orangan_teks_melayang: game.js tidak lagi cap1({hewan}); periksa aturan {hewan} di awal teks")
    if "scarecrowScare(M.hewan" not in _g: sed_warn.append("diusir_orang_orangan: {hewan} tidak lagi C.MONKEY.hewan (scarecrowScare); periksa teks hewan")
except Exception as e: sed_warn.append(f"game.js tidak terbaca untuk cek v1.7.2 ({e})")
def cek_v172(T, sumber, pencuri):
    v = ambil(T, "bangunan_lokal.orang_orangan_sawah.tooltip_ancaman")
    if not isinstance(v, str): err.append(f"{sumber}bangunan_lokal.orang_orangan_sawah.tooltip_ancaman harus string")
    else:
        cek_teks(v, "bangunan_lokal.orang_orangan_sawah.tooltip_ancaman", sumber, ("hewan", "pagar", "pencuri"), True)
        for w in ("hewan", "pagar", "pencuri"):
            if "{" + w + "}" not in v: err.append(f"{sumber}tooltip_ancaman harus memakai {{{w}}}")
        if '"' in v or "<" in v: err.append(f"{sumber}tooltip_ancaman: tanpa kutip ganda / '<' (atribut title)")
    v = ambil(T, "dilema_ui.orang_orangan_teks_melayang")
    if not (isinstance(v, str) or (isinstance(v, list) and 1 <= len(v) <= 4 and all(isinstance(x, str) for x in v))): err.append(f"{sumber}dilema_ui.orang_orangan_teks_melayang harus string / array 1-4"); v = []
    for x in (v if isinstance(v, list) else [v]):
        cek_teks(x, "dilema_ui.orang_orangan_teks_melayang", sumber, ("hewan",), False)
        if not x.startswith("{hewan}") or x.count("{hewan}") != 1: err.append(f"{sumber}orang_orangan_teks_melayang: {{hewan}} (sudah cap1) harus tepat sekali di awal: {x}")
        if len(x.replace("{hewan}", "babi hutan")) > 28: err.append(f"{sumber}orang_orangan_teks_melayang terlalu panjang untuk teks melayang: {x}")
    # orang-orangan hanya mengusir pencuri ladang (monyet / rubah): jangan sebut babi hutan / serigala sebagai yang diusir
    for path in ("log_ancaman.diusir_orang_orangan", "bangunan_lokal.orang_orangan_sawah.tooltip", "dilema_ui.orang_orangan_berdiri", "dilema_ui.orang_orangan_teks_melayang"):
        for x in (lambda y: y if isinstance(y, list) else [y])(ambil(T, path)):
            if isinstance(x, str) and re.search(r"babi|serigala|cahaya bulan|malam ini|mengendap", x, re.I): err.append(f"{sumber}{path}: orang-orangan hanya mengusir {pencuri} (bukan babi hutan/serigala, bukan malam): {x}")
        for x in (lambda y: y if isinstance(y, list) else [y])(ambil(T, path)):
            if isinstance(x, str) and path == "bangunan_lokal.orang_orangan_sawah.tooltip" and pencuri not in x.lower(): err.append(f"{sumber}{path} harus menyebut {pencuri}")
cek_v172(new, "", "monyet")
cek_v172(sd, "sedang:", "rubah")
for path in ("bangunan_lokal.orang_orangan_sawah.tooltip_ancaman", "dilema_ui.orang_orangan_teks_melayang"):
    o = []; scan_t(ambil(sd, path), path, o)
    if o: sed_err.append(f"kata khas Indonesia di tema sedang: {path}: " + ", ".join(f"'{w}' @ {p}" for p, w in o[:3]))
    cek_ph(ambil(sd, path), ambil(new, path), path); walk_s(ambil(sd, path), path)
# aturan awalan log: log() sudah menulis 'Hari X:' -> teks baru (path yang belum ada di v1.6.1, yaitu sejak v1.7.0) & teks koreksi tidak boleh diawali 'Hari ',
# kecuali label (bukan log). Teks lama 'Hari {hari}:' dibiarkan (fill() membuangnya); awalan 'Hari <angka>' tidak pernah boleh (tidak dibuang).
LABEL_HARI_OK = {"/hari_jadi_ringkasan/rentang", "/hari_jadi_ringkasan/judul"}
def ada_di(T, p):
    o = T
    for x in re.findall(r"[^/\[\]]+", p):
        if isinstance(o, list) and x.isdigit() and int(x) < len(o): o = o[int(x)]
        elif isinstance(o, dict) and x in o: o = o[x]
        else: return False
    return True
hari_baru, hari_lama = [], []
def cek_hari(x, p, base, sumber):
    if isinstance(x, str):
        if p.startswith("/meta/") or "/_" in p: return
        if re.match(r"Hari \d", x): err.append(f"{sumber}{p}: diawali 'Hari <angka>' (log() menambah awalan hari; tidak dibuang fill())")
        elif x.startswith("Hari ") and p not in LABEL_HARI_OK and (not ada_di(base, p) or p in KOREKSI_V172): hari_baru.append(sumber + p)
        elif x.startswith("Hari {hari}:"): hari_lama.append(sumber + p)
    elif isinstance(x, dict): [cek_hari(v, f"{p}/{k}", base, sumber) for k, v in x.items()]
    elif isinstance(x, list): [cek_hari(v, f"{p}[{i}]", base, sumber) for i, v in enumerate(x)]
cek_hari(new, "", old161, "")
_ov_baru = {k: v for k, v in ov.items() if not ada_di(old161, "/" + k) or k in ("dilema_ui", "log_ancaman", "pangan", "bangunan_lokal")}
for k, v in _ov_baru.items():  # overlay sedang: hanya teks di path yang baru di TEKS sejak v1.7.0
    def _sb(x, p):
        if isinstance(x, str):
            if x.startswith("Hari ") and p not in LABEL_HARI_OK and not ada_di(old161, p) and ada_di(new, p): hari_baru.append("sedang:" + p)
        elif isinstance(x, dict): [_sb(y, f"{p}/{kk}") for kk, y in x.items() if not kk.startswith("_")]
        elif isinstance(x, list): [_sb(y, f"{p}[{i}]") for i, y in enumerate(x)]
    _sb(ambil(sd, k), "/" + k)
for p in hari_baru: err.append(f"teks log baru/terkoreksi diawali 'Hari ' (log() sudah menambahkannya): {p}")
# ---------- v1.7.3: v10 (42d19ac) — otomatis.gubuk_tambahan, petunjuk.butuh_gubuk ({gubuk} = C.BUILDINGS.gubuk.nama) ----------
old172 = json.load(open(ROOT + "tools/TEKS-GAME.v1.7.2.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old172, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.7.2:")
if teks_diubah: err.append(f"v1.7.3 hanya penambahan, tetapi {len(teks_diubah)} teks v1.7.2 berubah, mis. {teks_diubah[:3]}")
for k in old172:
    if list(new).index(k) != list(old172).index(k): err.append(f"urutan key top-level v1.7.2 berubah: {k}")
if "catatan_v173" not in m: err.append("meta.catatan_v173 hilang")
if "{gubuk}" not in m["placeholder"]: err.append("placeholder {gubuk} (v1.7.3) tidak terdaftar")
# path -> (bentuk, placeholder yang diisi kode, wajib). petunjuk: STRING (questUI merender ulang; array akan berganti-ganti)
V173 = {"petunjuk.butuh_gubuk": ("str", ("gubuk",), ("gubuk",)), "otomatis.gubuk_tambahan": ("list", ("nama", "nama2", "gubuk"), ("gubuk",))}
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read()
    for path, (_, ph, _w) in V173.items():
        _x = re.search(r"TX\('" + re.escape(path) + r"', \{([^}]*)\}", _g)
        if not _x: sed_warn.append(f"v1.7.3: {path} tidak lagi ditemukan di game.js"); continue
        _k = set(re.findall(r"(\w+)\s*:", _x.group(1))) | ({"nama", "nama2"} if "...n" in _x.group(1) else set())
        if _k != set(ph): err.append(f"{path}: extra di game.js {sorted(_k)} != daftar validator {sorted(ph)}")
    if "gubuk: C.BUILDINGS.gubuk.nama" not in _g: sed_warn.append("{gubuk} tidak lagi C.BUILDINGS.gubuk.nama; periksa teks")
except Exception as e: sed_warn.append(f"game.js tidak terbaca untuk cek v1.7.3 ({e})")
def cek_v173(T, sumber):
    for path, (bt, ph, wajib) in V173.items():
        v = ambil(T, path)
        if bt == "str" and not isinstance(v, str): err.append(f"{sumber}{path} harus string (dirender ulang tiap frame)"); continue
        if bt == "list" and not (isinstance(v, list) and 2 <= len(v) <= 4): err.append(f"{sumber}{path} harus array 2-4 variasi"); continue
        for x in (v if isinstance(v, list) else [v]):
            cek_teks(x, path, sumber, ph, False)
            if x.startswith("Hari "): err.append(f"{sumber}{path} jangan diawali 'Hari ' (log() menambahkannya)")
            if "<" in x: err.append(f"{sumber}{path}: tanpa '<' (innerHTML)")
            for w in wajib:
                if "{" + w + "}" not in x: err.append(f"{sumber}{path} harus memakai {{{w}}}")
cek_v173(new, "")
cek_v173(sd, "sedang:")
RX173 = re.compile(r"(?<![\w-])(" + "|".join(re.escape(w) for w in sorted(set(KHAS_TUJUAN + ["gotong royong", "gotong-royong", "bergotong", "ilalang"]), key=len, reverse=True)) + r")(?![\w-])", re.I)
for path in V173:
    if ambil(ov, path) is None: sed_err.append(f"overlay sedang tanpa {path} (teks Nusantara akan dipakai)")
    for x in (lambda y: y if isinstance(y, list) else [y])(ambil(sd, path)):
        for h in (RX173.finditer(x) if isinstance(x, str) else []): sed_err.append(f"kata khas Indonesia di tema sedang: {path}: '{h.group(1)}'")
    cek_ph(ambil(sd, path), ambil(new, path), path); walk_s(ambil(sd, path), path)
# ---------- v1.7.4: v11 (00d3959) — bangun_kategori (C.BUILD_CATS + alasan terkunci), peta_kejadian ----------
old173 = json.load(open(ROOT + "tools/TEKS-GAME.v1.7.3.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old173, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.7.3:")
if teks_diubah: err.append(f"v1.7.4 hanya penambahan, tetapi {len(teks_diubah)} teks v1.7.3 berubah, mis. {teks_diubah[:3]}")
for k in old173:
    if list(new).index(k) != list(old173).index(k): err.append(f"urutan key top-level v1.7.3 berubah: {k}")
if "catatan_v174" not in m: err.append("meta.catatan_v174 hilang")
for k in ("{era}", "{riset}"):
    if k not in m["placeholder"]: err.append(f"placeholder {k} (v1.7.4) tidak terdaftar")
KATEGORI = ["tempat_tinggal", "pangan", "bahan_produksi", "keamanan", "lainnya"]  # = C.BUILD_CATS id (balance.js 00d3959)
# path -> placeholder persis seperti extra di game.js
V174 = {**{f"bangun_kategori.{k}": () for k in KATEGORI}, "bangun_kategori.terkunci_era": ("era",), "bangun_kategori.terkunci_riset": ("riset",),
        "bangun_kategori.monumen_tujuan": (), "peta_kejadian.pangan": (), "peta_kejadian.kesehatan": (), "peta_kejadian.kondisi": (), "peta_kejadian.lihat_lokasi": ()}
TITLE |= {p for p in V174 if p.startswith("bangun_kategori.")} | {"peta_kejadian.lihat_lokasi"}
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read(); _b = open(ROOT + "balance.js", encoding="utf-8").read()
    _bc = re.search(r"BUILD_CATS: \[(.*?)\n  \],", _b, re.S)
    _ids = re.findall(r"id: '(\w+)'", _bc.group(1)) if _bc else []
    if _ids and _ids != KATEGORI: err.append(f"bangun_kategori: id C.BUILD_CATS berubah: {_ids}")
    if "TX('bangun_kategori.' + c.id" not in _g: sed_warn.append("bangun_kategori.<id> tidak lagi dibaca buildCatLabel()")
    for path, ph in V174.items():
        if path.startswith("bangun_kategori.") and path.split(".")[1] in KATEGORI: continue
        _x = re.search(r"TX\('" + re.escape(path) + r"', \{([^}]*)\}", _g)
        if not _x: sed_warn.append(f"v1.7.4: {path} tidak lagi ditemukan di game.js"); continue
        _k = set(re.findall(r"(?:^|,)\s*(\w+)\s*:", _x.group(1)))  # key objek saja (bukan "e.nama :" di ternary)
        if _k != set(ph): err.append(f"{path}: extra di game.js {sorted(_k)} != daftar validator {sorted(ph)}")
except Exception as e: sed_warn.append(f"game.js/balance.js tidak terbaca untuk cek v1.7.4 ({e})")
def cek_v174(T, sumber):
    for path, ph in V174.items():
        v = ambil(T, path)
        if not (isinstance(v, str) and v.strip()): err.append(f"{sumber}{path} harus string (label UI)"); continue
        cek_teks(v, path, sumber, ph, path in TITLE)
        for w in ph:
            if "{" + w + "}" not in v: err.append(f"{sumber}{path} harus memakai {{{w}}}")
        if '"' in v or "<" in v: err.append(f"{sumber}{path}: tanpa kutip ganda / '<' (title/innerHTML tanpa escape)")
        if re.search(r"&(?!\s)", v): err.append(f"{sumber}{path}: '&' harus polos & diikuti spasi (tanpa entitas seperti &amp;; teks juga dipakai di luar HTML)")
        if v.startswith("Hari "): err.append(f"{sumber}{path} jangan diawali 'Hari '")
        if path.startswith("peta_kejadian.") and path != "peta_kejadian.lihat_lokasi" and len(v) > 16: err.append(f"{sumber}{path} terlalu panjang untuk teks melayang: {v}")
    v = ambil(T, "bangun_kategori.monumen_tujuan")
    if isinstance(v, str) and not ("monumen" in v.lower() and "Tujuan" in v): err.append(f"{sumber}bangun_kategori.monumen_tujuan harus memuat 'monumen' (goalLabel) & 'Tujuan' (nama panel)")
cek_v174(new, "")
cek_v174(sd, "sedang:")
for sec in ("bangun_kategori", "peta_kejadian"):
    o = []; scan_t(ambil(sd, sec), sec, o)
    if o: sed_err.append(f"kata khas Indonesia di tema sedang: {sec}: " + ", ".join(f"'{w}' @ {p}" for p, w in o[:3]))
    cek_ph(ambil(sd, sec), ambil(new, sec), sec); walk_s(ambil(sd, sec), sec)
# ---------- v1.7.5: v12 (6ff5e7c) — angin.kencang_rusak {bangunan} {jumlah}, angin.atap_bertahan ----------
old174 = json.load(open(ROOT + "tools/TEKS-GAME.v1.7.4.json", encoding="utf-8"))
teks_diubah.clear(); _n = len(err); sub(old174, new, "")
if len(err) > _n: err.insert(_n, "^ perbedaan struktur/angka terhadap v1.7.4:")
if teks_diubah: err.append(f"v1.7.5 hanya penambahan, tetapi {len(teks_diubah)} teks v1.7.4 berubah, mis. {teks_diubah[:3]}")
for k in old174:
    if list(new).index(k) != list(old174).index(k): err.append(f"urutan key top-level v1.7.4 berubah: {k}")
if "catatan_v175" not in m: err.append("meta.catatan_v175 hilang")
# path -> (placeholder persis seperti extra di game.js, wajib)
V175 = {"angin.kencang_rusak": (("bangunan", "jumlah"), ("bangunan", "jumlah")), "angin.atap_bertahan": ((), ())}
try:
    _g = open(ROOT + "game.js", encoding="utf-8").read()
    _ak = set(re.findall(r"TX\('angin\.(\w+)'", _g))
    if _ak - {p.split(".")[1] for p in V175}: err.append(f"angin: key baru di game.js belum ada di daftar validator: {sorted(_ak - {p.split('.')[1] for p in V175})}")
    for path, (ph, _w) in V175.items():
        _x = re.search(r"TX\('" + re.escape(path) + r"', \{([^}]*)\}", _g)
        if not _x: sed_warn.append(f"v1.7.5: {path} tidak lagi ditemukan di game.js"); continue
        _k = set(re.findall(r"(?:^|,)\s*(\w+)\s*:", _x.group(1)))
        if _k != set(ph): err.append(f"{path}: extra di game.js {sorted(_k)} != daftar validator {sorted(ph)}")
except Exception as e: sed_warn.append(f"game.js tidak terbaca untuk cek v1.7.5 ({e})")
def cek_v175(T, sumber):
    for path, (ph, wajib) in V175.items():
        v = ambil(T, path)
        if not (isinstance(v, list) and 2 <= len(v) <= 4 and all(isinstance(x, str) for x in v)): err.append(f"{sumber}{path} harus array 2-4 variasi (log lewat TX)"); continue
        for x in v:
            cek_teks(x, path, sumber, ph, False)
            if x.startswith("Hari "): err.append(f"{sumber}{path} jangan diawali 'Hari ' (log() menambahkannya)")
            if "<" in x: err.append(f"{sumber}{path}: tanpa '<'")
            for w in wajib:
                if "{" + w + "}" not in x: err.append(f"{sumber}{path} harus memakai {{{w}}}")
cek_v175(new, "")
cek_v175(sd, "sedang:")
if ambil(ov, "angin") is None: sed_err.append("overlay sedang tanpa angin (teks Nusantara akan dipakai)")
o = []; scan_t(ambil(sd, "angin"), "angin", o)
for x in sum((ambil(sd, p) or [] for p in V175), []):
    for w in ("ijuk", "mareng", "labuh", "bambu", "rumbia", "ilalang"):
        if re.search(r"(?<![\w-])" + w + r"(?![\w-])", x, re.I): o.append(("angin", w))
if o: sed_err.append("kata khas Indonesia di tema sedang: angin: " + ", ".join(f"'{w}' @ {p}" for p, w in o[:3]))
cek_ph(ambil(sd, "angin"), ambil(new, "angin"), "angin"); walk_s(ambil(sd, "angin"), "angin")
err += sed_err
# kata terlarang di SEMUA teks tampilan (bukan key, bukan string id, bukan meta teknis)
META_TAMPIL = ("sumber_daya", "bangunan", "musim", "era", "hewan", "penyebab_kondisi", "bangunan_pertahanan", "tahap_usia", "status_hubungan",
               "cabang_teknologi", "skill", "kebutuhan", "milestone_anak", "judul_game", "nuansa")
KT = m.get("kata_terlarang", [])
for w in ("salju", "es", "beku", "musim dingin", "serigala", "perapian", "harimau"):
    if w not in KT: err.append(f"kata_terlarang harus memuat '{w}'")
RX = re.compile(r"\b(" + "|".join(re.escape(w) for w in sorted(KT, key=len, reverse=True)) + r")\b", re.I) if KT else None
kt_hit = []
def tampil(x, p, idk=False):
    if isinstance(x, str):
        if not idk and RX and RX.search(x): kt_hit.append(f"'{RX.search(x).group(0)}' @ {p}")
    elif isinstance(x, dict):
        for k, v in x.items():
            if not k.startswith("_"): tampil(v, f"{p}/{k}", idk or (k in ID_KEYS and not (isinstance(v, list) and v and isinstance(v[0], dict))))
    elif isinstance(x, list): [tampil(v, f"{p}[{i}]", idk) for i, v in enumerate(x)]
for k, v in new.items():
    if k == "meta":
        for mk in META_TAMPIL:
            if mk in v: tampil(v[mk], f"meta/{mk}")
    else: tampil(v, k)
for h in kt_hit: err.append("kata terlarang di teks tampilan: " + h)
# placeholder di seluruh bagian baru
baru = [k for k in new if k not in old]
ph_ok = {k.strip("{}") for k in m["placeholder"]}
def walk(x, p):
    if isinstance(x, str):
        for k in re.findall(r"\{(\w+)\}", x):
            if k not in ph_ok: err.append(f"placeholder tak terdaftar {{{k}}} @ {p}")
    elif isinstance(x, dict): [walk(v, f"{p}/{k}") for k, v in x.items()]
    elif isinstance(x, list): [walk(v, f"{p}[{i}]") for i, v in enumerate(x)]
for k in baru: walk(new[k], k)
print("Bagian baru:", ", ".join(f"{k}={len(new[k])}" for k in baru))
print("Entri: teknologi", len(new["teknologi"]), "| pencapaian", len(aids), f"(rahasia {sum(1 for a in new['pencapaian'] if a.get('rahasia'))})",
      "| event_era_lanjut", len(new["event_era_lanjut"]), "| quest_lanjutan", len(new["quest_lanjutan"]),
      "| pesan_fluktuasi", len(new["pasar"]["pesan_fluktuasi"]))
if all(k in new for k in V12):
    print("v1.2.0: musim_pembuka", len(new["musim_pembuka"]), "| peringatan_dini", len(new["peringatan_dini"]),
          "| event_musiman", len(new["event_musiman"]), "| log_ancaman", len(new["log_ancaman"]), "kategori")
if all(k in new for k in V13):
    print("v1.3.0: " + " | ".join(f"{k} {sum(1 for _ in daftar(new[k]))} teks" for k in V13),
          f"| nama_bayi L{len(new['kelahiran']['nama_bayi']['laki_laki'])}/P{len(new['kelahiran']['nama_bayi']['perempuan'])}")
print(f"v1.4.0: teks tampilan diubah {len(diubah_v13)} (dibanding v1.3.0) | " + " | ".join(f"{k} {len(new[k])}" for k in V14 if k in new)
      + f" | alias event {len(al.get('event', {}))} | kata terlarang {len(KT)} kata, temuan {len(kt_hit)}")
if all(k in new for k in V15):
    _nt = sum(len(pl.get("tertunda", [])) for d in new["dilema"] for pl in d["pilihan"])
    print("v1.5.0: " + " | ".join(f"{k} {len(ids(new[k])) if isinstance(new[k], dict) else len(new[k])}" for k in ("sifat", "keinginan", "cerita", "momen_kecil"))
          + f" | monumen {len(SPEC_MONUMEN)} ({sum(SPEC_MONUMEN.values())} tahap) | lomba {len(ids(new['agustusan']['lomba']))} | dilema {len(new['dilema'])}"
          + f" ({sum(d['kelas']=='R' for d in new['dilema'])} R / {sum(d['kelas']=='B' for d in new['dilema'])} B), akibat tertunda {_nt}"
          + f" | pencapaian baru {len(aids) - 24} | teks v1.5 {sum(1 for k in V15 for _ in daftar(new[k]))}")
print(f"v1.5.1: key baru {len(V151)} ({', '.join(V151)})")
print(f"v1.6.0: pangan {len(V160)} key teks + daya_tarik.pendatang {len(new['pangan']['daya_tarik']['pendatang'])} variasi + tugas {len(TUGAS)} ({', '.join(TUGAS)}) | sumber {len(SUMBER)}, keluar {len(KELUAR)} | sedang: pangan {sum(1 for _ in daftar(ov.get('pangan', {})))} teks, tidak dipakai {len(SEDANG_TAK_DIPAKAI)}")
print(f"v1.6.1: otomatis {len(OTOMATIS)} ({', '.join(f'{k} {len(new['otomatis'][k])} variasi' for k in OTOMATIS)}) | pangan.keluar +10 | daya_tarik.bahagia_syarat, murung")
print(f"v1.7.0: key UI {len(V170)} | sedang tujuan: keinginan {len([k for k in ov.get('keinginan', {}) if not k.startswith('_')])}, monumen {len([k for k in ov.get('monumen', {}) if k != 'ui'])}, cerita {len(ov.get('cerita', {}))}, teladan/rencana_tahun {'ada' if 'teladan' in ov and 'rencana_tahun' in ov else 'BELUM'}")
print(f"tema sedang: TUJUAN_DISABLE bisa dicabut: {tujuan_cabut or '-'}" + (f" | masih perlu disable: {tujuan_tetap}" if tujuan_tetap else ""))
print(f"v1.7.1: pangan telur (sumber, tugas {len(new['pangan']['tugas']['telur']['log'])} log), kandang siap/ayam | hari_jadi_ringkasan {len(HJ_PH)} key | bangunan_lokal sedang: {', '.join(ambil(ov, f'bangunan_lokal.{b}.nama') or '-' for b in BANGUNAN_LOKAL_KODE.values())}")
print(f"v1.7.2: tooltip_ancaman, orang_orangan_teks_melayang {len(ambil(new, 'dilema_ui.orang_orangan_teks_melayang'))} variasi | koreksi {len(KOREKSI_V172)} path | teks lama berawalan 'Hari {{hari}}:' (dibuang fill()): {len(hari_lama)}")
print(f"v1.7.3: petunjuk.butuh_gubuk | otomatis.gubuk_tambahan {len(new['otomatis']['gubuk_tambahan'])} variasi (sedang {len(sd['otomatis']['gubuk_tambahan'])}) | placeholder {{gubuk}}")
print(f"v1.7.4: bangun_kategori {len(KATEGORI)} kategori + terkunci_era/terkunci_riset/monumen_tujuan | peta_kejadian 4 | placeholder {{era}} {{riset}}")
print(f"v1.7.5: angin.kencang_rusak {len(new['angin']['kencang_rusak'])} variasi, angin.atap_bertahan {len(new['angin']['atap_bertahan'])} variasi (sedang {len(sd['angin']['kencang_rusak'])}/{len(sd['angin']['atap_bertahan'])})")
print(f"tema sedang: overlay {len([k for k in ov if not k.startswith('_')])} bagian | cerita: dilema {len(ov.get('dilema', {}).get('__byId', []))}, momen {len([k for k in ov.get('momen_kecil', {}) if not k.startswith('_')])}, "
      f"lomba {len(ov.get('agustusan', {}).get('lomba', {}))} | kata khas Indonesia di cerita aktif: {sum(len(v) for k, v in kena.items() if k in aktif)}")
print(f"tema sedang: STORY_DISABLE bisa dicabut: {bisa_cabut or '-'}" + (f" | masih perlu disable: {tetap}" if tetap else "") + f" | STORY_PATCH enabled:false bisa dicabut: {patch_cabut or '-'}")
for w in sed_warn: print(" peringatan:", w)
if err: print("GAGAL:"); [print(" -", e) for e in err]; sys.exit(1)
print("OK: JSON valid, struktur/id/angka lama utuh (TUNING_V10 + 14 retuning, v1.0-v1.7.4), overlay sedang bersih, kata terlarang bersih, semua efek/tipe/target/placeholder terdaftar.")
