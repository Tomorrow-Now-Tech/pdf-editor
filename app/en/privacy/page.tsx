import { EnglishLegalPage, EN_LEGAL_METADATA } from '@/components/english-legal-page';
import { pageMetadata } from '@/seo/site.mjs';
const copy = EN_LEGAL_METADATA.privacy;
export const metadata = pageMetadata('/en/privacy', copy.title, copy.description);
export default function Page() { return <EnglishLegalPage page="privacy" />; }
