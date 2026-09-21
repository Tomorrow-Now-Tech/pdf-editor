import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Download,
  MousePointer2,
  ShieldCheck,
  Type,
} from 'lucide-react';

import { CompanyDetails } from '@/components/company-details';
import { LanguageSwitcher } from '@/components/language-switcher';
import { MAC_DMG_DOWNLOAD_URL, MAC_DMG_FILENAME } from '@/downloads/mac.mjs';
import type { Locale } from '@/i18n/routes.mjs';
import { localizedPath } from '@/i18n/routes.mjs';
import { WEB_SOURCE_URL } from '@/legal/source';
import { SITE_NAME, canonicalUrl, safeJsonLd } from '@/seo/site.mjs';

const CONTENT = {
  it: {
    path: '/aggiungere-data-pdf',
    toolPath: '/modifica-pdf#editor-pdf',
    home: 'Editor PDF',
    breadcrumb: 'Guida: aggiungere una data',
    eyebrow: 'Guida pratica · Esempio senza dati reali',
    heading: 'Come aggiungere una data a un PDF online',
    intro: 'Inserisci una data nuova sopra un modulo, una ricevuta o un documento già pronto. Il PDF viene elaborato nel browser e la copia modificata si scarica sul tuo dispositivo.',
    primaryCta: 'Apri l’editor e aggiungi la data',
    updated: 'Pubblicata il 21 settembre 2026',
    exampleTitle: 'Esempio sintetico riproducibile',
    exampleIntro: 'Immagina un modulo fittizio con la riga “Data di consegna” ancora vuota. Useremo una data di esempio, senza documenti o dati di clienti.',
    before: 'Prima',
    after: 'Dopo',
    field: 'Data di consegna',
    sampleDate: '21/09/2026',
    datePlaceholder: 'GG / MM / AAAA',
    stepsTitle: 'Aggiungere la data in cinque passaggi',
    steps: [
      { title: 'Prepara il formato', text: 'Decidi come deve apparire la data, per esempio 21/09/2026. L’editor inserisce esattamente ciò che scrivi e non corregge automaticamente giorno, mese o anno.' },
      { title: 'Apri il PDF', text: 'Apri lo strumento “Modifica PDF”, trascina il documento nel riquadro oppure selezionalo dal dispositivo. Il file originale non viene sovrascritto.' },
      { title: 'Scegli “Aggiungi testo”', text: 'Nella barra dell’editor premi “Aggiungi testo”, quindi clicca nel punto della pagina in cui deve comparire la data.' },
      { title: 'Scrivi e posiziona', text: 'Digita la data direttamente sul PDF. Regola carattere, dimensione e colore; usa la freccia “Seleziona” per riprendere il testo e trascinarlo nella posizione esatta.' },
      { title: 'Scarica e controlla', text: 'Premi “Scarica PDF”, apri la nuova copia e verifica pagina, data, allineamento e leggibilità prima di inviarla o archiviarla.' },
    ],
    checklistTitle: 'Controllo finale consigliato',
    checklist: [
      'La data è completa e nel formato richiesto.',
      'Il testo non copre righe, firme o altre informazioni.',
      'La copia scaricata si apre e mostra la data nella pagina corretta.',
      'L’originale è stato conservato separatamente.',
    ],
    limitsTitle: 'Cosa fa davvero questa funzione',
    limits: [
      'Aggiunge nuovo testo al PDF scaricato. Non trasforma lo spazio in un campo data compilabile.',
      'Nel browser sono disponibili Helvetica, Times e Courier: il font può non coincidere con quello originale.',
      'Puoi scrivere anche sopra una scansione, ma la funzione non riconosce né modifica il testo presente nell’immagine.',
      'Per cambiare una data esistente, la versione web usa una copertura visiva: il testo originale può restare recuperabile e non è redazione sicura.',
      'La modifica di un PDF già firmato digitalmente può rendere non valida la firma esistente: verifica sempre il documento finale.',
    ],
    macTitle: 'Serve più precisione sul font?',
    macText: 'L’app Mac aggiunge riconoscimento dei font incorporati, OCR locale e strumenti più avanzati. Per una semplice data nuova puoi usare direttamente l’editor online.',
    macCta: 'Scarica l’app Mac',
    faqTitle: 'Domande frequenti',
    faqs: [
      { question: 'Posso aggiungere una data a un PDF scannerizzato?', answer: 'Sì. La data viene aggiunta sopra l’immagine della pagina. Le scritte della scansione non diventano però selezionabili senza OCR.' },
      { question: 'Posso spostare la data dopo averla scritta?', answer: 'Sì. Premi la freccia “Seleziona”, clicca la data aggiunta e trascinala. Puoi anche correggere testo, dimensione e colore dal pannello delle proprietà prima del download.' },
      { question: 'Il PDF viene caricato online?', answer: 'Il contenuto del documento viene elaborato nella memoria del browser. Il servizio di hosting può comunque ricevere i normali dati tecnici della visita, come spiegato nell’informativa privacy.' },
      { question: 'La data diventa un campo compilabile?', answer: 'No. Questa procedura inserisce testo statico nella nuova copia. La creazione di campi modulo interattivi è disponibile nell’app Mac.' },
    ],
    otherTools: 'Altri strumenti utili',
    editTool: 'Modifica PDF online',
    macPage: 'Editor PDF per Mac',
    privacy: 'Privacy',
    terms: 'Termini',
    licences: 'Licenze',
    source: 'Codice sorgente',
  },
  en: {
    path: '/en/add-date-to-pdf',
    toolPath: '/en/edit-pdf#editor-pdf',
    home: 'PDF editor',
    breadcrumb: 'Guide: add a date',
    eyebrow: 'Practical guide · Example with no real personal data',
    heading: 'How to add a date to a PDF online',
    intro: 'Add a new date to a form, receipt or finished document. Your PDF is processed in the browser, and the edited copy is downloaded to your device.',
    primaryCta: 'Open the editor and add a date',
    updated: 'Published 21 September 2026',
    exampleTitle: 'A reproducible fictional example',
    exampleIntro: 'Imagine a sample form where the “Delivery date” line is still empty. We will use a fictional date without uploading a customer document or personal information.',
    before: 'Before',
    after: 'After',
    field: 'Delivery date',
    sampleDate: '21/09/2026',
    datePlaceholder: 'DD / MM / YYYY',
    stepsTitle: 'Add the date in five steps',
    steps: [
      { title: 'Choose the format', text: 'Decide how the date should appear, for example 21/09/2026. The editor inserts exactly what you type and does not automatically validate the day, month or year.' },
      { title: 'Open the PDF', text: 'Open the Edit PDF tool, drag your document into the upload area or choose it from your device. Your original file is not overwritten.' },
      { title: 'Choose “Add text”', text: 'Select “Add text” in the editor toolbar, then click the exact point on the page where the date should appear.' },
      { title: 'Type and position it', text: 'Type the date directly on the PDF. Adjust the font, size and colour; use the Select arrow to pick the text up again and drag it into position.' },
      { title: 'Download and check', text: 'Choose “Download PDF”, open the new copy and check the page, date, alignment and readability before sharing or filing it.' },
    ],
    checklistTitle: 'Recommended final check',
    checklist: [
      'The date is complete and uses the required format.',
      'The text does not cover lines, signatures or other information.',
      'The downloaded copy opens and shows the date on the correct page.',
      'The original has been kept separately.',
    ],
    limitsTitle: 'What this feature actually does',
    limits: [
      'It adds new text to the downloaded PDF. It does not turn the space into an interactive date field.',
      'The browser offers Helvetica, Times and Courier, so the font may not match the original document.',
      'You can write on a scanned page, but this feature does not recognise or edit text inside the image.',
      'Changing an existing date uses a visual text overlay: the original text may remain recoverable, so this is not secure redaction.',
      'Editing a digitally signed PDF may invalidate its existing signature. Always check the final document.',
    ],
    macTitle: 'Need a closer font match?',
    macText: 'The Mac app adds embedded-font recognition, local OCR and more advanced tools. For a simple new date, the browser editor is usually enough.',
    macCta: 'Download the Mac app',
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'Can I add a date to a scanned PDF?', answer: 'Yes. The date is placed over the page image. The text in the scan does not become selectable unless it is processed with OCR.' },
      { question: 'Can I move the date after typing it?', answer: 'Yes. Choose the Select arrow, click the date you added and drag it. You can also change its text, size and colour in the properties panel before downloading.' },
      { question: 'Is my PDF uploaded?', answer: 'The document content is processed in your browser memory. The hosting service may still receive ordinary technical visit data, as described in the privacy notice.' },
      { question: 'Does the date become a fillable field?', answer: 'No. This procedure adds static text to the new copy. The Mac app can create interactive form fields.' },
    ],
    otherTools: 'More useful tools',
    editTool: 'Edit PDF online',
    macPage: 'PDF editor for Mac',
    privacy: 'Privacy',
    terms: 'Terms',
    licences: 'Licences',
    source: 'Source code',
  },
} as const;

