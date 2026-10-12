# -*- coding: utf-8 -*-
import os
from build import (read, split_chapters, render_generic_chapter,
                    render_quiz_chapter, render_answers, C, PART_COLOR, PART_TINT,
                    chapter_icon_html, md2html)
import icons

BASE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(BASE, 'pages'), exist_ok=True)
CSS = read('style.css')

ROMAN = {1: 'I', 2: 'II', 3: 'III', 4: 'IV'}

PART_META = {
    1: dict(title="Le Basi e la Storia dell'Informatica",
            desc="Dal primo approccio al quiz alla storia del computer, dall'hardware ai sistemi operativi: le fondamenta di ogni percorso di alfabetizzazione digitale.",
            chapters=["Come usare questo manuale", "Storia dell'informatica: dalle origini a oggi",
                      "Hardware e componenti del computer", "Sistemi operativi e file system"]),
    2: dict(title="Software, Rete e Comunicazione",
            desc="Programmi, browser, email, messaggistica, social e sicurezza informatica: gli strumenti del vivere digitale quotidiano, messi alla prova domanda dopo domanda.",
            chapters=["Software, applicazioni e produttività", "Internet e navigazione",
                      "Comunicazione digitale e social", "Sicurezza informatica e privacy"]),
    3: dict(title="Cloud, Mobile e Intelligenza Artificiale",
            desc="Smartphone, tablet, servizi cloud e intelligenza artificiale: il presente e il futuro prossimo dell'informatica, spiegati e verificati con il quiz.",
            chapters=["Cloud, backup e dispositivi mobili", "Intelligenza artificiale: presente e futuro"]),
    4: dict(title="Sostenibilità, Etica e FeniceOS",
            desc="I principi di Tecnologia Gentile applicati alla pratica quotidiana, e un capitolo dedicato a FeniceOS, il progetto da cui tutto è partito.",
            chapters=["Economia circolare ed etica del digitale", "FeniceOS e il mondo Linux: uso consapevole"]),
}
PART_FILES = {1: '01_parte1.md', 2: '02_parte2.md', 3: '03_parte3.md', 4: '04_parte4.md'}
INTRO_CHAPTERS = {1}  # numero di capitolo generico (non-quiz) all'interno della Parte I

def page(html, cls="page"):
    return f'<div class="{cls}">{html}</div>'

# ============================================================= COVER
cover_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="cover">
  <div class="cover-inner">
    <div class="cover-kicker">Manuale di Quiz &middot; Un progetto FeniceOS</div>
    <div class="cover-mark">{icons.phoenix_mark(300)}</div>
    <div class="cover-title">Il Grande Quiz<br><span class="accent">dell'Informatica</span></div>
    <div class="cover-title" style="font-size:20px; margin-top:2px;">Domande e Risposte per l'Alfabetizzazione Digitale, dalle Basi ai Livelli Esperti</div>
    <div class="cover-divider"></div>
    <div class="cover-subtitle">264 domande a scelta multipla e Vero/Falso, organizzate per capitolo e per livello progressivo — Base, Intermedio, Esperto — per centri anziani, scuole e centri per il sociale.</div>
    <div class="cover-author">DANILO D'AURIA
      <small>Ideatore e sviluppatore di FeniceOS &middot; Autore di &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;</small>
    </div>
  </div>
