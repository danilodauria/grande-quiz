# Pacchetto sorgente — Progetti FeniceOS (Quiz, Manuale & Presentazione)

> **Attenzione — versione pubblica.** In questo repository pubblico i file con le soluzioni
> (`grande_quiz/answers.md`, `manuale_fondamenti/06_appendice_risposte.md`, `presentazione/src/quiz_data.json`)
> **non ci sono**: stanno solo nella cartella privata `grande-quiz-PRIVATO/soluzioni/` di Danilo D'Auria.
> Per rigenerare PDF e presentazione, copiateli temporaneamente al loro posto e non caricateli mai su GitHub
> (il file `.gitignore` del repository li blocca comunque).

Questo pacchetto contiene **tutto il codice sorgente e i contenuti** usati per generare:

1. **"Il Grande Quiz dell'Informatica"** (cartella `grande_quiz/`) — il libro di quiz con 264 domande, il foglio risposte, e la versione interattiva offline in HTML.
2. **"FeniceOS — Tecnologia Gentile per Tutte le Età"** (cartella `manuale_fondamenti/`) — il manuale con i suoi quiz, il foglio risposte, e la versione interattiva offline in HTML.
3. **La Presentazione Interattiva per la lezione in aula** (cartella `presentazione/`) — slide di spiegazione del Manuale + quiz a squadre con punteggio, in un unico HTML offline pensato per essere proiettato. Le istruzioni per questa parte sono nel paragrafo 9.

Serve a tre scopi:

- **Ricaricare e modificare** uno dei volumi esistenti (correggere una domanda, aggiungerne di nuove, aggiornare un testo) e rigenerare PDF/HTML aggiornati.
- **Usarlo come base identica** per creare un **Volume 2** — un quiz nuovo, stessa struttura ed estetica, domande e risposte tutte nuove. Le istruzioni dettagliate sono più sotto.
- **Modificare la presentazione per la lezione** — cambiare le slide di spiegazione o il modo in cui il quiz a squadre pesca le domande.

Non è necessario toccare nulla dei PDF già stampati né dei file HTML già in uso: questo pacchetto serve solo per il *futuro*, quando vorrai aggiornare o ampliare il materiale.

---

## 1. Cosa contiene il pacchetto

```
pacchetto_sorgente_feniceos/
├── LEGGIMI.md                  ← questo file
├── requirements.txt            ← librerie Python richieste
│
├── grande_quiz/                 "Il Grande Quiz dell'Informatica"
│   ├── 01_parte1.md … 04_parte4.md   ← testi dei capitoli + domande (Markdown)
│   ├── answers.md                    ← risposte commentate
│   ├── build.py                      ← motore di parsing/rendering (non va quasi mai toccato)
│   ├── assemble.py                   ← assembla copertina/corpo/retro (titoli, struttura, testi di cornice)
│   ├── assemble_answersheet.py       ← assembla il foglio risposte
│   ├── finalize.py                   ← unisce le pagine, numera, salva il PDF finale in output/
│   ├── finalize_answersheet.py       ← come sopra, per il foglio risposte
│   ├── export_json.py                ← estrae le 264 domande in quiz_data.json (per la versione interattiva)
│   ├── build_interactive.py          ← assembla l'HTML interattivo offline autonomo
│   ├── icons.py, style.css           ← icone SVG e foglio di stile del PDF
│   ├── interactive/                  ← sorgenti della versione interattiva (HTML/CSS/JS separati)
│   ├── pages/                        ← (si crea da sé) HTML intermedi generati da assemble.py
│   └── output/                       ← (si crea da sé) qui finiscono i PDF/HTML finali
│
├── manuale_fondamenti/           "FeniceOS — Tecnologia Gentile per Tutte le Età"
│   ├── 00_front_matter.md … 07_back_matter.md   ← testi e domande
│   ├── build.py, assemble.py, assemble_answersheet.py
│   ├── finalize.py, finalize_answersheet.py
│   ├── build_web.py               ← assembla l'HTML interattivo offline autonomo
│   ├── icons.py, style.css, web_style.css
│   ├── pages/                     ← (si crea da sé)
│   └── output/                    ← (si crea da sé)
│
└── presentazione/                "Presentazione Interattiva" per la lezione in aula
    ├── build_presentation.py      ← assembla l'HTML autonomo (slide + quiz a squadre)
    ├── src/
    │   ├── index.html, app.css, app.js   ← struttura, stile e logica della presentazione
    │   ├── slides_data.json              ← testo delle slide di spiegazione (15 capitoli)
    │   └── quiz_data.json                ← le 264 domande usate dal quiz a squadre (copia di quella di grande_quiz/)
    └── output/                    ← (si crea da sé)
```

