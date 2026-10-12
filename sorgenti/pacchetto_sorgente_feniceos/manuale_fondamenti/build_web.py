# -*- coding: utf-8 -*-
import os, re
from build import (read, split_chapters, split_blocks, Q_START, md2html,
                    CH_ICON, CH_PART, PART_COLOR, parse_answers_flat)
import icons

BASE = os.path.dirname(os.path.abspath(__file__))

PART_TINT = {1: "#e7f0e3", 2: "#fbead9", 3: "#e3edf3", 4: "#ece2f3", 5: "#faf0dc"}

def icon_div(num, part_no):
    svg = icons.badge(CH_ICON.get(num, icons.SPARK), PART_COLOR[part_no], size=100)
    return f'<div class="cicon">{svg}</div>'

def style_callouts_web(html_fragment, part_no):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_fragment, 'html.parser')
    for bq in soup.find_all('blockquote'):
        inner = bq.decode_contents()
        is_tip = 'Suggerimento' in inner
        icon_svg = icons.badge(icons.TEACHER if is_tip else icons.SPARK, PART_COLOR[part_no], size=54)
        newdiv = soup.new_tag('div'); newdiv['class'] = 'callout'
        newdiv['style'] = f"border-color:{PART_COLOR[part_no]}; background:{PART_TINT[part_no]};"
        iw = soup.new_tag('div'); iw.append(BeautifulSoup(icon_svg,'html.parser'))
        tw = soup.new_tag('div'); tw['class']='callout-text'; tw.append(BeautifulSoup(inner,'html.parser'))
        newdiv.append(iw); newdiv.append(tw)
        bq.replace_with(newdiv)
    return str(soup)

def render_web_chapter(num, title, body_raw, part_no):
    html = md2html(body_raw)
    html = style_callouts_web(html, part_no)
    return f'''
<article class="chapter" id="cap{num}">
  <div class="chapter-head">
    {icon_div(num, part_no)}
    <div><div class="chapter-eyebrow" style="color:{PART_COLOR[part_no]}">Capitolo {num}</div><h3>{title}</h3></div>
  </div>
  <div class="chapter-body">{html}</div>
</article>'''

def render_web_quiz_chapter(num, title, body_raw, part_no, answers):
    blocks = split_blocks(body_raw)
    pieces = []
    for b in blocks:
        if b.startswith('---'):
            continue
        if b.startswith('*') and b.endswith('*') and not b.startswith('**D'):
            pieces.append(f'<p class="quiz-intro">{md2html(b)[3:-4]}</p>')
            continue
        if b.startswith('**Sezione'):
            sez = re.match(r'\*\*Sezione (.+?)\*\*', b)
            if sez:
                pieces.append(f'<div class="quiz-section">{sez.group(1)}</div>')
            continue
        m = Q_START.match(b)
        if m:
            qnum, is_open, rest = m.group(1), m.group(2), m.group(3)
            rest = rest.strip()
            opt_match = re.search(r'\nA\)\s*(.*?)\s+B\)\s*(.*?)\s+C\)\s*(.*?)\s+D\)\s*(.*)$', rest, re.S)
            open_badge = '<span class="qtag">domanda aperta</span>' if is_open else ''
            ans_html = answers.get(int(qnum), '')
            reveal = f'''<button class="revealbtn" onclick="var a=this.nextElementSibling;a.classList.toggle('show');this.textContent=a.classList.contains('show')?'Nascondi risposta ▴':'Mostra risposta ▾';">Mostra risposta &#9662;</button>
<div class="answer"><b>Risposta:</b> {ans_html}</div>'''
            if opt_match:
                stem = rest[:opt_match.start()].strip()
                opts = [opt_match.group(i).strip() for i in range(1,5)]
                letters = ['A','B','C','D']
                optshtml = ''.join(f'<div class="opt"><span class="optlet">{l})</span><span>{md2html(o)[3:-4]}</span></div>' for l,o in zip(letters,opts))
                pieces.append(f'''<div class="qcard"><div class="qtop"><div class="qnum">D{qnum}</div>
<div class="qbody"><div class="qstem">{md2html(stem)[3:-4]}{open_badge}</div><div class="opts">{optshtml}</div>{reveal}</div></div></div>''')
            else:
                pieces.append(f'''<div class="qcard"><div class="qtop"><div class="qnum">D{qnum}</div>
<div class="qbody"><div class="qstem">{md2html(rest)[3:-4]}{open_badge}</div>{reveal}</div></div></div>''')
        else:
            pieces.append(f'<p>{md2html(b)[3:-4]}</p>')
    body_html = "\n".join(pieces)
    return f'''
<article class="chapter" id="cap{num}">
  <div class="chapter-head">
    {icon_div(num, part_no)}
    <div><div class="chapter-eyebrow" style="color:{PART_COLOR[part_no]}">Capitolo {num}</div><h3>{title}</h3></div>
  </div>
  <div class="chapter-body">{body_html}</div>
</article>'''

