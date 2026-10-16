#!/usr/bin/env node
/* Monta a pauta de postagem do dia da Fonte de Mana sem precisar de IA.
   Uso: node tools/pauta/manha.cjs <raiz do repositório> <AAAA-MM-DD>
   Junta: o kit do jornal de hoje (kit/edN/kit.json e arquivos), o conteúdo original preparado na noite anterior
   (pauta/<data>/original/), os avisos da noite (gravação e TikTok, em pauta/<data>/pauta.json) e a grade de
   tools/conteudo/plano.json. Decide quem fica com o feed pela força do dia (kit.json > pauta.forca).
   Depois roda tools/pauta/pauta.cjs (página, lista de dias e calendário) e limpa mídia com mais de 7 dias.
   Pode rodar quantas vezes quiser: o resultado é o mesmo para os mesmos arquivos. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/pauta/manha.cjs <raiz> <AAAA-MM-DD>'); process.exit(2); }
const SITE = 'https://fontedemana.com.br';
const DISCLAIMER = 'Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.';
const PDIR = path.join(ROOT, 'pauta', DATA);
const ex = p => { try { return fs.statSync(path.join(ROOT, p)).size > 0; } catch (e) { return false; } };
const json = p => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')); } catch (e) { return null; } };
const plain = s => String(s == null ? '' : s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const corta = (s, n) => { s = plain(s); if (s.length <= n) return s; const t = s.slice(0, n - 1); return t.slice(0, t.lastIndexOf(' ') > n * 0.6 ? t.lastIndexOf(' ') : t.length).replace(/[,;:]$/, '') + '…'; };
const pergunta = t => { const f = plain(t).split(/(?<=[?.!])\s+/).filter(Boolean); return f.filter(x => x.endsWith('?')).pop() || f[0] || ''; };
const somaDias = (d, n) => new Date(Date.parse(d + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const avisosLog = [];

/* ---------- entradas ---------- */
const plano = json('tools/conteudo/plano.json') || {};
const grade = (plano.grade || []).filter(g => g.ativo);
const hora = id => (grade.find(g => g.id === id) || {}).hora;

let ed = null, n = null;
{
  const ctx = { window: {} }; ctx.MANA_POOL_ED = e => { ctx.ed = e; };
  vm.createContext(ctx);
  try {
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/index.js'), 'utf8'), ctx);
    const e = (ctx.window.MANA_POOL_INDEX.editions || []).find(x => x.date === DATA);
    if (e) { n = e.n; vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/ed' + n + '.js'), 'utf8'), ctx); ed = ctx.ed; }
  } catch (er) { avisosLog.push('não consegui ler a edição de hoje: ' + er.message); }
}
const kit = n ? json('kit/ed' + n + '/kit.json') : null;
const kdir = 'kit/ed' + n + '/';
const kSlides = kit ? fs.readdirSync(path.join(ROOT, kdir)).filter(f => /^carrossel-\d+\.jpg$/.test(f)).sort() : [];
const kVideo = kit && ex(kdir + 'video-vertical-ed' + n + '.mp4') ? kdir + 'video-vertical-ed' + n + '.mp4' : null;
if (!n) avisosLog.push('a edição de hoje ainda não está no jornal');
else if (!kit) avisosLog.push('o kit da edição ' + n + ' ainda não saiu');
else if (!kVideo) avisosLog.push('o kit da edição ' + n + ' saiu sem vídeo, então não há Reels hoje');

function original(d) {
  const o = json('pauta/' + d + '/original/original.json');
  if (!o) return null;
  const slides = fs.readdirSync(path.join(ROOT, 'pauta', d, 'original')).filter(f => /^carrossel-\d+\.jpg$/.test(f)).sort();
  return slides.length ? { o, d, slides, dir: 'pauta/' + d + '/original/' } : null;
}
function origensUsadas() {
  const usadas = new Set();
  try {
    fs.readdirSync(path.join(ROOT, 'pauta')).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x) && x !== DATA).forEach(x => {
      const p = json('pauta/' + x + '/pauta.json'); (p && p.avisos || []).forEach(a => { if (a.origem) usadas.add(a.origem); });
    });
  } catch (e) {}
  return usadas;
}
let orig = original(DATA);
if (!orig) {
  // banco: original de um dia forte recente que não foi para o feed
  const usadas = origensUsadas();
  for (let i = 1; i <= 6 && !orig; i++) { const d = somaDias(DATA, -i); const c = original(d); if (c && !usadas.has('original:' + d)) orig = c; }
  if (orig) avisosLog.push('sem original preparado para hoje; usei o do banco, de ' + orig.d);
}

