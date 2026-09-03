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

**La modifica visiva non è redazione sicura.** Copre le scritte in bianco e
aggiunge un font sostitutivo: l'originale resta ricercabile, copiabile ed
estraibile. L'editor mostra un avviso persistente e richiede una conferma.
Dopo una copertura effettuata nella sessione la conversione Word è bloccata
per evitare di esportare anche il testo coperto. Non è possibile riconoscere
con certezza coperture già presenti in un PDF importato: non usarlo per
nascondere dati riservati.

## Sviluppo

```sh
git clone --single-branch --branch web https://github.com/Trader855/PDF.git pdf-editor-web
cd pdf-editor-web
npm ci
npm test
npm run lint
npm run typecheck
npm run build
npm run dev
```

`predev`, `prebuild` e `pretest` copiano dal pacchetto PDF.js bloccato nel
lockfile il worker, WASM/fallback JS, CMaps, font standard, profili ICC e
relative licenze. Le cartelle generate `public/pdfjs/` non vanno committate:
sono riproducibili con `npm run sync:pdfjs` e incluse nel sito compilato.
La modifica della versione PDF.js richiede la revisione e riesecuzione dei
test del controllo immagini in `pdf/runtime.mjs`.

`npm test` comprende smoke test di PDF/ZIP/DOCX e regressioni con immagini
JPX/JBIG2 sintetiche, codec mancanti, immagini corrotte e pagine sovradimensionate.
I controlli di rendering usano PDF.js con canvas in Node, non sono una suite
end-to-end nei browser. Errori attesi dei decoder vengono stampati nei test
negativi. La compressione forte conserva il documento precedente quando
questi controlli falliscono; non promette fedeltà perfetta né redazione sicura.

## Architettura privacy-first

- PDF.js visualizza il documento nella memoria del browser.
- pdf-lib applica le modifiche e genera il download localmente.
- docx e JSZip generano documenti Word e archivi di pagine nel browser.
- Nessun analytics o tag pubblicitario è attivo nella configurazione iniziale.
- Il provider di hosting può comunque elaborare i normali log tecnici di
  accesso, come descritto nella bozza di informativa privacy.

La pubblicazione definitiva richiede la revisione professionale delle pagine
privacy, termini e licenze presenti in `app/`.

## Provenienza e avvisi legali

La build di produzione richiede un checkout Git pulito e include il suo commit
nei collegamenti al sorgente e nel file pubblico `source-version.json`.
Per compilare modifiche proprie, prima eseguire i test e creare un commit.
Prima della distribuzione, pubblicare quel commit nel repository indicato
(o adattare i collegamenti al proprio repository per una versione derivata).
Non usare il commit di una versione precedente per descrivere una build nuova.

`npm run legal:generate` raccoglie le licenze disponibili nei pacchetti
installati e produce un inventario verificabile anche degli avvisi mancanti.
Non sostituisce la revisione delle librerie native/incorporate. Le decisioni
aperte e le precisazioni alla revisione ricevuta sono in
[`LEGAL_REVIEW_FOLLOW_UP.md`](LEGAL_REVIEW_FOLLOW_UP.md).

## Licenza

Il codice del sito è distribuito con licenza GNU AGPL v3. Consulta `LICENSE` e
`THIRD_PARTY_NOTICES.md`.