PART_META = {
    1: dict(roman="I", title="Fondamenta", color=PART_COLOR[1], desc="Tecnologia Gentile, economia circolare, etica del digitale, obsolescenza programmata.", chaps=[(1,"Tecnologia Gentile"),(2,"Economia circolare"),(3,"Etica del digitale"),(4,"Obsolescenza programmata")]),
    2: dict(roman="II", title="FeniceOS: il progetto", color=PART_COLOR[2], desc="Cos'è, come funziona, e a chi è destinato FeniceOS.", chaps=[(5,"Cos'è FeniceOS"),(6,"Come funziona"),(7,"Centri anziani"),(8,"Scuola e sociale")]),
    3: dict(roman="III", title="Didattica", color=PART_COLOR[3], desc="Percorsi per principianti, funzioni avanzate, metodologia per chi insegna.", chaps=[(9,"Primi passi"),(10,"Usare FeniceOS"),(11,"Funzioni avanzate"),(12,"Consigli per chi insegna")]),
    4: dict(roman="IV", title="L'universo informatico", color=PART_COLOR[4], desc="Ieri, oggi e domani: storia, presente e intelligenza artificiale.", chaps=[(13,"Storia dell'informatica"),(14,"L'informatica di oggi"),(15,"Futuro e IA")]),
    5: dict(roman="V", title="Quiz e verifica", color=PART_COLOR[5], desc="Domande diversificate per livello e per tema, con risposte a comparsa.", chaps=[(16,"Come usare i quiz"),(17,"Livello Base"),(18,"Livello Intermedio"),(19,"Livello Avanzato"),(20,"Storia · Presente · Futuro · IA"),(21,"Economia circolare · Etica")]),
}

