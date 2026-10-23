#!/usr/bin/env node
/* Vídeo de gancho do TikTok da Fonte de Mana (pauta diária).
   Uso:
     node tools/pauta/tiktok.cjs <raiz do repositório> <AAAA-MM-DD>
       lê pauta/<data>/tiktok/roteiro.json, gera cena-1.jpg em diante e tiktok-mudo.mp4 (sem som, tempo estimado pela narração)
     node tools/pauta/tiktok.cjs <raiz do repositório> <AAAA-MM-DD> --narrar <audio da cena 1> <audio da cena 2> ...
       um áudio por cena, na ordem; corta o silêncio das pontas, ajusta cada cena ao tempo da fala e gera tiktok-narrado.mp4
       (com ganchoB no roteiro, o último áudio é o do gancho B e sai também tiktok-teste-narrado.mp4)
   A partir de plano.json > video.desde vale o molde novo: cenas curtas, partes reveladas uma de cada vez
   (cena-N-pK.jpg) e, com ganchoB, a versão de teste (cena-1b.jpg, tiktok-teste.mp4).
   A partir de plano.json > rosto.desde vale a cena "rosto": no vídeo mudo ela sai como cena de texto; na narração, se o
   arquivo dessa cena for um vídeo (o Paulo falando para a câmera), ele entra no lugar do quadro, com o título por cima
   (cena-N-rosto.png). Na narração, cada arquivo pode ser áudio ou vídeo; das cenas sem rosto, só a voz é usada.
   Formato do roteiro.json em tools/pauta/LEIA.md. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
const IDX = process.argv.indexOf('--narrar');
const AUDIOS = IDX > 0 ? process.argv.slice(IDX + 1) : null;
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/pauta/tiktok.cjs <raiz> <AAAA-MM-DD> [--narrar a1 a2 ...]'); process.exit(2); }
const DIR = path.join(ROOT, 'pauta', DATA, 'tiktok');
const FPS = 30, FADE = 0.4;
const SEPS = [' · ', ' – ', ' — ', '—'];
const TIPOS = ['gancho', 'lista', 'texto', 'cta', 'quiz', 'resposta', 'combo', 'rosto'];
/* Zona segura no quadro de 1080x1920 (medida num iPhone em 17 out 2026 e conferida com o guia de zonas seguras do TikTok):
   o app amplia o vídeo para preencher a tela e corta as laterais, o zoom do movimento corta mais 26 px por lado,
   os botões ocupam a direita da metade de baixo e a legenda ocupa o rodapé. Texto entre x 120 e 880 e acima de y 1560. */
const LIMITE_BAIXO = 1560;
const LETRAS = 'ABCD';
/* Molde do vídeo (plano.json > video), só para datas a partir de video.desde: cenas curtas, revelação progressiva
   (título, subtítulo, linhas, opções e cartas entram um de cada vez) e versão de teste com gancho B (r.ganchoB).
   Antes dessa data, tudo segue como antes: um quadro por cena. */
const PLANO = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/conteudo/plano.json'), 'utf8')); } catch (e) { return {}; } })();
const V = PLANO.video && PLANO.video.desde && DATA >= PLANO.video.desde ? PLANO.video : null;
/* Paulo no vídeo (plano.json > rosto): cena do tipo rosto, gravada por ele em vídeo, nos pilares da lista */
const RO = V && PLANO.rosto && PLANO.rosto.desde && DATA >= PLANO.rosto.desde ? PLANO.rosto : null;

const exists = p => { try { return fs.statSync(p).size > 0; } catch (e) { return false; } };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rich = s => esc(s).replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>').replace(/&amp;amp;/g, '&amp;');
const plain = s => String(s == null ? '' : s).replace(/<\/?(b|i)>/g, '');
const furl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/');

