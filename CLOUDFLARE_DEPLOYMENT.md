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
- Il token esteso proposto da Workers Builds non è stato creato. Il percorso
  scelto per gli aggiornamenti è GitHub Actions, con credenziale limitata.
- Creato l'ambiente GitHub `production` del solo repository PDF, con whitelist
  del solo branch `main` e variabile non segreta `CLOUDFLARE_ACCOUNT_ID`.
- L'attivazione è completa soltanto quando il segreto è stato autorizzato e
  salvato e il primo job `deploy` termina con successo. Un job `verify` verde
  da solo non dimostra che la pubblicazione automatica sia operativa.

La versione effettivamente pubblicata è sempre quella esposta da
`https://pdf.tomorrownow.tech/source-version.json`, non necessariamente l'ultimo
commit del repository. Conservare il deploy manuale per emergenze e rollback.

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

## Aggiornamenti automatici GitHub Actions → Cloudflare

Il workflow `.github/workflows/web-ci.yml` separa due job:

1. `verify`: installa dal lockfile, esegue lint, typecheck, test, build e smoke
   locale; non riceve la credenziale Cloudflare. Conserva l'artefatto verificato
   per tre giorni per le esecuzioni sul ramo ufficiale.
2. `deploy`: dipende dal successo di `verify`, parte soltanto sul repository
   ufficiale e sul branch `main`, fuori dalle pull request. Usa l'ambiente
   `production`, scarica l'artefatto della stessa esecuzione e ne ricontrolla
   provenienza, versione e destinazione. Non pubblica revisioni superate da main.

La credenziale è esposta soltanto allo step `Publish verified assets`.
Il controllo HTTP successivo verifica sul dominio pubblico HTTPS, sorgente
esatto, pagine legali, MIME e contenuto di font e decoder PDF, senza upload di PDF.
Una verifica remota fallita segnala il problema ma non effettua un rollback
automatico: valutare la versione precedente prima di ripristinarla.

### Credenziale minima

- Creare, dopo conferma del titolare, un token Cloudflare con il solo permesso
  **Account → Script Workers → Modifica**, limitato all'account proprietario.
- Non utilizzare i template estesi Workers Builds e non concedere DNS, Routes,
  KV, R2, D1, Queues, Containers, AI o amministrazione utenti/token.
- Cloudflare applica questo permesso a livello di account, non al singolo Worker:
  non è una garanzia di isolamento dagli altri Worker che l'account ospiterà.
  Per isolamento forte tra prodotti serve anche separazione degli account.
- Salvare il valore esclusivamente come `CLOUDFLARE_API_TOKEN` tra gli
  **Environment secrets** di `production` in `Tomorrow-Now-Tech/pdf-editor`.
  Non usare un segreto di organizzazione, non inserirlo in file, log o chat.
- La proposta corrente ha scadenza 4 settembre 2027. Prima della scadenza,
  sostituire il segreto e verificarne il deploy, poi revocare il vecchio token.
- Non impostare filtri IP statici sui runner GitHub standard senza un egress
  stabile: i loro indirizzi cambiano e il deploy smetterebbe di funzionare.

Le azioni GitHub sono fissate a revisioni immutabili. Le pull request non
pubblicano; la whitelist di `production` consente soltanto il branch `main`.
Questo presuppone che l'accesso in scrittura a main e le dipendenze del lockfile
restino affidabili. Non attivare contemporaneamente Workers Builds: causerebbe
deploy duplicati con un'altra credenziale.

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
