#!/usr/bin/env python3
"""preview_stockpiles.png: stockpile 4 sumber daya x 5 tingkat (4x), musim normal & dingin, di atas tile rumput/salju."""
import os
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
L=lambda p: Image.open(os.path.join(ROOT,p)).convert('RGBA')
S=4; res=['kayu','batu','makanan','air']
out=Image.new('RGBA',(10+5*(32*S+8)+20+5*(32*S+8),10+4*(32*S+8)),(196,190,184,255))
for wi,(suf,tile) in enumerate((('','tiles/grass.png'),('_winter','tiles/winter/snow_grass.png'))):
    t=L(tile)
    for r,n in enumerate(res):
        for lv in range(5):
            c=t.copy(); c.alpha_composite(L(f'stockpiles/stockpile_{n}_{lv}{suf}.png'))
            out.alpha_composite(c.resize((32*S,32*S),Image.NEAREST),(10+wi*(5*(32*S+8)+20)+lv*(32*S+8),10+r*(32*S+8)))
out.save(os.path.join(ROOT,'preview_stockpiles.png')); print(out.size)
