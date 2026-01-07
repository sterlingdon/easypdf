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
  "images-to-pdf": {
    title: "Images to PDF - Convert JPG, PNG to PDF",
    description: "Convert images (JPG, PNG, WebP) to a single PDF authentication. Create PDF from photos easily.",
    keywords: ["images to pdf", "jpg to pdf", "png to pdf", "photo to pdf", "convert image to pdf"],
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
