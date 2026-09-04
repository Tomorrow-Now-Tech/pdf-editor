import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata('/terms', 'Termini di utilizzo | Tomorrow Now PDF Editor', 'Condizioni di utilizzo, limiti delle funzioni PDF, versione beta e responsabilità di verifica dei documenti prodotti.');
import { CompanyDetails } from '@/components/company-details';

export default function TermsPage() {
  return (
    <LegalPage path="/terms" title="Termini d’uso" intro="Condizioni preliminari per l’utilizzo gratuito dell’editor PDF.">
      <h2>1. Servizio</h2>
      <p>Tomorrow Now PDF Editor è uno strumento gratuito per svolgere operazioni su documenti PDF nel browser o tramite l’app Mac. Le funzioni possono cambiare nel tempo e la versione web è indicata come beta.</p>
      <p>Dati del gestore:</p>
      <CompanyDetails className="my-5" />
      <p>Partita IVA e PEC sono indicate come “in fase di emissione” e saranno aggiunte quando disponibili. Questi dati provvisori non sostituiscono il completamento e la revisione delle informazioni legali.</p>

      <h2>2. Elaborazione locale</h2>
      <p>Nella versione browser il documento viene elaborato sul dispositivo. L’utente deve comunque adottare misure adeguate per proteggere il proprio dispositivo, il browser e le copie scaricate.</p>

      <h2>3. Uso consentito</h2>
      <p>L’utente dichiara di avere il diritto di aprire e modificare i documenti trattati. È vietato usare il servizio per attività illecite, violare diritti di terzi o tentare di compromettere il sito e la sua infrastruttura.</p>

      <h2>4. Verifica dei risultati</h2>
      <p>L’utente deve controllare il documento prima di firmarlo, inviarlo o usarlo in procedimenti professionali, amministrativi o legali. Impaginazione, font e campi complessi possono cambiare tra diversi PDF.</p>
      <p>La modifica visiva nel browser copre il testo con un rettangolo bianco e aggiunge nuove scritte con un font sostitutivo: non elimina il testo originale, che può rimanere ricercabile, copiabile ed estraibile. Non è uno strumento per oscurare informazioni riservate. La conversione Word estrae il testo, anche eventualmente nascosto, senza garantire l’impaginazione. La compressione forte trasforma le pagine in immagini e perde testo selezionabile, collegamenti e moduli: verificare sempre il risultato.</p>

      <h2>5. Garanzie e responsabilità</h2>
      <p>Il software è fornito senza garanzie ulteriori rispetto a quelle inderogabili previste dalla legge. Limitazioni di responsabilità, legge applicabile, foro e disciplina consumer saranno definite soltanto dopo la revisione professionale.</p>
      <p>La licenza AGPL disciplina i diritti sul software. Questi termini riguardano invece l’uso del servizio: il richiamo alla licenza non sostituisce le tutele inderogabili applicabili né costituisce una rinuncia ai diritti dell’utente.</p>

      <h2>6. Marchi e assenza di affiliazione</h2>
      <p>Tomorrow Now PDF Editor è un progetto indipendente. Non è affiliato, sponsorizzato o approvato da Adobe Inc. o Apple Inc.</p>

      <p className="legal-date">Bozza aggiornata il 3 settembre 2026. Legge applicabile, foro e clausole di responsabilità restano soggetti a revisione professionale.</p>
    </LegalPage>
  );
}
