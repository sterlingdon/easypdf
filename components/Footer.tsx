import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Command } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4 text-slate-800">
               <Command size={24} />
               <span className="text-lg font-bold">PDF Master</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Making PDF editing easy, fast, and smart for everyone, everywhere.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-500">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-500">Business</a></li>
              <li><a href="#" className="hover:text-brand-500">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-500">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-500">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-500">Status</a></li>
            </ul>
          </div>
          
           <div>
            <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand-500">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-brand-500">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             {/* Social Icons Placeholders */}
             <div className="w-5 h-5 bg-slate-300 rounded-full"></div>
             <div className="w-5 h-5 bg-slate-300 rounded-full"></div>
             <div className="w-5 h-5 bg-slate-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};