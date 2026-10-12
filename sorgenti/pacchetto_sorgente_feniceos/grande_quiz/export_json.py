# -*- coding: utf-8 -*-
"""Estrae tutte le 264 domande + risposte dai file markdown sorgente in un
unico JSON, riutilizzando le stesse regex di build.py, per alimentare la
versione interattiva offline in HTML/JS del quiz."""
import re, json, os
from build import (read, split_chapters, part_title_of, CH_PART, Q_START,
                    split_blocks, ANS_RE, md2html)
import assemble as A  # per PART_META, PART_FILES, ROMAN, INTRO_CHAPTERS

BASE = os.path.dirname(os.path.abspath(__file__))
SEZ_RE = re.compile(r'^\*\*Sezione (.+?)\*\*$')
OPT_RE = re.compile(r'\nA\)\s*(.*?)\s+B\)\s*(.*?)\s+C\)\s*(.*?)\s+D\)\s*(.*)$', re.S)
ANS_LEAD_RE = re.compile(r'^\s*(?:([A-D])\)|(Vero)|(Falso))')

def strip_p(html):
    """md2html avvolge in <p>...</p>; qui vogliamo solo testo inline pulito."""
    h = html.strip()
    if h.startswith('<p>') and h.endswith('</p>'):
        h = h[3:-4]
    return h

def parse_questions_from_part(fn):
    raw = read(fn)
    chapters = split_chapters(raw)
    out = []
    for num, title, body_raw in chapters:
        if num in A.INTRO_CHAPTERS:
            continue  # capitolo introduttivo, non è un quiz
        blocks = split_blocks(body_raw)
        sezione = ""
        for b in blocks:
            if b.startswith('---'):
                continue
            sm = SEZ_RE.match(b)
            if sm:
                sezione = sm.group(1).strip()
                continue
            if b.startswith('*') and b.endswith('*') and not b.startswith('**D'):
                continue  # riga corsivo introduttiva del capitolo
            m = Q_START.match(b)
            if not m:
                continue
            qnum, is_open, rest = int(m.group(1)), m.group(2), m.group(3).strip()
            om = OPT_RE.search(rest)
            if om:
                stem = strip_p(md2html(rest[:om.start()].strip()))
                opts = [strip_p(md2html(om.group(i).strip())) for i in range(1, 5)]
                qtype = 'mc'
            else:
                stem = strip_p(md2html(rest))
                opts = []
                qtype = 'vf' if re.search(r'Vero o Falso', rest, re.I) else 'open'
            out.append(dict(
                n=qnum, chapter=num, chapter_title=title, section=sezione,
                type=qtype, stem=stem, options=opts,
            ))
    return out

def parse_answers():
    raw = read('answers.md')
    out = {}
    for qn, atext, _ in ANS_RE.findall(raw):
        atext = atext.strip()
        lead = ANS_LEAD_RE.match(atext)
        correct = None
        if lead:
            if lead.group(1):
                correct = lead.group(1)  # A/B/C/D
            elif lead.group(2):
                correct = 'Vero'
            elif lead.group(3):
                correct = 'Falso'
        out[int(qn)] = dict(correct=correct, explain=strip_p(md2html(atext)))
    return out

def main():
    questions = []
    for part_no, fn in sorted(A.PART_FILES.items()):
        questions += parse_questions_from_part(fn)
    answers = parse_answers()

    merged = []
    for q in questions:
        ans = answers.get(q['n'])
        if not ans:
            raise SystemExit(f"Manca la risposta per D{q['n']}")
        q2 = dict(q)
        q2['correct'] = ans['correct']
        q2['explain'] = ans['explain']
        merged.append(q2)
    merged.sort(key=lambda q: q['n'])

    # sanity check: 1..264 senza buchi né doppioni
    nums = [q['n'] for q in merged]
    assert nums == list(range(1, len(nums) + 1)), "Numerazione domande non continua!"

    parts = []
    for part_no in sorted(A.PART_META.keys()):
        meta = A.PART_META[part_no]
        chapters = []
        chap_start = 1 + sum(len(A.PART_META[p]['chapters']) for p in A.PART_META if p < part_no)
        for i, ch_title in enumerate(meta['chapters']):
            ch_num = chap_start + i
            if ch_num in A.INTRO_CHAPTERS:
                continue
            chapters.append(dict(num=ch_num, title=ch_title))
        parts.append(dict(num=part_no, roman=A.ROMAN[part_no], title=meta['title'],
                           desc=meta['desc'], chapters=chapters))

    data = dict(
        title="Il Grande Quiz dell'Informatica",
        subtitle="Domande e Risposte per l'Alfabetizzazione Digitale, dalle Basi ai Livelli Esperti",
        author="Danilo D'Auria",
        total=len(merged),
        parts=parts,
        questions=merged,
    )
    out_path = os.path.join(BASE, 'quiz_data.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print("OK:", out_path, "-", len(merged), "domande,", len(parts), "parti")

if __name__ == '__main__':
    main()
