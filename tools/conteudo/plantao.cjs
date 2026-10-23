#!/usr/bin/env node
/* Plantão da Fonte de Mana: cobertura no mesmo dia de um anúncio grande com data marcada
   (lista de precon, banimento, produto), para ser o primeiro a contar.
   Uso:
     node tools/conteudo/plantao.cjs <raiz> <AAAA-MM-DD> --qual          o plantão marcado para o dia (plano.json > plantao.eventos)
     node tools/conteudo/plantao.cjs <raiz> <AAAA-MM-DD> [--hora HH:MM]  confere pauta/<data>/plantao/plantao.json, gera as imagens
                                                                          e põe os avisos plantao-* na pauta do dia (HH:MM = hora do
                                                                          primeiro post; sem ela, agora + 5 min, no fuso de São Paulo)
   Passo a passo e formato do plantao.json em tools/conteudo/PLANTAO.md. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
const QUAL = process.argv.includes('--qual');
const iH = process.argv.indexOf('--hora');
const HORA = iH > 0 ? process.argv[iH + 1] : null;
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA) || (HORA != null && !/^\d{2}:\d{2}$/.test(HORA))) { console.error('Uso: node tools/conteudo/plantao.cjs <raiz> <AAAA-MM-DD> [--qual] [--hora HH:MM]'); process.exit(2); }
const SITE = 'https://fontedemana.com.br';
const DIR = path.join(ROOT, 'pauta', DATA, 'plantao');
const ARQ = path.join(DIR, 'plantao.json');
const PAUTA = path.join(ROOT, 'pauta', DATA, 'pauta.json');
const DISCLAIMER = 'Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.';
const SEPS = [' · ', ' – ', ' — ', '—'];
const CORES = 'WUBRGAM';
const TIPOS = ['lista', 'ban', 'produto', 'evento'];
const plain = s => String(s == null ? '' : s).replace(/<\/?(b|i)>/g, '');
const corta = (s, n) => { s = plain(s).trim(); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };
const json = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const plano = json(path.join(ROOT, 'tools/conteudo/plano.json')) || {};
const P = plano.plantao || {};
const eventos = (P.eventos || []).filter(e => e.dia === DATA);

/* ---------- --qual: o que está marcado para o dia ---------- */
if (QUAL) {
  if (!eventos.length) { console.log('SEM PLANTÃO: nada marcado para ' + DATA + ' em tools/conteudo/plano.json > plantao.eventos.'); process.exit(1); }
  const feito = json(ARQ);
  eventos.forEach(e => {
    console.log(`PLANTÃO de ${DATA}: ${e.id} (${e.tipo})`);
    console.log('Evento: ' + e.evento);
    console.log(`Buscar: "${e.busca}"` + ((e.dominios || []).length ? ' com allowed_domains ' + JSON.stringify(e.dominios) : ''));
    console.log('Está no ar quando: ' + e.confirma);
    console.log(`Primeira busca às ${e.hora}; tentar a cada 20 minutos até ${e.ate}.`);
    if (e.serie) console.log('Série: ' + e.serie + ' (use no chip da capa)');
    if (e.angulo) console.log('Ângulo: ' + e.angulo);
    if (feito && feito.evento === e.id) console.log('JÁ FEITO: pauta/' + DATA + '/plantao/plantao.json já é deste evento. Só refaça se o Paulo pedir.');
  });
  const modelo = (P.tipos || {})[eventos[0].tipo];
  if (modelo) console.log('Molde do tipo ' + eventos[0].tipo + ': ' + modelo);
  process.exit(0);
}

/* ---------- conferir o plantao.json ---------- */
if (!fs.existsSync(ARQ)) { console.log('ERROS:\n  não existe pauta/' + DATA + '/plantao/plantao.json'); process.exit(1); }
const o = json(ARQ);
if (!o) { console.log('ERROS:\n  plantao.json não é JSON válido'); process.exit(1); }
const E = [], req = (c, m) => { if (!c) E.push(m); };
const len = (s, max, n, opc) => {
  if (opc && (s == null || s === '')) return;
  req(typeof s === 'string' && s.trim(), n + ' está vazio');
  if (typeof s === 'string') req(plain(s).length <= max, `${n} tem ${plain(s).length} caracteres (máximo ${max}): "${plain(s).slice(0, 50)}..."`);
};
const cor = (c, n) => req(typeof c === 'string' && c.length === 1 && CORES.includes(c), n + ' precisa ser uma cor entre W U B R G A M');
const dentro = p => typeof p === 'string' && p.startsWith('pauta/' + DATA + '/plantao/') && fs.existsSync(path.join(ROOT, p));

