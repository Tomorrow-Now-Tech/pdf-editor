# Roadmap after the independent audit

Proposals, not features already shipped or commitments to a release date.
Keep Mac work in its own source tree/branch and do not merge this web branch
into the DMG branch.

1. **Release gates:** finish the remaining medium audit issues, realistic
   large-document/concurrency tests in Chrome and Safari, and independent
   re-review. Complete professional review of public-launch legal drafts.
2. **First-use value:** merge multiple PDFs and reorder thumbnail pages by
   dragging, then a synthetic example document and tool-specific deep links.
   Check form/metadata loss and warn before each destructive transformation.
3. **Provable local processing:** document resource/network boundaries and
   add a tested offline PWA. Distinguish initial app/resource downloads from
   document uploads. PerformanceObserver is not proof of zero outgoing
   traffic (workers, WebSockets and platform services can escape it); do not
   ship an unqualified “network requests: 0” counter.
4. **Additional tools:** signatures, images/PDF conversion, watermarking,
   page numbers and form filling, each with a tested format-support matrix.
   Keep true text removal/redaction distinct from white overlay editing.
5. **Reach:** English localization, factual tool/competitor pages and SEO.
   New Open Graph images, sharing UI, attribution metadata with an opt-out,
   and UTM links need deliberate implementation and privacy review. Do not
   introduce analytics merely to measure branding links.

Mac-only proposals: PDF file association and Dock opening first; URL actions
must validate commands/paths and not permit arbitrary execution. Intel or
universal builds, Homebrew distribution and application renaming require
tested signed artifacts and update-path compatibility. PDF/A and secure
redaction require independent output validation, not just a UI label or a
failed text search. Leave existing DMGs/releases unchanged during this work.
