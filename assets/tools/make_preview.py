#!/usr/bin/env python3
"""Buat preview.png: semua aset diperbesar 3x (nearest) + scene contoh desa."""
import os, json, random
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S=3; BG=(196,190,184,255)
man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
items=[L(f['file']) for f in man['files'] if f.get('stage',1)==1]
W=1500; x=y=10; rowh=0; places=[]
for im in items:
    w,h=im.width*S,im.height*S
    if x+w>W-10: x=10; y+=rowh+12; rowh=0
    places.append((x,y)); x+=w+12; rowh=max(rowh,h)
y+=rowh+20
# scene 20x10 tiles
sw,shh=20,10; scene=Image.new('RGBA',(sw*32,shh*32))
g=L('tiles/grass.png'); gf=L('tiles/grass_flowers.png'); d=L('tiles/dirt.png'); sa=L('tiles/sand.png'); wa=L('tiles/water_anim.png').crop((0,0,32,32))
es=L('tiles/edge_sand_water.png'); eg=L('tiles/edge_grass_sand.png')
r=random.Random(1)
for ty in range(shh):
    for tx in range(sw):
        t=gf if r.random()<.12 else g
        if tx>=17: t=wa
        elif tx==16: t=es.crop((32*3,0,32*4,32))  # sand on west, water east
        elif tx==15: t=eg.crop((32*3,0,32*4,32))  # grass west, sand east
        if 5<=ty<=6 and 2<=tx<=13: t=d
        scene.paste(t,(tx*32,ty*32))
def put(p,tx,ty,frame=None):
    im=L(p)
    if frame is not None: im=im.crop((frame[0]*32,frame[1]*32,frame[0]*32+32,frame[1]*32+32))
    scene.alpha_composite(im,(tx*32,ty*32+32-im.height+ (0)))
for tx,ty in[(0,1),(1,3),(0,7),(13,1),(14,8),(2,8)]: put('nature/tree.png',tx,ty)
put('buildings/wooden_house.png',3,2); put('buildings/hut.png',7,3); put('buildings/warehouse.png',10,3)
put('buildings/well.png',7,8); scene.alpha_composite(L('effects/campfire_glow.png'),(9*32-32,6*32-32)); put('buildings/campfire.png',9,6,(1,0)); put('effects/sparkle_grow.png',4,9,(2,0)); put('buildings/mine.png',12,9)
for tx in range(3,6):
    for ty in(8,9): put(['nature/field_ready.png','nature/field_growing.png','nature/field_empty.png'][tx-3],tx,ty)
put('nature/rock.png',14,4); put('nature/rock_small.png',1,5); put('nature/berry_bush_full.png',2,1); put('nature/berry_bush_empty.png',11,8)
put('characters/villager_1.png',8,6,(1,4)); put('characters/villager_2.png',10,6,(2,5)); put('characters/villager_3.png',6,5,(0,6)); put('characters/villager_4.png',9,7,(3,7))
# HUD icons
for i,n in enumerate(['wood','stone','food','water']): scene.alpha_composite(L(f'icons/icon_{n}.png'),(8+i*56,4))
SC=2; sc=scene.resize((scene.width*SC,scene.height*SC),Image.NEAREST)
out=Image.new('RGBA',(W,y+sc.height+20),BG)
for im,(px,py) in zip(items,places): out.alpha_composite(im.resize((im.width*S,im.height*S),Image.NEAREST),(px,py))
out.alpha_composite(sc,(10,y)); out.save(os.path.join(ROOT,'preview.png')); print(out.size)
