"""Validasi TEKS-GAME.json v1.3.0 terhadap backup v1.0.0 (+allowlist tuning), v1.1.0 dan v1.2.0 (identik): JSON valid, entri lama tak berubah,
semua key efek, tipe/target tujuan, dan placeholder terdaftar di meta."""
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
# 1. entri lama tidak berubah (kecuali meta.versi); key lama tetap ada
def sub(a, b, p):
    if isinstance(a, dict):
        if not isinstance(b, dict): err.append(f"tipe berubah: {p}"); return
        for k in a:
            if k not in b: err.append(f"key hilang: {p}/{k}")
            elif p + "/" + k != "/meta/versi": sub(a[k], b[k], p + "/" + k)
    elif isinstance(a, list):
        if a != b: err.append(f"list berubah: {p}")
    elif a != b: err.append(f"nilai berubah: {p}")
sub(old, new, "")
if new["meta"]["versi"] != "1.3.0": err.append("meta.versi bukan 1.3.0")
for k in old:
    if list(new).index(k) != list(old).index(k): err.append(f"urutan key top-level berubah: {k}")
m = new["meta"]
efek_ok = set(m["sumber_daya"]) | {k for k in m["kunci_efek"] if not k.startswith("_")}
tipe_ok = set(m["tipe_tujuan_quest"])
tech_ids = [t["id"] for t in new["teknologi"]]
ev_ids = {e["id"] for e in new["event_acak"] + new["event_era_lanjut"] + new.get("event_musiman", [])}
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
          "pilih_event": tg in ev_ids, "alami_event": tg in ev_ids}.get(t, tg in khusus)
    if not ok: err.append(f"target {tg} tidak valid untuk {t} @ {src}")
    if not isinstance(g.get("jumlah"), int) or g["jumlah"] < 1: err.append(f"jumlah tidak valid @ {src}")
    if t == "pilih_event":
        e = next(e for e in new["event_acak"] + new["event_era_lanjut"] + new.get("event_musiman", []) if e["id"] == tg)
        if not 0 <= g.get("pilihan", -1) < len(e["pilihan"]): err.append(f"indeks pilihan salah @ {src}")
    if t == "beruntun_hari_pangan" and "ambang" not in g: err.append(f"ambang hilang @ {src}")
for i, e in enumerate(new["event_era_lanjut"]):
    if set(e) != {"id","judul","kategori","deskripsi","pilihan","era"}: err.append(f"struktur event {e['id']}")
    if e["era"] not in ("desa_pertanian","kota_kecil"): err.append(f"era event bukan 3-4: {e['id']}")
    for j, p in enumerate(e["pilihan"]):
        if set(p) != {"teks","efek","teks_hasil"}: err.append(f"struktur pilihan {e['id']}[{j}]")
        cek_efek(p["efek"], f"{e['id']}[{j}]")
    if any(v < 0 and k in m["sumber_daya"] for k, v in e["pilihan"][-1]["efek"].items()): err.append(f"pilihan terakhir berbiaya {e['id']}")
if len(ev_ids) != len(new["event_acak"]) + len(new["event_era_lanjut"]) + len(new.get("event_musiman", [])): err.append("id event duplikat")
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
# ---------- v1.2.0: entri v1.1.0 harus identik (mengunci 14 angka retuning 88f8d97) ----------
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
        if not k.startswith("musim_") or v["musim"] not in musim or len(v["variasi"]) < 2: err.append(f"musim_pembuka {k}")
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
    per_musim = {x: 0 for x in musim}
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
# ---------- v1.3.0: entri v1.2.0 harus identik ----------
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
if err: print("GAGAL:"); [print(" -", e) for e in err]; sys.exit(1)
print("OK: JSON valid, entri lama utuh, semua efek/tipe/target/placeholder terdaftar.")
