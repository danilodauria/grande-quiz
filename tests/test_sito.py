#!/usr/bin/env python3
"""Il Grande Quiz dell'Informatica — prove automatiche del sito (Playwright + Chromium).

Uso:  python3 tests/test_sito.py                                  # sito pubblico
      python3 tests/test_sito.py --privato ../grande-quiz-PRIVATO   # anche cassaforte, Authenticator e correttore
Le prove sulla cassaforte usano una COPIA del sito in una cartella temporanea: il repository non viene toccato.
Autore: Danilo D'Auria — MIT
"""
import argparse, base64, functools, hashlib, hmac, http.server, json, os, re, shutil, struct, sys, tempfile, threading, time
from playwright.sync_api import sync_playwright

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ESITO = {"ok": 0, "ko": 0}


def check(nome, cond):
    ESITO["ok" if cond else "ko"] += 1
    print(("  OK   " if cond else "  FAIL ") + nome)
    return cond


def totp(segreto, t=None):
    k = base64.b32decode(segreto + "=" * ((8 - len(segreto) % 8) % 8))
    h = hmac.new(k, struct.pack(">Q", int((t or time.time()) // 30)), hashlib.sha1).digest()
    o = h[19] & 15
    return "%06d" % ((struct.unpack(">I", h[o:o + 4])[0] & 0x7fffffff) % 1000000)


def server(cartella, porta):
    H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=cartella)
    H.log_message = lambda *a: None
    s = http.server.ThreadingHTTPServer(("127.0.0.1", porta), H)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def nessuna_soluzione(privato):
    print("== 1. Nessuna soluzione in chiaro nel repository pubblico")
    spie = ["Tim Berners-Lee —", '"correct":', '"giusta":', 'class="answer"', "1-b, 2-c, 3-d, 4-a", "1-d, 2-c, 3-a, 4-b"]
    trovati = []
    for r, ds, fs in os.walk(REPO):
        ds[:] = [d for d in ds if d not in (".git", "__pycache__")]
        for f in fs:
            p = os.path.join(r, f)
            if f.endswith((".html", ".js", ".json", ".md", ".css", ".py", ".txt")):
                t = open(p, encoding="utf-8", errors="ignore").read()
                for s in spie:
                    if s in t and not p.endswith(("test_sito.py", "costruisci.py")) and not (f.endswith(".py") and s == 'class="answer"'):
                        trovati.append((os.path.relpath(p, REPO), s))
    check("nessuna spia di soluzione nei file di testo (%s)" % (trovati[:3] or "pulito"), not trovati)
    for f in ("answers.md", "06_appendice_risposte.md", "quiz_data.json", "contenuto-riservato.json"):
        presenti = [os.path.relpath(os.path.join(r, f), REPO) for r, _, fs in os.walk(REPO) if f in fs]
        check("file con soluzioni assente: %s" % f, not presenti)
    if privato:
        chiavi = json.load(open(os.path.join(privato, "contenuto-riservato.json")))["chiavi"]["grande"]
        spiegazioni = [v["spiega"] for v in chiavi.values() if len(v["spiega"]) > 60][:40]
        dati = open(os.path.join(REPO, "docs", "dati", "grande-quiz.js"), encoding="utf-8").read()
        check("nessuna delle spiegazioni segrete nei dati pubblici", not any(s in dati for s in spiegazioni))


def prove_quiz(b):
    print("== 2. Quiz a tempo, scheda, schermo")
    base = "file://" + os.path.join(REPO, "docs") + "/"
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
    pg = ctx.new_page(); errori = []
    pg.on("pageerror", lambda e: errori.append(str(e)))
    pg.goto(base + "index.html"); pg.wait_for_timeout(300)
    check("pagina principale con l'autore", "Danilo D'Auria" in pg.inner_text("body") and "CC BY-NC-SA" in pg.inner_text("body"))
    check("icone disegnate", pg.locator(".eroe svg.ico").count() > 3)
    imp = {"quiz": "manuale", "modo": "tempo", "ambito": "capitoli", "capitoli": [17], "timer": True, "secondi": 10, "scadenza": "avanti",
           "info": {"nome": "Mario Rossi", "data": "2026-10-12", "centro": "Biblioteca", "gruppo": "", "livello": "", "note": ""}}
    pg.goto(base + "quiz/index.html")
    pg.evaluate("v => { localStorage.clear(); localStorage.setItem('gq.impostazioni', JSON.stringify(v)); }", imp)
    pg.goto(base + "quiz/index.html")
    check("limiti del timer 10 s – 5 min", pg.evaluate("GQ._test.T.MIN") == 10 and pg.evaluate("GQ._test.T.MAX") == 300)
    for _ in range(3):
        pg.click('[data-az="avanti"]')
    rng = pg.locator("#secondi")
    check("cursore del timer con minimo e massimo", rng.get_attribute("min") == "10" and rng.get_attribute("max") == "300")
    pg.click('[data-az="avanti"]'); pg.click('[data-az="avanti"]')
    check("riepilogo: 12 domande, 10 s", "12, nell'ordine" in pg.inner_text("main") and "10 s per domanda" in pg.inner_text("main"))
    pg.click('[data-az="inizia"]'); pg.wait_for_timeout(400)
    check("timer visibile", pg.locator(".anello").count() == 1)
    pg.click('.opzione[data-v="B"]'); pg.keyboard.press("Enter")
    pg.wait_for_timeout(11800)
    s = pg.evaluate("GQ._test.ses()")
    check("allo scadere si passa alla domanda dopo (D2 scaduta)", s["indice"] >= 2 and 2 in s["scadute"])
    while pg.evaluate("GQ._test.ses().elenco[GQ._test.ses().indice]") != 6:
        pg.click('[data-az="succ"]')
    for v, k in (("1", "b"), ("2", "c"), ("3", "d"), ("4", "a")):
        pg.click('.abb-b[data-voce="%s"][data-v="%s"]' % (v, k))
    pg.click('[data-az="pausa"]'); check("pausa nasconde la domanda", pg.locator(".pausa-velo").count() == 1)
    pg.click('[data-az="riprendi-pausa"]')
    pg.click('[data-az="termina"]'); pg.click("[data-si]"); pg.wait_for_timeout(300)
    with pg.expect_download() as d:
        pg.click('[data-az="esporta"]')
    dati = json.load(open(d.value.path()))
    check("esportazione .json: tipo, risposte, abbinamento, tempi", dati["tipo"] == "feniceos_manuale_quiz_risposte" and dati["answers"]["1"] == "B"
          and dati["answers"]["6"] == {"1": "b", "2": "c", "3": "d", "4": "a"} and "tempi" in dati and dati["impostazioni"]["timerSecondi"] == 10)
    check("nome del file con il partecipante", d.value.suggested_filename.startswith("QuizManuale_Risposte_Mario_Rossi_2026-10-12"))
    check("nessuna soluzione nel file esportato", "giusta" not in json.dumps(dati) and "spiega" not in json.dumps(dati))
    # scheda
    pg.evaluate("localStorage.clear(); localStorage.setItem('gq.impostazioni', JSON.stringify({modo:'scheda',schedaTimer:true,schedaMinuti:30,info:{nome:'Luca',data:'2026-10-12',centro:'',gruppo:'',livello:'',note:''}}))")
    pg.goto(base + "quiz/index.html")
    for _ in range(5):
        pg.click('[data-az="avanti"]')
    pg.click('[data-az="inizia"]'); pg.wait_for_timeout(300)
    check("scheda: 264 domande e orologio", pg.locator(".sch-riga").count() == 264 and pg.locator("#orologio").count() == 1)
    pg.click('#r1 [data-v="B"]'); pg.click('#r2 [data-v="Vero"]')
    check("scheda: conteggio risposte", "2 / 264" in pg.inner_text("#sch-conta"))
    # schermo
    pg.evaluate("localStorage.clear(); localStorage.setItem('gq.impostazioni', JSON.stringify({modo:'schermo'}))")
    pg.goto(base + "quiz/index.html")
    for _ in range(4):
        pg.click('[data-az="avanti"]')
    pg.click('[data-az="inizia"]'); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(200)
    check("schermo domande: frecce e nessuna risposta selezionabile", "Domanda 2 di 264" in pg.inner_text("main") and pg.locator(".opzione[disabled]").count() == 2)
    # pagine statiche
    for u, t in (("manuale/index.html", "FeniceOS"), ("vademecum/index.html", "FeniceOS"), ("schermo-originale/index.html", "Schermo")):
        pg.goto(base + u); pg.wait_for_timeout(200)
        check("si apre %s con la paternità dell'opera" % u, t in pg.inner_text("body") and "Danilo D'Auria" in pg.inner_text("body"))
    # telefono: niente scorrimento orizzontale
    m = b.new_page(viewport={"width": 375, "height": 812}, is_mobile=True, has_touch=True)
    for u in ("index.html", "quiz/index.html", "riservato/index.html"):
        m.goto(base + u); m.wait_for_timeout(300)
        check("telefono, nessuno scorrimento orizzontale: " + u, m.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"))
    check("nessun errore JavaScript", not errori)
    ctx.close()


def prove_cassaforte(b, privato):
    print("== 3. Cassaforte, Authenticator e correttore")
    t = tempfile.mkdtemp(); sito = os.path.join(t, "sito"); shutil.copytree(os.path.join(REPO, "docs"), sito)
    try:
        os.remove(os.path.join(sito, "riservato", "cassaforte.bin"))
    except OSError:
        pass
    srv = server(sito, 18777); B = "http://127.0.0.1:18777/"; PW = "Prova lunga per i test 2026!"
    cont = os.path.join(privato, "contenuto-riservato.json"); chiavi = json.load(open(cont))["chiavi"]
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True); pg = ctx.new_page(); errori = []
    pg.on("pageerror", lambda e: errori.append(str(e)))
    try:
        pg.goto(B + "riservato/"); pg.wait_for_timeout(500)
        check("senza cassaforte: istruzioni per crearla", "non è ancora stata creata" in pg.inner_text("main"))
        pg.goto(B + "riservato/crea-cassaforte.html"); pg.set_input_files("#fcont", cont); pg.wait_for_timeout(1500)
        sec = pg.evaluate("window._gqCrea.segreto"); em = pg.evaluate("window._gqCrea.emergenza")
        pg.fill("#totp1", totp(sec)); pg.wait_for_timeout(400)
        check("collegamento Authenticator verificato", "riuscito" in pg.inner_text("#totp-esito"))
        pg.check("#emerg-ok"); pg.fill("#pw1", "corta"); pg.fill("#pw2", "corta")
        check("password corta rifiutata", pg.is_disabled("#crea"))
        pg.fill("#pw1", PW); pg.fill("#pw2", PW)
        with pg.expect_download(timeout=90000) as d:
            pg.click("#crea")
        d.value.save_as(os.path.join(sito, "riservato", "cassaforte.bin"))
        raw = open(os.path.join(sito, "riservato", "cassaforte.bin"), "rb").read()
        check("cassaforte cifrata: nessun testo in chiaro", raw.startswith(b"GQCASSAFORTE1") and b"Berners" not in raw and sec.encode() not in raw)
        pg.goto(B + "riservato/"); pg.fill("#pw", "sbagliata"); pg.click("#sblocca"); pg.wait_for_timeout(2500)
        check("password sbagliata rifiutata", "non corretta" in pg.inner_text("#msg"))
        pg.fill("#pw", PW); pg.click("#sblocca"); pg.wait_for_selector("[data-c]", timeout=30000)
        sbagliato = "000000" if totp(sec) != "000000" else "111111"
        for i, c in enumerate(sbagliato):
            pg.fill('[data-c="%d"]' % i, c)
        pg.wait_for_timeout(500); check("codice Authenticator sbagliato rifiutato", "non valido" in pg.inner_text("main"))
        for i, c in enumerate(totp(sec)):
            pg.fill('[data-c="%d"]' % i, c)
        pg.wait_for_selector("#zona", timeout=5000); check("area riservata aperta", True)
        g = chiavi["grande"]; ans = {}
        for n in range(1, 265):
            giusta = g[str(n)]["giusta"]
            if n <= 200: ans[str(n)] = giusta
            elif n <= 250: ans[str(n)] = ("Falso" if giusta == "Vero" else "Vero") if giusta in ("Vero", "Falso") else ("A" if giusta != "A" else "B")
        f1 = os.path.join(t, "g.json"); json.dump({"tipo": "feniceos_grande_quiz_risposte", "versione": 2, "quiz": "grande", "info": {"nome": "Prova Rossi"}, "answers": ans}, open(f1, "w"))
        f2 = os.path.join(t, "v.json"); json.dump({"tipo": "feniceos_grande_quiz_risposte", "versione": 1, "info": {"nome": "Vecchio"}, "answers": {"1": g["1"]["giusta"]}}, open(f2, "w"))
        m = chiavi["manuale"]; ma = {k: v["giusta"] for k, v in m.items() if v["giusta"]}; ma["6"] = {"1": "b", "2": "c", "3": "a", "4": "d"}
        f3 = os.path.join(t, "m.json"); json.dump({"tipo": "feniceos_manuale_quiz_risposte", "versione": 2, "quiz": "manuale", "info": {"nome": "Bianchi"}, "answers": ma}, open(f3, "w"))
        pg.set_input_files("#fjson", [f1, f2, f3]); pg.wait_for_timeout(800)
        r = pg.inner_text("#ris"); chiuse = sum(1 for v in m.values() if v["giusta"])
        check("correttore: 200 / 264", "200 / 264" in r)
        check("correttore: formato vecchio (1 / 264)", "1 / 264" in r)
        check("correttore: abbinamento sbagliato (%d / %d)" % (chiuse - 1, chiuse), "%d / %d" % (chiuse - 1, chiuse) in r)
        pg.click('tr[data-i="0"]'); check("scheda di valutazione con spiegazioni", pg.locator(".voce.sbagliata .vs").count() > 0)
        with pg.expect_download() as d:
            pg.click("#csv")
        check("riepilogo CSV per Excel", "Prova Rossi" in open(d.value.path(), encoding="utf-8-sig").read())
        with ctx.expect_page() as np_:
            pg.click('[data-pagina="presentazione"]')
        np = np_.value; np.wait_for_timeout(600); check("presentazione a squadre si apre", len(np.inner_text("body")) > 50); np.close()
        with pg.expect_download() as d:
            pg.click('[data-pdf="Il_Grande_Quiz_dellInformatica_Risposte.pdf"]')
        check("PDF delle risposte", open(d.value.path(), "rb").read(5) == b"%PDF-")
        pg.goto(B + "riservato/"); pg.fill("#pw", PW); pg.click("#sblocca"); pg.wait_for_selector("[data-c]", timeout=30000)
        pg.click("#usa-emergenza"); pg.fill("#em", em.lower()); pg.click("#f-em button"); pg.wait_for_selector("#zona", timeout=5000)
        check("codice di emergenza", True)
        pg.goto(B + "riservato/crea-cassaforte.html"); pg.set_input_files("#fcont", cont); pg.click('[data-auth="vecchio"]')
        pg.set_input_files("#fvecchia", os.path.join(sito, "riservato", "cassaforte.bin")); pg.wait_for_timeout(300)
        pg.fill("#pwvecchia", PW); pg.click("#apri-vecchia"); pg.wait_for_timeout(4000)
        check("nuova cassaforte con lo stesso Authenticator", "di prima letto" in pg.inner_text("#vecchia-esito"))
        check("nessun errore JavaScript", not errori)
    finally:
        ctx.close(); srv.shutdown(); shutil.rmtree(t, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--privato"); a = ap.parse_args()
    privato = os.path.abspath(a.privato) if a.privato else None
    nessuna_soluzione(privato)
    with sync_playwright() as p:
        b = p.chromium.launch()
        prove_quiz(b)
        if privato:
            prove_cassaforte(b, privato)
        b.close()
    print("\nRISULTATO: %d/%d prove superate" % (ESITO["ok"], ESITO["ok"] + ESITO["ko"]))
    sys.exit(1 if ESITO["ko"] else 0)


if __name__ == "__main__":
    main()
