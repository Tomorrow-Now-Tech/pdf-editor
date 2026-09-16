import Image from 'next/image';
import Link from 'next/link';
import {
  AppWindowMac,
  ArrowRight,
  CheckCircle2,
  Download,
  FileLock2,
  FilePenLine,
  GitFork,
  Languages,
  RefreshCw,
  ScanText,
  ShieldCheck,
  Signature,
} from 'lucide-react';

import { CompanyDetails } from '@/components/company-details';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  MAC_APP_RELEASE_URL,
  MAC_APP_SOURCE_URL,
  MAC_APP_VERSION,
  MAC_DMG_DOWNLOAD_URL,
  MAC_DMG_FILENAME,
  MAC_DMG_SHA256,
} from '@/downloads/mac.mjs';
import type { Locale } from '@/i18n/routes.mjs';
import { localizedPath } from '@/i18n/routes.mjs';
import { WEB_SOURCE_URL } from '@/legal/source';
import { SITE_NAME, canonicalUrl, safeJsonLd } from '@/seo/site.mjs';

const CONTENT = {
  it: {
    navigation: 'Navigazione principale',
    breadcrumb: 'Percorso di navigazione',
    home: 'Editor PDF',
    current: 'App per Mac',
    eyebrow: `Tomorrow Now PDF Editor ${MAC_APP_VERSION}`,
    heading: 'Editor PDF per Mac con testo, OCR, firme e moduli',
    intro: 'Lavora sui PDF direttamente sul Mac, anche quando il documento richiede strumenti più avanzati del browser. L’app riconosce il testo e i font incorporati, esegue OCR locale e permette di aggiungere firme, immagini, annotazioni e campi modulo.',
    download: 'Scarica il DMG',
    downloadTitle: 'Scarica il DMG per Mac con chip Apple Silicon (M1 e successivi)',
    source: 'Codice sorgente della versione',
    release: 'Note della versione',
    compatibility: 'Compatibilità',
    silicon: 'Mac con chip Apple Silicon',
    siliconDetail: 'M1, M2, M3, M4 e successivi',
    language: 'Lingua dell’app',
    languageDetail: 'Interfaccia attualmente in italiano',
    trust: 'Distribuzione verificata',
    trustDetail: 'Firmata con Developer ID e notarizzata da Apple',
    sectionFeatures: 'Gli strumenti principali, tutti sul dispositivo',
    sectionFeaturesIntro: 'L’app è pensata per documenti che richiedono più controllo rispetto alle operazioni rapide disponibili nel browser.',
    features: [
      { title: 'Modifica testo e font', text: 'Seleziona il testo, modifica il contenuto e riutilizza il font incorporato quando è tecnicamente disponibile. L’app verifica i glifi richiesti e usa font locali compatibili quando serve.' },
      { title: 'OCR locale', text: 'Rende ricercabile il testo delle scansioni in italiano e inglese, senza inviare il documento a un servizio OCR online.' },
      { title: 'Firme e annotazioni', text: 'Aggiungi firme disegnate o digitate, timbri riutilizzabili, evidenziatore, penna libera, frecce e rettangoli.' },
      { title: 'Pagine e immagini', text: 'Riordina, inserisci, ruota, duplica, estrai o elimina pagine. Puoi anche aggiungere e spostare immagini.' },
      { title: 'Moduli PDF', text: 'Crea campi interattivi e compila i moduli già presenti nel documento.' },
      { title: 'Ricerca e modifiche ripetute', text: 'Cerca in tutto il PDF con ⌘F e modifica lo stesso valore in più punti scegliendo le occorrenze interessate.' },
    ],
    localTitle: 'Il documento resta sul tuo Mac',
    localText: 'L’app elabora i PDF localmente. Le copie di lavoro vengono conservate in una cartella privata della sessione e ripulite al cambio documento e all’uscita. I file salvati restano nelle posizioni scelte da te.',
    networkTitle: 'Cosa usa Internet',
    networkText: 'Il controllo degli aggiornamenti contatta GitHub all’avvio e quando lo richiedi. I PDF non vengono caricati. Anche i collegamenti al download, al sorgente e a Tomorrow Now aprono servizi esterni con proprie informative.',
    installTitle: 'Installazione in tre passaggi',
    installSteps: [
      { title: 'Scarica', text: 'Scarica direttamente il file DMG ufficiale della versione 1.6.0.' },
      { title: 'Installa', text: 'Apri il DMG e trascina Mac PDF Editor nella cartella Applicazioni.' },
      { title: 'Apri e aggiorna', text: 'Avvia l’app. Quando esce una nuova versione, vedrai “Aggiorna” oppure potrai usare Aiuto → Controlla aggiornamenti…' },
    ],
    limitsTitle: 'Requisiti e limiti dichiarati',
    limits: [
      'Questa build funziona soltanto su Mac Apple Silicon; non è disponibile una versione Intel.',
      'L’interfaccia dell’app è attualmente in italiano.',
      'Limite per documento: 100 MB e 1.000 pagine.',
      'OCR: massimo 12 megapixel per pagina e 12 pagine per operazione.',
      'Font, impaginazioni e campi complessi possono comportarsi diversamente tra PDF: controlla sempre il file salvato.',
    ],
    verifyTitle: 'Verifica il download',
    verifyText: 'Il pacchetto ufficiale è collegato direttamente alla release pubblica. Puoi confrontare questa impronta SHA-256 dopo il download:',
    faqTitle: 'Domande frequenti',
    faqs: [
      { question: 'Posso modificare davvero il testo esistente?', answer: 'Sì. L’app rileva testo, coordinate e font e riscrive il contenuto nel PDF. Il risultato dipende dalla struttura del documento e dalla disponibilità dei glifi del font: per questo va sempre controllata la copia salvata.' },
      { question: 'L’app carica i PDF online?', answer: 'No. Il documento viene elaborato localmente. Il controllo aggiornamenti usa Internet per interrogare GitHub, ma non invia il contenuto del PDF.' },
      { question: 'Come ricevo gli aggiornamenti?', answer: 'L’app controlla le nuove release GitHub in modo discreto. Se trova un aggiornamento, chiede conferma prima del download e lo installa al riavvio. Puoi controllare anche dal menu Aiuto.' },
      { question: 'È collegata ad Adobe o Apple?', answer: 'No. Tomorrow Now PDF Editor è un progetto indipendente e non è affiliato, sponsorizzato o approvato da Adobe Inc. o Apple Inc.' },
    ],
    webEditor: 'Usa l’editor nel browser',
    privacy: 'Privacy',
    terms: 'Termini',
    licences: 'Licenze',
    webSource: 'Sorgente web',
    companyNote: 'Versione Mac 1.6.0 · Dati societari e informazioni legali in aggiornamento.',
  },
  en: {
    navigation: 'Main navigation',
    breadcrumb: 'Breadcrumb',
    home: 'PDF editor',
    current: 'Mac app',
    eyebrow: `Tomorrow Now PDF Editor ${MAC_APP_VERSION}`,
    heading: 'PDF editor for Mac with text editing, OCR, signatures and forms',
    intro: 'Work on PDFs directly on your Mac when you need more than the browser tools can offer. The app recognises text and embedded fonts, runs OCR locally, and lets you add signatures, images, annotations and form fields.',
    download: 'Download the DMG',
    downloadTitle: 'Download the Mac installer for Apple Silicon (M1 or later)',
    source: 'Source code for this release',
    release: 'Release notes',
    compatibility: 'Compatibility',
    silicon: 'Mac with Apple Silicon',
    siliconDetail: 'M1, M2, M3, M4 or later',
    language: 'App language',
    languageDetail: 'The interface is currently in Italian',
    trust: 'Verified distribution',
    trustDetail: 'Developer ID signed and notarised by Apple',
    sectionFeatures: 'The main tools, all on your device',
    sectionFeaturesIntro: 'The Mac app is designed for documents that need more control than a quick browser task.',
    features: [
      { title: 'Edit text and fonts', text: 'Select text, change its contents and reuse an embedded font when technically available. The app checks the required glyphs and uses compatible local fonts when necessary.' },
      { title: 'Local OCR', text: 'Make scanned text searchable in Italian or English without sending the document to an online OCR service.' },
      { title: 'Signatures and annotations', text: 'Add drawn or typed signatures, reusable stamps, highlights, freehand marks, arrows and rectangles.' },
      { title: 'Pages and images', text: 'Reorder, insert, rotate, duplicate, extract or delete pages. You can also add and reposition images.' },
      { title: 'PDF forms', text: 'Create interactive fields and complete forms that are already present in a document.' },
      { title: 'Search and repeated changes', text: 'Search the full PDF with ⌘F and change the same value in selected places across the document.' },
    ],
    localTitle: 'Your document stays on your Mac',
    localText: 'The app processes PDFs locally. Working copies are kept in a private session folder and cleared when you change documents or close the app. Saved files remain in the locations you choose.',
    networkTitle: 'What uses the Internet',
    networkText: 'The update checker contacts GitHub when the app starts and when you request a check. Your PDF is not uploaded. Download, source-code and Tomorrow Now links also open external services with their own privacy notices.',
    installTitle: 'Install in three steps',
    installSteps: [
      { title: 'Download', text: 'Download the official DMG for version 1.6.0 directly.' },
      { title: 'Install', text: 'Open the DMG and drag Mac PDF Editor into the Applications folder.' },
      { title: 'Open and update', text: 'Launch the app. When a new version is available, you will see “Aggiorna”, or you can choose Aiuto → Controlla aggiornamenti… from the menu.' },
    ],
    limitsTitle: 'Published requirements and limits',
    limits: [
      'This build runs on Apple Silicon Macs only; there is no Intel version.',
      'The app interface is currently in Italian.',
      'Document limit: 100 MB and 1,000 pages.',
      'OCR limit: 12 megapixels per page and 12 pages per operation.',
      'Fonts, complex layouts and form fields can behave differently across PDFs. Always check the saved file.',
    ],
    verifyTitle: 'Verify your download',
    verifyText: 'The official installer links directly to the public release. You can compare this SHA-256 checksum after downloading it:',
    faqTitle: 'Frequently asked questions',
    faqs: [
      { question: 'Can I edit existing text?', answer: 'Yes. The app detects text, coordinates and fonts, then rewrites the content in the PDF. Results depend on the document structure and on whether the font contains the required glyphs, so always check the saved copy.' },
      { question: 'Does the app upload my PDFs?', answer: 'No. Your document is processed locally. The update checker uses the Internet to contact GitHub, but it does not send the contents of your PDF.' },
      { question: 'How do I receive updates?', answer: 'The app quietly checks GitHub releases. If an update is available, it asks before downloading and installs it when the app restarts. You can also check from the Help menu.' },
      { question: 'Is it affiliated with Adobe or Apple?', answer: 'No. Tomorrow Now PDF Editor is an independent project and is not affiliated with, sponsored by or endorsed by Adobe Inc. or Apple Inc.' },
    ],
    webEditor: 'Use the browser editor',
    privacy: 'Privacy',
    terms: 'Terms',
    licences: 'Licences',
    webSource: 'Web source code',
    companyNote: 'Mac version 1.6.0 · Company details and legal information are being updated.',
  },
} as const;

