import { COMPANY, PENDING_COMPANY_DETAIL } from '@/legal/company.mjs';

export function CompanyDetails({ className = '' }: { className?: string }) {
  return (
    <address className={`not-italic leading-6 ${className}`}>
      <strong>{COMPANY.name}</strong><br />
      {COMPANY.address}<br />
      <a href={`mailto:${COMPANY.email}`} className="underline underline-offset-4">{COMPANY.email}</a><br />
      <span>Partita IVA: {COMPANY.vat ?? PENDING_COMPANY_DETAIL}</span>
      <span aria-hidden="true"> · </span>
      <span>PEC: {COMPANY.pec ? <a href={`mailto:${COMPANY.pec}`}>{COMPANY.pec}</a> : PENDING_COMPANY_DETAIL}</span>
    </address>
  );
}
