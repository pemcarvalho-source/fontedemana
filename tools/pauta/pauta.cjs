#!/usr/bin/env node
/* Pauta de postagem da Fonte de Mana: calendário com alarmes e página de consulta.
   Uso: node tools/pauta/pauta.cjs <raiz do repositório> <AAAA-MM-DD>
   Lê pauta/<data>/pauta.json (formato em tools/pauta/LEIA.md), confere e gera:
     pauta/<data>/index.html   página do dia, com miniaturas, botão de salvar as fotos e vídeos no Fotos e botão de copiar cada texto
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
    /* aviso a aviso: só cobra o real nos avisos que já convertem algum valor. O fx da pauta pode vir do original da noite
       enquanto a edição do dia saiu sem cotação (só dólar, como manda tools/REGRAS.md); aí os avisos do kit ficam em dólar */
    (p.avisos || []).forEach(a => {
      const semFala = JSON.stringify(a, (k, v) => ['url', 'fala', 'fx'].includes(k) ? undefined : v);
      if (!/\(R\$ ?\d/.test(semFala)) return;
      const re = /US\$ ?\d+(?:[.,]\d+)*/g; let m;
      while ((m = re.exec(semFala))) if (!/^ ?\(R\$ ?\d/.test(semFala.slice(re.lastIndex, re.lastIndex + 8))) E.push(`${a.id}: valor em dólar sem o real entre parênteses: ${m[0]}`);
    });
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
ol{margin:0;padding-left:20px}.fx{font-size:13px;font-style:italic;color:var(--muted)}
.md{display:flex;flex-direction:column;gap:8px}.th{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:6px}
.th img{width:100%;display:block;border-radius:6px;border:1px solid var(--line);-webkit-touch-callout:default}
.th video{grid-column:1/-1;width:100%;max-height:420px;border-radius:8px;background:#000}
button.sv{font-size:16px;padding:10px 18px}button:disabled{opacity:.6}
.st,.dc{font:14px/1.4 system-ui,sans-serif;color:var(--muted)}.st:empty{display:none}
details summary{font:14px system-ui,sans-serif;color:var(--muted)}
.bar{display:none;background:var(--panel);border:1px solid var(--gold);border-radius:10px;padding:10px 12px;font:15px/1.4 system-ui,sans-serif}`;
/* Script da página. Salvar: baixa os arquivos (as fotos já ao abrir a página) e abre o menu de compartilhar do celular,
   que no iPhone tem "Salvar N imagens" e manda tudo direto para o Fotos. Copiar: tenta o jeito antigo (execCommand), que
   funciona em mais navegadores embutidos, depois a API nova; se as duas falharem, deixa o texto marcado. */
const SCRIPT = `(function(){
var ua=navigator.userAgent,ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
var bar=document.getElementById('bar');
if(ios&&!/Safari\\//.test(ua)&&/^https:/.test(location.href)&&bar){bar.querySelector('a').href='x-safari-'+location.href;bar.style.display='block';}
function txt(id){var e=document.getElementById(id);return e?e.innerText:'';}
function copiar(t){var ok=false;try{var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,t.length);ok=document.execCommand('copy');document.body.removeChild(ta);}catch(e){}
if(ok)return Promise.resolve();if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);return Promise.reject(new Error('sem copia'));}
function marcar(id){try{var r=document.createRange();r.selectNodeContents(document.getElementById(id));var s=getSelection();s.removeAllRanges();s.addRange(r);}catch(e){}}
function aviso(b,t){if(!b.getAttribute('data-l'))b.setAttribute('data-l',b.textContent);b.textContent=t;clearTimeout(b._t);b._t=setTimeout(function(){b.textContent=b.getAttribute('data-l');},2500);}
document.querySelectorAll('button[data-c]').forEach(function(b){b.addEventListener('click',function(){var id=b.getAttribute('data-c');copiar(txt(id)).then(function(){aviso(b,'Copiado');},function(){marcar(id);aviso(b,'Texto marcado: toque em Copiar');});});});
var pronto={},indo={};
function tipo(n){return /\\.mp4$/i.test(n)?'video/mp4':/\\.png$/i.test(n)?'image/png':'image/jpeg';}
function baixar(u){if(!indo[u])indo[u]=fetch(u).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.blob();}).then(function(bl){var n=u.split('/').pop().split('?')[0];var f=new File([bl],n,{type:bl.type||tipo(n)});pronto[u]=f;return f;});return indo[u];}
function salvarArquivos(fs,st,depois){
if(navigator.canShare&&navigator.canShare({files:fs})){navigator.share({files:fs}).then(function(){st.textContent='Feito.';},function(e){
if(e&&e.name==='AbortError'){st.textContent='';}else if(e&&e.name==='NotAllowedError'&&depois){st.textContent='Arquivos prontos: toque no botão de novo.';}else{st.textContent='O menu de compartilhar não abriu aqui. Segure o dedo numa foto e escolha Salvar no Fotos, ou abra a pauta no Safari.';}});return;}
if(ios){st.textContent='Este navegador não salva direto no Fotos. Segure o dedo numa foto e escolha Salvar no Fotos, ou abra a pauta no Safari.';return;}
fs.forEach(function(f,i){setTimeout(function(){var a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();a.remove();},i*400);});st.textContent='Arquivos baixados.';}
document.querySelectorAll('.md').forEach(function(box){var urls=JSON.parse(box.getAttribute('data-f'));
urls.forEach(function(u){if(!/\\.mp4$/i.test(u))baixar(u).catch(function(){});});
var b=box.querySelector('button.sv'),st=box.querySelector('.st'),cap=box.getAttribute('data-cap');
b.addEventListener('click',function(){
if(cap)copiar(txt(cap)).catch(function(){});
var fs=urls.map(function(u){return pronto[u];});
if(fs.every(Boolean)){salvarArquivos(fs,st,false);return;}
b.disabled=true;st.textContent=urls.some(function(u){return /\\.mp4$/i.test(u);})?'Preparando o vídeo, pode levar alguns segundos...':'Preparando as fotos...';
Promise.all(urls.map(baixar)).then(function(fs){b.disabled=false;salvarArquivos(fs,st,true);},function(){b.disabled=false;st.textContent='Não consegui baixar. Use os links dos arquivos abaixo.';});});});
})();`;
/* tamanho do arquivo, quando ele está no próprio repositório (links do site) */
function tamanho(u) {
  if (!u.startsWith(SITE + '/')) return '';
  try { const b = fs.statSync(path.join(ROOT, decodeURIComponent(u.slice(SITE.length + 1)))).size; return b >= 1e6 ? ' (' + (b / 1e6).toFixed(0) + ' MB)' : ''; } catch (e) { return ''; }
}
function midia(a, k, cap) {
  const fsx = a.arquivos || [];
  if (!fsx.length) return '';
  const video = f => /\.mp4($|\?)/i.test(f.url);
  const nf = fsx.filter(f => !video(f)).length, nv = fsx.length - nf;
  const th = fsx.map(f => video(f) ? '<video src="' + esc(f.url) + '" controls playsinline preload="metadata"></video>' : '<img src="' + esc(f.url) + '" alt="' + esc(f.nome) + '" loading="lazy">').join('');
  const oque = nv ? (nv === 1 ? (nf ? 'o vídeo e as fotos' : 'o vídeo') : 'os ' + nv + ' vídeos') : (nf === 1 ? 'a foto' : 'as ' + nf + ' fotos');
  const lbl = 'Salvar ' + oque + ' no Fotos' + (cap ? ' e copiar a legenda' : '');
  const dica = 'No menu que abrir, toque em Salvar' + (nv ? '' : ' ' + (nf === 1 ? 'imagem' : nf + ' imagens')) + ', ou mande direto para o app da rede.' + (cap ? ' A legenda já fica copiada, é só colar.' : '');
  const links = '<details><summary>Links dos arquivos</summary><ul class="files">' + fsx.map(f => '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.nome) + tamanho(f.url) + '</a></li>').join('') + '</ul></details>';
  return '<div class="md" id="m' + k + '" data-f="' + esc(JSON.stringify(fsx.map(f => f.url))) + '"' + (cap ? ' data-cap="' + cap + '"' : '') + '><div class="th">' + th + '</div><button class="sv" type="button">' + esc(lbl) + '</button><p class="st" aria-live="polite"></p><p class="dc">' + esc(dica) + '</p>' + links + '</div>';
}
function pagina(p) {
  let k = 0;
  const avs = p.avisos.slice().sort((a, b) => ((a.dia || p.data) + a.hora).localeCompare((b.dia || p.data) + b.hora)).map(a => {
    const dia = a.dia && a.dia !== p.data ? ' (' + a.dia.split('-').reverse().slice(0, 2).join('/') + ')' : '';
    const k0 = k;
    const tx = (a.textos || []).map(t => { k++; return '<div class="tx"><b>' + esc(t.rotulo) + '</b><pre id="t' + k + '">' + esc(t.texto) + '</pre><button type="button" data-c="t' + k + '">Copiar</button></div>'; }).join('');
    const files = midia(a, ++k, a.textos && a.textos.length ? 't' + (k0 + 1) : '');
    const ro = a.roteiro && a.roteiro.length ? '<div class="ro"><b>Roteiro de gravação</b>' + a.roteiro.map(r => { k++; return '<div><b>' + esc(r.cena) + '</b><p>Na tela: ' + esc(r.tela) + '</p>' + (r.como ? '<p>Como gravar: ' + esc(r.como) + '</p>' : '') + '<pre id="t' + k + '">' + esc(r.fala) + '</pre><button data-c="t' + k + '">Copiar fala</button></div>'; }).join('') + '</div>' : '';
    const ps = a.passos && a.passos.length ? '<ol>' + a.passos.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>' : '';
    const fx = p.fx && /\(R\$/.test(JSON.stringify(a)) ? '<p class="fx">' + esc(p.fx) + '</p>' : '';
    return '<section class="av" id="' + esc(a.id) + '"><div class="hd"><span class="hr">' + esc(a.hora) + dia + '</span><span class="rd">' + esc(a.rede) + '</span><h2>' + esc(a.titulo) + '</h2></div><p>' + esc(a.oQue) + '</p>' + files + tx + ro + ps + fx + '</section>';
  }).join('');
  const lbl = p.data.split('-').reverse().join('/');
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Pauta ' + lbl + '</title><style>' + CSS + '</style></head><body><div class="wrap"><h1>Pauta de ' + lbl + '</h1><p class="sub">O que postar em cada rede, na ordem do dia. <a href="../">Outros dias</a></p><p class="bar" id="bar">Os botões de salvar e copiar funcionam melhor no Safari. <a href="#">Abrir esta pauta no Safari</a></p>' + avs + '</div><script>' + SCRIPT + '</script></body></html>\n';
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
