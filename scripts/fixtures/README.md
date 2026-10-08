# Synthetic word-fidelity fixture

`word-font.pdf` contains only original test strings (Torino/Milano and three
rows), generated locally with PyMuPDF. No customer documents or extracted
customer fonts are used. Its embedded Liberation Sans Bold font comes from
the already-distributed `public/pdfjs/standard_fonts/LiberationSans-Bold.ttf`;
its GPL v2 notice with font-embedding exception is copied here as
`LICENSE_LIBERATION` (the exact notice supplied by the pinned PDF.js package).
The explicit two-byte bfchar map models an OCR-generated embedded-font PDF.
