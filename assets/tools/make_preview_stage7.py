#!/usr/bin/env python3
"""preview_stage7.png: aset tahap 7 (Indonesia/tropis) 2-3x + scene desa tropis + 4 musim + malam."""
import os, json, random
from PIL import Image, ImageChops
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
IDX=json.load(open(os.path.join(ROOT,'tiles/autotile_blob47.json'))); B=IDX['bits']
OFF={'N':(0,-1),'NE':(1,-1),'E':(1,0),'SE':(1,1),'S':(0,1),'SW':(-1,1),'W':(-1,0),'NW':(-1,-1)}
def norm(m):
    for d,a,b in(('NE','N','E'),('SE','S','E'),('SW','S','W'),('NW','N','W')):
        if not(m&B[a] and m&B[b]): m&=~B[d]
    return m
def blob(sheet,grid,x,y):
    H,W=len(grid),len(grid[0]); m=0
    for k,(dx,dy) in OFF.items():
        X,Y=x+dx,y+dy
        if not(0<=X<W and 0<=Y<H) or grid[Y][X]: m|=B[k]
    i=IDX['mask_to_index'][str(norm(m))]; return sheet.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
def m4(grid,x,y):
    H,W=len(grid),len(grid[0]); g=lambda X,Y: 0<=X<W and 0<=Y<H and grid[Y][X]
    return (1 if g(x,y-1) else 0)|(2 if g(x+1,y) else 0)|(4 if g(x,y+1) else 0)|(8 if g(x-1,y) else 0)