export function DateGuidePage({ locale = 'it' }: { locale?: Locale }) {
  const copy = CONTENT[locale];
  const localePath = (path: string) => localizedPath(path, locale);
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: canonicalUrl(localePath('/')) },
      { '@type': 'ListItem', position: 2, name: copy.breadcrumb, item: canonicalUrl(copy.path) },
    ],
  };
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: copy.heading,
    description: copy.intro,
    inLanguage: locale === 'en' ? 'en-GB' : 'it-IT',
    datePublished: '2026-09-21',
    dateModified: '2026-09-21',
    mainEntityOfPage: canonicalUrl(copy.path),
    author: { '@type': 'Organization', name: 'Tomorrow Now', url: 'https://www.tomorrownow.tech' },
    publisher: { '@type': 'Organization', name: 'Tomorrow Now' },
  };

  return <main className="min-h-screen bg-background text-foreground">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbData) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(articleData) }} />
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080b14]/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 py-3">
        <Link href={localePath('/')} className="flex items-center gap-3 text-sm font-bold text-white sm:text-base">
          <Image src="/app-icon.png" alt="" width={40} height={40} className="size-10 rounded-xl" />
          <span>Tomorrow Now <span className="brand-gradient-text">PDF Editor</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher path={copy.path} locale={locale} />
          <Link href={copy.toolPath} className="brand-button inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">
            <Type className="size-4" /> <span className="hidden sm:inline">{copy.primaryCta}</span><span className="sm:hidden">Editor</span>
          </Link>
        </div>
      </div>
    </header>

    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap gap-2 text-sm text-slate-400">
        <Link href={localePath('/')} className="hover:text-cyan-200">{copy.home}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-slate-200">{copy.breadcrumb}</span>
      </nav>

      <article>
        <header className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0f1a] px-6 py-10 sm:px-10 lg:grid lg:grid-cols-[1.12fr_.88fr] lg:items-center lg:gap-12 lg:px-12 lg:py-14">
          <div className="aurora aurora-one" />
          <div className="relative">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-[56px] lg:leading-[1.04]">{copy.heading}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{copy.intro}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={copy.toolPath} className="brand-button inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white">
                <CalendarDays className="size-5" /> {copy.primaryCta}
              </Link>
              <time dateTime="2026-09-21" className="text-xs text-slate-500">{copy.updated}</time>
            </div>
          </div>
          <SyntheticDateExample copy={copy} />
        </header>

        <section className="py-14" aria-labelledby="esempio-data">
          <div className="max-w-3xl">
            <p className="eyebrow">{locale === 'en' ? 'Worked example' : 'Esempio guidato'}</p>
            <h2 id="esempio-data" className="mt-3 text-3xl font-bold text-white">{copy.exampleTitle}</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">{copy.exampleIntro}</p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ExampleState label={copy.before} field={copy.field} placeholder={copy.datePlaceholder} />
            <ExampleState label={copy.after} field={copy.field} placeholder={copy.datePlaceholder} value={copy.sampleDate} />
          </div>
        </section>

        <section className="border-y border-white/10 py-14" aria-labelledby="passaggi-data">
          <h2 id="passaggi-data" className="text-3xl font-bold text-white">{copy.stepsTitle}</h2>
          <ol className="mt-8 grid gap-4 lg:grid-cols-2">
            {copy.steps.map((step, index) => <li key={step.title} className="rounded-2xl border border-white/10 bg-white/[.025] p-6">
              <span className="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-200">{index + 1}</span>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="mt-2 text-base leading-7 text-slate-300">{step.text}</p>
            </li>)}
          </ol>
          <Link href={copy.toolPath} className="brand-button mt-8 inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white">
            <MousePointer2 className="size-5" /> {copy.primaryCta} <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="grid gap-8 py-14 lg:grid-cols-[.9fr_1.1fr]">
          <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[.05] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white">{copy.checklistTitle}</h2>
            <ul className="mt-6 space-y-4">
              {copy.checklist.map((item) => <li key={item} className="flex gap-3 text-base leading-7 text-slate-300"><CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-300" />{item}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-amber-300/25 bg-amber-300/[.055] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-amber-100">{copy.limitsTitle}</h2>
            <ul className="mt-6 space-y-4">
              {copy.limits.map((item) => <li key={item} className="flex gap-3 text-base leading-7 text-amber-50/80"><ShieldCheck className="mt-1 size-5 shrink-0 text-amber-300" />{item}</li>)}
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-300/[.08] via-blue-500/[.05] to-fuchsia-400/[.07] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white">{copy.macTitle}</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">{copy.macText}</p>
          </div>
          <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} className="mt-6 inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white hover:bg-white/15 lg:mt-0">
            <Download className="size-4" /> {copy.macCta}
          </a>
        </section>

        <section className="max-w-4xl py-14" aria-labelledby="faq-data">
          <h2 id="faq-data" className="text-3xl font-bold text-white">{copy.faqTitle}</h2>
          <dl className="mt-8 space-y-7">
            {copy.faqs.map((faq) => <div key={faq.question}>
              <dt className="text-lg font-semibold text-white">{faq.question}</dt>
              <dd className="mt-2 text-base leading-7 text-slate-300">{faq.answer}</dd>
            </div>)}
          </dl>
        </section>
      </article>

      <nav aria-label={copy.otherTools} className="flex flex-wrap gap-3 border-t border-white/10 py-8">
        <Link href={copy.toolPath} className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/[.06] px-4 py-3 text-sm font-semibold text-cyan-100">{copy.editTool}<ArrowRight className="size-4" /></Link>
        <Link href={localePath('/editor-pdf-mac')} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200">{copy.macPage}<ArrowRight className="size-4" /></Link>
      </nav>

      <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
        <nav aria-label="Service information" className="mb-6 flex flex-wrap gap-5">
          <Link href={localePath('/')}>{copy.home}</Link>
          <Link href={localePath('/privacy')}>{copy.privacy}</Link>
          <Link href={localePath('/terms')}>{copy.terms}</Link>
          <Link href={localePath('/licenses')}>{copy.licences}</Link>
          <a href={WEB_SOURCE_URL}>{copy.source}</a>
        </nav>
        <CompanyDetails locale={locale} />
      </footer>
    </div>
  </main>;
}

