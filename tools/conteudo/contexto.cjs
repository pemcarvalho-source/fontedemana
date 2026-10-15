#!/usr/bin/env node
/* Contexto curto para as rotinas da Fonte de Mana: pilar do dia e o que já foi publicado.
   Uso:
     node tools/conteudo/contexto.cjs <raiz do repositório> <AAAA-MM-DD>               pilar do dia, fila e publicados
     node tools/conteudo/contexto.cjs <raiz do repositório> <AAAA-MM-DD> --publicados  só a lista do que já saiu
   Substitui a leitura de dezenas de pauta.json e edições: imprime uma linha por item. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
const SO_PUB = process.argv.includes('--publicados');
const DIAS = 30;
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/conteudo/contexto.cjs <raiz> <AAAA-MM-DD> [--publicados]'); process.exit(2); }

const ler = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return null; } };
const json = f => { const s = ler(f); if (s == null) return null; try { return JSON.parse(s); } catch (e) { return null; } };
const plain = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const ms = d => Date.parse(d + 'T12:00:00Z');
const somaDias = (d, n) => new Date(ms(d) + n * 864e5).toISOString().slice(0, 10);
const limite = somaDias(DATA, -DIAS);
const plano = json('tools/conteudo/plano.json') || {};

/* ---------- pilar do dia ---------- */
function semanaISO(d) {
  const t = new Date(ms(d)); const dia = (t.getUTCDay() + 6) % 7; t.setUTCDate(t.getUTCDate() - dia + 3);
  const q = new Date(Date.UTC(t.getUTCFullYear(), 0, 4)); return 1 + Math.round(((t - q) / 864e5 - 3 + ((q.getUTCDay() + 6) % 7)) / 7);
}
const NOMES = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];
const EXTENSO = { dom: 'domingo', seg: 'segunda', ter: 'terça', qua: 'quarta', qui: 'quinta', sex: 'sexta', sab: 'sábado' };
function pilarDo(d) {
  const dia = NOMES[new Date(ms(d)).getUTCDay()], sem = semanaISO(d);
  const ciclo = plano.ciclo && Array.isArray(plano.ciclo.semanas) && plano.ciclo.semanas.length ? plano.ciclo : null;
  const ab = ciclo ? ciclo.semanas[(sem + (ciclo.deslocamento || 0)) % ciclo.semanas.length] : (sem % 2 ? 'A' : 'B');
  const visita = ler('extras/lojas/' + d + '.json') != null;
  const id = visita ? 'loja' : ((plano.calendario || {})[dia] || {})[ab];
  return { dia, sem, ab, id, visita, def: (plano.pilares || {})[id] || null };
}

