export type SeoData = {
  title: string;
  description: string;
  keywords: string[];
};

export type SeoConfig = Record<string, SeoData>;

const en: SeoConfig = {
  default: {
    title: "Easy PDF - All-in-one PDF Tools",
    description: "Merge, Split, Compress, Convert, and Edit PDFs easily. Fast, secure, and completely free online PDF tools.",
    keywords: ["pdf tools", "online pdf editor", "free pdf converter", "easy pdf", "pdf utility"],
  },
  home: {
    title: "Easy PDF - Free Online PDF Tools (Merge, Split, Compress)",
    description: "Free online PDF tools to merge, split, compress, convert, and edit your PDF files. Fast, secure, and easy to use. No registration required.",
    keywords: ["pdf tools", "merge pdf", "split pdf", "compress pdf", "convert pdf", "free pdf tools", "online pdf editor", "pdf converter"],
  },
  "compress-pdf": {
    title: "Compress PDF - Reduce PDF Size Online for Free",
    description: "Reduce PDF file size online while maintaining the best quality. Optimize your PDF documents for easy sharing and storage.",
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf", "optimize pdf", "pdf compressor online", "free pdf compressor", "minimize pdf"],
  },
  "merge-pdf": {
    title: "Merge PDF - Combine PDF Files Online for Free",
    description: "Combine multiple PDF files into one document with our free PDF merger. Drag and drop to reorder pages. Fast and secure.",
    keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger", "pdf binder", "merge pdf files", "combine pdfs"],
  },
  "split-pdf": {
    title: "Split PDF - Extract Pages from PDF Online",
    description: "Split a PDF file into multiple files or extract specific pages. Separate PDF pages instantly online.",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "cut pdf", "break pdf", "pdf splitter"],
  },
  "pdf-to-image": {
    title: "PDF to Image - Convert PDF to JPG, PNG Online",
    description: "Convert PDF pages to high-quality images (JPG, PNG). Secure and free PDF to Image converter.",
    keywords: ["pdf to image", "pdf to jpg", "pdf to png", "convert pdf to picture", "pdf to photo"],
  },
  "extract-images": {
    title: "Extract Images from PDF - Download All Pictures",
    description: "Extract all images from PDF files into a ZIP. Save photos, graphics, and pictures from PDF.",
    keywords: ["extract images from pdf", "save images from pdf", "pdf image extractor", "pdf pictures", "extract photos"],
  },
  "images-to-pdf": {
    title: "Images to PDF - Convert JPG, PNG to PDF",
    description: "Convert images (JPG, PNG, WebP) to a single PDF document. Create PDF from photos easily.",
    keywords: ["images to pdf", "jpg to pdf", "png to pdf", "photo to pdf", "convert image to pdf"],
  },
  // Page Management Tools
  "remove-pages": {
    title: "Remove PDF Pages - Delete Pages from PDF Online",
    description: "Delete unwanted pages from your PDF file. Select and remove specific pages easily.",
    keywords: ["remove pdf pages", "delete pdf pages", "extract pages from pdf", "cut pdf pages", "pdf page remover"],
  },
  "extract-pages": {
    title: "Extract PDF Pages - Save Pages as New PDF",
    description: "Extract specific pages from your PDF and save them as a new PDF document.",
    keywords: ["extract pdf pages", "save pdf pages", "separate pdf pages", "pull pages from pdf", "pdf page extractor"],
  },
  "organize-pages": {
    title: "Organize PDF Pages - Reorder and Merge PDF Pages",
    description: "Reorder and merge pages from multiple PDFs. Drag and drop to organize your PDF documents.",
    keywords: ["organize pdf", "reorder pdf pages", "merge pdf pages", "sort pdf", "arrange pdf"],
  },
  "split-outline": {
    title: "Split PDF by Outline - Split at Bookmarks",
    description: "Split PDF files at bookmark or outline points. Automatically separate chapters and sections.",
    keywords: ["split pdf outline", "pdf bookmark split", "split pdf chapters", "pdf outline split"],
  },
  "split-size": {
    title: "Split PDF by File Size - Create Equal Size Parts",
    description: "Split PDF into multiple files by target file size. Create PDFs of similar size.",
    keywords: ["split pdf size", "divide pdf by size", "pdf size splitter", "limit pdf size"],
  },
  "remove-blank": {
    title: "Remove Blank Pages from PDF - Auto Detect",
    description: "Automatically detect and remove blank pages from PDF files. Clean up your PDF documents.",
    keywords: ["remove blank pages", "delete blank pages", "clean pdf", "blank page remover"],
  },
  "n-up": {
    title: "PDF N-Up - Combine Multiple Pages per Sheet",
    description: "Put multiple PDF pages on a single sheet. Create booklets and save paper.",
    keywords: ["pdf n up", "pdf booklet", "pdf imposition", "multiple pages per sheet"],
  },
  "crop": {
    title: "Crop PDF Pages - Remove Margins",
    description: "Crop PDF margins and remove white space. Adjust PDF page boundaries.",
    keywords: ["crop pdf", "remove pdf margins", "trim pdf", "crop pdf pages"],
  },
  "adjust-size": {
    title: "Resize PDF Pages - Adjust Size and DPI",
    description: "Resize PDF to A4, Letter, or custom size. Adjust PDF resolution and DPI.",
    keywords: ["resize pdf", "pdf size changer", "pdf dpi", "a4 pdf resize"],
  },
  // Image Format Converters
  "pdf-to-jpg": {
    title: "PDF to JPG - Convert PDF to JPG Images Online",
    description: "Convert PDF pages to high-quality JPG images. Free and secure PDF to JPG converter.",
    keywords: ["pdf to jpg", "pdf to jpeg", "convert pdf to jpg", "pdf to image", "pdf to picture"],
  },
  "pdf-to-png": {
    title: "PDF to PNG - Convert PDF to PNG Images Online",
    description: "Convert PDF pages to lossless PNG images with transparency support.",
    keywords: ["pdf to png", "convert pdf to png", "pdf to image", "png converter", "pdf to picture"],
  },
  "pdf-to-webp": {
    title: "PDF to WebP - Convert PDF to WebP Images",
    description: "Convert PDF pages to modern WebP format with excellent compression for web use.",
    keywords: ["pdf to webp", "convert pdf to webp", "webp converter", "pdf to image", "webp format"],
  },
  "pdf-to-avif": {
    title: "PDF to AVIF - Next-Gen Image Format",
    description: "Convert PDF pages to AVIF format with superior compression. 50% smaller than JPEG.",
    keywords: ["pdf to avif", "convert pdf to avif", "avif converter", "next gen image format", "pdf to image"],
  },
  "long-image": {
    title: "PDF to Long Image - Stitch Pages Together",
    description: "Convert all PDF pages into one long continuous image. Perfect for social media sharing.",
    keywords: ["pdf to long image", "pdf stitch", "combine pdf pages to image", "pdf to single image", "long screenshot"],
  },
  // Text Extraction
  "extract-text": {
    title: "Extract Text from PDF - Get All Text Content",
    description: "Extract all text content from PDF files. Copy or download as plain text.",
    keywords: ["extract text from pdf", "pdf to text", "get text from pdf", "pdf text extractor", "copy pdf text"],
  },
  "pdf-to-txt": {
    title: "PDF to TXT - Convert PDF to Plain Text",
    description: "Convert PDF documents to plain text (.txt) files. Fast and free online converter.",
    keywords: ["pdf to txt", "pdf to text", "convert pdf to text", "pdf text converter", "pdf to notepad"],
  },
  // Add generic fallback for other tools if needed
};

