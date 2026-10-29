#!/usr/bin/env node
// Validador da edição do jornal Fonte de Mana.
// Uso: node tools/jornal/validar.cjs <pasta do site> <numero da edicao nova>
// A pasta do site tem data/index.js, data/edN.js e img/. Regras em tools/jornal/LEIA.md.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = process.argv[2], N = +process.argv[3], erros = [];
if (!dir || !N) { console.log('Uso: node tools/jornal/validar.cjs <pasta do site> <numero da edicao nova>'); process.exit(2); }
const ctx = { window: {} }; ctx.MANA_POOL_ED = e => { ctx.ed = e; };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'data/index.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'data/ed' + N + '.js'), 'utf8'), ctx);
const idx = ctx.window.MANA_POOL_INDEX, ed = ctx.ed;
const req = (c, m) => { if (!c) erros.push(m); };
req(idx && Array.isArray(idx.editions) && Array.isArray(idx.featuredCards), 'index.js sem editions ou featuredCards');
req(idx.editions[0] && idx.editions[0].n === N, 'index.js: a primeira entrada precisa ser a edição ' + N);
req(new Set(idx.editions.map(e => e.n)).size === idx.editions.length, 'index.js: número de edição repetido');
idx.editions.forEach(e => req(e.n && e.date && e.dateLabel && e.head && 'WUBRGAM'.includes(e.biome), 'index.js: entrada incompleta ' + JSON.stringify(e)));
req(idx.editions.length <= 31, 'index.js: mais de 31 edições');
req(ed && ed.n === N, 'ed' + N + '.js não chama MANA_POOL_ED com n = ' + N);
const C = 'WUBRGAMQ', TAGS = ['Bolso','Deck','Polêmica','Novidade','Brasil','Ban','Regras','Evento','Acessórios'];
const VERIF = ['Oficial','Oficial + 2ª fonte','2 fontes','MTGStocks','LigaMagic','Anúncio da loja'];
req(/^\d{4}-\d{2}-\d{2}$/.test(ed.date) && ed.dateLabel && ed.coverage, 'date, dateLabel ou coverage faltando');
req(ed.lead && ed.lead.title === 'Resumo do Dia', 'lead.title precisa ser "Resumo do Dia"');
req(ed.art && 'WUBRGAM'.includes(ed.art.biome), 'art.biome inválido');
if (ed.art && ed.art.image) { req(fs.existsSync(path.join(dir, ed.art.image)), 'imagem da arte não encontrada: ' + ed.art.image); req(ed.art.card && ed.art.artist && ed.art.uri, 'art com imagem precisa de card, artist e uri'); }
req(Array.isArray(ed.summary) && ed.summary.length >= 3 && ed.summary.length <= 5, 'summary precisa de 3 a 5 itens');
(ed.summary || []).forEach(s => req(C.includes(s.c) && s.html, 'summary item inválido'));
req(Array.isArray(ed.stories), 'stories precisa ser lista (pode ser vazia)');
(ed.stories || []).forEach((s, i) => {
  req(s.title && s.lede && Array.isArray(s.facts) && Array.isArray(s.sources) && s.sources.length, 'manchete ' + (i + 1) + ' incompleta');
  req((s.tags || []).length && s.tags.every(t => TAGS.includes(t)), 'manchete ' + (i + 1) + ': etiqueta fora da lista');
  req(VERIF.includes(s.verif), 'manchete ' + (i + 1) + ': verif fora da lista');
  if (s.note) req(s.note.label && s.note.text, 'manchete ' + (i + 1) + ': note incompleta');
});
const k = ed.card;
if (k) {
  ['name','type','rarity','scryfall','why','rarityText','inDeck','watch'].forEach(f => req(k[f], 'card.' + f + ' faltando'));
  req(['common','uncommon','rare','mythic'].includes(k.rarity), 'card.rarity inválida');
  req(Array.isArray(k.ci) && Array.isArray(k.cost) && Array.isArray(k.collector), 'card.ci, cost ou collector faltando');
  req(Array.isArray(k.oraclePt) && k.oraclePt.length && Array.isArray(k.oracleEn) && k.oracleEn.length, 'card.oraclePt e oracleEn são obrigatórios');
  req(k.roles && k.roles.commander && k.roles.ninetyNine, 'card.roles incompleto');
  req(Array.isArray(k.alone) && k.alone.length >= 1, 'card.alone vazio');
  req(Array.isArray(k.stats) && k.stats.length === 4, 'card.stats precisa de 4 itens');
  req(Array.isArray(k.links) && k.links.length, 'card.links vazio');
  if (k.image) req(fs.existsSync(path.join(dir, k.image)), 'imagem da carta não encontrada: ' + k.image);
  req(!idx.featuredCards.slice(1).includes(k.name), 'carta repetida no Topdeck: ' + k.name);
  req(idx.featuredCards[0] === k.name, 'featuredCards precisa começar com a carta de hoje');
}
if (ed.pulse) (ed.pulse.items || []).forEach(x => req(x.title && x.channel && Number.isFinite(x.views) && x.url, 'pulse item incompleto'));
(ed.agenda || []).forEach(a => req(a.label && /^\d{4}-\d{2}-\d{2}$/.test(a.iso) && a.iso >= ed.date && C.includes(a.c) && a.html, 'agenda item inválido ou no passado: ' + a.label));
if (ed.ban) req(/^\d{4}-\d{2}-\d{2}$/.test(ed.ban.iso) && ed.ban.iso >= ed.date && ed.ban.html, 'ban inválido ou no passado');
(ed.rumors || []).forEach(r => req(r.title && r.html && (r.sources || []).length, 'sussurro incompleto'));
req(Array.isArray(ed.notes) && ed.notes.length === 0, 'notes precisa ficar vazio: avisos da rotina vão só na mensagem final');
if (ed.mesa) {
  req(ed.mesa.note && ed.mesa.source && ed.mesa.source.t && ed.mesa.source.u, 'mesa precisa de note e source {t, u}');
  req(Array.isArray(ed.mesa.items) && ed.mesa.items.length >= 3 && ed.mesa.items.length <= 5, 'mesa precisa de 3 a 5 comandantes (ou mesa = null)');
  (ed.mesa.items || []).forEach(x => req(x.name && Number.isInteger(x.decks) && x.decks > 0 && (x.novo === undefined || typeof x.novo === 'boolean'), 'mesa item incompleto: ' + JSON.stringify(x)));
  (ed.mesa.items || []).forEach((x, i, a) => req(i === 0 || a[i - 1].decks >= x.decks, 'mesa fora de ordem: ' + x.name));
}
if (ed.pulse) req(Array.isArray(ed.pulse.items) && ed.pulse.items.length >= 1 && ed.pulse.items.length <= 3, 'pulse precisa de 1 a 3 itens (ou pulse = null)');
const semFx = JSON.stringify(ed, (key, v) => ['fx','image','u','url','uri','scryfall'].includes(key) ? undefined : v);
if (/\(R\$ ?\d/.test(semFx)) req(ed.fx && ed.fx.html, 'tem valor em reais entre parênteses: preencha fx com a nota da cotação (regra de moeda)');
if (ed.fx) {
  req(typeof ed.fx.rate === 'number' && ed.fx.rate > 0 && /^\d{4}-\d{2}-\d{2}$/.test(ed.fx.date) && ed.fx.source && ed.fx.html, 'fx incompleto: precisa de rate, date, source e html');
  const re = /US\$ ?\d+(?:[.,]\d+)*/g; let mm;
  while ((mm = re.exec(semFx))) if (!/^ ?\(R\$ ?\d/.test(semFx.slice(re.lastIndex, re.lastIndex + 8))) erros.push('valor em dólar sem o valor em reais entre parênteses: ' + mm[0]);
}
const texto = JSON.stringify(ed, (key, v) => ['image','u','url','uri','scryfall'].includes(key) ? undefined : v);
[' · ', ' – ', ' — ', '—'].forEach(sep => req(!texto.includes(sep), 'separador proibido no texto: "' + sep + '"'));
req(!/Gerado pelo Claude/i.test(texto), 'texto "Gerado pelo Claude" não deve aparecer');
if (erros.length) { console.log('ERROS:\n' + erros.map(e => '  ' + e).join('\n')); process.exit(1); }
console.log('OK, edição ' + N + ' válida. ' + (ed.stories || []).length + ' manchetes, ' + (ed.rumors || []).length + ' sussurros, Topdeck: ' + (k ? k.name : 'nenhum'));
