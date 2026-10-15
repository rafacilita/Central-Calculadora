# Apoio à Consolidação

Ponto de entrada único para as ferramentas de cálculo do atendimento da consolidação.

Publicado em **https://rafacilita.github.io/consolidacao/** (GitHub Pages, branch `main`, raiz).

```
index.html          → página-menu (único arquivo original deste repo)
404.html            → volta para o menu
icone.jpg           → favicon do menu
cotacao/            → Calculadora de Cotação INTER  (cópia byte-idêntica)
reemissao/          → Calculadora de Reemissão FXO  (cópia byte-idêntica)
.nojekyll           → desliga o Jekyll (que pularia arquivos iniciados por "_")
```

## Este repo é uma vitrine, não a fonte dos apps

As duas calculadoras aqui são **cópias byte-idênticas** dos repos onde elas são
desenvolvidas. Nenhuma linha dos apps foi alterada para caberem aqui — cada um é um
documento HTML separado, o que já isola CSS e JS por completo.

Isso é deliberado: fundir os dois num único documento é tecnicamente impossível sem
reescrever funcionalidade. Os dois declaram `const $ = (id) => document.getElementById(id)`
no topo do escopo global (redeclarar `const` é `SyntaxError` fatal), os dois definem
`escapeHtml` e `setStatus`, os IDs `preview` e `statusPill` colidem, e os dois têm CSS
global não escopado (`*`, `body`, `input`, `button`, `.card`, `.hidden`, `.row`, `.grid`).

**Não edite `cotacao/index.html` nem `reemissao/index.html` aqui.** Edite na fonte e
re-sincronize (abaixo). Uma edição feita só aqui é perdida na próxima sincronização.

## Fontes

| Pasta        | Fonte                                                              |
|--------------|--------------------------------------------------------------------|
| `cotacao/`   | repo `rafacilita/rextur-cotacao` → `index.html` + `logo-rextur.png` + `icone.jpg` |
| `reemissao/` | projeto "Calculadora Reemissão" → `dev-fxo/index-dev.html`         |

O app de reemissão é 100% autocontido (as imagens são `data:` URI), então é um arquivo só.
O app de cotação precisa dos dois assets ao lado — as referências são relativas
(`icone.jpg` e `logo-rextur.png`), por isso funcionam igual numa subpasta.

## Re-sincronizar depois de atualizar um app

Rode do diretório deste repo. O script copia e confere byte a byte; se algo divergir,
ele falha em vez de publicar silenciosamente uma cópia errada.

```bash
bash sync.sh
```

Depois: `git status` para ver o que mudou, e commit + push.

## Por que as URLs antigas continuam no ar

Os dois repos originais seguem publicados e intocados:

- https://rafacilita.github.io/rextur-cotacao/
- https://rafacilita.github.io/TESTE---CALCULADORA/

**Atenção ao manter as duas cópias vivas:** `localStorage` é escopado por *origem*, não
por caminho. Como tudo mora em `rafacilita.github.io`, a cópia nova e a antiga leem e
escrevem **as mesmas chaves** (`ra_reemissao_v3`, `cotacao_inter_draft_v1`,
`bcb_fx_cache_v1`). Enquanto as cópias forem idênticas isso é inofensivo. No dia em que
uma for atualizada e a outra não, um rascunho gravado por uma versão pode ser lido por
outra. Por isso o caminho natural é, mais adiante, apontar as URLs antigas para cá.

Se isso for feito, o redirecionamento **tem de ser via JavaScript**
(`location.replace(novaURL + location.hash)`), nunca `<meta refresh>`: o app de
reemissão tem deep-link por fragmento (`#CRR1-...`, lido no carregamento para reabrir um
cálculo salvo) e `<meta refresh>` não preserva o fragmento.
