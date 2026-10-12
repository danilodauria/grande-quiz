# -*- coding: utf-8 -*-
import os
from build import (read, split_chapters, part_title_of, render_generic_chapter,
                    render_quiz_chapter, render_answers, C, PART_COLOR, PART_TINT,
                    chapter_icon_html, md2html)
import icons

BASE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(BASE, 'pages'), exist_ok=True)
CSS = read('style.css')

PART_META = {
    1: dict(title="Fondamenta", desc="I principi di Tecnologia Gentile, economia circolare, etica del digitale e contrasto all'obsolescenza programmata su cui si fonda l'intero progetto.",
            chapters=["Tecnologia Gentile: la filosofia che ci guida","Economia circolare e informatica","Etica del digitale","L'obsolescenza programmata"]),
    2: dict(title="FeniceOS: il progetto", desc="Che cos'è FeniceOS, come funziona dal punto di vista tecnico, e perché è pensato per i centri anziani, le scuole e i centri per il sociale.",
            chapters=["Cos'è FeniceOS","Come funziona FeniceOS","FeniceOS per i centri anziani","FeniceOS per la scuola e i centri sociali"]),
    3: dict(title="Didattica", desc="Percorsi pratici per chi comincia da zero e per chi vuole approfondire, più un capitolo di metodologia per chi insegna.",
            chapters=["Primi passi con il computer","Usare FeniceOS: guida pratica","Funzioni avanzate","Consigli per chi insegna"]),
    4: dict(title="L'universo informatico", desc="Un viaggio tra ieri, oggi e domani: dalle origini del calcolo automatico all'intelligenza artificiale.",
            chapters=["Storia dell'informatica","L'informatica di oggi","Il futuro e l'intelligenza artificiale"]),
    5: dict(title="Quiz e verifica", desc="Domande diversificate, per livello e per tema, per imparare divertendosi da soli o in gruppo — con foglio delle risposte in appendice.",
            chapters=["Come usare i quiz","Quiz Livello Base","Quiz Livello Intermedio","Quiz Livello Avanzato","Quiz: Storia, Presente, Futuro e IA","Quiz: economia circolare, etica, obsolescenza"]),
}

def page(html, cls="page"):
    return f'<div class="{cls}">{html}</div>'

# ============================================================= COVER
cover_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="cover">
  <div class="cover-inner">
    <div class="cover-kicker">Manuale &middot; Fondamenti &middot; Quiz</div>
    <div class="cover-mark">{icons.phoenix_mark(320)}</div>
    <div class="cover-title">Fenice<span class="accent">OS</span></div>
    <div class="cover-title" style="font-size:22px; margin-top:-6px;">Tecnologia Gentile per Tutte le Età</div>
    <div class="cover-divider"></div>
    <div class="cover-subtitle">Fondamenti, guide pratiche e quiz sull'universo informatico di ieri, oggi e domani &mdash; per l'inclusione digitale nei centri anziani, nelle scuole e nei centri per il sociale.</div>
    <div class="cover-author">DANILO D'AURIA
      <small>Ideatore e sviluppatore di FeniceOS &middot; Autore di &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;</small>
    </div>
  </div>
