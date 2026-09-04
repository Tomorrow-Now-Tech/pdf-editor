import { LegalPage } from '@/components/legal-page';
import { CompanyDetails } from '@/components/company-details';
import { COMPANY } from '@/legal/company.mjs';
import { WEB_HOSTING_DESCRIPTION } from '@/legal/hosting';
import { WEB_SOURCE_ARCHIVE, WEB_SOURCE_BRANCH, WEB_SOURCE_REVISION, WEB_SOURCE_URL } from '@/legal/source';
import { TRANSLATORS } from '@/i18n/messages.mjs';

// Faithful English versions of the existing notices, not new legal terms.
// Keep substantive changes in sync with the legal pages under app/(it).
export const EN_LEGAL_METADATA = {
  privacy: { title: 'Privacy Notice | Tomorrow Now PDF Editor', description: 'How the PDF editor processes documents on your device, what technical information may be processed, and how to contact the service operator.' },
  terms: { title: 'Terms of Use | Tomorrow Now PDF Editor', description: 'Terms for using the free PDF editor, feature limitations, beta status and your responsibility to check the resulting documents.' },
  licenses: { title: 'Open Source and Licences | Tomorrow Now PDF Editor', description: 'GNU AGPL v3, the source code for this release and the licences of components used by Tomorrow Now PDF Editor.' },
};

export function EnglishLegalPage({ page }: { page: keyof typeof EN_LEGAL_METADATA }) {
  if (page === 'privacy') return <Privacy />;
  if (page === 'terms') return <Terms />;
  return <Licences />;
}

function Privacy() {
  return <LegalPage locale="en" path="/en/privacy" title="Privacy notice" intro="Preliminary information about the browser editor, the Mac app and support enquiries.">
    <h2>1. Data controller</h2>
    <CompanyDetails locale="en" className="my-5" />
    <p>The details above were supplied by the service operator. The VAT number and Italian certified email address (PEC) are listed as pending and will be updated when available. The full company details and this notice still need to be verified. The service operates under the Tomorrow Now brand.</p>
    <h2>2. PDF contents</h2>
    <p>The browser editor opens and modifies documents in the memory of your device. The editor’s code does not send the contents of selected PDFs to Tomorrow Now and does not require an account.</p>
    <p>The public editor is available without registration. It does not manage its own user accounts. Private previews may require you to sign in through the hosting service.</p>
    <h2>3. Technical information about visits</h2>
    <p>The hosting and network provider may process IP addresses, dates and times, requested URLs, user agents, security information and diagnostic data to deliver and protect the website. Retention periods, the legal basis, any international transfers and the applicable agreements still need to be completed in this notice.</p>
    <p>This version uses {TRANSLATORS.en(WEB_HOSTING_DESCRIPTION)}. The technical configuration alone does not establish the parties’ data protection roles, the applicable contract or where data is located. Processors and subprocessors, agreements, retention periods and safeguards for any transfers outside the EEA still need to be verified against the actual configuration and contracts.</p>
    <h2>4. Cookies and tracking</h2>
    <p>The initial configuration does not include analytics, behavioural advertising or non-essential cookies. If additional tools are introduced, this notice and any required consent mechanism will be updated before those tools are activated.</p>
    <p>The absence of cookies set by the editor’s code does not establish that the provider uses no cookies or local storage. Hosting authentication and security features may add them. Their names, purposes, lifetimes and necessity must be checked on the final website. We do not claim that specific cookies are present unless they have been observed.</p>
    <h2>5. Purposes and legal basis</h2>
    <p>Strictly necessary technical information is processed to provide the service, keep it secure, prevent abuse and resolve errors. The legal basis and precise retention periods will be confirmed during the professional review.</p>
    <h2>6. Your rights</h2>
    <p>Data subjects may exercise the rights provided by Articles 15–22 of the GDPR and lodge a complaint with the competent supervisory authority. For privacy enquiries, contact <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.</p>
    <h2>7. Mac app, signatures and updates</h2>
    <p>The Mac app processes PDFs locally. Signatures you choose to save remain in the app’s local storage on your device until you delete them using the relevant controls. Downloaded or saved PDFs remain in the locations you choose; you control their management and deletion.</p>
    <p>The update checker contacts GitHub after the app starts and when you request a check. These requests disclose at least your IP address and technical connection information to the provider; they do not upload your document. Links to source code, downloads and the Tomorrow Now website also open services with their own privacy notices. See <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement">GitHub’s privacy statement</a>.</p>
    <h2>8. Support and security reports</h2>
    <p>For support or security reports, contact {COMPANY.name} at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. If you send an enquiry or report, the recipient receives your email address, message and any attachments. Do not attach client PDFs, signatures or other confidential information. Use synthetic examples or material without personal data. The purposes, legal basis, handling procedures and retention periods for this contact channel still need to be completed and confirmed.</p>
    <p className="legal-date">Updated on 3 September 2026. This notice still needs to be completed and professionally reviewed. English translation prepared on 4 September 2026.</p>
  </LegalPage>;
}

