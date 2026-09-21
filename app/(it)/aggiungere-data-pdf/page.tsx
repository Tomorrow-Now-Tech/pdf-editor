import { DateGuidePage } from '@/components/date-guide-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/aggiungere-data-pdf',
  'Come aggiungere una data a un PDF online | Tomorrow Now',
  'Guida pratica per inserire una data in un PDF dal browser, posizionarla, controllarla e scaricare una nuova copia senza caricare il documento.',
);

export default function Page() {
  return <DateGuidePage />;
}
