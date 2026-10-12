# Kit de Redes do Fonte de Mana

O kit de cada edição sai de um arquivo `kit/edN/kit.json` escrito a partir da edição do dia (`data/edN.js`). O script `tools/kit/gerar.cjs` lê esse arquivo e gera:

- `kit/edN/carrossel-01.jpg` em diante (Instagram, 1080x1350)
- `kit/edN/video-vertical-edN.mp4` (Reels, TikTok e Threads, 1080x1920, 48 s, sem som)
- `kit/edN/index.html` e `kit/index.html` (a página fontedemana.com.br/kit, que fica escondida do Google), com os textos para Instagram, TikTok e Threads

## Como rodar

    node tools/kit/gerar.cjs <raiz do repositório> N

O script confere tamanhos, cores, tags e separadores proibidos, e também mede se algum texto passa da borda das imagens ou da área segura do vídeo. Se aparecer `ERROS:`, encurte o texto apontado e rode de novo. O vídeo leva uns 2 minutos.

Opções: `--sem-video` gera só o carrossel e as páginas. `--pagina` só refaz as páginas.

O script acha sozinho o Chromium (`/opt/pw-browsers`), o Playwright (ou instala o `playwright-core` numa pasta temporária) e o ffmpeg. Sem ffmpeg, ele avisa e segue sem o vídeo.

## Regras de conteúdo

- Use só fatos que estão na edição do dia, com os mesmos números, datas e fontes. Nada de dado novo, estimativa ou conversão nova: os valores em reais são os que a edição já traz.
- Moeda: todo valor em dinheiro aparece em dólar, com o valor em reais entre parênteses, igual à edição (exemplo: "US$ 29,99 (R$ 150,10)"). Se a edição não trouxer `fx` (dia sem cotação confiável), fica só o dólar. No `valor` das linhas de preço (máximo 8) e no `numero` animado do vídeo vai só o dólar; o valor em reais vai no `sub`. Na narração, fale o dólar e depois "uns X reais", arredondado.
- Nota da cotação: toda peça com valor convertido leva uma nota curta com a data e a fonte do `fx` da edição. Nas imagens, ela vai no fim do `fonte` do cartão e da cena 2 do vídeo (exemplo: "Fonte: Wargamer. Reais: cotação BCE de 9 out") e, no Topdeck, no fim do `extra`. Nas legendas e nos posts do Threads com valor convertido, entra uma linha no fim: "Valores em reais pela cotação de 9 out (Banco Central Europeu)." Respeite os limites de tamanho; se faltar espaço, encurte a lista de fontes.
- Nunca escreva no kit avisos sobre o funcionamento da rotina, como créditos esgotados, site que não abriu ou imagem que não carregou. Esses avisos vão só na mensagem final da rotina.
- Rumor só aparece como rumor (campo `sussurro`), dizendo que é uma fonte só ou que não foi confirmado.
- Mesmo estilo do jornal: português do Brasil, tom de quem joga Commander, frases curtas, sem fórmulas de IA.
- Nada de " · ", " – ", " — " ou "—". Para intervalos use "6 a 12 nov".
- Só as tags `<b>` e `<i>` nos campos de texto das imagens. Os textos de legenda e de Threads são texto puro.
- Cores: W (branco: Brasil, lojas, eventos, datas), U (azul: deck e regras), B (preto: ban), R (vermelho: polêmica), G (verde: novidade e lançamento), A (artefato: bolso e preço), M (dourado: Topdeck e multicolor).
- O aviso de Fan Content entra sozinho no fim das duas legendas, dos dois posts de Threads com mídia e como último post do fio. Não escreva o aviso no kit.json.
- As imagens vêm de `img/edN-art.jpg` (capa e cena 1) e `img/edN-card.jpg` (Topdeck). Se não existirem, o script usa a arte do terreno da cor da capa.

## Formato do kit.json

Os números entre parênteses são o máximo de caracteres (sem contar as tags). Veja `kit/ed6/kit.json` como exemplo completo.

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
        "legendaVideo": legenda do Reels e TikTok com o link e uma pergunta para os comentários (1500),
        "threadsCarrossel": texto do post do Threads que leva as imagens do carrossel, com o link fontedemana.com.br (280),
        "threadsVideo": texto do post do Threads que leva o vídeo, com o link fontedemana.com.br (280),
        "narracao": [{"cena": "Cena 1, de 0 a 13 s (Notícia Lendária)", "texto": (260)}, ...],   (exatamente 5)
        "threadsFio": [(480), ...],                                         (3 a 8 posts, o último leva o link)
        "threadsAvulsos": [{"titulo": (40), "texto": (480), "obs": (120, opcional)}]   (até 6)
      }
    }

## Como o vídeo se organiza

- Cena 1, de 0 a 13 s: arte da Notícia Lendária, título e pílulas.
- Cena 2, de 13 a 21 s: o assunto de bolso (ou a segunda manchete) com números que sobem.
- Cena 3, de 21 a 32 s: a carta do Topdeck e 2 ou 3 frases.
- Cena 4, de 32 a 41 s: contagem para o ban (se `carrossel.ban` existir) ou os 3 primeiros turnos da agenda, mais o texto e o sussurro.
- Cena 5, de 41 a 48 s: chamada final fixa para o site e o @fontedemana.

A narração tem 5 trechos, um por cena, curtos o bastante para ler no tempo de cada cena.

## Threads

O Threads recebe quatro tipos de conteúdo, todos com até 500 caracteres por post:

- `threadsCarrossel`: post curto que acompanha as imagens do carrossel (o Threads aceita até 20 por post). O aviso de Fan Content entra no fim, então o texto tem no máximo 280 caracteres.
- `threadsVideo`: post curto que acompanha o vídeo, com o mesmo limite.
- `threadsFio`: 3 a 8 posts em sequência contando a edição, só texto. O último leva o link do site.
- `threadsAvulsos`: até 6 posts soltos para espalhar ao longo do dia, como uma pergunta para a comunidade, uma dica de regra, um preço, a agenda ou um sussurro (sempre dizendo que é rumor). Use `obs` para uma dica de como postar, por exemplo virar enquete.

## Quando a cena 2 não tem preço

Se o dia não tiver manchete de preço, use `itens` na cena 2 com a segunda manchete e troque o `rotulo` (por exemplo "Novidade", com cor G).
