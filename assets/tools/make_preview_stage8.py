#!/usr/bin/env python3
"""preview_stage8.png: aset tahap 8 (3x/2x) + scene 17 Agustus + mock panel dilema."""
import os, json
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
fs=[f['file'] for f in man['files'] if f.get('stage')==8 and not f['file'].endswith('_16.png')]
WW=1800; x=y=10; rowh=0; pl=[]; ims=[]
for f in fs:
    im=L(f); s=2 if im.width>=128 or im.height>=128 else 3; im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>WW-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); ims.append(im); x+=im.width+12; rowh=max(rowh,im.height)
y+=rowh+20
def nine(img,w,h,m):
    out=Image.new('RGBA',(w,h)); W,H=img.size
    for sx0,sx1,dx0,dx1 in((0,m,0,m),(m,W-m,m,w-m),(W-m,W,w-m,w)):
        for sy0,sy1,dy0,dy1 in((0,m,0,m),(m,H-m,m,h-m),(H-m,H,h-m,h)):
            out.paste(img.crop((sx0,sy0,sx1,sy1)).resize((dx1-dx0,dy1-dy0),Image.NEAREST),(dx0,dy0))
    return out
sc=Image.new('RGBA',(640,320)); g=L('seasons/tropis/labuh/grass_labuh.png'); p=L('tiles/dirt.png')
for ty in range(10):
    for tx in range(20): sc.paste(p if ty in(6,7) else g,(tx*32,ty*32))
def put(f,tx,ty,crop=None,dx=0,dy=0):
    im=L(f); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(tx*32+dx,ty*32+32-im.height+dy))
put('buildings/monuments/balai_desa_megah.png',1,4); put('buildings/monuments/langgar.png',15,3); put('buildings/monuments/masjid_stages.png',16,9,(256,0,384,128))
put('decor/agustus/gapura_agustus.png',8,7); put('decor/agustus/panjat_pinang.png',12,5)
for i,tx in enumerate((6,11,14)): put('decor/agustus/bendera_merah_putih.png',tx,4,((i%4)*32,0,(i%4)*32+32,96))
for tx in(0,5): put('decor/agustus/umbul_umbul.png',tx,8,(32,0,64,96))
for tx in range(5,20): sc.alpha_composite(L('decor/agustus/bunting_merah_putih.png').crop((0,0,32,16)),(tx*32,0))
for i in range(4): put(f'decor/agustus/balap_karung_villager_{i+1}.png',5+i,9,((i%4)*32,64,(i%4)*32+32,96),dy=-6)
emo=[('characters/lifecycle/child_1.png','senang',11,7),('characters/villager_2.png','ide',13,7),('characters/lifecycle/elder_2.png','cinta',14,7),('characters/villager_3.png','marah',4,9)]
for f,e,tx,ty in emo:
    put(f,tx,ty,(0,0,32,32)); sc.alpha_composite(L(f'icons/emotes/emote_{e}.png').crop((32,0,48,16)),(tx*32+8,ty*32-14+(4 if 'child' in f else 0)))
ui=Image.new('RGBA',(300,170)); ui.alpha_composite(nine(L('ui/dilemma/panel_dilema.png'),300,170,14))
ui.alpha_composite(L('ui/dilemma/portraits/portrait_villager_2.png').resize((64,64),Image.NEAREST),(24,24)); ui.alpha_composite(L('ui/dilemma/portrait_frame_80.png'),(16,16))
ui.alpha_composite(L('icons/traits/trait_rajin_16.png'),(104,24)); ui.alpha_composite(L('icons/traits/trait_pemarah_16.png'),(122,24)); ui.alpha_composite(L('icons/relations/rel_rival_16.png'),(140,24))
ui.alpha_composite(L('icons/traits/icon_kepala_desa.png'),(250,18))
for i,s in enumerate(('normal','hover','pressed')): ui.alpha_composite(nine(L(f'ui/dilemma/button_choice_{s}.png'),180,28,10),(104,58+i*32))
out=Image.new('RGBA',(WW,y+680),BG)
for im,p_ in zip(ims,pl): out.alpha_composite(im,p_)
out.alpha_composite(sc.resize((1280,640),Image.NEAREST),(10,y)); out.alpha_composite(ui.resize((450,255),Image.NEAREST),(1310,y))
out.save(os.path.join(ROOT,'preview_stage8.png')); print(out.size)