/* ---------- o que já foi publicado ---------- */
function edicoes() {
  const ctx = { window: {} }; ctx.MANA_POOL_ED = e => { ctx.ed = e; };
  vm.createContext(ctx);
  const s = ler('data/index.js'); if (!s) return { idx: null, eds: [] };
  try { vm.runInContext(s, ctx); } catch (e) { return { idx: null, eds: [] }; }
  const idx = ctx.window.MANA_POOL_INDEX || { editions: [], featuredCards: [] };
  const eds = [];
  for (const e of idx.editions || []) {
    if (e.date < limite || e.date > DATA) continue;
    const t = ler('data/ed' + e.n + '.js'); if (!t) continue;
    ctx.ed = null; try { vm.runInContext(t, ctx); } catch (er) { continue; }
    if (ctx.ed) eds.push(ctx.ed);
  }
  return { idx, eds };
}
function pastasPauta() {
  try { return fs.readdirSync(path.join(ROOT, 'pauta')).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= limite).sort(); } catch (e) { return []; }
}
function publicados() {
  const L = [];
  const { idx, eds } = edicoes();
  if (eds.length) {
    L.push('Jornal (manchetes, sussurros e Topdeck das edições dos últimos ' + DIAS + ' dias):');
    eds.sort((a, b) => a.n - b.n).forEach(ed => {
      const m = (ed.stories || []).map(s => plain(s.title)).join(' | ') || 'sem manchete';
      const r = (ed.rumors || []).map(s => plain(s.title)).join(' | ');
      L.push(`- ${ed.date} ed${ed.n}: ${m}${r ? ' || sussurros: ' + r : ''} || Topdeck: ${ed.card ? ed.card.name : 'nenhum'} || arte: ${ed.art && ed.art.card || 'nenhuma'}`);
    });
  }
  if (idx && (idx.featuredCards || []).length) L.push('Todas as cartas que já foram Topdeck: ' + idx.featuredCards.join(', '));
  const orig = [], tik = [];
  for (const d of pastasPauta()) {
    const o = json('pauta/' + d + '/original/original.json');
    if (o) orig.push(`- ${d} ${((plano.pilares || {})[o.pilar] || {}).nome || o.pilar}: ${plain(o.tema)}${o.item ? ' [fila: ' + o.item + ']' : ''}${(o.cartas || []).length ? ' (cartas: ' + o.cartas.join(', ') + ')' : ''}`);
    const r = json('pauta/' + d + '/tiktok/roteiro.json');
    if (r) tik.push(`- ${d} TikTok: ${plain(r.tema)}${r.item ? ' [fila: ' + r.item + ']' : ''}${r.credito ? ' (' + plain(r.credito) + ')' : ''}`);
  }
  if (tik.length) L.push('TikToks:', ...tik);
  if (orig.length) L.push('Originais (carrossel e Threads):', ...orig);
  try {
    const ex = fs.readdirSync(path.join(ROOT, 'extras')).filter(d => fs.statSync(path.join(ROOT, 'extras', d)).isDirectory() && d !== 'lojas');
    if (ex.length) L.push('Extras já feitos: ' + ex.join(', '));
  } catch (e) {}
  return L;
}
function usadosDaFila() {
  const usados = new Set();
  let pastas = [];
  try { pastas = fs.readdirSync(path.join(ROOT, 'pauta')).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)); } catch (e) {}
  for (const d of pastas) {
    for (const f of ['pauta/' + d + '/original/original.json', 'pauta/' + d + '/tiktok/roteiro.json']) {
      const o = json(f); if (o && o.item) usados.add(String(o.item).toLowerCase());
      if (o && o.tema) usados.add(plain(o.tema).toLowerCase());
    }
  }
  return usados;
}

/* ---------- saída ---------- */
const out = [];
if (!SO_PUB) {
  const p = pilarDo(DATA);
  out.push(`Data: ${DATA} (${EXTENSO[p.dia]}), semana ISO ${p.sem}, semana ${p.ab}. Plano ${plano.versao || '?'}.`);
  if (!p.def) out.push('Pilar: não encontrado em tools/conteudo/plano.json. Use "historia".');
  else {
    out.push(`Pilar: ${p.def.nome} (${p.id})${p.visita ? ', visita marcada em extras/lojas/' + DATA + '.json' : ''}`);
    out.push('O que é: ' + p.def.oQue, 'Fontes: ' + p.def.fontes, 'Gancho: ' + p.def.gancho, 'Pergunta para os comentários: ' + p.def.pergunta);
    if (p.def.formato) out.push('Formato: ' + p.def.formato + ' (detalhes e exemplos em tools/conteudo/FORMATOS.md)');
    if (p.def.fila) {
      const usados = usadosDaFila();
      const fila = ((plano.filas || {})[p.def.fila] || []);
      const livres = fila.filter(x => ![...usados].some(u => u.includes(x.toLowerCase())));
      const feitos = fila.length - livres.length;
      out.push(`Fila "${p.def.fila}" (${feitos} de ${fila.length} já usados): próximos ${livres.slice(0, 5).join(' | ') || 'fila vazia, escolha um tema novo no espírito do pilar'}`);
      out.push(`Número na série: ${feitos + 1} (use no chip, ex.: "${p.def.nome} #${feitos + 1}")`);
    }
    if (p.id === 'termometro') {
      const { eds } = edicoes(); const vistos = new Set(), its = [];
      eds.sort((a, b) => b.n - a.n).slice(0, 7).forEach(ed => ((ed.pulse || {}).items || []).forEach(x => { if (!vistos.has(x.url)) { vistos.add(x.url); its.push(x); } }));
      its.sort((a, b) => b.views - a.views);
      out.push('Vídeos do Termômetro das últimas 7 edições (mais vistos primeiro):', ...its.slice(0, 8).map(x => `- ${x.views} visualizações, ${x.channel}: ${plain(x.title)} ${x.url}`));
    }
  }
  out.push('');
}
out.push(...publicados());
console.log(out.join('\n'));
