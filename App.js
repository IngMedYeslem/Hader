import React, { useState } from 'react';
import ShopLogin from './src/components/ShopLogin';
import ShopDashboard from './src/components/ShopDashboard';

export default function App() {
  const [currentShop, setCurrentShop] = useState(null);

  if (currentShop) {
    return (
      <ShopDashboard 
        shop={currentShop} 
        onLogout={() => setCurrentShop(null)} 
      />
    );
  }

  return <ShopLogin onLogin={setCurrentShop} />;
}