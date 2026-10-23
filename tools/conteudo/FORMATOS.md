# Formatos de conteúdo da Fonte de Mana

Versão 2, 16 out 2026. Nasceu das gravações de criadores que o Paulo mandou como inspiração (registro no fim). A tarefa da noite lê este arquivo quando o `contexto.cjs` mostra uma linha **Formato**. O pilar diz o assunto; o formato diz o molde da peça em cada rede.

**Regra de ouro:** a referência inspira o molde, nunca o conteúdo. Não copiar roteiro, frase, piada, tema, arte nem o visual de outro criador. Toda peça usa fatos próprios conferidos com `tools/REGRAS.md` e o visual da Fonte de Mana.

## O que as referências ensinam (vale para qualquer pilar)

- **Pergunta com letras puxa comentário.** Quem vê responde A, B ou C antes da resposta aparecer. Comentário é o sinal que mais empurra o alcance. A tela mostra as opções e pergunta "qual é a certa?"; desde 26 out a fala não manda comentar (ver "Pergunta aberta" abaixo).
- **Tensão tela a tela.** No carrossel, cada tela deixa uma dúvida que obriga a arrastar ("Então é só pôr mais?" e na tela seguinte "Calma."). Uma ideia por tela.
- **Número que assusta na capa.** Uma porcentagem, um preço ou uma contagem no título.
- **Série com nome e número**, e de vez em quando um "lembra do..." que liga a um post anterior da própria Fonte de Mana.
- **O compartilhamento vem do conteúdo, não do pedido.** A peça é identificável ("é o meu amigo", "sou eu") ou útil para guardar. Desde 26 out 2026, nada de "manda pro amigo que...": o Instagram não recomenda peça que pede envio, marcação ou comentário combinado.
- **A carta de verdade na tela.** A imagem da carta (Scryfall) ocupa o centro; o texto explica o que ela faz na mesa.
- **Legenda em linhas curtas** com os dados duros primeiro (bracket, preço, arquétipo) e o resto depois.
- **Humor de situação reconhecível.** A piada é sobre o que acontece na mesa, ligada a uma regra ou carta real. Nunca sobre pessoa real, loja, criador, aparência, gênero ou qualquer grupo.
- **A tensão do tema numa frase, numa tela só.** Ex.: "o comandante quer uma coisa, o deck entrega outra". É a tela que a pessoa lembra e manda para os amigos.
- **Um dado duro em destaque.** Custo médio de mana, porcentagem, número de decks no EDHREC: um número grande na tela, com a fonte embaixo.
- **Pergunta aberta, com as opções na tela.** "Qual entra no seu deck?" com as duas cartas escritas. Nunca "comenta X ou Y", "comenta a letra", "marca quem" ou "segue para a parte 2": o Instagram trata como isca de engajamento e deixa de recomendar a peça, e diz que pergunta aberta é bem-vinda.
- **Arte de carta, não arte gerada.** O Instagram marca imagem gerada por IA com o rótulo "AI content". A Fonte de Mana usa a arte das cartas (Scryfall), que é o visual que o Paulo quer.
- **Música que combina com o tema** quando o carrossel vai com música do Instagram (dica para o Paulo na hora de postar).

## Vídeo: o molde de 26 out 2026

A primeira análise das redes (22 out) mostrou que a capa do vídeo prende, mas a maior parte do público vai embora entre o 2º e o 6º segundo, no TikTok e no Reels. A cena 1 ficava uns 8 s parada e a fala abria com estatística. A partir dos roteiros de 26 out, todo vídeo original (TikTok e Reels das 19:00) segue `plano.json` > `video`, e o `tiktok.cjs` confere:

- **20 a 30 s** de fala (Deck e Combo até 45 s), de 3 a 7 cenas curtas.
- **A promessa no primeiro segundo**, na tela e na voz: o resultado, a resposta ou o número que o vídeo entrega ("10 de dano com 5 manas. A ordem importa."). Estatística e contexto depois.
- **Uma ideia por cena**, fala de até 110 caracteres (gancho até 90). O vídeo revela as partes uma de cada vez (título, subtítulo, cada linha, cada opção, cada carta), então nada fica parado mais de 3,5 s.
- **Sem abertura**: nada de vinheta, apresentação ou chamada do site no começo. Site na legenda e no comentário fixado.
- **Final na revelação**. A cta é opcional e curta, uma pergunta aberta ("Qual goblin não sai do seu deck?").
- **Combo**: continua com as cartas, a ordem de jogar e a sequência dos gatilhos, em cenas mais curtas.
- **Reel de teste** (dias em `plano.json` > `testes`): o mesmo vídeo com outro gancho (`ganchoB`), postado só para quem não segue. O gancho que ganhar vira referência para os próximos.