const forcaKit = kit && kit.pauta && kit.pauta.forca;
const forca = forcaKit || (kit ? 'forte' : 'calmo');
const feedOrig = !!orig && (!kit || forca === 'calmo');
const nomePilar = orig ? ((plano.pilares || {})[orig.o.pilar] || {}).nome || orig.o.pilar : '';
const fxNota = (ed && ed.fx && ed.fx.html) || (orig && orig.o.fx) || null;
const url = p => SITE + '/' + p;
const legenda = t => String(t).trim() + '\n\n' + DISCLAIMER;

/* ---------- avisos ---------- */
const anterior = json('pauta/' + DATA + '/pauta.json');
// mantém tudo o que não é montado aqui (gravação e TikTok da noite, e qualquer aviso avulso); o resto é refeito
const MONTADOS = ['threads-manha', 'stories-manha', 'feed', 'stories-meio-dia', 'threads-tarde', 'stories-tarde', 'reels', 'threads-noite'];
const daNoite = (anterior && anterior.avisos || []).filter(a => !MONTADOS.includes(a.id));
const gerados = [];
const add = a => { if (a.hora) gerados.push(a); };

// TikTok (vem da noite): arquivo narrado se já existir e hora da grade
daNoite.forEach(a => {
  if (a.id !== 'tiktok') return;
  const narr = 'pauta/' + DATA + '/tiktok/tiktok-narrado.mp4';
  if (ex(narr)) a.arquivos = [{ nome: 'Vídeo do TikTok narrado', url: url(narr) }];
  if (hora('tiktok')) a.hora = hora('tiktok');
  a.titulo = String(a.titulo || '').replace(/^tiktok:\s*/i, '') || a.titulo; // a página já mostra a rede
});
const tiktok = daNoite.find(a => a.id === 'tiktok');
if (!tiktok) avisosLog.push('não há TikTok preparado para hoje (a tarefa da noite não deixou o aviso)');

// 10:30 Threads: pergunta da notícia no dia forte, debate do original no dia calmo
{
  const av = kit && (kit.textos.threadsAvulsos || [])[0];
  if (feedOrig || (!av && orig)) {
    const t = orig.o.threads;
    add({ id: 'threads-manha', hora: hora('threads-manha'), rede: 'Threads', titulo: corta('Debate: ' + plain(orig.o.tema), 70),
      oQue: corta(`Post de debate do conteúdo original de hoje (${nomePilar}) para puxar conversa.`, 400),
      textos: [{ rotulo: 'Post', texto: t.texto }],
      passos: ['Abra o Threads e cole o Post.'].concat(t.obs ? ['Dica: ' + plain(t.obs)] : [], ['Publique e responda quem comentar na primeira hora.']) });
  } else if (av) {
    add({ id: 'threads-manha', hora: hora('threads-manha'), rede: 'Threads', titulo: corta('Pergunta do dia: ' + pergunta(av.texto), 70),
      oQue: 'Pergunta para puxar conversa sobre a notícia do dia.',
      textos: [{ rotulo: 'Post', texto: av.texto }],
      passos: ['Abra o Threads e cole o Post.'].concat(av.obs ? ['Dica: ' + plain(av.obs)] : [], ['Publique e responda quem comentar na primeira hora.']) });
  }
}

// 10:30 Stories: capa do jornal com pergunta
if (kit && kSlides.length) {
  const perg = kit.pauta && kit.pauta.storyPergunta;
  add({ id: 'stories-manha', hora: hora('stories-manha'), rede: 'Instagram Stories', titulo: 'Capa do jornal com sticker de pergunta',
    oQue: corta(`Story com a capa da edição ${n} (${plain(kit.carrossel.capa.titulo)}) e um sticker de pergunta para puxar a conversa.`, 400),
    arquivos: [{ nome: 'Capa da edição ' + n, url: url(kdir + kSlides[0]) }],
    passos: ['Baixe a capa e poste no Story.', perg ? 'Adicione o sticker de Pergunta no terço de baixo, sem cobrir o título: ' + plain(perg) : 'Adicione o sticker de Pergunta no terço de baixo, sem cobrir o título: O que você achou da notícia de hoje?', 'Publique.'] });
}

