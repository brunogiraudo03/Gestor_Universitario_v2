import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,       
  userData: null,   
  loading: true, 
  
  // Acciones
  setUser: (user) => set({ user }),
  setUserData: (data) => set({ userData: data }), 
  setLoading: (loading) => set({ loading }),
  
  clearUser: () => set({ user: null, userData: null, loading: false }),
}));

export default useUserStore;