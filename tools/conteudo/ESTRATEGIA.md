# Estratégia de conteúdo da Fonte de Mana

Versão 2, 15 out 2026. Revisada toda semana com as estatísticas que o Paulo manda. As rotinas leem a parte operacional em `tools/conteudo/plano.json`; este arquivo explica o porquê. Os moldes de cada formato, e as referências de criadores que inspiraram cada um, estão em `tools/conteudo/FORMATOS.md`.

## Diagnóstico (Instagram, 13 set a 13 out, conta com 4 dias de vida)

- 251 visualizações, 62 contas alcançadas, 9 seguidores, 24 curtidas, 1 comentário, 0 salvamentos, 0 compartilhamentos, 0 seguidores vindos de post.
- 71,7% das visualizações vieram de quem já segue. Posts (111) e Stories (67) quase só para seguidores. **Reels (73) foi o único formato que chegou a quem não segue**: o Reels do Corn Maze alcançou 43 contas, mais de 4 vezes o melhor carrossel.
- O único comentário veio de uma polêmica (Marvel no Commander).
- O mesmo assunto voltou em vários dias seguidos (Corn Maze em 3 posts, banimentos em 4 peças) porque não havia fato novo. Notícia repetida não é salva nem compartilhada.
- Ressalva: são 4 dias e 9 seguidores. Os números indicam direção, não certeza.

## Princípio

**A notícia informa, o original faz crescer.** Todo dia tem dois assuntos: a notícia do jornal e um conteúdo original do calendário. Os dois nunca disputam o mesmo espaço na mesma rede.

- Notícia: relevância e credibilidade. Sai sempre no site, no fio do Threads, nos Stories e no Reels do jornal.
- Original: alcance, salvamento e compartilhamento. Sai sempre no TikTok narrado e ocupa o feed do Instagram nos dias calmos.

## Força do dia (decide quem fica com o feed das 12:00)

O jornal marca cada edição como `forte` ou `calmo` no `kit.json`.

- **Forte**: a Notícia Lendária é fato novo de impacto direto na mesa ou no bolso de quem joga Commander, publicado na janela de hoje e ainda não noticiado. Exemplos: banimento ou mudança de Game Changers, regra nova, revelação de precon ou coleção de Commander, produto com preço ou data anunciados, carta com variação grande de preço, polêmica coberta por vários veículos.
- **Calmo**: o resto, inclusive desdobramento de assunto que já saiu nas últimas 3 edições.
- Dia forte: feed = carrossel do jornal. Dia calmo: feed = carrossel original. Sem carrossel original pronto, o feed fica com o jornal.

## Grade diária

| Hora | Rede | Dia forte | Dia calmo |
| --- | --- | --- | --- |
| 18:30 (véspera) | Gravação | Narração do TikTok de amanhã | igual |
| 10:30 | Threads | Pergunta sobre a notícia | Debate do original |
| 10:30 | Stories | Capa do jornal com pergunta | igual |
| 11:30 | TikTok | Original narrado | igual |
| 12:00 | Instagram feed | Carrossel do jornal | Carrossel original |
| 12:00 | Stories | Repost do feed com enquete | igual |
| 15:00 | Threads | Fio do jornal | igual |
| 15:00 | Stories | Topdeck do Dia com link | igual |
| 19:00 | Reels | Vídeo do jornal com música | igual |

Saiu da grade: o post das 19:00 no Threads com o vídeo do jornal (repetia o Reels e o Threads é rede de texto). Volta se a revisão semanal mostrar o contrário: basta mudar `ativo` em `plano.json`.

## Calendário de originais (ciclo de 3 semanas)

A letra da semana vem de `ciclo` em `plano.json`: semana ISO 42 (12 a 18 out 2026) é C a partir de sexta 16, a 43 é A, a 44 é B, a 45 é C e assim por diante.

| Dia | Semana A | Semana B | Semana C (formatos novos) |
| --- | --- | --- | --- |
| Segunda | História de uma carta (bastidores de design) | Lore em 1 minuto | Treta das Cores (esquete das cores com regra) |
| Terça | Dicionário do Commander | Dicionário do Commander | Dicionário do Commander |
| Quarta | Deck em 40 segundos | Combo da semana | Matemática da Mesa (chance de achar as cartas) |
| Quinta | Top 5 (feito para salvar) | Top 5 | Top 5 Lado B (cartas esquecidas que funcionam) |
| Sexta | Chama o Juiz (quiz de regra) | Termômetro (vídeo mais visto em versão própria) | Chama o Juiz |
| Sábado | Radar DC500 | Vitrine de acessórios | Qual entra? (duelo de duas cartas) |
| Domingo | Bolsa de Mana | Debate da semana (proxy x original e afins) | Toda mesa tem um (humor de mesa) |

Rota das Lojas substitui o pilar do dia quando existir `extras/lojas/AAAA-MM-DD.json` com a visita marcada. Notícia oficial da Wizards publicada depois das 6h (ban, Game Changers, regra, produto de Commander) pode tomar o lugar do original no TikTok.

Cada original sai em três formatos complementares, nunca a mesma peça repostada: vídeo narrado (TikTok), carrossel de 5 a 7 telas (Instagram) e post de debate (Threads).

## Por que a semana C (15 out)

O Paulo mandou gravações de criadores de Magic como inspiração. O que mais se repetiu nelas e falta na grade: **pergunta com resposta escondida** (quiz com contagem), **número que muda uma decisão** (probabilidade), **humor de mesa** (o post de humor tinha 7.320 envios, mais que todos os outros juntos) e **descoberta** (cartas esquecidas, com 537 envios para 1.641 curtidas). A semana C testa esses moldes sem tirar nenhum pilar que o Paulo pediu; a Regra Bizarra virou o quiz Chama o Juiz em todas as semanas, com a mesma fila.

