import { PDFDocument, PDFPage, PDFEmbeddedPage, rgb } from 'pdf-lib';

export type PaperSize = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid' | 'custom';
export type PageSizeUnit = 'inch' | 'mm' | 'pt';

export interface PageSize {
  width: number;
  height: number;
  unit: PageSizeUnit;
}

export interface CropMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: PageSizeUnit;
}

export interface NUpOptions {
  pagesPerSheet: 2 | 4 | 6 | 8 | 9 | 16;
  direction: 'horizontal' | 'vertical';
}

// Standard paper sizes in points (1 point = 1/72 inch)
const PAPER_SIZES: Record<PaperSize, { width: number; height: number }> = {
  a4: { width: 595.28, height: 841.89 },   // 210 x 297 mm
  a3: { width: 841.89, height: 1190.55 },  // 297 x 420 mm
  a5: { width: 420.94, height: 595.28 },   // 148 x 210 mm
  letter: { width: 612, height: 792 },     // 8.5 x 11 inches
  legal: { width: 612, height: 1008 },     // 8.5 x 14 inches
  tabloid: { width: 792, height: 1224 },   // 11 x 17 inches
  custom: { width: 612, height: 792 },     // Default to letter
};

export class PdfPageTransformer {
  /**
   * Convert size to points (PDF units)
   */
  private static toPoints(value: number, unit: PageSizeUnit): number {
    switch (unit) {
      case 'inch':
        return value * 72;
      case 'mm':
        return (value * 72) / 25.4;
      case 'pt':
        return value;
      default:
        return value;
    }
  }

  /**
   * Resize PDF pages to a standard paper size or custom dimensions
   */
  static async adjustSize(
    file: File,
    targetSize: PaperSize | PageSize,
    scaleContent: boolean = true,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    let targetWidth: number;
    let targetHeight: number;

    if (typeof targetSize === 'string') {
      const size = PAPER_SIZES[targetSize];
      targetWidth = size.width;
      targetHeight = size.height;
    } else {
      targetWidth = this.toPoints(targetSize.width, targetSize.unit);
      targetHeight = this.toPoints(targetSize.height, targetSize.unit);
    }

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width: currentWidth, height: currentHeight } = page.getSize();

      // Set new page size
      page.setWidth(targetWidth);
      page.setHeight(targetHeight);

      if (scaleContent) {
        // Calculate scale factors
        const scaleX = targetWidth / currentWidth;
        const scaleY = targetHeight / currentHeight;
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add margins

        // Scale content
        page.scaleContent(scale, scale);
      }