function SyntheticDateExample({ copy }: { copy: typeof CONTENT.it | typeof CONTENT.en }) {
  return <div className="relative mt-10 rounded-[28px] border border-white/10 bg-[#111725]/90 p-5 shadow-[0_26px_80px_rgba(0,0,0,.35)] lg:mt-0">
    <div className="mb-5 flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">{copy.exampleTitle}</span>
      <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[.07] px-2.5 py-1 text-[10px] font-bold text-emerald-200">{copy.after}</span>
    </div>
    <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-inner">
      <div className="h-2 w-28 rounded-full bg-slate-200" />
      <div className="mt-3 h-2 w-44 rounded-full bg-slate-100" />
      <div className="mt-8 flex items-end gap-3 border-b border-slate-400 pb-1 text-sm">
        <span className="font-semibold">{copy.field}</span>
        <span className="ml-auto font-mono font-bold text-blue-700">{copy.sampleDate}</span>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="h-2 rounded-full bg-slate-100" />
        <div className="h-2 rounded-full bg-slate-100" />
      </div>
    </div>
  </div>;
}

function ExampleState({ label, field, placeholder, value }: { label: string; field: string; placeholder: string; value?: string }) {
  return <div className="rounded-2xl border border-white/10 bg-[#0b0f1a] p-5">
    <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">{label}</p>
    <div className="mt-4 rounded-xl bg-white px-5 py-6 text-slate-900">
      <div className="flex min-h-8 items-end gap-3 border-b border-slate-500 pb-1 text-sm">
        <span className="font-semibold">{field}</span>
        <span className={`ml-auto font-mono font-bold ${value ? 'text-blue-700' : 'text-slate-300'}`}>{value || placeholder}</span>
      </div>
    </div>
  </div>;
}
