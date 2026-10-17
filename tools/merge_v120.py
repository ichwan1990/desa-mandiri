"""Gabungkan tools/patch-v1.2.0.json ke TEKS-GAME.json secara aditif (alternatif dari buat_teks.py).
- Hanya menambah: key top-level baru, entri baru di dict meta yang sudah ada, key meta baru; lalu set meta.versi.
- Gagal (tanpa menulis apa pun) jika versi sumber bukan versi_dari, atau key/entri baru sudah ada dengan nilai berbeda.
- Sebelum menulis, backup ke tools/TEKS-GAME.v<versi_lama>.json (tidak menimpa backup yang sudah ada).
Pakai: python3 tools/merge_v120.py [--dry-run] [--masuk PATH] [--keluar PATH]
Catatan: buat_teks.py sudah menerapkan patch yang sama; jangan jalankan keduanya berurutan pada file yang sama
(skrip ini akan menolak karena versi sudah 1.2.0)."""
import argparse, copy, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument("--masuk", default=os.path.join(ROOT, "TEKS-GAME.json"))
ap.add_argument("--keluar", default=None, help="default: sama dengan --masuk")
ap.add_argument("--patch", default=os.path.join(ROOT, "tools", "patch-v1.2.0.json"))
ap.add_argument("--dry-run", action="store_true")
a = ap.parse_args()
data = json.load(open(a.masuk, encoding="utf-8"))
patch = json.load(open(a.patch, encoding="utf-8"))
asli = copy.deepcopy(data)
m = data["meta"]; info = patch["_patch"]; masalah = []
if m.get("versi") != info["versi_dari"]: masalah.append(f"meta.versi {m.get('versi')} != {info['versi_dari']}")
for sec, ent in patch["tambah_entri_meta"].items():
    if not isinstance(m.get(sec), dict): masalah.append(f"meta.{sec} tidak ada / bukan dict"); continue
    for k, v in ent.items():
        if k in m[sec] and m[sec][k] != v: masalah.append(f"meta.{sec}.{k} sudah ada dengan nilai lain")
for k, v in patch["tambah_key_meta"].items():
    if k in m and m[k] != v: masalah.append(f"meta.{k} sudah ada dengan nilai lain")
for k, v in patch["tambah_key"].items():
    if k in data and data[k] != v: masalah.append(f"key {k} sudah ada dengan nilai lain")
if masalah: print("DIBATALKAN, tidak ada yang ditulis:"); [print(" -", x) for x in masalah]; sys.exit(1)
tambah = 0
for sec, ent in patch["tambah_entri_meta"].items():
    for k, v in ent.items():
        if k not in m[sec]: m[sec][k] = v; tambah += 1
for k, v in patch["tambah_key_meta"].items():
    if k not in m: m[k] = v; tambah += 1
for k, v in patch["tambah_key"].items():
    if k not in data: data[k] = v; tambah += 1
m.update(patch["set_meta"])
# jaminan: semua isi lama tetap sama
def sama(lama, baru, p=""):
    if isinstance(lama, dict):
        for k in lama:
            if p + "/" + k in ("/meta/versi",): continue
            sama(lama[k], baru[k], p + "/" + k)
    elif lama != baru: raise SystemExit(f"BUG: {p} berubah")
sama(asli, data)
print(f"{tambah} tambahan; versi {asli['meta']['versi']} -> {m['versi']}")
if a.dry_run: print("dry-run: tidak menulis."); sys.exit(0)
bak = os.path.join(ROOT, "tools", f"TEKS-GAME.v{asli['meta']['versi']}.json")
if not os.path.exists(bak): json.dump(asli, open(bak, "w", encoding="utf-8"), ensure_ascii=False, indent=2); print("backup:", bak)
out = a.keluar or a.masuk
with open(out, "w", encoding="utf-8") as f: json.dump(data, f, ensure_ascii=False, indent=2); f.write("\n")
print("ditulis:", out)
