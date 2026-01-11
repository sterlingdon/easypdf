import JSZip from 'jszip';

export type ImageFormat = 'png' | 'jpg';

export interface ExtractedImage {
  filename: string;
  blob: Blob;
  pageIndex: number;
  imageIndex: number;
}

export class PdfContentExtractor {
  /**
   * Extract all text content from a PDF file
   * Returns text with page separators
   */
  static async extractText(file: File): Promise<string> {
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

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Extract text items and join them with spaces
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();

      // Add page separator
      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return fullText;
  }

  /**
   * Extract text and return as a plain text blob for download
   */
  static async extractTextAsBlob(file: File): Promise<Blob> {
    const text = await this.extractText(file);
    return new Blob([text], { type: 'text/plain;charset=utf-8' });
  }

  /**
   * Extract structured text content with more information
   * Includes page numbers, line breaks, and positioning
   */
  static async extractStructuredText(file: File): Promise<{
    totalPages: number;
    pages: Array<{
      pageNumber: number;
      text: string;
      wordCount: number;
    }>;
    fullText: string;
  }> {
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
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pages: Array<{
      pageNumber: number;
      text: string;
      wordCount: number;
    }> = [];

    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();

      const wordCount = pageText.split(/\s+/).filter(w => w.length > 0).length;

      pages.push({
        pageNumber: i,
        text: pageText,
        wordCount
      });

      fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    }

