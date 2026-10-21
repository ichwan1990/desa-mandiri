#!/usr/bin/env python3
"""Generator aset pixel art 'Desa Mandiri'. Jalankan: python3 generate_assets.py
Semua warna diambil dari PALETTE. Deterministik (seed tetap)."""
import os, random, json
from PIL import Image, ImageDraw, ImageChops
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
P = lambda k: (tuple(k)+(255,))[:4] if isinstance(k,tuple) else PALETTE[k] if len(PALETTE[k])==4 else PALETTE[k]+(255,)
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
# =====================================================================
# TAHAP 4: musim & ancaman (hanya file baru)
# =====================================================================
PALETTE.update({
 'sp_grass_d':(86,152,70),'sp_grass':(128,196,84),'sp_grass_l':(182,224,110),'blossom':(250,180,200),'blossom_l':(255,226,234),
 'su_grass_d':(150,150,60),'su_grass':(190,182,84),'su_grass_l':(222,212,120),'su_leaf_d':(84,116,52),'su_leaf':(124,150,62),'su_leaf_l':(170,184,84),
 'au_grass_d':(132,124,58),'au_grass':(168,150,70),'au_grass_l':(206,176,86),'au_leaf_d':(176,74,44),'au_leaf':(226,124,52),'au_leaf_l':(248,184,76),
 'flood_d':(90,110,120),'flood':(120,142,150),'flood_l':(176,196,196),'char':(64,52,56),'char_l':(100,86,84),'ember':(255,110,50),
 'wolf_d':(96,98,120),'wolf':(140,144,162),'wolf_l':(204,206,218),'wolfb_d':(110,74,56),'wolfb':(156,108,76),'wolfb_l':(214,170,126),
 'warn_y':(250,214,72),'warn_o':(246,140,48),'warn_r':(224,64,56),'sick':(150,196,96),
})
def recolor(im,mp):
    o=im.copy(); p=o.load(); M={PALETTE[k][:3]:P(v) for k,v in mp.items()}
    for y in range(o.height):
        for x in range(o.width):
            c=p[x,y]
            if c[3] and c[:3] in M: p[x,y]=M[c[:3]][:3]+(c[3],)
    return o
SEASON_MAP={
 'spring':{'grass_d':'sp_grass_d','grass':'sp_grass','grass_l':'sp_grass_l'},
 'summer':{'grass_d':'su_grass_d','grass':'su_grass','grass_l':'su_grass_l','leaf_d':'su_leaf_d','leaf':'su_leaf','leaf_l':'su_leaf_l'},
 'autumn':{'grass_d':'au_grass_d','grass':'au_grass','grass_l':'au_grass_l','leaf_d':'au_leaf_d','leaf':'au_leaf','leaf_l':'au_leaf_l'},
}
def R_(p): return Image.open(os.path.join(ROOT,p)).convert('RGBA')
def sprinkle(im,seed,n,cols,area=None,wrap=True):
    r=random.Random(seed); w,h=im.size; x0,y0,x1,y1=area or (0,0,w,h)
    for _ in range(n):
        x,y=r.randrange(x0,x1),r.randrange(y0,y1); c=r.choice(cols)
        for dx,dy in((0,0),(1,0),(-1,0),(0,1),(0,-1)):
            X,Y=(x+dx)%w if wrap else x+dx,(y+dy)%h if wrap else y+dy
            if 0<=X<w and 0<=Y<h and im.getpixel((X,Y))[3]: px(im,X,Y,'fire_l' if (dx,dy)==(0,0) else c)
def seasons():
    srcs=['tiles/grass.png','tiles/grass_flowers.png','tiles/edge_grass_dirt.png','tiles/edge_grass_sand.png','tiles/autotile_water_grass.png','tiles/autotile_path_grass.png',
          'nature/tree.png','nature/berry_bush_full.png','nature/berry_bush_empty.png']
    for s,mp in SEASON_MAP.items():
        for src in srcs:
            im=recolor(R_(src),mp); base=os.path.basename(src)[:-4]
            if s=='spring' and base=='grass_flowers': sprinkle(im,21,14,['white','blossom','magic_l'])
            if s=='spring' and base=='grass': sprinkle(im,22,3,['blossom','white'])
            if s=='spring' and base=='tree':
                r=random.Random(8)
                for _ in range(22):
                    x,y=r.randrange(6,26),r.randrange(8,36)
                    if im.getpixel((x,y))[:3] in (PALETTE['leaf'],PALETTE['leaf_l']): px(im,x,y,'blossom'); px(im,x+1,y,'blossom_l')
            if s=='autumn' and base=='grass':
                r=random.Random(4)
                for _ in range(6): x,y=r.randrange(32),r.randrange(32); px(im,x,y,'au_leaf'); px(im,(x+1)%32,y,'au_leaf_d')
            f=[o for o in OUT if o['file']==src][0]
            save(im,f'seasons/{s}/{base}_{s}.png',f['frame'],f['frames'],f'varian {s} dari {src}; format/indeks identik')
        if s=='autumn':
            pile=new(); r=random.Random(5)
            for _ in range(40): x,y=r.randrange(8,24),r.randrange(18,28); px(pile,x,y,r.choice(['au_leaf','au_leaf_l','au_leaf_d','roof']))
            save(outline(pile),'seasons/autumn/leaf_pile.png',note='tumpukan daun dekor')
    sp=R_('tiles/grass.png'); sp=recolor(sp,SEASON_MAP['spring']); sprinkle(sp,33,14,['blossom','white','magic_l','cloth2'])
    save(sp,'seasons/spring/grass_meadow_spring.png',note='padang bunga, seamless')
    dry=recolor(R_('tiles/dirt.png'),{}); d=ImageDraw.Draw(dry)
    for (a,b,c_,e) in((3,6,12,10),(12,10,15,18),(20,3,28,8),(18,22,27,27)): d.line([(a,b),(c_,e)],fill=P('dirt_d'))
    save(dry,'seasons/summer/dirt_cracked_summer.png',note='tanah retak kering (tidak seamless di garis retak tepi)')
# ---------- WEATHER ----------
def loop_overlay(name,draw_fn,frames=4,size=64,note=''):
    sh=new(size*frames,size)
    for f in range(frames):
        im=new(size,size); draw_fn(im,f,size); sh.paste(im,(f*size,0))
    save(sh,f'effects/weather/{name}.png',(size,size),frames,note)
