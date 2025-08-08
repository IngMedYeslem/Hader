import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
    
    // Sauvegarder l'état de navigation
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currentPage', page);
      if (data) {
        localStorage.setItem('pageData', JSON.stringify(data));
      }
    }
  };

  // Restaurer l'état de navigation au démarrage
  React.useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const savedPage = localStorage.getItem('currentPage');
      const savedData = localStorage.getItem('pageData');
      
      if (savedPage && savedPage !== 'dashboard') {
        setCurrentPage(savedPage);
        if (savedData) {
          try {
            setPageData(JSON.parse(savedData));
          } catch (error) {
            console.log('Erreur parsing pageData:', error);
          }
        }
      }
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ 
      currentPage, 
      pageData, 
      navigateTo,
      setCurrentPage,
      setPageData 
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};