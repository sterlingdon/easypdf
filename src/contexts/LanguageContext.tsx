'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { translations, supportedLanguages } from '@/i18n';
import { LanguageContextType } from '@/types';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract language from pathname: /en/some-path -> en
  const segments = pathname ? pathname.split('/').filter(Boolean) : [];
  const currentLangCode = segments.length > 0 ? segments[0] : 'en';
  
  // Validate language
  const isSupported = supportedLanguages.some(l => l.code === currentLangCode);
  const language = isSupported ? currentLangCode : 'en';

  useEffect(() => {
    // If language is not supported and we are not at root (root is handled by middleware usually, but here we enforce client side redirect if needed)
    // Actually, if we are at /, usually we redirect to /en. 
    // If pathname is just /, extraction gives [], language defaults to en. 
    // We should redirect to /en if we are at root.
    if (pathname === '/') {
        router.replace('/en');
    }
  }, [pathname, router]);

  const setLanguage = (code: string) => {
    if (code === language) return;
    
    // Replace the language segment in translation
    const newSegments = [...segments];
    if (newSegments.length > 0 && supportedLanguages.some(l => l.code === newSegments[0])) {
      newSegments[0] = code;
    } else {
      newSegments.unshift(code);
    }
    
    const newPath = `/${newSegments.join('/')}`;
    router.push(newPath);
  };

  const t = (key: string, options?: string | Record<string, any>): string => {
    // @ts-ignore - Dynamic key access with string index
    const langData = translations[language] || translations['en'];
    // @ts-ignore
    let text = langData[key];

    if (!text) {
        if (typeof options === 'string') return options;
        return key;
    }

    if (typeof options === 'object' && options !== null) {
         Object.entries(options).forEach(([k, v]) => {
            text = text.replace(new RegExp(`{{\\s*${k}\\s*}}`, 'g'), String(v));
         });
    }

    return text;
  };

  const localizedPath = (path: string): string => {
    // Ensure path doesn't start with / to avoid double slashes when joining
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // If path is empty (root), just return /lang
    if (!cleanPath) return `/${language}`;
    return `/${language}/${cleanPath}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localizedPath }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
