# Rotinas da Fonte de Mana: estrutura e refatoração

Este arquivo é o mapa da reorganização das rotinas em skills sob um orquestrador, aprovada pelo Paulo em 16/10/2026. Toda sessão que mexer na estrutura atualiza a seção "Andamento".

## Onde queremos chegar

Seis skills em `.claude/skills/`, versionadas junto com os scripts. Scripts fazem o trabalho mecânico; a IA decide e escreve. Cada etapa grava um arquivo e um validador confere esse arquivo antes da próxima começar.

| Skill | Faz | Grava |
| --- | --- | --- |
| `fdm-planejar` | Decide o que criar para site, Instagram, TikTok e Threads: força do dia, pilar, tema e peças por rede | `fdm/DATA/plano.json` |
| `fdm-aprender` | Pesquisa do dia (notícias, regras, combos, história, vocabulário) e base de conhecimento com diretrizes de criação | `fdm/DATA/radar.json` e `conhecimento/` |
| `fdm-criar` | Arte e texto de cada peça: edição do site, carrosséis, vídeos, legendas e Threads | `fdm/DATA/pecas/` |
| `fdm-montar` | Distribui as peças por rede e horário e junta arte com texto (o `manha.cjs` evoluído) | `pauta/DATA/pauta.json` |
| `fdm-analisar` | Lê o Metricool, avalia desempenho por peça, rede e horário e grava recomendações | `desempenho/recomendacoes.json` |
| `fdm-orquestrar` | Ordem das fases, publicação, conferência e aviso | `fdm/DATA/estado.json` |

Tarefas agendadas no fim da migração: madrugada (jornal e pauta numa execução só), noite (original e gravação de amanhã) e domingo (análise completa; mudança de estratégia vai para o Paulo aprovar). A narração continua sob demanda.

## Como migrar sem parar a produção

1. **Fase 0, preparar.** Desenvolvimento em ramo próprio com pull request; as tarefas publicam do `main`. Textos das tarefas guardados em `tools/rotinas/legado/`. Régua de regressão em `tools/testes/regressao.cjs`.
2. **Fase 1, orquestrador casca.** `.claude/skills/fdm-orquestrar/SKILL.md` padroniza preparar, executar e encerrar, chamando os guias de hoje sem mudar o que fazem. A pauta troca primeiro; jornal e noite depois de 2 dias limpos.
3. **Fase 2, extrair as skills**, uma por vez, do menor para o maior risco: montar, criar, planejar, aprender, analisar. Cada skill nova roda 2 ou 3 dias na sombra (`fdm/sombra/`, sem publicar) e só substitui a peça antiga quando a régua sair igual ou melhor.
4. **Fase 3, juntar jornal e pauta** na execução da madrugada. Tarefas antigas ficam desligadas 7 dias antes de serem apagadas.
5. **Fase 4, recursos novos**: animação das artes (Chromium + ffmpeg, sem ferramenta paga), ciclo semanal de feedback com o Metricool, base de conhecimento.

**Voltar atrás** a qualquer momento: colar o texto de `tools/rotinas/legado/<tarefa>.md` na tarefa agendada e, se preciso, `git revert` do commit da mudança.

## Régua de regressão

`node tools/testes/regressao.cjs . [dias]` copia o repositório para uma pasta temporária, roda os scripts de produção sobre os últimos dias e compara com o que foi publicado (validador do jornal, páginas do kit e `pauta.json`). Saída 0 = tudo igual, 1 = script falhou, 2 = diferença. Não altera nada no repositório.

Linha de base: em 16/10/2026 a régua sai igual para ed11, ed10 e a pauta de 16/10. As diferenças de 14/10, 15/10 e da página do kit ed9 vêm de mudanças de código e do plano feitas depois daquelas publicações, e são esperadas.

## Problemas conhecidos (para as próximas fases)

- **Pauta depende do jornal terminar a tempo** (espera de até 30 minutos às 7h20). Resolve na fase 3.
- **Regras repetidas** no texto das tarefas, nos LEIA e no REGRAS; **três validadores** com checagens iguais (separadores, moeda). Unificar na fase 2.
- **Repositório crescendo**: 129 MB em 49 commits (16/10), porque imagens e vídeos ficam no histórico. A limpeza de 7 dias apaga do site, não do histórico. Tirar a mídia do histórico antes de chegar perto de 1 GB.
- **Conectores**: Metricool não está ligado na tarefa do jornal; Spotify e Docs estão ligados sem uso.
- **Tarefa antiga desligada** ("Fonte de Mana diário (antiga, desligada)") ainda existe, com o fluxo do artifact.
- **Calendário muda a cada execução**: o `.ics` grava a hora da geração (DTSTAMP), então rodar a pauta de novo sempre gera um commit, mesmo sem mudança real.
- **Ligar post a resultado** para a análise: cada post precisa de um identificador (código curto na legenda ou casamento por data e hora).

## Andamento

- 16/10/2026: fase 0 e fase 1 entregues no ramo `refatoracao`. A tarefa da pauta passa a usar o orquestrador quando o ramo entrar no `main` (até lá, segue o fluxo antigo). Jornal e noite trocam depois de 2 execuções limpas da pauta. Correção junto: o resumo da pauta saía com ponto duplo quando a força do dia terminava em ponto.