// 12:00 feed: carrossel do jornal (dia forte) ou original (dia calmo)
let feedTitulo = '';
if (feedOrig) {
  feedTitulo = corta(plain(orig.o.tema).toLowerCase().startsWith(nomePilar.toLowerCase()) ? plain(orig.o.tema) : nomePilar + ': ' + plain(orig.o.tema), 70);
  add({ id: 'feed', hora: hora('feed'), rede: 'Instagram feed', titulo: feedTitulo, origem: 'original:' + orig.d,
    oQue: corta(`Carrossel original de ${orig.slides.length} imagens (${nomePilar}): ${plain(orig.o.tema)}. Feito para salvar e compartilhar.`, 400),
    arquivos: orig.slides.map((f, i) => ({ nome: 'Imagem ' + (i + 1) + ' de ' + orig.slides.length, url: url(orig.dir + f) })),
    textos: [{ rotulo: 'Legenda', texto: legenda(orig.o.legenda) }],
    passos: ['No Instagram, toque em + e escolha Post.', `Selecione as ${orig.slides.length} imagens na ordem, da 1 à ${orig.slides.length}.`, 'Cole a Legenda e publique.'] });
} else if (kit && kSlides.length) {
  feedTitulo = 'Carrossel da edição ' + n;
  const temas = [plain(kit.carrossel.capa.titulo)].concat((kit.carrossel.cartoes || []).slice(1).map(c => plain(c.titulo)), kit.carrossel.topdeck ? ['Topdeck: ' + plain(kit.carrossel.topdeck.titulo)] : []);
  add({ id: 'feed', hora: hora('feed'), rede: 'Instagram feed', titulo: feedTitulo, origem: 'jornal:ed' + n,
    oQue: corta(`Carrossel de ${kSlides.length} imagens da edição ${n}: ${temas.join(', ')}.`, 400),
    arquivos: kSlides.map((f, i) => ({ nome: 'Imagem ' + (i + 1) + ' de ' + kSlides.length, url: url(kdir + f) })),
    textos: [{ rotulo: 'Legenda', texto: legenda(kit.textos.legendaCarrossel) }],
    passos: ['No Instagram, toque em + e escolha Post.', `Selecione as ${kSlides.length} imagens na ordem, da 1 à ${kSlides.length}.`, 'Cole a Legenda e publique.'] });
}

// 12:00 Stories: repost do feed com enquete
if (gerados.find(a => a.id === 'feed')) {
  const enq = feedOrig ? orig.o.enquete : (kit.pauta && kit.pauta.enquete);
  const ops = enq && enq.opcoes ? enq.opcoes.map(plain) : [];
  const listaOps = ops.length ? ops.slice(0, -1).join(', ') + ' e ' + ops[ops.length - 1] : '';
  add({ id: 'stories-meio-dia', hora: hora('stories-meio-dia'), rede: 'Instagram Stories', titulo: 'Repost do carrossel com ' + (enq ? 'enquete' : 'pergunta'),
    oQue: 'Compartilhe o carrossel recém postado no Story' + (enq ? ' com uma enquete.' : ' com um sticker de pergunta.'),
    passos: ['No carrossel publicado, toque no avião de papel e em Adicionar post ao seu story.',
      enq ? corta(`Adicione o sticker de Enquete embaixo do post: ${plain(enq.pergunta)} com ${listaOps}.`, 220) : 'Adicione o sticker de Pergunta embaixo do post: Qual parte você salvaria?', 'Publique.'] });
}

// 15:00 Threads: fio do jornal (o aviso de fã vai como último post)
if (kit) {
  const fio = (kit.textos.threadsFio || []).concat([DISCLAIMER]);
  add({ id: 'threads-tarde', hora: hora('threads-tarde'), rede: 'Threads', titulo: 'Fio da edição ' + n,
    oQue: `Fio com ${fio.length} posts contando a edição ${n}. O último é o aviso de conteúdo de fã.`,
    textos: fio.map((t, i) => ({ rotulo: 'Post ' + (i + 1) + (i === fio.length - 1 ? ' (aviso de fã)' : ''), texto: t })),
    passos: ['No Threads, publique o Post 1.', 'Toque em Adicionar à sequência e cole os posts seguintes, um por vez, na ordem.', 'Publique o fio inteiro de uma vez.'] });
}

// 15:00 Stories: Topdeck com link para o site
if (kit && kit.carrossel.topdeck) {
  const idx = 1 + (kit.carrossel.cartoes || []).length; // capa + cartões, depois vem o Topdeck
  const f = kSlides[idx];
  if (f) add({ id: 'stories-tarde', hora: hora('stories-tarde'), rede: 'Instagram Stories', titulo: 'Topdeck do Dia com link',
    oQue: corta(`Story com a imagem de ${plain(kit.carrossel.topdeck.titulo)} no Topdeck do Dia e o sticker de link para a edição completa.`, 400),
    arquivos: [{ nome: 'Topdeck do Dia', url: url(kdir + f) }],
    passos: ['Baixe a imagem e poste no Story.', 'Adicione o sticker de Link para fontedemana.com.br com o texto Edição completa, embaixo do texto do Topdeck.', 'Publique.'] });
}

