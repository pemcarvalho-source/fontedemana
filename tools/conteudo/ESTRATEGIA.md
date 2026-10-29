# Estratégia de conteúdo da Fonte de Mana

Versão 5.6.1, 29 out 2026. Revisada toda segunda pela revisão semanal (`tools/conteudo/REVISAO.md`), com os dados do Metricool. As rotinas leem a parte operacional em `tools/conteudo/plano.json`; este arquivo explica o porquê. Os moldes de cada formato, e as referências de criadores que inspiraram cada um, estão em `tools/conteudo/FORMATOS.md`.

**A partir de 22 out, números de desempenho, gastos com anúncio e relatórios ficam só no documento privado da estratégia**, porque este repositório é público. Aqui ficam as decisões e o porquê, em palavras.

## Ajustes de 22 out 2026 (v5, valem para as peças a partir de 26 out)

A primeira análise com o Metricool (10 a 21 out) mostrou: seguidor orgânico chegando devagar e quase todo o crescimento vindo de posts impulsionados; o vídeo prende na capa, mas perde a maior parte do público entre o 2º e o 6º segundo; o conteúdo original é mais compartilhado que o do jornal (o quiz Chama o Juiz foi o mais repassado); o Reels do jornal com música alcança quem não segue, mas não gera conversa nem compartilhamento; no Threads, só o primeiro post de cada fio é lido; impulso com objetivo de visualizações no TikTok trouxe muita view e quase nenhum seguidor. Por isso:

1. **Molde novo do vídeo original** (`plano.json` > `video`, conferido pelo `tiktok.cjs`): 20 a 30 s, a promessa no primeiro segundo, cenas curtas com as partes entrando uma de cada vez, sem abertura, final na revelação.
2. **Reels das 19:00 = o vídeo original do dia**, o mesmo arquivo do TikTok. O vídeo do jornal com música saiu da grade.
3. **Anúncio só na peça campeã da semana**, com 72 h ou mais no ar e o gancho na meta; objetivo seguidores no TikTok e visitas ao perfil no Instagram, nunca visualizações; toda campanha registrada no documento privado (`plano.json` > `anuncio`).
4. **Threads das 15:00 num post só**, com a notícia inteira, e o tópico MTG em todo post. Responder conversas de Magic de outras contas fica à mão.
5. **Legendas**: palavra de busca e pergunta na primeira linha, até 3 hashtags (1 do assunto e 2 gerais), comentário fixado com a pergunta.
6. **Um teste por variável por semana** (`plano.json` > `testes`): TikTok às 18h de 2 a 8 nov, Reel de teste com gancho B em 4 e 10 nov, legendas sem hashtag em dias alternados de 9 a 15 nov.
7. **Revisão toda segunda** com regras fixas de cor e de decisão (`tools/conteudo/REVISAO.md`); metas até 16 nov em `plano.json` > `metas`.

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
| 19:15 (véspera) | Gravação | Narração do TikTok de amanhã | igual |
| 10:30 | Threads | Pergunta sobre a notícia | Debate do original |
| 10:30 | Stories | Capa do jornal com pergunta | igual |
| 11:30 | TikTok | Original narrado | igual |
| 12:00 | Instagram feed | Carrossel do jornal | Carrossel original |
| 12:00 | Stories | Repost do feed com enquete | igual |
| 15:00 | Threads | Notícia do jornal num post só (até 25 out, fio) | igual |
| 15:00 | Stories | Topdeck do Dia com link | igual |
| 19:00 | Reels | Vídeo original do dia, o mesmo do TikTok (até 25 out, vídeo do jornal com música) | igual |
| 18:40 (dias de teste) | Reels | Reel de teste: o vídeo do dia com o gancho B, só para quem não segue (antes do Reels normal) | igual |
| 21:30 | Comentários | Responder e curtir os comentários de hoje e de ontem nas três redes (desde 26 out) | igual |
| Na hora do anúncio (dias marcados) | Threads, feed, TikTok e Stories | Plantão: o anúncio grande no mesmo dia (`tools/conteudo/PLANTAO.md`) | igual |

Saiu da grade: o post das 19:00 no Threads com o vídeo do jornal (repetia o Reels e o Threads é rede de texto). Volta se a revisão semanal mostrar o contrário: basta mudar `ativo` em `plano.json`.

## Calendário de originais (ciclo de 3 semanas)

