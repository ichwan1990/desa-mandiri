# Ikon sementara padi (32x32, pixel art 16x16 x2) sampai Asisten Desain membuat ikon resmi.
# Jalankan: python3 tools/buat_ikon_padi.py -> assets/icons/resources/icon_padi.png
from PIL import Image
G = (214, 170, 52, 255); GD = (160, 115, 30, 255); GL = (240, 210, 100, 255)
S = (120, 140, 50, 255); B = (120, 72, 36, 255); O = (60, 40, 20, 255)
px = {}
def put(x, y, c): px[(x, y)] = c
# tangkai (3 batang menyatu di bawah)
for y in range(8, 15): put(7, y, S); put(8, y, S)
for y, x in [(8, 5), (9, 5), (10, 6), (11, 6), (12, 7)]: put(x, y, S)
for y, x in [(8, 10), (9, 10), (10, 9), (11, 9), (12, 8)]: put(x, y, S)
# ikatan
for x in range(6, 10): put(x, 12, B)
# malai merunduk (bulir)
heads = [[(4, 7), (3, 6), (3, 5), (2, 4), (2, 3), (3, 2)], [(7, 7), (7, 6), (8, 5), (8, 4), (9, 3), (9, 2), (10, 1)], [(11, 7), (12, 6), (12, 5), (13, 4), (13, 3), (12, 2)]]
for h in heads:
    for i, (x, y) in enumerate(h):
        put(x, y, GL if i % 2 else G)
        put(x + (1 if x < 8 else -1), y, GD)
im = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
for (x, y), c in px.items(): im.putpixel((x, y), c)
# garis luar gelap
out = im.copy()
for y in range(16):
    for x in range(16):
        if im.getpixel((x, y))[3] == 0 and any(0 <= x + dx < 16 and 0 <= y + dy < 16 and im.getpixel((x + dx, y + dy))[3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
            out.putpixel((x, y), O)
out.resize((32, 32), Image.NEAREST).save('assets/icons/resources/icon_padi.png')
print('ok')
