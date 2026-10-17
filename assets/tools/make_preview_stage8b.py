#!/usr/bin/env python3
"""preview_stage8b.png: aset tahap 8b (grid) + scene desa (monumen, bar progres, pengunjung, keinginan, Agustusan) + mock kartu dilema."""
import os, json
from PIL import Image, ImageDraw, ImageFont
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
F=ImageFont.load_default()
fs=[f['file'] for f in man['files'] if f.get('sub')=='8b' and not f['file'].endswith('_16.png') and not f['file'].endswith('_stages.png')
    and not ('/portraits/' in f['file'] and not f['file'].endswith('_ekspresi.png'))]
stg=[f['file'] for f in man['files'] if f.get('sub')=='8b' and f['file'].endswith('_stages.png')]
WW=1800; x=y=10; rowh=0; pl=[]
for f in fs+stg:
    im=L(f); s=1 if im.width>=256 or im.height>=256 else (2 if im.width>=96 or im.height>=96 else 3); im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>WW-10: x=10; y+=rowh+10; rowh=0
    pl.append((im,(x,y))); x+=im.width+10; rowh=max(rowh,im.height)
y+=rowh+20
sc=Image.new('RGBA',(640,384)); g=L('seasons/tropis/kemarau/grass_kemarau.png') if os.path.exists(os.path.join(ROOT,'seasons/tropis/kemarau/grass_kemarau.png')) else L('tiles/grass.png'); p=L('tiles/dirt.png')
for ty in range(12):
    for tx in range(20): sc.paste(p if ty in(6,7) else g,(tx*32,ty*32))
def put(f,X,Y,crop=None):  # X,Y = kiri, bawah (px)
    im=L(f); im=im.crop(crop) if crop else im; sc.alpha_composite(im,(X,Y-im.height)); return im
def nine(img,w,h,l,t,r,b):
    out=Image.new('RGBA',(w,h)); W,H=img.size
    for sx0,sx1,dx0,dx1 in((0,l,0,l),(l,W-r,l,w-r),(W-r,W,w-r,w)):
        for sy0,sy1,dy0,dy1 in((0,t,0,t),(t,H-b,t,h-b),(H-b,H,h-b,h)):
            out.paste(img.crop((sx0,sy0,sx1,sy1)).resize((dx1-dx0,dy1-dy0),Image.NEAREST),(dx0,dy0))
    return out
def bar(X,Y,W,N,k,prog):
    fr=nine(L('ui/progress/monument_bar_frame.png'),W,12,4,4,4,4); tx0,tw=4,W-8
    seg=tw/N; fill=L('ui/progress/monument_bar_fill.png'); done=L('ui/progress/monument_bar_fill_done.png')
    for xx in range(int(seg*(k-1))): fr.alpha_composite(done.crop((xx%4,0,xx%4+1,4)),(tx0+xx,4))
    for xx in range(int(seg*(k-1)),int(seg*(k-1)+seg*prog)): fr.alpha_composite(fill.crop((xx%4,0,xx%4+1,4)),(tx0+xx,4))
    fr.alpha_composite(L('ui/progress/monument_bar_fill_end.png'),(tx0+int(seg*(k-1)+seg*prog)-2,4))
    for j in range(1,N): fr.alpha_composite(L('ui/progress/monument_bar_divider.png'),(tx0+int(seg*j)-1,2))
    sc.alpha_composite(fr,(X,Y)); pip=L('ui/progress/monument_stage_pip.png')
    for j in range(N): st=2 if j<k-1 else (1 if j==k-1 else 0); sc.alpha_composite(pip.crop((st*8,0,st*8+8,8)),(X+j*9,Y-10))
    ImageDraw.Draw(sc).text((X+N*9+2,Y-12),f'Tahap {k}/{N} - {int(prog*100)}%',fill=(40,30,30,255),font=F)
