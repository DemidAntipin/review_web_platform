import { create } from 'zustand';
import { ProjectPreview } from './types';
import { projectApi } from '../api/project.api';

interface ProjectState {
    projects: ProjectPreview[];
    isLoading: boolean;
    error: string | null;
    
    setProjects: () => Promise<void>;
    addProject: (project: ProjectPreview) => void;
    updateProject: (id: number, project: Partial<ProjectPreview>) => void;
    deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,

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
            console.error("Ошибка при удалении проекта");
        }
    }
}));