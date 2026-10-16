# Tarefa "Fonte de Mana: pauta do dia" (legado)

- ID: trig_01Cb5MK539YyZd97tMARQEZz
- Horário: todo dia às 7h20 (America/Sao_Paulo)
- Texto em uso em 16/10/2026, antes do orquestrador. Para voltar atrás, cole o bloco abaixo como texto da tarefa.

```
Você monta a pauta de postagem de hoje da Fonte de Mana, o jornal de Magic: The Gathering do Paulo (São Paulo, Brasil). Um script faz a montagem; você roda, corrige se precisar e envia. Ninguém vai responder durante esta execução: decida sozinho. Escreva em português do Brasil.

1. A sessão já abre dentro do repositório; trabalhe na própria pasta de abertura, sem clonar de novo. Confira com git remote get-url origin (precisa terminar em pemcarvalho-source/fontedemana) e atualize com git fetch origin main e git checkout -q -B main FETCH_HEAD. Só se a pasta de abertura não for o repositório: git clone --depth 1 https://github.com/pemcarvalho-source/fontedemana ./gh (se falhar, espere 10 segundos e tente mais uma vez; o acesso já vem pelo git do terminal, não procure a ferramenta add_repo) e cd gh. HOJE é a saída de: TZ=America/Sao_Paulo date +%F
2. Rode: node tools/pauta/manha.cjs . HOJE (troque HOJE pela data). Se o resumo disser que a edição ou o kit de hoje ainda não saíram, rode git stash -u, sleep 600, git pull --rebase --depth 50 origin main, git stash drop e o script de novo, no máximo 3 vezes; depois siga com o que tiver.
3. Se aparecer ERROS: num texto que veio do kit ou do original, corrija só esse texto em pauta/HOJE/pauta.json, sem mudar o sentido, e rode node tools/pauta/pauta.cjs . HOJE (não rode o manha.cjs de novo depois de corrigir à mão).
4. Envie só a pasta pauta/: git add pauta, git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "Pauta de HOJE" e git push origin HEAD:main . Se o push for recusado por commits novos, git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" pull --rebase --depth 50 origin main e push de novo; se falhar por permissão ou rede, tente uma vez depois de 10 segundos e guarde o erro exato. Rascunhos ficam em /tmp/fdm/, nunca dentro do repositório; no fim, git status --short sai vazio. Não chame ferramentas pagas do vidIQ, não mexa em tarefas agendadas nem no artifact do jornal.
5. Uns 2 minutos depois do push, confira com WebFetch https://fontedemana.com.br/pauta/HOJE/ .
6. Mensagem final: o resumo que o script imprimiu depois da linha ---, sem os separadores " · ", " – " ou " — ". Se algo falhou, diga a etapa e o erro exato.

Se depois disso o Paulo responder nesta conversa com os áudios das cenas do TikTok, leia tools/pauta/LEIA.md (na pasta do repositório), siga a seção "Juntar a narração" e devolva o link do vídeo narrado.
```
