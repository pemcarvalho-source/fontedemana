# Estratégia de conteúdo da Fonte de Mana

Versão 1, 14 out 2026. Revisada toda semana com as estatísticas que o Paulo manda. As rotinas leem a parte operacional em `tools/conteudo/plano.json`; este arquivo explica o porquê.

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

## Calendário de originais (semana A = ISO ímpar, B = ISO par)

| Dia | Semana A | Semana B |
| --- | --- | --- |
| Segunda | História de uma carta (bastidores de design) | Lore em 1 minuto |
| Terça | Dicionário do Commander | Dicionário do Commander |
| Quarta | Deck em 40 segundos | Combo da semana |
| Quinta | Top 5 (feito para salvar) | Top 5 |
| Sexta | Regra Bizarra | Termômetro (vídeo mais visto em versão própria) |
| Sábado | Radar DC500 | Vitrine de acessórios |
| Domingo | Bolsa de Mana | Debate da semana (proxy x original e afins) |

Rota das Lojas substitui o pilar do dia quando existir `extras/lojas/AAAA-MM-DD.json` com a visita marcada. Notícia oficial da Wizards publicada depois das 6h (ban, Game Changers, regra, produto de Commander) pode tomar o lugar do original no TikTok.

Cada original sai em três formatos complementares, nunca a mesma peça repostada: vídeo narrado (TikTok), carrossel de 5 a 7 telas (Instagram) e post de debate (Threads).

## Regras de engajamento em toda peça original

- Gancho nos 2 primeiros segundos ou na capa: número, pergunta ou algo que contraria o senso comum.
- Primeira linha da legenda com palavra de busca: Commander, deck, carta de Magic e o tema.
- Termina com pergunta concreta, de preferência com opções, e com um motivo para salvar ou mandar para alguém.
- Séries com nome fixo, para criar hábito.

## Fora da automação (vale fazer à mão)

- Responder comentários na primeira hora depois de postar.
- Rota das Lojas sempre como post em Collab com a loja (aparece no perfil dos dois).
- Testar o vídeo original como Trial Reel (só não seguidores veem) uma vez por semana e comparar com o Reels do jornal.
- Ligar Instagram, TikTok e Threads à marca da Fonte de Mana no Metricool: a revisão semanal passa a puxar os números sozinha.

## Revisão semanal

Toda segunda, com os números dos últimos 7 dias (prints do Instagram em Visão geral e Conteúdo ordenado por Visualizações, Salvamentos e Compartilhamentos, mais TikTok e Threads, ou Metricool):

1. Comparar notícia x original e pilar x pilar em alcance, % de não seguidores, salvamentos + compartilhamentos por alcance, comentários e seguidores ganhos.
2. Pilar campeão por 2 semanas ganha mais um dia. Pilar no fim da fila por 2 semanas troca de formato ou sai.
3. Se o carrossel original de dia calmo ganhar do carrossel do jornal, o critério de dia forte fica mais exigente; se perder, mais flexível.
4. Registrar a decisão abaixo e ajustar `plano.json`.

Linha de base para comparar: 28,3% de visualizações de não seguidores, 0 salvamentos, 0 compartilhamentos, 9 seguidores.

## Histórico de ajustes

- 14 out 2026, v1: mix notícia + original, força do dia decide o feed, calendário de 7 pilares em semanas A e B, Threads das 19:00 sai da grade.
