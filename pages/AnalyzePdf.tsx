import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileUploader } from '../components/FileUploader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, FileText, CheckCircle } from 'lucide-react';

// Mock data generator for analytics
const generateMockData = () => {
  const wordsPerPage = [
    { name: 'Page 1', words: 450 },
    { name: 'Page 2', words: 320 },
    { name: 'Page 3', words: 550 },
    { name: 'Page 4', words: 210 },
    { name: 'Page 5', words: 400 },
  ];

  const contentDistribution = [
    { name: 'Text', value: 65 },
    { name: 'Images', value: 25 },
    { name: 'Whitespace', value: 10 },
  ];

  return { wordsPerPage, contentDistribution };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export const AnalyzePdf: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<{wordsPerPage: any[], contentDistribution: any[]} | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setAnalyzing(true);
    setData(null);

    // Simulate analysis delay
    setTimeout(() => {
      setData(generateMockData());
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('tool.analyze.title')}</h1>
          <p className="text-slate-500">{t('tool.analyze.desc')}</p>
        </div>

        {!data && !analyzing && (
           <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-200">
             <FileUploader onFileSelect={handleFileSelect} title="Upload PDF to Analyze" subtitle="We will visualize the content structure" />
           </div>
        )}

        {analyzing && (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl shadow-sm border border-slate-200">
            <Loader2 size={48} className="animate-spin text-brand-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">Processing document...</h3>
            <p className="text-slate-500 mt-2">Extracting metadata and content structure</p>
          </div>
        )}

        {data && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Total Words</p>
                    <p className="text-2xl font-bold text-slate-900">1,930</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Readability Score</p>
                    <p className="text-2xl font-bold text-slate-900">76/100</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Pages</p>
                    <p className="text-2xl font-bold text-slate-900">5</p>
                 </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Bar Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Words per Page</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.wordsPerPage}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} 
                      />
                      <Bar dataKey="words" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Content Distribution</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.contentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.contentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-6 mt-4">
                  {data.contentDistribution.map((entry, index) => (
                    <div key={entry.name} className="flex items-center text-sm text-slate-600">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
             <div className="flex justify-end">
                <button 
                  onClick={() => { setData(null); setFile(null); }}
                  className="text-brand-600 font-medium hover:text-brand-700 transition-colors"
                >
                  Analyze another file
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};