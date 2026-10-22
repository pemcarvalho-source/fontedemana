# Regras comuns da Fonte de Mana

Valem para o jornal, o Kit de Redes, a pauta e os conteúdos originais. Cada rotina lê este arquivo uma vez, no começo.

## Texto

- Português do Brasil, como alguém da comunidade de Commander falando com outros jogadores. Vocabulário da mesa (precon, staple, fichário, pré, lacrado, comandante, as 99, a galera, bombando, topdeck, blink, ramp), tom leve e direto, sem gíria forçada.
- Frases curtas. Nada de fórmulas de IA ("Vale ressaltar", "Em suma", "É importante destacar", "Neste cenário").
- Proibido usar ponto, travessão, meia-risca ou ponto médio como separador: nada de " · ", " – ", " — " ou "—". Intervalos: "6 a 12 nov". Para encadear, vírgula, "e" ou frase nova.
- Nos campos que viram imagem ou página, só as tags `<b>` e `<i>`; `&` vira `&amp;`. Legendas e posts de Threads são texto puro.
- Explicação de mecânica "for dummies" sem ser infantil: o que acontece na mesa, com exemplo concreto, sem copiar o texto da carta.
- Nunca escrever "Gerado pelo Claude" nem falar de IA no conteúdo. Conteúdo sem rosto: tela, cartas e a voz do Paulo.
- Avisos sobre o funcionamento das rotinas (créditos, site que não abriu, imagem que falhou, erro de envio) só na mensagem final da tarefa. Nunca na página, no kit, na pauta ou em post.

## Fatos e fontes

- Fontes primárias valem sozinhas: anúncios da Wizards (magic.wizards.com, wpn.wizards.com, magic.gg) e páginas da LigaMagic (fonte da verdade no Brasil; em regra, ban ou lista oficial, se divergir, vale a Wizards). Preço em dólar do MTGStocks ou do Scryfall vale sozinho como preço. Anúncio de evento da própria loja vale para aquele evento.
- Todo o resto precisa de duas fontes independentes. Fonte única, rumor, vazamento ou estimativa só como rumor (Sussurros), dizendo que não foi confirmado.
- Dado de carta sempre do Scryfall; número de decks do EDHREC; combo do Commander Spellbook; regra das Regras Abrangentes ou dos rulings oficiais.
- Nunca inventar número, data, preço ou estatística. Parafrasear sempre; no máximo uma citação de menos de 15 palavras por fonte.
- Vídeo de criador nunca é fonte de fato sozinho.

## Páginas da web (WebFetch)

- Nas execuções agendadas, o WebFetch só abre sem pedir confirmação os links que vieram no resultado de uma WebSearch da mesma execução. Endereço digitado ou montado, inclusive os que aparecem no texto da tarefa ou num LEIA, vira pedido de confirmação ao Paulo, que expira sem resposta de madrugada.
- Por isso: nunca WebFetch em endereço montado. Primeiro WebSearch (de preferência com `allowed_domains` do site), depois WebFetch no link exato que voltou. As páginas de índice também aparecem na busca (ex.: `magic.wizards.com/en/news/announcements`, `mtgstocks.com/news`).
- Buscas de referência:
  - Wizards: `allowed_domains` ["magic.wizards.com"], "Magic announcements <mês> <ano>" e, se precisar, o assunto.
  - MTGStocks: ["mtgstocks.com"], "MTGStocks news <mês> <ano>" (ou "Weekly Winners <ano>").
  - LigaMagic: ["ligamagic.com.br"], o assunto do dia.
  - MTG Salvation: ["mtgsalvation.com"], "MTG Salvation news <mês> <ano>" (notícias em `/news`, cartas reveladas em `/spoilers`). Notícia dele é fonte secundária e o fórum é rumor.
  - EDHREC: "edhrec <Nome da Carta>". `edhrec.com` e `edhrecstatic.com` têm o mesmo conteúdo e valem igual.
  - Commander Spellbook: ["commanderspellbook.com"], "<Nome da Carta> combo". Vale o link da busca (`/search/?q=...`) ou os de combo (`/combo/...`).
  - Cotação: "cotação dólar PTAX hoje" (ver Moeda).
- O WebFetch de um link da busca falhou ou pediu permissão? Não repita nem contorne: use outro resultado ou o trecho da própria busca, e conte na mensagem final.
- Nada de WebFetch no próprio site para conferir publicação: a conferência é pelo GitHub (ver "Repositório e convivência").

## Moeda

