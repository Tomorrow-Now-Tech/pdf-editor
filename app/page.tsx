import {
  ArrowRight,
  Download,
  GitFork,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { PdfEditor } from '@/components/pdf-editor';

const RELEASE_URL = 'https://github.com/Trader855/PDF/releases/latest';
const SOURCE_URL = 'https://github.com/Trader855/PDF';

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
            <a href={RELEASE_URL} className="brand-button inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-white sm:px-4">
              <Download className="size-4" />
              <span className="hidden sm:inline">Scarica per Mac</span>
              <span className="sm:hidden">Mac</span>
            </a>
          </nav>
        </div>
      </header>

      <section id="top" className="relative isolate overflow-hidden px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />

        <div className="relative mx-auto max-w-[1480px]">
          <div className="mb-8 flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <span className="mb-5 inline-flex h-6 items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/8 px-2.5 text-xs font-semibold text-cyan-200">
                <ShieldCheck /> Nessun account · Nessun caricamento
              </span>
              <h1 className="max-w-4xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
                Modifica i tuoi PDF.
                <span className="brand-gradient-text block">Il documento resta tuo.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
                Aggiungi testo, riordina, ruota e scarica PDF direttamente nel browser. Il file viene elaborato sul tuo dispositivo e non viene inviato ai nostri server.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm lg:w-[370px]">
              <TrustMetric icon={<LockKeyhole />} label="Elaborazione" value="Locale" />
              <TrustMetric icon={<GitFork />} label="Codice" value="Pubblico" />
            </div>
          </div>

          <PdfEditor />
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
              <p className="mt-4 text-sm leading-7 text-slate-400">La versione browser copre le operazioni immediate senza upload. L’app Mac aggiunge modifica del testo esistente, riconoscimento font, OCR locale, firme, immagini, moduli e compressione.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={RELEASE_URL} className="brand-button inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white"><Download className="size-4" /> Scarica l’app Mac</a>
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
