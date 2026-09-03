# Pubblicazione Cloudflare diretta

Repository: `Tomorrow-Now-Tech/pdf-editor`, ramo `main`.
Worker dedicato: `tomorrow-now-pdf-editor`.
Dominio: `pdf.tomorrownow.tech`.
Non cambiare `tomorrownow.tech`, `www`, MX/email o il repository Mac.

## Stato verificato il 3 settembre 2026

- Pubblicazione diretta attiva: <https://pdf.tomorrownow.tech>.
- Indirizzo di riserva: <https://tomorrow-now-pdf-editor.gabriele-lettera.workers.dev>.
- Sorgente della prima pubblicazione: `89d0578d3793ce9a8bb21b366d922269703daa7e`.
- Versione Worker: `2123eef5-6c10-4ebe-a99f-cf49afeb0fe9`.
- Test GitHub superati: <https://github.com/Tomorrow-Now-Tech/pdf-editor/actions/runs/33743590954>.
- Verificati via HTTP anonimo HTTPS, pagine, sorgente esatto, licenze, decoder,
  font e corrispondenza degli asset. Nessun documento reale caricato.
- Dominio personalizzato aggiunto dal dashboard dopo aver verificato che
  non esistessero record DNS `pdf`. Root, email e altri sottodomini non modificati.
- Il precedente sito Sites rimane disponibile e non è stato ripubblicato.
- **Deploy automatico Cloudflare non ancora collegato.** Il modulo propone la
  creazione di un token utente con permessi estesi anche a KV, R2, D1, Vectorize,
  Queues, Pipelines e Containers. Non è stato confermato né creato: occorre una
  decisione del titolare o un percorso con credenziali più limitate.

Il workflow GitHub verifica il codice, ma non pubblica da solo su Cloudflare.
Una nuova versione richiede ancora il deploy manuale descritto sotto, finché
il collegamento automatico non è stato autorizzato e collaudato.

## Compilazione riproducibile

Servono Node 22.23.2 (o una versione compatibile con il requisito del progetto)
e `npm ci`. Nessuna credenziale è necessaria per questi controlli:

```sh
npm ci
npm run ci:cloudflare
```

La build richiede un commit pulito e incorpora SHA, repository pubblico e
destinazione in `source-version.json`. Gli asset PDF.js e gli avvisi legali
vengono copiati dal lockfile. Nessun documento reale viene usato nei test.
Lo smoke avvia un Worker locale sulla sola porta 4178 e lo arresta al termine.
Non è un test end-to-end di Chrome/Safari né una revisione legale.

## Primo deploy nell'account del gestore

1. Autorizzare Wrangler nel browser e verificare con `npx wrangler whoami`
   l'account che possiede `tomorrownow.tech`. Non usare `--temporary`.
2. Se ci sono più account, scegliere esplicitamente il corretto tramite
   `CLOUDFLARE_ACCOUNT_ID`, senza inserire token nel codice.
3. Pubblicare il commit verificato su GitHub, poi eseguire:

```sh
npm run deploy:cloudflare
```

La configurazione del codice abilita `workers.dev`: non contiene routes né
domini personalizzati e non abilita log applicativi persistenti. Il dominio
`pdf.tomorrownow.tech` è gestito separatamente nel dashboard. Wrangler 4.128.0
non modifica i domini personalizzati quando la lista è assente/vuota; verificare
questo comportamento quando si aggiorna Wrangler e controllare il dominio dopo
ogni deploy. Non aggiungere wildcard, root o altri domini alla configurazione.
La verifica precedente al deploy rifiuta build Sites o di un altro commit.
Non attivare piani a pagamento senza l'approvazione del titolare.

## Aggiornamenti automatici GitHub → Cloudflare

Nel Worker, Settings → Builds → Connect repository:

- autorizzare l'app GitHub Cloudflare solo per `Tomorrow-Now-Tech/pdf-editor`;
- production branch: `main`, root directory: repository root;
- Node: `22.23.2` (variabile di build `NODE_VERSION` se necessaria);
- build command: `npm run ci:cloudflare`;
- deploy command: `npm run deploy:cloudflare`;
- non-production deploy command: `npm run check:cloudflare && npx wrangler versions upload --config dist/server/wrangler.json`.

Workers Builds esegue test e build prima del deploy: un errore deve interrompere
la pubblicazione. Il solo workflow GitHub verde non significa che il collegamento
Cloudflare sia già attivo. Verificare un deploy effettivo da un commit di prova.
Le credenziali di pubblicazione restano nella piattaforma, mai nel repository.
Prima di confermare il modulo, espandere e verificare i permessi del token:
quello generato automaticamente può essere più ampio del necessario. Non
autorizzare altri servizi o repository senza una decisione del titolare.

## Dominio e verifica

Controllare il nuovo URL `workers.dev` senza cookie o login: pagine principali,
risorse PDF.js (in particolare WASM e relativo MIME), licenze, versione del
sorgente, apertura/esportazione di un PDF sintetico e assenza di upload.
Poi nel Worker → Settings → Domains & Routes → Add → Custom Domain aggiungere
`pdf.tomorrownow.tech`. Non sovrascrivere record esistenti senza verificarli.

I precedenti record verso `custom-domains.chatgpt.site` e i TXT di verifica
Sites riguardano l'hosting precedente, non il nuovo Worker. L'eventuale rimozione
del collegamento Sites deve avvenire solo dopo aver confermato che è inutilizzato.
Controllare HTTPS e il commit esposto sul dominio dopo l'attivazione.

## Rollback e limiti

Conservare il sito Sites attuale fino al collaudo. Per un aggiornamento difettoso
usare il rollback delle versioni Cloudflare verso l'ultimo deploy verificato;
per problemi di collegamento ripristinare solo i record PDF precedentemente
annotati. Non eliminare Worker/versioni come procedura di rollback.

Asset statici: massimo 25 MiB per file; DMG rimangono su GitHub Releases.
L'attuale rendering HTML usa anche codice Worker e quindi quote/costi Workers,
non soltanto richieste statiche gratuite. R2, Stream e database non sono necessari
per il PDF Editor e non vengono creati da questa configurazione.

Fonti: [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/),
[custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[limiti](https://developers.cloudflare.com/workers/platform/limits/).
