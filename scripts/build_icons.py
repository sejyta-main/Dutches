#!/usr/bin/env python3
"""Render crisp iPad and PWA icons for Rekenreis; requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

ROOT=Path(__file__).resolve().parent.parent
TARGET=ROOT/'icons'
TARGET.mkdir(parents=True,exist_ok=True)
S=1024

def font(size,bold=True):
    names=['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'] if bold else []
    for name in names:
        try: return ImageFont.truetype(name,size)
        except OSError: pass
    return ImageFont.load_default()

def render(size,path):
    # Supersampling gives the icon smooth, sharply defined edges.
    img=Image.new('RGBA',(S,S),(0,0,0,0))
    d=ImageDraw.Draw(img)
    for y in range(S):
        u=y/(S-1)
        d.line([(0,y),(S,y)],fill=(int(77+73*u),int(151-55*u),int(244-7*u),255))
    d.rounded_rectangle((8,8,S-8,S-8),radius=210,outline=(250,249,255,180),width=12)
    d.ellipse((746,30,1000,284),fill=(255,255,255,28))
    d.ellipse((-90,820,250,1160),fill=(255,255,255,18))
    # Fox ears behind the face
    d.polygon([(169,420),(198,176),(422,345)],fill='#a7462f')
    d.polygon([(855,420),(825,176),(606,345)],fill='#a7462f')
    d.polygon([(217,344),(225,238),(339,354)],fill='#ffd1cb')
    d.polygon([(807,344),(795,238),(682,354)],fill='#ffd1cb')
    # Rounded face
    d.ellipse((147,300,876,870),fill='#b95f42')
    d.ellipse((152,287,868,849),fill='#ff994f')
    d.ellipse((169,324,852,835),fill='#ffa34e')
    # White cheeks and muzzle
    d.ellipse((174,601,520,859),fill='#fff0d8')
    d.ellipse((502,601,848,859),fill='#fff0d8')
    d.ellipse((357,671,668,884),fill='#fff4df')
    # Friendly eyes and highlights
    d.ellipse((336,508,406,608),fill='#293054')
    d.ellipse((615,508,685,608),fill='#293054')
    d.ellipse((350,519,375,551),fill='white')
    d.ellipse((629,519,654,551),fill='white')
    # Rosy cheeks
    d.ellipse((237,628,321,686),fill='#f88776')
    d.ellipse((700,628,784,686),fill='#f88776')
    # Nose and smile
    d.ellipse((459,674,565,740),fill='#633955')
    d.arc((397,714,516,812),start=5,end=160,fill='#633955',width=13)
    d.arc((511,714,628,812),start=20,end=175,fill='#633955',width=13)
    # Math medallion
    d.ellipse((724,736,1018,1025),fill='#fff9ce')
    d.ellipse((733,744,1010,1017),fill='#ffca55')
    d.ellipse((748,759,994,1000),outline='#e59c3c',width=14)
    text='1K'
    f=font(114)
    bb=d.textbbox((0,0),text,font=f)
    d.text((874-(bb[2]-bb[0])/2,866-(bb[3]-bb[1])/2-bb[1]),text,font=f,fill='#59418e')
    # star sparkle
    points=[]
    for k in range(10):
        angle=-math.pi/2+k*math.pi/5
        radius=71 if k%2==0 else 30
        points.append((168+radius*math.cos(angle),146+radius*math.sin(angle)))
    d.polygon(points,fill='#fff27c')
    img.convert('RGB').resize((size,size),Image.Resampling.LANCZOS).save(path,optimize=True)

for s in (192,512):
    render(s,TARGET/f'icon-{s}.png')
render(180,TARGET/'apple-touch-icon.png')
print('Created 192px, 512px and Apple touch icons in',TARGET)