A letra da semana vem de `ciclo` em `plano.json`: semana ISO 42 (12 a 18 out 2026) é C a partir de sexta 16, a 43 é A, a 44 é B, a 45 é C e assim por diante.

| Dia | Semana A | Semana B | Semana C (formatos novos) |
| --- | --- | --- | --- |
| Segunda | História de uma carta (bastidores de design) | Lore em 1 minuto | Treta das Cores (esquete das cores com regra) |
| Terça | Dicionário do Commander | Dicionário do Commander | Dicionário do Commander |
| Quarta | Deck em 40 segundos | Combo da semana | Matemática da Mesa (chance de achar as cartas) |
| Quinta | Top 5 (feito para salvar) | Top 5 | Top 5 |
| Sexta | Chama o Juiz (quiz de regra) | Chama o Juiz | Chama o Juiz |
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
- Termina com pergunta aberta e concreta, com as opções escritas quando houver, e com um motivo para guardar.
- Séries com nome fixo, para criar hábito.
- No carrossel, uma ideia por tela e uma dúvida no fim de cada tela que obriga a arrastar.
- Nada de isca de engajamento (desde 26 out): nunca pedir comentário com palavra, letra ou emoji combinado, curtida, marcação ou envio ("comenta X", "marca quem", "manda pro amigo que..."). O Instagram deixa de recomendar a peça que pede interação assim e diz que pergunta aberta é bem-vinda. O compartilhamento vem de peça identificável ou útil.

## Fora da automação (vale fazer à mão)

- Responder comentários na primeira hora depois de postar e, às 21:30, os do dia e da véspera (aviso na pauta desde 26 out). Pergunta boa de comentário ou DM vira tema: mande na conversa do projeto.
- Postar os plantões na hora (a tarefa avisa quando o carrossel fica pronto).
- Manter o Instagram ligado à Página do Facebook da Fonte de Mana (o Metricool mostra os dois desde 15 out): é o que permite a uma loja ou marca transformar um post da Fonte de Mana em anúncio de parceria.
- Olhar de vez em quando o Painel profissional > Monetização, para saber o que já está liberado.
- Rota das Lojas sempre como post em Collab com a loja (aparece no perfil dos dois).
- Nos dias de teste, postar o Reel de teste (a pauta mostra o passo a passo).
- 15 minutos por dia respondendo posts de Magic de outras contas no Threads e comentando com conteúdo em criadores maiores de Commander.
- Ligar o Meta Ads ao Metricool, para o gasto e o alcance pago do Instagram virem sozinhos. Instagram, TikTok e Threads já estão ligados.
- Mandar, quando a revisão pedir, o print do TikTok Studio com a % de 2 s, 6 s e vídeo completo (o Metricool não traz).
- Contar todo impulso no dia em que começar (rede, peça, objetivo, público, dias e gasto), em qualquer conversa do projeto.

## Plantão (23 out)

Anúncio grande com data marcada (lista de precon, ban, produto com preço, painel de evento) ganha cobertura no mesmo dia: carrossel curto no feed, as mesmas imagens no modo foto do TikTok, post do Threads com a capa e repost nos Stories com enquete. Uma tarefa agendada avulsa dispara na hora do anúncio, confere a fonte primária (tenta a cada 20 minutos até o limite do evento), monta tudo e põe os avisos na pauta do dia. Eventos em `plano.json` > `plantao.eventos`; passo a passo em `tools/conteudo/PLANTAO.md`. Os primeiros: as quatro listas dos precons de Star Trek (26 a 29 out) e o anúncio de banimentos de 30 nov. A revisão de segunda mede cada plantão contra a mediana do mesmo formato e propõe os próximos a partir da agenda do jornal; o Paulo aprova. No jornal do dia seguinte, o assunto do plantão conta como desdobramento na força do dia, para o feed não repetir a notícia.

## Paulo no vídeo (23 out, vale a partir de 26 out)

Nos pilares em que a pessoa importa (Dicionário, Termômetro, Debate, Toda mesa tem um e Vitrine; `plano.json` > `rosto`), o Paulo aparece no vídeo: a cena 1 é ele falando o gancho para a câmera e há até mais 2 cenas com ele; cartas, listas e números continuam em cenas geradas, com a voz dele. São uns 7 vídeos a cada 3 semanas, um terço do total. A noite manda o roteiro com o que gravar em cada cena (aviso de gravação das 19:15 e mensagem final), ele grava um vídeo por cena e manda; o `tiktok.cjs` corta, ajusta a cor, põe o título por cima e monta o vídeo, que vai para o TikTok e o Reels como sempre. Sem o vídeo dele, a cena sai como texto. A revisão compara os vídeos com e sem rosto, e o Chama o Juiz segue sem rosto para servir de comparação. No dia de Reel de teste com rosto (10 nov), o teste vira rosto contra sem rosto: o gancho B é gerado.

