'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ToolCard } from '@/components/ToolCard';
import { Tool } from '@/types';
import { 
  MessageSquare, 
  BarChart2, 
  Merge, 
  Scissors, 
  Minimize2, 
  Image as ImageIcon 
} from 'lucide-react';

export default function Home() {
  const { t } = useLanguage();

  const tools: Tool[] = [
    {
      id: 'compress-pdf',
      icon: Minimize2,
      titleKey: 'tool.compress.title',
      descKey: 'tool.compress.desc',
      path: '/compress-pdf',
      isNew: true
    },
    {
      id: 'chat-pdf',
      icon: MessageSquare,
      titleKey: 'tool.chat.title',
      descKey: 'tool.chat.desc',
      path: '/chat-pdf',
      isNew: true
    },
    {
      id: 'analyze-pdf',
      icon: BarChart2,
      titleKey: 'tool.analyze.title',
      descKey: 'tool.analyze.desc',
      path: '/analyze-pdf',
      isNew: true
    },
    {
      id: 'merge-pdf',
      icon: Merge,
      titleKey: 'tool.merge.title',
      descKey: 'tool.merge.desc',
      path: '/merge-pdf',
    },
    {
      id: 'split-pdf',
      icon: Scissors,
      titleKey: 'tool.split.title',
      descKey: 'tool.split.desc',
      path: '/split-pdf',
    },
    {
      id: 'img-to-pdf',
      icon: ImageIcon,
      titleKey: 'tool.img2pdf.title',
      descKey: 'tool.img2pdf.desc',
      path: '/images-to-pdf',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Hero Section */}
      <section className="bg-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center rounded-b-[3rem] shadow-sm mb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
          {tools.map((tool) => (
            <div key={tool.id} className="h-64">
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      </section>
      
      {/* SEO/Content Section (Mock) */}
      <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
         <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Why use PDF Master?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Secure</h3>
                  <p className="text-slate-500 text-sm">Files are processed locally or via secure encrypted connections.</p>
               </div>
               <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Fast</h3>
                  <p className="text-slate-500 text-sm">Powered by modern web technologies for instant results.</p>
               </div>
               <div>
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                  </div>
                  <h3 className="font-bold text-lg mb-2">AI Powered</h3>
                  <p className="text-slate-500 text-sm">Leveraging Google Gemini to understand your documents.</p>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