## O que o próprio Instagram recomenda (out 2026)

As melhores práticas de criação do Instagram (Ferramentas profissionais), e como cada uma entra aqui:

- **Reels para chegar a quem não segue**: as contas que mais crescem postam 10 ou mais por mês. A partir de 26 out, o vídeo original vai para o Reels todo dia.
- **Carrossel com texto de contexto na primeira tela**: a capa sempre diz o assunto e o número ou a pergunta que faz arrastar.
- **Os 3 primeiros segundos**: algo engraçado, identificável ou inesperado, e motivo para ficar até o fim. É o molde de 26 out.
- **Ser o primeiro em acontecimentos**: postar no dia, com o nome do evento na primeira linha e na hashtag do assunto.
- **Legenda ligada ao conteúdo, chamando para participar**: a pergunta de uma palavra e o comentário fixado.
- **Local e hashtags relevantes**: a hashtag do assunto entre as 3; a loja marcada como local na Rota das Lojas.
- **Som em alta**: no Reels (por baixo da voz) e no carrossel.
- **Qualidade**: luz boa, 720p ou mais e 30 quadros por segundo (os vídeos da Fonte de Mana saem em 1080x1920 a 30).

As outras abas (Engajamento, Alcance, Reels de teste, Canais, Monetização, Anúncios de parceria e Diretrizes), gravadas pelo Paulo em 23 out:

- **Isca de engajamento**: peça que pede curtida, comentário com palavra combinada, marcação ou envio para inflar o engajamento é mostrada para menos gente. Daí a regra da pergunta aberta (acima) e a frase nova no fim do carrossel do jornal ("Salva para lembrar das datas"). Desde 26 out, o `tiktok.cjs`, o `original.cjs`, o `gerar.cjs` e o `plantao.cjs` recusam esses pedidos (padrões em `plano.json` > `isca`).
- **Identificável a ponto de compartilhar**: "é literalmente eu" é o que faz a pessoa mandar. Humor de mesa e Toda mesa tem um cumprem isso sem pedir.
- **Responder em até 2 dias**: curtir e responder comentários puxa conversa e mais alcance. Aviso diário às 21:30 na pauta, desde 26 out. Comentário e DM viram ideia de tema.
- **Reels de teste**: usar com frequência, com história completa e gancho forte, e com conteúdo novo (Reel de teste de algo que a conta já postou perde alcance). Por isso o Reel de teste sai às 18:40, antes do Reels das 19:00, e o sucesso se mede contra as views de não seguidores dos Reels normais.
- **Marca d'água**: Reel com marca d'água de outro app não é recomendado. O Reels usa o arquivo do site, nunca o vídeo baixado do TikTok.
- **Copiar não**: repostar Reel ou post de outra conta tira a peça da recomendação. Tudo aqui é feito do zero, com a arte da carta creditada.
- **Até 3 minutos**: Reel mais longo não é recomendado (os da Fonte de Mana têm de 20 a 45 s).
- **Alcance varia**: o seguidor cresce no longo prazo. A revisão compara janelas de semana, nunca um dia.
- **Postar quando os seguidores estão ativos**: o horário vem dos Insights e do Metricool (teste do TikTok às 18h).
- **Parceria com criadores e lojas**: post em Collab chega ao público dos dois. Na Rota das Lojas, a loja marcada pode transformar o post em anúncio de parceria, o primeiro contrato possível; para isso, a conta precisa estar ligada a uma Página do Facebook.
- **Monetização**: três caminhos (fãs, marcas e o próprio Instagram); as ferramentas aparecem no painel profissional quando a conta fica elegível.
- **Aparecer na câmera e Canais de transmissão**: o Instagram diz que rosto cria vínculo e que canal com mensagem 3 vezes por semana segura membros. A Fonte de Mana é sem rosto por decisão do Paulo; os dois ficam como proposta, não como regra.

## Formatos com ferramenta pronta

### Chama o Juiz (pilar `regra`)

Quiz de regra. A situação em uma frase, a pergunta, 3 respostas, 5 segundos de contagem e a resposta com o número da regra.

