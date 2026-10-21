"""Preview tahap 9b: ikon jagung & rambutan + aset rambutan/jagung yang sudah ada (pembanding)."""
import os
from PIL import Image, ImageDraw
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def L(p): return Image.open(os.path.join(ROOT,p)).convert('RGBA')
W,H=960,420; o=Image.new('RGBA',(W,H),(236,222,190,255)); d=ImageDraw.Draw(o)
d.text((10,6),'Tahap 9b - BARU: icon_jagung, icon_rambutan (x4)  | pembanding: icon_pisang/mangga/kelapa/fruit (x4)',fill=(60,40,30))
x=10
for n in ['icon_jagung','icon_rambutan','icon_pisang','icon_mangga','icon_kelapa','icon_fruit']:
    im=L(f'icons/resources/{n}.png').resize((128,128),Image.NEAREST); o.alpha_composite(im,(x,24)); d.text((x,154),n,fill=(60,40,30)); x+=150
d.text((10,176),'Sudah ada sebelumnya (x2): nature/tropis/tree_rambutan, _empty, seasons/tropis/{hujan,mareng,kemarau,labuh}/tree_rambutan_*, tree_mangga, crop_jagung',fill=(60,40,30))
x=10
for p in ['nature/tropis/tree_rambutan.png','nature/tropis/tree_rambutan_empty.png']+[f'seasons/tropis/{s}/tree_rambutan_{s}.png' for s in('hujan','mareng','kemarau','labuh')]+['nature/tropis/tree_mangga.png']:
    im=L(p); o.alpha_composite(im.resize((64,128),Image.NEAREST),(x,196)); x+=80
im=L('nature/crops/crop_jagung.png'); o.alpha_composite(im.resize((384,64),Image.NEAREST),(x+10,260))
d.text((10,334),'Skala 1x di atas rumput: ',fill=(60,40,30))
g=Image.new('RGBA',(W-20,60),(118,170,84,255)); o.alpha_composite(g,(10,350))
for i,p in enumerate(['icons/resources/icon_jagung.png','icons/resources/icon_rambutan.png']): o.alpha_composite(L(p),(20+i*40,364))
o.save(os.path.join(ROOT,'preview_9b.png')); print('ok')
