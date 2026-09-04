import { HomePage } from '@/components/home-page';
import { pageMetadata } from '@/seo/site.mjs';
export const metadata = pageMetadata('/en', 'Free PDF Tools Online and for Mac | Tomorrow Now PDF Editor', 'Add text, compress PDFs, split pages and extract text to Word. Free browser tools with no account and no document uploads. Text overlays are not secure redaction.');
export default function Home() { return <HomePage locale="en" />; }
