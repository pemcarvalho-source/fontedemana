#!/usr/bin/env node
/* Gerador do Kit de Redes do Fonte de Mana.
   Uso: node tools/kit/gerar.cjs <raiz do repositório> <número da edição> [--pagina] [--sem-video]
   Lê kit/edN/kit.json (formato em tools/kit/LEIA.md) e gera em kit/edN/:
     carrossel-01.jpg ..., video-vertical-edN.mp4 e index.html (textos para Instagram, TikTok e Threads)
   e reescreve kit/index.html (perfil, edição mais recente e edições anteriores).
   --pagina    só refaz as páginas, usando as imagens e o vídeo que já existem.
   --sem-video não renderiza o vídeo. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const N = parseInt(process.argv[3], 10);
const FLAGS = process.argv.slice(4);
if (!N) { console.error('Uso: node tools/kit/gerar.cjs <raiz do repositório> <N> [--pagina] [--sem-video]'); process.exit(2); }
const ONLY_PAGE = FLAGS.includes('--pagina'), NO_VIDEO = FLAGS.includes('--sem-video');
const TOOL = __dirname, KIT = path.join(ROOT, 'kit'), DIR = path.join(KIT, 'ed' + N);
const DISCLAIMER = 'Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.';
const IA_NOTE = 'Se usar voz sintética, ative no TikTok o rótulo "Conteúdo gerado por IA" na hora de postar. Com a sua própria voz, não precisa.';
const SEPS = [' · ', ' – ', ' — ', '—'];
const VIDEO_DUR = 48, FPS = 30;

/* ---------- utilidades ---------- */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = s => esc(s).replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>').replace(/&amp;amp;/g, '&amp;');
const plain = s => String(s == null ? '' : s).replace(/<\/?(b|i)>/g, '');
const fileURL = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/');
const exists = p => { try { return fs.statSync(p).size > 0; } catch (e) { return false; } };
const landOf = c => ('WUBRG'.includes(c) ? c : 'A');
function pip(c, s) {
  const st = s ? ` style="--s:${s}px"` : '';
  if (c === 'M') return `<span class="pip p-M"${st}><i class="wd wW"></i><i class="wd wU"></i><i class="wd wB"></i><i class="wd wR"></i><i class="wd wG"></i></span>`;
  if (c === 'Q') return `<span class="pip p-Q"${st}>?</span>`;
  return `<span class="pip p-${c}"${st}></span>`;
}
const BRAND = '<div class="brand">Fonte <span class="de">de</span> Mana</div>';

