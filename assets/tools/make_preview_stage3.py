#!/usr/bin/env python3
"""preview_stage3.png: aset tahap 3 (3x; layar judul 1x) + mock UI 9-slice."""
import os, json
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BG=(196,190,184,255); man=json.load(open(os.path.join(ROOT,'manifest.json')))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
skip=('title_1280x720','logo_4x','logo_2x','title_bg','dusk_gradient','logo_icon_64')
fs=[f['file'] for f in man['files'] if f.get('stage')==3 and f['file'].endswith('.png') and not any(s in f['file'] for s in skip)]
def nine(img,w,h,m):
    out=Image.new('RGBA',(w,h)); W,H=img.size
    xs=[(0,m,0,m),(m,W-m,m,w-m),(W-m,W,w-m,w)]; ys=[(0,m,0,m),(m,H-m,m,h-m),(H-m,H,h-m,h)]
    for sx0,sx1,dx0,dx1 in xs:
        for sy0,sy1,dy0,dy1 in ys:
            out.paste(img.crop((sx0,sy0,sx1,sy1)).resize((dx1-dx0,dy1-dy0),Image.NEAREST),(dx0,dy0))
    return out
W=1800; x=y=10; rowh=0; pl=[]; ims=[]
for f in fs:
    im=L(f); s=1 if 'title_640' in f else 3; im=im.resize((im.width*s,im.height*s),Image.NEAREST)
    if x+im.width>W-10: x=10; y+=rowh+12; rowh=0
    pl.append((x,y)); ims.append(im); x+=im.width+12; rowh=max(rowh,im.height)
y+=rowh+20
# mock UI
mock=Image.new('RGBA',(300,180),(0,0,0,0))
mock.alpha_composite(L('ui/skin/tab_active.png'),(12,0)); mock.alpha_composite(L('ui/skin/tab_inactive.png'),(78,0))
mock.alpha_composite(nine(L('ui/skin/panel.png'),290,150,8),(0,23))
for i,n in enumerate(['hunger','thirst','energy','mood','health']):
    mock.alpha_composite(L(f'icons/needs/need_{n}.png'),(14,30+i*0)) if False else None
for i,(n,c,v) in enumerate([('hunger','red',.7),('thirst','blue',.4),('energy','yellow',.9),('mood','green',.6)]):
    yy=34+i*26; mock.alpha_composite(L(f'icons/needs/need_{n}.png'),(12,yy-6)); mock.alpha_composite(nine(L('ui/skin/bar_frame.png'),120,12,3),(48,yy+4))
    mock.alpha_composite(L(f'ui/skin/bar_fill_{c}.png').resize((int(116*v),8),Image.NEAREST),(50,yy+6))
for i,s in enumerate(['normal','hover','pressed','disabled']): mock.alpha_composite(nine(L(f'ui/skin/button_{s}.png'),90,24,6),(185,36+i*28))
mock.alpha_composite(nine(L('ui/skin/tooltip.png'),110,20,4),(30,145)); mock.alpha_composite(L('ui/skin/tooltip_arrow.png'),(50,164))
mock=mock.resize((900,540),Image.NEAREST)
out=Image.new('RGBA',(W,y+560),BG)
for im,p in zip(ims,pl): out.alpha_composite(im,p)
out.alpha_composite(mock,(10,y)); out.save(os.path.join(ROOT,'preview_stage3.png')); print(out.size)
