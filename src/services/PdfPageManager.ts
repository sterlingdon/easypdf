import { PDFDocument } from 'pdf-lib';

export interface PageSelectionOptions {
  mode: 'selected' | 'all' | 'exclude';
  pageIndices?: number[]; // 0-based indices
  ranges?: string; // "1-3,5,7-9" (1-based for user input)
}

export class PdfPageManager {
  /**
   * Parse page ranges string (1-based) to 0-based indices array
   * Supports formats: "1", "1-3", "1,3,5-7"
   */
  private static parseRanges(ranges: string, numPages: number): number[] {
    const indices = new Set<number>();
    const parts = ranges.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(numPages, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            indices.add(i - 1); // Convert to 0-based
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
          indices.add(pageNum - 1); // Convert to 0-based
        }
      }
    }

    return Array.from(indices).sort((a, b) => a - b);
  }

  /**
   * Extract specific pages from PDF, creating a new PDF with only those pages
   */
  static async extractPages(file: File, options: PageSelectionOptions): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    let pageIndices: number[] = [];

    if (options.mode === 'all') {
      pageIndices = Array.from({ length: numPages }, (_, i) => i);
    } else if (options.mode === 'selected' && options.pageIndices) {
      pageIndices = options.pageIndices;
    } else if (options.mode === 'selected' && options.ranges) {
      pageIndices = this.parseRanges(options.ranges, numPages);
    }

    // Create new PDF with selected pages
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
    copiedPages.forEach(page => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Remove specific pages from PDF, creating a new PDF without those pages
   */
  static async removePages(file: File, options: PageSelectionOptions): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    let indicesToRemove: number[] = [];

    if (options.mode === 'selected' && options.pageIndices) {
      indicesToRemove = options.pageIndices;
    } else if (options.mode === 'selected' && options.ranges) {
      indicesToRemove = this.parseRanges(options.ranges, numPages);
    }

    // Remove pages in reverse order to avoid index shifting
    indicesToRemove.sort((a, b) => b - a);
    for (const index of indicesToRemove) {
      if (index >= 0 && index < numPages) {
        try {
          pdfDoc.removePage(index);
        } catch (e) {
          console.warn(`Could not remove page at index ${index}`);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Remove blank pages from PDF
   * A page is considered blank if it has minimal content variation
   */
  static async removeBlank(file: File, threshold: number = 0.01): Promise<Blob> {
    const pdfjsLib = await import('pdfjs-dist');

    // Configure worker
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const workerUrl = new URL(
        'pdfjs-dist/build/pdf.worker.mjs',
        import.meta.url
      ).href;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Detect blank pages by rendering and checking pixel variance
    const blankPageIndices: number[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvas: canvas as any
      }).promise;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate pixel variance
      let sum = 0;
      let sumSquared = 0;
      const pixelCount = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        // Use grayscale value
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        sum += gray;
        sumSquared += gray * gray;
      }

      const mean = sum / pixelCount;
      const variance = (sumSquared / pixelCount) - (mean * mean);

      // If variance is below threshold, page is considered blank
      if (variance < threshold * 255 * 255) {
        blankPageIndices.push(i - 1); // 0-based index
      }
    }

    // Remove blank pages
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Remove in reverse order
    blankPageIndices.sort((a, b) => b - a);
    for (const index of blankPageIndices) {
      try {
        pdfDoc.removePage(index);
      } catch (e) {
        console.warn(`Could not remove blank page at index ${index}`);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }
}
