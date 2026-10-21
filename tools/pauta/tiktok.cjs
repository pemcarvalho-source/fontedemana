#!/usr/bin/env node
/* Vídeo de gancho do TikTok da Fonte de Mana (pauta diária).
   Uso:
     node tools/pauta/tiktok.cjs <raiz do repositório> <AAAA-MM-DD>
       lê pauta/<data>/tiktok/roteiro.json, gera cena-1.jpg em diante e tiktok-mudo.mp4 (sem som, tempo estimado pela narração)
     node tools/pauta/tiktok.cjs <raiz do repositório> <AAAA-MM-DD> --narrar <audio da cena 1> <audio da cena 2> ...
       um áudio por cena, na ordem; corta o silêncio das pontas, ajusta cada cena ao tempo da fala e gera tiktok-narrado.mp4
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
const TIPOS = ['gancho', 'lista', 'texto', 'cta', 'quiz', 'resposta', 'combo'];
/* Zona segura no quadro de 1080x1920 (medida num iPhone em 17 out 2026 e conferida com o guia de zonas seguras do TikTok):
   o app amplia o vídeo para preencher a tela e corta as laterais, o zoom do movimento corta mais 26 px por lado,
   os botões ocupam a direita da metade de baixo e a legenda ocupa o rodapé. Texto entre x 120 e 880 e acima de y 1560. */
