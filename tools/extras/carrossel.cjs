#!/usr/bin/env node
/* Carrossel avulso (fora das edições diárias) no mesmo visual do Kit de Redes.
   Uso: node tools/extras/carrossel.cjs <spec.json> <pasta de saída> [--estrito]
   --estrito: termina com erro (código 3) se algum texto estourar a tela.
   Opcional na capa: "arte" (caminho de imagem a partir da raiz do repositório, ex. pauta/2026-10-15/original/arte.jpg)
   e "credito" ("Arte: <carta>, <artista>"). Sem arte, usa o terreno da cor da capa.
   Opcional em cada cartão: "carta" (imagem da carta, mesmo esquema de caminho), mostrada no alto da tela.
   Também usado pelos originais diários (tools/conteudo/original.cjs). Reaproveita CSS e fontes de tools/kit. */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const ESTRITO = process.argv.includes('--estrito');
const ROOT = path.resolve(__dirname, '../..');
const spec = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const OUT = path.resolve(process.argv[3]); fs.mkdirSync(OUT, { recursive: true });
const furl = p => 'file://' + p.split(path.sep).map(encodeURIComponent).join('/');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nb = s => String(s).replace(/(US\$|R\$) (\d)/g, '$1\u00a0$2');
const rich = s => nb(esc(s)).replace(/&lt;(\/?)(b|i)&gt;/g, '<$1$2>');
const pip = (c, s) => { const st = s ? ` style="--s:${s}px"` : ''; if (c === 'M') return `<span class="pip p-M"${st}><i class="wd wW"></i><i class="wd wU"></i><i class="wd wB"></i><i class="wd wR"></i><i class="wd wG"></i></span>`; if (c === 'Q') return `<span class="pip p-Q"${st}>?</span>`; return `<span class="pip p-${c}"${st}></span>`; };
const BRAND = '<div class="brand">Fonte <span class="de">de</span> Mana</div>';
const kitCss = fs.readFileSync(path.join(ROOT, 'tools/kit/kit.css'), 'utf8').replace(/\{\{FONTS\}\}/g, furl(path.join(ROOT, 'tools/kit/fonts'))).replace(/\{\{LANDS\}\}/g, furl(path.join(ROOT, 'lands')));
const m = fs.readFileSync(path.join(ROOT, 'tools/kit/gerar.cjs'), 'utf8').match(/const SLIDES_CSS = `([\s\S]*?)`;/);
if (!m) { console.error('SLIDES_CSS não encontrado em gerar.cjs'); process.exit(2); }
const EXTRA = `.cimg{display:block;height:470px;width:auto;margin:0 auto 4px;border-radius:22px;box-shadow:0 10px 28px rgba(0,0,0,.45)}.tbox.comcarta{gap:26px;padding-top:34px}.tbox.comcarta .li{font-size:38px}.fxn{font-family:CP;font-style:italic;font-size:24px;color:#5c5547;margin-top:6px}.cta .main .tag{font-family:CZ;font-weight:700;font-size:64px;line-height:1.1;text-align:center;color:#F3EEE2}.bars{display:flex;align-items:flex-end;gap:30px;height:400px;flex-shrink:0;padding:0 12px;border-bottom:3px solid rgba(0,0,0,.55)}.bar{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:10px}.bar i{display:block;width:100%;border-radius:12px 12px 0 0;background:rgba(40,34,26,.28)}.bar.hi i{background:var(--fc);box-shadow:inset 0 0 0 3px rgba(0,0,0,.35)}.bar .bv{font-family:CZ;font-weight:700;font-size:46px;color:#3b362c}.bar.hi .bv{color:#16130F;font-size:54px}.blab{display:flex;gap:30px;padding:0 12px;margin-top:-26px;flex-shrink:0}.blab span{flex:1;text-align:center;font-family:CZ;font-weight:700;font-size:24px;letter-spacing:.05em;text-transform:uppercase;line-height:1.2;color:#3b362c}`;

