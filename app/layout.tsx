import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pdf.tomorrownow.tech'),
  title: 'Editor PDF gratuito per Mac e online | Tomorrow Now PDF Editor',
  description:
    'Modifica PDF gratuitamente, senza registrazione e senza caricare i documenti sui nostri server. Editor PDF online e applicazione per Mac.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    url: '/',
    title: 'Tomorrow Now PDF Editor',
    description: 'Modifica PDF gratis. I tuoi file restano sul dispositivo.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Tomorrow Now PDF Editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tomorrow Now PDF Editor',
    description: 'Modifica PDF gratis. I tuoi file restano sul dispositivo.',
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
