#!/usr/bin/env python3
"""preview_stage4.png: aset tahap 4 (3x; autotile 1x) + scene musim & ancaman (2x)."""
import os, json, random
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
fs=[f['file'] for f in man['files'] if f.get('stage')==4 and f['file'].endswith('.png')]
W=1800; x=y=10; rowh=0; pl=[]; ims=[]
for f in fs:
    im=L(f); s=1 if ('autotile' in f or 'vignette' in f) else 3; im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>W-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); ims.append(im); x+=im.width+12; rowh=max(rowh,im.height)
y+=rowh+20
def put(sc,p,tx,ty,crop=None):
    im=L(p); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(tx*32,ty*32+32-im.height))
def mini(season):
    sc=Image.new('RGBA',(320,192)); s=season
    g=L(f'seasons/{s}/grass_{s}.png'); gf=L(f'seasons/{s}/grass_flowers_{s}.png'); r=random.Random(3)
    for ty in range(6):
        for tx in range(10): sc.paste(gf if r.random()<.2 else g,(tx*32,ty*32))
    if s=='spring':
        for tx,ty in((1,1),(3,4)): sc.paste(L('seasons/spring/grass_meadow_spring.png'),(tx*32,ty*32))
    for tx,ty in((0,2),(2,1),(7,2),(8,5),(5,1)): put(sc,f'seasons/{s}/tree_{s}.png',tx,ty)
    put(sc,f'seasons/{s}/berry_bush_full_{s}.png',4,4); put(sc,f'seasons/{s}/berry_bush_empty_{s}.png',6,4); put(sc,'buildings/hut.png',2,4)
    put(sc,'characters/villager_1.png',5,3,(0,4*32,32,5*32))
    if s=='autumn': put(sc,'seasons/autumn/leaf_pile.png',7,4)
    if s=='summer': sc.paste(L('seasons/summer/dirt_cracked_summer.png'),(8*32,2*32)) 
    ov={'spring':'effects/weather/rain_overlay.png','summer':'effects/weather/heat_haze_overlay.png','autumn':'effects/weather/leaves_overlay.png'}[s]
    o=L(ov).crop((0,0,64,64))
    if s=='summer':
        t=L('effects/weather/heat_tint.png')
        for yy in range(0,192,32):
            for xx in range(0,320,32): sc.alpha_composite(t,(xx,yy))
    if s=='spring':
        t=L('effects/weather/rain_tint.png')
        for yy in range(0,192,32):
            for xx in range(0,320,32): sc.alpha_composite(t,(xx,yy))
    for yy in range(0,192,64):
        for xx in range(0,320,64): sc.alpha_composite(o,(xx,yy))
    return sc
def threat():
    sc=Image.new('RGBA',(640,288)); g=L('tiles/grass.png')
    for ty in range(9):
        for tx in range(20): sc.paste(g,(tx*32,ty*32))
    # flood blob region
    fl=L('hazards/autotile_flood.png'); idx=json.load(open(os.path.join(ROOT,'tiles/autotile_blob47.json')))
    B=idx['bits']; OFF={'N':(0,-1),'NE':(1,-1),'E':(1,0),'SE':(1,1),'S':(0,1),'SW':(-1,1),'W':(-1,0),'NW':(-1,-1)}
    grid=[[1 if (15<=x<=18 and 4<=y<=7) or (x==14 and y in(5,6)) else 0 for x in range(20)] for y in range(9)]
    def norm(m):
        for d,a,b in(('NE','N','E'),('SE','S','E'),('SW','S','W'),('NW','N','W')):
            if not(m&B[a] and m&B[b]): m&=~B[d]
        return m
    for ty in range(9):
        for tx in range(20):
            if grid[ty][tx]:
                m=0
                for k,(dx,dy) in OFF.items():
                    X,Y=tx+dx,ty+dy
                    if 0<=X<20 and 0<=Y<9 and grid[Y][X]: m|=B[k]
                i=idx['mask_to_index'][str(norm(m))]; sc.alpha_composite(fl.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32)),(tx*32,ty*32))
    # fence ring with gate
    fa=L('structures/fence_autotile.png'); ring=set()
    for x in range(1,9): ring.add((x,1)); ring.add((x,7))
    for y in range(1,8): ring.add((1,y)); ring.add((8,y))
    gate=(5,7); ring.discard(gate)
    for (x,y) in sorted(ring,key=lambda p:p[1]):
        m=(1 if (x,y-1) in ring or (x,y-1)==gate else 0)|(2 if (x+1,y) in ring or (x+1,y)==gate else 0)|(4 if (x,y+1) in ring or (x,y+1)==gate else 0)|(8 if (x-1,y) in ring or (x-1,y)==gate else 0)
        put(sc,'structures/fence_autotile.png',x,y,((m%4)*32,(m//4)*32,(m%4)*32+32,(m//4)*32+32))
    put(sc,'structures/gate_h.png',5,7,(32,0,64,32)); put(sc,'structures/fence_autotile.png',11,2,(0,0,32,32))
    put(sc,'buildings/wooden_house.png',2,5); put(sc,'hazards/burnt/hut_burnt.png',6,4); put(sc,'hazards/fire_large.png',6,4,(64,0,128,64))
    put(sc,'buildings/kitchen.png',6,6) if False else None
    put(sc,'hazards/smoke.png',3,2,(32,0,64,32)); put(sc,'structures/watchtower.png',9,4); put(sc,'structures/torch_post.png',4,6,(0,0,32,64)); put(sc,'structures/torch_post.png',7,6,(128,0,160,64))
    put(sc,'hazards/burnt/rubble_large.png',12,6)
    put(sc,'characters/animals/paw_trail.png',12,3); put(sc,'characters/animals/wolf_grey.png',11,4,(64,32*9,96,32*10)); put(sc,'characters/animals/wolf_brown.png',13,1,(0,32*4,32,32*5))
    put(sc,'characters/villager_2.png',9,6,(0,64,32,96))
    for i,(n,tx) in enumerate((('grave_stone_round',15),('grave_cross_wood',16),('grave_stone_flowers',17),('grave_cairn',18))): put(sc,f'structures/graves/{n}.png',tx,1)
    put(sc,'structures/graves/grave_mound_fresh.png',19,2); put(sc,'hazards/fire_small.png',13,7,(64,0,96,32))
    sc.alpha_composite(L('ui/warning/banner_orange.png'),(10,4)); sc.alpha_composite(L('ui/warning/warn_howl_orange.png'),(14,0))
    sc.alpha_composite(L('ui/warning/warn_fire_red.png'),(110,0)); sc.alpha_composite(L('ui/warning/warn_flood_yellow.png'),(146,0))
    return sc
scs=[mini(s) for s in('spring','summer','autumn')]; th=threat()
H=y+192*2+20+288*2+20
out=Image.new('RGBA',(W,H),BG)
for im,p in zip(ims,pl): out.alpha_composite(im,p)
for i,s in enumerate(scs): out.alpha_composite(s.resize((640,384),Image.NEAREST),(10+i*600 if False else 10+i*(590),y)) if False else None
for i,s in enumerate(scs): out.alpha_composite(s.resize((560,336),Image.NEAREST),(10+i*595,y))
out.alpha_composite(th.resize((1280,576),Image.NEAREST),(10,y+356))
out=out.crop((0,0,W,y+356+586)); out.save(os.path.join(ROOT,'preview_stage4.png')); print(out.size)
