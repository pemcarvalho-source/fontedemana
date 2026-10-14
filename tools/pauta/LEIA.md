# Pauta de postagem e conteúdo original da Fonte de Mana

A pauta diz ao Paulo, na hora certa, **em qual rede postar, o que postar, o texto pronto e o roteiro de gravação**. Chega ao celular pela mensagem da tarefa, pelo calendário com alarmes `https://fontedemana.com.br/pauta/agenda-fdm-7q2k9.ics` (alarme 5 minutos antes) e pela página do dia `https://fontedemana.com.br/pauta/AAAA-MM-DD/`.

Leia antes `tools/REGRAS.md`. A estratégia (notícia + original, força do dia, grade e pilares) está em `tools/conteudo/ESTRATEGIA.md`; a parte que os scripts usam, em `tools/conteudo/plano.json`.

## Quem faz o quê

| Hora | Tarefa | Faz |
| --- | --- | --- |
| 18:21 | Noite | Conteúdo original de amanhã: TikTok narrado, carrossel original e post de debate do Threads, mais os avisos de gravação e do TikTok |
| 5:55 | Jornal | Edição, site e Kit de Redes, com a força do dia no kit (`tools/jornal/LEIA.md`) |
| 7:20 | Manhã | `node tools/pauta/manha.cjs . HOJE` monta o resto da pauta sozinho |

Escreva só na pasta `pauta/`. Nunca chame ferramenta paga do vidIQ, nunca publique no artifact do jornal e nunca mexa em tarefas agendadas.

## Tarefa da noite: original de amanhã (18h21)

1. Clone (regras em `tools/REGRAS.md`) e trabalhe dentro de `./gh`. AMANHA = `TZ=America/Sao_Paulo date -d tomorrow +%F`.
2. Rode `node tools/conteudo/contexto.cjs . AMANHA`. Ele mostra o pilar de amanhã (o que fazer, fontes, gancho, pergunta), os próximos itens da fila do pilar e a lista de tudo o que já foi publicado. É a única leitura necessária para não repetir: não abra pautas e edições antigas.
3. Escolha o tema. **Conteúdo nunca se repete**: nada da lista do contexto (mesma notícia, carta, termo ou anúncio, nem com outro ângulo). Use o pilar do contexto e, se houver fila, o primeiro item livre que tenha fontes boas. Exceção: anúncio oficial da Wizards publicado depois das 6h de hoje (ban, Game Changers, regra, produto de Commander) que não esteja na lista vira o tema do TikTok; nesse caso o carrossel original pode ser pulado.
4. Pesquise: no máximo 8 buscas na web, mais as páginas do EDHREC, do Commander Spellbook e do Scryfall que o pilar pedir. Tudo com base em cartas, regras e fatos que existem, com as regras de verificação. Cotação: use o `fx` da edição mais recente (`data/edN.js`) se tiver até 4 dias; senão, a regra de moeda.
5. Imagens pelo Scryfall: `art_crop` em `pauta/AMANHA/tiktok/arte.jpg` e `large` em `pauta/AMANHA/tiktok/carta.jpg`. Para telas do carrossel com carta (Top 5, Deck, Combo, História), `image_uris.normal` em `pauta/AMANHA/original/carta-1.jpg`, `carta-2.jpg`... Prefira a impressão de moldura comum, não a serializada nem a showcase. Nunca grave em `img/`.
6. Escreva `pauta/AMANHA/tiktok/roteiro.json` (formato abaixo) e rode `node tools/pauta/tiktok.cjs . AMANHA` (timeout 600000 ms). Se der `ERROS:`, encurte o texto apontado e rode de novo, até 4 vezes. Abra com Read a cena 1 e a cena de lista.
7. Escreva `pauta/AMANHA/original/original.json` (formato abaixo) e rode `node tools/conteudo/original.cjs . AMANHA`. Mesma regra de correção, até 4 vezes. Abra com Read a capa e uma tela com carta. Se não sair, siga sem ele: a manhã usa o carrossel do jornal.
   - Os três formatos tratam do mesmo tema, mas não são a mesma peça: o TikTok conta e explica em voz; o carrossel é a versão para salvar (lista, ranking, passo a passo, com uma carta por tela quando fizer sentido); o Threads é a pergunta ou o debate que puxa comentários.