- **Respostas erradas plausíveis**: o que a mesa costuma achar. Só uma certa, e a letra certa varia de um episódio para o outro (não deixe sempre na A). Confirme nas Regras Abrangentes e cite o número na `fonte` da cena resposta.
- **TikTok** (`roteiro.json`): 4 cenas.

      {"tipo": "gancho", "cor": "U", "chip": "Chama o Juiz #1", "kicker": (40), "titulo": a situação (64), "narracao": ...}
      {"tipo": "quiz", "cor": "U", "chip": "Valendo", "kicker": "Chama o Juiz", "titulo": a pergunta (64),
       "opcoes": ["texto A" (40), "texto B", "texto C"], "contagem": 5,
       "narracao": a pergunta lida e "qual é a certa? Cinco segundos"}
      {"tipo": "resposta", "cor": "U", "chip": "Resposta", "kicker": "Chama o Juiz", "titulo": o veredito curto (64),
       "opcoes": as mesmas do quiz, na mesma ordem, "certa": "A", "sub": o porquê (140),
       "fonte": "Regras Abrangentes, <número>", "narracao": "Letra A. ..."}
      {"tipo": "cta", ...}

  A cena quiz ganha sozinha a contagem de 5 a 1 com "A, B ou C?" depois da fala (até 25 out, "Comenta: A, B ou C?"). Na gravação, o Paulo lê a pergunta e para; o silêncio da contagem já está no vídeo.
- **Carrossel**: capa com a situação; tela com a pergunta e as três opções nos itens (`<b>A)</b> ...`), com a nota "pensa na sua antes de arrastar"; tela com a resposta e a regra; tela com a carta envolvida e o erro comum. CTA final: "você teria acertado de primeira?".
- **Threads**: a pergunta com as três opções e "qual é a certa?". Em `obs`, a resposta em uma frase para o Paulo responder no próprio post à tarde.

### Matemática da Mesa (pilar `matematica`)

Uma decisão de deck explicada com a chance real. **Todo número sai de `node tools/conteudo/chance.cjs`**; nunca escreva porcentagem de cabeça.

    node tools/conteudo/chance.cjs --copias 1,5,10 --vistas 7      chance de ter pelo menos 1 na mão inicial
    node tools/conteudo/chance.cjs --copias 3 --vistas 7,10,11     a mesma carta até o turno 3 ou 4
    node tools/conteudo/chance.cjs --terrenos 36,38 --vistas 7 --exato 3

Deck de Commander: 99 cartas no grimório (o comandante fica na zona de comando). Cartas vistas = 7 da mão + 1 por compra. Em mesa de 3 ou mais jogadores ninguém pula a compra do primeiro turno; no 1x1 quem começa pula. Diga sempre que a conta é sem mulligan.

- **Carrossel** (5 telas no meio): capa com a pergunta e o número; o problema ("é só pôr mais?"); a conta em barras; o custo da escolha (vaga no deck, mana, preço); a conclusão prática. Tela de barras:

      {"cor": "U", "titulo": (34), "barras": [{"rotulo": "Só o Sol Ring" (22), "valor": 7.1, "texto": "7,1%" (8)}, ...],
       "destaque": índice da barra da resposta, "itens": [1 ou 2 itens explicando o que as barras medem], "fonte": "Conta hipergeométrica, deck de 99"}

  `valor` e `texto` vêm da linha "Para o carrossel (barras)" que o `chance.cjs` imprime. 2 a 4 barras, sem carta e sem nota na mesma tela.
- **TikTok**: gancho com o número; cena `lista` com as situações e as porcentagens (nome = situação, valor = "31,2%"); cena texto com a conclusão; CTA.
- **Threads**: "chuta antes de abrir: qual a chance de ...?" e a resposta em `obs`.

### Treta das Cores (pilar `treta`)

Esquete sem rosto. Dois personagens, cada um uma cor, discutem uma jogada; a regra de verdade resolve.

- Os personagens são as cores, com o jeito de cada uma no color pie: azul anula tudo e pensa três turnos à frente; verde quer bicho grande e atacar; preto paga qualquer preço; branco tem regra e taxa para tudo; vermelho resolve na pancada e agora.
- **TikTok**: gancho com a fala de mesa que abre a treta; uma cena `texto` por fala (cor da cena = cor de quem fala, `chip` com o nome do personagem, ex. "Azul"); no máximo 3 falas; cena com a regra e a `fonte`; CTA "quem tinha razão?". O Paulo grava as duas vozes mudando o tom; avise isso nos passos da gravação.
- **Carrossel**: o diálogo nos itens, cada item com a cor de quem fala (a bolinha de mana vira o rosto do personagem); tela final com a regra.
- **Threads**: a melhor fala e "você já ouviu isso na mesa?".

