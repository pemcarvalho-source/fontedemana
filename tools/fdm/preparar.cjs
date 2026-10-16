#!/usr/bin/env node
/* Começo padrão de toda execução da Fonte de Mana (orquestrador, .claude/skills/fdm-orquestrar/SKILL.md).
   Uso: node tools/fdm/preparar.cjs <raiz do repositório> <fase>      fase: jornal, pauta, noite ou narracao
   1. confere que a pasta é o repositório da Fonte de Mana e que não há alteração pendente;
   2. atualiza com o main do GitHub (git fetch + checkout -B main);
   3. calcula HOJE e AMANHA no fuso de São Paulo e cria a pasta de rascunhos /tmp/fdm;
   4. confere as ferramentas que a fase usa (ffmpeg e Chromium para imagens e vídeo).
   Saída 0 com "PRONTO" e as variáveis da fase; saída 1 com "ERRO:" e o motivo exato (nada é apagado nem desfeito). */
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');

const ROOT = path.resolve(process.argv[2] || '.');
const FASE = process.argv[3] || '';
const FASES = {
  jornal: { pastas: ['data', 'img', 'kit'], video: true },
  pauta: { pastas: ['pauta'], video: false },
  noite: { pastas: ['pauta'], video: true },
  narracao: { pastas: ['pauta'], video: true }
};
const erro = m => { console.log('ERRO: ' + m); process.exit(1); };
if (!FASES[FASE]) erro('fase desconhecida "' + FASE + '". Use: ' + Object.keys(FASES).join(', '));

const git = (args, ok) => {
  const r = cp.spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0 && !ok) erro('git ' + args.join(' ') + ' falhou: ' + (r.stderr || r.stdout).trim().split('\n').slice(-3).join(' | '));
  return (r.stdout || '').trim();
};
const espera = s => cp.spawnSync('sleep', [String(s)]);

// 1. repositório certo e limpo
const origem = git(['remote', 'get-url', 'origin'], true);
if (!/pemcarvalho-source\/fontedemana(\.git)?$/.test(origem)) erro('a pasta ' + ROOT + ' não é o repositório da Fonte de Mana (origin: ' + (origem || 'nenhum') + ')');
const pendente = git(['status', '--porcelain']);
if (pendente) erro('há alterações pendentes no repositório, resolva antes de seguir:\n' + pendente.split('\n').slice(0, 15).join('\n'));

// 2. atualizar com o main (uma nova tentativa depois de 10 s)
let f = cp.spawnSync('git', ['fetch', '-q', 'origin', 'main'], { cwd: ROOT, encoding: 'utf8' });
if (f.status !== 0) { espera(10); f = cp.spawnSync('git', ['fetch', '-q', 'origin', 'main'], { cwd: ROOT, encoding: 'utf8' }); }
if (f.status !== 0) erro('git fetch origin main falhou duas vezes: ' + (f.stderr || '').trim());
git(['checkout', '-q', '-B', 'main', 'FETCH_HEAD']);
const commit = git(['log', '-1', '--format=%h %ci %s']);

// 3. datas e rascunhos
const dia = d => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
const HOJE = dia(new Date()), AMANHA = dia(new Date(Date.parse(HOJE + 'T12:00:00Z') + 864e5));
fs.mkdirSync('/tmp/fdm', { recursive: true });

// 4. ferramentas
const avisos = [];
if (FASES[FASE].video) {
  if (cp.spawnSync('ffmpeg', ['-version']).status !== 0) avisos.push('ffmpeg não encontrado: os vídeos não vão sair (use --sem-video no kit)');
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  let chrome = false; try { chrome = fs.readdirSync(base).some(d => /^chromium-\d+$/.test(d)); } catch (e) {}
  if (!chrome) avisos.push('Chromium não encontrado em ' + base + ': os scripts vão tentar outro caminho e podem demorar mais');
}

console.log('PRONTO');
console.log('FASE=' + FASE);
console.log('HOJE=' + HOJE);
console.log('AMANHA=' + AMANHA);
console.log('PASTAS=' + FASES[FASE].pastas.join(' '));
console.log('MAIN=' + commit);
if (avisos.length) console.log('AVISOS:\n  ' + avisos.join('\n  '));