8. Escreva ou atualize `pauta/AMANHA/pauta.json` com dois avisos (mantenha outros que já existirem):
   - `gravacao`: dia = hoje, hora 18:30, rede Gravação, titulo "Gravar a narração do TikTok de amanhã", `roteiro` com uma linha por cena (cena "Cena 1, uns 8 s", tela = o texto da cena, fala = a narração), arquivo do vídeo mudo e os passos: gravar um áudio por cena no Gravador do iPhone, num lugar silencioso, com o celular a um palmo da boca; nomear cena_1, cena_2...; mandar os áudios ao Claude no projeto MGT strategy (pode ser respondendo à mensagem desta tarefa) dizendo "áudios do TikTok de AAAA-MM-DD".
   - `tiktok`: hora 11:30, rede TikTok, arquivo `tiktok-narrado.mp4` (se já existir) ou o mudo, textos Legenda e Comentário fixado, passos: postar com som em alta entre 15% e 20% pela biblioteca do TikTok, voz própria não precisa de rótulo de IA, fixar o comentário; se os áudios não chegarem, postar o vídeo mudo com música em alta.
9. Rode `node tools/pauta/pauta.cjs . AMANHA`. Envie (`git add pauta`, commit "Pauta de AMANHA: original e gravação") e, uns 2 minutos depois, confira com WebFetch `https://fontedemana.com.br/pauta/AMANHA/`.
10. Mensagem final, curta: "Gravação para amanhã (AMANHA): <pilar>, <tema>", o roteiro cena a cena (segundos e fala), o link do vídeo mudo, o link da página, se o carrossel original saiu (quantas telas) e como mandar os áudios. Se algo falhou, o erro exato.

Sábado com visita marcada (`extras/lojas/AMANHA.json`, pilar Rota das Lojas): o Paulo grava na loja. Não há vídeo nem carrossel para gerar: faça o roteiro como lista do que filmar e pule os passos 6 e 7 (o aviso `tiktok` aponta para o que ele gravar).

## Formato do `pauta/AAAA-MM-DD/tiktok/roteiro.json`

    {
      "data": "AMANHA",
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
        "cta": {"pergunta": (70, pode ter <b>), "quando": (60), "salvar": motivo para salvar ou mandar (70)}
      },
      "legenda": legenda do Instagram (1800): primeira linha com o gancho e palavras de busca (Commander, deck, carta de Magic, o tema), fontes, link fontedemana.com.br, pergunta e hashtags. Sem o aviso de Fan Content (a pauta põe).
      "threads": {"texto": post de debate, texto puro (450), "obs": dica de enquete (120) ou null},
      "enquete": {"pergunta": (80), "opcoes": [(25), (25)]}      (2 a 4 opções; sticker dos Stories das 12:00 no dia calmo)
    }

## Tarefa da manhã: pauta do dia (7h20)

Só script, sem escrever texto novo:
1. Clone. HOJE = `TZ=America/Sao_Paulo date +%F`.
2. `node tools/pauta/manha.cjs . HOJE`. Se o resumo disser que a edição ou o kit de hoje ainda não saíram, `sleep 600`, `git pull --rebase --depth 50 origin main` e rode de novo, no máximo 3 vezes; depois siga com o que tiver.
3. Se aparecer `ERROS:` num texto vindo do kit ou do original, corrija esse texto direto em `pauta/HOJE/pauta.json` e rode `node tools/pauta/pauta.cjs . HOJE` (não rode o manha.cjs de novo, ele refaz o arquivo).
4. `git add pauta`, commit "Pauta de HOJE" e push. Uns 2 minutos depois, WebFetch `https://fontedemana.com.br/pauta/HOJE/`.
5. Mensagem final: o resumo que o script imprime depois de `---`.

O script decide o feed pela força do dia (`pauta.forca` do kit): dia forte, carrossel do jornal; dia calmo, carrossel original (ou o mais recente do banco, de até 6 dias, que não foi para o feed). Também apaga `.jpg` e `.mp4` de pastas da pauta com mais de 7 dias.

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
          "rede": "TikTok",                     (Threads, Instagram feed, Instagram Stories, TikTok, Reels ou Gravação)
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

## Juntar a narração (quando o Paulo mandar os áudios)

Em qualquer conversa com acesso ao repositório:
1. Clone, salve os áudios na ordem das cenas e rode `node tools/pauta/tiktok.cjs . AAAA-MM-DD --narrar cena_1.m4a cena_2.m4a ...` (um por cena). Cada cena dura o tempo da fala, com o silêncio das pontas cortado e o volume no padrão das redes.
2. No `pauta/AAAA-MM-DD/pauta.json`, troque o arquivo do aviso `tiktok` por `https://fontedemana.com.br/pauta/AAAA-MM-DD/tiktok/tiktok-narrado.mp4`, rode `pauta.cjs`, envie e mande o link ao Paulo.
