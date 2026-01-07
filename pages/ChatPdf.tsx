import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileUploader } from '../components/FileUploader';
import { ChatMessage, LoadingState } from '../types';
import { sendMessageStream } from '../services/gemini';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const ChatPdf: React.FC = () => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    // Convert to Base64 for Gemini
    const reader = new FileReader();
    reader.onloadend = () => {
      setFileBase64(reader.result as string);
      // Add initial greeting
      setMessages([{
        id: 'init',
        role: 'model',
        text: `I'm ready to analyze **${selectedFile.name}**. What would you like to know?`,
        timestamp: Date.now()
      }]);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleClearFile = () => {
    setFile(null);
    setFileBase64(null);
    setMessages([]);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !fileBase64) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoadingState(LoadingState.LOADING);

    try {
      const modelMsgId = (Date.now() + 1).toString();
      
      // Initialize empty model message
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: '',
        timestamp: Date.now()
      }]);

      const stream = sendMessageStream(userMsg.text, fileBase64, file?.type);
      
      let fullResponse = '';
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullResponse } : msg
        ));
      }
      
      setLoadingState(LoadingState.SUCCESS);
    } catch (error) {
      console.error(error);
      setLoadingState(LoadingState.ERROR);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Sorry, I encountered an error analyzing the document. Please ensure your API Key is valid and try again.",
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center justify-center">
            <Sparkles className="mr-2 text-brand-500" /> {t('tool.chat.title')}
          </h1>
          <p className="text-slate-500">{t('tool.chat.desc')}</p>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col border border-slate-100">
          
          {/* Top: File Upload Area */}
          <div className={`p-6 border-b border-slate-100 transition-all duration-500 ${file ? 'bg-slate-50/50' : 'flex-grow flex items-center justify-center'}`}>
            <div className={`w-full ${!file ? 'max-w-lg' : ''}`}>
              <FileUploader 
                onFileSelect={handleFileSelect} 
                selectedFile={file}
                onClear={handleClearFile}
                accept="image/*" // Gemini handles images well. For true PDF support in browser without backend, image is safest for this demo.
                subtitle="Upload an image/screenshot of your PDF page"
              />
            </div>
          </div>

          {/* Chat Area (Visible only if file is uploaded) */}
          {file && (
            <>
              <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-white h-[500px]">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Bot size={48} className="mb-4 opacity-50" />
                    <p>Ask a question about your document.</p>
                  </div>
                )}
                
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      flex max-w-[85%] sm:max-w-[75%] 
                      ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
                    `}>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                        ${msg.role === 'user' ? 'bg-slate-200 ml-3' : 'bg-brand-100 mr-3 text-brand-600'}
                      `}>
                        {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                      </div>
                      
                      <div className={`
                        p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                        ${msg.role === 'user' 
                          ? 'bg-slate-900 text-white rounded-tr-none' 
                          : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none prose prose-sm prose-p:my-1 prose-strong:text-slate-900'
                        }
                      `}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loadingState === LoadingState.LOADING && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                  <div className="flex justify-start">
                     <div className="flex items-center space-x-2 bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none ml-11 shadow-sm">
                        <Loader2 size={16} className="animate-spin text-brand-500" />
                        <span className="text-xs text-slate-500">{t('chat.thinking')}</span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form 
                  onSubmit={handleSendMessage}
                  className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-brand-100 focus-within:border-brand-300 transition-all"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t('chat.input.placeholder')}
                    disabled={loadingState === LoadingState.LOADING}
                    className="flex-grow bg-transparent border-none px-6 py-4 focus:ring-0 text-slate-800 placeholder-slate-400 outline-none disabled:opacity-50"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim() || loadingState === LoadingState.LOADING}
                    className="mr-2 p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-md"
                  >
                    {loadingState === LoadingState.LOADING ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
                {loadingState === LoadingState.ERROR && (
                   <p className="text-center text-xs text-red-500 mt-2 flex items-center justify-center">
                     <AlertCircle size={12} className="mr-1" /> Error connecting to AI. Check API Key.
                   </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};