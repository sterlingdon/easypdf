import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImagesToPdfOptions {
  pageSize: 'A4' | 'fit';
  orientation: 'portrait' | 'landscape';
  margin: 'none' | 'small' | 'big';
}

export class ImagesToPdf {
  static async convert(files: File[], options: ImagesToPdfOptions): Promise<Blob> {
    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let pdfImage;
      
      try {
          if (file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
            pdfImage = await pdfDoc.embedJpg(arrayBuffer);
          } else if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
            pdfImage = await pdfDoc.embedPng(arrayBuffer);
          } else {
             // Fallback: try embedPng for others or skip? 
             // Ideally we convert to png/jpg first if not supported, but pdf-lib supports these.
             // For strictness, skip unsupported.
             continue;
          }
      } catch (e) {
          console.warn(`Failed to embed image ${file.name}`, e);
          continue;
      }

      // Determine Page Size
      let pageWidth, pageHeight;

      if (options.pageSize === 'A4') {
          const dims = PageSizes.A4; // [595.28, 841.89]
          // Swap for landscape
          if (options.orientation === 'landscape') {
              pageWidth = dims[1];
              pageHeight = dims[0];
          } else {
              pageWidth = dims[0];
              pageHeight = dims[1];
          }
      } else {
          // Fit to image
          pageWidth = pdfImage.width;
          pageHeight = pdfImage.height;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      // Calculate Margins
      let margin = 0;
      if (options.margin === 'small') margin = 20;
      if (options.margin === 'big') margin = 50;

      // Draw Image logic
      // If A4, we need to scale image to fit within margins
      // If fit, just draw 1:1 (margins usually ignored or added to canvas size)
      
      const drawWidth = pageWidth - (margin * 2);
      const drawHeight = pageHeight - (margin * 2);

      if (options.pageSize === 'A4') {
          // Scale to fit
          const imgDims = pdfImage.scaleToFit(drawWidth, drawHeight);
          
          // Center content
          const x = margin + (drawWidth - imgDims.width) / 2;
          const y = margin + (drawHeight - imgDims.height) / 2;

          page.drawImage(pdfImage, {
              x,
              y,
              width: imgDims.width,
              height: imgDims.height,
          });
      } else {
          // Fit mode: usually implies "page size equals image size"
          // If margins requested, we expand page?
          // For simplicity 'fit' ignores margins or assumes page matches image exactly.
          page.drawImage(pdfImage, {
              x: 0,
              y: 0,
              width: pageWidth,
              height: pageHeight,
          });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  }
}
