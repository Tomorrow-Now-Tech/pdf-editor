# English edition

The English web edition lives at `/en`. Its tool pages are `/en/compress-pdf`,
`/en/split-pdf`, `/en/pdf-to-word` and `/en/edit-pdf`. Privacy, terms and licences
also have English pages. The existing Italian URLs have not changed.

## Editorial rules

- Use clear, natural British English consistently: colour, optimise, licence.
- Translate the experience, not just the landing page: buttons, input labels,
  accessible names, progress, errors, output filenames and safety notices.
- Keep these labels consistent in guides and the editor: **Text overlay**,
  **Add text**, **Optimise without quality loss**, **High compression**,
  **Download selected pages**, **Download all pages as ZIP**, and
  **Download Word document**.
- Describe text overlays as visual changes, never permanent removal or secure
  redaction. Word export extracts text; it does not preserve the original layout.
- Do not claim that the Mac app has been translated: this release only localises
  the website and browser editor. The existing DMG download is unchanged.
- Keep company details in `legal/company.mjs`. The English legal notices translate
  the existing drafts and retain their pending fields and review requirements;
  they do not create additional terms or certify legal compliance.

## Structure

`i18n/routes.mjs` is the explicit registry of language-equivalent public URLs.
`i18n/messages.mjs` contains bundled editorial translations and parameterised
messages; no translation service receives UI text or PDF contents. Stable
Italian source strings are the message keys. `seo/tools-en.mjs` contains complete
English tool copy. Both languages use the same editor implementation.

Separate root layouts in `app/(it)` and `app/en` set the HTML language at render
time. Static page metadata puts titles, descriptions, canonical URLs and
reciprocal language alternates in the initial head, without JavaScript or user
agent detection. Each page canonicalises to itself; English pages do not
canonicalise to Italian. The sitemap lists all 16 canonical URLs and alternates.

The language selector links to the equivalent page, not just the homepage.
Switching languages is a full navigation and closes the in-memory document.
An open editor asks for confirmation so the user can download changes first.
There are no IP-based redirects, language cookies or automatic language changes.

## Release checks

- `npm run lint`, `npm run typecheck`, `npm test`.
- Translation completeness tests inspect shared JSX and translation calls.
- Font round-trip tests save and extract English text, digits, punctuation and
  currency symbols with Helvetica, Times and Courier.
- Existing PDF safety, decoder, ZIP, DOCX and provenance tests remain enabled.
- `npm run ci:cloudflare` checks the production Worker and all 16 rendered pages,
  metadata, language alternates, source links, resources and unknown-route 404s.
- The deployment pipeline repeats the HTML/SEO checks on the public website.

These automated checks are not a full interactive Chrome/Safari test or a review
by an independent native-speaking editor. Chinese and Indic-script editing have
not been added. Any further language needs its own complete copy and character,
layout, download and safety checks before publication.
