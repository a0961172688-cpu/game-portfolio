"""Export the current deployable dist without source credentials or large legacy builds."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root=Path(__file__).resolve().parents[1]
dist=root/'dist'
output=root.parent/'木砚网站_部署包.zip'
files=sorted(p for p in dist.rglob('*') if p.is_file())
if not (dist/'index.html').exists():
    raise SystemExit('Build the website first')
oversized=[p.relative_to(dist).as_posix() for p in files if p.stat().st_size>25*1024*1024]
if oversized:
    raise SystemExit(f'Files exceed Pages limit: {oversized}')
with ZipFile(output,'w',ZIP_DEFLATED,compresslevel=1) as archive:
    for path in files:
        archive.write(path,path.relative_to(dist).as_posix())
with ZipFile(output) as archive:
    assert len(archive.infolist())==len(files)
    assert all(entry.file_size==(dist/entry.filename).stat().st_size for entry in archive.infolist())
print(f'{output}: {len(files)} files, {output.stat().st_size} bytes')
