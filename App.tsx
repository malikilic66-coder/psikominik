import React, { useState, useEffect } from 'react';
import ComingSoon from './pages/ComingSoon';
import Games from './pages/Games';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'games'>('home');

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/games') {
        setCurrentPage('games');
      } else {
        setCurrentPage('home');
      }
    };

    // İlk yüklemede kontrol et
    handleHashChange();

    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen font-body selection:bg-psiko-teal selection:text-white">
      {currentPage === 'home' && <ComingSoon />}
      {currentPage === 'games' && <Games />}
    </div>
  );
};

export default App;
