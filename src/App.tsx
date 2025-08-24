import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider } from './context';
import { Navigation } from './components/Navigation';
import { MainPage } from './pages/MainPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles.css';
import { useVersionCheck } from './useVersion';
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

type Page = 'main' | 'history' | 'settings';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.15
};

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const { updateAvailable, reloadNow, remote } = useVersionCheck({ intervalMs: 60_000 });

  useEffect(() => {
    // Register service worker for PWA functionality in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      // Register at site root so SW scope covers the whole app
      const swPath = new URL('/sw.js', window.location.origin).pathname;
      navigator.serviceWorker.register(swPath).catch(() => {});
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <MainPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MainPage />;
    }
  };

  return (
    <AppProvider>
      <Analytics />
      <SpeedInsights />
      <div className="app">
        {updateAvailable && (
          <div className="update-banner" role="status">
            <span>New version{remote?.version ? ` ${remote.version}` : ''} available.</span>
            <button className="update-button" onClick={reloadNow}>Update</button>
          </div>
        )}
        <div className="app-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </AppProvider>
  );
}

export default App;
