/* Desenho dos personagens da Treta das Cores (roda no navegador). desenha(nome, t, m, humor) devolve o SVG do quadro:
   t = segundos desde o começo da cena, m = abertura da boca (0 a 1), humor = jeito do personagem na cena.
   Personagens originais, no estilo de arte de fantasia do Magic, sem copiar nenhum personagem da Wizards. */
(function () {
  const f = n => (Math.round(n * 10) / 10).toString();
  const piscar = (t, off) => { const p = (t + off) % 3.6; return p < 0.07 ? p / 0.07 : p < 0.15 ? 1 - (p - 0.07) / 0.08 : 0; };
  const ruido = (t, k) => Math.sin(t * 1.7 + k * 3.1) * 0.5 + Math.sin(t * 2.9 + k * 1.3) * 0.3 + Math.sin(t * 5.3 + k * 0.7) * 0.2;

  function boca(cx, cy, m, smirk, labio, dentro, w0) {
    w0 = w0 || 62;
    const w = w0 - 12 * m, h = 2 + 40 * m;
    const lx = cx - w / 2, rx = cx + w / 2, ry = cy - smirk;
    const topo = cy - 6 - h * 0.28, base = cy + 7 + h * 0.72;
    let s = `<path d="M${f(lx)} ${f(cy)} Q${f(cx - w * 0.28)} ${f(topo - 4)} ${f(cx)} ${f(topo + 2)} Q${f(cx + w * 0.28)} ${f(topo - 4)} ${f(rx)} ${f(ry)} Q${f(cx + w * 0.1)} ${f(base + 6)} ${f(lx)} ${f(cy)}Z" fill="${labio}"/>`;
    if (h > 6) {
      const it = cy - h * 0.22, ib = cy + h * 0.6;
      const d = `M${f(lx + 6)} ${f(cy)} Q${f(cx)} ${f(it - 3)} ${f(rx - 6)} ${f(ry)} Q${f(cx)} ${f(ib)} ${f(lx + 6)} ${f(cy)}Z`;
      s += `<path d="${d}" fill="${dentro}"/><clipPath id="mc"><path d="${d}"/></clipPath><g clip-path="url(#mc)"><rect x="${f(lx)}" y="${f(it - 14)}" width="${f(w)}" height="${f(Math.min(13, h * 0.32) + 12)}" fill="#ece6d8"/><ellipse cx="${f(cx)}" cy="${f(ib)}" rx="${f(w * 0.3)}" ry="${f(h * 0.28)}" fill="#a2464c"/></g>`;
    } else {
      s += `<path d="M${f(lx + 4)} ${f(cy)} Q${f(cx)} ${f(cy + 3)} ${f(rx - 4)} ${f(ry)}" stroke="${dentro}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    }
    return s;
  }

  /* ---------- O Preto: necromante de capuz num cemitério de noite ---------- */
  function preto(t, m, humor) {
    const imp = humor === 'impaciente';
    const resp = Math.sin(t * 2.1) * 4;
    const rot = Math.sin(t * 1.25) * 1.3 + m * 1.2 + (imp ? Math.sin(t * 9) * 1.1 * m : 0);
    const fecha = piscar(t, 0.9);
    const estreita = imp ? 0.25 : 0.38;
    const sob = imp ? 0 : 1;
    const fog = (t * 22) % 1400;
    const chama = 1 + (imp ? 0.35 : 0) + ruido(t * 3, 1) * 0.12 + m * 0.15;
    let s = `<defs>
<linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07100e"/><stop offset=".42" stop-color="#12302a"/><stop offset=".68" stop-color="#1e4b40"/><stop offset="1" stop-color="#0a1412"/></linearGradient>
<radialGradient id="luaG"><stop offset="0" stop-color="#d9f6e6" stop-opacity=".55"/><stop offset=".45" stop-color="#9fd8bf" stop-opacity=".18"/><stop offset="1" stop-color="#9fd8bf" stop-opacity="0"/></radialGradient>
<radialGradient id="lua" cx=".42" cy=".4"><stop offset="0" stop-color="#f4faf0"/><stop offset="1" stop-color="#b3d3c1"/></radialGradient>
<linearGradient id="manto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#27252d"/><stop offset="1" stop-color="#0b0a0e"/></linearGradient>
<linearGradient id="sombraC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
<linearGradient id="capuz" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c2a33"/><stop offset=".6" stop-color="#16151b"/><stop offset="1" stop-color="#0b0a0e"/></linearGradient>
<radialGradient id="pele" cx=".46" cy=".38" r=".7"><stop offset="0" stop-color="#d3dacb"/><stop offset=".7" stop-color="#a7b2a2"/><stop offset="1" stop-color="#7f8b7c"/></radialGradient>
<radialGradient id="osso" cx=".4" cy=".35"><stop offset="0" stop-color="#f1ead6"/><stop offset="1" stop-color="#b9ae92"/></radialGradient>
<radialGradient id="fogo" cx=".5" cy=".7"><stop offset="0" stop-color="#f2ffe8"/><stop offset=".35" stop-color="#8dffbe"/><stop offset="1" stop-color="#1fbf7a" stop-opacity="0"/></radialGradient>
<radialGradient id="vinheta" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
<filter id="b30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="b8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="brilho" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1080" height="1920" fill="url(#ceu)"/>
<circle cx="865" cy="905" r="290" fill="url(#luaG)"/>
<circle cx="865" cy="905" r="96" fill="url(#lua)"/>
<circle cx="835" cy="880" r="18" fill="#a9c9b6" opacity=".35"/><circle cx="890" cy="935" r="11" fill="#a9c9b6" opacity=".3"/>
<path d="M0 1270 Q180 1190 380 1250 T760 1225 T1080 1195 V1920 H0Z" fill="#0d1d1b"/>
<path d="M40 1330 V1170 L150 1105 L260 1170 V1330Z M118 1330 V1235 Q150 1205 182 1235 V1330Z" fill="#091412" fill-rule="evenodd"/>
<rect x="140" y="1072" width="20" height="40" fill="#091412"/>
<g stroke="#07100f" stroke-linecap="round" fill="none"><path d="M1010 1560 Q985 1330 1000 1120" stroke-width="30"/><path d="M997 1250 Q930 1180 905 1090" stroke-width="13"/><path d="M1002 1170 Q1050 1100 1040 1020" stroke-width="11"/><path d="M915 1110 Q880 1080 870 1040" stroke-width="6"/><path d="M1000 1120 Q985 1060 1010 1000" stroke-width="8"/></g>
<g fill="#132724" stroke="#2c4c45" stroke-width="3">
<path d="M70 1560 V1440 Q70 1385 125 1385 Q180 1385 180 1440 V1560Z"/><path d="M215 1560 V1475 Q215 1440 250 1440 Q285 1440 285 1475 V1560Z"/>
<path d="M840 1590 V1450 Q840 1390 900 1390 Q960 1390 960 1450 V1590Z"/><path d="M985 1590 V1490 Q985 1455 1020 1455 Q1055 1455 1055 1490 V1590Z"/></g>
<g filter="url(#b30)" fill="#9adfc6"><ellipse cx="${f(fog - 300)}" cy="1500" rx="420" ry="55" opacity=".16"/><ellipse cx="${f(fog + 400)}" cy="1470" rx="380" ry="50" opacity=".13"/><ellipse cx="${f(fog - 1000)}" cy="1480" rx="420" ry="55" opacity=".14"/></g>`;
    /* luzes de espírito subindo devagar */
    for (let k = 0; k < 9; k++) {
      const x = [120, 230, 330, 760, 880, 990, 60, 640, 470][k] + Math.sin(t * 0.9 + k) * 14;
      const y = 1560 - ((t * 26 + k * 83) % 620);
      const a = Math.max(0, Math.min(1, (1560 - y) / 120)) * Math.max(0, Math.min(1, (y - 940) / 140));
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${k % 3 === 0 ? 7 : 5}" fill="#a8ffd0" opacity="${f(a * 0.85)}" filter="url(#brilho)"/>`;
    }
    /* cajado com crânio chifrudo e chama verde */
    s += `<g transform="translate(540 1920) scale(1.12) translate(-540 -1920)"><g transform="translate(0 ${f(resp * 0.5)})">
<rect x="810" y="1010" width="24" height="910" rx="10" fill="#2a2018"/><path d="M816 1060 V1900 M826 1100 V1880" stroke="#1a130e" stroke-width="3"/>
<g filter="url(#brilho)"><ellipse cx="822" cy="${f(965 - 40 * chama)}" rx="${f(34 * chama)}" ry="${f(70 * chama)}" fill="url(#fogo)" opacity=".95"/></g>
<path d="M786 990 Q760 940 778 900 Q790 935 800 952Z M858 990 Q884 940 866 900 Q854 935 844 952Z" fill="#d8ceb4"/>
<path d="M786 985 Q786 945 822 940 Q858 945 858 985 Q858 1010 845 1018 L842 1035 H802 L799 1018 Q786 1010 786 985Z" fill="url(#osso)"/>
<ellipse cx="808" cy="985" rx="9" ry="10" fill="#0c1a14"/><ellipse cx="836" cy="985" rx="9" ry="10" fill="#0c1a14"/>
<circle cx="808" cy="986" r="3.5" fill="#9dffc8" filter="url(#brilho)"/><circle cx="836" cy="986" r="3.5" fill="#9dffc8" filter="url(#brilho)"/>
<path d="M816 1004 L822 996 L828 1004Z" fill="#3a2f22"/><path d="M806 1022 H838" stroke="#6e6450" stroke-width="3"/></g>`;
    /* corpo */
    s += `<g transform="translate(0 ${f(resp)})">
<path d="M320 1420 Q290 1120 400 975 Q540 860 680 975 Q790 1120 760 1420Z" fill="#121116"/>
<path d="M235 1920 L285 1470 Q310 1375 430 1345 L650 1345 Q770 1375 795 1470 L845 1920Z" fill="url(#manto)"/>
<path d="M470 1345 L540 1540 L610 1345Z" fill="#163a29"/>
<path d="M430 1345 L540 1610 L650 1345" stroke="#2f7a4d" stroke-width="7" fill="none"/>
<path d="M440 1345 L540 1590 L640 1345" stroke="#c9bfa4" stroke-width="2" stroke-dasharray="3 9" fill="none" opacity=".7"/>
<path d="M300 1600 Q540 1650 780 1600" stroke="#0a090c" stroke-width="18" fill="none" opacity=".6"/>
<path d="M680 975 Q792 1120 762 1420" stroke="#8fd6bb" stroke-width="5" fill="none" opacity=".45"/>
<rect x="508" y="1225" width="64" height="110" fill="#8e9a8b"/><path d="M508 1280 Q540 1310 572 1280 V1335 H508Z" fill="#6f7b6d"/>
<path d="M440 1355 Q446 1282 492 1262 L512 1300 Q540 1318 568 1300 L588 1262 Q634 1282 640 1355Z" fill="#1c1b22"/><path d="M440 1355 Q446 1282 492 1262 M588 1262 Q634 1282 640 1355" stroke="#2f7a4d" stroke-width="6" fill="none"/>
<g fill="#e6dcc2" stroke="#8d8268" stroke-width="2">${[0, 1, 2, 3, 4, 5, 6].map(k => { const a = -0.9 + k * 0.3; return `<circle cx="${f(540 + Math.sin(a) * 95)}" cy="${f(1350 + Math.cos(a) * 60)}" r="9"/>`; }).join('')}</g>
<path d="M540 1418 Q556 1440 540 1470 Q524 1440 540 1418Z" fill="#7dffb0" filter="url(#brilho)"/>
<g transform="translate(330 1430)">
<path d="M-118 95 Q-125 -20 -10 -58 Q80 -80 118 -30 L100 30 Q10 20 -60 110Z" fill="#1f1d25" stroke="#2f7a4d" stroke-width="6"/><path d="M-100 60 Q-60 -10 40 -30" stroke="#3a3842" stroke-width="5" fill="none"/>
<path d="M-62 -48 L-80 -118 L-40 -60Z M-12 -62 L-14 -140 L14 -64Z M38 -52 L66 -114 L56 -42Z" fill="#ddd2b6"/>
<path d="M-48 -10 Q-48 -52 -6 -55 Q36 -52 36 -10 Q36 12 22 20 L20 36 H-32 L-34 20 Q-48 12 -48 -10Z" fill="url(#osso)"/>
<ellipse cx="-22" cy="-14" rx="11" ry="13" fill="#0c1a14"/><ellipse cx="12" cy="-14" rx="11" ry="13" fill="#0c1a14"/><path d="M-10 6 L-5 -3 L0 6Z" fill="#3a2f22"/></g>
<path d="M690 1400 Q790 1440 845 1545 L792 1590 Q735 1505 670 1470Z" fill="#1a1920"/><path d="M845 1545 L792 1590" stroke="#2f7a4d" stroke-width="7"/>
<path d="M800 1520 Q790 1505 805 1498 L850 1500 Q862 1503 860 1520 L858 1585 Q855 1600 840 1598 L805 1592 Q792 1588 796 1572Z" fill="url(#pele)"/>
<g fill="url(#pele)" stroke="#6b7769" stroke-width="2.5">${[1512, 1536, 1560, 1584].map(y => `<rect x="796" y="${y}" width="60" height="24" rx="12"/>`).join('')}</g>`;
    /* cabeça */
    const sobL = imp ? 8 : 0, sobR = imp ? 8 : -14 * sob;
    s += `<g transform="rotate(${f(rot)} 540 1250)">
<path d="M375 1185 Q362 925 540 885 Q718 925 705 1185 Q696 1262 655 1305 L645 1245 Q668 1120 646 1020 Q605 945 540 940 Q475 945 434 1020 Q412 1120 435 1245 L425 1305 Q384 1262 375 1185Z" fill="url(#capuz)"/>
<path d="M432 1245 Q410 1120 434 1020 Q475 945 540 940 Q605 945 646 1020 Q668 1120 648 1245" stroke="#2f7a4d" stroke-width="6" fill="none"/>
<path d="M430 1062 Q430 965 540 955 Q650 965 650 1062 Q650 1162 602 1222 Q572 1257 540 1260 Q508 1257 478 1222 Q430 1162 430 1062Z" fill="url(#pele)"/>
<path d="M434 1056 Q436 972 540 958 Q644 972 646 1056 Q622 1002 578 997 L540 1036 L502 997 Q458 1002 434 1056Z" fill="#141217"/>
<clipPath id="rosto"><path d="M430 1062 Q430 965 540 955 Q650 965 650 1062 Q650 1162 602 1222 Q572 1257 540 1260 Q508 1257 478 1222 Q430 1162 430 1062Z"/></clipPath>
<rect x="420" y="950" width="240" height="140" fill="url(#sombraC)" clip-path="url(#rosto)"/>
<g filter="url(#b8)" fill="#5f6b5c" opacity=".3"><ellipse cx="468" cy="1150" rx="16" ry="34"/><ellipse cx="612" cy="1150" rx="16" ry="34"/></g>
<ellipse cx="492" cy="1082" rx="38" ry="24" fill="#5f6b5d" opacity=".45"/><ellipse cx="588" cy="1082" rx="38" ry="24" fill="#5f6b5d" opacity=".45"/>`;
    for (const [cx, k] of [[492, 0], [588, 1]]) {
      const hh = 13 * (1 - fecha) * (1 - estreita * 0.6);
      const d = `M${cx - 27} 1084 Q${cx} ${f(1084 - hh * 1.7)} ${cx + 27} 1081 Q${cx} ${f(1084 + hh * 1.15)} ${cx - 27} 1084Z`;
      s += `<path d="${d}" fill="#0f1d17"/>`;
      if (hh > 2) s += `<clipPath id="o${k}"><path d="${d}"/></clipPath><g clip-path="url(#o${k})"><circle cx="${cx + 2}" cy="1082" r="10" fill="#8dffbe" filter="url(#brilho)"/><circle cx="${cx + 2}" cy="1082" r="4" fill="#0b2a1b"/></g>`;
      s += `<path d="M${cx - 30} 1085 Q${cx} ${f(1084 - hh * 1.75 - 3)} ${cx + 30} 1080" stroke="#0d0c10" stroke-width="5.5" fill="none" stroke-linecap="round"/>`;
    }
    s += `<path d="M458 ${f(1052 + sobL)} Q485 ${f(1030 + sobL * 0.3)} 522 ${f(1046 + sobL * 1.4)}" stroke="#121014" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M558 ${f(1046 + sobR * 0.6 + (imp ? 6 : 0))} Q595 ${f(1030 + sobR)} 622 ${f(1050 + sobR * 0.4)}" stroke="#121014" stroke-width="10" fill="none" stroke-linecap="round"/>
<path d="M541 1090 L531 1142 Q540 1151 553 1143" stroke="#5c685a" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M500 1170 Q520 1158 540 1163 Q560 1158 582 1168 Q560 1166 540 1170 Q520 1166 500 1170Z" fill="#17151a"/>`;
    s += boca(541, 1183 + m * 2, m, imp ? 0 : 7, '#6f6170', '#1a0d12', 60);
    s += `<path d="M524 ${f(1220 + m * 14)} Q540 ${f(1214 + m * 14)} 556 ${f(1220 + m * 14)} Q552 ${f(1250 + m * 12)} 540 ${f(1290 + m * 10)} Q528 ${f(1250 + m * 12)} 524 ${f(1220 + m * 14)}Z" fill="#17151a"/>
</g></g></g>
<g filter="url(#b30)" fill="#a8e6d0"><ellipse cx="${f((fog * 1.4) % 1600 - 300)}" cy="1840" rx="460" ry="70" opacity=".2"/><ellipse cx="${f((fog * 1.4 + 800) % 1600 - 300)}" cy="1870" rx="420" ry="60" opacity=".18"/></g>
<rect width="1080" height="1920" fill="url(#vinheta)"/>`;
    return s;
  }

  /* ---------- O Branco: clériga juíza num salão de mármore com vitral ---------- */
  function branco(t, m, humor) {
    const resp = Math.sin(t * 2) * 4;
    const rot = Math.sin(t * 1.1) * 1.1 + m * 1;
    const fecha = piscar(t, 0.4);
    const dedo = Math.sin(t * 7.5) * 13 * (0.35 + m * 0.65);
    const raio = 0.1 + Math.sin(t * 1.4) * 0.03;
    let s = `<defs>
<linearGradient id="parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dcbc"/><stop offset=".55" stop-color="#d2bd8c"/><stop offset="1" stop-color="#8f7643"/></linearGradient>
<radialGradient id="vitral" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fffdf6"/><stop offset=".5" stop-color="#fbefc9"/><stop offset="1" stop-color="#e7cf8c"/></radialGradient>
<linearGradient id="coluna" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfae84"/><stop offset=".45" stop-color="#f6efdc"/><stop offset="1" stop-color="#b4a275"/></linearGradient>
<linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e7b0"/><stop offset=".5" stop-color="#c8a345"/><stop offset="1" stop-color="#7d5f1f"/></linearGradient>
<radialGradient id="placa" cx=".4" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece5d2"/><stop offset="1" stop-color="#c9bea2"/></radialGradient>
<linearGradient id="tunica" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfbf4"/><stop offset="1" stop-color="#d8cfb9"/></linearGradient>
<radialGradient id="peleW" cx=".45" cy=".38" r=".72"><stop offset="0" stop-color="#b57a54"/><stop offset=".75" stop-color="#93593a"/><stop offset="1" stop-color="#6f3f27"/></radialGradient>
<linearGradient id="cabelo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f2ec"/><stop offset="1" stop-color="#c9c4b8"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="#fffbe9" stop-opacity=".95"/><stop offset=".5" stop-color="#fff2c4" stop-opacity=".35"/><stop offset="1" stop-color="#fff2c4" stop-opacity="0"/></radialGradient>
<radialGradient id="vinheta" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#2a1d08" stop-opacity="0"/><stop offset="1" stop-color="#1a1206" stop-opacity=".65"/></radialGradient>
<filter id="b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20"/></filter>
<filter id="brilhoW" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1080" height="1920" fill="url(#parede)"/>
<g opacity=".25" stroke="#a48d5a" stroke-width="3">${[700, 860, 1020, 1180, 1340, 1500].map(y => `<path d="M0 ${y} H1080"/>`).join('')}</g>
<path d="M320 1520 V840 Q320 610 540 560 Q760 610 760 840 V1520Z" fill="url(#vitral)" stroke="#a88b4e" stroke-width="20"/>
<g stroke="#b99a5a" stroke-width="7" fill="none"><path d="M540 600 V1520 M330 1040 H750 M330 1300 H750"/><path d="M330 840 Q430 760 540 790 Q650 760 750 840"/></g>
<g transform="translate(540 735)"><circle r="58" fill="#f3d27a" stroke="#b99a5a" stroke-width="6"/>${Array.from({ length: 12 }, (x, k) => `<path d="M0 -70 L8 -100 L-8 -100Z" fill="#e6be5c" transform="rotate(${k * 30})"/>`).join('')}</g>
<g fill="#fffbea" opacity="${f(raio)}">${[[-260, 300], [-120, 340], [40, 360], [190, 320]].map(([a, w]) => `<path d="M${540 + a / 3} 600 L${540 + a - w / 2} 1920 L${540 + a + w / 2} 1920Z"/>`).join('')}</g>
<g><rect x="30" y="560" width="170" height="1100" fill="url(#coluna)"/><rect x="10" y="520" width="210" height="60" fill="#e9dfc5" stroke="#a48d5a" stroke-width="4"/>
<path d="M65 590 V1650 M100 590 V1650 M135 590 V1650 M170 590 V1650" stroke="#a8966a" stroke-width="4" opacity=".6"/>
<rect x="880" y="560" width="170" height="1100" fill="url(#coluna)"/><rect x="860" y="520" width="210" height="60" fill="#e9dfc5" stroke="#a48d5a" stroke-width="4"/>
<path d="M915 590 V1650 M950 590 V1650 M985 590 V1650 M1020 590 V1650" stroke="#a8966a" stroke-width="4" opacity=".6"/></g>
<circle cx="540" cy="1080" r="300" fill="url(#halo)"/>`;
    for (let k = 0; k < 14; k++) {
      const x = (k * 77 + Math.sin(t * 0.6 + k) * 30 + t * 8) % 1080;
      const y = 700 + ((k * 131 + t * (12 + k % 4 * 4)) % 1100);
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${2 + k % 3}" fill="#fff4cf" opacity=".7" filter="url(#brilhoW)"/>`;
    }
    s += `<g transform="translate(540 1920) scale(1.12) translate(-540 -1920)"><g transform="translate(0 ${f(resp)})">
<path d="M225 1920 L270 1480 Q300 1385 425 1352 L655 1352 Q780 1385 810 1480 L855 1920Z" fill="url(#tunica)"/>
<path d="M452 1380 H628 V1920 H452Z" fill="#fffdf6" stroke="url(#ouro)" stroke-width="10"/>
<g transform="translate(540 1478)"><circle r="34" fill="url(#ouro)"/>${Array.from({ length: 12 }, (x, k) => `<path d="M0 -40 L6 -58 L-6 -58Z" fill="#c8a345" transform="rotate(${k * 30})"/>`).join('')}<circle r="16" fill="#fff6d6"/></g>
<rect x="500" y="1225" width="80" height="130" fill="#8a5235"/><path d="M500 1300 Q540 1330 580 1300 V1355 H500Z" fill="#6c3c25"/>
<path d="M470 1330 Q540 1372 610 1330 L622 1372 Q540 1410 458 1372Z" fill="url(#ouro)"/>
${[325, 755].map(x => `<g transform="translate(${x} 1430)"><ellipse rx="128" ry="84" fill="url(#ouro)"/><ellipse cy="-8" rx="110" ry="66" fill="url(#placa)"/><ellipse cx="-30" cy="-34" rx="44" ry="16" fill="#fff" opacity=".7"/><path d="M-110 10 Q0 50 110 10" stroke="#b08a35" stroke-width="5" fill="none"/><circle cy="40" r="8" fill="#e8cf86"/></g>`).join('')}
<g transform="rotate(-4 540 1690)">
<path d="M330 1620 L540 1650 L750 1620 L760 1790 L540 1815 L320 1790Z" fill="#8a6a22"/>
<path d="M340 1612 L540 1640 L540 1798 L335 1772Z" fill="#fbf3dc"/><path d="M540 1640 L740 1612 L745 1772 L540 1798Z" fill="#f4e8c7"/>
<g stroke="#b3a27c" stroke-width="4" stroke-linecap="round">${[0, 1, 2, 3, 4].map(k => `<path d="M${370} ${1650 + k * 26} L${510} ${1668 + k * 26}"/><path d="M${570} ${1668 + k * 26} L${712} ${1650 + k * 26}"/>`).join('')}</g>
<circle cx="440" cy="1708" r="16" fill="none" stroke="#c8a345" stroke-width="4"/>
<path d="M540 1640 V1798" stroke="#c9b892" stroke-width="4"/></g>
<path d="M300 1500 Q250 1640 330 1760 L380 1740 Q330 1650 360 1530Z" fill="#efe8d6"/>
<path d="M330 1745 Q318 1790 350 1800 L395 1795 Q410 1780 398 1752 L360 1740Z" fill="url(#peleW)"/>
<path d="M730 1470 Q862 1462 884 1338 L810 1312 Q798 1392 722 1405Z" fill="url(#tunica)"/><path d="M884 1338 L810 1312" stroke="url(#ouro)" stroke-width="14" stroke-linecap="round"/>
<g transform="rotate(${f(dedo)} 840 1300)">
<path d="M812 1300 Q808 1262 830 1255 L858 1258 Q872 1268 866 1300 Q850 1316 830 1314Z" fill="url(#peleW)"/>
<path d="M834 1258 Q830 1200 842 1182 Q856 1186 854 1210 L852 1260Z" fill="url(#peleW)"/>
<path d="M814 1272 Q806 1262 816 1256 M818 1290 H850" stroke="#5e3320" stroke-width="3" fill="none"/></g>`;
    s += `<g transform="rotate(${f(rot)} 540 1250)">
<circle cx="540" cy="918" r="52" fill="url(#cabelo)"/><path d="M500 912 Q540 880 580 912" stroke="#bdb7aa" stroke-width="4" fill="none"/>
<path d="M484 900 L604 930" stroke="url(#ouro)" stroke-width="9" stroke-linecap="round"/><circle cx="604" cy="930" r="9" fill="#c8a345"/>
<ellipse cx="540" cy="1060" rx="132" ry="142" fill="url(#cabelo)"/><path d="M420 1110 Q430 1180 452 1196 M660 1110 Q650 1180 628 1196" stroke="#c9c4b8" stroke-width="3" fill="none"/>
<ellipse cx="438" cy="1105" rx="16" ry="26" fill="#8a5235"/><ellipse cx="642" cy="1105" rx="16" ry="26" fill="#8a5235"/>
<circle cx="437" cy="1134" r="6" fill="#c8a345"/><circle cx="643" cy="1134" r="6" fill="#c8a345"/>
<path d="M440 1070 Q440 975 540 968 Q640 975 640 1070 Q640 1170 594 1226 Q568 1252 540 1254 Q512 1252 486 1226 Q440 1170 440 1070Z" fill="url(#peleW)"/>
<path d="M434 1078 Q426 962 540 948 Q654 962 646 1078 Q634 1018 596 998 Q566 1016 532 1004 Q496 994 468 1010 Q444 1034 434 1078Z" fill="url(#cabelo)"/>
<path d="M470 1012 Q500 990 532 1004 M596 998 Q620 1012 636 1046 M455 1040 Q470 1000 520 975" stroke="#bdb7aa" stroke-width="3" fill="none"/>
<ellipse cx="478" cy="1150" rx="22" ry="12" fill="#b9664a" opacity=".35"/><ellipse cx="602" cy="1150" rx="22" ry="12" fill="#b9664a" opacity=".35"/>`;
    for (const [cx, k] of [[496, 0], [584, 1]]) {
      const hh = 12 * (1 - fecha);
      const d = `M${cx - 22} 1092 Q${cx} ${f(1092 - hh * 1.6)} ${cx + 22} 1092 Q${cx} ${f(1092 + hh * 1.1)} ${cx - 22} 1092Z`;
      s += `<path d="${d}" fill="#f6f1e6"/>`;
      if (hh > 2) s += `<clipPath id="w${k}"><path d="${d}"/></clipPath><g clip-path="url(#w${k})"><circle cx="${cx}" cy="1092" r="10" fill="#4a2a17"/><circle cx="${cx}" cy="1092" r="5" fill="#140a05"/><circle cx="${cx + 4}" cy="1088" r="2.6" fill="#fff"/></g>`;
      s += `<path d="M${cx - 25} 1093 Q${cx} ${f(1092 - hh * 1.65 - 3)} ${cx + 25} 1091" stroke="#2a160c" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    const ergue = Math.max(0, Math.sin(t * 2.3)) * 6 * m;
    s += `<path d="M466 ${f(1060 - ergue)} Q490 ${f(1050 - ergue)} 520 ${f(1066)}" stroke="#d9d4ca" stroke-width="9" fill="none" stroke-linecap="round"/>
<path d="M560 1066 Q590 1050 614 1058" stroke="#d9d4ca" stroke-width="9" fill="none" stroke-linecap="round"/>
<g stroke="#c8a345" stroke-width="4.5" fill="#ffffff" fill-opacity=".09"><circle cx="496" cy="1092" r="35"/><circle cx="584" cy="1092" r="35"/><path d="M531 1088 Q540 1080 549 1088" fill="none"/><path d="M461 1086 L440 1080 M619 1086 L640 1080" fill="none"/></g>
<path d="M478 1072 L492 1066" stroke="#fff" stroke-width="3" opacity=".6"/><path d="M566 1072 L580 1066" stroke="#fff" stroke-width="3" opacity=".6"/>
<path d="M540 1100 Q533 1132 528 1144 Q540 1154 553 1144" stroke="#5e3320" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M512 1200 Q518 1206 524 1204 M568 1200 Q562 1206 556 1204" stroke="#6c3c25" stroke-width="3" fill="none" opacity=".6"/>`;
    s += boca(540, 1190 + m * 2, m, -2, '#7a3a2c', '#2a0e0c', 54);
    s += `</g></g></g><rect width="1080" height="1920" fill="url(#vinheta)"/>`;
    return s;
  }

  /* ---------- O Vermelho: bárbaro piromante numa forja de vulcão (desde 22/11/2026) ---------- */
  function vermelho(t, m, humor) {
    const calmo = humor === 'debochado';
    const resp = Math.sin(t * 2.4) * 5;
    const rot = Math.sin(t * 1.6) * 1.4 + m * 1.6 + (calmo ? 0 : Math.sin(t * 8) * 0.9 * m);
    const fecha = piscar(t, 1.7);
    const bola = 1 + ruido(t * 2.2, 3) * 0.1 + m * 0.22;
    let s = `<defs>
<linearGradient id="forja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120605"/><stop offset=".45" stop-color="#3a0f08"/><stop offset=".75" stop-color="#7a2410"/><stop offset="1" stop-color="#1a0805"/></linearGradient>
<radialGradient id="lavaG" cx=".5" cy="1" r=".9"><stop offset="0" stop-color="#ffb347" stop-opacity=".75"/><stop offset=".4" stop-color="#ff5a1f" stop-opacity=".35"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>
<linearGradient id="lava" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset=".5" stop-color="#ff7a1f"/><stop offset="1" stop-color="#c2290f"/></linearGradient>
<linearGradient id="couro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3a22"/><stop offset="1" stop-color="#2e170d"/></linearGradient>
<linearGradient id="ferro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9b3ad"/><stop offset=".5" stop-color="#6d6762"/><stop offset="1" stop-color="#2f2b29"/></linearGradient>
<radialGradient id="peleR" cx=".45" cy=".38" r=".72"><stop offset="0" stop-color="#e3a77f"/><stop offset=".75" stop-color="#c47d56"/><stop offset="1" stop-color="#97563a"/></radialGradient>
<linearGradient id="barba" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2672a"/><stop offset=".6" stop-color="#b53a17"/><stop offset="1" stop-color="#7d2410"/></linearGradient>
<linearGradient id="juba" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9c2c12"/><stop offset=".55" stop-color="#e2672a"/><stop offset="1" stop-color="#ffc35c"/></linearGradient>
<radialGradient id="bola" cx=".45" cy=".45"><stop offset="0" stop-color="#fff6d0"/><stop offset=".3" stop-color="#ffd05a"/><stop offset=".65" stop-color="#ff6a1f"/><stop offset="1" stop-color="#ff3d0f" stop-opacity="0"/></radialGradient>
<radialGradient id="vinheta" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0d0302" stop-opacity=".7"/></radialGradient>
<filter id="b24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
<filter id="brilhoR" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<rect width="1080" height="1920" fill="url(#forja)"/>
<path d="M0 1180 L180 980 L300 1060 L420 900 L520 860 L640 905 L760 1040 L900 950 L1080 1120 V1920 H0Z" fill="#1c0906"/>
<path d="M470 880 Q520 905 560 872 Q548 960 520 1040 Q505 1120 470 1200 Q490 1100 486 1010 Q480 940 470 880Z" fill="url(#lava)" opacity=".85" filter="url(#brilhoR)"/>
<path d="M820 1000 Q850 1060 830 1140 Q815 1210 840 1290" stroke="url(#lava)" stroke-width="10" fill="none" opacity=".7" filter="url(#brilhoR)"/>
<path d="M0 1320 Q200 1260 420 1300 T860 1280 T1080 1260 V1920 H0Z" fill="#120504"/>
<rect x="0" y="1200" width="1080" height="720" fill="url(#lavaG)"/>
<g opacity=".5" stroke="#2a0d07" stroke-width="5" fill="none"><path d="M60 1500 L150 1440 L240 1480"/><path d="M820 1560 L900 1500 L1010 1540"/></g>`;
    /* brasas subindo */
    for (let k = 0; k < 16; k++) {
      const x = (k * 71 + Math.sin(t * 1.3 + k) * 26) % 1080;
      const y = 1700 - ((t * (60 + (k % 5) * 14) + k * 97) % 1100);
      const a = Math.max(0, Math.min(1, (1700 - y) / 160)) * Math.max(0, Math.min(1, (y - 600) / 200));
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${k % 4 === 0 ? 5 : 3}" fill="#ffb347" opacity="${f(a)}" filter="url(#brilhoR)"/>`;
    }
    s += `<g transform="translate(540 1920) scale(1.12) translate(-540 -1920)"><g transform="translate(0 ${f(resp)})">
<path d="M205 1920 L250 1480 Q285 1370 420 1340 L660 1340 Q795 1370 830 1480 L875 1920Z" fill="url(#couro)"/>
<path d="M330 1420 L760 1700" stroke="#3b1f12" stroke-width="44"/><path d="M330 1420 L760 1700" stroke="#7a4a2c" stroke-width="6" stroke-dasharray="2 28"/>
${[0, 1, 2, 3, 4].map(k => `<circle cx="${f(360 + k * 90)}" cy="${f(1440 + k * 58)}" r="8" fill="url(#ferro)"/>`).join('')}
<g transform="translate(540 1520)"><circle r="40" fill="url(#ferro)"/><circle r="26" fill="#b3200d"/><path d="M0 -18 Q12 -2 6 12 Q0 4 -6 12 Q-12 -2 0 -18Z" fill="#ffc35c" filter="url(#brilhoR)"/></g>
<rect x="494" y="1215" width="92" height="140" fill="#b06d4a"/><path d="M494 1290 Q540 1325 586 1290 V1355 H494Z" fill="#8f5236"/>
<path d="M380 1370 Q420 1320 470 1330 L540 1370 L610 1330 Q660 1320 700 1370 L690 1405 Q620 1380 540 1410 Q460 1380 390 1405Z" fill="#3a2418"/>
<g fill="#4a2e1f">${Array.from({ length: 11 }, (x, k) => `<path d="M${f(392 + k * 28)} 1392 l14 34 l14 -34Z"/>`).join('')}</g>
${[310, 770].map((x, j) => `<g transform="translate(${x} 1425)"><ellipse rx="130" ry="86" fill="url(#ferro)"/><ellipse cy="-6" rx="108" ry="64" fill="#5d5752"/><path d="M-90 -40 Q0 -70 90 -40" stroke="#cfc8c0" stroke-width="5" fill="none" opacity=".6"/>${[-70, -20, 30, 80].map(a => `<path d="M${a - 14} -48 L${a} ${-120 + Math.abs(a) * 0.2} L${a + 14} -48Z" fill="#8b847d" stroke="#2f2b29" stroke-width="3" transform="scale(${j ? -1 : 1} 1)"/>`).join('')}</g>`).join('')}
<path d="M285 1500 Q230 1640 300 1770 L355 1750 Q300 1650 330 1530Z" fill="url(#couro)"/>
<path d="M300 1755 Q285 1800 318 1812 L368 1806 Q384 1790 372 1760 L330 1748Z" fill="url(#peleR)"/>
<path d="M740 1470 Q880 1450 900 1320 L826 1296 Q812 1384 730 1402Z" fill="url(#peleR)"/><path d="M900 1320 L826 1296" stroke="url(#ferro)" stroke-width="18" stroke-linecap="round"/>
<g filter="url(#brilhoR)"><circle cx="866" cy="${f(1210 - m * 10)}" r="${f(78 * bola)}" fill="url(#bola)"/>
${[0, 1, 2, 3, 4].map(k => { const a = t * 3 + k * 1.25; return `<path d="M${f(866 + Math.cos(a) * 40)} ${f(1200 + Math.sin(a) * 30)} q${f(Math.cos(a) * 18)} -40 ${f(Math.cos(a) * 6)} -${f(70 + 20 * Math.sin(t * 7 + k))}" stroke="#ffcf6a" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"/>`; }).join('')}</g>
<path d="M828 1300 Q822 1262 846 1252 L884 1254 Q902 1266 896 1302 Q876 1320 850 1316Z" fill="url(#peleR)"/>
<path d="M834 1268 H890 M836 1284 H892" stroke="#7a3f26" stroke-width="3"/>`;
    /* cabeça */
    const ira = calmo ? 0.4 : 1;
    s += `<g transform="rotate(${f(rot)} 540 1250)">
<g>${Array.from({ length: 9 }, (x, k) => {
      const a = -Math.PI + (k + 0.5) * Math.PI / 9, L = 150 + (k % 2 ? 30 : 70) + Math.sin(t * 5 + k * 1.7) * 14;
      const bx = 540 + Math.cos(a) * 120, by = 1010 + Math.sin(a) * 120, tx = 540 + Math.cos(a) * L + Math.sin(t * 4 + k) * 10, ty = 1010 + Math.sin(a) * L * 1.1;
      return `<path d="M${f(bx - 46)} ${f(by + 10)} Q${f((bx + tx) / 2 - 30)} ${f((by + ty) / 2)} ${f(tx)} ${f(ty)} Q${f((bx + tx) / 2 + 30)} ${f((by + ty) / 2)} ${f(bx + 46)} ${f(by + 10)}Z" fill="url(#juba)"/>`;
    }).join('')}</g>
<ellipse cx="430" cy="1100" rx="18" ry="28" fill="#c47d56"/><ellipse cx="650" cy="1100" rx="18" ry="28" fill="#c47d56"/>
<circle cx="428" cy="1128" r="9" fill="none" stroke="url(#ferro)" stroke-width="5"/><circle cx="652" cy="1128" r="9" fill="none" stroke="url(#ferro)" stroke-width="5"/>
<path d="M432 1070 Q432 970 540 962 Q648 970 648 1070 Q648 1160 610 1212 Q578 1246 540 1248 Q502 1246 470 1212 Q432 1160 432 1070Z" fill="url(#peleR)"/>
<path d="M436 1040 Q450 960 540 952 Q630 960 644 1040 Q620 990 580 985 Q560 1000 540 992 Q520 1000 500 985 Q460 990 436 1040Z" fill="url(#juba)"/>
<path d="M452 1118 L512 1130 M452 1140 L506 1150 M628 1118 L568 1130 M628 1140 L574 1150" stroke="#b3200d" stroke-width="9" stroke-linecap="round" opacity=".85"/>
<path d="M600 1020 L618 1060" stroke="#8f4f33" stroke-width="4" stroke-linecap="round"/>`;
    for (const [cx, k] of [[494, 0], [586, 1]]) {
      const hh = 12 * (1 - fecha) * (calmo ? 0.75 : 0.9);
      const d = `M${cx - 23} 1090 Q${cx} ${f(1090 - hh * 1.6)} ${cx + 23} 1090 Q${cx} ${f(1090 + hh * 1.1)} ${cx - 23} 1090Z`;
      s += `<path d="${d}" fill="#f4ead8"/>`;
      if (hh > 2) s += `<clipPath id="r${k}"><path d="${d}"/></clipPath><g clip-path="url(#r${k})"><circle cx="${cx}" cy="1090" r="10" fill="#c46a12"/><circle cx="${cx}" cy="1090" r="5" fill="#1a0a04"/><circle cx="${cx + 4}" cy="1086" r="2.5" fill="#fff"/></g>`;
      s += `<path d="M${cx - 26} 1091 Q${cx} ${f(1090 - hh * 1.65 - 3)} ${cx + 26} 1089" stroke="#3a1206" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    }
    const tremor = calmo ? 0 : Math.sin(t * 11) * 3 * m;
    s += `<path d="M458 ${f(1050 - 4 * ira + tremor)} Q492 ${f(1052)} 524 ${f(1066 + 6 * ira)}" stroke="#b53a17" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M556 ${f(1066 + 6 * ira)} Q588 1052 622 ${f(1050 - 4 * ira + tremor)}" stroke="#b53a17" stroke-width="13" fill="none" stroke-linecap="round"/>
<path d="M540 1098 Q530 1136 524 1148 Q540 1160 556 1148" stroke="#8f4f33" stroke-width="5" fill="none" stroke-linecap="round"/>
<path d="M436 1110 Q440 1230 498 1300 Q518 1356 540 1392 Q562 1356 582 1300 Q640 1230 644 1110 Q628 1172 600 1196 Q570 1180 540 1186 Q510 1180 480 1196 Q452 1172 436 1110Z" fill="url(#barba)"/>
<path d="M470 1240 Q500 1290 520 1340 M610 1240 Q580 1290 560 1340 M540 1250 V1370" stroke="#8a2a10" stroke-width="4" fill="none" opacity=".6"/>
<g transform="translate(0 ${f(m * 8)})"><path d="M540 1380 V1470" stroke="#b53a17" stroke-width="26" stroke-linecap="round"/>
<rect x="526" y="1400" width="28" height="12" rx="4" fill="url(#ferro)"/><rect x="526" y="1438" width="28" height="12" rx="4" fill="url(#ferro)"/></g>`;
    s += boca(540, 1214 + m * 4, m, calmo ? 6 : -1, '#9a3b28', '#2a0806', 66);
    s += `<path d="M486 1172 Q512 1152 540 1164 Q568 1152 594 1172 Q606 1190 598 1200 Q572 1182 540 1186 Q508 1182 482 1200 Q474 1190 486 1172Z" fill="url(#barba)"/>
</g></g></g><rect width="1080" height="1920" fill="url(#vinheta)"/>`;
    return s;
  }

  const PERS = { preto, branco, vermelho };
  /* ids únicos para desenhar dois personagens no mesmo quadro (gradientes e recortes com o mesmo nome se atropelam) */
  const prefixa = (svg, p) => svg.replace(/id="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`);

  /* ---------- A mesa vista de cima (desde 22/11/2026): os dois personagens, um de cada lado, e a jogada da cena ----------
     cfg = {cima, baixo: nomes dos personagens; fala: 'cima' | 'baixo'; img: {cima, baixo, equip, wipe: URLs};
            jogada: 'equipar' | 'wipe' | null; feitas: jogadas das cenas anteriores (já resolvidas); rotulo; dano}
     p = progresso da fala (0 no começo, 1 no fim); m = boca de quem fala. */
  const CORES = { branco: '#f3d27a', preto: '#8dffbe', vermelho: '#ff7a3a', azul: '#6fb6ff', verde: '#7ee07a' };
  const NOMEP = { branco: 'Branco', preto: 'Preto', vermelho: 'Vermelho' };
  /* recorte do rosto de cada personagem no medalhão (o Vermelho tem a juba alta) */
  const VISTA = { vermelho: '290 690 500 500' };
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  const seg = (p, a, b) => ease((p - a) / (b - a));
  const LADO = { cima: { med: [800, 690], cmd: [372, 830], terras: [[130, 600], [250, 600], [130, 1000], [250, 1000]] },
    baixo: { med: [280, 1400], cmd: [708, 1250], terras: [[830, 1060], [950, 1060], [830, 1460], [950, 1460]] } };
  const CW = 236, CH = 330;
  function carta(href, cx, cy, sc, rot, extra) {
    const w = CW * sc, h = CH * sc;
    return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot || 0)})"><rect x="${f(-w / 2 + 6)}" y="${f(-h / 2 + 10)}" width="${f(w)}" height="${f(h)}" rx="${f(12 * sc)}" fill="#000" opacity=".45" filter="url(#mSombra)"/>
<clipPath id="cc${Math.round(cx)}_${Math.round(cy)}"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(12 * sc)}"/></clipPath>
<image href="${href}" x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cc${Math.round(cx)}_${Math.round(cy)})" ${extra || ''}/></g>`;
  }
  function terra(x, y, cor, virada) {
    return `<g transform="translate(${x} ${y}) rotate(${virada ? 90 : 0})"><rect x="-44" y="-62" width="88" height="124" rx="9" fill="#1b1714" stroke="#3a322b" stroke-width="3"/><rect x="-36" y="-54" width="72" height="108" rx="6" fill="${cor}" opacity=".28"/><circle r="20" fill="${cor}" opacity=".9"/><circle r="20" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="3"/></g>`;
  }
  function medalhao(nome, lado, t, m, ativo, pi) {
    const [cx, cy] = LADO[lado].med, r = 128, cor = CORES[nome] || '#ddd';
    const pulso = ativo ? 1 + Math.sin(t * 6) * 0.04 + m * 0.05 : 1;
    const R = r * (ativo ? 1.06 : 0.94);
    let s = `<g transform="translate(${cx} ${cy}) scale(${f(pulso)}) translate(${-cx} ${-cy})">`;
    if (ativo) s += `<circle cx="${cx}" cy="${cy}" r="${f(R + 26)}" fill="${cor}" opacity="${f(0.28 + m * 0.25)}" filter="url(#mBrilho)"/>`;
    s += `<clipPath id="md${pi}"><circle cx="${cx}" cy="${cy}" r="${f(R)}"/></clipPath>
<g clip-path="url(#md${pi})"><svg x="${f(cx - R)}" y="${f(cy - R)}" width="${f(2 * R)}" height="${f(2 * R)}" viewBox="${VISTA[nome] || '300 780 480 480'}" preserveAspectRatio="xMidYMid slice">${prefixa(PERS[nome](t, ativo ? m : 0, ''), pi)}</svg>
${ativo ? '' : `<circle cx="${cx}" cy="${cy}" r="${f(R)}" fill="#0b0a0e" opacity=".45"/>`}</g>
<circle cx="${cx}" cy="${cy}" r="${f(R)}" fill="none" stroke="${ativo ? cor : '#6a6158'}" stroke-width="${ativo ? 10 : 6}"/>
<circle cx="${cx}" cy="${cy}" r="${f(R + 8)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3"/>
<g transform="translate(${cx} ${f(cy + R + 6)})"><rect x="-108" y="-24" width="216" height="52" rx="26" fill="#121014" stroke="${cor}" stroke-width="3" opacity="${ativo ? 1 : 0.8}"/>
<text y="13" text-anchor="middle" font-family="CZ, serif" font-weight="700" font-size="30" letter-spacing="2" fill="${ativo ? cor : '#bdb2a4'}">${(NOMEP[nome] || nome).toUpperCase()}</text></g></g>`;
    return s;
  }
  function raio(x1, y1, x2, y2, t, k) {
    const n = 9, pts = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n, j = i === 0 || i === n ? 0 : Math.sin(t * 40 + i * 2.3 + k * 5) * 34 * Math.sin(u * Math.PI);
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      pts.push([x1 + dx * u - dy / L * j, y1 + dy * u + dx / L * j]);
    }
    const d = 'M' + pts.map(q => f(q[0]) + ' ' + f(q[1])).join(' L');
    return `<path d="${d}" stroke="#ff5a1f" stroke-width="22" fill="none" opacity=".55" filter="url(#mBrilho)" stroke-linejoin="round"/><path d="${d}" stroke="#ffe3a0" stroke-width="7" fill="none" stroke-linejoin="round"/>`;
  }
  function mesa(cfg, t, p, m) {
    const feitas = cfg.feitas || [], qe = cfg.ladoEquip || 'baixo', qw = cfg.ladoWipe || 'cima';
    const eq = cfg.jogada === 'equipar' ? seg(p, 0.12, 0.42) : feitas.includes('equipar') ? 1 : -1;
    const escudo = cfg.jogada === 'equipar' ? seg(p, 0.45, 0.6) : feitas.includes('equipar') ? 1 : 0;
    const W = cfg.jogada === 'wipe';
    const voo = W ? seg(p, 0.04, 0.28) : 0, choque = W ? seg(p, 0.3, 0.42) : 0, morte = W ? seg(p, 0.55, 0.8) : 0;
    const someW = W ? seg(p, 0.42, 0.55) : 0;
    let s = `<defs>
<linearGradient id="mMadeira" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b2416"/><stop offset=".5" stop-color="#2a180e"/><stop offset="1" stop-color="#1a0e07"/></linearGradient>
<radialGradient id="mTapete" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#2b3140"/><stop offset=".7" stop-color="#1b1f2a"/><stop offset="1" stop-color="#11131a"/></radialGradient>
<linearGradient id="mLadoC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CORES[cfg.cima] || '#888'}" stop-opacity=".16"/><stop offset="1" stop-color="${CORES[cfg.cima] || '#888'}" stop-opacity="0"/></linearGradient>
<linearGradient id="mLadoB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${CORES[cfg.baixo] || '#888'}" stop-opacity=".16"/><stop offset="1" stop-color="${CORES[cfg.baixo] || '#888'}" stop-opacity="0"/></linearGradient>
<radialGradient id="mFogo" cx=".5" cy=".5"><stop offset="0" stop-color="#fff2c4" stop-opacity=".9"/><stop offset=".35" stop-color="#ff8a2a" stop-opacity=".55"/><stop offset="1" stop-color="#ff3d0f" stop-opacity="0"/></radialGradient>
<radialGradient id="mEscudo" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#bfe6ff" stop-opacity=".05"/><stop offset=".8" stop-color="#8fd0ff" stop-opacity=".22"/><stop offset="1" stop-color="#e8f6ff" stop-opacity=".55"/></radialGradient>
<filter id="mSombra" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="mBrilho" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10"/></filter>
<filter id="mCinza"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".55"/><feFuncG type="linear" slope=".55"/><feFuncB type="linear" slope=".55"/></feComponentTransfer></filter>
<filter id="mVermelho"><feColorMatrix type="matrix" values="1 .3 .3 0 .25  0 .55 0 0 0  0 0 .5 0 0  0 0 0 1 0"/></filter>
</defs>
<rect width="1080" height="1920" fill="url(#mMadeira)"/>
<g stroke="#4a2e1c" stroke-width="3" opacity=".5" fill="none">${[90, 260, 430, 1660, 1780, 1880].map((y, k) => `<path d="M0 ${y} Q300 ${y + (k % 2 ? 14 : -12)} 600 ${y} T1080 ${y + 6}"/>`).join('')}</g>
<rect x="40" y="500" width="1000" height="1120" rx="40" fill="url(#mTapete)" stroke="#0b0c10" stroke-width="6"/>
<rect x="40" y="500" width="1000" height="560" rx="40" fill="url(#mLadoC)"/><rect x="40" y="1060" width="1000" height="560" rx="40" fill="url(#mLadoB)"/>
<path d="M90 1060 H990" stroke="#c9b892" stroke-width="3" stroke-dasharray="14 16" opacity=".35"/>
<rect x="56" y="516" width="968" height="1088" rx="30" fill="none" stroke="#c9b892" stroke-opacity=".15" stroke-width="2"/>`;
    for (const lado of ['cima', 'baixo']) {
      const nome = cfg[lado], cor = CORES[nome] || '#ccc';
      LADO[lado].terras.forEach(([x, y], k) => { s += terra(x, y, cor, k % 2 === 1); });
    }
    /* criaturas: o comandante de cada lado */
    const tremeC = W ? Math.sin(t * 50) * 6 * (choque - morte) : 0;
    const filtroMorte = morte > 0.5 ? 'filter="url(#mCinza)"' : (W && choque > 0.3 ? 'filter="url(#mVermelho)"' : '');
    const quedaY = morte * 26, opa = 1 - morte * 0.45;
    /* equipamento: anexado embaixo do comandante (sobra uma faixa à mostra); depois do wipe, fica solto na mesa */
    const [bx, by] = LADO[qe].cmd;
    const eqAlvo = [bx + 16, by - 74], eqSolto = [bx - 150, by + 150];
    if (eq >= 1) {
      const pos = morte > 0 ? [eqAlvo[0] + (eqSolto[0] - eqAlvo[0]) * morte, eqAlvo[1] + (eqSolto[1] - eqAlvo[1]) * morte] : eqAlvo;
      s += carta(cfg.img.equip, pos[0], pos[1], 0.86, -6 + morte * 14);
    }
    for (const lado of ['cima', 'baixo']) {
      const [x, y] = LADO[lado].cmd;
      s += `<g opacity="${f(opa)}" transform="translate(${f(tremeC * (lado === 'cima' ? 1 : -1))} ${f(quedaY)})">${carta(cfg.img[lado], x, y, 1, lado === 'cima' ? 2 : -2, filtroMorte)}</g>`;
      if (W && choque > 0) {
        const pop = seg(p, 0.42, 0.5), sai = seg(p, 0.85, 0.98);
        if (pop > 0) s += `<g transform="translate(${x + 80} ${y - 120}) scale(${f(pop * (1 - sai * 0.3))})" opacity="${f(1 - sai)}"><circle r="62" fill="#c2290f" stroke="#ffd27a" stroke-width="6"/><text y="24" text-anchor="middle" font-family="CZ, serif" font-weight="700" font-size="70" fill="#fff6e0">${cfg.dano || ''}</text></g>`;
        s += `<circle cx="${x}" cy="${y}" r="${f(200 * choque)}" fill="url(#mFogo)" opacity="${f((1 - morte) * 0.9)}"/>`;
      }
    }
    /* o escudo do hexproof: não segura o wipe (o raio passa por ele) */
    if (escudo > 0) {
      const pis = W ? (choque > 0 && morte < 1 ? 0.55 + Math.abs(Math.sin(t * 30)) * 0.45 : 1) : 1;
      const sc = (0.85 + 0.15 * escudo) * (1 + Math.sin(t * 3) * 0.015), a = escudo * pis * (1 - morte);
      s += `<g transform="translate(${bx} ${by}) scale(${f(sc)})" opacity="${f(a)}"><path d="M0 -205 L165 -140 Q172 60 0 205 Q-172 60 -165 -140Z" fill="url(#mEscudo)" stroke="#bfe6ff" stroke-width="6"/>
<path d="M0 -205 L165 -140 Q172 60 0 205 Q-172 60 -165 -140Z" fill="none" stroke="#e8f6ff" stroke-width="16" opacity=".35" filter="url(#mBrilho)"/></g>
<g transform="translate(${bx} ${by - 238})" opacity="${f(a)}"><rect x="-128" y="-30" width="256" height="60" rx="30" fill="#0f1a26" stroke="#bfe6ff" stroke-width="4"/><text y="13" text-anchor="middle" font-family="CZ, serif" font-weight="700" font-size="32" letter-spacing="3" fill="#e8f6ff">${(cfg.rotulo || 'Hexproof').toUpperCase()}</text></g>`;
    }
    /* raios da reação em cadeia: da carta para cada criatura */
    if (W && choque > 0 && morte < 1) {
      const [cxA, cyA] = LADO[qe === 'cima' ? 'baixo' : 'cima'].cmd, al = (1 - seg(p, 0.6, 0.75));
      s += `<g opacity="${f(al)}">${raio(540, 1060, cxA, cyA, t, 1)}${raio(540, 1060, bx, by, t, 2)}${raio(cxA, cyA, bx, by, t, 3)}</g>`;
    }
    /* medalhões: quem fala brilha, quem escuta fica mais apagado */
    s += medalhao(cfg.cima, 'cima', t + 0.7, m, cfg.fala === 'cima', 'pa');
    s += medalhao(cfg.baixo, 'baixo', t, m, cfg.fala === 'baixo', 'pb');
    /* a carta jogada voa da mão de quem fala (por cima de tudo) */
    if (cfg.jogada === 'equipar' && eq >= 0 && eq < 1) {
      const [ox, oy] = LADO[qe].med, k = eq;
      const x = ox + (eqAlvo[0] - ox) * k, y = oy + (eqAlvo[1] - oy) * k - Math.sin(k * Math.PI) * 220;
      s += carta(cfg.img.equip, x, y, 0.5 + 0.55 * k + Math.sin(k * Math.PI) * 0.25, -20 + 14 * k);
    }
    if (W && someW < 1) {
      const [ox, oy] = LADO[qw].med;
      const x = ox + (540 - ox) * voo, y = oy + (1060 - oy) * voo - Math.sin(voo * Math.PI) * 160;
      const sc = (0.5 + voo * 0.85) * (1 + choque * 0.12);
      if (choque > 0) s += `<circle cx="540" cy="1060" r="${f(300 * choque)}" fill="url(#mFogo)" opacity="${f(1 - someW)}"/>`;
      s += `<g opacity="${f(1 - someW)}">${carta(cfg.img.wipe, x, y, sc, 8 - 8 * voo)}</g>`;
    }
    if (W && choque > 0) {
      for (let k = 0; k < 22; k++) {
        const a = k * 2.4, d = 120 + ((t * 260 + k * 53) % 520), al = (1 - morte * 0.6) * Math.max(0, 1 - d / 640);
        s += `<circle cx="${f(540 + Math.cos(a) * d)}" cy="${f(1060 + Math.sin(a) * d * 1.1)}" r="${k % 3 ? 5 : 8}" fill="#ffb347" opacity="${f(al)}"/>`;
      }
    }
    return s;
  }

  window.desenha = function (nome, t, m, humor) {
    const svg = document.getElementById('s');
    svg.innerHTML = (PERS[nome] || preto)(t, m, humor);
  };
  window.desenhaMesa = function (cfg, t, p, m) {
    document.getElementById('s').innerHTML = mesa(cfg, t, p, m);
  };
})();
