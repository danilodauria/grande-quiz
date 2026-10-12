# -*- coding: utf-8 -*-
"""Assembla la versione interattiva offline (HTML+CSS+JS+dati) in un unico
file .html autonomo, senza alcuna dipendenza esterna (nessun CDN, nessun
font remoto): apribile via doppio clic direttamente nel browser, anche
senza connessione a Internet."""
import os, re

BASE = os.path.dirname(os.path.abspath(__file__))
IDIR = os.path.join(BASE, 'interactive')

def read(fn):
    with open(os.path.join(IDIR, fn), encoding='utf-8') as f:
        return f.read()

PHOENIX_SMALL = (
    '<svg width="40" height="40" viewBox="0 0 120 120" aria-hidden="true">'
    '<circle cx="60" cy="60" r="58" fill="#f7cd8a"/>'
    '<g fill="none" stroke="#c9812f" stroke-width="4" stroke-linecap="round">'
    '<path d="M60 40 L20 30 M60 40 L18 45 M60 40 L20 60 M60 40 L22 75 M60 40 L28 88"/>'
    '<path d="M60 40 L100 30 M60 40 L102 45 M60 40 L100 60 M60 40 L98 75 M60 40 L92 88"/>'
    '</g>'
    '<path d="M60 34 C50 34 44 44 44 56 C44 72 52 84 60 96 C68 84 76 72 76 56 C76 44 70 34 60 34 Z" fill="#e8973c"/>'
    '<path d="M60 30 L54 22 L60 18 L66 22 Z" fill="#e8973c"/>'
    '<circle cx="57" cy="30" r="1.6" fill="#1b3a4b"/>'
    '</svg>'
)

def main():
    with open(os.path.join(BASE, 'quiz_data.json'), encoding='utf-8') as f:
        data_json = f.read()
    # sicurezza: un JSON con "</script" al suo interno spezzerebbe il tag
    # <script> che lo contiene; non dovrebbe mai capitare in questi dati,
    # ma lo neutralizziamo comunque per robustezza.
    data_json_safe = data_json.replace('</script', '<\\/script')

    css = read('app.css')
    js = read('app.js')
    html = read('index.html')

    html = html.replace('__CSS__', css)
    html = html.replace('__JS__', js)
    html = html.replace('__DATA__', data_json_safe)
    html = html.replace('__PHOENIX_SMALL__', PHOENIX_SMALL)

    os.makedirs(os.path.join(BASE, "output"), exist_ok=True)
    out_path = os.path.join(BASE, "output", "Il_Grande_Quiz_dellInformatica_Interattivo_Offline.html")
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = os.path.getsize(out_path) / 1024
    print("OK:", out_path, "- %.0f KB" % size_kb)

if __name__ == '__main__':
    main()
