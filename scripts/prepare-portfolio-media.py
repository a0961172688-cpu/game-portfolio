from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess, json
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/portfolio'
OUT.mkdir(parents=True,exist_ok=True)
FF=r'H:\小游戏\tmp\video_analysis_deps\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
ITEMS=[
 ('pandaku',r'C:\Users\lby38\Videos\屏幕录制\屏幕录制 2026-10-22 211108.mp4',50,480),
 ('bainian',r'B:\简历作品\edit\sau-history-leadership-video\renders\川农校史互动项目_领导汇报版.mp4',29,960),
 ('rain-night',r'C:\Users\lby38\Videos\屏幕录制\屏幕录制 2026-10-21 222344.mp4',29,960),
 ('dead-frame',r'C:\Users\lby38\Videos\屏幕录制\edit\GPT6复刻武士零_激动配音无黑屏版_v2.mp4',35,960),
 ('jian-deng',r'B:\简历作品\博主视频剪辑\缄灯归渡系列-03\renders\缄灯归渡_开发实录03_无声戏台与灯楼_画面同步版_IndexTTS2配音成片.mp4',77,960),
 ('dark-knight',r'B:\简历作品\博主视频剪辑\黑暗骑士战斗展示-01\FINAL\黑暗骑士_战斗展示_最终成片.mp4',20,960),
 ('water-park',r'B:\简历作品\博主视频剪辑\水上乐园系统展示-01\renders\水上乐园_开发实录_画面同步修正版_纸马铺同款特效_IndexTTS2成片.mp4',66,960),
 ('company-war',r'B:\简历作品\公司战争\演示视频.mp4',32,960),
 ('sanxingdui',r'B:\简历作品\三星堆展馆\三星堆1 2026.01.22 - 08.36.05.07.mp4',20,960),
 ('vr-museum',r'B:\简历作品\VR博物馆\演示视频.mp4',20,960),
 ('data-roam',r'B:\简历作品\数据漫游\演示视频.mp4',30,960),
 ('horror',r'B:\简历作品\恐怖游戏\演示视频.mp4',40,960),
 ('plane',r'B:\简历作品\飞机大战\演示视频.mp4',30,960),
]
def prepare(item):
 key,source,t,width=item
 poster=OUT/f'{key}.webp';video=OUT/f'{key}.mp4'
 if not poster.exists():
  subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-ss',str(t),'-i',source,'-frames:v','1','-vf','scale=1280:-2','-c:v','libwebp','-quality','86',str(poster)],check=True)
 if not video.exists():
  subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',source,'-vf',f'scale={width}:-2','-c:v','libx264','-preset','fast','-crf','29','-maxrate','650k','-bufsize','1300k','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','80k','-movflags','+faststart',str(video)],check=True)
 if video.stat().st_size>=24*1024*1024:raise ValueError(f'{key} exceeds Pages file limit')
 return {'id':key,'source':source,'poster':poster.name,'video':video.name,'bytes':video.stat().st_size}
with ThreadPoolExecutor(max_workers=2) as pool:
 results=list(pool.map(prepare,ITEMS))
for key,source in [('hero-bainian',r'B:\简历作品\作品评估_20261022\design-reference\bainian-game.jpg'),('hero-jiandeng',r'B:\简历作品\作品评估_20261022\design-reference\jiandeng-game.jpg')]:
 im=Image.open(source);im.thumbnail((1600,1000));im.save(OUT/f'{key}.webp',quality=88)
paper=OUT/'paper-botanical.png'
if paper.exists():
 im=Image.open(paper);im.save(OUT/'paper-botanical.webp',quality=85)
(ROOT/'portfolio-media-sources.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(results,ensure_ascii=False,indent=2))
