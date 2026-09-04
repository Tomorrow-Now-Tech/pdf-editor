import { EnglishLegalPage, EN_LEGAL_METADATA } from '@/components/english-legal-page';
import { pageMetadata } from '@/seo/site.mjs';
const copy = EN_LEGAL_METADATA.terms;
export const metadata = pageMetadata('/en/terms', copy.title, copy.description);
export default function Page() { return <EnglishLegalPage page="terms" />; }
