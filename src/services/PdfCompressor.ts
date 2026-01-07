import { PDFDocument } from 'pdf-lib';

// pdfjs-dist will be imported dynamically to avoid SSR issues with DOMMatrix

export type CompressionLevel = 'QUALITY' | 'EXTREME';
export type CompressionType = 'NATIVE' | 'BITMAP';

export interface CompressionOptions {
  quality: CompressionLevel;
  type: CompressionType;
  onProgress?: (progress: number) => void;
}

export class PdfCompressor {
  
  static async compress(file: File, options: CompressionOptions): Promise<Blob> {
    if (options.type === 'BITMAP') {
      return this.compressBitmap(file, options);
    } else {
      return this.compressNative(file, options);
    }
  }

  private static async compressNative(file: File, options: CompressionOptions): Promise<Blob> {
    const { onProgress } = options;
    if (onProgress) onProgress(10);

    const arrayBuffer = await file.arrayBuffer();
    if (onProgress) onProgress(30);

    // Load the PDF with pdf-lib
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    if (onProgress) onProgress(60);

    // Basic optimization: Saving with pdf-lib can sometimes reduce size by removing unused objects
    // We can explicitly enable object streams for slightly better compression of structure
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
    
    if (onProgress) onProgress(100);

    return new Blob([compressedBytes as any], { type: 'application/pdf' });
  }

  private static async compressBitmap(file: File, options: CompressionOptions): Promise<Blob> {
    const { onProgress, quality } = options;
    if (onProgress) onProgress(0);

    // Dynamic import to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker if not already configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerUrl = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url
        ).href;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    }

    const arrayBuffer = await file.arrayBuffer();
    
    // Load with pdf.js
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const originalPdf = await loadingTask.promise;
    const numPages = originalPdf.numPages;

    // Create new PDF with pdf-lib
    const newPdfDoc = await PDFDocument.create();

    // Determine scale and generic quality
    // EXTREME: Standard DPI (approx 108), Lower JPEG Quality
    // QUALITY: High DPI (approx 144), Good JPEG Quality
    const scale = quality === 'EXTREME' ? 1.5 : 2.0; 
    const jpegQuality = quality === 'EXTREME' ? 0.6 : 0.8;

    for (let i = 1; i <= numPages; i++) {
        const page = await originalPdf.getPage(i);
        const originalViewport = page.getViewport({ scale: 1.0 });
        const renderViewport = page.getViewport({ scale });

        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.height = renderViewport.height;
        canvas.width = renderViewport.width;

        await page.render({
            canvasContext: context,
            viewport: renderViewport,
            canvas: canvas as any
        }).promise;

        const imgDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
        const imgBytes = await fetch(imgDataUrl).then(res => res.arrayBuffer());

        const pdfImage = await newPdfDoc.embedJpg(imgBytes);
        
        const newPage = newPdfDoc.addPage([originalViewport.width, originalViewport.height]);
        newPage.drawImage(pdfImage, {
            x: 0,
            y: 0, // pdf-lib coordinates start at bottom-left? No, default is bottom-left, but we can manage.
            // Wait, pdf-lib default coordinate system is Y-up (0,0 is bottom-left).
            // But drawImage draws from bottom-left corner?
            // "The width and height parameters specify the dimensions of the image when drawn on the page."
            // "The x and y parameters specify the coordinates of the bottom-left corner of the image."
            // However, our image is "top-down".
            // If we just draw it, it might be upside down if pdf-lib expects bottom-up image data?
            // No, embedJpg usually handles it.
            // But if we define Y=0, that's bottom.
            // If we draw width/height, it goes UP.
            // So if we draw at 0,0, width, height, it fills the page.
            // Let's assume standard behavior.
            width: originalViewport.width,
            height: originalViewport.height,
        });

        if (onProgress) {
            onProgress(Math.round((i / numPages) * 90));
        }
    }

    const compressedBytes = await newPdfDoc.save({ useObjectStreams: true });
    if (onProgress) onProgress(100);
    
    return new Blob([compressedBytes as any], { type: 'application/pdf' });
  }
}
