# -*- coding: utf-8 -*-
import re, os, sys
import markdown as mdlib
from bs4 import BeautifulSoup
import icons

BASE = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------- palette
C = dict(
    cream="#fbf5ea",
    cream2="#f4ead6",
    ink="#2a2420",
    inkmute="#5b5148",
    dark="#1b3a4b",
    dark2="#12262f",
    warm="#d9752f",
    warm2="#f2b25c",
    green="#3f7a4f",
    green2="#e7f0e3",
    terracotta="#b5533c",
    terracotta2="#f7e6de",
    blue="#2f6b8f",
    blue2="#e3edf3",
    purple="#7a4f9e",
    purple2="#ece2f3",
    gold="#c78a2e",
    gold2="#faf0dc",
)

PART_COLOR = {1: C['green'], 2: C['warm'], 3: C['blue'], 4: C['purple'], 5: C['gold']}
PART_TINT  = {1: C['green2'], 2: '#fbead9', 3: C['blue2'], 4: C['purple2'], 5: C['gold2']}

CH_ICON = {
    1: icons.QUIZ, 2: icons.CLOCKBOOK, 3: icons.MONITOR, 4: icons.GEARS,
    5: icons.KEYBOARD, 6: icons.GLOBE, 7: icons.CHAT, 8: icons.SHIELD,
    9: icons.CLOUD, 10: icons.BRAIN, 11: icons.RECYCLE, 12: icons.TERMINAL,
}
CH_PART = {1:1, 2:1, 3:1, 4:1, 5:2, 6:2, 7:2, 8:2, 9:3, 10:3, 11:4, 12:4}

def read(fn):
    with open(os.path.join(BASE, fn), encoding='utf-8') as f:
        return f.read()

def md2html(text):
    return mdlib.markdown(text, extensions=['extra'])

def style_body_html(html_fragment, part_no):
    """Post-processa un frammento HTML generico (paragrafi, liste, blockquote)."""
    soup = BeautifulSoup(html_fragment, 'html.parser')
    for bq in soup.find_all('blockquote'):
        inner = bq.decode_contents()
        is_tip = 'Suggerimento' in inner
        icon_svg = icons.badge(icons.SPARK if not is_tip else icons.TEACHER, PART_COLOR[part_no], size=68)
        newdiv = soup.new_tag('div')
        newdiv['class'] = 'callout'
        newdiv['style'] = f"border-color:{PART_COLOR[part_no]}; background:{PART_TINT[part_no]};"
        icon_wrap = soup.new_tag('div'); icon_wrap['class'] = 'callout-icon'
        icon_wrap.append(BeautifulSoup(icon_svg, 'html.parser'))
        text_wrap = soup.new_tag('div'); text_wrap['class'] = 'callout-text'
        text_wrap.append(BeautifulSoup(inner, 'html.parser'))
        newdiv.append(icon_wrap); newdiv.append(text_wrap)
        bq.replace_with(newdiv)
    return str(soup)

CHAPTER_RE = re.compile(r'^## Capitolo (\d+)\.\s*(.+)$', re.M)

def split_chapters(raw):
    """Ritorna lista di (num, titolo, body_raw) da un file di parte."""
    matches = list(CHAPTER_RE.finditer(raw))
    out = []
    for i, m in enumerate(matches):
        num = int(m.group(1)); title = m.group(2).strip()
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(raw)
        body = raw[start:end].strip()
        out.append((num, title, body))
    return out

def part_title_of(raw):
    m = re.search(r'^# Parte [IVX]+ — (.+)$', raw, re.M)
    return m.group(1).strip() if m else ""

def chapter_icon_html(num, part_no, size=112):
    return icons.badge(CH_ICON.get(num, icons.SPARK), PART_COLOR[part_no], size=size)

def render_generic_chapter(num, title, body_raw, part_no):
    html = md2html(body_raw)
    html = style_body_html(html, part_no)
    icon = chapter_icon_html(num, part_no)
    return f'''
<section class="chapter" id="cap{num}">
  <div class="chapter-head">
    <div class="chapter-icon">{icon}</div>
    <div>
      <div class="chapter-eyebrow" style="color:{PART_COLOR[part_no]}">Capitolo {num}</div>
      <h2>{title}</h2>
    </div>
  </div>
  <div class="chapter-body">
    {html}
  </div>
</section>'''

