import { create } from 'zustand';

export const useNav = create((set) => ({
  // 'dashboard' | 'builder' | 'demo' | 'developer'
  page: 'dashboard',
  setPage: (p) => set({ page: p }),
}));
