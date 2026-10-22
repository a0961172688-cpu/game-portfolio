"""Refresh the licensed Noto Serif SC subset after portfolio copy changes."""
from pathlib import Path
import re, urllib.parse, urllib.request, subprocess, tempfile, os
ROOT=Path(__file__).resolve().parents[1]
files=['Portfolio.tsx','PortfolioExtras.tsx','portfolio-data.ts','portfolio-film-data.json']
text=''.join((ROOT/'src'/p).read_text(encoding='utf-8') for p in files)
characters=''.join(sorted(set(c for c in text if c.isprintable())))
url='https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;800&display=swap&text='+urllib.parse.quote(characters)
headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'}
def read_url(url):
    try:
        return urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=25).read()
    except (OSError, urllib.error.URLError):
        with tempfile.NamedTemporaryFile(delete=False) as target:
            name=target.name
        try:
            subprocess.run(['curl.exe' if os.name=='nt' else 'curl','--fail','--silent','--show-error','--location','--retry','2','--max-time','60','--user-agent',headers['User-Agent'],'--output',name,url],check=True)
            return Path(name).read_bytes()
        finally:
            Path(name).unlink(missing_ok=True)
css=read_url(url).decode()
font_url=re.search(r'url\((https[^)]+)\)',css).group(1)
data=read_url(font_url)
if data[:4] != b'wOF2': raise ValueError('Expected WOFF2 font')
(ROOT/'public/portfolio/serif-chinese.woff2').write_bytes(data)
print(f'Updated font: {len(characters)} characters, {len(data)} bytes')
