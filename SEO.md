# SEO e Google Search Console

## Versione inglese (4 settembre 2026)

La homepage inglese è `/en`, con strumenti a `/en/compress-pdf`, `/en/split-pdf`,
`/en/pdf-to-word` e `/en/edit-pdf`, più privacy, termini e licenze tradotti.
Le pagine italiane conservano tutti gli URL precedenti. La sitemap ha sedici URL
canoniche; le varianti sono collegate con hreflang reciproci e selettore lingua.
La proprietà Search Console a prefisso URL già verificata comprende anche `/en`:
non occorre una nuova verifica. Pubblicazione e sitemap non garantiscono che le
nuove pagine siano già indicizzate. Vedi `INTERNATIONALIZATION.md` per manutenzione
dei testi, funzionalità condivise e test.

Il solo sito PDF usa l'origine canonica `https://pdf.tomorrownow.tech`.
Non modificare la proprietà, i DNS o la configurazione del sito aziendale.

## Pagine pubbliche

- `/`: editor generale e collegamenti ai quattro strumenti.
- `/comprimi-pdf`: ottimizzazione senza perdita e compressione rasterizzata.
- `/dividi-pdf`: estrazione di intervalli e pagine separate in ZIP.
- `/pdf-in-word`: estrazione del testo in DOCX, senza OCR né layout fedele.
- `/modifica-pdf`: aggiunta e modifica visiva del testo, non redazione sicura.
- `/privacy`, `/terms`, `/licenses`: informazioni sul servizio con canonical propri.

Ogni pagina strumento rende titolo, descrizione, istruzioni, limiti e FAQ
nell'HTML iniziale e apre l'editor con il pannello relativo già selezionato.
Le pagine si collegano alla homepage e agli altri strumenti con normali link.
Il solo markup strutturato aggiunto è BreadcrumbList, coerente con il percorso
visibile. Nessuna recensione, valutazione, statistica di utilizzo o promessa
di posizionamento inventata. L'immagine social già esistente è preservata.

## Verifica e invio a Google

La proprietà da usare in Search Console è il prefisso URL
`https://pdf.tomorrownow.tech/`, separato dal sito principale.
Il tag di verifica HTML fornito da Google è in `seo/site.mjs` e viene esposto
nel `<head>` da `components/site-layout.tsx`. È un identificatore pubblico di proprietà,
non un token API: non rimuoverlo dopo la verifica senza concordare una migrazione
del proprietario. Non sono necessari Google Analytics, Tag Manager o cookie.

Dopo il deploy verificato:

1. Completare la verifica con il metodo Tag HTML in Search Console.
2. Inviare `https://pdf.tomorrownow.tech/sitemap.xml` nel report Sitemap.
3. Usare Controllo URL sulla homepage e sulle quattro pagine degli strumenti.
4. Richiedere l'indicizzazione una volta per URL se disponibile; rispettare
   eventuali quote e non ripetere invii per accelerare la scansione.

`robots.txt` permette la scansione e indica la sitemap. La sitemap contiene
le sedici pagine canoniche HTTPS in italiano e inglese, senza parametri, alias `www`, date fittizie
o percorsi di download degli utenti (che non esistono sul server).
I redirect Cloudflare preservano percorso e query, secondo
`CLOUDFLARE_DEPLOYMENT.md`.

La verifica di proprietà e l'invio non garantiscono indicizzazione o ranking.
Search Console raccoglie dati di rendimento della ricerca; questa configurazione
non aggiunge script di tracciamento nell'editor o upload di documenti.

## Controlli di regressione

`npm test` verifica contenuti, link interni, canonical e selezione degli strumenti.
`npm run test:cloudflare` controlla anche l'HTML del Worker locale, sitemap,
robots, breadcrumb, assenza di noindex/cookie e tag Google nel primo head.
Lo stesso controllo SEO viene eseguito dopo ogni deploy pubblico. La build
richiede il commit pulito per preservare la provenienza del sorgente AGPL.

Fonti Google:
- <https://support.google.com/webmasters/answer/34592>
- <https://support.google.com/webmasters/answer/9008080#meta_tag_verification>
- <https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl>
- <https://developers.google.com/search/docs/fundamentals/creating-helpful-content>
