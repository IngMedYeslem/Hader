import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://192.168.0.132:3000/api';

export const useShopValidationRefresh = (shopId, onValidationChange) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);

  const checkValidationStatus = useCallback(async () => {
    if (!shopId) return;
    
    try {
      const usersResponse = await fetch(`${API_URL}/users`);
      if (usersResponse.ok) {
        const users = await usersResponse.json();
        const linkedUser = users.find(user => 
          user.linkedShop && user.linkedShop.id === shopId
        );
        
        const newApprovalStatus = linkedUser ? linkedUser.isApproved === true : false;
        const newRejectedStatus = linkedUser ? linkedUser.isRejected === true : false;
        
        console.log('🔍 Vérification statut pour boutique:', shopId, {
          linkedUser: linkedUser ? linkedUser.username : 'aucun',
          isApproved: linkedUser?.isApproved,
          isRejected: linkedUser?.isRejected,
          newApprovalStatus,
          newRejectedStatus
        });
        
        const statusChanged = (newApprovalStatus !== isApproved) || (newRejectedStatus !== isRejected);
        
        setIsApproved(newApprovalStatus);
        setIsRejected(newRejectedStatus);
        
        if (statusChanged && onValidationChange) {
          console.log('🔄 Changement détecté:', { newApprovalStatus, newRejectedStatus });
          onValidationChange(newApprovalStatus, newRejectedStatus);
        }
      }
    } catch (error) {
      console.log('❌ Erreur vérification statut validation:', error);
    }
  }, [shopId, isApproved, isRejected, onValidationChange]);

  useEffect(() => {
    checkValidationStatus();
    const interval = setInterval(checkValidationStatus, 10000);
    return () => clearInterval(interval);
  }, [checkValidationStatus]);

  return { isApproved, isRejected, checkValidationStatus };
};