const FEATURE_ICONS = [FilePenLine, ScanText, Signature, AppWindowMac, FileLock2, RefreshCw];

export function MacAppPage({ locale = 'it' }: { locale?: Locale }) {
  const copy = CONTENT[locale];
  const path = (value: string) => localizedPath(value, locale);
  const currentPath = path('/editor-pdf-mac');
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE_NAME, item: canonicalUrl(path('/')) },
      { '@type': 'ListItem', position: 2, name: copy.current, item: canonicalUrl(currentPath) },
    ],
  };

  return <main className="min-h-screen bg-background text-foreground">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }} />
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080b14]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 py-3">
        <Link href={path('/')} className="flex items-center gap-3 text-sm font-bold text-white sm:text-base">
          <Image src="/app-icon.png" alt="" width={40} height={40} className="size-10 rounded-xl" />
          <span>Tomorrow Now <span className="brand-gradient-text">PDF Editor</span></span>
        </Link>
        <nav aria-label={copy.navigation} className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher path={currentPath} locale={locale} />
          <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={copy.downloadTitle} className="brand-button inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white">
            <Download className="size-4" /> {copy.download}
          </a>
        </nav>
      </div>
    </header>

    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <nav aria-label={copy.breadcrumb} className="mb-8 flex gap-2 text-sm text-slate-400">
        <Link href={path('/')} className="hover:text-cyan-200">{copy.home}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-slate-200">{copy.current}</span>
      </nav>

      <section className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0f1a] px-6 py-10 sm:px-10 lg:grid lg:grid-cols-[1.2fr_.8fr] lg:gap-12 lg:px-12 lg:py-14">
        <div className="aurora aurora-one" />
        <div className="relative">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-[56px] lg:leading-[1.04]">{copy.heading}</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{copy.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={copy.downloadTitle} className="brand-button inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white">
              <Download className="size-5" /> {copy.download}
            </a>
            <a href={MAC_APP_SOURCE_URL} className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/12 bg-white/[.035] px-5 text-sm font-semibold text-slate-200 hover:bg-white/[.07]">
              <GitFork className="size-4" /> {copy.source}
            </a>
          </div>
        </div>
        <div className="relative mt-10 grid content-center gap-3 lg:mt-0">
          <SummaryCard icon={<AppWindowMac />} label={copy.compatibility} value={copy.silicon} detail={copy.siliconDetail} />
          <SummaryCard icon={<Languages />} label={copy.language} value={copy.languageDetail} />
          <SummaryCard icon={<ShieldCheck />} label={copy.trust} value={copy.trustDetail} />
        </div>
      </section>

      <section className="py-16" aria-labelledby="funzioni-mac">
        <div className="max-w-3xl">
          <p className="eyebrow">Mac</p>
          <h2 id="funzioni-mac" className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">{copy.sectionFeatures}</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">{copy.sectionFeaturesIntro}</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {copy.features.map((feature, index) => {
            const Icon = FEATURE_ICONS[index];
            return <article key={feature.title} className="rounded-2xl border border-white/9 bg-white/[.025] p-6">
              <span className="grid size-11 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-200"><Icon className="size-5" /></span>
              <h3 className="mt-5 text-lg font-bold text-white">{feature.title}</h3>
              <p className="mt-3 text-base leading-7 text-slate-400">{feature.text}</p>
            </article>;
          })}
        </div>
      </section>

      <section className="grid gap-5 border-y border-white/8 py-12 lg:grid-cols-2">
        <article className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[.045] p-6 sm:p-8">
          <FileLock2 className="size-7 text-emerald-300" />
          <h2 className="mt-5 text-2xl font-bold text-white">{copy.localTitle}</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">{copy.localText}</p>
        </article>
        <article className="rounded-3xl border border-white/9 bg-white/[.025] p-6 sm:p-8">
          <RefreshCw className="size-7 text-cyan-300" />
          <h2 className="mt-5 text-2xl font-bold text-white">{copy.networkTitle}</h2>
          <p className="mt-3 text-base leading-7 text-slate-300">{copy.networkText}</p>
        </article>
      </section>

      <section className="py-16" aria-labelledby="installazione-mac">
        <h2 id="installazione-mac" className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{copy.installTitle}</h2>
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {copy.installSteps.map((step, index) => <li key={step.title} className="rounded-2xl border border-white/9 bg-[#0b0f1a] p-6">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-200">{index + 1}</span>
            <h3 className="mt-5 text-xl font-bold text-white">{step.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-400">{step.text}</p>
          </li>)}
        </ol>
      </section>

      <section className="grid gap-6 pb-16 lg:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-3xl border border-amber-300/20 bg-amber-300/[.05] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-amber-100">{copy.limitsTitle}</h2>
          <ul className="mt-5 space-y-4">
            {copy.limits.map((limit) => <li key={limit} className="flex gap-3 text-base leading-7 text-amber-50/80"><CheckCircle2 className="mt-1 size-5 shrink-0 text-amber-200" /> <span>{limit}</span></li>)}
          </ul>
        </article>
        <article className="rounded-3xl border border-white/9 bg-[#0b0f1a] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white">{copy.verifyTitle}</h2>
          <p className="mt-4 text-base leading-7 text-slate-400">{copy.verifyText}</p>
          <code className="mt-5 block break-all rounded-xl border border-white/8 bg-black/30 p-4 text-xs leading-6 text-cyan-200">{MAC_DMG_SHA256}</code>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <a href={MAC_APP_RELEASE_URL} className="text-cyan-200 hover:text-cyan-100">{copy.release}</a>
            <a href={MAC_APP_SOURCE_URL} className="text-cyan-200 hover:text-cyan-100">{copy.source}</a>
          </div>
        </article>
      </section>

      <section className="max-w-4xl border-t border-white/8 py-14" aria-labelledby="domande-mac">
        <h2 id="domande-mac" className="text-3xl font-bold tracking-tight text-white">{copy.faqTitle}</h2>
        <dl className="mt-8 space-y-8">
          {copy.faqs.map((faq) => <div key={faq.question}>
            <dt className="text-lg font-semibold text-white">{faq.question}</dt>
            <dd className="mt-2 text-base leading-7 text-slate-400">{faq.answer}</dd>
          </div>)}
        </dl>
      </section>

      <section className="tomorrow-now-banner flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-cyan-300/20 p-6 sm:p-8">
        <div>
          <p className="text-sm font-bold text-cyan-200">A Tomorrow Now product</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Tomorrow Now PDF Editor</h2>
          <p className="mt-2 text-base text-slate-300">{copy.intro}</p>
        </div>
        <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={copy.downloadTitle} className="inline-flex items-center gap-2 text-base font-bold text-white">{copy.download} <ArrowRight className="size-5" /></a>
      </section>

      <footer className="mt-10 border-t border-white/8 py-10 text-sm text-slate-400">
        <nav aria-label={copy.navigation} className="mb-6 flex flex-wrap gap-5">
          <Link href={path('/')}>{copy.webEditor}</Link>
          <Link href={path('/privacy')}>{copy.privacy}</Link>
          <Link href={path('/terms')}>{copy.terms}</Link>
          <Link href={path('/licenses')}>{copy.licences}</Link>
          <a href={WEB_SOURCE_URL}>{copy.webSource}</a>
        </nav>
        <CompanyDetails locale={locale} />
        <p className="mt-3 text-amber-100/70">{copy.companyNote}</p>
      </footer>
    </div>
  </main>;
}

function SummaryCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail?: string }) {
  return <div className="flex gap-4 rounded-2xl border border-white/9 bg-white/[.035] p-5">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-300/[.07] text-cyan-200 [&_svg]:size-5">{icon}</span>
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold leading-6 text-white">{value}</p>
      {detail && <p className="mt-1 text-sm text-slate-400">{detail}</p>}
    </div>
  </div>;
}
