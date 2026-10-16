---
name: fdm-orquestrar
description: Orquestrador das rotinas da Fonte de Mana, o jornal de Magic: The Gathering do Paulo (site fontedemana.com.br, Kit de Redes e pauta de postagem). Use quando uma tarefa agendada ou o Paulo pedir para rodar uma fase da Fonte de Mana (jornal, pauta, noite) ou quando chegarem os áudios do TikTok para juntar a narração.
---

# Orquestrador da Fonte de Mana

Toda execução passa por três etapas: **preparar**, **executar a fase** e **encerrar**. O orquestrador padroniza o começo e o fim; o miolo de cada fase continua nos guias que já existem. O mapa da refatoração e o que muda em cada etapa estão em `tools/rotinas/README.md`.

Ninguém responde durante uma execução agendada: decida sozinho. Escreva em português do Brasil.

## Fases

| Fase | Quando | O miolo | Pastas que pode escrever | Conferência no site |
| --- | --- | --- | --- | --- |
| `jornal` | 5h55 | `tools/jornal/LEIA.md`, seções 1 a 12 | `data/`, `img/`, `kit/` | `https://fontedemana.com.br/data/edN.js` e `https://fontedemana.com.br/kit/edN/` |
| `pauta` | 7h20 | seção "Fase pauta" abaixo | `pauta/` | `https://fontedemana.com.br/pauta/HOJE/` |
| `noite` | 18h21 | `tools/pauta/LEIA.md`, seção "Tarefa da noite: original de amanhã" | `pauta/` | `https://fontedemana.com.br/pauta/AMANHA/` |
| `narracao` | quando o Paulo manda os áudios | `tools/pauta/LEIA.md`, seção "Juntar a narração" | `pauta/` | o link do `tiktok-narrado.mp4` |

## 1. Preparar (todas as fases)

1. Rode `node tools/fdm/preparar.cjs . <fase>`. Ele confere o repositório, atualiza com o main, calcula `HOJE` e `AMANHA` (fuso de São Paulo), cria `/tmp/fdm/` e confere ffmpeg e Chromium.
2. Saiu `ERRO:`? Não tente contornar: pare e use a mensagem de erro na mensagem final. Saiu `AVISOS:`? Siga e repita os avisos na mensagem final.
3. Nas fases `jornal`, `noite` e `narracao`, leia `tools/REGRAS.md` inteiro antes de começar. A fase `pauta` é só script e não precisa.

## 2. Executar a fase

### Fase pauta

1. `node tools/pauta/manha.cjs . HOJE`. Se o resumo disser que a edição ou o kit de hoje ainda não saíram: `git stash -u`, `sleep 600`, `git pull --rebase --depth 50 origin main`, `git stash drop` e o script de novo, no máximo 3 vezes; depois siga com o que tiver.
2. Apareceu `ERROS:` num texto que veio do kit ou do original? Corrija só esse texto em `pauta/HOJE/pauta.json`, sem mudar o sentido, e rode `node tools/pauta/pauta.cjs . HOJE`. Não rode o `manha.cjs` de novo depois de corrigir à mão (ele refaz o arquivo).
3. Mensagem final: o resumo que o script imprimiu depois da linha `---`.

### Fases jornal, noite e narracao

Siga o guia da tabela, passo a passo, sem pular nenhum. Onde o guia mandar enviar (commit e push), siga as regras de envio abaixo.

## 3. Encerrar (todas as fases)

1. **Enviar**: `git add` só das pastas da fase, `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" commit -m "<mensagem do guia>"` e `git push origin HEAD:main`. Push recusado por commits novos: `git -c user.name="Paulo Eduardo" -c user.email="pemcarvalho@gmail.com" pull --rebase --depth 50 origin main` e push de novo. Recusado por permissão ou rede: mais uma tentativa depois de 10 s; depois disso, guarde o erro exato.
2. **Limpar**: `git status --short` precisa sair vazio. Sobrou rascunho dentro do repositório? Mova para `/tmp/fdm/`. Sobrou alteração fora das pastas da fase? Desfaça só essa alteração (`git checkout -- <arquivo>`) e conte na mensagem final.
3. **Conferir**: uns 2 minutos depois do push, WebFetch no endereço da tabela. Se ainda não aparecer, espere mais 2 minutos e confira uma última vez.
4. **Mensagem final**: a que a fase pede, sem os separadores " · ", " – " ou " — ". Se algo falhou, diga a etapa e copie o erro exato.

## Limites de toda execução

- Escreva só nas pastas da fase. Nunca altere `index.html`, `CNAME`, `og.jpg`, `favicon.png`, `apple-touch-icon.png`, `lands/`, `README.md`, `tools/` ou `.claude/` durante uma execução agendada.
- Não mexa em tarefas agendadas nem no artifact do jornal. Ferramenta paga do vidIQ só na fase `jornal`, uma busca por dia, como manda o guia.
- Os endereços que podem ser abertos com WebFetch são os do texto da tarefa agendada e os de conferência da tabela acima.
- Se o Paulo responder na conversa de qualquer fase com os áudios do TikTok, rode a fase `narracao` nessa mesma conversa.
