import { SeoToolPage } from '@/components/seo-tool-page';
import { TOOLS } from '@/seo/tools.mjs';
import { pageMetadata } from '@/seo/site.mjs';
const tool = TOOLS['modifica-pdf'];
export const metadata = pageMetadata(
  `/${tool.slug}`,
  tool.title,
  tool.description,
);
export default function Page() {
  return <SeoToolPage tool={tool} />;
}
