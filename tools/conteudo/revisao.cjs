#!/usr/bin/env node
/* Revisão semanal das redes da Fonte de Mana: as contas, a partir dos dados do Metricool.
   Uso: node tools/conteudo/revisao.cjs <raiz do repositório> <AAAA-MM-DD de hoje> <pasta dos dados>
   A pasta dos dados fica FORA do repositório (ex.: /tmp/fdm/revisao). Nela vão as respostas do Metricool salvas como
   vieram ({"rows": [...]}), com as colunas na ordem de tools/conteudo/REVISAO.md, e o anuncios.json (o registro de
   campanhas copiado do documento privado). O script escreve relatorio.md e relatorio.json na mesma pasta.
   O repositório é público: nenhum número da revisão é gravado nele.
   Janelas: seguidores de segunda a domingo da semana passada; peças publicadas de HOJE-10 a HOJE-4 (todas com 72 h ou
   mais no ar). A base de comparação é a média das duas janelas anteriores, medidas agora. */
'use strict';
const fs = require('fs'), path = require('path');

const ROOT = path.resolve(process.argv[2] || '.');
const HOJE = process.argv[3] || '';
const DIR = path.resolve(process.argv[4] || '/tmp/fdm/revisao');
if (!/^\d{4}-\d{2}-\d{2}$/.test(HOJE)) { console.error('Uso: node tools/conteudo/revisao.cjs <raiz> <AAAA-MM-DD> <pasta dos dados>'); process.exit(2); }
if (DIR.startsWith(ROOT + path.sep)) { console.log('ERROS:\n  a pasta dos dados não pode ficar dentro do repositório (ele é público); use /tmp/fdm/revisao'); process.exit(1); }

const json = p => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; } };
const plano = json(path.join(ROOT, 'tools/conteudo/plano.json')) || {};
const metas = plano.metas || {};
const soma = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const num = v => (v == null || v === '' || isNaN(+v)) ? null : +v;
const ddmm = d => `${+d.slice(8, 10)}/${d.slice(5, 7)}`;
const mediana = a => { const b = a.filter(x => x != null).sort((x, y) => x - y); if (!b.length) return null; const m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const media = a => { const b = a.filter(x => x != null); return b.length ? b.reduce((s, x) => s + x, 0) / b.length : null; };
const fmt = (v, c = 0) => v == null ? 'sem dado' : (Math.round(v * 10 ** c) / 10 ** c).toFixed(c).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const avisos = [];

/* ---------- dados do Metricool ---------- */
const COLS = {
  'tiktok-posts': ['quando', 'duracao', 'views', 'curtidas', 'comentarios', 'compart', 'completo', 'mediaAssistida', 'paraVoce', 'busca'],
  'tiktok-evolucao': ['seguidores', 'novos', 'data'],
  'instagram-posts': ['quando', 'tipo', 'views', 'alcance', 'curtidas', 'comentarios', 'salvos', 'compart', 'seguiram'],
  'instagram-reels': ['quando', 'views', 'alcance', 'curtidas', 'comentarios', 'salvos', 'compart', 'mediaAssistida', 'passou3s'],
  'instagram-evolucao': ['seguidores', 'views', 'alcance', 'data'],
  'threads-posts': ['quando', 'tipo', 'views', 'curtidas', 'respostas', 'reposts', 'citacoes', 'compart'],
  'threads-evolucao': ['seguidores', 'views', 'data']
};
function ler(nome) {
  const j = json(path.join(DIR, nome + '.json'));
  if (!j || !Array.isArray(j.rows)) { avisos.push(`faltou ${nome}.json (ou veio sem "rows"): essa parte ficou sem dado`); return []; }
  const cols = COLS[nome];
  if (j.rows.some(r => !Array.isArray(r) || r.length !== cols.length)) avisos.push(`${nome}.json tem linhas com número de colunas diferente de ${cols.length}: confira a ordem das métricas em REVISAO.md`);
  return j.rows.filter(Array.isArray).map(r => { const o = {}; cols.forEach((c, i) => { o[c] = r[i]; }); return o; });
}
// o Metricool devolve a hora em UTC (AAAAMMDDhhmmss); São Paulo é UTC-3
const sp = q => { const s = String(q || ''); const t = Date.UTC(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8), +s.slice(8, 10) || 0, +s.slice(10, 12) || 0) - 3 * 3600e3; const d = new Date(t).toISOString(); return { data: d.slice(0, 10), hora: d.slice(11, 16) }; };

