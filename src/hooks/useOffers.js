import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { offersService } from '../services/offersService';

export const useOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = useCallback(async () => {
    try {
      const data = await offersService.getActive();
      const today = new Date().toISOString().slice(0, 10);
      setOffers((data || []).filter(o => !o.end_date || o.end_date >= today));
    } catch (e) {
      setError(e);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') fetchOffers();
    });
    return () => sub.remove();
  }, [fetchOffers]);

  return { offers, loading, error, refetch: fetchOffers };
};
