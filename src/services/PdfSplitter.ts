import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export interface SplitOptions {
  mode: 'all' | 'ranges';
  ranges?: string; // "1-3,5,7-9"
}

export class PdfSplitter {
  static async split(file: File, options: SplitOptions): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();
    const zip = new JSZip();

    if (options.mode === 'all') {
      // Split every page into a separate file
      for (let i = 0; i < numPages; i++) {
        const subDoc = await PDFDocument.create();
        const [copiedPage] = await subDoc.copyPages(pdfDoc, [i]);
        subDoc.addPage(copiedPage);
        const pdfBytes = await subDoc.save();
        zip.file(`${file.name.replace('.pdf', '')}_page_${i + 1}.pdf`, pdfBytes);
      }
    } else if (options.mode === 'ranges' && options.ranges) {
        // Parse ranges
        // Supported format: "1, 3-5, 10"
        const parts = options.ranges.split(',').map(p => p.trim());
        
        for (const part of parts) {
            let indices: number[] = [];
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let j = start; j <= end; j++) {
                        if (j > 0 && j <= numPages) indices.push(j - 1);
                    }
                }
            } else {
                const pageNum = parseInt(part);
                if (!isNaN(pageNum) && pageNum > 0 && pageNum <= numPages) {
                    indices.push(pageNum - 1);
                }
            }
            
            if (indices.length > 0) {
                const subDoc = await PDFDocument.create();
                const copiedPages = await subDoc.copyPages(pdfDoc, indices);
                copiedPages.forEach(p => subDoc.addPage(p));
                const pdfBytes = await subDoc.save();
                // Naming: simple range name
                const filename = `${file.name.replace('.pdf', '')}_split_${part.replace('-', '_')}.pdf`;
                zip.file(filename, pdfBytes);
            }
        }
    }

    return await zip.generateAsync({ type: 'blob' });
  }
}
