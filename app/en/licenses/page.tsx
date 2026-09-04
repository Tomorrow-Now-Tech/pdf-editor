import { EnglishLegalPage, EN_LEGAL_METADATA } from '@/components/english-legal-page';
import { pageMetadata } from '@/seo/site.mjs';
const copy = EN_LEGAL_METADATA.licenses;
export const metadata = pageMetadata('/en/licenses', copy.title, copy.description);
export default function Page() { return <EnglishLegalPage page="licenses" />; }