</div>
</body></html>'''
open(os.path.join(BASE,'pages','cover.html'),'w',encoding='utf-8').write(cover_html)

# ============================================================= BACK COVER
blurb_paras = """<p>Cosa succede quando un computer che nessuno vuole più incontra una persona che non ha mai avuto occasione di usarne uno? Nasce FeniceOS: una distribuzione Linux libera, leggera, pensata per rinascere &mdash; come la fenice del suo nome &mdash; su macchine che il mercato avrebbe voluto rottamare.</p>
<p>Questo manuale non è solo una guida tecnica. È il racconto di un'idea che unisce economia circolare, etica del digitale e didattica per chi la tecnologia la scopre per la prima volta, magari a settant'anni, in un centro anziani, davanti a uno schermo che non fa più paura.</p>
<p>All'interno: i fondamenti del progetto, percorsi didattici per principianti e utenti avanzati, un intero universo di quiz diversificati &mdash; dalla storia dell'informatica all'intelligenza artificiale &mdash; e un foglio delle risposte pensato per l'aula e per il centro anziani.</p>
<p><strong>Un manuale scritto per chi insegna e per chi impara</strong>, per chi programma e per chi accende il computer con timore reverenziale. Un invito a guardare la tecnologia non come qualcosa da subire, ma come qualcosa da capire, riparare, condividere &mdash; e, quando serve, far rinascere.</p>"""

backcover_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="backcover">
  <div class="backcover-inner">
    <div class="mark-small">{icons.phoenix_mark(85)}</div>
    <h3>FeniceOS &mdash; Tecnologia Gentile per Tutte le Età</h3>
    <div class="blurb">{blurb_paras}</div>
    <div class="pullquote">&laquo;Un dispositivo &lsquo;vecchio&rsquo; e un dispositivo &lsquo;rotto&rsquo; sono due cose diverse. È proprio su questa distinzione che si fonda il progetto FeniceOS.&raquo;</div>
    <div class="author-line">Danilo D'Auria è ideatore e sviluppatore di FeniceOS e autore del libro &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;, pubblicato su Amazon. Questo manuale ne raccoglie ed espande i principi fondanti, applicandoli a un progetto concreto di inclusione digitale.</div>
    <div class="isbn-row"><span>Edizione digitale</span><span>Manuale didattico &middot; Quiz &middot; Foglio risposte</span></div>
  </div>
</div>
</body></html>'''
open(os.path.join(BASE,'pages','backcover.html'),'w',encoding='utf-8').write(backcover_html)

# ============================================================= BOOK BODY
parts_out = []

# --- Frontespizio
frontespizio = page(f'''<div class="frontespizio">
<div class="badge-mark">{icons.phoenix_mark(185)}</div>
<h1>FeniceOS</h1>
<div class="sub">Tecnologia Gentile per Tutte le Età<br>Manuale didattico con fondamenti, guide pratiche e quiz sull'universo informatico di ieri, oggi e domani</div>
<div class="rule"></div>
<div class="authorblock"><b>Danilo D'Auria</b><br>Ideatore e sviluppatore di FeniceOS<br>Autore di &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;</div>
</div>''', cls="page fill")

# --- Prefazione
pref_raw = read('00_front_matter.md').split('## Prefazione dell\'autore')[1].split('## Indice generale')[0]
pref_raw = pref_raw.replace('*Danilo D\'Auria*','').strip()
pref_body = md2html(pref_raw)
prefazione = page(f'''<div class="prefazione">
<div class="kick">Prefazione</div>
<h1>La parola all'autore</h1>
<div style="margin-top:16px;">{pref_body}</div>
<div class="sign">Danilo D'Auria</div>
</div>''', cls="page fill")

# --- Indice (generato)
toc_rows = ""
for pnum in range(1,6):
    meta = PART_META[pnum]
    toc_rows += f'<div class="toc-part"><div class="toc-part-title" style="background:{PART_COLOR[pnum]}">Parte {["I","II","III","IV","V"][pnum-1]} &mdash; {meta["title"]}</div>'
    base_num = {1:1,2:5,3:9,4:13,5:16}[pnum]
    for i,cht in enumerate(meta["chapters"]):
        toc_rows += f'<div class="toc-row"><span><span class="n">{base_num+i:02d}</span>{cht}</span></div>'
    toc_rows += '</div>'
toc_rows += f'<div class="toc-part"><div class="toc-part-title" style="background:{C["dark"]}">Appendice &amp; Approfondimenti</div><div class="toc-row"><span><span class="n">&mdash;</span>Foglio delle risposte</span></div><div class="toc-row"><span><span class="n">&mdash;</span>Bibliografia e nota sull\'autore</span></div></div>'

indice = page(f'''<div class="toc">
<div class="kick">Indice generale</div>
<h1>Un percorso in cinque parti</h1>
{toc_rows}
</div>''', cls="page fill")

parts_out.append(frontespizio)
parts_out.append(prefazione)
parts_out.append(indice)

PART_FILES = {1:'01_parte1_fondamenta.md', 2:'02_parte2_feniceos.md', 3:'03_parte3_didattica.md', 4:'04_parte4_universo.md'}
ROMAN = {1:'I',2:'II',3:'III',4:'IV',5:'V'}

