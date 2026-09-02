# Tomorrow Now PDF Editor — web

Versione browser di Tomorrow Now PDF Editor. Tutte le operazioni sul contenuto
del PDF avvengono nel browser: l'app non contiene endpoint di upload, account,
database o funzioni server per ricevere documenti.

## Sviluppo

```sh
npm ci
npm test
npm run lint
npm run build
npm run dev
```

## Architettura privacy-first

- PDF.js visualizza il documento nella memoria del browser.
- pdf-lib applica le modifiche e genera il download localmente.
- Nessun analytics o tag pubblicitario è attivo nella configurazione iniziale.
- Il provider di hosting può comunque elaborare i normali log tecnici di
  accesso, come descritto nella bozza di informativa privacy.

La pubblicazione definitiva richiede la revisione professionale delle pagine
privacy, termini e licenze presenti in `app/`.

## Licenza

Il codice del sito è distribuito con licenza GNU AGPL v3. Consulta `LICENSE` e
`THIRD_PARTY_NOTICES.md`.
