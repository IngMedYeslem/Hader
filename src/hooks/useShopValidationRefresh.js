import { useState, useEffect, useCallback } from 'react';

const API_URL = 'http://172.20.10.6:3000/api';

export const useShopValidationRefresh = (shopId, onValidationChange) => {
  const [isApproved, setIsApproved] = useState(false);

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
        
        if (newApprovalStatus && !isApproved && onValidationChange) {
          setIsApproved(newApprovalStatus);
          onValidationChange(newApprovalStatus);
        } else {
          setIsApproved(newApprovalStatus);
        }
      }
    } catch (error) {
      console.log('❌ Erreur vérification statut validation:', error);
    }
  }, [shopId, isApproved, onValidationChange]);

  useEffect(() => {
    const interval = setInterval(checkValidationStatus, 5000);
    checkValidationStatus();
    return () => clearInterval(interval);
  }, [checkValidationStatus]);

  return { isApproved, checkValidationStatus };
};