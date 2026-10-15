#!/usr/bin/env node
/* Chance de achar cartas no deck (distribuição hipergeométrica), para o pilar Matemática da Mesa.
   Nunca escreva uma porcentagem de cabeça: rode este script e copie o número.
   Uso:
     node tools/conteudo/chance.cjs --copias 1,4,8 --vistas 7
     node tools/conteudo/chance.cjs --copias 1 --vistas 7,10,14 --deck 99 --minimo 1
     node tools/conteudo/chance.cjs --terrenos 36 --vistas 7 --exato 3
   --deck     cartas no grimório no começo (padrão 99: o deck de 100 menos o comandante na zona de comando)
   --copias   quantas cartas que servem para o mesmo papel (singleton: cartas diferentes com a mesma função), lista separada por vírgula
   --terrenos atalho para --copias quando o assunto é terreno
   --vistas   quantas cartas você já viu: 7 da mão inicial + 1 por compra (lista separada por vírgula)
   --minimo   pelo menos quantas (padrão 1)
   --exato    exatamente quantas (no lugar de --minimo)
   Lembrete para o texto: em mesa de Commander com 3 ou mais jogadores ninguém pula a compra do primeiro turno;
   no 1x1 quem começa pula. Se for citar o número da regra, confira na seção 103 da versão atual das Regras Abrangentes
   (a numeração muda entre versões). Mulligan muda a conta: diga que o número é sem mulligan. */
'use strict';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const lista = s => String(s).split(',').map(x => parseInt(x, 10)).filter(x => Number.isFinite(x));
const N = parseInt(arg('deck', '99'), 10);
const Ks = lista(arg('copias', arg('terrenos', '')));
const ns = lista(arg('vistas', '7'));
const EX = arg('exato', null), MIN = parseInt(arg('minimo', '1'), 10);
if (!Ks.length || !ns.length || !(N > 0)) { console.error('Uso: node tools/conteudo/chance.cjs --copias 1,4,8 --vistas 7 [--deck 99] [--minimo 1 | --exato 3]'); process.exit(2); }

function lnC(n, k) { if (k < 0 || k > n) return -Infinity; let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }
const pExato = (N, K, n, k) => Math.exp(lnC(K, k) + lnC(N - K, n - k) - lnC(N, n));
const fmt = p => (Math.round(p * 1000) / 10).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

const linhas = [];
for (const K of Ks) for (const n of ns) {
  if (K > N || n > N) { console.error(`impossível: ${K} cópias ou ${n} vistas num deck de ${N}`); process.exit(2); }
  let p, desc;
  if (EX != null) { const k = parseInt(EX, 10); p = pExato(N, K, n, k); desc = `exatamente ${k}`; }
  else { p = 0; for (let k = MIN; k <= Math.min(K, n); k++) p += pExato(N, K, n, k); desc = `pelo menos ${MIN}`; }
  linhas.push({ K, n, p, txt: `${fmt(p)}  (${desc} de ${K} em ${n} cartas vistas, deck de ${N})` });
}
linhas.forEach(l => console.log(l.txt));
if (linhas.length > 1) console.log('\nPara o carrossel (barras): ' + JSON.stringify(linhas.map(l => ({ valor: Math.round(l.p * 1000) / 10, texto: fmt(l.p) }))));
