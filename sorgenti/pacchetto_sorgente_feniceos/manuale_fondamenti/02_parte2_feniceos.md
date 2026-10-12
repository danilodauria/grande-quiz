# Parte II — FeniceOS: il progetto

## Capitolo 5. Cos'è FeniceOS: presentazione del progetto

FeniceOS è una distribuzione Linux live, ideata e sviluppata da Danilo D'Auria, pensata per dare una seconda vita a computer considerati obsoleti e per abbassare al minimo le barriere d'accesso all'informatica. Il nome non è casuale: come la fenice della mitologia, che rinasce dalle proprie ceneri, FeniceOS fa rinascere hardware che il mercato avrebbe destinato alla dismissione.

**Il perché del progetto.** L'idea nasce dall'incontro di due bisogni distinti ma complementari. Da un lato, un'enorme quantità di hardware informatico ancora perfettamente funzionante viene ogni anno accantonata o smaltita solo perché non regge più il peso dei sistemi operativi più recenti. Dall'altro, esistono contesti sociali — i centri anziani, le scuole con budget limitati, i centri di aggregazione sociale — che avrebbero un bisogno enorme di postazioni informatiche funzionanti, ma non le risorse economiche per acquistarle nuove. FeniceOS unisce questi due bisogni: prende l'hardware che non serve più a qualcuno e lo mette a disposizione di chi ne ha bisogno.

**Il come del progetto.** Tecnicamente, FeniceOS è costruito a partire da Debian 12 (nome in codice "Bookworm"), una delle distribuzioni Linux più stabili, sicure e longeve dal punto di vista del supporto. Attorno a questa base viene costruita un'immagine live — cioè un sistema operativo completo che può essere avviato direttamente da una chiavetta USB, senza bisogno di essere installato sul disco fisso — ottimizzata per funzionare con requisiti hardware minimi: l'obiettivo dichiarato del progetto è far girare il sistema anche su macchine con meno di 500 MB di RAM disponibile, un valore che oggi la maggior parte dei sistemi operativi commerciali considererebbe del tutto insufficiente.

**Per chi è pensato.** FeniceOS nasce, in modo specifico e dichiarato, per tre tipologie di contesti: i centri anziani, dove diventa strumento di alfabetizzazione digitale per persone spesso escluse dal mondo informatico; le aule didattiche, dove permette di allestire laboratori informatici funzionanti anche con budget scolastici ridotti; i centri per il sociale più in generale, dove l'inclusione digitale è parte di un più ampio percorso di inclusione sociale.

Questo capitolo introduce il progetto nelle sue linee generali; il capitolo successivo ne descrive gli aspetti tecnici in modo accessibile anche a chi non ha alcuna base informatica pregressa, mentre i capitoli 7 e 8 approfondiscono le due applicazioni sociali principali del progetto.

> **Da ricordare.** FeniceOS non è "un sistema operativo per anziani" nel senso di una versione semplificata o limitata. È un sistema operativo completo e libero, che diventa accessibile grazie a una progettazione attenta e a un percorso didattico pensato per accompagnare chiunque, indipendentemente dall'esperienza pregressa.

## Capitolo 6. Come funziona FeniceOS: caratteristiche tecniche spiegate in modo semplice

Questo capitolo traduce in linguaggio accessibile alcune scelte tecniche del progetto, così che anche chi non ha alcuna base informatica possa comprendere, almeno nelle sue linee essenziali, cosa succede "dentro" a FeniceOS.

**Cos'è un sistema "live".** Un sistema operativo tradizionale viene installato sul disco fisso del computer: occupa spazio in modo permanente e, per essere sostituito, richiede una procedura di installazione spesso non banale. Un sistema live, come FeniceOS, funziona invece direttamente da una chiavetta USB (o da un DVD, anche se oggi la USB è la soluzione più pratica): si inserisce la chiavetta, si accende il computer, e il sistema si avvia senza toccare il disco fisso interno. Questo significa che si può "provare" FeniceOS su qualunque computer senza alcun rischio per i dati già presenti, e che la stessa chiavetta può essere portata da una macchina all'altra.

