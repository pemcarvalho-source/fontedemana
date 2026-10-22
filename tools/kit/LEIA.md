# Kit de Redes do Fonte de Mana

O kit de cada edição sai de `kit/edN/kit.json`, escrito a partir da edição do dia (`data/edN.js`). O script `tools/kit/gerar.cjs` lê esse arquivo e gera:

- `kit/edN/carrossel-01.jpg` em diante (Instagram, 1080x1350)
- `kit/edN/video-vertical-edN.mp4` (Reels, 1080x1920, 48 s, sem som)
- `kit/edN/index.html` e `kit/index.html` (a página fontedemana.com.br/kit, escondida do Google)

A pauta da manhã (`tools/pauta/manha.cjs`) pega os textos e arquivos do kit e monta os avisos de postagem. Por isso o kit só tem o que é postado de verdade.

## Como rodar

    node tools/kit/gerar.cjs <raiz do repositório> N

Confere tamanhos, cores, tags e separadores, e mede se algum texto passa da borda das imagens ou da área segura do vídeo. Se aparecer `ERROS:`, encurte o texto apontado e rode de novo. O vídeo leva uns 2 minutos. Opções: `--sem-video` (só carrossel e páginas) e `--pagina` (só refaz as páginas). O script acha sozinho o Chromium, o Playwright e o ffmpeg.

## Regras de conteúdo

Valem as regras de `tools/REGRAS.md`. Específicas do kit:

- Só fatos que estão na edição do dia, com os mesmos números, datas e fontes. Nada de dado novo, estimativa ou conversão nova: os valores em reais são os da edição.
- Moeda: no `valor` das linhas de preço (máximo 8) e no `numero` animado do vídeo vai só o dólar; o real vai no `sub`. Sem `fx` na edição, só dólar e nenhuma nota.
- Nota da cotação: nas imagens, no fim do `fonte` do cartão e da cena 2 do vídeo (ex.: "Fonte: Wargamer. Reais: cotação BCE de 9 out") e, no Topdeck, no fim do `extra`. Nas legendas e nos posts com valor convertido, uma linha no fim: "Valores em reais pela cotação de 9 out (Banco Central Europeu)." No fio do Threads, uma vez só, no último post.
- Rumor só como rumor (campo `sussurro`), dizendo que não foi confirmado.
- Cores: W (Brasil, lojas, eventos, datas), U (deck e regras), B (ban), R (polêmica), G (novidade e lançamento), A (bolso e preço), M (Topdeck e multicolor).
- O aviso de Fan Content entra sozinho (legendas, fio e posts com mídia). Não escreva o aviso no kit.json.
- Imagens: `img/edN-art.jpg` (capa e cena 1) e `img/edN-card.jpg` (Topdeck). Sem elas, o script usa a arte do terreno da cor da capa.

## Formato do kit.json

