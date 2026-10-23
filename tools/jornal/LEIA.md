# Jornal diário da Fonte de Mana (tarefa das 5h55)

Publica a edição de hoje no site fontedemana.com.br e gera o Kit de Redes. Leia antes `tools/REGRAS.md` (texto, fontes, moeda, Fan Content, Scryfall, git). Subtítulo: "Sua fonte diária de informação sobre Magic: The Gathering". É conteúdo de fã não oficial: nunca use logos ou marcas da Wizards e nunca remova o aviso de Fan Content do rodapé da página. Ninguém responde durante a execução: decida sozinho.

## 0. Como o jornal está montado

- O jornal é o site `https://fontedemana.com.br`, servido pelo GitHub Pages a partir do repositório (a pasta de trabalho, ver `tools/REGRAS.md`). É o único lugar onde ele é publicado (o antigo artifact do claude.ai não é mais atualizado).
- Arquivos: `index.html` (visual, código e tags de prévia do link; NUNCA muda no dia a dia), `data/index.js` (`window.MANA_POOL_INDEX = {"featuredCards": [...], "editions": [...]};`, edições mais recentes primeiro, cada uma `{"n","date","dateLabel","head","biome"}`; featuredCards = cartas que já foram Topdeck, mais recente primeiro), `data/edN.js` (`MANA_POOL_ED({...});`), `img/edN-art.jpg` (arte da Notícia Lendária), `img/edN-card.jpg` (carta do Topdeck) e `lands/*.jpg` (fixas, não mexa).

## 1. Ler o estado atual

1. Leia `data/index.js`. N = `editions[0].n`. Não abra o `index.html`: ele não muda.
2. Leia `data/edN.js` (a edição anterior: cobertura, manchetes, agenda, sussurros, pulse, carta).
3. Rode `node tools/conteudo/contexto.cjs . <hoje AAAA-MM-DD> --publicados`. Ele lista em poucas linhas o que já saiu nos últimos 30 dias (manchetes, Topdecks, cartas e temas dos originais). Não repita notícia sem fato novo e não use como Topdeck uma carta dessa lista.
4. A nova edição é N+1. A janela de cobertura vai do dia seguinte ao fim da cobertura anterior até hoje.

## 2. Pesquisar

Escopo: só Commander (ban e regra de outros formatos não entram), Brasil e EUA, temas de regras, coleções e decks de Commander, Reserved List (só com movimento relevante de preço), ban e Game Changers, acessórios, eventos, produtos (Secret Lair, boosters, god packs), polêmicas e preços.

**Radar fixo (sempre, nesta ordem).** Toda página é aberta como manda "Páginas da web" em `tools/REGRAS.md`: WebSearch primeiro e WebFetch só no link que voltou na busca.
1. Wizards: WebSearch com `allowed_domains` ["magic.wizards.com"] e "Magic announcements <mês> <ano>"; WebFetch no link de `/en/news/announcements` que voltar (ou direto nos anúncios da janela que aparecerem).
2. MTGStocks: WebSearch com `allowed_domains` ["mtgstocks.com"] e "MTGStocks news <mês> <ano>"; WebFetch no link de `/news` que voltar e abra os artigos da janela sobre Commander, preços, produtos ou ban. Às sextas, o "Weekly Winners" vira manchete de Bolso (cartas jogadas em Commander). Preço em dólar do MTGStocks vale sozinho (verif "MTGStocks", com a data). Análises, "cartas para comprar" e previsões são fonte secundária e nunca viram fato. As páginas `/interests` e de cartas individuais aparecem vazias: não insista.
3. LigaMagic, no máximo 2 tentativas: uma WebSearch com `allowed_domains` ["ligamagic.com.br"] e o assunto principal do dia, e WebFetch num link dela que voltar. 403 ou nada: não tente de novo nem contorne (espelho, cache), anote só para a mensagem final. Trecho de busca com link em ligamagic.com.br vale como LigaMagic.
4. MTG Salvation: WebSearch com `allowed_domains` ["mtgsalvation.com"] e "MTG Salvation news <mês> <ano>"; WebFetch nos links de notícia (`/news/...`) ou de spoilers (`/spoilers/...`) da janela sobre Commander, precons, ban, regras ou produtos. É fonte secundária: a notícia vira manchete com a fonte primária (Wizards) ou com uma segunda fonte independente (verif "Oficial + 2ª fonte" ou "2 fontes"), nunca sozinha. Carta da página de spoilers só entra se aparecer também no Scryfall ou num anúncio da Wizards. Tópico do fórum (The Rumor Mill e os outros) só vai para os Sussurros, dito como rumor de fórum. O fórum de Commander (EDH) serve para medir polêmica, nunca como fato.
5. Duas WebSearch amplas de notícias de Commander da semana (por exemplo "MTG Commander news" e "Magic Commander precon reveal" com o mês).
6. Lojas e criadores que o Paulo segue (epicsaopaulo, pink.mtg, freitastcg, supplyhouseoficial, mesaderpg, commanderlvl17, armageddoncardshop, mtgversus, moxvault.tcg, tapforme_mtg, kirin.tcg, mtgbrasilofc, ligamagic, gamegenicsupplies): Instagram não é lido. Faça 2 buscas na web pelo nome, alternando os nomes a cada dia. MTG Brasil (Praça Baronesa da Bocaina, 123, Alto de Pinheiros, perto do metrô Vila Madalena) e Epic São Paulo são lojas de São Paulo; evento de Commander delas com data confirmada na página da loja ou na LigaMagic entra com etiqueta Brasil ou na agenda. Lançamento da Gamegenic entra com etiqueta Acessórios. Afirmação de criador sem confirmação vai para os Sussurros.
7. Termômetro (vidIQ, seção 2b).

