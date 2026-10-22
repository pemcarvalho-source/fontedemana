# Revisão semanal das redes da Fonte de Mana

Toda segunda às 8h58 (tarefa agendada "Fonte de Mana: revisão semanal") ou quando o Paulo pedir. A revisão lê o Metricool, faz as contas com `tools/conteudo/revisao.cjs`, escreve o relatório no **documento privado** da estratégia e propõe no máximo três decisões. O Paulo aprova na conversa; só então algo muda no `plano.json`.

**O repositório é público.** Números de desempenho, gastos com anúncio e relatórios nunca são gravados nele: os dados ficam em `/tmp/fdm/revisao/` e o relatório vai para o documento privado (o link está no texto da tarefa agendada). Neste arquivo fica só o procedimento.

## 1. Preparar

1. `node tools/fdm/preparar.cjs . revisao` (ele dá o `HOJE`). Saiu `ERRO:`? Pare e conte o erro na mensagem final.
2. `rm -rf /tmp/fdm/revisao && mkdir -p /tmp/fdm/revisao`. DE = HOJE menos 24 dias, ATE = HOJE menos 1 dia (`date -d "HOJE -24 days" +%F`).

## 2. Puxar os dados do Metricool

Marca `fontedemana8`, brandId 7379615 (se não bater, `getBrandSettings` e use a marca com label `fontedemana8`). Sete chamadas de `getAnalyticsDataByMetrics`, todas com `from` = `DET00:00:00-03:00` e `to` = `ATET23:59:59-03:00`, com as métricas **exatamente nesta ordem** (o script lê as colunas pela posição). Grave cada resposta como veio, `{"rows": [...]}`, com Write, no arquivo indicado:

| Arquivo em /tmp/fdm/revisao/ | metrics |
| --- | --- |
| `tiktok-posts.json` | `["TKPO02","TKPO06","TKPO07","TKPO08","TKPO09","TKPO10","TKPO13","TKPO15","TKPO16","TKPO21"]` |
| `tiktok-evolucao.json` | `["TKEV07","TKEV08"]` |
| `instagram-posts.json` | `["IGPO02","IGPO07","IGPO28","IGPO14","IGPO13","IGPO08","IGPO15","IGPO27","IGPO29"]` |
| `instagram-reels.json` | `["IGRE02","IGRE23","IGRE11","IGRE10","IGRE07","IGRE12","IGRE21","IGRE24","IGRE28"]` |
| `instagram-evolucao.json` | `["IGEV01","IGEV05","IGEV06"]` |
| `threads-posts.json` | `["THPO02","THPO07","THPO08","THPO09","THPO10","THPO11","THPO12","THPO13"]` |
| `threads-evolucao.json` | `["THEV01","THEV06"]` |

Copie as linhas sem mudar nada (nem `null`, nem aspas, nem a ordem). Nas tabelas de evolução, o Metricool acrescenta a data como última coluna; isso é esperado. Uma chamada falhou duas vezes? Siga sem ela: o script avisa o que ficou sem dado.

## 3. Registro de anúncios

No documento privado, aba principal, seção "Revisão semanal", leia a tabela **Registro de campanhas** (com as ferramentas de documento: busca por "Registro de campanhas" e depois a tabela inteira). Grave `/tmp/fdm/revisao/anuncios.json`, uma linha da tabela por item:

    [{"inicio": "2026-11-02", "rede": "instagram", "formato": "carrossel", "peca": "Nome da peça", "objetivo": "Visitas ao perfil", "dias": 3, "gasto": 30}]

- `inicio`: a Data da tabela (DD/MM) com o ano de HOJE (se o mês for maior que o de HOJE, o ano anterior).
- `rede`: `instagram` ou `tiktok`. `formato`: `video` no TikTok; no Instagram, `reels` se a Peça disser Reels, senão `carrossel`.
- `dias` e `gasto` (número, vírgula vira ponto). Linha sem dias ou com "a confirmar" fica de fora, e você conta na mensagem final.

## 4. Fazer as contas

`node tools/conteudo/revisao.cjs . HOJE /tmp/fdm/revisao`. Ele escreve `relatorio.md` e `relatorio.json` na pasta dos dados, com:

