#!/usr/bin/env python3
"""Il Grande Quiz dell'Informatica — costruzione del sito pubblico (cartella docs/).

Uso:
  python3 strumenti/costruisci.py                       # solo il sito pubblico (senza soluzioni)
  python3 strumenti/costruisci.py --privato CARTELLA     # anche il contenuto riservato in CARTELLA/contenuto-riservato.json

Cosa fa:
  1. legge le domande dai file Markdown in sorgenti/ (Grande Quiz: 264 domande; Manuale FeniceOS: 66 domande)
     e scrive docs/dati/*.js  — SOLO testi e opzioni, MAI le soluzioni;
  2. ricrea il manuale interattivo pubblico (docs/manuale/) senza le risposte a comparsa;
  3. copia vademecum, schermo domande originale e PDF pubblici;
  4. con --privato: legge le soluzioni dalla cartella privata e prepara contenuto-riservato.json
     (chiavi di correzione, spiegazioni, presentazione a squadre, PDF con le soluzioni). Quel file NON va mai
     nel repository: si cifra con strumenti/crea-cassaforte.html, che produce docs/riservato/cassaforte.bin;
  5. crea il pacchetto completo da scaricare (docs/download/grande-quiz-offline.zip).

Autore: Danilo D'Auria — codice MIT, contenuti CC BY-NC-SA 4.0
"""
import argparse, base64, datetime, hashlib, html, json, os, re, shutil, subprocess, sys, tempfile, zipfile

QUI = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(QUI)
PKG = os.path.join(REPO, "sorgenti", "pacchetto_sorgente_feniceos")
EXTRA = os.path.join(REPO, "sorgenti", "extra")
DOCS = os.path.join(REPO, "docs")
VERSIONE = open(os.path.join(REPO, "VERSIONE"), encoding="utf-8").read().strip()
AUTORE = "Danilo D'Auria"

PART_COLOR = {1: "#3f7a4f", 2: "#d9752f", 3: "#2f6b8f", 4: "#7a4f9e", 5: "#c78a2e"}


def leggi(p):
    return open(p, encoding="utf-8").read()


def scrivi(p, testo):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        f.write(testo)


def importa_da(cartella, *moduli):
    """Importa i moduli Python di Danilo (build.py, assemble.py...) dalla cartella indicata, isolati."""
    vecchio_cwd, vecchio_path = os.getcwd(), list(sys.path)
    for m in ("build", "assemble", "export_json", "icons", "build_web"):
        sys.modules.pop(m, None)
    os.chdir(cartella)
    sys.path.insert(0, cartella)
    try:
        return [__import__(m) for m in moduli]
    finally:
        sys.path[:] = vecchio_path
        os.chdir(vecchio_cwd)


# ---------------------------------------------------------------- Grande Quiz (264)
def grande_quiz(privato):
    cart = os.path.join(PKG, "grande_quiz")
    ej, A = importa_da(cart, "export_json", "assemble")
    cwd = os.getcwd(); os.chdir(cart)
    try:
        domande = []
        for _, fn in sorted(A.PART_FILES.items()):
            domande += ej.parse_questions_from_part(fn)
    finally:
        os.chdir(cwd)
    titoli_cap = {}
    for q in domande:
        titoli_cap[q["chapter"]] = q["chapter_title"]
    parti = []
    for num in sorted(A.PART_META):
        pm = A.PART_META[num]
        caps = sorted(c for c in titoli_cap if ej.CH_PART.get(c) == num)
        parti.append({"num": num, "roman": A.ROMAN[num], "titolo": pm["title"], "desc": pm.get("desc", ""),
                      "colore": PART_COLOR.get(num, "#1b3a4b"),
                      "capitoli": [{"num": c, "titolo": titoli_cap[c]} for c in caps]})
    assert sum(len(p["capitoli"]) for p in parti) == len(titoli_cap) == 11, titoli_cap
    pub = []
    for q in sorted(domande, key=lambda d: d["n"]):
        livello = q["section"].replace("Livello ", "")
        pub.append({"n": q["n"], "cap": q["chapter"], "livello": livello, "tipo": q["type"],
                    "testo": q["stem"], "opzioni": q["options"]})
    assert len(pub) == 264, len(pub)
    dati = {"id": "grande", "titolo": "Il Grande Quiz dell'Informatica",
            "sottotitolo": "Domande e risposte per l'alfabetizzazione digitale, dalle basi ai livelli esperti",
            "autore": AUTORE, "totale": len(pub), "livelli": ["Base", "Intermedio", "Esperto"],
            "parti": parti, "domande": pub}
    chiavi = None
    if privato:
        ans = os.path.join(privato, "soluzioni", "grande_quiz_answers.md")
        raw = leggi(ans)
        lead = re.compile(r'^\s*(?:([A-D])\)|(Vero)|(Falso))')
        chiavi = {}
        for qn, atext, _ in ej.ANS_RE.findall(raw):
            atext = atext.strip()
            m = lead.match(atext)
            corr = (m.group(1) or m.group(2) or m.group(3)) if m else None
            chiavi[str(int(qn))] = {"giusta": corr, "spiega": ej.strip_p(ej.md2html(atext))}
        mancano = [d["n"] for d in pub if str(d["n"]) not in chiavi or not chiavi[str(d["n"])]["giusta"]]
        assert not mancano, "soluzioni mancanti: %s" % mancano
    return dati, chiavi


