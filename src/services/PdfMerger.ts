import { PDFDocument } from 'pdf-lib';

export class PdfMerger {
  /**
   * Merges multiple PDF files into a single PDF.
   * @param files Array of File objects to merge.
   * @returns A Promise that resolves to the merged PDF as a Blob.
   */
  static async merge(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
    }

    const mergedBytes = await mergedPdf.save();
    return new Blob([mergedBytes as any], { type: 'application/pdf' });
  }
}
