import React, { useState, useEffect } from 'react';
import { AppProvider } from './context';
import { Navigation } from './components/Navigation';
import { MainPage } from './pages/MainPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import './styles.css';

type Page = 'main' | 'history' | 'settings';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');

  useEffect(() => {
    // Register service worker for PWA functionality in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .catch(error => console.log('SW registration failed'));
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
      <div className="app">
        <div className="app-content">
          {renderPage()}
        </div>
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      </div>
    </AppProvider>
  );
}

export default App;
