#!/usr/bin/env node
/* Conteúdo original do dia (carrossel do Instagram e post de debate do Threads).
   Uso: node tools/conteudo/original.cjs <raiz do repositório> <AAAA-MM-DD>
   Lê pauta/<data>/original/original.json, confere tamanhos, separadores, tags e moeda,
   e gera pauta/<data>/original/carrossel-01.jpg em diante com tools/extras/carrossel.cjs.
   Formato do original.json em tools/pauta/LEIA.md. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/conteudo/original.cjs <raiz> <AAAA-MM-DD>'); process.exit(2); }
const DIR = path.join(ROOT, 'pauta', DATA, 'original');
const ARQ = path.join(DIR, 'original.json');
const SEPS = [' · ', ' – ', ' — ', '—'];
const CORES = 'WUBRGAM';
const plain = s => String(s == null ? '' : s).replace(/<\/?(b|i)>/g, '');

if (!fs.existsSync(ARQ)) { console.log('ERROS:\n  não existe pauta/' + DATA + '/original/original.json'); process.exit(1); }
let o;
try { o = JSON.parse(fs.readFileSync(ARQ, 'utf8')); } catch (e) { console.log('ERROS:\n  original.json não é JSON válido: ' + e.message); process.exit(1); }
const plano = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/conteudo/plano.json'), 'utf8'));

const E = [], req = (c, m) => { if (!c) E.push(m); };
const len = (s, max, n, opc) => {
  if (opc && (s == null || s === '')) return;
  req(typeof s === 'string' && s.trim(), n + ' está vazio');
  if (typeof s === 'string') req(plain(s).length <= max, `${n} tem ${plain(s).length} caracteres (máximo ${max}): "${plain(s).slice(0, 50)}..."`);
};
const cor = (c, n) => req(typeof c === 'string' && c.length === 1 && CORES.includes(c), n + ' precisa ser uma cor entre W U B R G A M');

req(o.data === DATA, 'data precisa ser ' + DATA);
req(plano.pilares && plano.pilares[o.pilar], 'pilar precisa ser um id de tools/conteudo/plano.json (ex.: top5, dicionario)');
len(o.tema, 80, 'tema');
req(Array.isArray(o.cartas), 'cartas precisa ser lista com os nomes das cartas citadas (pode ser vazia)');
if (o.item != null) len(o.item, 80, 'item');
const c = o.carrossel || {};
const capa = c.capa || {};
cor(capa.cor, 'carrossel.capa.cor');
len(capa.chip, 22, 'capa.chip'); len(capa.kicker, 40, 'capa.kicker'); len(capa.titulo, 60, 'capa.titulo'); len(capa.sub, 150, 'capa.sub');
len(capa.credito, 80, 'capa.credito', true);
const dentro = p => fs.existsSync(path.join(ROOT, p)) && p.startsWith('pauta/' + DATA + '/');
if (capa.arte) req(dentro(capa.arte), 'capa.arte precisa existir dentro de pauta/' + DATA + '/ (ex.: pauta/' + DATA + '/tiktok/arte.jpg)');
if (capa.arte) req(capa.credito, 'capa com arte precisa de credito ("Arte: <carta>, <artista>")');
req(Array.isArray(c.cartoes) && c.cartoes.length >= 3 && c.cartoes.length <= 5, 'carrossel.cartoes precisa de 3 a 5 telas');
(c.cartoes || []).forEach((k, i) => {
  const n = `cartoes[${i}]`;
  cor(k.cor, n + '.cor'); len(k.titulo, 34, n + '.titulo'); len(k.fonte, 70, n + '.fonte');
  req(Array.isArray(k.itens) && k.itens.length >= 2 && k.itens.length <= 4, n + '.itens precisa de 2 a 4');
  (k.itens || []).forEach((x, j) => { cor(x.cor, `${n}.itens[${j}].cor`); len(x.html, 120, `${n}.itens[${j}].html`); });
  if (k.nota) { len(k.nota.rotulo, 24, n + '.nota.rotulo'); len(k.nota.texto, 95, n + '.nota.texto'); }
  len(k.fx, 110, n + '.fx', true);
  if (k.carta) req(dentro(k.carta), n + '.carta precisa existir dentro de pauta/' + DATA + '/');
  if (k.carta) req(k.itens && k.itens.length <= 2 && !k.nota, n + ': tela com carta aceita no máximo 2 itens e nenhuma nota');
});
const cta = c.cta || {};
len(cta.pergunta, 70, 'cta.pergunta'); len(cta.quando, 60, 'cta.quando'); len(cta.salvar, 70, 'cta.salvar');
len(o.legenda, 1800, 'legenda');
req(/fontedemana\.com\.br/.test(o.legenda || ''), 'a legenda precisa citar fontedemana.com.br');
req(!/Fan Content/i.test(o.legenda || ''), 'não escreva o aviso de Fan Content na legenda: a pauta acrescenta sozinha');
const th = o.threads || {};
len(th.texto, 450, 'threads.texto'); len(th.obs, 120, 'threads.obs', true);
const en = o.enquete || {};
len(en.pergunta, 80, 'enquete.pergunta');
req(Array.isArray(en.opcoes) && en.opcoes.length >= 2 && en.opcoes.length <= 4, 'enquete.opcoes precisa de 2 a 4');
(en.opcoes || []).forEach((x, j) => len(x, 25, `enquete.opcoes[${j}]`));
if (o.fx != null) len(o.fx, 160, 'fx');

const walk = (v, p, tags) => {
  if (typeof v === 'string') {
    SEPS.forEach(s => { if (v.includes(s)) E.push(`${p}: separador proibido "${s}"`); });
    (v.match(/<[^>]*>/g) || []).forEach(t => { if (!tags || !/^<\/?(b|i)>$/.test(t)) E.push(`${p}: tag não permitida ${t}${tags ? ' (use só <b> e <i>)' : ' (texto puro)'}`); });
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`, tags));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], p ? p + '.' + k : k, tags));
};
walk(c, 'carrossel', true);
walk({ tema: o.tema, legenda: o.legenda, threads: o.threads, enquete: o.enquete }, '', false);

const semFx = JSON.stringify(o, (k, v) => ['fx', 'arte', 'url', 'u'].includes(k) ? undefined : v);
if (o.fx) {
  const re = /US\$ ?\d+(?:[.,]\d+)*/g; let m;
  while ((m = re.exec(semFx))) if (!/^ ?\(R\$ ?\d/.test(semFx.slice(re.lastIndex, re.lastIndex + 8))) E.push('valor em dólar sem o real entre parênteses: ' + m[0]);
} else req(!/\(R\$ ?\d/.test(semFx), 'tem valor em reais entre parênteses mas falta fx com a nota da cotação');

if (E.length) { console.log('ERROS:\n' + E.map(e => '  ' + e).join('\n')); process.exit(1); }

/* ---------- imagens ---------- */
fs.readdirSync(DIR).filter(f => /^carrossel-\d+\.jpg$/.test(f)).forEach(f => fs.unlinkSync(path.join(DIR, f)));
const spec = path.join(DIR, '_spec.json');
fs.writeFileSync(spec, JSON.stringify(c));
const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/extras/carrossel.cjs'), spec, DIR, '--estrito'], { encoding: 'utf8', timeout: 300000 });
try { fs.unlinkSync(spec); } catch (e) {}
const saida = ((r.stdout || '') + (r.stderr || '')).trim();
if (r.status !== 0) {
  console.log('ERROS:\n  ' + (r.status === 3 ? 'texto passou da borda: ' + saida.replace(/^.*TEXTO ESTOURA/s, 'TEXTO ESTOURA') + '. Encurte os itens dessas telas (a 1 é a capa).' : 'o carrossel não foi gerado: ' + saida.slice(-500)));
  process.exit(1);
}
const imgs = fs.readdirSync(DIR).filter(f => /^carrossel-\d+\.jpg$/.test(f)).length;
console.log(`OK, original de ${DATA} (${plano.pilares[o.pilar].nome}: ${plain(o.tema)}): ${imgs} imagens em pauta/${DATA}/original/`);