function readSpec(n) {
  const f = path.join(KIT, 'ed' + n, 'kit.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

/* ---------- validação do kit.json ---------- */
function validate(sp) {
  const E = [];
  const req = (c, m) => { if (!c) E.push(m); };
  const len = (s, max, nome) => { req(typeof s === 'string' && s.trim().length > 0, nome + ' está vazio'); if (typeof s === 'string') req(plain(s).length <= max, `${nome} tem ${plain(s).length} caracteres (máximo ${max}): "${plain(s).slice(0, 60)}..."`); };
  const cor = (c, nome, extra = '') => req(typeof c === 'string' && ('WUBRGAM' + extra).includes(c) && c.length === 1, nome + ' precisa ser uma cor entre W U B R G A M' + (extra ? ' ' + extra.split('').join(' ') : ''));
  req(sp.n === N, 'kit.json: n precisa ser ' + N);
  len(sp.data, 12, 'data');
  const t = sp.textos || {};
  len(t.legendaCarrossel, 1800, 'textos.legendaCarrossel');
  len(t.legendaVideo, 1500, 'textos.legendaVideo');
  req(/fontedemana\.com\.br/.test(t.legendaCarrossel || '') && /fontedemana\.com\.br/.test(t.legendaVideo || ''), 'as legendas precisam citar fontedemana.com.br');
  // threadsCarrossel, threadsVideo e narracao são opcionais desde 14 out 2026 (não são mais postados)
  if (t.threadsCarrossel) len(t.threadsCarrossel, 280, 'textos.threadsCarrossel');
  if (t.threadsVideo) len(t.threadsVideo, 280, 'textos.threadsVideo');
  if (t.narracao) {
    req(Array.isArray(t.narracao) && t.narracao.length === 5, 'textos.narracao precisa de 5 cenas');
    (t.narracao || []).forEach((x, i) => { len(x.cena, 60, `narracao[${i}].cena`); len(x.texto, 260, `narracao[${i}].texto`); });
  }
  req(Array.isArray(t.threadsFio) && t.threadsFio.length >= 3 && t.threadsFio.length <= 8, 'textos.threadsFio precisa de 3 a 8 posts');
  (t.threadsFio || []).forEach((x, i) => len(x, 480, `threadsFio[${i}]`));
  // post único da notícia, usado pela pauta no Threads das 15:00 desde 26 out 2026 (plano.json > threads)
  if (t.threadsPost != null) { len(t.threadsPost, 480, 'textos.threadsPost'); req(/fontedemana\.com\.br/.test(t.threadsPost || ''), 'textos.threadsPost precisa citar fontedemana.com.br'); }
  req(Array.isArray(t.threadsAvulsos) && t.threadsAvulsos.length <= 6, 'textos.threadsAvulsos precisa ser lista (até 6)');
  (t.threadsAvulsos || []).forEach((x, i) => { len(x.titulo, 40, `threadsAvulsos[${i}].titulo`); len(x.texto, 480, `threadsAvulsos[${i}].texto`); if (x.obs) len(x.obs, 120, `threadsAvulsos[${i}].obs`); });
  // bloco opcional lido por tools/pauta/manha.cjs
  if (sp.pauta) {
    const pa = sp.pauta;
    req(['forte', 'calmo'].includes(pa.forca), 'pauta.forca precisa ser "forte" ou "calmo"');
    len(pa.porque, 120, 'pauta.porque');
    len(pa.storyPergunta, 80, 'pauta.storyPergunta');
    if (pa.enquete) {
      len(pa.enquete.pergunta, 80, 'pauta.enquete.pergunta');
      req(Array.isArray(pa.enquete.opcoes) && pa.enquete.opcoes.length >= 2 && pa.enquete.opcoes.length <= 4, 'pauta.enquete.opcoes precisa de 2 a 4');
      (pa.enquete.opcoes || []).forEach((x, j) => len(x, 25, `pauta.enquete.opcoes[${j}]`));
    }
  }
  if (!ONLY_PAGE) {
    const c = sp.carrossel || {};
    req(c.capa, 'carrossel.capa faltando');
    if (c.capa) { len(c.capa.titulo, 52, 'capa.titulo'); len(c.capa.sub, 150, 'capa.sub'); len(c.capa.credito, 80, 'capa.credito'); cor(c.capa.cor, 'capa.cor'); }
    req(Array.isArray(c.cartoes) && c.cartoes.length >= 1 && c.cartoes.length <= 3, 'carrossel.cartoes precisa de 1 a 3 cartões');
    (c.cartoes || []).forEach((k, i) => {
      const nm = `cartoes[${i}]`;
      cor(k.cor, nm + '.cor'); len(k.titulo, 34, nm + '.titulo'); len(k.fonte, 70, nm + '.fonte');
      req(!!k.itens !== !!k.linhas, nm + ' precisa ter itens OU linhas (só um dos dois)');
      if (k.itens) { req(k.itens.length >= 2 && k.itens.length <= 4, nm + '.itens precisa de 2 a 4'); k.itens.forEach((x, j) => { cor(x.cor, `${nm}.itens[${j}].cor`); len(x.html, 120, `${nm}.itens[${j}].html`); }); }
      if (k.linhas) { req(k.linhas.length >= 1 && k.linhas.length <= 3, nm + '.linhas precisa de 1 a 3'); k.linhas.forEach((x, j) => { len(x.nome, 34, `${nm}.linhas[${j}].nome`); len(x.valor, 8, `${nm}.linhas[${j}].valor`); len(x.sub, 36, `${nm}.linhas[${j}].sub`); if (x.porque) len(x.porque, 70, `${nm}.linhas[${j}].porque`); }); }
      if (k.nota) { len(k.nota.rotulo, 16, nm + '.nota.rotulo'); len(k.nota.texto, 95, nm + '.nota.texto'); }
    });
    const td = c.topdeck || {};
    len(td.titulo, 40, 'topdeck.titulo'); len(td.credito, 60, 'topdeck.credito'); len(td.extra, 150, 'topdeck.extra');
    req(Array.isArray(td.habilidades) && td.habilidades.length >= 2 && td.habilidades.length <= 3, 'topdeck.habilidades precisa de 2 a 3');
    (td.habilidades || []).forEach((x, j) => { len(x.rotulo, 28, `topdeck.habilidades[${j}].rotulo`); len(x.texto, 80, `topdeck.habilidades[${j}].texto`); });
    if (c.ban) { len(String(c.ban.numero), 3, 'ban.numero'); len(c.ban.unidade, 6, 'ban.unidade'); len(c.ban.texto, 140, 'ban.texto'); }
    req(Array.isArray(c.turnos) && c.turnos.length <= 5, 'carrossel.turnos precisa ser lista (até 5)');
    (c.turnos || []).forEach((x, j) => { cor(x.cor, `turnos[${j}].cor`); len(x.data, 12, `turnos[${j}].data`); len(x.texto, 40, `turnos[${j}].texto`); });
    if (c.sussurro) len(c.sussurro, 150, 'carrossel.sussurro');
    if (!NO_VIDEO) {
      const v = sp.video || {};
      const v1 = v.cena1 || {}, v2 = v.cena2 || {}, v3 = v.cena3 || {}, v4 = v.cena4 || {};
      len(v1.titulo, 52, 'video.cena1.titulo');
      req(Array.isArray(v1.pilulas) && v1.pilulas.length >= 1 && v1.pilulas.length <= 3, 'video.cena1.pilulas precisa de 1 a 3');
      (v1.pilulas || []).forEach((x, j) => len(x, 24, `video.cena1.pilulas[${j}]`));
      len(v2.rotulo, 20, 'video.cena2.rotulo'); cor(v2.cor, 'video.cena2.cor'); len(v2.titulo, 40, 'video.cena2.titulo'); len(v2.fonte, 60, 'video.cena2.fonte');
      req(!!v2.linhas !== !!v2.itens, 'video.cena2 precisa ter linhas OU itens');
      if (v2.linhas) { req(v2.linhas.length >= 1 && v2.linhas.length <= 2, 'video.cena2.linhas precisa de 1 a 2'); v2.linhas.forEach((x, j) => { len(x.nome, 22, `video.cena2.linhas[${j}].nome`); req(Number.isInteger(x.numero), `video.cena2.linhas[${j}].numero precisa ser inteiro`); len(x.sub, 30, `video.cena2.linhas[${j}].sub`); }); }
      if (v2.itens) { req(v2.itens.length >= 1 && v2.itens.length <= 3, 'video.cena2.itens precisa de 1 a 3'); v2.itens.forEach((x, j) => len(x, 70, `video.cena2.itens[${j}]`)); }
      req(Array.isArray(v3.linhas) && v3.linhas.length >= 2 && v3.linhas.length <= 3, 'video.cena3.linhas precisa de 2 a 3');
      (v3.linhas || []).forEach((x, j) => len(x, 60, `video.cena3.linhas[${j}]`));
      len(v4.texto, 110, 'video.cena4.texto');
      if (v4.sussurro) len(v4.sussurro, 90, 'video.cena4.sussurro');
    }
  }
  // separadores proibidos e tags
  const walk = (o, p) => {
    if (typeof o === 'string') {
      SEPS.forEach(s => { if (o.includes(s)) E.push(`${p}: separador proibido "${s}"`); });
      const tags = o.match(/<[^>]*>/g) || [];
      tags.forEach(tg => { if (!/^<\/?(b|i)>$/.test(tg)) E.push(`${p}: tag não permitida ${tg} (use só <b> e <i>)`); });
    } else if (Array.isArray(o)) o.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (o && typeof o === 'object') Object.keys(o).forEach(k => walk(o[k], p ? p + '.' + k : k));
  };
  walk(sp, '');
  return E;
}

/* ---------- ferramentas externas ---------- */
function loadPlaywright() {
  let groot = '';
  try { groot = cp.execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) {}
  const cands = ['playwright', 'playwright-core'];
  if (groot) cands.push(path.join(groot, '@playwright/mcp/node_modules/playwright'), path.join(groot, 'playwright'), path.join(groot, 'playwright-core'), path.join(groot, '@playwright/test/node_modules/playwright-core'));
  const local = path.join(os.tmpdir(), 'fdm-playwright');
  cands.push(path.join(local, 'node_modules/playwright-core'));
  for (const c of cands) { try { return require(c); } catch (e) {} }
  console.log('Playwright não encontrado, instalando playwright-core numa pasta temporária...');
  fs.mkdirSync(local, { recursive: true });
  cp.execSync('npm install --no-audit --no-fund --prefix "' + local + '" playwright-core@1.56.1', { stdio: 'inherit' });
  return require(path.join(local, 'node_modules/playwright-core'));
}
function chromePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try {
    const ds = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]);
    for (const d of ds) { const p = path.join(base, d, 'chrome-linux', 'chrome'); if (exists(p)) return p; }
  } catch (e) {}
  return undefined;
}
function hasFfmpeg() { try { cp.execSync('ffmpeg -version', { stdio: 'ignore' }); return true; } catch (e) { return false; } }