## Propostas que esperam o Paulo

Do próprio Instagram (abas Engajamento, Alcance e Canais, 23 out), fora da regra por enquanto (aparecer na câmera foi aprovado e virou a v5.3):

- **Canal de transmissão do Instagram**: mensagens pelo menos 3 dias por semana, com conteúdo que só sai lá (o Sussurro do dia, a enquete da semana), divulgado nos Stories com sticker. Só se o recurso aparecer na conta.
- **Collab com criador de Commander**: post ou Reel em Collab chega ao público dos dois (ex.: um Chama o Juiz a dois).

## Revisão semanal

Toda segunda às 8h58, pela tarefa agendada "Fonte de Mana: revisão semanal", seguindo `tools/conteudo/REVISAO.md`:

1. O Metricool alimenta o `tools/conteudo/revisao.cjs`, que separa o pago do orgânico e monta o placar: seguidores orgânicos, views por vídeo no TikTok e no Reels, % que sai nos 3 primeiros segundos, compartilhamentos + salvamentos por mil contas alcançadas (original e jornal), comentários por mil views e seguidores por mil views. Peças só entram com 72 h ou mais no ar.
2. Cor por indicador contra a média das duas semanas anteriores: verde (20% ou mais acima), amarelo, vermelho (20% ou mais abaixo). O veredito olha seguidores orgânicos e views: verde mantém e acelera o que ganhou, amarelo ajusta uma variável, vermelho troca formato ou pilar.
3. Pilar no topo por 2 revisões ganha mais um dia; no fim por 2 revisões, troca de formato ou sai. Se o carrossel original de dia calmo ganhar do carrossel do jornal, o critério de dia forte fica mais exigente; se perder, mais flexível.
4. No máximo três decisões por semana, cada uma mexendo numa variável. O relatório e as decisões vão para o documento privado; o Paulo aprova na conversa e só então o `plano.json` muda, com uma linha no histórico abaixo.

## Linha de base

Números de antes da estratégia nova, para comparar nas revisões.

**Instagram** (prints, 13 set a 13 out): 251 visualizações, 28,3% de não seguidores, 62 contas alcançadas, 24 curtidas, 1 comentário, 0 salvamentos, 0 compartilhamentos, 9 seguidores. Reels: 73 visualizações em 2 vídeos. Ainda sem conexão no Metricool.

**Instagram** (Metricool, conectado em 15 out, medido às 17h30):
- Carrosséis do jornal (11 a 14 out, 6 posts): 17 a 25 visualizações e 5 a 10 contas alcançadas cada, 1 a 2 curtidas, 0 salvamentos, 0 seguidores vindos de post.
- Reels: o vídeo do jornal de 13 out (bans e 24 precons) teve 72 visualizações e 60 contas alcançadas; o do Corn Maze, 56 e 43; o de 12 out, 10 e 7. Um Reel alcança de 6 a 10 vezes mais contas que um carrossel.
- Carrossel original de 15 out (Top 5 Elementais de Ashling): 4 visualizações nas primeiras 5 horas, ainda sincronizando. Comparar com os do jornal na revisão de segunda.
- A divisão seguidores x não seguidores ainda não veio pelo Metricool.

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

