#!/usr/bin/env bash
# Re-sincroniza as copias dos dois apps a partir das fontes e PROVA byte-identidade.
# Falha (exit != 0) se qualquer copia divergir da fonte -- melhor abortar do que
# publicar silenciosamente uma copia errada.
set -euo pipefail

ONEDRIVE="/c/Users/mgfv6541/OneDrive - CVC Brasil Operadora e Agencia de Viagens S.A/Documentos"
SRC_COTACAO="$ONEDRIVE/Calc Cotação/rextur-cotacao"
SRC_REEMISSAO="$ONEDRIVE/Calculadora Reemissão/dev-fxo/index-dev.html"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fail(){ echo "ERRO: $*" >&2; exit 1; }

for f in "$SRC_COTACAO/index.html" "$SRC_COTACAO/logo-rextur.png" "$SRC_COTACAO/icone.jpg" "$SRC_REEMISSAO"; do
  [ -f "$f" ] || fail "fonte nao encontrada: $f"
done

# par "origem|destino"
PAIRS=(
  "$SRC_COTACAO/index.html|$DEST/cotacao/index.html"
  "$SRC_COTACAO/logo-rextur.png|$DEST/cotacao/logo-rextur.png"
  "$SRC_COTACAO/icone.jpg|$DEST/cotacao/icone.jpg"
  "$SRC_COTACAO/icone.jpg|$DEST/icone.jpg"
  "$SRC_REEMISSAO|$DEST/reemissao/index.html"
)

for pair in "${PAIRS[@]}"; do
  src="${pair%%|*}"
  dst="${pair##*|}"
  cp "$src" "$dst"
  # cmp garante conteudo; o tamanho em bytes pega placeholder "cloud-only" do
  # OneDrive, que um hash de arquivo vazio nao denunciaria por si so.
  cmp "$src" "$dst" || fail "copia divergiu da fonte: $dst"
  src_size=$(wc -c < "$src")
  dst_size=$(wc -c < "$dst")
  [ "$src_size" = "$dst_size" ] || fail "tamanho divergiu em $dst ($dst_size vs $src_size)"
  printf "  OK  %8s bytes  %s\n" "$dst_size" "${dst#"$DEST/"}"
done

echo
echo "Todas as copias sao byte-identicas as fontes."
echo "Proximo passo: git status, depois commit e push."
