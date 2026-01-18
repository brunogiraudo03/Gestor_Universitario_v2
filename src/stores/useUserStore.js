import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,       
  userData: null,
  materias: [],   
  loading: true, 
  
  // Acciones
  setUser: (user) => set({ user }),
  setUserData: (data) => set({ userData: data }), 
  setMaterias: (materias) => set({ materias }),
  setLoading: (loading) => set({ loading }),
  
  clearUser: () => set({ user: null, userData: null, materias: [], loading: false }),
}));

export default useUserStore;