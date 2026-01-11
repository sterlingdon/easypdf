import JSZip from 'jszip';

export type ImageFormat = 'jpg' | 'png' | 'webp' | 'avif';

export class PdfToImage {
  /**
   * Check if a format is supported by the browser
   */
  private static isFormatSupported(format: ImageFormat): boolean {
    if (typeof document === 'undefined') return false;
    const canvas = document.createElement('canvas');
    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
    // Try to create a data URL with the specific MIME type
    const dataUrl = canvas.toDataURL(mimeType);
    return dataUrl.startsWith(`data:${mimeType}`);
  }

  static async convert(file: File, format: ImageFormat = 'jpg', quality: number = 0.9): Promise<Blob> {
    // Check format support
    if (format === 'avif' && !this.isFormatSupported('avif')) {
      throw new Error('AVIF format is not supported in this browser. Please use Chrome, Firefox, or Safari.');
    }

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
    const originalPdf = await loadingTask.promise;
    const numPages = originalPdf.numPages;
    const zip = new JSZip();

    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

    for (let i = 1; i <= numPages; i++) {
        const page = await originalPdf.getPage(i);
        // Scale 2.0 for better quality (retina-like), or adjustable
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas as any
        }).promise;

        const blob = await new Promise<Blob | null>(resolve =>
            canvas.toBlob(resolve, mimeType, quality)
        );

        if (blob) {
            zip.file(`${file.name.replace('.pdf', '')}_page_${i}.${format}`, blob);
        }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Convert PDF to a single long image (all pages stitched vertically)
   */
  static async toLongImage(file: File, format: ImageFormat = 'png', quality: number = 0.9): Promise<Blob> {
    if (format === 'avif' && !this.isFormatSupported('avif')) {
      throw new Error('AVIF format is not supported in this browser.');
    }

    const pdfjsLib = await import('pdfjs-dist');

    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerUrl = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const originalPdf = await loadingTask.promise;
    const numPages = originalPdf.numPages;

    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;

    // First pass: calculate total height and max width
    let totalHeight = 0;
    let maxWidth = 0;
    const pageSizes: Array<{ width: number; height: number }> = [];

    for (let i = 1; i <= numPages; i++) {
        const page = await originalPdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        pageSizes.push({ width: viewport.width, height: viewport.height });
        totalHeight += viewport.height;
        maxWidth = Math.max(maxWidth, viewport.width);
    }

    // Create combined canvas
    const combinedCanvas = document.createElement('canvas');
    const context = combinedCanvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    combinedCanvas.width = maxWidth;
    combinedCanvas.height = totalHeight;

    // Second pass: render all pages onto combined canvas
    let yOffset = 0;
    for (let i = 1; i <= numPages; i++) {
        const page = await originalPdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });

        // Create temporary canvas for each page
        const tempCanvas = document.createElement('canvas');
        const tempContext = tempCanvas.getContext('2d');
        if (!tempContext) continue;

        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        await page.render({
            canvasContext: tempContext,
            viewport: viewport,
            canvas: tempCanvas as any
        }).promise;

        // Center the page horizontally if it's narrower than max width
        const xOffset = (maxWidth - viewport.width) / 2;
        context.drawImage(tempCanvas, xOffset, yOffset);

        yOffset += viewport.height;
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      combinedCanvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
        mimeType,
        quality
      );
    });

    return blob;
  }
}