const total = 2 + spec.cartoes.length;
let k = 0; const pg = () => `<span class="pg">${k} de ${total}</span>`;
const out = [];
k++;
const capaArte = spec.capa.arte && fs.existsSync(path.join(ROOT, spec.capa.arte)) ? `url('${furl(path.join(ROOT, spec.capa.arte))}')` : `var(--land-${'WUBRG'.includes(spec.capa.cor) ? spec.capa.cor : 'B'})`;
out.push(`<section class="slide canvas cover"><div class="art" style="background-image:${capaArte}"></div><div class="pad"><div class="top">${BRAND}<span class="chip">${esc(spec.capa.chip)}</span></div><div class="body"><div class="kicker">${pip('M', 44)}${esc(spec.capa.kicker)}</div><h1>${rich(spec.capa.titulo)}</h1><p class="sub">${rich(spec.capa.sub)}</p></div><div class="foot"><span class="credit">${esc(spec.capa.credito || '')}</span><span class="swipe">Arrasta pro lado</span></div></div></section>`);
for (const c of spec.cartoes) {
  k++;
  const cimg = c.carta && fs.existsSync(path.join(ROOT, c.carta)) ? `<img class="cimg" src="${furl(path.join(ROOT, c.carta))}" alt="">` : '';
  const max = c.barras ? Math.max(...c.barras.map(b => +b.valor || 0), 1) : 1;
  const bars = c.barras ? `<div class="bars">${c.barras.map((b, j) => `<div class="bar${j === c.destaque ? ' hi' : ''}"><span class="bv">${esc(b.texto)}</span><i style="height:${Math.max(3, Math.round((+b.valor || 0) / max * 100))}%"></i></div>`).join('')}</div><div class="blab">${c.barras.map(b => `<span>${esc(b.rotulo)}</span>`).join('')}</div>` : '';
  const body = cimg + bars + c.itens.map(it => `<div class="li">${pip(it.cor)}<p>${rich(it.html)}</p></div>`).join('');
  const note = c.nota ? `<div class="note"><b>${esc(c.nota.rotulo)},</b> ${rich(c.nota.texto)}</div>` : '';
  const fx = c.fx ? `<p class="fxn">${nb(esc(c.fx))}</p>` : '';
  out.push(`<section class="slide canvas big"><div class="pad"><div class="top">${BRAND}${pg()}</div><div class="card fr-${c.cor}"><div class="plate"><h2>${esc(c.titulo)}</h2>${pip(c.cor, 44)}</div><div class="tbox${cimg ? ' comcarta' : ''}">${body}${note}${fx}<p class="src">${esc(c.fonte)}</p></div></div></div></section>`);
}
k++;
const pool = 'WUBRG'.split('').map(x => `<i style="background-image:var(--land-${x})"></i>`).join('');
out.push(`<section class="slide canvas cta"><div class="pad"><div class="top"><span></span>${pg()}</div><div class="main"><p class="tag">${rich(spec.cta.pergunta)}</p><div class="pool">${pool}</div>${BRAND}<p class="when">${esc(spec.cta.quando)}</p><span class="url">fontedemana.com.br</span><span class="bio">@fontedemana</span></div><p class="save">${esc(spec.cta.salvar)}</p></div></section>`);
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${kitCss}${m[1]}${EXTRA}</style></head><body>${out.join('\n')}</body></html>`;

(async () => {
  // mesmo jeito de achar o Playwright e o Chromium de tools/pauta/tiktok.cjs
  let pw, groot = '';
  try { groot = cp.execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) {}
  const local = path.join(os.tmpdir(), 'fdm-playwright');
  const cands = ['playwright', 'playwright-core'].concat(groot ? ['@playwright/mcp/node_modules/playwright', 'playwright', 'playwright-core', '@playwright/test/node_modules/playwright-core'].map(c => path.join(groot, c)) : [], [path.join(local, 'node_modules/playwright-core')]);
  for (const c of cands) { try { pw = require(c); break; } catch (e) {} }
  if (!pw) {
    console.log('Playwright não encontrado, instalando playwright-core numa pasta temporária...');
    fs.mkdirSync(local, { recursive: true });
    cp.execSync('npm install --no-audit --no-fund --prefix "' + local + '" playwright-core@1.56.1', { stdio: 'inherit' });
    pw = require(path.join(local, 'node_modules/playwright-core'));
  }
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  let exe;
  try { const ds = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1]); for (const d of ds) { const p = path.join(base, d, 'chrome-linux', 'chrome'); if (fs.existsSync(p)) { exe = p; break; } } } catch (e) {}
  const b = await pw.chromium.launch(exe ? { executablePath: exe } : {});
  const pgx = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const f = path.join(OUT, '_slides.html'); fs.writeFileSync(f, html);
  await pgx.goto(furl(f)); await pgx.evaluate(() => document.fonts.ready); await pgx.waitForTimeout(400);
  const els = await pgx.$$('.slide'); const over = [];
  for (let i = 0; i < els.length; i++) {
    const o = await els[i].evaluate(e => { const t = e.querySelector('.tbox'); return t ? t.scrollHeight > t.clientHeight + 2 : false; });
    if (o) over.push(i + 1);
    await els[i].screenshot({ path: path.join(OUT, `carrossel-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 92 });
  }
  fs.unlinkSync(f); await b.close();
  console.log(els.length + ' imagens em ' + OUT + (over.length ? ' | TEXTO ESTOURA nas telas ' + over.join(',') : ' | sem estouro'));
  if (ESTRITO && over.length) process.exit(3);
})().catch(e => { console.error('Falha ao gerar o carrossel: ' + (e && e.message || e)); process.exit(1); });