### Top 5 Lado B (pilar `ladob`)

Cinco cartas de uma cor que quase ninguém joga no Commander e que funcionam. Mesmo molde do Top 5 (uma carta por tela). A prova de que é lado B é o número baixo de decks no EDHREC; a prova de que funciona é o que ela faz na mesa e com qual comandante brilha. Prefira impressão de moldura antiga quando existir. Chip "Top 5 Lado B".

### Qual entra? (pilar `qualentra`)

Duas cartas, uma vaga. Mesmo papel e custo parecido. Os números lado a lado (decks no EDHREC, preço), quando cada uma ganha e a enquete decide. A Fonte de Mana não escolhe pelo público.

- **TikTok**: gancho com as duas cartas; `lista` com 2 a 3 linhas de comparação (ex.: "Swords, decks" e o número); texto com quando cada uma ganha; CTA "vota nos comentários".
- **Carrossel**: capa com o duelo, uma tela por carta com a imagem, tela de comparação, CTA. **Enquete** dos Stories com o nome das duas.

### Toda mesa tem um (pilar `todamesa`)

Humor de observação sobre tipos de jogador de Commander. Cada peça: as frases que esse tipo sempre diz, a carta que ele adora (real, do Scryfall) e uma dica de etiqueta no fim, para a piada virar conselho.

- **TikTok**: gancho "toda mesa de Commander tem um..."; 2 cenas texto com as frases; cena com a carta e a dica; cta opcional "quem é esse na sua mesa?", sem pedir marcação.
- **Carrossel**: um tipo só em passos, ou quatro tipos com uma carta cada.
- **Threads**: "qual desses mais aparece na sua mesa?" com opções.

## Formatos dos pilares que já existiam

- **Top 5**: uma carta por tela com imagem, decks no EDHREC e preço; número no título da capa; CTA com motivo para salvar.
- **Deck em 40 segundos**: sempre o bracket esperado, o preço aproximado e o plano em três passos.
- **Debate**: os dois lados com o mesmo espaço; a enquete mostra as duas opções frente a frente.

## Datas comemorativas

O `plano.json` tem uma lista `datas` com janelas de dias (Halloween e Dia do Saci, Finados, Sexta-feira 13, Black Friday, Natal, Réveillon, Carnaval, Dia do Gato, Páscoa, Dia das Mães, Dia dos Namorados, Festa Junina, Aniversário do Magic, Dia dos Pais, Dia do Folclore e Dia das Crianças). O `contexto.cjs` mostra a data ativa com o tema, o ângulo para o pilar do dia, buscas prontas no Scryfall e cartas já conferidas.

- **Na janela**: o pilar do dia continua com o seu molde e pega o tema quando couber (um Top 5 de vampiros no Halloween, um Qual entra? de presentes no Natal). Pelo menos uma peça da janela usa o tema.
- **No dia**: TikTok, carrossel e Threads são do tema. Algumas datas trocam o pilar do calendário (`pilarNoDia`): Halloween vira Chama o Juiz de terror, Natal vira Top 5 de Natal, Black Friday vira Bolsa de Mana, Carnaval vira Lore de Rakdos, Páscoa vira Top 5 de coelhos e ovos, Aniversário do Magic vira História de uma carta da Alpha.
- **Sempre**: as cartas citadas existem (confira no Scryfall), o tema não libera repetir carta ou assunto, e datas de luto ou religiosas (Finados, Páscoa) têm tom respeitoso.
- **Datas que mudam de dia** (Carnaval, Páscoa, Black Friday, Mães, Pais, Sexta-feira 13) estão com o ano no `plano.json` e precisam ser renovadas a cada ano.

## No jornal

- **Topdeck do Dia**: além de variar cor, tipo e raridade, alterne o perfil da carta na semana: staple conhecida, carta nova, carta antiga com história e um Lado B (pouco jogada no EDHREC, mas forte no papel dela). Em data comemorativa, prefira uma carta do tema.
- **Produtos licenciados** (joias, roupas, acessórios oficiais de Magic) entram como notícia quando têm data e fonte primária, na cor W ou G conforme o assunto.

