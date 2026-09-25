import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Workspace store for persisting UI state across sessions.
 * - activeOrgId: currently selected organization identifier.
 * - activeOrgName: display name of the selected organization.
 * - isSidebarCollapsed: UI flag for sidebar state.
 */
export interface WorkspaceState {
  activeOrgId: string | null;
  activeOrgName: string | null;
  isSidebarCollapsed: boolean;
  setActiveOrgId: (id: string) => void;
  setActiveOrgName: (name: string) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgName: null,
      isSidebarCollapsed: false,
      setActiveOrgId: (id: string) => set({ activeOrgId: id }),
      setActiveOrgName: (name: string) => set({ activeOrgName: name }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    { name: 'forge-workspace' }
  )
);
