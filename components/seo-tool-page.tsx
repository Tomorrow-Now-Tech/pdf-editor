import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Download, ShieldCheck } from 'lucide-react';
import { PdfEditor } from '@/components/pdf-editor';
import { CompanyDetails } from '@/components/company-details';
import { WEB_SOURCE_URL } from '@/legal/source';
import {
  MAC_DMG_DOWNLOAD_URL,
  MAC_DMG_FILENAME,
  MAC_DMG_DESCRIPTION,
} from '@/downloads/mac.mjs';
import { TOOL_PAGES, type ToolPage } from '@/seo/tools.mjs';
import { SITE_NAME, canonicalUrl, safeJsonLd } from '@/seo/site.mjs';

export function SeoToolPage({ tool }: { tool: ToolPage }) {
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: canonicalUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: tool.label,
        item: canonicalUrl(`/${tool.slug}`),
      },
    ],
  };
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbs) }}
      />
      <header className="border-b border-white/10 bg-[#080b14] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 py-3">
          <Link
            href="/"
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
          <a
            href={MAC_DMG_DOWNLOAD_URL}
            download={MAC_DMG_FILENAME}
            title={MAC_DMG_DESCRIPTION}
            className="brand-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          >
            <Download className="size-4" /> Scarica per Mac
          </a>
        </div>
      </header>
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Percorso di navigazione"
          className="mb-5 flex flex-wrap gap-2 text-sm text-slate-400"
        >
          <Link href="/" className="hover:text-cyan-200">
            Editor PDF
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-200">
            {tool.label}
          </span>
        </nav>
        <div className="mb-6 max-w-4xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-200">
            <ShieldCheck className="size-4" /> Gratis · Senza account · PDF
            elaborato sul dispositivo
          </p>
          <h1 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {tool.heading}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            {tool.intro}
          </p>
        </div>
        <PdfEditor initialTool={tool.mode} uploadHint={tool.uploadHint} />
        <section className="py-12" aria-labelledby="come-funziona">
          <h2 id="come-funziona" className="text-2xl font-bold text-white">
            Come usare {tool.label.toLowerCase()}
          </h2>
          <ol className="mt-6 grid gap-4 lg:grid-cols-3">
            {tool.steps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[.025] p-5"
              >
                <span className="mb-4 inline-flex size-8 items-center justify-center rounded-full bg-cyan-300/10 text-sm font-bold text-cyan-200">
                  {index + 1}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-base leading-7 text-slate-300">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>
        <section className="grid gap-8 border-y border-white/10 py-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {tool.detailTitle}
            </h2>
            {tool.detail.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-base leading-7 text-slate-300"
              >
                {paragraph}
              </p>
            ))}
          </div>
          <aside
            className="self-start rounded-2xl border border-amber-300/25 bg-amber-300/[.06] p-5"
            aria-label="Limiti da conoscere"
          >
            <h2 className="text-lg font-bold text-amber-100">
              Prima di condividere il risultato
            </h2>
            <p className="mt-3 text-base leading-7 text-amber-100/85">
              {tool.warning}
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Il PDF resta sul dispositivo. Il fornitore del sito può trattare i
              normali dati tecnici di accesso:{' '}
              <Link href="/privacy" className="underline underline-offset-4">
                leggi la privacy
              </Link>
              .
            </p>
          </aside>
        </section>
        <section
          className="max-w-4xl py-12"
          aria-labelledby="domande-frequenti"
        >
          <h2 id="domande-frequenti" className="text-2xl font-bold text-white">
            Domande frequenti
          </h2>
          <dl className="mt-6 space-y-6">
            {tool.faqs.map((faq) => (
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
        <nav
          aria-label="Altri strumenti PDF"
          className="flex flex-wrap gap-3 pb-10"
        >
          {TOOL_PAGES.filter((other) => other.slug !== tool.slug).map(
            (other) => (
              <Link
                key={other.slug}
                href={`/${other.slug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-300/50 hover:text-white"
              >
                {other.label}
                <ArrowRight className="size-4" />
              </Link>
            ),
          )}
        </nav>
        <a
          href="https://www.tomorrownow.tech"
          target="_blank"
          rel="noreferrer"
          className="tomorrow-now-banner flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-cyan-300/20 p-6 sm:p-8"
        >
          <div>
            <p className="text-sm font-bold text-cyan-200">
              A Tomorrow Now product
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Software che semplifica il lavoro di domani.
            </h2>
            <p className="mt-2 text-base text-slate-300">
              Scopri gli altri prodotti e le soluzioni digitali Tomorrow Now.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-base font-bold text-white">
            Visita Tomorrow Now <ArrowRight className="size-5" />
          </span>
        </a>
        <footer className="mt-10 border-t border-white/10 py-8 text-sm text-slate-400">
          <nav
            aria-label="Informazioni sul servizio"
            className="mb-6 flex flex-wrap gap-5"
          >
            <Link href="/">Editor PDF</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Termini</Link>
            <Link href="/licenses">Licenze</Link>
            <a href={WEB_SOURCE_URL}>Codice sorgente</a>
          </nav>
          <CompanyDetails />
          <p className="mt-3 text-amber-100/70">
            Versione beta · Dati societari e informazioni legali in
            aggiornamento.
          </p>
        </footer>
      </div>
    </main>
  );
}
