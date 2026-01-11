import { PDFDocument } from 'pdf-lib';

export interface OutlineItem {
  title: string;
  pageIndex: number; // 0-based
  level: number;
  children?: OutlineItem[];
}

export class PdfAdvancedSplitter {
  /**
   * Split PDF by file size - creates multiple PDFs each not exceeding target size
   * Uses binary search approximation to find optimal split points
   */
  static async splitBySize(
    file: File,
    targetSizeMB: number,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob[]> {
    const targetSizeBytes = targetSizeMB * 1024 * 1024;
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    const results: Blob[] = [];
    let currentPageIndex = 0;

    while (currentPageIndex < numPages) {
      // Binary search to find how many pages fit in target size
      let left = 1;
      let right = numPages - currentPageIndex;
      let bestPageCount = 1;

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        // Create a temporary PDF with mid pages to check size
        const tempPdf = await PDFDocument.create();
        const pagesToCopy = Array.from({ length: mid }, (_, i) => currentPageIndex + i);
        const copiedPages = await tempPdf.copyPages(pdfDoc, pagesToCopy);
        copiedPages.forEach(page => tempPdf.addPage(page));

        const pdfBytes = await tempPdf.save();
        const actualSize = pdfBytes.length;

        if (actualSize <= targetSizeBytes) {
          bestPageCount = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      // Create the actual split PDF with bestPageCount pages
      const splitPdf = await PDFDocument.create();
      const pagesToCopy = Array.from({ length: bestPageCount }, (_, i) => currentPageIndex + i);
      const copiedPages = await splitPdf.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach(page => splitPdf.addPage(page));

      const pdfBytes = await splitPdf.save();
      results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));

      currentPageIndex += bestPageCount;

      if (onProgress) {
        onProgress(currentPageIndex, numPages);
      }
    }

    return results;
  }

  /**
   * Split PDF by outline/bookmarks
   * Extracts PDF outline structure and splits at each outline level
   */
  static async splitByOutline(
    file: File,
    outlineLevel: number = 1,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob[]> {
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

    // Get outline structure
    const outline = await pdf.getOutline();
    if (!outline || outline.length === 0) {
      throw new Error('This PDF does not contain bookmarks/outline.');
    }

    // Flatten outline to get split points at specified level
    const outlineItems = this.flattenOutline(outline, pdf, outlineLevel);

    if (outlineItems.length === 0) {
      // If no items at specified level, fall back to splitting each page
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = pdfDoc.getPageCount();
      const results: Blob[] = [];

      for (let i = 0; i < numPages; i++) {
        const splitPdf = await PDFDocument.create();
        const [page] = await splitPdf.copyPages(pdfDoc, [i]);
        splitPdf.addPage(page);

        const pdfBytes = await splitPdf.save();
        results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));

        if (onProgress) {
          onProgress(i + 1, numPages);
        }
      }

      return results;
    }

    // Create split PDFs based on outline
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();
    const results: Blob[] = [];

    for (let i = 0; i < outlineItems.length; i++) {
      const item = outlineItems[i];
      const nextPageIndex = i < outlineItems.length - 1 ? outlineItems[i + 1].pageIndex : numPages;

      if (item.pageIndex >= numPages) continue;

      const splitPdf = await PDFDocument.create();
      const pagesToCopy: number[] = [];

      for (let j = item.pageIndex; j < nextPageIndex && j < numPages; j++) {
        pagesToCopy.push(j);
      }

      if (pagesToCopy.length === 0) continue;

      const copiedPages = await splitPdf.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach(page => splitPdf.addPage(page));

      const pdfBytes = await splitPdf.save();
      results.push(new Blob([pdfBytes as any], { type: 'application/pdf' }));

      if (onProgress) {
        onProgress(i + 1, outlineItems.length);
      }
    }

    return results;
  }

  /**
   * Get outline structure from PDF for display
   */
  static async getOutline(file: File): Promise<OutlineItem[]> {
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

    const outline = await pdf.getOutline();
    if (!outline || outline.length === 0) {
      return [];
    }

    return this.buildOutlineStructure(outline, pdf, 0);
  }

  /**
   * Recursively build outline structure
   */
  private static async buildOutlineStructure(
    items: any[],
    pdf: any,
    level: number
  ): Promise<OutlineItem[]> {
    const result: OutlineItem[] = [];

    for (const item of items) {
      let pageIndex = 0;

      if (item.dest) {
        // Get page index from destination
        try {
          const dest = typeof item.dest === 'string' ? await pdf.getDestination(item.dest) : item.dest;
          if (dest && dest[0]) {
            pageIndex = dest[0].getPageIndex() - 1; // Convert to 0-based
          }
        } catch {
          pageIndex = 0;
        }
      }

      const outlineItem: OutlineItem = {
        title: item.title || `Untitled ${level}`,
        pageIndex: Math.max(0, pageIndex),
        level,
      };

      // Recursively process children
      if (item.items && item.items.length > 0) {
        outlineItem.children = await this.buildOutlineStructure(item.items, pdf, level + 1);
      }

      result.push(outlineItem);
    }

    return result;
  }

  /**
   * Flatten outline to get items at specific level
   */
  private static flattenOutline(
    items: any[],
    pdf: any,
    targetLevel: number,
    currentLevel: number = 0
  ): Array<{ title: string; pageIndex: number }> {
    const result: Array<{ title: string; pageIndex: number }> = [];

    for (const item of items) {
      if (currentLevel === targetLevel - 1) {
        let pageIndex = 0;

        if (item.dest) {
          try {
            const dest = typeof item.dest === 'string' ? pdf.getDestination(item.dest) : item.dest;
            if (dest && dest[0]) {
              pageIndex = dest[0].getPageIndex() - 1;
            }
          } catch {
            pageIndex = 0;
          }
        }

        result.push({
          title: item.title || `Untitled`,
          pageIndex: Math.max(0, pageIndex),
        });
      }

      // Recursively process children
      if (item.items && item.items.length > 0) {
        result.push(...this.flattenOutline(item.items, pdf, targetLevel, currentLevel + 1));
      }
    }

    return result;
  }
}
