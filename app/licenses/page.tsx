import { LegalPage } from '@/components/legal-page';

export default function LicensesPage() {
  return (
    <LegalPage title="Open source e licenze" intro="Dove trovare il codice e quali diritti accompagnano il software.">
      <h2>Codice sorgente</h2>
      <p>Il sorgente di questa versione browser, le istruzioni di compilazione e gli avvisi delle dipendenze sono nel <a href="https://github.com/Trader855/PDF/tree/web">ramo web dedicato</a>. Il codice è separato dalla versione Mac.</p>
      <p>Il sorgente dell’app Mac è disponibile nel repository pubblico <a href="https://github.com/Trader855/PDF">github.com/Trader855/PDF</a>. Ogni release deve indicare il commit o tag corrispondente al relativo DMG e ZIP.</p>

      <h2>Licenza AGPL v3</h2>
      <p>Il codice dell’applicazione è distribuito secondo la GNU Affero General Public License versione 3. Il testo integrale è incluso nel repository. Le modifiche distribuite e le versioni rese disponibili attraverso una rete devono rispettare gli obblighi applicabili della licenza.</p>

      <h2>Componenti principali</h2>
      <ul>
        <li>PyMuPDF: AGPL v3 o licenza commerciale Artifex.</li>
        <li>PDF.js: Apache License 2.0.</li>
        <li>pdf-lib: MIT License.</li>
        <li>Decodificatori PDF.js (OpenJPEG, JBIG2 e QCMS), CMaps, font standard e profili ICC: avvisi originali inclusi nelle risorse del sito e indicati nel ramo web.</li>
        <li>Electron e strumenti collegati: licenze indicate in THIRD_PARTY_NOTICES.</li>
        <li>Font Caladea, Carlito e Liberation: SIL Open Font License 1.1.</li>
      </ul>

      <h2>Marchi</h2>
      <p>La licenza del codice non concede il diritto di usare il nome, i loghi o l’icona Tomorrow Now per presentare una build modificata come ufficiale. Consulta il file TRADEMARKS nel repository.</p>

      <h2>Revisione professionale</h2>
      <p>Licenza, avvisi di terze parti e modalità di offerta del servizio devono essere verificati da un professionista prima del lancio definitivo.</p>

      <p className="legal-date">Bozza aggiornata il 2 settembre 2026.</p>
    </LegalPage>
  );
}
