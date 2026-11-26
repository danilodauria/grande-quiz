# AGENTS.md — grande-quiz

Se sei un assistente IA che riprende il lavoro qui, **prima di tutto leggi** il file di consegna comune:
https://github.com/danilodauria/danilodauria.github.io/blob/main/HANDOFF.md

Regola fondamentale: **non riscrivere, rinominare o rifattorizzare ciò che funziona.** Prima un piano dettagliato, poi la conferma di Danilo, poi il codice.

## In questo repository

- **Cos'è**: Il Grande Quiz dell'Informatica: sito e libretti per centri anziani, scuole e biblioteche.
- **Leggi nell'ordine**: README.md → ultimi commit (`git log --oneline -30`) → il resto della cartella.
- **Verifica prima e dopo ogni modifica**: `python3 tests/test_sito.py` (deve chiudere con «prove superate» al completo).
- **Robot attivi**: nessun workflow GitHub Actions.
- **Da sapere**: la cartella `docs/` (sito pubblico) si ricostruisce dalle domande in `sorgenti/` con `python3 strumenti/costruisci.py`: modifica i sorgenti e ricostruisci, non il risultato a mano. **Le soluzioni non devono mai finire nei file pubblici**: `costruisci.py` ne tiene fuori i dati riservati, non aggirarlo. La versione è nel file `VERSIONE`.

Dopo il lavoro aggiungi una riga al registro: https://github.com/danilodauria/danilodauria.github.io/blob/main/HANDOFF-REGISTRO.md
