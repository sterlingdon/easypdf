import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Tool } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { t, localizedPath } = useLanguage();

  return (
    <Link 
      to={localizedPath(tool.path)}
      className="group bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-transparent hover:border-slate-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      {tool.isNew && (
        <span className="absolute top-4 right-4 bg-brand-50 text-brand-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          New
        </span>
      )}
      
      <div className={`mb-5 p-3 rounded-xl w-14 h-14 flex items-center justify-center transition-colors duration-300 ${
         tool.id === 'chat-pdf' ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100' : 
         tool.id === 'analyze-pdf' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' :
         'bg-slate-50 text-slate-700 group-hover:bg-slate-100'
      }`}>
        <tool.icon size={28} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center">
        {t(tool.titleKey)}
        {tool.id === 'chat-pdf' && <Sparkles size={14} className="ml-2 text-amber-400 fill-amber-400" />}
      </h3>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-grow">
        {t(tool.descKey)}
      </p>

      <div className="flex items-center text-brand-600 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Try now <ArrowRight size={16} className="ml-1" />
      </div>
    </Link>
  );
};
