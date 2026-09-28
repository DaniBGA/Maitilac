#!/usr/bin/env python3
"""
Convierte un fragmento del HTML del sitio viejo (referencia/index.html) a JSX,
pasando cada atributo style="" a una clase con los MISMOS valores, para la capa
CSS "en-linea" (ver docs/PASO A PASO.md, "Estrategia de estilos").

Uso:
  python3 scripts/html_a_jsx.py <desde> <hasta> <prefijo> [--css salida.css] [--jsx salida.jsx]

  desde/hasta: líneas de referencia/index.html (inclusive)
  prefijo:     prefijo de las clases generadas (ej. "ini" → .ini-1, .ini-2 …)

Qué hace:
  - class → className, for → htmlFor, atributos SVG con guion → camelCase
  - <a href="#" data-go="x"> → <Link href="/x" data-go="x"> (se conserva data-go:
    el CSS del sitio viejo lo usa en selectores)
  - rutas "img/…" y "fondo-hero.jpg" → absolutas ("/img/…")
  - espacios: reproduce los espacios que HTML renderiza entre texto y elementos
    (JSX descarta los saltos de línea)
  - estilos repetidos dentro del mismo prefijo comparten clase
El resultado se revisa a mano: los contenedores que llenaba el JavaScript viejo
(ej. id="home-products") quedan vacíos para reemplazarlos por componentes.
"""
import html
import json
import re
import sys
from html.parser import HTMLParser

VACIOS = {"img", "br", "input", "hr", "meta", "link", "source", "area", "col", "wbr"}
INLINE = {"span", "a", "p", "em", "strong", "b", "i", "label", "h1", "h2", "h3", "h4", "h5", "h6",
          "button", "small", "li", "td", "th", "option", "text", "tspan"}

ATRIBUTOS = {
    "class": "className", "for": "htmlFor", "tabindex": "tabIndex", "maxlength": "maxLength",
    "readonly": "readOnly", "autocomplete": "autoComplete", "colspan": "colSpan",
    "rowspan": "rowSpan", "srcset": "srcSet", "crossorigin": "crossOrigin",
    "viewbox": "viewBox", "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits", "gradienttransform": "gradientTransform",
    "patternunits": "patternUnits", "stddeviation": "stdDeviation", "xlink:href": "xlinkHref",
    "xmlns:xlink": "xmlnsXlink", "xml:space": "xmlSpace", "enablebackground": "enableBackground",
    "autoplay": "autoPlay", "playsinline": "playsInline", "novalidate": "noValidate",
    "inputmode": "inputMode", "enterkeyhint": "enterKeyHint",
}
ETIQUETAS_SVG = {
    "lineargradient": "linearGradient", "radialgradient": "radialGradient", "clippath": "clipPath",
    "textpath": "textPath", "fegaussianblur": "feGaussianBlur", "foreignobject": "foreignObject",
    "feoffset": "feOffset", "feblend": "feBlend", "fecolormatrix": "feColorMatrix",
}


def camel(nombre):
    if nombre in ATRIBUTOS:
        return ATRIBUTOS[nombre]
    if nombre.startswith(("data-", "aria-")):
        return nombre
    return re.sub(r"-([a-z])", lambda m: m.group(1).upper(), nombre)


def ruta_absoluta(valor):
    if valor.startswith("img/") or valor == "fondo-hero.jpg":
        return "/" + valor
    return valor


def valor_jsx(valor):
    if re.search(r'["&{}<>\\]', valor):
        return "{" + json.dumps(valor, ensure_ascii=False) + "}"
    return '"' + valor + '"'


def texto_jsx(t):
    t = re.sub(r"([{}<>&])", lambda m: '{"' + m.group(1) + '"}', t)
    return t.replace('"', "&quot;").replace("'", "&apos;")


class Nodo:
    def __init__(self, tag, attrs=None, padre=None):
        self.tag, self.attrs, self.padre, self.hijos = tag, attrs or [], padre, []


