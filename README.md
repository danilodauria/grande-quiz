# Il Grande Quiz dell'Informatica

**Opera di Danilo D'Auria** — ideatore e sviluppatore di FeniceOS, autore di «Tecnologia Gentile: Informatica Sostenibile».
Un progetto FeniceOS per l'alfabetizzazione digitale in centri anziani, scuole, biblioteche e centri sociali.

🌐 **Sito:** https://danilodauria.github.io/grande-quiz/

- ⏱️ **Quiz a tempo** — una domanda alla volta, timer regolabile da 10 secondi a 5 minuti per domanda
- 📝 **Scheda risposte** — tutte le domande insieme, come su carta, con tempo complessivo facoltativo
- 🖥️ **Schermo domande** — da proiettare in aula
- 📘 **Manuale e vademecum interattivi** di FeniceOS
- 🔒 **Area riservata** — correttore automatico, presentazione con quiz a squadre, libro delle risposte:
  tutto **cifrato** (AES-256) e protetto da password e Google Authenticator
- ⬇️ **Pacchetto offline** completo da scaricare

Tutto funziona nel browser, anche senza Internet. Nessun dato viene inviato in rete.

## Le soluzioni non sono in questo repository
Il repository è pubblico: per questo **le soluzioni non ci sono**. Stanno solo nella cartella privata
`grande-quiz-PRIVATO` di Danilo D'Auria e, cifrate, in `docs/riservato/cassaforte.bin`
(si crea con `docs/riservato/crea-cassaforte.html`). Il file `.gitignore` blocca comunque i file con le soluzioni.

## Struttura
| Cartella | Contenuto |
|---|---|
| `docs/` | Il sito pubblicato con GitHub Pages (Settings → Pages → *Deploy from a branch* → `main` / `/docs`) |
| `docs/quiz/` | L'app del quiz (timer, scheda, schermo) |
| `docs/riservato/` | Area riservata, strumento «Crea la cassaforte», `cassaforte.bin` cifrata |
| `sorgenti/` | Il pacchetto sorgente di Danilo D'Auria (Markdown + script dei PDF), **senza soluzioni** |
| `strumenti/costruisci.py` | Rigenera `docs/` dai sorgenti: `python3 strumenti/costruisci.py --privato ../grande-quiz-PRIVATO` |
| `tests/test_sito.py` | Prove automatiche (Playwright): nessuna soluzione in chiaro, timer, esportazione, cassaforte |

## Licenze
- **Contenuti** (domande, testi, grafica): © 2026 Danilo D'Auria, [CC BY-NC-SA 4.0](LICENZA-CONTENUTI.md) — citare sempre l'autore.
- **Codice**: [MIT](LICENSE).