    return {
      totalPages: numPages,
      pages,
      fullText
    };
  }

  /**
   * Get text statistics from a PDF
   */
  static async getTextStats(file: File): Promise<{
    totalPages: number;
    totalWords: number;
    totalCharacters: number;
    pages: Array<{
      pageNumber: number;
      wordCount: number;
      characterCount: number;
    }>;
  }> {
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
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const pages: Array<{
      pageNumber: number;
      wordCount: number;
      characterCount: number;
    }> = [];

    let totalWords = 0;
    let totalCharacters = 0;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();

      const wordCount = pageText.split(/\s+/).filter(w => w.length > 0).length;
      const characterCount = pageText.length;

      totalWords += wordCount;
      totalCharacters += characterCount;

      pages.push({
        pageNumber: i,
        wordCount,
        characterCount
      });
    }

    return {
      totalPages: numPages,
      totalWords,
      totalCharacters,
      pages
    };
  }

  /**
   * Extract all images from a PDF file
   * Returns a ZIP blob containing all images
   */
  static async extractImages(
    file: File,
    format: ImageFormat = 'png',
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

    const zip = new JSZip();
    const imageMap = new Map<string, number>(); // Track duplicate images
    let imageIndex = 0;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const operatorList = await page.getOperatorList();

      // Find image objects in the page
      const imageOps = operatorList.fnArray.filter((fn: any, i: number) =>
        fn === pdfjsLib.OPS.paintImageXObject ||
        fn === pdfjsLib.OPS.paintInlineImageXObject
      );

      for (let j = 0; j < imageOps.length; j++) {
        const opIndex = operatorList.fnArray.indexOf(imageOps[j]);
        const imageName = operatorList.argsArray[opIndex]?.[0];

        if (!imageName) continue;

        try {
          const image = await page.objs.get(imageName);

          if (!image) continue;

          // Create canvas to draw the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          canvas.width = image.width || 100;
          canvas.height = image.height || 100;

          // Put image data on canvas
          if (image.data) {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = image.data;

            if (image.kind === 2 || image.kind === 3) {
              // RGB or RGBA
              for (let k = 0; k < data.length; k++) {
                imageData.data[k] = data[k];
              }
            } else {
              // Grayscale
              for (let k = 0; k < canvas.width * canvas.height; k++) {
                const gray = data[k];
                imageData.data[k * 4] = gray;
                imageData.data[k * 4 + 1] = gray;
                imageData.data[k * 4 + 2] = gray;
                imageData.data[k * 4 + 3] = 255;
              }
            }

            ctx.putImageData(imageData, 0, 0);
          }

          // Convert canvas to blob
          const blob = await new Promise<Blob | null>((resolve) => {
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob(resolve, mimeType, 0.95);
          });

          if (blob) {
            // Generate filename and check for duplicates
            const baseName = file.name.replace('.pdf', '');
            let filename = `${baseName}_page_${i}_image_${j + 1}.${format}`;

            // Simple duplicate detection by size
            const sizeKey = `${blob.size}_${canvas.width}_${canvas.height}`;
            const count = imageMap.get(sizeKey) || 0;
            imageMap.set(sizeKey, count + 1);

            if (count > 0) {
              filename = `${baseName}_page_${i}_image_${j + 1}_duplicate_${count}.${format}`;
            }

            zip.file(filename, blob);
            imageIndex++;
          }
        } catch (e) {
          // Skip images that can't be extracted
          console.warn(`Failed to extract image ${imageName} from page ${i}:`, e);
        }
      }

      if (onProgress) {
        onProgress(i, numPages);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Extract images from specific page ranges
   */
  static async extractImagesFromPages(
    file: File,
    pageRanges: string, // "1-3,5,7-9"
    format: ImageFormat = 'png',
    onProgress?: (current: number, total: number) => void
  ): Promise<Blob> {
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
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    // Parse page ranges
    const pageSet = this.parsePageRanges(pageRanges, numPages);
    const pagesToProcess = Array.from(pageSet).sort((a, b) => a - b);

    const zip = new JSZip();

    for (let idx = 0; idx < pagesToProcess.length; idx++) {
      const i = pagesToProcess[idx];
      const page = await pdf.getPage(i + 1); // Convert to 1-based
      const operatorList = await page.getOperatorList();

      const imageOps = operatorList.fnArray.filter((fn: any) =>
        fn === pdfjsLib.OPS.paintImageXObject ||
        fn === pdfjsLib.OPS.paintInlineImageXObject
      );

      for (let j = 0; j < imageOps.length; j++) {
        const opIndex = operatorList.fnArray.indexOf(imageOps[j]);
        const imageName = operatorList.argsArray[opIndex]?.[0];

        if (!imageName) continue;

        try {
          const image = await page.objs.get(imageName);
          if (!image) continue;

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          canvas.width = image.width || 100;
          canvas.height = image.height || 100;

          if (image.data) {
            const imageData = ctx.createImageData(canvas.width, canvas.height);
            const data = image.data;

            if (image.kind === 2 || image.kind === 3) {
              for (let k = 0; k < data.length; k++) {
                imageData.data[k] = data[k];
              }
            } else {
              for (let k = 0; k < canvas.width * canvas.height; k++) {
                const gray = data[k];
                imageData.data[k * 4] = gray;
                imageData.data[k * 4 + 1] = gray;
                imageData.data[k * 4 + 2] = gray;
                imageData.data[k * 4 + 3] = 255;
              }
            }

            ctx.putImageData(imageData, 0, 0);
          }

          const blob = await new Promise<Blob | null>((resolve) => {
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob(resolve, mimeType, 0.95);
          });

          if (blob) {
            const baseName = file.name.replace('.pdf', '');
            const filename = `${baseName}_page_${i + 1}_image_${j + 1}.${format}`;
            zip.file(filename, blob);
          }
        } catch (e) {
          console.warn(`Failed to extract image from page ${i + 1}:`, e);
        }
      }

      if (onProgress) {
        onProgress(idx + 1, pagesToProcess.length);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Parse page ranges string (1-based) to Set of 0-based indices
   */
  private static parsePageRanges(ranges: string, numPages: number): Set<number> {
    const indices = new Set<number>();
    const parts = ranges.split(',').map(p => p.trim());

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.max(1, Math.min(start, end));
          const max = Math.min(numPages, Math.max(start, end));
          for (let i = min; i <= max; i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= numPages) {
          indices.add(pageNum - 1);
        }
      }
    }

    return indices;
  }
}
