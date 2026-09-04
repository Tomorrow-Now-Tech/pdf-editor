/** @type {Record<string, import('./tools.mjs').ToolPage>} */
export const EN_TOOLS = {
  'compress-pdf': {
    slug: 'compress-pdf', label: 'Compress PDF', mode: 'compress',
    title: 'Compress PDF Online for Free — No Uploads | Tomorrow Now',
    description: 'Reduce PDF file size on your device. Choose lossless optimisation or higher compression, with no account and no document uploads. Check the result before sharing.',
    heading: 'A smaller PDF. Without the upload.',
    intro: 'Reduce the size of an email attachment or a large document, right in your browser. Start with lossless optimisation, or choose higher compression when a smaller file matters more than keeping interactive features.',
    uploadHint: 'Open your PDF to see the compression options. Your document stays on your device.',
    steps: [
      { title: 'Open your PDF', text: 'Drop your document into the editor or choose a file from your device. Your original file will not be overwritten.' },
      { title: 'Choose how to compress it', text: 'Try “Optimise without quality loss” first. Use “High compression” only if you no longer need selectable text, links or fillable forms.' },
      { title: 'Check and download', text: 'Review the pages, then choose “Download PDF”. If compression does not produce a smaller file, the editor keeps the previous version.' },
    ],
    detailTitle: 'Which compression option should I use?',
    detail: [
      'Lossless optimisation rewrites the PDF structure without resampling its pages. Text stays as text, and images retain their quality. It is a useful first step for everyday documents, but an already optimised PDF may not get smaller.',
      'High compression turns each page into a JPEG image. This can help with large files intended only for reading, but it reduces sharpness and removes interactive features. Keep your original if you may need to edit the document again.',
    ],
    warning: 'High compression removes selectable text, links, fillable fields and other interactive features. It is not a secure redaction tool. Keep your original and check every page before sharing the result.',
    faqs: [
      { question: 'Can I compress a PDF to exactly 1 MB or 100 KB?', answer: 'A specific file size cannot be guaranteed. The result depends on the pages, images and compression already in the PDF. The editor reports the reduction and will not replace your document with a larger file.' },
      { question: 'Is PDF compression free?', answer: 'Yes. Both options work in your browser without an account. Processing speed and the size of documents you can handle depend on your device’s memory and performance.' },
      { question: 'Will I still be able to copy the text?', answer: 'Lossless optimisation preserves native text. High compression turns pages into images, so the text is no longer selectable.' },
    ],
  },
  'split-pdf': {
    slug: 'split-pdf', label: 'Split PDF', mode: 'split',
    title: 'Split PDF Online — Extract Pages for Free | Tomorrow Now',
    description: 'Extract a page range or split every page into a separate PDF inside a ZIP. Free to use, with no account and no document uploads.',
    heading: 'Keep the pages you need.',
    intro: 'Extract a range of pages into a new PDF, or split the whole document into individual files. Everything happens in your browser, without an account.',
    uploadHint: 'Open your PDF. The Split panel is ready to extract a page range or download every page in a ZIP.',
    steps: [
      { title: 'Open your document', text: 'Choose a PDF and use the page thumbnails to find the pages you need.' },
      { title: 'Choose a page range', text: 'Set “From page” and “To page”. To extract just one page, enter the same number in both fields.' },
      { title: 'Download your files', text: 'Choose “Download selected pages” for one PDF, or “Download all pages as ZIP” for a separate PDF for every page.' },
    ],
    detailTitle: 'One page range, or a file for every page',
    detail: [
      'Extracting a range is useful when you only need to share a few consecutive pages from a longer document. Page numbers start at 1 and match the thumbnails, not any page numbers printed inside the PDF.',
      'Splitting the whole document creates a ZIP archive. Each PDF is named after the original document and its page number, so you can identify the files after extracting the archive.',
    ],
    warning: 'Splitting copies pages; it does not remove hidden content within them and is not secure redaction. Check forms, links between pages and digital signatures in the new file before using it.',
    faqs: [
      { question: 'How do I extract a single page?', answer: 'Enter its number in both “From page” and “To page”, then choose “Download selected pages”. The new PDF will contain that page only.' },
      { question: 'Can I select pages that are not next to each other?', answer: 'The current range control selects consecutive pages. To separate every page and choose the files you need afterwards, use “Download all pages as ZIP”.' },
      { question: 'Will my original PDF change?', answer: 'No. Splitting creates a new download and does not overwrite the original file on your device.' },
    ],
  },
  'pdf-to-word': {
    slug: 'pdf-to-word', label: 'PDF to Word', mode: 'word',
    title: 'PDF to Word — Extract Editable Text for Free | Tomorrow Now',
    description: 'Extract selectable PDF text into an editable Word document on your device. No account or uploads. Text extraction only: no OCR or exact layout conversion.',
    heading: 'Take your PDF text into Word.',
    intro: 'Turn selectable text from a PDF into an editable Word document. This tool extracts text; it does not recreate the original page design.',
    uploadHint: 'Open a PDF with selectable text, then download the Word document from the PDF to Word panel.',
    steps: [
      { title: 'Choose a PDF with selectable text', text: 'Use a digital document whose text can be selected. Scanned pages need OCR first, which is not included in the web editor.' },
      { title: 'Create your Word document', text: 'Choose “Download Word document” in the PDF to Word panel. The text is collected page by page on your device.' },
      { title: 'Review the result', text: 'Open the DOCX in Word or a compatible app. Check the text order, paragraphs and formatting. Your original PDF remains unchanged.' },
    ],
    detailTitle: 'What is included in the Word file?',
    detail: [
      'The tool extracts lines of text and turns them into editable paragraphs, with page breaks between the original PDF pages. It is useful for reusing the content of letters, notes or other text-based documents.',
      'It does not reproduce original fonts, images, tables as Word tables, columns or precise positioning. Complex documents may need corrections to the reading order. Scanned pages require a separate OCR step.',
    ],
    warning: 'The Word file may include hidden text from the PDF. Covering text on a page does not delete it. Word export is blocked after text overlays are applied in this session, but the editor cannot guarantee that a PDF from another source contains no hidden text.',
    faqs: [
      { question: 'Will the Word file look exactly like the PDF?', answer: 'No. This tool creates a Word document from extracted text. Images, tables, columns, fonts and spacing must be recreated if you need them.' },
      { question: 'Does it work with scanned PDFs?', answer: 'The web editor does not run OCR. If a page is only an image, there is no text to extract. The Mac app includes local OCR tools for scanned documents.' },
      { question: 'Do I need Microsoft Word to convert the file?', answer: 'No. Your browser creates the DOCX. To edit it afterwards, use Word or another app that supports that format.' },
    ],
  },
  'edit-pdf': {
    slug: 'edit-pdf', label: 'Edit PDF', mode: 'edit',
    title: 'Edit PDF Online — Add Text and Text Overlays | Tomorrow Now',
    description: 'Add notes or cover and rewrite PDF text in your browser, without uploading files. Text overlays do not remove the original text and are not secure redaction.',
    heading: 'Add text. Make visual changes to your PDF.',
    intro: 'Add a note, or cover existing text and write over it using a substitute font. A text overlay changes what the page looks like, but the original text remains recoverable—even in the downloaded file.',
    uploadHint: 'Open a PDF to select text for an overlay. To write somewhere new, choose “Add text” instead.',
    steps: [
      { title: 'Open your PDF and select some text', text: 'The Text overlay tool is already selected. Click text in a digital PDF to prepare a visual replacement.' },
      { title: 'Write and adjust the style', text: 'Enter your replacement text, choose a font, size and colour, read the warning and apply the overlay. To add a new note, choose “Add text” and click the page.' },
      { title: 'Download a new copy', text: 'Review the preview and choose “Download PDF”. Keep your original and check the appearance of the new copy before using it.' },
    ],
    detailTitle: 'Adding an overlay does not remove the original text',
    detail: [
      'The web editor places a white rectangle and new text over the existing content. This can be useful for drafts, notes and non-confidential visual corrections. It does not change the underlying text in the way a native PDF editing engine would.',
      'Helvetica, Times and Courier are available as substitute fonts, with adjustable size and colour. An exact match to an embedded font is not guaranteed. The Mac app offers additional tools for fonts, signatures, images and local OCR.',
    ],
    warning: 'Do not use Text overlay to hide personal or confidential information. The original text can still be copied, searched or extracted. Use a secure redaction tool if you need to remove it permanently.',
    faqs: [
      { question: 'Can I permanently delete text from a PDF?', answer: 'Not with this tool. A text overlay does not remove the underlying text and must not be used to hide sensitive information.' },
      { question: 'Can I use the same font as the original document?', answer: 'The web editor uses Helvetica, Times or Courier as substitutes. You can adjust the size and colour, but an exact match to the original font is not guaranteed.' },
      { question: 'Can I write on a scanned PDF?', answer: 'You can add new text over a scanned page. Text that is part of the scanned image cannot be selected without OCR, which is available in the Mac app rather than the web editor.' },
    ],
  },
};

export const EN_TOOL_PAGES = Object.values(EN_TOOLS);
