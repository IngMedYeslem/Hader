// Exemple d'utilisation du système d'édition pour boutique rejetée

import React, { useState } from 'react';
import { AccountReactivation } from './src/components/AccountReactivation';
import { EditShopInfo } from './src/components/EditShopInfo';

export const ShopRejectedManager = ({ shop }) => {
  const [showEdit, setShowEdit] = useState(false);

  if (showEdit) {
    return (
      <EditShopInfo
        shop={shop}
        onSave={(updatedData) => {
          console.log('Informations mises à jour:', updatedData);
          setShowEdit(false);
        }}
        onCancel={() => setShowEdit(false)}
      />
    );
  }

  return (
    <AccountReactivation
      shopId={shop._id}
      onStatusChange={(action) => {
        if (action === 'edit') {
          setShowEdit(true);
        }
      }}
    />
  );
};

// Utilisation dans le dashboard boutique :
// <ShopRejectedManager shop={currentShop} />