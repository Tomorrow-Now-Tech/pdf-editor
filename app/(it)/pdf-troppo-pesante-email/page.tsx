import { EmailCompressionGuidePage } from '@/components/email-compression-guide-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/pdf-troppo-pesante-email',
  'PDF troppo pesante per email? Guida alla compressione',
  'Metodo verificato per ridurre un PDF troppo pesante per email, scegliere la compressione corretta e controllare qualità e dimensione prima dell’invio.',
);

export default function Page() {
  return <EmailCompressionGuidePage />;
}
