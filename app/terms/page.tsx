import { LegalPage } from '@/components/legal-page';

export default function TermsPage() {
  return (
    <LegalPage title="Termini d’uso" intro="Condizioni preliminari per l’utilizzo gratuito dell’editor PDF.">
      <h2>1. Servizio</h2>
      <p>Tomorrow Now PDF Editor è uno strumento gratuito per svolgere operazioni su documenti PDF nel browser o tramite l’app Mac. Le funzioni possono cambiare nel tempo e la versione web è indicata come beta.</p>

      <h2>2. Elaborazione locale</h2>
      <p>Nella versione browser il documento viene elaborato sul dispositivo. L’utente deve comunque adottare misure adeguate per proteggere il proprio dispositivo, il browser e le copie scaricate.</p>

      <h2>3. Uso consentito</h2>
      <p>L’utente dichiara di avere il diritto di aprire e modificare i documenti trattati. È vietato usare il servizio per attività illecite, violare diritti di terzi o tentare di compromettere il sito e la sua infrastruttura.</p>

      <h2>4. Verifica dei risultati</h2>
      <p>L’utente deve controllare il documento prima di firmarlo, inviarlo o usarlo in procedimenti professionali, amministrativi o legali. Impaginazione, font e campi complessi possono cambiare tra diversi PDF.</p>

      <h2>5. Garanzie e responsabilità</h2>
      <p>Il software è fornito senza garanzie ulteriori rispetto a quelle inderogabili previste dalla legge. Limitazioni di responsabilità, legge applicabile, foro e disciplina consumer saranno definite soltanto dopo la revisione professionale.</p>

      <h2>6. Marchi e assenza di affiliazione</h2>
      <p>Tomorrow Now PDF Editor è un progetto indipendente. Non è affiliato, sponsorizzato o approvato da Adobe Inc. o Apple Inc.</p>

      <p className="legal-date">Bozza aggiornata il 2 settembre 2026.</p>
    </LegalPage>
  );
}