- Todo valor em dinheiro: dólar primeiro e real entre parênteses, "US$ 29,99 (R$ 150,10)". Reais = dólares × cotação, duas casas, formato brasileiro.
- Cotação: PTAX do Banco Central, achada como manda "Páginas da web" (abaixo): WebSearch "cotação dólar PTAX hoje" e abra dois resultados de veículos diferentes (ex.: numerando.com.br, noticiasagricolas.com.br, cotacaododia.com). Vale o mesmo valor, do mesmo tipo (compra ou venda) e da mesma data nos dois, com no máximo 4 dias. Valores diferentes nos dois: abra um terceiro e use o que se repetir. Sem dois iguais, só o dólar e nenhuma nota. Fonte na nota: "Banco Central (PTAX)".
- Peça com valor convertido leva a nota com data e fonte da cotação (ex.: "Valores em reais pela cotação de 9 out (Banco Central Europeu)."). Na fala: o dólar e depois "uns X reais", arredondado.
- Preço que só existe em reais (LigaMagic ou loja brasileira) aparece em reais, com a fonte, sem conversão.
- Percentuais não se convertem. Valor que já está entre parênteses: reescreva para não abrir parênteses dentro de parênteses.

## Fan Content

Aviso, em inglês, exatamente assim:

    Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

Fica no rodapé do site, no fim das legendas do Instagram e do TikTok, nos posts de Threads com imagem ou vídeo e como último post do fio. Os scripts acrescentam sozinhos; não escreva o aviso nos arquivos JSON. Nunca usar logo ou marca da Wizards.

## Imagens do Scryfall

    UA="FonteDeMana/1.0 (jornal pessoal)"
    curl -sS -G -H "User-Agent: $UA" -H "Accept: application/json" --data-urlencode 'q=!"Nome Exato"' --data-urlencode unique=prints --data-urlencode order=released "https://api.scryfall.com/cards/search" -o /tmp/fdm/busca.json

- Espere 0,2 s entre chamadas. O endpoint `/cards/named` falha com cartas recém-reveladas.
- Impressão em inglês, não digital, de preferência a mais conhecida. `image_uris.art_crop` para arte de fundo, `image_uris.large` para a carta (duas faces: `card_faces[0].image_uris`).
- Abra cada imagem baixada com Read para conferir a carta e o JPEG. Sem resposta depois de 2 tentativas, siga sem imagem (os scripts usam a arte do terreno) e avise no final.

## Repositório e convivência

- Pasta de trabalho: a sessão já abre dentro do repositório. No começo, confira com `git remote get-url origin` (termina em `pemcarvalho-source/fontedemana`) e atualize com `git fetch origin main` e `git checkout -q -B main FETCH_HEAD`.
- Só se a pasta de abertura não for o repositório: `git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh` (se falhar, espere 10 s e tente de novo) e `cd gh`. O acesso já vem pelo git do terminal; não procure a ferramenta add_repo.
- Os caminhos dos LEIA são relativos à raiz do repositório; rode os comandos de dentro dela.
- Rascunhos (busca do Scryfall, áudios recebidos, testes) ficam em `/tmp/fdm/` (`mkdir -p /tmp/fdm`), fora do repositório. No fim, `git status --short` sai vazio.
- Commit: `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "<mensagem>"` e `git push origin HEAD:main`.
- Conferir a publicação (não use WebFetch no site): `git fetch -q origin main` e `git cat-file -e origin/main:<arquivo>` (sai sem erro se o arquivo está no main). Depois, se a ferramenta do GitHub estiver disponível (ToolSearch "github actions"), `actions_list` com method `list_workflow_runs` em pemcarvalho-source/fontedemana: a execução "pages build and deployment" com `head_sha` igual ao do seu commit precisa estar `completed` e `success` (leva 1 a 2 minutos; espere 2 minutos e confira de novo até 2 vezes). Sem a ferramenta do GitHub, vale só o `git cat-file`, e diga isso na mensagem final.
- Push recusado por commits novos ("fetch first", "non-fast-forward"): `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" pull --rebase --depth 50 origin main` e push de novo. Recusado por permissão ou rede: mais uma tentativa depois de 10 s; depois disso, guarde o erro exato para a mensagem final.
- Cada rotina escreve só nas suas pastas. Jornal: `data/`, `img/` e `kit/`. Pauta e originais: `pauta/`. Ninguém altera `index.html`, `CNAME`, `og.jpg`, `favicon.png`, `apple-touch-icon.png`, `lands/`, `README.md`, `tools/` ou `.claude/` durante uma execução agendada.
- Orquestrador: as tarefas agendadas entram por `.claude/skills/fdm-orquestrar/SKILL.md`; o mapa da estrutura está em `tools/rotinas/README.md`.
- Nenhuma rotina mexe em tarefas agendadas. Só o jornal usa ferramenta paga do vidIQ (uma busca por dia).
- Estratégia e calendário: `tools/conteudo/ESTRATEGIA.md` e `tools/conteudo/plano.json`. Revisão semanal: `tools/conteudo/REVISAO.md`.
- O repositório é público. Números de desempenho das redes, gastos com anúncio e relatórios da revisão nunca entram nele (nem em commit, nem na pauta): ficam no documento privado da estratégia.
