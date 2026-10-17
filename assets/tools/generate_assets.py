#!/usr/bin/env python3
"""Generator aset pixel art 'Desa Mandiri'. Jalankan: python3 generate_assets.py
Semua warna diambil dari PALETTE. Deterministik (seed tetap)."""
import os, random, json
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = 32
PALETTE = {
 'outline':(58,40,48),'shadow':(40,30,40,90),
 'grass_d':(78,140,62),'grass':(112,178,72),'grass_l':(160,208,92),
 'dirt_d':(132,86,56),'dirt':(170,118,74),'dirt_l':(204,154,98),
 'sand_d':(214,178,110),'sand':(238,208,140),'sand_l':(250,232,176),
 'water_d':(52,110,170),'water':(78,152,206),'water_l':(150,210,236),'foam':(236,248,250),
 'wood_d':(102,62,44),'wood':(150,94,58),'wood_l':(196,134,82),
 'stone_d':(104,102,116),'stone':(150,148,158),'stone_l':(198,196,200),
 'leaf_d':(52,112,64),'leaf':(84,156,74),'leaf_l':(138,196,86),
 'roof_d':(166,62,52),'roof':(214,94,64),'roof_l':(240,140,88),
 'straw_d':(176,134,58),'straw':(222,182,86),'straw_l':(246,218,130),
 'fire_d':(214,70,40),'fire':(246,144,48),'fire_l':(255,218,92),'fire_w':(255,248,200),
 'berry':(210,52,88),'berry_l':(246,120,140),'wheat':(236,196,72),
 'skin1':(250,212,170),'skin2':(222,166,118),'skin3':(176,114,74),'skin4':(118,76,52),
 'hair1':(70,46,36),'hair2':(222,170,72),'hair3':(196,80,48),'hair4':(40,34,44),
 'cloth1':(214,94,64),'cloth2':(78,152,206),'cloth3':(112,178,72),'cloth4':(238,196,84),
 'cloth_d':(90,60,70),'magic':(170,140,240),'magic_l':(232,220,255),'glow':(255,200,90,70),'white':(250,246,236),'black':(30,24,30),
}
P = lambda k: PALETTE[k] if len(PALETTE[k])==4 else PALETTE[k]+(255,)
OUT=[]
def save(img, rel, frame=None, frames=1, note=''):
    path=os.path.join(ROOT,rel); os.makedirs(os.path.dirname(path),exist_ok=True)
    img.save(path); OUT.append(dict(file=rel,size=img.size,frame=frame or img.size,frames=frames,note=note))
def new(w=T,h=T): return Image.new('RGBA',(w,h),(0,0,0,0))
def px(im,x,y,c):
    if 0<=x<im.width and 0<=y<im.height: im.putpixel((x,y),P(c) if isinstance(c,str) else c)
def rect(im,x0,y0,x1,y1,c): ImageDraw.Draw(im).rectangle([x0,y0,x1,y1],fill=P(c))
def ell(im,b,c): ImageDraw.Draw(im).ellipse(b,fill=P(c))
def outline(im,col='outline'):
    a=im.split()[3]; o=im.copy(); c=P(col)
    for y in range(im.height):
        for x in range(im.width):
            if a.getpixel((x,y))==0:
                for dx,dy in((1,0),(-1,0),(0,1),(0,-1)):
                    X,Y=x+dx,y+dy
                    if 0<=X<im.width and 0<=Y<im.height and a.getpixel((X,Y))>200:
                        o.putpixel((x,y),c);break
    return o
def shadow(im,cx,cy,rx,ry):
    s=new(im.width,im.height); ImageDraw.Draw(s).ellipse([cx-rx,cy-ry,cx+rx,cy+ry],fill=PALETTE['shadow'])
    return Image.alpha_composite(s,im)
# ---------- TILES (seamless: noise via wrapped hash) ----------
def noise_tile(base,dark,light,seed,dens=0.08,blades=False):
    r=random.Random(seed); im=new(); rect(im,0,0,31,31,base)
    for _ in range(int(1024*dens)):
        x,y=r.randrange(32),r.randrange(32)
        if blades: px(im,x,y,light); px(im,x,(y+1)%32,base); px(im,x,(y+1)%32,dark) if r.random()<.5 else None
        else: px(im,x,y,r.choice([dark,light]))
    return im
