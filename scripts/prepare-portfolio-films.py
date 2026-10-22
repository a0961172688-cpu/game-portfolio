"""Prepare distinct finished episodes for the portfolio; never modify source films."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import json, re, subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/portfolio/films'
OUT.mkdir(parents=True, exist_ok=True)
FF = r'H:\小游戏\tmp\video_analysis_deps\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe'
BASE = Path(r'B:\简历作品\博主视频剪辑')
# One finished revision per episode, excluding raw renders, test clips and reference videos.
ITEMS = [
 ('pandaku-story','pandaku','玩法实验','Pandaku · 把逻辑题做成一款游戏','商业定制开发实录，从规则、棋盘到移动端反馈。',r'C:\Users\lby38\Videos\屏幕录制\edit\Pandaku_商业游戏定制_抖音成片_v2.mp4'),
 ('jian-deng-01','jian-deng','缄灯归渡','01 · 名字被封进灯里','从一盏灯开始，走进缄灯归渡的故事。',str(BASE/'缄灯归渡系列-01/renders/缄灯归渡_开发实录01_V3_画面同步版_IndexTTS2配音成片.mp4')),
 ('jian-deng-02','jian-deng','缄灯归渡','02 · 纸马铺里的线索','纸马铺的探索、物品与机关，如何一起推进叙事。',str(BASE/'缄灯归渡系列-02/renders/缄灯归渡_开发实录02_纸马铺_画面同步版_IndexTTS2配音成片.mp4')),
 ('jian-deng-highlight','jian-deng','缄灯归渡','一盏灯，一段归途','缄灯归渡的短篇高光与作品介绍。',str(BASE/'jian-deng-highlight/木砚做游戏_第二条_缄灯归渡高光_发布版.mp4')),
 ('bainian-01','bainian','百廿列车','01 · 序章、列车与斗地主','把展厅、列车和一局小游戏，串成故事的开场。',str(BASE/'新项目进度视频-01/project/renders/新项目开发日志01_序章列车与斗地主_IndexTTS2成片.mp4')),
 ('bainian-02','bainian','百廿列车','02 · 插画叙事与史料档案','让插画、人物与史料成为可探索的叙事片段。',str(BASE/'新项目进度视频-02/project/renders/新项目开发日志02_插画叙事与史料档案_连续配音修复版.mp4')),
 ('bainian-03','bainian','百廿列车','03 · 抗战粮仓与第三节车厢','用调查和任务链，连接粮仓场景与新的列车章节。',str(BASE/'新项目进度视频-03/final-video-project/renders/新项目开发日志03_抗战粮仓与第三节车厢_IndexTTS2成片.mp4')),
 ('bainian-carriage','bainian','百廿列车','第三节车厢 · 一段新的旅程','第三节车厢的阶段开发实录，保留字幕与声音设计。',str(BASE/'屏幕录制_20260831/edit/百廿列车_第三节车厢_开发实录_字幕特效最终版.mp4')),
 ('bainian-chapter','bainian','百廿列车','第三章 · 把任务做成体验','年代里的探索、对话与小游戏，逐步走向完整章节。',str(BASE/'屏幕录制_20260904/edit/AI开发日志_第三章_成片_最终修正版.mp4')),
 ('ai-horror-scene',None,'玩法实验','AI 场景实验 · 走进恐怖空间','记录一次用 AI 辅助制作 3D 恐怖场景的尝试。',r'C:\Users\lby38\Videos\屏幕录制\edit\GPT6生成3D恐怖场景_统一解说语气_v2.mp4'),
 ('muyan-first',None,'创作手记','第一条视频 · 木砚做游戏','关于开始做游戏，也关于开始记录自己。',str(BASE/'first-video/木砚做游戏_第一条视频_成片.mp4')),
]

def probe(source):
 p = subprocess.run([FF, '-hide_banner', '-i', source], capture_output=True, encoding='utf-8', errors='replace')
 match = re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)', p.stderr)
 if not match: raise ValueError(f'Cannot probe {source}')
 h,m,s = map(float,match.groups())
 return h*3600+m*60+s

def prepare(item):
 key,project,series,title,copy,source = item
 if not Path(source).is_file(): raise FileNotFoundError(source)
 duration = probe(source)
 poster,video = OUT/f'{key}.webp',OUT/f'{key}.mp4'
 if not poster.exists():
  subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-ss',str(min(duration*.38,45)),'-i',source,'-frames:v','1','-vf','scale=960:-2','-c:v','libwebp','-quality','84',str(poster)],check=True)
 if not video.exists():
  subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-i',source,'-vf',"scale=w='min(960,iw)':h=-2",'-c:v','libx264','-preset','veryfast','-crf','29','-maxrate','550k','-bufsize','1100k','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','72k','-movflags','+faststart',str(video)],check=True)
 if video.stat().st_size >= 24*1024*1024: raise ValueError(f'{key} is too large for Pages')
 record = dict(id=key,project=project,series=series,title=title,summary=copy,cover=f'/portfolio/films/{key}.webp',video=f'/portfolio/films/{key}.mp4',duration=round(duration))
 print(json.dumps(dict(id=key,seconds=round(duration),bytes=video.stat().st_size)),flush=True)
 return record

if __name__ == '__main__':
 with ThreadPoolExecutor(max_workers=2) as pool:
  rows=list(pool.map(prepare,ITEMS))
 (ROOT/'src/portfolio-film-data.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
 (ROOT/'portfolio-film-sources.json').write_text(json.dumps([dict(id=i[0],source=i[5]) for i in ITEMS],ensure_ascii=False,indent=2),encoding='utf-8')
 print(f'Prepared {len(rows)} additional finished episodes',flush=True)
