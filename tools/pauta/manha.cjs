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
// testes datados (plano.testes): trocam a hora de uma peça, tiram hashtags ou acrescentam o Reel de teste
const testesHoje = (plano.testes || []).filter(t => (t.dias || []).includes(DATA) || (t.de && t.ate && DATA >= t.de && DATA <= t.ate));
const horaTeste = id => { const t = testesHoje.find(x => x.hora && typeof x.hora === 'object' && x.hora[id]); return t ? t.hora[id] : null; };
const hora = id => horaTeste(id) || (grade.find(g => g.id === id) || {}).hora;
// blocos da v5 (valem a partir de desde; antes disso a pauta sai como na v4)
const vale = b => !!(b && b.desde && DATA >= b.desde);
const REELS_ORIG = vale(plano.reels) && plano.reels.fonte === 'original';
const THREADS_UM = vale(plano.threads) && plano.threads.fio === false;
const TOPICO = THREADS_UM ? (plano.threads.topico || 'MTG') : null;
const maxTags = (() => { const t = testesHoje.find(x => x.hashtags != null); return t ? t.hashtags : (vale(plano.legenda) ? plano.legenda.hashtags : null); })();
// no máximo maxTags hashtags: primeiro a do assunto (a que não é geral), depois as gerais na ordem de GERAIS; sem regra, devolve o texto como veio
const GERAIS = ['commander', 'mtg', 'edh', 'magicthegathering', 'mtgcommander', 'mtgbrasil', 'magicbrasil', 'edhbrasil', 'cartasdemagic', 'cartademagic', 'deckdecommander', 'fontedemana'];
const RE_TAG = /(^|[ \t\n])#([\p{L}\p{N}_]+)/gu;
const tags = s => {
  if (maxTags == null) return s;
  const todas = [...String(s).matchAll(RE_TAG)].map(m => m[2].toLowerCase()).filter((t, i, a) => a.indexOf(t) === i);
  const esp = todas.filter(t => !GERAIS.includes(t)), ger = todas.filter(t => GERAIS.includes(t)).sort((a, b) => GERAIS.indexOf(a) - GERAIS.indexOf(b));
  const fica = esp.slice(0, maxTags ? Math.max(1, maxTags - 2) : 0);
  ger.concat(esp).forEach(t => { if (fica.length < maxTags && !fica.includes(t)) fica.push(t); });
  const vistas = new Set();
  return String(s).replace(RE_TAG, (m, antes, t) => { const l = t.toLowerCase(); if (fica.includes(l) && !vistas.has(l)) { vistas.add(l); return m; } return antes === '\n' ? '\n' : ''; })
    .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};
// música (plano.audio): Reels narrado e carrossel levam som em alta da biblioteca do Instagram
const AUDIO = vale(plano.audio);
const comMusica = passos => AUDIO ? passos.slice(0, -1).concat(['Toque em Adicionar música e escolha uma em alta que combine com o tema.'], passos.slice(-1)) : passos;

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
else if (!kVideo && !REELS_ORIG) avisosLog.push('o kit da edição ' + n + ' saiu sem vídeo, então não há Reels hoje');

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
const legenda = t => tags(String(t).trim()) + '\n\n' + DISCLAIMER;
const comTopico = passos => TOPICO ? passos.slice(0, -1).concat(['Toque em Adicionar tópico e escolha ' + TOPICO + '.'], passos.slice(-1)) : passos;

