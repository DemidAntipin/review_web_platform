import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ProjectPreview, ProjectBase } from '../model/types';

export const projectApi = {
    getMyProjects: async () => {
        const { data } = await $api.get<ProjectPreview[]>(ENDPOINTS.PROJECTS.MY);
        return data;
    },
    create: async (data: ProjectBase) => {
        const response = await $api.post(ENDPOINTS.PROJECTS.CREATE, data);
        return response.data;
    },
    update: async (id: number, data: Partial<ProjectBase>) => {
        const response = await $api.patch(ENDPOINTS.PROJECTS.BY_ID(id), data);
        return response.data;
    },
    delete: async (id: number) => {
        const response = await $api.delete(ENDPOINTS.PROJECTS.BY_ID(id));
        return response.data;
    }    
};