      if (onProgress) {
        onProgress(i + 1, numPages);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Crop PDF pages by removing margins
   */
  static async crop(
    file: File,
    margins: CropMargins,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    // Convert margins to points
    const marginTop = this.toPoints(margins.top, margins.unit);
    const marginRight = this.toPoints(margins.right, margins.unit);
    const marginBottom = this.toPoints(margins.bottom, margins.unit);
    const marginLeft = this.toPoints(margins.left, margins.unit);

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Calculate new crop box
      const newWidth = width - marginLeft - marginRight;
      const newHeight = height - marginTop - marginBottom;

      if (newWidth > 0 && newHeight > 0) {
        // Set new page size
        page.setWidth(newWidth);
        page.setHeight(newHeight);

        // Translate content to offset for cropped margins
        // Note: pdf-lib doesn't support direct crop box modification
        // We need to create a new page and draw the cropped content
      }

      if (onProgress) {
        onProgress(i + 1, numPages);
      }
    }

    // For proper cropping, we need to render and redraw pages
    // This is a simplified version that adjusts the media box
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Crop PDF pages using percentages (0-100)
   */
  static async cropByPercentage(
    file: File,
    margins: { top: number; right: number; bottom: number; left: number },
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
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

    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      // Calculate crop area
      const cropLeft = (margins.left / 100) * viewport.width;
      const cropTop = (margins.top / 100) * viewport.height;
      const cropRight = (margins.right / 100) * viewport.width;
      const cropBottom = (margins.bottom / 100) * viewport.height;

      const croppedWidth = viewport.width - cropLeft - cropRight;
      const croppedHeight = viewport.height - cropTop - cropBottom;

      // Render to canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.width = croppedWidth;
      canvas.height = croppedHeight;

      await page.render({
        canvasContext: context,
        viewport: page.getViewport({
          scale: 2.0,
          offsetX: -cropLeft,
          offsetY: cropTop,
        }),
        canvas: canvas as any,
        transform: [1, 0, 0, -1, 0, viewport.height], // Flip Y axis
      }).promise;

      // Convert canvas to image and embed in new PDF
      const imageUrl = canvas.toDataURL('image/png');
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      const image = await newPdf.embedPng(imageBytes);

      const newPage = newPdf.addPage([croppedWidth / 2, croppedHeight / 2]);
      newPage.drawImage(image, {
        x: 0,
        y: 0,
        width: newPage.getWidth(),
        height: newPage.getHeight(),
      });

      if (onProgress) {
        onProgress(i, numPages);
      }
    }

    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Create N-up PDF (multiple pages per sheet)
   * Combines multiple pages onto a single sheet in a grid layout
   */
  static async createNUp(
    files: File[],
    options: NUpOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    const { pagesPerSheet, direction } = options;

    // Calculate grid dimensions
    let cols: number;
    let rows: number;

    switch (pagesPerSheet) {
      case 2:
        cols = direction === 'horizontal' ? 2 : 1;
        rows = direction === 'horizontal' ? 1 : 2;
        break;
      case 4:
        cols = 2;
        rows = 2;
        break;
      case 6:
        cols = direction === 'horizontal' ? 3 : 2;
        rows = direction === 'horizontal' ? 2 : 3;
        break;
      case 8:
        cols = direction === 'horizontal' ? 4 : 2;
        rows = direction === 'horizontal' ? 2 : 4;
        break;
      case 9:
        cols = 3;
        rows = 3;
        break;
      case 16:
        cols = 4;
        rows = 4;
        break;
      default:
        cols = 2;
        rows = 1;
    }

    // Load all PDFs and collect all pages
    const allPages: PDFEmbeddedPage[] = [];
    const newPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const embeddedPages = await newPdf.embedPdf(pdfDoc);
      allPages.push(...embeddedPages);
    }

    // Create N-up pages
    let pageIndex = 0;
    let progressIndex = 0;
    const totalPages = allPages.length;

    while (pageIndex < allPages.length) {
      // Get the first page to determine size
      const firstPage = allPages[pageIndex];
      const { width: pageWidth, height: pageHeight } = firstPage;

      // Calculate sheet size
      const sheetWidth = pageWidth * cols;
      const sheetHeight = pageHeight * rows;

      // Create new sheet
      const sheet = newPdf.addPage([sheetWidth, sheetHeight]);

      // Add pages to sheet
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (pageIndex >= allPages.length) break;

          const page = allPages[pageIndex];
          const { width, height } = page;

          // Calculate position
          const x = col * pageWidth + (pageWidth - width) / 2;
          const y = sheetHeight - ((row + 1) * pageHeight) + (pageHeight - height) / 2;

          sheet.drawPage(page, { x, y });

          pageIndex++;
        }
      }

      progressIndex++;
      if (onProgress) {
        onProgress(Math.min(pageIndex, totalPages), totalPages);
      }
    }

    const pdfBytes = await newPdf.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }

  /**
   * Create N-up PDF from a single file
   */
  static async createNUpFromSingle(
    file: File,
    options: NUpOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    return this.createNUp([file], options, onProgress);
  }

  /**
   * Get page size information
   */
  static async getPageSizes(file: File): Promise<Array<{
    pageIndex: number;
    width: number;
    height: number;
    rotation: number;
  }>> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    const pageSizes: Array<{
      pageIndex: number;
      width: number;
      height: number;
      rotation: number;
    }> = [];

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;

      pageSizes.push({
        pageIndex: i,
        width,
        height,
        rotation,
      });
    }

    return pageSizes;
  }

  /**
   * Set DPI (resolution) for PDF pages
   * Note: PDF doesn't have native DPI, this adjusts the page size for printing
   */
  static async adjustDPI(
    file: File,
    targetDPI: number,
    currentDPI: number = 72,
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();

    const scaleFactor = targetDPI / currentDPI;

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Scale page size
      page.setWidth(width * scaleFactor);
      page.setHeight(height * scaleFactor);

      if (onProgress) {
        onProgress(i + 1, numPages);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }
}
