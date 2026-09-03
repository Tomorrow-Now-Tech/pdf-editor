# Follow-up to the supplied legal review — 3 September 2026

Working engineering/legal handoff, not a lawyer's opinion, conformity
certificate or approval to launch publicly. The supplied review expressly
disclaims being a professional opinion; retain that distinction.

## Corrections and evidence

- The `<year> <name of author>` line is in the official AGPL appendix showing
  how to apply the license. Keep `LICENSE` verbatim. Add project attribution
  separately once the rights holder and public contact are confirmed; do not
  invent corporate status or reassign third-party authorship. Missing a header
  does not, by itself, prove that copyright or the license is unenforceable.
- Visual-edit warnings and the web-branch source link were already corrected
  in `f43de0527439d9c72ddc8a886c5313bb7443d402`. This follow-up adds the exact
  clean build commit, source ZIP and machine-readable provenance. The revision
  must be publicly pushed before deployment. A production build now refuses a
  dirty checkout rather than attaching an incorrect source revision.
- Web metadata now declares `AGPL-3.0-only`. The automatic dependency inventory
  includes runtime and build packages and preserves collected notice texts;
  it flags missing texts and is not a complete native dependency/license audit.
- PyMuPDF's official documentation offers AGPL and commercial licensing and
  requires checking that the use case meets all AGPL requirements. Publishing
  one repository is not by itself proof of complete binary/source compliance.
  See [PyMuPDF licensing](https://pymupdf.readthedocs.io/en/latest/about.html#license-and-copyright).
- Apple's current guidelines contain a specific **Mac Trademark** exception,
  with conditions including combination with a non-generic word. The supplied
  review's blanket claim that “Mac” is never allowed in a product name is too
  broad. The generic name “Mac PDF Editor” still merits review. Retain the
  planned Tomorrow Now rebrand, but do not break existing update paths merely
  by changing package names. See [Apple guidelines](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html).
- Local PDF processing does not mean “no personal data processing”: hosting
  logs, update checks and support reports need their own assessment. The Mac
  privacy draft now describes update requests and locally saved signatures.
- Do not invent cookie names, retention periods, DPF participation, SCCs or an
  Article 28 relationship from a hosting-provider name. Verify contracts and
  the final deployed service. Technical-cookie consent exemptions depend on
  actual purpose/configuration; see [Garante guidance](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876).
- Do not assume every free digital service falls under identical consumer
  rules. Have the reviewer assess the actual service, audience and data use;
  preserve mandatory rights and keep AGPL disclaimers separate from terms.

## Still required before public launch

1. Confirm the rights holder, controller's legal identity and operational public
   email/contact address; then update NOTICE, first-party attribution and
   privacy details consistently. Copyright holder and data controller need not
   be the same person/entity: check rather than infer.
2. Resolve inventory entries marked `notice-text-review-required`, check bundled
   and native components and preserve the exact notices for every shipped build.
   For the Mac release include Python's complete license set, Electron's
   Chromium/Node notices and the actual MuPDF native dependency set. Do not
   infer a complete list from package metadata or a proposed build alone.
3. Verify the final hosting contract, roles, subprocessors, logs, retention,
   transfers and cookie/storage inventory, including the reserved preview's
   authentication. The preview remains owner-only, not the intended accountless
   public service.
4. Complete lawful bases, rights/contact handling and terms (including consumer
   jurisdiction and liability rules) with a qualified professional. Record the
   professional's written approval and which exact source/release it covers.
5. Plan Mac rebranding with preserved application ID, data directory and signed
   upgrade testing. No change to existing DMGs, old tags or update manifests is
   authorized by this legal-documentation follow-up alone.

## Reproducing the evidence

`npm run legal:generate` writes generated public license resources.
`npm run typecheck` and `npm run lint` check source; `npm test` checks the PDF
regressions. Commit reviewed source before `npm run build`; the Vite build
embeds that commit into source links and `source-version.json`.
Verify `dist/client/source-version.json` matches the public GitHub commit and
the source SHA used for deployment. Retain build output and dependency
inventory for each release. A clean Git tree is provenance, not proof of
security, ownership, licensing compliance or fidelity of PDF operations.