req(o.data === DATA, 'data precisa ser ' + DATA);
req(o.evento === 'avulso' || eventos.some(e => e.id === o.evento), 'evento precisa ser o id de um plantão de ' + DATA + ' em plano.json > plantao.eventos' + (eventos.length ? ' (' + eventos.map(e => e.id).join(', ') + ')' : '') + ', ou "avulso" quando o Paulo pediu na conversa');
req(TIPOS.includes(o.tipo), 'tipo precisa ser um de: ' + TIPOS.join(', '));
len(o.tema, 80, 'tema');
const f = o.fonte || {};
len(f.nome, 60, 'fonte.nome'); req(/^https:\/\//.test(f.url || ''), 'fonte.url precisa ser o link https da fonte primária que confirmou o anúncio');
req(Array.isArray(o.cartas), 'cartas precisa ser lista com os nomes das cartas citadas (pode ser vazia)');
const c = o.carrossel || {};
const capa = c.capa || {};
cor(capa.cor, 'carrossel.capa.cor');
len(capa.chip, 22, 'capa.chip'); len(capa.kicker, 40, 'capa.kicker'); len(capa.titulo, 60, 'capa.titulo'); len(capa.sub, 150, 'capa.sub');
len(capa.credito, 80, 'capa.credito', true);
if (capa.arte) { req(dentro(capa.arte), 'capa.arte precisa existir dentro de pauta/' + DATA + '/plantao/'); req(capa.credito, 'capa com arte precisa de credito ("Arte: <carta>, <artista>")'); }
req(Array.isArray(c.cartoes) && c.cartoes.length >= 2 && c.cartoes.length <= 4, 'carrossel.cartoes precisa de 2 a 4 telas (plantão é carrossel curto)');
(c.cartoes || []).forEach((k, i) => {
  const n = `cartoes[${i}]`;
  cor(k.cor, n + '.cor'); len(k.titulo, 34, n + '.titulo'); len(k.fonte, 70, n + '.fonte');
  req(Array.isArray(k.itens) && k.itens.length >= (k.carta ? 1 : 2) && k.itens.length <= (k.carta ? 2 : 4), n + '.itens precisa de 2 a 4 (com carta, 1 ou 2)');
  (k.itens || []).forEach((x, j) => { cor(x.cor, `${n}.itens[${j}].cor`); len(x.html, 120, `${n}.itens[${j}].html`); });
  if (k.nota) { req(!k.carta, n + ': tela com carta não leva nota'); len(k.nota.rotulo, 24, n + '.nota.rotulo'); len(k.nota.texto, 95, n + '.nota.texto'); }
  len(k.fx, 110, n + '.fx', true);
  if (k.carta) req(dentro(k.carta), n + '.carta precisa existir dentro de pauta/' + DATA + '/plantao/');
  req(!k.barras, n + ': plantão não usa tela com barras');
});
const cta = c.cta || {};
len(cta.pergunta, 70, 'cta.pergunta'); len(cta.quando, 60, 'cta.quando'); len(cta.salvar, 70, 'cta.salvar');
len(o.legenda, 1800, 'legenda');
req(/fontedemana\.com\.br/.test(o.legenda || ''), 'a legenda precisa citar fontedemana.com.br');
req(!/Fan Content/i.test(o.legenda || ''), 'não escreva o aviso de Fan Content na legenda: o script acrescenta');
const nTags = ((o.legenda || '').match(/(^|[ \t\n])#[\p{L}\p{N}_]+/gu) || []).length;
const maxTags = plano.legenda && plano.legenda.desde && DATA >= plano.legenda.desde ? plano.legenda.hashtags : null;
if (maxTags != null) req(nTags <= maxTags, `a legenda tem ${nTags} hashtags (máximo ${maxTags}: 1 do assunto e #commander e #mtg)`);
const th = o.threads || {};
len(th.texto, 450, 'threads.texto');
req(/fontedemana\.com\.br/.test(th.texto || ''), 'threads.texto precisa citar fontedemana.com.br');
const en = o.enquete || {};
len(en.pergunta, 80, 'enquete.pergunta');
req(Array.isArray(en.opcoes) && en.opcoes.length >= 2 && en.opcoes.length <= 4, 'enquete.opcoes precisa de 2 a 4');
(en.opcoes || []).forEach((x, j) => len(x, 25, `enquete.opcoes[${j}]`));
if (o.fx != null) len(o.fx, 160, 'fx');

// separadores, tags e isca de engajamento (o Instagram não recomenda peça que pede comentário combinado, marcação ou envio)
const walk = (v, p, tags) => {
  if (typeof v === 'string') {
    SEPS.forEach(s => { if (v.includes(s)) E.push(`${p}: separador proibido "${s}"`); });
    (v.match(/<[^>]*>/g) || []).forEach(t => { if (!tags || !/^<\/?(b|i)>$/.test(t)) E.push(`${p}: tag não permitida ${t}${tags ? ' (use só <b> e <i>)' : ' (texto puro)'}`); });
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`, tags));
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], p ? p + '.' + k : k, tags));
};
walk(c, 'carrossel', true);
walk({ tema: o.tema, legenda: o.legenda, threads: o.threads, enquete: o.enquete }, '', false);
const ISCA = plano.isca && plano.isca.desde && DATA >= plano.isca.desde ? (plano.isca.padroes || []).map(x => new RegExp(x, 'im')) : [];
const juntar = v => typeof v === 'string' ? v : Array.isArray(v) ? v.map(juntar).join('\n') : v && typeof v === 'object' ? Object.values(v).map(juntar).join('\n') : '';
const textos = juntar([c, o.legenda, th.texto]);
ISCA.forEach(re => { const m = textos.match(re); if (m) E.push(`isca de engajamento: "${textos.slice(m.index, m.index + m[0].length + 25).replace(/^[.!?:\s]+/, '').split('\n')[0]}". Troque por uma pergunta aberta sobre o anúncio (tools/conteudo/FORMATOS.md, Pergunta aberta)`); });

// moeda: dólar com o real entre parênteses e a nota da cotação
const semFx = JSON.stringify(o, (k, v) => ['fx', 'arte', 'url', 'carta'].includes(k) ? undefined : v);
if (o.fx) {
  const re = /US\$ ?\d+(?:[.,]\d+)*/g; let m;
  while ((m = re.exec(semFx))) if (!/^ ?\(R\$ ?\d/.test(semFx.slice(re.lastIndex, re.lastIndex + 8))) E.push('valor em dólar sem o real entre parênteses: ' + m[0]);
  req((o.legenda || '').includes(plain(o.fx).replace(/\.$/, '')), 'com valor convertido, a legenda termina com a nota da cotação (o texto de fx)');
} else req(!/\(R\$ ?\d/.test(semFx), 'tem valor em reais entre parênteses mas falta fx com a nota da cotação');

if (E.length) { console.log('ERROS:\n' + E.map(e => '  ' + e).join('\n')); process.exit(1); }

/* ---------- imagens ---------- */
fs.readdirSync(DIR).filter(x => /^carrossel-\d+\.jpg$/.test(x)).forEach(x => fs.unlinkSync(path.join(DIR, x)));
const spec = path.join(DIR, '_spec.json');
fs.writeFileSync(spec, JSON.stringify(c));
const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/extras/carrossel.cjs'), spec, DIR, '--estrito'], { encoding: 'utf8', timeout: 300000 });
try { fs.unlinkSync(spec); } catch (e) {}
const saida = ((r.stdout || '') + (r.stderr || '')).trim();
if (r.status !== 0) {
  console.log('ERROS:\n  ' + (r.status === 3 ? 'texto passou da borda: ' + saida.replace(/^.*TEXTO ESTOURA/s, 'TEXTO ESTOURA') + '. Encurte os itens dessas telas (a 1 é a capa).' : 'o carrossel não foi gerado: ' + saida.slice(-500)));
  process.exit(1);
}
const imgs = fs.readdirSync(DIR).filter(x => /^carrossel-\d+\.jpg$/.test(x)).sort();

/* ---------- avisos na pauta do dia ---------- */
const agoraSP = () => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date()); return p; };
const min = h => +h.slice(0, 2) * 60 + +h.slice(3, 5);
const hh = m => { m = Math.min(Math.max(m, 0), 23 * 60 + 55); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const base = HORA ? min(HORA) : Math.ceil((min(agoraSP()) + 5) / 5) * 5;
const url = f => SITE + '/pauta/' + DATA + '/plantao/' + f;
const arquivos = imgs.map((x, i) => ({ nome: `Imagem ${i + 1} de ${imgs.length}`, url: url(x) }));
const leg = o.legenda.trim() + '\n\n' + DISCLAIMER;
const topico = plano.threads && plano.threads.topico ? plano.threads.topico : 'MTG';
const ops = en.opcoes.map(x => '"' + x + '"').join(', ').replace(/, ([^,]*)$/, ' e $1');
const novos = [
  { id: 'plantao-threads', hora: hh(base), rede: 'Threads', titulo: corta('Plantão: ' + o.tema, 70),
    oQue: corta(`Saiu agora: ${plain(o.tema)}. O anúncio num post só, com a capa do carrossel, para ser o primeiro a contar.`, 400),
    arquivos: [arquivos[0]], textos: [{ rotulo: 'Post', texto: th.texto.trim() + '\n\n' + DISCLAIMER }],
    passos: ['No Threads, cole o Post e anexe a capa.', `Marque o tópico ${topico} e publique.`, 'Responda quem comentar na primeira hora.'] },
  { id: 'plantao-feed', hora: hh(base + 5), rede: 'Instagram feed', titulo: corta('Plantão no feed: ' + o.tema, 70),
    oQue: corta(`Carrossel curto do plantão, com ${imgs.length} imagens, sobre o anúncio de agora. Fonte: ${f.nome}.`, 400),
    arquivos, textos: [{ rotulo: 'Legenda', texto: leg }],
    passos: ['No Instagram, toque em + e escolha Post.', `Selecione as ${imgs.length} imagens na ordem, da 1 à ${imgs.length}.`, 'Toque em Adicionar música e escolha uma em alta que combine com o tema.', 'Cole a Legenda e publique.'] },
  { id: 'plantao-tiktok', hora: hh(base + 10), rede: 'TikTok', titulo: 'Plantão no TikTok: as mesmas imagens no modo foto',
    oQue: 'As imagens do carrossel no modo foto do TikTok, com som em alta. Chega a quem não segue sem precisar de vídeo.',
    arquivos, textos: [{ rotulo: 'Legenda', texto: leg }],
    passos: ['No TikTok, toque em + e escolha Foto (ou Carregar e marque as imagens).', `Selecione as ${imgs.length} imagens na ordem.`, 'Escolha um som em alta da biblioteca do TikTok, com volume baixo.', 'Cole a Legenda e publique.'] },
  { id: 'plantao-stories', hora: hh(base + 30), rede: 'Instagram Stories', titulo: 'Plantão nos Stories: o post com enquete',
    oQue: 'O carrossel do plantão nos Stories, com enquete, para os seguidores verem o anúncio.',
    passos: ['Abra o post do plantão no feed, toque no avião de papel e escolha Adicionar post ao story.', corta(`Adicione o sticker de Enquete: ${plain(en.pergunta)} com ${ops}.`, 220), 'Publique.'] }
];
let pauta = json(PAUTA);
if (!pauta) pauta = { data: DATA, fx: null, avisos: [] };
pauta.avisos = (pauta.avisos || []).filter(a => !/^plantao-/.test(a.id)).concat(novos);
if (o.fx && !pauta.fx) pauta.fx = o.fx;
fs.writeFileSync(PAUTA, JSON.stringify(pauta, null, 2) + '\n');
const rp = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/pauta/pauta.cjs'), ROOT, DATA], { encoding: 'utf8' });
if (rp.status !== 0) { console.log('ERROS:\n  a pauta não fechou: ' + ((rp.stdout || '') + (rp.stderr || '')).trim().slice(-600)); process.exit(1); }

console.log(`OK, plantão de ${DATA} (${plain(o.tema)}): ${imgs.length} imagens em pauta/${DATA}/plantao/`);
console.log('---');
console.log([`Plantão (${DATA}): ${plain(o.tema)}`, `Fonte: ${f.nome}, ${f.url}`]
  .concat(novos.map(a => `${a.hora} ${a.rede}: ${a.titulo}`))
  .concat([`Página: ${SITE}/pauta/${DATA}/#plantao-threads`]).join('\n'));
