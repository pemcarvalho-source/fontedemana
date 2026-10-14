# Pauta de postagem da Fonte de Mana

A pauta diz ao Paulo, na hora certa, **em qual rede postar, o que postar, o texto pronto e o roteiro de gravação quando houver**. Ela sai de duas tarefas agendadas e chega ao celular de dois jeitos:

- **Mensagem da tarefa** (aviso do app do Claude) com o resumo, quando cada tarefa termina.
- **Calendário com alarmes**: cada aviso vira um evento no calendário `https://fontedemana.com.br/pauta/agenda-fdm-7q2k9.ics`, que o Paulo assina no iPhone. O alarme toca 5 minutos antes de cada postagem e o evento traz a rede, o que postar, os links dos arquivos, os textos e o roteiro.
- Página de consulta do dia, com botão de copiar cada texto: `https://fontedemana.com.br/pauta/AAAA-MM-DD/`.

## Convivência com as outras rotinas (obrigatório)

- A pauta **só escreve na pasta `pauta/`** do repositório. Nunca altere `data/`, `img/`, `kit/`, `lands/`, `tools/kit/`, `index.html`, `CNAME`, `og.jpg`, `favicon.png`, `apple-touch-icon.png` ou `README.md`.
- Nunca publique no artifact do jornal, nunca mexa em tarefas agendadas e nunca chame ferramenta paga do vidIQ (a cota é do Termômetro do jornal).
- Antes de enviar: `git pull --rebase --depth 50 origin main`. Envie com `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "Pauta de AAAA-MM-DD"` e `git push origin HEAD:main`. Se o push for recusado por commits novos, repita o pull com rebase e o push. Se falhar por permissão ou rede, tente uma vez depois de 10 s; se falhar de novo, guarde o erro exato para a mensagem final.
- Limpeza: apague os arquivos `.jpg` e `.mp4` de pastas `pauta/AAAA-MM-DD` com mais de 7 dias (mantenha `pauta.json` e `index.html`).

## Horários fixos (todos os dias, horário de Brasília)

Cada rede recebe uma peça diferente; nada é repostado igual em duas redes.

| Hora | id | Rede | Peça | De onde vem |
| --- | --- | --- | --- | --- |
| 18:30 do dia anterior | gravacao | Gravação | Roteiro da narração do TikTok de amanhã | Tarefa da noite |
| 10:30 | threads-manha | Threads | Pergunta ou enquete do dia | `threadsAvulsos` do kit (o que tiver `obs` de enquete ou for pergunta) |
| 10:30 | stories-manha | Instagram Stories | Capa do carrossel com sticker de pergunta ou contagem | `kit/edN/carrossel-01.jpg` |
| 11:30 | tiktok | TikTok | Vídeo de gancho narrado pelo Paulo | `pauta/AAAA-MM-DD/tiktok/` (tarefa da noite) |
| 12:00 | feed | Instagram feed | Carrossel do jornal | `kit/edN/carrossel-*.jpg` e `legendaCarrossel` |
| 12:00 | stories-meio-dia | Instagram Stories | Repost do carrossel com enquete | passos |
| 15:00 | threads-tarde | Threads | Fio da edição, um post por bloco | `threadsFio` |
| 15:00 | stories-tarde | Instagram Stories | Imagem do Topdeck com sticker de link para o site | a imagem do Topdeck no carrossel |
| 19:00 | reels | Reels | Vídeo de 48 s do jornal com música em alta, sem narração | `kit/edN/video-vertical-edN.mp4` e `legendaVideo` |
| 19:00 | threads-noite | Threads | Post com o vídeo | `threadsVideo` e o mesmo vídeo |

Só o TikTok tem narração, porque tudo que exige gravação precisa sair no dia anterior depois das 18h. O Reels usa o vídeo do jornal com música, sem voz.

