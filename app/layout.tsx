import type { Metadata } from 'next';
import { GOOGLE_SITE_VERIFICATION } from '@/seo/site.mjs';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pdf.tomorrownow.tech'),
  verification: { google: GOOGLE_SITE_VERIFICATION },
  title: 'Editor PDF gratuito per Mac e online | Tomorrow Now PDF Editor',
  description:
    'Aggiungi testo, comprimi, dividi ed estrai PDF in Word. Modifica visiva senza rimuovere il testo originale. Gratis, senza account e senza upload dei documenti.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: '/',
    title: 'Tomorrow Now PDF Editor',
    description: 'Aggiungi testo, comprimi, dividi ed estrai PDF in Word. I tuoi documenti restano sul dispositivo.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Tomorrow Now PDF Editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tomorrow Now PDF Editor',
    description: 'Aggiungi testo, comprimi, dividi ed estrai PDF in Word. I tuoi documenti restano sul dispositivo.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