**Aprofundar:** cada pista do radar que pode virar manchete ganha até 2 buscas para confirmar (fonte primária ou segunda fonte independente). Total da pesquisa de notícias: de 12 a 26 chamadas (cada página custa uma busca e uma abertura), fora o Topdeck. Dia sem pista nova termina no radar; não procure assunto antigo para encher a edição.

## 2b. Termômetro das Redes (vidIQ)

Cota de 150 créditos por mês; cada busca custa 5.
1. `vidiq_balance` (custa 0): anote totalCredits e renewableResetsAt. Menos de 5: pulse = null, nada na página, só registro para a mensagem final.
2. Com crédito: `date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%SZ` no terminal e UMA única `vidiq_youtube_search` com query "magic the gathering", type ["video"], order "viewCount", limit 15, publishedAfter = esse horário. Nenhuma outra chamada paga do vidIQ.
3. Ordene por visualizações e tire os que já estavam em `pulse.items` da edição anterior (compare a url); pegue os próximos no lugar.
4. Prefira vídeos de Magic com assunto (notícia, preço, deck, Commander); humor ou fora de Magic só se não sobrar outro.
5. pulse = os 3 primeiros que sobrarem (ou menos). Só é null se não sobrar nenhum.
6. Sinal de engajamento apenas: assunto em alta que já é manchete verificada sobe no ranking; fato novo de vídeo precisa de confirmação (fonte primária ou duas fontes) para virar manchete, senão vai para os Sussurros com o link.
7. `vidiq_balance` de novo e anote o totalCredits para a seção 12.

## 3 e 4. Verificar e priorizar

Verificação conforme `tools/REGRAS.md`. Ordene as manchetes pelo impacto provável na comunidade de Commander, com o vidIQ como desempate: 1) Bolso (preço de produto, valor de cartas, chances de pacotes raros, vendas limitadas, buyouts), 2) Deck (ban, Game Changers, regras e cartas novas que mudam o jogo), 3) Polêmica (vários veículos e criadores ao mesmo tempo), 4) Novidade (lançamentos, spoilers, eventos). A primeira manchete é a Notícia Lendária.

## 5. Jornal dinâmico

Só entra o que teve novidade na janela. Sem notícia nenhuma: stories vazio, um quietNote curto dizendo que os assuntos em andamento não tiveram fato novo, agenda atualizada e o Topdeck do Dia (ele sempre sai).

## 6. Estilo

Regras de texto de `tools/REGRAS.md`. `notes` fica sempre vazio: aviso de rotina só na mensagem final.

## 7. Topdeck do Dia (uma carta nova em toda edição)

1. Carta legal no Commander que não esteja em featuredCards nem na lista do contexto. Prefira ligada às notícias do dia (subiu de preço, revelada, banida, citada). Sem ligação boa, uma carta relevante para Commander hoje, variando cor, tipo e raridade na semana, e também o perfil: staple conhecida, carta nova, carta antiga com história e, de vez em quando, um Lado B (pouco jogada no EDHREC, mas forte no papel dela). Se o `contexto.cjs` mostrar uma data comemorativa, prefira uma carta do tema que ainda não foi Topdeck.
2. Dados: Scryfall (Oracle em inglês, custo, tipo, raridade, coleção, número, artista, lealdade ou P/R, identidade de cor, `prices.usd`); texto em português pela impressão `lang:pt` (`printed_text`), ou tradução fiel no padrão das cartas em português; EDHREC (WebSearch "edhrec <Nome da Carta>" e WebFetch no link de `edhrec.com` ou `edhrecstatic.com` que voltar: decks, percentual, comandantes que mais usam); Commander Spellbook (WebSearch com `allowed_domains` ["commanderspellbook.com"] e "<Nome da Carta> combo", WebFetch no link que voltar: número de combos e até 3 exemplos; sem resultado, os combos da página do EDHREC; sem nenhum, combos = null); MTGStocks se a carta estiver num artigo da janela.
3. Conteúdo: why (1 ou 2 frases ligando ao dia, seção em `<b>`), roles (comandante? como joga nas 99?), rarityText (o que a raridade significa aqui e reimpressões), alone (2 a 4 habilidades explicadas, rótulo curto), inDeck (como funciona no deck e com quais peças), watch (erro de regra comum, começando em minúscula, porque a página já escreve "Pega no pulo," antes), stats (exatamente 4: decks no EDHREC, percentual, preço em dólar com data, fonte e reais entre parênteses, e mais um), topCmd (até 4 comandantes com percentual), links (EDHREC, Scryfall e outros usados).

