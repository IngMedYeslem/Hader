import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageData, setPageData] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
  };

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