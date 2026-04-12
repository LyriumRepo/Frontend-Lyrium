import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    activeModal: string | null;
    activeDropdown: 'search' | 'megaMenu' | null;
    toggleSidebar: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    openModal: (id: string) => void;
    closeModal: () => void;
    setActiveDropdown: (dropdown: 'search' | 'megaMenu' | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: false,
    activeModal: null,
    activeDropdown: null,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    openSidebar: () => set({ sidebarOpen: true }),
    closeSidebar: () => set({ sidebarOpen: false }),
    openModal: (id) => set({ activeModal: id }),
    closeModal: () => set({ activeModal: null }),
    setActiveDropdown: (dropdown) => set({ activeDropdown: dropdown }),
}));
