import { SiteLayout } from '@/components/site-layout';
export { metadata } from '@/components/site-layout';
export default function Layout({ children }: { children: React.ReactNode }) { return <SiteLayout locale="it">{children}</SiteLayout>; }
