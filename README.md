# Central Calculadora

Ponto de entrada único para as ferramentas de cálculo do atendimento da consolidação.

Publicado em **https://rafacilita.github.io/Central-Calculadora/** (GitHub Pages, branch `main`, raiz).

```
index.html             → página-menu (arquivo original deste repo)
404.html               → volta para o menu
icone.jpg              → favicon
shared/
  nav.css, nav.js      → barra de navegação, injetada nas duas cópias
  reemissao-tema.css   → alinha a paleta da reemissão à da cotação
  tema-seed.js         → deixa o tema claro como padrão da reemissão
cotacao/               → Calculadora de Cotação INTER  (cópia + nav)
reemissao/             → Calculadora de Reemissão FXO  (cópia + nav + tema)
sync.cjs               → re-sincroniza as cópias e prova que nada mais mudou
.nojekyll              → desliga o Jekyll (que pularia arquivos iniciados por "_")
.gitattributes         → fixa a normalização de fim de linha
```

## Este repo é uma vitrine, não a fonte dos apps

As duas calculadoras aqui são cópias das fontes onde elas são desenvolvidas. **Nenhuma
linha de código dos apps é alterada**: cada cópia é a fonte mais um punhado de linhas
injetadas (2 na cotação, 4 na reemissão), todas marcadas com o comentário
`consolidacao:inject`, que apenas carregam a nav e o tema. Cada app segue sendo um
documento HTML separado, o que já isola CSS e JS por completo.

O `sync.cjs` **prova** isso a cada execução: ele remove as linhas marcadas e compara o
resultado byte a byte com a fonte. Se divergir em qualquer outro ponto, ele aborta em vez
de publicar.

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
| `cotacao/`   | repo `rafacilita/rextur-cotacao` (local: `Documentos/Central Calculadora/cotacao`, branch `main`) → `index.html` + `logo-rextur.png` + `icone.jpg` |
| `reemissao/` | repo `rafacilita/teste-calculadora-2.0` (local: `Documentos/Central Calculadora/reemissao`, branch `master`) → `dev-fxo/index-dev.html` |

O `sync.cjs` lê os arquivos do disco e **aborta** se a fonte não estiver na branch indicada
acima ou tiver alteração não commitada — assim uma branch de trabalho (ex.: refatoração com
PR aberto) não vai ao ar por acidente.

O app de reemissão é 100% autocontido (as imagens são `data:` URI), então é um arquivo só.
O app de cotação precisa dos dois assets ao lado — as referências são relativas
(`icone.jpg` e `logo-rextur.png`), por isso funcionam igual numa subpasta.

## Re-sincronizar depois de atualizar um app

```bash
node sync.cjs
```

Depois: `git status` para ver o que mudou, e commit + push.

É Node, e não shell, de propósito: no Windows o `grep`/`sed`/`awk` do Git Bash trabalham
em modo texto e reimprimem CRLF como LF. As fontes têm CRLF (4.275 `\r` na cotação,
5.896 na reemissão), e qualquer um deles apagaria esses bytes silenciosamente — tanto na
injeção quanto na própria verificação. O `sync.cjs` opera sobre `Buffer`, sem nenhuma
conversão de encoding ou de fim de linha.

## A barra de navegação e o tema

A nav (`shared/nav.*`) é injetada no topo de cada app e também aparece na página-menu.
Clicar troca de página de verdade, então a URL continua real e compartilhável, o deep-link
`#CRR1-...` da reemissão continua funcionando nativamente e o botão voltar se comporta
como o atendente espera. O item da ferramenta já aberta vira rótulo inerte (sem `href`),
para um clique acidental não recarregar a página e descartar o que foi digitado.

Cuidados que o `nav.js`/`nav.css` tomam, porque os dois apps têm **CSS e JS globais**:
- o `nav.js` é uma IIFE que não cria **nenhuma** global — os apps já ocupam de 80 a 143
  nomes no escopo de topo, incluindo `$`;
- todo o CSS vive sob `.raNav`, e as propriedades que os apps definem globalmente em `<a>`
  são reafirmadas, senão a regra global deles venceria;
- nada de `position:sticky`: o app de cotação usa `html{overflow-x:hidden}`, e `overflow`
  em `html`/`body` quebra sticky em parte dos navegadores.

A barra é navy nos dois temas de propósito: é o elemento que unifica as ferramentas, então
não acompanha o claro/escuro de cada uma.

O `reemissao-tema.css` reaponta os ~20 tokens de tema da reemissão para a paleta da
cotação (navy, superfícies chapadas, sem gradiente). **Não** mexe nas cores do e-mail da
agência, da observação do RF nem do formulário SICA: elas são geradas no JavaScript (139
dos 186 hex fixos do arquivo estão depois do `</style>`) e são o documento que vai para
fora — não são interface. Também ficam de pé os acentos de seção da reemissão (ciano,
verde e roxo), que são a diferenciação proposital entre as duas ferramentas.

O `tema-seed.js` roda no `<head>`, antes do script do app, e grava `ra_calc_theme=light`
**somente se a chave ainda não existir** — quem já escolheu um tema mantém a escolha, e o
seletor "Tema" continua funcionando normalmente.

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
