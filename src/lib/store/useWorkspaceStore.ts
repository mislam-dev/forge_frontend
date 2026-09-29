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
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  setActiveOrgId: (id: string | null) => void;
  setActiveOrgName: (name: string | null) => void;
  setPersonalWorkspace: () => void;
  setOrganizationWorkspace: (id: string, name: string) => void;
  toggleSidebar: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeOrgId: null,
      activeOrgName: null,
      isSidebarCollapsed: false,
      hasHydrated: false,
      setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      setActiveOrgId: (id: string | null) => set({ activeOrgId: id }),
      setActiveOrgName: (name: string | null) => set({ activeOrgName: name }),
      setPersonalWorkspace: () => set({ activeOrgId: null, activeOrgName: null }),
      setOrganizationWorkspace: (id: string, name: string) => set({ activeOrgId: id, activeOrgName: name }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    }),
    {
      name: 'forge-workspace',
      partialize: (state) => ({
        activeOrgId: state.activeOrgId,
        activeOrgName: state.activeOrgName,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
