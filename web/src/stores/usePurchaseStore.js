import { create } from 'zustand';
import { api } from '../lib/api';

export const usePurchaseStore = create((set) => ({
  saving: false,

  async createPurchase(payload) {
    set({ saving: true });
    try {
      const r = await api('/api/purchases', { method: 'POST', body: payload });
      return r.data;
    } finally {
      set({ saving: false });
    }
  },
}));
