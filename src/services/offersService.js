import { API_CONFIG } from '../config/api';

const BASE_URL = API_CONFIG.BASE_URL;

export const offersService = {
  getActive: async () => {
    const res = await fetch(`${BASE_URL}/offers`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(o => ({ ...o, id: o._id }));
  },

  recordClick: async (id) => {
    await fetch(`${BASE_URL}/offers/${id}/click`, { method: 'PATCH' });
  },
};
