import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { ChatPdf } from './pages/ChatPdf';
import { AnalyzePdf } from './pages/AnalyzePdf';
import { CompressPdf } from './pages/CompressPdf';
import { LanguageProvider } from './contexts/LanguageContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Layout component to wrap content with LanguageProvider and standard page layout
const MainLayout: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Redirect root to default language (English) */}
        <Route path="/" element={<Navigate to="/en" replace />} />
        
        {/* Language Routes */}
        <Route path="/:lang" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="chat-pdf" element={<ChatPdf />} />
          <Route path="analyze-pdf" element={<AnalyzePdf />} />
          <Route path="compress-pdf" element={<CompressPdf />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;