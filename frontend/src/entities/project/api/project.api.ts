import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ProjectPreview, ProjectBase } from '../model/types';

export const projectApi = {
    getMyProjects: async () => {
        const { data } = await $api.get<ProjectPreview[]>(ENDPOINTS.PROJECTS.MY);
        return data;
    },
    create: (dto: ProjectBase) => $api.post(ENDPOINTS.PROJECTS.ROOT, dto),
    delete: (id: number) => $api.delete(ENDPOINTS.PROJECTS.BY_ID(id)),
};