## Formato do `pauta/AAAA-MM-DD/pauta.json`

    {
      "data": "2026-10-13",
      "fx": "Valores em reais pela cotação de 9 out (Banco Central Europeu)." ou null,
      "avisos": [
        {
          "id": "tiktok",                       (minúsculas, números e hífen)
          "dia": "2026-10-12",                  (opcional: só quando o aviso é em outro dia, como a gravação)
          "hora": "11:30",
          "rede": "TikTok",                     (Threads, Instagram feed, Instagram Stories, TikTok, Reels ou Gravação)
          "titulo": (70) o que é a peça,
          "oQue": (400) o que postar, em uma ou duas frases,
          "arquivos": [{"nome": (60), "url": "https://fontedemana.com.br/..."}],
          "textos": [{"rotulo": "Legenda", "texto": (2200) texto pronto para colar}],
          "roteiro": [{"cena": "Cena 1, uns 8 s", "tela": (160) o que aparece, "fala": (300) o que falar}],
          "passos": [(220) cada passo no app, na ordem]
        }
      ]
    }

Rode `node tools/pauta/pauta.cjs . AAAA-MM-DD` na raiz do clone. Ele confere tamanhos, separadores proibidos e moeda, e gera a página do dia, a lista de dias e o calendário. Se aparecer `ERROS:`, corrija o `pauta.json` e rode de novo.

## Regras de texto (iguais às do jornal)

- Português do Brasil, tom de quem joga Commander, frases curtas, sem fórmulas de IA.
- Nada de " · ", " – ", " — " ou "—". Intervalos como "6 a 12 nov".
- Só fatos que estão nas edições do jornal (`data/edN.js`) ou confirmados como o jornal exige (fonte primária ou duas fontes). Nada inventado.
- **Moeda:** valor em dólar primeiro e o real entre parênteses, "US$ 29,99 (R$ 150,10)", com a cotação do dia do `fx` da edição. Na fala, o dólar e depois "uns X reais", arredondado. Se precisar de cotação nova, use `https://api.frankfurter.dev/v1/latest?from=USD&to=BRL` por WebFetch (data de no máximo 4 dias). Quem tem valor convertido leva a nota da cotação (`fx`).
- Conteúdo sem rosto: só tela, cartas e voz.
- Legendas do TikTok e do Instagram terminam com o aviso de Fan Content: "Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC."
- Links de arquivos sempre pelo site: `https://fontedemana.com.br/kit/edN/...` e `https://fontedemana.com.br/pauta/AAAA-MM-DD/...`. Assim o Paulo baixa direto no celular.

## Tarefa da noite: gravação de amanhã (18h21)

1. Clone: `git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh` e trabalhe dentro de `./gh`. Leia este arquivo inteiro.
2. Amanhã = `AMANHA` (data de São Paulo + 1 dia). Leia `data/index.js` e a edição mais recente `data/edN.js`.
3. Escolha o tema do TikTok de amanhã. **Regra principal: conteúdo nunca se repete.** A edição de hoje já saiu inteira nas redes hoje (carrossel, Reels, Threads e Stories), então o TikTok de amanhã não pode ser sobre ela.
   - Antes de escolher, monte a lista do que já foi publicado: as manchetes (`stories[].title`), o Topdeck (`card.name`), os sussurros e o `summary` das duas edições mais recentes (`data/edN.js` e `data/ed(N-1).js`), os títulos de `kit/edN/kit.json`, e o `tema` de todos os `pauta/*/tiktok/roteiro.json` e os títulos dos avisos de `pauta/*/pauta.json` dos últimos 30 dias. O tema de amanhã não pode tratar do mesmo assunto de nenhum item dessa lista (mesma notícia, mesmo anúncio, mesma carta, mesmo termo), nem com outro ângulo.
   - Notícia só entra se for anúncio oficial da Wizards (banimento, Game Changers, regra, produto de Commander) publicado depois das 6h de hoje, que ainda não esteja na lista acima. Fora isso, o TikTok é sempre conteúdo original, pelo pilar do dia da semana de amanhã:
     - segunda, **História de uma carta**: uma carta que existe e marcou o Commander (ano, coleção, artista e por que importa hoje), com dados do Scryfall e do EDHREC.
     - terça, **Dicionário do Commander**: um termo do vocabulário do jogo (staple, mana dork, stack, ramp, tutor, board wipe...), explicado com um exemplo de carta real. A fila de termos está em `extras/index.html`; pule os que já saíram.
     - quarta, **Deck em 40 segundos**: um comandante popular no EDHREC e o plano de jogo em três passos, com cartas reais da página dele no EDHREC.
     - quinta, **Mesa Quente**: ranking de 5, com dados do EDHREC ou da lista oficial de Game Changers.
     - sexta, **Termômetro**: o assunto do vídeo com mais visualizações no `pulse` das últimas 7 edições vira uma versão própria da Fonte de Mana, com fatos conferidos. Nunca copie o roteiro do vídeo.
     - sábado, **Rota das Lojas**: o Paulo grava na loja.
     - domingo, **Bolsa de Mana**: uma carta de Commander que mudou de preço na semana e por quê, com o preço do dia (Scryfall ou MTGStocks). Não pode ser carta que já foi Topdeck nem manchete.
   - Tudo precisa ter base em cartas, regras e fatos que existem: dado de carta pelo Scryfall, número de decks pelo EDHREC, história e curiosidade com fonte primária ou duas fontes. Ponha as fontes no campo `fonte` das cenas.
   - Imagens de conteúdo original: baixe do Scryfall (regras de User-Agent do jornal) o `art_crop` para `pauta/AMANHA/tiktok/arte.jpg` e o `large` para `pauta/AMANHA/tiktok/carta.jpg`, e aponte `arte` e `carta` do roteiro para esses arquivos. Nunca grave em `img/`.
   - Pesquisa extra: no máximo 8 buscas na web, com as regras de verificação do jornal.
