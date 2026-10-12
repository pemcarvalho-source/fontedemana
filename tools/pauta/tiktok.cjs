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
    req(['gancho', 'lista', 'texto', 'cta'].includes(c.tipo), n + '.tipo precisa ser gancho, lista, texto ou cta');
    req('WUBRGAM'.includes(c.cor || 'A') && String(c.cor || 'A').length === 1, n + '.cor inválida');
    len(c.narracao, 260, n + '.narracao');
    len(c.chip, 18, n + '.chip', true);
    len(c.kicker, 40, n + '.kicker');
    if (c.tipo !== 'lista') len(c.titulo, 64, n + '.titulo');
    len(c.sub, 140, n + '.sub', true);
    len(c.rodape, 110, n + '.rodape', true);
    len(c.fonte, 60, n + '.fonte', true);
    len(c.destaque, 24, n + '.destaque', true);
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
function pageHTML(r, c, i) {
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
.top{position:absolute;top:130px;left:64px;right:64px;display:flex;justify-content:space-between;align-items:center}
.top .brand{font-size:58px}
.body{position:absolute;left:64px;right:170px}
.kicker{font-size:30px}
h1{font-family:CZ;font-weight:700;font-size:88px;line-height:1.05;margin-top:24px;text-shadow:0 4px 18px rgba(0,0,0,.75)}
.sub{font-size:52px;line-height:1.25;margin-top:30px;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.sub b,.foot b{color:#fff;font-weight:600}
.cred{position:absolute;left:64px;font-family:CP;font-style:italic;font-size:26px;color:var(--muted)}
.tbox{padding:24px 44px 34px;margin-top:44px}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:24px;padding:24px 0;border-bottom:2px solid rgba(0,0,0,.14)}
.row:last-child{border-bottom:0}
.row .n{font-family:CP;font-weight:600;font-size:52px;line-height:1.12}
.row .v{font-family:CZ;font-weight:700;font-size:66px;white-space:nowrap;text-align:right}
.row .v small{display:block;font-family:CP;font-weight:600;font-size:36px;color:#3b362c;margin-top:4px}
.foot{margin-top:44px;font-size:54px;line-height:1.28}
.srcl{margin-top:26px;font-family:CZ;font-weight:600;font-size:24px;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.fxn{margin-top:20px;font-family:CP;font-style:italic;font-size:27px;color:var(--muted)}
.big{font-family:CD;font-weight:900;font-size:76px;line-height:1.08;color:var(--goldtxt);margin-top:40px;text-shadow:0 3px 14px rgba(0,0,0,.7)}
.cardimg{position:absolute;left:50%;transform:translateX(-50%) rotate(-3deg);width:500px;top:330px;border-radius:26px;box-shadow:0 0 0 6px #0b0a09,0 40px 80px -20px rgba(0,0,0,.9)}`;
  const top = `<div class="top"><div class="brand">Fonte <span class="de">de</span> Mana</div>${c.chip ? '<span class="chip">' + esc(c.chip) + '</span>' : ''}</div>`;
  const fx = r.fx && JSON.stringify(c).includes('R$') ? `<div class="fxn">${esc(r.fx)}</div>` : '';
  const fonte = c.fonte ? `<div class="srcl">${esc(c.fonte)}</div>` : '';
  const cred = r.credito && i === 0 ? `<div class="cred" style="top:1010px">${esc(r.credito)}</div>` : '';
  let inner, ah = 1080;
  if (c.tipo === 'lista') {
    ah = 780;
    inner = `<div class="art"></div>${top}<div class="body" style="top:820px"><div class="kicker">${pip(c.cor || 'A')} ${esc(c.kicker)}</div>
      <div class="tbox fr-${c.cor || 'A'}">${c.linhas.map(l => `<div class="row"><span class="n">${esc(l.nome)}</span><span class="v">${esc(l.valor)}${l.real ? '<small>' + esc(l.real) + '</small>' : ''}</span></div>`).join('')}</div>
      ${c.rodape ? '<div class="foot">' + rich(c.rodape) + '</div>' : ''}${fonte}${fx}</div>`;
  } else if (c.tipo === 'cta') {
    inner = `<div class="art"></div>${top}${card ? '<img class="cardimg" src="' + card + '">' : ''}
      <div class="body" style="top:1110px"><div class="kicker">${pip(c.cor || 'M')} ${esc(c.kicker)}</div>
      <h1 style="font-size:76px">${rich(c.titulo)}</h1>${c.destaque ? '<div class="big">' + esc(c.destaque) + '</div>' : ''}${fx}</div>`;
  } else {
    const t = c.tipo === 'gancho' ? 1080 : 900;
    ah = c.tipo === 'gancho' ? 1080 : 860;
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
  for (let i = 0; i < r.cenas.length; i++) {
    const f = path.join(tmp, 'cena-' + (i + 1) + '.html');
    fs.writeFileSync(f, pageHTML(r, r.cenas[i], i));
    await pg.goto(furl(f));
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(250);
    const over = await pg.evaluate(() => { const b = document.querySelector('.body'); if (!b) return 0; const r = b.getBoundingClientRect(); return Math.max(0, r.bottom - 1640); });
    if (over > 0) throw new Error(`cena ${i + 1}: o texto passa da área segura em ${Math.round(over)} px; encurte o texto dessa cena`);
    const jpg = path.join(DIR, 'cena-' + (i + 1) + '.jpg');
    await pg.screenshot({ path: jpg, type: 'jpeg', quality: 90 });
    out.push(jpg);
  }
  await browser.close();
  return out;
}

/* ---------- vídeo ---------- */
function run(args, timeout) { const p = cp.spawnSync('ffmpeg', args, { encoding: 'utf8', timeout: timeout || 300000 }); if (p.status !== 0) throw new Error('ffmpeg falhou: ' + (p.stderr || '').slice(-600)); return p; }
function dur(f) { return parseFloat(cp.execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim()); }
function estimate(txt) { const w = plain(txt).split(/\s+/).filter(Boolean).length; return Math.max(5, Math.round((w / 2.5 + 1.2) * 10) / 10); }

function buildVideo(frames, lens, audios, out) {
  const args = ['-y', '-loglevel', 'error'];
  const seg = lens.map((L, i) => L + (i < lens.length - 1 ? FADE : 0.6));
  frames.forEach((f, i) => args.push('-framerate', String(FPS), '-loop', '1', '-t', seg[i].toFixed(3), '-i', f));
  (audios || []).forEach(a => args.push('-i', a));
  const fl = [];
  frames.forEach((f, i) => fl.push(`[${i}:v]scale=1134:2016,crop=1080:1920:x='(iw-ow)/2':y='(ih-oh)*(1-t/${seg[i].toFixed(3)})',setsar=1,format=yuv420p[v${i}]`));
  let prev = 'v0', off = 0;
  for (let i = 1; i < frames.length; i++) { off += seg[i - 1] - FADE; fl.push(`[${prev}][v${i}]xfade=transition=fade:duration=${FADE}:offset=${off.toFixed(3)}[x${i}]`); prev = 'x' + i; }
  const total = seg.reduce((a, b) => a + b, 0) - FADE * (frames.length - 1);
  if (audios) {
    let start = 0;
    audios.forEach((a, i) => { const d = Math.round((start + 0.35) * 1000); fl.push(`[${frames.length + i}:a]adelay=${d}|${d}[a${i}]`); start += lens[i]; });
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
  if (!AUDIOS) {
    const frames = await renderFrames(r);
    const lens = r.cenas.map(c => estimate(c.narracao));
    const total = buildVideo(frames, lens, null, path.join(DIR, 'tiktok-mudo.mp4'));
    r.cenas.forEach((c, i) => { c.segundos = lens[i]; });
    fs.writeFileSync(rp, JSON.stringify(r, null, 1) + '\n');
    console.log('OK, ' + frames.length + ' cenas, vídeo mudo de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-mudo.mp4');
  } else {
    if (AUDIOS.length !== r.cenas.length) { console.log('ERROS:\n  mande um áudio por cena: o roteiro tem ' + r.cenas.length + ' cenas e chegaram ' + AUDIOS.length + ' áudios'); process.exit(1); }
    const frames = r.cenas.map((c, i) => path.join(DIR, 'cena-' + (i + 1) + '.jpg'));
    if (!frames.every(exists)) await renderFrames(r);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-narr-'));
    const clean = AUDIOS.map((a, i) => {
      const o = path.join(tmp, 'c' + (i + 1) + '.wav');
      run(['-y', '-loglevel', 'error', '-i', a, '-af', 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.15,areverse,aresample=48000', '-ac', '2', o]);
      return o;
    });
    const lens = clean.map(f => dur(f) + 0.8);
    const total = buildVideo(frames, lens, clean, path.join(DIR, 'tiktok-narrado.mp4'));
    console.log('OK, vídeo narrado de ' + total.toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-narrado.mp4 (cenas de ' + lens.map(x => x.toFixed(1)).join(', ') + ' s)');
  }
})().catch(e => { console.log('ERROS:\n  ' + e.message); process.exit(1); });