# ---------------------------------------------------------------- Quiz del Manuale FeniceOS (66)
LIVELLO_MANUALE = {17: "Base", 18: "Intermedio", 19: "Avanzato", 20: "Storia, presente, futuro e IA", 21: "Economia circolare ed etica"}
MATCH_RE = re.compile(r'^(?P<stem>.*?)\s*1\)\s*(?P<v1>.*?)\s*—\s*2\)\s*(?P<v2>.*?)\s*—\s*3\)\s*(?P<v3>.*?)\s*—\s*4\)\s*(?P<v4>.*?)\.\s*'
                      r'(?P<eti>[^:.]+):\s*a\)\s*(?P<a>.*?);\s*b\)\s*(?P<b>.*?);\s*c\)\s*(?P<c>.*?);\s*d\)\s*(?P<d>.*?)\.?\s*$', re.S)


def manuale_quiz(privato):
    cart = os.path.join(PKG, "manuale_fondamenti")
    (b,) = importa_da(cart, "build")
    raw = leggi(os.path.join(cart, "05_parte5_quiz.md"))
    capitoli, domande = [], []
    opt_re = re.compile(r'\nA\)\s*(.*?)\s+B\)\s*(.*?)\s+C\)\s*(.*?)\s+D\)\s*(.*)$', re.S)
    inl = lambda t: b.md2html(t.strip())[3:-4]
    for num, titolo, corpo in b.split_chapters(raw):
        if num not in LIVELLO_MANUALE:
            continue
        capitoli.append({"num": num, "titolo": titolo})
        sezione = ""
        for blk in b.split_blocks(corpo):
            sm = re.match(r'\*\*Sezione (.+?)\*\*', blk)
            if sm:
                sezione = sm.group(1); continue
            m = b.Q_START.match(blk)
            if not m:
                continue
            n, aperta, rest = int(m.group(1)), bool(m.group(2)), m.group(3).strip()
            q = {"n": n, "cap": num, "livello": LIVELLO_MANUALE[num], "sezione": sezione}
            om, mm = opt_re.search(rest), MATCH_RE.match(rest)
            if aperta:
                q.update(tipo="aperta", testo=inl(rest), opzioni=[])
            elif om:
                q.update(tipo="mc", testo=inl(rest[:om.start()]), opzioni=[inl(om.group(i)) for i in range(1, 5)])
            elif mm:
                q.update(tipo="abbina", testo=inl(mm.group("stem")), opzioni=[],
                         voci=[inl(mm.group("v%d" % i)) for i in range(1, 5)],
                         etichetta=mm.group("eti").strip(),
                         significati={k: inl(mm.group(k)) for k in "abcd"})
            elif re.search(r'Vero o Falso', rest, re.I):
                q.update(tipo="vf", testo=inl(rest), opzioni=[])
            else:
                raise SystemExit("Domanda %d del manuale: formato non riconosciuto" % n)
            domande.append(q)
    assert len(domande) == 66, len(domande)
    dati = {"id": "manuale", "titolo": "Quiz del Manuale FeniceOS",
            "sottotitolo": "«FeniceOS — Tecnologia Gentile per Tutte le Età»: le domande della Parte V",
            "autore": AUTORE, "totale": len(domande), "livelli": list(dict.fromkeys(LIVELLO_MANUALE.values())),
            "parti": [{"num": 5, "roman": "V", "titolo": "Quiz e verifica", "desc": "Domande per livello e per tema.",
                       "colore": PART_COLOR[5], "capitoli": capitoli}], "domande": domande}
    chiavi = None
    if privato:
        raw = leggi(os.path.join(privato, "soluzioni", "manuale_06_appendice_risposte.md"))
        lead = re.compile(r'^\s*(?:([A-D])\)|(Vero)|(Falso))')
        chiavi = {}
        for qn, atext, _ in b.ANS_RE.findall(raw):
            atext = atext.strip().split("\n---")[0].strip()
            q = next(d for d in domande if d["n"] == int(qn))
            if q["tipo"] == "abbina":
                giusta = dict(re.findall(r'(\d)-([a-d])', atext))
            elif q["tipo"] == "aperta":
                giusta = None
            else:
                m = lead.match(atext)
                giusta = (m.group(1) or m.group(2) or m.group(3)) if m else None
            chiavi[str(int(qn))] = {"giusta": giusta, "spiega": b.md2html(atext)[3:-4]}
        mancano = [d["n"] for d in domande if d["tipo"] != "aperta" and not (chiavi.get(str(d["n"])) or {}).get("giusta")]
        assert not mancano, "soluzioni del manuale mancanti: %s" % mancano
    return dati, chiavi


