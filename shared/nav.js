/* Monta a barra de navegacao no topo do documento.
   Injetado nas copias pelo sync.sh -- o codigo dos apps nao e alterado.

   IIFE sem nenhuma global: os dois apps declaram "const $ = ..." no topo do
   escopo global, e qualquer global nova daqui poderia colidir com os ~80-143
   nomes de topo que eles ja ocupam. Nada neste arquivo vaza para window.

   Tambem nao mexe em nada que os apps controlam: so insere um <nav> como
   primeiro filho de <body> e nunca toca em outro no da pagina. */
(function () {
  "use strict";

  var FERRAMENTAS = [
    { pasta: "cotacao", rotulo: "Cotação INTER" },
    { pasta: "reemissao", rotulo: "Reemissão" }
  ];
  var SWIRL = ["#ed458f", "#8c4593", "#04a8db", "#f2a75e"];

  // Qual ferramenta esta aberta: olha o segmento de caminho, para funcionar
  // tanto em /cotacao/ quanto em /cotacao/index.html.
  function pastaAtual() {
    var partes = window.location.pathname.split("/").filter(Boolean);
    for (var i = partes.length - 1; i >= 0; i--) {
      for (var j = 0; j < FERRAMENTAS.length; j++) {
        if (partes[i] === FERRAMENTAS[j].pasta) return FERRAMENTAS[j].pasta;
      }
    }
    return "";
  }

  function montar() {
    if (document.querySelector(".raNav")) return; // idempotente

    var atual = pastaAtual();
    // Dentro de uma ferramenta sobe um nivel; na pagina-menu (raiz) fica no
    // lugar. Assim o mesmo arquivo serve a raiz e as subpastas.
    var base = atual ? "../" : "./";

    var nav = document.createElement("nav");
    nav.className = "raNav";
    nav.setAttribute("aria-label", "Ferramentas de apoio à consolidação");

    var inner = document.createElement("div");
    inner.className = "raNavInner";

    var marca = document.createElement("a");
    marca.className = "raNavBrand";
    marca.href = base;
    marca.title = "Voltar ao menu de ferramentas";
    var logo = document.createElement("img");
    logo.className = "raNavLogo";
    logo.src = base + "icone.jpg";
    logo.alt = "";
    logo.setAttribute("aria-hidden", "true");
    marca.appendChild(logo);
    var marcaTxt = document.createElement("span");
    marcaTxt.textContent = "Menu";
    marca.appendChild(marcaTxt);
    inner.appendChild(marca);

    var links = document.createElement("div");
    links.className = "raNavLinks";
    FERRAMENTAS.forEach(function (f) {
      var a = document.createElement("a");
      a.className = "raNavItem";
      a.href = base + f.pasta + "/";
      a.textContent = f.rotulo;
      if (f.pasta === atual) {
        a.setAttribute("aria-current", "page");
        // Ja estamos nela: o link viraria um recarregamento que descartaria o
        // que o atendente digitou. Vira rotulo inerte.
        a.removeAttribute("href");
      }
      links.appendChild(a);
    });
    inner.appendChild(links);
    nav.appendChild(inner);

    var regua = document.createElement("div");
    regua.className = "raNavRule";
    SWIRL.forEach(function (cor) {
      var i = document.createElement("i");
      i.style.background = cor;
      regua.appendChild(i);
    });
    nav.appendChild(regua);

    document.body.insertBefore(nav, document.body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", montar);
  } else {
    montar();
  }
})();
