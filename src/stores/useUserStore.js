import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  loading: true, 
  setUser: (user) => set({ user, loading: false }),
  clearUser: () => set({ user: null, loading: false }),
}));

export default useUserStore;