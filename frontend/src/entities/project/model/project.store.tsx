import { create } from 'zustand';
import { ProjectPreview, Member, ProjectStatus, SortDirection, SortField } from './types';
import { projectApi } from '../api/project.api';
import { persist, createJSONStorage } from 'zustand/middleware';


interface ProjectState {
    projects: ProjectPreview[];
    projectMembers: Record<number, Member[]>;
    isLoading: boolean;
    error: string | null;
    sortField: SortField;
    sortDirection: SortDirection;
    
    setProjects: () => Promise<void>;
    addProject: (project: ProjectPreview) => void;
    updateProject: (id: number, project: Partial<ProjectPreview>) => void;
    deleteProject: (id: number) => Promise<void>;

    setMembers: (projectId: number, members: Member[]) => void;
    addMemberToStore: (member: Member) => void;
    updateMemberInStore: (projectId: number, userId: number, role: number) => void;
    removeMemberFromStore: (projectId: number, userId: number) => void;

    searchQuery: string;
    showHidden: boolean;
    selectedJournals: string[];
    selectedStatuses: ProjectStatus[];

    toggleStatus: (status: ProjectStatus) => void;
    setSearchQuery: (query: string) => void;
    setShowHidden: (show: boolean) => void;
    toggleJournal: (journal: string) => void;
    resetFilters: () => void;

    setSort: (field: SortField, direction: SortDirection) => void;
    toggleSortDirection: () => void;
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set) => ({
            projects: [],
            projectMembers: {},
            isLoading: false,
            error: null,
            searchQuery: '',
            showHidden: false,
            selectedJournals: [],
            selectedStatuses: [],

            sortField: 'created_at',
            sortDirection: 'desc',

            setSort: (sortField, sortDirection) => set({ sortField, sortDirection }),
        
            toggleSortDirection: () => set((state) => ({ 
                sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' 
            })),

            setProjects: async () => {
                set({ isLoading: true, error: null });
                try {
                    const data = await projectApi.getMyProjects();
                    set({ projects: data });
                } catch (e) {
                    set({ error: 'Не удалось загрузить проекты' });
                } finally {
                    set({ isLoading: false });
                }
            },

            addProject: (project) => {
                set((state) => ({
                    projects: [project, ...state.projects]
                }));
            },

            updateProject: (id, updatedFields) => {
                set((state) => ({
                    projects: state.projects.map((p) => 
                        p.id === id ? { ...p, ...updatedFields } : p
                    ),
                }));
            },

            deleteProject: async (id: number) => {
                try {
                    await projectApi.delete(id);
                    set((state) => ({ 
                        projects: state.projects.filter(p => p.id !== id) 
                    }));
                } catch (e) {
                    console.error(e);
                }
            },

            setMembers: (projectId, members) => set((state) => ({
                projectMembers: { ...state.projectMembers, [projectId]: members }
            })),

            addMemberToStore: (member) => set((state) => {
                const currentList = state.projectMembers[member.project_id] || [];
                return {
                    projectMembers: {
                        ...state.projectMembers,
                        [member.project_id]: [
                            ...currentList.filter(m => m.user_id !== member.user_id), 
                            member
                        ]
                    }
                };
            }),

            updateMemberInStore: (projectId, userId, role) => set((state) => ({
                projectMembers: {
                    ...state.projectMembers,
                    [projectId]: (state.projectMembers[projectId] || []).map(m => 
                        m.user_id === userId ? { ...m, role } : m
                    )
                }
            })),

            removeMemberFromStore: (projectId, userId) => set((state) => {
                const currentList = state.projectMembers[projectId] || [];
                return {
                    projectMembers: {
                        ...state.projectMembers,
                        [projectId]: currentList.filter(m => m.user_id !== userId)
                    }
                };
            }),

            setSearchQuery: (searchQuery) => set({ searchQuery }),
            
            setShowHidden: (showHidden) => set({ showHidden }),

            toggleJournal: (journal) => set((state) => ({
                selectedJournals: state.selectedJournals.includes(journal)
                    ? state.selectedJournals.filter(j => j !== journal)
                    : [...state.selectedJournals, journal]
            })),

            toggleStatus: (status) => set((state) => ({
                selectedStatuses: state.selectedStatuses.includes(status)
                    ? state.selectedStatuses.filter(s => s !== status)
                    : [...state.selectedStatuses, status]
            })),

            resetFilters: () => set({
                searchQuery: '',
                showHidden: false,
                selectedJournals: [],
                selectedStatuses: [],
                sortField: 'created_at',
                sortDirection: 'desc'
            }),
        }),
        {
            name: 'project-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                searchQuery: state.searchQuery,
                showHidden: state.showHidden,
                selectedJournals: state.selectedJournals,
                selectedStatuses: state.selectedStatuses,
                sortField: state.sortField,
                sortDirection: state.sortDirection,
            }),
        }
    )
);