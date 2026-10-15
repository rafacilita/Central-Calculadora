#!/usr/bin/env node
/* Re-sincroniza as copias dos dois apps a partir das fontes, injeta a barra de
 * navegacao (e o tema da reemissao) e PROVA que nada mais mudou.
 *
 * A prova: toda linha injetada carrega o marcador "consolidacao:inject". Ao
 * remover essas linhas, o resultado tem de ser byte-identico a fonte. Se nao
 * for, o script falha -- melhor abortar do que publicar uma copia alterada sem
 * ninguem perceber.
 *
 * POR QUE NODE E NAO BASH: no Windows, grep/sed/awk do Git Bash trabalham em
 * modo texto e tratam CRLF como fim de linha, reimprimindo tudo com LF. As
 * fontes tem CRLF (4.275 no app de cotacao, 5.896 no de reemissao), e qualquer
 * um desses comandos apagaria silenciosamente esses \r -- tanto na injecao
 * quanto na verificacao. Aqui tudo e Buffer: nenhuma conversao de encoding ou
 * de fim de linha acontece em lugar nenhum.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ONEDRIVE = "C:/Users/mgfv6541/OneDrive - CVC Brasil Operadora e Agencia de Viagens S.A/Documentos";
const SRC_COTACAO = path.join(ONEDRIVE, "Calc Cotação/rextur-cotacao");
const SRC_REEMISSAO = path.join(ONEDRIVE, "Calculadora Reemissão/dev-fxo/index-dev.html");
const DEST = __dirname;
const MARCA = "consolidacao:inject";

function fail(msg) {
  console.error("\nERRO: " + msg);
  process.exit(1);
}

function rel(p) {
  return path.relative(DEST, p).split(path.sep).join("/");
}

function reporta(dst, extra) {
  const bytes = fs.statSync(dst).size;
  console.log(`  OK  ${String(bytes).padStart(8)} bytes  ${rel(dst)}${extra || ""}`);
}

/* Copia sem nenhuma alteracao e confere byte a byte. */
function copiaExata(src, dst) {
  fs.copyFileSync(src, dst);
  if (!fs.readFileSync(src).equals(fs.readFileSync(dst))) {
    fail(`copia divergiu da fonte: ${rel(dst)}`);
  }
  reporta(dst);
}

/* Remove as linhas que contem o marcador, preservando os bytes das demais
 * (inclusive o \r do CRLF, que fica dentro da propria linha). */
function removeLinhasMarcadas(buf) {
  const mantidas = [];
  let inicio = 0;
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] === 0x0a) {
      const linha = buf.subarray(inicio, i + 1);
      if (linha.indexOf(MARCA) === -1) mantidas.push(linha);
      inicio = i + 1;
    }
  }
  if (inicio < buf.length) {
    const linha = buf.subarray(inicio);
    if (linha.indexOf(MARCA) === -1) mantidas.push(linha);
  }
  return Buffer.concat(mantidas);
}

/* Copia, injeta as linhas antes de </head> e </body>, e prova que a unica
 * diferenca em relacao a fonte sao exatamente essas linhas. */
function copiaComInjecao(src, dst, linhasHead, linhasBody) {
  const orig = fs.readFileSync(src);

  const achaUnico = (tag) => {
    const primeiro = orig.indexOf(tag);
    if (primeiro === -1) fail(`${tag} nao encontrado em ${rel(src)}`);
    if (orig.indexOf(tag, primeiro + 1) !== -1) {
      fail(`esperava exatamente um ${tag} em ${rel(src)}`);
    }
    return primeiro;
  };

  const iHead = achaUnico("</head>");
  const iBody = achaUnico("</body>");
  if (iHead > iBody) fail(`</head> depois de </body> em ${rel(src)}?`);

  // As linhas injetadas usam LF. Isso e indiferente ao que vai pro ar: o
  // .gitattributes normaliza o blob para LF, e fim de linha nao altera o
  // comportamento de HTML/CSS/JS.
  const carga = (linhas) => Buffer.from(linhas.map((l) => l + "\n").join(""), "utf8");
  const cargaHead = carga(linhasHead);
  const cargaBody = carga(linhasBody);

  const montado = Buffer.concat([
    orig.subarray(0, iHead),
    cargaHead,
    orig.subarray(iHead, iBody),
    cargaBody,
    orig.subarray(iBody),
  ]);

  fs.writeFileSync(dst, montado);

  // A PROVA.
  const semInjecao = removeLinhasMarcadas(fs.readFileSync(dst));
  if (!semInjecao.equals(orig)) {
    fail(
      `fora das linhas injetadas, ${rel(dst)} divergiu da fonte\n` +
        `       (fonte ${orig.length} bytes vs ${semInjecao.length} bytes sem as linhas injetadas)`
    );
  }

  const n = linhasHead.length + linhasBody.length;
  reporta(dst, `  (+${n} linha(s) injetada(s); resto identico a fonte)`);
}

// ─────────────────────────────────────────────────────────────────────────────

const L_NAV_CSS = `<link rel="stylesheet" href="../shared/nav.css" /><!-- ${MARCA} -->`;
const L_NAV_JS = `<script src="../shared/nav.js"></script><!-- ${MARCA} -->`;
const L_TEMA_CSS = `<link rel="stylesheet" href="../shared/reemissao-tema.css" /><!-- ${MARCA} -->`;
const L_TEMA_SEED = `<script src="../shared/tema-seed.js"></script><!-- ${MARCA} -->`;

for (const f of [
  path.join(SRC_COTACAO, "index.html"),
  path.join(SRC_COTACAO, "logo-rextur.png"),
  path.join(SRC_COTACAO, "icone.jpg"),
  SRC_REEMISSAO,
]) {
  if (!fs.existsSync(f)) fail(`fonte nao encontrada: ${f}`);
}

console.log("Assets e favicon:");
copiaExata(path.join(SRC_COTACAO, "logo-rextur.png"), path.join(DEST, "cotacao/logo-rextur.png"));
copiaExata(path.join(SRC_COTACAO, "icone.jpg"), path.join(DEST, "cotacao/icone.jpg"));
copiaExata(path.join(SRC_COTACAO, "icone.jpg"), path.join(DEST, "icone.jpg"));

console.log("\nApps (copia + injecao da nav):");
copiaComInjecao(
  path.join(SRC_COTACAO, "index.html"),
  path.join(DEST, "cotacao/index.html"),
  [L_NAV_CSS],
  [L_NAV_JS]
);

// A reemissao leva tambem o override de paleta e a semente de tema claro. O
// tema-seed.js vai no <head> de proposito: precisa rodar antes do script do app
// (que fica no fim do <body>) para o app ja inicializar no tema claro.
copiaComInjecao(
  SRC_REEMISSAO,
  path.join(DEST, "reemissao/index.html"),
  [L_NAV_CSS, L_TEMA_CSS, L_TEMA_SEED],
  [L_NAV_JS]
);

console.log(`\nTudo certo: fora das linhas marcadas com "${MARCA}", as copias sao`);
console.log("byte-identicas as fontes.");
console.log("Proximo passo: git status, depois commit e push.");