/* ---------- CSS ---------- */
function baseCSS() {
  return fs.readFileSync(path.join(TOOL, 'kit.css'), 'utf8')
    .replace(/\{\{FONTS\}\}/g, fileURL(path.join(TOOL, 'fonts')))
    .replace(/\{\{LANDS\}\}/g, fileURL(path.join(ROOT, 'lands')));
}
const SLIDES_CSS = `
.slide{width:1080px;height:1350px;margin-bottom:40px}
.pad{position:absolute;inset:0;padding:64px 64px 56px;display:flex;flex-direction:column}
.top{display:flex;align-items:center;justify-content:space-between}
.top .brand{font-size:46px}
.foot{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:20px}
.swipe{font-family:CZ;font-weight:700;letter-spacing:.12em;font-size:22px;color:var(--goldtxt);text-transform:uppercase;white-space:nowrap}
.credit{font-family:CP;font-style:italic;font-size:22px;color:var(--muted)}
.pg{font-family:CZ;font-weight:700;font-size:22px;color:var(--muted);letter-spacing:.1em}
.cover .art{position:absolute;left:0;right:0;top:0;height:960px;background-position:50% 40%;background-size:cover;background-repeat:no-repeat}
.cover .art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,15,19,.55) 0%,rgba(15,15,19,0) 20%,rgba(15,15,19,0) 45%,rgba(15,15,19,.85) 78%,#0F0F13 100%)}
.cover .foot{margin-top:34px}
.cover .kicker,.cover h1,.cover .sub{text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 2px rgba(0,0,0,.9)}
.cover .body{margin-top:auto;display:flex;flex-direction:column;gap:22px;padding-bottom:30px}
.cover .kicker{font-size:28px}
.cover h1{font-family:CZ;font-weight:700;font-size:92px;line-height:1.02;letter-spacing:.005em}
.cover .sub{font-size:44px;line-height:1.2;color:#E6DFCF}
.cover .sub b{color:#fff}
.big .card{margin-top:46px;flex:1;display:flex;flex-direction:column;gap:14px;min-height:0}
.big .tbox{flex:1;padding:44px 40px 34px;display:flex;flex-direction:column;gap:40px;margin:0 8px;min-height:0;overflow:hidden}
.li{display:grid;grid-template-columns:56px 1fr;gap:22px;align-items:start;font-size:44px;line-height:1.24}
.li .pip{--s:50px;margin-top:2px}
.tbox .src{color:#5c5547;margin-top:auto}
.row{display:grid;grid-template-columns:1fr auto;gap:6px 24px;align-items:end;padding-bottom:22px;border-bottom:2px solid rgba(0,0,0,.12)}
.row:last-of-type{border-bottom:0}
.row .nm{font-family:CZ;font-weight:700;font-size:40px;line-height:1.15}
.row .pct{font-family:CZ;font-weight:700;font-size:88px;line-height:1;color:#1F6B3F;text-align:right}
.row .pct.neg{color:#A3341F}
.row .usd{font-size:40px;color:#3b362c}
.row .why{grid-column:1/-1;font-size:36px;font-style:italic;color:#3b362c}
.td .grid{margin-top:40px;display:grid;grid-template-columns:470px 1fr;gap:40px;align-items:start}
.td .grid.noimg{grid-template-columns:1fr}
.td .cardimg{width:470px;border-radius:22px;box-shadow:0 0 0 5px #0b0a09,0 30px 60px -20px rgba(0,0,0,.9)}
.td .abil{display:flex;flex-direction:column;gap:26px}
.td .ab b{display:block;font-family:CZ;font-weight:700;font-size:34px;color:var(--goldtxt);margin-bottom:6px}
.td .ab span{font-size:36px;line-height:1.22;color:#EDE7D9}
.td .extra{margin-top:36px;font-size:36px;line-height:1.3;color:#E6DFCF;border-top:2px solid rgba(214,184,96,.4);padding-top:26px}
.td h1{font-family:CZ;font-weight:700;font-size:64px;line-height:1.05;margin-top:30px}
.ban{margin-top:44px;border-radius:24px;padding:34px 38px;display:grid;grid-template-columns:auto 1fr;gap:30px;align-items:center;background:linear-gradient(90deg,rgba(12,9,10,.94),rgba(12,9,10,.7) 55%,rgba(12,9,10,.4)),var(--land-B) 50% 58%/cover;box-shadow:0 0 0 6px #0b0a09,inset 0 0 0 2px rgba(255,255,255,.12)}
.ban .count{display:flex;flex-direction:column;align-items:center;padding:16px 26px;border-radius:18px;background:rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.25)}
.ban .count b{font-family:CZ;font-weight:700;font-size:96px;line-height:1}
.ban .count span{font-family:CZ;font-weight:700;font-size:24px;letter-spacing:.12em}
.ban h2{font-family:CZ;font-weight:700;font-size:36px;letter-spacing:.08em;display:flex;align-items:center;gap:14px}
.ban p{font-size:34px;line-height:1.28;margin-top:10px;color:#EDE7D9}
.turns{margin-top:44px;display:flex;flex-direction:column}
.turns .kicker{font-size:26px;margin-bottom:12px}
.turn{display:grid;grid-template-columns:52px 210px 1fr;gap:18px;align-items:center;padding:26px 0;border-top:2px solid rgba(255,255,255,.1);font-size:36px}
.turn .pip{--s:44px}
.turn .d{font-family:CZ;font-weight:700;font-size:30px;color:var(--goldtxt)}
.cta .rumor{margin-top:50px;border:3px dashed #8A8698;border-radius:22px;padding:30px 34px;background:rgba(255,255,255,.04)}
.cta .rumor .kicker{font-size:24px;color:#C9C4D6}
.cta .rumor p{font-size:40px;line-height:1.25;margin-top:12px}
.cta .main{margin-top:auto;margin-bottom:auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:22px}
.cta .main .brand{font-size:104px}
.cta .main .when{font-size:44px;color:#E6DFCF}
.cta .url{font-family:CZ;font-weight:700;font-size:50px;letter-spacing:.06em;color:var(--goldtxt)}
.cta .bio{font-family:CZ;font-weight:700;font-size:26px;letter-spacing:.14em;color:var(--muted)}
.cta .pool{width:100%;height:110px}
.cta .save{font-size:38px;text-align:center;color:#E6DFCF;margin-top:30px}
`;

