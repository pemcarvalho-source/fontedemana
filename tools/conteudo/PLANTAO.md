# Plantão da Fonte de Mana

O plantão cobre um anúncio grande **no mesmo dia em que ele sai**: lista de precon, banimento, produto com preço, painel de evento. O próprio Instagram recomenda ser o primeiro a postar sobre acontecimentos, e o jornal só conta a notícia na manhã seguinte. O plantão entrega, em menos de uma hora depois do anúncio:

- um carrossel curto (capa, 2 a 4 telas e a chamada final) para o feed do Instagram;
- as mesmas imagens no modo foto do TikTok;
- um post do Threads com a capa;
- o repost nos Stories com enquete.

Tudo vira avisos `plantao-*` na pauta do dia (`pauta/HOJE/pauta.json`), com página e calendário, como o resto da pauta. Quem posta é o Paulo.

## Quem marca

Cada plantão é um evento em `tools/conteudo/plano.json` > `plantao.eventos` (dia, hora da primeira busca, `ate`, tipo, o que confirmar e onde buscar) e uma tarefa agendada avulsa, que dispara na `hora` e roda a fase `plantao` do orquestrador. A revisão de segunda propõe os próximos a partir da agenda do jornal; com a aprovação do Paulo na conversa, ela acrescenta o evento ao `plano.json` e cria a tarefa (`tools/conteudo/REVISAO.md`, seção 8). O Paulo também pode pedir um plantão avulso numa conversa do projeto: nesse caso o `evento` do `plantao.json` é `"avulso"`.

Só entra anúncio com data marcada e fonte primária (Wizards). Rumor, vazamento e "dizem que" nunca viram plantão.

## Passo a passo

1. **Qual é o plantão**: `node tools/conteudo/plantao.cjs . HOJE --qual`. Ele mostra o evento, a busca, o que confirmar, até que horas tentar e o molde do tipo. Saiu `SEM PLANTÃO`: termine dizendo isso. Saiu `JÁ FEITO`: termine dizendo isso, sem refazer.
2. **Conferir que o anúncio saiu**: WebSearch com a busca e o `allowed_domains` que o `--qual` mostrou; WebFetch no link exato que voltou e confira o que a linha "Está no ar quando" pede. Ainda não saiu? Espere 20 minutos (`sleep 600` duas vezes) e abra de novo o mesmo link (ele veio da busca desta execução; o WebFetch guarda a página por 15 minutos). Repita até a hora `ate` (`TZ=America/Sao_Paulo date +%H:%M`). Chegou a `ate` sem anúncio: termine com "O anúncio <evento> ainda não saiu até HH:MM; nada para postar", sem enviar nada.
3. **Fatos**: só o que está na fonte primária, mais o Scryfall para dados e imagens de carta e o EDHREC se precisar de número de decks. Preço em dólar do Scryfall ou do MTGStocks vale sozinho; cotação pelo `fx` da edição mais recente (`data/edN.js`) se tiver até 4 dias, senão a regra de moeda de `tools/REGRAS.md`. No máximo 6 buscas além da confirmação. Sem preço confiável, sem preço.
4. **Imagens** (Scryfall, como em `tools/REGRAS.md`): `art_crop` da carta da capa (o comandante, a carta banida, a carta principal do produto) em `pauta/HOJE/plantao/arte.jpg`; `image_uris.normal` das cartas das telas em `pauta/HOJE/plantao/carta-1.jpg`, `carta-2.jpg`. Carta recém-revelada pode não estar no Scryfall ainda: siga sem a imagem dela (tela só com itens). Abra cada imagem com Read.
5. **Escrever** `pauta/HOJE/plantao/plantao.json` (formato abaixo), seguindo o molde do tipo que o `--qual` mostrou, e rodar `node tools/conteudo/plantao.cjs . HOJE` (timeout 300000 ms). Ele confere tamanhos, separadores, tags, moeda, hashtags e isca de engajamento, gera as imagens e põe os avisos na pauta: Threads agora mais 5 minutos, feed 5 minutos depois, TikTok mais 5 e Stories 20 minutos depois do TikTok. Deu `ERROS:`? Corrija o texto apontado e rode de novo, até 4 vezes. Abra com Read a capa e uma tela.
6. **Enviar**: `git add pauta`, commit "Plantão de HOJE: <tema curto>", push e conferência pelo GitHub, como no orquestrador. O arquivo que confirma é `pauta/HOJE/plantao/carrossel-01.jpg`.
7. **Mensagem final**: a primeira linha diz "Plantão pronto para postar agora: <tema>"; depois o resumo que o script imprimiu depois da linha `---` (horários, redes e a página) e a fonte. Se algo falhou, a etapa e o erro exato.

