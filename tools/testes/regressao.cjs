#!/usr/bin/env node
/* Teste de regressão das rotinas da Fonte de Mana.
   Uso: node tools/testes/regressao.cjs <raiz do repositório> [dias=3]
   Copia o repositório (sem .git) para uma pasta temporária e, lá dentro, roda os scripts de produção sobre os
   últimos dias publicados, comparando o resultado com o que está no repositório:
     - jornal: tools/jornal/validar.cjs na edição mais recente;
     - kit:    tools/kit/gerar.cjs N --pagina nas últimas edições com kit.json (confere e refaz só as páginas);
     - pauta:  tools/pauta/manha.cjs em cada dia e compara o pauta.json gerado com o publicado.
   Nada no repositório é alterado. Saída: 0 tudo igual, 1 algum script falhou, 2 rodou mas houve diferença.
   É a régua da refatoração (tools/rotinas/README.md): uma peça nova só substitui a antiga se este teste sair igual. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process'), vm = require('vm');

const ROOT = path.resolve(process.argv[2] || '.');
const DIAS = parseInt(process.argv[3] || '3', 10);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fdm-regressao-'));
const res = [];
const node = (args, cwd) => cp.spawnSync(process.execPath, args, { cwd, encoding: 'utf8', timeout: 300000 });
const ultimas = (s, n = 400) => String(s || '').trim().split('\n').slice(-6).join('\n').slice(-n);
const anota = (parte, alvo, estado, detalhe) => res.push({ parte, alvo, estado, detalhe: detalhe || '' });

// diferença entre dois JSON: lista de caminhos que mudaram (no máximo 8)
function difere(a, b, cam = '', out = []) {
  if (out.length >= 8) return out;
  if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b) || (a === null) !== (b === null)) { out.push(cam || '(raiz)'); return out; }
  if (a && typeof a === 'object') {
    const ks = new Set(Object.keys(a).concat(Object.keys(b)));
    ks.forEach(k => difere(a[k], b[k], cam + (Array.isArray(a) ? '[' + k + ']' : '.' + k), out));
  } else if (a !== b) out.push(cam || '(raiz)');
  return out;
}

/* ---------- cópia ---------- */
fs.cpSync(ROOT, TMP, { recursive: true, filter: s => path.basename(s) !== '.git' && path.basename(s) !== 'node_modules' });

/* ---------- jornal ---------- */
let N = null;
try {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'data/index.js'), 'utf8'), ctx);
  N = ctx.window.MANA_POOL_INDEX.editions[0].n;
  const r = node([path.join(TMP, 'tools/jornal/validar.cjs'), TMP, String(N)], TMP);
  anota('jornal', 'ed' + N, r.status === 0 ? 'ok' : 'falhou', ultimas(r.stdout + r.stderr));
} catch (e) { anota('jornal', '?', 'falhou', e.message); }

/* ---------- kit ---------- */
if (N) for (let n = N; n > N - DIAS && n > 0; n--) {
  const kj = path.join(ROOT, 'kit', 'ed' + n, 'kit.json');
  if (!fs.existsSync(kj)) { anota('kit', 'ed' + n, 'sem kit'); continue; }
  const pag = path.join('kit', 'ed' + n, 'index.html');
  const r = node([path.join(TMP, 'tools/kit/gerar.cjs'), TMP, String(n), '--pagina'], TMP);
  if (r.status !== 0) { anota('kit', 'ed' + n, 'falhou', ultimas(r.stdout + r.stderr)); continue; }
  const igual = fs.existsSync(path.join(ROOT, pag)) && fs.readFileSync(path.join(ROOT, pag), 'utf8') === fs.readFileSync(path.join(TMP, pag), 'utf8');
  anota('kit', 'ed' + n, igual ? 'ok' : 'diferente', igual ? '' : 'a página ' + pag + ' saiu diferente da publicada');
}

/* ---------- pauta ---------- */
const dias = fs.readdirSync(path.join(ROOT, 'pauta')).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && fs.existsSync(path.join(ROOT, 'pauta', d, 'pauta.json'))).sort().slice(-DIAS);
dias.forEach(d => {
  const pub = JSON.parse(fs.readFileSync(path.join(ROOT, 'pauta', d, 'pauta.json'), 'utf8'));
  const r = node([path.join(TMP, 'tools/pauta/manha.cjs'), TMP, d], TMP);
  if (r.status !== 0) { anota('pauta', d, 'falhou', ultimas(r.stdout + r.stderr)); return; }
  const novo = JSON.parse(fs.readFileSync(path.join(TMP, 'pauta', d, 'pauta.json'), 'utf8'));
  const dif = difere(pub, novo);
  anota('pauta', d, dif.length ? 'diferente' : 'ok', dif.length ? 'mudou: ' + dif.join(', ') : '');
});

/* ---------- relatório ---------- */
fs.rmSync(TMP, { recursive: true, force: true });
console.log('Regressão da Fonte de Mana (' + new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC)');
res.forEach(x => console.log(`  ${x.parte.padEnd(6)} ${x.alvo.padEnd(11)} ${x.estado}${x.detalhe ? '\n      ' + x.detalhe.replace(/\n/g, '\n      ') : ''}`));
const falhou = res.some(x => x.estado === 'falhou'), dif = res.some(x => x.estado === 'diferente');
console.log(falhou ? 'RESULTADO: algum script falhou' : dif ? 'RESULTADO: rodou, com diferenças' : 'RESULTADO: tudo igual');
process.exit(falhou ? 1 : dif ? 2 : 0);
