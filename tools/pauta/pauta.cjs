#!/usr/bin/env node
/* Pauta de postagem da Fonte de Mana: calendário com alarmes e página de consulta.
   Uso: node tools/pauta/pauta.cjs <raiz do repositório> <AAAA-MM-DD>
   Lê pauta/<data>/pauta.json (formato em tools/pauta/LEIA.md), confere e gera:
     pauta/<data>/index.html   página do dia, com botão de copiar cada texto
     pauta/index.html          lista dos dias
     pauta/<CALENDARIO>        calendário (.ics) com um evento e um alarme por aviso, para assinar no celular */
'use strict';
const fs = require('fs'), path = require('path');

const CALENDARIO = 'agenda-fdm-7q2k9.ics';
const SITE = 'https://fontedemana.com.br';
const WEBCAL = SITE.replace(/^https:/, 'webcal:') + '/pauta/' + CALENDARIO; // webcal:// assina; https:// só importa uma cópia fixa no iPhone
const ROOT = path.resolve(process.argv[2] || '.');
const DATA = process.argv[3] || '';
if (!/^\d{4}-\d{2}-\d{2}$/.test(DATA)) { console.error('Uso: node tools/pauta/pauta.cjs <raiz> <AAAA-MM-DD>'); process.exit(2); }
const PDIR = path.join(ROOT, 'pauta');
const SEPS = [' · ', ' – ', ' — ', '—'];
const REDES = ['Threads', 'Instagram feed', 'Instagram Stories', 'TikTok', 'Reels', 'Gravação', 'Comentários'];
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function read(d) { return JSON.parse(fs.readFileSync(path.join(PDIR, d, 'pauta.json'), 'utf8')); }

