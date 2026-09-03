# Tomorrow Now PDF Editor — web

Sorgente pubblico: [Trader855/PDF, ramo web](https://github.com/Trader855/PDF/tree/web).
Per la verifica indipendente in sola lettura consulta [AUDIT.md](AUDIT.md).
Questo ramo non va unito a `main`: codice Mac, DMG e aggiornamenti rimangono separati.

Versione browser di Tomorrow Now PDF Editor. Tutte le operazioni sul contenuto
del PDF avvengono nel browser: l'app non contiene endpoint di upload, account,
database o funzioni server per ricevere documenti.

Funzioni disponibili: sostituzione visiva del testo esistente, aggiunta di
testo, gestione pagine, compressione, estrazione/divisione in ZIP e conversione
del testo in DOCX. La conversione Word privilegia il contenuto modificabile e
può richiedere correzioni nei documenti con impaginazioni complesse.

## Sviluppo

```sh
git clone --single-branch --branch web https://github.com/Trader855/PDF.git pdf-editor-web
cd pdf-editor-web
npm ci
npm test
npm run lint
npm run build
npm run dev
```

## Architettura privacy-first

- PDF.js visualizza il documento nella memoria del browser.
- pdf-lib applica le modifiche e genera il download localmente.
- docx e JSZip generano documenti Word e archivi di pagine nel browser.
- Nessun analytics o tag pubblicitario è attivo nella configurazione iniziale.
- Il provider di hosting può comunque elaborare i normali log tecnici di
  accesso, come descritto nella bozza di informativa privacy.

La pubblicazione definitiva richiede la revisione professionale delle pagine
privacy, termini e licenze presenti in `app/`.

## Licenza

Il codice del sito è distribuito con licenza GNU AGPL v3. Consulta `LICENSE` e
`THIRD_PARTY_NOTICES.md`.