Números entre parênteses são o máximo de caracteres (sem contar as tags).

    {
      "n": 7,
      "data": "12 out",                                  (12)
      "carrossel": {
        "capa": {"cor": "A", "titulo": (52), "sub": (150, pode ter <b>), "credito": "Arte: <carta>, <artista>" (80)},
        "cartoes": [                                      (1 a 3 cartões, um por manchete)
          {"cor": "A", "titulo": (34),
           "itens": [{"cor": "G", "html": (120)}],          (2 a 4 itens) OU
           "linhas": [{"nome": (34), "valor": "+565%" (8), "sub": "foi a US$ 4,59" (36), "porque": (70, opcional)}],  (1 a 3, para preços)
           "nota": {"rotulo": "No seu bolso" (16), "texto": começa em minúscula (95)},   (opcional)
           "fonte": "Fontes: ..." (70)}
        ],
        "topdeck": {"titulo": nome da carta (40),
                    "habilidades": [{"rotulo": (28), "texto": (80)}],   (2 a 3)
                    "extra": (150, pode ter <b>), "credito": "Ilustração de <artista>" (60)},
        "ban": {"numero": "1", "unidade": "DIA" ou "DIAS", "texto": (140)} ou null,
        "turnos": [{"cor": "B", "data": "12 out" (12), "texto": (40)}],     (0 a 5, da agenda)
        "sussurro": (150) ou null
      },
      "video": {
        "cena1": {"titulo": (52), "pilulas": [(24), ...]},                 (1 a 3 pílulas)
        "cena2": {"rotulo": "No bolso" (20), "cor": "A", "titulo": (40),
                  "linhas": [{"nome": (22), "numero": 565, "prefixo": "+", "sufixo": "%", "sub": (30)}],  (1 a 2, número inteiro animado) OU
                  "itens": [(70), ...],                                     (1 a 3 frases, quando não houver número)
                  "fonte": (60)},
        "cena3": {"linhas": [(60), ...]},                                   (2 a 3 frases sobre o Topdeck, pode ter <b>)
        "cena4": {"texto": (110), "sussurro": (90) ou null}
      },
      "textos": {
        "legendaCarrossel": legenda do Instagram com o link fontedemana.com.br, créditos das artes e hashtags (1800),
        "legendaVideo": legenda do Reels com o link e uma pergunta para os comentários (1500),
        "threadsPost": a notícia do dia inteira num post só, com o link fontedemana.com.br (480),
        "threadsFio": [(480), ...],                                         (3 a 8 posts, o último leva o link)
        "threadsAvulsos": [{"titulo": (40), "texto": (480), "obs": (120, opcional)}]   (1 ou 2; o primeiro é a pergunta do dia)
      },
      "pauta": {
        "forca": "forte" ou "calmo",
        "porque": (120) motivo da força do dia,
        "storyPergunta": (80) texto do sticker de pergunta na capa (Stories das 10:30),
        "enquete": {"pergunta": (80), "opcoes": [(25), (25)]}          (2 a 4 opções; Stories das 12:00 quando o feed é o jornal)
      }
    }

`textos.narracao`, `textos.threadsCarrossel` e `textos.threadsVideo` não são mais postados e não precisam ser escritos. Se aparecerem, o script ainda confere e mostra na página.

O primeiro `threadsAvulsos` é a pergunta do Threads das 10:30 nos dias fortes: curta, ligada à Notícia Lendária e, quando der, com `obs` dizendo as opções de enquete.

## Como o vídeo se organiza

- Cena 1, de 0 a 13 s: arte da Notícia Lendária, título e pílulas.
- Cena 2, de 13 a 21 s: o assunto de bolso (ou a segunda manchete) com números que sobem.
- Cena 3, de 21 a 32 s: a carta do Topdeck e 2 ou 3 frases.
- Cena 4, de 32 a 41 s: contagem para o ban (se `carrossel.ban` existir) ou os 3 primeiros turnos da agenda, mais o texto e o sussurro.
- Cena 5, de 41 a 48 s: chamada final fixa para o site e o @fontedemana.

## Threads

Até 500 caracteres por post. O fio (`threadsFio`) conta a edição em 3 a 8 posts só de texto; o último leva o link do site e, se houver valor convertido, a nota da cotação. O aviso de Fan Content entra como post final, sozinho.

`threadsPost` é o que vai ao ar no Threads das 15:00 a partir de 26/10/2026: a Notícia Lendária inteira num post só (até 480 caracteres), começando pelo fato, com o número que importa, uma pergunta curta para responder e o link `fontedemana.com.br` no fim. Se houver valor convertido, a nota da cotação vai no mesmo post. Nos fios, quase ninguém passava do primeiro post, por isso a notícia não se divide mais. O fio continua no kit para a página.

## Legendas

No máximo 3 hashtags por legenda, no fim (a partir de 26/10/2026 a pauta corta o que passar). A primeira linha leva a palavra de busca (Commander, carta de Magic e o assunto) e o gancho.

## Quando a cena 2 não tem preço

Use `itens` na cena 2 com a segunda manchete e troque o `rotulo` (por exemplo "Novidade", com cor G).