I tre progetti sono indipendenti tra loro. `grande_quiz/` e `manuale_fondamenti/` sono strutturati allo stesso modo (stesso "motore" `build.py`, adattato ai contenuti di ciascun volume); `presentazione/` è più semplice — solo Python, senza bisogno di `wkhtmltopdf` — e riutilizza i contenuti degli altri due.

---

## 2. Prerequisiti (da installare una sola volta sul tuo computer)

1. **Python 3** (versione 3.9 o superiore). Verifica con:
   ```
   python3 --version
   ```
2. **Le librerie Python** richieste — dalla cartella del pacchetto:
   ```
   pip install -r requirements.txt
   ```
   (su alcuni sistemi serve `pip3` invece di `pip`, o l'opzione `--break-system-packages`)
3. **wkhtmltopdf** — il programma che converte le pagine HTML in PDF. Non è una libreria Python: è un programma a sé che va installato a parte.
   - **Windows/Mac**: scarica l'installer da https://wkhtmltopdf.org/downloads.html
   - **Linux (Debian/Ubuntu)**: `sudo apt install wkhtmltopdf`
   - Dopo l'installazione verifica con: `wkhtmltopdf --version` (questo pacchetto è stato costruito e testato con la versione 0.12.6; versioni diverse potrebbero impaginare in modo leggermente diverso — vedi nota nel paragrafo 6).

Se vuoi generare **solo** le versioni interattive HTML (senza i PDF), ti servono soltanto Python e le librerie del punto 2: `wkhtmltopdf` serve solo per i PDF stampabili. Per la cartella `presentazione/` non serve nemmeno il punto 2: basta Python da solo (usa solo librerie incluse di serie, senza alcuna installazione aggiuntiva).

---

## 3. Come rigenerare "Il Grande Quiz dell'Informatica"

Apri un terminale nella cartella `grande_quiz/` e lancia, in ordine:

```bash
# 1. Genera le pagine HTML intermedie (copertina, corpo, retro, foglio risposte)
python3 assemble.py
python3 assemble_answersheet.py

# 2. Converte ciascuna pagina HTML in PDF grezzo (wkhtmltopdf)
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/cover.html out_cover.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/book.html out_book.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/backcover.html out_backcover.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/answersheet.html out_answersheet.pdf

# 3. Unisce le pagine, numera, rifinisce e salva i PDF definitivi in output/
python3 finalize.py
python3 finalize_answersheet.py

# 4. (Opzionale) Rigenera la versione interattiva offline in HTML
python3 export_json.py
python3 build_interactive.py
```

Alla fine troverai in `grande_quiz/output/`:
- `Il_Grande_Quiz_dellInformatica.pdf`
- `Il_Grande_Quiz_dellInformatica_Risposte.pdf`
- `Il_Grande_Quiz_dellInformatica_Interattivo_Offline.html` (se hai lanciato il passo 4)

Questo identico procedimento è stato verificato passo passo su questo pacchetto prima di consegnartelo: rigenera PDF e HTML in tutto e per tutto equivalenti agli originali che hai già.

---

## 4. Come rigenerare il Manuale "FeniceOS — Tecnologia Gentile"

Stessa logica, dentro la cartella `manuale_fondamenti/`:

```bash
python3 assemble.py
python3 assemble_answersheet.py

wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/cover.html out_cover.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/book.html out_book.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/backcover.html out_backcover.pdf
wkhtmltopdf --enable-local-file-access --encoding utf-8 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0 pages/answersheet.html out_answersheet.pdf

python3 finalize.py
python3 finalize_answersheet.py

# versione interattiva offline
python3 build_web.py
```

Troverai in `manuale_fondamenti/output/`:
- `FeniceOS_Manuale_Tecnologia_Gentile.pdf`
- `FeniceOS_Foglio_Risposte.pdf`
- `FeniceOS_Manuale_Interattivo_Offline.html`

---

## 5. Il formato dei contenuti (Markdown)

Tutti i testi e le domande sono in semplici file `.md` (Markdown), leggibili e modificabili con qualsiasi editor di testo (Blocco Note, TextEdit, VS Code, ecc.). Ecco lo schema esatto che il programma si aspetta.

### Capitoli

```
## Capitolo 2. Storia dell'informatica: dalle origini a oggi

*Un viaggio tra le tappe che hanno reso possibile il mondo digitale di oggi.*
```

- `## Capitolo N. Titolo` apre un nuovo capitolo (N = numero progressivo).
- La riga tra asterischi singoli (*...*) subito sotto è il sottotitolo introduttivo del capitolo, mostrato in corsivo.

### Sezioni per livello, dentro un capitolo

```
**Sezione Livello Base**
...domande...

**Sezione Livello Intermedio**
...domande...

**Sezione Livello Esperto**
...domande...
```

### Domanda a scelta multipla

```
**D9.** Chi ha ideato il concetto teorico di "macchina universale", alla base dell'informatica moderna?
A) Alan Turing B) Bill Gates C) Guglielmo Marconi D) Thomas Edison
```

- `**DN.**` dove N è il numero progressivo della domanda in **tutto il volume** (i numeri non ripartono da 1 a ogni capitolo: proseguono in sequenza dalla prima all'ultima domanda del libro).
- Il testo della domanda segue sulla stessa riga.
- Le quattro opzioni `A) ... B) ... C) ... D) ...` stanno **sulla riga immediatamente successiva**, tutte insieme sulla stessa riga.

### Domanda Vero/Falso

```
**D2.** Vero o Falso: i primissimi computer, a metà del Novecento, occupavano intere stanze.
```

- Stessa cosa, ma senza le opzioni A)-D): il programma riconosce automaticamente le domande Vero/Falso dalla dicitura "Vero o Falso" nel testo.