# ---------------------------------------------------------------- manuale interattivo e presentazione
def manuale_interattivo(privato):
    """Costruisce il manuale interattivo di Danilo in una copia temporanea: pubblico (senza risposte) e, se c'è la
    cartella privata, quello completo con le risposte a comparsa (va nel contenuto riservato)."""
    t = tempfile.mkdtemp()
    try:
        dst = os.path.join(t, "m")
        shutil.copytree(os.path.join(PKG, "manuale_fondamenti"), dst)
        app = os.path.join(dst, "06_appendice_risposte.md")
        risultati = {}
        for tipo in (["completo"] if privato else []) + ["pubblico"]:
            if tipo == "completo":
                shutil.copy(os.path.join(privato, "soluzioni", "manuale_06_appendice_risposte.md"), app)
            else:
                scrivi(app, "# Appendice — Foglio delle risposte\n\n*Le soluzioni sono nell'area riservata.*\n")
            subprocess.run([sys.executable, "build_web.py"], cwd=dst, check=True, stdout=subprocess.DEVNULL)
            h = leggi(os.path.join(dst, "output", "FeniceOS_Manuale_Interattivo_Offline.html"))
            if tipo == "pubblico":
                h = re.sub(r'<button class="revealbtn".*?</button>\s*<div class="answer">.*?</div>', "", h, flags=re.S)
                h = h.replace("Risposte a comparsa", "Soluzioni per chi conduce")
                h = h.replace("&mdash; con risposta a comparsa &mdash;", "&mdash; con le soluzioni riservate a chi conduce &mdash;")
                h = h.replace("con risposte a comparsa", "con le soluzioni riservate a chi conduce")
                h = h.replace("quiz a risposta rivelabile", "quiz")
                h = h.replace("</body>", NOTA_MANUALE + "</body>")
            risultati[tipo] = h
        return risultati
    finally:
        shutil.rmtree(t, ignore_errors=True)


NOTA_MANUALE = ('<div style="max-width:860px;margin:2rem auto;padding:1rem 1.2rem;border-radius:12px;background:#fbead9;'
                'border-left:5px solid #d9752f;font:15px/1.5 system-ui,sans-serif;color:#201c18">'
                '<b>Le soluzioni dei quiz</b> sono riservate a chi conduce l\'attività. Per mettersi alla prova con il '
                'tempo e farsi correggere: <a href="../quiz/?quiz=manuale">Quiz del Manuale con il timer</a>. '
                '&middot; <a href="../">Torna al Grande Quiz</a><br><small>© Danilo D\'Auria — contenuti CC BY-NC-SA 4.0</small></div>')


NASTRO = ('<div style="position:relative;z-index:9999;background:#12262f;color:#e8f0f4;font:600 14px/1.4 system-ui,sans-serif;'
          'padding:8px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">'
          '<a href="../" style="color:#f2b37a;text-decoration:none">&#8592; Il Grande Quiz dell\'Informatica</a>'
          '<span style="opacity:.75">Opera di Danilo D\'Auria &middot; un progetto FeniceOS &middot; CC BY-NC-SA 4.0</span></div>')


def nastro(h):
    """Aggiunge in cima alle pagine originali di Danilo il ritorno al sito e la paternità dell'opera."""
    return re.sub(r"(<body[^>]*>)", lambda m: m.group(1) + NASTRO, h, count=1)


def presentazione(privato):
    t = tempfile.mkdtemp()
    try:
        dst = os.path.join(t, "p")
        shutil.copytree(os.path.join(PKG, "presentazione"), dst)
        shutil.copy(os.path.join(privato, "soluzioni", "presentazione_quiz_data.json"), os.path.join(dst, "src", "quiz_data.json"))
        subprocess.run([sys.executable, "build_presentation.py"], cwd=dst, check=True, stdout=subprocess.DEVNULL)
        return leggi(os.path.join(dst, "output", "FeniceOS_Presentazione_Interattiva_Offline.html"))
    finally:
        shutil.rmtree(t, ignore_errors=True)


