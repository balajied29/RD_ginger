import { create } from 'zustand';
import { api } from '../lib/api';

export const usePaymentStore = create((set) => ({
  saving: false,

  /** Returns the full envelope so callers can read warning: "OVERPAYMENT". */
  async createPayment(payload) {
    set({ saving: true });
    try {
      return await api('/api/payments', { method: 'POST', body: payload });
    } finally {
      set({ saving: false });
    }
  },
}));
