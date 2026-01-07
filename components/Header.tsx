import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Menu, X, Command, ChevronDown, Settings, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supportedLanguages } from '../i18n';

export const Header: React.FC = () => {
  const { language, setLanguage, t, localizedPath } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
          { label: t('menu.merge_pdfs'), to: '#' },
          { label: t('menu.split_pdf'), to: '#' },
          { label: t('menu.remove_pages'), to: '#' },
          { label: t('menu.organize_pages'), to: '#' },
          { label: t('menu.split_outline'), to: '#' },
          { label: t('menu.split_size'), to: '#' },
          { label: t('menu.remove_blank'), to: '#' },
          { label: t('menu.n_up'), to: '#' },
          { label: t('menu.crop'), to: '#' },
          { label: t('menu.adjust_size'), to: '#' },
        ]
      },
      {
        dotColor: 'bg-purple-200',
        items: [
          { label: t('menu.pdf_to_image'), to: '#' },
          { label: t('menu.pdf_to_jpg'), to: '#' },
          { label: t('menu.pdf_to_png'), to: '#' },
          { label: t('menu.pdf_to_webp'), to: '#' },
          { label: t('menu.pdf_to_avif'), to: '#' },
          { label: t('menu.pdf_to_svg'), to: '#' },
        ]
      }
    ],
    // Column 2
    [
      {
        dotColor: 'bg-blue-200',
        items: [
          { label: t('menu.extract_pages'), to: '#' },
          { label: t('menu.extract_images'), to: '#' },
          { label: t('menu.extract_paths'), to: '#' },
          { label: t('menu.extract_text'), to: '#' },
          { label: t('menu.remove_text'), to: '#' },
          { label: t('menu.remove_image'), to: '#' },
          { label: t('menu.remove_vector'), to: '#' },
        ]
      },
      {
        dotColor: 'bg-indigo-200',
        items: [
          { label: t('menu.compress_pdf'), to: '#' },
          { label: t('menu.pdf_to_html'), to: '#' },
          { label: t('menu.pdf_to_txt'), to: '#' },
          { label: t('menu.long_image'), to: '#' },
          { label: t('menu.images_to_pdf'), to: '#' },
        ]
      }
    ],
    // Column 3
    [
      {
        dotColor: 'bg-emerald-200',
        items: [
          { label: t('menu.unlock'), to: '#' },
          { label: t('menu.protect'), to: '#' },
          { label: t('menu.grayscale'), to: '#' },
        ]
      },
      {
        dotColor: 'bg-orange-200',
        items: [
          { label: t('menu.rotate'), to: '#' },
          { label: t('menu.view_metadata'), to: '#' },
          { label: t('menu.edit_metadata'), to: '#' },
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
            <Link to={localizedPath('/')} className="flex items-center space-x-2 mr-10">
              <span className="text-2xl font-bold text-slate-800 tracking-tight flex items-center">
                <span className="text-brand-500">PDF</span>.Master
              </span>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link to={localizedPath('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                {t('nav.merge')}
              </Link>
              <Link to={localizedPath('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                {t('nav.split')}
              </Link>
              <Link to={localizedPath('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                {t('nav.pdf_to_image')}
              </Link>
              <Link to={localizedPath('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                {t('nav.images_to_pdf')}
              </Link>
              <Link to={localizedPath('/')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
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
          <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
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
                              to={item.to} 
                              className="text-[15px] font-medium text-slate-700 hover:text-brand-600 transition-colors"
                              onClick={() => setMegaMenuOpen(false)}
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
                    to={item.to}
                    className="flex items-center space-x-3 py-3 border-b border-slate-50 text-slate-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
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
