import { LegalPage } from '@/components/legal-page';
import { pageMetadata } from '@/seo/site.mjs';

export const metadata = pageMetadata('/licenses', 'Licenze e codice sorgente | Tomorrow Now PDF Editor', 'Licenza AGPL v3, sorgente della versione distribuita e licenze dei componenti usati da Tomorrow Now PDF Editor.');
import { WEB_SOURCE_ARCHIVE, WEB_SOURCE_BRANCH, WEB_SOURCE_REVISION, WEB_SOURCE_URL } from '@/legal/source';

export default function LicensesPage() {
  return (
    <LegalPage title="Open source e licenze" intro="Dove trovare il codice e quali diritti accompagnano il software.">
      <h2>Codice sorgente</h2>
      <p><a href={WEB_SOURCE_URL}>Sorgente della versione web in uso</a>{WEB_SOURCE_REVISION ? <> · revisione <code>{WEB_SOURCE_REVISION}</code></> : ' · anteprima locale con modifiche non ancora pubblicate'}.</p>
      {WEB_SOURCE_ARCHIVE && <p><a href={WEB_SOURCE_ARCHIVE}>Scarica il sorgente completo di questa versione (ZIP)</a>, con istruzioni di build e lockfile. <a href={WEB_SOURCE_BRANCH}>Segui lo sviluppo della versione web</a>.</p>}
      <p>Il sorgente di questa versione browser, le istruzioni di compilazione e gli avvisi delle dipendenze sono nel <a href={WEB_SOURCE_BRANCH}>repository web dedicato</a>. Il codice è separato dalla versione Mac.</p>
      <p>Il sorgente dell’app Mac è disponibile nel repository pubblico <a href="https://github.com/Trader855/PDF">github.com/Trader855/PDF</a>. Ogni release deve indicare il commit o tag corrispondente al relativo DMG e ZIP.</p>

      <h2>Licenza AGPL v3</h2>
      <p>Il codice dell’applicazione è distribuito secondo la GNU Affero General Public License versione 3. Il testo integrale è incluso nel repository. Le modifiche distribuite e le versioni rese disponibili attraverso una rete devono rispettare gli obblighi applicabili della licenza.</p>

      <h2>Componenti principali</h2>
      <p><a href="/legal/THIRD_PARTY_LICENSES.txt" download>Scarica i testi di licenza raccolti automaticamente</a> · <a href="/legal/dependencies.json" download>Inventario delle dipendenze della build</a> · <a href="/legal/AGPL-3.0.txt" download>Testo integrale AGPL v3</a>.</p>
      <p>L’inventario distingue i componenti installati da quelli opzionali non presenti e include anche strumenti di compilazione. Segnala gli avvisi da completare; non certifica la conformità di tutte le dipendenze né delle librerie native dell’app Mac.</p>
      <ul>
        <li>PyMuPDF: AGPL v3 o licenza commerciale Artifex.</li>
        <li>PDF.js: Apache License 2.0.</li>
        <li>pdf-lib: MIT License.</li>
        <li>React, react-server-dom-webpack e vinext: MIT. La toolchain comprende anche Wrangler e gli strumenti Cloudflare: versioni e licenze dichiarate sono nell’inventario della build.</li>
        <li>Decodificatori PDF.js (OpenJPEG, JBIG2 e QCMS), CMaps, font standard e profili ICC: avvisi originali inclusi nelle risorse del sito e indicati nel ramo web.</li>
        <li>Electron e strumenti collegati: licenze indicate in THIRD_PARTY_NOTICES.</li>
        <li>Font Caladea, Carlito e Liberation: SIL Open Font License 1.1.</li>
      </ul>

      <h2>Marchi</h2>
      <p>La licenza del codice non concede il diritto di usare il nome, i loghi o l’icona Tomorrow Now per presentare una build modificata come ufficiale.</p>

      <h2>Revisione professionale</h2>
      <p>Licenza, avvisi di terze parti e modalità di offerta del servizio devono essere verificati da un professionista prima del lancio definitivo.</p>

      <p className="legal-date">Bozza aggiornata il 3 settembre 2026. Le condizioni del servizio e l’informativa privacy sono separate dalla licenza del software.</p>
    </LegalPage>
  );
}
