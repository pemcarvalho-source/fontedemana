# Pauta de postagem e conteúdo original da Fonte de Mana

A pauta diz ao Paulo, na hora certa, **em qual rede postar, o que postar, o texto pronto e o roteiro de gravação**. Chega ao celular pela mensagem da tarefa, pelo calendário com alarmes `https://fontedemana.com.br/pauta/agenda-fdm-7q2k9.ics` (alarme 5 minutos antes) e pela página do dia `https://fontedemana.com.br/pauta/AAAA-MM-DD/`.

Leia antes `tools/REGRAS.md`. A estratégia (notícia + original, força do dia, grade e pilares) está em `tools/conteudo/ESTRATEGIA.md`; a parte que os scripts usam, em `tools/conteudo/plano.json`.

## Quem faz o quê

| Hora | Tarefa | Faz |
| --- | --- | --- |
| 18:21 | Noite | Conteúdo original de amanhã: TikTok narrado, carrossel original e post de debate do Threads, mais os avisos de gravação e do TikTok |
| 5:55 | Jornal | Edição, site e Kit de Redes, com a força do dia no kit (`tools/jornal/LEIA.md`) |
| 7:20 | Manhã | `node tools/pauta/manha.cjs . HOJE` monta o resto da pauta sozinho |
| Na hora do anúncio | Plantão | Só nos dias marcados em `plano.json` > `plantao.eventos`: carrossel curto, TikTok em modo foto, Threads e Stories do anúncio do dia, com avisos `plantao-*` na pauta (`tools/conteudo/PLANTAO.md`) |

Escreva só na pasta `pauta/`. Nunca chame ferramenta paga do vidIQ e nunca mexa em tarefas agendadas.

## Tarefa da noite: original de amanhã (18h21)

1. Prepare a pasta de trabalho como em `tools/REGRAS.md` (a sessão já abre no repositório). AMANHA = `TZ=America/Sao_Paulo date -d tomorrow +%F`.
2. Rode `node tools/conteudo/contexto.cjs . AMANHA`. Ele mostra o pilar de amanhã (o que fazer, fontes, gancho, pergunta e, quando houver, o formato), os próximos itens da fila do pilar e a lista de tudo o que já foi publicado. É a única leitura necessária para não repetir: não abra pautas e edições antigas. Se aparecer a linha **Formato**, leia em `tools/conteudo/FORMATOS.md` a parte geral e a seção daquele formato, e siga o molde nas três redes. Se aparecer **Data comemorativa**, siga o que ela diz para a data (tema, ângulo do pilar, buscas e cartas conferidas) e a seção Datas comemorativas do `FORMATOS.md`.
3. Escolha o tema. **Conteúdo nunca se repete**: nada da lista do contexto (mesma notícia, carta, termo ou anúncio, nem com outro ângulo). Use o pilar do contexto e, se houver fila, o primeiro item livre que tenha fontes boas. Exceção: anúncio oficial da Wizards publicado depois das 6h de hoje (ban, Game Changers, regra, produto de Commander) que não esteja na lista vira o tema do TikTok; nesse caso o carrossel original pode ser pulado.
4. Pesquise: no máximo 8 buscas na web, mais as páginas do EDHREC, do Commander Spellbook e do Scryfall que o pilar pedir. Tudo com base em cartas, regras e fatos que existem, com as regras de verificação. Porcentagem de chance de achar carta só pelo `node tools/conteudo/chance.cjs` (uso no cabeçalho do arquivo), nunca de cabeça. Cotação: use o `fx` da edição mais recente (`data/edN.js`) se tiver até 4 dias; senão, a regra de moeda.
5. Imagens pelo Scryfall: `art_crop` em `pauta/AMANHA/tiktok/arte.jpg` e `large` em `pauta/AMANHA/tiktok/carta.jpg`. Para telas do carrossel com carta (Top 5, Deck, Combo, História), `image_uris.normal` em `pauta/AMANHA/original/carta-1.jpg`, `carta-2.jpg`... Para as cenas `carta` do TikTok, `image_uris.large` em `pauta/AMANHA/tiktok/carta-1.jpg`, `carta-2.jpg`... Prefira a impressão de moldura comum, não a serializada nem a showcase. Nunca grave em `img/`.
6. Escreva `pauta/AMANHA/tiktok/roteiro.json` (formato abaixo) e rode `node tools/pauta/tiktok.cjs . AMANHA` (timeout 600000 ms). Se der `ERROS:`, encurte o texto apontado e rode de novo, até 4 vezes. Abra com Read a cena 1 e a cena de lista. **Molde novo (a partir de 26/10/2026):** quando o contexto mostrar a linha **Vídeo**, siga essas regras (20 a 30 s, promessa no primeiro segundo, cenas curtas, sem abertura, cta opcional) e ponha `"pilar"` no roteiro. O script revela as partes de cada cena uma de cada vez e recusa cena que fica parada mais de 3,5 s ou fala que passa do teto; nesse caso encurte a fala, acrescente `sub` ou `rodape`, ou divida a cena. Se o contexto mostrar **Reel de teste**, escreva também o `ganchoB`; o script gera `tiktok-teste.mp4`. **Paulo no vídeo (a partir de 26/10/2026):** quando o contexto mostrar a linha **Paulo no vídeo**, a cena 1 é do tipo `rosto` e pode haver mais até 2 (formato abaixo). No vídeo mudo, a cena rosto sai como cena de texto; na narração, o vídeo dele entra no lugar, com o título por cima.
7. Escreva `pauta/AMANHA/original/original.json` (formato abaixo) e rode `node tools/conteudo/original.cjs . AMANHA`. Mesma regra de correção, até 4 vezes. Abra com Read a capa e uma tela com carta. Se não sair, siga sem ele: a manhã usa o carrossel do jornal.
   - Os três formatos tratam do mesmo tema, mas não são a mesma peça: o TikTok conta e explica em voz; o carrossel é a versão para salvar (lista, ranking, passo a passo, com uma carta por tela quando fizer sentido); o Threads é a pergunta ou o debate que puxa comentários.
