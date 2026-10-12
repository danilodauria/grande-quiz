# -*- coding: utf-8 -*-
import os
from build import read, render_answers, C
import icons

BASE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(BASE, 'pages'), exist_ok=True)
CSS = read('style.css')

ans_raw = read('06_appendice_risposte.md')
ans_html = render_answers(ans_raw)

cover = f'''<div class="page fill">
  <div style="display:flex; align-items:center; gap:18px; margin-bottom:10px; margin-top:10mm;">
    {icons.phoenix_mark(110)}
    <div>
      <div style="color:{C['gold']}; font-weight:bold; letter-spacing:2px; font-size:11px; text-transform:uppercase;">FeniceOS &middot; Tecnologia Gentile per Tutte le Età</div>
      <h1 style="font-size:27px; color:{C['dark']}; margin-top:4px;">Foglio delle Risposte</h1>
    </div>
  </div>
  <p style="color:#7a6a53; font-size:12px; margin-top:10px;">Fascicolo a parte con le soluzioni e le spiegazioni a tutti i quiz del manuale <em>FeniceOS &mdash; Tecnologia Gentile per Tutte le Età</em> di Danilo D'Auria. Le risposte alle domande a risposta aperta sono spunti di riflessione, non soluzioni univoche.</p>
  <div style="height:2px; background:{C['gold']}; width:70px; margin:16px 0 6px 0;"></div>
</div>'''

body = f'<div class="page"><div class="chapter-body">{ans_html}</div></div>'

html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{cover}{body}
</body></html>'''

open(os.path.join(BASE,'pages','answersheet.html'),'w',encoding='utf-8').write(html)
print("OK: pages/answersheet.html")
