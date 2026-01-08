'use client';

import Link from 'next/link';
import { Globe, Menu, X, Command, ChevronDown, Settings, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supportedLanguages } from '@/i18n';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export const Header: React.FC = () => {
  const { language, setLanguage, t, localizedPath } = useLanguage();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuContentRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when route changes
  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the trigger AND the dropdown content
      const clickedOutsideMegaArgs = 
        megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node);
      const clickedOutsideMegaContent = 
        !megaMenuContentRef.current || !megaMenuContentRef.current.contains(event.target as Node);

      if (clickedOutsideMegaArgs && clickedOutsideMegaContent) {
        setMegaMenuOpen(false);
      }

      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    setLangMenuOpen(false);
  };

  const currentLangName = supportedLanguages.find(l => l.code === language)?.name || 'English';

  const menuColumns = [
    // Column 1
    [
      {
        dotColor: 'bg-rose-200',
        items: [
          { label: t('menu.merge_pdfs'), to: localizedPath('/merge-pdf') },
          { label: t('menu.split_pdf'), to: localizedPath('/split-pdf') },
          { label: t('menu.remove_pages'), to: localizedPath('/remove-pages') },
          { label: t('menu.organize_pages'), to: localizedPath('/organize-pages') },
          { label: t('menu.split_outline'), to: localizedPath('/split-outline') },
          { label: t('menu.split_size'), to: localizedPath('/split-size') },
          { label: t('menu.remove_blank'), to: localizedPath('/remove-blank') },
          { label: t('menu.n_up'), to: localizedPath('/n-up') },
          { label: t('menu.crop'), to: localizedPath('/crop') },
          { label: t('menu.adjust_size'), to: localizedPath('/adjust-size') },
        ]
      },
      {
        dotColor: 'bg-purple-200',
        items: [
          { label: t('menu.pdf_to_image'), to: localizedPath('/pdf-to-image') },
          { label: t('menu.pdf_to_jpg'), to: localizedPath('/pdf-to-jpg') },
          { label: t('menu.pdf_to_png'), to: localizedPath('/pdf-to-png') },
          { label: t('menu.pdf_to_webp'), to: localizedPath('/pdf-to-webp') },
          { label: t('menu.pdf_to_avif'), to: localizedPath('/pdf-to-avif') },
          { label: t('menu.pdf_to_svg'), to: localizedPath('/pdf-to-svg') },
        ]
      }
    ],
    // Column 2
    [
      {
        dotColor: 'bg-blue-200',
        items: [
          { label: t('menu.extract_pages'), to: localizedPath('/extract-pages') },
          { label: t('menu.extract_images'), to: localizedPath('/extract-images') },
          { label: t('menu.extract_paths'), to: localizedPath('/extract-paths') },
          { label: t('menu.extract_text'), to: localizedPath('/extract-text') },
          { label: t('menu.remove_text'), to: localizedPath('/remove-text') },
          { label: t('menu.remove_image'), to: localizedPath('/remove-image') },
          { label: t('menu.remove_vector'), to: localizedPath('/remove-vector') },
        ]
      },
      {
        dotColor: 'bg-indigo-200',
        items: [
          { label: t('menu.compress_pdf'), to: localizedPath('/compress-pdf') },
          { label: t('menu.pdf_to_html'), to: localizedPath('/pdf-to-html') },
          { label: t('menu.pdf_to_txt'), to: localizedPath('/pdf-to-txt') },
          { label: t('menu.long_image'), to: localizedPath('/long-image') },
          { label: t('menu.images_to_pdf'), to: localizedPath('/images-to-pdf') },
        ]
      }
    ],
    // Column 3
    [
      {
        dotColor: 'bg-emerald-200',
        items: [
          { label: t('menu.unlock'), to: localizedPath('/unlock') },
          { label: t('menu.protect'), to: localizedPath('/protect') },
          { label: t('menu.grayscale'), to: localizedPath('/grayscale') },
        ]
      },
      {
        dotColor: 'bg-orange-200',
        items: [
          { label: t('menu.rotate'), to: localizedPath('/rotate') },
          { label: t('menu.view_metadata'), to: localizedPath('/view-metadata') },
          { label: t('menu.edit_metadata'), to: localizedPath('/edit-metadata') },
        ]
      }
    ]
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm py-2' : 'bg-white/80 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-12">
          
          {/* Left Side: Logo & Main Nav */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href={localizedPath('/')} className="flex items-center space-x-2 mr-10">
              <span className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                <span className="text-brand-500">Easy</span> PDF
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                href={localizedPath('/merge-pdf')} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === localizedPath('/merge-pdf')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {t('nav.merge')}
              </Link>
              <Link 
                href={localizedPath('/split-pdf')} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === localizedPath('/split-pdf')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {t('nav.split')}
              </Link>
              <Link 
                href={localizedPath('/pdf-to-image')} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === localizedPath('/pdf-to-image')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {t('nav.pdf_to_image')}
              </Link>
              <Link 
                href={localizedPath('/images-to-pdf')} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === localizedPath('/images-to-pdf')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {t('nav.images_to_pdf')}
              </Link>
              <Link 
                href={localizedPath('/compress-pdf')} 
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  pathname === localizedPath('/compress-pdf')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                {t('nav.compress')}
              </Link>
              
              {/* Mega Menu Trigger */}
              <div className="relative group" ref={megaMenuRef}>
                <button 
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-full transition-colors ${megaMenuOpen ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:text-brand-600 hover:bg-brand-50'}`}
                >
                  <span>{t('nav.more')}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </nav>
          </div>

          {/* Right Side: Actions */}
          <div className="flex items-center space-x-4">
             {/* Donate Button */}
             <a 
              href="#" 
              className="hidden md:flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors shadow-sm"
             >
               <Heart size={14} className="fill-current" />
               <span>{t('nav.donate')}</span>
             </a>

             {/* Language Dropdown */}
             <div className="relative" ref={langMenuRef}>
               <button 
                 onClick={() => setLangMenuOpen(!langMenuOpen)}
                 className={`text-slate-600 hover:text-slate-900 font-medium text-sm flex items-center space-x-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors ${langMenuOpen ? 'bg-slate-100 text-slate-900' : ''}`}
               >
                 <span>{language === 'en' ? 'EN' : currentLangName}</span>
                 <Globe size={16} />
               </button>

               {/* Language Menu */}
               {langMenuOpen && (
                 <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2 z-50 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${language === lang.code ? 'text-brand-600 font-semibold bg-brand-50' : 'text-slate-700'}`}
                      >
                        {lang.name}
                      </button>
                    ))}
                 </div>
               )}
             </div>

             {/* Settings (Visual only) */}
             <button className="text-slate-600 hover:text-slate-900 hidden sm:block">
               <Settings size={20} />
             </button>

             {/* Mobile Menu Toggle */}
             <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-700 focus:outline-none ml-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        {megaMenuOpen && (
          <div 
             ref={megaMenuContentRef}
             className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {menuColumns.map((col, colIndex) => (
                <div key={colIndex} className="space-y-8">
                  {col.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <ul className="space-y-3">
                        {group.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-3 group/item">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${group.dotColor}`}></div>
                            <Link 
                              href={item.to} 
                              className={`text-[15px] font-medium transition-colors ${
                                item.to === pathname 
                                  ? 'text-brand-600 font-semibold' 
                                  : 'text-slate-700 hover:text-brand-600'
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white absolute top-full left-0 right-0 shadow-lg border-t border-gray-100 h-[calc(100vh-64px)] overflow-y-auto pb-20 z-50">
          <div className="p-4 space-y-1">
             {/* Mobile Language Selector */}
            <div className="mb-6 border-b border-slate-100 pb-4">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Language</p>
              <div className="grid grid-cols-2 gap-2 px-4">
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { handleLanguageSelect(lang.code); setMobileMenuOpen(false); }}
                    className={`text-left text-sm py-1 ${language === lang.code ? 'text-brand-600 font-medium' : 'text-slate-600'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {menuColumns.flat().map((group, i) => (
               <div key={i} className="mb-6">
                 {group.items.map((item, j) => (
                   <Link 
                    key={j}
                    href={item.to}
                    className={`flex items-center space-x-3 py-3 border-b border-slate-50 font-medium ${
                      item.to === pathname 
                        ? 'text-brand-600' 
                        : 'text-slate-700'
                    }`}
                   >
                     <div className={`w-2 h-2 rounded-full ${group.dotColor}`}></div>
                     <span>{item.label}</span>
                   </Link>
                 ))}
               </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
