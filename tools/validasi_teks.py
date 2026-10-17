"""Validasi TEKS-GAME.json v1.1.0 terhadap backup v1.0.0: JSON valid, entri lama tak berubah,
semua key efek, tipe/target tujuan, dan placeholder terdaftar di meta."""
import json, re, sys
ROOT = "/workspace/village-game/"
new = json.load(open(ROOT + "TEKS-GAME.json", encoding="utf-8"))
old = json.load(open(ROOT + "tools/TEKS-GAME.v1.0.0.json", encoding="utf-8"))
err = []
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
if new["meta"]["versi"] != "1.1.0": err.append("meta.versi bukan 1.1.0")
for k in old:
    if list(new).index(k) != list(old).index(k): err.append(f"urutan key top-level berubah: {k}")
m = new["meta"]
efek_ok = set(m["sumber_daya"]) | {k for k in m["kunci_efek"] if not k.startswith("_")}
tipe_ok = set(m["tipe_tujuan_quest"])
tech_ids = [t["id"] for t in new["teknologi"]]
ev_ids = {e["id"] for e in new["event_acak"] + new["event_era_lanjut"]}
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
        e = next(e for e in new["event_acak"] + new["event_era_lanjut"] if e["id"] == tg)
        if not 0 <= g.get("pilihan", -1) < len(e["pilihan"]): err.append(f"indeks pilihan salah @ {src}")
    if t == "beruntun_hari_pangan" and "ambang" not in g: err.append(f"ambang hilang @ {src}")
for i, e in enumerate(new["event_era_lanjut"]):
    if set(e) != {"id","judul","kategori","deskripsi","pilihan","era"}: err.append(f"struktur event {e['id']}")
    if e["era"] not in ("desa_pertanian","kota_kecil"): err.append(f"era event bukan 3-4: {e['id']}")
    for j, p in enumerate(e["pilihan"]):
        if set(p) != {"teks","efek","teks_hasil"}: err.append(f"struktur pilihan {e['id']}[{j}]")
        cek_efek(p["efek"], f"{e['id']}[{j}]")
    if any(v < 0 and k in m["sumber_daya"] for k, v in e["pilihan"][-1]["efek"].items()): err.append(f"pilihan terakhir berbiaya {e['id']}")
if len(ev_ids) != len(new["event_acak"]) + len(new["event_era_lanjut"]): err.append("id event duplikat")
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
if err: print("GAGAL:"); [print(" -", e) for e in err]; sys.exit(1)
print("OK: JSON valid, entri lama utuh, semua efek/tipe/target/placeholder terdaftar.")