def quiz_con_soluzioni(privato):
    """La versione interattiva originale del Grande Quiz (con soluzioni e spiegazioni), per chi conduce."""
    t = tempfile.mkdtemp()
    try:
        dst = os.path.join(t, "g")
        shutil.copytree(os.path.join(PKG, "grande_quiz"), dst)
        shutil.copy(os.path.join(privato, "soluzioni", "grande_quiz_answers.md"), os.path.join(dst, "answers.md"))
        for s in ("export_json.py", "build_interactive.py"):
            subprocess.run([sys.executable, s], cwd=dst, check=True, stdout=subprocess.DEVNULL)
        return leggi(os.path.join(dst, "output", "Il_Grande_Quiz_dellInformatica_Interattivo_Offline.html"))
    finally:
        shutil.rmtree(t, ignore_errors=True)


def b64(p):
    return base64.b64encode(open(p, "rb").read()).decode()


# ---------------------------------------------------------------- principale
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--privato", help="cartella privata con soluzioni/ e pdf/ (mai nel repository)")
    ap.add_argument("--senza-zip", action="store_true")
    a = ap.parse_args()
    privato = os.path.abspath(a.privato) if a.privato else None

    gq, gq_k = grande_quiz(privato)
    mq, mq_k = manuale_quiz(privato)
    oggi = datetime.date.today().isoformat()
    for nome, d in (("grande-quiz", gq), ("manuale-quiz", mq)):
        d["versione"] = VERSIONE
        scrivi(os.path.join(DOCS, "dati", nome + ".js"),
               "/* %s — %s. © %s, contenuti CC BY-NC-SA 4.0. Generato da strumenti/costruisci.py: non modificare a mano. */\n"
               "window.GQ_QUIZ = window.GQ_QUIZ || {};\nwindow.GQ_QUIZ[%s] = %s;\n"
               % (d["titolo"], "solo domande, senza soluzioni", AUTORE, json.dumps(d["id"]), json.dumps(d, ensure_ascii=False)))
    print("✔ dati: %d + %d domande (senza soluzioni)" % (gq["totale"], mq["totale"]))

    man = manuale_interattivo(privato)
    scrivi(os.path.join(DOCS, "manuale", "index.html"), nastro(man["pubblico"]))
    scrivi(os.path.join(DOCS, "vademecum", "index.html"), nastro(leggi(os.path.join(EXTRA, "FeniceOS_Vademecum_Interattivo_Offline.html"))))
    scrivi(os.path.join(DOCS, "schermo-originale", "index.html"), nastro(leggi(os.path.join(EXTRA, "FeniceOS_Schermo_Domande_Offline.html"))))
    for f in ("Il_Grande_Quiz_dellInformatica.pdf", "Il_Grande_Quiz_dellInformatica_Scheda_Risposte_Vuota.pdf",
              "Vademecum_Quiz_Interattivo_FeniceOS.pdf"):
        shutil.copyfile(os.path.join(EXTRA, f), os.path.join(DOCS, "download", f))
    print("✔ manuale interattivo pubblico, vademecum, PDF pubblici")

    if privato:
        pdf = os.path.join(privato, "pdf-e-originali")
        if not os.path.isdir(pdf):
            pdf = os.path.join(privato, "pdf")
        contenuto = {
            "tipo": "grande-quiz-contenuto-riservato", "formato": 1, "versione": VERSIONE, "creato": oggi, "autore": AUTORE,
            "chiavi": {"grande": gq_k, "manuale": mq_k},
            "pagine": {
                "presentazione": {"titolo": "Presentazione e quiz a squadre", "html": presentazione(privato)},
                "quiz_soluzioni": {"titolo": "Grande Quiz con soluzioni e spiegazioni", "html": quiz_con_soluzioni(privato)},
                "manuale_completo": {"titolo": "Manuale interattivo con le risposte", "html": man["completo"]},
            },
            "pdf": {
                "Il_Grande_Quiz_dellInformatica_Risposte.pdf": b64(os.path.join(pdf, "Il_Grande_Quiz_dellInformatica_Risposte.pdf")),
                "FeniceOS_Foglio_Risposte.pdf": b64(os.path.join(pdf, "FeniceOS_Foglio_Risposte.pdf")),
                "FeniceOS_Manuale_Tecnologia_Gentile.pdf": b64(os.path.join(pdf, "FeniceOS_Manuale_Tecnologia_Gentile.pdf")),
            },
        }
        out = os.path.join(privato, "contenuto-riservato.json")
        scrivi(out, json.dumps(contenuto, ensure_ascii=False))
        print("✔ contenuto riservato (DA NON PUBBLICARE): %s (%.1f MB)" % (out, os.path.getsize(out) / 1e6))

    home()
    controlla_nessuna_soluzione()
    if not a.senza_zip:
        crea_zip()
        home()          # di nuovo, con la dimensione vera dello zip
        crea_zip()


