#!/usr/bin/env python3
"""preview_stage2.png: aset tahap 2 (3x) + scene autotile musim panas, malam, dan musim dingin."""
import os, json, random
from PIL import Image, ImageChops
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S=3; BG=(196,190,184,255)
man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
idx=json.load(open(os.path.join(ROOT,'tiles/autotile_blob47.json')))
BIT=idx['bits']; OFF={'N':(0,-1),'NE':(1,-1),'E':(1,0),'SE':(1,1),'S':(0,1),'SW':(-1,1),'W':(-1,0),'NW':(-1,-1)}
def norm(m):
    for d,a,b in(('NE','N','E'),('SE','S','E'),('SW','S','W'),('NW','N','W')):
        if not(m&BIT[a] and m&BIT[b]): m&=~BIT[d]
    return m
def blob(sheet,grid,x,y,frame=0):
    m=0
    for k,(dx,dy) in OFF.items():
        X,Y=x+dx,y+dy
        if not(0<=Y<len(grid) and 0<=X<len(grid[0])) or grid[Y][X]: m|=BIT[k]
    i=idx['mask_to_index'][str(norm(m))]+frame*47
    return sheet.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
W,H=20,12
water=[[0]*W for _ in range(H)]; path=[[0]*W for _ in range(H)]
for y in range(H):
    for x in range(W):
        if 14<=x<=17 or (y>=8 and x>=12) or (x in(12,13) and y in(2,3)): water[y][x]=1
for x in range(15,17): water[5][x]=water[6][x]=1
for x in range(1,14): path[6][x]=1
for y in range(2,11): path[y][7]=1
path[7][1]=path[8][1]=1
for y,x in((6,14),(6,15),(6,16),(6,17)): water[y][x]=1
def scene(season):
    sc=Image.new('RGBA',(W*32,H*32))
    if season=='winter':
        base=L('tiles/winter/snow_grass.png'); ws=L('tiles/autotile_ice_snow.png'); ps=L('tiles/autotile_path_snow.png')
    else:
        base=L('tiles/grass.png'); ws=L('tiles/autotile_water_grass.png'); ps=L('tiles/autotile_path_grass.png')
    for y in range(H):
        for x in range(W):
            t=base
            if water[y][x]: t=blob(ws,water,x,y)
            elif path[y][x]: t=blob(ps,path,x,y)
            sc.paste(t,(x*32,y*32))
    def put(p,tx,ty,crop=None):
        im=L(p)
        if crop: im=im.crop(crop)
        sc.alpha_composite(im,(tx*32,ty*32+32-im.height))
    put('buildings/bridge_h.png',14,6,(0,0,32,32)); put('buildings/bridge_h.png',15,6,(32,0,64,32)); put('buildings/bridge_h.png',16,6,(32,0,64,32)); put('buildings/bridge_h.png',17,6,(64,0,96,32))
    n='_night' if season=='night' else ''
    nb=lambda b: f'buildings/night/{b}_night.png' if n else f'buildings/{b}.png'
    put(nb('town_hall'),2,5); put(nb('kitchen'),8,4); put(nb('market'),9,9); put('buildings/granary.png' if not n else 'buildings/night/granary_night.png',4,10)
    put(nb('workshop'),10,5); put('buildings/campfire.png',7,7,(0,0,32,32))
    tr='nature/winter/tree_snow.png' if season=='winter' else 'nature/tree.png'
    for tx,ty in((0,2),(12,1),(18,3),(19,6),(0,9),(13,6)): put(tr if (tx+ty)%3 else ('nature/winter/tree_bare.png' if season=='winter' else tr),tx,ty)
    if season!='winter':
        for i,x in enumerate(range(1,4)):
            put('nature/crops/crop_wheat.png',x,8,(32*(i+2),0,32*(i+3),32)); put('nature/crops/crop_carrot.png',x,9,(32*(i+3),0,32*(i+4),32))
        put('effects/sparkle_grow.png',1,8,(32,0,64,32))
    put('characters/villager_1_work.png',11,1,(64,64,96,96)); put('characters/villager_2_work.png',6,4,(32,8*32,64,9*32))
    put('characters/villager_3_work.png',11,8,(96,6*32,128,7*32)); put('characters/villager_4_work.png',6,8,(0,32*10,32,32*11))
    put('nature/rock.png' if season!='winter' else 'nature/winter/rock_snow.png',12,2)
    if season=='night':
        for tx,ty in((6,6),(13,4)): put('effects/night/lantern_post_lit.png',tx,ty)
        put('effects/night/torch.png',9,7,(32,0,64,32))
        ov=Image.new('RGBA',sc.size,(22,28,70,150)); sc=Image.alpha_composite(sc,ov)
        glow=Image.new('RGBA',sc.size,(0,0,0,0))
        def g(p,cx,cy):
            im=L(p); glow.alpha_composite(im,(cx-im.width//2,cy-im.height//2))
        g('effects/night/light_glow_large.png',7*32+16,7*32+16)
        for cx,cy in((6*32+20,6*32-4),(13*32+20,4*32-4),(9*32+16,7*32+8)): g('effects/night/light_glow_small.png',cx,cy)
        for cx,cy in((3*32+40,4*32+40),(9*32,3*32+24),(11*32+20,4*32+30),(5*32,9*32)): g('effects/night/light_glow_small.png',cx,cy)
        a=glow.split()[3]; rgb=Image.composite(glow.convert('RGB'),Image.new('RGB',sc.size),a)
        rgb=Image.eval(rgb,lambda v:v)  # premult approx
        mult=Image.merge('RGB',[ImageChops.multiply(c,a) for c in rgb.split()])
        sc=Image.merge('RGBA',[*ImageChops.add(sc.convert('RGB'),mult).split(),Image.new('L',sc.size,255)])
    return sc
items=[L(f['file']) for f in man['files'] if f.get('stage')==2 and f['file'].endswith('.png')]
W2=1700; x=y=10; rowh=0; pl=[]
for im in items:
    w,h=im.width*S,im.height*S
    if x+w>W2-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); x+=w+12; rowh=max(rowh,h)
y+=rowh+20
scs=[scene(s).resize((W*32*2//2*1,H*32),Image.NEAREST) for s in('summer','night','winter')]
SC=2; scs=[s.resize((s.width*SC//2*1,s.height*SC//2*1),Image.NEAREST) for s in scs]
out=Image.new('RGBA',(W2,y+(H*32+20)*2*3//2+40),BG)
for im,(a,b) in zip(items,pl): out.alpha_composite(im.resize((im.width*S,im.height*S),Image.NEAREST),(a,b))
# scenes 1.25x? place at 2x side-by-side would be too wide; stack at 2x scaled-down... use 1x+ for overview, 2x for night
yy=y
for i,s in enumerate(scs):
    s2=s.resize((s.width*2,s.height*2),Image.NEAREST) if False else s
    out.alpha_composite(s2,(10+(i%2)*(s2.width+20),yy+(i//2)*(s2.height+20)))
out=out.crop((0,0,W2,yy+2*(H*32+20)+10))
out.save(os.path.join(ROOT,'preview_stage2.png')); print(out.size)