- **Janelas**: seguidores de segunda a domingo da semana passada; peças publicadas de HOJE-10 a HOJE-4 (todas com 72 h ou mais no ar). Base = média das duas janelas anteriores, medidas hoje.
- **Placar** com cor por indicador: verde (20% ou mais acima da base), amarelo (entre -20% e +20%), vermelho (20% ou mais abaixo); "2ª semana" quando já estava vermelho na janela anterior. Metas em `plano.json` > `metas`.
- **Veredito**: vermelho se os seguidores orgânicos caem, se as views do TikTok e do Reels caem juntas ou se um desses fica vermelho pela 2ª semana; verde se os seguidores sobem e as views de uma das redes de vídeo também; amarelo no resto.
- **Pago**: peças impulsionadas ficam fora das contas orgânicas; seguidores dos dias com anúncio, atribuídos ao anúncio (descontado o ritmo orgânico) e custo por seguidor.
- **Alertas**: pico de views ou de alcance sem anúncio registrado (provável impulso que o Paulo não contou), anúncio que não casou com peça, arquivo faltando.

## 5. Decidir (no máximo três propostas)

Leia o `relatorio.md` inteiro e proponha até três mudanças, cada uma mexendo numa variável só, com o motivo em números do relatório:

- **Veredito verde**: manter; o pilar ou formato campeão ganha mais espaço (mais um dia ou o feed do dia calmo).
- **Amarelo**: um ajuste na peça que puxou o placar para baixo (gancho, duração, legenda, horário).
- **Vermelho**: trocar o formato ou o pilar do que caiu; vermelho pela 2ª semana sai do calendário.
- **Pilar** no topo da tabela de pilares por 2 revisões seguidas ganha mais um dia; no fim por 2 revisões, troca de formato ou sai (ver a revisão anterior no documento).
- **Anúncio**: só a peça indicada em "Para impulsionar", com as regras de `plano.json` > `anuncio`. Nenhuma passou? Recomende não impulsionar.
- **Testes** da janela (`plano.json` > `testes`): diga quem ganhou e o que vira regra.
- Gancho do TikTok: a % de 6 s não vem pelo Metricool. Peça ao Paulo o print do TikTok Studio (Análise de cada vídeo) dos dois vídeos com mais views.

## 6. Escrever no documento privado

Na aba **Revisões semanais**, insira logo depois do parágrafo que começa com "Uma seção por segunda-feira" (a revisão mais nova fica em cima) o conteúdo do `relatorio.md` e, no fim dele, a seção `### Decisões propostas` com as suas propostas numeradas. Use o markdown como está (títulos, tabelas e listas). Se o documento não abrir ou recusar a escrita, siga: o relatório completo vai na mensagem final.

## 7. Mensagem final

Curta, em português, sem os separadores " · ", " – " ou " — ":
- veredito e as três linhas do placar que mais mudaram (com a base);
- custo por seguidor de cada rede com anúncio;
- as decisões propostas, numeradas, e a peça para impulsionar (ou "não impulsionar");
- o que o Paulo precisa mandar: anúncios não registrados (os alertas), prints do TikTok Studio;
- "Responda com o número das decisões que aprova."

## 8. Quando o Paulo responde nesta conversa

- **Aprovou decisões**: aplique em `tools/conteudo/plano.json` (calendário, grade, testes ou regras) e acrescente uma linha no "Histórico de ajustes" de `tools/conteudo/ESTRATEGIA.md`, sem números de desempenho nem gasto. Rode `node tools/testes/regressao.cjs . 3`; com saída 0 ou 2 (diferença esperada da mudança), commit "Estratégia: <decisão em poucas palavras>" e push, como em `tools/REGRAS.md`. No documento, troque "Decisões propostas" por "Decisões aprovadas em DD/MM".
- **Mandou anúncio**: acrescente a linha na tabela Registro de campanhas do documento (Data, Rede, Peça, Objetivo, Público, Dias, Gasto). Vale também fora da revisão, em qualquer conversa.
- **Mandou print do TikTok Studio**: acrescente a % de 2 s, 6 s e vídeo completo na seção da semana, no documento.

Nunca grave os dados de `/tmp/fdm/revisao/` no repositório.
