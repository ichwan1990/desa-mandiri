"""Validasi TEKS-GAME.json v1.5.0 terhadap backup v1.0.0 (+allowlist tuning), v1.1.0, v1.2.0, v1.3.0, v1.4.0.
Sejak v1.4.0 (lokalisasi Indonesia) teks tampilan boleh berubah, tetapi semua key/struktur, semua angka/boolean, dan semua
string berjenis id (id, tipe, target, era, musim, prasyarat, event_terkait, ...) harus tetap sama; placeholder teks yang berubah
tidak boleh bertambah. Ditambah: cek kata terlarang (salju, serigala, harimau, ...) di semua teks tampilan, dan bagian baru v1.4/v1.5.
v1.5.0 (tokoh, cerita, tujuan) hanya menambah: bagian baru, entri meta, dan pencapaian A25-A32 (satu-satunya list lama yang boleh bertambah)."""
import json, re, sys
ROOT = "/workspace/village-game/"
new = json.load(open(ROOT + "TEKS-GAME.json", encoding="utf-8"))
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
if new["meta"]["versi"] != "1.5.0": err.append("meta.versi bukan 1.5.0")
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
    if ids(MK) != SPEC_MOMEN: err.append("momen_kecil != MOMEN_KECIL spec (12 id)")
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
        elif any(d["pilihan"][0]["efek"].get(f, 0) < -6 for f in PANGAN): err.append(f"{src} (B) opsi pertama terlalu mahal (pangan < -6)")
    kunci_t = [t["kunci"] for d in D5 for pl in d["pilihan"] for t in pl.get("tertunda", [])]
    asal = {}
    for d in D5:
        for pl in d["pilihan"]:
            for t in pl.get("tertunda", []):
                if asal.setdefault(t["kunci"], d["id"]) != d["id"]: err.append(f"kunci akibat tertunda {t['kunci']} dipakai dua dilema")
    for need in ("banjir_hulu", "kiriman_terima_kasih", "harga_beras_naik", "suap_bocor", "timbangan_curang"):
        if need not in kunci_t: err.append(f"akibat tertunda spec {need} hilang")
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
if err: print("GAGAL:"); [print(" -", e) for e in err]; sys.exit(1)
print("OK: JSON valid, struktur/id/angka lama utuh (TUNING_V10 + 14 retuning, v1.0-v1.4), kata terlarang bersih, semua efek/tipe/target/placeholder terdaftar.")