Tipo `ban` sem mudança no Commander (nem em Game Changers): não faça carrossel. Termine com "Sem mudança no Commander no anúncio de hoje" e o texto pronto de um post do Threads (até 450 caracteres, com o link da fonte em palavras e fontedemana.com.br), sem enviar nada ao repositório.

## Regras do conteúdo

Valem `tools/REGRAS.md` e as regras de legenda de `plano.json` > `legenda`. Específicas do plantão:

- **O fato primeiro.** Capa com o que saiu, em português de mesa: "O precon dos Borg inteiro", "Saiu o ban de novembro". No chip, a série que o `--qual` mostrar (ex.: "Precon Star Trek 1/4") ou "Saiu agora".
- **Primeira linha da legenda**: o nome do evento ou do produto e o fato mais importante. Depois 2 ou 3 linhas curtas, a pergunta aberta, "Amanhã às 6h, a edição completa em fontedemana.com.br" e 3 hashtags (a do assunto, #commander e #mtg).
- **Pergunta aberta, nunca isca**: "Qual comandante você jogaria?", "Quem você acha que sai no próximo ban?". Nada de "comenta", "marca quem" ou "manda pro amigo" (o script recusa).
- **Fonte na tela**: o `fonte` de cada tela diz de onde veio (ex.: "Fonte: Wizards, 26 out").
- **Nada de opinião como fato.** "Parece forte" e "deve subir de preço" só como leitura da Fonte de Mana, nunca como notícia.
- **Threads**: o fato em até 450 caracteres, uma pergunta curta e "Amanhã às 6h, a edição completa em fontedemana.com.br". O script põe o aviso de Fan Content (o post vai com a capa).
- **Enquete dos Stories**: pergunta curta sobre o anúncio, 2 a 4 opções de até 25 caracteres.
- **No dia seguinte**: o jornal cobre o mesmo anúncio no site e no kit, mas, como ele já foi para o feed no plantão, conta como desdobramento na força do dia (o `contexto.cjs` lista os plantões).

## Formato do `pauta/HOJE/plantao/plantao.json`

Números entre parênteses são o máximo de caracteres (sem contar as tags).

    {
      "data": "HOJE",
      "evento": id do evento em plano.json > plantao.eventos, ou "avulso",
      "tipo": "lista", "ban", "produto" ou "evento",
      "tema": (80),
      "fonte": {"nome": "Wizards of the Coast" (60), "url": link https da página que confirmou o anúncio},
      "cartas": ["Nome da carta", ...],              (todas as citadas, para não repetir depois)
      "fx": "Valores em reais pela cotação de 21 out (Banco Central, PTAX)." ou null,
      "carrossel": {
        "capa": {"cor": "G", "chip": (22), "kicker": "Saiu agora" (40), "titulo": (60, pode ter <b>), "sub": (150, pode ter <b>),
                 "arte": "pauta/HOJE/plantao/arte.jpg" ou null, "credito": "Arte: <carta>, <artista>" (80)},
        "cartoes": [                                  (2 a 4 telas)
          {"cor": "G", "titulo": (34), "carta": "pauta/HOJE/plantao/carta-1.jpg" (opcional),
           "itens": [{"cor": "G", "html": (120)}],      (2 a 4; com carta, 1 ou 2 e sem nota)
           "nota": {"rotulo": (24), "texto": começa em minúscula (95)} (opcional),
           "fx": nota curta da cotação na tela (110, opcional),
           "fonte": "Fonte: Wizards, 26 out" (70)}
        ],
        "cta": {"pergunta": pergunta aberta (70), "quando": "Amanhã às 6h, a edição completa" (60), "salvar": motivo para guardar (70)}
      },
      "legenda": (1800) com fontedemana.com.br e no máximo 3 hashtags, sem o aviso de Fan Content (o script põe),
      "threads": {"texto": (450) com fontedemana.com.br},
      "enquete": {"pergunta": (80), "opcoes": [(25), (25)]}
    }

Cores: W Brasil e eventos, U regras, B ban, R polêmica, G novidade e lançamento, A bolso e preço, M multicolor. Com valor convertido, todo dólar leva o real entre parênteses e a legenda termina com o texto de `fx`.
