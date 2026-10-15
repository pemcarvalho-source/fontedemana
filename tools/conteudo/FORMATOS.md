# Formatos de conteúdo da Fonte de Mana

Versão 1, 15 out 2026. Nasceu das gravações de criadores que o Paulo mandou como inspiração (registro no fim). A tarefa da noite lê este arquivo quando o `contexto.cjs` mostra uma linha **Formato**. O pilar diz o assunto; o formato diz o molde da peça em cada rede.

**Regra de ouro:** a referência inspira o molde, nunca o conteúdo. Não copiar roteiro, frase, piada, tema, arte nem o visual de outro criador. Toda peça usa fatos próprios conferidos com `tools/REGRAS.md` e o visual da Fonte de Mana.

## O que as referências ensinam (vale para qualquer pilar)

- **Pergunta com letras puxa comentário.** Quem vê responde A, B ou C antes da resposta aparecer. Comentário é o sinal que mais empurra o alcance.
- **Tensão tela a tela.** No carrossel, cada tela deixa uma dúvida que obriga a arrastar ("Então é só pôr mais?" e na tela seguinte "Calma."). Uma ideia por tela.
- **Número que assusta na capa.** Uma porcentagem, um preço ou uma contagem no título.
- **Série com nome e número**, e de vez em quando um "lembra do..." que liga a um post anterior da própria Fonte de Mana.
- **Pedido de envio com destinatário.** Em vez de "compartilhe", dizer para quem: "manda pro seu parceiro de mesa que joga com 33 terrenos".
- **A carta de verdade na tela.** A imagem da carta (Scryfall) ocupa o centro; o texto explica o que ela faz na mesa.
- **Legenda em linhas curtas** com os dados duros primeiro (bracket, preço, arquétipo) e o resto depois.
- **Humor de situação reconhecível.** A piada é sobre o que acontece na mesa, ligada a uma regra ou carta real. Nunca sobre pessoa real, loja, criador, aparência, gênero ou qualquer grupo.

## Formatos com ferramenta pronta

### Chama o Juiz (pilar `regra`)

Quiz de regra. A situação em uma frase, a pergunta, 3 respostas, 5 segundos de contagem e a resposta com o número da regra.

- **Respostas erradas plausíveis**: o que a mesa costuma achar. Só uma certa, e a letra certa varia de um episódio para o outro (não deixe sempre na A). Confirme nas Regras Abrangentes e cite o número na `fonte` da cena resposta.
- **TikTok** (`roteiro.json`): 4 cenas.

      {"tipo": "gancho", "cor": "U", "chip": "Chama o Juiz #1", "kicker": (40), "titulo": a situação (64), "narracao": ...}
      {"tipo": "quiz", "cor": "U", "chip": "Valendo", "kicker": "Chama o Juiz", "titulo": a pergunta (64),
       "opcoes": ["texto A" (40), "texto B", "texto C"], "contagem": 5,
       "narracao": a pergunta lida e "comenta A, B ou C, você tem cinco segundos"}
      {"tipo": "resposta", "cor": "U", "chip": "Resposta", "kicker": "Chama o Juiz", "titulo": o veredito curto (64),
       "opcoes": as mesmas do quiz, na mesma ordem, "certa": "A", "sub": o porquê (140),
       "fonte": "Regras Abrangentes, <número>", "narracao": "Letra A. ..."}
      {"tipo": "cta", ...}

  A cena quiz ganha sozinha a contagem de 5 a 1 com "Comenta: A, B ou C?" depois da fala. Na gravação, o Paulo lê a pergunta e para; o silêncio da contagem já está no vídeo.
- **Carrossel**: capa com a situação; tela com a pergunta e as três opções nos itens (`<b>A)</b> ...`), com a nota pedindo a letra nos comentários antes de arrastar; tela com a resposta e a regra; tela com a carta envolvida e o erro comum. CTA final: "acertou de primeira? manda pra quem erraria".
- **Threads**: a pergunta com as três opções, pedindo a letra nos comentários. Em `obs`, a resposta em uma frase para o Paulo responder no próprio post à tarde.

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

- **TikTok**: gancho "toda mesa de Commander tem um..."; 2 cenas texto com as frases; cena com a carta e a dica; CTA "marca o amigo".
- **Carrossel**: um tipo só em passos, ou quatro tipos com uma carta cada.
- **Threads**: "qual desses mais aparece na sua mesa?" com opções.

## Formatos dos pilares que já existiam

- **Top 5**: uma carta por tela com imagem, decks no EDHREC e preço; número no título da capa; CTA com motivo para salvar.
- **Deck em 40 segundos**: sempre o bracket esperado, o preço aproximado e o plano em três passos.
- **Debate**: os dois lados com o mesmo espaço; a enquete mostra as duas opções frente a frente.

## No jornal

- **Topdeck do Dia**: além de variar cor, tipo e raridade, alterne o perfil da carta na semana: staple conhecida, carta nova, carta antiga com história e um Lado B (pouco jogada no EDHREC, mas forte no papel dela).
- **Produtos licenciados** (joias, roupas, acessórios oficiais de Magic) entram como notícia quando têm data e fonte primária, na cor W ou G conforme o assunto.

## Ideias que esperam ferramenta ou o Paulo

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
