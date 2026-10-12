# -*- coding: utf-8 -*-
"""Assembla la presentazione interattiva offline (slide + quiz a squadre) in un
unico file .html autonomo, senza alcuna dipendenza esterna: apribile con un
doppio clic in qualunque browser, su Windows, Mac o Linux, anche senza
connessione a internet."""
import os, json

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'src')

PHOENIX = (
    '<svg width="72" height="72" viewBox="0 0 120 120" aria-hidden="true">'
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

def read(fn):
    with open(os.path.join(SRC, fn), encoding='utf-8') as f:
        return f.read()

def main():
    css = read('app.css')
    js = read('app.js')
    html = read('index.html')

    with open(os.path.join(SRC, 'slides_data.json'), encoding='utf-8') as f:
        slides_json = f.read()
    with open(os.path.join(SRC, 'quiz_data.json'), encoding='utf-8') as f:
        quiz_json = f.read()

    # sicurezza: neutralizza eventuali sequenze "</script" nei dati, che
    # spezzerebbero il tag <script> che le contiene.
    slides_json_safe = slides_json.replace('</script', '<\\/script')
    quiz_json_safe = quiz_json.replace('</script', '<\\/script')

    js = js.replace('__PHOENIX_SVG__', PHOENIX.replace('\\', '\\\\'))

    html = html.replace('__CSS__', css)
    html = html.replace('__JS__', js)
    html = html.replace('__PHOENIX__', PHOENIX)
    html = html.replace('__SLIDES_DATA__', slides_json_safe)
    html = html.replace('__QUIZ_DATA__', quiz_json_safe)

    os.makedirs(os.path.join(BASE, 'output'), exist_ok=True)
    out_path = os.path.join(BASE, 'output', 'FeniceOS_Presentazione_Interattiva_Offline.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)
    size_kb = os.path.getsize(out_path) / 1024
    print("OK:", out_path, "- %.0f KB" % size_kb)

if __name__ == '__main__':
    main()
