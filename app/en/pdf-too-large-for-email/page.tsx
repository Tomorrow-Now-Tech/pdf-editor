import { EmailCompressionGuidePage } from '@/components/email-compression-guide-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/en/pdf-too-large-for-email',
  'PDF too large for email? A practical compression guide',
  'A measured method for reducing an oversized PDF, choosing the right compression mode and checking quality and file size before sending it.',
);

export default function Page() {
  return <EmailCompressionGuidePage locale="en" />;
}
