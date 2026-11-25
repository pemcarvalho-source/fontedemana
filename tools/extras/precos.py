#!/usr/bin/env python3
"""Fotografia de preços de uma lista de cartas no Scryfall (preço do TCGplayer, em dólar), guardada com a data.
Serve para peças que comparam o preço antes e depois de um acontecimento (ex.: a rotação do Standard de 29/1/2027),
sem depender de histórico que o shell não consegue ler. Cada execução acrescenta uma fotografia ao arquivo.

Uso:
  python3 tools/extras/precos.py <arquivo.json> [AAAA-MM-DD]
O arquivo tem "cartas": [{"nome": ..., "set": ...}] (a impressão exata que importa) e ganha "fotos": {data: {carta: {...}}}.
A data padrão é hoje (horário de Brasília). Rodar de novo no mesmo dia substitui a fotografia do dia.
"""
import datetime, json, sys, time, urllib.parse, urllib.request

if len(sys.argv) < 2:
    sys.exit(__doc__)
ARQ = sys.argv[1]
DATA = sys.argv[2] if len(sys.argv) > 2 else (datetime.datetime.utcnow() - datetime.timedelta(hours=3)).strftime('%Y-%m-%d')
doc = json.load(open(ARQ, encoding='utf-8'))
foto = {}
for c in doc['cartas']:
    q = 'cards/named?exact=' + urllib.parse.quote(c['nome']) + ('&set=' + c['set'] if c.get('set') else '')
    req = urllib.request.Request('https://api.scryfall.com/' + q, headers={'User-Agent': 'fontedemana/1.0', 'Accept': 'application/json'})
    d = json.load(urllib.request.urlopen(req)); time.sleep(0.12)
    p = d.get('prices', {})
    foto[c['nome']] = {'set': d['set'], 'numero': d['collector_number'], 'usd': p.get('usd'), 'usd_foil': p.get('usd_foil'),
                       'edhrec_rank': d.get('edhrec_rank'), 'scryfall': d.get('scryfall_uri', '').split('?')[0]}
    print(f"{c['nome']:28} {d['set']:4} US$ {p.get('usd')}  (EDHREC #{d.get('edhrec_rank')})")
doc.setdefault('fotos', {})[DATA] = foto
doc['fonte'] = 'Scryfall (preço do TCGplayer em dólar, da impressão indicada), lido no dia de cada fotografia'
json.dump(doc, open(ARQ, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(ARQ, 'a', encoding='utf-8').write('\n')
print(f'OK, fotografia de {DATA} com {len(foto)} cartas em {ARQ}')