</div>
</body></html>'''
open(os.path.join(BASE, 'pages', 'cover.html'), 'w', encoding='utf-8').write(cover_html)

# ============================================================= BACK COVER
blurb_paras = """<p>Quanto conosci davvero il mondo dell'informatica, da ieri a domani? Questo manuale nasce per rispondere a questa domanda nel modo più diretto possibile: non con lunghe spiegazioni teoriche, ma con <strong>264 domande</strong>, organizzate per argomento e pensate per accompagnare chiunque — da chi accende un computer per la prima volta a chi lo usa ogni giorno — lungo un percorso graduale, dal livello Base al livello Esperto.</p>
<p>Storia dell'informatica, hardware, sistemi operativi, software, internet, comunicazione digitale, sicurezza, cloud, dispositivi mobili, intelligenza artificiale, economia circolare ed etica del digitale, fino a un capitolo dedicato interamente a FeniceOS: dodici capitoli, tre livelli ciascuno, per un vero e proprio vademecum del quiz informatico.</p>
<p>Pensato per l'uso individuale, di gruppo o in aula — al centro anziani, a scuola, al centro sociale — questo manuale si accompagna a un <strong>Foglio delle Risposte</strong> separato, con la soluzione commentata di ogni singola domanda.</p>
<p><strong>Un vademecum pensato per chi insegna e per chi impara</strong>, per trasformare la verifica delle proprie conoscenze informatiche in un momento di scoperta, condivisione e divertimento — a qualunque livello si parta.</p>"""

backcover_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="backcover">
  <div class="backcover-inner">
    <div class="mark-small">{icons.phoenix_mark(85)}</div>
    <h3>Il Grande Quiz dell'Informatica</h3>
    <div class="blurb">{blurb_paras}</div>
    <div class="pullquote">&laquo;Non esiste una domanda sbagliata: esiste solo un passo in più verso la competenza digitale.&raquo;</div>
    <div class="author-line">Danilo D'Auria è ideatore e sviluppatore di FeniceOS e autore del libro &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;, pubblicato su Amazon. Questo manuale di quiz applica gli stessi principi a un percorso di verifica e formazione digitale completo.</div>
    <div class="isbn-row"><span>Edizione digitale</span><span>264 domande &middot; 12 capitoli &middot; 3 livelli &middot; Foglio risposte separato</span></div>
  </div>
</div>
</body></html>'''
open(os.path.join(BASE, 'pages', 'backcover.html'), 'w', encoding='utf-8').write(backcover_html)

# ============================================================= BOOK BODY
parts_out = []

# --- Frontespizio
frontespizio = page(f'''<div class="frontespizio">
<div class="badge-mark">{icons.phoenix_mark(175)}</div>
<h1>Il Grande Quiz<br>dell'Informatica</h1>
<div class="sub">Domande e Risposte per l'Alfabetizzazione Digitale, dalle Basi ai Livelli Esperti<br>264 domande organizzate per capitolo e per livello progressivo</div>
<div class="rule"></div>
<div class="authorblock"><b>Danilo D'Auria</b><br>Ideatore e sviluppatore di FeniceOS<br>Autore di &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;</div>
</div>''', cls="page fill")

# --- Prefazione
pref_body = md2html("""Quando ho scritto *Tecnologia Gentile: Informatica Sostenibile*, e poi il manuale che presenta FeniceOS, mi sono reso conto di una cosa semplice: leggere e capire un concetto è solo metà del percorso. L'altra metà è **metterlo alla prova**, tornarci sopra, sbagliare, riprovare — finché quel concetto non diventa davvero proprio.

Da questa convinzione nasce *Il Grande Quiz dell'Informatica*: un manuale che non racconta la teoria, ma la interroga. Dodici capitoli coprono l'intero universo informatico che conosciamo oggi — dalla storia del computer all'intelligenza artificiale, passando per hardware, sistemi operativi, internet, sicurezza, cloud e molto altro — e ciascuno propone tre livelli progressivi di difficoltà, per accompagnare davvero chiunque, da chi comincia da zero a chi vuole mettersi alla prova sul serio.

Non è un esame. È un allenamento, individuale o di gruppo, pensato per centri anziani, scuole e centri per il sociale — gli stessi luoghi per cui è nato il progetto FeniceOS — ma utile a chiunque voglia consolidare, in modo piacevole e senza pressione, le proprie competenze digitali.

Buone domande, e buone risposte.""")
prefazione = page(f'''<div class="prefazione">
<div class="kick">Prefazione</div>
<h1>La parola all'autore</h1>
<div style="margin-top:16px;">{pref_body}</div>
<div class="sign">Danilo D'Auria</div>
</div>''', cls="page fill")

# --- Indice (generato)
toc_rows = ""
base_num = 1
part_bases = {}
for pnum in range(1, 5):
    part_bases[pnum] = base_num
    base_num += len(PART_META[pnum]["chapters"])

for pnum in range(1, 5):
    meta = PART_META[pnum]
    toc_rows += f'<div class="toc-part"><div class="toc-part-title" style="background:{PART_COLOR[pnum]}">Parte {ROMAN[pnum]} &mdash; {meta["title"]}</div>'
    bn = part_bases[pnum]
    for i, cht in enumerate(meta["chapters"]):
        toc_rows += f'<div class="toc-row"><span><span class="n">{bn+i:02d}</span>{cht}</span></div>'
    toc_rows += '</div>'
