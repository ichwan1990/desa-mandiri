#!/usr/bin/env python3
"""preview_lifecycle.png: bayi, anak, lansia, gendong, buaian, ikon tidur/hati, rumah lampu mati & pintu (3x) + contoh tempel ikon."""
import os, json
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
fs=[f['file'] for f in man['files'] if f.get('stage')==6]
W=1800; x=y=10; rowh=0; pl=[]; ims=[]
for f in fs:
    im=L(f); im=im.resize((im.width*3,im.height*3),Image.NEAREST)
    if x+im.width>W-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); ims.append(im); x+=im.width+12; rowh=max(rowh,im.height)
y+=rowh+20
# contoh: keluarga di depan rumah, ikon ditempel
sc=Image.new('RGBA',(320,128)); g=L('tiles/grass.png')
for ty in range(4):
    for tx in range(10): sc.paste(g,(tx*32,ty*32))
sc.alpha_composite(L('buildings/wooden_house_door.png').crop((192,0,288,96)),(0,30))
fr=lambda p,c,r: L(p).crop((c*32,r*32,c*32+32,r*32+32))
people=[('characters/villager_1.png',0,0,110,80),('characters/villager_2.png',0,0,140,80),('characters/lifecycle/child_1.png',1,4,175,84),('characters/lifecycle/elder_2.png',0,6,210,80),('characters/lifecycle/villager_3_holding_baby.png',0,0,245,80)]
for p,c,r,px_,py in people: sc.alpha_composite(fr(p,c,r),(px_,py))
hz=L('icons/status/icon_heart_pulse.png').crop((32,0,48,16)); sc.alpha_composite(hz,(110+8,80-14)); sc.alpha_composite(hz,(140+8,80-14))
sc.alpha_composite(L('characters/lifecycle/cradle.png').crop((0,0,32,32)),(280,86))
sc.alpha_composite(L('characters/lifecycle/baby_2.png').crop((0,0,32,32)),(280,40))
sleeper=fr('characters/villager_4.png',0,0); sc.alpha_composite(sleeper,(150,10)); sc.alpha_composite(L('icons/status/icon_zzz_anim.png').crop((32,0,48,16)),(150+16,10-12))
out=Image.new('RGBA',(W,y+128*4+20),BG)
for im,p in zip(ims,pl): out.alpha_composite(im,p)
out.alpha_composite(sc.resize((1280,512),Image.NEAREST),(10,y)); out.save(os.path.join(ROOT,'preview_lifecycle.png')); print(out.size)
