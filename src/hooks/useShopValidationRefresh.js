import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';



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

        setIsApproved(prev => {
          if (prev !== newApprovalStatus && onValidationChange) {
            onValidationChange(newApprovalStatus, newRejectedStatus);
          }
          return newApprovalStatus;
        });
        setIsRejected(newRejectedStatus);
      }
    } catch (error) {
      console.log('❌ Erreur vérification statut validation:', error);
    }
  }, [shopId, onValidationChange]); // ✅ إزالة isApproved و isRejected من dependencies

  useEffect(() => {
    checkValidationStatus();
    const interval = setInterval(checkValidationStatus, 10000);
    return () => clearInterval(interval);
  }, [checkValidationStatus]);

  return { isApproved, isRejected, checkValidationStatus };
};