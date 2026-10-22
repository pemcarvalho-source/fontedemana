---
name: fdm-orquestrar
description: Orquestrador das rotinas da Fonte de Mana, o jornal de Magic: The Gathering do Paulo (site fontedemana.com.br, Kit de Redes e pauta de postagem). Use quando uma tarefa agendada ou o Paulo pedir para rodar uma fase da Fonte de Mana (jornal, pauta, noite) ou quando chegarem os áudios do TikTok para juntar a narração.
---

# Orquestrador da Fonte de Mana

Toda execução passa por três etapas: **preparar**, **executar a fase** e **encerrar**. O orquestrador padroniza o começo e o fim; o miolo de cada fase continua nos guias que já existem. O mapa da refatoração e o que muda em cada etapa estão em `tools/rotinas/README.md`.

Ninguém responde durante uma execução agendada: decida sozinho. Escreva em português do Brasil.

## Fases

| Fase | Quando | O miolo | Pastas que pode escrever | Arquivo que confirma a publicação |
| --- | --- | --- | --- | --- |
| `jornal` | 5h55 | `tools/jornal/LEIA.md`, seções 1 a 12 | `data/`, `img/`, `kit/` | `data/edN.js` e `kit/edN/index.html` |
| `pauta` | 7h20 | seção "Fase pauta" abaixo | `pauta/` | `pauta/HOJE/pauta.json` |
| `noite` | 18h21 | `tools/pauta/LEIA.md`, seção "Tarefa da noite: original de amanhã" | `pauta/` | `pauta/AMANHA/pauta.json` |
| `narracao` | quando o Paulo manda os áudios | `tools/pauta/LEIA.md`, seção "Juntar a narração" | `pauta/` | o link do `tiktok-narrado.mp4` |
| `revisao` | segunda, 8h58 | `tools/conteudo/REVISAO.md` | nenhuma (dados em `/tmp/fdm/revisao/`, relatório no documento privado); `tools/conteudo/` só depois que o Paulo aprovar | o relatório na aba Revisões semanais do documento |

## 1. Preparar (todas as fases)

1. Rode `node tools/fdm/preparar.cjs . <fase>`. Ele confere o repositório, atualiza com o main, calcula `HOJE` e `AMANHA` (fuso de São Paulo), cria `/tmp/fdm/` e confere ffmpeg e Chromium.
2. Saiu `ERRO:`? Não tente contornar: pare e use a mensagem de erro na mensagem final. Saiu `AVISOS:`? Siga e repita os avisos na mensagem final.
3. Nas fases `jornal`, `noite`, `narracao` e `revisao`, leia `tools/REGRAS.md` inteiro antes de começar. A fase `pauta` é só script e não precisa.

## 2. Executar a fase

### Fase pauta

1. `node tools/pauta/manha.cjs . HOJE`. Se o resumo disser que a edição ou o kit de hoje ainda não saíram: `git stash -u`, `sleep 600`, `git pull --rebase --depth 50 origin main`, `git stash drop` e o script de novo, no máximo 3 vezes; depois siga com o que tiver.
2. Apareceu `ERROS:` num texto que veio do kit ou do original? Corrija só esse texto em `pauta/HOJE/pauta.json`, sem mudar o sentido, e rode `node tools/pauta/pauta.cjs . HOJE`. Não rode o `manha.cjs` de novo depois de corrigir à mão (ele refaz o arquivo).
3. Mensagem final: o resumo que o script imprimiu depois da linha `---`.

### Fases jornal, noite, narracao e revisao

Siga o guia da tabela, passo a passo, sem pular nenhum. Onde o guia mandar enviar (commit e push), siga as regras de envio abaixo. A fase `revisao` não envia nada ao repositório (ele é público): números e gastos ficam só no documento privado.

## 3. Encerrar (todas as fases)

1. **Enviar**: `git add` só das pastas da fase, `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "<mensagem do guia>"` e `git push origin HEAD:main`. Push recusado por commits novos: `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" pull --rebase --depth 50 origin main` e push de novo. Recusado por permissão ou rede: mais uma tentativa depois de 10 s; depois disso, guarde o erro exato.
2. **Limpar**: `git status --short` precisa sair vazio. Sobrou rascunho dentro do repositório? Mova para `/tmp/fdm/`. Sobrou alteração fora das pastas da fase? Desfaça só essa alteração (`git checkout -- <arquivo>`) e conte na mensagem final.
3. **Conferir**: pelo GitHub, nunca com WebFetch no site. `git fetch -q origin main` e `git cat-file -e origin/main:<arquivo da tabela>`; depois, se a ferramenta do GitHub estiver disponível (ToolSearch "github actions"), `actions_list` com `list_workflow_runs`: a execução "pages build and deployment" com o `head_sha` do seu commit precisa estar `completed` e `success`. Ainda rodando: espere 2 minutos e confira de novo, no máximo 2 vezes.
4. **Mensagem final**: a que a fase pede, sem os separadores " · ", " – " ou " — ". Se algo falhou, diga a etapa e copie o erro exato.

## Limites de toda execução

- Escreva só nas pastas da fase. Nunca altere `index.html`, `CNAME`, `og.jpg`, `favicon.png`, `apple-touch-icon.png`, `lands/`, `README.md`, `tools/` ou `.claude/` durante uma execução agendada.
- Não mexa em tarefas agendadas nem no artifact do jornal. Ferramenta paga do vidIQ só na fase `jornal`, uma busca por dia, como manda o guia.
- WebFetch só em link que voltou numa WebSearch da mesma execução (ver "Páginas da web" em `tools/REGRAS.md`). Endereço digitado ou montado pede confirmação ao Paulo e expira sem resposta.
- Se o Paulo responder na conversa de qualquer fase com os áudios do TikTok, rode a fase `narracao` nessa mesma conversa.