**La base Debian.** FeniceOS è costruito sopra Debian 12 "Bookworm", una distribuzione Linux nota per stabilità, sicurezza e per la vastità del proprio archivio di software libero. Scegliere Debian come fondamenta significa poter contare su un sistema estremamente testato, aggiornato regolarmente per correggere problemi di sicurezza, e completamente libero da costi di licenza.

**Il processo di costruzione (in parole semplici).** La creazione dell'immagine di FeniceOS segue una sequenza di passaggi tecnici, gestiti da uno script dedicato (fenice-build-master.sh), che si può descrivere così: prima si costruisce da zero un sistema Debian minimo (un processo chiamato debootstrap); poi, lavorando "dentro" a quel sistema come se ci si trovasse fisicamente al suo interno (un ambiente chiamato chroot), si installano e configurano i programmi necessari; infine il sistema viene compresso in un unico file molto efficiente (con una tecnologia chiamata squashfs, che riduce lo spazio occupato) e trasformato in un'immagine ISO avviabile (attraverso uno strumento chiamato xorriso), pronta per essere scritta su una chiavetta USB.

**Requisiti hardware minimi.** L'obiettivo tecnico dichiarato del progetto è la capacità di funzionare anche con meno di 500 MB di RAM: un valore che permette a FeniceOS di girare su computer che avrebbero enormi difficoltà, o l'impossibilità totale, ad avviare un sistema operativo moderno standard.

**Compatibilità BIOS e UEFI.** I computer possono avviarsi seguendo due standard tecnici diversi: il più datato BIOS e il più recente UEFI. FeniceOS è progettato per il dual boot tra questi due standard, cioè per essere in grado di avviarsi correttamente su entrambe le tipologie di macchina — una scelta necessaria per un progetto che, per sua natura, deve funzionare su hardware eterogeneo e spesso datato, come quello tipicamente donato o dismesso.

**Perché questi dettagli contano per la didattica.** Non serve che chi frequenta un corso in un centro anziani comprenda debootstrap o xorriso. Ma è utile che chi insegna li conosca, perché permettono di rispondere con sicurezza alla domanda più frequente: "perché su questo computer, che con Windows non funzionava più, adesso funziona tutto?" La risposta, in una frase, è: perché FeniceOS è stato costruito, fin dall'inizio, per chiedere all'hardware molto meno di quanto i sistemi operativi più diffusi oggi richiedano.

> **Da ricordare.** "Live", "leggero", "compatibile con hardware datato": tre caratteristiche tecniche che si traducono, nella pratica, in una sola cosa — accessibilità reale, senza compromessi sulla qualità del sistema.

## Capitolo 7. FeniceOS per i centri anziani: obiettivi didattici e sociali

I centri anziani rappresentano uno dei contesti d'elezione per FeniceOS, e meritano una trattazione dedicata perché le esigenze didattiche e sociali di questo pubblico sono specifiche e richiedono un approccio pensato appositamente.

**Obiettivi didattici.** L'alfabetizzazione digitale in età avanzata non punta a formare informatici, ma persone autonome nella vita quotidiana digitale: capaci di usare la posta elettronica per restare in contatto con familiari lontani, di effettuare una videochiamata, di consultare un sito istituzionale, di riconoscere un tentativo di truffa online, di scrivere e stampare un documento. Sono competenze modeste nella loro descrizione tecnica, ma enormi nel loro impatto sulla qualità della vita e sull'autonomia personale.