4. Escreva `pauta/AMANHA/tiktok/roteiro.json`:

        {
          "data": "AMANHA",
          "tema": (80),
          "arte": "pauta/AMANHA/tiktok/arte.jpg" ou null,    (arte de fundo; precisa existir no repositório)
          "carta": "pauta/AMANHA/tiktok/carta.jpg" ou null,  (imagem de carta na cena final)
          "credito": "Arte: <carta>, <artista>" ou null,
          "fx": "Reais pela cotação de 9 out (Banco Central Europeu)" ou null,
          "legenda": legenda do TikTok com a pergunta, a nota da cotação se houver valor, hashtags e o aviso de Fan Content,
          "comentario": comentário para fixar,
          "cenas": [                               (3 a 5 cenas, narração total de 25 a 45 s)
            {"tipo": "gancho", "cor": "A", "chip": (18), "kicker": (40), "titulo": (64), "sub": (140), "narracao": (260)},
            {"tipo": "lista", "cor": "A", "chip": "No bolso", "kicker": (40), "linhas": [{"nome": (30), "valor": "US$ 56,81", "real": "(R$ 284,33)"}], "rodape": (110), "fonte": (60), "narracao": (260)},
            {"tipo": "texto", "cor": "U", "kicker": (40), "titulo": (64), "sub": (140), "narracao": (260)},
            {"tipo": "cta", "cor": "M", "kicker": "Todo dia no Instagram", "titulo": (64), "destaque": "@fontedemana", "narracao": (260)}
          ]
        }

   A cena final chama para o perfil @fontedemana e para o site, sem prometer "parte 2" (o carrossel do dia seguinte é de outra notícia). Cores: W Brasil e eventos, U regras, B ban, R polêmica, G novidade, A bolso, M Topdeck.
