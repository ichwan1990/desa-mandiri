#!/usr/bin/env python3
"""Server statis untuk Desa Mandiri (lokal/Windows/Linux/macOS).

`python -m http.server` hanya melayani satu permintaan sekaligus dengan antrean kecil, sehingga saat game memuat
~180 gambar sekaligus sebagian koneksi ditolak (ERR_CONNECTION_REFUSED) dan sprite jatuh ke placeholder.
Server ini memakai ThreadingHTTPServer dengan antrean besar.

Pakai:  python serve.py [port] [folder]      (bawaan: port 8095, folder = lokasi file ini)
        python serve.py --port 8095 --dir .
"""
import argparse, functools, os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".json": "application/json",
                      ".png": "image/png", ".css": "text/css", ".svg": "image/svg+xml", ".wasm": "application/wasm"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")  # selalu ambil versi terbaru saat pengembangan
        super().end_headers()

    def log_message(self, fmt, *args):  # hanya catat error agar konsol tidak banjir
        if len(args) > 1 and str(args[1])[:1] in "45":
            super().log_message(fmt, *args)


class Server(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    request_queue_size = 512  # bawaan socketserver hanya 5


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description="Server statis Desa Mandiri")
    ap.add_argument("port_pos", nargs="?", type=int, help="port (bawaan 8095)")
    ap.add_argument("dir_pos", nargs="?", help="folder yang dilayani (bawaan: folder serve.py)")
    ap.add_argument("--port", "-p", type=int, default=None)
    ap.add_argument("--dir", "-d", default=None)
    ap.add_argument("--host", default="127.0.0.1", help="pakai 0.0.0.0 agar bisa dibuka dari HP di jaringan yang sama")
    a = ap.parse_args()
    port = a.port or a.port_pos or int(os.environ.get("PORT", 8095))
    folder = os.path.abspath(a.dir or a.dir_pos or here)
    if not os.path.isdir(folder):
        sys.exit(f"Folder tidak ditemukan: {folder}")
    handler = functools.partial(Handler, directory=folder)
    try:
        httpd = Server((a.host, port), handler)
    except OSError as e:
        sys.exit(f"Tidak bisa membuka port {port} ({e}). Coba port lain: python serve.py 8096")
    print(f"Desa Mandiri: http://localhost:{port}/  (folder: {folder})  — Ctrl+C untuk berhenti")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer berhenti.")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