### Domanda aperta (supportata dal motore, anche se non usata nei volumi attuali)

```
**D50. (domanda aperta)** Descrivi con parole tue cos'è il cloud computing.
```

### Le risposte (file `answers.md`)

```
## Risposte — Capitolo 2. Storia dell'informatica: dalle origini a oggi

**D1.** C) Esempio di risposta — una breve spiegazione (esempio inventato: le soluzioni vere sono solo nella cartella privata).
**D2.** Vero — una breve spiegazione (esempio).
```

- Ogni capitolo di domande ha un blocco corrispondente `## Risposte — Capitolo N. Titolo` (titolo identico a quello del capitolo).
- Ogni risposta inizia con `**DN.**`, seguito dalla lettera corretta (`A) ...`, `B) ...`, ecc.) oppure da `Vero`/`Falso`, poi un trattino lungo (—) e una breve spiegazione. Questa sintassi (lettera o Vero/Falso all'inizio) è quella che permette al programma di riconoscere automaticamente qual è la risposta corretta, sia nel foglio risposte stampato sia nella versione interattiva.

**Importante:** i numeri delle domande (`D1`, `D2`, ...) devono corrispondere esattamente tra i file dei capitoli e `answers.md`, altrimenti una domanda resterebbe senza risposta abbinata.

---

## 6. Come modificare i volumi esistenti

Per correggere, aggiornare o aggiungere domande a un volume già pubblicato:

1. Apri il file `.md` del capitolo interessato (es. `02_parte2.md`) e modifica o aggiungi le domande seguendo esattamente il formato del paragrafo 5.
2. Se aggiungi nuove domande, dai loro il numero progressivo successivo all'ultima domanda del libro (per non creare doppioni) e aggiungi la risposta corrispondente in `answers.md`.
3. Rilancia l'intera procedura di generazione (paragrafo 3 o 4) per ottenere PDF e HTML aggiornati.
4. Controlla il PDF e la versione interattiva prima di ristampare o ridistribuire.

Non serve toccare `build.py`, `assemble.py`, `icons.py` o i fogli di stile per una semplice modifica di contenuto: bastano i file `.md`.

---

## 7. Come creare il Volume 2 — un nuovo quiz, stessa veste grafica

Il modo più semplice è **copiare l'intera cartella `grande_quiz/`** e sostituire solo i contenuti, mantenendo intatta la struttura del codice. Ecco i passaggi:

### Passo 1 — Copia il progetto

Duplica l'intera cartella `grande_quiz/` e rinominala, per esempio `grande_quiz_vol2/`.

### Passo 2 — Sostituisci le domande

Nei quattro file `01_parte1.md` … `04_parte4.md`, sostituisci le domande esistenti con le nuove, capitolo per capitolo, seguendo **esattamente** il formato del paragrafo 5 (stesso schema di capitoli/sezioni/domande). Puoi mantenere la stessa struttura di 12 capitoli / 4 parti / 3 livelli (Base, Intermedio, Esperto) già collaudata, semplicemente scrivendo domande diverse — è la via più rapida e sicura.

Aggiorna allo stesso modo `answers.md` con le nuove risposte commentate, mantenendo i numeri `DN` allineati a quelli delle nuove domande.

Se invece vuoi anche cambiare **il numero o i titoli dei capitoli/parti** (una struttura diversa, non solo domande nuove), dovrai aggiornare in più punti di `assemble.py`: il dizionario `PART_META` (titoli e descrizioni delle 4 parti, elenco capitoli) e in `build.py` i dizionari `CH_ICON` (icona di ciascun capitolo) e `CH_PART` (a quale parte appartiene ciascun capitolo). Per un Volume 2 "stessa struttura, domande nuove" questo passo **non è necessario**.

### Passo 3 — Aggiorna i testi di copertina, titolo e conteggi

In `assemble_vol2/assemble.py` (la tua copia), cerca e aggiorna:
- Il titolo di copertina (cerca `cover-title` — oggi "Il Grande Quiz dell'Informatica").
- Il sottotitolo e la frase di presentazione (cerca `cover-subtitle`, `blurb_paras`).
- Ogni occorrenza del numero **264** (numero totale di domande) e **12 capitoli** nei testi di copertina, retro copertina e introduzione — se il Volume 2 ha un numero diverso di domande o capitoli, aggiornale di conseguenza (cerca semplicemente "264" nel file, comparirà in 3-4 punti).
- Se vuoi, cambia anche il sottotitolo "Volume 2" da qualche parte nel titolo, per distinguerlo chiaramente dal primo volume (es. "Il Grande Quiz dell'Informatica — Volume 2").

Nello stesso modo, in `assemble_answersheet.py` aggiorna eventuali riferimenti al titolo.

### Passo 4 — Aggiorna i nomi dei file e i metadati del PDF

In `finalize.py` e `finalize_answersheet.py` (della tua copia), cambia:
- Il nome del file di output (es. `Il_Grande_Quiz_dellInformatica_Vol2.pdf`).
- I metadati del PDF (`/Title`, `/Subject`) nella chiamata `writer.add_metadata({...})`.

### Passo 5 — Aggiorna la versione interattiva

- In `export_json.py`, aggiorna il `title` e `subtitle` scritti nel dizionario `data` (in fondo al file) se vuoi che riportino "Volume 2".
- In `interactive/index.html` (della tua copia), aggiorna il tag `<title>`, la `<meta name="description">` e l'intestazione visibile (cerca "Il Grande Quiz dell'Informatica").
- In `build_interactive.py`, cambia il nome del file di output finale (es. `Il_Grande_Quiz_dellInformatica_Vol2_Interattivo_Offline.html`).

### Passo 6 — Genera e verifica

Rilancia l'intera procedura del paragrafo 3 dentro la cartella della tua copia, e controlla il risultato: PDF (copertina, indice, domande, foglio risposte) e versione interattiva HTML (aprendola nel browser).

---

## 8. Note tecniche utili da sapere

- **Il "trucco" dello zoom nel CSS.** Nel file `style.css` di entrambi i progetti troverai questa riga in cima:
  ```css
  html { margin:0; padding:0; zoom: 1.302; }
  ```
  Serve a compensare un comportamento della versione di `wkhtmltopdf` usata per generare questi PDF, che rimpicciolisce leggermente tutte le misure CSS durante la stampa in PDF. Se non la tocchi, tutto continuerà a funzionare correttamente. Se in futuro installi una versione diversa di `wkhtmltopdf` e noti margini o caratteri troppo grandi/piccoli, prova innanzitutto a modificare questo valore (o a rimuoverlo) e confronta il risultato con un righello sul PDF stampato.

- **Il numero di pagine può variare leggermente da computer a computer.** `wkhtmltopdf` impagina il testo in base ai font effettivamente disponibili sul sistema. Rigenerando questi PDF su un computer diverso (o con font di sistema leggermente diversi) è normale ottenere un PDF con qualche pagina in più o in meno rispetto all'originale: è una differenza di sola impaginazione, il contenuto resta identico. Le funzioni `drop_stray_blank_pages()` in `finalize.py` già ripuliscono automaticamente eventuali pagine quasi vuote che questo comportamento può generare.

- **Le versioni interattive HTML sono file singoli e autonomi.** Non hanno bisogno di internet né di installare nulla: si aprono con doppio clic in qualsiasi browser (Chrome, Firefox, Edge, Safari) e funzionano anche offline, salvando i progressi localmente sul dispositivo su cui vengono aperte.

- **Se qualcosa va storto**, il modo più semplice per capire cosa è successo è rileggere i messaggi stampati nel terminale a ogni passaggio (`python3 assemble.py` e gli altri script stampano sempre un messaggio di conferma o un errore chiaro con il numero di riga del file `.md` che ha causato il problema).

---

## 9. Come rigenerare la Presentazione Interattiva (slide + quiz a squadre)

La cartella `presentazione/` genera il file usato per la lezione in aula: le slide di spiegazione del Manuale e il quiz a squadre con punteggio, proiettabili a schermo intero. A differenza degli altri due progetti, qui non serve `wkhtmltopdf`: basta Python.

Apri un terminale nella cartella `presentazione/` e lancia:

```bash
python3 build_presentation.py
```

Troverai in `presentazione/output/`:
- `FeniceOS_Presentazione_Interattiva_Offline.html`

Anche questo è un file singolo e autonomo: si apre con doppio clic in qualunque browser, su Windows, Mac o Linux, senza bisogno di internet.

### Modificare le slide di spiegazione

Il contenuto delle slide (titoli, punti elenco, frase "da ricordare" di ogni capitolo) è tutto nel file `presentazione/src/slides_data.json` — un file di testo semplice, leggibile e modificabile con qualunque editor. È organizzato così:

- `meta` — titolo, sottotitolo e autore mostrati nella slide di copertina.
- `parts` — le 4 parti della lezione (numero romano, titolo, colore, elenco dei capitoli che contiene).
- `chapters` — un blocco per ogni capitolo, con `title` (titolo), `bullets` (l'elenco di 3-5 punti chiave mostrati nella slide) e `callout` (la frase finale evidenziata).

Per cambiare il testo di una slide, modifica semplicemente le stringhe corrispondenti in questo file (rispettando le virgolette e le virgole del formato JSON), poi rilancia `python3 build_presentation.py`. Per aggiungere o togliere un capitolo, aggiungi o rimuovi il suo blocco in `chapters` e il suo numero nell'elenco `chapters` della parte a cui appartiene in `parts`.

### Cambiare le domande del quiz a squadre

Il quiz a squadre pesca dal file `presentazione/src/quiz_data.json`, che è **una copia** dello stesso file generato da `export_json.py` nella cartella `grande_quiz/` (paragrafo 3, passo 4). Se in futuro aggiorni o amplii le domande de "Il Grande Quiz dell'Informatica" (paragrafo 6) o crei un Volume 2 (paragrafo 7), e vuoi che il quiz a squadre della presentazione usi le nuove domande, ricordati di:

1. Rigenerare `quiz_data.json` in `grande_quiz/` con `python3 export_json.py`.
2. Copiare il file aggiornato dentro `presentazione/src/quiz_data.json`, sostituendo quello esistente.
3. Rilanciare `python3 build_presentation.py`.

Se preferisci che il quiz a squadre resti legato solo alle domande attuali, non serve fare nulla: continuerà a funzionare com'è.

---

## 10. Personalizzare l'aspetto della presentazione

Lo stile visivo (colori, dimensioni dei caratteri, layout delle slide e delle schermate del quiz) è tutto nel file `presentazione/src/app.css`, con la stessa tavolozza di colori usata nei PDF e nelle altre versioni interattive (variabili in cima al file, sotto `:root`). La logica interattiva (navigazione delle slide, punteggio delle squadre, tema chiaro/scuro) è in `presentazione/src/app.js`. Come per gli altri progetti, dopo ogni modifica rilancia `python3 build_presentation.py` per rigenerare il file finale.

---

Buon lavoro con il tuo Volume 2 — e buona lezione con la presentazione.
