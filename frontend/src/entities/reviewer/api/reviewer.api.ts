import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Reviewer } from '../model/types';

export const reviewerApi = {
    getByProject: (projectId: number) => 
        $api.get<{ reviewers: Reviewer[] }>(ENDPOINTS.REVIEWERS.LIST(projectId)),

    add: (projectId: number, data: { name: string; general_comment: string }) => 
        $api.post<Reviewer>(ENDPOINTS.REVIEWERS.ADD(projectId), data),
    update: (projectId: number, reviewerId: number, data: { name: string; general_comment: string }) => 
        $api.patch<Reviewer>(ENDPOINTS.REVIEWERS.BY_ID(projectId, reviewerId), data),
    delete: (projectId: number, reviewerId: number) => 
        $api.delete(ENDPOINTS.REVIEWERS.BY_ID(projectId, reviewerId)),
};