/* ---------- validação ---------- */
function validate(r) {
  const E = [];
  const req = (c, m) => { if (!c) E.push(m); };
  const len = (s, max, nome, opcional) => {
    if (opcional && (s == null || s === '')) return;
    req(typeof s === 'string' && s.trim(), nome + ' está vazio');
    if (typeof s === 'string') req(plain(s).length <= max, `${nome} tem ${plain(s).length} caracteres (máximo ${max})`);
  };
  req(r.data === DATA, 'roteiro.json: data precisa ser ' + DATA);
  len(r.tema, 80, 'tema');
  const [cmin, cmax] = V ? V.cenas : [3, 5];
  req(Array.isArray(r.cenas) && r.cenas.length >= cmin && r.cenas.length <= cmax, `cenas precisa de ${cmin} a ${cmax} itens`);
  const falaMax = (c, i) => !V ? 260 : (c.tipo === 'gancho' || (c.tipo === 'rosto' && i === 0)) ? V.ganchoMax : c.tipo === 'cta' ? V.ctaMax : V.narracaoMax;
  (r.cenas || []).forEach((c, i) => {
    const n = 'cenas[' + i + ']';
    req(TIPOS.includes(c.tipo), n + '.tipo precisa ser ' + TIPOS.join(', '));
    if (c.tipo === 'quiz' || c.tipo === 'resposta') {
      req(Array.isArray(c.opcoes) && c.opcoes.length >= 2 && c.opcoes.length <= 4, n + '.opcoes precisa de 2 a 4 textos');
      (c.opcoes || []).forEach((o, j) => len(o, 40, `${n}.opcoes[${j}]`));
    }
    if (c.tipo === 'resposta') req(typeof c.certa === 'string' && c.certa.length === 1 && LETRAS.slice(0, (c.opcoes || []).length).includes(c.certa), n + '.certa precisa ser a letra da opção certa (A, B, C ou D)');
    if (c.contagem != null) req(c.tipo === 'quiz' && Number.isInteger(c.contagem) && c.contagem >= 3 && c.contagem <= 5, n + '.contagem só vale em cena quiz, inteiro de 3 a 5 (segundos)');
    if (c.tipo === 'quiz') {
      const resp = (r.cenas || []).slice(i + 1).find(x => x.tipo === 'resposta');
      req(resp, n + ': cena quiz precisa de uma cena resposta depois dela');
      if (resp) req(JSON.stringify(resp.opcoes) === JSON.stringify(c.opcoes), n + ': a cena resposta precisa repetir as mesmas opcoes do quiz, na mesma ordem');
    }
    req('WUBRGAM'.includes(c.cor || 'A') && String(c.cor || 'A').length === 1, n + '.cor inválida');
    len(c.narracao, falaMax(c, i), n + '.narracao');
    if (c.tipo === 'rosto') { req(RO, n + ': cena rosto só vale a partir de ' + ((PLANO.rosto || {}).desde || 'plano.json > rosto.desde')); len(c.gravar, 140, n + '.gravar (o que o Paulo mostra e faz na gravação)'); }
    len(c.chip, 18, n + '.chip', true);
    len(c.kicker, 40, n + '.kicker');
    if (c.tipo !== 'lista') len(c.titulo, 64, n + '.titulo');
    len(c.sub, 140, n + '.sub', true);
    len(c.rodape, 110, n + '.rodape', true);
    len(c.fonte, 60, n + '.fonte', true);
    len(c.destaque, 24, n + '.destaque', true);
    if (c.tipo === 'combo') {
      req(Array.isArray(c.cartas) && c.cartas.length >= 1 && c.cartas.length <= 3, n + '.cartas precisa de 1 a 3 imagens');
      (c.cartas || []).forEach((f, j) => req(typeof f === 'string' && exists(path.join(ROOT, f)), `${n}.cartas[${j}] não encontrada: ${f}`));
      req(Array.isArray(c.passos) && c.passos.length >= 2 && c.passos.length <= 4, n + '.passos precisa de 2 a 4');
      if (c.inicio != null) req(Number.isInteger(c.inicio) && c.inicio >= 1 && c.inicio <= 9, n + '.inicio precisa ser inteiro de 1 a 9 (primeiro número das cartas e dos passos)');
      (c.passos || []).forEach((p, j) => { len(p.txt, 70, `${n}.passos[${j}].txt`); len(p.valor, 10, `${n}.passos[${j}].valor`, true); });
    }
    if (c.tipo === 'lista') {
      req(Array.isArray(c.linhas) && c.linhas.length >= 1 && c.linhas.length <= 3, n + '.linhas precisa de 1 a 3');
      (c.linhas || []).forEach((l, j) => { len(l.nome, 30, `${n}.linhas[${j}].nome`); len(l.valor, 12, `${n}.linhas[${j}].valor`); len(l.real, 16, `${n}.linhas[${j}].real`, true); if (/US\$/.test(l.valor || '') && r.fx) req(/^\(R\$ /.test(l.real || ''), `${n}.linhas[${j}].real precisa do valor em reais entre parênteses`); });
    }
  });
  if (V) {
    if (r.pilar != null) req((PLANO.pilares || {})[r.pilar], 'pilar desconhecido em plano.json: ' + r.pilar);
    if (RO && Array.isArray(r.cenas)) {
      const nr = r.cenas.filter(c => c.tipo === 'rosto').length;
      if ((RO.pilares || []).includes(r.pilar)) req(r.cenas[0] && r.cenas[0].tipo === 'rosto', 'no pilar ' + r.pilar + ' o Paulo aparece no vídeo: a cena 1 precisa ser do tipo rosto (plano.json > rosto)');
      req(nr <= (RO.maxCenas || 3), `no máximo ${RO.maxCenas || 3} cenas rosto por vídeo (tem ${nr})`);
    }
    if (r.ganchoB != null) {
      const g = r.ganchoB;
      req(g && typeof g === 'object' && (g.tipo || 'gancho') === 'gancho', 'ganchoB precisa ser uma cena do tipo gancho');
      if (g && typeof g === 'object') {
        req('WUBRGAM'.includes(g.cor || 'A') && String(g.cor || 'A').length === 1, 'ganchoB.cor inválida');
        len(g.narracao, V.ganchoMax, 'ganchoB.narracao'); len(g.kicker, 40, 'ganchoB.kicker'); len(g.titulo, 64, 'ganchoB.titulo');
        len(g.sub, 140, 'ganchoB.sub', true); len(g.chip, 18, 'ganchoB.chip', true);
        req(plain(g.titulo) !== plain(((r.cenas || [])[0] || {}).titulo), 'ganchoB.titulo precisa ser diferente do título da cena 1 (é o gancho que está sendo testado)');
      }
    }
    if (Array.isArray(r.cenas) && !E.length) {
      const est = r.cenas.map(c => estimate(c.narracao));
      const soma = est.reduce((a, b) => a + b, 0);
      const teto = (V.longos || []).includes(r.pilar) ? V.segundosLongos : V.segundos[1];
      req(soma <= teto + 2, `a fala soma uns ${soma.toFixed(0)} s (máximo ${teto} s${r.pilar ? ' para o pilar ' + r.pilar : ''}, sem contar a contagem): encurte as falas ou tire uma cena`);
      r.cenas.forEach((c, i) => { if (c.tipo === 'rosto') return; const b = nBlocos(c), cada = est[i] / b; req(cada <= V.parado, `cena ${i + 1} fica uns ${cada.toFixed(1)} s com a mesma tela (${b} ${b > 1 ? 'partes' : 'parte'} para ${est[i].toFixed(1)} s de fala): encurte a fala, acrescente sub ou rodapé, ou divida em duas cenas`); });
    }
  } else req(r.ganchoB == null, 'ganchoB só vale a partir de ' + ((PLANO.video || {}).desde || 'a data do molde novo'));
  // isca de engajamento (plano.json > isca, desde 26 out 2026): fala, tela, legenda e comentário sem "comenta X", "marca quem" ou "manda pro amigo"
  if (PLANO.isca && PLANO.isca.desde && DATA >= PLANO.isca.desde) {
    const juntar = v => typeof v === 'string' ? v : Array.isArray(v) ? v.map(juntar).join('\n') : v && typeof v === 'object' ? Object.values(v).map(juntar).join('\n') : '';
    const tx = juntar([r.cenas, r.ganchoB, r.legenda, r.comentario]);
    (PLANO.isca.padroes || []).forEach(x => { const m = tx.match(new RegExp(x, 'im')); if (m) E.push(`isca de engajamento: "${tx.slice(m.index, m.index + m[0].length + 25).replace(/^[.!?:\s]+/, '').split('\n')[0]}". Troque por uma pergunta aberta ("Qual é a certa?", "Qual entra no seu deck?"), sem pedir comentário, marcação ou envio`); });
  }
  if (r.arte) req(exists(path.join(ROOT, r.arte)), 'arte não encontrada: ' + r.arte);
  if (r.carta) req(exists(path.join(ROOT, r.carta)), 'carta não encontrada: ' + r.carta);
  const texto = JSON.stringify(r);
  SEPS.forEach(s => req(!texto.includes(s), 'separador proibido: "' + s + '"'));
  const semLinhas = JSON.stringify({ c: (r.cenas || []).concat(r.ganchoB && typeof r.ganchoB === 'object' ? [r.ganchoB] : []).map(c => Object.assign({}, c, { linhas: undefined, narracao: undefined })), l: r.legenda || '', m: r.comentario || '' });
  if (r.fx) { const re = /US\$ ?\d+(?:[.,]\d+)*/g; let m; while ((m = re.exec(semLinhas))) if (!/^ ?\(R\$ ?\d/.test(semLinhas.slice(re.lastIndex, re.lastIndex + 8))) E.push('valor em dólar sem o real entre parênteses: ' + m[0]); }
  else req(!/\(R\$/.test(texto), 'tem valor em reais mas falta fx com a nota da cotação');
  return E;
}

/* ---------- navegador ---------- */
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

/* ---------- quadros ---------- */
/* Partes que entram uma de cada vez em cada tipo de cena (molde novo). Fora do molde novo, a cena é uma parte só. */
function nBlocos(c) {
  if (!V) return 1;
  if (c.tipo === 'lista') return ((c.linhas || []).length + (c.rodape ? 1 : 0)) || 1;
  if (c.tipo === 'quiz') return 1 + (c.opcoes || []).length + (c.sub ? 1 : 0);
  if (c.tipo === 'resposta') return 1 + (c.sub ? 1 : 0);
  if (c.tipo === 'combo') return Math.max((c.cartas || []).length, (c.passos || []).length, 1) + (c.rodape ? 1 : 0);
  if (c.tipo === 'cta') return 1 + (c.destaque ? 1 : 0);
  return 1 + (c.sub ? 1 : 0) + (c.rodape ? 1 : 0);
}

/* passo: quantas partes da cena aparecem (null = todas). As escondidas ocupam o mesmo espaço, então nada pula. */
function pageHTML(r, c, i, conta, passo) {
  const h = k => (passo != null && k > passo) ? ' style="visibility:hidden"' : '';
  const nb = nBlocos(c);
  const css = fs.readFileSync(path.join(ROOT, 'tools/kit/kit.css'), 'utf8')
    .split('{{FONTS}}').join(furl(path.join(ROOT, 'tools/kit/fonts')))
    .split('{{LANDS}}').join(furl(path.join(ROOT, 'lands')));
  const cor = c.cor || 'A';
  const land = 'WUBRG'.includes(cor) ? cor : 'A';
  const bg = r.arte ? furl(path.join(ROOT, r.arte)) : furl(path.join(ROOT, 'lands', land + '.jpg'));
  const card = r.carta ? furl(path.join(ROOT, r.carta)) : '';
  const pip = k => k === 'M' ? '<span class="pip p-M" style="--s:40px"><i class="wd wW"></i><i class="wd wU"></i><i class="wd wB"></i><i class="wd wR"></i><i class="wd wG"></i></span>' : `<span class="pip p-${k}" style="--s:40px"></span>`;
  const extra = `
.canvas{width:1080px;height:1920px}
.art{position:absolute;left:0;right:0;top:0;height:var(--ah,1080px);background:url(${bg}) 50% 100%/auto 116% no-repeat;background-color:#0F0F13}
.art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,15,19,.55) 0%,rgba(15,15,19,0) 22%,rgba(15,15,19,.15) 60%,#0F0F13 100%)}
.top{position:absolute;top:300px;left:120px;right:120px;display:flex;justify-content:space-between;align-items:center}
.top .brand{font-size:58px}
.body{position:absolute;left:120px;right:200px}
.kicker{font-size:30px}
h1{font-family:CZ;font-weight:700;font-size:80px;line-height:1.05;margin-top:22px;text-shadow:0 4px 18px rgba(0,0,0,.75)}
.sub{font-size:48px;line-height:1.25;margin-top:26px;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.sub b,.foot b{color:#fff;font-weight:600}
.cred{position:absolute;left:120px;font-family:CP;font-style:italic;font-size:26px;color:var(--muted)}
.tbox{padding:24px 44px 34px;margin-top:44px}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:20px 0;border-bottom:2px solid rgba(0,0,0,.14)}
.row:last-child{border-bottom:0}
.row .n{font-family:CP;font-weight:600;font-size:48px;line-height:1.12}
.row .v{font-family:CZ;font-weight:700;font-size:60px;white-space:nowrap;text-align:right}
.row .v small{display:block;font-family:CP;font-weight:600;font-size:36px;color:#3b362c;margin-top:4px}
.foot{margin-top:40px;font-size:50px;line-height:1.28}
.srcl{margin-top:26px;font-family:CZ;font-weight:600;font-size:24px;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.fxn{margin-top:20px;font-family:CP;font-style:italic;font-size:27px;color:var(--muted)}
.big{font-family:CD;font-weight:900;font-size:76px;line-height:1.08;color:var(--goldtxt);margin-top:40px;text-shadow:0 3px 14px rgba(0,0,0,.7)}
.cardimg{position:absolute;left:50%;transform:translateX(-50%) rotate(-3deg);width:440px;top:390px;border-radius:26px;box-shadow:0 0 0 6px #0b0a09,0 40px 80px -20px rgba(0,0,0,.9)}
.qz{right:200px}
.qz h1{font-size:68px}
.qz .tbox{padding:14px 30px;margin-top:36px}
.op{display:grid;grid-template-columns:76px 1fr 64px;gap:22px;align-items:center;padding:20px 0;border-bottom:2px solid rgba(0,0,0,.14)}
.op:last-child{border-bottom:0}
.op .lt{width:76px;height:76px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:CZ;font-weight:700;font-size:44px;color:#F3EEE2;background:#2a2620;box-shadow:-3px 3px 0 rgba(0,0,0,.9)}
.op .ot{font-family:CP;font-weight:600;font-size:44px;line-height:1.12}
.op .mk{width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DejaVu Sans',sans-serif;font-weight:700;font-size:40px;color:#fff}
.op.ok{background:rgba(31,107,63,.16);border-radius:14px;margin:0 -16px;padding:20px 16px;border-bottom-color:transparent}
.op.ok .lt,.op.ok .mk{background:#1F6B3F}
.op.no{opacity:.42}
.op.no .ot{text-decoration:line-through;text-decoration-thickness:3px}
.rp .op{padding:14px 0}.rp .op .ot{font-size:40px}.rp .op.ok{padding:14px 16px}.rp h1{font-size:68px}.rp .sub{font-size:46px;margin-top:26px}
.crow{position:absolute;top:430px;left:120px;right:120px;display:flex;justify-content:center;gap:20px}
.cc{position:relative}.cc img{display:block;border-radius:14px;box-shadow:0 0 0 4px #0b0a09,0 24px 50px -14px rgba(0,0,0,.9)}
.cc .cn{position:absolute;bottom:-30px;left:50%;margin-left:-34px;width:68px;height:68px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:CD;font-weight:900;font-size:44px;color:#0F0F13;background:var(--goldtxt);box-shadow:0 0 0 5px #0F0F13}
.cb{right:120px}.cb h1{font-size:62px;margin-top:14px}.cb .tbox{padding:8px 30px;margin-top:24px}
.ps{display:grid;grid-template-columns:56px 1fr auto;gap:18px;align-items:center;padding:13px 0;border-bottom:2px solid rgba(0,0,0,.14)}
.ps:last-child{border-bottom:0}
.ps .pn{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:CZ;font-weight:700;font-size:34px;color:#F3EEE2;background:#2a2620}
.ps .pt{font-family:CP;font-weight:600;font-size:36px;line-height:1.14}
.ps .pv{font-family:CZ;font-weight:700;font-size:40px;white-space:nowrap;color:#8c1d12}
.cb .foot{font-size:38px;margin-top:22px}
.cd{position:absolute;top:400px;right:120px;display:flex;flex-direction:column;align-items:center;gap:18px}
.cd .n{width:250px;height:250px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:CD;font-weight:900;font-size:170px;line-height:1;color:var(--goldtxt);background:rgba(15,15,19,.82);box-shadow:0 0 0 8px var(--goldtxt),0 30px 60px -10px rgba(0,0,0,.9)}
.cd .t{font-family:CZ;font-weight:700;font-size:40px;color:#F3EEE2;text-shadow:0 3px 12px rgba(0,0,0,.9);background:rgba(15,15,19,.7);padding:10px 26px;border-radius:40px}`;
  const top = `<div class="top"><div class="brand">Fonte <span class="de">de</span> Mana</div>${c.chip ? '<span class="chip">' + esc(c.chip) + '</span>' : ''}</div>`;
  const fx = r.fx && JSON.stringify(c).includes('R$') ? `<div class="fxn"${h(nb)}>${esc(r.fx)}</div>` : '';
  const fonte = c.fonte ? `<div class="srcl"${h(nb)}>${esc(c.fonte)}</div>` : '';
  const cred = r.credito && i === 0 ? `<div class="cred" style="top:930px">${esc(r.credito)}</div>` : '';
  let inner, ah = 1080;
  if (c.tipo === 'lista') {
    ah = 730;
    inner = `<div class="art"></div>${top}<div class="body" style="top:770px"><div class="kicker"${h(1)}>${pip(c.cor || 'A')} ${esc(c.kicker)}</div>
      <div class="tbox fr-${c.cor || 'A'}"${h(1)}>${c.linhas.map((l, j) => `<div class="row"${h(j + 1)}><span class="n">${esc(l.nome)}</span><span class="v">${esc(l.valor)}${l.real ? '<small>' + esc(l.real) + '</small>' : ''}</span></div>`).join('')}</div>
      ${c.rodape ? '<div class="foot"' + h(c.linhas.length + 1) + '>' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'quiz' || c.tipo === 'resposta') {
    const resp = c.tipo === 'resposta', certa = resp ? LETRAS.indexOf(c.certa) : -1;
    ah = resp ? 600 : 720;
    const kOp = j => resp ? 1 : 2 + j;
    const ops = c.opcoes.map((o, j) => `<div class="op${j === certa ? ' ok' : (resp ? ' no' : '')}"${h(kOp(j))}><span class="lt">${LETRAS[j]}</span><span class="ot">${rich(o)}</span>${j === certa ? '<span class="mk">✓</span>' : '<span></span>'}</div>`).join('');
    const letras = LETRAS.slice(0, c.opcoes.length).split('');
    const cd = conta ? `<div class="cd"><div class="n">${conta}</div><div class="t">${V ? '' : 'Comenta: '}${letras.slice(0, -1).join(', ')} ou ${letras[letras.length - 1]}?</div></div>` : '';
    inner = `<div class="art"></div>${top}${cred}${cd}<div class="body qz${resp ? ' rp' : ''}" style="top:${resp ? 640 : 760}px"><div class="kicker"${h(1)}>${pip(c.cor || 'U')} ${esc(c.kicker)}</div>
      <h1${h(1)}>${rich(c.titulo)}</h1><div class="tbox fr-${c.cor || 'U'}"${h(kOp(0))}>${ops}</div>${c.sub ? '<div class="sub"' + h(nb) + '>' + rich(c.sub) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'combo') {
    ah = 760;
    const nc = c.cartas.length, w = nc === 1 ? 300 : nc === 2 ? 290 : 240;
    const ini = c.inicio || 1; /* "inicio": 4 numera as cartas e os passos a partir do 4 (Top 5 dividido em duas cenas) */
    const m = Math.max(nc, c.passos.length, 1);
    const cartas = c.cartas.map((f, j) => `<div class="cc"${h(j + 1)}><img src="${furl(path.join(ROOT, f))}" style="width:${w}px">${c.numerar ? '<span class="cn">' + (j + ini) + '</span>' : ''}</div>`).join('');
    const passos = c.passos.map((p, j) => `<div class="ps"${h(j + 1)}><span class="pn">${j + ini}</span><span class="pt">${rich(p.txt)}</span>${p.valor ? '<span class="pv">' + esc(p.valor) + '</span>' : '<span></span>'}</div>`).join('');
    inner = `<div class="art"></div>${top}<div class="crow">${cartas}</div><div class="body cb" style="top:${430 + Math.round(w * 1.395) + (c.numerar ? 70 : 45)}px"><div class="kicker"${h(1)}>${pip(c.cor || 'R')} ${esc(c.kicker)}</div>
      <h1${h(1)}>${rich(c.titulo)}</h1><div class="tbox fr-${c.cor || 'R'}"${h(1)}>${passos}</div>${c.rodape ? '<div class="foot"' + h(m + 1) + '>' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'cta') {
    inner = `<div class="art"></div>${top}${card ? '<img class="cardimg" src="' + card + '">' : ''}
      <div class="body" style="top:1050px"><div class="kicker"${h(1)}>${pip(c.cor || 'M')} ${esc(c.kicker)}</div>
      <h1 style="font-size:76px">${rich(c.titulo)}</h1>${c.destaque ? '<div class="big"' + h(2) + '>' + esc(c.destaque) + '</div>' : ''}${fx}</div>`;
  } else {
    const g = c.tipo === 'gancho' || (c.tipo === 'rosto' && i === 0);   /* cena rosto sem o vídeo do Paulo: sai como texto (ou gancho, se for a 1) */
    const t = g ? 1000 : 860;
    ah = g ? 1000 : 820;
    inner = `<div class="art"></div>${top}${cred}<div class="body" style="top:${t}px"><div class="kicker"${h(1)}>${pip(c.cor || 'A')} ${esc(c.kicker)}</div>
      <h1${h(1)}>${rich(c.titulo)}</h1>${c.sub ? '<div class="sub"' + h(2) + '>' + rich(c.sub) + '</div>' : ''}${c.rodape ? '<div class="foot"' + h(c.sub ? 3 : 2) + '>' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}${extra}</style></head><body><div class="canvas" style="--ah:${ah}px">${inner}</div></body></html>`;
}

/* Título por cima do vídeo do Paulo (cena rosto): fundo transparente, marca e chip no alto e o kicker com o título
   numa caixa escura no terço de cima, para o rosto ficar livre no meio da tela. */
function overlayHTML(r, c) {
  const css = fs.readFileSync(path.join(ROOT, 'tools/kit/kit.css'), 'utf8')
    .split('{{FONTS}}').join(furl(path.join(ROOT, 'tools/kit/fonts')))
    .split('{{LANDS}}').join(furl(path.join(ROOT, 'lands')));
  const cor = c.cor || 'A';
  const pip = cor === 'M' ? '<span class="pip p-M" style="--s:40px"><i class="wd wW"></i><i class="wd wU"></i><i class="wd wB"></i><i class="wd wR"></i><i class="wd wG"></i></span>' : `<span class="pip p-${cor}" style="--s:40px"></span>`;
  const extra = `html,body{background:transparent!important}
.canvas{width:1080px;height:1920px;background:none!important}
.shade{position:absolute;left:0;right:0;top:0;height:760px;background:linear-gradient(180deg,rgba(10,10,14,.62) 0%,rgba(10,10,14,.35) 55%,rgba(10,10,14,0) 100%)}
.top{position:absolute;top:300px;left:120px;right:120px;display:flex;justify-content:space-between;align-items:center}
.top .brand{font-size:52px}
.ov{position:absolute;top:390px;left:120px;right:120px;background:rgba(15,15,19,.74);border-radius:28px;padding:26px 34px 30px;box-shadow:0 18px 40px -12px rgba(0,0,0,.7)}
.kicker{font-size:28px}
.ov h1{font-family:CZ;font-weight:700;font-size:60px;line-height:1.06;margin-top:14px;color:#F3EEE2}`;
  const top = `<div class="top"><div class="brand">Fonte <span class="de">de</span> Mana</div>${c.chip ? '<span class="chip">' + esc(c.chip) + '</span>' : ''}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}${extra}</style></head><body><div class="canvas"><div class="shade"></div>${top}<div class="ov"><div class="kicker">${pip} ${esc(c.kicker)}</div><h1>${rich(c.titulo)}</h1></div></div></body></html>`;
}

async function renderFrames(r) {
  const pw = loadPlaywright();
  const exe = chromePath();
  const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-pauta-'));
  const out = [];
  fs.readdirSync(DIR).filter(f => /^cena-\d+-c\d\.jpg$/.test(f) || /^cena-\d+-p\d+\.jpg$/.test(f) || /^cena-1b(-p\d+)?\.jpg$/.test(f) || /^cena-\d+-rosto\.png$/.test(f)).forEach(f => fs.unlinkSync(path.join(DIR, f)));
  const shot = async (html, nome, rotulo, checa) => {
    const f = path.join(tmp, nome + '.html');
    fs.writeFileSync(f, html);
    await pg.goto(furl(f));
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    if (checa) {
      const over = await pg.evaluate(lim => { const b = document.querySelector('.body'); if (!b) return 0; const r = b.getBoundingClientRect(); return Math.max(0, r.bottom - lim); }, LIMITE_BAIXO);
      if (over > 0) throw new Error(`${rotulo}: o texto passa da área segura em ${Math.round(over)} px; encurte o texto dessa cena`);
    }
    await pg.screenshot({ path: path.join(DIR, nome + '.jpg'), type: 'jpeg', quality: 90 });
  };
  const lista = r.cenas.map((c, i) => ({ c, i, tag: String(i + 1), rotulo: 'cena ' + (i + 1) }));
  if (V && r.ganchoB) lista.push({ c: cenaB(r), i: 0, tag: '1b', rotulo: 'ganchoB' });
  for (const { c, i, tag, rotulo } of lista) {
    await shot(pageHTML(r, c, i, null), 'cena-' + tag, rotulo, true);
    if (V) for (let k = 1; k < nBlocos(c); k++) await shot(pageHTML(r, c, i, null, k), 'cena-' + tag + '-p' + k, rotulo, false);
    for (const n of contagemDe(c)) await shot(pageHTML(r, c, i, n), 'cena-' + tag + '-c' + n, rotulo, true);
    if (c.tipo === 'rosto' && tag !== '1b') {
      const f = path.join(tmp, 'cena-' + tag + '-rosto.html');
      fs.writeFileSync(f, overlayHTML(r, c));
      await pg.goto(furl(f)); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
      const over = await pg.evaluate(() => { const b = document.querySelector('.ov'); return b ? b.getBoundingClientRect().bottom : 0; });
      if (over > 960) throw new Error(`${rotulo}: o título por cima do vídeo desce até y ${Math.round(over)} e cobre o rosto; encurte o kicker ou o título`);
      await pg.screenshot({ path: overlayDe(i), type: 'png', omitBackground: true });
    }
    if (tag !== '1b') out.push(quadroDe(i));
  }
  await browser.close();
  return out;
}
/* cena 1 da versão de teste: o gancho B herda cor e chip da cena 1 */
function cenaB(r) { return Object.assign({ tipo: 'gancho', cor: r.cenas[0].cor, chip: r.cenas[0].chip }, r.ganchoB); }
/* quadros de uma cena, na ordem em que entram: as partes reveladas e, por último, a cena inteira */
function passosDe(tag, c) {
  const n = V ? nBlocos(c) : 1;
  return Array.from({ length: n - 1 }, (x, k) => path.join(DIR, 'cena-' + tag + '-p' + (k + 1) + '.jpg')).concat([path.join(DIR, 'cena-' + tag + '.jpg')]);
}
/* contagem regressiva da cena quiz: [5, 4, 3, 2, 1] e o caminho de cada quadro */
function contagemDe(c) { const n = c.tipo === 'quiz' && c.contagem ? c.contagem : 0; return Array.from({ length: n }, (x, k) => n - k); }
function quadroDe(i, n) { return path.join(DIR, 'cena-' + (i + 1) + (n ? '-c' + n : '') + '.jpg'); }
function overlayDe(i) { return path.join(DIR, 'cena-' + (i + 1) + '-rosto.png'); }

/* ---------- vídeo do Paulo (cena rosto) ---------- */
function probe(f, args) { try { return cp.execFileSync('ffprobe', ['-v', 'error'].concat(args, [f]), { encoding: 'utf8' }).trim(); } catch (e) { return ''; } }
/* o arquivo tem imagem de verdade (não só a capa de um áudio)? */
function temVideo(f) {
  try { const j = JSON.parse(probe(f, ['-select_streams', 'v', '-show_entries', 'stream=codec_type:stream_disposition=attached_pic', '-of', 'json'])); return (j.streams || []).some(s => !(s.disposition && s.disposition.attached_pic)); } catch (e) { return false; }
}
/* vídeo HDR do iPhone (HLG ou PQ) vira SDR, senão as cores saem lavadas */
function sdr(f) {
  const t = probe(f, ['-select_streams', 'v:0', '-show_entries', 'stream=color_transfer', '-of', 'csv=p=0']);
  if (!/arib-std-b67|smpte2084/.test(t)) return '';
  return `zscale=tin=${/b67/.test(t) ? 'arib-std-b67' : 'smpte2084'}:min=bt2020nc:pin=bt2020:t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,`;
}
/* começo e fim da fala no vídeo (o silêncio das pontas sai, sem tirar a imagem do lugar) */
function pontas(f) {
  const D = dur(f);
  const p = cp.spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', f, '-vn', '-af', 'silencedetect=noise=-42dB:d=0.25', '-f', 'null', '-'], { encoding: 'utf8', timeout: 120000 });
  const L = p.stderr || '', ss = [...L.matchAll(/silence_start: (-?[\d.]+)/g)].map(m => +m[1]), se = [...L.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]);
  let ini = 0, fim = D;
  if (ss.length && ss[0] <= 0.05 && se.length) ini = Math.max(0, se[0] - 0.15);
  const ult = ss[ss.length - 1];
  if (ss.length && ult > ini + 0.5 && (se.length < ss.length || se[se.length - 1] >= D - 0.05)) fim = Math.min(D, ult + 0.3);
  return fim - ini >= 1 ? [ini, fim] : [0, D];
}
/* a cena rosto pronta: o trecho falado, cortado para 1080x1920, com o título por cima; e a fala em wav */
function cenaRosto(f, overlay, tmp, k) {
  const [ini, fim] = pontas(f), t = (fim - ini).toFixed(3);
  const mp4 = path.join(tmp, 'r' + k + '.mp4'), wav = path.join(tmp, 'c' + k + '.wav');
  run(['-y', '-loglevel', 'error', '-ss', ini.toFixed(3), '-t', t, '-i', f, '-i', overlay, '-filter_complex', `[0:v]${sdr(f)}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=${FPS},format=yuv420p[f];[f][1:v]overlay=0:0:format=auto,format=yuv420p[v]`, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-r', String(FPS), mp4]);
  run(['-y', '-loglevel', 'error', '-ss', ini.toFixed(3), '-t', t, '-i', f, '-vn', '-af', 'aresample=48000', '-ac', '2', wav]);
  return { video: mp4, audio: wav, segundos: dur(mp4) };
}

/* ---------- vídeo ---------- */
function run(args, timeout) { const p = cp.spawnSync('ffmpeg', args, { encoding: 'utf8', timeout: timeout || 300000 }); if (p.status !== 0) throw new Error('ffmpeg falhou: ' + (p.stderr || '').slice(-600)); return p; }
function dur(f) { return parseFloat(cp.execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()); }
function estimate(txt) { const w = plain(txt).split(/\s+/).filter(Boolean).length; return V ? Math.max(2.5, Math.round((w / 2.7 + 0.6) * 10) / 10) : Math.max(5, Math.round((w / 2.5 + 1.2) * 10) / 10); }

/* Molde novo: cada cena é a sequência dos seus quadros (partes reveladas e a cena inteira) em corte seco, com o mesmo
   movimento contínuo da cena; depois vem a contagem do quiz, se houver; entre cenas, o mesmo fade. Tudo em quadros
   inteiros, para os cortes e o fade caírem no lugar certo. steps[i]: arquivos da cena i; lens[i]: segundos de fala. */
function buildVideoV(steps, lens, audios, out, conts, leads) {
  conts = conts || steps.map(() => []);
  const args = ['-y', '-loglevel', 'error'];
  const fr = s => Math.max(1, Math.round(s * FPS));
  const fadeF = fr(FADE), fl = []; let idx = 0;
  const entrada = (f, nf) => { args.push('-framerate', String(FPS), '-loop', '1', '-t', (nf / FPS).toFixed(4), '-i', f); return idx++; };
  const crop = (j, y) => `[${j}:v]scale=1134:2016,crop=1080:1920:x='(iw-ow)/2':y='${y}',setsar=1,format=yuv420p`;
  const dursF = [], segF = [];
  steps.forEach((S, i) => {
    if (S && S.video) {
      /* cena rosto: o vídeo do Paulo inteiro, sem zoom (a fala casa com a boca); o último quadro segura o fade */
      const LF = fr(lens[i]), extra = i < steps.length - 1 ? fadeF : fr(0.6);
      dursF.push(LF); segF.push(LF + extra);
      args.push('-i', S.video); const j = idx++;
      fl.push(`[${j}:v]fps=${FPS},setsar=1,format=yuv420p,tpad=stop_mode=clone:stop_duration=${((extra + 2) / FPS).toFixed(4)},trim=end_frame=${LF + extra},setpts=PTS-STARTPTS,settb=1/${FPS}[v${i}]`);
      return;
    }
    const cont = conts[i] || [];
    const LF = Math.max(fr(lens[i]), S.length);
    const extra = i < steps.length - 1 ? fadeF : fr(0.6);
    dursF.push(LF + cont.length * FPS); segF.push(LF + cont.length * FPS + extra);
    const visF = LF + (cont.length ? 0 : extra);
    const base = Math.floor(LF / S.length), partes = []; let off = 0;
    S.forEach((f, k) => {
      let nf = k < S.length - 1 ? base : LF - base * (S.length - 1);
      if (k === S.length - 1 && !cont.length) nf += extra;
      fl.push(crop(entrada(f, nf), `(ih-oh)*(1-(t+${(off / FPS).toFixed(4)})/${(visF / FPS).toFixed(4)})`) + `[s${i}_${k}]`);
      partes.push(`[s${i}_${k}]`); off += nf;
    });
    cont.forEach((q, k) => { fl.push(crop(entrada(q, FPS + (k === cont.length - 1 ? extra : 0)), '0') + `[c${i}_${k}]`); partes.push(`[c${i}_${k}]`); });
    fl.push(`${partes.join('')}concat=n=${partes.length}:v=1:a=0,fps=${FPS},settb=1/${FPS}[v${i}]`);
  });
  (audios || []).forEach(a => args.push('-i', a));
  let prev = 'v0', offF = 0;
  for (let i = 1; i < steps.length; i++) { offF += segF[i - 1] - fadeF; fl.push(`[${prev}][v${i}]xfade=transition=fade:duration=${(fadeF / FPS).toFixed(4)}:offset=${(offF / FPS).toFixed(4)}[x${i}]`); prev = 'x' + i; }
  const total = (segF.reduce((a, b) => a + b, 0) - fadeF * (steps.length - 1)) / FPS;
  if (audios) {
    let startF = 0;
    audios.forEach((a, i) => { const d = Math.round((startF / FPS + (leads ? leads[i] : 0.35)) * 1000); fl.push(`[${idx + i}:a]adelay=${d}|${d}[a${i}]`); startF += dursF[i]; });
    fl.push(`${audios.map((a, i) => '[a' + i + ']').join('')}amix=inputs=${audios.length}:normalize=0:duration=longest,apad,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]`);
  }
  args.push('-filter_complex', fl.join(';'), '-map', '[' + prev + ']');
  if (audios) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '192k');
  args.push('-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out);
  run(args, 400000);
  return total;
}

/* conts[i]: quadros da contagem regressiva da cena i (1 s cada, depois da fala), lista vazia nas outras cenas */
function buildVideo(frames, lens, audios, out, conts) {
  conts = conts || frames.map(() => []);
  const args = ['-y', '-loglevel', 'error'];
  const durs = lens.map((L, i) => L + conts[i].length);
  const seg = durs.map((D, i) => D + (i < durs.length - 1 ? FADE : 0.6));
  const fl = []; let idx = 0;
  const entrada = (f, t) => { args.push('-framerate', String(FPS), '-loop', '1', '-t', t.toFixed(3), '-i', f); return idx++; };
  const crop = (j, y) => `[${j}:v]scale=1134:2016,crop=1080:1920:x='(iw-ow)/2':y='${y}',setsar=1,format=yuv420p`;
  frames.forEach((f, i) => {
    const sobra = seg[i] - durs[i];
    if (!conts[i].length) { fl.push(crop(entrada(f, seg[i]), `(ih-oh)*(1-t/${seg[i].toFixed(3)})`) + `[v${i}]`); return; }
    const partes = [];
    fl.push(crop(entrada(f, lens[i]), `(ih-oh)*(1-t/${lens[i].toFixed(3)})`) + `[b${i}]`); partes.push(`[b${i}]`);
    conts[i].forEach((q, k) => { fl.push(crop(entrada(q, 1 + (k === conts[i].length - 1 ? sobra : 0)), '0') + `[c${i}_${k}]`); partes.push(`[c${i}_${k}]`); });
    fl.push(`${partes.join('')}concat=n=${partes.length}:v=1:a=0,fps=${FPS},settb=1/${FPS}[v${i}]`);
  });
  (audios || []).forEach(a => args.push('-i', a));
  let prev = 'v0', off = 0;
  for (let i = 1; i < frames.length; i++) { off += seg[i - 1] - FADE; fl.push(`[${prev}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${off.toFixed(3)}[x${i}]`); prev = 'x' + i; }
  const total = seg.reduce((a, b) => a + b, 0) - FADE * (frames.length - 1);
  if (audios) {
    let start = 0;
    audios.forEach((a, i) => { const d = Math.round((start + 0.35) * 1000); fl.push(`[${idx + i}:a]adelay=${d}|${d}[a${i}]`); start += durs[i]; });
    fl.push(`${audios.map((a, i) => '[a' + i + ']').join('')}amix=inputs=${audios.length}:normalize=0:duration=longest,apad,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[aout]`);
  }
  args.push('-filter_complex', fl.join(';'), '-map', '[' + prev + ']');
  if (audios) args.push('-map', '[aout]', '-c:a', 'aac', '-b:a', '192k');
  args.push('-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', out);
  run(args, 400000);
  return total;
}

(async () => {
  const rp = path.join(DIR, 'roteiro.json');
  if (!exists(rp)) { console.error('Não achei ' + rp); process.exit(1); }
  const r = JSON.parse(fs.readFileSync(rp, 'utf8'));
  const E = validate(r);
  if (E.length) { console.log('ERROS:\n' + E.map(e => '  ' + e).join('\n')); process.exit(1); }
  const conts = r.cenas.map((c, i) => contagemDe(c).map(n => quadroDe(i, n)));
  const nConta = conts.reduce((a, b) => a + b.length, 0);
  if (V) {
    /* molde novo: revelação progressiva e, com ganchoB, a versão de teste (tiktok-teste.mp4 e tiktok-teste-narrado.mp4) */
    const n = r.cenas.length, B = r.ganchoB ? cenaB(r) : null;
    const steps = r.cenas.map((c, i) => passosDe(String(i + 1), c));
    const stepsB = B ? [passosDe('1b', B)].concat(steps.slice(1)) : null;
    const contsB = [[]].concat(conts.slice(1));
    const nQuadros = steps.reduce((a, s) => a + s.length, 0);
    if (!AUDIOS) {
      await renderFrames(r);
      const lens = r.cenas.map(c => estimate(c.narracao));
      const total = buildVideoV(steps, lens, null, path.join(DIR, 'tiktok-mudo.mp4'), conts);
      let msgB = '';
      if (B) { const tB = buildVideoV(stepsB, [estimate(B.narracao)].concat(lens.slice(1)), null, path.join(DIR, 'tiktok-teste.mp4'), contsB); msgB = '; versão de teste com o gancho B, de ' + tB.toFixed(1) + ' s, em pauta/' + DATA + '/tiktok/tiktok-teste.mp4 (grave também a fala do gancho B como cena_1b)'; }
      r.cenas.forEach((c, i) => { c.segundos = lens[i]; });
      if (B) r.ganchoB.segundos = estimate(B.narracao);
      fs.writeFileSync(rp, JSON.stringify(r, null, 1) + '\n');
      console.log('OK, ' + n + ' cenas em ' + nQuadros + ' quadros (cada parte entra em até ' + V.parado + ' s)' + (nConta ? ' com contagem de ' + nConta + ' s depois da pergunta' : '') + ', vídeo mudo de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-mudo.mp4' + msgB);
    } else {
      if (AUDIOS.length !== n && !(B && AUDIOS.length === n + 1)) { console.log('ERROS:\n  mande um áudio por cena' + (B ? ' e, por último, o do gancho B' : '') + ': o roteiro tem ' + n + ' cenas' + (B ? ' mais o gancho B' : '') + ' e chegaram ' + AUDIOS.length + ' áudios'); process.exit(1); }
      const overlays = r.cenas.map((c, i) => c.tipo === 'rosto' ? overlayDe(i) : null).filter(Boolean);
      const todos = steps.concat(B ? [stepsB[0]] : []).every(s => s.every(exists)) && conts.every(l => l.every(exists)) && overlays.every(exists);
      if (!todos) await renderFrames(r);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-narr-'));
      /* cada arquivo pode ser áudio ou vídeo: na cena rosto, o vídeo entra na tela; nas outras, só a voz */
      const prep = AUDIOS.map((a, i) => {
        if (i < n && r.cenas[i].tipo === 'rosto' && temVideo(a)) return cenaRosto(a, overlayDe(i), tmp, i + 1);
        const o = path.join(tmp, 'c' + (i + 1) + '.wav');
        run(['-y', '-loglevel', 'error', '-i', a, '-vn', '-af', 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.15,areverse,aresample=48000', '-ac', '2', o]);
        return { audio: o };
      });
      const clean = prep.map(x => x.audio);
      const principais = clean.slice(0, n);
      const stepsN = steps.map((s, i) => prep[i].video ? { video: prep[i].video } : s);
      const lens = prep.slice(0, n).map(x => x.video ? x.segundos : dur(x.audio) + 0.8);
      const leads = prep.slice(0, n).map(x => x.video ? 0 : 0.35);
      const total = buildVideoV(stepsN, lens, principais, path.join(DIR, 'tiktok-narrado.mp4'), conts, leads);
      const comRosto = prep.slice(0, n).map((x, i) => x.video ? i + 1 : 0).filter(Boolean);
      const faltaRosto = r.cenas.map((c, i) => c.tipo === 'rosto' && !prep[i].video ? i + 1 : 0).filter(Boolean);
      if (RO) { r.rostoGravado = comRosto.length > 0; fs.writeFileSync(rp, JSON.stringify(r, null, 1) + '\n'); }
      let msgB = '';
      if (B) {
        const aB = clean[n] || clean[0];
        const tB = buildVideoV([stepsB[0]].concat(stepsN.slice(1)), [dur(aB) + 0.8].concat(lens.slice(1)), [aB].concat(principais.slice(1)), path.join(DIR, 'tiktok-teste-narrado.mp4'), contsB, [0.35].concat(leads.slice(1)));
        msgB = '; versão de teste narrada de ' + tB.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-teste-narrado.mp4' + (clean[n] ? '' : ' (sem o áudio do gancho B: usei a fala da cena 1)');
      }
      console.log('OK, vídeo narrado de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-narrado.mp4 (cenas de ' + lens.map(x => x.toFixed(1)).join(', ') + ' s)' + (comRosto.length ? '; com o Paulo na tela na' + (comRosto.length > 1 ? 's cenas ' : ' cena ') + comRosto.join(', ') : '') + (faltaRosto.length ? '; sem vídeo na' + (faltaRosto.length > 1 ? 's cenas rosto ' : ' cena rosto ') + faltaRosto.join(', ') + ' (saiu como texto)' : '') + msgB);
    }
  } else if (!AUDIOS) {
    const frames = await renderFrames(r);
    const lens = r.cenas.map(c => estimate(c.narracao));
    const total = buildVideo(frames, lens, null, path.join(DIR, 'tiktok-mudo.mp4'), conts);
    r.cenas.forEach((c, i) => { c.segundos = lens[i]; });
    fs.writeFileSync(rp, JSON.stringify(r, null, 1) + '\n');
    console.log('OK, ' + frames.length + ' cenas' + (nConta ? ' (com contagem de ' + nConta + ' s depois da pergunta)' : '') + ', vídeo mudo de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-mudo.mp4');
  } else {
    if (AUDIOS.length !== r.cenas.length) { console.log('ERROS:\n  mande um áudio por cena: o roteiro tem ' + r.cenas.length + ' cenas e chegaram ' + AUDIOS.length + ' áudios'); process.exit(1); }
    const frames = r.cenas.map((c, i) => quadroDe(i));
    if (!frames.every(exists) || !conts.every(l => l.every(exists))) await renderFrames(r);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-narr-'));
    const clean = AUDIOS.map((a, i) => {
      const o = path.join(tmp, 'c' + (i + 1) + '.wav');
      run(['-y', '-loglevel', 'error', '-i', a, '-af', 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.15,areverse,aresample=48000', '-ac', '2', o]);
      return o;
    });
    const lens = clean.map(f => dur(f) + 0.8);
    const total = buildVideo(frames, lens, clean, path.join(DIR, 'tiktok-narrado.mp4'), conts);
    console.log('OK, vídeo narrado de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-narrado.mp4 (cenas de ' + lens.map(x => x.toFixed(1)).join(', ') + ' s)');
  }
})().catch(e => { console.log('ERROS:\n  ' + e.message); process.exit(1); });