class Conversor(HTMLParser):
    def __init__(self, prefijo):
        super().__init__(convert_charrefs=True)
        self.prefijo = prefijo
        self.raiz = Nodo("#raiz")
        self.actual = self.raiz
        self.estilos = {}  # estilo → (clase, descripción)
        self.usa_link = False

    def handle_starttag(self, tag, attrs):
        n = Nodo(tag, attrs, self.actual)
        self.actual.hijos.append(n)
        if tag not in VACIOS:
            self.actual = n

    def handle_startendtag(self, tag, attrs):
        self.actual.hijos.append(Nodo(tag, attrs, self.actual))

    def handle_endtag(self, tag):
        # Cierres sueltos (el sitio viejo tiene un </section> de más): se ignoran,
        # igual que hace el navegador.
        n = self.actual
        while n is not self.raiz and n.tag != tag:
            n = n.padre
        if n is not self.raiz:
            self.actual = n.padre

    def handle_data(self, data):
        self.actual.hijos.append(data)

    def handle_comment(self, data):
        self.actual.hijos.append(("#comentario", data))

    # ---------- salida ----------
    def clase_para(self, estilo, tag, attrs):
        estilo = estilo.strip().rstrip(";").strip()
        estilo = re.sub(r"url\((['\"]?)img/", r"url(\1/img/", estilo)
        if estilo not in self.estilos:
            desc = tag
            for k, v in attrs:
                if k in ("class", "id") and v:
                    desc += ("." if k == "class" else "#") + v.split()[0]
                    break
            self.estilos[estilo] = (f"{self.prefijo}-{len(self.estilos) + 1}", desc)
        return self.estilos[estilo][0]

    def attrs_jsx(self, n):
        clases, salida, tag = [], [], n.tag
        attrs = dict(n.attrs)
        es_link = tag == "a" and attrs.get("href") == "#" and "data-go" in attrs
        for k, v in n.attrs:
            if k == "class":
                clases = (v or "").split() + clases
            elif k == "style":
                if v and v.strip():
                    clases.append(self.clase_para(v, tag, n.attrs))
            elif es_link and k == "href":
                destino = attrs["data-go"]
                salida.append(f'href="{"/" if destino == "home" else "/" + destino}"')
            elif v is None:
                salida.append(camel(k))
            elif k in ("rows", "cols", "size", "span", "maxlength", "tabindex", "colspan", "rowspan") and v.isdigit():
                salida.append(f"{camel(k)}={{{v}}}")
            else:
                if k in ("src", "href"):
                    v = ruta_absoluta(v)
                salida.append(f"{camel(k)}={valor_jsx(v)}")
        if clases:
            salida.insert(0, f'className="{" ".join(clases)}"')
        return salida, es_link

    def jsx(self, n, nivel=0):
        pad = "  " * nivel
        if isinstance(n, tuple):
            return pad + "{/* " + n[1].strip().replace("*/", "* /") + " */}"
        attrs, es_link = self.attrs_jsx(n)
        tag = "Link" if es_link else ETIQUETAS_SVG.get(n.tag, n.tag)
        if es_link:
            self.usa_link = True
        apertura = f"<{tag}" + ("" if not attrs else " " + " ".join(attrs))
        if n.tag in VACIOS:
            return pad + apertura + " />"
        hijos = self.hijos_jsx(n, nivel + 1)
        if not hijos:
            return pad + apertura + f"></{tag}>"
        if len(hijos) == 1 and "\n" not in hijos[0] and len(pad + apertura + hijos[0]) < 150:
            return pad + apertura + ">" + hijos[0].strip() + f"</{tag}>"
        return pad + apertura + ">\n" + "\n".join(hijos) + "\n" + pad + f"</{tag}>"

    def hijos_jsx(self, n, nivel):
        pad = "  " * nivel
        inline = n.tag in INLINE
        hijos, lista = [], n.hijos
        for i, h in enumerate(lista):
            if isinstance(h, str):
                hay_antes = any(not isinstance(x, str) or x.strip() for x in lista[:i])
                hay_despues = any(not isinstance(x, str) or x.strip() for x in lista[i + 1:])
                if not h.strip():
                    # Espacio entre dos elementos: sólo cuenta en contenido en línea.
                    if inline and hay_antes and hay_despues:
                        hijos.append(pad + '{" "}')
                    continue
                t = re.sub(r"\s+", " ", h)
                pre = hay_antes and t.startswith(" ")
                post = hay_despues and t.endswith(" ")
                t = texto_jsx(t.strip())
                hijos.append(pad + ('{" "}' if pre else "") + t + ('{" "}' if post else ""))
            else:
                hijos.append(self.jsx(h, nivel))
        return hijos

    def css(self, origen):
        salida = [f"/* Generado desde referencia/index.html:{origen} con scripts/html_a_jsx.py.",
                  "   Valores copiados textual de los atributos style=\"\" del sitio viejo. */", ""]
        for estilo, (clase, desc) in self.estilos.items():
            salida.append(f".{clase}{{{estilo}}} /* {desc} */")
        return "\n".join(salida) + "\n"


def main():
    args = sys.argv[1:]
    opciones = {}
    for op in ("--css", "--jsx"):
        if op in args:
            i = args.index(op)
            opciones[op] = args[i + 1]
            del args[i:i + 2]
    desde, hasta, prefijo = int(args[0]), int(args[1]), args[2]
    lineas = open("referencia/index.html", encoding="utf-8-sig").read().split("\n")
    fragmento = "\n".join(lineas[desde - 1:hasta])
    c = Conversor(prefijo)
    c.feed(fragmento)
    c.close()
    jsx = "\n".join(c.hijos_jsx(c.raiz, 0))
    css = c.css(f"{desde}-{hasta}")
    if "--jsx" in opciones:
        open(opciones["--jsx"], "w", encoding="utf-8").write(jsx + "\n")
    else:
        print(jsx)
    if "--css" in opciones:
        open(opciones["--css"], "w", encoding="utf-8").write(css)
    else:
        print(css, file=sys.stderr)
    print(f"{len(c.estilos)} clases; usa Link: {c.usa_link}", file=sys.stderr)


if __name__ == "__main__":
    main()