**Obiettivi sociali.** Un corso di informatica in un centro anziani non è mai solo un corso di informatica. È un'occasione di socialità, di contrasto all'isolamento, di rafforzamento dell'autostima in un momento della vita in cui il senso di inadeguatezza verso il "mondo nuovo" può essere fonte di sofferenza reale. Vedere un proprio coetaneo che riesce a fare una videochiamata con un nipote lontano è, per molte persone anziane, un incentivo più forte di qualunque manuale tecnico.

**Perché FeniceOS è particolarmente adatto a questo contesto:**

- *Nessuna pressione economica.* Il sistema può girare su hardware donato o dismesso, azzerando i costi di accesso per il centro anziani e per i partecipanti.
- *Interfaccia comprensibile.* Coerentemente con i principi della Tecnologia Gentile (Capitolo 1), l'ambiente grafico privilegia chiarezza su complessità.
- *Nessun rischio percepito di "rompere qualcosa".* Essendo un sistema live, avviabile da chiavetta USB, l'ambiente di apprendimento può essere resettato facilmente, riducendo l'ansia da errore che spesso frena l'apprendimento in età avanzata.
- *Ritmo rispettato.* I percorsi didattici della Parte III sono pensati per procedere a piccoli passi, con ripetizione e rinforzo positivo, coerentemente con le migliori pratiche di didattica per adulti anziani (si veda il Capitolo 12 per la metodologia).

**Un punto di attenzione per chi organizza i corsi.** L'obiettivo non è "portare tutti allo stesso livello", ma accompagnare ciascuno al proprio livello di autonomia desiderato. Alcuni parteciperanno solo per imparare a fare videochiamate; altri, con il tempo, chiederanno di andare oltre. Entrambi i percorsi sono ugualmente validi, e il Capitolo 11 di questo manuale, dedicato alle funzioni avanzate, è pensato proprio per chi, partito da zero, decide di approfondire.

> **Da ricordare.** In un centro anziani, il successo di un corso di informatica non si misura in competenze tecniche acquisite, ma in autonomia e fiducia ritrovate.

## Capitolo 8. FeniceOS per la scuola e i centri sociali: inclusione digitale

Se i centri anziani rappresentano il contesto più caratterizzante del progetto, le aule didattiche e i centri per il sociale ne costituiscono il naturale ambito di espansione, con esigenze in parte simili e in parte specifiche.

**Nelle aule scolastiche.** Molti istituti scolastici, specialmente quelli con risorse economiche limitate, si trovano a dover scegliere tra rinunciare a un laboratorio di informatica funzionante o investire cifre significative nel rinnovo periodico delle macchine. FeniceOS offre una terza via: recuperare hardware dismesso — da aziende, enti pubblici, donazioni private — e trasformarlo in una dotazione informatica completa, funzionante e sicura. Questo approccio ha anche un valore didattico aggiuntivo, spesso sottovalutato: introduce gli studenti, fin da giovani, al concetto stesso di economia circolare (Capitolo 2) e di software libero, non come nozione teorica ma come esperienza pratica quotidiana.

**Nei centri per il sociale.** I centri di aggregazione sociale, i doposcuola, i progetti rivolti a fasce di popolazione in condizioni di fragilità economica trovano in FeniceOS uno strumento coerente con la propria missione: l'inclusione digitale è, sempre più, parte integrante dell'inclusione sociale tout court, perché l'accesso a servizi pubblici, opportunità di lavoro, informazione e relazioni passa oggi in larghissima parte attraverso strumenti digitali.

**Un principio comune ai due contesti.** Sia a scuola sia nei centri sociali, FeniceOS non pretende di sostituirsi a percorsi didattici già esistenti, ma di rimuovere un vincolo — quello dei costi hardware — che troppo spesso limita, prima ancora che le scelte pedagogiche, le possibilità materiali di offrire un'educazione digitale di qualità.

> **Da ricordare.** L'inclusione digitale non comincia con l'ultimo modello di computer. Comincia con la possibilità, per chiunque, di avere accesso a uno strumento funzionante — indipendentemente dalla propria condizione economica.
