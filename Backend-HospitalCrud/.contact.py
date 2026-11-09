from PIL import Image,ImageOps,ImageDraw
import glob,os
files=sorted(glob.glob('.srs_final_render/page-*.png'))
for b in range(0,20,4):
 ims=[]
 for f in files[b:b+4]:
  im=Image.open(f).convert('RGB'); im.thumbnail((525,742)); ims.append((f,im.copy()))
 canvas=Image.new('RGB',(1090,1510),'#dfe5e9'); d=ImageDraw.Draw(canvas)
 for i,(f,im) in enumerate(ims):
  x=15+(i%2)*545; y=15+(i//2)*750
  canvas.paste(im,(x,y)); d.text((x+5,y+im.height+2),os.path.basename(f),fill='#12324a')
 canvas.save(f'.srs_final_render/contact-{b//4+1}.jpg',quality=90)
