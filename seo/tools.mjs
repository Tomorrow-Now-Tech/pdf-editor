/** @typedef {'compress' | 'split' | 'word' | 'edit'} EditorTool */
/** @typedef {{slug: string, label: string, mode: EditorTool, title: string,
 * description: string, heading: string, intro: string, uploadHint: string,
 * steps: {title: string, text: string}[], detailTitle: string, detail: string[],
 * warning: string, faqs: {question: string, answer: string}[]}} ToolPage */

/** @type {Record<string, ToolPage>} */
export const TOOLS = {
  'comprimi-pdf': {
    slug: 'comprimi-pdf',
    label: 'Comprimi PDF',
    mode: 'compress',
    title: 'Comprimi PDF online gratis, senza upload | Tomorrow Now',
    description:
      'Riduci il peso del PDF nel browser, senza account né upload. Scegli ottimizzazione senza perdita o compressione forte e controlla il risultato.',
    heading: 'Comprimi PDF online, senza inviare il file.',
    intro:
      'Riduci il peso di un allegato direttamente sul tuo dispositivo. Apri il PDF e scegli fra ottimizzazione senza perdita e compressione forte.',
    uploadHint:
      'Dopo l’apertura trovi già le opzioni di compressione. Il PDF non viene caricato su un server.',
    steps: [
      {
        title: 'Apri il PDF',
        text: 'Trascina il documento nel riquadro oppure selezionalo dal dispositivo. L’originale non viene sovrascritto.',
      },
      {
        title: 'Scegli la modalità',
        text: 'Prova prima “Ottimizza senza perdita”. Usa “Comprimi forte” solo se puoi rinunciare a testo selezionabile, link e moduli.',
      },
      {
        title: 'Controlla e scarica',
        text: 'Verifica le pagine nell’anteprima e premi “Scarica PDF”. Se la compressione non riduce il peso, l’editor mantiene la versione precedente.',
      },
    ],
    detailTitle: 'Quale compressione scegliere?',
    detail: [
      'L’ottimizzazione senza perdita riscrive la struttura del PDF mantenendo testo e immagini, senza ricampionare le pagine. È adatta come primo tentativo per documenti di lavoro, ma un PDF già ottimizzato può non diventare più piccolo.',
      'La compressione forte trasforma ogni pagina in un’immagine JPEG. Può essere utile per allegati molto pesanti destinati alla sola lettura, ma riduce la nitidezza e non conserva le funzioni interattive del documento.',
    ],
    warning:
      'La compressione forte elimina testo selezionabile, link, campi compilabili e altre funzioni interattive. Non è uno strumento di redazione sicura. Conserva l’originale e controlla ogni pagina prima di condividere il risultato.',
    faqs: [
      {
        question: 'Posso ridurre un PDF a 1 MB o 100 KB?',
        answer:
          'Non è possibile garantire una dimensione finale: dipende da immagini, pagine e compressione già presente. L’editor segnala la riduzione ottenuta e non sostituisce il documento con una versione più pesante.',
      },
      {
        question: 'La compressione è gratuita e senza registrazione?',
        answer:
          'Sì. Le due modalità sono disponibili nel browser senza account. La velocità e la dimensione gestibile dipendono dalla memoria e dalle prestazioni del dispositivo.',
      },
      {
        question: 'Il testo rimane copiabile?',
        answer:
          'Con l’ottimizzazione senza perdita il testo nativo resta testo. Con la compressione forte le pagine diventano immagini e il testo non è più selezionabile.',
      },
    ],
  },
  'dividi-pdf': {
    slug: 'dividi-pdf',
    label: 'Dividi PDF',
    mode: 'split',
    title: 'Dividi PDF ed estrai pagine online gratis | Tomorrow Now',
    description:
      'Estrai un intervallo di pagine o dividi un PDF in file singoli dentro uno ZIP. Gratis, senza registrazione e senza inviare documenti a un server.',
    heading: 'Dividi un PDF. Tieni solo le pagine che servono.',
    intro:
      'Crea un nuovo PDF con un intervallo di pagine oppure separa tutte le pagine in file singoli. Tutto viene elaborato nel browser, senza account.',
    uploadHint:
      'Apri il documento: il pannello “Dividi” è già selezionato per estrarre pagine o creare uno ZIP.',
    steps: [
      {
        title: 'Apri il documento',
        text: 'Seleziona il PDF e usa le miniature per individuare le pagine da estrarre.',
      },
      {
        title: 'Indica l’intervallo',
        text: 'Imposta “Da pagina” e “A pagina”. Per estrarre una sola pagina, inserisci lo stesso numero in entrambi i campi.',
      },
      {
        title: 'Scarica i file',
        text: 'Premi “Scarica intervallo” per un PDF unico oppure “Dividi tutte in ZIP” per un archivio con un PDF per pagina.',
      },
    ],
    detailTitle: 'Un intervallo oppure un file per pagina',
    detail: [
      'L’estrazione di un intervallo è utile quando devi inviare soltanto alcune pagine consecutive di un documento lungo. La numerazione dei controlli parte da 1 e corrisponde alle miniature, non agli eventuali numeri stampati nel PDF.',
      'La divisione completa crea un archivio ZIP. Ogni file porta il nome del documento e il numero della pagina, così puoi riconoscere i risultati dopo aver estratto l’archivio.',
    ],
    warning:
      'La divisione copia le pagine, non rimuove contenuti nascosti al loro interno e non è redazione sicura. Moduli, collegamenti fra pagine e firme digitali richiedono una verifica sul nuovo file.',
    faqs: [
      {
        question: 'Come estraggo una sola pagina?',
        answer:
          'Inserisci il suo numero sia in “Da pagina” sia in “A pagina”, poi scegli “Scarica intervallo”. Otterrai un PDF con quella sola pagina.',
      },
      {
        question: 'Posso scegliere pagine non consecutive?',
        answer:
          'Il controllo attuale estrae un intervallo consecutivo. Per separare tutte le pagine e scegliere poi quelle necessarie, usa “Dividi tutte in ZIP”.',
      },
      {
        question: 'Il documento originale viene modificato?',
        answer:
          'No. La divisione produce un nuovo download e non sovrascrive il file originale sul tuo dispositivo.',
      },
    ],
  },
  'pdf-in-word': {
    slug: 'pdf-in-word',
    label: 'PDF in Word',
    mode: 'word',
    title: 'PDF in Word gratis: estrai testo in DOCX | Tomorrow Now',
    description:
      'Estrai il testo selezionabile di un PDF in Word DOCX, direttamente nel browser. Senza upload né account. Non include OCR o ricostruzione fedele del layout.',
    heading: 'Da PDF a Word: recupera il testo da modificare.',
    intro:
      'Trasforma il testo selezionabile di un PDF in un file DOCX. È un’estrazione del testo, non una ricostruzione identica della grafica originale.',
    uploadHint:
      'Apri un PDF con testo selezionabile. Troverai il pulsante per scaricare il documento Word.',
    steps: [
      {
        title: 'Scegli un PDF con testo',
        text: 'Usa un documento digitale nel quale le scritte siano selezionabili. Una scansione richiede prima il riconoscimento OCR, non presente nella versione web.',
      },
      {
        title: 'Crea il documento Word',
        text: 'Nel pannello “PDF in Word” premi “Scarica Word”. Il testo viene raccolto pagina per pagina sul tuo dispositivo.',
      },
      {
        title: 'Rivedi il DOCX',
        text: 'Apri il file in Word o in un programma compatibile e sistema paragrafi e impaginazione. L’originale PDF rimane invariato.',
      },
    ],
    detailTitle: 'Cosa viene convertito, e cosa no',
    detail: [
      'Il convertitore estrae le righe di testo e crea paragrafi in un documento Word modificabile. Mantiene una separazione fra le pagine del PDF: è utile per recuperare una lettera, appunti o il contenuto di un documento da riscrivere.',
      'Non riproduce font originali, immagini, tabelle come tabelle Word, colonne o posizionamenti precisi. Nei documenti complessi l’ordine di lettura può richiedere correzioni. Per le scansioni occorre un passaggio OCR separato.',
    ],
    warning:
      'Il DOCX può includere testo nascosto presente nel PDF. Una scritta coperta graficamente non è stata cancellata. L’editor blocca la conversione dopo modifiche visive effettuate nella sessione, ma non può garantire che un PDF ricevuto da terzi sia privo di testo nascosto.',
    faqs: [
      {
        question: 'Conserva la stessa impaginazione del PDF?',
        answer:
          'No. Questa funzione crea un DOCX basato sul testo estratto. Immagini, tabelle, colonne, font e spaziature devono essere ricostruiti quando necessari.',
      },
      {
        question: 'Funziona con un PDF scannerizzato?',
        answer:
          'Non esegue OCR nel browser. Se le pagine sono solo immagini, non c’è testo da estrarre. L’app Mac offre strumenti OCR locali per il riconoscimento delle scansioni.',
      },
      {
        question: 'Devo installare Word per convertire?',
        answer:
          'No. Il browser crea il file DOCX. Per modificarlo dopo il download puoi usare Word o un altro programma compatibile.',
      },
    ],
  },
  'modifica-pdf': {
    slug: 'modifica-pdf',
    label: 'Modifica PDF',
    mode: 'edit',
    title:
      'Modifica PDF online gratis: aggiungi e riscrivi testo | Tomorrow Now',
    description:
      'Aggiungi testo o copri e riscrivi le scritte nel PDF, senza upload. Modifica visiva: il testo originale rimane recuperabile. Non è redazione sicura.',
    heading: 'Modifica il testo di un PDF, in modo visivo.',
    intro:
      'Aggiungi una nota o copri e riscrivi una scritta con un font sostitutivo. La modifica è visiva: il testo originale resta recuperabile, anche nel file scaricato.',
    uploadHint:
      'Apri il PDF per selezionare una scritta. Per inserire una nuova nota usa invece “Aggiungi testo”.',
    steps: [
      {
        title: 'Apri e scegli il testo',
        text: 'Il pannello “Modifica visiva” è già selezionato. Clicca una scritta del PDF digitale per preparare la sostituzione.',
      },
      {
        title: 'Scrivi e controlla lo stile',
        text: 'Inserisci il testo, scegli carattere, dimensione e colore, leggi l’avviso sulla modifica visiva e applica. Per una nuova nota scegli “Aggiungi testo” e clicca sulla pagina.',
      },
      {
        title: 'Scarica una nuova copia',
        text: 'Controlla l’anteprima e premi “Scarica PDF”. Conserva l’originale e verifica l’aspetto della nuova copia prima di usarla.',
      },
    ],
    detailTitle: 'Aggiungere testo non significa cancellare l’originale',
    detail: [
      'La versione browser sovrappone un riquadro e il nuovo testo alle scritte esistenti. Può essere utile per bozze, annotazioni e correzioni visive non riservate, ma non modifica il contenuto originale come un motore di editing nativo.',
      'Sono disponibili font sostitutivi Helvetica, Times e Courier, con dimensione e colore regolabili. Il browser non garantisce lo stesso carattere incorporato nel PDF. Per funzioni avanzate sui font, firme, immagini e OCR è disponibile l’app Mac.',
    ],
    warning:
      'Non usare “Modifica visiva” per oscurare dati personali o informazioni riservate: il testo originale rimane recuperabile con copia, ricerca o estrazione. Serve uno strumento di redazione sicura per rimuoverlo davvero.',
    faqs: [
      {
        question: 'Posso cancellare definitivamente una scritta?',
        answer:
          'No. La copertura visiva non rimuove il testo dal PDF. Questa funzione non deve essere usata per oscurare dati sensibili.',
      },
      {
        question: 'Posso usare lo stesso font del documento?',
        answer:
          'La versione web usa Helvetica, Times o Courier come sostituti. Puoi regolare dimensione e colore, ma il risultato non è garantito identico al font originale.',
      },
      {
        question: 'Posso scrivere su un PDF scannerizzato?',
        answer:
          'Puoi aggiungere nuovo testo sopra la pagina. Non puoi selezionare le scritte che fanno parte dell’immagine senza un riconoscimento OCR, disponibile nell’app Mac e non nel browser.',
      },
    ],
  },
};

export const TOOL_PAGES = Object.values(TOOLS);