/* ---------- janelas ---------- */
const JS = [0, 1, 2].map(k => [soma(HOJE, -7 * (k + 1)), soma(HOJE, -7 * k - 1)]);   // seguidores: seg a dom
const JP = [0, 1, 2].map(k => [soma(HOJE, -10 - 7 * k), soma(HOJE, -4 - 7 * k)]);   // peças: 72 h ou mais no ar
const dentro = (d, [a, b]) => d >= a && d <= b;
const faixa = ([a, b]) => `${+a.slice(8, 10)}${a.slice(5, 7) === b.slice(5, 7) ? '' : '/' + a.slice(5, 7)} a ${ddmm(b)}`;

/* ---------- anúncios (registro do documento privado) ---------- */
const anJ = json(path.join(DIR, 'anuncios.json'));
if (!Array.isArray(anJ)) avisos.push('sem anuncios.json: tudo foi tratado como orgânico');
const anuncios = (Array.isArray(anJ) ? anJ : []).filter(a => a && /^\d{4}-\d{2}-\d{2}$/.test(a.inicio || '')).map(a => Object.assign({}, a, { rede: String(a.rede || '').toLowerCase(), formato: String(a.formato || '').toLowerCase(), dias: Math.max(1, +a.dias || 1), gasto: num(a.gasto) }));
anuncios.forEach(a => { a.fim = soma(a.inicio, a.dias - 1); });
const pagoNoDia = (rede, d) => anuncios.some(a => a.rede === rede && d >= a.inicio && d <= a.fim);

/* ---------- peças ---------- */
const pauta = d => json(path.join(ROOT, 'pauta', d, 'pauta.json'));
const roteiro = d => json(path.join(ROOT, 'pauta', d, 'tiktok', 'roteiro.json'));
const original = d => json(path.join(ROOT, 'pauta', d, 'original', 'original.json'));
const nomePilar = id => (((plano.pilares || {})[id] || {}).nome) || id || '';
const pecas = [];
ler('tiktok-posts').forEach(r => pecas.push(Object.assign(sp(r.quando), { rede: 'tiktok', formato: 'video', views: num(r.views), curtidas: num(r.curtidas), comentarios: num(r.comentarios), compart: num(r.compart), completo: num(r.completo) })));
ler('instagram-posts').forEach(r => pecas.push(Object.assign(sp(r.quando), { rede: 'instagram', formato: /CAROUSEL/i.test(r.tipo || '') ? 'carrossel' : 'imagem', views: num(r.views), alcance: num(r.alcance), curtidas: num(r.curtidas), comentarios: num(r.comentarios), salvos: num(r.salvos), compart: num(r.compart), seguiram: num(r.seguiram) })));
ler('instagram-reels').forEach(r => pecas.push(Object.assign(sp(r.quando), { rede: 'instagram', formato: 'reels', views: num(r.views), alcance: num(r.alcance), curtidas: num(r.curtidas), comentarios: num(r.comentarios), salvos: num(r.salvos), compart: num(r.compart), passou3s: num(r.passou3s) })));
ler('threads-posts').forEach(r => pecas.push(Object.assign(sp(r.quando), { rede: 'threads', formato: String(r.tipo || '').toLowerCase(), views: num(r.views), curtidas: num(r.curtidas), respostas: num(r.respostas), reposts: num(r.reposts), citacoes: num(r.citacoes), compart: num(r.compart) })));