## 8. Imagens

Pelo Scryfall, como em `tools/REGRAS.md`. Carta do Topdeck: `image_uris.large` em `img/ed(N+1)-card.jpg` (use artista, set e número dessa impressão). Arte da Notícia Lendária: carta ligada à manchete principal (a citada, o comandante revelado, o artefato da coleção) ou cuja arte ilustre o assunto (ex.: Booster Tutor para boosters), nunca a mesma do Topdeck: `image_uris.art_crop` em `img/ed(N+1)-art.jpg`. Sem imagem: `card.image = null` (a página faz uma proxy com o texto) e `art.image = null` (a página usa o terreno da cor de `art.biome`).

## 9. Montar a edição N+1

`data/ed(N+1).js` com `MANA_POOL_ED( <JSON> );`, no formato da edição anterior:
- n, date ("AAAA-MM-DD", hoje em São Paulo), dateLabel ("Domingo, 11 de outubro de 2026"), coverage ("Notícias de 11 de outubro" ou "Notícias de 10 e 11 de outubro").
- lead: {"title": "Resumo do Dia", "flavor": linha curta no estilo de flavor text ligada à Notícia Lendária, sem inventar fato}.
- art: {"biome": cor da Notícia Lendária (W, U, B, R, G, A ou M), "seed": n, "label": nome da carta, "card": nome da carta, "artist", "uri": link scryfall.com da impressão, "image": "img/ed(N+1)-art.jpg" ou null}.
- summary: 3 a 5 itens {"c", "html"}: um por assunto principal, um do Topdeck com c "M", um dos Sussurros com c "Q" se houver, um da próxima data importante. Cores: G novidade, A bolso e preço, U deck e regras, R polêmica, B ban, W Brasil, lojas e eventos, M Topdeck, Q rumor.
- stories (por relevância): {"tags": entre Bolso, Deck, Polêmica, Novidade, Brasil, Ban, Regras, Evento, Acessórios; "title"; "lede": 1 a 3 frases; "facts": fatos curtos; "note": {"label": "Na sua mesa", "No seu bolso", "Na prática" ou "No Brasil", "text": começa em minúscula, impacto prático} ou omitido; "verif": "Oficial", "Oficial + 2ª fonte", "2 fontes", "MTGStocks", "LigaMagic" ou "Anúncio da loja"; "sources": [{"t", "u"}]}.
- quietNote: só com stories vazio.
- card: name, cost (ex. ["2","W","U"]), ci ([] para incolor), type (em português, ex. "Criatura Lendária"), subtype, loyalty (número ou null), pt ("3/4" ou null), rarity (common, uncommon, rare, mythic), collector ([SET, número, raridade em português]), image, artist, scryfall, oraclePt (linhas), oracleEn (linhas, custo de lealdade em `<b>`), flavor (curto ou omitido), why, roles {"commander": {"ok","text"}, "ninetyNine": {"ok","text"}}, rarityText, alone [{"label","text"}], inDeck, watch, combos {"note", "items": [{"cards","result"}], "source": {"t","u"}} ou null, stats [{"v","k"}] (4), topCmd [{"name","pct"}], links [{"t","u"}].
- pulse: {"note": "Os vídeos de Magic mais vistos nas últimas 24 horas. Mostram o que está bombando, mas não confirmam nada.", "items": [{"title" em português, "channel", "views" inteiro, "age" curto como "em cerca de 8 horas", "url"}]} ou null.
- ban: {"iso": próxima janela de ban ou anúncio do Commander, "html"} só se futura e confirmada; senão null.
- agenda: só datas de hoje em diante, em ordem, {"label": "12 out" ou "23 a 29 out", "iso": início, "c": B ban, W loja e evento, G lançamento, A produto e venda, R polêmica, U regras, "html"}. agendaSources: [{"t","u"}].
- rumors: [{"title", "html", "sources": [{"t","u"}]}] (vazia se não houver).
- fx: com valor convertido, {"rate": número, "date": "AAAA-MM-DD", "source": "Banco Central Europeu" ou a fonte usada, "url", "html": "Valores em reais pela cotação de 9 out, US$ 1 = R$ 5,005 (Banco Central Europeu)."}; sem valor convertido, null.
- notes: [] sempre.