8. Escreva ou atualize `pauta/AMANHA/pauta.json` com dois avisos (mantenha outros que já existirem):
   - `gravacao`: dia = hoje, hora 18:30, rede Gravação, titulo "Gravar a narração do TikTok de amanhã", `roteiro` com uma linha por cena (cena "Cena 1, uns 8 s", tela = o texto da cena, fala = a narração), arquivo do vídeo mudo e os passos: gravar um áudio por cena no Gravador do iPhone, num lugar silencioso, com o celular a um palmo da boca; nomear cena_1, cena_2...; mandar os áudios ao Claude no projeto MGT strategy (pode ser respondendo à mensagem desta tarefa) dizendo "áudios do TikTok de AAAA-MM-DD".
   - `tiktok`: hora 11:30, rede TikTok, arquivo `tiktok-narrado.mp4` (se já existir) ou o mudo, textos Legenda e Comentário fixado, passos: postar com som em alta entre 15% e 20% pela biblioteca do TikTok, voz própria não precisa de rótulo de IA, fixar o comentário; se os áudios não chegarem, postar o vídeo mudo com música em alta. A partir de 26/10 a mesma legenda e o mesmo vídeo vão também para o Reels das 19:00 (a pauta da manhã monta esse aviso), então a legenda termina com o aviso de Fan Content e leva no máximo 3 hashtags: 1 do assunto (#krenko) e 2 gerais (#commander e #mtg).
   - Com cena `rosto` (dia de Paulo no vídeo): no aviso `gravacao`, titulo "Gravar o vídeo de amanhã (você aparece)"; cada linha do roteiro com a cena ("Cena 1, rosto, uns 4 s" ou "Cena 2, só a voz, uns 5 s"), a tela, a fala e `como` ("Rosto: " + o `gravar` da cena, ou "Só a voz: pode gravar em vídeo ou áudio"); nos passos, as dicas de `plano.json` > `rosto.gravacao` e, no fim, mandar os vídeos ao Claude no projeto MGT strategy dizendo "vídeos do TikTok de AAAA-MM-DD".
   - Com `ganchoB` (dia de Reel de teste): no aviso `gravacao`, acrescente por último a linha "Cena 1B (gancho do Reel de teste)", com a tela e a fala do ganchoB, e diga nos passos para nomear esse áudio `cena_1b` e mandar junto com os outros.
9. Rode `node tools/pauta/pauta.cjs . AMANHA`. Envie (`git add pauta`, commit "Pauta de AMANHA: original e gravação") e confira a publicação pelo GitHub (`pauta/AMANHA/pauta.json` no `origin/main` e "pages build and deployment" do commit com `success`), como em "Repositório e convivência" de `tools/REGRAS.md`. Não use WebFetch no site.
10. Mensagem final, curta: "Gravação para amanhã (AMANHA): <pilar>, <tema>" (em dia de Paulo no vídeo, "Amanhã você aparece no vídeo (AMANHA): <pilar>, <tema>", e em cada cena do roteiro se é rosto ou só a voz e o que fazer), o roteiro cena a cena (segundos e fala), o link do vídeo mudo, o link da página, se o carrossel original saiu (quantas telas) e como mandar os áudios. Se algo falhou, o erro exato.

Sábado com visita marcada (`extras/lojas/AMANHA.json`, pilar Rota das Lojas): o Paulo grava na loja. Não há vídeo nem carrossel para gerar: faça o roteiro como lista do que filmar e pule os passos 6 e 7 (o aviso `tiktok` aponta para o que ele gravar).

## Formato do `pauta/AAAA-MM-DD/tiktok/roteiro.json`

    {
      "data": "AMANHA",
      "pilar": id do pilar em plano.json (ex.: "deck"; a partir de 26/10, decide o teto de duração),
      "tema": (80),
      "item": item da fila usado ou null,
      "arte": "pauta/AMANHA/tiktok/arte.jpg" ou null,
      "carta": "pauta/AMANHA/tiktok/carta.jpg" ou null,
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

Cena com o Paulo no vídeo (a partir de 26/10/2026, nos pilares de `plano.json` > `rosto`; a cena 1 é obrigatória e há no máximo 3):

        {"tipo": "rosto", "cor": "G", "chip": (18), "kicker": (40), "titulo": (64), "sub": (140, opcional, só aparece se ele não gravar),
         "narracao": (90 na cena 1, 110 nas outras), "gravar": o que ele faz e mostra na cena (140)}

Com o vídeo dele, a cena mostra o rosto em tela cheia com o kicker e o título numa caixa no terço de cima (`cena-N-rosto.png`) e dura o tempo da fala. Sem o vídeo, sai como cena de texto (ou de gancho, na cena 1). Kicker e título curtos: a caixa não pode descer até o meio da tela, senão o script recusa.

Cena de carta (uma carta grande na tela, com o preço logo abaixo):

        {"tipo": "carta", "cor": "A", "chip": (18, opcional), "kicker": (40), "carta": "pauta/AMANHA/tiktok/carta-1.jpg",
         "titulo": (40, opcional), "valor": "US$ 7,73" (12, opcional), "real": "(R$ 38,86)" (16), "sub": (140, opcional; cabe uma linha, uns 45 caracteres),
         "fonte": (60, opcional), "narracao": (260; no molde novo, 110)}

Quando o vídeo mostra cartas com preço ou com o que fazem (Top 5, Deck, as peças de uma estratégia), prefira uma cena `carta` por carta à cena `lista` ou ao `combo` com três cartas pequenas: a carta fica legível no celular e a tela muda a cada poucos segundos (pedido do Paulo em 23 out 2026). A cena `lista` continua para preços sem carta (lacrados, produtos).

Cenas do quiz (pilar Chama o Juiz; exemplo completo em `tools/conteudo/FORMATOS.md`):

        {"tipo": "quiz", "cor": "U", "chip": (18), "kicker": (40), "titulo": a pergunta (64), "opcoes": [(40), (40), (40)], "contagem": 5, "narracao": (260)}
        {"tipo": "resposta", "cor": "U", "chip": (18), "kicker": (40), "titulo": o veredito (64), "opcoes": as mesmas do quiz, "certa": "A", "sub": (140), "fonte": "Regras Abrangentes, <número>" (60), "narracao": (260)}

`opcoes` tem de 2 a 4 textos; a cena quiz precisa de uma resposta depois dela com as mesmas opções na mesma ordem. `contagem` (3 a 5) acrescenta essa quantidade de segundos com o número regressivo depois da fala, no vídeo mudo e no narrado.

**Molde novo, roteiros a partir de 26/10/2026** (`plano.json` > `video`; o `tiktok.cjs` confere):

- 3 a 7 cenas. Fala de até 110 caracteres por cena; no gancho, até 90; na cta, até 60 (a cta é opcional).
- Soma das falas de até 30 s (Deck e Combo, até 45 s), sem contar a contagem do quiz.
- O vídeo revela as partes de cada cena uma de cada vez: gancho e texto (título, depois `sub`, depois `rodape`), lista (uma linha por vez), quiz (pergunta, depois uma opção por vez), resposta (veredito, depois `sub`), combo (uma carta e um passo por vez), carta (a carta, depois o preço, depois `sub`), cta (título, depois `destaque`). Cada parte fica no ar no máximo 3,5 s; fala longa com poucas partes é recusada.
- A primeira fala e o título da cena 1 dizem a promessa do vídeo (o resultado, a resposta, o número). Nada de "oi, pessoal", vinheta ou "segue a página" no começo.
- Chamada (desde 26/10/2026): pergunta aberta sobre o tema, com as opções na tela. Nunca "comenta X", "comenta a letra", "marca quem" ou "manda pro amigo": o Instagram não recomenda peça que pede interação assim. A contagem do quiz mostra "A, B ou C?".
- `ganchoB` (só em dia de Reel de teste): `{"kicker": (40), "titulo": (64), "sub": (140, opcional), "chip": (18, opcional), "narracao": (90)}`, outro gancho para o mesmo vídeo, com título diferente do da cena 1. Gera `tiktok-teste.mp4` (e, na narração, `tiktok-teste-narrado.mp4`).

A cena final chama para o @fontedemana e o site, sem prometer "parte 2". Cores: W Brasil e eventos, U regras, B ban, R polêmica, G novidade, A bolso, M Topdeck e multicolor.

## Formato do `pauta/AAAA-MM-DD/original/original.json`

    {
      "data": "AMANHA",
      "pilar": id do pilar em plano.json (ex.: "top5"),
      "item": item da fila usado ou null,
      "tema": (80),
      "cartas": ["Nome da carta", ...],          (todas as cartas citadas, para não repetir depois)
      "fx": "Valores em reais pela cotação de 9 out (Banco Central Europeu)." ou null,
      "carrossel": {
        "capa": {"cor": "B", "chip": "Top 5 #1" (22), "kicker": (40), "titulo": (60, pode ter <b>), "sub": (150, pode ter <b>),
                 "arte": "pauta/AMANHA/tiktok/arte.jpg" ou null, "credito": "Arte: <carta>, <artista>" (80)},
        "cartoes": [                              (3 a 5 telas)
          {"cor": "B", "titulo": (34), "carta": "pauta/AMANHA/original/carta-1.jpg" (opcional),
           "itens": [{"cor": "B", "html": (120)}],  (2 a 4; com carta, no máximo 2 e sem nota)
           "nota": {"rotulo": (24), "texto": começa em minúscula (95)} (opcional),
           "fx": nota curta da cotação na tela (110, opcional),
           "fonte": "Fonte: EDHREC, out 2026" (70)}
        ],
        tela com gráfico (Matemática da Mesa): no lugar da carta, "barras": [{"rotulo": (22), "valor": 0 a 100, "texto": "31,2%" (8)}] (2 a 4,
        valores do chance.cjs), "destaque": índice da barra em destaque (opcional), 1 ou 2 itens e nenhuma nota,
        "cta": {"pergunta": (70, pode ter <b>), "quando": (60), "salvar": motivo para salvar ou mandar (70)}
      },
      "legenda": legenda do Instagram (1800): primeira linha com o gancho e palavras de busca (Commander, deck, carta de Magic, o tema), fontes, link fontedemana.com.br, pergunta e hashtags. Sem o aviso de Fan Content (a pauta põe).
      "threads": {"texto": post de debate, texto puro (450), "obs": dica de enquete (120) ou null},
      "enquete": {"pergunta": (80), "opcoes": [(25), (25)]}      (2 a 4 opções; sticker dos Stories das 12:00 no dia calmo)
    }

## Tarefa da manhã: pauta do dia (7h20)

Só script, sem escrever texto novo:
1. Prepare a pasta de trabalho como em `tools/REGRAS.md`. HOJE = `TZ=America/Sao_Paulo date +%F`.
2. `node tools/pauta/manha.cjs . HOJE`. Se o resumo disser que a edição ou o kit de hoje ainda não saíram, `git stash -u`, `sleep 600`, `git pull --rebase --depth 50 origin main`, `git stash drop` e rode de novo, no máximo 3 vezes; depois siga com o que tiver.
3. Se aparecer `ERROS:` num texto vindo do kit ou do original, corrija esse texto direto em `pauta/HOJE/pauta.json` e rode `node tools/pauta/pauta.cjs . HOJE` (não rode o manha.cjs de novo, ele refaz o arquivo).
4. `git add pauta`, commit "Pauta de HOJE" e push. Confira a publicação pelo GitHub (`pauta/HOJE/pauta.json` no `origin/main` e "pages build and deployment" do commit com `success`), como em "Repositório e convivência" de `tools/REGRAS.md`. Não use WebFetch no site.
5. Mensagem final: o resumo que o script imprime depois de `---`.

O script decide o feed pela força do dia (`pauta.forca` do kit): dia forte, carrossel do jornal; dia calmo, carrossel original (ou o mais recente do banco, de até 6 dias, que não foi para o feed). Também apaga `.jpg` e `.mp4` de pastas da pauta com mais de 7 dias.

A partir de 26/10/2026 (`plano.json` > `reels`, `threads`, `legenda` e `testes`): o Reels das 19:00 é o vídeo original do dia (o arquivo do TikTok, narrado ou mudo, com a legenda e o comentário do roteiro); o Threads das 15:00 é a notícia num post só (`threadsPost` do kit) e os posts do Threads pedem o tópico MTG; as legendas ficam com no máximo 3 hashtags (o script corta o resto, ficando com a do assunto e as gerais #commander e #mtg); o carrossel e o Reels narrado pedem música em alta da biblioteca do Instagram (`plano.json` > `audio`). Nos dias de teste, o script troca a hora do TikTok, tira as hashtags ou acrescenta o Reel de teste das 21:00, e diz no resumo qual é o teste do dia. O Reel de teste sai às 18:40, antes do Reels das 19:00, e todo dia às 21:30 entra o aviso de responder os comentários de hoje e de ontem (`plano.json` > `conversa`). Os avisos `plantao-*` que o plantão põe na pauta continuam quando a manhã roda de novo.

## Formato do `pauta/AAAA-MM-DD/pauta.json`

    {
      "data": "2026-10-13",
      "fx": "Valores em reais pela cotação de 9 out (Banco Central Europeu)." ou null,
      "forca": "forte" ou "calmo" (o script põe),
      "feed": "jornal" ou "original" (o script põe),
      "avisos": [
        {
          "id": "tiktok",                       (minúsculas, números e hífen)
          "dia": "2026-10-12",                  (opcional: só quando o aviso é em outro dia, como a gravação)
          "hora": "11:30",
          "rede": "TikTok",                     (Threads, Instagram feed, Instagram Stories, TikTok, Reels, Gravação ou Comentários)
          "titulo": (70), "oQue": (400),
          "origem": "jornal:ed9" ou "original:2026-10-13" (só no feed, o script põe),
          "arquivos": [{"nome": (60), "url": "https://fontedemana.com.br/..."}],
          "textos": [{"rotulo": "Legenda", "texto": (2200)}],
          "roteiro": [{"cena": "Cena 1, uns 8 s", "tela": (160), "fala": (300)}],
          "passos": [(220), ...]
        }
      ]
    }

`node tools/pauta/pauta.cjs . AAAA-MM-DD` confere tamanhos, separadores e moeda e gera a página do dia, a lista de dias e o calendário. Links de arquivos sempre pelo site, para o Paulo baixar direto no celular.

## Juntar a narração (quando o Paulo mandar os áudios ou os vídeos)

Em qualquer conversa com acesso ao repositório:
1. Na pasta de trabalho (`tools/REGRAS.md`), salve os áudios ou vídeos em `/tmp/fdm/`, na ordem das cenas, e rode `node tools/pauta/tiktok.cjs . AAAA-MM-DD --narrar /tmp/fdm/cena_1.mov /tmp/fdm/cena_2.m4a ...` (um por cena). Cada arquivo pode ser áudio ou vídeo: na cena `rosto`, o vídeo entra na tela (cortado para a vertical, com as cores do HDR do iPhone corrigidas e o título por cima); nas outras cenas, só a voz é usada. Cada cena dura o tempo da fala, com o silêncio das pontas cortado e o volume no padrão das redes. Se o roteiro tiver `ganchoB`, o áudio `cena_1b` vai por último; sem ele, a versão de teste usa a fala da cena 1.
2. No `pauta/AAAA-MM-DD/pauta.json`, troque o arquivo do aviso `tiktok` por `https://fontedemana.com.br/pauta/AAAA-MM-DD/tiktok/tiktok-narrado.mp4` e, se existirem, o do aviso `reels` pelo mesmo link e o do `reels-teste` por `.../tiktok/tiktok-teste-narrado.mp4` (tire dos passos a linha que manda pôr música no vídeo mudo). Rode `pauta.cjs`, envie e mande o link ao Paulo.
