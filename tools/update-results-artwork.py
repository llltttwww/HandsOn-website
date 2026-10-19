"""Update the retained homepage artwork from the verified manuscript results."""
import argparse
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--manuscript', type=Path, required=True)
parser.add_argument('--revision', required=True)
parser.add_argument('--font', type=Path, required=True)
args = parser.parse_args()
site = Path(__file__).resolve().parents[1]
assets = site / 'dist/assets'
results_path = args.manuscript / 'data/gpt6_results_20261019.json'
comparison_path = args.manuscript / 'data/gpt6_comparisons_20261019.json'
results = json.loads(results_path.read_text())
comparison = json.loads(comparison_path.read_text())
assert results['suites']['All']['trials'] == 660
assert results['suites']['All']['successes'] == 29
names = [('openwam', 'OpenWAM'), ('fastwam', 'FastWAM'), ('pi05', 'π₀.₅'),
         ('dm05', 'DM0.5'), ('lingbot', 'LingBot-VLA'), ('hy', 'HY-Embodied'),
         ('motus', 'Motus'), ('spatial', 'Spatial Forcing')]
rows = []
for key, name in names:
    row = comparison['trained']['main']['board'][key]
    rows.append((name, row['sr'], row['lo'], row['hi']))
lo, hi = comparison['gpt6_uncertainty']['task_and_episode_95_percent']
rows.append(('GPT-6 (move_eef)', results['suites']['Core-50']['sr_percent'], lo, hi))

hero = Image.open(assets / 'handson-overview.jpg').convert('RGB')
scale = hero.width / 1200
assert abs(hero.height / scale - 1040) < 2
draw = ImageDraw.Draw(hero)
ink, teal, orange = '#183449', '#4198AC', '#ED8D5A'
draw.rectangle((650*scale, 632*scale, hero.width, hero.height), fill='white')

def text(x, y, value, size, fill=ink, anchor='lt'):
    draw.text((x*scale, y*scale), value,
              font=ImageFont.truetype(str(args.font), round(size*scale)),
              fill=fill, anchor=anchor)

text(660, 638, 'Main results', 21)
text(670, 675, 'Core-50 success (%)', 17)
x0, unit = 840, 7.1
for tick in [0, 10, 20, 30, 40]:
    x = (x0 + tick*unit)*scale
    draw.line((x, 707*scale, x, 962*scale), fill='#E3E9EC', width=max(1, round(scale)))
    text(x0 + tick*unit, 976, str(tick), 13, '#526572', 'mt')
for i, (name, value, low, high) in enumerate(rows):
    y = 720 + 28*i
    draw.rectangle((x0*scale, (y-7)*scale, (x0+value*unit)*scale, (y+7)*scale),
                   fill=orange if i == 8 else teal)
    draw.line(((x0+low*unit)*scale, y*scale, (x0+high*unit)*scale, y*scale),
              fill=ink, width=max(1, round(1.2*scale)))
    for endpoint in [low, high]:
        x = (x0 + endpoint*unit)*scale
        draw.line((x, (y-4)*scale, x, (y+4)*scale), fill=ink,
                  width=max(1, round(1.2*scale)))
    text(828, y, name, 13.5, anchor='rm')
    text(1172, y, f'{value:.1f}', 14, anchor='rm')
text(660, 1007, '95% bootstrap CI · Trials/task: trained 100, GPT-6 10.', 10.5)
text(660, 1023, 'Observation and interaction budgets differ; see the paper.', 10.5)
hero.save(assets / 'handson-overview.jpg', quality=96, optimize=True)
for width in [1200, 2400]:
    hero.resize((width, round(hero.height*width/hero.width)), Image.Resampling.LANCZOS).save(
        assets / f'handson-overview-{width}.webp', quality=94, method=6)

sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
receipt = {
    'manuscript_revision': args.revision,
    'data_sha256': sha(results_path),
    'comparison_sha256': sha(comparison_path),
    'chart_scope': 'Core-50 task-and-episode bootstrap intervals for eight trained checkpoints and GPT-6',
    'preserved_artwork': 'Retained tall composition, robot/asset artwork, and environment montage',
    'video_assets_modified': False,
    'hero_sha256': sha(assets / 'handson-overview.jpg'),
}
(site / 'tools/results-source.json').write_text(json.dumps(receipt, indent=2)+'\n')
html = site / 'dist/index.html'
content = html.read_text()
for name in ['handson-overview.jpg', 'handson-overview-1200.webp', 'handson-overview-2400.webp']:
    content = re.sub(re.escape(name) + r'\?v=[a-f0-9]+', name+'?v='+sha(assets/name)[:12], content)
figure = Image.open(assets / 'gpt6-results.png')
content = re.sub(r'(alt="GPT-6 success by task family[^"]*" width=")\d+(" height=")\d+',
                 lambda m: m[1]+str(figure.width)+m[2]+str(figure.height), content)
html.write_text(content)
print(json.dumps(receipt, indent=2))