def rain_fn(im,f,S):
    r=random.Random(1)
    for _ in range(14):
        x,y=r.randrange(S),r.randrange(S); y=(y+f*16)%S; x=(x-f*4)%S
        for k in range(5): px(im,(x-k//2)%S,(y+k)%S,(150,210,236,200) if k<4 else (236,248,250,230))
def snow_fn(im,f,S):
    r=random.Random(2)
    for i in range(12):
        x,y=r.randrange(S),r.randrange(S); y=(y+f*16)%S; x=(x+[0,1,0,-1][(f+i)%4])%S
        px(im,x,y,'snow_l')
        if i%2: [px(im,(x+a)%S,(y+b)%S,'snow') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
def leaves_fn(im,f,S):
    r=random.Random(3)
    for i in range(5):
        x,y=r.randrange(S),r.randrange(S); y=(y+f*16)%S; x=(x+[0,3,0,-3][(f+i)%4])%S; c=['au_leaf','au_leaf_l','roof'][i%3]
        for a,b in(((0,0),(1,0),(1,1)) if (f+i)%2 else ((0,0),(0,1),(1,1))): px(im,(x+a)%S,(y+b)%S,c)
def haze_fn(im,f,S):
    for y in range(0,S,8):
        for x in range(S):
            yy=(y+int(2*math.sin((x+f*16)*2*math.pi/S*2)))%S; px(im,x,yy,(255,240,200,40))
def weather():
    loop_overlay('rain_overlay',rain_fn,note='tile 64x64 seamless, 4 frame loop ~80ms; ulangi menutupi layar')
    loop_overlay('snow_overlay',snow_fn,note='tile 64x64 seamless, 4 frame ~200ms')
    loop_overlay('leaves_overlay',leaves_fn,note='tile 64x64 seamless daun gugur, 4 frame ~200ms')
    loop_overlay('heat_haze_overlay',haze_fn,note='kilau panas, tile 64x64, 4 frame ~150ms; tambah heat_tint')
    save(Image.new('RGBA',(32,32),(255,200,110,40)),'effects/weather/heat_tint.png',note='overlay panas kering RGBA (255,200,110,40)')
    save(Image.new('RGBA',(32,32),(90,110,140,50)),'effects/weather/rain_tint.png',note='overlay mendung saat hujan')
    fr=new(); r=random.Random(9)
    for _ in range(30): px(fr,r.randrange(32),r.randrange(32),(240,250,255,170))
    for _ in range(6): x,y=r.randrange(32),r.randrange(32); [px(fr,(x+a)%32,(y+b)%32,(220,242,250,150)) for a,b in((0,0),(1,1),(-1,1),(1,-1),(-1,-1))]
    save(fr,'effects/weather/frost_overlay.png',note='embun beku tile 32x32 seamless')
    v=new(320,180); d=ImageDraw.Draw(v)
    for i in range(24): a=int(120*(1-i/24)); d.rectangle([i,i,319-i,179-i],outline=(220,240,252,a))
    save(v,'effects/weather/frost_vignette.png',note='stretch ke layar, dingin ekstrem')
    # particle sprites 8x8
    sh=new(32,8)
    for f in range(4):
        im=new(8,8)
        if f<2: [px(im,4-k//3,k+f*2,'water_l') for k in range(5)]
        else: px(im,1,6,'water_l'); px(im,6,6,'water_l'); px(im,3,7-(f-2),'foam'); px(im,5,7-(f-2),'foam')
        sh.paste(im,(f*8,0))
    save(sh,'effects/weather/particle_rain.png',(8,8),4,'0-1 tetes jatuh, 2-3 percikan')
    sh=new(24,8)
    for f in range(3):
        im=new(8,8); px(im,3,3,'snow_l')
        if f>0: [px(im,3+a,3+b,'snow') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
        if f>1: [px(im,3+a,3+b,'snow_d') for a,b in((2,0),(-2,0),(0,2),(0,-2))]
        sh.paste(im,(f*8,0))
    save(sh,'effects/weather/particle_snow.png',(8,8),3,'3 ukuran kepingan')
    sh=new(32,16)
    for row,c in enumerate(('au_leaf','au_leaf_l')):
        for f in range(4):
            im=new(8,8); pts=[[(2,2),(3,3),(4,4),(5,5),(3,2),(4,3),(5,4)],[(2,4),(3,4),(4,4),(5,4),(3,3),(4,3),(4,5)],[(5,2),(4,3),(3,4),(2,5),(4,2),(3,3),(2,4)],[(4,1),(4,2),(4,3),(4,4),(3,2),(5,3),(4,5)]][f]
            for x,y in pts: px(im,x,y,c)
            px(im,pts[0][0],pts[0][1],'wood_d'); sh.paste(im,(f*8,row*8))
    save(sh,'effects/weather/particle_leaf.png',(8,8),8,'2 baris warna x 4 frame rotasi')
# ---------- FLOOD ----------
def flood():
    fl=[]
    for f in range(2):
        im=Image.new('RGBA',(32,32),P('flood')[:3]+(200,)); r=random.Random(40)
        for _ in range(8):
            x,y=r.randrange(32),r.randrange(32); x=(x+f*3)%32
            for k in range(4): px(im,(x+k)%32,y,PALETTE['flood_l']+(220,))
        for _ in range(20): px(im,r.randrange(32),r.randrange(32),PALETTE['flood_d']+(200,))
        fl.append(im)
    sh=new(64,32); sh.paste(fl[0],(0,0)); sh.paste(fl[1],(32,0)); save(sh,'hazards/flood_tile.png',(32,32),2,'genangan penuh semi-transparan, 2 frame ~500ms, seamless')
    at=new(256,384)
    for f in range(2):
        for i,m in enumerate(BLOB_MASKS): at.paste(blob_tile(m,fl[f],new(),'flood_l',6,None),((i%8)*32,(f*6+i//8)*32))
    save(at,'hazards/autotile_flood.png',(32,32),94,'47-blob (sama dengan tahap 2), luar transparan → overlay di atas tanah apa pun; baris 0-5 frame 0, 6-11 frame 1')
    sh=new(64,32)
    for f in range(2):
        im=new(); ell(im,(4,10,28,26),P('flood')[:3]+(210,)); ell(im,(7,12,20,18),PALETTE['flood_l']+(220,)); px(im,22+f,20,'foam'); px(im,10-f,22,'foam')
        sh.paste(im,(f*32,0))
    save(sh,'hazards/puddle.png',(32,32),2,'genangan kecil')
    rs=new(128,128)
    for di in range(4):
        for lv in range(4):
            im=new(); depth=4+lv*6
            for x in range(32):
                h=depth+int(1.5*math.sin(x*0.6+lv))
                for y in range(h): px(im,x,y,P('water')[:3]+(210,))
                px(im,x,h,'foam'); 
                if lv%2==0 and x%5==0: px(im,x,h+1,'water_l')
            im=im.rotate(-90*di,expand=False); rs.paste(im,(lv*32,di*32))
    save(rs,'hazards/water_rise.png',(32,32),16,'air naik di tepi sungai: baris = sisi asal air (N,E,S,W), kolom = level 0-3; overlay di atas tile tepi')
# ---------- FIRE ----------
def flame(im,cx,base,h,w,f,seed):
    r=random.Random(seed*10+f); d=ImageDraw.Draw(im)
    for (c,sc) in(('fire_d',1),('fire',0.72),('fire_l',0.45),('fire_w',0.2)):
        hh=h*sc; ww=w*sc; tip=cx+[0,1,0,-1][f%4]*max(1,w//8)
        d.polygon([(cx-ww,base),(cx-ww*0.6,base-hh*0.5),(tip,base-hh-[0,2,1,3,0,2][f%6]),(cx+ww*0.6,base-hh*0.45),(cx+ww,base)],fill=P(c))
    for _ in range(2+w//6): px(im,r.randrange(int(cx-w),int(cx+w)),r.randrange(max(0,int(base-h*1.4)),int(base-h*0.6)),'ember')
def fire_smoke():
    sh=new(32*6,32)
    for f in range(6): im=new(); flame(im,16,28,18,8,f,1); sh.paste(outline(im,'fire_d'),(f*32,0))
    save(sh,'hazards/fire_small.png',(32,32),6,'api kecil 6 frame ~100ms')
    sh=new(64*6,64)
    for f in range(6):
        im=new(64,64); flame(im,20,58,30,11,f,2); flame(im,44,58,26,10,(f+3)%6,3); flame(im,32,60,40,14,(f+1)%6,4); sh.paste(im,(f*64,0))
    save(sh,'hazards/fire_large.png',(64,64),6,'api besar 6 frame; tumpuk di atas bangunan 2x2, ulang untuk bangunan lebih besar')
    sh=new(32*4,32)
    for f in range(4):
        im=new(); d=ImageDraw.Draw(im)
        for i in range(4):
            y=28-((i*8+f*2)%32); rr=2+((i*8+f*2)%32)//6; x=16+int(3*math.sin(i+f*0.5))
            d.ellipse([x-rr,y-rr,x+rr,y+rr],fill=(150,140,150,170-((i*8+f*2)%32)*4))
        sh.paste(im,(f*32,0))
    save(sh,'hazards/smoke.png',(32,32),4,'asap peringatan sebelum api (loop ~150ms); tampilkan 1-2 detik sebelum fire_*')
def burnt():
    mp={}
    for k,v in PALETTE.items():
        if len(v)==3 and k not in('outline',):
            lum=(v[0]*3+v[1]*6+v[2])/10; mp[k]='char' if lum<120 else 'char_l' if lum<190 else 'stone_d'
    for src in('hut','warehouse','well','mine','wooden_house','kitchen','workshop','granary','market','town_hall'):
        im=recolor(R_(f'buildings/{src}.png'),mp); r=random.Random(len(src)); w,h=im.size; p=im.load()
        # lubang atap
        for _ in range(w*h//60):
            x,y=r.randrange(w),r.randrange(h//2)
            if p[x,y][3]==255 and p[x,y][:3]!=PALETTE['outline']: ImageDraw.Draw(im).ellipse([x-1,y-1,x+1,y+1],fill=P('outline'))
        for _ in range(w//6): px(im,r.randrange(w),r.randrange(h//2,h),'ember')
        im=outline(im) ; save(im,f'hazards/burnt/{src}_burnt.png',note=f'hangus; ukuran/anchor sama dengan buildings/{src}.png')
    for sz,name in((32,'rubble_small'),(64,'rubble_large')):
        im=new(sz,sz); r=random.Random(sz)
        for _ in range(sz//2):
            x,y=r.randrange(4,sz-6),r.randrange(sz//2,sz-4); c=r.choice(['char','char_l','stone_d','wood_d'])
            rect(im,x,y,x+r.randrange(2,6),y+r.randrange(1,3),c)
        for _ in range(sz//10): px(im,r.randrange(4,sz-4),r.randrange(sz//2,sz-3),'ember')
        save(shadow(outline(im),sz//2,sz-3,sz//2-3,2),f'hazards/burnt/{name}.png',note='puing; letakkan setelah bangunan dibersihkan')
# ---------- WOLF ----------
def wolf_frame(dirn,f,mode,cols):
    D,M,Lc=cols; im=new(); d=ImageDraw.Draw(im)
    step=[0,1,0,-1][f] if mode=='walk' else 0; lunge=[0,-1,3,1][f] if mode=='attack' else 0; bob=1 if (mode=='idle' and f in(1,2)) else 0
    if dirn in('left','right'):
        s=1 if dirn=='right' else -1; X=lambda x:16+s*(x-16)
        lx=lunge
        for i,lx0 in enumerate((9,12,19,22)):
            o=step*(1 if i%2 else -1); rect(im,min(X(lx0+o+lx),X(lx0+o+lx+1)),24,max(X(lx0+o+lx),X(lx0+o+lx+1)),28,D)
        ell(im,(min(X(6+lx),X(24+lx)),15+bob,max(X(6+lx),X(24+lx)),26),M); ell(im,(min(X(9+lx),X(20+lx)),20,max(X(9+lx),X(20+lx)),26),Lc)
        tail_up=[0,1,0,1][f] if mode!='attack' else 2
        d.polygon([(X(7+lx),19),(X(1+lx),14-tail_up),(X(3+lx),20)],fill=P(M)); px(im,X(1+lx),14-tail_up,Lc)
        ell(im,(min(X(18+lx),X(29+lx)),8+bob,max(X(18+lx),X(29+lx)),19+bob),M)
        d.polygon([(X(19+lx),11+bob),(X(20+lx),4+bob),(X(23+lx),9+bob)],fill=P(D)); d.polygon([(X(23+lx),9+bob),(X(25+lx),3+bob),(X(27+lx),10+bob)],fill=P(M))
        ell(im,(min(X(25+lx),X(31+lx)),13+bob,max(X(25+lx),X(31+lx)),18+bob),Lc); px(im,X(30+lx),14+bob,'black')
        rect(im,min(X(24+lx),X(25+lx)),12+bob,max(X(24+lx),X(25+lx)),13+bob,'black'); px(im,X(24+lx),12+bob,'white')
        if mode=='attack' and f==2: rect(im,min(X(27+lx),X(30+lx)),17,max(X(27+lx),X(30+lx)),18,'berry_l'); px(im,X(28+lx),17,'white')
    else:
        ly=lunge if dirn=='down' else -lunge
        for x0 in(10,19):
            o=step if x0==10 else -step; rect(im,x0,25+o*0+ (o if o>0 else 0),x0+2,28,D)
        ell(im,(8,15,23,27),M)
        if dirn=='down':
            ell(im,(12,19,19,27),Lc)
            hy=6+bob+ly
            ell(im,(7,hy+2,24,hy+15),M); d.polygon([(8,hy+5),(9,hy-2),(14,hy+3)],fill=P(D)); d.polygon([(23,hy+5),(22,hy-2),(17,hy+3)],fill=P(D))
            px(im,10,hy+1,'berry_l'); px(im,21,hy+1,'berry_l')
            ell(im,(11,hy+9,20,hy+15),Lc); rect(im,15,hy+10,16,hy+11,'black')
            rect(im,11,hy+6,12,hy+8,'black'); rect(im,19,hy+6,20,hy+8,'black'); px(im,11,hy+6,'white'); px(im,19,hy+6,'white')
            if mode=='attack' and f==2: rect(im,13,hy+13,18,hy+14,'berry'); px(im,13,hy+13,'white'); px(im,18,hy+13,'white')
        else:
            tail=[0,1,0,-1][f]
            d.polygon([(15,24),(16+tail*2,30),(17,24)],fill=P(Lc)); ell(im,(13+tail,22,19+tail,30),M); px(im,16+tail,29,Lc)
            hy=5+bob+ly; ell(im,(8,hy+2,23,hy+14),M); d.polygon([(8,hy+5),(9,hy-2),(14,hy+3)],fill=P(D)); d.polygon([(23,hy+5),(22,hy-2),(17,hy+3)],fill=P(D))
            ell(im,(11,hy+4,20,hy+10),D)
    im=outline(im); im=shadow(im,16,28,9,2)
    if mode=='attack' and f==2:
        pos={'right':(29,6),'left':(2,6),'down':(4,4),'up':(26,4)}[dirn]
        for a,b in((0,0),(1,1),(2,2),(0,2),(2,0)): px(im,pos[0]+a,pos[1]+b,'white')
    return im
def wolves():
    for name,cols in(('wolf_grey',('wolf_d','wolf','wolf_l')),('wolf_brown',('wolfb_d','wolfb','wolfb_l'))):
        sh=new(128,384)
        for k,mode in enumerate(('idle','walk','attack')):
            for r_,dn in enumerate(('down','left','right','up')):
                for f in range(4): sh.paste(wolf_frame(dn,f,mode,cols),(f*32,(k*4+r_)*32))
        save(sh,f'characters/animals/{name}.png',(32,32),48,'12 baris x 4 kolom: 0-3 diam, 4-7 jalan, 8-11 menyerang (frame 2 = gigitan); arah bawah,kiri,kanan,atas')
    pw=new(8,8); ell(pw,(2,3,6,7),'wolf_d'); px(pw,1,2,'wolf_d'); px(pw,3,1,'wolf_d'); px(pw,5,1,'wolf_d'); px(pw,7,2,'wolf_d')
    save(pw,'characters/animals/paw_print.png',note='jejak kaki tunggal 8x8 (atas = arah jalan), rotasi sesuai arah')
    tr=new()
    for i,(x,y) in enumerate(((8,26),(14,20),(10,14),(16,8),(12,2))): tr.alpha_composite(pw,(x+(i%2)*6-2,y))
    save(tr,'characters/animals/paw_trail.png',note='jejak serigala menuju atas (decal tanah), fade setelah ~1 hari')
# ---------- FENCE / GATE / TOWER / TORCH ----------
def fence_tile(mask):
    im=new()
    def rail(x0,y0,x1,y1): rect(im,x0,y0,x1,y1,'wood'); rect(im,x0,y0,x1,y0,'wood_l')
    if mask&2: rail(16,14,31,15); rail(16,20,31,21)
    if mask&8: rail(0,14,15,15); rail(0,20,15,21)
    if mask&1: rect(im,14,0,17,14,'wood'); rect(im,14,0,14,14,'wood_l')
    if mask&4: rect(im,14,18,17,31,'wood'); rect(im,14,18,14,31,'wood_l')
    rect(im,13,9,18,25,'wood_d'); rect(im,13,9,18,10,'wood_l'); rect(im,14,8,17,8,'wood')
    return shadow(outline(im),16,26,4,1)
def fences():
    sh=new(128,128)
    for m in range(16): sh.paste(fence_tile(m),((m%4)*32,(m//4)*32))
    save(sh,'structures/fence_autotile.png',(32,32),16,'16-tile 4-bit: indeks = N1+E2+S4+W8 (tetangga pagar/gerbang); kolom = i%4, baris = i//4; indeks 0 = pagar 1-tile (tiang)')
    for orient in('h','v'):
        s2=new(64,32)
        for st in range(2):
            im=new(); open_=st==1
            if orient=='h':
                rect(im,1,8,5,25,'wood_d'); rect(im,26,8,30,25,'wood_d')
                if not open_:
                    for x in range(7,25,4): rect(im,x,11,x+2,24,'wood_l' if x%8 else 'wood')
                    rect(im,6,13,25,14,'wood_d'); rect(im,6,20,25,21,'wood_d')
                else:
                    for x0 in(6,25):
                        rect(im,min(x0,x0+(1 if x0<10 else -1)*2),8,max(x0,x0+(1 if x0<10 else -1)*2),27,'wood_l')
                rect(im,0,6,6,8,'wood'); rect(im,25,6,31,8,'wood')
            else:
                rect(im,8,1,23,4,'wood_d'); rect(im,8,27,23,30,'wood_d')
                if not open_:
                    for y in range(6,26,4): rect(im,11,y,20,y+2,'wood_l' if y%8 else 'wood')
                    rect(im,13,5,14,26,'wood_d'); rect(im,18,5,19,26,'wood_d')
                else:
                    rect(im,7,5,9,13,'wood_l'); rect(im,22,18,24,26,'wood_l')
            s2.paste(shadow(outline(im),16,28,10,2),(st*32,0))
        save(s2,f'structures/gate_{orient}.png',(32,32),2,'frame 0 tertutup, 1 terbuka; '+('menyambung pagar kiri-kanan (E/W)' if orient=='h' else 'menyambung pagar atas-bawah (N/S)'))
def tower():
    im=new(64,96); d=ImageDraw.Draw(im)
    for x0,x1 in((14,8),(46,52)): d.line([(x0,40),(x1,90)],fill=P('wood_d'),width=3)
    for x0,x1 in((22,20),(40,42)): d.line([(x0,40),(x1,90)],fill=P('wood'),width=3)
    d.line([(12,52),(50,78)],fill=P('wood'),width=2); d.line([(50,52),(12,78)],fill=P('wood'),width=2)
    rect(im,8,32,55,44,'wood_l'); [rect(im,x,32,x,44,'wood_d') for x in range(10,56,5)]; rect(im,8,32,55,33,'straw_l')
    rect(im,10,18,12,32,'wood_d'); rect(im,51,18,53,32,'wood_d')
    roof_tri(im,4,59,2,22,'roof','roof_d','roof_l')
    rect(im,26,26,37,32,'cloth_d'); rect(im,28,22,35,27,'skin2') if False else None
    rect(im,56,26,57,40,'wood_d'); rect(im,54,22,59,26,'fire'); px(im,56,21,'fire_l')
    for y in range(48,90,7): rect(im,28,y,35,y,'wood')
    rect(im,28,46,29,90,'wood_d'); rect(im,34,46,35,90,'wood_d')
    save(shadow(outline(im),32,91,20,3),'structures/watchtower.png',note='64x96 (alas 2x1 tile di baris bawah); bendera/obor kecil di kanan atas')
def torches():
    sh=new(32*5,64)
    for f in range(5):
        im=new(32,64); rect(im,15,22,16,60,'wood_d'); rect(im,13,18,18,23,'stone_d'); rect(im,13,18,18,18,'stone_l'); rect(im,13,58,18,60,'stone')
        if f<4:
            hh=[0,2,1,3][f]; ImageDraw.Draw(im).polygon([(12,18),(15+(f%2),6-hh),(19,18)],fill=P('fire')); ImageDraw.Draw(im).polygon([(14,18),(16-(f%2),10-hh),(17,18)],fill=P('fire_l')); px(im,15,15,'fire_w')
        else: rect(im,14,16,17,18,'char'); px(im,15,13,(150,140,150,150)); px(im,16,10,(150,140,150,110))
        sh.paste(shadow(outline(im),16,60,4,1),(f*32,0))
    save(sh,'structures/torch_post.png',(32,64),5,'obor tiang 32x64: frame 0-3 nyala (~120ms), frame 4 mati (berasap tipis); glow: effects/night/light_glow_small.png')
# ---------- STATUS & WARNING ----------
_PAL16=[v for v in PALETTE.values() if len(v)==3]  # snapshot palet tahap 4 (agar ikon 16px stabil)
def to16(im32):
    s=im32.resize((16,16),Image.BOX); p=s.load(); cols=_PAL16
    for y in range(16):
        for x in range(16):
            c=p[x,y]
            if c[3]<110: p[x,y]=(0,0,0,0)
            else: p[x,y]=min(cols,key=lambda q:sum((a-b)**2 for a,b in zip(q,c[:3])))+(255,)
    return s
def face(im,d,col):
    ell(im,(4,4,27,27),col); rect(im,10,11,11,14,'black'); rect(im,20,11,21,14,'black'); px(im,10,11,'white'); px(im,20,11,'white')
def ST_injured(im,d):
    face(im,d,'skin1'); d.arc((11,17,20,24),20,160,fill=P('black')); d.line([(6,8),(14,6)],fill=P('white'),width=3); d.line([(6,6),(12,9)],fill=P('white'),width=2); px(im,9,7,'berry')
    rect(im,19,18,26,23,'white'); px(im,21,20,'berry_l'); px(im,24,20,'berry_l')
def ST_sick(im,d):
    face(im,d,'sick'); d.arc((10,20,21,27),200,340,fill=P('black'),width=2); rect(im,22,4,24,14,'white'); rect(im,23,11,23,13,'berry'); ell(im,(21,13,25,17),'berry')
    for x,y in((6,4),(27,20)): ell(im,(x-1,y-1,x+2,y+2),'leaf_d')
def ST_cold(im,d):
    face(im,d,'water_l'); rect(im,10,19,21,20,'black'); [px(im,x,21,'white') for x in range(11,21,2)]
    rect(im,4,22,27,26,'roof'); rect(im,4,22,27,22,'roof_l'); rect(im,20,26,23,30,'roof')
    for x,y in((2,8),(29,10)): px(im,x,y,'white'); [px(im,x+a,y+b,'ice_l') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
def ST_sad(im,d):
    face(im,d,'fire_l'); d.arc((10,19,21,27),200,340,fill=P('black'),width=2); rect(im,20,15,21,19,'water'); px(im,20,15,'water_l')
    d.line([(8,9),(12,8)],fill=P('black')); d.line([(19,8),(23,9)],fill=P('black'))
def ST_thermo_cold(im,d):
    rect(im,13,3,18,22,'outline'); rect(im,14,4,17,21,'white'); ell(im,(10,19,21,30),'water'); rect(im,15,14,16,22,'water'); px(im,12,22,'water_l')
    for y in(6,10,14): rect(im,19,y,21,y,'outline')
    for x,y in((6,8),(25,16)): px(im,x,y,'snow_l'); [px(im,x+a,y+b,'ice_d') for a,b in((1,0),(-1,0),(0,1),(0,-1),(2,0),(-2,0),(0,2),(0,-2))]
def ST_thermo_hot(im,d):
    rect(im,13,3,18,22,'outline'); rect(im,14,4,17,21,'white'); ell(im,(10,19,21,30),'warn_r'); rect(im,15,6,16,22,'warn_r'); px(im,12,22,'fire_l')
    for x,y in((6,8),(24,10),(26,18)): px(im,x,y,'fire_l'); px(im,x,y+1,'warn_o')
def ST_mourning(im,d):
    ell(im,(10,6,22,16),'white'); [ell(im,(x-3,y-3,x+3,y+3),'white') for x,y in((10,8),(22,8),(10,14),(22,14))]; ell(im,(13,8,19,14),'fire_l'); rect(im,15,16,16,28,'leaf_d'); ell(im,(16,20,23,25),'leaf')
def statuses():
    for n,fn in(('injured',ST_injured),('sick',ST_sick),('cold',ST_cold),('sad',ST_sad),('thermometer_cold',ST_thermo_cold),('thermometer_hot',ST_thermo_hot),('mourning',ST_mourning)):
        im=icon_draw(fn); save(im,f'icons/status/status_{n}.png'); save(outline(to16(fn and im.crop((0,0,32,32)))) if False else to16(im),f'icons/status/status_{n}_16.png',note='16x16 (downscale + kuantisasi palet)')
def W_hunger(im,d,s): I_hunger(im,d)
def W_fire(im,d,s): I_warmth(im,d)
def W_howl(im,d,s):
    ell(im,(6,9,25,26),'wolf'); d.polygon([(7,13),(8,3),(14,9)],fill=P('wolf_d')); d.polygon([(24,13),(23,3),(17,9)],fill=P('wolf_d'))
    ell(im,(10,17,21,27),'wolf_l'); ell(im,(13,20,18,26),'black'); rect(im,10,13,12,14,'black'); rect(im,19,13,21,14,'black')
    for i in range(2): d.arc((22-i*0+i*3,4-i*2,30+i*3,14+i*2),300,60,fill=P('white'))
def W_flood(im,d,s):
    for i,y in enumerate((10,17,24)): d.arc((2,y-6,16,y+4),200,340,fill=P('water' if i%2 else 'water_d'),width=3); d.arc((15,y-6,29,y+4),200,340,fill=P('water' if i%2 else 'water_d'),width=3)
    px(im,8,6,'foam'); px(im,22,6,'foam')
def warnings():
    lv={'yellow':('warn_y','fire_w','gold_d'),'orange':('warn_o','fire_l','fire_d'),'red':('warn_r','roof_l','brick_d')}
    for ln,(c,cl,cd) in lv.items():
        b=new(96,24); rect(b,0,0,95,23,'outline'); rect(b,1,1,94,22,c); rect(b,1,1,94,2,cl); rect(b,1,20,94,22,cd)
        for x in range(4,92,8): ImageDraw.Draw(b).polygon([(x,20),(x+4,20),(x+2,22)],fill=P('outline')) if ln=='red' else None
        [b.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(95,0),(0,23),(95,23))]
        save(b,f'ui/warning/banner_{ln}.png',note='9-slice margin 8/4/8/5; teks gelap (kuning/oranye) atau putih (merah)')
        for tn,fn in(('hunger',W_hunger),('fire',W_fire),('howl',W_howl),('flood',W_flood)):
            im=new(); d=ImageDraw.Draw(im)
            d.polygon([(16,1),(31,29),(1,29)],fill=P('outline')); d.polygon([(16,4),(28,27),(4,27)],fill=P(c)); d.polygon([(16,4),(18,8),(14,8)],fill=P(cl))
            ins=new(); fn(ins,ImageDraw.Draw(ins),1); ins=outline(ins).resize((16,16),Image.NEAREST); im.alpha_composite(ins,(8,11))
            if ln=='red': rect(im,29,0,31,6,'warn_r'); rect(im,29,8,31,9,'warn_r')
            save(im,f'ui/warning/warn_{tn}_{ln}.png',note=f'peringatan dini tingkat {ln}')
    m=Image.new('RGBA',(32,32),(70,70,90,70)); save(m,'effects/mourning_overlay.png',note='duka: overlay redup RGBA (70,70,90,70) selama 1 hari (opsional)')
    v=new(320,180); d=ImageDraw.Draw(v)
    for i in range(20): d.rectangle([i,i,319-i,179-i],outline=(40,36,56,int(110*(1-i/20))))
    save(v,'effects/mourning_vignette.png',note='bingkai redup lembut, stretch ke layar')
# ---------- GRAVES ----------
def graves():
    def base(im): ell(im,(6,20,25,29),'dirt'); ell(im,(8,20,23,26),'dirt_l'); px(im,12,22,'grass_l'); px(im,19,23,'grass_l')
    def g_round(im):
        base(im); ell(im,(9,3,22,16),'stone'); rect(im,9,9,22,22,'stone'); rect(im,9,20,22,22,'stone_d'); ell(im,(11,5,16,9),'stone_l'); rect(im,13,10,18,11,'stone_d'); rect(im,15,8,16,14,'stone_d')
    def g_cross(im):
        base(im); rect(im,14,3,17,23,'wood'); rect(im,9,8,22,11,'wood'); rect(im,14,3,14,23,'wood_l'); rect(im,9,8,22,8,'wood_l')
    def g_flower(im):
        g_round(im); [ (ell(im,(x-2,y-2,x+2,y+2),c),px(im,x,y,'fire_l')) for x,y,c in((8,23,'blossom'),(23,24,'white'),(12,26,'berry_l'))]
    def g_cairn(im):
        base(im); [ell(im,b,c) for b,c in(((8,17,24,25),'stone_d'),((10,12,22,20),'stone'),((12,7,20,14),'stone_l'),((14,3,18,8),'stone'))]
    def g_mound(im):
        ell(im,(5,12,26,28),'dirt'); ell(im,(7,12,24,22),'dirt_l'); px(im,12,16,'dirt_d'); px(im,18,19,'dirt_d'); rect(im,15,5,16,13,'wood')
    def g_snow(im):
        g_round(im); ell(im,(9,3,22,9),'snow_l'); ell(im,(6,22,25,29),'snow')
    for n,fn in(('grave_stone_round',g_round),('grave_cross_wood',g_cross),('grave_stone_flowers',g_flower),('grave_cairn',g_cairn),('grave_mound_fresh',g_mound),('grave_stone_snow',g_snow)):
        im=new(); fn(im); save(shadow(outline(im),16,28,10,2),f'structures/graves/{n}.png',note='32x32')
    im=new(64,64)
    for x,y,s in((0,0,'grave_stone_round'),(32,0,'grave_cross_wood'),(0,30,'grave_stone_flowers'),(32,30,'grave_cairn')): im.alpha_composite(R_(f'structures/graves/{s}.png'),(x,y))
    rect(im,0,62,63,63,'wood_d'); save(im,'structures/graves/graveyard_2x2.png',note='contoh susunan makam 2x2 tile')
def stage4():
    seasons(); weather(); flood(); fire_smoke(); burnt(); wolves(); fences(); tower(); torches(); statuses(); warnings(); graves()
# =====================================================================
# TAHAP 5: stockpile bertingkat (hanya file baru)
# =====================================================================
def pallet(im):
    rect(im,5,24,26,27,'wood'); rect(im,5,24,26,24,'wood_l'); [rect(im,x,25,x+1,28,'wood_d') for x in(6,15,24)]
def log_end(im,x,y):
    ell(im,(x,y,x+5,y+5),'wood_d'); ell(im,(x+1,y+1,x+4,y+4),'dirt_l'); px(im,x+2,y+2,'wood_l')
def sp_wood(im,lv):
    pallet(im)
    rows={1:[(1,6)],2:[(2,6),(1,4)],3:[(3,6),(2,4),(1,2)],4:[(4,6),(3,4),(2,2),(1,0)]}.get(lv,[])
    for r_,(n,_) in enumerate(rows):
        y=19-r_*5; x0=16-n*3
        for i in range(n):
            x=x0+i*6; rect(im,x+1,y+1,x+4,y+4,'wood')  # isi
            log_end(im,x,y)
    if lv>=2: rect(im,4,8+ (4-lv)*5,4,23,'wood_d'); rect(im,27,8+(4-lv)*5,27,23,'wood_d')  # patok penahan
def sp_stone(im,lv):
    ell(im,(5,23,26,28),'dirt_d'); ell(im,(6,23,25,26),'dirt')
    stones={1:[(13,19,6)],2:[(9,19,6),(17,19,6),(13,15,5)],3:[(6,19,6),(13,19,6),(20,19,6),(9,14,6),(17,14,6),(13,9,5)],
            4:[(4,19,6),(10,19,6),(16,19,6),(22,19,6),(7,14,6),(13,14,6),(19,14,6),(10,9,6),(16,9,6),(13,4,5)]}.get(lv,[])
    for x,y,s in stones:
        ImageDraw.Draw(im).ellipse([x,y,x+s,y+s],fill=P('stone'),outline=P('stone_d'))
        rect(im,x+1,y+s-1,x+s-1,y+s-1,'stone_d'); px(im,x+2,y+1,'stone_l'); px(im,x+1,y+2,'stone_l')
def basket(im,x,y,w,h,fill):
    d=ImageDraw.Draw(im); d.polygon([(x,y),(x+w,y),(x+w-2,y+h),(x+2,y+h)],fill=P('straw')); rect(im,x,y,x+w,y,'straw_d')
    [d.line([(xx,y+1),(xx,y+h-1)],fill=P('straw_d')) for xx in range(x+3,x+w-1,4)]
    if fill:
        for i,xx in enumerate(range(x+1,x+w-1,3)): ell(im,(xx,y-3,xx+3,y),['berry','carrot','wheat','berry_l'][i%4])
def crate(im,x,y,w,h,top=None):
    rect(im,x,y,x+w,y+h,'wood_l'); rect(im,x,y,x+w,y,'dirt_l'); rect(im,x,y+h,x+w,y+h,'wood_d'); rect(im,x,y,x,y+h,'wood_d'); rect(im,x+w,y,x+w,y+h,'wood_d')
    rect(im,x+1,y+h//2,x+w-1,y+h//2,'wood')
    if top:
        for i,xx in enumerate(range(x+1,x+w-1,3)): ell(im,(xx,y-3,xx+3,y),top[i%len(top)])
def sp_food(im,lv):
    pallet(im)
    if lv==1: basket(im,10,16,11,7,True)
    if lv==2: basket(im,5,16,10,7,True); basket(im,17,16,10,7,True)
    if lv==3: crate(im,4,14,12,9,['berry','carrot']); basket(im,18,16,9,7,True); basket(im,9,7,10,6,True)
    if lv==4: crate(im,3,14,12,9,['wheat']); crate(im,16,14,12,9,['berry','carrot']); crate(im,9,4,13,9,['berry_l','carrot','wheat']); px(im,6,12,'leaf'); px(im,26,12,'leaf')
def barrel(im,x,y,w,h):
    ell(im,(x,y+h-3,x+w,y+h+1),'wood_d'); rect(im,x,y+2,x+w,y+h-1,'wood'); ell(im,(x,y,x+w,y+4),'wood_l'); ell(im,(x+1,y+1,x+w-1,y+3),'water')
    px(im,x+2,y+2,'water_l'); rect(im,x,y+5,x+w,y+5,'stone_d'); rect(im,x,y+h-3,x+w,y+h-3,'stone_d'); rect(im,x+2,y+6,x+2,y+h-4,'wood_l')
def sp_water(im,lv):
    ell(im,(5,23,26,28),'stone_d'); ell(im,(6,23,25,26),'stone')
    if lv==1: barrel(im,11,13,9,13)
    if lv==2: barrel(im,6,13,9,13); barrel(im,17,13,9,13)
    if lv==3: barrel(im,4,14,8,12); barrel(im,13,13,8,13); barrel(im,21,14,7,12); 
    if lv==4: barrel(im,3,14,8,12); barrel(im,12,13,8,13); barrel(im,21,14,8,12); barrel(im,8,2,8,12); barrel(im,17,3,7,11)
    if lv in(1,2,3): # gayung/kendi kecil
        ell(im,(24 if lv<3 else 1,20,29 if lv<3 else 6,26),'roof'); rect(im,25 if lv<3 else 2,19,28 if lv<3 else 5,20,'roof_d')
def snow_cap(src):
    im=src.copy(); o=im.copy(); p=o.load(); w,h=im.size
    for y in range(1,h):
        for x in range(w):
            c=im.getpixel((x,y)); a=im.getpixel((x,y-1))
            if c[3]==255 and c[:3]!=PALETTE['outline'] and a[:3]==PALETTE['outline'] and a[3]==255 and c[:3]!=PALETTE['shadow'][:3]:
                p[x,y]=P('snow_l')
                if y+1<h and im.getpixel((x,y+1))[3]==255 and im.getpixel((x,y+1))[:3]!=PALETTE['outline']: p[x,y+1]=P('snow')
    return o
def stockpiles():
    names={'kayu':sp_wood,'batu':sp_stone,'makanan':sp_food,'air':sp_water}
    desc={'kayu':'tumpukan kayu gelondong di atas palet','batu':'tumpukan batu di alas tanah','makanan':'keranjang lalu peti makanan di palet','air':'tong/gentong air di alas batu'}
    for n,fn in names.items():
        for lv in range(5):
            im=new(); fn(im,lv); im=shadow(outline(im),16,28,13,3)
            note=f'{desc[n]}; tingkat {lv}/4' + (' (kosong/alas)' if lv==0 else '')
            save(im,f'stockpiles/stockpile_{n}_{lv}.png',note=note+'; anchor tengah-bawah')
            save(snow_cap(im),f'stockpiles/stockpile_{n}_{lv}_winter.png',note=note+'; bersalju, ukuran/anchor sama')
# =====================================================================
# TAHAP 6: siklus hidup (bayi, anak, lansia), ikon tidur/pasangan, rumah malam & pintu
# =====================================================================
import inspect as _insp, textwrap as _tw
_src=_insp.getsource(snowify).replace("def snowify(src,roof_bottom,extra=()):\n    im=Image.open(os.path.join(ROOT,src)).convert('RGBA');","def snowify_im(im,roof_bottom,src,extra=()):\n    im=im.convert('RGBA');")
exec(_src)
PALETTE.update({'window_dark':(62,70,112),'hair_grey':(176,174,184),'hair_white':(232,230,236),'cloth_e1':(150,110,90),'cloth_e2':(110,130,150),'cloth_e3':(160,120,150),'cloth_e4':(120,140,96)})
def breathe(im):
    o=new(); o.paste(im.crop((0,0,32,27)),(0,1)); o.paste(im.crop((0,27,32,32)),(0,27)); return o
def person_sheet(fn):
    """fn(dirn,frame,walk)->32x32. Baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas)."""
    sh=new(128,256)
    for r_,dn in enumerate(['down','left','right','up']):
        b=fn(dn,0,False); bb=breathe(b)
        for f in range(4): sh.paste(b if f%2==0 else bb,(f*32,r_*32)); sh.paste(fn(dn,f,True),(f*32,(r_+4)*32))
    return sh
def squash(im,rows):
    keep=[y for y in range(32) if y not in rows]; o=new(); off=32-len(keep)
    for i,y in enumerate(keep): o.paste(im.crop((0,y,32,y+1)),(0,i+off))
    return o
# ---------- ANAK ----------
CHILD_VARS=[('skin1','hair2','cloth4'),('skin2','hair1','cloth3'),('skin3','hair4','cloth2'),('skin4','hair3','cloth1')]
def child_frame(v,dn,f,walk):
    return squash(villager_frame(v,dn,f,walk),[19,20,22,23,26])
# ---------- LANSIA ----------
ELDER_VARS=[('skin1','hair_white','cloth_e1'),('skin2','hair_grey','cloth_e2'),('skin3','hair_white','cloth_e3'),('skin4','hair_grey','cloth_e4')]
def elder_frame(v,dn,f,walk):
    im=villager_frame(v,dn,f,walk); top=im.crop((0,0,32,17)); o=im.copy(); ImageDraw.Draw(o).rectangle([0,0,31,16],fill=(0,0,0,0))
    dx={'left':-1,'right':1}.get(dn,0); o.alpha_composite(top,(dx,1))
    d=ImageDraw.Draw(o)
    if dn in('left','right'):
        s=1 if dn=='right' else -1; hx=16+s*4; gx=16+s*7
        d.line([(hx,20),(gx,29)],fill=P('wood_d')); px(o,hx,20,'wood'); px(o,hx-s,20,'wood')
    elif dn=='down': d.line([(24,21),(25,29)],fill=P('wood_d')); px(o,24,20,'wood')
    # kerut halus/pipi
    return o
# ---------- BAYI ----------
BABY_VARS=[('skin1','hair2','cloth2'),('skin2','hair1','blossom'),('skin3','hair4','cloth4'),('skin4','hair3','cloth3')]
def baby_body(v,big=True):
    skin,hair,blank=v; im=new(16,14)
    ell(im,(1,5,14,13),blank); ell(im,(3,6,12,12),'white') if False else None; rect(im,4,9,11,9,'cloth_l')
    ell(im,(4,0,11,8),skin); px(im,7,0,hair); px(im,8,0,hair); px(im,7,1,hair)
    px(im,6,4,'black'); px(im,9,4,'black'); px(im,5,6,'berry_l'); px(im,10,6,'berry_l')
    return im
def babies():
    for i,v in enumerate(BABY_VARS):
        sh=new(64,32)
        for f in range(2):
            im=new(); b=baby_body(v); im.alpha_composite(b,(8,15-f)) ; im=shadow(outline(im),16,29,6,2)
            if f==1: pass
            sh.paste(im,(f*32,0))
        save(sh,f'characters/lifecycle/baby_{i+1}.png',(32,32),2,'bayi diam (bedong), 2 frame napas ~500ms; kaki/alas y≈29')
    # overlay digendong: 4 frame arah (bawah,kiri,kanan,atas) untuk ditempel di frame villager
    ov=new(128,32)
    sk,hr,bl=BABY_VARS[0]
    for di,dn in enumerate(['down','left','right','up']):
        im=new()
        if dn=='down': ell(im,(8,19,21,25),bl); rect(im,10,21,19,21,'cloth_l'); ell(im,(17,17,22,22),sk); px(im,19,19,'black'); px(im,21,19,'black'); px(im,20,17,hr)
        elif dn=='right': ell(im,(14,19,23,25),bl); ell(im,(20,16,25,21),sk); px(im,23,18,'black'); px(im,22,16,hr)
        elif dn=='left': ell(im,(8,19,17,25),bl); ell(im,(6,16,11,21),sk); px(im,8,18,'black'); px(im,9,16,hr)
        else: ell(im,(18,13,25,19),bl); ell(im,(19,10,24,15),hr)
        im=outline(im)
        ov.paste(im,(di*32,0))
    save(ov,'characters/lifecycle/baby_carried_overlay.png',(32,32),4,'tempel di atas frame villager_N (posisi 0,0 frame); kolom = arah bawah,kiri,kanan,atas; saat jalan geser y -1 pada frame 1 & 3')
    for i,v in enumerate(VARS):
        def fn(dn,f,walk,v=v):
            im=villager_frame(v,dn,f,walk); ovf=ov.crop((['down','left','right','up'].index(dn)*32,0,['down','left','right','up'].index(dn)*32+32,32))
            bob=1 if walk and f in(1,3) else 0; tmp=new(); tmp.alpha_composite(ovf,(0,-bob))
            sk=v[0]
            if dn=='down': rect(tmp,7,22-bob,8,23-bob,sk); rect(tmp,22,22-bob,23,23-bob,sk)
            im.alpha_composite(tmp); return im
        save(person_sheet(fn),f'characters/lifecycle/villager_{i+1}_holding_baby.png',(32,32),32,'format villager_N.png (0-3 diam, 4-7 jalan) sambil menggendong bayi')
    for kind in('cradle','cradle_empty'):
        sh=new(64,32)
        for f in range(2):
            im=new(); d=ImageDraw.Draw(im); tilt=[-1,1][f]
            d.arc((4,14,28,32),200,340,fill=P('wood_d'),width=2)
            d.polygon([(6,16+tilt),(26,16-tilt),(24,25-tilt),(8,25+tilt)],fill=P('wood_l')); d.line([(6,16+tilt),(26,16-tilt)],fill=P('dirt_l'))
            rect(im,6,13+tilt,8,17+tilt,'wood'); 
            if kind=='cradle':
                ell(im,(9,12,22,20),'cloth2'); ell(im,(19,10,25,16),'skin1'); px(im,21,12,'black'); px(im,23,12,'black'); px(im,22,10,'hair2')
            else: ell(im,(9,13,22,19),'cloth_l')
            sh.paste(shadow(outline(im),16,29,11,2),(f*32,0))
        save(sh,f'characters/lifecycle/{kind}.png',(32,32),2,('buaian berisi bayi' if kind=='cradle' else 'buaian kosong')+', 2 frame ayun ~400ms')
    for i,v in enumerate(CHILD_VARS):
        save(person_sheet(lambda dn,f,w,v=v: child_frame(v,dn,f,w)),f'characters/lifecycle/child_{i+1}.png',(32,32),32,'anak: format villager_N.png, tinggi ≈23px (kepala mulai y≈7), kaki y≈29')
    for i,v in enumerate(ELDER_VARS):
        save(person_sheet(lambda dn,f,w,v=v: elder_frame(v,dn,f,w)),f'characters/lifecycle/elder_{i+1}.png',(32,32),32,'lansia: format villager_N.png, rambut abu/putih, bungkuk 1px, tongkat; jalan ~180ms/frame & kecepatan 0.7x')
# ---------- IKON ZZZ & HATI ----------
def bubbles():
    sh=new(64,16)
    for f in range(4):
        im=new(16,16)
        for k,(x,y,s) in enumerate(((2,10,3),(6,6,4),(10,1,5))):
            if k<=f or f==3:
                if f==3 and k==0: continue
                yy=y-(1 if f%2 else 0)
                d=ImageDraw.Draw(im); c=P('white'); d.line([(x,yy),(x+s-1,yy)],fill=c); d.line([(x+s-1,yy),(x,yy+s-1)],fill=c); d.line([(x,yy+s-1),(x+s-1,yy+s-1)],fill=c)
        sh.paste(outline(im,'cloth_d'),(f*16,0))
    save(sh,'icons/status/icon_zzz_anim.png',(16,16),4,'Zzz tidur, 4 frame ~300ms loop; tempel di (x+16, y-12) relatif kiri-atas frame penduduk 32x32 (sudut kanan atas kepala)')
    sh=new(64,16)
    for f,s in enumerate((0,1,2,1)):
        im=new(16,16); r=3+s; cx=8; cy=7
        ell(im,(cx-r*2+1,cy-r,cx,cy+1),'berry'); ell(im,(cx-1,cy-r,cx+r*2-2,cy+1),'berry')
        ImageDraw.Draw(im).polygon([(cx-r*2+1,cy-0),(cx+r*2-2,cy-0),(cx-0.5,cy+r+2)],fill=P('berry')); px(im,cx-r,cy-r+2,'berry_l'); px(im,cx-r+1,cy-r+1,'white')
        sh.paste(outline(im),(f*16,0))
    save(sh,'icons/status/icon_heart_pulse.png',(16,16),4,'hati pasangan, denyut 4 frame ~150ms (jeda 600ms di frame 0); tempel di (x+8, y-14) = tengah di atas kepala')
# ---------- RUMAH: LAMPU MATI & PINTU ----------
def house_states():
    for name,rb in(('wooden_house',54),('hut',41)):
        base=R_(f'buildings/{name}.png')
        off=recolor(base,{'water_l':'window_dark'})
        if name=='hut': rect(off,29,43,35,56,'outline'); rect(off,30,44,34,56,'wood_d')
        save(off,f'buildings/night/{name}_night_off.png',note=f'malam lampu mati (penghuni tidur/kosong); ukuran/anchor = buildings/{name}.png; tetap pakai night_overlay di atasnya')
        save(snowify_im(off,rb,f'buildings/{name}.png'),f'buildings/winter/{name}_night_off_winter.png',note='malam lampu mati + salju')
        W_,H_=base.size; door=(28,42,36,56) if name=='hut' else (42,64,54,88)
        for suf,src in(('',base),('_winter',snowify_im(base,rb,f'buildings/{name}.png'))):
            sh=new(W_*3,H_)
            for f in range(3):
                im=src.copy(); x0,y0,x1,y1=door
                if f>0:
                    rect(im,x0+1,y0+1,x1-1,y1,'outline'); rect(im,x0+2,y0+3,x1-2,y1,'cloth_d'); rect(im,x0+2,y1-2,x1-2,y1,'wood_d')
                    w=(x1-x0)//2 if f==1 else 2; rect(im,x0+1,y0+1,x0+w,y1,'wood'); rect(im,x0+w,y0+1,x0+w,y1,'wood_d'); rect(im,x0+1,y0+1,x0+1,y1,'wood_l')
                sh.paste(im,(f*W_,0))
            save(sh,f'buildings/{name}_door{suf}.png',(W_,H_),3,f'pintu: 0 tertutup, 1 setengah, 2 terbuka (~100ms/frame; balik urutan untuk menutup); frame = ukuran/anchor {name}.png'+(' (versi salju)' if suf else ''))
def stage6():
    babies(); bubbles(); house_states()
# =====================================================================
# TAHAP 7: nuansa Indonesia (tropis). Hanya file baru.
# =====================================================================
PALETTE.update({
 'tr_leaf_d':(38,104,58),'tr_leaf':(60,146,70),'tr_leaf_l':(118,190,80),'palm_d':(70,120,50),'palm':(108,160,62),'palm_l':(166,200,90),
 'coco':(120,82,46),'coco_l':(170,124,66),'banana':(240,208,70),'banana_g':(176,196,70),'mango':(246,170,50),'mango_g':(170,190,70),
 'rambutan':(214,48,52),'rambutan_l':(250,110,90),'hibiscus':(230,44,70),'hibiscus_l':(255,120,140),'frangi':(252,246,232),'frangi_y':(250,214,90),
 'bamboo_d':(110,140,50),'bamboo':(160,184,70),'bamboo_l':(206,220,120),'teak_bark':(122,96,72),'banyan_bark':(110,92,80),
 'cassava_stem':(176,104,110),'corn':(250,214,80),'corn_husk':(196,206,120),'coffee':(196,40,48),'coffee_g':(120,170,70),
 'paddy_w':(110,170,180),'paddy_wl':(170,214,214),'paddy_d':(80,130,140),'rice_g':(96,180,70),'rice_y':(230,200,80),'rice_yd':(196,160,60),
 'ijuk':(70,56,52),'ijuk_l':(104,86,76),'tile_roof':(196,88,56),'tile_roof_d':(150,62,48),'tile_roof_l':(228,128,84),
})
def trunk(im,x0,x1,y0,y1,c='wood',cd='wood_d',cl='wood_l'):
    rect(im,x0,y0,x1,y1,c); rect(im,x0,y0,x0,y1,cd); rect(im,x1,y0,x1,y1,cl)
def canopy(im,boxes,cols,seed,dots=None):
    for b,c in zip(boxes,cols): ell(im,b,c)
    r=random.Random(seed)
    for _ in range(30):
        x,y=r.randrange(boxes[0][0]+2,boxes[0][2]-2),r.randrange(boxes[0][1]+2,boxes[0][3]-2)
        if im.getpixel((x,y))[3]: px(im,x,y,cols[0])
    if dots:
        n,cs,big=dots
        for _ in range(n):
            x,y=r.randrange(boxes[0][0]+3,boxes[0][2]-3),r.randrange(boxes[0][1]+5,boxes[0][3]-3)
            if im.getpixel((x,y))[3]:
                c=r.choice(cs); rect(im,x,y,x+big-1,y+big-1,c); px(im,x,y,'white' if big>1 else c)
def fin(im,cx,cy,rx,ry=3): return shadow(outline(im),cx,cy,rx,ry)
def f_coconut(fruit=True):
    im=new(32,64); d=ImageDraw.Draw(im)
    pts=[(14+int(3*math.sin(t/8)),58-t) for t in range(0,40)]
    for i,(x,y) in enumerate(pts): rect(im,x,y,x+3,y,'coco_l' if i%4 else 'coco'); px(im,x,y,'coco')
    tx,ty=pts[-1]
    for ang,l in((-170,14),(-140,15),(-100,12),(-60,15),(-20,14),(10,12),(160,12),(40,11),(140,11)):
        a=math.radians(ang); ex,ey=tx+2+l*math.cos(a),ty+l*math.sin(a)*0.7+ (3 if abs(ang)<30 or abs(ang)>150 else 0)
        d.line([(tx+2,ty),(ex,ey)],fill=P('palm'),width=3); d.line([(tx+2,ty),(ex,ey)],fill=P('palm_l'),width=1)
        d.line([(ex,ey),(ex+math.cos(a)*2,ey+3)],fill=P('palm_d'),width=2)
    if fruit:
        for x,y in((tx,ty+2),(tx+3,ty+3),(tx+1,ty+5)): ell(im,(x-1,y-1,x+2,y+2),'coco'); px(im,x,y,'coco_l')
    return fin(im,16,59,6)
def f_banana(fruit=True):
    im=new(32,64); d=ImageDraw.Draw(im); trunk(im,14,18,34,58,'banana_g','palm_d','palm_l')
    for side,(dx,up,droop) in [(1,(15,8,16)),(-1,(15,8,16)),(1,(11,16,10)),(-1,(11,15,10)),(1,(3,24,2))]:
        pts=[]
        for i in range(13):
            t=i/12; x=16+side*dx*t; y=34-up*math.sin(t*math.pi*0.75)+droop*t*t; pts.append((x,y))
        for i,(x,y) in enumerate(pts):
            w=1+int(2.2*math.sin(min(1,(i+1)/12)*math.pi)); ell(im,(x-w+1,y-w,x+w-1,y+w),'tr_leaf')
        for i,(x,y) in enumerate(pts[:-1]): px(im,int(x),int(y),'tr_leaf_l')
        for i,(x,y) in enumerate(pts[2:-1:3]): px(im,int(x),int(y)+2,'tr_leaf_d')
    if fruit:
        for i in range(4): ell(im,(17,33+i*3,23,36+i*3),'banana' if i<2 else 'banana_g'); px(im,18,34+i*3,'fire_w')
        ell(im,(19,46,22,50),'roof_d')
    return fin(im,16,59,7)
def f_bamboo():
    im=new(32,64)
    for x,top,c in((6,8,'bamboo_d'),(12,2,'bamboo'),(18,5,'bamboo'),(24,10,'bamboo_d'),(15,12,'bamboo_l')):
        rect(im,x,top,x+2,58,c); [rect(im,x,y,x+2,y,'palm_d') for y in range(top+5,58,7)]; px(im,x+2,top,'bamboo_l')
        for y in range(top+3,40,9):
            d=ImageDraw.Draw(im); d.line([(x+2,y),(x+7,y-3)],fill=P('tr_leaf_l'),width=2); d.line([(x,y+4),(x-5,y+1)],fill=P('tr_leaf'),width=2)
    return fin(im,16,59,11)
def f_teak():
    im=new(32,64); trunk(im,13,18,36,58,'teak_bark','wood_d','dirt_l')
    canopy(im,[(1,6,31,42),(3,4,29,36),(7,6,21,22)],['tr_leaf_d','tr_leaf','tr_leaf_l'],11)
    r=random.Random(3)
    for _ in range(6): x,y=r.randrange(5,25),r.randrange(8,34); rect(im,x,y,x+3,y+2,'tr_leaf_l'); px(im,x,y+2,'tr_leaf_d')
    return fin(im,16,59,12)
def f_banyan():
    im=new(64,64); d=ImageDraw.Draw(im)
    trunk(im,26,37,30,58,'banyan_bark','wood_d','stone_l')
    for x in(28,31,34): d.line([(x,40),(x+ (x-31)*2,58)],fill=P('banyan_bark'),width=2)
    canopy(im,[(1,4,63,40),(3,2,61,34),(14,4,40,20)],['tr_leaf_d','tr_leaf','tr_leaf_l'],12)
    for x in range(6,60,5):
        if 24<x<40: continue
        l=8+(x*7)%10; d.line([(x,30),(x,30+l)],fill=P('banyan_bark')); px(im,x,30+l,'wood_d')
    return fin(im,32,59,24,4)
def f_fruit_tree(fruitcol,fruitcol2,big,fruit,seed):
    im=new(32,64); trunk(im,13,18,38,58)
    canopy(im,[(2,8,30,44),(3,6,28,38),(8,7,21,22)],['tr_leaf_d','tr_leaf','tr_leaf_l'],seed,(14,[fruitcol,fruitcol2],3) if fruit else None)
    return fin(im,16,59,11)
def f_shrub():
    im=new(); canopy(im,[(3,10,29,29),(4,8,27,25),(8,9,18,17)],['tr_leaf_d','tr_leaf','tr_leaf_l'],5); return fin(im,16,29,12)
def f_hibiscus():
    im=new(); canopy(im,[(3,8,29,29),(4,6,27,25),(8,7,18,15)],['tr_leaf_d','tr_leaf','tr_leaf_l'],6)
    for x,y in((8,12),(19,9),(14,19),(23,18),(10,23)):
        for dx,dy in((0,-2),(2,0),(0,2),(-2,0)): ell(im,(x+dx-1,y+dy-1,x+dx+1,y+dy+1),'hibiscus')
        px(im,x,y,'frangi_y'); px(im,x-1,y-2,'hibiscus_l')
    return fin(im,16,29,12)
def f_frangipani():
    im=new(32,64); d=ImageDraw.Draw(im); trunk(im,14,17,34,58,'stone','stone_d','stone_l')
    for ex,ey in((6,26),(26,24),(10,18),(22,16)): d.line([(15,36),(ex,ey)],fill=P('stone'),width=2)
    for cx,cy in((6,22),(26,20),(10,14),(22,12),(16,10)):
        ell(im,(cx-6,cy-4,cx+6,cy+5),'tr_leaf'); ell(im,(cx-4,cy-3,cx+2,cy+1),'tr_leaf_l')
        for dx,dy in((0,-1),(2,1),(-2,1)):
            x,y=cx+dx*2,cy+dy*2-1; rect(im,x,y,x+1,y+1,'frangi'); px(im,x,y+1,'frangi_y')
    return fin(im,16,59,9)
def crops_tropis():
    def tilled_cols(): return tilled()
    # padi: overlay tanaman (transparan) di atas tile sawah
    sh=new(192,32)
    for st in range(6):
        im=new()
        for y in range(5,30,6):
            for x in range(5,30,6):
                if st==0: px(im,x,y,'paddy_wl'); px(im,x+1,y,'paddy_wl')
                elif st==1: px(im,x,y,'rice_g'); px(im,x,y-1,'tr_leaf_l')
                elif st==2: rect(im,x,y-3,x,y,'rice_g'); px(im,x-1,y-2,'tr_leaf_l'); px(im,x+1,y-3,'rice_g')
                elif st==3: rect(im,x,y-5,x,y,'tr_leaf'); px(im,x-1,y-4,'rice_g'); px(im,x+1,y-5,'tr_leaf_l'); px(im,x-1,y-1,'tr_leaf_d')
                elif st==4: rect(im,x,y-5,x,y,'rice_yd'); px(im,x+1,y-5,'rice_y'); px(im,x+2,y-4,'rice_y'); px(im,x+2,y-3,'rice_yd'); px(im,x-1,y-3,'rice_y')
                elif st==5: px(im,x,y,'rice_yd'); px(im,x,y-1,'straw_d')
        sh.paste(im,(st*32,0))
    save(sh,'nature/crops/crop_padi.png',(32,32),6,'OVERLAY tanaman padi di atas tiles/tropis/sawah_autotile: 0 tergenang (diolah), 1 bibit, 2 tumbuh, 3 bunting, 4 menguning (panen), 5 dipanen (jerami)')
    # sawah autotile 16 (4-bit): pematang di sisi yang TIDAK tersambung
    sh=new(128,128)
    for m in range(16):
        im=new(); rect(im,0,0,31,31,'paddy_w'); r=random.Random(m)
        for _ in range(10): x,y=r.randrange(32),r.randrange(32); px(im,x,y,'paddy_wl'); px(im,(x+1)%32,y,'paddy_wl')
        for _ in range(12): px(im,r.randrange(32),r.randrange(32),'paddy_d')
        if not m&1: rect(im,0,0,31,3,'dirt'); rect(im,0,0,31,0,'grass'); rect(im,0,3,31,3,'dirt_d')
        if not m&4: rect(im,0,28,31,31,'dirt'); rect(im,0,28,31,28,'grass'); rect(im,0,31,31,31,'dirt_d')
        if not m&8: rect(im,0,0,3,31,'dirt'); rect(im,0,0,0,31,'grass'); rect(im,3,0,3,31,'dirt_d')
        if not m&2: rect(im,28,0,31,31,'dirt'); rect(im,28,0,28,31,'grass'); rect(im,31,0,31,31,'dirt_d')
        for _ in range(3):
            x,y=r.randrange(32),r.randrange(32)
            if im.getpixel((x,y))[:3]==PALETTE['dirt']: px(im,x,y,'grass_l')
        sh.paste(im,((m%4)*32,(m//4)*32))
    save(sh,'tiles/tropis/sawah_autotile.png',(32,32),16,'sawah tergenang + pematang; 16-tile 4-bit: indeks = N1+E2+S4+W8 (tetangga yang juga sawah, sisi tanpa pematang); kolom i%4, baris i//4; indeks 0 = petak tunggal')
    sh2=new(64,32)
    for f in range(2):
        im=sh.crop((96,96,128,128)).copy(); r=random.Random(70+f)
        for _ in range(8): x,y=r.randrange(32),r.randrange(32); px(im,x,y,'paddy_wl'); px(im,(x+1)%32,y,'water_l')
        sh2.paste(im,(f*32,0))
    save(sh2,'tiles/tropis/sawah_water_anim.png',(32,32),2,'kilau air tile sawah penuh (indeks 15), 2 frame ~600ms (opsional)')
    for crop in('singkong','jagung','kopi'):
        sh=new(192,32)
        for st in range(6):
            im=tilled()
            for y in range(4,30,9 if crop!='kopi' else 13):
                for x in range(6,29,8 if crop!='kopi' else 12):
                    if st==1: px(im,x,y+1,'dirt_d'); px(im,x,y,'tr_leaf_l')
                    elif st==2: px(im,x,y,'tr_leaf_l'); px(im,x-1,y-1,'tr_leaf'); px(im,x+1,y-1,'tr_leaf')
                    elif st in(3,4):
                        if crop=='singkong':
                            top=y-4+(0 if st==4 else 2); rect(im,x,top,x,y+2,'cassava_stem')
                            for dx,dy in((-3,-1),(3,-1),(0,-3),(-2,1),(2,1),(-2,-2),(2,-2),(-1,0),(1,0),(0,-1)): px(im,x+dx,top+dy,'tr_leaf' if abs(dx)+abs(dy)>2 else 'tr_leaf_l')
                            if st==4: [px(im,x+dx,top+dy,'tr_leaf_d') for dx,dy in((-4,-1),(4,-1),(0,-4))]
                        elif crop=='jagung':
                            h=5 if st==3 else 7; rect(im,x,y-h,x,y+2,'tr_leaf'); px(im,x-1,y-2,'tr_leaf_l'); px(im,x+1,y-4,'tr_leaf_l')
                            if st==4: rect(im,x+1,y-3,x+2,y,'corn'); px(im,x+1,y-4,'corn_husk'); px(im,x,y-h,'straw_l')
                        else:
                            ell(im,(x-4,y-5,x+4,y+3),'tr_leaf_d'); ell(im,(x-3,y-5,x+3,y+1),'tr_leaf')
                            if st==4:
                                for dx,dy in((-2,-2),(1,-3),(2,0),(-1,1),(0,-1)): px(im,x+dx,y+dy,'coffee')
                            else:
                                for dx,dy in((-2,-2),(1,-3),(2,0)): px(im,x+dx,y+dy,'coffee_g')
                    elif st==5:
                        if crop=='singkong': ell(im,(x-2,y,x+2,y+2),'coco_l'); px(im,x,y-1,'cassava_stem')
                        elif crop=='jagung': rect(im,x,y-1,x,y+1,'straw_d'); px(im,x+1,y,'straw')
                        else: ell(im,(x-3,y-3,x+3,y+2),'tr_leaf_d'); px(im,x,y-1,'tr_leaf')
            sh.paste(outline(im,'wood_d'),(st*32,0))
        save(sh,f'nature/crops/crop_{crop}.png',(32,32),6,'urutan: diolah, bibit, tunas, tumbuh, siap panen, sudah dipanen' + (' (kopi: tanaman tetap, panen = buah merah)' if crop=='kopi' else ''))
def flora():
    save(f_coconut(True),'nature/tropis/tree_kelapa.png',note='32x64 anchor bawah; berbuah'); save(f_coconut(False),'nature/tropis/tree_kelapa_empty.png',note='32x64 tanpa buah')
    save(f_banana(True),'nature/tropis/tree_pisang.png',note='32x64 berbuah (tandan)'); save(f_banana(False),'nature/tropis/tree_pisang_empty.png',note='32x64')
    save(f_bamboo(),'nature/tropis/bambu.png',note='rumpun bambu 32x64')
    save(f_teak(),'nature/tropis/tree_jati.png',note='32x64')
    save(f_banyan(),'nature/tropis/tree_beringin.png',note='64x64 (2x2 tile), akar gantung')
    save(f_fruit_tree('mango','mango_g',2,True,21),'nature/tropis/tree_mangga.png',note='32x64 berbuah'); save(f_fruit_tree('mango','mango_g',2,False,21),'nature/tropis/tree_mangga_empty.png',note='32x64')
    save(f_fruit_tree('rambutan','rambutan_l',2,True,22),'nature/tropis/tree_rambutan.png',note='32x64 berbuah'); save(f_fruit_tree('rambutan','rambutan_l',2,False,22),'nature/tropis/tree_rambutan_empty.png',note='32x64')
    save(f_shrub(),'nature/tropis/bush_tropis.png',note='perdu tropis 32x32'); save(f_hibiscus(),'nature/tropis/bush_kembang_sepatu.png',note='bunga sepatu 32x32')
    save(f_frangipani(),'nature/tropis/tree_kamboja.png',note='kamboja 32x64')
    crops_tropis()
PALETTE.update({'ubi':(150,70,120),'ubi_l':(190,110,160),'ubi_leaf':(90,150,60)})
def flora_extra():
    sh=new(192,32)
    for st in range(6):
        im=tilled()
        for y in range(5,30,9):
            for x in range(6,29,8):
                if st==1: px(im,x,y+1,'dirt_d'); px(im,x,y,'ubi_leaf')
                elif st==2: px(im,x,y,'ubi_leaf'); px(im,x-1,y-1,'tr_leaf_l'); px(im,x+1,y,'tr_leaf')
                elif st in(3,4):
                    for dx,dy in((-2,0),(2,0),(0,-2),(-1,-1),(1,-1),(0,0),(-3,1),(3,1)): px(im,x+dx,y+dy,'ubi_leaf' if (dx+dy)%2 else 'tr_leaf')
                    if st==4: px(im,x-1,y+2,'ubi'); px(im,x,y+2,'ubi_l'); px(im,x+1,y+2,'ubi')
                elif st==5: ell(im,(x-2,y,x+2,y+2),'ubi'); px(im,x-1,y,'ubi_l')
        sh.paste(outline(im,'wood_d'),(st*32,0))
    save(sh,'nature/crops/crop_ubi.png',(32,32),6,'ubi jalar; urutan: diolah, bibit, tunas, tumbuh, siap panen (umbi terlihat), sudah dipanen')
    sh=new(96,32)
    for i in range(3):
        im=new(); rect(im,0,0,31,13,'dirt'); rect(im,0,0,31,1,'grass')
        r=random.Random(i)
        for y in range(3,13,3):
            for x in range(0,32,6): rect(im,(x+(y//3)%2*3)%32,y,(x+(y//3)%2*3)%32+4,y+1,'stone' if (x+y)%4 else 'stone_d')
        rect(im,0,13,31,14,'dirt_d'); [px(im,r.randrange(32),r.randrange(2,12),'grass_l') for _ in range(4)]
        if i==0: rect(im,0,0,1,14,'dirt_d')
        if i==2: rect(im,30,0,31,14,'dirt_d')
        sh.paste(im,(i*32,0))
    save(sh,'tiles/tropis/sawah_terrace_riser.png',(32,32),3,'dinding undakan sawah bertingkat (tinggi 15px di atas tile, sisa transparan): ujung kiri, tengah, ujung kanan; taruh di baris tile tepat di bawah petak sawah atas, menimpa bagian atas tile sawah bawah')
# ---------- FAUNA ----------
PALETTE.update({'chick_w':(250,244,230),'chick_b':(196,120,60),'comb':(222,50,50),'beak':(246,170,50),'duck_g':(60,130,90),
 'goat':(236,230,220),'goat_d':(170,160,150),'cow':(196,150,100),'cow_d':(150,104,70),'buff':(96,92,100),'buff_d':(64,60,72),'buff_l':(140,136,146),
 'deer':(176,112,64),'deer_d':(132,80,48),'boar':(96,70,56),'boar_d':(66,48,40),'monkey':(150,110,80),'monkey_l':(220,190,150),
 'snake':(110,160,60),'snake_d':(70,110,46),'snake_l':(200,214,110),'leo':(232,170,70),'leo_d':(150,96,40),'leo_l':(250,226,170),'spot':(70,50,40),
 'heron':(244,244,240),'sparrow':(150,104,70),'butter':(250,170,60),'butter2':(110,170,240),'firefly':(230,255,120)})
def quad_frame(F,dn,f,mode,c,o):
    """Hewan berkaki empat. F=ukuran frame (32/64). c=(gelap,utama,terang). o=opsi."""
    s=F/32; im=new(F,F); d=ImageDraw.Draw(im); D,M,Lc=c
    Q=lambda *v:[int(round(a*s)) for a in v]
    step=[0,1,0,-1][f] if mode=='walk' else 0; bob=1 if mode=='idle' and f in(1,2) else 0
    lun=[0,-1,3,1][f] if mode=='attack' else 0
    bx0,by0,bx1,by1=o.get('body',(7,14,24,24)); leg=o.get('leg',4); hy=o.get('head_y',8)
    if dn in('left','right'):
        sg=1 if dn=='right' else -1; X=lambda x:16+sg*(x-16)
        def R(x0,y0,x1,y1,col): rect(im,*Q(min(X(x0),X(x1)),y0,max(X(x0),X(x1)),y1),col)
        def E(x0,y0,x1,y1,col): ell(im,tuple(Q(min(X(x0),X(x1)),y0,max(X(x0),X(x1)),y1)),col)
        lx=lun
        for i,x in enumerate((bx0+2,bx0+5,bx1-5,bx1-2)):
            st=step*(1 if i%2 else -1); R(x+st+lx,by1-2,x+st+lx+1,by1+leg,D if i in(0,2) else M)
            if o.get('hoof'): R(x+st+lx,by1+leg,x+st+lx+1,by1+leg,'outline')
        tl=o.get('tail','short')
        if tl=='long': d.line([tuple(Q(X(bx0+1+lx),by0+3)),tuple(Q(X(bx0-5+lx),by0-3-step))],fill=P(M),width=max(1,int(2*s))); E(bx0-7+lx,by0-6-step,bx0-4+lx,by0-2-step,M)
        elif tl=='curl': d.arc(tuple(Q(min(X(bx0-6+lx),X(bx0+lx)),by0-6,max(X(bx0-6+lx),X(bx0+lx)),by0+2)),0,360,fill=P(M),width=max(1,int(s)))
        else: E(bx0-2+lx,by0,bx0+2+lx,by0+4,M)
        E(bx0+lx,by0+bob,bx1+lx,by1,M); E(bx0+2+lx,(by0+by1)//2+1,bx1-2+lx,by1,Lc)
        if o.get('spots'):
            for k,(x,y) in enumerate(o['spots']): E(x+lx,y,x+2+lx,y+2,o.get('spotc','spot'))
        hx0=bx1-3+lx; hw=o.get('head_w',8); hh=o.get('head_h',7)
        E(hx0,hy+bob,hx0+hw,hy+hh+bob,M); E(hx0+hw-3,hy+hh-4+bob,hx0+hw+2,hy+hh+bob,o.get('snout',Lc))
        px(im,*Q(X(hx0+hw+1),hy+hh-3+bob),'black')
        ex=X(hx0+hw-4); rect(im,*Q(min(ex,X(hx0+hw-3)),hy+2+bob,max(ex,X(hx0+hw-3)),hy+3+bob),'black'); px(im,*Q(ex,hy+2+bob),'white')
        ear=o.get('ear','up')
        if ear=='up': d.polygon([tuple(Q(X(hx0+1),hy+2+bob)),tuple(Q(X(hx0+2),hy-3+bob)),tuple(Q(X(hx0+4),hy+1+bob))],fill=P(D))
        else: E(hx0-1,hy+2+bob,hx0+3,hy+5+bob,D)
        if o.get('horn')=='small': d.line([tuple(Q(X(hx0+3),hy+bob)),tuple(Q(X(hx0+1),hy-3+bob))],fill=P('stone_l'),width=max(1,int(s)))
        if o.get('horn')=='big': d.arc(tuple(Q(min(X(hx0-4),X(hx0+6)),hy-4+bob,max(X(hx0-4),X(hx0+6)),hy+4+bob)),180,300,fill=P('stone_l'),width=max(1,int(2*s)))
        if o.get('horn')=='antler':
            for a,b in((hx0+3,hy-1),(hx0+1,hy-4),(hx0+4,hy-5),(hx0,hy-6)): px(im,*Q(X(a),b+bob),'wood_d')
        if o.get('tusk'): px(im,*Q(X(hx0+hw),hy+hh-1+bob),'white'); px(im,*Q(X(hx0+hw),hy+hh-2+bob),'white')
        if o.get('beard'): R(hx0+hw-1,hy+hh+bob,hx0+hw,hy+hh+2+bob,Lc)
        if mode=='attack' and f==2: R(hx0+hw-1,hy+hh-1+bob,hx0+hw+2,hy+hh+bob,'berry_l')
    else:
        lx=0; ly=lun if dn=='down' else -lun
        w2=(bx1-bx0)//2-1; cx=16
        for x in(cx-w2+1,cx+w2-3):
            st=step if x<cx else -step; rect(im,*Q(x,by1-2+max(0,st),x+2,by1+leg),D)
        ell(im,tuple(Q(cx-w2,by0+1,cx+w2,by1)),M)
        if dn=='down':
            ell(im,tuple(Q(cx-w2+3,by0+4,cx+w2-3,by1)),Lc)
            hw=o.get('head_w',8); hh=o.get('head_h',7); hx=cx-hw//2-1; yy=hy+bob+ly+1
            if o.get('ear','up')=='up':
                d.polygon([tuple(Q(hx,yy+3)),tuple(Q(hx,yy-2)),tuple(Q(hx+3,yy+1))],fill=P(D)); d.polygon([tuple(Q(hx+hw+2,yy+3)),tuple(Q(hx+hw+2,yy-2)),tuple(Q(hx+hw-1,yy+1))],fill=P(D))
            else: ell(im,tuple(Q(hx-2,yy+2,hx+2,yy+5)),D); ell(im,tuple(Q(hx+hw,yy+2,hx+hw+4,yy+5)),D)
            if o.get('horn')=='big': d.arc(tuple(Q(hx-5,yy-3,hx+hw+7,yy+6)),190,350,fill=P('stone_l'),width=max(1,int(2*s)))
            if o.get('horn') in('small','antler'): px(im,*Q(hx+2,yy-2),'wood_d' if o['horn']=='antler' else 'stone_l'); px(im,*Q(hx+hw,yy-2),'wood_d' if o['horn']=='antler' else 'stone_l')
            ell(im,tuple(Q(hx,yy,hx+hw+2,yy+hh)),M); ell(im,tuple(Q(hx+2,yy+hh-4,hx+hw,yy+hh+1)),o.get('snout',Lc))
            rect(im,*Q(hx+2,yy+2,hx+2,yy+3),'black'); rect(im,*Q(hx+hw,yy+2,hx+hw,yy+3),'black'); px(im,*Q(hx+1+hw//2,yy+hh-2),'black')
            if o.get('tusk'): px(im,*Q(hx+2,yy+hh),'white'); px(im,*Q(hx+hw,yy+hh),'white')
            if o.get('spots'): [px(im,*Q(cx-3+k*3,by0+3),o.get('spotc','spot')) for k in range(3)]
            if mode=='attack' and f==2: rect(im,*Q(hx+3,yy+hh-1,hx+hw-1,yy+hh),'berry')
        else:
            tl=o.get('tail','short'); t=[0,1,0,-1][f]
            if tl=='long': d.line([tuple(Q(cx,by1-1)),tuple(Q(cx+t*2,by1+6))],fill=P(M),width=max(1,int(2*s)))
            else: ell(im,tuple(Q(cx-1+t,by1-2,cx+2+t,by1+1)),M)
            hw=o.get('head_w',8); hx=cx-hw//2-1; yy=hy+bob+ly
            ell(im,tuple(Q(hx,yy,hx+hw+2,yy+o.get('head_h',7))),M)
            if o.get('ear','up')=='up': d.polygon([tuple(Q(hx,yy+3)),tuple(Q(hx,yy-2)),tuple(Q(hx+3,yy+1))],fill=P(D)); d.polygon([tuple(Q(hx+hw+2,yy+3)),tuple(Q(hx+hw+2,yy-2)),tuple(Q(hx+hw-1,yy+1))],fill=P(D))
            if o.get('horn')=='big': d.arc(tuple(Q(hx-5,yy-3,hx+hw+7,yy+6)),190,350,fill=P('stone_l'),width=max(1,int(2*s)))
            if o.get('spots'): [px(im,*Q(cx-3+k*3,by0+4),o.get('spotc','spot')) for k in range(3)]
    im=outline(im); im=shadow(im,F//2,int((by1+leg)*s),int((bx1-bx0)*s/2),max(2,int(2*s)))
    if mode=='attack' and f==2:
        p_={'right':(F-4,4),'left':(2,4),'down':(3,3),'up':(F-5,3)}[dn]
        for a,b in((0,0),(1,1),(2,2),(0,2),(2,0)): px(im,p_[0]+a,p_[1]+b,'white')
    return im
def bird_frame(dn,f,mode,kind):
    im=new(); d=ImageDraw.Draw(im)
    body,bd={'ayam':('chick_w','chick_b'),'bebek':('chick_w','duck_g')}[kind]
    step=[0,1,0,-1][f] if mode=='walk' else 0; peck=(mode=='idle' and f==2)
    if dn in('left','right'):
        sg=1 if dn=='right' else -1; X=lambda x:16+sg*(x-16)
        for i,x in enumerate((14,18)): o_=step*(1 if i else -1); rect(im,min(X(x+o_),X(x+o_+1)),23,max(X(x+o_),X(x+o_+1)),27,'beak')
        ell(im,(min(X(9),X(23)),14,max(X(9),X(23)),25),body); ell(im,(min(X(11),X(19)),17,max(X(11),X(19)),23),bd)
        d.polygon([(X(9),17),(X(5),11 if kind=='ayam' else 16),(X(10),15)],fill=P(bd))
        hy=7+(4 if peck else 0); ell(im,(min(X(17),X(25)),hy,max(X(17),X(25)),hy+8),body if kind=='ayam' else bd)
        if kind=='ayam': rect(im,min(X(19),X(22)),hy-2,max(X(19),X(22)),hy,'comb'); px(im,X(23),hy+6,'comb'); px(im,X(23),hy+7,'comb')
        bx=X(25); rect(im,min(bx,X(27 if kind=='ayam' else 28)),hy+3,max(bx,X(27 if kind=='ayam' else 28)),hy+4,'beak')
        px(im,X(22),hy+2,'black')
    else:
        for i,x in enumerate((13,18)): rect(im,x,23+(step if i==0 else -step if step<0 else 0)*0,x+1,27,'beak')
        ell(im,(9,14,23,26),body)
        if dn=='down':
            ell(im,(12,7,20,15),body if kind=='ayam' else bd)
            if kind=='ayam': rect(im,15,5,17,7,'comb'); rect(im,15,15,16,16,'comb')
            rect(im,15,11,17,12 if kind=='ayam' else 13,'beak'); px(im,13,10,'black'); px(im,19,10,'black')
            ell(im,(8,16,11,23),bd); ell(im,(21,16,24,23),bd)
        else:
            d.polygon([(13,15),(16,9 if kind=='ayam' else 14),(19,15)],fill=P(bd)); ell(im,(12,5,20,13),body if kind=='ayam' else bd)
            if kind=='ayam': rect(im,15,3,17,5,'comb')
    return shadow(outline(im),16,27,6,2)
def snake_frame(dn,f,mode):
    im=new(); d=ImageDraw.Draw(im); ph=f*math.pi/2; lift=[0,2,5,2][f] if mode=='attack' else 0
    if dn in('left','right'):
        sg=1 if dn=='right' else -1
        pts=[(16+sg*(x-16),24+int(2.5*math.sin(x*0.5+ph*(1 if mode=='walk' else 0.3)))) for x in range(4,26)]
        for i,(x,y) in enumerate(pts): ell(im,(x-1,y-1,x+1,y+1),'snake' if i%3 else 'snake_d')
        hx,hy=16+sg*(27-16),23-lift; d.line([pts[-1],(hx,hy+2)],fill=P('snake'),width=3)
        ell(im,(hx-3,hy-2,hx+3,hy+2),'snake'); px(im,hx+sg*1,hy-1,'black'); 
        if mode!='idle' or f%2: px(im,hx+sg*4,hy+1,'berry'); px(im,hx+sg*5,hy,'berry')
    else:
        pts=[(16+int(3*math.sin(y*0.5+ph*(1 if mode=='walk' else 0.3))),y) for y in range(8,28)]
        if dn=='down': pts=pts[::-1]
        for i,(x,y) in enumerate(pts): ell(im,(x-1,y-1,x+1,y+1),'snake' if i%3 else 'snake_d')
        hx,hy=pts[-1]
        if dn=='down':
            hy=hy+0; hy2=min(28,hy+2); ell(im,(hx-3,hy-6-lift,hx+3,hy-1-lift),'snake') if False else None
        hx,hy=(pts[0] if dn=='down' else pts[-1])
        hy=hy-lift if dn=='down' else hy
        ell(im,(hx-3,hy-2,hx+3,hy+3),'snake')
        if dn=='down': px(im,hx-1,hy,'black'); px(im,hx+1,hy,'black'); px(im,hx,hy+4,'berry')
    im=outline(im); return shadow(im,16,27,9,2)
def animal_sheet(fn,F,modes):
    sh=new(F*4,F*4*len(modes))
    for k,mode in enumerate(modes):
        for r_,dn in enumerate(('down','left','right','up')):
            for f in range(4): sh.paste(fn(dn,f,mode),(f*F,(k*4+r_)*F))
    return sh
SPECS={
 'kambing':(32,('goat_d','goat','white'),dict(body=(9,14,22,22),leg=5,head_y=7,head_w=7,head_h=7,horn='small',beard=True,ear='down',snout='goat')),
 'sapi':(64,('cow_d','cow','white'),dict(body=(5,13,24,23),leg=5,head_y=8,head_w=7,head_h=7,horn='small',hoof=True,tail='long',spots=[(9,15),(15,17),(19,15)],spotc='white',snout='blossom')),
 'kerbau':(64,('buff_d','buff','buff_l'),dict(body=(5,13,24,23),leg=5,head_y=9,head_w=7,head_h=7,horn='big',hoof=True,tail='long',ear='down',snout='buff_l')),
 'rusa':(32,('deer_d','deer','sand_l'),dict(body=(8,14,22,21),leg=6,head_y=5,head_w=6,head_h=6,horn='antler',spots=[(11,15),(15,16),(18,15)],spotc='sand_l')),
 'babi_hutan':(32,('boar_d','boar','dirt'),dict(body=(7,14,24,24),leg=3,head_y=12,head_w=7,head_h=7,tusk=True,ear='up',snout='dirt_l')),
 'monyet':(32,('wood_d','monkey','monkey_l'),dict(body=(10,15,21,23),leg=4,head_y=7,head_w=7,head_h=7,tail='long',ear='down',snout='monkey_l')),
 'macan_tutul':(64,('leo_d','leo','leo_l'),dict(body=(5,14,24,22),leg=6,head_y=9,head_w=7,head_h=6,tail='long',spots=[(8,15),(12,17),(16,15),(20,17),(10,19),(18,19)],snout='leo_l')),
}
PRED=('babi_hutan','monyet','macan_tutul')
def monkey_frame(dn,f,mode):
    v=('monkey_l','monkey','monkey'); im=squash(villager_frame(v,dn,f if mode!='idle' else 0,mode!='idle'),[19,20,22,23,26])
    if mode=='idle' and f%2: im=breathe(im)
    t=new(); d=ImageDraw.Draw(t); w=[0,1,0,-1][f]
    if dn=='right': d.arc((2,14+w,12,26+w),90,300,fill=P('monkey'),width=2)
    elif dn=='left': d.arc((20,14+w,30,26+w),240,90,fill=P('monkey'),width=2)
    elif dn=='up': d.arc((12,18,22,30),180,360,fill=P('monkey'),width=2)
    t=outline(t); t.alpha_composite(im); im=t
    if dn!='up': ell(im,(6,12,9,15),'monkey_l') ; ell(im,(22,12,25,15),'monkey_l')
    if mode=='attack' and f==2:
        p_={'right':(27,8),'left':(2,8),'down':(4,5),'up':(25,5)}[dn]
        for a,b in((0,0),(1,1),(2,2),(0,2),(2,0)): px(im,p_[0]+a,p_[1]+b,'white')
        rect(im,24 if dn!='left' else 4,4,27 if dn!='left' else 7,7,'banana')
    return im
def fauna():
    for n,(F,c,o) in SPECS.items():
        if n=='monyet':
            save(animal_sheet(monkey_frame,32,('idle','walk','attack')),'characters/fauna/monyet.png',(32,32),48,'32x32; baris 0-3 diam, 4-7 jalan, 8-11 serang/mencuri (frame 2 = sambar pisang); arah bawah,kiri,kanan,atas'); continue
        modes=('idle','walk','attack') if n in PRED else ('idle','walk')
        sh=animal_sheet(lambda dn,f,m,F=F,c=c,o=o: quad_frame(F,dn,f,m,c,o),F,modes)
        rows='0-3 diam, 4-7 jalan'+(', 8-11 serang (frame 2 = kena)' if len(modes)==3 else '')
        save(sh,f'characters/fauna/{n}.png',(F,F),16*len(modes),f'{F}x{F}/frame, 4 kolom; baris {rows}; arah bawah,kiri,kanan,atas; anchor tengah-bawah')
    for kind in('ayam','bebek'):
        save(animal_sheet(lambda dn,f,m,k=kind: bird_frame(dn,f,m,k),32,('idle','walk')),f'characters/fauna/{kind}.png',(32,32),32,'32x32; baris 0-3 diam (frame 2 = mematuk), 4-7 jalan; arah bawah,kiri,kanan,atas')
    save(animal_sheet(snake_frame,32,('idle','walk','attack')),'characters/fauna/ular.png',(32,32),48,'32x32; baris 0-3 diam (lidah), 4-7 merayap, 8-11 serang (kepala terangkat); arah bawah,kiri,kanan,atas')
    ambient()
def ambient():
    sh=new(64,16)
    for f in range(4):
        im=new(16,16); d=ImageDraw.Draw(im); wy=[-3,0,3,0][f]
        ell(im,(5,6,10,10),'sparrow'); px(im,10,7,'beak'); d.line([(7,8),(2,8+wy)],fill=P('wood_d'),width=2); d.line([(8,8),(13,8+wy)],fill=P('wood_d'),width=2); px(im,9,7,'black')
        sh.paste(outline(im),(f*16,0))
    save(sh,'characters/fauna/ambient/burung_pipit_terbang.png',(16,16),4,'burung pipit terbang (menghadap kanan; flip untuk kiri), 4 frame ~90ms')
    sh=new(128,32)
    for f in range(4):
        im=new(); d=ImageDraw.Draw(im)
        if f<2:  # berdiri / mematuk
            rect(im,15,20,15,28,'beak'); rect(im,18,20,18,28,'beak'); ell(im,(10,12,22,21),'heron'); d.line([(19,14),(21,6+f*5)],fill=P('heron'),width=2); ell(im,(19,4+f*5,24,8+f*5),'heron'); d.line([(24,6+f*5),(29,7+f*5)],fill=P('beak'),width=1); px(im,22,5+f*5,'black'); d.polygon([(10,15),(6,19),(12,19)],fill=P('stone_l'))
        else:
            wy=[-6,4][f-2]; ell(im,(9,13,23,18),'heron'); d.polygon([(13,15),(4,15+wy),(18,15)],fill=P('heron')); d.polygon([(15,15),(26,15+wy),(20,15)],fill=P('stone_l')); ell(im,(22,11,26,15),'heron'); d.line([(26,13),(30,14)],fill=P('beak')); d.line([(9,16),(3,17)],fill=P('beak'))
        sh.paste(outline(im) if f>=2 else shadow(outline(im),16,28,5,1),(f*32,0))
    save(sh,'characters/fauna/ambient/bangau.png',(32,32),4,'bangau (menghadap kanan): 0 berdiri, 1 mematuk (di sawah), 2-3 terbang kepak ~150ms')
    sh=new(64,16)
    for f in range(4):
        im=new(16,16); w=[3,2,1,2][f]
        for sx in(-1,1):
            ell(im,(8+sx*1-(w if sx<0 else 0)*2 if sx<0 else 9,4,8+ (0 if sx<0 else w*2+1) if sx>0 else 7,9),'butter') if False else None
        ell(im,(7-w*2,4,7,9),'butter'); ell(im,(9,4,9+w*2,9),'butter'); ell(im,(7-w,8,7,11),'fire_l'); ell(im,(9,8,9+w,11),'fire_l'); rect(im,8,4,8,11,'outline')
        sh.paste(im,(f*16,0))
    s2=sh.copy(); s2=recolor(s2,{'butter':'butter2','fire_l':'water_l'})
    both=new(64,32); both.paste(sh,(0,0)); both.paste(s2,(0,16))
    save(both,'characters/fauna/ambient/kupu_kupu.png',(16,16),8,'2 baris warna (oranye, biru) x 4 frame kepak ~100ms')
    sh=new(192,32)
    for f in range(6):
        im=new(); d=ImageDraw.Draw(im)
        if f in(0,5):
            for k in range(3): px(im,12+k*3,26-(f==5),'foam'); px(im,13+k*3,27,'water_l')
        else:
            t=(f-1)/3; x=8+16*t; y=26-int(18*math.sin(t*math.pi)); a=-30+60*t
            ell(im,(x-4,y-2,x+4,y+2),'stone_l'); ell(im,(x-3,y-2,x+2,y),'white'); px(im,int(x)+3,y-1,'black')
            d.polygon([(x-4,y),(x-7,y-3),(x-7,y+3)],fill=P('stone')); 
            if f in(1,4): [px(im,xx,27,'foam') for xx in(6,9,22,25)] if f==1 else [px(im,xx,27,'foam') for xx in(20,23,26)]
        sh.paste(outline(im) if f not in(0,5) else im,(f*32,0))
    save(sh,'characters/fauna/ambient/ikan_lompat.png',(32,32),6,'ikan melompat di sungai (tile air): 0 riak, 1-4 lompat (kiri→kanan), 5 cipratan; ~90ms; tempel di tile air')
    sh=new(32,8)
    for f in range(4):
        im=new(8,8); a=[255,180,90,180][f]; px(im,3,3,PALETTE['firefly']+(a,)); 
        if f in(0,1,3): [px(im,3+dx,3+dy,PALETTE['firefly']+(a//3,)) for dx,dy in((1,0),(-1,0),(0,1),(0,-1))]
        sh.paste(im,(f*8,0))
    save(sh,'characters/fauna/ambient/kunang_kunang.png',(8,8),4,'kunang-kunang malam: kedip 4 frame ~200ms; gambar setelah night_overlay (additive) + light_glow_small skala 0.25 opsional')
# ---------- MUSIM TROPIS ----------
PALETTE.update({
 'hj_grass_d':(40,112,58),'hj_grass':(64,150,66),'hj_grass_l':(108,184,76),'hj_leaf_d':(30,96,56),'hj_leaf':(50,134,66),'hj_leaf_l':(96,176,78),
 'mr_grass_d':(120,150,58),'mr_grass':(164,184,72),'mr_grass_l':(206,206,96),
 'km_grass_d':(150,120,64),'km_grass':(192,160,84),'km_grass_l':(222,196,120),'km_leaf_d':(96,110,52),'km_leaf':(136,140,62),'km_leaf_l':(184,170,86),'km_dirt':(186,130,80),
 'lb_grass_d':(96,164,74),'lb_grass':(140,206,92),'lb_grass_l':(196,232,124),'lb_leaf_d':(70,140,70),'lb_leaf':(110,180,80),'lb_leaf_l':(170,214,100),
 'dust':(214,180,130),'bolt':(255,252,200)})
TROP_MAP={
 'hujan':{'grass_d':'hj_grass_d','grass':'hj_grass','grass_l':'hj_grass_l','leaf_d':'hj_leaf_d','leaf':'hj_leaf','leaf_l':'hj_leaf_l','tr_leaf_d':'hj_leaf_d','tr_leaf':'hj_leaf','tr_leaf_l':'hj_leaf_l'},
 'mareng':{'grass_d':'mr_grass_d','grass':'mr_grass','grass_l':'mr_grass_l'},
 'kemarau':{'grass_d':'km_grass_d','grass':'km_grass','grass_l':'km_grass_l','leaf_d':'km_leaf_d','leaf':'km_leaf','leaf_l':'km_leaf_l','tr_leaf_d':'km_leaf_d','tr_leaf':'km_leaf','tr_leaf_l':'km_leaf_l','dirt':'km_dirt'},
 'labuh':{'grass_d':'lb_grass_d','grass':'lb_grass','grass_l':'lb_grass_l','leaf_d':'lb_leaf_d','leaf':'lb_leaf','leaf_l':'lb_leaf_l','tr_leaf_d':'lb_leaf_d','tr_leaf':'lb_leaf','tr_leaf_l':'lb_leaf_l'},
}
def tropical_seasons():
    srcs=['tiles/grass.png','tiles/grass_flowers.png','tiles/dirt.png','tiles/edge_grass_dirt.png','tiles/edge_grass_sand.png','tiles/autotile_water_grass.png','tiles/autotile_path_grass.png',
          'nature/tree.png','nature/berry_bush_full.png','nature/berry_bush_empty.png','nature/tropis/tree_mangga.png','nature/tropis/tree_rambutan.png','nature/tropis/tree_jati.png',
          'nature/tropis/bush_tropis.png','nature/tropis/tree_beringin.png','nature/tropis/tree_pisang.png','nature/tropis/bambu.png']
    for s,mp in TROP_MAP.items():
        for src in srcs:
            im=recolor(R_(src),mp); base=os.path.basename(src)[:-4]
            if s=='hujan' and base=='grass':
                r=random.Random(31)
                for _ in range(2):
                    x,y=r.randrange(4,24),r.randrange(4,26); ell(im,(x,y,x+7,y+3),'paddy_d'); ell(im,(x+1,y,x+5,y+2),'paddy_wl')
            if s=='kemarau' and base in('grass','dirt'):
                d=ImageDraw.Draw(im)
                for (a,b,c_,e) in((3,6,10,10),(10,10,13,17),(20,3,27,8),(18,22,25,26)): d.line([(a,b),(c_,e)],fill=P('dirt_d' if base=='dirt' else 'km_grass_d'))
            if s=='labuh' and base=='grass_flowers': sprinkle(im,41,6,['white','hibiscus_l'])
            f=[o for o in OUT if o['file']==src][0]
            save(im,f'seasons/tropis/{s}/{base}_{s}.png',f['frame'],f['frames'],f'musim {s}; format/indeks identik dengan {src}')
    # efek
    def heavy(im,f,S):
        r=random.Random(7)
        for _ in range(34):
            x,y=r.randrange(S),r.randrange(S); y=(y+f*16)%S; x=(x-f*6)%S
            for k in range(7): px(im,(x-k//2)%S,(y+k)%S,(170,214,240,210) if k<6 else (236,248,250,230))
        for _ in range(4): x,y=r.randrange(S),r.randrange(S); px(im,(x+f*5)%S,y,(236,248,250,200)); px(im,(x+f*5+2)%S,y,(236,248,250,200))
    loop_overlay('rain_heavy_overlay',heavy,note='hujan deras, 64x64 seamless, 4 frame ~60ms; pakai bersama rain_tint')
    save(Image.new('RGBA',(32,32),(250,250,236,170)),'effects/weather/lightning_flash.png',note='kilat: overlay putih, tampilkan 2 frame (60ms) lalu fade 200ms')
    sh=new(96,96)
    for f in range(3):
        im=new(32,96); d=ImageDraw.Draw(im); r=random.Random(f+3); x=16; pts=[(x,0)]
        for y in range(8,92,8): x=max(4,min(28,x+r.randrange(-6,7))); pts.append((x,y))
        if f<2:
            d.line(pts,fill=P('bolt'),width=3 if f==0 else 2); d.line(pts,fill=P('white'),width=1)
            bx,by=pts[5]; d.line([(bx,by),(bx+8,by+14)],fill=P('bolt'),width=1)
        else: d.line(pts,fill=(255,252,200,110),width=1)
        sh.paste(im,(f*32,0))
    save(sh,'effects/weather/lightning_bolt.png',(32,96),3,'sambaran petir 32x96: 0 terang, 1 cabang, 2 memudar (~60ms/frame); ujung bawah = titik sambar')
    def dust(im,f,S):
        r=random.Random(11)
        for i in range(10):
            x,y=r.randrange(S),r.randrange(S); x=(x+f*16)%S; y=(y+[0,1,0,-1][(f+i)%4])%S
            px(im,x,y,PALETTE['dust']+(150,)); px(im,(x+1)%S,y,PALETTE['dust']+(100,))
        for y in range(0,S,16):
            for x in range(S): 
                if (x+f*16+y)%24<6: px(im,x,(y+int(2*math.sin(x/5)))%S,PALETTE['dust']+(40,))
    loop_overlay('dust_overlay',dust,note='debu kemarau tertiup angin (ke kanan), 64x64 seamless 4 frame ~120ms')
    save(Image.new('RGBA',(32,32),(214,170,110,45)),'effects/weather/kemarau_tint.png',note='tint kemarau panas berdebu')
    sh=new(32,8)
    for f in range(4):
        im=new(8,8); r_=1+f//2; ell(im,(4-r_,4-r_,4+r_,4+r_),PALETTE['dust']+(180-f*40,)); sh.paste(im,(f*8,0))
    save(sh,'effects/weather/particle_dust.png',(8,8),4,'kepulan debu (langkah/angin): membesar & memudar')
    cl=new(128,128); d=ImageDraw.Draw(cl)
    for x,y,rx,ry in((30,30,26,14),(52,24,20,12),(96,90,28,14),(76,98,18,10),(10,100,14,8),(118,30,14,8)):
        for ox in(-128,0,128):
            for oy in(-128,0,128): d.ellipse([x-rx+ox,y-ry+oy,x+rx+ox,y+ry+oy],fill=(30,40,60,40))
    save(cl,'effects/weather/cloud_shadow_overlay.png',note='bayangan awan labuh, 128x128 seamless; geser pelan (scroll ~4px/detik)')
# ---------- BANGUNAN LOKAL ----------
def bamboo_wall(im,x0,y0,x1,y1,woven=True):
    rect(im,x0,y0,x1,y1,'bamboo_l')
    if woven:
        for y in range(y0,y1+1):
            for x in range(x0,x1+1):
                if ((x//3)+(y//3))%2==0: px(im,x,y,'straw')
    rect(im,x0,y0,x0+1,y1,'bamboo_d'); rect(im,x1-1,y0,x1,y1,'bamboo_d')
def stilts(im,xs,y0,y1):
    for x in xs: rect(im,x,y0,x+2,y1,'wood_d'); rect(im,x,y1-1,x+2,y1,'stone_d')
def tile_roof(im,x0,x1,ytop,ybot):
    d=ImageDraw.Draw(im); mid=(x0+x1)//2
    d.polygon([(x0,ybot),(mid-6,ytop),(mid+6,ytop),(x1,ybot)],fill=P('tile_roof'))
    for y in range(ytop+3,ybot,3):
        w=(y-ytop)/(ybot-ytop); d.line([(mid-6-w*(mid-6-x0),y),(mid+6+w*(x1-mid-6),y)],fill=P('tile_roof_d'))
    rect(im,mid-6,ytop,mid+6,ytop+1,'tile_roof_l'); d.line([(mid-6,ytop),(x0,ybot)],fill=P('tile_roof_l'))
def ijuk_roof(im,x0,x1,ytop,ybot):
    d=ImageDraw.Draw(im); mid=(x0+x1)//2; d.polygon([(x0,ybot),(mid,ytop),(x1,ybot)],fill=P('ijuk'))
    r=random.Random(x1)
    for _ in range((x1-x0)*3):
        x=r.randrange(x0,x1); y=r.randrange(ytop,ybot)
        if im.getpixel((x,y))[:3]==PALETTE['ijuk']: d.line([(x,y),(x,y+2)],fill=P('ijuk_l'))
    d.line([(x0,ybot),(x1,ybot)],fill=P('ijuk_l'))
def rumah_panggung(lit=None):
    im=new(96,96)
    stilts(im,(14,30,46,62,78),62,90); rect(im,10,60,86,63,'wood')
    bamboo_wall(im,12,36,84,60,False)
    for x in range(12,85,4): rect(im,x,36,x,60,'wood' if x%8 else 'wood_l')
    tile_roof(im,2,94,6,40); rect(im,2,38,94,41,'tile_roof_d')
    for x in(20,64):
        win_c='fire_l' if lit=='on' else 'window_dark' if lit=='off' else 'water_l'
        rect(im,x,44,x+11,54,'wood_d'); rect(im,x+1,45,x+10,53,win_c); rect(im,x+6,45,x+6,53,'wood_d')
    rect(im,42,42,53,60,'wood_d'); rect(im,43,43,52,60,'fire' if lit=='on' else 'wood')
    d=ImageDraw.Draw(im); d.line([(44,64),(40,92)],fill=P('wood'),width=2); d.line([(52,64),(56,92)],fill=P('wood'),width=2)
    for y in range(68,92,5): d.line([(43-(y-64)*0.13,y),(53+(y-64)*0.13,y)],fill=P('wood_l'))
    return shadow(outline(im),48,91,42,4)
def gubuk_bambu(lit=None):
    im=new(64,64); bamboo_wall(im,10,32,53,57); ijuk_roof(im,2,61,4,36)
    c='fire' if lit=='on' else 'outline' if lit=='off' else 'wood_d'
    rect(im,26,40,36,57,'wood_d'); rect(im,27,41,35,57,c)
    if lit=='on': rect(im,29,46,33,57,'fire_l')
    for x in(14,46): rect(im,x,40,x+5,47,'wood_d'); rect(im,x+1,41,x+4,46,'fire_l' if lit=='on' else 'bamboo_d')
    return shadow(outline(im),32,58,27,4)
def lumbung_padi():
    im=new(64,96); stilts(im,(18,28,36,44),66,90)
    for x in(16,26,34,42): ell(im,(x,64,x+6,68),'wood_l')
    bamboo_wall(im,14,44,49,64); ijuk_roof(im,4,59,8,50)
    rect(im,28,50,35,60,'wood_d'); d=ImageDraw.Draw(im)
    for y in(78,86): d.line([(10,y),(16,y-6)],fill=P('bamboo'),width=1)
    for x,y in((8,86),(50,86)): ell(im,(x,y,x+8,y+5),'rice_y'); px(im,x+3,y+1,'straw_l')
    return shadow(outline(im),32,91,24,4)
def kandang():
    im=new(96,64)
    rect(im,56,14,92,48,'wood_d'); ijuk_roof(im,52,95,2,22); rect(im,60,22,88,48,'wood'); rect(im,60,40,88,48,'straw')
    for x in range(4,93,8): rect(im,x,30,x+2,54,'bamboo'); rect(im,x,30,x+2,30,'bamboo_l')
    for y in(34,44): rect(im,2,y,93,y+1,'bamboo_d')
    for x,y in((14,48),(30,50),(44,47)): ell(im,(x,y,x+5,y+2),'straw_l')
    rect(im,20,40,34,44,'wood_l'); rect(im,21,41,33,43,'water')
    return shadow(outline(im),48,56,44,4)
def pagar_bambu_tile(mask):
    im=new()
    def rail(x0,y0,x1,y1): rect(im,x0,y0,x1,y1,'bamboo'); rect(im,x0,y0,x1,y0,'bamboo_l')
    if mask&2:
        rail(16,13,31,14); rail(16,20,31,21); [rect(im,x,10,x+1,24,'bamboo_d') for x in(22,28)]
    if mask&8:
        rail(0,13,15,14); rail(0,20,15,21); [rect(im,x,10,x+1,24,'bamboo_d') for x in(3,9)]
    if mask&1: rect(im,14,0,17,13,'bamboo'); [rect(im,14,y,17,y,'bamboo_d') for y in(3,9)]
    if mask&4: rect(im,14,18,17,31,'bamboo'); [rect(im,14,y,17,y,'bamboo_d') for y in(22,28)]
    rect(im,13,6,18,25,'bamboo'); rect(im,13,6,18,7,'bamboo_l'); rect(im,13,15,18,15,'bamboo_d'); rect(im,13,5,18,5,'palm_d')
    return shadow(outline(im),16,26,4,1)
def kentongan_frame(f,lit=False,post=True):
    im=new(32,64)
    if post: rect(im,8,10,10,60,'wood_d'); rect(im,8,10,24,12,'wood_d'); rect(im,6,58,12,60,'stone')
    sw=[0,-2,1][f]
    rect(im,18+sw,12,18+sw,16,'straw_d'); ell(im,(14+sw,16,22+sw,34),'wood'); rect(im,17+sw,20,19+sw,30,'outline'); ell(im,(15+sw,17,19+sw,22),'wood_l')
    if f==1:
        d=ImageDraw.Draw(im); d.line([(28,22),(23,25)],fill=P('wood_l'),width=2)
        for a,b in((26,16),(28,19),(29,25)): px(im,a,b,'white')
    return im
def tanggul_tile(mask):
    im=new(); rect(im,0,0,31,31,(0,0,0,0))
    ell(im,(2,4,29,28),'dirt') if mask==0 else None
    def fill(x0,y0,x1,y1): rect(im,x0,y0,x1,y1,'dirt'); rect(im,x0,y0,x1,y0+1,'grass')
    fill(6,8,25,25)
    if mask&1: fill(6,0,25,8)
    if mask&4: fill(6,25,25,31)
    if mask&8: fill(0,8,6,25)
    if mask&2: fill(25,8,31,25)
    r=random.Random(mask)
    for _ in range(14):
        x,y=r.randrange(32),r.randrange(32)
        if im.getpixel((x,y))[:3]==PALETTE['dirt']: rect(im,x,y,x+3,y+1,'straw' if r.random()<.5 else 'dirt_l'); px(im,x,y+2,'dirt_d')
    return shadow(outline(im),16,28,10,2)
def embung():
    im=new(96,64); d=ImageDraw.Draw(im)
    ell(im,(2,6,93,60),'stone_d'); ell(im,(4,6,91,56),'stone'); ell(im,(10,10,85,52),'water_d'); ell(im,(12,12,83,48),'water')
    for x,y in((30,24),(60,34),(44,40)): rect(im,x,y,x+6,y,'water_l')
    r=random.Random(9)
    for _ in range(30):
        a=r.random()*math.tau; x=48+44*math.cos(a); y=33+26*math.sin(a); px(im,int(x),int(y),'stone_l')
    rect(im,78,22,94,26,'wood'); rect(im,78,22,94,22,'wood_l')
    return outline(im)
def scarecrow(f):
    im=new(32,64); d=ImageDraw.Draw(im); sw=[0,1][f]
    rect(im,15,22,16,60,'wood_d'); rect(im,6+sw,24,25+sw,25,'wood')
    d.polygon([(10+sw,24),(22+sw,24),(21+sw,40),(11+sw,40)],fill=P('cloth2')); rect(im,11+sw,32,21+sw,33,'straw_d')
    for x in(5,26): px(im,x+sw,26,'straw_l'); px(im,x+sw,27,'straw')
    ell(im,(11+sw,10,21+sw,22),'straw_l'); rect(im,13+sw,15,14+sw,16,'outline'); rect(im,18+sw,15,19+sw,16,'outline'); d.line([(14+sw,19),(18+sw,19)],fill=P('outline'))
    d.polygon([(8+sw,12),(16+sw,3),(24+sw,12)],fill=P('straw')); rect(im,8+sw,11,24+sw,12,'straw_d')
    rect(im,24+sw,26,28+sw,27,'cloth4')
    return shadow(outline(im),16,60,5,1)
def obor_bambu(f):
    im=new(32,64); rect(im,14,20,17,60,'bamboo'); [rect(im,14,y,17,y,'bamboo_d') for y in(28,38,48)]; rect(im,13,17,18,21,'bamboo_d'); rect(im,13,58,18,60,'dirt_d')
    if f<4:
        hh=[0,2,1,3][f]; dd=ImageDraw.Draw(im)
        dd.polygon([(12,17),(15+(f%2),5-hh),(19,17)],fill=P('fire')); dd.polygon([(14,17),(16-(f%2),9-hh),(17,17)],fill=P('fire_l')); px(im,15,14,'fire_w')
    else: rect(im,14,15,17,17,'char'); px(im,15,12,(150,140,150,150)); px(im,16,9,(150,140,150,110))
    return shadow(outline(im),16,60,4,1)
def local_buildings():
    for lit,suf in((None,''),('on','_night'),('off','_night_off')):
        p_='buildings/tropis/' if not lit else 'buildings/tropis/night/'
        save(rumah_panggung(lit),f'{p_}rumah_panggung{suf}.png',note='96x96 (3x3), anchor tengah-bawah'+('; jendela menyala' if lit=='on' else '; lampu mati' if lit=='off' else ''))
        save(gubuk_bambu(lit),f'{p_}gubuk_bambu{suf}.png',note='64x64 (2x2), atap ijuk'+('; menyala' if lit=='on' else '; lampu mati' if lit=='off' else ''))
    save(lumbung_padi(),'buildings/tropis/lumbung_padi.png',note='64x96 (2x3), lumbung panggung atap ijuk')
    save(kandang(),'buildings/tropis/kandang.png',note='96x64 (3x2), kandang ternak berpagar bambu + naungan')
    sh=new(128,128)
    for m in range(16): sh.paste(pagar_bambu_tile(m),((m%4)*32,(m//4)*32))
    save(sh,'structures/tropis/pagar_bambu_autotile.png',(32,32),16,'16-tile 4-bit sama dengan fence_autotile: indeks = N1+E2+S4+W8; indeks 0 = pagar 1-tile')
    sh=new(96,64)
    for f in range(3): sh.paste(shadow(outline(kentongan_frame(f)),10,60,4,1),(f*32,0))
    save(sh,'structures/tropis/kentongan.png',(32,64),3,'tiang kentongan: 0 diam, 1 dipukul, 2 ayun balik (~100ms; ulang 3x = tanda bahaya)')
    for lit,suf in((False,''),(True,'_night')):
        sh=new(192,64)
        for f in range(3):
            im=new(64,64); stilts(im,(8,52),36,58); rect(im,6,34,57,37,'wood'); rect(im,6,34,57,34,'wood_l')
            bamboo_wall(im,8,37,55,44); ijuk_roof(im,0,63,4,26); rect(im,8,24,9,34,'wood_d'); rect(im,54,24,55,34,'wood_d')
            if lit: ell(im,(22,26,28,32),'fire_l'); px(im,25,28,'fire_w')
            else: ell(im,(22,26,28,32),'stone_d')
            k=kentongan_frame(f,post=False).crop((12,10,26,36)); im.alpha_composite(k,(40,20))
            sh.paste(shadow(outline(im),32,59,28,3),(f*64,0))
        save(sh,f'buildings/tropis/{"night/" if lit else ""}pos_ronda{suf}.png',(64,64),3,'pos ronda (gardu) + kentongan: frame = animasi kentongan seperti kentongan.png; frame 0 = diam'+('; pelita menyala' if lit else ''))
    sh=new(128,128)
    for m in range(16): sh.paste(tanggul_tile(m),((m%4)*32,(m//4)*32))
    save(sh,'structures/tropis/tanggul_autotile.png',(32,32),16,'tanggul tanah + karung; 16-tile 4-bit (N1+E2+S4+W8); taruh di tepi sungai untuk menahan banjir')
    save(embung(),'buildings/tropis/embung.png',note='96x64 (3x2) embung/kolam tampung air berbatu')
    sh=new(64,64); [sh.paste(scarecrow(f),(f*32,0)) for f in range(2)]
    save(sh,'structures/tropis/orang_orangan_sawah.png',(32,64),2,'orang-orangan sawah, 2 frame goyang ~500ms')
    sh=new(160,64); [sh.paste(obor_bambu(f),(f*32,0)) for f in range(5)]
    save(sh,'structures/tropis/obor_bambu.png',(32,64),5,'obor bambu: 0-3 nyala (~120ms), 4 mati; glow: light_glow_small')
# =====================================================================
# TAHAP 8: sifat, hubungan, emosi, monumen, 17 Agustus, panel dilema
# =====================================================================
PALETTE.update({'merah':(214,40,48),'merah_d':(160,28,40),'putih':(248,246,240),'pos_c':(110,180,90),'neg_c':(150,120,150),'neu_c':(220,180,90),
 'sirap':(120,78,52),'sirap_l':(160,108,70),'wall_w':(240,232,214),'wall_d':(206,194,170),'mustaka':(232,190,70),'batik':(120,64,40),'batik_l':(200,150,90)})
_PAL16B=[v for v in PALETTE.values() if len(v)==3]  # snapshot palet tahap 8 (ikon _16 tahap 8 stabil)
def to16b(im32):
    s=im32.resize((16,16),Image.BOX); p=s.load(); cols=_PAL16B
    for y in range(16):
        for x in range(16):
            c=p[x,y]; p[x,y]=(0,0,0,0) if c[3]<110 else min(cols,key=lambda q:sum((a-b)**2 for a,b in zip(q,c[:3])))+(255,)
    return s
def badge(fn,col):
    im=new(); rect(im,2,2,29,29,col); rect(im,3,3,28,28,'parch'); [im.putpixel(p_,(0,0,0,0)) for p_ in((2,2),(29,2),(2,29),(29,29))]
    ins=new(); fn(ins,ImageDraw.Draw(ins)); ins=outline(ins).resize((24,24),Image.NEAREST) if False else outline(ins)
    sm=ins.resize((22,22),Image.NEAREST); im.alpha_composite(sm,(5,5)); return outline(im)
# simbol sifat (digambar 32x32)
def Y_rajin(im,d): S_build(im,d); [px(im,x,y,'water_l') for x,y in((6,6),(6,7),(5,8))]
def Y_malas(im,d): I_sleep(im,d)
def Y_berani(im,d):
    d.polygon([(16,3),(27,7),(25,20),(16,29),(7,20),(5,7)],fill=P('roof')); d.polygon([(16,6),(24,9),(22,19),(16,25)],fill=P('roof_l'))
    d.polygon([(16,9),(18,14),(23,14),(19,17),(20,22),(16,19),(12,22),(13,17),(9,14),(14,14)],fill=P('gold'))
def Y_takut(im,d):
    ell(im,(4,4,27,27),'water_l'); rect(im,10,10,12,14,'black'); rect(im,19,10,21,14,'black'); px(im,10,10,'white'); px(im,19,10,'white')
    for x in range(10,22,2): px(im,x,21,'black'); px(im,x+1,20,'black')
    rect(im,24,6,25,10,'water'); px(im,24,11,'water')
def Y_ramah(im,d):
    I_mood(im,d); ell(im,(22,2,30,10),'skin1'); [rect(im,x,0,x,4,'skin1') for x in(23,25,27)]
def Y_marah(im,d):
    ell(im,(4,4,27,27),'roof_l'); d.line([(8,9),(13,12)],fill=P('black'),width=2); d.line([(23,9),(18,12)],fill=P('black'),width=2)
    rect(im,10,13,12,15,'black'); rect(im,19,13,21,15,'black'); d.arc((10,19,21,27),200,340,fill=P('black'),width=2)
    for x,y in((25,3),(28,6)): d.line([(x,y),(x+3,y-3)],fill=P('stone_l'),width=2)
def Y_cerdas(im,d):
    ell(im,(8,3,24,19),'fire_l'); ell(im,(10,5,17,11),'fire_w'); rect(im,12,18,19,24,'stone'); rect(im,12,20,19,20,'stone_d'); rect(im,13,25,18,27,'stone_d')
    for a,b,c_,e in((4,8,1,6),(27,8,30,6),(4,14,1,15),(27,14,30,15)): d.line([(a,b),(c_,e)],fill=P('fire'))
def Y_religius(im,d):
    rect(im,6,16,25,28,'wall_w'); ell(im,(7,6,24,22),'leaf'); ell(im,(9,8,16,13),'leaf_l'); rect(im,15,1,16,6,'mustaka')
    ell(im,(13,1,18,4),'mustaka'); rect(im,13,20,18,28,'wood_d'); ImageDraw.Draw(im).pieslice([13,17,18,24],180,360,fill=P('wood_d'))
def Y_dermawan(im,d):
    rect(im,5,13,26,27,'roof'); rect(im,3,9,28,14,'roof_l'); rect(im,14,9,17,27,'gold'); d.arc((8,2,16,12),180,360,fill=P('gold'),width=2); d.arc((15,2,23,12),180,360,fill=P('gold'),width=2)
def Y_pelit(im,d):
    rect(im,5,12,26,27,'wood'); rect(im,5,12,26,14,'wood_l'); d.arc((5,4,26,22),180,360,fill=P('wood_d'),width=3); rect(im,13,17,18,23,'gold'); rect(im,15,19,16,21,'black')
def Y_jujur(im,d):
    ell(im,(4,4,27,27),'leaf'); d.line([(9,16),(14,21),(23,10)],fill=P('white'),width=3)
def Y_jahil(im,d):
    ell(im,(4,4,27,27),'fire_l'); rect(im,10,11,12,13,'black'); d.line([(18,12),(22,12)],fill=P('black'),width=2)
    d.arc((9,15,22,24),20,160,fill=P('black'),width=2); ell(im,(16,21,21,26),'berry_l')
def Y_sabar(im,d):
    for a in(-60,-30,0,30,60):
        r_=math.radians(a-90); cx,cy=16+7*math.cos(r_),20+7*math.sin(r_); ell(im,(cx-4,cy-6,cx+4,cy+5),'blossom')
    ell(im,(10,18,22,26),'blossom_l'); rect(im,5,25,26,27,'leaf')
def Y_periang(im,d):
    for a in range(0,360,45):
        r_=math.radians(a); d.line([(16+9*math.cos(r_),16+9*math.sin(r_)),(16+14*math.cos(r_),16+14*math.sin(r_))],fill=P('fire'),width=2)
    ell(im,(8,8,24,24),'fire_l'); ell(im,(10,10,17,16),'fire_w')
def Y_murung(im,d):
    ell(im,(4,6,18,18),'stone'); ell(im,(12,4,28,18),'stone'); ell(im,(6,10,26,20),'stone_l')
    for x in(9,15,21): d.line([(x,22),(x-2,28)],fill=P('water'),width=2)
def Y_gotong(im,d):
    ell(im,(2,14,16,24),'skin2'); ell(im,(16,14,30,24),'skin3'); rect(im,13,15,19,23,'skin2'); d.line([(14,15),(18,23)],fill=P('skin3'),width=2)
    rect(im,0,15,3,23,'cloth1'); rect(im,28,15,31,23,'cloth2'); ell(im,(12,4,20,12),'berry')
TRAITS=[('rajin',Y_rajin,'pos'),('malas',Y_malas,'neg'),('pemberani',Y_berani,'pos'),('penakut',Y_takut,'neg'),('ramah',Y_ramah,'pos'),('pemarah',Y_marah,'neg'),
        ('cerdas',Y_cerdas,'pos'),('religius',Y_religius,'pos'),('dermawan',Y_dermawan,'pos'),('pelit',Y_pelit,'neg'),('jujur',Y_jujur,'pos'),('jahil',Y_jahil,'neg'),
        ('sabar',Y_sabar,'pos'),('periang',Y_periang,'pos'),('pemurung',Y_murung,'neg'),('suka_menolong',Y_gotong,'pos')]
def traits_rel():
    for n,fn,kind in TRAITS:
        im=badge(fn,{'pos':'pos_c','neg':'neg_c'}[kind]); save(im,f'icons/traits/trait_{n}.png',note=f'sifat {n} ({"positif, bingkai hijau" if kind=="pos" else "negatif, bingkai ungu-abu"})')
        save(to16b(im),f'icons/traits/trait_{n}_16.png',note='16x16')
    def R_teman(im,d):
        ell(im,(2,8,14,20),'skin1'); ell(im,(18,8,30,20),'skin3'); ell(im,(2,6,14,13),'hair1'); ell(im,(18,6,30,13),'hair4')
        rect(im,4,20,12,30,'cloth1'); rect(im,20,20,28,30,'cloth2'); rect(im,11,22,21,24,'skin2'); px(im,6,15,'black'); px(im,10,15,'black'); px(im,22,15,'black'); px(im,26,15,'black')
    def R_rival(im,d):
        d.line([(5,27),(25,5)],fill=P('stone_l'),width=3); d.line([(27,27),(7,5)],fill=P('stone_l'),width=3)
        rect(im,3,24,9,26,'wood'); rect(im,23,24,29,26,'wood'); d.polygon([(16,10),(20,16),(14,17),(18,23)],fill=P('fire'))
    def R_pasangan(im,d):
        for ox,oy,c in((0,4,'berry'),(10,10,'berry_l')):
            ell(im,(2+ox,2+oy,11+ox,11+oy),c); ell(im,(10+ox,2+oy,19+ox,11+oy),c); d.polygon([(2+ox,8+oy),(19+ox,8+oy),(10.5+ox,18+oy)],fill=P(c))
        px(im,6,6,'white')
    for n,fn,c in(('teman',R_teman,'pos_c'),('rival',R_rival,'roof'),('pasangan',R_pasangan,'blossom')):
        im=badge(fn,c); save(im,f'icons/relations/rel_{n}.png',note='hubungan 32x32'); save(to16b(im),f'icons/relations/rel_{n}_16.png',note='16x16')
def emotes():
    def inner(kind):
        im=new(12,10); d=ImageDraw.Draw(im)
        if kind=='senang': rect(im,3,2,3,3,'black'); rect(im,8,2,8,3,'black'); d.arc((2,3,9,9),20,160,fill=P('black'))
        elif kind=='marah':
            for a,b,c_,e in((3,1,5,4),(8,1,6,4),(3,8,5,5),(8,8,6,5)): d.line([(a,b),(c_,e)],fill=P('merah'),width=1)
        elif kind=='sedih': ell(im,(4,1,8,8),'water'); px(im,6,0,'water'); px(im,5,3,'water_l')
        elif kind=='cinta': ell(im,(1,1,6,6),'berry'); ell(im,(5,1,10,6),'berry'); d.polygon([(1,4),(10,4),(5.5,9)],fill=P('berry')); px(im,3,2,'white')
        elif kind=='ide': ell(im,(3,0,9,6),'fire_l'); rect(im,5,6,7,8,'stone_d'); px(im,4,1,'fire_w')
        elif kind=='bingung': d.arc((3,0,9,6),200,90,fill=P('cloth_d'),width=2); rect(im,6,6,6,7,'cloth_d'); px(im,6,9,'cloth_d')
        return im
    for kind in('senang','marah','sedih','cinta','ide','bingung'):
        sh=new(64,16)
        for f,sc in enumerate((0.5,1.15,1.0,1.0)):
            b=new(16,16); d=ImageDraw.Draw(b); rect(b,1,1,14,11,'white'); d.polygon([(5,11),(8,11),(5,14)],fill=P('white'))
            b.alpha_composite(inner(kind),(2,1+(1 if f==3 else 0) if False else 2)); b=outline(b)
            if sc!=1.0:
                w=max(2,int(16*sc)); bb=b.resize((w,w),Image.NEAREST); b=new(16,16); b.alpha_composite(bb.crop((0,0,min(16,w),min(16,w))),(max(0,(16-w)//2),max(0,16-w)))
            if f==3: bb=new(16,16); bb.alpha_composite(b,(0,-1)); b=bb
            sh.paste(b,(f*16,0))
        save(sh,f'icons/emotes/emote_{kind}.png',(16,16),4,'gelembung emosi: 0 muncul kecil, 1 membesar, 2 normal, 3 bob (loop 2-3); ~80ms lalu tahan ~1.5s')
# ---------- MONUMEN BERTAHAP ----------
def stages_from_final(final,name,note):
    w,h=final.size; a=final.split()[3]; bb=a.getbbox(); x0,y0,x1,y1=bb; sh=new(w*4,h)
    top=[next((y for y in range(h) if a.getpixel((x,y))>200),None) for x in range(w)]
    def fond():
        im=new(w,h); rect(im,x0+2,y1-8,x1-2,y1-3,'stone_d'); rect(im,x0+2,y1-8,x1-2,y1-8,'stone_l')
        for x in range(x0+4,x1-3,6): rect(im,x,y1-9,x+3,y1-7,'stone')
        for x in(x0+1,x1-2): rect(im,x,y1-14,x,y1-3,'wood_l'); 
        ImageDraw.Draw(im).line([(x0+1,y1-13),(x1-2,y1-13)],fill=P('white'))
        return im
    def rangka(maxy=None):
        im=fond(); d=ImageDraw.Draw(im)
        for x in range(x0+3,x1-2,10):
            t=top[x] if top[x] is not None else y1
            d.line([(x,y1-8),(x,max(t+2,y0))],fill=P('wood'),width=2)
        pts=[(x,top[x]+1) for x in range(x0,x1) if top[x] is not None and x%2==0]
        for i in range(len(pts)-1): d.line([pts[i],pts[i+1]],fill=P('wood_l'))
        bm=new(w,h); db=ImageDraw.Draw(bm)
        for y in range(y1-20,y0,-12): db.line([(x0+3,y),(x1-3,y)],fill=P('wood_d'))
        im.paste(bm,(0,0),ImageChops.multiply(bm.split()[3],a.point(lambda v:255 if v>200 else 0)))
        return outline(im)
    def half():
        im=rangka(); cut=y0+int((y1-y0)*0.5); low=final.crop((0,cut,w,h)); im.alpha_composite(low,(0,cut))
        d=ImageDraw.Draw(im)
        for x in(x0+1,x1-3): d.line([(x,cut-6),(x,y1)],fill=P('bamboo'),width=2)
        d.line([(x0,cut-4),(x1-2,cut-4)],fill=P('bamboo'),width=2)
        return im
    for i,im in enumerate((shadow(fond(),w//2,y1-2,(x1-x0)//2,3),shadow(rangka(),w//2,y1-2,(x1-x0)//2,3),half(),final)): sh.paste(im,(i*w,0))
    save(sh,f'buildings/monuments/{name}_stages.png',(w,h),4,note+'; 4 tahap: 0 fondasi, 1 rangka, 2 setengah jadi, 3 selesai; anchor tengah-bawah')
    save(final,f'buildings/monuments/{name}.png',note=note+' (selesai)')
def tumpang(im,cx,ybase,widths,th,col=('sirap','sirap_l','wood_d')):
    d=ImageDraw.Draw(im); y=ybase
    for i,w in enumerate(widths):
        d.polygon([(cx-w,y),(cx-w*0.55,y-th),(cx+w*0.55,y-th),(cx+w,y)],fill=P(col[0]))
        for yy in range(int(y-th)+2,int(y),3): ww=w*0.55+(w-w*0.55)*(yy-(y-th))/th; d.line([(cx-ww,yy),(cx+ww,yy)],fill=P(col[2]))
        d.line([(cx-w,y),(cx+w,y)],fill=P(col[1])); d.line([(cx-w*0.55,y-th),(cx-w,y)],fill=P(col[1]))
        if i<len(widths)-1: rect(im,int(cx-widths[i+1]*0.7),int(y-th-4),int(cx+widths[i+1]*0.7),int(y-th),'wall_d')
        y=y-th-4
    return y+4
def masjid():
    im=new(128,128); rect(im,10,112,117,120,'stone_l'); rect(im,10,118,117,120,'stone_d')
    rect(im,18,80,109,112,'wall_w'); rect(im,18,80,109,82,'wall_d')
    for x in range(22,106,14): rect(im,x,86,x+2,112,'wood')
    for x in(36,52,74,90): rect(im,x,90,x+8,104,'wood_d'); ImageDraw.Draw(im).pieslice([x,86,x+8,96],180,360,fill=P('wood_d')); rect(im,x+1,92,x+7,104,'leaf_d')
    rect(im,58,92,69,112,'wood_d'); rect(im,59,94,68,112,'wood')
    yt=tumpang(im,64,82,[60,40,22],16); rect(im,62,yt-10,65,yt,'mustaka'); ell(im,(59,yt-14,68,yt-6),'mustaka'); px(im,63,yt-12,'fire_w')
    rect(im,112,40,118,112,'wall_w'); tumpang(im,115,44,[7],8,('roof','roof_l','roof_d')); rect(im,113,30,116,34,'mustaka')
    return shadow(outline(im),64,120,56,5)
def langgar():
    im=new(64,64); stilts(im,(10,22,40,52),44,58); rect(im,8,42,56,45,'wood')
    rect(im,12,30,51,42,'wall_w'); rect(im,26,32,37,42,'wood_d'); rect(im,15,33,21,38,'leaf_d'); rect(im,42,33,48,38,'leaf_d')
    yt=tumpang(im,32,32,[30,16],11); rect(im,31,yt-6,32,yt,'mustaka'); ell(im,(29,yt-9,34,yt-4),'mustaka')
    d=ImageDraw.Draw(im); d.line([(28,46),(24,60)],fill=P('wood'),width=2); d.line([(35,46),(39,60)],fill=P('wood'),width=2)
    return shadow(outline(im),32,59,26,3)
def balai_megah():
    im=new(128,128); rect(im,6,108,121,118,'stone'); rect(im,6,108,121,109,'stone_l'); rect(im,6,116,121,118,'stone_d')
    for x in range(14,116,16): rect(im,x,72,x+4,108,'wood'); rect(im,x,72,x+1,108,'wood_l')
    rect(im,40,80,88,108,'wood_l'); [rect(im,x,80,x,108,'wood') for x in range(42,88,4)]; rect(im,58,88,70,108,'wood_d')
    d=ImageDraw.Draw(im)
    d.polygon([(0,76),(24,50),(104,50),(127,76)],fill=P('tile_roof')); [d.line([(0+(y-50)*0,y),(127,y)],fill=P('tile_roof_d')) for y in range(54,76,4)] if False else None
    for y in range(52,76,3): ww=24-(y-50)*24/26; d.line([(ww,y),(127-ww,y)],fill=P('tile_roof_d'))
    d.polygon([(30,50),(46,18),(82,18),(98,50)],fill=P('tile_roof')); [d.line([(46-(y-18)*16/32,y),(82+(y-18)*16/32,y)],fill=P('tile_roof_d')) for y in range(21,50,3)]
    d.line([(46,18),(82,18)],fill=P('tile_roof_l'),width=2); d.line([(0,76),(127,76)],fill=P('tile_roof_l')); d.line([(24,50),(104,50)],fill=P('tile_roof_l'))
    for x in(46,82): d.line([(x,18),(x+(4 if x<64 else -4),10)],fill=P('mustaka'),width=2)
    for x in(20,100): rect(im,x,96,x+5,100,'merah'); rect(im,x,100,x+5,104,'putih')
    rect(im,52,40,75,47,'wood_d'); rect(im,53,41,74,46,'mustaka')
    return shadow(outline(im),64,118,60,5)
def bendungan():
    im=new(96,64); rect(im,0,10,95,34,'water'); [rect(im,x,14+(x%7),x+5,14+(x%7),'water_l') for x in range(2,92,11)]
    rect(im,0,34,95,44,'stone'); [rect(im,x,34+(x//10%2)*5,x+8,38+(x//10%2)*5,'stone_l') for x in range(0,96,10)]; rect(im,0,44,95,46,'stone_d')
    for x in range(10,90,16): rect(im,x,44,x+7,58,'water_l'); rect(im,x+2,46,x+5,58,'foam')
    rect(im,0,56,95,63,'water'); rect(im,40,22,55,33,'wood'); rect(im,40,22,55,23,'wood_l'); rect(im,46,10,49,22,'wood_d')
    return outline(im)
def saluran_tile(mask,f):
    im=new(); rect(im,0,0,31,31,(0,0,0,0))
    def ch(x0,y0,x1,y1):
        rect(im,x0,y0,x1,y1,'stone'); rect(im,x0+2,y0+2,x1-2,y1-2,'water')
    ch(9,9,22,22)
    if mask&1: ch(9,0,22,12)
    if mask&4: ch(9,19,22,31)
    if mask&8: ch(0,9,12,22)
    if mask&2: ch(19,9,31,22)
    for y in range(32):
        for x in range(32):
            if im.getpixel((x,y))[:3]==PALETTE['water'] and (x+y+f*3)%9==0: px(im,x,y,'water_l')
    return outline(im,'stone_d')
def monuments():
    stages_from_final(masjid(),'masjid','masjid atap tumpang 3 (Nusantara) 128x128 (4x4 tile)')
    stages_from_final(langgar(),'langgar','langgar panggung atap tumpang 2, 64x64 (2x2)')
    stages_from_final(balai_megah(),'balai_desa_megah','balai desa megah (pendopo bertingkat) 128x128 (4x4)')
    stages_from_final(bendungan(),'bendungan','bendungan kecil/irigasi 96x64 (3x2), letakkan melintang sungai')
    sh=new(128,256)
    for f in range(2):
        for m in range(16): sh.paste(saluran_tile(m,f),((m%4)*32,(f*4+m//4)*32))
    save(sh,'tiles/tropis/saluran_irigasi_autotile.png',(32,32),32,'saluran irigasi batu 16-tile 4-bit (N1+E2+S4+W8); baris 0-3 frame 0, 4-7 frame 1 (air mengalir ~400ms)')
# ---------- 17 AGUSTUS ----------
def agustus():
    sh=new(128,96)
    for f in range(4):
        im=new(32,96); rect(im,6,4,7,90,'stone_l'); rect(im,8,4,8,90,'stone_d'); ell(im,(4,1,9,5),'mustaka'); rect(im,2,88,12,92,'stone'); rect(im,0,92,14,94,'stone_d')
        for x in range(9,30):
            t=(x-9)/20; wy=int(round(2*math.sin(t*math.pi*1.5+f*math.pi/2)*t))
            for y in range(6,12): px(im,x,y+wy,'merah' if x<29 or True else 'merah')
            for y in range(12,18): px(im,x,y+wy,'putih')
        sh.paste(shadow(outline(im),7,92,6,2),(f*32,0))
    save(sh,'decor/agustus/bendera_merah_putih.png',(32,96),4,'tiang bendera + merah putih berkibar 4 frame ~150ms; anchor tengah-bawah tiang di x≈7')
    sh=new(128,96)
    for f in range(4):
        im=new(32,96); d=ImageDraw.Draw(im); sw=[0,1,2,1][f]
        d.line([(8,92),(8,20)],fill=P('bamboo'),width=2); d.line([(8,20),(10+sw,10),(16+sw*2,4)],fill=P('bamboo'),width=1)
        for y in range(14,74):
            t=(y-14)/60; x0=10+int(sw*(1-t)+1.5*math.sin(t*6+f)); w=6
            for x in range(x0,x0+w): px(im,x,y,'merah' if (x-x0)<3 else 'putih')
        ImageDraw.Draw(im).polygon([(10,74),(16,74),(13,80)],fill=P('merah'))
        sh.paste(shadow(outline(im),8,92,4,1),(f*32,0))
    save(sh,'decor/agustus/umbul_umbul.png',(32,96),4,'umbul-umbul bambu, 4 frame ~200ms')
    im=new(64,128); d=ImageDraw.Draw(im)
    rect(im,30,24,33,122,'wood_d'); [rect(im,30,y,33,y,'wood_l') for y in range(30,122,6)]; rect(im,24,120,39,124,'dirt_d')
    ell(im,(6,14,57,26),'bamboo'); ell(im,(10,16,53,24),(0,0,0,0)) if False else None
    for x,c in((10,'cloth1'),(18,'banana'),(26,'cloth2'),(36,'leaf'),(44,'roof'),(52,'gold')):
        d.line([(x,22),(x,30)],fill=P('straw_d')); rect(im,x-3,30,x+3,36,c); px(im,x-2,31,'white')
    rect(im,24,10,39,14,'merah'); rect(im,24,14,39,18,'putih'); rect(im,30,2,33,10,'wood_d')
    for y in(60,80,100): px(im,29,y,'water_l'); px(im,34,y+4,'water_l')
    save(shadow(outline(im),32,123,10,2),'decor/agustus/panjat_pinang.png',note='64x128 (2x4 tile), batang licin + hadiah di puncak; titik panjat x 31-32')
    for i,v in enumerate(VARS):
        sh=new(128,128)
        for r_,dn in enumerate(['down','left','right','up']):
            for f in range(4):
                hop=[0,-3,-5,-2][f]; base=villager_frame(v,dn,0,False); body=new(); body.alpha_composite(base.crop((0,0,32,26)),(0,hop))
                sk=new(); d=ImageDraw.Draw(sk); d.polygon([(9,17+hop+3),(22,17+hop+3),(23,28+hop),(8,28+hop)],fill=P('straw')); rect(sk,9,20+hop,22,21+hop,'straw_d'); px(sk,12,25+hop,'straw_d'); px(sk,19,24+hop,'straw_d')
                rect(sk,7,19+hop,9,21+hop,v[0]); rect(sk,22,19+hop,24,21+hop,v[0])
                sk=outline(sk); body.alpha_composite(sk)
                fr=new(); s2=new(); ImageDraw.Draw(s2).ellipse([16-7+abs(hop)//2,27,16+7-abs(hop)//2,31],fill=PALETTE['shadow']); fr.alpha_composite(s2); fr.alpha_composite(body)
                sh.paste(fr,(f*32,r_*32))
        save(sh,f'decor/agustus/balap_karung_villager_{i+1}.png',(32,32),16,'penduduk dalam karung: 4 baris arah (bawah,kiri,kanan,atas) x 4 frame lompat ~110ms; maju ~6px per siklus saat frame 1-2')
    sh=new(64,16)
    for f in range(2):
        im=new(32,16); d=ImageDraw.Draw(im)
        pts=[(x,2+int(3*math.sin(x/32*math.pi))+ (f if 8<x<24 else 0)) for x in range(32)]
        d.line(pts,fill=P('stone_d'))
        for k,x in enumerate((2,10,18,26)):
            y=pts[x][1]; d.polygon([(x,y),(x+6,y),(x+3,y+8)],fill=P('merah' if k%2==0 else 'putih'))
        sh.paste(outline(im),(f*32,0))
    save(sh,'decor/agustus/bunting_merah_putih.png',(32,16),2,'untaian bendera segitiga, tile horizontal seamless (ujung y=2), 2 frame ayun ~400ms')
    im=new(96,96); d=ImageDraw.Draw(im)
    for x in(8,78): rect(im,x,30,x+9,90,'bamboo'); [rect(im,x,y,x+9,y,'bamboo_d') for y in range(36,90,9)]; rect(im,x-2,88,x+11,92,'stone')
    d.arc((8,6,87,60),180,360,fill=P('bamboo'),width=6); d.arc((12,10,83,56),180,360,fill=P('palm_l'),width=2)
    rect(im,26,26,69,37,'merah'); rect(im,26,32,69,37,'putih'); t=text_img('HUT',1,['white'],0,0) if False else None
    for x in range(20,77,6): ImageDraw.Draw(im).polygon([(x,38),(x+5,38),(x+2.5,44)],fill=P('merah' if (x//6)%2 else 'putih'))
    for x,y in((10,28),(84,28)): ell(im,(x-4,y-6,x+6,y+4),'leaf'); px(im,x,y-2,'leaf_l')
    for y in range(44,88,8): [px(im,x,y,'hibiscus') for x in(12,82)]
    save(shadow(outline(im),48,91,42,3),'decor/agustus/gapura_agustus.png',note='96x96 (3x3) gapura bambu & janur, merah putih; jalan lewat di tengah (x 20-76)')
# ---------- PANEL DILEMA ----------
def batik_band(im,x0,y0,x1,y1):
    rect(im,x0,y0,x1,y1,'batik')
    for y in range(y0,y1+1,4):
        for x in range(x0,x1+1,4):
            px(im,x+1,y+1,'batik_l'); px(im,x+2,y+2,'batik_l') if (x+y)%8==0 else px(im,x+2,y,'batik_l')
def dilemma_ui():
    s=64; im=new(s,s); e=s-1
    rect(im,0,0,e,e,'outline'); rect(im,1,1,e-1,e-1,'wood_d'); rect(im,2,2,e-2,e-2,'wood'); rect(im,2,2,e-2,3,'wood_l')
    batik_band(im,5,5,e-5,10); batik_band(im,5,e-10,e-5,e-5); batik_band(im,5,5,10,e-5); batik_band(im,e-10,5,e-5,e-5)
    rect(im,11,11,e-11,e-11,'wood_d'); rect(im,12,12,e-12,e-12,'parch'); rect(im,12,12,e-12,13,'parch_d')
    for cx,cy in((7,7),(e-7,7),(7,e-7),(e-7,e-7)):
        ell(im,(cx-5,cy-5,cx+5,cy+5),'wood_d'); ell(im,(cx-4,cy-4,cx+4,cy+4),'gold'); ell(im,(cx-2,cy-2,cx+2,cy+2),'gold_d'); px(im,cx-1,cy-1,'fire_w')
    [im.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(e,0),(0,e),(e,e))]
    save(im,'ui/dilemma/panel_dilema.png',note='9-slice 64x64, margin 14 semua sisi (bingkai kayu ukir + pita batik kawung halus + ornamen sudut emas); konten mulai inset 14')
    for st in('normal','hover','pressed','disabled'):
        b=new(96,28); off=2 if st=='pressed' else 0; face={'normal':'wood_l','hover':'straw','pressed':'wood','disabled':'stone'}[st]
        rect(b,0,off,95,27,'outline'); rect(b,1,1+off,94,26,'wood_d'); rect(b,1,1+off,94,23 if st!='pressed' else 25,face)
        if st!='disabled': batik_band(b,3,3+off,8,20+off); batik_band(b,87,3+off,92,20+off)
        rect(b,10,2+off,85,2+off,'fire_w' if st=='hover' else 'dirt_l')
        [b.putpixel(p_,(0,0,0,0)) for p_ in((0,off),(95,off),(0,27),(95,27))]
        save(b,f'ui/dilemma/button_choice_{st}.png',note='9-slice margin kiri/kanan 10, atas 4, bawah 6; teks mulai x+12')
    for size,inner in((48,32),(80,64)):
        fr=new(size,size); m=(size-inner)//2; e=size-1
        rect(fr,0,0,e,e,'outline'); rect(fr,1,1,e-1,e-1,'gold_d'); rect(fr,2,2,e-2,e-2,'gold'); rect(fr,2,2,e-2,2,'fire_w')
        batik_band(fr,4,4,e-4,m-3) if m>8 else None
        rect(fr,m-2,m-2,e-m+2,e-m+2,'wood_d'); ImageDraw.Draw(fr).rectangle([m,m,e-m,e-m],fill=(0,0,0,0))
        for cx,cy in((3,3),(e-3,3),(3,e-3),(e-3,e-3)): px(fr,cx,cy,'merah')
        ImageDraw.Draw(fr).polygon([(size//2-6,0),(size//2,-1),(size//2+6,0),(size//2,5)],fill=P('gold'))
        save(fr,f'ui/dilemma/portrait_frame_{size}.png',note=f'bingkai potret; jendela transparan {inner}x{inner} di offset ({m},{m}); gambar potret di bawah bingkai')
    for i,v in enumerate(VARS):
        h=villager_frame(v,'down',0,False).crop((6,1,26,21)); bg=new(32,32); rect(bg,0,0,31,31,'parch_d'); rect(bg,0,20,31,31,'parch')
        bg.alpha_composite(h.resize((40,40),Image.NEAREST).crop((4,4,36,36)),(0,0))
        save(bg,f'ui/dilemma/portraits/portrait_villager_{i+1}.png',note='potret 32x32 (kepala villager_N 2x); 64x64 = skala 2 nearest untuk portrait_frame_80')
    def chief(im,d):
        ell(im,(6,6,25,24),'skin2'); rect(im,6,2,25,9,'black'); ell(im,(6,0,25,6),'black'); rect(im,6,8,25,9,'gold')
        rect(im,10,13,12,15,'black'); rect(im,19,13,21,15,'black'); d.arc((11,15,20,21),20,160,fill=P('black')); rect(im,12,19,19,20,'hair1')
        rect(im,4,24,27,31,'batik'); [px(im,x,y,'batik_l') for x in range(5,27,3) for y in(26,29)]; rect(im,14,24,17,31,'putih')
    im=icon_draw(chief); save(im,'icons/traits/icon_kepala_desa.png',note='ikon kepala desa (peci + baju batik) 32x32'); save(to16b(im),'icons/traits/icon_kepala_desa_16.png',note='16x16')
def stage8():
    traits_rel(); emotes(); monuments(); agustus(); dilemma_ui()

# =====================================================================
# TAHAP 8b: lengkap sesuai docs/RISET-CERITA-TUJUAN.md (§1.1, §1.2, §1.3, §2.1, §2.3, §7)
# =====================================================================
PALETTE.update({'merak':(36,120,104),'merak_l':(96,184,140),'merak_eye':(44,72,170),'merak_g':(236,196,80),
 'khaki':(176,156,104),'khaki_d':(132,112,72),'khaki_l':(208,190,140),'coat':(236,240,240),'coat_d':(190,200,206),
 'kader':(232,130,164),'kader_d':(186,90,124),'kader_l':(248,190,210),'kerudung':(250,214,226),
 'ksatria':(150,40,40),'kayu_ukir':(170,100,50),'kerupuk':(244,226,170),'kerupuk_d':(214,186,120),'kabah':(40,36,44)})
def to16c(im32):
    s=im32.resize((16,16),Image.BOX); p=s.load(); cols=_PAL16C
    for y in range(16):
        for x in range(16):
            c=p[x,y]; p[x,y]=(0,0,0,0) if c[3]<110 else min(cols,key=lambda q:sum((a-b)**2 for a,b in zip(q,c[:3])))+(255,)
    return s
def grid_icon(rows,cmap):
    h=len(rows); w=len(rows[0]); im=new(w,h)
    for y,r in enumerate(rows):
        for x,ch in enumerate(r):
            if ch!='.': px(im,x,y,cmap[ch])
    return im
def pop4(b,W,H,note=None):
    """4 frame muncul: 0 kecil (0.5), 1 membesar (1.15), 2 normal, 3 bob -1px; anchor tengah-bawah"""
    sh=new(W*4,H)
    for f,sc in enumerate((0.5,1.15,1.0,1.0)):
        if sc!=1.0:
            w=max(2,int(W*sc)); h=max(2,int(H*sc)); bb=b.resize((w,h),Image.NEAREST); fr=new(W,H)
            fr.alpha_composite(bb.crop((max(0,(w-W)//2),max(0,h-H),max(0,(w-W)//2)+min(W,w),max(0,h-H)+min(H,h))),(max(0,(W-w)//2),max(0,H-h)))
        elif f==3: fr=new(W,H); fr.alpha_composite(b,(0,-1))
        else: fr=b
        sh.paste(fr,(f*W,0))
    return sh
# ---------- 1. sifat baru ----------
def Y_perantau(im,d):
    d.line([(4,30),(24,6)],fill=P('wood_d'),width=3); d.line([(5,29),(24,7)],fill=P('wood_l'),width=1)
    ell(im,(11,7,31,27),'cloth2'); ell(im,(13,9,26,19),'water_l')
    for x,y in((16,12),(22,10),(26,15),(19,18),(24,20),(15,16)): rect(im,x,y+2,x+1,y+3,'white')
    d.polygon([(15,10),(17,1),(22,8)],fill=P('cloth2')); d.polygon([(22,8),(30,2),(28,11)],fill=P('cloth2')); ell(im,(18,6,24,11),'cloth_d')
def Y_ahli_tani(im,d):
    for x,lean in((8,-3),(14,-1),(20,2),(25,4)):
        d.line([(x,30),(x+lean,15)],fill=P('rice_g'),width=2)
        for k in range(4): ell(im,(x+lean+(k%2)*2-2,14+k*3-1,x+lean+(k%2)*2+1,14+k*3+2),'rice_y')
    d.polygon([(1,14),(16,2),(31,14)],fill=P('straw')); d.polygon([(6,12),(16,4),(26,12)],fill=P('straw_l'))
    for y in(7,10,13): d.line([(16-(y-2)*15/12,y),(16+(y-2)*15/12,y)],fill=P('straw_d'))
    d.line([(1,14),(31,14)],fill=P('straw_d'),width=2); rect(im,15,1,17,3,'wood_d')
def Y_pandai_masak(im,d):
    for x in(10,16,22): d.arc((x-3,1,x+3,9),90,270,fill=P('smoke'),width=2)
    d.line([(1,17),(6,17)],fill=P('wood_d'),width=3); d.line([(26,17),(31,17)],fill=P('wood_d'),width=3)
    d.chord((4,8,28,30),0,180,fill=P('stone_d')); ell(im,(4,12,28,22),'stone'); ell(im,(6,13,26,21),'fire_d')
    for x,y,c in((10,15,'carrot'),(15,17,'leaf_l'),(20,15,'fire_l'),(13,18,'wheat'),(22,18,'carrot')): ell(im,(x-2,y-1,x+2,y+2),c)
    d.line([(22,4),(18,16)],fill=P('wood_l'),width=2); rect(im,16,14,20,17,'wood')
def Y_seniman(im,d):
    for a in range(-90,91,18):
        r_=math.radians(a-90); x,y=16+14*math.cos(r_),18+14*math.sin(r_)
        d.line([(16,20),(x,y)],fill=P('merak'),width=3); ell(im,(x-3,y-3,x+3,y+3),'merak_l'); ell(im,(x-2,y-2,x+1,y+1),'merak_eye'); px(im,int(x),int(y),'merak_g')
    ell(im,(9,15,23,31),'leo'); ell(im,(11,23,21,31),'leo_l'); [px(im,x,y,'spot') for x,y in((11,19),(21,19),(16,17))]
    rect(im,11,20,13,22,'black'); rect(im,19,20,21,22,'black'); px(im,11,20,'white'); px(im,19,20,'white')
    rect(im,12,27,20,29,'merah'); [px(im,x,27,'white') for x in(13,15,17,19)]
NEW_TRAITS=[('perantau',Y_perantau,'netral (bingkai hijau sesuai riset)'),('ahli_tani',Y_ahli_tani,'positif'),('pandai_masak',Y_pandai_masak,'positif'),('seniman',Y_seniman,'positif')]
def rel12(kind):
    O='outline'
    m={'teman':(["...oooooo...","..oyyyyyyo..",".oyyyyyyyyo.","oyykyyyykyyo","oyykyyyykyyo","oyyyyyyyyyyo","oyrryyyyrryo","oyyykyykyyyo",".oyyykkkyyo.","..oyyyyyyo..","...oooooo...","............"],{'o':O,'y':'pos_c','k':'black','r':'berry_l'}),
       'sahabat':(["..ooo..ooo..",".oggg oohhho".replace(' ','o'),".oggggohhhho",".oggggohhhho","..oggo.ohho.",".oooggoohhoo","oggggggghhho","ogggggghhhho","ogggooohhhho","oggo....ohho","ooo......ooo","............"],{'o':O,'g':'leaf_d','h':'pos_c'}),
       'rival':(["......oooo..",".....offfo..","....offfo...","...offfo....","..offfffffo.","..ooooffffo.","....offfoo..","...offfo....","..offo......","..ofo.......","..oo........","............"],{'o':O,'f':'fire'}),
       'pasangan':(["............",".ooo...ooo..","obbbo.obbbo.","obwbbobbbbbo","obbbbbbbbbbo","obbbbbbbbbbo",".obbbbbbbbo.","..obbbbbbo..","...obbbbo...","....obbo....",".....oo.....","............"],{'o':O,'b':'berry','w':'white'}),
       'keluarga':([".....oo.....","....orro....","...orrrro...","..orrrrrro..",".orrrrrrrro.","oooooooooooo",".owwwwwwwwo.",".owbbwwddwo.",".owbbwwddwo.",".owwwwwddwo.",".oooooooooo.","............"],{'o':O,'r':'roof','w':'wall_w','b':'water_l','d':'wood'})}
    if kind=='sahabat':
        im=new(12,12); ell(im,(2,1,5,4),'leaf_d'); ell(im,(6,1,9,4),'pos_c'); rect(im,1,6,4,10,'leaf_d'); rect(im,7,6,10,10,'pos_c'); rect(im,4,7,7,8,'skin2'); return outline(im)
    return grid_icon(*m[kind])
def traits_rel_8b():
    for n,fn,kind in NEW_TRAITS:
        im=badge(fn,'pos_c'); save(im,f'icons/traits/trait_{n}.png',note=f'sifat {n} ({kind}), format sama dengan icons/traits')
        save(to16c(im),f'icons/traits/trait_{n}_16.png',note='16x16')
    def R_sahabat(im,d):
        ell(im,(0,10,12,22),'skin1'); ell(im,(20,10,32,22),'skin3'); rect(im,0,13,4,21,'cloth1'); rect(im,28,13,31,21,'cloth2')
        d.polygon([(8,12),(18,10),(24,14),(22,22),(12,22)],fill=P('skin2')); d.line([(12,14),(20,20)],fill=P('skin3'),width=2); d.line([(14,12),(22,17)],fill=P('skin1'),width=1)
        for x,y in((6,4),(26,4),(16,2)): px(im,x,y,'gold'); [px(im,x+a,y+b,'fire_l') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
    def R_keluarga(im,d):
        d.polygon([(2,14),(16,2),(30,14)],fill=P('roof')); d.line([(2,14),(16,2),(30,14)],fill=P('roof_l'),width=2)
        rect(im,5,14,27,29,'wall_w'); rect(im,5,27,27,29,'wall_d'); rect(im,20,19,25,29,'wood'); rect(im,7,17,12,22,'water_l')
        for ox,oy in((14,17),): ell(im,(ox-4,oy-2,ox,oy+2),'berry'); ell(im,(ox-1,oy-2,ox+3,oy+2),'berry'); ImageDraw.Draw(im).polygon([(ox-4,oy+1),(ox+3,oy+1),(ox-0.5,oy+5)],fill=P('berry'))
    for n,fn,c in(('sahabat',R_sahabat,'leaf_d'),('keluarga',R_keluarga,'wood_l')):
        im=badge(fn,c); save(im,f'icons/relations/rel_{n}.png',note='hubungan 32x32'); save(to16c(im),f'icons/relations/rel_{n}_16.png',note='16x16')
    for n in('teman','sahabat','rival','pasangan','keluarga'):
        save(rel12(n),f'icons/relations/rel_{n}_12.png',note='12x12 tanpa bingkai (riset §7: ikon hubungan 12x12 di panel/garis antar penduduk)')
# ---------- 3. gelembung keinginan ----------
def wish_bubble(col='white',edge=None):
    b=new(24,24); d=ImageDraw.Draw(b)
    for bb in((1,1,12,10),(10,0,22,10),(0,6,10,18),(13,6,23,18),(3,9,20,19)): ell(b,bb,col)
    rect(b,3,3,20,17,col); ell(b,(5,18,10,22),col); ell(b,(2,21,4,23),col)
    b=outline(b,edge or 'outline')
    rect(b,4,2,19,17,'parch') if False else None
    return b
WISH_LIST=['makan_rendang','nasi_pecel','kopi_pagi','rumah_panggung','nonton_reog','tabungan_haji','mancing_sore','punya_ayam','baju_baru','ziarah_makam',
 'wayang_semalam','tidur_siang','kerja_bakti','ngobrol_sahabat','punya_anak','sawah_menguning','jajan_pasar','belajar_gamelan','rujak_bareng','bancakan_weton',
 'pulang_kampung','ronda_malam','main_layangan','menang_lomba','tumpeng_syukuran','mandi_kali']
def W_plate(im,d,cy=20): ell(im,(2,cy-6,29,cy+9),'white'); ell(im,(5,cy-4,26,cy+6),'parch')
def piala_draw(im,d):
    d.chord((6,2,26,24),0,180,fill=P('gold')); rect(im,6,2,26,13,'gold'); rect(im,8,3,10,12,'fire_w'); d.arc((0,4,10,16),90,270,fill=P('gold_d'),width=2); d.arc((22,4,32,16),270,90,fill=P('gold_d'),width=2)
    rect(im,14,22,18,25,'gold_d'); rect(im,9,25,23,28,'wood_d'); rect(im,8,28,24,30,'wood'); rect(im,13,26,19,27,'gold')
def wish_draw(n,im,d):
    if n=='makan_rendang':
        W_plate(im,d)
        for x,y in((10,18),(17,16),(21,20),(13,22)): ell(im,(x-4,y-3,x+4,y+3),'wood_d'); px(im,x-1,y-1,'dirt')
        for x,y in((8,14),(24,16),(16,24)): rect(im,x,y,x+2,y+1,'merah')
    elif n=='nasi_pecel':
        W_plate(im,d); ell(im,(6,12,16,22),'white'); ell(im,(15,14,26,24),'leaf'); ell(im,(17,15,24,21),'leaf_l'); d.chord((9,16,24,27),180,360,fill=P('dirt')) ; rect(im,20,8,28,13,'kerupuk'); px(im,22,10,'kerupuk_d'); px(im,25,11,'kerupuk_d')
    elif n=='kopi_pagi':
        ell(im,(3,22,28,30),'white'); rect(im,8,13,23,25,'white'); ell(im,(8,10,23,16),'white'); ell(im,(9,11,22,15),'coffee'); d.arc((20,15,28,23),270,90,fill=P('white'),width=2)
        for x in(12,18): d.arc((x-2,1,x+2,9),90,270,fill=P('smoke'),width=2)
    elif n=='rumah_panggung':
        d.polygon([(3,14),(16,3),(29,14)],fill=P('ijuk')); rect(im,6,14,26,22,'bamboo'); rect(im,13,16,18,22,'wood_d'); [rect(im,x,22,x+1,29,'wood_d') for x in(7,15,24)]; rect(im,5,22,27,23,'wood')
    elif n=='nonton_reog': Y_seniman(im,d)
    elif n=='tabungan_haji':
        d.polygon([(4,12),(16,7),(28,12),(28,26),(16,31),(4,26)],fill=P('kabah')); d.polygon([(4,12),(16,17),(16,31),(4,26)],fill=P('outline'))
        d.line([(4,15),(16,20),(28,15)],fill=P('gold'),width=2); d.polygon([(4,12),(16,7),(28,12),(16,17)],fill=P('stone_d'))
        rect(im,20,21,22,26,'gold')
    elif n=='mancing_sore':
        d.line([(3,29),(22,3)],fill=P('bamboo_d'),width=2); d.line([(22,3),(27,16)],fill=P('white')); 
        ell(im,(14,18,28,26),'water_l'); ell(im,(16,19,26,25),'stone_l'); d.polygon([(14,22),(10,18),(10,26)],fill=P('stone_l')); px(im,23,21,'black')
    elif n=='punya_ayam':
        ell(im,(5,12,25,28),'chick_w'); ell(im,(8,17,20,25),'chick_b'); ell(im,(16,4,28,16),'chick_w'); rect(im,19,1,24,4,'comb'); rect(im,27,9,30,11,'beak'); px(im,23,8,'black'); rect(im,24,14,25,17,'comb')
        d.polygon([(6,16),(1,8),(9,13)],fill=P('chick_b')); [rect(im,x,28,x+1,31,'beak') for x in(11,17)]
    elif n=='baju_baru':
        d.polygon([(3,9),(11,3),(21,3),(29,9),(26,15),(23,13),(23,29),(9,29),(9,13),(6,15)],fill=P('batik'))
        for x in range(10,23,4):
            for y in range(8,28,5): px(im,x,y,'batik_l'); px(im,x+1,y+1,'batik_l')
        d.polygon([(13,3),(16,8),(19,3)],fill=P('putih'))
    elif n=='ziarah_makam':
        ell(im,(2,22,29,31),'dirt'); rect(im,11,7,20,25,'stone_l'); ell(im,(11,4,20,11),'stone_l'); rect(im,11,22,20,25,'stone')
        for x,y in((6,20),(25,21)): [ell(im,(x+a-2,y+b-2,x+a+2,y+b+2),'frangi') for a,b in((0,-2),(2,0),(0,2),(-2,0))]; px(im,x,y,'frangi_y')
    elif n=='wayang_semalam':
        d.polygon([(16,1),(26,12),(28,24),(16,30),(4,24),(6,12)],fill=P('kayu_ukir')); d.polygon([(16,5),(23,13),(24,23),(16,27),(8,23),(9,13)],fill=P('gold'))
        d.line([(16,6),(16,28)],fill=P('kayu_ukir'),width=2); [d.line([(16,y),(16+s_*6,y-4)],fill=P('kayu_ukir')) for y in(12,17,22) for s_ in(-1,1)]; rect(im,15,28,17,31,'wood_d')
    elif n=='tidur_siang':
        rect(im,2,20,29,24,'bamboo'); [rect(im,x,24,x+1,30,'bamboo_d') for x in(4,26)]; ell(im,(4,14,12,21),'skin2'); rect(im,10,16,26,20,'cloth2')
        for x,y,s_ in((16,2,5),(23,8,3)): d.line([(x,y),(x+s_,y),(x,y+s_),(x+s_,y+s_)],fill=P('magic'),width=2)
    elif n=='kerja_bakti':
        d.line([(6,30),(20,6)],fill=P('wood'),width=3); d.polygon([(16,4),(27,4),(26,11),(18,9)],fill=P('stone_l')); ell(im,(14,18,30,30),'bamboo'); ell(im,(16,19,28,24),'dirt')
        for x in range(16,29,3): d.line([(x,22),(x,29)],fill=P('bamboo_d'))
    elif n=='ngobrol_sahabat':
        ell(im,(1,3,18,15),'white'); d.polygon([(5,13),(9,13),(4,18)],fill=P('white')); ell(im,(13,13,31,25),'leaf_l'); d.polygon([(26,23),(22,23),(28,29)],fill=P('leaf_l'))
        for x in(6,10,14): px(im,x,9,'black')
        for x in(18,22,26): px(im,x,19,'black')
    elif n=='punya_anak':
        ell(im,(4,6,28,30),'water_l'); ell(im,(9,8,23,22),'skin1'); ell(im,(8,5,24,13),'water_l'); px(im,13,15,'black'); px(im,19,15,'black'); px(im,11,18,'berry_l'); px(im,21,18,'berry_l'); d.arc((13,15,19,20),20,160,fill=P('black'))
    elif n=='sawah_menguning':
        rect(im,1,22,30,30,'paddy_w'); 
        for x in range(3,30,5):
            d.line([(x,28),(x+2,10)],fill=P('rice_yd'),width=2)
            for k in range(3): ell(im,(x+1+k%2,9+k*3,x+4+k%2,12+k*3),'rice_y')
        ell(im,(20,1,30,9),'fire_l')
    elif n=='jajan_pasar':
        d.polygon([(1,20),(16,12),(31,20),(16,28)],fill=P('banana_g')); d.line([(1,20),(31,20)],fill=P('leaf_d'))
        for x,y in((10,17),(18,15),(14,21),(22,20)): ell(im,(x-4,y-4,x+4,y+4),'leaf_l'); px(im,x-1,y-3,'white'); px(im,x+2,y-2,'white'); px(im,x,y-1,'white')
        for x,y in((6,22),(26,22)): ell(im,(x-3,y-2,x+3,y+2),'blossom')
    elif n=='belajar_gamelan':
        rect(im,2,4,29,6,'kayu_ukir'); rect(im,3,4,5,30,'kayu_ukir'); rect(im,26,4,28,30,'kayu_ukir'); d.line([(16,6),(16,9)],fill=P('outline'))
        ell(im,(6,9,26,29),'gold_d'); ell(im,(8,11,24,27),'gold'); ell(im,(13,15,19,21),'gold_d'); ell(im,(14,16,17,19),'fire_w')
    elif n=='rujak_bareng':
        ell(im,(2,14,29,30),'stone_d'); ell(im,(4,15,27,26),'stone'); ell(im,(8,17,23,24),'dirt_d')
        for x,y,c in((9,10,'mango'),(16,7,'leaf_l'),(23,11,'rambutan'),(13,13,'white'),(20,14,'mango_g')): rect(im,x-2,y-2,x+2,y+3,c)
        d.line([(24,4),(28,20)],fill=P('stone_l'),width=3)
    elif n=='bancakan_weton':
        d.polygon([(0,22),(16,14),(31,22),(16,30)],fill=P('banana_g')); ell(im,(8,10,24,24),'white'); ell(im,(10,11,22,17),'white')
        for x,y,c in((6,22,'leaf'),(25,22,'leaf_l'),(16,26,'carrot')): ell(im,(x-3,y-2,x+3,y+2),c)
        ell(im,(18,15,25,21),'white'); ell(im,(20,17,23,20),'fire_l')
    elif n=='pulang_kampung':
        rect(im,14,10,16,30,'wood_d'); d.polygon([(4,6),(24,6),(29,10),(24,14),(4,14)],fill=P('wood_l')); d.line([(8,10),(22,10)],fill=P('wood_d'))
        ell(im,(2,18,14,30),'batik'); ell(im,(4,20,12,27),'batik_l'); d.polygon([(6,19),(9,15),(11,19)],fill=P('batik'))
    elif n=='ronda_malam':
        m=new(); ell(m,(20,1,31,12),'white'); ell(m,(24,-1,34,9),'white'); im.paste(P('fire_w'),(0,0),ImageChops.subtract(m.split()[3].point(lambda v:255 if v else 0),Image.new('L',(32,32),0)))
        mk=new(); ell(mk,(24,-1,34,9),'white'); im.paste((0,0,0,0),(0,0),mk.split()[3])
        d.line([(12,1),(12,6)],fill=P('outline')); rect(im,7,6,17,29,'wood'); rect(im,7,6,8,29,'wood_l'); rect(im,11,10,13,25,'wood_d'); rect(im,7,13,17,13,'wood_d'); rect(im,7,22,17,22,'wood_d')
        d.line([(19,30),(27,18)],fill=P('wood_l'),width=3)
    elif n=='main_layangan':
        d.polygon([(18,1),(29,11),(18,21),(7,11)],fill=P('merah')); d.polygon([(18,1),(29,11),(18,11)],fill=P('putih')); d.line([(18,1),(18,21)],fill=P('bamboo_d')); d.line([(7,11),(29,11)],fill=P('bamboo_d'))
        pts=[(18,21),(15,24),(18,27),(14,30)]; d.line(pts,fill=P('fire')); d.line([(18,21),(2,31)],fill=P('white'))
    elif n=='menang_lomba': piala_draw(im,d)
    elif n=='tumpeng_syukuran':
        ell(im,(1,22,30,31),'banana_g'); d.polygon([(16,2),(26,25),(6,25)],fill=P('rice_y')); d.polygon([(16,2),(20,12),(14,12)],fill=P('fire_w'))
        for x,y,c in((5,25,'leaf'),(27,25,'carrot'),(16,28,'white'),(11,27,'merah')): ell(im,(x-3,y-2,x+3,y+2),c)
        rect(im,15,0,17,3,'merah')
    elif n=='mandi_kali':
        rect(im,0,18,31,31,'water'); [d.arc((x,16,x+8,22),180,360,fill=P('water_l'),width=2) for x in(0,10,20)]
        ell(im,(9,8,21,20),'skin3'); ell(im,(9,7,21,13),'hair4'); px(im,13,14,'black'); px(im,17,14,'black')
        for x,y in((5,10),(25,8),(27,14)): ell(im,(x-1,y-2,x+1,y+1),'water_l')
def wishes():
    b=wish_bubble(); save(pop4(b,24,24),'ui/wish/wish_bubble.png',(24,24),4,'gelembung keinginan (awan pikiran) 4 frame: 0 kecil, 1 membesar, 2 normal, 3 bob; slot ikon 16x16 di (4,2) frame 2 dan (4,1) frame 3')
    b=wish_bubble('fire_w','fire_d'); save(pop4(b,24,24),'ui/wish/wish_bubble_hampir.png',(24,24),4,'varian gelembung saat keinginan hampir kedaluwarsa (≤1 hari), slot sama')
    save(b if False else wish_bubble(),'ui/wish/wish_bubble_static.png',note='24x24 statis = frame 2; slot 16x16 di (4,2)')
    for n in WISH_LIST:
        im=new(); wish_draw(n,im,ImageDraw.Draw(im)); im=outline(im)
        save(im,f'icons/wishes/wish_{n}.png',note=f'keinginan {n} 32x32 (kartu panel Keinginan Warga)'); save(to16c(im),f'icons/wishes/wish_{n}_16.png',note='16x16 untuk slot gelembung')
# ---------- 4. bar progres monumen ----------
def progress_bars():
    for nm,W,H,m,ih in(('',48,12,4,4),('_panel',96,20,6,8)):
        im=new(W,H); e=W-1; f=H-1
        rect(im,0,0,e,f,'outline'); rect(im,1,1,e-1,f-1,'wood_d'); rect(im,1,1,e-1,1,'wood_l'); rect(im,2,2,e-2,f-2,'wood')
        y0=(H-ih)//2; rect(im,m-1,y0-1,W-m,y0+ih,'outline'); rect(im,m,y0,W-m-1,y0+ih-1,'char'); rect(im,m,y0,W-m-1,y0,'black')
        for cx,cy in((1,1),(e-1,1),(1,f-1),(e-1,f-1)): px(im,cx,cy,'gold')
        if nm=='_panel': batik_band(im,2,2,m-2,f-2); batik_band(im,W-m+1,2,e-2,f-2)
        [im.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(e,0),(0,f),(e,f))]
        save(im,f'ui/progress/monument_bar_frame{nm}.png',note=f'9-slice {W}x{H}, margin {m} semua sisi; isi (track) di x {m}..{W-m-1}, y {y0}..{y0+ih-1} (tinggi {ih})')
        fl=new(4,ih); rect(fl,0,0,3,ih-1,'leaf'); rect(fl,0,0,3,0,'leaf_l'); rect(fl,0,ih-1,3,ih-1,'leaf_d'); px(fl,1,1 if ih>4 else 0,'white') if ih>4 else None
        if ih>4: rect(fl,2,2,3,ih-2,'pos_c')
        save(fl,f'ui/progress/monument_bar_fill{nm}.png',note=f'4x{ih} tile isi hijau, ulang horizontal sepanjang progres')
        fe=new(2,ih); rect(fe,0,0,1,ih-1,'leaf_l'); rect(fe,1,0,1,ih-1,'white'); save(fe,f'ui/progress/monument_bar_fill_end{nm}.png',note=f'2x{ih} ujung kanan isi (kilau), tempel di akhir fill')
        dv=new(2,ih+4); rect(dv,0,0,1,ih+3,'outline'); rect(dv,0,1,0,ih+2,'gold'); save(dv,f'ui/progress/monument_bar_divider{nm}.png',note=f'2x{ih+4} pemisah segmen tahap, x = trackX + trackW*k/N - 1, y = {y0-2}')
        gh=new(4,ih); rect(gh,0,0,3,ih-1,'pos_c'); [px(gh,x,y,'leaf_l') for x in(0,2) for y in range(ih) if (x+y)%2==0]
        save(gh,f'ui/progress/monument_bar_fill_done{nm}.png',note=f'4x{ih} tile segmen tahap yang sudah selesai (hijau muda bercorak), dipakai di kiri segmen aktif')
    sh=new(24,8)
    for i in range(3):
        p_=new(8,8); 
        if i==0: ell(p_,(0,0,7,7),'outline'); ell(p_,(1,1,6,6),'char')
        if i==1: ell(p_,(0,0,7,7),'outline'); ell(p_,(1,1,6,6),'gold'); ell(p_,(2,2,5,5),'fire_w')
        if i==2: ell(p_,(0,0,7,7),'outline'); ell(p_,(1,1,6,6),'leaf'); ImageDraw.Draw(p_).line([(2,4),(3,5),(5,2)],fill=P('white'))
        sh.paste(p_,(i*8,0))
    save(sh,'ui/progress/monument_stage_pip.png',(8,8),3,'penanda tahap: 0 belum, 1 sedang dikerjakan, 2 selesai; deret N pip di kiri label "Tahap 2/3 — 64%"')
    im=new(); fn=lambda im,d: (d.line([(6,28),(18,10)],fill=P('wood'),width=3), rect(im,12,4,26,11,'stone'), rect(im,12,4,26,5,'stone_l'), rect(im,24,6,28,9,'stone_d'))
    im=icon_draw(lambda im,d: fn(im,d)); save(im,'ui/progress/icon_bangun.png',note='ikon palu kerja (Mulai tahap N / Kerja bakti) 32x32'); save(to16c(im),'ui/progress/icon_bangun_16.png',note='16x16')

# ---------- 5. monumen per tahap riset + perancah bambu ----------
def bamboo_pole(im,x,y0,y1):
    rect(im,x,y0,x+1,y1,'bamboo'); rect(im,x+1,y0,x+1,y1,'bamboo_d'); px(im,x,y0,'bamboo_l')
    for y in range(y0+5,y1,6): rect(im,x,y,x+1,y,'bamboo_d')
def scaffold(im,x0,x1,ytop,ybot):
    """perancah bambu di depan bangunan: tiang, palang, silang, ikatan ijuk"""
    lay=new(im.width,im.height); d=ImageDraw.Draw(lay)
    xs=[x0,x1-1]+[x for x in range(x0+40,x1-30,40)]
    for x in xs: bamboo_pole(lay,x,ytop,ybot)
    ys=list(range(ybot-12,ytop+2,-18))
    for y in ys:
        d.line([(x0-1,y),(x1,y)],fill=P('bamboo_d')); d.line([(x0-1,y-1),(x1,y-1)],fill=P('bamboo'))
        for x in xs: px(lay,x,y,'ijuk'); px(lay,x+1,y-1,'ijuk')
        rect(lay,x0,y-3,x1-1,y-2,'wood_l') if y==ys[len(ys)//2] else None
    if len(ys)>1:
        for x in xs[:2]:
            d.line([(x,ys[0]),(x+(10 if x==x0 else -10),ys[1])],fill=P('bamboo_d'))
    im.alpha_composite(outline(lay))
    return im
def research_stages(final,prev,name,tahap,N,nama,note,flat=False,river=None):
    w,h=final.size; a=final.split()[3]; x0,y0,x1,y1=a.getbbox(); sh=new(w*4,h)
    base=prev.copy() if prev is not None else None
    def fond():
        im=new(w,h); rect(im,x0+2,y1-8,x1-2,y1-3,'stone_d'); rect(im,x0+2,y1-8,x1-2,y1-8,'stone_l')
        for x in range(x0+4,x1-3,6): rect(im,x,y1-9,x+3,y1-7,'stone')
        for x in(x0+1,x1-2): rect(im,x,y1-14,x,y1-3,'wood_l')
        ImageDraw.Draw(im).line([(x0+1,y1-13),(x1-2,y1-13)],fill=P('white')); return shadow(im,w//2,y1-2,(x1-x0)//2,3)
    def start():
        return base.copy() if base is not None else fond()
    top=[next((y for y in range(h) if a.getpixel((x,y))>200),None) for x in range(w)]
    def frame_lines():
        lay=new(w,h); d=ImageDraw.Draw(lay)
        for x in range(x0+3,x1-2,10):
            t=top[x] if top[x] is not None else y1
            d.line([(x,y1-8),(x,max(t+2,y0))],fill=P('wood'),width=2)
        pts=[(x,top[x]+1) for x in range(x0,x1) if top[x] is not None and x%2==0]
        for i in range(len(pts)-1): d.line([pts[i],pts[i+1]],fill=P('wood_l'))
        bm=new(w,h); db=ImageDraw.Draw(bm)
        for y in range(y1-20,y0,-12): db.line([(x0+3,y),(x1-3,y)],fill=P('wood_d'))
        lay.paste(bm,(0,0),ImageChops.multiply(bm.split()[3],a.point(lambda v:255 if v>200 else 0)))
        return outline(lay)
    if flat:
        b0=base.copy() if base is not None else river.copy()
        def part(fr):
            im=b0.copy(); cw=int(w*fr); im.alpha_composite(final.crop((0,0,cw,h)),(0,0)); return im
        fs=[scaffold(b0.copy(),2,w-3,20,50),scaffold(part(1/3),2,w-3,20,50),scaffold(part(2/3),2,w-3,20,50),final]
        for i,im in enumerate(fs): sh.paste(im,(i*w,0))
        pv='bangunan tahap '+str(tahap-1) if prev is not None else 'sungai kosong'
        save(sh,f'buildings/monuments/{name}_tahap{tahap}_stages.png',(w,h),4,f'{note}; tahap {tahap}/{N} "{nama}" sedang dibangun: 0 {pv} + perancah bambu, 1 sepertiga (kiri), 2 dua pertiga, 3 selesai; frame = min(3, floor(progres*3)); anchor tengah-bawah')
        save(final,f'buildings/monuments/{name}_tahap{tahap}.png',note=f'{note}; tahap {tahap}/{N} "{nama}" selesai'); return
    f0=scaffold(start(),x0+1,x1-2,max(0,y0+4),y1-4)
    f1=start(); f1.alpha_composite(frame_lines()); f1=scaffold(f1,x0+1,x1-2,max(0,y0+4),y1-4)
    f2=start(); f2.alpha_composite(frame_lines()); cut=y0+int((y1-y0)*0.45); f2.alpha_composite(final.crop((0,cut,w,h)),(0,cut)); f2=scaffold(f2,x0+1,x1-2,max(0,y0+4),y1-4)
    for i,im in enumerate((f0,f1,f2,final)): sh.paste(im,(i*w,0))
    pv='bangunan tahap '+str(tahap-1) if prev is not None else 'fondasi batu'
    save(sh,f'buildings/monuments/{name}_tahap{tahap}_stages.png',(w,h),4,f'{note}; tahap {tahap}/{N} "{nama}" sedang dibangun: 0 {pv} + perancah bambu, 1 rangka, 2 setengah jadi, 3 selesai; frame = min(3, floor(progres*3)), selesai = 3; anchor tengah-bawah',)
    save(final,f'buildings/monuments/{name}_tahap{tahap}.png',note=f'{note}; tahap {tahap}/{N} "{nama}" selesai')
def dadak_merak(im,cx,cy,r,face=True):
    d=ImageDraw.Draw(im)
    for a in range(-85,86,10):
        rr=math.radians(a-90); x,y=cx+r*math.cos(rr),cy+r*0.9*math.sin(rr)
        d.line([(cx,cy),(x,y)],fill=P('merak'),width=max(2,r//8)); e=max(2,r//7)
        ell(im,(x-e,y-e,x+e,y+e),'merak_l'); ell(im,(x-e+1,y-e+1,x+e-1,y+e-1),'merak_eye'); px(im,int(x),int(y),'merak_g')
    if face:
        fr=max(5,r//3); ell(im,(cx-fr,cy-fr//2,cx+fr,cy+fr+fr//2),'leo'); ell(im,(cx-fr+2,cy+fr//2,cx+fr-2,cy+fr+fr//2),'leo_l')
        rect(im,cx-fr//2-1,cy,cx-fr//2+1,cy+1,'black'); rect(im,cx+fr//2-1,cy,cx+fr//2+1,cy+1,'black')
        rect(im,cx-fr//2,cy+fr,cx+fr//2,cy+fr+1,'merah'); px(im,cx,cy-fr//2+1,'gold')
        for k in(-1,1): px(im,cx+k*fr,cy+2,'spot')
def goods(im,x0,x1,y,seed=1):
    r=random.Random(seed); cols=['banana','mango','rice_y','carrot','leaf','rambutan','coco','corn','stone_l','berry']
    for x in range(x0,x1-6,9):
        ell(im,(x,y,x+7,y+5),'straw_d'); ell(im,(x+1,y-2,x+6,y+2),r.choice(cols)); px(im,x+2,y-1,'white')
def platform(im,x0,x1,y0,y1,c='stone'):
    rect(im,x0,y0,x1,y1,c); rect(im,x0,y0,x1,y0,c+'_l' if c+'_l' in PALETTE else 'stone_l'); rect(im,x0,y1-1,x1,y1,'stone_d')
def pasar_legi(t):
    im=new(128,96); d=ImageDraw.Draw(im)
    if t==1:
        rect(im,6,82,121,88,'dirt'); rect(im,6,86,121,88,'dirt_d')
        for x in range(10,120,18): bamboo_pole(im,x,52,84)
        for x0 in(8,66):
            rect(im,x0+2,70,x0+52,73,'bamboo_l'); [rect(im,x,73,x,82,'bamboo_d') for x in(x0+4,x0+50)]; goods(im,x0+4,x0+52,66,x0)
        ijuk_roof(im,2,64,30,54); ijuk_roof(im,62,126,30,54); rect(im,2,52,126,55,'bamboo')
    elif t==2:
        platform(im,4,123,84,90)
        for x in range(8,122,16): rect(im,x,50,x+2,84,'wood'); px(im,x,50,'wood_l')
        rect(im,10,68,118,71,'wood_l'); rect(im,10,71,118,72,'wood_d'); goods(im,12,118,64,7)
        tile_roof(im,0,127,24,52); rect(im,0,50,127,53,'sirap'); rect(im,48,30,80,38,'wood_d'); rect(im,49,31,79,37,'mustaka')
        for k,(x0,c) in enumerate(((8,'merah'),(46,'water'),(84,'leaf'))):
            for x in range(x0,x0+34):
                cc=c if ((x-x0)//4)%2==0 else 'putih'; rect(im,x,74,x,79,cc)
            rect(im,x0+2,80,x0+31,84,'wood'); goods(im,x0+4,x0+32,79,k+3)
        for x in(20,64,108): d.line([(x,53),(x,58)],fill=P('outline')); ell(im,(x-3,58,x+3,64),'fire_l'); px(im,x,60,'fire_w')
    else:
        platform(im,2,125,84,92)
        rect(im,6,46,121,84,'brick'); [rect(im,x+(4 if (y//4)%2 else 0),y,x+(4 if (y//4)%2 else 0),y,'brick_d') for y in range(46,84,4) for x in range(6,121,8)]
        [d.line([(6,y),(121,y)],fill=P('brick_d')) for y in range(49,84,4)]
        for x0 in range(12,116,22):
            d.rectangle([x0,58,x0+15,84],fill=P('char')); d.pieslice([x0,52,x0+15,66],180,360,fill=P('char')); goods(im,x0+1,x0+16,78,x0)
            d.arc((x0-1,51,x0+16,67),180,360,fill=P('stone_l'),width=2)
        rect(im,6,44,121,46,'stone_l')
        tile_roof(im,0,127,14,44); rect(im,40,22,88,32,'wood_d'); rect(im,41,23,87,31,'parch'); 
        for x in range(44,85,5): rect(im,x,25,x+3,29,'merah' if x<64 else 'wood_d')
    return shadow(outline(im),64,90,60,4)
def balai_megah_t(t):
    im=new(128,96); d=ImageDraw.Draw(im)
    def kentongan(x,y,big=True):
        rect(im,x,y-30,x+2,y,'wood_d'); rect(im,x+16,y-30,x+18,y,'wood_d'); rect(im,x-1,y-32,x+19,y-29,'wood')
        d.line([(x+9,y-29),(x+9,y-26)],fill=P('outline')); rect(im,x+5,y-26,x+13,y-4,'wood'); rect(im,x+5,y-26,x+6,y-4,'wood_l'); rect(im,x+8,y-22,x+10,y-8,'wood_d')
    if t==1:
        platform(im,10,96,82,88)
        for x in(14,40,66,90): rect(im,x,54,x+3,82,'wood'); px(im,x,54,'wood_l')
        d.polygon([(6,58),(22,36),(86,36),(102,58)],fill=P('sirap')); [d.line([(22-(y-36)*16/22,y),(86+(y-36)*16/22,y)],fill=P('wood_d')) for y in range(39,58,3)]
        d.line([(6,58),(102,58)],fill=P('sirap_l'),width=2); kentongan(104,86)
        rect(im,24,74,80,77,'wood_l')
    else:
        platform(im,4,123,82,90)
        for x in range(10,120,18): rect(im,x,58,x+4,82,'kayu_ukir' if t==3 else 'wood'); rect(im,x,58,x+1,82,'wood_l')
        if t==3:
            rect(im,36,62,92,82,'kayu_ukir'); [rect(im,x,64,x+1,80,'gold') for x in range(40,90,6)]; rect(im,58,68,70,82,'wood_d')
            for x in range(14,114,10): ell(im,(x,77,x+6,81),'gold_d'); ell(im,(x+1,77,x+5,79),'gold')
            rect(im,96,66,108,80,'kayu_ukir'); ell(im,(97,66,107,76),'gold_d'); ell(im,(99,68,105,74),'gold')
        else: rect(im,36,62,92,82,'wood_l'); [rect(im,x,62,x,82,'wood') for x in range(38,92,4)]; rect(im,58,68,70,82,'wood_d')
        d.polygon([(0,62),(22,40),(106,40),(127,62)],fill=P('tile_roof'))
        for y in range(43,62,3): ww=22-(y-40)*22/22; d.line([(ww,y),(127-ww,y)],fill=P('tile_roof_d'))
        d.polygon([(30,40),(46,12),(82,12),(98,40)],fill=P('tile_roof')); [d.line([(46-(y-12)*16/28,y),(82+(y-12)*16/28,y)],fill=P('tile_roof_d')) for y in range(15,40,3)]
        d.line([(46,12),(82,12)],fill=P('tile_roof_l'),width=2); d.line([(0,62),(127,62)],fill=P('tile_roof_l')); d.line([(22,40),(106,40)],fill=P('tile_roof_l'))
        rect(im,13,64,15,66,'outline'); rect(im,11,66,17,80,'wood'); rect(im,11,66,12,80,'wood_l'); rect(im,13,69,15,77,'wood_d')
        if t==3:
            for x in(46,82): d.line([(x,12),(x+(4 if x<64 else -4),4)],fill=P('mustaka'),width=2)
            [px(im,x,63,'gold') for x in range(4,124,3)]; [px(im,x,41,'gold') for x in range(24,105,3)]
            rect(im,54,28,73,35,'kayu_ukir'); rect(im,55,29,72,34,'gold')
            for x in(16,104): rect(im,x,70,x+5,73,'merah'); rect(im,x,73,x+5,76,'putih')
        else: rect(im,54,28,73,35,'wood_d')
    return shadow(outline(im),64,88,58,4)
def masjid_t(t):
    if t==3:
        im=masjid(); d=ImageDraw.Draw(im)
        b=new(128,128); db=ImageDraw.Draw(b); rect(b,0,104,3,118,'wood_d'); rect(b,22,104,25,118,'wood_d'); rect(b,0,102,25,104,'wood')
        ell(b,(3,92,22,112),'wood'); ell(b,(3,92,10,112),'kayu_ukir'); ell(b,(18,93,23,111),'leather'); ell(b,(19,95,22,109),'parch')
        [rect(b,x,93,x,111,'wood_d') for x in(8,13)]
        im.alpha_composite(outline(b)); return im
    im=new(128,128); d=ImageDraw.Draw(im)
    if t==1:
        rect(im,24,112,103,118,'stone'); rect(im,24,112,103,112,'stone_l'); rect(im,24,117,103,118,'stone_d')
        bamboo_wall(im,30,84,97,112); rect(im,56,92,70,112,'wood_d'); rect(im,57,93,69,112,'wood')
        for x in(36,80): rect(im,x,90,x+8,100,'wood_d'); rect(im,x+1,91,x+7,99,'bamboo_d')
        y=86
        for i,(w_,th) in enumerate(((44,16),(24,14))):
            d.polygon([(64-w_,y),(64-w_*0.55,y-th),(64+w_*0.55,y-th),(64+w_,y)],fill=P('ijuk'))
            for yy in range(int(y-th)+2,y,3): ww=w_*0.55+w_*0.45*(yy-(y-th))/th; d.line([(64-ww,yy),(64+ww,yy)],fill=P('ijuk_l'))
            if i==0: rect(im,48,y-th-4,80,y-th,'bamboo_l')
            y=y-th-4
        rect(im,63,y-4,64,y+4,'wood_d'); ell(im,(61,y-7,66,y-2),'mustaka')
        return shadow(outline(im),64,118,42,4)
    rect(im,14,112,113,120,'stone_l'); rect(im,14,118,113,120,'stone_d')
    rect(im,20,80,107,112,'wood'); [rect(im,x,80,x,112,'wood_d') for x in range(22,107,5)]; rect(im,20,80,107,82,'wood_l')
    for x in(34,50,76,92): rect(im,x,90,x+8,104,'wood_d'); rect(im,x+1,92,x+7,104,'leaf_d')
    rect(im,58,90,69,112,'wood_d'); rect(im,59,92,68,112,'kayu_ukir')
    yt=tumpang(im,64,82,[58,38,20],15); rect(im,63,yt-8,64,yt,'mustaka'); ell(im,(60,yt-12,67,yt-5),'mustaka')
    return shadow(outline(im),64,120,52,5)
def bendungan_t(t):
    im=new(96,64); d=ImageDraw.Draw(im)
    up='water_d' if t==4 else 'water'
    rect(im,0,4 if t==4 else 10,95,34,up); [rect(im,x,14+(x%7),x+5,14+(x%7),'water_l') for x in range(2,92,11)]
    if t==4: rect(im,0,0,95,5,'grass'); rect(im,0,4,95,5,'grass_d')
    rect(im,0,52,95,63,'water'); [rect(im,x,56+(x%5),x+4,56+(x%5),'water_l') for x in range(3,92,13)]
    if t==0:
        rect(im,0,34,95,51,'water'); [rect(im,x,40+(x%5),x+4,40+(x%5),'water_l') for x in range(5,92,12)]; return outline(im)
    if t==1:
        for x0 in range(0,96,12):
            rect(im,x0,32,x0+11,46,'stone'); [ell(im,(x0+a,32+b,x0+a+4,32+b+4),'stone_l') for a,b in((1,1),(6,3),(2,7),(7,9))]
            for x in range(x0,x0+12,4): rect(im,x,32,x,46,'bamboo_d')
            for y in(32,39,46): rect(im,x0,y,x0+11,y,'bamboo_d')
        for x in range(4,92,14): rect(im,x,46,x+5,56,'water_l'); rect(im,x+2,47,x+3,56,'foam')
    else:
        rect(im,0,34,95,44,'stone'); [rect(im,x,34+(x//10%2)*5,x+8,38+(x//10%2)*5,'stone_l') for x in range(0,96,10)]; rect(im,0,44,95,46,'stone_d')
        for x in range(10,90,16): rect(im,x,44,x+7,54,'water_l'); rect(im,x+2,46,x+5,54,'foam')
        if t>=2: rect(im,80,34,95,63,'stone_d'); rect(im,83,34,92,63,'water'); [px(im,86,y,'water_l') for y in range(36,62,4)]
        if t>=3:
            rect(im,38,18,57,34,'wood'); rect(im,38,18,39,34,'wood_d'); rect(im,56,18,57,34,'wood_d'); rect(im,40,24,55,33,'wood_l'); [rect(im,40,y,55,y,'wood_d') for y in(27,30)]
            ell(im,(42,8,53,19),'stone_d'); ell(im,(44,10,51,17),(0,0,0,0)); d.line([(47,9),(47,18)],fill=P('stone_d')); d.line([(42,13),(53,13)],fill=P('stone_d')); rect(im,46,18,48,24,'stone_d')
        if t==4:
            rect(im,0,30,95,34,'brick'); rect(im,0,30,95,30,'stone_l'); [rect(im,x,26,x,30,'wood_d') for x in range(2,96,8)]; rect(im,0,26,95,26,'wood')
    return outline(im)
def pendopo_reog_t(t):
    im=new(128,96); d=ImageDraw.Draw(im)
    if t<3:
        rect(im,14,82,113,88,'dirt'); rect(im,14,86,113,88,'dirt_d')
        for x in(18,48,78,106): bamboo_pole(im,x,52,84)
        rect(im,20,74,104,77,'bamboo_l')
        ell(im,(30,66,44,80),'wood'); ell(im,(30,66,35,80),'leather'); ell(im,(40,67,45,79),'leather')
        rect(im,56,68,72,74,'kayu_ukir'); ell(im,(58,58,70,70),'gold_d'); ell(im,(60,60,68,68),'gold')
        if t==2:
            rect(im,84,68,104,80,'kayu_ukir'); [rect(im,x,70,x+2,73,'gold') for x in range(86,103,4)]
        ijuk_roof(im,8,120,22 if t==2 else 28,54); rect(im,8,52,120,55,'bamboo')
        if t==2:
            m=new(128,96); dadak_merak(m,64,64,22); im.alpha_composite(outline(m))
    else:
        platform(im,4,123,82,90)
        for x in range(10,120,18): rect(im,x,58,x+4,82,'merah_d'); rect(im,x,58,x+1,82,'merah')
        m=new(128,96); dadak_merak(m,64,62,22); im.alpha_composite(outline(m))
        rect(im,24,72,48,80,'kayu_ukir'); [ell(im,(x,73,x+5,78),'gold') for x in range(26,46,6)]; ell(im,(84,64,100,80),'gold_d'); ell(im,(86,66,98,78),'gold'); rect(im,82,62,102,64,'kayu_ukir')
        d.polygon([(0,60),(22,38),(106,38),(127,60)],fill=P('tile_roof'))
        for y in range(41,60,3): ww=22-(y-38)*22/22; d.line([(ww,y),(127-ww,y)],fill=P('tile_roof_d'))
        d.polygon([(32,38),(48,10),(80,10),(96,38)],fill=P('tile_roof')); [d.line([(48-(y-10)*16/28,y),(80+(y-10)*16/28,y)],fill=P('tile_roof_d')) for y in range(13,38,3)]
        d.line([(48,10),(80,10)],fill=P('tile_roof_l'),width=2); d.line([(0,60),(127,60)],fill=P('gold')); d.line([(22,38),(106,38)],fill=P('gold'))
        for x in(48,80): d.line([(x,10),(x+(4 if x<64 else -4),3)],fill=P('mustaka'),width=2)
        rect(im,54,26,73,33,'merah_d'); rect(im,55,27,72,32,'gold')
    return shadow(outline(im),64,88,56,4)
RESEARCH_MON=[
 ('masjid',masjid_t,['Langgar Bambu','Masjid Kayu',"Masjid Jami'"],'masjid 128x128 (tahap 1 memakai 3x3 tengah, tahap 2-3 4x4)'),
 ('balai_megah',balai_megah_t,['Serambi & Kentongan Besar','Pendopo Joglo','Balai Megah (ukiran & gamelan)'],'balai desa megah 128x96 (4x3)'),
 ('bendungan',bendungan_t,['Bendung Bronjong Bambu','Saluran Induk','Pintu Air','Bendungan & Embung'],'bendungan & irigasi 96x64 (3x2), letakkan melintang sungai'),
 ('pendopo_reog',pendopo_reog_t,['Sanggar Latihan','Dadak Merak & Gamelan','Pendopo Agung'],'pendopo reog 128x96 (4x3)'),
 ('pasar_legi',pasar_legi,['Los Bambu','Hari Pasaran','Pasar Batu Bata'],'pasar legi 128x96 (4x3), pasar tradisional Jawa'),
]
def monuments_8b(only=None):
    for name,fn,names,note in RESEARCH_MON:
        if only and name not in only: continue
        prev=None; N=len(names)
        for t in range(1,N+1):
            fin=fn(t)
            if name=='bendungan': research_stages(fin,prev,name,t,N,names[t-1],note,flat=True,river=bendungan_t(0))
            else: research_stages(fin,prev,name,t,N,names[t-1],note)
            prev=fin

# ---------- 6. prop Agustusan ----------
def agustus_8b():
    im=new(64,128); rect(im,30,24,33,122,'wood_d'); [rect(im,30,y,33,y,'wood_l') for y in range(30,122,6)]; rect(im,24,120,39,124,'dirt_d')
    rect(im,29,22,34,24,'wood'); [px(im,29,y,'water_l') for y in(60,80,100)]; [px(im,34,y+4,'water_l') for y in(60,80,100)]
    save(shadow(outline(im),32,123,10,2),'decor/agustus/tiang_pinang.png',note='64x128 batang pinang licin tanpa hadiah (posisi sama dengan panjat_pinang.png); puncak tiang y=22, x 30-33')
    hd=new(64,32); d=ImageDraw.Draw(hd); ell(hd,(6,4,57,14),'bamboo'); ell(hd,(9,6,54,12),(0,0,0,0)) if False else None
    for x,c in((10,'cloth1'),(18,'banana'),(26,'cloth2'),(36,'leaf'),(44,'roof'),(52,'gold')):
        d.line([(x,10),(x,18)],fill=P('straw_d')); rect(hd,x-3,18,x+3,24,c); px(hd,x-2,19,'white')
    rect(hd,24,0,39,3,'merah'); rect(hd,24,3,39,6,'putih'); 
    save(outline(hd),'decor/agustus/hadiah_pinang.png',note='64x32 cincin hadiah gantung; tempel di (tiangX-0, puncak tiang y 22 → offset y -10): pada kanvas tiang_pinang paste di (0,12); lepas/ambil satu per satu dengan menyembunyikan sprite ini saat menang')
    for i,(kind,col) in enumerate((('',None),)):
        pass
    k=new(); d=ImageDraw.Draw(k); d.polygon([(8,10),(24,10),(26,28),(6,28)],fill=P('straw')); d.polygon([(8,10),(12,6),(20,6),(24,10)],fill=P('straw_l'))
    rect(k,7,12,25,13,'straw_d'); [px(k,x,y,'straw_d') for x,y in((11,18),(19,21),(14,24),(22,16))]; d.line([(12,6),(10,3)],fill=P('straw_d')); d.line([(20,6),(22,3)],fill=P('straw_d'))
    save(shadow(outline(k),16,29,9,2),'decor/agustus/karung.png',note='32x32 karung goni berdiri (prop lomba balap karung / tumpukan karung)')
    k=new(); d=ImageDraw.Draw(k); ell(k,(3,14,29,28),'straw'); ell(k,(5,15,27,22),'straw_l'); [px(k,x,y,'straw_d') for x,y in((9,19),(16,24),(22,20))]; rect(k,26,18,30,24,'straw_d')
    save(shadow(outline(k),16,28,12,2),'decor/agustus/karung_tergeletak.png',note='32x32 karung kosong tergeletak (garis start/finish)')
    sh=new(64,16)
    for f in range(2):
        t=new(32,16); d=ImageDraw.Draw(t)
        pts=[(x,8+int(round((1-f)*1.5*math.sin(x/32*2*math.pi)))) for x in range(32)]
        for x,y in pts: rect(t,x,y-1,x,y+1,'straw_d' if (x//3)%2 else 'straw'); px(t,x,y-1,'straw_l') if (x//3)%2==0 else None
        sh.paste(t,(f*32,0))
    save(sh,'decor/agustus/tambang_segmen.png',(32,16),2,'tambang tarik tambang, tile horizontal seamless (y tengah=8, tebal 3px); frame 0 kendur, 1 tegang')
    t=new(32,16); [rect(t,x,7,x,9,'straw_d' if (x//3)%2 else 'straw') for x in range(32)]; d=ImageDraw.Draw(t); d.polygon([(14,9),(18,9),(19,15),(13,15)],fill=P('merah')); rect(t,13,6,18,10,'merah_d')
    save(t,'decor/agustus/tambang_tengah.png',note='32x16 bagian tengah tambang dengan pita merah (penanda menang), sambung dengan tambang_segmen')
    g=new(); d=ImageDraw.Draw(g)
    for r_ in(12,9,6): d.ellipse([16-r_,20-r_*0.55,16+r_,20+r_*0.55],outline=P('straw_d'),width=3); d.ellipse([16-r_,20-r_*0.55,16+r_,20+r_*0.55],outline=P('straw'),width=1)
    d.line([(26,20),(30,26)],fill=P('straw_d'),width=3)
    save(shadow(outline(g),16,27,12,2),'decor/agustus/tambang_gulung.png',note='32x32 tambang tergulung (disimpan setelah dibeli sekali)')
    b=new(64,32); d=ImageDraw.Draw(b)
    for y0 in(10,18):
        rect(b,2,y0,61,y0+5,'wood'); rect(b,2,y0,61,y0,'wood_l'); rect(b,2,y0+5,61,y0+5,'wood_d')
    for x in(10,30,50): rect(b,x-3,9,x+3,24,'merah' if x!=30 else 'leather'); rect(b,x-3,15,x+3,17,'wood_d')
    save(shadow(outline(b),32,26,30,3),'decor/agustus/bakiak.png',note='64x32 bakiak (terompah panjang) 3 orang tampak atas, horizontal; kaki penduduk di x 10/30/50; untuk arah vertikal putar 90°')
    sh=new(64,64)
    for f in range(2):
        im=new(32,64); d=ImageDraw.Draw(im); rect(im,0,4,31,5,'wood_d')
        for x in(8,23):
            sw=(1 if f else -1)*(1 if x==8 else -1); d.line([(x,6),(x+sw,16)],fill=P('white'))
            ell(im,(x+sw-6,16,x+sw+6,28),'kerupuk'); [px(im,x+sw+a,22+b_,'kerupuk_d') for a,b_ in((-3,-2),(2,-3),(0,1),(-2,3),(3,2))]
        sh.paste(outline(im),(f*32,0))
    save(sh,'decor/agustus/kerupuk_gantung.png',(32,64),2,'tali dengan 2 kerupuk untuk lomba makan kerupuk, 2 frame ayun ~300ms; palang di y 4-5, kerupuk setinggi kepala penduduk (y 16-28)')
    pi=icon_draw(piala_draw); save(pi,'decor/agustus/piala.png',note='32x32 piala juara (juara umum 14 hari / papan Teladan)')
    save(to16c(pi),'icons/status/icon_piala_16.png',note='16x16 ikon piala kecil di atas kepala juara umum selama 14 hari; offset seperti Zzz (+16,-12)')
    big=new(48,64); d=ImageDraw.Draw(big); d.chord((8,2,40,40),0,180,fill=P('gold')); rect(big,8,2,40,21,'gold'); rect(big,11,4,14,20,'fire_w'); d.arc((0,6,14,24),90,270,fill=P('gold_d'),width=3); d.arc((34,6,48,24),270,90,fill=P('gold_d'),width=3)
    rect(big,21,36,27,44,'gold_d'); rect(big,12,44,36,52,'wood_d'); rect(big,10,52,38,58,'wood'); rect(big,16,46,32,50,'gold'); px(big,24,12,'white'); ell(big,(20,8,28,16),'fire_w'); ell(big,(22,10,26,14),'gold')
    save(shadow(outline(big),24,58,16,3),'decor/agustus/piala_emas_besar.png',note='48x64 piala emas besar di Balai (Desa Teladan Nasional, tingkat 4)')
# ---------- 7. kartu dilema, tunda, reaksi, ekspresi potret ----------
def dilemma_8b():
    for kind,hc,hl in(('ringan','pos_c','leaf_l'),('berat','roof','roof_l')):
        W,H=64,80; im=new(W,H); e=W-1; f=H-1
        rect(im,0,0,e,f,'outline'); rect(im,1,1,e-1,f-1,'wood_d'); rect(im,2,2,e-2,f-2,'parch'); rect(im,2,f-4,e-2,f-2,'parch_d')
        rect(im,2,2,e-2,17,hc); rect(im,2,2,e-2,3,hl); batik_band(im,2,14,e-2,17); rect(im,2,18,e-2,18,'wood_d')
        for cx,cy in((4,f-4),(e-4,f-4)): px(im,cx,cy,'gold_d')
        [im.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(e,0),(0,f),(e,f))]
        save(im,f'ui/dilemma/kartu_dilema_{kind}.png',note=f'9-slice {W}x{H}: margin atas 20 (pita judul {hc}), bawah 8, kiri/kanan 8; judul di y 4-13, isi mulai y 22')
        chip=new(8,12); rect(chip,0,0,7,11,'outline'); rect(chip,1,1,6,10,hc); rect(chip,1,1,6,2,hl)
        save(chip,f'ui/dilemma/log_tanda_{kind}.png',note=f'8x12 penanda warna di kiri baris log akibat tertunda (warna sama dengan kartu {kind})')
    def hourglass(im,d):
        rect(im,6,2,25,5,'wood'); rect(im,6,26,25,29,'wood'); rect(im,6,2,25,2,'wood_l')
        d.polygon([(9,6),(22,6),(17,15),(17,17),(22,25),(9,25),(14,17),(14,15)],fill=P('ice_l' if 'ice_l' in PALETTE else 'water_l'))
        d.polygon([(11,8),(20,8),(16,14)],fill=P('sand')); d.polygon([(10,25),(21,25),(16,20)],fill=P('sand')); rect(im,15,15,16,22,'sand_d')
        for x in(7,23): rect(im,x,5,x+1,26,'wood_d')
    hg=icon_draw(hourglass); save(hg,'ui/dilemma/icon_tunda.png',note='ikon ⏳ akibat tertunda 32x32'); save(to16c(hg),'ui/dilemma/icon_tunda_16.png',note='16x16 (di kartu dan log)')
    for n,face in(('suka','fire_l'),('cemas','water_l'),('netral','stone_l')):
        r=new(12,12); ell(r,(1,1,10,10),face); px(r,4,4,'black'); px(r,7,4,'black'); d=ImageDraw.Draw(r)
        if n=='suka': d.line([(3,7),(4,8),(7,8),(8,7)],fill=P('black'))
        elif n=='cemas': d.line([(3,8),(4,7),(5,8),(6,7),(7,8),(8,7)],fill=P('black')); px(r,9,2,'water'); px(r,9,3,'water')
        else: d.line([(4,8),(7,8)],fill=P('black'))
        save(outline(r),f'ui/dilemma/reaksi_{n}.png',note='12x12 reaksi sifat (😊 suka / 😟 cemas / netral) di samping ikon sifat _16')
    c=new(32,18); rect(c,0,0,31,17,'outline'); rect(c,1,1,30,16,'parch_d'); rect(c,1,1,30,1,'parch'); [c.putpixel(p_,(0,0,0,0)) for p_ in((0,0),(31,0),(0,17),(31,17))]
    save(c,'ui/dilemma/reaksi_chip.png',note='32x18 latar chip reaksi: ikon sifat _16 di (1,1), ikon reaksi_* 12x12 di (18,3)')
    EXPR=('netral','senang','marah','sedih','khawatir')
    for i,v in enumerate(VARS):
        skin,hair,cloth=v; base=Image.open(os.path.join(ROOT,f'ui/dilemma/portraits/portrait_villager_{i+1}.png')).convert('RGBA')
        sh=new(32*5,32)
        for k,ex in enumerate(EXPR):
            im=base.copy(); d=ImageDraw.Draw(im)
            rect(im,6,16,25,29,skin); rect(im,0,16,3,21,hair) if False else None
            for y in range(24,26): [px(im,x,y,'berry_l') for x in(6,7,24,25)]
            def eyes(h=6,pup=True):
                for x0 in(8,20):
                    rect(im,x0,24-h,x0+3,23,'black'); px(im,x0,24-h,'white'); px(im,x0+1,24-h,'white') if h>=4 else None
            if ex=='netral': eyes(); rect(im,14,27,17,27,'outline')
            elif ex=='senang':
                for x0 in(8,20): d.line([(x0,21),(x0+1,19),(x0+2,19),(x0+3,21)],fill=P('black'),width=1); d.line([(x0,22),(x0+1,20),(x0+2,20),(x0+3,22)],fill=P('black'))
                rect(im,12,26,19,27,'outline'); rect(im,13,28,18,28,'outline'); rect(im,13,27,18,27,'berry'); [px(im,x,y,'berry_l') for x in(5,6,7,8,23,24,25,26) for y in(24,25)]
            elif ex=='marah':
                for x0 in(8,20): rect(im,x0,20,x0+3,23,'black'); px(im,x0+1,21,'white')
                d.line([(7,17),(12,19)],fill=P('outline'),width=2); d.line([(24,17),(19,19)],fill=P('outline'),width=2)
                d.line([(13,28),(14,27),(17,27),(18,28)],fill=P('outline')); 
                d.line([(25,2),(30,7)],fill=P('merah'),width=2); d.line([(30,2),(25,7)],fill=P('merah'),width=2)
                for x in range(26,31): [px(im,x,y,'merah') for y in(1,)] if False else None
            elif ex=='sedih':
                eyes(5); d.line([(7,18),(11,16)],fill=P('outline'),width=1); d.line([(24,18),(20,16)],fill=P('outline'),width=1)
                d.line([(13,28),(14,27),(17,27),(18,28)],fill=P('outline')); rect(im,9,24,10,27,'water_l'); px(im,9,28,'water')
            elif ex=='khawatir':
                for x0 in(9,21): rect(im,x0,20,x0+1,22,'black')
                d.line([(7,17),(11,16)],fill=P('outline')); d.line([(24,17),(20,16)],fill=P('outline'))
                d.line([(12,28),(13,27),(14,28),(15,27),(16,28),(17,27),(18,28),(19,27)],fill=P('outline'))
                ell(im,(25,7,30,14),'water_l'); d.polygon([(27,3),(25,9),(30,9)],fill=P('water_l')); px(im,26,9,'white'); px(im,26,10,'white')
            save(im,f'ui/dilemma/portraits/portrait_villager_{i+1}_{ex}.png',note=f'potret 32x32 ekspresi {ex} (wajah sama dengan portrait_villager_{i+1})')
            sh.paste(im,(k*32,0))
        save(sh,f'ui/dilemma/portraits/portrait_villager_{i+1}_ekspresi.png',(32,32),5,'sheet ekspresi 5 frame: 0 netral, 1 senang, 2 marah, 3 sedih, 4 khawatir')

# ---------- 8. pengunjung ----------
def acc_frame(v,extra):
    def fn(dn,f,walk):
        im=villager_frame(v,dn,f,walk); oy=-((1 if f in(1,3) else 0) if walk else 0); sw=([0,1,0,-1][f] if walk else 0)
        lay=new(); extra(lay,ImageDraw.Draw(lay),dn,oy,sw); lay=outline(lay); im.alpha_composite(lay); return im
    return fn
def X_tengkulak(im,d,dn,oy,sw):
    ell(im,(4,4+oy,27,9+oy),'leather'); ell(im,(9,-1+oy,22,7+oy),'leather'); rect(im,9,4+oy,22,5+oy,'wood_d')
    if dn=='down': rect(im,19,19+oy,22,23+oy,'parch'); rect(im,19,19+oy,22,19+oy,'stone_d')
    if dn in('left','right'):
        x=6 if dn=='right' else 22; rect(im,x,17+oy,x+4,24+oy,'straw'); rect(im,x,17+oy,x+4,18+oy,'straw_d')
def X_juragan(im,d,dn,oy,sw):
    if dn!='up':
        d.arc((10,13+oy,21,22+oy),20,160,fill=P('gold'),width=1); rect(im,15,21+oy,16,22+oy,'gold_d') if dn=='down' else None
    if dn=='down': rect(im,13,16+oy,18,16+oy,'hair1'); px(im,12,17+oy,'hair1'); px(im,19,17+oy,'hair1')
    rect(im,9,24+oy,22,25+oy,'gold_d')
def X_mantri(im,d,dn,oy,sw):
    if dn=='down': rect(im,22,22+oy-sw,27,27+oy-sw,'leather'); rect(im,23,21+oy-sw,26,21+oy-sw,'wood_d'); rect(im,24,23+oy-sw,25,26+oy-sw,'white'); rect(im,23,24+oy-sw,26,25+oy-sw,'white')
    elif dn in('left','right'):
        x=17+(sw*2 if dn=='right' else -sw*2)-2; rect(im,x,22+oy,x+5,27+oy,'leather'); rect(im,x+1,21+oy,x+4,21+oy,'wood_d')
    else: rect(im,4,22+oy+sw,9,27+oy+sw,'leather')
    if dn=='down': rect(im,15,17+oy,16,24+oy,'coat_d'); px(im,12,19+oy,'stone_l'); px(im,12,20+oy,'stone_l')
def X_camat(im,d,dn,oy,sw):
    rect(im,8,1+oy,23,6+oy,'black'); ell(im,(8,-1+oy,23,4+oy),'black'); px(im,9,1+oy,'stone_d')
    if dn=='down':
        rect(im,11,18+oy,13,20+oy,'khaki_d'); rect(im,18,18+oy,20,20+oy,'khaki_d'); px(im,19,18+oy,'gold'); px(im,12,21+oy,'merah'); px(im,13,21+oy,'putih')
        rect(im,15,17+oy,16,24+oy,'khaki_d')
    rect(im,10,24+oy,21,24+oy,'black')
def X_kader(im,d,dn,oy,sw):
    k='putih'
    ell(im,(7,1+oy,24,19+oy),k); rect(im,9,14+oy,22,19+oy,k)
    if dn=='down':
        ell(im,(10,6+oy,21,17+oy),'skin2'); rect(im,12,11+oy,13,13+oy,'black'); rect(im,18,11+oy,19,13+oy,'black'); px(im,12,11+oy,'white'); px(im,18,11+oy,'white')
        px(im,11,14+oy,'berry_l'); px(im,20,14+oy,'berry_l'); rect(im,13,20+oy,18,24+oy,'white'); rect(im,14,21+oy,17,21+oy,'kader_d')
    elif dn=='right': ell(im,(15,7+oy,22,16+oy),'skin2'); rect(im,19,11+oy,20,13+oy,'black'); px(im,19,11+oy,'white')
    elif dn=='left': ell(im,(9,7+oy,16,16+oy),'skin2'); rect(im,11,11+oy,12,13+oy,'black'); px(im,12,11+oy,'white')
    else: rect(im,10,4+oy,21,5+oy,'kader_l')
VISITORS=[('tengkulak',('skin2','hair1','cloth_e1'),X_tengkulak,'tengkulak bertopi (pengepul hasil panen), tas karung kecil'),
 ('juragan',('skin1','hair_grey','batik'),X_juragan,'juragan berkalung emas, baju batik, berkumis'),
 ('mantri',('skin3','hair1','coat'),X_mantri,'mantri kesehatan, baju putih, tas obat'),
 ('pak_camat',('skin2','hair1','khaki'),X_camat,'Pak Camat berseragam khaki + peci'),
 ('kader_posyandu',('skin2','hair1','kader'),X_kader,'kader posyandu: seragam merah muda + kerudung')]
def reog_frame(dn,f,walk):
    F=64; im=new(F,F); d=ImageDraw.Draw(im); step=[0,1,0,-1][f] if walk else 0; sway=[0,1,0,-1][f] if walk else ([0,0,1,0][f])
    bob=-(1 if walk and f in(1,3) else 0)
    for i,x in enumerate((26,35)):
        st=step*(1 if i else -1)*2 if dn in('left','right') else 0; up=max(0,step*(1 if i else -1)) if dn in('down','up') else 0
        rect(im,x+st,50-up,x+3+st,60-up,'black'); [rect(im,x+st,y-up,x+3+st,y-up,'merah') for y in(52,55,58)]; rect(im,x-1+st,60-up,x+4+st,61-up,'outline')
    rect(im,24,40+bob,40,51+bob,'black'); rect(im,24,44+bob,40,45+bob,'merah'); rect(im,23,48+bob,41,50+bob,'gold')
    for x in(23,39): rect(im,x,41+bob,x+2,47+bob,'skin3')
    m=new(F,F); md=ImageDraw.Draw(m); cx=32+sway; cy=30+bob
    if dn=='down': dadak_merak(m,cx,cy,26)
    elif dn=='up':
        dadak_merak(m,cx,cy,26,face=False); md.ellipse([cx-20,cy-20,cx+20,cy+16],outline=P('wood'),width=2); md.line([(cx,cy-20),(cx,cy+12)],fill=P('wood'),width=2)
        for a in range(-60,61,30): rr=math.radians(a-90); md.line([(cx,cy+12),(cx+20*math.cos(rr),cy+16*math.sin(rr))],fill=P('wood_d'))
    else:
        s=1 if dn=='right' else -1; tmp=new(F,F); dadak_merak(tmp,32,cy,26,face=False); tmp=tmp.resize((30,F),Image.NEAREST); m.alpha_composite(tmp,(17+sway-s*5,7)); md.line([(26+sway-s*5,cy+7),(38+sway-s*5,cy+7)],fill=P('wood'),width=2)
        hx=32+s*8; ell(m,(hx-7,cy+4,hx+7,cy+18),'leo'); ell(m,(hx-4+s*3,cy+10,hx+4+s*3,cy+18),'leo_l'); rect(m,hx+s*2-1,cy+8,hx+s*2+1,cy+9,'black'); rect(m,hx+s*4-2,cy+16,hx+s*4+2,cy+17,'merah'); px(m,hx-s*3,cy+7,'spot')
    m=outline(m); out=outline(im); out.alpha_composite(m); return shadow(out,32,61,12,3)
def reog_sheet():
    sh=new(256,512)
    for r_,dn in enumerate(['down','left','right','up']):
        b=reog_frame(dn,0,False)
        for f in range(4): sh.paste(reog_frame(dn,f,False),(f*64,r_*64)); sh.paste(reog_frame(dn,f,True),(f*64,(r_+4)*64))
    return sh
def visitors():
    for n,v,x,note in VISITORS:
        save(person_sheet(acc_frame(v,x)),f'characters/visitors/{n}.png',(32,32),32,f'{note}; format villager_N: 8 baris x 4 kolom, baris 0-3 diam, 4-7 jalan (bawah,kiri,kanan,atas); kaki y≈29')
    save(reog_sheet(),'characters/visitors/reog_berjalan.png',(64,64),32,'reog berjalan (pembarong + dadak merak besar) 64x64/frame; 8 baris x 4 kolom: 0-3 diam (dadak bergoyang pelan), 4-7 jalan; arah bawah,kiri,kanan,atas; kaki di y≈61, anchor tengah-bawah (x 32)')
    sh=animal_sheet(lambda dn,f,m: quad_frame(32,dn,f,m,('fire_d','chick_w','white'),dict(body=(10,16,22,23),leg=3,head_y=10,head_w=7,head_h=6,tail='long',ear='up',snout='white',spots=[(12,17),(17,16),(19,19)],spotc='fire')),32,('idle','walk'))
    save(sh,'characters/fauna/kucing.png',(32,32),32,'kucing belang (putih-oranye) 32x32; baris 0-3 diam, 4-7 jalan; arah bawah,kiri,kanan,atas; format fauna')
    k=new(); d=ImageDraw.Draw(k); ell(k,(6,16,26,27),'chick_w'); ell(k,(9,18,16,24),'fire'); ell(k,(18,17,26,25),'chick_w'); d.polygon([(19,18),(20,14),(22,17)],fill=P('fire_d')); d.polygon([(23,17),(25,14),(26,18)],fill=P('fire_d'))
    d.line([(20,21),(22,21)],fill=P('black')); d.line([(23,21),(25,21)],fill=P('black')); d.arc((4,18,18,30),90,200,fill=P('fire'),width=2)
    save(shadow(outline(k),16,27,10,2),'characters/fauna/kucing_tidur.png',note='32x32 kucing tidur melingkar (pakai bersama icon_zzz_anim)')
    m=new(64,64); d=ImageDraw.Draw(m)
    rect(m,4,36,47,40,'wood_l'); rect(m,4,40,47,52,'kader_l'); [rect(m,x,40,x+1,52,'kader') for x in range(6,47,6)]; rect(m,6,52,8,58,'wood_d'); rect(m,43,52,45,58,'wood_d')
    rect(m,8,30,18,36,'water_l'); rect(m,9,31,17,35,'white'); rect(m,20,31,28,36,'leaf_l'); rect(m,21,32,27,32,'white'); rect(m,30,32,38,36,'fire_l'); rect(m,31,33,37,33,'white')
    d.line([(46,58),(52,8)],fill=P('wood'),width=2); d.line([(62,58),(56,8)],fill=P('wood'),width=2); rect(m,48,6,60,8,'wood_d')
    d.line([(54,8),(54,16)],fill=P('outline')); rect(m,49,16,59,19,'stone_l'); d.line([(54,19),(54,24)],fill=P('outline'))
    d.chord((47,22,61,36),0,180,fill=P('batik')); d.line([(48,29),(60,29)],fill=P('batik_l'))
    rect(m,10,14,30,26,'kader'); rect(m,11,15,29,25,'putih'); ell(m,(14,16,20,21),'kader'); ell(m,(19,16,25,21),'kader'); d.polygon([(14,19),(25,19),(19.5,24)],fill=P('kader')); rect(m,19,26,21,36,'wood_d')
    save(shadow(outline(m),30,58,28,3),'buildings/posyandu_meja.png',note='64x64 meja posyandu: taplak merah muda, buku KMS, dacin (timbangan gantung bersarung), papan tanda posyandu; kader berdiri di depan/kiri')

def stage8b():
    traits_rel_8b(); wishes(); progress_bars(); monuments_8b(); agustus_8b(); dilemma_8b(); visitors()

# ---------- TAHAP 8c: ikon padi resmi, sawah kering kemarau ----------
def stage8c():
    def padi_ikat(im,d):
        for x,lean in((9,-5),(12,-3),(15,-1),(18,1),(21,3),(24,5)):
            d.line([(16,30),(x,14)],fill=P('rice_yd'),width=2)
            d.line([(x,14),(x+lean,6),(x+lean*1.6,10)],fill=P('rice_yd'),width=1)
            for k in range(4): ell(im,(x+lean*(0.4+k*0.3)-2,5+k*2,x+lean*(0.4+k*0.3)+1,8+k*2),'rice_y')
        d.polygon([(13,18),(19,18),(21,30),(11,30)],fill=P('straw')); [d.line([(x,19),(x+(x-16)//3,30)],fill=P('straw_d')) for x in(14,16,18)]
        rect(im,11,21,21,23,'roof'); rect(im,11,21,21,21,'roof_l'); px(im,9,3,'fire_w'); px(im,23,4,'fire_w')
    im=icon_draw(padi_ikat)
    save(im,'icons/resources/icon_padi_ikat.png',note='ikon sumber daya Padi resmi 32x32 (seikat padi menguning diikat pita); format sama dengan icons/resources/icon_*.png. icon_padi.png (sementara dari Asisten Koding) TIDAK ditimpa')
    # pola retak periodik 32x32 (seamless antar tile)
    r=random.Random(77); pts=[(gx*8+r.uniform(1.5,6.5),gy*8+r.uniform(1.5,6.5)) for gx in range(4) for gy in range(4)]
    def cell(x,y):
        best=[]
        for i,(a,b) in enumerate(pts):
            dd=min(((x-a-ox)**2+(y-b-oy)**2) for ox in(-32,0,32) for oy in(-32,0,32)); best.append((dd,i))
        best.sort(); return best[0][1], best[1][0]**0.5-best[0][0]**0.5
    CR=[[cell(x+0.5,y+0.5) for x in range(32)] for y in range(32)]
    sh=new(128,128)
    for m in range(16):
        im=new(); r=random.Random(m)
        for y in range(32):
            for x in range(32):
                ci,edge=CR[y][x]
                px(im,x,y,'dirt_d' if edge<0.7 else ('dirt_l' if edge<1.6 and (x+y)%3==0 else ('sand_d' if (ci%4==0 and (x*3+y)%7==0) else 'km_dirt')))
        for _ in range(10): x,y=r.randrange(32),r.randrange(32)
        for _ in range(12): r.randrange(32); r.randrange(32)
        if not m&1: rect(im,0,0,31,3,'dirt'); rect(im,0,0,31,0,'grass'); rect(im,0,3,31,3,'dirt_d')
        if not m&4: rect(im,0,28,31,31,'dirt'); rect(im,0,28,31,28,'grass'); rect(im,0,31,31,31,'dirt_d')
        if not m&8: rect(im,0,0,3,31,'dirt'); rect(im,0,0,0,31,'grass'); rect(im,3,0,3,31,'dirt_d')
        if not m&2: rect(im,28,0,31,31,'dirt'); rect(im,28,0,28,31,'grass'); rect(im,31,0,31,31,'dirt_d')
        for _ in range(3):
            x,y=r.randrange(32),r.randrange(32)
            if im.getpixel((x,y))[:3]==PALETTE['dirt']: px(im,x,y,'grass_l')
        sh.paste(im,((m%4)*32,(m//4)*32))
    save(sh,'tiles/tropis/sawah_kering_autotile.png',(32,32),16,'sawah kering (kemarau tanpa irigasi): lumpur retak tanpa air, pematang identik; format & indeks PERSIS sawah_autotile (N1+E2+S4+W8, kolom i%4, baris i//4); retak seamless antar tile')
    sh=new(192,32)
    for st in range(6):
        im=new()
        for y in range(5,30,6):
            for x in range(5,30,6):
                if st==0: rect(im,x,y,x+1,y,'dirt_d'); px(im,x,y-1,'dirt_l')
                elif st==1: px(im,x,y,'straw_d'); px(im,x,y-1,'straw'); px(im,x+1,y-1,'straw_l')
                elif st==2: rect(im,x,y-3,x,y,'straw_d'); px(im,x+1,y-3,'straw'); px(im,x+2,y-2,'straw_l'); px(im,x-1,y-2,'straw')
                elif st==3: rect(im,x,y-4,x,y,'straw_d'); px(im,x+1,y-4,'rice_yd'); px(im,x+2,y-3,'straw'); px(im,x-1,y-2,'straw'); px(im,x+2,y-2,'leaf_d')
                elif st==4: rect(im,x,y-4,x,y,'straw_d'); px(im,x+1,y-4,'straw_l'); px(im,x+2,y-3,'straw_l'); px(im,x+2,y-2,'straw_l'); px(im,x-1,y-3,'straw')
                elif st==5: px(im,x,y,'rice_yd'); px(im,x,y-1,'straw_d')
        sh.paste(im,(st*32,0))
    save(sh,'nature/crops/crop_padi_kering.png',(32,32),6,'OVERLAY padi layu di atas sawah_kering_autotile, indeks frame sama dengan crop_padi: 0 diolah (bongkah kering), 1 bibit layu, 2 tumbuh layu, 3 bunting layu, 4 menguning hampa (merunduk, pucat), 5 dipanen (jerami)')

# =====================================================================
# TAHAP 9: memancing, kolam/tambak, jamur & bakul, pangan hutan/sawah, ikon daya tarik & pendatang
# =====================================================================
_PAL16C=[v for v in PALETTE.values() if len(v)==3]  # snapshot palet 8b/8c
def _q16(im32,cols):
    s=im32.resize((16,16),Image.BOX); p=s.load()
    for y in range(16):
        for x in range(16):
            c=p[x,y]; p[x,y]=(0,0,0,0) if c[3]<110 else min(cols,key=lambda q:sum((a-b)**2 for a,b in zip(q,c[:3])))+(255,)
    return s
PALETTE.update({'keong':(96,74,56),'keong_l':(150,120,88),'keong_mas':(212,158,72),'keong_egg':(236,118,168),
 'jamur_w':(244,236,220),'jamur_c':(206,170,128),'jamur_d':(146,104,72),'tiram':(204,200,192),'tiram_d':(150,146,140),'kuping':(116,62,52),'kuping_l':(160,96,80),
 'umbi':(148,98,62),'umbi_l':(194,148,102),'umbi_in':(236,224,196),'tambak':(104,150,138),'tambak_d':(76,116,104),'tambak_l':(150,190,176),
 'nila':(150,158,170),'nila_d':(100,108,124),'ikan_or':(232,128,60),'pisang_y':(246,214,74),'pisang_d':(196,160,40)})
def to16d(im32): return _q16(im32,[v for v in PALETTE.values() if len(v)==3])
# ---------- 1. memancing ----------
DIRV={'down':(0,1),'left':(-1,0),'right':(1,0),'up':(0,-1)}
HAND={'down':(32,40),'left':(23,39),'right':(41,39),'up':(40,36)}
def seated(v,dn):
    b=villager_frame(v,dn,0,False); b=squash(b,[25,26,27]); d=ImageDraw.Draw(b)
    if dn=='down': rect(b,11,29,14,30,'cloth_d'); rect(b,17,29,20,30,'cloth_d'); rect(b,11,31,14,31,v[0]); rect(b,17,31,20,31,v[0])
    elif dn in('left','right'):
        s=1 if dn=='right' else -1; x0=16+s*2; rect(b,min(x0,x0+s*8),28,max(x0,x0+s*8),30,'cloth_d'); rect(b,x0+s*8-(1 if s<0 else 0),28,x0+s*8+(1 if s>0 else 0),30,v[0])
    return b
def small_fish(col='nila'):
    f=new(10,6); d=ImageDraw.Draw(f); ell(f,(0,1,7,5),col); d.polygon([(7,3),(9,1),(9,5)],fill=P(col+'_d' if col+'_d' in PALETTE else 'ikan_or')); px(f,2,2,'black'); return outline(f)
def fishing_frame(v,dn,f):
    im=new(64,64); hx,hy=HAND[dn]; dx,dy=DIRV[dn]; reach=20 if dn in('down','up') else 18
    fx,fy=hx+dx*reach,hy+dy*reach+(4 if dn in('left','right') else 0)
    if dn=='up': fx,fy=32,hy-reach-2
    body=seated(v,dn)
    lay=new(64,64); d=ImageDraw.Draw(lay)
    bob=[0,0,0,1,0,0,0,0][f]
    if f==0: tip=(hx-dx*8,hy-16); line=None
    elif f==1: tip=(hx+dx*12,hy-8); line=[tip,(hx+dx*(reach//2),hy-14+dy*6),(fx,fy)]
    elif f in(2,3): tip=(hx+dx*12,hy-7); line=[tip,(fx,fy-1+bob)]
    elif f in(4,5): tip=(hx+dx*9,hy-2+(f-4)); line=[tip,(fx,fy+1)]
    elif f==6: tip=(hx+dx*3,hy-18); line=[tip,(hx+dx*8,hy-8)]
    else: tip=(hx-dx*2,hy-16); line=[tip,(hx-dx*2+(4 if dn!='left' else -4),hy-8)]
    # joran (melengkung saat strike)
    if f in(4,5): mid=((hx+tip[0])/2+dy*2,(hy+tip[1])/2-3); d.line([(hx,hy),mid,tip],fill=P('bamboo_d'),width=2)
    else: d.line([(hx,hy),tip],fill=P('bamboo_d'),width=2)
    px(lay,int(tip[0]),int(tip[1]),'bamboo_l')
    rip=new(64,64); dr=ImageDraw.Draw(rip)
    if line: d.line(line,fill=P('stone_l'))
    if f in(1,2,3): rect(lay,fx-1,fy-2+bob,fx,fy-1+bob,'merah'); rect(lay,fx-1,fy+bob,fx,fy+bob,'putih')
    if f==3: dr.ellipse([fx-4,fy-1,fx+3,fy+2],outline=P('water_l'))
    if f in(4,5):
        for a,b in((-3,-2),(2,-3),(-4,1),(3,0),(0,-4)): px(rip,fx+a*(1+(f-4)),fy+b,'foam')
        dr.ellipse([fx-5,fy-2,fx+4,fy+3],outline=P('water_l'))
    if f==5:
        ex_=20 if dn=='up' else 30; rect(lay,ex_,0,ex_+2,6,'fire_l'); rect(lay,ex_,8,ex_+2,9,'fire_l')  # tanda seru
    if f in(6,7):
        fs=small_fish('nila'); ex,ey=line[1]; lay.alpha_composite(fs,(int(ex)-5,int(ey)))
        if f==7: [px(lay,int(ex)+a,int(ey)+b,'fire_w') for a,b in((-6,-1),(6,2),(0,-4))]
    lay=outline(lay) if False else lay
    im.alpha_composite(rip)
    im.alpha_composite(body,(16,16)); im.alpha_composite(lay)
    return im
def fishing():
    for i,v in enumerate(VARS):
        sh=new(512,256)
        for r_,dn in enumerate(('down','left','right','up')):
            for f in range(8): sh.paste(fishing_frame(v,dn,f),(f*64,r_*64))
        save(sh,f'characters/villager_{i+1}_memancing.png',(64,64),32,
             'memancing duduk di tepi air, frame 64x64 (penduduk di tile tengah: offset 16,16 → tempel di tileX*32-16, tileY*32-16); baris = arah menghadap air (bawah,kiri,kanan,atas); kolom: 0-1 lempar, 2-3 tunggu (loop ~500ms), 4-5 strike (!), 6-7 tarik (ikan terangkat)')
# kolam ikan & tambak
def water_shimmer(im,x0,y0,x1,y1,f,col='water_l'):
    for y in range(y0+2,y1-1,5):
        for x in range(x0+2+((y//5+f)%3)*3,x1-3,9): rect(im,x,y,x+2,y,col)
def kolam_ikan(f,isi):
    im=new(64,64); d=ImageDraw.Draw(im)
    ell(im,(2,12,61,59),'stone'); ell(im,(5,15,58,56),'water_d'); ell(im,(7,17,56,54),'water')
    for a in range(0,360,30):
        r_=math.radians(a); x,y=31.5+28*math.cos(r_),35.5+22*math.sin(r_); ell(im,(x-3,y-2,x+3,y+2),'stone_l' if a%60 else 'stone')
    water_shimmer(im,12,22,52,50,f)
    if isi:
        for k,(x,y,c) in enumerate(((20,30,'nila'),(36,38,'ikan_or'),(28,44,'nila'),(42,26,'nila'))):
            xx=x+(2 if (f+k)%2 else 0); ell(im,(xx,y,xx+7,y+3),c+'_d' if c=='nila' else 'fire_d'); px(im,xx+8,y+1,c+'_d' if c=='nila' else 'fire_d')
        ell(im,(40,40,50,46),'leaf'); ell(im,(42,41,47,44),'leaf_l'); ell(im,(14,22,22,27),'leaf'); px(im,17,23,'blossom')
    rect(im,48,4,50,20,'bamboo_d'); d.line([(49,4),(56,2)],fill=P('bamboo_d')); 
    return shadow(outline(im),32,58,28,3)
def tambak(f,isi):
    im=new(96,64); d=ImageDraw.Draw(im)
    rect(im,0,6,95,61,'dirt'); rect(im,0,6,95,7,'grass'); rect(im,0,60,95,61,'dirt_d')
    for x0,x1 in((4,45),(50,91)):
        rect(im,x0,11,x1,56,'tambak_d'); rect(im,x0+1,12,x1-1,55,'tambak'); water_shimmer(im,x0,12,x1,55,f,'tambak_l')
        if isi:
            for k in range(3):
                xx=x0+6+k*12+((f+k)%2)*2; yy=20+k*11; ell(im,(xx,yy,xx+6,yy+2),'tambak_d'); px(im,xx+7,yy+1,'tambak_d')
    rect(im,46,9,49,58,'dirt_l'); rect(im,46,9,46,58,'dirt_d')
    rect(im,44,28,51,38,'wood'); rect(im,44,28,51,29,'wood_l'); rect(im,46,30,49,37,'wood_d')
    for x in(2,93): rect(im,x,2,x+1,10,'bamboo_d')
    rect(im,74,0,92,10,'ijuk') if False else None
    k=(f%2)
    cx,cy=70,34; d.ellipse([cx-6,cy-6,cx+6,cy+6],outline=P('wood_d'),width=1)
    for a in range(k*45,360+k*45,90): r_=math.radians(a); d.line([(cx,cy),(cx+6*math.cos(r_),cy+6*math.sin(r_))],fill=P('wood'),width=2)
    rect(im,cx-1,cy-1,cx+1,cy+1,'stone_d')
    if isi: [px(im,cx+a,cy+b,'foam') for a,b in((-8,3),(8,-2),(-7,-4),(7,5))]
    return outline(im)
def ponds():
    for name,fn,W,note in(('kolam_ikan',kolam_ikan,64,'kolam ikan batu 64x64 (2x2), ikan nila & mas + teratai; tiang bambu pakan'),
                          ('tambak',tambak,96,'tambak kecil 96x64 (3x2): 2 petak + pematang + pintu air kayu + kincir aerator (berputar)')):
        for isi in(True,False):
            sh=new(W*2,64)
            for f in range(2): sh.paste(fn(f,isi),(f*W,0))
            save(sh,f'buildings/tropis/{name}{"" if isi else "_kosong"}.png',(W,64),2,f'{note}; {"berisi ikan" if isi else "kosong (baru dibuat / habis dipanen)"}; 2 frame air ~500ms')
# ---------- 2. jamur & bakul ----------
def cap(im,cx,by,w,h,c,cd,stem='jamur_w'):
    rect(im,cx-max(1,w//4),by-h//2,cx+max(1,w//4),by,stem); ImageDraw.Draw(im).chord((cx-w,by-h,cx+w,by-h//2+h//2),180,360,fill=P(c))
    ImageDraw.Draw(im).line([(cx-w,by-h//2),(cx+w,by-h//2)],fill=P(cd)); px(im,cx-w//2,by-h+2,'white')
JAMUR={
 'kancing':lambda im,pts: [cap(im,x,y,s+2,s+3,'jamur_w','jamur_c') for x,y,s in pts],
 'payung':lambda im,pts: [cap(im,x,y,s+3,s+5,'jamur_c','jamur_d') for x,y,s in pts],
 'tiram':None,'kuping':None}
def jamur_img(kind,banyak):
    im=new(); d=ImageDraw.Draw(im)
    if kind in('tiram','kuping'):
        rect(im,4,22,27,28,'wood'); rect(im,4,22,27,23,'wood_l'); ell(im,(24,22,30,28),'wood_l'); ell(im,(25,23,29,27),'teak_bark' if 'teak_bark' in PALETTE else 'wood_d')
        spots=[(8,21),(14,20),(20,21),(11,17),(18,17),(24,20)] if banyak else [(12,21),(19,21)]
        for x,y in spots:
            if kind=='tiram': d.chord((x-4,y-4,x+4,y+3),180,360,fill=P('tiram')); d.line([(x-4,y),(x+4,y)],fill=P('tiram_d')); px(im,x-1,y-3,'white')
            else: ell(im,(x-3,y-3,x+3,y+2),'kuping'); ell(im,(x-1,y-2,x+2,y),'kuping_l')
    else:
        pts=[(9,26,3),(15,24,4),(21,27,3),(12,29,2),(25,25,2),(18,29,2)] if banyak else [(13,26,3),(19,28,2)]
        JAMUR[kind](im,sorted(pts,key=lambda p:p[1]))
        if banyak: [px(im,x,y,'leaf') for x,y in((5,29),(27,29),(7,24))]
    return shadow(outline(im),16,29,11 if banyak else 7,2)
def bakul(isi):
    im=new(); d=ImageDraw.Draw(im)
    d.polygon([(5,14),(27,14),(24,28),(8,28)],fill=P('bamboo')); ell(im,(4,11,28,17),'bamboo_d'); ell(im,(6,12,26,16),'wood_d')
    for y in range(17,28,3): d.line([(6+(y-14)*3//14,y),(26-(y-14)*3//14,y)],fill=P('bamboo_d'))
    for x in range(9,24,4): d.line([(x,15),(x+(1 if x>16 else -1),28)],fill=P('bamboo_l'))
    if isi=='jamur':
        for x,y,c in((10,12,'jamur_w'),(16,10,'jamur_c'),(22,12,'tiram'),(13,9,'jamur_c'),(19,8,'jamur_w')): d.chord((x-4,y-3,x+4,y+4),180,360,fill=P(c)); px(im,x-1,y-2,'white')
    elif isi=='buah':
        for x,y,c in((10,11,'mango'),(16,9,'rambutan'),(22,11,'mango_g'),(13,7,'pisang_y'),(19,7,'pisang_y')): ell(im,(x-3,y-3,x+3,y+3),c)
    elif isi=='ikan':
        for x,y,c in((9,10,'nila'),(15,8,'ikan_or'),(19,11,'nila')): ell(im,(x,y,x+8,y+3),c); px(im,x+9,y+1,'nila_d')
    elif isi=='umbi':
        for x,y in((10,11),(16,9),(22,11),(13,7)): ell(im,(x-4,y-2,x+4,y+3),'umbi'); px(im,x-2,y-1,'umbi_l')
    elif isi=='keong':
        for x,y in((10,11),(15,9),(21,11),(18,7)): ell(im,(x-3,y-2,x+3,y+3),'keong'); px(im,x,y,'keong_l')
    return shadow(outline(im),16,28,10,2)
def jamur_bakul():
    for kind in('kancing','payung','tiram','kuping'):
        for banyak in(True,False):
            save(jamur_img(kind,banyak),f'nature/tropis/jamur_{kind}_{"banyak" if banyak else "sedikit"}.png',note=f'jamur {kind} 32x32 overlay di kaki pohon/hutan (anchor bawah y≈29); {"kelompok banyak = musim hujan" if banyak else "1-2 buah = kemarau/mareng"}' + ('; tumbuh di batang kayu lapuk' if kind in('tiram','kuping') else ''))
    for isi in('kosong','jamur','buah','ikan','umbi','keong'):
        save(bakul(isi),f'decor/pangan/bakul_{isi}.png',note=f'prop bakul bambu 32x32 {"kosong" if isi=="kosong" else "berisi "+isi} (anchor bawah y≈28); bisa juga dipakai sebagai ikon di panel')
# ---------- 3. ikon pangan & sprite tanah ----------
def I_pisang(im,d):
    rect(im,14,2,17,8,'leaf_d')
    for k,(x,a) in enumerate(((7,-30),(12,-12),(17,6),(22,24))):
        d.arc((x-10,6,x+10,30),200+a//3,330+a//3,fill=P('pisang_d'),width=6); d.arc((x-9,7,x+9,29),205+a//3,320+a//3,fill=P('pisang_y'),width=3)
    rect(im,13,6,18,10,'pisang_d')
def I_kelapa(im,d):
    ell(im,(2,6,22,28),'coco'); ell(im,(4,8,14,18),'coco_l'); [px(im,x,y,'black') for x,y in((9,22),(12,24),(15,22))]
    ell(im,(14,14,30,30),'wood_d'); ell(im,(16,16,28,28),'white'); ell(im,(18,18,26,26),'umbi_in')
def I_mangga(im,d):
    ell(im,(5,8,27,29),'mango'); ell(im,(5,8,20,24),'mango_g'); ell(im,(9,11,15,17),'banana'); rect(im,15,3,16,9,'wood_d'); ell(im,(17,1,27,7),'leaf'); px(im,20,3,'leaf_l')
def I_jamur(im,d): cap(im,13,28,9,14,'jamur_c','jamur_d'); cap(im,22,29,5,9,'jamur_w','jamur_c')
def I_umbi(im,d):
    ell(im,(3,10,25,24),'umbi'); ell(im,(5,11,16,17),'umbi_l'); [px(im,x,y,'wood_d') for x,y in((10,19),(17,15),(20,20))]
    ell(im,(16,16,30,29),'umbi'); ell(im,(19,19,27,26),'umbi_in'); d.line([(4,12),(1,6)],fill=P('ubi_leaf'),width=2); ell(im,(0,1,7,7),'ubi_leaf')
def I_keong(im,d):
    ell(im,(2,22,28,29),'keong_l'); d.polygon([(24,24),(30,19),(28,26)],fill=P('keong_l'))
    ell(im,(6,6,24,26),'keong'); d.arc((9,9,21,23),0,300,fill=P('keong_l'),width=2); ell(im,(13,13,17,18),'keong_l'); px(im,28,18,'black'); px(im,30,17,'black')
def I_daya_tarik(im,d):
    d.polygon([(2,15),(16,3),(30,15)],fill=P('roof')); d.line([(2,15),(16,3),(30,15)],fill=P('roof_l'),width=2)
    rect(im,5,15,27,29,'wall_w'); rect(im,5,27,27,29,'wall_d')
    for ox,oy in((16,21),): ell(im,(ox-7,oy-5,ox,oy+2),'berry'); ell(im,(ox-1,oy-5,ox+6,oy+2),'berry'); d.polygon([(ox-7,oy-1),(ox+6,oy-1),(ox-0.5,oy+7)],fill=P('berry')); px(im,ox-5,oy-3,'white')
    for x,y in((27,4),(5,5)): px(im,x,y,'fire_w'); [px(im,x+a,y+b,'fire_l') for a,b in((1,0),(-1,0),(0,1),(0,-1))]
def I_pendatang(im,d):
    ell(im,(9,3,21,15),'skin2'); ell(im,(9,2,21,9),'hair1'); px(im,13,10,'black'); px(im,17,10,'black')
    rect(im,9,15,21,25,'cloth2'); rect(im,10,25,13,30,'cloth_d'); rect(im,17,25,20,30,'cloth_d')
    d.line([(20,18),(29,4)],fill=P('wood_d'),width=2); ell(im,(23,0,32,10),'batik'); px(im,26,3,'batik_l'); px(im,29,6,'batik_l')
    rect(im,4,16,8,23,'cloth2'); d.polygon([(1,12),(6,8),(6,16)],fill=P('leaf'))  # tangan melambai + panah datang
def pangan():
    for n,fn,note in(('pisang',I_pisang,'pisang (sesisir)'),('kelapa',I_kelapa,'kelapa (utuh + belahan)'),('mangga',I_mangga,'mangga'),
                     ('jamur',I_jamur,'jamur'),('umbi',I_umbi,'umbi hutan (uwi/gembili)'),('keong',I_keong,'keong sawah')):
        save(icon_draw(fn),f'icons/resources/icon_{n}.png',note=f'ikon sumber daya {note} 32x32; format sama dengan icons/resources (tanpa _16, seperti ikon resource lain)')
    for n,fn,note in(('daya_tarik',I_daya_tarik,'daya tarik desa (rumah + hati)'),('pendatang',I_pendatang,'pendatang tiba (orang membawa buntelan)')):
        im=icon_draw(fn); save(im,f'icons/status/icon_{n}.png',note=f'ikon {note} 32x32'); save(to16d(im),f'icons/status/icon_{n}_16.png',note='16x16')
    # umbi hutan di tanah
    for dug in(False,True):
        im=new(); d=ImageDraw.Draw(im)
        if not dug:
            d.line([(6,26),(12,18),(18,22),(24,14)],fill=P('ubi_leaf'),width=1)
            for x,y in((6,24),(12,17),(18,21),(24,13),(14,26),(22,25)): d.polygon([(x,y-4),(x-4,y),(x,y+3),(x+4,y)],fill=P('ubi_leaf')); px(im,x,y-1,'leaf_l')
            ell(im,(10,26,20,30),'umbi'); px(im,13,27,'umbi_l')
        else:
            ell(im,(6,20,26,30),'dirt_d'); ell(im,(8,22,24,28),'char'); [ell(im,(x-2,y-1,x+2,y+1),'dirt') for x,y in((4,22),(27,24),(25,29))]
            ell(im,(10,18,22,24),'umbi'); ell(im,(12,19,17,21),'umbi_l'); d.line([(20,19),(26,14)],fill=P('ubi_leaf'))
        save(shadow(outline(im),16,29,9,2),f'nature/tropis/umbi_hutan{"_digali" if dug else ""}.png',note='umbi hutan 32x32 di tanah: '+('bekas digali + umbi terangkat' if dug else 'sulur daun hati, umbi mengintip'))
    # keong sawah overlay (2 frame merayap) + telur keong
    sh=new(64,32)
    for f in range(2):
        im=new(); d=ImageDraw.Draw(im)
        for k,(x,y) in enumerate(((8,12),(20,22),(24,8))):
            xx=x+(1 if (f+k)%2 else 0); ell(im,(xx-3,y+2,xx+4,y+4),'keong_l'); px(im,xx+5,y+2,'keong_l'); ell(im,(xx-3,y-2,xx+2,y+3),'keong'); px(im,xx-1,y,'keong_l')
        sh.paste(outline(im),(f*32,0))
    save(sh,'characters/fauna/ambient/keong_sawah.png',(32,32),2,'overlay keong sawah 32x32 di atas tile sawah (3 keong), 2 frame merayap ~700ms; tanpa bayangan')
    im=new(); rect(im,14,10,16,30,'rice_g'); [ell(im,(x-2,y-1,x+2,y+2),'keong_egg') for x,y in((15,12),(13,15),(17,15),(15,18),(13,21),(17,20))]
    save(outline(im),'characters/fauna/ambient/telur_keong.png',note='32x32 telur keong (merah muda) di batang padi, opsional penanda hama keong')
def stage9():
    fishing(); ponds(); jamur_bakul(); pangan()

# ================= TAHAP 9b: ikon jagung & rambutan =================
def I_jagung(im,d):
    # daun kelobot kiri/kanan
    d.polygon([(16,30),(5,12),(3,4),(11,14),(15,24)],fill=P('corn_husk')); d.line([(15,28),(6,12)],fill=P('leaf_d'))
    d.polygon([(16,30),(27,12),(29,4),(21,14),(17,24)],fill=P('corn_husk')); d.line([(17,28),(26,12)],fill=P('leaf_d'))
    # tongkol
    ell(im,(10,3,22,27),'corn'); ell(im,(11,4,16,14),'straw_l')
    for y in range(6,26,3):
        for x in range(12,21,3):
            if (x-16)**2/36+(y-15)**2/144<0.85: px(im,x,y,'pisang_d')
    # rambut jagung + daun bawah
    for x,c in((14,'coco_l'),(16,'wood_d'),(18,'coco_l')): d.line([(16,4),(x,0)],fill=P(c))
    d.polygon([(16,31),(9,20),(12,19),(16,26),(20,19),(23,20)],fill=P('leaf')); px(im,11,21,'leaf_l'); px(im,21,21,'leaf_l')
def I_rambutan(im,d):
    import math
    d.line([(17,1),(16,6)],fill=P('wood_d'),width=2); d.line([(16,6),(9,10)],fill=P('wood_d')); d.line([(16,6),(23,10)],fill=P('wood_d'))
    ell(im,(18,0,28,5),'leaf'); px(im,21,2,'leaf_l')
    def ball(cx,cy,r,peeled=False):
        L=new(); dl=ImageDraw.Draw(L)
        for k in range(12):
            t=k*math.pi/6+0.2; x=round(cx+math.cos(t)*(r+1)); y=round(cy+math.sin(t)*(r+1)); px(L,x,y,'leaf_l' if k%2 else 'rambutan')
        ell(L,(cx-r,cy-r,cx+r,cy+r),'rambutan'); ell(L,(cx-r+1,cy-r+1,cx,cy),'rambutan_l')
        for k in range(6):
            t=k*math.pi/3; px(L,round(cx+math.cos(t)*(r-2)),round(cy+math.sin(t)*(r-2)),'leaf_l')
        if peeled: ell(L,(cx-r+2,cy-r+1,cx+r-2,cy+r-3),'white'); ell(L,(cx-r+3,cy-r+2,cx-1,cy-1),'frangi'); px(L,cx-1,cy-2,'water_l')
        im.alpha_composite(outline(L))
    ball(9,15,6); ball(23,15,6); ball(16,23,7,True)
def stage9b():
    save(icon_draw(I_jagung),'icons/resources/icon_jagung.png',note='ikon sumber daya jagung (tongkol + kelobot) 32x32; format sama dengan icons/resources (tanpa _16); padanan hasil nature/crops/crop_jagung.png')
    save(icon_draw(I_rambutan),'icons/resources/icon_rambutan.png',note='ikon sumber daya rambutan (3 buah, satu dikupas) 32x32; tanpa _16; padanan nature/tropis/tree_rambutan.png')

if __name__=='__main__':
    tiles(); tree(); rock(); bush(True); bush(False); fields(); villagers(); campfire(); hut(); warehouse(); well(); mine(); wooden_house(); effects(); icons()
    for o in OUT: o['stage']=1
    winter_tiles(); autotiles(); winter_trees(); crops(); villagers_work(); adv_buildings(); night()
    for o in OUT: o.setdefault('stage',2)
    stage3()
    for o in OUT: o.setdefault('stage',3)
    stage4()
    for o in OUT: o.setdefault('stage',4)
    stockpiles()
    for o in OUT: o.setdefault('stage',5)
    stage6()
    for o in OUT: o.setdefault('stage',6)
    flora(); flora_extra(); fauna(); tropical_seasons(); local_buildings()
    for o in OUT: o.setdefault('stage',7)
    stage8()
    for o in OUT: o.setdefault('stage',8)
    n8=len(OUT); stage8b()
    for o in OUT[n8:]: o['stage']=8; o['sub']='8b'
    n8=len(OUT); stage8c()
    for o in OUT[n8:]: o['stage']=8; o['sub']='8c'
    stage9()
    for o in OUT: o.setdefault('stage',9)
    n9=len(OUT); stage9b()
    for o in OUT[n9:]: o['stage']=9; o['sub']='9b'
    json.dump(dict(palette=PALETTE,files=OUT),open(os.path.join(ROOT,'manifest.json'),'w'),indent=1)
    print(len(OUT),'files')
