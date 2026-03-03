import { pdfjs } from 'react-pdf';

// Configure PDF.js worker - use CDN for compatibility
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default pdfjs;