/* ---------- carrossel ---------- */
function artBg() {
  const a = path.join(ROOT, 'img', `ed${N}-art.jpg`);
  return exists(a) ? `url('${fileURL(a)}')` : null;
}
function slidesHTML(sp) {
  const c = sp.carrossel;
  const hasAgenda = !!c.ban || (c.turnos || []).length > 0;
  const total = 1 + c.cartoes.length + 1 + (hasAgenda ? 1 : 0) + 1;
  let k = 0;
  const pg = () => `<span class="pg">${k} de ${total}</span>`;
  const out = [];
  k++;
  const art = artBg() || `var(--land-${landOf(c.capa.cor)})`;
  out.push(`<section class="slide canvas cover" id="s${k}"><div class="art" style="background-image:${art}"></div><div class="pad"><div class="top">${BRAND}<span class="chip">Edição ${N}, ${esc(sp.data)}</span></div><div class="body"><div class="kicker">${pip('M', 44)}Notícia Lendária</div><h1>${rich(c.capa.titulo)}</h1><p class="sub">${rich(c.capa.sub)}</p></div><div class="foot"><span class="credit">${esc(c.capa.credito)}</span><span class="swipe">Arrasta pro lado</span></div></div></section>`);
  for (const card of c.cartoes) {
    k++;
    const body = card.itens
      ? card.itens.map(it => `<div class="li">${pip(it.cor)}<p>${rich(it.html)}</p></div>`).join('')
      : card.linhas.map(l => `<div class="row"><span class="nm">${esc(l.nome)}</span><span class="pct${/^[-−]/.test(l.valor) ? ' neg' : ''}">${esc(l.valor)}</span><span class="usd">${esc(l.sub)}</span>${l.porque ? `<span class="why">${rich(l.porque)}</span>` : ''}</div>`).join('');
    const note = card.nota ? `<div class="note"><b>${esc(card.nota.rotulo)},</b> ${rich(card.nota.texto)}</div>` : '';
    out.push(`<section class="slide canvas big" id="s${k}"><div class="pad"><div class="top">${BRAND}${pg()}</div><div class="card fr-${card.cor}"><div class="plate"><h2>${esc(card.titulo)}</h2>${pip(card.cor, 44)}</div><div class="tbox">${body}${note}<p class="src">${esc(card.fonte)}</p></div></div></div></section>`);
  }
  k++;
  const td = c.topdeck, cardImg = path.join(ROOT, 'img', `ed${N}-card.jpg`), hasImg = exists(cardImg);
  const abil = `<div class="abil">${td.habilidades.map(h => `<div class="ab"><b>${esc(h.rotulo)}</b><span>${rich(h.texto)}</span></div>`).join('')}</div>`;
  out.push(`<section class="slide canvas td" id="s${k}"><div class="pad"><div class="top">${BRAND}${pg()}</div><div class="kicker" style="font-size:28px;margin-top:40px">${pip('M', 44)}Topdeck do Dia</div>${hasImg ? '' : `<h1>${esc(td.titulo)}</h1>`}<div class="grid${hasImg ? '' : ' noimg'}">${hasImg ? `<img class="cardimg" src="${fileURL(cardImg)}" alt="">` : ''}${abil}</div><p class="extra">${rich(td.extra)}</p><div class="foot"><span class="credit">${esc(td.credito)}</span></div></div></section>`);
  if (hasAgenda) {
    k++;
    const ban = c.ban ? `<div class="ban"><div class="count"><b>${esc(c.ban.numero)}</b><span>${esc(c.ban.unidade)}</span></div><div><h2>${pip('B', 44)}OS RISCOS DO BAN</h2><p>${rich(c.ban.texto)}</p></div></div>` : '';
    const turns = (c.turnos || []).length ? `<div class="turns"><div class="kicker">${pip('W', 40)}Próximos Turnos</div>${c.turnos.map(t => `<div class="turn">${pip(t.cor)}<span class="d">${esc(t.data)}</span><span>${rich(t.texto)}</span></div>`).join('')}</div>` : '';
    out.push(`<section class="slide canvas" id="s${k}"><div class="pad"><div class="top">${BRAND}${pg()}</div>${ban}${turns}</div></section>`);
  }
  k++;
  const rumor = c.sussurro ? `<div class="rumor"><div class="kicker">${pip('Q', 40)}Sussurro do dia</div><p>${rich(c.sussurro)}</p></div>` : '';
  const pool = 'WUBRG'.split('').map(x => `<i style="background-image:var(--land-${x})"></i>`).join('');
  out.push(`<section class="slide canvas cta" id="s${k}"><div class="pad"><div class="top"><span></span>${pg()}</div>${rumor}<div class="main">${BRAND}<p class="when">A edição completa sai todo dia às 6h</p><div class="pool">${pool}</div><span class="url">FONTEDEMANA.COM.BR</span><span class="bio">Link na bio</span></div><p class="save">Salva e manda pro seu grupo de Commander</p></div></section>`);
  return { total, html: `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${baseCSS()}${SLIDES_CSS}</style></head><body>${out.join('\n')}</body></html>` };
}

