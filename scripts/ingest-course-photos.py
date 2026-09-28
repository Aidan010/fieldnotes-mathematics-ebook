import sys,json,subprocess,time,os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
# Install pillow-heif in the Python environment before ingesting source photos.
from pillow_heif import register_heif_opener
from PIL import Image,ImageOps
register_heif_opener()
root=Path(__file__).resolve().parents[1];source=Path(os.environ.get('FIELDNOTES_SOURCE_DIR',str(root.parent)));out=root/'public/scans';qa=root/'verification/units1-10';ocr=qa/'ocr';previews=qa/'previews'
for d in [out,ocr,previews]:d.mkdir(parents=True,exist_ok=True)
existing=json.loads((root/'src/photos.json').read_text());records={(r['chapter'],r['spread']):r for r in existing} if '--sample' in sys.argv else {}
tasks=[]
for unit in range(1,11):
 spread=0
 for raw,path in enumerate(sorted((source/f'Unit {unit}').glob('*.HEIC')),1):
  if unit==8 and path.name=='IMG_9580.HEIC':continue
  spread+=1;tasks.append((unit,spread,path,raw))
if '--sample' in sys.argv:tasks=[t for t in tasks if t[0]==3 and t[1] in [1,2,3]]
def process(task):
 unit,spread,path,raw=task;asset=out/f'chapter{unit}-spread{spread}.webp';preview=previews/f'{unit}-{spread}.jpg';dest=ocr/f'{unit}-{raw}.json'
 if not asset.exists():
  im=ImageOps.exif_transpose(Image.open(path)).convert('RGB');im.thumbnail((4000,4000));im.save(asset,'WEBP',quality=88,method=5)
 else:im=Image.open(asset).convert('RGB')
 w,h=im.size
 if '--skip-ocr' not in sys.argv and not dest.exists():
  im.thumbnail((2400,2400));im.save(preview,'JPEG',quality=90)
  subprocess.run([os.environ.get('FIELDNOTES_OCR','fieldnotes-ocr'),str(preview),str(dest)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 result={'chapter':unit,'spread':spread,'source':path.name,'asset':'/scans/'+asset.name,'width':w,'height':h}
 if unit==8 and spread==1:result['alternateSources']=['IMG_9580.HEIC']
 return result
with ThreadPoolExecutor(max_workers=3) as pool:
 for i,f in enumerate(as_completed([pool.submit(process,t) for t in tasks]),1):
  r=f.result();records[(r['chapter'],r['spread'])]=r
  if i%5==0 or i==len(tasks):print(f'{i}/{len(tasks)} photos processed',flush=True)
  (qa/'photos-working.json').write_text(json.dumps(sorted(records.values(),key=lambda r:(r['chapter'],r['spread'])),indent=2))
if '--sample' not in sys.argv:(root/'src/photos.json').write_text(json.dumps(sorted(records.values(),key=lambda r:(r['chapter'],r['spread'])),indent=2))
print('Done',flush=True)