toc_rows += f'<div class="toc-part"><div class="toc-part-title" style="background:{C["dark"]}">Approfondimenti</div><div class="toc-row"><span><span class="n">&mdash;</span>Nota sull\'autore e sul progetto FeniceOS</span></div><div class="toc-row"><span><span class="n">&mdash;</span>Il Foglio delle Risposte (volume separato)</span></div></div>'

indice = page(f'''<div class="toc">
<div class="kick">Indice generale</div>
<h1>264 domande, quattro parti, un solo percorso</h1>
{toc_rows}
</div>''', cls="page fill")

parts_out.append(frontespizio)
parts_out.append(prefazione)
parts_out.append(indice)

# --- Parti I-IV
for pnum in range(1, 5):
    meta = PART_META[pnum]
    raw = read(PART_FILES[pnum])
    bn = part_bases[pnum]
    chlist_html = "".join(f'<div><span style="color:{PART_COLOR[pnum]}">{bn+i:02d}</span>{c}</div>' for i, c in enumerate(meta["chapters"]))
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
    if pnum == 1:
        # Capitolo 1 è generico (introduzione/metodologia), 2-4 sono quiz
        body1 = ""
        for num, title, braw in chapters:
            if num in INTRO_CHAPTERS:
                body1 += render_generic_chapter(num, title, braw, pnum)
        parts_out.append(page(body1))
        for num, title, braw in chapters:
            if num not in INTRO_CHAPTERS:
                parts_out.append(page(render_quiz_chapter(num, title, braw, pnum)))
    else:
        for num, title, braw in chapters:
            parts_out.append(page(render_quiz_chapter(num, title, braw, pnum)))

# --- Back matter (nota sull'autore + rimando al Foglio delle Risposte)
nota_autore_md = ("Danilo D'Auria è ideatore e sviluppatore di **FeniceOS**, distribuzione Linux live basata su Debian 12, "
                   "pensata per il riuso di hardware informatico rigenerato e donato, con particolare attenzione ai centri anziani, "
                   "alle scuole e ai centri per il sociale. È inoltre autore del libro **«Tecnologia Gentile: Informatica Sostenibile»**, "
                   "pubblicato su Amazon, nel quale approfondisce i principi di sostenibilità, economia circolare, accessibilità e "
                   "contrasto all'obsolescenza programmata che ispirano tanto il progetto FeniceOS quanto questo manuale di quiz.\n\n"
                   "Questo vademecum nasce come naturale completamento del manuale didattico *FeniceOS — Tecnologia Gentile per Tutte le "
                   "Età*: dove quel volume introduce e spiega, questo interroga e verifica, applicando la stessa attenzione alla "
                   "progressione didattica e alla chiarezza per chi si avvicina all'informatica a qualunque età.")
foglio_risposte_md = ("La soluzione commentata di ognuna delle 264 domande di questo manuale si trova in un **volume separato**, il "
                       "*Foglio delle Risposte*, pensato per essere consultato da chi conduce l'attività — in aula, al centro anziani "
                       "o al centro sociale — senza anticipare le risposte a chi sta rispondendo.")
nota_autore_html = md2html(nota_autore_md)
foglio_risposte_html = md2html(foglio_risposte_md)
backmatter_html = f'''<div class="backmatter">
<div class="chapter-eyebrow" style="color:{C["dark"]}">Approfondimenti</div>
<h2>Nota sull'autore e sul progetto FeniceOS</h2>
{nota_autore_html}
<h2 style="margin-top:24px;">Il Foglio delle Risposte</h2>
{foglio_risposte_html}
<div class="colophon">{icons.badge(icons.QUIZ, C["gold"], 58)}<br><br>Il Grande Quiz dell'Informatica &mdash; Un progetto FeniceOS<br>A cura di Danilo D'Auria &middot; Edizione digitale</div>
</div>'''
parts_out.append(page(backmatter_html))

book_html = f'''<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
{''.join(parts_out)}
</body></html>'''
open(os.path.join(BASE, 'pages', 'book.html'), 'w', encoding='utf-8').write(book_html)

print("OK: cover.html, book.html, backcover.html scritti in pages/")
