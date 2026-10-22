"""Create a full-view reference/implementation contact sheet for local QA."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
source = root.parent / '作品评估_20261022/design-reference/direction-paper-archive.png'
actual = root / 'qa-screenshots/portfolio-round2/desktop-hero.png'
canvas = Image.new('RGB', (1830, 810), '#eee9df')
draw = ImageDraw.Draw(canvas)
for x, label, path in [(10, 'APPROVED REFERENCE', source), (920, 'CURRENT IMPLEMENTATION', actual)]:
    draw.text((x+10, 15), label, fill='#493c34')
    picture = ImageOps.contain(Image.open(path).convert('RGB'), (900, 750))
    canvas.paste(picture, (x+(900-picture.width)//2, 45+(750-picture.height)//2))
destination = actual.parent / 'design-comparison.jpg'
canvas.save(destination, quality=90)
print(destination)