for pnum in range(1,5):
    raw = read(PART_FILES[pnum])
    meta = PART_META[pnum]
    chlist_html = "".join(f'<div><span style="color:{PART_COLOR[pnum]}">{["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15"][ {1:1,2:5,3:9,4:13}[pnum]-1+i ]}</span>{c}</div>' for i,c in enumerate(meta["chapters"]))
    divider = f'''<div class="page part-divider">
<div class="pnum" style="color:{PART_COLOR[pnum]}">{ROMAN[pnum]}</div>
<div class="kick" style="color:{PART_COLOR[pnum]}">Parte {ROMAN[pnum]}</div>
<h1>{meta["title"]}</h1>
<div class="rule" style="background:{PART_COLOR[pnum]}"></div>
<div class="desc">{meta["desc"]}</div>
<div class="chlist">{chlist_html}</div>
</div>'''
    parts_out.append(divider)
    chapters = split_chapters(raw)
    body = ""
    for num, title, braw in chapters:
        body += render_generic_chapter(num, title, braw, pnum)
    parts_out.append(page(body))

# --- Parte V (quiz)
pnum = 5
meta = PART_META[5]
chlist_html = "".join(f'<div><span style="color:{PART_COLOR[pnum]}">{16+i:02d}</span>{c}</div>' for i,c in enumerate(meta["chapters"]))
divider = f'''<div class="page part-divider">
<div class="pnum" style="color:{PART_COLOR[pnum]}">V</div>
<div class="kick" style="color:{PART_COLOR[pnum]}">Parte V</div>
<h1>{meta["title"]}</h1>
<div class="rule" style="background:{PART_COLOR[pnum]}"></div>
<div class="desc">{meta["desc"]}</div>
<div class="chlist">{chlist_html}</div>
</div>'''
parts_out.append(divider)

quiz_raw = read('05_parte5_quiz.md')
quiz_chaps = split_chapters(quiz_raw)
# capitolo 16 generico, 17-21 quiz
body16 = ""
for num, title, braw in quiz_chaps:
    if num == 16:
        body16 += render_generic_chapter(num, title, braw, pnum)
parts_out.append(page(body16))
for num, title, braw in quiz_chaps:
    if num != 16:
        parts_out.append(page(render_quiz_chapter(num, title, braw, pnum)))

# --- Appendice risposte
ans_raw = read('06_appendice_risposte.md')
ans_html = render_answers(ans_raw)
appendice_head = f'''<div class="chapter-head"><div class="chapter-icon">{chapter_icon_html(0,5,88) if False else icons.badge(icons.CHECK, C["gold"], 110)}</div>
<div><div class="chapter-eyebrow" style="color:{C["gold"]}">Appendice</div><h2>Foglio delle risposte</h2></div></div>
<p style="margin:10px 0 16px 0; color:#7a6a53; font-style:italic;">Le risposte alle domande a risposta aperta sono spunti di riflessione, non soluzioni univoche.</p>'''
parts_out.append(page(f'<div class="chapter">{appendice_head}<div class="chapter-body">{ans_html}</div></div>'))

# --- Back matter (bibliografia + nota autore)
back_raw = read('07_back_matter.md')
biblio = back_raw.split('## Nota sull\'autore')[0].split('## Bibliografia e riferimenti')[1]
nota = back_raw.split('## Nota sull\'autore e sul progetto FeniceOS')[1].split('## Colophon')[0]
backmatter_html = f'''<div class="backmatter">
<div class="chapter-eyebrow" style="color:{C["dark"]}">Approfondimenti</div>
<h2>Bibliografia e riferimenti</h2>
{md2html(biblio)}
<h2 style="margin-top:24px;">Nota sull'autore e sul progetto FeniceOS</h2>
{md2html(nota)}
<div class="colophon">{icons.badge(icons.SPARK, C["warm"], 58)}<br><br>FeniceOS &mdash; Tecnologia Gentile per Tutte le Età<br>A cura di Danilo D'Auria &middot; Edizione digitale</div>
</div>'''
parts_out.append(page(backmatter_html))

book_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{''.join(parts_out)}
</body></html>'''
open(os.path.join(BASE,'pages','book.html'),'w',encoding='utf-8').write(book_html)

print("OK: cover.html, book.html, backcover.html scritti in pages/")