## Ideias que esperam ferramenta ou o Paulo

- **Nota da Mesa**: review de precon ou de deck com uma nota própria da Fonte de Mana, de critérios públicos (terrenos, rampa, compra, remoções, board wipes, custo médio de mana e quantas cartas conversam com o comandante) e faixas com nome. Telas: o plano em uma linha e as cores, as melhores cartas, onde é forte, a frase de tensão, onde perde pontos com o custo médio em destaque, a pergunta de uma palavra e a nota. Combina com dia forte de revelação de precon e com os decks do Paulo. Falta um script que classifique as cartas da lista (tags do Scryfall como otag:ramp, otag:draw, otag:removal e otag:board-wipe) e a regra da nota publicada no site.

- **Decks da casa**: os decks reais do Paulo (ex.: Edgar Markov) em carrossel de grade 3x3 com as 99, bracket, preço e o relatório das partidas. Falta o layout de grade no `carrossel.cjs` e a lista do deck em `extras/decks/`.
- **E se fosse carta?**: cartas fan-made com moldura própria da Fonte de Mana (nunca imitando a moldura oficial), em temas de domínio público como o folclore brasileiro (Saci, Curupira, Iara, Boitatá), com a mecânica contando a história. Falta um gerador de carta e arte com crédito; sempre com o aviso de carta não oficial.
- **Do fichário**: foto da carta física na mão do Paulo, sem rosto, com o título por cima. Depende de fotos dele.
- **Mata-mata da semana**: oito cartas de um papel (ex.: mana rocks), uma enquete por dia nos Stories, final no domingo. Falta a sequência de enquetes na pauta da manhã.

## Registro de referências

Uma linha por referência. A análise completa de cada lote fica no projeto MGT strategy (doc `claude/referencias-de-criadores.md`). Números vistos na gravação, na hora em que foi feita.

| Lote | Criador | Formato | Engajamento visto | Virou |
| --- | --- | --- | --- | --- |
| 15 out | edhplay (Reels) | Quiz de regra com cartas animadas, 3 opções, contagem e a regra | sem número visível | Chama o Juiz |
| 15 out | moxemporium (carrossel, 9 telas) | "Magic com matemática": tensão tela a tela, gráfico de chance, CTA para mandar ao parceiro de formato | recém-postado | Matemática da Mesa |
| 15 out | rafaelfanganiello (Reels) | Esquete de uma pessoa em dois papéis, uma cor contra a outra, a piada ensina uma regra | sem número visível | Treta das Cores |
| 15 out | rafaelfanganiello (Stories) | Enquete "vota em quem?" com duas cartas do mesmo artista lado a lado | 67% x 33% | Qual entra?, Debate |
| 15 out | realmboxstore (carrossel) | "5 cartas pretas que você nunca ouviu falar", carta física na mão, série por cor | 1.641 curtidas, 69 comentários, 537 envios | Top 5 Lado B, Do fichário |
| 15 out | commanderlvl17 (carrossel) | Deck completo em grade 3x3, legenda com arquétipo, bracket, preço e plano | 2.225 curtidas, 31 comentários, 378 envios | Deck em 40 segundos, Decks da casa |
| 15 out | dracommander (carrossel) | "E se... fosse Magic": 5 cartas fan-made com a mecânica contando a história | 66 curtidas, 6 comentários | E se fosse carta? |
| 15 out | joeyimitatesart (Reels) | Humor de mesa de Commander ("baseado em fatos reais") | 23,2 mil curtidas, 355 comentários, 7.320 envios | Toda mesa tem um |
| 15 out | rocklovejewelry e Magic (carrossel) | Coleção de joias Mox, cada peça ao lado da carta original, lançamento com data | 2.172 curtidas, 1.122 envios | Produtos licenciados no jornal |
| 15 out | Stories de mtgbrasilofc, moxvault.tcg, magicfinderapp, the_dianatavares | Repost de seguidor, visita à loja, "qual loja vocês indicam?", "Tinder MTG" das cores | sem número visível | Ideias de Stories para a Rota das Lojas |
| 16 out | manafloodedbr (carrossel, 8 telas) | Review de precon com nota própria e faixa: plano, melhores cartas, pontos fortes e fracos, custo médio de mana, frase de tensão, "comente X ou Y"; arte gerada por IA (com rótulo) e música no carrossel | recém-postado | Nota da Mesa (ideia), comentário de uma palavra, dado duro, frase de tensão |