/* ---------- vídeo ---------- */
const VIDEO_CSS = `
html,body{width:1080px;height:1920px;overflow:hidden}
#stage{position:relative;width:1080px;height:1920px}
.scene{position:absolute;inset:0;opacity:0}
.a{opacity:0;will-change:transform,opacity}
.bgblur{position:absolute;inset:-80px;background-size:cover;background-position:50% 50%;filter:blur(36px) brightness(.42) saturate(1.1)}
.bug{position:absolute;left:120px;top:236px;font-size:44px}
.stack{position:absolute;left:120px;right:200px;display:flex;flex-direction:column}
.artbox{position:absolute;left:120px;top:316px;width:760px;height:556px;overflow:hidden;border-radius:14px;box-shadow:0 0 0 8px #0b0a09,0 0 0 18px #C8A345,0 0 0 22px #0b0a09,0 40px 80px -20px rgba(0,0,0,.9)}
.kbimg{position:absolute;inset:0;background-size:cover;background-position:50% 45%;transform-origin:55% 45%}
.s1 .stack{top:936px;gap:24px}
.s1 .kicker{font-size:34px}
.s1 h1{font-family:CZ;font-weight:700;font-size:80px;line-height:1.04;text-shadow:0 4px 18px rgba(0,0,0,.7)}
.pills{display:flex;flex-wrap:wrap;gap:18px;margin-top:8px}
.pill{font-family:CZ;font-weight:700;font-size:38px;padding:14px 26px;border-radius:99px;background:#F2E1A5;color:#14110D;border:3px solid #0b0a09;box-shadow:0 6px 0 rgba(0,0,0,.45)}
.s2 .stack{top:330px;gap:28px}
.s2 .kicker{font-size:36px}
.s2 h1{font-family:CZ;font-weight:700;font-size:82px;line-height:1.05}
.s2 .card{padding:12px}
.s2 .tbox{padding:40px 40px;display:flex;flex-direction:column;gap:34px}
.vrow{display:grid;grid-template-columns:1fr auto;align-items:center;gap:8px 20px}
.vrow .nm{font-family:CZ;font-weight:700;font-size:46px;line-height:1.1}
.vrow .usd{font-size:44px;color:#3b362c}
.vrow .pct{grid-row:1/3;grid-column:2;font-family:CZ;font-weight:700;font-size:120px;color:#1F6B3F;line-height:1}
.vline{font-size:48px;line-height:1.2;color:#16130F}
.s2 .src{font-size:28px}
.s3 .kicker{position:absolute;left:120px;top:300px;font-size:36px}
.s3 .cimg{position:absolute;left:280px;top:380px;width:520px;border-radius:26px;box-shadow:0 0 0 6px #0b0a09,0 40px 80px -20px rgba(0,0,0,.95)}
.s3 .tdname{position:absolute;left:120px;right:200px;top:520px;font-family:CZ;font-weight:700;font-size:96px;line-height:1.05}
.s3 .stack{top:1150px;gap:26px}
.ab{font-size:52px;line-height:1.15;color:#EDE7D9}
.ab b{font-family:CZ;font-weight:700;color:var(--goldtxt)}
.s4 .countbox{position:absolute;left:290px;top:330px;width:500px;height:380px;border-radius:30px;background:rgba(0,0,0,.5);border:3px solid rgba(255,255,255,.28);display:flex;flex-direction:column;align-items:center;justify-content:center}
.s4 .countbox b{font-family:CZ;font-weight:700;font-size:240px;line-height:.9}
.s4 .countbox span{font-family:CZ;font-weight:700;font-size:48px;letter-spacing:.14em}
.s4 .stack{top:770px;gap:40px}
.s4 .stack.noban{top:330px}
.s4 h2{font-family:CZ;font-weight:700;font-size:58px;letter-spacing:.06em;display:flex;align-items:center;gap:20px}
.s4 .txt{font-size:54px;line-height:1.22}
.s4 .vturn{display:grid;grid-template-columns:70px 250px 1fr;gap:20px;align-items:center;font-size:48px;line-height:1.15;padding:22px 0;border-top:2px solid rgba(255,255,255,.14)}
.s4 .vturn .d{font-family:CZ;font-weight:700;font-size:42px;color:var(--goldtxt)}
.s4 .rum{border:4px dashed #8A8698;border-radius:26px;padding:34px 38px;background:rgba(15,15,19,.75)}
.s4 .rum .kicker{font-size:30px;color:#C9C4D6}
.s4 .rum p{font-size:50px;line-height:1.2;margin-top:14px}
.s5 .c{position:absolute;left:120px;right:120px;text-align:center}
.s5 .brand{font-size:94px;white-space:nowrap}
.s5 .when{font-size:56px;color:#E6DFCF}
.s5 .pool{position:absolute;left:120px;right:120px;top:930px;height:150px}
.s5 .url{font-family:CZ;font-weight:700;font-size:66px;letter-spacing:.05em;color:var(--goldtxt)}
.s5 .bio{font-family:CZ;font-weight:700;font-size:36px;letter-spacing:.16em;color:var(--muted)}
.s5 .follow{display:inline-block;font-family:CZ;font-weight:700;font-size:48px;padding:18px 40px;border-radius:99px;background:#F2E1A5;color:#14110D;border:3px solid #0b0a09;box-shadow:0 8px 0 rgba(0,0,0,.45)}
`;
const VIDEO_JS = `
var X=0.4;
function clamp(x){return x<0?0:x>1?1:x}
function ease(x){return 1-Math.pow(1-x,3)}
var scenes=[].slice.call(document.querySelectorAll('.scene'));
var anims=[].slice.call(document.querySelectorAll('.a'));
var cnts=[].slice.call(document.querySelectorAll('.cnt'));
var kb=document.getElementById('kb');
window.setT=function(t){
  scenes.forEach(function(s,i){
    var a=+s.dataset.start,b=+s.dataset.end,o;
    if(i===0)o=t<b?1:1-clamp((t-b)/X);
    else o=clamp((t-a)/X)*(i===scenes.length-1?1:1-clamp((t-b)/X));
    s.style.opacity=o;s.style.display=o<=0?'none':'block';
  });
  anims.forEach(function(e){
    var st=+e.dataset.t,d=+(e.dataset.d||.55),dy=+(e.dataset.dy||46);
    var p=ease(clamp((t-st)/d));
    e.style.opacity=p;e.style.transform='translateY('+((1-p)*dy)+'px)';
  });
  cnts.forEach(function(e){
    var p=ease(clamp((t-(+e.dataset.t))/(+e.dataset.d)));
    e.textContent=Math.round(p*(+e.dataset.to)).toLocaleString('pt-BR');
  });
  if(kb)kb.style.transform='scale('+(1+0.10*clamp(t/13))+')';
};
setT(0);
`;
function videoHTML(sp) {
  const v = sp.video, c = sp.carrossel;
  const art = artBg() || `var(--land-${landOf(c.capa.cor)})`;
  const bug = '<div class="bug brand">Fonte <span class="de">de</span> Mana</div>';
  const pillT = [5.2, 7.0, 9.4];
  const s1 = `<section class="scene s1" data-start="0" data-end="13"><div class="bgblur" style="background-image:${art}"></div><div class="bug brand a" data-t="0" data-d=".4">Fonte <span class="de">de</span> Mana</div><div class="artbox a" data-t="0" data-d=".6"><div id="kb" class="kbimg" style="background-image:${art}"></div></div><div class="stack"><div class="kicker a" data-t=".4">${pip('M', 52)}Notícia Lendária</div><h1 class="a" data-t=".8">${rich(v.cena1.titulo)}</h1><div class="pills">${v.cena1.pilulas.map((p, i) => `<span class="pill a" data-t="${pillT[i]}">${esc(p)}</span>`).join('')}</div></div></section>`;
  const v2 = v.cena2;
  let rows;
  if (v2.linhas) {
    rows = v2.linhas.map((l, i) => {
      const t0 = i === 0 ? 14.6 : 17.9;
      const neg = l.numero < 0;
      return `<div class="vrow${i ? ' a' : ''}"${i ? ' data-t="17.6"' : ''}><span class="nm">${esc(l.nome)}</span><span class="pct"${neg ? ' style="color:#A3341F"' : ''}>${esc(l.prefixo || '')}<span class="cnt" data-to="${Math.abs(l.numero)}" data-t="${t0}" data-d="1.4">0</span>${esc(l.sufixo || '')}</span><span class="usd">${esc(l.sub)}</span></div>`;
    }).join('');
  } else {
    rows = v2.itens.map((x, i) => `<p class="vline${i ? ' a' : ''}"${i ? ` data-t="${[0, 15.6, 17.6][i]}"` : ''}>${rich(x)}</p>`).join('');
  }
  const s2 = `<section class="scene s2" data-start="13" data-end="21">${bug}<div class="stack"><div class="kicker a" data-t="13.2">${pip(v2.cor, 52)}${esc(v2.rotulo)}</div><h1 class="a" data-t="13.4">${rich(v2.titulo)}</h1><div class="card fr-${v2.cor} a" data-t="13.8"><div class="tbox">${rows}</div></div><p class="src a" data-t="14.2">${esc(v2.fonte)}</p></div></section>`;
  const cardImg = path.join(ROOT, 'img', `ed${N}-card.jpg`), hasImg = exists(cardImg);
  const lineT = [24.0, 26.4, 29.0];
  const s3 = `<section class="scene s3" data-start="21" data-end="32">${bug}<div class="kicker a" data-t="21.2">${pip('M', 52)}Topdeck do Dia</div>${hasImg ? `<img class="cimg a" data-t="21.4" data-d=".7" data-dy="120" src="${fileURL(cardImg)}" alt="">` : `<h1 class="tdname a" data-t="21.4">${esc(c.topdeck.titulo)}</h1>`}<div class="stack">${v.cena3.linhas.map((x, i) => `<p class="ab a" data-t="${lineT[i]}">${rich(x)}</p>`).join('')}</div></section>`;
  const v4 = v.cena4;
  const rum = v4.sussurro ? `<div class="rum a" data-t="36.6"><div class="kicker">${pip('Q', 46)}Sussurro</div><p>${rich(v4.sussurro)}</p></div>` : '';
  let s4;
  if (c.ban) {
    s4 = `<section class="scene s4" data-start="32" data-end="41"><div class="bgblur" style="background-image:var(--land-B)"></div>${bug}<div class="countbox a" data-t="32.2"><b>${esc(c.ban.numero)}</b><span>${esc(c.ban.unidade)}</span></div><div class="stack"><h2 class="a" data-t="32.6">${pip('B', 56)}OS RISCOS DO BAN</h2><p class="txt a" data-t="33.0">${rich(v4.texto)}</p>${rum}</div></section>`;
  } else {
    const tt = (c.turnos || []).slice(0, 3);
    s4 = `<section class="scene s4" data-start="32" data-end="41"><div class="bgblur" style="background-image:var(--land-W)"></div>${bug}<div class="stack noban"><h2 class="a" data-t="32.2">${pip('W', 56)}PRÓXIMOS TURNOS</h2>${tt.map((t, i) => `<div class="vturn a" data-t="${(32.6 + i * 0.5).toFixed(1)}">${pip(t.cor, 56)}<span class="d">${esc(t.data)}</span><span>${rich(t.texto)}</span></div>`).join('')}<p class="txt a" data-t="34.4">${rich(v4.texto)}</p>${rum}</div></section>`;
  }
  const pool = 'WUBRG'.split('').map(x => `<i style="background-image:var(--land-${x})"></i>`).join('');
  const s5 = `<section class="scene s5" data-start="41" data-end="48"><div class="c a" data-t="41.2" style="top:520px"><div class="brand">Fonte <span class="de">de</span> Mana</div></div><p class="c when a" data-t="41.8" style="top:760px">A edição completa sai todo dia às 6h</p><div class="pool a" data-t="42.2">${pool}</div><p class="c url a" data-t="42.8" style="top:1130px">FONTEDEMANA.COM.BR</p><p class="c bio a" data-t="43.2" style="top:1225px">Link na bio</p><div class="c a" data-t="44.0" style="top:1330px"><span class="follow">Segue @fontedemana</span></div></section>`;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${baseCSS()}${VIDEO_CSS}</style></head><body><div id="stage" class="canvas">${s1}${s2}${s3}${s4}${s5}</div><script>${VIDEO_JS}</script></body></html>`;
}

/* ---------- renderização ---------- */
async function render(sp) {
  const pw = loadPlaywright();
  const chromium = pw.chromium;
  const exe = chromePath();
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-kit-'));
  const problems = [];
  try {
    // carrossel
    const { total, html } = slidesHTML(sp);
    const sf = path.join(tmp, 'slides.html');
    fs.writeFileSync(sf, html);
    const p = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
    await p.goto(fileURL(sf));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(600);
    const ov = await p.evaluate(() => {
      const out = [];
      document.querySelectorAll('.slide').forEach(s => {
        const sb = s.getBoundingClientRect();
        s.querySelectorAll('.pad,.tbox,.rumor,.ban').forEach(e => { if (e.scrollHeight > e.clientHeight + 2) out.push(`carrossel ${s.id}: texto demais (${e.className.split(' ')[0]} transborda ${e.scrollHeight - e.clientHeight}px)`); });
        s.querySelectorAll('.pad *').forEach(e => {
          const b = e.getBoundingClientRect();
          if (!b.width && !b.height) return;
          if (b.bottom > sb.bottom - 20 || b.right > sb.right - 20) out.push(`carrossel ${s.id}: "${(e.textContent || e.className).trim().slice(0, 40)}" passa da borda`);
        });
      });
      return out;
    });
    problems.push(...[...new Set(ov)].slice(0, 12));
    const imgs = [];
    if (!problems.length) {
      for (let i = 1; i <= total; i++) {
        const el = await p.$('#s' + i);
        const f = path.join(DIR, `carrossel-${String(i).padStart(2, '0')}.jpg`);
        await el.screenshot({ path: f, type: 'jpeg', quality: 93 });
        imgs.push(f);
      }
      // remove slides antigos que sobraram de uma geração anterior com mais slides
      fs.readdirSync(DIR).filter(f => /^carrossel-\d+\.jpg$/.test(f) && +f.slice(10, 12) > total).forEach(f => fs.unlinkSync(path.join(DIR, f)));
      console.log(`Carrossel: ${total} imagens em kit/ed${N}/`);
    }
    await p.close();
    // vídeo
    if (!problems.length && !NO_VIDEO) {
      if (!hasFfmpeg()) { console.log('AVISO: ffmpeg não encontrado, o vídeo não foi gerado.'); }
      else {
        const vf = path.join(tmp, 'video.html');
        fs.writeFileSync(vf, videoHTML(sp));
        const vp = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
        await vp.goto(fileURL(vf));
        await vp.evaluate(() => document.fonts.ready);
        await vp.waitForTimeout(600);
        for (const [t, nome] of [[12.5, 'cena 1'], [20.5, 'cena 2'], [31.5, 'cena 3'], [40.5, 'cena 4'], [47.5, 'cena 5']]) {
          const bad = await vp.evaluate(tt => {
            setT(tt);
            const out = [];
            document.querySelectorAll('.scene').forEach(s => {
              if (s.style.display === 'none' || +s.style.opacity < 0.5) return;
              s.querySelectorAll('*').forEach(e => {
                if (e.classList.contains('bgblur') || e.closest('.bgblur')) return;
                const b = e.getBoundingClientRect();
                if (!b.width && !b.height) return;
                if (b.bottom > 1720 || b.right > 1080) out.push(`"${(e.textContent || e.className).trim().slice(0, 40)}"`);
              });
            });
            return out;
          }, t);
          if (bad.length) problems.push(`vídeo ${nome}: ${[...new Set(bad)].slice(0, 3).join(', ')} passa da área segura, encurte o texto`);
        }
        if (!problems.length) {
          const out = path.join(DIR, `video-vertical-ed${N}.mp4`);
          await new Promise((resolve, reject) => {
            const ff = cp.spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS), out]);
            ff.stderr.on('data', d => process.stderr.write(d));
            ff.on('error', reject);
            ff.on('close', code => code === 0 ? resolve() : reject(new Error('ffmpeg saiu com código ' + code)));
            (async () => {
              const total = VIDEO_DUR * FPS, t0 = Date.now();
              for (let i = 0; i < total; i++) {
                await vp.evaluate(tt => setT(tt), i / FPS);
                const buf = await vp.screenshot({ type: 'jpeg', quality: 90 });
                if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
                if (i % 360 === 0) console.log(`Vídeo: quadro ${i} de ${total} (${Math.round((Date.now() - t0) / 1000)} s)`);
              }
              ff.stdin.end();
            })().catch(reject);
          });
          console.log(`Vídeo: kit/ed${N}/video-vertical-ed${N}.mp4`);
        }
        await vp.close();
      }
    }
  } finally {
    await browser.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

/* ---------- páginas ---------- */
const PAGE_CSS = `
:root{--bg:#0F0F13;--panel:#19191F;--ink:#ECEAF3;--muted:#A8A5B6;--line:#30303A;--gold:#D6B860}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Crimson Pro",Georgia,serif;font-size:18px;line-height:1.5}
.wrap{max-width:1100px;margin:0 auto;padding:24px 16px 64px;display:flex;flex-direction:column;gap:32px}
h1,h2,h3{font-family:Cinzel,Georgia,serif;margin:0}h1{font-size:clamp(28px,6vw,44px)}h2{font-size:22px;letter-spacing:.06em;text-transform:uppercase;color:var(--gold)}h3{font-size:16px;letter-spacing:.04em}
.how{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 18px;color:var(--muted);margin:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
.grid.car{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}
figure{margin:0;background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden}
figure img{display:block;width:100%;height:auto;object-fit:cover;background:#000}
figcaption{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 10px;font-size:15px;color:var(--muted)}
a.dl,button{font-family:Cinzel,Georgia,serif;font-size:13px;color:#14110D;background:#F2E1A5;border:0;border-radius:99px;padding:6px 14px;text-decoration:none;cursor:pointer;white-space:nowrap}
video{width:100%;max-width:360px;border-radius:12px;background:#000;display:block}
.vid{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end}
.col{display:flex;flex-direction:column;gap:14px}
.tx{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.txh{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px}
.cc{font-family:"Crimson Pro",Georgia,serif;font-weight:400;font-size:14px;letter-spacing:0;color:var(--muted);white-space:nowrap}
.obs{margin:8px 0 0;font-size:15px;color:var(--muted);font-style:italic}
h3.sub{font-size:15px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-top:6px}
pre{white-space:pre-wrap;word-wrap:break-word;font-family:inherit;font-size:17px;margin:0}
.prev{display:flex;flex-wrap:wrap;gap:10px}
.prev a{color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:99px;padding:8px 16px;text-decoration:none}
a{color:var(--gold)}
`;
const PAGE_JS = `document.querySelectorAll('button[data-i]').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById('t'+b.dataset.i).innerText;var done=function(){b.textContent='Copiado';setTimeout(function(){b.textContent='Copiar';},1500);};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,function(){fallback(t);done();});}else{fallback(t);done();}});});
function fallback(t){var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');}catch(e){}document.body.removeChild(a);}`;
const HOW = 'No iPhone ou iPad, toque e segure a imagem e escolha Salvar na Fotos (ou Adicionar às Fotos). No vídeo, toque em Baixar vídeo, abra o download pela setinha da barra do Safari e use Compartilhar e depois Salvar Vídeo. Os textos têm o botão Copiar.';

function pageShell(title, body) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>${esc(title)}</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap">
<style>${PAGE_CSS}</style></head><body><div class="wrap">
${body}
</div>
<script>${PAGE_JS}</script></body></html>
`;
}
function makeCounter() { let i = 0; return () => i++; }
function txBlock(id, title, text, opts = {}) {
  const cc = opts.count ? ` <span class="cc">${text.length} caracteres</span>` : '';
  const obs = opts.obs ? `<p class="obs">${esc(opts.obs)}</p>` : '';
  return `<section class="tx"><div class="txh"><h3>${esc(title)}${cc}</h3><button type="button" data-i="${id}">Copiar</button></div><pre id="t${id}">${esc(text)}</pre>${obs}</section>`;
}
function editionSection(n, prefix, next) {
  const sp = readSpec(n), d = path.join(KIT, 'ed' + n), t = sp.textos;
  const slides = fs.readdirSync(d).filter(f => /^carrossel-\d+\.(jpg|png)$/.test(f)).sort();
  const video = `video-vertical-ed${n}.mp4`;
  const hasVideo = exists(path.join(d, video));
  const parts = [];
  parts.push(`<section class="col"><h2>Edição ${n}, ${esc(sp.data)}</h2>`);
  if (hasVideo) parts.push(`<div class="vid"><video src="${prefix}${video}" controls playsinline preload="metadata"></video><a class="dl" href="${prefix}${video}" download>Baixar vídeo</a></div>`);
  if (slides.length) parts.push(`<div class="grid car">${slides.map((f, i) => `<figure><img src="${prefix}${f}" alt="Carrossel ${i + 1} de ${slides.length}" style="aspect-ratio:4/5"><figcaption>Carrossel ${i + 1} de ${slides.length} <a class="dl" href="${prefix}${f}" download>Baixar</a></figcaption></figure>`).join('')}</div>`);
  parts.push('</section>');
  const blocos = [
    txBlock(next(), 'Legenda do carrossel (Instagram)', t.legendaCarrossel.trim() + '\n\n' + DISCLAIMER),
    txBlock(next(), 'Legenda do vídeo (Reels)', t.legendaVideo.trim() + '\n\n' + DISCLAIMER)
  ];
  if (Array.isArray(t.narracao) && t.narracao.length) blocos.push(txBlock(next(), 'Roteiro da narração', t.narracao.map(x => x.cena + '\n' + x.texto).join('\n\n') + '\n\n' + IA_NOTE));
  parts.push(`<section class="col"><h2>Instagram, edição ${n}</h2>${blocos.join('')}</section>`);
  const media = [];
  if (t.threadsCarrossel) media.push(txBlock(next(), 'Post com as imagens do carrossel', t.threadsCarrossel.trim() + '\n\n' + DISCLAIMER, { count: true, obs: `Anexe as ${slides.length || ''} imagens do carrossel no mesmo post, na ordem. O Threads aceita até 20.`.replace('as  imagens', 'as imagens') }));
  if (t.threadsVideo) media.push(txBlock(next(), 'Post com o vídeo', t.threadsVideo.trim() + '\n\n' + DISCLAIMER, { count: true, obs: 'Anexe o vídeo vertical da edição.' }));
  const unico = t.threadsPost ? txBlock(next(), 'Post único da notícia (Threads das 15:00)', t.threadsPost, { count: true }) : '';
  const fio = t.threadsFio.concat([DISCLAIMER]);
  const fioHTML = fio.map((x, i) => txBlock(next(), `Fio, post ${i + 1} de ${fio.length}${x === DISCLAIMER ? ' (aviso de conteúdo de fã)' : ''}`, x, { count: true })).join('');
  const av = (t.threadsAvulsos || []).map(a => txBlock(next(), a.titulo, a.texto, { count: true, obs: a.obs })).join('');
  parts.push(`<section class="col"><h2>Threads, edição ${n}</h2><p class="how">Cada post do Threads aceita até 500 caracteres, e todos aqui cabem. Os posts com imagem e com vídeo já levam o aviso de conteúdo de fã no fim. No fio, publique o post 1 e vá adicionando os seguintes como continuação, na ordem. Os posts avulsos são para espalhar ao longo do dia. Use uma tag por post, a sugestão é MTG.</p>${media.length ? '<h3 class="sub">Posts com imagem e vídeo</h3>' + media.join('') : ''}${unico ? '<h3 class="sub">Post único da notícia</h3>' + unico : ''}<h3 class="sub">Fio do dia</h3>${fioHTML}${av ? '<h3 class="sub">Posts avulsos</h3>' + av : ''}</section>`);
  return parts.join('\n');
}
function editionsAvailable() {
  return fs.readdirSync(KIT).filter(d => /^ed\d+$/.test(d) && exists(path.join(KIT, d, 'kit.json'))).map(d => +d.slice(2)).sort((a, b) => b - a);
}
function perfilSection(next) {
  const pf = JSON.parse(fs.readFileSync(path.join(TOOL, 'perfil.json'), 'utf8'));
  const figs = pf.imagens.map(im => `<figure><img src="perfil/${im.arquivo}" alt="${esc(im.nome)}" style="aspect-ratio:${im.proporcao}"><figcaption>${esc(im.nome)} <a class="dl" href="perfil/${im.arquivo}" download>Baixar</a></figcaption></figure>`).join('');
  return `<section class="col"><h2>Perfil do Instagram</h2><div class="grid">${figs}</div>${txBlock(next(), 'Bio do Instagram', pf.bio)}</section>`;
}
function writePages() {
  const eds = editionsAvailable();
  for (const n of eds.includes(N) ? [N] : []) {
    const next = makeCounter();
    const body = `<h1>Kit de Redes, edição ${n}</h1>\n<p class="how">${HOW}</p>\n<p><a href="../">Ver o kit mais recente e o perfil do Instagram</a></p>\n${editionSection(n, '', next)}`;
    fs.writeFileSync(path.join(KIT, 'ed' + n, 'index.html'), pageShell(`Kit de Redes, edição ${n}, Fonte de Mana`, body));
  }
  const latest = eds[0];
  const next = makeCounter();
  const prev = eds.slice(1).map(n => `<a href="ed${n}/">Edição ${n}</a>`).join('');
  const body = `<h1>Kit de Redes</h1>\n<p class="how">${HOW}</p>\n${editionSection(latest, `ed${latest}/`, next)}\n${perfilSection(next)}\n${prev ? `<section class="col"><h2>Kits anteriores</h2><div class="prev">${prev}</div></section>` : ''}`;
  fs.writeFileSync(path.join(KIT, 'index.html'), pageShell('Kit de Redes, Fonte de Mana', body));
  console.log(`Páginas: kit/ed${N}/index.html e kit/index.html (mais recente: edição ${latest})`);
}

/* ---------- principal ---------- */
function fail(lista) { console.log('ERROS:\n' + lista.map(e => '  ' + e).join('\n')); process.exit(1); }

(async () => {
  if (!exists(path.join(DIR, 'kit.json'))) { console.error(`Não achei kit/ed${N}/kit.json`); process.exit(2); }
  const sp = readSpec(N);
  const errs = validate(sp);
  if (errs.length) fail(errs);
  if (!ONLY_PAGE) {
    const probs = await render(sp);
    if (probs.length) fail(probs);
  }
  writePages();
  console.log(`OK, kit da edição ${N} pronto.`);
})().catch(e => { console.error('ERRO: ' + (e && e.stack || e)); process.exit(1); });
