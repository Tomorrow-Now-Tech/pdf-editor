import { DateGuidePage } from '@/components/date-guide-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/en/add-date-to-pdf',
  'How to add a date to a PDF online | Tomorrow Now',
  'A practical guide to adding a date to a PDF in your browser, positioning it accurately and downloading a new copy without uploading the document.',
);

export default function Page() {
  return <DateGuidePage locale="en" />;
}
