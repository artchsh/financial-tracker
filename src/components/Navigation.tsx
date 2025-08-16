import React, { useState } from 'react';

type Page = 'main' | 'history' | 'settings';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${currentPage === 'main' ? 'active' : ''}`}
        onClick={() => onPageChange('main')}
      >
        <div className="nav-icon">📊</div>
        <div className="nav-label">Budget</div>
      </button>
      
      <button
        className={`nav-item ${currentPage === 'history' ? 'active' : ''}`}
        onClick={() => onPageChange('history')}
      >
        <div className="nav-icon">📈</div>
        <div className="nav-label">History</div>
      </button>
      
      <button
        className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
        onClick={() => onPageChange('settings')}
      >
        <div className="nav-icon">⚙️</div>
        <div className="nav-label">Settings</div>
      </button>
    </nav>
  );
}
