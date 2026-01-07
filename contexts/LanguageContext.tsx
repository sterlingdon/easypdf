import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { translations, supportedLanguages } from '../i18n';
import { LanguageContextType } from '../types';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get language from URL param, default to 'en'
  const langParam = params.lang as string;
  
  // Validate language, fallback to 'en' if invalid or missing (though routing handles missing usually)
  const isSupported = supportedLanguages.some(l => l.code === langParam);
  const language = isSupported ? langParam : 'en';

  // Effect to redirect invalid language codes to 'en'
  useEffect(() => {
    if (langParam && !isSupported) {
      const newPath = location.pathname.replace(`/${langParam}`, '/en');
      navigate(newPath, { replace: true });
    }
  }, [langParam, isSupported, location.pathname, navigate]);

  const setLanguage = (code: string) => {
    if (code === language) return;
    
    // Replace the language segment in the current path
    // Assumes path starts with /:lang
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = code;
    } else {
      segments.unshift(code);
    }
    
    const newPath = `/${segments.join('/')}`;
    navigate(newPath);
  };

  const t = (key: string): string => {
    // @ts-ignore - Dynamic key access with string index
    const langData = translations[language] || translations['en'];
    // @ts-ignore
    return langData[key] || key;
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
