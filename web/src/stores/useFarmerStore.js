import { create } from 'zustand';
import { api } from '../lib/api';

export const useFarmerStore = create((set) => ({
  farmers: [],
  loading: false,
  error: '',

  async fetchFarmers(search = '') {
    set({ loading: true, error: '' });
    try {
      const r = await api('/api/farmers', { query: { search } });
      set({ farmers: r.data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },

  async createFarmer(data) {
    const r = await api('/api/farmers', { method: 'POST', body: data });
    return r.data;
  },
}));