def home():
    t = leggi(os.path.join(QUI, "modelli", "index.html"))
    def mb(m):
        p = os.path.join(DOCS, m.group(1))
        return ("%.1f MB" % (os.path.getsize(p) / 1e6)).replace(".", ",") if os.path.exists(p) else "—"
    t = re.sub(r"\{\{ICO:(\w+)\}\}", lambda m: '<i data-ico="%s"></i>' % m.group(1), t)
    t = re.sub(r"\{\{MB:([^}]+)\}\}", mb, t)
    t = t.replace("{{LOGO}}", '<i data-logo="logo-eroe"></i>').replace("{{CC}}", "<i data-cc></i>")
    if os.path.exists(os.path.join(DOCS, "riservato", "cassaforte.bin")):
        cass = ('<a class="scarico" href="riservato/cassaforte.bin" download><span class="s-ico viola"><i data-ico="lucchetto"></i></span><span><b>Cassaforte delle soluzioni</b>'
                '<small>Cifrata: si apre solo con la password e Google Authenticator di Danilo D\'Auria · %s</small></span><i data-ico="scarica"></i></a>'
                % ("%.1f MB" % (os.path.getsize(os.path.join(DOCS, "riservato", "cassaforte.bin")) / 1e6)).replace(".", ","))
    else:
        cass = ('<div class="scarico spento"><span class="s-ico viola"><i data-ico="lucchetto"></i></span><span><b>Cassaforte delle soluzioni</b>'
                '<small>In preparazione: la crea Danilo D\'Auria con la sua password</small></span></div>')
    t = t.replace("{{CASSAFORTE}}", cass)
    scrivi(os.path.join(DOCS, "index.html"), t)


SPIE = ["Tim Berners-Lee —", '"correct":', '"giusta":', '"correct": ', '"giusta": ', 'class="answer"', "1-b, 2-c, 3-d, 4-a"]


def controlla_nessuna_soluzione():
    """Il sito pubblico non deve contenere nessuna soluzione in chiaro (il controllo vero è in tests/)."""
    for r, _, fs in os.walk(DOCS):
        for f in fs:
            if f.endswith((".html", ".js", ".json", ".css", ".md", ".txt")):
                t = leggi(os.path.join(r, f))
                for s in SPIE:
                    if s in t:
                        raise SystemExit("✘ STOP: «%s» trovato in %s — il sito pubblico non deve contenere soluzioni" % (s, os.path.relpath(os.path.join(r, f), REPO)))
    print("✔ controllo: nessuna soluzione in chiaro nel sito pubblico")


def crea_zip():
    zp = os.path.join(DOCS, "download", "grande-quiz-offline.zip")
    if os.path.exists(zp):
        os.remove(zp)
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED) as z:
        for r, _, fs in os.walk(DOCS):
            for f in sorted(fs):
                p = os.path.join(r, f)
                if p == zp:
                    continue
                z.write(p, os.path.join("grande-quiz", os.path.relpath(p, DOCS)))
        z.writestr("grande-quiz/LEGGIMI.txt", LEGGIMI_ZIP.replace("\n", "\r\n"))
    print("✔ pacchetto da scaricare: docs/download/grande-quiz-offline.zip (%.1f MB)" % (os.path.getsize(zp) / 1e6))


LEGGIMI_ZIP = """Il Grande Quiz dell'Informatica — pacchetto completo offline
Ideazione, contenuti e cura: Danilo D'Auria — un progetto FeniceOS.

Per usarlo senza Internet: estraete lo zip e aprite index.html con doppio clic.
Tutto funziona nel browser (Chrome, Edge, Firefox, Safari), anche da chiavetta.

L'area riservata (cartella riservato/) contiene le soluzioni CIFRATE: si aprono solo con la
password di Danilo D'Auria e il codice di Google Authenticator.

Licenza dei contenuti: Creative Commons BY-NC-SA 4.0 — citare sempre l'autore, Danilo D'Auria,
nessun uso commerciale, le opere derivate con la stessa licenza.
Licenza del codice: MIT.
"""

if __name__ == "__main__":
    main()