- 23 out 2026, v5.1, a partir das melhores práticas do próprio Instagram (Ferramentas profissionais, aba Criação, que o Paulo gravou): gancho dos 3 primeiros segundos de um de três tipos (engraçado, identificável ou inesperado); das 3 hashtags, 1 é do assunto ou do evento e a pauta mantém essa ao cortar; notícia com o nome do evento na primeira linha; música em alta no carrossel e no Reels narrado (`plano.json` > `audio`); Rota das Lojas com a loja marcada como local, luz boa e vídeo em 1080p a 30 quadros. As outras práticas já estavam na estratégia: 10 ou mais Reels por mês (a partir de 26 out são uns 30), texto de contexto na capa do carrossel, legenda que chama a participar, qualidade mínima de 720p e 30 quadros (os vídeos saem em 1080x1920 a 30). Fica como proposta, esperando o Paulo: plantão nos dias de anúncio grande, para ser o primeiro a cobrir.
- 23 out 2026, v5.2, a partir das outras abas das melhores práticas do Instagram (Reels de teste, Engajamento, Canais, Alcance, Monetização, Anúncios de parceria e Diretrizes) e da aprovação do plantão: (1) plantão nos dias de anúncio grande (`tools/conteudo/PLANTAO.md`), começando pelas listas dos precons de Star Trek de 26 a 29 out e pelo ban de 30 nov; (2) nada de isca de engajamento a partir de 26 out: a chamada vira pergunta aberta, sem "comenta X", "marca quem" ou "manda pro amigo" (a contagem do quiz passa a mostrar "A, B ou C?", a frase final do carrossel do jornal vira "Salva para lembrar das datas" e os scripts do TikTok, do original, do kit e do plantão recusam isca, com os padrões em `plano.json` > `isca`); (3) Reel de teste às 18:40, antes do Reels normal, nunca publicado para todos depois, comparado com as views de não seguidores do Reels normal, porque o Instagram corta o alcance de Reel de teste com conteúdo já postado; (4) aviso diário às 21:30 para responder os comentários de hoje e de ontem (`plano.json` > `conversa`); (5) Rota das Lojas com a loja marcada para virar anúncio de parceria, com a conta ligada à Página do Facebook. Ficam como proposta: rosto na câmera, canal de transmissão e collab com criador.
- 23 out 2026, v5.3, pedido do Paulo: ele aparece nos vídeos dos pilares Dicionário, Termômetro, Debate, Toda mesa tem um e Vitrine a partir de 26 out (`plano.json` > `rosto`; cena `rosto` no `tiktok.cjs`, que aceita vídeo na narração, corta o silêncio, corrige o HDR e põe o título por cima). A noite manda o roteiro com o que gravar; a revisão compara com e sem rosto.
- 26 out 2026, v5.4, revisão semanal aprovada pelo Paulo: (1) Chama o Juiz, o pilar que mais rendeu no Instagram em duas revisões seguidas, passa a sair toda sexta (a sexta da semana B deixa o Termômetro); (2) Top 5, o que mais rendeu no TikTok em duas revisões seguidas, passa a sair toda quinta (a quinta da semana C deixa o Lado B); (3) anúncio só no Instagram, com objetivo visitas ao perfil, até o gancho do TikTok chegar à meta de 6 s (`plano.json` > `anuncio`).
- 24 out 2026, leitura das análises do próprio TikTok (Creator Assistant e o aviso de views extras por post útil): nada muda na estratégia. A queda de curtidas e comentários por view veio dos impulsos de visualização (confirma a regra de não impulsionar por views); as três peças "de topo" do assistente foram impulsionadas; o pedido de mais chamada para comentar segue como pergunta aberta (regra da isca); o horário já está em teste. O Deck em 40 s (Krenko) ganhou views extras do TikTok por ter sido achado útil, sinal a favor dos formatos que ensinam. Mudança operacional: a revisão avisa quando o Metricool para de trazer os seguidores de uma rede (o do TikTok parou em 22/10) e pede o número do perfil.
- 27 out 2026, v5.5, a partir do Insights do Instagram que o Paulo gravou (30 dias até 26/10; os números ficam no documento privado): os horários da grade já caem nos picos (meio-dia e começo da noite, e o sábado é o dia mais ativo), então nada muda; Reels às 21h fica como teste candidato depois de 15/11. Os seguidores são quase só homens, a maioria de 25 a 44 anos, e quase todo seguidor novo veio dos posts impulsionados; post orgânico quase não traz seguidor e quase não tem comentário. Cerca de 30% de quem joga Magic são mulheres (estimativa da Wizards), então há público que a página não alcança; o que a pesquisa aponta como barreira é ambiente hostil, humor de mau gosto, falta de representação e não saber por onde começar. Mudanças: regra "mesa para todo mundo" e uma peça por semana para quem está começando ou voltando (`plano.json` > `engajamento`), itens novos na fila do Top 5 (cartas antigas que voltaram a valer, precons para começar, comandantes de Bloomburrow e de Lorwyn Eclipsed), Rota das Lojas avaliando se a loja acolhe iniciantes e jogadoras, e a revisão passa a mostrar a parte de mulheres entre os seguidores (Metricool IGAG). Nada de conteúdo "para mulheres" à parte.
- Correção de 27 out: com a v5.4, a sexta da semana B virou Chama o Juiz, então o Termômetro saiu do calendário e o vídeo com rosto de 30/10 não acontece; os dias com rosto são Dicionário (terça), Debate e Vitrine (semana B) e Toda mesa tem um (semana C).
- 28 out 2026, v5.6, a partir do TikTok Studio do primeiro vídeo com o Paulo (Dicionário #3, mana dork, 27/10; os números ficam no documento privado): o vídeo rodou bem mais que os orgânicos recentes, trouxe mais seguidores e mais mulheres entre quem viu, quase tudo pelo Para Você. A maior parte do público saiu dentro da cena 1 com o rosto, que durou 7 s; depois que a carta entra, a retenção fica quase plana. Mudanças: cena rosto curta (60 caracteres na cena 1 e 80 nas outras, desde 29/10, conferido pelo `tiktok.cjs`); em Dicionário e Chama o Juiz, a primeira fala é a pergunta e a resposta vem depois da primeira troca de tela (a cena 1 do mana dork deu a definição de cara). O rosto fica: o vídeo rodou mais que os orgânicos recentes e as curtidas se concentraram nos primeiros segundos, quando o Paulo aparece.
- 29 out 2026, v5.6.1, pedido do Paulo: troca de pilar num dia combinada com ele (`plano.json` > `trocas`, lida pelo `contexto.cjs`; vale acima do calendário e da data comemorativa, abaixo de visita marcada). Com `rosto: true`, ele aparece no vídeo mesmo fora de `rosto.pilares`. Primeira troca: o sábado 31/10 vira Radar DC500 com o deck de Ashling que ele levou ao torneio de Duel Commander 500 da loja MTG Brasil em 28/10, com ele no vídeo; a Vitrine vai para 14/11. As fotos dele ficam em `extras/lojas/mtg-brasil/2026-10-28/`, sem a localização do arquivo. Os números de desempenho das versões 5.5 e 5.6 saíram deste arquivo, do `plano.json` e do `REVISAO.md`: ficam só no documento privado.

- 22 out 2026, v5 (aprovada pelo Paulo depois do diagnóstico das redes; vale para as peças a partir de 26 out): molde novo do vídeo com revelação progressiva e gancho B (`tiktok.cjs`), Reels das 19:00 com o vídeo original, Threads das 15:00 num post só (`threadsPost` no kit), até 3 hashtags e tópico MTG, testes datados, regra de anúncio, metas até 16 nov e a revisão semanal agendada (`REVISAO.md` e `revisao.cjs`). Números e gastos passam a ficar só no documento privado.

- 17 out 2026: vídeos do TikTok e Reels do jornal com o texto dentro da zona segura do celular (entre x 120 e 880 e acima de y 1560 no quadro de 1080x1920), depois que o Paulo viu o TikTok cortando a esquerda num iPhone. O app amplia o vídeo para preencher a tela e corta as laterais.

- 16 out 2026, v4: lote 2 de referências (review de precon com nota própria); lembretes de engajamento em `plano.json` (engajamento), mostrados pelo `contexto.cjs` em todo pilar; ideia Nota da Mesa registrada em `FORMATOS.md`.

- 15 out 2026, v3: calendário de datas comemorativas (16 datas, de Halloween e Dia do Saci a Dia das Crianças), com tema, ângulo por pilar, buscas e cartas conferidas no Scryfall; o jornal também vê a data e prefere um Topdeck do tema.

- 15 out 2026, v2 (aprovada pelo Paulo depois de ver um exemplo de cada formato; começa na sexta 16): ciclo de 3 semanas com a semana C de formatos novos (Treta das Cores, Matemática da Mesa, Top 5 Lado B, Qual entra?, Toda mesa tem um), Regra Bizarra vira o quiz Chama o Juiz, campo `formato` nos pilares, `FORMATOS.md` com os moldes e as referências, `chance.cjs` para as contas, cena quiz com contagem no TikTok e tela de barras no carrossel.

- 15 out 2026: linha de base do Instagram pelo Metricool.
- 14 out 2026: linha de base de TikTok e Threads registrada a partir do Metricool.
- 14 out 2026, v1: mix notícia + original, força do dia decide o feed, calendário de 7 pilares em semanas A e B, Threads das 19:00 sai da grade.
