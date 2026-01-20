import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
    persist(
        (set) => ({
            sidebarCollapsed: false,
            toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
            setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
        }),
        {
            name: 'uplanner-ui-settings',
        }
    )
);

export default useUIStore;
