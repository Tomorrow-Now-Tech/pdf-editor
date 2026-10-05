import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileArchive,
  MailCheck,
  ShieldCheck,
} from 'lucide-react';

import { CompanyDetails } from '@/components/company-details';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Locale } from '@/i18n/routes.mjs';
import { localizedPath } from '@/i18n/routes.mjs';
import { WEB_SOURCE_URL } from '@/legal/source';
import { SITE_NAME, canonicalUrl, safeJsonLd } from '@/seo/site.mjs';

const CONTENT = {
  it: {
    path: '/pdf-troppo-pesante-email',
    toolPath: '/comprimi-pdf#editor-pdf',
    home: 'Editor PDF',
    breadcrumb: 'Guida: PDF troppo pesante per email',
    eyebrow: 'Guida pratica | Test sintetico riproducibile',
    heading: 'PDF troppo pesante per email? Riducilo con metodo',
    intro:
      'Misura il file, prova prima l’ottimizzazione senza perdita e usa la compressione forte solo quando accetti pagine trasformate in immagini.',
    primaryCta: 'Apri lo strumento di compressione',
    updated: 'Pubblicata il 5 ottobre 2026',
    proofLabel: 'Prova sintetica con 4 pagine ricche di immagini',
    original: 'PDF iniziale',
    strong: 'Compressione forte',
    reduction: 'Riduzione misurata',
    proofNote:
      '22,5 MB sono diventati 0,9 MB, con una riduzione del 96%. È un test costruito apposta con immagini pesanti, non una promessa per ogni PDF.',
    sizeTitle: 'Prima di comprimere, controlla il limite reale',
    sizeText:
      'Il limite degli allegati cambia in base al servizio email e riguarda spesso l’intero messaggio, non solo il PDF. Inoltre la codifica dell’allegato può aumentare i dati trasmessi. Verifica il limite del tuo fornitore e considera un collegamento di condivisione protetto se il documento resta troppo grande.',
    testTitle: 'Il test che puoi ripetere',
    testIntro:
      'Abbiamo generato un PDF A4 di quattro pagine usando immagini PNG sintetiche, senza documenti di clienti né dati personali. Lo stesso motore usato dall’editor ha prodotto questi risultati:',
    measurements: [
      {
        label: 'Originale',
        value: '22,5 MB',
        detail: '4 pagine sintetiche con immagini pesanti',
      },
      {
        label: 'Senza perdita',
        value: '22,5 MB',
        detail: 'Nessuna riduzione utile: l’editor conserva l’originale',
      },
      {
        label: 'Compressione forte',
        value: '0,9 MB',
        detail: 'Pagine convertite in immagini JPEG, riduzione del 96%',
      },
    ],
    variability:
      'Il risultato varia in base a immagini, pagine e compressione già presente. Un PDF composto soprattutto da testo può ridursi molto meno.',
    stepsTitle: 'Un metodo affidabile in cinque passaggi',
    steps: [
      {
        title: 'Misura il file originale',
        text: 'Annota la dimensione prima di modificarlo e conserva una copia separata.',
      },
      {
        title: 'Prova senza perdita',
        text: 'Questa modalità mantiene testo selezionabile, link e moduli. Se non produce un file più piccolo, l’editor conserva la versione precedente.',
      },
      {
        title: 'Scarica e controlla',
        text: 'Apri la copia e verifica tutte le pagine, soprattutto immagini, firme, link e campi compilabili.',
      },
      {
        title: 'Usa la modalità forte solo se serve',
        text: 'Questa modalità rasterizza ogni pagina in JPEG. Il file può diventare molto più leggero, ma perde le funzioni interattive.',
      },
      {
        title: 'Verifica prima dell’invio',
        text: 'Controlla dimensione finale, leggibilità e completezza. Se il file resta troppo grande, usa un collegamento protetto invece di comprimere ancora.',
      },
    ],
    compareTitle: 'Quale modalità scegliere',
    losslessTitle: 'Ottimizzazione senza perdita',
    losslessPoints: [
      'Mantiene il testo nativo selezionabile.',
      'Conserva link, campi modulo e struttura del documento.',
      'Può non ridurre un PDF già ottimizzato.',
    ],
    strongTitle: 'Compressione forte',
    strongPoints: [
      'Trasforma ogni pagina in un’immagine JPEG.',
      'Rimuove testo selezionabile, link e campi compilabili.',
      'Può ridurre nitidezza e qualità di stampa.',
    ],
    checklistTitle: 'Controllo prima di allegare il PDF',
    checklist: [
      'Il file rientra nel limite del servizio email.',
      'Tutte le pagine sono presenti e leggibili.',
      'Link e moduli funzionano, se devono essere conservati.',
      'Il documento originale è archiviato separatamente.',
    ],
    limitsTitle: 'Limiti da conoscere',
    limits: [
      'Non è possibile garantire una dimensione finale precisa.',
      'La compressione forte non è adatta se devi copiare testo, compilare moduli o usare link.',
      'Comprimere o modificare un PDF firmato digitalmente può invalidare la firma esistente.',
      'La compressione non elimina in modo sicuro dati riservati e non sostituisce una redazione verificata.',
    ],
    faqTitle: 'Domande frequenti',
    faqs: [
      {
        question: 'Posso portare ogni PDF sotto 1 MB?',
        answer:
          'No. Il risultato dipende dal contenuto e dalla compressione già presente. L’editor mantiene la versione precedente quando quella nuova non è più piccola.',
      },
      {
        question: 'La qualità resta identica?',
        answer:
          'Con l’ottimizzazione senza perdita sì. La modalità forte usa immagini JPEG e può ridurre nitidezza e qualità di stampa.',
      },
      {
        question: 'Il PDF viene caricato su un server?',
        answer:
          'Il contenuto del documento viene elaborato nella memoria del browser. Il servizio di hosting può comunque ricevere i normali dati tecnici della visita, come indicato nell’informativa privacy.',
      },
      {
        question: 'Cosa faccio se il PDF resta troppo grande?',
        answer:
          'Evita ulteriori perdite di qualità. Valuta un collegamento di condivisione protetto e controlla chi può aprirlo e per quanto tempo.',
      },
    ],
    otherTools: 'Altri strumenti utili',
    dateGuide: 'Guida per aggiungere una data',
    privacy: 'Privacy',
    terms: 'Termini',
    licences: 'Licenze',
    source: 'Codice sorgente',
  },
  en: {
    path: '/en/pdf-too-large-for-email',
    toolPath: '/en/compress-pdf#editor-pdf',
    home: 'PDF editor',
    breadcrumb: 'Guide: PDF too large for email',
    eyebrow: 'Practical guide | Reproducible synthetic test',
    heading: 'PDF too large for email? Reduce it methodically',
    intro:
      'Measure the file, try lossless optimisation first and use high compression only when you can accept pages converted to images.',
    primaryCta: 'Open the compression tool',
    updated: 'Published 5 October 2026',
    proofLabel: 'Synthetic test with 4 image-heavy pages',
    original: 'Original PDF',
    strong: 'High compression',
    reduction: 'Measured reduction',
    proofNote:
      '22.5 MB became 0.9 MB, a measured reduction of 96%. This deliberately image-heavy fixture is not a promise for every PDF.',
    sizeTitle: 'Check the real limit before compressing',
    sizeText:
      'Attachment limits vary by email provider and often apply to the whole message, not just the PDF. Attachment encoding can also increase the transmitted size. Check your provider’s current limit and consider a protected sharing link if the document is still too large.',
    testTitle: 'The test you can reproduce',
    testIntro:
      'We generated a four-page A4 PDF from synthetic PNG images, without customer documents or personal information. The same engine used by the editor produced these results:',
    measurements: [
      {
        label: 'Original',
        value: '22.5 MB',
        detail: '4 synthetic pages with large images',
      },
      {
        label: 'Lossless',
        value: '22.5 MB',
        detail: 'No useful reduction, so the editor keeps the original',
      },
      {
        label: 'High compression',
        value: '0.9 MB',
        detail: 'Pages converted to JPEG images, 96% smaller',
      },
    ],
    variability:
      'Results vary with the images, page count and any existing compression. A mainly text-based PDF may shrink far less.',
    stepsTitle: 'A reliable five-step method',
    steps: [
      {
        title: 'Measure the original file',
        text: 'Note its size before making changes and keep a separate copy.',
      },
      {
        title: 'Try lossless optimisation',
        text: 'This keeps selectable text, links and forms. If it does not produce a smaller file, the editor keeps the previous version.',
      },
      {
        title: 'Download and inspect it',
        text: 'Open the copy and check every page, especially images, signatures, links and fillable fields.',
      },
      {
        title: 'Use high compression only when needed',
        text: 'This mode rasterises every page as a JPEG. The file may become much smaller, but interactive features are lost.',
      },
      {
        title: 'Check before sending',
        text: 'Confirm the final size, legibility and completeness. If it is still too large, use a protected link rather than compressing it again.',
      },
    ],
    compareTitle: 'Choose the right mode',
    losslessTitle: 'Lossless optimisation',
    losslessPoints: [
      'Keeps native text selectable.',
      'Preserves links, form fields and document structure.',
      'May not reduce a PDF that is already optimised.',
    ],
    strongTitle: 'High compression',
    strongPoints: [
      'Converts every page to a JPEG image.',
      'Removes selectable text, links and fillable fields.',
      'May reduce sharpness and print quality.',
    ],
    checklistTitle: 'Check before attaching the PDF',
    checklist: [
      'The file is below your email provider’s limit.',
      'Every page is present and readable.',
      'Links and forms work if they need to be retained.',
      'The original document is stored separately.',
    ],
    limitsTitle: 'Important limitations',
    limits: [
      'A specific final file size cannot be guaranteed.',
      'High compression is unsuitable when people need to copy text, fill in forms or use links.',
      'Compressing or editing a digitally signed PDF may invalidate its existing signature.',
      'Compression does not securely remove confidential information and is not a substitute for verified redaction.',
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        question: 'Can every PDF be reduced below 1 MB?',
        answer:
          'No. The result depends on the content and existing compression. The editor keeps the previous version when the new file is not smaller.',
      },
      {
        question: 'Will the quality remain identical?',
        answer:
          'Yes with lossless optimisation. High compression uses JPEG images and may reduce sharpness and print quality.',
      },
      {
        question: 'Is my PDF uploaded to a server?',
        answer:
          'The document content is processed in your browser memory. The hosting service may still receive ordinary technical visit data, as described in the privacy notice.',
      },
      {
        question: 'What if the PDF is still too large?',
        answer:
          'Avoid further quality loss. Consider a protected sharing link and check who can open it and for how long.',
      },
    ],
    otherTools: 'More useful tools',
    dateGuide: 'Guide to adding a date',
    privacy: 'Privacy',
    terms: 'Terms',
    licences: 'Licences',
    source: 'Source code',
  },
} as const;

