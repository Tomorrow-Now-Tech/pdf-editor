import { LegalPage } from '@/components/legal-page';
import { CompanyDetails } from '@/components/company-details';
import { COMPANY } from '@/legal/company.mjs';
import { WEB_HOSTING_DESCRIPTION } from '@/legal/hosting';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata('/privacy', 'Privacy | Tomorrow Now PDF Editor', 'Come il PDF Editor elabora i documenti sul dispositivo, quali dati tecnici possono essere trattati e come contattare il gestore.');

export default function PrivacyPage() {
  return (
    <LegalPage title="Informativa privacy" intro="Informazioni preliminari sulla versione browser, sull’app Mac e sui contatti di assistenza.">
      <h2>1. Titolare del trattamento</h2>
      <CompanyDetails className="my-5" />
      <p>I dati sopra riportati sono quelli comunicati dal gestore. Partita IVA e PEC sono indicate come “in fase di emissione” e saranno aggiornate quando disponibili; l’anagrafica completa e l’informativa restano da verificare. Il marchio del servizio è Tomorrow Now.</p>

      <h2>2. Contenuto dei PDF</h2>
      <p>La versione browser apre e modifica i documenti nella memoria del dispositivo dell’utente. Il codice dell’editor non invia a Tomorrow Now il contenuto dei PDF selezionati e non richiede un account.</p>
      <p>La versione pubblica dell’editor è accessibile senza registrazione. L’editor non gestisce un account proprio; eventuali anteprime riservate possono invece richiedere l’accesso del servizio di hosting.</p>

      <h2>3. Dati tecnici di accesso</h2>
      <p>Il fornitore di hosting e rete può trattare indirizzo IP, data e ora, URL richiesto, user agent, informazioni di sicurezza e diagnostica per erogare e proteggere il sito. Tempi di conservazione, base giuridica, eventuali trasferimenti e accordi applicabili restano da completare in questa informativa.</p>
      <p>Questa versione del sito usa {WEB_HOSTING_DESCRIPTION}. La configurazione tecnica non dimostra da sola quali siano i ruoli privacy, il contratto applicabile o la localizzazione dei dati. Responsabili e sub-responsabili, accordi, conservazione e garanzie per eventuali trasferimenti extra SEE restano da verificare sulla configurazione e sui contratti effettivi.</p>

      <h2>4. Cookie e strumenti di tracciamento</h2>
      <p>La configurazione iniziale non prevede analytics, pubblicità comportamentale o cookie non necessari. Se in futuro saranno aggiunti strumenti ulteriori, questa informativa e l’eventuale meccanismo di consenso verranno aggiornati prima dell’attivazione.</p>
      <p>L’assenza di cookie impostati dal codice dell’editor non prova l’assenza di cookie o memoria locale del provider. Autenticazione e protezioni dell’hosting possono aggiungerne: nomi, finalità, durata e necessità dovranno essere verificati sull’indirizzo finale. Non dichiariamo già presenti cookie specifici senza averli osservati.</p>

      <h2>5. Finalità e base giuridica</h2>
      <p>I dati tecnici strettamente necessari sono trattati per fornire il servizio, garantirne la sicurezza, prevenire abusi e risolvere errori. La base giuridica e i tempi precisi saranno confermati nella revisione professionale.</p>

      <h2>6. Diritti</h2>
      <p>Gli interessati possono esercitare i diritti previsti dagli articoli 15–22 GDPR e proporre reclamo all’autorità di controllo competente. Per le richieste relative alla privacy, scrivi a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>

      <h2>7. App Mac, firme e aggiornamenti</h2>
      <p>L’app Mac elabora i PDF localmente. Le firme che scegli di salvare vengono conservate nella memoria locale dell’app sul dispositivo fino alla loro eliminazione, tramite i comandi dedicati. I PDF scaricati o salvati rimangono nelle posizioni scelte dall’utente: la loro gestione e cancellazione restano sotto il suo controllo.</p>
      <p>Il controllo degli aggiornamenti contatta GitHub dopo l’avvio e quando viene richiesto dall’utente. Queste richieste comunicano almeno l’indirizzo IP e dati tecnici della connessione al fornitore; non sono un caricamento del documento. Anche i link al sorgente, ai download e al sito Tomorrow Now aprono servizi con proprie informative. Consulta l’<a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">informativa GitHub</a>.</p>

      <h2>8. Assistenza e segnalazioni di sicurezza</h2>
      <p>Per assistenza e segnalazioni puoi contattare {COMPANY.name} a <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Se invii una richiesta o una segnalazione, il destinatario riceve il tuo indirizzo email, il contenuto del messaggio e gli eventuali allegati. Non allegare PDF di clienti, firme o altri dati riservati: usa esempi sintetici o privi di dati personali. Finalità, base giuridica, modalità di gestione e tempi di conservazione di questo canale restano da completare e confermare.</p>

      <p className="legal-date">Aggiornata il 3 settembre 2026. Informativa ancora da completare e sottoporre a revisione professionale.</p>
    </LegalPage>
  );
}
