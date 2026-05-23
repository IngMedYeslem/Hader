import { useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../config/api';

export const useShopValidationRefresh = (shopId, onValidationChange) => {
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const intervalRef = useRef(null);

  const checkValidationStatus = useCallback(async () => {
    if (!shopId) return;
    try {
      const response = await fetch(`${API_URL}/shops/${shopId}`);
      if (!response.ok) return;

      const data = await response.json();
      const newApprovalStatus = data.isApproved === true;
      const newRejectedStatus = data.isRejected === true;

      setIsApproved(prev => {
        if (prev !== newApprovalStatus && onValidationChange) {
          onValidationChange(newApprovalStatus, newRejectedStatus);
        }
        return newApprovalStatus;
      });
      setIsRejected(newRejectedStatus);

      // إيقاف الـ polling عند الوصول لحالة نهائية
      if (newApprovalStatus || newRejectedStatus) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.log('❌ Erreur vérification statut validation:', error);
    }
  }, [shopId, onValidationChange]);

  useEffect(() => {
    checkValidationStatus();
    intervalRef.current = setInterval(checkValidationStatus, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkValidationStatus]);

  return { isApproved, isRejected, checkValidationStatus };
};
