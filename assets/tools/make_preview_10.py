"""Preview tahap 10: rubah (fox) baru + monyet (sudah ada sejak tahap 7), berdampingan dengan babi hutan & serigala."""
import os
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def L(p): return Image.open(os.path.join(ROOT,p)).convert('RGBA')
S=[('characters/fauna/babi_hutan.png','babi_hutan (ref)'),('characters/fauna/monyet.png','monyet (tahap 7)'),
   ('characters/animals/wolf_grey.png','wolf_grey (ref)'),('characters/animals/fox.png','fox (BARU)')]
Z=2; CW=128*Z+24; LW=90; W=LW+CW*4; H=40+384*Z+150
o=Image.new('RGBA',(W,H),(236,222,190,255)); d=ImageDraw.Draw(o)
d.text((8,6),'Tahap 10 - 32x32/frame, 4 kolom x 12 baris (x2). Baris: diam/jalan/serang x arah bawah,kiri,kanan,atas',fill=(60,40,30))
names=['diam']*4+['jalan']*4+['serang']*4; dirs=['bawah','kiri','kanan','atas']*3
for r in range(12): d.text((6,40+r*32*Z+26),f'{r:2d} {names[r]} {dirs[r]}',fill=(60,40,30))
for i,(p,lab) in enumerate(S):
    x=LW+i*CW; d.text((x,24),lab,fill=(140,40,30) if 'BARU' in lab else (60,40,30))
    o.alpha_composite(Image.new('RGBA',(128*Z,384*Z),(118,170,84,255)),(x,40))
    o.alpha_composite(L(p).resize((128*Z,384*Z),Image.NEAREST),(x,40))
y=40+384*Z+10; d.text((8,y),'Skala 1x (jalan ke kanan, frame 0-3) dan berdampingan di rumput:',fill=(60,40,30))
g=Image.new('RGBA',(W-16,110),(118,170,84,255)); o.alpha_composite(g,(8,y+16))
for i,(p,_) in enumerate(S):
    sh=L(p)
    for f in range(4): o.alpha_composite(sh.crop((f*32,6*32,f*32+32,7*32)),(20+i*170+f*36,y+28))
for i,(p,_) in enumerate(S): o.alpha_composite(L(p).crop((0,0,32,32)),(20+i*170+60,y+72))
o.save(os.path.join(ROOT,'preview_10.png')); print('ok')