5. Rode `node tools/pauta/tiktok.cjs . AMANHA` (timeout de 600000 ms). Ele gera as cenas e `tiktok-mudo.mp4`, e grava em cada cena os segundos estimados. Se der `ERROS:`, encurte o texto apontado e rode de novo, até 4 vezes. Abra com Read a cena 1 e a cena de lista para conferir. No sábado (Rota das Lojas) não há vídeo para gerar: pule este passo e faça o roteiro como lista do que filmar.
6. Escreva ou atualize `pauta/AMANHA/pauta.json` com dois avisos (mantenha outros que já existirem):
   - `gravacao`: dia = hoje, hora 18:30, rede Gravação, titulo "Gravar a narração do TikTok de amanhã", `roteiro` com uma linha por cena (cena "Cena 1, uns 8 s", tela = o texto da cena, fala = a narração), arquivo do vídeo mudo, e os passos: gravar um áudio por cena no Gravador do iPhone, num lugar silencioso, com o celular a um palmo da boca; nomear cena_1, cena_2...; mandar os áudios ao Claude no projeto MGT strategy (pode ser respondendo à mensagem desta tarefa) dizendo "áudios do TikTok de AAAA-MM-DD".
   - `tiktok`: hora 11:30, rede TikTok, arquivo `tiktok-narrado.mp4` (se já existir) ou o mudo, textos Legenda e Comentário fixado, passos: postar com som em alta entre 15% e 20% pela biblioteca do TikTok, voz própria não precisa de rótulo de IA, fixar o comentário. Se os áudios não chegarem, o passo alternativo é postar o vídeo mudo com música em alta.
7. Rode `node tools/pauta/pauta.cjs . AMANHA`, faça a limpeza, envie (regras acima) e, uns 2 minutos depois, confira com WebFetch `https://fontedemana.com.br/pauta/AMANHA/`.
8. Mensagem final, curta, em português: "Gravação para amanhã (AMANHA): <tema>", o roteiro cena a cena (segundos e fala), o link do vídeo mudo, o link da página e como mandar os áudios. Se algo falhou, diga o erro exato.

## Tarefa da manhã: pauta do dia (7h20)

1. Clone como acima e leia este arquivo. Hoje = `HOJE` (São Paulo).
2. Ache em `data/index.js` a edição de hoje (`date` = HOJE) e confira se `kit/edN/kit.json` existe. Se não existir, espere 10 minutos (`sleep 600`) e faça `git pull` de novo, no máximo 3 vezes. Se ainda faltar, monte só os avisos do TikTok e diga na mensagem final que o kit de hoje não saiu.
3. Leia `kit/edN/kit.json`, liste as imagens `kit/edN/carrossel-*.jpg` e o vídeo `kit/edN/video-vertical-edN.mp4`, e leia `fx` de `data/edN.js` (use o `html` dele em `pauta.json` > `fx`; sem fx, null).
4. Leia `pauta/HOJE/pauta.json` se existir (veio da noite) e mantenha os avisos `gravacao` e `tiktok`. Se `pauta/HOJE/tiktok/tiktok-narrado.mp4` existir, troque o arquivo do aviso `tiktok` por ele.
5. Monte os outros avisos da tabela de horários, com os textos do kit como estão (já seguem a regra de moeda). No fio do Threads, um item de `textos` por post ("Post 1", "Post 2"...). Nos Stories, diga qual sticker usar e onde. Um passo por ação no app.
6. Rode `node tools/pauta/pauta.cjs . HOJE`, faça a limpeza, envie e confira `https://fontedemana.com.br/pauta/HOJE/` uns 2 minutos depois.
7. Mensagem final, curta: "Pauta de hoje (HOJE)", uma linha por aviso (hora, rede, peça), o link da página, se o TikTok já está narrado (se não estiver: "mande os áudios até 11h ou poste o vídeo mudo com música") e lembrete de que os alarmes do calendário tocam 5 minutos antes de cada horário.

## Juntar a narração (quando o Paulo mandar os áudios)

Em qualquer conversa com acesso ao repositório:

1. Clone, salve os áudios na ordem das cenas e rode `node tools/pauta/tiktok.cjs . AAAA-MM-DD --narrar cena_1.m4a cena_2.m4a ...` (um áudio por cena). Cada cena passa a durar o tempo da fala, com o silêncio das pontas cortado e o volume no padrão das redes.
2. No `pauta/AAAA-MM-DD/pauta.json`, troque o arquivo do aviso `tiktok` por `https://fontedemana.com.br/pauta/AAAA-MM-DD/tiktok/tiktok-narrado.mp4`, rode `pauta.cjs`, envie e mande o link ao Paulo.
