import { SeoToolPage } from '@/components/seo-tool-page';
import { EN_TOOLS } from '@/seo/tools-en.mjs';
import { pageMetadata } from '@/seo/site.mjs';
const tool = EN_TOOLS['compress-pdf'];
export const metadata = pageMetadata('/en/compress-pdf', tool.title, tool.description);
export default function Page() { return <SeoToolPage locale="en" tool={tool} />; }
