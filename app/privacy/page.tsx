import { LegalPage } from '@/components/legal-page';

export default function PrivacyPage() {
  return (
    <LegalPage title="Informativa privacy" intro="Come vengono trattati i dati quando usi Tomorrow Now PDF Editor online.">
      <h2>1. Titolare del trattamento</h2>
      <p>Il titolare sarà indicato con denominazione o nome completo, sede o domicilio e contatto privacy prima del lancio pubblico. Il marchio del servizio è Tomorrow Now.</p>

      <h2>2. Contenuto dei PDF</h2>
      <p>La versione browser apre e modifica i documenti nella memoria del dispositivo dell’utente. Il codice dell’editor non invia a Tomorrow Now il contenuto dei PDF selezionati e non richiede un account.</p>

      <h2>3. Dati tecnici di accesso</h2>
      <p>Il fornitore di hosting e rete può trattare indirizzo IP, data e ora, URL richiesto, user agent, informazioni di sicurezza e diagnostica per erogare e proteggere il sito. Prima del lancio verranno indicati fornitore, tempi di conservazione, base giuridica, eventuali trasferimenti e accordi applicabili.</p>

      <h2>4. Cookie e strumenti di tracciamento</h2>
      <p>La configurazione iniziale non prevede analytics, pubblicità comportamentale o cookie non necessari. Se in futuro saranno aggiunti strumenti ulteriori, questa informativa e l’eventuale meccanismo di consenso verranno aggiornati prima dell’attivazione.</p>

      <h2>5. Finalità e base giuridica</h2>
      <p>I dati tecnici strettamente necessari sono trattati per fornire il servizio, garantirne la sicurezza, prevenire abusi e risolvere errori. La base giuridica e i tempi precisi saranno confermati nella revisione professionale.</p>

      <h2>6. Diritti</h2>
      <p>Gli interessati possono esercitare i diritti previsti dagli articoli 15–22 GDPR e proporre reclamo all’autorità di controllo competente. Il recapito operativo per le richieste sarà pubblicato prima del lancio.</p>

      <p className="legal-date">Bozza aggiornata il 2 settembre 2026.</p>
    </LegalPage>
  );
}
