import JSZip from 'jszip';

export class PdfToImage {
  static async convert(file: File, format: 'jpg' | 'png' | 'webp' = 'jpg'): Promise<Blob> {
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
            canvas.toBlob(resolve, mimeType, 0.9)
        );
        
        if (blob) {
            zip.file(`${file.name.replace('.pdf', '')}_page_${i}.${format}`, blob);
        }
    }

    return await zip.generateAsync({ type: 'blob' });
  }
}
