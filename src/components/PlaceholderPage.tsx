'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Construction } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PlaceholderPage: React.FC = () => {
  const { t, localizedPath } = useLanguage();
  const pathname = usePathname();
  
  // Extract tool name from path for display, e.g. /en/merge-pdf -> merge-pdf
  const toolName = pathname?.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Tool';

  const gridStyle = {
    backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    backgroundPosition: 'center center'
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20" style={gridStyle}>
        {/* Navigation Bar */}
         <div className="bg-transparent px-6 py-4">
           <Link href={localizedPath('/')} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors">
              <ArrowLeft size={20} />
           </Link>
         </div>

         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-100/50">
                <Construction size={48} />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">{toolName}</h1>
            
            <p className="text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
               {t('tool.coming_soon') || "This tool is currently under development. check back soon!"}
            </p>

            <Link 
              href={localizedPath('/')}
              className="inline-flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white text-lg font-bold px-10 py-4 rounded-full shadow-lg shadow-brand-200 hover:shadow-xl hover:scale-105 transition-all"
            >
               Go Back Home
            </Link>
         </div>
    </div>
  );
};
