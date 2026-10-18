# Tarefa "Fonte de Mana diário" (legado)

- ID: trig_01WAPH5MYLtfidUy527mRmk5
- Horário: todo dia às 5h55 (America/Sao_Paulo)
- Texto em uso a partir de 18/10/2026 (busca antes do WebFetch), antes do orquestrador. Para voltar atrás, cole o bloco abaixo como texto da tarefa.

```
Você vai publicar a edição de hoje do Fonte de Mana, o jornal diário de Magic: The Gathering do Paulo (São Paulo, Brasil), no site fontedemana.com.br e gerar o Kit de Redes. O site é o único lugar onde o jornal é publicado; não use a ferramenta Artifact. Ninguém vai responder durante esta execução: decida sozinho. Escreva tudo em português do Brasil.

1. A sessão já abre dentro do repositório do site; trabalhe na própria pasta de abertura, sem clonar de novo. Confira com git remote get-url origin (precisa terminar em pemcarvalho-source/fontedemana) e atualize com git fetch origin main e git checkout -q -B main FETCH_HEAD. Só se a pasta de abertura não for o repositório: git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh e cd gh. Se o clone falhar, espere 30 segundos e tente de novo, até 3 vezes. Se ainda falhar, espere 5 minutos e tente mais 3 vezes; sem o repositório não há como publicar, então nesse caso termine dizendo que o repositório não abriu, com o erro exato. O acesso já vem pronto pelo git do terminal; não procure a ferramenta add_repo.
2. Leia inteiros tools/REGRAS.md e tools/jornal/LEIA.md e siga o LEIA seção por seção, da 1 à 12, sem pular nenhuma (a 11, publicação no site, e a 11b, Kit de Redes com a força do dia, são obrigatórias). Validador: tools/jornal/validar.cjs . Todos os caminhos são relativos à raiz do repositório; rascunhos ficam em /tmp/fdm/ e, no fim, git status --short sai vazio.
3. Termine com a mensagem final da seção 12. Avisos sobre a rotina (créditos, LigaMagic, Scryfall, GitHub, kit, cotação) ficam só nessa mensagem, nunca no site nem no kit.

Páginas da web: nesta execução o WebFetch só abre sem pedir confirmação os links que voltaram numa WebSearch feita aqui; endereço digitado ou montado vira pedido de confirmação que expira sem resposta. Siga a seção "Páginas da web" de tools/REGRAS.md: busque primeiro, com allowed_domains do site (magic.wizards.com, mtgstocks.com, ligamagic.com.br, mtgsalvation.com, commanderspellbook.com; "edhrec Nome da Carta" para o EDHREC; "cotação dólar PTAX hoje" para a cotação), e abra só o link exato que voltou. A conferência depois do push é pelo GitHub, como manda o LEIA, sem WebFetch no site. Se uma página não abrir, siga com o que tiver e conte na mensagem final.
```