function Terms() {
  return <LegalPage locale="en" path="/en/terms" title="Terms of use" intro="Preliminary terms for using the free PDF editor.">
    <h2>1. The service</h2>
    <p>Tomorrow Now PDF Editor is a free tool for working with PDF documents in a browser or through the Mac app. Features may change over time, and the web version is labelled as beta.</p>
    <p>Service operator:</p>
    <CompanyDetails locale="en" className="my-5" />
    <p>The VAT number and Italian certified email address (PEC) are listed as pending and will be added when available. These provisional details do not replace the need to complete and review the legal information.</p>
    <h2>2. Local processing</h2>
    <p>The browser version processes your document on your device. You must still take appropriate steps to protect your device, browser and downloaded copies.</p>
    <h2>3. Permitted use</h2>
    <p>You confirm that you have the right to open and modify the documents you process. You must not use the service for unlawful activities, infringe third-party rights or attempt to compromise the website or its infrastructure.</p>
    <h2>4. Checking the results</h2>
    <p>You must check the resulting document before signing it, sending it or using it in professional, administrative or legal proceedings. Layouts, fonts and complex fields may behave differently across PDFs.</p>
    <p>Text overlays in the browser cover text with a white rectangle and add new text using a substitute font. They do not delete the original, which may remain searchable, copyable and extractable. This is not a tool for redacting confidential information. Word export extracts text, including potentially hidden text, without guaranteeing the layout. High compression turns pages into images and removes selectable text, links and forms. Always check the result.</p>
    <h2>5. Warranties and liability</h2>
    <p>The software is provided without warranties beyond those that cannot be excluded by law. Limitations of liability, governing law, jurisdiction and consumer provisions will only be defined after professional review.</p>
    <p>The AGPL governs rights in the software. These terms instead concern use of the service. Referring to the licence does not replace applicable mandatory protections or constitute a waiver of your rights.</p>
    <h2>6. Brands and non-affiliation</h2>
    <p>Tomorrow Now PDF Editor is an independent project. It is not affiliated with, sponsored by or endorsed by Adobe Inc. or Apple Inc.</p>
    <p className="legal-date">Draft updated on 3 September 2026. Governing law, jurisdiction and liability clauses remain subject to professional review. English translation prepared on 4 September 2026.</p>
  </LegalPage>;
}

function Licences() {
  return <LegalPage locale="en" path="/en/licenses" title="Open source and licences" intro="Where to find the source code and the rights that come with the software.">
    <h2>Source code</h2>
    <p><a href={WEB_SOURCE_URL}>Source code for this web version</a>{WEB_SOURCE_REVISION ? <> · revision <code>{WEB_SOURCE_REVISION}</code></> : ' · local preview with changes that have not yet been published'}.</p>
    {WEB_SOURCE_ARCHIVE && <p><a href={WEB_SOURCE_ARCHIVE}>Download the complete source for this version (ZIP)</a>, including build instructions and the dependency lockfile. <a href={WEB_SOURCE_BRANCH}>Follow development of the web version</a>.</p>}
    <p>The source for this browser version, build instructions and dependency notices are in the <a href={WEB_SOURCE_BRANCH}>dedicated web repository</a>. The code is kept separate from the Mac version.</p>
    <p>The Mac app’s source is available in the public repository <a href="https://github.com/Trader855/PDF">github.com/Trader855/PDF</a>. Each release must identify the commit or tag corresponding to its DMG and ZIP files.</p>
    <h2>GNU AGPL v3</h2>
    <p>The application’s code is distributed under the GNU Affero General Public License version 3. The full text is included in the repository. Distributed modifications and versions made available over a network must meet the applicable obligations of the licence.</p>
    <h2>Main components</h2>
    <p><a href="/legal/THIRD_PARTY_LICENSES.txt" download>Download the automatically collected licence texts</a> · <a href="/legal/dependencies.json" download>Build dependency inventory</a> · <a href="/legal/AGPL-3.0.txt" download>Full GNU AGPL v3 text</a>.</p>
    <p>The inventory distinguishes installed components from absent optional dependencies and also includes build tools. It flags notices that need to be completed. It does not certify compliance for all dependencies or for the Mac app’s native libraries.</p>
    <ul>
      <li>PyMuPDF: GNU AGPL v3 or an Artifex commercial licence.</li>
      <li>PDF.js: Apache License 2.0.</li>
      <li>pdf-lib: MIT License.</li>
      <li>React, react-server-dom-webpack and vinext: MIT. The toolchain also includes Wrangler and Cloudflare tools. Versions and declared licences are listed in the build inventory.</li>
      <li>PDF.js decoders (OpenJPEG, JBIG2 and QCMS), CMaps, standard fonts and ICC profiles: original notices are included in the website’s resources and listed in the web source.</li>
      <li>Electron and related tools: licences are listed in THIRD_PARTY_NOTICES.</li>
      <li>Caladea, Carlito and Liberation fonts: SIL Open Font License 1.1.</li>
    </ul>
    <h2>Brand names and logos</h2>
    <p>The source code licence does not grant the right to use the Tomorrow Now name, logos or app icon to present a modified build as an official release.</p>
    <h2>Professional review</h2>
    <p>The licence, third-party notices and the way the service is offered must be reviewed by a professional before the final launch.</p>
    <p className="legal-date">Draft updated on 3 September 2026. The terms of service and privacy notice are separate from the software licence. English translation prepared on 4 September 2026.</p>
  </LegalPage>;
}