Depois atualize `data/index.js`: no início de editions `{"n": N+1, "date", "dateLabel", "head": título da Notícia Lendária (ou "Dia calmo no Multiverso"), "biome": art.biome}`, no início de featuredCards o nome da carta do Topdeck, no máximo 31 entradas em editions (apague as mais antigas do índice). Mantenha o comentário da primeira linha e os nomes internos MANA_POOL_INDEX e MANA_POOL_ED.

## 10. Validar

`node tools/jornal/validar.cjs . N+1`. Corrija tudo o que ele apontar e rode de novo até sair OK. Não publique com erro.

## 11. Publicar no site (obrigatório)

1. `git add data img`, commit "Edição N+1 de <data>" e push, com as regras de `tools/REGRAS.md`. Não adicione nada fora de `data/` e `img/`.
2. O site é o único lugar do jornal: se o push falhar por permissão ou rede depois da nova tentativa de `tools/REGRAS.md`, espere 2 minutos e tente mais 2 vezes antes de desistir. Se não der, guarde o erro exato, siga para a 11b (o kit vai junto no envio final) e tente enviar tudo de novo no fim da execução.
3. Confira a publicação pelo GitHub, como em "Repositório e convivência" de `tools/REGRAS.md`: `data/ed(N+1).js` no `origin/main` e a execução "pages build and deployment" do seu commit com `success`. Não use WebFetch no site.

## 11b. Kit de Redes (depois da 11, mesmo se o push falhou)

1. Leia `tools/kit/LEIA.md` (formato e limites do kit.json). Não precisa abrir kits antigos.
2. Escreva `kit/ed(N+1)/kit.json` só com fatos, números, datas e fontes da edição N+1. Capa e cena 1 = Notícia Lendária; cartões = manchetes, em ordem; Topdeck e cena 3 = carta do dia; ban, turnos e sussurro vêm de ban, agenda e rumors. Inclua o bloco `pauta` com a força do dia (critério abaixo).
3. `node tools/kit/gerar.cjs . N+1` com timeout de 600000 ms (o vídeo leva uns 2 minutos). Se der ERROS, corrija o kit.json (em geral encurtar o texto apontado) e rode de novo, até 4 vezes. Se o vídeo continuar falhando, rode com `--sem-video` e avise no final.
4. Abra com Read a capa (`kit/ed(N+1)/carrossel-01.jpg`) e a imagem do Topdeck (logo depois dos cartões).
5. `git add kit`, commit "Kit de Redes da edição N+1" e push (mesmas regras). Nada fora de `kit/`.
6. Confira pelo GitHub do mesmo jeito: `kit/ed(N+1)/index.html` no `origin/main` e a execução "pages build and deployment" do commit do kit com `success`.

**Força do dia (`pauta.forca`).** "forte" quando a Notícia Lendária é fato novo de impacto direto na mesa ou no bolso de quem joga Commander, publicado na janela de hoje e ainda não noticiado: ban ou mudança de Game Changers, regra nova, revelação de precon ou coleção de Commander, produto com preço ou data anunciados, carta com variação grande de preço, polêmica coberta por vários veículos. "calmo" no resto, inclusive desdobramento de assunto que saiu nas últimas 3 edições ou num plantão (a lista "Plantões" do contexto: o anúncio já foi para o feed no mesmo dia). No dia calmo, o feed do Instagram fica com o conteúdo original preparado na noite anterior.

## 12. Avisar

Mensagem final curta em português: a Notícia Lendária em uma frase, quantas manchetes e sussurros, a força do dia (forte ou calmo) e por quê, a carta do Topdeck, se as imagens do Scryfall carregaram (se não: conferir no editor da rotina se o ambiente libera api.scryfall.com e cards.scryfall.io), se a LigaMagic abriu, a cotação usada (data e fonte) ou que saiu sem conversão, se o site foi atualizado (se não, o erro exato, porque a edição não foi ao ar), se o Kit de Redes saiu em fontedemana.com.br/kit (com ou sem vídeo) e quantos créditos do vidIQ restam. Se algo impediu a publicação, diga o quê.

Créditos do vidIQ, com o totalCredits depois da busca e renewableResetsAt no horário de Brasília:
- Entre 5 e 9: comece com "Atenção: os créditos do vidIQ acabam amanhã. A edição de amanhã é a última com o Termômetro das Redes até a renovação em <data>."
- Abaixo de 5: comece com "Atenção: os créditos do vidIQ acabaram. O Termômetro das Redes volta depois da renovação em <data>."
