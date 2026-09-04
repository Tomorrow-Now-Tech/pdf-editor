import { TRANSLATORS } from '@/i18n/messages.mjs';
import { type Locale } from '@/i18n/routes.mjs';
import { COMPANY, PENDING_COMPANY_DETAIL } from '@/legal/company.mjs';

export function CompanyDetails({ className = '', locale = 'it' }: { className?: string; locale?: Locale }) {
  const t = TRANSLATORS[locale];
  return (
    <address className={`not-italic leading-6 ${className}`}>
      <strong>{COMPANY.name}</strong><br />
      {COMPANY.address}<br />
      <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-4">{COMPANY.email}</a><br />
      <span>{t("Partita IVA:")} {COMPANY.vat ?? t(PENDING_COMPANY_DETAIL)}</span>
      <span aria-hidden="true"> · </span>
      <span>{t("PEC:")} {COMPANY.pec ? <a href={`mailto:${COMPANY.pec}`}>{COMPANY.pec}</a> : t(PENDING_COMPANY_DETAIL)}</span>
    </address>
  );
}