# ------------------------------------------------------------ quiz parsing
Q_START = re.compile(r'^\*\*D(\d+)\.\s*(\(domanda aperta\))?\s*\*\*\s*(.*)$', re.S)

def split_blocks(text):
    return [b.strip() for b in re.split(r'\n\s*\n', text.strip()) if b.strip()]

def render_quiz_chapter(num, title, body_raw, part_no):
    icon = chapter_icon_html(num, part_no)
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
            if opt_match:
                stem = rest[:opt_match.start()].strip()
                opts = [opt_match.group(i).strip() for i in range(1,5)]
                letters = ['A','B','C','D']
                optshtml = ''.join(f'<div class="opt"><span class="optlet">{l})</span><span class="opttext">{md2html(o)[3:-4]}</span></div>' for l,o in zip(letters,opts))
                pieces.append(f'''<div class="quiz-card"><div class="qnum">D{qnum}</div>
<div class="qbody"><div class="qstem">{md2html(stem)[3:-4]}{open_badge}</div>
<div class="opts">{optshtml}</div></div></div>''')
            else:
                pieces.append(f'''<div class="quiz-card"><div class="qnum">D{qnum}</div>
<div class="qbody"><div class="qstem">{md2html(rest)[3:-4]}{open_badge}</div></div></div>''')
        else:
            pieces.append(f'<p>{md2html(b)[3:-4]}</p>')
    body_html = "\n".join(pieces)
    return f'''
<section class="chapter" id="cap{num}">
  <div class="chapter-head">
    <div class="chapter-icon">{icon}</div>
    <div>
      <div class="chapter-eyebrow" style="color:{PART_COLOR[part_no]}">Capitolo {num}</div>
      <h2>{title}</h2>
    </div>
  </div>
  <div class="chapter-body">
    {body_html}
  </div>
</section>'''

# --------------------------------------------------------- answers parsing
ANS_CHAP_RE = re.compile(r'^## Risposte — Capitolo (\d+)\.\s*(.+)$', re.M)
ANS_RE = re.compile(r'\*\*D(\d+)\.\*\*\s*(.*?)(?=(\*\*D\d+\.\*\*)|$)', re.S)

def render_answers(raw):
    matches = list(ANS_CHAP_RE.finditer(raw))
    sections = []
    for i, m in enumerate(matches):
        num = int(m.group(1)); title = m.group(2).strip()
        start = m.end()
        end = matches[i+1].start() if i+1 < len(matches) else len(raw)
        body = raw[start:end]
        answers = ANS_RE.findall(body)
        rows = []
        for qn, atext, _ in answers:
            atext = atext.strip()
            rows.append(f'<div class="ans-row"><span class="ans-num">D{qn}</span><span class="ans-text">{md2html(atext)[3:-4]}</span></div>')
        part_no = CH_PART.get(num, 5)
        icon = chapter_icon_html(num, part_no, size=80)
        sections.append(f'''<div class="ans-block">
<div class="ans-head" style="border-color:{PART_COLOR[part_no]}"><div class="ans-icon">{icon}</div><h3>Capitolo {num} &middot; {title}</h3></div>
<div class="ans-grid">{"".join(rows)}</div>
</div>''')
    # coda finale (nota punteggio) dopo l'ultima sezione risposte
    tail_match = re.search(r'\*\*Come usare il punteggio.*$', raw, re.S)
    tail_html = ""
    if tail_match:
        tail_html = f'<div class="callout" style="border-color:{C["gold"]};background:{C["gold2"]};"><div class="callout-icon">{icons.badge(icons.CHECK, C["gold"], 68)}</div><div class="callout-text">{md2html(tail_match.group(0))}</div></div>'
    return "\n".join(sections) + tail_html

def parse_answers_flat(raw):
    """Ritorna dict {numero_domanda: html_risposta} per uso interattivo (reveal in pagina web)."""
    out = {}
    for qn, atext, _ in ANS_RE.findall(raw):
        out[int(qn)] = md2html(atext.strip())[3:-4]
    return out