// origem, pilar e tema pela pauta do dia
pecas.forEach(p => {
  if (p.rede === 'tiktok' || (p.formato === 'reels' && plano.reels && plano.reels.desde && p.data >= plano.reels.desde)) {
    const r = roteiro(p.data), o = original(p.data);
    p.origem = 'original'; p.pilar = (r && r.pilar) || (o && o.pilar) || null; p.tema = (r && r.tema) || (o && o.tema) || '';
  } else if (p.formato === 'reels') { p.origem = 'jornal'; p.tema = 'Vídeo do jornal'; }
  else if (p.rede === 'instagram') {
    const pa = pauta(p.data), feed = pa && (pa.avisos || []).find(a => a.id === 'feed');
    if (feed && /^original:/.test(feed.origem || '')) { const o = original(feed.origem.slice(9)); p.origem = 'original'; p.pilar = o && o.pilar; p.tema = (o && o.tema) || feed.titulo; }
    else { p.origem = feed ? 'jornal' : 'sem pauta'; p.tema = feed ? feed.titulo : ''; }
  } else p.origem = p.hora < '13:00' ? 'pergunta' : p.hora < '18:00' ? 'notícia' : 'outro';
  p.tema = String(p.tema || '').replace(/<[^>]+>/g, '');
});
// anúncio registrado: mesma rede, mesmo dia de postagem e mesmo formato
anuncios.forEach(a => {
  const alvo = pecas.filter(p => p.rede === a.rede && p.data === a.inicio && (!a.formato || p.formato === a.formato) && !p.pago).sort((x, y) => x.hora.localeCompare(y.hora))[0];
  if (alvo) { alvo.pago = true; alvo.anuncio = a; } else if (a.fim >= JP[2][0]) avisos.push(`o anúncio de ${ddmm(a.inicio)} no ${a.rede} (${a.peca || a.formato || 'peça'}) não casou com nenhuma peça do Metricool`);
});
// pico sem anúncio registrado no TikTok: mais de 5 vezes a mediana e mais de mil views
{
  const tt = pecas.filter(p => p.rede === 'tiktok' && !p.pago && dentro(p.data, [JP[2][0], JP[0][1]]));
  const m = mediana(tt.map(p => p.views));
  tt.forEach(p => { if (m && p.views > 5 * m && p.views > 1000) { p.suspeito = true; avisos.push(`o TikTok de ${ddmm(p.data)} teve ${fmt(p.views)} views, mais de 5 vezes a mediana, sem anúncio registrado: foi impulsionado? Ficou fora das contas orgânicas`); } });
}
pecas.forEach(p => {
  p.organica = !p.pago && !p.suspeito;
  p.valor = p.rede === 'instagram' ? (p.alcance ? ((p.compart || 0) + (p.salvos || 0)) / p.alcance * 1000 : null)
    : p.rede === 'tiktok' ? (p.views ? ((p.compart || 0) + (p.comentarios || 0)) / p.views * 1000 : null)
    : (p.views ? ((p.respostas || 0) + (p.reposts || 0) + (p.citacoes || 0)) / p.views * 1000 : null);
});

