import {
  ArrowRight,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  GitFork,
  LockKeyhole,
  PencilLine,
  Scissors,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PdfEditor } from '@/components/pdf-editor';
import { CompanyDetails } from '@/components/company-details';
import { WEB_SOURCE_URL } from '@/legal/source';
import { MAC_DMG_DOWNLOAD_URL, MAC_DMG_FILENAME, MAC_DMG_DESCRIPTION } from '@/downloads/mac.mjs';

const SOURCE_URL = WEB_SOURCE_URL;

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#080b14]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3" aria-label="Tomorrow Now PDF Editor">
            <Image src="/app-icon.png" alt="" width={40} height={40} className="size-10 rounded-xl shadow-[0_0_26px_rgba(0,229,255,.18)]" />
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight text-white sm:text-base">
                Tomorrow Now <span className="brand-gradient-text">PDF Editor</span>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                A Tomorrow Now product
              </div>
            </div>
          </a>

          <nav className="flex items-center gap-2" aria-label="Navigazione principale">
            <a href="#privacy" className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block">Privacy</a>
            <a href={SOURCE_URL} className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block">Open source</a>
            <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={MAC_DMG_DESCRIPTION} className="brand-button inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white sm:px-4">
              <Download className="size-4" />
              <span className="hidden sm:inline">Scarica per Mac</span>
              <span className="sm:hidden">Mac</span>
            </a>
          </nav>
        </div>
      </header>

      <section id="top" className="relative isolate overflow-hidden px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />

        <div className="relative mx-auto max-w-[1480px]">
          <div className="mb-7 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <span className="mb-4 inline-flex h-6 items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-2.5 text-xs font-semibold text-cyan-200">
                <ShieldCheck /> Nessun account · Nessun caricamento
              </span>
              <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-[58px] lg:leading-[1.03]">
                Lavora sui tuoi PDF.
                <span className="brand-gradient-text block">Gratis, privato, nel browser.</span>
              </h1>
              <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
                Aggiungi testo, comprimi, dividi e converti in Word. Puoi anche coprire e riscrivere le scritte: è una modifica visiva, non una cancellazione dell’originale. Il documento viene elaborato sul tuo dispositivo, senza upload.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm lg:w-[370px]">
              <TrustMetric icon={<LockKeyhole />} label="Elaborazione" value="Locale" />
              <TrustMetric icon={<GitFork />} label="Codice" value="Pubblico" />
            </div>
          </div>

          <PdfEditor />

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Capability icon={<PencilLine />} title="Modifica visiva" text="Copri e riscrivi con un font sostitutivo. L’originale resta recuperabile: non è redazione sicura." />
            <Capability icon={<FileArchive />} title="Comprimi PDF" text="Ottimizzazione senza perdita oppure riduzione forte del peso." />
            <Capability icon={<Scissors />} title="Dividi pagine" text="Estrai un intervallo o crea uno ZIP con le singole pagine." />
            <Capability icon={<FileText />} title="PDF in Word" text="Estrai il testo in un documento DOCX realmente modificabile." />
          </div>
        </div>
      </section>

      <section id="privacy" className="border-y border-white/8 bg-white/[.018] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Semplice per scelta</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Niente account. Niente abbonamento.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">La versione web non invia il contenuto dei PDF a Tomorrow Now. Il servizio di hosting può comunque trattare i normali dati tecnici di accesso, descritti nell’informativa privacy.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <FeatureCard icon={<LockKeyhole />} title="File locale" text="Il documento resta nella memoria del browser." />
            <FeatureCard icon={<ShieldCheck />} title="Trasparente" text="Codice e licenze consultabili pubblicamente." />
            <FeatureCard icon={<ArrowRight />} title="Subito utile" text="Apri il PDF e comincia senza registrarti." />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow">Web + Mac</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Parti online. Continua con gli strumenti avanzati su Mac.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400">La versione browser offre aggiunta e modifica visiva del testo, compressione, divisione, estrazione del testo in Word e gestione pagine senza upload. La modifica visiva non rimuove il testo originale: non usarla per oscurare dati riservati. L’app Mac aggiunge riconoscimento avanzato dei font incorporati, OCR locale, firme, immagini e moduli.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={MAC_DMG_DOWNLOAD_URL} download={MAC_DMG_FILENAME} title={MAC_DMG_DESCRIPTION} className="brand-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white"><Download className="size-4" /> Scarica l’app Mac</a>
                <a href={SOURCE_URL} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-5 text-sm font-semibold text-slate-200 hover:bg-white/[.07]"><GitFork className="size-4" /> Vedi il sorgente</a>
              </div>
            </div>
            <div className="rounded-[28px] border border-white/9 bg-[#0b0f1a] p-6 sm:p-8">
              <Sparkles className="size-7 text-cyan-300" />
              <h3 className="mt-5 text-xl font-bold text-white">Software libero, marchio riconoscibile</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">Il codice dell’app Mac è pubblicato con licenza GNU AGPL v3. Il nome e i loghi Tomorrow Now restano marchi distintivi e non autorizzano build modificate a presentarsi come ufficiali.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <a
          href="https://www.tomorrownow.tech"
          target="_blank"
          rel="noreferrer"
          className="tomorrow-now-banner group mx-auto grid max-w-[1480px] gap-6 overflow-hidden rounded-[30px] border border-cyan-300/20 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center"
        >
          <Image src="/app-icon.png" alt="Tomorrow Now" width={76} height={76} className="size-[76px] rounded-[22px] shadow-[0_0_40px_rgba(0,229,255,.2)]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[.2em] text-cyan-200">A Tomorrow Now product</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">Software che semplifica il lavoro di domani.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Scopri gli altri prodotti, automazioni e soluzioni digitali progettati da Tomorrow Now.</p>
          </div>
          <span className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition group-hover:border-cyan-200/40 group-hover:bg-white/15">
            Visita Tomorrow Now <ExternalLink className="size-4" />
          </span>
        </a>
      </section>

      <footer id="open-source" className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 border-t border-white/8 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tomorrow Now. Tomorrow Now PDF Editor è software open source.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Termini</Link>
            <Link href="/licenses" className="hover:text-white">Licenze</Link>
            <a href={SOURCE_URL} className="hover:text-white">Codice sorgente</a>
            <a href="https://www.tomorrownow.tech" className="hover:text-white">Tomorrow Now</a>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-[1480px] text-xs text-slate-400">
          <CompanyDetails />
          <p className="mt-3 text-amber-100/70">Versione beta · Dati societari e informazioni legali in aggiornamento.</p>
        </div>
      </footer>
    </main>
  );
}

function TrustMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/9 bg-white/[.035] p-4">
      <span className="mb-5 block size-5 text-cyan-300">{icon}</span>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b0f1a] p-5">
      <span className="mb-6 block size-5 text-cyan-300">{icon}</span>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function Capability({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/8 bg-white/[.025] p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[.07] text-cyan-200 [&_svg]:size-5">{icon}</span>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
