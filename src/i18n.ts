import { en } from './locales/en';
import { zh } from './locales/zh';

// Map other languages to English for now as fallback
export const translations = {
  en: en,
  zh: zh, // Simplified Chinese
  ar: en, // Arabic
  de: en, // German
  es: en, // Spanish
  fr: en, // French
  hi: en, // Hindi
  id: en, // Indonesian
  it: en, // Italian
  ja: en, // Japanese
  ko: en, // Korean
  pt: en, // Portuguese
  ru: en, // Russian
  th: en, // Thai
  tr: en, // Turkish
  vi: en, // Vietnamese
  'zh-yue': zh, // Cantonese (fallback to Simplified for now)
  'zh-tw': zh, // Traditional Chinese (fallback to Simplified for now)
};

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'عربي' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'id', name: 'Indonesia' },
  { code: 'it', name: 'Italiano' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'th', name: 'แบบไทย' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh', name: '简体中文' },
  { code: 'zh-yue', name: '粵語' },
  { code: 'zh-tw', name: '繁体中文' },
];