/* ---------- avisos ---------- */
const anterior = json('pauta/' + DATA + '/pauta.json');
// mantém tudo o que não é montado aqui (gravação e TikTok da noite, e qualquer aviso avulso); o resto é refeito
const MONTADOS = ['threads-manha', 'stories-manha', 'feed', 'stories-meio-dia', 'threads-tarde', 'stories-tarde', 'reels', 'reels-teste', 'threads-noite'];
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
  (a.textos || []).forEach(t => { if (/^legenda/i.test(t.rotulo || '')) t.texto = tags(t.texto); });
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
      passos: comTopico(['Abra o Threads e cole o Post.'].concat(t.obs ? ['Dica: ' + plain(t.obs)] : [], ['Publique e responda quem comentar na primeira hora.'])) });
  } else if (av) {
    add({ id: 'threads-manha', hora: hora('threads-manha'), rede: 'Threads', titulo: corta('Pergunta do dia: ' + pergunta(av.texto), 70),
      oQue: 'Pergunta para puxar conversa sobre a notícia do dia.',
      textos: [{ rotulo: 'Post', texto: av.texto }],
      passos: comTopico(['Abra o Threads e cole o Post.'].concat(av.obs ? ['Dica: ' + plain(av.obs)] : [], ['Publique e responda quem comentar na primeira hora.'])) });
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
    passos: comMusica(['No Instagram, toque em + e escolha Post.', `Selecione as ${orig.slides.length} imagens na ordem, da 1 à ${orig.slides.length}.`, 'Cole a Legenda e publique.']) });
} else if (kit && kSlides.length) {
  feedTitulo = 'Carrossel da edição ' + n;
  const temas = [plain(kit.carrossel.capa.titulo)].concat((kit.carrossel.cartoes || []).slice(1).map(c => plain(c.titulo)), kit.carrossel.topdeck ? ['Topdeck: ' + plain(kit.carrossel.topdeck.titulo)] : []);
  add({ id: 'feed', hora: hora('feed'), rede: 'Instagram feed', titulo: feedTitulo, origem: 'jornal:ed' + n,
    oQue: corta(`Carrossel de ${kSlides.length} imagens da edição ${n}: ${temas.join(', ')}.`, 400),
    arquivos: kSlides.map((f, i) => ({ nome: 'Imagem ' + (i + 1) + ' de ' + kSlides.length, url: url(kdir + f) })),
    textos: [{ rotulo: 'Legenda', texto: legenda(kit.textos.legendaCarrossel) }],
    passos: comMusica(['No Instagram, toque em + e escolha Post.', `Selecione as ${kSlides.length} imagens na ordem, da 1 à ${kSlides.length}.`, 'Cole a Legenda e publique.']) });
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

// 15:00 Threads: a notícia num post só (v5) ou o fio do jornal (o aviso de fã vai como último post do fio)
if (kit && THREADS_UM) {
  let post = String(kit.textos.threadsPost || (kit.textos.threadsFio || [])[0] || '').trim();
  const link = '\n\nEdição completa em fontedemana.com.br';
  if (post && !/fontedemana\.com\.br/.test(post) && (post + link).length <= 500) post += link;
  if (!kit.textos.threadsPost && post) avisosLog.push('o kit não trouxe threadsPost; o Threads das 15:00 usa o primeiro post do fio');
  if (post) add({ id: 'threads-tarde', hora: hora('threads-tarde'), rede: 'Threads', titulo: 'Notícia do dia num post só',
    oQue: corta(`A edição ${n} contada num post só, sem fio: nos fios, quase ninguém passava do primeiro post.`, 400),
    textos: [{ rotulo: 'Post', texto: post }],
    passos: comTopico(['No Threads, cole o Post, sem sequência.', 'Publique e responda quem comentar na primeira hora.']) });
} else if (kit) {
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

// 19:00 Reels: o vídeo original do dia (v5), o mesmo arquivo do TikTok; sem ele, o vídeo do jornal com música
const tkDir = 'pauta/' + DATA + '/tiktok/';
const roteiro = json(tkDir + 'roteiro.json');
const tkVideo = ex(tkDir + 'tiktok-narrado.mp4') ? tkDir + 'tiktok-narrado.mp4' : (ex(tkDir + 'tiktok-mudo.mp4') ? tkDir + 'tiktok-mudo.mp4' : null);
const legOrig = roteiro && roteiro.legenda ? (/Fan Content/.test(roteiro.legenda) ? tags(roteiro.legenda.trim()) : legenda(roteiro.legenda)) : null;
if (REELS_ORIG && tiktok && roteiro && tkVideo && legOrig) {
  const narr = /narrado/.test(tkVideo);
  add({ id: 'reels', hora: hora('reels'), rede: 'Reels', titulo: corta('Vídeo original: ' + plain(roteiro.tema), 70),
    oQue: corta(`O vídeo original de hoje no Instagram, o mesmo arquivo do TikTok${narr ? ', já narrado' : ', ainda mudo'}. É o formato que mais chega a quem não segue.`, 400),
    arquivos: [{ nome: narr ? 'Vídeo original narrado' : 'Vídeo original mudo', url: url(tkVideo) }],
    textos: [{ rotulo: 'Legenda', texto: legOrig }].concat(roteiro.comentario ? [{ rotulo: 'Comentário fixado', texto: roteiro.comentario }] : []),
    passos: ['No Instagram, toque em + e escolha Reel.', 'Escolha o vídeo baixado daqui, nunca o salvo do TikTok (o Instagram derruba vídeo com marca d\'água).' + (narr ? '' : ' Ele está mudo: adicione uma música em alta com volume baixo.')].concat(narr && AUDIO ? ['Em Áudio, ponha uma música em alta da biblioteca do Instagram com volume baixo (uns 10%), sem cobrir a voz.'] : [], ['Na capa, use o primeiro quadro, o do gancho.', 'Cole a Legenda e publique.', 'Fixe o comentário e responda quem comentar na primeira hora.']) });
  // Reel de teste da semana (plano.testes > reel-teste): o mesmo vídeo com o gancho B, só para quem não segue
  const rt = testesHoje.find(t => t.id === 'reel-teste');
  const tVideo = ex(tkDir + 'tiktok-teste-narrado.mp4') ? tkDir + 'tiktok-teste-narrado.mp4' : (ex(tkDir + 'tiktok-teste.mp4') ? tkDir + 'tiktok-teste.mp4' : null);
  if (rt && tVideo) add({ id: 'reels-teste', hora: typeof rt.hora === 'string' ? rt.hora : '21:00', rede: 'Reels', titulo: 'Reel de teste: o mesmo vídeo com o gancho B',
    oQue: 'Teste da semana: o vídeo de hoje com outro gancho, mostrado só para quem não segue. Na revisão de segunda, o alcance dele em 72 horas é comparado com o do Reels das 19:00.',
    arquivos: [{ nome: 'Vídeo de teste, gancho B' + (/narrado/.test(tVideo) ? '' : ' (mudo)'), url: url(tVideo) }],
    textos: [{ rotulo: 'Legenda', texto: legOrig }],
    passos: ['No Instagram, toque em + e escolha Reel, com o vídeo de teste.', 'Antes de compartilhar, ative a opção de Reel de teste (Trial reel), para ele aparecer só para quem não segue.', 'Deixe o compartilhamento automático desligado: se o gancho B ganhar, a revisão avisa para publicar para todos.', 'Use a mesma música e o mesmo volume do Reels das 19:00, para o teste comparar só o gancho.', 'Cole a Legenda e publique.'] });
  else if (rt) avisosLog.push('hoje é dia de Reel de teste, mas a noite não gerou o vídeo com o gancho B');
} else if (kVideo) {
  if (REELS_ORIG) avisosLog.push('sem o vídeo original de hoje, o Reels volta a ser o vídeo do jornal');
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
if (testesHoje.length) L.push('Teste do dia: ' + testesHoje.map(t => t.id === 'tiktok-18h' ? 'TikTok às ' + t.hora.tiktok : t.id === 'sem-hashtag' ? 'legendas sem hashtag' : t.id === 'reel-teste' ? 'Reel de teste com o gancho B' : t.id).join(', ') + '.');
L.push('Os alarmes do calendário tocam 5 minutos antes de cada horário.');
if (avisosLog.length) L.push('Atenção: ' + avisosLog.join('; ') + '.');
if (apagados) L.push(`(limpeza: ${apagados} arquivos de mídia com mais de 7 dias apagados)`);
console.log(r.stdout.trim());
console.log('---');
console.log(L.join('\n'));
