#!/usr/bin/env python3
"""preview_8c.png: ikon padi (resmi vs sementara) + petak sawah 4x3 basah vs kering dengan overlay padi."""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
def field(tile,crop,stages):
    W,H=4,3; im=Image.new('RGBA',(W*32+64,H*32+64)); g=L('seasons/tropis/kemarau/grass_kemarau.png') if 'kering' in tile else L('tiles/grass.png')
    for y in range(H+2):
        for x in range(W+2): im.paste(g,(x*32,y*32))
    at=L(tile); cr=L(crop)
    for y in range(H):
        for x in range(W):
            m=(1 if y>0 else 0)+(2 if x<W-1 else 0)+(4 if y<H-1 else 0)+(8 if x>0 else 0)
            im.alpha_composite(at.crop(((m%4)*32,(m//4)*32,(m%4)*32+32,(m//4)*32+32)),(32+x*32,32+y*32))
            st=stages[(x+y*W)%len(stages)]; im.alpha_composite(cr.crop((st*32,0,st*32+32,32)),(32+x*32,32+y*32))
    return im
a=field('tiles/tropis/sawah_autotile.png','nature/crops/crop_padi.png',[0,1,2,3,4,5]); b=field('tiles/tropis/sawah_kering_autotile.png','nature/crops/crop_padi_kering.png',[0,1,2,3,4,5])
out=Image.new('RGBA',(a.width*2+20+90,a.height),(196,190,184,255)); out.alpha_composite(a,(0,0)); out.alpha_composite(b,(a.width+10,0))
out.alpha_composite(L('icons/resources/icon_padi_ikat.png'),(a.width*2+30,20)); out.alpha_composite(L('icons/resources/icon_padi.png'),(a.width*2+30,70))
out=out.resize((out.width*3,out.height*3),Image.NEAREST); d=ImageDraw.Draw(out); F=ImageFont.load_default()
for t,x,y in(('sawah basah + crop_padi 0-5',8,4),('sawah_kering + crop_padi_kering 0-5',a.width*3+38,4),('icon_padi_ikat (baru)',a.width*6+70,165),('icon_padi (sementara)',a.width*6+70,315)): d.text((x,y),t,fill=(255,255,255,255),font=F)
out.save(os.path.join(ROOT,'preview_8c.png')); print(out.size)
