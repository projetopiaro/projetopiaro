#!/usr/bin/env python3
"""Valida que os links relativos dentro de docs/ resolvem para arquivos existentes
e alerta sobre referencias a documentos removidos ou ainda nao escritos.

Nao usa os.path.isfile repetidamente: neste ambiente, com muitos descritores
abertos, isfile retorna False para caminhos que existem. Monta um indice
unico via os.walk e consulta esse indice.

Uso: python3 scripts/check-doc-links.py
Sai com codigo 1 se houver link quebrado.
"""

import os
import re
import sys

DOCS = "docs"

LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")
REMOVIDOS = ("DOCUMENTACAO-SISTEMA-ECOMMERCE-DIGITAL.md", "ESTUDO-STACK-TECNOLOGICA.md")

PREVISTOS = {
    "docs/GUIAS/VALIDACAO.md", "docs/GUIAS/DEBUG.md",
    "docs/REFERENCIAS/GLOSSARIO.md", "docs/REFERENCIAS/ABREVIACOES.md",
    "docs/REFERENCIAS/EXTERNAL.md",
    "docs/FUNDACOES/03-PADROES-CODIGO.md", "docs/FUNDACOES/04-ESTRUTURA-PROJETO.md",
    "docs/DOMINIO/02-DOMINIO-NEGOCIO.md",
}

# Frases que legitimam citar um monolito removido.
CONTEXTO_PERMITIDO = ("<!--", "quebrad", "movido", "era a fonte", "foram quebrados")


def indice_docs(raiz):
    arquivos = set()
    pastas_com_indice = set()
    for dirpath, _dirnames, filenames in os.walk(raiz):
        for nome in filenames:
            arquivos.add(os.path.normpath(os.path.join(dirpath, nome)))
        if "README.md" in filenames:
            pastas_com_indice.add(os.path.normpath(dirpath))
    # frozenset: imutavel, elimina rehash durante a verificacao
    return frozenset(arquivos), frozenset(pastas_com_indice)


def main():
    indice, pastas_com_indice = indice_docs(DOCS)
    markdown = sorted(p for p in indice if p.endswith(".md"))

    erros = []
    avisos = []
    total = 0

    for caminho in markdown:
        with open(caminho, encoding="utf-8") as fh:
            texto = fh.read()
        pasta = os.path.dirname(caminho)

        for rotulo, destino in LINK_RE.findall(texto):
            if destino.startswith(("http://", "https://", "#", "mailto:")):
                continue

            alvo = destino.split("#")[0]
            if not alvo:
                continue

            total += 1
            resolvido = os.path.normpath(os.path.join(pasta, alvo))

            if resolvido in indice:
                continue
            if resolvido in pastas_com_indice:
                continue

            relativo = os.path.relpath(resolvido, ".")
            if relativo in PREVISTOS:
                avisos.append(f"{caminho}: [{rotulo}]({destino}) previsto, ainda nao escrito")
                continue

            erros.append(f"{caminho}: [{rotulo}]({destino}) -> {relativo} NAO EXISTE")

        for removido in REMOVIDOS:
            if removido not in texto:
                continue
            for linha in texto.split("\n"):
                if removido not in linha:
                    continue
                if any(c in linha for c in CONTEXTO_PERMITIDO):
                    continue
                avisos.append(f"{caminho}: menciona {removido} -> \"{linha.strip()[:70]}\"")

    print(f"Links relativos verificados: {total}")
    print(f"Documentos .md indexados:    {len(markdown)}")
    print(f"Diretorios com indice:      {len(pastas_com_indice)}")
    print()

    for a in avisos:
        print(f"aviso: {a}")
    if avisos:
        print()

    if erros:
        print(f"ERROS ({len(erros)}):")
        for e in erros:
            print(f"  {e}")
        sys.exit(1)

    print(f"Nenhum link quebrado. {len(avisos)} aviso(s).")


if __name__ == "__main__":
    main()