export function EmailCompressionGuidePage({
  locale = 'it',
}: {
  locale?: Locale;
}) {
  const copy = CONTENT[locale];
  const localePath = (path: string) => localizedPath(path, locale);
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: canonicalUrl(localePath('/')),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: copy.breadcrumb,
        item: canonicalUrl(copy.path),
      },
    ],
  };
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: copy.heading,
    description: copy.intro,
    inLanguage: locale === 'en' ? 'en-GB' : 'it-IT',
    datePublished: '2026-10-05',
    dateModified: '2026-10-05',
    mainEntityOfPage: canonicalUrl(copy.path),
    author: {
      '@type': 'Organization',
      name: 'Tomorrow Now',
      url: 'https://www.tomorrownow.tech',
    },
    publisher: { '@type': 'Organization', name: 'Tomorrow Now' },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleData) }}
      />
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080b14]/92 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-16 max-w-[1200px] flex-wrap items-center justify-between gap-3 py-3">
          <Link
            href={localePath('/')}
            className="flex items-center gap-3 text-sm font-bold text-white sm:text-base"
          >
            <Image
              src="/app-icon.png"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-xl"
            />
            <span>
              Tomorrow Now{' '}
              <span className="brand-gradient-text">PDF Editor</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher path={copy.path} locale={locale} />
            <Link
              href={copy.toolPath}
              className="brand-button inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white"
            >
              <FileArchive className="size-4" />{' '}
              <span className="hidden sm:inline">{copy.primaryCta}</span>
              <span className="sm:hidden">PDF</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap gap-2 text-sm text-slate-400"
        >
          <Link href={localePath('/')} className="hover:text-cyan-200">
            {copy.home}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-200">
            {copy.breadcrumb}
          </span>
        </nav>

        <article>
          <header className="relative isolate overflow-hidden rounded-[32px] border border-white/10 bg-[#0b0f1a] px-6 py-10 sm:px-10 lg:grid lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:gap-12 lg:px-12 lg:py-14">
            <div className="aurora aurora-one" />
            <div className="relative">
              <p className="eyebrow">{copy.eyebrow}</p>
            <h1 className="mt-4 text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-[44px] lg:text-[42px] lg:leading-[1.04]">
                {copy.heading}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {copy.intro}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href={copy.toolPath}
                  className="brand-button inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white"
                >
                  <FileArchive className="size-5" /> {copy.primaryCta}
                </Link>
                <time dateTime="2026-10-05" className="text-xs text-slate-500">
                  {copy.updated}
                </time>
              </div>
            </div>
            <CompressionEvidence copy={copy} />
          </header>

          <section
            className="grid gap-8 py-14 lg:grid-cols-[.85fr_1.15fr] lg:items-start"
            aria-labelledby="limite-email"
          >
            <div>
              <p className="eyebrow">
                {locale === 'en' ? 'Before you start' : 'Prima di iniziare'}
              </p>
              <h2
                id="limite-email"
                className="mt-3 text-3xl font-bold text-white"
              >
                {copy.sizeTitle}
              </h2>
            </div>
            <p className="text-base leading-8 text-slate-300">
              {copy.sizeText}
            </p>
          </section>

          <section
            className="border-y border-white/10 py-14"
            aria-labelledby="test-compressione"
          >
            <div className="max-w-3xl">
              <p className="eyebrow">
                {locale === 'en' ? 'Measured evidence' : 'Prova misurata'}
              </p>
              <h2
                id="test-compressione"
                className="mt-3 text-3xl font-bold text-white"
              >
                {copy.testTitle}
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-300">
                {copy.testIntro}
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {copy.measurements.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[.025] p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-4 text-4xl font-black tracking-tight text-white">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 max-w-4xl text-sm leading-6 text-slate-400">
              {copy.variability}
            </p>
          </section>

          <section className="py-14" aria-labelledby="metodo-compressione">
            <h2
              id="metodo-compressione"
              className="text-3xl font-bold text-white"
            >
              {copy.stepsTitle}
            </h2>
            <ol className="mt-8 grid gap-4 lg:grid-cols-2">
              {copy.steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-white/10 bg-white/[.025] p-6"
                >
                  <span className="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-200">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-base leading-7 text-slate-300">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
            <Link
              href={copy.toolPath}
              className="brand-button mt-8 inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-bold text-white"
            >
              <MailCheck className="size-5" /> {copy.primaryCta}{' '}
              <ArrowRight className="size-4" />
            </Link>
          </section>

          <section
            className="border-y border-white/10 py-14"
            aria-labelledby="modalita-compressione"
          >
            <h2
              id="modalita-compressione"
              className="text-3xl font-bold text-white"
            >
              {copy.compareTitle}
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <ComparisonCard
                title={copy.losslessTitle}
                points={copy.losslessPoints}
                tone="cyan"
              />
              <ComparisonCard
                title={copy.strongTitle}
                points={copy.strongPoints}
                tone="amber"
              />
            </div>
          </section>

          <section className="grid gap-8 py-14 lg:grid-cols-2">
            <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[.05] p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-white">
                {copy.checklistTitle}
              </h2>
              <ul className="mt-6 space-y-4">
                {copy.checklist.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-7 text-slate-300"
                  >
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-amber-300/25 bg-amber-300/[.055] p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-amber-100">
                {copy.limitsTitle}
              </h2>
              <ul className="mt-6 space-y-4">
                {copy.limits.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-base leading-7 text-amber-50/80"
                  >
                    <ShieldCheck className="mt-1 size-5 shrink-0 text-amber-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            className="max-w-4xl py-14"
            aria-labelledby="faq-compressione"
          >
            <h2 id="faq-compressione" className="text-3xl font-bold text-white">
              {copy.faqTitle}
            </h2>
            <dl className="mt-8 space-y-7">
              {copy.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="text-lg font-semibold text-white">
                    {faq.question}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-slate-300">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        <nav
          aria-label={copy.otherTools}
          className="flex flex-wrap gap-3 border-t border-white/10 py-8"
        >
          <Link
            href={copy.toolPath}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-300/[.06] px-4 py-3 text-sm font-semibold text-cyan-100"
          >
            {copy.primaryCta}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={localePath('/aggiungere-data-pdf')}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200"
          >
            {copy.dateGuide}
            <ArrowRight className="size-4" />
          </Link>
        </nav>

        <footer className="border-t border-white/10 py-8 text-sm text-slate-400">
          <nav
            aria-label="Service information"
            className="mb-6 flex flex-wrap gap-5"
          >
            <Link href={localePath('/')}>{copy.home}</Link>
            <Link href={localePath('/privacy')}>{copy.privacy}</Link>
            <Link href={localePath('/terms')}>{copy.terms}</Link>
            <Link href={localePath('/licenses')}>{copy.licences}</Link>
            <a href={WEB_SOURCE_URL}>{copy.source}</a>
          </nav>
          <CompanyDetails locale={locale} />
        </footer>
      </div>
    </main>
  );
}

function CompressionEvidence({
  copy,
}: {
  copy: typeof CONTENT.it | typeof CONTENT.en;
}) {
  return (
    <div className="relative mt-10 rounded-[28px] border border-white/10 bg-[#111725]/90 p-5 shadow-[0_26px_80px_rgba(0,0,0,.35)] lg:mt-0">
      <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
        {copy.proofLabel}
      </p>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <EvidenceValue
          label={copy.original}
          value={copy.measurements[0].value}
        />
        <ArrowRight className="mb-2 size-5 text-cyan-300" />
        <EvidenceValue
          label={copy.strong}
          value={copy.measurements[2].value}
          accent
        />
      </div>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-300">
          {copy.reduction}: 96%
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {copy.proofNote}
        </p>
      </div>
    </div>
  );
}

function EvidenceValue({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-3xl font-black tracking-tight ${accent ? 'text-cyan-200' : 'text-white'}`}
      >
        {value}
      </p>
    </div>
  );
}

function ComparisonCard({
  title,
  points,
  tone,
}: {
  title: string;
  points: readonly string[];
  tone: 'cyan' | 'amber';
}) {
  const amber = tone === 'amber';
  return (
    <div
      className={`rounded-3xl border p-6 sm:p-8 ${amber ? 'border-amber-300/25 bg-amber-300/[.05]' : 'border-cyan-300/20 bg-cyan-300/[.04]'}`}
    >
      <h3
        className={`text-xl font-bold ${amber ? 'text-amber-100' : 'text-cyan-100'}`}
      >
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {points.map((point) => (
          <li
            key={point}
            className="flex gap-3 text-base leading-7 text-slate-300"
          >
            <CheckCircle2
              className={`mt-1 size-5 shrink-0 ${amber ? 'text-amber-300' : 'text-cyan-300'}`}
            />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
