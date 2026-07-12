import { create } from 'zustand';
import { api } from '../lib/api';

export const useDashboardStore = create((set) => ({
  period: 'today',
  data: null,
  loading: false,
  error: '',

  async fetchDashboard(period) {
    set({ period, loading: true, error: '' });
    try {
      const r = await api('/api/dashboard', { query: { period } });
      set({ data: r.data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
}));
