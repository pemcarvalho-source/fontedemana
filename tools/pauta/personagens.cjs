#!/usr/bin/env node
/* Personagens animados da Treta das Cores (pedido do Paulo em 1 nov 2026): nas cenas de fala, em vez do quadro de texto,
   entra um personagem original da cor (Preto, Branco...) falando, num cenário no estilo de arte do Magic, com o kicker e o
   título por cima, como nas cenas em que o Paulo aparece. O Paulo dubla essas cenas; as outras seguem com a voz normal.
   Uso (mesmos argumentos do tiktok.cjs):
     node tools/pauta/personagens.cjs <raiz> <AAAA-MM-DD>
       gera tiktok-mudo.mp4 com os personagens (boca mexendo num ritmo de fala genérico)
     node tools/pauta/personagens.cjs <raiz> <AAAA-MM-DD> --narrar <cena_1> <cena_2> ...
       um áudio por cena, na ordem; nas cenas de personagem a boca acompanha o volume da voz do Paulo; gera tiktok-narrado.mp4
   No roteiro.json, a cena de personagem continua do tipo "texto" (o tiktok.cjs sozinho ainda funciona) e ganha
   "personagem": "preto" | "branco" | "vermelho" e, se quiser, "humor": "debochado" | "impaciente" | "severa".
   Mesa vista de cima (desde 22/11/2026, pedido do Paulo): com "mesa" no roteiro ({"cima": personagem, "baixo": personagem,
   "cartas": {"cima": jpg do comandante de cima, "baixo": jpg do comandante de baixo}}), a cena de personagem que tiver
   "mesa": {"jogada": "equipar" | "wipe", "carta": jpg da carta jogada, "rotulo": texto do escudo (equipar), "dano": número
   (wipe)} mostra a mesa de cima, com os dois personagens em medalhões, um de cada lado; quem fala brilha e mexe a boca, e
   a jogada acontece durante a fala (o que as cenas anteriores jogaram já está na mesa). A caixa do título fica no topo.
   Por dentro: monta uma cópia da pasta do dia num diretório temporário, troca as cenas de personagem para o tipo rosto
   e roda o próprio tiktok.cjs nessa cópia, passando o vídeo do personagem no lugar do vídeo do Paulo. Assim o roteiro do
   repositório não marca "rostoGravado" (o Paulo não apareceu) e o molde, as transições e o volume são os mesmos. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
const IDX = process.argv.indexOf('--narrar');
const AUDIOS = IDX > 0 ? process.argv.slice(IDX + 1).map(a => path.resolve(a)) : null;
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/pauta/personagens.cjs <raiz> <AAAA-MM-DD> [--narrar a1 a2 ...]'); process.exit(2); }
const DIR = path.join(ROOT, 'pauta', DATA, 'tiktok');
const FPS = 30;
const NOMES = { preto: 'O Preto', branco: 'O Branco', vermelho: 'O Vermelho' };

function run(cmd, args, opts) {
  const p = cp.spawnSync(cmd, args, Object.assign({ encoding: 'utf8', maxBuffer: 1 << 28 }, opts || {}));
  if (p.status !== 0) throw new Error(cmd + ' falhou: ' + ((p.stderr || '') + (p.stdout || '')).slice(-800));
  return p;
}
const dur = f => parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim());

/* ---------- boca ---------- */
/* volume da voz quadro a quadro, de 0 (boca fechada) a 1 (aberta) */
function envAudio(f) {
  const buf = run('ffmpeg', ['-v', 'error', '-i', f, '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], { encoding: 'buffer' }).stdout;
  const n = Math.floor(buf.length / 2), passo = 16000 / FPS, q = Math.ceil(n / passo), db = [];
  for (let k = 0; k < q; k++) {
    let s = 0, c = 0;
    for (let j = Math.floor(k * passo); j < Math.min(n, Math.floor((k + 1) * passo)); j++) { const v = buf.readInt16LE(j * 2) / 32768; s += v * v; c++; }
    db.push(10 * Math.log10(s / Math.max(1, c) + 1e-10));
  }
  const ord = db.slice().sort((a, b) => a - b), pct = p => ord[Math.min(ord.length - 1, Math.floor(p * ord.length))];
  const piso = Math.max(pct(0.15), -60) + 6, topo = Math.max(pct(0.95), piso + 6);
  const out = []; let y = 0;
  for (const d of db) { const x = Math.max(0, Math.min(1, (d - piso) / (topo - piso))); y = x > y ? y + (x - y) * 0.75 : y + (x - y) * 0.5; out.push(Math.round(y * 100) / 100); }
  return out;
}
/* sem áudio (vídeo mudo): sílabas espalhadas pela duração estimada da fala */
function envSintetico(texto, secs) {
  const sil = Math.max(4, (String(texto).toLowerCase().match(/[aeiouáéíóúâêôãõà]+/g) || []).length);
  const n = Math.ceil(secs * FPS), ini = 0.15, fim = Math.max(ini + 0.5, secs - 0.35);
  const picos = Array.from({ length: sil }, (x, k) => ({ t: ini + (k + 0.5) * (fim - ini) / sil, a: 0.45 + 0.55 * Math.abs(Math.sin(k * 2.7 + 1)) }));
  return Array.from({ length: n }, (x, i) => { const t = i / FPS; let m = 0; for (const p of picos) m = Math.max(m, p.a * Math.exp(-Math.pow((t - p.t) / 0.07, 2))); return Math.round(m * 100) / 100; });
}

/* ---------- vídeo do personagem ---------- */
function loadPlaywright() {
  const cands = ['playwright', 'playwright-core'];
  try { const g = cp.execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); cands.push(path.join(g, 'playwright'), path.join(g, 'playwright-core'), path.join(g, '@playwright/mcp/node_modules/playwright')); } catch (e) {}
  cands.push(path.join(os.tmpdir(), 'fdm-playwright/node_modules/playwright-core'));
  for (const c of cands) { try { return require(c); } catch (e) {} }
  throw new Error('Playwright não encontrado (rode uma vez o tiktok.cjs, que instala numa pasta temporária)');
}
function chromePath() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  try { for (const d of fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])) { const p = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) return p; } } catch (e) {}
  return undefined;
}
function paginaHTML() {
  const arte = fs.readFileSync(path.join(__dirname, 'personagens-arte.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'tools/kit/kit.css'), 'utf8');
  const g = (css.match(/--tex-grain:(url\("[^"]+"\))/) || [])[1] || 'none';
  const fonte = fs.readFileSync(path.join(ROOT, 'tools/kit/fonts/cinzel-latin-700-normal.woff2')).toString('base64');
  return `<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:CZ;font-weight:700;src:url(data:font/woff2;base64,${fonte})}html,body{margin:0;background:#000}#c{position:relative;width:1080px;height:1920px;overflow:hidden}svg{position:absolute;left:0;top:0}
.grain{position:absolute;inset:0;background:${g};background-size:200px;opacity:.6;mix-blend-mode:overlay}</style></head>
<body><div id="c"><svg id="s" width="1080" height="1920" viewBox="0 0 1080 1920"></svg><div class="grain"></div></div><script>${arte}</script></body></html>`;
}
async function clipe(browser, nome, humor, env, out) {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.setContent(paginaHTML());
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-pers-'));
  for (let i = 0; i < env.length; i++) {
    await pg.evaluate(([n, t, m, h]) => window.desenha(n, t, m, h), [nome, i / FPS, env[i], humor || '']);
    await pg.screenshot({ path: path.join(tmp, 'q' + String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  }
  await pg.close();
  run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'q%05d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}

/* a mesa vista de cima: as imagens entram uma vez na página (URLs blob) e cada quadro redesenha a cena */
const ENV_LIMIAR = 0.12;
function falaDe(env) {
  const i = env.findIndex(x => x > ENV_LIMIAR); let j = env.length - 1; while (j > 0 && !(env[j] > ENV_LIMIAR)) j--;
  return i < 0 || j <= i ? [0, Math.max(1, env.length - 1) / FPS] : [i / FPS, j / FPS];
}
function cfgMesa(r, i) {
  const M = r.mesa, c = r.cenas[i], lado = M.cima === c.personagem ? 'cima' : 'baixo';
  const img = { cima: M.cartas.cima, baixo: M.cartas.baixo }, feitas = [];
  let ladoEquip = 'baixo', ladoWipe = 'cima', rotulo = null;
  r.cenas.forEach((x, k) => {
    if (!x.mesa || !x.personagem) return;
    const l = M.cima === x.personagem ? 'cima' : 'baixo';
    if (x.mesa.jogada === 'equipar') { img.equip = x.mesa.carta; ladoEquip = l; rotulo = x.mesa.rotulo || rotulo; }
    if (x.mesa.jogada === 'wipe') { img.wipe = x.mesa.carta; ladoWipe = l; }
    if (k < i && x.mesa.jogada) feitas.push(x.mesa.jogada);
  });
  return { cima: M.cima, baixo: M.baixo, fala: lado, jogada: c.mesa.jogada || null, feitas, img, ladoEquip, ladoWipe, rotulo, dano: c.mesa.dano || '' };
}
async function clipeMesa(browser, cfg, env, out) {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.setContent(paginaHTML());
  const dados = {};
  for (const k of Object.keys(cfg.img)) dados[k] = fs.readFileSync(path.join(ROOT, cfg.img[k])).toString('base64');
  const urls = await pg.evaluate(async d => {
    const o = {};
    for (const k of Object.keys(d)) {
      const b = await (await fetch('data:image/jpeg;base64,' + d[k])).blob();
      o[k] = URL.createObjectURL(b);
      const im = new Image(); im.src = o[k]; await im.decode();
    }
    await document.fonts.load('700 30px CZ');
    return o;
  }, dados);
  const c2 = Object.assign({}, cfg, { img: urls });
  const [ini, fim] = falaDe(env);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-mesa-'));
  for (let i = 0; i < env.length; i++) {
    const t = i / FPS, p = Math.max(0, Math.min(1, (t - ini) / Math.max(0.5, fim - ini)));
    await pg.evaluate(([c, t, p, m]) => window.desenhaMesa(c, t, p, m), [c2, t, p, env[i]]);
    await pg.screenshot({ path: path.join(tmp, 'q' + String(i).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 90 });
  }
  await pg.close();
  run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'q%05d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
const clipeDe = (browser, r, i, env, out) => r.cenas[i].mesa && r.mesa ? clipeMesa(browser, cfgMesa(r, i), env, out) : clipe(browser, r.cenas[i].personagem, r.cenas[i].humor, env, out);

/* ---------- cópia da pasta do dia com as cenas de personagem como rosto ---------- */
function montaRaiz(r) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-treta-'));
  for (const d of ['tools', 'lands']) fs.symlinkSync(path.join(ROOT, d), path.join(raiz, d));
  const dir = path.join(raiz, 'pauta', DATA, 'tiktok');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(DIR)) if (!/\.mp4$/.test(f) && f !== 'roteiro.json' && fs.statSync(path.join(DIR, f)).isFile()) fs.copyFileSync(path.join(DIR, f), path.join(dir, f));
  const c2 = JSON.parse(JSON.stringify(r));
  /* personagemVideo: o tiktok.cjs não conta essas cenas como cenas do Paulo (limite de cenas rosto e rosto.soCena1) */
  c2.cenas.forEach(c => { if (c.personagem) { c.tipo = 'rosto'; c.personagemVideo = true; c.gravar = (NOMES[c.personagem] || c.personagem) + ' animado fala; o Paulo só grava a voz'; if (c.mesa && r.mesa && !c.caixa) c.caixa = 'topo'; } });
  fs.writeFileSync(path.join(dir, 'roteiro.json'), JSON.stringify(c2, null, 1) + '\n');
  return { raiz, dir };
}
function tiktok(raiz, extra) {
  const p = cp.spawnSync('node', [path.join(ROOT, 'tools/pauta/tiktok.cjs'), raiz, DATA].concat(extra || []), { encoding: 'utf8', timeout: 900000 });
  const o = (p.stdout || '') + (p.stderr || '');
  if (p.status !== 0 || /ERROS:/.test(o)) throw new Error('tiktok.cjs: ' + o.trim().slice(-800));
  return o.trim();
}

(async () => {
  const r = JSON.parse(fs.readFileSync(path.join(DIR, 'roteiro.json'), 'utf8'));
  const idx = r.cenas.map((c, i) => c.personagem ? i : -1).filter(i => i >= 0);
  if (!idx.length) { console.log('ERROS:\n  nenhuma cena com "personagem" no roteiro: use o tiktok.cjs'); process.exit(1); }
  for (const i of idx) if (!NOMES[r.cenas[i].personagem]) { console.log('ERROS:\n  cena ' + (i + 1) + ': personagem "' + r.cenas[i].personagem + '" ainda não foi desenhado (tem: ' + Object.keys(NOMES).join(', ') + ')'); process.exit(1); }
  const EM = [];
  if (r.cenas.some(c => c.mesa)) {
    const M = r.mesa;
    if (!M || !M.cartas) EM.push('cena com "mesa" precisa de "mesa": {"cima", "baixo", "cartas": {"cima", "baixo"}} no roteiro');
    else {
      for (const l of ['cima', 'baixo']) { if (!NOMES[M[l]]) EM.push('mesa.' + l + ': personagem desconhecido "' + M[l] + '"'); if (!M.cartas[l] || !fs.existsSync(path.join(ROOT, M.cartas[l]))) EM.push('mesa.cartas.' + l + ' não encontrada: ' + M.cartas[l]); }
      r.cenas.forEach((c, i) => {
        if (!c.mesa) return;
        if (!c.personagem || (c.personagem !== M.cima && c.personagem !== M.baixo)) EM.push('cena ' + (i + 1) + ': a cena de mesa precisa de "personagem" igual a mesa.cima ou mesa.baixo');
        if (c.mesa.jogada && !['equipar', 'wipe'].includes(c.mesa.jogada)) EM.push('cena ' + (i + 1) + ': mesa.jogada precisa ser "equipar" ou "wipe"');
        if (c.mesa.jogada && (!c.mesa.carta || !fs.existsSync(path.join(ROOT, c.mesa.carta)))) EM.push('cena ' + (i + 1) + ': mesa.carta não encontrada: ' + c.mesa.carta);
      });
    }
  }
  if (EM.length) { console.log('ERROS:\n' + EM.map(e => '  ' + e).join('\n')); process.exit(1); }
  const { raiz, dir } = montaRaiz(r);
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-treta-a-'));
  const pw = loadPlaywright(), exe = chromePath();
  const browser = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  try {
    if (!AUDIOS) {
      /* vídeo mudo: o próprio pipeline da narração, com um chiado no lugar da voz (alto o bastante para o corte de silêncio
         do tiktok.cjs não comer pedaços da cena; para o tempo de cada cena
         sair igual ao do vídeo mudo normal), e o som é tirado no fim */
      tiktok(raiz);
      const rr = JSON.parse(fs.readFileSync(path.join(dir, 'roteiro.json'), 'utf8'));
      const arqs = [];
      for (let i = 0; i < r.cenas.length; i++) {
        const c = r.cenas[i], secs = rr.cenas[i].segundos || 3;
        const chiado = path.join(tmp, 'n' + (i + 1) + '.wav');
        run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anoisesrc=d=${(c.personagem ? secs : Math.max(1, secs - 0.8)).toFixed(2)}:c=pink:a=0.3`, '-ar', '48000', '-ac', '2', chiado]);
        if (!c.personagem) { arqs.push(chiado); continue; }
        const v = await clipeDe(browser, r, i, envSintetico(c.narracao, secs), path.join(tmp, 'p' + (i + 1) + '.mp4'));
        const mv = path.join(tmp, 'cena_' + (i + 1) + '.mp4');
        run('ffmpeg', ['-y', '-loglevel', 'error', '-i', v, '-i', chiado, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', mv]);
        arqs.push(mv);
      }
      tiktok(raiz, ['--narrar'].concat(arqs));
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(dir, 'tiktok-narrado.mp4'), '-an', '-c:v', 'copy', '-movflags', '+faststart', path.join(DIR, 'tiktok-mudo.mp4')]);
      console.log('OK, vídeo mudo com ' + idx.length + ' cenas de personagem (' + idx.map(i => 'cena ' + (i + 1) + ', ' + r.cenas[i].personagem).join('; ') + ') e ' + dur(path.join(DIR, 'tiktok-mudo.mp4')).toFixed(1) + ' s em pauta/' + DATA + '/tiktok/tiktok-mudo.mp4');
    } else {
      if (AUDIOS.length < r.cenas.length) { console.log('ERROS:\n  mande um áudio por cena: o roteiro tem ' + r.cenas.length + ' cenas e chegaram ' + AUDIOS.length); process.exit(1); }
      const arqs = [];
      for (let i = 0; i < AUDIOS.length; i++) {
        const c = r.cenas[i], a = AUDIOS[i];
        if (!c || !c.personagem) { arqs.push(a); continue; }
        const env = envAudio(a);
        const v = await clipeDe(browser, r, i, env, path.join(tmp, 'p' + (i + 1) + '.mp4'));
        const mv = path.join(tmp, 'cena_' + (i + 1) + '.mp4');
        run('ffmpeg', ['-y', '-loglevel', 'error', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-ar', '48000', '-shortest', mv]);
        arqs.push(mv);
      }
      const o = tiktok(raiz, ['--narrar'].concat(arqs));
      for (const f of ['tiktok-narrado.mp4', 'tiktok-teste-narrado.mp4']) if (fs.existsSync(path.join(dir, f))) fs.copyFileSync(path.join(dir, f), path.join(DIR, f));
      console.log(o.replace(/; com o Paulo na tela nas? cenas? [\d, ]+/, '; com personagem na' + (idx.length > 1 ? 's cenas ' : ' cena ') + idx.map(i => i + 1).join(', ')));
    }
  } finally {
    await browser.close();
    fs.rmSync(raiz, { recursive: true, force: true }); fs.rmSync(tmp, { recursive: true, force: true });
  }
})().catch(e => { console.log('ERROS:\n  ' + e.message); process.exit(1); });