// 19:00 Reels: vídeo do jornal com música
if (kVideo) {
  add({ id: 'reels', hora: hora('reels'), rede: 'Reels', titulo: 'Vídeo do jornal com música',
    oQue: `Vídeo de 48 s da edição ${n} com música em alta e sem narração.`,
    arquivos: [{ nome: 'Vídeo da edição ' + n, url: url(kVideo) }],
    textos: [{ rotulo: 'Legenda', texto: legenda(kit.textos.legendaVideo) }],
    passos: ['No Instagram, toque em + e escolha Reel.', 'Escolha o vídeo e adicione uma música em alta pela biblioteca do app, com volume baixo.', 'Cole a Legenda e publique.'] });
}

// 19:00 Threads com o vídeo (fora da grade desde 14 out; volta se ativar em plano.json)
if (kVideo && kit.textos.threadsVideo) {
  add({ id: 'threads-noite', hora: hora('threads-noite'), rede: 'Threads', titulo: 'Post com o vídeo do jornal',
    oQue: `Post no Threads com o vídeo de 48 s da edição ${n}.`,
    arquivos: [{ nome: 'Vídeo da edição ' + n, url: url(kVideo) }],
    textos: [{ rotulo: 'Post', texto: legenda(kit.textos.threadsVideo) }],
    passos: ['No Threads, anexe o vídeo baixado.', 'Cole o Post e publique.'] });
}

/* ---------- gravar, validar e gerar ---------- */
const avisos = daNoite.concat(gerados);
if (!avisos.length) { console.log('ERROS:\n  nada para montar: sem kit de hoje, sem original e sem avisos da noite. ' + avisosLog.join('; ')); process.exit(1); }
fs.mkdirSync(PDIR, { recursive: true });
const pauta = { data: DATA, fx: fxNota, forca, feed: feedOrig ? 'original' : (kit ? 'jornal' : null), avisos };
fs.writeFileSync(path.join(PDIR, 'pauta.json'), JSON.stringify(pauta, null, 2) + '\n');
const r = cp.spawnSync(process.execPath, [path.join(ROOT, 'tools/pauta/pauta.cjs'), ROOT, DATA], { encoding: 'utf8' });
if (r.status !== 0) { console.log((r.stdout || '') + (r.stderr || '')); process.exit(1); }

// limpeza: .jpg e .mp4 de pastas da pauta com mais de 7 dias (mantém os .json e .html)
const limite = somaDias(DATA, -7); let apagados = 0;
const varre = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const p = path.join(d, e.name); if (e.isDirectory()) varre(p); else if (/\.(jpg|mp4)$/i.test(e.name)) { fs.unlinkSync(p); apagados++; } });
fs.readdirSync(path.join(ROOT, 'pauta')).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && d < limite).forEach(d => varre(path.join(ROOT, 'pauta', d)));

/* ---------- resumo para a mensagem final ---------- */
const ord = avisos.slice().sort((a, b) => ((a.dia || DATA) + a.hora).localeCompare((b.dia || DATA) + b.hora)).filter(a => !a.dia || a.dia === DATA);
const L = [`Pauta de hoje (${DATA})`, `Dia ${forca}${forcaKit ? '' : (kit ? ' (o kit não marcou a força, ficou o jornal)' : ' (sem kit do jornal hoje)')}${kit && kit.pauta && kit.pauta.porque ? ': ' + plain(kit.pauta.porque).replace(/[.!]+$/, '') : ''}. Feed das 12:00: ${feedOrig ? 'carrossel original (' + nomePilar + ')' : (kit ? 'carrossel do jornal' : 'nenhum')}.`];
ord.forEach(a => L.push(`${a.hora} ${a.rede}: ${a.titulo}`));
L.push(`Página: ${SITE}/pauta/${DATA}/`);
if (tiktok) L.push(ex('pauta/' + DATA + '/tiktok/tiktok-narrado.mp4') ? 'TikTok já narrado.' : 'TikTok ainda sem narração: mande os áudios até 11h ou poste o vídeo mudo com música.');
L.push('Os alarmes do calendário tocam 5 minutos antes de cada horário.');
if (avisosLog.length) L.push('Atenção: ' + avisosLog.join('; ') + '.');
if (apagados) L.push(`(limpeza: ${apagados} arquivos de mídia com mais de 7 dias apagados)`);
console.log(r.stdout.trim());
console.log('---');
console.log(L.join('\n'));