put('buildings/monuments/pasar_legi_tahap2.png',8,190)
im=L('buildings/monuments/pendopo_reog_tahap3_stages.png'); put('buildings/monuments/pendopo_reog_tahap3_stages.png',150,190,(256,0,384,96)); bar(160,98,108,3,3,0.64)
put('buildings/monuments/balai_megah_tahap3.png',300,190); put('buildings/monuments/masjid_tahap2.png',460,190)
put('buildings/posyandu_meja.png',440,260); put('characters/visitors/kader_posyandu.png',420,262,(0,0,32,32))
put('characters/visitors/reog_berjalan.png',200,250,(64,192,128,256)); put('characters/visitors/pak_camat.png',272,248,(0,0,32,32)); put('characters/visitors/juragan.png',96,248,(0,32,32,64))
put('characters/visitors/tengkulak.png',60,250,(32,192,64,224)); put('characters/visitors/mantri.png',380,250,(0,64,32,96)); put('characters/fauna/kucing.png',560,250,(0,64,32,96))
put('decor/agustus/tiang_pinang.png',560,370); sc.alpha_composite(L('decor/agustus/hadiah_pinang.png'),(560,370-128+12))
for i in range(4): put('decor/agustus/tambang_segmen.png',120+i*32,330,(32,0,64,16))
put('decor/agustus/tambang_tengah.png',184,330)
for i,(v,xx,dn) in enumerate(((1,104,'right'),(2,124,'right'),(3,232,'left'),(4,252,'left'))):
    r=1 if dn=='left' else 2; put(f'characters/villager_{v}.png',xx,338,(0,r*32,32,r*32+32))
put('decor/agustus/bakiak.png',330,360); put('decor/agustus/kerupuk_gantung.png',440,360,(0,0,32,64)); put('decor/agustus/karung.png',400,360); put('decor/agustus/piala.png',500,360)
for f,xx,yy,w in(('characters/villager_1.png',20,370,'makan_rendang'),('characters/villager_3.png',290,300,'nonton_reog'),('characters/lifecycle/elder_2.png',520,300,'tabungan_haji')):
    put(f,xx,yy,(0,0,32,32)); b=L('ui/wish/wish_bubble_static.png'); b.alpha_composite(L(f'icons/wishes/wish_{w}_16.png'),(4,2)); sc.alpha_composite(b,(xx+4,yy-32-20+(1 if 'elder' in f else 0)))
ui=Image.new('RGBA',(200,250)); ui.alpha_composite(nine(L('ui/dilemma/kartu_dilema_berat.png'),200,250,8,20,8,8))
ImageDraw.Draw(ui).text((10,5),'D04 Tengkulak curang?',fill=(255,255,255,255),font=F)
pt=L('ui/dilemma/portraits/portrait_villager_2_khawatir.png'); ui.alpha_composite(pt,(18,30)); ui.alpha_composite(L('ui/dilemma/portrait_frame_48.png'),(10,22))
ui.alpha_composite(L('icons/traits/icon_kepala_desa.png'),(160,24))
for i,(t,r) in enumerate((('jujur','cemas'),('pelit','suka'),('pemarah','cemas'))):
    c=L('ui/dilemma/reaksi_chip.png'); c.alpha_composite(L(f'icons/traits/trait_{t}_16.png'),(1,1)); c.alpha_composite(L(f'ui/dilemma/reaksi_{r}.png'),(18,3)); ui.alpha_composite(c,(64+i*34,40))
ui.alpha_composite(L('ui/dilemma/icon_tunda_16.png'),(64,62)); ImageDraw.Draw(ui).text((84,64),'akibat tertunda',fill=(60,40,30,255),font=F)
for i,st in enumerate(('normal','hover','normal')): 
    ui.alpha_composite(nine(L(f'ui/dilemma/button_choice_{st}.png'),180,28,10,4,10,6),(10,90+i*34))
    ImageDraw.Draw(ui).text((24,98+i*34),['Timbang ulang bersama','Biarkan, jual cepat','Usir tengkulak'][i],fill=(40,30,20,255),font=F)
    if i==1: ui.alpha_composite(L('ui/dilemma/icon_tunda_16.png'),(168,96+i*34))
ui.alpha_composite(L('ui/dilemma/log_tanda_berat.png'),(12,200)); ImageDraw.Draw(ui).text((24,200),'Hari 31: harga naik',fill=(60,40,30,255),font=F)
pb=nine(L('ui/progress/monument_bar_frame_panel.png'),180,20,6,6,6,6); ui.alpha_composite(pb,(10,220))
out=Image.new('RGBA',(WW,y+800),BG)
for im,p_ in pl: out.alpha_composite(im,p_)
out.alpha_composite(sc.resize((1280,768),Image.NEAREST),(10,y)); out.alpha_composite(ui.resize((400,500),Image.NEAREST),(1320,y))
out.save(os.path.join(ROOT,'preview_stage8b.png')); print(out.size)
