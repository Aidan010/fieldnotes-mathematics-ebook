import sys,json
sys.path.insert(0,'/private/tmp/ebook-image-tools')
from pillow_heif import register_heif_opener
from PIL import Image,ImageOps
from pathlib import Path
register_heif_opener()
root=Path(__file__).resolve().parents[1]
out=root/'public'/'scans'; out.mkdir(parents=True,exist_ok=True)
manifest=[]
for ch in [1,2]:
 for i,f in enumerate(sorted((root.parent/f'Unit {ch}').glob('*.HEIC'))):
  im=ImageOps.exif_transpose(Image.open(f)).convert('RGB')
  if ch==2:
   angle=0 if f.stem=='IMG_9338' else 180 if f.stem=='IMG_9362' else 90
   if angle: im=im.rotate(angle,expand=True)
  im.thumbnail((4000,4000))
  target=f'chapter{ch}-spread{i+1}.webp'; im.save(out/target,'WEBP',quality=88,method=5)
  manifest.append({'chapter':ch,'spread':i+1,'source':f.name,'asset':'/scans/'+target,'width':im.width,'height':im.height})
  print(f'{ch}/{i+1}: {target}',flush=True)
(root/'src'/'photos.json').write_text(json.dumps(manifest,indent=2))
