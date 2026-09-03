import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WEB_SOURCE_URL } from '@/legal/source';
import { CompanyDetails } from '@/components/company-details';

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#080b14] px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-3 text-sm font-semibold text-white">
          <Image src="/app-icon.png" alt="" width={40} height={40} className="size-10 rounded-xl" />
          Tomorrow Now <span className="brand-gradient-text">PDF Editor</span>
        </Link>
        <article className="legal-copy mt-10 rounded-[28px] border border-white/9 bg-[#0b0f1a] p-6 sm:p-10">
          <p className="eyebrow">Informazioni legali</p>
          <h1>{title}</h1>
          <p className="legal-lead">{intro}</p>
          <div className="my-7 rounded-xl border border-amber-300/20 bg-amber-300/[.06] p-4 text-sm leading-6 text-amber-100/80">
            Informazioni in aggiornamento: partita IVA e PEC sono indicate come “in fase di emissione”. I dati societari e i testi legali restano da completare e sottoporre a revisione professionale.
          </div>
          {children}
        </article>
        <div className="flex flex-wrap gap-5 py-8 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Termini</Link>
          <Link href="/licenses" className="hover:text-white">Licenze</Link>
          <a href={WEB_SOURCE_URL} className="hover:text-white">Sorgente di questa versione web</a>
        </div>
        <CompanyDetails className="border-t border-white/8 py-6 text-xs text-slate-400" />
      </div>
    </main>
  );
}