const LIMITE_BAIXO = 1560;
const LETRAS = 'ABCD';

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
  req(Array.isArray(r.cenas) && r.cenas.length >= 3 && r.cenas.length <= 5, 'cenas precisa de 3 a 5 itens');
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
    len(c.narracao, 260, n + '.narracao');
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
      (c.passos || []).forEach((p, j) => { len(p.txt, 70, `${n}.passos[${j}].txt`); len(p.valor, 10, `${n}.passos[${j}].valor`, true); });
    }
    if (c.tipo === 'lista') {
      req(Array.isArray(c.linhas) && c.linhas.length >= 1 && c.linhas.length <= 3, n + '.linhas precisa de 1 a 3');
      (c.linhas || []).forEach((l, j) => { len(l.nome, 30, `${n}.linhas[${j}].nome`); len(l.valor, 12, `${n}.linhas[${j}].valor`); len(l.real, 16, `${n}.linhas[${j}].real`, true); if (/US\$/.test(l.valor || '') && r.fx) req(/^\(R\$ /.test(l.real || ''), `${n}.linhas[${j}].real precisa do valor em reais entre parênteses`); });
    }
  });
  if (r.arte) req(exists(path.join(ROOT, r.arte)), 'arte não encontrada: ' + r.arte);
  if (r.carta) req(exists(path.join(ROOT, r.carta)), 'carta não encontrada: ' + r.carta);
  const texto = JSON.stringify(r);
  SEPS.forEach(s => req(!texto.includes(s), 'separador proibido: "' + s + '"'));
  const semLinhas = JSON.stringify({ c: (r.cenas || []).map(c => Object.assign({}, c, { linhas: undefined, narracao: undefined })), l: r.legenda || '', m: r.comentario || '' });
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
function pageHTML(r, c, i, conta) {
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
  const fx = r.fx && JSON.stringify(c).includes('R$') ? `<div class="fxn">${esc(r.fx)}</div>` : '';
  const fonte = c.fonte ? `<div class="srcl">${esc(c.fonte)}</div>` : '';
  const cred = r.credito && i === 0 ? `<div class="cred" style="top:930px">${esc(r.credito)}</div>` : '';
  let inner, ah = 1080;
  if (c.tipo === 'lista') {
    ah = 730;
    inner = `<div class="art"></div>${top}<div class="body" style="top:770px"><div class="kicker">${pip(c.cor || 'A')} ${esc(c.kicker)}</div>
      <div class="tbox fr-${c.cor || 'A'}">${c.linhas.map(l => `<div class="row"><span class="n">${esc(l.nome)}</span><span class="v">${esc(l.valor)}${l.real ? '<small>' + esc(l.real) + '</small>' : ''}</span></div>`).join('')}</div>
      ${c.rodape ? '<div class="foot">' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'quiz' || c.tipo === 'resposta') {
    const resp = c.tipo === 'resposta', certa = resp ? LETRAS.indexOf(c.certa) : -1;
    ah = resp ? 600 : 720;
    const ops = c.opcoes.map((o, j) => `<div class="op${j === certa ? ' ok' : (resp ? ' no' : '')}"><span class="lt">${LETRAS[j]}</span><span class="ot">${rich(o)}</span>${j === certa ? '<span class="mk">✓</span>' : '<span></span>'}</div>`).join('');
    const letras = LETRAS.slice(0, c.opcoes.length).split('');
    const cd = conta ? `<div class="cd"><div class="n">${conta}</div><div class="t">Comenta: ${letras.slice(0, -1).join(', ')} ou ${letras[letras.length - 1]}?</div></div>` : '';
    inner = `<div class="art"></div>${top}${cred}${cd}<div class="body qz${resp ? ' rp' : ''}" style="top:${resp ? 640 : 760}px"><div class="kicker">${pip(c.cor || 'U')} ${esc(c.kicker)}</div>
      <h1>${rich(c.titulo)}</h1><div class="tbox fr-${c.cor || 'U'}">${ops}</div>${c.sub ? '<div class="sub">' + rich(c.sub) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'combo') {
    ah = 760;
    const nc = c.cartas.length, w = nc === 1 ? 300 : nc === 2 ? 290 : 240;
    const cartas = c.cartas.map((f, j) => `<div class="cc"><img src="${furl(path.join(ROOT, f))}" style="width:${w}px">${c.numerar ? '<span class="cn">' + (j + 1) + '</span>' : ''}</div>`).join('');
    const passos = c.passos.map((p, j) => `<div class="ps"><span class="pn">${j + 1}</span><span class="pt">${rich(p.txt)}</span>${p.valor ? '<span class="pv">' + esc(p.valor) + '</span>' : '<span></span>'}</div>`).join('');
    inner = `<div class="art"></div>${top}<div class="crow">${cartas}</div><div class="body cb" style="top:${430 + Math.round(w * 1.395) + (c.numerar ? 70 : 45)}px"><div class="kicker">${pip(c.cor || 'R')} ${esc(c.kicker)}</div>
      <h1>${rich(c.titulo)}</h1><div class="tbox fr-${c.cor || 'R'}">${passos}</div>${c.rodape ? '<div class="foot">' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'cta') {
    inner = `<div class="art"></div>${top}${card ? '<img class="cardimg" src="' + card + '">' : ''}
      <div class="body" style="top:1050px"><div class="kicker">${pip(c.cor || 'M')} ${esc(c.kicker)}</div>
      <h1 style="font-size:76px">${rich(c.titulo)}</h1>${c.destaque ? '<div class="big">' + esc(c.destaque) + '</div>' : ''}${fx}</div>`;
  } else {
    const t = c.tipo === 'gancho' ? 1000 : 860;
    ah = c.tipo === 'gancho' ? 1000 : 820;
    inner = `<div class="art"></div>${top}${cred}<div class="body" style="top:${t}px"><div class="kicker">${pip(c.cor || 'A')} ${esc(c.kicker)}</div>
      <h1>${rich(c.titulo)}</h1>${c.sub ? '<div class="sub">' + rich(c.sub) + '</div>' : ''}${c.rodape ? '<div class="foot">' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}${extra}</style></head><body><div class="canvas" style="--ah:${ah}px">${inner}</div></body></html>`;
}

async function renderFrames(r) {
  const pw = loadPlaywright();
  const exe = chromePath();
  const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-pauta-'));
  const out = [];
  fs.readdirSync(DIR).filter(f => /^cena-\d+-c\d\.jpg$/.test(f)).forEach(f => fs.unlinkSync(path.join(DIR, f)));
  for (let i = 0; i < r.cenas.length; i++) {
    const c = r.cenas[i];
    const quadros = [null].concat(contagemDe(c));
    for (const n of quadros) {
      const f = path.join(tmp, 'cena-' + (i + 1) + (n ? '-c' + n : '') + '.html');
      fs.writeFileSync(f, pageHTML(r, c, i, n));
      await pg.goto(furl(f));
      await pg.evaluate(() => document.fonts.ready);
      await pg.waitForTimeout(250);
      const over = await pg.evaluate(lim => { const b = document.querySelector('.body'); if (!b) return 0; const r = b.getBoundingClientRect(); return Math.max(0, r.bottom - lim); }, LIMITE_BAIXO);
      if (over > 0) throw new Error(`cena ${i + 1}: o texto passa da área segura em ${Math.round(over)} px; encurte o texto dessa cena`);
      await pg.screenshot({ path: quadroDe(i, n), type: 'jpeg', quality: 90 });
    }
    out.push(quadroDe(i));
  }
  await browser.close();
  return out;
}
/* contagem regressiva da cena quiz: [5, 4, 3, 2, 1] e o caminho de cada quadro */
function contagemDe(c) { const n = c.tipo === 'quiz' && c.contagem ? c.contagem : 0; return Array.from({ length: n }, (x, k) => n - k); }
function quadroDe(i, n) { return path.join(DIR, 'cena-' + (i + 1) + (n ? '-c' + n : '') + '.jpg'); }

/* ---------- vídeo ---------- */
function run(args, timeout) { const p = cp.spawnSync('ffmpeg', args, { encoding: 'utf8', timeout: timeout || 300000 }); if (p.status !== 0) throw new Error('ffmpeg falhou: ' + (p.stderr || '').slice(-600)); return p; }
function dur(f) { return parseFloat(cp.execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()); }
function estimate(txt) { const w = plain(txt).split(/\s+/).filter(Boolean).length; return Math.max(5, Math.round((w / 2.5 + 1.2) * 10) / 10); }

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
  if (!AUDIOS) {
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
