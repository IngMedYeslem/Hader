// Exemple d'utilisation du système de réactivation

import React from 'react';
import { ShopReactivationFlow } from './src/components/ShopReactivationFlow';

// Dans votre composant principal de boutique
export const ShopDashboard = ({ shopId }) => {
  return (
    <div>
      {/* Affichage du statut de réactivation */}
      <ShopReactivationFlow shopId={shopId} />
      
      {/* Reste de votre interface boutique */}
    </div>
  );
};

// Le système fonctionne ainsi :
// 1. Vérification automatique du statut toutes les 30 secondes
// 2. Bouton pour demander la réactivation si rejeté
// 3. Notification automatique quand approuvé
// 4. Interface qui s'adapte selon le statut