def cell(sheet,i,cols=4): return sheet.crop(((i%cols)*32,(i//cols)*32,(i%cols)*32+32,(i//cols)*32+32))
W,H=24,14
def build(season=None,night=False):
    sp=lambda p: (f"seasons/tropis/{season}/{os.path.basename(p)[:-4]}_{season}.png" if season and os.path.exists(os.path.join(ROOT,f"seasons/tropis/{season}/{os.path.basename(p)[:-4]}_{season}.png")) else p)
    sc=Image.new('RGBA',(W*32,H*32)); g=L(sp('tiles/grass.png')); gf=L(sp('tiles/grass_flowers.png'))
    water=[[1 if 17<=x<=19 else 0 for x in range(W)] for y in range(H)]
    path=[[1 if (y==7 and 3<=x<=16) or (x==10 and 2<=y<=13) else 0 for x in range(W)] for y in range(H)]
    sawah=[[1 if 20<=x<=23 and 1<=y<=12 and not(x==20 and y in(6,7)) else 0 for x in range(W)] for y in range(H)]
    ws=L(sp('tiles/autotile_water_grass.png')); ps=L(sp('tiles/autotile_path_grass.png')); sw=L('tiles/tropis/sawah_autotile.png'); r=random.Random(5)
    for y in range(H):
        for x in range(W):
            t=blob(ws,water,x,y) if water[y][x] else blob(ps,path,x,y) if path[y][x] else (gf if r.random()<.12 else g)
            if sawah[y][x]: t=cell(sw,m4(sawah,x,y))
            sc.paste(t,(x*32,y*32))
    def put(p,tx,ty,crop=None,dx=0,dy=0):
        im=L(p); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(tx*32+dx,ty*32+32-im.height+dy))
    # undakan sawah
    rs=L('tiles/tropis/sawah_terrace_riser.png')
    for x in range(20,24): sc.alpha_composite(rs.crop(((0 if x==20 else 2 if x==23 else 1)*32,0,(1 if x==20 else 3 if x==23 else 2)*32,32)),(x*32,4*32))
    for x in range(21,24): sc.alpha_composite(rs.crop((32,0,64,32)),(x*32,9*32))
    padi=L('nature/crops/crop_padi.png'); stage={'hujan':2,'mareng':4,'kemarau':5,'labuh':1}.get(season,3)
    for y in range(H):
        for x in range(W):
            if sawah[y][x]: sc.alpha_composite(padi.crop((32*(stage if y<5 else max(0,stage-1) if y<9 else min(4,stage+1)),0,32*((stage if y<5 else max(0,stage-1) if y<9 else min(4,stage+1))+1),32)),(x*32,y*32))
    tg=L('structures/tropis/tanggul_autotile.png'); tgl=[[1 if x==16 and 3<=y<=11 else 0 for x in range(W)] for y in range(H)]
    for y in range(H):
        if tgl[y][16]: sc.alpha_composite(cell(tg,m4(tgl,16,y)),(16*32,y*32))
    for x in(17,18,19): put('buildings/bridge_h.png',x,7,((0 if x==17 else 2 if x==19 else 1)*32,0,(1 if x==17 else 3 if x==19 else 2)*32,32))
    for x in(17,18,19): put('buildings/bridge_rail_h_back.png',x,7,((0 if x==17 else 2 if x==19 else 1)*32,0,(1 if x==17 else 3 if x==19 else 2)*32,32))
    nb=lambda n,folder='buildings/tropis/': (f'{folder}night/{n}_night.png' if night and os.path.exists(os.path.join(ROOT,f'{folder}night/{n}_night.png')) else f'{folder}{n}.png')
    put(nb('rumah_panggung'),3,6); put(nb('gubuk_bambu'),7,5); put('buildings/tropis/lumbung_padi.png',12,6); put('buildings/tropis/kandang.png',2,12)
    put(nb('pos_ronda'),14,12,(0,0,64,64)); put('buildings/tropis/embung.png',6,13)
    pb=L('structures/tropis/pagar_bambu_autotile.png'); fen=[[1 if (y==9 and 6<=x<=9) or (x==6 and 9<=y<=10) else 0 for x in range(W)] for y in range(H)]
    for y in range(H):
        for x in range(W):
            if fen[y][x]: put('structures/tropis/pagar_bambu_autotile.png',x,y,((m4(fen,x,y)%4)*32,(m4(fen,x,y)//4)*32,(m4(fen,x,y)%4)*32+32,(m4(fen,x,y)//4)*32+32))
    for tx,ty,t in((0,1,'tree_kelapa'),(1,4,'tree_pisang'),(15,2,'tree_kelapa'),(13,1,'bambu'),(0,8,'tree_mangga'),(8,10,'tree_rambutan'),(14,9,'tree_kamboja'),(2,1,'tree_jati')):
        put(sp(f'nature/tropis/{t}.png'),tx,ty)
    put(sp('nature/tropis/tree_beringin.png'),5,2); put(sp('nature/tropis/bush_tropis.png'),9,3); put('nature/tropis/bush_kembang_sepatu.png',12,3)
    for i,(n,c,tx,ty,dx) in enumerate((('sapi',1,0,13,0),('kambing',1,4,11,8),('ayam',5,7,8,0),('ayam',6,8,8,8),('bebek',5,16,13,0),('kerbau',2,21,13,0))):
        F=64 if n in('sapi','kerbau') else 32; im=L(f'characters/fauna/{n}.png').crop((0,c*F,F,c*F+F))
        sc.alpha_composite(im,(tx*32+dx,ty*32+32-F+ (16 if F==64 else 0)))
    put('characters/villager_1_work.png',10,9,(64,4*32,96,5*32)) if False else None
    put('characters/villager_1.png',9,7,(0,64,32,96)); put('characters/villager_2_carry.png',11,7,(32,8*32,64,9*32)); put('characters/lifecycle/child_2.png',8,6,(0,0,32,32))
    put('characters/lifecycle/elder_1.png',13,4,(0,32,32,64))
    put('structures/tropis/orang_orangan_sawah.png',22,6,(0,0,32,64)); put('characters/fauna/ambient/bangau.png',21,3,(32,0,64,32))
    put('structures/tropis/obor_bambu.png',9,6,(0,0,32,64),dx=-14); put('structures/tropis/obor_bambu.png',16,6,(32 if night else 128,0,(64 if night else 160),64))
    put('characters/fauna/ambient/ikan_lompat.png',18,10,(64,0,96,32))
    sc.alpha_composite(L('characters/fauna/ambient/kupu_kupu.png').crop((0,0,16,16)),(11*32,3*32)); sc.alpha_composite(L('characters/fauna/ambient/burung_pipit_terbang.png').crop((0,0,16,16)),(6*32,32))
    put('characters/fauna/ular.png',1,13,(0,32,32,64)) if season=='hujan' else None
    put('characters/fauna/monyet.png',14,4,(64,64,96,96)) if season in(None,'mareng') else None
    if season=='hujan':
        o=L('effects/weather/rain_heavy_overlay.png').crop((0,0,64,64)); t=L('effects/weather/rain_tint.png')
        for yy in range(0,H*32,32):
            for xx in range(0,W*32,32): sc.alpha_composite(t,(xx,yy))
        for yy in range(0,H*32,64):
            for xx in range(0,W*32,64): sc.alpha_composite(o,(xx,yy))
        sc.alpha_composite(L('effects/weather/lightning_bolt.png').crop((0,0,32,96)),(18*32,0))
    if season=='kemarau':
        o=L('effects/weather/dust_overlay.png').crop((0,0,64,64)); t=L('effects/weather/kemarau_tint.png')
        for yy in range(0,H*32,32):
            for xx in range(0,W*32,32): sc.alpha_composite(t,(xx,yy))
        for yy in range(0,H*32,64):
            for xx in range(0,W*32,64): sc.alpha_composite(o,(xx,yy))
    if season=='labuh':
        c=L('effects/weather/cloud_shadow_overlay.png')
        for yy in range(0,H*32,128):
            for xx in range(0,W*32,128): sc.alpha_composite(c,(xx,yy))
    if night:
        ov=Image.new('RGBA',sc.size,(22,28,70,150)); sc=Image.alpha_composite(sc,ov); glow=Image.new('RGBA',sc.size,(0,0,0,0))
        gs=L('effects/night/light_glow_small.png')
        for cx,cy in((9*32+2,6*32-20),(16*32+16,6*32-20),(4*32+48,6*32+40),(8*32+20,5*32+20),(15*32,11*32+20)): glow.alpha_composite(gs,(cx-32,cy-32))
        a=glow.split()[3]; mult=Image.merge('RGB',[ImageChops.multiply(ch,a) for ch in glow.convert('RGB').split()])
        sc=Image.merge('RGBA',[*ImageChops.add(sc.convert('RGB'),mult).split(),Image.new('L',sc.size,255)])
        ff=L('characters/fauna/ambient/kunang_kunang.png').crop((0,0,8,8)); r=random.Random(2)
        for _ in range(18): sc.alpha_composite(ff,(r.randrange(W*32),r.randrange(H*32)))
    return sc
fs=[f['file'] for f in man['files'] if f.get('stage')==7 and f['file'].endswith('.png') and '/seasons/' not in '/'+f['file']]
WW=1800; x=y=10; rowh=0; pl=[]; ims=[]
for f in fs:
    im=L(f); s=2 if im.width>=128 or im.height>=128 else 3; im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>WW-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); ims.append(im); x+=im.width+12; rowh=max(rowh,im.height)
y+=rowh+20
main=build().resize((W*64,H*64),Image.NEAREST)
minis=[build(s) for s in('hujan','mareng','kemarau','labuh')]+[build(night=True)]
mw,mh=W*32*0.75,H*32*0.75
out=Image.new('RGBA',(WW,int(y+main.height+20+(mh+20)*2)),BG)
for im,p in zip(ims,pl): out.alpha_composite(im,p)
out.alpha_composite(main,(10,y)); yy=y+main.height+20
for i,m in enumerate(minis):
    m=m.resize((int(mw),int(mh)),Image.NEAREST); out.alpha_composite(m,(10+(i%3)*(int(mw)+16),int(yy+(i//3)*(mh+20))))
out.save(os.path.join(ROOT,'preview_stage7.png')); print(out.size)