/* ---------- seguidores ---------- */
function serie(nome) {
  const m = new Map();
  ler(nome).forEach(r => { const d = String(r.data || ''), v = num(r.seguidores); if (/^\d{8}$/.test(d) && v != null) m.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, v); });
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}
const SERIES = { instagram: serie('instagram-evolucao'), tiktok: serie('tiktok-evolucao'), threads: serie('threads-evolucao') };
// alcance diário da conta do Instagram: pico sem anúncio registrado
{
  const alc = new Map();
  ler('instagram-evolucao').forEach(r => { const d = String(r.data || ''), v = num(r.alcance); if (/^\d{8}$/.test(d) && v != null) alc.set(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`, v); });
  const m = mediana([...alc.values()]);
  [...alc.entries()].filter(([d, v]) => dentro(d, JS[0]) && m && v > 5 * m && v > 1000 && !pagoNoDia('instagram', d)).forEach(([d, v]) => avisos.push(`o alcance da conta do Instagram foi de ${fmt(v)} em ${ddmm(d)}, mais de 5 vezes a mediana, sem anúncio registrado nesse dia: houve impulsionamento?`));
}
function seguidores(J) {
  const out = {};
  Object.entries(SERIES).forEach(([rede, s]) => {
    const no = s.filter(([d]) => dentro(d, J));
    if (!no.length) return;
    const antes = s.filter(([d]) => d < J[0]).pop();
    let prev = antes ? antes[1] : no[0][1], org = 0, pg = 0, diasPagos = 0;
    no.forEach(([d, v], i) => { if (!antes && i === 0) return; const dl = v - prev; prev = v; if (pagoNoDia(rede, d)) pg += dl; else org += dl; });
    for (let d = J[0]; d <= J[1]; d = soma(d, 1)) if (pagoNoDia(rede, d)) diasPagos++;
    const diasOrg = 7 - diasPagos, ritmo = diasOrg > 0 ? org / diasOrg : null;
    const gasto = anuncios.filter(a => a.rede === rede && a.gasto != null).reduce((t, a) => { let k = 0; for (let d = J[0]; d <= J[1]; d = soma(d, 1)) if (d >= a.inicio && d <= a.fim) k++; return t + a.gasto / a.dias * k; }, 0);
    const atribuidos = diasPagos ? Math.max(0, pg - (ritmo || 0) * diasPagos) : 0;
    out[rede] = { inicio: antes ? antes[1] : no[0][1], fim: no[no.length - 1][1], organico: org, pago: pg, diasPagos, ritmo, gasto, atribuidos, custo: gasto && atribuidos ? gasto / atribuidos : null };
  });
  return out;
}

/* ---------- placar ---------- */
function kpis(k) {
  const P = JP[k], em = p => dentro(p.data, P) && p.organica;
  const tt = pecas.filter(p => p.rede === 'tiktok' && em(p));
  const rl = pecas.filter(p => p.formato === 'reels' && em(p));
  const car = pecas.filter(p => p.formato === 'carrossel' && em(p));
  const valor = arr => { const a = arr.reduce((s, p) => s + (p.alcance || 0), 0); return a ? arr.reduce((s, p) => s + (p.compart || 0) + (p.salvos || 0), 0) / a * 1000 : null; };
  const conv = tt.concat(rl, car), vs = conv.reduce((s, p) => s + (p.views || 0), 0);
  const seg = seguidores(JS[k]), segP = seguidores(P);
  const redes = Object.values(seg).filter(x => x.organico != null);
  const ttViews = tt.reduce((s, p) => s + (p.views || 0), 0);
  return {
    seguidoresOrganicos: redes.length ? redes.reduce((s, x) => s + x.organico, 0) : null,
    tiktokViews: mediana(tt.map(p => p.views)),
    reelsViews: mediana(rl.map(p => p.views)),
    carrosselViews: mediana(car.map(p => p.views)),
    reelsPulo: media(rl.filter(p => p.passou3s != null).map(p => 100 - p.passou3s)),
    valorOriginal: valor(rl.concat(car).filter(p => p.origem === 'original')),
    valorJornal: valor(rl.concat(car).filter(p => p.origem === 'jornal')),
    conversa: vs ? conv.reduce((s, p) => s + (p.comentarios || 0), 0) / vs * 1000 : null,
    conversao: segP.tiktok && ttViews ? segP.tiktok.organico / ttViews * 1000 : null,
    seg, n: { tiktok: tt.length, reels: rl.length, carrossel: car.length }
  };
}
const K = [kpis(0), kpis(1), kpis(2)];
const variacao = (v, base, menor) => { if (v == null || base == null) return null; if (base === 0) return v === 0 ? 0 : (menor ? -1 : 1) * Math.sign(v) * 100; const x = (v - base) / Math.abs(base) * 100; return menor ? -x : x; };
const corDe = x => x == null ? 'sem base' : x >= 20 ? 'verde' : x <= -20 ? 'vermelho' : 'amarelo';
const LINHAS = [
  ['seguidoresOrganicos', 'Seguidores orgânicos (3 redes)', false, 0, metas.seguidoresOrganicos, 'semana'],
  ['tiktokViews', 'TikTok: views por vídeo (mediana)', false, 0, metas.tiktokViews],
  ['reelsViews', 'Reels: views por vídeo (mediana)', false, 0, metas.reelsViews],
  ['carrosselViews', 'Carrossel: views por post (mediana)', false, 0, null],
  ['reelsPulo', 'Reels: % que sai nos 3 primeiros s', true, 0, metas.reelsPulo],
  ['valorOriginal', 'Valor do original (compart. + salv. por mil alcançadas)', false, 0, metas.valorOriginal],
  ['valorJornal', 'Valor do jornal (idem)', false, 0, null],
  ['conversa', 'Comentários por mil views', false, 1, metas.conversa],
  ['conversao', 'TikTok: seguidores orgânicos por mil views', false, 2, metas.conversao]
];
const placar = LINHAS.map(([id, nome, menor, casas, meta]) => {
  const v = K[0][id], base = media([K[1][id], K[2][id]]);
  const cor = corDe(variacao(v, base, menor)), corAnt = corDe(variacao(K[1][id], K[2][id], menor));
  const bateu = meta == null || v == null ? null : (menor ? v <= meta : v >= meta);
  return { id, nome, menor, casas, v, base, variacao: variacao(v, base, menor), cor, corAnt, meta, bateu, duasVermelhas: cor === 'vermelho' && corAnt === 'vermelho' };
});
const L = id => placar.find(x => x.id === id);
const seg = L('seguidoresOrganicos'), tv = L('tiktokViews'), rv = L('reelsViews');
let veredito = 'amarelo';
if (seg.cor === 'vermelho' || (tv.cor === 'vermelho' && rv.cor === 'vermelho') || placar.some(x => x.duasVermelhas && ['seguidoresOrganicos', 'tiktokViews', 'reelsViews'].includes(x.id))) veredito = 'vermelho';
else if (seg.cor === 'verde' && (tv.cor === 'verde' || rv.cor === 'verde')) veredito = 'verde';
const FRASE = { verde: 'manter a estratégia e acelerar o que ganhou', amarelo: 'ajustar uma variável por vez, sem trocar a estratégia', vermelho: 'trocar formato ou pilar do que está caindo' };

/* ---------- ranking, pilares, testes ---------- */
const semana = pecas.filter(p => dentro(p.data, JP[0]) && p.rede !== 'threads').sort((a, b) => (b.valor || 0) - (a.valor || 0));
const minimo = p => (p.alcance || p.views || 0) >= 30;
// Instagram ordena por valor; TikTok por views (lá comentário e compartilhamento são poucos demais para ordenar)
const ranking = rede => semana.filter(p => p.rede === rede && p.organica && minimo(p)).sort((a, b) => rede === 'tiktok' ? (b.views || 0) - (a.views || 0) : (b.valor || 0) - (a.valor || 0));
const nomeP = p => `${p.formato === 'video' ? 'TikTok' : p.formato === 'reels' ? 'Reels' : p.formato === 'carrossel' ? 'Carrossel' : p.formato} de ${ddmm(p.data)}${p.tema ? ': ' + p.tema : ''}`;
const campeas = ['tiktok', 'instagram'].map(rede => { const r = ranking(rede); return { rede, campea: r[0] || null, lanterna: r.length >= 3 ? r[r.length - 1] : null }; });
// para impulsionar: original orgânico; no Instagram, valor na meta (e Reels com pulo na meta); no TikTok, views 50% acima da mediana
const igCand = ranking('instagram').filter(p => p.origem === 'original' && p.valor != null && p.valor >= (metas.valorOriginal || 0) && (p.formato !== 'reels' || p.passou3s == null || 100 - p.passou3s <= (metas.reelsPulo || 50)))[0] || null;
const ttMed = mediana(ranking('tiktok').map(p => p.views));
const ttCand = ranking('tiktok').filter(p => p.origem === 'original' && ttMed && p.views >= 1.5 * ttMed)[0] || null;
const impulsionar = igCand || ttCand;
const pilares = {};
pecas.filter(p => dentro(p.data, [JP[2][0], JP[0][1]]) && p.organica && p.origem === 'original' && p.pilar).forEach(p => {
  const x = pilares[p.pilar] = pilares[p.pilar] || { pecas: 0, tt: [], ig: [] };
  x.pecas++; if (p.rede === 'tiktok') x.tt.push(p.views); else if (p.valor != null) x.ig.push(p.valor);
});
const tabPilares = Object.entries(pilares).map(([id, x]) => ({ id, nome: nomePilar(id), pecas: x.pecas, tt: mediana(x.tt), ig: mediana(x.ig) })).sort((a, b) => (b.tt || 0) - (a.tt || 0));
const testes = (plano.testes || []).map(t => {
  const dias = (t.dias || []).concat(t.de && t.ate ? (() => { const a = []; for (let d = t.de; d <= t.ate; d = soma(d, 1)) a.push(d); return a; })() : []).filter(d => dentro(d, JP[0]));
  if (!dias.length) return null;
  const org = pecas.filter(p => p.organica && dentro(p.data, JP[0]) && p.rede !== 'threads');
  if (t.id === 'tiktok-18h') {
    const no = org.filter(p => p.rede === 'tiktok' && dias.includes(p.data)), base = mediana(pecas.filter(p => p.rede === 'tiktok' && p.organica && dentro(p.data, JP[1])).map(p => p.views));
    return { id: t.id, texto: `TikTok às ${t.hora.tiktok} (${dias.map(ddmm).join(', ')}): mediana de ${fmt(mediana(no.map(p => p.views)))} views, contra ${fmt(base)} na janela anterior às 11:30. As views são acumuladas até hoje, não só as 24 h; confira as 24 h no TikTok Studio se a diferença for pequena.` };
  }
  if (t.id === 'sem-hashtag') {
    const sem = org.filter(p => dias.includes(p.data)), com = org.filter(p => !dias.includes(p.data));
    return { id: t.id, texto: `Sem hashtag (${dias.map(ddmm).join(', ')}): mediana de ${fmt(mediana(sem.map(p => p.views)))} views por peça, contra ${fmt(mediana(com.map(p => p.views)))} nos outros dias da janela.` };
  }
  if (t.id === 'reel-teste') return { id: t.id, texto: dias.map(d => { const rs = pecas.filter(p => p.formato === 'reels' && p.data === d).sort((a, b) => a.hora.localeCompare(b.hora)); return rs.length >= 2 ? `Reel de teste de ${ddmm(d)}: alcance de ${fmt(rs[rs.length - 1].alcance)} (gancho B, ${rs[rs.length - 1].hora}) contra ${fmt(rs[0].alcance)} do Reels normal (${rs[0].hora}). ${rs[rs.length - 1].alcance > rs[0].alcance ? 'O gancho B ganhou: publique para todos e use o molde dele.' : 'O gancho da cena 1 ganhou.'}` : `Reel de teste de ${ddmm(d)}: o Metricool não trouxe dois Reels nesse dia; peça ao Paulo o print do alcance do Reel de teste.`; }).join(' ') };
  return { id: t.id, texto: `${t.id}: dias ${dias.map(ddmm).join(', ')} na janela. ${t.mede || ''}` };
}).filter(Boolean);
const threads = pecas.filter(p => p.rede === 'threads' && dentro(p.data, JP[0]));
const thTop = threads.slice().sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);

/* ---------- relatório ---------- */
const nomeRede = { instagram: 'Instagram', tiktok: 'TikTok', threads: 'Threads' };
const M = [];
M.push(`## Revisão de ${ddmm(HOJE)}: semana de ${faixa(JS[0])}`, '');
M.push(`**Veredito: ${veredito}, ${FRASE[veredito]}.** Seguidores orgânicos na semana: ${fmt(seg.v)} (base ${fmt(seg.base, 1)}). TikTok: mediana de ${fmt(tv.v)} views por vídeo (base ${fmt(tv.base)}). Reels: ${fmt(rv.v)} (base ${fmt(rv.base)}).`, '');
M.push('### Placar', '');
M.push(`| Indicador | Esta semana | Base | Variação | Cor | Meta até ${metas.ate ? ddmm(metas.ate) : '?'} |`, '| --- | --- | --- | --- | --- | --- |');
placar.forEach(x => M.push(`| ${x.nome} | ${fmt(x.v, x.casas)} | ${fmt(x.base, x.casas)} | ${x.variacao == null ? 'sem base' : (x.variacao >= 0 ? '+' : '') + fmt(x.variacao) + '%'} | ${x.cor}${x.duasVermelhas ? ' (2ª semana)' : ''} | ${x.meta == null ? '' : (x.menor ? 'até ' : '') + fmt(x.meta) + (x.bateu ? ', batida' : '')} |`));
M.push('', `Seguidores de ${faixa(JS[0])}; peças publicadas de ${faixa(JP[0])}, todas com 72 h ou mais no ar e sem as impulsionadas. Base: média das duas janelas anteriores, medidas hoje. A % de 6 s assistidos do TikTok não vem pelo Metricool (meta ${fmt(metas.tiktok6s)}%): vale o print do TikTok Studio.`, '');
M.push('### Seguidores e anúncios', '');
M.push('| Rede | Seguidores no fim | Orgânicos | Nos dias pagos | Atribuídos ao anúncio | Gasto na semana (R$) | Custo por seguidor (R$) |', '| --- | --- | --- | --- | --- | --- | --- |');
Object.entries(K[0].seg).forEach(([rede, x]) => M.push(`| ${nomeRede[rede]} | ${fmt(x.fim)} | ${fmt(x.organico)} | ${x.diasPagos ? fmt(x.pago) + ' em ' + x.diasPagos + (x.diasPagos > 1 ? ' dias' : ' dia') : 'sem anúncio'} | ${x.diasPagos ? fmt(x.atribuidos) : ''} | ${x.gasto ? fmt(x.gasto, 2) : ''} | ${x.custo != null ? fmt(x.custo, 2) : ''} |`));
M.push('');
M.push('### Peças da semana', '', '| Data | Peça | Pilar | Views | Alcance | Compart. + salv. | Coment. | Valor | Anúncio |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
semana.forEach(p => M.push(`| ${ddmm(p.data)} ${p.hora} | ${nomeP(p).replace(/\|/g, '/')} | ${p.origem === 'original' ? nomePilar(p.pilar) || 'original' : p.origem} | ${fmt(p.views)} | ${p.alcance == null ? '' : fmt(p.alcance)} | ${p.rede === 'tiktok' ? fmt(p.compart) : fmt((p.compart || 0) + (p.salvos || 0))} | ${fmt(p.comentarios)} | ${fmt(p.valor, 1)} | ${p.pago ? 'sim' : p.suspeito ? 'suspeita' : ''} |`));
M.push('', 'Valor: no Instagram, compartilhamentos + salvamentos por mil contas alcançadas; no TikTok (que não mostra salvamentos nem alcance), compartilhamentos + comentários por mil views.', '');
M.push('### Campeãs, lanternas e o que impulsionar', '');
const nota = p => p.rede === 'tiktok' ? fmt(p.views) + ' views' : 'valor ' + fmt(p.valor, 1) + ', ' + fmt(p.views) + ' views';
campeas.forEach(c => M.push(`- ${nomeRede[c.rede]}: campeã ${c.campea ? nomeP(c.campea) + ' (' + nota(c.campea) + ')' : 'sem peça orgânica com 30 ou mais de alcance'}${c.lanterna ? '; lanterna ' + nomeP(c.lanterna) + ' (' + nota(c.lanterna) + ')' : ''}.`));
const motivo = p => p.rede === 'tiktok' ? `${fmt(p.views)} views, mediana da semana ${fmt(ttMed)}. Antes, confira no TikTok Studio se passou de ${fmt(metas.tiktok6s)}% nos 6 s; objetivo seguidores` : `valor ${fmt(p.valor, 1)}, meta ${fmt(metas.valorOriginal)}. Objetivo visitas ao perfil`;
M.push(`- Para impulsionar (regra do plano): ${impulsionar ? [igCand, ttCand].filter(Boolean).map(p => nomeP(p) + ' (' + motivo(p) + ')').join('; ou ') + '.' : 'nenhuma peça original passou nos critérios esta semana; não impulsione.'}`, '');
if (tabPilares.length) {
  M.push(`### Pilares (originais orgânicos de ${faixa([JP[2][0], JP[0][1]])})`, '', '| Pilar | Peças | TikTok: views (mediana) | Instagram: valor (mediana) |', '| --- | --- | --- | --- |');
  tabPilares.forEach(x => M.push(`| ${x.nome} | ${x.pecas} | ${fmt(x.tt)} | ${fmt(x.ig, 1)} |`));
  M.push('');
}
M.push('### Threads', '', threads.length ? `${threads.length} posts de ${faixa(JP[0])}, mediana de ${fmt(mediana(threads.map(p => p.views)))} views; ${fmt(threads.filter(p => p.origem === 'pergunta').reduce((s, p) => s + (p.respostas || 0), 0))} respostas nas perguntas da manhã. Mais vistos: ${thTop.map(p => `${ddmm(p.data)} ${p.hora} (${p.origem}, ${fmt(p.views)} views)`).join('; ')}.` : 'Sem posts do Threads na janela.', '');
if (testes.length) { M.push('### Testes', ''); testes.forEach(t => M.push('- ' + t.texto)); M.push(''); }
if (avisos.length) { M.push('### Alertas', ''); avisos.forEach(a => M.push('- ' + a.charAt(0).toUpperCase() + a.slice(1) + '.')); M.push(''); }

fs.writeFileSync(path.join(DIR, 'relatorio.md'), M.join('\n').replace(/\n{3,}/g, '\n\n'));
fs.writeFileSync(path.join(DIR, 'relatorio.json'), JSON.stringify({ hoje: HOJE, janelas: { seguidores: JS, pecas: JP }, veredito, placar, seguidores: K[0].seg, campeas, impulsionar, pilares: tabPilares, testes, avisos, pecas: semana }, null, 1));
console.log(`OK, revisão de ${HOJE}: veredito ${veredito}. ${semana.length} peças na janela de ${faixa(JP[0])}. Relatório em ${path.join(DIR, 'relatorio.md')}${avisos.length ? ' (' + avisos.length + ' alertas)' : ''}`);
