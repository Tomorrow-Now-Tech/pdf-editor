# Third-party notices

| Component | Version | License | Project |
| --- | ---: | --- | --- |
| PDF.js / pdfjs-dist | 6.3.289 | Apache-2.0 | <https://mozilla.github.io/pdf.js/> |
| pdf-lib | 1.17.1 | MIT | <https://pdf-lib.js.org/> |
| docx | 9.7.1 | MIT | <https://docx.js.org/> |
| JSZip | 3.10.1 | MIT | <https://stuk.github.io/jszip/> |
| React | 19.2.8 | MIT | <https://react.dev/> |
| Lucide | 1.31.0 | ISC | <https://lucide.dev/> |
| Tailwind CSS | 4.2.1 | MIT | <https://tailwindcss.com/> |

PDF.js decoder/resource notices are copied without modification by
`scripts/sync-pdfjs-assets.mjs`. The built distribution includes the full
upstream notices under these same-origin paths:

- `/pdfjs/LICENSE` — PDF.js Apache-2.0.
- `/pdfjs/wasm/LICENSE_OPENJPEG` and `LICENSE_PDFJS_OPENJPEG`.
- `/pdfjs/wasm/LICENSE_JBIG2` and `LICENSE_PDFJS_JBIG2`.
- `/pdfjs/wasm/LICENSE_QCMS` and `LICENSE_PDFJS_QCMS`.
- `/pdfjs/cmaps/LICENSE`, `/pdfjs/standard_fonts/LICENSE_FOXIT`,
  `/pdfjs/standard_fonts/LICENSE_LIBERATION`, `/pdfjs/iccs/LICENSE`.

The synthetic codec fixtures in `scripts/pdf-safety.test.mjs` were generated
for this project and contain no user PDFs or third-party document contents.

This list covers the primary runtime components. Exact transitive versions are
recorded in `package-lock.json`; upstream packages retain their own copyright
and license notices.
