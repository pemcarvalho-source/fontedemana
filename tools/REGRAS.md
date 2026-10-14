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

## Moeda

- Todo valor em dinheiro: dólar primeiro e real entre parênteses, "US$ 29,99 (R$ 150,10)". Reais = dólares × cotação, duas casas, formato brasileiro.
- Cotação: WebFetch em `https://api.frankfurter.dev/v1/latest?from=USD&to=BRL`, aceita se `date` tiver no máximo 4 dias. Se falhar, PTAX publicada em bcb.gov.br ou o mesmo valor em dois veículos confiáveis da mesma data. Sem cotação confiável, só o dólar e nenhuma nota.
- Peça com valor convertido leva a nota com data e fonte da cotação (ex.: "Valores em reais pela cotação de 9 out (Banco Central Europeu)."). Na fala: o dólar e depois "uns X reais", arredondado.
- Preço que só existe em reais (LigaMagic ou loja brasileira) aparece em reais, com a fonte, sem conversão.
- Percentuais não se convertem. Valor que já está entre parênteses: reescreva para não abrir parênteses dentro de parênteses.

## Fan Content

Aviso, em inglês, exatamente assim:

    Fonte de Mana is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.

Fica no rodapé do site, no fim das legendas do Instagram e do TikTok, nos posts de Threads com imagem ou vídeo e como último post do fio. Os scripts acrescentam sozinhos; não escreva o aviso nos arquivos JSON. Nunca usar logo ou marca da Wizards.

## Imagens do Scryfall

    UA="FonteDeMana/1.0 (jornal pessoal)"
    curl -sS -G -H "User-Agent: $UA" -H "Accept: application/json" --data-urlencode 'q=!"Nome Exato"' --data-urlencode unique=prints --data-urlencode order=released "https://api.scryfall.com/cards/search" -o busca.json

- Espere 0,2 s entre chamadas. O endpoint `/cards/named` falha com cartas recém-reveladas.
- Impressão em inglês, não digital, de preferência a mais conhecida. `image_uris.art_crop` para arte de fundo, `image_uris.large` para a carta (duas faces: `card_faces[0].image_uris`).
- Abra cada imagem baixada com Read para conferir a carta e o JPEG. Sem resposta depois de 2 tentativas, siga sem imagem (os scripts usam a arte do terreno) e avise no final.

## Repositório e convivência

- Clone: `git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh` (se falhar, espere 10 s e tente de novo). O acesso já vem pelo git do terminal; não procure a ferramenta add_repo.
- Commit: `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "<mensagem>"` e `git push origin HEAD:main`.
- Push recusado por commits novos ("fetch first", "non-fast-forward"): `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" pull --rebase --depth 50 origin main` e push de novo. Recusado por permissão ou rede: mais uma tentativa depois de 10 s; depois disso, guarde o erro exato para a mensagem final.
- Cada rotina escreve só nas suas pastas. Jornal: `data/`, `img/` e `kit/`. Pauta e originais: `pauta/`. Ninguém altera `index.html`, `CNAME`, `og.jpg`, `favicon.png`, `apple-touch-icon.png`, `lands/`, `README.md` ou `tools/` durante uma execução agendada.
- Nenhuma rotina mexe em tarefas agendadas. Só o jornal usa ferramenta paga do vidIQ (uma busca por dia).
- Estratégia e calendário: `tools/conteudo/ESTRATEGIA.md` e `tools/conteudo/plano.json`.
