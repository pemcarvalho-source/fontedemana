# Tarefa "Fonte de Mana diário" (legado)

- ID: trig_01WAPH5MYLtfidUy527mRmk5
- Horário: todo dia às 5h55 (America/Sao_Paulo)
- Texto em uso em 16/10/2026, antes do orquestrador. Para voltar atrás, cole o bloco abaixo como texto da tarefa.

```
Você vai publicar a edição de hoje do Fonte de Mana, o jornal diário de Magic: The Gathering do Paulo (São Paulo, Brasil), no site fontedemana.com.br e gerar o Kit de Redes. O site é o único lugar onde o jornal é publicado; não use a ferramenta Artifact. Ninguém vai responder durante esta execução: decida sozinho. Escreva tudo em português do Brasil.

1. A sessão já abre dentro do repositório do site; trabalhe na própria pasta de abertura, sem clonar de novo. Confira com git remote get-url origin (precisa terminar em pemcarvalho-source/fontedemana) e atualize com git fetch origin main e git checkout -q -B main FETCH_HEAD. Só se a pasta de abertura não for o repositório: git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh e cd gh. Se o clone falhar, espere 30 segundos e tente de novo, até 3 vezes. Se ainda falhar, espere 5 minutos e tente mais 3 vezes; sem o repositório não há como publicar, então nesse caso termine dizendo que o repositório não abriu, com o erro exato. O acesso já vem pronto pelo git do terminal; não procure a ferramenta add_repo.
2. Leia inteiros tools/REGRAS.md e tools/jornal/LEIA.md e siga o LEIA seção por seção, da 1 à 12, sem pular nenhuma (a 11, publicação no site, e a 11b, Kit de Redes com a força do dia, são obrigatórias). Validador: tools/jornal/validar.cjs . Todos os caminhos são relativos à raiz do repositório; rascunhos ficam em /tmp/fdm/ e, no fim, git status --short sai vazio.
3. Termine com a mensagem final da seção 12. Avisos sobre a rotina (créditos, LigaMagic, Scryfall, GitHub, kit, cotação) ficam só nessa mensagem, nunca no site nem no kit.

Endereços que o Paulo autoriza abrir com WebFetch nesta rotina (use exatamente estes):
- Radar: https://magic.wizards.com/en/news/announcements , https://magic.wizards.com/en/news , https://www.mtgstocks.com/news e https://www.ligamagic.com.br/
- Topdeck: https://edhrec.com/cards/ (acrescente o nome da carta em minúsculas com hífens) e https://commanderspellbook.com/search/ (com ?q=card%3A%22<Nome%20codificado>%22)
- Cotação: https://api.frankfurter.dev/v1/latest?from=USD&to=BRL ; se não abrir, PTAX em https://www.noticiasagricolas.com.br/cotacoes/mercado-financeiro/cambio-ptax e https://cotacaododia.com/dolar/ptax/ (o mesmo valor nos dois vale como dois veículos)
- Conferência depois do push: https://fontedemana.com.br/data/ e https://fontedemana.com.br/kit/ (acrescente o arquivo ou a pasta da edição)
Se a página de uma carta ou de um artigo não abrir por falta de permissão, faça uma WebSearch com o nome dela e o site (ex.: "edhrec Nome da Carta") e abra o link exato que aparecer no resultado. Se mesmo assim não abrir, siga com o que tiver e conte na mensagem final.
```
