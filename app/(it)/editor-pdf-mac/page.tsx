import { MacAppPage } from '@/components/mac-app-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/editor-pdf-mac',
  'Editor PDF per Mac con OCR e modifica testo | Tomorrow Now',
  'Scarica Tomorrow Now PDF Editor per Mac Apple Silicon. Modifica testo e font, esegui OCR locale, aggiungi firme, immagini, annotazioni e moduli PDF.',
);

export default function Page() { return <MacAppPage />; }
