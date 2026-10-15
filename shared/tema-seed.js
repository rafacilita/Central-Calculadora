/* Deixa o tema CLARO como padrao da Calculadora de Reemissao, para alinhar com
   a Calculadora de Cotacao. Injetado no <head> da copia pelo sync.sh.

   Precisa rodar ANTES do script do app (que fica no fim do <body>): o app le
   localStorage.getItem("ra_calc_theme") || "dark" na inicializacao, entao
   semear a chave aqui faz ele abrir no claro sem precisar editar o JS dele.

   So semeia quando a chave NAO existe -- se o atendente ja escolheu um tema,
   a escolha dele e preservada, e o seletor "Tema" continua funcionando normal.
   Tambem aplica o atributo de uma vez para nao haver piscada de tema escuro
   antes do script do app rodar. */
(function () {
  "use strict";
  var CHAVE = "ra_calc_theme";
  try {
    if (!localStorage.getItem(CHAVE)) localStorage.setItem(CHAVE, "light");
    document.documentElement.dataset.theme = localStorage.getItem(CHAVE) || "light";
  } catch (e) {
    // localStorage bloqueado (modo restrito): cai no padrao do proprio app.
  }
})();
