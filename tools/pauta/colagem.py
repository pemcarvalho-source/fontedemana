#!/usr/bin/env python3
"""Chuva de cartas: cartas reais (imagens do Scryfall) entram uma depois da outra, cada vez mais rápido, até encher a tela.
Usada pela primeira vez na cena final de 22/11/2026 (Universes Beyond). Serve de fundo de uma cena "clipe" do roteiro.json,
com a voz do Paulo por cima e o título da cena por cima de tudo (o tiktok.cjs põe a caixa no terço de cima).

Uso:
  python3 tools/pauta/colagem.py <cartas.json> <saida.mp4> [segundos]
cartas.json: lista em ordem de entrada, cada item {"nome": "Cloud, Midgar Mercenary", "set": "fin"} (set opcional).
De 8 a 24 cartas. A última entra por volta de 0,15 s + soma dos intervalos (0,55 s caindo 14% a cada carta, mínimo 0,17 s).
"""
import json, os, random, subprocess, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw, ImageFilter

if len(sys.argv) < 3:
    sys.exit(__doc__)
LISTA, OUT = sys.argv[1], sys.argv[2]
TOTAL = float(sys.argv[3]) if len(sys.argv) > 3 else 10.0
W, H, FPS, CW, POP = 1080, 1920, 30, 400, 0.24
CACHE = os.path.join(os.environ.get('TMPDIR', '/tmp'), 'fdm-colagem')
os.makedirs(CACHE, exist_ok=True)
cartas = json.load(open(LISTA, encoding='utf-8'))
if not 8 <= len(cartas) <= 24:
    sys.exit('Use de 8 a 24 cartas (vieram %d).' % len(cartas))

def baixar(c):
    q = 'cards/named?exact=' + urllib.parse.quote(c['nome']) + ('&set=' + c['set'] if c.get('set') else '')
    dst = os.path.join(CACHE, urllib.parse.quote(c['nome'] + '_' + c.get('set', ''), safe='') + '.jpg')
    if os.path.exists(dst):
        return dst
    req = urllib.request.Request('https://api.scryfall.com/' + q, headers={'User-Agent': 'fontedemana/1.0', 'Accept': 'application/json'})
    d = json.load(urllib.request.urlopen(req))
    iu = d.get('image_uris') or d['card_faces'][0]['image_uris']
    urllib.request.urlretrieve(iu['large'], dst); time.sleep(0.12)
    print('carta:', d['name'], d['set'], d.get('artist'))
    return dst

random.seed(22)
pos = [(190 + c * 350 + random.randint(-40, 40), 330 + r * 320 + random.randint(-40, 40)) for r in range(5) for c in range(3)]
pos += [(365, 490), (715, 810), (365, 1130), (715, 1450), (540, 1740), (190, 1000), (890, 650), (540, 330), (890, 1290)]
idx = list(range(len(pos))); random.shuffle(idx)
t, starts = 0.15, []
for i in range(len(cartas)):
    starts.append(t); t += max(0.17, 0.55 * (0.86 ** i))

def preparar(arq, ang):
    im = Image.open(arq).convert('RGBA'); im = im.resize((CW, round(im.height * CW / im.width)), Image.LANCZOS)
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.width - 1, im.height - 1], 22, fill=255); im.putalpha(m)
    pad = 60
    sm = Image.new('L', (im.width + 2 * pad, im.height + 2 * pad), 0)
    ImageDraw.Draw(sm).rounded_rectangle([pad + 6, pad + 22, pad + im.width + 6, pad + im.height + 22], 22, fill=170)
    base = Image.new('RGBA', sm.size, (5, 5, 8, 255)); base.putalpha(sm.filter(ImageFilter.GaussianBlur(18)))
    base.alpha_composite(im, (pad, pad))
    return base.rotate(ang, resample=Image.BICUBIC, expand=True)

objs = []
for i, c in enumerate(cartas):
    x, y = pos[idx[i]]
    objs.append({'img': preparar(baixar(c), random.uniform(-14, 14)), 'x': x, 'y': y, 't': starts[i]})
bg = Image.new('RGBA', (W, H), (14, 13, 19, 255))
g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse([-300, 200, W + 300, H + 200], fill=60); g = g.filter(ImageFilter.GaussianBlur(160))
bg.alpha_composite(Image.merge('RGBA', (Image.new('L', (W, H), 70), Image.new('L', (W, H), 52), Image.new('L', (W, H), 92), g)))

def ease_back(p):
    s = 1.70158; p -= 1; return p * p * ((s + 1) * p + s) + 1

assentado, feitos = bg.copy(), set()
ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', OUT], stdin=subprocess.PIPE)
for f in range(int(TOTAL * FPS)):
    tt = f / FPS
    for j, o in enumerate(objs):
        if j not in feitos and tt >= o['t'] + POP:
            im = o['img']; assentado.alpha_composite(im, (o['x'] - im.width // 2, o['y'] - im.height // 2)); feitos.add(j)
    fr = assentado.copy()
    for j, o in enumerate(objs):
        if j in feitos or tt < o['t']:
            continue
        p = (tt - o['t']) / POP; s = 1.45 - 0.45 * ease_back(min(1, p)); a = min(1, p / 0.4)
        im = o['img'].resize((max(1, round(o['img'].width * s)), max(1, round(o['img'].height * s))), Image.BILINEAR)
        if a < 1:
            im.putalpha(im.split()[3].point(lambda v: int(v * a)))
        fr.alpha_composite(im, (o['x'] - im.width // 2, o['y'] - im.height // 2))
    ff.stdin.write(fr.tobytes())
ff.stdin.close(); ff.wait()
print('OK, %s: %d cartas, a última entra em %.1f s, vídeo de %.1f s' % (OUT, len(cartas), starts[-1] + POP, TOTAL))