function validate(p) {
  const E = [], req = (c, m) => { if (!c) E.push(m); };
  const len = (s, max, n) => { req(typeof s === 'string' && s.trim(), n + ' está vazio'); if (typeof s === 'string') req(s.length <= max, `${n} tem ${s.length} caracteres (máximo ${max})`); };
  req(p.data === DATA, 'pauta.json: data precisa ser ' + DATA);
  req(Array.isArray(p.avisos) && p.avisos.length >= 1, 'avisos precisa ter pelo menos 1 item');
  const ids = new Set();
  (p.avisos || []).forEach((a, i) => {
    const n = 'avisos[' + i + ']';
    req(/^[a-z0-9-]{2,30}$/.test(a.id || ''), n + '.id precisa ser curto, em minúsculas, com letras, números e hífen');
    req(!ids.has(a.id), n + '.id repetido: ' + a.id); ids.add(a.id);
    req(/^\d{2}:\d{2}$/.test(a.hora || ''), n + '.hora precisa ser HH:MM');
    if (a.dia) req(/^\d{4}-\d{2}-\d{2}$/.test(a.dia), n + '.dia precisa ser AAAA-MM-DD');
    req(REDES.includes(a.rede), n + '.rede precisa ser uma de: ' + REDES.join(', '));
    len(a.titulo, 70, n + '.titulo');
    len(a.oQue, 400, n + '.oQue');
    (a.arquivos || []).forEach((f, j) => { len(f.nome, 60, `${n}.arquivos[${j}].nome`); req(/^https:\/\//.test(f.url || ''), `${n}.arquivos[${j}].url precisa ser um link https`); });
    (a.textos || []).forEach((t, j) => { len(t.rotulo, 40, `${n}.textos[${j}].rotulo`); len(t.texto, 2200, `${n}.textos[${j}].texto`); });
    (a.roteiro || []).forEach((r, j) => { len(r.cena, 40, `${n}.roteiro[${j}].cena`); len(r.tela, 160, `${n}.roteiro[${j}].tela`); len(r.fala, 300, `${n}.roteiro[${j}].fala`); if (r.como != null) len(r.como, 160, `${n}.roteiro[${j}].como`); });
    (a.passos || []).forEach((s, j) => len(s, 220, `${n}.passos[${j}]`));
  });
  const texto = JSON.stringify(p, (k, v) => ['url'].includes(k) ? undefined : v);
  SEPS.forEach(s => req(!texto.includes(s), 'separador proibido no texto: "' + s + '"'));
  if (p.fx) {
    const semFala = JSON.stringify(p, (k, v) => ['url', 'fala', 'fx'].includes(k) ? undefined : v);
    const re = /US\$ ?\d+(?:[.,]\d+)*/g; let m;
    while ((m = re.exec(semFala))) if (!/^ ?\(R\$ ?\d/.test(semFala.slice(re.lastIndex, re.lastIndex + 8))) E.push('valor em dólar sem o real entre parênteses: ' + m[0]);
  }
  return E;
}

/* ---------- textos do aviso ---------- */
function descricao(p, a) {
  const L = [a.oQue];
  if (a.arquivos && a.arquivos.length) L.push('', 'Arquivos:', ...a.arquivos.map(f => '- ' + f.nome + ': ' + f.url));
  (a.textos || []).forEach(t => L.push('', t.rotulo + ':', t.texto));
  if (a.roteiro && a.roteiro.length) { L.push('', 'Roteiro de gravação:'); a.roteiro.forEach(r => L.push(r.cena, 'Na tela: ' + r.tela, ...(r.como ? ['Como gravar: ' + r.como] : []), 'Fala: ' + r.fala, '')); }
  if (a.passos && a.passos.length) L.push('', 'Passo a passo:', ...a.passos.map((s, i) => (i + 1) + '. ' + s));
  const temFx = p.fx && /\(R\$/.test(JSON.stringify(a));
  if (temFx) L.push('', p.fx);
  L.push('', 'Pauta completa: ' + SITE + '/pauta/' + p.data + '/#' + a.id);
  return L.join('\n');
}

/* ---------- calendário ---------- */
const icsEsc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line) {
  const out = []; let cur = '', bytes = 0;
  for (const ch of line) { const b = Buffer.byteLength(ch); if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; } cur += ch; bytes += b; }
  out.push(cur);
  return out.map((l, i) => (i ? ' ' : '') + l).join('\r\n');
}
function utc(dia, hora) { const [Y, M, D] = dia.split('-').map(Number), [h, m] = hora.split(':').map(Number); const t = new Date(Date.UTC(Y, M - 1, D, h + 3, m)); return t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
function calendario(dias) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fonte de Mana//Pauta//PT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Fonte de Mana: pauta', 'X-WR-TIMEZONE:America/Sao_Paulo', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H'];
  dias.forEach(d => {
    const p = read(d);
    p.avisos.forEach(a => {
      const dia = a.dia || p.data;
      L.push('BEGIN:VEVENT', 'UID:fdm-' + p.data + '-' + a.id + '@fontedemana.com.br', 'DTSTAMP:' + now, 'DTSTART:' + utc(dia, a.hora), 'DURATION:PT15M',
        'SUMMARY:' + icsEsc(a.hora + ' ' + a.rede + ': ' + a.titulo), 'DESCRIPTION:' + icsEsc(descricao(p, a)),
        'URL:' + SITE + '/pauta/' + p.data + '/#' + a.id,
        'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsEsc(a.rede + ': ' + a.titulo), 'TRIGGER:' + (a.rede === 'Gravação' ? 'PT0M' : '-PT5M'), 'END:VALARM', 'END:VEVENT');
    });
  });
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}

/* ---------- páginas ---------- */
const CSS = `:root{color-scheme:dark;--bg:#0F0F13;--panel:#19191F;--ink:#ECEAF3;--muted:#A8A5B6;--line:#30303A;--gold:#E3BC4E;--link:#8EC0F0}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.5 Georgia,serif}a{color:var(--link)}
.wrap{max-width:720px;margin:0 auto;padding:20px 16px 60px;display:flex;flex-direction:column;gap:18px}
h1{font-size:26px;margin:0}.sub{color:var(--muted);margin:0}
.av{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-margin-top:12px}
.hd{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.hr{font-family:ui-monospace,Menlo,monospace;color:var(--gold);font-weight:700}
.rd{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);border:1px solid var(--line);border-radius:99px;padding:1px 9px}
h2{font-size:19px;margin:0;flex-basis:100%}p{margin:0}
.files{display:flex;flex-direction:column;gap:6px;margin:0;padding-left:18px}
.tx{border:1px solid var(--line);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}
.tx b{font-size:14px;color:var(--muted)}pre{white-space:pre-wrap;margin:0;font:15px/1.45 Georgia,serif}
button{align-self:flex-start;font:600 14px system-ui,sans-serif;background:var(--gold);color:#111;border:0;border-radius:99px;padding:6px 14px}
.ro{display:flex;flex-direction:column;gap:8px}.ro div{border-left:3px solid var(--gold);padding-left:10px}
ol{margin:0;padding-left:20px}.fx{font-size:13px;font-style:italic;color:var(--muted)}`;
const COPY = `document.querySelectorAll('button[data-c]').forEach(function(b){b.addEventListener('click',function(){var t=document.getElementById(b.getAttribute('data-c')).innerText;try{navigator.clipboard.writeText(t).then(function(){b.textContent='Copiado';setTimeout(function(){b.textContent='Copiar';},1500);});}catch(e){}});});`;
function pagina(p) {
  let k = 0;
  const avs = p.avisos.slice().sort((a, b) => ((a.dia || p.data) + a.hora).localeCompare((b.dia || p.data) + b.hora)).map(a => {
    const dia = a.dia && a.dia !== p.data ? ' (' + a.dia.split('-').reverse().slice(0, 2).join('/') + ')' : '';
    const files = a.arquivos && a.arquivos.length ? '<ul class="files">' + a.arquivos.map(f => '<li><a href="' + esc(f.url) + '" download>' + esc(f.nome) + '</a></li>').join('') + '</ul>' : '';
    const tx = (a.textos || []).map(t => { k++; return '<div class="tx"><b>' + esc(t.rotulo) + '</b><pre id="t' + k + '">' + esc(t.texto) + '</pre><button data-c="t' + k + '">Copiar</button></div>'; }).join('');
    const ro = a.roteiro && a.roteiro.length ? '<div class="ro"><b>Roteiro de gravação</b>' + a.roteiro.map(r => { k++; return '<div><b>' + esc(r.cena) + '</b><p>Na tela: ' + esc(r.tela) + '</p>' + (r.como ? '<p>Como gravar: ' + esc(r.como) + '</p>' : '') + '<pre id="t' + k + '">' + esc(r.fala) + '</pre><button data-c="t' + k + '">Copiar fala</button></div>'; }).join('') + '</div>' : '';
    const ps = a.passos && a.passos.length ? '<ol>' + a.passos.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '';
    const fx = p.fx && /\(R\$/.test(JSON.stringify(a)) ? '<p class="fx">' + esc(p.fx) + '</p>' : '';
    return '<section class="av" id="' + esc(a.id) + '"><div class="hd"><span class="hr">' + esc(a.hora) + dia + '</span><span class="rd">' + esc(a.rede) + '</span><h2>' + esc(a.titulo) + '</h2></div><p>' + esc(a.oQue) + '</p>' + files + tx + ro + ps + fx + '</section>';
  }).join('');
  const lbl = p.data.split('-').reverse().join('/');
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Pauta ' + lbl + '</title><style>' + CSS + '</style></head><body><div class="wrap"><h1>Pauta de ' + lbl + '</h1><p class="sub">O que postar em cada rede, na ordem do dia. <a href="../">Outros dias</a></p>' + avs + '</div><script>' + COPY + '</script></body></html>\n';
}
function indice(dias) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Pauta da Fonte de Mana</title><style>' + CSS + '</style></head><body><div class="wrap"><h1>Pauta da Fonte de Mana</h1><p class="sub">Calendário com alarmes: <a href="' + WEBCAL + '">assinar no iPhone</a>. Se o link não abrir, vá em Ajustes, Calendário, Contas, Adicionar Conta, Outra, Adicionar Calendário Assinado e cole <b>' + SITE.replace(/^https:\/\//, '') + '/pauta/' + CALENDARIO + '</b>, com Remover Alarmes desligado e Obter Novos Dados a cada 15 minutos.</p>' +
    dias.slice().reverse().map(d => '<section class="av"><a href="' + d + '/">Pauta de ' + d.split('-').reverse().join('/') + '</a></section>').join('') + '</div></body></html>\n';
}

/* ---------- principal ---------- */
const p = read(DATA);
const E = validate(p);
if (E.length) { console.log('ERROS:\n' + E.map(e => '  ' + e).join('\n')); process.exit(1); }
fs.writeFileSync(path.join(PDIR, DATA, 'index.html'), pagina(p));
const hoje = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
const limite = new Date(Date.parse(hoje) - 3 * 864e5).toISOString().slice(0, 10);
const dias = fs.readdirSync(PDIR).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && fs.existsSync(path.join(PDIR, d, 'pauta.json'))).sort();
const recentes = dias.filter(d => d >= limite);
fs.writeFileSync(path.join(PDIR, CALENDARIO), calendario(recentes));
fs.writeFileSync(path.join(PDIR, 'index.html'), indice(dias));
console.log('OK, pauta de ' + DATA + ' com ' + p.avisos.length + ' avisos. Página: pauta/' + DATA + '/index.html. Calendário: pauta/' + CALENDARIO + ' (' + recentes.length + ' dias).');