O que medir na revisão: comentários por visualização no Chama o Juiz e no Qual entra?; salvamentos e envios na Matemática da Mesa e no Lado B; envios no humor (Treta das Cores e Toda mesa tem um).

## Datas comemorativas (15 out)

Pedido do Paulo: aproveitar as datas que todo mundo já está comentando. A lista fica em `datas` no `plano.json` e os detalhes em `FORMATOS.md`. Na janela da data, o pilar do dia pega o tema quando couber; no dia, as peças originais são do tema e algumas datas trocam o pilar. Na revisão, comparar as peças de data com as do mesmo pilar fora de data.

## Regras de engajamento em toda peça original

- Gancho nos 2 primeiros segundos ou na capa: número, pergunta ou algo que contraria o senso comum.
- Primeira linha da legenda com palavra de busca: Commander, deck, carta de Magic e o tema.
- Termina com pergunta concreta, de preferência com opções, e com um motivo para salvar ou mandar para alguém.
- Séries com nome fixo, para criar hábito.
- No carrossel, uma ideia por tela e uma dúvida no fim de cada tela que obriga a arrastar.
- Pedido de envio com destinatário ("manda pro seu parceiro de mesa que..."), não só "compartilhe".

## Fora da automação (vale fazer à mão)

- Responder comentários na primeira hora depois de postar.
- Rota das Lojas sempre como post em Collab com a loja (aparece no perfil dos dois).
- Testar o vídeo original como Trial Reel (só não seguidores veem) uma vez por semana e comparar com o Reels do jornal.
- Ligar Instagram, TikTok e Threads à marca da Fonte de Mana no Metricool: a revisão semanal passa a puxar os números sozinha.

## Revisão semanal

Toda segunda, com os números dos últimos 7 dias (prints do Instagram em Visão geral e Conteúdo ordenado por Visualizações, Salvamentos e Compartilhamentos, mais TikTok e Threads, ou Metricool):

1. Comparar notícia x original, pilar x pilar e semana C x semanas A e B em alcance, % de não seguidores, salvamentos + compartilhamentos por alcance, comentários e seguidores ganhos.
2. Pilar campeão por 2 semanas ganha mais um dia. Pilar no fim da fila por 2 semanas troca de formato ou sai.
3. Se o carrossel original de dia calmo ganhar do carrossel do jornal, o critério de dia forte fica mais exigente; se perder, mais flexível.
4. Registrar a decisão abaixo e ajustar `plano.json`.

## Linha de base

Números de antes da estratégia nova, para comparar nas revisões.

**Instagram** (prints, 13 set a 13 out): 251 visualizações, 28,3% de não seguidores, 62 contas alcançadas, 24 curtidas, 1 comentário, 0 salvamentos, 0 compartilhamentos, 9 seguidores. Reels: 73 visualizações em 2 vídeos. Ainda sem conexão no Metricool.

**TikTok** (Metricool, 12 a 14 out, medido em 14 out às 19h): 3 vídeos, 332 visualizações (média de 111 por vídeo), 10 curtidas, 4 comentários, 0 compartilhamentos.
- 13 out, Wort volta depois de 19 anos sem reimpressão (história da carta): 173 visualizações, 4 curtidas, 2 comentários.
- 12 out, Corn Maze Superdrop (notícia): 102 visualizações, 4 curtidas, 1 comentário.
- 14 out, Dicionário: o que quer dizer EDH (original): 57 visualizações, 2 curtidas, 1 comentário, com só umas 7 horas no ar.
- O Metricool ainda não trouxe alcance, origem (Para Você, busca) nem tempo assistido. Conferir de novo na revisão.

**Threads** (Metricool, 11 a 14 out): 20 posts, 846 visualizações, 11 interações.
- Mais vistos: o primeiro post do fio dos banimentos (253), o post de estreia (159), os nomes dos precons de Darkhold (144), a pergunta sobre a janela de banimentos (94, 1 resposta).
- No fio, os posts depois do primeiro despencam: 253 no primeiro, depois 23, 22, 4 e 0. Quase ninguém abre a sequência.
- As perguntas puxam resposta (cada uma teve 1), os posts informativos quase não.

**Hipóteses para a primeira revisão** (dados de 3 dias, ainda não viraram regra):
- Por vídeo, o TikTok já alcança bem mais que o Reels. Se continuar assim, ele é a rede de alcance e o original narrado tem que ser a peça mais caprichada do dia.
- História de carta foi o vídeo que mais rodou. Bom sinal para os pilares História e Lore.
- No Threads, o primeiro post do fio carrega tudo. Testar fio de 3 posts, com a notícia inteira no primeiro.

## Histórico de ajustes

- 15 out 2026, v3: calendário de datas comemorativas (16 datas, de Halloween e Dia do Saci a Dia das Crianças), com tema, ângulo por pilar, buscas e cartas conferidas no Scryfall; o jornal também vê a data e prefere um Topdeck do tema.

- 15 out 2026, v2 (aprovada pelo Paulo depois de ver um exemplo de cada formato; começa na sexta 16): ciclo de 3 semanas com a semana C de formatos novos (Treta das Cores, Matemática da Mesa, Top 5 Lado B, Qual entra?, Toda mesa tem um), Regra Bizarra vira o quiz Chama o Juiz, campo `formato` nos pilares, `FORMATOS.md` com os moldes e as referências, `chance.cjs` para as contas, cena quiz com contagem no TikTok e tela de barras no carrossel.

- 14 out 2026: linha de base de TikTok e Threads registrada a partir do Metricool.
- 14 out 2026, v1: mix notícia + original, força do dia decide o feed, calendário de 7 pilares em semanas A e B, Threads das 19:00 sai da grade.