const zh: SeoConfig = {
  default: {
    title: "Easy PDF - 一站式 PDF 工具箱",
    description: "轻松合并、拆分、压缩和转换您的 PDF 文件。快速、安全且完全免费的在线 PDF 工具。",
    keywords: ["PDF工具", "在线PDF编辑器", "免费PDF转换器", "Easy PDF", "PDF助手"],
  },
  home: {
    title: "Easy PDF - 免费在线 PDF 工具箱 (合并、拆分、压缩)",
    description: "免费的在线 PDF 工具，轻松合并、拆分、压缩、转换和编辑您的 PDF 文件。快速、安全、易于使用，无需注册。",
    keywords: ["PDF工具", "合并PDF", "拆分PDF", "压缩PDF", "PDF转换", "免费PDF工具", "在线PDF编辑器", "PDF处理"],
  },
  "compress-pdf": {
    title: "压缩 PDF - 免费在线减小 PDF 文件大小",
    description: "在保持最佳质量的同时在线减小 PDF 文件大小。优化您的 PDF 文档以便于共享和存储。",
    keywords: ["压缩PDF", "减小PDF大小", "缩小PDF", "优化PDF", "PDF压缩器", "免费PDF压缩", "PDF瘦身"],
  },
  "merge-pdf": {
    title: "合并 PDF - 免费在线组合多个 PDF 文件",
    description: "使用我们的免费 PDF 合并工具将多个 PDF 文件组合成一个文档。拖放以重新排序页面。快速且安全。",
    keywords: ["合并PDF", "组合PDF", "连接PDF", "PDF合并器", "PDF拼接", "合并PDF文件"],
  },
  "split-pdf": {
    title: "拆分 PDF - 在线提取 PDF 页面",
    description: "将 PDF 文件拆分为多个文件或提取特定页面。即时在线分离 PDF 页面。",
    keywords: ["拆分PDF", "提取PDF页面", "分离PDF", "切割PDF", "PDF拆分器"],
  },
  "pdf-to-image": {
    title: "PDF 转图片 - 在线将 PDF bucket为 JPG, PNG",
    description: "将 PDF 页面转换为高质量图片 (JPG, PNG)。安全且免费的 PDF 转图片转换器。",
    keywords: ["PDF转图片", "PDF转JPG", "PDF转PNG", "PDF转照片", "PDF转换"],
  },
  "images-to-pdf": {
    title: "图片转 PDF - 将 JPG, PNG 转换为 PDF",
    description: "将图片 (JPG, PNG, WebP) 转换为单个 PDF 文档。轻松从照片创建 PDF。",
    keywords: ["图片转PDF", "JPG转PDF", "PNG转PDF", "照片转PDF", "图片合成PDF"],
  },
  // Page Management Tools
  "remove-pages": {
    title: "移除 PDF 页面 - 在线删除 PDF 页面",
    description: "从您的 PDF 文件中删除不需要的页面。轻松选择并删除特定页面。",
    keywords: ["移除PDF页面", "删除PDF页面", "提取PDF页面", "切割PDF页面", "PDF页面删除器"],
  },
  "extract-pages": {
    title: "提取 PDF 页面 - 保存页面为新 PDF",
    description: "从您的 PDF 中提取特定页面并将其保存为新的 PDF 文档。",
    keywords: ["提取PDF页面", "保存PDF页面", "分离PDF页面", "提取页面", "PDF页面提取器"],
  },
  // Image Format Converters
  "pdf-to-jpg": {
    title: "PDF 转 JPG - 在线将 PDF 转换为 JPG 图片",
    description: "将 PDF 页面转换为高质量的 JPG 图片。免费且安全的 PDF 转 JPG 转换器。",
    keywords: ["PDF转JPG", "PDF转JPEG", "PDF转图片", "JPG转换器", "PDF转换"],
  },
  "pdf-to-png": {
    title: "PDF 转 PNG - 在线将 PDF 转换为 PNG 图片",
    description: "将 PDF 页面转换为无损 PNG 图片，支持透明度。",
    keywords: ["PDF转PNG", "PDF转图片", "PNG转换器", "PDF转换", "透明PNG"],
  },
  "pdf-to-webp": {
    title: "PDF 转 WebP - 将 PDF 转换为 WebP 图片",
    description: "将 PDF 页面转换为现代 WebP 格式，具有出色的压缩效果，适合网络使用。",
    keywords: ["PDF转WebP", "WebP转换器", "PDF转图片", "WebP格式", "现代图片格式"],
  },
  "pdf-to-avif": {
    title: "PDF 转 AVIF - 下一代图片格式",
    description: "将 PDF 页面转换为具有卓越压缩效果的 AVIF 格式。比 JPEG 小 50%。",
    keywords: ["PDF转AVIF", "AVIF转换器", "下一代图片格式", "PDF转图片", "AVIF格式"],
  },
  "long-image": {
    title: "PDF 转长图 - 将页面拼接在一起",
    description: "将所有 PDF 页面转换为一张连续的长图。非常适合社交媒体分享。",
    keywords: ["PDF转长图", "PDF拼接", "PDF合并为图片", "PDF转单张图片", "长截图"],
  },
  // Text Extraction
  "extract-text": {
    title: "提取 PDF 文本 - 获取所有文本内容",
    description: "从 PDF 文件中提取所有文本内容。复制或下载为纯文本。",
    keywords: ["提取PDF文本", "PDF转文本", "获取PDF文本", "PDF文本提取器", "复制PDF文本"],
  },
  "pdf-to-txt": {
    title: "PDF 转 TXT - 将 PDF 转换为纯文本",
    description: "将 PDF 文档转换为纯文本 (.txt) 文件。快速且免费的在线转换器。",
    keywords: ["PDF转TXT", "PDF转文本", "PDF文本转换器", "PDF转记事本", "文本提取"],
  },
};

export const SEO_CONFIG: Record<string, SeoConfig> = {
  en,
  zh, 
  // Map other languages to en for now, or zh as appropriate
  'zh-tw': zh,
  'zh-yue': zh,
};

export function getSeoMetadata(lang: string, page: string): SeoData {
  const langConfig = SEO_CONFIG[lang] || SEO_CONFIG['en'];
  return langConfig[page] || langConfig['default'];
}