def build():
    answers = parse_answers_flat(read('06_appendice_risposte.md'))
    PART_FILES = {1:'01_parte1_fondamenta.md', 2:'02_parte2_feniceos.md', 3:'03_parte3_didattica.md', 4:'04_parte4_universo.md'}

    # ---- sidebar nav
    side_html = ""
    for pnum in range(1,6):
        meta = PART_META[pnum]
        side_html += f'<div class="side-part"><div class="side-part-title" style="background:{meta["color"]}">Parte {meta["roman"]}</div>'
        for cnum, ctitle in meta["chaps"]:
            side_html += f'<a href="#cap{cnum}" data-cap="{cnum}">{cnum:02d} &middot; {ctitle}</a>'
        side_html += '</div>'
    side_html += '<div class="side-part"><div class="side-part-title" style="background:#1b3a4b">Approfondimenti</div><a href="#approfondimenti">Bibliografia &amp; nota autore</a></div>'

    # ---- topbar quick nav
    top_nav = "".join(f'<a href="#part{p}">{PART_META[p]["title"]}</a>' for p in range(1,6)) + '<a href="#approfondimenti">Approfondimenti</a>'

    # ---- parts content
    parts_html = ""
    for pnum in range(1,5):
        meta = PART_META[pnum]
        raw = read(PART_FILES[pnum])
        chapters = split_chapters(raw)
        chs_html = "".join(render_web_chapter(n,t,b,pnum) for n,t,b in chapters)
        parts_html += f'''<section class="part" id="part{pnum}">
  <div class="part-banner" style="background:linear-gradient(120deg,{meta["color"]},#1b3a4b)">
    <div class="kick">Parte {meta["roman"]}</div><h2>{meta["title"]}</h2><p>{meta["desc"]}</p>
  </div>
  {chs_html}
</section>'''

    # ---- part V quiz
    quiz_raw = read('05_parte5_quiz.md')
    quiz_chaps = split_chapters(quiz_raw)
    meta = PART_META[5]
    chs_html = ""
    for n,t,b in quiz_chaps:
        if n == 16:
            chs_html += render_web_chapter(n,t,b,5)
        else:
            chs_html += render_web_quiz_chapter(n,t,b,5,answers)
    parts_html += f'''<section class="part" id="part5">
  <div class="part-banner" style="background:linear-gradient(120deg,{meta["color"]},#1b3a4b)">
    <div class="kick">Parte {meta["roman"]}</div><h2>{meta["title"]}</h2><p>{meta["desc"]}</p>
  </div>
  {chs_html}
</section>'''

    # ---- approfondimenti
    back_raw = read('07_back_matter.md')
    biblio = back_raw.split('## Nota sull\'autore')[0].split('## Bibliografia e riferimenti')[1]
    nota = back_raw.split('## Nota sull\'autore e sul progetto FeniceOS')[1].split('## Colophon')[0]
    approfondimenti = f'''<section class="part" id="approfondimenti">
  <div class="part-banner" style="background:linear-gradient(120deg,#1b3a4b,#0e222d)">
    <div class="kick">Approfondimenti</div><h2>Bibliografia &amp; nota sull'autore</h2><p>Riferimenti e informazioni sul progetto FeniceOS e sul suo ideatore.</p>
  </div>
  <article class="chapter">
    <div class="chapter-body">
      <h3 style="margin-bottom:10px;">Bibliografia e riferimenti</h3>
      {md2html(biblio)}
      <h3 style="margin:20px 0 10px 0;">Nota sull'autore e sul progetto FeniceOS</h3>
      {md2html(nota)}
    </div>
  </article>
</section>'''

    css = read('web_style.css')

    html = f'''<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FeniceOS Manuale &mdash; Manuale interattivo offline</title>
<meta name="description" content="Manuale interattivo offline con fondamenti, guide didattiche e quiz a risposta rivelabile sul progetto FeniceOS di Danilo D'Auria. Nessuna connessione richiesta.">
<style>{css}</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-inner">
    <div class="mark">{icons.phoenix_mark(80)}</div>
    <div class="name">FeniceOS</div>
    <nav id="topnav">{top_nav}</nav>
    <div class="a11y-controls" role="group" aria-label="Accessibilità">
      <button id="fontMinus" aria-label="Riduci dimensione testo">A&minus;</button>
      <button id="fontPlus" aria-label="Aumenta dimensione testo">A+</button>
      <button id="contrastBtn" aria-pressed="false" aria-label="Attiva alto contrasto">&#9680;</button>
      <button class="themebtn" id="themeBtn" title="Cambia tema chiaro/scuro" aria-label="Cambia tema chiaro/scuro">&#9788;</button>
    </div>
  </div>
</div>

<div class="hero">
  <div class="hero-inner">
    <div class="mark-big">{icons.phoenix_mark(280)}</div>
    <div>
      <div class="hero-kicker">Manuale interattivo &middot; Fondamenti &middot; Quiz</div>
      <h1>Fenice<span>OS</span> &mdash; Tecnologia Gentile per Tutte le Età</h1>
      <p class="sub">Fondamenti, guide pratiche e un intero universo di quiz &mdash; con risposta a comparsa &mdash; sull'informatica di ieri, oggi e domani. Pensato per centri anziani, scuole e centri per il sociale.</p>
      <div class="authorline">Danilo D'Auria &middot; Ideatore e sviluppatore di FeniceOS &middot; Autore di &laquo;Tecnologia Gentile: Informatica Sostenibile&raquo;</div>
      <div class="chips"><span class="chip">21 capitoli</span><span class="chip">66 quiz</span><span class="chip">5 parti tematiche</span><span class="chip">Risposte a comparsa</span><span class="chip">&#9679; Funziona offline</span></div>
    </div>
  </div>
</div>

<div class="layout">
  <aside class="side">{side_html}</aside>
  <main>{parts_html}{approfondimenti}</main>
</div>

<footer class="sitefooter">
  <div class="mark">{icons.badge(icons.SPARK, "#c9622a", 60)}</div>
  FeniceOS &mdash; Tecnologia Gentile per Tutte le Età &middot; A cura di Danilo D'Auria<br>
  Manuale didattico digitale con quiz interattivi
</footer>

<button class="backtotop" id="backtotop" aria-label="Torna su" title="Torna su">&#8593;</button>

<script>
(function(){{
  var btn = document.getElementById('backtotop');
  window.addEventListener('scroll', function(){{
    btn.classList.toggle('show', window.scrollY > 500);
  }});
  btn.addEventListener('click', function(){{ window.scrollTo({{top:0, behavior:'smooth'}}); }});

  var themeBtn = document.getElementById('themeBtn');
  function applyTheme(t){{
    if(t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }}
  var saved = null;
  try {{ saved = localStorage.getItem('feniceos-theme'); }} catch(e){{}}
  if(saved) applyTheme(saved);
  themeBtn.addEventListener('click', function(){{
    var cur = document.documentElement.getAttribute('data-theme');
    var next = cur === 'dark' ? 'light' : (cur === 'light' ? null : 'dark');
    applyTheme(next);
    try {{ localStorage.setItem('feniceos-theme', next || ''); }} catch(e){{}}
  }});

  // ---- accessibilità: dimensione testo regolabile e alto contrasto
  var root = document.documentElement;
  var BASE_FS = 18, MIN_STEP = -3, MAX_STEP = 7;
  var a11y = {{ step: 0, contrast: false }};
  try {{
    var savedA11y = localStorage.getItem('feniceos-a11y');
    if(savedA11y) a11y = Object.assign(a11y, JSON.parse(savedA11y));
  }} catch(e){{}}
  function saveA11y(){{ try {{ localStorage.setItem('feniceos-a11y', JSON.stringify(a11y)); }} catch(e){{}} }}
  function applyFont(){{ root.style.fontSize = (BASE_FS + a11y.step * 2) + 'px'; }}
  function applyContrast(){{
    if(a11y.contrast) root.setAttribute('data-contrast','high');
    else root.removeAttribute('data-contrast');
    document.getElementById('contrastBtn').setAttribute('aria-pressed', a11y.contrast ? 'true':'false');
  }}
  document.getElementById('fontMinus').addEventListener('click', function(){{
    a11y.step = Math.max(MIN_STEP, a11y.step-1); applyFont(); saveA11y();
  }});
  document.getElementById('fontPlus').addEventListener('click', function(){{
    a11y.step = Math.min(MAX_STEP, a11y.step+1); applyFont(); saveA11y();
  }});
  document.getElementById('contrastBtn').addEventListener('click', function(){{
    a11y.contrast = !a11y.contrast; applyContrast(); saveA11y();
  }});
  applyFont(); applyContrast();

  // evidenzia capitolo attivo nella sidebar durante lo scroll
  var links = Array.prototype.slice.call(document.querySelectorAll('.side a[data-cap]'));
  var chapters = links.map(function(a){{ return document.getElementById('cap'+a.dataset.cap); }});
  function onScroll(){{
    var pos = window.scrollY + 120;
    var activeIdx = 0;
    for(var i=0;i<chapters.length;i++){{
      if(chapters[i] && chapters[i].offsetTop <= pos) activeIdx = i;
    }}
    links.forEach(function(a,i){{ a.classList.toggle('active', i===activeIdx); }});
  }}
  window.addEventListener('scroll', onScroll);
  onScroll();
}})();
</script>
</body>
</html>
'''
    os.makedirs(os.path.join(BASE, "output"), exist_ok=True)
    out_path = os.path.join(BASE, "output", "FeniceOS_Manuale_Interattivo_Offline.html")
    open(out_path, 'w', encoding='utf-8').write(html)
    print("OK:", out_path, "scritto,", len(html), "caratteri")

if __name__ == "__main__":
    build()