def tiles():
    g=noise_tile('grass','grass_d','grass_l',1,0.07,True)
    for x,y in[(6,8),(22,20),(14,27)]:
        px(g,x,y,'grass_l');px(g,x-1,y+1,'grass_l');px(g,x+1,y+1,'grass_l')
    save(g,'tiles/grass.png',note='seamless')
    g2=g.copy(); r=random.Random(5)
    for _ in range(4):
        x,y=r.randrange(3,29),r.randrange(3,29); c=r.choice(['white','fire_l','berry_l'])
        for dx,dy in((0,-1),(1,0),(0,1),(-1,0)): px(g2,x+dx,y+dy,c)
        px(g2,x,y,'fire')
    save(g2,'tiles/grass_flowers.png',note='seamless, variasi rumput')
    d=noise_tile('dirt','dirt_d','dirt_l',2,0.1)
    for x,y in[(5,5),(20,12),(12,24),(27,28)]: px(d,x,y,'stone');px(d,x+1,y,'stone_l')
    save(d,'tiles/dirt.png',note='seamless')
    s=noise_tile('sand','sand_d','sand_l',3,0.06); save(s,'tiles/sand.png',note='seamless')
    sheet=new(64,32)
    for f in range(2):
        w=new(); rect(w,0,0,31,31,'water'); r=random.Random(9)
        for i in range(10):
            x,y=r.randrange(32),r.randrange(32); x=(x+f*3)%32
            for k in range(4): px(w,(x+k)%32,y,'water_l' if k<3 else 'water')
            px(w,(x+1)%32,(y+1)%32,'water_d')
        for i in range(30): px(w,r.randrange(32),r.randrange(32),'water_d')
        sheet.paste(w,(f*32,0))
    save(sheet,'tiles/water_anim.png',(32,32),2,'2 frame horizontal, ~500ms/frame, seamless')
    # transition: grass edge over sand/dirt (16-variant mask style simplified: 4 edges + 4 corners)
    for name,under in[('grass_dirt',d),('grass_sand',s),('sand_water',None)]:
        ts=new(32*8,32)
        for i,(dirs) in enumerate(['n','e','s','w','ne','se','sw','nw']):
            base=(sheet.crop((0,0,32,32)) if under is None else under).copy()
            top=s if under is None else g
            m=Image.new('L',(32,32),0); dm=ImageDraw.Draw(m)
            # top material covers side(s) named; wavy edge
            for x in range(32):
                wv=10+(2 if (x//4)%2 else 0)
                if 'n' in dirs: dm.line([(x,0),(x,wv)],fill=255)
                if 's' in dirs: dm.line([(x,31-wv),(x,31)],fill=255)
                if 'w' in dirs: dm.line([(0,x),(wv,x)],fill=255)
                if 'e' in dirs: dm.line([(31-wv,x),(31,x)],fill=255)
            if len(dirs)==2:  # corner = only intersection
                m2=Image.new('L',(32,32),0); d2=ImageDraw.Draw(m2)
                for x in range(32):
                    wv=10+(2 if (x//4)%2 else 0)
                    if dirs[0]=='n': d2.line([(x,0),(x,wv)],fill=255)
                    else: d2.line([(x,31-wv),(x,31)],fill=255)
                m3=Image.new('L',(32,32),0); d3=ImageDraw.Draw(m3)
                for y in range(32):
                    wv=10+(2 if (y//4)%2 else 0)
                    if dirs[1]=='w': d3.line([(0,y),(wv,y)],fill=255)
                    else: d3.line([(31-wv,y),(31,y)],fill=255)
                from PIL import ImageChops; m=ImageChops.multiply(m2,m3)
            base.paste(top,(0,0),m)
            # edge line
            e=new(); ea=m
            for y in range(32):
                for x in range(32):
                    if ea.getpixel((x,y))==0 and any(0<=x+a<32 and 0<=y+b<32 and ea.getpixel((x+a,y+b)) for a,b in((1,0),(-1,0),(0,1),(0,-1))):
                        px(base,x,y,'foam' if under is None else 'grass_d')
            ts.paste(base,(i*32,0))
        save(ts,f'tiles/edge_{name}.png',(32,32),8,'urutan: n,e,s,w,ne,se,sw,nw = sisi tempat material atas ('+('pasir di atas air' if under is None else 'rumput di atas '+name.split('_')[1])+') berada')
    return g
# ---------- NATURE ----------
def tree():
    im=new(32,64)
    rect(im,13,40,18,58,'wood'); rect(im,13,40,14,58,'wood_d'); rect(im,17,42,18,58,'wood_l')
    for b,c in[((3,10,29,44),'leaf_d'),((4,6,28,38),'leaf'),((8,6,22,22),'leaf_l')]: ell(im,b,c)
    r=random.Random(4)
    for _ in range(25): px(im,r.randrange(6,26),r.randrange(10,36),'leaf_d')
    for _ in range(14): px(im,r.randrange(8,22),r.randrange(8,22),'grass_l')
    im=outline(im); im=shadow(im,16,58,11,4); save(im,'nature/tree.png',note='32x64, alas (akar) di 32px bawah')
    st=new(); rect(st,11,16,20,24,'wood'); ell(st,(11,13,20,19),'wood_l'); ell(st,(13,14,18,18),'dirt_l')
    st=shadow(outline(st),16,24,9,3); save(st,'nature/tree_stump.png',note='setelah ditebang')
def rock():
    im=new(); ImageDraw.Draw(im).polygon([(5,26),(4,17),(10,8),(20,7),(27,13),(28,26)],fill=P('stone'))
    ImageDraw.Draw(im).polygon([(5,26),(28,26),(27,20),(16,22),(5,20)],fill=P('stone_d'))
    ImageDraw.Draw(im).polygon([(10,10),(19,9),(15,15)],fill=P('stone_l'))
    px(im,20,15,'stone_d');px(im,21,16,'stone_d');px(im,9,17,'stone_l')
    im=shadow(outline(im),16,27,13,3); save(im,'nature/rock.png')
    sm=new(); ell(sm,(9,16,22,26),'stone'); ell(sm,(9,21,22,27),'stone_d'); rect(sm,9,21,22,23,'stone'); ell(sm,(12,17,16,20),'stone_l')
    save(shadow(outline(sm),16,27,8,2),'nature/rock_small.png')
def bush(fruit):
    im=new()
    for b,c in[((3,10,29,29),'leaf_d'),((4,8,27,25),'leaf'),((8,9,18,17),'leaf_l')]: ell(im,b,c)
    if fruit:
        for x,y in[(8,18),(15,13),(21,19),(13,22),(23,12),(18,24)]:
            rect(im,x-1,y,x+2,y+1,'berry'); rect(im,x,y-1,x+1,y+2,'berry'); px(im,x,y,'berry_l'); px(im,x,y,'white')
    im=shadow(outline(im),16,29,12,3); save(im,f'nature/berry_bush_{"full" if fruit else "empty"}.png')
def fields():
    sheet=new(96,32)
    for st in range(3):
        im=new(); rect(im,1,1,30,30,'dirt_d')
        for y in range(3,30,7): rect(im,2,y,29,y+3,'dirt'); rect(im,2,y,29,y,'dirt_l')
        for y in range(3,30,7):
            for x in range(5,29,6):
                if st==1:
                    px(im,x,y+1,'leaf_l');px(im,x-1,y,'leaf');px(im,x+1,y,'leaf');px(im,x,y,'leaf')
                if st==2:
                    rect(im,x,y-2,x,y+2,'straw_d'); rect(im,x-1,y-4,x+1,y-2,'wheat'); px(im,x,y-5,'straw_l'); px(im,x-1,y-1,'leaf')
        im=outline(im,'wood_d'); sheet.paste(im,(st*32,0)); save(im,f'nature/field_{["empty","growing","ready"][st]}.png')
    save(sheet,'nature/field_stages.png',(32,32),3,'urutan: kosong, tumbuh, siap panen')
# ---------- VILLAGERS ----------
VARS=[('skin1','hair1','cloth1'),('skin2','hair2','cloth2'),('skin3','hair3','cloth3'),('skin4','hair4','cloth4')]
def villager_frame(v,dirn,frame,walk):
    skin,hair,cloth=v; im=new()
    bob = (1 if frame in(1,3) else 0) if walk else 0
    leg = [0,1,0,-1][frame] if walk else 0
    oy=-bob
    # legs
    if dirn in('down','up'):
        rect(im,12,25+min(0,leg)+0,14,28-max(0,-leg)*0+ (0 if leg>=0 else -1),'cloth_d')
        rect(im,17,25,19,28-(1 if leg>0 else 0),'cloth_d')
        if leg<0: rect(im,12,25,14,27,'cloth_d')
    else:
        s=1 if dirn=='right' else -1
        rect(im,15+leg*s*2-1,25,15+leg*s*2+1,28,'cloth_d'); rect(im,16-leg*s*2-1,25,16-leg*s*2+1,28,'cloth_d')
    # body
    rect(im,10,17+oy,21,25+oy,cloth); rect(im,10,23+oy,21,25+oy,'cloth_d') if False else None
    rect(im,10,24+oy,21,24+oy,'wood_d')  # belt
    # arms
    sw=[0,1,0,-1][frame] if walk else 0
    if dirn in('down','up'):
        rect(im,8,18+oy+sw,9,23+oy+sw,cloth); rect(im,22,18+oy-sw,23,23+oy-sw,cloth)
        px(im,8,24+oy+sw,skin);px(im,9,24+oy+sw,skin);px(im,22,24+oy-sw,skin);px(im,23,24+oy-sw,skin)
    else:
        ax=15+(sw*2 if dirn=='right' else -sw*2)
        rect(im,ax,18+oy,ax+2,23+oy,cloth); rect(im,ax,24+oy,ax+2,24+oy,skin)
    # head (big, cute)
    ell(im,(8,3+oy,23,18+oy),skin)
    if dirn=='down':
        ell(im,(8,2+oy,23,11+oy),hair); rect(im,8,6+oy,9,12+oy,hair); rect(im,22,6+oy,23,12+oy,hair)
        rect(im,12,12+oy,13,14+oy,'black'); rect(im,18,12+oy,19,14+oy,'black'); px(im,12,12+oy,'white');px(im,18,12+oy,'white')
        px(im,11,15+oy,'berry_l'); px(im,20,15+oy,'berry_l')
    elif dirn=='up':
        ell(im,(8,2+oy,23,17+oy),hair)
    else:
        ell(im,(8,2+oy,23,11+oy),hair)
        if dirn=='right': rect(im,8,4+oy,12,14+oy,hair); rect(im,19,12+oy,20,14+oy,'black'); px(im,19,12+oy,'white'); px(im,22,15+oy,'berry_l')
        else: rect(im,19,4+oy,23,14+oy,hair); rect(im,11,12+oy,12,14+oy,'black'); px(im,12,12+oy,'white'); px(im,9,15+oy,'berry_l')
    im=outline(im); return shadow(im,16,29,7,2)
def villagers():
    dirs=['down','left','right','up']
    for i,v in enumerate(VARS):
        sh=new(32*4,32*8)
        for r,d in enumerate(dirs):
            for f in range(4):
                sh.paste(villager_frame(v,d,f,False if f>1 else False),(f*32,r*32)) if False else None
            # idle row: frame0 static, frame1 breathing (1px bob)
            idle0=villager_frame(v,d,0,False); idle1=Image.new('RGBA',(32,32),(0,0,0,0)); 
            body=villager_frame(v,d,0,False); idle1.paste(body.crop((0,0,32,27)),(0,1)); idle1.paste(body.crop((0,27,32,32)),(0,27))
            for f in range(4): sh.paste(idle0 if f%2==0 else idle1,(f*32,r*32))
            for f in range(4): sh.paste(villager_frame(v,d,f,True),(f*32,(r+4)*32))
        save(sh,f'characters/villager_{i+1}.png',(32,32),32,'8 baris x 4 kolom')
# ---------- BUILDINGS ----------
def campfire():
    sh=new(32*4,32)
    for f in range(4):
        im=new(); r=random.Random(f)
        for x0 in(7,11,16,20): rect(im,x0,23,x0+5,26,'wood' if x0%2 else 'wood_d')
        for a,(x,y) in enumerate([(5,25),(9,28),(16,29),(23,28),(26,25)]): ell(im,(x-2,y-2,x+2,y+1),'stone' if a%2 else 'stone_l')
        h=[0,2,1,3][f]
        ImageDraw.Draw(im).polygon([(9,24),(16,6-h+ (f%2)),(23,24)],fill=P('fire_d'))
        ImageDraw.Draw(im).polygon([(11,24),(15+(f%2),10-h),(21,24)],fill=P('fire'))
        ImageDraw.Draw(im).polygon([(13,24),(16-(f%2),14-h//2),(19,24)],fill=P('fire_l'))
        rect(im,15,20,17,23,'fire_w')
        for _ in range(2): px(im,r.randrange(10,22),r.randrange(2,10),'fire_l')
        im=outline(im); sh.paste(shadow(im,16,27,12,3),(f*32,0))
    save(sh,'buildings/campfire.png',(32,32),4,'4 frame horizontal, ~120ms/frame')
def roof_tri(im,x0,x1,ytop,ybot,c,cd,cl,rows=True):
    d=ImageDraw.Draw(im); mid=(x0+x1)//2
    d.polygon([(x0,ybot),(mid,ytop),(x1,ybot)],fill=P(c))
    if rows:
        for y in range(ytop+4,ybot,4):
            w=(y-ytop)*(x1-x0)/2/(ybot-ytop); d.line([(mid-w,y),(mid+w,y)],fill=P(cd))
    d.line([(mid,ytop),(x0,ybot)],fill=P(cl))
def hut():
    im=new(64,64)
    rect(im,12,34,51,56,'wood'); 
    for x in range(12,52,5): rect(im,x,34,x,56,'wood_d')
    roof_tri(im,4,59,6,40,'straw','straw_d','straw_l')
    rect(im,28,42,36,56,'outline'); rect(im,29,43,35,56,'wood_d')
    rect(im,4,38,59,40,'straw_d')
    im=shadow(outline(im),32,57,26,4); save(im,'buildings/hut.png',note='64x64 (2x2 tile), kapasitas 2')
def warehouse():
    im=new(96,64)
    rect(im,6,24,89,58,'wood'); 
    for y in range(26,58,5): rect(im,6,y,89,y,'wood_d')
    rect(im,6,24,8,58,'wood_d');rect(im,87,24,89,58,'wood_d')
    d=ImageDraw.Draw(im); d.polygon([(2,26),(14,6),(82,6),(94,26)],fill=P('roof'))
    for y in range(10,26,4): d.line([(2+ (26-y)*0.0+ (26-y)*12/20,y),(94-(26-y)*12/20,y)],fill=P('roof_d'))
    d.line([(14,6),(82,6)],fill=P('roof_l'))
    rect(im,36,34,59,58,'wood_d'); d.line([(36,34),(59,58)],fill=P('wood_l'),width=2); d.line([(59,34),(36,58)],fill=P('wood_l'),width=2)
    rect(im,36,34,59,35,'wood_l')
    # crates
    for x in(12,22): rect(im,x,48,x+8,57,'wood_l'); d.rectangle([x,48,x+8,57],outline=P('wood_d'))
    rect(im,68,50,73,57,'stone_l'); rect(im,75,52,82,57,'stone')
    im=shadow(outline(im),48,59,44,4); save(im,'buildings/warehouse.png',note='96x64 (3x2 tile)')
def well():
    im=new(32,64)
    ell(im,(4,40,27,58),'stone_d'); rect(im,4,44,27,52,'stone'); ell(im,(4,36,27,50),'stone_l'); ell(im,(7,39,24,48),'water_d'); ell(im,(10,41,20,46),'water')
    for x in(6,14,22): px(im,x,48,'stone_d'); px(im,x+3,52,'stone_d')
    rect(im,5,16,6,43,'wood_d'); rect(im,25,16,26,43,'wood_d')
    roof_tri(im,1,30,4,20,'roof','roof_d','roof_l'); rect(im,7,26,24,27,'wood'); rect(im,15,27,16,34,'stone_d'); rect(im,13,34,18,38,'wood')
    im=shadow(outline(im),16,57,13,3); save(im,'buildings/well.png',note='32x64, alas di 32px bawah')
def mine():
    im=new(64,64); d=ImageDraw.Draw(im)
    d.polygon([(0,58),(6,24),(20,8),(42,6),(58,20),(63,58)],fill=P('stone'))
    d.polygon([(0,58),(63,58),(62,44),(2,46)],fill=P('stone_d'))
    d.polygon([(20,10),(34,8),(26,20)],fill=P('stone_l')); d.polygon([(46,14),(54,22),(46,24)],fill=P('stone_l'))
    ell(im,(18,26,46,62),'black'); rect(im,18,44,46,58,'black')
    rect(im,16,28,19,58,'wood'); rect(im,45,28,48,58,'wood'); rect(im,14,26,50,30,'wood_l'); rect(im,14,30,50,30,'wood_d')
    for x in range(22,44,4): rect(im,x,53,x+1,58,'wood_d')
    rect(im,21,56,43,56,'stone_l')
    rect(im,50,48,58,55,'wood'); ell(im,(51,45,57,50),'stone_l')
    im=shadow(outline(im),32,59,30,4); save(im,'buildings/mine.png',note='64x64 (2x2 tile)')
def wooden_house():
    im=new(96,96); d=ImageDraw.Draw(im)
    rect(im,10,46,85,88,'wood_l')
    for y in range(48,88,5): rect(im,10,y,85,y,'wood')
    rect(im,10,46,13,88,'wood_d'); rect(im,82,46,85,88,'wood_d')
    roof_tri(im,2,93,6,52,'roof','roof_d','roof_l'); rect(im,2,50,93,53,'roof_d')
    rect(im,66,14,74,30,'stone'); rect(im,65,12,75,14,'stone_d')
    rect(im,42,64,54,88,'wood_d'); rect(im,43,65,53,88,'wood'); px(im,51,76,'fire_l')
    for x in(20,62):
        rect(im,x,60,x+12,72,'wood_d'); rect(im,x+1,61,x+11,71,'water_l'); rect(im,x+6,61,x+6,71,'wood_d'); rect(im,x+1,66,x+11,66,'wood_d')
        rect(im,x,73,x+12,75,'leaf'); px(im,x+3,73,'berry');px(im,x+8,74,'fire_l')
    rect(im,40,88,56,90,'stone_l')
    im=shadow(outline(im),48,90,42,4); save(im,'buildings/wooden_house.png',note='96x96 (3x3 tile)')
def effects():
    sh=new(32*4,32); pts=[(8,10),(22,6),(16,20),(25,22),(6,24)]
    for f in range(4):
        im=new()
        for i,(x,y) in enumerate(pts):
            ph=(f+i)%4; y2=y-f
            if ph==0: px(im,x,y2,'magic_l')
            elif ph in(1,3): px(im,x,y2,'magic_l'); [px(im,x+a,y2+b,'magic') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
            else:
                px(im,x,y2,'white')
                for k in(1,2): [px(im,x+a*k,y2+b*k,'magic_l' if k==1 else 'magic') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
        sh.paste(im,(f*32,0))
    save(sh,'effects/sparkle_grow.png',(32,32),4,'overlay di atas ladang/tanaman tumbuh, ~150ms/frame')
    g=new(96,96); d=ImageDraw.Draw(g)
    for r,a in((46,30),(36,45),(24,60)): d.ellipse([48-r,48-r*0.7,48+r,48+r*0.7],fill=PALETTE['fire_l']+(a,))
    save(g,'effects/campfire_glow.png',note='overlay cahaya semi-transparan, pusatkan di api unggun (blend normal/additive)')
# ---------- ICONS ----------
def icons():
    im=new(); 
    for i,(x,y) in enumerate([(5,16),(10,9),(15,19)]):
        rect(im,x,y,x+15,y+5,'wood'); rect(im,x,y,x+15,y,'wood_l'); rect(im,x,y+5,x+15,y+5,'wood_d')
        ell(im,(x+12,y,x+17,y+5),'wood_l'); ell(im,(x+13,y+1,x+16,y+4),'dirt_l'); px(im,x+14,y+2,'wood')
    save(outline(im),'icons/icon_wood.png')
    im=new(); d=ImageDraw.Draw(im); d.polygon([(4,26),(6,14),(14,6),(24,8),(28,18),(26,26)],fill=P('stone')); d.polygon([(4,26),(26,26),(27,20),(5,21)],fill=P('stone_d'))
    d.polygon([(12,9),(20,9),(15,15)],fill=P('stone_l')); save(outline(im),'icons/icon_stone.png')
    im=new(); ell(im,(5,8,25,28),'berry'); ell(im,(8,10,15,17),'berry_l'); rect(im,15,3,16,9,'wood_d'); ell(im,(16,3,24,8),'leaf'); px(im,10,12,'white')
    save(outline(im),'icons/icon_food.png')
    im=new(); d=ImageDraw.Draw(im); d.polygon([(16,3),(8,17),(24,17)],fill=P('water')); ell(im,(7,11,25,29),'water'); ell(im,(10,15,22,27),'water'); ell(im,(11,16,15,21),'water_l'); px(im,12,17,'foam')
    d.arc((9,13,23,28),40,140,fill=P('water_d'))
    save(outline(im),'icons/icon_water.png')
# =====================================================================
# TAHAP 2 (hanya menambah file baru; output tahap 1 tidak berubah)
# =====================================================================
import math
PALETTE.update({
 'snow':(236,242,248),'snow_l':(255,255,255),'snow_d':(196,212,232),
 'ice':(168,214,236),'ice_l':(220,242,250),'ice_d':(118,170,206),
 'frost_dirt':(150,112,92),'frost_dirt_l':(190,170,170),
 'night':(22,28,70,150),'smoke':(206,200,200,170),
 'carrot':(240,128,40),'carrot_d':(196,88,32),'cloth_l':(246,236,210),
})
BIT={'N':1,'NE':2,'E':4,'SE':8,'S':16,'SW':32,'W':64,'NW':128}
def blob_normalize(m):
    for d,a,b in(('NE','N','E'),('SE','S','E'),('SW','S','W'),('NW','N','W')):
        if not(m&BIT[a] and m&BIT[b]): m&=~BIT[d]
    return m
BLOB_MASKS=sorted({blob_normalize(m) for m in range(256)})  # 47
OFF={'N':(0,-1),'NE':(1,-1),'E':(1,0),'SE':(1,1),'S':(0,1),'SW':(-1,1),'W':(-1,0),'NW':(-1,-1)}
def blob_tile(mask,inner,outer,edge_col,margin=7,edge2=None):
    """inner = material yang 'diisi' (air/jalan). mask = tetangga yang JUGA material inner."""
    cells=[(dx,dy) for k,(dx,dy) in OFF.items() if not mask&BIT[k]]
    out=outer.copy(); src=inner
    for y in range(32):
        for x in range(32):
            cx,cy=x+.5,y+.5; dist=99
            for dx,dy in cells:
                x0,y0=dx*32,dy*32; ddx=max(x0-cx,0,cx-(x0+32)); ddy=max(y0-cy,0,cy-(y0+32))
                dist=min(dist,math.hypot(ddx,ddy))
            wob=1.2*math.sin((x+y)*0.9)+0.8*math.sin(x*0.5-y*0.7)
            m=margin+wob
            if dist>=m: out.putpixel((x,y),src.getpixel((x,y)))
            elif dist>=m-1.6: px(out,x,y,edge_col)
            elif edge2 and dist>=m-3: px(out,x,y,edge2)
    return out
def autotiles():
    T1={n:Image.open(os.path.join(ROOT,f'tiles/{n}.png')).convert('RGBA') for n in('grass','dirt','sand')}
    water=Image.open(os.path.join(ROOT,'tiles/water_anim.png')).convert('RGBA')
    snow=T1['snow']=globals()['_snow']; ice=globals()['_ice']
    sets=[('water_sand',[water.crop((0,0,32,32)),water.crop((32,0,64,32))],T1['sand'],'foam','sand_d',7),
          ('water_grass',[water.crop((0,0,32,32)),water.crop((32,0,64,32))],T1['grass'],'foam','grass_d',7),
          ('path_grass',[T1['dirt']],T1['grass'],'grass_d',None,5),
          ('ice_snow',[ice],snow,'snow_l','snow_d',7),
          ('path_snow',[globals()['_fdirt']],snow,'snow_d',None,5)]
    for name,inners,outer,ec,e2,mg in sets:
        nf=len(inners); sh=new(32*8,32*6*nf)
        for f,inner in enumerate(inners):
            for i,m in enumerate(BLOB_MASKS):
                sh.paste(blob_tile(m,inner,outer,ec,mg,e2),((i%8)*32,(f*6+i//8)*32))
        note=f'47-tile blob, grid 8 kolom; indeks = posisi mask di BLOB_MASKS (lihat README/autotile_blob47.json)'
        if nf>1: note+='; frame air 0 = baris 0-5, frame 1 = baris 6-11'
        save(sh,f'tiles/autotile_{name}.png',(32,32),47*nf,note)
    json.dump({'bits':BIT,'masks':BLOB_MASKS,'mask_to_index':{str(m):i for i,m in enumerate(BLOB_MASKS)}},
              open(os.path.join(ROOT,'tiles/autotile_blob47.json'),'w'),indent=1)
    OUT.append(dict(file='tiles/autotile_blob47.json',size=None,frame=None,frames=None,note='lookup bitmask -> indeks tile'))
def winter_tiles():
    s=noise_tile('snow','snow_d','snow_l',11,0.05)
    for x,y in[(7,9),(23,21),(15,4)]: px(s,x,y,'grass_d'); px(s,x+1,y-1,'grass')
    save(s,'tiles/winter/snow_grass.png',note='seamless, rumput bersalju')
    d=noise_tile('frost_dirt','dirt_d','frost_dirt_l',12,0.12); save(d,'tiles/winter/dirt_frozen.png',note='seamless')
    sa=noise_tile('sand','sand_d','snow',13,0.10); save(sa,'tiles/winter/sand_winter.png',note='seamless, pasir berembun')
    ic=noise_tile('ice','ice_d','ice_l',14,0.02); r=random.Random(3)
    for _ in range(5):
        x,y=r.randrange(32),r.randrange(32); l=r.randrange(4,9)
        for k in range(l): px(ic,(x+k)%32,(y+k//2)%32,'ice_l')
    for _ in range(3):
        x,y=r.randrange(32),r.randrange(32)
        for k in range(5): px(ic,(x+k)%32,(y-k)%32,'ice_d')
    save(ic,'tiles/winter/ice.png',note='seamless, air beku')
    globals().update(_snow=s,_ice=ic,_fdirt=d)
def winter_trees():
    base=Image.open(os.path.join(ROOT,'nature/tree.png')).convert('RGBA')
    im=base.copy(); a=im.split()[3]
    for y in range(1,44):
        for x in range(32):
            c=im.getpixel((x,y))
            if c[3]==255 and c[:3]!=PALETTE['outline'] and im.getpixel((x,y-1))[:3]==PALETTE['outline'] or (c[3]==255 and c[:3]==PALETTE['grass_l']):
                for k in range(3 if c[:3]!=PALETTE['grass_l'] else 1):
                    if y+k<44 and im.getpixel((x,y+k))[3]==255 and im.getpixel((x,y+k))[:3]!=PALETTE['outline']: px(im,x,y+k,'snow' if k else 'snow_l')
    save(im,'nature/winter/tree_snow.png',note='32x64, sama anchor dengan tree.png')
    b=new(32,64); d=ImageDraw.Draw(b)
    rect(b,13,30,18,58,'wood'); rect(b,13,30,14,58,'wood_d'); rect(b,17,32,18,58,'wood_l')
    for (x0,y0,x1,y1) in[(15,32,6,18),(16,30,26,14),(15,22,11,8),(16,24,21,6),(8,22,4,14),(23,20,28,22),(14,40,7,33),(17,38,25,31)]:
        d.line([(x0,y0),(x1,y1)],fill=P('wood'),width=2)
    for x,y in[(6,17),(26,13),(11,7),(21,5),(4,13),(28,21)]: px(b,x,y,'snow_l'); px(b,x+1,y,'snow')
    b=shadow(outline(b),16,58,9,3); save(b,'nature/winter/tree_bare.png',note='32x64, pohon gundul')
    sb=Image.open(os.path.join(ROOT,'nature/berry_bush_empty.png')).convert('RGBA')
    for y in range(1,20):
        for x in range(32):
            if sb.getpixel((x,y))[3]==255 and sb.getpixel((x,y-1))[:3]==PALETTE['outline'] and sb.getpixel((x,y))[:3]!=PALETTE['outline']:
                px(sb,x,y,'snow_l'); px(sb,x,y+1,'snow')
    save(sb,'nature/winter/berry_bush_snow.png')
    rk=Image.open(os.path.join(ROOT,'nature/rock.png')).convert('RGBA')
    for y in range(1,26):
        for x in range(32):
            if rk.getpixel((x,y))[3]==255 and rk.getpixel((x,y-1))[:3]==PALETTE['outline'] and rk.getpixel((x,y))[:3]!=PALETTE['outline']:
                px(rk,x,y,'snow_l'); px(rk,x,y+1,'snow')
    save(rk,'nature/winter/rock_snow.png')
# ---------- CROPS ----------
def tilled():
    im=new(); rect(im,1,1,30,30,'dirt_d')
    for y in range(3,30,7): rect(im,2,y,29,y+3,'dirt'); rect(im,2,y,29,y,'dirt_l')
    return im
def crops():
    for crop in('wheat','carrot'):
        sh=new(32*6,32)
        for st in range(6):
            im=tilled()
            for y in range(3,30,7):
                for x in range(5,29,6):
                    if st==1: px(im,x,y+1,'dirt_d'); px(im,x,y+2,'straw_l')
                    elif st==2: px(im,x,y+1,'leaf_l'); px(im,x-1,y,'leaf_l'); px(im,x+1,y,'leaf')
                    elif st==3:
                        if crop=='wheat': rect(im,x,y-2,x,y+2,'leaf'); px(im,x-1,y-1,'leaf_l'); px(im,x+1,y,'leaf_d')
                        else: rect(im,x-1,y-1,x+1,y+1,'leaf'); px(im,x,y-2,'leaf_l'); px(im,x-2,y,'leaf_d'); px(im,x+2,y,'leaf_d')
                    elif st==4:
                        if crop=='wheat': rect(im,x,y-2,x,y+2,'straw_d'); rect(im,x-1,y-4,x+1,y-2,'wheat'); px(im,x,y-5,'straw_l'); px(im,x-1,y-1,'leaf')
                        else: rect(im,x-1,y+1,x+1,y+2,'carrot'); px(im,x,y+3,'carrot_d'); rect(im,x-1,y-3,x+1,y,'leaf'); px(im,x-2,y-3,'leaf_l'); px(im,x+2,y-2,'leaf_d')
                    elif st==5:
                        if crop=='wheat': px(im,x,y+1,'straw_d'); px(im,x+1,y+1,'straw'); px(im,x-1,y+2,'straw_l')
                        else: px(im,x,y+1,'dirt_d'); px(im,x+1,y+1,'dirt_d'); px(im,x-1,y,'leaf_d')
            if st==0:
                r=random.Random(7)
                for _ in range(12): px(im,r.randrange(3,29),r.randrange(3,29),'dirt_l')
            sh.paste(outline(im,'wood_d'),(st*32,0))
        save(sh,f'nature/crops/crop_{crop}.png',(32,32),6,'urutan: diolah, benih, tunas, tumbuh, siap panen, sudah dipanen')
# ---------- WORK ANIMATIONS ----------
def draw_tool(im,hx,hy,ang,tool,length=9):
    d=ImageDraw.Draw(im); a=math.radians(ang)
    ex,ey=hx+length*math.cos(a),hy+length*math.sin(a)
    d.line([(hx,hy),(ex,ey)],fill=P('wood_d'),width=2)
    px_,py_=-math.sin(a),math.cos(a)
    if tool=='axe':
        pts=[(ex,ey),(ex+px_*4,ey+py_*4),(ex-math.cos(a)*3+px_*4,ey-math.sin(a)*3+py_*4),(ex-math.cos(a)*3,ey-math.sin(a)*3)]
        d.polygon(pts,fill=P('stone_l')); d.line([pts[1],pts[2]],fill=P('white'))
    else:
        d.line([(ex+px_*4-math.cos(a)*2,ey+py_*4-math.sin(a)*2),(ex,ey),(ex-px_*4-math.cos(a)*2,ey-py_*4-math.sin(a)*2)],fill=P('stone_l'),width=2)
def work_frame(v,dirn,f,kind):
    if kind=='carry':
        im=villager_frame(v,dirn,f,True); bob=1 if f in(1,3) else 0
        tmp=new(); d=ImageDraw.Draw(tmp)
        if f%2==0 or True:
            rect(tmp,9,0-bob+1,22,6-bob+1,'wood_l'); rect(tmp,9,6-bob,22,6-bob+1,'wood_d'); rect(tmp,15,0-bob+1,16,6-bob,'wood')
            px(tmp,11,2-bob,'berry'); px(tmp,19,2-bob,'wheat'); px(tmp,13,1-bob,'stone_l')
        tmp=outline(tmp)
        # hands up
        skin=v[0]; rect(tmp,8,6-bob,9,8-bob,skin); rect(tmp,22,6-bob,23,8-bob,skin)
        im.alpha_composite(tmp); return im
    im=villager_frame(v,dirn,0,False)
    tool='axe' if kind=='chop' else 'pick'
    angs=[-110,-70,-10,30]
    lay=new()
    if dirn=='right': draw_tool(lay,19,20,angs[f],tool)
    elif dirn=='left': draw_tool(lay,12,20,180-angs[f],tool)
    elif dirn=='down':
        dy=[-6,-3,4,7][f]; draw_tool(lay,22,19,[-100,-90,60,80][f],tool,8+(f>1))
    else: draw_tool(lay,21,17,[-80,-90,-110,-120][f],tool,8)
    lay=outline(lay)
    if dirn=='up': lay.alpha_composite(im); im=lay
    else: im.alpha_composite(lay)
    if f==3:
        c='wood_l' if kind=='chop' else 'stone_l'
        pos={'right':(28,26),'left':(3,26),'down':(25,29),'up':(24,5)}[dirn]
        for dx,dy in((0,0),(2,-2),(-2,-1),(1,-4)): px(im,pos[0]+dx,pos[1]+dy,c)
    return im
def villagers_work():
    dirs=['down','left','right','up']
    for i,v in enumerate(VARS):
        sh=new(32*4,32*12)
        for k,kind in enumerate(['chop','mine','carry']):
            for r,dn in enumerate(dirs):
                for f in range(4): sh.paste(work_frame(v,dn,f,kind),(f*32,(k*4+r)*32))
        save(sh,f'characters/villager_{i+1}_work.png',(32,32),48,'12 baris x 4 kolom: 0-3 menebang, 4-7 menambang, 8-11 membawa (arah bawah,kiri,kanan,atas)')
# ---------- ADVANCED BUILDINGS ----------
def window(im,x,y,lit=False):
    rect(im,x,y,x+10,y+10,'wood_d'); rect(im,x+1,y+1,x+9,y+9,'fire_l' if lit else 'water_l')
    if lit: rect(im,x+2,y+2,x+4,y+4,'fire_w')
    rect(im,x+5,y+1,x+5,y+9,'wood_d'); rect(im,x+1,y+5,x+9,y+5,'wood_d')
def door(im,x0,y0,x1,y1,lit=False):
    rect(im,x0,y0,x1,y1,'wood_d'); rect(im,x0+1,y0+1,x1-1,y1,'fire' if lit else 'wood'); px(im,x1-2,(y0+y1)//2,'fire_l')
def log_wall(im,x0,y0,x1,y1,step=5):
    rect(im,x0,y0,x1,y1,'wood_l')
    for y in range(y0+2,y1,step): rect(im,x0,y,x1,y,'wood')
    rect(im,x0,y0,x0+2,y1,'wood_d'); rect(im,x1-2,y0,x1,y1,'wood_d')
def kitchen(lit=False):
    im=new(64,64); log_wall(im,8,30,55,58); roof_tri(im,2,61,4,36,'roof','roof_d','roof_l'); rect(im,2,34,61,37,'roof_d')
    rect(im,42,8,48,24,'stone'); rect(im,41,6,49,8,'stone_d')
    window(im,13,40,lit); door(im,34,42,44,58,lit)
    rect(im,48,50,54,57,'stone_d'); ell(im,(47,47,55,52),'stone'); px(im,51,48,'fire_l')
    im=outline(im)
    for i,(x,y) in enumerate([(45,3),(47,0),(44,-2)]): ImageDraw.Draw(im).ellipse([x-2,y-1+2,x+2,y+3],fill=PALETTE['smoke'])
    return shadow(im,32,59,28,4)
def workshop(lit=False):
    im=new(96,64); log_wall(im,6,26,89,58)
    d=ImageDraw.Draw(im); d.polygon([(2,28),(12,6),(84,6),(94,28)],fill=P('wood_d'))
    for x in range(12,84,6): d.line([(x,6),(x-6+ (x-12)*0.2,28)],fill=P('wood'))
    rect(im,2,26,94,29,'wood'); 
    rect(im,40,34,70,58,'outline'); rect(im,42,36,68,58,'wood_d')
    if lit: rect(im,42,36,68,58,'fire_d'); rect(im,44,38,66,50,'fire')
    rect(im,48,48,60,51,'stone_d'); rect(im,51,51,57,57,'stone_d'); rect(im,46,46,62,48,'stone')
    window(im,14,36,lit)
    for x,c in((76,'stone_l'),(82,'wood_l')): rect(im,x,40,x+1,52,'wood_d'); rect(im,x-2,38,x+3,40,c)
    rect(im,18,52,32,57,'wood'); rect(im,18,52,32,52,'wood_l'); rect(im,20,49,22,52,'stone_l')
    return shadow(outline(im),48,59,44,4)
def granary(lit=False):
    im=new(64,96)
    for x in(12,28,36,50): rect(im,x,70,x+3,90,'wood_d')
    rect(im,6,66,57,70,'wood')
    log_wall(im,8,34,55,66,4)
    roof_tri(im,2,61,6,40,'straw','straw_d','straw_l'); rect(im,2,38,61,41,'straw_d')
    door(im,26,46,38,66,lit)
    d=ImageDraw.Draw(im); d.line([(26,70),(20,92)],fill=P('wood'),width=2); d.line([(38,70),(44,92)],fill=P('wood'),width=2)
    for y in range(74,92,5): d.line([(26-(y-70)*6/22,y),(38+(y-70)*6/22,y)],fill=P('wood_l'))
    for x,y in((10,84),(48,86)): ell(im,(x,y,x+8,y+7),'straw'); px(im,x+4,y+1,'straw_l')
    return shadow(outline(im),32,91,28,4)
def market(lit=False):
    im=new(96,64); cols=[('roof','white'),('cloth2','white'),('cloth4','roof')]
    for i,(c1,c2) in enumerate(cols):
        x0=4+i*30
        rect(im,x0+2,24,x0+3,56,'wood_d'); rect(im,x0+24,24,x0+25,56,'wood_d')
        rect(im,x0,40,x0+27,50,'wood'); rect(im,x0,40,x0+27,41,'wood_l')
        for j in range(7): rect(im,x0+j*4,14,x0+j*4+3,24,c1 if j%2==0 else c2)
        for j in range(7): ell(im,(x0+j*4,22,x0+j*4+3,27),c1 if j%2==0 else c2)
        goods=[('berry','berry_l'),('wheat','straw_l'),('carrot','leaf')][i]
        for k in range(5): ell(im,(x0+2+k*5,36,x0+6+k*5,40),goods[0]); px(im,x0+3+k*5,37,goods[1])
        if lit: rect(im,x0+13,28,x0+14,31,'fire_l')
    return shadow(outline(im),48,58,44,4)
def town_hall(lit=False):
    im=new(128,96); log_wall(im,10,44,117,88)
    rect(im,10,44,117,46,'stone'); rect(im,10,84,117,88,'stone_d')
    roof_tri(im,2,125,8,52,'roof','roof_d','roof_l'); rect(im,2,50,125,54,'roof_d')
    rect(im,54,0,73,18,'wood_l'); roof_tri(im,50,77,-6,8,'roof','roof_d','roof_l')
    ell(im,(58,4,69,15),'white'); rect(im,63,6,64,10,'black'); rect(im,63,9,66,10,'black')
    for x in(20,36,82,98): window(im,x,60,lit)
    rect(im,54,58,73,88,'wood_d'); rect(im,56,60,71,88,'fire' if lit else 'wood'); rect(im,63,60,64,88,'wood_d')
    ImageDraw.Draw(im).pieslice([54,52,73,68],180,360,fill=P('wood_d'))
    rect(im,50,88,77,91,'stone_l')
    for x in(14,110): rect(im,x,30,x+1,44,'wood_d'); rect(im,x+2,30,x+9,36,'cloth4' if x<50 else 'cloth2')
    return shadow(outline(im),64,91,58,4)
def bridges():
    h=new(96,32)
    for x in range(0,96,6):
        rect(h,x,8,x+5,25,'wood_l' if (x//6)%2 else 'wood'); rect(h,x,8,x,25,'wood_d')
    rect(h,0,6,95,8,'wood_d'); rect(h,0,25,95,27,'wood_d')
    for x in(0,30,62,92): rect(h,x,4,x+3,9,'wood'); rect(h,x,24,x+3,29,'wood')
    h=outline(h); sh=new(96,32); sh.alpha_composite(h)
    save(sh,'buildings/bridge_h.png',(32,32),3,'3 tile horizontal: ujung kiri, tengah (boleh diulang), ujung kanan; tengah menyambung mulus')
    v=new(32,96)
    for y in range(0,96,6):
        rect(v,8,y,23,y+5,'wood_l' if (y//6)%2 else 'wood'); rect(v,8,y+5,23,y+5,'wood_d')
    rect(v,6,0,8,95,'wood_d'); rect(v,23,0,25,95,'wood_d')
    for y in(0,30,62,90): rect(v,4,y,9,y+4,'wood'); rect(v,22,y,27,y+4,'wood')
    save(outline(v),'buildings/bridge_v.png',(32,32),3,'3 tile vertikal: ujung atas, tengah (boleh diulang), ujung bawah')
def adv_buildings():
    for fn,name,note in[(kitchen,'kitchen','64x64 (2x2)'),(workshop,'workshop','96x64 (3x2), bengkel alat'),(granary,'granary','64x96 (2x3), lumbung panggung'),
                        (market,'market','96x64 (3x2)'),(town_hall,'town_hall','128x96 (4x3), balai desa')]:
        save(fn(False),f'buildings/{name}.png',note=note)
        save(fn(True),f'buildings/night/{name}_night.png',note=note+', jendela/pintu menyala')
    bridges()
# ---------- NIGHT ----------
def radial(size,col,alpha,steps=5):
    im=new(size,size); d=ImageDraw.Draw(im); c=size/2
    for i in range(steps):
        r=c*(1-i/steps); a=int(alpha*(i+1)/steps)
        d.ellipse([c-r,c-r,c+r,c+r],fill=col+(a,))
    return im
def night():
    o=Image.new('RGBA',(32,32),PALETTE['night']); save(o,'effects/night/night_overlay.png',note='tile 32x32 RGBA (22,28,70,150); ulangi/stretch menutup layar, blend normal')
    save(radial(64,PALETTE['fire_l'],170),'effects/night/light_glow_small.png',note='64x64, untuk obor/lentera; gambar SETELAH overlay, blend additive/screen')
    save(radial(128,PALETTE['fire_l'],170,6),'effects/night/light_glow_large.png',note='128x128, untuk api unggun/rumah')
    sh=new(128,32)
    for f in range(4):
        im=new(); rect(im,15,14,16,30,'wood_d'); rect(im,14,12,17,14,'wood')
        hh=[0,1,2,1][f]
        ImageDraw.Draw(im).polygon([(12,12),(15+(f%2),3-hh),(19,12)],fill=P('fire'))
        ImageDraw.Draw(im).polygon([(14,12),(16-(f%2),6-hh),(17,12)],fill=P('fire_l'))
        px(im,15,10,'fire_w'); sh.paste(shadow(outline(im),16,30,4,1),(f*32,0))
    save(sh,'effects/night/torch.png',(32,32),4,'obor, 4 frame horizontal ~120ms')
    for lit,name in((False,'lantern_post'),(True,'lantern_post_lit')):
        im=new(32,64); rect(im,15,20,16,60,'wood_d'); rect(im,15,18,24,19,'wood_d')
        rect(im,20,20,21,22,'stone_d'); rect(im,18,23,23,31,'stone_d'); rect(im,19,24,22,30,'fire_l' if lit else 'stone')
        if lit: rect(im,20,25,21,28,'fire_w')
        rect(im,17,22,24,23,'roof_d'); rect(im,13,58,18,60,'stone')
        save(shadow(outline(im),16,60,5,2),f'effects/night/{name}.png',note='32x64 tiang lentera')
    for lit,name in((False,'lantern'),(True,'lantern_lit')):
        im=new(); rect(im,15,6,16,9,'stone_d'); rect(im,12,9,19,11,'roof_d'); rect(im,12,12,19,22,'stone_d'); rect(im,13,13,18,21,'fire_l' if lit else 'stone')
        if lit: rect(im,15,15,16,19,'fire_w')
        rect(im,12,23,19,24,'roof_d'); save(outline(im),f'effects/night/{name}.png',note='lentera gantung/meja 32x32')
    for src in('wooden_house','hut'):
        im=Image.open(os.path.join(ROOT,f'buildings/{src}.png')).convert('RGBA'); px_=im.load()
        for y in range(im.height):
            for x in range(im.width):
                c=px_[x,y]
                if c[3]==255 and c[:3]==PALETTE['water_l']: px_[x,y]=P('fire_l')
        if src=='hut': rect(im,29,43,35,56,'fire'); rect(im,30,48,34,56,'fire_l')
        else: rect(im,43,65,53,88,'fire'); rect(im,45,70,51,88,'fire_l')
        save(im,f'buildings/night/{src}_night.png',note='versi malam tahap-1, jendela/pintu menyala')
# =====================================================================
# TAHAP 3 (hanya menambah file baru; output tahap 1-2 tidak berubah)
# =====================================================================
PALETTE.update({'dusk':(150,70,120,90),'dawn':(250,186,140,70),'parch':(246,230,190),'parch_d':(222,196,146),
                'leather':(160,98,60),'brick':(196,92,64),'brick_d':(150,64,52),'gold':(246,196,64),'gold_d':(196,138,40),'silver':(214,214,226)})
FONT={  # 5x7, '#'=isi
'A':[" ### ","#   #","#   #","#####","#   #","#   #","#   #"],'B':["#### ","#   #","#   #","#### ","#   #","#   #","#### "],
'D':["#### ","#   #","#   #","#   #","#   #","#   #","#### "],'E':["#####","#    ","#    ","#### ","#    ","#    ","#####"],
'G':[" ####","#    ","#    ","#  ##","#   #","#   #"," ### "],'H':["#   #","#   #","#   #","#####","#   #","#   #","#   #"],
'I':["#####","  #  ","  #  ","  #  ","  #  ","  #  ","#####"],'K':["#   #","#  # ","# #  ","##   ","# #  ","#  # ","#   #"],
'L':["#    ","#    ","#    ","#    ","#    ","#    ","#####"],'M':["#   #","## ##","# # #","# # #","#   #","#   #","#   #"],
'N':["#   #","##  #","# # #","#  ##","#   #","#   #","#   #"],'O':[" ### ","#   #","#   #","#   #","#   #","#   #"," ### "],
'P':["#### ","#   #","#   #","#### ","#    ","#    ","#    "],'R':["#### ","#   #","#   #","#### ","# #  ","#  # ","#   #"],
'S':[" ####","#    ","#    "," ### ","    #","    #","#### "],'T':["#####","  #  ","  #  ","  #  ","  #  ","  #  ","  #  "],
'U':["#   #","#   #","#   #","#   #","#   #","#   #"," ### "],' ':["     "]*7,'.':["     "]*6+["  #  "],
}
def text_mask(txt,sc,gap=1):
    w=(len(txt)*(5+gap)-gap)*sc; m=Image.new('L',(w,7*sc),0); d=ImageDraw.Draw(m)
    for i,ch in enumerate(txt):
        g=FONT[ch]
        for y,row in enumerate(g):
            for x,c in enumerate(row):
                if c=='#': d.rectangle([(i*(5+gap)+x)*sc,y*sc,(i*(5+gap)+x)*sc+sc-1,y*sc+sc-1],fill=255)
    return m
def text_img(txt,sc,cols,outline_px=1,shadow_px=1):
    m=text_mask(txt,sc); pad=outline_px+shadow_px+1
    im=new(m.width+pad*2,m.height+pad*2); fill=new(m.width,m.height)
    for y in range(m.height):
        c=cols[min(len(cols)-1,y*len(cols)//m.height)]; ImageDraw.Draw(fill).line([(0,y),(m.width,y)],fill=P(c))
    # highlight
    for y in range(m.height):
        for x in range(m.width):
            if m.getpixel((x,y)) and (y==0 or not m.getpixel((x,y-1))) and len(cols)>2: fill.putpixel((x,y),P('white') if sc>2 else fill.getpixel((x,y)))
    body=new(m.width,m.height); body.paste(fill,(0,0),m); im.paste(body,(pad-shadow_px//2*0,pad))
    for _ in range(outline_px): im=outline(im)
    if shadow_px:
        sh=new(im.width,im.height); a=im.split()[3]; s=Image.new('RGBA',im.size,P('outline')); sh.paste(s,(0,shadow_px),a)
        im=Image.alpha_composite(sh,im)
    return im
def logo_img():
    top=text_img('DESA',3,['leaf_l','leaf','leaf_d'],2,2); bot=text_img('MANDIRI',4,['fire_l','fire','roof','roof_d'],2,3)
    W=max(top.width,bot.width)+8; H=top.height+bot.height+10
    im=new(W,H); im.alpha_composite(top,((W-top.width)//2,6)); im.alpha_composite(bot,((W-bot.width)//2,top.height+2))
    # tunas daun di atas huruf D
    sp=new(16,12); d=ImageDraw.Draw(sp); rect(sp,7,5,8,11,'leaf_d'); ell(sp,(1,2,7,7),'leaf_l'); ell(sp,(8,0,14,6),'leaf'); px(sp,3,3,'white')
    sp=outline(sp); im.alpha_composite(sp,((W-top.width)//2+2,0))
    # sparkle magis
    for x,y in((W-14,8),(10,H-14),(W-26,H-10)):
        px(im,x,y,'white'); [px(im,x+a,y+b,'magic_l') for a,b in((1,0),(-1,0),(0,1),(0,-1))]; [px(im,x+2*a,y+2*b,'magic') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
    return im
def logos():
    lg=logo_img()
    for s in(1,2,4): save(lg.resize((lg.width*s,lg.height*s),Image.NEAREST),f'ui/logo/logo_{s}x.png',note=f'logo {s}x (nearest)')
    ic=new(); ell(ic,(2,4,29,30),'leaf'); ell(ic,(4,5,27,22),'leaf_l')
    t=text_img('DM',2,['fire_l','fire','roof_d'],1,1) if 'M' in FONT else None
    ic=outline(ic); ic.alpha_composite(t,((32-t.width)//2,10)); save(ic,'ui/logo/logo_icon_32.png',note='ikon/favicon 32x32')
    save(ic.resize((64,64),Image.NEAREST),'ui/logo/logo_icon_64.png',note='ikon 64x64'); return lg
def build_title_scene():
    """640x360 scene desa dari aset tahap 1-2."""
    W,H=20,12; R=lambda p:Image.open(os.path.join(ROOT,p)).convert('RGBA')
    idx={m:i for i,m in enumerate(BLOB_MASKS)}
    water=[[1 if (x>=16 or (x==15 and y>=7)) else 0 for x in range(W)] for y in range(H)]
    path=[[1 if (y==8 and 2<=x<=15) or (x==8 and 4<=y<=11) else 0 for x in range(W)] for y in range(H)]
    def bt(sheet,grid,x,y):
        m=0
        for k,(dx,dy) in OFF.items():
            X,Y=x+dx,y+dy
            if not(0<=Y<H and 0<=X<W) or grid[Y][X]: m|=BIT[k]
        i=idx[blob_normalize(m)]; return sheet.crop(((i%8)*32,(i//8)*32,(i%8)*32+32,(i//8)*32+32))
    sc=Image.new('RGBA',(640,384)); g=R('tiles/grass.png'); gf=R('tiles/grass_flowers.png')
    ws=R('tiles/autotile_water_grass.png'); ps=R('tiles/autotile_path_grass.png'); r=random.Random(2)
    for y in range(H):
        for x in range(W):
            t=bt(ws,water,x,y) if water[y][x] else bt(ps,path,x,y) if path[y][x] else (gf if r.random()<.15 else g)
            sc.paste(t,(x*32,y*32))
    def put(p,tx,ty,crop=None,dy=0):
        im=R(p); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(tx*32,ty*32+32-im.height+dy))
    for tx,ty in((0,5),(1,10),(18,1) if False else (14,5),(0,8),(19,11) if False else (13,11)): put('nature/tree.png',tx,ty)
    put('buildings/wooden_house.png',3,7); put('buildings/hut.png',10,7); put('buildings/kitchen.png',12,7)
    put('buildings/bridge_h.png',15,8,(0,0,32,32)); put('buildings/bridge_h.png',16,8,(32,0,64,32)); put('buildings/bridge_h.png',17,8,(32,0,64,32)); put('buildings/bridge_h.png',18,8,(32,0,64,32)); put('buildings/bridge_h.png',19,8,(64,0,96,32))
    sc.alpha_composite(R('effects/campfire_glow.png'),(7*32-32,9*32-32)); put('buildings/campfire.png',8,9,(32,0,64,32))
    for i,x in enumerate(range(2,6)): put('nature/crops/crop_wheat.png',x,10,(128,0,160,32)); put('nature/crops/crop_carrot.png',x,11,(96,0,128,32))
    put('characters/villager_1.png',7,9,(0,64,32,96)); put('characters/villager_2.png',9,9,(0,32,32,64)); put('characters/villager_3_work.png',11,10,(0,32*8,32,32*9))
    put('nature/berry_bush_full.png',1,7); put('nature/rock.png',14,10); put('nature/tree.png',6,6)
    return sc.crop((0,24,640,384))
def title_screens(lg):
    sc=build_title_scene()
    # pita gelap lembut di atas agar logo terbaca
    band=new(640,360); d=ImageDraw.Draw(band)
    for y in range(150): d.line([(0,y),(640,y)],fill=(40,30,50,int(130*(1-y/150))))
    sc=Image.alpha_composite(sc,band)
    l2=lg.resize((lg.width*2,lg.height*2),Image.NEAREST); sc.alpha_composite(l2,((640-l2.width)//2,18))
    t=text_img('TEKAN UNTUK MULAI',1,['white'],1,1); t=t.resize((t.width*2,t.height*2),Image.NEAREST)
    pn=new(t.width+16,t.height+8); rect(pn,0,0,pn.width-1,pn.height-1,'outline'); rect(pn,1,1,pn.width-2,pn.height-2,'wood_d')
    pn.alpha_composite(t,(8,4)); sc.alpha_composite(pn,((640-pn.width)//2,318))
    save(sc,'ui/title/title_640x360.png',note='layar judul')
    save(sc.resize((1280,720),Image.NEAREST),'ui/title/title_1280x720.png',note='layar judul (2x nearest)')
    bg=build_title_scene(); save(bg,'ui/title/title_bg_640x360.png',note='scene tanpa logo/teks (untuk disusun sendiri)')
# ---------- UI SKIN ----------
def panel(fill='parch',fill_d='parch_d',frame=('wood_d','wood','wood_l'),size=48):
    im=new(size,size); s=size-1
    rect(im,0,0,s,s,'outline'); rect(im,1,1,s-1,s-1,frame[0]); rect(im,2,2,s-2,s-2,frame[1]); rect(im,2,2,s-2,2,frame[2]); rect(im,2,2,2,s-2,frame[2])
    rect(im,5,5,s-5,s-5,frame[0]); rect(im,6,6,s-6,s-6,fill); rect(im,6,6,s-6,7,fill_d); rect(im,6,6,7,s-6,fill_d)
    for x,y in((3,3),(s-3,3),(3,s-3),(s-3,s-3)): px(im,x,y,'gold'); px(im,x+1 if x<9 else x-1,y,'gold_d')
    for p_ in((0,0),(s,0),(0,s),(s,s)): im.putpixel(p_,(0,0,0,0))
    return im
def button(state):
    im=new(64,24); face={'normal':('wood_l','straw_l'),'hover':('straw','straw_l'),'pressed':('wood','wood_l'),'disabled':('stone','stone_l')}[state]
    lip='stone_d' if state=='disabled' else 'wood_d'; off=2 if state=='pressed' else 0
    rect(im,0,off,63,23,'outline'); rect(im,1,1+off,62,22,lip); rect(im,1,1+off,62,19 if state!='pressed' else 21,face[0]); rect(im,2,2+off,61,2+off,face[1])
    for p_ in((0,off),(63,off),(0,23),(63,23)): im.putpixel(p_,(0,0,0,0))
    return im
def tab(active):
    im=new(64,24); y0=0 if active else 4
    rect(im,0,y0,63,23,'outline'); rect(im,1,y0+1,62,23,'parch' if active else 'wood'); rect(im,2,y0+1,61,y0+2,'white' if active else 'wood_l')
    if active: rect(im,1,23,62,23,'parch')
    im.putpixel((0,y0),(0,0,0,0)); im.putpixel((63,y0),(0,0,0,0)); return im
def ui_skin():
    save(panel(),'ui/skin/panel.png',note='9-slice, margin 8px semua sisi (inset konten 6px)')
    save(panel('wood_l','wood',('outline','wood_d','wood')),'ui/skin/panel_wood.png',note='9-slice, margin 8px; varian kayu (HUD)')
    sh=new(256,24)
    for i,s in enumerate(['normal','hover','pressed','disabled']):
        b=button(s); save(b,f'ui/skin/button_{s}.png',note='9-slice, margin kiri/kanan 6, atas 4, bawah 6'); sh.paste(b,(i*64,0))
    save(sh,'ui/skin/button_states.png',(64,24),4,'urutan: normal, hover, pressed, disabled')
    save(tab(True),'ui/skin/tab_active.png',note='9-slice margin 6 (bawah 0, menyatu dengan panel)'); save(tab(False),'ui/skin/tab_inactive.png',note='9-slice margin 6')
    tt=new(24,24); rect(tt,0,0,23,23,'outline'); rect(tt,1,1,22,22,'cloth_d'); rect(tt,2,2,21,2,'magic'); [tt.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(23,0),(0,23),(23,23))]
    save(tt,'ui/skin/tooltip.png',note='9-slice, margin 4px; teks putih')
    ar=new(8,5); ImageDraw.Draw(ar).polygon([(0,0),(7,0),(3.5,4)],fill=P('outline')); ImageDraw.Draw(ar).polygon([(1,0),(6,0),(3.5,3)],fill=P('cloth_d'))
    save(ar,'ui/skin/tooltip_arrow.png',note='taruh di bawah tooltip, menunjuk ke bawah')
    bf=new(64,12); rect(bf,0,0,63,11,'outline'); rect(bf,1,1,62,10,'wood_d'); rect(bf,2,2,61,9,'cloth_d'); [bf.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(63,0),(0,11),(63,11))]
    save(bf,'ui/skin/bar_frame.png',note='9-slice margin 3; area isi x2..61, y2..9')
    for n,c,cl in(('red','berry','berry_l'),('blue','water','water_l'),('yellow','fire_l','fire_w'),('green','grass','grass_l'),('purple','magic','magic_l')):
        f=new(8,8); rect(f,0,0,7,7,c); rect(f,0,0,7,1,cl); rect(f,0,7,7,7,'outline') if False else None; save(f,f'ui/skin/bar_fill_{n}.png',note='stretch horizontal mengisi area bar')
    cb=new(16,16); rect(cb,0,0,15,15,'outline'); rect(cb,1,1,14,14,'parch'); save(cb,'ui/skin/checkbox_off.png')
    cb2=cb.copy(); d=ImageDraw.Draw(cb2); d.line([(3,8),(6,11),(12,4)],fill=P('leaf_d'),width=2); save(cb2,'ui/skin/checkbox_on.png')
# ---------- ICONS ----------
def icon_draw(fn):
    im=new(); fn(im,ImageDraw.Draw(im)); return outline(im)
def I_hunger(im,d):  # paha ayam / makanan
    ell(im,(6,6,22,22),'wood_l'); ell(im,(8,7,18,15),'dirt_l'); d.line([(19,19),(26,26)],fill=P('white'),width=3); ell(im,(24,22,29,27),'white'); ell(im,(22,25,27,30),'white')
def I_thirst(im,d):
    d.polygon([(8,8),(24,8),(22,28),(10,28)],fill=P('stone_l')); d.polygon([(10,14),(22,14),(21,27),(11,27)],fill=P('water')); rect(im,11,15,13,24,'water_l'); rect(im,7,6,25,8,'stone')
def I_energy(im,d):
    ell(im,(5,5,25,27),'fire_l'); ell(im,(11,2,29,22),(0,0,0,0)) if False else None
    m=new(); ell(m,(11,1,29,21),'white'); a=m.split()[3]; im.paste((0,0,0,0),(0,0),a)
    ell(im,(8,10,12,14),'fire_w');
    for x,y in((22,18),(26,12)): d.line([(x,y),(x+3,y),(x,y+3),(x+3,y+3)],fill=P('water_l'))
def I_mood(im,d):
    ell(im,(4,4,27,27),'fire_l'); ell(im,(6,5,20,15),'fire_w'); rect(im,10,11,11,14,'black'); rect(im,20,11,21,14,'black'); d.arc((9,12,22,23),20,160,fill=P('black'),width=2); px(im,8,17,'berry_l'); px(im,23,17,'berry_l')
def I_mood_sad(im,d):
    ell(im,(4,4,27,27),'water_l'); rect(im,10,11,11,14,'black'); rect(im,20,11,21,14,'black'); d.arc((9,18,22,28),200,340,fill=P('black'),width=2); rect(im,21,15,21,18,'water')
def I_health(im,d):
    ell(im,(4,6,16,18),'berry'); ell(im,(15,6,27,18),'berry'); d.polygon([(5,14),(26,14),(16,26)],fill=P('berry')); ell(im,(7,8,12,12),'berry_l'); px(im,8,9,'white')
def I_warmth(im,d):
    d.polygon([(8,26),(16,4),(24,26)],fill=P('fire_d')); d.polygon([(11,26),(16,10),(21,26)],fill=P('fire')); d.polygon([(13,26),(16,16),(19,26)],fill=P('fire_l'))
def I_sleep(im,d):
    rect(im,4,16,27,24,'wood'); rect(im,4,13,10,18,'white'); rect(im,10,15,27,20,'cloth2'); rect(im,4,24,5,27,'wood_d'); rect(im,26,24,27,27,'wood_d')
    for x,y in((16,4),(22,8)): d.line([(x,y),(x+3,y),(x,y+3),(x+3,y+3)],fill=P('magic'))
def axe(d,ox=0,oy=0):
    d.line([(8+ox,26+oy),(22+ox,8+oy)],fill=P('wood'),width=3); d.polygon([(18+ox,4+oy),(27+ox,7+oy),(25+ox,15+oy),(20+ox,11+oy)],fill=P('stone_l'))
def S_chop(im,d): axe(d); ell(im,(3,22,13,30),'leaf')
def S_mine(im,d):
    d.line([(7,27),(21,9)],fill=P('wood'),width=3); d.arc((6,2,30,22),190,320,fill=P('stone_l'),width=3); ell(im,(18,22,28,30),'stone')
def S_gather(im,d):
    d.arc((7,4,25,22),180,360,fill=P('wood_d'),width=2); d.polygon([(5,14),(27,14),(24,28),(8,28)],fill=P('straw')); [d.line([(x,15),(x,27)],fill=P('straw_d')) for x in(11,16,21)]
    for x,y in((9,10),(14,8),(19,10),(23,12)): ell(im,(x-2,y,x+2,y+4),'berry'); px(im,x-1,y+1,'berry_l')
def S_build(im,d):
    rect(im,4,22,27,27,'wood_l'); rect(im,4,22,27,22,'wood'); d.line([(10,20),(22,8)],fill=P('wood'),width=3); rect(im,17,3,27,9,'stone'); rect(im,17,3,27,4,'stone_l')
def S_farm(im,d):
    for x in(10,16,22): d.line([(x,28),(x+(x-16)//3,10)],fill=P('straw_d'),width=2); ell(im,(x-3+(x-16)//3,4,x+2+(x-16)//3,13),'wheat')
    rect(im,8,20,24,22,'leaf')
def S_hunt(im,d):
    d.arc((2,2,22,30),300,60,fill=P('wood'),width=3); d.line([(14,3),(14,29)],fill=P('white')); d.line([(6,16),(28,16)],fill=P('wood_d'),width=2); d.polygon([(26,13),(30,16),(26,19)],fill=P('stone_l')); rect(im,4,14,7,18,'roof')
def T_tools(im,d):
    d.line([(6,26),(24,8)],fill=P('wood'),width=3); rect(im,19,3,28,9,'stone_d'); d.line([(6,8),(24,26)],fill=P('wood_l'),width=3); d.polygon([(3,4),(10,3),(11,9),(5,11)],fill=P('stone_l'))
def T_planks(im,d):
    for i,y in enumerate((8,15,22)): rect(im,4+i,y,27-i,y+5,'wood_l' if i%2 else 'wood'); rect(im,4+i,y,27-i,y,'dirt_l'); px(im,8+i*4,y+2,'wood_d')
def T_bricks(im,d):
    for r_,y in enumerate((8,15,22)):
        for x in range(4 - (r_%2)*5, 28, 10):
            x0=max(4,x); x1=min(27,x+8); rect(im,x0,y,x1,y+5,'brick'); rect(im,x0,y,x1,y,'roof_l'); rect(im,x0,y+5,x1,y+5,'brick_d')
def T_bread(im,d):
    ell(im,(3,10,28,26),'wood_l'); ell(im,(5,10,26,20),'straw'); [d.line([(x,12),(x+3,18)],fill=P('wood_l'),width=1) for x in(9,14,19)]; ell(im,(7,11,13,14),'straw_l')
def T_leather(im,d):
    d.polygon([(10,5),(22,5),(28,11),(24,14),(23,28),(9,28),(8,14),(4,11)],fill=P('leather')); rect(im,13,5,19,8,'wood_d'); d.line([(16,10),(16,26)],fill=P('wood'))
def T_farming(im,d): S_farm(im,d); rect(im,4,26,27,28,'dirt')
def T_wheat(im,d):
    for x in(11,16,21): d.line([(16,28),(x,8)],fill=P('straw_d'),width=2); ell(im,(x-3,3,x+3,13),'wheat'); px(im,x-1,5,'straw_l')
    rect(im,12,19,20,21,'roof')
def T_well(im,d):
    ell(im,(5,16,26,28),'stone_d'); ell(im,(5,13,26,24),'stone_l'); ell(im,(8,15,23,22),'water'); rect(im,6,4,7,18,'wood_d'); rect(im,24,4,25,18,'wood_d'); rect(im,4,3,27,5,'roof')
def T_storage(im,d):
    rect(im,5,10,26,27,'wood_l'); rect(im,5,10,26,12,'wood'); d.line([(5,12),(26,27)],fill=P('wood_d'),width=2); d.line([(26,12),(5,27)],fill=P('wood_d'),width=2)
def E_tent(im,d):
    d.polygon([(3,27),(16,5),(29,27)],fill=P('cloth4')); d.polygon([(13,27),(16,15),(19,27)],fill=P('wood_d')); d.line([(16,5),(3,27)],fill=P('straw_l'))
def E_hamlet(im,d):
    rect(im,7,16,25,27,'wood_l'); d.polygon([(3,17),(16,5),(29,17)],fill=P('straw')); rect(im,14,20,18,27,'wood_d')
def E_farmv(im,d):
    rect(im,4,18,18,27,'wood_l'); d.polygon([(2,19),(11,10),(20,19)],fill=P('roof')); T_wheat_small(im,d)
def T_wheat_small(im,d):
    for x in(22,26): d.line([(x,28),(x,14)],fill=P('straw_d'),width=1); ell(im,(x-2,10,x+2,16),'wheat')
def E_town(im,d):
    rect(im,4,14,27,27,'wood_l'); d.polygon([(2,15),(16,5),(30,15)],fill=P('roof')); rect(im,13,2,18,8,'wood_l'); ell(im,(13,8,18,13),'white'); rect(im,13,19,18,27,'wood_d'); rect(im,6,18,9,21,'water_l'); rect(im,22,18,25,21,'water_l')
RES_EXTRA={'wheat':T_wheat,'bread':T_bread,'planks':T_planks,'bricks':T_bricks,'tools':T_tools,'leather':T_leather}
def S_fish(im,d):
    ell(im,(4,10,24,22),'water'); ell(im,(6,11,20,16),'water_l'); d.polygon([(22,16),(29,9),(29,23)],fill=P('water_d')); rect(im,8,14,9,15,'black')
def S_meat(im,d):
    ell(im,(5,7,23,25),'berry'); ell(im,(8,9,18,17),'berry_l'); ell(im,(11,12,16,17),'white'); d.line([(20,20),(27,27)],fill=P('white'),width=3)
def S_fruit(im,d):
    for x,y in((10,16),(18,18),(14,10)): ell(im,(x-5,y-5,x+5,y+5),'berry'); px(im,x-2,y-2,'berry_l'); px(im,x-1,y-3,'white')
    ell(im,(15,2,24,7),'leaf')
def icons3():
    sets={'needs':{'hunger':I_hunger,'thirst':I_thirst,'energy':I_energy,'mood':I_mood,'mood_sad':I_mood_sad,'health':I_health,'warmth':I_warmth,'sleep':I_sleep},
          'skills':{'chop':S_chop,'mine':S_mine,'gather':S_gather,'build':S_build,'farm':S_farm,'hunt':S_hunt},
          'tech':{'tools':T_tools,'planks':T_planks,'bricks':T_bricks,'bread':T_bread,'leather':T_leather,'farming':T_farming,'well':T_well,'storage':T_storage,
                  'era_camp':E_tent,'era_hamlet':E_hamlet,'era_farm_village':E_farmv,'era_town':E_town},
          'resources':{'wheat':T_wheat,'bread':T_bread,'planks':T_planks,'bricks':T_bricks,'tools':T_tools,'leather':T_leather,'fish':S_fish,'meat':S_meat,'fruit':S_fruit}}
    names={'needs':'need','skills':'skill','tech':'tech','resources':'icon'}
    for grp,fs in sets.items():
        for k,fn in fs.items(): save(icon_draw(fn),f'icons/{grp}/{names[grp]}_{k}.png')
    return sets
# ---------- ACHIEVEMENTS ----------
def medal(inner_fn,col,coll,cold):
    im=new(); d=ImageDraw.Draw(im)
    d.polygon([(9,18),(5,30),(10,27),(13,31),(15,20)],fill=P('roof')); d.polygon([(23,18),(27,30),(22,27),(19,31),(17,20)],fill=P('cloth2'))
    ell(im,(4,1,27,24),cold); ell(im,(5,1,26,22),col); ell(im,(8,4,23,19),coll)
    ins=new(); inner_fn(ins,ImageDraw.Draw(ins)); ins=ins.resize((16,16),Image.NEAREST)
    im.alpha_composite(ins,(8,4)); return outline(im)
def achievements():
    lst=[('first_fire',I_warmth,'gold'),('first_house',E_hamlet,'gold'),('first_harvest',T_wheat,'gold'),('population_10',I_mood,'silver'),
         ('survive_winter',lambda im,d:(ell(im,(6,6,26,26),'snow'),[d.line(l,fill=P('ice_d'),width=2) for l in(((16,4),(16,28)),((4,16),(28,16)),((7,7),(25,25)),((25,7),(7,25)))]),'silver'),
         ('master_skill',S_build,'gold'),('town_founded',E_town,'gold'),('rich_storage',T_storage,'silver'),('locked',lambda im,d:(rect(im,9,14,22,26,'stone_d'),d.arc((10,5,21,20),180,360,fill=P('stone_d'),width=3)),'stone')]
    for n,fn,c in lst:
        cols={'gold':('gold','fire_w','gold_d'),'silver':('silver','white','stone'),'stone':('stone','stone_l','stone_d')}[c]
        save(medal(fn,*cols),f'icons/achievements/ach_{n}.png',note='medali; ach_locked = belum terbuka')
# ---------- SNOW ROOFS ----------
ROOFC={k:PALETTE[k] for k in('roof','roof_d','roof_l','straw','straw_d','straw_l')}
def snowify(src,roof_bottom,extra=()):
    im=Image.open(os.path.join(ROOT,src)).convert('RGBA'); o=im.copy(); pxs=o.load(); w,h=im.size
    mp={PALETTE['roof_l']:'snow_l',PALETTE['roof']:'snow',PALETTE['roof_d']:'snow_d',PALETTE['straw_l']:'snow_l',PALETTE['straw']:'snow',PALETTE['straw_d']:'snow_d'}
    for c in extra: mp[PALETTE[c]]='snow_d' if c.endswith('_d') else 'snow'
    for y in range(min(roof_bottom,h)):
        for x in range(w):
            c=im.getpixel((x,y))
            if c[3]==255 and c[:3] in mp:
                below=im.getpixel((x,y+1)) if y+1<h else (0,0,0,0)
                if y+1<roof_bottom and (below[3]==255 and below[:3] in mp): pxs[x,y]=P(mp[c[:3]])
    for y in range(1,h):
        for x in range(w):
            c=im.getpixel((x,y)); a=im.getpixel((x,y-1))
            if c[3]==255 and c[:3]!=PALETTE['outline'] and a[:3]==PALETTE['outline'] and y<h*0.75:
                pxs[x,y]=P('snow_l')
                if y+1<h and o.getpixel((x,y+1))[3]==255 and o.getpixel((x,y+1))[:3]!=PALETTE['outline']: pxs[x,y+1]=P('snow')
    r=random.Random(len(src))  # es menggantung di tepi atap
    for x in range(w):
        y=roof_bottom
        if y<h and r.random()<.12 and o.getpixel((x,y-1))[3]==255:
            for k in range(r.randrange(1,4)): pxs[x,min(h-1,y+k)]=P('ice_l')
    return o
def snow_roofs():
    for src,rb,ex in(('buildings/hut.png',41,()),('buildings/warehouse.png',27,()),('buildings/well.png',21,()),('buildings/mine.png',30,('stone','stone_d','stone_l')),
                     ('buildings/wooden_house.png',54,()),('buildings/kitchen.png',38,()),('buildings/workshop.png',30,('wood','wood_d')),('buildings/granary.png',42,()),
                     ('buildings/market.png',28,()),('buildings/town_hall.png',55,()),('buildings/campfire.png',0,())):
        name=os.path.basename(src)[:-4]; im=snowify(src,rb,ex)
        f=[o for o in OUT if o['file']==src][0]
        save(im,f'buildings/winter/{name}_winter.png',f['frame'],f['frames'],'atap bersalju; ukuran/anchor sama dengan '+src)
    for src,rb in(('buildings/night/wooden_house_night.png',54),('buildings/night/hut_night.png',41),('buildings/night/kitchen_night.png',38),('buildings/night/town_hall_night.png',55),('buildings/night/granary_night.png',42)):
        name=os.path.basename(src)[:-4]; save(snowify(src,rb),f'buildings/winter/{name}_winter.png',note='malam + salju')
def bridge_rails():
    back=new(96,32); front=new(96,32)
    for im,y in((back,0),(front,22)):
        rect(im,0,y+3,95,y+4,'wood_l'); rect(im,0,y+5,95,y+5,'wood_d')
        for x in(1,31,63,93): rect(im,x,y,x+2,y+8,'wood'); rect(im,x,y,x+2,y,'wood_l')
    save(outline(back),'buildings/bridge_rail_h_back.png',(32,32),3,'pagar sisi utara; gambar SEBELUM karakter; tile = bridge_h')
    save(outline(front),'buildings/bridge_rail_h_front.png',(32,32),3,'pagar sisi selatan; gambar SETELAH karakter')
    v=new(32,96)
    for x in(3,26):
        rect(v,x,0,x+1,95,'wood_l'); rect(v,x+2,0,x+2,95,'wood_d')
        for y in(0,30,62,90): rect(v,x-1,y,x+3,y+4,'wood')
    save(outline(v),'buildings/bridge_rail_v.png',(32,32),3,'pagar kiri+kanan; tumpuk di atas bridge_v; gambar setelah karakter')
def dusk_dawn():
    save(Image.new('RGBA',(32,32),PALETTE['dusk']),'effects/night/dusk_overlay.png',note='senja RGBA (150,70,120,90)')
    save(Image.new('RGBA',(32,32),PALETTE['dawn']),'effects/night/dawn_overlay.png',note='fajar RGBA (250,186,140,70)')
    g=new(320,180); d=ImageDraw.Draw(g)
    for y in range(180): d.line([(0,y),(320,y)],fill=(250,150,90,int(90*(1-y/180))))
    save(g,'effects/night/dusk_gradient.png',note='opsional, stretch ke layar; tambahan langit sore di atas dusk_overlay')
# ---------- CARRY VARIANTS ----------
def carry_item(kind,bob):
    t=new(); y=1-bob
    if kind=='wood':
        for i,yy in enumerate((y+3,y)): rect(t,8,yy,23,yy+3,'wood'); rect(t,8,yy,23,yy,'wood_l'); ell(t,(20,yy,24,yy+3),'dirt_l')
    elif kind=='stone':
        ImageDraw.Draw(t).polygon([(9,y+7),(10,y+1),(16,y-1),(22,y+1),(23,y+7)],fill=P('stone')); rect(t,10,y+5,22,y+7,'stone_d'); px(t,13,y+1,'stone_l'); px(t,14,y+1,'stone_l')
    elif kind=='food':
        ImageDraw.Draw(t).polygon([(8,y+2),(23,y+2),(21,y+8),(10,y+8)],fill=P('straw')); rect(t,8,y+2,23,y+2,'straw_d')
        for x in(10,13,16,19,21): ell(t,(x-1,y-1,x+2,y+2),'berry' if x%2 else 'carrot'); 
    elif kind=='water':
        ImageDraw.Draw(t).polygon([(10,y),(21,y),(20,y+8),(11,y+8)],fill=P('wood')); rect(t,10,y,21,y+1,'water_l'); rect(t,10,y+4,21,y+4,'wood_d'); rect(t,10,y,21,y,'water')
    return outline(t)
def villagers_carry():
    dirs=['down','left','right','up']; kinds=['wood','stone','food','water']
    for i,v in enumerate(VARS):
        sh=new(128,512)
        for k,kind in enumerate(kinds):
            for r_,dn in enumerate(dirs):
                for f in range(4):
                    bob=1 if f in(1,3) else 0; im=villager_frame(v,dn,f,True); it=carry_item(kind,bob)
                    rect(it,8,7-bob,9,9-bob,v[0]); rect(it,22,7-bob,23,9-bob,v[0]); im.alpha_composite(it); sh.paste(im,(f*32,(k*4+r_)*32))
        save(sh,f'characters/villager_{i+1}_carry.png',(32,32),64,'16 baris x 4 kolom: 0-3 kayu, 4-7 batu, 8-11 makanan, 12-15 air; arah tiap kelompok bawah,kiri,kanan,atas; siklus jalan')
# ---------- MERCHANT ----------
def merchant():
    v=('skin2','hair4','magic'); sh=new(128,256)
    def hat(im,oy):
        h=new(); ell(h,(5,4+oy,26,11+oy),'straw'); ell(h,(10,0+oy,21,8+oy),'straw_l'); rect(h,10,5+oy,21,6+oy,'roof'); im.alpha_composite(outline(h))
    for r_,dn in enumerate(['down','left','right','up']):
        for f in range(4):
            for walk,row in((False,r_),(True,r_+4)):
                if not walk and f%2: im=villager_frame(v,dn,0,False); im2=new(); im2.paste(im.crop((0,0,32,27)),(0,1)); im2.paste(im.crop((0,27,32,32)),(0,27)); im=im2; oy=1
                else: im=villager_frame(v,dn,f if walk else 0,walk); oy=-(1 if walk and f in(1,3) else 0)
                bp=new()
                if dn=='up': rect(bp,10,15+oy,21,24+oy,'leather'); rect(bp,10,15+oy,21,16+oy,'wood_d')
                elif dn=='left': rect(bp,20,15+oy,24,24+oy,'leather')
                elif dn=='right': rect(bp,7,15+oy,11,24+oy,'leather')
                if dn=='up': im.alpha_composite(outline(bp))
                else: b2=outline(bp); b2.alpha_composite(im); im=b2
                hat(im,oy); sh.paste(im,(f*32,row*32))
    save(sh,'characters/merchant.png',(32,32),32,'format = villager_N.png: baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas)')
    cs=new(256,128)
    for f in range(2):
        for di,dn in enumerate(['down','left','right','up']):
            im=new(64,64); d=ImageDraw.Draw(im)
            if dn in('left','right'):
                rect(im,8,26,52,46,'wood'); rect(im,8,26,52,28,'wood_l'); [rect(im,x,28,x,46,'wood_d') for x in(18,30,42)]
                d.polygon([(6,26),(10,10),(50,10),(54,26)],fill=P('cloth_l')); [d.line([(x,10),(x-2+ (x-30)//10,26)],fill=P('roof'),width=3) for x in(16,30,44)]
                for x in(14,22,40): ell(im,(x,20,x+5,26),'berry' if x<30 else 'wheat')
                wx=20; ell(im,(wx-7,38,wx+7,52),'wood_d'); ell(im,(wx-5,40,wx+5,50),'wood_l'); a=f*45
                d.line([(wx-4,45),(wx+4,45)] if f==0 else [(wx,41),(wx,49)],fill=P('wood_d'))
                hx=(54,62) if dn=='right' else (0,8); d.line([(hx[0],42),(hx[1],44)],fill=P('wood_d'),width=2)
                if dn=='left': im=im.transpose(Image.FLIP_LEFT_RIGHT) if False else im
                if dn=='left':
                    im2=im.transpose(Image.FLIP_LEFT_RIGHT); im=im2
                    d=ImageDraw.Draw(im)
            else:
                rect(im,14,22,49,52,'wood'); rect(im,14,22,49,24,'wood_l'); [rect(im,14,y,49,y,'wood_d') for y in(32,42)]
                d.polygon([(12,24),(16,8),(48,8),(52,24)],fill=P('cloth_l')); [d.line([(x,8),(x,24)],fill=P('roof'),width=3) for x in(22,32,42)]
                for x in(10,48): rect(im,x,40,x+5,56,'wood_d'); rect(im,x+1,42+f*2,x+4,43+f*2,'wood_l'); rect(im,x+1,50-f*2,x+4,51-f*2,'wood_l')
                if dn=='down': d.line([(28,52),(26,62)],fill=P('wood_d'),width=2); d.line([(36,52),(38,62)],fill=P('wood_d'),width=2)
                else: d.line([(28,22),(26,4)],fill=P('wood_d'),width=2); d.line([(36,22),(38,4)],fill=P('wood_d'),width=2)
            im=shadow(outline(im),32,54,24,4); cs.paste(im,(di*64,f*64))
    save(cs,'characters/merchant_cart.png',(64,64),8,'4 kolom arah (bawah,kiri,kanan,atas) x 2 baris frame roda; ~200ms/frame; pegangan menunjuk arah gerak (pedagang berjalan di depan gerobak)')
def stage3():
    lg=logos(); title_screens(lg); ui_skin(); icons3(); achievements(); snow_roofs(); bridge_rails(); dusk_dawn(); villagers_carry(); merchant()

if __name__=='__main__':
    tiles(); tree(); rock(); bush(True); bush(False); fields(); villagers(); campfire(); hut(); warehouse(); well(); mine(); wooden_house(); effects(); icons()
    for o in OUT: o['stage']=1
    winter_tiles(); autotiles(); winter_trees(); crops(); villagers_work(); adv_buildings(); night()
    for o in OUT: o.setdefault('stage',2)
    stage3()
    for o in OUT: o.setdefault('stage',3)
    json.dump(dict(palette=PALETTE,files=OUT),open(os.path.join(ROOT,'manifest.json'),'w'),indent=1)
    print(len(OUT),'files')
