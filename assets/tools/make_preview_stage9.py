#!/usr/bin/env python3
"""preview_stage9.png: grid aset tahap 9 + scene tepi sungai (memancing, kolam, tambak, pohon buah + jamur, umbi, sawah + keong, bakul)."""
import os, json
from PIL import Image, ImageDraw, ImageFont
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); BG=(196,190,184,255)
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA'); F=ImageFont.load_default()
man=json.load(open(os.path.join(ROOT,'manifest.json')))
fs=[f['file'] for f in man['files'] if f.get('stage')==9]
WW=1600; x=y=10; rowh=0; pl=[]
for f in fs:
    im=L(f); s=2 if im.width>=128 else 3; im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>WW-10: x=10; y+=rowh+10; rowh=0
    pl.append((im,(x,y))); x+=im.width+10; rowh=max(rowh,im.height)
y+=rowh+20
W,H=20,11; sc=Image.new('RGBA',(W*32,H*32)); g=L('tiles/grass.png'); wa=L('tiles/water_anim.png').crop((0,0,32,32)); sand=L('tiles/sand.png')
saw=L('tiles/tropis/sawah_autotile.png')
for ty in range(H):
    for tx in range(W):
        t=g
        if ty in(4,5) and tx<12: t=wa
        if tx in(10,11) and ty>=4: t=wa
        sc.paste(t,(tx*32,ty*32))
for ty in range(7,10):
    for tx in range(14,18):
        m=(1 if ty>7 else 0)+(2 if tx<17 else 0)+(4 if ty<9 else 0)+(8 if tx>14 else 0)
        sc.paste(saw.crop(((m%4)*32,(m//4)*32,(m%4)*32+32,(m//4)*32+32)),(tx*32,ty*32))
def put(f,X,Y,crop=None):
    im=L(f); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(X,Y-im.height))
cp=L('nature/crops/crop_padi.png').crop((96,0,128,32))
for ty in range(7,10):
    for tx in range(14,18): sc.alpha_composite(cp,(tx*32,ty*32))
kg=L('characters/fauna/ambient/keong_sawah.png').crop((0,0,32,32)); sc.alpha_composite(kg,(15*32,8*32)); sc.alpha_composite(L('characters/fauna/ambient/telur_keong.png'),(16*32,7*32))
# memancing: menghadap bawah (tepi atas sungai), atas (tepi bawah), kiri/kanan (tepi sungai vertikal)
for v,(tx,ty,row) in zip((1,2,3,4),((3,3,0),(6,6,3),(12,8,1),(9,8,2))):
    fr=L(f'characters/villager_{v}_memancing.png').crop((2*64 if v%2 else 6*64,row*64,(2*64 if v%2 else 6*64)+64,row*64+64)); sc.alpha_composite(fr,(tx*32-16,ty*32-16))
for i,(t,X) in enumerate((('tree_pisang',20),('tree_kelapa_empty',70),('tree_mangga',120),('tree_rambutan_empty',190))): put(f'nature/tropis/{t}.png',X,128)
for f,X,Y in(('jamur_payung_banyak',40,130),('jamur_kancing_banyak',140,132),('jamur_tiram_banyak',230,130),('jamur_kuping_sedikit',260,110)): put(f'nature/tropis/{f}.png',X,Y)
put('nature/tropis/umbi_hutan.png',300,124); put('nature/tropis/umbi_hutan_digali.png',332,124)
put('buildings/tropis/kolam_ikan.png',32,340,(0,0,64,64)); put('buildings/tropis/tambak.png',128,350,(0,0,96,64))
for i,b in enumerate(('kosong','jamur','buah','ikan','umbi','keong')): put(f'decor/pangan/bakul_{b}.png',400+i*34,128)
put('characters/visitors/../villager_2.png',560,250,(0,192,32,224)) if False else None
v=L('characters/villager_2.png').crop((0,0,32,32)); sc.alpha_composite(v,(460,200)); sc.alpha_composite(L('icons/status/icon_pendatang_16.png'),(476,188))
sc.alpha_composite(L('buildings/hut.png') if os.path.exists(os.path.join(ROOT,'buildings/hut.png')) else Image.new('RGBA',(1,1)),(520,170)); sc.alpha_composite(L('icons/status/icon_daya_tarik_16.png'),(536,160))
out=Image.new('RGBA',(WW,y+H*64+40),BG)
for im,p_ in pl: out.alpha_composite(im,p_)
out.alpha_composite(sc.resize((W*64,H*64),Image.NEAREST),(10,y))
out.save(os.path.join(ROOT,'preview_stage9.png')); print(out.size)
