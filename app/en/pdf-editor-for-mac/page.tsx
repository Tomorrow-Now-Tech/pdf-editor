import { MacAppPage } from '@/components/mac-app-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata(
  '/en/pdf-editor-for-mac',
  'PDF Editor for Mac with OCR and Text Editing | Tomorrow Now',
  'Download Tomorrow Now PDF Editor for Apple Silicon Macs. Edit text and fonts, run OCR locally, and add signatures, images, annotations and PDF forms.',
);

export default function Page() { return <MacAppPage locale="en" />; }
